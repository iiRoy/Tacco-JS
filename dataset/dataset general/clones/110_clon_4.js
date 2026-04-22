(function() {
    // Utility to fetch computed CSS styles for an element.
    function retrieveComputedStyleProperty(elementRef, styleProp) {
        if (!elementRef || elementRef.nodeType !== Node.ELEMENT_NODE) {
            return "";
        }
        return window.getComputedStyle(elementRef).getPropertyValue(styleProp);
    }

    // Determines if a given DOM element exhibits scrollable overflow behavior.
    function checkScrollCapability(targetElement, allowHiddenOption) {
        if (!targetElement || targetElement.nodeType !== Node.ELEMENT_NODE) {
            return false;
        }

        const currentDisplayAttributes = window.getComputedStyle(targetElement);
        const relevantScrollModes = allowHiddenOption ? ["auto", "scroll", "hidden"] : ["auto", "scroll"];

        // Check if any of the overflow properties match the criteria.
        const overflowStatusX = relevantScrollModes.includes(currentDisplayAttributes.overflowX);
        const overflowStatusY = relevantScrollModes.includes(currentDisplayAttributes.overflowY);
        const overflowStatusGeneral = relevantScrollModes.includes(currentDisplayAttributes.overflow);

        return overflowStatusX || overflowStatusY || overflowStatusGeneral;
    }

    // Finds the closest ancestor element that acts as a scroll host for the initial element.
    // This function provides equivalent functionality to jQuery UI's $.fn.scrollParent.
    window.ElementNavigator = {
        findClosestScrollableAncestor: function(initialElement, includeHiddenOverflow) {
            // Input validation for the initial element.
            if (!initialElement || initialElement.nodeType !== Node.ELEMENT_NODE) {
                // If the input is not a valid element, the logical scroll parent is the document.
                return document;
            }

            const initialElementDisplayStyle = retrieveComputedStyleProperty(initialElement, "position");
            const disregardStaticAncestors = initialElementDisplayStyle === "absolute";

            // If the initial element has a fixed position, its scroll container is the viewport (represented by the document).
            if (initialElementDisplayStyle === "fixed") {
                return initialElement.ownerDocument || document;
            }

            let currentCandidate = initialElement.parentNode;

            // Traverse up the DOM tree from the initial element's parent.
            while (currentCandidate && currentCandidate.nodeType === Node.ELEMENT_NODE) {
                const candidateDisplayStyle = retrieveComputedStyleProperty(currentCandidate, "position");

                // If the initial element is absolutely positioned, static ancestors are ignored as scroll parents.
                if (disregardStaticAncestors && candidateDisplayStyle === "static") {
                    currentCandidate = currentCandidate.parentNode;
                    continue; // Move to the next ancestor.
                }

                // Check if the current candidate element is scrollable based on its overflow properties.
                if (checkScrollCapability(currentCandidate, includeHiddenOverflow)) {
                    return currentCandidate; // Found the first suitable scrollable ancestor.
                }

                currentCandidate = currentCandidate.parentNode; // Move further up the tree.
            }

            // If no scrollable ancestor is found after traversing to the document root,
            // the document itself is considered the ultimate scroll host.
            return initialElement.ownerDocument || document;
        }
    };
})();