const fileSystemOps = require("fs");
const utilityHelpers = require("util");
const cryptographyModule = require("crypto");
const pathUtilities = require("path");

// Core module for RADIUS packet processing and dictionary management.
// This module provides functionalities for decoding RADIUS packets
// and managing attribute definitions loaded from dictionary files.
const ProtocolCore = {};

// Internal storage for attribute definitions, organized by vendor ID.
// Structure: { vendorId: { attrId: [id, name, type, enumMap, reverseEnumMap, modifiers], attrName: [...] } }
let attributeSchemaDefinitions = {};
// Mapping of vendor names to their numerical IDs.
let vendorIdentifierMap = {};
// List of paths where dictionary files are located.
const schemaSourceDirectories = [pathUtilities.normalize(__dirname + "/../dictionaries")];

// Enumeration for the state of the schema (dictionary) loading process.
const SchemaLoadState = {
  UNINITIALIZED: 1, // Dictionaries have not been loaded yet.
  LOADING_IN_PROGRESS: 2, // Dictionaries are currently being loaded.
  READY: 3 // Dictionaries have been successfully loaded.
};

let schemaLoadingStatus = SchemaLoadState.UNINITIALIZED;

// Constant representing a non-vendor-specific attribute.
const DEFAULT_VENDOR_KEY = -1;

// Indices for accessing attribute definition array elements.
const SCHEMA_FIELD_ID = 0;
const SCHEMA_FIELD_NAME = 1;
const SCHEMA_FIELD_TYPE = 2;
const SCHEMA_FIELD_ENUM_MAP = 3;
const SCHEMA_FIELD_REV_ENUM_MAP = 4;
const SCHEMA_FIELD_FLAGS = 5; // Modifiers like 'has_tag', 'encrypt=1'

// Constants defining key byte offsets and lengths within a RADIUS packet.
const AUTHENTICATOR_OFFSET_START = 4;
const AUTHENTICATOR_OFFSET_END = 20;
const AUTHENTICATOR_BYTE_LENGTH = 16;
const MESSAGE_AUTHENTICATOR_BYTE_SIZE = 16;

/**
 * Custom error class for issues related to shared secret mismatches
 * during RADIUS packet authentication.
 */
class SharedSecretMismatchError extends Error {
  /**
   * Constructs a new SharedSecretMismatchError.
   * @param {string} message - The error message.
   * @param {object} decodedPacketInfo - Information about the decoded packet.
   */
  constructor(message, decodedPacketInfo) {
    super(message || 'Shared Secret Mismatch Detected');
    this.name = 'SharedSecretMismatchError';
    this.decodedPacketInfo = decodedPacketInfo;
    // Capturing stack trace for better debugging.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SharedSecretMismatchError);
    }
  }
}
ProtocolCore.SharedSecretMismatchError = SharedSecretMismatchError;

/**
 * Registers an additional directory or file path for dictionary lookup.
 * @param {string} pathToFileOrDirectory - The path to add.
 */
ProtocolCore.registerSchemaDirectory = function(pathToFileOrDirectory) {
  schemaSourceDirectories.push(pathUtilities.resolve(pathToFileOrDirectory));
};

/**
 * Initializes the schema processor by loading all registered dictionary files.
 * This method ensures dictionaries are loaded only once.
 * @returns {void}
 * @throws {Error} If an invalid dictionary location is provided.
 */
ProtocolCore.initializeSchemaProcessor = function() {
  if (schemaLoadingStatus === SchemaLoadState.READY) {
    return; // Already loaded, no need to re-process.
  }

  if (schemaLoadingStatus === SchemaLoadState.LOADING_IN_PROGRESS) {
    // Optionally, implement a waiting mechanism if concurrent calls are possible.
    // For now, assume single-threaded initialization or handle externally.
    return;
  }

  schemaLoadingStatus = SchemaLoadState.LOADING_IN_PROGRESS;
  const self = this; // Preserve context for nested functions.

  for (const locationPath of schemaSourceDirectories) {
    if (!fileSystemOps.existsSync(locationPath)) {
      throw new Error(`Invalid schema source location: ${locationPath}`);
    }

    const fileStat = fileSystemOps.statSync(locationPath);
    if (fileStat.isDirectory()) {
      const filesInDir = fileSystemOps.readdirSync(locationPath);
      for (const fileName of filesInDir) {
        self.processSchemaFile(pathUtilities.join(locationPath, fileName));
      }
    } else if (fileStat.isFile()) {
      self.processSchemaFile(locationPath);
    } else {
      // Handle other file types or ignore.
      console.warn(`Skipping unknown file system entry: ${locationPath}`);
    }
  }

  schemaLoadingStatus = SchemaLoadState.READY;
};

/**
 * Loads and parses a single dictionary file, handling includes recursively.
 * @param {string} filePath - The path to the dictionary file.
 * @param {Set<string>} [processedFiles] - Set of files already processed to prevent infinite loops.
 * @returns {void}
 */
