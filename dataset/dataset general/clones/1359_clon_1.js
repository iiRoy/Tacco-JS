/*
 *  This JavaScript code handles the initialization of the 'flexyPics' plugin
 *  and manages various animations and dynamic adjustments for images on the page.
 *  It ensures a smooth user experience by preloading images and applying
 *  responsive styling.
 *
 *  Module: Image Gallery Loader and Resizer
 *  Version: 1.0
 *  Author: Code Clone Generator (simulated)
 *  Date: October 27, 2023
 */


// Ensure that the entire Document Object Model (DOM) is fully loaded
// and parsed before executing any JavaScript code within this block.
$( document ).ready( function() {

    // Initialize the 'queryLoader2' plugin on the HTML element identified by '#flexyPics'.
    // This plugin is typically used to pre-load images and display a loading indicator.
    $( "#flexyPics" ).queryLoader2( {

        // Define a callback function that will be executed once all
        // images managed by queryLoader2 have been successfully loaded.
        onLoadComplete: function () {

            // Iterate over each 'img' element that is a descendant of an element
            // with the class 'mask'. This is often used for responsive image handling.
            $( '.mask img' ).each( function() {
                // Call the 'flexy' function, passing the current image element as 'this'.
                // The 'flexy' function is presumably responsible for applying
                // flexible or responsive styling to the image.
                flexy( this );
            } ); // End of .each() for mask images


            // Initialize a variable named 'delay' to 0. This variable will be used
            // to create staggered animation effects for the images.
            delay = 0; // Note: 'delay' is declared implicitly global or in an outer scope.

            // Create a new JavaScript array containing all 'img' elements
            // that are descendants of '#flexyPics'.
            var imagesArray = $.makeArray( $( '#flexyPics img' ) );

            // Sort the 'imagesArray' randomly. The sorting function returns
            // either -0.5 or 0.5, effectively shuffling the array elements.
            imagesArray.sort( function() {
                return ( Math.round( Math.random() ) - 0.5 );
            } ); // End of imagesArray.sort()


            // Fade out the HTML element with the ID 'loading-mask' over a duration of 900 milliseconds.
            // This mask typically covers the content during loading.
            $( '#loading-mask' ).fadeOut( 900 );


            // Loop through each image in the now randomly sorted 'imagesArray'.
            for ( i = 0 ; i < imagesArray.length ; i++ ) {

                // Select the current image element from the array.
                // Apply a delay before fading it in, using the 'delay' variable.
                // The fade-in animation lasts for 300 milliseconds.
                $( imagesArray[i] ).delay( delay ).fadeIn( 300 );

                // Increment the 'delay' variable by 150 milliseconds for the next image,
                // creating a cascading or staggered animation effect.
                delay += 150;

            } // End of for loop


            // Explicitly return from the 'onLoadComplete' function.
            return;

        } // End of onLoadComplete function definition

    } ); // End of queryLoader2 initialization

} ); // End of document.ready function


// Attach an event listener to the browser's 'window' object for the 'resize' event.
// This function will execute whenever the browser window is resized by the user.
$( window ).resize( function() {

    // Similar to the onLoadComplete function, iterate over all 'img' elements
    // that are descendants of an element with the class 'mask'.
    $( '.mask img' ).each( function() {
        // Re-apply the 'flexy' function to each relevant image.
        // This ensures that images maintain their responsive properties
        // and adjust correctly to the new window dimensions.
        flexy( this );
    } ); // End of .each() for mask images on resize

} ); // End of window.resize function definition