/*
 * Module: Dynamic Overlay Controller
 * Purpose: A jQuery plugin to manage an interactive overlay element with draggable functionality.
 * Author: CodeCrafter
 * License: Apache 2.0
*/

(function(jQ) {

jQ.fn.overlayControl = function(options) {

    // Configuration defaults and user overrides
    const config = jQ.extend({
        vertBuffer: 30, // Vertical padding for handle movement
        horizBuffer: 30, // Horizontal padding for handle movement
        initialX: 30, // Starting X position for the handle
        initialY: 30, // Starting Y position for the handle
        orientation: "horizontal" // Control orientation: "horizontal" or "vertical"
    }, options);

    // Validate orientation to prevent unexpected behavior
    if (!['horizontal', 'vertical'].includes(config.orientation)) {
        console.warn("overlayControl: Invalid 'orientation' option. Defaulting to 'horizontal'.");
        config.orientation = "horizontal";
    }

    return this.each(function() {
        // Cache jQuery objects and initial dimensions
        const $containerEl = jQ(this);
        const $overlayEl = $containerEl.find('>.changeable');
        const $dragHandle = $containerEl.find('>.handle');

        let containerWidth = $containerEl.innerWidth();
        let containerHeight = $containerEl.innerHeight();

        let minHandleX = config.horizBuffer;
        let maxHandleX = containerWidth - config.horizBuffer;
        let minHandleY = config.vertBuffer;
        let maxHandleY = containerHeight - config.vertBuffer;

        let currentInitialX = config.initialX; // Use a mutable variable for bounds checking
        let currentInitialY = config.initialY; // Use a mutable variable for bounds checking

        // Ensure initial handle position is within bounds
        currentInitialX = Math.max(minHandleX, Math.min(maxHandleX, currentInitialX));
        currentInitialY = Math.max(minHandleY, Math.min(maxHandleY, currentInitialY));

        // Set background images based on data attributes
        const passiveImg = $containerEl.data('passive');
        const activeImg = $containerEl.data('active');
        if (passiveImg) {
            $containerEl.css('background-image', `url(${passiveImg})`);
        }
        if (activeImg) {
            $overlayEl.css('background-image', `url(${activeImg})`);
        }

        // Initialize overlay to match container height
        $overlayEl.height(containerHeight);

        // Add decorative elements to the handle
        $dragHandle.html('<span class="pointer-left arrow-icon"></span><span class="pointer-right arrow-icon"></span>');

        // Set initial handle position
        $dragHandle.css({
            left: currentInitialX,
            top: currentInitialY
        });

        // Apply initial overlay dimensions and visual cues based on orientation
        const dividerStyle = '1px dashed #FFF'; // Helper variable for common style
        if (config.orientation === "horizontal") {
            $overlayEl.width(currentInitialX);
            $overlayEl.css('border-right', dividerStyle);
        } else if (config.orientation === "vertical") {
            $overlayEl.height(currentInitialY);
            $overlayEl.css('border-bottom', dividerStyle);
            $dragHandle.addClass('vertical-orientation');
        }

        // --- Dragging Logic ---
        let isDragging = false; // Flag to track drag state
        let dragStartX = 0;
        let dragStartY = 0;
        let initialHandleX = 0;
        let initialHandleY = 0;

        // Event handler for mouse down on the handle
        $dragHandle.on('mousedown.overlayDrag', function(eventObj) { // Added namespace
            eventObj.preventDefault(); // Prevent default browser drag behavior
            isDragging = true;
            $dragHandle.addClass('is-dragging');
            initialHandleX = parseInt($dragHandle.css('left'), 10);
            dragStartX = eventObj.pageX;
            initialHandleY = parseInt($dragHandle.css('top'), 10);
            dragStartY = eventObj.pageY;

            // Bind mousemove to document to capture drags outside the container
            // and mouseup to document to ensure drag ends even if mouse leaves page
            jQ(document).on('mousemove.overlayDrag', handleDragEvent);
            jQ(document).on('mouseup.overlayDrag', endDragOperation);
        });

        // Function to end the drag operation
        function endDragOperation() {
            if (isDragging) {
                isDragging = false;
                $dragHandle.removeClass('is-dragging');
                jQ(document).off('.overlayDrag'); // Unbind all namespaced events
            }
        }

        // Main drag event handler
        function handleDragEvent(eventObj) {
            if (!isDragging) { // Guard clause: Only proceed if dragging
                return;
            }

            // Calculate new handle position
            let currentHandleX = initialHandleX + (eventObj.pageX - dragStartX);
            let currentHandleY = initialHandleY + (eventObj.pageY - dragStartY);

            // Clamp handle position within defined boundaries
            currentHandleX = Math.max(minHandleX, Math.min(maxHandleX, currentHandleX));
            currentHandleY = Math.max(minHandleY, Math.min(maxHandleY, currentHandleY));

            // Update handle CSS position
            $dragHandle.css({
                left: currentHandleX,
                top: currentHandleY
            });

            // Adjust overlay dimensions based on new handle position
            adjustOverlayDimension(currentHandleX, currentHandleY);
        }

        // Function to update the overlay element's dimension
        function adjustOverlayDimension(newWidth, newHeight) {
            if (config.orientation === "horizontal") {
                $overlayEl.width(newWidth);
            } else if (config.orientation === "vertical") {
                $overlayEl.height(newHeight);
            }
        }
    });
};

})(jQuery);