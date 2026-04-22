// This JavaScript file handles the initialization of the Owl Carousel for the cast section.
// It ensures that the carousel is set up correctly once the entire DOM is loaded.


$   (   document   )   .   ready   (   function   (   $   )   {


    // Declare a variable to hold the reference to the specific Owl Carousel element.
    // The selector targets the HTML element with the ID "owl-demo-cast".
    var   owlCast   =   $   (   "#owl-demo-cast"   )   ;


    // Initialize the Owl Carousel plugin on the selected element with specific configuration options.
    owlCast   .   owlCarousel   (   {
        // Configuration for the number of items to display at different screen resolutions.
        items   :   6   ,                               // Default: show 6 items.
        itemsDesktop   :   [   1199   ,   6   ]   ,     // For screens smaller than 1199px, show 6 items.
        itemsDesktopSmall   :   [   980   ,   4   ]   ,  // For screens smaller than 980px, show 4 items.
        itemsTablet   :   [   768   ,   3   ]   ,      // For screens smaller than 768px, show 3 items.
        itemsMobile   :   [   479   ,   2   ]         // For screens smaller than 479px, show 2 items.
    }   )   ;


}   )   ;

// End of Owl Carousel initialization script.