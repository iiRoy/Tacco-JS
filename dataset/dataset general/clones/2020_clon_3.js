/**
 * @fileoverview Manages and serializes vector graphic assets, primarily SVG glyphs.
 * This utility facilitates efficient storage and retrieval of SVG content
 * associated with a range of glyph identifiers.
 *
 * This code is proprietary and developed by ACME Corp. All rights reserved.
 */

class VectorAssetManager {
  /**
   * Constructs a new VectorAssetManager instance, initializing its internal
   * collection of vector asset records.
   * @constructor
   */
  constructor() {
    this.assetEntries = []; // Stores structured information about each vector asset.
  }

  /**
   * Retrieves the total number of distinct vector asset records currently
   * managed by this instance.
   * @returns {number} The count of stored asset entries.
   */
  getAssetCount() {
    const totalRecords = this.assetEntries.length;
    return totalRecords;
  }

  /**
   * Fetches the raw content string of a specific vector asset based on its
   * zero-based index within the internal collection.
   * @param {number} assetIdx - The index of the desired asset.
   * @returns {string} The textual content of the asset (e.g., SVG XML).
   * @throws {Error} If the provided index is out of bounds.
   */
  getAssetContentByIndex(assetIdx) {
    // Validate the input index to prevent accessing invalid memory locations.
    if (assetIdx < 0 || assetIdx >= this.assetEntries.length) {
      throw new Error(`Asset retrieval error: Index ${assetIdx} is out of the valid range [0, ${this.assetEntries.length - 1}].`);
    }
    // Access the asset entry and extract its content.
    const targetAsset = this.assetEntries[assetIdx];
    return targetAsset.contentString;
  }

