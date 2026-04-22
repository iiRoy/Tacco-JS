class ElementUtils {
    static create(tag, classes = [], attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        if (classes.length) {
            element.classList.add(...classes);
        }
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    }

    static appendChildren(parent, children) {
        children.forEach(child => parent.appendChild(child));
    }

    static removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    static getOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX
        };
    }

    static fadeIn(element, duration = 250) {
        element.style.opacity = '0';
        element.style.display = 'block';
        let start = null;
        const animate = (currentTime) => {
            if (!start) start = currentTime;
            const progress = (currentTime - start) / duration;
            element.style.opacity = Math.min(progress, 1).toString();
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 250, onComplete = () => {}) {
        element.style.opacity = '1';
        let start = null;
        const animate = (currentTime) => {
            if (!start) start = currentTime;
            const progress = (currentTime - start) / duration;
            element.style.opacity = (1 - Math.min(progress, 1)).toString();
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                onComplete();
            }
        };
        requestAnimationFrame(animate);
    }
}

class PopupFrame {
    constructor(displayNode, configuration = {}) {
        this.displayedContent = displayNode;
        this.frameWidth = configuration.frameWidth || '598px';
        this.frameHeight = configuration.frameHeight || 'auto';
        this.overlayElement = null;
        this.windowElement = null;
        this.onDismissed = configuration.onDismissed || (() => {});

        this.constructFrame();
    }

