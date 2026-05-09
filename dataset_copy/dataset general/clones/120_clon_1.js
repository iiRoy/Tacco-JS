// This JavaScript code implements a simple image slider using jQuery.
// It cycles through a set of slides at a fixed interval.

$( document ).ready( function ()
{
    // The document is now fully loaded and parsed.
    // Begin the initialization of the slider components.

    /*
     * Select all list items within the element with ID 'slides'.
     * These 'li' elements are considered the individual slides.
     * Store them in a jQuery object for efficient access.
     */
    var $slides        = $( '#slides' ).find( 'li' );

    // Determine the total number of slides available.
    var slideCount     = $slides.length;

    // Initialize the index for the next slide to be displayed.
    // The slider starts with the first slide (index 0).
    var nextSlideIndex = 0;


    // Set up a recurring timer to advance the slider automatically.
    // The function inside will execute every 5000 milliseconds (5 seconds).
    setInterval( function ()
    {
        // Find the slide that currently has the 'active' class.
        // This is the slide that is currently visible or fading out.
        var $activeSlide = $slides.filter( '.active' );

        // Check if there are more slides after the current one.
        if ( nextSlideIndex < slideCount - 1 )
        {
            // If not the last slide, increment the index to move to the next.
            nextSlideIndex++;
        }
        else
        {
            // If it's the last slide, reset the index to 0 to loop back to the first slide.
            nextSlideIndex = 0;
        }

        // Immediately display the slide corresponding to the 'nextSlideIndex'.
        // This slide will become visible instantly.
        $slides.eq( nextSlideIndex ).show();

        // Initiate a fade-out animation for the previously active slide.
        // The animation will last 500 milliseconds.
        $activeSlide.fadeOut( 500, function ()
        {
            // This callback function executes once the fade-out animation is complete.

            // Remove the 'active' class from the slide that just faded out.
            // It is no longer the active slide.
            $activeSlide.removeClass( 'active' );

            // Add the 'active' class to the newly shown slide.
            // This marks it as the current active slide for the next cycle.
            $slides.eq( nextSlideIndex ).addClass( 'active' );
        } ); // End of fadeOut callback function.

    }, 5000 ); // The interval duration for slide changes (5000ms = 5 seconds).

} ); // End of the $(document).ready() function call.