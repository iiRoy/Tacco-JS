/**
 * A specialized utility for efficiently arranging a collection of graphical assets
 * onto a single, larger texture sheet or atlas. This implementation is based
 * on a modified binary tree bin-packing algorithm, aiming to minimize wasted space.
 *
 * This software is provided under the MIT License.
 *
 * Derived work. Original concepts and algorithms by Jake Gordon and Sebastian Nette.
 *
 * @version 1.0.0
 * @author [Your Name/Company Here] (inspired by original authors)
 */
class TextureSheetLayoutEngine {

    /**
     * Initializes a new instance of the layout engine.
     * Sets up internal state for managing layout results and configuration.
     */
    constructor() {
        /**
         * Stores the final placement data for each arranged element.
         * @type {Object.<string, {x: number, y: number, width: number, height: number, wasTrimmed: boolean}|null>}
         */
        this.layoutResults = {};

        /**
         * The active configuration settings for the current packing operation.
         * @type {object}
         */
        this.currentSettings = {};

        /**
         * The calculated final width of the texture sheet.
         * @type {number}
         */
        this.finalSheetWidth = 0;

        /**
         * The calculated final height of the texture sheet.
         * @type {number}
         */
        this.finalSheetHeight = 0;

        /**
         * The root node of the binary tree representing the available space on the canvas.
         * @type {object|null}
         */
        this.rootCanvas = null;
    }

