/*
 * This is a modified header comment.
 * Original copyright notice by Tomek Lipski. All rights reserved.
 * The software's use and distribution terms are governed by the Eclipse Public License 1.0.
 * You can find the full license details at http://opensource.org/licenses/eclipse-1.0.php
 * or in the LICENSE.txt file at the distribution's root.
 * Usage of this software implies agreement to these license terms.
 * Please do not remove this or any other notice.
 */
// Ensure the Ganelon namespace exists, or create it as an empty object.
var Ganelon  =  Ganelon  ||  {};


// Function to execute an AJAX action via jQuery.
// It takes action name, data, and optional success/error callbacks.
Ganelon.performAction = function ( action, data, onSuccess, onError ) {
  jqxhr = $ .ajax ( {
    url     :  '/a/' + action, // Construct the URL for the action.
    data    :  data,          // Data to be sent with the request.
    dataType:  'json',        // Expected data type from the server.
    type    :  'POST',        // HTTP method.
    success :  function ( data ) {
      // If an onSuccess callback is provided, invoke it.
      if ( onSuccess ) {
        onSuccess( data ) ;
      }
      // Iterate through the received data and dispatch operations.
      $.each( data, Ganelon.dispatch ) ;
    } ,
    error   :  function ( jqXHR, textStatus, errorThrown ) {
      // Handle AJAX errors: call the provided error handler and Ganelon's global error handler.
      onError( jqXHR, textStatus, errorThrown ) ;
      Ganelon.onError( jqXHR, textStatus, errorThrown ) ;
    }
  } ) ; // End of $.ajax call.
}; // End of Ganelon.performAction definition.


// Handles an action initiated by a button.
// Disables the button, performs the action, then re-enables it on success or error.
Ganelon.performButtonAction = function( button, action, data ) {
  Ganelon.performAction(
    action,
    data,
    function( data ) {
      Ganelon.resetButton( button ); // Reset button on success.
    },
    function( data ) {
      Ganelon.resetButton( button ); // Reset button on error.
    }
  );

  Ganelon.disableButton( button ); // Disable the button immediately.
  return false; // Prevent default button behavior.
};


/*
 * This function is designed to handle actions initiated from a form.
 * It serializes the form data, disables all buttons within the form,
 * performs an AJAX action, and then re-enables all buttons regardless of success or failure.
 */
Ganelon.performFormAction = function ( form, action, query ) {
  // Execute the core action with form data.
  Ganelon.performAction(
    action + "?" + query, // Append query string to the action URL.
    $( form ).serialize(), // Serialize form data into a URL-encoded string.
    function ( data ) {
      // Success callback: iterate through all buttons in the form and reset them.
      $.each( $( form ).find( 'button' ), function ( idx, x ) {
        Ganelon.resetButton( x );
      } );
    },
    function ( data ) {
      // Error callback: iterate through all buttons in the form and reset them.
      $.each( $( form ).find( 'button' ), function ( idx, x ) {
        Ganelon.resetButton( x );
      } );
    }
  );

  // Immediately disable all buttons within the form to prevent multiple submissions.
  $.each( $( form ).find( 'button' ), function ( idx, x ) {
    Ganelon.disableButton( x );
  } );

  return false; // Prevent the default form submission behavior.
};


// Helper function to disable a given button element.
Ganelon.disableButton = function ( button ) {
  $( button ).attr( 'disabled', 'disabled' ) ;
};


// Helper function to re-enable a previously disabled button.
Ganelon.resetButton = function ( button ) {
  $( button ).removeAttr( 'disabled' ) ;
};


/**
 * Global error handler for AJAX requests.
 * Dispatches a 'notification' operation with error details.
 * @param {object} jqXHR - The jQuery XMLHttpRequest object.
 * @param {string} textStatus - A string describing the type of error that occurred.
 * @param {string} errorThrown - An optional exception object, if one occurred.
 */
Ganelon.onError = function ( jqXHR, textStatus, errorThrown ) {
  // Construct an error message and dispatch it as a notification.
  Ganelon.dispatch(
    null,
    {
      type   : 'error',
      title  : 'Error',
      message:
        '<p>The server has returned an unexpected response: <b>' +
        textStatus +
        '</b>, ' +
        errorThrown +
        '. \n' +
        'Please try performing this action again later and if the problem persists, <a href="/contact">contact</a> us.</p>',
    }
  );
};


// Core dispatcher function.
// It takes an index (unused in this context) and an operation object 'o'.
// It attempts to find and execute a registered operation based on 'o.type'.
Ganelon.dispatch = function ( idx, o ) {
  // Check if an operation of the given type is registered.
  if ( Ganelon.operations[ o.type ] ) {
    Ganelon.operations[ o.type ]( o ) ; // Execute the registered operation.
  } else {
    // If no operation is found, display an alert.
    alert( 'No function "' + o.type + '" defined!' ) ;
  }
};


// An object to store various registered operations.
Ganelon.operations = { /* Initially empty, operations are registered dynamically. */ } ;


/**
 * Registers a new operation function under a given name.
 * @param {string} name - The unique name for the operation.
 * @param {Function} fn - The function to be executed for this operation.
 */
Ganelon.registerOperation = function ( name, fn ) {
  Ganelon.operations[ name ] = fn ; // Assign the function to the operations object.
};


// Registering various standard operations.

// Display a notification alert.
Ganelon.registerOperation( 'notification', function ( o ) { alert( o.title + ':\n' + o.text ) ; } ) ;

