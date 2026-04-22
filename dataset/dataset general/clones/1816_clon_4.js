const thisGlobal = typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global || Function('return this')();

const PdfConstants = {
  SPEC_VERSION_NUMBER: '1.3',
  DEFAULT_MEASUREMENT_UNIT: 'mm',
  DEFAULT_PAGE_FORMAT: 'a4',
  DEFAULT_ORIENTATION_MODE: 'p',
  DEFAULT_FONT_POINT_SIZE: 16,
  DEFAULT_LINE_MULTIPLIER: 1.15,
  DEFAULT_STROKE_THICKNESS: 0.200025,
  DEFAULT_INK_COLOR_SPEC: '0 g',
  DEFAULT_PEN_COLOR_SPEC: '0 G',
  // Page dimensions in points (pt)
  PAGE_GEOMETRIES: new Map([
    ['a0', [2383.94, 3370.39]], ['a1', [1683.78, 2383.94]], ['a2', [1190.55, 1683.78]], ['a3', [841.89, 1190.55]],
    ['a4', [595.28, 841.89]], ['a5', [419.53, 595.28]], ['a6', [297.64, 419.53]], ['a7', [209.76, 297.64]],
    ['a8', [147.40, 209.76]], ['a9', [104.88, 147.40]], ['a10', [73.70, 104.88]],
    ['b0', [2834.65, 4008.19]], ['b1', [2004.09, 2834.65]], ['b2', [1417.32, 2004.09]], ['b3', [1000.63, 1417.32]],
    ['b4', [708.66, 1000.63]], ['b5', [498.90, 708.66]], ['b6', [354.33, 498.90]], ['b7', [249.45, 354.33]],
    ['b8', [175.75, 249.45]], ['b9', [124.72, 175.75]], ['b10', [87.87, 124.72]],
    ['c0', [2599.37, 3676.54]], ['c1', [1836.85, 2599.37]], ['c2', [1298.27, 1836.85]], ['c3', [918.43, 1298.27]],
    ['c4', [649.13, 918.43]], ['c5', [459.21, 649.13]], ['c6', [323.15, 459.21]], ['c7', [229.61, 323.15]],
    ['c8', [161.57, 229.61]], ['c9', [113.39, 161.57]], ['c10', [79.37, 113.39]],
    ['dl', [311.81, 623.62]],
    ['letter', [612, 792]], ['government-letter', [576, 756]], ['legal', [612, 1008]],
    ['junior-legal', [576, 360]], ['ledger', [1224, 792]], ['tabloid', [792, 1224]],
    ['credit-card', [153, 243]]
  ])
};

class EventDispatcher {
  #eventListeners = new Map();
  #executionContext;

  constructor(contextReference) {
    this.#executionContext = contextReference;
  }

  attachListener(eventName, handlerCallback, isOneTime) {
    if (typeof handlerCallback !== 'function') {
      return null;
    }

    const uniqueId = Math.random().toString(36).substring(2);
    if (!this.#eventListeners.has(eventName)) {
      this.#eventListeners.set(eventName, new Map());
    }
    this.#eventListeners.get(eventName).set(uniqueId, { callback: handlerCallback, once: !!isOneTime });
    return uniqueId;
  }

  detachListener(listenerToken) {
    for (const subscribersMap of this.#eventListeners.values()) {
      if (subscribersMap.delete(listenerToken)) {
        return true;
      }
    }
    return false;
  }

