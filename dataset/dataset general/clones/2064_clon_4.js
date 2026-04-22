((globalScope, extLib) => {
    "use strict";

    // Replacement for the externally defined Glyph class, providing a minimal interface
    // as implied by its usage in the original code's glyf table parsing and rendering logic.
    class Shape {
        constructor(sectionOffset, dataAccessorInstance) {
            this.sectionOffset = sectionOffset;
            this.dataAccessorInstance = dataAccessorInstance;
            this.numberOfContours = -1; // Mimics initial state in original Glyph
            this.boundingBox = { x1: 0, y1: 0, x2: 0, y2: 0 }; // Placeholder
            this._segmentedPoints = { xcoords: [], ycoords: [], flags: [] }; // Placeholder for actual glyph path data
            this._contourCount = 0; // Placeholder for actual contour count
            // In a complete implementation, this constructor would parse raw glyph data from dataAccessorInstance
        }
        resolve(allShapes) {
            // Mimics the original Glyph.resolve method, likely for composite glyphs.
            // As the internal logic isn't provided, this is a no-op placeholder.
            // console.log(`NOTICE: Shape.resolve invoked for glyph at offset ${this.sectionOffset}`);
        }
        getSegmentedPoints() { return this._segmentedPoints; } // Mock method for rendering
        getContourCount() { return this._contourCount; } // Mock method for rendering
    }

    // Replacement for _StreamReader, implemented as a stateless utility object
    const BinaryDataHandler = {
        readInt8: (dataView, currentOffset) => ({ value: dataView.getInt8(currentOffset), nextOffset: currentOffset + 1 }),
        readUint8: (dataView, currentOffset) => ({ value: dataView.getUint8(currentOffset), nextOffset: currentOffset + 1 }),
        readInt16: (dataView, currentOffset) => ({ value: dataView.getInt16(currentOffset), nextOffset: currentOffset + 2 }),
        readUint16: (dataView, currentOffset) => ({ value: dataView.getUint16(currentOffset), nextOffset: currentOffset + 2 }),
        readInt32: (dataView, currentOffset) => ({ value: dataView.getInt32(currentOffset), nextOffset: currentOffset + 4 }),
        readUint32: (dataView, currentOffset) => ({ value: dataView.getUint32(currentOffset), nextOffset: currentOffset + 4 }),
        readFloat32: (dataView, currentOffset) => ({ value: dataView.getFloat32(currentOffset), nextOffset: currentOffset + 4 }),
        readInt64: (dataView, currentOffset) => { // Mimics original's "bollocks" implementation for 64-bit
            const { value: highPart, nextOffset: off1 } = BinaryDataHandler.readInt32(dataView, currentOffset);
            const { value: lowPart, nextOffset: off2 } = BinaryDataHandler.readInt32(dataView, off1);
            return { value: (highPart * (2**32)) + lowPart, nextOffset: off2 }; // Corrected for JS numbers, but still limited precision
        },

        extractString: (dataView, startOffset, length) => {
            let textOutput = '';
            for (let k = 0; k < length; k++) {
                textOutput += String.fromCharCode(dataView.getInt8(startOffset + k));
            }
            return textOutput;
        },
        acquireString: (dataView, currentOffset, count) => {
            const textOutput = BinaryDataHandler.extractString(dataView, currentOffset, count);
            return { value: textOutput, nextOffset: currentOffset + count };
        },

        obtainFixed32: (dataView, currentOffset) => {
            const { value: integerComponent, nextOffset: off1 } = BinaryDataHandler.readInt16(dataView, currentOffset);
            const { value: fractionalComponent, nextOffset: off2 } = BinaryDataHandler.readInt16(dataView, off1);
            return { value: integerComponent + (fractionalComponent / 65536), nextOffset: off2 };
        },

        acquireUint8Array: (dataView, currentOffset, len) => {
            const arrayResult = [];
            let nextPointer = currentOffset;
            for (let i = 0; i < len; i++) {
                const { value, nextOffset: newPointer } = BinaryDataHandler.readUint8(dataView, nextPointer);
                arrayResult.push(value);
                nextPointer = newPointer;
            }
            return { value: arrayResult, nextOffset: nextPointer };
        },
        acquireUint16Array: (dataView, currentOffset, len) => {
            const arrayResult = [];
            let nextPointer = currentOffset;
            for (let i = 0; i < len; i++) {
                const { value, nextOffset: newPointer } = BinaryDataHandler.readUint16(dataView, nextPointer);
                arrayResult.push(value);
                nextPointer = newPointer;
            }
            return { value: arrayResult, nextOffset: nextPointer };
        }
    };

    // Replacement for getGlyphAsSVGPath, using a more functional style
    const produceGlyphVectorData = (graphicUnit) => {
        const geometryInformation = graphicUnit.getSegmentedPoints();
        const xCoordinates = geometryInformation.xcoords;
        const yCoordinates = geometryInformation.ycoords;
        const controlFlags = geometryInformation.flags;

        const pathCommands = Array.from({ length: graphicUnit.getContourCount() }, (_, contourIdx) => {
            const currentContourFlags = controlFlags[contourIdx];
            const currentContourX = xCoordinates[contourIdx];
            const currentContourY = yCoordinates[contourIdx];

            const contourSegments = [];
            let pointIdx = 0;
            while (pointIdx < currentContourFlags.length) {
                const currentX = currentContourX[pointIdx];
                const currentY = currentContourY[pointIdx];

                if (pointIdx === 0) {
                    contourSegments.push(`M${currentX},${currentY}`);
                } else if (currentContourFlags[pointIdx] & 0x01) { // On-curve point (line segment)
                    contourSegments.push(`L${currentX},${currentY}`);
                } else { // Off-curve point (Bezier segment)
                    const nextPointIdx = pointIdx + 1;
                    const nextX = currentContourX[nextPointIdx];
                    const nextY = currentContourY[nextPointIdx];

                    if ((currentContourFlags[nextPointIdx] & 0x01) || (nextPointIdx === currentContourFlags.length - 1)) {
                        contourSegments.push(`Q${currentX},${currentY} ${nextX},${nextY}`);
                        pointIdx++; // Consume the next point
                    } else if (nextPointIdx < currentContourFlags.length - 1) { // Cubic Bezier
                        const nextNextPointIdx = pointIdx + 2;
                        const nextNextX = currentContourX[nextNextPointIdx];
                        const nextNextY = currentContourY[nextNextPointIdx];
                        console.log('NOTICE: Handling higher-order Bezier (Cubic)');
                        contourSegments.push(`C${currentX},${currentY} ${nextX},${nextY} ${nextNextX},${nextNextY}`);
                        pointIdx += 2; // Consume the next two points
                    }
                }
                pointIdx++;
            }
            return contourSegments.join(' ');
        }).join(' ');

        return `<path d="${pathCommands}"/>`;
    };

    // Replacement for KeySet, using class syntax
    class GlyphAssembler {
        constructor(renderingMechanism, typeGeometryData) {
            if (renderingMechanism !== 'vector_graphic') {
                throw 'Unsupported output visualization mechanism';
            }
            this.typeGeometryData = typeGeometryData; // Renamed 'font' to 'typeGeometryData'
        }

        composeVectorGraphic(phraseInput, visualHeight) { // Renamed 'render' to 'composeVectorGraphic'
            const shapeIndices = this.typeGeometryData.getTextAsGlyphIds(phraseInput); // Renamed 'glyphIds'
            let currentHorizontalPosition = 0; // Renamed 'xOffset'
            const graphicElements = []; // Renamed 'output'

            shapeIndices.forEach((currentShapeIndex, index) => {
                const horizontalMetrics = this.typeGeometryData.getHmtxForChar(currentShapeIndex); // Renamed 'hmtx'
                const kerningValue = this.typeGeometryData.getKernForPair(shapeIndices[index - 1], currentShapeIndex); // Renamed 'kern'
                const currentGlyphShape = this.typeGeometryData.glyf.shapes[currentShapeIndex]; // Renamed 'glyph' and 'glyf.glyphs' to 'glyf.shapes'
                let wrappedShape = ''; // Renamed 'wrapped'

                try {
                    if (currentGlyphShape) {
                        const vectorPath = produceGlyphVectorData(currentGlyphShape); // Renamed 'path'
                        wrappedShape = `<g transform="translate(${currentHorizontalPosition + Math.max(horizontalMetrics.leftSideBearing, 0) + kerningValue}, 0)">\n${vectorPath}\n</g>`;
                    }
                } catch (errorDetails) {
                    console.log(`display error for character "${phraseInput[index]}": ${errorDetails}`);
                }
                graphicElements.push(wrappedShape);
                currentHorizontalPosition += (horizontalMetrics.advanceWidth + kerningValue);
            });

            graphicElements.push(`\n<line x1="0" y1="0" x2="${currentHorizontalPosition}" y2="0" style="stroke-width: 10; stroke: red;"/>`);

            const totalAscender = this.typeGeometryData.hhea.typeAscender; // Renamed 'ascender'
            const totalDescender = this.typeGeometryData.hhea.typeDescender; // Renamed 'descender'
            const effectiveHeight = totalAscender - totalDescender; // Renamed 'actualHeight'

            const combinedGlyphGroup = `<g transform="translate(0,${totalAscender}) scale(1,-1)">\n${graphicElements.join('')}\n</g>`; // Renamed 'wholeWord'

            const finalSvgOutput = `<svg height="${visualHeight}px" viewBox="0 ${totalDescender} ${currentHorizontalPosition} ${effectiveHeight - totalDescender}" xmlns="http://www.w3.org/2000/svg" version="1.1">\n${combinedGlyphGroup}\n</svg>`; // Renamed 'svg'
            return finalSvgOutput;
        }
    }

    // Replacements for global constants
    const labelRegistry = [
        'CopyrightInformation', 'TypeFamily', 'TypeSubfamily', 'SubfamilyIdentifier', 'CompleteName', 'Revision',
        'PostscriptName', 'TrademarkNotice', 'ManufacturerName', 'Creator', 'Summary', 'VendorWebAddress',
        'CreatorWebAddress', 'LicenseAgreement'
    ];
    const platformIdentifierSet = ['Unicode', 'Macintosh', undefined, 'Microsoft'];
    const macEncodingIdentifierSet = [
        'Roman', 'Japansese', 'Traditional Chinese', 'Korean', 'Arabic', 'Hebrew', 'Greek', 'Russian', 'RSymbol',
        'Devanagari', 'Gurmukhi', 'Gujarati', 'Oriya', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
        'Sinhalese', 'Burmese', 'Khmer', 'Thai', 'Laotian', 'Georgian', 'Armenian', 'Simplified Chinese', 'Tibetan',
        'Mongolian', 'Geez', 'Slavic', 'Vietnamese', 'Sindhi'
    ];
    const unicodeEncodingIdentifierSet = [
        'DefaultSemantics', 'Version1_1Semantics', 'ISO10646_1993Semantics_Deprecated',
        'Unicode2_0OrLaterSemantics'
    ];
    const macintoshRomanGlyphNames = [
        '.notdef','.null','nonmarkingreturn','space','exclam','quotedbl','numbersign','dollar','percent','ampersand',
        'quotesingle','parenleft','parenright','asterisk','plus','comma','hyphen','period','slash','zero','one','two',
        'three','four','five','six','seven','eight','nine','colon','semicolon','less','equal','greater','question','at',
        'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','bracketleft',
        'backslash','bracketright','asciicircum','underscore','grave','a','b','c','d','e','f','g','h','i','j','k','l','m','n',
        'o','p','q','r','s','t','u','v','w','x','y','z','braceleft','bar','braceright','asciitilde','Adieresis','Aring',
        'Ccedilla','Eacute','Ntilde','Odieresis','Udieresis','aacute','agrave','acircumflex','adieresis','atilde','aring',
        'ccedilla','eacute','egrave','ecircumflex','edieresis','iacute','igrave','icircumflex','idieresis','ntilde','oacute',
        'ograve','ocircumflex','odieresis','otilde','uacute','ugrave','ucircumflex','udieresis','dagger','degree','cent',
        'sterling','section','bullet','paragraph','germandbls','registered','copyright','trademark','acute','dieresis',
        'notequal','AE','Oslash','infinity','plusminus','lessequal','greaterequal','yen','mu','partialdiff','summation',
        'product','pi','integral','ordfeminine','ordmasculine','Omega','ae','oslash','questiondown','exclamdown','logicalnot',
        'radical','florin','approxequal','Delta','guillemotleft','guillemotright','ellipsis','nonbreakingspace','Agrave','Atilde',
        'Otilde','OE','oe','endash','emdash','quotedblleft','quotedblright','quoteleft','quoteright','divide','lozenge','ydieresis',
        'Ydieresis','fraction','currency','guilsinglleft','guilsinglright','fi','fl','daggerdbl','periodcentered','quotesinglbase',
        'quotedblbase','perthousand','Acircumflex','Ecircumflex','Aacute','Edieresis','Egrave','Iacute','Icircumflex','Idieresis',
        'Igrave','Oacute','Ocircumflex','apple','Ograve','Uacute','Ucircumflex','Ugrave','dotlessi','circumflex','tilde','macron',
        'breve','dotaccent','ring','cedilla','hungarumlaut','ogonek','caron','Lslash','lslash','Scaron','scaron','Zcaron','zcaron',
        'brokenbar','Eth','eth','Yacute','yacute','Thorn','thorn','minus','multiply','onesuperior','twosuperior','threesuperior',
        'onehalf','onequarter','threequarters','franc','Gbreve','gbreve','Idotaccent','Scedilla','scedilla','Cacute','cacute',
        'Ccaron','ccaron','dcroat'
    ];

    // Replacement for getTableByTag
    function retrieveTableByTag(fontStructure, identifier) {
        const foundSection = fontStructure.sections.find(sect => sect.tag === identifier);
        return foundSection || undefined;
    }

    // Replacement for readTableDirectory
    function extractTableDescriptor(accessorState) {
        let currentOffset = accessorState.currentOffset;
        const dataView = accessorState.dataView;
        let operationResult;
        const descriptorDetails = {};

        operationResult = BinaryDataHandler.acquireString(dataView, currentOffset, 4);
        descriptorDetails.tag = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
        descriptorDetails.checksum = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
        descriptorDetails.startPosition = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
        descriptorDetails.byteLength = operationResult.value; currentOffset = operationResult.nextOffset;

        return { descriptor: descriptorDetails, newOffset: currentOffset };
    }

    // Replacement for initializers, using a Map for handlers
    const SectionHandlers = new Map();

    SectionHandlers.set('head', (fontData, dataView, tableStart) => {
        let currentOffset = tableStart;
        let operationResult;
        const headerInfo = {};

        operationResult = BinaryDataHandler.obtainFixed32(dataView, currentOffset);
        headerInfo.versionIdentifier = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.obtainFixed32(dataView, currentOffset);
        headerInfo.revisionNumber = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
        headerInfo.checksumAdjustment = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
        headerInfo.magicIdentifier = operationResult.value; currentOffset = operationResult.nextOffset;
        if (headerInfo.magicIdentifier !== 0x5F0F3CF5) {
            throw "Font header contains invalid magic number";
        }

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        headerInfo.attributeFlags = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        headerInfo.unitsPerEmValue = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt64(dataView, currentOffset);
        headerInfo.creationTimestamp = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt64(dataView, currentOffset);
        headerInfo.modificationTimestamp = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        headerInfo.minimumX = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        headerInfo.minimumY = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        headerInfo.maximumX = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        headerInfo.maximumY = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        headerInfo.macintoshStyle = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        headerInfo.lowestRecommendedPPEM = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        headerInfo.fontDirectionHintValue = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        headerInfo.indexToLocationFormat = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        headerInfo.glyphDataLayoutFormat = operationResult.value; currentOffset = operationResult.nextOffset;

        fontData.head = Object.freeze(headerInfo);
    });

    SectionHandlers.set('name', (fontData, dataView, tableStart) => {
        let currentOffset = tableStart;
        let operationResult;
        const namingTable = { entries: [] };

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        namingTable.versionIdentifier = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        const entryCount = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        const stringDataOffset = operationResult.value; currentOffset = operationResult.nextOffset;

        for (let i = 0; i < entryCount; i++) {
            const recordEntry = {};
            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            recordEntry.platformIDentity = operationResult.value; currentOffset = operationResult.nextOffset;

            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            recordEntry.platformSpecificIdentifier = operationResult.value; currentOffset = operationResult.nextOffset;

            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            recordEntry.locale = operationResult.value; currentOffset = operationResult.nextOffset;

            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            recordEntry.identifierCode = operationResult.value; currentOffset = operationResult.nextOffset;

            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            const textLength = operationResult.value; currentOffset = operationResult.nextOffset;

            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            const textRelativeOffset = operationResult.value; currentOffset = operationResult.nextOffset;

            recordEntry.content = BinaryDataHandler.extractString(dataView, tableStart + stringDataOffset + textRelativeOffset, textLength);
            namingTable.entries.push(recordEntry);
        }
        fontData.name = namingTable;
    });

    SectionHandlers.set('hhea', (fontData, dataView, tableStart) => {
        let currentOffset = tableStart;
        let operationResult;
        const horizontalHeader = {};

        operationResult = BinaryDataHandler.obtainFixed32(dataView, currentOffset);
        horizontalHeader.versionInformation = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        horizontalHeader.typeAscender = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        horizontalHeader.typeDescender = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        horizontalHeader.lineSpacing = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        horizontalHeader.maximumAdvanceWidth = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        horizontalHeader.minimumLeftSideBearing = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        horizontalHeader.minimumRightSideBearing = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        horizontalHeader.xMaxExtentValue = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        horizontalHeader.caretSlopeRiseValue = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        horizontalHeader.caretSlopeRunValue = operationResult.value; currentOffset = operationResult.nextOffset;

        for (let i = 0; i < 5; i++) { // Skip reserved fields
            currentOffset = BinaryDataHandler.readInt16(dataView, currentOffset).nextOffset;
        }

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        horizontalHeader.metricDataLayoutFormat = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        horizontalHeader.metricCount = operationResult.value; currentOffset = operationResult.nextOffset;

        fontData.hhea = Object.freeze(horizontalHeader);
    });

    SectionHandlers.set('maxp', (fontData, dataView, tableStart) => {
        let currentOffset = tableStart;
        let operationResult;
        const maximumProfile = {};

        operationResult = BinaryDataHandler.obtainFixed32(dataView, currentOffset);
        maximumProfile.versionNumber = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.glyphQuantity = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumPoints = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumContours = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumComponentPoints = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumComponentContours = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumZones = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumTwilightPoints = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumStorage = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumFunctionDefinitions = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumInstructionDefinitions = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumStackElements = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumInstructionByteSize = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumComponentElements = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        maximumProfile.maximumComponentDepth = operationResult.value; currentOffset = operationResult.nextOffset;

        fontData.maxp = Object.freeze(maximumProfile);
    });

    SectionHandlers.set('post', (fontData, dataView, tableStart) => {
        let currentOffset = tableStart;
        let operationResult;
        const postscriptTable = {};

        operationResult = BinaryDataHandler.obtainFixed32(dataView, currentOffset);
        postscriptTable.formatVersion = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.obtainFixed32(dataView, currentOffset);
        postscriptTable.italicAngleValue = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        postscriptTable.underlinePositionValue = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
        postscriptTable.underlineThicknessValue = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
        postscriptTable.isFixedPitchValue = operationResult.value; currentOffset = operationResult.nextOffset;

        for (let i = 0; i < 4; i++) { // Skip min/max memory values
            currentOffset = BinaryDataHandler.readUint32(dataView, currentOffset).nextOffset;
        }

        const glyphNameMap = [];
        if (postscriptTable.formatVersion === 1.0) {
            for (let i = 0; i < 258; i++) {
                glyphNameMap[i] = macintoshRomanGlyphNames[i];
            }
        } else if (postscriptTable.formatVersion === 2.0) {
            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            const numberOfGlyphs = operationResult.value; currentOffset = operationResult.nextOffset;

            const glyphIndexReferences = new Array(numberOfGlyphs);
            let maximumIndexEncountered = Number.MIN_VALUE;

            for (let i = 0; i < numberOfGlyphs; i++) {
                operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
                const index = operationResult.value; currentOffset = operationResult.nextOffset;
                glyphIndexReferences[i] = index;
                maximumIndexEncountered = Math.max(maximumIndexEncountered, index);
            }

            const customNameArray = [];
            if (maximumIndexEncountered >= 258) {
                for (let i = 0; i < maximumIndexEncountered - 258 + 1; i++) {
                    operationResult = BinaryDataHandler.readUint8(dataView, currentOffset);
                    const stringLength = operationResult.value; currentOffset = operationResult.nextOffset;

                    operationResult = BinaryDataHandler.acquireString(dataView, currentOffset, stringLength);
                    customNameArray[i] = operationResult.value; currentOffset = operationResult.nextOffset;
                }
            }

            for (let i = 0; i < numberOfGlyphs; i++) {
                const indexValue = glyphIndexReferences[i];
                if (indexValue < 258) {
                    glyphNameMap[i] = macintoshRomanGlyphNames[indexValue];
                } else if (indexValue >= 258 && indexValue <= 32767) {
                    glyphNameMap[i] = customNameArray[indexValue - 258];
                } else {
                    throw `Unknown glyph name identifier: ${indexValue}`;
                }
            }
        }
        postscriptTable.glyphNameMap = glyphNameMap;
        fontData.post = Object.freeze(postscriptTable);
    });

    SectionHandlers.set('loca', (fontData, dataView, tableStart) => {
        let currentOffset = tableStart;
        let operationResult;
        const locationTable = {};

        const locationFormatType = fontData.head.indexToLocationFormat;
        const totalGlyphs = fontData.maxp.glyphQuantity;

        locationTable.offsetArray = new Array(totalGlyphs + 1);
        for (let i = 0; i < totalGlyphs + 1; i++) {
            if (locationFormatType === 0) {
                operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
                locationTable.offsetArray[i] = operationResult.value * 2; currentOffset = operationResult.nextOffset;
            } else if (locationFormatType === 1) {
                operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
                locationTable.offsetArray[i] = operationResult.value; currentOffset = operationResult.nextOffset;
            } else {
                throw "Font contains invalid glyph index-to-location format";
            }
        }
        fontData.loca = Object.freeze(locationTable);
    });

    SectionHandlers.set('cmap', (fontData, dataView, tableStart) => {
        let currentOffset = tableStart;
        let operationResult;
        const characterMapTable = {};

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        characterMapTable.versionIdentifier = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        const mapCount = operationResult.value; currentOffset = operationResult.nextOffset;

        const subMaps = new Array(mapCount);
        for (let i = 0; i < mapCount; i++) {
            const currentSubMap = {};
            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            currentSubMap.platformIDentity = operationResult.value; currentOffset = operationResult.nextOffset;

            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            currentSubMap.platformSpecificIdentifier = operationResult.value; currentOffset = operationResult.nextOffset;

            operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
            currentSubMap.relativeOffset = operationResult.value; currentOffset = operationResult.nextOffset;
            subMaps[i] = currentSubMap;
        }

        for (let i = 0; i < mapCount; i++) {
            const currentSubMap = subMaps[i];
            currentOffset = tableStart + currentSubMap.relativeOffset;

            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            currentSubMap.formatType = operationResult.value; currentOffset = operationResult.nextOffset;

            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            currentSubMap.byteLength = operationResult.value; currentOffset = operationResult.nextOffset;

            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            currentSubMap.localeIdentifier = operationResult.value; currentOffset = operationResult.nextOffset;

            currentSubMap.glyphMappingArray = new Array(256); // For format 0, 256 entries

            switch(currentSubMap.formatType) {
                case 0:
                    for(let j = 0; j < 256; j++) {
                        operationResult = BinaryDataHandler.readUint8(dataView, currentOffset);
                        currentSubMap.glyphMappingArray[j] = operationResult.value; currentOffset = operationResult.nextOffset;
                    }
                    break;
                case 4:
                    const totalGlyphs = fontData.maxp.glyphQuantity;

                    operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
                    const segmentCountX2 = operationResult.value; currentOffset = operationResult.nextOffset;
                    const segmentCount = segmentCountX2 / 2;

                    // Skip searchRange, entrySelector, rangeShift
                    for (let j = 0; j < 3; j++) {
                        currentOffset = BinaryDataHandler.readUint16(dataView, currentOffset).nextOffset;
                    }

                    operationResult = BinaryDataHandler.acquireUint16Array(dataView, currentOffset, segmentCount);
                    const endCodeArray = operationResult.value; currentOffset = operationResult.nextOffset;

                    currentOffset = BinaryDataHandler.readUint16(dataView, currentOffset).nextOffset; // Skip reservedPad

                    operationResult = BinaryDataHandler.acquireUint16Array(dataView, currentOffset, segmentCount);
                    const startCodeArray = operationResult.value; currentOffset = operationResult.nextOffset;

                    operationResult = BinaryDataHandler.acquireUint16Array(dataView, currentOffset, segmentCount);
                    const idDeltaArray = operationResult.value; currentOffset = operationResult.nextOffset;

                    operationResult = BinaryDataHandler.acquireUint16Array(dataView, currentOffset, segmentCount);
                    const idRangeOffsetArray = operationResult.value; currentOffset = operationResult.nextOffset;

                    const characterToGlyphMap = new Array(totalGlyphs).fill(0); // Initialize with 0 for .notdef
                    const currentDataOffset = currentOffset;

                    for (let j = 0; j < segmentCount; j++) {
                        const startChar = startCodeArray[j];
                        const endChar = endCodeArray[j];
                        const deltaValue = idDeltaArray[j];
                        const rangeOffsetValue = idRangeOffsetArray[j];

                        if (startChar !== 0xFFFF && endChar !== 0xFFFF) {
                            for (let k = startChar; k < endChar; k++) {
                                if (rangeOffsetValue === 0) {
                                    const mappedGlyphIndex = (k + deltaValue) % 65536;
                                    characterToGlyphMap[mappedGlyphIndex] = k;
                                    currentSubMap.glyphMappingArray[k] = mappedGlyphIndex;
                                } else {
                                    const glyphOffsetPosition = currentDataOffset + ((rangeOffsetValue / 2) + (k - startChar) + (j - segmentCount)) * 2;
                                    const { value: glyphIndexRef } = BinaryDataHandler.readUint16(dataView, glyphOffsetPosition);

                                    if (glyphIndexRef !== 0) {
                                        let finalGlyphIndex = glyphIndexRef + deltaValue;
                                        finalGlyphIndex %= 65536;
                                        if (characterToGlyphMap[finalGlyphIndex] === 0) {
                                            characterToGlyphMap[finalGlyphIndex] = k;
                                            currentSubMap.glyphMappingArray[k] = finalGlyphIndex;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    currentSubMap.characterToGlyphMap = characterToGlyphMap;
                    break;
            }
        }
        characterMapTable.subMaps = subMaps;
        fontData.cmap = Object.freeze(characterMapTable);
    });

    SectionHandlers.set('glyf', (fontData, dataView, tableStart) => {
        const tableDescription = retrieveTableByTag(fontData, 'glyf');
        const tableOffset = tableDescription.startPosition;
        const dataAccessorInstance = dataView;

        const maxProfile = fontData.maxp;
        const locationInfo = fontData.loca;
        const postscriptInfo = fontData.post;

        const offsetsArray = locationInfo.offsetArray;
        const totalGlyphs = maxProfile.glyphQuantity;
        const glyphNameRegistry = postscriptInfo.glyphNameMap;

        const glyphShapeCollection = new Array(totalGlyphs);
        for (let i = 0; i < totalGlyphs - 1; i++) {
            if (offsetsArray[i] === offsetsArray[i + 1]) {
                continue;
            }
            const currentShape = new Shape(tableOffset + offsetsArray[i], dataAccessorInstance);
            glyphShapeCollection[i] = currentShape;
        }
        for (let i = 0; i < totalGlyphs - 1; i++) {
            if (glyphShapeCollection[i] && glyphShapeCollection[i].numberOfContours === -1) {
                glyphShapeCollection[i].resolve(glyphShapeCollection);
            }
        }
        fontData.glyf = Object.freeze({ shapes: glyphShapeCollection });
    });

    SectionHandlers.set('hmtx', (fontData, dataView, tableStart) => {
        let currentOffset = tableStart;
        let operationResult;
        const horizontalMetricsTable = {};

        const longMetricCount = fontData.hhea.metricCount;
        horizontalMetricsTable.longMetrics = new Array(fontData.maxp.glyphQuantity); // Allocate for all glyphs

        let lastAdvanceWidth = 0;
        for (let i = 0; i < longMetricCount; i++) {
            const metricEntry = {};
            operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
            metricEntry.advanceWidth = operationResult.value; currentOffset = operationResult.nextOffset;
            operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
            metricEntry.leftSideBearing = operationResult.value; currentOffset = operationResult.nextOffset;
            horizontalMetricsTable.longMetrics[i] = metricEntry;
            lastAdvanceWidth = metricEntry.advanceWidth;
        }

        // Fill in metrics for glyphs beyond longMetricCount, using the last advanceWidth
        for (let i = longMetricCount; i < fontData.maxp.glyphQuantity; i++) {
            const metricEntry = {};
            metricEntry.advanceWidth = lastAdvanceWidth;
            operationResult = BinaryDataHandler.readInt16(dataView, currentOffset);
            metricEntry.leftSideBearing = operationResult.value; currentOffset = operationResult.nextOffset;
            horizontalMetricsTable.longMetrics[i] = metricEntry;
        }
        fontData.hmtx = Object.freeze(horizontalMetricsTable);
    });

    SectionHandlers.set('kern', (fontData, dataView, tableStart) => {
        const tableDescription = retrieveTableByTag(fontData, 'kern');
        if (!tableDescription) { return; }
        let currentOffset = tableStart;
        let operationResult;
        const kerningData = {};

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        const headerWord1 = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        const headerWord2 = operationResult.value; currentOffset = operationResult.nextOffset;

        if (headerWord1 === 1 && headerWord2 === 0) {
            kerningData.versionNumber = 1.0;
            operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
            kerningData.numberOfTables = operationResult.value; currentOffset = operationResult.nextOffset;
        } else {
            // Mimics original's behavior of not fully parsing other kern table formats
        }
        fontData.kern = Object.freeze(kerningData);
    });

    // Main font parsing orchestration function (replacement for the implicit parsing in the original IIFE)
    function parseFontStructure(bufferInput) {
        const dataView = new DataView(bufferInput, 0);
        let currentOffset = 0;
        let operationResult;

        const fontDescriptor = {};

        // Read SFNT header
        operationResult = BinaryDataHandler.readUint32(dataView, currentOffset);
        fontDescriptor.sfntVersion = operationResult.value; currentOffset = operationResult.nextOffset;

        operationResult = BinaryDataHandler.readUint16(dataView, currentOffset);
        fontDescriptor.tableCount = operationResult.value; currentOffset = operationResult.nextOffset;

        for(let i=0; i<3; i++) { // Skip searchRange, entrySelector, rangeShift
            currentOffset = BinaryDataHandler.readUint16(dataView, currentOffset).nextOffset;
        }

        fontDescriptor.sections = [];
        for (let i = 0; i < fontDescriptor.tableCount; i++) {
            const { descriptor, newOffset } = extractTableDescriptor({ dataView, currentOffset });
            fontDescriptor.sections.push(descriptor);
            currentOffset = newOffset;
        }

        fontDescriptor.sections.forEach(section => {
            const handler = SectionHandlers.get(section.tag);
            if (handler) {
                handler(fontDescriptor, dataView, section.startPosition);
            }
        });

        // Mock methods on the font object that are consumed by GlyphAssembler but not parsed by initializers
        fontDescriptor.getTextAsGlyphIds = (inputPhrase) => {
            const cmap = fontDescriptor.cmap;
            if (!cmap || !cmap.subMaps) return [];

            const unicodeCmap = cmap.subMaps.find(
                sm => sm.platformIDentity === 0 && sm.formatType === 4
            );
            if (unicodeCmap && unicodeCmap.glyphMappingArray) {
                return inputPhrase.split('').map(char => {
                    const charCode = char.charCodeAt(0);
                    return unicodeCmap.glyphMappingArray[charCode] || 0;
                });
            }

            const macRomanCmap = cmap.subMaps.find(
                sm => sm.platformIDentity === 1 && sm.platformSpecificIdentifier === 0 && sm.formatType === 0
            );
            if (macRomanCmap && macRomanCmap.glyphMappingArray) {
                return inputPhrase.split('').map(char => {
                    const charCode = char.charCodeAt(0);
                    return macRomanCmap.glyphMappingArray[charCode] || 0;
                });
            }
            return [];
        };

        fontDescriptor.getHmtxForChar = (glyphIndex) => {
            const hmtx = fontDescriptor.hmtx;
            if (!hmtx || !hmtx.longMetrics) {
                return { advanceWidth: 0, leftSideBearing: 0 };
            }
            return hmtx.longMetrics[glyphIndex] || { advanceWidth: 0, leftSideBearing: 0 };
        };

        fontDescriptor.getKernForPair = (leftGlyphIndex, rightGlyphIndex) => {
            // Mimics the original's kern table handler, which only parses the header, not actual kerning pairs.
            // Therefore, always returns 0.
            return 0;
        };

        return fontDescriptor;
    }

    // Expose the new rendering class and font parsing utility to the global scope
    globalScope.VectorTypeRenderer = GlyphAssembler;
    globalScope.FontParserUtility = parseFontStructure;

})(window, null);