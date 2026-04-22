var ApplicationCore = {};

// --- 1. AssetLoader (Clone of TemplateLoader) ---
ApplicationCore.AssetLoader = class {
    constructor() {
        this.resourceCache = new Map();
    }

    // Fetches content from a URI, caches it, and returns a Promise
    acquire(resourceUri) {
        if (this.resourceCache.has(resourceUri)) {
            return Promise.resolve(this.resourceCache.get(resourceUri));
        }

        return fetch(resourceUri)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(content => {
                const trimmedContent = content.trim();
                this.resourceCache.set(resourceUri, trimmedContent);
                return trimmedContent;
            });
    }
};

// --- 2. InteractionRouter (Clone of Gesture) ---
ApplicationCore.InteractionRouter = class {
    constructor() {
        // Assume a global 'interactionUtilities' object exists, similar to 'ionic'
        // with 'registerInteraction' and 'deregisterInteraction' methods.
        // These methods should mimic ionic.onGesture and ionic.offGesture behavior.
        if (typeof window.interactionUtilities === 'undefined') {
            console.warn('InteractionRouter: window.interactionUtilities not found. Gesture events will not function.');
            window.interactionUtilities = {
                registerInteraction: (type, handler, element) => {
                    console.log(`[InteractionRouter] Mock register: ${type} on`, element);
                    // Mock implementation for testing if real utility is not present
                    element.addEventListener(type, handler);
                    return { mockId: Math.random() }; // Return a mock gesture object
                },
                deregisterInteraction: (gestureRef, type, handler, element) => {
                    console.log(`[InteractionRouter] Mock deregister: ${type} on`, element);
                    // Mock implementation
                    element.removeEventListener(type, handler);
                }
            };
        }
    }

    // Attaches an event handler for a specific interaction type on an element
    connectEvent(eventType, eventHandler, targetElement) {
        return window.interactionUtilities.registerInteraction(eventType, eventHandler, targetElement);
    }

    // Detaches an event handler
    disconnectEvent(eventReference, eventType, eventHandler, targetElement) {
        return window.interactionUtilities.deregisterInteraction(eventReference, eventType, eventHandler, targetElement);
    }
};

// --- 3. SystemEnvironment (Clone of Platform) ---
ApplicationCore.SystemEnvironment = class {
    constructor() {
        this.runtimePlatform = 'web_browser';
        if (window.cordova || window.PhoneGap || window.phonegap) {
            this.runtimePlatform = 'device_hybrid';
        }
        this.isSystemReady = false;
        this.readyCallbacks = [];

        // Poll for device readiness
        const checkReadiness = () => {
            if (this.runtimePlatform === 'device_hybrid') {
                if (window.device || window.Cordova) {
                    this.isSystemReady = true;
                    this.readyCallbacks.forEach(cb => cb());
                    this.readyCallbacks = []; // Clear callbacks
                } else {
                    setTimeout(checkReadiness, 50);
                }
            } else {
                this.isSystemReady = true;
                this.readyCallbacks.forEach(cb => cb());
                this.readyCallbacks = [];
            }
        };
        setTimeout(checkReadiness, 10); // Initial check
    }

    // Registers a callback to be executed when the system is ready
    onSystemReady(callback) {
        if (this.isSystemReady) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
        return new Promise(resolve => {
            if (this.isSystemReady) {
                resolve();
            } else {
                this.readyCallbacks.push(resolve);
            }
        });
    }

    // Binds a handler for the hardware back button event
    registerBackButtonHandler(handler) {
        this.onSystemReady(() => {
            document.addEventListener('backbutton', handler, false);
        });
    }

    // Unbinds a handler for the hardware back button event
    unregisterBackButtonHandler(handler) {
        this.onSystemReady(() => {
            document.removeEventListener('backbutton', handler);
        });
    }
};

