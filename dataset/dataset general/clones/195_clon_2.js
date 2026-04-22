!function(jq, htmlEditor) {
  /* Enforce strict parsing rules for better code quality */
  "use strict";

  // Determine the base path for CSS stylesheets used by the editor
  var stylePath = (globalWindow.documentLocation.fullURL)
    .slice(0, (globalWindow.documentLocation.fullURL)
    .indexOf("management")) + "Management/styles/";

  // Object containing various HTML template functions for editor UI components
  var templateCollection = {
    "font-styles": function(localSettings, configParams) {
      // Calculate button size class based on configuration
      var btnSize = (configParams && configParams.size) ? ' button-size-' + configParams.size : '';
      return "<li class='menu-dropdown'>" +
        "<a class='button menu-toggle" + btnSize + "' data-toggle='dropdown' href='#'>" +
        "<i class='icon-font'></i>&nbsp;<span class='current-typeface'>" + localSettings.textStyles.regular + "</span>&nbsp;<b class='caret'></b>" +
        "</a>" +
        "<ul class='dropdown-menu'>" +
        "<li><a data-editor-action='formatBlock' data-editor-value='div'>" + localSettings.textStyles.regular + "</a></li>" +
        "<li><a data-editor-action='formatBlock' data-editor-value='h1'>" + localSettings.textStyles.headingOne + "</a></li>" +
        "<li><a data-editor-action='formatBlock' data-editor-value='h2'>" + localSettings.textStyles.headingTwo + "</a></li>" +
        "<li><a data-editor-action='formatBlock' data-editor-value='h3'>" + localSettings.textStyles.headingThree + "</a></li>" +
        "</ul>" +
        "</li>";
    },

    "emphasis": function(localSettings, configParams) {
      // Determine button size for emphasis controls
      var btnSize = (configParams && configParams.size) ? ' button-size-' + configParams.size : '';
      return "<li>" +
        "<div class='button-group'>" +
        "<a class='button" + btnSize + "' data-editor-action='bold' title='CTRL+B'>" + localSettings.highlighting.strong + "</a>" +
        "<a class='button" + btnSize + "' data-editor-action='italic' title='CTRL+I'>" + localSettings.highlighting.italicized + "</a>" +
        "<a class='button" + btnSize + "' data-editor-action='underline' title='CTRL+U'>" + localSettings.highlighting.underlined + "</a>" +
        "</div>" +
        "</li>";
    },

    "lists": function(localSettings, configParams) {
      // Button size for list controls
      var btnSize = (configParams && configParams.size) ? ' button-size-' + configParams.size : '';
      return "<li>" +
        "<div class='button-group'>" +
        "<a class='button" + btnSize + "' data-editor-action='insertUnorderedList' title='" + localSettings.listItems.bullet + "'><i class='icon-list'></i></a>" +
        "<a class='button" + btnSize + "' data-editor-action='insertOrderedList' title='" + localSettings.listItems.numbered + "'><i class='icon-th-list'></i></a>" +
        "<a class='button" + btnSize + "' data-editor-action='Outdent' title='" + localSettings.listItems.decreaseIndent + "'><i class='icon-indent-right'></i></a>" +
        "<a class='button" + btnSize + "' data-editor-action='Indent' title='" + localSettings.listItems.increaseIndent + "'><i class='icon-indent-left'></i></a>" +
        "</div>" +
        "</li>";
    },

    "link": function(localSettings, configParams) {
      // Button size for link insertion
      var btnSize = (configParams && configParams.size) ? ' button-size-' + configParams.size : '';
      return "<li>" +
        "<div class='richTextEditor-add-hyperlink-modal dialog hidden animated'>" +
        "<div class='dialog-head'>" +
        "<a class='close-button' data-close='dialog'>&times;</a>" +
        "<h3>" + localSettings.hyperlink.add + "</h3>" +
        "</div>" +
        "<div class='dialog-body'>" +
        "<input value='http://' class='richTextEditor-add-hyperlink-url input-large-field'>" +
        "</div>" +
        "<div class='dialog-foot'>" +
        "<a href='#' class='button' data-close='dialog'>" + localSettings.hyperlink.dismiss + "</a>" +
        "<a href='#' class='button button-primary' data-close='dialog'>" + localSettings.hyperlink.add + "</a>" +
        "</div>" +
        "</div>" +
        "<a class='button" + btnSize + "' data-editor-action='createHyperlink' title='" + localSettings.hyperlink.add + "'><i class='icon-link-out'></i></a>" +
        "</li>";
    },

    "image": function(localSettings, configParams) {
      // Button size for image insertion
      var btnSize = (configParams && configParams.size) ? ' button-size-' + configParams.size : '';
      return "<li>" +
        "<div class='richTextEditor-add-picture-dialog dialog hidden animated'>" +
        "<div class='dialog-head'>" +
        "<a class='close-button' data-close='dialog'>&times;</a>" +
        "<h3>" + localSettings.picture.add + "</h3>" +
        "</div>" +
        "<div class='dialog-body'>" +
        "<input value='http://' class='richTextEditor-add-picture-url input-large-field'>" +
        "</div>" +
        "<div class='dialog-foot'>" +
        "<a href='#' class='button' data-close='dialog'>" + localSettings.picture.dismiss + "</a>" +
        "<a href='#' class='button button-primary' data-close='dialog'>" + localSettings.picture.add + "</a>" +
        "</div>" +
        "</div>" +
        "<a class='button" + btnSize + "' data-editor-action='insertPicture' title='" + localSettings.picture.add + "'><i class='icon-photo'></i></a>" +
        "</li>";
    },

    "html": function(localSettings, configParams) {
      // Button size for HTML view toggle
      var btnSize = (configParams && configParams.size) ? ' button-size-' + configParams.size : '';
      return "<li>" +
        "<div class='button-group'>" +
        "<a class='button" + btnSize + "' data-editor-action='toggle_view' title='" + localSettings.markup.modify + "'><i class='icon-edit-text'></i></a>" +
        "</div>" +
        "</li>";
    },

    "color": function(localSettings, configParams) {
      // Button size for color picker
      var btnSize = (configParams && configParams.size) ? ' button-size-' + configParams.size : '';
      return "<li class='menu-dropdown'>" +
        "<a class='button menu-toggle" + btnSize + "' data-toggle='dropdown' href='#'>" +
        "<span class='active-color'>" + localSettings.colors.jetBlack + "</span>&nbsp;<b class='caret'></b>" +
        "</a>" +
        "<ul class='dropdown-menu'>" +
        "<li><div class='editor-color-swatch' data-editor-value='black'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='black'>" + localSettings.colors.jetBlack + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='silver'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='silver'>" + localSettings.colors.lightGray + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='gray'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='gray'>" + localSettings.colors.mediumGray + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='maroon'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='maroon'>" + localSettings.colors.darkRed + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='red'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='red'>" + localSettings.colors.brightRed + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='purple'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='purple'>" + localSettings.colors.deepPurple + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='green'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='green'>" + localSettings.colors.darkGreen + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='olive'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='olive'>" + localSettings.colors.oliveGreen + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='navy'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='navy'>" + localSettings.colors.darkBlue + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='blue'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='blue'>" + localSettings.colors.skyBlue + "</a></li>" +
        "<li><div class='editor-color-swatch' data-editor-value='orange'></div><a class='editor-color-label' data-editor-action='applyColor' data-editor-value='orange'>" + localSettings.colors.vibrantOrange + "</a></li>" +
        "</ul>" +
        "</li>";
    }
  };

  // Function to retrieve a specific template by its key
  var renderTemplates = function(templateKey, localSettings, configParams) {
    return templateCollection[templateKey](localSettings, configParams);
  };


  // Main RichTextEditor constructor
  var RichTextEditor = function(elementRef, initOptions) {
    this.elementRef = elementRef; // The DOM element where the editor is initialized
    var toolbarOptions = initOptions || defaultSettings; // Merge user options with defaults

    // Extend internal template collection with any custom layouts provided
    for (var currentLayout in toolbarOptions.customLayouts) {
      templateCollection[currentLayout] = toolbarOptions.customLayouts[currentLayout];
    }

    this.toolbarInstance = this.buildToolbar(elementRef, toolbarOptions); // Create the editor toolbar
    this.editorInstance = this.buildEditor(initOptions); // Initialize the core editor

    globalWindow.activeEditor = this.editorInstance; // Make editor instance globally accessible

    // Attach focus event to editor iframes to close dropdowns
    jq('iframe.rich-text-sandbox').each(function(idx, frameElement) {
      jq(frameElement.contentWindow).off('focus.richText').on({
        'focus.richText': function() {
          jq('li.menu-dropdown').removeClass('open');
        }
      });
    });
  };

  // Prototype methods for the RichTextEditor
  RichTextEditor.prototype = {

    constructor: RichTextEditor, // Explicitly set constructor reference

    // Creates and configures the core wysihtml5 editor instance
    buildEditor: function(editorOptions) {
      editorOptions = editorOptions || {};
      editorOptions.toolbarElement = this.toolbarInstance[0]; // Link toolbar to editor options

      var currentEditor = new htmlEditor.Core(this.elementRef[0], editorOptions); // Instantiate core editor

      // Attach any custom event handlers specified in options
      if (editorOptions && editorOptions.eventHandlers) {
        for (var handlerName in editorOptions.eventHandlers) {
          currentEditor.on(handlerName, editorOptions.eventHandlers[handlerName]);
        }
      }
      return currentEditor; // Return the initialized editor instance
    },

    // Builds the editor toolbar based on configuration
    buildToolbar: function(mainElement, toolbarConfig) {
      var instanceRef = this; // Reference to the current editor instance
      var toolbarContainer = jq("<ul/>", {
        'class': "rich-text-toolbar",
        'style': "display:none"
      });
      var languageCode = toolbarConfig.locale || defaultSettings.locale || "en"; // Get language setting

      // Iterate through default settings to build toolbar buttons
      for (var settingKey in defaultSettings) {
        var isActive = false; // Flag to check if a feature is enabled

        // Check if the feature is explicitly enabled in user config
        if (toolbarConfig[settingKey] !== undefined) {
          if (toolbarConfig[settingKey] === true) {
            isActive = true;
          }
        } else {
          isActive = defaultSettings[settingKey]; // Use default if not specified
        }

        if (isActive === true) {
          // Append the rendered template for the feature
          toolbarContainer.append(renderTemplates(settingKey, languagePack[languageCode], toolbarConfig));

          // Initialize specific toolbar functionalities
          if (settingKey === "html") {
            this.initHtmlView(toolbarContainer);
          }

          if (settingKey === "link") {
            this.initHyperlinkInsertion(toolbarContainer);
          }

          if (settingKey === "image") {
            this.initPictureInsertion(toolbarContainer);
          }
        }
      }

      // Add any custom controls defined in the toolbar configuration
      if (toolbarConfig.customControls) {
        for (settingKey in toolbarConfig.customControls) {
          toolbarContainer.append(toolbarConfig.customControls[settingKey]);
        }
      }

      // Handle font style selection to update current display
      toolbarContainer.find("a[data-editor-action='formatBlock']").click(function(evt) {
        var eventTarget = evt.target || evt.srcElement;
        var clickedElement = jq(eventTarget);
        instanceRef.toolbarInstance.find('.current-typeface').text(clickedElement.html());
      });

      // Handle color selection to update current display
      toolbarContainer.find("a[data-editor-action='applyColor']").click(function(evt) {
        var eventTarget = evt.target || evt.srcElement;
        var clickedElement = jq(eventTarget);
        instanceRef.toolbarInstance.find('.active-color').text(clickedElement.html());
      });

      this.elementRef.before(toolbarContainer); // Insert toolbar before the editor element

      return toolbarContainer; // Return the constructed toolbar
    },

    // Initializes the HTML view toggle functionality
    initHtmlView: function(toolbarElement) {
      var toggleViewSelector = "a[data-editor-action='toggle_view']";
      toolbarElement.find(toggleViewSelector).click(function(evt) {
        // Toggle disabled state for other buttons when HTML view is active/inactive
        toolbarElement.find('a.button').not(toggleViewSelector).toggleClass('disabled');
      });
    },

    // Initializes image insertion dialog and logic
    initPictureInsertion: function(toolbarElement) {
      var instanceRef = this; // Reference to the editor instance
      var addImageDialog = toolbarElement.find('.richTextEditor-add-picture-dialog');
      var imageURLInput = addImageDialog.find('.richTextEditor-add-picture-url');
      var addPictureButton = addImageDialog.find('a.button-primary');
      var defaultURLValue = imageURLInput.val(); // Store initial URL input value
      var cursorPositionMarker; // To store cursor position before opening dialog

      // Function to execute image insertion command
      var performImageInsertion = function() {
        var pictureURL = imageURLInput.val();
        imageURLInput.val(defaultURLValue); // Reset input field
        instanceRef.editorInstance.currentView.element.focus(); // Restore focus to editor
        if (cursorPositionMarker) {
          instanceRef.editorInstance.composer.selection.setBookmark(cursorPositionMarker); // Restore cursor
          cursorPositionMarker = null;
        }
        instanceRef.editorInstance.composer.commands.exec("insertPicture", pictureURL); // Execute command
      };

      // Handle Enter key press in URL input to insert image
      imageURLInput.keypress(function(evt) {
        if (evt.which == 13) {
          performImageInsertion();
          addImageDialog.dialog('hide'); // Hide dialog
        }
      });

      // Handle click on insert button
      addPictureButton.click(performImageInsertion);

      // Focus on URL input when dialog is shown
      addImageDialog.on('shown', function() {
        imageURLInput.focus();
      });

      // Restore focus to editor when dialog is hidden
      addImageDialog.on('hide', function() {
        instanceRef.editorInstance.currentView.element.focus();
      });

      // Handle click on the 'insert image' toolbar button
      toolbarElement.find('a[data-editor-action=insertPicture]').click(function() {
        var isButtonActive = jq(this).hasClass("editor-action-active");

        if (!isButtonActive) {
          instanceRef.editorInstance.currentView.element.focus(false); // Blur editor temporarily
          cursorPositionMarker = instanceRef.editorInstance.composer.selection.getBookmark(); // Save cursor position
          addImageDialog.dialog('show'); // Show dialog
          // Prevent dialog from closing when clicking internal dismiss buttons
          addImageDialog.on('click.close.dialog', '[data-close="dialog"]', function(evt) {
            evt.stopPropagation();
          });
          return false; // Prevent default action
        } else {
          return true; // Allow default action if button is already active
        }
      });
    },

    // Initializes hyperlink insertion dialog and logic
    initHyperlinkInsertion: function(toolbarElement) {
      var instanceRef = this; // Reference to the editor instance
      var addLinkDialog = toolbarElement.find('.richTextEditor-add-hyperlink-modal');
      var linkURLInput = addLinkDialog.find('.richTextEditor-add-hyperlink-url');
      var addLinkButton = addLinkDialog.find('a.button-primary');
      var defaultURLValue = linkURLInput.val(); // Store initial URL input value
      var cursorPositionMarker; // To store cursor position before opening dialog

      // Function to execute hyperlink insertion command
      var performLinkInsertion = function() {
        var hyperlinkURL = linkURLInput.val();
        linkURLInput.val(defaultURLValue); // Reset input field
        instanceRef.editorInstance.currentView.element.focus(); // Restore focus to editor
        if (cursorPositionMarker) {
          instanceRef.editorInstance.composer.selection.setBookmark(cursorPositionMarker); // Restore cursor
          cursorPositionMarker = null;
        }
        instanceRef.editorInstance.composer.commands.exec("createHyperlink", {
          href: hyperlinkURL,
          target: "_blank",
          rel: "nofollow"
        });
      };

      // Handle Enter key press in URL input to insert link
      linkURLInput.keypress(function(evt) {
        if (evt.which == 13) {
          performLinkInsertion();
          addLinkDialog.dialog('hide'); // Hide dialog
        }
      });

      // Handle click on insert button
      addLinkButton.click(performLinkInsertion);

      // Focus on URL input when dialog is shown
      addLinkDialog.on('shown', function() {
        linkURLInput.focus();
      });

      // Restore focus to editor when dialog is hidden
      addLinkDialog.on('hide', function() {
        instanceRef.editorInstance.currentView.element.focus();
      });

      // Handle click on the 'create link' toolbar button
      toolbarElement.find('a[data-editor-action=createHyperlink]').click(function() {
        var isButtonActive = jq(this).hasClass("editor-action-active");

        if (!isButtonActive) {
          instanceRef.editorInstance.currentView.element.focus(false); // Blur editor temporarily
          cursorPositionMarker = instanceRef.editorInstance.composer.selection.getBookmark(); // Save cursor position
          addLinkDialog.appendTo('body').dialog('show'); // Show dialog, appended to body for proper z-index
          // Prevent dialog from closing when clicking internal dismiss buttons
          addLinkDialog.on('click.close.dialog', '[data-close="dialog"]', function(evt) {
            evt.stopPropagation();
          });
          return false; // Prevent default action
        } else {
          return true; // Allow default action if button is already active
        }
      });
    }
  };

  // Public API methods for the jQuery plugin
  var apiMethods = {
    // Resets plugin options to their initial defaults
    restoreDefaults: function() {
      jq.fn.richText.defaultSettings = jq.extend(true, {}, jq.fn.richText.defaultSettingsCache);
    },
    // Initializes the editor bypassing the default options merging
    ignoreDefaults: function(options) {
      return this.each(function() {
        var currentElement = jq(this);
        currentElement.data('richText', new RichTextEditor(currentElement, options));
      });
    },
    // Initializes the editor with a shallow merge of options
    mergeOptionsShallow: function(options) {
      var settings = jq.extend({}, jq.fn.richText.defaultSettings, options || {});
      var context = this;
      return apiMethods.ignoreDefaults.apply(context, [settings]);
    },
    // Initializes the editor with a deep merge of options
    mergeOptionsDeep: function(options) {
      var settings = jq.extend(true, {}, jq.fn.richText.defaultSettings, options || {});
      var context = this;
      return apiMethods.ignoreDefaults.apply(context, [settings]);
    },
    // Default initialization method
    initializeEditor: function(options) {
      var context = this;
      return apiMethods.mergeOptionsShallow.apply(context, [options]);
    }
  };

  // jQuery plugin definition for richText editor
  jq.fn.richText = function(operationName) {
    if (apiMethods[operationName]) {
      // Call a specific method if it exists
      return apiMethods[operationName].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof operationName === 'object' || !operationName) {
      // If no method name or an options object is passed, initialize the editor
      return apiMethods.initializeEditor.apply(this, arguments);
    } else {
      // Throw an error if the method does not exist
      jq.error('Operation ' + operationName + ' not found on jQuery.richText');
    }
  };

  // Expose the RichTextEditor constructor for direct access
  jq.fn.richText.Constructor = RichTextEditor;

  // Define the default configuration settings for the rich text editor
  var defaultSettings = jq.fn.richText.defaultSettings = {
    "font-styles": true, // Enable font styling controls
    "color": false, // Disable color picker by default
    "emphasis": true, // Enable bold, italic, underline controls
    "lists": true, // Enable list controls
    "html": false, // Disable HTML view by default
    "link": true, // Enable link insertion
    "image": true, // Enable image insertion
    eventHandlers: {}, // Custom event handlers for the editor
    parsingRules: {
      cssClasses: {
        // Defined CSS classes for color styling (path_to_plugin/css/editor-color.css)
        "rte-color-silver": 1,
        "rte-color-gray": 1,
        "rte-color-white": 1,
        "rte-color-maroon": 1,
        "rte-color-red": 1,
        "rte-color-purple": 1,
        "rte-color-fuchsia": 1,
        "rte-color-green": 1,
        "rte-color-lime": 1,
        "rte-color-olive": 1,
        "rte-color-yellow": 1,
        "rte-color-navy": 1,
        "rte-color-blue": 1,
        "rte-color-teal": 1,
        "rte-color-aqua": 1,
        "rte-color-orange": 1
      },
      htmlTags: {
        "b": {}, // Allow bold tag
        "i": {}, // Allow italic tag
        "br": {}, // Allow break tag
        "ol": {}, // Allow ordered list
        "ul": {}, // Allow unordered list
        "li": {}, // Allow list item
        "h1": {}, // Allow heading 1
        "h2": {}, // Allow heading 2
        "h3": {}, // Allow heading 3
        "blockquote": {}, // Allow blockquote
        "u": 1, // Allow underline
        "img": { // Allow image tag with specific attributes
          "validateAttributes": {
            "width": "numbers",
            "alt": "alt",
            "src": "url",
            "height": "numbers"
          }
        },
        "a": { // Allow anchor tag with specific attributes
          assignAttributes: {
            target: "_blank",
            rel: "nofollow"
          },
          validateAttributes: {
            href: "url" // Important for security to prevent XSS
          }
        },
        "span": 1, // Allow span tag
        "div": 1 // Allow div tag
      }
    },
    styleSheets: [stylePath + "editor-color.css"], // Default stylesheet for colors
    locale: "en" // Default language code
  };

  // Cache a deep copy of the default settings to allow reset functionality
  if (typeof jq.fn.richText.defaultSettingsCache === 'undefined') {
    jq.fn.richText.defaultSettingsCache = jq.extend(true, {}, jq.fn.richText.defaultSettings);
  }

  // Define language packs for different locales
  var languagePack = jq.fn.richText.languagePack = {
    en: {
      textStyles: {
        regular: "Normal text",
        headingOne: "Heading 1",
        headingTwo: "Heading 2",
        headingThree: "Heading 3"
      },
      highlighting: {
        strong: "Bold",
        italicized: "Italic",
        underlined: "Underline"
      },
      listItems: {
        bullet: "Unordered list",
        numbered: "Ordered list",
        decreaseIndent: "Outdent",
        increaseIndent: "Indent"
      },
      hyperlink: {
        add: "Insert link",
        dismiss: "Cancel"
      },
      picture: {
        add: "Insert image",
        dismiss: "Cancel"
      },
      markup: {
        modify: "Edit HTML"
      },
      colors: {
        jetBlack: "Black",
        lightGray: "Silver",
        mediumGray: "Grey",
        darkRed: "Maroon",
        brightRed: "Red",
        deepPurple: "Purple",
        darkGreen: "Green",
        oliveGreen: "Olive",
        darkBlue: "Navy",
        skyBlue: "Blue",
        vibrantOrange: "Orange"
      }
    }
  };

}(window.jQuery, window.htmlEditor);