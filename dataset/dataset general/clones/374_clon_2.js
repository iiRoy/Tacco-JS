/*
 * Initialize the sortable table functionality for the main data display container.
 * This ensures that rows within the specified table can be reordered by the user.
 */
jQuery( "#dataGridContainer" ).sortableRowsPlugin( {
  scrollThreshold: 0 /* Disables automatic scrolling when dragging near edges */
} );

// Configure and render the primary data display grid component.
jQuery( "#dataGridContainer" )
  .flexiDataGrid( {
    // URL endpoint for fetching grid data.
    sourceUrl: 'api/dataSource.php?queryType=detailed',
    // Specifies the format of the data received from the server.
    dataFormat: "xml",
    // An array defining the visible column headers for the grid.
    columnHeaders: [
      'Invoice ID',
      'Order Date',
      'Customer',
      'Net Amount',
      'Sales Tax',
      'Final Total',
      'Comments'
    ],
    // Detailed configuration for each column in the grid.
    columnStructure: [
      {
        name: 'recordId',
        index: 'recordId',
        width: 55
      },
      {
        name: 'invoiceDate',
        index: 'invoiceDate',
        width: 90
      },
      {
        name: 'customerName',
        index: 'customerName',
        width: 100
      },
      {
        name: 'netValue',
        index: 'netValue',
        width: 80,
        textAlignment: "end"
      },
      {
        name: 'taxValue',
        index: 'taxValue',
        width: 80,
        textAlignment: "end"
      },
      {
        name: 'grossValue',
        index: 'grossValue',
        width: 80,
        textAlignment: "end"
      },
      {
        name: 'memoField',
        index: 'memoField',
        width: 150,
        sortable: false
      }
    ],
    // Number of data items to display per page.
    itemsPerPage: 15,
    // Available options for the number of items per page.
    pageOptions: [ 15, 30, 45 ],
    // Path to image assets used by the grid.
    imageAssetPath: assetPathForGridIcons,
    // Selector for the pagination control element.
    paginationDiv: jQuery( '#dataPaginationControl' ),
    // The default column to sort by.
    defaultSortColumn: 'recordId',
    // Flag to indicate whether to show the total number of records.
    displayRecordCount: true,
    // Initial sorting order for the grid.
    initialSortOrder: "descending",
    // The title displayed at the top of the data grid.
    tableCaption: "Sample Data from XML Source",
    /*
     * A callback function executed after the grid has completed its rendering process.
     * This is useful for post-render manipulations.
     */
    onGridRendered: function() {
      // Apply specific CSS classes to the empty row and the grid container
      // to prevent them from being draggable or droppable.
      $( "#_noDataRow", "#dataGridContainer" ).applyStyleClasses( "noDrag noDrop" );
      // Refresh the state of the sortable rows plugin to account for any DOM changes.
      jQuery( "#dataGridContainer" ).refreshSortableRows( );
    },
    // The URL endpoint for handling data editing operations.
    dataEditUrl: "data/updateRecord.php"
  } )
  // Attach the navigation panel to the grid for common operations.
  .gridNavigation( '#navigationPanel', {
    canEdit: false, // Disables the edit button in the navigation panel.
    canAdd: false,  // Disables the add new record button.
    canDelete: false // Disables the delete record button.
  } );