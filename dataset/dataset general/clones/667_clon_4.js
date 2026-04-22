(function() {

    // A class to encapsulate the responsive navigation transformation logic.
    class NavigationAdapter {
        // Default configuration options for the adapter.
        static defaultOptions = {
            groupMode: true,                // Should multiple menus be combined into one select? (Original: combine)
            groupLabel: 'Main',             // Text for the option representing the group's main page. (Original: groupPageText)
            nestedLevels: true,             // Should nested lists be converted to <optgroup>s? (Original: nested)
            insertionTarget: 'body',        // CSS selector for where the <select> element(s) should be prepended. (Original: prependTo)
            breakpoint: 480,                // Window width in pixels to switch between original and select menu. (Original: switchWidth)
            initialOptionText: 'Navigate to...', // Text for the default unselected option in the <select>. (Original: topOptionText)
            mobileNavClass: 'responsive-dropdown-menu' // Class for the generated <select> element(s). (Original: mnav)
        };

        // Constructor initializes the adapter with target selectors and user-defined options.
        constructor(selectorForMenus, customOptions) {
            this.settings = { ...NavigationAdapter.defaultOptions, ...customOptions };

            this.sourceMenus = [];          // Stores the original menu DOM elements.
            this.generatedDropdowns = null; // Stores the dynamically created <select> element(s) (array if not groupMode, single if groupMode).
            this.instanceCounter = 0;       // Unique counter for generated <select> IDs.

            this.initializeSourceMenus(selectorForMenus);
            this.attachEventListeners();
            this.processNavigationState(); // Initial run.
        }

        // Validates and stores the original menu elements.
        initializeSourceMenus(selector) {
            const potentialElements = document.querySelectorAll(selector);
            let validationPassed = true;
            this.sourceMenus = Array.from(potentialElements).filter(element => {
                const isListElement = element.tagName === 'UL' || element.tagName === 'OL';
                if (!isListElement) {
                    console.error('NavigationAdapter requires <ul> or <ol> elements. Found an invalid element:', element);
                    validationPassed = false;
                }
                return isListElement;
            });

            if (!validationPassed) {
                // Mimics original's alert, but using console.error and throwing for better practice.
                throw new Error('Initialization failed: provided selector did not match valid list elements.');
            }
        }

        // Sets up event listeners for window resize.
        attachEventListeners() {
            window.addEventListener('resize', this.processNavigationState.bind(this));
        }

        // Extracts text content from an element, excluding nested lists.
        static extractCleanText(element) {
            const tempClone = element.cloneNode(true);
            Array.from(tempClone.querySelectorAll('ul, ol')).forEach(childList => childList.remove());
            return tempClone.textContent.trim();
        }

        // Checks if the current window width is below the defined breakpoint.
        isBelowBreakpoint() {
            return window.innerWidth < this.settings.breakpoint;
        }

        // Checks if the generated mobile navigation dropdown(s) are currently in the DOM.
        isDropdownActive() {
            return !!document.querySelector(`.${this.settings.mobileNavClass}`);
        }

        // Handles navigation when an option is selected.
        static navigateToURL(targetURL) {
            if (targetURL) {
                window.location.href = targetURL;
            }
        }

        /**
         * Recursively processes DOM list elements to build an intermediate structured menu data.
         * This function also handles the deduplication and re-parenting logic, mimicking the original's `checkForDuplicates`.
         *
         * @param {HTMLElement} currentDOMElement The current <ul> or <ol> element being processed.
         * @param {string|null} parentItemURL The URL of the parent <li> element that contains `currentDOMElement`.
         * @param {Set<string>} processedURLTracker A set to keep track of all URLs encountered to ensure uniqueness.
         * @param {Map<string, object>} urlToFirstItemMap A map to store the first processed item object for each unique URL.
         * @returns {Array<object>} An array of processed menu item objects for the current level.
         */
        _recursiveBuildMenuStructure(currentDOMElement, parentItemURL, processedURLTracker, urlToFirstItemMap) {
            const itemsAtThisLevel = [];
            const listItems = Array.from(currentDOMElement.children).filter(el => el.tagName === 'LI');

            for (const listItem of listItems) {
                const linkElement = listItem.querySelector('a');
                const currentItemURL = linkElement ? linkElement.href : null; // Original uses absolute URL for comparison.
                const itemLabel = NavigationAdapter.extractCleanText(listItem);
                const hasNestedLists = !!listItem.querySelector('ul, ol');

                // Process children recursively first (depth-first traversal, mimicking original jQuery logic).
                const nestedListElement = listItem.querySelector('ul, ol');
                let childProcessedItems = [];
                if (nestedListElement) {
                    childProcessedItems = this._recursiveBuildMenuStructure(nestedListElement, currentItemURL, processedURLTracker, urlToFirstItemMap);
                }

                // After children are processed, decide on the current item based on uniqueness.
                const isCurrentURLUnique = currentItemURL && !processedURLTracker.has(currentItemURL);
                // `isParentURLDuplicate` means the parent's URL was already processed and added to `processedURLTracker`.
                const isParentURLDuplicate = parentItemURL && processedURLTracker.has(parentItemURL);

                if (isCurrentURLUnique) {
                    processedURLTracker.add(currentItemURL); // Mark current URL as processed and unique.

                    const processedItem = {
                        label: itemLabel,
                        link: currentItemURL,
                        subItems: childProcessedItems, // Children are already processed and attached here.
                        originallyHadChildren: hasNestedLists // Flag for optgroup creation.
                    };
                    urlToFirstItemMap.set(currentItemURL, processedItem); // Store reference to this item's object.

                    // Mimics original's `if(!isUrlUnique(parentLink(), uniqueLinks) && isUrlUnique(link, uniqueLinks))`
                    // If the parent's URL was a duplicate (already in `processedURLTracker`),
                    // AND the current item's URL is unique, then re-parent it under the first instance of the parent.
                    if (parentItemURL && isParentURLDuplicate) {
                        const firstParentItem = urlToFirstItemMap.get(parentItemURL);
                        if (firstParentItem) {
                            firstParentItem.subItems.push(processedItem); // Re-parent under the first instance.
                        } else {
                            // Fallback: This case should ideally not be hit if `urlToFirstItemMap` is correctly maintained.
                            itemsAtThisLevel.push(processedItem);
                        }
                    } else {
                        // Item is unique and either a root item or its parent was also unique.
                        itemsAtThisLevel.push(processedItem);
                    }
                }
                // If `isCurrentURLUnique` is false, the item is a duplicate and is effectively discarded,
                // as per the original's `$li.remove()` logic. Its unique children would have been processed
                // and re-parented if applicable during the recursive calls.
            }
            return itemsAtThisLevel;
        }

        // Creates the <select> DOM element from the structured menu data.
        createDropdownElement(menuStructure, dropdownIdSuffix = '') {
            const dropdown = document.createElement('select');
            dropdown.id = `${this.settings.mobileNavClass}-${this.instanceCounter++}${dropdownIdSuffix ? '-' + dropdownIdSuffix : ''}`;
            dropdown.classList.add(this.settings.mobileNavClass);
            dropdown.addEventListener('change', (event) => NavigationAdapter.navigateToURL(event.target.value));

            // Add the initial "unselected" option if configured.
            if (this.settings.initialOptionText) {
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = this.settings.initialOptionText;
                dropdown.appendChild(defaultOption);
            }

            // Recursive helper to populate the dropdown with options and optgroups.
            const populateDropdown = (items, targetElement) => {
                for (const item of items) {
                    // Check if item should be an optgroup (had original children, nested levels allowed, and has actual sub-items)
                    if (item.originallyHadChildren && this.settings.nestedLevels && item.subItems.length > 0) {
                        const optgroup = document.createElement('optgroup');
                        optgroup.label = item.label;

                        // Add the 'Main' option for the optgroup itself. (Original: settings.groupPageText)
                        const groupMainOption = document.createElement('option');
                        groupMainOption.value = item.link || '';
                        groupMainOption.textContent = this.settings.groupLabel;
                        optgroup.appendChild(groupMainOption);

                        // Recursively add sub-items to the optgroup.
                        populateDropdown(item.subItems, optgroup);
                        targetElement.appendChild(optgroup);
                    } else {
                        // Otherwise, create a simple option.
                        const option = document.createElement('option');
                        option.value = item.link || '';
                        option.textContent = item.label;
                        targetElement.appendChild(option);
                    }
                }
            };

            populateDropdown(menuStructure, dropdown);
            return dropdown;
        }

        // Main function to manage the state of the navigation (show/hide original/dropdown).
        processNavigationState() {
            const isMobile = this.isBelowBreakpoint();
            const dropdownExists = this.isDropdownActive();
            const insertionPointElement = document.querySelector(this.settings.insertionTarget);

            if (!insertionPointElement) {
                console.error(`Responsive navigation insertion target "${this.settings.insertionTarget}" not found.`);
                return;
            }

            if (isMobile && !dropdownExists) {
                // Mobile view activated, create and insert dropdown(s).
                this.generatedDropdowns = []; // Reset for new generation.

                if (this.settings.groupMode) {
                    // Combine all original menus into a single dropdown.
                    const sharedURLTracker = new Set();
                    const sharedURLMap = new Map();
                    let combinedMenuData = [];
                    this.sourceMenus.forEach(menu => {
                        combinedMenuData = combinedMenuData.concat(
                            this._recursiveBuildMenuStructure(menu, null, sharedURLTracker, sharedURLMap)
                        );
                    });
                    const singleDropdown = this.createDropdownElement(combinedMenuData, 'combined');
                    insertionPointElement.prepend(singleDropdown);
                    this.generatedDropdowns.push(singleDropdown);
                } else {
                    // Create a separate dropdown for each original menu.
                    this.sourceMenus.forEach((menu, index) => {
                        const individualURLTracker = new Set();
                        const individualURLMap = new Map();
                        const menuSpecificData = this._recursiveBuildMenuStructure(menu, null, individualURLTracker, individualURLMap);
                        const newDropdown = this.createDropdownElement(menuSpecificData, `menu-${index}`);
                        insertionPointElement.prepend(newDropdown);
                        this.generatedDropdowns.push(newDropdown);
                    });
                }

                // Hide original menus.
                this.sourceMenus.forEach(m => m.style.display = 'none');

            } else if (isMobile && dropdownExists) {
                // Already in mobile view, dropdown(s) exist. Ensure visibility.
                if (this.generatedDropdowns) {
                    this.generatedDropdowns.forEach(dd => dd.style.display = ''); // Show
                }
                this.sourceMenus.forEach(m => m.style.display = 'none'); // Hide

            } else if (!isMobile && dropdownExists) {
                // Not mobile view, dropdown(s) exist. Remove dropdown(s) and show original menus.
                if (this.generatedDropdowns) {
                    this.generatedDropdowns.forEach(dd => dd.remove());
                    this.generatedDropdowns = null; // Clear references.
                }
                this.sourceMenus.forEach(m => m.style.display = ''); // Show
            }
            // If not mobile and dropdown(s) don't exist, do nothing (original menus are already visible).
        }
    }

    // This function serves as the entry point, mimicking the jQuery plugin pattern.
    // It will be called directly in the IIFE.
    function activateResponsiveNavigation(selector, options) {
        if (typeof selector !== 'string') {
            console.error('The responsive navigation activator expects a CSS selector string as its first argument.');
            return;
        }
        // Initialize a new instance of the adapter.
        new NavigationAdapter(selector, options);
    }

    // Call the activator function, mimicking the original jQuery plugin usage.
    // The original code uses `$(this)` as the selector, which refers to the jQuery object
    // the plugin was called on. This is equivalent to the selector passed to `$.fn.mobileMenu`.
    // So, 'ul, ol' is a reasonable default to match the original's `isList` check.
    activateResponsiveNavigation('ul, ol', { /* custom options can be passed here */ });

})();