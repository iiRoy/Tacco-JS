/*
 * TUIO Connector Configuration Block
 * This block configures the TUIO.js library to use the npTuioClient plugin.
 * It defines how the plugin object is managed within the DOM.
 */
tuio.setConnector  (  {

  _failmsg : "Unable to initialize npTuioClient plugin.", //  Descriptive message shown if plugin fails to load or is not supported.

  _id : "__tuiojs_connector_npTuioClient", //  Unique ID for the HTML <object> element representing the plugin.


  start : function ( )
  {
    // Attempt to locate an existing plugin object in the document.
    var el = document.getElementById( this._id ) ;

    if (  el  ==  undefined  )
    {
      // If the plugin object does not exist, create it dynamically.
      var el = document.createElement( 'object' ) ;
      el.setAttribute( 'id' , this._id ) ;
      el.setAttribute( 'type' , 'application/x-tuio' ) ;
      el.appendChild( document.createTextNode( this._failmsg ) ) ; // Populate with failure message.
      document.body.appendChild( el ) ; // Insert the object into the document's body.
    }


    /*
     *  TODO: Future enhancement:
     *  Implement a mechanism to verify if the npTuioClient plugin successfully loaded.
     *  If the plugin is active and functional, it should be visually hidden
     *  (e.g., by setting its CSS 'display' property to 'none') to avoid user interference.
     */

  } , // End of the 'start' method.


  stop : function ( )
  {
    // Retrieve the plugin object using its assigned ID.
    var el = document.getElementById( this._id ) ;

    if (  el  !=  undefined  )
    {
      // If the plugin object exists, remove it from the document body.
      document.body.removeChild( el ) ;
    }
  } // End of the 'stop' method.

} ) ; // End of tuio.setConnector configuration.


// --- Global Callback Function for TUIO Events ---

/*
 * tuio_callback:
 * This function serves as the primary entry point for TUIO events originating
 * from the npTuioClient plugin. It receives raw TUIO data and passes it
 * directly to the tuio.callback handler for standardized processing within
 * the TUIO.js library.
 *
 * @param {number} type  - The event type (e.g., add, update, remove).
 * @param {number} sid   - Session ID of the TUIO object.
 * @param {number} fid   - Frame ID of the TUIO object.
 * @param {number} x     - X-coordinate.
 * @param {number} y     - Y-coordinate.
 * @param {number} angle - Rotation angle.
 */
function tuio_callback ( type , sid , fid , x , y , angle )
{
  // Forward all received TUIO parameters to the internal TUIO handler.
  tuio.callback ( type , sid , fid , x , y , angle ) ;
}