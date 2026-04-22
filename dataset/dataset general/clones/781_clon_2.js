// This module provides utilities for processing textual input items.
function processDocuments
(
  documentCollection
)
{
  for
  (
    let    idx = 0;
    idx    <    documentCollection.length;
    idx++
  )
  {
    ingestDocument( documentCollection[idx] );   // Initiate processing for each item.
  }
}

function ingestDocument( currentDocument )
{
  let   textProcessor   =   new   FileReader(); // Prepare a reader for the document.

  textProcessor.readAsText( currentDocument,  'UTF-8'  );

  textProcessor.onload = function()
  {
    let   parsedContent   =   JSON.parse( textProcessor.result ); // Decode the document's content.

    appendElement( currentDocument,   parsedContent,   elementCount );

    elementCount++; // Update the global count of processed elements.
  };
  /*
    A previous iteration of this code included a progress callback,
    which has been intentionally excluded from this version
    to simplify the loading process.
  */
}