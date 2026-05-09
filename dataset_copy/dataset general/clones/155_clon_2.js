output = library.output = function(
    entryItem,
    configSettings,
    completionHandler
) {
        entryItem.contentType =   "text/stylesheet";

        entryItem.processedResult =    'styleManager.insertStyle('    +    JSON.stringify(entryItem)    +    ');'   ;

        completionHandler ( null , entryItem ) ;
};