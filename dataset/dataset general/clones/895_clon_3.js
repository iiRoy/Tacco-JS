const commModule = require('http');
const vectorGraphicsEngine = require('../');

// Service configuration constants
const DEFAULT_SERVICE_PORT = 3000;
const CANVAS_DIMENSION_WIDTH = 640;
const CANVAS_DIMENSION_HEIGHT = 640;
const IMAGE_CONTENT_TYPE = "image/svg+xml";

// Style properties for the main gear shape
const GEAR_STYLE_PROPS = {
    outlineColor: "#666666",
    transparencyLevel: 0.3,
    outlineThickness: 10
};

// Style properties for different components of the brand emblem (logo)
const LOGO_RECT_STYLE = {
    outlineColor: "none",
    fillColor: "#ffffff",
    transformation: 'r45', // Use Raphael's 'r' for rotation transform
    transparencyLevel: 0.2
};
const LOGO_PATH_STYLE = {
    fillColor: "#f89938",
    outlineColor: "none",
    transparencyLevel: 0.5
};
const LOGO_CIRCLE_STYLE = {
    outlineColor: "none",
    fillColor: "#39f",
    transparencyLevel: 0.5
};

// Translation offsets for positioning the entire brand emblem group
const LOGO_TRANSLATION_X_OFFSET = 245;
const LOGO_TRANSLATION_Y_OFFSET = 177;

/**
 * Generates the SVG path data string for the main gear shape.
 * This function encapsulates the complex path definition.
 * @returns {string} The SVG path data.
 */
function generateGearPathData() {
    return "M295.186,122.908c12.434,18.149,32.781,18.149,45.215,0l12.152-17.736c12.434-18.149,22.109-15.005,21.5,6.986l-0.596,21.49c-0.609,21.992,15.852,33.952,36.579,26.578l20.257-7.207c20.728-7.375,26.707,0.856,13.288,18.29l-13.113,17.037c-13.419,17.434-7.132,36.784,13.971,43.001l20.624,6.076c21.103,6.217,21.103,16.391,0,22.608l-20.624,6.076c-21.103,6.217-27.39,25.567-13.971,43.001l13.113,17.037c13.419,17.434,7.439,25.664-13.287,18.289l-20.259-7.207c-20.727-7.375-37.188,4.585-36.578,26.576l0.596,21.492c0.609,21.991-9.066,25.135-21.5,6.986L340.4,374.543c-12.434-18.148-32.781-18.148-45.215,0.001l-12.152,17.736c-12.434,18.149-22.109,15.006-21.5-6.985l0.595-21.492c0.609-21.991-15.851-33.951-36.578-26.576l-20.257,7.207c-20.727,7.375-26.707-0.855-13.288-18.29l13.112-17.035c13.419-17.435,7.132-36.785-13.972-43.002l-20.623-6.076c-21.104-6.217-21.104-16.391,0-22.608l20.623-6.076c21.104-6.217,27.391-25.568,13.972-43.002l-13.112-17.036c-13.419-17.434-7.439-25.664,13.288-18.29l20.256,7.207c20.728,7.374,37.188-4.585,36.579-26.577l-0.595-21.49c-0.609-21.992,9.066-25.136,21.5-6.986L295.186,122.908z";
}

/**
 * The primary application server instance, handling incoming requests and serving SVG.
 */
