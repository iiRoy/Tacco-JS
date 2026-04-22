// This module contains functionalities for managing the progression of items
// through various workflow stages within the application.
function relocateTask (  itemIdentifier,  destinationStage  ) {
  // Sends an asynchronous HTTP POST request to the backend service.
  // The request updates the current position of a specific item.
  jQuery.post(
    "/item/transition",
    {
      itemID: itemIdentifier,
      targetStage: destinationStage
    },
    function ( operationFeedback ) { // Callback executed upon server response.
      // Updates a designated display area with the server's message.
      jQuery( '#statusDisplay' ).html( operationFeedback );
    }
  );
}


/*
 *  This primary function is responsible for initializing the interactive
 *  user interface components. It configures draggable elements and sets up
 *  dedicated drop zones corresponding to different workflow phases.
 */
function setupInterface ( ) {
  // Ensures all DOM content is fully loaded and parsed before script execution.
  jQuery( function ( ) {
    // Iterates through all elements designated as 'agileItem' to make them draggable.
    jQuery( ".agileItem" ).each( function ( ) {
      jQuery( this ).draggable( );
    } );

    // Configuration of distinct droppable zones for each stage of the workflow.

    // Sets up the 'Preparation Stage' as a valid drop target.
    jQuery( "#preparationStage" ).droppable( {
      drop: function ( dragevent, dragdata ) {
        // On a successful drop, invokes the item relocation procedure.
        relocateTask( dragdata.draggable.attr( "id" ), "prepared" );
      }
    } );

    // Defines the 'Development Stage' as a droppable area.
    jQuery( "#developmentStage" ).droppable( {
      drop: function ( dragevent, dragdata ) {
        relocateTask( dragdata.draggable.attr( "id" ), "inDevelopment" );
      }
    } );

    // Configures the 'Quality Assurance Stage' to accept dropped items.
    jQuery( "#qualityAssuranceStage" ).droppable( {
      drop: function ( dragevent, dragdata ) {
        relocateTask( dragdata.draggable.attr( "id" ), "underTest" );
      }
    } );

    // Establishes the 'Production Release Stage' as the final droppable zone.
    jQuery( "#productionReleaseStage" ).droppable( {
      drop: function ( dragevent, dragdata ) {
        relocateTask( dragdata.draggable.attr( "id" ), "released" );
      }
    } );
  } );
}