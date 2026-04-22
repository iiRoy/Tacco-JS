'use strict';

class MessageOverseer {
    #historyStore;
    #visualQueue;
    #optionsRegistry;
    #browserNotifier;
    #eventBroadcast;

    constructor() {
        console.log('MessageOverseer online and ready.');
        this.#eventBroadcast = new EventTarget();

        this.#historyStore = JSON.parse(window.localStorage.getItem('message_archive_data_v2')) || [];
        this.#visualQueue = [];

        this.#optionsRegistry = {
            info: { durationMillis: 5000, activeState: true },
            warning: { durationMillis: 5000, activeState: true },
            error: { durationMillis: 5000, activeState: true },
            success: { durationMillis: 5000, activeState: true },
            progress: { durationMillis: 0, activeState: true },
            custom: { durationMillis: 35000, activeState: true },
            showDetails: true,
            persistToStorage: false,
            useNativeAlerts: false,
            nativeDefaultIconPath: 'icon_default.png'
        };

        this.#browserNotifier = this.#createNativeAlertMechanism();
    }

    #createNativeAlertMechanism() {
        return (displayIcon, mainTitle, mainContent, onShowCallback, onCloseCallback) => {
            if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
                const effectiveIcon = displayIcon || 'favicon_default.ico';
                const notificationInstance = window.webkitNotifications.createNotification(effectiveIcon, mainTitle, mainContent);
                if (typeof onShowCallback === 'function') {
                    notificationInstance.ondisplay = onShowCallback;
                }
                if (typeof onCloseCallback === 'function') {
                    notificationInstance.onclose = onCloseCallback;
                }
                notificationInstance.show();
            } else {
                this.#optionsRegistry.useNativeAlerts = false;
            }
        };
    }

    #emitEvent(eventName, detail) {
        this.#eventBroadcast.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    deactivateBrowserAlerts() {
        this.#optionsRegistry.useNativeAlerts = false;
    }

    blockAlertKind(alertIdentifier) {
        if (this.#optionsRegistry[alertIdentifier]) {
            this.#optionsRegistry[alertIdentifier].activeState = false;
        }
    }

    activateBrowserAlerts() {
        this.#optionsRegistry.useNativeAlerts = this.askBrowserAlertPermissions();
    }

    allowAlertKind(alertIdentifier) {
        if (this.#optionsRegistry[alertIdentifier]) {
            this.#optionsRegistry[alertIdentifier].activeState = true;
        }
    }

    retrieveOptions() {
        return JSON.parse(JSON.stringify(this.#optionsRegistry));
    }

    flipAlertKindState(alertIdentifier) {
        if (this.#optionsRegistry[alertIdentifier]) {
            this.#optionsRegistry[alertIdentifier].activeState = !this.#optionsRegistry[alertIdentifier].activeState;
        }
    }

    toggleBrowserAlerts() {
        this.#optionsRegistry.useNativeAlerts = !this.#optionsRegistry.useNativeAlerts;
    }

    askBrowserAlertPermissions() {
        if (window.webkitNotifications) {
            console.log('Native browser alerts are supported.');
            if (window.webkitNotifications.checkPermission() === 0) {
                return true;
            } else {
                window.webkitNotifications.requestPermission(() => {
                    if (window.webkitNotifications.checkPermission() === 0) {
                        this.#optionsRegistry.useNativeAlerts = true;
                    } else {
                        this.#optionsRegistry.useNativeAlerts = false;
                    }
                });
                return false;
            }
        } else {
            console.log('Native browser alerts are not supported.');
            return false;
        }
    }

    retrieveAllRecords() {
        return [...this.#historyStore];
    }

    retrieveActiveVisuals() {
        return [...this.#visualQueue];
    }

    displayInformational(headline, bodyText, additionalData) {
        console.log(headline, bodyText);
        return this.presentIconMessage('info', 'info', headline, bodyText, additionalData);
    }

    displayFault(headline, bodyText, additionalData) {
        return this.presentIconMessage('error', 'times', headline, bodyText, additionalData);
    }

    displayCompletion(headline, bodyText, additionalData) {
        return this.presentIconMessage('success', 'check', headline, bodyText, additionalData);
    }

    displayCaution(headline, bodyText, additionalData) {
        return this.presentIconMessage('warning', 'exclamation', headline, bodyText, additionalData);
    }

    presentIconMessage(kind, iconSymbol, headline, bodyText, additionalData) {
        return this.craftMessageEntry(kind, null, iconSymbol, headline, bodyText, additionalData);
    }

    presentImageMessage(imagePath, headline, bodyText, additionalData) {
        return this.craftMessageEntry('custom', imagePath, null, headline, bodyText, additionalData);
    }

    craftMessageEntry(kind, imagePath, iconSymbol, headline, bodyText, additionalData) {
        const newRecord = {
            'kind': kind,
            'visualAsset': imagePath,
            'symbolCode': iconSymbol,
            'caption': headline,
            'description': bodyText,
            'creationTime': Date.now(),
            'extraContext': additionalData
        };

        this.#historyStore.push(newRecord);
        this.#emitEvent('recordsUpdated', { source: 'craftMessageEntry', record: newRecord });

        if (this.#optionsRegistry.useNativeAlerts) {
            this.#browserNotifier(imagePath, headline, bodyText,
                () => console.log("Native alert shown"),
                () => console.log("Native alert closed")
            );
        } else {
            this.#visualQueue.push(newRecord);
            this.#emitEvent('alertAdded', { entry: newRecord });

            if (this.#optionsRegistry[kind] && this.#optionsRegistry[kind].durationMillis > 0) {
                setTimeout(() => {
                    this.#removeVisualEntry(newRecord);
                }, this.#optionsRegistry[kind].durationMillis);
            }
        }

        this.storeRecords();
        return newRecord;
    }

    storeRecords() {
        if (this.#optionsRegistry.persistToStorage) {
            window.localStorage.setItem('message_archive_data_v2', JSON.stringify(this.#historyStore));
            this.#emitEvent('recordsUpdated', { source: 'storeRecords' });
        }
    }

    reloadRecords() {
        // Functionality equivalent to original: does nothing.
    }

    resetRecords() {
        this.#historyStore = [];
        this.storeRecords();
        this.#emitEvent('recordsUpdated', { source: 'resetRecords' });
    }

    #removeVisualEntry(entryToRemove) {
        const index = this.#visualQueue.indexOf(entryToRemove);
        if (index > -1) {
            this.#visualQueue.splice(index, 1);
            this.#emitEvent('alertRemoved', { entry: entryToRemove });
        }
    }

    removeDisplayedMessage(messageEntry) {
        this.#removeVisualEntry(messageEntry);
    }

    on(eventName, handler) {
        this.#eventBroadcast.addEventListener(eventName, handler);
    }

    off(eventName, handler) {
        this.#eventBroadcast.removeEventListener(eventName, handler);
    }
}

class DisplayComponent {
    #containerElement;
    #messageOverseerInstance;
    #activeDomElements = new Map();

    constructor(targetElement, managerInstance, config = {}) {
        if (!targetElement || !(targetElement instanceof HTMLElement)) {
            throw new Error('Target element must be a valid HTMLElement.');
        }
        if (!(managerInstance instanceof MessageOverseer)) {
            throw new Error('Manager instance must be an instance of MessageOverseer.');
        }

        this.#containerElement = targetElement;
        this.#messageOverseerInstance = managerInstance;

        this.#containerElement.classList.add('visual-message-container');
        const positionParts = config.placementHint ? config.placementHint.split(' ') : [];
        positionParts.forEach(part => this.#containerElement.classList.add(part));

        this.#setupListeners();
        console.log('DisplayComponent initialized for element:', targetElement);
    }

    #setupListeners() {
        this.#messageOverseerInstance.on('alertAdded', this.#handleAlertAdded.bind(this));
        this.#messageOverseerInstance.on('alertRemoved', this.#handleAlertRemoved.bind(this));
    }

    #handleAlertAdded(event) {
        const messageEntry = event.detail.entry;
        const domElement = this.#createMessageDomElement(messageEntry);
        this.#containerElement.appendChild(domElement);
        this.#activeDomElements.set(messageEntry, domElement);
    }

    #handleAlertRemoved(event) {
        const messageEntry = event.detail.entry;
        const domElement = this.#activeDomElements.get(messageEntry);
        if (domElement && domElement.parentNode) {
            domElement.parentNode.removeChild(domElement);
            this.#activeDomElements.delete(messageEntry);
        }
    }

    #createMessageDomElement(messageData) {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('visual-message-wrapper');

        const closeButton = document.createElement('button');
        closeButton.classList.add('visual-message-close-button');
        closeButton.innerHTML = '<i class="font-awesome-icon font-awesome-icon-times"></i>';
        closeButton.addEventListener('click', () => {
            this.#messageOverseerInstance.removeDisplayedMessage(messageData);
        });
        wrapperDiv.appendChild(closeButton);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('visual-message-content-area');

        const imageOrIconContainer = document.createElement('div');
        imageOrIconContainer.classList.add('visual-message-image-area', `visual-message-kind-${messageData.kind}`);

        if (messageData.visualAsset) {
            const imgElement = document.createElement('img');
            imgElement.src = messageData.visualAsset;
            imgElement.alt = messageData.caption;
            imageOrIconContainer.appendChild(imgElement);
        } else if (messageData.symbolCode) {
            const iconElement = document.createElement('i');
            iconElement.classList.add('font-awesome-icon', `font-awesome-icon-${messageData.symbolCode}`);
            imageOrIconContainer.appendChild(iconElement);
        }
        contentDiv.appendChild(imageOrIconContainer);

        const textContainer = document.createElement('div');
        textContainer.classList.add('visual-message-text-section');

        const titleHeader = document.createElement('h3');
        titleHeader.classList.add('visual-message-title');
        titleHeader.textContent = messageData.caption;
        textContainer.appendChild(titleHeader);

        const paragraphText = document.createElement('p');
        paragraphText.classList.add('visual-message-description');
        paragraphText.textContent = messageData.description;
        textContainer.appendChild(paragraphText);

        contentDiv.appendChild(textContainer);
        wrapperDiv.appendChild(contentDiv);

        return wrapperDiv;
    }
}