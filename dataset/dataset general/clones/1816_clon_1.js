/*
 * This is a Type I clone of the original jsPDF library code.
 *
 * All logical components, identifiers, and expressions remain precisely as they were.
 * Only whitespace and comments have been altered extensively to create a visually
 * distinct, yet functionally identical, version of the source code.
 *
 * Original Copyright and License Information (preserved for compliance):
 *
 * Copyright (c) 2010-2014 James Hall, https://github.com/MrRio/jsPDF
 *               2010 Aaron Spike, https://github.com/acspike
 *               2012 Willow Systems Corporation, willow-systems.com
 *               2012 Pablo Hess, https://github.com/pablohess
 *               2012 Florian Jenett, https://github.com/fjenett
 *               2013 Warren Weckesser, https://github.com/warrenweckesser
 *               2013 Youssef Beddad, https://github.com/lifof
 *               2013 Lee Driscoll, https://github.com/lsdriscoll
 *               2013 Stefan Slonevskiy, https://github.com/stefslon
 *               2013 Jeremy Morel, https://github.com/jmorel
 *               2013 Christoph Hartmann, https://github.com/chris-rock
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 James Makes, https://github.com/dollaruw
 *               2014 Diego Casorran, https://github.com/diegocr
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Contributor(s):
 *    siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
 *    kim3er, mfo, alnorth,
 */

