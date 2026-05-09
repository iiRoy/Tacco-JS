// This module provides a specialized utility for processing CSS asset metadata.
// Its primary function is to convert an internal asset definition into a client-side
// JavaScript snippet, enabling dynamic injection of stylesheets into a web page.

/**
 * Orchestrates the transformation of a CSS asset bundle into a JavaScript string
 * suitable for client-side execution. This string, when run, will inject the
 * CSS asset's details into the DOM via a predefined client-side utility.
 *
 * @param {object} assetBundle - The primary data structure containing all pertinent
 *                               information about the CSS asset. This object will
 *                               be modified in place with new properties.
 *                               Expected properties are flexible, but `id` or `name`
 *                               can be used to derive a `resourceId`.
 * @param {Function} onCompletion - A standard Node.js-style callback function.
 *                                  It will be invoked upon completion of the processing,
 *                                  passing either an error object or the modified
 *                                  `assetBundle`.
 *                                  Signature: `(error: Error | null, processedData: object)`
 * @returns {void} This function does not return a value directly; results are
 *                 communicated asynchronously via the `onCompletion` callback.
 */
module.exports = function processCssAssetForClient(assetBundle, onCompletion) {
    // --- Type III: Added a robust input validation guard clause ---
    // This ensures that the function receives a valid object before proceeding,
    // preventing potential runtime errors and providing clearer debugging information.
    if (!assetBundle || typeof assetBundle !== 'object' || Array.isArray(assetBundle)) {
        const invalidInputError = new TypeError('Input asset bundle must be a non-null object.');
        // --- Type III: Included a diagnostic log message for failed validation ---
        console.error('CSS Asset Transformer: Input validation failed.', invalidInputError.message, { received: assetBundle });
        return onCompletion(invalidInputError);
    }

    // --- Type II: Renamed 'mimetype' property to 'contentType' for clarity ---
    // --- Type III: Utilized a constant for the string literal, improving maintainability ---
    const standardCssMediaType = "text/css";
    assetBundle.contentType = standardCssMediaType;

    // --- Type III: Introduced a new helper variable to generate a consistent resource identifier ---
    // This adds a derived property to the assetBundle, useful for tracking or client-side logic.
    // It also demonstrates adding new fragments of code.
    const uniqueResourceId = assetBundle.id || assetBundle.name || `generated-css-asset-${Math.random().toString(36).substring(2, 10)}`;
    assetBundle.resourceId = uniqueResourceId; // Storing the derived ID directly on the bundle

    // --- Type III: Rewrote the client-side injection mechanism and identifiers ---
    // Changed the client-side JavaScript function name from 'servitude.injectCSS'
    // to 'styleManager.applyStylesheet' to demonstrate an update to an existing statement.
    const clientSideInjectionFunction = 'styleManager.applyStylesheet';

    // --- Type III: Introduced intermediate constants for string concatenation ---
    // This breaks down a complex string construction into more manageable parts,
    // enhancing readability and showing structural changes.
    const functionCallStart = clientSideInjectionFunction + '(';
    const functionCallEnd = ');';

    // --- Type III: Updated the stringification process ---
    // The original code stringified the entire `record` object after modification.
    // We follow the same pattern here by stringifying the `assetBundle` after
    // its `contentType` and `resourceId` properties have been set.
    const serializedPayloadForClient = JSON.stringify(assetBundle);

    // --- Type II: Renamed 'processed' property to 'transformedScript' ---
    // The final client-executable JavaScript string is assembled here.
    assetBundle.transformedScript = functionCallStart + serializedPayloadForClient + functionCallEnd;

    // --- Type III: Added a non-essential informational logging statement ---
    // This provides operational insight into the successful processing of an asset.
    console.info(`CSS Asset Transformer: Successfully finalized asset '${assetBundle.resourceId}' for client-side delivery.`);

    // --- Type II: Renamed 'callback' parameter to 'onCompletion' and 'record' to 'assetBundle' ---
    // The callback is invoked with no error (null) and the fully processed asset bundle.
    onCompletion(null, assetBundle);
};