    /**
     * Arranges a collection of source elements (e.g., image frames) onto a texture sheet
     * according to the provided layout settings.
     *
     * @param {Object.<string, object>} sourceElements - An object where keys are element identifiers
     *                                                   and values are objects containing `width`, `height`,
     *                                                   and optional `trimmedSize` properties.
     * @param {object} [userSettings={}] - Configuration options for the packing process.
     * @param {object} [userSettings.padding={border: 0, inner: 0, shape: 0}] - Padding settings.
     * @param {number} [userSettings.padding.border=0] - Padding around the entire sheet.
     * @param {number} [userSettings.padding.inner=0] - Padding between individual elements.
     * @param {number} [userSettings.padding.shape=0] - Additional shape-specific padding.
     * @param {boolean} [userSettings.powerOfTwo=false] - If true, ensures final dimensions are powers of two.
     * @param {boolean} [userSettings.squared=false] - If true, forces final sheet to be square.
     * @param {object} [userSettings.fixed={w: 0, h: 0}] - Fixed width/height for the sheet.
     * @param {number} [userSettings.fixed.w=0] - Fixed width.
     * @param {number} [userSettings.fixed.h=0] - Fixed height.
     * @param {boolean} [userSettings.trim=false] - If true, uses `trimmedSize` from elements if available.
     * @param {object} [userSettings.maxsize={w: 4096, h: 4096}] - Maximum allowed sheet dimensions.
     * @returns {{elements: Object.<string, object>, width: number, height: number}} - An object
     *          containing the layout results (`elements`) and the final sheet dimensions.
     */
    arrangeItems(sourceElements, userSettings = {}) {
        // --- Input Validation and Setup ---
        const elementKeys = Object.keys(sourceElements);
        if (!elementKeys.length) {
            console.warn("No elements provided for layout. Returning an empty result.");
            return { elements: {}, width: 0, height: 0 };
        }

        const defaultSettings = {
            padding: { border: 0, inner: 0, shape: 0 },
            powerOfTwo: false,
            squared: false,
            fixed: { w: 0, h: 0 },
            trim: false,
            maxsize: { w: 4096, h: 4096 }
        };
        this.currentSettings = {
            ...defaultSettings,
            ...userSettings,
            padding: { ...defaultSettings.padding, ...(userSettings.padding || {}) },
            fixed: { ...defaultSettings.fixed, ...(userSettings.fixed || {}) },
            maxsize: { ...defaultSettings.maxsize, ...(userSettings.maxsize || {}) }
        };

        this.layoutResults = {};
        this.finalSheetWidth = 0;
        this.finalSheetHeight = 0;

        // --- Padding Normalization ---
        let effectiveBorderPadding = this.currentSettings.padding.border - this.currentSettings.padding.inner;
        this.currentSettings.padding.border = Math.max(0, effectiveBorderPadding); // Ensure non-negative

        // --- Max Size Adjustments ---
        if (this.currentSettings.powerOfTwo) {
            this.currentSettings.maxsize.w = this.findNextPowerOfTwo(this.currentSettings.maxsize.w) || 2;
            this.currentSettings.maxsize.h = this.findNextPowerOfTwo(this.currentSettings.maxsize.h) || 2;
        }

        if (this.currentSettings.fixed.w >= 1) {
            this.currentSettings.maxsize.w = this.currentSettings.fixed.w;
        }
        if (this.currentSettings.fixed.h >= 1) {
            this.currentSettings.maxsize.h = this.currentSettings.fixed.h;
        }

        // --- Block Conversion and Sorting ---
        const itemBlocks = this.convertItemsToBlocks(sourceElements);
        if (!itemBlocks.length) {
             console.warn("All provided elements were too large to fit. Returning an empty result.");
             return { elements: {}, width: 0, height: 0 };
        }

        itemBlocks.sort((blockA, blockB) => this.getSortingStrategy(blockA, blockB));

        // --- Core Packing Algorithm ---
        this.performPacking(itemBlocks);

        // --- Result Processing and Final Dimension Calculation ---
        const totalPaddingOffset = this.currentSettings.padding.border + this.currentSettings.padding.inner;

        for (const currentBlock of itemBlocks) {
            if (currentBlock.placement) {
                const positionedX = currentBlock.placement.x + totalPaddingOffset;
                const positionedY = currentBlock.placement.y + totalPaddingOffset;

                this.layoutResults[currentBlock.elementIdentifier] = {
                    x: positionedX,
                    y: positionedY,
                    width: currentBlock.placement.width,
                    height: currentBlock.placement.height,
                    wasTrimmed: currentBlock.trimmedFlag
                };
                this.finalSheetWidth = Math.max(this.finalSheetWidth, positionedX + currentBlock.actualWidth);
                this.finalSheetHeight = Math.max(this.finalSheetHeight, positionedY + currentBlock.actualHeight);
            } else {
                // If an item couldn't be placed, mark it as null
                this.layoutResults[currentBlock.elementIdentifier] = null;
            }
        }

        // --- Post-Packing Dimension Adjustments ---
        this.finalSheetWidth += (2 * this.currentSettings.padding.border) - this.currentSettings.padding.shape;
        this.finalSheetHeight += (2 * this.currentSettings.padding.border) - this.currentSettings.padding.shape;

        if (this.currentSettings.powerOfTwo) {
            this.finalSheetWidth = this.findNextPowerOfTwo(this.finalSheetWidth) || 2;
            this.finalSheetHeight = this.findNextPowerOfTwo(this.finalSheetHeight) || 2;
        }

        if (this.currentSettings.squared) {
            const maximumDimension = Math.max(this.finalSheetWidth, this.finalSheetHeight);
            this.finalSheetWidth = maximumDimension;
            this.finalSheetHeight = maximumDimension;
        }

        // Apply fixed dimensions if specified, overriding other calculations
        if (this.currentSettings.fixed.w >= 1) { this.finalSheetWidth = this.currentSettings.fixed.w; }
        if (this.currentSettings.fixed.h >= 1) { this.finalSheetHeight = this.currentSettings.fixed.h; }

        return { elements: this.layoutResults, width: this.finalSheetWidth, height: this.finalSheetHeight };
    }

    /**
     * Calculates the smallest power of two that is greater than or equal to the given value.
     * @param {number} value - The input number.
     * @returns {number} The next power of two.
     */
    findNextPowerOfTwo(value) {
        if (value <= 0) return 1;
        let power = 1;
        while (power < value) {
            power <<= 1; // Bit shift left is equivalent to multiplying by 2
        }
        return power;
    }

