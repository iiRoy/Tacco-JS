const StandardSpeeds = {
    motionPicture: 24,
    NTSC_Broadcast: 29.97,
    NTSC_Cinema: 23.98,
    NTSC_HighDef: 59.94,
    PAL_Standard: 25,
    PAL_HighDef: 50,
    webStandard: 30,
    highFrameRate: 60
};

const padDigit = (val) => (val < 10 ? '0' : '') + val;

const getPreciseTime = (timeValue) => parseFloat(timeValue.toFixed(5));

class MediaTimekeeper {
    constructor(setupObject) {
        if (this === window) {
            return new MediaTimekeeper(setupObject);
        }

        this.configuration = setupObject || {};
        this.playbackSpeedFactor = this.configuration.frameRate || 24;
        
        this.mediaElement = document.getElementById(this.configuration.id) || document.querySelector('video');
        this.monitoringIntervalId = null;
    }

    currentSequence() {
        return Math.floor(getPreciseTime(this.mediaElement.currentTime) * this.playbackSpeedFactor);
    }

    monitorProgress(outputStyle, updateFrequency) {
        if (!outputStyle) {
            console.warn('MediaTimekeeper: Warning - monitorProgress requires an output style parameter.');
            return;
        }

        const instanceRef = this;
        
        const formatterMap = {
            'SMPTE': () => instanceRef.generateSmpte(),
            'time': () => instanceRef.formatTimecode(),
            'frame': () => instanceRef.currentSequence()
        };

        this.monitoringIntervalId = setInterval(() => {
            if (instanceRef.mediaElement.paused || instanceRef.mediaElement.ended) {
                return;
            }
            const currentFormattedValue = formatterMap[outputStyle]();
            if (instanceRef.configuration.onProgressUpdate) {
                instanceRef.configuration.onProgressUpdate(currentFormattedValue, outputStyle);
            }
            return currentFormattedValue;
        }, (updateFrequency ? updateFrequency : 500 / instanceRef.playbackSpeedFactor));
    }

    haltMonitoring() {
        if (this.monitoringIntervalId) {
            clearInterval(this.monitoringIntervalId);
            this.monitoringIntervalId = null;
        }
    }

    get speedPresets() {
        return StandardSpeeds;
    }

    formatTimecode(timeInSecondsOptional) {
        let actualTime = (typeof timeInSecondsOptional === 'number') ? timeInSecondsOptional : this.mediaElement.currentTime;

        let totalHours = Math.floor(actualTime / 3600);
        let remainingSecondsAfterHours = actualTime % 3600;
        let totalMinutes = Math.floor(remainingSecondsAfterHours / 60);
        let remainingSeconds = Math.floor(remainingSecondsAfterHours % 60);
        let fractionalSeconds = actualTime - Math.floor(actualTime);
        let frameComponent = Math.floor(fractionalSeconds * this.playbackSpeedFactor);

        let formattedOutput = `${padDigit(totalHours)}:${padDigit(totalMinutes)}:${padDigit(remainingSeconds)}`;
        
        if (typeof timeInSecondsOptional === 'number') {
            formattedOutput += `:${padDigit(frameComponent)}`;
        }
        return formattedOutput;
    }

    generateSmpte(frameIndexOptional) {
        if (!frameIndexOptional && frameIndexOptional !== 0) {
            return this.formatTimecode(this.mediaElement.currentTime);
        }

        let inputFrame = Number(frameIndexOptional);
        let fps = this.playbackSpeedFactor;

        let totalSeconds = Math.floor(inputFrame / fps);

        let totalHours = Math.floor(totalSeconds / 3600);
        let totalMinutes = Math.floor((totalSeconds % 3600) / 60);
        let totalRemainingSeconds = Math.floor(totalSeconds % 60);
        let frameRemainder = inputFrame % fps;

        return `${padDigit(totalHours)}:${padDigit(totalMinutes)}:${padDigit(totalRemainingSeconds)}:${padDigit(frameRemainder)}`;
    }

    calculateSeconds(smpteStringOptional) {
        if (!smpteStringOptional) {
            return Math.floor(this.mediaElement.currentTime);
        }
        const parts = smpteStringOptional.split(':').map(part => parseInt(part, 10));
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }

    calculateMilliseconds(smpteStringOptional) {
        let framePart;
        if (!smpteStringOptional) {
            framePart = parseInt(this.generateSmpte().split(':')[3], 10);
        } else {
            const parts = smpteStringOptional.split(':');
            framePart = parts.length === 4 ? parseInt(parts[3], 10) : 0;
        }
        
        const frameMillis = (1000 / this.playbackSpeedFactor) * (isNaN(framePart) ? 0 : framePart);
        return Math.floor((this.calculateSeconds(smpteStringOptional) * 1000) + frameMillis);
    }

    calculateTotalFrames(smpteStringOptional) {
        const timeComponents = (!smpteStringOptional) ? this.generateSmpte().split(':') : smpteStringOptional.split(':');
        const fps = this.playbackSpeedFactor;

        const hoursInFrames = parseInt(timeComponents[0], 10) * 3600 * fps;
        const minutesInFrames = parseInt(timeComponents[1], 10) * 60 * fps;
        const secondsInFrames = parseInt(timeComponents[2], 10) * fps;
        const framesRemainder = parseInt(timeComponents[3], 10);

        return Math.floor(hoursInFrames + minutesInFrames + secondsInFrames + framesRemainder);
    }

    _adjustPlaybackPosition(movementDirection, frameCount) {
        if (!this.mediaElement.paused) {
            this.mediaElement.pause();
        }
        const currentFrame = this.currentSequence();
        const targetFrame = (movementDirection === 'backward' ? (currentFrame - frameCount) : (currentFrame + frameCount));
        this.mediaElement.currentTime = (targetFrame / this.playbackSpeedFactor) + 0.00001;
    }

    moveForward(frameCount = 1, completionCallback) {
        this._adjustPlaybackPosition('forward', Number(frameCount));
        return (completionCallback ? completionCallback() : true);
    }

    moveBackward(frameCount = 1, completionCallback) {
        this._adjustPlaybackPosition('backward', Number(frameCount));
        return (completionCallback ? completionCallback() : true);
    }

    jumpToPoint(targetSettings) {
        const inputConfig = targetSettings || {};
        let desiredTimeInSeconds;

        const conversionMap = {
            'SMPTE': (val) => this.calculateMilliseconds(val) / 1000 + 0.001,
            'time': (val) => this.calculateMilliseconds(val) / 1000 + 0.001,
            'frame': (val) => this.calculateMilliseconds(this.generateSmpte(val)) / 1000 + 0.001,
            'seconds': (val) => Number(val),
            'milliseconds': (val) => Number(val) / 1000 + 0.001
        };

        for (const key in inputConfig) {
            if (conversionMap[key]) {
                desiredTimeInSeconds = conversionMap[key](inputConfig[key]);
                break;
            }
        }
        
        if (!isNaN(desiredTimeInSeconds)) {
            this.mediaElement.currentTime = desiredTimeInSeconds;
        }
    }
}