ProtocolCore.processSchemaFile = function(filePath, processedFiles) {
  const normalizedPath = pathUtilities.normalize(filePath);
  const currentProcessor = this; // Context for recursive calls.

  if (!processedFiles) {
    processedFiles = new Set();
  }

  if (processedFiles.has(normalizedPath)) {
    return; // File already processed.
  }

  processedFiles.add(normalizedPath);

  try {
    const fileContent = fileSystemOps.readFileSync(normalizedPath, "ascii");
    const includedFiles = currentProcessor._parseSchemaContent(fileContent);

    includedFiles.forEach(includePath => {
      currentProcessor.processSchemaFile(pathUtilities.join(pathUtilities.dirname(normalizedPath), includePath), processedFiles);
    });
  } catch (error) {
    console.error(`Failed to load or parse schema file ${normalizedPath}: ${error.message}`);
    // Depending on strictness, re-throw or just log. Re-throwing for now.
    throw error;
  }
};

/**
 * Parses the raw content of a dictionary file.
 * This method extracts VENDOR, ATTRIBUTE, VALUE, and INCLUDE definitions.
 * @param {string} rawContent - The string content of the dictionary file.
 * @returns {string[]} An array of paths to other dictionary files to be included.
 */
ProtocolCore._parseSchemaContent = function(rawContent) {
  const lines = rawContent.split("\n");
  let currentVendorId = DEFAULT_VENDOR_KEY;
  const includePaths = [];

  // Helper function to initialize an attribute entry in the schema definitions.
  const _initializeAttributeEntry = (vendorKey, attrIdentifier) => {
    if (!attributeSchemaDefinitions[vendorKey]) {
      attributeSchemaDefinitions[vendorKey] = {};
    }
    // Initialize with default empty arrays/objects if not present.
    if (!attributeSchemaDefinitions[vendorKey][attrIdentifier]) {
      attributeSchemaDefinitions[vendorKey][attrIdentifier] = [null, null, null, {}, {}, {}];
    }
  };

  // Process each line of the dictionary content.
  for (const rawLine of lines) {
    let cleanedLine = rawLine.replace(/#.*/, "").trim(); // Remove comments and trim whitespace.
    if (!cleanedLine) continue; // Skip empty lines.

    // Standardize multiple spaces to single space for easier regex matching.
    cleanedLine = cleanedLine.replace(/\s+/g, " ");

    let match;

    // VENDOR definition: VENDOR <name> <id>
    if ((match = cleanedLine.match(/^VENDOR\s+(\S+)\s+(\d+)/))) {
      vendorIdentifierMap[match[1]] = parseInt(match[2], 10);
      continue;
    }

    // BEGIN-VENDOR block: BEGIN-VENDOR <name>
    if ((match = cleanedLine.match(/^BEGIN-VENDOR\s+(\S+)/))) {
      currentVendorId = vendorIdentifierMap[match[1]];
      if (currentVendorId === undefined) {
        console.warn(`Unknown vendor '${match[1]}' referenced in BEGIN-VENDOR block.`);
        currentVendorId = DEFAULT_VENDOR_KEY; // Fallback
      }
      continue;
    }

    // END-VENDOR block.
    if (cleanedLine === "END-VENDOR") {
      currentVendorId = DEFAULT_VENDOR_KEY;
      continue;
    }

    // ATTRIBUTE definition: (VENDORATTR <vendorId>|ATTRIBUTE) <name> <id> <type> [modifiers]
    if ((match = cleanedLine.match(/^(?:VENDORATTR\s+(\d+)|ATTRIBUTE)\s+(\S+)\s+(\d+)\s+(\S+)\s*(.*)?/))) {
      const effectiveVendorId = match[1] !== undefined ? parseInt(match[1], 10) : currentVendorId;
      const attributeName = match[2];
      const attributeId = parseInt(match[3], 10);
      const attributeType = match[4];
      const modifierString = match[5] || "";

      const attributeModifiers = {};
      modifierString.split(",").map(m => m.trim()).filter(m => m).forEach(m => {
        attributeModifiers[m] = true;
      });

      _initializeAttributeEntry(effectiveVendorId, attributeId);

      // Store attribute details by ID.
      const attrEntryById = attributeSchemaDefinitions[effectiveVendorId][attributeId];
      attrEntryById[SCHEMA_FIELD_ID] = attributeId;
      attrEntryById[SCHEMA_FIELD_NAME] = attributeName;
      attrEntryById[SCHEMA_FIELD_TYPE] = attributeType;
      attrEntryById[SCHEMA_FIELD_FLAGS] = attributeModifiers;

      // If an attribute with the same name already exists (e.g., from a previous vendor block),
      // merge its enum values. This is a specific RADIUS dictionary behavior.
      const existingByName = attributeSchemaDefinitions[effectiveVendorId][attributeName];
      if (existingByName) {
        // Copy enum and reverse enum maps.
        Object.assign(attrEntryById[SCHEMA_FIELD_ENUM_MAP], existingByName[SCHEMA_FIELD_ENUM_MAP]);
        Object.assign(attrEntryById[SCHEMA_FIELD_REV_ENUM_MAP], existingByName[SCHEMA_FIELD_REV_ENUM_MAP]);
      }
      // Store attribute details by NAME, pointing to the same entry.
      attributeSchemaDefinitions[effectiveVendorId][attributeName] = attrEntryById;
      continue;
    }

    // VALUE definition: (VENDOR)?VALUE <vendorId>? <attrName> <enumName> <enumValue>
    if ((match = cleanedLine.match(/^(?:VENDOR)?VALUE\s+(?:(\d+)\s+)?(\S+)\s+(\S+)\s+(\d+)/))) {
      const effectiveVendorId = match[1] !== undefined ? parseInt(match[1], 10) : currentVendorId;
      const attributeReference = match[2]; // Can be name or ID.
      const enumerationName = match[3];
      const enumerationValue = parseInt(match[4], 10);

      _initializeAttributeEntry(effectiveVendorId, attributeReference);

      const attrEntry = attributeSchemaDefinitions[effectiveVendorId][attributeReference];
      if (attrEntry) {
        attrEntry[SCHEMA_FIELD_ENUM_MAP][enumerationValue] = enumerationName;
        attrEntry[SCHEMA_FIELD_REV_ENUM_MAP][enumerationName] = enumerationValue;
      } else {
        console.warn(`VALUE defined for unknown attribute '${attributeReference}' (vendor ${effectiveVendorId}).`);
      }
      continue;
    }

    // INCLUDE directive: $INCLUDE <path>
    if ((match = cleanedLine.match(/^\$INCLUDE\s+(.*)/))) {
      includePaths.push(match[1]);
      continue;
    }

    // Unrecognized line.
    // console.warn(`Unrecognized dictionary line: "${rawLine}" (cleaned: "${cleanedLine}")`);
  }

  return includePaths;
};

/**
 * Resets the loaded dictionary schema, clearing all attribute and vendor definitions.
 * This effectively unloads all dictionaries and sets the state back to uninitialized.
 */
ProtocolCore.resetSchemaProcessor = function() {
  attributeSchemaDefinitions = {};
  vendorIdentifierMap = {};
  schemaLoadingStatus = SchemaLoadState.UNINITIALIZED;
};

/**
 * Retrieves the numerical ID for a given attribute name.
 * @param {string} attributeName - The name of the attribute.
 * @param {number} [vendorIdentifier=DEFAULT_VENDOR_KEY] - The ID of the vendor.
 * @returns {number|undefined} The attribute ID, or undefined if not found.
 */
ProtocolCore.getAttributeId = function(attributeName, vendorIdentifier = DEFAULT_VENDOR_KEY) {
  return this._retrieveAttributeProperty(attributeName, vendorIdentifier, SCHEMA_FIELD_ID);
};

/**
 * Retrieves the name for a given attribute ID.
 * @param {number} attributeId - The ID of the attribute.
 * @param {number} [vendorIdentifier=DEFAULT_VENDOR_KEY] - The ID of the vendor.
 * @returns {string|undefined} The attribute name, or undefined if not found.
 */
ProtocolCore.getAttributeName = function(attributeId, vendorIdentifier = DEFAULT_VENDOR_KEY) {
  return this._retrieveAttributeProperty(attributeId, vendorIdentifier, SCHEMA_FIELD_NAME);
};

/**
 * Retrieves the numerical ID for a given vendor name.
 * @param {string} vendorName - The name of the vendor.
 * @returns {number|undefined} The vendor ID, or undefined if not found.
 */
ProtocolCore.getVendorId = function(vendorName) {
  return vendorIdentifierMap[vendorName];
};

/**
 * Internal helper to retrieve a specific property of an attribute definition.
 * @param {string|number} attributeRef - The attribute name or ID.
 * @param {number} vendorIdentifier - The ID of the vendor.
 * @param {number} targetField - The index of the desired field (e.g., SCHEMA_FIELD_ID).
 * @returns {*} The requested attribute property, or undefined if not found.
 */
ProtocolCore._retrieveAttributeProperty = function(attributeRef, vendorIdentifier, targetField) {
  if (vendorIdentifier === undefined) {
    vendorIdentifier = DEFAULT_VENDOR_KEY;
  }

  const vendorSchema = attributeSchemaDefinitions[vendorIdentifier];
  if (!vendorSchema) {
    return undefined;
  }

  const attributeInfo = vendorSchema[attributeRef];
  if (!attributeInfo) {
    return undefined;
  }

  return attributeInfo[targetField];
};

// Mappings for RADIUS packet codes and their properties.
const packetTypeIdentifierMap = {
  1: "Access-Request", 2: "Access-Accept", 3: "Access-Reject", 4: "Accounting-Request",
  5: "Accounting-Response", 6: "Interim-Accounting", 7: "Password-Request", 8: "Password-Ack",
  9: "Password-Reject", 10: "Accounting-Message", 11: "Access-Challenge", 12: "Status-Server",
  13: "Status-Client", 21: "Resource-Free-Request", 22: "Resource-Free-Response",
  23: "Resource-Query-Request", 24: "Resource-Query-Response",
  25: "Alternate-Resource-Reclaim-Request", 26: "NAS-Reboot-Request",
  27: "NAS-Reboot-Response", 29: "Next-Passcode", 30: "New-Pin", 31: "Terminate-Session",
  32: "Password-Expired", 33: "Event-Request", 34: "Event-Response", 40: "Disconnect-Request",
  41: "Disconnect-ACK", 42: "Disconnect-NAK", 43: "CoA-Request", 44: "CoA-ACK", 45: "CoA-NAK",
  50: "IP-Address-Allocate", 51: "IP-Address-Release"
};

// Packet types that use a random authenticator (not derived from request+secret).
const packetTypeRequiresRandomAuth = {
  "Access-Request": true,
  "Status-Server": true
};

// Packet types that are considered requests. Populated dynamically.
const isPacketTypeRequest = {};

// Reverse mapping for packet names to their numerical codes.
const packetTypeIdentifierReverseMap = {};

// Initialize reverse map and identify request types.
Object.entries(packetTypeIdentifierMap).forEach(([code, name]) => {
  packetTypeIdentifierReverseMap[name] = parseInt(code, 10);
  if (name.includes("Request") || name.includes("Challenge")) { // Challenge is also a request type.
    isPacketTypeRequest[name] = true;
  }
});

/**
 * Throws a processing error, optionally wrapping it in an Error object.
 * @param {string|Error} errorInput - The error message or an Error object.
 * @throws {Error} The processed error.
 */
ProtocolCore._throwProcessingError = function(errorInput) {
  if (errorInput instanceof Error) {
    throw errorInput;
  }
  throw new Error(errorInput);
};

/**
 * Convenience method to decode a packet when the shared secret is not available or not needed.
 * This is useful for initial parsing or when only public attributes are of interest.
 * @param {object} decodeOptions - Options for decoding, similar to `decodePacket`.
 * @returns {object} The decoded packet object.
 */
ProtocolCore.decodePacketWithoutKey = function(decodeOptions) {
  // Create a new options object to avoid modifying the original.
  const modifiedOptions = { ...decodeOptions,
    noSecret: true
  };
  return this.decodePacket(modifiedOptions);
};

/**
 * Decodes a raw RADIUS packet Buffer into a structured JavaScript object.
 * @param {object} decodeArguments - An object containing decoding parameters.
 * @param {Buffer} decodeArguments.packet - The raw RADIUS packet as a Buffer.
 * @param {string} [decodeArguments.secret] - The shared secret for authentication.
 * @param {boolean} [decodeArguments.noSecret=false] - If true, skips secret-based authentications.
 * @returns {object} A structured object representing the decoded RADIUS packet.
 * @throws {Error|SharedSecretMismatchError} If packet is invalid or authentication fails.
 */
ProtocolCore.decodePacket = function(decodeArguments) {
  this.initializeSchemaProcessor();

  const rawPacketBuffer = decodeArguments.packet;
  const sharedSecret = decodeArguments.secret;
  const skipSecretChecks = decodeArguments.noSecret || false;

  // Validate basic packet structure.
  if (!Buffer.isBuffer(rawPacketBuffer) || rawPacketBuffer.length < AUTHENTICATOR_OFFSET_END) {
    this._throwProcessingError("decodePacket: Provided packet is too short or not a Buffer.");
  }

  const decodedResult = {};

  // Read header fields.
  const packetCodeNum = rawPacketBuffer.readUInt8(0);
  decodedResult.code = packetTypeIdentifierMap[packetCodeNum];

  if (!decodedResult.code) {
    this._throwProcessingError(`decodePacket: Invalid or unknown packet code '${packetCodeNum}'.`);
  }

  decodedResult.identifier = rawPacketBuffer.readUInt8(1);
  decodedResult.length = rawPacketBuffer.readUInt16BE(2);

  // Validate packet length.
  if (rawPacketBuffer.length < decodedResult.length) {
    this._throwProcessingError("decodePacket: Incomplete packet (actual length less than declared length).");
  }

  // Extract authenticator.
  decodedResult.authenticator = rawPacketBuffer.slice(AUTHENTICATOR_OFFSET_START, AUTHENTICATOR_OFFSET_END);

  // Attributes section starts after the authenticator.
  const attributeDataSegment = rawPacketBuffer.slice(AUTHENTICATOR_OFFSET_END, decodedResult.length);
  decodedResult.attributes = {}; // Attributes parsed into a hash map.
  decodedResult.rawAttributes = []; // Attributes as an array of [type, value] buffers.

  try {
    this.extractPacketAttributes(attributeDataSegment, decodedResult.attributes, DEFAULT_VENDOR_KEY, decodedResult.rawAttributes);
  } catch (err) {
    this._throwProcessingError(err);
  }

  // Perform packet authenticator verification for non-random authenticators and request types.
  const isRandomAuthenticator = packetTypeRequiresRandomAuth[decodedResult.code];
  const isRequest = isPacketTypeRequest[decodedResult.code];

  if (!isRandomAuthenticator && isRequest && !skipSecretChecks) {
    if (!sharedSecret) {
      this._throwProcessingError("decodePacket: Shared secret is required for authenticator validation of this packet type.");
    }

    // Temporarily zero out authenticator for checksum calculation.
    const authenticatorCopy = Buffer.from(rawPacketBuffer); // Create a mutable copy.
    const originalAuthenticatorValue = Buffer.from(authenticatorCopy.slice(AUTHENTICATOR_OFFSET_START, AUTHENTICATOR_OFFSET_END));
    authenticatorCopy.fill(0, AUTHENTICATOR_OFFSET_START, AUTHENTICATOR_OFFSET_END);

    const calculatedChecksum = this._computeAuthenticatorHash(authenticatorCopy, sharedSecret);

    // Restore authenticator in the copy (though not strictly necessary as we use the original buffer for decodedResult).
    originalAuthenticatorValue.copy(authenticatorCopy, AUTHENTICATOR_OFFSET_START);

    if (calculatedChecksum.toString('hex') !== decodedResult.authenticator.toString('hex')) {
      this._throwProcessingError(new ProtocolCore.SharedSecretMismatchError(
        "decodePacket: Packet Authenticator mismatch. Possible incorrect shared secret.",
        decodedResult
      ));
    }
  }

  // Verify Message-Authenticator attribute if present in a request packet.
  if (isRequest && decodedResult.attributes["Message-Authenticator"] && !skipSecretChecks) {
    if (!sharedSecret) {
      this._throwProcessingError("decodePacket: Shared secret is required for Message-Authenticator validation.");
    }
    this._validateIncomingMessageAuthenticator(
      {
        secret: sharedSecret,
        identifier: decodedResult.identifier,
        code: decodedResult.code
      },
      decodedResult
    );
  }

  return decodedResult;
};

/**
 * Creates a new array of raw attributes with the Message-Authenticator field zeroed out.
 * This is necessary for Message-Authenticator hash calculation.
 * @param {Array<[number, Buffer]>} rawAttributeList - The original list of raw attributes.
 * @returns {Array<[number, Buffer]>} A new array with Message-Authenticator zeroed.
 */
ProtocolCore.zeroOutMessageAuthenticatorField = function(rawAttributeList) {
  const messageAuthId = this.getAttributeId("Message-Authenticator");
  if (messageAuthId === undefined) {
    // Message-Authenticator attribute definition not found, return original.
    // This case should ideally not happen if dictionaries are correctly loaded.
    return rawAttributeList;
  }

  const modifiedAttributeList = rawAttributeList.map(attr => {
    if (attr[0] === messageAuthId) {
      const zeroedBuffer = Buffer.alloc(MESSAGE_AUTHENTICATOR_BYTE_SIZE, 0x00);
      return [messageAuthId, zeroedBuffer];
    }
    return attr;
  });
  return modifiedAttributeList;
};

/**
 * Internal method to verify the Message-Authenticator attribute in a request packet.
 * @param {object} requestOptions - Options for re-encoding the request (secret, identifier, code).
 * @param {object} parsedRequestPacket - The already parsed request packet object.
 * @throws {SharedSecretMismatchError} If the Message-Authenticator hash does not match.
 */
ProtocolCore._validateIncomingMessageAuthenticator = function(requestOptions, parsedRequestPacket) {
  // Re-encode the packet with the Message-Authenticator field zeroed out.
  // This requires a simplified `encode` function or direct buffer manipulation.
  // For Type III, we'll assume a basic `encode` exists or simulate its effect.
  // NOTE: A full `encode` function is not provided in the original extract,
  // so this part is adapted to simulate the required buffer for hashing.

  // Simulate re-encoding:
  // 1. Get the raw attributes with Message-Authenticator zeroed.
  const attributesForHashing = this.zeroOutMessageAuthenticatorField(parsedRequestPacket.rawAttributes);

  // 2. Build a buffer from the packet header and these attributes.
  // This is a simplified representation of `encode` for the purpose of hashing.
  const headerBuf = Buffer.alloc(AUTHENTICATOR_OFFSET_END);
  headerBuf.writeUInt8(packetTypeIdentifierReverseMap[parsedRequestPacket.code], 0);
  headerBuf.writeUInt8(parsedRequestPacket.identifier, 1);
  // Length will be filled later after attributes are serialized.
  // Authenticator will be copied from the original request.

  let attributesBufferArray = [];
  for (const [attrType, attrValueBuffer] of attributesForHashing) {
    const attrLen = attrValueBuffer.length + 2; // Type + Length + Value
    const attrBuf = Buffer.alloc(attrLen);
    attrBuf.writeUInt8(attrType, 0);
    attrBuf.writeUInt8(attrLen, 1);
    attrValueBuffer.copy(attrBuf, 2);
    attributesBufferArray.push(attrBuf);
  }
  const attributesCombinedBuffer = Buffer.concat(attributesBufferArray);

  const totalLength = headerBuf.length + attributesCombinedBuffer.length;
  headerBuf.writeUInt16BE(totalLength, 2); // Write total length into header.

  const reencodedPacketForHash = Buffer.concat([headerBuf, attributesCombinedBuffer]);

  // Copy the original packet's authenticator into the re-encoded buffer at the correct position.
  // This authenticator is part of the data hashed for Message-Authenticator.
  parsedRequestPacket.authenticator.copy(reencodedPacketForHash, AUTHENTICATOR_OFFSET_START);

  const originalMessageAuthenticator = parsedRequestPacket.attributes["Message-Authenticator"];
  if (!originalMessageAuthenticator) {
    this._throwProcessingError(new ProtocolCore.SharedSecretMismatchError(
      "decodePacket: Request packet claims Message-Authenticator but attribute not found.",
      parsedRequestPacket
    ));
  }

  const expectedMessageAuthenticator = this._computeMessageAuthHash(reencodedPacketForHash, requestOptions.secret);

  if (originalMessageAuthenticator.toString('hex') !== expectedMessageAuthenticator.toString('hex')) {
    this._throwProcessingError(new ProtocolCore.SharedSecretMismatchError(
      "decodePacket: Message-Authenticator mismatch. Possible incorrect shared secret or malformed packet.",
      parsedRequestPacket
    ));
  }
};

/**
 * Validates a RADIUS response packet against its corresponding request packet.
 * This involves checking both the packet authenticator and the Message-Authenticator (if present).
 * @param {object} validationArguments - Arguments for validation.
 * @param {Buffer} validationArguments.request - The raw request packet buffer.
 * @param {Buffer} validationArguments.response - The raw response packet buffer.
 * @param {string} validationArguments.secret - The shared secret.
 * @returns {boolean} True if the response is valid, false otherwise.
 * @throws {Error} If arguments are invalid or secret is missing.
 */
ProtocolCore.validateResponsePacket = function(validationArguments) {
  this.initializeSchemaProcessor();

  const {
    request: rawRequestBuffer,
    response: rawResponseBuffer,
    secret: sharedSecret
  } = validationArguments;

  if (!rawRequestBuffer || !Buffer.isBuffer(rawRequestBuffer) ||
    !rawResponseBuffer || !Buffer.isBuffer(rawResponseBuffer)) {
    this._throwProcessingError("validateResponsePacket: Must provide valid raw request and response packet buffers.");
  }

  if (!sharedSecret) {
    this._throwProcessingError("validateResponsePacket: Shared secret must be specified for response validation.");
  }

  // 1. Verify Packet Authenticator.
  const responseAuthenticator = rawResponseBuffer.slice(AUTHENTICATOR_OFFSET_START, AUTHENTICATOR_OFFSET_END);
  const requestAuthenticator = rawRequestBuffer.slice(AUTHENTICATOR_OFFSET_START, AUTHENTICATOR_OFFSET_END);

  // Create a mutable copy of the response buffer for hashing.
  const responseForHashing = Buffer.from(rawResponseBuffer);

  // Replace response authenticator with request authenticator for checksum calculation.
  requestAuthenticator.copy(responseForHashing, AUTHENTICATOR_OFFSET_START);

  const expectedAuthenticatorHash = this._computeAuthenticatorHash(responseForHashing, sharedSecret);

  if (expectedAuthenticatorHash.toString('hex') !== responseAuthenticator.toString('hex')) {
    return false; // Packet Authenticator mismatch.
  }

  // 2. If packet authenticator matches, proceed to Message-Authenticator check.
  return this._performResponseAuthVerification({
    request: rawRequestBuffer,
    response: rawResponseBuffer,
    secret: sharedSecret
  });
};

/**
 * Internal method to perform Message-Authenticator verification for response packets.
 * @param {object} validationArguments - Arguments including raw request, response, and secret.
 * @returns {boolean} True if Message-Authenticator is valid or not present, false if mismatch.
 */
ProtocolCore._performResponseAuthVerification = function(validationArguments) {
  const {
    request: rawRequestBuffer,
    response: rawResponseBuffer,
    secret: sharedSecret
  } = validationArguments;

  // First, parse the request packet to get its context.
  const parsedRequest = this.decodePacket({
    packet: rawRequestBuffer,
    secret: sharedSecret
  });

  // If the original request had a Message-Authenticator, the response might also.
  if (parsedRequest.attributes["Message-Authenticator"]) {
    // Parse the response packet.
    const parsedResponse = this.decodePacket({
      packet: rawResponseBuffer,
      secret: sharedSecret
    });

    const receivedMessageAuthenticator = parsedResponse.attributes["Message-Authenticator"];
    if (!receivedMessageAuthenticator) {
      // If request had MA, but response doesn't, it's a failure.
      return false;
    }

    // Re-encode the response packet (with MA zeroed) for hash calculation.
    // Similar to request MA verification, we need to simulate encoding.
    // NOTE: A full `encode` function is not provided in the original extract.

    const zeroedResponseAttributes = this.zeroOutMessageAuthenticatorField(parsedResponse.rawAttributes);

    const responseHeaderBuf = Buffer.alloc(AUTHENTICATOR_OFFSET_END);
    responseHeaderBuf.writeUInt8(packetTypeIdentifierReverseMap[parsedResponse.code], 0);
    responseHeaderBuf.writeUInt8(parsedResponse.identifier, 1);
    // Length will be filled later.

    let responseAttributesBufferArray = [];
    for (const [attrType, attrValueBuffer] of zeroedResponseAttributes) {
      const attrLen = attrValueBuffer.length + 2;
      const attrBuf = Buffer.alloc(attrLen);
      attrBuf.writeUInt8(attrType, 0);
      attrBuf.writeUInt8(attrLen, 1);
      attrValueBuffer.copy(attrBuf, 2);
      responseAttributesBufferArray.push(attrBuf);
    }
    const responseAttributesCombinedBuffer = Buffer.concat(responseAttributesBufferArray);

    const totalResponseLength = responseHeaderBuf.length + responseAttributesCombinedBuffer.length;
    responseHeaderBuf.writeUInt16BE(totalResponseLength, 2);

    const reencodedResponseForHash = Buffer.concat([responseHeaderBuf, responseAttributesCombinedBuffer]);

    // The authenticator for response MA calculation is the *request's* authenticator.
    parsedRequest.authenticator.copy(reencodedResponseForHash, AUTHENTICATOR_OFFSET_START);

    const expectedMessageAuthenticator = this._computeMessageAuthHash(reencodedResponseForHash, sharedSecret);

    if (receivedMessageAuthenticator.toString('hex') !== expectedMessageAuthenticator.toString('hex')) {
      return false; // Message-Authenticator mismatch.
    }
  }

  return true; // All checks passed, or no Message-Authenticator to check.
};

/**
 * Parses a buffer containing RADIUS attributes (TLV format) and populates
 * a hash map and a raw array of attributes.
 * @param {Buffer} attributeDataSegment - The buffer containing the raw attribute data.
 * @param {object} parsedAttributesMap - Object to populate with decoded attributes (name -> value).
 * @param {number} [currentVendorId=DEFAULT_VENDOR_KEY] - The current vendor ID context.
 * @param {Array<[number, Buffer]>} [rawAttributesList] - Optional array to populate with raw [type, value] buffers.
 */
ProtocolCore.extractPacketAttributes = function(attributeDataSegment, parsedAttributesMap, currentVendorId = DEFAULT_VENDOR_KEY, rawAttributesList) {
  let remainingData = attributeDataSegment;

  while (remainingData.length > 0) {
    if (remainingData.length < 2) {
      // Not enough bytes for Type and Length.
      console.warn("extractPacketAttributes: Remaining data too short for attribute header.");
      break;
    }

    const attributeType = remainingData.readUInt8(0);
    const attributeLength = remainingData.readUInt8(1);

    if (attributeLength < 2 || remainingData.length < attributeLength) {
      // Invalid length or insufficient data for this attribute.
      console.warn(`extractPacketAttributes: Malformed attribute (type: ${attributeType}, declared length: ${attributeLength}, actual remaining: ${remainingData.length}). Skipping.`);
      break;
    }

    let attributeValueBuffer = remainingData.slice(2, attributeLength);

    if (rawAttributesList) {
      rawAttributesList.push([attributeType, Buffer.from(attributeValueBuffer)]); // Store a copy.
    }

    remainingData = remainingData.slice(attributeLength); // Move to the next attribute.

    const attrSchemaEntry = attributeSchemaDefinitions[currentVendorId] && attributeSchemaDefinitions[currentVendorId][attributeType];
    if (!attrSchemaEntry) {
      // Attribute definition not found for this vendor/type. Store as raw buffer.
      // console.warn(`extractPacketAttributes: Unknown attribute type ${attributeType} for vendor ${currentVendorId}.`);
      continue;
    }

    const attrName = attrSchemaEntry[SCHEMA_FIELD_NAME];
    const attrTypeDefinition = attrSchemaEntry[SCHEMA_FIELD_TYPE];
    const attrModifiers = attrSchemaEntry[SCHEMA_FIELD_FLAGS];
    const attrEnumMap = attrSchemaEntry[SCHEMA_FIELD_ENUM_MAP];

    let processedValue = attributeValueBuffer;
    let attributeTag;

    // Handle 'has_tag' modifier.
    if (attrModifiers["has_tag"] && attributeValueBuffer.length > 0) {
      const firstByte = attributeValueBuffer.readUInt8(0);
      if (firstByte <= 0x1F) { // Tags are typically 1-31.
        attributeTag = firstByte;
        processedValue = attributeValueBuffer.slice(1); // Tag removed from value.
      }
    }

    // Handle 'encrypt=1' modifier. (Dummy implementation as original had no `decrypt_field`)
    if (attrModifiers["encrypt=1"]) {
      // In a real implementation, this would call a decryption function.
      // For Type III clone, we can just acknowledge it or provide a placeholder.
      processedValue = this._decryptAttributeValue(processedValue);
    } else {
      // Convert value based on its defined type.
      switch (attrTypeDefinition) {
        case "string":
        case "text":
          processedValue = processedValue.toString("utf8");
          break;
        case "ipaddr":
          processedValue = Array.from(processedValue).join(".");
          break;
        case "date":
          // RADIUS date is 32-bit unsigned integer (seconds since 00:00:00 UTC, Jan 1, 1970).
          if (processedValue.length >= 4) {
            processedValue = new Date(processedValue.readUInt32BE(0) * 1000);
          } else {
            console.warn(`extractPacketAttributes: Malformed date attribute value for ${attrName}.`);
            processedValue = processedValue.toString('hex'); // Fallback to hex.
          }
          break;
        case "time": // Time-of-day in seconds.
        case "integer":
          if (processedValue.length >= 4) {
            // If `has_tag` was applied, it might have shifted the bytes for integer parsing.
            // Original code had a special buf copy for `has_tag` and integer.
            // Replicating that specific behavior for Type III.
            let integerValueBuffer = processedValue;
            if (attrModifiers["has_tag"] && processedValue.length === 3) {
                // If tag was present and value was 3 bytes, it implies original 4-byte integer.
                // Pad with a leading zero byte.
                const tempBuf = Buffer.alloc(4);
                processedValue.copy(tempBuf, 1);
                integerValueBuffer = tempBuf;
            } else if (processedValue.length < 4) {
                 // Pad with leading zeros if less than 4 bytes for integer.
                const tempBuf = Buffer.alloc(4);
                processedValue.copy(tempBuf, 4 - processedValue.length);
                integerValueBuffer = tempBuf;
            }

            let numericValue = integerValueBuffer.readUInt32BE(0);
            processedValue = attrEnumMap[numericValue] || numericValue;
          } else {
            console.warn(`extractPacketAttributes: Malformed integer/time attribute value for ${attrName}.`);
            processedValue = processedValue.toString('hex'); // Fallback to hex.
          }
          break;
        // Add more attribute type handlers as needed (e.g., "ipv6addr", "bytes", "vs_string", etc.)
        default:
          // For unknown types or types not explicitly handled, keep as Buffer or convert to hex string.
          processedValue = processedValue.toString('hex');
          break;
      }
    }

    // Store the processed attribute value.
    if (parsedAttributesMap[attrName]) {
      // If multiple attributes with the same name, store as an array.
      if (!Array.isArray(parsedAttributesMap[attrName])) {
        parsedAttributesMap[attrName] = [parsedAttributesMap[attrName]];
      }
      parsedAttributesMap[attrName].push(processedValue);
    } else {
      parsedAttributesMap[attrName] = processedValue;
    }
  }
};

/**
 * Internal dummy function for decrypting attribute values.
 * In a real scenario, this would implement a specific decryption algorithm
 * based on RADIUS encryption standards (e.g., EAP-Message, User-Password).
 * @param {Buffer} encryptedValue - The buffer containing the encrypted attribute value.
 * @returns {Buffer} The (dummy) decrypted value.
 */
ProtocolCore._decryptAttributeValue = function(encryptedValue) {
  // Placeholder: In a real implementation, this would involve crypto.
  // For Type III, we acknowledge its existence without full implementation.
  // Example: XOR with shared secret, or more complex EAP-Message decryption.
  console.warn("Attempted to decrypt attribute value. This is a placeholder function.");
  return encryptedValue; // Return as-is for now.
};

/**
 * Calculates the MD5 hash for the RADIUS packet authenticator.
 * @param {Buffer} packetBuffer - The entire packet buffer (with authenticator potentially zeroed).
 * @param {string} secret - The shared secret.
 * @returns {Buffer} The 16-byte MD5 hash.
 */
ProtocolCore._computeAuthenticatorHash = function(packetBuffer, secret) {
  return cryptographyModule.createHash("md5")
    .update(packetBuffer.slice(0, packetBuffer.length)) // Hash entire packet (up to its declared length).
    .update(secret)
    .digest();
};

/**
 * Calculates the HMAC-MD5 hash for the Message-Authenticator attribute.
 * @param {Buffer} packetBuffer - The entire packet buffer (with Message-Authenticator zeroed).
 * @param {string} secret - The shared secret.
 * @returns {Buffer} The 16-byte HMAC-MD5 hash.
 */
ProtocolCore._computeMessageAuthHash = function(packetBuffer, secret) {
  return cryptographyModule.createHmac("md5", secret)
    .update(packetBuffer.slice(0, packetBuffer.length)) // Hash entire packet (up to its declared length).
    .digest();
};

module.exports = ProtocolCore;