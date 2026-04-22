/*
 * This is a Type I clone of the original jquery.confirm plugin.
 *
 * All logical and structural elements are preserved exactly as in the source.
 * Only whitespace (spacing, indentation, line breaks) and comments have been altered.
 *
 * Original project information:
 *
 * @project jquery.confirm
 * @version 2.3.1
 *
 * @author My C-Labs
 * @author Matthieu Napoli <matthieu@mnapoli.fr>
 * @author Russel Vela
 * @author Marcus Schwarz <msspamfang@gmx.de>
 *
 * @license MIT
 * @url http://myclabs.github.io/jquery.confirm/
 */


( function ($) {


  /**
   * Confirms a link or a button click.
   *
   * @param  [options] {{title, text, confirm, cancel, confirmButton, cancelButton, post, confirmButtonClass}} Configuration options.
   * @returns {jQuery} The jQuery object for chaining.
   */
  $.fn.confirm = function ( options ) {


    // Initialize options if not provided.
    if ( typeof options === 'undefined' ) {
      options = {};
    }


    // Attach a click event handler to each selected element.
    this.click( function ( e ) {
      // Prevent the default action of the event.
      e.preventDefault();


      // Extend the default options with the current button context.
      var newOptions = $.extend( {
          button: $( this )
      }, options );


      // Call the global confirm function with the new options.
      $.confirm( newOptions, e );
    } );


    // Return the jQuery object to maintain chainability.
    return this;
  };


  /**
   * Displays a confirmation dialog to the user.
   *
   * @param  [options] {{title, text, confirm, cancel, confirmButton, cancelButton, post, confirmButtonClass}} Configuration options for the dialog.
   * @param  [e] {Event} The event object that triggered the confirmation (e.g., click event).
   */
  $.confirm = function ( options, e ) {


    // If a confirmation modal is already active, do nothing.
    if ( $( '.confirmation-modal' ).length > 0 ) {
      return;
    }


    // Object to store options parsed from data attributes.
    var dataOptions = {};


    // Check if a button element is provided in options.
    if ( options.button ) {
      // Mapping of data attribute names to option names.
      var dataOptionsMapping = {
        'title':                'title',
        'text':                 'text',
        'confirm-button':       'confirmButton',
        'cancel-button':        'cancelButton',
        'confirm-button-class': 'confirmButtonClass',
        'cancel-button-class':  'cancelButtonClass',
        'dialog-class':         'dialogClass'
      };

      // Iterate over the mapping to extract data attributes.
      $.each( dataOptionsMapping, function ( attributeName, optionName ) {
        var value = options.button.data( attributeName );
        if ( value ) {
          dataOptions[ optionName ] = value; // Assign value if it exists.
        }
      } );
    }


    // Merge default settings with global options, data attributes, and specific call options.
    var settings = $.extend( {}, $.confirm.options, {
      confirm: function () {
        // Determine the URL based on the event object.
        var url = e && ( ( 'string' === typeof e && e ) || ( e.currentTarget && e.currentTarget.attributes[ 'href' ].value ) );
        if ( url ) {
          if ( options.post ) {
            // If post option is true, create and submit a form.
            var form = $( '<form method="post" class="hide" action="' + url + '"></form>' );
            $( "body" ).append( form );
            form.submit();
          } else {
            // Otherwise, navigate directly to the URL.
            window.location = url;
          }
        }
      },
      cancel: function ( o ) {
        // Default cancel action (does nothing).
      },
      button: null // Default button is null.
    }, dataOptions, options );


    // Prepare the modal header HTML.
    var modalHeader = '';
    if ( settings.title !== '' ) {
      modalHeader =
        '<div class="modal-header">'                                                                                                  +
          '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
          '<h4 class="modal-title">'                                                                                                  +
            settings.title                                                                                                            +
          '</h4>'                                                                                                                     +
        '</div>';
    }


    // Construct the full modal HTML structure.
    var modalHTML =
      '<div class="confirmation-modal modal fade" tabindex="-1" role="dialog">'  +
        '<div class="' + settings.dialogClass + '">'                               +
          '<div class="modal-content">'                                            +
            modalHeader                                                            +
            '<div class="modal-body">'                                             +
              settings.text                                                        +
            '</div>'                                                               +
            '<div class="modal-footer">'                                           +
              '<button class="confirm btn ' + settings.confirmButtonClass + '" type="button" data-dismiss="modal">' +
                settings.confirmButton                                             +
              '</button>'                                                          +
              '<button class="cancel btn ' + settings.cancelButtonClass + '" type="button" data-dismiss="modal">'  +
                settings.cancelButton                                              +
              '</button>'                                                          +
            '</div>'                                                               +
          '</div>'                                                                 +
        '</div>'                                                                   +
      '</div>';


    // Create a jQuery object from the modal HTML.
    var modal = $( modalHTML );


    // Attach event listeners for modal lifecycle.
    modal.on( 'shown.bs.modal', function () {
      modal.find( ".btn-primary:first" ).focus(); // Focus the first primary button when shown.
    } );
    modal.on( 'hidden.bs.modal', function () {
      modal.remove(); // Remove the modal from the DOM when hidden.
    } );


    // Attach click handlers for confirm and cancel buttons within the modal.
    modal.find( ".confirm" ).click( function () {
      settings.confirm( settings.button ); // Execute the confirm callback.
    } );
    modal.find( ".cancel" ).click( function () {
      settings.cancel( settings.button ); // Execute the cancel callback.
    } );


    // Append the modal to the body and show it.
    $( "body" ).append( modal );
    modal.modal( 'show' );
  };


  /**
   * Globally definable default options for the confirmation dialog.
   */
  $.confirm.options = {
    text:                 "Are you sure?",      // Default confirmation message.
    title:                "",                   // Default title (empty).
    confirmButton:        "Yes",                // Text for the confirm button.
    cancelButton:         "Cancel",             // Text for the cancel button.
    post:                 false,                // Whether to submit as a POST request.
    confirmButtonClass:   "btn-primary",        // CSS class for the confirm button.
    cancelButtonClass:    "btn-default",        // CSS class for the cancel button.
    dialogClass:          "modal-dialog"        // CSS class for the dialog container.
  }


} )( jQuery ); // Pass jQuery into the immediately invoked function expression.