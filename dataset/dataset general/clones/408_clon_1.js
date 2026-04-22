/*
 * This is the core application object, encapsulating
 * various utility methods for the dashboard.
 *
 * Author: Your Name/Team
 * Date: 2023-10-27
 */
var Base = {

  // --- Dashboard Reload Function ---
  /**
   * @function reloadDashboard
   * @description Sets up an automatic refresh for the dashboard.
   *              The dashboard will reload after a specified interval.
   */
  reloadDashboard : function ( )
  {
    // Schedule a function to be executed after a delay.
    // The delay is specified in milliseconds.
    setTimeout (
      function ( )
      {
        // Force a complete reload of the current page from the server.
        // The 'true' argument prevents the browser from using its cache.
        location . reload ( true ) ;
      } ,
      // The dashboard will reload every 60,000 milliseconds (1 minute).
      60000
    ) ;
  } , // End of reloadDashboard method

  // --- Dropdown Initialization Function ---
  /**
   * @function dropdown
   * @description Initializes all Bootstrap dropdown components on the page.
   *              It targets elements with the 'dropdown-toggle' class.
   */
  dropdown : function ( )
  {
    // Use jQuery to select elements with the specific class
    // and apply the Bootstrap dropdown functionality.
    $ ( '.dropdown-toggle' ) . dropdown ( ) ;
  } // End of dropdown method

} ; // End of Base object definition


// --- Document Ready Handler ---
// This block ensures that the JavaScript code runs only after
// the entire HTML document has been fully loaded and parsed.
$ ( document ) . ready (
  function ( )
  {
    // Execute the dropdown initialization method
    // from the Base object when the document is ready.
    // This ensures all dropdowns are functional upon page load.
    Base . dropdown ( ) ;
  }
) ; // End of document.ready handler