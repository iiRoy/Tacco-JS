(function(jq, htmleditor) {
  // Use strict mode for cleaner code and error checking
  "use strict";

  // Collection of template functions for various editor components
  var componentGenerators = {

    "font-styles": function(languagePack, settings) {
      // Determine button size based on provided options
      var btnSize = (settings && settings.size) ? ' btn-' + settings.size : '';
      var fontMenuHtml = "<li class='drop-down-menu-item'>" +
        "<a class='btn btn-default btn" + btnSize + " dropdown-toggle' data-toggle='dropdown' href='#'>" +
        "<i class='glyphicon glyphicon-font'></i><span class='active-font-display'>" + languagePack.font_styles.normal + "</span><b class='caret'></b>" +
        "</a>" +
        "<ul class='dropdown-menu'>" +
        "<li><a data-htmleditor-command='formatBlock' data-htmleditor-command-value='div' tab-index='-1'>" + languagePack.font_styles.normal + "</a></li>" +
        "<li><a data-htmleditor-command='formatBlock' data-htmleditor-command-value='h1' tab-index='-1'>" + languagePack.font_styles.h1 + "</a></li>" +
        "<li><a data-htmleditor-command='formatBlock' data-htmleditor-command-value='h2' tab-index='-1'>" + languagePack.font_styles.h2 + "</a></li>" +
        "<li><a data-htmleditor-command='formatBlock' data-htmleditor-command-value='h3' tab-index='-1'>" + languagePack.font_styles.h3 + "</a></li>" +
        "<li><a data-htmleditor-command='formatBlock' data-htmleditor-command-value='h4'>" + languagePack.font_styles.h4 + "</a></li>" +
        "<li><a data-htmleditor-command='formatBlock' data-htmleditor-command-value='h5'>" + languagePack.font_styles.h5 + "</a></li>" +
        "<li><a data-htmleditor-command='formatBlock' data-htmleditor-command-value='h6'>" + languagePack.font_styles.h6 + "</a></li>" +
        "</ul>" +
        "</li>";
      return fontMenuHtml;
    },

    "emphasis": function(languagePack, settings) {
      // Calculate button sizing based on editor configuration
      var btnSize = (settings && settings.size) ? ' btn-' + settings.size : '';
      var emphasisHtml = "<li>" +
        "<div class='btn-group-container'>" +
        "<a class='btn btn-default btn" + btnSize + "' data-htmleditor-command='bold' title='CTRL+B' tab-index='-1'>" + languagePack.emphasis.bold + "</a>" +
        "<a class='btn btn-default btn" + btnSize + "' data-htmleditor-command='italic' title='CTRL+I' tab-index='-1'>" + languagePack.emphasis.italic + "</a>" +
        "<a class='btn btn-default btn" + btnSize + "' data-htmleditor-command='underline' title='CTRL+U' tab-index='-1'>" + languagePack.emphasis.underline + "</a>" +
        "</div>" +
        "</li>";
      return emphasisHtml;
    },

    "lists": function(languagePack, settings) {
      // Determine the button size from the options object
      var btnSize = (settings && settings.size) ? ' btn-' + settings.size : '';
      var listsHtml = "<li>" +
        "<div class='btn-group-container'>" +
        "<a class='btn btn-default btn" + btnSize + "' data-htmleditor-command='insertUnorderedList' title='" + languagePack.lists.unordered + "' tab-index='-1'><i class='glyphicon glyphicon-list'></i></a>" +
        "<a class='btn btn-default btn" + btnSize + "' data-htmleditor-command='insertOrderedList' title='" + languagePack.lists.ordered + "' tab-index='-1'><i class='glyphicon glyphicon-th-list'></i></a>" +
        "<a class='btn btn-default btn" + btnSize + "' data-htmleditor-command='Outdent' title='" + languagePack.lists.outdent + "' tab-index='-1'><i class='glyphicon glyphicon-indent-right'></i></a>" +
        "<a class='btn btn-default btn" + btnSize + "' data-htmleditor-command='Indent' title='" + languagePack.lists.indent + "' tab-index='-1'><i class='glyphicon glyphicon-indent-left'></i></a>" +
        "</div>" +
        "</li>";
      return listsHtml;
    },

    "link": function(languagePack, settings) {
      // Get the button size, if specified
      var btnSize = (settings && settings.size) ? ' btn-' + settings.size : '';
      var linkHtml = "<li>" +
        "<div class='bootstrap-htmleditor-insert-link-modal modal fade'>" +
        "<div class='modal-dialog-box'>" +
        "<div class='modal-content-area'>" +
        "<div class='modal-header-section'>" +
        "<a class='close-button' data-dismiss='modal'>&times;</a>" +
        "<h3 class='modal-title-text'>" + languagePack.link.insert + "</h3>" +
        "</div>" +
        "<div class='modal-body-content'>" +
        "<input value='http://' class='bootstrap-htmleditor-insert-link-url form-control-input'>" +
        "<label class='checkbox-control'> <input type='checkbox' class='bootstrap-htmleditor-insert-link-target' checked>" + languagePack.link.target + "</label>" +
        "</div>" +
        "<div class='modal-footer-section'>" +
        "<a href='#' class='btn btn-default' data-dismiss='modal'>" + languagePack.link.cancel + "</a>" +
        "<a href='#' class='btn btn-primary' data-dismiss='modal'>" + languagePack.link.insert + "</a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<a class='btn btn-default" + btnSize + "' data-htmleditor-command='createLink' title='" + languagePack.link.insert + "' tab-index='-1'><i class='glyphicon glyphicon-share'></i></a>" +
        "</li>";
      return linkHtml;
    },

    "image": function(languagePack, settings) {
      // Determine button size for the image tool
      var btnSize = (settings && settings.size) ? ' btn-' + settings.size : '';
      var imageHtml = "<li>" +
        "<div class='bootstrap-htmleditor-insert-image-modal modal fade'>" +
        "<div class='modal-dialog-box'>" +
        "<div class='modal-content-area'>" +
        "<div class='modal-header-section'>" +
        "<a class='close-button' data-dismiss='modal'>&times;</a>" +
        "<h3 class='modal-title-text'>" + languagePack.image.insert + "</h3>" +
        "</div>" +
        "<div class='modal-body-content'>" +
        "<input value='http://' class='bootstrap-htmleditor-insert-image-url form-control-input'>" +
        "</div>" +
        "<div class='modal-footer-section'>" +
        "<a href='#' class='btn btn-default' data-dismiss='modal'>" + languagePack.image.cancel + "</a>" +
        "<a href='#' class='btn btn-primary' data-dismiss='modal'>" + languagePack.image.insert + "</a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<a class='btn btn-default btn" + btnSize + "' data-htmleditor-command='insertImage' title='" + languagePack.image.insert + "' tab-index='-1'><i class='glyphicon glyphicon-picture'></i></a>" +
        "</li>";
      return imageHtml;
    },

    "html": function(languagePack, settings) {
      // Get button sizing from the editor settings
      var btnSize = (settings && settings.size) ? ' btn-' + settings.size : '';
      var htmlViewHtml = "<li>" +
        "<div class='btn-group-container'>" +
        "<a class='btn btn-default btn" + btnSize + "' data-htmleditor-action='change_view' title='" + languagePack.html.edit + "' tab-index='-1'><i class='glyphicon glyphicon-pencil'></i></a>" +
        "</div>" +
        "</li>";
      return htmlViewHtml;
    },

    "color": function(languagePack, settings) {
      // Determine the button size
      var btnSize = (settings && settings.size) ? ' btn-' + settings.size : '';
      var colorHtml = "<li class='drop-down-menu-item'>" +
        "<a class='btn btn-default dropdown-toggle" + btnSize + "' data-toggle='dropdown' href='#' tab-index='-1'>" +
        "<span class='active-color-display'>" + languagePack.colours.black + "</span><b class='caret'></b>" +
        "</a>" +
        "<ul class='dropdown-menu'>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='black'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='black'>" + languagePack.colours.black + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='silver'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='silver'>" + languagePack.colours.silver + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='gray'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='gray'>" + languagePack.colours.gray + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='maroon'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='maroon'>" + languagePack.colours.maroon + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='red'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='red'>" + languagePack.colours.red + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='purple'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='purple'>" + languagePack.colours.purple + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='green'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='green'>" + languagePack.colours.green + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='olive'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='olive'>" + languagePack.colours.olive + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='navy'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='navy'>" + languagePack.colours.navy + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='blue'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='blue'>" + languagePack.colours.blue + "</a></li>" +
        "<li><div class='htmleditor-colors' data-htmleditor-command-value='orange'></div><a class='htmleditor-colors-title' data-htmleditor-command='foreColor' data-htmleditor-command-value='orange'>" + languagePack.colours.orange + "</a></li>" +
        "</ul>" +
        "</li>";
      return colorHtml;
    }
  };

  // Function to retrieve markup for a specific component
  var generateComponentMarkup = function(templateKey, langData, configOpts) {
    return componentGenerators[templateKey](langData, configOpts);
  };


  // Main RichTextEditor class constructor
  var HtmlComposer = function(targetElement, initialSettings) {
    this.targetElem = targetElement;
    var editorConfig = initialSettings || baseConfiguration;

    // Extend componentGenerators with any custom templates provided
    for (var templateName in editorConfig.customTemplates) {
      componentGenerators[templateName] = editorConfig.customTemplates[templateName];
    }

    this.controlBar = this.buildControlBar(targetElement, editorConfig);
    this.contentComposer = this.initializeComposer(initialSettings);

    // Expose the editor instance globally for debugging or external access
    window.activeComposer = this.contentComposer;

    // Attach focus handlers to all editor iframes to close dropdowns
    jq('iframe.editor-iframe').each(function(index, iframeElem) {
      jq(iframeElem.contentWindow).off('focus.texteditor').on({
        'focus.texteditor': function() {
          jq('li.dropdown-menu-item').removeClass('open');
        }
      });
    });
  };

  // Prototype methods for the HtmlComposer class
  HtmlComposer.prototype = {

    constructor: HtmlComposer,

    // Creates and configures the editor instance
    initializeComposer: function(setupOptions) {
      setupOptions = setupOptions || {};

      // Deep clone options to avoid unintended modifications across instances
      setupOptions = jq.extend(true, {}, setupOptions);
      setupOptions.controlBar = this.controlBar[0]; // Assign the generated toolbar element

      var composerInstance = new htmleditor.Editor(this.targetElem[0], setupOptions);

      // Attach custom event handlers if provided in options
      if (setupOptions && setupOptions.eventHandlers) {
        for (var eventName in setupOptions.eventHandlers) {
          composerInstance.on(eventName, setupOptions.eventHandlers[eventName]);
        }
      }
      return composerInstance;
    },

    // Generates the toolbar element and attaches event listeners
    buildControlBar: function(containerElem, toolbarOptions) {
      var selfRef = this;
      var controlBarElement = jq("<ul/>", {
        'class': "htmleditor-control-bar",
        'style': "display:none"
      });
      var currentLanguage = toolbarOptions.languageCode || baseConfiguration.languageCode || "en";

      // Iterate through default options to build toolbar components
      for (var optionKey in baseConfiguration) {
        var isEnabled = false;

        if (toolbarOptions[optionKey] !== undefined) {
          if (toolbarOptions[optionKey] === true) {
            isEnabled = true;
          }
        } else {
          isEnabled = baseConfiguration[optionKey];
        }

        if (isEnabled === true) {
          controlBarElement.append(generateComponentMarkup(optionKey, languagePack[currentLanguage], toolbarOptions));

          // Initialize specific toolbar components
          if (optionKey === "html") {
            this.setupHtmlToggle(controlBarElement);
          }

          if (optionKey === "link") {
            this.setupLinkInsertion(controlBarElement);
          }

          if (optionKey === "image") {
            this.setupImageInsertion(controlBarElement);
          }
        }
      }

      // Append any custom toolbar elements specified in options
      if (toolbarOptions.controlBar) {
        for (optionKey in toolbarOptions.controlBar) {
          controlBarElement.append(toolbarOptions.controlBar[optionKey]);
        }
      }

      // Event handler for font style selection
      controlBarElement.find("a[data-htmleditor-command='formatBlock']").click(function(eventObj) {
        var eventTarget = eventObj.target || eventObj.srcElement;
        var clickedElement = jq(eventTarget);
        selfRef.controlBar.find('.active-font-display').text(clickedElement.html());
      });

      // Event handler for color selection
      controlBarElement.find("a[data-htmleditor-command='foreColor']").click(function(eventObj) {
        var eventTarget = eventObj.target || eventObj.srcElement;
        var clickedElement = jq(eventTarget);
        selfRef.controlBar.find('.active-color-display').text(clickedElement.html());
      });

      // Insert the toolbar before the target element
      this.targetElem.before(controlBarElement);

      return controlBarElement;
    },

    // Sets up the HTML view toggle functionality
    setupHtmlToggle: function(barElement) {
      var toggleViewSelector = "a[data-htmleditor-action='change_view']";
      barElement.find(toggleViewSelector).click(function(eventObj) {
        barElement.find('a.btn').not(toggleViewSelector).toggleClass('disabled');
      });
    },

    // Handles the insertion of images via a modal dialog
    setupImageInsertion: function(controlPanel) {
      var selfReference = this;
      var imageInsertionDialog = controlPanel.find('.bootstrap-htmleditor-insert-image-modal');
      var imageUrlInput = imageInsertionDialog.find('.bootstrap-htmleditor-insert-image-url');
      var confirmButton = imageInsertionDialog.find('a.btn-primary');
      var defaultUrlValue = imageUrlInput.val();
      var selectionMarker;

      // Function to execute the image insertion command
      var performImageInsert = function() {
        var imageSource = imageUrlInput.val();
        imageUrlInput.val(defaultUrlValue); // Reset input field
        selfReference.contentComposer.currentView.element.focus();
        if (selectionMarker) {
          selfReference.contentComposer.composer.selection.setBookmark(selectionMarker);
          selectionMarker = null;
        }
        selfReference.contentComposer.composer.commands.exec("insertImage", imageSource);
      };

      // Handle Enter key press in the URL input
      imageUrlInput.keypress(function(eventObj) {
        if (eventObj.which == 13) {
          performImageInsert();
          imageInsertionDialog.modal('hide');
        }
      });

      // Handle click on the insert button
      confirmButton.click(performImageInsert);

      // Focus URL input when modal is shown
      imageInsertionDialog.on('shown.bs.modal', function() {
        imageUrlInput.focus();
      });

      // Restore editor focus when modal is hidden
      imageInsertionDialog.on('hidden.bs.modal', function() {
        selfReference.contentComposer.currentView.element.focus();
      });

      // Handle click on the toolbar's insert image button
      controlPanel.find('a[data-htmleditor-command=insertImage]').click(function() {
        var isCurrentlyActive = jq(this).hasClass("htmleditor-command-active");

        if (!isCurrentlyActive) {
          selfReference.contentComposer.currentView.element.focus(false); // Blur editor to save selection
          selectionMarker = selfReference.contentComposer.composer.selection.getBookmark();
          imageInsertionDialog.appendTo('body').modal('show');
          // Prevent modal from closing when clicking internal elements
          imageInsertionDialog.on('click.modal.close', '[data-dismiss="modal"]', function(eventObj) {
            eventObj.stopPropagation();
          });
          return false; // Prevent default action
        } else {
          return true;
        }
      });
    },

    // Manages link insertion through a modal dialog
    setupLinkInsertion: function(controlPanel) {
      var selfReference = this;
      var linkInsertionDialog = controlPanel.find('.bootstrap-htmleditor-insert-link-modal');
      var linkUrlInput = linkInsertionDialog.find('.bootstrap-htmleditor-insert-link-url');
      var newWindowCheckbox = linkInsertionDialog.find('.bootstrap-htmleditor-insert-link-target');
      var confirmLinkButton = linkInsertionDialog.find('a.btn-primary');
      var defaultLinkValue = linkUrlInput.val();
      var linkSelectionMarker;

      // Function to insert the link into the editor
      var performLinkInsert = function() {
        var linkAddress = linkUrlInput.val();
        linkUrlInput.val(defaultLinkValue); // Reset input
        selfReference.contentComposer.currentView.element.focus();
        if (linkSelectionMarker) {
          selfReference.contentComposer.composer.selection.setBookmark(linkSelectionMarker);
          linkSelectionMarker = null;
        }

        var openInNewTab = newWindowCheckbox.prop("checked");
        selfReference.contentComposer.composer.commands.exec("createLink", {
          'href': linkAddress,
          'target': (openInNewTab ? '_blank' : '_self'),
          'rel': (openInNewTab ? 'nofollow' : '')
        });
      };

      // Handle Enter key press in the URL input
      linkUrlInput.keypress(function(eventObj) {
        if (eventObj.which == 13) {
          performLinkInsert();
          linkInsertionDialog.modal('hide');
        }
      });

      // Handle click on the insert button
      confirmLinkButton.click(performLinkInsert);

      // Focus URL input when modal is shown
      linkInsertionDialog.on('shown.bs.modal', function() {
        linkUrlInput.focus();
      });

      // Restore editor focus when modal is hidden
      linkInsertionDialog.on('hidden.bs.modal', function() {
        selfReference.contentComposer.currentView.element.focus();
      });

      // Handle click on the toolbar's create link button
      controlPanel.find('a[data-htmleditor-command=createLink]').click(function() {
        var isActiveCommand = jq(this).hasClass("htmleditor-command-active");

        if (!isActiveCommand) {
          selfReference.contentComposer.currentView.element.focus(false); // Blur to save selection
          linkSelectionMarker = selfReference.contentComposer.composer.selection.getBookmark();
          linkInsertionDialog.appendTo('body').modal('show');
          // Prevent modal from closing when clicking internal elements
          linkInsertionDialog.on('click.modal.close', '[data-dismiss="modal"]', function(eventObj) {
            eventObj.stopPropagation();
          });
          return false; // Prevent default action
        } else {
          return true;
        }
      });
    }
  };

  // Defines the public API methods for the jQuery plugin
  var pluginFunctions = {
    // Resets plugin options to their initial cached state
    restoreBaseSettings: function() {
      jq.fn.htmleditor.baseConfiguration = jq.extend(true, {}, jq.fn.htmleditor.cachedBaseConfiguration);
    },
    // Bypasses default options and applies provided settings directly
    applyCustomSettings: function(options) {
      return this.each(function() {
        var $thisElem = jq(this);
        $thisElem.data('htmleditor', new HtmlComposer($thisElem, options));
      });
    },
    // Merges options shallowly with defaults
    mergePartialSettings: function(options) {
      var mergedSettings = jq.extend({}, jq.fn.htmleditor.baseConfiguration, options || {}, jq(this).data());
      var currentContext = this;
      return pluginFunctions.applyCustomSettings.apply(currentContext, [mergedSettings]);
    },
    // Merges options deeply with defaults
    mergeFullSettings: function(options) {
      var deepMergedSettings = jq.extend(true, {}, jq.fn.htmleditor.baseConfiguration, options || {});
      var currentContext = this;
      return pluginFunctions.applyCustomSettings.apply(currentContext, [deepMergedSettings]);
    },
    // Initializes the plugin with options
    initializePlugin: function(options) {
      var currentContext = this;
      return pluginFunctions.mergePartialSettings.apply(currentContext, [options]);
    }
  };

  // jQuery plugin definition
  jq.fn.htmleditor = function(actionMethod) {
    if (pluginFunctions[actionMethod]) {
      // Call method with arguments, excluding the method name itself
      return pluginFunctions[actionMethod].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof actionMethod === 'object' || !actionMethod) {
      // If no method or an options object, initialize the plugin
      return pluginFunctions.initializePlugin.apply(this, arguments);
    } else {
      // Handle unknown method calls
      jq.error('Method ' + actionMethod + ' does not exist on jQuery.htmleditor');
    }
  };

  // Expose the constructor for direct access
  jq.fn.htmleditor.Constructor = HtmlComposer;

  // Default configuration for the HTML editor
  var baseConfiguration = jq.fn.htmleditor.baseConfiguration = {
    "font-styles": true,
    "color": false,
    "emphasis": true,
    "lists": true,
    "html": false,
    "link": true,
    "image": true,
    eventHandlers: {}, // Custom event handlers
    parsingRules: {
      styleClasses: {
        // Defined color classes for styling
        "htmleditor-color-silver": 1,
        "htmleditor-color-gray": 1,
        "htmleditor-color-white": 1,
        "htmleditor-color-maroon": 1,
        "htmleditor-color-red": 1,
        "htmleditor-color-purple": 1,
        "htmleditor-color-fuchsia": 1,
        "htmleditor-color-green": 1,
        "htmleditor-color-lime": 1,
        "htmleditor-color-olive": 1,
        "htmleditor-color-yellow": 1,
        "htmleditor-color-navy": 1,
        "htmleditor-color-blue": 1,
        "htmleditor-color-teal": 1,
        "htmleditor-color-aqua": 1,
        "htmleditor-color-orange": 1
      },
      htmlTags: {
        "b": {},
        "i": {},
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
        "u": 1,
        "img": {
          "check_attributes": {
            "width": "numbers",
            "alt": "alt",
            "src": "url",
            "height": "numbers"
          }
        },
        "a": {
          check_attributes: {
            'href': "url", // Security check for URLs
            'target': 'alt',
            'rel': 'alt'
          }
        },
        "span": 1,
        "div": 1,
        // Allow code and pre tags for content preservation
        "code": 1,
        "pre": 1
      }
    },
    styleSheets: ["<%= stylesheet_path('bootstrap-htmleditor/htmleditor-color.css') %>"], // Path to editor stylesheets
    languageCode: "en"
  };

  // Cache the initial default options for resetting
  if (typeof jq.fn.htmleditor.cachedBaseConfiguration === 'undefined') {
    jq.fn.htmleditor.cachedBaseConfiguration = jq.extend(true, {}, jq.fn.htmleditor.baseConfiguration);
  }

  // Language pack for various UI texts
  var languagePack = jq.fn.htmleditor.languagePack = {
    en: {
      font_styles: {
        normal: "Standard text",
        h1: "Heading Level 1",
        h2: "Heading Level 2",
        h3: "Heading Level 3",
        h4: "Heading Level 4",
        h5: "Heading Level 5",
        h6: "Heading Level 6"
      },
      emphasis: {
        bold: "Bold text",
        italic: "Italic text",
        underline: "Underline text"
      },
      lists: {
        unordered: "Bulleted list",
        ordered: "Numbered list",
        outdent: "Decrease indent",
        indent: "Increase indent"
      },
      link: {
        insert: "Add hyperlink",
        cancel: "Discard",
        target: "Open link in new tab"
      },
      image: {
        insert: "Insert picture",
        cancel: "Discard"
      },
      html: {
        edit: "Edit HTML"
      },
      colours: {
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
  };

}(jQuery, wysihtml5));