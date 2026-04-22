/*
 * This JavaScript file contains a self-executing anonymous function (IIFE).
 * The purpose of this IIFE is to encapsulate the script's scope,
 * thereby preventing any global variable pollution.
 *
 * This script interacts with the DOM to add dynamic functionality,
 * specifically handling a click event and making an AJAX request.
 */
( function () {

    // Enforce strict mode. This helps in writing cleaner code
    // and catching common coding errors and "unsafe" actions.
    'use strict'
    ; // Semicolon after the strict mode declaration.

    // Declare and initialize two variables related to DOM elements.
    // 'dynamic' will hold a reference to the first element found with the class 'dynamic'.
    // 'send' will hold a reference to the first child element of the 'dynamic' element.
    var dynamic = document.querySelector( '.dynamic' )
    ,   send    = dynamic.children[ 0 ]
    ; // The semicolon terminates the 'var' statement.

    // Attach an event listener to the 'send' element.
    // This listener will trigger a function when the 'click' event occurs.
    send.addEventListener( 'click', function ( ) {

        // Inside the event handler, declare and instantiate a new XMLHttpRequest object.
        // This object is used to make asynchronous HTTP requests to the server.
        var XHR = new XMLHttpRequest
        ; // Semicolon after the XMLHttpRequest instantiation.

        // Configure the XMLHttpRequest.
        // It will make a 'POST' request to the specified URL,
        // and the 'true' argument indicates that the request should be asynchronous.
        XHR.open( 'POST', '/examples/simpleTooltip/demo/demo.php', true )
        ; // Semicolon after opening the XHR request.

        // Set the request header. This is important for POST requests
        // where data is sent in the body using application/x-www-form-urlencoded format.
        XHR.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' )
        ; // Semicolon after setting the request header.

        // Send the actual request to the server with the specified data.
        // The data 'hint=dynamic' is sent as part of the request body.
        XHR.send( 'hint=dynamic' )
        ; // Semicolon after sending the XHR request.

        // Assign an event handler for the 'onreadystatechange' event.
        // This function will be called whenever the readyState attribute changes.
        XHR.onreadystatechange = function ( ) {

            // Check if the request is complete (readyState 4) and successful (status 200).
            // 'this' refers to the XHR object within this context.
            if ( this.readyState == 4 && this.status == 200 ) {

                // If the request was successful, remove the 'send' element from the DOM.
                // It accesses the parent node of 'send' and then removes 'send' itself.
                send.parentNode.removeChild( send )
                ; // Semicolon after removing the child.

                // Append the response text received from the server to the 'innerHTML'
                // of the 'dynamic' element. This effectively updates the UI.
                dynamic.innerHTML += this.responseText
                ; // Semicolon after updating innerHTML.

            } // End of the 'if' condition block.

        } // End of the onreadystatechange function definition.
        ; // Semicolon after assigning the onreadystatechange handler.

    }, false ) // The 'false' argument indicates event bubbling is not used (capture phase).
    ; // Semicolon after the addEventListener call.

    // After setting up the click listener, initialize a custom 'simpleTooltip'
    // functionality on the 'send' element.
    // It's configured with specific options for 'shift' and 'tip' text.
    send.simpleTooltip( { shift: 'south', tip: 'This tooltip was assigned by means of custom method' } )
    ; // Semicolon after the simpleTooltip method call.

} ) ( ) // The final parentheses immediately invoke the anonymous function.
; // Semicolon after the IIFE invocation.

// End of JavaScript code execution context.