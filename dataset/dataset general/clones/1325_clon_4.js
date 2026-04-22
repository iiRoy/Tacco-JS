class ToneGenerator {
    constructor() {
        this.baseContext = new (window.AudioContext || window.webkitAudioContext)();

        this._primaryOscillator = this.baseContext.createOscillator();
        this._primaryMixer = this.baseContext.createGain();
        this._secondaryOscillator = this.baseContext.createOscillator();
        this._secondaryMixer = this.baseContext.createGain();
        this._frequencyFilter = this.baseContext.createBiquadFilter();
        this._modOscillator = this.baseContext.createOscillator();
        this._modGain = this.baseContext.createGain();
        this._amplitudeEnvelope = this.baseContext.createGain();
        this._masterVolume = this.baseContext.createGain();
        this._echoUnit = this._assembleEchoUnit();

        this._primaryOscillator.type = "sawtooth";
        this._secondaryOscillator.type = "sine";
        this._primaryMixer.gain.value = 0.75;
        this._secondaryMixer.gain.value = 0.75;
        this._modOscillator.type = "sine";
        this._modOscillator.frequency.value = 1;
        this._modGain.gain.value = 1000;
        this._frequencyFilter.type = "lowpass";
        this._frequencyFilter.frequency.value = 6666;
        this._frequencyFilter.Q.value = 10;
        this._amplitudeEnvelope.gain.value = 0.0;
        this._masterVolume.gain.value = 0.75;

        this._primaryOscillator.connect(this._primaryMixer);
        this._primaryMixer.connect(this._frequencyFilter);
        this._secondaryOscillator.connect(this._secondaryMixer);
        this._secondaryMixer.connect(this._frequencyFilter);
        this._frequencyFilter.connect(this._amplitudeEnvelope);
        this._amplitudeEnvelope.connect(this._echoUnit.entryPoint);
        this._echoUnit.exitPoint.connect(this._masterVolume);
        this._modOscillator.connect(this._modGain);
        this._modGain.connect(this._frequencyFilter.frequency);
        this._masterVolume.connect(this.baseContext.destination);

        this._primaryOscillator.start(0);
        this._secondaryOscillator.start(0);
        this._modOscillator.start(0);

        this.strikeDuration = 0.001;
        this.releaseDuration = 0.001;
        this.pitchRange = 1;
        this.sustainActive = false;
    }

    _assembleEchoUnit() {
        const entryPoint = this.baseContext.createGain();
        const exitPoint = this.baseContext.createGain();
        const delayComponent = this.baseContext.createDelay();
        const feedbackLoop = this.baseContext.createGain();
        const wetSignalLevel = this.baseContext.createGain();

        delayComponent.delayTime.value = 0.30;
        feedbackLoop.gain.value = 0.10;
        wetSignalLevel.gain.value = 0.5;

        entryPoint.connect(delayComponent);
        entryPoint.connect(exitPoint);
        delayComponent.connect(feedbackLoop);
        delayComponent.connect(wetSignalLevel);
        feedbackLoop.connect(delayComponent);
        wetSignalLevel.connect(exitPoint);

        return { entryPoint, exitPoint, delayComponent, feedbackLoop, wetSignalLevel };
    }

    setOscillatorPitch(frequency) {
        const adjustedFreq = frequency * this.pitchRange;
        this._primaryOscillator.frequency.value = adjustedFreq;
        this._secondaryOscillator.frequency.value = adjustedFreq;
    }

    triggerAttack() {
        const currentMoment = this.baseContext.currentTime;
        this._amplitudeEnvelope.gain.setTargetAtTime(1.0, currentMoment, (this.strikeDuration + 0.001));
    }

    triggerRelease() {
        const currentMoment = this.baseContext.currentTime;
        this._amplitudeEnvelope.gain.setTargetAtTime(0.0, currentMoment, (this.releaseDuration + 0.001));
    }

    setPrimaryOscVolume(level) { this._primaryMixer.gain.value = level; }
    setPrimaryOscDetune(value) { this._primaryOscillator.detune.value = value; }
    setPrimaryOscWaveform(type) { this._primaryOscillator.type = type; }

    setSecondaryOscVolume(level) { this._secondaryMixer.gain.value = level; }
    setSecondaryOscDetune(value) { this._secondaryOscillator.detune.value = value; }
    setSecondaryOscWaveform(type) { this._secondaryOscillator.type = type; }

    setWaveFilterType(type) { this._frequencyFilter.type = type; }
    setWaveFilterCutoff(value) { this._frequencyFilter.frequency.value = (value * 200); }
    setWaveFilterResonance(value) { this._frequencyFilter.Q.value = (value / 5); }

    setModulationFrequency(value) { this._modOscillator.frequency.value = (value / 10); }
    setModulationDepth(value) { this._modGain.gain.value = (value * 20); }
    setModulationWaveform(type) { this._modOscillator.type = type; }

    setEnvelopeAttack(value) { this.strikeDuration = (value / 60); }
    setEnvelopeDecay(value) { this.releaseDuration = (value / 60); }

    setEchoTime(value) { this._echoUnit.delayComponent.delayTime.value = (value / 100); }
    setEchoFeedback(value) { this._echoUnit.feedbackLoop.gain.value = (value / 100); }
    setEchoMixLevel(value) { this._echoUnit.wetSignalLevel.gain.value = (value / 100); }

    setMasterOutputLevel(value) { this._masterVolume.gain.value = (value / 100); }

    setOctaveRange(value) {
        switch (value) {
            case "-2": this.pitchRange = 0.25; break;
            case "-1": this.pitchRange = 0.5; break;
            case "+1": this.pitchRange = 2; break;
            case "+2": this.pitchRange = 4; break;
            default: this.pitchRange = 1; break;
        }
    }

    setSustainMode(active) {
        this.sustainActive = active;
        if (!active) {
            this.triggerRelease();
        }
    }
}