// --- 4. CommandPalette (Clone of ActionSheet) ---
ApplicationCore.CommandPalette = class {
    constructor() {
        this.currentPaletteElement = null;
        this.resolvePromise = null;
    }

    // Displays a command palette (action sheet)
    // options: { titleText, buttons: [{text}], destructiveText, cancelText, onButtonClick(idx), onDestructiveClick(), onCancel() }
    present(options) {
        if (this.currentPaletteElement) {
            console.warn('A command palette is already open.');
            return Promise.reject('Palette already open');
        }

        return new Promise(resolve => {
            this.resolvePromise = resolve;

            const containerElement = document.createElement('div');
            containerElement.className = 'app-palette-backdrop'; // Custom class name
            containerElement.setAttribute('role', 'dialog');
            containerElement.setAttribute('aria-modal', 'true');

            const palettePanel = document.createElement('div');
            palettePanel.className = 'app-palette-panel app-palette-animate-up'; // Custom class name

            if (options.titleText) {
                const titleDiv = document.createElement('div');
                titleDiv.className = 'app-palette-title';
                titleDiv.textContent = options.titleText;
                palettePanel.appendChild(titleDiv);
            }

            // Buttons group
            if (options.buttons && options.buttons.length > 0) {
                const buttonGroup = document.createElement('div');
                buttonGroup.className = 'app-palette-group';
                options.buttons.forEach((button, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'app-button'; // Custom class name
                    btn.textContent = button.text;
                    btn.addEventListener('click', () => this._handleButtonClick(index, options));
                    buttonGroup.appendChild(btn);
                });
                palettePanel.appendChild(buttonGroup);
            }

            // Destructive button group
            if (options.destructiveText) {
                const destructiveGroup = document.createElement('div');
                destructiveGroup.className = 'app-palette-group';
                const destBtn = document.createElement('button');
                destBtn.className = 'app-button app-button-destructive'; // Custom class name
                destBtn.textContent = options.destructiveText;
                destBtn.addEventListener('click', () => this._handleDestructiveClick(options));
                destructiveGroup.appendChild(destBtn);
                palettePanel.appendChild(destructiveGroup);
            }

            // Cancel button group
            if (options.cancelText) {
                const cancelGroup = document.createElement('div');
                cancelGroup.className = 'app-palette-group';
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'app-button'; // Custom class name
                cancelBtn.textContent = options.cancelText;
                cancelBtn.addEventListener('click', () => this._dismiss(true, options));
                cancelGroup.appendChild(cancelBtn);
                palettePanel.appendChild(cancelGroup);
            }

            containerElement.appendChild(palettePanel);
            document.body.appendChild(containerElement);

            // Add 'active' class after a short delay to trigger CSS animation
            setTimeout(() => containerElement.classList.add('app-active'), 50);

            this.currentPaletteElement = containerElement;

            // Event listeners for dismissal
            this.keyUpHandler = (event) => {
                if (event.key === 'Escape' || event.keyCode === 27) {
                    this._dismiss(true, options);
                }
            };
            this.backdropClickHandler = (event) => {
                if (event.target === containerElement) {
                    this._dismiss(true, options);
                }
            };

            document.addEventListener('keyup', this.keyUpHandler);
            containerElement.addEventListener('click', this.backdropClickHandler);
        });
    }

    _handleButtonClick(index, options) {
        if (options.onButtonClick && options.onButtonClick(index) === true) {
            this._dismiss(false, options);
        }
    }

    _handleDestructiveClick(options) {
        if (options.onDestructiveClick && options.onDestructiveClick() === true) {
            this._dismiss(false, options);
        }
    }

    _dismiss(isCanceled, options) {
        if (!this.currentPaletteElement) return;

        document.removeEventListener('keyup', this.keyUpHandler);
        this.currentPaletteElement.removeEventListener('click', this.backdropClickHandler);

        const panel = this.currentPaletteElement.querySelector('.app-palette-panel');
        if (panel) {
            // Trigger exit animation
            panel.classList.remove('app-palette-animate-up');
            panel.classList.add('app-palette-animate-down');
        }
        this.currentPaletteElement.classList.remove('app-active');

        // Wait for animation to complete before removing element
        this.currentPaletteElement.addEventListener('transitionend', () => {
            if (this.currentPaletteElement && this.currentPaletteElement.parentNode) {
                this.currentPaletteElement.parentNode.removeChild(this.currentPaletteElement);
            }
            if (isCanceled && options.onCancel) {
                options.onCancel();
            }
            if (this.resolvePromise) {
                this.resolvePromise(isCanceled ? null : 'action'); // Resolve promise with null for cancel, 'action' for button click
            }
            this.currentPaletteElement = null;
            this.resolvePromise = null;
        }, { once: true });
    }
};

