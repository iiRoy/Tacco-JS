(function(globalScope) {

  // Global Configuration Constants
  const MAIN_SERVICE_URI = "ws://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/speech";
  const SERVICE_MONITOR_URI = "ws://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/status";
  const REF_DATA_ENDPOINT = "http://bark.phon.ioc.ee:82/dev/duplex-speech-api/dynamic/reference";
  // Audio format parameters for server
  const AUDIO_FORMAT_PARAMS = "content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1";
  // Audio chunking interval (milliseconds)
  const AUDIO_CHUNK_INTERVAL_MS = 250;
  const FINAL_SEGMENT_MARKER = "EOS";
  const WORKER_SCRIPT_URL = 'recorderWorker.js';

  // Application Error Codes
  const APP_ERROR_CODES = Object.freeze({
    NETWORK_FAILURE: 2,
    AUDIO_PROCESSING_ISSUE: 3,
    REMOTE_SERVICE_ERROR: 4,
    CLIENT_CONFIGURATION_ERROR: 5,
  });

  // Application Event Messages
  const APP_EVENT_MESSAGES = Object.freeze({
    MICROPHONE_PENDING: 1,
    MEDIA_STREAM_ESTABLISHED: 2,
    RECORDER_INITIALIZED: 3,
    RECORDING_ACTIVE: 4,
    DATA_SENT: 5,
    EMPTY_DATA_SENT: 6,
    END_OF_SPEECH_SENT: 7,
    SOCKET_ACTIVITY: 8,
    SOCKET_CONNECTED: 9,
    SOCKET_DISCONNECTED: 10,
    RECORDING_STOPPED: 11,
    ENDPOINT_UPDATED: 12,
  });

  // Service Status Code Descriptions (from Kaldi GStreamer Server)
  const SERVICE_STATUS_DESCRIPTIONS = new Map([
    [0, 'Operation Successful'],
    [1, 'No Recognizable Speech'],
    [2, 'Recognition Aborted'],
    [9, 'No Available Processors'],
  ]);

  // Internal state variables, initialized during setup.
  let audioGraphContext;
  let audioRecorderInstance;
  // Internal state variables, initialized during a listening session.
  let socketConnection;
  let audioSendTimerId;
  // Internal state variable for service monitoring.
  let statusMonitorSocket;

  // Main SpeechTranscriptor class
  const SpeechTranscriptor = function(userOptions) {
    // Merge user options with default settings
    const defaultSettings = {
      serviceUrl: MAIN_SERVICE_URI,
      monitorUrl: SERVICE_MONITOR_URI,
      referenceEndpoint: REF_DATA_ENDPOINT,
      audioFormat: AUDIO_FORMAT_PARAMS,
      chunkInterval: AUDIO_CHUNK_INTERVAL_MS,
      workerPath: WORKER_SCRIPT_URL,
      onReady: () => {},
      onSpeechEnd: () => {},
      onPartialResult: (data) => {},
      onFinalResult: (data) => {},
      onSessionEnd: () => {},
      onLogEvent: (type, data) => {},
      onIssue: (code, details) => {},
      onServiceStatusUpdate: null,
      onAnimationFrame: (time) => {},
      userId: null,
      contentId: null,
    };
    const currentSettings = { ...defaultSettings, ...userOptions
    };

    // Initialize service status monitoring if callback is provided
    if (currentSettings.onServiceStatusUpdate) {
      startStatusMonitoring();
    }

    // Public method to retrieve current configuration
    this.getSettings = () => currentSettings;

    // Public method to set up audio context and request microphone access
    this.initializeAudio = () => {
      currentSettings.onLogEvent(APP_EVENT_MESSAGES.MICROPHONE_PENDING, "Awaiting microphone access permission...");

      try {
        globalScope.AudioContext = globalScope.AudioContext || globalScope.webkitAudioContext;
        globalScope.navigator.getUserMedia = globalScope.navigator.getUserMedia || globalScope.navigator.webkitGetUserMedia || globalScope.navigator.mozGetUserMedia;
        globalScope.URL = globalScope.URL || globalScope.webkitURL;
        audioGraphContext = new globalScope.AudioContext();
      } catch (err) {
        currentSettings.onIssue(APP_ERROR_CODES.CLIENT_CONFIGURATION_ERROR, `Failed to initialize Web Audio API: ${err.message}`);
        return;
      }

      if (!globalScope.navigator.getUserMedia) {
        currentSettings.onIssue(APP_ERROR_CODES.CLIENT_CONFIGURATION_ERROR, "Browser lacks user media support for microphone access.");
        return;
      }

      const mediaConstraints = {
        audio: true
      };
      const successCallback = (stream) => initMediaStream(stream);
      const errorCallback = (err) => {
        currentSettings.onIssue(APP_ERROR_CODES.CLIENT_CONFIGURATION_ERROR, `Microphone access denied or failed: ${err.message}`);
      };

      globalScope.navigator.getUserMedia(mediaConstraints, successCallback, errorCallback);
    };

    // Public method to begin audio recording and transcription
    this.commenceProcessing = () => {
      if (!audioRecorderInstance) {
        currentSettings.onIssue(APP_ERROR_CODES.AUDIO_PROCESSING_ISSUE, "Audio recorder not initialized. Call initializeAudio() first.");
        return;
      }

      // If an existing connection is active, terminate it first
      if (socketConnection) {
        terminateSession();
      }

      try {
        socketConnection = initWebSocketChannel();
      } catch (err) {
        currentSettings.onIssue(APP_ERROR_CODES.CLIENT_CONFIGURATION_ERROR, `WebSocket API not supported or failed to create: ${err.message}`);
      }
    };

    // Public method to stop recording and sending new audio, finalize session
    this.haltProcessing = () => {
      // Clear the periodic audio sending timer
      if (audioSendTimerId) {
        clearInterval(audioSendTimerId);
        audioSendTimerId = null;
      }

      if (audioRecorderInstance) {
        audioRecorderInstance.stop();
        currentSettings.onLogEvent(APP_EVENT_MESSAGES.RECORDING_STOPPED, 'Recording halted.');

        // Send any remaining buffered audio to the server
        audioRecorderInstance.export16kMono((audioBlob) => {
          dispatchAudioPacket(audioBlob);
          dispatchAudioPacket(FINAL_SEGMENT_MARKER); // Signal end of speech
          audioRecorderInstance.clear();
        }, 'audio/x-raw');

        currentSettings.onSpeechEnd();
      } else {
        currentSettings.onIssue(APP_ERROR_CODES.AUDIO_PROCESSING_ISSUE, "Audio recorder instance is undefined.");
      }
    };

    // Public method to immediately stop all activity and close connections
    this.terminateSession = () => {
      // Clear any pending audio sends
      if (audioSendTimerId) {
        clearInterval(audioSendTimerId);
        audioSendTimerId = null;
      }

      if (audioRecorderInstance) {
        audioRecorderInstance.stop();
        audioRecorderInstance.clear();
        currentSettings.onLogEvent(APP_EVENT_MESSAGES.RECORDING_STOPPED, 'Recording session terminated.');
      }

      if (socketConnection) {
        socketConnection.close();
        socketConnection = null;
      }
    };

    // Public method to update the primary speech service endpoint
    this.updateServiceEndpoint = (newUrl) => {
      currentSettings.serviceUrl = newUrl;
      currentSettings.onLogEvent(APP_EVENT_MESSAGES.ENDPOINT_UPDATED, `Primary service endpoint changed to: ${newUrl}`);
    };

    // Public method to update the service status monitoring endpoint
    this.updateServiceMonitor = (newMonitorUrl) => {
      currentSettings.monitorUrl = newMonitorUrl;
      if (currentSettings.onServiceStatusUpdate) {
        startStatusMonitoring(); // Re-initialize monitoring with new URL
      }
      currentSettings.onLogEvent(APP_EVENT_MESSAGES.ENDPOINT_UPDATED, `Service status monitor endpoint changed to: ${newMonitorUrl}`);
    };

    // Public method to submit reference text data to the backend
    this.sendReferenceData = async (payloadContent, successProc, errorProc) => {
      const httpHeaders = new Headers();
      if (currentSettings.userId) {
        httpHeaders.append("User-Id", currentSettings.userId);
      }
      if (currentSettings.contentId) {
        httpHeaders.append("Content-Id", currentSettings.contentId);
      }
      httpHeaders.append("Content-Type", "text/plain");

      try {
        const response = await fetch(currentSettings.referenceEndpoint, {
          method: "POST",
          headers: httpHeaders,
          body: payloadContent
        });
        if (response.ok) {
          const responseData = await response.text();
          successProc(responseData);
        } else {
          const errorDetail = await response.text();
          errorProc(new Error(`HTTP error! Status: ${response.status}, Body: ${errorDetail}`));
        }
      } catch (err) {
        errorProc(err);
      }
    };

    // Private helper function: Initializes media stream and recorder
    const initMediaStream = (stream) => {
      const audioInput = audioGraphContext.createMediaStreamSource(stream);
      currentSettings.onLogEvent(APP_EVENT_MESSAGES.MEDIA_STREAM_ESTABLISHED, 'Audio media stream created successfully.');

      // Expose an analyser node to the global scope for visualization purposes
      globalScope.speechAudioAnalyser = audioGraphContext.createAnalyser();
      audioInput.connect(globalScope.speechAudioAnalyser);

      // Request animation frame for visualization callback
      globalScope.requestAnimationFrame(currentSettings.onAnimationFrame);

      audioRecorderInstance = new Recorder(audioInput, {
        workerPath: currentSettings.workerPath
      });
      currentSettings.onLogEvent(APP_EVENT_MESSAGES.RECORDER_INITIALIZED, 'Audio recorder component initialized.');
    };

    // Private helper function: Sends data over the WebSocket connection
    const dispatchAudioPacket = (dataItem) => {
      if (!socketConnection) {
        currentSettings.onIssue(APP_ERROR_CODES.CLIENT_CONFIGURATION_ERROR, 'No active WebSocket connection. Cannot send data.');
        return;
      }

      const connectionState = socketConnection.readyState;
      if (connectionState === WebSocket.OPEN) {
        // Handle audio blob transmission
        if (dataItem instanceof Blob) {
          if (dataItem.size > 0) {
            socketConnection.send(dataItem);
            currentSettings.onLogEvent(APP_EVENT_MESSAGES.DATA_SENT, `Sent audio blob: ${dataItem.type}, size: ${dataItem.size} bytes.`);
          } else {
            currentSettings.onLogEvent(APP_EVENT_MESSAGES.EMPTY_DATA_SENT, `Attempted to send empty audio blob: ${dataItem.type}.`);
          }
          // Handle non-blob (e.g., EOS marker string) transmission
        } else {
          socketConnection.send(dataItem);
          currentSettings.onLogEvent(APP_EVENT_MESSAGES.END_OF_SPEECH_SENT, `Sent control tag: ${dataItem}.`);
        }
      } else {
        currentSettings.onIssue(APP_ERROR_CODES.NETWORK_FAILURE, `WebSocket not open (readyState: ${connectionState}). Failed to send data: ${dataItem}.`);
      }
    };

    // Private helper function: Establishes and configures the WebSocket connection
    const initWebSocketChannel = () => {
      let connectionUrl = currentSettings.serviceUrl + '?' + currentSettings.audioFormat;
      if (currentSettings.userId) {
        connectionUrl += '&user-id=' + currentSettings.userId;
      }
      if (currentSettings.contentId) {
        connectionUrl += '&content-id=' + currentSettings.contentId;
      }

      // Basic URL validation
      try {
        new URL(connectionUrl);
      } catch (e) {
        throw new Error(`Invalid WebSocket URL constructed: ${connectionUrl}. Error: ${e.message}`);
      }

      const newSocket = new WebSocket(connectionUrl);

      // WebSocket event handlers
      newSocket.onmessage = (event) => {
        const messageData = event.data;
        currentSettings.onLogEvent(APP_EVENT_MESSAGES.SOCKET_ACTIVITY, messageData);

        if (messageData instanceof Object && !(messageData instanceof Blob)) {
          currentSettings.onIssue(APP_ERROR_CODES.REMOTE_SERVICE_ERROR, 'WebSocket received an unexpected object type (not a Blob).');
          return;
        }
        if (messageData instanceof Blob) {
          currentSettings.onIssue(APP_ERROR_CODES.REMOTE_SERVICE_ERROR, 'WebSocket received an unexpected Blob type. Expected text/JSON.');
          return;
        }

        try {
          const parsedResponse = JSON.parse(messageData);
          if (parsedResponse.status === 0) { // Success
            const speechResult = parsedResponse.result.hypotheses;
            if (parsedResponse.result.final) {
              currentSettings.onFinalResult(speechResult);
            } else {
              currentSettings.onPartialResult(speechResult);
            }
          } else { // Server-side error
            const description = getServiceStatusCodeDescription(parsedResponse.status);
            currentSettings.onIssue(APP_ERROR_CODES.REMOTE_SERVICE_ERROR, `Service error: ${parsedResponse.status} - ${description}`);
          }
        } catch (parseError) {
          currentSettings.onIssue(APP_ERROR_CODES.REMOTE_SERVICE_ERROR, `Failed to parse WebSocket message as JSON: ${parseError.message}. Message: ${messageData}`);
        }
      };

      newSocket.onopen = (event) => {
        // Start periodic audio sending once the socket is open
        audioSendTimerId = setInterval(() => {
          if (audioRecorderInstance) {
            audioRecorderInstance.export16kMono((blob) => {
              dispatchAudioPacket(blob);
              audioRecorderInstance.clear();
            }, 'audio/x-raw');
          }
        }, currentSettings.chunkInterval);

        audioRecorderInstance.record(); // Begin actual audio recording
        currentSettings.onReady();
        currentSettings.onLogEvent(APP_EVENT_MESSAGES.SOCKET_CONNECTED, `WebSocket connection established. Event: ${JSON.stringify(event)}`);
      };

      newSocket.onclose = (event) => {
        // Clear the periodic audio sending timer if it's still running
        if (audioSendTimerId) {
          clearInterval(audioSendTimerId);
          audioSendTimerId = null;
        }
        currentSettings.onSessionEnd(); // Signal the end of the transcription session
        currentSettings.onLogEvent(APP_EVENT_MESSAGES.SOCKET_DISCONNECTED, `WebSocket closed: Code=${event.code}, Reason='${event.reason}', Clean=${event.wasClean}.`);
      };

      newSocket.onerror = (event) => {
        const errorDetail = event.message || event.type || JSON.stringify(event);
        currentSettings.onIssue(APP_ERROR_CODES.NETWORK_FAILURE, `WebSocket error encountered: ${errorDetail}`);
      };

      return newSocket;
    };

    // Private helper function: Sets up a WebSocket for server status monitoring
    const startStatusMonitoring = () => {
      if (statusMonitorSocket) {
        statusMonitorSocket.close(); // Close existing monitor if any
      }
      statusMonitorSocket = new WebSocket(currentSettings.monitorUrl);
      statusMonitorSocket.onmessage = (evt) => {
        try {
          currentSettings.onServiceStatusUpdate(JSON.parse(evt.data));
        } catch (e) {
          currentSettings.onIssue(APP_ERROR_CODES.REMOTE_SERVICE_ERROR, `Failed to parse service status update: ${e.message}`);
        }
      };
      statusMonitorSocket.onerror = (err) => {
        currentSettings.onIssue(APP_ERROR_CODES.NETWORK_FAILURE, `Service status monitor error: ${err.message || err.type}`);
      };
    };

    // Private helper function: Retrieves a human-readable description for a service status code
    const getServiceStatusCodeDescription = (code) => {
      return SERVICE_STATUS_DESCRIPTIONS.get(code) || "Unknown service status code";
    };

  }; // End of SpeechTranscriptor class

  // Simple class for accumulating transcription segments.
  const TranscriptBuilder = function() {
    let segmentCounter = 0;
    const collectedSegments = []; // Stores objects like { text: "...", isFinal: true/false }

    this.appendSegment = function(segmentText, isFinalSegment) {
      if (isFinalSegment) {
        collectedSegments[segmentCounter] = {
          text: segmentText,
          isFinal: true
        };
        segmentCounter++;
      } else {
        // Overwrite the current non-final segment
        collectedSegments[segmentCounter] = {
          text: segmentText,
          isFinal: false
        };
      }
    };

    this.retrieveFullText = function() {
      // Filter out non-final segments if they exist at the end
      const finalTexts = collectedSegments
        .filter(segment => segment && segment.isFinal)
        .map(segment => segment.text);

      // If there's an active non-final segment, append it temporarily for display
      const currentNonFinal = collectedSegments[segmentCounter];
      if (currentNonFinal && !currentNonFinal.isFinal) {
        return [... finalTexts, currentNonFinal.text].join('. ');
      }

      return finalTexts.join('. ');
    };
  };

  // Expose classes to the global scope
  globalScope.SpeechTranscriptor = SpeechTranscriptor;
  globalScope.TranscriptBuilder = TranscriptBuilder;

})(window);