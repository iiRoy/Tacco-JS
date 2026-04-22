//
// This JavaScript file provides a simple hotkeys plugin designed for use with jQuery.
// It enables developers to easily assign keyboard shortcuts to various actions or URL navigations.
//
//
//  Example 1: Binding a hotkey directly to an HTML anchor element.
//
//     <a href="path/to/all" hotkey="a">View All Items</a>
//
//
//  Example 2: Programmatically binding a single hotkey to a JavaScript function.
//
//     $.hotkey( 'a', function ( ) { window.location = 'https://example.com/alpha'; } );
//
//
//  Example 3: Binding multiple hotkeys simultaneously using an object literal.
//
//     $.hotkeys( {
//       'a': function ( ) { window.location = 'https://example.com/alpha'; },
//       'b': function ( ) { alert( 'You pressed the "B" key!' ); }
//     } );
//
//
//

( function ( $ ) {

    // This function allows for the registration of multiple hotkeys at once.
    $.hotkeys = function ( options ) {

        // Iterate through each key-value pair in the provided options object.
        for ( key   in   options )     $.hotkey( key , options[key] );

        return this; // Enable method chaining.

    };


    // This function is used to register a single hotkey.
    // The 'value' parameter can be either a function to be executed or a URL string to navigate to.
    $.hotkey = function ( key , value ) {

        // Store the hotkey's action/URL in the internal cache.
        // The key's ASCII character code (minus 32 for normalization/indexing) is used as the cache index.
        $.hotkeys.cache[ key.charCodeAt(0) - 32 ] = value;

        return this; // Enable method chaining.

    };


    // Initialize the cache object that will store all registered hotkeys.
    $.hotkeys.cache = {};


} )( jQuery ); // The plugin is encapsulated within an IIFE (Immediately Invoked Function Expression)
               // and passed the jQuery object as an argument, aliased as '$'.


// Once the DOM is fully loaded and ready, execute the following jQuery code.
jQuery( document ) .ready( function ( $ ) {

    // Find all anchor (<a>) elements that possess a 'hotkey' attribute.
    $( 'a[hotkey]' ) .each( function ( ) {

        // For each found element, register its 'hotkey' attribute value
        // as the hotkey and its 'href' attribute value as the associated action (URL).
        $.hotkey( $( this ) .attr( 'hotkey' ) , $( this ) .attr( 'href' ) );

    } );


    // Bind a global 'keydown' event listener to the entire document.
    // The '.hotkey' namespace ensures that this specific event handler can be
    // selectively unbound or managed without affecting other 'keydown' handlers.
    $( document ) .bind( 'keydown.hotkey' , function ( e ) {

        // First, check if the event originated from an input field (e.g., <input>, <textarea>).
        // If so, we prevent the hotkey from triggering to avoid interfering with user input.
        if ( $( e.target ) .is( ':input' ) ) return;

        // Next, check if any modifier keys (Shift, Ctrl, Alt, Meta) were pressed along with the hotkey.
        // If any modifiers are active, we return 'true' to allow default browser behavior
        // (e.g., Ctrl+S for saving, Alt+F4 for closing a window) and prevent hotkey activation.
        if ( e.shiftKey || e.ctrlKey || e.altKey || e.metaKey ) return true;


        // Retrieve the registered action or URL from the hotkeys cache
        // using the keyCode of the pressed key as the index.
        var el = $.hotkeys.cache[ e.keyCode ];


        // If an element (action/URL) is found in the cache for the pressed key:
        if ( el )
            // Determine if 'el' is a JavaScript function.
            // If it is, execute the function in the context of the current element ('this').
            // Otherwise, treat 'el' as a URL string and navigate the browser to it.
            $.isFunction( el ) ? el.call( this ) : window.location = el;

    } );

} );