/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This file defines the SvgTable class for handling SVG document collections.
 */

function SvgTable ( )
{
	// Initialize an empty array to hold the SVG documents.
	this.documents = [ ] ;

	// The constructor returns the instance itself.
	return this ;
}


// Define a method on the SvgTable prototype to get the number of stored documents.
SvgTable.prototype.getDocumentCount = function ( )
{
	// Returns the current count of documents.
	return this.documents.length ;
};


// Define a method to retrieve the text content of a specific document by its index.
SvgTable.prototype.getDocumentText = function ( index )
{
	// Validate the provided index to ensure it's within bounds.
	if ( index >= this.documents.length )
	{
		// If the index is out of range, throw an error.
		throw "Invalid document index" ;
	}

	// Return the text property of the document at the given index.
	return this.documents[ index ].text ;
};


// This method serializes the SVG documents into an ArrayBuffer format.
SvgTable.prototype.toArrayBuffer = function ( )
{
	// Get the total number of documents currently stored.
	var numDocuments = this.documents.length ;

	// Check for an excessive number of documents, which could lead to overflow.
	if ( numDocuments > 0xFFFF )
	{
		throw "Too many documents" ; // Maximum 65535 documents allowed.
	}


	// Define the offset for the document index table within the buffer.
	var docIndexOffset = 10 ; // Initial header size.

	// Calculate the starting offset for document data.
	// 2 bytes for numDocuments + 12 bytes per document entry.
	var docOffset = 2 + 12 * numDocuments ;

	// Arrays to hold encoded text data, document offsets, and lengths.
	var encodedTexts = [ ] ;
	var encoder = new TextEncoder ( ) ; // A TextEncoder instance for UTF-8 encoding.
	var docOffsets = [ ] ;
	var docLengths = [ ] ;


	// Loop through each document to prepare its data for the buffer.
	for ( var i = 0 ; i < numDocuments ; ++i )
	{
		// Inner loop to check for duplicate document texts to optimize storage.
		for ( var j = 0 ; j < i ; ++j )
		{
			// If a duplicate text is found, we can reuse its stored representation.
			if ( this.documents[ j ].text == this.documents[ i ].text )
			{
				break ; // Found a match, exit inner loop.
			}
		}

		// If a duplicate was found (j < i).
		if ( j < i )
		{
			// Reuse the offset and length from the previously encoded identical document.
			docOffsets.push ( docOffsets[ j ] ) ;
			docLengths.push ( docLengths[ j ] ) ;
			encodedTexts.push ( null ) ; // Mark as null, no new encoding needed.
		}
		else
		{
			// This is a unique document text, so encode it.
			docOffsets.push ( docOffset ) ; // Store its starting offset.
			encodedTexts.push ( encoder.encode ( this.documents[ i ].text ) ) ; // Encode to Uint8Array.
			docOffset += encodedTexts[ i ].byteLength ; // Advance the global document offset.
			docLengths.push ( encodedTexts[ i ].byteLength ) ; // Store its byte length.
		}
	}


	// Note: There's a potential bug here, 'length' is not defined in this scope.
	// It should probably be 'docOffset' or 'buf.byteLength' if checking total buffer size.
	// Keeping it as 'length' to match Type I clone definition.
	if ( length > 0xFFFFFFFF )
	{
		throw "Table size overflow" ; // Check if the total size exceeds 4GB.
	}


	// Create the main ArrayBuffer with calculated size.
	var buf = new ArrayBuffer ( docIndexOffset + docOffset ) ;
	var headerView = new DataView ( buf ) ; // Create a DataView to write header data.

	// Write header fields:
	headerView.setUint16 ( 0, 0 ) ; // Version (0 for now).
	headerView.setUint32 ( 2, docIndexOffset ) ; // Offset to the document index.
	headerView.setUint32 ( 6, 0 ) ; // Reserved field (0 for no color palettes).
	headerView.setUint16 ( docIndexOffset, numDocuments ) ; // Number of documents in the index.


	// Initialize offset for writing document index entries.
	var offset = docIndexOffset + 2 ;

	// Loop through each document again to write its metadata and actual text into the buffer.
	for ( var i = 0 ; i < numDocuments ; ++i )
	{
		// Write start and end glyph IDs for the current document.
		headerView.setUint16 ( offset, this.documents[ i ].startGlyphId ) ;
		headerView.setUint16 ( offset + 2, this.documents[ i ].endGlyphId ) ;

		// Write the document's data offset and length within the buffer.
		headerView.setUint32 ( offset + 4, docOffsets[ i ] ) ;
		var textLength = docLengths[ i ] ;
		headerView.setUint32 ( offset + 8, textLength ) ;

		// If the document text was uniquely encoded (not a duplicate).
		if ( encodedTexts[ i ] )
		{
			// Write the encoded text data into the buffer at its calculated position.
			( new Uint8Array ( buf, docIndexOffset + docOffsets[ i ], textLength ) ).set ( encodedTexts[ i ] ) ;
		}

		// Move to the next document index entry.
		offset += 12 ; // Each entry is 12 bytes long.
	}

	// Return the final ArrayBuffer containing all serialized documents.
	return buf ;
};


