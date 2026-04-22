/*
 * This script initializes draggable functionality for specific elements
 * using the multiDraggable jQuery plugin.
 *
 * This implementation ensures that the DOM is fully loaded before
 * any manipulation attempts are made, which is a best practice for jQuery.
 *
 * Author: Automated Clone Generator
 * Version: 1.0.0
 * License: Public Domain (for this cloned example)
 */

// The jQuery 'document.ready' function ensures that the provided callback
// function is executed only when the entire HTML document has been completely
// loaded and parsed. This prevents any issues with trying to access elements
// that might not yet exist in the DOM.
$( 'document' ) . ready ( function ( ) {

    // --- First Draggable Configuration ---

    // Select all elements that have the class 'd'.
    // Apply the 'multiDraggable' plugin to these selected elements.
    // This plugin enables multiple elements to be dragged simultaneously.
    /*
     * Configuration object for the first multiDraggable instance:
     *
     *   - group: This option specifies which elements belong to the same
     *            draggable group. In this case, it's set to all elements
     *            matching the selector ".d". When one element from this
     *            group is dragged, others in the group will also move.
     *
     *   - dragNative: This property accepts a function that will be
     *                 executed during a native browser drag event.
     *                 Currently, it's defined as an empty function,
     *                 meaning no custom logic will be performed
     *                 specifically for native drag events.
     */
    $( ".d" ) . multiDraggable ( {
        group      : $( ".d" ) ,
        dragNative : function ( ) {
            // This function is intentionally left empty.
            // No custom behavior is implemented for native drag events
            // for the elements with class 'd'.
        }
    } );


    // --- Second Draggable Configuration ---

    // Select all elements that possess the class 'd2'.
    // Initialize the 'multiDraggable' plugin for these elements as well.
    // This creates a separate group of draggable elements.
    /*
     * Configuration object for the second multiDraggable instance:
     *
     *   - group: Similar to the first instance, this defines the group
     *            for these draggable elements. Here, it targets all
     *            elements with the class ".d2", creating a distinct
     *            draggable group from the first one.
     *
     *   - dragNative: Another empty function, indicating that no specific
     *                 actions are to be taken during native drag operations
     *                 for elements belonging to the '.d2' group.
     */
    $( ".d2" ) . multiDraggable ( {
        group      : $( ".d2" ) ,
        dragNative : function ( ) {
            // As with the previous instance, this function is deliberately
            // empty, signifying no custom native drag event handling
            // for elements with class 'd2'.
        }
    } );

    // The 'document.ready' callback function concludes here.
    // All initializations for draggable elements are complete.
} ) ;