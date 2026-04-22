let fileSys = require("fs");
let utilLib = require("util");
let cryptUtil = require("crypto");
let filePath = require("path");

// Core object for authentication and packet handling
const Authenticator = {};

// Mapping storage for attribute details and vendor names
let metadataStore = {}, vendorIdentifierMap = {};
// Locations where configuration dictionaries are found
let configSources = [filePath.normalize(__dirname + "/../dictionaries")];

// Status indicators for configuration loading
const STATE_INITIAL = 1;
const STATE_PROCESSING = 2;
const STATE_READY = 3;

// Current state of configuration dictionaries
let configStatus = STATE_INITIAL;

// Constant for no specific vendor
const VENDOR_NONE = -1;

// Indices for attribute metadata array
const META_IDENTIFIER = 0;
const META_LABEL = 1;
const META_KIND = 2;
const META_ENUMERATIONS = 3;
const META_REVERSE_ENUMERATIONS = 4;
const META_QUALIFIERS = 5;

// Packet authenticator field boundaries
const CHECK_START_POS = 4;
const CHECK_END_POS = 20;
const CHECK_LENGTH = 16;
// Length for message integrity checker
const MSG_CHECK_LEN = 16;

// Custom error for credential mismatches
Authenticator.BadCredentialError = function(errorMessage, parsedData, constructorRef) {
  Error.captureStackTrace(this, constructorRef || this);
  this.message = errorMessage || 'Processing Error';
  this.parsedData = parsedData;
};
utilLib.inherits(Authenticator.BadCredentialError, Error);
Authenticator.BadCredentialError.prototype.name = 'Bad Credential Error';

// Adds a new location to search for configuration files
Authenticator.addConfigurationSource = function(cfgPath) {
  configSources.push(filePath.resolve(cfgPath));
};

let configLoadCallbacks = []; // Unused in original, keeping for structure
// Initiates the loading of all configuration dictionaries
Authenticator.initializeConfigurations = function() {
  const instance = this;

  if (configStatus === STATE_READY) {
    return; // Already loaded, nothing to do
  }

  // Iterate through all specified configuration locations
  configSources.forEach(function(cfgPath) {
    if (!fileSys.existsSync(cfgPath)) {
      throw new Error("Invalid configuration location specified: " + cfgPath);
    }

    // Check if the path is a directory or a single file
    if (fileSys.statSync(cfgPath).isDirectory()) {
      const subFiles = fileSys.readdirSync(cfgPath);
      for (let idx = 0; idx < subFiles.length; idx++) {
        instance.processConfigurationFile(cfgPath + filePath.sep + subFiles[idx]);
      }
    } else {
      instance.processConfigurationFile(cfgPath);
    }
  });

  configStatus = STATE_READY; // Mark as loaded
};

// Processes a single configuration file
Authenticator.processConfigurationFile = function(cfgPath, processedPaths) {
  cfgPath = filePath.normalize(cfgPath);
  const instance = this;

  if (processedPaths === undefined) {
    processedPaths = {};
  }

  if (processedPaths[cfgPath]) {
    return; // File already processed
  }

  processedPaths[cfgPath] = true; // Mark as processed

  // Parse file content and handle includes
  const includedFiles = instance._parseConfigurationContent(fileSys.readFileSync(cfgPath, "ascii"));
  includedFiles.forEach(function (incFile) {
    instance.processConfigurationFile(filePath.join(filePath.dirname(cfgPath), incFile), processedPaths);
  });
};

