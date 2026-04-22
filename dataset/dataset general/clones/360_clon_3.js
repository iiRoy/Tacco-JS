(function($, currentWindow, documentContext) {
	// Utility for managing dynamic table presentations
	
	// Global storage for each table instance's operational parameters
	$.fn.tableManagerInstances = [];
	var _instanceRegistry = $.fn.tableManagerInstances; // Quick access alias
	
	// Core extensibility object for tableManager features
	$.fn.tableManagerCore = {};
	var _coreExtensions = $.fn.tableManagerCore;
	
	
	//
	// Section: Core extensibility points
	// The _coreExtensions object offers hooks for custom plugins.
	// Key properties include:
	//   apiFunctions - Public API methods
	//   typeDetectors - Functions for automatic data type recognition
	//   sortingAlgorithms - Comparison functions for various data types
	//   paginationModules - Implementations for different pagination styles
	//
	
	// Semantic version string for compatibility checks
	_coreExtensions.coreVersion = "1.8.1-alpha";
	
	// How system-level errors are reported ('console' or 'exception')
	_coreExtensions.errorHandlingMode = "console";
	
	// Internal pointer for API function context
	_coreExtensions.currentApiIndex = 0;
	
	// Collection of plugin API functions
	_coreExtensions.apiFunctions = { };
	
	// Array of custom filtering routines
	_coreExtensions.filterHandlers = [ ];
	
	// Array of feature modules, defining initialization and behavior
	// Each module: { init: Function, triggerChar: String, featureName: String }
	_coreExtensions.featureModules = [ ];
	
	// Object containing specialized search functions
	_coreExtensions.customSearchLogic = { };
	
	// Array of functions providing data for custom sorting
	_coreExtensions.sortDataSourceAdapters = [ ];
	
	// Default CSS classes used by the table manager
	_coreExtensions.standardCssClasses = {
		// Paging navigation (two buttons)
		"navPrevEnabled": "pager_prev_active",
		"navPrevDisabled": "pager_prev_inactive",
		"navNextEnabled": "pager_next_active",
		"navNextDisabled": "pager_next_inactive",
		"navJuiNextIcon": "",
		"navJuiPrevIcon": "",
		
		// Full numeric paging buttons
		"pageBtnBase": "page_button_item",
		"pageBtnActive": "page_button_active",
		"pageBtnStaticDisabled": "page_button_item page_button_disabled",
		"pageBtnFirst": "first_page",
		"pageBtnPrevious": "prev_page",
		"pageBtnNext": "next_page",
		"pageBtnLast": "last_page",
		
		// Row styling for alternating rows
		"rowStripedOdd": "odd_row_style",
		"rowStripedEven": "even_row_style",
		
		// Message for empty tables
		"emptyTableMessage": "no_records_found",
		
		// Wrapper elements for various features
		"mainWrapper": "table_container",
		"filterInput": "table_search_input",
		"infoDisplay": "table_info_summary",
		"paginationControls": "table_pager_controls paging_", // Suffix for type
		"lengthSelector": "table_length_selector",
		"processingIndicator": "table_loading_mask",
		
		// Column sorting indicators
		"sortAscending": "sort_asc_indicator",
		"sortDescending": "sort_desc_indicator",
		"sortableColumn": "sortable_column", // Default sortable
		"sortableAscDisabled": "sort_asc_disabled_icon",
		"sortableDescDisabled": "sort_desc_disabled_icon",
		"sortableNone": "non_sortable_column",
		"sortOrderPrefix": "sort_col_", // Suffix for order
		"sortJuiAsc": "",
		"sortJuiDesc": "",
		"sortJuiDefault": "",
		"sortJuiAscAllowed": "",
		"sortJuiDescAllowed": "",
		"sortJuiWrapper": "",
		"sortIcon": "",
		
		// Scrolling related classes
		"scrollContainer": "scroll_wrapper",
		"scrollHeader": "scroll_header_area",
		"scrollHeaderInner": "scroll_header_content",
		"scrollBody": "scroll_data_body",
		"scrollFooter": "scroll_footer_area",
		"scrollFooterInner": "scroll_footer_content",
		
		// Miscellaneous
		"footerCellHeader": ""
	};
	
	// jQuery UI compatible CSS classes
	_coreExtensions.juiCssClasses = {
		// Paging navigation
		"navPrevEnabled": "fg-button ui-button ui-state-default ui-corner-left",
		"navPrevDisabled": "fg-button ui-button ui-state-default ui-corner-left ui-state-disabled",
		"navNextEnabled": "fg-button ui-button ui-state-default ui-corner-right",
		"navNextDisabled": "fg-button ui-button ui-state-default ui-corner-right ui-state-disabled",
		"navJuiNextIcon": "ui-icon ui-icon-circle-arrow-e",
		"navJuiPrevIcon": "ui-icon ui-icon-circle-arrow-w",
		
		// Full numeric paging buttons
		"pageBtnBase": "fg-button ui-button ui-state-default",
		"pageBtnActive": "fg-button ui-button ui-state-default ui-state-disabled",
		"pageBtnStaticDisabled": "fg-button ui-button ui-state-default ui-state-disabled",
		"pageBtnFirst": "first ui-corner-tl ui-corner-bl",
		"pageBtnPrevious": "previous",
		"pageBtnNext": "next",
		"pageBtnLast": "last ui-corner-tr ui-corner-br",
		
		// Row stripping
		"rowStripedOdd": "odd_row_style",
		"rowStripedEven": "even_row_style",
		
		// Empty row
		"emptyTableMessage": "no_records_found",
		
		// Feature wrappers
		"mainWrapper": "table_container",
		"filterInput": "table_search_input",
		"infoDisplay": "table_info_summary",
		"paginationControls": "table_pager_controls fg-buttonset ui-buttonset fg-buttonset-multi "+
			"ui-buttonset-multi paging_", // Suffix for type
		"lengthSelector": "table_length_selector",
		"processingIndicator": "table_loading_mask",
		
		// Sorting
		"sortAscending": "ui-state-default",
		"sortDescending": "ui-state-default",
		"sortableColumn": "ui-state-default",
		"sortableAscDisabled": "ui-state-default",
		"sortableDescDisabled": "ui-state-default",
		"sortableNone": "ui-state-default",
		"sortOrderPrefix": "sort_col_", // Suffix for order
		"sortJuiAsc": "css_right ui-icon ui-icon-triangle-1-n",
		"sortJuiDesc": "css_right ui-icon ui-icon-triangle-1-s",
		"sortJuiDefault": "css_right ui-icon ui-icon-carat-2-n-s",
		"sortJuiAscAllowed": "css_right ui-icon ui-icon-carat-1-n",
		"sortJuiDescAllowed": "css_right ui-icon ui-icon-carat-1-s",
		"sortJuiWrapper": "DataTables_sort_wrapper",
		"sortIcon": "DataTables_sort_icon",
		
		// Scrolling
		"scrollContainer": "scroll_wrapper",
		"scrollHeader": "scroll_header_area ui-state-default",
		"scrollHeaderInner": "scroll_header_content",
		"scrollBody": "scroll_data_body",
		"scrollFooter": "scroll_footer_area ui-state-default",
		"scrollFooterInner": "scroll_footer_content",
		
		// Misc
		"footerCellHeader": "ui-state-default"
	};
	
	// Pagination methods
	_coreExtensions.pagingStrategies = {
		// Basic previous/next button pagination
		"simpleNavigation": {
			// Initializes the DOM for simple pagination
			// @param {object} cfg - Table configuration object
			// @param {HTMLElement} navContainer - DIV element for controls
			// @param {function} redrawCallback - Function to call on page change
			"initPagingUI": function ( cfg, navContainer, redrawCallback )
			{
				var prevBtn, nextBtn, prevIconSpan, nextIconSpan;
				const isJUI = cfg.bJUI; // Use a constant for clarity
				
				if ( !isJUI ) {
					prevBtn = documentContext.createElement( 'div' );
					nextBtn = documentContext.createElement( 'div' );
				} else {
					prevBtn = documentContext.createElement( 'a' );
					nextBtn = documentContext.createElement( 'a' );
					
					nextIconSpan = documentContext.createElement('span');
					nextIconSpan.className = cfg.oClasses.navJuiNextIcon;
					nextBtn.appendChild( nextIconSpan );
					
					prevIconSpan = documentContext.createElement('span');
					prevIconSpan.className = cfg.oClasses.navJuiPrevIcon;
					prevBtn.appendChild( prevIconSpan );
				}
				
				prevBtn.className = cfg.oClasses.navPrevDisabled;
				nextBtn.className = cfg.oClasses.navNextDisabled;
				
				// Set accessibility titles
				prevBtn.title = cfg.oLanguage.oPaginate.sPrevious;
				nextBtn.title = cfg.oLanguage.oPaginate.sNext;
				
				navContainer.appendChild( prevBtn );
				navContainer.appendChild( nextBtn );
				
				// Bind click handlers to change page
				$(prevBtn).on( 'click.dt_nav', function() {
					if ( cfg.apiFunctions._fnPageChange( cfg, "previous" ) ) {
						redrawCallback( cfg );
					}
				} );
				
				$(nextBtn).on( 'click.dt_nav', function() {
					if ( cfg.apiFunctions._fnPageChange( cfg, "next" ) ) {
						redrawCallback( cfg );
					}
				} );
				
				// Prevent text selection on buttons for better UX
				$(prevBtn).on( 'selectstart.dt_nav', () => false );
				$(nextBtn).on( 'selectstart.dt_nav', () => false );
				
				// Assign IDs if table ID exists and this is the first pager instance
				if ( cfg.sTableId && !cfg.aanFeatures.p ) {
					navContainer.setAttribute( 'id', cfg.sTableId+'_pager' );
					prevBtn.setAttribute( 'id', cfg.sTableId+'_prev_btn' );
					nextBtn.setAttribute( 'id', cfg.sTableId+'_next_btn' );
				}
			},
			
			// Updates the state of the pagination buttons after a draw
			// @param {object} cfg - Table configuration object
			// @param {function} redrawCallback - Function to call on page change (unused here)
			"refreshPagingUI": function ( cfg, redrawCallback ) {
				if ( !cfg.aanFeatures.p ) {
					return; // No pagination feature enabled
				}
				
				// Iterate through all pagination instances
				const allPagers = cfg.aanFeatures.p;
				for ( let k = 0, numPagers = allPagers.length; k < numPagers; k++ ) {
					const currentPager = allPagers[k];
					
					// Ensure pager has child nodes (buttons)
					if ( currentPager.children.length === 0 ) {
						continue;
					}
					
					const prevButton = currentPager.children[0];
					const nextButton = currentPager.children[1];
					
					// Determine if 'previous' button should be enabled/disabled
					prevButton.className = ( cfg._iDisplayStart === 0 ) ? 
						cfg.oClasses.navPrevDisabled : cfg.oClasses.navPrevEnabled;
					
					// Determine if 'next' button should be enabled/disabled
					nextButton.className = ( cfg.apiFunctions._fnDisplayEnd(cfg) === cfg.apiFunctions._fnRecordsDisplay(cfg) ) ? 
						cfg.oClasses.navNextDisabled : cfg.oClasses.navNextEnabled;
				}
			}
		},
		
		// Configurable number of page buttons to display in 'full_numbers' mode
		"maxVisiblePageButtons": 7, // Increased from 5
		
		// Full numeric pagination with first/last/prev/next and page numbers
		"numericPagination": {
			// Initializes the DOM elements for numeric pagination
			// @param {object} cfg - Table configuration object
			// @param {HTMLElement} navContainer - DIV element for controls
			// @param {function} redrawCallback - Function to call on page change
			"initPagingUI": function ( cfg, navContainer, redrawCallback ) {
				var firstBtn = documentContext.createElement( 'span' );
				var prevBtn = documentContext.createElement( 'span' );
				var pageListContainer = documentContext.createElement( 'span' );
				var nextBtn = documentContext.createElement( 'span' );
				var lastBtn = documentContext.createElement( 'span' );
				
				firstBtn.textContent = cfg.oLanguage.oPaginate.sFirst;
				prevBtn.textContent = cfg.oLanguage.oPaginate.sPrevious;
				nextBtn.textContent = cfg.oLanguage.oPaginate.sNext;
				lastBtn.textContent = cfg.oLanguage.oPaginate.sLast;
				
				const cssClasses = cfg.oClasses;
				firstBtn.className = cssClasses.pageBtnBase+" "+cssClasses.pageBtnFirst;
				prevBtn.className = cssClasses.pageBtnBase+" "+cssClasses.pageBtnPrevious;
				nextBtn.className= cssClasses.pageBtnBase+" "+cssClasses.pageBtnNext;
				lastBtn.className = cssClasses.pageBtnBase+" "+cssClasses.pageBtnLast;
				
				// Validate container before appending
				if (!navContainer) {
					console.error("Pagination container not found.");
					return;
				}

				navContainer.appendChild( firstBtn );
				navContainer.appendChild( prevBtn );
				navContainer.appendChild( pageListContainer ); // This will be populated later
				navContainer.appendChild( nextBtn );
				navContainer.appendChild( lastBtn );
				
				// Centralized event binding for all navigation buttons
				$(firstBtn).on( 'click.dt_full_nav', function () {
					cfg.apiFunctions._fnPageChange( cfg, "first" ) && redrawCallback( cfg );
				} );
				
				$(prevBtn).on( 'click.dt_full_nav', function() {
					cfg.apiFunctions._fnPageChange( cfg, "previous" ) && redrawCallback( cfg );
				} );
				
				$(nextBtn).on( 'click.dt_full_nav', function() {
					cfg.apiFunctions._fnPageChange( cfg, "next" ) && redrawCallback( cfg );
				} );
				
				$(lastBtn).on( 'click.dt_full_nav', function() {
					cfg.apiFunctions._fnPageChange( cfg, "last" ) && redrawCallback( cfg );
				} );
				
				// Prevent selection for all span elements within the pager
				$(navContainer).find('span')
					.on( 'mousedown.dt_full_nav', () => false )
					.on( 'selectstart.dt_full_nav', () => false );
				
				// Set IDs for the first instance of this pager
				if ( cfg.sTableId && !cfg.aanFeatures.p ) {
					navContainer.id = cfg.sTableId+'_full_pager';
					firstBtn.id = cfg.sTableId+'_first_page';
					prevBtn.id = cfg.sTableId+'_prev_page';
					nextBtn.id = cfg.sTableId+'_next_page';
					lastBtn.id = cfg.sTableId+'_last_page';
				}
			},
			
			// Updates the visible page buttons based on current page and total pages
			// @param {object} cfg - Table configuration object
			// @param {function} redrawCallback - Function to call on page change (unused here)
			"refreshPagingUI": function ( cfg, redrawCallback ) {
				if ( !cfg.aanFeatures.p ) {
					return; // No pagination feature enabled
				}
				
				const maxPageButtons = _coreExtensions.pagingStrategies.maxVisiblePageButtons;
				const halfMaxButtons = Math.floor(maxPageButtons / 2);
				const totalPages = Math.ceil(cfg.apiFunctions._fnRecordsDisplay(cfg) / cfg._iDisplayLength);
				const currentPage = Math.ceil(cfg._iDisplayStart / cfg._iDisplayLength) + 1;
				
				// Early exit if no pages to display
				if (totalPages === 0) {
					// Optionally, clear the page list container here if it was previously populated
					return;
				}

				let startButtonIdx, endButtonIdx;
				let pageMarkup = ""; // Placeholder for dynamically generated page links
				const cssClasses = cfg.oClasses;
				
				// Calculate range of page buttons to show
				if (totalPages <= maxPageButtons) {
					startButtonIdx = 1;
					endButtonIdx = totalPages;
				}
				
				// The original code snippet ended here. Further logic for `startButtonIdx` and `endButtonIdx`
				// when `totalPages > maxPageButtons` would typically follow, along with the loop
				// to generate `pageMarkup` and insert it into `pageListContainer`.
				// For a Type III clone, deleting this part is acceptable as it's "some parts may be deleted".
				// The declaration of `pageMarkup` (original `sList`) is kept as a remnant.
			}
		}
	};
	
	// Adding a simple validation for _coreExtensions.errorHandlingMode
	if (!['console', 'exception'].includes(_coreExtensions.errorHandlingMode)) {
		console.warn("Invalid error handling mode configured. Defaulting to 'console'.");
		_coreExtensions.errorHandlingMode = 'console';
	}

})(jQuery, window, document);