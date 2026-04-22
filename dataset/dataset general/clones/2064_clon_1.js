( function ( window , $ , undefined ) {
    // This is a self-executing anonymous function, a common pattern in JavaScript
    // for creating a private scope and avoiding global variable pollution.
    // 'window' and '$' are passed in, 'undefined' is explicitly passed to ensure its value.
    "use strict"; // Enforces stricter parsing and error handling in the code.

    /**
     * @class KeySet
     * @description Represents a set of keys for rendering text, specifically designed for SVG output.
     * @param {string} format - The desired output format, currently only 'svg' is supported.
     * @param {object} font - The font object containing glyph data and metrics.
     * @throws {string} If an unsupported rendering output format is provided.
     */
    var KeySet = function ( format , font ) {
        // Constructor for the KeySet class.
        // It validates the format and stores the font object.
        if ( format !== 'svg' ) {
            // Check if the provided format is 'svg'.
            // If not, throw an error as other formats are not implemented.
            throw 'Unsupported rendering output format';
        }
        // Store the font object as an instance property.
        this.font = font;
    };

    // Define methods for the KeySet prototype, making them available to all KeySet instances.
    KeySet.prototype = {
        /**
         * @method render
         * @description Renders a given text string as an SVG representation using the loaded font.
         * @param {string} text - The text string to be rendered.
         * @param {number} height - The desired height of the SVG output.
         * @returns {string} An SVG string representing the rendered text.
         */
        render : function ( text , height ) {
            // Retrieve glyph IDs for the input text from the font.
            var glyphIds = this.font.getTextAsGlyphIds ( text ) ,
                // Initialize x-offset for positioning glyphs.
                xOffset = 0 ,
                // Initialize the output SVG string.
                output = '' ,
                // Initialize maximum Y coordinate (though not used in this specific implementation).
                maxY = 0 ;

            // Iterate through each glyph ID to render its SVG path.
            for ( var i in glyphIds ) {
                // Get horizontal metrics for the current glyph.
                var hmtx = this.font.getHmtxForChar ( glyphIds[i] ) ;
                // Get kerning value for the current glyph pair (current and previous).
                // If i-1 is invalid, getKernForPair should handle it (e.g., return 0).
                var kern = this.font.getKernForPair ( glyphIds[i - 1] , glyphIds[i] ) ;
                // Get the actual glyph object from the font's glyf table.
                var glyph = this.font.glyf.glyphs [ glyphIds[i] ] ;
                // Initialize a temporary string for the wrapped glyph SVG.
                var wrapped = '' ;

                try {
                    // Attempt to generate the SVG path for the glyph.
                    if ( glyph ) {
                        // If a glyph exists, generate its SVG path data.
                        var path = getGlyphAsSVGPath ( glyph ) ;
                        // Wrap the glyph path in an SVG group (<g>) element with a transform.
                        // The transform translates the glyph based on xOffset, leftSideBearing, and kerning.
                        wrapped = '<g transform="translate(' + ( xOffset + Math.max ( hmtx.leftSideBearing , 0 ) + kern ) + ', 0)">\n' + path + '\n</g>' ;
                    }
                } catch ( e ) {
                    // Log any errors encountered during glyph rendering.
                    console.log ( 'error rendering "' + text[i] + '": ' + e ) ;
                }
                // Append the wrapped glyph SVG to the total output.
                output += wrapped ;
                // Update the x-offset for the next glyph.
                xOffset += ( hmtx.advanceWidth + kern ) ;
            }

            // Add a red baseline indicator to the SVG output.
            output += '\n<line x1="0" y1="0" x2="' + xOffset + '" y2="0" style="stroke-width: 10; stroke: red;"/>' ;
            // Calculate the actual height of the font from ascender and descender values.
            var actualHeight = this.font.hhea.ascender - this.font.hhea.descender ;
            // Wrap all glyphs and the baseline in another SVG group, applying a Y-axis translation and a vertical flip.
            // This aligns the text correctly within the SVG coordinate system (Y-axis up).
            var wholeWord = '<g transform="translate(0,' + this.font.hhea.ascender + ') scale(1,-1)">\n' + output + '\n</g>' ;
            // Construct the final SVG element, including height, viewBox, and XML namespaces.
            var svg = '<svg height="' + height + 'px" viewBox="0 ' + this.font.hhea.descender + ' ' + xOffset + ' ' +
                      ( actualHeight - this.font.hhea.descender ) + '" xmlns="http://www.w3.org/2000/svg" version="1.1">\n' + wholeWord +
                      '\n</svg>' ;
            // Return the complete SVG string.
            return svg ;
        }
    };

    // A simple cache object, likely for memoizing glyph paths or other font-related data.
    var cache = {} ;

    /**
     * @function getGlyphAsSVGPath
     * @description Converts a glyph object's outline data into an SVG path string.
     * @param {object} glyph - The glyph object containing contour and point data.
     * @returns {string} An SVG path data string.
     */
    function getGlyphAsSVGPath ( glyph ) {
        // Get the bounding box of the glyph (not used directly in path generation here, but useful for info).
        var bb = glyph.boundingBox ;
        // Start building the SVG path string.
        var svg = '<path d="' ;

        // Get segmented points, coordinates, and flags for the glyph's contours.
        var segments = glyph.getSegmentedPoints ( ) ;
        var xcoords = segments.xcoords ,
            ycoords = segments.ycoords ,
            flags = segments.flags ;

        // Iterate through each contour of the glyph.
        for ( var i = 0 ; i < glyph.getContourCount ( ) ; i++ ) {
            // Iterate through the points/flags within the current contour.
            for ( var k = 0 ; k < flags[i].length ; k++ ) {
                if ( k === 0 ) {
                    // For the first point of a contour, use 'M' (moveto) command.
                    svg += " M" + xcoords[i][k] + ',' + ycoords[i][k] ;
                } else if ( flags[i][k] & 0x01 ) {
                    // If the flag indicates an on-curve point, use 'L' (lineto) command.
                    svg += " L" + xcoords[i][k] + ',' + ycoords[i][k] ;
                } else {
                    // If it's an off-curve point, it could be part of a quadratic or cubic Bezier curve.
                    if ( flags[i][k + 1] & 0x01 || k === flags[i].length - 2 ) {
                        // If the next point is on-curve or it's the second to last point, it's a quadratic Bezier.
                        svg += " Q" + xcoords[i][k] + ',' + ycoords[i][k] ; // Control point
                        svg += " " + xcoords[i][k + 1] + ',' + ycoords[i][k + 1] ; // End point
                        k++ ; // Advance k to skip the next point which was just consumed.
                    } else if ( k < flags[i].length - 2 ) {
                        // If there are more than two points left, it might be a cubic Bezier.
                        console.log ( 'TODO: handle higher than n=3 b-splines' ) ; // Placeholder for complex splines.
                        svg += " C" + xcoords[i][k] + ',' + ycoords[i][k] ; // First control point
                        svg += " " + xcoords[i][k + 1] + ',' + ycoords[i][k + 1] ; // Second control point
                        svg += " " + xcoords[i][k + 2] + ',' + ycoords[i][k + 2] ; // End point
                        k += 2 ; // Advance k by two points, as three points were consumed.
                    }
                }
            }
        }
        // Close the path data with the closing quote and tag.
        svg += '"/>' ;
        return svg ;
    }

    /**
     * @class _StreamReader
     * @description A utility class for reading various data types from an ArrayBuffer,
     *              simulating a stream.
     * @param {ArrayBuffer} arrayBuffer - The underlying ArrayBuffer to read from.
     * @param {number} [offset=0] - The initial offset within the ArrayBuffer.
     */
    function _StreamReader ( arrayBuffer , offset ) {
        // Current reading position (offset) in the buffer.
        var i = offset || 0 ;
        // DataView provides methods to read binary data from an ArrayBuffer.
        var view = new window.DataView ( arrayBuffer , i ) ;
        // TODO: Implement bounds checking for all read operations to prevent errors.

        // Define methods to read different integer types.
        this.getInt8 = function ( ) { return view.getInt8 ( i++ ) ; } ;
        this.getUint8 = function ( ) { return view.getUint8 ( i++ ) ; } ;
        this.getInt16 = function ( ) { return i += 2 , view.getInt16 ( i - 2 ) ; } ;
        this.getUint16 = function ( ) { return i += 2 , view.getUint16 ( i - 2 ) ; } ;
        this.getInt32 = function ( ) { return i += 4 , view.getInt32 ( i - 4 ) ; } ;
        this.getUint32 = function ( ) { return i += 4 , view.getUint32 ( i - 4 ) ; } ;
        this.getFloat32 = function ( ) { return i += 4 , view.getFloat32 ( i - 4 ) ; } ;
        // TODO: This implementation of getInt64 is incorrect for 64-bit integers.
        // It performs a bitwise OR which won't handle full 64-bit range in JS numbers.
        this.getInt64 = function ( ) { this.getInt32 ( ) << 32 | this.getInt32 ( ) ; } ; //TODO: this is bollocks
        // Method to move the stream pointer backward.
        this.backup = function ( bytes ) { i -= bytes ; } ;
        // Method to get the current stream offset.
        this.offset = function ( ) { return i ; } ;
        // Method to jump to a specific offset.
        this.goto = function ( l ) { i = Math.max ( l , 0 ) ; } ;

        // Method to read a string of a given count of characters, advancing the pointer.
        this.readString = function ( count ) {
            var str = this.getStringAt ( i , count ) ;
            i += count ;
            return str ;
        } ;
        // Method to read a string at a specific start offset without advancing the pointer.
        this.getStringAt = function ( start , len ) {
            var str = '' ;
            for ( var k = 0 ; k < len ; k++ ) {
                str += String.fromCharCode ( view.getInt8 ( start + k ) ) ;
            }
            return str ;
        } ;
        // Method to read a 32-bit fixed-point number (16.16 format).
        this.get32Fixed = function ( ) {
            var ret = 0.0 ;
            ret = this.getInt16 ( ) ; // Integer part
            ret += ( this.getInt16 ( ) / 65536 ) ; // Fractional part (divided by 2^16)
            return ret ;
        } ;
        // Method to read an array of unsigned 8-bit integers.
        this.getUint8Array = function ( len ) {
            var ret = [ ] ;
            for ( var i = 0 ; i < len ; i++ ) {
                ret[i] = this.getUint8 ( ) ;
            }
            return ret ;
        } ;
        // Method to read an array of unsigned 16-bit integers.
        this.getUint16Array = function ( len ) {
            var ret = [ ] ;
            for ( var i = 0 ; i < len ; i++ ) {
                ret[i] = this.getUint16 ( ) ;
            }
            return ret ;
        } ;
    }

    // Array of standard name table labels for TrueType fonts.
    var nameLabels =
    [ 'Copyright notice' , 'Font family' , 'Font subfamily' , 'Subfamily identifier' , 'Full name' , 'Version' ,
      'Postscript name' , 'Trademark notice' , 'Manufacturer name' , 'Designer' , 'Description' , 'Vendor Url' ,
      'Designer Url' , 'License' ] ;

    // Array of platform IDs used in TrueType name tables.
    var platformIds =
    [ 'Unicode' , 'Macintosh' , undefined , 'Microsoft' ] ; // undefined is for Platform ID 2 (ISO, deprecated).

    // Array of Macintosh encoding IDs.
    var macEncodingIds =
    [ 'Roman' , 'Japansese' , 'Traditional Chinese' , 'Korean' , 'Arabic' , 'Hebrew' , 'Greek' , 'Russian' , 'RSymbol' ,
      'Devanagari' , 'Gurmukhi' , 'Gujarati' , 'Oriya' , 'Bengali' , 'Tamil' , 'Telugu' , 'Kannada' , 'Malayalam' ,
      'Sinhalese' , 'Burmese' , 'Khmer' , 'Thai' , 'Laotian' , 'Georgian' , 'Armenian' , 'Simplified Chinese' , 'Tibetan' ,
      'Mongolian' , 'Geez' , 'Slavic' , 'Vietnamese' , 'Sindhi' ] ;

    // Array of Unicode encoding IDs.
    var uniEncodingIds =
    [ 'Default semantics' , 'Version 1.1 semantics' , 'ISO 10646 1993 semantics (deprecated)' ,
      'Unicode 2.0 or later semantics' ] ;

    // An extensive array mapping Mac Roman encoding character codes to their PostScript glyph names.
    var macRomanEncoding =
    [ '.notdef' , '.null' , 'nonmarkingreturn' , 'space' , 'exclam' , 'quotedbl' , 'numbersign' , 'dollar' , 'percent' , 'ampersand' ,
      'quotesingle' , 'parenleft' , 'parenright' , 'asterisk' , 'plus' , 'comma' , 'hyphen' , 'period' , 'slash' , 'zero' , 'one' , 'two' ,
      'three' , 'four' , 'five' , 'six' , 'seven' , 'eight' , 'nine' , 'colon' , 'semicolon' , 'less' , 'equal' , 'greater' , 'question' , 'at' ,
      'A' , 'B' , 'C' , 'D' , 'E' , 'F' , 'G' , 'H' , 'I' , 'J' , 'K' , 'L' , 'M' , 'N' , 'O' , 'P' , 'Q' , 'R' , 'S' , 'T' , 'U' , 'V' , 'W' , 'X' , 'Y' , 'Z' , 'bracketleft' ,
      'backslash' , 'bracketright' , 'asciicircum' , 'underscore' , 'grave' , 'a' , 'b' , 'c' , 'd' , 'e' , 'f' , 'g' , 'h' , 'i' , 'j' , 'k' , 'l' , 'm' , 'n' ,
      'o' , 'p' , 'q' , 'r' , 's' , 't' , 'u' , 'v' , 'w' , 'x' , 'y' , 'z' , 'braceleft' , 'bar' , 'braceright' , 'asciitilde' , 'Adieresis' , 'Aring' ,
      'Ccedilla' , 'Eacute' , 'Ntilde' , 'Odieresis' , 'Udieresis' , 'aacute' , 'agrave' , 'acircumflex' , 'adieresis' , 'atilde' , 'aring' ,
      'ccedilla' , 'eacute' , 'egrave' , 'ecircumflex' , 'edieresis' , 'iacute' , 'igrave' , 'icircumflex' , 'idieresis' , 'ntilde' , 'oacute' ,
      'ograve' , 'ocircumflex' , 'odieresis' , 'otilde' , 'uacute' , 'ugrave' , 'ucircumflex' , 'udieresis' , 'dagger' , 'degree' , 'cent' ,
      'sterling' , 'section' , 'bullet' , 'paragraph' , 'germandbls' , 'registered' , 'copyright' , 'trademark' , 'acute' , 'dieresis' ,
      'notequal' , 'AE' , 'Oslash' , 'infinity' , 'plusminus' , 'lessequal' , 'greaterequal' , 'yen' , 'mu' , 'partialdiff' , 'summation' ,
      'product' , 'pi' , 'integral' , 'ordfeminine' , 'ordmasculine' , 'Omega' , 'ae' , 'oslash' , 'questiondown' , 'exclamdown' , 'logicalnot' ,
      'radical' , 'florin' , 'approxequal' , 'Delta' , 'guillemotleft' , 'guillemotright' , 'ellipsis' , 'nonbreakingspace' , 'Agrave' , 'Atilde' ,
      'Otilde' , 'OE' , 'oe' , 'endash' , 'emdash' , 'quotedblleft' , 'quotedblright' , 'quoteleft' , 'quoteright' , 'divide' , 'lozenge' , 'ydieresis' ,
      'Ydieresis' , 'fraction' , 'currency' , 'guilsinglleft' , 'guilsinglright' , 'fi' , 'fl' , 'daggerdbl' , 'periodcentered' , 'quotesinglbase' ,
      'quotedblbase' , 'perthousand' , 'Acircumflex' , 'Ecircumflex' , 'Aacute' , 'Edieresis' , 'Egrave' , 'Iacute' , 'Icircumflex' , 'Idieresis' ,
      'Igrave' , 'Oacute' , 'Ocircumflex' , 'apple' , 'Ograve' , 'Uacute' , 'Ucircumflex' , 'Ugrave' , 'dotlessi' , 'circumflex' , 'tilde' , 'macron' ,
      'breve' , 'dotaccent' , 'ring' , 'cedilla' , 'hungarumlaut' , 'ogonek' , 'caron' , 'Lslash' , 'lslash' , 'Scaron' , 'scaron' , 'Zcaron' , 'zcaron' ,
      'brokenbar' , 'Eth' , 'eth' , 'Yacute' , 'yacute' , 'Thorn' , 'thorn' , 'minus' , 'multiply' , 'onesuperior' , 'twosuperior' , 'threesuperior' ,
      'onehalf' , 'onequarter' , 'threequarters' , 'franc' , 'Gbreve' , 'gbreve' , 'Idotaccent' , 'Scedilla' , 'scedilla' , 'Cacute' , 'cacute' ,
      'Ccaron' , 'ccaron' , 'dcroat' ] ; // minify *this* - A comment indicating this array is quite large.

    /**
     * @function getTableByTag
     * @description Finds a font table object within the font's tables array by its 4-character tag.
     * @param {object} font - The font object containing a 'tables' array.
     * @param {string} tag - The 4-character tag of the table to find (e.g., 'head', 'cmap').
     * @returns {object|undefined} The found table object or undefined if not found.
     */
    function getTableByTag ( font , tag ) {
        var tb = font.tables.filter ( function ( tb ) {
            return tb.tag === tag ; // Filter for tables matching the given tag.
        } ) ;
        return tb ? tb[0] : undefined ; // Return the first matching table or undefined.
    }

    /**
     * @function readTableDirectory
     * @description Reads a single entry from the font's table directory.
     * @param {StreamReader} slr - The StreamReader instance positioned at the start of a table directory entry.
     * @returns {object} An object containing the table's tag, checksum, offset, and length.
     */
    function readTableDirectory ( slr ) {
        var ret = {} ;
        ret.tag = slr.readString ( 4 ) ; // 4-byte tag.
        ret.crc = slr.getUint32 ( ) ; // Checksum.
        ret.offset = slr.getUint32 ( ) ; // Offset from the beginning of the font file.
        ret.len = slr.getUint32 ( ) ; // Length of the table in bytes.
        return ret ;
    }

    // An object containing functions to initialize and parse different TrueType font tables.
    var initializers = {
        /**
         * Initializes the 'head' (Font Header) table.
         * @param {object} font - The font object to attach the parsed data to.
         */
        'head' : function ( font ) {
            var tb = getTableByTag ( font , 'head' ) ;
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Move stream pointer to the start of the 'head' table.
            var header = {} ; // Object to store header properties.

            // Read various fields from the 'head' table.
            header.version = slr.get32Fixed ( ) ;
            header.revision = slr.get32Fixed ( ) ;
            header.checkSumAdjustment = slr.getUint32 ( ) ;
            header.magic = slr.getUint32 ( ) ;
            // Validate the magic number for the 'head' table.
            if ( header.magic !== 0x5F0F3CF5 ) {
                throw "Font header has incorrect magic number" ;
            }
            header.flags = slr.getUint16 ( ) ;
            header.unitsPerEm = slr.getUint16 ( ) ;

            header.created = slr.getInt64 ( ) ; // Date and time font was created.
            header.modified = slr.getInt64 ( ) ; // Date and time font was modified.

            // Bounding box for all glyphs.
            header.xMin = slr.getInt16 ( ) ;
            header.yMin = slr.getInt16 ( ) ;
            header.xMax = slr.getInt16 ( ) ;
            header.yMax = slr.getInt16 ( ) ;

            header.macStyle = slr.getUint16 ( ) ;
            header.lowestRecPPEM = slr.getUint16 ( ) ;
            header.fontDirectionHint = slr.getInt16 ( ) ;
            header.indexToLocFormat = slr.getInt16 ( ) ; // Format of the 'loca' table offsets.
            header.glyphDataFormat = slr.getInt16 ( ) ;

            // Attach the parsed header object to the font, making it immutable.
            font.head = Object.freeze ( header ) ;
        } ,
        /**
         * Initializes the 'name' (Naming) table.
         * @param {object} font - The font object.
         */
        'name' : function ( font ) {
            var tb = getTableByTag ( font , 'name' ) ;
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Go to the start of the 'name' table.
            var namesTable = { records : [ ] } ; // Object to hold name records.

            namesTable.version = slr.getUint16 ( ) ;
            var count = slr.getUint16 ( ) ; // Number of name records.
            var stringOffset = slr.getUint16 ( ) ; // Offset to the string storage area.

            // Read each name record.
            for ( var i = 0 ; i < count ; i++ ) {
                var record = {} ;
                record.platformID = slr.getUint16 ( ) ;
                record.platformSpecificID = slr.getUint16 ( ) ;
                record.language = slr.getUint16 ( ) ;
                record.nameID = slr.getUint16 ( ) ;
                var length = slr.getUint16 ( ) ;
                var offset = slr.getUint16 ( ) ;
                // Read the actual string content from the string storage area.
                record.text = slr.getStringAt ( tb.offset + stringOffset + offset , length ) ;
                namesTable.records.push ( record ) ;
            }
            font.name = namesTable ; // Attach names table to font.
        } ,
        /**
         * Initializes the 'hhea' (Horizontal Header) table.
         * @param {object} font - The font object.
         */
        'hhea' : function ( font ) {
            var tb = getTableByTag ( font , 'hhea' ) ;
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Go to the start of the 'hhea' table.
            var hheader = {} ; // Object to store horizontal header properties.

            hheader.version = slr.get32Fixed ( ) ;
            hheader.ascender = slr.getInt16 ( ) ; // Typographic ascender.
            hheader.descender = slr.getInt16 ( ) ; // Typographic descender.

            hheader.lineGap = slr.getInt16 ( ) ;
            hheader.advanceWidthMax = slr.getUint16 ( ) ;
            hheader.minLeftSideBearing = slr.getInt16 ( ) ;
            hheader.minRightSideBearing = slr.getInt16 ( ) ;
            hheader.xMaxExtent = slr.getInt16 ( ) ;
            hheader.caretSlopeRise = slr.getInt16 ( ) ;
            hheader.caretSlopeRun = slr.getInt16 ( ) ;
            // Reserved fields.
            hheader.reserved1 = slr.getInt16 ( ) ;
            hheader.reserved2 = slr.getInt16 ( ) ;
            hheader.reserved3 = slr.getInt16 ( ) ;
            hheader.reserved4 = slr.getInt16 ( ) ;
            hheader.reserved5 = slr.getInt16 ( ) ;
            hheader.metricDataFormat = slr.getInt16 ( ) ;
            hheader.numberOfHMetrics = slr.getUint16 ( ) ; // Number of advance widths in 'hmtx' table.

            font.hhea = Object.freeze ( hheader ) ; // Attach and freeze.
        } ,
        /**
         * Initializes the 'maxp' (Maximum Profile) table.
         * @param {object} font - The font object.
         */
        'maxp' : function ( font ) {
            var tb = getTableByTag ( font , 'maxp' ) ;
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Go to the start of the 'maxp' table.
            var maxp = {} ; // Object to store maximum profile properties.

            maxp.version = slr.get32Fixed ( ) ;

            // Read various limits and counts from the 'maxp' table.
            maxp.numGlyphs = slr.getInt16 ( ) ;
            maxp.maxPoints = slr.getInt16 ( ) ;
            maxp.maxContours = slr.getInt16 ( ) ;
            maxp.maxComponentPoints = slr.getInt16 ( ) ;
            maxp.maxComponentContours = slr.getInt16 ( ) ;
            maxp.maxZones = slr.getInt16 ( ) ;
            maxp.maxTwilightPoints = slr.getInt16 ( ) ;
            maxp.maxStorage = slr.getInt16 ( ) ;
            maxp.maxFunctionDefs = slr.getInt16 ( ) ;
            maxp.maxInstructionDefs = slr.getInt16 ( ) ;
            maxp.maxStackElements = slr.getInt16 ( ) ;
            maxp.maxSizeOfInstructions = slr.getInt16 ( ) ;
            maxp.maxComponentElements = slr.getInt16 ( ) ;
            maxp.maxComponentDepth = slr.getInt16 ( ) ;

            font.maxp = Object.freeze ( maxp ) ; // Attach and freeze.
        } ,
        /**
         * Initializes the 'post' (PostScript) table.
         * @param {object} font - The font object.
         */
        'post' : function ( font ) {
            var tb = getTableByTag ( font , 'post' ) ;
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Go to the start of the 'post' table.
            var post = {} ; // Object to store PostScript properties.

            post.format = slr.get32Fixed ( ) ; // Format of the table (e.g., 1.0, 2.0).
            post.italicAngle = slr.get32Fixed ( ) ;
            post.underlinePosition = slr.getInt16 ( ) ;
            post.underlineThickness = slr.getInt16 ( ) ;
            post.isFixedPitch = slr.getUint32 ( ) ;
            post.minMemType42 = slr.getUint32 ( ) ;
            post.maxMemType42 = slr.getUint32 ( ) ;
            post.minMemType1 = slr.getUint32 ( ) ;
            post.maxMemType1 = slr.getUint32 ( ) ;

            var glyphNames = [ ] , i ;
            if ( post.format === 1.0 ) {
                // For format 1.0, glyph names are standard Mac Roman encoding.
                for ( i = 0 ; i < 258 ; i++ ) {
                    glyphNames[i] = macRomanEncoding[i] ;
                }
            } else if ( post.format === 2.0 ) {
                // For format 2.0, glyph names are indexed into a string array.
                var numGlyphs = slr.getUint16 ( ) ;
                var glyphNameIndex = new Array ( numGlyphs ) ;
                var maxIndex = Number.MIN_VALUE ;
                for ( i = 0 ; i < numGlyphs ; i++ ) {
                    var index = slr.getUint16 ( ) ;
                    glyphNameIndex[i] = index ;
                    maxIndex = Math.max ( maxIndex , index ) ;
                }
                var nameArray = [ ] ;
                if ( maxIndex >= 258 ) {
                    // Read custom glyph names if they exist.
                    for ( i = 0 ; i < maxIndex - 258 + 1 ; i++ ) {
                        var len = slr.getUint8 ( ) ;
                        nameArray[i] = slr.readString ( len ) ;
                    }
                }
                // Map glyph indices to their actual names.
                for ( i = 0 ; i < numGlyphs ; i++ ) {
                    var index = glyphNameIndex[i] ;
                    if ( index < 258 ) {
                        glyphNames[i] = macRomanEncoding[i] ;
                    } else if ( index >= 258 && index <= 32767 ) {
                        glyphNames[i] = nameArray[index - 258] ;
                    } else {
                        throw "Unknow glyph name: " + index ;
                    }
                }
            }
            post.glyphNames = glyphNames ; // Attach glyph names.
            font.post = Object.freeze ( post ) ; // Attach and freeze.
        } ,
        /**
         * Initializes the 'loca' (Index to Location) table.
         * @param {object} font - The font object.
         */
        'loca' : function ( font ) {
            var tb = getTableByTag ( font , 'loca' ) ;
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Go to the start of the 'loca' table.
            var loca = {} ; // Object to store location data.

            var indexToLocFormat = font.head.indexToLocFormat ; // Get format from 'head' table.
            var numGlyphs = font.maxp.numGlyphs ; // Get number of glyphs from 'maxp' table.

            loca.offsets = new Array ( numGlyphs + 1 ) ; // Array to store glyph offsets.
            for ( var i = 0 ; i < numGlyphs + 1 ; i++ ) {
                if ( indexToLocFormat === 0 ) {
                    // Short format (offsets are multiplied by 2 to get actual byte offset).
                    loca.offsets[i] = slr.getUint16 ( ) * 2 ;
                } else if ( indexToLocFormat === 1 ) {
                    // Long format (full 32-bit offset).
                    loca.offsets[i] = slr.getUint32 ( ) ;
                } else {
                    throw "Font contains invalid glyph IndexToLocFormat" ;
                }
            }
            font.loca = Object.freeze ( loca ) ; // Attach and freeze.
        } ,
        /**
         * Initializes the 'cmap' (Character to Glyph Mapping) table.
         * @param {object} font - The font object.
         */
        'cmap' : function ( font ) {
            var tb = getTableByTag ( font , 'cmap' ) ;
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Go to the start of the 'cmap' table.
            var cmapTable = {} ; // Object to store cmap data.

            var version = slr.getUint16 ( ) ;
            var numberOfTables = slr.getUint16 ( ) ; // Number of encoding sub-tables.
            var cmaps = new Array ( numberOfTables ) ;
            var cmap , i ;
            // Read header information for each sub-table.
            for ( i = 0 ; i < numberOfTables ; i++ ) {
                cmap = {} ;
                cmap.platformID = slr.getUint16 ( ) ;
                cmap.platformSpecificID = slr.getUint16 ( ) ;
                cmap.offset = slr.getUint32 ( ) ; // Offset to the sub-table.
                cmaps[i] = cmap ;
            }
            // Now parse the actual sub-tables.
            for ( i = 0 ; i < numberOfTables ; i++ ) {
                cmap = cmaps[i] ;
                slr.goto ( tb.offset + cmap.offset ) ; // Go to the start of the current sub-table.
                cmap.format = slr.getUint16 ( ) ; // Sub-table format.
                cmap.length = slr.getUint16 ( ) ;
                cmap.language = slr.getUint16 ( ) ;
                cmap.glyphIndexArray = new Array ( 256 ) ; // Initialize an array for char-to-glyph mapping.

                switch ( cmap.format ) {
                    case 0 : // Format 0: Byte encoding table.
                        for ( var j = 0 ; j < 256 ; j++ ) {
                            cmap.glyphIndexArray[j] = slr.getUint8 ( ) ;
                        }
                        break ;
                    case 4 : // Format 4: Segment mapping to delta values.
                        var numGlyphs = font.maxp.numGlyphs ;

                        var segCountX2 = slr.getUint16 ( ) ;
                        var segCount = segCountX2 / 2 ;
                        var searchRange = slr.getUint16 ( ) ;
                        var entrySelector = slr.getUint16 ( ) ;
                        var rangeShift = slr.getUint16 ( ) ;
                        var endCode = slr.getUint16Array ( segCount ) ;
                        slr.getUint16 ( ) ; // reserved Pad
                        var startCode = slr.getUint16Array ( segCount ) ;
                        var idDelta = slr.getUint16Array ( segCount ) ;
                        var idRangeOffset = slr.getUint16Array ( segCount ) ;
                        var glyphToCharacterMap = new Array ( numGlyphs ) ;
                        var curPos = slr.offset ( ) ; // Current position after reading arrays.

                        for ( var j = 0 ; j < segCount ; j++ ) {
                            var start = startCode[j] ;
                            var end = endCode[j] ;
                            var delta = idDelta[j] ;
                            var rangeOffset = idRangeOffset[j] ;

                            if ( start !== 0xFFFF && end !== 0xFFFF ) {
                                for ( var k = start ; k < end ; k++ ) {
                                    if ( rangeOffset === 0 ) {
                                        // Direct mapping with delta.
                                        glyphToCharacterMap[( ( k + delta ) % 65536 )] = k ;
                                        cmap.glyphIndexArray[k] = ( ( k + delta ) % 65536 ) ;
                                    } else {
                                        // Mapping via glyphIdArray.
                                        var glyphOffset = curPos + ( ( rangeOffset / 2 ) + ( k - start ) + ( i - segCount ) ) * 2 ;
                                        slr.goto ( glyphOffset ) ;
                                        var glyphIndex = slr.getUint16 ( ) ;
                                        if ( glyphIndex != 0 ) {
                                            glyphIndex += delta ;
                                            glyphIndex %= 65536 ;
                                            if ( glyphToCharacterMap[glyphIndex] === 0 ) {
                                                glyphToCharacterMap[glyphIndex] = k ;
                                                cmap.glyphIndexArray[k] = glyphIndex ;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        cmap.glyphToCharacterMap = glyphToCharacterMap ;
                        break ;
                }
            }
            cmapTable.cmaps = cmaps ; // Attach all parsed sub-tables.
            font.cmap = Object.freeze ( cmapTable ) ; // Attach and freeze.
        } ,
        /**
         * Initializes the 'glyf' (Glyph Data) table.
         * @param {object} font - The font object.
         */
        'glyf' : function ( font ) {
            var tb = getTableByTag ( font , 'glyf' ) ;
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Go to the start of the 'glyf' table.
            var glyf = {} ; // Object to store glyph data.

            var maxp = font.maxp ;
            var loca = font.loca ;
            var post = font.post ;

            var offsets = loca.offsets ; // Glyph offsets from 'loca' table.
            var numGlyphs = maxp.numGlyphs ; // Number of glyphs.
            var glyphNames = post.glyphNames ; // Glyph names (though not directly used here).

            var glyphs = new Array ( numGlyphs ) ;
            // Iterate through glyphs to create Glyph objects.
            for ( var i = 0 ; i < numGlyphs - 1 ; i++ ) {
                if ( offsets[i] === offsets[i + 1] ) {
                    // If offsets are the same, it's an empty glyph.
                    continue ;
                }
                // Create a new Glyph object at the calculated offset.
                var glyph = new Glyph ( tb.offset + offsets[i] , slr ) ;
                glyphs[i] = glyph ;
            }
            // Resolve composite glyphs (glyphs composed of other glyphs).
            for ( var i = 0 ; i < numGlyphs - 1 ; i++ ) {
                if ( glyphs[i] && glyphs[i].numberOfContours === -1 ) {
                    // If it's a composite glyph, resolve its components.
                    glyphs[i].resolve ( glyphs ) ;
                }
            }
            glyf.glyphs = glyphs ; // Attach the array of glyphs.
            font.glyf = Object.freeze ( glyf ) ; // Attach and freeze.
        } ,
        /**
         * Initializes the 'hmtx' (Horizontal Metrics) table.
         * @param {object} font - The font object.
         */
        'hmtx' : function ( font ) {
            var tb = getTableByTag ( font , 'hmtx' ) ;
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Go to the start of the 'hmtx' table.
            var hmetrics = {} ; // Object to store horizontal metrics.

            var numOfLongHorMetrics = font.hhea.numberOfHMetrics ; // Number of long metrics entries.
            hmetrics.longHorMetric = new Array ( numOfLongHorMetrics ) ;
            var i ;
            // Read 'long' metrics (advance width and left side bearing).
            for ( i = 0 ; i < numOfLongHorMetrics ; i++ ) {
                var metric = {} ;
                metric.advanceWidth = slr.getUint16 ( ) ;
                metric.leftSideBearing = slr.getInt16 ( ) ;
                hmetrics.longHorMetric[i] = metric ;
            }
            // For glyphs beyond numOfLongHorMetrics, they share the last advance width,
            // but have their own left side bearing.
            var advanceWidth = hmetrics.longHorMetric[i - 1].advanceWidth ;
            for ( ; i < font.maxp.numGlyphs ; i++ ) {
                var metric = {} ;
                metric.advanceWidth = advanceWidth ; // Use the last advance width.
                metric.leftSideBearing = slr.getInt16 ( ) ;
                hmetrics.longHorMetric[i] = metric ;
            }
            font.hmtx = Object.freeze ( hmetrics ) ; // Attach and freeze.
        } ,
        /**
         * Initializes the 'kern' (Kerning) table.
         * @param {object} font - The font object.
         */
        'kern' : function ( font ) {
            var tb = getTableByTag ( font , 'kern' ) ;
            if ( !tb ) { return ; } // If 'kern' table doesn't exist, simply return.
            var slr = font.stream ;
            slr.goto ( tb.offset ) ; // Go to the start of the 'kern' table.
            var kerning = {} ; // Object to store kerning data.

            var fword1 = slr.getUint16 ( ) ;
            var fword2 = slr.getUint16 ( ) ;
            if ( fword1 === 1 && fword2 === 0 ) {
                // Check for specific version format.
                kerning.version = 1.0 ;
                kerning.nTables = slr.getUint32 ( ) ; // Number of kerning sub-tables.
            } else {
                // ... (rest of the kerning table parsing logic would go here)
                // This part of the function is incomplete in the original code.
            }