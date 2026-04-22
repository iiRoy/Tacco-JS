angular.module ( 'fundoo.services' , [ ] ) .factory ( 'createDialog' ,
  [
    "$document" ,
    "$compile" ,
    "$rootScope" ,
    "$controller" ,
    "$timeout" ,

    /* Injecting Angular's core services */
    function (
      $document ,
      $compile ,
      $rootScope ,
      $controller ,
      $timeout
    )
    {
      // Default configuration options for the dialog.
      // These can be overridden by the caller.
      var defaults =
      {
        id            : null ,                // Unique identifier for the dialog
        template      : null ,                // Inline HTML template content
        templateUrl   : null ,                // URL for an external HTML template
        title         : 'Default Title' ,     // Title displayed in the dialog header
        backdrop      : true ,                // Show a backdrop behind the dialog
        success       :                       // Configuration for the success button
        {
          label : 'OK' ,                      // Text label for the success button
          fn    : null                        // Function to call on success click
        } ,
        cancel        :                       // Configuration for the cancel button
        {
          label : 'Close' ,                   // Text label for the cancel button
          fn    : null                        // Function to call on cancel click
        } ,
        controller    : null ,                // Controller for the dialog's scope
        backdropClass : "modal-backdrop" ,    // CSS class for the backdrop element
        backdropCancel: true ,                // Allow closing dialog by clicking backdrop
        footerTemplate: null ,                // Custom HTML for the dialog footer
        modalClass    : "modal" ,             // CSS class for the main modal element
        css           :                       // Inline CSS styles for the modal
        {
          top   : '100px' ,
          left  : '30%' ,
          margin: '0 auto'
        }
      };


      // Find the document's body element once.
      var body = $document.find ( 'body' );


      /**
       * The main Dialog constructor function returned by the factory.
       * This function creates and manages a modal dialog.
       *
       * @param {string|object} templateUrl - URL of the template, or options object if template is omitted.
       * @param {object} options - Configuration options for the dialog.
       * @param {object} passedInLocals - Local variables to pass to the controller.
       * @returns {void}
       */
      return function Dialog (
        templateUrl /* optional */ ,
        options ,
        passedInLocals
      ) {

        // Handle cases where `templateUrl` might be the `options` object.
        // This allows for a more flexible API where `templateUrl` can be omitted.
        if ( angular.isObject ( templateUrl ) )
        {
          passedInLocals  = options ;       // Shift arguments if templateUrl is actually the options object.
          options         = templateUrl ;   // Assign the first argument to options.
        }
        else
        {
          options.templateUrl = templateUrl ; // If it's a string, it's definitely the templateUrl.
        }


        // Merge default options with user-provided options.
        // User options will override defaults.
        options = angular.extend ( { } , defaults , options ) ;


        var key ; // Loop variable for iterating over CSS properties.

        // Generate the 'id' attribute for the modal if an ID is provided in options.
        var idAttr = options.id
          ? ' id="' + options.id + '" '
          : '' ;


        // Default footer HTML for the modal, including success and cancel buttons.
        var defaultFooter =
          '<button class="btn" ng-click="$modalCancel()">{{$modalCancelLabel}}</button>' +
          '<button class="btn btn-primary" ng-click="$modalSuccess()">{{$modalSuccessLabel}}</button>' ;


        // Construct the footer template. If a custom footerTemplate is provided in options, use it;
        // otherwise, fall back to the default footer.
        var footerTemplate =
          '<div class="modal-footer">' +
          ( options.footerTemplate || defaultFooter ) +
          '</div>' ;


        // Immediately-invoked function expression (IIFE) to generate the modal body HTML.
        var modalBody = ( function ( )
        {
          if ( options.template )
          {
            if ( angular.isString ( options.template ) )
            {
              // If the template is a simple string, embed it directly.
              return '<div class="modal-body">' + options.template + '</div>' ;
            }
            else
            {
              // If it's a jQuery/JQlite wrapped object, extract its HTML content.
              return '<div class="modal-body">' + options.template.html ( ) + '</div>' ;
            }
          }
          else
          {
            // If a template URL is provided, use ng-include to load it dynamically.
            return '<div class="modal-body" ng-include="\'' + options.templateUrl + '\'"></div>'
          }
        } ) ( ) ;


      // Construct the main modal element using Angular's `angular.element`.
      // This includes the header, body (generated above), and footer.
      var modalEl = angular.element (
        '<div class="' + options.modalClass + ' fade"' + idAttr + ' style="display: block;">' +
        '  <div class="modal-dialog">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <button type="button" class="close" ng-click="$modalCancel()">&times;</button>' +
        '        <h2>{{$title}}</h2>' +
        '      </div>' +
        modalBody +
        footerTemplate +
        '    </div>' +
        '  </div>' +
        '</div>'
      ) ;


      // Apply custom CSS styles defined in options.css to the modal element.
      for ( key in options.css )
      {
        modalEl.css ( key , options.css [ key ] ) ;
      }


      // Start building the HTML for the backdrop element.
      var divHTML = "<div " ;
      if ( options.backdropCancel )
      {
        // If backdropCancel is true, clicking the backdrop will trigger cancellation.
        divHTML += 'ng-click="$modalCancel()"' ;
      }
      divHTML += ">" ;


      // Create the backdrop element using the constructed HTML.
      var backdropEl = angular.element ( divHTML ) ;
      backdropEl.addClass ( options.backdropClass ) ; // Add the configured backdrop class.
      backdropEl.addClass ( 'fade in' ) ;              // Add fade-in classes.


      /**
       * Event handler for keyboard key presses.
       * If the 'Escape' key (keyCode 27) is pressed, the modal will be cancelled.
       * @param {Event} event - The keyboard event object.
       */
      var handleEscPressed = function ( event )
      {
        if ( event.keyCode === 27 )
        {
          scope.$modalCancel ( ) ; // Call the modal's cancel function.
        }
      } ;


      /**
       * Function to close and remove the modal from the DOM.
       * It also unbinds the keyboard event listener.
       */
      var closeFn = function ( )
      {
        body.unbind ( 'keydown' , handleEscPressed ) ; // Remove the escape key listener.
        modalEl.remove ( ) ;                           // Remove the modal element.
        if ( options.backdrop )
        {
          backdropEl.remove ( ) ;                      // Remove the backdrop if it was used.
        }
      } ;


      // Bind the escape key handler to the document body.
      body.bind ( 'keydown' , handleEscPressed ) ;


      var ctrl ; // Variable to hold the dialog's controller instance.
      var locals ; // Variable to hold local dependencies for the controller.

      // Create a new child scope for the modal, inheriting from $rootScope,
      // or use a custom scope if provided in options.
      var scope = options.scope || $rootScope.$new ( ) ;


      // Expose the dialog's title to the scope.
      scope.$title = options.title ;
      // Expose the close function to the scope.
      scope.$modalClose = closeFn ;

      /**
       * Function called when the modal's cancel action is triggered.
       * It executes the user-defined cancel function (if any) and then closes the modal.
       */
      scope.$modalCancel = function ( )
      {
        var callFn = options.cancel.fn || closeFn ; // Use user's cancel function or default close.
        callFn.call ( this ) ;                       // Execute the cancel function.
        scope.$modalClose ( ) ;                      // Close the modal.
      } ;

      /**
       * Function called when the modal's success action is triggered.
       * It executes the user-defined success function (if any) and then closes the modal.
       */
      scope.$modalSuccess = function ( )
      {
        var callFn = options.success.fn || closeFn ; // Use user's success function or default close.
        callFn.call ( this ) ;                       // Execute the success function.
        scope.$modalClose ( ) ;                      // Close the modal.
      } ;

      // Expose button labels to the scope for display.
      scope.$modalSuccessLabel  = options.success.label ;
      scope.$modalCancelLabel   = options.cancel.label ;


      // If a controller is specified, instantiate it.
      if ( options.controller )
      {
        // Extend locals with the modal's scope and any passed-in locals.
        locals = angular.extend ( { $scope : scope } , passedInLocals ) ;
        // Instantiate the controller using $controller service.
        ctrl = $controller ( options.controller , locals ) ;
        // Attach the controller instance to the modal element's data for potential access.
        modalEl.contents ( ) .data ( '$ngControllerController' , ctrl ) ;
      }


      // Compile the modal element against the dialog's scope.
      $compile ( modalEl ) ( scope ) ;
      // Compile the backdrop element against the dialog's scope.
      $compile ( backdropEl ) ( scope ) ;


      // Append the compiled modal element to the document body.
      body.append ( modalEl ) ;
      // If a backdrop is required, append it to the body as well.
      if ( options.backdrop ) body.append ( backdropEl ) ;


      // Use $timeout to add the 'in' class after a short delay, enabling CSS transitions.
      $timeout ( function ( )
      {
        modalEl.addClass ( 'in' ) ;
      } , 200 ) ;

    }
  ]
) ;