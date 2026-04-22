const componentContainer = (function() {
    const componentStorage = new Map();
    const serviceAssembler = {
        registerComponent: function(identifier, constructor) {
            if (componentStorage.has(identifier)) {
                // console.warn(`Component with identifier "${identifier}" already registered.`);
            }
            componentStorage.set(identifier, constructor);
        },
        obtainComponent: function(identifier) {
            const ComponentConstructor = componentStorage.get(identifier);
            if (!ComponentConstructor) {
                console.error(`Component with identifier "${identifier}" not found.`);
                return null;
            }
            return new ComponentConstructor(Promise);
        }
    };
    return serviceAssembler;
})();

class VisualPopup {
    constructor(initialOptions = {}) {
        this.domNode = document.createElement('div');
        this.domNode.className = 'custom-modal-overlay-outer';
        this.domNode.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center;';

        this.innerBox = document.createElement('div');
        this.innerBox.className = 'custom-modal-box-inner';
        this.innerBox.style.cssText = 'background:#fff; border:1px solid #ccc; border-radius:4px; box-shadow:0 2px 10px rgba(0,0,0,0.2); min-width:300px; max-width:80%; max-height:90%; overflow:auto; position:relative; display:flex; flex-direction:column;';

        this.headerSection = document.createElement('div');
        this.headerSection.className = 'custom-modal-header-section';
        this.headerSection.style.cssText = 'padding:10px 15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;';

        this.titleElement = document.createElement('h3');
        this.titleElement.className = 'custom-modal-title-text';
        this.titleElement.style.cssText = 'margin:0; font-size:1.2em;';

        this.closeButton = document.createElement('span');
        this.closeButton.className = 'custom-modal-close-trigger';
        this.closeButton.innerHTML = '&times;';
        this.closeButton.style.cssText = 'cursor:pointer; font-size:1.5em; line-height:1; padding:0 5px;';
        this.closeButton.onclick = () => this.onInternalCloseTrigger();

        this.contentSection = document.createElement('div');
        this.contentSection.className = 'custom-modal-content-area';
        this.contentSection.style.cssText = 'padding:15px; flex-grow:1; overflow:auto;';

        this.footerSection = document.createElement('div');
        this.footerSection.className = 'custom-modal-footer-area';
        this.footerSection.style.cssText = 'padding:10px 15px; border-top:1px solid #eee; text-align:right; flex-shrink:0;';

        this.headerSection.appendChild(this.titleElement);
        this.headerSection.appendChild(this.closeButton);
        this.innerBox.appendChild(this.headerSection);
        this.innerBox.appendChild(this.contentSection);
        this.innerBox.appendChild(this.footerSection);
        this.domNode.appendChild(this.innerBox);
        document.body.appendChild(this.domNode);

        this.displayState = false;
        this.currentSettings = initialOptions;
        this.onInternalCloseTrigger = () => this.hide(); // Default internal close action
        this.applySettings(initialOptions);

        this.domNode.addEventListener('click', (event) => {
            if (event.target === this.domNode && this.currentSettings.modal !== false) {
                this.onInternalCloseTrigger();
            }
        });
    }

    applySettings(settings) {
        Object.assign(this.currentSettings, settings);
        if (settings.title) {
            this.titleElement.textContent = settings.title;
        }
        if (settings.buttons) {
            this.constructActionButtons(settings.buttons);
        }
        if (settings.width) {
            this.innerBox.style.width = typeof settings.width === 'number' ? `${settings.width}px` : settings.width;
        }
        if (settings.height) {
            this.innerBox.style.height = typeof settings.height === 'number' ? `${settings.height}px` : settings.height;
        }
        if (settings.position) {
             const pos = settings.position;
             this.innerBox.style.position = 'absolute';
             this.innerBox.style.left = typeof pos.left === 'number' ? `${pos.left}px` : pos.left;
             this.innerBox.style.top = typeof pos.top === 'number' ? `${pos.top}px` : pos.top;
             this.domNode.style.display = 'flex';
             this.domNode.style.justifyContent = 'flex-start';
             this.domNode.style.alignItems = 'flex-start';
        } else {
             this.innerBox.style.position = 'relative';
             this.innerBox.style.left = '';
             this.innerBox.style.top = '';
             this.domNode.style.justifyContent = 'center';
             this.domNode.style.alignItems = 'center';
        }
    }

