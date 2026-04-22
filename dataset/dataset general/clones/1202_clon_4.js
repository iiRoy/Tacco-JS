const browserStorage = {
  fetch: async (defaults) => {
    return new Promise(resolve => {
      chrome.storage.sync.get(defaults, resolve);
    });
  },
  commit: async (data) => {
    return new Promise(resolve => {
      chrome.storage.sync.set(data, resolve);
    });
  }
};

const MAXIMUM_MEDIA_RATE = 16;
const MINIMUM_MEDIA_RATE = 0.05;

class VideoControlPanel {
  #associatedMedia;
  #displaySpan;
  #mainContainer;
  #parentManager;

  constructor(mediaElement, manager) {
    this.#associatedMedia = mediaElement;
    this.#parentManager = manager;
    this.#constructUserInterface();
    this.#attachMediaListeners();
    this.#updateRateDisplay();
  }

  #constructUserInterface() {
    const doc = document;
    const makeElement = (tag, classes = [], text = '') => {
      const el = doc.createElement(tag);
      classes.forEach(cls => el.classList.add(cls));
      if (text) el.textContent = text;
      return el;
    };

    this.#mainContainer = makeElement('div', ['media-rate-adjuster']);
    const controlButtonsWrapper = makeElement('span', ['rate-actions']);

    const reverseButton = makeElement('button', [], '«');
    const slowButton = makeElement('button', [], '-');
    const fastButton = makeElement('button', [], '+');

    controlButtonsWrapper.appendChild(reverseButton);
    controlButtonsWrapper.appendChild(slowButton);
    controlButtonsWrapper.appendChild(fastButton);

    this.#displaySpan = makeElement('span', ['rate-value']);

    this.#mainContainer.appendChild(this.#displaySpan);
    this.#mainContainer.appendChild(controlButtonsWrapper);

    if (this.#associatedMedia.parentNode) {
      this.#associatedMedia.parentNode.insertBefore(this.#mainContainer, this.#associatedMedia);
      this.#associatedMedia.classList.add('enhanced-media-host');
    }

    this.#mainContainer.addEventListener('click', this.#handlePanelClick.bind(this), true);
    this.#mainContainer.addEventListener('dblclick', e => { e.preventDefault(); e.stopPropagation(); }, true);
    this.#mainContainer.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); }, true);
  }

  #attachMediaListeners() {
    this.#associatedMedia.addEventListener('play', this.#synchronizePlaybackRate.bind(this));
    this.#associatedMedia.addEventListener('ratechange', this.#updateRateDisplay.bind(this));
    this.#synchronizePlaybackRate();
  }

  #updateRateDisplay() {
    this.#displaySpan.textContent = parseFloat(this.#associatedMedia.playbackRate).toFixed(2);
  }

  #synchronizePlaybackRate() {
    const currentRate = this.#parentManager.fetchConfig('currentRateVal');
    if (!this.#parentManager.fetchConfig('persistRate')) {
      this.#associatedMedia.playbackRate = this.#parentManager.fetchConfig('initialRateVal');
    } else {
      this.#associatedMedia.playbackRate = currentRate;
    }
  }

  #handlePanelClick(event) {
    const targetButton = event.target;
    const commandMap = new Map([
      ['«', 'reverse'],
      ['-', 'decrease'],
      ['+', 'increase']
    ]);

    const command = commandMap.get(targetButton.textContent);

    if (command) {
      this.#parentManager.applyPlaybackCommand(command);
    } else {
      this.#associatedMedia.classList.add('disabled-enhancement');
      this.removePanel();
    }
    event.preventDefault();
    event.stopPropagation();
  }

  jumpBackward() {
    this.#associatedMedia.currentTime -= this.#parentManager.fetchConfig('jumpBackSeconds');
  }

  increaseRate() {
    const currentRate = this.#associatedMedia.playbackRate;
    const step = this.#parentManager.fetchConfig('rateStepDelta');
    const newRate = Math.min(currentRate + step, MAXIMUM_MEDIA_RATE);
    this.#setAndStoreRate(newRate);
  }

  decreaseRate() {
    const currentRate = this.#associatedMedia.playbackRate;
    const step = this.#parentManager.fetchConfig('rateStepDelta');
    const newRate = Math.max(currentRate - step, MINIMUM_MEDIA_RATE);
    this.#setAndStoreRate(newRate);
  }

  #setAndStoreRate(newRate) {
    this.#associatedMedia.playbackRate = newRate;
    this.#parentManager.updateStoredRate(newRate);
    this.#updateRateDisplay();
  }

  removePanel() {
    if (this.#mainContainer.parentNode) {
      this.#mainContainer.parentNode.removeChild(this.#mainContainer);
    }
    this.#associatedMedia.removeEventListener('play', this.#synchronizePlaybackRate);
    this.#associatedMedia.removeEventListener('ratechange', this.#updateRateDisplay);
    this.#associatedMedia.classList.remove('enhanced-media-host', 'disabled-enhancement');
  }

  get mediaElement() {
    return this.#associatedMedia;
  }
}

