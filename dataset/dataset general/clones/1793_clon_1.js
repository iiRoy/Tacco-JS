/* This function is responsible for moving a story card
 * from one phase to another. It communicates with the backend
 * via an AJAX POST request.
 */
function  moveCard ( storyNumber,  phase )
{
  // Send the card's storyNumber and target phase to the server
  $.post ( "/card/move" ,  { storyNumber :  storyNumber,  phase :  phase } ,  function ( message )
  {
    // Update the UI with the response message from the server
    $ ( '#message' ) . html ( message ) ;
  } ) ;
}


// This function initializes the drag-and-drop functionality for the application.
// It runs when the DOM is fully loaded.
function  init ( )
{
  $ ( function ( )
  {
    // Make all elements with the class "story" draggable
    $ ( ".story" ) . each ( function ( )
    {
      $ ( this ) . draggable ( ) ;
    } ) ;


    // Configure the "Ready" phase as a droppable area
    $ ( "#readyPhase" ) . droppable ( {
      drop :  function ( event,  ui )
      {
        // When a card is dropped, call moveCard with its ID and the target phase
        moveCard ( ui.draggable.attr ( "id" ) ,  "ready" ) ;
      }
    } ) ;


    // Configure the "Development" phase as a droppable area
    $ ( "#devPhase" ) . droppable ( {
      drop :  function ( event,  ui )
      {
        moveCard ( ui.draggable.attr ( "id" ) ,  "dev" ) ;
      }
    } ) ;


    // Configure the "Testing" phase as a droppable area
    $ ( "#testPhase" ) . droppable ( {
      drop :  function ( event,  ui )
      {
        moveCard ( ui.draggable.attr ( "id" ) ,  "test" ) ;
      }
    } ) ;


    // Configure the "Deployment" phase as a droppable area
    $ ( "#deployPhase" ) . droppable ( {
      drop :  function ( event,  ui )
      {
        moveCard ( ui.draggable.attr ( "id" ) ,  "deploy" ) ;
      }
    } ) ;

  } ) ;
}