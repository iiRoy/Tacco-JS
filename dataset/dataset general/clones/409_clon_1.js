/*
 * This JavaScript file defines a comprehensive library of functions
 * organized into namespaces under the global 'alessndro' object.
 * These utilities are designed for use within Sketch plugins,
 * covering common tasks such as layer processing, sizing, alignment,
 * text manipulation, color management, network requests,
 * and grid interactions.
 */
var alessndro = alessndro || {};


// The 'common' namespace contains general-purpose utility functions
// that are frequently used across different parts of the plugin.
alessndro.common = {

    /**
     * Recursively traverses through an array of Sketch layers.
     * Applies a provided callback function to each individual layer.
     * If a layer is identified as a group, its child layers are also
     * processed in a recursive manner.
     *
     * @param {NSArray} layers   An array of MSLayer objects to iterate over.
     * @param {Function} callback The function to execute for each layer.
     */
    processAllLayers: function(layers, callback) {

        for (var i = 0; i < [layers count]; i++) {

            var layer = [layers objectAtIndex:i];

            // Output the current layer object to the console for debugging
            log(layer)

            if ([layer isMemberOfClass:[MSLayerGroup class]]) {
                callback(layer);
                // For a layer group, apply the callback, then
                // recursively process all of its contained sub-layers.
                alessndro.common.processAllLayers([layer layers], callback);
            }
            else {
                // If it's not a group, simply apply the callback function.
                callback(layer);
            }
        }
    },


    /**
     * Retrieves the baseline interval value configured for the current artboard.
     * This value is extracted from the vertical ruler data of the artboard.
     *
     * @returns {Number} The numerical value of the baseline interval.
     */
    getArtboardBaselineInterval: function() {

        var artboard_ruler = [[[doc currentPage] currentArtboard] verticalRulerData];
        // Calculate the interval based on the difference between the first two guides.
        var baseline = [artboard_ruler guideAtIndex: 1] - [artboard_ruler guideAtIndex: 0];

        // Returns the position of the second guide, which represents the interval.
        return [artboard_ruler guideAtIndex: 1];
    },


    /**
     * Computes the closest integer coefficient of a given value
     * with respect to the currently defined baseline grid interval.
     *
     * For instance, if the baseline grid interval is 20px:
     * - A value of 24 will yield a coefficient of 1 (closer to 20 than 40).
     * - A value of 35 will yield a coefficient of 2 (closer to 40 than 20).
     *
     * @param {Number} value The numeric value for which to calculate the coefficient.
     * @returns {Number} The calculated coefficient. Returns 1 if the coefficient is 0.
     */
    calculateCoefficient: function(value) {

        var coefficient;
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();

        if (value % baseline_interval === 0) {
            // If the value is a perfect multiple of the interval, the calculation is straightforward.
            coefficient = value / baseline_interval;
        }
        else {
            // Determine whether the value is closer to the floor or ceiling multiple of the interval.
            if (value % baseline_interval > (baseline_interval / 2)) {
                coefficient = Math.ceil(value / baseline_interval);
            }
            else {
                coefficient = Math.floor(value / baseline_interval);
            }
        }
        // Ensures that a coefficient of 0 is treated as 1, preventing potential issues like division by zero.
        return coefficient === 0 ? 1 : coefficient;
    },


    /**
     * Displays a native alert dialog box using the Sketch application's UI.
     *
     * @param {String} title   The title text to display on the alert dialog.
     * @param {String} message The main message content of the alert dialog.
     */
    alert: function(title, message) {

        var app = [NSApplication sharedApplication];
        [app displayDialog: message withTitle: title];
    }
};


