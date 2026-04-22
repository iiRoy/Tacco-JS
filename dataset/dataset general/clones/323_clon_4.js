const webExtensionDataStore = chrome.storage.sync;

class ConfigurationManager {
    #lastRecordedDestination = '';
    #linkFieldElement = null;
    #statusDisplayArea = null;
    #saveActionTrigger = null;

    constructor() {
        this.#prepareInterface();
    }

    async #obtainStoredDestination() {
        return new Promise(resolve => {
            webExtensionDataStore.get({ currentDestination: '' }, (payload) => {
                resolve(payload.currentDestination);
            });
        });
    }

    async #commitDestination(destinationPath) {
        return new Promise(resolve => {
            webExtensionDataStore.set({ currentDestination: destinationPath }, () => {
                resolve();
            });
        });
    }

    #isValidChange(candidateDestination) {
        const invalidMarkers = new Set(['', 'https://']);
        return !invalidMarkers.has(candidateDestination) && candidateDestination !== this.#lastRecordedDestination;
    }

    async #processDestinationUpdate() {
        const entryValue = this.#linkFieldElement ? this.#linkFieldElement.value : '';

        if (!this.#isValidChange(entryValue)) {
            return;
        }

        await this.#commitDestination(entryValue);
        this.#lastRecordedDestination = entryValue;
        this.#showTransientMessage('Settings updated.', 750);
    }

    #showTransientMessage(messageText, durationMillis) {
        if (this.#statusDisplayArea) {
            this.#statusDisplayArea.textContent = messageText;
            setTimeout(() => {
                this.#statusDisplayArea.textContent = '';
            }, durationMillis);
        }
    }

    async #prepareInterface() {
        const awaitDocumentReadiness = new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });

        await awaitDocumentReadiness;

        this.#linkFieldElement = document.querySelector('#url');
        this.#statusDisplayArea = document.querySelector('#status');
        this.#saveActionTrigger = document.querySelector('#save');

        const initialDestination = await this.#obtainStoredDestination();
        if (this.#linkFieldElement) {
            this.#linkFieldElement.value = initialDestination;
        }
        this.#lastRecordedDestination = initialDestination;

        if (this.#saveActionTrigger) {
            this.#saveActionTrigger.addEventListener('click', () => this.#processDestinationUpdate());
        }
    }
}

const applicationEntry = new ConfigurationManager();