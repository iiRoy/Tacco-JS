module.exports = {

    // Structure defining the local file record
    LFH_SIZE_BYTES          : 30, // Total byte count for local file header
    LFH_SIGNATURE_MAGIC     : 0x04034b50, // Signature for local file header ("PK\003\004")
    LFH_MIN_EXTRACT_VERSION : 4,    // Minimum version required to process entry
    LFH_GENERAL_PURPOSE_BITS: 6,    // General purpose flag bits
    LFH_COMPRESSION_METHOD  : 8,    // Data compression technique
    LFH_MODIFICATION_TIMESTAMP: 10, // File modification time and date (4 bytes total)
    LFH_CRC32_VALUE         : 14,   // CRC-32 checksum of uncompressed data
    LFH_COMPRESSED_SIZE     : 18,   // Size of compressed data in bytes
    LFH_UNCOMPRESSED_SIZE   : 22,   // Original size of data in bytes
    LFH_FILENAME_LENGTH     : 26,   // Length of filename field
    LFH_EXTRA_FIELD_LENGTH  : 28,   // Length of extra field data

    // Constants for the data descriptor (optional)
    DD_SIGNATURE_MAGIC      : 0x08074b50, // Signature for data descriptor ("PK\007\008")
    DD_RECORD_SIZE          : 16,   // Total size of data descriptor record
    DD_CRC_VALUE            : 4,    // CRC-32 checksum of the file
    DD_COMPRESSED_DATA_SIZE : 8,    // Size of the file (compressed)
    DD_UNCOMPRESSED_DATA_SIZE: 12,  // Size of the file (uncompressed)

    // Definitions for the central directory file entry
    CDFE_RECORD_SIZE        : 46,   // Total size of central directory file header
    CDFE_SIGNATURE_MAGIC    : 0x02014b50, // Signature for central directory entry ("PK\001\002")
    CDFE_VERSION_MADE_BY    : 4,    // Version of compressor used
    CDFE_MIN_EXTRACT_VERSION: 6,    // Minimum version needed to extract
    CDFE_GENERAL_PURPOSE_BITS: 8,   // Encryption/compression flags
    CDFE_COMPRESSION_METHOD : 10,   // Method used for compression
    CDFE_MODIFICATION_TIMESTAMP: 12, // Last modification time and date
    CDFE_CRC32_VALUE        : 16,   // CRC-32 checksum for the entry
    CDFE_COMPRESSED_SIZE    : 20,   // Compressed file size
    CDFE_UNCOMPRESSED_SIZE  : 24,   // Uncompressed file size
    CDFE_FILENAME_LENGTH    : 28,   // Length of the filename
    CDFE_EXTRA_FIELD_LENGTH : 30,   // Length of the extra data field
    CDFE_FILE_COMMENT_LENGTH: 32,   // Length of the file comment
    CDFE_DISK_NUMBER_START  : 34,   // Disk number where file starts
    CDFE_INTERNAL_ATTRIBUTES: 36,   // Internal file attributes
    CDFE_EXTERNAL_ATTRIBUTES: 38,   // External file attributes (OS specific)
    CDFE_LOCAL_HEADER_OFFSET: 42,   // Offset of local file header from disk start

    // End of central directory record fields
    EOCDR_RECORD_SIZE       : 22,   // Total size of end of central directory record
    EOCDR_SIGNATURE_MAGIC   : 0x06054b50, // Signature for end of central directory ("PK\005\006")
    EOCDR_DISK_ENTRY_COUNT  : 8,    // Number of entries on current disk
    EOCDR_TOTAL_ENTRY_COUNT : 10,   // Total number of entries in central directory
    EOCDR_CENTRAL_DIR_SIZE  : 12,   // Size of central directory in bytes
    EOCDR_CENTRAL_DIR_OFFSET: 16,   // Offset to central directory from disk start
    EOCDR_COMMENT_LENGTH    : 20,   // Length of the archive comment

    // Available compression algorithms
    COMP_METHOD_NONE        : 0,    // No compression applied
    COMP_METHOD_SHRUNK      : 1,    // Shrunk compression
    COMP_METHOD_REDUCED_1   : 2,    // Reduced with factor 1
    COMP_METHOD_REDUCED_2   : 3,    // Reduced with factor 2
    COMP_METHOD_REDUCED_3   : 4,    // Reduced with factor 3
    COMP_METHOD_REDUCED_4   : 5,    // Reduced with factor 4
    COMP_METHOD_IMPLODED    : 6,    // Imploded compression
    // 7 is currently unused
    COMP_METHOD_DEFLATE     : 8,    // Deflate compression
    COMP_METHOD_ENH_DEFLATE : 9,    // Enhanced deflate method
    COMP_METHOD_PKWARE_DCL  : 10,   // PKWare DCL imploded
    // 11 is reserved for future use
    COMP_METHOD_BZIP2       : 12,   // BZIP2 algorithm
    // 13 is unused
    COMP_METHOD_LZMA        : 14,   // LZMA compression
    // 15-17 are reserved
    COMP_METHOD_IBM_TERSE   : 18,   // IBM TERSE algorithm
    COMP_METHOD_IBM_LZ77    : 19,   // IBM LZ77 compression

    // General purpose flag bit definitions
    FLAG_BIT_ENCRYPTED      : 0,    // File is encrypted
    FLAG_BIT_COMP_OPTION_1  : 1,    // First compression option bit
    FLAG_BIT_COMP_OPTION_2  : 2,    // Second compression option bit
    FLAG_BIT_DATA_DESCR_FOLLOWS: 4, // Data descriptor follows file data
    FLAG_BIT_ENHANCED_DEFLATION: 8, // Enhanced deflation applied
    FLAG_BIT_STRONG_ENCRYPTION: 16, // Strong encryption used
    FLAG_BIT_UTF8_FILENAME  : 1024, // Filename and comment are UTF-8 encoded
    FLAG_BIT_MASK_HEADER_VALS: 4096, // Mask header values (for patched data)

    // Types for loading data sources
    SOURCE_TYPE_FILE        : 0,    // Data loaded from a file path
    SOURCE_TYPE_BUFFER      : 1,    // Data loaded from a memory buffer
    SOURCE_TYPE_UNKNOWN     : 2,    // No specific source type identified

    // Offsets within extensible data fields
    EXT_FIELD_TYPE_OFFSET   : 0,    // Offset for field ID
    EXT_FIELD_LENGTH_OFFSET : 2,    // Offset for field data length

    // Standard extra field header identifiers
    HEADER_ID_ZIP64         : 0x0001, // ZIP64 extended information
    HEADER_ID_A_V_INFO      : 0x0007, // AV Info
    HEADER_ID_PFS           : 0x0008, // PKWare for file system
    HEADER_ID_OS_2          : 0x0009, // OS/2 extended attributes
    HEADER_ID_NTFS          : 0x000a, // NTFS extended attributes
    HEADER_ID_OPEN_VMS      : 0x000c, // OpenVMS extended attributes
    HEADER_ID_UNIX          : 0x000d, // UNIX extra data
    HEADER_ID_FILE_FORK     : 0x000e, // File fork descriptor
    HEADER_ID_PATCH         : 0x000f, // Patch descriptor
    HEADER_ID_X509_PKCS7    : 0x0014, // X.509 PKCS#7 signature
    HEADER_ID_X509_CERT_FILE: 0x0015, // X.509 Certificate ID and Signature (File)
    HEADER_ID_X509_CERT_CD  : 0x0016, // X.509 Certificate ID and Signature (Central Directory)
    HEADER_ID_STRONG_ENC    : 0x0017, // Strong encryption header
    HEADER_ID_RECORD_MGT    : 0x0018, // Record Management Controls
    HEADER_ID_X509_PKCS7_CRL: 0x0019, // X.509 PKCS#7 certificate revocation list
    HEADER_ID_IBM_ATTACH_1  : 0x0065, // IBM S/390 (Z390), AS/400 (iSeries) attributes (1)
    HEADER_ID_IBM_ATTACH_2  : 0x0066, // IBM S/390 (Z390), AS/400 (iSeries) attributes (2)
    HEADER_ID_POS_ZIP       : 0x4690, // POSZIP 4690 (for retail)

    Z64_OVERFLOW_32_BIT     : 0xffffffff, // Value indicating 32-bit field overflow (use ZIP64)
    Z64_OVERFLOW_16_BIT     : 0xffff,     // Value indicating 16-bit field overflow (use ZIP64)
    Z64_FIELD_UNCOMP_SIZE   : 0,          // Offset for uncompressed size in ZIP64 extra field
    Z64_FIELD_COMP_SIZE     : 8,          // Offset for compressed size in ZIP64 extra field
    Z64_FIELD_LOCAL_HDR_OFF : 16,         // Offset for relative offset of local header in ZIP64
    Z64_FIELD_DISK_NUMBER   : 24          // Offset for disk number in ZIP64 extra field
};