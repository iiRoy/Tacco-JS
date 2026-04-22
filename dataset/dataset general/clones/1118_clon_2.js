var netClient = require('net'),
    domainLookup = require('dns'),
    lineBreak = '\r\n';

var outputModule = module.exports = function (configSettings) {
  var systemConsole = console;
  var eventLog = configSettings && configSettings.logger || {
    dbg: systemConsole.log,
    inf: systemConsole.info,
    wrn: systemConsole.warn,
    err: systemConsole.error
  };

  /*
   *   SMTP Response Codes Explained:
   *   500: Syntax error, command unrecognized (or command line too long)
   *   501: Syntax error in parameters or arguments
   *   502: Command not implemented
   *   503: Bad sequence of commands
   *   504: Command parameter not implemented
   *   211: System status, or system help reply
   *   214: Help message
   *   220: Service ready
   *   221: Service closing transmission channel
   *   421: Service not available, closing transmission channel (This may be a reply to any command if the service knows it must shut down)
   *   250: Requested mail action okay, completed
   *   251: User not local; will forward to <forward-path>
   *   450: Requested mail action not taken: mailbox unavailable (e.g., mailbox busy)
   *   550: Requested action not taken: mailbox unavailable (e.g., mailbox not found, no access)
   *   451: Requested action aborted: error in processing
   *   551: User not local; please try <forward-path>
   *   452: Requested action not taken: insufficient system storage
   *   552: Requested mail action aborted: exceeded storage allocation
   *   553: Requested action not taken: mailbox name not allowed (e.g., mailbox syntax incorrect)
   *   354: Start mail input; end with <CRLF>.<CRLF>
   *   554: Transaction failed
   *   535: Authentication credentials invalid
   *   235: Authentication successful
   *   334: Server challenge for authentication
   */

  function extractDomain(mailAddress) {
    var matchResult = /[^@]+@([\w\d\-\.]+)/.exec(mailAddress);
    return matchResult && matchResult[1];
  }

  function collateAddresses(addressList) {
    var addressClusters = {};
    var individualAddress; // This variable was declared but never used in the original.
    var targetHost;
    var idx = 0;
    for (
      ;
      idx < addressList.length;
      idx++
    ) {
      targetHost = extractDomain(addressList[idx]);
      (addressClusters[targetHost] || (addressClusters[targetHost] = [])).push(addressList[idx]);
    }
    return addressClusters;
  }

  /**
   * Initiates a connection to a specific domain using its MX (Mail Exchange) records.
   * This function resolves MX records and attempts to connect to available mail servers.
   */
  function establishMxConnection(targetDomain, completionCallback) {
    domainLookup.resolveMx(targetDomain, function (errorObject, mxRecords) {
      if (errorObject) {
        return completionCallback(errorObject);
      }

      mxRecords.sort(function (recordA, recordB) {
        return recordA.prefValue < recordB.prefValue
      });
      eventLog.dbg('MX records resolved for ' + targetDomain + ': ', mxRecords);

      if (!mxRecords || mxRecords.length === 0) {
        return completionCallback(new Error('Could not resolve MX records for <' + targetDomain + '>'));
      }

      function attemptConnection(attemptIndex) {
        if (attemptIndex >= mxRecords.length) {
          return completionCallback(new Error('Failed to connect to any SMTP server for ' + targetDomain));
        }

        var networkSocket = netClient.createConnection(25, mxRecords[attemptIndex].exchangeHost);

        networkSocket.on('error', function (connectionError) {
          eventLog.err('Connection error encountered for MX record: ', mxRecords[attemptIndex], connectionError);
          attemptConnection(++attemptIndex);
        });

        networkSocket.on('connect', function () {
          eventLog.dbg("SMTP MX connection successfully established with: ", mxRecords[attemptIndex].exchangeHost);
          networkSocket.removeAllListeners('error'); // Clear error handlers after successful connection
          completionCallback(null, networkSocket);
        });
      };

      attemptConnection(0); // Begin connection attempts from the first MX record
    });
  }

  function transmitViaSmtp(serverDomain, originHost, senderAddress, destinationAddresses, messageContent, finalCallback) {
    var completionHandler = (typeof finalCallback === 'function') ? finalCallback : function () {
    };

    establishMxConnection(serverDomain, function (connectionError, smtpSocket) {
      if (connectionError) {
        eventLog.err('An error occurred during MX connection for ' + serverDomain, connectionError.stack);
        return completionHandler(connectionError);
      }

      // Helper function to send data to the SMTP socket
      function writeToSocket(dataString) {
        eventLog.dbg('Sending to ' + serverDomain + ' > ' + dataString);
        smtpSocket.write(dataString + lineBreak);
      }

      smtpSocket.setEncoding('utf8');

      var receivedBuffer = '';
      var commandStep = 0;
      var authStep = 0;
      var commandQueue = [];
      var authSequence = [];
      var lineFragments;
      var smtpCommand;

      smtpSocket.on('data', function (dataChunk) {
        receivedBuffer += dataChunk;
        lineFragments = receivedBuffer.split(lineBreak);
        for (var lineIndex = 0, fragmentCount = lineFragments.length - 1; lineIndex < fragmentCount; lineIndex++) {
          processReceivedLine(lineFragments[lineIndex]);
        }
        receivedBuffer = lineFragments[lineFragments.length - 1]; // Keep incomplete line
      });

      smtpSocket.on('error', function (socketError) {
        eventLog.err('Failed to connect or communicate with ' + serverDomain, socketError);
        completionHandler(socketError);
      });


      /*
       *   Authentication logic is commented out in the original,
       *   so it remains commented here, maintaining structural integrity.
       *   if (emailDetails.user && emailDetails.pass) {
       *     commandQueue.push('AUTH LOGIN');
       *     authSequence.push(Buffer.from(emailDetails.user).toString("base64"));
       *     authSequence.push(Buffer.from(emailDetails.pass).toString("base64"));
       *   }
       */

      commandQueue.push('MAIL FROM:<' + senderAddress + '>');
      for (var destIdx = 0; destIdx < destinationAddresses.length; destIdx++) {
        commandQueue.push('RCPT TO:<' + destinationAddresses[destIdx] + '>');
      }
      commandQueue.push('DATA');
      commandQueue.push('QUIT');
      commandQueue.push(''); // An empty string might be for a final CRLF or similar, maintaining original structure

      var fullMessage = '';

      function handleSmtpResponse(responseCode, responseMessage) {
        switch (responseCode) {
          case 220: // Server ready to accept commands
            // Check for ESMTP capabilities (if 'esmtp' is in the message)
            if (/\besmtp\b/i.test(responseMessage)) {
              // Future: Determine specific AUTH types like auth login, auth crm-md5, auth plain
              smtpCommand = 'EHLO'; // Extended HELO
            } else {
              smtpCommand = 'HELO'; // Standard HELO
            }
            writeToSocket(smtpCommand + ' ' + originHost);
            break;

          case 221: // Service closing transmission channel (bye)
          case 235: // User authentication successful
          case 250: // Requested mail action completed successfully
          case 251: // User not local; will forward
            // If all commands in queue are processed
            if (commandStep === commandQueue.length - 1) {
              eventLog.inf('Operation successful:', responseCode, responseMessage);
              completionHandler(null, responseMessage);
            }
            writeToSocket(commandQueue[commandStep]);
            commandStep++;
            break;

          case 354: // Start mail input; end with <CRLF>.<CRLF>
            eventLog.inf('Sending email message body:', messageContent);
            writeToSocket(messageContent);
            writeToSocket(''); // Blank line before dot
            writeToSocket('.'); // End of data marker
            break;

          case 334: // Server challenge for authentication input
            writeToSocket(authSequence[authStep]);
            authStep++;
            break;

          default:
            // Handle error responses (codes 400 and above)
            if (responseCode >= 400) {
              eventLog.wrn('SMTP server responded with an error code:', responseCode, responseMessage);
              completionHandler(responseCode, responseMessage);
              smtpSocket.end(); // Terminate the connection
            }
        }
      }

      function processReceivedLine(currentLine) {
        eventLog.dbg('Received from ' + serverDomain + ' > ' + currentLine);

        fullMessage += (currentLine + lineBreak); // Accumulate the message

        // Check if the line indicates a complete response (space at 4th char)
        if (currentLine[3] === ' ') {
          // A dash '-' at the 4th position means multi-line response is not complete.
          // A space ' ' at the 4th position means the response is complete.
          handleSmtpResponse(parseInt(currentLine), fullMessage);
          fullMessage = ''; // Reset for the next response
        }
      }
    });
  }

  function cleanMailAddress(rawAddress) {
    return rawAddress.replace(/^.+</, '').replace(/>\s*$/, '').trim();
  }

  function extractCleanAddresses(rawAddressList) {
    var addrIndex;
    var unusedVar; // Corresponds to 'm' which was unused in the original
    var cleanedList = [];
    if (!Array.isArray(rawAddressList)) {
      rawAddressList = rawAddressList.split(',');
    }
    for (addrIndex = 0; addrIndex < rawAddressList.length; addrIndex++) {
      cleanedList.push(cleanMailAddress(rawAddressList[addrIndex]));
    }
    return cleanedList;
  }

  /**
   * Main function to dispatch an email.
   *
   * @param emailDetails {object} Object containing email properties:
   *             sender
   *             receiver
   *             carbonCopy
   *             blindCarbonCopy
   *             replyToAddress      // Future enhancement
   *             returnPath          // Future enhancement
   *             mailSubject
   *             contentType         // Default: 'text/plain' or 'text/html'
   *             charEncoding        // Default: 'utf-8'
   *             transferEncoding    // Default: 'base64'
   *             messageId           // Default: timestamp + sender domain
   *             customHeaders       // Object of additional headers
   *             emailBody
   *             attachments         // Future enhancement
   *               [{
   *                 contentType
   *                 fileName
   *                 fileContent
   *               }].
   *
   * @param processCompletion function(error, domain). Callback executed upon completion.
   *
   */
  function dispatchEmail(emailDetails, processCompletion) {
    var allDestinations = [];
    var destinationClusters;
    var originServer;
    var fullMessageData;
    var lastHeaderVar; // Corresponds to 'lheader' which was unused in the original

    if (emailDetails.to) {
      allDestinations = allDestinations.concat(extractCleanAddresses(emailDetails.to));
    }

    if (emailDetails.cc) {
      allDestinations = allDestinations.concat(extractCleanAddresses(emailDetails.cc));
    }

    if (emailDetails.bcc) {
      allDestinations = allDestinations.concat(extractCleanAddresses(emailDetails.bcc));
    }

    destinationClusters = collateAddresses(allDestinations);

    var senderIdentifier = cleanMailAddress(emailDetails.from);
    originServer = extractDomain(senderIdentifier);

    fullMessageData = 'From: ' + emailDetails.from + lineBreak;
    if (emailDetails.to) {
      fullMessageData += 'To: ' + (Array.isArray(emailDetails.to) ? emailDetails.to.join(',') : emailDetails.to);
      fullMessageData += lineBreak;
    }
    if (emailDetails.cc) {
      fullMessageData += 'Cc: ' + (Array.isArray(emailDetails.cc) ? emailDetails.cc.join(',') : emailDetails.cc);
      fullMessageData += lineBreak;
    }

    fullMessageData += 'Subject: ' + emailDetails.subject + lineBreak;
    fullMessageData += 'MIME-Version: ' + (emailDetails.version || '1.0') + lineBreak;
    fullMessageData += 'Message-ID: <' + (emailDetails.id || (Date.now() + originServer)) + '>' + lineBreak;
    fullMessageData += 'Content-Type: ' + (emailDetails.type || 'text/plain');
    fullMessageData += '; charset=\"' + (emailDetails.charset || (emailDetails.charset = 'utf-8')) + '\"' + lineBreak;
    fullMessageData += 'Content-Transfer-Encoding: ' + (emailDetails.encoding || (emailDetails.encoding = 'base64')) + lineBreak;

    for (var headerName in emailDetails.headers) {
      fullMessageData += headerName + ': ' + emailDetails.headers[headerName] + lineBreak;
    }

    fullMessageData += lineBreak; // Separator for headers and body

    var messageBody = emailDetails.content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
    fullMessageData += Buffer.from(messageBody).toString('base64'); // Encode body to base64

    for (var targetHostGroup in destinationClusters) {
      transmitViaSmtp(targetHostGroup, originServer, senderIdentifier, destinationClusters[targetHostGroup], fullMessageData, processCompletion);
    }
  }

  return dispatchEmail;

};