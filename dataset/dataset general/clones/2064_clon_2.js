(function( globalScope, utilityObject, undefinedValue ) {
	// Activate strict mode for the entire script
	"use strict";

	// Constructor for a rendering key set
	var VisualizerConfig = function( renderMode, fontInfo ) {
		// Verify the desired rendering mode
		if ( renderMode !== 'svg' ) {
			throw 'Unsupported rendering output type';
		}
		// Store the font details internally
		this.fontInfo = fontInfo;
	};

	// Prototype methods for the VisualizerConfig object
	VisualizerConfig.prototype = {
		// Function to generate the SVG representation of a given text string
		generateSvgOutput: function( inputString, targetHeight ) {
			// Obtain the sequence of glyph identifiers for the input text
			var charGlyphIndexes = this.fontInfo.getCharacterGlyphIDs( inputString ),
			    currentHorizPos = 0, // Tracks the horizontal position for drawing
			    svgSnippet = '', // Accumulates SVG path data for all glyphs
			    maxVertExtent = 0; // Placeholder, not actively used in this logic

			// Loop through each glyph identifier in the sequence
			for ( var charIndex in charGlyphIndexes ) {
				// Retrieve horizontal metrics for the current glyph
				var horizMetricSet = this.fontInfo.getHorizMetricsForGlyph( charGlyphIndexes[charIndex] );
				// Calculate kerning adjustment between previous and current glyph
				var kerningAdj = this.fontInfo.getGlyphKerning( charGlyphIndexes[charIndex-1], charGlyphIndexes[charIndex] );
				// Get the actual glyph object from the font's glyph collection
				var currentGlyphObject = this.fontInfo.glyphCollection.allGlyphs[ charGlyphIndexes[charIndex] ];
				var glyphMarkup = ''; // Temporary storage for current glyph's SVG

				try {
					// If the glyph object exists, proceed with SVG path generation
					if ( currentGlyphObject ) {
						var glyphPathData = getGlyphPathAsSvg( currentGlyphObject );
						// Wrap the glyph path in an SVG group with translation
						glyphMarkup = '<g transform="translate('+(currentHorizPos + Math.max(horizMetricSet.leftBearing, 0) + kerningAdj)+', 0)">\n'+glyphPathData+'\n</g>';
					}
				}
				catch ( processingError ) {
					// Log any exceptions that occur during glyph rendering
					globalScope.console.log('Error encountered rendering "'+inputString[charIndex]+'": '+processingError);
				}
				// Append the current glyph's SVG markup to the overall output
				svgSnippet += glyphMarkup;
				// Update the horizontal position by the glyph's advance width and kerning
				currentHorizPos += (horizMetricSet.advanceDimension + kerningAdj);
			}

			// Add a visual baseline indicator to the SVG output
			svgSnippet += '\n<line x1="0" y1="0" x2="'+currentHorizPos+'" y2="0" style="stroke-width: 10; stroke: red;"/>';

			// Determine the actual vertical extent of the font
			var computedHeight = this.fontInfo.hheaTable.ascenderVal - this.fontInfo.hheaTable.descenderVal;
			// Encapsulate all glyphs in a group for vertical positioning and Y-axis flip
			var completeWordGroup = '<g transform="translate(0,'+this.fontInfo.hheaTable.ascenderVal+') scale(1,-1)">\n'+svgSnippet+'\n</g>';
			// Construct the final SVG element with appropriate dimensions and attributes
			var fullSvgElement = '<svg height="'+targetHeight+'px" viewBox="0 '+this.fontInfo.hheaTable.descenderVal+' '+currentHorizPos+' '+
			(computedHeight-this.fontInfo.hheaTable.descenderVal)+'" xmlns="http://www.w3.org/2000/svg" version="1.1">\n'+completeWordGroup +
			'\n</svg>';
			return fullSvgElement;
		}
	};

	// A simple object to hold cached data (currently unused)
	var dataStore = {};

	// Converts a glyph definition object into an SVG path string
	function getGlyphPathAsSvg( glyphDefinition ) {
		// Retrieve the bounding box coordinates
		var boundaryBox = glyphDefinition.boundingBox;
		var svgPathString = '<path d="';

		// Get the points structured by segments
		var pointStructure = glyphDefinition.getSegmentedPoints();
		var xCoordinatesArray = pointStructure.xCoords,
		    yCoordinatesArray = pointStructure.yCoords,
		    pointFlagsArray = pointStructure.flagsInfo;

		// Iterate through each contour of the glyph
		for ( var contourIdx = 0; contourIdx < glyphDefinition.getContourCount(); contourIdx++ ) {
			// Process each point within the current contour
			for ( var pointIdx = 0; pointIdx < pointFlagsArray[contourIdx].length; pointIdx++ ) {
				if ( pointIdx === 0 ) {
					// Start a new path segment (Move To command)
					svgPathString += " M"+xCoordinatesArray[contourIdx][pointIdx]+','+yCoordinatesArray[contourIdx][pointIdx];
				} else if ( pointFlagsArray[contourIdx][pointIdx] & 0x01 ) {
					// Draw a straight line segment (Line To command)
					svgPathString += " L"+xCoordinatesArray[contourIdx][pointIdx]+','+yCoordinatesArray[contourIdx][pointIdx];
				} else {
					// Handle Bezier curves
					if ( pointFlagsArray[contourIdx][pointIdx+1] & 0x01 || pointIdx === pointFlagsArray[contourIdx].length-2 ) {
						// Quadratic Bezier curve (control point + endpoint)
						svgPathString += " Q"+xCoordinatesArray[contourIdx][pointIdx]+','+yCoordinatesArray[contourIdx][pointIdx];
						svgPathString += " "+xCoordinatesArray[contourIdx][pointIdx+1]+','+yCoordinatesArray[contourIdx][pointIdx+1];
						pointIdx++; // Increment index for the consumed endpoint
					}
					// Check for higher-order Bezier curves (Cubic)
					else if ( pointIdx < pointFlagsArray[contourIdx].length-2 ){
						globalScope.console.log('TODO: Implement handling for higher-order b-splines (n>3)');
						// Cubic Bezier curve (two control points + endpoint)
						svgPathString += " C"+xCoordinatesArray[contourIdx][pointIdx]+','+yCoordinatesArray[contourIdx][pointIdx];
						svgPathString += " "+xCoordinatesArray[contourIdx][pointIdx+1]+','+yCoordinatesArray[contourIdx][pointIdx+1];
						svgPathString += " "+xCoordinatesArray[contourIdx][pointIdx+2]+','+yCoordinatesArray[contourIdx][pointIdx+2];
						pointIdx += 2; // Increment index for the two consumed points
					}
				}
			}
		}
		svgPathString += '"/>'; // Close the path element
		return svgPathString;
	}


	// Object for sequential binary data reading
	function BinaryInputReader( dataBuffer, initialOffset ) {
		var currentBytePos = initialOffset || 0;
		// Create a DataView for low-level binary access
		var dataViewInstance = new globalScope.DataView( dataBuffer, currentBytePos );

		// Read a signed 8-bit integer and advance position
		this.readSignedByte = function() { return dataViewInstance.getInt8( currentBytePos++ ); };
		// Read an unsigned 8-bit integer and advance position
		this.readUnsignedByte = function() { return dataViewInstance.getUint8( currentBytePos++ ); };
		// Read a signed 16-bit integer and advance position
		this.readSignedShort = function() { currentBytePos+= 2;return dataViewInstance.getInt16( currentBytePos-2 ); };
		// Read an unsigned 16-bit integer and advance position
		this.readUnsignedShort = function() { currentBytePos+= 2;return dataViewInstance.getUint16( currentBytePos-2 ); };
		// Read a signed 32-bit integer and advance position
		this.readSignedLong = function() { currentBytePos += 4; return dataViewInstance.getInt32( currentBytePos-4 ); };
		// Read an unsigned 32-bit integer and advance position
		this.readUnsignedLong = function() { currentBytePos += 4; return dataViewInstance.getUint32( currentBytePos-4 ); };
		// Read a 32-bit floating-point number and advance position
		this.readFloatVal = function() { currentBytePos += 4; return dataViewInstance.getFloat32( currentBytePos-4 ); };
		// TODO: This 64-bit integer implementation is incorrect and needs fixing
		this.readSignedLongLong = function() { this.readSignedLong() << 32 | this.readSignedLong(); };
		// Move the read position backward by a specified number of bytes
		this.rewindBytes = function( numBytes ) { currentBytePos -= numBytes; };
		// Get the current read offset
		this.getCurrentOffset = function() { return currentBytePos; };
		// Set the read offset to a new absolute position
		this.setOffset = function( newPos ) { currentBytePos = Math.max( newPos,0 ); };

		// Read a string of a given character count from the current position
		this.fetchString = function( charCount ) {
			var fetchedString = this.getStringAtSpecificPos( currentBytePos, charCount );
			currentBytePos += charCount;
			return fetchedString;
		};
		// Retrieve a string from a specified start position with a given length
		this.getStringAtSpecificPos = function( startPosition, stringLength ) {
			var stringBuilder = '';
			for ( var charIterator = 0; charIterator < stringLength; charIterator++ ) {
				stringBuilder += String.fromCharCode( dataViewInstance.getInt8( startPosition+charIterator ) );
			}
			return stringBuilder;
		};
		// Read a 32-bit fixed-point number (16.16 format)
		this.readFixedPoint32 = function() {
			var resultFixed = 0.0;
			resultFixed = this.readSignedShort();
			resultFixed += (this.readSignedShort()/65536);
			return resultFixed;
		};
		// Read an array of unsigned 8-bit integers
		this.getUnsignedByteArray = function( lengthOfArray ) {
			var outputArray = [];
			for ( var arrayIdx = 0; arrayIdx < lengthOfArray; arrayIdx++ ) {
				outputArray[arrayIdx] = this.readUnsignedByte();
			}
			return outputArray;
		};
		// Read an array of unsigned 16-bit integers
		this.getUnsignedShortArray = function( lengthOfArray ) {
			var outputArray = [];
			for ( var arrayIdx = 0; arrayIdx < lengthOfArray; arrayIdx++ ) {
				outputArray[arrayIdx] = this.readUnsignedShort();
			}
			return outputArray;
		};
	}

	// Descriptions for various name table entries in a font
	var fontDescriptionLabels =
	['Copyright Info','Font Family Name','Font Style Name','Subfamily Identifier','Complete Font Name', 'Font Revision',
	'PostScript Identifier','Trademark Statement','Manufacturer','Font Designer','Font Overview','Vendor Website',
	'Designer Website','License Details'];

	// Platform IDs for character encoding tables
	var platformCodeIdentifiers =
	['Unicode Standard','Apple Mac OS',undefinedValue,'Microsoft Windows'];

	// Macintosh specific encoding scheme IDs
	var macintoshEncodingSchemes =
	['Roman','Japanese','Traditional Chinese','Korean','Arabic','Hebrew','Greek','Russian','Symbolic',
	'Devanagari','Gurmukhi','Gujarati','Oriya','Bengali','Tamil','Telugu','Kannada','Malayalam',
	'Sinhalese','Burmese','Khmer','Thai','Lao','Georgian','Armenian','Simplified Chinese','Tibetan',
	'Mongolian','Ethiopic','Slavic','Vietnamese','Sindhi'];

	// Unicode specific encoding scheme IDs
	var unicodeEncodingSchemes =
	['Default Unicode Semantics', 'Version 1.1 Unicode Semantics', 'ISO 10646 1993 Semantics (Deprecated)',
	'Unicode 2.0 or Later Semantics'];

	// Mapping of Mac Roman encoding to glyph names
	var macRomanCharacterMap =
	['.notdef','.null','nonmarkingreturn','space','exclam','quotedbl','numbersign','dollar','percent','ampersand',
	'quotesingle','parenleft','parenright','asterisk','plus','comma','hyphen','period','slash','zero','one','two',
	'three','four','five','six','seven','eight','nine','colon','semicolon','less','equal','greater','question','at',
	'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','bracketleft',
	'backslash','bracketright','asciicircum','underscore','grave','a','b','c','d','e','f','g','h','i','j','k','l','m','n',
	'o','p','q','r','s','t','u','v','w','x','y','z','braceleft','bar','braceright','asciitilde','Adieresis','Aring',
	'Ccedilla','Eacute','Ntilde','Odieresis','Udieresis','aacute','agrave','acircumflex','adieresis','atilde','aring',
	'ccedilla','eacute','egrave','ecircumflex','edieresis','iacute','igrave','icircumflex','idieresis','ntilde','oacute',
	'ograve','ocircumflex','odieresis','otilde','uacute','ugrave','ucircumflex','udieresis','dagger','degree','cent',
	'sterling','section','bullet','paragraph','germandbls','registered','copyright','trademark','acute','dieresis',
	'notequal','AE','Oslash','infinity','plusminus','lessequal','greaterequal','yen','mu','partialdiff','summation',
	'product','pi','integral','ordfeminine','ordmasculine','Omega','ae','oslash','questiondown','exclamdown','logicalnot',
	'radical','florin','approxequal','Delta','guillemotleft','guillemotright','ellipsis','nonbreakingspace','Agrave','Atilde',
	'Otilde','OE','oe','endash','emdash','quotedblleft','quotedblright','quoteleft','quoteright','divide','lozenge','ydieresis',
	'Ydieresis','fraction','currency','guilsinglleft','guilsinglright','fi','fl','daggerdbl','periodcentered','quotesinglbase',
	'quotedblbase','perthousand','Acircumflex','Ecircumflex','Aacute','Edieresis','Egrave','Iacute','Icircumflex','Idieresis',
	'Igrave','Oacute','Ocircumflex','apple','Ograve','Uacute','Ucircumflex','Ugrave','dotlessi','circumflex','tilde','macron',
	'breve','dotaccent','ring','cedilla','hungarumlaut','ogonek','caron','Lslash','lslash','Scaron','scaron','Zcaron','zcaron',
	'brokenbar','Eth','eth','Yacute','yacute','Thorn','thorn','minus','multiply','onesuperior','twosuperior','threesuperior',
	'onehalf','onequarter','threequarters','franc','Gbreve','gbreve','Idotaccent','Scedilla','scedilla','Cacute','cacute',
	'Ccaron','ccaron','dcroat']; // Extensive list of Mac Roman glyph names

	// Utility function to locate a font table by its string tag
	function findTableByTag( fontContainer, tableStringTag ) {
		var foundTable = fontContainer.allTables.filter( function( tableEntry ) {
			return tableEntry.tableTag === tableStringTag;
		} );
		return foundTable ? foundTable[0] : undefinedValue;
	}

	// Reads a single entry from the font's table directory
	function extractTableEntry( dataReaderInstance ) {
		var tableEntryData = {};
		tableEntryData.tableTag = dataReaderInstance.fetchString( 4 );
		tableEntryData.checksum = dataReaderInstance.readUnsignedLong();
		tableEntryData.offsetStart = dataReaderInstance.readUnsignedLong();
		tableEntryData.dataLength = dataReaderInstance.readUnsignedLong();
		return tableEntryData;
	}

	// Collection of functions to parse and initialize specific font tables
	var fontTableParsers = {
		'head': function( fontDataObj ) {
			var headerTable = findTableByTag( fontDataObj, 'head' );
			var reader = fontDataObj.binaryReader;
			reader.setOffset( headerTable.offsetStart );
			var fontHeaderDetails = {};
			fontHeaderDetails.versionNum = reader.readFixedPoint32();
			fontHeaderDetails.revisionNum = reader.readFixedPoint32();
			fontHeaderDetails.checksumAdjust = reader.readUnsignedLong();
			fontHeaderDetails.magicValue = reader.readUnsignedLong();
			if ( fontHeaderDetails.magicValue !== 0x5F0F3CF5 ) {
				throw "Font head table has an invalid magic number";
			}
			fontHeaderDetails.flagBits = reader.readUnsignedShort();
			fontHeaderDetails.unitsPerEmValue = reader.readUnsignedShort();

			fontHeaderDetails.creationTime = reader.readSignedLongLong();
			fontHeaderDetails.modificationTime = reader.readSignedLongLong();

			fontHeaderDetails.xMinimum = reader.readSignedShort();
			fontHeaderDetails.yMinimum = reader.readSignedShort();
			fontHeaderDetails.xMaximum = reader.readSignedShort();
			fontHeaderDetails.yMaximum = reader.readSignedShort();

			fontHeaderDetails.macintoshStyle = reader.readUnsignedShort();
			fontHeaderDetails.lowestRecPPEM = reader.readUnsignedShort();
			fontHeaderDetails.fontDirectionHint = reader.readSignedShort();
			fontHeaderDetails.locaFormatIndex = reader.readSignedShort();
			fontHeaderDetails.glyphDataFormat = reader.readSignedShort();

			fontDataObj.headTable = Object.freeze( fontHeaderDetails );
		},
		'name': function( fontDataObj ) {
			var nameDescriptorTable = findTableByTag( fontDataObj, 'name' );
			var reader = fontDataObj.binaryReader;
			reader.setOffset( nameDescriptorTable.offsetStart );
			var nameRecordsTable = { recordsArray: [] };
			nameRecordsTable.versionNum = reader.readUnsignedShort();
			var entryCount = reader.readUnsignedShort();
			var stringDataOffset = reader.readUnsignedShort();
			for ( var entryIdx = 0; entryIdx < entryCount; entryIdx++ ) {
				var recordDetail = {};
				recordDetail.platformID = reader.readUnsignedShort();
				recordDetail.platformSpecificID = reader.readUnsignedShort();
				recordDetail.languageID = reader.readUnsignedShort();
				recordDetail.nameID = reader.readUnsignedShort();
				var dataLength = reader.readUnsignedShort();
				var dataOffset = reader.readUnsignedShort();
				recordDetail.textContent = reader.getStringAtSpecificPos( nameDescriptorTable.offsetStart + stringDataOffset + dataOffset, dataLength );
				nameRecordsTable.recordsArray.push( recordDetail );
			}
			fontDataObj.nameTable = nameRecordsTable;
		},
		'hhea': function( fontDataObj ) {
			var hheaHeaderTable = findTableByTag( fontDataObj, 'hhea' );
			var reader = fontDataObj.binaryReader;
			reader.setOffset( hheaHeaderTable.offsetStart );
			var hheaDetails = {};
			hheaDetails.versionNum = reader.readFixedPoint32();
			hheaDetails.ascenderVal = reader.readSignedShort();
			hheaDetails.descenderVal = reader.readSignedShort();

			hheaDetails.lineGapVal = reader.readSignedShort();
			hheaDetails.advanceWidthMax = reader.readUnsignedShort();
			hheaDetails.minLeftBearing = reader.readSignedShort();
			hheaDetails.minRightBearing = reader.readSignedShort();
			hheaDetails.xMaxExtent = reader.readSignedShort();
			hheaDetails.caretSlopeRise = reader.readSignedShort();
			hheaDetails.caretSlopeRun = reader.readSignedShort();
			hheaDetails.reservedFieldA = reader.readSignedShort();
			hheaDetails.reservedFieldB = reader.readSignedShort();
			hheaDetails.reservedFieldC = reader.readSignedShort();
			hheaDetails.reservedFieldD = reader.readSignedShort();
			hheaDetails.reservedFieldE = reader.readSignedShort();
			hheaDetails.metricDataFormat = reader.readSignedShort();
			hheaDetails.numberOfHorizMetrics = reader.readUnsignedShort();

			fontDataObj.hheaTable = Object.freeze( hheaDetails );
		},
		'maxp': function( fontDataObj ) {
			var maxpProfileTable = findTableByTag( fontDataObj, 'maxp' );
			var reader = fontDataObj.binaryReader;
			reader.setOffset( maxpProfileTable.offsetStart );
			var maxProfileDetails = {};
			maxProfileDetails.versionNum = reader.readFixedPoint32();

			maxProfileDetails.glyphCount = reader.readSignedShort();
			maxProfileDetails.maxPoints = reader.readSignedShort();
			maxProfileDetails.maxContours = reader.readSignedShort();
			maxProfileDetails.maxComponentPoints = reader.readSignedShort();
			maxProfileDetails.maxComponentContours = reader.readSignedShort();
			maxProfileDetails.maxZones = reader.readSignedShort();
			maxProfileDetails.maxTwilightPoints = reader.readSignedShort();
			maxProfileDetails.maxStorage = reader.readSignedShort();
			maxProfileDetails.maxFunctionDefs = reader.readSignedShort();
			maxProfileDetails.maxInstructionDefs = reader.readSignedShort();
			maxProfileDetails.maxStackElements = reader.readSignedShort();
			maxProfileDetails.maxInstructionSize = reader.readSignedShort();
			maxProfileDetails.maxComponentElements = reader.readSignedShort();
			maxProfileDetails.maxComponentDepth = reader.readSignedShort();

			fontDataObj.maxProfileTable = Object.freeze( maxProfileDetails );
		},
		'post': function( fontDataObj ) {
			var postScriptTable = findTableByTag( fontDataObj, 'post' );
			var reader = fontDataObj.binaryReader;
			reader.setOffset( postScriptTable.offsetStart );
			var postScriptDetails = {};
			postScriptDetails.formatVersion = reader.readFixedPoint32();
			postScriptDetails.italicAngle = reader.readFixedPoint32();
			postScriptDetails.underlinePos = reader.readSignedShort();
			postScriptDetails.underlineThickness = reader.readSignedShort();
			postScriptDetails.isFixedPitch = reader.readUnsignedLong();
			postScriptDetails.minMemType42 = reader.readUnsignedLong();
			postScriptDetails.maxMemType42 = reader.readUnsignedLong();
			postScriptDetails.minMemType1 = reader.readUnsignedLong();
			postScriptDetails.maxMemType1 = reader.readUnsignedLong();

			var glyphNameStringList = [], loopCounter;
			if ( postScriptDetails.formatVersion === 1.0 ) {
				for ( loopCounter = 0; loopCounter < 258; loopCounter++ ) {
					glyphNameStringList[loopCounter] = macRomanCharacterMap[loopCounter];
				}
			} else if ( postScriptDetails.formatVersion === 2.0 ) {
				var totalGlyphsInFont = reader.readUnsignedShort();
				var glyphIndexNameMap = new Array( totalGlyphsInFont );
				var maximumIndexValue = Number.MIN_VALUE;
				for ( loopCounter = 0; loopCounter < totalGlyphsInFont; loopCounter++ ) {
					var currentGlyphIndex = reader.readUnsignedShort();
					glyphIndexNameMap[loopCounter] = currentGlyphIndex;
					maximumIndexValue = Math.max( maximumIndexValue, currentGlyphIndex );
				}
				var customNameStrings = [];
				if ( maximumIndexValue >= 258 ) {
					for ( loopCounter = 0; loopCounter < maximumIndexValue-258+1; loopCounter++ ) {
						var stringLen = reader.readUnsignedByte();
						customNameStrings[loopCounter] = reader.fetchString( stringLen );
					}
				}
				for ( loopCounter = 0; loopCounter < totalGlyphsInFont; loopCounter++ ) {
					var mappedGlyphIndex = glyphIndexNameMap[loopCounter];
					if ( mappedGlyphIndex < 258 ) {
						glyphNameStringList[loopCounter] = macRomanCharacterMap[mappedGlyphIndex];
					} else if ( mappedGlyphIndex >= 258 && mappedGlyphIndex <= 32767 ) {
						glyphNameStringList[loopCounter] = customNameStrings[mappedGlyphIndex-258];
					} else {
						throw "Unrecognized glyph name index: "+mappedGlyphIndex;
					}
				}
			}
			postScriptDetails.glyphNames = glyphNameStringList;
			fontDataObj.postTable = Object.freeze( postScriptDetails );
		},
		'loca': function( fontDataObj ) {
			var locaLocationTable = findTableByTag( fontDataObj, 'loca' );
			var reader = fontDataObj.binaryReader;
			reader.setOffset( locaLocationTable.offsetStart );
			var glyphLocationTable = {};

			var indexToLocaFormat = fontDataObj.headTable.locaFormatIndex;
			var totalGlyphCount = fontDataObj.maxProfileTable.glyphCount;

			glyphLocationTable.entryOffsets = new Array( totalGlyphCount +1 );
			for ( var offsetIdx = 0; offsetIdx < totalGlyphCount+1; offsetIdx++ ) {
				if ( indexToLocaFormat === 0 ) {
					glyphLocationTable.entryOffsets[offsetIdx] = reader.readUnsignedShort() * 2;
				} else if ( indexToLocaFormat === 1 ) {
					glyphLocationTable.entryOffsets[offsetIdx] = reader.readUnsignedLong();
				} else {
					throw "Font contains an invalid glyph IndexToLocFormat value";
				}
			}
			fontDataObj.locaTable = Object.freeze( glyphLocationTable );
		},
		'cmap': function( fontDataObj ) {
			var cmapCharMapTable = findTableByTag( fontDataObj, 'cmap' );
			var reader = fontDataObj.binaryReader;
			reader.setOffset( cmapCharMapTable.offsetStart );
			var characterMappingTable = {};
			var tableVersion = reader.readUnsignedShort();
			var numSubtables = reader.readUnsignedShort();
			var charMapSubtables = new Array( numSubtables );
			var currentMap, subtableIdx;
			for ( subtableIdx = 0; subtableIdx < numSubtables; subtableIdx++ ) {
				currentMap = {};
				currentMap.platformID = reader.readUnsignedShort();
				currentMap.platformSpecificID = reader.readUnsignedShort();
				currentMap.offsetValue = reader.readUnsignedLong();
				charMapSubtables[subtableIdx] = currentMap;
			}
			for ( subtableIdx = 0; subtableIdx < numSubtables; subtableIdx++ ) {
				currentMap = charMapSubtables[subtableIdx];
				reader.setOffset( cmapCharMapTable.offsetStart + currentMap.offsetValue );
				currentMap.formatType = reader.readUnsignedShort();
				currentMap.tableLength = reader.readUnsignedShort();
				currentMap.languageIdentifier = reader.readUnsignedShort();
				currentMap.glyphIndexArr = new Array( 256 );
				switch( currentMap.formatType ) {
					case 0:
					for( var charCodeVal = 0; charCodeVal < 256; charCodeVal++ ) {
						currentMap.glyphIndexArr[charCodeVal] = reader.readUnsignedByte();
					}
					break;
					case 4:
					var totalGlyphsInFont = fontDataObj.maxProfileTable.glyphCount;

					var segmentCountX2 = reader.readUnsignedShort();
					var segmentCount = segmentCountX2 / 2;
					var searchRangeVal = reader.readUnsignedShort();
					var entrySelectorVal = reader.readUnsignedShort();
					var rangeShiftVal = reader.readUnsignedShort();
					var endCodeValues = reader.getUnsignedShortArray( segmentCount );
					reader.readUnsignedShort();  // Reserved Padding
					var startCodeValues = reader.getUnsignedShortArray( segmentCount );
					var idDeltaValues = reader.getUnsignedShortArray( segmentCount );
					var idRangeOffsetValues = reader.getUnsignedShortArray( segmentCount );
					var glyphToCharacterMapping = new Array( totalGlyphsInFont );
					var currentReaderPosition = reader.getCurrentOffset();
					for ( var segIterator = 0; segIterator < segmentCount; segIterator++ ) {
						var segStartCode = startCodeValues[segIterator];
						var segEndCode = endCodeValues[segIterator];
						var deltaAdjustment = idDeltaValues[segIterator];
						var rangeOffset = idRangeOffsetValues[segIterator];
						if ( segStartCode !== 0xFFFF && segEndCode !== 0xFFFF ) {
							for ( var charValue = segStartCode; charValue < segEndCode; charValue++ ) {
								if ( rangeOffset === 0 ) {
									glyphToCharacterMapping[((charValue+deltaAdjustment)%65536)] = charValue;
									currentMap.glyphIndexArr[charValue] = ((charValue+deltaAdjustment)%65536);
								} else {
									var glyphOffsetCalculation = currentReaderPosition+((rangeOffset/2)+(charValue-segStartCode)+(segIterator-segmentCount))*2;
									reader.setOffset( glyphOffsetCalculation );
									var glyphIdentifier = reader.readUnsignedShort();
									if ( glyphIdentifier != 0 ) {
										glyphIdentifier += deltaAdjustment;
										glyphIdentifier %= 65536;
										if ( glyphToCharacterMapping[glyphIdentifier] === 0 ) {
											glyphToCharacterMapping[glyphIdentifier] = charValue;
											currentMap.glyphIndexArr[charValue] = glyphIdentifier;
										}
									}
								}
							}
						}
					}
					currentMap.glyphToCharacterMap = glyphToCharacterMapping;
					break;
				}
			}
			characterMappingTable.allMaps = charMapSubtables;
			fontDataObj.cmapTable = Object.freeze( characterMappingTable );
		},
		'glyf': function( fontDataObj ) {
			var glyfGlyphTable = findTableByTag( fontDataObj, 'glyf' );
			var reader = fontDataObj.binaryReader;
			reader.setOffset( glyfGlyphTable.offsetStart );
			var glyphDefinitionContainer = {};

			var maxProfile = fontDataObj.maxProfileTable;
			var locaData = fontDataObj.locaTable;
			var postData = fontDataObj.postTable;

			var glyphOffsets = locaData.entryOffsets;
			var totalGlyphs = maxProfile.glyphCount;
			var glyphNameReference = postData.glyphNames; // Variable is set but not used in the original 'glyf' initializer.

			var allFontGlyphs = new Array( totalGlyphs );
			for ( var glyphIterator = 0; glyphIterator < totalGlyphs-1; glyphIterator++ ) {
				// If offsets are identical, the glyph is empty, skip it
				if ( glyphOffsets[glyphIterator] === glyphOffsets[glyphIterator+1] ) {
					continue;
				}
				// Create a new Glyph object for the current glyph
				var glyphInstance = new Glyph( glyfGlyphTable.offsetStart + glyphOffsets[glyphIterator], reader );
				allFontGlyphs[glyphIterator] = glyphInstance;
			}
			// After all simple glyphs are parsed, resolve any composite glyphs
			for ( var glyphIterator = 0; glyphIterator < totalGlyphs-1; glyphIterator++ ) {
				if ( allFontGlyphs[glyphIterator] && allFontGlyphs[glyphIterator].numContours === -1 ) {
					allFontGlyphs[glyphIterator].resolveComponents( allFontGlyphs );
				}
			}
			glyphDefinitionContainer.allGlyphs = allFontGlyphs;
			fontDataObj.glyphCollection = Object.freeze( glyphDefinitionContainer );
		},
		'hmtx': function( fontDataObj ) {
			var hmtxHorizMetricsTable = findTableByTag( fontDataObj, 'hmtx' );
			var reader = fontDataObj.binaryReader;
			reader.setOffset( hmtxHorizMetricsTable.offsetStart );
			var horizontalMetricsData = {};

			var numLongHorizMetrics = fontDataObj.hheaTable.numberOfHorizMetrics;
			horizontalMetricsData.longHorizMetrics = new Array( numLongHorizMetrics );
			var metricIterator;
			for ( metricIterator = 0; metricIterator < numLongHorizMetrics; metricIterator++ ) {
				var metricRecord = {};
				metricRecord.advanceWidth = reader.readUnsignedShort();
				metricRecord.leftBearing = reader.readSignedShort();
				horizontalMetricsData.longHorizMetrics[metricIterator] = metricRecord;
			}
			// For glyphs beyond the initial long metrics, use the last advance width
			var lastAdvanceWidth = horizontalMetricsData.longHorizMetrics[metricIterator-1].advanceWidth;
			for ( ; metricIterator < fontDataObj.maxProfileTable.glyphCount; metricIterator++ ) {
				var metricRecord = {};
				metricRecord.advanceWidth = lastAdvanceWidth; // Inherit advance width
				metricRecord.leftBearing = reader.readSignedShort();
				horizontalMetricsData.longHorizMetrics[metricIterator] = metricRecord;
			}
			fontDataObj.horizontalMetrics = Object.freeze( horizontalMetricsData );
		},
		'kern': function( fontDataObj ) {
			var kernKerningTable = findTableByTag( fontDataObj, 'kern' );
			// If the kerning table is not present, exit this initializer
			if ( !kernKerningTable ) { return; }
			var reader = fontDataObj.binaryReader;
			reader.setOffset( kernKerningTable.offsetStart );
			var kerningInformation = {};

			var firstWord = reader.readUnsignedShort();
			var secondWord = reader.readUnsignedShort();
			// Check if it's the expected version 1.0 kerning table format
			if ( firstWord === 1 && secondWord === 0 ) {
				kerningInformation.versionNumber = 1.0;
				kerningInformation.subtableCount = reader.readUnsignedLong();
			} else {
				// Placeholder for handling other kerning table versions
			}
		}
	};

})( window, {}, undefined );