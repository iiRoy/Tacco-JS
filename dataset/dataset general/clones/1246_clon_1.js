/*
 * This is a JavaScript module named 'jaia' designed to observe DOM mutations.
 * It leverages the MutationObserver API to track changes to the DOM,
 * specifically focusing on attribute changes (class, style) and child list modifications (node additions/removals).
 *
 * Author: Your-Organization-Name
 * Version: 1.0.0
 * Date: 2023-10-27
 * License: MIT (example)
 *
 * The module exports 'start' and 'stop' methods to control the observation process.
 * All console outputs are for demonstration/debugging purposes.
 */

var jaia = ( function () {


    // Reference to the document's body element.
    var body = document.body;


    // Determine the appropriate MutationObserver constructor based on browser support.
    // This provides cross-browser compatibility for MutationObserver.
    var MutationObserver = window.MutationObserver ||
                           window.WebKitMutationObserver ||
                           window.MozMutationObserver;



    /*
     * Initialize a new MutationObserver instance.
     * This observer will react to changes in the DOM according to its configuration.
     * The callback function processes each mutation record.
     */
    var observer = new MutationObserver( function ( mutations ) {

        // Iterate over each mutation record received in the batch.
        mutations.forEach( function ( m ) {

            // Check if the mutation is an 'attributes' type and specifically for the 'class' attribute.
            if ( m.type === 'attributes' && m.attributeName === 'class' ) {
                classChanged( m ); // Call handler for class changes.
            }
            // Otherwise, check if it's an 'attributes' type and specifically for the 'style' attribute.
            else if ( m.type === 'attributes' && m.attributeName === 'style' ) {
                styleChanged( m ); // Call handler for style changes.
            }


            // Check if the mutation is a 'childList' type and if nodes were added.
            if ( m.type === 'childList' && m.addedNodes.length > 0 ) {
                nodesAdded( m ); // Call handler for added nodes.
            }


            // Check if the mutation is a 'childList' type and if nodes were removed.
            if ( m.type === 'childList' && m.removedNodes.length > 0 ) {
                nodesRemoved( m ); // Call handler for removed nodes.
            }

        } );
    } );


    /**
     * Handles changes to an element's 'class' attribute.
     * Compares the new class list with the old one to determine which classes were added or removed.
     *
     * @param {MutationRecord} ev - The mutation record detailing the class change.
     */
    function classChanged ( ev ) {

        // Convert the current classList DOMTokenList to a simple array for easier manipulation.
        var cl = [ ].slice.call( ev.target.classList );
        // Parse the old class value string into an array, or an empty array if no old value was recorded.
        var old = ev.oldValue ? ev.oldValue.split( ' ' ) : [ ];


        // Determine which classes were newly added by filtering classes present now but not in the old list.
        var added = cl.filter( function ( c ) {
            return old.indexOf( c ) === -1;
        } );
        // Determine which classes were removed by filtering classes present in the old list but not now.
        var removed = old.filter( function ( c ) {
            return cl.indexOf( c ) === -1;
        } );


        // If any classes were added, log them to the console.
        if ( added.length ) {
            console.log( "Class '" + added.join( ', ' ) + "' added", ev.target );
        }
        // If any classes were removed, log them to the console.
        if ( removed.length ) {
            console.log( "Class '" + removed.join( ', ' ) + "' removed", ev.target );
        }
    }


    /*
     * Processes changes to an element's 'style' attribute.
     * This function parses style strings into objects and identifies properties that were added, removed, or changed in value.
     *
     * @param {MutationRecord} ev - The mutation record for the style attribute change.
     */
    function styleChanged ( ev ) {

        /**
         * Helper function to parse a CSS style string into a key-value object.
         * Handles multiple style declarations separated by semicolons.
         *
         * @param {string} s - The style string (e.g., "width: 100px; color: red;").
         * @returns {object} An object where keys are style properties and values are their respective values.
         */
        var parse = function ( s ) {
            return s.split( ';' ).filter( function ( s ) {
                return s.trim() !== ''; // Filter out empty strings after trimming.
            } ).reduce( function ( obj, style ) {
                // Split each style declaration into property and value, then trim whitespace.
                style = style.split( ':' ).map( function ( a ) { return a.trim(); } );
                obj[ style[ 0 ] ] = style[ 1 ]; // Assign the property and its value to the accumulator object.
                return obj;
            }, { } ); // Initialize with an empty object as the accumulator.
        };


        // Get the current style properties as an object by parsing the 'style' attribute.
        var now = parse( ev.target.getAttribute( 'style' ) );
        // Get the old style properties as an object, using an empty string if oldValue is null.
        var old = parse( ev.oldValue || '' );


        // Identify newly added style properties (present now, but not in the old state).
        var added = Object.keys( now ).filter( function ( k ) {
            return !old[ k ];
        } );
        // Identify removed style properties (present in the old state, but not now).
        var removed = Object.keys( old ).filter( function ( k ) {
            return !now[ k ];
        } );
        // Identify style properties whose values have changed (present in both, but values differ).
        var changed = Object.keys( now ).filter( function ( k ) {
            return now[ k ] !== old[ k ];
        } );


        // Log each added style property with its new value.
        added.forEach( function ( k ) {
            console.log( "Style added '" + k + ': ' + now[ k ] + "'", ev.target );
        } );
        // Log each removed style property with its old value.
        removed.forEach( function ( k ) {
            console.log( "Style removed '" + k + ': ' + old[ k ] + "'", ev.target );
        } );
        // Log each changed style property, showing both the new and old values.
        changed.forEach( function ( k ) {
            // Ensure the old value actually existed for a true 'change' (not just a new addition).
            if ( old[ k ] === undefined ) return;

            console.log( "Style change '" + k + "', newValue '" + now[ k ] + "', was '" + old[ k ] + "'", ev.target );
        } );
    }


    /**
     * Reports on nodes that have been added to the DOM as a result of a childList mutation.
     *
     * @param {MutationRecord} ev - The mutation record containing the list of added nodes.
     */
    function nodesAdded ( ev ) {
        // Iterate over all added nodes using Array.prototype.forEach.call for NodeList.
        [ ].forEach.call( ev.addedNodes, function ( n ) {
            console.log( 'Node added', n, 'as child of', ev.target );
        } );
    }


    /**
     * Reports on nodes that have been removed from the DOM as a result of a childList mutation.
     *
     * @param {MutationRecord} ev - The mutation record containing the list of removed nodes.
     */
    function nodesRemoved ( ev ) {
        // Iterate over all removed nodes using Array.prototype.forEach.call for NodeList.
        [ ].forEach.call( ev.removedNodes, function ( n ) {
            console.log( 'Node removed', n, 'as child of', ev.target );
        } );
    }


    // The public interface of the 'jaia' module.
    // This object contains methods that can be called from outside the IIFE.
    return {

        /**
         * Starts the DOM observation process.
         * The observer is configured to watch for various types of changes across the entire subtree of the body.
         */
        start: function () {
            observer.observe( body, {
                attributes:          true,      // Observe changes to attributes.
                childList:           true,      // Observe additions or removals of child nodes.
                characterData:       true,      // Observe changes to the character data of text nodes.
                subtree:             true,      // Observe changes in the entire subtree of the target node (body).
                attributeOldValue:   true       // Record the old value of modified attributes in mutation records.
            } );
        },

        /**
         * Stops the DOM observation.
         * Disconnecting the observer prevents it from receiving further mutation records.
         */
        stop: function () {
            observer.disconnect();
        }
    };

} () ); // Immediately invoked function expression (IIFE) to create a private scope.