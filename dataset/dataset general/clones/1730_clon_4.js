const ConfirmationManager = (function() {
    function combineConfigurations(target, ...sources) {
        if (typeof target !== 'object' || target === null) {
            target = {};
        }
        for (const source of sources) {
            if (typeof source !== 'object' || source === null) {
                continue;
            }
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null) {
                        target[key] = combineConfigurations(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    }

    function constructElement(tagName, attributes = {}, children = []) {
        const element = document.createElement(tagName);
        for (const key in attributes) {
            if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'dataset') {
                    for (const dataKey in attributes[key]) {
                        if (Object.prototype.hasOwnProperty.call(attributes[key], dataKey)) {
                            element.dataset[dataKey] = attributes[key][dataKey];
                        }
                    }
                } else if (key === 'textContent') {
                    element.textContent = attributes[key];
                } else if (key === 'htmlContent') {
                    element.innerHTML = attributes[key];
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            }
        }
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            } else if (child) { // null or undefined children should be ignored
                // Potentially log an error for unexpected child type
            }
        });
        return element;
    }

    const globalConfiguration = {
        messageText: "Are you sure?",
        dialogTitle: "",
        positiveButtonLabel: "Yes",
        negativeButtonLabel: "Cancel",
        performPost: false,
        positiveButtonClass: "btn-primary",
        negativeButtonClass: "btn-default",
        dialogContainerClass: "modal-dialog",
        onConfirm: function() {},
        onCancel: function() {}
    };

    const attributeToPropertyMap = {
        'data-dialog-title': 'dialogTitle',
        'data-dialog-text': 'messageText',
        'data-confirm-button': 'positiveButtonLabel',
        'data-cancel-button': 'negativeButtonLabel',
        'data-confirm-button-class': 'positiveButtonClass',
        'data-cancel-button-class': 'negativeButtonClass',
        'data-dialog-class': 'dialogContainerClass'
    };

    function retrieveElementAttributes(targetElement) {
        const extracted = {};
        if (!targetElement || !(targetElement instanceof HTMLElement)) {
            return extracted;
        }

        for (const attr in attributeToPropertyMap) {
            const value = targetElement.getAttribute(attr);
            if (value !== null) {
                extracted[attributeToPropertyMap[attr]] = value;
            }
        }
        return extracted;
    }

    function displayModal(dialogConfig, triggeringEvent) {
        if (document.querySelector('.confirmation-overlay')) {
            return;
        }

        const finalConfig = combineConfigurations({}, globalConfiguration, dialogConfig);

        let defaultConfirmAction = function() {
            let targetURL = null;
            if (triggeringEvent) {
                if (typeof triggeringEvent === 'string') {
                    targetURL = triggeringEvent;
                } else if (triggeringEvent.currentTarget && triggeringEvent.currentTarget.href) {
                    targetURL = triggeringEvent.currentTarget.href;
                } else if (triggeringEvent.currentTarget && triggeringEvent.currentTarget.attributes && triggeringEvent.currentTarget.attributes['href']) {
                    // Fallback for older browsers or specific attribute access
                    targetURL = triggeringEvent.currentTarget.attributes['href'].value;
                }
            }

            if (targetURL) {
                if (finalConfig.performPost) {
                    const postForm = constructElement('form', {
                        method: 'post',
                        className: 'hidden-form',
                        action: targetURL
                    });
                    document.body.appendChild(postForm);
                    postForm.submit();
                } else {
                    window.location.href = targetURL;
                }
            }
        };

        if (!finalConfig.onConfirm || finalConfig.onConfirm === globalConfiguration.onConfirm) {
            finalConfig.onConfirm = defaultConfirmAction;
        }

        let dialogHeaderContent = null;
        if (finalConfig.dialogTitle) {
            dialogHeaderContent = constructElement('div', { className: 'modal-header-section' }, [
                constructElement('button', { type: 'button', className: 'close-button', 'aria-hidden': 'true', htmlContent: '&times;', 'data-dismiss': 'modal' }),
                constructElement('h4', { className: 'modal-title-header', textContent: finalConfig.dialogTitle })
            ]);
        }

        const confirmButton = constructElement('button', {
            className: `action-button primary-action-button ${finalConfig.positiveButtonClass}`,
            type: 'button',
            textContent: finalConfig.positiveButtonLabel,
            'data-dismiss': 'modal'
        });

        const cancelButton = constructElement('button', {
            className: `action-button secondary-action-button ${finalConfig.negativeButtonClass}`,
            type: 'button',
            textContent: finalConfig.negativeButtonLabel,
            'data-dismiss': 'modal'
        });

        const dialogContent = constructElement('div', { className: 'modal-content-area' }, [
            dialogHeaderContent,
            constructElement('div', { className: 'modal-body-content', textContent: finalConfig.messageText }),
            constructElement('div', { className: 'modal-footer-section' }, [
                confirmButton,
                cancelButton
            ])
        ]);

        const modalDialog = constructElement('div', { className: `modal-dialog-container ${finalConfig.dialogContainerClass}` }, [
            dialogContent
        ]);

        const overlayElement = constructElement('div', { className: 'confirmation-overlay modal-backdrop' });
        const dialogWrapper = constructElement('div', { className: 'confirmation-dialog-wrapper modal fade', role: 'dialog', 'aria-hidden': 'true', tabindex: '-1' }, [
            modalDialog
        ]);

        document.body.appendChild(overlayElement);
        document.body.appendChild(dialogWrapper);
        document.body.classList.add('modal-active-state');

        setTimeout(() => {
            dialogWrapper.classList.add('show');
            overlayElement.classList.add('show');
        }, 10);

        const closeDialog = () => {
            dialogWrapper.classList.remove('show');
            overlayElement.classList.remove('show');
            document.body.classList.remove('modal-active-state');

            const transitionDuration = parseFloat(getComputedStyle(dialogWrapper).transitionDuration) * 1000;
            setTimeout(() => {
                if (dialogWrapper.parentNode) dialogWrapper.parentNode.removeChild(dialogWrapper);
                if (overlayElement.parentNode) overlayElement.parentNode.removeChild(overlayElement);
            }, transitionDuration > 0 ? transitionDuration : 200);
        };

        confirmButton.addEventListener('click', () => {
            finalConfig.onConfirm(dialogConfig.sourceElement);
            closeDialog();
        });

        cancelButton.addEventListener('click', () => {
            finalConfig.onCancel(dialogConfig.sourceElement);
            closeDialog();
        });

        const headerCloseButton = dialogHeaderContent ? dialogHeaderContent.querySelector('.close-button') : null;
        if (headerCloseButton) {
            headerCloseButton.addEventListener('click', () => {
                finalConfig.onCancel(dialogConfig.sourceElement);
                closeDialog();
            });
        }

        setTimeout(() => {
            const firstPrimaryButton = dialogWrapper.querySelector('.primary-action-button');
            if (firstPrimaryButton) {
                firstPrimaryButton.focus();
            }
        }, 100);
    }

    function bindConfirmationToElements(selector, elementConfig = {}) {
        const targetElements = typeof selector === 'string' ? document.querySelectorAll(selector) : (selector instanceof HTMLElement ? [selector] : []);

        targetElements.forEach(targetElement => {
            targetElement.addEventListener('click', (evt) => {
                evt.preventDefault();

                const extractedAttrs = retrieveElementAttributes(targetElement);
                const combinedInvocationConfig = combineConfigurations({
                    sourceElement: targetElement
                }, elementConfig, extractedAttrs);

                displayModal(combinedInvocationConfig, evt);
            });
        });
        return {
            elements: targetElements,
            manager: ConfirmationManager
        };
    }

    return {
        setDefaults: function(newDefaults) {
            combineConfigurations(globalConfiguration, newDefaults);
        },
        presentDialog: displayModal,
        bindTo: bindConfirmationToElements
    };
})();

window.ConfirmatorUtility = {
    show: function(options, event) {
        ConfirmationManager.presentDialog(options, event);
    },
    defaults: function(options) {
        ConfirmationManager.setDefaults(options);
    }
};

HTMLElement.prototype.confirmPrompt = function(options) {
    ConfirmationManager.bindTo(this, options);
    return this;
};

Document.prototype.confirmPrompt = function(selector, options) {
    ConfirmationManager.bindTo(selector, options);
    return this;
};

// Initial default configuration
ConfirmationManager.setDefaults({
    messageText: "Confirm this action?",
    dialogTitle: "",
    positiveButtonLabel: "Confirm",
    negativeButtonLabel: "Dismiss",
    performPost: false,
    positiveButtonClass: "btn-primary",
    negativeButtonClass: "btn-secondary",
    dialogContainerClass: "modal-dialog"
});