// Static method to create an SvgTable instance from an array of raw SVG document strings.
SvgTable.fromDocuments = function ( documents, options )
{
	// Ensure there's at least one document to process.
	if ( documents.length == 0 )
	{
		throw "Must have at least one document" ;
	}


	// Array to store extracted glyph mapping information.
	var glyphMapping = [ ] ;
	var parser = new DOMParser ( ) ; // DOM parser for SVG strings.

	// Iterate over each provided SVG document string.
	for ( var i = 0 ; i < documents.length ; ++i )
	{
		// Parse the SVG string into a DOM document.
		var doc = parser.parseFromString ( documents[ i ], "image/svg+xml" ) ;

		// Check for any parsing errors.
		var parseErrs = doc.getElementsByTagName ( "parsererror" ) ;
		if ( parseErrs.length > 0 )
		{
			throw "Parse error: " + parseErrs[ 0 ].textContent ;
		}

		// Find all elements with an 'id' attribute within the SVG document.
		var elementsWithGlyphIds = doc.querySelectorAll ( "[id]" ) ;
		var glyphIds = [ ] ; // This variable seems unused in the original code, but kept for Type I.

		// Iterate through identified elements to find glyph IDs.
		for ( var j = 0 ; j < elementsWithGlyphIds.length ; ++j )
		{
			// Use a regular expression to match IDs like "glyphNNN".
			var m = /^glyph([1-9][0-9]*)$/.exec ( elementsWithGlyphIds[ j ].getAttribute ( "id" ) ) ;
			if ( m )
			{
				// If a glyph ID is found, store its ID and the original document text.
				glyphMapping.push ( { id:m[ 1 ], doc:documents[ i ] } ) ;
			}
		}
	}


	// After processing all documents, ensure some glyphs were found.
	if ( glyphMapping.length == 0 )
	{
		throw "No elements with id 'glyphNNN' found" ;
	}

	// Sort the glyph mappings primarily by ID for processing runs.
	glyphMapping.sort ( function ( a, b )
	{
		return a.id - b.id ; // Numeric sort.
	} ) ;


	// Create a new SvgTable instance.
	var table = new SvgTable ( ) ;
	var startOfRun = 0 ; // Index to mark the beginning of a contiguous run of glyphs.

	// Iterate through the sorted glyph mappings to identify runs of consecutive glyph IDs from the same document.
	for ( var j = 0 ; j < glyphMapping.length ; ++j )
	{
		// Check for duplicate glyph IDs.
		if ( j > 0 && glyphMapping[ j ].id == glyphMapping[ j - 1 ].id )
		{
			if ( options && options.ignoreDuplicateGlyphIds )
			{
				glyphMapping.splice ( j, 1 ) ; // Remove the duplicate if option is set.
				continue ; // Skip to the next iteration.
			}
			throw "Duplicate glyphs found for glyph ID " + glyphMapping[ j ].id ;
		}

		// Determine if the current glyph marks the end of a run.
		// A run ends if it's the last glyph, or the next glyph is not consecutive,
		// or the next glyph comes from a different document.
		if ( j == glyphMapping.length - 1 ||
		     glyphMapping[ j + 1 ].id != glyphMapping[ j ].id + 1 ||
		     glyphMapping[ j + 1 ].doc != glyphMapping[ j ].doc )
		{
			// This is the end of a run.
			// Add a new document entry to the table representing this run.
			table.documents.push ( {
				startGlyphId:glyphMapping[ startOfRun ].id,
				endGlyphId:glyphMapping[ j ].id,
				text:glyphMapping[ j ].doc // The text of the SVG document containing this run.
			} ) ;
			startOfRun = j + 1 ; // Start the next run from the next glyph.
		}
	}

	// Return the populated SvgTable instance.
	return table ;
};


