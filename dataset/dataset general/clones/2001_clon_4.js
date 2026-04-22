class SoundSculptor {
    constructor(clipPath = '') {
        this.audioElement = new Audio();
        this.audioElement.preload = 'auto';
        this.eventObservers = {};

        this.audioElement.oncanplaythrough = () => this.triggerEvent('ready');
        this.audioElement.onloadeddata = () => this.triggerEvent('dataLoaded');
        this.audioElement.onended = () => this.triggerEvent('finished');
        this.audioElement.onseeked = () => this.triggerEvent('seekOperationComplete');
        this.audioElement.onerror = (err) => this.triggerEvent('playbackError', err);

        if (clipPath) {
            this.prepareSource(clipPath);
        }
    }

    registerListener(eventName, callback) {
        if (!this.eventObservers[eventName]) {
            this.eventObservers[eventName] = [];
        }
        this.eventObservers[eventName].push(callback);
    }

    removeListener(eventName, callback) {
        if (this.eventObservers[eventName]) {
            this.eventObservers[eventName] = this.eventObservers[eventName].filter(
                (cb) => cb !== callback
            );
        }
    }

    triggerEvent(eventName, data = null) {
        if (this.eventObservers[eventName]) {
            this.eventObservers[eventName].forEach((callback) => callback(data));
        }
    }

    prepareSource(sourceURL) {
        this.audioElement.src = sourceURL;
    }

    initiatePlayback() {
        this.audioElement.play().catch(error => {
            console.warn("Playback prevented (user gesture likely required):", error);
        });
    }

    pausePlayback() {
        this.audioElement.pause();
    }

    terminatePlaybackAndReset() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
    }

    setCycleState(shouldLoop) {
        this.audioElement.loop = shouldLoop;
    }

    setSoundLevel(level) {
        this.audioElement.volume = level;
    }

    setMuteState(isMuted) {
        this.audioElement.muted = isMuted;
    }

    setCurrentMoment(seconds) {
        this.audioElement.currentTime = seconds;
    }

    get currentMoment() {
        return this.audioElement.currentTime;
    }

    get totalDuration() {
        return this.audioElement.duration;
    }

    get readyForPlayback() {
        return this.audioElement.readyState >= 3;
    }

    set autoPlayEnabled(isEnabled) {
        this.audioElement.autoplay = isEnabled;
    }
}

console.log('Utilizing custom audio framework.');

console.log("assaultNoise: commenciung load…");

const assaultNoise = new SoundSculptor();

const beginAssaultBtn = document.getElementById("play-attack");
beginAssaultBtn.disabled = true;

assaultNoise.registerListener("ready", () => {
    console.log("assaultNoise: readiness achieved!");
    beginAssaultBtn.disabled = false;
});

beginAssaultBtn.addEventListener("click", () => {
    assaultNoise.setCurrentMoment(0);
    assaultNoise.initiatePlayback();
}, false);

assaultNoise.prepareSource("audio/demoblin_attacks.mp3");

const repeatAssaultToggle = document.getElementById("loop-attack");
repeatAssaultToggle.addEventListener("click", () => {
    assaultNoise.setCycleState(repeatAssaultToggle.checked);
}, false);

const loudnessAssaultSlider = document.getElementById("volume-attack");
loudnessAssaultSlider.addEventListener("change", () => {
    assaultNoise.setSoundLevel(Number(loudnessAssaultSlider.value));
}, false);

const marketMelody = new SoundSculptor("audio/shop.mp3");
marketMelody.setCycleState(true);
marketMelody.autoPlayEnabled = true;

marketMelody.registerListener("seekOperationComplete", () => {
    console.log('seek event completed!');
});

const startMarketBtn = document.getElementById("play-shop");
startMarketBtn.addEventListener("click", () => {
    marketMelody.initiatePlayback();
}, false);

const pauseMarketBtn = document.getElementById("pause-shop");
pauseMarketBtn.addEventListener("click", () => {
    marketMelody.pausePlayback();
}, false);

const haltMarketBtn = document.getElementById("stop-shop");
haltMarketBtn.addEventListener("click", () => {
    marketMelody.terminatePlaybackAndReset();
}, false);

const marketProgressionDisplay = document.getElementById("current-time-shop");
let marketTimerHandle;

marketTimerHandle = setInterval(() => {
    const currentMoment = marketMelody.currentMoment;
    const totalDuration = marketMelody.totalDuration;
    marketProgressionDisplay.innerHTML = `${Math.round(currentMoment)}/${Math.floor(totalDuration)}`;
}, 50);

const adjustMarketTimeBtn = document.getElementById("set-current-time-shop");
adjustMarketTimeBtn.addEventListener("click", () => {
    const marketTimeValueInput = document.getElementById("current-time-value-shop");
    marketMelody.setCurrentMoment(Number(marketTimeValueInput.value));
});

const marketLoudnessInput = document.getElementById("volume-shop");
const setMarketLoudnessBtn = document.getElementById("set-volume-shop");
setMarketLoudnessBtn.addEventListener("click", () => {
    marketMelody.setSoundLevel(Number(marketLoudnessInput.value));
});

const silenceMarketToggle = document.getElementById("mute-shop");
silenceMarketToggle.addEventListener("click", () => {
    marketMelody.setMuteState(silenceMarketToggle.checked);
}, false);