// This file contains a robust FITS file parsing and data handling library.
// It supports parsing FITS files from various sources (URLs, File/Blob objects)
// and provides utilities for accessing header information and data units.

// A small utility for logging warnings and errors.
const LogUtility = {
    warn: (message) => {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn(`[FITS-LIB WARNING]: ${message}`);
        }
    },
    error: (message) => {
        if (typeof console !== 'undefined' && console.error) {
            console.error(`[FITS-LIB ERROR]: ${message}`);
        }
        throw new Error(`FITS-LIB Error: ${message}`);
    }
};

// Custom inheritance utility, mimicking CoffeeScript's __extends
// but renamed and slightly modified.
const inheritClassStructure = function(childClass, parentClass) {
    for (let staticProp in parentClass) {
        if (Object.prototype.hasOwnProperty.call(parentClass, staticProp)) {
            childClass[staticProp] = parentClass[staticProp];
        }
    }
    function Ctor() { this.constructor = childClass; }
    Ctor.prototype = parentClass.prototype;
    childClass.prototype = new Ctor();
    childClass.prototype.superClass = parentClass.prototype; // Renamed __super__
    return childClass;
};

// Global namespace for our astronomy data utilities.
if (this.dataViz === null || typeof this.dataViz === 'undefined') {
    this.dataViz = {};
}

/**
 * @class Foundation
 * @description Base class providing common utilities for object extension and callback management.
 */
class Foundation {
    /**
     * Applies properties from an object to the prototype of the current class.
     * @param {object} sourceObject - The object whose properties will be mixed in.
     * @returns {Foundation} The current class for chaining.
     */
    static applyMixins(sourceObject) {
        for (const propKey in sourceObject) {
            if (Object.prototype.hasOwnProperty.call(sourceObject, propKey)) {
                this.prototype[propKey] = sourceObject[propKey];
            }
        }
        return this;
    }

    /**
     * Extends the static properties of the current class with properties from an object.
     * @param {object} sourceObject - The object whose static properties will be added.
     * @returns {Foundation} The current class for chaining.
     */
    static augmentStatic(sourceObject) {
        for (const propKey in sourceObject) {
            if (Object.prototype.hasOwnProperty.call(sourceObject, propKey)) {
                this[propKey] = sourceObject[propKey];
            }
        }
        return this;
    }

    /**
     * Creates a function that, when called, will execute the original function
     * with the current instance (`this`) as its context.
     * @param {Function} targetFunction - The function to be bound.
     * @returns {Function} A new function with the context bound.
     */
    createBoundFunction(targetFunction) {
        // A simple guard to ensure a function is provided.
        if (typeof targetFunction !== 'function') {
            LogUtility.error("Attempted to bind a non-function target.");
        }
        const currentInstance = this;
        return function(...args) {
            return targetFunction.apply(currentInstance, args);
        };
    }

    /**
     * Executes a given callback function with optional data and context.
     * @param {Function} callbackFn - The function to call.
     * @param {object} [options] - Options object, potentially containing a 'context' property.
     * @param {*} [payload] - Data to pass as the first argument to the callback.
     * @returns {*} The result of the callback function, if any.
     */
    executeCallback(callbackFn, options = {}, payload = undefined) {
        const executionContext = (options && options.context !== null && typeof options.context !== 'undefined') ? options.context : this;
        if (typeof callbackFn === 'function') {
            return callbackFn.call(executionContext, payload, options);
        }
        // Log a warning if callback is not a function but was expected.
        if (callbackFn !== null && typeof callbackFn !== 'undefined') {
             LogUtility.warn(`Provided callback is not a function: ${typeof callbackFn}.`);
        }
        return undefined; // Explicitly return undefined if no callback or invalid callback.
    }
}

/**
 * @class FileSegmentReader
 * @description Handles the parsing of FITS file segments (headers and data blocks).
 * It supports reading from ArrayBuffer (for URLs) or File/Blob objects.
 */
class FileSegmentReader extends Foundation {
    // Constants for FITS block structure.
    static get HEADER_CARD_SIZE() { return 80; } // Renamed LINEWIDTH
    static get FITS_BLOCK_SIZE() { return 2880; } // Renamed BLOCKLENGTH

    /**
     * Constructor for FileSegmentReader.
     * @param {string|File|Blob|ArrayBuffer} inputSource - The source of the FITS data.
     * @param {Function} completionCallback - Callback function to execute upon completion.
     * @param {object} [processingOptions] - Optional settings for parsing.
     */
    constructor(inputSource, completionCallback, processingOptions = {}) {
        super(); // Call the parent class constructor.

        // Guard clause for invalid inputSource
        if (!inputSource) {
            LogUtility.error("FileSegmentReader requires a valid input source.");
        }

        this.dataSource = inputSource; // Renamed arg
        this.completionHandler = completionCallback; // Renamed callback
        this.processingOptions = processingOptions; // Renamed opts

        this.parsedUnits = []; // Renamed hdus
        this.currentSegmentIndex = 0; // Renamed blockCount
        this.currentSegmentStart = 0; // Renamed begin
        this.currentSegmentEnd = FileSegmentReader.FITS_BLOCK_SIZE; // Renamed end
        this.globalByteOffset = 0; // Renamed offset
        this.accumulatedHeaderBuffer = new Uint8Array(0); // Renamed headerStorage, initialized empty

        // Ensure slice method is available for File/Blob objects.
        // Added mozSlice for broader browser compatibility.
        if (typeof File !== 'undefined' && File.prototype) {
            File.prototype.slice = File.prototype.slice || File.prototype.webkitSlice || File.prototype.mozSlice;
        }
        if (typeof Blob !== 'undefined' && Blob.prototype) {
            Blob.prototype.slice = Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice;
        }

        if (typeof this.dataSource === 'string') {
            // Assume it's a URL and fetch it.
            this.readNextSegmentFn = this._readBufferSegment;
            this._fetchRemoteData(this.dataSource);
        } else if (this.dataSource instanceof ArrayBuffer) {
            // Already an ArrayBuffer, process directly.
            this.totalSourceLength = this.dataSource.byteLength; // Renamed length
            this.readNextSegmentFn = this._readBufferSegment;
            this.processFromBuffer();
        } else if (this.dataSource instanceof File || this.dataSource instanceof Blob) {
            // It's a local file or blob.
            this.totalSourceLength = this.dataSource.size; // Renamed length
            this.readNextSegmentFn = this._readFileSegment;
            this.processFromFile();
        } else {
            LogUtility.error("Unsupported data source type provided to FileSegmentReader.");
        }
    }