    /**
     * Converts raw item data into standardized block objects, applying padding and trimming.
     * Filters out blocks that are too large to fit within the maximum allowed dimensions.
     *
     * @param {Object.<string, object>} rawItems - The input elements.
     * @returns {Array<object>} An array of processed block objects.
     */
    convertItemsToBlocks(rawItems) {
        const processedBlocks = [];
        const { trim, padding, maxsize } = this.currentSettings;

        for (const [identifier, itemData] of Object.entries(rawItems)) {
            let effectiveWidth = itemData.width;
            let effectiveHeight = itemData.height;
            let isTrimmed = false;

            if (trim && itemData.trimmedSize && itemData.trimmedSize.trimmed) {
                effectiveWidth = itemData.trimmedSize.width;
                effectiveHeight = itemData.trimmedSize.height;
                isTrimmed = true;
            }

            // Calculate dimensions including shape and inner padding
            const blockContentWidth = effectiveWidth + padding.shape + (2 * padding.inner);
            const blockContentHeight = effectiveHeight + padding.shape + (2 * padding.inner);

            const newBlock = {
                elementIdentifier: identifier,
                actualWidth: blockContentWidth,
                actualHeight: blockContentHeight,
                trimmedFlag: isTrimmed
            };

            // Check if the block, including border padding, can fit within max dimensions
            const totalRequiredWidth = newBlock.actualWidth + (2 * padding.border);
            const totalRequiredHeight = newBlock.actualHeight + (2 * padding.border);

            if (totalRequiredWidth <= maxsize.w && totalRequiredHeight <= maxsize.h) {
                processedBlocks.push(newBlock);
            } else {
                console.warn(`Element '${identifier}' (${itemData.width}x${itemData.height}) is too large to fit within the maximum sheet dimensions (${maxsize.w}x${maxsize.h}) and will be skipped.`);
            }
        }
        return processedBlocks;
    }

    /**
     * Generic helper for comparing two block dimensions in descending order.
     * @param {object} blockA - First block.
     * @param {object} blockB - Second block.
     * @param {string} dimensionKey - The key for the dimension to compare (e.g., 'actualWidth').
     * @returns {number} Comparison result.
     */
    _compareByDimension(blockA, blockB, dimensionKey) {
        return blockB[dimensionKey] - blockA[dimensionKey];
    }

    /**
     * Compares blocks by width in descending order.
     * @param {object} blockA - First block.
     * @param {object} blockB - Second block.
     * @returns {number} Comparison result.
     */
    compareByWidthDesc(blockA, blockB) {
        return this._compareByDimension(blockA, blockB, 'actualWidth');
    }

    /**
     * Compares blocks by height in descending order.
     * @param {object} blockA - First block.
     * @param {object} blockB - Second block.
     * @returns {number} Comparison result.
     */
    compareByHeightDesc(blockA, blockB) {
        return this._compareByDimension(blockA, blockB, 'actualHeight');
    }

    /**
     * Compares blocks by their maximum side length in descending order.
     * @param {object} blockA - First block.
     * @param {object} blockB - Second block.
     * @returns {number} Comparison result.
     */
    compareByMaxSideDesc(blockA, blockB) {
        const maxA = Math.max(blockA.actualWidth, blockA.actualHeight);
        const maxB = Math.max(blockB.actualWidth, blockB.actualHeight);
        return maxB - maxA;
    }

    /**
     * Compares blocks by their minimum side length in descending order.
     * @param {object} blockA - First block.
     * @param {object} blockB - Second block.
     * @returns {number} Comparison result.
     */
    compareByMinSideDesc(blockA, blockB) {
        const minA = Math.min(blockA.actualWidth, blockA.actualHeight);
        const minB = Math.min(blockB.actualWidth, blockB.actualHeight);
        return minB - minA;
    }

    /**
     * Applies a multi-criteria sorting strategy to two blocks.
     * @param {object} block1 - First block.
     * @param {object} block2 - Second block.
     * @returns {number} Comparison result based on predefined criteria.
     */
    getSortingStrategy(block1, block2) {
        const sortingCriteria = ["maxSide", "minSide", "height", "width"];

        for (const criterion of sortingCriteria) {
            let comparisonResult = 0;
            switch (criterion) {
                case "maxSide":
                    comparisonResult = this.compareByMaxSideDesc(block1, block2);
                    break;
                case "minSide":
                    comparisonResult = this.compareByMinSideDesc(block1, block2);
                    break;
                case "height":
                    comparisonResult = this.compareByHeightDesc(block1, block2);
                    break;
                case "width":
                    comparisonResult = this.compareByWidthDesc(block1, block2);
                    break;
                default:
                    // Fallback for unrecognized criteria, though should not occur
                    console.error(`Unknown sorting criterion encountered: ${criterion}`);
                    break;
            }
            if (comparisonResult !== 0) {
                return comparisonResult;
            }
        }
        return 0; // Blocks are considered equal by all criteria
    }

