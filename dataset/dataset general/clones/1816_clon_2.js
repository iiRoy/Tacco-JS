/*
 * DocGen - Document Creation Library for JavaScript
 * Release 1.0.272-git Built on 2014-09-29T15:09
 *                           RevisionID d4770725ca
 *
 * Copyright (c) 2010-2014 Various Authors and Contributors
 *
 * This software is provided under the MIT License.
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
 * Primary Developers:
 *    James Hall, Aaron Spike, Willow Systems Corp, Pablo Hess,
 *    Florian Jenett, Warren Weckesser, Youssef Beddad, Lee Driscoll,
 *    Stefan Slonevskiy, Jeremy Morel, Christoph Hartmann,
 *    Juan Pablo Gaviria, James Makes, Diego Casorran
 *
 * Community Contributors:
 *    siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
 *    kim3er, mfo, alnorth, and others.
 */

/**
 * Initializes a new DocGen document object.
 *
 * @constructor
 * @param pageDirection Page layout: "portrait" or "landscape" (or "p", "l" - default is "p")
 * @param measureUnit   Unit of measurement for coordinates: "pt", "mm" (default), "cm", "in"
 * @param pageLayout    Predefined page size (e.g., 'a4'), default: a4
 * @returns {DocGen}
 * @name DocGen
 */
