/*
 * This is a Type I clone of the original XLSX.js library.
 * All intellectual property rights are retained by the original authors.
 * This file is provided for demonstration of Type I clone generation.
 *
 * Original License Information:
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Released under the Microsoft Office Extensible File License
 * https://raw.github.com/stephen-hardy/xlsx.js/master/LICENSE.txt
 *
 */

// Check if JSZip is defined, and if not, try to load it via require (Node.js environment)
if ( ( typeof JSZip === 'undefined' || !JSZip ) && typeof require === 'function' )
{

	// Assign the required module to the JSZip variable
	var JSZip = require( 'node-zip' );

}


/**
 * Main XLSX processing function.
 * Handles both loading (parsing) and saving (generating) Excel files.
 * @param {string|object} file - The file data (base64 string for loading, object for saving).
 * @returns {object} - Result object containing worksheets data or generated file.
 */
function xlsx( file ) {

	// Enforce strict mode for better code quality and error handling
	'use strict'; // This comment indicates the version of the original code: v2.3.2


	// Declare all variables used within this function at the top
	var result,                // Stores the final result (parsed data or generated file)
		zip = new JSZip(),     // JSZip instance for file operations
		zipTime,               // Timestamp for zip operations duration
		processTime,           // Timestamp for overall processing duration
		s,                     // General-purpose string variable, often holds XML content
		f,                     // General-purpose variable, often for format or flag
		i, j, k, l,            // Loop counters
		t,                     // Temporary variable, often for type or text
		w,                     // Worksheet-related variable
		sharedStrings,         // Array to store shared strings from the XML
		styles,                // Array to store cell styles
		index,                 // General-purpose index variable
		data,                  // Worksheet data
		val,                   // Cell value
		style,                 // Current cell style object
		borders,               // Array to store border definitions
		border,                // Current border definition
		borderIndex,           // Index for border definition
		fonts,                 // Array to store font definitions
		font,                  // Current font definition
		fontIndex,             // Index for font definition
		docProps,              // Document properties
		xl,                    // Reference to the 'xl' folder in the zip
		xlWorksheets,          // Reference to the 'xl/worksheets' folder
		worksheet,             // Current worksheet object
		contentTypes = [[], []], // Content types for the [Content_Types].xml file
		props = [],            // Properties for docProps/app.xml
		xlRels = [],           // Relationships for xl/_rels/workbook.xml.rels
		worksheets = [],       // Worksheet entries for xl/workbook.xml
		id,                    // ID for various elements (sheetId, tableId)
		columns,               // Column data for auto-width calculation
		cols,                  // String array for <cols> XML element
		colWidth,              // Calculated column width
		cell,                  // Current cell object
		row,                   // Current row array
		merges,                // Array to store merged cell ranges
		merged,                // Temporary variable for merged cells

		// Standard number formats, some are intentionally left blank or reserved
		numFmts = [
			'General', '0', '0.00', '#,##0', '#,##0.00', , , , , '0%', '0.00%', '0.00E+00',
			'# ?/?', '# ??/??', 'mm-dd-yy', 'd-mmm-yy', 'd-mmm', 'mmm-yy', 'h:mm AM/PM',
			'h:mm:ss AM/PM', 'h:mm', 'h:mm:ss', 'm/d/yy h:mm', , , , , , , , , , , , , , , ,
			'#,##0 ;(#,##0)', '#,##0 ;[Red](#,##0)', '#,##0.00;(#,##0.00)', '#,##0.00;[Red](#,##0.00)',
			, , , , , 'mm:ss', '[h]:mm:ss', 'mmss.0', '##0.0E+0', '@'
		],

		// Alphabet string for column conversions
		alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

		// Default font name for Excel styles
		defaultFontName = 'Calibri',

		// Default font size for Excel styles
		defaultFontSize = 11;


	/**
	 * Converts a 0-based column index to an Excel-style column letter (e.g., 0 -> A, 26 -> AA).
	 * @param {number} i - The 0-based column index.
	 * @returns {string} - The Excel-style column letter.
	 */
	function numAlpha( i ) {

		var t = Math.floor( i / 26 ) - 1; // Calculate the "tens" digit equivalent
		return ( t > -1 ? numAlpha( t ) : '' ) + alphabet.charAt( i % 26 ); // Recursively build the string

	}


	/**
	 * Converts an Excel-style column letter to a 0-based column index (e.g., A -> 0, AA -> 26).
	 * @param {string} s - The Excel-style column letter.
	 * @returns {number} - The 0-based column index.
	 */
	function alphaNum( s ) {

		var t = 0; // Initialize total index
		if ( s.length === 2 ) {
			t = alphaNum( s.charAt( 0 ) ) + 1; // Handle two-letter columns
		}
		return t * 26 + alphabet.indexOf( s.substr( -1 ) ); // Calculate final index

	}


	/**
	 * Converts a JavaScript Date object or Excel serial date to an Excel serial date or Date object.
	 * Handles the 1900 date system and timezone offsets.
	 * @param {Date|number} input - The date to convert (Date object or Excel serial number).
	 * @returns {number|Date} - The converted date.
	 */
	function convertDate( input ) {
		// Excel dates start from 1900-01-01, but internally 1900-01-00 is day 0.
		// JavaScript Date objects start from 1970-01-01.
		var d = new Date( 1900, 0, 0 ), // Base date for Excel (Jan 0, 1900)
			isDateObject = typeof input === 'object', // Check if input is a Date object
			offset = (
				( isDateObject ? input.getTimezoneOffset() : ( new Date() ).getTimezoneOffset() ) // Get timezone offset
				- d.getTimezoneOffset()
			) * 60000; // Convert offset to milliseconds

		return isDateObject
			? ( ( input - d - offset ) / 86400000 ) + 1 // Convert Date object to Excel serial
			: new Date( +d - offset + ( input - 1 ) * 86400000 ); // Convert Excel serial to Date object
	}


	/**
	 * Returns the lowercase type of an object (e.g., 'array', 'object', 'string').
	 * @param {*} obj - The object to check.
	 * @returns {string} - The lowercase type name.
	 */
	function typeOf( obj ) {
		// Use Object.prototype.toString to get the internal [[Class]] property
		return ( {} ).toString.call( obj ).match( /\s([a-zA-Z]+)/ )[1].toLowerCase();
	}


	/**
	 * Extracts an attribute value from an XML string.
	 * Assumes the attribute is in the format `n="value"`.
	 * @param {string} s - The XML string.
	 * @param {string} n - The name of the attribute.
	 * @returns {string} - The value of the attribute.
	 */
	function getAttr( s, n ) {
		// Find the start of the attribute value
		s = s.substr( s.indexOf( n + '="' ) + n.length + 2 );
		// Extract the value until the next double quote
		return s.substring( 0, s.indexOf( '"' ) );
	}


	/**
	 * Escapes special XML characters in a string.
	 * @param {string} s - The string to escape.
	 * @returns {string} - The escaped string.
	 */
	function escapeXML( s ) {
		return typeof s === 'string'
			? s.replace( /&/g, '&amp;' )
				.replace( /</g, '&lt;' )
				.replace( />/g, '&gt;' )
				.replace( /"/g, '&quot;' )
				.replace( /'/g, '&#x27;' )
			: '';
	}


	/**
	 * Unescapes special XML characters in a string.
	 * @param {string} s - The string to unescape.
	 * @returns {string} - The unescaped string.
	 */
	function unescapeXML( s ) {
		return typeof s === 'string'
			? s.replace( /&amp;/g, '&' )
				.replace( /&lt;/g, '<' )
				.replace( /&gt;/g, '>' )
				.replace( /&quot;/g, '"' )
				.replace( /&#x27;/g, '\'' )
				.replace( /&apos;/g, '\'' )
				.replace( /&#10;/g, '\n' )
			: '';
	}


	// Determine if the function is called for loading an existing file or saving a new one
	if ( typeof file === 'string' ) { // Branch for Loading (parsing an existing base64 string)

		// Record the start time for zip processing
		zipTime = Date.now();

		// Load the zip file from the base64 string
		zip = zip.load( file, { base64: true } );

		// Initialize the result object with an empty worksheets array and zip processing time
		result = {
			worksheets: [],
			zipTime: Date.now() - zipTime
		};

		// Record the start time for data processing
		processTime = Date.now();

		// Initialize shared strings and styles arrays
		sharedStrings = [];
		styles = [];


		// Process sharedStrings.xml if it exists
		if ( s = zip.file( 'xl/sharedStrings.xml' ) ) { // Check if sharedStrings.xml file exists

			s = s.asText().split( /<t.*?>/g ); // Split XML by shared string elements
			i = s.length;                       // Get the number of parts

			// Loop through parts to extract shared strings
			while ( --i ) {
				// The first part (s[0]) is before the first <t> tag, so skip it.
				// Extract content between <t> and </t> and unescape XML entities.
				sharedStrings[ i - 1 ] = unescapeXML( s[ i ].substring( 0, s[ i ].indexOf( '</t>' ) ) );
			}

		}


		// Process docProps/core.xml for document properties
		if ( s = zip.file( 'docProps/core.xml' ) ) { // Check if core.xml file exists

			s = s.asText(); // Get the XML content as text

			// Extract creator information
			s = s.substr( s.indexOf( '<dc:creator>' ) + 12 );
			result.creator = s.substring( 0, s.indexOf( '</dc:creator>' ) );

			// Extract last modified by information
			s = s.substr( s.indexOf( '<cp:lastModifiedBy>' ) + 19 );
			result.lastModifiedBy = s.substring( 0, s.indexOf( '</cp:lastModifiedBy>' ) );

			// Extract creation date
			s = s.substr( s.indexOf( '<dcterms:created xsi:type="dcterms:W3CDTF">' ) + 43 );
			result.created = new Date( s.substring( 0, s.indexOf( '</dcterms:created>' ) ) );

			// Extract modification date
			s = s.substr( s.indexOf( '<dcterms:modified xsi:type="dcterms:W3CDTF">' ) + 44 );
			result.modified = new Date( s.substring( 0, s.indexOf( '</dcterms:modified>' ) ) );

		}


		// Process xl/workbook.xml for workbook information
		if ( s = zip.file( 'xl/workbook.xml' ) ) { // Check if workbook.xml file exists

			s = s.asText(); // Get the XML content as text
			index = s.indexOf( 'activeTab="' ); // Find the active tab attribute

			if ( index > 0 ) {
				// Extract the active worksheet index
				s = s.substr( index + 11 ); // Move past 'activeTab="'
				result.activeWorksheet = +s.substring( 0, s.indexOf( '"' ) ); // Convert to number
			} else {
				// Default to the first worksheet if no active tab is specified
				result.activeWorksheet = 0;
			}

			s = s.split( '<sheet ' ); // Split by sheet elements
			i = s.length;              // Get the number of parts

			// Loop through sheet parts to get worksheet names and initialize data structure
			while ( --i ) { // Skip s[0] which is text before the first sheet tag
				id = s[ i ].substr( s[ i ].indexOf( 'name="' ) + 6 ); // Extract name attribute
				// Add worksheet to the beginning of the array (due to --i loop)
				result.worksheets.unshift( { name: id.substring( 0, id.indexOf( '"' ) ), data: [] } );
			}

		}


		// Process xl/styles.xml for style information
		if ( s = zip.file( 'xl/styles.xml' ) ) { // Check if styles.xml file exists

			s = s.asText().split( '<numFmt ' ); // Split by numFmt elements
			i = s.length;                       // Get the number of parts

			// Populate numFmts array with custom format codes
			while ( --i ) {
				t = s[ i ]; // Current numFmt string
				numFmts[ +getAttr( t, 'numFmtId' ) ] = getAttr( t, 'formatCode' ); // Store format code by ID
			}

			s = s[ s.length - 1 ]; // Get the last part, which contains cellXfs
			s = s.substr( s.indexOf( 'cellXfs' ) ).split( '<xf ' ); // Split by xf elements
			i = s.length;                                        // Get the number of parts

			// Populate styles array
			while ( --i ) {
				id = getAttr( s[ i ], 'numFmtId' ); // Get number format ID
				f = numFmts[ id ];                   // Get format code from numFmts

				// Determine cell type based on format code
				if ( f.indexOf( 'm' ) > -1 ) {
					t = 'date';
				} else if ( f.indexOf( '0' ) > -1 ) {
					t = 'number';
				} else if ( f === '@' ) {
					t = 'string';
				} else {
					t = 'unknown';
				}
				// Add style object to the beginning of the styles array
				styles.unshift( { formatCode: f, type: t } );
			}

		}


		// --- Get worksheet info from "xl/worksheets/sheetX.xml" ---
		i = result.worksheets.length; // Initialize loop counter for worksheets

		// Loop through each worksheet to extract data
		while ( i-- ) {

			// Get the XML content of the current worksheet file
			s = zip.file( 'xl/worksheets/sheet' + ( i + 1 ) + '.xml' ).asText().split( '<row ' );

			w = result.worksheets[ i ]; // Get the current worksheet object

			// Check if the worksheet contains a table
			w.table = s[ 0 ].indexOf( '<tableParts ' ) > 0;

			// Extract dimension (max column and row) from the first part of the XML
			t = getAttr( s[ 0 ].substr( s[ 0 ].indexOf( '<dimension' ) ), 'ref' );
			t = t.substr( t.indexOf( ':' ) + 1 ); // Get the bottom-right cell reference
			w.maxCol = alphaNum( t.match( /[a-zA-Z]*/g )[0] ) + 1; // Convert column letter to 0-based index + 1
			w.maxRow = +t.match( /\d*/g ).join( '' ); // Extract row number

			w = w.data; // Reference the data array of the current worksheet

			j = s.length; // Initialize loop counter for rows

			// Loop through each row
			while ( --j ) { // Skip s[0] which is text before the first row tag
				// Get row number and initialize an empty array for the row
				row = w[ +getAttr( s[ j ], 'r' ) - 1 ] = [];
				columns = s[ j ].split( '<c ' ); // Split row XML by cell elements
				k = columns.length;               // Get the number of parts

				// Loop through each cell in the row
				while ( --k ) { // Skip columns[0] which is text before the first cell tag
					cell = columns[ k ]; // Current cell XML string

					// Get cell style, default to general if not found
					f = styles[ +getAttr( cell, 's' ) ] || { type: 'General', formatCode: 'General' };

					// Get cell type, default to format type if not specified
					t = getAttr( cell, 't' ) || f.type;

					// Extract cell value from <v> tag
					val = cell.substring( cell.indexOf( '<v>' ) + 3, cell.indexOf( '</v>' ) );

					// Convert value to number if it's a non-empty string, otherwise keep empty
					val = val ? +val : '';

					// Process value based on cell type
					switch ( t ) {
						case 's': // Shared string
							val = sharedStrings[ val ]; // Look up in shared strings array
							break;
						case 'b': // Boolean
							val = val === 1; // Convert 1/0 to true/false
							break;
						case 'date': // Date type (already handled by numFmt, but explicit here)
							val = convertDate( val ); // Convert Excel serial date to JS Date object
							break;
					}

					// Store the cell value and format code in the row array
					// Column index is derived from the 'r' attribute of the cell
					row[ alphaNum( getAttr( cell, 'r' ).match( /[a-zA-Z]*/g )[0] ) ] = { value: val, formatCode: f.formatCode };
				}
			}
		}

		// Record the total data processing time
		result.processTime = Date.now() - processTime;

	} else { // Branch for Saving (generating a new file from an object)

		processTime = Date.now(); // Record start time for generation

		sharedStrings = [[], 0]; // Initialize shared strings: [unique strings], total count

		// --- Generate static files ---

		// Create _rels folder and .rels file
		zip.folder( '_rels' ).file( '.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' );

		docProps = zip.folder( 'docProps' ); // Create docProps folder

		xl = zip.folder( 'xl' ); // Create xl folder
		xl.folder( 'theme' ).file( 'theme1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F497D"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2><a:accent1><a:srgbClr val="4F81BD"/></a:accent1><a:accent2><a:srgbClr val="C0504D"/></a:accent2><a:accent3><a:srgbClr val="9BBB59"/></a:accent3><a:accent4><a:srgbClr val="8064A2"/></a:accent4><a:accent5><a:srgbClr val="4BACC6"/></a:accent5><a:accent6><a:srgbClr val="F79646"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Cambria"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/><a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="??"/><a:font script="Hant" typeface="????"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/><a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="??"/><a:font script="Hant" typeface="????"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="1"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:shade val="51000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="80000"><a:schemeClr val="phClr"><a:shade val="93000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="94000"/><a:satMod val="135000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst><a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d><a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>' );
		xlWorksheets = xl.folder( 'worksheets' ); // Create xl/worksheets folder


		// --- Not content dependent (docProps/core.xml) ---
		docProps.file( 'core.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>'
			+ ( file.creator || 'XLSX.js' ) + '</dc:creator><cp:lastModifiedBy>' + ( file.lastModifiedBy || 'XLSX.js' ) + '</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">'
			+ ( file.created || new Date() ).toISOString() + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + ( file.modified || new Date() ).toISOString() + '</dcterms:modified></cp:coreProperties>' );


		// --- Content dependent initializations ---
		styles = new Array( 1 );   // Initialize styles array with a placeholder at index 0
		borders = new Array( 1 );  // Initialize borders array with a placeholder at index 0
		fonts = new Array( 1 );    // Initialize fonts array with a placeholder at index 0


		// Loop through each worksheet provided in the input file object (in reverse order)
		w = file.worksheets.length;
		while ( w-- ) {

			// Generate worksheet (sheetX.xml), collect shared strings, and handle table files.
			// Also generate entries for other constant files.
			id = w + 1; // Worksheet ID (1-based)

			// Get the current worksheet data and properties
			worksheet = file.worksheets[ w ];
			data = worksheet.data;

			s = ''; // Initialize string builder for worksheet XML content
			columns = []; // Array to store column properties (e.g., autoWidth, max content width)
			merges = [];  // Array to store merged cell ranges

			i = -1; // Initialize row counter (0-based)
			l = data.length; // Total number of rows

			// Iterate over each row in the worksheet data
			while ( ++i < l ) {

				j = -1; // Initialize column counter (0-based)
				k = data[ i ].length; // Total number of cells in the current row

				// Start the XML tag for the current row
				s += '<row r="' + ( i + 1 ) + '" x14ac:dyDescent="0.25">';

				// Iterate over each cell in the current row
				while ( ++j < k ) {

					cell = data[ i ][ j ]; // Get the current cell object or value
					val = cell.hasOwnProperty( 'value' ) ? cell.value : cell; // Extract cell value
					t = ''; // Initialize cell type (empty string for general/number)

					// Define cell style properties, supporting borders, alignment, format, and font
					style = {
						borders: cell.borders,
						hAlign: cell.hAlign,
						vAlign: cell.vAlign,
						bold: cell.bold,
						italic: cell.italic,
						fontName: cell.fontName,
						fontSize: cell.fontSize,
						formatCode: cell.formatCode || 'General' // Default format code
					};

					colWidth = 0; // Initialize column width for auto-sizing

					// Process cell value based on its type
					if ( val && typeof val === 'string' && !isFinite( val ) ) {
						// If value is a string and not a numeric string, treat as shared string
						val = escapeXML( val ); // Escape XML entities in the string
						sharedStrings[ 1 ]++; // Increment total count of shared strings

						// Check if the string already exists in the unique shared strings array
						index = sharedStrings[ 0 ].indexOf( val );
						colWidth = val.length; // Set column width based on string length

						if ( index < 0 ) {
							index = sharedStrings[ 0 ].push( val ) - 1; // Add new unique string
						}
						val = index; // Store reference to shared string index
						t = 's'; // Set cell type to 's' (shared string)

					} else if ( typeof val === 'boolean' ) {
						// If value is boolean, convert to 1 or 0
						val = ( val ? 1 : 0 );
						t = 'b'; // Set cell type to 'b' (boolean)
						colWidth = 1; // Boolean takes minimal width

					} else if ( typeOf( val ) === 'date' ) {
						// If value is a Date object, convert to Excel serial date
						val = convertDate( val );
						style.formatCode = cell.formatCode || 'mm-dd-yy'; // Default date format
						colWidth = ( '' + val ).length; // Estimate width based on stringified value

					} else if ( typeof val === 'object' ) {
						// Unsupported object type, set value to null
						val = null;

					} else {
						// Numeric value or string that represents a number
						colWidth = ( '' + val ).length; // Estimate width based on stringified value
					}

					// Convert style object to a JSON string to use as a unique key for style caching
					style = JSON.stringify( style );
					index = styles.indexOf( style ); // Check if this style already exists

					if ( index < 0 ) {
						style = styles.push( style ) - 1; // Add new unique style
					} else {
						style = index; // Reuse existing style index
					}

					// Update column auto-width information
					if ( columns[ j ] == null ) {
						columns[ j ] = { autoWidth: false, max: 0 }; // Initialize column data if first cell
					}
					if ( cell.autoWidth ) {
						columns[ j ].autoWidth = true; // Mark column for auto-width
					}
					if ( colWidth > columns[ j ].max ) {
						columns[ j ].max = colWidth; // Update max width for the column
					}

					// Handle merged cells (rowSpan, colSpan)
					if ( cell.colSpan > 1 ) {
						// Horizontal merge: B12:E12. Add 'placeholder' cells to the current row.
						merges.push( [ numAlpha( j ) + ( i + 1 ), numAlpha( j + cell.colSpan - 1 ) + ( i + 1 ) ] );
						merged = [ j, 0 ]; // Splice arguments: start index, delete count

						// Add placeholder cells for the merge
						for ( var m = 0; m < cell.colSpan - 1; m++ ) {
							merged.push( cell );
						}
						data[ i ].splice.apply( data[ i ], merged ); // Insert placeholder cells
						k += cell.colSpan - 1; // Adjust column counter for new cells

					} else if ( cell.rowSpan > 1 ) {
						// Vertical merge: B12:B15. Add 'placeholder' cells to subsequent rows.
						for ( var m = 1; m < cell.rowSpan; m++ ) {
							if ( data[ i + m ] ) {
								data[ i + m ].splice( j, 0, cell ); // Insert placeholder cell into next row
							} else {
								// Reached end of data, adjust rowSpan if necessary
								cell.rowSpan = m;
								break;
							}
						}
						merges.push( [ numAlpha( j ) + ( i + 1 ), numAlpha( j ) + ( i + cell.rowSpan ) ] );
					}

					if ( cell.rowSpan > 1 || cell.colSpan > 1 ) {
						// Delete original value and span properties from the cell
						// This ensures that copied cells don't also generate merges
						delete cell.value;
						delete cell.rowSpan;
						delete cell.colSpan;
					}

					// Build the XML for the current cell
					s += '<c r="' + numAlpha( j ) + ( i + 1 ) + '"' // Cell reference (e.g., A1)
						+ ( style ? ' s="' + style + '"' : '' ) // Style index if available
						+ ( t ? ' t="' + t + '"' : '' );      // Type attribute if available

					if ( val != null ) {
						// If value exists, include <f> (formula) and <v> (value) tags
						s += '>' + ( cell.formula ? '<f>' + cell.formula + '</f>' : '' ) + '<v>' + val + '</v></c>';
					} else {
						// If no value, use self-closing tag
						s += '/>';
					}
				}
				s += '</row>'; // Close the row XML tag
			}

			cols = []; // Initialize array for column definitions XML

			// Generate <col> tags for columns with autoWidth
			for ( i = 0; i < columns.length; i++ ) {
				if ( columns[ i ].autoWidth ) {
					cols.push( '<col min="', i + 1, '" max="', i + 1, '" width="', columns[ i ].max, '" bestFit="1"/>' );
				}
			}

			// Join column definitions into a single string if not empty
			if ( cols.length > 0 ) {
				cols = [ '<cols>' ].concat( cols, [ '</cols>' ] ).join( '' );
			}

			// Assemble the full worksheet XML content
			s = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'
				+ '<dimension ref="A1:' + numAlpha( data[ 0 ].length - 1 ) + data.length + '"/><sheetViews><sheetView '
				+ ( w === file.activeWorksheet ? 'tabSelected="1" ' : '' ) // Mark active tab
				+ ' workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/>'
				+ cols // Add column definitions
				+ '<sheetData>'
				+ s // Add row data
				+ '</sheetData>';

			// Add merge cells XML if there are any merges
			if ( merges.length > 0 ) {
				s += '<mergeCells count="' + merges.length + '">';
				for ( i = 0; i < merges.length; i++ ) {
					s += '<mergeCell ref="' + merges[ i ].join( ':' ) + '"/>';
				}
				s += '</mergeCells>';
			}

			// Add page margins XML
			s += '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>';

			// Add table parts XML if the worksheet has a table
			if ( worksheet.table ) {
				s += '<tableParts count="1"><tablePart r:id="rId1"/></tableParts>';
			}

			// Save the generated worksheet XML to the zip file
			xlWorksheets.file( 'sheet' + id + '.xml', s + '</worksheet>' );


			// If the worksheet contains a table, generate its associated files
			if ( worksheet.table ) {
				i = -1; // Reset counter
				l = data[ 0 ].length; // Number of columns in the first row
				t = numAlpha( data[ 0 ].length - 1 ) + data.length; // Bottom-right cell reference for the table

				// Generate tableX.xml content
				s = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="' + id
					+ '" name="Table' + id + '" displayName="Table' + id + '" ref="A1:' + t + '" totalsRowShown="0"><autoFilter ref="A1:' + t + '"/><tableColumns count="' + data[ 0 ].length + '">';
				while ( ++i < l ) {
					// Add tableColumn for each column, using the first row's value as name
					s += '<tableColumn id="' + ( i + 1 ) + '" name="' + ( data[ 0 ][ i ].hasOwnProperty( 'value' ) ? data[ 0 ][ i ].value : data[ 0 ][ i ] ) + '"/>';
				}
				s += '</tableColumns><tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/></table>';

				xl.folder( 'tables' ).file( 'table' + id + '.xml', s ); // Save table XML

				// Generate sheetX.xml.rels for table relationship
				xlWorksheets.folder( '_rels' ).file( 'sheet' + id + '.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table' + id + '.xml"/></Relationships>' );

				// Add content type override for table XML
				contentTypes[ 1 ].unshift( '<Override PartName="/xl/tables/table' + id + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>' );
			}

			// Add content type override for worksheet XML
			contentTypes[ 0 ].unshift( '<Override PartName="/xl/worksheets/sheet' + id + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' );

			// Add worksheet name to properties list for docProps/app.xml
			props.unshift( escapeXML( worksheet.name ) || 'Sheet' + id );

			// Add relationship for the worksheet to xl/_rels/workbook.xml.rels
			xlRels.unshift( '<Relationship Id="rId' + id + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + id + '.xml"/>' );

			// Add sheet entry for xl/workbook.xml
			worksheets.unshift( '<sheet name="' + ( escapeXML( worksheet.name ) || 'Sheet' + id ) + '" sheetId="' + id + '" r:id="rId' + id + '"/>' );
		}


		// --- Generate xl/styles.xml ---
		i = styles.length; // Start from the last collected style (index 0 is placeholder)
		t = [];            // Array to hold custom number format XML strings

		// Process each unique style collected from worksheets
		while ( --i ) {
			// Skip the initial placeholder style at index 0
			style = JSON.parse( styles[ i ] ); // Parse the JSON string back into an object

			// Handle number format declaration
			if ( style.formatCode !== 'General' ) {
				index = numFmts.indexOf( style.formatCode ); // Check if format code is a standard one
				if ( index < 0 ) {
					index = 164 + t.length; // Assign a new ID for custom format codes (start from 164)
					t.push( '<numFmt formatCode="' + style.formatCode + '" numFmtId="' + index + '"/>' ); // Add to custom formats
				}
				style.formatCode = index; // Use the found or new format ID
			} else {
				style.formatCode = 0; // 'General' format maps to ID 0
			}

			// Handle border declaration
			borderIndex = 0; // Default border index (no border)
			if ( style.borders ) {
				border = [ '<border>' ]; // Start border XML
				// Iterate through border edges in a specific order
				for ( var edge in { left: 0, right: 0, top: 0, bottom: 0, diagonal: 0 } ) {
					if ( style.borders[ edge ] ) {
						var color = style.borders[ edge ];
						// Add transparency prefix if missing (RRGGBB -> FFRRGGBB)
						if ( color.length === 6 ) {
							color = 'FF' + color;
						}
						border.push( '<', edge, ' style="thin">', '<color rgb="', color, '"/></', edge, '>' );
					} else {
						border.push( '<', edge, '/>' ); // Add empty tag for no border on this edge
					}
				}
				border.push( '</border>' ); // Close border XML
				border = border.join( '' ); // Join into a single string

				borderIndex = borders.indexOf( border ); // Check if this border definition already exists
				if ( borderIndex < 0 ) {
					borderIndex = borders.push( border ) - 1; // Add new unique border
				}
			}

			// Handle font declaration
			fontIndex = 0; // Default font index (default font)
			if ( style.bold || style.italic || style.fontSize || style.fontName ) {
				font = [ '<font>' ]; // Start font XML
				if ( style.bold ) {
					font.push( '<b/>' ); // Bold tag
				}
				if ( style.italic ) {
					font.push( '<i/>' ); // Italic tag
				}
				font.push( '<sz val="', style.fontSize || defaultFontSize, '"/>' ); // Font size
				font.push( '<color theme="1"/>' ); // Default color theme
				font.push( '<name val="', style.fontName || defaultFontName, '"/>' ); // Font name
				font.push( '<family val="2"/>', '</font>' ); // Font family and close tag
				font = font.join( '' ); // Join into a single string

				fontIndex = fonts.indexOf( font ); // Check if this font definition already exists
				if ( fontIndex < 0 ) {
					fontIndex = fonts.push( font ) - 1; // Add new unique font
				}
			}

			// Assemble the <xf> (cell format) XML for the current style
			styles[ i ] = [ '<xf xfId="0" fillId="0" borderId="',
				borderIndex,
				'" fontId="',
				fontIndex,
				'" numFmtId="',
				style.formatCode,
				'" ',
				( style.hAlign || style.vAlign ? 'applyAlignment="1" ' : ' ' ), // Apply alignment if present
				( style.formatCode > 0 ? 'applyNumberFormat="1" ' : ' ' ),     // Apply number format if custom
				( borderIndex > 0 ? 'applyBorder="1" ' : ' ' ),               // Apply border if custom
				( fontIndex > 0 ? 'applyFont="1" ' : ' ' ),                 // Apply font if custom
				'>'
			];

			// Add alignment XML if horizontal or vertical alignment is specified
			if ( style.hAlign || style.vAlign ) {
				styles[ i ].push( '<alignment' );
				if ( style.hAlign ) {
					styles[ i ].push( ' horizontal="', style.hAlign, '"' );
				}
				if ( style.vAlign ) {
					styles[ i ].push( ' vertical="', style.vAlign, '"' );
				}
				styles[ i ].push( '/>' );
			}
			styles[ i ].push( '</xf>' ); // Close xf tag
			styles[ i ] = styles[ i ].join( '' ); // Join into a single string
		}

		// Prepare custom number formats XML string
		t = t.length ? '<numFmts count="' + t.length + '">' + t.join( '' ) + '</numFmts>' : '';


		// Write the xl/styles.xml file
		xl.file( 'styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'
			+ t + '<fonts count="' + fonts.length + '" x14ac:knownFonts="1"><font><sz val="' + defaultFontSize + '"/><color theme="1"/><name val="' + defaultFontName + '"/><family val="2"/>'
			+ '<scheme val="minor"/></font>' + fonts.join( '' ) + '</fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
			+ '<borders count="' + borders.length + '"><border><left/><right/><top/><bottom/><diagonal/></border>'
			+ borders.join( '' ) + '</borders><cellStyleXfs count="1">'
			+ '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="' + styles.length + '"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
			+ styles.join( '' ) + '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/>'
			+ '<tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>'
			+ '<extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main">'
			+ '<x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext></extLst></styleSheet>' );


		// --- Generate [Content_Types].xml ---
		zip.file( '[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
			+ contentTypes[ 0 ].join( '' ) + '<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
			+ contentTypes[ 1 ].join( '' ) + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>' );


		// --- Generate docProps/app.xml ---
		docProps.file( 'app.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>XLSX.js</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>'
			+ file.worksheets.length + '</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="' + props.length + '" baseType="lpstr"><vt:lpstr>' + props.join( '</vt:lpstr><vt:lpstr>' )
			+ '</vt:lpstr></vt:vector></TitlesOfParts><Manager></Manager><Company>Microsoft Corporation</Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>1.0</AppVersion></Properties>' );


		// --- Generate xl/_rels/workbook.xml.rels ---
		xl.folder( '_rels' ).file( 'workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
			+ xlRels.join( '' ) + '<Relationship Id="rId' + ( xlRels.length + 1 ) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>'
			+ '<Relationship Id="rId' + ( xlRels.length + 2 ) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
			+ '<Relationship Id="rId' + ( xlRels.length + 3 ) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>' );


		// --- Generate xl/sharedStrings.xml ---
		xl.file( 'sharedStrings.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="'
			+ sharedStrings[ 1 ] + '" uniqueCount="' + sharedStrings[ 0 ].length + '"><si><t>' + sharedStrings[ 0 ].join( '</t></si><si><t>' ) + '</t></si></sst>' );


		// --- Generate xl/workbook.xml ---
		xl.file( 'workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
			+ '<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="9303"/><workbookPr defaultThemeVersion="124226"/><bookViews><workbookView '
			+ ( file.activeWorksheet ? 'activeTab="' + file.activeWorksheet + '" ' : '' ) + 'xWindow="480" yWindow="60" windowWidth="18195" windowHeight="8505"/></bookViews><sheets>'
			+ worksheets.join( '' ) + '</sheets><calcPr fullCalcOnLoad="1"/></workbook>' );


		processTime = Date.now() - processTime; // Calculate total processing time
		zipTime = Date.now();                   // Record start time for zipping

		// Generate the final base64 encoded zip file
		result = {
			base64: zip.generate( { compression: 'DEFLATE' } ), // Generate compressed base64 string
			zipTime: Date.now() - zipTime,                      // Time taken for zipping
			processTime: processTime,                           // Time taken for processing
			href: function () {
				// Helper function to create a data URI for direct download
				return 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + this.base64;
			}
		};

	}

	return result; // Return the result object

}


// Node.js export for CommonJS environments
if ( typeof exports === 'object' && typeof module === 'object' ) {
	module.exports = xlsx;
}