  /**
   * Serializes the current collection of vector asset records into a binary
   * ArrayBuffer, optimized for storage and quick deserialization.
   * The format includes a header, an index of asset metadata, and the
   * concatenated encoded asset content. All multi-byte values are stored in
   * little-endian format.
   * @returns {ArrayBuffer} A binary representation of the asset manager's state.
   * @throws {Error} If the number of assets or total data size exceeds limits.
   */
  serializeToBuffer() {
    const vectorItemCount = this.assetEntries.length;
    const MAX_GLYPH_ASSETS = 0xFFFF; // Max 65535 entries for Uint16 count field
    const HEADER_LENGTH = 10; // Fixed size for initial buffer metadata (version, index offset, reserved)
    const ENTRY_STRUCT_SIZE = 12; // Bytes per asset entry in the index table (start/end glyph, content offset/length)
    const RESERVED_SPACE_BEFORE_PAYLOAD = 2; // Offset for first actual data block after the asset index

    if (vectorItemCount > MAX_GLYPH_ASSETS) {
      throw new Error(`Serialization error: Too many assets (${vectorItemCount}) for the defined format (max ${MAX_GLYPH_ASSETS}).`);
    }

    // Calculate initial offsets for the data segments.
    // The asset index starts at HEADER_LENGTH.
    // The actual asset content payload starts after the asset index.
    const assetIndexStartOffset = HEADER_LENGTH;
    let currentPayloadByteOffset = RESERVED_SPACE_BEFORE_PAYLOAD + ENTRY_STRUCT_SIZE * vectorItemCount;

    // Prepare for content encoding and deduplication.
    const encodedContentBlocks = []; // Stores actual encoded byte arrays or null for duplicates
    const contentOffsets = []; // Stores start byte offset for each asset's content relative to payload start
    const contentLengths = []; // Stores byte length for each asset's content
    const textEncoder = new TextEncoder(); // Standard Web API for UTF-8 encoding

    // Helper to track already encoded texts for deduplication
    const contentToOffsetMap = new Map(); // Map<string, {offset: number, length: number}>

    // First pass: Encode text content and calculate offsets/lengths, deduplicating where possible.
    for (let i = 0; i < vectorItemCount; ++i) {
      const currentAssetContent = this.assetEntries[i].contentString;

      // Check if this content has already been encoded and stored.
      if (contentToOffsetMap.has(currentAssetContent)) {
        const existingEntry = contentToOffsetMap.get(currentAssetContent);
        contentOffsets.push(existingEntry.offset);
        contentLengths.push(existingEntry.length);
        encodedContentBlocks.push(null); // Mark as duplicate, no need to store bytes again
      } else {
        // Encode new content and update offsets.
        const encodedBytes = textEncoder.encode(currentAssetContent);
        const byteLen = encodedBytes.byteLength;

        contentOffsets.push(currentPayloadByteOffset);
        contentLengths.push(byteLen);
        encodedContentBlocks.push(encodedBytes);

        // Store this new content's location for future deduplication.
        contentToOffsetMap.set(currentAssetContent, { offset: currentPayloadByteOffset, length: byteLen });

        currentPayloadByteOffset += byteLen; // Advance the payload offset
      }
    }

    // Total size of the buffer needed: Header + Asset Index + All Unique Asset Payloads.
    const totalBufferSize = assetIndexStartOffset + currentPayloadByteOffset;

    // Validate total buffer size to prevent overflow (e.g., if using 32-bit length fields)
    const MAX_BUFFER_SIZE = 0xFFFFFFFF; // ~4GB, maximum for Uint32
    if (totalBufferSize > MAX_BUFFER_SIZE) {
      throw new Error(`Serialization error: Total buffer size (${totalBufferSize} bytes) exceeds maximum allowed (${MAX_BUFFER_SIZE}).`);
    }

    // Allocate the buffer and create a DataView for writing.
    const outputBuffer = new ArrayBuffer(totalBufferSize);
    const dataWriter = new DataView(outputBuffer);

    // Write primary header information (all little-endian).
    dataWriter.setUint16(0, 0, true); // Version field (0 for current schema)
    dataWriter.setUint32(2, assetIndexStartOffset, true); // Offset to the asset index table
    dataWriter.setUint32(6, 0, true); // Reserved for future use (e.g., color palettes)

    // Write the number of assets into the asset index section (little-endian).
    dataWriter.setUint16(assetIndexStartOffset, vectorItemCount, true);

    // Second pass: Write asset index entries and copy encoded content into the buffer.
    let currentEntryWriteOffset = assetIndexStartOffset + RESERVED_SPACE_BEFORE_PAYLOAD; // Start of first asset metadata entry

    for (let i = 0; i < vectorItemCount; ++i) {
      const currentAsset = this.assetEntries[i]; // Reference to the original asset object

      // Write glyph ID range and content location for this asset (all little-endian).
      dataWriter.setUint16(currentEntryWriteOffset, currentAsset.firstGlyphIdentifier, true);
      dataWriter.setUint16(currentEntryWriteOffset + 2, currentAsset.lastGlyphIdentifier, true);
      dataWriter.setUint32(currentEntryWriteOffset + 4, contentOffsets[i], true); // Offset of content within payload
      dataWriter.setUint32(currentEntryWriteOffset + 8, contentLengths[i], true); // Length of content in bytes

      // If this is a unique content block (not a duplicate), copy its bytes.
      if (encodedContentBlocks[i] !== null) {
        const payloadStart = assetIndexStartOffset + contentOffsets[i];
        const targetArray = new Uint8Array(outputBuffer, payloadStart, contentLengths[i]);
        targetArray.set(encodedContentBlocks[i]);
      }

      currentEntryWriteOffset += ENTRY_STRUCT_SIZE; // Move to the next entry slot
    }

    return outputBuffer;
  }

