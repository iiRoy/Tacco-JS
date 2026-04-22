( function( $ ) {


  var methods = {

    // The 'init' method: Initializes the betterCheckbox plugin on selected elements.
    // It sets up the default configuration, hides the original checkbox,
    // and creates a custom styled box with a tick.
    // It also binds click and change event handlers.
    init: function( options ) {

      // Define default settings for the plugin.
      // These can be overridden by the 'options' parameter.
      var settings = $.extend( {
        boxClass       : 'betterCheckbox-box',      // CSS class for the custom checkbox box.
        tickClass      : 'betterCheckbox-tick',     // CSS class for the tick mark inside the box.
        tickInnerHTML  : '',                        // HTML content for the tick mark (e.g., an icon).
        disabledBoxClass  : 'disabled',             // CSS class for a disabled box.
        disabledTickClass : 'disabled'              // CSS class for a disabled tick.
      }, options ); // Merge default settings with user-provided options.


      // Iterate over each selected element to apply the plugin.
      return this.each( function() {

        // Store a reference to the native DOM element.
        var root = this;

        // Wrap the native DOM element with jQuery for easier manipulation.
        var $this = $( this );

        // Preserve the initial checked and disabled states of the original checkbox.
        root.checked  = root.checked;
        root.disabled = root.disabled;

        // Store the CSS classes from settings directly on the DOM element for quick access.
        root.bgclass      = settings.boxClass;
        root.tickclass    = settings.tickClass;
        root.tickinner    = settings.tickInnerHTML;
        root.disbgclass   = settings.disabledBoxClass;
        root.distickclass = settings.disabledTickClass;


        // Hide the original checkbox input element.
        $this.css( 'display', 'none' );

        // Insert the custom checkbox box element immediately after the original checkbox.
        $this.after( '<div class="' + settings.boxClass + '"></div>' );

        // Disable user selection on the custom checkbox box to prevent text highlighting.
        $this.next().css( 'user-select', 'none' );


        // If the original checkbox is initially checked,
        // append the tick mark to the custom box.
        if ( root.checked ) {
          $this.next().append( '<div class="' + settings.tickClass + '">' + settings.tickInnerHTML + '</div>' );
        }

        // If the original checkbox is initially disabled,
        // apply the disabled CSS classes to the custom box and its tick.
        if ( root.disabled ) {
          $this.next().addClass( root.disbgclass );
          $this.next().children().addClass( root.distickclass );
        }


        // Attach a click event handler to the custom checkbox box.
        $this.next().on( 'click', function() {

          // Only proceed if the checkbox is not disabled.
          if ( ! root.disabled ) {

            // If the checkbox is currently checked, uncheck it.
            if ( root.checked ) {

              // Remove the tick mark.
              $( this ).empty();

              // Update the internal state and the original checkbox's property.
              root.checked = false;
              $this.prop( 'checked', false );

            } else { // If the checkbox is currently unchecked, check it.

              // Add the tick mark.
              $( this ).append( '<div class="' + settings.tickClass + '">' + settings.tickInnerHTML + '</div>' );

              // Update the internal state and the original checkbox's property.
              root.checked = true;
              $this.prop( 'checked', true );

            } // End of checked/unchecked toggle.
          } // End of disabled check.
        } ); // End of click event handler.


        // Attach a change event handler to the original checkbox.
        // This handles cases where the state might change programmatically or via form reset.
        $this.on( 'change', function() {

          // This logic seems to mirror the click handler, ensuring visual consistency.
          if ( ! root.checked ) {

            // If the original checkbox is now unchecked, clear the custom tick.
            $this.next().empty();
            root.checked = false;
            $this.prop( 'checked', false );

          } else {

            // If the original checkbox is now checked, add the custom tick.
            $this.next().append( '<div class="' + settings.tickClass + '">' + settings.tickInnerHTML + '</div>' );
            root.checked = true;
            $this.prop( 'checked', true );

          } // End of checked/unchecked toggle for change event.
        } ); // End of change event handler.


        return this; // Return the original DOM element to maintain chainability for 'each'.

      } ); // End of this.each loop.
    }, // End of 'init' method.


    // The 'destroy' method: Reverts the checkbox to its original state.
    // It makes the original input visible again and removes the custom box.
    destroy: function() {
      return this.each( function() {

        var root  = this; // Reference to the native DOM element.
        var $this = $( this ); // jQuery wrapper for the element.

        // Make the original checkbox visible.
        $this.css( 'display', 'inline-block' );

        // Remove the custom checkbox box that was added.
        $this.next().remove();

        return this; // Maintain chainability.
      } );
    }, // End of 'destroy' method.


    // The 'disable' method: Disables the custom checkbox.
    // It applies disabled classes and updates the original checkbox's disabled property.
    disable: function() {
      return this.each( function() {

        var root  = this;
        var $this = $( this );

        // Add disabled classes to the custom box and its tick.
        $this.next().addClass( root.disbgclass );
        $this.next().children().addClass( root.distickclass );

        // Update the disabled state of the original checkbox.
        root.disabled = true;
        $this.prop( 'disabled', true );

        return this;
      } );
    }, // End of 'disable' method.


    // The 'enable' method: Enables the custom checkbox.
    // It removes disabled classes and updates the original checkbox's disabled property.
    enable: function() {
      return this.each( function() {

        var root  = this;
        var $this = $( this );

        // Remove disabled classes from the custom box and its tick.
        $this.next().removeClass( root.disbgclass );
        $this.next().children().removeClass( root.distickclass );

        // Update the disabled state of the original checkbox.
        root.disabled = false;
        $this.prop( 'disabled', false );

        return this;
      } );
    }, // End of 'enable' method.


    // The 'check' method: Programmatically checks the custom checkbox.
    // It adds the tick mark and updates the original checkbox's checked property.
    check: function() {
      return this.each( function() {

        var root  = this;
        var $this = $( this );

        // Append the tick mark to the custom box.
        $this.next().append( '<div class="' + root.tickclass + '">' + root.tickinner + '</div>' );

        // If the checkbox is disabled, ensure the tick also shows disabled styling.
        if ( root.disabled ) {
          $this.next().children().addClass( root.distickclass );
        }

        // Update the checked state of the original checkbox.
        root.checked = true;
        $this.prop( 'checked', true );

        return this;
      } );
    }, // End of 'check' method.


    // The 'uncheck' method: Programmatically unchecks the custom checkbox.
    // It removes the tick mark and updates the original checkbox's checked property.
    uncheck: function() {
      return this.each( function() {

        var root  = this;
        var $this = $( this );

        // Remove the tick mark from the custom box.
        $this.next().empty();

        // Update the checked state of the original checkbox.
        root.checked = false;
        $this.prop( 'checked', false );

        return this;
      } );
    } // End of 'uncheck' method.

  }; // End of 'methods' object.


  // Define the jQuery plugin 'betterCheckbox'.
  // This is the entry point for users to interact with the plugin.
  $.fn.betterCheckbox = function( method ) {

    // Check if the requested method exists in our 'methods' object.
    if ( methods[method] ) {

      // If it exists, call the method and pass any additional arguments.
      // 'Array.prototype.slice.call( arguments, 1 )' extracts arguments after the method name.
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );

    } else if ( typeof method === 'object' || ! method ) {

      // If 'method' is an object (meaning it's the 'options' for init)
      // or if no method is specified, call the 'init' method.
      return methods.init.apply( this, arguments );

    } else {

      // If an unknown method is requested, throw an error.
      $.error( 'Method ' + method + ' does not exist on jQuery.betterCheckbox' );

    }

  }; // End of $.fn.betterCheckbox plugin definition.


} )( jQuery ); // Immediately-invoked function expression (IIFE) to encapsulate the plugin.