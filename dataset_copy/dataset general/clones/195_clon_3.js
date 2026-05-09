!function(jQ, htmlEditorCore) {
    "use strict";

    // Rewritten path calculation using URL object for robustness.
    // Added a guard clause for window.location.href validity.
    const adminSegment = "admin";
    let styleResourceBaseUrl = "";

    try {
        const currentBrowserUrl = new URL(window.location.href);
        const pathParts = currentBrowserUrl.pathname.split('/').filter(Boolean); // Filter out empty strings
        const adminSegmentIndex = pathParts.indexOf(adminSegment);

        if (adminSegmentIndex !== -1) {
            // Reconstruct URL up to and including the 'admin' segment
            styleResourceBaseUrl = currentBrowserUrl.origin + '/' + pathParts.slice(0, adminSegmentIndex + 1).join('/') + "/css/";
        } else {
            // Fallback to a common admin CSS path if 'admin' segment is not found in the URL
            console.warn(`Admin path segment '${adminSegment}' not found in current URL. Defaulting to a common CSS path.`);
            styleResourceBaseUrl = currentBrowserUrl.origin + "/Admin/css/";
        }
    } catch (parseError) {
        console.error("Error parsing window.location.href for style resources:", parseError);
        // Hardcoded absolute fallback if URL parsing fails
        styleResourceBaseUrl = "/Admin/css/";
    }

    // Helper utility to generate common button size classes
    const getButtonSizeModifier = (componentConfig) => {
        return (componentConfig && componentConfig.btnSize) ? ` btn-${componentConfig.btnSize}` : '';
    };

    // Renamed 'tpl' to 'componentMarkupGenerators' for clarity and changed function names to camelCase
    const componentMarkupGenerators = {
        // Generates HTML for font style dropdown
        fontStyles: (localizationData, componentConfig) => {
            const sizeClass = getButtonSizeModifier(componentConfig);
            return `<li class="dropdown">
              <a class="btn dropdown-toggle${sizeClass}" data-toggle="dropdown" href="#">
                <i class="icon-font"></i>&nbsp;<span class="current-font-selection">${localizationData.fontStyles.normal}</span>&nbsp;<b class="caret"></b>
              </a>
              <ul class="dropdown-menu">
                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="div">${localizationData.fontStyles.normal}</a></li>
                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h1">${localizationData.fontStyles.h1}</a></li>
                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h2">${localizationData.fontStyles.h2}</a></li>
                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h3">${localizationData.fontStyles.h3}</a></li>
              </ul>
            </li>`;
        },

        // Generates HTML for text emphasis buttons (bold, italic, underline)
        textEmphasis: (localizationData, componentConfig) => {
            const sizeClass = getButtonSizeModifier(componentConfig);
            return `<li>
              <div class="btn-group">
                <a class="btn${sizeClass}" data-wysihtml5-command="bold" title="Toggle Bold (Ctrl+B)">${localizationData.emphasis.bold}</a>
                <a class="btn${sizeClass}" data-wysihtml5-command="italic" title="Toggle Italic (Ctrl+I)">${localizationData.emphasis.italic}</a>
                <a class="btn${sizeClass}" data-wysihtml5-command="underline" title="Toggle Underline (Ctrl+U)">${localizationData.emphasis.underline}</a>
              </div>
            </li>`;
        },

        // Generates HTML for list and indentation controls
        listOperations: (localizationData, componentConfig) => {
            const sizeClass = getButtonSizeModifier(componentConfig);
            return `<li>
              <div class="btn-group">
                <a class="btn${sizeClass}" data-wysihtml5-command="insertUnorderedList" title="${localizationData.lists.unordered}"><i class="icon-list"></i></a>
                <a class="btn${sizeClass}" data-wysihtml5-command="insertOrderedList" title="${localizationData.lists.ordered}"><i class="icon-th-list"></i></a>
                <a class="btn${sizeClass}" data-wysihtml5-command="Outdent" title="${localizationData.lists.decreaseIndent}"><i class="icon-indent-right"></i></a>
                <a class="btn${sizeClass}" data-wysihtml5-command="Indent" title="${localizationData.lists.increaseIndent}"><i class="icon-indent-left"></i></a>
              </div>
            </li>`;
        },

        // Generates HTML for the link insertion modal and button
        insertLink: (localizationData, componentConfig) => {
            const sizeClass = getButtonSizeModifier(componentConfig);
            const modalBaseClasses = "bootstrap-wysihtml5-insert-link-modal modal hide fade";
            const defaultUrlValue = "http://"; // Retained for existing behavior

            return `<li>
              <div class="${modalBaseClasses}">
                <div class="modal-header">
                  <a class="close" data-dismiss="modal">&times;</a>
                  <h3>${localizationData.link.prompt}</h3>
                </div>
                <div class="modal-body">
                  <input value="${defaultUrlValue}" class="bootstrap-wysihtml5-insert-link-url input-xlarge" type="url" placeholder="Enter URL">
                </div>
                <div class="modal-footer">
                  <a href="#" class="btn" data-dismiss="modal">${localizationData.link.cancel}</a>
                  <a href="#" class="btn btn-primary btn-confirm-insert" data-dismiss="modal">${localizationData.link.insert}</a>
                </div>
              </div>
              <a class="btn${sizeClass}" data-wysihtml5-command="createLink" title="${localizationData.link.insert}"><i class="icon-share"></i></a>
            </li>`;
        },

        // Generates HTML for the image insertion modal and button
        insertImage: (localizationData, componentConfig) => {
            const sizeClass = getButtonSizeModifier(componentConfig);
            const modalBaseClasses = "bootstrap-wysihtml5-insert-image-modal modal hide fade";
            const defaultUrlValue = "http://";

            return `<li>
              <div class="${modalBaseClasses}">
                <div class="modal-header">
                  <a class="close" data-dismiss="modal">&times;</a>
                  <h3>${localizationData.image.prompt}</h3>
                </div>
                <div class="modal-body">
                  <input value="${defaultUrlValue}" class="bootstrap-wysihtml5-insert-image-url input-xlarge" type="url" placeholder="Enter image URL">
                </div>
                <div class="modal-footer">
                  <a href="#" class="btn" data-dismiss="modal">${localizationData.image.cancel}</a>
                  <a href="#" class="btn btn-primary btn-confirm-insert" data-dismiss="modal">${localizationData.image.insert}</a>
                </div>
              </div>
              <a class="btn${sizeClass}" data-wysihtml5-command="insertImage" title="${localizationData.image.insert}"><i class="icon-picture"></i></a>
            </li>`;
        },

        // Generates HTML for the HTML view toggle button
        htmlSourceView: (localizationData, componentConfig) => {
            const sizeClass = getButtonSizeModifier(componentConfig);
            return `<li>
              <div class="btn-group">
                <a class="btn${sizeClass}" data-wysihtml5-action="change_view" title="${localizationData.html.toggleSource}"><i class="icon-pencil"></i></a>
              </div>
            </li>`;
        },

        // Generates HTML for the color picker dropdown
        colorPicker: (localizationData, componentConfig) => {
            const sizeClass = getButtonSizeModifier(componentConfig);
            const availableColors = [
                { display: localizationData.colors.black, value: 'black' },
                { display: localizationData.colors.silver, value: 'silver' },
                { display: localizationData.colors.gray, value: 'gray' },
                { display: localizationData.colors.maroon, value: 'maroon' },
                { display: localizationData.colors.red, value: 'red' },
                { display: localizationData.colors.purple, value: 'purple' },
                { display: localizationData.colors.green, value: 'green' },
                { display: localizationData.colors.olive, value: 'olive' },
                { display: localizationData.colors.navy, value: 'navy' },
                { display: localizationData.colors.blue, value: 'blue' },
                { display: localizationData.colors.orange, value: 'orange' }
            ];

            const colorOptionsHtml = availableColors.map(color => `
                <li>
                    <div class="wysihtml5-color-swatch" style="background-color: ${color.value};" data-wysihtml5-command-value="${color.value}"></div>
                    <a class="wysihtml5-colors-title" data-wysihtml5-command="foreColor" data-wysihtml5-command-value="${color.value}">${color.display}</a>
                </li>
            `).join('');

            return `<li class="dropdown">
              <a class="btn dropdown-toggle${sizeClass}" data-toggle="dropdown" href="#">
                <span class="current-color-selection">${localizationData.colors.black}</span>&nbsp;<b class="caret"></b>
              </a>
              <ul class="dropdown-menu">
                ${colorOptionsHtml}
              </ul>
            </li>`;
        }
    };

    // Renamed 'templates' function to 'retrieveComponentMarkup'
    const retrieveComponentMarkup = (templateKey, localizationData, optionsData) => {
        if (!componentMarkupGenerators[templateKey]) {
            console.error(`Error: Template generator for key "${templateKey}" is undefined.`);
            return ''; // Return empty string if generator is missing
        }
        return componentMarkupGenerators[templateKey](localizationData, optionsData);
    };


    // Renamed Wysihtml5 class to EditorInstanceWrapper
    class EditorInstanceWrapper {
        constructor(hostElement, configurationOptions) {
            if (!hostElement || !hostElement.length) {
                console.error("Editor host element is invalid or not found.");
                return;
            }
            this.editorHostElement = hostElement;
            const effectiveConfig = configurationOptions || defaultPluginConfiguration;

            // Integrate custom templates provided in options
            if (effectiveConfig.customTemplates) {
                Object.assign(componentMarkupGenerators, effectiveConfig.customTemplates);
            }
            
            this.toolbarElement = this.constructToolbar(hostElement, effectiveConfig);
            this.wysiwygCoreInstance = this.initializeWysiwygEditor(configurationOptions);

            // Removed non-essential global debug assignment: window.editor = this.wysiwygCoreInstance;

            // Refactored iframe focus handling for dropdown closure
            jQ('iframe.wysihtml5-sandbox').each((_idx, iframeEl) => {
                jQ(iframeEl.contentWindow).off('focus.wysihtml5-dropdown').on({ // Changed event namespace
                    'focus.wysihtml5-dropdown': () => {
                        jQ('li.dropdown').removeClass('open'); // Close any open dropdowns
                    }
                });
            });
        }

        initializeWysiwygEditor(options) {
            const editorSetupOptions = options || {};
            editorSetupOptions.toolbar = this.toolbarElement[0]; // Link toolbar DOM element

            const editorCore = new htmlEditorCore.Editor(this.editorHostElement[0], editorSetupOptions);

            // Simplified and added hasOwnProperty check for event binding
            if (editorSetupOptions.events) {
                for (const eventKey in editorSetupOptions.events) {
                    if (Object.prototype.hasOwnProperty.call(editorSetupOptions.events, eventKey)) {
                        editorCore.on(eventKey, editorSetupOptions.events[eventKey]);
                    }
                }
            }
            return editorCore;
        }

        constructToolbar(hostElement, editorConfiguration) {
            const selfReference = this;
            const toolbarHtmlElement = jQ("<ul/>", {
                'class': "wysihtml5-toolbar",
                'style': "display:none" // Toolbar remains hidden until editor is ready
            });
            const currentCulture = editorConfiguration.locale || defaultPluginConfiguration.locale || "en";
            const activeLocalization = editorLocalizationStrings[currentCulture];

            if (!activeLocalization) {
                console.error(`Localization data for culture "${currentCulture}" is missing.`);
                return toolbarHtmlElement; // Return empty toolbar
            }

            // Iterate over default features defined in settings
            for (const featureName in defaultPluginConfiguration) {
                if (Object.prototype.hasOwnProperty.call(defaultPluginConfiguration, featureName)) {
                    let featureEnabled = false;

                    // Determine if feature is enabled, prioritizing user config over defaults
                    if (editorConfiguration[featureName] !== undefined) {
                        featureEnabled = editorConfiguration[featureName] === true;
                    } else {
                        featureEnabled = defaultPluginConfiguration[featureName] === true;
                    }

                    if (featureEnabled) {
                        toolbarHtmlElement.append(retrieveComponentMarkup(featureName, activeLocalization, editorConfiguration));

                        // Initialize specific feature handlers
                        switch (featureName) {
                            case "htmlSourceView":
                                this.initHtmlViewToggle(toolbarHtmlElement);
                                break;
                            case "insertLink":
                                this.initLinkModalHandler(toolbarHtmlElement);
                                break;
                            case "insertImage":
                                this.initImageModalHandler(toolbarHtmlElement);
                                break;
                            // No default case needed as features are added explicitly
                        }
                    }
                }
            }

            // Append any custom toolbar items provided in the configuration
            if (editorConfiguration.toolbar) {
                for (const customItemKey in editorConfiguration.toolbar) {
                    if (Object.prototype.hasOwnProperty.call(editorConfiguration.toolbar, customItemKey)) {
                        toolbarHtmlElement.append(editorConfiguration.toolbar[customItemKey]);
                    }
                }
            }

            // Delegate click events for font style and color selection
            toolbarHtmlElement.on('click', "a[data-wysihtml5-command='formatBlock']", (evt) => {
                const clickedBtn = jQ(evt.target || evt.srcElement);
                selfReference.toolbarElement.find('.current-font-selection').text(clickedBtn.html());
            });

            toolbarHtmlElement.on('click', "a[data-wysihtml5-command='foreColor']", (evt) => {
                const clickedBtn = jQ(evt.target || evt.srcElement);
                selfReference.toolbarElement.find('.current-color-selection').text(clickedBtn.html());
            });

            // Insert the generated toolbar just before the editor's host element
            hostElement.before(toolbarHtmlElement);

            return toolbarHtmlElement;
        }

        initHtmlViewToggle(toolbar) {
            const htmlToggleBtnSelector = "a[data-wysihtml5-action='change_view']";
            toolbar.find(htmlToggleBtnSelector).on('click', () => {
                // Toggle 'disabled' class on other buttons when HTML view is active/inactive
                toolbar.find('a.btn').not(htmlToggleBtnSelector).toggleClass('disabled');
            });
        }

        initImageModalHandler(toolbar) {
            const selfReference = this;
            const imageInsertionModal = toolbar.find('.bootstrap-wysihtml5-insert-image-modal');
            const urlInput = imageInsertionModal.find('.bootstrap-wysihtml5-insert-image-url');
            const insertActionBtn = imageInsertionModal.find('a.btn-primary.btn-confirm-insert');
            const initialUrlValue = urlInput.val();
            let currentSelectionBookmark = null; // Stored selection range

            // Basic URL validation function
            const validateUrl = (inputUrl) => {
                try {
                    new URL(inputUrl);
                    return true;
                } catch (e) {
                    return false;
                }
            };

            const performImageInsertion = () => {
                const imageUrl = urlInput.val();
                if (!validateUrl(imageUrl)) {
                    alert("Please provide a valid image URL (e.g., http://example.com/image.jpg).");
                    return; // Prevent insertion if URL is invalid
                }

                urlInput.val(initialUrlValue); // Reset input field to its initial value
                selfReference.wysiwygCoreInstance.currentView.element.focus(); // Re-focus editor
                if (currentSelectionBookmark) {
                    selfReference.wysiwygCoreInstance.composer.selection.setBookmark(currentSelectionBookmark);
                    currentSelectionBookmark = null; // Clear bookmark after use
                }
                selfReference.wysiwygCoreInstance.composer.commands.exec("insertImage", imageUrl);
                imageInsertionModal.modal('hide'); // Close modal after command execution
            };

            urlInput.on('keypress', (event) => {
                if (event.which === 13) { // Check for Enter key
                    performImageInsertion();
                }
            });

            insertActionBtn.on('click', performImageInsertion);

            imageInsertionModal.on('shown', () => { // Event for when the modal finishes showing
                urlInput.focus(); // Auto-focus the URL input
            });

            imageInsertionModal.on('hide', () => { // Event for when the modal finishes hiding
                selfReference.wysiwygCoreInstance.currentView.element.focus(); // Return focus to editor
            });

            toolbar.find('a[data-wysihtml5-command=insertImage]').on('click', function() {
                const isActive = jQ(this).hasClass("wysihtml5-command-active");

                if (!isActive) {
                    selfReference.wysiwygCoreInstance.currentView.element.focus(false); // Focus editor without scrolling
                    currentSelectionBookmark = selfReference.wysiwygCoreInstance.composer.selection.getBookmark(); // Save selection
                    imageInsertionModal.modal('show'); // Display modal
                    imageInsertionModal.on('click.dismiss.modal', '[data-dismiss="modal"]', (e) => {
                        e.stopPropagation(); // Prevent modal from closing on internal dismiss clicks
                    });
                    return false; // Prevent default button action
                } else {
                    return true; // Allow default action if command is already active
                }
            });
        }

        initLinkModalHandler(toolbar) {
            const selfReference = this;
            const linkInsertionModal = toolbar.find('.bootstrap-wysihtml5-insert-link-modal');
            const urlInput = linkInsertionModal.find('.bootstrap-wysihtml5-insert-link-url');
            const insertActionBtn = linkInsertionModal.find('a.btn-primary.btn-confirm-insert');
            const initialUrlValue = urlInput.val();
            let currentSelectionBookmark = null;

            // Basic URL validation function
            const validateUrl = (inputUrl) => {
                try {
                    new URL(inputUrl);
                    return true;
                } catch (e) {
                    return false;
                }
            };

            const performLinkInsertion = () => {
                const linkUrl = urlInput.val();
                if (!validateUrl(linkUrl)) {
                    alert("Please provide a valid URL (e.g., http://example.com).");
                    return;
                }

                urlInput.val(initialUrlValue);
                selfReference.wysiwygCoreInstance.currentView.element.focus();
                if (currentSelectionBookmark) {
                    selfReference.wysiwygCoreInstance.composer.selection.setBookmark(currentSelectionBookmark);
                    currentSelectionBookmark = null;
                }
                selfReference.wysiwygCoreInstance.composer.commands.exec("createLink", {
                    href: linkUrl,
                    target: "_blank", // Open links in new tab by default
                    rel: "nofollow" // Add nofollow attribute for SEO
                });
                linkInsertionModal.modal('hide');
            };
            // The 'pressedEnter' variable from the original code was unused and has been removed.

            urlInput.on('keypress', (event) => {
                if (event.which === 13) {
                    performLinkInsertion();
                }
            });

            insertActionBtn.on('click', performLinkInsertion);

            linkInsertionModal.on('shown', () => {
                urlInput.focus();
            });

            linkInsertionModal.on('hide', () => {
                selfReference.wysiwygCoreInstance.currentView.element.focus();
            });

            toolbar.find('a[data-wysihtml5-command=createLink]').on('click', function() {
                const isActive = jQ(this).hasClass("wysihtml5-command-active");

                if (!isActive) {
                    selfReference.wysiwygCoreInstance.currentView.element.focus(false);
                    currentSelectionBookmark = selfReference.wysiwygCoreInstance.composer.selection.getBookmark();
                    linkInsertionModal.appendTo('body').modal('show'); // Append to body to resolve potential z-index issues
                    linkInsertionModal.on('click.dismiss.modal', '[data-dismiss="modal"]', (e) => {
                        e.stopPropagation();
                    });
                    return false;
                } else {
                    return true;
                }
            });
        }
    }

    // Renamed 'methods' to 'pluginActions' for clarity
    const pluginActions = {
        // Resets the plugin's default options to their initial cached state
        resetDefaultConfiguration: function() {
            jQ.fn.richTextEditor.defaultOptions = jQ.extend(true, {}, jQ.fn.richTextEditor.cachedDefaults);
        },
        // Directly initializes the editor with provided options, bypassing default merge logic
        directInitialization: function(specificOptions) {
            return this.each(function () {
                const currentJqElement = jQ(this);
                // Store the editor instance on the element's data attribute
                currentJqElement.data('richTextEditorInstance', new EditorInstanceWrapper(currentJqElement, specificOptions));
            });
        },
        // Initializes the editor by shallow-merging user options with plugin defaults
        initShallowMerge: function (userOptions) {
            const mergedSettings = jQ.extend({}, jQ.fn.richTextEditor.defaultOptions, userOptions || {});
            return pluginActions.directInitialization.apply(this, [mergedSettings]);
        },
        // Initializes the editor by deep-merging user options with plugin defaults
        initDeepMerge: function(userOptions) {
            const mergedSettings = jQ.extend(true, {}, jQ.fn.richTextEditor.defaultOptions, userOptions || {});
            return pluginActions.directInitialization.apply(this, [mergedSettings]);
        },
        // The primary entry point for initialization, uses shallow merge by default
        init: function(userOptions) {
            return pluginActions.initShallowMerge.apply(this, [userOptions]);
        }
    };

    // Renamed jQuery plugin from 'wysihtml5' to 'richTextEditor'
    jQ.fn.richTextEditor = function ( actionName ) {
        if ( pluginActions[actionName] ) {
            // Call the specific action method, passing all arguments after the action name
            return pluginActions[actionName].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof actionName === 'object' || ! actionName ) {
            // If no action name or an options object is provided, perform default initialization
            return pluginActions.init.apply( this, arguments );
        } else {
            // Log an error for unknown action names
            jQ.error( `Method "${actionName}" does not exist on jQ.fn.richTextEditor.` );
        }
    };

    // Expose the core constructor for advanced programmatic access
    jQ.fn.richTextEditor.Constructor = EditorInstanceWrapper;

    // Renamed 'defaultOptions' to 'defaultPluginConfiguration'
    const defaultPluginConfiguration = jQ.fn.richTextEditor.defaultOptions = {
        "fontStyles": true, // Renamed feature key
        "colorPicker": false, // Renamed feature key
        "textEmphasis": true, // Renamed feature key
        "listOperations": true, // Renamed feature key
        "htmlSourceView": false, // Renamed feature key
        "insertLink": true, // Renamed feature key
        "insertImage": true, // Renamed feature key
        events: {}, // Custom event handlers for wysihtml5 core
        parserRules: {
            classes: {
                // Defined CSS classes for color styling in the editor
                "wysiwyg-color-silver": 1,
                "wysiwyg-color-gray": 1,
                "wysiwyg-color-white": 1,
                "wysiwyg-color-maroon": 1,
                "wysiwyg-color-red": 1,
                "wysiwyg-color-purple": 1,
                "wysiwyg-color-fuchsia": 1,
                "wysiwyg-color-green": 1,
                "wysiwyg-color-lime": 1,
                "wysiwyg-color-olive": 1,
                "wysiwyg-color-yellow": 1,
                "wysiwyg-color-navy": 1,
                "wysiwyg-color-blue": 1,
                "wysiwyg-color-teal": 1,
                "wysiwyg-color-aqua": 1,
                "wysiwyg-color-orange": 1
            },
            tags: {
                "b":  {},
                "i":  {},
                "br": {},
                "ol": {},
                "ul": {},
                "li": {},
                "h1": {},
                "h2": {},
                "h3": {},
                "blockquote": {},
                "u": 1,
                "img": {
                    "check_attributes": {
                        "width": "numbers",
                        "alt": "alt",
                        "src": "url",
                        "height": "numbers"
                    }
                },
                "a":  {
                    set_attributes: {
                        target: "_blank",
                        rel:    "nofollow"
                    },
                    check_attributes: {
                        href:   "url" // Crucial for XSS prevention
                    }
                },
                "span": 1,
                "div": 1
            }
        },
        // Dynamically set stylesheet path using the calculated base URL
        stylesheets: [styleResourceBaseUrl + "wysiwyg-color.css"],
        locale: "en", // Default language locale
        btnSize: "" // New option: allows setting a common size for toolbar buttons (e.g., 'sm', 'lg')
    };

    // Cache the initial default options for resetting later
    if (typeof jQ.fn.richTextEditor.cachedDefaults === 'undefined') {
        jQ.fn.richTextEditor.cachedDefaults = jQ.extend(true, {}, jQ.fn.richTextEditor.defaultOptions);
    }

    // Renamed 'locale' to 'editorLocalizationStrings'
    const editorLocalizationStrings = jQ.fn.richTextEditor.locale = {
        en: {
            fontStyles: { // Renamed key
                normal: "Normal Text", // Updated phrasing
                h1: "Heading 1",
                h2: "Heading 2",
                h3: "Heading 3"
            },
            emphasis: {
                bold: "Bold",
                italic: "Italic",
                underline: "Underline"
            },
            lists: {
                unordered: "Unordered List", // Updated phrasing
                ordered: "Ordered List", // Updated phrasing
                decreaseIndent: "Decrease Indent", // Updated phrasing
                increaseIndent: "Increase Indent" // Updated phrasing
            },
            link: {
                prompt: "Insert Hyperlink", // Updated phrasing
                insert: "Insert Link", // Updated phrasing
                cancel: "Cancel"
            },
            image: {
                prompt: "Insert Image", // Updated phrasing
                insert: "Insert Image", // Updated phrasing
                cancel: "Cancel"
            },
            html: {
                toggleSource: "Toggle HTML Source" // Updated phrasing
            },
            colors: { // Renamed key
                black: "Black",
                silver: "Silver",
                gray: "Grey", // Common alternative spelling
                maroon: "Maroon",
                red: "Red",
                purple: "Purple",
                green: "Green",
                olive: "Olive",
                navy: "Navy",
                blue: "Blue",
                orange: "Orange"
            }
        }
    };

}(window.jQuery, window.wysihtml5);