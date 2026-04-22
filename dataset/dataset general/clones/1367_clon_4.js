!function(jqInstance, editorCore) {
    "use strict";

    // Renamed module for generating HTML components using a Map for lookup
    const componentTemplates = new Map();

    componentTemplates.set("formatStyles", (languageData, componentSettings) => {
        const buttonSizeClass = (componentSettings && componentSettings.buttonScale) ? ' btn-' + componentSettings.buttonScale : '';
        const styleOptions = [
            { cmdValue: 'div', display: languageData.textFormats.normal },
            { cmdValue: 'h1', display: languageData.textFormats.h1 },
            { cmdValue: 'h2', display: languageData.textFormats.h2 },
            { cmdValue: 'h3', display: languageData.textFormats.h3 },
            { cmdValue: 'h4', display: languageData.textFormats.h4 },
            { cmdValue: 'h5', display: languageData.textFormats.h5 },
            { cmdValue: 'h6', display: languageData.textFormats.h6 }
        ];

        return `
            <li class='dropdown-item'>
                <a class='btn btn-default btn${buttonSizeClass} dropdown-toggle' data-toggle-action='dropdown' href='#'>
                    <i class='glyph-icon glyph-font'></i>&nbsp;<span class='active-font-indicator'>${languageData.textFormats.normal}</span>&nbsp;<b class='dropdown-arrow'></b>
                </a>
                <ul class='dropdown-menu-list'>
                    ${styleOptions.map(opt => `
                        <li><a data-editor-command='formatBlock' data-command-parameter='${opt.cmdValue}' tabindex='-1'>${opt.display}</a></li>
                    `).join('')}
                </ul>
            </li>
        `;
    });

    componentTemplates.set("textEmphasis", (languageData, componentSettings) => {
        const buttonSizeClass = (componentSettings && componentSettings.buttonScale) ? ' btn-' + componentSettings.buttonScale : '';
        const emphasisActions = [
            { command: 'bold', shortcut: 'CTRL+B', text: languageData.emphasisOptions.bold },
            { command: 'italic', shortcut: 'CTRL+I', text: languageData.emphasisOptions.italic },
            { command: 'underline', shortcut: 'CTRL+U', text: languageData.emphasisOptions.underline }
        ];

        return `
            <li>
                <div class='button-group-container'>
                    ${emphasisActions.map(action => `
                        <a class='btn btn-default btn${buttonSizeClass}' data-editor-command='${action.command}' title='${action.shortcut}' tabindex='-1'>${action.text}</a>
                    `).join('')}
                </div>
            </li>
        `;
    });

    componentTemplates.set("listOperations", (languageData, componentSettings) => {
        const buttonSizeClass = (componentSettings && componentSettings.buttonScale) ? ' btn-' + componentSettings.buttonScale : '';
        const listActions = [
            { command: 'insertUnorderedList', title: languageData.listControls.unordered, iconClass: 'glyph-list' },
            { command: 'insertOrderedList', title: languageData.listControls.ordered, iconClass: 'glyph-th-list' },
            { command: 'Outdent', title: languageData.listControls.outdent, iconClass: 'glyph-indent-right' },
            { command: 'Indent', title: languageData.listControls.indent, iconClass: 'glyph-indent-left' }
        ];

        return `
            <li>
                <div class='button-group-container'>
                    ${listActions.map(action => `
                        <a class='btn btn-default btn${buttonSizeClass}' data-editor-command='${action.command}' title='${action.title}' tabindex='-1'><i class='glyph-icon ${action.iconClass}'></i></a>
                    `).join('')}
                </div>
            </li>
        `;
    });

    componentTemplates.set("hyperlinkInput", (languageData, componentSettings) => {
        const buttonSizeClass = (componentSettings && componentSettings.buttonScale) ? ' btn-' + componentSettings.buttonScale : '';
        return `
            <li>
                <div class='dynamic-link-dialog modal-container hidden'>
                    <div class='dialog-content-area'>
                        <div class='dialog-header-section'>
                            <a class='dialog-close-button'>&times;</a>
                            <h3 class='dialog-title-text'>${languageData.linkDetails.insert}</h3>
                        </div>
                        <div class='dialog-body-content'>
                            <input value='http://' class='link-url-input-field control-input-style'>
                            <label class='checkbox-label'> <input type='checkbox' class='link-new-window-checkbox' checked>${languageData.linkDetails.target}</label>
                        </div>
                        <div class='dialog-footer-section'>
                            <a href='#' class='dialog-cancel-button btn btn-default'>${languageData.linkDetails.cancel}</a>
                            <a href='#' class='dialog-confirm-button btn btn-primary'>${languageData.linkDetails.insert}</a>
                        </div>
                    </div>
                </div>
                <a class='btn btn-default${buttonSizeClass}' data-editor-command='createLink' title='${languageData.linkDetails.insert}' tabindex='-1'><i class='glyph-icon glyph-share'></i></a>
            </li>
        `;
    });

    componentTemplates.set("imageUpload", (languageData, componentSettings) => {
        const buttonSizeClass = (componentSettings && componentSettings.buttonScale) ? ' btn-' + componentSettings.buttonScale : '';
        return `
            <li>
                <div class='dynamic-image-dialog modal-container hidden'>
                    <div class='dialog-content-area'>
                        <div class='dialog-header-section'>
                            <a class='dialog-close-button'>&times;</a>
                            <h3 class='dialog-title-text'>${languageData.imageDetails.insert}</h3>
                        </div>
                        <div class='dialog-body-content'>
                            <input value='http://' class='image-url-input-field control-input-style'>
                        </div>
                        <div class='dialog-footer-section'>
                            <a href='#' class='dialog-cancel-button btn btn-default'>${languageData.imageDetails.cancel}</a>
                            <a href='#' class='dialog-confirm-button btn btn-primary'>${languageData.imageDetails.insert}</a>
                        </div>
                    </div>
                </div>
                <a class='btn btn-default btn${buttonSizeClass}' data-editor-command='insertImage' title='${languageData.imageDetails.insert}' tabindex='-1'><i class='glyph-icon glyph-picture'></i></a>
            </li>
        `;
    });

    componentTemplates.set("htmlSourceToggle", (languageData, componentSettings) => {
        const buttonSizeClass = (componentSettings && componentSettings.buttonScale) ? ' btn-' + componentSettings.buttonScale : '';
        return `
            <li>
                <div class='button-group-container'>
                    <a class='btn btn-default btn${buttonSizeClass}' data-editor-action='toggle_html_view' title='${languageData.htmlView.edit}' tabindex='-1'><i class='glyph-icon glyph-pencil'></i></a>
                </div>
            </li>
        `;
    });

    componentTemplates.set("colorPicker", (languageData, componentSettings) => {
        const buttonSizeClass = (componentSettings && componentSettings.buttonScale) ? ' btn-' + componentSettings.buttonScale : '';
        const colorOptions = [
            'black', 'silver', 'gray', 'maroon', 'red', 'purple', 'green', 'olive', 'navy', 'blue', 'orange'
        ];
        return `
            <li class='dropdown-item'>
                <a class='btn btn-default dropdown-toggle${buttonSizeClass}' data-toggle-action='dropdown' href='#' tabindex='-1'>
                    <span class='active-color-indicator'>${languageData.colorPalette.black}</span>&nbsp;<b class='dropdown-arrow'></b>
                </a>
                <ul class='dropdown-menu-list'>
                    ${colorOptions.map(color => `
                        <li><div class='color-swatch-display' data-command-parameter='${color}'></div><a class='color-option-title' data-editor-command='foreColor' data-command-parameter='${color}'>${languageData.colorPalette[color]}</a></li>
                    `).join('')}
                </ul>
            </li>
        `;
    });

    // Helper to render component markup
    const renderComponentMarkup = (componentKey, languageData, componentSettings) => {
        if (!componentTemplates.has(componentKey)) {
            console.warn(`Unknown component key: ${componentKey}`);
            return '';
        }
        return componentTemplates.get(componentKey)(languageData, componentSettings);
    };

    // Main editor management class
    class RichTextEditorFacade {
        constructor(targetElement, editorConfiguration) {
            this.rootElement = targetElement;
            this.currentConfig = this.deepMergeObjects(initialConfiguration, editorConfiguration || {});

            // Custom templates override built-in ones
            if (editorConfiguration && editorConfiguration.customMarkupTemplates) {
                for (const [key, func] of Object.entries(editorConfiguration.customMarkupTemplates)) {
                    componentTemplates.set(key, func);
                }
            }

            this.activeLanguage = languageSets[this.currentConfig.languageCode || initialConfiguration.languageCode];

            this.toolbarHost = this.constructToolbar(this.rootElement, this.currentConfig);
            this.editorInstance = this.initializeEditor(this.currentConfig);

            // Expose editor instance for external access/debugging (like original)
            window.activeEditorReference = this.editorInstance;

            // Native event handling for iframe focus to close dropdowns
            document.querySelectorAll('iframe.wysihtml5-sandbox').forEach(iframe => {
                iframe.contentWindow.addEventListener('focus', this.handleSandboxFocus.bind(this));
            });
        }

        // Custom deep merge function to avoid external dependencies like jQuery's extend
        deepMergeObjects(target, source) {
            const output = { ...target };
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        output[key] = this.deepMergeObjects(output[key] || {}, source[key]);
                    } else {
                        output[key] = source[key];
                    }
                }
            }
            return output;
        }

        handleSandboxFocus() {
            // Close all dropdowns when the editor iframe gains focus
            document.querySelectorAll('li.dropdown-item').forEach(li => li.classList.remove('open'));
        }

        initializeEditor(configOptions) {
            // Ensure toolbar element is passed directly to editor core
            const editorSetup = this.deepMergeObjects({}, configOptions); // Deep clone options
            editorSetup.toolbar = this.toolbarHost;

            const editor = new editorCore.Editor(this.rootElement, editorSetup);

            if (configOptions && configOptions.eventHandlers) {
                for (const eventName in configOptions.eventHandlers) {
                    editor.on(eventName, configOptions.eventHandlers[eventName]);
                }
            }
            return editor;
        }

        constructToolbar(containerElement, toolbarConfig) {
            const toolbarContainer = document.createElement('ul');
            toolbarContainer.className = 'editor-control-panel';
            toolbarContainer.style.display = 'none'; // Initially hidden

            // Explicitly define toolbar component order
            const orderedComponents = [
                "formatStyles", "textEmphasis", "listOperations",
                "hyperlinkInput", "imageUpload", "htmlSourceToggle",
                "colorPicker"
            ];

            orderedComponents.forEach(componentKey => {
                // Determine if component is enabled based on user config or initial defaults
                const componentEnabled = toolbarConfig[componentKey] !== undefined ? toolbarConfig[componentKey] : initialConfiguration[componentKey];

                if (componentEnabled) {
                    const htmlFragment = renderComponentMarkup(componentKey, this.activeLanguage, toolbarConfig);
                    // Use a temporary div to parse HTML string into DOM elements
                    const tempWrapper = document.createElement('div');
                    tempWrapper.innerHTML = htmlFragment.trim();
                    while (tempWrapper.firstChild) {
                        toolbarContainer.appendChild(tempWrapper.firstChild);
                    }

                    // Attach specific handlers based on component key
                    if (componentKey === "htmlSourceToggle") {
                        this.setupHtmlToggleFunctionality(toolbarContainer);
                    }
                    if (componentKey === "hyperlinkInput") {
                        this.configureLinkDialog(toolbarContainer);
                    }
                    if (componentKey === "imageUpload") {
                        this.configureImageDialog(toolbarContainer);
                    }
                }
            });

            // Process custom toolbar elements provided in configuration
            if (toolbarConfig.customToolbarElements) {
                toolbarConfig.customToolbarElements.forEach(element => {
                    if (typeof element === 'string') {
                        const tempWrapper = document.createElement('div');
                        tempWrapper.innerHTML = element.trim();
                        while (tempWrapper.firstChild) {
                            toolbarContainer.appendChild(tempWrapper.firstChild);
                        }
                    } else if (element instanceof HTMLElement) {
                        toolbarContainer.appendChild(element);
                    }
                });
            }

            // Centralized event listener for dropdown toggles (data-toggle-action='dropdown')
            toolbarContainer.addEventListener('click', (event) => {
                const toggle = event.target.closest('[data-toggle-action="dropdown"]');
                if (toggle) {
                    event.preventDefault();
                    toggle.parentNode.classList.toggle('open');
                }
            });

            // Event delegation for font style display update
            toolbarContainer.addEventListener('click', (event) => {
                const targetAction = event.target.closest('[data-editor-command="formatBlock"]');
                if (targetAction) {
                    const displayElement = toolbarContainer.querySelector('.active-font-indicator');
                    if (displayElement) {
                        displayElement.textContent = targetAction.textContent;
                    }
                }
            });

            // Event delegation for color display update
            toolbarContainer.addEventListener('click', (event) => {
                const targetAction = event.target.closest('[data-editor-command="foreColor"]');
                if (targetAction) {
                    const displayElement = toolbarContainer.querySelector('.active-color-indicator');
                    if (displayElement) {
                        displayElement.textContent = targetAction.textContent;
                    }
                }
            });

            // Insert the constructed toolbar before the target element
            containerElement.parentNode.insertBefore(toolbarContainer, containerElement);

            return toolbarContainer;
        }

        setupHtmlToggleFunctionality(toolbar) {
            const viewToggleSelector = '[data-editor-action="toggle_html_view"]';
            const toggleButton = toolbar.querySelector(viewToggleSelector);
            if (toggleButton) {
                toggleButton.addEventListener('click', (event) => {
                    // Toggle 'disabled' class on all other buttons in the toolbar
                    toolbar.querySelectorAll('a.btn').forEach(btn => {
                        if (btn !== event.currentTarget) {
                            btn.classList.toggle('disabled');
                        }
                    });
                });
            }
        }

        configureImageDialog(toolbar) {
            const imageModal = toolbar.querySelector('.dynamic-image-dialog');
            const urlInput = imageModal.querySelector('.image-url-input-field');
            const confirmBtn = imageModal.querySelector('.dialog-confirm-button');
            const cancelBtn = imageModal.querySelector('.dialog-cancel-button');
            const closeBtn = imageModal.querySelector('.dialog-close-button');
            const triggerBtn = toolbar.querySelector('[data-editor-command="insertImage"]');

            const defaultUrlValue = urlInput.value;
            let savedSelectionBookmark = null;

            const performImageInsertion = () => {
                const imageUrl = urlInput.value;
                urlInput.value = defaultUrlValue; // Reset input field
                this.editorInstance.currentView.element.focus();
                if (savedSelectionBookmark) {
                    this.editorInstance.composer.selection.setBookmark(savedSelectionBookmark);
                    savedSelectionBookmark = null;
                }
                this.editorInstance.composer.commands.exec("insertImage", imageUrl);
            };

            const displayModal = () => {
                imageModal.classList.remove('hidden');
                imageModal.style.display = 'flex'; // Use flex for centering the modal
                urlInput.focus(); // Focus the input field
            };

            const hideModal = () => {
                imageModal.classList.add('hidden');
                imageModal.style.display = 'none';
                this.editorInstance.currentView.element.focus(); // Return focus to editor
            };

            urlInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    performImageInsertion();
                    hideModal();
                }
            });

            confirmBtn.addEventListener('click', () => {
                performImageInsertion();
                hideModal();
            });

            cancelBtn.addEventListener('click', hideModal);
            closeBtn.addEventListener('click', hideModal);

            triggerBtn.addEventListener('click', (event) => {
                const isCurrentlyActive = event.currentTarget.classList.contains("wysihtml5-command-active");
                if (!isCurrentlyActive) {
                    this.editorInstance.currentView.element.focus(false); // Blur editor before showing modal
                    savedSelectionBookmark = this.editorInstance.composer.selection.getBookmark();
                    document.body.appendChild(imageModal); // Move modal to body for proper z-index and overlay
                    displayModal();
                    event.stopPropagation(); // Prevent dropdown closing on click
                    event.preventDefault(); // Prevent default link behavior
                }
            });
        }

        configureLinkDialog(toolbar) {
            const linkModal = toolbar.querySelector('.dynamic-link-dialog');
            const urlInput = linkModal.querySelector('.link-url-input-field');
            const targetCheckbox = linkModal.querySelector('.link-new-window-checkbox');
            const confirmBtn = linkModal.querySelector('.dialog-confirm-button');
            const cancelBtn = linkModal.querySelector('.dialog-cancel-button');
            const closeBtn = linkModal.querySelector('.dialog-close-button');
            const triggerBtn = toolbar.querySelector('[data-editor-command="createLink"]');

            const defaultUrlValue = urlInput.value;
            let savedSelectionBookmark = null;

            const performLinkInsertion = () => {
                const linkUrl = urlInput.value;
                urlInput.value = defaultUrlValue; // Reset input field
                this.editorInstance.currentView.element.focus();
                if (savedSelectionBookmark) {
                    this.editorInstance.composer.selection.setBookmark(savedSelectionBookmark);
                    savedSelectionBookmark = null;
                }

                const openInNewTab = targetCheckbox.checked;
                this.editorInstance.composer.commands.exec("createLink", {
                    'href': linkUrl,
                    'target': (openInNewTab ? '_blank' : '_self'),
                    'rel': (openInNewTab ? 'nofollow' : '')
                });
            };

            const displayModal = () => {
                linkModal.classList.remove('hidden');
                linkModal.style.display = 'flex';
                urlInput.focus();
            };

            const hideModal = () => {
                linkModal.classList.add('hidden');
                linkModal.style.display = 'none';
                this.editorInstance.currentView.element.focus();
            };

            urlInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    performLinkInsertion();
                    hideModal();
                }
            });

            confirmBtn.addEventListener('click', () => {
                performLinkInsertion();
                hideModal();
            });

            cancelBtn.addEventListener('click', hideModal);
            closeBtn.addEventListener('click', hideModal);

            triggerBtn.addEventListener('click', (event) => {
                const isCurrentlyActive = event.currentTarget.classList.contains("wysihtml5-command-active");
                if (!isCurrentlyActive) {
                    this.editorInstance.currentView.element.focus(false);
                    savedSelectionBookmark = this.editorInstance.composer.selection.getBookmark();
                    document.body.appendChild(linkModal); // Move modal to body
                    displayModal();
                    event.stopPropagation();
                    event.preventDefault();
                }
            });
        }
    }

    // Renamed global configuration object
    const initialConfiguration = {
        "formatStyles": true,
        "colorPicker": false,
        "textEmphasis": true,
        "listOperations": true,
        "htmlSourceToggle": false,
        "hyperlinkInput": true,
        "imageUpload": true,
        eventHandlers: {}, // Renamed key
        parserRules: { // Renamed key
            cssClasses: { // Renamed key
                "wysiwyg-color-silver": 1, "wysiwyg-color-gray": 1, "wysiwyg-color-white": 1,
                "wysiwyg-color-maroon": 1, "wysiwyg-color-red": 1, "wysiwyg-color-purple": 1,
                "wysiwyg-color-fuchsia": 1, "wysiwyg-color-green": 1, "wysiwyg-color-lime": 1,
                "wysiwyg-color-olive": 1, "wysiwyg-color-yellow": 1, "wysiwyg-color-navy": 1,
                "wysiwyg-color-blue": 1, "wysiwyg-color-teal": 1, "wysiwyg-color-aqua": 1,
                "wysiwyg-color-orange": 1
            },
            htmlTags: { // Renamed key
                "b": {}, "i": {}, "br": {}, "ol": {}, "ul": {}, "li": {},
                "h1": {}, "h2": {}, "h3": {}, "h4": {}, "h5": {}, "h6": {},
                "blockquote": {}, "u": 1,
                "img": {
                    "attributeValidation": { // Renamed key
                        "width": "numbers", "alt": "alt", "src": "url", "height": "numbers"
                    }
                },
                "a": {
                    attributeValidation: {
                        'href': "url",
                        'target': 'alt',
                        'rel': 'alt'
                    }
                },
                "span": 1, "div": 1, "code": 1, "pre": 1
            }
        },
        styleSheets: ["<%= stylesheet_path('bootstrap-wysihtml5/wysiwyg-color.css') %>"],
        languageCode: "en"
    };

    // Renamed language data structure
    const languageSets = {
        en: {
            textFormats: { // Renamed key
                normal: "Standard Paragraph",
                h1: "Major Heading",
                h2: "Secondary Heading",
                h3: "Tertiary Heading",
                h4: "Heading Level 4",
                h5: "Heading Level 5",
                h6: "Heading Level 6"
            },
            emphasisOptions: { // Renamed key
                bold: "Strong",
                italic: "Slanted",
                underline: "Underline Text"
            },
            listControls: { // Renamed key
                unordered: "Bullet List",
                ordered: "Numbered List",
                outdent: "Decrease Indent",
                indent: "Increase Indent"
            },
            linkDetails: { // Renamed key
                insert: "Add Hyperlink",
                cancel: "Discard",
                target: "Open link in new tab"
            },
            imageDetails: { // Renamed key
                insert: "Embed Image",
                cancel: "Dismiss"
            },
            htmlView: { // Renamed key
                edit: "Source Code"
            },
            colorPalette: { // Renamed key
                black: "Pure Black",
                silver: "Light Gray",
                gray: "Medium Gray",
                maroon: "Dark Red",
                red: "Bright Red",
                purple: "Deep Purple",
                green: "Forest Green",
                olive: "Olive Green",
                navy: "Dark Blue",
                blue: "Sky Blue",
                orange: "Vibrant Orange"
            }
        }
    };

    // Global utility object instead of jQuery plugin
    window.RichTextEditorUtility = {
        // Factory function to create an editor instance
        createInstance: (element, options) => {
            return new RichTextEditorFacade(element, options);
        },

        // Method to reset configuration to initial state
        restoreDefaults: () => {
            Object.assign(initialConfiguration, JSON.parse(JSON.stringify(window.RichTextEditorUtility.defaultSnapshot)));
        },

        // Public access to default configuration and language packs
        defaultConfiguration: initialConfiguration,
        availableLanguagePacks: languageSets
    };

    // Create a snapshot of initial defaults for reset functionality
    window.RichTextEditorUtility.defaultSnapshot = JSON.parse(JSON.stringify(initialConfiguration));

    // Inject minimal CSS for custom modals to function without Bootstrap JS/CSS
    const modalStyles = `
        .modal-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1050;
        }
        .dialog-content-area {
            background: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,.5);
            width: 500px;
            max-width: 90%;
        }
        .dialog-header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .dialog-close-button {
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            color: #000;
            text-decoration: none;
        }
        .dialog-body-content {
            padding: 15px 0;
        }
        .dialog-footer-section {
            padding-top: 10px;
            border-top: 1px solid #eee;
            text-align: right;
        }
        .control-input-style {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        .checkbox-label {
            display: block;
            margin-top: 10px;
        }
        .hidden {
            display: none !important;
        }
        /* Basic dropdown styling for custom implementation */
        .dropdown-item .dropdown-menu-list {
            display: none;
            position: absolute;
            background-color: #f9f9f9;
            min-width: 160px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            z-index: 1;
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .dropdown-item.open .dropdown-menu-list {
            display: block;
        }
        .dropdown-menu-list li a {
            color: black;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            text-align: left;
        }
        .dropdown-menu-list li a:hover {
            background-color: #f1f1f1;
        }
        .color-swatch-display {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 1px solid #ccc;
            vertical-align: middle;
            margin-right: 5px;
        }
        /* Dynamic color swatches */
        .color-swatch-display[data-command-parameter='black'] { background-color: black; }
        .color-swatch-display[data-command-parameter='silver'] { background-color: silver; }
        .color-swatch-display[data-command-parameter='gray'] { background-color: gray; }
        .color-swatch-display[data-command-parameter='maroon'] { background-color: maroon; }
        .color-swatch-display[data-command-parameter='red'] { background-color: red; }
        .color-swatch-display[data-command-parameter='purple'] { background-color: purple; }
        .color-swatch-display[data-command-parameter='green'] { background-color: green; }
        .color-swatch-display[data-command-parameter='olive'] { background-color: olive; }
        .color-swatch-display[data-command-parameter='navy'] { background-color: navy; }
        .color-swatch-display[data-command-parameter='blue'] { background-color: blue; }
        .color-swatch-display[data-command-parameter='orange'] { background-color: orange; }
    `;
    const styleElement = document.createElement('style');
    styleElement.textContent = modalStyles;
    document.head.appendChild(styleElement);

}(null, wysi);