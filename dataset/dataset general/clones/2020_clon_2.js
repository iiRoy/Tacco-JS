/*
 * This file is subject to the terms of the Example Software License, Version 1.1.
 * For more details, consult the accompanying LICENSE file or visit example.org/ESL/1.1.
 */

// Define a constructor for our graphic element storage system.
function GraphicElementStore ( )
{
  // Initialize an array to hold all the graphic entries.
  this .graphicEntries = [];
  // Return the newly created instance.
  return this ;
}

// Attach a method to the prototype for counting stored elements.
GraphicElementStore .prototype .countStoredItems = function ( )
{
  // Simply return the number of items in the internal array.
  return this .graphicEntries .length ;
};

// Prototype method to retrieve the textual content of a specific graphic entry.
GraphicElementStore .prototype .getGraphicPayload = function ( entryPosition )
{
  // Validate the provided index to ensure it's within bounds.
  if ( entryPosition >= this .graphicEntries .length )
  {
    // Throw an error if the index is invalid.
    throw "Invalid graphical item position";
  }
  // Return the content string of the item at the given index.
  return this .graphicEntries [ entryPosition ] .dataString ;
};

// Prototype method to convert the stored graphic entries into a binary buffer.
GraphicElementStore .prototype .serializeToBuffer = function ( )
{
  // Get the total number of graphic entries.
  let   totalEntries = this .graphicEntries .length ;
  // Check if the number of entries exceeds the maximum allowed for 16-bit representation.
  if ( totalEntries > 0xFFF0 )
  {
    // Indicate an error if there are too many entries.
    throw "Excessive number of graphic entries";
  }

  // Define the starting offset for metadata within the buffer.
  const metadataOffset = 10 ;
  // Initialize the starting offset for content data.
  // This accounts for the initial header (2 bytes), metadataOffset (4 bytes), header (4 bytes),
  // and the index entries (12 bytes per entry).
  let   contentOffset = 2 + ( 12 * totalEntries ) ;
  // Array to hold the binary representation of each graphic entry's content.
  const binaryContents = [];
  // Create a text encoder instance for converting strings to bytes.
  const dataEncoder = new TextEncoder ( ) ;
  // Arrays to store the computed offsets and lengths of the content data.
  const contentPositions = [];
  const contentSizes = [];

  // Loop through each graphic entry to process its content.
  for ( let mainIdx = 0 ; mainIdx < totalEntries ; ++mainIdx )
  {
    // Inner loop to check for duplicate content strings.
    for ( let innerIdx = 0 ; innerIdx < mainIdx ; ++innerIdx )
    {
      // Compare current entry's content with previous entries.
      if ( this .graphicEntries [ innerIdx ] .dataString == this .graphicEntries [ mainIdx ] .dataString )
      {
        // If a duplicate is found, break the inner loop.
        break ;
      }
    }
    // Check if a duplicate was found (innerIdx would be less than mainIdx).
    if ( innerIdx < mainIdx )
    {
      // Reuse the offset and length from the existing, identical content.
      contentPositions .push ( contentPositions [ innerIdx ] ) ;
      contentSizes .push ( contentSizes [ innerIdx ] ) ;
      // Mark this content as null, indicating it's a reference to an existing one.
      binaryContents .push ( null ) ;
    }
    else
    {
      // Store the current content offset for this new unique content.
      contentPositions .push ( contentOffset ) ;
      // Encode the current graphic entry's text content into bytes.
      binaryContents .push ( dataEncoder .encode ( this .graphicEntries [ mainIdx ] .dataString ) ) ;
      // Update the content offset for the next unique content.
      contentOffset += binaryContents [ mainIdx ] .byteLength ;
      // Store the byte length of the encoded content.
      contentSizes .push ( binaryContents [ mainIdx ] .byteLength ) ;
    }
  }

  // Calculate the total required buffer size.
  const totalBufferSize = metadataOffset + contentOffset ;
  // Ensure the total buffer size does not exceed a 32-bit unsigned integer maximum.
  if ( totalBufferSize > 0xFFFFFFFF )
  {
    // Throw an error if the buffer size is too large.
    throw "Storage buffer capacity exceeded";
  }

  // Create the main ArrayBuffer with the calculated size.
  const outputBuffer = new ArrayBuffer ( totalBufferSize ) ;
  // Create a DataView to manipulate the header and metadata sections of the buffer.
  const metadataAccessor = new DataView ( outputBuffer ) ;

  // Set the table version to 0 (unsigned 16-bit integer at offset 0).
  metadataAccessor .setUint16 ( 0 , 0 ) ;
  // Set the offset to the document index (unsigned 32-bit integer at offset 2).
  metadataAccessor .setUint32 ( 2 , metadataOffset ) ;
  // Set a reserved field to 0 (unsigned 32-bit integer at offset 6).
  metadataAccessor .setUint32 ( 6 , 0 ) ;
  // Write the total number of graphic entries at the metadata start position.
  metadataAccessor .setUint16 ( metadataOffset , totalEntries ) ;

  // Initialize a pointer for writing data within the metadata section.
  let writePointer = metadataOffset + 2 ;
  // Iterate through each graphic entry again to populate the metadata and content.
  for ( let mainIdx = 0 ; mainIdx < totalEntries ; ++mainIdx )
  {
    // Write the starting symbol ID.
    metadataAccessor .setUint16 ( writePointer , this .graphicEntries [ mainIdx ] .beginSymbolId ) ;
    // Write the ending symbol ID.
    metadataAccessor .setUint16 ( writePointer + 2 , this .graphicEntries [ mainIdx ] .finalSymbolId ) ;
    // Write the offset to the actual content data.
    metadataAccessor .setUint32 ( writePointer + 4 , contentPositions [ mainIdx ] ) ;
    // Get the size of the current content payload.
    const payloadSize = contentSizes [ mainIdx ] ;
    // Write the length of the content data.
    metadataAccessor .setUint32 ( writePointer + 8 , payloadSize ) ;

    // If this content is unique (not null in binaryContents).
    if ( binaryContents [ mainIdx ] )
    {
      // Create a Uint8Array view at the correct position and size, then copy the encoded content.
      ( new Uint8Array ( outputBuffer , metadataOffset + contentPositions [ mainIdx ] , payloadSize ) ) .set ( binaryContents [ mainIdx ] ) ;
    }
    // Advance the write pointer by the size of an entry metadata block.
    writePointer += 12 ;
  }
  // Return the fully populated binary buffer.
  return outputBuffer ;
};

