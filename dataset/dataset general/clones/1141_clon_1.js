/*
 * This script initializes some jQuery functionality
 * and then proceeds to set up the i18next internationalization library.
 */
$ ( function ( ) {

    // Select all H1 elements within the document
    // and apply i18n processing to them for translation.
    $ ( "h1" ) . i18n ( ) ;

} ) ;


// --- i18next Library Configuration Block ---

// This is the primary configuration object for the i18next library.
// It defines various settings for how internationalization should behave.
i18n . init ( {

    /*
     * The 'resStore' property holds the preloaded translation resources.
     * These resources are typically loaded asynchronously before this
     * configuration block is executed, providing translations for various languages.
     */
    resStore : preloadedLocales ,

    // 'selectorAttr' specifies the HTML attribute i18next should look for
    // on elements to identify content that needs to be translated.
    selectorAttr : "i18n" ,

    // When 'debug' is set to true, i18next will output detailed logging
    // information to the console, which is very helpful during development.
    debug : true

} ) ;

// --- End of i18next Configuration ---