  emitEvent(eventName, ...dataPayload) {
    if (this.#eventListeners.has(eventName)) {
      const currentSubscribers = Array.from(this.#eventListeners.get(eventName).entries());
      const tokensToRemove = [];

      for (const [listenerId, subscription] of currentSubscribers) {
        try {
          subscription.callback.apply(this.#executionContext, dataPayload);
        } catch (exception) {
          if (thisGlobal.console) {
            thisGlobal.console.error('PdfEventDispatch Error:', exception.message, exception);
          }
        }
        if (subscription.once) {
          tokensToRemove.push(listenerId);
        }
      }
      tokensToRemove.forEach(id => this.detachListener(id));
    }
  }
}

class DocumentComposer {
  #pdfSpecificationVersion = PdfConstants.SPEC_VERSION_NUMBER;
  #currentPdfObjectSequence = 2;
  #writingToPageBuffer = false;
  #pdfObjectByteOffsets = [];
  #fontTypefaceDefinitions = {};
  #fontFamilyLookupMap = {};
  #activeFontKeyIdentifier;
  #pointScalingFactor;
  #pageCount = 0;
  #currentPageIndex;
  #pageContentArrays = [];
  #pageMeasurementData = {};
  #mainDocumentContentArray = [];
  #mainDocumentContentLength = 0;
  #currentPageWidthPoints;
  #currentPageHeightPoints;
  #documentInformation = {
    title: '', subject: '', author: '', keywords: '', creator: ''
  };
  #eventNotificationHub;
  #publicInterface = {};

  constructor(creationOptions) {
    let initialConfiguration = {};
    if (typeof creationOptions === 'object' && creationOptions !== null) {
      initialConfiguration = creationOptions;
    }

    let layoutMode = (initialConfiguration.layoutDirection || PdfConstants.DEFAULT_ORIENTATION_MODE).toLowerCase();
    let measureScaleUnit = initialConfiguration.measurementUnit || PdfConstants.DEFAULT_MEASUREMENT_UNIT;
    let pagePresetType = initialConfiguration.pagePreset || PdfConstants.DEFAULT_PAGE_FORMAT;
    let enableDataCompression = !!(initialConfiguration.enableCompression || initialConfiguration.compress || initialConfiguration.compressPdf) && typeof Uint8Array === 'function';

    this.layoutDirection = layoutMode;
    this.measurementUnit = measureScaleUnit;
    this.pagePreset = ('' + pagePresetType).toLowerCase();
    this.enableCompression = enableDataCompression;

    this.inkColor = initialConfiguration.inkColor || PdfConstants.DEFAULT_INK_COLOR_SPEC;
    this.strokeColor = initialConfiguration.strokeColor || PdfConstants.DEFAULT_PEN_COLOR_SPEC;
    this.currentTextSize = initialConfiguration.fontSize || PdfConstants.DEFAULT_FONT_POINT_SIZE;
    this.lineSpacingRatio = initialConfiguration.lineHeight || PdfConstants.DEFAULT_LINE_MULTIPLIER;
    this.strokeWidth = initialConfiguration.lineWidth || PdfConstants.DEFAULT_STROKE_THICKNESS;

    this.#eventNotificationHub = new EventDispatcher(this.#publicInterface);

    const unitToPointRatio = new Map([
      ['pt', 1],
      ['mm', 72 / 25.4],
      ['cm', 72 / 2.54],
      ['in', 72]
    ]);
    this.#pointScalingFactor = unitToPointRatio.get(this.measurementUnit) || unitToPointRatio.get(PdfConstants.DEFAULT_MEASUREMENT_UNIT);

    this.#insertStandardTypefaces();
  }

  // --- Formatting Helpers ---
  #formatNumberToTwoDecimals(value) {
    return value.toFixed(2);
  }