    constructActionButtons(buttonConfiguration) {
        this.footerSection.innerHTML = '';
        const buttonsArray = Array.isArray(buttonConfiguration) ? buttonConfiguration : Object.entries(buttonConfiguration).map(([name, handler]) => ({ text: name, click: handler }));

        buttonsArray.forEach(btnInfo => {
            const buttonElement = document.createElement('button');
            buttonElement.textContent = btnInfo.text;
            buttonElement.onclick = btnInfo.click;
            buttonElement.style.cssText = 'margin-left:8px; padding:8px 15px; border:1px solid #ccc; border-radius:3px; background:#f0f0f0; cursor:pointer;';
            this.footerSection.appendChild(buttonElement);
        });
    }

    display() {
        this.domNode.style.display = 'flex';
        this.displayState = true;
        VisualPopup.incrementZIndex();
        this.innerBox.style.zIndex = VisualPopup.currentHighestZIndex;
    }

    hide() {
        this.domNode.style.display = 'none';
        this.displayState = false;
    }

    getDisplayed() {
        return this.displayState;
    }

    moveUp() {
        VisualPopup.incrementZIndex();
        this.innerBox.style.zIndex = VisualPopup.currentHighestZIndex;
    }

    getSetting(key) {
        return this.currentSettings[key];
    }

    setSetting(key, value) {
        this.currentSettings[key] = value;
        this.applySettings({ [key]: value });
    }

    insertContent(elementOrHtml) {
        this.contentSection.innerHTML = '';
        if (typeof elementOrHtml === 'string') {
            this.contentSection.innerHTML = elementOrHtml;
        } else if (elementOrHtml instanceof Node) {
            this.contentSection.appendChild(elementOrHtml);
        }
    }

    getInternalElementContainer() {
        return this.innerBox;
    }
}

VisualPopup.currentHighestZIndex = 1000;
VisualPopup.incrementZIndex = function() {
    VisualPopup.currentHighestZIndex += 2;
};

class PopupController {
    constructor(promisor) {
        this.promiseFactory = promisor;
        this.resolutionHandle = null;
        this.visualComponent = null;
        this.onActivationRoutine = null;
        this.onDeactivationRoutine = null;
        this.associatedDataContext = null;
        this.transferArgumentsToContext = false;
    }

    isDisplayed() {
        return this.visualComponent.getDisplayed();
    }

    bringToFront() {
        this.visualComponent.moveUp();
    }

    retrieveSetting(key) {
        return this.visualComponent.getSetting(key);
    }

    alterSetting(key, value) {
        this.visualComponent.setSetting(key, value);
    }

    displayWindow(inputParameters) {
        let activationPromise = null;
        this.resolutionHandle = {};
        const mainPromise = new this.promiseFactory((resolve, reject) => {
            this.resolutionHandle.resolve = resolve;
            this.resolutionHandle.reject = reject;
        });

        if (this.onActivationRoutine) {
            activationPromise = this.onActivationRoutine(inputParameters);
        }

        if (this.transferArgumentsToContext && inputParameters && this.associatedDataContext) {
            Object.entries(inputParameters).forEach(([key, value]) => {
                this.associatedDataContext[key] = value;
            });
        }

        return this.promiseFactory.resolve(activationPromise)
            .then(() => {
                this.visualComponent.display();
                return mainPromise;
            });
    }

    hideWindow(outcomeData) {
        if (this.onDeactivationRoutine) {
            this.onDeactivationRoutine(outcomeData);
        }
        this.visualComponent.hide();
        if (this.resolutionHandle && this.resolutionHandle.resolve) {
            this.resolutionHandle.resolve(outcomeData);
            this.resolutionHandle = null;
        }
    }
}

