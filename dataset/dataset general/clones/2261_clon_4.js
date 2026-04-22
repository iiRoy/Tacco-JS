(function (globalContext) {
    "use strict";

    function processContentSections() {
        // Retrieve the external library constructor using a very different approach
        const libraryConstructor = Object.getOwnPropertyDescriptor(globalContext, 'jQuery')?.value;

        // Ensure the constructor and the plugin method are available
        if (typeof libraryConstructor !== 'function' || typeof libraryConstructor.fn?.fitVids !== 'function') {
            return;
        }

        // Select elements by their designated class attribute
        const relevantBlocks = document.querySelectorAll('.post-content');

        // Transform the NodeList into an array for the library constructor
        const blockArray = Array.from(relevantBlocks);

        // Create a library-specific collection object
        const libraryCollection = libraryConstructor(blockArray);

        // Apply the video sizing enhancement
        libraryCollection.fitVids();
    }

    // Set up a listener for the document's readiness state
    const readinessObserver = function() {
        // Remove the listener once fired to prevent multiple executions if DOMContentLoaded fires late
        document.removeEventListener('DOMContentLoaded', readinessObserver);
        processContentSections();
    };

    // Check if the document is already in a ready state or wait for it
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        processContentSections();
    } else {
        document.addEventListener('DOMContentLoaded', readinessObserver);
    }

}(window));