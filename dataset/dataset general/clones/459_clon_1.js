/*
 *  This code provides a JavaScript implementation for a WordPress editor.
 *
 *  Original Author:    Ante Primorac
 *  Author URI:         http://anteprimorac.from.hr
 *  Version:            1.1
 *
 *  License Agreement:
 *  Copyright (c) 2013 Ante Primorac
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *
 *  Usage Guidelines:
 *  Server-side (WordPress PHP integration):
 *      Call `js_wp_editor( $settings );` to enqueue necessary scripts and styles.
 *  Client-side (jQuery plugin invocation):
 *      Initialize on a textarea element: `$('textarea').wp_editor( options );`
 */

; ( function ( $, window ) {

  // Extend jQuery's prototype to add the `wp_editor` function.
  $.fn.wp_editor = function ( options ) {

    // Display a warning if the selected element is not a textarea.
    if ( ! $(this).is('textarea') ) {
      console.warn('The target element for `wp_editor` must be a textarea.');
    }

    // Check for the presence of essential global WordPress objects.
    // These are typically defined by `wp_editor()` in PHP.
    if ( typeof tinyMCEPreInit == 'undefined' || typeof QTags == 'undefined' || typeof ap_vars == 'undefined' ) {
      console.warn('Required WordPress global variables (tinyMCEPreInit, QTags, ap_vars) are not available. ' +
                   'Ensure `js_wp_editor( $settings );` has been properly loaded.');
    }

    // Exit early if the fundamental requirements are not met.
    // This prevents errors and ensures the plugin only runs in a valid context.
    if ( ! $(this).is('textarea') ||
         typeof tinyMCEPreInit == 'undefined' ||
         typeof QTags == 'undefined' ||
         typeof ap_vars == 'undefined' ) {
      return this; // Return the jQuery object for method chaining.
    }


    // Define the default configuration for the WordPress editor.
    // This object closely mirrors the settings used by WordPress itself.
    var default_options = {
      'mode': 'html', // Initial editor mode: 'html' (text) or 'tmce' (visual).
      'mceInit': {
        "theme":              "modern",
        "skin":               "lightgray",
        "language":           "en",
        "formats": {
          "alignleft": [
            {
              "selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",
              "styles":   {"textAlign": "left"},
              "deep":     false,
              "remove":   "none"
            },
            {
              "selector": "img,table,dl.wp-caption",
              "classes":  ["alignleft"],
              "deep":     false,
              "remove":   "none"
            }
          ],
          "aligncenter": [
            {
              "selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",
              "styles":   {"textAlign": "center"},
              "deep":     false,
              "remove":   "none"
            },
            {
              "selector": "img,table,dl.wp-caption",
              "classes":  ["aligncenter"],
              "deep":     false,
              "remove":   "none"
            }
          ],
          "alignright": [
            {
              "selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",
              "styles":   {"textAlign": "right"},
              "deep":     false,
              "remove":   "none"
            },
            {
              "selector": "img,table,dl.wp-caption",
              "classes":  ["alignright"],
              "deep":     false,
              "remove":   "none"
            }
          ],
          "strikethrough": {"inline": "del", "deep": true, "split": true}
        },
        "relative_urls":              false,
        "remove_script_host":         false,
        "convert_urls":               false,
        "browser_spellcheck":         true,
        "fix_list_elements":          true,
        "entities":                   "38,amp,60,lt,62,gt",
        "entity_encoding":            "raw",
        "keep_styles":                false,
        "paste_webkit_styles":        "font-weight font-style color",
        "preview_styles":             "font-family font-size font-weight font-style text-decoration text-transform",
        "wpeditimage_disable_captions": false,
        "wpeditimage_html5_captions":   false,
        "plugins":                    "charmap,hr,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpeditimage,wpgallery,wplink,wpdialogs,wpview,image",
        "content_css":                ap_vars.includes_url + "css/dashicons.css?ver=3.9," +
                                      ap_vars.includes_url + "js/mediaelement/mediaelementplayer.min.css?ver=3.9," +
                                      ap_vars.includes_url + "js/mediaelement/wp-mediaelement.css?ver=3.9," +
                                      ap_vars.includes_url + "js/tinymce/skins/wordpress/wp-content.css?ver=3.9",
        "selector":                   "#apid", // Placeholder ID for dynamic replacement.
        "resize":                     "vertical",
        "menubar":                    false,
        "wpautop":                    true,
        "indent":                     false,
        "toolbar1":                   "bold,italic,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_more,spellchecker,fullscreen,wp_adv",
        "toolbar2":                   "formatselect,underline,alignjustify,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help",
        "toolbar3":                   "",
        "toolbar4":                   "",
        "tabfocus_elements":          ":prev,:next",
        "body_class":                 "apid" // Placeholder class for dynamic replacement.
      }
    },
    // Regular expression to find and replace the placeholder ID 'apid' globally.
    id_regexp = new RegExp( 'apid', 'g' );


    // If WordPress has already provided a default 'apid' configuration for TinyMCE,
    // use it as the base for our editor's settings.
    if ( tinyMCEPreInit.mceInit['apid'] ) {
      default_options.mceInit = tinyMCEPreInit.mceInit['apid'];
    }


    // Deep merge the default options with any user-provided options.
    // This allows custom settings to override or extend the defaults.
    options = $.extend( true, default_options, options );


    // Iterate over each selected textarea element to initialize an editor instance.
    return this.each( function () {

      // Perform a final check to ensure the current element is a textarea.
      if ( ! $(this).is('textarea') ) {
        console.warn('Editor initialization skipped for a non-textarea element within the selection.');
      } else {

        // Get the unique ID of the current textarea. This is critical for TinyMCE.
        var current_id = $(this).attr('id');

        // Dynamically update any occurrences of the placeholder 'apid' within the
        // TinyMCE initialization settings with the actual ID of the textarea.
        $.each( options.mceInit, function ( key, value ) {
          // Only process string values to avoid errors with other data types.
          if ( $.type( value ) == 'string' ) {
            options.mceInit[key] = value.replace( id_regexp, current_id );
          }
        } );

        // Ensure the editor mode is either 'tmce' (visual) or 'html' (text).
        options.mode = options.mode == 'tmce' ? 'tmce' : 'html';

        // Store the finalized TinyMCE initialization settings in the global `tinyMCEPreInit` object.
        // TinyMCE will retrieve these settings when it's initialized for `current_id`.
        tinyMCEPreInit.mceInit[current_id] = options.mceInit;

        // Add a specific class to the textarea and ensure it's visible.
        $(this).addClass('wp-editor-area').show();

        // Keep a reference to the current textarea element, which might change if re-wrapped.
        var self = this;

        // Handle cases where the textarea is already inside an existing WordPress editor wrap.
        // This ensures the old wrap is removed and the textarea is properly re-initialized.
        if ( $(this).closest('.wp-editor-wrap').length ) {
          var parent_el = $(this).closest('.wp-editor-wrap').parent();
          $(this).closest('.wp-editor-wrap').before($(this).clone());
          $(this).closest('.wp-editor-wrap').remove();
          self = parent_el.find('textarea[id="' + current_id + '"]');
        }


        // Construct the various UI components that make up the WordPress editor.
        var wrap                  = $('<div id="wp-' + current_id + '-wrap" class="wp-core-ui wp-editor-wrap ' + options.mode + '-active" />'),
            editor_tools          = $('<div id="wp-' + current_id + '-editor-tools" class="wp-editor-tools hide-if-no-js" />'),
            editor_tabs           = $('<div class="wp-editor-tabs" />'),
            switch_editor_html    = $('<a id="' + current_id + '-html" class="wp-switch-editor switch-html" onclick="switchEditors.switchto(this);">Text</a>'),
            switch_editor_tmce    = $('<a id="' + current_id + '-tmce" class="wp-switch-editor switch-tmce" onclick="switchEditors.switchto(this);">Visual</a>'),
            media_buttons         = $('<div id="wp-' + current_id + '-media-buttons" class="wp-media-buttons" />'),
            insert_media_button   = $('<a href="#" id="insert-media-button" class="button insert-media add_media" data-editor="' + current_id + '" title="Add Media"><span class="wp-media-buttons-icon"></span> Add Media</a>'),
            editor_container      = $('<div id="wp-' + current_id + '-editor-container" class="wp-editor-container" />'),
            // The original code had this line commented out, so it remains commented.
            content_css           = /*Object.prototype.hasOwnProperty.call(tinyMCEPreInit.mceInit[current_id], 'content_css') ? tinyMCEPreInit.mceInit[current_id]['content_css'].split(',') :*/ false;


        // Append the media button to its container.
        insert_media_button.appendTo( media_buttons );
        // Append media buttons to the editor tools.
        media_buttons.appendTo( editor_tools );

        // Append editor mode switch tabs to their container.
        switch_editor_html.appendTo( editor_tabs );
        switch_editor_tmce.appendTo( editor_tabs );
        // Append tabs to the editor tools.
        editor_tabs.appendTo( editor_tools );

        // Append tools and the editor container to the main wrapper.
        editor_tools.appendTo( wrap );
        editor_container.appendTo( wrap );

        // Clone the textarea and place the clone inside the new editor container.
        editor_container.append( $(self).clone().addClass('wp-editor-area') );

        // If 'content_css' was defined (though it's currently hardcoded to false),
        // iterate and add any specified stylesheets to the document head.
        if ( content_css != false ) {
          $.each( content_css, function () {
            // Avoid adding duplicate stylesheet links.
            if ( ! $('link[href="' + this + '"]').length ) {
              $(self).before('<link rel="stylesheet" type="text/css" href="' + this + '">');
            }
          } );
        }

        // Add the primary stylesheet for editor buttons and UI.
        $(self).before('<link rel="stylesheet" id="editor-buttons-css" href="' + ap_vars.includes_url + 'css/editor.css" type="text/css" media="all">');

        // Insert the newly constructed editor wrapper before the original textarea.
        $(self).before( wrap );
        // Remove the original textarea element, as it's now replaced by the wrapper.
        $(self).remove();

        // Initialize Quicktags for the current editor instance.
        new QTags( current_id );
        // Initialize the Quicktags buttons.
        QTags._buttonsInit();
        // Set the initial editor mode (visual or text).
        switchEditors.go( current_id, options.mode );


        // Attach a click event handler to the "Add Media" button within the editor wrap.
        $(wrap).on( 'click', '.insert-media', function ( event ) {
          var elem    = $( event.currentTarget ),
              editor  = elem.data('editor'),
              // Define the options for the WordPress media frame.
              options = {
                frame:    'post',       // Use the 'post' media frame.
                state:    'insert',     // Default state is 'insert' media.
                title:    wp.media.view.l10n.addMedia, // Localized title for the media modal.
                multiple: true          // Allow selection of multiple media items.
              };

          event.preventDefault(); // Prevent the default action of the link.

          elem.blur(); // Remove focus from the clicked button.

          // If the button has the 'gallery' class, adjust options for gallery creation.
          if ( elem.hasClass('gallery') ) {
            options.state = 'gallery';
            options.title = wp.media.view.l10n.createGalleryTitle;
          }

          // Open the WordPress media uploader with the defined options.
          wp.media.editor.open( editor, options );
        }); // End of '.insert-media' click handler.

      } // End of the 'else' block for the textarea check.
    }); // End of the `.each()` iterator function.

  }; // End of `$.fn.wp_editor` function definition.

})( jQuery, window ); // End of the Immediately Invoked Function Expression (IIFE).