const knownModalSettings = [
    'title', 'autoOpen', 'buttons', 'closeOnEscape', 'closeText', 'appendTo',
    'classes', 'dialogClass', 'draggable', 'height', 'hide', 'maxHeight',
    'maxWidth', 'minHeight', 'minWidth', 'modal', 'position', 'resizable',
    'show', 'stack', 'width', 'zIndex',
    'beforeClose', 'close', 'create', 'drag', 'dragStart', 'dragStop', 'focus', 'open', 'resize', 'resizeStart', 'resizeStop'
];

function initializeModalComponents() {
    'use strict';

    const modalElements = document.querySelectorAll('[modal-window-container]');

    modalElements.forEach(currentElement => {
        const controllerIdentifier = currentElement.getAttribute('data-window-name');
        if (!controllerIdentifier) {
            console.error('Modal window element missing data-window-name attribute:', currentElement);
            return;
        }

        componentContainer.registerComponent(controllerIdentifier + 'Controller', PopupController);
        const controllerInstance = componentContainer.obtainComponent(controllerIdentifier + 'Controller');

        const initialSettingsMap = new Map();

        knownModalSettings.forEach(settingKey => {
            const attributeName = `data-window-${settingKey.toLowerCase()}`;
            if (currentElement.hasAttribute(attributeName)) {
                try {
                    let parsedValue = JSON.parse(currentElement.getAttribute(attributeName));
                    initialSettingsMap.set(settingKey, parsedValue);
                } catch (e) {
                    initialSettingsMap.set(settingKey, currentElement.getAttribute(attributeName));
                }
            }
        });

        const visualComponent = new VisualPopup(Object.fromEntries(initialSettingsMap));
        controllerInstance.visualComponent = visualComponent;
        visualComponent.onInternalCloseTrigger = controllerInstance.hideWindow.bind(controllerInstance);

        const buttonsConfig = initialSettingsMap.get('buttons');
        if (buttonsConfig) {
            const processButtonHandler = (handler) => {
                if (handler === 'close') {
                    return controllerInstance.hideWindow.bind(controllerInstance);
                }
                return handler;
            };

            if (Array.isArray(buttonsConfig)) {
                buttonsConfig.forEach(btn => {
                    btn.click = processButtonHandler(btn.click);
                });
            } else if (typeof buttonsConfig === 'object') {
                Object.entries(buttonsConfig).forEach(([btnName, handler]) => {
                    buttonsConfig[btnName] = processButtonHandler(handler);
                });
            }
            visualComponent.constructActionButtons(buttonsConfig);
        }

        const onOpenFuncName = currentElement.getAttribute('data-on-activate');
        if (onOpenFuncName && typeof window[onOpenFuncName] === 'function') {
            controllerInstance.onActivationRoutine = window[onOpenFuncName];
        }

        const onCloseFuncName = currentElement.getAttribute('data-on-deactivate');
        if (onCloseFuncName && typeof window[onCloseFuncName] === 'function') {
            controllerInstance.onDeactivationRoutine = window[onCloseFuncName];
        }

        const stylingMapAttr = currentElement.getAttribute('data-button-styling');
        if (stylingMapAttr) {
            try {
                const stylingMap = JSON.parse(stylingMapAttr);
                if (stylingMap && typeof stylingMap === 'object') {
                    const actionButtons = visualComponent.footerSection.querySelectorAll('button');
                    actionButtons.forEach(btn => {
                        const btnText = btn.textContent;
                        if (stylingMap[btnText]) {
                            btn.classList.add(stylingMap[btnText]);
                        }
                    });
                }
            } catch (e) {
                console.error('Error parsing data-button-styling:', e);
            }
        }

        const inputToContextFlag = currentElement.getAttribute('data-transfer-args-to-context');
        controllerInstance.transferArgumentsToContext = (inputToContextFlag === 'true');
        controllerInstance.associatedDataContext = window;

        const initialContent = Array.from(currentElement.childNodes);
        const contentFragment = document.createDocumentFragment();
        initialContent.forEach(node => contentFragment.appendChild(node));
        visualComponent.insertContent(contentFragment);

        currentElement.parentNode.removeChild(currentElement);
    });
}

document.addEventListener('DOMContentLoaded', initializeModalComponents);

window.retrieveComponent = componentContainer.obtainComponent;