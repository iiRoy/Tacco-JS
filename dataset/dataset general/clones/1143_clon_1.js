/*
 *  GifWriter.js - A JavaScript library for GIF creation.
 *  Version: 0.1.0
 *
 *  License: The MIT License (MIT)
 *  Copyright (c) 2013 nobuoka
 *
 *  This software is provided 'as-is', without any express or implied
 *  warranty. In no event will the authors be held liable for any damages
 *  arising from the use of this software.
 *
 *  Permission is granted to anyone to use this software for any purpose,
 *  including commercial applications, and to alter it and redistribute it
 *  freely, subject to the following restrictions:
 *
 *  1. The origin of this software must not be misrepresented; you must not
 *     claim that you wrote the original software. If you use this software
 *     in a product, an acknowledgment in the product documentation would be
 *     appreciated but is not required.
 *  2. Altered source versions must be plainly marked as such, and must not be
 *     misrepresented as being the original software.
 *  3. This notice may not be removed or altered from any source distribution.
 */

// Global namespace declaration for vividcode, if not already defined.
var vividcode;
( function (vividcode) {
  // Nested namespace for image related functionalities.
  ( function (image) {

    // Class representing an image with indexed colors and a palette.
    var IndexedColorImage = ( function () {
      // Constructor for IndexedColorImage.
      function IndexedColorImage( size, data, paletteData ) {
        this.width = size.width; // Image width.
        this.height = size.height; // Image height.
        this.data = data; // Indexed pixel data.
        this.paletteData = paletteData; // Palette data (RGB triples).
      }
      return IndexedColorImage; // Return the constructor function.
    } ) ( );
    // Export the IndexedColorImage class within the image namespace.
    image.IndexedColorImage = IndexedColorImage;

    // Converter for GIF compressed codes to byte array.
    var GifCompressedCodesToByteArrayConverter = ( function () {
      // Constructor initializes internal state.
      function GifCompressedCodesToByteArrayConverter ( ) {
        this.__out = [ ]; // Output byte array.
        this.__remNumBits = 0; // Remaining number of bits in current byte.
        this.__remVal = 0; // Current byte value being built.
      }

      // Pushes a code with a specified number of bits into the byte stream.
      GifCompressedCodesToByteArrayConverter.prototype.push = function ( code, numBits ) {
        // Loop until all bits of the code are processed.
        while ( numBits > 0 ) {
          // Combine current code bits with remaining value bits.
          this.__remVal = ( ( code << this.__remNumBits ) & 255 ) + this.__remVal;
          // Check if a full byte can be formed.
          if ( numBits + this.__remNumBits >= 8 ) {
            this.__out.push( this.__remVal ); // Add the full byte to output.
            numBits = numBits - ( 8 - this.__remNumBits ); // Update remaining bits for the current code.
            code = ( code >> ( 8 - this.__remNumBits ) ); // Shift code to process next bits.
            this.__remVal = 0; // Reset current byte value.
            this.__remNumBits = 0; // Reset remaining bits count.
          } else {
            // Not enough bits for a full byte, update remaining bits.
            this.__remNumBits = numBits + this.__remNumBits;
            numBits = 0; // All bits of the current code are consumed.
          }
        }
      };

      // Flushes any remaining bits and returns the accumulated byte array.
      GifCompressedCodesToByteArrayConverter.prototype.flush = function ( ) {
        this.push( 0, 8 ); // Ensure any partial byte is flushed (padded with zeros).
        this.__remNumBits = 0; // Reset internal state.
        this.__remVal = 0; // Reset internal state.
        var out = this.__out; // Get the output array.
        this.__out = [ ]; // Clear the internal output array for next use.
        return out; // Return the flushed bytes.
      };
      return GifCompressedCodesToByteArrayConverter; // Return the constructor.
    } ) ( );

    // Function to compress an array of actual codes using LZW algorithm.
    // actualCodes: Array of image pixel indices.
    // numBits: Initial number of bits for LZW codes.
    function compressWithLZW ( actualCodes, numBits ) {
      var bb = new GifCompressedCodesToByteArrayConverter ( ); // Byte buffer for compressed data.
      var clearCode = ( 1 << numBits ); // LZW Clear Code.
      var endOfInfoCode = clearCode + 1; // LZW End of Information Code.
      var nextCode; // Next available code in the dictionary.
      var curNumCodeBits; // Current number of bits per LZW code.
      var dict; // LZW dictionary.

      // Resets LZW parameters and dictionary to initial state.
      function resetAllParamsAndTablesToStartUpState ( ) {
        nextCode = endOfInfoCode + 1; // Start assigning codes after EOI.
        curNumCodeBits = numBits + 1; // Initial code size is numBits + 1.
        dict = Object.create( null ); // Initialize an empty dictionary.
      }

      resetAllParamsAndTablesToStartUpState ( ); // Initialize LZW state.
      bb.push( clearCode, curNumCodeBits ); // Output clear code to reset decoder.

      var concatedCodesKey = ""; // Key for current sequence of codes.

      // Iterate through actual pixel codes.
      for ( var i = 0, len = actualCodes.length; i < len; ++i ) {
        var code = actualCodes[ i ]; // Current pixel code.
        var dictKey = String.fromCharCode( code ); // Convert code to string for dictionary key.

        // Ensure single-character codes are in the dictionary.
        if ( ! ( dictKey in dict ) ) {
          dict[ dictKey ] = code;
        }

        var oldKey = concatedCodesKey; // Store the previous concatenated key.
        concatedCodesKey += dictKey; // Extend the current sequence.

        // If the new sequence is not in the dictionary.
        if ( ! ( concatedCodesKey in dict ) ) {
          bb.push( dict[ oldKey ], curNumCodeBits ); // Output the code for the old sequence.

          // Check if there's space for a new code in the dictionary.
          if ( nextCode <= 4095 ) { // Max LZW code is 4095 (12 bits).
            dict[ concatedCodesKey ] = nextCode; // Add new sequence to dictionary.
            // If current code size limit is reached, increment it.
            if ( nextCode === ( 1 << curNumCodeBits ) ) {
              curNumCodeBits++;
            }
            nextCode++; // Increment next available code.
          } else {
            // Dictionary is full, output clear code and reset.
            bb.push( clearCode, curNumCodeBits );
            resetAllParamsAndTablesToStartUpState ( );
            dict[ dictKey ] = code; // Re-add the current single code.
          }
          concatedCodesKey = dictKey; // Start new sequence with current code.
        }
      }
      bb.push( dict[ concatedCodesKey ], curNumCodeBits ); // Output code for the last sequence.
      bb.push( endOfInfoCode, curNumCodeBits ); // Output End of Information code.
      return bb.flush ( ); // Flush and return the compressed bytes.
    }

    // GifWriter class: Handles writing GIF file format data to an output stream.
    var GifWriter = ( function ( ) {
      // Constructor takes an output stream object.
      function GifWriter ( outputStream ) {
        this.__os = outputStream; // The underlying output stream.
      }

      // Writes a 2-byte integer (little-endian).
      GifWriter.prototype.__writeInt2 = function ( v ) {
        this.__os.writeBytes( [
          v & 255, // Low byte.
          ( v >> 8 ) & 255 // High byte.
        ] );
      };

      // Writes data in GIF data sub-blocks (max 255 bytes per block).
      GifWriter.prototype.__writeDataSubBlocks = function ( data ) {
        var os = this.__os; // Reference to the output stream.
        var curIdx = 0; // Current index in the data array.
        var blockLastIdx; // Last index of the current sub-block.

        // Loop through data, writing in chunks.
        while ( curIdx < ( blockLastIdx = Math.min( data.length, curIdx + 254 ) ) ) {
          var subarray = data.slice( curIdx, blockLastIdx ); // Get a sub-array.
          os.writeByte( subarray.length ); // Write block size byte.
          os.writeBytes( subarray ); // Write the data block.
          curIdx = blockLastIdx; // Move to the next block.
        }
      };

      // Writes a block terminator (0x00).
      GifWriter.prototype.__writeBlockTerminator = function ( ) {
        this.__os.writeByte( 0 );
      };

      // Writes the GIF header (GIF89a).
      GifWriter.prototype.writeHeader = function ( ) {
        var os = this.__os;
        os.writeBytes( [
          71, // G
          73, // I
          70 // F
        ] );
        os.writeBytes( [
          56, // 8
          57, // 9
          97 // a
        ] );
      };

      // Writes the GIF trailer (0x3B).
      GifWriter.prototype.writeTrailer = function ( ) {
        this.__os.writeByte( 59 ); // GIF Trailer byte.
      };

      // Writes the Logical Screen Descriptor and optional Global Color Table.
      GifWriter.prototype.writeLogicalScreenInfo = function ( imageSize, options ) {
        if ( ! options ) {
          options = { }; // Default empty options if none provided.
        }

        // Determine size of color table (log base 2 of number of colors - 1).
        var sizeOfColorTable = "sizeOfColorTable" in options ? options.sizeOfColorTable : options.colorTableData ? this.__calcSizeOfColorTable( options.colorTableData ) : 7; // Default to 256 colors if no data.
        var bgColorIndex = ( "bgColorIndex" in options ? options.bgColorIndex : 0 ); // Background color index.
        var pxAspectRatio = ( "pxAspectRatio" in options ? options.pxAspectRatio : 0 ); // Pixel aspect ratio.

        // Write the Logical Screen Descriptor.
        this.__writeLogicalScreenDescriptor( imageSize, !! options.colorTableData, !! options.colorTableSortFlag, sizeOfColorTable, bgColorIndex, pxAspectRatio );

        // If global color table data is provided, write it.
        if ( !! options.colorTableData ) {
          this.__writeColorTable( options.colorTableData, sizeOfColorTable );
        }
      };

      // Calculates the `Size of Global Color Table` field value.
      GifWriter.prototype.__calcSizeOfColorTable = function ( colorTableData ) {
        var numColors = colorTableData.length / 3; // Number of colors in the table.
        var sct = 0; // Size of Color Table field value.
        var v = 2; // Start with 2 colors (2^1).
        while ( v < numColors ) {
          sct++; // Increment size field.
          v = v << 1; // Double the number of colors (2^sct).
        }
        return sct; // Return the calculated size.
      };

      // Writes the Logical Screen Descriptor block.
      GifWriter.prototype.__writeLogicalScreenDescriptor = function ( imageSize, useGlobalColorTable, colorTableSortFlag, sizeOfColorTable, bgColorIndex, pxAspectRatio ) {
        var os = this.__os;
        this.__writeInt2( imageSize.width ); // Canvas Width.
        this.__writeInt2( imageSize.height ); // Canvas Height.

        // Packed Field: GCT Flag (1 bit) | Color Resolution (3 bits) | Sort Flag (1 bit) | Size of GCT (3 bits).
        os.writeByte( ( useGlobalColorTable ? 128 : 0 ) | 112 | ( colorTableSortFlag ? 8 : 0 ) | sizeOfColorTable ); // 112 (0b1110000) corresponds to color resolution of 8 bits.
        os.writeByte( bgColorIndex ); // Background Color Index.
        os.writeByte( pxAspectRatio ); // Pixel Aspect Ratio.
      };

      // Writes a table-based image block (Image Descriptor + Local Color Table (optional) + Image Data).
      GifWriter.prototype.writeTableBasedImage = function ( indexedColorImage, options ) {
        if ( ! options ) {
          options = { };
        }

        var useLocalColorTable = true; // Always use a local color table for now.
        var sizeOfLocalColorTable = this.__calcSizeOfColorTable( indexedColorImage.paletteData ); // Calculate LCT size.

        // Write the Image Descriptor.
        this.__writeImageDescriptor( indexedColorImage, useLocalColorTable, sizeOfLocalColorTable, options );

        // If a local color table is used, write it.
        if ( useLocalColorTable ) {
          this.__writeColorTable( indexedColorImage.paletteData, ( useLocalColorTable ? sizeOfLocalColorTable : 0 ) );
        }

        // Write the LZW compressed image data.
        this.__writeImageData( indexedColorImage.data, sizeOfLocalColorTable + 1 );
      };

      // Writes a table-based image with a preceding Graphic Control Extension.
      GifWriter.prototype.writeTableBasedImageWithGraphicControl = function ( indexedColorImage, gcOpts ) {
        this.__writeGraphicControlExtension( gcOpts ); // Write GCE block.
        this.writeTableBasedImage( indexedColorImage, gcOpts ); // Write image block.
      };

      // Writes the Image Descriptor block.
      GifWriter.prototype.__writeImageDescriptor = function ( indexedColorImage, useLocalColorTable, sizeOfLocalColorTable, opts ) {
        var os = this.__os;
        os.writeByte( 44 ); // Image Separator (0x2C).

        var leftPos = ( "leftPosition" in opts ? opts.leftPosition : 0 ); // Image Left Position.
        this.__writeInt2( leftPos );
        var topPos = ( "topPosition" in opts ? opts.topPosition : 0 ); // Image Top Position.
        this.__writeInt2( topPos );
        this.__writeInt2( indexedColorImage.width ); // Image Width.
        this.__writeInt2( indexedColorImage.height ); // Image Height.

        // Packed Field: LCT Flag (1 bit) | Interlace Flag (1 bit) | Sort Flag (1 bit) | Reserved (2 bits) | Size of LCT (3 bits).
        os.writeByte( ( useLocalColorTable ? 128 : 0 ) | 0 | 0 | 0 | sizeOfLocalColorTable ); // Currently no interlace, no sort, reserved bits are 0.
      };

      // Writes the LZW compressed image data block.
      GifWriter.prototype.__writeImageData = function ( data, numBitsForCode ) {
        var os = this.__os;
        // The LZW Minimum Code Size must be at least 2.
        if ( numBitsForCode === 1 ) {
          numBitsForCode = 2;
        }

        var compressedBytes = compressWithLZW( data, numBitsForCode ); // Compress pixel data.
        os.writeByte( numBitsForCode ); // Write LZW Minimum Code Size.
        this.__writeDataSubBlocks( compressedBytes ); // Write compressed data in sub-blocks.
        this.__writeBlockTerminator ( ); // Terminate data blocks.
      };

      // Writes a color table (Global or Local).
      GifWriter.prototype.__writeColorTable = function ( colorTableData, sizeOfColorTable ) {
        var os = this.__os;
        os.writeBytes( colorTableData ); // Write the actual color data.

        // Pad with zeros if the color table is not full (e.g., 10 colors for a 256-color table).
        var rem = ( 3 * Math.pow( 2, sizeOfColorTable + 1 ) ) - colorTableData.length;
        var remBytes = [ ];
        while ( --rem >= 0 ) {
          remBytes.push( 0 ); // Add zero bytes for padding.
        }
        os.writeBytes( remBytes ); // Write padding bytes.
      };

      // Writes a Graphic Control Extension block.
      GifWriter.prototype.__writeGraphicControlExtension = function ( options ) {
        if ( ! options ) {
          options = { };
        }

        var os = this.__os;
        var delay = Math.round( ( options.delayTimeInMS || 0 ) / 10 ); // Delay time in 1/100ths of a second.
        var disposalMethod = ( "disposalMethod" in options ? options.disposalMethod : 2 ); // Default to "restore to background".

        var transparentColorIndex;
        var transparentColorFlag;

        // Check for transparent color index.
        if ( options.transparentColorIndex >= 0 ) {
          transparentColorIndex = options.transparentColorIndex & 255; // Ensure it's a byte.
          transparentColorFlag = 1; // Transparent color flag is set.
        } else {
          transparentColorIndex = 0; // Default to 0 if no transparency.
          transparentColorFlag = 0; // Transparent color flag is not set.
        }

        // Extension Introducer (0x21), Graphic Control Label (0xF9), Block Size (0x04).
        os.writeBytes( [
          33, // Extension Introducer.
          249, // Graphic Control Label.
          4 // Block Size.
        ] );

        // Packed Field: Reserved (3 bits) | Disposal Method (3 bits) | User Input Flag (1 bit) | Transparency Flag (1 bit).
        os.writeByte( 0 | ( disposalMethod << 2 ) | 0 | transparentColorFlag );
        this.__writeInt2( delay ); // Delay Time.
        os.writeByte( transparentColorIndex ); // Transparent Color Index.
        os.writeByte( 0 ); // Block Terminator.
      };

      // Writes an Application Extension for Netscape Loop Control (for animation looping).
      GifWriter.prototype.writeLoopControlInfo = function ( repeatCount ) {
        this.__os.writeBytes( [
          33, // Extension Introducer.
          255, // Application Extension Label.
          11, // Block Size (11 bytes for "NETSCAPE2.0").
          78, // N
          69, // E
          84, // T
          83, // S
          67, // C
          65, // A
          80, // P
          69, // E
          50, // 2
          46, // .
          48, // 0
          3, // Sub-block size (3 bytes).
          1, // Sub-block ID (loop count).
          ( repeatCount & 255 ), // Loop Count (low byte).
          ( ( repeatCount >> 8 ) & 255 ), // Loop Count (high byte).
          0, // Block Terminator.
        ] );
      };
      return GifWriter; // Return the GifWriter constructor.
    } ) ( );
    image.GifWriter = GifWriter; // Export GifWriter to the image namespace.

  } ) ( vividcode.image || ( vividcode.image = { } ) ); // Ensure vividcode.image exists.
  var image = vividcode.image; // Alias for convenience.
} ) ( vividcode || ( vividcode = { } ) ); // Ensure vividcode exists.

