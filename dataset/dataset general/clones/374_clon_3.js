const $dataHandler = jQuery; // Renamed jQuery alias for obfuscation

// Centralized configuration for grid elements and data sources
const UI_ELEMENT_IDS = {
    mainGrid: '#dataDisplayArea', // Renamed from #listdnd
    gridPager: '#gridControlPanel', // Renamed from #pagerdnd
    navPager: '#actionNavStrip' // Renamed from #pager1
};
const API_ENDPOINTS = {
    dataSource: '/api/v2/records/fetch?type=json', // Changed URL and implied datatype
    // No editurl needed for this revised read-only setup
};
const ASSET_PATHS = {
    iconSet: '/assets/img/grid_theme/' // Renamed gridimgpath and provided a literal
};

/**
 * Validates if a DOM element exists before attempting to initialize a plugin.
 * @param {string} selector - The CSS selector for the element.
 * @param {string} pluginName - The name of the plugin being initialized.
 * @returns {boolean} - True if element exists, false otherwise.
 */
function verifyElementPresence(selector, pluginName) {
    if (!$dataHandler(selector).length) {
        console.error(`Error: Required element "${selector}" for ${pluginName} not found. Operation aborted.`);
        return false;
    }
    return true;
}

// Encapsulate the entire grid setup within an Immediately Invoked Function Expression (IIFE)
(function initializeInteractiveDataGrid() {
    // Perform initial check for the main grid container
    if (!verifyElementPresence(UI_ELEMENT_IDS.mainGrid, 'jqGrid')) {
        return; // Exit if the container is missing
    }

    // --- Step 1: Configure and apply drag-and-drop functionality ---
    // The scrollAmount option is omitted as it often defaults to 0 or is not critical for basic setup.
    $dataHandler(UI_ELEMENT_IDS.mainGrid).tableDnD({});

    // --- Step 2: Define column structure and display headers ---
    const columnDefinitionsSchema = [
        { name: 'uniqueId', index: 'uniqueId', width: 65, resizable: false, sorttype: 'integer', key: true }, // Renamed 'id', added 'key' property
        { name: 'transactionDateTime', index: 'transactionDateTime', width: 110, align: 'center', formatter: 'date', formatoptions: { srcformat: 'Y-m-d H:i:s', newformat: 'm/d/Y H:i' } }, // Renamed 'invdate', added time formatting
        { name: 'customerIdentifier', index: 'customerIdentifier', width: 130, editable: false }, // Renamed 'name', added editable
        { name: 'monetaryValue', index: 'monetaryValue', width: 95, align: 'right', formatter: 'currency', formatoptions: { decimalSeparator: '.', thousandsSeparator: ',', decimalPlaces: 2, prefix: '$ ' } }, // Renamed 'amount', added formatter options
        { name: 'salesTaxAmount', index: 'salesTaxAmount', width: 95, align: 'right', hidden: true }, // Renamed 'tax', made hidden by default
        { name: 'totalCharge', index: 'totalCharge', width: 95, align: 'right', summaryType: 'sum', summaryTpl: '<b>{0}</b>' }, // Renamed 'total', added summary type
        { name: 'additionalComment', index: 'additionalComment', width: 180, sortable: true, edittype: 'textarea' } // Renamed 'note', explicitly made sortable and editable as textarea
    ];

    const gridColumnLabels = [
        'ID Code', 'Trans. Time', 'Client Ref.', 'Net Value', 'Sales Levy', 'Final Sum', 'Remarks Field'
    ]; // Changed column names and descriptions

    // --- Step 3: Assemble the main jqGrid configuration object ---
    const gridMasterConfig = {
        url: API_ENDPOINTS.dataSource, // Using centralized endpoint
        datatype: 'json', // Explicitly changed to JSON from XML
        colNames: gridColumnLabels, // Using defined labels
        colModel: columnDefinitionsSchema, // Using defined schema
        rowNum: 20, // Increased default rows per page
        rowList: [20, 40, 60], // Updated row list options
        imgpath: ASSET_PATHS.iconSet, // Using centralized asset path
        pager: $dataHandler(UI_ELEMENT_IDS.gridPager), // Using centralized pager ID
        sortname: 'transactionDateTime', // Changed default sort column
        sortorder: 'asc', // Changed default sort order
        caption: 'Detailed Financial Transactions (JSON Source)', // Reworded caption
        height: 'auto', // Added height setting for flexibility
        altRows: true, // Enabled alternating row styles
        altclass: 'grid-row-alternate', // Custom class for alternate rows
        grouping: true, // Added a new feature: grouping
        groupingView: { // Grouping options
            groupField: ['customerIdentifier'],
            groupColumnShow: [true],
            groupText: ['<b>Client: {0} - {1} Item(s)</b>'],
            groupOrder: ['asc'],
            groupSummary: [true],
            showSummaryOnHide: true,
            groupDataSorted: true
        },
        viewrecords: true, // Explicitly keep viewrecords
        loadOnce: false, // Ensure data is reloaded on page change/sort
        // Callback function executed after the grid data has been loaded and rendered
        loadComplete: function(responsePayload) { // Renamed from gridComplete, added parameter
            console.info('Data grid load operation finished. Total records received:', responsePayload.records || 'N/A');

            // Find the empty row placeholder and apply disable classes for drag-and-drop
            const emptyGridRow = $dataHandler('#_empty', this); // 'this' refers to the grid table DOM element
            if (emptyGridRow.length) {
                emptyGridRow.addClass('drag-disabled drop-restricted'); // Renamed class names
            } else {
                console.debug('No empty row element found, skipping drag-and-drop restriction.');
            }

            // Re-initialize drag-and-drop after grid content update
            $dataHandler(UI_ELEMENT_IDS.mainGrid).tableDnDUpdate();
        },
        onSelectRow: function(rowId, isSelected, event) { // Added a new callback for row selection
            if (isSelected) {
                console.log(`Row with ID '${rowId}' was selected.`);
                // Potentially trigger a detail panel update or other UI action here
            } else {
                console.log(`Row with ID '${rowId}' was deselected.`);
            }
        }
        // editurl: "someurl.php" is removed as this setup prioritizes data display over direct editing.
    };

    // Initialize the jqGrid with the prepared configuration
    $dataHandler(UI_ELEMENT_IDS.mainGrid).jqGrid(gridMasterConfig);

    // --- Step 4: Configure the navigation bar (navGrid) ---
    // Added search and refresh buttons, enabled add, kept edit/del disabled
    $dataHandler(UI_ELEMENT_IDS.mainGrid).jqGrid('navGrid', UI_ELEMENT_IDS.navPager, {
        edit: false,
        add: true, // Enabled 'add' functionality
        del: false,
        search: true, // Added search button
        refresh: true, // Added refresh button
        view: true, // Added view button
        addtext: 'New Entry', // Custom text for add button
        refreshtext: 'Reload Data' // Custom text for refresh button
    });

    // --- Step 5: Add a custom button to the navigation pager ---
    $dataHandler(UI_ELEMENT_IDS.mainGrid).jqGrid('navButtonAdd', UI_ELEMENT_IDS.navPager, {
        caption: 'Export CSV',
        buttonicon: 'ui-icon-extlink', // Changed icon
        onClickButton: function() {
            // Placeholder for export logic; could trigger an AJAX call or data manipulation
            alert('Initiating data export to CSV format...');
            // In a real application, this would involve sending grid data to a server for processing
            // or client-side generation of a CSV file.
        },
        position: 'last',
        title: 'Download current grid data as CSV',
        cursor: 'pointer'
    });

})(); // End of IIFE