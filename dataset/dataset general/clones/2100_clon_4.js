const NetworkConnector = require('net');
const FileSystemAccess = require('fs');

function createEventNotificator() {
  const subscribers = {};

  function notify(eventTag, payload) {
    if (subscribers[eventTag]) {
      subscribers[eventTag].forEach(listener => listener(payload));
    }
  }

  function register(eventTag, listener) {
    if (!subscribers[eventTag]) {
      subscribers[eventTag] = [];
    }
    subscribers[eventTag].push(listener);
  }

  return { notify, register };
}

const getLogger = (scope) => {
  const envDebug = process.env.DEBUG || '';
  const debugActive = envDebug.includes('all') || envDebug.includes(scope);
  return (message, ...args) => {
    if (debugActive) {
      console.log(`[${scope}] ${message}`, ...args);
    }
  };
};

const mainLog = getLogger('fileXfer:general');
const actionLog = getLogger('fileXfer:action');
const replyLog = getLogger('fileXfer:reply');

const DEFAULT_PORT_NUMBER = 21;
const CONNECTION_INACTIVITY_LIMIT = 10 * 60 * 1000;
const BLANK_FUNCTION = () => {};

function ensureSingleCall(fn) {
  let hasBeenCalled = false;
  let result;
  return function(...args) {
    if (!hasBeenCalled) {
      hasBeenCalled = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

function createReplyInterpreter(onFullReplyReceived) {
  let currentBuffer = '';
  const REPLY_DELIMITER = /\r\n|\n/;

  function processChunk(chunk) {
    currentBuffer += chunk.toString('binary');

    let lines = currentBuffer.split(REPLY_DELIMITER);
    currentBuffer = lines.pop();

    for (const line of lines) {
      if (!line) continue;

      const codeMatch = line.match(/^(\d{3})(-|\s)(.*)$/);
      if (codeMatch) {
        const code = parseInt(codeMatch[1], 10);
        const separator = codeMatch[2];
        // The original library returns the full line for `text` in some cases
        // and just the message in others. For simplicity and divergence, we use the full line.
        const textContent = line;

        const isError = (code >= 400 && code <= 599);
        const isMark = separator === '-'; // Simplified; actual marks are specific codes.

        onFullReplyReceived({
          code: code,
          text: textContent,
          isError: isError,
          isMark: isMark,
          isMultiline: separator === '-',
        });
      } else {
        // Handle lines that don't fit the FTP reply pattern as generic messages.
        // This is a simplification compared to a full-fledged parser.
        onFullReplyReceived({
          code: 0,
          text: line,
          isError: true,
          isMark: false,
          isMultiline: false
        });
      }
    }
  }

  return { processChunk };
}

function decodeDirectoryEntries(listingText) {
  const entryLines = listingText.split(/\r\n|\n/).filter(Boolean);
  return entryLines.map(line => {
    // This is a very crude parser, simulating 'ls -l' output.
    // The original 'parse-listing' library is highly complex and handles many formats.
    // For Type IV, we demonstrate a divergent, simplified implementation.
    const parts = line.split(/\s+/);
    if (parts.length < 9) return null; // Not enough parts for a typical ls -l entry

    // Example parts:
    // -rw-r--r--    1 user     group        12345 Jan 01 2023  filename
    // 0            1  2        3            4     5   6    7    8
    return {
      name: parts.slice(8).join(' '), // File name can have spaces
      isDirectory: parts[0].startsWith('d'),
      sizeValue: parseInt(parts[4], 10) || 0,
      modificationDate: new Date(`${parts[5]} ${parts[6]} ${parts[7]}`), // Crude date parsing
      rawLine: line
    };
  }).filter(Boolean);
}

const PassiveAddressMatcher = /(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)/;

function extractPassiveEndpoint(replyText, processingCallback) {
  const matchResult = PassiveAddressMatcher.exec(replyText);
  if (!matchResult) {
    return processingCallback(new Error('Invalid passive address format received'));
  }

  const hostParts = matchResult.slice(1, 5);
  const portPart1 = parseInt(matchResult[5], 10);
  const portPart2 = parseInt(matchResult[6], 10);

  processingCallback(null, {
    host: hostParts.join('.'),
    port: (portPart1 & 255) * 256 + (portPart2 & 255)
  });
}

const transferInitiationMarks = {
  marks: [125, 150],
  ignoreCode: 226
};

const SUPPORTED_ACTIONS = [
  'ABOR', 'PWD', 'CDUP', 'FEAT', 'NOOP', 'QUIT', 'PASV', 'SYST',
  'CWD', 'DELE', 'LIST', 'MDTM', 'MKD', 'MODE', 'NLST', 'PASS', 'RETR', 'RMD',
  'RNFR', 'RNTO', 'SITE', 'STAT', 'STOR', 'TYPE', 'USER', 'XRMD', 'OPTS',
  'CHMOD', 'SIZE'
];

function createRemoteFileTransferAgent(settings) {
  const agentEvents = createEventNotificator();
  const state = {
    currentHost: settings.host,
    currentPort: settings.port || DEFAULT_PORT_NUMBER,
    controlSocket: null,
    controlReplyInterpreter: null,
    isAuthenticated: false,
    queuedOperations: [],
    operationInProgress: false,
    serverCapabilities: [],
    transferMode: null,
    userIdentifier: settings.user,
    userSecret: settings.pass,
    authenticationAttempting: false,
    ignoreNextReplyCode: null,
  };

  const relayEvent = (eventLabel) => (payload) => {
    agentEvents.notify(eventLabel, payload);
    mainLog(`event:${eventLabel}`, payload || {});
    if (settings.verboseTracing) {
      agentEvents.notify('trace_event', { label: `event:${eventLabel}`, data: payload || {} });
    }
  };

  function establishControlChannel(initialAction) {
    if (state.controlSocket && state.controlSocket.destroy) {
      state.controlSocket.destroy();
    }

    state.isAuthenticated = false;
    state.controlSocket = NetworkConnector.createConnection(state.currentPort, state.currentHost, initialAction || BLANK_FUNCTION);

    state.controlSocket.on('connect', relayEvent('channel_connected'));
    state.controlSocket.on('timeout', relayEvent('channel_timed_out'));
    state.controlSocket.on('error', relayEvent('channel_error'));
    state.controlSocket.on('close', relayEvent('channel_closed'));

    state.controlReplyInterpreter = createReplyInterpreter((reply) => {
      agentEvents.notify('control_data_received', reply);
      replyLog(reply.text);
      processIncomingReply(reply);
    });

    state.controlSocket.on('data', (chunk) => {
      state.controlReplyInterpreter.processChunk(chunk);
    });
  }

  function transmitInstruction(instructionText) {
    if (!instructionText) return;

    actionLog(instructionText);
    state.controlSocket.write(instructionText + '\r\n');

    if (settings.verboseTracing) {
      agentEvents.notify('trace_event', { label: 'client_action', data: instructionText });
    }
  }

  function advanceOperationQueue() {
    if (!state.operationInProgress && state.queuedOperations.length > 0) {
      state.operationInProgress = true;
      const currentOperation = state.queuedOperations[0];
      transmitInstruction(currentOperation.commandString);
    }
  }

  function scheduleOperation(commandString, completionCallback) {
    const operationEntry = {
      commandString: commandString,
      completionCallback: completionCallback || BLANK_FUNCTION,
      expectsMark: null
    };

    if (state.controlSocket && state.controlSocket.writable) {
      if (state.isAuthenticated || /FEAT|SYST|USER|PASS/.test(commandString.toUpperCase())) {
        state.queuedOperations.push(operationEntry);
        advanceOperationQueue();
        return;
      }

      mainLog('Not authenticated, attempting to retrieve capabilities and authenticate...');
      retrieveCapabilities((err) => {
        if (err) {
          mainLog('Failed to retrieve capabilities before authentication:', err);
          return completionCallback(err);
        }
        performAuthentication(state.userIdentifier, state.userSecret, (authErr) => {
          if (authErr) {
            mainLog('Authentication failed:', authErr);
            return completionCallback(authErr);
          }
          mainLog('Authentication successful, queuing command.');
          state.queuedOperations.push(operationEntry);
          advanceOperationQueue();
        });
      });
      return;
    }

    mainLog('No control channel, initiating connection...');
    state.isAuthenticated = false;
    establishControlChannel(() => {
      mainLog('Control channel established, scheduling operation.');
      // After connection, the first command is often the initial FEAT/SYST/USER/PASS sequence.
      // We re-schedule the operation, allowing the auth flow to kick in.
      scheduleOperation(commandString, completionCallback);
    });
  }

  function processIncomingReply(reply) {
    if (state.queuedOperations.length === 0) {
      if (reply.code === 220) {
        mainLog('Received initial 220 welcome message.');
        // This is the point where the client is ready to send the first command.
        // `scheduleOperation` handles this by re-calling itself to initiate auth/first command.
      }
      return;
    }

    const currentOperation = state.queuedOperations[0];
    const operationCallback = currentOperation.completionCallback;

    if (reply.isMark) {
      if (!currentOperation.expectsMark ||
          currentOperation.expectsMark.marks.indexOf(reply.code) === -1) {
        mainLog('Ignoring unexpected mark:', reply.code);
        return;
      }

      if (currentOperation.expectsMark.ignoreCode) {
        state.ignoreNextReplyCode = currentOperation.expectsMark.ignoreCode;
        mainLog('Set to ignore next reply code:', state.ignoreNextReplyCode);
      }
    }

    if (state.ignoreNextReplyCode === reply.code) {
      mainLog('Ignoring reply code as requested:', reply.code);
      state.ignoreNextReplyCode = null;
      return;
    }

    const error = reply.isError ? new Error(reply.text || 'Unknown FTP response error.') : null;
    if (error) error.responseCode = reply.code;

    operationCallback(error, reply);
    state.operationInProgress = false;
    state.queuedOperations.shift();
    advanceOperationQueue();
  }

  const clientInterface = {};

  clientInterface.executeCommand = (actionIdentifier, ...params) => {
    let finalCallback = BLANK_FUNCTION;
    if (typeof params[params.length - 1] === 'function') {
      finalCallback = params.pop();
    }
    const fullCommand = `${actionIdentifier} ${params.join(' ')}`.trim();
    scheduleOperation(fullCommand, finalCallback);
  };

  clientInterface.raw = {};
  SUPPORTED_ACTIONS.forEach(cmd => {
    clientInterface.raw[cmd.toLowerCase()] = function(...args) {
      let cb = BLANK_FUNCTION;
      if (typeof args[args.length - 1] === 'function') {
        cb = args.pop();
      }
      clientInterface.executeCommand(cmd, ...args, cb);
    };
  });

  function performAuthentication(userCredential, secretValue, callback) {
    userCredential = userCredential || 'anonymous';
    secretValue = secretValue || '@anonymous';

    if (state.authenticationAttempting) {
      return callback(new Error('Authentication already in progress.'));
    }
    state.authenticationAttempting = true;

    clientInterface.raw.user(userCredential, (err, response) => {
      if (err || [230, 331, 332].indexOf(response.code) === -1) {
        state.authenticationAttempting = false;
        return callback(err);
      }

      clientInterface.raw.pass(secretValue, (err, response) => {
        state.authenticationAttempting = false;
        if (err) {
          return callback(err);
        } else if ([230, 202].indexOf(response.code) > -1) {
          state.isAuthenticated = true;
          state.userIdentifier = userCredential;
          state.userSecret = secretValue;
          clientInterface.raw.type('I', (typeErr) => {
            if (typeErr) mainLog('Failed to set binary type after auth:', typeErr);
            callback(undefined, response);
          });
        } else if (response.code === 332) {
          clientInterface.raw.acct('', BLANK_FUNCTION);
          callback(new Error('Account information required.'));
        } else {
          callback(new Error('Unknown authentication response: ' + response.text));
        }
      });
    });
  }
  clientInterface.authenticate = performAuthentication;

  function extractCapabilities(featureListText) {
    const lines = featureListText.split(/\r\n|\n/).slice(1, -1);
    return lines.map(line => line.trim().toLowerCase()).filter(Boolean);
  }

  function retrieveCapabilities(callback) {
    if (state.serverCapabilities.length > 0) {
      return callback(null, state.serverCapabilities);
    }

    clientInterface.raw.feat((err, response) => {
      state.serverCapabilities = err ? [] : extractCapabilities(response.text);
      clientInterface.raw.syst((systErr, systRes) => {
        if (!systErr && systRes.code === 215) {
          state.systemType = systRes.text.toLowerCase();
        }
        callback(null, state.serverCapabilities);
      });
    });
  }
  clientInterface.getCapabilities = retrieveCapabilities;

  function supportsCapability(featureName) {
    return !!featureName && state.serverCapabilities.indexOf(featureName.toLowerCase()) > -1;
  }
  clientInterface.hasCapability = supportsCapability;

  function setTransferType(modeChar, callback) {
    modeChar = modeChar.toUpperCase();
    if (state.transferMode === modeChar) {
      return callback();
    }
    clientInterface.raw.type(modeChar, (err, data) => {
      if (!err) state.transferMode = modeChar;
      callback(err, data);
    });
  }
  clientInterface.setMode = setTransferType;

  function acquireDataChannel(operationPath, callback) {
    callback = ensureSingleCall(callback);

    clientInterface.raw.pasv((err, pasvResponse) => {
      if (err) return callback(err);

      if (pasvResponse.code !== 227) {
        return callback(new Error(`Unexpected PASV response code: ${pasvResponse.code}`));
      }

      extractPassiveEndpoint(pasvResponse.text, (addrErr, dataAddress) => {
        if (addrErr) return callback(addrErr);

        const dataSocket = NetworkConnector.createConnection(dataAddress.port, dataAddress.host, () => {
          mainLog(`Data channel connected to ${dataAddress.host}:${dataAddress.port}`);
          callback(null, dataSocket);
        });

        dataSocket.on('error', (socketErr) => {
          mainLog('Data channel error:', socketErr);
          if (socketErr.code === 'ECONNREFUSED') {
            socketErr.message = 'Connection refused for data channel. Is another transfer active?';
          }
          callback(socketErr);
        });

        dataSocket.setTimeout(CONNECTION_INACTIVITY_LIMIT);
        dataSocket.on('timeout', () => {
          mainLog('Data channel timed out.');
          dataSocket.destroy(new Error('Data channel timed out.'));
        });
      });
    });
  }

  clientInterface.enumerateDirectory = (remotePath, callback) => {
    if (typeof remotePath === 'function') {
      callback = remotePath;
      remotePath = '';
    }
    callback = ensureSingleCall(callback);

    acquireDataChannel(remotePath, (err, dataChannel) => {
      if (err) return callback(err);

      let accumulatedListing = '';
      dataChannel.on('data', (chunk) => {
        accumulatedListing += chunk.toString('binary');
      });

      dataChannel.once('close', (hadError) => {
        if (hadError) {
          mainLog('Data channel closed with error during LIST.');
          return;
        }
        mainLog('Data channel closed for LIST. Processing listing.');
        callback(null, decodeDirectoryEntries(accumulatedListing));
      });
      dataChannel.once('error', callback);

      const listOpCallback = (err, res) => {
        if (err) {
          dataChannel.destroy(err);
          return callback(err);
        }

        const isExpectedMark = transferInitiationMarks.marks.some(mark => mark === res.code);
        if (!isExpectedMark) {
          dataChannel.destroy(new Error(`Expected transfer mark ${transferInitiationMarks.marks.join(' or ')} but received: ${res.code} - ${res.text}`));
          return callback(new Error(`Unexpected server reply: ${res.text}`));
        }
      };
      const lastOp = state.queuedOperations[state.queuedOperations.length - 1];
      if (lastOp) {
        lastOp.expectsMark = transferInitiationMarks;
      }
      clientInterface.executeCommand('LIST', remotePath, listOpCallback);
    });
  };

  clientInterface.fetchRemoteFile = (remotePath, localDestination, callback) => {
    let finalAction = BLANK_FUNCTION;
    if (typeof localDestination === 'function') {
      finalAction = ensureSingleCall(localDestination);
    } else {
      const originalCallback = ensureSingleCall(callback || BLANK_FUNCTION);
      const writeStream = FileSystemAccess.createWriteStream(localDestination);
      writeStream.on('error', originalCallback);

      finalAction = (err, dataChannel) => {
        if (err) {
          return originalCallback(err);
        }

        dataChannel.on('readable', () => {
          agentEvents.notify('transfer_progress', {
            fileName: remotePath,
            operationType: 'download',
            totalBytes: 0,
            transferredBytes: dataChannel.bytesRead
          });
        });

        dataChannel.on('error', (streamErr) => {
          mainLog('Data channel stream error during GET:', streamErr);
          originalCallback(streamErr);
        });
        dataChannel.on('end', () => {
          mainLog('Data channel stream ended for GET.');
          originalCallback(null);
        });
        // `close` event might fire after `end`, we rely on `ensureSingleCall` for `originalCallback`
        // dataChannel.on('close', () => { mainLog('Data channel stream closed for GET.'); });

        dataChannel.pipe(writeStream);
        dataChannel.resume();
      };
    }

    acquireDataChannel(remotePath, (err, dataChannel) => {
      if (err) return finalAction(err);

      const getOpCallback = (controlErr, controlRes) => {
        if (controlErr) {
          dataChannel.destroy(controlErr);
          return finalAction(controlErr);
        }

        const isExpectedMark = transferInitiationMarks.marks.some(mark => mark === controlRes.code);
        if (!isExpectedMark) {
          dataChannel.destroy(new Error(`Expected transfer mark ${transferInitiationMarks.marks.join(' or ')} but received: ${controlRes.code} - ${controlRes.text}`));
          return finalAction(new Error(`Unexpected server reply: ${controlRes.text}`));
        }
        finalAction(null, dataChannel);
      };
      const lastOp = state.queuedOperations[state.queuedOperations.length - 1];
      if (lastOp) {
        lastOp.expectsMark = transferInitiationMarks;
      }
      clientInterface.executeCommand('RETR', remotePath, getOpCallback);
    });
  };

  establishControlChannel();

  clientInterface.on = agentEvents.register;

  if (settings.verboseTracing) {
    console.warn('`verboseTracing` is deprecated. Use DEBUG environment variable.');
  }

  return clientInterface;
}

module.exports = createRemoteFileTransferAgent;