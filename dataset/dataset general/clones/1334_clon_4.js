var TextEditorEnhancements = TextEditorEnhancements || {};

TextEditorEnhancements.QuotationDivider = (function() {

    // Internal utility to extract all attributes from a DOM element as a string
    function retrieveElementAttributes(domNode) {
        if (!domNode || !domNode.hasAttributes()) {
            return '';
        }
        let attributeCollection = [];
        for (let idx = 0; idx < domNode.attributes.length; idx++) {
            const attrItem = domNode.attributes[idx];
            attributeCollection.push(`${attrItem.name}="${attrItem.value}"`);
        }
        return attributeCollection.length > 0 ? ' ' + attributeCollection.join(' ') : '';
    }

    // Internal utility to locate the highest blockquote ancestor of a given element
    function findTopmostQuotation(startPoint, boundaryContainer) {
        let currentScan = startPoint;
        let ultimateQuotation = null;
        while (currentScan && currentScan !== boundaryContainer) {
            if (currentScan.nodeName === 'BLOCKQUOTE') {
                ultimateQuotation = currentScan;
            }
            currentScan = currentScan.parentNode;
        }
        return ultimateQuotation;
    }

    // Internal utility to build a string of HTML closing tags
    function constructClosingTags(startingElement, boundaryElement) {
        const structuralPath = [];
        let currentTraversal = startingElement;
        while (currentTraversal && currentTraversal !== boundaryElement) {
            structuralPath.push(currentTraversal);
            currentTraversal = currentTraversal.parentNode;
        }
        // Map to closing tags and join them in order
        return structuralPath.map(node => `</${node.nodeName.toLowerCase()}>`).join('');
    }

    // Internal utility to build a string of HTML opening tags with their attributes
    function constructOpeningTags(startingElement, boundaryElement) {
        const structuralPath = [];
        let currentTraversal = startingElement;
        while (currentTraversal && currentTraversal !== boundaryElement) {
            structuralPath.unshift(currentTraversal); // Unshift to maintain correct nesting order for opening tags
            currentTraversal = currentTraversal.parentNode;
        }
        // Map to opening tags with attributes and join them
        return structuralPath.map(node => {
            const attributesMarkup = retrieveElementAttributes(node);
            return `<${node.nodeName.toLowerCase()}${attributesMarkup}>`;
        }).join('');
    }

    // Core logic handler for the keyboard event
    function processKeyboardAction(keyEventData, editorInstance) {
        // Only execute logic if the 'Enter' key (key code 13) was pressed
        if (keyEventData.which !== 13) {
            return;
        }

        const activeBlock = editorInstance.getBlock(); // Get the currently focused block element
        const editorRootContent = editorInstance.get(); // Get the root content container of the editor

        const parentQuotation = findTopmostQuotation(activeBlock, editorRootContent);
        if (!parentQuotation) {
            return; // If no blockquote ancestor is found, exit
        }

        keyEventData.preventDefault(); // Prevent the browser's default 'Enter' key behavior

        const closingMarkup = constructClosingTags(activeBlock, parentQuotation);
        const openingMarkup = constructOpeningTags(activeBlock, parentQuotation);

        // Create a temporary unique placeholder string to mark the caret position
        const temporaryMarker = `_SPLIT_POINT_${Date.now()}_`;
        editorInstance.insertText(temporaryMarker); // Insert the marker into the editor at the caret
        editorInstance.sync(); // Synchronize the editor's internal state with the DOM changes

        const contentSegments = editorInstance.get().split(temporaryMarker); // Split editor content by the marker
        const interQuotationGap = "</blockquote><br data-split-marker-id><blockquote>"; // HTML to insert between split blockquotes, with a temporary data-attribute

        // Reconstruct the editor's HTML content
        const revisedContent = contentSegments[0] + closingMarkup + interQuotationGap + openingMarkup + contentSegments[1];
        editorInstance.set(revisedContent); // Update the editor with the newly generated HTML

        // Locate the temporary marker element to position the caret
        const markerElement = editorInstance.$editor.find('[data-split-marker-id]');
        if (markerElement.length > 0) {
            markerElement.removeAttr('data-split-marker-id'); // Remove the temporary attribute
            editorInstance.setCaret(markerElement, 4); // Set the caret immediately after the <br> tag
        }

        editorInstance.sync(); // Final synchronization of the editor's state
    }

    // Public interface for the plugin, to be registered with Redactor
    return {
        initializePlugin: function() {
            // Assign the keyboard action handler to Redactor's keydownCallback option.
            // Using an arrow function to ensure 'this' (the Redactor editor instance) is correctly passed.
            this.opts.keydownCallback = (e) => processKeyboardAction(e, this);
        }
    };

})();

// Integrate the new plugin with the Redactor editor framework
if (typeof RedactorPlugins === 'undefined') var RedactorPlugins = {};
RedactorPlugins.blockquote_break = TextEditorEnhancements.QuotationDivider;