// The 'size' namespace provides functions for resizing Sketch layers,
// often in relation to grid systems.
alessndro.size = {

    /**
     * Adjusts the height of a given Sketch layer ('item') to a specified new height.
     * This method works around Sketch's API by incrementally adjusting the frame.
     *
     * @param {MSLayer} item       The Sketch layer whose height needs to be adjusted.
     * @param {Number} new_height The desired new height for the layer.
     */
    resizeHeightTo: function(item, new_height) {

        var current_height = [[item frame] height];

        // Sketch's API does not provide a direct method to set height.
        // Therefore, we subtract the current height (minus one pixel) and
        // then add the new height (minus one pixel) to effectively set it.
        [[item frame] subtractHeight: current_height - 1];
        [[item frame] addHeight: new_height - 1];
    },


    /**
     * Adjusts the width of a given Sketch layer ('item') to a specified new width.
     * Similar to `resizeHeightTo`, this function manipulates the frame indirectly.
     *
     * @param {MSLayer} item      The Sketch layer whose width needs to be adjusted.
     * @param {Number} new_width The desired new width for the layer.
     */
    resizeWidthTo: function(item, new_width) {

        var current_width = [[item frame] width];

        // Indirect frame manipulation is required as there is no direct 'setWidth' method.
        [[item frame] subtractWidth: current_width - 1];
        [[item frame] addWidth: new_width - 1];
    },


    /**
     * Resizes a Sketch layer's height to align it with the nearest baseline grid interval.
     * The new height is determined by calculating a coefficient relative to the baseline.
     *
     * @param {MSLayer} item The Sketch layer to resize.
     */
    resizeToBaselineGrid: function(item) {

        var item_height = [[item frame] height];
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();
        var new_height_coefficient = alessndro.common.calculateCoefficient(item_height);
        var new_height = baseline_interval * new_height_coefficient;

        alessndro.size.resizeHeightTo(item, new_height);
    },


    /**
     * Resizes a Sketch layer's width to align it with the horizontal grid system.
     * First, the item's left edge is aligned, then its width is adjusted to snap
     * to the nearest column's right edge.
     *
     * @param {Object} grid The horizontal grid object (e.g., `alessndro.grid.HorizontalGrid`).
     * @param {MSLayer} item The Sketch layer to resize.
     */
    resizeToHorizontalGrid: function(grid, item) {

        // The initial step is to align the left edge of the item to the closest gridline.
        alessndro.alignment.alignLeftEdgeToNearestGridline(grid, item);

        var item_width = [[item frame] width];
        var item_x2_pos = item_width + [[item frame] x];
        var nearest_column_index = grid.findNearestEndGridlineIndex(item);
        var nearest_column = grid.columns[nearest_column_index];
        var new_width = nearest_column.end - [[item frame] x];

        alessndro.size.resizeWidthTo(item, new_width);
    },


    /**
     * Increases the height of a Sketch layer by one full baseline grid interval.
     *
     * @param {MSLayer} item The Sketch layer to expand.
     */
    expandToBaselineGrid: function(item) {

        var item_height = [[item frame] height];
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();

        alessndro.size.resizeHeightTo(item, item_height + baseline_interval);
    },


    /**
     * Decreases the height of a Sketch layer by one full baseline grid interval.
     *
     * @param {MSLayer} item The Sketch layer to shrink.
     */
    shrinkToBaselineGrid: function(item) {

        var item_height = [[item frame] height];
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();

        alessndro.size.resizeHeightTo(item, item_height - baseline_interval);
    },


    /**
     * Reduces the width of a Sketch layer to align it with the horizontal grid.
     * It aligns the left edge and then adjusts the width to the closest *previous* column end.
     *
     * @param {Object} grid The horizontal grid object.
     * @param {MSLayer} item The Sketch layer to shrink.
     */
    shrinkToHorizontalGrid: function(grid, item) {

        // First, align the item's left edge to the nearest column gridline.
        alessndro.alignment.alignLeftEdgeToNearestGridline(grid, item);

        var item_width = [[item frame] width];
        var item_x2_pos = item_width + [[item frame] x];
        var nearest_column_index = grid.findNearestEndGridlineIndex(item);

        var nearest_column = grid.columns[nearest_column_index];

        // This conditional logic handles cases where the item is already aligned
        // or if the "nearest" column is actually beyond the item's current position.
        if (nearest_column.end >= item_x2_pos) {
            log("Nearest column end is at or ahead of item's right edge; adjusting to previous column.");
            nearest_column = grid.columns[nearest_column_index - 1];
        }

        var new_width = nearest_column.end - [[item frame] x];

        // Only perform the resize if the calculated new width is not less than the minimum column width.
        if (!(new_width < grid.column_width)) {
            alessndro.size.resizeWidthTo(item, new_width);
        } else {
            log("Shrink operation aborted: new width would be too small (less than column width).");
        }
    },


    /**
     * Increases the width of a Sketch layer to align it with the horizontal grid.
     * It aligns the left edge and then expands the width to the closest *next* column end.
     *
     * @param {Object} grid The horizontal grid object.
     * @param {MSLayer} item The Sketch layer to expand.
     */
    expandToHorizontalGrid: function(grid, item) {

        // Start by aligning the left edge of the item to a horizontal gridline.
        alessndro.alignment.alignLeftEdgeToNearestGridline(grid, item);

        var item_width = [[item frame] width];
        var item_x2_pos = item_width + [[item frame] x];
        var nearest_column_index = grid.findNearestEndGridlineIndex(item);

        var nearest_column = grid.columns[nearest_column_index + 1];
        if (nearest_column.end === item_x2_pos) {
            log("Item's right edge is already aligned with the next column's end; advancing to the subsequent column.");
            nearest_column = grid.columns[nearest_column_index + 2];
        }

        var new_width = nearest_column.end - [[item frame] x];

        alessndro.size.resizeWidthTo(item, new_width);
    }
};


