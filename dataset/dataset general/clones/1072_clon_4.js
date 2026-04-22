(function() {

    const activationAttribute = 'data-control-activation';
    const filterKeyAttribute = 'data-filter-key';
    const contentCategoryAttribute = 'data-content-category';
    const visualTransitionDuration = 200; // Milliseconds, roughly 'fast'

    // Manages the visual state and display property of an element with transition
    function updateElementPresentation(elementNode, shouldDisplay) {
        if (shouldDisplay) {
            // Ensure element is visible before starting fade-in
            elementNode.style.display = ''; // Restore default display
            elementNode.style.visibility = 'visible'; // Ensure it's not hidden by visibility
            elementNode.style.opacity = '0'; // Start from invisible

            // Force a reflow to ensure display change is applied before opacity transition
            void elementNode.offsetWidth; 

            elementNode.style.transition = `opacity ${visualTransitionDuration}ms ease-out`;
            elementNode.style.opacity = '1'; // Fade in

            // Clear transition style after it completes
            setTimeout(() => {
                elementNode.style.transition = '';
            }, visualTransitionDuration);

        } else {
            // Start fade-out
            elementNode.style.transition = `opacity ${visualTransitionDuration}ms ease-out`;
            elementNode.style.opacity = '0';
            elementNode.style.visibility = 'hidden'; // Make it non-interactive during fade-out

            // After fade-out, set display to none
            setTimeout(() => {
                elementNode.style.display = 'none';
                elementNode.style.transition = ''; // Clear transition style
            }, visualTransitionDuration);
        }
    }

    // Handles the filtering process based on a given category identifier
    function conductCategoryFiltering(categoryIdentifier) {
        const allCategorizedElements = document.querySelectorAll(`[${contentCategoryAttribute}]`);

        Array.from(allCategorizedElements).forEach(itemElement => {
            const itemAssociatedCategory = itemElement.getAttribute(contentCategoryAttribute);
            const matchFound = (itemAssociatedCategory === categoryIdentifier || categoryIdentifier === 'all');
            
            updateElementPresentation(itemElement, matchFound);
        });
    }

    // Initializes the global event listener for filter triggers
    function initializeFilterMechanism() {
        document.body.addEventListener('click', (interactionEvent) => {
            const interactionOrigin = interactionEvent.target.closest(`[${activationAttribute}]`);

            if (interactionOrigin) {
                const requestedCategory = interactionOrigin.getAttribute(filterKeyAttribute);
                if (requestedCategory) {
                    conductCategoryFiltering(requestedCategory);
                }
            }
        });
    }

    // Attach the initialization function to the DOMContentLoaded event
    document.addEventListener('DOMContentLoaded', initializeFilterMechanism);

})();