(function(globalScope){

    // Configuration constants - completely different names and organization
    const OperationPresets = Object.freeze({
        SPEECH_SERVICE_URL: "ws://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/speech",
        STATUS_SERVICE_URL: "ws://bark.phon.ioc.ee:82/dev/duplex-speech-api/ws/status",
        REFERENCE_DATA_SUBMIT_URL: "http://bark.phon.ioc.ee:82/dev/duplex-speech-api/dynamic/reference",
        AUDIO_STREAM_MIME_TYPE: "content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)16000,+format=(string)S16LE,+channels=(int)1",
        AUDIO_CHUNK_PERIOD_MS: 250,
        WORKER_SCRIPT_LOCATION: 'recorderWorker.js',
        END_OF_TRANSMISSION_MARKER: "EOS",

        // Fault codes (mostly following Android error names and codes)
        FAULT_COMMUNICATION: 2,
        FAULT_SOUND_CAPTURE: 3,
        FAULT_BACKEND_ISSUE: 4,
        FAULT_CLIENT_SIDE: 5,

        // Notification codes
        NOTIFY_MIC_ACCESS_WAIT: 1,
        NOTIFY_STREAM_ACQUIRED: 2,
        NOTIFY_CAPTURE_UNIT_INIT: 3,
        NOTIFY_CAPTURING_AUDIO: 4,
        NOTIFY_DATA_SENT: 5,
        NOTIFY_EMPTY_DATA_SENT: 6,
        NOTIFY_EOT_SENT: 7,
        NOTIFY_SOCKET_DATA_RECEIVE: 8,
        NOTIFY_SOCKET_CONNECTION_ESTABLISHED: 9,
        NOTIFY_SOCKET_CONNECTION_CLOSED: 10,
        NOTIFY_CAPTURE_STOPPED: 11,
        NOTIFY_DESTINATION_MODIFIED: 12,

        // Backend status interpretations
        BACKEND_STATUS_MAPPINGS: {
            0: 'Operation Successful',
            1: 'No Voice Detected',
            2: 'Process Interrupted',
            9: 'Service Capacity Reached',
        }
    });

    // Default configuration for the main speech processing class
    const DefaultProcessingOptions = Object.freeze({
        speechServiceUri: OperationPresets.SPEECH_SERVICE_URL,
        statusServiceUri: OperationPresets.STATUS_SERVICE_URL,
        referenceSubmitUri: OperationPresets.REFERENCE_DATA_SUBMIT_URL,
        audioEncoding: OperationPresets.AUDIO_STREAM_MIME_TYPE,
        transmissionInterval: OperationPresets.AUDIO_CHUNK_PERIOD_MS,
        captureWorkerPath: OperationPresets.WORKER_SCRIPT_LOCATION,
        onCaptureReady: () => {},
        onCaptureEnded: () => {},
        onInterimResult: () => {},
        onFinalResult: () => {},
        onProcessingComplete: () => {},
        onNotification: () => {},
        onProblem: () => {},
        onServiceStatusUpdate: null, // If null, status monitoring is off
        onAnimationFrame: () => {},
        userIdentification: null,
        contentIdentification: null
    });

    class VoiceStreamProcessor {
        #configuration;
        #audioDeviceContext;
        #audioCaptureModule;
        #transmissionSocket;
        #scheduledTransmissionHandle;
        #serviceStatusSocket;

        constructor(clientOptions) {
            this.#configuration = { ...DefaultProcessingOptions, ...clientOptions };

            if (this.#configuration.onServiceStatusUpdate) {
                this.#initiateServiceStatusMonitor();
            }
        }

        // Public API methods - Renamed
        retrieveCurrentConfiguration() {
            return this.#configuration;
        }

        async setupAudioEnvironment() {
            this.#configuration.onNotification(OperationPresets.NOTIFY_MIC_ACCESS_WAIT, "Awaiting microphone access permission...");

            try {
                globalScope.AudioContext = globalScope.AudioContext || globalScope.webkitAudioContext;
                this.#audioDeviceContext = new globalScope.AudioContext();
            } catch (error) {
                this.#configuration.onProblem(OperationPresets.FAULT_CLIENT_SIDE, "Failed to initialize Web Audio API: " + error.message);
                return;
            }

            if (!globalScope.navigator.mediaDevices || !globalScope.navigator.mediaDevices.getUserMedia) {
                this.#configuration.onProblem(OperationPresets.FAULT_CLIENT_SIDE, "User media API not supported by browser.");
                return;
            }

            try {
                const stream = await globalScope.navigator.mediaDevices.getUserMedia({ audio: true });
                await this.#processMediaStream(stream);
            } catch (error) {
                this.#configuration.onProblem(OperationPresets.FAULT_CLIENT_SIDE, "Microphone access denied or unavailable: " + error.message);
            }
        }

        beginSpeechTransmission() {
            if (!this.#audioCaptureModule) {
                this.#configuration.onProblem(OperationPresets.FAULT_SOUND_CAPTURE, "Audio capture module not initialized.");
                return;
            }

            if (this.#transmissionSocket) {
                this.terminateCurrentSession();
            }

            try {
                this.#establishTransmissionSocket();
            } catch (error) {
                this.#configuration.onProblem(OperationPresets.FAULT_CLIENT_SIDE, "WebSockets not supported by browser!");
            }
        }

        stopSpeechTransmission() {
            clearTimeout(this.#scheduledTransmissionHandle);
            if (this.#audioCaptureModule) {
                this.#audioCaptureModule.stop();
                this.#configuration.onNotification(OperationPresets.NOTIFY_CAPTURE_STOPPED, 'Audio capture halted');
                this.#audioCaptureModule.export16kMono(audioBlob => {
                    this.#sendDataViaSocket(audioBlob);
                    this.#sendDataViaSocket(OperationPresets.END_OF_TRANSMISSION_MARKER);
                    this.#audioCaptureModule.clear();
                }, 'audio/x-raw');
                this.#configuration.onCaptureEnded();
            } else {
                this.#configuration.onProblem(OperationPresets.FAULT_SOUND_CAPTURE, "Audio capture module not initialized.");
            }
        }

        terminateCurrentSession() {
            clearTimeout(this.#scheduledTransmissionHandle);
            if (this.#audioCaptureModule) {
                this.#audioCaptureModule.stop();
                this.#audioCaptureModule.clear();
                this.#configuration.onNotification(OperationPresets.NOTIFY_CAPTURE_STOPPED, 'Audio capture halted');
            }
            if (this.#transmissionSocket) {
                this.#transmissionSocket.close();
                this.#transmissionSocket = null;
            }
        }

        updateSpeechServiceEndpoint(newAddress) {
            this.#configuration.speechServiceUri = newAddress;
            this.#configuration.onNotification(OperationPresets.NOTIFY_DESTINATION_MODIFIED, 'Speech service endpoint updated: ' + newAddress);
        }

        updateStatusServiceEndpoint(newAddress) {
            this.#configuration.statusServiceUri = newAddress;
            if (this.#configuration.onServiceStatusUpdate) {
                this.#initiateServiceStatusMonitor();
            }
            this.#configuration.onNotification(OperationPresets.NOTIFY_DESTINATION_MODIFIED, 'Status service endpoint updated: ' + newAddress);
        }

        async submitReferenceInformation(textPayload, successHandler, errorHandler) {
            const requestHeaders = new Headers();
            if (this.#configuration.userIdentification) {
                requestHeaders.append("User-Id", this.#configuration.userIdentification);
            }
            if (this.#configuration.contentIdentification) {
                requestHeaders.append("Content-Id", this.#configuration.contentIdentification);
            }

            try {
                const response = await fetch(this.#configuration.referenceSubmitUri, {
                    method: "POST",
                    headers: requestHeaders,
                    body: textPayload
                });
                if (response.ok) {
                    const responseText = await response.text();
                    successHandler(responseText);
                } else {
                    errorHandler(new Error(`Reference submission failed: ${response.status} ${response.statusText}`));
                }
            } catch (error) {
                errorHandler(error);
            }
        }

        // Private helper methods - Renamed and using # prefix
        async #processMediaStream(stream) {
            const audioInput = this.#audioDeviceContext.createMediaStreamSource(stream);
            this.#configuration.onNotification(OperationPresets.NOTIFY_STREAM_ACQUIRED, 'Media stream successfully obtained');

            // make the analyser available in window context
            globalScope.userSpeechAnalyser = this.#audioDeviceContext.createAnalyser();
            audioInput.connect(globalScope.userSpeechAnalyser);
            this.#configuration.onAnimationFrame();

            this.#audioCaptureModule = new globalScope.Recorder(audioInput, { workerPath : this.#configuration.captureWorkerPath });
            this.#configuration.onNotification(OperationPresets.NOTIFY_CAPTURE_UNIT_INIT, 'Audio capture module prepared');
        }

        #sendDataViaSocket(dataItem) {
            if (this.#transmissionSocket) {
                const currentSocketState = this.#transmissionSocket.readyState;
                if (currentSocketState === WebSocket.OPEN) {
                    if (dataItem instanceof Blob) {
                        if (dataItem.size > 0) {
                            this.#transmissionSocket.send(dataItem);
                            this.#configuration.onNotification(OperationPresets.NOTIFY_DATA_SENT, 'Transmitted blob: ' + dataItem.type + ', size: ' + dataItem.size);
                        } else {
                            this.#configuration.onNotification(OperationPresets.NOTIFY_EMPTY_DATA_SENT, 'Transmitted empty blob: ' + dataItem.type);
                        }
                    } else { // Assuming it's the EOT string
                        this.#transmissionSocket.send(dataItem);
                        this.#configuration.onNotification(OperationPresets.NOTIFY_EOT_SENT, 'Transmitted marker: ' + dataItem);
                    }
                } else {
                    this.#configuration.onProblem(OperationPresets.FAULT_COMMUNICATION, 'WebSocket state not open (' + currentSocketState + '): failed to transmit data.');
                }
            } else {
                this.#configuration.onProblem(OperationPresets.FAULT_CLIENT_SIDE, 'No active WebSocket connection: transmission failed.');
            }
        }

        #establishTransmissionSocket() {
            let socketUri = new URL(this.#configuration.speechServiceUri);
            // Extract the actual content type value from the full string
            const mimeTypeParam = this.#configuration.audioEncoding.split('content-type=')[1];
            if (mimeTypeParam) {
                socketUri.searchParams.append('content-type', mimeTypeParam);
            }
            
            if (this.#configuration.userIdentification) {
                socketUri.searchParams.append('user-id', this.#configuration.userIdentification);
            }
            if (this.#configuration.contentIdentification) {
                socketUri.searchParams.append('content-id', this.#configuration.contentIdentification);
            }
            this.#transmissionSocket = new globalScope.WebSocket(socketUri.toString());

            this.#transmissionSocket.onmessage = event => {
                this.#configuration.onNotification(OperationPresets.NOTIFY_SOCKET_DATA_RECEIVE, event.data);
                if (event.data instanceof Object && !(event.data instanceof Blob)) {
                    this.#configuration.onProblem(OperationPresets.FAULT_BACKEND_ISSUE, 'WebSocket message contained unexpected object type.');
                } else if (event.data instanceof Blob) {
                    this.#configuration.onProblem(OperationPresets.FAULT_BACKEND_ISSUE, 'WebSocket message contained Blob data (unexpected for transcription results).');
                } else {
                    try {
                        const parsedResult = JSON.parse(event.data);
                        if (parsedResult.status === 0) {
                            if (parsedResult.result.final) {
                                this.#configuration.onFinalResult(parsedResult.result.hypotheses);
                            } else {
                                this.#configuration.onInterimResult(parsedResult.result.hypotheses);
                            }
                        } else {
                            this.#configuration.onProblem(OperationPresets.FAULT_BACKEND_ISSUE, 'Service error: ' + parsedResult.status + ': ' + VoiceStreamProcessor.#interpretStatusCode(parsedResult.status));
                        }
                    } catch (parseError) {
                        this.#configuration.onProblem(OperationPresets.FAULT_CLIENT_SIDE, 'Failed to parse WebSocket message: ' + parseError.message);
                    }
                }
            };

            this.#transmissionSocket.onopen = () => {
                // Use recursive setTimeout instead of setInterval for better control and to avoid queuing
                this.#scheduledTransmissionHandle = setTimeout(() => this.#performAudioChunkTransmission(), this.#configuration.transmissionInterval);
                this.#audioCaptureModule.record();
                this.#configuration.onCaptureReady();
                this.#configuration.onNotification(OperationPresets.NOTIFY_SOCKET_CONNECTION_ESTABLISHED, 'WebSocket connection opened.');
            };

            this.#transmissionSocket.onclose = event => {
                this.#configuration.onProcessingComplete();
                this.#configuration.onNotification(OperationPresets.NOTIFY_SOCKET_CONNECTION_CLOSED, `Connection closed: ${event.code}/${event.reason}/${event.wasClean}`);
            };

            this.#transmissionSocket.onerror = event => {
                this.#configuration.onProblem(OperationPresets.FAULT_COMMUNICATION, 'WebSocket error occurred.');
            };
        }

        #performAudioChunkTransmission() {
            if (!this.#audioCaptureModule || !this.#transmissionSocket || this.#transmissionSocket.readyState !== WebSocket.OPEN) {
                return;
            }

            this.#audioCaptureModule.export16kMono(audioBlob => {
                this.#sendDataViaSocket(audioBlob);
                this.#audioCaptureModule.clear();
                this.#scheduledTransmissionHandle = setTimeout(() => this.#performAudioChunkTransmission(), this.#configuration.transmissionInterval);
            }, 'audio/x-raw');
        }

        #initiateServiceStatusMonitor() {
            if (this.#serviceStatusSocket) {
                this.#serviceStatusSocket.close();
            }
            this.#serviceStatusSocket = new globalScope.WebSocket(this.#configuration.statusServiceUri);
            this.#serviceStatusSocket.onmessage = event => {
                try {
                    this.#configuration.onServiceStatusUpdate(JSON.parse(event.data));
                } catch (error) {
                    this.#configuration.onProblem(OperationPresets.FAULT_CLIENT_SIDE, 'Failed to parse status message: ' + error.message);
                }
            };
            this.#serviceStatusSocket.onerror = event => {
                this.#configuration.onProblem(OperationPresets.FAULT_COMMUNICATION, 'Status WebSocket error occurred.');
            };
        }

        static #interpretStatusCode(code) {
            return OperationPresets.BACKEND_STATUS_MAPPINGS[code] || "Unknown Service Status";
        }
    }

    // Helper class for assembling transcription - Renamed
    class SpeechLog {
        #logEntries = [];
        #currentEntryIndex = 0;

        appendEntry(textSegment, isFinalSegment) {
            this.#logEntries[this.#currentEntryIndex] = textSegment;
            if (isFinalSegment) {
                this.#currentEntryIndex++;
            }
        }

        composeFullLog() {
            return this.#logEntries.join('. ');
        }
    }

    globalScope.VoiceStreamProcessor = VoiceStreamProcessor;
    globalScope.SpeechLog = SpeechLog;

})(window);