// The 'text' namespace contains functions specifically for manipulating text layers.
alessndro.text = {

    /**
     * Sets the line spacing of a given text layer to ensure it aligns
     * correctly with the current baseline grid established in the artboard.
     *
     * @param {MSTextLayer} text_layer The Sketch text layer to modify.
     */
    setLineSpacingToBaselineGrid: function(text_layer) {

        var baseline_interval = alessndro.common.getArtboardBaselineInterval();

        if ([text_layer fontSize] > baseline_interval) {
            // If the font size exceeds the baseline interval, round up to the nearest multiple.
            [text_layer setLineSpacing: (Math.ceil([text_layer fontSize] / baseline_interval) * baseline_interval)];
        } else {
            // Otherwise, simply set the line spacing to match the baseline interval.
            [text_layer setLineSpacing: baseline_interval];
        }
    }
};


// The 'alignment' namespace provides functions for positioning and aligning
// Sketch layers relative to various grid systems or specific coordinates.
alessndro.alignment = {

    /**
     * Moves a Sketch layer ('item') horizontally to a precise X-coordinate.
     * This function uses the indirect frame manipulation technique.
     *
     * @param {MSLayer} item       The Sketch layer to move.
     * @param {Number} new_x_pos The target X-coordinate for the layer's origin.
     */
    moveToXPosition: function(item, new_x_pos) {

        var current_x_pos = [[item frame] x];
        [[item frame] subtractX: current_x_pos - 1];
        [[item frame] addX: new_x_pos - 1];
    },


    /**
     * Moves a Sketch layer ('item') vertically to a precise Y-coordinate.
     * This function uses the indirect frame manipulation technique.
     *
     * @param {MSLayer} item       The Sketch layer to move.
     * @param {Number} new_y_pos The target Y-coordinate for the layer's origin.
     */
    moveToYPosition: function(item, new_y_pos) {

        var current_y_pos = [[item frame] y];
        [[item frame] subtractY: current_y_pos - 1];
        [[item frame] addY: new_y_pos - 1];
    },


    /**
     * Aligns the top edge of a Sketch layer ('item') to the nearest baseline grid line.
     * The new Y-position is calculated based on the baseline interval and a coefficient.
     *
     * @param {MSLayer} item The Sketch layer to position.
     */
    positionTopOnBaseline: function(item) {

        var item_y_pos = [[item frame] y];
        var new_y_pos_coefficient = alessndro.common.calculateCoefficient(item_y_pos);
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();

        log("_____________________________________");
        log("Baseline interval: " + baseline_interval);
        log("Y Coefficient: " + new_y_pos_coefficient);
        log("Current item y position: " + item_y_pos);
        log("New y position: " + (baseline_interval * new_y_pos_coefficient));

        alessndro.alignment.moveToYPosition(item, baseline_interval * new_y_pos_coefficient);
    },


    /**
     * Aligns the bottom edge of a Sketch layer ('item') to the nearest baseline grid line.
     * The new Y-position is derived from the item's height and the calculated baseline alignment.
     *
     * @param {MSLayer} item The Sketch layer to position.
     */
    positionBottomOnBaseline: function(item) {

        var item_height = [[item frame] height];
        var item_y1_pos = [[item frame] y];
        var item_y2_pos = item_y1_pos + item_height;

        var new_y_pos_coefficient = alessndro.common.calculateCoefficient(item_y2_pos);
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();
        var new_y_pos = (new_y_pos_coefficient * baseline_interval) - item_height;

        alessndro.alignment.moveToYPosition(item, new_y_pos);
    },


    /**
     * Positions the top edge of a Sketch layer ('item') onto the *next* available baseline grid line.
     * This ensures the item moves down to the next grid increment.
     *
     * @param {MSLayer} item The Sketch layer to position.
     */
    positionTopOnNextBaseline: function(item) {

        var item_y_pos = [[item frame] y];
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();

        // Using Math.floor to find the current or immediate preceding baseline,
        // then adding one interval to move to the next.
        var new_y_pos_coefficient = Math.floor(item_y_pos / baseline_interval);
        var new_y_pos = (baseline_interval * new_y_pos_coefficient) + baseline_interval;

        alessndro.alignment.moveToYPosition(item, new_y_pos);
    },


    /**
     * Positions the bottom edge of a Sketch layer ('item') onto the *next* available baseline grid line.
     * This moves the item downwards so its bottom snaps to the subsequent grid line.
     *
     * @param {MSLayer} item The Sketch layer to position.
     */
    positionBottomOnNextBaseline: function(item) {

        var item_height = [[item frame] height];
        var item_y1_pos = [[item frame] y];
        var item_y2_pos = item_y1_pos + item_height;
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();

        // Using Math.floor for the bottom edge's current baseline, then adding an interval.
        var new_y_pos_coefficient = Math.floor(item_y2_pos / baseline_interval);
        var new_y_pos = ((new_y_pos_coefficient * baseline_interval) - item_height) + baseline_interval;

        alessndro.alignment.moveToYPosition(item, new_y_pos);
    },


    /**
     * Positions the top edge of a Sketch layer ('item') onto the *previous* available baseline grid line.
     * This moves the item upwards to the preceding grid increment.
     *
     * @param {MSLayer} item The Sketch layer to position.
     */
    positionTopOnPreviousBaseline: function(item) {

        var item_y_pos = [[item frame] y];
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();

        // Using Math.ceil to find the current or immediate succeeding baseline,
        // then subtracting one interval to move to the previous.
        var new_y_pos_coefficient = Math.ceil(item_y_pos / baseline_interval);
        var new_y_pos = (baseline_interval * new_y_pos_coefficient) - baseline_interval;

        alessndro.alignment.moveToYPosition(item, new_y_pos);
    },


    /**
     * Positions the bottom edge of a Sketch layer ('item') onto the *previous* available baseline grid line.
     * This moves the item upwards so its bottom snaps to the preceding grid line.
     *
     * @param {MSLayer} item The Sketch layer to position.
     */
    positionBottomOnPreviousBaseline: function(item) {

        var item_height = [[item frame] height];
        var item_y1_pos = [[item frame] y];
        var item_y2_pos = item_y1_pos + item_height;
        var baseline_interval = alessndro.common.getArtboardBaselineInterval();

        // Using Math.floor for the bottom edge's current baseline, then subtracting an interval.
        var new_y_pos_coefficient = Math.floor(item_y2_pos / baseline_interval);
        var new_y_pos = ((new_y_pos_coefficient * baseline_interval) - item_height) - baseline_interval;

        alessndro.alignment.moveToYPosition(item, new_y_pos);
    },


    /**
     * Aligns the left edge of the provided Sketch item to the nearest column gridline
     * within the specified horizontal grid.
     *
     * @param {Object} grid The horizontal grid object.
     * @param {MSLayer} item The Sketch layer to align.
     */
    alignLeftEdgeToNearestGridline: function(grid, item) {

        var nearest_gridline_index = grid.findNearestStartGridlineIndex(item);
        alessndro.alignment.moveToXPosition(item, grid.columns[nearest_gridline_index].start);
    },


    /**
     * Aligns the right edge of the provided Sketch item to the nearest column gridline
     * within the specified horizontal grid.
     *
     * @param {Object} grid The horizontal grid object.
     * @param {MSLayer} item The Sketch layer to align.
     */
    alignRightEdgeToNearestGridline: function(grid, item) {

        var nearest_gridline_index = grid.findNearestEndGridlineIndex(item);
        var item_x2_pos = [[item frame] x] + [[item frame] width];

        var position_offset = grid.columns[nearest_gridline_index].end - item_x2_pos;

        alessndro.alignment.moveToXPosition(item, [[item frame] x] + position_offset);
    },


    /**
     * Aligns the left edge of the provided Sketch item to the *next* column gridline
     * in the specified horizontal grid. If the item is at the last column, it wraps
     * around to the first column.
     *
     * @param {Object} grid The horizontal grid object.
     * @param {MSLayer} item The Sketch layer to align.
     */
    alignLeftEdgeToNextGridline: function(grid, item) {

        var nearest_gridline_index = grid.findNearestStartGridlineIndex(item);
        var nearest_column = grid.columns[nearest_gridline_index];
        var item_x_pos = [[item frame] x];

        // This check determines if the "nearest" column found is actually the current
        // or a previous one, in which case we explicitly need to move to the *next* one.
        if ((nearest_column.start < item_x_pos) || (nearest_column.start === item_x_pos)) {

            // If we are at or past the last column, wrap around to the first column.
            var next_column_index = (nearest_gridline_index + 1 > grid.columns.length - 1) ? 0 : nearest_gridline_index + 1;
            alessndro.alignment.moveToXPosition(item, grid.columns[next_column_index].start);
        } else {
            // Otherwise, the nearest column found is already the next one.
            alessndro.alignment.moveToXPosition(item, nearest_column.start);
        }
    },


    /**
     * Aligns the right edge of the provided Sketch item to the *next* column gridline
     * in the specified horizontal grid. Handles wrapping from the last column to the first.
     *
     * @param {Object} grid The horizontal grid object.
     * @param {MSLayer} item The Sketch layer to align.
     */
    alignRightEdgeToNextGridline: function(grid, item) {

        var nearest_gridline_index = grid.findNearestEndGridlineIndex(item);
        var nearest_column = grid.columns[nearest_gridline_index];
        var item_x2_pos = [[item frame] x] + [[item frame] width];

        var position_offset = nearest_column.end - item_x2_pos;

        // Similar logic to `alignLeftEdgeToNextGridline`, ensuring movement to the *next* column.
        if ((nearest_column.end < item_x2_pos) || (nearest_column.end === item_x2_pos)) {

            // Handle wrapping from the last column back to the first.
            var next_column_index = (nearest_gridline_index + 1 > grid.columns.length - 1) ? 0 : nearest_gridline_index + 1;

            position_offset = grid.columns[next_column_index].end - item_x2_pos;
            alessndro.alignment.moveToXPosition(item, [[item frame] x] + position_offset);
        } else {
            // The nearest column is already the intended next one.
            alessndro.alignment.moveToXPosition(item, [[item frame] x] + position_offset);
        }
    },


    /**
     * Aligns the left edge of the provided Sketch item to the *previous* column gridline
     * in the specified horizontal grid. If the item is at the first column, it wraps
     * around to the last column.
     *
     * @param {Object} grid The horizontal grid object.
     * @param {MSLayer} item The Sketch layer to align.
     */
    alignLeftEdgeToPreviousGridline: function(grid, item) {

        var nearest_gridline_index = grid.findNearestStartGridlineIndex(item);
        var nearest_column = grid.columns[nearest_gridline_index];
        var item_x_pos = [[item frame] x];

        // This check determines if the "nearest" column found is actually the current
        // or a subsequent one, requiring explicit movement to the *previous* column.
        if ((nearest_column.start > item_x_pos) || (nearest_column.start === item_x_pos)) {

            // If we are at or before the first column, wrap around to the last column.
            var previous_column_index = (nearest_gridline_index - 1 < 0) ? grid.columns.length - 1 : nearest_gridline_index - 1;
            alessndro.alignment.moveToXPosition(item, grid.columns[previous_column_index].start);
        } else {
            // Otherwise, the nearest column found is already the previous one.
            alessndro.alignment.moveToXPosition(item, nearest_column.start);
        }
    },


    /**
     * Aligns the right edge of the provided Sketch item to the *previous* column gridline
     * in the specified horizontal grid. Handles wrapping from the first column to the last.
     *
     * @param {Object} grid The horizontal grid object.
     * @param {MSLayer} item The Sketch layer to align.
     */
    alignRightEdgeToPreviousGridline: function(grid, item) {

        var nearest_gridline_index = grid.findNearestEndGridlineIndex(item);
        var nearest_column = grid.columns[nearest_gridline_index];
        var item_x2_pos = [[item frame] x] + [[item frame] width];

        var position_offset = nearest_column.end - item_x2_pos;

        // Similar logic to `alignLeftEdgeToPreviousGridline`, ensuring movement to the *previous* column.
        if ((nearest_column.end > item_x2_pos) || (nearest_column.end === item_x2_pos)) {

            // Handle wrapping from the first column back to the last.
            var previous_column_index = (nearest_gridline_index - 1 < 0) ? grid.columns.length - 1 : nearest_gridline_index - 1;

            position_offset = grid.columns[previous_column_index].end - item_x2_pos;
            alessndro.alignment.moveToXPosition(item, [[item frame] x] + position_offset);
        } else {
            // The nearest column is already the intended previous one.
            alessndro.alignment.moveToXPosition(item, [[item frame] x] + position_offset);
        }
    }

};


