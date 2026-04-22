let activeTextEnhancerInstance = null;

const deepMergeConfigurations = (...inputObjects) => {
    const isReferenceType = (value) => value && typeof value === 'object' && !Array.isArray(value);
    return inputObjects.reduce((accumulated, current) => {
        Object.keys(current).forEach(key => {
            if (isReferenceType(accumulated[key]) && isReferenceType(current[key])) {
                accumulated[key] = deepMergeConfigurations(accumulated[key], current[key]);
            } else {
                accumulated[key] = current[key];
            }
        });
        return accumulated;
    }, {});
};

class TextEnhancer {
    constructor(targetElement, primaryConfig, secondaryConfig) {
        if (!(targetElement instanceof HTMLTextAreaElement)) {
            throw new Error('Target element must be an HTMLTextAreaElement.');
        }

        this.inputArea = targetElement;
        this.inputArea.dataset.enhancerInstanceId = Math.random().toString(36).substring(2, 9);

        this.currentOptions = deepMergeConfigurations(
            {
                elementIdentifier: '',
                namespaceAlias: '',
                basePath: '',
                displayInSeparateWindow: '',
                autoUpdateDisplay: true,
                displayPlacement: 'after',
                displayTemplatePath: '~/templates/preview.html',
                displayProcessorPath: '',
                displayProcessorVariable: 'data',
                resizableHandle: true,
                beforeTextOperation: null,
                afterTextOperation: null,
                onEnterKey: {},
                onShiftEnterKey: {},
                onControlEnterKey: {},
                onTabKey: {},
                operationSet: [{ /* default empty set */ }]
            },
            primaryConfig,
            secondaryConfig
        );

        this.controlModifier = false;
        this.shiftModifier = false;
        this.alternateModifier = false;
        this.currentMenuDepth = [];
        this.operationAborted = false;
        this.currentScrollPosition = 0;
        this.selectionStartIndex = 0;
        this.currentSelectionLength = 0;
        this.caretAdjustmentOffset = -1;
        this.activeOperationDetails = null;
        this.operationContextData = {};
        this.previewWindowRef = null;
        this.previewIframeRef = null;
        this.cachedPreviewTemplate = null;

        if (!this.currentOptions.basePath) {
            const allScripts = document.querySelectorAll('script');
            for (const scriptTag of allScripts) {
                const sourcePathMatch = scriptTag.src.match(/(.*)text-enhancer(\.min)?\.js$/);
                if (sourcePathMatch) {
                    this.currentOptions.basePath = sourcePathMatch[1];
                    break;
                }
            }
        }

        this.currentOptions.displayProcessorPath = this.resolveInternalPaths(this.currentOptions.displayProcessorPath);
        this.currentOptions.displayTemplatePath = this.resolveInternalPaths(this.currentOptions.displayTemplatePath);

        this.setupUserInterface();
        this.inputArea.addEventListener('focus', () => {
            activeTextEnhancerInstance = this;
        });
    }

