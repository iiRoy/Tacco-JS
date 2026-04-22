/*
 * This is a Type I code clone of the original JavaScript file.
 * The content is functionally identical, but whitespace and
 * comments have been extensively altered for visual differentiation.
 *
 * All identifiers, operators, and expressions remain precisely as they were.
 */

!function ($, wysi) {

  // Enforce strict mode for better code quality and error handling.
  "use strict";


  var tpl = {

    // Template for font styles dropdown menu.
    "font-styles": function (locale, options) {
      // Determine button size based on options, if provided.
      var size = (options && options.size) ? ' btn-' + options.size : '';
      return "<li class='dropdown'>" +

        " <a class='btn btn-default btn" + size + " dropdown-toggle' data-toggle='dropdown' href='#'>" +
        "  <i class='glyphicon glyphicon-font'></i>" +
        "  &nbsp;" + // Non-breaking space
        "  <span class='current-font'>" + locale.font_styles.normal + "</span>" +
        "  &nbsp;<b class='caret'></b>" +
        " </a>" +

        " <ul class='dropdown-menu'>" +
        "  <li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='div' tabindex='-1'>" + locale.font_styles.normal + "</a></li>" +
        "  <li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h1' tabindex='-1'>" + locale.font_styles.h1 + "</a></li>" +
        "  <li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h2' tabindex='-1'>" + locale.font_styles.h2 + "</a></li>" +
        "  <li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h3' tabindex='-1'>" + locale.font_styles.h3 + "</a></li>" +
        "  <li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h4'>" + locale.font_styles.h4 + "</a></li>" +
        "  <li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h5'>" + locale.font_styles.h5 + "</a></li>" +
        "  <li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h6'>" + locale.font_styles.h6 + "</a></li>" +
        " </ul>" +
        "</li>";
    },

    // Template for text emphasis buttons (bold, italic, underline).
    "emphasis": function (locale, options) {
      var size = (options && options.size) ? ' btn-' + options.size : '';
      return "<li>" +
        " <div class='btn-group'>" +
        "  <a class='btn btn-default btn" + size + "' data-wysihtml5-command='bold' title='CTRL+B' tabindex='-1'>" + locale.emphasis.bold + "</a>" +
        "  <a class='btn btn-default btn" + size + "' data-wysihtml5-command='italic' title='CTRL+I' tabindex='-1'>" + locale.emphasis.italic + "</a>" +
        "  <a class='btn btn-default btn" + size + "' data-wysihtml5-command='underline' title='CTRL+U' tabindex='-1'>" + locale.emphasis.underline + "</a>" +
        " </div>" +
        "</li>";
    },

    // Template for list-related buttons (unordered, ordered, indent, outdent).
    "lists": function (locale, options) {
      var size = (options && options.size) ? ' btn-' + options.size : '';
      return "<li>" +
        " <div class='btn-group'>" +
        "  <a class='btn btn-default btn" + size + "' data-wysihtml5-command='insertUnorderedList' title='" + locale.lists.unordered + "' tabindex='-1'><i class='glyphicon glyphicon-list'></i></a>" +
        "  <a class='btn btn-default btn" + size + "' data-wysihtml5-command='insertOrderedList' title='" + locale.lists.ordered + "' tabindex='-1'><i class='glyphicon glyphicon-th-list'></i></a>" +
        "  <a class='btn btn-default btn" + size + "' data-wysihtml5-command='Outdent' title='" + locale.lists.outdent + "' tabindex='-1'><i class='glyphicon glyphicon-indent-right'></i></a>" +
        "  <a class='btn btn-default btn" + size + "' data-wysihtml5-command='Indent' title='" + locale.lists.indent + "' tabindex='-1'><i class='glyphicon glyphicon-indent-left'></i></a>" +
        " </div>" +
        "</li>";
    },

    // Template for the link insertion modal and button.
    "link": function (locale, options) {
      var size = (options && options.size) ? ' btn-' + options.size : '';
      return "<li>" +
        " <div class='bootstrap-wysihtml5-insert-link-modal modal fade'>" +
        "  <div class='modal-dialog'>" +
        "   <div class='modal-content'>" +
        "    <div class='modal-header'>" +
        "     <a class='close' data-dismiss='modal'>&times;</a>" +
        "     <h3 class='modal-title'>" + locale.link.insert + "</h3>" +
        "    </div>" +
        "    <div class='modal-body'>" +
        "     <input value='http://' class='bootstrap-wysihtml5-insert-link-url form-control'>" +
        "     <label class='checkbox'> <input type='checkbox' class='bootstrap-wysihtml5-insert-link-target' checked>" + locale.link.target + "</label>" +
        "    </div>" +
        "    <div class='modal-footer'>" +
        "     <a href='#' class='btn btn-default' data-dismiss='modal'>" + locale.link.cancel + "</a>" +
        "     <a href='#' class='btn btn-primary' data-dismiss='modal'>" + locale.link.insert + "</a>" +
        "    </div>" +
        "   </div>" +
        "  </div>" +
        " </div>" +
        " <a class='btn btn-default" + size + "' data-wysihtml5-command='createLink' title='" + locale.link.insert + "' tabindex='-1'><i class='glyphicon glyphicon-share'></i></a>" +
        "</li>";
    },

    // Template for the image insertion modal and button.
    "image": function (locale, options) {
      var size = (options && options.size) ? ' btn-' + options.size : '';
      return "<li>" +
        " <div class='bootstrap-wysihtml5-insert-image-modal modal fade'>" +
        "  <div class='modal-dialog'>" +
        "   <div class='modal-content'>" +
        "    <div class='modal-header'>" +
        "     <a class='close' data-dismiss='modal'>&times;</a>" +
        "     <h3 class='modal-title'>" + locale.image.insert + "</h3>" +
        "    </div>" +
        "    <div class='modal-body'>" +
        "     <input value='http://' class='bootstrap-wysihtml5-insert-image-url form-control'>" +
        "    </div>" +
        "    <div class='modal-footer'>" +
        "     <a href='#' class='btn btn-default' data-dismiss='modal'>" + locale.image.cancel + "</a>" +
        "     <a href='#' class='btn btn-primary' data-dismiss='modal'>" + locale.image.insert + "</a>" +
        "    </div>" +
        "   </div>" +
        "  </div>" +
        " </div>" +
        " <a class='btn btn-default btn" + size + "' data-wysihtml5-command='insertImage' title='" + locale.image.insert + "' tabindex='-1'><i class='glyphicon glyphicon-picture'></i></a>" +
        "</li>";
    },

    // Template for the HTML view toggle button.
    "html": function (locale, options) {
      var size = (options && options.size) ? ' btn-' + options.size : '';
      return "<li>" +
        " <div class='btn-group'>" +
        "  <a class='btn btn-default btn" + size + "' data-wysihtml5-action='change_view' title='" + locale.html.edit + "' tabindex='-1'><i class='glyphicon glyphicon-pencil'></i></a>" +
        " </div>" +
        "</li>";
    },

    // Template for the color selection dropdown.
    "color": function (locale, options) {
      var size = (options && options.size) ? ' btn-' + options.size : '';
      return "<li class='dropdown'>" +
        " <a class='btn btn-default dropdown-toggle" + size + "' data-toggle='dropdown' href='#' tabindex='-1'>" +
        "  <span class='current-color'>" + locale.colours.black + "</span>&nbsp;<b class='caret'></b>" +
        " </a>" +
        " <ul class='dropdown-menu'>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='black'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='black'>" + locale.colours.black + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='silver'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='silver'>" + locale.colours.silver + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='gray'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='gray'>" + locale.colours.gray + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='maroon'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='maroon'>" + locale.colours.maroon + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='red'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='red'>" + locale.colours.red + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='purple'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='purple'>" + locale.colours.purple + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='green'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='green'>" + locale.colours.green + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='olive'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='olive'>" + locale.colours.olive + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='navy'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='navy'>" + locale.colours.navy + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='blue'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='blue'>" + locale.colours.blue + "</a></li>" +
        "  <li><div class='wysihtml5-colors' data-wysihtml5-command-value='orange'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='orange'>" + locale.colours.orange + "</a></li>" +
        " </ul>" +
        "</li>";
    }
  };

  /**
   * Helper function to retrieve a template by key.
   * @param {string} key - The key of the template to retrieve.
   * @param {object} locale - The locale object for text translation.
   * @param {object} options - Options for the template.
   * @returns {string} The rendered HTML template.
   */
  var templates = function (key, locale, options) {
    return tpl[key](locale, options);
  };


  /**
   * Wysihtml5 editor wrapper constructor.
   * @param {jQuery} el - The jQuery element to initialize the editor on.
   * @param {object} options - Configuration options for the editor.
   */
  var Wysihtml5 = function (el, options) {
    this.el = el;
    // Merge default options with provided options.
    var toolbarOpts = options || defaultOptions;
    // Add custom templates if they exist in toolbarOpts.
    for (var t in toolbarOpts.customTemplates) {
      tpl[t] = toolbarOpts.customTemplates[t];
    }
    this.toolbar = this.createToolbar(el, toolbarOpts);
    this.editor = this.createEditor(options);

    // Expose editor globally for debugging/external access (consider removing in production).
    window.editor = this.editor;

    // Handle focus events for iframe sandboxes to close dropdowns.
    $('iframe.wysihtml5-sandbox').each(function (i, el) {
      $(el.contentWindow).off('focus.wysihtml5').on({
        'focus.wysihtml5': function () {
          $('li.dropdown').removeClass('open');
        }
      });
    });
  };

  Wysihtml5.prototype = {

    constructor: Wysihtml5, // Explicitly define constructor property.

    /**
     * Creates and configures the wysihtml5 editor instance.
     * @param {object} options - Editor configuration options.
     * @returns {wysi.Editor} The initialized wysihtml5 editor instance.
     */
    createEditor: function (options) {
      options = options || {};

      // Add the toolbar to a clone of the options object so multiple instances
      // of the WYISYWG don't break because "toolbar" is already defined.
      options = $.extend(true, {}, options);
      options.toolbar = this.toolbar[0];

      var editor = new wysi.Editor(this.el[0], options);

      // Attach custom event handlers if provided in options.
      if (options && options.events) {
        for (var eventName in options.events) {
          editor.on(eventName, options.events[eventName]);
        }
      }
      return editor;
    },

    /**
     * Creates the toolbar based on configured options.
     * @param {jQuery} el - The target element for the editor.
     * @param {object} options - Toolbar configuration options.
     * @returns {jQuery} The created toolbar element.
     */
    createToolbar: function (el, options) {
      var self = this;
      var toolbar = $("<ul/>", {
        'class': "wysihtml5-toolbar",
        'style': "display:none" // Hidden by default, shown by plugin.
      });
      var culture = options.locale || defaultOptions.locale || "en";

      // Iterate through default options to build the toolbar.
      for (var key in defaultOptions) {
        var value = false;

        if (options[key] !== undefined) {
          if (options[key] === true) {
            value = true;
          }
        } else {
          value = defaultOptions[key];
        }

        if (value === true) {
          toolbar.append(templates(key, locale[culture], options));

          // Initialize specific toolbar functionalities.
          if (key === "html") {
            this.initHtml(toolbar);
          }

          if (key === "link") {
            this.initInsertLink(toolbar);
          }

          if (key === "image") {
            this.initInsertImage(toolbar);
          }
        }
      }

      // Append any custom toolbar elements defined in options.
      if (options.toolbar) {
        for (key in options.toolbar) {
          toolbar.append(options.toolbar[key]);
        }
      }

      // Update current font display on formatBlock command.
      toolbar.find("a[data-wysihtml5-command='formatBlock']").click(function (e) {
        var target = e.target || e.srcElement;
        var el = $(target);
        self.toolbar.find('.current-font').text(el.html());
      });

      // Update current color display on foreColor command.
      toolbar.find("a[data-wysihtml5-command='foreColor']").click(function (e) {
        var target = e.target || e.srcElement;
        var el = $(target);
        self.toolbar.find('.current-color').text(el.html());
      });

      // Insert the toolbar before the editor element.
      this.el.before(toolbar);

      return toolbar;
    },

    /**
     * Initializes the HTML view toggle functionality.
     * @param {jQuery} toolbar - The toolbar element.
     */
    initHtml: function (toolbar) {
      var changeViewSelector = "a[data-wysihtml5-action='change_view']";
      toolbar.find(changeViewSelector).click(function (e) {
        // Toggle disabled state for other buttons when HTML view is active.
        toolbar.find('a.btn').not(changeViewSelector).toggleClass('disabled');
      });
    },

    /**
     * Initializes the image insertion modal and logic.
     * @param {jQuery} toolbar - The toolbar element.
     */
    initInsertImage: function (toolbar) {
      var self = this;
      var insertImageModal = toolbar.find('.bootstrap-wysihtml5-insert-image-modal');
      var urlInput = insertImageModal.find('.bootstrap-wysihtml5-insert-image-url');
      var insertButton = insertImageModal.find('a.btn-primary');
      var initialValue = urlInput.val(); // Store initial input value.
      var caretBookmark; // To restore cursor position after modal.

      var insertImage = function () {
        var url = urlInput.val();
        urlInput.val(initialValue); // Reset input field.
        self.editor.currentView.element.focus(); // Focus back on editor.
        if (caretBookmark) {
          self.editor.composer.selection.setBookmark(caretBookmark); // Restore cursor.
          caretBookmark = null;
        }
        self.editor.composer.commands.exec("insertImage", url); // Execute insert image command.
      };

      // Handle Enter key press in URL input.
      urlInput.keypress(function (e) {
        if (e.which == 13) { // ASCII code for Enter key.
          insertImage();
          insertImageModal.modal('hide');
        }
      });

      // Handle click on insert button.
      insertButton.click(insertImage);

      // Focus URL input when modal is shown.
      insertImageModal.on('shown', function () {
        urlInput.focus();
      });

      // Refocus editor when modal is hidden.
      insertImageModal.on('hide', function () {
        self.editor.currentView.element.focus();
      });

      // Handle click on the insert image toolbar button.
      toolbar.find('a[data-wysihtml5-command=insertImage]').click(function () {
        var activeButton = $(this).hasClass("wysihtml5-command-active");

        if (!activeButton) {
          self.editor.currentView.element.focus(false); // Blur editor to prevent strange behavior.
          caretBookmark = self.editor.composer.selection.getBookmark(); // Save cursor position.
          insertImageModal.appendTo('body').modal('show'); // Show modal.
          insertImageModal.on('click.dismiss.modal', '[data-dismiss="modal"]', function (e) {
            e.stopPropagation(); // Prevent issues with nested modals.
          });
          return false; // Prevent default action.
        } else {
          return true; // Allow default action if already active.
        }
      });
    },

    /**
     * Initializes the link insertion modal and logic.
     * @param {jQuery} toolbar - The toolbar element.
     */
    initInsertLink: function (toolbar) {
      var self = this;
      var insertLinkModal = toolbar.find('.bootstrap-wysihtml5-insert-link-modal');
      var urlInput = insertLinkModal.find('.bootstrap-wysihtml5-insert-link-url');
      var targetInput = insertLinkModal.find('.bootstrap-wysihtml5-insert-link-target');
      var insertButton = insertLinkModal.find('a.btn-primary');
      var initialValue = urlInput.val(); // Store initial input value.
      var caretBookmark; // To restore cursor position after modal.

      var insertLink = function () {
        var url = urlInput.val();
        urlInput.val(initialValue); // Reset input field.
        self.editor.currentView.element.focus(); // Focus back on editor.
        if (caretBookmark) {
          self.editor.composer.selection.setBookmark(caretBookmark); // Restore cursor.
          caretBookmark = null;
        }

        var newWindow = targetInput.prop("checked"); // Check if 'open in new window' is selected.
        self.editor.composer.commands.exec("createLink", {
          'href': url,
          'target': (newWindow ? '_blank' : '_self'),
          'rel': (newWindow ? 'nofollow' : '') // Add nofollow for external links.
        });
      };
      var pressedEnter = false; // Flag for enter key (unused in final code).

      // Handle Enter key press in URL input.
      urlInput.keypress(function (e) {
        if (e.which == 13) {
          insertLink();
          insertLinkModal.modal('hide');
        }
      });

      // Handle click on insert button.
      insertButton.click(insertLink);

      // Focus URL input when modal is shown.
      insertLinkModal.on('shown', function () {
        urlInput.focus();
      });

      // Refocus editor when modal is hidden.
      insertLinkModal.on('hide', function () {
        self.editor.currentView.element.focus();
      });

      // Handle click on the create link toolbar button.
      toolbar.find('a[data-wysihtml5-command=createLink]').click(function () {
        var activeButton = $(this).hasClass("wysihtml5-command-active");

        if (!activeButton) {
          self.editor.currentView.element.focus(false); // Blur editor.
          caretBookmark = self.editor.composer.selection.getBookmark(); // Save cursor.
          insertLinkModal.appendTo('body').modal('show'); // Show modal.
          insertLinkModal.on('click.dismiss.modal', '[data-dismiss="modal"]', function (e) {
            e.stopPropagation();
          });
          return false; // Prevent default action.
        } else {
          return true; // Allow default action if already active.
        }
      });
    }
  };

  // Define public API methods for the jQuery plugin.
  var methods = {
    /**
     * Resets default options to their initial state.
     */
    resetDefaults: function () {
      $.fn.wysihtml5.defaultOptions = $.extend(true, {}, $.fn.wysihtml5.defaultOptionsCache);
    },
    /**
     * Bypasses default options and uses provided options directly.
     * @param {object} options - Options to use for initialization.
     * @returns {jQuery} The jQuery object for chaining.
     */
    bypassDefaults: function (options) {
      return this.each(function () {
        var $this = $(this);
        $this.data('wysihtml5', new Wysihtml5($this, options));
      });
    },
    /**
     * Extends default options with provided options (shallow merge).
     * @param {object} options - Options to merge.
     * @returns {jQuery} The jQuery object for chaining.
     */
    shallowExtend: function (options) {
      var settings = $.extend({}, $.fn.wysihtml5.defaultOptions, options || {}, $(this).data());
      var that = this;
      return methods.bypassDefaults.apply(that, [settings]);
    },
    /**
     * Extends default options with provided options (deep merge).
     * @param {object} options - Options to merge.
     * @returns {jQuery} The jQuery object for chaining.
     */
    deepExtend: function (options) {
      var settings = $.extend(true, {}, $.fn.wysihtml5.defaultOptions, options || {});
      var that = this;
      return methods.bypassDefaults.apply(that, [settings]);
    },
    /**
     * Initializes the wysihtml5 editor with (shallow-merged) options.
     * @param {object} options - Options for initialization.
     * @returns {jQuery} The jQuery object for chaining.
     */
    init: function (options) {
      var that = this;
      return methods.shallowExtend.apply(that, [options]);
    }
  };

  /**
   * jQuery plugin definition for wysihtml5.
   * Allows calling methods or initializing the editor.
   * @param {string|object} method - The method name to call or an options object for initialization.
   * @returns {jQuery} The jQuery object for chaining or method return value.
   */
  $.fn.wysihtml5 = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.wysihtml5');
    }
  };

  // Expose the Wysihtml5 constructor directly.
  $.fn.wysihtml5.Constructor = Wysihtml5;

  // Define default options for the wysihtml5 editor.
  var defaultOptions = $.fn.wysihtml5.defaultOptions = {
    "font-styles": true, // Enable font style dropdown.
    "color": false, // Disable color picker by default.
    "emphasis": true, // Enable bold, italic, underline buttons.
    "lists": true, // Enable list buttons.
    "html": false, // Disable HTML view button by default.
    "link": true, // Enable link insertion.
    "image": true, // Enable image insertion.
    events: {}, // Custom event handlers.
    parserRules: { // Rules for parsing and sanitizing HTML content.
      classes: {
        // (path_to_project/lib/css/wysiwyg-color.css)
        "wysiwyg-color-silver": 1,
        "wysiwyg-color-gray": 1,
        "wysiwyg-color-white": 1,
        "wysiwyg-color-maroon": 1,
        "wysiwyg-color-red": 1,
        "wysihtml5-color-purple": 1,
        "wysihtml5-color-fuchsia": 1,
        "wysihtml5-color-green": 1,
        "wysihtml5-color-lime": 1,
        "wysihtml5-color-olive": 1,
        "wysihtml5-color-yellow": 1,
        "wysihtml5-color-navy": 1,
        "wysihtml5-color-blue": 1,
        "wysihtml5-color-teal": 1,
        "wysihtml5-color-aqua": 1,
        "wysihtml5-color-orange": 1
      },
      tags: {
        "b": {}, // Allow bold tag.
        "i": {}, // Allow italic tag.
        "br": {}, // Allow line break tag.
        "ol": {}, // Allow ordered list.
        "ul": {}, // Allow unordered list.
        "li": {}, // Allow list item.
        "h1": {}, // Allow heading 1.
        "h2": {}, // Allow heading 2.
        "h3": {}, // Allow heading 3.
        "h4": {}, // Allow heading 4.
        "h5": {}, // Allow heading 5.
        "h6": {}, // Allow heading 6.
        "blockquote": {}, // Allow blockquote.
        "u": 1, // Allow underline (simple rule).
        "img": { // Allow image tag with specific attributes.
          "check_attributes": {
            "width": "numbers",
            "alt": "alt",
            "src": "url",
            "height": "numbers"
          }
        },
        "a": { // Allow anchor tag with specific attributes for security.
          check_attributes: {
            'href': "url", // Important to avoid XSS.
            'target': 'alt',
            'rel': 'alt'
          }
        },
        "span": 1, // Allow span tag.
        "div": 1, // Allow div tag.
        // To allow saving and editing files with code tag hacks.
        "code": 1, // Allow code tag.
        "pre": 1 // Allow preformatted text tag.
      }
    },
    stylesheets: ["<%= stylesheet_path('bootstrap-wysihtml5/wysiwyg-color.css') %>"], // (path_to_project/lib/css/wysiwyg-color.css)
    locale: "en" // Default locale is English.
  };

  // Cache a deep copy of default options for reset functionality.
  if (typeof $.fn.wysihtml5.defaultOptionsCache === 'undefined') {
    $.fn.wysihtml5.defaultOptionsCache = $.extend(true, {}, $.fn.wysihtml5.defaultOptions);
  }

  // Define locale strings for different languages.
  var locale = $.fn.wysihtml5.locale = {
    en: { // English locale.
      font_styles: {
        normal: "Normal text",
        h1: "Heading 1",
        h2: "Heading 2",
        h3: "Heading 3",
        h4: "Heading 4",
        h5: "Heading 5",
        h6: "Heading 6"
      },
      emphasis: {
        bold: "Bold",
        italic: "Italic",
        underline: "Underline"
      },
      lists: {
        unordered: "Unordered list",
        ordered: "Ordered list",
        outdent: "Outdent",
        indent: "Indent"
      },
      link: {
        insert: "Insert link",
        cancel: "Cancel",
        target: "Open link in new window"
      },
      image: {
        insert: "Insert image",
        cancel: "Cancel"
      },
      html: {
        // No specific text for html button, icon is used.
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

}(jQuery, wysihtml5); // Execute the IIFE with jQuery and wysihtml5 objects.