// The 'type' namespace provides tools for typography, including modular scales.
// The scale ratios are sourced from http://modularscale.com/.
alessndro.type = {

    // A collection of predefined typographic scales and their corresponding ratios.
    scales: {
        "15:16 – Minor Second": 1.067,
        "8:9 – Major Second": 1.125,
        "5:6 – Minor Third": 1.2,
        "4:5 – Major Third": 1.25,
        "3:4 – Perfect Fourth": 1.333,
        "1:√2 – Aug. Fourth / Dim. Fifth": 1.414,
        "2:3 – Perfect Fifth": 1.5,
        "5:8 – Minor Sixth": 1.6,
        "1:1.618 – Golden Section": 1.618,
        "3:5 – Major Sixth": 1.667,
        "9:16 – Minor Seventh": 1.778,
        "8:15 – Major Seventh": 1.875,
        "1:2 – Octave": 2,
        "2:5 – Major Tenth": 2.5,
        "3:8 – Major Eleventh": 2.667,
        "1:3 – Major Twelfth": 3,
        "1:4 – Double Octave": 4,
    },


    /**
     * Generates a typographic scale by duplicating a base text layer.
     * Each new layer's font size is scaled by a given ratio, and it is
     * positioned below the previous layer based on its line spacing.
     *
     * @param {MSTextLayer} base_text_layer The initial text layer to start the scale from.
     * @param {Number} ratio           The modular scale ratio to apply for font size progression.
     * @param {Number} step            The number of additional text layers to generate in the scale.
     */
    drawTypographicScale: function(base_text_layer, ratio, step) {
        // An array to keep track of all text layers created within the scale.
        var text_layers = [base_text_layer];

        for (var i = 0; i < step; i++) {
            // Reference the last created text layer to determine the new layer's properties.
            var previous_text_layer = text_layers[text_layers.length - 1];

            // Sketch's API usually requires duplicating existing layers to create new ones.
            var new_text_layer = [previous_text_layer duplicate];

            var previous_font_size = [previous_text_layer fontSize];
            // Set the new text layer's font size by applying the modular ratio.
            [new_text_layer setFontSize: previous_font_size * ratio];

            // Position the newly created text layer directly below the previous one.
            var previous_text_height = [previous_text_layer lineSpacing];
            var new_text_y_pos = [[previous_text_layer frame] y] + previous_text_height;
            alessndro.alignment.moveToYPosition(new_text_layer, new_text_y_pos);

            // Add the new layer to our array for further processing or tracking.
            text_layers.push(new_text_layer);
        }
    }
};


