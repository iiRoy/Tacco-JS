// This utility dynamically adjusts styling for child components within containers,
// mimicking responsive design principles based on parent element dimensions.

const ElementDimensionMonitor = function(initialSettings) {
	const currentInstance = this; // Self-reference for inner scopes.
	const defaultConfiguration = {
		pollDelay: 600, // How frequently to check for size changes; impacts responsiveness vs. performance.
		elementSelectors: {
			targetElements: '.component-unit' // A universal class for all elements managed by this system.
		},
		classModifiers: {
			upperBound: '--max-dim-', // Example output: '.component-unit--max-dim-300'
			lowerBound: '--min-dim-' // Example output: '.component-unit--min-dim-300'
		},
		dataAttributeKeys: {
			elementIdentifier: 'module-id',
			associatedElements: 'child-elements',
			parentScope: 'container-scope',
			sizeThresholds: 'responsive-points',
			cachedDimension: 'current-width-val'
		}
	};

	this.activeSettings = Object.assign({}, defaultConfiguration, initialSettings); // Merge configurations.

	// Populate the initial cache of elements upon document readiness.
	this.initializeElementCache();

	// Begin an ongoing process to detect dimension shifts.
	(function beginObservationCycle() {
		currentInstance.observeDimensions();
		setTimeout(beginObservationCycle, currentInstance.activeSettings.pollDelay);
	})();

	// Trigger immediate dimension checks when the browser window is resized.
	window.addEventListener('resize', this.observeDimensions.bind(this));
};

ElementDimensionMonitor.prototype = {

	/**
	 * Recalculates the dimensions of all tracked parent elements
	 * and updates associated classes if a size change is detected.
	 */
	observeDimensions: function() {
		const selfRef = this; // Reference to the current object.
		let processedParents; // Collection of parent elements to iterate.

		// Arrange parent elements, ensuring outer containers are processed first.
		// This prevents issues where a child's styling might depend on an ancestor's width.
		processedParents = $(this.elementContainers.sort((first, second) => {
			// Sort based on depth within the DOM hierarchy.
			return $(first).closest(selfRef.activeSettings.elementSelectors.targetElements).length -
				$(second).closest(selfRef.activeSettings.elementSelectors.targetElements).length;
		}));

		processedParents.each(function() {
			const currentParent = $(this);
			const currentMeasure = currentParent.width();
			// Check if the stored dimension differs from the actual current dimension.
			if (currentMeasure !== currentParent.data(selfRef.activeSettings.dataAttributeKeys.cachedDimension)) {
				currentParent.data(selfRef.activeSettings.dataAttributeKeys.cachedDimension, currentMeasure); // Update cached dimension.
				selfRef.updateDimensionClasses(currentParent); // Apply new classes based on the updated dimension.
			}
		});
	},

	/**
	 * Discovers and stores all relevant components and their immediate parents.
	 */
	initializeElementCache: function() {
		const selfRef = this;
		const foundParents = []; // Temporary array to hold unique parent references.
		this.targetItems = $(selfRef.activeSettings.elementSelectors.targetElements); // Find all target components.

		this.targetItems.each(function() {
			const currentItem = $(this);
			let existingEntry; // Variable to hold a previously cached child element.
			const parentItem = currentItem.parent(); // Get the direct parent of the current component.
			let associatedList = parentItem.data(selfRef.activeSettings.dataAttributeKeys.associatedElements) || []; // Retrieve or initialize list of associated children.

			// If the parent doesn't have an associated list yet, create one.
			if (!parentItem.data(selfRef.activeSettings.dataAttributeKeys.associatedElements)) {
				parentItem.data(selfRef.activeSettings.dataAttributeKeys.associatedElements, []);
			} else {
				// Check if this component is already in the parent's list.
				existingEntry = associatedList.find(itemRef => $(itemRef).is(currentItem));
			}

			// If the component is not yet associated, add it to the parent's list.
			if (existingEntry === undefined) {
				associatedList.push(currentItem);
			}
			currentItem.data(selfRef.activeSettings.dataAttributeKeys.parentScope, parentItem); // Store parent reference on the child.
			parentItem.data(selfRef.activeSettings.dataAttributeKeys.associatedElements, associatedList); // Update parent's list of children.
			foundParents.push(parentItem); // Add parent to the temporary list.
		});
		this.elementContainers = $(foundParents); // Convert the temporary list to a jQuery collection for containers.
	},

	/**
	 * Removes existing dimension-related classes from components
	 * and adds new ones based on current breakpoint thresholds.
	 * @param {jQuery} processingParent - The container element being processed.
	 */
	updateDimensionClasses: function(processingParent) {
		const selfRef = this;
		const relatedChildren = processingParent.data(selfRef.activeSettings.dataAttributeKeys.associatedElements); // Get children associated with this parent.
		const currentDimension = processingParent.data(selfRef.activeSettings.dataAttributeKeys.cachedDimension); // Get the parent's cached width.

		relatedChildren.forEach(function(childElement) {
			const childObject = $(childElement);
			const newStyleClasses = []; // Array to collect classes to be added.

			// Remove any previously applied dimension-based classes.
			const existingClassList = (childObject.attr('class') || '').split(' '); // Get all current classes.
			const minDimensionClasses = selfRef.filterClassesByPrefix(existingClassList, selfRef.activeSettings.classModifiers.lowerBound);
			const maxDimensionClasses = selfRef.filterClassesByPrefix(existingClassList, selfRef.activeSettings.classModifiers.upperBound);
			childObject.removeClass(minDimensionClasses.concat(maxDimensionClasses).join(' ')); // Remove old classes.

			const childIdentifier = childObject.data(selfRef.activeSettings.dataAttributeKeys.elementIdentifier); // Get unique ID for the child.

			// Apply new classes if breakpoints are defined for this child.
			if (childObject.data(selfRef.activeSettings.dataAttributeKeys.sizeThresholds)) {
				// Parse breakpoints string into an array of numbers.
				const dimensionThresholds = String(childObject.data(selfRef.activeSettings.dataAttributeKeys.sizeThresholds))
					.replace(/\s/g, '') // Remove all whitespace.
					.split(',')
					.map(Number); // Convert strings to numbers.

				for (let loopIndex = 0; loopIndex < dimensionThresholds.length; loopIndex++) {
					const thresholdValue = dimensionThresholds[loopIndex];
					if (currentDimension < thresholdValue) {
						newStyleClasses.push(childIdentifier + selfRef.activeSettings.classModifiers.upperBound + thresholdValue);
					} else if (currentDimension >= thresholdValue) {
						newStyleClasses.push(childIdentifier + selfRef.activeSettings.classModifiers.lowerBound + thresholdValue);
					}
				}
				childObject.addClass(newStyleClasses.join(' ')); // Add all newly determined classes.
			}
		});
	},

	/**
	 * Filters an array of CSS class names, returning only those that start with a specific prefix.
	 * @param {string[]} classList - An array of class strings.
	 * @param {string} prefixString - The prefix to match against.
	 * @returns {string[]} An array containing only the matching class strings.
	 */
	filterClassesByPrefix: function(classList, prefixString) {
		return classList.filter(className => className.startsWith(prefixString));
	}
};