const DomTools = (function(winRef) {
    const elementCache = new Map();

    function retrieveElements(cssSelector, contextNode = winRef.document) {
        if (!elementCache.has(cssSelector)) {
            elementCache.set(cssSelector, contextNode.querySelectorAll(cssSelector));
        }
        return elementCache.get(cssSelector);
    }

    function createNewElement(tagName, attributes = {}, contentHtml = '') {
        const newElem = winRef.document.createElement(tagName);
        for (const attributeKey in attributes) {
            if (attributes.hasOwnProperty(attributeKey)) {
                newElem.setAttribute(attributeKey, attributes[attributeKey]);
            }
        }
        if (contentHtml) {
            newElem.innerHTML = contentHtml;
        }
        return newElem;
    }

    function addChildElement(parentElement, childElement) {
        parentElement.appendChild(childElement);
    }

    function prependChildElement(parentElement, childElement) {
        parentElement.insertBefore(childElement, parentElement.firstChild);
    }

    function removeDomElement(targetElement) {
        if (targetElement && targetElement.parentNode) {
            targetElement.parentNode.removeChild(targetElement);
        }
    }

    function addCssClass(targetElement, className) {
        if (targetElement && className) {
            targetElement.classList.add(className);
        }
    }

    function removeCssClass(targetElement, className) {
        if (targetElement && className) {
            targetElement.classList.remove(className);
        }
    }

    function checkCssClass(targetElement, className) {
        return targetElement && className && targetElement.classList.contains(className);
    }

    function applyCssStyle(targetElement, property, value) {
        if (targetElement) {
            targetElement.style[property] = value;
        }
    }

    function retrieveCssStyle(targetElement, property) {
        return winRef.getComputedStyle(targetElement)[property];
    }

    function attachDomEvent(targetElement, eventName, eventHandler, useCapture = false) {
        if (targetElement) {
            targetElement.addEventListener(eventName, eventHandler, useCapture);
        }
    }

    function detachDomEvent(targetElement, eventName, eventHandler, useCapture = false) {
        if (targetElement) {
            targetElement.removeEventListener(eventName, eventHandler, useCapture);
        }
    }

    function iterateElements(cssSelector, callbackFunction, contextNode = winRef.document) {
        const elements = retrieveElements(cssSelector, contextNode);
        if (elements) {
            elements.forEach(callbackFunction);
        }
    }

    function getFirstMatchingElement(cssSelector, contextNode = winRef.document) {
        return contextNode.querySelector(cssSelector);
    }

    function getElementDataAttribute(targetElement, attributeName) {
        return targetElement.getAttribute(`data-${attributeName}`);
    }

    function setElementDataAttribute(targetElement, attributeName, attributeValue) {
        targetElement.setAttribute(`data-${attributeName}`, attributeValue);
    }

    return {
        select: retrieveElements,
        selectOne: getFirstMatchingElement,
        create: createNewElement,
        append: addChildElement,
        prepend: prependChildElement,
        remove: removeDomElement,
        addClass: addCssClass,
        removeClass: removeCssClass,
        hasClass: checkCssClass,
        style: applyCssStyle,
        getStyle: retrieveCssStyle,
        on: attachDomEvent,
        off: detachDomEvent,
        each: iterateElements,
        data: getElementDataAttribute,
        setData: setElementDataAttribute,
        alert: winRef.alert
    };
})(window);

if (!window.DomTools || typeof DomTools.select !== 'function') {
    DomTools.alert('Page requires DomTools library. RichTextComposer cannot proceed.');
}

const BrowserEnvironment = (function(nav) {
    const agentString = nav.userAgent;
    const applicationName = nav.appName;
    const isLegacyExplorer = applicationName === "Microsoft Internet Explorer";
    let explorerVersionString;

    if (isLegacyExplorer) {
        explorerVersionString = nav.appVersion.split(";")[1].replace(/\s/g, "");
    }

    return {
        isOldIE: isLegacyExplorer,
        isIEVersion6: isLegacyExplorer && explorerVersionString === 'MSIE6.0',
        isIEVersion7: isLegacyExplorer && explorerVersionString === 'MSIE7.0',
        isIEVersion8: isLegacyExplorer && explorerVersionString === 'MSIE8.0',
        isModernIE: !!window.ActiveXObject || "ActiveXObject" in window,
        isFirefox: agentString.includes("Firefox")
    };
})(navigator);