    /**
     * Initiates fetching data from a remote URL.
     * @param {string} url - The URL to fetch.
     * @private
     */
    _fetchRemoteData(url) {
        const xhrRequest = new XMLHttpRequest();
        xhrRequest.open('GET', url);
        xhrRequest.responseType = 'arraybuffer'; // Crucial for binary data.

        xhrRequest.onload = () => {
            if (xhrRequest.status >= 200 && xhrRequest.status < 300) { // Check for successful HTTP status
                this.dataSource = xhrRequest.response;
                this.totalSourceLength = this.dataSource.byteLength;
                this.processFromBuffer();
            } else {
                LogUtility.error(`Failed to load data from URL: ${url}. Status: ${xhrRequest.status}`);
                this.executeCallback(this.completionHandler, this.processingOptions, null); // Signal failure
            }
        };

        xhrRequest.onerror = () => {
            LogUtility.error(`Network error or CORS issue when fetching data from URL: ${url}.`);
            this.executeCallback(this.completionHandler, this.processingOptions, null); // Signal failure
        };

        xhrRequest.send();
    }

    /**
     * Reads the next segment from an ArrayBuffer source.
     * @private
     */
    processFromBuffer() {
        const segmentToRead = this.dataSource.slice(
            this.currentSegmentStart + this.globalByteOffset,
            this.currentSegmentEnd + this.globalByteOffset
        );
        this.handleIncomingSegment(segmentToRead);
    }

    /**
     * Reads the next segment from a File/Blob source.
     * @private
     */
    processFromFile() {
        this.fileReaderInstance = new FileReader(); // Renamed reader
        this.fileReaderInstance.onloadend = (event) => {
            if (event.target && event.target.readyState === FileReader.DONE) {
                this.handleIncomingSegment(event.target.result);
            } else {
                LogUtility.error("FileReader failed to load segment.");
                this.executeCallback(this.completionHandler, this.processingOptions, null);
            }
        };

        const segmentToRead = this.dataSource.slice(
            this.currentSegmentStart + this.globalByteOffset,
            this.currentSegmentEnd + this.globalByteOffset
        );
        this.fileReaderInstance.readAsArrayBuffer(segmentToRead);
    }

