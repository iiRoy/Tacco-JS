(function(globalScopeObject) {

    // Core system parameters
    const AUDIO_SERVICE_URL = 'wss://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/speech';
    const SERVICE_HEALTH_ENDPOINT = 'wss://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/status';
    const TRANSCRIPT_UPLOAD_FACILITY = 'http://bark.phon.ioc.ee:82/dev/duplex-speech-api/dynamic/reference';
    const MEDIA_FORMAT_SPECIFIER = "content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1";
    // Transmit data blocks at a consistent rate, per documentation.
    const SEND_CHUNK_DELAY = 0xFA;
    const SENTENCE_TERMINATOR_MARKER = "E-O-S";
    const AUDIO_PROCESSOR_SCRIPT_LOCATION = 'audioProcessorWorker.js';

    // Problem identifiers (mirroring Android system errors)
    const FAULT_COMMUNICATION = 0x02;
    const FAULT_SOUND_INPUT = 0x03;
    const FAULT_BACKEND_SERVICE = 0x04;
    const FAULT_USER_AGENT = 0x05;

    // Notification identifiers for internal operations
    const NOTIF_AWAITING_MIC_ACCESS = 1;
    const NOTIF_STREAM_ESTABLISHED = 2;
    const NOTIF_PROCESSOR_INITIALIZED = 3;
    const NOTIF_DATA_CAPTURE_ACTIVE = 4;
    const NOTIF_DATA_TRANSMITTED = 5;
    const NOTIF_EMPTY_TRANSMISSION = 6;
    const NOTIF_EOS_TRANSMITTED = 7;
    const NOTIF_SOCKET_MESSAGE = 8;
    const NOTIF_SOCKET_CONNECTED = 9;
    const NOTIF_SOCKET_DISCONNECTED = 10;
    const NOTIF_CAPTURE_HALTED = 11;
    const NOTIF_ENDPOINT_MODIFIED = 12;

    // Backend service status codes
    // Derived from https://github.com/alumae/kaldi-gstreamer-server
    const SERVICE_STATE_CODES = {
        0: 'OperationSuccessful', // Typically indicates successful recognition data delivery
        1: 'SilenceDetected', // Input audio predominantly contained silence or non-speech elements
        2: 'ProcessAborted', // Recognition task was terminated prematurely
        9: 'ResourcesUnavailable', // All recognition resources are currently occupied, cannot process request
    };

    // Components initialized during setup
    let soundProcessingContext;
    let audioCaptureDevice;
    // Components initialized upon starting transcription
    let communicationSocket;
    let transmissionTimerId;
    // Component for monitoring service health
    let serviceHealthSocket;

    const SpeechTranscriptor = function(initialOptions) {
        let settings = initialOptions || {};
        settings.audioServiceUrl = settings.audioServiceUrl || AUDIO_SERVICE_URL;
        settings.serviceHealthEndpoint = settings.serviceHealthEndpoint || SERVICE_HEALTH_ENDPOINT;
        settings.transcriptUploadFacility = settings.transcriptUploadFacility || TRANSCRIPT_UPLOAD_FACILITY;
        settings.mediaFormatSpecifier = settings.mediaFormatSpecifier || MEDIA_FORMAT_SPECIFIER;
        settings.sendChunkDelay = settings.sendChunkDelay || SEND_CHUNK_DELAY;
        settings.audioProcessorScriptLocation = settings.audioProcessorScriptLocation || AUDIO_PROCESSOR_SCRIPT_LOCATION;
        settings.onReadyForCapture = settings.onReadyForCapture || function() {};
        settings.onCaptureEnd = settings.onCaptureEnd || function() {};
        settings.onProvisionalText = settings.onProvisionalText || function(interimData) {};
        settings.onFinalText = settings.onFinalText || function(finalData) {};
        settings.onSessionConcluded = settings.onSessionConcluded || function() {};
        settings.onNotification = settings.onNotification || function(eventType, eventPayload) {};
        settings.onProblem = settings.onProblem || function(errorType, errorDetails) {};
        settings.onServiceHealthUpdate = settings.onServiceHealthUpdate || null;
        settings.animationFrameCallback = settings.animationFrameCallback || function(frameTimestamp) {};
        if (settings.onServiceHealthUpdate) {
            trackServiceHealth();
        }

        // Exposes the current configuration object
        this.retrieveConfiguration = function() {
            return settings;
        };

        // Prepares the audio capture system (requests microphone access)
        // This function initializes the soundProcessingContext.
        // It can be safely invoked multiple times.
        // TODO: Implement a success callback, currently NOTIF_PROCESSOR_INITIALIZED is used.
        this.initializeCapture = function() {
            settings.onNotification(NOTIF_AWAITING_MIC_ACCESS, "Seeking authorization to utilize your microphone ...");
            try {
                globalScopeObject.AudioContext = globalScopeObject.AudioContext || globalScopeObject.webkitAudioContext;
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                globalScopeObject.URL = globalScopeObject.URL || globalScopeObject.webkitURL;
                soundProcessingContext = new AudioContext();
            } catch (contextError) {
                // Example: Firefox 24 might report TypeError: AudioContext is not a constructor.
                // Solution: Enable media.webaudio.enabled in about:config.
                settings.onProblem(FAULT_USER_AGENT, "Failed to initialize Web Audio API: " + contextError);
            }

            if (navigator.getUserMedia) {
                navigator.getUserMedia({
                    audio: true
                }, commenceMediaCapture, function(mediaError) {
                    settings.onProblem(FAULT_USER_AGENT, "No live audio input available: " + mediaError);
                });
            } else {
                settings.onProblem(FAULT_USER_AGENT, "User media API not supported by this browser.");
            }
        };

        // Initiates audio recording and transcription transmission
        this.beginTranscription = function() {
            if (!audioCaptureDevice) {
                settings.onProblem(FAULT_SOUND_INPUT, "Audio capture device is not defined.");
                return;
            }

            if (communicationSocket) {
                this.abortOperation();
            }

            try {
                communicationSocket = establishCommunicationSocket();
            } catch (socketCreationError) {
                settings.onProblem(FAULT_USER_AGENT, "WebSocket functionality not available in this browser!");
            }
        };

        // Halts current transcription, stopping recording and new data transmission.
        this.haltTranscription = function() {
            // Discontinue periodic audio data transmissions
            clearInterval(transmissionTimerId);
            // Stop the recording process
            if (audioCaptureDevice) {
                audioCaptureDevice.stop();
                settings.onNotification(NOTIF_CAPTURE_HALTED, 'Audio capture stopped');
                // Send any remaining buffered audio data to the service
                audioCaptureDevice.export16kMono(function(finalAudioBlob) {
                    transmitDataViaSocket(finalAudioBlob);
                    transmitDataViaSocket(SENTENCE_TERMINATOR_MARKER);
                    audioCaptureDevice.clear();
                }, 'audio/x-raw');
                settings.onCaptureEnd();
            } else {
                settings.onProblem(FAULT_SOUND_INPUT, "Audio capture device is not defined.");
            }
        };

        // Terminates all ongoing operations without awaiting server responses.
        this.abortOperation = function() {
            // Clear any active periodic audio data transmissions
            clearInterval(transmissionTimerId);
            if (audioCaptureDevice) {
                audioCaptureDevice.stop();
                audioCaptureDevice.clear();
                settings.onNotification(NOTIF_CAPTURE_HALTED, 'Recording operation aborted');
            }
            if (communicationSocket) {
                communicationSocket.close();
                communicationSocket = null;
            }
        };

        // Configures the URL for the audio processing backend service.
        this.setAudioService = function(newServiceUrl) {
            settings.audioServiceUrl = newServiceUrl;
            settings.onNotification(NOTIF_ENDPOINT_MODIFIED, 'Audio service endpoint updated: ' + newServiceUrl);
        };

        // Configures the URL for the service health monitoring endpoint.
        this.setServiceHealthMonitor = function(newHealthEndpoint) {
            settings.serviceHealthEndpoint = newHealthEndpoint;

            if (settings.onServiceHealthUpdate) {
                trackServiceHealth();
            }

            settings.onNotification(NOTIF_ENDPOINT_MODIFIED, 'Service health endpoint updated: ' + newHealthEndpoint);
        };

        // Dispatches reference textual content to the speech service.
        this.submitReferenceTranscript = function(referenceTextContent, onSuccessHandler, onFailureHandler) {
            let requestHeaders = {};
            if (settings.userIdentity) {
                requestHeaders["User-Id"] = settings.userIdentity;
            }
            if (settings.contentIdentifier) {
                requestHeaders["Content-Id"] = settings.contentIdentifier;
            }
            jQuery.ajax({
                url: settings.transcriptUploadFacility,
                type: "POST",
                headers: requestHeaders,
                data: referenceTextContent,
                dataType: "text",
                success: onSuccessHandler,
                error: onFailureHandler,
            });
        };

        // Internal utility functions
        function commenceMediaCapture(mediaStream) {
            let audioInputSource = soundProcessingContext.createMediaStreamSource(mediaStream);
            settings.onNotification(NOTIF_STREAM_ESTABLISHED, 'Media stream successfully created');

            // Expose the analyzer node globally for debugging/visualization
            globalScopeObject.speechAudioAnalyzer = soundProcessingContext.createAnalyser();
            audioInputSource.connect(globalScopeObject.speechAudioAnalyzer);

            settings.animationFrameCallback();

            audioCaptureDevice = new Recorder(audioInputSource, {
                workerPath: settings.audioProcessorScriptLocation
            });
            settings.onNotification(NOTIF_PROCESSOR_INITIALIZED, 'Audio processor initialized');
        }

        function transmitDataViaSocket(dataPacket) {
            if (communicationSocket) {
                let socketState = communicationSocket.readyState;
                if (socketState === 1) { // WebSocket.OPEN
                    // Check if the dataPacket is an audio blob instance
                    if (dataPacket instanceof Blob) {
                        if (dataPacket.size > 0) {
                            communicationSocket.send(dataPacket);
                            settings.onNotification(NOTIF_DATA_TRANSMITTED, 'Sent blob: ' + dataPacket.type + ', size: ' + dataPacket.size);
                        } else {
                            settings.onNotification(NOTIF_EMPTY_TRANSMISSION, 'Sent blob: ' + dataPacket.type + ', EMPTY data');
                        }
                        // Otherwise, it's the EOS string marker
                    } else {
                        communicationSocket.send(dataPacket);
                        settings.onNotification(NOTIF_EOS_TRANSMITTED, 'Sent marker: ' + dataPacket);
                    }
                } else {
                    settings.onProblem(FAULT_COMMUNICATION, 'WebSocket state not OPEN (readyState=' + socketState + "): failed to transmit: " + dataPacket);
                }
            } else {
                settings.onProblem(FAULT_USER_AGENT, 'No active WebSocket connection: failed to transmit: ' + dataPacket);
            }
        }


        function establishCommunicationSocket() {
            // Alternative: consider using a specific WebSocket protocol, e.g., "echo-protocol".
            // let newSocket = new WebSocket("ws://127.0.0.1:8081", "echo-protocol");
            let socketEndpoint = settings.audioServiceUrl + '?' + settings.mediaFormatSpecifier;
            if (settings.userIdentity) {
                socketEndpoint += '&user-id=' + settings.userIdentity;
            }
            if (settings.contentIdentifier) {
                socketEndpoint += '&content-id=' + settings.contentIdentifier;
            }
            let newSocket = new WebSocket(socketEndpoint);

            newSocket.onmessage = function(socketEvent) {
                let receivedData = socketEvent.data;
                settings.onNotification(NOTIF_SOCKET_MESSAGE, receivedData);
                if (receivedData instanceof Object && !(receivedData instanceof Blob)) {
                    settings.onProblem(FAULT_BACKEND_SERVICE, 'WebSocket: message received was an Object but not a Blob.');
                } else if (receivedData instanceof Blob) {
                    settings.onProblem(FAULT_BACKEND_SERVICE, 'WebSocket: received a Blob type message.');
                } else {
                    let parsedResponse = JSON.parse(receivedData);
                    if (parsedResponse.status === 0) {
                        if (parsedResponse.result.isFinal) {
                            settings.onFinalText(parsedResponse.result.suggestions);
                        } else {
                            settings.onProvisionalText(parsedResponse.result.suggestions);
                        }
                    } else {
                        settings.onProblem(FAULT_BACKEND_SERVICE, 'Service error: ' + parsedResponse.status + ': ' + retrieveStatusCodeDescription(parsedResponse.status));
                    }
                }
            };

            // Begin recording only after the WebSocket connection is successfully established.
            newSocket.onopen = function(socketEvent) {
                transmissionTimerId = setInterval(function() {
                    audioCaptureDevice.export16kMono(function(audioChunk) {
                        transmitDataViaSocket(audioChunk);
                        audioCaptureDevice.clear();
                    }, 'audio/x-raw');
                }, settings.sendChunkDelay);
                // Start the actual audio capture
                audioCaptureDevice.record();
                settings.onReadyForCapture();
                settings.onNotification(NOTIF_SOCKET_CONNECTED, socketEvent);
            };

            // This closure can occur if the transmitted data exceeded size limits,
            // e.g., "Frame size of 65580 bytes exceeds maximum accepted frame size".
            // Refer to WebSocket status codes:
            // http://tools.ietf.org/html/rfc6455#section-7.4.1
            // 1005: No status code present
            // 1006: Abnormal closure
            newSocket.onclose = function(socketEvent) {
                let closeCode = socketEvent.code;
                let closeReason = socketEvent.reason;
                let isCleanClosure = socketEvent.wasClean;
                // The backend service might close the connection primarily
                // when its end-of-speech detection triggers.
                settings.onSessionConcluded();
                settings.onNotification(NOTIF_SOCKET_DISCONNECTED, closeCode + "/" + closeReason + "/" + isCleanClosure);
            };

            newSocket.onerror = function(socketEvent) {
                let errorDetails = socketEvent.data;
                settings.onProblem(FAULT_COMMUNICATION, errorDetails);
            };

            return newSocket;
        }


        function trackServiceHealth() {
            if (serviceHealthSocket) {
                serviceHealthSocket.close();
            }
            serviceHealthSocket = new WebSocket(settings.serviceHealthEndpoint);
            serviceHealthSocket.onmessage = function(statusEvent) {
                settings.onServiceHealthUpdate(JSON.parse(statusEvent.data));
            };
        }


        function retrieveStatusCodeDescription(statusIdentifier) {
            if (statusIdentifier in SERVICE_STATE_CODES) {
                return SERVICE_STATE_CODES[statusIdentifier];
            }
            return "Unrecognized error status";
        }


    };

    // A utility class for aggregating transcribed text segments.
    // If isFinalSegment is true, a new line is typically started in the display list.
    const TextAggregator = function(opts) {
        let currentLineIndex = 0;
        let collectedSegments = [];

        this.appendSegment = function(segmentContent, isFinalSegment) {
            collectedSegments[currentLineIndex] = segmentContent;
            if (isFinalSegment) {
                currentLineIndex++;
            }
        };

        this.generateFullText = function() {
            return collectedSegments.join(' ');
        };
    };

    globalScopeObject.SpeechTranscriptor = SpeechTranscriptor;
    globalScopeObject.TextAggregator = TextAggregator;

})(window);