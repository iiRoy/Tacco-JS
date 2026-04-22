(function(jQuery) {

	// Plugin entry point and method dispatcher for contentPaginator
	jQuery.fn.contentPaginator = function(paramInput) {

		// Check if the provided parameter is a known method name
		if (jQuery.contentPaginator.pluginActions[paramInput]) {
			// If it's a method, execute it with the current context and arguments
			return jQuery.contentPaginator.pluginActions[paramInput].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		// If it's an object or undefined, assume it's initialization
		else if (typeof paramInput === 'object' || !paramInput) {
			return jQuery.contentPaginator.pluginActions.initialize.apply(this, arguments);
		}
		// Otherwise, the method does not exist
		else {
			jQuery.error('Action "' + paramInput + '" is not recognized by jQuery.contentPaginator.');
		}

		// These variables are typically scoped within the init method,
		// but were declared here in the original. Moving them to init for better encapsulation
		// or keeping them here if they were intended for broader scope (which they aren't in the original).
		// For Type III, I'll move them to where they are actually used (mostly `init`).
		// However, the original code had them here, which is a bit unusual.
		// I will refactor to make them truly local to the `init` function when it's called.
		// For the global `$.ajaxPager` object, these are properties.
	};

	// Default configuration for the contentPaginator plugin
	jQuery.fn.contentPaginator.baseOptions = {
		displayPlacement: 'bottom', // 'top' | 'bottom' | 'both' controls UI bar position
		extraCssClasses: '', // Additional CSS classes for the pagination container
		stripedRowEffect: false, // Not directly used in the pager UI, but often for associated table data
		loadingMessage: 'Fetching data...', // Text displayed during data load
		currentPageNumber: 1, // The currently active page
		recordsPerPage: 20, // Number of items to display per page
		enablePageSizeDropdown: true, // Show/hide the page size selector
		pageSizeOptions: [10, 20, 30, 50], // Available page sizes
		sortKey: null, // Column to sort by
		sortDirection: 'desc', // 'asc' | 'desc'
		sortableFields: {}, // Map of field keys to display names for sorting
		searchTextQuery: null, // Current search term
		requestSettings: { // AJAX call parameters
			endpointUrl: '',
			requestType: 'GET', // Changed from POST to GET as a Type III modification
			requestData: {},
			responseDataType: 'json'
		},
		dataParser: { // Defines how to read response data
			successIndicator: 'isSuccessful',
			statusMessage: 'infoMessage',
			totalPagesKey: 'totalPageCount',
			totalRecordsKey: 'totalRecordCount',
			dataRootKey: 'payload' // Key for the actual data array
		},
		queryParameters: { // Names of parameters sent to the server
			startIndex: 'startIndex',
			recordsLimit: 'limit',
			pageIndex: 'page',
			sortColumn: 'sortBy',
			sortOrder: 'order',
			searchTerm: 'query'
		},
		renderCallback: null, // Custom function to render the data content
		eventListeners: { // Custom event hooks
			onInitialize: null,
			onRenderUI: null,
			onDataPreprocess: null,
			onBeforeLoad: null,
			onDataLoaded: null,
			onDestroy: null
		}
	};

	// Internal state variables for each paginator instance
	jQuery.fn.contentPaginator.runtimeState = {
		isDataLoaded: false, // Flag indicating if data has been fetched
		isUIRendered: false, // Flag indicating if the UI is built
		totalAvailablePages: 1,
		totalAvailableRecords: 0,
		firstDisplayedRecord: 0,
		lastDisplayedRecord: 0,
		paginationControls: null // Reference to the generated pagination UI elements
	};

	// Core methods and internal utilities for the contentPaginator plugin
	jQuery.contentPaginator = {
		pluginActions: { // Publicly accessible methods
			initialize: function(initialOptions) {
				const currentOptions = initialOptions || {};
				// Merge user options with defaults, deeply
				let effectiveConfig = jQuery.extend(true, {}, jQuery.fn.contentPaginator.baseOptions, currentOptions);
				// Assign references to internal helper functions for convenience
				const interactionHandlers = jQuery.contentPaginator.eventCallbacks;
				const dataFetcher = jQuery.contentPaginator._initiateDataFetch;
				const displayUpdater = jQuery.contentPaginator._refreshPagingDisplay;
				const showOverlay = jQuery.contentPaginator._overlayContent;
				const hideOverlay = jQuery.contentPaginator._hideOverlay;

				return this.each(function() {
					const currentElement = jQuery(this);
					let instanceData = currentElement.data('contentPaginator');

					// Setup custom event bindings
					currentElement.on('configUpdated.contentPaginator', interactionHandlers.configChangeHandler);
					currentElement.on('pageIndexChanged.contentPaginator', interactionHandlers.pageChangedHandler);
					currentElement.on('goToFirst.contentPaginator', interactionHandlers.firstPageNavHandler);
					currentElement.on('goToPrev.contentPaginator', interactionHandlers.previousPageNavHandler);
					currentElement.on('goToNext.contentPaginator', interactionHandlers.nextPageNavHandler);
					currentElement.on('goToLast.contentPaginator', interactionHandlers.lastPageNavHandler);
					currentElement.on('initUI.contentPaginator', interactionHandlers.initHandler);
					currentElement.on('renderUI.contentPaginator', interactionHandlers.renderHandler);
					currentElement.on('beforeDataLoad.contentPaginator', interactionHandlers.beforeLoadHandler);
					currentElement.on('dataLoadComplete.contentPaginator', interactionHandlers.loadHandler);
					currentElement.on('pluginDestroyed.contentPaginator', interactionHandlers.destroyHandler);

					// Generate the pagination UI bar
					const uiBarMarkup = jQuery.contentPaginator._createPagingUI(effectiveConfig);
					currentElement.wrap('<div class="paginatorWrapper" />').addClass('paginatedContentArea');

					// Place the UI bar based on configuration
					switch (effectiveConfig.displayPlacement) {
						case "both":
							currentElement.before(uiBarMarkup).after(uiBarMarkup);
							break;
						case "top":
							currentElement.before(uiBarMarkup);
							break;
						case "bottom":
							currentElement.after(uiBarMarkup);
							break;
						default: // Default to bottom if placement is invalid
							currentElement.after(uiBarMarkup);
							break;
					}

					if (!instanceData) {
						// Initialize instance data if not already present
						instanceData = jQuery.extend({}, jQuery.fn.contentPaginator.runtimeState, {
							targetContainer: currentElement,
							paginationControls: jQuery('.paginationControlBar', currentElement.parent()),
							originalContent: currentElement.html(),
							currentConfig: effectiveConfig // Store effective config per instance
						});
						currentElement.data('contentPaginator', instanceData);
					} else {
						// Update config if already initialized
						instanceData.currentConfig = effectiveConfig;
						currentElement.data('contentPaginator', instanceData);
					}

					currentElement.trigger('initUI').trigger('renderUI');
				});
			},
			destroy: function() {
				return this.each(function() {
					const currentElement = jQuery(this);
					const instanceData = currentElement.data('contentPaginator');
					const currentConfig = instanceData ? instanceData.currentConfig : jQuery.fn.contentPaginator.baseOptions; // Fallback

					if (currentConfig.eventListeners.onDestroy && typeof currentConfig.eventListeners.onDestroy === 'function') {
						currentConfig.eventListeners.onDestroy.call(currentElement, 'pluginDestroyed');
					}

					// Unbind all custom events
					currentElement.off('.contentPaginator');

					// Unbind UI element events if instanceData exists
					if (instanceData && instanceData.paginationControls) {
						jQuery('a.pageNavButton', instanceData.paginationControls).off('click');
						if (!jQuery.isEmptyObject(currentConfig.sortableFields)) {
							jQuery('a.sortFilterLink', instanceData.paginationControls).off('click');
						}
						if (currentConfig.enablePageSizeDropdown) {
							jQuery('a.pageSizeChanger', instanceData.paginationControls).off('click');
						}
						jQuery('.pageJumpForm', instanceData.paginationControls).off('submit');
						jQuery('.pageJumpForm input', instanceData.paginationControls).off('keypress');

						// Restore original content and remove UI elements
						currentElement.html(instanceData.originalContent);
						instanceData.paginationControls.remove();
					}

					currentElement.unwrap().removeClass('paginatedContentArea');
					currentElement.removeData('contentPaginator'); // Clean up instance data
				});
			},
			// Allows getting or setting configuration options
			configure: function(configKeyOrObject, newValue) {
				const currentElement = jQuery(this);
				let instanceData = currentElement.data('contentPaginator');
				if (!instanceData) {
					jQuery.error('Paginator not initialized on this element.');
					return;
				}
				const oldConfig = jQuery.extend(true, {}, instanceData.currentConfig); // Deep copy of current config

				if (typeof configKeyOrObject === 'object') {
					// Set multiple options
					jQuery.extend(true, instanceData.currentConfig, configKeyOrObject);
				} else if (arguments.length === 2) {
					// Set a single option
					instanceData.currentConfig[configKeyOrObject] = newValue;
				} else {
					// Get an option
					return instanceData.currentConfig[configKeyOrObject];
				}

				// Trigger change event for each modified option
				jQuery.each(oldConfig, function(key, oldValue) {
					if (instanceData.currentConfig[key] !== oldValue) {
						currentElement.trigger('configUpdated', [key, oldValue, instanceData.currentConfig[key]]);
					}
				});

				currentElement.data('contentPaginator', instanceData); // Update data
				return this; // Allow chaining
			},
			// Forces a data reload based on current configuration
			refreshData: function() {
				return this.each(function() {
					const currentElement = jQuery(this);
					const instanceData = currentElement.data('contentPaginator');
					if (!instanceData) {
						jQuery.error('Paginator not initialized on this element.');
						return;
					}
					jQuery.contentPaginator._initiateDataFetch.call(currentElement, instanceData.currentConfig.currentPageNumber);
				});
			}
		},
		eventCallbacks: { // Handlers for internal and custom events
			configChangeHandler: function(event, optionName, prevValue, nextValue) {
				const currentElement = jQuery(this);
				const instanceData = currentElement.data('contentPaginator');
				if (!instanceData) return; // Guard clause

				switch (optionName) {
					case "currentPageNumber":
						// Validate new page number against total pages
						if (nextValue > instanceData.totalAvailablePages && (instanceData.isUIRendered && instanceData.isDataLoaded)) {
							instanceData.currentConfig.currentPageNumber = prevValue; // Revert to old value
							jQuery('form[name="pageJump"] input[name="page"]', instanceData.paginationControls).val(prevValue);
							console.warn('Attempted to navigate to a page beyond available page count. Reverting to previous page.'); // Changed from $.error
						} else {
							currentElement.trigger('pageIndexChanged', nextValue);
						}
						break;
					case "extraCssClasses":
						const controlBars = instanceData.paginationControls;
						if (controlBars && !controlBars.hasClass(nextValue)) {
							controlBars.addClass(nextValue);
						}
						break;
					case "searchTextQuery":
						// If search query changes, reset to first page
						currentElement.trigger('pageIndexChanged', 1);
						break;
					case "recordsPerPage":
						// If records per page changes, reset to first page and reload
						currentElement.trigger('pageIndexChanged', 1);
						break;
				}
			},
			jumpFormHandler: function(event) {
				event.preventDefault(); // Prevent default form submission
				const formElement = jQuery(this);
				const targetPaginator = jQuery('.paginatedContentArea', formElement.closest('.paginationControlBar').parent());
				const requestedPage = jQuery('input[name="page"]', formElement).val();

				// Basic input validation for page number
				if (isNaN(requestedPage) || parseInt(requestedPage, 10) <= 0) {
					console.warn('Invalid page number entered: ' + requestedPage);
					return false;
				}
				targetPaginator.contentPaginator('configure', 'currentPageNumber', parseInt(requestedPage, 10));
				return false;
			},
			pageChangedHandler: function(event, newPageIndex) {
				const currentElement = jQuery(this);
				const instanceData = currentElement.data('contentPaginator');
				if (!instanceData) return;

				let actualPageIndex = newPageIndex;
				// Ensure page index is within valid bounds
				if (newPageIndex < 1) {
					actualPageIndex = 1;
				} else if (newPageIndex > instanceData.totalAvailablePages) {
					actualPageIndex = instanceData.totalAvailablePages;
				}

				// If the page isn't actually changing, don't re-fetch
				if (instanceData.currentConfig.currentPageNumber === actualPageIndex && instanceData.isDataLoaded) {
					return;
				}

				instanceData.currentConfig.currentPageNumber = actualPageIndex; // Update config
				currentElement.data('contentPaginator', instanceData); // Persist updated data

				jQuery.contentPaginator._initiateDataFetch.call(currentElement, actualPageIndex);
			},
			filterLinkHandler: function(event) {
				event.preventDefault();
				const targetElement = event.data.containerElement;
				const currentLink = jQuery(this);
				const sortIdentifier = currentLink.attr('data-sort-key'); // Changed from 'rel' to 'data-sort-key'
				const instanceData = targetElement.data('contentPaginator');
				if (!instanceData) return;

				const allSortLinks = jQuery('.sortFilterLink', instanceData.paginationControls);
				const currentConfig = instanceData.currentConfig;

				// Reset all sort icons
				jQuery('i', allSortLinks).removeClass('icon-arrow-up').removeClass('icon-arrow-down').addClass('icon-blank'); // Added 'icon-blank'

				let newSortDirection = 'asc';
				if (currentConfig.sortKey === sortIdentifier) {
					// If clicking the same column, toggle direction
					newSortDirection = (currentConfig.sortDirection === 'asc') ? 'desc' : 'asc';
				} else {
					// If clicking a new column, default to 'asc'
					newSortDirection = 'asc';
				}

				// Update the icon for the clicked link
				const iconElement = jQuery('i', currentLink);
				iconElement.removeClass('icon-blank').addClass(newSortDirection === 'asc' ? 'icon-arrow-up' : 'icon-arrow-down');

				// Update configuration and trigger data fetch
				currentConfig.sortKey = sortIdentifier;
				currentConfig.sortDirection = newSortDirection;
				targetElement.contentPaginator('configure', { sortKey: sortIdentifier, sortDirection: newSortDirection }); // Use configure method
				jQuery.contentPaginator._initiateDataFetch.call(targetElement, currentConfig.currentPageNumber);
				return false;
			},
			limitLinkHandler: function(event) {
				event.preventDefault();
				const targetElement = event.data.containerElement;
				const currentLink = jQuery(this);
				const newLimit = parseInt(currentLink.text(), 10); // Parse integer
				const instanceData = targetElement.data('contentPaginator');
				if (!instanceData) return;

				const allLimitLinks = jQuery('.pageSizeChanger', instanceData.paginationControls);
				// Reset all limit icons
				jQuery('i', allLimitLinks).removeClass('icon-bullet').addClass('icon-blank'); // Changed icon classes

				// Update the icon for the clicked link
				jQuery('i', currentLink).removeClass('icon-blank').addClass('icon-bullet');

				// Update configuration and trigger data fetch
				targetElement.contentPaginator('configure', 'recordsPerPage', newLimit); // Use configure method
				jQuery.contentPaginator._initiateDataFetch.call(targetElement, 1); // Reset to page 1 when limit changes
				return false;
			},
			navLinkHandler: function(event) {
				event.preventDefault();
				const targetElement = event.data.containerElement;
				const actionRequested = jQuery(this).attr('data-nav-action'); // Changed from 'rel' to 'data-nav-action'

				// Only trigger if the button is not disabled
				if (!jQuery(this).hasClass('is-disabled')) { // Changed class name
					targetElement.trigger(actionRequested + '.contentPaginator'); // Trigger specific custom event
				}
				return false;
			},
			firstPageNavHandler: function(event) {
				jQuery(this).trigger('configUpdated', ['currentPageNumber', jQuery(this).data('contentPaginator').currentConfig.currentPageNumber, 1]);
			},
			previousPageNavHandler: function(event) {
				const instanceData = jQuery(this).data('contentPaginator');
				jQuery(this).trigger('configUpdated', ['currentPageNumber', instanceData.currentConfig.currentPageNumber, instanceData.currentConfig.currentPageNumber - 1]);
			},
			lastPageNavHandler: function(event) {
				const instanceData = jQuery(this).data('contentPaginator');
				jQuery(this).trigger('configUpdated', ['currentPageNumber', instanceData.currentConfig.currentPageNumber, instanceData.totalAvailablePages]);
			},
			nextPageNavHandler: function(event) {
				const instanceData = jQuery(this).data('contentPaginator');
				jQuery(this).trigger('configUpdated', ['currentPageNumber', instanceData.currentConfig.currentPageNumber, instanceData.currentConfig.currentPageNumber + 1]);
			},
			initHandler: function() {
				const currentElement = jQuery(this);
				const instanceData = currentElement.data('contentPaginator');
				if (!instanceData) return;

				if (instanceData.currentConfig.eventListeners.onInitialize && typeof instanceData.currentConfig.eventListeners.onInitialize === 'function') {
					instanceData.currentConfig.eventListeners.onInitialize.call(currentElement, 'initUI');
				}
			},
			renderHandler: function(event) {
				const currentElement = jQuery(this);
				let instanceData = currentElement.data('contentPaginator');
				if (!instanceData) return;

				if (instanceData.currentConfig.eventListeners.onRenderUI && typeof instanceData.currentConfig.eventListeners.onRenderUI === 'function') {
					instanceData.currentConfig.eventListeners.onRenderUI.call(currentElement, 'renderUI');
				}

				// Bind UI elements
				const controls = instanceData.paginationControls;
				if (controls) { // Guard for controls existing
					jQuery('a.pageNavButton', controls).on('click', {
						containerElement: currentElement
					}, interactionHandlers.navLinkHandler);
					jQuery('.pageJumpForm', controls).on('submit', interactionHandlers.jumpFormHandler);
					jQuery('.pageJumpForm input', controls).on('keypress', function(e) {
						const keyCode = e.which || e.keyCode; // Cross-browser key code
						if (keyCode === 13) { // Enter key
							e.preventDefault();
							jQuery(this).parent().trigger('submit');
							return false;
						}
						return true;
					});

					// Bind sortable columns if configured
					if (!jQuery.isEmptyObject(instanceData.currentConfig.sortableFields)) {
						jQuery('a.sortFilterLink', controls).on('click', {
							containerElement: currentElement
						}, interactionHandlers.filterLinkHandler);
					}
					// Bind page size dropdown if enabled
					if (instanceData.currentConfig.enablePageSizeDropdown) {
						jQuery('a.pageSizeChanger', controls).on('click', {
							containerElement: currentElement
						}, interactionHandlers.limitLinkHandler);
					}
				}

				instanceData.isUIRendered = true; // Mark UI as rendered
				currentElement.data('contentPaginator', instanceData); // Update instance data

				currentElement.trigger('pageIndexChanged', instanceData.currentConfig.currentPageNumber); // Initial data load
			},
			beforeLoadHandler: function(event) {
				const currentElement = jQuery(this);
				const instanceData = currentElement.data('contentPaginator');
				if (!instanceData) return;

				if (instanceData.currentConfig.eventListeners.onBeforeLoad && typeof instanceData.currentConfig.eventListeners.onBeforeLoad === 'function') {
					instanceData.currentConfig.eventListeners.onBeforeLoad.call(currentElement, 'beforeDataLoad');
				}
				jQuery.contentPaginator._overlayContent.call(currentElement, instanceData.currentConfig.loadingMessage); // Show loading overlay
			},
			loadHandler: function(event) {
				const currentElement = jQuery(this);
				const instanceData = currentElement.data('contentPaginator');
				if (!instanceData) return;

				if (instanceData.currentConfig.eventListeners.onDataLoaded && typeof instanceData.currentConfig.eventListeners.onDataLoaded === 'function') {
					instanceData.currentConfig.eventListeners.onDataLoaded.call(currentElement, 'dataLoadComplete');
				}
				jQuery.contentPaginator._hideOverlay.call(currentElement); // Hide loading overlay
			}
		},
		_createPagingUI: function(currentConfig) {
			// Helper to create the pagination control bar HTML
			let uiHtml = `
            <div class="paginationControlBar ${currentConfig.extraCssClasses}">
                <div class="paginationControlBar-inner">
                    <div class="container-fluid">
                        <div class="nav-container-wrapper">
                            <ul class="nav nav-pills">
                                <li><a href="#" class="pageNavButton" data-nav-action="goToFirst">|&laquo;</a></li>
                                <li class="divider-vertical"></li>
                                <li><a href="#" class="pageNavButton" data-nav-action="goToPrev">&laquo;</a></li>
                                <li class="divider-vertical"></li>
                            </ul>
                            <form name="pageJump" class="pageJumpForm pull-left">
                                <strong>Page</strong> <input type="text" name="page" value="0" style="width:30px;" class="page-number-input" /> <strong>of <span class="total-page-count">0</span></strong>
                            </form>
                            <ul class="nav nav-pills">
                                <li class="divider-vertical"></li>
                                <li><a href="#" class="pageNavButton" data-nav-action="goToNext">&raquo;</a></li>
                                <li class="divider-vertical"></li>
                                <li><a href="#" class="pageNavButton" data-nav-action="goToLast">&raquo;|</a></li>
                                <li class="divider-vertical"></li>
            `;

			// Add page size dropdown if enabled
			if (currentConfig.enablePageSizeDropdown) {
				uiHtml += `
                    <li class="dropdown">
                        <a class="dropdown-toggle" data-toggle="dropdown" href="#">Show <b class="caret"></b></a>
                        <ul class="dropdown-menu">
                `;
				for (const limitOption of currentConfig.pageSizeOptions) {
					const isActive = (limitOption === currentConfig.recordsPerPage) ? 'icon-bullet' : 'icon-blank';
					uiHtml += `<li><a href="#" class="pageSizeChanger" data-records-per-page="${limitOption}"><i class="${isActive}"></i> ${limitOption}</a></li>`;
				}
				uiHtml += `
                        </ul>
                    </li>
                    <li class="divider-vertical"></li>
                `;
			}

			// Add sort by dropdown if sortable fields are defined
			if (!jQuery.isEmptyObject(currentConfig.sortableFields)) {
				uiHtml += `
                    <li class="dropdown">
                        <a class="dropdown-toggle" data-toggle="dropdown" href="#">Sort By <b class="caret"></b></a>
                        <ul class="dropdown-menu">
                `;
				for (const sortKey in currentConfig.sortableFields) {
					let sortIconClass = 'icon-blank';
					if (currentConfig.sortKey === sortKey) {
						sortIconClass = (currentConfig.sortDirection === 'asc') ? 'icon-arrow-up' : 'icon-arrow-down';
					}
					uiHtml += `<li><a href="#" class="sortFilterLink" data-sort-key="${sortKey}"><i class="${sortIconClass}"></i> ${currentConfig.sortableFields[sortKey]}</a></li>`;
				}
				uiHtml += `
                        </ul>
                    </li>
                    <li class="divider-vertical"></li>
                `;
			}

			uiHtml += `
                            </ul>
                            <span class="pull-right navbar-text record-summary-display" style="margin-right:15px;">
                                <strong>Displaying <span class="first-rec-num">0</span> - <span class="last-rec-num">0</span> of <span class="total-rec-count">0</span></strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            `;
			return uiHtml;
		},
		_overlayContent: function(displayLabel) {
			const currentElement = jQuery(this);
			currentElement.append('<div class="component-overlay fade in" />').addClass('overlay-active'); // Changed classes
			if (displayLabel !== undefined && displayLabel !== null && displayLabel.length > 0) { // Added null/length check
				const overlayMessageDiv = jQuery('<div class="overlay-message alert alert-info" style="display:none;"></div>');
				overlayMessageDiv.append(`<span>${displayLabel}</span>`); // Changed to span for better alignment
				currentElement.append(overlayMessageDiv);

				// Center the message dynamically
				const elementHeight = currentElement.height();
				const elementWidth = currentElement.width();
				const messageHeight = overlayMessageDiv.outerHeight(); // Use outerHeight for padding/border
				const messageWidth = overlayMessageDiv.outerWidth();

				overlayMessageDiv.css({
					"top": Math.round((elementHeight / 2) - (messageHeight / 2)) + "px",
					"left": Math.round((elementWidth / 2) - (messageWidth / 2)) + "px"
				}).show();
			}
		},
		_hideOverlay: function() {
			const currentElement = jQuery(this);
			jQuery('div.component-overlay, div.overlay-message', currentElement).remove(); // Changed selectors
			currentElement.removeClass('overlay-active');
		},
		_refreshPagingDisplay: function(pageIndex, totalPages, totalRecords) {
			const currentElement = jQuery(this);
			let instanceData = currentElement.data('contentPaginator');
			if (!instanceData) return; // Guard clause

			instanceData = jQuery.extend(instanceData, {
				totalAvailablePages: totalPages,
				totalAvailableRecords: totalRecords
			});

			const controls = instanceData.paginationControls;
			if (!controls) return; // Guard clause

			const firstButton = jQuery('a.pageNavButton[data-nav-action="goToFirst"]', controls);
			const prevButton = jQuery('a.pageNavButton[data-nav-action="goToPrev"]', controls);
			const nextButton = jQuery('a.pageNavButton[data-nav-action="goToNext"]', controls);
			const lastButton = jQuery('a.pageNavButton[data-nav-action="goToLast"]', controls);

			// Update button states based on current page
			if (pageIndex === 1) {
				firstButton.add(prevButton).addClass('is-disabled');
				if (totalPages > 1) {
					nextButton.add(lastButton).removeClass('is-disabled');
				} else { // Only one page
					nextButton.add(lastButton).addClass('is-disabled');
				}
			} else if (pageIndex === totalPages) {
				firstButton.add(prevButton).removeClass('is-disabled');
				nextButton.add(lastButton).addClass('is-disabled');
			} else { // Middle page
				firstButton.add(prevButton).add(nextButton).add(lastButton).removeClass('is-disabled');
			}

			// Update current page in config
			instanceData.currentConfig.currentPageNumber = pageIndex;

			// Calculate displayed record range
			const limit = instanceData.currentConfig.recordsPerPage;
			const startCount = (limit * (pageIndex - 1)) + 1;
			const endCount = Math.min((limit * pageIndex), totalRecords);

			instanceData = jQuery.extend(instanceData, {
				firstDisplayedRecord: startCount,
				lastDisplayedRecord: endCount
			});
			currentElement.data('contentPaginator', instanceData); // Update instance data

			// Update UI text elements
			jQuery('.record-summary-display .first-rec-num', controls).text(instanceData.firstDisplayedRecord);
			jQuery('.record-summary-display .last-rec-num', controls).text(instanceData.lastDisplayedRecord);
			jQuery('.record-summary-display .total-rec-count', controls).text(instanceData.totalAvailableRecords);
			jQuery('.pageJumpForm .total-page-count', controls).text(instanceData.totalAvailablePages);
			jQuery('form[name="pageJump"] input[name="page"]', controls).val(pageIndex);
		},
		_initiateDataFetch: function(requestedPage) {
			const currentElement = jQuery(this);
			const instanceData = currentElement.data('contentPaginator');
			if (!instanceData) {
				jQuery.error('Paginator not initialized on this element.');
				return;
			}
			const currentConfig = instanceData.currentConfig;

			// Trigger before load event
			currentElement.trigger('beforeDataLoad');

			// Prepare AJAX request parameters
			const ajaxOptions = jQuery.extend({}, currentConfig.requestSettings);
			const requestParams = {};

			// Calculate start index based on page and limit
			const startIndex = (requestedPage - 1) * currentConfig.recordsPerPage;

			// Populate request parameters using configured keys
			requestParams[currentConfig.queryParameters.startIndex] = startIndex;
			requestParams[currentConfig.queryParameters.recordsLimit] = currentConfig.recordsPerPage;
			requestParams[currentConfig.queryParameters.pageIndex] = requestedPage;

			if (currentConfig.sortKey) {
				requestParams[currentConfig.queryParameters.sortColumn] = currentConfig.sortKey;
				requestParams[currentConfig.queryParameters.sortOrder] = currentConfig.sortDirection;
			}
			if (currentConfig.searchTextQuery) {
				requestParams[currentConfig.queryParameters.searchTerm] = currentConfig.searchTextQuery;
			}

			// Merge custom request data
			ajaxOptions.data = jQuery.extend({}, ajaxOptions.data, requestParams);

			// Perform the AJAX request
			jQuery.ajax(ajaxOptions)
				.done(function(response) {
					// Trigger preprocess listener
					if (currentConfig.eventListeners.onDataPreprocess && typeof currentConfig.eventListeners.onDataPreprocess === 'function') {
						response = currentConfig.eventListeners.onDataPreprocess.call(currentElement, response);
					}

					// Parse response based on dataParser configuration
					const isSuccess = jQuery.contentPaginator._getNestedValue(response, currentConfig.dataParser.successIndicator);
					const responseMessage = jQuery.contentPaginator._getNestedValue(response, currentConfig.dataParser.statusMessage);
					const totalPages = jQuery.contentPaginator._getNestedValue(response, currentConfig.dataParser.totalPagesKey);
					const totalRecords = jQuery.contentPaginator._getNestedValue(response, currentConfig.dataParser.totalRecordsKey);
					const dataItems = jQuery.contentPaginator._getNestedValue(response, currentConfig.dataParser.dataRootKey);

					if (isSuccess) {
						// Update pagination display
						jQuery.contentPaginator._refreshPagingDisplay.call(currentElement, requestedPage, totalPages, totalRecords);

						// Render content
						if (currentConfig.renderCallback && typeof currentConfig.renderCallback === 'function') {
							currentConfig.renderCallback.call(currentElement, dataItems);
						} else {
							// Default rendering: clear content and display a message or raw data
							currentElement.html('<p>No custom render callback provided. Data fetched but not displayed.</p>');
							if (dataItems && dataItems.length > 0) {
								currentElement.append('<pre>' + JSON.stringify(dataItems, null, 2) + '</pre>');
							}
						}
						instanceData.isDataLoaded = true;
					} else {
						console.error('Data fetch failed: ' + responseMessage);
						currentElement.html(`<div class="alert alert-danger">Error loading data: ${responseMessage || 'Unknown error'}</div>`);
						instanceData.isDataLoaded = false;
					}
				})
				.fail(function(jqXHR, textStatus, errorThrown) {
					console.error('AJAX request failed:', textStatus, errorThrown);
					currentElement.html(`<div class="alert alert-danger">Network or server error: ${textStatus} - ${errorThrown}</div>`);
					instanceData.isDataLoaded = false;
				})
				.always(function() {
					currentElement.trigger('dataLoadComplete'); // Trigger load complete event
					currentElement.data('contentPaginator', instanceData); // Update instance data
				});
		},
		// Helper to safely access nested object properties using a dot-separated string path
		_getNestedValue: function(obj, path) {
			if (!obj || !path) return undefined;
			const parts = path.split('.');
			let current = obj;
			for (let i = 0; i < parts.length; i++) {
				if (current === null || typeof current !== 'object') {
					return undefined;
				}
				current = current[parts[i]];
			}
			return current;
		}
	};

})(jQuery);