    /**
     * Processes an incoming data segment (either from buffer or file).
     * This method is the core logic for identifying header blocks and data units.
     * @param {ArrayBuffer} dataSegmentBuffer - The ArrayBuffer containing the current segment.
     */
    handleIncomingSegment(dataSegmentBuffer) {
        const currentSegmentBytes = new Uint8Array(dataSegmentBuffer); // Renamed arr
        const tempHeaderBytes = new Uint8Array(this.accumulatedHeaderBuffer); // Renamed tmp

        // Resize accumulated header buffer to accommodate new data
        this.accumulatedHeaderBuffer = new Uint8Array(this.currentSegmentEnd);
        this.accumulatedHeaderBuffer.set(tempHeaderBytes, 0);
        this.accumulatedHeaderBuffer.set(currentSegmentBytes, this.currentSegmentStart);

        const headerLineCount = FileSegmentReader.FITS_BLOCK_SIZE / FileSegmentReader.HEADER_CARD_SIZE; // Renamed rows
        let foundEndOfHeader = false;

        // Iterate through potential header lines in reverse to find 'END' keyword efficiently.
        for (let i = headerLineCount - 1; i >= 0; i--) {
            const lineStartIndex = i * FileSegmentReader.HEADER_CARD_SIZE; // Renamed rowIndex

            // Check for empty lines (spaces only)
            if (currentSegmentBytes[lineStartIndex] === 32) { // ASCII for space
                continue; // Skip to next line
            }

            // Check for 'END ' keyword (ASCII: 69, 78, 68, 32)
            if (currentSegmentBytes[lineStartIndex] === 69 &&
                currentSegmentBytes[lineStartIndex + 1] === 78 &&
                currentSegmentBytes[lineStartIndex + 2] === 68 &&
                currentSegmentBytes[lineStartIndex + 3] === 32) {

                foundEndOfHeader = true;
                break; // Found 'END', stop checking lines.
            }
            // If we reach a non-empty, non-'END' line, it means the 'END'
            // keyword is not in this block, or we haven't accumulated enough header.
            // For now, we assume 'END' is always at the end of a header block.
            // If it's not 'END' and not an empty line, we break. This might need refinement
            // based on strict FITS rules, but for typical cases, this is fine.
            // Original code just breaks.
            break;
        }

        if (foundEndOfHeader) {
            // Convert accumulated header bytes to a string.
            let fullHeaderText = ''; // Renamed s
            for (const byteValue of this.accumulatedHeaderBuffer) { // Renamed _ref, _i, _len, value
                fullHeaderText += String.fromCharCode(byteValue);
            }

            const parsedHeader = new HeaderMetadata(fullHeaderText); // Renamed header
            const dataBlockStartOffset = this.currentSegmentEnd + this.globalByteOffset; // Renamed start
            const dataBlockByteLength = parsedHeader.getPayloadLength(); // Renamed dataLength, changed method name
            let dataBlockSource = null;
            if (this.dataSource instanceof ArrayBuffer) {
                dataBlockSource = this.dataSource.slice(dataBlockStartOffset, dataBlockStartOffset + dataBlockByteLength);
            } else { // File or Blob
                dataBlockSource = this.dataSource.slice(dataBlockStartOffset, dataBlockStartOffset + dataBlockByteLength);
            }

            let contentBlock = null; // Renamed dataunit
            if (parsedHeader.hasAssociatedDataUnit()) { // Renamed hasDataUnit
                contentBlock = this.instantiateContentBlock(parsedHeader, dataBlockSource); // Renamed createDataUnit
            }

            this.parsedUnits.push(new HeaderDataUnit(parsedHeader, contentBlock)); // Renamed hdu, HDU

            // Update global offset for the next block.
            this.globalByteOffset += this.currentSegmentEnd + dataBlockByteLength + this.calculatePaddingBytes(dataBlockByteLength); // Renamed excessBytes

            // Check if we've processed the entire source.
            if (this.globalByteOffset >= this.totalSourceLength) { // Changed comparison to >= for robustness
                this.accumulatedHeaderBuffer = null; // Clear buffer
                this.executeCallback(this.completionHandler, this.processingOptions, this.fitsDataManager); // Renamed callback, opts, this to completionHandler, processingOptions, this.fitsDataManager
                return; // Parsing complete.
            }

            // Reset for the next Header Data Unit (HDU).
            this.currentSegmentIndex = 0;
            this.currentSegmentStart = 0;
            this.currentSegmentEnd = FileSegmentReader.FITS_BLOCK_SIZE;
            this.accumulatedHeaderBuffer = new Uint8Array(0); // Reset to empty for the next header.

            // Read the next block, which starts a new HDU.
            let nextSegmentSource;
            if (this.dataSource instanceof ArrayBuffer) {
                nextSegmentSource = this.dataSource.slice(this.currentSegmentStart + this.globalByteOffset, this.currentSegmentEnd + this.globalByteOffset);
            } else {
                nextSegmentSource = this.dataSource.slice(this.currentSegmentStart + this.globalByteOffset, this.currentSegmentEnd + this.globalByteOffset);
            }
            this.readNextSegmentFn(nextSegmentSource); // Use the appropriate read function
            return;
        }

        // If 'END' was not found in this block, accumulate more header data.
        this.currentSegmentIndex += 1;
        this.currentSegmentStart = this.currentSegmentIndex * FileSegmentReader.FITS_BLOCK_SIZE;
        this.currentSegmentEnd = this.currentSegmentStart + FileSegmentReader.FITS_BLOCK_SIZE;

        // Guard against reading past the end of the file when accumulating header.
        if (this.currentSegmentStart + this.globalByteOffset >= this.totalSourceLength) {
            LogUtility.error("Reached end of file while still looking for 'END' keyword in header. Malformed FITS?");
            this.executeCallback(this.completionHandler, this.processingOptions, null);
            return;
        }

        // Read the next segment to continue accumulating header.
        let nextSegmentSource;
        if (this.dataSource instanceof ArrayBuffer) {
            nextSegmentSource = this.dataSource.slice(this.currentSegmentStart + this.globalByteOffset, this.currentSegmentEnd + this.globalByteOffset);
        } else {
            nextSegmentSource = this.dataSource.slice(this.currentSegmentStart + this.globalByteOffset, this.currentSegmentEnd + this.globalByteOffset);
        }
        this.readNextSegmentFn(nextSegmentSource);
    }

    /**
     * Private helper for reading a segment when the source is an ArrayBuffer.
     * @param {ArrayBuffer} segmentBuffer - The buffer containing the segment.
     * @private
     */
    _readBufferSegment(segmentBuffer) {
        // This method simply passes the buffer to the main handler.
        this.handleIncomingSegment(segmentBuffer);
    }

    /**
     * Private helper for reading a segment when the source is a File/Blob.
     * @param {Blob} segmentBlob - The blob containing the segment.
     * @private
     */
    _readFileSegment(segmentBlob) {
        // The FileReader will handle reading the blob into an ArrayBuffer
        // and then call handleIncomingSegment via its onloadend event.
        this.fileReaderInstance.readAsArrayBuffer(segmentBlob);
    }

    /**
     * Dynamically creates an appropriate DataUnit subclass based on header information.
     * @param {HeaderMetadata} headerInfo - The parsed header object.
     * @param {Blob|ArrayBuffer} dataPayload - The raw data associated with the unit.
     * @returns {AbstractDataBlock|ImageDataBlock|TableDataBlock|BinaryTableDataBlock|CompressedImageDataBlock} An instance of a data unit subclass.
     */
    instantiateContentBlock(headerInfo, dataPayload) {
        const unitType = headerInfo.getPayloadType(); // Renamed getDataType
        const DataUnitClass = this.dataViz.FitsLibrary[unitType]; // Access from global namespace
        if (DataUnitClass) {
            return new DataUnitClass(headerInfo, dataPayload);
        } else {
            LogUtility.warn(`Unknown or unsupported data unit type: ${unitType}. Using generic AbstractDataBlock.`);
            return new this.dataViz.FitsLibrary.AbstractDataBlock(headerInfo, dataPayload); // Fallback to base
        }
    }

    /**
     * Calculates the number of padding bytes required to align data to the FITS_BLOCK_SIZE.
     * @param {number} actualLength - The actual length of the data block.
     * @returns {number} The number of padding bytes.
     */
    calculatePaddingBytes(actualLength) {
        const remainder = actualLength % FileSegmentReader.FITS_BLOCK_SIZE;
        return remainder === 0 ? 0 : FileSegmentReader.FITS_BLOCK_SIZE - remainder;
    }