  #formatNumberToThreeDecimals(value) {
    return value.toFixed(3);
  }

  #padIntegerWithZero(value) {
    return ('0' + parseInt(value, 10)).slice(-2);
  }

  // --- Content Assembly ---
  #appendToStream(segment) {
    if (this.#writingToPageBuffer) {
      this.#pageContentArrays[this.#currentPageIndex].push(segment);
    } else {
      this.#mainDocumentContentLength += segment.length + 1; // +1 for newline
      this.#mainDocumentContentArray.push(segment);
    }
  }

  #createNewPdfObject() {
    this.#currentPdfObjectSequence++;
    this.#pdfObjectByteOffsets[this.#currentPdfObjectSequence] = this.#mainDocumentContentLength;
    this.#appendToStream(this.#currentPdfObjectSequence + ' 0 obj');
    return this.#currentPdfObjectSequence;
  }

  #embedBinaryStream(streamContent) {
    this.#appendToStream('stream');
    this.#appendToStream(streamContent);
    this.#appendToStream('endstream');
  }

  // --- Page Structure Compilation ---
  #compileAllPages() {
    let adlerChecksumGenerator;
    if (this.enableCompression) {
      adlerChecksumGenerator = thisGlobal.adler32cs || DocumentComposer.adler32cs;
      if (typeof adlerChecksumGenerator === 'undefined') {
        this.enableCompression = false;
      }
    }

    for (let pageNumber = 1; pageNumber <= this.#pageCount; pageNumber++) {
      this.#createNewPdfObject();
      const pageGeometry = this.#pageMeasurementData[pageNumber];
      const pageW = pageGeometry.width * this.#pointScalingFactor;
      const pageH = pageGeometry.height * this.#pointScalingFactor;

      this.#appendToStream('<</Type /Page');
      this.#appendToStream('/Parent 1 0 R');
      this.#appendToStream('/Resources 2 0 R');
      this.#appendToStream('/MediaBox [0 0 ' + this.#formatNumberToTwoDecimals(pageW) + ' ' + this.#formatNumberToTwoDecimals(pageH) + ']');
      this.#appendToStream('/Contents ' + (this.#currentPdfObjectSequence + 1) + ' 0 R>>');
      this.#appendToStream('endobj');

      let pageContentPayload = this.#pageContentArrays[pageNumber].join('\n');
      this.#createNewPdfObject();

      if (this.enableCompression) {
        let characterCodes = [];
        for (let i = 0; i < pageContentPayload.length; i++) {
          characterCodes[i] = pageContentPayload.charCodeAt(i);
        }
        const currentAdler = adlerChecksumGenerator.from(pageContentPayload);
        const dataCompressor = new thisGlobal.Deflater(6);
        dataCompressor.append(new Uint8Array(characterCodes));
        let compressedBytes = dataCompressor.flush();

        let finalBytes = new Uint8Array(compressedBytes.length + 6);
        finalBytes.set(new Uint8Array([120, 156]));
        finalBytes.set(compressedBytes, 2);
        finalBytes.set(new Uint8Array([
          currentAdler & 0xFF,
          (currentAdler >> 8) & 0xFF,
          (currentAdler >> 16) & 0xFF,
          (currentAdler >> 24) & 0xFF
        ]), compressedBytes.length + 2);

        pageContentPayload = String.fromCharCode.apply(null, finalBytes);
        this.#appendToStream('<</Length ' + pageContentPayload.length + ' /Filter [/FlateDecode]>>');
      } else {
        this.#appendToStream('<</Length ' + pageContentPayload.length + '>>');
      }
      this.#embedBinaryStream(pageContentPayload);
      this.#appendToStream('endobj');
    }

    this.#pdfObjectByteOffsets[1] = this.#mainDocumentContentLength;
    this.#appendToStream('1 0 obj');
    this.#appendToStream('<</Type /Pages');
    let childPageReferences = '/Kids [';
    for (let i = 0; i < this.#pageCount; i++) {
      childPageReferences += (3 + 2 * i) + ' 0 R ';
    }
    this.#appendToStream(childPageReferences + ']');
    this.#appendToStream('/Count ' + this.#pageCount);
    this.#appendToStream('>>');
    this.#appendToStream('endobj');
  }

  // --- Font Management ---
  #serializeFontObject(fontDefinition) {
    fontDefinition.objectNumber = this.#createNewPdfObject();
    this.#appendToStream('<</BaseFont/' + fontDefinition.PostScriptName + '/Type/Font');
    if (typeof fontDefinition.encoding === 'string') {
      this.#appendToStream('/Encoding/' + fontDefinition.encoding);
    }
    this.#appendToStream('/Subtype/Type1>>');
    this.#appendToStream('endobj');
  }

  #serializeAllFontDefinitions() {
    for (const fontKey in this.#fontTypefaceDefinitions) {
      if (Object.prototype.hasOwnProperty.call(this.#fontTypefaceDefinitions, fontKey)) {
        this.#serializeFontObject(this.#fontTypefaceDefinitions[fontKey]);
      }
    }
  }

  #serializeEmbeddedExternalObjects() {
    this.#eventNotificationHub.emitEvent('serializeEmbeddedExternalObjects');
  }

  #assembleResourceCatalog() {
    this.#appendToStream('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
    this.#appendToStream('/Font <<');

    for (const fontKey in this.#fontTypefaceDefinitions) {
      if (Object.prototype.hasOwnProperty.call(this.#fontTypefaceDefinitions, fontKey)) {
        this.#appendToStream('/' + fontKey + ' ' + this.#fontTypefaceDefinitions[fontKey].objectNumber + ' 0 R');
      }
    }
    this.#appendToStream('>>');
    this.#appendToStream('/XObject <<');
    this.#serializeEmbeddedExternalObjects();
    this.#appendToStream('>>');
  }

  #processDocumentResources() {
    this.#serializeAllFontDefinitions();
    this.#eventNotificationHub.emitEvent('processDocumentResources');

    this.#pdfObjectByteOffsets[2] = this.#mainDocumentContentLength;
    this.#appendToStream('2 0 obj');
    this.#appendToStream('<<');
    this.#assembleResourceCatalog();
    this.#appendToStream('>>');
    this.#appendToStream('endobj');
    this.#eventNotificationHub.emitEvent('postProcessDocumentResources');
  }

  #registerFontFamilyAlias(key, familyName, styleVariant) {
    if (!this.#fontFamilyLookupMap.hasOwnProperty(familyName)) {
      this.#fontFamilyLookupMap[familyName] = {};
    }
    this.#fontFamilyLookupMap[familyName][styleVariant] = key;
  }

  #insertNewTypeface(postscriptId, fontFamily, fontStyle, characterEncoding) {
    const nextFontKey = 'F' + (Object.keys(this.#fontTypefaceDefinitions).length + 1).toString(10);
    const newFontEntry = this.#fontTypefaceDefinitions[nextFontKey] = {
      id: nextFontKey,
      PostScriptName: postscriptId,
      fontName: fontFamily,
      fontStyle: fontStyle,
      encoding: characterEncoding,
      metadata: {}
    };
    this.#registerFontFamilyAlias(nextFontKey, fontFamily, fontStyle);
    this.#eventNotificationHub.emitEvent('insertNewTypeface', newFontEntry);
    return nextFontKey;
  }

  #insertStandardTypefaces() {
    const HELVETICA_FAMILY = "helvetica";
    const TIMES_FAMILY = "times";
    const COURIER_FAMILY = "courier";
    const STYLE_REGULAR = "normal";
    const STYLE_BOLD_WEIGHT = "bold";
    const STYLE_ITALIC_SLANT = "italic";
    const STYLE_BOLD_ITALIC_COMBINED = "bolditalic";
    const DEFAULT_CHAR_ENCODING = 'StandardEncoding';

    const predefinedFonts = [
      ['Helvetica', HELVETICA_FAMILY, STYLE_REGULAR],
      ['Helvetica-Bold', HELVETICA_FAMILY, STYLE_BOLD_WEIGHT],
      ['Helvetica-Oblique', HELVETICA_FAMILY, STYLE_ITALIC_SLANT],
      ['Helvetica-BoldOblique', HELVETICA_FAMILY, STYLE_BOLD_ITALIC_COMBINED],
      ['Courier', COURIER_FAMILY, STYLE_REGULAR],
      ['Courier-Bold', COURIER_FAMILY, STYLE_BOLD_WEIGHT],
      ['Courier-Oblique', COURIER_FAMILY, STYLE_ITALIC_SLANT],
      ['Courier-BoldOblique', COURIER_FAMILY, STYLE_BOLD_ITALIC_COMBINED],
      ['Times-Roman', TIMES_FAMILY, STYLE_REGULAR],
      ['Times-Bold', TIMES_FAMILY, STYLE_BOLD_WEIGHT],
      ['Times-Italic', TIMES_FAMILY, STYLE_ITALIC_SLANT],
      ['Times-BoldItalic', TIMES_FAMILY, STYLE_BOLD_ITALIC_COMBINED]
    ];

    for (let i = 0, len = predefinedFonts.length; i < len; i++) {
      const currentFontKey = this.#insertNewTypeface(
        predefinedFonts[i][0],
        predefinedFonts[i][1],
        predefinedFonts[i][2],
        DEFAULT_CHAR_ENCODING
      );

      const postscriptNameParts = predefinedFonts[i][0].split('-');
      this.#registerFontFamilyAlias(currentFontKey, postscriptNameParts[0], postscriptNameParts[1] || '');
    }
    this.#eventNotificationHub.emitEvent('insertStandardTypefaces', {
      typefaces: this.#fontTypefaceDefinitions,
      aliasMap: this.#fontFamilyLookupMap
    });
  }

  // --- Safe Execution Wrapper ---
  #wrapFunctionForErrorHandling(operation) {
    const guardedOperation = function(...args) {
      try {
        return operation.apply(this, args);
      } catch (error) {
        let errorDetails = error.stack || '';
        if (~errorDetails.indexOf(' at ')) errorDetails = errorDetails.split(" at ")[1];
        const formattedErrorMessage = "Execution error in: " + errorDetails.split("\n")[0].split('<')[0] + ": " + error.message;
        if (thisGlobal.console) {
          thisGlobal.console.error(formattedErrorMessage, error);
          if (thisGlobal.alert) thisGlobal.alert(formattedErrorMessage);
        } else {
          throw new Error(formattedErrorMessage);
        }
      }
    };
    return guardedOperation;
  }

  // --- Text Encoding Transformation ---
  #transformTextForPdfStream(inputText, encodingParameters) {
    encodingParameters = encodingParameters || {};
    const sourceTextEncoding = encodingParameters.inputEncoding || 'Unicode';
    const targetOutputEncoding = encodingParameters.outputEncoding;

    let resultText = inputText;
    let requiresWideEncoding = false; // Corresponds to `isUnicode` in original

    if ((encodingParameters.autoProcess || targetOutputEncoding)) {
      if (typeof targetOutputEncoding === 'object') {
        requiresWideEncoding = true;
      } else {
        for (let i = 0; i < resultText.length; i++) {
          if (resultText.charCodeAt(i) > 255) {
            requiresWideEncoding = true;
            break;
          }
        }
      }

      if (requiresWideEncoding) {
        let unicodeBytes = [];
        if (!encodingParameters.skipByteOrderMark) {
          unicodeBytes.push(254, 255); // Unicode BOM (UTF-16BE)
        }
        for (let i = 0; i < resultText.length; i++) {
          const charValue = resultText.charCodeAt(i);
          unicodeBytes.push((charValue >> 8) & 0xFF, charValue & 0xFF);
        }
        resultText = String.fromCharCode.apply(null, unicodeBytes);
      }
      // The original snippet truncated here, implying further non-Unicode encoding
      // logic would follow if 'requiresWideEncoding' is false and 'targetOutputEncoding'
      // is a string representing a standard PDF encoding (e.g., 'WinAnsiEncoding').
    }
    return resultText;
  }
}

const generatePdfDocument = function(layoutSetting, unitSetting, formatSetting, compressOption) {
  let initialOptions = {};
  if (typeof layoutSetting === 'object' && layoutSetting !== null) {
    initialOptions = layoutSetting;
  } else {
    initialOptions = {
      layoutDirection: layoutSetting,
      measurementUnit: unitSetting,
      pagePreset: formatSetting,
      enableCompression: compressOption
    };
  }
  return new DocumentComposer(initialOptions);
};
generatePdfDocument;