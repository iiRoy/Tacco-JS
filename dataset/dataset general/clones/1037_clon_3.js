/*
 * This module manages active selections or segments within a graphic text editor.
 * It provides a constructor for creating new segment instances.
 */
(function (graphicContextModule) {
    // Enforce strict parsing and error handling for cleaner code.
    "use strict";

    /**
     * @class GlyphSegment
     * @description Represents a collection of spatial markers defining an active region or selection.
     *              This constructor ensures proper initialization of segment properties.
     */
    function GlyphSegment() {
        // Type III: Guard against calling the constructor without 'new'.
        // If called as a regular function, it will return a new instance.
        if (!(this instanceof GlyphSegment)) {
            return new GlyphSegment();
        }

        // Type II: Renamed 'latest' to 'currentFocus'.
        // Type III: Initialized with 'null' instead of 'undefined' for clarity when no element is focused.
        this.currentFocus = null;

        // Type II: Renamed 'points' to 'coordinates'.
        // Type III: Changed internal data structure from Array to Set for unique coordinate storage.
        //           This implies coordinates might be added without duplicates.
        this.coordinates = new Set();

        // Type III: Added a new unique identifier for each segment instance.
        // This could be used for debugging or internal tracking.
        this.segmentId = Symbol('GlyphSegmentInstance');

        // Type III: Added a new property to indicate the initial state (e.g., number of items).
        // This property is initialized to zero, implying it tracks the count of coordinates.
        const initialCount = 0;
        this.elementCount = initialCount; // Will later reflect this.coordinates.size
    }

    // Type II: Export the 'GlyphSegment' constructor under a new, distinct name
    // within the provided module context.
    graphicContextModule.ActiveTextSegment = GlyphSegment;

})(GraphicTextTools); // Type II: The global object passed to the IIFE is also renamed.