// Second part of the vividcode namespace for color quantization utilities.
var vividcode;
( function (vividcode) {
  ( function (image) {

    // Helper function to swap elements in an array.
    function swap ( array, idx1, idx2 ) {
      var tmp = array[ idx1 ];
      array[ idx1 ] = array[ idx2 ];
      array[ idx2 ] = tmp;
    }

    // Partitions a sub-array for Quickselect (Hoare's partition scheme).
    function partition ( a, left, right, pivotIndex ) {
      var pivotValue = a[ pivotIndex ];
      swap( a, pivotIndex, right ); // Move pivot to end.
      var storeIndex = left; // Index where elements smaller than pivot are stored.

      for ( var i = left; i < right; ++i ) {
        if ( a[ i ] <= pivotValue ) {
          swap( a, storeIndex, i );
          storeIndex = storeIndex + 1;
        }
      }
      swap( a, right, storeIndex ); // Move pivot to its final place.
      return storeIndex; // Return pivot's final index.
    }

    // Selects the k-th smallest element in a list (Quickselect algorithm).
    function selectKthElem ( list, left, right, k ) {
      while ( true ) {
        var pivotIndex = Math.floor( ( right + left ) / 2 ); // Choose middle as pivot.
        var pivotNewIndex = partition( list, left, right, pivotIndex ); // Partition around pivot.
        var pivotDist = pivotNewIndex - left + 1; // Distance from left to pivot.

        if ( k === pivotDist ) {
          return list[ pivotNewIndex ]; // Found the k-th element.
        } else if ( k < pivotDist ) {
          right = pivotNewIndex - 1; // Search in the left partition.
        } else {
          k = k - pivotDist; // Adjust k for the right partition.
          left = pivotNewIndex + 1; // Search in the right partition.
        }
      }
    }

    // Searches for the closest color in a palette.
    function searchClosestColor ( color, palette ) {
      var idx = searchClosestColorIndex( color, palette );
      return palette[ idx ];
    }

    // Searches for the index of the closest color in a palette using Euclidean distance.
    function searchClosestColorIndex ( color, palette ) {
      var min = 0; // Minimum squared distance found so far.
      var found = false; // Flag if exact match is found.
      var foundIndex = -1; // Index of exact match.
      var closestIndex = -1; // Index of closest match.
      var index = 0; // Current index during iteration.

      palette.forEach( function ( p, idx ) {
        // Calculate squared Euclidean distance.
        var d = Math.floor( Math.pow( color.red - p.red, 2 ) + Math.pow( color.green - p.green, 2 ) + Math.pow( color.blue - p.blue, 2 ) );
        if ( d == 0 ) {
          found = true; // Exact match.
          foundIndex = idx;
          closestIndex = idx;
        } else if ( min == 0 || d < min ) { // If this is the first color or closer.
          closestIndex = idx;
          min = d;
        }
      } );
      return ( found ? foundIndex : closestIndex ); // Return index of closest color.
    }

    // Represents a color cube in the RGB color space for median cut.
    var ColorCube = ( function () {
      // Constructor: takes an array of colors (objects with red, green, blue properties).
      function ColorCube ( colors ) {
        this.colors = colors; // Array of colors contained in this cube.
        var minR = 255;
        var maxR = 0;
        var minG = 255;
        var maxG = 0;
        var minB = 255;
        var maxB = 0;

        // Determine the min/max RGB values for this cube.
        colors.forEach( function ( color ) {
          if ( color.red < minR ) {
            minR = color.red;
          }
          if ( color.red > maxR ) {
            maxR = color.red;
          }
          if ( color.green < minG ) {
            minG = color.green;
          }
          if ( color.green > maxG ) {
            maxG = color.green;
          }
          if ( color.blue < minB ) {
            minB = color.blue;
          }
          if ( color.blue > maxB ) {
            maxB = color.blue;
          }
        } );
        this.__minR = minR;
        this.__maxR = maxR;
        this.__minG = minG;
        this.__maxG = maxG;
        this.__minB = minB;
        this.__maxB = maxB;
      }

      // Divides the color cube into two smaller cubes.
      ColorCube.prototype.divide = function ( ) {
        var cut = this.largestEdge ( ); // Determine the longest edge to cut along.
        var med = this.median ( cut ); // Find the median value along that edge.
        var r = this.divideBy( cut, med ); // Perform the actual division.
        return r;
      };

      // Divides the cube based on a specific color component and median value.
      ColorCube.prototype.divideBy = function ( cutTargetColor, median ) {
        var list0 = [ ]; // Colors smaller than median.
        var list1 = [ ]; // Colors greater than or equal to median.
        this.colors.forEach( function ( c ) {
          if ( c[ cutTargetColor ] < median ) {
            list0.push( c );
          } else {
            list1.push( c );
          }
        } );
        // Return two new ColorCube objects if both lists have colors.
        if ( list0.length > 0 && list1.length > 0 ) {
          return [
            new ColorCube( list0 ),
            new ColorCube( list1 )
          ];
        } else {
          return [ ]; // Cannot divide meaningfully if one list is empty.
        }
      };

      // Finds the median value of colors along a specified color component.
      ColorCube.prototype.median = function ( cutTargetColor ) {
        var cc = [ ];
        var colors = this.colors;
        for ( var i = 0, len = colors.length; i < len; ++i ) {
          cc.push( colors[ i ][ cutTargetColor ] ); // Extract component values.
        }
        // Use Quickselect to find the median.
        var med2 = selectKthElem( cc, 0, cc.length - 1, Math.floor( cc.length / 2 ) + 1 );
        return med2;
      };

      // Determines the longest edge of the color cube.
      ColorCube.prototype.largestEdge = function ( ) {
        // Calculate weighted differences for R, G, B.
        var diffR = ( this.__maxR - this.__minR ) * 1.0; // Red component.
        var diffG = ( this.__maxG - this.__minG ) * 0.8; // Green component (slightly less priority).
        var diffB = ( this.__maxB - this.__minB ) * 0.5; // Blue component (even less priority).

        // Compare differences to find the largest.
        if ( diffG >= diffB ) {
          if ( diffR >= diffG ) {
            return "red";
          } else {
            return "green";
          }
        } else {
          if ( diffR >= diffB ) {
            return "red";
          } else {
            return "blue";
          }
        }
      };

      // Returns the number of colors in this cube.
      ColorCube.prototype.getNumberOfColors = function ( ) {
        return this.colors.length;
      };

      // Calculates the average color of all colors within the cube.
      ColorCube.prototype.average = function ( ) {
        var sumR = 0;
        var sumG = 0;
        var sumB = 0;
        this.colors.forEach( function ( c ) {
          sumR += c.red;
          sumG += c.green;
          sumB += c.blue;
        } );
        var size = this.colors.length;
        // Return the average color.
        return {
          red: Math.floor( sumR / size ),
          green: Math.floor( sumG / size ),
          blue: Math.floor( sumB / size )
        };
      };
      return ColorCube; // Return the ColorCube constructor.
    } ) ( );

    // MedianCutColorReducer class for color quantization using the Median Cut algorithm.
    var MedianCutColorReducer = ( function () {
      // Constructor: takes image data and an optional maximum palette size.
      function MedianCutColorReducer ( imageData, maxPaletteSize ) {
        this.__imageData = imageData; // Raw image data (RGBA).
        this.__maxPaletteSize = maxPaletteSize || 255; // Max colors in the palette, default 255.
      }

      // Processes the image to generate a reduced color palette.
      MedianCutColorReducer.prototype.process = function ( ) {
        var imageData = this.__imageData;
        var maxcolor = this.__maxPaletteSize;
        var colors = this.__extractColors( imageData ); // Extract unique colors from image.

        // Perform median cut to generate color cubes.
        var cubes = this.__medianCut( colors, maxcolor );

        var palette = [ ]; // The final color palette.
        var colorReductionMap = Object.create( null ); // Map original RGB to palette index.

        // For each cube, calculate its average color and map its constituent colors to that average.
        cubes.forEach( function ( cube, idx ) {
          palette.push( cube.average ( ) ); // Add average color to palette.
          cube.colors.forEach( function ( c ) {
            // Create a hex string representation of the color.
            var rgb = ( ( c.red << 16 ) | ( c.green << 8 ) | ( c.blue << 0 ) ).toString( 16 );
            while ( 6 - rgb.length ) {
              rgb = "0" + rgb; // Pad with leading zeros.
            }
            colorReductionMap[ rgb ] = idx; // Map original color to palette index.
          } );
        } );

        this.__palette = palette; // Store the generated palette.
        this.__colorReductionMap = colorReductionMap; // Store the mapping.

        var paletteData = [ ]; // Flattened palette data (R, G, B, R, G, B...).
        palette.forEach( function ( color ) {
          paletteData.push( color.red );
          paletteData.push( color.green );
          paletteData.push( color.blue );
        } );
        return paletteData; // Return the flattened palette.
      };

      // Maps an RGB color to its corresponding index in the reduced palette.
      MedianCutColorReducer.prototype.map = function ( r, g, b ) {
        var rgb = ( ( r << 16 ) | ( g << 8 ) | ( b << 0 ) ).toString( 16 );
        while ( 6 - rgb.length ) {
          rgb = "0" + rgb;
        }
        // If color not directly in map, find closest in palette.
        if ( ! ( rgb in this.__colorReductionMap ) ) {
          this.__colorReductionMap[ rgb ] = searchClosestColorIndex( {
            red: r,
            green: g,
            blue: b
          }, this.__palette );
        }
        return this.__colorReductionMap[ rgb ]; // Return palette index.
      };

      // Extracts unique colors from the image data.
      MedianCutColorReducer.prototype.__extractColors = function ( imageData ) {
        var maxIndex = imageData.width * imageData.height;
        var colorHash = { }; // To track unique colors.
        var colors = [ ]; // Array of unique color objects.

        for ( var i = 0; i < maxIndex; ++i ) {
          var r = imageData.data[ i * 4 + 0 ];
          var g = imageData.data[ i * 4 + 1 ];
          var b = imageData.data[ i * 4 + 2 ];
          // Convert RGB to a hex string for hashing.
          var rgb = ( ( r << 16 ) | ( g << 8 ) | ( b << 0 ) ).toString( 16 );
          while ( 6 - rgb.length ) {
            rgb = "0" + rgb;
          }
          if ( ! colorHash[ rgb ] ) {
            colorHash[ rgb ] = true; // Mark as seen.
            colors.push( {
              red: r,
              green: g,
              blue: b
            } );
          }
        }
        return colors; // Return the array of unique colors.
      };

      // Performs the median cut algorithm.
      MedianCutColorReducer.prototype.__medianCut = function ( colors, maxPaletteSize ) {
        var cubes = [ ];
        cubes.push( new ColorCube( colors ) ); // Start with one cube containing all colors.

        // Repeatedly divide cubes until maxPaletteSize is reached.
        while ( cubes.length < maxPaletteSize ) {
          // Sort cubes by number of colors in descending order.
          cubes.sort( function ( a, b ) {
            return b.getNumberOfColors ( ) - a.getNumberOfColors ( );
          } );

          var cube = cubes.shift ( ); // Get the largest cube.
          if ( ! cube || cube.getNumberOfColors ( ) === 1 ) {
            // Cannot divide further or only one color left.
            break;
          }

          var dividedCubes = cube.divide ( ); // Divide the cube.
          // Add newly divided cubes back to the list.
          dividedCubes.forEach( function ( c ) {
            cubes.push( c );
          } );
        }
        return cubes; // Return the final set of color cubes.
      };
      return MedianCutColorReducer; // Return the constructor.
    } ) ( );
    image.MedianCutColorReducer = MedianCutColorReducer; // Export to namespace.

  } ) ( vividcode.image || ( vividcode.image = { } ) );
} ) ( vividcode || ( vividcode = { } ) );