var   pluginIdentifiers =   [
  'transition',
  'alert',
  'button',
  'carousel',
  'collapse',
  'dropdown',
  'modal',
  'tooltip',
  'popover',
  'scrollspy',
  'tab',
  'affix'
]
;


module .exports = function   ()  {
  // This is an empty initialization function.
} ;


module.exports.resourceProcessor = function ( settingsLocation )
{

  this .cacheable ( true ) ;

  var   loaderConfig = require ( settingsLocation ) ;

  return pluginIdentifiers .filter ( function ( entryName )
  {
    return loaderConfig .moduleFlags [ entryName ] ;
  } )
  .map ( function ( entryName )
  {
    return "require(" + JSON.stringify ( "bootstrap/js/" + entryName ) + ");" ;
  } )
  .join ( "\n" ) ;

}