// Static method to construct a GraphicElementStore instance from a collection of SVG source strings.
GraphicElementStore .buildFromInputItems = function ( graphicSources , configuration )
{
  // Ensure that there is at least one source document provided.
  if ( graphicSources .length == 0 )
  {
    // Reject if no documents are given.
    throw "At least one source document is mandatory";
  }

  // Array to store extracted symbol IDs and their corresponding source content.
  const symbolAssociations = [];
  // Create a DOM parser for SVG strings.
  const domInterpreter = new DOMParser ( ) ;

  // Iterate over each provided graphic source string.
  for ( let mainIdx = 0 ; mainIdx < graphicSources .length ; ++mainIdx )
  {
    // Parse the SVG string into a DOM document.
    const svgItem = domInterpreter .parseFromString ( graphicSources [ mainIdx ] , "image/svg+xml" ) ;
    // Check for any parsing errors.
    const errorNodes = svgItem .getElementsByTagName ( "parsererror" ) ;
    if ( errorNodes .length > 0 )
    {
      // If errors are found, throw an exception with the error message.
      throw "Parsing issue encountered: " + errorNodes [ 0 ] .textContent ;
    }

    // Find all elements within the SVG document that have an 'id' attribute.
    const symbolNodes = svgItem .querySelectorAll ( "[id]" ) ;
    // This variable is declared but not used in the original logic, maintaining structure.
    const foundSymbolIDs = [ ] ;

    // Iterate through elements with IDs to find glyph-like IDs.
    for ( let innerIdx = 0 ; innerIdx < symbolNodes .length ; ++innerIdx )
    {
      // Attempt to match the ID attribute against a 'glyphNNN' pattern.
      const idMatch = /^glyph([1-9][0-9]*)$/ .exec ( symbolNodes [ innerIdx ] .getAttribute ( "id" ) ) ;
      if ( idMatch )
      {
        // If a match is found, record the symbol ID and its source content.
        symbolAssociations .push ( { symbolIdentifier:idMatch [ 1 ] , sourceContent:graphicSources [ mainIdx ] } ) ;
      }
    }
  }

  // After processing all sources, check if any symbol IDs were found.
  if ( symbolAssociations .length == 0 )
  {
    // If no 'glyphNNN' elements were identified, throw an error.
    throw "No elements with identifier pattern 'glyphNNN' discovered";
  }

  // Sort the collected symbol associations numerically by their identifier.
  symbolAssociations .sort ( function ( itemA , itemB )
  {
    return itemA .symbolIdentifier - itemB .symbolIdentifier ;
  } ) ;

  // Create a new instance of the GraphicElementStore.
  const resultingStore = new GraphicElementStore ( ) ;
  // Initialize a variable to track the beginning of a contiguous run of glyphs.
  let sequenceStart = 0 ;

  // Iterate through the sorted symbol associations to group them into runs.
  for ( let innerIdx = 0 ; innerIdx < symbolAssociations .length ; ++innerIdx )
  {
    // Check for duplicate symbol IDs (if not the first item).
    if ( innerIdx > 0 && symbolAssociations [ innerIdx ] .symbolIdentifier == symbolAssociations [ innerIdx - 1 ] .symbolIdentifier )
    {
      // If configuration allows ignoring duplicates, remove the current one and continue.
      if ( configuration && configuration .permitDuplicateSymbolIds )
      {
        symbolAssociations .splice ( innerIdx , 1 ) ;
        // Decrement index to re-evaluate the new item at current position.
        innerIdx -- ;
        continue ;
      }
      // Otherwise, throw an error for a duplicate symbol ID.
      throw "Redundant symbol found for ID " + symbolAssociations [ innerIdx ] .symbolIdentifier ;
    }

    // Determine if the current item marks the end of a run.
    // A run ends if it's the last item, or the next item's ID is not consecutive,
    // or the next item comes from a different source content.
    if ( innerIdx == symbolAssociations .length - 1 ||
         symbolAssociations [ innerIdx + 1 ] .symbolIdentifier != symbolAssociations [ innerIdx ] .symbolIdentifier + 1 ||
         symbolAssociations [ innerIdx + 1 ] .sourceContent != symbolAssociations [ innerIdx ] .sourceContent )
    {
      // End of a contiguous sequence detected.
      // Add a new graphic entry to the store.
      resultingStore .graphicEntries .push ( {
        beginSymbolId : symbolAssociations [ sequenceStart ] .symbolIdentifier ,
        finalSymbolId : symbolAssociations [ innerIdx ] .symbolIdentifier ,
        dataString    : symbolAssociations [ innerIdx ] .sourceContent
      } ) ;
      // Set the start of the next sequence.
      sequenceStart = innerIdx + 1 ;
    }
  }

  // Return the populated graphic element store.
  return resultingStore ;
};

