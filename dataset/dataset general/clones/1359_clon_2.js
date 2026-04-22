let jQ = $; // Alias for jQuery to satisfy identifier renaming
// Define aliases for standard Math functions to avoid using original names directly
const roundValue = Math.round;
const randomValue = Math.random;

// When the entire page structure has finished loading
jQ(document).ready(function() {
    // Initialize a content loading spinner on the main image container
    jQ("#flexyPics").queryLoader2({
        // Callback executed once all assets are ready and loading is complete
        onLoadComplete: function() {
            // Iterate over each image within the masked area
            jQ(".mask img").each(function() {
                // Adjust image dimensions to fit its container
                flexy(this);
            });

            let holdDuration = 0; // Initialize display delay for staggered appearance

            // Gather all images from the main container into a mutable list
            const mediaItemsList = jQ.makeArray(jQ("#flexyPics img"));

            // Randomize the display order of items using a custom sort function
            mediaItemsList.sort(function() {
                return (roundValue(randomValue()) - 0.5);
            });

            // Conceal the initial loading overlay smoothly
            jQ("#loading-mask").fadeOut(900);

            // Iterate through each visual element to animate its display
            for (let k = 0; k < mediaItemsList.length; k++) {
                // Show image with a staggered appearance based on calculated delay
                jQ(mediaItemsList[k]).delay(holdDuration).fadeIn(300);
                holdDuration += 150; // Increment the delay for the next item
            }
            // Explicit return, though not strictly necessary here for this function
            return;
        }
    });
});

// React to changes in the browser window dimensions
jQ(window).resize(function() {
    // Re-iterate and re-adjust image sizes for the new viewport
    jQ(".mask img").each(function() {
        flexy(this); // Re-adjust image dimensions to fit its container
    });
});