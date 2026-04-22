(function (global) {
    "use strict";

    function recursiveMerge(target, source) {
        const output = { ...target };
        if (target && typeof target === 'object' && source && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = recursiveMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    function constructElement(tagName, props = {}, children = []) {
        const newElement = global.document.createElement(tagName);
        for (const key in props) {
            if (key === 'className') {
                newElement.className = props[key];
            } else if (key === 'textContent') {
                newElement.textContent = props[key];
            } else if (key === 'html') {
                newElement.innerHTML = props[key];
            } else if (key.startsWith('data-')) {
                newElement.setAttribute(key, props[key]);
            } else if (key === 'style' && typeof props[key] === 'string') {
                newElement.style.cssText = props[key];
            } else {
                newElement[key] = props[key];
            }
        }
        children.forEach(child => {
            if (typeof child === 'string') {
                newElement.appendChild(global.document.createTextNode(child));
            } else if (child instanceof Node) {
                newElement.appendChild(child);
            }
        });
        return newElement;
    }

    function findElements(parent, selector) {
        return Array.from(parent.querySelectorAll(selector));
    }
    function findElement(parent, selector) {
        return parent.querySelector(selector);
    }

    const defaultComposerSettings = {
        sizeX: '100%',
        sizeY: '400px',
        textSize: '14px',
        editorTheme: 'tomorrow',
        allowFullscreen: true,
        allowImageUpload: false,
        uploadTarget: '',
        enablePreview: false,
        onRenderPreview: function (contentValue, callback) {
            callback(contentValue);
        },
        displayLabels: {
            header1Btn: 'H1',
            header2Btn: 'H2',
            header3Btn: 'H3',
            boldBtn: 'Bold',
            italicBtn: 'Italic',
            linkBtn: 'Link',
            imageBtn: 'Insert image',
            uploadBtn: 'Upload image',
            editBtn: 'Edit',
            previewBtn: 'Preview',
            fullscreenBtn: 'Fullscreen',
            loadingText: 'Loading'
        }
    };

    class MarkdownComposer {
        constructor(targetNode, initialConfiguration) {
            if (!(targetNode instanceof Node)) {
                throw new Error("Target node must be a valid DOM element.");
            }

            this._containerNode = targetNode;
            this._currentConfig = recursiveMerge(defaultComposerSettings, initialConfiguration);

            this._isViewingPreview = false;
            this._isExpanded = false;

            this._editorPaneNode = null;
            this._previewPaneNode = null;
            this._loadingOverlayNode = null;
            this._aceEditorInstance = null;
            this._aceSnippetManager = null;

            this._initializeComposer();
        }

        _initializeComposer() {
            const initialContent = this._containerNode.textContent.trim();
            this._containerNode.innerHTML = '';
            this._containerNode.classList.add('composer-wrapper');

            const generatedStructure = this._generateEditorStructure(initialContent, this._currentConfig);
            this._containerNode.appendChild(generatedStructure);

            this._loadingOverlayNode = findElement(this._containerNode, '.composer-loading');
            this._editorPaneNode = findElement(this._containerNode, '.composer-input');
            this._previewPaneNode = findElement(this._containerNode, '.composer-output');

            this._containerNode.style.width = this._currentConfig.sizeX;
            this._editorPaneNode.style.width = this._currentConfig.sizeX;
            this._editorPaneNode.style.height = this._currentConfig.sizeY;
            this._editorPaneNode.style.fontSize = this._currentConfig.textSize;
            this._previewPaneNode.style.width = this._currentConfig.sizeX;
            this._previewPaneNode.style.height = this._currentConfig.sizeY;

            this._aceEditorInstance = ace.edit(this._editorPaneNode);
            this._aceEditorInstance.setTheme('ace/theme/' + this._currentConfig.editorTheme);
            this._aceEditorInstance.getSession().setMode('ace/mode/markdown');
            this._aceEditorInstance.getSession().setUseWrapMode(true);
            this._aceEditorInstance.setHighlightActiveLine(false);
            this._aceEditorInstance.setShowPrintMargin(false);
            this._aceEditorInstance.renderer.setShowGutter(false);

            ace.config.loadModule('ace/ext/language_tools', () => {
                this._aceSnippetManager = ace.require('ace/snippets').snippetManager;
                this._setupKeyboardShortcuts(this._aceEditorInstance, this._aceSnippetManager);
            });

            this._setupEventListeners();

            if (global.jQuery && typeof global.jQuery().tooltip === 'function') {
                findElements(this._containerNode, '[data-tip="tooltip"]').forEach(tipElement => {
                    global.jQuery(tipElement).tooltip({
                        container: 'body'
                    });
                });
            }
        }

        _setupEventListeners() {
            if (this._currentConfig.allowImageUpload) {
                findElement(this._containerNode, '.upload-selector').addEventListener('change', event => {
                    const selectedFiles = event.target.files;
                    if (selectedFiles.length) {
                        this._handleFileTransfer(
                            this._currentConfig.uploadTarget,
                            selectedFiles,
                            this._aceEditorInstance,
                            this._aceSnippetManager,
                            this._loadingOverlayNode
                        );
                    }
                });

                this._containerNode.addEventListener('dragenter', e => {
                    e.stopPropagation();
                    e.preventDefault();
                });
                this._containerNode.addEventListener('dragover', e => {
                    e.stopPropagation();
                    e.preventDefault();
                });
                this._containerNode.addEventListener('drop', e => {
                    e.preventDefault();
                    const droppedFiles = e.dataTransfer.files;
                    this._handleFileTransfer(
                        this._currentConfig.uploadTarget,
                        droppedFiles,
                        this._aceEditorInstance,
                        this._aceSnippetManager,
                        this._loadingOverlayNode
                    );
                });
            }

            if (this._currentConfig.allowFullscreen === true) {
                global.addEventListener('resize', () => {
                    if (this._isExpanded === true) {
                        if (this._isViewingPreview === false) {
                            this._adaptForFullscreen(this._editorPaneNode);
                        } else {
                            this._adaptForFullscreen(this._previewPaneNode);
                        }
                    }
                });
            }

            findElements(this._containerNode, '.composer-action-btn').forEach(button => {
                button.addEventListener('click', event => {
                    const actionType = event.currentTarget.dataset.action;
                    this._processToolbarAction(actionType, this._aceEditorInstance, this._aceSnippetManager, this._currentConfig);
                    this._aceEditorInstance.focus();
                });
            });
        }

        _handleFileTransfer(targetUrl, filesToUpload, aceEditor, aceSnippetMngr, progressIndicator) {
            progressIndicator.style.display = 'flex';

            const formData = new FormData();
            for (let i = 0; i < filesToUpload.length; i++) {
                formData.append('file' + i, filesToUpload[i]);
            }

            fetch(targetUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(uploadedResourcePaths => {
                let separator = '';
                if (uploadedResourcePaths.length > 1) {
                    separator = "\n";
                }
                uploadedResourcePaths.forEach(path => {
                    aceSnippetMngr.insertSnippet(aceEditor, `![](${path})${separator}`);
                });
            })
            .catch(error => {
                global.console.error('File upload failed:', error);
            })
            .finally(() => {
                progressIndicator.style.display = 'none';
            });
        }

        _adaptForFullscreen(activePanel) {
            const windowHeight = global.innerHeight;
            const panelOffsetTop = activePanel.getBoundingClientRect().top + global.scrollY;
            if (windowHeight > panelOffsetTop) {
                const calculatedHeight = windowHeight - panelOffsetTop;
                activePanel.style.height = `${calculatedHeight}px`;
            }
            this._aceEditorInstance.resize();
        }

        _setupKeyboardShortcuts(aceEditor, aceSnippetMngr) {
            aceEditor.commands.addCommand({
                name: 'boldText',
                bindKey: { win: 'Ctrl-B', mac: 'Command-B' },
                exec: function (editor) {
                    const currentSelection = editor.session.getTextRange(editor.getSelectionRange());
                    if (currentSelection === '') {
                        aceSnippetMngr.insertSnippet(editor, '**${1:text}**');
                    } else {
                        aceSnippetMngr.insertSnippet(editor, `**${currentSelection}**`);
                    }
                },
                readOnly: false
            });

            aceEditor.commands.addCommand({
                name: 'italicText',
                bindKey: { win: 'Ctrl-I', mac: 'Command-I' },
                exec: function (editor) {
                    const currentSelection = editor.session.getTextRange(editor.getSelectionRange());
                    if (currentSelection === '') {
                        aceSnippetMngr.insertSnippet(editor, '*${1:text}*');
                    } else {
                        aceSnippetMngr.insertSnippet(editor, `*${currentSelection}*`);
                    }
                },
                readOnly: false
            });

            aceEditor.commands.addCommand({
                name: 'insertLink',
                bindKey: { win: 'Ctrl-K', mac: 'Command-K' },
                exec: function (editor) {
                    const currentSelection = editor.session.getTextRange(editor.getSelectionRange());
                    if (currentSelection === '') {
                        aceSnippetMngr.insertSnippet(editor, '[${1:text}](http://$2)');
                    } else {
                        aceSnippetMngr.insertSnippet(editor, `[${currentSelection}](http://$1)`);
                    }
                },
                readOnly: false
            });
        }

        _insertMarkdownHeader(aceEditor, markerString) {
            const cursorPosition = aceEditor.getCursorPosition();
            if (cursorPosition.column === 0) {
                aceEditor.navigateLineStart();
                aceEditor.insert(`${markerString} `);
            } else {
                aceEditor.navigateLineStart();
                aceEditor.insert(`${markerString} `);
                aceEditor.navigateLineEnd();
            }
        }

        _processToolbarAction(actionId, aceEditor, aceSnippetMngr, currentConfig) {
            const currentSelection = aceEditor.session.getTextRange(aceEditor.getSelectionRange());

            switch (actionId) {
                case 'h1':
                    this._insertMarkdownHeader(aceEditor, '#');
                    break;
                case 'h2':
                    this._insertMarkdownHeader(aceEditor, '##');
                    break;
                case 'h3':
                    this._insertMarkdownHeader(aceEditor, '###');
                    break;
                case 'bold':
                    aceEditor.execCommand('boldText');
                    break;
                case 'italic':
                    aceEditor.execCommand('italicText');
                    break;
                case 'link':
                    aceEditor.execCommand('insertLink');
                    break;
                case 'image':
                    if (currentSelection === '') {
                        aceSnippetMngr.insertSnippet(aceEditor, '![${1:text}](http://$2)');
                    } else {
                        aceSnippetMngr.insertSnippet(aceEditor, `![${currentSelection}](http://$1)`);
                    }
                    break;
                case 'edit-mode':
                    this._isViewingPreview = false;
                    this._previewPaneNode.style.display = 'none';
                    this._editorPaneNode.style.display = 'block';
                    findElement(this._containerNode, '.btn-edit-mode').classList.add('active');
                    findElement(this._containerNode, '.btn-preview-mode').classList.remove('active');
                    if (this._isExpanded === true) {
                        this._adaptForFullscreen(this._editorPaneNode);
                    }
                    break;
                case 'preview-mode':
                    this._isViewingPreview = true;
                    this._previewPaneNode.innerHTML = `<p style="text-align:center; font-size:16px">${currentConfig.displayLabels.loadingText}...</p>`;
                    currentConfig.onRenderPreview(aceEditor.getSession().getValue(), renderedContent => {
                        this._previewPaneNode.innerHTML = renderedContent;
                    });
                    this._editorPaneNode.style.display = 'none';
                    this._previewPaneNode.style.display = 'block';
                    findElement(this._containerNode, '.btn-preview-mode').classList.add('active');
                    findElement(this._containerNode, '.btn-edit-mode').classList.remove('active');
                    if (this._isExpanded === true) {
                        this._adaptForFullscreen(this._previewPaneNode);
                    }
                    break;
                case 'toggle-fullscreen':
                    this._isExpanded = !this._isExpanded;
                    if (this._isExpanded === true) {
                        global.document.body.classList.add('composer-body-fullscreen');
                        global.document.documentElement.classList.add('composer-body-fullscreen');
                        this._containerNode.classList.add('composer-fullscreen');
                        if (this._isViewingPreview === false) {
                            this._adaptForFullscreen(this._editorPaneNode);
                        } else {
                            this._adaptForFullscreen(this._previewPaneNode);
                        }
                    } else {
                        global.document.body.classList.remove('composer-body-fullscreen');
                        global.document.documentElement.classList.remove('composer-body-fullscreen');
                        this._containerNode.classList.remove('composer-fullscreen');
                        this._editorPaneNode.style.height = currentConfig.sizeY;
                        this._previewPaneNode.style.height = currentConfig.sizeY;
                    }
                    aceEditor.resize();
                    break;
            }
        }

        _generateEditorStructure(initialContent, config) {
            const loadingHtml = constructElement('div', { className: 'composer-loading' }, [
                constructElement('span', { className: 'icon-wrapper' }, [
                    constructElement('span', { className: 'loader-icon' })
                ])
            ]);

            const toolbarGroup1 = constructElement('div', { className: 'button-group' }, [
                constructElement('button', { type: 'button', 'data-tip': 'tooltip', title: config.displayLabels.header1Btn, className: 'composer-action-btn btn btn-sm btn-default', 'data-action': 'h1', textContent: 'H1' }),
                constructElement('button', { type: 'button', 'data-tip': 'tooltip', title: config.displayLabels.header2Btn, className: 'composer-action-btn btn btn-sm btn-default', 'data-action': 'h2', textContent: 'H2' }),
                constructElement('button', { type: 'button', 'data-tip': 'tooltip', title: config.displayLabels.header3Btn, className: 'composer-action-btn btn btn-sm btn-default', 'data-action': 'h3', textContent: 'H3' })
            ]);

            const toolbarGroup2 = constructElement('div', { className: 'button-group' }, [
                constructElement('button', { type: 'button', 'data-tip': 'tooltip', title: config.displayLabels.boldBtn, className: 'composer-action-btn btn btn-sm btn-default', 'data-action': 'bold' }, [constructElement('span', { className: 'icon-bold' })]),
                constructElement('button', { type: 'button', 'data-tip': 'tooltip', title: config.displayLabels.italicBtn, className: 'composer-action-btn btn btn-sm btn-default', 'data-action': 'italic' }, [constructElement('span', { className: 'icon-italic' })])
            ]);

            const toolbarGroup3Children = [
                constructElement('button', { type: 'button', 'data-tip': 'tooltip', title: config.displayLabels.linkBtn, className: 'composer-action-btn btn btn-sm btn-default', 'data-action': 'link' }, [constructElement('span', { className: 'icon-link' })]),
                constructElement('button', { type: 'button', 'data-tip': 'tooltip', title: config.displayLabels.imageBtn, className: 'composer-action-btn btn btn-sm btn-default', 'data-action': 'image' }, [constructElement('span', { className: 'icon-picture' })])
            ];
            if (config.allowImageUpload === true) {
                toolbarGroup3Children.push(
                    constructElement('button', { type: 'button', 'data-tip': 'tooltip', title: config.displayLabels.uploadBtn, className: 'btn btn-sm btn-default upload-btn' }, [
                        constructElement('span', { className: 'icon-upload' }),
                        constructElement('input', { className: 'upload-selector', type: 'file', multiple: true, accept: '.jpg,.jpeg,.png,.gif' })
                    ])
                );
            }
            const toolbarGroup3 = constructElement('div', { className: 'button-group' }, toolbarGroup3Children);

            const toolbarGroups = [toolbarGroup1, toolbarGroup2, toolbarGroup3];

            if (config.allowFullscreen === true) {
                const fullscreenGroup = constructElement('div', { className: 'button-group pull-right' }, [
                    constructElement('button', { type: 'button', className: 'composer-action-btn btn btn-sm btn-default', 'data-action': 'toggle-fullscreen' }, [
                        constructElement('span', { className: 'icon-fullscreen' }),
                        ` ${config.displayLabels.fullscreenBtn}`
                    ])
                ]);
                toolbarGroups.push(fullscreenGroup);
            }

            if (config.enablePreview === true) {
                const previewGroup = constructElement('div', { className: 'button-group pull-right' }, [
                    constructElement('button', { type: 'button', className: 'composer-action-btn btn btn-sm btn-default btn-edit-mode active', 'data-action': 'edit-mode' }, [
                        constructElement('span', { className: 'icon-pencil' }),
                        ` ${config.displayLabels.editBtn}`
                    ]),
                    constructElement('button', { type: 'button', className: 'composer-action-btn btn btn-sm btn-default btn-preview-mode', 'data-action': 'preview-mode' }, [
                        constructElement('span', { className: 'icon-eye-open' }),
                        ` ${config.displayLabels.previewBtn}`
                    ])
                ]);
                toolbarGroups.push(previewGroup);
            }

            const toolbarContent = constructElement('div', { className: 'button-toolbar' }, toolbarGroups);
            const mainToolbar = constructElement('div', { className: 'composer-toolbar' }, [toolbarContent]);

            const editorArea = constructElement('div', { className: 'composer-input' }, [global.document.createTextNode(initialContent)]);
            const previewArea = constructElement('div', { className: 'composer-output', style: 'display:none' });

            const fragment = global.document.createDocumentFragment();
            fragment.appendChild(loadingHtml);
            fragment.appendChild(mainToolbar);
            fragment.appendChild(editorArea);
            fragment.appendChild(previewArea);

            return fragment;
        }

        getCurrentContent() {
            if (this._aceEditorInstance) {
                return this._aceEditorInstance.getSession().getValue();
            }
            return '';
        }
    }

    const composerInstances = new WeakMap();

    global.initMarkdownComposer = function (targetElement, composerOptionsOrMethod, ...methodArgs) {
        if (!(targetElement instanceof Node)) {
            global.console.error('initMarkdownComposer: First argument must be a DOM element.');
            return;
        }

        if (typeof composerOptionsOrMethod === 'string') {
            const composerInstance = composerInstances.get(targetElement);
            if (!composerInstance) {
                global.console.error('MarkdownComposer not initialized on this element. Cannot call method:', composerOptionsOrMethod);
                return;
            }
            if (typeof composerInstance[composerOptionsOrMethod] === 'function') {
                return composerInstance[composerOptionsOrMethod](...methodArgs);
            } else {
                global.console.error(`Method "${composerOptionsOrMethod}" does not exist on MarkdownComposer instance.`);
            }
        } else {
            const currentOptions = composerOptionsOrMethod || {};
            // Re-initialization behavior matches original: replace content and re-setup.
            const composerInstance = new MarkdownComposer(targetElement, currentOptions);
            composerInstances.set(targetElement, composerInstance);
            return composerInstance;
        }
    };

})(window);