  /**
   * Creates a new VectorAssetManager instance by parsing a collection of
   * raw SVG document strings and extracting glyph information.
   * It groups consecutive glyph IDs from the same source into single asset entries.
   * @param {string[]} sourceSvgStrings - An array of SVG XML strings.
   * @param {object} [processingOpts] - Optional configuration for processing.
   * @param {boolean} [processingOpts.ignoreDuplicateGlyphIds=false] - If true, duplicate glyph IDs are silently skipped.
   * @returns {VectorAssetManager} A new instance populated with extracted assets.
   * @throws {Error} If no SVG strings are provided, parsing fails, or glyphs are invalid.
   */
  static createFromSourceAssets(sourceSvgStrings, processingOpts = {}) {
    // Ensure that there is at least one source document to process.
    if (sourceSvgStrings.length === 0) {
      throw new Error("Asset creation failure: Input array of SVG strings cannot be empty.");
    }

    const collectedGlyphReferences = []; // Stores { id: number, source: string } for all found glyphs
    const domParser = new DOMParser();

    // Iterate through each provided SVG string to extract glyph IDs.
    for (let i = 0; i < sourceSvgStrings.length; ++i) {
      const currentSvgContent = sourceSvgStrings[i];
      const parsedDom = domParser.parseFromString(currentSvgContent, "image/svg+xml");

      // Check for XML parsing errors by looking for a 'parsererror' element.
      const parseErrorNode = parsedDom.querySelector("parsererror");
      if (parseErrorNode) {
        throw new Error(`SVG parsing error in document ${i}: ${parseErrorNode.textContent}`);
      }

      // Find all elements within the SVG that have an 'id' attribute.
      const identifiableElements = parsedDom.querySelectorAll("[id]");

      // Extract glyph identifiers following the 'glyphNNN' pattern.
      for (const element of identifiableElements) {
        const elementId = element.getAttribute("id");
        const idPatternMatch = /^glyph([1-9][0-9]*)$/.exec(elementId);

        if (idPatternMatch) {
          // Store the numerical ID and the original SVG content it came from.
          collectedGlyphReferences.push({
            id: parseInt(idPatternMatch[1], 10), // Ensure ID is a number
            source: currentSvgContent
          });
        }
      }
    }

    // If no glyphs were found across all documents, it's an invalid input scenario.
    if (collectedGlyphReferences.length === 0) {
      throw new Error("Asset creation failure: No valid glyph identifiers ('glyphNNN') found in any provided SVG source.");
    }

    // Sort the collected glyph references by their numerical ID for sequential processing.
    collectedGlyphReferences.sort((a, b) => a.id - b.id);

    const assetManager = new VectorAssetManager();
    let currentRunStartIndex = 0;

    // Process sorted glyphs to group them into contiguous runs from the same source.
    for (let k = 0; k < collectedGlyphReferences.length; ++k) {
      const currentGlyph = collectedGlyphReferences[k];
      const previousGlyph = k > 0 ? collectedGlyphReferences[k - 1] : null;

      // Handle duplicate glyph IDs based on options.
      if (previousGlyph && currentGlyph.id === previousGlyph.id) {
        if (processingOpts.ignoreDuplicateGlyphIds) {
          // Remove the duplicate and re-evaluate the current index.
          collectedGlyphReferences.splice(k, 1);
          k--; // Decrement index to re-check the current position after removal.
          continue;
        }
        throw new Error(`Asset processing error: Duplicate glyph ID ${currentGlyph.id} detected.`);
      }

      const nextGlyphExists = (k < collectedGlyphReferences.length - 1);
      const nextGlyph = nextGlyphExists ? collectedGlyphReferences[k + 1] : null;

      // Check for the end of a contiguous run:
      // 1. It's the last glyph in the list.
      // 2. The next glyph's ID is not exactly one greater than the current one.
      // 3. The next glyph comes from a different source SVG string.
      const isEndOfRun = !nextGlyphExists ||
                         nextGlyph.id !== (currentGlyph.id + 1) ||
                         nextGlyph.source !== currentGlyph.source;

      if (isEndOfRun) {
        // Create an asset entry for the detected run.
        assetManager.assetEntries.push({
          firstGlyphIdentifier: collectedGlyphReferences[currentRunStartIndex].id,
          lastGlyphIdentifier: currentGlyph.id,
          contentString: currentGlyph.source
        });
        currentRunStartIndex = k + 1; // Start a new run from the next glyph.
      }
    }

    return assetManager;
  }

