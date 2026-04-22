/**
 * @license
 * DocGenius - Advanced Document Generation Framework for JavaScript
 * Version 1.0.272-git Built on 2014-09-29T15:09
 *                           CommitID d4770725ca
 *
 * Copyright (c) 2010-2014 Various contributors, full list below.
 *
 * This software is licensed under the MIT License.
 * Full text of the license is included below for convenience.
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
 * Primary Original Author: James Hall (MrRio)
 * Key Collaborators: Aaron Spike, Willow Systems Corp, Pablo Hess, Florian Jenett,
 * Warren Weckesser, Youssef Beddad, Lee Driscoll, Stefan Slonevskiy, Jeremy Morel,
 * Christoph Hartmann, Juan Pablo Gaviria, James Makes, Diego Casorran.
 *
 * Additional Community Contributions by: siefkenj, ahwolf, rickygu, Midnith,
 * saintclair, eaparango, kim3er, mfo, alnorth.
 */

/**
 * Instantiates a new document processing object.
 * This class facilitates the creation and manipulation of PDF documents
 * directly within a web browser or Node.js environment.
 *
 * @class
 * @param pageLayout    Initial page orientation: "portrait" ("P") or "landscape" ("L"). Defaults to "P".
 * @param measureUnit   Standard measurement unit: "pt" (points), "mm" (Default), "cm", "in".
 * @param pagePreset    Document size preset (e.g., "a4", "letter"). Defaults to "a4".
 * @returns {DocGenius} An instance of the document generator.
 * @name DocGenius
 */