// The 'colour' namespace provides functions for creating and manipulating colors,
// as well as generating and drawing color palettes.
alessndro.colour = {

    /**
     * Creates an MSColor object (Sketch's native color representation)
     * from a given hexadecimal color string and an alpha (transparency) value.
     *
     * @param {String} hex_string  The hexadecimal color code (e.g., "AABBCC").
     * @param {Number} alpha_value The alpha transparency value, ranging from 0.0 to 1.0.
     * @returns {MSColor} A new MSColor object.
     */
    createColourFromHex: function(hex_string, alpha_value) {
        return [MSColor colorWithHex: "#" + hex_string alpha: alpha_value];
    },


    /**
     * Draws a visual color palette onto the artboard.
     * It uses a `base_layer` as a template for each color swatch,
     * duplicating and coloring it for every color in the `colours_array`.
     *
     * @param {MSLayer} base_layer    A Sketch layer to be used as the template for each color swatch.
     * @param {MSColor[]} colours_array An array of MSColor objects that define the palette.
     */
    drawColourPalette: function(base_layer, colours_array) {

        var first_colour = colours_array[0];
        // Initialize the array of palette layers with the base layer itself.
        var palette_layers = [base_layer];

        // Apply the first color from the array to the base layer.
        var first_fill = [[[base_layer style] fills] firstObject];
        [first_fill setColor: first_colour];

        // Iterate through the remaining colors to create additional swatches.
        for (var i = 1; i < colours_array.length; i++) {
            var previous_layer = palette_layers[palette_layers.length - 1];
            var new_colour_layer = [previous_layer duplicate];

            var new_colour = colours_array[i];
            // Set the color of the duplicated layer's primary fill.
            [[[[new_colour_layer style] fills] firstObject] setColor: new_colour];

            // Position the new color swatch immediately to the right of the previous one.
            var current_x_pos = [[new_colour_layer frame] x];
            var new_x_position = current_x_pos + [[new_colour_layer frame] width];
            alessndro.alignment.moveToXPosition(new_colour_layer, new_x_position);

            palette_layers.push(new_colour_layer);
        }
    },


    /**
     * Generates and returns an array of MSColor objects that represent a monochromatic
     * color scheme, starting from a `base_colour`. This implementation is inspired by
     * the color-palette-creator by Brian Pilati.
     *
     * @param {MSColor} base_colour The foundational color for generating the monochromatic palette.
     * @param {Number} reduction   (Currently unused) A parameter potentially for color reduction logic.
     * @returns {MSColor[]} An array containing the base color, its tints, and its shades.
     */
    createMonochromePalette: function(base_colour, reduction) {
        var mono_palette = [base_colour];

        // Define factors for generating lighter (tints) and darker (shades) variations.
        var tints = [0.8, 0.4];
        var shades = [0.6, 0.3];

        // Extract the individual RGB and alpha components from the base color.
        var red = [base_colour red];
        var green = [base_colour green];
        var blue = [base_colour blue];
        var colour_alpha = [base_colour alpha];

        // Generate and add tints to the palette.
        for (var i = 0; i < tints.length; i++) {
            mono_palette.push([MSColor colorWithRed: (red + (1 - red) * tints[i]) green: (green + (1 - green) * tints[i]) blue: (blue + (1 - blue) * tints[i]) alpha: colour_alpha]);
        }

        // Generate and add shades to the palette.
        for (var i = 0; i < shades.length; i++) {
            mono_palette.push([MSColor colorWithRed: (red * shades[i]) green: (green * shades[i]) blue: (blue * shades[i]) alpha: colour_alpha]);
        }

        return mono_palette;
    }
};