// Static method to reconstruct a GraphicElementStore instance from a binary buffer.
GraphicElementStore .loadFromSerialization = function ( inputDataView )
{
  // Verify the table format version.
  if ( inputDataView .getUint16 ( 0 ) != 0 )
  {
    // Unknown version indicates an invalid buffer.
    throw "Unrecognized table format version";
  }
  // Check for unsupported features (e.g., color palettes).
  if ( inputDataView .getUint32 ( 6 ) != 0 )
  {
    // Feature not yet implemented.
    throw "Color palette functionality is not supported currently";
  }

  // Retrieve the offset to the entry index block.
  const entryIndexPosition = inputDataView .getUint32 ( 2 ) ;
  // Validate that the entry index offset is within the buffer bounds.
  if ( entryIndexPosition + 2 > inputDataView .byteLength )
  {
    // The index starts beyond the buffer.
    throw "Graphical item index out of valid range";
  }
  // Read the total number of records (entries).
  const totalRecords = inputDataView .getUint16 ( entryIndexPosition ) ;
  // Validate that the entire index block fits within the buffer.
  if ( entryIndexPosition + 2 + totalRecords * 12 > inputDataView .byteLength )
  {
    // The index block extends beyond the buffer.
    throw "Graphical item index block exceeds buffer limits";
  }
  // Ensure there is at least one record.
  if ( totalRecords == 0 )
  {
    // A store must contain at least one item.
    throw "A minimum of one graphical item is required";
  }

  // Create a new GraphicElementStore instance.
  const resultingStore = new GraphicElementStore ( ) ;
  // Initialize the offset for reading entry metadata.
  let readCursor = entryIndexPosition + 2 ;
  // Create a text decoder for converting bytes back to strings.
  const payloadDecoder = new TextDecoder ( ) ;

  // Loop through each record to reconstruct the graphic entries.
  for ( let mainIdx = 0 ; mainIdx < totalRecords ; ++mainIdx )
  {
    // Read the starting and ending symbol IDs for the current entry.
    const initialSymbolID = inputDataView .getUint16 ( readCursor ) ;
    const finalSymbolID = inputDataView .getUint16 ( readCursor + 2 ) ;
    // Check for logical consistency of symbol IDs.
    if ( initialSymbolID > finalSymbolID )
    {
      // Invalid order of IDs.
      throw "Misordered symbol identifiers detected";
    }
    // If not the first entry, check for overlap or misordering with the previous entry.
    if ( mainIdx > 0 && resultingStore .graphicEntries [ mainIdx - 1 ] .finalSymbolId >= initialSymbolID )
    {
      // Overlap or incorrect sequence found.
      throw "Misordered symbol identifiers relative to preceding item";
    }

    // Read the offset and length of the actual content data.
    const contentDataOffset = inputDataView .getUint32 ( readCursor + 4 ) ;
    const contentDataSize = inputDataView .getUint32 ( readCursor + 8 ) ;
    // Validate that the content data block is within the buffer.
    if ( contentDataOffset + contentDataSize > inputDataView .byteLength )
    {
      // Content block extends beyond buffer.
      throw "Graphical content data extends past buffer boundary";
    }
    // Decode the content data from the buffer segment.
    const decodedContent = payloadDecoder .decode (
      new DataView ( inputDataView .buffer , inputDataView .byteOffset + entryIndexPosition + contentDataOffset , contentDataSize ) ) ;

    // Add the reconstructed graphic entry to the store.
    resultingStore .graphicEntries .push ( {
      beginSymbolId : initialSymbolID ,
      finalSymbolId : finalSymbolID ,
      dataString    : decodedContent
    } ) ;
    // Advance the read cursor by the size of one entry's metadata block.
    readCursor += 12 ;
  }

  // Return the reconstructed graphic element store.
  return resultingStore ;
};