// Internal method to parse the content of a configuration file
Authenticator._parseConfigurationContent = function(fileContent) {
  const contentLines = fileContent.split("\n");

  let currentVendor = VENDOR_NONE, includedFiles = [], attributeVendor;
  for (let lineIndex = 0; lineIndex < contentLines.length; lineIndex++) {
    let currentLine = contentLines[lineIndex];

    // Clean up comments and excessive whitespace
    currentLine = currentLine.replace(/#.*/, "").replace(/\s+/g, " ");

    // Handle VENDOR definition lines
    let lineMatch = currentLine.match(/^\s*VENDOR\s+(\S+)\s+(\d+)/);
    if (lineMatch) {
      vendorIdentifierMap[lineMatch[1]] = lineMatch[2];
      continue;
    }

    // Handle BEGIN-VENDOR block
    if ((lineMatch = currentLine.match(/^\s*BEGIN-VENDOR\s+(\S+)/))) {
      currentVendor = vendorIdentifierMap[lineMatch[1]];
      continue;
    }

    // Handle END-VENDOR block
    if (currentLine.match(/^\s*END-VENDOR/)) {
      currentVendor = VENDOR_NONE;
      continue;
    }

    // Helper to ensure attribute entry exists
    const initializeEntry = function(vendorId, attributeId) {
      if (!metadataStore[vendorId]) {
        metadataStore[vendorId] = {};
      }

      if (!metadataStore[vendorId][attributeId]) {
        metadataStore[vendorId][attributeId] = [null, null, null, {}, {}, {}];
      }
    };

    // Handle ATTRIBUTE and VENDORATTR definitions
    lineMatch = currentLine.match(/^\s*(?:VENDORATTR\s+(\d+)|ATTRIBUTE)\s+(\S+)\s+(\d+)\s+(\S+)\s*(.+)?/);
    if (lineMatch) {
      attributeVendor = currentVendor;
      if (lineMatch[1] !== undefined) {
        attributeVendor = lineMatch[1];
      }

      const attributeQualifiers = {};
      if (lineMatch[5] !== undefined) {
        lineMatch[5].replace(/\s*/g, "").split(",").forEach(function(modifierName) {
          attributeQualifiers[modifierName] = true;
        });
      }

      initializeEntry(attributeVendor, lineMatch[3]);

      metadataStore[attributeVendor][lineMatch[3]][META_IDENTIFIER] = lineMatch[3];
      metadataStore[attributeVendor][lineMatch[3]][META_LABEL] = lineMatch[2];
      metadataStore[attributeVendor][lineMatch[3]][META_KIND] = lineMatch[4];
      metadataStore[attributeVendor][lineMatch[3]][META_QUALIFIERS] = attributeQualifiers;

      // Copy enumerations if an attribute with the same name already exists
      const entryByName = metadataStore[attributeVendor][lineMatch[2]];
      if (entryByName !== undefined) {
        const entryById = metadataStore[attributeVendor][lineMatch[3]];
        [META_ENUMERATIONS, META_REVERSE_ENUMERATIONS].forEach(function(enumField) {
          for (const enumName in entryByName[enumField]) {
            entryById[enumField][enumName] = entryByName[enumField][enumName];
          }
        });
      }
      metadataStore[attributeVendor][lineMatch[2]] = metadataStore[attributeVendor][lineMatch[3]];

      continue;
    }

    // Handle VALUE and VENDORVALUE definitions (enumerations)
    lineMatch = currentLine.match(/^\s*(?:VENDOR)?VALUE\s+(\d+)?\s*(\S+)\s+(\S+)\s+(\d+)/);
    if (lineMatch) {
      attributeVendor = currentVendor;
      if (lineMatch[1] !== undefined) {
        attributeVendor = lineMatch[1];
      }

      initializeEntry(attributeVendor, lineMatch[2]);

      metadataStore[attributeVendor][lineMatch[2]][META_ENUMERATIONS][lineMatch[4]] = lineMatch[3];
      metadataStore[attributeVendor][lineMatch[2]][META_REVERSE_ENUMERATIONS][lineMatch[3]] = lineMatch[4];

      continue;
    }

    // Handle $INCLUDE directives
    if ((lineMatch = currentLine.match(/^\s*\$INCLUDE\s+(.*)/))) {
      includedFiles.push(lineMatch[1]);
    }
  }

  return includedFiles;
};

// Resets all loaded configuration data
Authenticator.clearConfigurations = function() {
  metadataStore = {};
  vendorIdentifierMap = {};
  configStatus = STATE_INITIAL;
};

// Retrieves attribute ID by name for a given vendor
Authenticator.attributeNameToId = function(attrLabel, vendorId) {
  return this._getAttributeDetail(attrLabel, vendorId, META_IDENTIFIER);
};

// Retrieves attribute name by ID for a given vendor
Authenticator.attributeIdToName = function(attrLabel, vendorId) {
  return this._getAttributeDetail(attrLabel, vendorId, META_LABEL);
};

// Retrieves vendor ID by vendor name
Authenticator.getVendorIdByName = function(vendorName) {
  return vendorIdentifierMap[vendorName];
};

// Internal utility to fetch specific attribute details
Authenticator._getAttributeDetail = function(attribute, vendorId, targetField) {
  if (vendorId === undefined) {
    vendorId = VENDOR_NONE;
  }

  if (!metadataStore[vendorId]) {
    return;
  }

  const attributeDetails = metadataStore[vendorId][attribute];
  if (!attributeDetails) {
    return;
  }

  return attributeDetails[targetField];
};

// Maps packet codes to descriptive names
let packetCodeMappings = {
  1: "Access-Request",
  2: "Access-Accept",
  3: "Access-Reject",
  4: "Accounting-Request",
  5: "Accounting-Response",
  6: "Interim-Accounting",
  7: "Password-Request",
  8: "Password-Ack",
  9: "Password-Reject",
  10: "Accounting-Message",
  11: "Access-Challenge",
  12: "Status-Server",
  13: "Status-Client",
  21: "Resource-Free-Request",
  22: "Resource-Free-Response",
  23: "Resource-Query-Request",
  24: "Resource-Query-Response",
  25: "Alternate-Resource-Reclaim-Request",
  26: "NAS-Reboot-Request",
  27: "NAS-Reboot-Response",
  29: "Next-Passcode",
  30: "New-Pin",
  31: "Terminate-Session",
  32: "Password-Expired",
  33: "Event-Request",
  34: "Event-Response",
  40: "Disconnect-Request",
  41: "Disconnect-ACK",
  42: "Disconnect-NAK",
  43: "CoA-Request",
  44: "CoA-ACK",
  45: "CoA-NAK",
  50: "IP-Address-Allocate",
  51: "IP-Address-Release"
};

// Indicates if a packet code requires a random authenticator
let randomAuthRequired = {
  "Access-Request": true,
  "Status-Server": true
};

// Identifies request type packet codes
let isRequestType = {
  "Status-Server": true
};

// Generates reverse mappings and updates request type flags
let reversePacketCodeMappings = {};
for (const codeVal in packetCodeMappings) {
  reversePacketCodeMappings[packetCodeMappings[codeVal]] = codeVal;
  if (packetCodeMappings[codeVal].match(/Request/)) {
    isRequestType[packetCodeMappings[codeVal]] = true;
  }
}

// Standardized error throwing function
Authenticator.raiseError = function(errorMessage) {
  let errorObject = errorMessage;
  if (typeof(errorMessage) === 'string') {
    errorObject = new Error(errorMessage);
  }

  throw errorObject;
};

// Convenience method to decode a packet without requiring a shared secret
Authenticator.parseWithoutCredentials = function(inputParams) {
  // Create a new params object to avoid modifying the original
  const newParams = {no_secret: true};
  for (const propName in inputParams) {
    newParams[propName] = inputParams[propName];
  }
  return this.parsePacket(newParams); // Assuming _decode was an internal implementation detail of decode
};

// Decodes a raw packet buffer into a structured object
Authenticator.parsePacket = function(inputParams) {
  this.initializeConfigurations();

  const dataPacket = inputParams.packet;
  if (!dataPacket || dataPacket.length < 4) {
    this.raiseError("parsePacket: packet buffer too short");
    return;
  }

  const resultContainer = {};

  resultContainer.code = packetCodeMappings[dataPacket.readUInt8(0)];

  if (!resultContainer.code) {
    this.raiseError("parsePacket: invalid packet code '" + dataPacket.readUInt8(0) + "'");
    return;
  }

  resultContainer.identifier = dataPacket.readUInt8(1);
  resultContainer.length = dataPacket.readUInt16BE(2);

  if (dataPacket.length < resultContainer.length) {
    this.raiseError("parsePacket: incomplete packet received");
    return;
  }

  this.authenticator = resultContainer.authenticator = dataPacket.slice(CHECK_START_POS, CHECK_END_POS);
  this.no_secret = inputParams.no_secret;
  this.secret = inputParams.secret;

  const attributeData = dataPacket.slice(CHECK_END_POS, resultContainer.length);
  resultContainer.attributes = {};
  resultContainer.raw_attributes = [];

  try {
    this.parseAttributes(attributeData, resultContainer.attributes, VENDOR_NONE, resultContainer.raw_attributes);
  } catch(errorObject) {
    this.raiseError(errorObject);
    return;
  }

  // Validate packet authenticator for non-random requests
  if (!randomAuthRequired[resultContainer.code] && isRequestType[resultContainer.code] && !inputParams.no_secret) {
    const originalChecker = Buffer.alloc(CHECK_LENGTH);
    dataPacket.copy(originalChecker, 0, CHECK_START_POS, CHECK_END_POS);
    dataPacket.fill(0, CHECK_START_POS, CHECK_END_POS);

    const calculatedChecksum = this.computePacketIntegrity(dataPacket, inputParams.secret);
    originalChecker.copy(dataPacket, CHECK_START_POS); // Restore original authenticator

    if (calculatedChecksum.toString() !== this.authenticator.toString()) {
      this.raiseError(new Authenticator.BadCredentialError("parsePacket: integrity checker mismatch (possible shared secret mismatch)", resultContainer));
      return;
    }
  }

  // Validate message authenticator for requests if present
  if (isRequestType[resultContainer.code] && resultContainer.attributes["Message-Authenticator"] && !inputParams.no_secret) {
    this._validateRequestIntegrity(inputParams, resultContainer);
  }

  return resultContainer;
};

// Sets the Message-Authenticator attribute value to zero
Authenticator.nullifyMessageIntegrity = function(attributeList) {
  const ma_id_val = this.attributeNameToId("Message-Authenticator");
  const newAttributeList = attributeList.slice(0);
  for (let idx = 0; idx < newAttributeList.length; idx++) {
    const currentAttr = newAttributeList[idx];
    if (currentAttr[0] === ma_id_val) {
      newAttributeList[idx] = [ma_id_val, Buffer.alloc(MSG_CHECK_LEN)];
      newAttributeList[idx][1].fill(0x00);
      break;
    }
  }
  return newAttributeList;
};

// Verifies the Message-Authenticator for an incoming request
Authenticator._validateRequestIntegrity = function(inputParams, requestPayload) {
  // Re-encode the packet with a zeroed Message-Authenticator to calculate expected value
  const repackedData = this.encode({
    code: requestPayload.code,
    attributes: this.nullifyMessageIntegrity(requestPayload.raw_attributes),
    identifier: requestPayload.identifier,
    secret: inputParams.secret
  });

  // Copy the original authenticator back for integrity calculation
  requestPayload.authenticator.copy(repackedData, CHECK_START_POS);

  const originalMessageIntegrity = requestPayload.attributes["Message-Authenticator"];
  const expectedMessageIntegrity = this.computeMessageIntegrity(repackedData, inputParams.secret);

  if (originalMessageIntegrity.toString() !== expectedMessageIntegrity.toString()) {
    this.raiseError(new Authenticator.BadCredentialError("parsePacket: Message-Authenticator mismatch (possible shared secret mismatch)", requestPayload));
  }
};

// Validates a response packet against its corresponding request
Authenticator.validateResponse = function(inputParams) {
  this.initializeConfigurations();

  if (!inputParams || !Buffer.isBuffer(inputParams.request) || !Buffer.isBuffer(inputParams.response)) {
    this.raiseError("validateResponse: must provide raw request and response packets as buffers");
    return;
  }

  if (inputParams.secret == null) {
    this.raiseError("validateResponse: shared secret must be specified");
    return;
  }

  // First, verify the packet authenticator
  const receivedChecksum = Buffer.alloc(CHECK_LENGTH);
  inputParams.response.copy(receivedChecksum, 0, CHECK_START_POS, CHECK_END_POS);
  inputParams.request.copy(inputParams.response, CHECK_START_POS, CHECK_START_POS, CHECK_END_POS);

  const anticipatedChecksum = this.computePacketIntegrity(inputParams.response, inputParams.secret);
  receivedChecksum.copy(inputParams.response, CHECK_START_POS); // Restore original authenticator

  if (anticipatedChecksum.toString() !== inputParams.response.slice(CHECK_START_POS, CHECK_END_POS).toString()) {
    return false;
  }

  return this._validateResponseIntegrity(inputParams);
};

// Internal method to validate the Message-Authenticator of a response
Authenticator._validateResponseIntegrity = function(inputParams) {
  const decodedRequest = this.parsePacket({
    packet: inputParams.request,
    secret: inputParams.secret
  });

  if (decodedRequest.attributes["Message-Authenticator"]) {
    const decodedResponse = this.parsePacket({
      packet: inputParams.response,
      secret: inputParams.secret
    });

    const receivedMessageIntegrity = decodedResponse.attributes["Message-Authenticator"];
    if (!receivedMessageIntegrity) {
      return false; // Message-Authenticator expected but not found in response
    }

    // Re-encode response with zeroed MA and request authenticator
    const anticipatedResponse = this.encode({
      secret: inputParams.secret,
      code: decodedResponse.code,
      identifier: decodedResponse.identifier,
      attributes: this.nullifyMessageIntegrity(decodedResponse.raw_attributes)
    });
    decodedRequest.authenticator.copy(anticipatedResponse, CHECK_START_POS);
    const expectedMessageIntegrity = this.computeMessageIntegrity(anticipatedResponse, inputParams.secret);

    if (expectedMessageIntegrity.toString() !== receivedMessageIntegrity.toString()) {
      return false;
    }
  }

  return true;
};

// Decodes attributes from a data buffer
Authenticator.parseAttributes = function(attributeData, attributeHash, vendorId, rawAttributeList) {
  let attrType, attrLength, attrValue, attrTag;
  while (attributeData.length > 0) {
    attrType = attributeData.readUInt8(0);
    attrLength = attributeData.readUInt8(1);
    attrValue = attributeData.slice(2, attrLength);

    if (rawAttributeList) {
      rawAttributeList.push([attrType, attrValue]);
    }

    attributeData = attributeData.slice(attrLength);
    const attributeDetails = metadataStore[vendorId] && metadataStore[vendorId][attrType];
    if (!attributeDetails) {
      continue; // No metadata found for this attribute
    }

    // Handle attributes with a tag field
    if (attributeDetails[META_QUALIFIERS]["has_tag"]) {
      const initialByte = attrValue.readUInt8(0);
      if (initialByte <= 0x1F) {
        attrTag = initialByte;
        attrValue = attrValue.slice(1);
      } else {
        attrTag = undefined;
      }
    }

    // Decrypt if specified by modifiers
    if (attributeDetails[META_QUALIFIERS]["encrypt=1"]) {
      attrValue = this.unscrambleField(attrValue); // unscrambleField is not defined in original, keeping as-is.
    } else {
      // Convert value based on its type
      switch (attributeDetails[META_KIND]) {
      case "string":
      case "text":
        // Assumes UTF-8 encoding for text attributes
        attrValue = attrValue.toString("utf8");
        break;
      case "ipaddr":
        const byteParts = [];
        for (let idx = 0; idx < attrValue.length; idx++) {
          byteParts.push(attrValue[idx]);
        }
        attrValue = byteParts.join(".");
        break;
      case "date":
        attrValue = new Date(attrValue.readUInt32BE(0) * 1000);
        break;
      case "time":
      case "integer":
        if (attributeDetails[META_QUALIFIERS]["has_tag"]) {
          const tempBuffer = Buffer.alloc(4);
          attrValue.copy(tempBuffer, 1);
          attrValue = tempBuffer;
        }

        attrValue = attrValue.readUInt32BE(0);
        attrValue = attributeDetails[META_ENUMERATIONS][attrValue] || attrValue;
        // ... (rest of the original code was truncated here, so I'll stop here too)
      }
    }
  }
};