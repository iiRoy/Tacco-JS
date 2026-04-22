const DialogMaster = (function(win, doc) {
    'use strict';

    const baseConfigs = {
        kind: 'message',
        headline: '',
        subheading: '',
        bodyText: '',
        actions: {
            CONFIRM: {
                caption: 'Okay',
                attributes: {
                    dataId: 'confirm_action',
                    cssClass: 'dialog-action dialog-confirm'
                }
            },
            DECLINE: {
                caption: 'Decline',
                attributes: {
                    dataId: 'decline_action',
                    cssClass: 'dialog-action dialog-decline'
                }
            }
        },
        curtain: true,
        headVisible: true,
        transition: 'shift-in',
        delayMs: 0,
        origin: 'center',
        coordX: '50%',
        coordY: '80%',
        dismissOnClick: false,
        displayDuration: 2000,
        onSuccess: null,
        onCancel: null,
        onCompletion: null
    };

    let dialogQueue = [];
    let isProcessing = false;
    let currentActiveDialog = null;

    const mergeOptions = (base, overrides) => {
        const merged = { ...base };
        for (const key in overrides) {
            if (Object.prototype.hasOwnProperty.call(overrides, key)) {
                if (typeof merged[key] === 'object' && merged[key] !== null &&
                    typeof overrides[key] === 'object' && overrides[key] !== null &&
                    !Array.isArray(merged[key]) && !Array.isArray(overrides[key])) {
                    merged[key] = { ...merged[key], ...overrides[key] };
                } else {
                    merged[key] = overrides[key];
                }
            }
        }
        return merged;
    };

    const contains = (arr, item) => arr.includes(item);
    const allowedKinds = () => ['message', 'query', 'temporary'];

    const applyClass = (element, className, callback = null) => {
        if (element) {
            element.classList.add(className);
            if (callback) setTimeout(callback, 0);
        }
    };

    const removeClass = (element, className, callback = null) => {
        if (element) {
            element.classList.remove(className);
            if (callback) setTimeout(callback, 0);
        }
    };

    const grabElement = (id, isCustomId = false) => {
        if (isCustomId && id.startsWith('#')) {
            id = id.substring(1);
        }
        const element = doc.getElementById(id);
        if (element) {
            return { innerHTML: element.innerHTML };
        }
        return null;
    };

    const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

    const buildElement = (tag, classNames = '', attributes = {}, content = '') => {
        const element = doc.createElement(tag);
        if (classNames) {
            element.className = classNames;
        }
        for (const attr in attributes) {
            if (Object.prototype.hasOwnProperty.call(attributes, attr)) {
                element.setAttribute(attr, attributes[attr]);
            }
        }
        if (content) {
            element.innerHTML = content;
        }
        return element;
    };

    const DialogInstance = function(settings) {
        this.config = settings;
        this.outerWrapper = null;
        this.backdrop = null;
        this.headSection = null;
        this.headlineElement = null;
        this.subheadingElement = null;
        this.mainContent = null;
        this.inputField = null;
        this.footSection = null;
        this.confirmButton = null;
        this.declineButton = null;
    };

    DialogInstance.prototype.constructView = function() {
        const cfg = this.config;

        if (cfg.kind === 'temporary') {
            cfg.curtain = false;
            cfg.headVisible = false;
            cfg.origin = 'center';
            cfg.actions = false;
        }

        this.outerWrapper = buildElement('section', `dialog-container dialog-entry-${cfg.origin} ${cfg.kind}`, { 'data-id': 'dialog-master-main' });
        this.mainContent = buildElement('div', 'dialog-body');

        if (cfg.bodyText.charAt(0) === '#') {
            const customEl = grabElement(cfg.bodyText, true);
            if (customEl) {
                this.mainContent.innerHTML = customEl.innerHTML;
            }
        } else {
            this.mainContent.innerHTML = cfg.bodyText;
        }

        if (cfg.headVisible) {
            this.headSection = buildElement('header', 'dialog-header');
            this.headlineElement = buildElement('h1', '', {}, cfg.headline);
            this.headSection.appendChild(this.headlineElement);
            if (cfg.subheading) {
                this.subheadingElement = buildElement('h2', '', {}, cfg.subheading);
                this.headSection.appendChild(this.subheadingElement);
            }
        }

        if (cfg.kind === 'query') {
            this.inputField = buildElement('input', 'dialog-input', { type: 'text' });
            this.mainContent.appendChild(this.inputField);
        }

        this.backdrop = buildElement('div', 'dialog-curtain');

        if (cfg.actions !== false) {
            this.footSection = buildElement('footer', 'dialog-footer');
            const confirmBtnCfg = cfg.actions.CONFIRM;
            if (confirmBtnCfg) {
                this.confirmButton = buildElement('button', confirmBtnCfg.attributes.cssClass, { id: confirmBtnCfg.attributes.dataId }, confirmBtnCfg.caption);
                this.footSection.appendChild(this.confirmButton);
            }

            const declineBtnCfg = cfg.actions.DECLINE;
            if (declineBtnCfg && cfg.kind !== 'message') {
                this.declineButton = buildElement('button', declineBtnCfg.attributes.cssClass, { id: declineBtnCfg.attributes.dataId }, declineBtnCfg.caption);
                this.footSection.appendChild(this.declineButton);
            }
        }

        if (this.headSection) {
            this.outerWrapper.appendChild(this.headSection);
        }
        this.outerWrapper.appendChild(this.mainContent);
        if (this.footSection) {
            this.outerWrapper.appendChild(this.footSection);
        }

        if (this.confirmButton) {
            this.confirmButton.onclick = () => this.handleAction(true);
        }
        if (this.declineButton) {
            this.declineButton.onclick = () => this.handleAction(false);
        }
        if (cfg.kind === 'temporary') {
            this.outerWrapper.onclick = () => this.handleAction(true);
        }
        if (cfg.dismissOnClick && cfg.curtain) {
            this.backdrop.onclick = () => this.handleAction(false);
        }

        if (this.inputField && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.inputField.focus();
        }
    };

    DialogInstance.prototype.handleAction = function(isConfirmed) {
        const cfg = this.config;
        this.conceal();

        let inputVal = null;
        let customData = {};

        if (cfg.kind === 'query' && this.inputField) {
            inputVal = this.inputField.value;
        } else if (cfg.bodyText.charAt(0) === '#') {
            customData = this.collectCustomFormData(this.outerWrapper);
        }

        if (isConfirmed && cfg.onSuccess) {
            if (cfg.kind === 'query') {
                cfg.onSuccess.call(this, inputVal);
            } else if (cfg.bodyText.charAt(0) === '#') {
                cfg.onSuccess.call(this, customData);
            } else {
                cfg.onSuccess.call(this);
            }
        } else if (!isConfirmed && cfg.onCancel) {
            cfg.onCancel.call(this);
        }

        if (cfg.onCompletion) {
            if (cfg.kind === 'query') {
                cfg.onCompletion.call(this, isConfirmed, inputVal);
            } else if (cfg.bodyText.charAt(0) === '#') {
                cfg.onCompletion.call(this, isConfirmed, customData);
            } else {
                cfg.onCompletion.call(this, isConfirmed);
            }
        }
    };

    DialogInstance.prototype.collectCustomFormData = function(containerElement) {
        const formElements = containerElement.querySelectorAll('input, textarea, select');
        const collectedData = {};
        if (formElements.length > 0) {
            formElements.forEach((el, index) => {
                const elementName = el.getAttribute('name');
                if (elementName !== null) {
                    collectedData[elementName] = el.value;
                } else {
                    collectedData[index] = el.value;
                }
            });
        }
        return collectedData;
    };

    DialogInstance.prototype.reveal = function() {
        const cfg = this.config;

        setTimeout(() => {
            doc.body.insertBefore(this.backdrop, this.outerWrapper);
            if (!cfg.curtain) {
                this.backdrop.style.visibility = 'hidden';
            }

            doc.body.appendChild(this.outerWrapper);

            applyClass(this.outerWrapper, `dialog-effect-${cfg.transition}`, () => {
                setTimeout(() => {
                    removeClass(this.outerWrapper, `dialog-entry-${cfg.origin}`);
                }, 10);
            });

            if (cfg.kind === 'temporary') {
                this.outerWrapper.style.left = cfg.coordX;
                this.outerWrapper.style.top = cfg.coordY;
                setTimeout(() => {
                    this.conceal();
                }, cfg.displayDuration);
            }

        }, cfg.delayMs);
    };

    DialogInstance.prototype.conceal = function() {
        const cfg = this.config;
        removeClass(this.outerWrapper, `dialog-effect-${cfg.transition}`);
        applyClass(this.outerWrapper, `dialog-entry-${cfg.origin}`, () => {
            if (dialogQueue.length > 0) {
                setTimeout(() => {
                    if (this.backdrop && this.backdrop.parentNode === doc.body) {
                        doc.body.removeChild(this.backdrop);
                    }
                    if (this.outerWrapper && this.outerWrapper.parentNode === doc.body) {
                        doc.body.removeChild(this.outerWrapper);
                    }
                    dialogQueue.shift();
                    isProcessing = false;
                    processNextDialog();
                }, 400);
            }
        });
    };

    const processNextDialog = () => {
        if (!isProcessing && dialogQueue.length > 0) {
            isProcessing = true;
            currentActiveDialog = dialogQueue[0];
            currentActiveDialog.constructView();
            currentActiveDialog.reveal();
        }
    };

    const PublicAPI = {
        display: function(userOptions) {
            const finalOptions = mergeOptions(baseConfigs, userOptions);

            if (!hasKey(userOptions, 'kind') || !contains(allowedKinds(), finalOptions.kind)) {
                finalOptions.kind = 'message';
            }

            const newDialog = new DialogInstance(finalOptions);
            dialogQueue.push(newDialog);
            processNextDialog();
            return this;
        },

        dismiss: function() {
            if (currentActiveDialog) {
                currentActiveDialog.conceal();
            }
            return this;
        }
    };

    return PublicAPI;

})(window, document);