const ContentProcessorModule = {
    // Factory function to create an instance of the content manager
    createContentManager: () => {
        let storageUnits = []; // Internal array: [{ initialIdentifier: number, finalIdentifier: number, contentPayload: string }]

        // Retrieves the total number of content units stored.
        const getUnitCount = () => storageUnits.length;

        // Accesses the text payload of a content unit by its zero-based position.
        const retrieveUnitPayload = (position) => {
            if (position < 0 || position >= storageUnits.length) {
                throw "Invalid unit position";
            }
            return storageUnits[position].contentPayload;
        };

        // Serializes the content units into a binary ArrayBuffer.
        const exportContentToBuffer = () => {
            const totalUnits = storageUnits.length;

            if (totalUnits > 0xFFFF) {
                throw "Excessive units";
            }

            const headerBytes = 10; // Fixed size for initial header block (version, index offset, reserved)
            // Absolute offset in the final buffer where the actual content data block begins
            const contentDataBlockStartAbsolute = headerBytes + 2 + (12 * totalUnits);

            const contentTextEncoder = new globalThis.TextEncoder();
            const contentUniqueMap = new globalThis.Map(); // Maps contentPayload string to { indexTableStoredOffset: number, byteLength: number, absoluteCopyOffset: number }
            const encodedUniqueChunks = []; // Stores actual Uint8Array chunks along with their absolute target offset

            let currentRelativeOffsetWithinContentBlock = 0; // Tracks offset relative to `contentDataBlockStartAbsolute`

            // First pass: Process unique content payloads to determine their encoded forms, sizes,
            // and their respective offsets for both storage in the index table and actual buffer copying.
            storageUnits.forEach(unit => {
                if (!contentUniqueMap.has(unit.contentPayload)) {
                    const encodedDatum = contentTextEncoder.encode(unit.contentPayload);
                    const datumByteLength = encodedDatum.byteLength;

                    // This is the absolute offset within the final buffer where this content chunk will be copied.
                    const absoluteCopyOffset = contentDataBlockStartAbsolute + currentRelativeOffsetWithinContentBlock;

                    // This is the offset value that gets stored in the index table entry.
                    // It's calculated as `(actual_absolute_offset_for_copy - headerBytes)` to match original behavior.
                    const indexTableStoredOffset = absoluteCopyOffset - headerBytes;

                    contentUniqueMap.set(unit.contentPayload, { indexTableStoredOffset, byteLength: datumByteLength, absoluteCopyOffset });
                    encodedUniqueChunks.push({ data: encodedDatum, targetAbsoluteOffset: absoluteCopyOffset, byteLength: datumByteLength });

                    currentRelativeOffsetWithinContentBlock += datumByteLength;
                }
            });

            // Final size check for total content data size
            if (currentRelativeOffsetWithinContentBlock > 0xFFFFFFFF) {
                throw "Bundle capacity exceeded";
            }

            const finalBufferTotalSize = contentDataBlockStartAbsolute + currentRelativeOffsetWithinContentBlock;

            const finalDataBuffer = new globalThis.ArrayBuffer(finalBufferTotalSize);
            const dataBufferView = new globalThis.DataView(finalDataBuffer);

            // Write initial header block
            dataBufferView.setUint16(0, 0); // Format version (0)
            dataBufferView.setUint32(2, headerBytes); // Offset to the index section
            dataBufferView.setUint32(6, 0); // Reserved field (0, for color palettes etc.)

            // Write index section header (total number of content units)
            dataBufferView.setUint16(headerBytes, totalUnits);

            // Write individual index section entries
            let currentWritePosition = headerBytes + 2; // Start after `numDocuments` in index section
            storageUnits.forEach(unit => {
                const { indexTableStoredOffset, byteLength } = contentUniqueMap.get(unit.contentPayload);

                dataBufferView.setUint16(currentWritePosition, unit.initialIdentifier);
                dataBufferView.setUint16(currentWritePosition + 2, unit.finalIdentifier);
                dataBufferView.setUint32(currentWritePosition + 4, indexTableStoredOffset); // Store the calculated adjusted offset
                dataBufferView.setUint32(currentWritePosition + 8, byteLength);

                currentWritePosition += 12; // Each entry is 12 bytes
            });

            // Copy all unique encoded content chunks into their designated positions in the buffer
            encodedUniqueChunks.forEach(chunk => {
                 (new globalThis.Uint8Array(finalDataBuffer, chunk.targetAbsoluteOffset, chunk.byteLength)).set(chunk.data);
            });

            return finalDataBuffer;
        };

        return {
            getUnitCount,
            retrieveUnitPayload,
            exportContentToBuffer
        };
    },

    // Static-like method: Constructs a content manager instance from an array of raw SVG document strings.
    buildFromSourceMaterials: (inputDocuments, configOptions) => {
        if (inputDocuments.length === 0) {
            throw "No input documents provided";
        }

        let idAssignments = []; // Temporarily stores: { identifier: number, sourceReference: string }

        const svgMarkupProcessor = new globalThis.DOMParser();

        inputDocuments.forEach(docString => {
            const parsedSvg = svgMarkupProcessor.parseFromString(docString, "image/svg+xml");
            const parsingErrors = parsedSvg.getElementsByTagName("parsererror");
            if (parsingErrors.length > 0) {
                throw "Markup parsing error: " + parsingErrors[0].textContent;
            }

            Array.from(parsedSvg.querySelectorAll("[id]")).forEach(elementWithId => {
                const idValue = elementWithId.getAttribute("id");
                const idPatternMatch = /^glyph([1-9][0-9]*)$/.exec(idValue);
                if (idPatternMatch) {
                    idAssignments.push({ identifier: globalThis.parseInt(idPatternMatch[1]), sourceReference: docString });
                }
            });
        });

        if (idAssignments.length === 0) {
            throw "No elements with specific ID pattern located";
        }

        // Sort assignments by identifier for sequential processing and grouping
        idAssignments.sort((a, b) => a.identifier - b.identifier);

        // Process sorted assignments into content units (runs of consecutive glyph IDs from the same source)
        const { finalUnits } = idAssignments.reduce((accumulator, currentEntry, index, fullList) => {
            const previousEntry = fullList[index - 1];

            // Handle duplicate identifiers based on configuration
            if (index > 0 && currentEntry.identifier === previousEntry.identifier) {
                if (configOptions && configOptions.skipRepeatedIdentifiers) {
                    return accumulator; // Skip this duplicate entry
                }
                throw "Duplicated identifier found for ID " + currentEntry.identifier;
            }

            const nextEntry = fullList[index + 1];
            const signifiesEndOfSequence = (
                index === fullList.length - 1 || // This is the last element
                nextEntry.identifier !== currentEntry.identifier + 1 || // Next ID is not consecutive
                nextEntry.sourceReference !== currentEntry.sourceReference // Next document is different
            );

            if (signifiesEndOfSequence) {
                // This `currentEntry` marks the end of a run; create a new content unit.
                accumulator.finalUnits.push({
                    initialIdentifier: fullList[accumulator.sequenceStartIndex].identifier,
                    finalIdentifier: currentEntry.identifier,
                    contentPayload: currentEntry.sourceReference
                });
                accumulator.sequenceStartIndex = index + 1; // Set start index for the next potential run
            }
            return accumulator;
        }, { finalUnits: [], sequenceStartIndex: 0 }); // Initial accumulator state

        const managerInstance = ContentProcessorModule.createContentManager();
        managerInstance.storageUnits = finalUnits; // Assign the processed units to the new manager instance
        return managerInstance;
    },

    // Static-like method: Reconstructs a content manager instance from a binary ArrayBuffer (provided as DataView).
    parseFromBinary: (inputBufferView) => {
        if (!(inputBufferView instanceof globalThis.DataView)) {
            throw "Input must be a DataView object";
        }

        if (inputBufferView.getUint16(0) !== 0) {
            throw "Unknown package format version";
        }
        if (inputBufferView.getUint32(6) !== 0) {
            throw "Color data unsupported"; // Reserved field must be 0
        }

        const indexSectionOffset = inputBufferView.getUint32(2); // Offset to the `numDocuments` field
        if (indexSectionOffset + 2 > inputBufferView.byteLength) {
            throw "Index section metadata out of bounds";
        }
        const entryCount = inputBufferView.getUint16(indexSectionOffset); // Read `numDocuments`
        if (indexSectionOffset + 2 + entryCount * 12 > inputBufferView.byteLength) {
            throw "Index section entries out of bounds";
        }
        if (entryCount === 0) {
            throw "Package must contain at least one content entry";
        }

        const managerInstance = ContentProcessorModule.createContentManager();
        const contentTextDecoder = new globalThis.TextDecoder();
        let currentScanPosition = indexSectionOffset + 2; // Start reading actual index entries
        let previousRangeEnd = -1; // Used for validating identifier sequence order

        // Reconstruct content units by mapping over the expected number of entries.
        // `currentScanPosition` and `previousRangeEnd` are managed in the outer scope for stateful iteration.
        managerInstance.storageUnits = Array.from({ length: entryCount }).map((_, entryOrdinal) => {
            const startId = inputBufferView.getUint16(currentScanPosition);
            const endId = inputBufferView.getUint16(currentScanPosition + 2);

            if (startId > endId) {
                throw "Identifier range inverted";
            }
            if (entryOrdinal > 0 && previousRangeEnd >= startId) {
                throw "Identifier range conflict with preceding entry";
            }
            previousRangeEnd = endId; // Update for the next iteration

            const payloadDataOffset = inputBufferView.getUint32(currentScanPosition + 4); // This is `indexTableStoredOffset` from serialization
            const payloadDataLength = inputBufferView.getUint32(currentScanPosition + 8);

            // The actual absolute offset in the buffer for the content data is `headerBytes + indexTableStoredOffset`.
            // `indexSectionOffset` is equivalent to `headerBytes`.
            const absoluteContentStart = indexSectionOffset + payloadDataOffset;

            if (absoluteContentStart + payloadDataLength > inputBufferView.byteLength) {
                throw "Payload data extends beyond package limits";
            }

            const payloadDataSegment = new globalThis.DataView(
                inputBufferView.buffer,
                inputBufferView.byteOffset + absoluteContentStart, // Use the correctly calculated absolute offset
                payloadDataLength
            );
            const decodedPayload = contentTextDecoder.decode(payloadDataSegment);

            currentScanPosition += 12; // Advance to the next index entry

            return {
                initialIdentifier: startId,
                finalIdentifier: endId,
                contentPayload: decodedPayload
            };
        });

        return managerInstance;
    }
};

// No export statement, as per prompt. The object `ContentProcessorModule` is globally available.