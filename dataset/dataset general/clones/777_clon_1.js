module.exports = { /* Constants defining various ZIP file format structures and values */
  /*
   * These values correspond to the offsets and sizes
   * within the Local File Header (LOC) structure.
   * This header precedes the compressed file data.
   */
  LOCHDR: 30, /* The overall size of the Local File Header */
  LOCSIG: 0x04034b50, /* The signature bytes for a Local File Header ("PK\x03\x04") */

  LOCVER: 4,  // Version of PKZIP needed to extract
  LOCFLG: 6,  // General purpose bit flag
  LOCHOW: 8,  // Compression method identifier
  LOCTIM: 10, // File modification time (2 bytes for time, 2 for date)
  LOCCRC: 14, // CRC-32 checksum of the uncompressed data
  LOCSIZ: 18, // Compressed file size
  LOCLEN: 22, // Uncompressed file size
  LOCNAM: 26, // Length of the filename field
  LOCEXT: 28, /* Length of the extra field data */

  /*
   * Constants for the Data Descriptor (EXT) structure.
   * This optional structure follows the compressed data when
   * the general purpose bit flag indicates that CRC and sizes
   * are not known at the time the local header is written.
   */
  EXTSIG: 0x08074b50, /* Signature for a Data Descriptor ("PK\x07\x08") */
  EXTHDR: 16, // Total size of the Data Descriptor block
  EXTCRC: 4,  // CRC-32 value of the uncompressed data
  EXTSIZ: 8,  // Compressed size of the data
  EXTLEN: 12, // Uncompressed size of the data

  /*
   * Central Directory File Header (CEN) constants.
   * Each file in the ZIP archive has a corresponding entry
   * in the Central Directory, described by this header.
   */
  CENHDR: 46, /* The fixed size of a Central Directory File Header entry */
  CENSIG: 0x02014b50, /* Signature for a Central Directory File Header ("PK\x01\x02") */

  CENVEM: 4,  // Version made by (identifies the creating system)
  CENVER: 6,  // Version needed to extract this entry
  CENFLG: 8,  // General purpose bit flag
  CENHOW: 10, // Compression method
  CENTIM: 12, // Modification time and date
  CENCRC: 16, // CRC-32 checksum
  CENSIZ: 20, // Compressed size
  CENLEN: 24, // Uncompressed size
  CENNAM: 28, // Filename length
  CENEXT: 30, // Extra field length
  CENCOM: 32, // File comment length
  CENDSK: 34, // Disk number where file starts
  CENATT: 36, // Internal file attributes
  CENATX: 38, // External file attributes
  CENOFF: 42, /* Offset of the local file header from the start of the archive */

  /*
   * End of Central Directory (END) Record constants.
   * This record marks the end of the central directory and the entire ZIP file.
   */
  ENDHDR: 22, /* The byte size of the End of Central Directory Record */
  ENDSIG: 0x06054b50, /* Signature for the End of Central Directory Record ("PK\x05\x06") */

  ENDSUB: 8,  // Number of entries on this disk
  ENDTOT: 10, // Total number of entries in the central directory
  ENDSIZ: 12, // Size of the central directory in bytes
  ENDOFF: 16, // Offset of the first Central Directory Header
  ENDCOM: 20, // Length of the ZIP file comment

  /*
   * Compression Methods (LOCHOW and CENHOW fields).
   * These integer values specify the algorithm used for compression.
   */
  STORED: 0,  // No compression (data is stored directly)
  SHRUNK: 1,  // Shrunk compression
  REDUCED1: 2, // Reduced with compression factor 1
  REDUCED2: 3, // Reduced with compression factor 2
  REDUCED3: 4, // Reduced with compression factor 3
  REDUCED4: 5, // Reduced with compression factor 4
  IMPLODED: 6, // Imploded compression
  // Method 7 is currently reserved
  DEFLATED: 8, // Deflated compression (most common method)
  ENHANCED_DEFLATED: 9, /* Enhanced Deflated algorithm */
  PKWARE: 10, /* PKWare DCL Imploded */
  // Method 11 is reserved
  BZIP2: 12,  // BZIP2 compression
  // Method 13 is reserved
  LZMA: 14,   // LZMA compression
  // Methods 15-17 are reserved
  IBM_TERSE: 18, // IBM TERSE compression
  IBM_LZ77: 19,  // IBM LZ77 z-compression

  /*
   * General Purpose Bit Flag (LOCFLG and CENFLG fields).
   * Each bit within this field represents a specific option or property.
   */
  FLG_ENC: 0,   // Bit 0: File is encrypted
  FLG_COMP1: 1, // Bit 1: Compression option (e.g., for Deflate)
  FLG_COMP2: 2, // Bit 2: Another compression option
  FLG_DESC: 4,  // Bit 3: Data descriptor follows file data
  FLG_ENH: 8,   // Bit 4: Enhanced deflation used
  FLG_STR: 16,  // Bit 5: Strong encryption used
  FLG_LNG: 1024, // Bit 11: Language encoding for filename/comment (UTF-8)
  FLG_MSK: 4096, // Bit 12: Mask header values (for patched data)

  /*
   * Load Type identifiers.
   * Used internally to specify the source of the ZIP data.
   */
  FILE: 0,    // Data loaded from a file system path
  BUFFER: 1,  // Data provided as a buffer in memory
  NONE: 2,    // No specific load type (e.g., for creation)

  /*
   * Extensible Data Fields (Extra Fields) common offsets.
   * These are standard offsets for sub-fields within any extra field.
   */
  EF_ID: 0,   // Offset for the Extra Field Header ID
  EF_SIZE: 2, // Offset for the Extra Field Data Size

  /*
   * Extra Field Header IDs.
   * Identifies the specific type of data contained within an extra field.
   */
  ID_ZIP64: 0x0001,      /* ZIP64 extended information extra field */
  ID_AVINFO: 0x0007,     // AV Info extra field
  ID_PFS: 0x0008,        // PKWARE for Windows (PFS) encryption
  ID_OS2: 0x0009,        // OS/2 extended attributes
  ID_NTFS: 0x000a,       // NTFS extended attributes
  ID_OPENVMS: 0x000c,    // OpenVMS extended attributes
  ID_UNIX: 0x000d,       // UNIX extra data (UID/GID, timestamps)
  ID_FORK: 0x000e,       // File Share (Macintosh)
  ID_PATCH: 0x000f,      // Patch Descriptor
  ID_X509_PKCS7: 0x0014, // PKCS#7 Store
  ID_X509_CERTID_F: 0x0015, /* X.509 Certificate ID and Signature (for file) */
  ID_X509_CERTID_C: 0x0016, /* X.509 Certificate ID (for central directory) */
  ID_STRONGENC: 0x0017,  // Strong Encryption Header
  ID_RECORD_MGT: 0x0018, // Record Management Controls
  ID_X509_PKCS7_RL: 0x0019, /* PKCS#7 Store extended (Revocation List) */
  ID_IBM1: 0x0065,       // IBM S/390 (Z/OS) - AS/400 (Iseries)
  ID_IBM2: 0x0066,       // IBM S/390 (Z/OS) - AS/400 (Iseries)
  ID_POSZIP: 0x4690,     // POSZIP 4690 (IBM)

  /*
   * ZIP64 Extra Field specific constants.
   * These values indicate that standard 32-bit fields are not sufficient
   * and larger 64-bit values are stored in the ZIP64 extra field.
   */
  EF_ZIP64_OR_32: 0xffffffff, /* Sentinel value indicating a 32-bit field requires ZIP64 */
  EF_ZIP64_OR_16: 0xffff,     // Sentinel value indicating a 16-bit field requires ZIP64
  EF_ZIP64_SUNCOMP: 0,        // Offset for uncompressed size in ZIP64 extra field
  EF_ZIP64_SCOMP: 8,          // Offset for compressed size in ZIP64 extra field
  EF_ZIP64_RHO: 16,           // Offset for relative header offset in ZIP64 extra field
  EF_ZIP64_DSN: 24             // Offset for disk start number in ZIP64 extra field
};