    constructFrame() {
        this.overlayElement = ElementUtils.create('div', ['composer-overlay'], { id: 'composer_overlay' });
        this.overlayElement.style.cssText = `
            background-color: rgba(0, 0, 0, 0.7);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 100002;
            display: none;
        `;
        document.body.appendChild(this.overlayElement);

        this.windowElement = ElementUtils.create('div', ['composer-popup-window']);
        this.windowElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${this.frameWidth};
            height: ${this.frameHeight};
            background-color: white;
            border: 1px solid #ccc;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 100005;
            display: none;
            overflow: auto;
            padding: 1px;
        `;
        this.windowElement.appendChild(this.displayedContent);
        document.body.appendChild(this.windowElement);

        this.overlayElement.addEventListener('click', this.dismissFrame.bind(this));
    }

    showFrame() {
        ElementUtils.fadeIn(this.overlayElement);
        ElementUtils.fadeIn(this.windowElement);
        return this;
    }

    dismissFrame() {
        ElementUtils.fadeOut(this.overlayElement, 250, () => ElementUtils.removeElement(this.overlayElement));
        ElementUtils.fadeOut(this.windowElement, 250, () => {
            ElementUtils.removeElement(this.windowElement);
            this.onDismissed();
        });
        return false;
    }
}

class DirectiveKit {
    constructor(editableTarget) {
        this.target = editableTarget;
        this.isSourceViewActive = false;
        this.sourceTextArea = null;
        this.originalContentContainer = null;
    }

    _execute(command, value = null) {
        document.execCommand(command, false, value);
    }

    _promptUser(message) {
        let response = prompt(message);
        while (response === "") {
            response = prompt(message);
        }
        return response;
    }

    applyBold() { this._execute('bold'); }
    applyUnderline() { this._execute('underline'); }
    applyItalic() { this._execute('italic'); }
    applyStrikethrough() { this._execute('strikethrough'); }
    applyBlockquote() { this._execute('blockquote'); }
    insertOrderedList() { this._execute('insertorderedlist'); }
    insertUnorderedList() { this._execute('insertunorderedlist'); }

    createHyperlink() {
        const url = this._promptUser("Enter URL (e.g., http://example.com):");
        if (url) this._execute('createLink', url);
    }

    embedPicture() {
        const url = this._promptUser("Enter image URL (e.g., http://example.com/image.png):");
        if (url) this._execute('insertImage', url);
    }

    insertBlock(tag) {
        this._execute('FormatBlock', tag);
    }

    toggleSourceView(commandButton) {
        if (this.isSourceViewActive) {
            this.exitSourceView(commandButton);
        } else {
            this.enterSourceView(commandButton);
        }
    }

    enterSourceView(commandButton) {
        this.isSourceViewActive = true;
        this.originalContentContainer = this.target.innerHTML;
        
        this.sourceTextArea = ElementUtils.create('textarea', ['composer-source-editor'], {
            style: `width: 100%; height: ${this.target.offsetHeight}px; box-sizing: border-box;`
        });
        this.sourceTextArea.value = this.originalContentContainer;

        this.target.innerHTML = '';
        this.target.appendChild(this.sourceTextArea);
        commandButton.classList.add('active');
    }

    exitSourceView(commandButton) {
        this.isSourceViewActive = false;
        if (this.sourceTextArea) {
            const newContent = this.sourceTextArea.value;
            this.target.innerHTML = newContent;
            ElementUtils.removeElement(this.sourceTextArea);
            this.sourceTextArea = null;
        }
        commandButton.classList.remove('active');
    }
}

class CommandBar {
    constructor(editorInstance, configurations = {}) {
        this.associatedEditor = editorInstance;
        this.imageAssetPath = configurations.imageLocation || "/reviser/images";
        this.panelMarkup = configurations.panelHtml || this._generateDefaultMarkup();
        this.panelElement = null;
        this.directiveExecutor = new DirectiveKit(editorInstance.editableSurface);
        
        this.constructPanel();
        this.attachCommandHandlers();
    }

    _generateDefaultMarkup() {
        const buttonData = [
            { id: 'boldText', alt: 'Text Bold', img: 'btn_strong.png', command: 'applyBold' },
            { id: 'italicText', alt: 'Text Italic', img: 'btn_em.png', command: 'applyItalic' },
            { id: 'strikeText', alt: 'Text Strike', img: 'btn_strike.png', command: 'applyStrikethrough' },
            { id: 'underlineText', alt: 'Text Under', img: 'btn_underline.png', command: 'applyUnderline' },
            { id: 'insertParagraph', alt: 'Insert Paragraph', img: 'btn_para.png', command: 'insertBlock', arg: 'p' },
            { id: 'insertHeading1', alt: 'Insert H1', img: 'btn_h1.png', command: 'insertBlock', arg: 'h1' },
            { id: 'insertHeading2', alt: 'Insert H2', img: 'btn_h2.png', command: 'insertBlock', arg: 'h2' },
            { id: 'insertHeading3', alt: 'Insert H3', img: 'btn_h3.png', command: 'insertBlock', arg: 'h3' },
            { id: 'insertHeading4', alt: 'Insert H4', img: 'btn_h4.png', command: 'insertBlock', arg: 'h4' },
            { id: 'embedImage', alt: 'Insert Image', img: 'btn_image.png', command: 'embedPicture' },
            { id: 'createLink', alt: 'Insert Link', img: 'btn_link.png', command: 'createHyperlink' },
            { id: 'insertOrderedList', alt: 'Insert Ordered List', img: 'btn_ol.png', command: 'insertOrderedList' },
            { id: 'insertUnorderedList', alt: 'Insert Unordered List', img: 'btn_ul.png', command: 'insertUnorderedList' },
            { id: 'toggleSource', alt: 'HTML Source', img: 'btn_source.png', command: 'toggleSourceView' },
            { id: 'saveContent', alt: 'Save', img: 'btn_save.png', command: 'save' },
            { id: 'discardChanges', alt: 'Cancel', img: 'btn_cancel.png', command: 'revert' }
        ];

        let html = '<div class="composer-toolbar">';
        buttonData.forEach(btn => {
            html += `<a href="#" class="composer-btn" id="${btn.id}" data-command="${btn.command}" data-command-arg="${btn.arg || ''}" alt="${btn.alt}">` +
                    `<img src="${this.imageAssetPath}/${btn.img}" alt="${btn.alt}" border="0"></a>`;
        });
        html += '</div>';
        return html;
    }

    constructPanel() {
        const tempDiv = ElementUtils.create('div');
        tempDiv.innerHTML = this.panelMarkup;
        this.panelElement = tempDiv.firstElementChild;
        this.panelElement.style.cssText = `
            position: absolute;
            z-index: 1000003;
            display: none;
            opacity: 0;
            background: #eee;
            border: 1px solid #ccc;
            padding: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        `;
    }

    attachCommandHandlers() {
        Array.from(this.panelElement.querySelectorAll('.composer-btn')).forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const commandName = button.getAttribute('data-command');
                const commandArg = button.getAttribute('data-command-arg');

                if (commandName === 'save') {
                    this.associatedEditor.processSave();
                } else if (commandName === 'revert') {
                    this.associatedEditor.processRevert();
                } else if (commandName === 'toggleSourceView') {
                    this.directiveExecutor[commandName](button);
                }
                else if (this.directiveExecutor[commandName]) {
                    if (commandArg) {
                        this.directiveExecutor[commandName](commandArg);
                    } else {
                        this.directiveExecutor[commandName]();
                    }
                }
            });
        });
    }

    displayPanel(targetElementCoordinates) {
        document.body.appendChild(this.panelElement);
        this.panelElement.style.top = `${targetElementCoordinates.top - this.panelElement.offsetHeight - 5}px`;
        this.panelElement.style.left = `${targetElementCoordinates.left}px`;
        ElementUtils.fadeIn(this.panelElement);
    }

    hidePanel() {
        ElementUtils.fadeOut(this.panelElement, 250, () => ElementUtils.removeElement(this.panelElement));
        const sourceToggleBtn = this.panelElement.querySelector('[data-command="toggleSourceView"]');
        if (this.directiveExecutor.isSourceViewActive && sourceToggleBtn) {
            this.directiveExecutor.exitSourceView(sourceToggleBtn);
        }
    }

    getPanelNode() {
        return this.panelElement;
    }
}

class ContentEditor {
    constructor(elementIdentifier, configurations = {}) {
        this.targetElement = document.querySelector(elementIdentifier);
        if (!this.targetElement) {
            console.error('ContentEditor: Target element not found for identifier:', elementIdentifier);
            return;
        }

        this.editorSettings = {
            widthThreshold: configurations.widthThreshold || 600,
            useOverlay: configurations.useOverlay || true,
            assetDirectory: configurations.assetDirectory || "/reviser/images",
            onBeforeContentSave: configurations.onBeforeContentSave || ((html) => html),
            onAfterContentSave: configurations.onAfterContentSave || (() => false),
            toolbarHtml: configurations.toolbarHtml
        };

        this.editableSurface = null;
        this.originalContentBackup = '';
        this.editorModeIsModal = false;
        this.activeCommandBar = null;
        this.activePopupFrame = null;
        this.initialTargetElement = this.targetElement;
        this.generalOverlay = null;

        this.initialiseEditor();
    }

    initialiseEditor() {
        this.editorModeIsModal = (this.targetElement.offsetWidth < this.editorSettings.widthThreshold);

        if (this.editorModeIsModal) {
            this.setupModalEditor();
        } else {
            this.setupInlineEditor();
        }

        this.originalContentBackup = this.editableSurface.innerHTML;

        if (this.editorSettings.useOverlay && !this.editorModeIsModal) {
            this.drawGeneralOverlay();
        }
    }

    setupModalEditor() {
        const editorWrapper = ElementUtils.create('div', [], { id: 'modal-editor-container' });
        this.editableSurface = ElementUtils.create('div', ['editable-content-area'], { contenteditable: 'true' });
        this.editableSurface.innerHTML = this.targetElement.innerHTML;
        
        this.activeCommandBar = new CommandBar(this, {
            imageLocation: this.editorSettings.assetDirectory,
            panelHtml: this.editorSettings.toolbarHtml
        });
        
        editorWrapper.appendChild(this.activeCommandBar.getPanelNode());
        editorWrapper.appendChild(this.editableSurface);

        this.activePopupFrame = new PopupFrame(editorWrapper, {
            frameWidth: this.editorSettings.widthThreshold + 'px', // Use threshold for modal width
            onDismissed: this.deactivateEditor.bind(this)
        });
        this.activePopupFrame.showFrame();
        this.activeCommandBar.getPanelNode().style.position = 'static';
        this.activeCommandBar.getPanelNode().style.opacity = '1';
        this.activeCommandBar.getPanelNode().style.display = 'block';
    }

    setupInlineEditor() {
        this.editableSurface = this.targetElement;
        this.editableSurface.setAttribute('contenteditable', 'true');
        // Remove the click handler that initiated this editor instance
        if (this.editableSurface._boundActivateHandler) {
            this.editableSurface.removeEventListener('click', this.editableSurface._boundActivateHandler);
        }

        this.activeCommandBar = new CommandBar(this, {
            imageLocation: this.editorSettings.assetDirectory,
            panelHtml: this.editorSettings.toolbarHtml
        });
        this.activeCommandBar.displayPanel(ElementUtils.getOffset(this.editableSurface));
    }

    drawGeneralOverlay() {
        this.generalOverlay = ElementUtils.create('div', ['composer-general-overlay'], { id: 'general_composer_overlay' });
        this.generalOverlay.style.cssText = `
            background-color: rgba(0, 0, 0, 0.7);
            height: ${document.documentElement.scrollHeight}px;
            left: 0;
            position: absolute;
            top: 0;
            width: 100%;
            z-index: 100002;
            display: none;
        `;
        document.body.appendChild(this.generalOverlay);

        const currentBg = window.getComputedStyle(this.editableSurface).backgroundColor;
        this.editableSurface.style.zIndex = '1000003';
        this.editableSurface.style.position = 'relative';
        this.editableSurface.style.backgroundColor = (currentBg === 'rgba(0, 0, 0, 0)' || currentBg === 'transparent') ? '#fff' : currentBg;

        ElementUtils.fadeIn(this.generalOverlay);
        this.generalOverlay.addEventListener('click', this.processRevert.bind(this));
    }

    removeGeneralOverlay() {
        if (this.generalOverlay) {
            ElementUtils.fadeOut(this.generalOverlay, 250, () => ElementUtils.removeElement(this.generalOverlay));
            this.generalOverlay = null;
        }
    }

    processSave() {
        if (this.activeCommandBar && this.activeCommandBar.directiveExecutor.isSourceViewActive) {
            const sourceToggleBtn = this.activeCommandBar.getPanelNode().querySelector('[data-command="toggleSourceView"]');
            if (sourceToggleBtn) {
                this.activeCommandBar.directiveExecutor.exitSourceView(sourceToggleBtn);
            }
        }

        let processedHtml = this.editorSettings.onBeforeContentSave(this.editableSurface.innerHTML);

        if (this.editorModeIsModal) {
            this.initialTargetElement.innerHTML = processedHtml;
            this.activePopupFrame.dismissFrame();
        } else {
            this.editableSurface.innerHTML = processedHtml;
            this.deactivateEditor();
        }
        this.editorSettings.onAfterContentSave(processedHtml);
    }

    processRevert() {
        if (this.activeCommandBar && this.activeCommandBar.directiveExecutor.isSourceViewActive) {
            const sourceToggleBtn = this.activeCommandBar.getPanelNode().querySelector('[data-command="toggleSourceView"]');
            if (sourceToggleBtn) {
                this.activeCommandBar.directiveExecutor.exitSourceView(sourceToggleBtn);
            }
        }
        this.editableSurface.innerHTML = this.originalContentBackup;
        this.deactivateEditor();
        if (this.editorModeIsModal && this.activePopupFrame) {
            this.activePopupFrame.dismissFrame();
        }
    }

    deactivateEditor() {
        if (this.editorModeIsModal) {
            this.editableSurface = null;
            this.activeCommandBar = null;
            this.activePopupFrame = null;
        } else {
            if (this.activeCommandBar) {
                this.activeCommandBar.hidePanel();
            }
            this.removeGeneralOverlay();
            if (this.editableSurface) {
                this.editableSurface.setAttribute('contenteditable', 'false');
                this.editableSurface.style.zIndex = '';
                this.editableSurface.style.position = '';
                this.editableSurface.style.backgroundColor = '';
                
                // Re-bind click handler for inline editing
                if (this.editableSurface._boundActivateHandler) {
                    this.editableSurface.addEventListener('click', this.editableSurface._boundActivateHandler);
                }
            }
        }
    }

    static activateOnClick(elementIdentifier, configurations = {}) {
        const targetElement = document.querySelector(elementIdentifier);
        if (!targetElement) {
            console.error('ContentEditor.activateOnClick: Target element not found for identifier:', elementIdentifier);
            return;
        }

        const boundHandler = function() {
            targetElement.removeEventListener('click', boundHandler);
            new ContentEditor(elementIdentifier, configurations);
        };
        targetElement._boundActivateHandler = boundHandler; // Store reference to allow removal
        targetElement.addEventListener('click', boundHandler);
    }
}