const graphicServiceHost = commModule.createServer((clientRequest, serverResponse) => {
    // Implement a basic guard clause for request validation
    if (clientRequest.method !== 'GET' || clientRequest.url !== '/') {
        serverResponse.statusCode = 405; // Method Not Allowed
        serverResponse.setHeader('Allow', 'GET');
        serverResponse.end('Resource only supports GET requests to the root path.');
        return;
    }

    // Set standard successful response headers
    serverResponse.statusCode = 200;
    serverResponse.setHeader('Content-Type', IMAGE_CONTENT_TYPE);

    let generatedVectorOutput;
    try {
        // Utilize the vector graphics engine to produce the SVG content
        generatedVectorOutput = vectorGraphicsEngine.generate(CANVAS_DIMENSION_WIDTH, CANVAS_DIMENSION_HEIGHT, (drawSurface) => {
            // This callback function is where all graphical elements are defined and added to the drawing surface.

            // 1. Draw the main cog shape
            const mainCogShape = drawSurface.pathElement(generateGearPathData());
            mainCogShape.attr({
                stroke: GEAR_STYLE_PROPS.outlineColor,
                opacity: GEAR_STYLE_PROPS.transparencyLevel,
                "stroke-width": GEAR_STYLE_PROPS.outlineThickness
            });

            // 2. Construct and position the brand emblem (logo)
            // Helper function to create the logo's square background element
            const createLogoRectangle = (surface) => {
                return surface.rectElement(13, 13, 116, 116, 30).attr({
                    stroke: LOGO_RECT_STYLE.outlineColor,
                    fill: LOGO_RECT_STYLE.fillColor,
                    transform: LOGO_RECT_STYLE.transformation,
                    opacity: LOGO_RECT_STYLE.transparencyLevel
                });
            };

            // Helper function to create the logo's primary path element
            const createLogoPath = (surface) => {
                const pathData = "M129.657,71.361c0,3.812-1.105,7.451-3.153,10.563c-1.229,1.677-2.509,3.143-3.829,4.408l-0.095,0.095c-6.217,5.912-13.24,7.588-19.2,7.588c-3.28,0-6.24-0.508-8.566-1.096C81.19,89.48,66.382,77.757,59.604,60.66c3.65,1.543,7.662,2.396,11.869,2.396c15.805,0,28.849-12.04,30.446-27.429l22.073,22.072C127.645,61.351,129.657,66.201,129.657,71.361zM18.953,85.018c-3.653-3.649-5.663-8.5-5.663-13.656c0-5.16,2.01-10.011,5.661-13.656l14.934-14.935c-3.896,13.269-5.569,27.23-4.674,40.614c0.322,4.812,0.987,9.427,1.942,13.831L18.953,85.018zM44.482,46.869c3.279,25.662,23.592,50.991,47.552,57.046c3.903,0.986,7.729,1.472,11.432,1.472c0.055,0,0.107-0.005,0.161-0.005l-18.501,18.503c-3.647,3.646-8.498,5.654-13.652,5.654c-3.591,0-7.021-0.993-10.01-2.815l0.007-0.01c-1.177-0.78-2.298-1.66-3.388-2.593c-0.084-0.082-0.176-0.153-0.26-0.236l-3.738-3.738c-7.688-8.825-12.521-21.957-13.561-37.517C39.736,70.853,41.149,58.578,44.482,46.869";
                return surface.pathElement(pathData).attr({
                    fill: LOGO_PATH_STYLE.fillColor,
                    stroke: LOGO_PATH_STYLE.outlineColor,
                    opacity: LOGO_PATH_STYLE.transparencyLevel
                });
            };

            // Helper function to create the logo's circular element
            const createLogoCircle = (surface) => {
                return surface.circleElement(71, 32, 19).attr({
                    stroke: LOGO_CIRCLE_STYLE.outlineColor,
                    fill: LOGO_CIRCLE_STYLE.fillColor,
                    opacity: LOGO_CIRCLE_STYLE.transparencyLevel
                });
            };

            // Group all logo elements and apply a translation
            const brandIdentifierGroup = drawSurface.elementSet(
                createLogoRectangle(drawSurface),
                createLogoPath(drawSurface),
                createLogoCircle(drawSurface)
            );
            brandIdentifierGroup.translate(LOGO_TRANSLATION_X_OFFSET, LOGO_TRANSLATION_Y_OFFSET);

            // Add an informative comment directly into the SVG output
            drawSurface.comment(`<!-- Generated by vectorGraphicsEngine at ${new Date().toISOString()} -->`);
        });
    } catch (error) {
        // Robust error handling for SVG generation failures
        console.error("Critical error during SVG graphic generation:", error);
        serverResponse.statusCode = 500; // Internal Server Error
        serverResponse.end("Failed to dynamically generate graphic content due to an internal issue.");
        return;
    }

    // Send the final generated SVG content to the client
    serverResponse.end(generatedVectorOutput);
});

// Determine the port for the service to listen on, prioritizing environment variables
const serviceListenPort = parseInt(process.env.SERVICE_LISTEN_PORT || process.env.PORT, 10) || DEFAULT_SERVICE_PORT;

// Start the HTTP service host
graphicServiceHost.listen(serviceListenPort, () => {
    const addressDetails = graphicServiceHost.address();
    console.log(`Vector graphic service host is now operational and listening on port ${addressDetails.port}.`);
});

// Implement an error handler for the server itself (e.g., port already in use)
graphicServiceHost.on('error', (serviceError) => {
    if (serviceError.code === 'EADDRINUSE') {
        console.error(`Error: Port ${serviceListenPort} is already in use by another process. Please choose a different port or terminate the conflicting process.`);
    } else {
        console.error(`A fatal error occurred with the service host: ${serviceError.message}`);
    }
    process.exit(1); // Terminate the application on critical server errors
});