var networkClient = require('net'),
    domainResolver = require('dns'),
    LINE_BREAK = '\r\n';

// A mapping for common SMTP response codes and their meanings.
// This constant replaces the previous comment block for better code integration and lookup.
const SMTP_CODE_MESSAGES = {
  '211': 'System status, or system help reply',
  '214': 'Help message',
  '220': 'Service ready',
  '221': 'Service closing transmission channel',
  '235': 'User authentication successful',
  '250': 'Requested mail action completed',
  '251': 'User not local; will forward to',
  '334': 'Server challenge for authentication (awaiting client input)',
  '354': 'Start mail input; end with <CRLF>.<CRLF>',
  '421': 'Service not available, closing transmission channel',
  '450': 'Requested mail action not taken: mailbox unavailable (e.g., mailbox busy)',
  '451': 'Requested action aborted: local error in processing',
  '452': 'Requested action not taken: insufficient system storage',
  '500': 'Syntax error, command unrecognized (may also include command line too long)',
  '501': 'Syntax error in parameters or arguments',
  '502': 'Command not implemented',
  '503': 'Bad sequence of commands',
  '504': 'Command parameter not implemented',
  '535': 'User authentication failed',
  '550': 'Requested action not taken: mailbox unavailable (e.g., mailbox not found, or not accessible)',
  '551': 'User not local; please try',
  '552': 'Requested mail action aborted: exceeded storage allocation',
  '553': 'Requested action not taken: mailbox name not allowed',
  '554': 'Transaction failed'
};

