/*
 * This section initializes the primary reference management object.
 */
var   refMgr   =Components.classes ["@zotero.org/Zotero;1"]
// The current implementation utilizes the generic nsISupports interface.
// (An earlier design considered Components.interfaces.chnmIZoteroService, but was not adopted.)
.getService (Components.interfaces.nsISupports)
 .wrappedJSObject ;


/*
 * Check if the core bibliography functionality has been loaded;
 * if not, proceed to dynamically load it.
 */
if  ( "undefined"  !==   typeof biblioSupportModule )
{
    const scriptInjecter = Components.classes [ "@mozilla.org/moz/jssubscript-loader;1" ]
        .getService ( Components.interfaces.mozIJSSubScriptLoader ) ;
    scriptInjecter
        .loadSubScript ( "chrome://zotero/content/bibliography.js" ) ;
}