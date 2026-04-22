/*
 * global angular: false
 *
 * This directive, named 'jqdialog', facilitates the creation and management of jQuery UI dialogs.
 * It provides a structured way to integrate these dialogs into an AngularJS application.
 *
 * A dedicated service will be instantiated for each dialog, accessible via a name like
 * '<dialogName>DialogService'. This service exposes methods for dialog interaction,
 * such as 'openDialog' and 'closeDialog'.
 *
 * Directive Attributes:
 * - on-open:           A callback function from the scope, invoked when the dialog is opened.
 * - on-close:          Another callback function from the scope, triggered upon dialog closure.
 * - button-classes:    A mapping of button names to CSS class names (e.g., {'OK': 'btn-primary'}).
 * - dialog-name:       The base name used to construct the dialog's dedicated service name.
 * - All standard jQuery UI dialog options are also available as direct scope attributes.
 *
 * Service Methods Provided:
 * - isOpen():          Returns a boolean indicating if the dialog is currently open.
 * - moveToTop():       Brings the dialog to the front of other UI elements.
 * - getOption(option): Retrieves the value of a specified jQuery UI dialog option.
 * - setOption(option, value): Updates a jQuery UI dialog option with a new value.
 * - openDialog(options): Initiates the dialog opening process, calls 'onOpen' if defined,
 *                        and returns a Promise that resolves when the dialog is closed.
 * - closeDialog(data): Closes the dialog and resolves the Promise returned by 'openDialog'
 *                      with the provided 'data'.
 */
