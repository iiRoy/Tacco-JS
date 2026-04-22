const ValueEncoderDecoder = (function() {
    const charValueMap = {
        'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9, 'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19, 'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25,
        'a': 26, 'b': 27, 'c': 28, 'd': 29, 'e': 30, 'f': 31, 'g': 32, 'h': 33, 'i': 34, 'j': 35, 'k': 36, 'l': 37, 'm': 38, 'n': 39, 'o': 40, 'p': 41, 'q': 42, 'r': 43, 's': 44, 't': 45, 'u': 46, 'v': 47, 'w': 48, 'x': 49, 'y': 50, 'z': 51,
        '0': 52, '1': 53, '2': 54, '3': 55, '4': 56, '5': 57, '6': 58, '7': 59, '8': 60, '9': 61, '+': 62, '/': 63
    };
    const continuationBit = 32;
    const dataBits = 31;
    const shiftStep = 5;

    function parseVariableLengthQuantity(encodedText) {
        let currentAccumulator = 0;
        let currentBitOffset = 0;
        let charIndex = 0;
        let charData;

        do {
            if (charIndex >= encodedText.length) {
                throw new Error("Invalid VLQ sequence: premature termination.");
            }
            const currentCharacter = encodedText[charIndex];
            charData = charValueMap[currentCharacter];
            if (typeof charData === 'undefined') {
                throw new Error("Unrecognized VLQ character: " + currentCharacter);
            }
            currentAccumulator |= (charData & dataBits) << currentBitOffset;
            currentBitOffset += shiftStep;
            charIndex++;
        } while (charData & continuationBit);

        const finalValue = (currentAccumulator & 1) ? -(currentAccumulator >> 1) : (currentAccumulator >> 1);
        return { numericValue: finalValue, remainingString: encodedText.substring(charIndex) };
    }

    return {
        decodeVlq: parseVariableLengthQuantity
    };
})();

const UniqueDataStore = (function() {
    class ElementRegistry {
        constructor() {
            this.internalArray = [];
            this.elementMap = new Map();
        }

        registerItem(content, permitDuplicates = false) {
            if (!permitDuplicates && this.elementMap.has(content)) {
                return this.elementMap.get(content);
            }
            const currentIndex = this.internalArray.length;
            this.internalArray.push(content);
            this.elementMap.set(content, currentIndex);
            return currentIndex;
        }

        retrieveItemAt(idx) {
            return this.internalArray[idx];
        }

        listAllItems() {
            return this.internalArray.slice();
        }
    }
    return {
        Registry: ElementRegistry
    };
})();

const UtilityPack = (function() {
    function getPropertyOrDefault(obj, key, defaultValue) {
        return obj.hasOwnProperty(key) ? obj[key] : defaultValue;
    }

    function sortGeneratedAsc(a, b) {
        return a.targetLine - b.targetLine || a.targetColumn - b.targetColumn;
    }

    function sortOriginalAsc(a, b) {
        return a.sourceFileId - b.sourceFileId || a.sourceLine - b.sourceLine || a.sourceColumn - b.sourceColumn;
    }

    function normalizePath(base, relative) {
        if (!base || !relative) {
            return relative;
        }
        try {
            return new URL(relative, new URL(base)).href;
        } catch (e) {
            // Fallback for non-URL-like base paths (e.g., just a filename)
            const lastSlash = base.lastIndexOf('/');
            if (lastSlash !== -1) {
                base = base.substring(0, lastSlash + 1);
            } else {
                base = ''; // If no slash, treat base as a filename, not a directory
            }
            return base + relative;
        }
    }

    return {
        fetchOrDefault: getPropertyOrDefault,
        compareGeneratedPositions: sortGeneratedAsc,
        compareOriginalPositions: sortOriginalAsc,
        resolvePath: normalizePath
    };
})();

const IndexedSearch = (function() {
    function findClosestEntry(dataArray, searchTarget, comparisonFunc) {
        let start = 0;
        let end = dataArray.length - 1;
        let middle;

        while (start <= end) {
            middle = Math.floor((start + end) / 2);
            const comparisonResult = comparisonFunc(searchTarget, dataArray[middle]);

            if (comparisonResult === 0) {
                return middle;
            } else if (comparisonResult > 0) {
                start = middle + 1;
            } else {
                end = middle - 1;
            }
        }
        // Returns the index of the last element less than or equal to the target.
        return Math.max(0, start - 1);
    }

    return {
        performSearch: findClosestEntry
    };
})();

