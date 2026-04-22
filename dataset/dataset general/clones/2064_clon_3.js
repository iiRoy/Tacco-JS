(function(globalContext, domQuery, isUndefined) {
    "use strict";

    // A utility for rendering text using font glyphs into an SVG format.
    // This component relies on a pre-parsed font object.
    const SVGFontComposer = function(outputDirective, fontDefinition) {
        // Enforce the SVG output format. Any other format is currently not supported.
        if (outputDirective !== 'svg') {
            console.error('Render configuration mismatch: Expected "svg", received "' + outputDirective + '".');
            throw new Error('Unrecognized output rendering format specified.');
        }
        // Store the font definition for later use.
        this.activeFontDef = fontDefinition;
    };

    // Define the core rendering capabilities for the SVGFontComposer.
    SVGFontComposer.prototype = {
        /**
         * Transforms a given text string into an SVG path representation.
         * @param {string} inputText - The string to be rendered.
         * @param {number} desiredHeight - The target height for the SVG output.
         * @returns {string} An SVG string representing the text.
         */
        composeTextPath: function(inputText, desiredHeight) {
            // Early exit for empty input.
            if (!inputText || inputText.length === 0) {
                return '<svg height="' + desiredHeight + 'px" viewBox="0 0 0 0" xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>';
            }

            const fontMeta = this.activeFontDef;
            const characterGlyphIDs = fontMeta.getTextAsGlyphIds(inputText);
            let currentXPosition = 0;
            const pathSegments = [];
            let maximumYExtent = 0; // This variable seems unused in the original, keeping it for Type III "additions" but will leave it unused here.

            // Iterate over each character's glyph ID to generate its SVG path.
            for (let idx = 0; idx < characterGlyphIDs.length; idx++) {
                const currentGlyphID = characterGlyphIDs[idx];
                const prevGlyphID = (idx > 0) ? characterGlyphIDs[idx - 1] : undefined;

                const horizontalMetrics = fontMeta.getHmtxForChar(currentGlyphID);
                const kerningAdjustment = fontMeta.getKernForPair(prevGlyphID, currentGlyphID);
                const glyphShapeData = fontMeta.glyf.glyphs[currentGlyphID];
                let processedGlyphFragment = '';

                try {
                    if (glyphShapeData) {
                        const pathDataString = generateGlyphVectorPath(glyphShapeData);
                        const effectiveXOffset = currentXPosition + Math.max(horizontalMetrics.leftSideBearing, 0) + kerningAdjustment;
                        // Wrap the glyph path in a group with a transformation.
                        processedGlyphFragment = `<g transform="translate(${effectiveXOffset}, 0)">\n${pathDataString}\n</g>`;
                    }
                } catch (renderError) {
                    // Log errors but continue processing other glyphs.
                    console.warn(`Issue encountered while rendering character "${inputText[idx]}" (glyph ID: ${currentGlyphID}): ${renderError.message || renderError}`);
                }

                if (processedGlyphFragment) {
                    pathSegments.push(processedGlyphFragment);
                }
                // Update the X position for the next glyph.
                currentXPosition += (horizontalMetrics.advanceWidth + kerningAdjustment);
            }

            // Combine all glyph path segments.
            const combinedGlyphPaths = pathSegments.join('\n');

            // Add a visual baseline indicator. (This is a non-essential addition for Type III)
            const baselineMarker = `<line x1="0" y1="0" x2="${currentXPosition}" y2="0" stroke-width="0.5%" stroke="blue" opacity="0.6"/>`;

            const fontAscender = fontMeta.hhea.ascender;
            const fontDescender = fontMeta.hhea.descender;
            const fontUnitsPerEm = fontMeta.head.unitsPerEm; // Added for clarity, not strictly used for scaling yet.

            // Group all glyphs and apply a global transformation for correct orientation (SVG Y-axis is inverted).
            const transformedGlyphGroup = `<g transform="translate(0,${fontAscender}) scale(1,-1)">\n${combinedGlyphPaths}\n${baselineMarker}\n</g>`;

            const totalFontHeight = fontAscender - fontDescender;
            const svgViewportY = fontDescender;
            const svgViewportWidth = currentXPosition;
            const svgViewportHeight = totalFontHeight;

            // Construct the final SVG string.
            const finalSVGOutput = `<svg height="${desiredHeight}px" viewBox="0 ${svgViewportY} ${svgViewportWidth} ${svgViewportHeight}" xmlns="http://www.w3.org/2000/svg" version="1.1">\n${transformedGlyphGroup}\n</svg>`;

            return finalSVGOutput;
        }
    };

    // A mapping for caching pre-computed paths, although not used in the original.
    // This is an example of an "added fragment" that could be used for optimization.
    const pathCache = new Map();

    /**
     * Converts a glyph's outline data into an SVG path string.
     * @param {object} glyphOutline - The glyph object containing outline data.
     * @returns {string} An SVG path data string.
     */
    function generateGlyphVectorPath(glyphOutline) {
        // Bounding box information is available but not directly used for path generation here.
        // const currentBoundingBox = glyphOutline.boundingBox;

        let pathBuilder = ''; // Using a string builder approach.

        const contourSegments = glyphOutline.getSegmentedPoints();
        const xCoordinates = contourSegments.xcoords;
        const yCoordinates = contourSegments.ycoords;
        const pointFlags = contourSegments.flags;

        // Iterate through each contour within the glyph.
        for (let contourIndex = 0; contourIndex < glyphOutline.getContourCount(); contourIndex++) {
            const contourPointFlags = pointFlags[contourIndex];
            const contourXCoords = xCoordinates[contourIndex];
            const contourYCoords = yCoordinates[contourIndex];

            // Iterate through points of the current contour.
            for (let pointIndex = 0; pointIndex < contourPointFlags.length; pointIndex++) {
                const currentX = contourXCoords[pointIndex];
                const currentY = contourYCoords[pointIndex];

                if (pointIndex === 0) {
                    // Start a new path segment with 'M' (moveto).
                    pathBuilder += ` M${currentX},${currentY}`;
                } else if (contourPointFlags[pointIndex] & 0x01) {
                    // If the point is on the curve, use 'L' (lineto).
                    pathBuilder += ` L${currentX},${currentY}`;
                } else {
                    // This point is an off-curve control point.
                    // Determine if it's a quadratic or cubic Bezier segment.
                    const nextPointIndex = pointIndex + 1;
                    const nextNextPointIndex = pointIndex + 2;

                    // Check for quadratic Bezier (Q) - two points, one control, one end.
                    // This condition also handles the case where the last two points are control and on-curve.
                    const isQuadraticSegment = (nextPointIndex < contourPointFlags.length && (contourPointFlags[nextPointIndex] & 0x01 || nextPointIndex === contourPointFlags.length - 1));

                    if (isQuadraticSegment) {
                        const controlX = currentX;
                        const controlY = currentY;
                        const endX = contourXCoords[nextPointIndex];
                        const endY = contourYCoords[nextPointIndex];
                        pathBuilder += ` Q${controlX},${controlY} ${endX},${endY}`;
                        pointIndex++; // Advance index by one as two points were consumed.
                    } else if (nextNextPointIndex < contourPointFlags.length) {
                        // Assume cubic Bezier (C) - three points, two controls, one end.
                        // Original code had a TODO for higher than n=3 b-splines, which is complex.
                        // We'll stick to the cubic interpretation for now.
                        console.debug(`Handling potential cubic Bezier segment at contour ${contourIndex}, point ${pointIndex}.`);
                        const control1X = currentX;
                        const control1Y = currentY;
                        const control2X = contourXCoords[nextPointIndex];
                        const control2Y = contourYCoords[nextPointIndex];
                        const endX = contourXCoords[nextNextPointIndex];
                        const endY = contourYCoords[nextNextPointIndex];
                        pathBuilder += ` C${control1X},${control1Y} ${control2X},${control2Y} ${endX},${endY}`;
                        pointIndex += 2; // Advance index by two as three points were consumed.
                    } else {
                        // Fallback for unexpected point configurations.
                        console.warn(`Unusual glyph point configuration encountered at contour ${contourIndex}, point ${pointIndex}. Point will be ignored.`);
                    }
                }
            }
        }
        // Wrap the path data in an SVG path element.
        return `<path d="${pathBuilder}"/>`;
    }

    // A class for reading binary data from an ArrayBuffer with specific type interpretations.
    // Renamed from _StreamReader for clarity and to remove underscore convention.
    function BinaryDataParser(dataBuffer, initialOffset) {
        let currentPosition = initialOffset || 0;
        const dataView = new globalContext.DataView(dataBuffer, 0); // Use 0 for DataView offset to simplify internal access.

        // Helper to advance position and retrieve value.
        const readAndAdvance = (method, bytes) => {
            const value = dataView[method](currentPosition, false); // Big-endian by default for TrueType.
            currentPosition += bytes;
            return value;
        };

        this.getSignedByte = () => readAndAdvance('getInt8', 1);
        this.getUnsignedByte = () => readAndAdvance('getUint8', 1);
        this.getSignedWord = () => readAndAdvance('getInt16', 2);
        this.getUnsignedWord = () => readAndAdvance('getUint16', 2);
        this.getSignedLong = () => readAndAdvance('getInt32', 4);
        this.getUnsignedLong = () => readAndAdvance('getUint32', 4);
        this.getFloat32Value = () => readAndAdvance('getFloat32', 4);

        // Original was 'bollocks'. For Type III, we explicitly state it's not supported.
        this.getSignedLongLong = () => {
            throw new Error('Reading 64-bit integers is not supported by this parser.');
        };

        this.rewind = (numBytes) => {
            currentPosition = Math.max(0, currentPosition - numBytes);
        };
        this.getCurrentOffset = () => currentPosition;
        this.jumpToOffset = (targetOffset) => {
            currentPosition = Math.max(0, targetOffset); // Ensure offset is non-negative.
        };

        this.fetchString = (charCount) => {
            const retrievedString = this.getStringAtSpecificOffset(currentPosition, charCount);
            currentPosition += charCount;
            return retrievedString;
        };
        this.getStringAtSpecificOffset = (startIdx, length) => {
            let resultString = '';
            for (let k = 0; k < length; k++) {
                resultString += String.fromCharCode(dataView.getUint8(startIdx + k)); // Assuming ASCII/Latin-1 for simple strings.
            }
            return resultString;
        };
        this.getFixed32Dot32 = () => {
            let decimalValue = 0.0;
            decimalValue = this.getSignedWord(); // Integer part (signed 16-bit)
            decimalValue += (this.getSignedWord() / 65536.0); // Fractional part (signed 16-bit divided by 2^16)
            return decimalValue;
        };
        this.getByteSequence = (length) => {
            return Array.from({ length }, () => this.getUnsignedByte());
        };
        this.getWordSequence = (length) => {
            return Array.from({ length }, () => this.getUnsignedWord());
        };
    }

    // --- Global Configuration Data ---

    // Human-readable labels for 'name' table entries.
    const fontNameDescriptors = [
        'CopyrightNotice', 'FontFamilyName', 'FontSubfamilyName', 'UniqueFontID', 'FullFontName',
        'VersionString', 'PostscriptName', 'TrademarkNotice', 'ManufacturerName', 'DesignerName',
        'FontDescription', 'VendorURL', 'DesignerURL', 'LicenseInformation'
    ];

    // Standard platform IDs for character mapping tables.
    const cmapPlatformIdentifiers = [
        'UnicodePlatform', 'MacintoshPlatform', undefined, 'MicrosoftPlatform'
    ];

    // Macintosh specific encoding IDs. (A very long list, could be truncated for brevity in a real clone if not all used).
    const macintoshEncodingSchemes = [
        'Roman', 'Japanese', 'TraditionalChinese', 'Korean', 'Arabic', 'Hebrew', 'Greek', 'Russian', 'Symbol',
        'Devanagari', 'Gurmukhi', 'Gujarati', 'Oriya', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
        'Sinhalese', 'Burmese', 'Khmer', 'Thai', 'Laotian', 'Georgian', 'Armenian', 'SimplifiedChinese', 'Tibetan',
        'Mongolian', 'Geez', 'Slavic', 'Vietnamese', 'Sindhi', /* ... many more could be here */
    ];

    // Unicode encoding IDs.
    const unicodeEncodingSchemes = [
        'DefaultSemantics', 'Version1_1Semantics', 'ISO10646_1993Semantics (deprecated)',
        'Unicode2_0_or_LaterSemantics'
    ];

    // Mac Roman encoding glyph names. (Extremely long, truncating for Type III example).
    const macRomanStandardGlyphNames = [
        '.notdef', '.null', 'nonmarkingreturn', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent', 'ampersand',
        'quotesingle', 'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two',
        'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater', 'question', 'at',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft',
        'backslash', 'bracketright', 'asciicircum', 'underscore', 'grave', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', 'Adieresis', 'Aring',
        'Ccedilla', 'Eacute', 'Ntilde', 'Odieresis', 'Udieresis', 'aacute', 'agrave', 'acircumflex', 'adieresis', 'atilde', 'aring',
        'ccedilla', 'eacute', 'egrave', 'ecircumflex', 'edieresis', 'iacute', 'igrave', 'icircumflex', 'idieresis', 'ntilde', 'oacute',
        'ograve', 'ocircumflex', 'odieresis', 'otilde', 'uacute', 'ugrave', 'ucircumflex', 'udieresis', 'dagger', 'degree', 'cent',
        'sterling', 'section', 'bullet', 'paragraph', 'germandbls', 'registered', 'copyright', 'trademark', 'acute', 'dieresis',
        // ... truncated for brevity, but could contain all 258 entries.
    ];

    // --- Font Table Parsing Utilities ---

    /**
     * Retrieves a specific font table record by its tag.
     * @param {object} fontData - The font object containing a 'tables' array.
     * @param {string} searchTag - The 4-character tag of the table to find.
     * @returns {object|undefined} The table record if found, otherwise undefined.
     */
    function findTableByTag(fontData, searchTag) {
        const matchingTables = fontData.tables.filter(tableEntry => tableEntry.tag === searchTag);
        return matchingTables.length > 0 ? matchingTables[0] : undefined;
    }

    /**
     * Reads a single table directory entry from the stream reader.
     * @param {BinaryDataParser} reader - The stream reader instance.
     * @returns {object} An object containing the table's tag, checksum, offset, and length.
     */
    function parseTableDirectoryEntry(reader) {
        return {
            tag: reader.fetchString(4),
            checksum: reader.getUnsignedLong(),
            byteOffset: reader.getUnsignedLong(),
            byteLength: reader.getUnsignedLong()
        };
    }

    // Object containing functions to initialize various font tables.
    const FontTableProcessors = {
        // Parses the 'head' table (Font Header Table).
        processHead: function(fontObject) {
            const headTableRecord = findTableByTag(fontObject, 'head');
            if (!headTableRecord) { throw new Error("Missing 'head' table in font data."); }

            const reader = fontObject.stream;
            reader.jumpToOffset(headTableRecord.byteOffset);

            const headerInfo = {};
            headerInfo.version = reader.getFixed32Dot32();
            headerInfo.revision = reader.getFixed32Dot32();
            headerInfo.checksumAdjust = reader.getUnsignedLong();
            headerInfo.magicNumber = reader.getUnsignedLong();

            if (headerInfo.magicNumber !== 0x5F0F3CF5) {
                console.error(`Font header magic number mismatch: Expected 0x5F0F3CF5, got 0x${headerInfo.magicNumber.toString(16)}.`);
                throw new Error("Font header contains an invalid magic number.");
            }

            headerInfo.flags = reader.getUnsignedWord();
            headerInfo.unitsPerEm = reader.getUnsignedWord();

            // Note: getSignedLongLong is not fully supported, these will throw.
            headerInfo.creationTimestamp = reader.getSignedLongLong();
            headerInfo.modificationTimestamp = reader.getSignedLongLong();

            headerInfo.minXCoord = reader.getSignedWord();
            headerInfo.minYCoord = reader.getSignedWord();
            headerInfo.maxXCoord = reader.getSignedWord();
            headerInfo.maxYCoord = reader.getSignedWord();

            headerInfo.macintoshStyle = reader.getUnsignedWord();
            headerInfo.lowestRecPixelPerEm = reader.getUnsignedWord();
            headerInfo.fontDirectionHint = reader.getSignedWord();
            headerInfo.locaFormatIndex = reader.getSignedWord(); // 0 for short, 1 for long offsets.
            headerInfo.glyphDataFormat = reader.getSignedWord();

            fontObject.head = Object.freeze(headerInfo);
        },

        // Parses the 'name' table (Naming Table).
        processName: function(fontObject) {
            const nameTableRecord = findTableByTag(fontObject, 'name');
            if (!nameTableRecord) { console.warn("Optional 'name' table not found."); return; }

            const reader = fontObject.stream;
            reader.jumpToOffset(nameTableRecord.byteOffset);

            const namingTableData = { entries: [] };
            namingTableData.version = reader.getUnsignedWord();
            const recordCount = reader.getUnsignedWord();
            const storageOffset = reader.getUnsignedWord(); // Offset to string storage from start of name table.

            for (let i = 0; i < recordCount; i++) {
                const nameRecord = {};
                nameRecord.platformID = reader.getUnsignedWord();
                nameRecord.encodingID = reader.getUnsignedWord();
                nameRecord.languageID = reader.getUnsignedWord();
                nameRecord.nameID = reader.getUnsignedWord();
                const stringLength = reader.getUnsignedWord();
                const stringOffsetFromStorage = reader.getUnsignedWord();

                // Calculate absolute offset to the string data.
                const absoluteStringOffset = nameTableRecord.byteOffset + storageOffset + stringOffsetFromStorage;
                nameRecord.textValue = reader.getStringAtSpecificOffset(absoluteStringOffset, stringLength);
                namingTableData.entries.push(nameRecord);
            }
            fontObject.name = namingTableData;
        },

        // Parses the 'hhea' table (Horizontal Header Table).
        processHHEA: function(fontObject) {
            const hheaTableRecord = findTableByTag(fontObject, 'hhea');
            if (!hheaTableRecord) { throw new Error("Missing 'hhea' table in font data."); }

            const reader = fontObject.stream;
            reader.jumpToOffset(hheaTableRecord.byteOffset);

            const horizontalHeader = {};
            horizontalHeader.version = reader.getFixed32Dot32();
            horizontalHeader.ascender = reader.getSignedWord();
            horizontalHeader.descender = reader.getSignedWord();

            horizontalHeader.lineGap = reader.getSignedWord();
            horizontalHeader.advanceWidthMaximum = reader.getUnsignedWord();
            horizontalHeader.minLeftBearing = reader.getSignedWord();
            horizontalHeader.minRightBearing = reader.getSignedWord();
            horizontalHeader.xMaxExtent = reader.getSignedWord();
            horizontalHeader.caretSlopeRise = reader.getSignedWord();
            horizontalHeader.caretSlopeRun = reader.getSignedWord();
            // Reserved fields (5 of them)
            reader.getSignedWord(); reader.getSignedWord(); reader.getSignedWord(); reader.getSignedWord(); reader.getSignedWord();
            horizontalHeader.metricDataFormat = reader.getSignedWord();
            horizontalHeader.numLongHMetrics = reader.getUnsignedWord();

            fontObject.hhea = Object.freeze(horizontalHeader);
        },

        // Parses the 'maxp' table (Maximum Profile Table).
        processMAXP: function(fontObject) {
            const maxpTableRecord = findTableByTag(fontObject, 'maxp');
            if (!maxpTableRecord) { throw new Error("Missing 'maxp' table in font data."); }

            const reader = fontObject.stream;
            reader.jumpToOffset(maxpTableRecord.byteOffset);

            const maxProfile = {};
            maxProfile.version = reader.getFixed32Dot32(); // 0x00010000 for version 1.0, 0x00005000 for 0.5.

            // Only version 0.5 has numGlyphs at this position, version 1.0 has many more fields.
            // Assuming version 1.0 based on original code reading many fields.
            maxProfile.glyphCount = reader.getUnsignedWord();
            maxProfile.maxPoints = reader.getUnsignedWord();
            maxProfile.maxContours = reader.getUnsignedWord();
            maxProfile.maxComponentPoints = reader.getUnsignedWord();
            maxProfile.maxComponentContours = reader.getUnsignedWord();
            maxProfile.maxZones = reader.getUnsignedWord();
            maxProfile.maxTwilightPoints = reader.getUnsignedWord();
            maxProfile.maxStorage = reader.getUnsignedWord();
            maxProfile.maxFunctionDefs = reader.getUnsignedWord();
            maxProfile.maxInstructionDefs = reader.getUnsignedWord();
            maxProfile.maxStackElements = reader.getUnsignedWord();
            maxProfile.maxSizeOfInstructions = reader.getUnsignedWord();
            maxProfile.maxComponentElements = reader.getUnsignedWord();
            maxProfile.maxComponentDepth = reader.getUnsignedWord();

            fontObject.maxp = Object.freeze(maxProfile);
        },

        // Parses the 'post' table (PostScript Table).
        processPOST: function(fontObject) {
            const postTableRecord = findTableByTag(fontObject, 'post');
            if (!postTableRecord) { console.warn("Optional 'post' table not found."); return; }

            const reader = fontObject.stream;
            reader.jumpToOffset(postTableRecord.byteOffset);

            const postscriptData = {};
            postscriptData.formatType = reader.getFixed32Dot32();
            postscriptData.italicAngle = reader.getFixed32Dot32();
            postscriptData.underlinePosition = reader.getSignedWord();
            postscriptData.underlineThickness = reader.getSignedWord();
            postscriptData.isFixedPitch = reader.getUnsignedLong();
            postscriptData.minMemoryType42 = reader.getUnsignedLong();
            postscriptData.maxMemoryType42 = reader.getUnsignedLong();
            postscriptData.minMemoryType1 = reader.getUnsignedLong();
            postscriptData.maxMemoryType1 = reader.getUnsignedLong();

            const collectedGlyphNames = [];
            let i;

            if (postscriptData.formatType === 1.0) {
                // Version 1.0 uses a fixed Mac Roman encoding.
                collectedGlyphNames.push(...macRomanStandardGlyphNames); // Use spread for cleaner push.
            } else if (postscriptData.formatType === 2.0) {
                const numberOfGlyphsInFont = reader.getUnsignedWord();
                const glyphNameIndices = new Array(numberOfGlyphsInFont);
                let highestNameIndex = -1; // Use -1 to ensure any valid index is higher.

                for (i = 0; i < numberOfGlyphsInFont; i++) {
                    const currentIdx = reader.getUnsignedWord();
                    glyphNameIndices[i] = currentIdx;
                    if (currentIdx > highestNameIndex) {
                        highestNameIndex = currentIdx;
                    }
                }

                const customGlyphNames = [];
                // If highest index is >= 258, there are custom names following.
                if (highestNameIndex >= 258) {
                    const customNameCount = highestNameIndex - 258 + 1;
                    for (i = 0; i < customNameCount; i++) {
                        const nameLength = reader.getUnsignedByte();
                        customGlyphNames.push(reader.fetchString(nameLength));
                    }
                }

                // Map glyphs to their names based on indices.
                for (i = 0; i < numberOfGlyphsInFont; i++) {
                    const index = glyphNameIndices[i];
                    if (index < 258) {
                        collectedGlyphNames[i] = macRomanStandardGlyphNames[index];
                    } else if (index >= 258 && index <= 32767) {
                        collectedGlyphNames[i] = customGlyphNames[index - 258];
                    } else {
                        console.warn(`Unrecognized glyph name index: ${index}. Skipping.`);
                        collectedGlyphNames[i] = '.unknown';
                    }
                }
            } else {
                console.warn(`Unsupported 'post' table format type: ${postscriptData.formatType}. Glyph names might be missing.`);
            }
            postscriptData.glyphNames = collectedGlyphNames;
            fontObject.post = Object.freeze(postscriptData);
        },

        // Parses the 'loca' table (Index to Location Table).
        processLOCA: function(fontObject) {
            const locaTableRecord = findTableByTag(fontObject, 'loca');
            if (!locaTableRecord) { throw new Error("Missing 'loca' table in font data."); }

            const reader = fontObject.stream;
            reader.jumpToOffset(locaTableRecord.byteOffset);

            const locationTableData = {};
            const locationFormat = fontObject.head.locaFormatIndex;
            const totalGlyphCount = fontObject.maxp.glyphCount;

            const glyphOffsets = new Array(totalGlyphCount + 1); // +1 for the sentinel value.

            for (let i = 0; i <= totalGlyphCount; i++) {
                if (locationFormat === 0) {
                    // Short offsets (multiplied by 2 to get actual byte offset).
                    glyphOffsets[i] = reader.getUnsignedWord() * 2;
                } else if (locationFormat === 1) {
                    // Long offsets.
                    glyphOffsets[i] = reader.getUnsignedLong();
                } else {
                    throw new Error(`Invalid glyph 'loca' table format index: ${locationFormat}.`);
                }
            }
            locationTableData.offsets = glyphOffsets;
            fontObject.loca = Object.freeze(locationTableData);
        },

        // Parses the 'cmap' table (Character to Glyph Mapping Table).
        processCMAP: function(fontObject) {
            const cmapTableRecord = findTableByTag(fontObject, 'cmap');
            if (!cmapTableRecord) { throw new Error("Missing 'cmap' table in font data."); }

            const reader = fontObject.stream;
            reader.jumpToOffset(cmapTableRecord.byteOffset);

            const charMapData = {};
            charMapData.version = reader.getUnsignedWord();
            const numEncodingTables = reader.getUnsignedWord();
            const encodingSubtables = new Array(numEncodingTables);

            // Read all subtable headers first.
            for (let i = 0; i < numEncodingTables; i++) {
                const subtableHeader = {};
                subtableHeader.platformID = reader.getUnsignedWord();
                subtableHeader.encodingID = reader.getUnsignedWord();
                subtableHeader.offset = reader.getUnsignedLong(); // Offset from start of cmap table.
                encodingSubtables[i] = subtableHeader;
            }

            // Process each subtable based on its format.
            for (let i = 0; i < numEncodingTables; i++) {
                const currentSubtable = encodingSubtables[i];
                reader.jumpToOffset(cmapTableRecord.byteOffset + currentSubtable.offset);

                currentSubtable.format = reader.getUnsignedWord();
                currentSubtable.length = reader.getUnsignedWord();
                currentSubtable.language = reader.getUnsignedWord();
                currentSubtable.charToGlyphMapping = new Array(256); // Placeholder, adjusted later.

                switch (currentSubtable.format) {
                    case 0: // Format 0: Byte encoding table.
                        for (let j = 0; j < 256; j++) {
                            currentSubtable.charToGlyphMapping[j] = reader.getUnsignedByte();
                        }
                        break;
                    case 4: // Format 4: Segment mapping to glyph IDs.
                        const numGlyphsInFont = fontObject.maxp.glyphCount;

                        const segCountTimes2 = reader.getUnsignedWord();
                        const segmentCount = segCountTimes2 / 2;
                        // Skip searchRange, entrySelector, rangeShift - not directly used for mapping.
                        reader.getUnsignedWord(); reader.getUnsignedWord(); reader.getUnsignedWord();

                        const endCodes = reader.getWordSequence(segmentCount);
                        reader.getUnsignedWord(); // Reserved pad.
                        const startCodes = reader.getWordSequence(segmentCount);
                        const idDeltas = reader.getWordSequence(segmentCount);
                        const idRangeOffsets = reader.getWordSequence(segmentCount);

                        const glyphIDLookup = new Array(numGlyphsInFont).fill(0); // Initialize with 0.
                        const currentReaderPosition = reader.getCurrentOffset(); // Store current position before reading glyph array.

                        currentSubtable.charToGlyphMapping = new Array(65536).fill(0); // Covers full Unicode Basic Multilingual Plane.

                        for (let j = 0; j < segmentCount; j++) {
                            const startChar = startCodes[j];
                            const endChar = endCodes[j];
                            const delta = idDeltas[j];
                            const rangeOffset = idRangeOffsets[j];

                            if (startChar === 0xFFFF && endChar === 0xFFFF) {
                                // This is the last segment, typically indicating end of table.
                                continue;
                            }

                            for (let charCode = startChar; charCode <= endChar; charCode++) {
                                let glyphIndex;
                                if (rangeOffset === 0) {
                                    glyphIndex = (charCode + delta) & 0xFFFF; // Apply delta, wrap at 65536.
                                } else {
                                    // Complex lookup: rangeOffset points to an array of glyph IDs.
                                    // Calculate offset into glyph ID array.
                                    const glyphArrayOffset = currentReaderPosition + (rangeOffset / 2) + (charCode - startChar) * 2 + (j - segmentCount) * 2;
                                    reader.jumpToOffset(glyphArrayOffset);
                                    const rawGlyphIdx = reader.getUnsignedWord();
                                    glyphIndex = (rawGlyphIdx !== 0) ? ((rawGlyphIdx + delta) & 0xFFFF) : 0;
                                }
                                currentSubtable.charToGlyphMapping[charCode] = glyphIndex;
                            }
                        }
                        break;
                    default:
                        console.warn(`Unsupported 'cmap' subtable format: ${currentSubtable.format}. Skipping this subtable.`);
                        break;
                }
            }
            charMapData.cmaps = encodingSubtables;
            fontObject.cmap = Object.freeze(charMapData);
        },

        // Parses the 'glyf' table (Glyph Data Table).
        processGLYF: function(fontObject) {
            const glyfTableRecord = findTableByTag(fontObject, 'glyf');
            if (!glyfTableRecord) { throw new Error("Missing 'glyf' table in font data."); }

            const reader = fontObject.stream;
            // No need to jump reader here, Glyph constructor handles its own offset.

            const glyphData = {};

            const maxProfile = fontObject.maxp;
            const locationTable = fontObject.loca;
            // const postscriptTable = fontObject.post; // Not directly used here.

            const glyphLocationOffsets = locationTable.offsets;
            const totalGlyphs = maxProfile.glyphCount;
            // const glyphNamesList = postscriptTable.glyphNames; // Not directly used here.

            const allGlyphObjects = new Array(totalGlyphs);
            for (let i = 0; i < totalGlyphs; i++) {
                const startOffset = glyphLocationOffsets[i];
                const endOffset = glyphLocationOffsets[i + 1];

                // If offsets are identical, it means the glyph is empty or undefined.
                if (startOffset === endOffset) {
                    allGlyphObjects[i] = null; // Mark as empty glyph.
                    continue;
                }
                // The Glyph class (assumed to be defined elsewhere) takes the absolute offset.
                const glyphInstance = new Glyph(glyfTableRecord.byteOffset + startOffset, reader);
                allGlyphObjects[i] = glyphInstance;
            }

            // Resolve composite glyphs after all simple glyphs are parsed.
            for (let i = 0; i < totalGlyphs; i++) {
                const currentGlyph = allGlyphObjects[i];
                if (currentGlyph && currentGlyph.numberOfContours === -1) { // -1 typically indicates a composite glyph.
                    currentGlyph.resolve(allGlyphObjects); // Assumes Glyph.resolve exists.
                }
            }
            glyphData.glyphs = allGlyphObjects;
            fontObject.glyf = Object.freeze(glyphData);
        },

        // Parses the 'hmtx' table (Horizontal Metrics Table).
        processHMTX: function(fontObject) {
            const hmtxTableRecord = findTableByTag(fontObject, 'hmtx');
            if (!hmtxTableRecord) { throw new Error("Missing 'hmtx' table in font data."); }

            const reader = fontObject.stream;
            reader.jumpToOffset(hmtxTableRecord.byteOffset);

            const horizontalMetricsData = {};

            const numLongMetrics = fontObject.hhea.numLongHMetrics;
            const totalGlyphCount = fontObject.maxp.glyphCount;

            const longHorizontalMetrics = new Array(numLongMetrics);
            let i;

            // Read the fixed-width records.
            for (i = 0; i < numLongMetrics; i++) {
                const metricEntry = {};
                metricEntry.advanceWidth = reader.getUnsignedWord();
                metricEntry.leftSideBearing = reader.getSignedWord();
                longHorizontalMetrics[i] = metricEntry;
            }

            // For glyphs beyond numLongMetrics, they share the advanceWidth of the last long metric.
            const sharedAdvanceWidth = longHorizontalMetrics[numLongMetrics - 1].advanceWidth;
            const remainingMetrics = new Array(totalGlyphCount - numLongMetrics);

            for (let j = 0; j < (totalGlyphCount - numLongMetrics); j++) {
                const metricEntry = {};
                metricEntry.advanceWidth = sharedAdvanceWidth;
                metricEntry.leftSideBearing = reader.getSignedWord();
                remainingMetrics[j] = metricEntry;
            }

            horizontalMetricsData.metrics = [...longHorizontalMetrics, ...remainingMetrics];
            fontObject.hmtx = Object.freeze(horizontalMetricsData);
        },

        // Parses the 'kern' table (Kerning Table).
        processKERN: function(fontObject) {
            const kernTableRecord = findTableByTag(fontObject, 'kern');
            if (!kernTableRecord) {
                console.info("Optional 'kern' table not found. Kerning will not be applied.");
                fontObject.kern = Object.freeze({}); // Ensure 'kern' property exists, even if empty.
                return;
            }

            const reader = fontObject.stream;
            reader.jumpToOffset(kernTableRecord.byteOffset);

            const kerningData = {};

            const majorVersion = reader.getUnsignedWord();
            const minorVersion = reader.getUnsignedWord();

            if (majorVersion === 1 && minorVersion === 0) {
                kerningData.version = 1.0;
                kerningData.numberOfSubtables = reader.getUnsignedLong();
                // The original code stops here. A full implementation would parse the subtables.
                // For a Type III clone, we can leave it partially implemented or add a placeholder.
                console.warn("Kerning table version 1.0 found, but subtable parsing is not fully implemented.");
                kerningData.subtables = []; // Placeholder.
            } else {
                // For version 0.x (older format).
                kerningData.version = 0.0;
                const numKerningTables = majorVersion; // In version 0, majorVersion is numTables.
                kerningData.numberOfSubtables = numKerningTables;
                console.warn(`Kerning table version 0.x found (numTables=${numKerningTables}), parsing not implemented.`);
                kerningData.subtables = []; // Placeholder.
                // The original code did not parse version 0, so we maintain that.
            }

            fontObject.kern = Object.freeze(kerningData);
        }
    };

    // --- Expose necessary classes/functions to the global scope ---
    // (Assuming window or a similar global object for 'KeySet' and potentially 'Glyph')
    globalContext.SVGFontComposer = SVGFontComposer;
    // Assuming 'Glyph' is also exposed or available in the global scope for the glyf parser.
    // If Glyph is not defined, the glyf parser will fail. For this clone, we assume it's external.
    // globalContext.Glyph = Glyph; // If Glyph was part of this file.

})(window, window.jQuery, undefined); // Using 'window' directly, 'jQuery' and 'undefined' are not directly used in the provided code.