    /**
     * Checks if the parser has reached the end of the input source.
     * @returns {boolean} True if at EOF, false otherwise.
     */
    hasReachedEndOfSource() {
        return this.globalByteOffset >= this.totalSourceLength;
    }
}


/**
 * @class FitsDataManager
 * @description Main entry point for interacting with FITS files.
 * Manages the parsing process and provides access to Header Data Units (HDUs).
 */
class FitsDataManager extends Foundation {
    /**
     * Constructor for FitsDataManager.
     * @param {string|File|Blob|ArrayBuffer} sourceInput - The source of the FITS data.
     * @param {Function} completionHandler - Callback function invoked when parsing is complete.
     * @param {object} [options] - Optional processing settings.
     */
    constructor(sourceInput, completionHandler, options = {}) {
        super(); // Call parent constructor.

        // Basic input validation.
        if (!sourceInput) {
            LogUtility.error("FitsDataManager requires a source input.");
        }
        if (typeof completionHandler !== 'function') {
            LogUtility.warn("FitsDataManager completion handler is not a function.");
        }

        this.sourceIdentifier = sourceInput; // Renamed arg
        this.headerDataUnits = []; // Renamed hdus

        // Initialize the segment parser.
        const segmentParser = new FileSegmentReader(this.sourceIdentifier, (parsedResult, parserOptions) => {
            // This callback is invoked by the FileSegmentReader when parsing is done.
            if (parsedResult) {
                this.headerDataUnits = segmentParser.parsedUnits; // Transfer parsed units
                this.executeCallback(completionHandler, options, this); // Notify user with the FitsDataManager instance.
            } else {
                LogUtility.error("FITS file parsing failed.");
                this.executeCallback(completionHandler, options, null); // Signal failure to the user.
            }
        }, options);
    }

    /**
     * Retrieves a specific Header Data Unit by index.
     * If no index is provided, or the index is invalid, it attempts to return
     * the first HDU that contains actual data.
     * @param {number} [unitIndex] - The zero-based index of the HDU.
     * @returns {HeaderDataUnit|undefined} The requested HDU or undefined if not found.
     */
    retrieveHeaderDataUnit(unitIndex) { // Renamed getHDU
        if (typeof unitIndex === 'number' && unitIndex >= 0 && unitIndex < this.headerDataUnits.length) {
            return this.headerDataUnits[unitIndex];
        }

        // If no valid index, search for the first HDU with data.
        for (const hdu of this.headerDataUnits) {
            if (hdu.containsDataPayload()) { // Renamed hasData
                return hdu;
            }
        }

        LogUtility.warn("No Header Data Unit found with the specified index or no data-containing HDU found.");
        return undefined;
    }

    /**
     * Retrieves the header object for a specific Header Data Unit.
     * @param {number} [unitIndex] - The index of the HDU.
     * @returns {HeaderMetadata|undefined} The header object or undefined.
     */
    getUnitHeader(unitIndex) { // Renamed getHeader
        const hdu = this.retrieveHeaderDataUnit(unitIndex);
        return hdu ? hdu.headerMetadata : undefined; // Renamed header
    }

    /**
     * Retrieves the data unit object for a specific Header Data Unit.
     * @param {number} [unitIndex] - The index of the HDU.
     * @returns {AbstractDataBlock|undefined} The data unit object or undefined.
     */
    getUnitContent(unitIndex) { // Renamed getDataUnit
        const hdu = this.retrieveHeaderDataUnit(unitIndex);
        return hdu ? hdu.dataPayload : undefined; // Renamed data
    }
}

// Static versioning for the library.
FitsDataManager.LIB_VERSION = '1.0.0-alpha'; // Renamed version

// Expose the main class in the global namespace.
this.dataViz.FitsLibrary = this.dataViz.FitsLibrary || {};
this.dataViz.FitsLibrary.FitsDataManager = FitsDataManager;

/**
 * @class AbstractDataBlock
 * @description Base class for all FITS data units (images, tables, etc.).
 * Stores the raw data buffer or blob.
 */
class AbstractDataBlock extends Foundation {
    // Defines standard byte swapping operations for different data types.
    static get endianByteSwapper() { // Renamed swapEndian
        return {
            'B': (value) => value, // 8-bit, no swap
            'I': (value) => ((value & 0xFF) << 8) | ((value >> 8) & 0xFF), // 16-bit, short
            'J': (value) => ((value & 0xFF) << 24) | ((value & 0xFF00) << 8) | ((value >> 8) & 0xFF00) | ((value >> 24) & 0xFF) // 32-bit, int
        };
    }

    // Aliases for common bitpix values.
    static initializeSwappers() {
        const swapper = AbstractDataBlock.endianByteSwapper;
        swapper[8] = swapper['B'];
        swapper[16] = swapper['I'];
        swapper[32] = swapper['J'];
    }

    /**
     * Constructor for AbstractDataBlock.
     * @param {HeaderMetadata} associatedHeader - The header metadata for this data unit.
     * @param {ArrayBuffer|Blob} rawData - The raw data content.
     */
    constructor(associatedHeader, rawData) {
        super(); // Call parent constructor.

        // Guard clauses for constructor inputs.
        if (!associatedHeader) {
            LogUtility.error("AbstractDataBlock requires an associated header.");
        }
        if (!rawData) {
            LogUtility.warn("AbstractDataBlock initialized without raw data. This might be a header-only HDU.");
        }

        this.headerMetadata = associatedHeader; // Store the header for future reference.

        // Store data based on its type.
        if (rawData instanceof ArrayBuffer) {
            this.dataBuffer = rawData; // Renamed buffer
            this.rawDataBlob = null;
        } else if (rawData instanceof Blob) {
            this.rawDataBlob = rawData; // Renamed blob
            this.dataBuffer = null;
        } else if (rawData !== null && typeof rawData !== 'undefined') {
             LogUtility.warn("AbstractDataBlock received unexpected rawData type. Expected ArrayBuffer or Blob.");
        }
    }

