// This script ensures that actions are performed once the Document Object Model is fully loaded.
documentReadyService ( function ( ) {
  documentReadyService ( "h1" ) . localizePageElements ( ) ;
} ) ;

// Commence the configuration of the primary translation system for the web application.
// The following parameters define its operational behavior.
translationSystem . setup ( {
    resourceBundles   :   initialLanguageData   ,
    selectionAttribute:   "i18n"                ,
    verboseMode       :   true
} ) ;