    /**
     * Executes the main bin packing logic, attempting to fit each block.
     * @param {Array<object>} elementsToPack - The sorted array of block objects.
     */
    performPacking(elementsToPack) {
        if (elementsToPack.length === 0) {
            this.rootCanvas = null;
            return;
        }

        // Initialize the root canvas with the dimensions of the first block
        const initialWidth = elementsToPack[0].actualWidth;
        const initialHeight = elementsToPack[0].actualHeight;

        // The root node represents the entire available space
        this.rootCanvas = { x: 0, y: 0, width: initialWidth, height: initialHeight };

        for (const currentElement of elementsToPack) {
            let assignedPlacement = null;
            // First, try to find an existing empty space (node) in the tree
            const availableNode = this.locateFitNode(this.rootCanvas, currentElement.actualWidth, currentElement.actualHeight);

            if (availableNode) {
                // If a suitable node is found, split it to accommodate the current element
                assignedPlacement = this.allocateSpace(availableNode, currentElement.actualWidth, currentElement.actualHeight);
            } else {
                // If no existing node fits, the canvas needs to expand
                assignedPlacement = this.expandCanvas(currentElement.actualWidth, currentElement.actualHeight);
            }
            currentElement.placement = assignedPlacement; // Store the resulting placement
        }
    }

    /**
     * Recursively searches the binary tree for an unoccupied node that can fit the required dimensions.
     * @param {object} currentNode - The current node in the tree being examined.
     * @param {number} requiredWidth - The width of the item to fit.
     * @param {number} requiredHeight - The height of the item to fit.
     * @returns {object|null} The fitting node, or null if no fit is found.
     */
    locateFitNode(currentNode, requiredWidth, requiredHeight) {
        // If the current node is occupied, traverse its children
        if (currentNode.occupied) {
            return this.locateFitNode(currentNode.rightChild, requiredWidth, requiredHeight) ||
                   this.locateFitNode(currentNode.downChild, requiredWidth, requiredHeight);
        }
        // If the current node is unoccupied and large enough, it's a fit
        else if ((requiredWidth <= currentNode.width) && (requiredHeight <= currentNode.height)) {
            return currentNode;
        }
        // Otherwise, no fit in this node or its children
        else {
            return null;
        }
    }

    /**
     * Marks a node as occupied and splits its remaining space into two child nodes
     * (one to the right, one below).
     *
     * @param {object} targetNode - The node where the item will be placed.
     * @param {number} itemWidth - The width of the item.
     * @param {number} itemHeight - The height of the item.
     * @returns {object} The target node, now marked as occupied and with children defined.
     */
    allocateSpace(targetNode, itemWidth, itemHeight) {
        targetNode.occupied = true; // Mark this space as taken

        // Define the remaining space to the right of the placed item
        targetNode.rightChild = {
            x: targetNode.x + itemWidth,
            y: targetNode.y,
            width: targetNode.width - itemWidth,
            height: itemHeight
        };

        // Define the remaining space below the placed item
        targetNode.downChild = {
            x: targetNode.x,
            y: targetNode.y + itemHeight,
            width: targetNode.width,
            height: targetNode.height - itemHeight
        };

        return targetNode;
    }

