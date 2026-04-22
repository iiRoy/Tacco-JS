"use strict";

class SignalBroadcaster {
    #subscribers = new Map();

    register(eventTag, handlerFunction) {
        if (!this.#subscribers.has(eventTag)) {
            this.#subscribers.set(eventTag, new Set());
        }
        this.#subscribers.get(eventTag).add(handlerFunction);
    }

    deregister(eventTag, handlerFunction) {
        if (this.#subscribers.has(eventTag)) {
            this.#subscribers.get(eventTag).delete(handlerFunction);
            if (this.#subscribers.get(eventTag).size === 0) {
                this.#subscribers.delete(eventTag);
            }
        }
    }

    deregisterAll(eventTag) {
        this.#subscribers.delete(eventTag);
    }
    
    clearAllRegistrations() {
        this.#subscribers.clear();
    }

    notify(eventTag, ...payload) {
        if (this.#subscribers.has(eventTag)) {
            [...this.#subscribers.get(eventTag)].forEach(callback => {
                try {
                    callback(...payload);
                } catch (err) {
                    console.error(`Error in event handler for ${eventTag}:`, err);
                }
            });
        }
    }
}

const ConfigurationParser = {
    retrieveValue: (sourceMap, keyName, fallback) => {
        let outcome = sourceMap[keyName];
        if (outcome === undefined || outcome === null) {
            if (keyName !== 'auto') { // Original's 'auto' fallback logic
                return ConfigurationParser.retrieveValue(sourceMap, 'auto', fallback);
            }
            return fallback;
        }
        if (typeof outcome === 'string') {
            const lowerOutcome = outcome.toLowerCase();
            if (lowerOutcome === 'false') {
                return false;
            }
            const parsedNumber = parseInt(outcome, 10);
            if (isNaN(parsedNumber)) {
                return fallback;
            }
            return parsedNumber;
        }
        return outcome;
    }
};

class PresentationConductor {
    #displayContainer;
    #settings;
    #presentationContent;
    #signalEmitter = new SignalBroadcaster();
    
    #currentOperationMarker = 0;
    #nextInteractionPoint = 0;
    #concurrentTaskCount = 0;
    #lastObservedHash = -1;
    #autoAdvanceIntervalId = 0;
    #activeActionSequence = null; // Promise representing the current action chain

    // Cached DOM references
    #advanceButton;
    #recedeButton;
    #contentDisplayArea;
    #pointerVisual;
    #pausedPointerIcon;
    #normalPointerIcon;
    #loadingOverlay;