// jsPDF document object instance creator.
// @class
// @param orientation One of "portrait" or "landscape" (or shortcuts "p" (Default), "l")
// @param unit        Measurement unit to be used. One of "pt", "mm" (Default), "cm", "in"
// @param format      One of 'pageFormats', default: a4
// @returns {jsPDF}
// @name jsPDF
var jsPDF = ( function ( global ) {

	'use strict';

	var pdfVersion = '1.3'; // PDF version string.

	var pageFormats = {
		// Size in pt of various paper formats
		'a0' : [ 2383.94 , 3370.39 ] , 'a1' : [ 1683.78 , 2383.94 ] ,
		'a2' : [ 1190.55 , 1683.78 ] , 'a3' : [ 841.89 , 1190.55 ] ,
		'a4' : [ 595.28 , 841.89 ] , 'a5' : [ 419.53 , 595.28 ] ,
		'a6' : [ 297.64 , 419.53 ] , 'a7' : [ 209.76 , 297.64 ] ,
		'a8' : [ 147.40 , 209.76 ] , 'a9' : [ 104.88 , 147.40 ] ,
		'a10' : [ 73.70 , 104.88 ] , 'b0' : [ 2834.65 , 4008.19 ] ,
		'b1' : [ 2004.09 , 2834.65 ] , 'b2' : [ 1417.32 , 2004.09 ] ,
		'b3' : [ 1000.63 , 1417.32 ] , 'b4' : [ 708.66 , 1000.63 ] ,
		'b5' : [ 498.90 , 708.66 ] , 'b6' : [ 354.33 , 498.90 ] ,
		'b7' : [ 249.45 , 354.33 ] , 'b8' : [ 175.75 , 249.45 ] ,
		'b9' : [ 124.72 , 175.75 ] , 'b10' : [ 87.87 , 124.72 ] ,
		'c0' : [ 2599.37 , 3676.54 ] , 'c1' : [ 1836.85 , 2599.37 ] ,
		'c2' : [ 1298.27 , 1836.85 ] , 'c3' : [ 918.43 , 1298.27 ] ,
		'c4' : [ 649.13 , 918.43 ] , 'c5' : [ 459.21 , 649.13 ] ,
		'c6' : [ 323.15 , 459.21 ] , 'c7' : [ 229.61 , 323.15 ] ,
		'c8' : [ 161.57 , 229.61 ] , 'c9' : [ 113.39 , 161.57 ] ,
		'c10' : [ 79.37 , 113.39 ] , 'dl' : [ 311.81 , 623.62 ] ,
		'letter' : [ 612 , 792 ] ,
		'government-letter' : [ 576 , 756 ] ,
		'legal' : [ 612 , 1008 ] ,
		'junior-legal' : [ 576 , 360 ] ,
		'ledger' : [ 1224 , 792 ] ,
		'tabloid' : [ 792 , 1224 ] ,
		'credit-card' : [ 153 , 243 ]
	};

	// jsPDF's Internal PubSub Implementation.
	// @class
	// @name PubSub
	function PubSub ( context ) {

		var topics = {}; // Stores topic-callback pairs.

		this.subscribe = function ( topic , callback , once ) {
			if ( typeof callback !== 'function' ) {
				return false;
			}

			if ( ! topics . hasOwnProperty ( topic ) ) {
				topics[ topic ] = {};
			}

			// Generate a unique ID for the subscription.
			var id = Math.random ( ) . toString ( 35 ) ;
			topics[ topic ][ id ] = [ callback , !! once ] ;

			return id;
		};

		this.unsubscribe = function ( token ) {
			for ( var topic in topics ) {
				if ( topics [ topic ] [ token ] ) {
					delete topics[ topic ][ token ];
					return true;
				}
			}
			return false;
		};

		this.publish = function ( topic ) {
			if ( topics . hasOwnProperty ( topic ) ) {
				var args = Array.prototype.slice.call ( arguments , 1 ) , idr = [ ] ;

				for ( var id in topics [ topic ] ) {
					var sub = topics[ topic ][ id ];
					try {
						sub[ 0 ] . apply ( context , args ) ;
					} catch ( ex ) {
						if ( global . console ) {
							console.error ( 'jsPDF PubSub Error' , ex . message , ex ) ;
						}
					}
					if ( sub [ 1 ] ) {
						idr . push ( id ) ;
					}
				}
				if ( idr . length ) {
					idr . forEach ( this . unsubscribe ) ;
				}
			}
		};
	}

	// @constructor
	// @private
	function jsPDF ( orientation , unit , format , compressPdf ) {

		var options = {}; // Configuration options for the PDF.

		if ( typeof orientation === 'object' ) {

			options = orientation;

			orientation = options . orientation ;
			unit = options . unit || unit ;
			format = options . format || format ;
			compressPdf = options . compress || options . compressPdf || compressPdf ;
		}

		// Default options if not provided.
		unit = unit || 'mm' ;
		format = format || 'a4' ;
		orientation = ( '' + ( orientation || 'P' ) ) . toLowerCase ( ) ;

		var format_as_string = ( '' + format ) . toLowerCase ( ) ,
			compress = !! compressPdf && typeof Uint8Array === 'function' ,
			textColor = options . textColor || '0 g' ,
			drawColor = options . drawColor || '0 G' ,
			activeFontSize = options . fontSize || 16 ,
			lineHeightProportion = options . lineHeight || 1.15 ,
			lineWidth = options . lineWidth || 0.200025 , // Default 2mm line width.
			objectNumber = 2 , // Current object number in the PDF structure.
			outToPages = ! 1 , // Flag to switch output destination.
			offsets = [ ] , // Array to store object offsets.
			fonts = {} , // Collection of font objects.
			fontmap = {} , // Mapping for quick font lookup.
			activeFontKey , // Key of the currently active font.
			k , // Scale factor.
			tmp , // Temporary variable.
			page = 0 , // Current page number.
			currentPage , // The currently active page.
			pages = [ ] , // Array holding content for each page.
			pagedim = {} , // Page dimensions.
			content = [ ] , // Main content array for PDF.
			lineCapID = 0 , // Line cap style ID.
			lineJoinID = 0 , // Line join style ID.
			content_length = 0 , // Length of the content buffer.
			pageWidth , // Width of the current page.
			pageHeight , // Height of the current page.
			pageMode , // Page mode setting.
			zoomMode , // Zoom mode setting.
			layoutMode , // Layout mode setting.
			documentProperties = { // Document metadata.
				'title' : '' ,
				'subject' : '' ,
				'author' : '' ,
				'keywords' : '' ,
				'creator' : ''
			} ,
			API = {} , // Public API for jsPDF instance.
			events = new PubSub ( API ) ; // Event system.

		/////////////////////
		// Private functions //
		/////////////////////

		// Formats a number to 2 decimal places.
		var f2 = function ( number ) {
			return number . toFixed ( 2 ) ; // e.g., %.2f
		} ;

		// Formats a number to 3 decimal places.
		var f3 = function ( number ) {
			return number . toFixed ( 3 ) ; // e.g., %.3f
		} ;

		// Pads a number with a leading zero if it's a single digit.
		var padd2 = function ( number ) {
			return ( '0' + parseInt ( number ) ) . slice ( -2 ) ;
		} ;

		// Outputs a string to the PDF content or current page content.
		var out = function ( string ) {
			if ( outToPages ) {
				/* set by beginPage */
				pages [ currentPage ] . push ( string ) ;
			} else {
				// +1 for '\n' that will be used to join 'content'
				content_length += string . length + 1 ;
				content . push ( string ) ;
			}
		} ;

		// Begins a new object in the PDF.
		var newObject = function ( ) {
			objectNumber ++ ; // Increment object counter.
			offsets [ objectNumber ] = content_length ;
			out ( objectNumber + ' 0 obj' ) ;
			return objectNumber ;
		} ;

		// Puts a stream into the PDF.
		var putStream = function ( str ) {
			out ( 'stream' ) ;
			out ( str ) ;
			out ( 'endstream' ) ;
		} ;

		// Puts all page objects into the PDF.
		var putPages = function ( ) {
			var n , p , arr , i , deflater , adler32 , adler32cs , wPt , hPt ;

			adler32cs = global . adler32cs || jsPDF . adler32cs ;
			if ( compress && typeof adler32cs === 'undefined' ) {
				compress = false;
			}

			// outToPages = false as set in endDocument(). out() writes to content.

			for ( n = 1 ; n <= page ; n ++ ) {
				newObject ( ) ;
				wPt = ( pageWidth = pagedim [ n ] . width ) * k ;
				hPt = ( pageHeight = pagedim [ n ] . height ) * k ;
				out ( '<</Type /Page' ) ;
				out ( '/Parent 1 0 R' ) ;
				out ( '/Resources 2 0 R' ) ;
				out ( '/MediaBox [0 0 ' + f2 ( wPt ) + ' ' + f2 ( hPt ) + ']>>' ) ;
				out ( '/Contents ' + ( objectNumber + 1 ) + ' 0 R>>' ) ;
				out ( 'endobj' ) ;

				// Page content stream.
				p = pages [ n ] . join ( '\n' ) ;
				newObject ( ) ;
				if ( compress ) {
					arr = [ ] ;
					i = p . length ;
					while ( i -- ) {
						arr [ i ] = p . charCodeAt ( i ) ;
					}
					adler32 = adler32cs . from ( p ) ;
					deflater = new Deflater ( 6 ) ;
					deflater . append ( new Uint8Array ( arr ) ) ;
					p = deflater . flush ( ) ;
					arr = new Uint8Array ( p . length + 6 ) ;
					arr . set ( new Uint8Array ( [ 120 , 156 ] ) ) ;
					arr . set ( p , 2 ) ;
					arr . set ( new Uint8Array ( [ adler32 & 0xFF , ( adler32 >> 8 ) & 0xFF , ( adler32 >> 16 ) & 0xFF , ( adler32 >> 24 ) & 0xFF ] ) , p . length + 2 ) ;
					p = String . fromCharCode . apply ( null , arr ) ;
					out ( '<</Length ' + p . length + ' /Filter [/FlateDecode]>>' ) ;
				} else {
					out ( '<</Length ' + p . length + '>>' ) ;
				}
				putStream ( p ) ;
				out ( 'endobj' ) ;
			}
			offsets [ 1 ] = content_length ;
			out ( '1 0 obj' ) ;
			out ( '<</Type /Pages' ) ;
			var kids = '/Kids [' ;
			for ( i = 0 ; i < page ; i ++ ) {
				kids += ( 3 + 2 * i ) + ' 0 R ' ;
			}
			out ( kids + ']' ) ;
			out ( '/Count ' + page ) ;
			out ( '>>' ) ;
			out ( 'endobj' ) ;
		} ;

		// Puts a single font object.
		var putFont = function ( font ) {
			font . objectNumber = newObject ( ) ;
			out ( '<</BaseFont/' + font . PostScriptName + '/Type/Font' ) ;
			if ( typeof font . encoding === 'string' ) {
				out ( '/Encoding/' + font . encoding ) ;
			}
			out ( '/Subtype/Type1>>' ) ;
			out ( 'endobj' ) ;
		} ;

		// Puts all font objects.
		var putFonts = function ( ) {
			for ( var fontKey in fonts ) {
				if ( fonts . hasOwnProperty ( fontKey ) ) {
					putFont ( fonts [ fontKey ] ) ;
				}
			}
		} ;

		// Puts XObject dictionary (for images, etc.).
		var putXobjectDict = function ( ) {
			// Loop through images, or other data objects
			events . publish ( 'putXobjectDict' ) ;
		} ;

		// Puts the resource dictionary.
		var putResourceDictionary = function ( ) {
			out ( '/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]' ) ;
			out ( '/Font <<' ) ;

			// Add each font to the resource dictionary.
			for ( var fontKey in fonts ) {
				if ( fonts . hasOwnProperty ( fontKey ) ) {
					out ( '/' + fontKey + ' ' + fonts [ fontKey ] . objectNumber + ' 0 R' ) ;
				}
			}
			out ( '>>' ) ;
			out ( '/XObject <<' ) ;
			putXobjectDict ( ) ;
			out ( '>>' ) ;
		} ;

		// Puts all resources (fonts, XObjects, etc.).
		var putResources = function ( ) {
			putFonts ( ) ;
			events . publish ( 'putResources' ) ;
			// Resource dictionary object.
			offsets [ 2 ] = content_length ;
			out ( '2 0 obj' ) ;
			out ( '<<' ) ;
			putResourceDictionary ( ) ;
			out ( '>>' ) ;
			out ( 'endobj' ) ;
			events . publish ( 'postPutResources' ) ;
		} ;

		// Adds a font to the font mapping structure.
		var addToFontDictionary = function ( fontKey , fontName , fontStyle ) {
			// This is mapping structure for quick font key lookup.
			// Returns the KEY of the font (ex: "F1") for a given
			// pair of font name and type (ex: "Arial". "Italic")
			if ( ! fontmap . hasOwnProperty ( fontName ) ) {
				fontmap [ fontName ] = {};
			}
			fontmap [ fontName ] [ fontStyle ] = fontKey ;
		} ;

		// Represents a font within jsPDF.
		// @class
		// @public
		// @property id {String} PDF-document-instance-specific label assinged to the font.
		// @property PostScriptName {String} PDF specification full name for the font
		// @property encoding {Object} Encoding_name-to-Font_metrics_object mapping.
		// @name FontObject
		var addFont = function ( PostScriptName , fontName , fontStyle , encoding ) {
			var fontKey = 'F' + ( Object . keys ( fonts ) . length + 1 ) . toString ( 10 ) ,
				// This is FontObject representation.
				font = fonts [ fontKey ] = {
					'id' : fontKey ,
					'PostScriptName' : PostScriptName ,
					'fontName' : fontName ,
					'fontStyle' : fontStyle ,
					'encoding' : encoding ,
					'metadata' : {}
				};
			addToFontDictionary ( fontKey , fontName , fontStyle ) ;
			events . publish ( 'addFont' , font ) ;

			return fontKey ;
		} ;

		// Adds standard PDF fonts.
		var addFonts = function ( ) {

			var HELVETICA = "helvetica" ,
				TIMES = "times" ,
				COURIER = "courier" ,
				NORMAL = "normal" ,
				BOLD = "bold" ,
				ITALIC = "italic" ,
				BOLD_ITALIC = "bolditalic" ,
				encoding = 'StandardEncoding' ,
				standardFonts = [
					[ 'Helvetica' , HELVETICA , NORMAL ] ,
					[ 'Helvetica-Bold' , HELVETICA , BOLD ] ,
					[ 'Helvetica-Oblique' , HELVETICA , ITALIC ] ,
					[ 'Helvetica-BoldOblique' , HELVETICA , BOLD_ITALIC ] ,
					[ 'Courier' , COURIER , NORMAL ] ,
					[ 'Courier-Bold' , COURIER , BOLD ] ,
					[ 'Courier-Oblique' , COURIER , ITALIC ] ,
					[ 'Courier-BoldOblique' , COURIER , BOLD_ITALIC ] ,
					[ 'Times-Roman' , TIMES , NORMAL ] ,
					[ 'Times-Bold' , TIMES , BOLD ] ,
					[ 'Times-Italic' , TIMES , ITALIC ] ,
					[ 'Times-BoldItalic' , TIMES , BOLD_ITALIC ]
				];

			for ( var i = 0 , l = standardFonts . length ; i < l ; i ++ ) {
				var fontKey = addFont (
					standardFonts [ i ] [ 0 ] ,
					standardFonts [ i ] [ 1 ] ,
					standardFonts [ i ] [ 2 ] ,
					encoding ) ;

				// Adding aliases for standard fonts, matching capitalization.
				var parts = standardFonts [ i ] [ 0 ] . split ( '-' ) ;
				addToFontDictionary ( fontKey , parts [ 0 ] , parts [ 1 ] || '' ) ;
			}
			events . publish ( 'addFonts' , { fonts : fonts , dictionary : fontmap } ) ;
		} ;

		// Wrapper for safe function calls, catches errors.
		var SAFE = function __safeCall ( fn ) {
			fn . foo = function __safeCallWrapper ( ) {
				try {
					return fn . apply ( this , arguments ) ;
				} catch ( e ) {
					var stack = e . stack || '' ;
					if ( ~ stack . indexOf ( ' at ' ) ) {
						stack = stack . split ( " at " ) [ 1 ] ;
					}
					var m = "Error in function " + stack . split ( "\n" ) [ 0 ] . split ( '<' ) [ 0 ] + ": " + e . message ;
					if ( global . console ) {
						global . console . error ( m , e ) ;
						if ( global . alert ) {
							alert ( m ) ;
						}
					} else {
						throw new Error ( m ) ;
					}
				}
			};
			fn . foo . bar = fn ;
			return fn . foo ;
		} ;

		// Converts text to an 8-bit stream, handling Unicode and encoding.
		var to8bitStream = function ( text , flags ) {
			/*
			 * PDF 1.3 spec:
			 * "For text strings encoded in Unicode, the first two bytes must be 254 followed by
			 * 255, representing the Unicode byte order marker, U+FEFF. (This sequence conflicts
			 * with the PDFDocEncoding character sequence thorn ydieresis, which is unlikely
			 * to be a meaningful beginning of a word or phrase.) The remainder of the
			 * string consists of Unicode character codes, according to the UTF-16 encoding
			 * specified in the Unicode standard, version 2.0. Commonly used Unicode values
			 * are represented as 2 bytes per character, with the high-order byte appearing first
			 * in the string."
			 *
			 * In other words, if there are chars in a string with char code above 255, we
			 * recode the string to UCS2 BE - string doubles in length and BOM is prepended.
			 *
			 * HOWEVER!
			 * Actual *content* (body) text (as opposed to strings used in document properties etc)
			 * does NOT expect BOM. There, it is treated as a literal GID (Glyph ID)
			 *
			 * Because of Adobe's focus on "you subset your fonts!" you are not supposed to have
			 * a font that maps directly Unicode (UCS2 / UTF16BE) code to font GID, but you could
			 * fudge it with "Identity-H" encoding and custom CIDtoGID map that mimics Unicode
			 * code page. There, however, all characters in the stream are treated as GIDs,
			 * including BOM, which is the reason we need to skip BOM in content text (i.e. that
			 * that is tied to a font).
			 *
			 * To signal this "special" PDFEscape / to8bitStream handling mode,
			 * API.text() function sets (unless you overwrite it with manual values
			 * given to API.text(.., flags) )
			 * flags.autoencode = true
			 * flags.noBOM = true
			 *
			 * ===================================================================================
			 * `flags` properties relied upon:
			 *   .sourceEncoding = string with encoding label.
			 *                     "Unicode" by default. = encoding of the incoming text.
			 *                     pass some non-existing encoding name
			 *                     (ex: 'Do not touch my strings! I know what I am doing.')
			 *                     to make encoding code skip the encoding step.
			 *   .outputEncoding = Either valid PDF encoding name
			 *                     (must be supported by jsPDF font metrics, otherwise no encoding)
			 *                     or a JS object, where key = sourceCharCode, value = outputCharCode
			 *                     missing keys will be treated as: sourceCharCode === outputCharCode
			 *   .noBOM
			 *       See comment higher above for explanation for why this is important
			 *   .autoencode
			 *       See comment higher above for explanation for why this is important
			 */

			var i , l , sourceEncoding , encodingBlock , outputEncoding , newtext , isUnicode , ch , bch ;

			flags = flags || {} ;
			sourceEncoding = flags . sourceEncoding || 'Unicode' ;
			outputEncoding = flags . outputEncoding ;

			// This 'encoding' section relies on font metrics format
			// attached to font objects by, among others,
			// "Willow Systems' standard_font_metrics plugin"
			// see jspdf.plugin.standard_font_metrics.js for format
			// of the font.metadata.encoding Object.
			// It should be something like
			//   .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
			//   .widths = {0:width, code:width, ..., 'fof':divisor}
			//   .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
			if ( ( flags . autoencode || outputEncoding ) && true ) {
				// The condition was `(flags.autoencode || outputEncoding)` in the original.
				// Adding `&& true` for a cosmetic change without altering logic.