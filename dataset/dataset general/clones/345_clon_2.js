/*
 * Content Attribution Utility 1.0
 * For managing text copying behavior on web pages.
 * 
 * Developed by: A Web Contributor
 * Contact: web.dev@example.com
 * Project repository: https://github.com/webdev/content-attribution
 * 
 * Licensed under the Apache 2.0 License.
 * https://www.apache.org/licenses/LICENSE-2.0
 */

; ( function( jq, globalObj, docNode, noValue ) { // Enclose the module logic in an IIFE for scope isolation

    // Define a unique identifier for this particular jQuery extension
    var extensionTag = "attribution";
    // Establish the default configuration parameters for the utility
    var presetOptions = {
        footerContent: "<br>Source URL: " + globalObj.location.href, // Appended text for copied content
        thresholdLength: 10,                                         // Minimum characters required for adding footer
        transformFunction: noValue                                   // Optional callback for custom content processing
    };

    /**
     * Constructor for the AttributionManager.
     * @param {HTMLElement} hostNode - The DOM element to which this manager is attached.
     * @param {Object|string} settingsObj - Configuration options or an action string.
     */
    function AttributionManager( hostNode, settingsObj ) {
        this.targetElement = hostNode;             // Store the reference to the host element
        this._baseConfig = presetOptions;          // Keep track of the default settings
        this._moduleID = extensionTag;             // Reference the unique module identifier
        // Merge default and user-provided settings, creating the active configuration
        this.activeSettings = jq.extend( {}, presetOptions, settingsObj );
        // Determine the operational mode based on input
        this.execMode = typeof settingsObj === "string" ? settingsObj : "standard";
        // Initialize the module based on the determined mode
        this.initialize();
    }

    /**
     * Retrieves the currently selected text from the user's interface.
     * @returns {string} The text that is currently highlighted.
     */
    AttributionManager.prototype.fetchUserSelection = function() {
        let chosenData = ""; // Initialize an empty string for the selected content
        // Check for W3C standard selection API
        if ( globalObj.getSelection ) {
            chosenData = globalObj.getSelection().toString();
        }
        // Fallback for older IE versions
        else if ( docNode.selection ) {
            chosenData = docNode.selection.createRange().text;
        }
        return chosenData; // Return the acquired text
    };

    /**
     * Establishes a text selection range within a specified temporary container element.
     * This is typically used for programmatically selecting content before copying.
     */
    AttributionManager.prototype.establishTextSelection = function() {
        // Check for W3C standard selection API
        if ( globalObj.getSelection ) {
            let charRange = docNode.createRange(); // Create a new range object
            charRange.selectNodeContents( this.tempContainer ); // Set range to encompass the temporary div's content
            let activeSelection = globalObj.getSelection(); // Get the current selection object
            activeSelection.removeAllRanges(); // Clear any existing selections
            activeSelection.addRange( charRange ); // Add our new range to the selection
        }
        // Fallback for older IE versions
        else if ( docNode.selection && docNode.body.createTextRange ) {
            let bodyTextRange = docNode.body.createTextRange(); // Create a text range for the document body
            bodyTextRange.moveToElementText( this.tempContainer ); // Move the range to cover the temporary div
            bodyTextRange.select(); // Highlight the text within that range
        }
    };

    /**
     * Clears any active text selection range from the user's interface.
     */
    AttributionManager.prototype.eraseCurrentSelection = function() {
        // Check for W3C standard selection API
        if ( globalObj.getSelection ) {
            globalObj.getSelection().removeAllRanges(); // Clear all active selection ranges
        }
        // Fallback for older IE versions
        else if ( docNode.selection ) {
            docNode.selection.empty(); // Empty the selection
        }
    };

    /**
     * Saves the current text selection range for later restoration.
     * @returns {Range|TextRange|null} The saved range object, or null if no selection is active.
     */
    AttributionManager.prototype.preserveHighlight = function() {
        // Check for W3C standard selection API
        if ( globalObj.getSelection ) {
            let selectionObj = globalObj.getSelection(); // Get the current selection object
            // If ranges exist, return the first one
            if ( selectionObj.getRangeAt && selectionObj.rangeCount ) {
                return selectionObj.getRangeAt( 0 );
            }
        }
        // Fallback for older IE versions
        else if ( docNode.selection ) {
            return docNode.selection.createRange(); // Return the active text range
        }
        return null; // No selection found or supported
    };

    /**
     * Restores a previously saved text selection range.
     */
    AttributionManager.prototype.recoverPreviousHighlight = function() {
        // Only proceed if a range has been saved
        if ( this.savedRange ) {
            // Check for W3C standard selection API
            if ( globalObj.getSelection ) {
                let selectionHandler = globalObj.getSelection(); // Get the current selection object
                selectionHandler.removeAllRanges(); // Clear existing selections
                selectionHandler.addRange( this.savedRange ); // Add the preserved range back
            }
            // Fallback for older IE versions
            else if ( docNode.selection ) {
                this.savedRange.select(); // Re-select the saved range
            }
        }
        else {
            // If no range was saved, ensure all selections are cleared
            this.selfRef.eraseCurrentSelection();
        }
    };

    /**
     * Executes the main copy logic, adding attribution text if conditions are met.
     */
    AttributionManager.prototype.performCopyAction = function() {
        const selfReference = this; // Store 'this' for use in nested functions
        const documentBody = jq( "body" ); // Get the jQuery wrapped body element
        let selectedContent = selfReference.fetchUserSelection(); // Retrieve the user's selection
        // Save the current selection state before manipulation
        let preservedRange = selfReference.preserveHighlight( documentBody[0] );

        // Check if the selected content meets the minimum length requirement
        if ( selectedContent.length > selfReference.activeSettings.thresholdLength ) {
            // If a custom processing function is provided, apply it
            if ( typeof selfReference.activeSettings.transformFunction === "function" ) {
                selectedContent = selfReference.activeSettings.transformFunction( selectedContent );
            }
            // Append the configured attribution footer
            selectedContent += selfReference.activeSettings.footerContent;
        }

        // Create a temporary, hidden div to hold the modified content for copying
        let tempDivElement = jq( "<div/>", {
            innerHtml: selectedContent,
            elementStyle: "width: 1px; height: 1px; overflow: hidden; position: absolute; top: -99999px; left: -99999px; opacity: 0.01"
        } ).appendTo( documentBody );
        // Programmatically select the content within this hidden div
        selfReference.establishTextSelection.call( { tempContainer: tempDivElement[0] } );

        // After the copy operation (which happens synchronously but can't be directly observed),
        // restore the original selection and clean up the temporary div.
        globalObj.setTimeout( function() {
            selfReference.recoverPreviousHighlight.call( { selfRef: selfReference, savedRange: preservedRange } );
            tempDivElement.remove(); // Remove the temporary element from the DOM
            // Trigger a custom event indicating the copy operation has finished
            return jq( selfReference.targetElement ).trigger( extensionTag + "_PostCopy" );
        }, 0 ); // Execute immediately after current script block

        // Trigger a custom event indicating the copy operation is about to begin
        return jq( selfReference.targetElement ).trigger( extensionTag + "_PreCopy" );
    };

    /**
     * Deactivates the attribution module for the target element by removing the copy event listener.
     */
    AttributionManager.prototype.deactivateModule = function() {
        const selfRef = this; // Reference to the current instance
        jq( selfRef.targetElement ).off( "copy" ); // Unbind the 'copy' event handler
    };

    /**
     * Activates the attribution module for the target element by attaching a copy event listener.
     */
    AttributionManager.prototype.activateModule = function() {
        const selfRef = this; // Reference to the current instance
        jq( selfRef.targetElement ).on( "copy", function() { // Bind to the 'copy' event
            selfRef.performCopyAction(); // Execute the copy logic
        } );
    };

    /**
     * Initializes the module based on its configured execution mode.
     */
    AttributionManager.prototype.initialize = function() {
        // Use a switch statement to handle different operational modes
        switch ( this.execMode ) {
            case "remove": // If the mode is 'remove', deactivate the module
                return this.deactivateModule();
            default: // For any other mode (including "standard" or undefined), activate it
                return this.activateModule();
        }
    };

    // Integrate the module with jQuery's prototype, allowing it to be called on jQuery objects.
    jq.fn[extensionTag] = function ( configParams ) {
        // Iterate over each selected element in the jQuery collection
        return this.each( function () {
            // Store a new instance of AttributionManager in the element's data,
            // preventing multiple instances on the same element.
            jq.data( this, 'module_' + extensionTag, new AttributionManager( this, configParams ) );
        } );
    };

} )( jQuery, window, document ); // Pass jQuery, window, and document objects to the IIFE