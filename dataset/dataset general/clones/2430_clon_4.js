(function() {
    /**
     * Configures specified elements to be content-editable and applies a visual border.
     * @param {string} targetSelection - A CSS selector string for the elements to target.
     */
    function modifyContentEdit(targetSelection) {
        const elementsToAlter = document.querySelectorAll(targetSelection);

        elementsToAlter.forEach(function(currentElement) {
            currentElement.setAttribute('contenteditable', 'true');
            currentElement.style.border = '1px solid rgba(0, 0, 0, 0.3)';
            currentElement.style.outline = 'none';
        });
    }

    /**
     * Enables drag-and-drop image upload functionality for specified image elements.
     * Dropping an image file onto one of these elements will update its 'src' attribute.
     * @param {string} imageSelection - A CSS selector string for the image elements to target.
     */
    function manageImageDrop(imageSelection) {
        const designatedImageHolders = document.querySelectorAll(imageSelection);

        designatedImageHolders.forEach(function(imageDisplayUnit) {
            // Prevent default browser behavior for drag events
            imageDisplayUnit.addEventListener('dragover', function(interactionEvent) {
                interactionEvent.preventDefault();
                this.style.opacity = '0.5';
            });

            imageDisplayUnit.addEventListener('dragleave', function(interactionEvent) {
                interactionEvent.preventDefault();
                this.style.opacity = '1';
            });

            imageDisplayUnit.addEventListener('drop', function(interactionEvent) {
                interactionEvent.preventDefault();

                const incomingFiles = interactionEvent.dataTransfer.files;
                if (incomingFiles.length > 0 && incomingFiles[0].type.startsWith('image/')) {
                    const temporaryObjectUrl = window.URL.createObjectURL(incomingFiles[0]);
                    this.setAttribute('src', temporaryObjectUrl);
                }
                this.style.opacity = '1';
            });
        });
    }

    // Execute functions once the entire document is loaded
    document.addEventListener('DOMContentLoaded', function() {
        modifyContentEdit('p, h4');
        manageImageDrop('img');
    });

})();