    /**
     * Provides access to the raw data buffer.
     * If the data is stored as a Blob, it will return null until the blob is read.
     * @returns {ArrayBuffer|null} The raw data as an ArrayBuffer, or null.
     */
    getRawBuffer() {
        return this.dataBuffer;
    }

    /**
     * Provides access to the raw data blob.
     * If the data is stored as an ArrayBuffer, it will return null.
     * @returns {Blob|null} The raw data as a Blob, or null.
     */
    getRawBlob() {
        return this.rawDataBlob;
    }

    // Placeholder for data processing methods in derived classes.
    processData() {
        LogUtility.warn("processData method not implemented for AbstractDataBlock. Override in subclasses.");
        return null;
    }
}
// Initialize swappers when the class is defined.
AbstractDataBlock.initializeSwappers();

this.dataViz.FitsLibrary.AbstractDataBlock = AbstractDataBlock;

/**
 * @class HeaderMetadata
 * @description Represents a FITS header, parsing keywords and providing validation.
 */
class HeaderMetadata extends Foundation {
    // Constants for FITS header parsing.
    static get KEYWORD_LENGTH() { return 8; }
    static get ASSIGN_CHAR_INDEX() { return 8; }
    static get VALUE_START_INDEX() { return 10; }
    static get COMMENT_START_SEPARATOR() { return '/'; }

    /**
     * Constructor for HeaderMetadata.
     * @param {string} rawHeaderString - The complete header block as a string.
     */
    constructor(rawHeaderString) {
        super();
        this.headerCards = new Map(); // Store parsed keyword-value pairs.
        this.rawString = rawHeaderString;
        this.cardIndex = 0; // Tracks the order of keywords for validation.

        this.primary = false; // Flag for primary HDU.
        this.extension = false; // Flag for extension HDU.
        this.extensionType = null; // Stores XTENSION value if present.

        this._parseHeaderString(rawHeaderString);
    }

    /**
     * Parses the raw header string into individual keyword cards.
     * @param {string} headerStr - The header string to parse.
     * @private
     */
    _parseHeaderString(headerStr) {
        const lines = headerStr.match(/.{1,80}/g) || []; // Split into 80-char lines.

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const keyword = line.substring(0, HeaderMetadata.KEYWORD_LENGTH).trim();

            if (keyword === 'END') {
                break; // End of header block.
            }

            let value = null;
            let comment = '';

            const assignChar = line[HeaderMetadata.ASSIGN_CHAR_INDEX];
            if (assignChar === '=') {
                const valueCommentPart = line.substring(HeaderMetadata.VALUE_START_INDEX);
                const commentSeparatorIndex = valueCommentPart.indexOf(HeaderMetadata.COMMENT_START_SEPARATOR);

                if (commentSeparatorIndex !== -1) {
                    value = valueCommentPart.substring(0, commentSeparatorIndex).trim();
                    comment = valueCommentPart.substring(commentSeparatorIndex + 1).trim();
                } else {
                    value = valueCommentPart.trim();
                }
            } else {
                // Keywords without a value (e.g., COMMENT, HISTORY)
                comment = line.substring(HeaderMetadata.KEYWORD_LENGTH).trim();
            }

            // Perform validation and store the parsed value.
            const validatedValue = MetadataValidator.applyRule(keyword, value, i, this);
            this.headerCards.set(keyword, { value: validatedValue, raw: value, comment: comment, line: line, index: i });
            this.cardIndex++; // Increment for next keyword position check.
        }
    }

    /**
     * Retrieves the validated value associated with a keyword.
     * @param {string} keyword - The FITS keyword (e.g., 'NAXIS', 'BITPIX').
     * @returns {*} The parsed and validated value, or undefined if not found.
     */
    get(keyword) {
        const card = this.headerCards.get(keyword);
        return card ? card.value : undefined;
    }

    /**
     * Checks if a specific keyword exists in the header.
     * @param {string} keyword - The FITS keyword.
     * @returns {boolean} True if the keyword is present, false otherwise.
     */
    hasKeyword(keyword) {
        return this.headerCards.has(keyword);
    }

    /**
     * Determines if this is the primary HDU based on the 'SIMPLE' keyword.
     * @returns {boolean} True if primary, false otherwise.
     */
    isPrimaryHDU() { // Renamed isPrimary
        return this.primary;
    }

    /**
     * Determines if this is an extension HDU based on the 'XTENSION' keyword.
     * @returns {boolean} True if an extension, false otherwise.
     */
    isExtensionHDU() { // Renamed isExtension
        return this.extension;
    }

    /**
     * Gets the type of extension (e.g., 'IMAGE', 'TABLE', 'BINTABLE').
     * @returns {string|null} The extension type or null if not an extension.
     */
    getExtensionTypeName() { // Renamed getExtensionType
        return this.extensionType;
    }

    /**
     * Calculates the total byte length of the data payload for this HDU.
     * This considers BITPIX, NAXIS, PCOUNT, GCOUNT.
     * @returns {number} The data payload length in bytes.
     */
    getPayloadLength() { // Renamed getDataLength
        const bitpix = this.get('BITPIX');
        const naxis = this.get('NAXIS');
        const pcount = this.get('PCOUNT') || 0; // Default to 0 if not present.
        const gcount = this.get('GCOUNT') || 1; // Default to 1 if not present.

        if (naxis === 0) {
            return pcount * gcount; // For tables, PCOUNT * GCOUNT might define data length.
        }

        let totalPixels = 1;
        for (let i = 1; i <= naxis; i++) {
            const axisLength = this.get(`NAXIS${i}`);
            if (typeof axisLength !== 'number' || axisLength < 0) {
                LogUtility.error(`NAXIS${i} is invalid: ${axisLength}`);
            }
            totalPixels *= axisLength;
        }

        const bytesPerPixel = Math.abs(bitpix) / 8;
        return totalPixels * bytesPerPixel * gcount + pcount; // PCOUNT is typically added for BINTABLE.
    }

    /**
     * Determines if this HDU is expected to have an associated data unit.
     * @returns {boolean} True if a data unit is expected, false otherwise.
     */
    hasAssociatedDataUnit() { // Renamed hasDataUnit
        const naxis = this.get('NAXIS');
        return (typeof naxis === 'number' && naxis >= 0);
    }

    /**
     * Gets the type of data unit (e.g., 'Image', 'Table', 'BinaryTable').
     * This is used for instantiating the correct DataUnit subclass.
     * @returns {string} The data unit type as a string.
     */
    getPayloadType() { // Renamed getDataType
        if (this.isExtensionHDU()) {
            if (this.extensionType === 'BINTABLE') {
                return 'BinaryTableDataBlock';
            } else if (this.extensionType === 'TABLE') {
                return 'TableDataBlock';
            } else if (this.extensionType === 'IMAGE') {
                return 'ImageDataBlock';
            }
        }
        // Default for primary HDU or unknown extension is Image.
        // Compressed images also fall under ImageDataBlock but are handled internally.
        return 'ImageDataBlock';
    }
}

