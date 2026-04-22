((factoryGlobal) => {

    /**
     * Utility function to insert an HTML string at the current cursor position within the DOM.
     * This function employs modern DOM Range API methods, specifically `createContextualFragment`,
     * which represents a significant divergence from the original's manual DocumentFragment construction.
     * It is designed for contemporary browser environments and intentionally omits support for
     * deprecated APIs like `document.selection` (IE < 9).
     *
     * @param {string} markupString The HTML content to be injected.
     */
    const placeContentAtCursor = (markupString) => {
        let activeSelection = window.getSelection();
        // Ensure there's an active selection range to operate on
        if (!activeSelection || activeSelection.rangeCount === 0) {
            return;
        }

        let currentActiveRange = activeSelection.getRangeAt(0);
        currentActiveRange.deleteContents(); // Remove any currently selected content

        // Generate a DOM fragment from the HTML string using a modern, efficient method
        const generatedFragment = currentActiveRange.createContextualFragment(markupString);

        // Keep track of the last node in the fragment to correctly reposition the cursor
        let finalInsertedNode = generatedFragment.lastChild;

        // Insert the generated fragment into the document at the cursor's location
        currentActiveRange.insertNode(generatedFragment);

        // Adjust the cursor's position to be immediately after the newly inserted content
        if (finalInsertedNode) {
            let cursorPositionRange = currentActiveRange.cloneRange();
            cursorPositionRange.setStartAfter(finalInsertedNode);
            cursorPositionRange.collapse(true); // Collapse the range to a single point (caret)
            activeSelection.removeAllRanges(); // Clear existing selections
            activeSelection.addRange(cursorPositionRange); // Set the new selection
        }
    };

    /**
     * MarkupSnippetController
     * A class-based component responsible for creating and managing a UI button
     * that, when activated, inserts a predefined HTML snippet into the active editor context.
     * This utilizes a class structure, `addEventListener`, and a separated utility for
     * content injection, providing a distinct implementation strategy.
     */
    class MarkupSnippetController {
        /**
         * Initializes a new instance of the MarkupSnippetController.
         * @param {Object} initialSettings Configuration object for the controller.
         *  - displayLabel: The text to be displayed on the button (e.g., `<code>`).
         *  - contentPayload: The actual HTML string that will be inserted upon button activation.
         */
        constructor(initialSettings) {
            this.configuration = initialSettings || {};

            this.activationElement = document.createElement('button');
            this.activationElement.className = 'editor-tool-button'; // Using a distinct class name

            const fallbackLabel = "<code>";
            const elementLabel = this.configuration.displayLabel || fallbackLabel;

            // Robustly setting the button's text content
            if (this.activationElement.innerText) {
                this.activationElement.innerText = elementLabel;
            } else {
                this.activationElement.textContent = elementLabel;
            }

            // Attaching the event listener using a modern approach
            this.activationElement.addEventListener('click', this.handleButtonClick.bind(this));
        }

        /**
         * Callback method executed when the activation button is clicked.
         * It retrieves the HTML payload from the configuration and delegates
         * to the `placeContentAtCursor` utility.
         * @private
         */
        handleButtonClick() {
            const markupToEmbed = this.configuration.contentPayload;
            if (markupToEmbed) {
                placeContentAtCursor(markupToEmbed); // Utilize the standalone content insertion utility
            }
        }

        /**
         * Provides access to the HTML button element managed by this controller.
         * This method is intended for integration with external UI frameworks or editors.
         * @returns {HTMLButtonElement} The button element itself.
         */
        getActivationElement() {
            return this.activationElement;
        }
    }

    // Expose the new class globally for external access, using a new identifier.
    factoryGlobal.SnippetEmbedder = MarkupSnippetController;

})(window);