class MediaPlaybackManager {
  #configuration;
  #activePanels;
  #initializationTimer;
  #domObserver;

  constructor() {
    this.#configuration = new Map([
      ['initialRateVal', 1.0],
      ['rateStepDelta', 0.1],
      ['jumpBackSeconds', 10],
      ['keyBindReverse', 65], // A
      ['keyBindDecrease', 83], // S
      ['keyBindIncrease', 68], // D
      ['persistRate', false],
      ['currentRateVal', 1.0] // Will be overwritten by storage or initialRateVal
    ]);
    this.#activePanels = new Map();

    this.#loadConfiguration().then(() => {
      this.#initializationTimer = setInterval(this.#beginStartupSequence.bind(this), 10);
    });
  }

  async #loadConfiguration() {
    const defaultSettings = Object.fromEntries(this.#configuration);
    const stored = await browserStorage.fetch(defaultSettings);

    this.#configuration.set('initialRateVal', Number(stored.initialRateVal));
    this.#configuration.set('rateStepDelta', Number(stored.rateStepDelta));
    this.#configuration.set('jumpBackSeconds', Number(stored.jumpBackSeconds));
    this.#configuration.set('keyBindReverse', Number(stored.keyBindReverse));
    this.#configuration.set('keyBindDecrease', Number(stored.keyBindDecrease));
    this.#configuration.set('keyBindIncrease', Number(stored.keyBindIncrease));
    this.#configuration.set('persistRate', Boolean(stored.persistRate));
    
    if (stored.currentRateVal !== undefined && this.#configuration.get('persistRate')) {
      this.#configuration.set('currentRateVal', Number(stored.currentRateVal));
    } else {
      this.#configuration.set('currentRateVal', this.#configuration.get('initialRateVal'));
    }
  }

  updateStoredRate(newRate) {
    this.#configuration.set('currentRateVal', newRate);
    if (this.#configuration.get('persistRate')) {
      browserStorage.commit({ 'currentRateVal': newRate });
    }
  }

  fetchConfig(key) {
    return this.#configuration.get(key);
  }

  #beginStartupSequence() {
    if (document.readyState === 'complete') {
      clearInterval(this.#initializationTimer);
      this.#activateSystem();
    }
  }

  #activateSystem() {
    document.querySelectorAll('video').forEach(vid => this.#addVideoEnhancement(vid));

    this.#domObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'VIDEO') {
            this.#addVideoEnhancement(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('video').forEach(vid => this.#addVideoEnhancement(vid));
          }
        });
      });
    });
    this.#domObserver.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('keydown', this.#handleGlobalKeyInput.bind(this), true);
  }

  #addVideoEnhancement(videoElement) {
    if (!this.#activePanels.has(videoElement)) {
      const panel = new VideoControlPanel(videoElement, this);
      this.#activePanels.set(videoElement, panel);
    }
  }

  #removeVideoEnhancement(videoElement) {
    const panel = this.#activePanels.get(videoElement);
    if (panel) {
      panel.removePanel();
      this.#activePanels.delete(videoElement);
    }
  }

  applyPlaybackCommand(commandType) {
    this.#activePanels.forEach(panel => {
      if (!panel.mediaElement.paused && !panel.mediaElement.classList.contains('disabled-enhancement')) {
        switch (commandType) {
          case 'reverse':
            panel.jumpBackward();
            break;
          case 'increase':
            panel.increaseRate();
            break;
          case 'decrease':
            panel.decreaseRate();
            break;
        }
      }
    });
  }

  #handleGlobalKeyInput(event) {
    if (document.activeElement && document.activeElement.nodeName === 'INPUT' && document.activeElement.type === 'text') {
      return;
    }

    const uppercaseKey = String.fromCharCode(event.keyCode).toUpperCase().charCodeAt(0);

    if (uppercaseKey === this.#configuration.get('keyBindReverse')) {
      this.applyPlaybackCommand('reverse');
    } else if (uppercaseKey === this.#configuration.get('keyBindIncrease')) {
      this.applyPlaybackCommand('increase');
    } else if (uppercaseKey === this.#configuration.get('keyBindDecrease')) {
      this.applyPlaybackCommand('decrease');
    }
  }
}

new MediaPlaybackManager();