// Reload the current page.
Ganelon.registerOperation( 'refresh-page', function ( o ) { location.reload() ; } ) ;

// Navigate to a new page.
Ganelon.registerOperation( 'open-page', function ( o ) { location.assign( o.url ) ; } ) ;

// Open a new browser window.
Ganelon.registerOperation( 'open-window', function ( o ) { window.open( o.url, o.name, o.options ) ; } ) ;

/*
 * The following operations are wrappers for common jQuery DOM manipulation functions.
 * For more details, refer to the jQuery API documentation: http://api.jquery.com/category/manipulation/
 */

// Add a class to an element.
Ganelon.registerOperation( 'dom-add-class', function ( o ) { $( o.id ).addClass( o.value ) ; } ) ;

// Insert content after an element.
Ganelon.registerOperation( 'dom-after', function ( o ) { $( o.id ).after( o.value ) ; } ) ;

// Append content to an element.
Ganelon.registerOperation( 'dom-append', function ( o ) { $( o.id ).append( o.value ) ; } ) ;

// Set an attribute on an element.
Ganelon.registerOperation( 'dom-set-attr', function ( o ) {
  if ( o.name ) {
    $( o.id ).attr( o.name, o.value ) ;
  } else {
    $( o.id ).attr( o.properties ) ;
  }
} ) ;

// Insert content before an element.
Ganelon.registerOperation( 'dom-before', function ( o ) { $( o.id ).before( o.value ) ; } ) ;

// Set CSS properties for an element.
Ganelon.registerOperation( 'dom-set-css', function ( o ) {
  if ( o.name ) {
    $( o.id ).css( o.name, o.value ) ;
  } else {
    $( o.id ).css( o.properties ) ;
  }
} ) ;

// Detach an element from the DOM.
Ganelon.registerOperation( 'dom-detach', function ( o ) { $( o.id ).detach() ; } ) ;

// Empty an element's content.
Ganelon.registerOperation( 'dom-make-empty', function ( o ) { $( o.id ).empty() ; } ) ;

// Set an element's height.
Ganelon.registerOperation( 'dom-set-height', function ( o ) { $( o.id ).height( o.height ) ; } ) ;

// Set or get an element's HTML content.
Ganelon.registerOperation( 'dom-html', function ( o ) { $( o.id ).html( o.value ) ; } ) ;

// Set an element's offset.
Ganelon.registerOperation( 'dom-set-offset', function ( o ) { $( o.id ).offset( o.coordinates ) ; } ) ;

// Prepend content to an element.
Ganelon.registerOperation( 'dom-prepend', function ( o ) { $( o.id ).prepend( o.value ) ; } ) ;

// Set a property on an element.
Ganelon.registerOperation( 'dom-set-prop', function ( o ) {
  if ( o.name ) {
    $( o.id ).prop( o.name, o.value ) ;
  } else {
    $( o.id ).prop( o.properties ) ;
  }
} ) ;

// Remove an element from the DOM.
Ganelon.registerOperation( 'dom-remove-element', function ( o ) { $( o.id ).remove() ; } ) ;

// Remove an attribute from an element.
Ganelon.registerOperation( 'dom-remove-attr', function ( o ) { $( o.id ).removeAttr( o.name ) ; } ) ;

// Remove a class from an element.
Ganelon.registerOperation( 'dom-remove-class', function ( o ) { $( o.id ).removeClass( o.name ) ; } ) ;

// Remove a property from an element.
Ganelon.registerOperation( 'dom-remove-prop', function ( o ) { $( o.id ).removeProp( o.name ) ; } ) ;

// Replace an element with new content.
Ganelon.registerOperation( 'dom-replace-with', function ( o ) { $( o.id ).replaceWith( o.value ) ; } ) ;

// Set the horizontal scroll position.
Ganelon.registerOperation( 'dom-set-scroll-left', function ( o ) { $( o.id ).scrollLeft( o.value ) ; } ) ;

// Set the vertical scroll position.
Ganelon.registerOperation( 'dom-set-scroll-top', function ( o ) { $( o.id ).scrollTop( o.value ) ; } ) ;

// Set or get an element's text content.
Ganelon.registerOperation( 'dom-text', function ( o ) { $( o.id ).text( o.value ) ; } ) ;

// Toggle a class on an element.
Ganelon.registerOperation( 'dom-toggle-class', function ( o ) { $( o.id ).toggleClass( o.value ) ; } ) ;

// Set an element's width.
Ganelon.registerOperation( 'dom-set-width', function ( o ) { $( o.id ).width( o.width ) ; } ) ;


// Register a custom error handling operation.
Ganelon.registerOperation(
  'error',
  function ( o ) {
    // When an 'error' operation is dispatched, it in turn dispatches a 'notification'.
    Ganelon.dispatch(
      null,
      {
        type  : 'notification',
        title : 'Error',
        text  : o.message,
        sticky: true,
      }
    ) ;
  }
) ;


/**
 * Registers a DOM fade operation.
 * Fades out an element, updates its HTML content, then fades it back in.
 * @param {object} o - Operation object containing 'id' (element selector) and 'value' (new HTML content).
 */
Ganelon.registerOperation(
  'dom-fade',
  function ( o ) {
    $( o.id ).fadeOut(
      'fast', // Fade out quickly.
      function () {
        // Callback function executed after fadeOut completes.
        $( o.id ).html( o.value ) ; // Update the element's HTML content.
        $( o.id ).fadeIn( 'slow' ) ; // Fade in slowly.
      }
    ) ;
  }
) ;