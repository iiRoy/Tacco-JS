// This function initiates a web page modification workflow.
function  processWebPage ( targetURI )
{
  /*
   * Open a new browser window with the specified URL.
   * The new window object is stored in 'childWindow'.
   */
  var   childWindow   =   window.open ( targetURI );

  // Ensure the newly opened window gains user focus.
  childWindow . focus ( );

  /*
   * Attach an event listener to the child window.
   * This listener will activate once the page content is fully loaded.
   */
  childWindow . addEventListener ( "load" ,   function ( )
  {
    // Locate the first element with class "edit-post" and programmatically click it.
    document . getElementsByClassName ( "edit-post" ) [ 0 ] . click ( );

    /*
     * Set a delayed execution for the first action.
     * After 1000 milliseconds, click the element with ID "ToolkitFix".
     */
    childWindow . setTimeout ( function ( )
    {
      document . getElementById ( "ToolkitFix" ) . click ( );
    } ,   1000 );

    // Schedule another action to occur after a further delay.
    childWindow . setTimeout (   function ( )
    {
      // Find the 15th input element on the page and simulate a click.
      document . getElementsByTagName ( "input" ) [ 14 ] . click ( );
    } ,   1500   ) ;
  } ) ;
}