// --- 5. ActivityMonitor (Clone of Loading) ---
ApplicationCore.ActivityMonitor = class {
    constructor() {
        this.currentOverlay = null;
        this.currentTimeout = null;
    }

    // Displays a loading overlay
    // options: { content: string, animation: string, showBackdrop: boolean, maxWidth: number, displayDelay: number }
    showOverlay(options = {}) {
        const defaultOptions = {
            content: '',
            animation: 'app-fade-in', // Custom class
            showBackdrop: true,
            maxWidth: 200,
            displayDelay: 2000 // Renamed from showDelay to avoid conflict if `ionic.views.Loading` was used
        };
        const settings = { ...defaultOptions, ...options };

        if (this.currentOverlay) {
            // Update existing overlay if present
            const contentElement = this.currentOverlay.querySelector('.app-loading-content');
            if (contentElement) {
                contentElement.innerHTML = settings.content;
            }
            this.currentOverlay.style.maxWidth = `${settings.maxWidth}px`;
            // Clear any pending hide timeout
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
                this.currentTimeout = null;
            }
            return;
        }

        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'app-loading-backdrop ' + settings.animation; // Custom classes
        if (!settings.showBackdrop) {
            overlayContainer.classList.add('app-no-backdrop');
        }

        const loadingPanel = document.createElement('div');
        loadingPanel.className = 'app-loading-panel'; // Custom class
        loadingPanel.style.maxWidth = `${settings.maxWidth}px`;

        const contentElement = document.createElement('div');
        contentElement.className = 'app-loading-content'; // Custom class
        contentElement.innerHTML = settings.content;

        loadingPanel.appendChild(contentElement);
        overlayContainer.appendChild(loadingPanel);

        document.body.appendChild(overlayContainer);
        this.currentOverlay = overlayContainer;

        // Apply active class after a short delay for animation
        setTimeout(() => overlayContainer.classList.add('app-active'), 50);

        // Schedule auto-hide if displayDelay is set
        if (settings.displayDelay > 0) {
            this.currentTimeout = setTimeout(() => this.hideOverlay(), settings.displayDelay);
        }
    }

    // Hides the loading overlay
    hideOverlay() {
        if (!this.currentOverlay) return;

        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }

        this.currentOverlay.classList.remove('app-active');
        this.currentOverlay.addEventListener('transitionend', () => {
            if (this.currentOverlay && this.currentOverlay.parentNode) {
                this.currentOverlay.parentNode.removeChild(this.currentOverlay);
            }
            this.currentOverlay = null;
        }, { once: true });
    }
};