// Expose the HeaderMetadata class.
this.dataViz.FitsLibrary.HeaderMetadata = HeaderMetadata;


/**
 * @class HeaderDataUnit
 * @description Represents a single Header Data Unit (HDU) in a FITS file,
 * comprising a header and an optional data payload.
 */
class HeaderDataUnit extends Foundation {
    /**
     * Constructor for HeaderDataUnit.
     * @param {HeaderMetadata} header - The parsed header metadata.
     * @param {AbstractDataBlock} [data] - The optional data payload.
     */
    constructor(header, data = null) {
        super();
        // Guard clauses
        if (!header) {
            LogUtility.error("HeaderDataUnit requires a HeaderMetadata object.");
        }

        this.headerMetadata = header; // Renamed header
        this.dataPayload = data; // Renamed data
    }

    /**
     * Checks if this HDU contains an actual data payload.
     * @returns {boolean} True if dataPayload is not null, false otherwise.
     */
    containsDataPayload() { // Renamed hasData
        return this.dataPayload !== null;
    }

    /**
     * Retrieves the header metadata for this HDU.
     * @returns {HeaderMetadata} The header object.
     */
    getHeader() {
        return this.headerMetadata;
    }

    /**
     * Retrieves the data payload for this HDU.
     * @returns {AbstractDataBlock|null} The data unit object or null.
     */
    getData() {
        return this.dataPayload;
    }
}

this.dataViz.FitsLibrary.HeaderDataUnit = HeaderDataUnit;

/**
 * @class MetadataValidator
 * @description Provides static methods for validating FITS header keywords
 * according to FITS standard rules.
 */
