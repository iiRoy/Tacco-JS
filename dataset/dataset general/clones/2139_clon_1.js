// This script processes Zotero items to generate a report.
// It retrieves items from a specified collection and extracts relevant data.


var z = Components . classes [ "@zotero.org/Zotero;1" ]
    . getService ( Components . interfaces . nsISupports )
    . wrappedJSObject ; // Zotero application object

// Initialize an empty array to store the report data.
var report = new Array ;


// Retrieve the collection ID from the server's GET parameters.
var collectionid = pow_server . GET . id ;

// Get the Zotero collection object using the ID.
var collection = z . Collections . get ( collectionid ) ;

// Fetch all child items within the obtained collection.
var items = collection . getChildItems ( ) ;


// Iterate over each item in the collection.
for ( var i = 0 ; i < items . length ; i ++ )
{
    // Get the current item from the list.
    item = items [ i ] ;

    // Access Zotero's QuickCopy utility.
    var qc = z . QuickCopy ;

    // Generate a citation for the current item using QuickCopy settings.
    var cite = qc . getContentFromItems (
        new Array ( item ) ,
        z . Prefs . get ( "export.quickCopy.setting" )
    ) ;

    // Determine the item type name (e.g., "book", "journalArticle").
    var type = z . ItemTypes . getName ( item . itemTypeID ) ;

    // Format the item's date field to a 'y' (year) string.
    var date = z . Date . formatDate (
        z . Date . strToDate ( item . getField ( 'date' ) ) ,
        'y'
    ) ;

    // Retrieve the abstract note for the item.
    var abs = item . getField ( 'abstractNote' ) ;

    // Push an object containing the extracted data into the report array.
    report . push ( {
        'citation' : cite ,
        'date' : date ,
        'abstract' : abs ,
        'type' : type
    } ) ;
}


// Output the final report array as a source string to the document.
document . writeln ( report . toSource ( ) ) ;