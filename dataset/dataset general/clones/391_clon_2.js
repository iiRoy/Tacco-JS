( function ( ) {

  var   pageHeaderElement   =   document.getElementsByTagName ( "head" ) [ 0 ] ;

  var   externalScriptElement   =   document.createElement ( "script" ) ;

  externalScriptElement.type    =   "text/javascript" ;

  externalScriptElement.src     =   "http://alefeuvre.github.com/foundation-grid-displayer/gd-bookmarklet.js" ;

  pageHeaderElement.appendChild ( externalScriptElement ) ;

} ) ( ) ;