/*
 * Revised texture atlas generation algorithm.
 * Based on work by Sebastian Nette (c) 2014
 * Original source: https://github.com/jakesgordon/bin-packing
 * (c) 2011, 2012, 2013 Jake Gordon and contributors
 *
 * Distributed under the MIT License.
 * For details, see: http://www.opensource.org/licenses/mit-license.php
 */

define( [ ], function ( ) {

	var AtlasArranger = BaseObject.derive({
		
		/**
		 * Constructor for the AtlasArranger.
		 * Initializes internal state.
		 */
		initialize: function() {
		},

		/**
		 * Arranges a collection of graphic assets into an atlas.
		 * @param {Array<Object>} graphicAssets - An array of asset objects to be packed.
		 * @param {Object} layoutSettings - Configuration options for the packing process.
		 * @returns {Object} An object containing the positioned assets and final atlas dimensions.
		 */
		arrangeItems: function(graphicAssets, layoutSettings) {

			// Store references to the asset map and configuration
			this.assetMap = { };
			this.settings = layoutSettings;
			this.finalWidth = 0;
			this.finalHeight = 0;

			// Adjust outer spacing based on inner spacing
			this.settings.spacing.outer -= this.settings.spacing.internal;
			if(this.settings.spacing.outer < 0) {
				this.settings.spacing.outer = 0;
			}

			// Ensure maximum dimensions are powers of two if configured
			if(this.settings.nextPowerOfTwo) {
				this.settings.maximumDimensions.widthLimit = this.nextPowerOfTwo(this.settings.maximumDimensions.widthLimit) || 2;
				this.settings.maximumDimensions.heightLimit = this.nextPowerOfTwo(this.settings.maximumDimensions.heightLimit) || 2;
			}

			// Apply fixed width if specified
			if(this.settings.fixedDimensions.fixedWidth >= 1) { 
				this.settings.maximumDimensions.widthLimit = this.settings.fixedDimensions.fixedWidth; 
			}

			// Apply fixed height if specified
			if(this.settings.fixedDimensions.fixedHeight >= 1) {
				this.settings.maximumDimensions.heightLimit = this.settings.fixedDimensions.fixedHeight; 
			}

			// Convert graphic assets to packable units and sort them
			var itemUnits = this.convertToUnits(graphicAssets).sort(function(unitA, unitB) {
				return this.sortBySize(unitA, unitB);
			}.bind(this));

			// Attempt to place all units
			this.placeUnits(itemUnits);
			
			// Process the placed units to generate final frame data
			for(var idx = 0 ; idx < itemUnits.length ; idx++) {
				var currentUnit = itemUnits[idx];
				if (currentUnit.placement) { // If the unit was successfully placed
					this.assetMap[currentUnit.assetKey] = {
						posX: currentUnit.placement.posX + this.settings.spacing.outer + this.settings.spacing.internal,
						posY: currentUnit.placement.posY + this.settings.spacing.outer + this.settings.spacing.internal,
						unitWidth: currentUnit.placement.unitWidth,
						unitHeight: currentUnit.placement.unitHeight,
						isTrimmed: currentUnit.t
					};
					// Update overall atlas dimensions
					this.finalWidth = Math.max(this.finalWidth, this.assetMap[currentUnit.assetKey].posX + currentUnit.unitWidth);
					this.finalHeight = Math.max(this.finalHeight, this.assetMap[currentUnit.assetKey].posY + currentUnit.unitHeight);
				} else {
					this.assetMap[currentUnit.assetKey] = null; // Mark as unplaced
				}
			}

			// Final adjustments to atlas dimensions
			this.finalWidth += 2 * this.settings.spacing.outer - this.settings.spacing.elementGap;
			this.finalHeight += 2 * this.settings.spacing.outer - this.settings.spacing.elementGap;

			// Round up to next power of two if required
			if(this.settings.nextPowerOfTwo) {
				this.finalWidth = this.nextPowerOfTwo(this.finalWidth) || 2;
				this.finalHeight = this.nextPowerOfTwo(this.finalHeight) || 2;
			}

			// Ensure squared dimensions if configured
			if(this.settings.squared) {
				if(this.finalHeight > this.finalWidth) {
					this.finalWidth = this.finalHeight;
				} else {
					this.finalHeight = this.finalWidth;
				}
			}

			// Override with fixed dimensions if set
			if(this.settings.fixedDimensions.fixedWidth >= 1) { this.finalWidth = this.settings.fixedDimensions.fixedWidth; }
			if(this.settings.fixedDimensions.fixedHeight >= 1) { this.finalHeight = this.settings.fixedDimensions.fixedHeight; }

			// Return the computed atlas data
			return { assets: this.assetMap, finalWidth: this.finalWidth, finalHeight: this.finalHeight };
		},

		/**
		 * Calculates the smallest power of two greater than or equal to n.
		 * @param {number} value - The input number.
		 * @returns {number} The next power of two.
		 */
		nextPowerOfTwo: function(value) {
			var iteration = 0, result = 0;
			while (result === 0) {
				if(value <= Math.pow(2,iteration)) {
					result = Math.pow(2,iteration);
				}
				iteration++;
			}
			return result;
		},

		/**
		 * Converts raw graphic asset data into packable unit objects.
		 * @param {Array<Object>} graphicAssets - The raw asset data.
		 * @returns {Array<Object>} An array of unit objects suitable for packing.
		 */
		convertToUnits: function (graphicAssets) {
			var packingUnits = [];
			// Iterate over each asset using a utility function (assuming `_` is available, like Underscore.js)
			_.each(graphicAssets, function (assetItem, assetIndex) {
				var unit = { 
					assetKey: assetIndex, // Identifier for the asset
					unitWidth: ((this.settings.trim && assetItem.trimmedSize.trimmed) ? assetItem.trimmedSize.width : assetItem.width) + this.settings.spacing.elementGap + 2 * this.settings.spacing.internal, 
					unitHeight: ((this.settings.trim && assetItem.trimmedSize.trimmed) ? assetItem.trimmedSize.height : assetItem.height) + this.settings.spacing.elementGap + 2 * this.settings.spacing.internal,
					t: (this.settings.trim && assetItem.trimmedSize.trimmed), // Indicates if the asset is trimmed
					count: 1 // Quantity, always 1 for individual assets
				};
				// Only add units that fit within the maximum allowed dimensions
				if((unit.unitWidth + 2 * this.settings.spacing.outer) <= this.settings.maximumDimensions.widthLimit && (unit.unitHeight + 2 * this.settings.spacing.outer) <= this.settings.maximumDimensions.heightLimit) {
					packingUnits.push(unit);
				}
			}.bind(this)); // Bind 'this' to maintain context
			return packingUnits;
		},

		// --- Sorting criteria functions ---

		/** Compares units by width (descending). */
		compareWidth: function (unitA, unitB) { 
			return unitB.unitWidth - unitA.unitWidth; 
		},
		
		/** Compares units by height (descending). */
		compareHeight: function (unitA, unitB) { 
			return unitB.unitHeight - unitA.unitHeight; 
		},
		
		/** Compares units by their maximum dimension (descending). */
		compareMaxDim: function (unitA, unitB) { 
			return Math.max(unitB.unitWidth, unitB.unitHeight) - Math.max(unitA.unitWidth, unitA.unitHeight); 
		},
		
		/** Compares units by their minimum dimension (descending). */
		compareMinDim: function (unitA, unitB) { 
			return Math.min(unitB.unitWidth, unitB.unitHeight) - Math.min(unitA.unitWidth, unitA.unitHeight); 
		},

		/**
		 * Primary sorting function for units, prioritizes max side.
		 * @param {Object} unitA - First unit for comparison.
		 * @param {Object} unitB - Second unit for comparison.
		 * @returns {number} Comparison result.
		 */
		sortBySize: function (unitA, unitB) { 
			// Uses a predefined order of criteria for sorting
			return this.multiCriteriaSort(unitA, unitB, ["max", "min", "h", "w"]); 
		},

		/**
		 * Sorts two units based on an array of specified criteria.
		 * @param {Object} unitA - First unit.
		 * @param {Object} unitB - Second unit.
		 * @param {Array<string>} sortCriteria - An array of strings ('max', 'min', 'h', 'w') defining the sorting order.
		 * @returns {number} The difference for sorting.
		 */
		multiCriteriaSort: function(unitA, unitB, sortCriteria) {
			var differenceValue, criterionIdx;
			for (criterionIdx = 0 ; criterionIdx < sortCriteria.length ; criterionIdx++) {
				if(sortCriteria[criterionIdx] === "max") {
					differenceValue = this.compareMaxDim(unitA, unitB);
				} else if(sortCriteria[criterionIdx] === "min") {
					differenceValue = this.compareMinDim(unitA, unitB);
				} else if(sortCriteria[criterionIdx] === "h") {
					differenceValue = this.compareHeight(unitA, unitB);
				} else if(sortCriteria[criterionIdx] === "w") {
					differenceValue = this.compareWidth(unitA, unitB);
				}
				// If a difference is found, return it immediately
				if (differenceValue != 0) {
					return differenceValue;  
				}
			}
			return 0; // If all criteria are equal
		},

		/**
		 * Attempts to place all given units within the layout.
		 * @param {Array<Object>} itemUnits - The units to be placed.
		 */
		placeUnits: function(itemUnits) {
			var unitIterator, currentLayoutNode, currentUnit, numberOfUnits = itemUnits.length;
			var initialWidth = numberOfUnits > 0 ? itemUnits[0].unitWidth : 0;
			var initialHeight = numberOfUnits > 0 ? itemUnits[0].unitHeight : 0;
			// Initialize the root node of the layout tree
			this.layoutRoot = { posX: 0, posY: 0, unitWidth: initialWidth, unitHeight: initialHeight };
			for (unitIterator = 0; unitIterator < numberOfUnits ; unitIterator++) {
				currentUnit = itemUnits[unitIterator];
				if (currentLayoutNode = this.findFreeNode(this.layoutRoot, currentUnit.unitWidth, currentUnit.unitHeight)) {
					currentUnit.placement = this.subdivideNode(currentLayoutNode, currentUnit.unitWidth, currentUnit.unitHeight);
				} else {
					currentUnit.placement = this.expandLayout(currentUnit.unitWidth, currentUnit.unitHeight);
				}
			}
		},

		/**
		 * Recursively finds a suitable free node in the layout tree for a given width and height.
		 * @param {Object} currentTreeRoot - The current node to search from.
		 * @param {number} desiredWidth - The width of the item to fit.
		 * @param {number} desiredHeight - The height of the item to fit.
		 * @returns {Object|null} The found node or null if no fit.
		 */
		findFreeNode: function(currentTreeRoot, desiredWidth, desiredHeight) {
			if (currentTreeRoot.isOccupied) { // If this node is already used, try its children
				return this.findFreeNode(currentTreeRoot.rightChild, desiredWidth, desiredHeight) || this.findFreeNode(currentTreeRoot.downChild, desiredWidth, desiredHeight);
			} else if ((desiredWidth <= currentTreeRoot.unitWidth) && (desiredHeight <= currentTreeRoot.unitHeight)) { // If this node is free and fits
				return currentTreeRoot;
			} else { // No fit
				return null;
			}
		},

		/**
		 * Subdivides a free node into occupied and remaining space nodes.
		 * @param {Object} targetNode - The node to subdivide.
		 * @param {number} itemW - Width of the item being placed.
		 * @param {number} itemH - Height of the item being placed.
		 * @returns {Object} The original node, now marked as used.
		 */
		subdivideNode: function(targetNode, itemW, itemH) {
			targetNode.isOccupied = true;
			// Create a child node for the remaining space below
			targetNode.downChild  = { posX: targetNode.posX,     posY: targetNode.posY + itemH, unitWidth: targetNode.unitWidth,     unitHeight: targetNode.unitHeight - itemH };
			// Create a child node for the remaining space to the right
			targetNode.rightChild = { posX: targetNode.posX + itemW, posY: targetNode.posY,     unitWidth: targetNode.unitWidth - itemW, unitHeight: itemH          };
			return targetNode;
		},

		/**
		 * Expands the overall layout root to accommodate a new item if no space is found.
		 * @param {number} itemWidth - Width of the item to fit.
		 * @param {number} itemHeight - Height of the item to fit.
		 * @returns {Object|null} The node where the item was placed, or null if expansion failed.
		 */
		expandLayout: function(itemWidth, itemHeight) {
			// Check if expansion down or right is possible without exceeding current root dimensions
			var canExpandDown  = (itemWidth <= this.layoutRoot.unitWidth);
			var canExpandRight = (itemHeight <= this.layoutRoot.unitHeight);

			// Determine preferred expansion direction
			var shouldExpandRight = canExpandRight && (this.layoutRoot.unitHeight >= (this.layoutRoot.unitWidth + itemWidth));
			var shouldExpandDown  = canExpandDown  && (this.layoutRoot.unitWidth >= (this.layoutRoot.unitHeight + itemHeight));

			// Specific logic for power-of-two sizing and max dimensions
			if(this.settings.nextPowerOfTwo) {
				var pwrOfTwoVal = this.nextPowerOfTwo(this.layoutRoot.unitWidth) + 2 * this.settings.spacing.outer - this.settings.spacing.elementGap;
				// If adding the new item would push past a power-of-two boundary, prefer growing down if possible
				if((this.layoutRoot.unitWidth + itemWidth + 2 * this.settings.spacing.outer) > pwrOfTwoVal && (this.layoutRoot.unitHeight + itemHeight + 2 * this.settings.spacing.outer) <= (pwrOfTwoVal*2) && canExpandDown) {
					shouldExpandDown = true;
					shouldExpandRight = false;
				}
			}
			// Prevent expansion beyond maximum allowed width
			if((this.layoutRoot.unitWidth + itemWidth + 2 * this.settings.spacing.outer) > this.settings.maximumDimensions.widthLimit) {
				shouldExpandRight = false;
				canExpandRight = false; // Cannot expand right if it exceeds max width
			}
			// Prevent expansion beyond maximum allowed height
			if((this.layoutRoot.unitHeight + itemHeight + 2 * this.settings.spacing.outer) > this.settings.maximumDimensions.heightLimit) {
				shouldExpandDown = false;
				canExpandDown = false; // Cannot expand down if it exceeds max height
			}

			// Execute expansion based on determined preference
			if (shouldExpandRight) {
				return this.expandToRight(itemWidth, itemHeight);
			} else if (shouldExpandDown) {
				return this.expandToDown(itemWidth, itemHeight);
			} else if (canExpandRight) { // Fallback if preferred failed but still possible
				return this.expandToRight(itemWidth, itemHeight);
			} else if (canExpandDown) { // Fallback if preferred failed but still possible
				return this.expandToDown(itemWidth, itemHeight);
			} else { // No expansion possible
				return null;
			}
		},

		/**
		 * Expands the layout by extending the root to the right.
		 * @param {number} newW - Width of the item causing the expansion.
		 * @param {number} newH - Height of the item causing the expansion.
		 * @returns {Object|null} The node where the item was placed, or null if placement failed after expansion.
		 */
		expandToRight: function(newW, newH) {
			// Create a new root node that encompasses the old root and the new expanded area
			this.layoutRoot = {
				isOccupied: true,
				posX: 0,
				posY: 0,
				unitWidth: this.layoutRoot.unitWidth + newW,
				unitHeight: this.layoutRoot.unitHeight,
				downChild: this.layoutRoot, // The old root becomes the 'down' child of the new root
				rightChild: { posX: this.layoutRoot.unitWidth, posY: 0, unitWidth: newW, unitHeight: this.layoutRoot.unitHeight } // New space to the right
			};
			// Try to place the item in the newly expanded space
			if (currentNode = this.findFreeNode(this.layoutRoot, newW, newH)) {
				return this.subdivideNode(currentNode, newW, newH);
			} else {
				return null;
			}
		},

		/**
		 * Expands the layout by extending the root downwards.
		 * @param {number} newW - Width of the item causing the expansion.
		 * @param {number} newH - Height of the item causing the expansion.
		 * @returns {Object|null} The node where the item was placed, or null if placement failed after expansion.
		 */
		expandToDown: function(newW, newH) {
			// Create a new root node that encompasses the old root and the new expanded area
			this.layoutRoot = {
				isOccupied: true,
				posX: 0,
				posY: 0,
				unitWidth: this.layoutRoot.unitWidth,
				unitHeight: this.layoutRoot.unitHeight + newH,
				downChild:  { posX: 0, posY: this.layoutRoot.unitHeight, unitWidth: this.layoutRoot.unitWidth, unitHeight: newH }, // New space below
				rightChild: this.layoutRoot // The old root becomes the 'right' child of the new root
			};
			// Try to place the item in the newly expanded space
			if (currentNode = this.findFreeNode(this.layoutRoot, newW, newH)) {
				return this.subdivideNode(currentNode, newW, newH);
			} else {
				return null;
			}
		}

	});

	return AtlasArranger;

});