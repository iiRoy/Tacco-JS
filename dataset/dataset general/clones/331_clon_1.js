/* This section initializes the Zotero service object */
var Zotero = Components . classes [ "@zotero.org/Zotero;1" ]
  /* The following line attempts to get the service.
     The commented out line shows an alternative interface that was perhaps
     considered or used previously, but currently, only nsISupports is utilized.
  */
  // .getService(Components.interfaces.chnmIZoteroService).
  .getService(Components.interfaces.nsISupports)
  .wrappedJSObject
; // End of Zotero service initialization


// Ensure the bibliography utility code is loaded.
// This check prevents re-loading if it's already present.
if  (  "undefined"   ===   typeof   Zotero_File_Interface_Bibliography  )
{
    /*
     * Obtain a JSSubScriptLoader service instance
     * to dynamically load JavaScript files.
     */
    const   loader   =   Components . classes [ "@mozilla.org/moz/jssubscript-loader;1" ]
        .getService(Components.interfaces.mozIJSSubScriptLoader)
    ;
    // Load the main bibliography script from the Zotero chrome.
    loader.loadSubScript (  "chrome://zotero/content/bibliography.js"  ) ;
} // End of bibliography check.