    constructor(targetDomSelector, parameterMap) {
        this.#displayContainer = document.querySelector(targetDomSelector);
        if (!this.#displayContainer) {
            throw new Error(`Display container not found: ${targetDomSelector}`);
        }

        this.#settings = Object.freeze({
            autoAdvanceDelay: ConfigurationParser.retrieveValue(parameterMap, 'autoplay', 5000),
            autoInitiateDelay: ConfigurationParser.retrieveValue(parameterMap, 'autostart', 5000),
            autoRepeatDelay: ConfigurationParser.retrieveValue(parameterMap, 'autoloop', 5000)
        });

        this.#advanceButton = this.#displayContainer.querySelector('.next');
        this.#recedeButton = this.#displayContainer.querySelector('.previous');
        this.#contentDisplayArea = this.#displayContainer.querySelector('.object-list');
        this.#pointerVisual = this.#displayContainer.querySelector('.mouse-cursor');
        this.#pausedPointerIcon = this.#displayContainer.querySelector('.mouse-cursor-pause');
        this.#normalPointerIcon = this.#displayContainer.querySelector('.mouse-cursor-normal');
        this.#loadingOverlay = document.getElementById('loading');

        this.#initializeInternalEventHandlers();
    }

    #initializeInternalEventHandlers() {
        this.#signalEmitter.register('progressionRequested', this.#processProgression.bind(this));
        this.#signalEmitter.register('retrogressionRequested', this.#processRetrogression.bind(this));
        this.#signalEmitter.register('singleTaskFinished', this.#handleSingleTaskCompletion.bind(this));
        this.#signalEmitter.register('singleTaskStarted', this.#handleSingleTaskCommencement.bind(this));
    }

    async #processProgression() {
        window.clearTimeout(this.#autoAdvanceIntervalId);

        this.#enableInteractiveMode();
        this.#interruptAllActiveSequences();

        let primaryActionIndex = this.#nextInteractionPoint;
        let isDependentOnly = true; // For 'withPrevious' actions
        this.#nextInteractionPoint++; 
        this.#currentOperationMarker = this.#nextInteractionPoint; 

        const concurrentActions = [];
        const deferredActions = []; // Actions triggered 'afterPrevious'

        while (this.#presentationContent.action[this.#currentOperationMarker] && isDependentOnly) {
            const currentItem = this.#presentationContent.action[this.#currentOperationMarker];
            switch (currentItem.trigger) {
                case 'onClick':
                    this.#nextInteractionPoint = this.#currentOperationMarker;
                    isDependentOnly = false;
                    break;
                case 'withPrevious':
                    concurrentActions.push(currentItem);
                    break;
                case 'afterPrevious':
                    deferredActions.push(currentItem);
                    let tempNext = this.#currentOperationMarker;
                    while (this.#presentationContent.action[tempNext] && this.#presentationContent.action[tempNext].trigger !== 'onClick') {
                        tempNext++;
                    }
                    this.#nextInteractionPoint = tempNext;
                    isDependentOnly = false;
                    break;
            }
            this.#currentOperationMarker++;
        }

        const mainItem = this.#presentationContent.action[primaryActionIndex];
        const allConcurrentPromises = [];
        if (mainItem) {
            allConcurrentPromises.push(this.#executePresentationItem(mainItem));
        }
        concurrentActions.forEach(item => allConcurrentPromises.push(this.#executePresentationItem(item)));

        this.#activeActionSequence = Promise.all(allConcurrentPromises)
            .then(() => {
                if (deferredActions.length > 0) {
                    this.#signalEmitter.deregisterAll('allTasksCompleted');
                    deferredActions.forEach(item => {
                        this.#signalEmitter.register('allTasksCompleted', () => {
                            this.#executePresentationItem(item);
                        });
                    });
                }
            })
            .catch(error => console.error("Presentation sequence error:", error))
            .finally(() => {
                this.#activeActionSequence = null;
            });

        if (this.#nextInteractionPoint > this.#presentationContent.action.length) {
            this.#nextInteractionPoint = this.#presentationContent.action.length;
        }
    }

    async #processRetrogression() {
        this.#interruptAllActiveSequences();
        
        let previousTarget = this.#nextInteractionPoint - 1;
        const itemsToReverse = [];

        while (previousTarget >= 0 && this.#presentationContent.action[previousTarget] && this.#presentationContent.action[previousTarget].trigger !== 'onClick') {
            itemsToReverse.push(this.#presentationContent.action[previousTarget]);
            previousTarget--;
        }
        if (previousTarget >= 0) {
            itemsToReverse.push(this.#presentationContent.action[previousTarget]);
        }

        for (const item of itemsToReverse.reverse()) {
            await this.#reversePresentationItem(item);
        }

        this.#currentOperationMarker = Math.max(0, previousTarget);
        this.#nextInteractionPoint = Math.max(0, previousTarget);
    }

    #handleSingleTaskCompletion() {
        this.#concurrentTaskCount--;
        if (this.#concurrentTaskCount === 0) {
            this.#signalEmitter.notify('allTasksCompleted');
            this.#resetCompletionListeners();

            this.#disableInteractiveMode();
            if (this.#settings.autoAdvanceDelay && this.#concurrentTaskCount === 0) {
                this.#autoAdvanceIntervalId = window.setTimeout(() => {
                    this.#signalEmitter.notify('progressionRequested');
                }, this.#settings.autoAdvanceDelay);
            }

            let allFinished = true;
            if (this.#presentationContent && this.#presentationContent.action) {
                const lastClickIndex = this.#presentationContent.action.findIndex((a, i) => i >= this.#nextInteractionPoint && a.trigger === 'onClick');
                if (lastClickIndex === -1 && this.#nextInteractionPoint >= this.#presentationContent.action.length) {
                    allFinished = true;
                } else {
                    allFinished = false;
                }
            }
            
            if (allFinished && this.#settings.autoRepeatDelay && this.#concurrentTaskCount === 0) {
                window.setTimeout(() => {
                    this.#resetDisplayState();
                    this.#beginAutoInitiationMaybe();
                }, this.#settings.autoRepeatDelay);
            }
        }
    }

    #handleSingleTaskCommencement() {
        this.#concurrentTaskCount++;
    }

    #interruptAllActiveSequences() {
        this.#resetCompletionListeners();
        this.#concurrentTaskCount = 0;
        window.clearTimeout(this.#autoAdvanceIntervalId);
        // For actual DOM animations, this would involve stopping CSS transitions/animations
        // For a Type IV, we conceptually "stop" by clearing timers and resetting state.
    }

    #resetCompletionListeners() {
        this.#signalEmitter.deregisterAll('allTasksCompleted');
    }

    #enableInteractiveMode() {
        if (this.#pausedPointerIcon) this.#pausedPointerIcon.style.display = 'none';
        if (this.#normalPointerIcon) this.#normalPointerIcon.style.display = 'block';
    }

    #disableInteractiveMode() {
        if (this.#pausedPointerIcon) this.#pausedPointerIcon.style.display = 'block';
        if (this.#normalPointerIcon) this.#normalPointerIcon.style.display = 'none';
    }

    async #executePresentationItem(item) {
        if (item && typeof item.execute === 'function') {
            try {
                await item.execute(this.#signalEmitter, this.#displayContainer);
            } catch (error) {
                console.error("Presentation item execution failed:", error);
            }
        }
    }

    async #reversePresentationItem(item) {
        if (item && typeof item.executeReverse === 'function') {
            try {
                await item.executeReverse(this.#displayContainer);
            } catch (error) {
                console.error("Presentation item reversal failed:", error);
            }
        }
    }

    #retrieveForwardPath(markerId) {
        const path = [];
        const startIdx = this.#nextInteractionPoint;
        for (let i = startIdx; i < this.#presentationContent.action.length; i++) {
            const currentItem = this.#presentationContent.action[i];
            if (currentItem.id == markerId) { // Loose comparison as in original
                return path;
            }
            path.push(currentItem);
        }
        return null;
    }

    #retrieveBackwardPath(markerId) {
        const path = [];
        const startIdx = this.#nextInteractionPoint - 1;
        for (let i = startIdx; i >= 0; i--) {
            const currentItem = this.#presentationContent.action[i];
            path.push(currentItem);
            if (currentItem.id == markerId) { // Loose comparison as in original
                return path;
            }
        }
        return null;
    }

    #jumpToMarker(markerId) {
        if (markerId === '') {
            return;
        }

        this.#interruptAllActiveSequences();

        const markerPosition = this.#presentationContent.action.findIndex(item => item.id == markerId);

        if (markerPosition === -1) {
            console.warn(`Marker '${markerId}' not found.`);
            return;
        }

        if (markerPosition >= this.#nextInteractionPoint) { // Forward jump
            const path = this.#retrieveForwardPath(markerId);
            if (path) {
                path.forEach(item => {
                    if (item.applyState) item.applyState(this.#displayContainer);
                });
                this.#nextInteractionPoint += path.length;
            }
        } else { // Backward jump
            const path = this.#retrieveBackwardPath(markerId);
            if (path) {
                path.reverse().forEach(item => { // Apply in visual reversal order
                    if (item.executeReverse) item.executeReverse(this.#displayContainer);
                });
                this.#nextInteractionPoint = markerPosition;
            }
        }
        this.#currentOperationMarker = this.#nextInteractionPoint;
    }

    #resetDisplayState() {
        window.clearTimeout(this.#autoAdvanceIntervalId);

        this.#currentOperationMarker = 0;
        this.#nextInteractionPoint = 0;
        this.#concurrentTaskCount = 0;

        if (this.#contentDisplayArea) {
            Array.from(this.#contentDisplayArea.children).forEach(child => {
                child.style.display = 'none';
            });
        }

        if (this.#presentationContent && this.#presentationContent.metaData) {
            const initialBgIdentifier = this.#presentationContent.metaData.initialBackgroundId;
            if (initialBgIdentifier) {
                const initialBgElement = this.#displayContainer.querySelector(`.${initialBgIdentifier}`);
                if (initialBgElement) initialBgElement.style.display = 'block';
            }

            if (this.#pointerVisual) {
                const { initialMouseY, imageHeight, initialMouseX, imageWidth } = this.#presentationContent.metaData;
                this.#pointerVisual.style.top = `${initialMouseY * imageHeight}px`;
                this.#pointerVisual.style.left = `${initialMouseX * imageWidth}px`;
                this.#pointerVisual.style.display = 'block';
            }
        }
    }

    #beginAutoInitiationMaybe() {
        if (this.#settings.autoInitiateDelay) {
            this.#autoAdvanceIntervalId = window.setTimeout(() => {
                this.#signalEmitter.notify('progressionRequested');
            }, this.#settings.autoInitiateDelay);
        }
    }

    async acquireSourceData(sourceAddress) {
        try {
            const serverResponse = await fetch(sourceAddress);
            if (!serverResponse.ok) {
                throw new Error(`HTTP fetch error! Status: ${serverResponse.status}`);
            }
            const rawSource = await serverResponse.json();
            this.processContentData(rawSource);
        } catch (err) {
            console.error("Failed to retrieve presentation data:", err);
            throw err;
        }
    }

    processContentData(rawContentJson) {
        const contentProcessor = dahuapp.createScreencastExecutableModel();
        contentProcessor.loadJson(rawContentJson);
        this.#presentationContent = contentProcessor.getJson();
    }

    commencePresentation() {
        if (this.#advanceButton) {
            this.#advanceButton.addEventListener('click', () => this.#signalEmitter.notify('progressionRequested'));
        }
        if (this.#recedeButton) {
            this.#recedeButton.addEventListener('click', () => this.#signalEmitter.notify('retrogressionRequested'));
        }

        this.#resetDisplayState();
        this.#jumpToMarker(window.location.hash.substring(1));
        
        if ('onhashchange' in window) {
            window.addEventListener('hashchange', () => {
                this.#jumpToMarker(window.location.hash.substring(1));
            });
        } else {
            window.setInterval(() => {
                const currentHash = window.location.hash.substring(1);
                if (currentHash !== this.#lastObservedHash) {
                    this.#lastObservedHash = currentHash;
                    this.#jumpToMarker(currentHash);
                }
            }, 100);
        }

        if (this.#loadingOverlay) {
            this.#loadingOverlay.style.display = 'none';
        }
        if (this.#contentDisplayArea) {
            this.#contentDisplayArea.style.display = 'block';
        }
        
        this.#beginAutoInitiationMaybe();
    }
}