// The 'network' namespace provides functions for performing HTTP network requests.
alessndro.network = {

    /**
     * Executes a synchronous HTTP request to a specified URL using a given HTTP method.
     * This function leverages Sketch's underlying Cocoa framework for network operations.
     *
     * @param {String} url         The full URL endpoint for the request.
     * @param {String} method_name The HTTP method to use (e.g., "GET", "POST", "PUT").
     * @returns {String} The response body of the HTTP request, decoded as a UTF8 string.
     */
    makeRequest: function(url, method_name) {

        var request_url = [NSURL URLWithString: url];

        // Create a mutable URL request with a specific cache policy and timeout duration.
        var request = NSMutableURLRequest.requestWithURL_cachePolicy_timeoutInterval(request_url, NSURLRequestReloadIgnoringLocalCacheData, 60);
        request.setHTTPMethod_(method_name);

        // Send the synchronous request and capture the response.
        var response = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:nil];
        // Convert the raw response data into a human-readable UTF8 string.
        response_text = [[NSString alloc] initWithData:response encoding:NSUTF8StringEncoding];

        return response_text;
    }
};


// The 'colourlovers' namespace specifically handles interactions with the ColourLovers API.
alessndro.colourlovers = {

    /**
     * Parses a JSON response from the ColourLovers API and generates an array of MSColor objects.
     * It randomly selects one color palette from the received data and converts its hexadecimal
     * color values into Sketch's native MSColor format.
     *
     * @param {String} json_response The raw JSON string obtained from the ColourLovers API.
     * @returns {MSColor[]} An array of MSColor objects representing a randomly chosen palette.
     */
    createPaletteFromJSON: function(json_response) {

        var parsed_response = JSON.parse(json_response);
        var no_of_palettes = parsed_response.length;
        // Randomly select an index to pick one palette from the list.
        var random_palette_index = Math.floor(Math.random() * no_of_palettes);
        var random_palette = parsed_response[random_palette_index];

        var colours = [];
        var palette_colour_list = random_palette["colors"];

        // Iterate through the list of hexadecimal color codes in the selected palette.
        for (var i = 0; i < palette_colour_list.length; i++) {
            // Convert each hex string to an MSColor object with full opacity.
            var colour = alessndro.colour.createColourFromHex(palette_colour_list[i], 1.0);
            colours.push(colour);
        }

        return colours;
    }
};


