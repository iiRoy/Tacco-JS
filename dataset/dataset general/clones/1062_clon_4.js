(function(globalScope) {
    const AudioStreamManager = (function() {
        let communicationChannel = null;
        let outgoingDataPipe = null;
        let transmissionStatus = false;
        let audioProcessingContext = null;
        let audioFrameProcessor = null;

        // Utility for converting float audio data to integer
        function reformatSoundData(floatArrayBuffer) {
            const dataLength = floatArrayBuffer.length;
            const int16Array = new Int16Array(dataLength);
            for (let index = 0; index < dataLength; ++index) {
                int16Array[index] = floatArrayBuffer[index] * 65535; // Multiplier for 16-bit conversion
            }
            return int16Array.buffer; // Return the underlying ArrayBuffer
        }

        // Configures the Web Audio API graph for processing
        async function configureAudioPipeline(mediaInputFlow) {
            try {
                const SoundSystemOrchestrator = globalScope.AudioContext || globalScope.webkitAudioContext;
                audioProcessingContext = new SoundSystemOrchestrator();

                const mediaSourceNode = audioProcessingContext.createMediaStreamSource(mediaInputFlow);
                const frameBufferSize = 2048; // Consistent buffer size
                audioFrameProcessor = audioProcessingContext.createScriptProcessor(frameBufferSize, 1, 1);

                audioFrameProcessor.onaudioprocess = function(processingEvent) {
                    if (!transmissionStatus) {
                        return;
                    }
                    console.log('Audio data being transmitted'); // Equivalent log message
                    const monoChannelData = processingEvent.inputBuffer.getChannelData(0);
                    outgoingDataPipe.write(reformatSoundData(monoChannelData));
                };

                mediaSourceNode.connect(audioFrameProcessor);
                audioFrameProcessor.connect(audioProcessingContext.destination);
            } catch (err) {
                console.error('Issue setting up audio processing chain:', err);
                globalScope.alert('Failed to prepare audio processing.');
            }
        }

        // Requests access to the user's microphone
        async function requestMicrophoneAccess() {
            const mediaRequirements = { audio: true };
            try {
                const streamObject = await (globalScope.navigator.mediaDevices && globalScope.navigator.mediaDevices.getUserMedia
                    ? globalScope.navigator.mediaDevices.getUserMedia(mediaRequirements)
                    : new Promise((resolve, reject) => {
                        const legacyMicrophoneAccess = globalScope.navigator.getUserMedia || globalScope.navigator.webkitGetUserMedia ||
                                                   globalScope.navigator.mozGetUserMedia || globalScope.navigator.msGetUserMedia;
                        if (legacyMicrophoneAccess) {
                            legacyMicrophoneAccess(mediaRequirements, resolve, reject);
                        } else {
                            reject(new Error('Microphone input not supported by this browser.'));
                        }
                    }));
                await configureAudioPipeline(streamObject);
            } catch (error) {
                console.error('Error obtaining microphone stream:', error);
                globalScope.alert('Could not access microphone: ' + error.message);
            }
        }

        // Establishes the WebSocket connection and sets up event listeners
        function initializeNetworkLink() {
            communicationChannel = new globalScope.BinaryClient('ws://localhost:9001');

            communicationChannel.on('open', async function() {
                outgoingDataPipe = communicationChannel.createStream();
                await requestMicrophoneAccess();
            });

            communicationChannel.on('error', function(err) {
                console.error('Network communication error:', err);
                globalScope.alert('Connection issue encountered.');
            });

            communicationChannel.on('close', function() {
                console.log('Network link disconnected.');
                transmissionStatus = false;
                if (audioFrameProcessor && audioProcessingContext) {
                    audioFrameProcessor.disconnect();
                    // audioProcessingContext.close(); // Optional: close context if no longer needed
                }
            });
        }

        initializeNetworkLink(); // Begin connection process immediately

        // Public interface for controlling audio transmission
        return {
            beginTransmission: function() {
                transmissionStatus = true;
            },
            endTransmission: function() {
                transmissionStatus = false;
                if (outgoingDataPipe) {
                    outgoingDataPipe.end();
                }
            }
        };
    })();

    // Expose the audio transmission control object globally
    globalScope.AudioDataTransmitter = AudioStreamManager;

})(this);