const MetadataValidator = { // Renamed HeaderVerify, changed to object literal for static methods
    /**
     * Checks if a keyword appears at its expected ordinal position in the header.
     * @param {string} keywordName - The FITS keyword.
     * @param {number} expectedOrder - The zero-based index where the keyword should appear.
     * @param {HeaderMetadata} headerContext - The HeaderMetadata instance for context.
     */
    checkKeywordPosition: function(keywordName, expectedOrder, headerContext) { // Renamed verifyOrder
        if (expectedOrder !== headerContext.cardIndex) {
            LogUtility.warn(`${keywordName} should appear at index ${headerContext.cardIndex} in the FITS header, but was expected at ${expectedOrder}.`);
        }
    },

    /**
     * Validates if a numeric value falls within a specified range (inclusive).
     * @param {string} keywordName - The FITS keyword.
     * @param {number} valueToCheck - The numeric value to validate.
     * @param {number} lowerBound - The minimum allowed value.
     * @param {number} upperBound - The maximum allowed value.
     * @throws {Error} If the value is out of range.
     */
    validateRange: function(keywordName, valueToCheck, lowerBound, upperBound) { // Renamed verifyBetween
        if (!(valueToCheck >= lowerBound && valueToCheck <= upperBound)) {
            LogUtility.error(`The ${keywordName} value of ${valueToCheck} is not between ${lowerBound} and ${upperBound}.`);
        }
    },

    /**
     * Parses a FITS boolean string ('T' or 'F') into a JavaScript boolean.
     * @param {string} fitsBooleanString - The FITS boolean string.
     * @returns {boolean} True for 'T', false for 'F' or any other value.
     */
    parseBooleanFlag: function(fitsBooleanString) { // Renamed verifyBoolean
        return fitsBooleanString === "T";
    },

    /**
     * Applies the appropriate validation rule for a given keyword.
     * @param {string} keyword - The FITS keyword.
     * @param {*} rawValue - The raw value string from the header.
     * @param {number} currentCardIndex - The index of the current header card.
     * @param {HeaderMetadata} headerContext - The HeaderMetadata instance for context.
     * @returns {*} The parsed and validated value.
     */
    applyRule: function(keyword, rawValue, currentCardIndex, headerContext) {
        // Temporarily set cardIndex for validation calls within rules.
        const originalCardIndex = headerContext.cardIndex;
        headerContext.cardIndex = currentCardIndex;

        let processedValue = rawValue;
        const validationFn = MetadataValidator.ValidationRules[keyword];

        if (validationFn) {
            // Pass the header context as 'this' to the validation function.
            // Spread operator for arguments, including currentCardIndex and headerContext for NAXIS/TBCOL.
            processedValue = validationFn.call(headerContext, rawValue, currentCardIndex, headerContext);
        } else {
            // Default parsing for unknown keywords (try to convert to number if possible, else keep string)
            const numValue = Number(rawValue);
            if (!isNaN(numValue) && rawValue !== null && rawValue.trim() !== '') {
                processedValue = numValue;
            }
        }
        headerContext.cardIndex = originalCardIndex; // Restore original cardIndex
        return processedValue;
    },

    /**
     * Collection of validation functions for specific FITS keywords.
     * Each function receives the raw value and the header context.
     */
    ValidationRules: { // Renamed VerifyFns
        'SIMPLE': function(value) {
            this.primary = true;
            MetadataValidator.checkKeywordPosition("SIMPLE", 0, this);
            return MetadataValidator.parseBooleanFlag(value);
        },
        'XTENSION': function(value) {
            this.extension = true;
            this.extensionType = value;
            MetadataValidator.checkKeywordPosition("XTENSION", 0, this);
            return value;
        },
        'BITPIX': function(value) {
            const parsedValue = parseInt(value, 10);
            MetadataValidator.checkKeywordPosition("BITPIX", 1, this);
            if (![8, 16, 32, -32, -64].includes(parsedValue)) {
                LogUtility.error(`BITPIX value ${parsedValue} is not permitted.`);
            }
            return parsedValue;
        },
        'NAXIS': function(value, currentCardIndex, headerContext) { // Added currentCardIndex, headerContext for NAXIS_N
            const parsedValue = parseInt(value, 10);
            const isNaxisN = currentCardIndex > 2; // NAXIS is at index 2, NAXISn are later.
            if (!isNaxisN) {
                MetadataValidator.checkKeywordPosition("NAXIS", 2, this);
                MetadataValidator.validateRange("NAXIS", parsedValue, 0, 999);
                if (this.isExtensionHDU()) {
                    const extType = this.getExtensionTypeName();
                    if (extType === "TABLE" || extType === "BINTABLE") {
                        const requiredNaxis = 2;
                        if (parsedValue !== requiredNaxis) {
                            LogUtility.error(`NAXIS must be ${requiredNaxis} for ${extType} extensions.`);
                        }
                    }
                }
            }
            return parsedValue;
        },
        'PCOUNT': function(value) {
            const parsedValue = parseInt(value, 10);
            const expectedOrder = 1 + 1 + 1 + this.get("NAXIS"); // SIMPLE, BITPIX, NAXIS, then NAXISn count
            MetadataValidator.checkKeywordPosition("PCOUNT", expectedOrder, this);
            if (this.isExtensionHDU()) {
                const extType = this.getExtensionTypeName();
                if (extType === "IMAGE" || extType === "TABLE") {
                    const requiredPcount = 0;
                    if (parsedValue !== requiredPcount) {
                        LogUtility.error(`PCOUNT must be ${requiredPcount} for ${extType} extensions.`);
                    }
                }
            }
            return parsedValue;
        },
        'GCOUNT': function(value) {
            const parsedValue = parseInt(value, 10);
            const expectedOrder = 1 + 1 + 1 + this.get("NAXIS") + 1; // SIMPLE, BITPIX, NAXIS, NAXISn, PCOUNT
            MetadataValidator.checkKeywordPosition("GCOUNT", expectedOrder, this);
            if (this.isExtensionHDU()) {
                const extType = this.getExtensionTypeName();
                if (extType === "IMAGE" || extType === "TABLE" || extType === "BINTABLE") {
                    const requiredGcount = 1;
                    if (parsedValue !== requiredGcount) {
                        LogUtility.error(`GCOUNT must be ${requiredGcount} for ${extType} extensions.`);
                    }
                }
            }
            return parsedValue;
        },
        'EXTEND': function(value) {
            if (!this.isPrimaryHDU()) {
                LogUtility.error("EXTEND must only appear in the primary header.");
            }
            return MetadataValidator.parseBooleanFlag(value);
        },
        'BSCALE': function(value) { return parseFloat(value); },
        'BZERO': function(value) { return parseFloat(value); },
        'BLANK': function(value) {
            const parsedValue = parseInt(value, 10);
            if (this.get("BITPIX") <= 0) {
                LogUtility.warn(`BLANK is not recommended for BITPIX = ${this.get('BITPIX')}.`);
            }
            return parsedValue;
        },
        'DATAMIN': function(value) { return parseFloat(value); },
        'DATAMAX': function(value) { return parseFloat(value); },
        'EXTVER': function(value) { return parseInt(value, 10); },
        'EXTLEVEL': function(value) { return parseInt(value, 10); },
        'TFIELDS': function(value) {
            const parsedValue = parseInt(value, 10);
            MetadataValidator.validateRange("TFIELDS", parsedValue, 0, 999);
            return parsedValue;
        },
        'TBCOL': function(value, currentCardIndex, headerContext) { // Added currentCardIndex, headerContext
            const parsedValue = parseInt(value, 10);
            // TBCOLn keyword, so 'n' is (currentCardIndex - (index of TFIELDS + 1))
            // This logic needs to be more robust. The original code used arguments[2] as index.
            // Let's assume the index 'n' for TBCOLn is passed in the third argument, as per original.
            const fieldIndex = arguments[2] || 0; // Fallback if not provided, though it should be.
            if (headerContext && headerContext.hasKeyword('TFIELDS')) {
                MetadataValidator.validateRange(`TBCOL${fieldIndex}`, fieldIndex, 1, headerContext.get("TFIELDS"));
            }
            return parsedValue;
        },
        'ZIMAGE': function(value) { return MetadataValidator.parseBooleanFlag(value); },
        'ZCMPTYPE': function(value) {
            const permittedTypes = ['GZIP_1', 'RICE_1', 'PLIO_1', 'HCOMPRESS_1'];
            if (!permittedTypes.includes(value)) {
                LogUtility.error(`ZCMPTYPE value "${value}" is not permitted.`);
            }
            if (value !== 'RICE_1') { // Original code only explicitly supported RICE_1
                LogUtility.warn(`Compression type "${value}" is not fully implemented in this library.`);
            }
            return value;
        },
        'ZBITPIX': function(value) {
            const parsedValue = parseInt(value, 10);
            if (![8, 16, 32, 64, -32, -64].includes(parsedValue)) {
                LogUtility.error(`ZBITPIX value ${parsedValue} is not permitted.`);
            }
            return parsedValue;
        },
        'ZNAXIS': function(value, currentCardIndex, headerContext) {
            const parsedValue = parseInt(value, 10);
            const isZaxisN = currentCardIndex > (headerContext.get('ZNAXIS') !== undefined ? headerContext.get('ZNAXIS') + 1 : 1); // Approximation
            if (!isZaxisN) { // Only validate the main ZNAXIS keyword.
                MetadataValidator.validateRange("ZNAXIS", parsedValue, 0, 999);
            }
            return parsedValue;
        },
        'ZTILE': function(value) { return parseInt(value, 10); },
        'ZSIMPLE': function(value) { return MetadataValidator.parseBooleanFlag(value); },
        'ZPCOUNT': function(value) { return parseInt(value, 10); },
        'ZGCOUNT': function(value) { return parseInt(value, 10); },
        'ZDITHER0': function(value) { return parseInt(value, 10); }
    }
};

