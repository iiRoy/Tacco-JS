// This script facilitates the extraction and processing of Zotero bibliographic data.

// Retrieve the primary Zotero application service object for core functionalities.
var zoteroCore = Components.classes[ "@zotero.org/Zotero;1" ]
    .getService(Components.interfaces.nsISupports)
    .wrappedJSObject;

// Initialize an empty array to accumulate the structured output records.
var outputRecords = [ ];

// Obtain the specific identifier for the target collection from the web request parameters.
var collectionIdentifier = webInterface.request.uniqueId;

// Fetch the desired data collection utilizing its unique identification string.
var dataCollection = zoteroCore.Collections.get( collectionIdentifier );

// Retrieve all subordinate items associated with the identified collection.
var retrievedEntries = dataCollection.getChildItems();

// Iterate through each individual retrieved entry to process its attributes.
for ( var idx = 0 ; idx < retrievedEntries.length ; idx++ )
{
    // Assign the current entry to a local variable for convenient access within the loop.
    let currentEntry = retrievedEntries[ idx ] ;

    // Access the quick-copy utility from the Zotero core object.
    const fastCopy = zoteroCore.QuickCopy;

    // Generate a formatted citation string for the current bibliographic entry.
    var citationText = fastCopy.getContentFromItems(
        [ currentEntry ],
        zoteroCore.Prefs.get( "export.quickCopy.setting" )
    );

    // Determine the category or type name of the item based on its internal type ID.
    var categoryKind = zoteroCore.ItemTypes.getName( currentEntry.itemTypeID ) ;

    // Extract and format the publication date of the record into a simplified year format.
    var recordDate = zoteroCore.Date.formatDate(
        zoteroCore.Date.strToDate( currentEntry.getField( 'date' ) ),
        'y'
    ) ;

    // Obtain the summary or abstract content associated with the current entry.
    var summaryText = currentEntry.getField( 'abstractNote' ) ;

    // Append an object containing all extracted details to the collection of output records.
    outputRecords.push( {
        'referenceString': citationText,
        'entryDate': recordDate,
        'summaryContent': summaryText,
        'contentType': categoryKind
    } ) ;
}

// Output the JavaScript source representation of the final aggregated records to the document.
document.writeln( outputRecords.toSource() ) ;