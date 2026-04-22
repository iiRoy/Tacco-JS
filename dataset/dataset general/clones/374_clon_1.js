/*
 * This file contains JavaScript code for initializing a jQuery UI component
 * and a jqGrid table. It demonstrates a common pattern for setting up
 * interactive data displays with drag-and-drop capabilities.
 */

// Initialize the tableDnD plugin for the element with ID 'listdnd'.
// This enables drag-and-drop reordering of rows within the table.
jQuery ( "#listdnd" ) . tableDnD ( { scrollAmount : 0 } ) ;


// Now, set up the main jqGrid table.
// This is a powerful and flexible grid component for displaying and manipulating tabular data.
jQuery ( "#listdnd" ) . jqGrid (
  {
    // The URL from which to fetch data for the grid.
    // 'q=1' might be a query parameter for a specific data request.
    url : 'server.php?q=1' ,

    // The format of the data expected from the server.
    // In this case, it's XML.
    datatype : "xml" ,

    // Defines the column headers displayed to the user.
    colNames : [ 'Inv No' , 'Date' , 'Client' , 'Amount' , 'Tax' , 'Total' , 'Notes' ] ,

    // Defines the properties of each column in the grid.
    colModel : [
      // Column for 'id'
      { name : 'id' , index : 'id' , width : 55 } ,
      // Column for 'invdate' (invoice date)
      { name : 'invdate' , index : 'invdate' , width : 90 } ,
      // Column for 'name' (client name)
      { name : 'name' , index : 'name' , width : 100 } ,
      // Column for 'amount', right-aligned
      { name : 'amount' , index : 'amount' , width : 80 , align : "right" } ,
      // Column for 'tax', also right-aligned
      { name : 'tax' , index : 'tax' , width : 80 , align : "right" } ,
      // Column for 'total', right-aligned
      { name : 'total' , index : 'total' , width : 80 , align : "right" } ,
      // Column for 'note', not sortable, wider
      { name : 'note' , index : 'note' , width : 150 , sortable : false }
    ] ,

    // Number of rows to display per page initially.
    rowNum : 10 ,

    // Array of options for the number of rows per page.
    rowList : [ 10 , 20 , 30 ] ,

    // Path to the images used by the grid (e.g., sort icons).
    imgpath : gridimgpath ,

    // Selector for the pager element associated with this grid.
    pager : jQuery ( '#pagerdnd' ) ,

    // Default column to sort by when the grid loads.
    sortname : 'id' ,

    // Whether to display the total number of records.
    viewrecords : true ,

    // Default sort order (ascending or descending).
    sortorder : "desc" ,

    // Caption displayed above the grid.
    caption : "XML Example" ,

    // Callback function executed after the grid is completely loaded and rendered.
    gridComplete : function ( ) {
      // Add 'nodrag' and 'nodrop' classes to the empty row element
      // to prevent it from being dragged or dropped.
      $ ( "#_empty" , "#listdnd" ) . addClass ( "nodrag nodrop" ) ;

      // Update the tableDnD plugin after grid completion
      // to ensure drag-and-drop functionality is correctly applied
      // to the newly loaded grid rows.
      jQuery ( "#listdnd" ) . tableDnDUpdate ( ) ;
    } ,

    // URL for handling row editing operations.
    editurl : "someurl.php"
  }
)
// Attach a navigation pager to the grid.
// This enables basic operations like adding, editing, and deleting rows,
// though in this configuration, 'edit', 'add', and 'del' are explicitly disabled.
. navGrid ( '#pager1' , { edit : false , add : false , del : false } ) ;

/* End of JavaScript code for grid initialization */