    resolveInternalPaths(pathString, inContentMode = false) {
        if (pathString) {
            if (inContentMode) {
                return pathString.replace(/("|')~\//g, "$1" + this.currentOptions.basePath);
            }
            return pathString.replace(/^~\//, this.currentOptions.basePath);
        }
        return "";
    }

    setupUserInterface() {
        let elementIdAttribute = '';
        let elementNamespaceClass = '';

        if (this.currentOptions.elementIdentifier) {
            elementIdAttribute = `id="${this.currentOptions.elementIdentifier}"`;
        } else if (this.inputArea.id) {
            elementIdAttribute = `id="enhancer${this.inputArea.id.charAt(0).toUpperCase()}${this.inputArea.id.substring(1)}"`;
        }

        if (this.currentOptions.namespaceAlias) {
            elementNamespaceClass = this.currentOptions.namespaceAlias;
        }

        const outerNamespaceContainer = document.createElement('div');
        if (elementNamespaceClass) {
            outerNamespaceContainer.className = elementNamespaceClass;
        }
        this.inputArea.parentNode.insertBefore(outerNamespaceContainer, this.inputArea);

        const editorRootContainer = document.createElement('div');
        if (elementIdAttribute) {
            editorRootContainer.setAttribute('id', elementIdAttribute.substring(4, elementIdAttribute.length - 1));
        }
        editorRootContainer.className = 'enhancer-editor-root';
        outerNamespaceContainer.appendChild(editorRootContainer);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'enhancer-content-wrapper';
        editorRootContainer.appendChild(contentWrapper);

        contentWrapper.appendChild(this.inputArea);
        this.inputArea.classList.add('enhancer-editor-area');

        this.controlPanelElement = document.createElement('div');
        this.controlPanelElement.className = 'enhancer-control-panel';
        contentWrapper.insertBefore(this.controlPanelElement, this.inputArea);
        this.controlPanelElement.appendChild(this.generateMenuStructure(this.currentOptions.operationSet));

        this.statusLineElement = document.createElement('div');
        this.statusLineElement.className = 'enhancer-status-line';
        contentWrapper.appendChild(this.statusLineElement);

        if (this.currentOptions.resizableHandle && !navigator.userAgent.includes('Safari')) {
            const resizer = document.createElement('div');
            resizer.className = 'enhancer-resize-handle';
            this.statusLineElement.appendChild(resizer);

            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const initialHeight = this.inputArea.offsetHeight;
                const initialY = e.clientY;

                const onMouseMove = (moveEvent) => {
                    this.inputArea.style.height = `${Math.max(20, initialHeight + moveEvent.clientY - initialY)}px`;
                    return false;
                };

                const onMouseUp = () => {
                    document.documentElement.removeEventListener('mousemove', onMouseMove);
                    document.documentElement.removeEventListener('mouseup', onMouseUp);
                    return false;
                };

                document.documentElement.addEventListener('mousemove', onMouseMove);
                document.documentElement.addEventListener('mouseup', onMouseUp);
            });
        }

        this.inputArea.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
        this.inputArea.addEventListener('keyup', (e) => this.handleKeyboardInput(e));

        this.inputArea.addEventListener('enhancer-operation', (e) => {
            if (e.detail && e.detail.target !== false) {
                this.retrieveTextSelection();
            }
            if (this.inputArea === activeTextEnhancerInstance.inputArea) {
                this.performTextOperation(e.detail);
            }
        });
    }

    generateMenuStructure(menuItems) {
        const menuList = document.createElement('ul');
        menuItems.forEach((item, index) => {
            if (item.separator) {
                const separatorItem = document.createElement('li');
                separatorItem.className = 'enhancer-menu-separator';
                separatorItem.textContent = item.separator || '';
                menuList.appendChild(separatorItem);
            } else {
                this.currentMenuDepth.push(index + 1);

                const buttonTooltip = item.key ? `${item.name || ''} [Ctrl+${item.key}]` : (item.name || '');
                const accessKeyAttribute = item.key ? `accesskey="${item.key}"` : '';

                const actionLink = document.createElement('a');
                actionLink.href = 'javascript:void(0)';
                actionLink.setAttribute('tabindex', '-1');
                actionLink.setAttribute('aria-label', buttonTooltip);
                actionLink.setAttribute('title', buttonTooltip);
                if (item.text) {
                    actionLink.textContent = item.text;
                    actionLink.style.backgroundImage = 'none';
                    actionLink.classList.add('labeled-button');
                    if (item.text.length < 2) {
                        actionLink.style.textIndent = '0.4em';
                    } else {
                        actionLink.style.textIndent = '0';
                    }
                } else {
                    actionLink.textContent = item.name || '';
                }

                const listItem = document.createElement('li');
                listItem.className = `enhancer-menu-button enhancer-menu-button-${this.currentMenuDepth.join('-')} ${item.className || ''}`;
                listItem.appendChild(actionLink);

                listItem.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                });
                listItem.addEventListener('click', (e) => {
                    e.preventDefault();
                });
                listItem.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if (item.call) {
                        try {
                            eval(item.call)();
                        } catch (err) {
                            console.error("Error executing custom button call:", err);
                        }
                    }
                    setTimeout(() => this.performTextOperation(item), 1);
                });

                if (item.dropMenu) {
                    listItem.classList.add('enhancer-drop-menu');
                    const subMenu = this.generateMenuStructure(item.dropMenu);
                    listItem.appendChild(subMenu);

                    let hideTimeoutId;
                    listItem.addEventListener('mouseenter', () => {
                        clearTimeout(hideTimeoutId);
                        subMenu.style.display = 'block';
                    });
                    listItem.addEventListener('mouseleave', () => {
                        hideTimeoutId = setTimeout(() => {
                            subMenu.style.display = 'none';
                        }, 200);
                    });
                    document.addEventListener('click', (e) => {
                        if (!listItem.contains(e.target)) {
                            subMenu.style.display = 'none';
                        }
                    }, { once: true });
                }
                menuList.appendChild(listItem);
                this.currentMenuDepth.pop();
            }
        });
        return menuList;
    }

    processSpecialPlaceholders(textInput) {
        if (!textInput) {
            return "";
        }
        let processedString = textInput.toString();

        processedString = processedString.replace(/\(\!\(([\s\S]*?)\)\!\)/g,
            (match, content) => {
                const parts = content.split('|!|');
                return this.alternateModifier ? (parts[1] !== undefined ? parts[1] : parts[0]) : (parts[1] === undefined ? "" : parts[0]);
            }
        );

        processedString = processedString.replace(/\[\!\[([\s\S]*?)\]\!\]/g,
            (match, content) => {
                const parts = content.split(':!:');
                if (this.operationAborted) {
                    return false;
                }
                const userResponse = prompt(parts[0], (parts[1] || ''));
                if (userResponse === null) {
                    this.operationAborted = true;
                }
                return userResponse;
            }
        );
        return processedString;
    }

    prepareOperationArgument(argument) {
        if (typeof argument === 'function') {
            argument = argument(this.operationContextData);
        }
        return this.processSpecialPlaceholders(argument);
    }

    createInsertionBlock(contentToWrap) {
        const openingComponent = this.prepareOperationArgument(this.activeOperationDetails.openWith);
        const placeholderContent = this.prepareOperationArgument(this.activeOperationDetails.placeHolder);
        const replacementContent = this.prepareOperationArgument(this.activeOperationDetails.replaceWith);
        const closingComponent = this.prepareOperationArgument(this.activeOperationDetails.closeWith);

        let constructedBlock;
        if (replacementContent !== "") {
            constructedBlock = openingComponent + replacementContent + closingComponent;
        } else if (this.currentSelectionLength === 0 && placeholderContent !== '') {
            constructedBlock = openingComponent + placeholderContent + closingComponent;
        } else {
            constructedBlock = openingComponent + (contentToWrap || this.currentSelection) + closingComponent;
        }
        return {
            fullBlock: constructedBlock,
            openingPart: openingComponent,
            replacementPart: replacementContent,
            placeholderPart: placeholderContent,
            closingPart: closingComponent
        };
    }

    performTextOperation(buttonConfiguration) {
        this.activeOperationDetails = buttonConfiguration;
        this.retrieveTextSelection();

        this.operationContextData = {
            currentLine: "",
            basePath: this.currentOptions.basePath,
            allOptions: this.currentOptions,
            targetArea: this.inputArea,
            currentSelection: (this.currentSelection || ''),
            selectionStartIndex: this.selectionStartIndex,
            controlKeyPressed: this.controlModifier,
            shiftKeyPressed: this.shiftModifier,
            altKeyPressed: this.alternateModifier
        };

        if (this.currentOptions.beforeTextOperation) {
            this.currentOptions.beforeTextOperation(this.operationContextData);
        }
        if (this.activeOperationDetails.beforeInsert) {
            this.activeOperationDetails.beforeInsert(this.operationContextData);
        }
        if (this.controlModifier && this.shiftModifier && this.activeOperationDetails.beforeMultiInsert) {
            this.activeOperationDetails.beforeMultiInsert(this.operationContextData);
        }

        Object.assign(this.operationContextData, { currentLine: 1 });

        let blockToInsert;
        let insertionStartPoint;
        let insertionLength;
        let lineBreakCorrection;

        if (this.controlModifier && this.shiftModifier) {
            const lines = this.currentSelection.split(/\r?\n/);
            let lineCounter = 0;
            const processedLines = lines.map(line => {
                if (line.trim() !== '') {
                    Object.assign(this.operationContextData, { currentLine: ++lineCounter, currentSelection: line });
                    return this.createInsertionBlock(line).fullBlock;
                }
                return "";
            });
            blockToInsert = { fullBlock: processedLines.join('\n') };
            insertionStartPoint = this.selectionStartIndex;
            insertionLength = blockToInsert.fullBlock.length + (navigator.userAgent.includes('Opera') ? lines.length : 0);
        } else if (this.controlModifier) {
            blockToInsert = this.createInsertionBlock(this.currentSelection);
            insertionStartPoint = this.selectionStartIndex + blockToInsert.openingPart.length;
            insertionLength = blockToInsert.fullBlock.length - blockToInsert.openingPart.length - blockToInsert.closingPart.length;
            insertionLength -= this.adjustForIELineBreaks(blockToInsert.fullBlock);
        } else if (this.shiftModifier) {
            blockToInsert = this.createInsertionBlock(this.currentSelection);
            insertionStartPoint = this.selectionStartIndex;
            insertionLength = blockToInsert.fullBlock.length;
            insertionLength -= this.adjustForIELineBreaks(blockToInsert.fullBlock);
        } else {
            blockToInsert = this.createInsertionBlock(this.currentSelection);
            insertionStartPoint = this.selectionStartIndex + blockToInsert.fullBlock.length;
            insertionLength = 0;
            insertionStartPoint -= this.adjustForIELineBreaks(blockToInsert.fullBlock);
        }

        if (this.currentSelectionLength === 0 && blockToInsert.replacementPart === '') {
            this.caretAdjustmentOffset += this.adjustForOperaLineBreaks(blockToInsert.fullBlock);

            insertionStartPoint = this.selectionStartIndex + blockToInsert.openingPart.length;
            insertionLength = blockToInsert.fullBlock.length - blockToInsert.openingPart.length - blockToInsert.closingPart.length;

            this.caretAdjustmentOffset = this.inputArea.value.substring(this.selectionStartIndex, this.inputArea.value.length).length;
            this.caretAdjustmentOffset -= this.adjustForOperaLineBreaks(this.inputArea.value.substring(0, this.selectionStartIndex));
        }

        Object.assign(this.operationContextData, {
            selectionStartIndex: this.selectionStartIndex,
            currentScrollPosition: this.currentScrollPosition
        });

        if (blockToInsert.fullBlock !== this.currentSelection && !this.operationAborted) {
            this.insertContentIntoArea(blockToInsert.fullBlock);
            this.applySelectionRange(insertionStartPoint, insertionLength);
        } else {
            this.caretAdjustmentOffset = -1;
        }
        this.retrieveTextSelection();

        Object.assign(this.operationContextData, { currentLine: '', currentSelection: this.currentSelection });

        if (this.controlModifier && this.shiftModifier && this.activeOperationDetails.afterMultiInsert) {
            this.activeOperationDetails.afterMultiInsert(this.operationContextData);
        }
        if (this.activeOperationDetails.afterInsert) {
            this.activeOperationDetails.afterInsert(this.operationContextData);
        }
        if (this.currentOptions.afterTextOperation) {
            this.currentOptions.afterTextOperation(this.operationContextData);
        }

        if (this.previewWindowRef && this.currentOptions.autoUpdateDisplay) {
            this.updatePreviewContent();
        }

        this.shiftModifier = this.alternateModifier = this.controlModifier = this.operationAborted = false;
    }

    adjustForOperaLineBreaks(text) {
        if (navigator.userAgent.includes('Opera')) {
            return text.length - text.replace(/\n*/g, '').length;
        }
        return 0;
    }

    adjustForIELineBreaks(text) {
        if (navigator.userAgent.includes('MSIE') || navigator.userAgent.includes('Trident')) {
            return text.length - text.replace(/\r*/g, '').length;
        }
        return 0;
    }

    insertContentIntoArea(contentBlock) {
        if (document.selection) {
            this.inputArea.focus();
            document.selection.createRange().text = contentBlock;
        } else {
            const currentVal = this.inputArea.value;
            this.inputArea.value = currentVal.substring(0, this.selectionStartIndex) + contentBlock + currentVal.substring(this.selectionStartIndex + this.currentSelectionLength);
        }
    }

    applySelectionRange(start, length) {
        if (this.inputArea.createTextRange) {
            if (navigator.userAgent.includes('Opera') && parseFloat(navigator.userAgent.match(/Opera[\/\s](\d+\.\d+)/)[1]) >= 9.5 && length === 0) {
                return false;
            }
            const range = this.inputArea.createTextRange();
            range.collapse(true);
            range.moveStart('character', start);
            range.moveEnd('character', length);
            range.select();
        } else if (this.inputArea.setSelectionRange) {
            this.inputArea.setSelectionRange(start, start + length);
        }
        this.inputArea.scrollTop = this.currentScrollPosition;
        this.inputArea.focus();
    }

    retrieveTextSelection() {
        this.inputArea.focus();
        this.currentScrollPosition = this.inputArea.scrollTop;

        if (document.selection) {
            const currentRange = document.selection.createRange();
            this.currentSelection = currentRange.text;
            if (navigator.userAgent.includes('MSIE') || navigator.userAgent.includes('Trident')) {
                const rangeCopy = currentRange.duplicate();
                rangeCopy.moveToElementText(this.inputArea);
                this.selectionStartIndex = -1;
                while (rangeCopy.inRange(currentRange)) {
                    rangeCopy.moveStart('character');
                    this.selectionStartIndex++;
                }
            } else if (navigator.userAgent.includes('Opera')) {
                this.selectionStartIndex = this.inputArea.selectionStart;
            }
        } else {
            this.selectionStartIndex = this.inputArea.selectionStart;
            this.currentSelection = this.inputArea.value.substring(this.selectionStartIndex, this.inputArea.selectionEnd);
        }
        this.currentSelectionLength = this.currentSelection.length;
        return this.currentSelection;
    }

    openPreviewDisplay() {
        if (!this.previewWindowRef || this.previewWindowRef.closed) {
            if (this.currentOptions.displayInSeparateWindow) {
                this.previewWindowRef = window.open('', 'preview', this.currentOptions.displayInSeparateWindow);
            } else {
                this.previewIframeRef = document.createElement('iframe');
                this.previewIframeRef.className = 'enhancer-display-frame';
                if (this.currentOptions.displayPlacement === 'after') {
                    this.statusLineElement.parentNode.insertBefore(this.previewIframeRef, this.statusLineElement.nextSibling);
                } else {
                    this.controlPanelElement.parentNode.insertBefore(this.previewIframeRef, this.controlPanelElement);
                }
                this.previewWindowRef = this.previewIframeRef.contentWindow || this.previewIframeRef;
            }
        } else if (this.alternateModifier) {
            if (this.previewIframeRef) {
                this.previewIframeRef.remove();
            } else {
                this.previewWindowRef.close();
            }
            this.previewWindowRef = this.previewIframeRef = null;
        }
        if (!this.currentOptions.autoUpdateDisplay) {
            this.updatePreviewContent();
        }
    }

    updatePreviewContent() {
        this.renderDisplayHtml();
    }

    renderDisplayHtml() {
        if (this.currentOptions.displayProcessorPath) {
            fetch(this.currentOptions.displayProcessorPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `${this.currentOptions.displayProcessorVariable}=${encodeURIComponent(this.inputArea.value)}`
            })
            .then(response => response.text())
            .then(data => {
                this.writeToPreviewWindow(this.resolveInternalPaths(data, true));
            })
            .catch(error => console.error('Error fetching preview processing data:', error));
        } else {
            if (!this.cachedPreviewTemplate) {
                fetch(this.currentOptions.displayTemplatePath)
                    .then(response => response.text())
                    .then(templateData => {
                        this.cachedPreviewTemplate = templateData;
                        this.writeToPreviewWindow(this.resolveInternalPaths(templateData, true).replace(/<!-- content -->/g, this.inputArea.value));
                    })
                    .catch(error => console.error('Error fetching preview template:', error));
            } else {
                this.writeToPreviewWindow(this.resolveInternalPaths(this.cachedPreviewTemplate, true).replace(/<!-- content -->/g, this.inputArea.value));
            }
        }
        return false;
    }

    writeToPreviewWindow(htmlContent) {
        if (this.previewWindowRef && this.previewWindowRef.document) {
            let currentScrollPosition = 0;
            try {
                currentScrollPosition = this.previewWindowRef.document.documentElement.scrollTop;
            } catch (e) {
                // Cross-origin iframe security exception
            }
            this.previewWindowRef.document.open();
            this.previewWindowRef.document.write(htmlContent);
            this.previewWindowRef.document.close();
            this.previewWindowRef.document.documentElement.scrollTop = currentScrollPosition;
        }
        if (this.currentOptions.displayInSeparateWindow) {
            this.previewWindowRef.focus();
        }
    }

    handleKeyboardInput(e) {
        this.shiftModifier = e.shiftKey;
        this.alternateModifier = e.altKey;
        this.controlModifier = e.ctrlKey || e.metaKey;
    }
}

Object.defineProperty(TextEnhancer, 'focusedInstance', {
    get: function() { return activeTextEnhancerInstance; },
    set: function(val) { activeTextEnhancerInstance = val; }
});

function initializeTextEnhancers(targetElements, settings, additionalSettings) {
    let elementsToEnhance;
    if (typeof targetElements === 'string') {
        elementsToEnhance = document.querySelectorAll(targetElements);
    } else if (targetElements instanceof Element) {
        elementsToEnhance = [targetElements];
    } else if (Array.isArray(targetElements) || targetElements instanceof NodeList) {
        elementsToEnhance = targetElements;
    } else {
        console.error("Invalid input for initializeTextEnhancers. Expected a selector string, an Element, or a NodeList/Array of Elements.");
        return [];
    }

    const instances = [];
    elementsToEnhance.forEach(el => {
        if (el instanceof HTMLTextAreaElement) {
            instances.push(new TextEnhancer(el, settings, additionalSettings));
        } else {
            console.warn("Skipping non-textarea element in selection:", el);
        }
    });
    return instances;
}