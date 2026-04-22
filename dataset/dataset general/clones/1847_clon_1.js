/*
 * This entire block of code handles the initialization and functionality
 * of a simple image carousel or gallery component on a webpage.
 * It checks for the availability of querySelector before proceeding.
 */
if ( document.querySelector )
{
    // Retrieve the main carousel container element using its class name.
    var carousel = document.querySelector( '.gallery' ) ;

    /*
     * If the carousel element is successfully found in the DOM,
     * proceed with enhancing its functionality and appearance.
     */
    if ( carousel )
    {
        // Add a specific class to the carousel to indicate its enhanced state.
        carousel.className += ' is-enhanced' ;


        // Declare variables for the current slide index and a collection of figure elements.
        var slide, figures = carousel.querySelectorAll( 'figure' ) ;


        // Create a new anchor element to serve as the 'previous' button.
        var prev = document.createElement( 'a' ) ;
        // Set the 'rel' attribute for semantic meaning.
        prev.rel = 'prev' ;
        // Set the 'href' attribute to a placeholder.
        prev.href = '#' ;
        // Set the inner HTML to display a left arrow character.
        prev.innerHTML = '&#9664;' ;
        // Provide a descriptive title for accessibility.
        prev.title = 'Previous Image' ;
        // Append the 'previous' button to the carousel container.
        carousel.appendChild( prev ) ;


        // Create another anchor element for the 'next' button.
        var next = document.createElement( 'a' ) ;
        // Set its 'rel' attribute.
        next.rel = 'next' ;
        // Set its 'href' attribute.
        next.href = '#' ;
        // Set its inner HTML to display a right arrow character.
        next.innerHTML = '&#9654;' ;
        // Provide a descriptive title.
        next.title = 'Next Image' ;
        // Append the 'next' button to the carousel container.
        carousel.appendChild( next ) ;


        // Attach an event listener to the 'previous' button for click events.
        addEvent( prev, 'click', function ( e )
        {
            // Calculate the index of the new slide by decrementing the current slide index.
            var newSlide = slide - 1 ;

            // If the new slide index goes below zero, loop back to the last slide.
            if ( newSlide < 0 )
            {
                newSlide = figures.length - 1 ;
            }

            // Call the function to reveal the newly calculated slide.
            revealSlide( newSlide ) ;
            // Prevent the default action of the anchor tag (e.g., navigating to '#').
            e.preventDefault( ) ;
        } ) ;


        // Attach an event listener to the 'next' button for click events.
        addEvent( next, 'click', function ( e )
        {
            // Calculate the index of the new slide by incrementing the current slide index.
            var newSlide = slide + 1 ;

            // If the new slide index exceeds the total number of slides, loop back to the first slide.
            if ( newSlide > figures.length - 1 )
            {
                newSlide = 0 ;
            }

            // Call the function to display the new slide.
            revealSlide( newSlide ) ;
            // Prevent the default behavior of the anchor tag.
            e.preventDefault( ) ;
        } ) ;


        /*
         * Defines the core function to update the visible slide in the carousel.
         * @param {number} newSlide - The index of the slide to be displayed.
         */
        function revealSlide( newSlide )
        {
            // Only proceed if the new slide is different from the currently active slide.
            if ( newSlide !== slide )
            {
                // Check if there is a currently active slide to deactivate.
                if ( figures[ slide ] )
                {
                    // Remove the 'active' class from the current slide.
                    figures[ slide ].className = figures[ slide ].className.replace( ' active', '' ) ;
                }
                // Add the 'active' class to the new slide to make it visible.
                figures[ newSlide ].className += ' active' ;
                // Update the global 'slide' variable to reflect the newly active slide.
                slide = newSlide ;
            }
        }


        // Initialize the carousel by revealing the very first slide (index 0).
        revealSlide( 0 ) ;
    }
}