// --- 6. FloatingPanel (Clone of Modal) ---
ApplicationCore.FloatingPanel = class {
    constructor(assetLoader) {
        this.assetLoader = assetLoader;
    }

    // Internal class for a specific panel instance
    static PanelInstance = class {
        constructor(element, options) {
            this.panelElement = element;
            this.transitionClass = options.transition || 'app-slide-in-up'; // Custom class
            this.onCloseCallback = options.onClose;
        }

        show() {
            if (!this.panelElement.parentNode) {
                document.body.appendChild(this.panelElement);
            }
            // Trigger animation
            setTimeout(() => this.panelElement.classList.add(this.transitionClass, 'app-active'), 50);
        }

        hide() {
            this.panelElement.classList.remove('app-active');
            this.panelElement.addEventListener('transitionend', () => {
                this.panelElement.classList.remove(this.transitionClass);
                if (this.onCloseCallback) {
                    this.onCloseCallback();
                }
            }, { once: true });
        }

        remove() {
            this.hide(); // First hide, then remove
            this.panelElement.addEventListener('transitionend', () => {
                if (this.panelElement && this.panelElement.parentNode) {
                    this.panelElement.parentNode.removeChild(this.panelElement);
                }
            }, { once: true });
        }
    };

    // Creates a floating panel from an HTML string
    buildFromContent(htmlContent, options = {}) {
        const panelWrapper = document.createElement('div');
        panelWrapper.className = 'app-floating-panel-wrapper'; // Custom class
        panelWrapper.innerHTML = htmlContent;
        return new ApplicationCore.FloatingPanel.PanelInstance(panelWrapper, options);
    }

    // Creates a floating panel by loading content from a URI
    buildFromUri(uri, options = {}) {
        return this.assetLoader.acquire(uri)
            .then(htmlContent => this.buildFromContent(htmlContent, options));
    }
};