const PitchConverter = {
    _baseFrequencyC0: 16.351597831287414,
    _noteSemitoneMap: {
        'C': 0, 'CS': 1, 'D': 2, 'DS': 3, 'E': 4, 'F': 5,
        'FS': 6, 'G': 7, 'GS': 8, 'A': 9, 'AS': 10, 'B': 11
    },

    obtainFrequency(noteDescriptor) {
        const noteLetter = noteDescriptor.match(/^[A-G][S]?/)[0];
        const octaveNumber = parseInt(noteDescriptor.match(/\d+$/)[0], 10);
        const semitoneOffsetFromC = this._noteSemitoneMap[noteLetter];
        const totalSemitonesFromC0 = (octaveNumber * 12) + semitoneOffsetFromC;
        return this._baseFrequencyC0 * Math.pow(2, totalSemitonesFromC0 / 12);
    }
};

let mouseEngaged = false;

document.addEventListener('DOMContentLoaded', () => {
    const musicSynthesizer = new ToneGenerator();

    const controlMappings = [
        { elementId: 'oscillatorOneVolume', eventType: 'input', handler: val => musicSynthesizer.setPrimaryOscVolume(val / 100) },
        { elementId: 'oscillatorOneDetune', eventType: 'input', handler: musicSynthesizer.setPrimaryOscDetune },
        { elementId: 'oscillatorOneSelect', eventType: 'change', handler: musicSynthesizer.setPrimaryOscWaveform },
        { elementId: 'oscillatorTwoVolume', eventType: 'input', handler: val => musicSynthesizer.setSecondaryOscVolume(val / 100) },
        { elementId: 'oscillatorTwoDetune', eventType: 'input', handler: musicSynthesizer.setSecondaryOscDetune },
        { elementId: 'oscillatorTwoSelect', eventType: 'change', handler: musicSynthesizer.setSecondaryOscWaveform },
        { elementId: 'filterSelect', eventType: 'change', handler: musicSynthesizer.setWaveFilterType },
        { elementId: 'cutoff', eventType: 'input', handler: musicSynthesizer.setWaveFilterCutoff },
        { elementId: 'resonance', eventType: 'input', handler: musicSynthesizer.setWaveFilterResonance },
        { elementId: 'lfoFrequency', eventType: 'input', handler: musicSynthesizer.setModulationFrequency },
        { elementId: 'lfoDepth', eventType: 'input', handler: musicSynthesizer.setModulationDepth },
        { elementId: 'lfoSelect', eventType: 'change', handler: musicSynthesizer.setModulationWaveform },
        { elementId: 'attack', eventType: 'input', handler: musicSynthesizer.setEnvelopeAttack },
        { elementId: 'decay', eventType: 'input', handler: musicSynthesizer.setEnvelopeDecay },
        { elementId: 'delay_time', eventType: 'input', handler: musicSynthesizer.setEchoTime },
        { elementId: 'delay_feedback', eventType: 'input', handler: musicSynthesizer.setEchoFeedback },
        { elementId: 'delay_level', eventType: 'input', handler: musicSynthesizer.setEchoMixLevel },
        { elementId: 'volume', eventType: 'input', handler: musicSynthesizer.setMasterOutputLevel },
        { elementId: 'octaveControl', eventType: 'change', handler: musicSynthesizer.setOctaveRange },
        { elementId: 'hold', eventType: 'change', handler: val => musicSynthesizer.setSustainMode(val) }
    ];

    controlMappings.forEach(mapping => {
        const uiElement = document.getElementById(mapping.elementId);
        if (uiElement) {
            uiElement.addEventListener(mapping.eventType, (e) => {
                let processedValue;
                if (uiElement.type === 'checkbox') {
                    processedValue = e.target.checked;
                } else if (uiElement.tagName === 'SELECT') {
                    processedValue = e.target.value;
                } else {
                    processedValue = parseFloat(e.target.value);
                }
                mapping.handler(processedValue);
            });
        }
    });

    document.addEventListener('mousedown', () => { mouseEngaged = true; });
    document.addEventListener('mouseup', () => { mouseEngaged = false; });

    document.querySelectorAll('.key').forEach(keyNode => {
        keyNode.addEventListener('mousedown', (e) => {
            keyNode.classList.add('key_press');
            const noteId = keyNode.id;
            musicSynthesizer.setOscillatorPitch(PitchConverter.obtainFrequency(noteId));
            musicSynthesizer.triggerAttack();
        });

        keyNode.addEventListener('mouseup', (e) => {
            keyNode.classList.remove('key_press');
            if (!musicSynthesizer.sustainActive) {
                musicSynthesizer.triggerRelease();
            }
        });

        keyNode.addEventListener('mouseenter', (e) => {
            if (mouseEngaged) {
                keyNode.classList.add('key_press');
                const noteId = keyNode.id;
                musicSynthesizer.setOscillatorPitch(PitchConverter.obtainFrequency(noteId));
                musicSynthesizer.triggerAttack();
            }
        });

        keyNode.addEventListener('mouseleave', (e) => {
            keyNode.classList.remove('key_press');
            if (!musicSynthesizer.sustainActive) {
                musicSynthesizer.triggerRelease();
            }
        });
    });
});