const CoordinateTranslator = (function() {
    class LocationInterpreter {
        constructor(mapJsonData) {
            const parsedContent = typeof mapJsonData === 'string' ? JSON.parse(mapJsonData.replace(/^\)\]\}'/, '')) : mapJsonData;

            const currentMapVersion = UtilityPack.fetchOrDefault(parsedContent, 'version');
            if (currentMapVersion !== 3) {
                throw new Error('Incompatible map version: ' + currentMapVersion);
            }

            this.sourceFileRegistry = new UniqueDataStore.Registry();
            this.symbolRegistry = new UniqueDataStore.Registry();

            UtilityPack.fetchOrDefault(parsedContent, 'sources', []).forEach(source => this.sourceFileRegistry.registerItem(source, true));
            UtilityPack.fetchOrDefault(parsedContent, 'names', []).forEach(name => this.symbolRegistry.registerItem(name, true));

            this.sourceRootDirectory = UtilityPack.fetchOrDefault(parsedContent, 'sourceRoot', null);
            this.sourceContentsArray = UtilityPack.fetchOrDefault(parsedContent, 'sourcesContent', null);
            this.encodedMappings = UtilityPack.fetchOrDefault(parsedContent, 'mappings');
            this.outputFileName = UtilityPack.fetchOrDefault(parsedContent, 'file', null);

            this._generatedCoordinatesCache = null;
            this._originalCoordinatesCache = null;
        }

        get allSourcePaths() {
            return this.sourceFileRegistry.listAllItems().map(s => UtilityPack.resolvePath(this.sourceRootDirectory, s));
        }

        get _generatedMappings() {
            if (!this._generatedCoordinatesCache) {
                this._generatedCoordinatesCache = [];
                this._originalCoordinatesCache = []; // Populate both together
                this._decodeAndStoreMappings();
            }
            return this._generatedCoordinatesCache;
        }

        get _originalMappings() {
            if (!this._originalCoordinatesCache) {
                this._generatedCoordinatesCache = []; // Populate both together
                this._originalCoordinatesCache = [];
                this._decodeAndStoreMappings();
            }
            return this._originalCoordinatesCache;
        }

        _decodeAndStoreMappings() {
            let currentGeneratedLine = 1;
            let lastGeneratedColumn = 0;
            let lastOriginalLine = 0;
            let lastOriginalColumn = 0;
            let lastSourceIdentifier = 0;
            let lastSymbolIdentifier = 0;
            let mappingString = this.encodedMappings;
            const delimiterRegex = /^[,;]/;

            while (mappingString.length > 0) {
                if (mappingString.charAt(0) === ';') {
                    currentGeneratedLine++;
                    mappingString = mappingString.substring(1);
                    lastGeneratedColumn = 0;
                } else if (mappingString.charAt(0) === ',') {
                    mappingString = mappingString.substring(1);
                } else {
                    const currentCoordinateEntry = {};
                    currentCoordinateEntry.targetLine = currentGeneratedLine;

                    let decodedPart = ValueEncoderDecoder.decodeVlq(mappingString);
                    currentCoordinateEntry.targetColumn = lastGeneratedColumn + decodedPart.numericValue;
                    lastGeneratedColumn = currentCoordinateEntry.targetColumn;
                    mappingString = decodedPart.remainingString;

                    if (mappingString.length > 0 && !delimiterRegex.test(mappingString.charAt(0))) {
                        decodedPart = ValueEncoderDecoder.decodeVlq(mappingString);
                        currentCoordinateEntry.sourceFileId = lastSourceIdentifier + decodedPart.numericValue;
                        lastSourceIdentifier = currentCoordinateEntry.sourceFileId;
                        mappingString = decodedPart.remainingString;
                        if (mappingString.length === 0 || delimiterRegex.test(mappingString.charAt(0))) {
                            throw new Error('Mapping provides source but lacks line/column');
                        }

                        decodedPart = ValueEncoderDecoder.decodeVlq(mappingString);
                        currentCoordinateEntry.sourceLine = (lastOriginalLine + decodedPart.numericValue) + 1; // 0-based to 1-based
                        lastOriginalLine = currentCoordinateEntry.sourceLine - 1;
                        mappingString = decodedPart.remainingString;
                        if (mappingString.length === 0 || delimiterRegex.test(mappingString.charAt(0))) {
                            throw new Error('Mapping provides source and line but lacks column');
                        }

                        decodedPart = ValueEncoderDecoder.decodeVlq(mappingString);
                        currentCoordinateEntry.sourceColumn = lastOriginalColumn + decodedPart.numericValue;
                        lastOriginalColumn = currentCoordinateEntry.sourceColumn;
                        mappingString = decodedPart.remainingString;

                        if (mappingString.length > 0 && !delimiterRegex.test(mappingString.charAt(0))) {
                            decodedPart = ValueEncoderDecoder.decodeVlq(mappingString);
                            currentCoordinateEntry.nameId = lastSymbolIdentifier + decodedPart.numericValue;
                            lastSymbolIdentifier = currentCoordinateEntry.nameId;
                            mappingString = decodedPart.remainingString;
                        }
                    }

                    this._generatedCoordinatesCache.push(currentCoordinateEntry);
                    this._originalCoordinatesCache.push(currentCoordinateEntry);
                }
            }

            this._generatedCoordinatesCache.sort(UtilityPack.compareGeneratedPositions);
            this._originalCoordinatesCache.sort(UtilityPack.compareOriginalPositions);
        }

        getOriginalLocation({ targetLine, targetColumn }) {
            const lookupTarget = { targetLine: targetLine, targetColumn: targetColumn };
            const foundIndex = IndexedSearch.performSearch(this._generatedMappings, lookupTarget, UtilityPack.compareGeneratedPositions);

            const correspondingMapping = this._generatedMappings[foundIndex];

            // If the found mapping is not on the same target line, or if it's past the target column
            // on the same line (meaning nothing before or at target column was found), return nulls.
            if (!correspondingMapping || correspondingMapping.targetLine !== targetLine || correspondingMapping.targetColumn > targetColumn) {
                return { source: null, line: null, column: null, name: null };
            }

            const sourceFilePath = this.sourceFileRegistry.retrieveItemAt(correspondingMapping.sourceFileId);
            const symbolName = correspondingMapping.hasOwnProperty('nameId') ? this.symbolRegistry.retrieveItemAt(correspondingMapping.nameId) : null;

            return {
                source: sourceFilePath || null,
                line: correspondingMapping.sourceLine || null,
                column: correspondingMapping.sourceColumn || null,
                name: symbolName || null
            };
        }
    }

    return {
        Interpreter: LocationInterpreter
    };
})();

