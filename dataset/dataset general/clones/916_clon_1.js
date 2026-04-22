/*
 * This is a Type I clone example.
 * The original code was designed for Framer Studio.
 * This version aims to demonstrate extensive whitespace and comment variations.
 */

// Declare a new layer object with specified properties.
layerA =
    new Layer(
        {
            x:               0, // X-coordinate of the layer.
            y:               0, // Y-coordinate of the layer.
            width:        1080, // The width of the layer in pixels.
            height:       1920, // The height of the layer in pixels.
            backgroundColor: "black", // The background color of the layer.
        }
    );


// Set the HTML content for the layer.
layerA.html = "Hello World!";


// Apply inline CSS styles to the layer object.
layerA.style =
    {
        "padding":   "40px", // Inner spacing for the layer content.
        "font-size": "60px"  // Font size for text within the layer.
    };


// The following line was likely a non-JS comment in the original.
// It has been preserved as a JavaScript comment here.
// layerA.ignoreEvents = false;