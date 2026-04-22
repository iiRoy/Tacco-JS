/*
 * This file contains the implementation for the Htmlbox jQuery plugin.
 * It transforms a standard HTML element into a rich-text editable area.
 *
 * Original development by doxtop@synrc.com.
 * This code is part of a larger project and provides essential
 * functionalities for content management and user input.
 */

+ function ( $ ) {

  "use strict"; // Enforce strict mode for cleaner code and fewer errors

  // Define the Htmlbox constructor function
  var Htmlbox = function ( element, options ) {

    // Initialize the target element: make it editable and mark with data-html
    this.$element = $( element )
      . attr( { 'contenteditable': true, 'data-html': true } );

    // Apply the custom CSS class specified in options
    this.$element . addClass( options . class );

    // Create the toolbar container as an unordered list
    var toolbar = $( "<ul>" )
      . attr( { 'class': options . toolbarclass } );

    // Iterate over each item defined in the toolbar options
    options . toolbar . map( function ( item ) {

      // Destructure item properties for easier access
      var icon      = item . icon;
      var cmd       = item . cmd;
      var arg       = cmd . arg;
      var ui        = cmd . ui;
      var postback; // Placeholder for a potential postback function name
      var html;     // Declared but currently unused variable

      // Ensure 'arg' is explicitly null if not provided
      if ( ! arg ) {
        arg = null;
      }

      // Ensure 'ui' (user interface) is explicitly false if not provided
      if ( ! ui ) {
        ui = false;
      }

      // Handle commands that involve dynamic data or postbacks
      if ( cmd . tag ) {

        // Retrieve potentially encoded data associated with the element
        var encoded = $( element ) . data( cmd . tag );

        // If encoded data exists, decode it and assign to 'arg'
        if ( encoded ) {
          arg = $( $( '<div>' ) . html( encoded ) [ 0 ] ) . html();
        }

        // Check for a postback function defined for this command tag
        postback = $( element ) . data( cmd . tag + 'Postback' );

        // If a postback is defined, attach a 'wire' event listener
        if ( postback ) {
          $( element ) . on( "wire", function ( ) {
            return window[ postback ]( );
          } );
        }
      }

      // Create a list item to hold the toolbar button
      var li = $( "<li>" );

      // Create the actual button element with its attributes and event handlers
      var b = $( "<button>" )
        . attr( {
          class: 'btn btn-default ' + item . class, // Base and custom classes
          tabindex: -1,                            // Prevent tabbing to the button
          type: 'button',                          // Explicitly define button type
          title: item . title                      // Tooltip text for the button
        } )
        . on( 'focus', function ( e ) {
          e . stopPropagation( ); // Prevent focus from propagating
        } )
        . on( 'click', function ( e ) {
          // Execute the rich text editing command
          document . execCommand( cmd . name, ui, arg );

          // Special handling for 'formatBlock' to ensure a new paragraph
          // is created after the block for easier continued typing.
          if ( cmd . name == 'formatBlock' ) {
            document . execCommand( 'insertHtml', false, '<p></p>' );
          }

          // If a command has a tag and a postback, trigger the 'wire' event
          if ( cmd . tag && postback ) {
            $( element ) . trigger( e = $ . Event( 'wire' ) );
          }
        } )
        . appendTo( li ); // Add the button to its list item

      // If an icon is specified, create and append the icon element
      if ( icon ) {
        $( "<i/>" ) . attr( 'class', icon )
          . addClass( 'fa fa-lg' ) // Add Font Awesome classes for styling
          . appendTo( b );
      }

      // Add the completed list item (with button and icon) to the toolbar
      li . appendTo( toolbar );

    } ); // End of toolbar item mapping

    // Insert the generated toolbar directly before the editable element
    toolbar . insertBefore( this.$element );

  }; // End of Htmlbox constructor

  // Define default options for the Htmlbox plugin
  Htmlbox . DEFAULTS = {
    class: "htmlbox",                      // Default class for the editable element
    toolbarclass: "htmlbox-toolbar nav nav-pills", // Default class for the toolbar
    toolbar: [                             // Default toolbar buttons
      { title:'image',      cmd: { name:'insertHtml', tag:'upload' }, icon: 'fa-picture-o' },
      { title:'bold',       cmd: { name:'Bold' },                     icon:'fa fa-bold'      },
      { title:'blockquote', cmd: { name:'formatBlock', arg:'blockquote' }, icon:'fa-quote-right' },
      { title:'code',       cmd: { name:'formatBlock', arg:'pre' },      icon:'fa-code'        }
    ]
  };

  // Define the jQuery plugin method `htmlbox`
  $ . fn . htmlbox = function ( settings ) {

    return this . each( function ( ) { // Iterate over each selected element

      var $this = $( this ); // Cache the current jQuery element

      // Retrieve existing Htmlbox instance data, if any
      var data = $this . data( 'htmlbox' );

      // Merge default options with data attributes and any provided settings
      var options = $ . extend( true, Htmlbox . DEFAULTS, $this . data( ), typeof option == 'object' && option );

      // If no Htmlbox instance exists for this element, create a new one
      if ( ! data ) {
        $this . data( 'htmlbox', ( data = new Htmlbox( this, options ) ) );
      }

    } ); // End of each loop

  }; // End of $.fn.htmlbox

  // Expose the Htmlbox constructor for external access
  $ . fn . htmlbox . Constructor = Htmlbox;

  // Define a noConflict method to revert `$.fn.htmlbox` if needed
  $ . fn . htmlbox . noConflict = function ( ) {
    $ . fn . htmlbox = old; // Restore the original jQuery.fn.htmlbox
    return this;           // Return the Htmlbox plugin
  };

  // Auto-initialize Htmlbox on elements with `data-edit="htmlbox"` when the window loads
  $( window ) . on( 'load', function ( ) {

    $( '[data-edit="htmlbox"]' ) . each( function ( ) { // Find all matching elements

      var $this = $( this ); // Cache the current element

      // Initialize Htmlbox on the element, passing its data attributes as options
      $this . htmlbox( $this . data( ) );

    } ); // End of each element iteration

  } ); // End of window load event handler

} ( window . jQuery ); // Pass jQuery into the immediately invoked function expression (IIFE)