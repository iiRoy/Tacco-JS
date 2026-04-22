(function(jQueryAlias){

	// Configuration parameters for the adaptive navigation component.
	// These values define how the mobile menu behaves and appears.
	var componentOptions = {
		consolidateNav: true,             // Flag to determine if multiple navigation lists should be merged into one dropdown.
		groupHeadingText: 'Main Section', // Text for the option in an optgroup that links to the group's main page.
		enableNesting: true,              // If true, nested lists will be represented as <optgroup> elements.
		insertionTarget: 'body',          // CSS selector for the element where the generated <select> menu will be placed.
		breakpointWidth: 480,             // The screen width (in pixels) below which the mobile menu activates.
		initialPrompt: 'Choose an item'   // Default text for the first, unselected option in the dropdown.
	};

	// A collection to hold the original jQuery objects of the navigation lists.
	var navElementCollection;

	// A simple counter to ensure unique IDs for generated select elements.
	var dropdownCounter = 0;

	// An array to keep track of unique URLs encountered during list consolidation, preventing duplicates.
	var seenUrlsRegistry = [];


	/**
	 * Navigates the browser to the specified URL.
	 * @param {string} destinationUrl - The URL to navigate to.
	 */
	function navigateToPage(destinationUrl) {
		if (typeof destinationUrl === 'string' && destinationUrl.length > 0) {
			window.location.assign(destinationUrl);
		} else {
			console.warn("Attempted to navigate to an invalid URL:", destinationUrl);
		}
	}

	/**
	 * Checks if any mobile navigation dropdowns are currently present in the DOM.
	 * @returns {boolean} - True if at least one mobile nav element exists, false otherwise.
	 */
	function mobileDropdownPresent() {
		const foundElements = jQueryAlias('.responsive-nav-select');
		return foundElements.length > 0;
	}

	/**
	 * Validates if the provided jQuery object contains only 'ul' or 'ol' elements.
	 * @param {jQuery} inputElements - The jQuery object to validate.
	 * @returns {boolean} - True if all elements are lists, false otherwise.
	 */
	function areAllElementsLists(inputElements) {
		let validationPassed = true;
		if (!inputElements || inputElements.length === 0) {
			return false; // No elements to validate
		}
		inputElements.each(function() {
			const currentElement = jQueryAlias(this);
			if (!(currentElement.is('ul') || currentElement.is('ol'))) {
				validationPassed = false;
				return false; // Break the .each loop early
			}
		});
		return validationPassed;
	}

	/**
	 * Determines if the current browser window width is considered "mobile".
	 * @returns {boolean} - True if the window width is less than the defined breakpoint.
	 */
	function isViewportMobile() {
		const currentWindowWidth = jQueryAlias(window).width();
		const threshold = componentOptions.breakpointWidth;
		return currentWindowWidth < threshold;
	}

	/**
	 * Extracts the text content of a jQuery element, excluding the text of its child list elements.
	 * @param {jQuery} targetElement - The jQuery element from which to extract text.
	 * @returns {string} - The trimmed text content.
	 */
	function extractElementText(targetElement) {
		// Create a clone to avoid modifying the original DOM element.
		const clonedElement = targetElement.clone();
		// Remove any nested 'ul' or 'ol' elements from the clone.
		clonedElement.children('ul, ol').remove();
		// Get the remaining text and trim whitespace.
		return jQueryAlias.trim(clonedElement.text());
	}

	/**
	 * Checks if a given URL has already been recorded in the unique URLs registry.
	 * @param {string} urlCandidate - The URL to check for uniqueness.
	 * @returns {boolean} - True if the URL is not found in the registry, false otherwise.
	 */
	function isUrlNotYetRegistered(urlCandidate) {
		// Using strict equality check for array index.
		return jQueryAlias.inArray(urlCandidate, seenUrlsRegistry) === -1;
	}

	/**
	 * Iterates through a menu list, removing duplicate links and ensuring unique items for consolidation.
	 * This function is recursive to handle nested lists.
	 * @param {jQuery} currentMenuSegment - The jQuery object representing the current list (ul/ol) to process.
	 */
	function processForDuplicates(currentMenuSegment) {

		// Iterate over each direct child list item.
		currentMenuSegment.children('li').each(function() {

			const currentListItem = jQueryAlias(this);
			const anchorElement = currentListItem.find('a:first'); // Get the first anchor in the list item.
			const listItemLink = anchorElement.attr('href');

			// Helper function to determine the link of the parent list item, if applicable.
			const getParentItemLink = function() {
				const directParent = currentListItem.parent();
				if (directParent.is('ul') || directParent.is('ol')) {
					const grandParent = directParent.parent();
					if (grandParent.is('li')) {
						const parentAnchor = grandParent.find('a:first');
						return parentAnchor.attr('href');
					}
				}
				return null; // No relevant parent link found.
			};

			// First, recursively process any nested lists within the current list item.
			const nestedLists = currentListItem.children('ul, ol');
			if (nestedLists.length > 0) {
				processForDuplicates(nestedLists);
			}

			// After processing children, check if any nested lists became empty and remove them.
			const remainingNestedItems = currentListItem.find(' > ul li, > ol li');
			if (remainingNestedItems.length === 0) {
				currentListItem.children('ul, ol').remove();
			}

			const parentLink = getParentItemLink();

			// Logic to handle the current list item based on link uniqueness.
			if (parentLink && !isUrlNotYetRegistered(parentLink) && isUrlNotYetRegistered(listItemLink)) {
				// If the parent has a link that's already seen, and this item's link is new,
				// append this item to the parent's list within the combined menu.
				const targetSelector = 'ul#unified-mobile-nav li:has(a[href="' + parentLink + '"]):first ul';
				currentListItem.appendTo(jQueryAlias(targetSelector));
			} else if (listItemLink && isUrlNotYetRegistered(listItemLink)) {
				// If the current list item's link is unique, add it to the registry.
				seenUrlsRegistry.push(listItemLink);
			} else {
				// If the link is a duplicate or invalid, remove the list item.
				currentListItem.remove();
			}
		});
	}

	/**
	 * Consolidates multiple navigation lists into a single, unified list.
	 * This function also handles de-duplication of list items.
	 * @returns {jQuery} - A new jQuery object representing the combined and de-duplicated list.
	 */
	function consolidateNavigationLists() {
		// Initialize a new empty unordered list to hold the combined items.
		const combinedList = jQueryAlias('<ul id="unified-mobile-nav" />');

		// If no navigation elements are found, return an empty list.
		if (!navElementCollection || navElementCollection.length === 0) {
			console.warn("No navigation elements found for consolidation.");
			return combinedList;
		}

		// Loop through each original menu and append its direct children (list items) to the new combined list.
		navElementCollection.each(function() {
			const currentNav = jQueryAlias(this);
			currentNav.children().clone(true, true).appendTo(combinedList); // Deep clone to preserve events/data if any.
		});

		// After all items are combined, process the new list to remove any duplicates.
		processForDuplicates(combinedList);

		return combinedList;
	}

	/**
	 * Creates and appends an <option> element to a <select> or <optgroup>.
	 * @param {jQuery} sourceItem - The list item (li) from which to derive the option's value and text.
	 * @param {jQuery} targetContainer - The jQuery object for the <select> or <optgroup> to append to.
	 * @param {string} [optionTextOverride] - Optional text to use for the option, overriding the source item's text.
	 */
	function createDropdownOption(sourceItem, targetContainer, optionTextOverride) {
		const optionValue = sourceItem.find('a:first').attr('href');
		const optionDisplay = optionTextOverride || extractElementText(sourceItem);

		// Guard against options with no value or display text.
		if (!optionValue || !optionDisplay) {
			console.warn("Skipping option creation due to missing value or display text.", sourceItem);
			return;
		}

		const newOptionHtml = `<option value="${optionValue}">${jQueryAlias.trim(optionDisplay)}</option>`;
		jQueryAlias(newOptionHtml).appendTo(targetContainer);
	}

	/**
	 * Creates an <optgroup> element for nested navigation items and populates it with options.
	 * @param {jQuery} groupSourceItem - The parent list item (li) that represents the optgroup.
	 * @param {jQuery} targetSelectElement - The <select> element to which the <optgroup> will be appended.
	 */
	function createDropdownOptionGroup(groupSourceItem, targetSelectElement) {
		const groupLabel = extractElementText(groupSourceItem);
		if (!groupLabel) {
			console.warn("Skipping optgroup creation due to missing label.", groupSourceItem);
			return;
		}

		// Create the <optgroup> element with its label.
		const newOptgroup = jQueryAlias(`<optgroup label="${jQueryAlias.trim(groupLabel)}" />`);

		// Add an option for the main page of the group itself.
		createDropdownOption(groupSourceItem, newOptgroup, componentOptions.groupHeadingText);

		// Iterate through each direct child list (ul/ol) within the group source item.
		groupSourceItem.children('ul, ol').each(function() {
			const nestedList = jQueryAlias(this);
			// For each list item in the nested list, create an option.
			nestedList.children('li').each(function() {
				createDropdownOption(jQueryAlias(this), newOptgroup);
			});
		});

		// Append the fully populated <optgroup> to the main <select> element.
		newOptgroup.appendTo(targetSelectElement);
	}

	/**
	 * Generates a <select> dropdown menu from a given navigation list.
	 * @param {jQuery} sourceNavigationList - The jQuery object of the (ul/ol) list to convert.
	 */
	function generateSelectMenu(sourceNavigationList) {
		// Increment the counter to ensure a unique ID for the new select element.
		dropdownCounter++;
		const selectId = 'mobile-nav-selector-' + dropdownCounter;

		// Create the new <select> element.
		const newSelectElement = jQueryAlias(`<select id="${selectId}" class="responsive-nav-select" />`);

		// If a top option text is defined, create a default "unselected" option.
		if (componentOptions.initialPrompt) {
			// Create a dummy <li> for the option creation function, as it expects a list item.
			createDropdownOption(jQueryAlias(`<li><a href="#">${componentOptions.initialPrompt}</a></li>`), newSelectElement);
		}

		// Iterate through each top-level list item in the source navigation list.
		sourceNavigationList.children('li').each(function() {
			const currentListItem = jQueryAlias(this);
			const hasNestedChildren = currentListItem.children('ul, ol').length > 0;

			// If nesting is enabled and the list item has children, create an optgroup.
			if (componentOptions.enableNesting && hasNestedChildren) {
				createDropdownOptionGroup(currentListItem, newSelectElement);
			} else {
				// Otherwise, create a simple option for the list item.
				createDropdownOption(currentListItem, newSelectElement);
			}
		});

		// Attach the change event handler to navigate when an option is selected.
		newSelectElement.on('change', function() {
			const selectedValue = jQueryAlias(this).val();
			if (selectedValue && selectedValue !== '#') { // Prevent navigation for dummy options if href is '#'
				navigateToPage(selectedValue);
			}
		});

		// Insert the new <select> element into the DOM at the specified target.
		jQueryAlias(componentOptions.insertionTarget).prepend(newSelectElement);
	}

	/**
	 * Main function to execute the mobile menu logic based on current screen width.
	 */
	function activateOrDeactivateMobileMenu() {
		const isCurrentlyMobile = isViewportMobile();
		const dropdownIsPresent = mobileDropdownPresent();
		const originalNavs = navElementCollection;

		// Scenario 1: Mobile view active, but no dropdown exists yet.
		if (isCurrentlyMobile && !dropdownIsPresent) {
			console.log("Activating mobile navigation: creating dropdown(s).");
			if (componentOptions.consolidateNav) {
				// Combine all matched lists into one dropdown.
				const combinedNav = consolidateNavigationLists();
				generateSelectMenu(combinedNav);
			} else {
				// Create a separate dropdown for each matched list.
				originalNavs.each(function() {
					generateSelectMenu(jQueryAlias(this));
				});
			}
			// Hide original menus after creating dropdowns.
			originalNavs.hide();
		}
		// Scenario 2: Mobile view active, and dropdown already exists.
		else if (isCurrentlyMobile && dropdownIsPresent) {
			console.log("Mobile navigation already active: ensuring dropdown visibility.");
			jQueryAlias('.responsive-nav-select').show();
			originalNavs.hide();
		}
		// Scenario 3: Desktop view active, and dropdown exists (needs to be hidden).
		else if (!isCurrentlyMobile && dropdownIsPresent) {
			console.log("Deactivating mobile navigation: hiding dropdown(s).");
			jQueryAlias('.responsive-nav-select').hide();
			originalNavs.show();
		}
		// Scenario 4: Desktop view active, and no dropdown exists (original menus are already visible).
		else if (!isCurrentlyMobile && !dropdownIsPresent) {
			console.log("Desktop navigation active: original menus visible, no dropdown to hide.");
			originalNavs.show();
		}
	}

	// Plugin definition for jQuery.
	jQueryAlias.fn.responsiveMobileNav = function(customSettings) {

		// Merge user-provided settings with default options.
		if (typeof customSettings === 'object' && customSettings !== null) {
			jQueryAlias.extend(componentOptions, customSettings);
		} else if (customSettings !== undefined) {
			console.warn("Invalid settings provided to responsiveMobileNav. Expected an object.");
		}

		// Validate that the plugin is called on list elements (ul/ol).
		if (areAllElementsLists(jQueryAlias(this))) {
			navElementCollection = jQueryAlias(this); // Store the matched elements.
			activateOrDeactivateMobileMenu(); // Run the initial setup.

			// Attach a debounced resize event handler to re-evaluate mobile menu state.
			let resizeTimer;
			jQueryAlias(window).on('resize', function() {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function() {
					console.log("Window resized. Re-evaluating mobile menu state.");
					activateOrDeactivateMobileMenu();
				}, 150); // Debounce for 150ms
			});
		} else {
			console.error('responsiveMobileNav: This plugin only functions with <ul> or <ol> elements as its target.');
			// Optionally, throw an error or return early.
		}

		return this; // Maintain chainability.
	};

})(jQuery);