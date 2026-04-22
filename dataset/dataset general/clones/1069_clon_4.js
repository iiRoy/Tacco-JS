const GLOBAL_AUDIO_HZ = 44100;

class SoundEmitter {
    #sourceProvider;
    #playbackController;

    constructor(sourceProvider, playConfig = {}) {
        this.#sourceProvider = sourceProvider;

        const { playbackLag = 1 } = playConfig;
        const intervalPollingMs = playbackLag * 100;

        const audioUnitProbe = document.createElement('audio');

        if (audioUnitProbe.mozSetup) {
            this.#playbackController = new MozAudioProcessor(this.#sourceProvider, audioUnitProbe, playbackLag, GLOBAL_AUDIO_HZ, intervalPollingMs);
        } else if (window.AudioContext || window.webkitAudioContext) {
            this.#playbackController = new WebAudioProcessor(this.#sourceProvider, playbackLag);
        } else {
            this.#playbackController = new FlashAudioProcessor(this.#sourceProvider, playbackLag, GLOBAL_AUDIO_HZ, intervalPollingMs);
        }
    }

    haltPlayback() {
        if (this.#playbackController) {
            this.#playbackController.disengage();
        }
    }

    getUnitType() {
        return this.#playbackController ? this.#playbackController.unitIdentifier() : 'None';
    }

    getBufferedDurationMs() {
        if (this.#playbackController && typeof this.#playbackController.getCurrentBufferTime === 'function') {
            return this.#playbackController.getCurrentBufferTime();
        }
        return 0;
    }
}

class MozAudioProcessor {
    #dataSource;
    #audioDevice;
    #terminationRequested = false;
    #dataReservoir = [];
    #minimumReservoirVolume;
    #fillIncrementSize;
    #monitoringIntervalId;

    constructor(sourceProvider, audioElem, playbackLag, currentSampleRate, checkIntervalMs) {
        this.#dataSource = sourceProvider;
        this.#audioDevice = audioElem;

        this.#audioDevice.mozSetup(2, currentSampleRate);

        this.#minimumReservoirVolume = playbackLag * 2 * currentSampleRate;
        this.#fillIncrementSize = Math.floor(playbackLag * currentSampleRate);

        this.#monitoringIntervalId = setInterval(() => this.#maintainBuffer(), checkIntervalMs);
        this.#maintainBuffer();
    }

    #maintainBuffer() {
        if (this.#dataReservoir.length > 0) {
            const writtenSamples = this.#audioDevice.mozWriteAudio(this.#dataReservoir);
            this.#dataReservoir = this.#dataReservoir.slice(writtenSamples);
        }

        if (this.#dataReservoir.length < this.#minimumReservoirVolume && !this.#dataSource.finished) {
            this.#dataReservoir = this.#dataReservoir.concat(this.#dataSource.generate(this.#fillIncrementSize));
        }

        if (this.#terminationRequested && this.#dataSource.finished && this.#dataReservoir.length === 0) {
            clearInterval(this.#monitoringIntervalId);
        }
    }

    disengage() {
        this.#terminationRequested = true;
    }

    unitIdentifier() {
        return 'Mozilla Audio Stream';
    }
}

class WebAudioProcessor {
    #dataSource;
    #audioGraph;
    #processorNode;
    #outputChannels = 2;
    #frameCapacity = 16384;
    #currentSampleRate;

    constructor(sourceProvider, playbackLag) {
        this.#dataSource = sourceProvider;
        const ContextConstructor = window.AudioContext || window.webkitAudioContext;
        this.#audioGraph = new ContextConstructor();
        this.#currentSampleRate = this.#audioGraph.sampleRate;

        this.#processorNode = this.#audioGraph.createScriptProcessor(this.#frameCapacity, 0, this.#outputChannels);
        this.#processorNode.onaudioprocess = (audioEvent) => this.#processAudioFrames(audioEvent);

        this.#processorNode.connect(this.#audioGraph.destination);
    }

    #processAudioFrames(audioEvent) {
        if (this.#dataSource.finished) {
            this.disengage();
            return;
        }

        const outputLeftChannel = audioEvent.outputBuffer.getChannelData(0);
        const outputRightChannel = audioEvent.outputBuffer.getChannelData(1);

        const generatedFrames = this.#dataSource.generate(this.#frameCapacity);

        let frameIndex = 0;
        while (frameIndex < this.#frameCapacity) {
            outputLeftChannel[frameIndex] = generatedFrames[frameIndex * 2];
            outputRightChannel[frameIndex] = generatedFrames[frameIndex * 2 + 1];
            frameIndex++;
        }
    }

    disengage() {
        if (this.#processorNode) {
            this.#processorNode.disconnect();
            if (typeof this.#audioGraph.close === 'function') {
                this.#audioGraph.close();
            }
        }
    }

    unitIdentifier() {
        return 'Web Audio API Engine';
    }
}

class FlashAudioProcessor {
    #dataSource;
    #flashObjectReference;
    #minimumBufferMilliseconds;
    #dataBatchSize;
    #monitoringIntervalId;
    #shutdownRequested = false;

    constructor(sourceProvider, playbackLag, currentSampleRate, checkIntervalMs) {
        this.#dataSource = sourceProvider;

        const flashMarkup = '<embed type="application/x-shockwave-flash" id="sound-driver-swf" src="da.swf" width="8" height="8" allowScriptAccess="always" style="position: fixed; left:-10px;" />';
        document.body.insertAdjacentHTML('beforeend', flashMarkup);
        this.#flashObjectReference = document.getElementById('sound-driver-swf');

        this.#minimumBufferMilliseconds = playbackLag * 1000;
        this.#dataBatchSize = playbackLag * currentSampleRate;

        this.#awaitFlashReadiness(checkIntervalMs);
    }

    #serializeAndTransmit(audioData) {
        const serializedOutput = audioData.map(val => Math.floor(val * 32768)).join(' ');
        return this.#flashObjectReference.write(serializedOutput);
    }

    #monitorFlashBuffer() {
        if (this.#flashObjectReference.bufferedDuration() < this.#minimumBufferMilliseconds) {
            this.#serializeAndTransmit(this.#dataSource.generate(this.#dataBatchSize));
        }
        if (this.#shutdownRequested || this.#dataSource.finished) {
            clearInterval(this.#monitoringIntervalId);
            if (this.#shutdownRequested) {
                this.#flashObjectReference.stop();
            }
        }
    }

    #awaitFlashReadiness(pollingDelay) {
        if (this.#flashObjectReference && typeof this.#flashObjectReference.write === 'function') {
            this.#monitoringIntervalId = setInterval(() => this.#monitorFlashBuffer(), pollingDelay);
            this.#monitorFlashBuffer();
        } else {
            setTimeout(() => this.#awaitFlashReadiness(pollingDelay), 10);
        }
    }

    disengage() {
        this.#shutdownRequested = true;
    }

    getCurrentBufferTime() {
        return this.#flashObjectReference ? this.#flashObjectReference.bufferedDuration() : 0;
    }

    unitIdentifier() {
        return 'Legacy Flash Audio';
    }
}