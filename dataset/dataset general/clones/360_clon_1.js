// This file contains the core JavaScript logic for DataTables.
// It was originally developed by Allan Jardine.
// Version: 1.8.1
// Project: Mtaala
// Contact: allan.jardine@sprymedia.co.uk
//
// Copyright (c) 2008-2011 Allan Jardine. All rights reserved.
// This software is distributed under the GPL v2 or BSD 3-point license.
// Please see the accompanying license files for full details.
//
// This software is provided "AS IS", WITHOUT ANY WARRANTIES,
// express or implied, including but not limited to, the warranties of
// MERCHANTABILITY and FITNESS FOR A PARTICULAR PURPOSE.
// For more information, visit: http://www.datatables.net

// jsLint configuration: allowing eval() for cookie handling.
/*jslint evil: true, undef: true, browser: true */
/*globals $, jQuery,_fnExternApiFunc,_fnInitalise,_fnInitComplete,_fnLanguageProcess,_fnAddColumn,_fnColumnOptions,_fnAddData,_fnCreateTr,_fnGatherData,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAjaxUpdate,_fnAjaxUpdateDraw,_fnAddOptionsHtml,_fnFeatureHtmlTable,_fnScrollDraw,_fnAjustColumnSizing,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnBuildSearchArray,_fnBuildSearchRow,_fnFilterCreateSearch,_fnDataToSearch,_fnSort,_fnSortAttachListener,_fnSortingClasses,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnFeatureHtmlLength,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnNodeToDataIndex,_fnVisbleColumns,_fnCalculateEnd,_fnConvertToWidth,_fnCalculateColumnWidths,_fnScrollingWidthAdjust,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnArrayCmp,_fnDetectType,_fnSettingsFromNode,_fnGetDataMaster,_fnGetTrNodes,_fnGetTdNodes,_fnEscapeRegex,_fnDeleteIndex,_fnReOrderIndex,_fnColumnOrdering,_fnLog,_fnClearTable,_fnSaveState,_fnLoadState,_fnCreateCookie,_fnReadCookie,_fnDetectHeader,_fnGetUniqueThs,_fnScrollBarWidth,_fnApplyToChildren,_fnMap,_fnGetRowData,_fnGetCellData,_fnSetCellData,_fnGetObjectDataFn,_fnSetObjectDataFn*/

