// --- Prototype Design Utility Suite v2.1 ---
// A versatile toolkit for in-browser prototyping and interactive design.
// This script enables dynamic content editing and image upload via drag-and-drop.
// Project page: https://example.com/project-repo-link
//
// Author: DevForge Labs
// License: Apache 2.0 (A permissive free software license)

// Module for enabling inline content editing functionality
(function(jq) {
    /**
     * Transforms selected DOM elements into directly editable regions.
     * These elements will display a visual border when focused, indicating their editable state.
     *
     * @returns {jQuery} The jQuery object for method chaining.
     */
    jq.fn.enableInlineEditing = function() {
        const CSS_EDITABLE_CLASS = 'is-editable-content-block'; // Class for general editable styling
        const FOCUSED_BORDER_STYLE = '2px dashed #4CAF50';       // Border when element is focused
        const IDLE_BORDER_STYLE = '1px solid transparent';       // Default border when not focused

        // Guard clause: Check for browser compatibility (though contenteditable is widely supported)
        if (!('contentEditable' in document.documentElement)) {
            console.warn('Inline editing feature may not be fully supported in this browser environment.');
            return this; // Return early if the core feature is missing
        }

        return this.each(function() {
            const currentTargetElement = jq(this); // Cache the jQuery object for efficiency

            // Configure the element to be editable and apply initial styling
            currentTargetElement.attr('contenteditable', true);
            currentTargetElement.css('border', IDLE_BORDER_STYLE); // Set the default border

            // Add a class to the element, allowing for more complex styling via external CSS
            currentTargetElement.addClass(CSS_EDITABLE_CLASS);

            // Attach event listeners for visual feedback on focus and blur events
            currentTargetElement.on('focus.inlineEdit', function() { // Use namespaced event
                jq(this).css('border', FOCUSED_BORDER_STYLE);
            }).on('blur.inlineEdit', function() {
                jq(this).css('border', IDLE_BORDER_STYLE);
                // Potential enhancement: Trigger a custom event here, e.g., 'contentSaved'
                // jq(this).trigger('contentUpdated', [jq(this).text()]);
            });

            // Prevent default browser behavior for specific key presses within editable elements
            currentTargetElement.on('keypress.inlineEdit', function(keyboardEvent) {
                // Example: Prevent new lines (Enter key) within header tags
                if (keyboardEvent.which === 13 && jq(this).is('h1, h2, h3, h4, h5, h6')) {
                    keyboardEvent.preventDefault();
                }
            });
        });
    };
})(jQuery); // Pass jQuery object to the IIFE

// Module for handling image file drag-and-drop uploads
(function(domUtil) {
    /**
     * Configures selected image elements to function as drag-and-drop targets for image files.
     * Upon dropping an image, the target element's 'src' attribute is updated to display the new image.
     *
     * @returns {jQuery} The jQuery object for method chaining.
     */
    domUtil.fn.installFileDropHandler = function() {
        const CLASS_DRAG_ACTIVE = 'is-drag-over-zone'; // CSS class for drag-over state
        const BASE_OPACITY = 1.0;                      // Normal opacity of the element
        const DRAG_VISUAL_OPACITY = 0.65;              // Opacity when an item is dragged over

        // Essential: Ensure 'dataTransfer' property is available on jQuery event objects.
        // This is crucial for accessing file data from drag-and-drop events.
        if (!domUtil.event.props.includes('dataTransfer')) {
            domUtil.event.props.push('dataTransfer');
        }

        return this.each(function() {
            const currentDropTarget = domUtil(this); // Store reference to the current image element

            // Event handler for when a file is dropped onto the element
            currentDropTarget.on('drop.fileUpload', function(eventObj) { // Use namespaced event
                eventObj.preventDefault(); // Prevent browser from navigating to the dropped file
                eventObj.stopPropagation(); // Stop event propagation

                currentDropTarget.removeClass(CLASS_DRAG_ACTIVE); // Remove visual feedback class
                currentDropTarget.css('opacity', BASE_OPACITY);   // Reset opacity to normal

                const droppedFiles = eventObj.dataTransfer.files; // Access the list of dropped files

                // Validation: Check if any files were actually dropped
                if (!droppedFiles || droppedFiles.length === 0) {
                    console.warn('No files detected in the drop event data transfer.');
                    return;
                }

                const primaryFile = droppedFiles[0]; // Process only the first file if multiple are dropped

                // Validation: Ensure the dropped file is an image type
                if (!primaryFile.type.startsWith('image/')) {
                    console.warn('Dropped file is not a recognized image type:', primaryFile.type);
                    alert('Please ensure the file you drop is an image (e.g., JPEG, PNG, GIF).');
                    return;
                }

                // Create a temporary URL for the local file, making it accessible to the browser
                const imageLocalUrl = window.URL.createObjectURL(primaryFile);

                // Update the 'src' attribute of the image element to display the new picture
                currentDropTarget.attr('src', imageLocalUrl);

                // Optional: Revoke the object URL after image loading or after a delay
                // This helps free up memory, but needs careful timing.
                // currentDropTarget.one('load', () => window.URL.revokeObjectURL(imageLocalUrl));
            });

            // Event handler for when an item is dragged over the element
            currentDropTarget.on('dragover.fileUpload', function(eventObj) {
                eventObj.preventDefault(); // Allow a drop to occur
                eventObj.stopPropagation(); // Prevent unwanted bubbling
                currentDropTarget.css('opacity', DRAG_VISUAL_OPACITY);
                currentDropTarget.addClass(CLASS_DRAG_ACTIVE); // Apply visual feedback class
            });

            // Event handler for when a dragged item leaves the element's boundaries
            currentDropTarget.on('dragleave.fileUpload', function(eventObj) {
                // Note: dragleave can fire when moving between a parent and child element.
                // For simplicity, we reset visual state on any leave.
                currentDropTarget.css('opacity', BASE_OPACITY);
                currentDropTarget.removeClass(CLASS_DRAG_ACTIVE); // Remove visual feedback
            });

            // Event handler for when a dragged item enters the element's boundaries
            currentDropTarget.on('dragenter.fileUpload', function(eventObj) {
                // This event can be used for more precise visual feedback on entry
                // console.log('Drag operation entered element:', this);
            });
        });
    };
})(jQuery); // Pass jQuery object to the IIFE

// Main initialization block: Ensures the script runs only after the DOM is fully loaded
jQuery(document).ready(function() {
    // Announce script initialization in the console for debugging purposes
    console.log('Prototype Design Utility Suite: DOM fully loaded. Initializing interactive components...');

    // Identify and enable inline editing for specific content blocks.
    // Using more specific selectors (classes, data attributes) for better targeting.
    const targetsForEditableContent = 'div.design-text-block, p.editable-field, h4[data-editable="true"]';
    jQuery(targetsForEditableContent).enableInlineEditing();
    console.info(`Activated inline editing for elements matching selector: "${targetsForEditableContent}"`);

    // Identify and configure image elements to accept drag-and-drop file uploads.
    // Targeting images specifically marked as drop zones.
    const targetsForImageDropZones = 'img.design-image-placeholder';
    jQuery(targetsForImageDropZones).installFileDropHandler();
    console.info(`Configured image drop zones for elements matching selector: "${targetsForImageDropZones}"`);

    // Global error handling: Catch unhandled promise rejections (modern JavaScript feature)
    window.addEventListener('unhandledrejection', promiseRejectionEvent => {
        console.error('An unhandled promise rejection occurred:', promiseRejectionEvent.reason);
        // promiseRejectionEvent.preventDefault(); // Uncomment to prevent default browser logging
    });
});