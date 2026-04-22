!function(jq, wysiwygCore) {
    "use strict"; // Enforces stricter parsing and error handling

    // This object contains functions that generate HTML markup for different UI components.
    // Each function takes localization data and configuration parameters to produce dynamic content.
    var componentRenderer = {
        "font-styles": function(localizationData, configParams) {
            // Determine button size based on provided configuration.
            // If configParams and configParams.size exist, prepend ' btn-' to the size value.
            var buttonSizeClass = (configParams && configParams.size) ? ' btn-' + configParams.size : '';

            // Construct the HTML string for the font styles dropdown.
            // This includes a dropdown toggle button and a list of font style options.
            var outputMarkup = "<li class='dropdown'>" +
              "<a class='btn btn-secondary btn" + buttonSizeClass + " dropdown-toggle' data-toggle='dropdown' href='#'>" +
              "<i class='icon-font'></i>&nbsp;<span class='active-font-display'>" + localizationData.font_styles.normal + "</span>&nbsp;<b class='caret'></b>" +
              "</a>" +
              "<ul class='dropdown-menu'>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='div' tabindex='-1'>" + localizationData.font_styles.normal + "</a></li>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h1' tabindex='-1'>" + localizationData.font_styles.h1 + "</a></li>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h2' tabindex='-1'>" + localizationData.font_styles.h2 + "</a></li>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h3' tabindex='-1'>" + localizationData.font_styles.h3 + "</a></li>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h4'>" + localizationData.font_styles.h4 + "</a></li>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h5'>" + localizationData.font_styles.h5 + "</a></li>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h6'>" + localizationData.font_styles.h6 + "</a></li>" +
              "</ul>" +
            "</li>";
            return outputMarkup;
        },

        "emphasis": function(localizationData, configParams) {
            var buttonSizeClass = (configParams && configParams.size) ? ' btn-' + configParams.size : '';
            // HTML for text emphasis buttons (bold, italic, underline)
            return "<li>" +
              "<div class='btn-group'>" +
                "<a class='btn btn-secondary btn" + buttonSizeClass + "' data-wysihtml5-command='bold' title='CTRL+B' tabindex='-1'>" + localizationData.emphasis.bold + "</a>" +
                "<a class='btn btn-secondary btn" + buttonSizeClass + "' data-wysihtml5-command='italic' title='CTRL+I' tabindex='-1'>" + localizationData.emphasis.italic + "</a>" +
                "<a class='btn btn-secondary btn" + buttonSizeClass + "' data-wysihtml5-command='underline' title='CTRL+U' tabindex='-1'>" + localizationData.emphasis.underline + "</a>" +
              "</div>" +
            "</li>";
        },

        "lists": function(localizationData, configParams) {
            var buttonSizeClass = (configParams && configParams.size) ? ' btn-' + configParams.size : '';
            // HTML for list and indentation buttons
            return "<li>" +
              "<div class='btn-group'>" +
                "<a class='btn btn-secondary btn" + buttonSizeClass + "' data-wysihtml5-command='insertUnorderedList' title='" + localizationData.lists.unordered + "' tabindex='-1'><i class='icon-list'></i></a>" +
                "<a class='btn btn-secondary btn" + buttonSizeClass + "' data-wysihtml5-command='insertOrderedList' title='" + localizationData.lists.ordered + "' tabindex='-1'><i class='icon-list-numbered'></i></a>" +
                "<a class='btn btn-secondary btn" + buttonSizeClass + "' data-wysihtml5-command='Outdent' title='" + localizationData.lists.outdent + "' tabindex='-1'><i class='icon-indent-right'></i></a>" +
                "<a class='btn btn-secondary btn" + buttonSizeClass + "' data-wysihtml5-command='Indent' title='" + localizationData.lists.indent + "' tabindex='-1'><i class='icon-indent-left'></i></a>" +
              "</div>" +
            "</li>";
        },

        "link": function(localizationData, configParams) {
            var buttonSizeClass = (configParams && configParams.size) ? ' btn-' + configParams.size : '';
            // HTML for link insertion modal and button
            var linkModalMarkup = "<div class='rte-modal-insert-link modal fade'>" +
                "<div class='modal-dialog'>" +
                  "<div class='modal-content'>" +
                    "<div class='modal-header'>" +
                      "<a class='close' data-dismiss='modal'>&times;</a>" +
                      "<h3 class='modal-title'>" + localizationData.link.insert + "</h3>" +
                    "</div>" +
                    "<div class='modal-body'>" +
                      "<input value='http://' class='rte-link-url-input form-control' type='url'>" + // Added type="url" for semantic correctness
                      "<label class='checkbox'> <input type='checkbox' class='rte-link-target-checkbox' checked>" + localizationData.link.target + "</label>" +
                    "</div>" +
                    "<div class='modal-footer'>" +
                      "<a href='#' class='btn btn-secondary' data-dismiss='modal'>" + localizationData.link.cancel + "</a>" +
                      "<a href='#' class='btn btn-primary' data-dismiss='modal'>" + localizationData.link.insert + "</a>" +
                    "</div>" +
                  "</div>" +
                "</div>" +
              "</div>";

            var linkButtonMarkup = "<a class='btn btn-secondary" + buttonSizeClass + "' data-wysihtml5-command='createLink' title='" + localizationData.link.insert + "' tabindex='-1'><i class='icon-share'></i></a>";

            return "<li>" + linkModalMarkup + linkButtonMarkup + "</li>";
        },

        "image": function(localizationData, configParams) {
            var buttonSizeClass = (configParams && configParams.size) ? ' btn-' + configParams.size : '';
            // HTML for image insertion modal and button
            var imageModalMarkup = "<div class='rte-modal-insert-image modal fade'>" +
                "<div class='modal-dialog'>" +
                  "<div class='modal-content'>" +
                    "<div class='modal-header'>" +
                      "<a class='close' data-dismiss='modal'>&times;</a>" +
                      "<h3 class='modal-title'>" + localizationData.image.insert + "</h3>" +
                    "</div>" +
                    "<div class='modal-body'>" +
                      "<input value='http://' class='rte-image-url-input form-control' type='url'>" + // Added type="url"
                    "</div>" +
                    "<div class='modal-footer'>" +
                      "<a href='#' class='btn btn-secondary' data-dismiss='modal'>" + localizationData.image.cancel + "</a>" +
                      "<a href='#' class='btn btn-primary' data-dismiss='modal'>" + localizationData.image.insert + "</a>" +
                    "</div>"
                  + "</div>" +
                "</div>" +
              "</div>";

            var imageButtonMarkup = "<a class='btn btn-secondary btn" + buttonSizeClass + "' data-wysihtml5-command='insertImage' title='" + localizationData.image.insert + "' tabindex='-1'><i class='icon-picture'></i></a>";

            return "<li>" + imageModalMarkup + imageButtonMarkup + "</li>";
        },

        "html": function(localizationData, configParams) {
            var buttonSizeClass = (configParams && configParams.size) ? ' btn-' + configParams.size : '';
            // HTML for raw HTML view toggle button
            return "<li>" +
              "<div class='btn-group'>" +
                "<a class='btn btn-secondary btn" + buttonSizeClass + "' data-wysihtml5-action='change_view' title='" + localizationData.html.edit + "' tabindex='-1'><i class='icon-code'></i></a>" + // Changed icon
              "</div>" +
            "</li>";
        },

        "color": function(localizationData, configParams) {
            var buttonSizeClass = (configParams && configParams.size) ? ' btn-' + configParams.size : '';
            // HTML for color selection dropdown
            return "<li class='dropdown'>" +
              "<a class='btn btn-secondary dropdown-toggle" + buttonSizeClass + "' data-toggle='dropdown' href='#' tabindex='-1'>" +
                "<span class='active-color-display'>" + localizationData.colours.black + "</span>&nbsp;<b class='caret'></b>" +
              "</a>" +
              "<ul class='dropdown-menu'>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='black'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='black'>" + localizationData.colours.black + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='silver'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='silver'>" + localizationData.colours.silver + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='gray'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='gray'>" + localizationData.colours.gray + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='maroon'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='maroon'>" + localizationData.colours.maroon + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='red'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='red'>" + localizationData.colours.red + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='purple'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='purple'>" + localizationData.colours.purple + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='green'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='green'>" + localizationData.colours.green + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='olive'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='olive'>" + localizationData.colours.olive + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='navy'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='navy'>" + localizationData.colours.navy + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='blue'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='blue'>" + localizationData.colours.blue + "</a></li>" +
                "<li><div class='rte-color-swatch' data-wysihtml5-command-value='orange'></div><a class='rte-color-option' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='orange'>" + localizationData.colours.orange + "</a></li>" +
              "</ul>" +
            "</li>";
        }
    };

    // Helper function to retrieve markup for a specific component.
    var getComponentMarkup = function(componentKey, localizationData, configParams) {
        if (!componentRenderer[componentKey]) {
            console.warn("Component renderer for key '" + componentKey + "' not found.");
            return ""; // Return empty string for unknown components
        }
        return componentRenderer[componentKey](localizationData, configParams);
    };

    // Main Rich Text Editor module constructor.
    var EditorModule = function(targetElement, initializationOptions) {
        // Store the target DOM element for the editor.
        this.targetEl = targetElement;
        
        // Use provided options or fall back to default settings.
        var effectiveOptions = initializationOptions || baseConfiguration;

        // Merge any custom templates into our renderer.
        if (effectiveOptions.customTemplates) {
            for (var templateName in effectiveOptions.customTemplates) {
                if (effectiveOptions.customTemplates.hasOwnProperty(templateName)) {
                    componentRenderer[templateName] = effectiveOptions.customTemplates[templateName];
                }
            }
        }

        // Initialize the toolbar and the core Wysiwyg editor instance.
        this.editorToolbar = this.buildToolbar(targetElement, effectiveOptions);
        this.wysiwygInstance = this.initializeWysiwygEditor(effectiveOptions);

        // Expose the editor instance globally for debugging purposes (optional, can be removed).
        window.activeWysiwygEditor = this.wysiwygInstance;

        // Attach a global focus event to dismiss dropdowns when the editor gains focus.
        jq('iframe.wysihtml5-sandbox').each(function(idx, iframeEl) {
            jq(iframeEl.contentWindow).off('focus.rte').on({
                'focus.rte' : function() {
                    jq('li.dropdown').removeClass('open');
                }
            });
        });
    };

    // Prototype methods for the Rich Text Editor module.
    EditorModule.prototype = {

        constructor: EditorModule,

        // Initializes the core wysiwyg editor.
        initializeWysiwygEditor: function(editorOptions) {
            // Create a deep clone of options to avoid modifying shared objects,
            // especially important for nested configurations like `parserRules`.
            var clonedOptions = jq.extend(true, {}, editorOptions);
            
            // Assign the generated toolbar element to the editor options.
            clonedOptions.toolbar = this.editorToolbar[0];

            // Create a new instance of the core wysihtml5 editor.
            var editorCore = new wysiwygCore.Editor(this.targetEl[0], clonedOptions);

            // Attach any custom event handlers specified in the options.
            if (clonedOptions && clonedOptions.events) {
                for (var eventName in clonedOptions.events) {
                    if (clonedOptions.events.hasOwnProperty(eventName)) {
                        editorCore.on(eventName, clonedOptions.events[eventName]);
                    }
                }
            }
            return editorCore;
        },

        // Constructs the editor's toolbar based on configuration.
        buildToolbar: function(targetElement, editorConfig) {
            var moduleRef = this; // Reference to the current EditorModule instance.
            var toolbarContainer = jq("<ul/>", {
                'class' : "rte-editor-toolbar",
                'style': "display:none" // Hidden by default, will be shown by wysihtml5
            });

            // Determine the locale for displaying localized text.
            var currentLocale = editorConfig.locale || baseConfiguration.locale || "en";
            var localeData = localizationResources[currentLocale];

            // Iterate through default options to decide which toolbar components to include.
            for (var optionKey in baseConfiguration) {
                if (!baseConfiguration.hasOwnProperty(optionKey)) continue;

                var shouldIncludeComponent = false;

                // Check if this option is explicitly defined in the editorConfig.
                if (editorConfig[optionKey] !== undefined) {
                    shouldIncludeComponent = (editorConfig[optionKey] === true);
                } else {
                    // Otherwise, use the default setting.
                    shouldIncludeComponent = baseConfiguration[optionKey];
                }

                if (shouldIncludeComponent === true) {
                    // Append the generated markup for the component.
                    toolbarContainer.append(getComponentMarkup(optionKey, localeData, editorConfig));

                    // Initialize specific handlers for certain components.
                    switch (optionKey) {
                        case "html":
                            moduleRef.setupHtmlToggle(toolbarContainer);
                            break;
                        case "link":
                            moduleRef.setupLinkInsertion(toolbarContainer);
                            break;
                        case "image":
                            moduleRef.setupImageInsertion(toolbarContainer);
                            break;
                    }
                }
            }

            // Append any custom toolbar elements provided in the configuration.
            if (editorConfig.toolbar) {
                for (var customKey in editorConfig.toolbar) {
                    if (editorConfig.toolbar.hasOwnProperty(customKey)) {
                        toolbarContainer.append(editorConfig.toolbar[customKey]);
                    }
                }
            }

            // Attach click handlers for font style selection to update the displayed font name.
            toolbarContainer.find("a[data-wysihtml5-command='formatBlock']").on('click', function(event) {
                var clickedElement = jq(event.target || event.srcElement);
                moduleRef.editorToolbar.find('.active-font-display').text(clickedElement.html());
            });

            // Attach click handlers for color selection to update the displayed color name.
            toolbarContainer.find("a[data-wysihtml5-command='foreColor']").on('click', function(event) {
                var clickedElement = jq(event.target || event.srcElement);
                moduleRef.editorToolbar.find('.active-color-display').text(clickedElement.html());
            });

            // Insert the constructed toolbar before the target editor element.
            targetElement.before(toolbarContainer);

            return toolbarContainer;
        },

        // Sets up the HTML view toggle functionality.
        setupHtmlToggle: function(toolbar) {
            var toggleSelector = "a[data-wysihtml5-action='change_view']";
            toolbar.find(toggleSelector).on('click', function(event) {
                // Toggle the disabled state for all other buttons when HTML view is active.
                toolbar.find('a.btn').not(toggleSelector).toggleClass('disabled');
            });
        },

        // Configures the image insertion modal and its related events.
        setupImageInsertion: function(toolbar) {
            var moduleRef = this;
            var imageModal = toolbar.find('.rte-modal-insert-image');
            var urlInput = imageModal.find('.rte-image-url-input');
            var confirmButton = imageModal.find('a.btn-primary');
            var defaultUrlValue = urlInput.val(); // Store initial value for resetting.
            var currentSelectionBookmark; // To restore caret position after modal interaction.

            // Function to perform the image insertion.
            var executeImageInsert = function() {
                var imageUrl = urlInput.val();
                urlInput.val(defaultUrlValue); // Reset input field.
                moduleRef.wysiwygInstance.currentView.element.focus(); // Re-focus editor.
                if (currentSelectionBookmark) {
                  moduleRef.wysiwygInstance.composer.selection.setBookmark(currentSelectionBookmark);
                  currentSelectionBookmark = null; // Clear bookmark after use.
                }
                moduleRef.wysiwygInstance.composer.commands.exec("insertImage", imageUrl);
            };

            // Handle Enter key press in the URL input field.
            urlInput.on('keypress', function(event) {
                if (event.which === 13) { // Key code for Enter
                    executeImageInsert();
                    imageModal.modal('hide');
                }
            });

            // Handle click on the insert button.
            confirmButton.on('click', executeImageInsert);

            // Focus the URL input when the modal is shown.
            imageModal.on('shown.bs.modal', function() { // Using Bootstrap 3/4 event name
                urlInput.focus();
            });

            // Re-focus the editor when the modal is hidden.
            imageModal.on('hidden.bs.modal', function() { // Using Bootstrap 3/4 event name
                moduleRef.wysiwygInstance.currentView.element.focus();
            });

            // Handle click on the main 'insert image' toolbar button.
            toolbar.find('a[data-wysihtml5-command=insertImage]').on('click', function() {
                var isActive = jq(this).hasClass("wysihtml5-command-active");

                if (!isActive) {
                    moduleRef.wysiwygInstance.currentView.element.focus(false); // Focus without scrolling.
                    currentSelectionBookmark = moduleRef.wysiwygInstance.composer.selection.getBookmark(); // Save caret position.
                    imageModal.appendTo('body').modal('show'); // Show modal, append to body to avoid z-index issues.
                    // Prevent modal dismissal from propagating to editor commands.
                    imageModal.on('click.dismiss.modal', '[data-dismiss="modal"]', function(event) {
                        event.stopPropagation();
                    });
                    return false; // Prevent default action for active button.
                }
                // If the button is already active, allow default behavior (e.g., remove image).
                return true;
            });
        },

        // Configures the link insertion modal and its related events.
        setupLinkInsertion: function(toolbar) {
            var moduleRef = this;
            var linkModal = toolbar.find('.rte-modal-insert-link');
            var urlInput = linkModal.find('.rte-link-url-input');
            var targetCheckbox = linkModal.find('.rte-link-target-checkbox');
            var confirmButton = linkModal.find('a.btn-primary');
            var defaultUrlValue = urlInput.val();
            var currentSelectionBookmark;

            // Function to perform the link insertion.
            var executeLinkInsert = function() {
                var linkUrl = urlInput.val();
                urlInput.val(defaultUrlValue); // Reset input.
                moduleRef.wysiwygInstance.currentView.element.focus();
                if (currentSelectionBookmark) {
                  moduleRef.wysiwygInstance.composer.selection.setBookmark(currentSelectionBookmark);
                  currentSelectionBookmark = null;
                }

                var openInNewWindow = targetCheckbox.prop("checked");
                moduleRef.wysiwygInstance.composer.commands.exec("createLink", {
                    'href' : linkUrl,
                    'target' : (openInNewWindow ? '_blank' : '_self'),
                    'rel' : (openInNewWindow ? 'nofollow' : '') // Add nofollow for new windows for SEO/security.
                });
            };

            // Handle Enter key press in the URL input.
            urlInput.on('keypress', function(event) {
                if (event.which === 13) {
                    executeLinkInsert();
                    linkModal.modal('hide');
                }
            });

            // Handle click on the insert button.
            confirmButton.on('click', executeLinkInsert);

            // Focus the URL input when modal is shown.
            linkModal.on('shown.bs.modal', function() {
                urlInput.focus();
            });

            // Re-focus editor when modal is hidden.
            linkModal.on('hidden.bs.modal', function() {
                moduleRef.wysiwygInstance.currentView.element.focus();
            });

            // Handle click on the main 'create link' toolbar button.
            toolbar.find('a[data-wysihtml5-command=createLink]').on('click', function() {
                var isActive = jq(this).hasClass("wysihtml5-command-active");

                if (!isActive) {
                    moduleRef.wysiwygInstance.currentView.element.focus(false);
                    currentSelectionBookmark = moduleRef.wysiwygInstance.composer.selection.getBookmark();
                    linkModal.appendTo('body').modal('show');
                    linkModal.on('click.dismiss.modal', '[data-dismiss="modal"]', function(event) {
                        event.stopPropagation();
                    });
                    return false;
                }
                return true;
            });
        }
    };

    // Define public methods for the jQuery plugin.
    var pluginActions = {
        // Resets plugin default options to their initial cached state.
        restoreDefaults: function() {
            jq.fn.wysihtml5.baseConfiguration = jq.extend(true, {}, jq.fn.wysihtml5.cachedDefaultOptions);
        },
        // Bypasses default options and directly applies provided options.
        // Used internally by other methods.
        applyCustomOptions: function(customOpts) {
            // Iterate over selected elements and initialize EditorModule for each.
            return this.each(function () {
                var currentElement = jq(this);
                currentElement.data('wysihtml5', new EditorModule(currentElement, customOpts));
            });
        },
        // Merges provided options with default options (shallow merge).
        configureShallow: function (runtimeOptions) {
            var mergedSettings = jq.extend({}, jq.fn.wysihtml5.baseConfiguration, runtimeOptions || {}, jq(this).data());
            var currentContext = this;
            return pluginActions.applyCustomOptions.apply(currentContext, [mergedSettings]);
        },
        // Merges provided options with default options (deep merge).
        configureDeep: function(runtimeOptions) {
            var mergedSettings = jq.extend(true, {}, jq.fn.wysihtml5.baseConfiguration, runtimeOptions || {});
            var currentContext = this;
            return pluginActions.applyCustomOptions.apply(currentContext, [mergedSettings]);
        },
        // Default initialization method.
        initialize: function(initOptions) {
            var currentContext = this;
            return pluginActions.configureShallow.apply(currentContext, [initOptions]);
        }
    };

    // jQuery plugin definition.
    jq.fn.wysihtml5 = function ( actionOrOptions ) {
        // Check if the first argument is a string (method name).
        if ( typeof actionOrOptions === 'string' && pluginActions[actionOrOptions] ) {
            // Call the method with remaining arguments.
            return pluginActions[actionOrOptions].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof actionOrOptions === 'object' || ! actionOrOptions ) {
            // If it's an object or no argument, treat as initialization.
            return pluginActions.initialize.apply( this, arguments );
        } else {
            // Handle unknown method calls.
            jq.error( 'Action "' +  actionOrOptions + '" is not recognized by jQuery.wysihtml5' );
        }    
    };

    // Expose the EditorModule constructor for direct access if needed.
    jq.fn.wysihtml5.EditorConstructor = EditorModule;

    // Define the base configuration for the editor.
    var baseConfiguration = jq.fn.wysihtml5.baseConfiguration = {
        "font-styles": true,
        "color": false,
        "emphasis": true,
        "lists": true,
        "html": false,
        "link": true,
        "image": true,
        events: {}, // Custom event handlers for the editor.
        parserRules: {
            classes: {
                // List of allowed CSS classes for content styling.
                "wysiwyg-color-silver" : 1,
                "wysiwyg-color-gray" : 1,
                "wysiwyg-color-white" : 1,
                "wysiwyg-color-maroon" : 1,
                "wysiwyg-color-red" : 1,
                "wysiwyg-color-purple" : 1,
                "wysiwyg-color-fuchsia" : 1,
                "wysiwyg-color-green" : 1,
                "wysiwyg-color-lime" : 1,
                "wysiwyg-color-olive" : 1,
                "wysiwyg-color-yellow" : 1,
                "wysiwyg-color-navy" : 1,
                "wysiwyg-color-blue" : 1,
                "wysiwyg-color-teal" : 1,
                "wysiwyg-color-aqua" : 1,
                "wysiwyg-color-orange" : 1
            },
            tags: {
                // List of allowed HTML tags and their attributes.
                "b":  {},
                "i":  {},
                "br": {},
                "ol": {},
                "ul": {},
                "li": {},
                "h1": {},
                "h2": {},
                "h3": {},
                "h4": {},
                "h5": {},
                "h6": {},
                "blockquote": {},
                "u": 1, // 'u' tag is allowed.
                "img": {
                    "check_attributes": {
                        "width": "numbers",
                        "alt": "alt",
                        "src": "url",
                        "height": "numbers"
                    }
                },
                "a":  {
                    check_attributes: {
                        'href': "url", // Crucial for security, validates URL format.
                        'target': 'alt',
                        'rel': 'alt'
                    }
                },
                "span": 1,
                "div": 1,
                // Allowing code and pre tags for code snippets.
                "code": 1,
                "pre": 1
            }
        },
        stylesheets: ["/assets/css/rte-color-styles.css"], // Path to editor-specific stylesheets.
        locale: "en" // Default language setting.
    };

    // Cache the initial default options to allow resetting them later.
    if (typeof jq.fn.wysihtml5.cachedDefaultOptions === 'undefined') {
        jq.fn.wysihtml5.cachedDefaultOptions = jq.extend(true, {}, jq.fn.wysihtml5.baseConfiguration);
    }

    // Define localization resources for different languages.
    var localizationResources = jq.fn.wysihtml5.locale = {
        en: {
            font_styles: {
                normal: "Normal Text",
                h1: "Heading Level 1",
                h2: "Heading Level 2",
                h3: "Heading Level 3",
                h4: "Heading Level 4",
                h5: "Heading Level 5",
                h6: "Heading Level 6"
            },
            emphasis: {
                bold: "Bold",
                italic: "Italic",
                underline: "Underline"
            },
            lists: {
                unordered: "Unordered List",
                ordered: "Ordered List",
                outdent: "Decrease Indent",
                indent: "Increase Indent"
            },
            link: {
                insert: "Insert Link",
                cancel: "Cancel",
                target: "Open link in a new window/tab"
            },
            image: {
                insert: "Insert Image",
                cancel: "Cancel"
            },
            html: {
                edit: "View HTML"
            },
            colours: { // Changed to 'colours' from 'color' for British English feel or just variation
                black: "Black",
                silver: "Silver",
                gray: "Gray",
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
        // Additional locales could be added here.
    };

}(jQuery, wysihtml5); // Pass jQuery and wysihtml5 core as arguments to the IIFE.