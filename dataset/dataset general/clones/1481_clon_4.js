(function (outerScope) {

    class SoundEmitter {
        #soundElement;
        #queuedAudioData;
        #currentSegmentPosition;
        #isDeviceConfigured;
        #playbackMonitorHandle;

        constructor() {
            this.#soundElement = new Audio();
            this.#queuedAudioData = [];
            this.#currentSegmentPosition = 0;
            this.#isDeviceConfigured = false;
            this.#playbackMonitorHandle = null;
        }

        static #convertFloatToBinaryBuffer(floatArrayInput) {
            const byteBuffer = new ArrayBuffer(floatArrayInput.length * Float32Array.BYTES_PER_ELEMENT);
            new Float32Array(byteBuffer).set(floatArrayInput);
            return byteBuffer;
        }

        static #encodeBufferToBase64(binaryBuffer) {
            const octetSequence = new Uint8Array(binaryBuffer);
            let rawBinaryString = '';
            for (let idx = 0; idx < octetSequence.byteLength; idx++) {
                rawBinaryString += String.fromCharCode(octetSequence[idx]);
            }
            return btoa(rawBinaryString);
        }

        static #decodeBase64ToBuffer(base64EncodedText) {
            const rawBinaryString = atob(base64EncodedText);
            const stringLength = rawBinaryString.length;
            const octetSequence = new Uint8Array(stringLength);
            for (let idx = 0; idx < stringLength; idx++) {
                octetSequence[idx] = rawBinaryString.charCodeAt(idx);
            }
            return octetSequence.buffer;
        }

        static #serializeFloatsToBase64(floatArrayToSerialize) {
            const intermediateBuffer = SoundEmitter.#convertFloatToBinaryBuffer(floatArrayToSerialize);
            return SoundEmitter.#encodeBufferToBase64(intermediateBuffer);
        }

        static #deserializeBase64ToFloats(base64TextToDeserialize) {
            const intermediateBuffer = SoundEmitter.#decodeBase64ToBuffer(base64TextToDeserialize);
            return new Float32Array(intermediateBuffer);
        }

        static #packageAudioChunk(channelsCount, sampleFrequencyValue, floatArrayData) {
            return JSON.stringify({
                channelCount: channelsCount,
                sampleFrequency: sampleFrequencyValue,
                dataContent: SoundEmitter.#serializeFloatsToBase64(floatArrayData)
            });
        }

        static #unpackAudioChunk(jsonAudioText) {
            const parsedObject = JSON.parse(jsonAudioText);
            return {
                channelCount: parsedObject.channelCount,
                sampleFrequency: parsedObject.sampleFrequency,
                floatData: SoundEmitter.#deserializeBase64ToFloats(parsedObject.dataContent)
            };
        }

        #processAudioOutputQueue() {
            if (this.#queuedAudioData.length === 0) {
                clearTimeout(this.#playbackMonitorHandle);
                this.#playbackMonitorHandle = null;
                return;
            }

            while (this.#queuedAudioData.length > 0) {
                let currentAudioBlock = this.#queuedAudioData[0];

                let bytesTransferred = this.#soundElement.mozWriteAudio(
                    currentAudioBlock.subarray(this.#currentSegmentPosition)
                );

                if (this.#currentSegmentPosition + bytesTransferred < currentAudioBlock.length) {
                    this.#currentSegmentPosition += bytesTransferred;
                    break;
                } else {
                    this.#queuedAudioData.shift();
                    this.#currentSegmentPosition = 0;
                }
            }

            if (this.#queuedAudioData.length > 0) {
                this.#playbackMonitorHandle = setTimeout(() => this.#processAudioOutputQueue(), 1);
            } else {
                clearTimeout(this.#playbackMonitorHandle);
                this.#playbackMonitorHandle = null;
            }
        }

        retrieveChannelCount() {
            return this.#soundElement.mozChannels;
        }

        initiatePlayback(mediaSourceUrl) {
            this.#isDeviceConfigured = true;
            this.#soundElement.src = mediaSourceUrl;
            this.#soundElement.load();
        }

        suspendOutput() {
            this.#soundElement.pause();
        }

        resumeOutput() {
            this.#soundElement.play();
        }

        querySampleFrequency() {
            return this.#soundElement.mozSampleRate;
        }

        registerStreamDataHandler(handlerCallbackFunction) {
            this.#soundElement.addEventListener('MozAudioAvailable', (eventPayload) => {
                eventPayload.audioData = SoundEmitter.#packageAudioChunk(
                    this.#soundElement.mozChannels,
                    this.#soundElement.mozSampleRate,
                    eventPayload.frameBuffer
                );
                return handlerCallbackFunction(eventPayload);
            }, false);
        }

        registerMetadataHandler(handlerCallbackFunction) {
            this.#soundElement.addEventListener('loadedmetadata', handlerCallbackFunction, false);
        }

        registerTimeUpdateHandler(handlerCallbackFunction) {
            this.#soundElement.addEventListener('timeupdate', handlerCallbackFunction, false);
        }

        adjustOutputVolume(levelValue) {
            if (typeof levelValue === 'number' && levelValue >= 0 && levelValue <= 1) {
                this.#soundElement.volume = levelValue;
            }
            return this.#soundElement.volume;
        }

        injectAudioPayload(encodedAudioChunk) {
            const decodedChunk = SoundEmitter.#unpackAudioChunk(encodedAudioChunk);

            if (!this.#isDeviceConfigured) {
                this.#soundElement.mozSetup(decodedChunk.channelCount, decodedChunk.sampleFrequency);
                this.#isDeviceConfigured = true;
            }

            this.#queuedAudioData.push(decodedChunk.floatData);

            if (this.#playbackMonitorHandle === null) {
                this.#playbackMonitorHandle = setTimeout(() => this.#processAudioOutputQueue(), 1);
            }
        }
    }

    SoundEmitter.createMediaPlayer = function (mediaSourceUrl) {
        const playerInstance = new SoundEmitter();
        playerInstance.initiatePlayback(mediaSourceUrl);
        return playerInstance;
    };

    outerScope.SoundEmitter = SoundEmitter;

})(window);