const presentationFactory = (() => {
    let moduleExports = {};

    moduleExports.makePresentationConductor = (domReference, configParameters) => {
        return new PresentationConductor(domReference, configParameters);
    };

    return moduleExports;
})();

// Assuming 'dahuapp' is a global or imported object, this augments it.
// Placeholder for dahuapp.createScreencastExecutableModel to allow the clone to run
const dahuapp = dahuapp || {};
if (!dahuapp.createScreencastExecutableModel) {
    dahuapp.createScreencastExecutableModel = function() {
        let _data = null;
        return {
            loadJson: function(jsonData) {
                _data = jsonData;
                if (_data && _data.action) {
                    _data.action.forEach(act => {
                        if (!act.execute) act.execute = (emitter, container) => {
                            console.log(`Executing mocked action: ${act.id || 'N/A'} (trigger: ${act.trigger})`);
                            return new Promise(resolve => setTimeout(() => {
                                emitter.notify('singleTaskStarted');
                                setTimeout(() => {
                                    emitter.notify('singleTaskFinished');
                                    resolve();
                                }, Math.random() * 500 + 100);
                            }, 50));
                        };
                        if (!act.executeReverse) act.executeReverse = (container) => {
                            console.log(`Reversing mocked action: ${act.id || 'N/A'}`);
                            return new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
                        };
                        if (!act.applyState) act.applyState = (container) => {
                            console.log(`Applying immediate state for mocked action: ${act.id || 'N/A'}`);
                        };
                    });
                }
            },
            getJson: function() {
                return _data;
            }
        };
    };
}

dahuapp.presentation = presentationFactory;