  /**
   * Reconstructs a VectorAssetManager instance from a serialized binary ArrayBuffer.
   * This method performs validation checks to ensure the integrity and format
   * of the incoming binary data. It expects all multi-byte values to be in
   * little-endian format.
   * @param {DataView} serializedBufferView - A DataView providing access to the binary data.
   * @returns {VectorAssetManager} A new instance populated with deserialized assets.
   * @throws {Error} If the buffer format is invalid, version mismatch, or data integrity issues.
   */
  static deserializeFromBuffer(serializedBufferView) {
    const MIN_BUFFER_HEADER_SIZE = 10; // Minimum bytes for initial header (version, index offset, reserved)
    const ENTRY_STRUCT_SIZE = 12; // Bytes per asset metadata entry
    const ASSET_INDEX_HEADER_SIZE = 2; // Size of the count field within the index

    // Pre-check: Ensure the buffer is large enough for the minimal header.
    if (serializedBufferView.byteLength < MIN_BUFFER_HEADER_SIZE) {
      throw new Error(`Deserialization error: Buffer too small (${serializedBufferView.byteLength} bytes) to contain even the basic header (${MIN_BUFFER_HEADER_SIZE} bytes).`);
    }

    // Read and validate the file format version (little-endian).
    const fileVersion = serializedBufferView.getUint16(0, true);
    if (fileVersion !== 0) {
      throw new Error(`Deserialization error: Unsupported binary format version encountered (v${fileVersion}). Expected v0.`);
    }

    // Read and validate the reserved field (little-endian).
    const reservedField = serializedBufferView.getUint32(6, true);
    if (reservedField !== 0) {
      throw new Error(`Deserialization error: Reserved field (offset 6) contains unexpected data (${reservedField}). Color palettes not supported yet.`);
    }

    // Determine the offset where the asset index table begins (little-endian).
    const assetIndexOffset = serializedBufferView.getUint32(2, true);

    // Validate asset index offset against buffer boundaries.
    if (assetIndexOffset + ASSET_INDEX_HEADER_SIZE > serializedBufferView.byteLength) {
      throw new Error(`Deserialization error: Asset index start offset (${assetIndexOffset}) points beyond buffer bounds.`);
    }

    // Read the total number of asset entries (little-endian).
    const totalAssetEntries = serializedBufferView.getUint16(assetIndexOffset, true);

    // Validate the total size required by the asset index table.
    const expectedIndexEnd = assetIndexOffset + ASSET_INDEX_HEADER_SIZE + totalAssetEntries * ENTRY_STRUCT_SIZE;
    if (expectedIndexEnd > serializedBufferView.byteLength) {
      throw new Error(`Deserialization error: Asset index table extends beyond buffer boundaries. Expected end at ${expectedIndexEnd}, buffer length ${serializedBufferView.byteLength}.`);
    }

    // A manager must contain at least one asset after deserialization.
    if (totalAssetEntries === 0) {
      throw new Error("Deserialization error: The binary data indicates zero asset entries, which is not allowed.");
    }

    const newAssetManager = new VectorAssetManager();
    let currentReadPointer = assetIndexOffset + ASSET_INDEX_HEADER_SIZE;
    const utf8Decoder = new TextDecoder("utf-8"); // Explicitly specify UTF-8 encoding

    // Iterate through each asset entry in the index table.
    for (let i = 0; i < totalAssetEntries; ++i) {
      const firstGlyphIdentifier = serializedBufferView.getUint16(currentReadPointer, true);
      const lastGlyphIdentifier = serializedBufferView.getUint16(currentReadPointer + 2, true);
      const contentPayloadOffset = serializedBufferView.getUint32(currentReadPointer + 4, true); // Offset within the payload section
      const contentByteLength = serializedBufferView.getUint32(currentReadPointer + 8, true);

      // Validate glyph ID order within the current asset entry.
      if (firstGlyphIdentifier > lastGlyphIdentifier) {
        throw new Error(`Deserialization error: Misordered glyph identifiers found for entry ${i} (start: ${firstGlyphIdentifier}, end: ${lastGlyphIdentifier}).`);
      }

      // Validate sequential glyph IDs across documents (no overlap with previous).
      if (i > 0) {
        const previousAsset = newAssetManager.assetEntries[i - 1];
        if (previousAsset.lastGlyphIdentifier >= firstGlyphIdentifier) {
          throw new Error(`Deserialization error: Overlapping or misordered glyph IDs between entry ${i - 1} (end: ${previousAsset.lastGlyphIdentifier}) and entry ${i} (start: ${firstGlyphIdentifier}).`);
        }
      }

      // Validate the bounds of the content payload. The content payload starts
      // after the header and the asset index table.
      const actualContentStartOffset = assetIndexOffset + contentPayloadOffset;
      if (actualContentStartOffset + contentByteLength > serializedBufferView.byteLength) {
        throw new Error(`Deserialization error: Asset content for entry ${i} (offset: ${contentPayloadOffset}, length: ${contentByteLength}) extends beyond buffer limits.`);
      }

      // Decode the actual SVG content string from the buffer segment.
      const contentDataView = new DataView(
        serializedBufferView.buffer,
        serializedBufferView.byteOffset + actualContentStartOffset,
        contentByteLength
      );
      const decodedContentString = utf8Decoder.decode(contentDataView);

      // Add the reconstructed asset entry to the manager.
      newAssetManager.assetEntries.push({
        firstGlyphIdentifier: firstGlyphIdentifier,
        lastGlyphIdentifier: lastGlyphIdentifier,
        contentString: decodedContentString
      });

      currentReadPointer += ENTRY_STRUCT_SIZE; // Move to the next entry in the index.
    }

    return newAssetManager;
  }
}