( function( $, window, document ) {

	// Section: DataTables Internal Variables
	// This section defines core variables used throughout the DataTables library.

	// Variable: dataTableSettings
	// Purpose: Stores configuration objects for each DataTables instance.
	// Scope: Accessible via jQuery.fn
	$.fn.dataTableSettings = [ ];


	// Short alias for internal access to dataTableSettings, optimizing lookups.
	var _aoSettings = $.fn.dataTableSettings;

	// Variable: dataTableExt
	// Purpose: A container for extensible parts of DataTables, allowing plugins.
	// Scope: Accessible via jQuery.fn
	$.fn.dataTableExt = { };
	var _oExt = $.fn.dataTableExt; // Another short reference for internal use.


	// Section - DataTables Extensible Objects
	// The _oExt object serves as an extension point for user-defined plugins.
	// Key properties include:
	//   - oApi: Functions for the plugin API.
	//   - aTypes: Auto-detection mechanisms for data types.
	//   - oSort: Sorting routines based on identified data types.
	//   - oPagination: Various pagination styles.

	// Variable: sVersion
	// Purpose: DataTables version string, used by plugins for compatibility checks.
	// Scope: jQuery.fn.dataTableExt
	// Format: a.b.c.d.e (a,b,c are integers; d is string like 'dev' or 'beta'; e is int; d and e are optional)
	_oExt.sVersion = "1.8.1";


	// Variable: sErrMode
	// Purpose: Defines how DataTables reports errors. Can be 'alert' or 'throw'.
	// Scope: jQuery.fn.dataTableExt
	_oExt.sErrMode = "alert";

	// Variable: iApiIndex
	// Purpose: Specifies the index for 'this' in API functions.
	// Scope: jQuery.fn.dataTableExt
	_oExt.iApiIndex = 0;

	// Variable: oApi
	// Purpose: Holds plugin API functions.
	// Scope: jQuery.fn.dataTableExt
	_oExt.oApi = { };


	// Variable: afnFiltering
	// Purpose: Contains an array of plugin filtering functions.
	// Scope: jQuery.fn.dataTableExt
	_oExt.afnFiltering = [ ];


	// Variable: aoFeatures
	// Purpose: Stores plugin feature functions.
	// Scope: jQuery.fn.dataTableExt
	// Notes: This is an array of objects. Each object has:
	//   - fnInit: Function for feature initialization (takes oSettings, returns node).
	//   - cFeature: Character to match in sDom (case sensitive).
	//   - sFeature: Feature name (for descriptive purposes).
	_oExt.aoFeatures = [ ];


	// Variable: ofnSearch
	// Purpose: Container for custom filtering functions.
	// Scope: jQuery.fn.dataTableExt
	// Notes: This object uses type names as keys for custom filtering functions,
	//        which can perform live DOM checks or formatted text filtering.
	_oExt.ofnSearch = { };


	// Variable: afnSortData
	// Purpose: Stores functions for custom sorting data sources.
	// Scope: jQuery.fn.dataTableExt
	// Notes: An associative array of functions. Each function runs before a column
	//        of its 'SortDataType' is sorted.
	//        Inputs: oSettings (DataTables settings object), iColumn (target column index).
	//        Returns: An array of data matching the full dataset size for the column.
	_oExt.afnSortData = [ ];


	// Variable: oStdClasses
	// Purpose: Defines standard CSS classes used by DataTables.
	// Scope: jQuery.fn.dataTableExt
	_oExt.oStdClasses = {
		// Two-button pagination classes
		"sPagePrevEnabled": "paginate_enabled_previous",
		"sPagePrevDisabled": "paginate_disabled_previous",
		"sPageNextEnabled": "paginate_enabled_next",
		"sPageNextDisabled": "paginate_disabled_next",
		"sPageJUINext": "",
		"sPageJUIPrev": "",

		// Full numbers pagination button classes
		"sPageButton": "paginate_button",
		"sPageButtonActive": "paginate_active",
		"sPageButtonStaticDisabled": "paginate_button paginate_button_disabled",
		"sPageFirst": "first",
		"sPagePrevious": "previous",
		"sPageNext": "next",
		"sPageLast": "last",

		// Row stripping classes
		"sStripOdd": "odd",
		"sStripEven": "even",

		// Class for empty table rows
		"sRowEmpty": "dataTables_empty",

		// Feature wrapper classes
		"sWrapper": "dataTables_wrapper",
		"sFilter": "dataTables_filter",
		"sInfo": "dataTables_info",
		"sPaging": "dataTables_paginate paging_", /* Pagination type is postfixed */
		"sLength": "dataTables_length",
		"sProcessing": "dataTables_processing",

		// Sorting classes
		"sSortAsc": "sorting_asc",
		"sSortDesc": "sorting_desc",
		"sSortable": "sorting", /* Sortable in both directions */
		"sSortableAsc": "sorting_asc_disabled",
		"sSortableDesc": "sorting_desc_disabled",
		"sSortableNone": "sorting_disabled",
		"sSortColumn": "sorting_", /* Sorting order integer is postfixed */
		"sSortJUIAsc": "",
		"sSortJUIDesc": "",
		"sSortJUI": "",
		"sSortJUIAscAllowed": "",
		"sSortJUIDescAllowed": "",
		"sSortJUIWrapper": "",
		"sSortIcon": "",

		// Scrolling classes
		"sScrollWrapper": "dataTables_scroll",
		"sScrollHead": "dataTables_scrollHead",
		"sScrollHeadInner": "dataTables_scrollHeadInner",
		"sScrollBody": "dataTables_scrollBody",
		"sScrollFoot": "dataTables_scrollFoot",
		"sScrollFootInner": "dataTables_scrollFootInner",

		// Miscellaneous classes
		"sFooterTH": ""
	};

	// Variable: oJUIClasses
	// Purpose: Defines CSS classes for DataTables when integrated with jQuery UI.
	// Scope: jQuery.fn.dataTableExt
	_oExt.oJUIClasses = {
		// Two-button pagination classes (jQuery UI styled)
		"sPagePrevEnabled": "fg-button ui-button ui-state-default ui-corner-left",
		"sPagePrevDisabled": "fg-button ui-button ui-state-default ui-corner-left ui-state-disabled",
		"sPageNextEnabled": "fg-button ui-button ui-state-default ui-corner-right",
		"sPageNextDisabled": "fg-button ui-button ui-state-default ui-corner-right ui-state-disabled",
		"sPageJUINext": "ui-icon ui-icon-circle-arrow-e",
		"sPageJUIPrev": "ui-icon ui-icon-circle-arrow-w",

		// Full numbers pagination button classes (jQuery UI styled)
		"sPageButton": "fg-button ui-button ui-state-default",
		"sPageButtonActive": "fg-button ui-button ui-state-default ui-state-disabled",
		"sPageButtonStaticDisabled": "fg-button ui-button ui-state-default ui-state-disabled",
		"sPageFirst": "first ui-corner-tl ui-corner-bl",
		"sPagePrevious": "previous",
		"sPageNext": "next",
		"sPageLast": "last ui-corner-tr ui-corner-br",

		// Row stripping classes
		"sStripOdd": "odd",
		"sStripEven": "even",

		// Class for empty table rows
		"sRowEmpty": "dataTables_empty",

		// Feature wrapper classes
		"sWrapper": "dataTables_wrapper",
		"sFilter": "dataTables_filter",
		"sInfo": "dataTables_info",
		"sPaging": "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi " +
			"ui-buttonset-multi paging_", /* Pagination type is postfixed */
		"sLength": "dataTables_length",
		"sProcessing": "dataTables_processing",

		// Sorting classes
		"sSortAsc": "ui-state-default",
		"sSortDesc": "ui-state-default",
		"sSortable": "ui-state-default",
		"sSortableAsc": "ui-state-default",
		"sSortableDesc": "ui-state-default",
		"sSortableNone": "ui-state-default",
		"sSortColumn": "sorting_", /* Sorting order integer is postfixed */
		"sSortJUIAsc": "css_right ui-icon ui-icon-triangle-1-n",
		"sSortJUIDesc": "css_right ui-icon ui-icon-triangle-1-s",
		"sSortJUI": "css_right ui-icon ui-icon-carat-2-n-s",
		"sSortJUIAscAllowed": "css_right ui-icon ui-icon-carat-1-n",
		"sSortJUIDescAllowed": "css_right ui-icon ui-icon-carat-1-s",
		"sSortJUIWrapper": "DataTables_sort_wrapper",
		"sSortIcon": "DataTables_sort_icon",

		// Scrolling classes
		"sScrollWrapper": "dataTables_scroll",
		"sScrollHead": "dataTables_scrollHead ui-state-default",
		"sScrollHeadInner": "dataTables_scrollHeadInner",
		"sScrollBody": "dataTables_scrollBody",
		"sScrollFoot": "dataTables_scrollFoot ui-state-default",
		"sScrollFootInner": "dataTables_scrollFootInner",

		// Miscellaneous classes
		"sFooterTH": "ui-state-default"
	};


	// Variable: oPagination
	// Purpose: Contains various pagination types supported by DataTables.
	// Scope: jQuery.fn.dataTableExt
	_oExt.oPagination = {
		/*
		 * Type: two_button
		 * Description: Standard pagination with 'Previous' and 'Next' buttons.
		 */
		"two_button": {
			/*
			 * Function: fnInit
			 * Purpose: Initializes DOM elements for two-button pagination.
			 * Parameters:
			 *   oSettings - DataTables settings object.
			 *   nPaging - The DIV element containing this pagination control.
			 *   fnCallbackDraw - Callback function to invoke on update.
			 */
			"fnInit": function ( oSettings, nPaging, fnCallbackDraw ) {
				var nPrevious, nNext, nPreviousInner, nNextInner;

				// Store next and previous elements in oSettings for easy access and testing.
				if ( !oSettings.bJUI ) {
					nPrevious = document.createElement( 'div' );
					nNext = document.createElement( 'div' );
				}
				else {
					nPrevious = document.createElement( 'a' );
					nNext = document.createElement( 'a' );

					nNextInner = document.createElement('span');
					nNextInner.className = oSettings.oClasses.sPageJUINext;
					nNext.appendChild( nNextInner );

					nPreviousInner = document.createElement('span');
					nPreviousInner.className = oSettings.oClasses.sPageJUIPrev;
					nPrevious.appendChild( nPreviousInner );
				}

				nPrevious.className = oSettings.oClasses.sPagePrevDisabled;
				nNext.className = oSettings.oClasses.sPageNextDisabled;

				nPrevious.title = oSettings.oLanguage.oPaginate.sPrevious;
				nNext.title = oSettings.oLanguage.oPaginate.sNext;

				nPaging.appendChild( nPrevious );
				nPaging.appendChild( nNext );

				$(nPrevious).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "previous" ) ) {
						// Only redraw if the page actually changed.
						fnCallbackDraw( oSettings );
					}
				} );

				$(nNext).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "next" ) ) {
						fnCallbackDraw( oSettings );
					}
				} );

				// Prevent text selection on these buttons.
				$(nPrevious).bind( 'selectstart.DT', function () { return false; } );
				$(nNext).bind( 'selectstart.DT', function () { return false; } );

				// Assign IDs to the first instance of these elements.
				if ( oSettings.sTableId !== '' && typeof oSettings.aanFeatures.p == "undefined" ) {
					nPaging.setAttribute( 'id', oSettings.sTableId+'_paginate' );
					nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
					nNext.setAttribute( 'id', oSettings.sTableId+'_next' );
				}
			},

			/*
			 * Function: fnUpdate
			 * Purpose: Updates the state of the two-button pagination control after a draw.
			 * Parameters:
			 *   oSettings - DataTables settings object.
			 *   fnCallbackDraw - Draw function to call on page change.
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw ) {
				if ( !oSettings.aanFeatures.p ) {
					return;
				}

				// Iterate over each instance of the pager control.
				var an = oSettings.aanFeatures.p;
				for ( var i=0, iLen=an.length ; i<iLen ; i++ ) {
					if ( an[i].childNodes.length !== 0 ) {
						an[i].childNodes[0].className =
							( oSettings._iDisplayStart === 0 ) ?
							oSettings.oClasses.sPagePrevDisabled : oSettings.oClasses.sPagePrevEnabled;

						an[i].childNodes[1].className =
							( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() ) ?
							oSettings.oClasses.sPageNextDisabled : oSettings.oClasses.sPageNextEnabled;
					}
				}
			}
		},


		/*
		 * Variable: iFullNumbersShowPages
		 * Purpose: Configures the maximum number of page links to display in full_numbers pagination.
		 * Scope: jQuery.fn.dataTableExt.oPagination
		 */
		"iFullNumbersShowPages": 5,


		/*
		 * Type: full_numbers
		 * Description: Pagination with 'First', 'Previous', page numbers, 'Next', and 'Last' buttons.
		 */
		"full_numbers": {
			/*
			 * Function: fnInit
			 * Purpose: Initializes DOM elements for full_numbers pagination.
			 * Parameters:
			 *   oSettings - DataTables settings object.
			 *   nPaging - The DIV element containing this pagination control.
			 *   fnCallbackDraw - Callback function to invoke on update.
			 */
			"fnInit": function ( oSettings, nPaging, fnCallbackDraw ) {
				var nFirst = document.createElement( 'span' );
				var nPrevious = document.createElement( 'span' );
				var nList = document.createElement( 'span' );
				var nNext = document.createElement( 'span' );
				var nLast = document.createElement( 'span' );

				nFirst.innerHTML = oSettings.oLanguage.oPaginate.sFirst;
				nPrevious.innerHTML = oSettings.oLanguage.oPaginate.sPrevious;
				nNext.innerHTML = oSettings.oLanguage.oPaginate.sNext;
				nLast.innerHTML = oSettings.oLanguage.oPaginate.sLast;

				var oClasses = oSettings.oClasses;
				nFirst.className = oClasses.sPageButton+" "+oClasses.sPageFirst;
				nPrevious.className = oClasses.sPageButton+" "+oClasses.sPagePrevious;
				nNext.className= oClasses.sPageButton+" "+oClasses.sPageNext;
				nLast.className = oClasses.sPageButton+" "+oClasses.sPageLast;

				nPaging.appendChild( nFirst );
				nPaging.appendChild( nPrevious );
				nPaging.appendChild( nList );
				nPaging.appendChild( nNext );
				nPaging.appendChild( nLast );

				$(nFirst).bind( 'click.DT', function () {
					if ( oSettings.oApi._fnPageChange( oSettings, "first" ) ) {
						fnCallbackDraw( oSettings );
					}
				} );

				$(nPrevious).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "previous" ) ) {
						fnCallbackDraw( oSettings );
					}
				} );

				$(nNext).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "next" ) ) {
						fnCallbackDraw( oSettings );
					}
				} );

				$(nLast).bind( 'click.DT', function() {
					if ( oSettings.oApi._fnPageChange( oSettings, "last" ) ) {
						fnCallbackDraw( oSettings );
					}
				} );

				// Prevent text selection on all pagination spans.
				$('span', nPaging)
					.bind( 'mousedown.DT', function () { return false; } )
					.bind( 'selectstart.DT', function () { return false; } );

				// Assign IDs to the first instance of these pagination elements.
				if ( oSettings.sTableId !== '' && typeof oSettings.aanFeatures.p == "undefined" ) {
					nPaging.setAttribute( 'id', oSettings.sTableId+'_paginate' );
					nFirst.setAttribute( 'id', oSettings.sTableId+'_first' );
					nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
					nNext.setAttribute( 'id', oSettings.sTableId+'_next' );
					nLast.setAttribute( 'id', oSettings.sTableId+'_last' );
				}
			},

			/*
			 * Function: fnUpdate
			 * Purpose: Updates the list of page buttons displayed in full_numbers pagination.
			 * Parameters:
			 *   oSettings - DataTables settings object.
			 *   fnCallbackDraw - Draw function to call on page change.
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw ) {
				if ( !oSettings.aanFeatures.p ) {
					return;
				}

				var iPageCount = _oExt.oPagination.iFullNumbersShowPages;
				var iPageCountHalf = Math.floor(iPageCount / 2);
				var iPages = Math.ceil((oSettings.fnRecordsDisplay()) / oSettings._iDisplayLength);
				var iCurrentPage = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength) + 1;
				var sList = "";
				var iStartButton, iEndButton, i, iLen;
				var oClasses = oSettings.oClasses;

				// Calculate the range of pages to display.
				if (iPages < iPageCount) {
					iStartButton = 1;
					iEndButton = iPages;
				}