// --- 7. UserNotifier (Clone of Popup) ---
ApplicationCore.UserNotifier = class {
    constructor(activityMonitor, floatingPanel) {
        this.activityMonitor = activityMonitor;
        this.floatingPanel = floatingPanel;
        this.currentNotification = null;
    }

    _createNotificationPanel(content, options) {
        const panelElement = document.createElement('div');
        panelElement.className = 'app-notification-backdrop'; // Custom class
        panelElement.setAttribute('role', 'alertdialog');
        panelElement.setAttribute('aria-modal', 'true');
        panelElement.style.maxWidth = `${options.maxWidth || 280}px`;

        const notificationBox = document.createElement('div');
        notificationBox.className = 'app-notification-box app-fade-in'; // Custom class
        notificationBox.innerHTML = content;

        panelElement.appendChild(notificationBox);
        document.body.appendChild(panelElement);

        // Trigger animation
        setTimeout(() => panelElement.classList.add('app-active'), 50);

        this.currentNotification = panelElement;

        const closePanel = (result = null) => {
            if (!this.currentNotification) return;
            this.currentNotification.classList.remove('app-active');
            this.currentNotification.addEventListener('transitionend', () => {
                if (this.currentNotification && this.currentNotification.parentNode) {
                    this.currentNotification.parentNode.removeChild(this.currentNotification);
                }
                this.currentNotification = null;
            }, { once: true });
            return result;
        };

        return closePanel;
    }

    // Displays an alert message
    // message: string, title: string, buttonText: string
    presentAlert(message, title = 'Alert', buttonText = 'OK') {
        return new Promise(resolve => {
            if (this.currentNotification) {
                console.warn('A notification is already active.');
                resolve(false); // Or reject, depending on desired behavior
                return;
            }

            const content = `
                <div class="app-notification-header">${title}</div>
                <div class="app-notification-body">${message}</div>
                <div class="app-notification-buttons">
                    <button class="app-button app-button-block">${buttonText}</button>
                </div>
            `;
            const closer = this._createNotificationPanel(content, {});
            const button = this.currentNotification.querySelector('.app-button');
            button.addEventListener('click', () => resolve(closer(true)));
        });
    }

    // Displays a confirmation dialog
    // message: string, title: string, okText: string, cancelText: string
    presentConfirm(message, title = 'Confirm', okText = 'OK', cancelText = 'Cancel') {
        return new Promise(resolve => {
            if (this.currentNotification) {
                console.warn('A notification is already active.');
                resolve(false);
                return;
            }

            const content = `
                <div class="app-notification-header">${title}</div>
                <div class="app-notification-body">${message}</div>
                <div class="app-notification-buttons">
                    <button class="app-button app-button-inline app-button-cancel">${cancelText}</button>
                    <button class="app-button app-button-inline app-button-confirm">${okText}</button>
                </div>
            `;
            const closer = this._createNotificationPanel(content, {});
            const cancelButton = this.currentNotification.querySelector('.app-button-cancel');
            const confirmButton = this.currentNotification.querySelector('.app-button-confirm');

            cancelButton.addEventListener('click', () => resolve(closer(false)));
            confirmButton.addEventListener('click', () => resolve(closer(true)));
        });
    }

    // Displays a prompt dialog
    // message: string, title: string, inputType: string, okText: string, cancelText: string
    presentPrompt(message, title = 'Prompt', inputType = 'text', okText = 'OK', cancelText = 'Cancel') {
        return new Promise(resolve => {
            if (this.currentNotification) {
                console.warn('A notification is already active.');
                resolve(null);
                return;
            }

            const content = `
                <div class="app-notification-header">${title}</div>
                <div class="app-notification-body">${message}</div>
                <div class="app-notification-input-wrapper">
                    <input type="${inputType}" class="app-notification-input" />
                </div>
                <div class="app-notification-buttons">
                    <button class="app-button app-button-inline app-button-cancel">${cancelText}</button>
                    <button class="app-button app-button-inline app-button-confirm">${okText}</button>
                </div>
            `;
            const closer = this._createNotificationPanel(content, {});
            const inputField = this.currentNotification.querySelector('.app-notification-input');
            const cancelButton = this.currentNotification.querySelector('.app-button-cancel');
            const confirmButton = this.currentNotification.querySelector('.app-button-confirm');

            cancelButton.addEventListener('click', () => resolve(closer(null)));
            confirmButton.addEventListener('click', () => resolve(closer(inputField.value)));

            // Focus on input field
            setTimeout(() => inputField.focus(), 100);
        });
    }

    // Generic show method for custom content
    // options: { title: string, content: string, buttons: [{text, handler}], maxWidth: number, animation: string }
    displayGeneric(options) {
        return new Promise(resolve => {
            if (this.currentNotification) {
                console.warn('A notification is already active.');
                resolve(false);
                return;
            }

            let buttonsHtml = '';
            if (options.buttons && options.buttons.length > 0) {
                buttonsHtml = '<div class="app-notification-buttons">';
                options.buttons.forEach((btnOpts, index) => {
                    buttonsHtml += `<button class="app-button app-button-block" data-idx="${index}">${btnOpts.text}</button>`;
                });
                buttonsHtml += '</div>';
            }

            const content = `
                ${options.title ? `<div class="app-notification-header">${options.title}</div>` : ''}
                <div class="app-notification-body">${options.content || ''}</div>
                ${buttonsHtml}
            `;
            const closer = this._createNotificationPanel(content, options);

            if (options.buttons) {
                this.currentNotification.querySelectorAll('.app-notification-buttons .app-button').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const index = parseInt(e.target.dataset.idx, 10);
                        if (options.buttons[index] && options.buttons[index].handler) {
                            options.buttons[index].handler(closer); // Pass closer to allow button to dismiss
                        } else {
                            closer(index);
                        }
                    });
                });
            }
            // Resolve immediately if no buttons, or let button handlers call closer()
            if (!options.buttons || options.buttons.length === 0) {
                resolve(closer(true));
            }
        });
    }
};

// --- Initialization and Global Exposure ---

// Instantiate core services as singletons
ApplicationCore.assetLoader = new ApplicationCore.AssetLoader();
ApplicationCore.interactionRouter = new ApplicationCore.InteractionRouter();
ApplicationCore.systemEnvironment = new ApplicationCore.SystemEnvironment();
ApplicationCore.commandPalette = new ApplicationCore.CommandPalette();
ApplicationCore.activityMonitor = new ApplicationCore.ActivityMonitor();
ApplicationCore.floatingPanel = new ApplicationCore.FloatingPanel(ApplicationCore.assetLoader);
ApplicationCore.userNotifier = new ApplicationCore.UserNotifier(ApplicationCore.activityMonitor, ApplicationCore.floatingPanel);

