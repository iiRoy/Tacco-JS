! function ( $, wysi ) {
  "use strict"; // Enable strict mode for better code quality and error handling.

  // This variable holds the base path for CSS resources.
  // It extracts the part of the URL before "admin" and appends "Admin/css/".
  var csspath = ( window.location.href ).slice( 0, ( window.location.href ).indexOf( "admin" ) ) + "Admin/css/";

  /*
   * Template definitions for various WYSIWYG editor components.
   * Each function generates the HTML string for a specific toolbar button or dropdown.
   */
  var tpl = {

    // Template for font style dropdown.
    "font-styles": function ( locale, options ) {
      // Determine button size based on options, if provided.
      var size = ( options && options.size ) ? ' btn-' + options.size : '';

      // Return the HTML for the font styles dropdown.
      return "<li class='dropdown'>" +
        "<a class='btn dropdown-toggle" + size + "' data-toggle='dropdown' href='#'>" +
        "<i class='icon-font'></i>&nbsp;<span class='current-font'>" + locale.font_styles.normal + "</span>&nbsp;<b class='caret'></b>" +
        "</a>" +
        "<ul class='dropdown-menu'>" +
        "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='div'>" + locale.font_styles.normal + "</a></li>" +
        "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h1'>" + locale.font_styles.h1 + "</a></li>" +
        "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h2'>" + locale.font_styles.h2 + "</a></li>" +
        "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h3'>" + locale.font_styles.h3 + "</a></li>" +
        "</ul>" +
        "</li>";
    }, // End of font-styles template

    // Template for text emphasis buttons (bold, italic, underline).
    "emphasis": function ( locale, options ) {
      var size = ( options && options.size ) ? ' btn-' + options.size : '';
      return "<li>" +
        "<div class='btn-group'>" +
        "<a class='btn" + size + "' data-wysihtml5-command='bold' title='CTRL+B'>" + locale.emphasis.bold + "</a>" +
        "<a class='btn" + size + "' data-wysihtml5-command='italic' title='CTRL+I'>" + locale.emphasis.italic + "</a>" +
        "<a class='btn" + size + "' data-wysihtml5-command='underline' title='CTRL+U'>" + locale.emphasis.underline + "</a>" +
        "</div>" +
        "</li>";
    }, // End of emphasis template

    // Template for list-related buttons (unordered, ordered, indent, outdent).
    "lists": function ( locale, options ) {
      var size = ( options && options.size ) ? ' btn-' + options.size : '';
      return "<li>" +
        "<div class='btn-group'>" +
        "<a class='btn" + size + "' data-wysihtml5-command='insertUnorderedList' title='" + locale.lists.unordered + "'><i class='icon-list'></i></a>" +
        "<a class='btn" + size + "' data-wysihtml5-command='insertOrderedList' title='" + locale.lists.ordered + "'><i class='icon-th-list'></i></a>" +
        "<a class='btn" + size + "' data-wysihtml5-command='Outdent' title='" + locale.lists.outdent + "'><i class='icon-indent-right'></i></a>" +
        "<a class='btn" + size + "' data-wysihtml5-command='Indent' title='" + locale.lists.indent + "'><i class='icon-indent-left'></i></a>" +
        "</div>" +
        "</li>";
    }, // End of lists template

    // Template for the link insertion dialog and button.
    "link": function ( locale, options ) {
      var size = ( options && options.size ) ? ' btn-' + options.size : '';
      return "<li>" +
        "<div class='bootstrap-wysihtml5-insert-link-modal modal hide fade'>" +
        "<div class='modal-header'>" +
        "<a class='close' data-dismiss='modal'>&times;</a>" +
        "<h3>" + locale.link.insert + "</h3>" +
        "</div>" +
        "<div class='modal-body'>" +
        "<input value='http://' class='bootstrap-wysihtml5-insert-link-url input-xlarge'>" +
        "</div>" +
        "<div class='modal-footer'>" +
        "<a href='#' class='btn' data-dismiss='modal'>" + locale.link.cancel + "</a>" +
        "<a href='#' class='btn btn-primary' data-dismiss='modal'>" + locale.link.insert + "</a>" +
        "</div>" +
        "</div>" +
        "<a class='btn" + size + "' data-wysihtml5-command='createLink' title='" + locale.link.insert + "'><i class='icon-share'></i></a>" +
        "</li>";
    }, // End of link template

    // Template for the image insertion dialog and button.
    "image": function ( locale, options ) {
      var size = ( options && options.size ) ? ' btn-' + options.size : '';
      return "<li>" +
        "<div class='bootstrap-wysihtml5-insert-image-modal modal hide fade'>" +
        "<div class='modal-header'>" +
        "<a class='close' data-dismiss='modal'>&times;</a>" +
        "<h3>" + locale.image.insert + "</h3>" +
        "</div>" +
        "<div class='modal-body'>" +
        "<input value='http://' class='bootstrap-wysihtml5-insert-image-url input-xlarge'>" +
        "</div>" +
        "<div class='modal-footer'>" +
        "<a href='#' class='btn' data-dismiss='modal'>" + locale.image.cancel + "</a>" +
        "<a href='#' class='btn btn-primary' data-dismiss='modal'>" + locale.image.insert + "</a>" +
        "</div>" +
        "</div>" +
        "<a class='btn" + size + "' data-wysihtml5-command='insertImage' title='" + locale.image.insert + "'><i class='icon-picture'></i></a>" +
        "</li>";
    }, // End of image template

    // Template for the HTML view toggle button.
    "html": function ( locale, options ) {
      var size = ( options && options.size ) ? ' btn-' + options.size : '';
      return "<li>" +
        "<div class='btn-group'>" +
        "<a class='btn" + size + "' data-wysihtml5-action='change_view' title='" + locale.html.edit + "'><i class='icon-pencil'></i></a>" +
        "</div>" +
        "</li>";
    }, // End of html template

    // Template for the color selection dropdown.
    "color": function ( locale, options ) {
      var size = ( options && options.size ) ? ' btn-' + options.size : '';
      return "<li class='dropdown'>" +
        "<a class='btn dropdown-toggle" + size + "' data-toggle='dropdown' href='#'>" +
        "<span class='current-color'>" + locale.colours.black + "</span>&nbsp;<b class='caret'></b>" +
        "</a>" +
        "<ul class='dropdown-menu'>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='black'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='black'>" + locale.colours.black + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='silver'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='silver'>" + locale.colours.silver + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='gray'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='gray'>" + locale.colours.gray + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='maroon'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='maroon'>" + locale.colours.maroon + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='red'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='red'>" + locale.colours.red + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='purple'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='purple'>" + locale.colours.purple + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='green'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='green'>" + locale.colours.green + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='olive'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='olive'>" + locale.colours.olive + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='navy'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='navy'>" + locale.colours.navy + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='blue'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='blue'>" + locale.colours.blue + "</a></li>" +
        "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='orange'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='orange'>" + locale.colours.orange + "</a></li>" +
        "</ul>" +
        "</li>";
    } // End of color template
  };

  // Helper function to retrieve a template by its key.
  var templates = function ( key, locale, options ) {
    return tpl[ key ]( locale, options );
  };


  // Wysihtml5 constructor function.
  // Initializes the editor instance and its toolbar.
  var Wysihtml5 = function ( el, options ) {
    this.el = el; // The textarea element to be transformed.
    var toolbarOpts = options || defaultOptions; // Use provided options or default ones.

    // Merge custom templates into the existing template object.
    for ( var t in toolbarOpts.customTemplates ) {
      tpl[ t ] = toolbarOpts.customTemplates[ t ];
    }

    this.toolbar = this.createToolbar( el, toolbarOpts ); // Create the toolbar.
    this.editor = this.createEditor( options ); // Create the wysihtml5 editor instance.

    window.editor = this.editor; // Make editor globally accessible (for debugging, etc.)

    // Prevent dropdowns from staying open when switching focus between iframe and parent.
    $( 'iframe.wysihtml5-sandbox' ).each( function ( i, el ) {
      $( el.contentWindow ).off( 'focus.wysihtml5' ).on( {
        'focus.wysihtml5': function () {
          $( 'li.dropdown' ).removeClass( 'open' );
        }
      } );
    } );
  };

  // Prototype methods for Wysihtml5 objects.
  Wysihtml5.prototype = {

    constructor: Wysihtml5, // Explicitly set the constructor.

    // Creates the core wysihtml5 editor instance.
    createEditor: function ( options ) {
      options = options || {};
      options.toolbar = this.toolbar[ 0 ]; // Assign the generated toolbar to editor options.

      var editor = new wysi.Editor( this.el[ 0 ], options );

      // Attach custom events if provided in options.
      if ( options && options.events ) {
        for ( var eventName in options.events ) {
          editor.on( eventName, options.events[ eventName ] );
        }
      }
      return editor;
    },

    // Creates and populates the editor toolbar.
    createToolbar: function ( el, options ) {
      var self = this;
      var toolbar = $( "<ul/>", {
        'class': "wysihtml5-toolbar",
        'style': "display:none"
      } );
      var culture = options.locale || defaultOptions.locale || "en"; // Determine locale.

      // Iterate through default options to build the toolbar.
      for ( var key in defaultOptions ) {
        var value = false;

        if ( options[ key ] !== undefined ) {
          if ( options[ key ] === true ) {
            value = true;
          }
        } else {
          value = defaultOptions[ key ];
        }

        if ( value === true ) {
          toolbar.append( templates( key, locale[ culture ], options ) ); // Append template HTML.

          // Initialize specific toolbar features.
          if ( key === "html" ) {
            this.initHtml( toolbar );
          }

          if ( key === "link" ) {
            this.initInsertLink( toolbar );
          }

          if ( key === "image" ) {
            this.initInsertImage( toolbar );
          }
        }
      }

      // Append any custom toolbar items specified in options.
      if ( options.toolbar ) {
        for ( key in options.toolbar ) {
          toolbar.append( options.toolbar[ key ] );
        }
      }

      // Handle font style dropdown clicks to update the display text.
      toolbar.find( "a[data-wysihtml5-command='formatBlock']" ).click( function ( e ) {
        var target = e.target || e.srcElement;
        var el = $( target );
        self.toolbar.find( '.current-font' ).text( el.html() );
      } );

      // Handle foreColor dropdown clicks to update the display text.
      toolbar.find( "a[data-wysihtml5-command='foreColor']" ).click( function ( e ) {
        var target = e.target || e.srcElement;
        var el = $( target );
        self.toolbar.find( '.current-color' ).text( el.html() );
      } );

      this.el.before( toolbar ); // Insert the toolbar before the textarea.

      return toolbar;
    },

    // Initializes the HTML view toggle button.
    initHtml: function ( toolbar ) {
      var changeViewSelector = "a[data-wysihtml5-action='change_view']";
      toolbar.find( changeViewSelector ).click( function ( e ) {
        // Toggle 'disabled' class on other buttons when HTML view is active/inactive.
        toolbar.find( 'a.btn' ).not( changeViewSelector ).toggleClass( 'disabled' );
      } );
    },

    // Initializes the image insertion functionality.
    initInsertImage: function ( toolbar ) {
      var self = this;
      var insertImageModal = toolbar.find( '.bootstrap-wysihtml5-insert-image-modal' );
      var urlInput = insertImageModal.find( '.bootstrap-wysihtml5-insert-image-url' );
      var insertButton = insertImageModal.find( 'a.btn-primary' );
      var initialValue = urlInput.val();
      var caretBookmark; // To store cursor position.

      var insertImage = function () {
        var url = urlInput.val();
        urlInput.val( initialValue ); // Reset URL input.
        self.editor.currentView.element.focus();
        if ( caretBookmark ) {
          self.editor.composer.selection.setBookmark( caretBookmark );
          caretBookmark = null;
        }
        self.editor.composer.commands.exec( "insertImage", url );
      };

      // Handle 'Enter' key press in the URL input.
      urlInput.keypress( function ( e ) {
        if ( e.which == 13 ) { // If Enter key.
          insertImage();
          insertImageModal.modal( 'hide' ); // Hide modal after insertion.
        }
      } );

      insertButton.click( insertImage ); // Handle click on insert button.

      // Focus URL input when modal is shown.
      insertImageModal.on( 'shown', function () {
        urlInput.focus();
      } );

      // Restore focus to editor when modal is hidden.
      insertImageModal.on( 'hide', function () {
        self.editor.currentView.element.focus();
      } );

      // Handle click on the insert image toolbar button.
      toolbar.find( 'a[data-wysihtml5-command=insertImage]' ).click( function () {
        var activeButton = $( this ).hasClass( "wysihtml5-command-active" );

        if ( !activeButton ) {
          self.editor.currentView.element.focus( false );
          caretBookmark = self.editor.composer.selection.getBookmark(); // Save cursor position.
          insertImageModal.modal( 'show' );
          insertImageModal.on( 'click.dismiss.modal', '[data-dismiss="modal"]', function ( e ) {
            e.stopPropagation(); // Prevent modal from closing if clicking on dismiss button.
          } );
          return false; // Prevent default action.
        } else {
          return true; // Allow default action if already active.
        }
      } );
    },

    // Initializes the link insertion functionality.
    initInsertLink: function ( toolbar ) {
      var self = this;
      var insertLinkModal = toolbar.find( '.bootstrap-wysihtml5-insert-link-modal' );
      var urlInput = insertLinkModal.find( '.bootstrap-wysihtml5-insert-link-url' );
      var insertButton = insertLinkModal.find( 'a.btn-primary' );
      var initialValue = urlInput.val();
      var caretBookmark; // To store cursor position.

      var insertLink = function () {
        var url = urlInput.val();
        urlInput.val( initialValue ); // Reset URL input.
        self.editor.currentView.element.focus();
        if ( caretBookmark ) {
          self.editor.composer.selection.setBookmark( caretBookmark );
          caretBookmark = null;
        }
        self.editor.composer.commands.exec( "createLink", {
          href: url,
          target: "_blank", // Open link in new tab by default.
          rel: "nofollow" // Add nofollow attribute.
        } );
      };
      var pressedEnter = false; // Unused variable, kept for Type I clone.

      // Handle 'Enter' key press in the URL input.
      urlInput.keypress( function ( e ) {
        if ( e.which == 13 ) {
          insertLink();
          insertLinkModal.modal( 'hide' );
        }
      } );

      insertButton.click( insertLink ); // Handle click on insert button.

      // Focus URL input when modal is shown.
      insertLinkModal.on( 'shown', function () {
        urlInput.focus();
      } );

      // Restore focus to editor when modal is hidden.
      insertLinkModal.on( 'hide', function () {
        self.editor.currentView.element.focus();
      } );

      // Handle click on the create link toolbar button.
      toolbar.find( 'a[data-wysihtml5-command=createLink]' ).click( function () {
        var activeButton = $( this ).hasClass( "wysihtml5-command-active" );

        if ( !activeButton ) {
          self.editor.currentView.element.focus( false );
          caretBookmark = self.editor.composer.selection.getBookmark(); // Save cursor position.
          insertLinkModal.appendTo( 'body' ).modal( 'show' ); // Append to body to avoid z-index issues.
          insertLinkModal.on( 'click.dismiss.modal', '[data-dismiss="modal"]', function ( e ) {
            e.stopPropagation(); // Prevent modal from closing prematurely.
          } );
          return false;
        } else {
          return true;
        }
      } );
    }
  };

  // Public API methods for the jQuery plugin.
  var methods = {
    // Resets default options to their original cached state.
    resetDefaults: function () {
      $.fn.wysihtml5.defaultOptions = $.extend( true, {}, $.fn.wysihtml5.defaultOptionsCache );
    },
    // Bypasses default options and directly applies provided options.
    bypassDefaults: function ( options ) {
      return this.each( function () {
        var $this = $( this );
        $this.data( 'wysihtml5', new Wysihtml5( $this, options ) );
      } );
    },
    // Shallow merge of options with defaults.
    shallowExtend: function ( options ) {
      var settings = $.extend( {}, $.fn.wysihtml5.defaultOptions, options || {} );
      var that = this;
      return methods.bypassDefaults.apply( that, [ settings ] );
    },
    // Deep merge of options with defaults.
    deepExtend: function ( options ) {
      var settings = $.extend( true, {}, $.fn.wysihtml5.defaultOptions, options || {} );
      var that = this;
      return methods.bypassDefaults.apply( that, [ settings ] );
    },
    // Default initialization method, uses shallow extend.
    init: function ( options ) {
      var that = this;
      return methods.shallowExtend.apply( that, [ options ] );
    }
  };

  // jQuery plugin definition.
  $.fn.wysihtml5 = function ( method ) {
    if ( methods[ method ] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    } else if ( typeof method === 'object' || !method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' + method + ' does not exist on jQuery.wysihtml5' );
    }
  };

  // Expose the Wysihtml5 constructor.
  $.fn.wysihtml5.Constructor = Wysihtml5;

  // Default options for the wysihtml5 editor.
  var defaultOptions = $.fn.wysihtml5.defaultOptions = {
    "font-styles": true, // Enable font styles dropdown.
    "color": false, // Disable color picker by default.
    "emphasis": true, // Enable bold, italic, underline.
    "lists": true, // Enable list buttons.
    "html": false, // Disable HTML view toggle by default.
    "link": true, // Enable link insertion.
    "image": true, // Enable image insertion.
    events: {}, // Custom event handlers.
    parserRules: { // Rules for cleaning up HTML content.
      classes: {
        // Defined classes for styling, e.g., colors.
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
      tags: { // Allowed HTML tags and their attributes.
        "b": {},
        "i": {},
        "br": {},
        "ol": {},
        "ul": {},
        "li": {},
        "h1": {},
        "h2": {},
        "h3": {},
        "blockquote": {},
        "u": 1, // '1' means allow without specific attributes.
        "img": {
          "check_attributes": { // Attributes to check for img tags.
            "width": "numbers",
            "alt": "alt",
            "src": "url",
            "height": "numbers"
          }
        },
        "a": {
          set_attributes: { // Attributes to set for a tags.
            target: "_blank",
            rel: "nofollow"
          },
          check_attributes: { // Attributes to check for a tags.
            href: "url" // Important for XSS prevention.
          }
        },
        "span": 1,
        "div": 1
      }
    },
    stylesheets: [ csspath + "wysiwyg-color.css" ], // Path to color stylesheet.
    locale: "en" // Default locale is English.
  };

  // Cache the default options to allow resetting them later.
  if ( typeof $.fn.wysihtml5.defaultOptionsCache === 'undefined' ) {
    $.fn.wysihtml5.defaultOptionsCache = $.extend( true, {}, $.fn.wysihtml5.defaultOptions );
  }

  // Locale data for different languages.
  var locale = $.fn.wysihtml5.locale = {
    en: { // English locale.
      font_styles: {
        normal: "Normal text",
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
        unordered: "Unordered list",
        ordered: "Ordered list",
        outdent: "Outdent",
        indent: "Indent"
      },
      link: {
        insert: "Insert link",
        cancel: "Cancel"
      },
      image: {
        insert: "Insert image",
        cancel: "Cancel"
      },
      html: {
        edit: "Edit HTML"
      },
      colours: {
        black: "Black",
        silver: "Silver",
        gray: "Grey",
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

}( window.jQuery, window.wysihtml5 ); // Pass jQuery and wysihtml5 objects to the IIFE.