    /**
     * Attempts to expand the canvas (the `rootCanvas` node) to accommodate a new item
     * when no existing space is found. Prioritizes directions based on current dimensions
     * and configured constraints (e.g., power-of-two, max size).
     *
     * @param {number} itemWidth - The width of the item to place.
     * @param {number} itemHeight - The height of the item to place.
     * @returns {object|null} The node representing the allocated space, or null if expansion fails.
     */
    expandCanvas(itemWidth, itemHeight) {
        const currentRoot = this.rootCanvas;
        const { padding, powerOfTwo, maxsize } = this.currentSettings;

        const canExtendDown = (itemWidth <= currentRoot.width);
        const canExtendRight = (itemHeight <= currentRoot.height);

        // Determine preferred growth direction based on current aspect ratio
        let preferExtendRight = canExtendRight && (currentRoot.height >= (currentRoot.width + itemWidth));
        let preferExtendDown = canExtendDown && (currentRoot.width >= (currentRoot.height + itemHeight));

        // Special handling for power-of-two constraint to guide growth
        if (powerOfTwo) {
            const nextPoTWidth = this.findNextPowerOfTwo(currentRoot.width);
            const nextPoTHeight = this.findNextPowerOfTwo(currentRoot.height);

            const effectiveProposedWidthRight = currentRoot.width + itemWidth + (2 * padding.border) - padding.shape;
            const effectiveProposedHeightDown = currentRoot.height + itemHeight + (2 * padding.border) - padding.shape;

            // If growing right would exceed the current PoT but growing down keeps it within a reasonable range,
            // and down is an option, prioritize down. This is the "dirty" logic from the original.
            if (effectiveProposedWidthRight > (nextPoTWidth + (2 * padding.border) - padding.shape) &&
                (effectiveProposedHeightDown <= (nextPoTHeight * 2 + (2 * padding.border) - padding.shape)) &&
                canExtendDown) {
                preferExtendDown = true;
                preferExtendRight = false;
            }
        }

        // Max size constraints: prevent growth beyond configured limits
        const potentialNewWidthRight = currentRoot.width + itemWidth;
        const potentialNewHeightDown = currentRoot.height + itemHeight;

        if (potentialNewWidthRight + (2 * padding.border) - padding.shape > maxsize.w) {
            preferExtendRight = false;
            canExtendRight = false;
        }
        if (potentialNewHeightDown + (2 * padding.border) - padding.shape > maxsize.h) {
            preferExtendDown = false;
            canExtendDown = false;
        }

        // Apply growth based on preferences and possibilities
        if (preferExtendRight) {
            return this.growCanvasRight(itemWidth, itemHeight);
        } else if (preferExtendDown) {
            return this.growCanvasDown(itemWidth, itemHeight);
        } else if (canExtendRight) {
            return this.growCanvasRight(itemWidth, itemHeight);
        } else if (canExtendDown) {
            return this.growCanvasDown(itemWidth, itemHeight);
        } else {
            // Cannot grow in any direction to fit the item
            console.warn(`Unable to expand canvas to fit item of ${itemWidth}x${itemHeight}. Max dimensions reached or item is too large.`);
            return null;
        }
    }

    /**
     * Expands the main canvas by extending it to the right.
     * The old root becomes the 'down' child of the new, larger root.
     *
     * @param {number} newBlockWidth - The width of the item that necessitated the growth.
     * @param {number} newBlockHeight - The height of the item.
     * @returns {object|null} The allocated node, or null if an internal error occurs.
     */
    growCanvasRight(newBlockWidth, newBlockHeight) {
        // Create a new root that's wider, with the old root positioned to its left-down
        this.rootCanvas = {
            occupied: true, // The new root is occupied by its children
            x: 0,
            y: 0,
            width: this.rootCanvas.width + newBlockWidth,
            height: this.rootCanvas.height,
            downChild: this.rootCanvas, // The old root is now the 'down' child of the new root
            rightChild: { x: this.rootCanvas.width, y: 0, width: newBlockWidth, height: this.rootCanvas.height }
        };

        // Now, try to fit the block into the newly created space (rightChild)
        const potentialNode = this.locateFitNode(this.rootCanvas, newBlockWidth, newBlockHeight);
        if (potentialNode) {
            return this.allocateSpace(potentialNode, newBlockWidth, newBlockHeight);
        } else {
            // This scenario indicates a logic error if growCanvasRight was called correctly
            console.error("Internal logic error: Failed to allocate space after growing canvas right.");
            return null;
        }
    }

    /**
     * Expands the main canvas by extending it downwards.
     * The old root becomes the 'right' child of the new, taller root.
     *
     * @param {number} newBlockWidth - The width of the item that necessitated the growth.
     * @param {number} newBlockHeight - The height of the item.
     * @returns {object|null} The allocated node, or null if an internal error occurs.
     */
    growCanvasDown(newBlockWidth, newBlockHeight) {
        // Create a new root that's taller, with the old root positioned to its top-right
        this.rootCanvas = {
            occupied: true,
            x: 0,
            y: 0,
            width: this.rootCanvas.width,
            height: this.rootCanvas.height + newBlockHeight,
            downChild:  { x: 0, y: this.rootCanvas.height, width: this.rootCanvas.width, height: newBlockHeight },
            rightChild: this.rootCanvas // The old root is now the 'right' child of the new root
        };

        // Now, try to fit the block into the newly created space (downChild)
        const potentialNode = this.locateFitNode(this.rootCanvas, newBlockWidth, newBlockHeight);
        if (potentialNode) {
            return this.allocateSpace(potentialNode, newBlockWidth, newBlockHeight);
        } else {
            console.error("Internal logic error: Failed to allocate space after growing canvas down.");
            return null;
        }
    }
}

export default TextureSheetLayoutEngine;