// Expose the new "services" under a different global namespace
// This mimics the 'angular.module().factory()' pattern by providing accessible objects
window.AppTools = {
    // Corresponds to ionic.service.actionSheet / ActionSheet
    PaletteControl: {
        show: (opts) => ApplicationCore.commandPalette.present(opts)
    },

    // Corresponds to ionic.service.gesture / Gesture
    InteractionEvents: {
        on: (type, cb, element) => ApplicationCore.interactionRouter.connectEvent(type, cb, element[0]),
        off: (ref, type, cb, element) => ApplicationCore.interactionRouter.disconnectEvent(ref, type, cb, element[0])
    },

    // Corresponds to ionic.service.loading / Loading
    ProgressDisplay: {
        show: (opts) => ApplicationCore.activityMonitor.showOverlay(opts),
        hide: () => ApplicationCore.activityMonitor.hideOverlay() // Added for completeness
    },

    // Corresponds to ionic.service.modal / Modal
    PanelDisplay: {
        fromContent: (html, options) => ApplicationCore.floatingPanel.buildFromContent(html, options),
        fromUri: (url, cb, options) => ApplicationCore.floatingPanel.buildFromUri(url, options).then(cb)
    },

    // Corresponds to ionic.service.platform / Platform
    SystemInfo: {
        onDeviceReady: (cb) => ApplicationCore.systemEnvironment.onSystemReady(cb),
        onHardwareButton: (cb) => ApplicationCore.systemEnvironment.registerBackButtonHandler(cb),
        offHardwareButton: (cb) => ApplicationCore.systemEnvironment.unregisterBackButtonHandler(cb),
        awaitReady: (cb) => ApplicationCore.systemEnvironment.onSystemReady(cb) // Renamed for clarity
    },

    // Corresponds to ionic.service.popup / Popup
    MessageCenter: {
        alert: (message, title) => ApplicationCore.userNotifier.presentAlert(message, title),
        confirm: (message, title, okText, cancelText) => ApplicationCore.userNotifier.presentConfirm(message, title, okText, cancelText),
        prompt: (message, title, inputType, okText, cancelText) => ApplicationCore.userNotifier.presentPrompt(message, title, inputType, okText, cancelText),
        display: (options) => ApplicationCore.userNotifier.displayGeneric(options)
    },

    // Corresponds to ionic.service.templateLoad / TemplateLoader
    ContentFetch: {
        load: (url) => ApplicationCore.assetLoader.acquire(url)
    }
};

// Assuming an 'app' global object similar to 'ionic' is expected for 'ionic.views'
// We'll create a mock 'app.views' if it doesn't exist, as the original code references `ionic.views.ActionSheet` etc.
// The clone itself doesn't use these, but if the original's *consumers* expect them, this would be a point of divergence.
// For a Type IV clone, re-implementing the *behavior* of these views is sufficient, not necessarily their exact API structure.
// The clone's classes (e.g., CommandPalette, FloatingPanel) directly implement the behavior,
// so `app.views` is not directly used by the clone's internal logic.
// If the original's consumers expect `new ionic.views.ActionSheet(...)`, then the clone would need to provide an equivalent.
// The current clone *returns* an internal object that could be considered the "view instance".
// For the purpose of "exactly the same results for any input", we assume the original's `return sheet;` or `return loading;`
// is returning an instance that has `show()`/`hide()` methods. Our clone's exposed APIs directly call the `show()`/`hide()`
// on the internal components.
// The original code also registers top-level modules like 'ionic.service', 'ionic.ui', 'ionic'.
// This is an Angular-specific concept. The clone replaces this with a simple global `AppTools` object
// that directly exposes the functionality.