if (BrowserEnvironment.isIEVersion6 || BrowserEnvironment.isIEVersion7 || BrowserEnvironment.isIEVersion8) {
    const applyGlyphIcon = (targetElement, charEntity) => {
        targetElement.className = '';
        targetElement.innerHTML = `<span style="font-family: 'icomoon'">${charEntity}</span>`;
    };

    const iconGlyphMap = new Map([
        ['icon-composer-link', '&#xe800;'], ['icon-composer-unlink', '&#xe801;'],
        ['icon-composer-code', '&#xe802;'], ['icon-composer-cancel', '&#xe803;'],
        ['icon-composer-terminal', '&#xe804;'], ['icon-composer-angle-down', '&#xe805;'],
        ['icon-composer-font', '&#xe806;'], ['icon-composer-bold', '&#xe807;'],
        ['icon-composer-italic', '&#xe808;'], ['icon-composer-header', '&#xe809;'],
        ['icon-composer-align-left', '&#xe80a;'], ['icon-composer-align-center', '&#xe80b;'],
        ['icon-composer-align-right', '&#xe80c;'], ['icon-composer-list-bullet', '&#xe80d;'],
        ['icon-composer-indent-left', '&#xe80e;'], ['icon-composer-indent-right', '&#xe80f;'],
        ['icon-composer-list-numbered', '&#xe810;'], ['icon-composer-underline', '&#xe811;'],
        ['icon-composer-table', '&#xe812;'], ['icon-composer-eraser', '&#xe813;'],
        ['icon-composer-text-height', '&#xe814;'], ['icon-composer-brush', '&#xe815;'],
        ['icon-composer-pencil', '&#xe816;'], ['icon-composer-minus', '&#xe817;'],
        ['icon-composer-picture', '&#xe818;'], ['icon-composer-file-image', '&#xe819;'],
        ['icon-composer-cw', '&#xe81a;'], ['icon-composer-ccw', '&#xe81b;']
    ]);

    const initializeLegacyIcons = () => {
        DomTools.each('.composition-panel i', (elementItem) => {
            const classAttribute = elementItem.className;
            const matchesFound = classAttribute.match(/icon-composer-[^\s'"]+/);
            if (matchesFound && iconGlyphMap.has(matchesFound[0])) {
                applyGlyphIcon(elementItem, iconGlyphMap.get(matchesFound[0]));
            }
        });
    };

    if (document.readyState === 'loading') {
        DomTools.on(document, 'DOMContentLoaded', initializeLegacyIcons);
    } else {
        initializeLegacyIcons();
    }
}

const GlobalComposerContext = (function(winRef, docRef, domOps, browserInfo) {
    const pageBody = domOps.selectOne('body');

    const selectionRangeSupport = typeof docRef.createRange === 'function';

    let uniqueIdCounter = 1;
    const uniqueIdPrefix = `composer_${Math.random().toString(36).substring(2)}_`;

    const screenOverlayElement = domOps.create('div', { class: 'composer-overlay' });

    const undoHistoryLimit = 10;

    const restrictedUrlKeywords = new Set(['javascript:', '<', '>', '(', ')']);

    const CoreUtilities = {
        logMessage: (infoMessage) => {
            if (winRef.console && winRef.console.log) {
                winRef.console.log('RichTextComposer message:', infoMessage);
            }
        },
        generateUniqueId: () => {
            return uniqueIdPrefix + (uniqueIdCounter++);
        },
        validateLinkIntegrity: (inputUrl) => {
            let isSecure = true;
            for (const keyword of restrictedUrlKeywords) {
                if (inputUrl.includes(keyword)) {
                    isSecure = false;
                    break;
                }
            }
            return isSecure;
        }
    };

    if (!(browserInfo.isIEVersion6 || browserInfo.isIEVersion7)) {
        domOps.prepend(pageBody, screenOverlayElement);
    }

    const DisplayConfiguration = {
        availableFontFamilies: [
            'Songti', 'Heiti', 'Kaiti', 'Lishu', 'Youyuan', 'Microsoft YaHei',
            'Arial', 'Verdana', 'Georgia', 'Times New Roman',
            'Trebuchet MS', 'Courier New', 'Impact', 'Comic Sans MS'
        ],
        colorOptionsMap: new Map([
            ['#880000', 'Dark Red'], ['#800080', 'Purple'],
            ['#ff0000', 'Red'], ['#ff00ff', 'Bright Pink'],
            ['#000080', 'Dark Blue'], ['#0000ff', 'Blue'],
            ['#00ffff', 'Aqua'], ['#008080', 'Teal'],
            ['#008000', 'Green'], ['#808000', 'Olive'],
            ['#00ff00', 'Light Green'], ['#ffcc00', 'Orange Yellow'],
            ['#808080', 'Gray'], ['#c0c0c0', 'Silver'],
            ['#000000', 'Black']
        ]),
        fontSizeMappings: new Map([
            [1, '10px'], [2, '13px'], [3, '16px'], [4, '19px'],
            [5, '22px'], [6, '25px'], [7, '28px']
        ])
    };

    const InterfaceMarkup = {
        removeElementButton: `<a href="#" class="composer-remove-element-btn"><i class="icon-composer-cancel"></i></a>`,
        imageResizeHandle: `<div class="composer-image-resize-handle"></div>`,
        mainEditorWrapper: `<div class="composition-panel"></div>`,
        controlPanelBar: `<div class="composer-controls-bar clearfix"></div>`,
        controlButtonGrouping: `<div class="composer-control-group"></div>`,
        singleControlButton: `<a class="composer-control-item composer-control-item-default" href="#"></a>`,
        dropdownIndicator: `<i class="icon-composer-angle-down"></i>`,
        tooltipDisplay: `<div class="composer-tooltip"></div>`,
        tooltipTextContent: `<div class="composer-tooltip-content">{caption}</div>`,
        dialogsContainer: `<div class="composer-dialog-container"></div>`,
        standardDialog: `<div class="composer-dialog">{content}</div>`,
        largeDialogBox: `<div class="composer-dialog composer-dialog-large">{content}</div>`,
        smallDialogBox: `<div class="composer-dialog composer-dialog-small">{content}</div>`,
        miniDialogBox: `<div class="composer-dialog composer-dialog-tiny">{content}</div>`,
        dialogHeaderSection: `<div class="composer-dialog-header">
                                <a href="#" data-action="close" class="composer-dialog-close-btn"><i class="icon-composer-cancel"></i></a>
                                <b>{caption}</b>
                                <div class="composer-dialog-header-line"></div>
                            </div>`,
        textEditFrame: `<div class="composer-editor-frame"></div>`,
        contentEditableRegion: `<div class="composer-editable-area" contenteditable="true"></div>`,
        flyoutMenu: `<ul class="composer-dropdown-menu">{content}</ul>`
    };

    const CommandExecutionHelpers = {
        canPerformCommand: (commandId) => {
            let status;
            try {
                status = docRef.queryCommandEnabled(commandId);
            } catch (ex) {
                status = false;
            }
            return status;
        },
        findValidTableContainer: (startingElement) => {
            let currentElement = startingElement;
            while (currentElement && currentElement !== docRef.body) {
                if (domOps.hasClass(currentElement.parentNode, 'composer-editable-area')) {
                    return currentElement;
                }
                if (domOps.hasClass(currentElement, 'composer-editable-area')) {
                    if (currentElement.children.length === 0) {
                        const newParagraph = domOps.create('p');
                        domOps.append(currentElement, newParagraph);
                    }
                    return currentElement.lastElementChild;
                }
                currentElement = currentElement.parentNode;
            }
            return null;
        }
    };

    return {
        utilities: CoreUtilities,
        config: DisplayConfiguration,
        markup: InterfaceMarkup,
        commands: CommandExecutionHelpers,
        browser: browserInfo,
        overlay: screenOverlayElement,
        rangeEnabled: selectionRangeSupport,
        maxHistorySteps: undoHistoryLimit
    };

})(window, document, DomTools, BrowserEnvironment);

class RichTextComposer {
    constructor(sourceArea, initialData, toolbarConfig, changeHandler, uploadServiceUrl) {
        const composerInstance = this;

        if (!(sourceArea instanceof Element)) {
            GlobalComposerContext.utilities.logMessage('Invalid source element provided for RichTextComposer initialization.');
            return;
        }

        let composerId = sourceArea.id;
        if (!composerId) {
            composerId = GlobalComposerContext.utilities.generateUniqueId();
            sourceArea.id = composerId;
        }
        composerInstance.componentId = composerId;

        composerInstance.initialSource = sourceArea;
        composerInstance.initialContent = initialData;
        composerInstance.toolbarSetup = toolbarConfig;
        composerInstance.contentChangeCallback = changeHandler;
        composerInstance.uploadHandlerUrl = uploadServiceUrl;

        composerInstance.controlDefinitions = new Map();

        composerInstance.domReferences = {
            mainContainer: null,
            toolbarContainer: null,
            contentEditor: null,
            dialogOverlayContainer: null
        };

        composerInstance.currentActiveUI = null;

        composerInstance.hideActiveUI = () => {
            if (composerInstance.currentActiveUI) {
                if (DomTools.hasClass(composerInstance.currentActiveUI, 'composer-dialog')) {
                    DomTools.style(GlobalComposerContext.overlay, 'display', 'none');
                }
                DomTools.style(composerInstance.currentActiveUI, 'display', 'none');
                composerInstance.currentActiveUI = null;
            }
        };

        composerInstance.addControlGroupToToolbar = (groupElement) => {
            if (composerInstance.domReferences.toolbarContainer) {
                DomTools.append(composerInstance.domReferences.toolbarContainer, groupElement);
            }
        };

        composerInstance.registerDialogElement = (dialogElement) => {
            if (composerInstance.domReferences.dialogOverlayContainer) {
                DomTools.append(composerInstance.domReferences.dialogOverlayContainer, dialogElement);
            }
        };

        composerInstance.attachEditorEvent = (eventType, eventHandler) => {
            if (composerInstance.domReferences.contentEditor) {
                DomTools.on(composerInstance.domReferences.contentEditor, eventType, eventHandler);
            }
        };

        composerInstance.executeEditorCommand = (triggerEvent, commandKey, commandValue, postExecutionHandler) => {
            composerInstance.hideActiveUI();
            GlobalComposerContext.utilities.logMessage(`Running command: ${commandKey}, Value: ${commandValue}`);
            if (postExecutionHandler && typeof postExecutionHandler === 'function') {
                postExecutionHandler();
            }
            if (triggerEvent) {
                triggerEvent.stopPropagation();
            }
        };

        composerInstance._setupEditorDom();
    }

    _setupEditorDom() {
        const instance = this;
        const initialElement = instance.initialSource;
        const contentData = instance.initialContent;

        const editorMainContainer = DomTools.create('div', { class: 'composition-panel' });
        instance.domReferences.mainContainer = editorMainContainer;

        const toolbarPanel = DomTools.create('div', { class: 'composer-controls-bar clearfix' });
        instance.domReferences.toolbarContainer = toolbarPanel;
        DomTools.append(editorMainContainer, toolbarPanel);

        const dialogPanelContainer = DomTools.create('div', { class: 'composer-dialog-container' });
        instance.domReferences.dialogOverlayContainer = dialogPanelContainer;
        DomTools.append(editorMainContainer, dialogPanelContainer);

        const textEditWrapper = DomTools.create('div', { class: 'composer-editor-frame' });
        const contentEditableArea = DomTools.create('div', { class: 'composer-editable-area', contenteditable: 'true' });
        instance.domReferences.contentEditor = contentEditableArea;
        DomTools.append(textEditWrapper, contentEditableArea);
        DomTools.append(editorMainContainer, textEditWrapper);

        DomTools.append(initialElement.parentNode, editorMainContainer);
        DomTools.remove(initialElement);

        if (contentData) {
            contentEditableArea.innerHTML = contentData;
        }
    }

    constructControlGroup(groupArray) {
        if (!Array.isArray(groupArray)) {
            return;
        }
        const groupDomElement = DomTools.create('div', { class: 'composer-control-group' });
        groupArray.forEach((controlId) => {
            const controlElements = this.buildControlItem(controlId);
            if (Array.isArray(controlElements)) {
                controlElements.forEach(item => DomTools.append(groupDomElement, item));
            } else if (controlElements) {
                DomTools.append(groupDomElement, controlElements);
            }
        });
        this.addControlGroupToToolbar(groupDomElement);
    }

    buildControlItem(controlKey) {
        if (controlKey == null) {
            return;
        }
        const keyString = String(controlKey).trim();
        const controlSpecs = this.controlDefinitions.get(keyString);
        if (!controlSpecs) {
            return;
        }

        const itemDependency = controlSpecs.dependency;
        const dependencyAlert = controlSpecs.dependencyMessage;

        if (('dependency' in controlSpecs) && itemDependency == null) {
            GlobalComposerContext.utilities.logMessage(dependencyAlert);
            return;
        }

        const itemLabel = controlSpecs.label;
        const itemKind = controlSpecs.kind;
        let itemDisplayContent = controlSpecs.displayContent;
        let itemCommand = controlSpecs.command;
        let itemShortcut = controlSpecs.shortcut;
        let modifierKeysList = [];
        let keyTriggerCode;

        const dropdownContent = controlSpecs.dropdown && controlSpecs.dropdown();
        const modalDialog = controlSpecs.modal && controlSpecs.modal(this);

        const buttonDomElement = DomTools.create('a', {
            class: 'composer-control-item composer-control-item-default',
            href: '#'
        });
        const generatedElements = [buttonDomElement];

        if (typeof itemCommand === 'string') {
            itemCommand = itemCommand.trim();
        }

        if (itemDisplayContent.includes('|')) {
            const parts = itemDisplayContent.split('|');
            itemDisplayContent = `<i class="${parts[0]}" style="${parts[1]}"></i>`;
        } else {
            itemDisplayContent = `<i class="${itemDisplayContent}"></i>`;
        }
        buttonDomElement.innerHTML = itemDisplayContent;

        if (itemLabel) {
            buttonDomElement.setAttribute('title', itemLabel);
        }

        if (itemKind === 'button') {
            if (typeof itemCommand === 'string') {
                buttonDomElement.setAttribute('data-command-id', itemCommand);
                DomTools.on(buttonDomElement, 'click', (eventObj) => {
                    this.hideActiveUI();
                    this.executeEditorCommand(eventObj, itemCommand, undefined, controlSpecs.callback);
                    eventObj.stopPropagation();
                });
            } else if (typeof itemCommand === 'function') {
                DomTools.on(buttonDomElement, 'click', (eventObj) => {
                    this.hideActiveUI();
                    itemCommand(eventObj);
                    eventObj.stopPropagation();
                });
            }

            if (itemShortcut) {
                itemShortcut = itemShortcut.toLowerCase();
                keyTriggerCode = itemShortcut.split('+')[1].trim();
                modifierKeysList = itemShortcut.split('+')[0].split(',').map(key => key.trim());

                const checkModifierStatus = (keyboardEvent) => {
                    const possibleModifiers = ['ctrl', 'shift', 'alt', 'meta'];
                    return possibleModifiers.every(mod => {
                        const required = modifierKeysList.includes(mod);
                        const pressed = keyboardEvent[`${mod}Key`];
                        return required === pressed;
                    });
                };

                this.attachEditorEvent('keydown', (keyboardEvent) => {
                    if (!checkModifierStatus(keyboardEvent)) {
                        return;
                    }
                    if (String.fromCharCode(keyboardEvent.keyCode).toLowerCase() === keyTriggerCode) {
                        keyboardEvent.preventDefault();
                        buttonDomElement.click();
                    }
                });
            }
        } else if (itemKind === 'dropdown') {
            DomTools.append(buttonDomElement, DomTools.create('i', { class: 'icon-composer-angle-down' }));
            generatedElements.unshift(dropdownContent);

            const concealDropdownMenu = () => {
                DomTools.style(dropdownContent, 'display', 'none');
            };

            DomTools.on(buttonDomElement, 'click', (eventObj) => {
                this.hideActiveUI();
                DomTools.style(dropdownContent, 'display', 'inline-block');
                this.currentActiveUI = dropdownContent;
                eventObj.preventDefault();
                buttonDomElement.focus();
                eventObj.stopPropagation();
            });

            DomTools.on(buttonDomElement, 'blur', () => {
                setTimeout(concealDropdownMenu, 200);
            });

            DomTools.on(dropdownContent, 'click', (eventObj) => {
                let currentTarget = eventObj.target;
                while (currentTarget && currentTarget !== dropdownContent && currentTarget.tagName !== 'A') {
                    currentTarget = currentTarget.parentNode;
                }
                if (currentTarget && currentTarget.tagName === 'A' && DomTools.data(currentTarget, 'action-value')) {
                    const actionValue = DomTools.data(currentTarget, 'action-value');
                    this.executeEditorCommand(eventObj, itemCommand, actionValue, controlSpecs.callback);
                }
            });

            concealDropdownMenu();
        } else if (itemKind === 'modal') {
            DomTools.prepend(modalDialog, DomTools.create('div', {
                class: 'composer-dialog-header',
                innerHTML: GlobalComposerContext.markup.dialogHeaderSection.replace('{caption}', itemLabel)
            }));
            this.registerDialogElement(modalDialog);

            DomTools.on(buttonDomElement, 'click', (eventObj) => {
                this.hideActiveUI();

                const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                const dialogWidth = modalDialog.offsetWidth;
                DomTools.style(modalDialog, 'marginLeft', `${(viewportWidth / 2) - (dialogWidth / 2)}px`);

                DomTools.style(GlobalComposerContext.overlay, 'display', 'block');
                DomTools.style(modalDialog, 'display', 'block');
                this.currentActiveUI = modalDialog;
                eventObj.preventDefault();
                eventObj.stopPropagation();
            });

            DomTools.on(modalDialog, 'click', (eventObj) => {
                let clickedElement = eventObj.target;
                while(clickedElement && clickedElement !== modalDialog && DomTools.data(clickedElement, 'action') !== 'close') {
                    clickedElement = clickedElement.parentNode;
                }
                if (clickedElement && DomTools.data(clickedElement, 'action') === 'close') {
                    DomTools.style(GlobalComposerContext.overlay, 'display', 'none');
                    DomTools.style(modalDialog, 'display', 'none');
                    eventObj.preventDefault();
                }
            });
        }

        if (itemLabel) {
            buttonDomElement.removeAttribute('title');
            if (itemShortcut) {
                itemLabel = `${itemLabel} (${itemShortcut})`;
            }

            const tooltipContainer = DomTools.create('div', { class: 'composer-tooltip' });
            const tooltipText = DomTools.create('div', {
                class: 'composer-tooltip-content',
                innerHTML: GlobalComposerContext.markup.tooltipTextContent.replace('{caption}', itemLabel)
            });
            DomTools.append(tooltipContainer, tooltipText);
            generatedElements.unshift(tooltipContainer);

            let displayDelayTimer;
            let computedLeftShift;

            const showTooltip = () => {
                DomTools.style(tooltipContainer, 'display', 'inline-block');
            };

            DomTools.on(buttonDomElement, 'mouseenter', () => {
                if (!computedLeftShift) {
                    const buttonBounds = buttonDomElement.getBoundingClientRect();
                    const tooltipBounds = tooltipContainer.getBoundingClientRect();
                    computedLeftShift = (buttonBounds.width / 2) - (tooltipBounds.width / 2);
                    DomTools.style(tooltipContainer, 'marginLeft', `${computedLeftShift}px`);
                }
                displayDelayTimer = setTimeout(showTooltip, 200);
            });

            DomTools.on(buttonDomElement, 'mouseleave', () => {
                clearTimeout(displayDelayTimer);
                DomTools.style(tooltipContainer, 'display', 'none');
            });
        }

        return generatedElements;
    }
}

window.RichTextComposer = RichTextComposer;