// Expose the MetadataValidator object.
this.dataViz.FitsLibrary.MetadataValidator = MetadataValidator;


// Placeholder classes for specific data unit types.
// These would typically extend AbstractDataBlock and implement specific parsing logic.
class ImageDataBlock extends AbstractDataBlock {
    constructor(header, data) {
        super(header, data);
        this.imageProperties = {}; // Additional properties specific to images.
        this._parseImageHeader();
    }

    _parseImageHeader() {
        this.imageProperties.bitpix = this.headerMetadata.get('BITPIX');
        this.imageProperties.naxis = this.headerMetadata.get('NAXIS');
        this.imageProperties.dimensions = [];
        for (let i = 1; i <= this.imageProperties.naxis; i++) {
            this.imageProperties.dimensions.push(this.headerMetadata.get(`NAXIS${i}`));
        }
        // Check for compressed image
        this.isCompressed = this.headerMetadata.hasKeyword('ZIMAGE') && this.headerMetadata.get('ZIMAGE');
        if (this.isCompressed) {
            LogUtility.warn("Compressed FITS image detected. Decompression not fully implemented in ImageDataBlock.");
            // A more advanced implementation would delegate to a decompression utility here.
            this.compressionType = this.headerMetadata.get('ZCMPTYPE');
        }
    }

    getImageData() {
        if (this.dataBuffer) {
            // Implement actual image data extraction, scaling, and byte swapping here.
            // This is a complex operation depending on BITPIX and potentially BSCALE/BZERO.
            LogUtility.warn("getImageData not fully implemented. Returning raw buffer for now.");
            return this.dataBuffer;
        } else if (this.rawDataBlob) {
            LogUtility.warn("Image data is a Blob. It needs to be read into an ArrayBuffer first.");
            return null; // Or return a Promise to read it.
        }
        return null;
    }
}
this.dataViz.FitsLibrary.ImageDataBlock = ImageDataBlock;

class TableDataBlock extends AbstractDataBlock {
    constructor(header, data) {
        super(header, data);
        this.tableSchema = []; // Array of column definitions.
        this._parseTableSchema();
    }

    _parseTableSchema() {
        const numFields = this.headerMetadata.get('TFIELDS');
        if (numFields > 0) {
            for (let i = 1; i <= numFields; i++) {
                this.tableSchema.push({
                    name: this.headerMetadata.get(`TTYPE${i}`),
                    format: this.headerMetadata.get(`TFORM${i}`),
                    unit: this.headerMetadata.get(`TUNIT${i}`),
                    startCol: this.headerMetadata.get(`TBCOL${i}`) // For ASCII tables
                    // ... other T-type keywords
                });
            }
        }
    }

    getRows() {
        LogUtility.warn("getRows not implemented for TableDataBlock. This requires parsing TFORM to extract column data.");
        return [];
    }
}
this.dataViz.FitsLibrary.TableDataBlock = TableDataBlock;

class BinaryTableDataBlock extends AbstractDataBlock {
    constructor(header, data) {
        super(header, data);
        this.binaryTableSchema = []; // Array of column definitions for binary tables.
        this._parseBinaryTableSchema();
    }

    _parseBinaryTableSchema() {
        const numFields = this.headerMetadata.get('TFIELDS');
        if (numFields > 0) {
            for (let i = 1; i <= numFields; i++) {
                this.binaryTableSchema.push({
                    name: this.headerMetadata.get(`TTYPE${i}`),
                    format: this.headerMetadata.get(`TFORM${i}`), // Crucial for binary parsing
                    unit: this.headerMetadata.get(`TUNIT${i}`),
                    zero: this.headerMetadata.get(`TZERO${i}`),
                    scale: this.headerMetadata.get(`TSCAL${i}`)
                    // ... other T-type keywords
                });
            }
        }
    }

    getBinaryRows() {
        LogUtility.warn("getBinaryRows not implemented for BinaryTableDataBlock. This requires parsing TFORM and TTYPE to extract binary data.");
        return [];
    }
}
this.dataViz.FitsLibrary.BinaryTableDataBlock = BinaryTableDataBlock;