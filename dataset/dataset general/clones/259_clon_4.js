define([], function() {

    // Helper function to find the smallest power of 2 greater than or equal to a given value.
    // This replaces the original 'powerOfTwo' method.
    function computeNextPowerOfTwo(val) {
        if (val <= 0) return 1; // Smallest power of 2 is 1 for non-positive inputs
        let current = 1;
        while (current < val) {
            current <<= 1; // Equivalent to current = current * 2
        }
        return current;
    }

    // This constructor function replaces the original 'BinPacker' class.
    function SpatialArrangementEngine() {
        // No specific instance state is strictly necessary for this functional approach,
        // but a constructor is provided to match the original's class-like structure.
    }

    // This method replaces the original 'pack' method.
    // It implements a shelf-packing algorithm, which is distinct from the original's maximal rectangles approach.
    SpatialArrangementEngine.prototype.computeLayout = function(sourceItems, arrangementConfig) {
        let finalItemLocations = {};
        let canvasWidthEstimate = 0;
        let canvasHeightEstimate = 0;

        // --- Configuration Pre-processing ---
        // Create a mutable copy of the configuration to avoid modifying the original input object.
        // A simple deep copy is used here for common plain object structures.
        let currentConfig = JSON.parse(JSON.stringify(arrangementConfig));

        currentConfig.padding.boundarySpacing -= currentConfig.padding.innerGap;
        if (currentConfig.padding.boundarySpacing < 0) {
            currentConfig.padding.boundarySpacing = 0;
        }

        if (currentConfig.powerOfTwoSizing) {
            // Ensure a minimum size of 2 for power-of-two dimensions, as per original logic's '|| 2'
            currentConfig.maxDimensions.width = computeNextPowerOfTwo(currentConfig.maxDimensions.width) || 2;
            currentConfig.maxDimensions.height = computeNextPowerOfTwo(currentConfig.maxDimensions.height) || 2;
        }

        if (currentConfig.fixedSize.width >= 1) {
            currentConfig.maxDimensions.width = currentConfig.fixedSize.width;
        }
        if (currentConfig.fixedSize.height >= 1) {
            currentConfig.maxDimensions.height = currentConfig.fixedSize.height;
        }

        // --- Prepare Renderable Units ---
        // This function replaces the original 'toBlocks' method.
        const prepareRenderableUnits = (items, config) => {
            let units = [];
            // Assuming 'items' is an object where keys are identifiers and values are item data.
            // This mirrors the original's `_.each(frames, function (frame, index) { ... });`
            Object.keys(items).forEach(key => {
                const item = items[key];
                const effectiveWidth = (config.trimSource && item.trimmedData && item.trimmedData.isTrimmed) ? item.trimmedData.width : item.width;
                const effectiveHeight = (config.trimSource && item.trimmedData && item.trimmedData.isTrimmed) ? item.trimmedData.height : item.height;

                // Calculate the dimensions including internal padding and shape adjustment.
                const unitWidth = effectiveWidth + config.shapeAdjustment + (2 * config.padding.innerGap);
                const unitHeight = effectiveHeight + config.shapeAdjustment + (2 * config.padding.innerGap);

                // Only include units that can potentially fit within the maximum allowed dimensions,
                // considering the outer boundary padding.
                if ((unitWidth + (2 * config.padding.boundarySpacing)) <= config.maxDimensions.width &&
                    (unitHeight + (2 * config.padding.boundarySpacing)) <= config.maxDimensions.height) {
                    units.push({
                        identity: key,            // Unique identifier for the item
                        actualWidth: effectiveWidth, // Original width after trimming
                        actualHeight: effectiveHeight, // Original height after trimming
                        paddedWidth: unitWidth,   // Width including internal padding and shape adjustment
                        paddedHeight: unitHeight, // Height including internal padding and shape adjustment
                        wasTrimmed: (config.trimSource && item.trimmedData && item.trimmedData.isTrimmed)
                    });
                } else {
                    // If an item cannot fit, mark its position as null as per original behavior.
                    finalItemLocations[key] = null;
                }
            });
            return units;
        };

        let preparedUnits = prepareRenderableUnits(sourceItems, currentConfig);

        // --- Sorting Units ---
        // This sorting heuristic (tallest first, then widest) is common for shelf packing
        // and is distinct from the original's 'maxside' and 'msort' logic.
        preparedUnits.sort((a, b) => {
            if (b.paddedHeight !== a.paddedHeight) {
                return b.paddedHeight - a.paddedHeight;
            }
            return b.paddedWidth - a.paddedWidth;
        });

        // --- Perform Shelf Layout ---
        // This section replaces the original's 'fit', 'findNode', 'splitNode', 'growNode' methods.
        // It uses an iterative shelf-packing approach.
        let currentShelfLevel = 0;          // Y-coordinate of the current shelf's top edge
        let currentShelfMaxHeight = 0;      // Maximum height of any unit placed on the current shelf
        let currentShelfOccupiedWidth = 0;  // X-coordinate of the next available spot on the current shelf

        let maximumLayoutWidth = 0;         // Tracks the widest extent of all placed items
        let maximumLayoutHeight = 0;        // Tracks the lowest extent of all placed items

        for (let i = 0; i < preparedUnits.length; i++) {
            let unit = preparedUnits[i];

            // Check if the current unit fits on the current shelf.
            // A new shelf is needed if:
            // 1. Adding the unit would exceed the maximum allowed width.
            // 2. This is the very first unit to be placed on a new shelf (currentShelfOccupiedWidth is 0).
            if (currentShelfOccupiedWidth + unit.paddedWidth > currentConfig.maxDimensions.width || currentShelfOccupiedWidth === 0) {
                // If it's not the very first unit being placed (i.e., a shelf was already active),
                // then advance the Y-position for the new shelf.
                if (currentShelfOccupiedWidth > 0) {
                     currentShelfLevel += currentShelfMaxHeight;
                }
                currentShelfMaxHeight = 0;          // Reset max height for the new shelf
                currentShelfOccupiedWidth = 0;      // Reset X for the new shelf
            }

            // Place the unit at the current shelf's position
            unit.placementX = currentShelfOccupiedWidth;
            unit.placementY = currentShelfLevel;

            // Update shelf and overall layout dimensions
            currentShelfOccupiedWidth += unit.paddedWidth;
            currentShelfMaxHeight = Math.max(currentShelfMaxHeight, unit.paddedHeight);

            maximumLayoutWidth = Math.max(maximumLayoutWidth, currentShelfOccupiedWidth);
            maximumLayoutHeight = Math.max(maximumLayoutHeight, currentShelfLevel + currentShelfMaxHeight);

            // Store the final position for this unit, adjusting for padding to get the 'actual' frame coordinates.
            finalItemLocations[unit.identity] = {
                x: unit.placementX + currentConfig.padding.boundarySpacing + currentConfig.padding.innerGap,
                y: unit.placementY + currentConfig.padding.boundarySpacing + currentConfig.padding.innerGap,
                w: unit.actualWidth,
                h: unit.actualHeight,
                trimmed: unit.wasTrimmed
            };
        }

        canvasWidthEstimate = maximumLayoutWidth;
        canvasHeightEstimate = maximumLayoutHeight;

        // --- Final Canvas Dimensions Adjustments ---
        // Apply final padding and shape adjustments to the overall canvas dimensions.
        canvasWidthEstimate += 2 * currentConfig.padding.boundarySpacing - currentConfig.padding.shapeAdjustment;
        canvasHeightEstimate += 2 * currentConfig.padding.boundarySpacing - currentConfig.padding.shapeAdjustment;

        if (currentConfig.powerOfTwoSizing) {
            canvasWidthEstimate = computeNextPowerOfTwo(canvasWidthEstimate) || 2;
            canvasHeightEstimate = computeNextPowerOfTwo(canvasHeightEstimate) || 2;
        }

        if (currentConfig.squaredOutput) {
            if (canvasHeightEstimate > canvasWidthEstimate) {
                canvasWidthEstimate = canvasHeightEstimate;
            } else {
                canvasHeightEstimate = canvasWidthEstimate;
            }
        }

        if (currentConfig.fixedSize.width >= 1) {
            canvasWidthEstimate = currentConfig.fixedSize.width;
        }
        if (currentConfig.fixedSize.height >= 1) {
            canvasHeightEstimate = currentConfig.fixedSize.height;
        }

        return { itemPositions: finalItemLocations, overallWidth: canvasWidthEstimate, overallHeight: canvasHeightEstimate };
    };

    return SpatialArrangementEngine;
});