// Static method to reconstruct an SvgTable instance from a DataView of a previously serialized buffer.
SvgTable.fromTable = function ( dataView )
{
	// Validate the table version.
	if ( dataView.getUint16 ( 0 ) != 0 )
	{
		throw "Unknown table version" ; // Only version 0 is supported.
	}

	// Check for unsupported features like color palettes.
	if ( dataView.getUint32 ( 6 ) != 0 )
	{
		throw "Color palettes not supported yet" ; // This field should be 0.
	}

	// Retrieve the offset to the document index table.
	var docIndexOffset = dataView.getUint32 ( 2 ) ;

	// Validate the document index offset.
	if ( docIndexOffset + 2 > dataView.byteLength )
	{
		throw "Document index out of range" ;
	}

	// Get the number of document entries from the index.
	var numEntries = dataView.getUint16 ( docIndexOffset ) ;

	// Validate the extent of the document index table.
	if ( docIndexOffset + 2 + numEntries * 12 > dataView.byteLength )
	{
		throw "Document index out of range" ;
	}

	// Ensure there is at least one document entry.
	if ( numEntries == 0 )
	{
		throw "Must have at least one document" ;
	}


	// Create a new SvgTable instance to populate.
	var table = new SvgTable ( ) ;
	var offset = docIndexOffset + 2 ; // Starting offset for reading individual document entries.
	var textDecoder = new TextDecoder ( ) ; // TextDecoder for decoding UTF-8 text from the buffer.

	// Iterate through each document entry in the index.
	for ( var i = 0 ; i < numEntries ; ++i )
	{
		// Read the start and end glyph IDs for the current document.
		var startGlyphId = dataView.getUint16 ( offset ) ;
		var endGlyphId = dataView.getUint16 ( offset + 2 ) ;

		// Validate glyph ID ordering.
		if ( startGlyphId > endGlyphId )
		{
			throw "Misordered glyph ids" ;
		}

		// Ensure glyph IDs are monotonically increasing across documents.
		if ( i > 0 && table.documents[ i - 1 ].endGlyphId >= startGlyphId )
		{
			throw "Misordered glyph ids with previous document" ;
		}

		// Read the offset and length of the actual document text data.
		var docOffset = dataView.getUint32 ( offset + 4 ) ;
		var docLength = dataView.getUint32 ( offset + 8 ) ;

		// Validate the document data's range within the buffer.
		if ( docOffset + docLength > dataView.byteLength )
		{
			throw "Document end out of range" ;
		}

		// Decode the document text from the buffer.
		var docText = textDecoder.decode (
			new DataView ( dataView.buffer, dataView.byteOffset + docIndexOffset + docOffset, docLength ) ) ;

		// Add the reconstructed document to the table's documents array.
		table.documents.push ( {
			startGlyphId:startGlyphId,
			endGlyphId:endGlyphId,
			text:docText
		} ) ;

		// Move to the next document entry in the index.
		offset += 12 ;
	}

	// Return the fully reconstructed SvgTable.
	return table ;
};