// This section defines the 'grid' namespace, which encapsulates functionality
// for interacting with Sketch's layout grids and defining grid-related objects.
// Is this the correct way to define a class under a namespace in JS? Yes, it's a common pattern.
alessndro.grid = {

    /**
     * The `HorizontalGrid` constructor creates an object that represents
     * a Sketch layout grid, typically configured via 'View > Canvas > Layout Settings'.
     * It extracts various properties of the grid from the current artboard's layout data.
     *
     * @constructor
     */
    HorizontalGrid: function() {
        this.grid = [[[doc currentPage] currentArtboard] layout];
        this.gutter_width = this.grid.gutterWidth();
        this.no_of_gutters = this.grid.totalNumberOfGutters();
        this.column_width = this.grid.columnWidth();
        this.no_of_columns = this.grid.numberOfColumns();
        // Calculate the total width occupied by the grid columns and gutters.
        this.grid_width = (this.no_of_gutters * this.gutter_width) + (this.no_of_columns * this.column_width);
        this.hasGuttersOutside = this.grid.guttersOutside() === 1 ? true : false;
        // Convert Sketch's raw grid data into a more manageable array of custom Column objects.
        this.columns = this.convertSketchGridToColumns();
    },

    /**
     * The `Column` constructor creates a simple object representing a single
     * column within the horizontal grid, defined by its start and end X-coordinates.
     *
     * @constructor
     * @param {Number} start_x The X-coordinate of the column's left boundary.
     * @param {Number} end_x   The X-coordinate of the column's right boundary.
     */
    Column: function(start_x, end_x) {
        this.start = start_x;
        this.end = end_x;
    }
};


/**
 * Extends the `HorizontalGrid` prototype with a `toString` method.
 * This method generates a string summary of the grid's properties, useful for debugging.
 *
 * @returns {String} A descriptive string containing grid dimensions and column information.
 */
alessndro.grid.HorizontalGrid.prototype.toString = function() {
    var grid_string = "Column: " + this.column_width + " || Gutter: " + this.gutter_width + " ";
    for (i = 0; i < this.columns.length; i++) {
        grid_string += this.columns[i]; // Assumes the Column object also has a reasonable toString method.
    }

    return grid_string += "Gutters?: " + this.hasGuttersOutside;
};


/**
 * Extends the `HorizontalGrid` prototype with a method to convert Sketch's native
 * grid layout into an array of custom `Column` objects. This abstraction simplifies
 * working with individual grid columns.
 *
 * @returns {alessndro.grid.Column[]} An array of `Column` objects representing the grid structure.
 */
alessndro.grid.HorizontalGrid.prototype.convertSketchGridToColumns = function() {
    if (this.hasGuttersOutside) {
        // If gutters are configured to be outside the columns, the first column
        // starts after an initial half-gutter space.
        var first_column = new alessndro.grid.Column((this.gutter_width / 2), (this.gutter_width / 2) + this.column_width);