var DocGen = (function(execScope) {
  'use strict';
  var specVersion = '1.3',
    sheetSizes = { // Dimensions in points for standard paper types
      'a0'  : [2383.94, 3370.39], 'a1'  : [1683.78, 2383.94],
      'a2'  : [1190.55, 1683.78], 'a3'  : [ 841.89, 1190.55],
      'a4'  : [ 595.28,  841.89], 'a5'  : [ 419.53,  595.28],
      'a6'  : [ 297.64,  419.53], 'a7'  : [ 209.76,  297.64],
      'a8'  : [ 147.40,  209.76], 'a9'  : [ 104.88,  147.40],
      'a10' : [  73.70,  104.88], 'b0'  : [2834.65, 4008.19],
      'b1'  : [2004.09, 2834.65], 'b2'  : [1417.32, 2004.09],
      'b3'  : [1000.63, 1417.32], 'b4'  : [ 708.66, 1000.63],
      'b5'  : [ 498.90,  708.66], 'b6'  : [ 354.33,  498.90],
      'b7'  : [ 249.45,  354.33], 'b8'  : [ 175.75,  249.45],
      'b9'  : [ 124.72,  175.75], 'b10' : [  87.87,  124.72],
      'c0'  : [2599.37, 3676.54], 'c1'  : [1836.85, 2599.37],
      'c2'  : [1298.27, 1836.85], 'c3'  : [ 918.43, 1298.27],
      'c4'  : [ 649.13,  918.43], 'c5'  : [ 459.21,  649.13],
      'c6'  : [ 323.15,  459.21], 'c7'  : [ 229.61,  323.15],
      'c8'  : [ 161.57,  229.61], 'c9'  : [ 113.39,  161.57],
      'c10' : [  79.37,  113.39], 'dl'  : [ 311.81,  623.62],
      'letter'            : [612,   792],
      'government-letter' : [576,   756],
      'legal'             : [612,  1008],
      'junior-legal'      : [576,   360],
      'ledger'            : [1224,  792],
      'tabloid'           : [792,  1224],
      'credit-card'       : [153,   243]
    };

  /**
   * DocGen's internal event dispatching system.
   * Based on PubSub pattern.
   *
   * @class
   * @name EventBus
   */
  function EventBus(execContext) {
    var eventHandlers = {};

    this.register = function(eventName, handlerFunc, runOnce) {
      if(typeof handlerFunc !== 'function') {
        return false;
      }

      if(!eventHandlers.hasOwnProperty(eventName)) {
        eventHandlers[eventName] = {};
      }

      var subscriptionId = Math.random().toString(35);
      eventHandlers[eventName][subscriptionId] = [handlerFunc,!!runOnce];

      return subscriptionId;
    };

    this.deregister = function(subscriptionToken) {
      for(var evtName in eventHandlers) {
        if(eventHandlers[evtName][subscriptionToken]) {
          delete eventHandlers[evtName][subscriptionToken];
          return true;
        }
      }
      return false;
    };

    this.emit = function(eventName) {
      if(eventHandlers.hasOwnProperty(eventName)) {
        var eventArgs = Array.prototype.slice.call(arguments, 1), oneTimeHandlers = [];

        for(var subId in eventHandlers[eventName]) {
          var subscriber = eventHandlers[eventName][subId];
          try {
            subscriber[0].apply(execContext, eventArgs);
          } catch(exception) {
            if(execScope.console) {
              execScope.console.error('DocGen Event Error', exception.message, exception);
            }
          }
          if(subscriber[1]) oneTimeHandlers.push(subId);
        }
        if(oneTimeHandlers.length) oneTimeHandlers.forEach(this.deregister);
      }
    };
  }

  /**
   * @constructor
   * @private
   */
  function DocGen(pageDirection, measureUnit, pageLayout, enableCompression) {
    var configSettings = {};

    if (typeof pageDirection === 'object') {
      configSettings = pageDirection;

      pageDirection = configSettings.orientation;
      measureUnit = configSettings.unit || measureUnit;
      pageLayout = configSettings.format || pageLayout;
      enableCompression = configSettings.compress || configSettings.compressPdf || enableCompression;
    }

    // Default configuration values
    measureUnit        = measureUnit || 'mm';
    pageLayout      = pageLayout || 'a4';
    pageDirection = ('' + (pageDirection || 'P')).toLowerCase();

    var layout_as_text = ('' + pageLayout).toLowerCase(),
      shouldCompress = !!enableCompression && typeof Uint8Array === 'function',
      fontInk            = configSettings.textColor  || '0 g',
      lineInk            = configSettings.drawColor  || '0 G',
      currentTextSize       = configSettings.fontSize   || 16,
      lineSpaceFactor = configSettings.lineHeight || 1.15,
      strokeWidth            = configSettings.lineWidth  || 0.200025, // 2mm approx
      objectCounter =  2,  // Current internal object identifier
      outputToBuffers   = !1,  // Flag: true to write to page buffers, false for document content
      objectOffsets      = [],  // List of byte offsets for each object
      fontCollection        = {},  // Storage for font objects, keyed by dynamic identifier
      fontRegistry      = {},  // Lookup table: fontName -> fontStyle -> fontKey
      currentFontIdentifier,      // Key of the currently active font
      scaleMultiplier,                  // Scaling factor for units
      tempVar,
      currentPageIndex = 0,
      activePageIndex,
      pageContentBuffers = [],
      pageDimensions = {},
      documentContent = [],
      capStyleId = 0,
      joinStyleId = 0,
      contentByteLength = 0,
      activePageWidth,
      activePageHeight,
      viewerPageMode,
      viewerZoomMode,
      viewerLayoutMode,
      documentMetadata = {
        'title'    : '',
        'subject'  : '',
        'author'   : '',
        'keywords' : '',
        'creator'  : ''
      },
      internalAPI = {},
      eventDispatcher = new EventBus(internalAPI),

    ///////////////////////////
    // Auxiliary Subroutines //
    ///////////////////////////
    formatDecTwo = function(numValue) {
      return numValue.toFixed(2); // e.g., 12.34
    },
    formatDecThree = function(numValue) {
      return numValue.toFixed(3); // e.g., 12.345
    },
    padTwoDigits = function(numValue) {
      return ('0' + parseInt(numValue)).slice(-2);
    },
    writeToOutput = function(outputString) {
      if (outputToBuffers) {
        /* set by beginPage */
        pageContentBuffers[activePageIndex].push(outputString);
      } else {
        // +1 for the newline char that will join content segments
        contentByteLength += outputString.length + 1;
        documentContent.push(outputString);
      }
    },
    createObjectEntry = function() {
      // Start a new object in the PDF stream
      objectCounter++;
      objectOffsets[objectCounter] = contentByteLength;
      writeToOutput(objectCounter + ' 0 obj');
      return objectCounter;
    },
    writeStreamBlock = function(streamData) {
      writeToOutput('stream');
      writeToOutput(streamData);
      writeToOutput('endstream');
    },
    generatePageObjects = function() {
      var idx, pageData, byteArray, loopCounter, compressor, checksumVal, checksumUtil, widthInPoints, heightInPoints;

      checksumUtil = execScope.adler32cs || DocGen.checksumUtility;
      if (shouldCompress && typeof checksumUtil === 'undefined') {
        shouldCompress = false;
      }

      // outputToBuffers is false here, so writeToOutput() appends to documentContent.

      for (idx = 1; idx <= currentPageIndex; idx++) {
        createObjectEntry();
        widthInPoints = (activePageWidth = pageDimensions[idx].width) * scaleMultiplier;
        heightInPoints = (activePageHeight = pageDimensions[idx].height) * scaleMultiplier;
        writeToOutput('<</Type /Page');
        writeToOutput('/Parent 1 0 R');
        writeToOutput('/Resources 2 0 R');
        writeToOutput('/MediaBox [0 0 ' + formatDecTwo(widthInPoints) + ' ' + formatDecTwo(heightInPoints) + ']');
        writeToOutput('/Contents ' + (objectCounter + 1) + ' 0 R>>');
        writeToOutput('endobj');

        // Page stream data
        pageData = pageContentBuffers[idx].join('\n');
        createObjectEntry();
        if (shouldCompress) {
          byteArray = [];
          loopCounter = pageData.length;
          while(loopCounter--) {
            byteArray[loopCounter] = pageData.charCodeAt(loopCounter);
          }
          checksumVal = checksumUtil.from(pageData);
          compressor = new Deflater(6);
          compressor.append(new Uint8Array(byteArray));
          pageData = compressor.flush();
          byteArray = new Uint8Array(pageData.length + 6);
          byteArray.set(new Uint8Array([120, 156])),
          byteArray.set(pageData, 2);
          byteArray.set(new Uint8Array([checksumVal & 0xFF, (checksumVal >> 8) & 0xFF, (checksumVal >> 16) & 0xFF, (checksumVal >> 24) & 0xFF]), pageData.length+2);
          pageData = String.fromCharCode.apply(null, byteArray);
          writeToOutput('<</Length ' + pageData.length + ' /Filter [/FlateDecode]>>');
        } else {
          writeToOutput('<</Length ' + pageData.length + '>>');
        }
        writeStreamBlock(pageData);
        writeToOutput('endobj');
      }
      objectOffsets[1] = contentByteLength;
      writeToOutput('1 0 obj');
      writeToOutput('<</Type /Pages');
      var childRefs = '/Kids [';
      for (loopCounter = 0; loopCounter < currentPageIndex; loopCounter++) {
        childRefs += (3 + 2 * loopCounter) + ' 0 R ';
      }
      writeToOutput(childRefs + ']');
      writeToOutput('/Count ' + currentPageIndex);
      writeToOutput('>>');
      writeToOutput('endobj');
    },
    serializeFontObject = function(fontObj) {
      fontObj.objectNumber = createObjectEntry();
      writeToOutput('<</BaseFont/' + fontObj.postscriptName + '/Type/Font');
      if (typeof fontObj.charEncoding === 'string') {
        writeToOutput('/Encoding/' + fontObj.charEncoding);
      }
      writeToOutput('/Subtype/Type1>>');
      writeToOutput('endobj');
    },
    serializeAllFonts = function() {
      for (var fKey in fontCollection) {
        if (fontCollection.hasOwnProperty(fKey)) {
          serializeFontObject(fontCollection[fKey]);
        }
      }
    },
    serializeXObjects = function() {
      // Iterate through image data or other external objects
      eventDispatcher.emit('serializeXObjects');
    },
    serializeResourceDict = function() {
      writeToOutput('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
      writeToOutput('/Font <<');

      // For each registered font, add its reference
      for (var fKey in fontCollection) {
        if (fontCollection.hasOwnProperty(fKey)) {
          writeToOutput('/' + fKey + ' ' + fontCollection[fKey].objectNumber + ' 0 R');
        }
      }
      writeToOutput('>>');
      writeToOutput('/XObject <<');
      serializeXObjects();
      writeToOutput('>>');
    },
    serializeDocumentResources = function() {
      serializeAllFonts();
      eventDispatcher.emit('serializeDocumentResources');
      // Document-wide resource dictionary
      objectOffsets[2] = contentByteLength;
      writeToOutput('2 0 obj');
      writeToOutput('<<');
      serializeResourceDict();
      writeToOutput('>>');
      writeToOutput('endobj');
      eventDispatcher.emit('postSerializeResources');
    },
    updateFontRegistry = function(fId, familyName, styleVariant) {
      // This structure provides quick lookup for font keys.
      // Returns the internal font key (e.g., "F1") for a given
      // font family and style (e.g., "Arial", "Italic")
      if (!fontRegistry.hasOwnProperty(familyName)) {
        fontRegistry[familyName] = {};
      }
      fontRegistry[familyName][styleVariant] = fId;
    },
    /**
     * FontEntry describes a specific font within a DocGen instance.
     *
     * It holds properties like 'id' (for PDF stream use),
     * 'fontName' (font's family name), 'fontStyle' (style variant label).
     *
     * @class
     * @public
     * @property id {String} Document-specific label assigned to the font.
     * @property postscriptName {String} Full name for the font as per PDF specification
     * @property charEncoding {Object} Encoding name to font metrics object mapping.
     * @name FontEntry
     */
    registerFont = function(postscriptName, familyName, styleVariant, charEncoding) {
      var fIdentifier = 'F' + (Object.keys(fontCollection).length + 1).toString(10),
      // This is the FontEntry object
      newFontEntry = fontCollection[fIdentifier] = {
        'id'             : fIdentifier,
        'postscriptName' : postscriptName,
        'fontName'       : familyName,
        'fontStyle'      : styleVariant,
        'charEncoding'   : charEncoding,
        'metadata'       : {}
      };
      updateFontRegistry(fIdentifier, familyName, styleVariant);
      eventDispatcher.emit('registerFont', newFontEntry);

      return fIdentifier;
    },
    preloadStandardFonts = function() {

      var SANS_SERIF     = "helvetica",
        SERIF_ROMAN         = "times",
        MONOSPACE       = "courier",
        REGULAR_STYLE        = "normal",
        STRONG_STYLE          = "bold",
        OBLIQUE_STYLE        = "italic",
        STRONG_OBLIQUE_STYLE   = "bolditalic",
        defaultEncoding      = 'StandardEncoding',
        predefinedFonts = [
          ['Helvetica', SANS_SERIF, REGULAR_STYLE],
          ['Helvetica-Bold', SANS_SERIF, STRONG_STYLE],
          ['Helvetica-Oblique', SANS_SERIF, OBLIQUE_STYLE],
          ['Helvetica-BoldOblique', SANS_SERIF, STRONG_OBLIQUE_STYLE],
          ['Courier', MONOSPACE, REGULAR_STYLE],
          ['Courier-Bold', MONOSPACE, STRONG_STYLE],
          ['Courier-Oblique', MONOSPACE, OBLIQUE_STYLE],
          ['Courier-BoldOblique', MONOSPACE, STRONG_OBLIQUE_STYLE],
          ['Times-Roman', SERIF_ROMAN, REGULAR_STYLE],
          ['Times-Bold', SERIF_ROMAN, STRONG_STYLE],
          ['Times-Italic', SERIF_ROMAN, OBLIQUE_STYLE],
          ['Times-BoldItalic', SERIF_ROMAN, STRONG_OBLIQUE_STYLE]
        ];

      for (var loopCounter = 0, limit = predefinedFonts.length; loopCounter < limit; loopCounter++) {
        var fIdentifier = registerFont(
            predefinedFonts[loopCounter][0],
            predefinedFonts[loopCounter][1],
            predefinedFonts[loopCounter][2],
            defaultEncoding);

        // Add secondary aliases for standard fonts, matching original capitalization
        var nameParts = predefinedFonts[loopCounter][0].split('-');
        updateFontRegistry(fIdentifier, nameParts[0], nameParts[1] || '');
      }
      eventDispatcher.emit('preloadStandardFonts', { fonts : fontCollection, dictionary : fontRegistry });
    },
    secureCall = function _protectedInvoke(targetFn) {
      targetFn.wrappedFn = function _invokeWrapper() {
        try {
          return targetFn.apply(this, arguments);
        } catch (errorObject) {
          var callStack = errorObject.stack || '';
          if(~callStack.indexOf(' at ')) callStack = callStack.split(" at ")[1];
          var errorMessage = "Function execution error in " + callStack.split("\n")[0].split('<')[0] + ": " + errorObject.message;
          if(execScope.console) {
            execScope.console.error(errorMessage, errorObject);
            if(execScope.alert) execScope.alert(errorMessage);
          } else {
            throw new Error(errorMessage);
          }
        }
      };
      targetFn.wrappedFn.bar = targetFn;
      return targetFn.wrappedFn;
    },
    convertToEightBit = function(inputText, conversionFlags) {
    /**
     * PDF 1.3 specification:
     * "For text strings encoded in Unicode, the initial two bytes must be 254 followed by
     * 255, representing the Unicode byte order marker, U+FEFF. (This sequence clashes
     * with the PDFDocEncoding character sequence thorn ydieresis, which is unlikely
     * to be a meaningful start to a word or phrase.) The remainder of the
     * string comprises Unicode character codes, according to the UTF-16 encoding
     * specified in the Unicode standard, version 2.0. Commonly used Unicode values
     * are represented as 2 bytes per character, with the higher-order byte appearing first
     * in the string."
     *
     * In essence, if a string contains characters with a code point above 255, we
     * re-encode the string to UCS2 BE - the string doubles in length and a BOM is prefixed.
     *
     * IMPORTANT NOTE!
     * Actual *document body* text (unlike strings used for document properties)
     * does NOT expect a BOM. In that context, it's treated as a literal GID (Glyph ID).
     *
     * Due to Adobe's emphasis on font subsetting, you typically wouldn't have
     * a font that directly maps Unicode (UCS2 / UTF16BE) code points to font GIDs. However,
     * one could simulate this with "Identity-H" encoding and a custom CIDtoGID map mirroring a Unicode
     * code page. In such a scenario, all characters in the stream are treated as GIDs,
     * including the BOM. This is why we need to omit the BOM for content text (i.e., text
     * rendered with a font).
     *
     * To signal this specific "PDFEscape / convertToEightBit" handling mode,
     * the internalAPI.drawText() function sets (unless overridden by manual values
     * provided to internalAPI.drawText(.., conversionFlags) ):
     * conversionFlags.autoProcess = true
     * conversionFlags.skipBOM = true
     *
     * ===================================================================================
     * `conversionFlags` properties used:
     *   .inputEncodingType = string indicating encoding label.
     *                     Defaults to "Unicode". This is the encoding of the input text.
     *                     Pass a non-existent encoding name
     *                     (e.g., 'Do not modify my text! I understand the implications.')
     *                     to bypass the encoding process.
     *   .outputEncodingType = Either a valid PDF encoding name
     *                     (must be supported by DocGen font metrics, otherwise no encoding occurs)
     *                     or a JavaScript object, where key = sourceCharCode, value = outputCharCode.
     *                     Missing keys are handled as: sourceCharCode === outputCharCode.
     *   .skipBOM
     *       Refer to the explanation above for its significance.
     *   .autoProcess
     *       Refer to the explanation above for its significance.
     */

      var idx, lengthVal, inputEncodingType, encodingMap, outputEncodingType, transformedText, isTextUnicode, charVal, byteChar;

      conversionFlags = conversionFlags || {};
      inputEncodingType = conversionFlags.inputEncodingType || 'Unicode';
      outputEncodingType = conversionFlags.outputEncodingType;

      // This 'encoding' part relies on the font metrics format
      // attached to font objects, for example, by
      // "Willow Systems' standard_font_metrics plugin"
      // See jspdf.plugin.standard_font_metrics.js for the format
      // of the font.metadata.encoding Object.
      // It should be structured like:
      //   .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
      //   .widths = {0:width, code:width, ..., 'fof':divisor}
      //   .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
      if ((conversionFlags.autoProcess || outputEncodingType) &&