const traceProcessor = (function() {
    const stackLineRegex = /^\s*at\s+(?:.+?\s+\()?(.+?):(\d+):(\d+)\)?$/;
    const mapCommentRegex = /\/\/#\s*sourceMappingURL=(.*)/;
    const isAbsoluteUri = /^(?:[a-z]+:)?\/\//i;

    class ResourceObtainer {
        constructor() {
            this.mapCache = new Map();
        }

        async retrieveMapForUri(scriptUri) {
            if (this.mapCache.has(scriptUri)) {
                return this.mapCache.get(scriptUri);
            }

            let mapContent = null;
            try {
                const scriptResponse = await fetch(scriptUri);
                if (!scriptResponse.ok && !(scriptUri.startsWith("file://") && scriptResponse.status === 0)) {
                    throw new Error(`Failed to fetch script: ${scriptResponse.status} ${scriptResponse.statusText}`);
                }
                const scriptText = await scriptResponse.text();
                const mapMatch = scriptText.match(mapCommentRegex);

                if (mapMatch && mapMatch[1]) {
                    let mapUrl = mapMatch[1];
                    if (!isAbsoluteUri.test(mapUrl)) {
                        mapUrl = UtilityPack.resolvePath(scriptUri, mapUrl);
                    }

                    const mapResponse = await fetch(mapUrl);
                    if (!mapResponse.ok && !(mapUrl.startsWith("file://") && mapResponse.status === 0)) {
                        throw new Error(`Failed to fetch source map: ${mapResponse.status} ${mapResponse.statusText}`);
                    }
                    mapContent = await mapResponse.text();
                }
            } catch (error) {
                console.warn(`Problem fetching resources for ${scriptUri}:`, error);
            } finally {
                this.mapCache.set(scriptUri, mapContent);
            }
            return mapContent;
        }
    }

    async function remapTraceLines(initialLines, parsedEntries, resourceFetcher) {
        const outputLines = [initialLines[0]]; // Retain the initial error message line
        let currentFileInterpreter = null;
        let lastProcessedFile = null;

        for (const entry of parsedEntries) {
            if (entry.sourcePath) {
                if (entry.sourcePath !== lastProcessedFile) {
                    const mapData = resourceFetcher.mapCache.get(entry.sourcePath);
                    if (mapData) {
                        try {
                            currentFileInterpreter = new CoordinateTranslator.Interpreter(mapData);
                        } catch (e) {
                            console.warn(`Error processing map for ${entry.sourcePath}:`, e);
                            currentFileInterpreter = null;
                        }
                    } else {
                        currentFileInterpreter = null;
                    }
                    lastProcessedFile = entry.sourcePath;
                }

                if (currentFileInterpreter) {
                    const originalPosition = currentFileInterpreter.getOriginalLocation({
                        targetLine: entry.lineNum,
                        targetColumn: entry.colNum
                    });
                    if (originalPosition && originalPosition.source) {
                        outputLines.push(formatOriginalLocation(originalPosition.source, originalPosition.line, originalPosition.column, originalPosition.name));
                    } else {
                        outputLines.push(initialLines[entry.originalLineIndex]); // Fallback to original line
                    }
                } else {
                    outputLines.push(initialLines[entry.originalLineIndex]); // No interpreter, keep original
                }
            } else {
                outputLines.push(initialLines[entry.originalLineIndex]); // Not a parsable stack line, keep original
            }
        }
        return outputLines.join('\n');
    }

    function formatOriginalLocation(file, line, column, symbol) {
        const symbolDisplay = symbol ? symbol : '(unknown)';
        return `    at ${symbolDisplay} (${file}:${line}:${column})`;
    }

    async function adjustErrorTrace(stackString, callbackFunction) {
        const allStackTraceLines = stackString.split('\n');
        const collectedEntries = [];
        const uniqueSourceFiles = new Set();

        for (let i = 1; i < allStackTraceLines.length; i++) {
            const lineMatch = allStackTraceLines[i].match(stackLineRegex);
            if (lineMatch && lineMatch.length >= 4) {
                const sourcePath = lineMatch[1];
                const lineNumber = parseInt(lineMatch[2], 10);
                const columnNumber = parseInt(lineMatch[3], 10);
                collectedEntries.push({
                    originalLineIndex: i,
                    sourcePath: sourcePath,
                    lineNum: lineNumber,
                    colNum: columnNumber
                });
                uniqueSourceFiles.add(sourcePath);
            } else {
                collectedEntries.push({
                    originalLineIndex: i,
                    sourcePath: null,
                    lineNum: null,
                    colNum: null
                });
            }
        }

        const fetcher = new ResourceObtainer();
        const fetchOperations = Array.from(uniqueSourceFiles).map(url => fetcher.retrieveMapForUri(url));

        await Promise.allSettled(fetchOperations);

        const finalOutputTrace = await remapTraceLines(allStackTraceLines, collectedEntries, fetcher);
        callbackFunction(finalOutputTrace);
    }

    return {
        adjustErrorTrace: adjustErrorTrace
    };
})();

(function(globalScope) {
    if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = traceProcessor.adjustErrorTrace;
    } else if (typeof define === 'function' && define.amd) {
        define(() => traceProcessor.adjustErrorTrace);
    } else if (typeof exports === 'object') {
        exports.unifiedTraceProcessor = traceProcessor.adjustErrorTrace;
    } else {
        globalScope.unifiedTraceProcessor = traceProcessor.adjustErrorTrace;
    }
})(this);