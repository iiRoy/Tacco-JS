jQuery(function($) {
    // This script manages a draggable focal point marker on an image within a form row.
    // It synchronizes the marker's position with hidden input fields.

    // --- Configuration Constants ---
    const TARGET_CONTAINER_SELECTOR = '.form-row.file .thumbnail, .form-row.field-file .thumbnail';
    const INDICATOR_CLASS = 'position-indicator-marker';
    const WRAPPER_CLASS = 'marker-overlay-wrapper';
    const INPUT_X_ID = '#id_focal_x';
    const INPUT_Y_ID = '#id_focal_y';
    const DEFAULT_COORD_X = 0.5; // Center X
    const DEFAULT_COORD_Y = 0.5; // Center Y
    const COORDINATE_PRECISION = 3; // Decimal places for coordinate storage/display

    // Helper to clamp a value between 0 and 1
    const clampNormalizedValue = (value) => Math.min(1, Math.max(0, value));

    // Helper to parse and sanitize a coordinate string from an input field
    const parseCoordinateString = (coordStr, fallbackValue) => {
        const cleanedStr = String(coordStr || '').replace(/[^0-9.]/g, ''); // Remove non-numeric/non-dot chars
        if (cleanedStr === '') {
            return fallbackValue;
        }
        const parsedVal = parseFloat(cleanedStr);
        return isNaN(parsedVal) ? fallbackValue : parsedVal;
    };

    // Helper to format a coordinate value for display in an input field
    const formatCoordinateForInput = (value, decimalPlaces) => {
        const factor = Math.pow(10, decimalPlaces);
        return Math.round(value * factor) / factor;
    };

    // --- Main Execution Block ---
    const imageDisplayWrappers = $(TARGET_CONTAINER_SELECTOR);

    // If no relevant image containers are found, exit early.
    if (!imageDisplayWrappers.length) {
        return;
    }

    // Process each identified image container (though typically there's only one per form)
    imageDisplayWrappers.each(function() {
        const currentWrapper = $(this); // The .thumbnail element
        const primaryImage = $('img', currentWrapper);

        // Ensure we have an image to work with
        if (!primaryImage.length) {
            console.warn('No image found within the target thumbnail container:', currentWrapper);
            return;
        }

        // Retrieve or default to image dimensions
        const imageEffectiveWidth = parseInt(primaryImage.attr('width') || primaryImage.prop('naturalWidth') || 0, 10);
        const imageEffectiveHeight = parseInt(primaryImage.attr('height') || primaryImage.prop('naturalHeight') || 0, 10);

        // If image dimensions are not available, we cannot proceed reliably.
        if (imageEffectiveWidth <= 0 || imageEffectiveHeight <= 0) {
            console.warn('Image dimensions could not be determined for:', primaryImage);
            return;
        }

        // Locate coordinate input fields
        const coordInputX = $(INPUT_X_ID);
        const coordInputY = $(INPUT_Y_ID);

        if (!coordInputX.length || !coordInputY.length) {
            console.warn('Focal point input fields (X or Y) not found. Expected IDs:', INPUT_X_ID, INPUT_Y_ID);
            return;
        }

        // Create the visual marker and its containing wrapper
        const positionIndicator = $('<span />', { class: INDICATOR_CLASS });
        const overlayWrapper = $('<div />', { class: WRAPPER_CLASS });

        // Append elements to the DOM
        overlayWrapper.append(positionIndicator);
        currentWrapper.append(overlayWrapper);

        // Retrieve actual dimensions of the created indicator
        const indicatorActualWidth = positionIndicator.outerWidth();
        const indicatorActualHeight = positionIndicator.outerHeight();

        // Adjust wrapper size and position to effectively center the indicator's origin (top-left corner)
        // at the image's top-left corner, making the image the 'draggable area'.
        overlayWrapper.width(imageEffectiveWidth + indicatorActualWidth);
        overlayWrapper.height(imageEffectiveHeight + indicatorActualHeight);
        overlayWrapper.css({
            left: -indicatorActualWidth / 2,
            top: -indicatorActualHeight / 2
        });

        // Store image dimensions on the wrapper for easier access in event handlers
        overlayWrapper.data('img-width', imageEffectiveWidth);
        overlayWrapper.data('img-height', imageEffectiveHeight);

        /**
         * Updates the visual position of the marker based on normalized (0-1) coordinates.
         * @param {number} normX - Normalized X coordinate (0-1).
         * @param {number} normY - Normalized Y coordinate (0-1).
         */
        const updateMarkerVisualPosition = (normX, normY) => {
            const actualImgW = overlayWrapper.data('img-width');
            const actualImgH = overlayWrapper.data('img-height');
            positionIndicator.css({
                left: normX * actualImgW,
                top: normY * actualImgH
            });
        };

        /**
         * Retrieves the current normalized (0-1) coordinates from the marker's visual position.
         * @param {number} [precision] - Number of decimal places for rounding.
         * @returns {{x: number, y: number}} - Object with normalized x and y coordinates.
         */
        const getMarkerNormalizedCoordinates = (precision) => {
            const currentOffset = positionIndicator.position();
            const actualImgW = overlayWrapper.data('img-width');
            const actualImgH = overlayWrapper.data('img-height');

            let currentNormX = clampNormalizedValue(currentOffset.left / actualImgW);
            let currentNormY = clampNormalizedValue(currentOffset.top / actualImgH);

            if (precision !== undefined && precision > 0) {
                currentNormX = formatCoordinateForInput(currentNormX, precision);
                currentNormY = formatCoordinateForInput(currentNormY, precision);
            }
            return { x: currentNormX, y: currentNormY };
        };

        /**
         * Synchronizes the input fields with the current marker position.
         */
        const updateInputFieldsFromMarker = () => {
            const coords = getMarkerNormalizedCoordinates(COORDINATE_PRECISION);
            coordInputX.val(coords.x);
            coordInputY.val(coords.y);
        };

        /**
         * Synchronizes the marker position based on values in the input fields.
         */
        const updateMarkerFromInputFields = () => {
            let valX = coordInputX.val();
            let valY = coordInputY.val();

            // Parse values, using defaults if inputs are empty or invalid
            let newX = parseCoordinateString(valX, DEFAULT_COORD_X);
            let newY = parseCoordinateString(valY, DEFAULT_COORD_Y);

            // Clamp and update input fields with cleaned/defaulted values
            newX = clampNormalizedValue(newX);
            newY = clampNormalizedValue(newY);

            if (valX === '' || parseFloat(valX) !== newX) { // Update input if it was empty or value changed after clamping
                coordInputX.val(formatCoordinateForInput(newX, COORDINATE_PRECISION));
            }
            if (valY === '' || parseFloat(valY) !== newY) {
                coordInputY.val(formatCoordinateForInput(newY, COORDINATE_PRECISION));
            }

            // Apply visual update
            updateMarkerVisualPosition(newX, newY);
        };

        // Make the position indicator draggable
        positionIndicator.draggable({
            containment: overlayWrapper, // Restrict dragging to the wrapper area
            drag: updateInputFieldsFromMarker // Update inputs as the marker moves
        });

        // Attach event handlers for input field changes
        coordInputX.on('change', updateMarkerFromInputFields);
        coordInputY.on('change', updateMarkerFromInputFields);

        // Set the initial marker position based on input values or defaults
        updateMarkerFromInputFields();

        // --- Collapse Fieldset Handling ---
        const parentFieldset = coordInputX.closest('fieldset');
        const collapseToggle = parentFieldset.find('.collapse-toggle');

        if (parentFieldset.hasClass('collapsed')) {
            overlayWrapper.hide(); // Hide the marker overlay if the fieldset is collapsed initially
        }

        // Toggle visibility of the marker overlay when the fieldset collapse state changes
        collapseToggle.on('click', function() {
            overlayWrapper.toggle();
        });
    });
});