var exportingModule = {};
exportingModule.moduleOut = function(configurationSettings) {
  var logFacility = configurationSettings && configurationSettings.loggingUnit || {
    dbg: console.debug || console.log, // Use console.debug if available, else console.log for debug messages
    inf: console.info,
    wrn: console.warn,
    err: console.error
  };

  /**
   * Extracts the domain name from a given email address string.
   * Includes a guard clause for invalid input.
   * @param {string} emailAddressStr - The complete email address (e.g., "user@example.com").
   * @returns {string|null} The domain part of the email, or null if parsing fails.
   */
  function extractDomain(emailAddressStr) {
    if (!emailAddressStr || typeof emailAddressStr !== 'string' || emailAddressStr.indexOf('@') === -1) {
      logFacility.wrn('Invalid email address string provided for domain extraction:', emailAddressStr);
      return null;
    }
    var domainMatch = /\b[^@\s]+@([a-zA-Z0-9.-]+)\b/.exec(emailAddressStr);
    return domainMatch && domainMatch[1] ? domainMatch[1].toLowerCase() : null; // Ensure domain is lowercase
  }

  /**
   * Groups a collection of recipient email addresses by their respective host domains.
   * @param {Array<string>} recipientAddresses - An array of email address strings.
   * @returns {Object<string, Array<string>>} An object mapping host domains to arrays of recipient emails.
   */
  function collateRecipientsByHost(recipientAddresses) {
    var domainGroupings = {};
    if (!Array.isArray(recipientAddresses) || recipientAddresses.length === 0) {
      logFacility.dbg('No recipient addresses provided for grouping.');
      return domainGroupings;
    }
    for (let currentIdx = 0; currentIdx < recipientAddresses.length; currentIdx++) {
      let currentRecipient = recipientAddresses[currentIdx];
      let recipientHost = extractDomain(currentRecipient);
      if (recipientHost) {
        domainGroupings[recipientHost] = domainGroupings[recipientHost] || [];
        domainGroupings[recipientHost].push(currentRecipient);
      } else {
        logFacility.wrn('Skipping invalid recipient address during grouping:', currentRecipient);
      }
    }
    return domainGroupings;
  }

  /**
   * Attempts to establish a TCP connection to an SMTP server by resolving MX records for the target domain.
   * It iterates through MX records, sorted by priority, until a successful connection is made or all fail.
   * @param {string} targetDomain - The domain for which to resolve MX records and connect.
   * @param {Function} completionCallback - Callback function (error, socket) to be invoked upon connection or failure.
   */
  function establishMxConnection(targetDomain, completionCallback) {
    domainResolver.resolveMx(targetDomain, function(lookupError, mxRecords) {
      if (lookupError) {
        logFacility.err('MX lookup error for domain "' + targetDomain + '":', lookupError.message);
        return completionCallback(new Error('Failed to resolve MX records for ' + targetDomain + ': ' + lookupError.message));
      }

      if (!Array.isArray(mxRecords) || mxRecords.length === 0) {
        return completionCallback(new Error('No valid MX records found for domain: ' + targetDomain));
      }

      // Sort MX records by priority (lower number indicates higher preference)
      mxRecords.sort((a, b) => a.priority - b.priority);
      logFacility.dbg('MX records resolved for ' + targetDomain + ':', JSON.stringify(mxRecords));

      function attemptConnection(recordIndex) {
        if (recordIndex >= mxRecords.length) {
          return completionCallback(new Error('Could not establish connection to any SMTP server for ' + targetDomain + ' after ' + mxRecords.length + ' attempts.'));
        }

        const currentMxRecord = mxRecords[recordIndex];
        logFacility.inf('Attempting connection to MX server:', currentMxRecord.exchange, 'on port 25 (priority:', currentMxRecord.priority + ')');

        const clientSocket = networkClient.createConnection(25, currentMxRecord.exchange);
        clientSocket.setTimeout(15000); // Set a 15-second timeout for connection establishment

        const connectionErrorHandler = function(socketError) {
          logFacility.err('Connection error to ' + currentMxRecord.exchange + ':', socketError.message);
          clientSocket.destroy(); // Ensure socket is closed to prevent resource leaks
          attemptConnection(recordIndex + 1); // Recursively try the next MX record
        };

        clientSocket.once('error', connectionErrorHandler); // Listen for connection errors once

        clientSocket.once('connect', function() {
          logFacility.inf('Successfully connected to MX server:', currentMxRecord.exchange);
          clientSocket.removeListener('error', connectionErrorHandler); // Remove the connection error handler
          clientSocket.off('timeout'); // Remove timeout listener as connection is established
          completionCallback(null, clientSocket);
        });

        clientSocket.once('timeout', function() {
            logFacility.wrn('Connection timeout to MX server:', currentMxRecord.exchange);
            clientSocket.destroy(new Error('Connection to ' + currentMxRecord.exchange + ' timed out after 15 seconds.')); // Destroy with an explicit error
        });
      }

      attemptConnection(0); // Initiate connection attempts starting with the highest priority MX record
    });
  }

  /**
   * Transmits an email message to a specific domain's SMTP server, managing the SMTP conversation state.
   * @param {string} destinationDomain - The target domain for this email transaction.
   * @param {string} originatingHost - The hostname of the sending server (used in EHLO/HELO command).
   * @param {string} senderEmailAddress - The 'MAIL FROM' address.
   * @param {Array<string>} recipientEmailAddresses - An array of 'RCPT TO' addresses specific to this domain.
   * @param {string} mailMessageContent - The complete message content, including headers and body.
   * @param {Function} [transactionCompletionCallback] - Optional callback function (err, message) for transaction outcome.
   */
  function transmitMailViaSmtp(destinationDomain, originatingHost, senderEmailAddress, recipientEmailAddresses, mailMessageContent, transactionCompletionCallback) {
    const operationCallback = typeof transactionCompletionCallback === 'function' ? transactionCompletionCallback : () => {};

    establishMxConnection(destinationDomain, function(connectionError, activeSocket) {
      if (connectionError) {
        logFacility.err('Failed to establish SMTP connection for ' + destinationDomain + ':', connectionError.stack);
        return operationCallback(connectionError);
      }

      let accumulatedSocketData = '';
      let currentTransactionStage = 0;
      const smtpCommandQueue = []; // Holds the sequence of SMTP commands to send
      let fullResponseMessageBuffer = ''; // Accumulates multi-line responses from the server

      // Helper function to send commands to the SMTP server socket
      function writeToSmtpSocket(commandString) {
        logFacility.dbg('SENT to ' + destinationDomain + '> ' + commandString.split(LINE_BREAK)[0] + (commandString.indexOf(LINE_BREAK) > -1 ? ' ...' : '')); // Log only first line if multi-line
        activeSocket.write(commandString + LINE_BREAK);
      }

      activeSocket.setEncoding('utf8');

      activeSocket.on('data', function(dataChunk) {
        accumulatedSocketData += dataChunk;
        let lineSegments = accumulatedSocketData.split(LINE_BREAK);
        // Process all complete lines, retaining the potentially incomplete last segment
        for (let segmentIdx = 0; segmentIdx < lineSegments.length - 1; segmentIdx++) {
          processIncomingSmtpLine(lineSegments[segmentIdx]);
        }
        accumulatedSocketData = lineSegments[lineSegments.length - 1]; // Store the last segment (might be incomplete)
      });

      activeSocket.on('error', function(socketErr) {
        logFacility.err('SMTP socket error for ' + destinationDomain + ':', socketErr.message);
        activeSocket.destroy(); // Ensure socket is closed on error
        operationCallback(socketErr);
      });

      activeSocket.on('close', function() {
          logFacility.dbg('SMTP socket closed for ' + destinationDomain);
      });

      // Populate the SMTP command queue for this transaction
      smtpCommandQueue.push('MAIL FROM:<' + senderEmailAddress + '>');
      for (let recipientIdx = 0; recipientIdx < recipientEmailAddresses.length; recipientIdx++) {
        smtpCommandQueue.push('RCPT TO:<' + recipientEmailAddresses[recipientIdx] + '>');
      }
      smtpCommandQueue.push('DATA');
      smtpCommandQueue.push(mailMessageContent); // The actual message body and headers
      smtpCommandQueue.push('.'); // End-of-data marker for the DATA command
      smtpCommandQueue.push('QUIT');

      /**
       * Processes a single incoming line from the SMTP server, accumulating multi-line responses
       * and triggering the response handler when a complete response is received.
       * @param {string} singleIncomingLine - A single line of text received from the SMTP server.
       */
      function processIncomingSmtpLine(singleIncomingLine) {
        logFacility.dbg('RECEIVED from ' + destinationDomain + '> ' + singleIncomingLine);

        fullResponseMessageBuffer += (singleIncomingLine + LINE_BREAK);

        // A space at the 4th character (index 3) indicates the end of a multi-line response
        if (singleIncomingLine.length >= 4 && singleIncomingLine[3] === ' ') {
          const responseCode = Number.parseInt(singleIncomingLine.substring(0, 3), 10);
          handleSmtpResponse(responseCode, fullResponseMessageBuffer.trim());
          fullResponseMessageBuffer = ''; // Reset buffer for the next response
        }
      }

      /**
       * Handles an SMTP response code and message, advancing the transaction state machine.
       * @param {number} statusCode - The numeric SMTP status code received.
       * @param {string} serverMessage - The complete message text from the SMTP server.
       */
      function handleSmtpResponse(statusCode, serverMessage) {
        switch (statusCode) {
          case SMTP_CODE_MESSAGES['220']: // Service Ready
            let initialCommand = '';
            if (/\besmtp\b/i.test(serverMessage)) {
              initialCommand = 'EHLO'; // Extended HELO for ESMTP servers
              // Future enhancement: Parse ESMTP capabilities like AUTH methods here
            } else {
              initialCommand = 'HELO'; // Standard HELO
            }
            writeToSmtpSocket(initialCommand + ' ' + originatingHost);
            break;

          case SMTP_CODE_MESSAGES['221']: // Service Closing
          case SMTP_CODE_MESSAGES['235']: // Authentication Successful
          case SMTP_CODE_MESSAGES['250']: // Requested action completed
          case SMTP_CODE_MESSAGES['251']: // User not local, will forward
            // Check if this is the final step (after QUIT command has been sent and acknowledged)
            if (currentTransactionStage >= smtpCommandQueue.length - 1 && smtpCommandQueue[currentTransactionStage] === 'QUIT') {
              logFacility.inf('SMTP transaction successful for ' + destinationDomain + '. Final status:', statusCode, serverMessage);
              activeSocket.end(); // Gracefully close the socket
              return operationCallback(null, serverMessage); // Report success
            }
            // If not the final step, send the next command from the queue
            if (currentTransactionStage < smtpCommandQueue.length) {
                const nextCommandToSend = smtpCommandQueue[currentTransactionStage];
                writeToSmtpSocket(nextCommandToSend);
                currentTransactionStage++;
            } else {
                logFacility.wrn('Unexpected 2xx success code received after all commands were expected to be sent:', statusCode, serverMessage);
                activeSocket.end(); // Close socket to prevent hanging
            }
            break;

          case SMTP_CODE_MESSAGES['354']: // Start mail input (server ready for DATA content)
            logFacility.inf('SMTP server ready for mail data for ' + destinationDomain + '. Sending content...');
            // The command queue is designed such that mailMessageContent is at currentTransactionStage
            // and '.' is at currentTransactionStage + 1
            writeToSmtpSocket(smtpCommandQueue[currentTransactionStage]); // Send the full mail content
            currentTransactionStage++;
            writeToSmtpSocket(smtpCommandQueue[currentTransactionStage]); // Send the end-of-data marker '.'
            currentTransactionStage++;
            break;

          case SMTP_CODE_MESSAGES['334']: // Server challenge for authentication (awaiting client input)
            // This case is currently a placeholder as AUTH LOGIN is not actively implemented.
            // If authentication steps were populated (e.g., username/password base64 encoded),
            // we would send authCredentials[authAttemptIndex++] here.
            logFacility.wrn('Received authentication challenge (334), but AUTH LOGIN is not fully implemented or active.');
            activeSocket.destroy(new Error('SMTP authentication required but not supported/configured.'));
            operationCallback(new Error('SMTP authentication required (334) but no credentials provided for ' + destinationDomain + '.'));
            break;

          default:
            // Handle error codes (4xx and 5xx series)
            if (statusCode >= 400) {
              logFacility.err('SMTP server responded with error code ' + statusCode + ' for ' + destinationDomain + ':', serverMessage);
              activeSocket.destroy(); // Close the socket immediately on error
              operationCallback(new Error('SMTP error ' + statusCode + ': ' + serverMessage + ' (Domain: ' + destinationDomain + ')'));
            } else {
              // Log any unexpected or unhandled status codes
              logFacility.wrn('Received unhandled SMTP status code ' + statusCode + ' for ' + destinationDomain + ':', serverMessage);
              // As a fallback, try to send the next command if available, but this might indicate a protocol issue.
              if (currentTransactionStage < smtpCommandQueue.length) {
                  writeToSmtpSocket(smtpCommandQueue[currentTransactionStage]);
                  currentTransactionStage++;
              } else {
                  logFacility.wrn('No further commands to send after unhandled status code. Closing socket.');
                  activeSocket.end();
              }
            }
            break;
        }
      }
    });
  }

  /**
   * Cleans an email address string, removing display names (e.g., "Display Name <email@domain.com>" becomes "email@domain.com").
   * @param {string} rawInputAddress - The raw email address string.
   * @returns {string} The cleaned email address, or an empty string if input is invalid.
   */
  function cleanEmailAddress(rawInputAddress) {
    if (!rawInputAddress || typeof rawInputAddress !== 'string') {
        logFacility.wrn('Invalid input for cleanEmailAddress:', rawInputAddress);
        return '';
    }
    const match = rawInputAddress.match(/<([^>]+)>/);
    return match ? match[1].trim() : rawInputAddress.trim();
  }

  /**
   * Parses a string (comma-separated) or an array of email addresses into a standardized array of clean addresses.
   * Includes validation for input types.
   * @param {string|Array<string>} addressesInput - A string of comma-separated addresses or an array of address strings.
   * @returns {Array<string>} An array of cleaned email addresses.
   */
  function parseEmailAddresses(addressesInput) {
    let collectedAddresses = [];
    if (!addressesInput) {
      return collectedAddresses;
    }

    let addressListToProcess = [];
    if (Array.isArray(addressesInput)) {
      addressListToProcess = addressesInput;
    } else if (typeof addressesInput === 'string') {
      addressListToProcess = addressesInput.split(',');
    } else {
        logFacility.wrn('Unsupported address input type for parsing:', typeof addressesInput);
        return collectedAddresses;
    }

    for (let currentAddr of addressListToProcess) {
      if (currentAddr && currentAddr.trim() !== '') {
        collectedAddresses.push(cleanEmailAddress(currentAddr));
      }
    }
    return collectedAddresses;
  }

  /**
   * Main function to dispatch an email message to its recipients.
   * It constructs the email content, groups recipients by domain, and initiates SMTP transactions for each domain.
   * @param {Object} messageObject - The comprehensive email message object.
   * @param {string} messageObject.from - Sender's full email address (e.g., "Sender Name <sender@example.com>").
   * @param {string|Array<string>} [messageObject.to] - Primary recipients.
   * @param {string|Array<string>} [messageObject.cc] - Carbon copy recipients.
   * @param {string|Array<string>} [messageObject.bcc] - Blind carbon copy recipients.
   * @param {string} messageObject.subject - The subject line of the email.
   * @param {string} messageObject.content - The main body content of the email.
   * @param {string} [messageObject.contentType='text/plain'] - MIME content type (e.g., 'text/html').
   * @param {string} [messageObject.charset='utf-8'] - Character set for the content.
   * @param {string} [messageObject.contentEncoding='base64'] - Content transfer encoding (e.g., 'base64', 'quoted-printable').
   * @param {Object} [messageObject.customHeaders] - An object containing additional custom headers (key-value pairs).
   * @param {Function} completionHandler - Callback function (err, result) invoked for each individual domain's transaction.
   */
  function dispatchEmailMessage(messageObject, completionHandler) {
    // Input validation guard clause
    if (!messageObject || !messageObject.from || !messageObject.subject || !messageObject.content) {
      logFacility.err('Invalid message object: missing required fields (from, subject, content).');
      return completionHandler(new Error('Invalid message object: missing required fields (from, subject, content).'));
    }

    let allRecipients = [];
    if (messageObject.to) {
      allRecipients = allRecipients.concat(parseEmailAddresses(messageObject.to));
    }
    if (messageObject.cc) {
      allRecipients = allRecipients.concat(parseEmailAddresses(messageObject.cc));
    }
    if (messageObject.bcc) {
      allRecipients = allRecipients.concat(parseEmailAddresses(messageObject.bcc));
    }

    if (allRecipients.length === 0) {
        logFacility.wrn('No recipients specified in the message object; email will not be sent.');
        return completionHandler(new Error('No recipients specified for the email.'));
    }

    const recipientGroupsByHost = collateRecipientsByHost(allRecipients);

    const senderCleanAddress = cleanEmailAddress(messageObject.from);
    const senderHost = extractDomain(senderCleanAddress);

    if (!senderHost) {
        logFacility.err('Could not extract sender host from email address:', messageObject.from);
        return completionHandler(new Error('Invalid sender email address format or missing host.'));
    }

    // Assemble email headers
    let assembledHeaders = [];
    assembledHeaders.push('From: ' + messageObject.from);
    if (messageObject.to) {
      assembledHeaders.push('To: ' + (Array.isArray(messageObject.to) ? messageObject.to.join(', ') : messageObject.to));
    }
    if (messageObject.cc) {
      assembledHeaders.push('Cc: ' + (Array.isArray(messageObject.cc) ? messageObject.cc.join(', ') : messageObject.cc));
    }

    assembledHeaders.push('Subject: ' + messageObject.subject);
    assembledHeaders.push('MIME-Version: ' + (messageObject.version || '1.0'));
    // Generate a more robust Message-ID
    assembledHeaders.push('Message-ID: <' + (messageObject.id || (new Date().getTime() + '.' + Math.random().toString(36).substring(2, 8) + '@' + senderHost)) + '>');
    
    // Add a standard Date header for better email compliance and deliverability
    assembledHeaders.push('Date: ' + new Date().toUTCString());

    const contentType = messageObject.contentType || 'text/plain';
    const charSet = messageObject.charset || 'utf-8';
    const contentEncoding = messageObject.contentEncoding || 'base64';

    assembledHeaders.push('Content-Type: ' + contentType + '; charset="' + charSet + '"');
    assembledHeaders.push('Content-Transfer-Encoding: ' + contentEncoding);

    // Incorporate any custom headers provided in the message object
    if (messageObject.customHeaders) {
      for (let headerName in messageObject.customHeaders) {
        // Ensure we only process own properties, not inherited ones
        if (Object.prototype.hasOwnProperty.call(messageObject.customHeaders, headerName)) {
          assembledHeaders.push(headerName + ': ' + messageObject.customHeaders[headerName]);
        }
      }
    }

    // Combine headers into the email payload, followed by a blank line
    let emailMessagePayload = assembledHeaders.join(LINE_BREAK) + LINE_BREAK + LINE_BREAK;

    // Normalize line endings and apply content encoding
    let processedContent = messageObject.content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'); // Ensure CRLF for SMTP

    if (contentEncoding === 'base64') {
        processedContent = Buffer.from(processedContent, 'utf8').toString('base64');
    } else if (contentEncoding === 'quoted-printable') {
        // Placeholder for quoted-printable encoding implementation
        logFacility.wrn('Quoted-printable encoding is specified but not fully implemented; content will be sent as-is for now.');
        // A full Type III clone could include a basic QP encoder here.
    }
    // For '7bit' or '8bit', content is sent largely as-is after CRLF normalization.

    emailMessagePayload += processedContent;

    // Dispatch the prepared email message to each unique recipient domain
    for (const targetDomainKey in recipientGroupsByHost) {
      if (Object.prototype.hasOwnProperty.call(recipientGroupsByHost, targetDomainKey)) {
        logFacility.inf('Initiating SMTP transaction for domain:', targetDomainKey, 'with recipients:', recipientGroupsByHost[targetDomainKey].length);
        transmitMailViaSmtp(
          targetDomainKey,
          senderHost,
          senderCleanAddress,
          recipientGroupsByHost[targetDomainKey],
          emailMessagePayload,
          completionHandler
        );
      }
    }
  }

  return dispatchEmailMessage;
};

// Export the main dispatch function as the module's primary export
module.exports = exportingModule.moduleOut;