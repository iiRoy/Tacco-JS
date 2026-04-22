module.exports = {
    // This module defines a comprehensive set of constants essential for parsing
    // and constructing ZIP archive structures according to the PKWARE specification.
    // It organizes these values into logical categories for clarity and ease of use.

    // --- Fundamental PK Signature Components ---
    // The base magic number 'PK' (0x4B50) that serves as a prefix for many ZIP signatures.
    // This value is represented in little-endian format, meaning 'P' (0x50) and 'K' (0x4B).
    coreSignaturePrefix: 0x4B50, // Hexadecimal representation for 'PK'

    // --- Local File Header (LFH) Descriptors ---
    // Constants defining the structure and offsets within the Local File Header.
    localFileHeaderSpecs: {
        // The fixed byte length of a Local File Header structure.
        byteLength: 30,

        // The unique magic signature for the Local File Header: "PK\x03\x04".
        signature: 67324752, // Decimal representation of 0x04034B50

        // The minimum version of the ZIP specification needed to extract this entry.
        requiredVersionToExtract: 4,

        // General purpose bit flags, indicating various file properties (e.g., encryption, descriptor presence).
        generalPurposeBitFlags: 6,

        // The compression method used for the file data.
        compressionAlgorithmId: 8,

        // The DOS-formatted modification time and date of the file.
        lastModificationTimeDate: 10,

        // The CRC-32 checksum of the uncompressed file data.
        crc32DataChecksum: 14,

        // The size of the file's compressed data in bytes.
        compressedDataSize: 18,

        // The size of the file's uncompressed data in bytes.
        uncompressedDataSize: 22,

        // The byte length of the file name.
        fileNameByteCount: 26,

        // The byte length of the extra field data.
        extraFieldByteCount: 28
    },

    // --- Data Descriptor (DD) Layout ---
    // Constants for the optional Data Descriptor, used when LFH sizes/CRC are unknown initially.
    dataDescriptorLayout: {
        // The magic signature for the Data Descriptor: "PK\x07\x08".
        signature: 0x08074B50,

        // The total byte size of the Data Descriptor structure.
        byteLength: 16,

        // Offset to the CRC-32 checksum within the descriptor.
        crc32Offset: 4,

        // Offset to the compressed size within the descriptor.
        compressedSizeOffset: 8,

        // Offset to the uncompressed size within the descriptor.
        uncompressedSizeOffset: 12
    },

    // --- Central Directory File Header (CDFH) Details ---
    // Constants describing the Central Directory File Header, which contains global file metadata.
    centralDirectoryHeaderInfo: {
        // The fixed byte length of a Central Directory File Header.
        byteLength: 46,

        // The unique magic signature for the Central Directory File Header: "PK\x01\x02".
        signature: 0x02014B50,

        // The version of the ZIP specification used by the tool that created the archive.
        versionMadeByApplication: 4,

        // The minimum ZIP specification version needed to extract this specific entry.
        minExtractorVersion: 6,

        // General purpose bit flags specific to this entry (e.g., encryption, compression options).
        entryFlags: 8,

        // The compression method applied to this file entry.
        entryCompressionMethod: 10,

        // The DOS-formatted modification timestamp for this entry.
        entryModificationStamp: 12,

        // The CRC-32 checksum for this entry's uncompressed data.
        entryCrc32Value: 16,

        // The compressed size of this file entry's data.
        entryCompressedDataSize: 20,

        // The uncompressed size of this file entry's data.
        entryUncompressedDataSize: 24,

        // The byte length of the file name for this entry.
        entryFileNameLength: 28,

        // The byte length of the extra field for this entry.
        entryExtraFieldLength: 30,

        // The byte length of the file comment for this entry.
        entryFileCommentLength: 32,

        // The number of the disk on which this file entry starts.
        fileStartingDiskNumber: 34,

        // Internal file attributes, specific to the file type (e.g., ASCII/binary).
        internalAttributes: 36,

        // External file attributes, host system dependent.
        externalAttributes: 38,

        // The relative offset of the Local File Header for this entry from the start of the archive.
        localHeaderRelativeOffset: 42
    },

    // --- End of Central Directory Record (EOCDR) Structure ---
    // Constants for the EOCDR, which marks the end of the central directory and provides its location.
    endOfCentralDirectoryRecordStructure: {
        // The fixed byte length of the EOCDR.
        byteLength: 22,

        // The unique magic signature for the EOCDR: "PK\x05\x06".
        signature: 0x06054B50,

        // The total number of entries in the central directory on this disk.
        entriesCountOnThisDisk: 8,

        // The total number of entries in the central directory across all disks.
        totalCentralDirectoryEntries: 10,

        // The size of the central directory in bytes.
        centralDirectoryTotalSize: 12,

        // The offset of the first central directory header from the start of the archive.
        centralDirectoryStartOffset: 16,

        // The byte length of the ZIP file comment.
        zipArchiveCommentLength: 20
    },

    // --- Supported Compression Methods ---
    // A mapping of compression method IDs to their respective names.
    archiveCompressionMethods: {
        uncompressed: 0, // No compression applied.
        shrunk: 1,
        reducedWithFactor1: 2,
        reducedWithFactor2: 3,
        reducedWithFactor3: 4,
        reducedWithFactor4: 5,
        imploded: 6,
        deflated: 8,
        enhancedDeflated: 9,
        pkwareDclImploded: 10,
        bzip2: 12,
        lzma: 14,
        ibmTerse: 18,
        ibmLZ77: 19
    },

    // --- Interpretations of General Purpose Bit Flags ---
    // Bit positions within the general purpose bit flag field.
    generalBitFlagMeanings: {
        isEncryptedFile: 0,
        compressionOptionBit1: 1,
        compressionOptionBit2: 2,
        hasDataDescriptorFollowing: 4,
        usesEnhancedDeflation: 8,
        strongEncryptionUsed: 16,
        unicodeFileNameEncoded: 1024, // UTF-8 encoding for filename/comment.
        maskHeaderValuesForTesting: 4096
    },

    // --- Data Loading Mechanism ---
    // Defines the origin of the data being processed.
    dataLoadSources: {
        fromDiskFile: 0,
        fromMemoryBuffer: 1,
        sourceNotSpecified: 2
    },

    // --- Extra Field Standard Offsets ---
    // Common offsets within any generic extra field entry.
    extraFieldEntryLayout: {
        headerIdOffset: 0, // Position of the 2-byte Header ID.
        dataSizeOffset: 2 // Position of the 2-byte Data Size.
    },

    // --- Extra Field Header Identifiers ---
    // A collection of known Header IDs for various extra field types.
    extraFieldIdentifiers: {
        zip64ExtendedInformation: 0x0001,
        avInfoData: 0x0007,
        pkwareDclInfo: 0x0008,
        os2ExtendedAttributes: 0x0009,
        ntfsAttributes: 0x000a,
        openVmsAttributes: 0x000c,
        unixData: 0x000d,
        macintoshForkData: 0x000e,
        patchDescriptor: 0x000f,
        x509Pkcs7CertStore: 0x0014,
        x509CertIdFile: 0x0015,
        x509CertIdCentralDirectory: 0x0016,
        strongEncryptionMetadata: 0x0017,
        recordManagementControls: 0x0018,
        x509Pkcs7CertRevocationList: 0x0019,
        ibmAesEncryption: 0x0065,
        ibmReservedField: 0x0066,
        posZip4690: 0x4690
    },

    // --- ZIP64 Extension Specific Values ---
    // Constants related to the ZIP64 extended information extra field.
    zip64ExtensionDetails: {
        // Sentinel value indicating a 32-bit field has overflowed and the actual value
        // is stored in the ZIP64 extra field (e.g., for file sizes).
        sizeOverflowMarker: 4294967295, // Decimal for 0xFFFFFFFF

        // Sentinel value indicating a 16-bit field has overflowed (e.g., for disk numbers).
        lengthOverflowMarker: 65535, // Decimal for 0xFFFF

        // Offset within the ZIP64 extra field to the uncompressed size.
        uncompressedSizeDataOffset: 0,

        // Offset within the ZIP64 extra field to the compressed size.
        compressedSizeDataOffset: 8,

        // Offset within the ZIP64 extra field to the relative offset of the local file header.
        localHeaderRelativeOffsetData: 16,

        // Offset within the ZIP64 extra field to the starting disk number.
        startingDiskNumberDataOffset: 24
    },

    // --- Utility Functions for ZIP Constants (Added for Type III) ---
    // Provides helper methods to work with the defined constants.
    zipUtilities: {
        /**
         * Retrieves the descriptive name for a given compression method ID.
         * @param {number} methodId - The numeric ID of the compression method.
         * @returns {string} The name of the compression method or 'UNKNOWN_METHOD'.
         */
        getCompressionMethodName: function(methodId) {
            const methods = Object.entries(this.archiveCompressionMethods).find(([, value]) => value === methodId);
            return methods ? methods[0] : 'UNKNOWN_METHOD';
        }.bind(this), // Bind 'this' to the module.exports object to access other constants

        // An array containing all known compression method IDs.
        allCompressionMethodIds: Object.values(this.archiveCompressionMethods),

        /**
         * Checks if a given 4-byte signature value contains the 'PK' magic prefix.
         * @param {number} fullSignature - The full 4-byte signature value (e.g., 0x04034B50).
         * @returns {boolean} True if the signature contains the 'PK' prefix, false otherwise.
         */
        isValidPkSignature: function(fullSignature) {
            // The coreSignaturePrefix (0x4B50) represents 'PK' in little-endian.
            // We check if the lower 16 bits of the full signature match this.
            return (fullSignature & 0xFFFF) === this.coreSignaturePrefix;
        }.bind(this)
    }
};