( function( app ) {

  /**
   * @class JQueryDialogService
   * @description
   * Manages the state and interactions for a single jQuery UI dialog instance.
   * This service is dynamically created for each 'jqdialog' directive.
   * @param {object} $q - AngularJS promise service.
   */
  function JQueryDialogService( $q ) {
    this.q = $q;         // The promise service for deferred operations.
    this.dfd = null;     // Deferred object for the dialog's lifecycle.
    this.dialog = null;  // Reference to the jQuery dialog element.
    this.onOpen = null;  // Callback for when the dialog opens.
    this.onClose = null; // Callback for when the dialog closes.
  }

  // Define prototype methods for the JQueryDialogService.
  JQueryDialogService.prototype = {

    /**
     * Checks if the managed dialog is currently open.
     * @returns {boolean} True if the dialog is open, false otherwise.
     */
    isOpen: function() {
      return this.dialog.dialog( 'isOpen' );
    },

    /**
     * Brings the dialog to the forefront.
     */
    moveToTop: function() {
      this.dialog.dialog( 'moveToTop' );
    },

    /**
     * Retrieves the value of a specific dialog option.
     * @param {string} option - The name of the option to retrieve.
     * @returns {*} The value of the option.
     */
    getOption: function( option ) {
      return this.dialog.dialog( "option", option );
    },

    /**
     * Sets a new value for a specific dialog option.
     * @param {string} option - The name of the option to set.
     * @param {*} value - The new value for the option.
     */
    setOption: function( option, value ) {
      this.dialog.dialog( "option", option, value );
    },

    /**
     * Opens the dialog.
     * If an 'onOpen' callback is defined, it will be executed before opening.
     * Returns a promise that resolves when the dialog is closed.
     * @param {object} options - Optional arguments to pass to the onOpen callback or scope.
     * @returns {Promise} A promise that resolves with data when the dialog is closed.
     */
    openDialog: function( options ) {
      var openDfd = null, // Deferred for the onOpen callback.
          self = this;    // Reference to 'this' for use in closures.

      // Create a new deferred object for this dialog opening cycle.
      this.dfd = this.q.defer();

      // If an onOpen callback is provided, invoke it.
      if ( this.onOpen ) {
        openDfd = this.onOpen( options );
      }

      // If argsToScope is true, copy options properties to the parent scope.
      if ( this.argsToScope === true ) {
        Object.keys( options )
              .forEach( function( key ) {
                this.scope[ key ] = options[ key ];
              }, this );
      }

      // Chain the onOpen promise (if any) with the dialog opening logic.
      return ( openDfd || this.q.when() ).then( function() {
        self.dialog.dialog( 'open' ); // Open the actual jQuery UI dialog.
        return self.dfd.promise;      // Return the promise tied to the dialog's closure.
      } );
    },

    /**
     * Closes the dialog.
     * If an 'onClose' callback is defined, it will be executed.
     * Resolves the promise returned by 'openDialog' with the provided data.
     * @param {*} data - Data to resolve the dialog's promise with.
     */
    closeDialog: function( data ) {
      if ( this.onClose ) {
        this.onClose( data ); // Execute the onClose callback.
      }
      this.dialog.dialog( 'close' ); // Close the jQuery UI dialog.
      this.dfd.resolve( data );      // Resolve the deferred promise.
    }
  };


  /**
   * @directive jqdialog
   * @description
   * AngularJS directive to wrap jQuery UI dialog functionality.
   *
   * @param {array} $injector - AngularJS service injector.
   */
  app.directive( 'jqdialog', [ '$injector', function JQueryDialogDirective( $injector ) {
    'use strict';

    // Collect all standard jQuery UI dialog options, including events.
    var options = Object.keys( $.ui.dialog.prototype.options )
                        .concat( [
                          'beforeClose', 'close', 'create', 'drag', 'dragStart', 'dragStop',
                          'focus', 'open', 'resize', 'resizeStart', 'resizeStop'
                        ] );

    return {

      // Define isolated scope properties for the directive.
      // These are two-way bound to parent scope expressions.
      scope: options.reduce( function( acc, val ) {
        acc[ val ] = "&"; // Bind all jQuery UI dialog options as expression bindings.
        return acc;
      }, {
        onOpen: "&",          // Callback for dialog open event.
        onClose: "&",         // Callback for dialog close event.
        buttonClasses: "&",   // Custom CSS classes for dialog buttons.
        argsToScope: "&"      // Whether to pass openDialog arguments to parent scope.
      } ),

      restrict: 'E',           // Restrict directive to element usage (e.g., <jqdialog>).

      replace: true,           // Replace the directive's element with its template.

      transclude: true,        // Allow content inside the directive to be transcluded.

      template: '<div style="display:none"></div>', // Simple placeholder template.

      /**
       * Compile function for the directive.
       * Used to set up the service dynamically before linking.
       * @param {object} elem - The directive's element.
       * @param {object} attrs - The directive's attributes.
       * @returns {function} The link function.
       */
      compile: function( elem, attrs ) {
        var serviceName = attrs.dialogName + 'DialogService'; // Construct the service name.

        // Dynamically register the service in the compile phase.
        // This makes the service available for injection by its dynamically generated name.
        app.provide.service( serviceName, [ '$q', JQueryDialogService ] );

        /**
         * Link function for the directive.
         * Sets up the dialog instance and connects it to the service.
         * @param {object} scope - The directive's isolated scope.
         * @param {object} elem - The directive's element.
         * @param {object} attrs - The directive's attributes.
         * @param {object} ctrl - The directive's controller (not used here).
         * @param {function} transclude - The transclude function.
         */
        return function( scope, elem, attrs, ctrl, transclude ) {

          // Retrieve the dynamically created service instance.
          var service = $injector.get( serviceName ),
              // Reduce the options array into an object suitable for jQuery UI dialog.
              opts = options.reduce( function( acc, val ) {
                // Evaluate the expression bound to the scope property for this option.
                var value = scope[ val ] ? scope[ val ]() : undefined;
                if ( value !== undefined ) {
                  acc[ val ] = value; // Add the evaluated option to the accumulator.

                  // Special handling for the 'buttons' option:
                  // Replace 'close' string with the service's closeDialog method.
                  if ( val === 'buttons' ) {
                    Object.keys( value )
                          .forEach( function( buttonName ) {
                            if ( value[ buttonName ] === 'close' ) {
                              value[ buttonName ] = service.closeDialog.bind( service );
                            }
                          } );
                  }
                }
                return acc;
              }, {} ),
              // Initialize the jQuery UI dialog on the element.
              dialog = elem.dialog( opts ),
              // Find all buttons within the dialog's button set.
              buttons = dialog.parent().find( '.ui-dialog-buttonset button' );

          // Apply any custom button classes if provided.
          if ( buttons.length > 0 && scope.buttonClasses ) {
            var buttonClasses = scope.buttonClasses(); // Get the button classes map.
            if ( buttonClasses ) {
              Object.keys( buttonClasses )
                    .forEach( function( key ) {
                      // Find the button by its text and add the specified class.
                      buttons
                           .find( '.ui-button-text:contains("' + key + '")' )
                           .parent()
                           .addClass( buttonClasses[ key ] );
                    } );
            }
          }

          // Link the service instance to the actual dialog and callbacks.
          service.dialog = dialog;
          service.onOpen = scope.onOpen();
          service.onClose = scope.onClose();
          service.scope = scope.$parent;        // Provide access to the parent scope.
          service.argsToScope = scope.argsToScope(); // Set argsToScope flag.

          // Transclude the content into the dialog element.
          transclude( scope.$parent, function( clone ) {
            elem.append( clone );
          } );

        }; // End of link function
      } // End of compile function
    }; // End of return object
  } ] ); // End of app.directive call

// Attach the directive to the 'angular.jquery' module.
}( angular.module( 'angular.jquery' ) ) );