var DocGenius = (function(rootContext) {
  'use strict';

  var protocolRevision = '1.3',
      dimensionPresets = { // Standard paper dimensions in points (pt)
        'a0' : [2383.94, 3370.39], 'a1' : [1683.78, 2383.94],
        'a2' : [1190.55, 1683.78], 'a3' : [ 841.89, 1190.55],
        'a4' : [ 595.28,  841.89], 'a5' : [ 419.53,  595.28],
        'a6' : [ 297.64,  419.53], 'a7' : [ 209.76,  297.64],
        'a8' : [ 147.40,  209.76], 'a9' : [ 104.88,  147.40],
        'a10': [  73.70,  104.88], 'b0' : [2834.65, 4008.19],
        'b1' : [2004.09, 2834.65], 'b2' : [1417.32, 2004.09],
        'b3' : [1000.63, 1417.32], 'b4' : [ 708.66, 1000.63],
        'b5' : [ 498.90,  708.66], 'b6' : [ 354.33,  498.90],
        'b7' : [ 249.45,  354.33], 'b8' : [ 175.75,  249.45],
        'b9' : [ 124.72,  175.75], 'b10': [  87.87,  124.72],
        'c0' : [2599.37, 3676.54], 'c1' : [1836.85, 2599.37],
        'c2' : [1298.27, 1836.85], 'c3' : [ 918.43, 1298.27],
        'c4' : [ 649.13,  918.43], 'c5' : [ 459.21,  649.13],
        'c6' : [ 323.15,  459.21], 'c7' : [ 229.61,  323.15],
        'c8' : [ 161.57,  229.61], 'c9' : [ 113.39,  161.57],
        'c10': [  79.37,  113.39], 'dl' : [ 311.81,  623.62],
        'letter'           : [612,   792],
        'government-letter': [576,   756],
        'legal'            : [612,  1008],
        'junior-legal'     : [576,   360],
        'ledger'           : [1224,  792],
        'tabloid'          : [792,  1224],
        'credit-card'      : [153,   243]
      };

  /**
   * Simple EventBroadcaster for internal messaging.
   * Based on PubSub pattern.
   *
   * @class
   * @name EventBroadcaster
   */
  function EventBroadcaster(execScope) {
    var eventChannels = {}; // Stores topic-to-listener mappings

    /**
     * Registers a new listener for a specific event topic.
     * @param {string} topic The name of the event channel.
     * @param {Function} handlerFn The callback function to execute when the event is emitted.
     * @param {boolean} [singleInvocation=false] If true, the listener will be removed after its first execution.
     * @returns {string|boolean} A unique ID for the subscription, or false if handlerFn is not a function.
     */
    this.registerListener = function(topic, handlerFn, singleInvocation) {
      if (typeof handlerFn !== 'function') {
        return false;
      }

      if (!eventChannels.hasOwnProperty(topic)) {
        eventChannels[topic] = {};
      }

      var subscriptionId = 'sub_' + Math.random().toString(36).substr(2, 9);
      eventChannels[topic][subscriptionId] = [handlerFn, !!singleInvocation];

      return subscriptionId;
    };

    /**
     * Removes a listener using its unique subscription ID.
     * @param {string} listenerRef The ID returned by `registerListener`.
     * @returns {boolean} True if the listener was successfully removed, false otherwise.
     */
    this.deregisterListener = function(listenerRef) {
      for (var channelName in eventChannels) {
        if (eventChannels.hasOwnProperty(channelName) && eventChannels[channelName][listenerRef]) {
          delete eventChannels[channelName][listenerRef];
          return true;
        }
      }
      return false;
    };

    /**
     * Emits an event, triggering all registered listeners for that topic.
     * @param {string} topic The name of the event channel to emit.
     * @param {...any} eventArgs Additional arguments to pass to the listeners.
     */
    this.emitEvent = function(topic) {
      if (eventChannels.hasOwnProperty(topic)) {
        var eventArgs = Array.prototype.slice.call(arguments, 1);
        var toRemoveIds = [];

        for (var subId in eventChannels[topic]) {
          if (eventChannels[topic].hasOwnProperty(subId)) {
            var currentSubscription = eventChannels[topic][subId];
            try {
              currentSubscription[0].apply(execScope, eventArgs);
            } catch (err) {
              if (rootContext.console) {
                rootContext.console.error('DocGenius Event Error on topic "' + topic + '":', err.message, err);
              }
            }
            if (currentSubscription[1]) { // If it's a single-invocation listener
              toRemoveIds.push(subId);
            }
          }
        }
        // Deregister one-time listeners
        if (toRemoveIds.length > 0) {
          var k = 0;
          while(k < toRemoveIds.length) {
            this.deregisterListener(toRemoveIds[k]);
            k++;
          }
        }
      }
    };
  }

  /**
   * @constructor
   * @private
   */
  function DocGenius(pageLayout, measureUnit, pagePreset, enableCompression) {
    var configObj = {};

    // Handle options object as first argument
    if (typeof pageLayout === 'object' && pageLayout !== null) {
      configObj = pageLayout;
      pageLayout = configObj.pageLayout || configObj.orientation;
      measureUnit = configObj.measureUnit || configObj.unit || measureUnit;
      pagePreset = configObj.pagePreset || configObj.format || pagePreset;
      enableCompression = configObj.compress || configObj.enableCompression || configObj.compressPdf || enableCompression;
    }

    // Apply default configuration values if not provided
    var currentUnit = measureUnit || 'mm';
    var currentFormat = (pagePreset || 'a4').toString().toLowerCase();
    var currentLayout = (pageLayout || 'P').toString().toLowerCase();

    // Check for compression capability
    var isCompressed = !!enableCompression;
    if (isCompressed && typeof Uint8Array === 'undefined') {
        // Fallback if Typed Arrays are not available for compression
        isCompressed = false;
        if (rootContext.console) {
            rootContext.console.warn("Compression requested but Uint8Array not supported. Disabling compression.");
        }
    }

    // Document styling and state variables
    var fontColorCode = configObj.textColor || '0 g';
    var lineColorCode = configObj.drawColor || '0 G';
    var baseFontSize = configObj.fontSize || 16;
    var lineHeightFactor = configObj.lineHeight || 1.150001; // Slightly altered from 1.15
    var strokeWidth = configObj.lineWidth || 0.200025; // 2mm default

    // PDF structural variables
    var currentObjIndex = 2; // Starting object number in PDF structure
    var outputToPageBuffer = false; // Flag: true = append to current page buffer, false = append to main document stream
    var objOffsets = []; // Stores byte offsets for each PDF object
    var fontRegistry = {}; // Map of fontKey -> FontObject
    var fontAliasMap = {}; // Map of fontName -> fontStyle -> fontKey for quick lookup
    var activeFontIdentifier; // Key of the currently selected font
    var scaleFactor; // Unit conversion factor (points per currentUnit)
    var tempVar; // Generic temporary variable
    var currentPageNum = 0; // Current logical page number (1-based)
    var activePageIndex; // Index of the current page in `pageContentBuffers` (1-based)
    var pageContentBuffers = []; // Array of arrays, each sub-array holds content for a page
    var pageDimensions = {}; // Stores width/height for each page
    var documentContentStream = []; // Main content stream for PDF structure
    var currentLineCapStyle = 0; // Line cap style (0: butt, 1: round, 2: projecting square)
    var currentLineJoinStyle = 0; // Line join style (0: miter, 1: round, 2: bevel)
    var streamLengthAccumulator = 0; // Tracks total length of `documentContentStream` for offsets
    var activePageWidth; // Width of the current page in points
    var activePageHeight; // Height of the current page in points
    var docPageMode; // How to display the document's pages
    var docZoomMode; // How to display the document's initial zoom
    var docLayoutMode; // How to display the document's layout

    // Document metadata
    var docMetadata = {
      'title'   : configObj.title    || '',
      'subject' : configObj.subject  || '',
      'author'  : configObj.author   || '',
      'keywords': configObj.keywords || '',
      'creator' : configObj.creator  || ''
    };

    var documentAPI = {}; // Public API object returned by the constructor
    var eventHub = new EventBroadcaster(documentAPI); // Event system for plugins

    ///////////////////////////////
    // Core utility functions
    ///////////////////////////////

    /**
     * Formats a number to two decimal places.
     * @private
     * @param {number} num The number to format.
     * @returns {string} The formatted number.
     */
    var formatFloatTwo = function(num) {
      return num.toFixed(2);
    };

    /**
     * Formats a number to three decimal places.
     * @private
     * @param {number} num The number to format.
     * @returns {string} The formatted number.
     */
    var formatFloatThree = function(num) {
      return num.toFixed(3);
    };

    /**
     * Pads a number with a leading zero if it's a single digit.
     * @private
     * @param {number} num The number to pad.
     * @returns {string} The padded number string.
     */
    var padNumberLeadingZero = function(num) {
      return ('0' + parseInt(num, 10)).slice(-2);
    };

    /**
     * Writes a string to the appropriate content buffer.
     * If `outputToPageBuffer` is true, it appends to the current page's content.
     * Otherwise, it appends to the main document stream.
     * @private
     * @param {string} textString The string content to write.
     */
    var writeToStream = function(textString) {
      if (typeof textString !== 'string') {
          // Guard for non-string input
          textString = String(textString);
      }
      if (outputToPageBuffer === true) {
        pageContentBuffers[activePageIndex].push(textString);
      } else {
        // Each entry is followed by a newline, so account for that in length
        streamLengthAccumulator += textString.length + 1;
        documentContentStream.push(textString);
      }
    };

    /**
     * Creates a new PDF object entry.
     * Increments the object counter, records its offset, and writes its header.
     * @private
     * @returns {number} The new object's ID.
     */
    var createPdfObject = function() {
      currentObjIndex++;
      objOffsets[currentObjIndex] = streamLengthAccumulator;
      writeToStream(currentObjIndex + ' 0 obj');
      return currentObjIndex;
    };

    /**
     * Writes a stream of data enclosed in 'stream' and 'endstream' tags.
     * @private
     * @param {string} streamData The data to be embedded as a stream.
     */
    var embedStreamData = function(streamData) {
      writeToStream('stream');
      writeToStream(streamData);
      writeToStream('endstream');
    };

    /**
     * Generates all page objects and their content streams.
     * This function iterates through all accumulated page content,
     * applies compression if enabled, and writes the PDF objects.
     * @private
     */
    var generatePageObjects = function() {
      var pageIdx, pageContent, byteArr, charCount, deflaterInstance, adlerChecksum, compressedData;
      var currentWidthPoints, currentHeightPoints;

      // Ensure that 'adler32cs' is available if compression is enabled.
      // If not, fall back to uncompressed mode for this operation.
      var adlerChecksumUtil = rootContext.adler32cs || DocGenius.adler32cs;
      if (isCompressed && typeof adlerChecksumUtil === 'undefined') {
          isCompressed = false;
          if (rootContext.console) {
              rootContext.console.warn("adler32cs not found. Disabling compression for page content.");
          }
      }

      // `outputToPageBuffer` should be false here, ensured by `endDocument()` context.
      // This means `writeToStream` will append to `documentContentStream`.

      pageIdx = 1;
      while (pageIdx <= currentPageNum) {
        createPdfObject();
        currentWidthPoints = pageDimensions[pageIdx].width * scaleFactor;
        currentHeightPoints = pageDimensions[pageIdx].height * scaleFactor;

        writeToStream('<< /Type /Page');
        writeToStream('/Parent 1 0 R'); // Reference to the main Pages object
        writeToStream('/Resources 2 0 R'); // Reference to the shared resource dictionary
        writeToStream('/MediaBox [0 0 ' + formatFloatTwo(currentWidthPoints) + ' ' + formatFloatTwo(currentHeightPoints) + ']');
        writeToStream('/Contents ' + (currentObjIndex + 1) + ' 0 R >>');
        writeToStream('endobj');

        // Process page content
        pageContent = pageContentBuffers[pageIdx].join('\n');
        createPdfObject();

        if (isCompressed) {
          byteArr = [];
          charCount = pageContent.length;
          while(charCount--) {
            byteArr[charCount] = pageContent.charCodeAt(charCount);
          }
          adlerChecksum = adlerChecksumUtil.from(pageContent);
          deflaterInstance = new Deflater(6); // Compression level 6
          deflaterInstance.append(new Uint8Array(byteArr));
          compressedData = deflaterInstance.flush();

          // Construct the final compressed byte array with ZLIB header and Adler-32 checksum
          var finalByteArray = new Uint8Array(compressedData.length + 6);
          finalByteArray.set(new Uint8Array([120, 156])); // ZLIB header (CMF/FLG)
          finalByteArray.set(compressedData, 2); // Compressed data
          finalByteArray.set(new Uint8Array([
              adlerChecksum & 0xFF,
              (adlerChecksum >> 8) & 0xFF,
              (adlerChecksum >> 16) & 0xFF,
              (adlerChecksum >> 24) & 0xFF
          ]), compressedData.length + 2);

          pageContent = String.fromCharCode.apply(null, finalByteArray);
          writeToStream('<</Length ' + pageContent.length + ' /Filter [/FlateDecode]>>');
        } else {
          writeToStream('<</Length ' + pageContent.length + '>>');
        }
        embedStreamData(pageContent);
        writeToStream('endobj');
        pageIdx++;
      }

      // Create the main /Pages object (object ID 1)
      objOffsets[1] = streamLengthAccumulator;
      writeToStream('1 0 obj');
      writeToStream('<</Type /Pages');
      var pageKidsRefs = '/Kids [';
      for (var k = 0; k < currentPageNum; k++) {
        // Each page object is (3 + 2*k) 0 R, as page objects start from obj ID 3
        pageKidsRefs += (3 + 2 * k) + ' 0 R ';
      }
      writeToStream(pageKidsRefs + ']');
      writeToStream('/Count ' + currentPageNum);
      writeToStream('>>');
      writeToStream('endobj');
    };

    /**
     * Emits a single font object to the PDF stream.
     * @private
     * @param {object} fontData The font object containing details.
     */
    var emitFontObject = function(fontData) {
      fontData.objectNumber = createPdfObject();
      writeToStream('<</BaseFont/' + fontData.PostScriptName + '/Type/Font');
      if (typeof fontData.encoding === 'string') {
        writeToStream('/Encoding/' + fontData.encoding);
      }
      writeToStream('/Subtype/Type1>>');
      writeToStream('endobj');
    };

    /**
     * Iterates through all registered fonts and emits their PDF objects.
     * @private
     */
    var emitAllFontObjects = function() {
      for (var fontKeyId in fontRegistry) {
        if (fontRegistry.hasOwnProperty(fontKeyId)) {
          emitFontObject(fontRegistry[fontKeyId]);
        }
      }
    };

    /**
     * Emits the XObject dictionary for external objects like images.
     * This is an extension point for plugins.
     * @private
     */
    var emitXObjectDictionary = function() {
      eventHub.emitEvent('putXobjectDict');
    };

    /**
     * Constructs and emits the resource dictionary object.
     * This dictionary lists all fonts, XObjects (images), and ProcSet.
     * @private
     */
    var buildResourceDictionary = function() {
      writeToStream('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
      writeToStream('/Font <<');

      for (var fontKeyId in fontRegistry) {
        if (fontRegistry.hasOwnProperty(fontKeyId)) {
          writeToStream('/' + fontKeyId + ' ' + fontRegistry[fontKeyId].objectNumber + ' 0 R');
        }
      }
      writeToStream('>>');
      writeToStream('/XObject <<');
      emitXObjectDictionary(); // Call plugin hook for images/forms
      writeToStream('>>');
    };

    /**
     * Orchestrates the emission of all resource-related PDF objects.
     * This includes fonts and the main resource dictionary.
     * @private
     */
    var emitAllResources = function() {
      emitAllFontObjects();
      eventHub.emitEvent('putResources'); // Plugin hook for additional resources

      // The main Resource Dictionary is object ID 2
      objOffsets[2] = streamLengthAccumulator;
      writeToStream('2 0 obj');
      writeToStream('<<');
      buildResourceDictionary();
      writeToStream('>>');
      writeToStream('endobj');
      eventHub.emitEvent('postPutResources'); // Plugin hook after resources are written
    };

    /**
     * Populates the font alias map for quick font lookup.
     * @private
     * @param {string} fontKey The generated key for the font (e.g., "F1").
     * @param {string} fontName The family name of the font (e.g., "Helvetica").
     * @param {string} fontStyle The style variant (e.g., "normal", "bold").
     */
    var addFontToAliasMap = function(fontKey, fontName, fontStyle) {
      if (!fontAliasMap.hasOwnProperty(fontName)) {
        fontAliasMap[fontName] = {};
      }
      fontAliasMap[fontName][fontStyle] = fontKey;
    };

    /**
     * Registers a new font with the document.
     * Creates a FontObject and adds it to the font registry and alias map.
     *
     * @class
     * @public
     * @property {string} id Unique identifier for the font within the PDF.
     * @property {string} PostScriptName The PDF standard name for the font.
     * @property {string} fontName The human-readable family name.
     * @property {string} fontStyle The style variant (e.g., "normal", "italic").
     * @property {object} encoding Encoding information for the font.
     * @property {object} metadata Additional font-specific data.
     * @name RegisteredFont
     *
     * @param {string} postscriptName The PostScript name of the font.
     * @param {string} familyName The family name of the font.
     * @param {string} styleVariant The style variant of the font.
     * @param {string} [encoding='StandardEncoding'] The encoding used for this font.
     * @returns {string} The unique font key assigned to this font.
     */
    var registerFont = function(postscriptName, familyName, styleVariant, encoding) {
      var newFontKey = 'F' + (Object.keys(fontRegistry).length + 1).toString(10);
      var fontDetails = {
        'id'            : newFontKey,
        'PostScriptName': postscriptName,
        'fontName'      : familyName,
        'fontStyle'     : styleVariant,
        'encoding'      : encoding || 'StandardEncoding', // Default to StandardEncoding
        'metadata'      : {}
      };

      fontRegistry[newFontKey] = fontDetails;
      addFontToAliasMap(newFontKey, familyName, styleVariant);
      eventHub.emitEvent('addFont', fontDetails);

      return newFontKey;
    };

    /**
     * Initializes the standard 14 PDF fonts.
     * These fonts are guaranteed to be available in any PDF viewer.
     * @private
     */
    var initializeStandardFonts = function() {
      var FONT_HELVETICA = "helvetica",
          FONT_TIMES     = "times",
          FONT_COURIER   = "courier",
          STYLE_NORMAL   = "normal",
          STYLE_BOLD     = "bold",
          STYLE_ITALIC   = "italic",
          STYLE_BOLD_ITALIC = "bolditalic",
          DEFAULT_ENCODING  = 'StandardEncoding';

      var predefinedFonts = [
        ['Helvetica', FONT_HELVETICA, STYLE_NORMAL],
        ['Helvetica-Bold', FONT_HELVETICA, STYLE_BOLD],
        ['Helvetica-Oblique', FONT_HELVETICA, STYLE_ITALIC],
        ['Helvetica-BoldOblique', FONT_HELVETICA, STYLE_BOLD_ITALIC],
        ['Courier', FONT_COURIER, STYLE_NORMAL],
        ['Courier-Bold', FONT_COURIER, STYLE_BOLD],
        ['Courier-Oblique', FONT_COURIER, STYLE_ITALIC],
        ['Courier-BoldOblique', FONT_COURIER, STYLE_BOLD_ITALIC],
        ['Times-Roman', FONT_TIMES, STYLE_NORMAL],
        ['Times-Bold', FONT_TIMES, STYLE_BOLD],
        ['Times-Italic', FONT_TIMES, STYLE_ITALIC],
        ['Times-BoldItalic', FONT_TIMES, STYLE_BOLD_ITALIC]
      ];

      for (var idx = 0; idx < predefinedFonts.length; idx++) {
        var currentFont = predefinedFonts[idx];
        var fontIdentifier = registerFont(
            currentFont[0],
            currentFont[1],
            currentFont[2],
            DEFAULT_ENCODING
        );

        // Add aliases for standard fonts using their PostScript name capitalization
        var nameParts = currentFont[0].split('-');
        addFontToAliasMap(fontIdentifier, nameParts[0], nameParts[1] || '');
      }
      eventHub.emitEvent('addFonts', { registeredFonts : fontRegistry, lookupMap : fontAliasMap });
    };

    /**
     * Wraps a function in a try-catch block to prevent uncaught errors
     * from crashing the application. Logs errors to console and alerts if available.
     * @private
     * @param {Function} targetFunction The function to wrap.
     * @returns {Function} The wrapped function.
     */
    var safeExecutionWrapper = function(targetFunction) {
      // The `foo` and `bar` properties are for internal tracking/debugging
      var wrappedFunction = function __safeCallWrapper() {
        try {
          return targetFunction.apply(this, arguments);
        } catch (error) {
          var errorStack = error.stack || '';
          var errorMessage = "Error encountered during execution. Details: " + error.message;

          if (errorStack.indexOf(' at ') !== -1) {
              // Attempt to extract the relevant line from the stack trace
              var stackLine = errorStack.split(" at ")[1];
              if (stackLine) {
                  errorMessage = "Error in function " + stackLine.split("\n")[0].split('<')[0] + ": " + error.message;
              }
          }

          if (rootContext.console) {
            rootContext.console.error(errorMessage, error);
            if (rootContext.alert) { // Also alert if in a browser environment
                rootContext.alert(errorMessage);
            }
          } else {
            // Re-throw if no console is available to prevent silent failures in non-browser envs
            throw new Error(errorMessage);
          }
        }
      };
      wrappedFunction.original = targetFunction; // Reference to the original function
      return wrappedFunction;
    };

    /**
     * Converts a text string into an 8-bit or UCS2-BE octet stream suitable for PDF.
     * Handles Unicode BOM and character encoding based on flags.
     *
     * The PDF specification has specific requirements for text strings:
     * - For Unicode strings, a Byte Order Mark (BOM) `U+FEFF` (254 255) must prepend the UTF-16BE encoded data.
     * - However, for text *content* within a PDF stream (e.g., text drawn on a page),
     *   the BOM is usually omitted because the font's encoding (e.g., Identity-H)
     *   treats stream bytes as Glyph IDs, not Unicode code points.
     *
     * This function uses `flags` to control this behavior:
     * - `flags.sourceEncoding`:  The encoding of the input `textString` (e.g., 'Unicode').
     * - `flags.outputEncoding`: The desired output encoding (e.g., 'PDFDocEncoding', or a custom map).
     * - `flags.noBOM`: If true, the Unicode BOM is suppressed, typically for page content.
     * - `flags.autoencode`: If true, automatic encoding detection/conversion is attempted.
     *
     * @private
     * @param {string} textString The input text.
     * @param {object} [flags] Configuration flags for encoding.
     * @returns {string} The encoded text as an octet stream.
     */
    var convertTextToOctetStream = function(textString, flags) {
      var charIndex, totalChars, inputEncoding, outputTargetEncoding, processedText, isUnicodeContent;
      var currentCharacter, byteCharacter;

      flags = flags || {};
      inputEncoding = flags.sourceEncoding || 'Unicode'; // Default to Unicode
      outputTargetEncoding = flags.outputEncoding;

      // This encoding logic relies on font metrics and encoding maps
      // typically attached to font objects by plugins like `standard_font_metrics.js`.
      // The `font.metadata.encoding` object should contain:
      //   .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
      //   .widths = {0:width, code:width, ..., 'fof':divisor}
      //   .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
      if ((flags.autoencode || outputTargetEncoding) &&