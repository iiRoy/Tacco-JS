(function (jQ, globalObj, docElement) {
	/*
	 * Section: TableKit configuration variables
	 * Stores internal settings and extensions for the TableKit library.
	 */

	/*
	 * Property: tableConfigStore
	 * Purpose:  Holds the configuration details for each instance of TableKit.
	 * Scope:    jQ.fn
	 */
	jQ.fn.tableConfigStore = [];
	var _configList = jQ.fn.tableConfigStore; /* Quick alias for internal access */

	/*
	 * Property: tableExtenders
	 * Purpose:  A container for customisable components of TableKit.
	 * Scope:    jQ.fn
	 */
	jQ.fn.tableExtenders = {};
	var _extensionObj = jQ.fn.tableExtenders;


	/*
	 * Section: TableKit extensible objects
	 *
	 * The _extensionObj provides a space for user-defined plugins to be
	 * integrated into TableKit. Its properties include:
	 *   apiFunctions - Plugin API methods
	 *   typeDetectors - Automatic data type detection
	 *   sortMethods - Sorting algorithms used by TableKit (based on data type)
	 *   pagingManagers - Pagination implementations for various UI styles
	 */

	/*
	 * Property: versionId
	 * Purpose:  Version string for plugins to verify compatibility.
	 * Scope:    jQ.fn.tableExtenders
	 * Notes:    Format is x.y.z.w, where x, y, z are integers, and w (optional)
	 *           can be 'dev' or 'beta'.
	 */
	_extensionObj.versionId = "2.0.0beta";

	/*
	 * Property: errorBehavior
	 * Purpose:  How TableKit should handle errors. Can be 'consoleError' or 'raiseException'.
	 * Scope:    jQ.fn.tableExtenders
	 */
	_extensionObj.errorBehavior = "consoleError";

	/*
	 * Property: apiCounter
	 * Purpose:  Index indicating which 'this' context API functions should use.
	 * Scope:    jQ.fn.tableExtenders
	 */
	_extensionObj.apiCounter = 0;

	/*
	 * Property: apiFunctions
	 * Purpose:  Collection of public API functions for plugins.
	 * Scope:    jQ.fn.tableExtenders
	 */
	_extensionObj.apiFunctions = {};

	/*
	 * Property: filterRoutines
	 * Purpose:  Collection of plugin-defined filtering methods.
	 * Scope:    jQ.fn.tableExtenders
	 */
	_extensionObj.filterRoutines = [];

	/*
	 * Property: featureModules
	 * Purpose:  Collection of objects defining feature modules.
	 * Scope:    jQ.fn.tableExtenders
	 * Notes:    Each object contains:
	 *   initFunc: Function to initialize the feature. Takes cfgObj and returns a DOM node.
	 *   charSymbol: Character that will be matched in sDom - case sensitive.
	 *   featureName: Name of the feature for clarity.
	 */
	_extensionObj.featureModules = [];

	/*
	 * Property: searchHandlers
	 * Purpose:  Collection of custom filtering functions.
	 * Scope:    jQ.fn.tableExtenders
	 * Notes:    This is an object (keys match types) for custom filter functions,
	 *   useful for live DOM checks or pre-formatted text filtering.
	 */
	_extensionObj.searchHandlers = {};

	/*
	 * Property: sortDataSources
	 * Purpose:  Collection of functions for custom sorting data sources.
	 * Scope:    jQ.fn.tableExtenders
	 * Notes:    An associative array of functions executed before sorting a column
	 *   of a specific 'SortDataType'.
	 *   Function parameters:
	 *     object:cfgObj - TableKit settings object
	 *     int:columnIndex - Target column number
	 *   Return value: An array of data matching the full dataset size for the column
	 *     being sorted.
	 */
	_extensionObj.sortDataSources = [];

	/*
	 * Property: standardClasses
	 * Purpose:  Storage for the various CSS classes used by TableKit.
	 * Scope:    jQ.fn.tableExtenders
	 */
	_extensionObj.standardClasses = {
		/* Previous/Next paging buttons */
		"pagerPrevActive": "pager-active-previous",
		"pagerPrevInactive": "pager-inactive-previous",
		"pagerNextActive": "pager-active-next",
		"pagerNextInactive": "pager-inactive-next",
		"juiNextPageIcon": "",
		"juiPrevPageIcon": "",

		/* Full number paging buttons */
		"pageSelectorButton": "page-selector-button",
		"pageSelectorActive": "page-selector-active",
		"pageSelectorDisabled": "page-selector-button page-selector-disabled",
		"pageFirstLink": "first-page-link",
		"pagePreviousLink": "previous-page-link",
		"pageNextLink": "next-page-link",
		"pageLastLink": "last-page-link",

		/* Row stripping classes */
		"rowStripeOdd": "row-stripe-odd",
		"rowStripeEven": "row-stripe-even",

		/* Empty data row */
		"emptyRowMessage": "table-kit-empty-row",

		/* Feature containers */
		"containerWrapper": "table-kit-container",
		"filterInput": "table-kit-filter-input",
		"infoDisplay": "table-kit-info-display",
		"paginationArea": "table-kit-pagination pagination-style-", /* Type is appended */
		"lengthSelector": "table-kit-length-selector",
		"processingIndicator": "table-kit-processing-indicator",

		/* Sorting */
		"sortAscending": "column-sort-ascending",
		"sortDescending": "column-sort-descending",
		"sortableColumn": "column-sortable", /* Sortable in both directions */
		"sortableAscDisabled": "column-sortable-asc-disabled",
		"sortableDescDisabled": "column-sortable-desc-disabled",
		"sortableNone": "column-sortable-none",
		"sortColumnOrder": "column-sort-order-", /* Integer appended for sort order */
		"juiSortAscIcon": "",
		"juiSortDescIcon": "",
		"juiSortIndicator": "",
		"juiSortAscAvailable": "",
		"juiSortDescAvailable": "",
		"juiSortWrapper": "",
		"sortIconElement": "",

		/* Scrolling */
		"scrollWrapper": "table-kit-scroll-area",
		"scrollHeader": "table-kit-scroll-header",
		"scrollHeaderInner": "table-kit-scroll-header-inner",
		"scrollBody": "table-kit-scroll-body",
		"scrollFooter": "table-kit-scroll-footer",
		"scrollFooterInner": "table-kit-scroll-footer-inner",

		/* Miscellaneous */
		"footerHeader": ""
	};

	/*
	 * Property: juiClasses
	 * Purpose:  Storage for CSS classes used by TableKit, adapted for jQuery UI.
	 * Scope:    jQ.fn.tableExtenders
	 */
	_extensionObj.juiClasses = {
		/* Two-button paging */
		"pagerPrevActive": "jui-button-group jui-button jui-state-normal jui-corner-left",
		"pagerPrevInactive": "jui-button-group jui-button jui-state-normal jui-corner-left jui-state-inactive",
		"pagerNextActive": "jui-button-group jui-button jui-state-normal jui-corner-right",
		"pagerNextInactive": "jui-button-group jui-button jui-state-normal jui-corner-right jui-state-inactive",
		"juiNextPageIcon": "jui-icon jui-icon-arrow-east",
		"juiPrevPageIcon": "jui-icon jui-icon-arrow-west",

		/* Full number paging */
		"pageSelectorButton": "jui-button-group jui-button jui-state-normal",
		"pageSelectorActive": "jui-button-group jui-button jui-state-normal jui-state-inactive",
		"pageSelectorDisabled": "jui-button-group jui-button jui-state-normal jui-state-inactive",
		"pageFirstLink": "first-page jui-corner-topleft jui-corner-bottomleft",
		"pagePreviousLink": "prev-page",
		"pageNextLink": "next-page",
		"pageLastLink": "last-page jui-corner-topright jui-corner-bottomright",

		/* Row stripping */
		"rowStripeOdd": "striped-row-odd",
		"rowStripeEven": "striped-row-even",

		/* Empty data row */
		"emptyRowMessage": "table-kit-empty-data-row",

		/* Feature containers */
		"containerWrapper": "table-kit-jui-wrapper",
		"filterInput": "table-kit-jui-filter",
		"infoDisplay": "table-kit-jui-info",
		"paginationArea": "table-kit-jui-pagination jui-buttonset jui-buttonset-multi jui-pagination-type-", /* Type is appended */
		"lengthSelector": "table-kit-jui-length",
		"processingIndicator": "table-kit-jui-processing",

		/* Sorting */
		"sortAscending": "jui-state-normal",
		"sortDescending": "jui-state-normal",
		"sortableColumn": "jui-state-normal",
		"sortableAscDisabled": "jui-state-normal",
		"sortableDescDisabled": "jui-state-normal",
		"sortableNone": "jui-state-normal",
		"sortColumnOrder": "jui-sort-column-", /* Integer appended for sort order */
		"juiSortAscIcon": "jui-align-right jui-icon jui-icon-triangle-up",
		"juiSortDescIcon": "jui-align-right jui-icon jui-icon-triangle-down",
		"juiSortIndicator": "jui-align-right jui-icon jui-icon-carat-vertical",
		"juiSortAscAvailable": "jui-align-right jui-icon jui-icon-carat-up",
		"juiSortDescAvailable": "jui-align-right jui-icon jui-icon-carat-down",
		"juiSortWrapper": "table-kit-jui-sort-wrapper",
		"sortIconElement": "table-kit-jui-sort-icon",

		/* Scrolling */
		"scrollWrapper": "table-kit-jui-scroll-area",
		"scrollHeader": "table-kit-jui-scroll-header jui-state-normal",
		"scrollHeaderInner": "table-kit-jui-scroll-header-inner",
		"scrollBody": "table-kit-jui-scroll-body",
		"scrollFooter": "table-kit-jui-scroll-footer jui-state-normal",
		"scrollFooterInner": "table-kit-jui-scroll-footer-inner",

		/* Miscellaneous */
		"footerHeader": "jui-state-normal"
	};

	/*
	 * Property: pagingManagers
	 * Purpose:  Container for the various types of pagination supported by TableKit.
	 * Scope:    jQ.fn.tableExtenders
	 */
	_extensionObj.pagingManagers = {
		/*
		 * Property: dualButton
		 * Purpose:  Standard pagination with only 'previous' and 'next' buttons.
		 * Scope:    jQ.fn.tableExtenders.pagingManagers
		 */
		"dualButton": {
			/*
			 * Method: pagingManagers.dualButton.initializePaging
			 * Purpose:  Initializes DOM elements required for two-button pagination.
			 * Returns:  Nothing.
			 * Inputs:   object:cfgObj - TableKit settings object.
			 *           node:pagingContainer - The DIV holding this pagination control.
			 *           function:redrawCallback - Function to call when pagination updates.
			 */
			"initializePaging": function (cfgObj, pagingContainer, redrawCallback) {
				var prevBtn, nextBtn, prevInnerIcon, nextInnerIcon;

				/* Store next and previous elements in the cfgObj for potential automation/testing */
				if (!cfgObj.useJUI) {
					prevBtn = docElement.createElement('div');
					nextBtn = docElement.createElement('div');
				} else {
					prevBtn = docElement.createElement('a');
					nextBtn = docElement.createElement('a');

					nextInnerIcon = docElement.createElement('span');
					nextInnerIcon.className = cfgObj.displayClasses.juiNextPageIcon;
					nextBtn.appendChild(nextInnerIcon);

					prevInnerIcon = docElement.createElement('span');
					prevInnerIcon.className = cfgObj.displayClasses.juiPrevPageIcon;
					prevBtn.appendChild(prevInnerIcon);
				}

				prevBtn.className = cfgObj.displayClasses.pagerPrevInactive;
				nextBtn.className = cfgObj.displayClasses.pagerNextInactive;

				prevBtn.title = cfgObj.languagePack.pagination.prevText;
				nextBtn.title = cfgObj.languagePack.pagination.nextText;

				pagingContainer.appendChild(prevBtn);
				pagingContainer.appendChild(nextBtn);

				jQ(prevBtn).bind('click.TABLE_KIT', function () {
					if (cfgObj.apiMethods.changePage(cfgObj, "previous")) {
						/* Only redraw if the page index has actually changed */
						redrawCallback(cfgObj);
					}
				});

				jQ(nextBtn).bind('click.TABLE_KIT', function () {
					if (cfgObj.apiMethods.changePage(cfgObj, "next")) {
						redrawCallback(cfgObj);
					}
				});

				/* Prevent text selection aggressively */
				jQ(prevBtn).bind('selectstart.TABLE_KIT', function () { return false; });
				jQ(nextBtn).bind('selectstart.TABLE_KIT', function () { return false; });

				/* Assign IDs only to the first set of elements */
				if (cfgObj.tableIdentifier !== '' && typeof cfgObj.activeFeatures.paginationControl === "undefined") {
					pagingContainer.setAttribute('id', cfgObj.tableIdentifier + '_pager');
					prevBtn.setAttribute('id', cfgObj.tableIdentifier + '_previous_button');
					nextBtn.setAttribute('id', cfgObj.tableIdentifier + '_next_button');
				}
			},

			/*
			 * Method: pagingManagers.dualButton.updatePaging
			 * Purpose:  Refreshes the state of the two-button pagination after a draw.
			 * Returns:  Nothing.
			 * Inputs:   object:cfgObj - TableKit settings object.
			 *           function:redrawCallback - Draw function to invoke on page change.
			 */
			"updatePaging": function (cfgObj, redrawCallback) {
				if (!cfgObj.activeFeatures.paginationControl) {
					return;
				}

				/* Iterate over each instance of the pager */
				var pagerElements = cfgObj.activeFeatures.paginationControl;
				for (var idx = 0, lengthPager = pagerElements.length; idx < lengthPager; idx++) {
					if (pagerElements[idx].childNodes.length !== 0) {
						pagerElements[idx].childNodes[0].className =
							(cfgObj.startDisplayIdx === 0) ?
								cfgObj.displayClasses.pagerPrevInactive : cfgObj.displayClasses.pagerPrevActive;

						pagerElements[idx].childNodes[1].className =
							(cfgObj.getDisplayEndIndex() === cfgObj.getVisibleRecordCount()) ?
								cfgObj.displayClasses.pagerNextInactive : cfgObj.displayClasses.pagerNextActive;
					}
				}
			}
		},


		/*
		 * Property: fullPageDisplayCount
		 * Purpose:  Determines the number of page links to show in 'allPages' pagination.
		 * Scope:    jQ.fn.tableExtenders.pagingManagers
		 */
		"fullPageDisplayCount": 5,

		/*
		 * Property: allPages
		 * Purpose:  Full pagination with all page numbers displayed.
		 * Scope:    jQ.fn.tableExtenders.pagingManagers
		 */
		"allPages": {
			/*
			 * Method: pagingManagers.allPages.initializePaging
			 * Purpose:  Initializes DOM elements for pagination with a list of page numbers.
			 * Returns:  Nothing.
			 * Inputs:   object:cfgObj - TableKit settings object.
			 *           node:pagingContainer - The DIV holding this pagination control.
			 *           function:redrawCallback - Function to call when pagination updates.
			 */
			"initializePaging": function (cfgObj, pagingContainer, redrawCallback) {
				var firstBtn = docElement.createElement('span');
				var prevBtn = docElement.createElement('span');
				var pageListContainer = docElement.createElement('span');
				var nextBtn = docElement.createElement('span');
				var lastBtn = docElement.createElement('span');

				firstBtn.innerHTML = cfgObj.languagePack.pagination.firstText;
				prevBtn.innerHTML = cfgObj.languagePack.pagination.prevText;
				nextBtn.innerHTML = cfgObj.languagePack.pagination.nextText;
				lastBtn.innerHTML = cfgObj.languagePack.pagination.lastText;

				var displayClasses = cfgObj.displayClasses;
				firstBtn.className = displayClasses.pageSelectorButton + " " + displayClasses.pageFirstLink;
				prevBtn.className = displayClasses.pageSelectorButton + " " + displayClasses.pagePreviousLink;
				nextBtn.className = displayClasses.pageSelectorButton + " " + displayClasses.pageNextLink;
				lastBtn.className = displayClasses.pageSelectorButton + " " + displayClasses.pageLastLink;

				pagingContainer.appendChild(firstBtn);
				pagingContainer.appendChild(prevBtn);
				pagingContainer.appendChild(pageListContainer);
				pagingContainer.appendChild(nextBtn);
				pagingContainer.appendChild(lastBtn);

				jQ(firstBtn).bind('click.TABLE_KIT', function () {
					if (cfgObj.apiMethods.changePage(cfgObj, "first")) {
						redrawCallback(cfgObj);
					}
				});

				jQ(prevBtn).bind('click.TABLE_KIT', function () {
					if (cfgObj.apiMethods.changePage(cfgObj, "previous")) {
						redrawCallback(cfgObj);
					}
				});

				jQ(nextBtn).bind('click.TABLE_KIT', function () {
					if (cfgObj.apiMethods.changePage(cfgObj, "next")) {
						redrawCallback(cfgObj);
					}
				});

				jQ(lastBtn).bind('click.TABLE_KIT', function () {
					if (cfgObj.apiMethods.changePage(cfgObj, "last")) {
						redrawCallback(cfgObj);
					}
				});

				/* Prevent text selection on page links */
				jQ('span', pagingContainer)
					.bind('mousedown.TABLE_KIT', function () { return false; })
					.bind('selectstart.TABLE_KIT', function () { return false; });

				/* Assign IDs only to the initial elements */
				if (cfgObj.tableIdentifier !== '' && typeof cfgObj.activeFeatures.paginationControl === "undefined") {
					pagingContainer.setAttribute('id', cfgObj.tableIdentifier + '_pager');
					firstBtn.setAttribute('id', cfgObj.tableIdentifier + '_first_page');
					prevBtn.setAttribute('id', cfgObj.tableIdentifier + '_previous_page');
					nextBtn.setAttribute('id', cfgObj.tableIdentifier + '_next_page');
					lastBtn.setAttribute('id', cfgObj.tableIdentifier + '_last_page');
				}
			},

			/*
			 * Method: pagingManagers.allPages.updatePaging
			 * Purpose:  Updates the displayed list of page buttons.
			 * Returns:  Nothing.
			 * Inputs:   object:cfgObj - TableKit settings object.
			 *           function:redrawCallback - Draw function to call on page change.
			 */
			"updatePaging": function (cfgObj, redrawCallback) {
				if (!cfgObj.activeFeatures.paginationControl) {
					return;
				}

				var totalPageButtons = _extensionObj.pagingManagers.fullPageDisplayCount;
				var halfPageButtonCount = Math.floor(totalPageButtons / 2);
				var totalPages = Math.ceil(cfgObj.getVisibleRecordCount() / cfgObj.itemsPerPage);
				var currentViewPage = Math.ceil(cfgObj.startDisplayIdx / cfgObj.itemsPerPage) + 1;
				var pageLinkHTML = "";
				var startBtnNum, endBtnNum, iterator, loopLength;
				var displayClasses = cfgObj.displayClasses;

				/* Calculate page button range */
				if (totalPages < totalPageButtons) {
					startBtnNum = 1;
					endBtnNum = totalPages;
				}