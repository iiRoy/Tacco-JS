// A custom Object creation utility, equivalent to Object.create
(function () {
    if (typeof Object.create !== 'function') {
        Object.create = function (sourceProto) {
            function TemporaryConstructor() {}
            TemporaryConstructor.prototype = sourceProto;
            return new TemporaryConstructor();
        };
    }
})();

// Main IIFE for the notification system
(function () {

    // --- Utility Functions (Vanilla JS replacements) ---
    function deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (target && typeof target === 'object' && source && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    function generateUniqueId(prefix = 'bell_') {
        return prefix + (new Date().getTime() * Math.floor(Math.random() * 1000000));
    }

    function findElement(selector, context = document) {
        return context.querySelector(selector);
    }

    function createDomElement(htmlString) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString.trim();
        return tempDiv.firstChild;
    }

    function addClass(element, className) {
        if (element && className) element.classList.add(className);
    }

    function removeClass(element, className) {
        if (element && className) element.classList.remove(className);
    }

    function setCss(element, styles) {
        if (element && styles) Object.assign(element.style, styles);
    }

    function addEventHandler(element, eventType, handler, once = false) {
        if (element) {
            const wrappedHandler = function(e) {
                if (once) element.removeEventListener(eventType, wrappedHandler);
                handler.call(this, e);
            };
            element.addEventListener(eventType, wrappedHandler);
        }
    }

    function removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    function isFunction(func) {
        return typeof func === 'function';
    }

    function isArray(arr) {
        return Array.isArray(arr);
    }

    function includesInArray(arr, item) {
        return arr.includes(item);
    }

    // --- Global State and Configuration ---
    const bellState = {
        activeNotifications: {}, // Renamed from $.noty.store
        pendingNotifications: [], // Renamed from $.noty.queue
        canProcessNext: true, // Renamed from $.noty.ontap
        globalSettings: {}, // Renamed from $.noty.defaults
        returnInstance: true, // Renamed from $.noty.returns (object vs id)
        positionConfigurations: {}, // Renamed from $.noty.layouts
        visualStyleDefinitions: {}, // Renamed from $.noty.themes
        modalCount: 0,
        layoutInstanceCounts: {}, // To track how many notifications per layout container
        systemAlertBackup: window.alert // Backup for consumeSystemAlert
    };

    // --- BellInstance Prototype (Renamed from NotyObject) ---
    const BellInstancePrototype = {

        initialize(preferences) {
            this.prefs = deepMerge({}, bellState.globalSettings, preferences);

            const selectedPosition = this.prefs.customElement ? bellState.positionConfigurations['inline'] : bellState.positionConfigurations[this.prefs.position];
            const selectedAppearance = bellState.visualStyleDefinitions[this.prefs.appearance];

            this.prefs.position = selectedPosition;
            this.prefs.appearance = selectedAppearance;

            // Remove temporary options if they exist
            delete preferences.position;
            delete preferences.appearance;

            // Merge layout-specific options
            this.prefs = deepMerge({}, this.prefs, this.prefs.position.options);
            this.prefs.identifier = generateUniqueId();
            this.prefs = deepMerge({}, this.prefs, preferences); // Re-merge user preferences to override layout options

            this.constructUI(); // _build
            return this;
        },

        constructUI() { // Renamed from _build
            // Generating notification display unit
            const displayUnit = createDomElement(this.prefs.markupTemplate);
            displayUnit.setAttribute('id', this.prefs.identifier);
            findElement('.bell_text', displayUnit).innerHTML = this.prefs.messageContent;

            this.displayUnit = displayUnit; // this.displayUnit always refers to the notification bar itself

            if (this.prefs.position.parent && this.prefs.position.parent.element !== null) {
                const parentEl = findElement(this.prefs.position.parent.element);
                if (parentEl) {
                    setCss(parentEl, this.prefs.position.parent.css);
                    parentEl.appendChild(this.displayUnit);
                }
            }

            // Set buttons if available
            if (this.prefs.actionButtons) {
                // If we have button disable dismissOn & autoDismissDelay options
                this.prefs.dismissOn = [];
                this.prefs.autoDismissDelay = false;

                const actionGroup = document.createElement('div');
                addClass(actionGroup, 'bell_buttons');

                (this.prefs.position.parent && this.prefs.position.parent.element !== null) ?
                    findElement('.bell_bar', this.displayUnit.parentNode).appendChild(actionGroup) : // If parent exists, find bell_bar within parent
                    this.displayUnit.appendChild(actionGroup); // Otherwise append to displayUnit itself

                this.prefs.actionButtons.forEach(buttonConfig => {
                    const buttonElement = document.createElement('button');
                    addClass(buttonElement, buttonConfig.cssClass || 'neutral');
                    buttonElement.innerHTML = buttonConfig.label;
                    actionGroup.appendChild(buttonElement);

                    addEventHandler(buttonElement, 'click', () => {
                        if (isFunction(buttonConfig.onClick)) {
                            buttonConfig.onClick.call(buttonElement, this);
                        }
                    });
                });
            }

            // For easy access
            this.contentArea = findElement('.bell_message', this.displayUnit);
            this.dismissControl = findElement('.bell_close', this.displayUnit);
            this.actionGroup = findElement('.bell_buttons', this.displayUnit);

            bellState.activeNotifications[this.prefs.identifier] = this; // store for api
        },

        display() { // Renamed from show
            const targetContainer = findElement(this.prefs.position.container.selector);
            if (this.prefs.customElement) {
                this.prefs.customElement.appendChild(this.displayUnit);
            } else {
                targetContainer.appendChild(this.displayUnit);
            }

            this.prefs.appearance.applyStyle(this);

            if (isFunction(this.prefs.position.applyCSS)) {
                this.prefs.position.applyCSS(this.displayUnit);
            } else {
                setCss(this.displayUnit, this.prefs.position.css || {});
            }

            addClass(this.displayUnit, this.prefs.position.cssClass);

            this.prefs.position.container.applyStyle(targetContainer);

            this.prefs.appearance.eventHooks.onDisplay.apply(this);

            if (includesInArray(this.prefs.dismissOn, 'click')) {
                setCss(this.displayUnit, { cursor: 'pointer' });
                addEventHandler(this.displayUnit, 'click', () => this.dismiss(), true);
            }

            if (includesInArray(this.prefs.dismissOn, 'hover')) {
                addEventHandler(this.displayUnit, 'mouseenter', () => this.dismiss(), true);
            }

            if (includesInArray(this.prefs.dismissOn, 'button')) {
                addEventHandler(this.dismissControl, 'click', () => this.dismiss(), true);
            }

            if (!includesInArray(this.prefs.dismissOn, 'button')) {
                removeElement(this.dismissControl);
            }

            if (this.prefs.eventHooks.onDisplay) {
                this.prefs.eventHooks.onDisplay.apply(this);
            }

            // CSS Transitions for animation
            const openMotion = this.prefs.motion.open;
            const motionSpeed = this.prefs.motion.speed;
            const motionEasing = this.prefs.motion.easing;

            // Apply initial state for transition
            setCss(this.displayUnit, openMotion.initial);
            // Force reflow to ensure initial state is applied before transition
            this.displayUnit.offsetHeight; // Triggers reflow
            // Apply final state with transition
            setCss(this.displayUnit, {
                transition: `all ${motionSpeed / 1000}s ${motionEasing}`,
                ...openMotion.final
            });

            addEventHandler(this.displayUnit, 'transitionend', () => {
                if (!this.displayed) { // only trigger afterDisplay once for open transition
                    if (this.prefs.eventHooks.afterDisplay) {
                        this.prefs.eventHooks.afterDisplay.apply(this);
                    }
                    this.displayed = true;
                }
            }, true);


            // If notification has an auto-dismiss delay
            if (this.prefs.autoDismissDelay) {
                this.dismissTimer = setTimeout(() => this.dismiss(), this.prefs.autoDismissDelay);
            }

            return this;
        },

        dismiss() { // Renamed from close
            if (this.isDismissed) return;

            // If not yet displayed (still in queue), remove from queue
            if (!this.displayed) {
                bellState.pendingNotifications = bellState.pendingNotifications.filter(n => n.prefs.identifier !== this.prefs.identifier);
                return;
            }

            addClass(this.displayUnit, 'dismissing-now'); // Add a class for visual feedback during dismissal

            if (this.prefs.eventHooks.onDismiss) {
                this.prefs.eventHooks.onDismiss.apply(this);
            }

            // Clear any pending timeout
            if (this.dismissTimer) {
                clearTimeout(this.dismissTimer);
            }

            // Apply close animation
            const closeMotion = this.prefs.motion.close;
            const motionSpeed = this.prefs.motion.speed;
            const motionEasing = this.prefs.motion.easing;

            // Set final state for close animation
            setCss(this.displayUnit, {
                transition: `all ${motionSpeed / 1000}s ${motionEasing}`,
                ...closeMotion.final
            });

            addEventHandler(this.displayUnit, 'transitionend', () => {
                if (this.isDismissed) return; // Prevent multiple dismissals

                if (this.prefs.eventHooks.afterDismiss) {
                    this.prefs.eventHooks.afterDismiss.apply(this);
                }

                // Modal Cleaning
                if (this.prefs.isModal) {
                    bellManager.setModalCounter(-1);
                    if (bellManager.getModalCounter() === 0) {
                        const modalOverlay = findElement('.bell_overlay');
                        if (modalOverlay) {
                            setCss(modalOverlay, { transition: 'opacity 0.2s ease-out', opacity: 0 });
                            addEventHandler(modalOverlay, 'transitionend', () => removeElement(modalOverlay), true);
                        }
                    }
                }

                // Layout Cleaning
                bellManager.setLayoutCounter(this, -1);
                if (bellManager.getLayoutCounter(this) === 0) {
                    const containerElement = findElement(this.prefs.position.container.selector);
                    if (containerElement && containerElement.classList.contains('newly-created')) { // Only remove if manager created it
                        removeElement(containerElement);
                    }
                }

                if (this.displayUnit && this.displayUnit.parentNode) {
                    removeElement(this.displayUnit);
                    this.displayUnit = null; // Dereference
                    this.isDismissed = true;
                }

                delete bellState.activeNotifications[this.prefs.identifier]; // deleting from store

                this.prefs.appearance.eventHooks.onDismiss.apply(this);

                if (!this.prefs.processIndependently) {
                    bellState.canProcessNext = true; // Queue render
                    bellManager.processQueue();
                }

            }, true); // Use 'once' to ensure it only fires for the final transition

            this.isDismissed = true; // Mark as dismissed immediately to prevent re-triggering
        },

        updateContent(newText) { // Renamed from setText
            if (!this.isDismissed) {
                this.prefs.messageContent = newText;
                findElement('.bell_text', this.displayUnit).innerHTML = newText;
            }
            return this;
        },

        updateStyle(newKind) { // Renamed from setType
            if (!this.isDismissed) {
                this.prefs.type = newKind; // Keep type property consistent
                this.prefs.appearance.applyStyle(this);
                this.prefs.appearance.eventHooks.onDisplay.apply(this);
            }
            return this;
        },

        setDismissTimer(duration) { // Renamed from setTimeout
            if (!this.isDismissed) {
                if (this.dismissTimer) {
                    clearTimeout(this.dismissTimer);
                }
                this.prefs.autoDismissDelay = duration;
                if (duration) {
                    this.dismissTimer = setTimeout(() => this.dismiss(), duration);
                }
            }
            return this;
        },

        isDismissed: false,
        displayed: false
    };

    // --- BellManager (Renamed from $.notyRenderer) ---
    const bellManager = {

        initiate(userPrefs) {
            // Manager creates a new notification instance
            const notificationInstance = Object.create(BellInstancePrototype).initialize(userPrefs);

            (notificationInstance.prefs.prioritize) ?
                bellState.pendingNotifications.unshift(notificationInstance) :
                bellState.pendingNotifications.push(notificationInstance);

            bellManager.processQueue();

            return (bellState.returnInstance) ? notificationInstance : notificationInstance.prefs.identifier;
        },

        processQueue() {
            const nextInQueue = bellState.pendingNotifications[0];

            if (nextInQueue && typeof nextInQueue === 'object') {
                if (nextInQueue.prefs.processIndependently) {
                    bellManager.displayNext(bellState.pendingNotifications.shift());
                } else {
                    if (bellState.canProcessNext) {
                        bellManager.displayNext(bellState.pendingNotifications.shift());
                        bellState.canProcessNext = false;
                    }
                }
            } else {
                bellState.canProcessNext = true; // Queue is over
            }
        },

        displayNext(notificationInstance) {
            if (notificationInstance.prefs.isModal) {
                bellManager.createOverlay(notificationInstance);
                bellManager.setModalCounter(+1);
            }

            // Where is the container?
            const containerSelector = notificationInstance.prefs.position.container.selector;
            let targetContainer = findElement(containerSelector);

            if (!targetContainer) {
                if (notificationInstance.prefs.customElement) {
                    notificationInstance.prefs.customElement.appendChild(createDomElement(notificationInstance.prefs.position.container.element));
                    targetContainer = findElement(containerSelector); // Re-find the element after appending
                } else {
                    document.body.appendChild(createDomElement(notificationInstance.prefs.position.container.element));
                    targetContainer = findElement(containerSelector); // Re-find
                }
                addClass(targetContainer, 'newly-created'); // Mark as created by manager
            } else {
                removeClass(targetContainer, 'newly-created'); // Ensure it's not marked if it pre-existed
            }

            bellManager.setLayoutCounter(notificationInstance, +1);

            notificationInstance.display();
        },

        createOverlay(notificationInstance) {
            if (!findElement('.bell_overlay')) {
                const overlay = document.createElement('div');
                addClass(overlay, 'bell_overlay');
                overlay.setAttribute('data-bell_modal_count', 0);
                setCss(overlay, notificationInstance.prefs.appearance.overlayStyle);
                document.body.prepend(overlay); // Prepend to body
                // Apply transition for fade-in
                setCss(overlay, { transition: 'opacity 0.2s ease-in', opacity: 1 });
            }
        },

        getLayoutCounter(notificationInstance) {
            const selector = notificationInstance.prefs.position.container.selector;
            const container = findElement(selector);
            return container ? parseInt(container.getAttribute('data-bell_layout_count') || 0, 10) : 0;
        },

        setLayoutCounter(notificationInstance, delta) {
            const selector = notificationInstance.prefs.position.container.selector;
            const container = findElement(selector);
            if (container) {
                const currentCount = bellManager.getLayoutCounter(notificationInstance);
                container.setAttribute('data-bell_layout_count', currentCount + delta);
            }
        },

        getModalCounter() {
            const modalOverlay = findElement('.bell_overlay');
            return modalOverlay ? parseInt(modalOverlay.getAttribute('data-bell_modal_count') || 0, 10) : 0;
        },

        setModalCounter(delta) {
            const modalOverlay = findElement('.bell_overlay');
            if (modalOverlay) {
                const currentCount = bellManager.getModalCounter();
                modalOverlay.setAttribute('data-bell_modal_count', currentCount + delta);
            }
        }
    };

    // --- Public API (Renamed from $.noty & noty global function) ---
    const bellService = {
        show: function (options) {
            // This global function acts as the entry point and handles legacy options
            const processedOptions = deepMerge({}, options); // Start with a copy

            const oldToNewMapping = {
                'animateOpen': 'motion.open',
                'animateClose': 'motion.close',
                'easing': 'motion.easing',
                'speed': 'motion.speed',
                'onShow': 'eventHooks.onDisplay',
                'onShown': 'eventHooks.afterDisplay',
                'onClose': 'eventHooks.onDismiss',
                'onClosed': 'eventHooks.afterDismiss',
                'layout': 'position', // Direct map
                'theme': 'appearance', // Direct map
                'text': 'messageContent', // Direct map
                'dismissQueue': 'processIndependently', // Direct map
                'timeout': 'autoDismissDelay', // Direct map
                'force': 'prioritize', // Direct map
                'modal': 'isModal', // Direct map
                'closeWith': 'dismissOn', // Direct map
                'callback': 'eventHooks', // Direct map
                'buttons': 'actionButtons' // Direct map
            };

            for (const oldKey in oldToNewMapping) {
                if (processedOptions.hasOwnProperty(oldKey)) {
                    const newKeyPath = oldToNewMapping[oldKey].split('.');
                    let currentTarget = processedOptions;
                    for (let i = 0; i < newKeyPath.length - 1; i++) {
                        if (!currentTarget[newKeyPath[i]]) {
                            currentTarget[newKeyPath[i]] = {};
                        }
                        currentTarget = currentTarget[newKeyPath[i]];
                    }
                    currentTarget[newKeyPath[newKeyPath.length - 1]] = processedOptions[oldKey];
                    delete processedOptions[oldKey];
                }
            }

            // Specific legacy mappings for closeWith
            if (!processedOptions.dismissOn) {
                processedOptions.dismissOn = bellService.settings.dismissOn;
            }
            if (processedOptions.hasOwnProperty('closeButton')) {
                if (processedOptions.closeButton) processedOptions.dismissOn.push('button');
                delete processedOptions.closeButton;
            }
            if (processedOptions.hasOwnProperty('closeOnSelfClick')) {
                if (processedOptions.closeOnSelfClick) processedOptions.dismissOn.push('click');
                delete processedOptions.closeOnSelfClick;
            }
            if (processedOptions.hasOwnProperty('closeOnSelfOver')) {
                if (processedOptions.closeOnSelfOver) processedOptions.dismissOn.push('hover');
                delete processedOptions.closeOnSelfOver;
            }

            // Custom element mapping
            if (processedOptions.hasOwnProperty('custom')) {
                if (processedOptions.custom && processedOptions.custom.nodeType) { // Check if it's a DOM element
                    processedOptions.customElement = processedOptions.custom;
                } else if (typeof processedOptions.custom === 'string') { // If it's a selector string
                    processedOptions.customElement = findElement(processedOptions.custom);
                }
                delete processedOptions.custom;
            }

            // Theme name mapping
            if (processedOptions.appearance === 'noty_theme_default') {
                processedOptions.appearance = 'standardAppearance';
            }

            // Dismiss queue logic based on position
            if (!processedOptions.hasOwnProperty('processIndependently')) {
                const nonQueuedPositions = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
                if (nonQueuedPositions.includes(processedOptions.position)) {
                    processedOptions.processIndependently = true;
                } else {
                    processedOptions.processIndependently = false;
                }
            }

            // Button click mapping
            if (processedOptions.actionButtons) {
                processedOptions.actionButtons.forEach(button => {
                    if (button.click) {
                        button.onClick = button.click;
                        delete button.click;
                    }
                });
            }

            return bellManager.initiate(processedOptions);
        },

        fetch: function (id) { // Renamed from $.noty.get
            return bellState.activeNotifications.hasOwnProperty(id) ? bellState.activeNotifications[id] : false;
        },

        closeItem: function (id) { // Renamed from $.noty.close
            const instance = bellService.fetch(id);
            return instance ? instance.dismiss() : false;
        },

        changeText: function (id, text) { // Renamed from $.noty.setText
            const instance = bellService.fetch(id);
            return instance ? instance.updateContent(text) : false;
        },

        changeType: function (id, type) { // Renamed from $.noty.setType
            const instance = bellService.fetch(id);
            return instance ? instance.updateStyle(type) : false;
        },

        clearPending: function () { // Renamed from $.noty.clearQueue
            bellState.pendingNotifications = [];
        },

        closeAllActive: function () { // Renamed from $.noty.closeAll
            bellService.clearPending();
            Object.values(bellState.activeNotifications).forEach(instance => {
                instance.dismiss();
            });
        },

        consumeSystemAlert: function (options) { // Renamed from $.noty.consumeAlert
            window.alert = function (message) {
                const alertOptions = options ? deepMerge({}, options, { messageContent: message }) : { messageContent: message };
                bellService.show(alertOptions);
            };
        },

        restoreSystemAlert: function () { // Renamed from $.noty.stopConsumeAlert
            window.alert = bellState.systemAlertBackup;
        },

        // Exposing internal configuration objects directly
        settings: bellState.globalSettings,
        positions: bellState.positionConfigurations,
        visuals: bellState.visualStyleDefinitions
    };

    // --- Default Settings (Renamed from $.noty.defaults) ---
    bellState.globalSettings = {
        position: 'top',
        appearance: 'standardAppearance',
        type: 'info', // Changed from alert to info
        messageContent: '',
        processIndependently: true,
        markupTemplate: '<div class="bell_unit bell_bar"><span class="bell_text"></span><div class="bell_close"></div></div>',
        motion: {
            open: { initial: { opacity: 0, transform: 'translateY(-100%)' }, final: { opacity: 1, transform: 'translateY(0)' } },
            close: { initial: { opacity: 1, transform: 'translateY(0)' }, final: { opacity: 0, transform: 'translateY(-100%)' } },
            easing: 'ease-out', // Changed from swing
            speed: 300 // Changed from 500
        },
        autoDismissDelay: false,
        prioritize: false,
        isModal: false,
        dismissOn: ['click'],
        eventHooks: {
            onDisplay: function () { },
            afterDisplay: function () { },
            onDismiss: function () { },
            afterDismiss: function () { }
        },
        actionButtons: false
    };

    // --- Default Position Configurations (Renamed from $.noty.layouts) ---
    bellState.positionConfigurations.top = {
        container: {
            selector: '.bell_container_top',
            element: '<div class="bell_container bell_container_top"></div>',
            applyStyle: function (el) {
                setCss(el, {
                    top: '0', left: '0', width: '100%', height: 'auto',
                    position: 'fixed', zIndex: '9999999', textAlign: 'center'
                });
            }
        },
        applyCSS: function (el) {
            setCss(el, {
                margin: '10px auto',
                width: '300px'
            });
        },
        cssClass: 'bell_position_top',
        options: {} // Layout specific options
    };
    bellState.positionConfigurations.inline = { // For custom elements
        container: {
            selector: '.bell_container_inline',
            element: '<div class="bell_container bell_container_inline"></div>',
            applyStyle: function (el) {
                setCss(el, {
                    position: 'relative',
                    width: '100%',
                    height: 'auto'
                });
            }
        },
        applyCSS: function (el) {
            setCss(el, {
                margin: '0',
                width: '100%'
            });
        },
        cssClass: 'bell_position_inline',
        options: {
            processIndependently: true // Inline notifications often don't queue
        }
    };
    // Add more layout configurations here following the same pattern

    // --- Default Visual Style Definitions (Renamed from $.noty.themes) ---
    bellState.visualStyleDefinitions.standardAppearance = {
        applyStyle: function (instance) {
            const el = instance.displayUnit;
            setCss(el, {
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '10px',
                color: '#333',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            });
            // Specific styles based on type (alert, success, error, warning)
            removeClass(el, 'bell_type_info bell_type_success bell_type_error bell_type_warning');
            addClass(el, `bell_type_${instance.prefs.type}`);
        },
        eventHooks: {
            onDisplay: function () { },
            onDismiss: function () { }
        },
        overlayStyle: {
            position: 'fixed',
            top: '0', left: '0', right: '0', bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: '9999998',
            opacity: '0' // Start transparent for fade-in
        }
    };
    // Add more theme configurations here

    // --- Window Resize Listener (Vanilla JS) ---
    addEventHandler(window, 'resize', function () {
        Object.values(bellState.positionConfigurations).forEach(position => {
            const container = findElement(position.container.selector);
            if (container) {
                position.container.applyStyle(container);
            }
        });
    });

    // --- Expose Global API ---
    window.createBell = bellService.show;
    window.bellService = bellService;

})();