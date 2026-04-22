/*
 * This file defines the Meteor package for the Aloha Editor.
 * It specifies the package's metadata and its client-side dependencies.
 */
Package.describe( {

    summary   :   "Aloha Editor -- HTML5 contentEditable WYSIWYG editor"   //  A concise summary of the package's purpose

} ) ;



Package.on_use  (  function  (  api  )    {

  // Existing comment updated:
  // Note: There might be issues with automatic loading.
  // It's advisable to manually add all these files to the main HTML file
  // to ensure proper functionality and avoid unexpected behavior.

  /*
   * The 'api' object is used to add files to the client bundle.
   * All listed files will be sent to the browser when the package is used.
   */

  api.add_files(  'lib/require.js'  ,  'client'  ) ;    //  Essential for module loading
  api.add_files(  'lib/vendor/jquery-1.8.2.js'  ,  'client'  ) ;    //  jQuery library, a core dependency
  api.add_files(  'aloha-editor-config.js'  ,  'client'  ) ;    //  Specific configuration settings for Aloha
  api.add_files(  'lib/aloha.js'  ,  'client'  ) ;    //  The main Aloha Editor script itself
  api.add_files(  'css/aloha.css'  ,  'client'  ) ;    //  Styling for the Aloha Editor UI

}  )  ;