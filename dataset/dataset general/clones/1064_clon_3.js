'use strict';

/**
 * This module is responsible for initializing and configuring visual display elements,
 * specifically focusing on loading image resources.
 * It demonstrates a robust approach to preparing image assets.
 */

// Define a constant for the default placeholder image file path.
// This path is used when a specific image source is not otherwise provided.
const DEFAULT_IMAGE_RESOURCE_PATH = '/images/dummy-7051c65f.jpg';

/**
 * Constructs and prepares an HTML image element.
 * This function encapsulates the logic for creating an image object and assigning its source.
 *
 * @param {string} resourceUri - The Uniform Resource Identifier (URI) for the image.
 *   This string specifies the location of the image file to be loaded.
 * @returns {HTMLImageElement | null} An initialized `HTMLImageElement` object with the
 *   specified source, or `null` if the provided resource URI is invalid.
 */
function initializeImageDisplayComponent(resourceUri) {
    // Perform a basic validation check on the input resource URI.
    // Ensure it's a non-empty string to prevent errors with invalid paths.
    if (typeof resourceUri !== 'string' || resourceUri.trim().length === 0) {
        console.error('Error: An invalid or empty resource URI was provided for image initialization.');
        // In case of invalid input, return null to indicate failure.
        return null;
    }

    // Create a new instance of the built-in Image object.
    // This object represents an HTML <img> element in memory.
    const visualDisplayElement = new Image();

    // Assign the resource URI to the 'src' attribute of the image element.
    // Using setAttribute offers a slightly different semantic from direct property assignment,
    // explicitly treating 'src' as an HTML attribute.
    visualDisplayElement.setAttribute('src', resourceUri);

    // Log a confirmation message to the console for debugging and operational visibility.
    console.info(`Successfully prepared visual display element with source: ${visualDisplayElement.src}`);

    // Return the newly configured image element.
    return visualDisplayElement;
}

// --- Primary Execution Flow ---

// Define the specific URI for the image asset we intend to load.
// This could be dynamically generated or fetched from configuration in a more complex application.
const assetLocationIdentifier = DEFAULT_IMAGE_RESOURCE_PATH;

// Attempt to create and configure the image component using the helper function.
const loadedVisualAsset = initializeImageDisplayComponent(assetLocationIdentifier);

// Check if the image component was successfully created before proceeding.
// This guard clause prevents further operations on a potentially null object.
if (loadedVisualAsset !== null) {
    // At this point, 'loadedVisualAsset' is a valid HTMLImageElement.
    // Further actions could include:
    // - Appending it to the document body: document.body.appendChild(loadedVisualAsset);
    // - Attaching event listeners (e.g., 'load', 'error'): loadedVisualAsset.onload = () => {...};
    // - Storing it in a collection for later use.
    // console.log('Visual asset is now ready for integration into the DOM or further manipulation.');
} else {
    // Handle the scenario where image initialization failed.
    console.warn('Warning: The visual asset could not be prepared. Check previous error messages.');
}