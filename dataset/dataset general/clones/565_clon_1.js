/*
 * This file contains the setup for Knockout.js Bootstrap bindings.
 * It's a utility function that registers custom binding handlers.
 * Version: 1.0.0
 *
 * This module is designed to integrate Knockout.js with various Bootstrap components,
 * providing custom binding handlers for enhanced UI functionality.
 */
function setupKoBootstrap ( koObject, $ ) {

  "use strict" ; // Enforce strict mode for cleaner code.

  // UUID generation logic.
  // Note: This GUID generation is not compliant with RFC4122 standards,
  // but it's sufficient for local, non-cryptographic unique identifiers.
  var guid = ( function ( s4 ) {

    // The returned function generates a GUID string.
    return function ( ) {
      return s4( ) + s4( ) + '-' + s4( ) + '-' + s4( ) + '-' + s4( ) + '-' + s4( ) + s4( ) + s4( ) ;
    } ;

  } ) ( function ( ) {

    // Helper function to generate a random 4-character hexadecimal string.
    return Math.floor( ( 1 + Math.random( ) ) * 0x10000 )
      .toString( 16 )
      .substring( 1 ) ;

  } ) ;


  // Ensure jQuery has an 'outerHtml' method.
  // This is a polyfill for cases where it might be missing,
  // providing a consistent way to get an element's outer HTML.
  if ( ! $.fn.outerHtml ) {

    $.fn.outerHtml = function ( ) {

      // Check if the jQuery object contains any elements.
      if ( this.length === 0 ) {
        return false ;
      }

      var elem = this[ 0 ], // Get the raw DOM element.
          name = elem.tagName.toLowerCase( ) ; // Get the tag name in lowercase.

      // If the browser natively supports outerHTML, use it directly.
      if ( elem.outerHTML ) {
        return elem.outerHTML ;
      }

      // Fallback for browsers without native outerHTML support.
      // Manually construct the attribute string.
      var attrs = $.map( elem.attributes, function ( i ) {
        return i.name + '="' + i.value + '"' ;
      } ) ;

      // Construct the outer HTML string manually.
      return "<" + name + ( attrs.length > 0 ? " " + attrs.join( " " ) : "" ) + ">" + elem.innerHTML + "</" + name + ">" ;

    } ;

  }


  // Binding handler for Twitter Typeahead integration.
  // This allows Knockout observables to drive Typeahead's suggestions.
  koObject.bindingHandlers.typeahead = {

    init : function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {

      var $element = $( element ) ;
      var allBindings = allBindingsAccessor( ) ;

      // Helper function to create a substring matcher for Typeahead.
      // It takes an array of strings and returns a function that Typeahead can use as a source.
      var substringMatcher = function ( strs ) {

        return function findMatches ( q, cb ) {

          var matches,
              substrRegex ;

          // Initialize an array to store matching suggestions.
          matches = [ ] ;

          // Create a regular expression for case-insensitive substring matching.
          substrRegex = new RegExp( q, 'i' ) ;

          // Iterate over the provided strings and find matches.
          $.each( strs, function ( i, str ) {

            if ( substrRegex.test( str ) ) {
              // The Typeahead jQuery plugin expects suggestions to be objects
              // with a 'value' property.
              matches.push( { value : str } ) ;
            }

          } ) ;

          // Call the callback function with the found matches.
          cb( matches ) ;

        } ; // End of findMatches function.

      } ; // End of substringMatcher function.


      // Configure Typeahead options, starting with the data source.
      var typeaheadOpts = {
        source : substringMatcher( koObject.utils.unwrapObservable( valueAccessor( ) ) )
      } ;


      // Apply additional options if provided via the 'typeaheadOptions' binding.
      if ( allBindings.typeaheadOptions ) {

        $.each( allBindings.typeaheadOptions, function ( optionName, optionValue ) {
          typeaheadOpts[ optionName ] = koObject.utils.unwrapObservable( optionValue ) ;
        } ) ;

      }

      // Initialize the Typeahead plugin on the element.
      // Disable native browser autocomplete and set core Typeahead features.
      $element.attr( "autocomplete", "off" ).typeahead( {
        hint      : true,
        highlight : true,
        minLength : 1
      }, typeaheadOpts ) ;

    } // End of init function for typeahead.

  } ;


  // Binding handler for Bootstrap Progress bars.
  // This allows dynamic updating of progress bar width based on a Knockout observable.
  koObject.bindingHandlers.progress = {

    init : function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {

      var $element = $( element ) ;

      // Create the inner progress bar element.
      var bar = $( '<div/>', {
        'class'     : 'progress-bar',
        'data-bind' : 'style: { width:' + valueAccessor( ) + ' }' // Bind width to the observable.
      } ) ;

      // Set a unique ID, add Bootstrap progress classes, and append the bar.
      $element.attr( 'id', guid( ) )
        .addClass( 'progress progress-info' )
        .append( bar ) ;

      // Apply bindings to the descendants of the progress bar element.
      // This is crucial if the 'data-bind' on the bar itself uses Knockout syntax.
      koObject.applyBindingsToDescendants( viewModel, $element[ 0 ] ) ;

    } // End of init function for progress.

  } ;


  // Binding handler for Bootstrap Alerts.
  // Facilitates displaying dynamic alert messages with severity and dismiss functionality.
  koObject.bindingHandlers.alert = {

    init : function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {

      var $element = $( element ) ;
      var alertInfo = koObject.utils.unwrapObservable( valueAccessor( ) ) ; // Get alert data.

      // Create the dismiss button for the alert (the 'x' icon).
      var dismissBtn = $( '<button/>', {
        'type'         : 'button',
        'class'        : 'close',
        'data-dismiss' : 'alert' // Bootstrap attribute for dismissible alerts.
      } ).html( '&times;' ) ;

      // Create the paragraph element for the alert message content.
      var alertMessage = $( '<p/>' ).html( alertInfo.message ) ;

      // Add appropriate Bootstrap alert classes based on priority (e.g., 'alert-danger', 'alert-success').
      // Then append the dismiss button and the message content.
      $element.addClass( 'alert alert-' + alertInfo.priority )
        .append( dismissBtn )
        .append( alertMessage ) ;

    } // End of init function for alert.

  } ;


  // Binding handler for Bootstrap Tooltips.
  // Provides dynamic tooltip functionality, including reactive title updates.
  koObject.bindingHandlers.tooltip = {

    update : function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {

      var $element,
          options,
          tooltip,
          subsc ; // Subscription handle for observable titles.

      options = koObject.utils.unwrapObservable( valueAccessor( ) ) ;
      $element = $( element ) ;

      // Check if the tooltip's title is an observable.
      // If it is, set up a subscription to automatically update the tooltip when the title changes.
      if ( koObject.isObservable( options.title ) ) {

        var isToolTipVisible = false ; // Track tooltip visibility.

        // Event listener for when the tooltip is shown.
        $element.on( 'show.bs.tooltip', function ( ) {
          isToolTipVisible = true ;
        } ) ;

        // Event listener for when the tooltip is hidden.
        $element.on( 'hide.bs.tooltip', function ( ) {
          isToolTipVisible = false ;
        } ) ;

        // Store original animation setting; Bootstrap's default is 'true'.
        var origAnimation = options.animation || true ;

        // Subscribe to changes in the title observable.
        subsc = options.title.subscribe( function ( ) {

          if ( isToolTipVisible ) {
            // Temporarily disable animation to prevent visual flickering during update.
            $element.data( 'bs.tooltip' ).options.animation = false ;
            $element.tooltip( 'fixTitle' ) // Call this method to update the title content.
              .tooltip( 'show' ) ;         // Re-show the tooltip to reflect the change.
            $element.data( 'bs.tooltip' ).options.animation = origAnimation ; // Restore original animation setting.
          }

        } ) ;

      }

      // Get existing tooltip instance data from the element, if any.
      tooltip = $element.data( 'bs.tooltip' ) ;

      if ( tooltip ) {
        // If a tooltip instance already exists, extend its options with new ones.
        $.extend( tooltip.options, options ) ;
      } else {
        // Otherwise, initialize a new Bootstrap tooltip.
        $element.tooltip( options ) ;
      }

      // Add a disposal callback for cleanup when the element is removed from the DOM.
      koObject.utils.domNodeDisposal.addDisposeCallback( element, function ( ) {
        // Dispose of the observable subscription if it exists.
        if ( subsc ) {
          subsc.dispose( ) ;
        }
        $element.tooltip( 'destroy' ) ; // Destroy the Bootstrap tooltip instance.
      } ) ;

    } // End of update function for tooltip.

  } ;


  // Binding handler for Bootstrap Popovers.
  // Supports dynamic content, including Knockout templates within the popover.
  koObject.bindingHandlers.popover = {

    init : function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {

      var $element = $( element ) ;
      var popoverBindingValues = koObject.utils.unwrapObservable( valueAccessor( ) ) ;

      var template = popoverBindingValues.template || false ; // Optional: Knockout template name.
      var options = popoverBindingValues.options || { title : 'popover' } ; // Popover configuration.
      var data = popoverBindingValues.data || false ; // Optional: data for the Knockout template.

      // If a template is specified, configure the popover content accordingly.
      if ( template !== false ) {

        if ( data ) {
          // If data is provided, use a Knockout template binding for content.
          options.content = "<!-- ko template: { name: template, if: data, data: data } --><!-- /ko -->" ;
        } else {
          // Otherwise, fetch content directly from the template element's HTML.
          options.content = $( '#' + template ).html( ) ;
        }

        options.html = true ; // Ensure HTML content is rendered within the popover.

      }

      // Event handler for when the popover is fully shown (after CSS transitions).
      $element.on( 'shown.bs.popover', function ( event ) {

        var popoverData = $( event.target ).data( ) ;
        var popoverEl = popoverData[ 'bs.popover' ].$tip ; // The actual popover DOM element.
        var options = popoverData[ 'bs.popover' ].options || { } ;
        var button = $( event.target ) ;
        var buttonPosition = button.position( ) ;
        var buttonDimensions = {
          x : button.outerWidth( ),
          y : button.outerHeight( )
        } ;

        // Apply Knockout bindings to the popover's content.
        if ( data ) {
          koObject.applyBindings( { template : template, data : data }, popoverEl[ 0 ] ) ;
        } else {
          // If no specific data is given, bind the popover to the current viewModel.
          koObject.applyBindings( viewModel, popoverEl[ 0 ] ) ;
        }

        var popoverDimensions = {
          x : popoverEl.outerWidth( ),
          y : popoverEl.outerHeight( )
        } ;

        // Attach click handler to any dismiss buttons within the popover.
        popoverEl.find( 'button[data-dismiss="popover"]' ).click( function ( ) {
          button.popover( 'hide' ) ; // Hide the popover when its dismiss button is clicked.
        } ) ;

        // Adjust popover position manually based on its 'placement' option.
        // This is often needed for dynamic content that changes popover size after initial placement.
        switch ( options.placement ) {

          case 'right' :
            popoverEl.css( {
              left : buttonDimensions.x + buttonPosition.left,
              top  : ( buttonDimensions.y / 2 + buttonPosition.top ) - popoverDimensions.y / 2
            } ) ;
            break ;

          case 'left' :
            popoverEl.css( {
              left : buttonPosition.left - popoverDimensions.x,
              top  : ( buttonDimensions.y / 2 + buttonPosition.top ) - popoverDimensions.y / 2
            } ) ;
            break ;

          case 'top' :
            popoverEl.css( {
              left : buttonPosition.left + ( buttonDimensions.x / 2 - popoverDimensions.x / 2 ),
              top  : buttonPosition.top - popoverDimensions.y
            } ) ;
            break ;

          case 'bottom' :
            popoverEl.css( {
              left : buttonPosition.left + ( buttonDimensions.x / 2 - popoverDimensions.x / 2 ),
              top  : buttonPosition.top + buttonDimensions.y
            } ) ;
            break ;

        } // End of switch statement for placement.

      } ) ; // End of 'shown.bs.popover' event handler.

      // Initialize the Bootstrap Popover plugin on the element.
      $element.popover( options ) ;

      // Add a disposal callback for cleanup when the element is removed.
      koObject.utils.domNodeDisposal.addDisposeCallback( element, function ( ) {
        $element.popover( 'destroy' ) ; // Destroy the Bootstrap popover instance.
      } ) ;

      return { controlsDescendantBindings : true } ; // Prevent Knockout from binding descendants directly.

    } // End of init function for popover.

  } ;


  // Binding handler for Bootstrap Modals.
  // Allows triggering modals with dynamic content and Knockout templates.
  koObject.bindingHandlers.modal = {

    init : function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {

      var $element = $( element ) ;
      var modalBindingValues = koObject.utils.unwrapObservable( valueAccessor( ) ) ;

      var template = modalBindingValues.template || false ; // Optional: Knockout template name for modal content.
      var options = modalBindingValues.options || { } ; // Bootstrap modal options.
      var data = modalBindingValues.data || false ; // Optional: data for the Knockout template.
      var fade = modalBindingValues.fade || false ; // Control if the modal should have a fade effect.
      var openModal = modalBindingValues.openModal || false ; // Optional: callback when modal is opened.

      options.show = false ; // Modals should not show immediately on initialization.

      // Define attributes for the modal div to ensure correct Bootstrap behavior and accessibility.
      var modalAttr = {
        'class'       : "modal" + ( fade ? ' fade' : '' ), // Add 'fade' class if enabled.
        'tab-index'   : '-1',
        'role'        : 'dialog',
        'aria-hidden' : 'true'
      } ;

      // If data is provided, set up Knockout template binding for modal content.
      if ( data ) {
        modalAttr[ 'data-bind' ] = "template: { name: template, if: data, data: data }" ;
      }

      // Create the modal div element.
      var modal = $( '<div/>', modalAttr ) ;

      // If no data is provided, load modal content directly from a template element's HTML.
      if ( ! data ) {
        modal.html( $( '#' + template ).html( ) ) ;
      }

      // Initialize the Bootstrap Modal plugin.
      modal.modal( options ) ;

      // Attach a click event handler to the bound element to show the modal.
      $element.on( 'click', function ( ) {

        if ( data ) {
          // Apply bindings with specific template and data to the modal's content.
          koObject.applyBindings( {
            template : template,
            data     : data
          }, modal[ 0 ] ) ;

        } else {
          // If no specific data is given, bind the modal to the current viewModel.
          koObject.applyBindings( viewModel, modal[ 0 ] ) ;
        }

        modal.modal( 'show' ) ; // Display the modal.

        // Execute an optional callback function after the modal is shown.
        if ( openModal ) {
          openModal( ) ;
        }

        // Adjust modal backdrop height for full screen coverage,
        // especially important for modals that might be taller than the viewport.
        $( '.modal-backdrop' ).css( { height : $( window ).height( ), position : 'fixed' } ) ;

      } ) ; // End of click event handler.

      // Add a disposal callback to destroy the modal when the element is removed from the DOM.
      koObject.utils.domNodeDisposal.addDisposeCallback( element, function ( ) {
        $element.modal( 'destroy' ) ; // Destroy the Bootstrap modal instance.
      } ) ;

      return { controlsDescendantBindings : true } ; // Prevent Knockout from binding descendants directly.

    } // End of init function for modal.

  } ;


} // End of setupKoBootstrap function definition.


/*
 * Self-executing anonymous function to handle module loading.
 * It supports both AMD (Asynchronous Module Definition, e.g., RequireJS)
 * and direct script inclusion in a browser environment.
 */
( function ( factory ) {

  "use strict" ;

  // Check for AMD loader (e.g., RequireJS).
  if ( typeof define === 'function' && define.amd ) {

    // Define an anonymous AMD module with its dependencies.
    define( [ "require", "exports", "knockout", "jquery" ], function ( require, exports, knockout, jQuery ) {
      // Pass the Knockout and jQuery objects to the factory function.
      factory( knockout, jQuery ) ;
    } ) ;

  } else {
    // If no module loader is present, assume global script inclusion.
    // Attach to window.ko (Knockout) and global jQuery.
    factory( window.ko, jQuery ) ;
  }

} ( setupKoBootstrap ) ) ; // Pass the main setup function (setupKoBootstrap) to the IIFE.