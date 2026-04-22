const fileSystem = require("fs");
const utilityModule = require("util");
const cryptographicModule = require("crypto");
const pathResolver = require("path");

function IntegrityFailure(messageText, receivedData, constructorReference) {
  Error.captureStackTrace(this, constructorReference || this);
  this.message = messageText || 'Data integrity check failed';
  this.received = receivedData;
}
utilityModule.inherits(IntegrityFailure, Error);
IntegrityFailure.prototype.name = 'DataIntegrityFailure';

const ContentLoadState = Object.freeze({
  UNINITIALIZED: Symbol('UNINITIALIZED'),
  IN_PROGRESS: Symbol('IN_PROGRESS'),
  READY: Symbol('READY')
});

const VendorContext = Object.freeze({
  GLOBAL: -1
});

const AttrDefKeys = Object.freeze({
  ID_FIELD: 'id',
  LABEL_FIELD: 'label',
  TYPE_FIELD: 'type',
  ENUM_MAP_FIELD: 'enumerations',
  REVERSE_ENUM_MAP_FIELD: 'reverseEnumerations',
  FLAGS_FIELD: 'flags'
});

const AuthSegment = Object.freeze({
  START_OFFSET: 4,
  END_OFFSET: 20,
  SEGMENT_LENGTH: 16,
  MESSAGE_AUTH_LENGTH: 16
});

const DictPatterns = Object.freeze({
  COMMENT_STRIPPER: /#.*/,
  WHITESPACE_NORMALIZER: /\s+/g,
  VENDOR_DECL: /^\s*VENDOR\s+(\S+)\s+(\d+)/,
  BEGIN_VENDOR_DECL: /^\s*BEGIN-VENDOR\s+(\S+)/,
  END_VENDOR_DECL: /^\s*END-VENDOR/,
  ATTRIBUTE_DECL: /^\s*(?:VENDORATTR\s+(\d+)|ATTRIBUTE)\s+(\S+)\s+(\d+)\s+(\S+)\s*(.+)?/,
  VALUE_DECL: /^\s*(?:VENDOR)?VALUE\s+(\d+)?\s*(\S+)\s+(\S+)\s+(\d+)/,
  INCLUDE_DECL: /^\s*\$INCLUDE\s+(.*)/
});

class ProtocolCore {
  constructor() {
    this._attributeDefinitions = new Map();
    this._vendorNameToCode = new Map();
    this._sourceDirectories = new Set([pathResolver.normalize(__dirname + "/../dictionaries")]);
    this._dictionaryLoadStatus = ContentLoadState.UNINITIALIZED;

    this._packetTypeMap = new Map();
    this._typeCodeMap = new Map();

    this._initializePacketTypes();
  }

  _throwException(message, detail = null, errorType = Error) {
    if (message instanceof Error) {
      throw message;
    }
    const err = new errorType(message);
    if (detail) err.detail = detail;
    throw err;
  }

  registerSource(filePath) {
    this._sourceDirectories.add(pathResolver.resolve(filePath));
  }

  _initializePacketTypes() {
    const typeConfigurations = {
      1: { name: "Access-Request", usesRandomAuth: true, isRequest: true },
      2: { name: "Access-Accept", usesRandomAuth: false, isRequest: false },
      3: { name: "Access-Reject", usesRandomAuth: false, isRequest: false },
      4: { name: "Accounting-Request", usesRandomAuth: false, isRequest: true },
      5: { name: "Accounting-Response", usesRandomAuth: false, isRequest: false },
      6: { name: "Interim-Accounting", usesRandomAuth: false, isRequest: false },
      7: { name: "Password-Request", usesRandomAuth: false, isRequest: true },
      8: { name: "Password-Ack", usesRandomAuth: false, isRequest: false },
      9: { name: "Password-Reject", usesRandomAuth: false, isRequest: false },
      10: { name: "Accounting-Message", usesRandomAuth: false, isRequest: true },
      11: { name: "Access-Challenge", usesRandomAuth: false, isRequest: false },
      12: { name: "Status-Server", usesRandomAuth: true, isRequest: true },
      13: { name: "Status-Client", usesRandomAuth: false, isRequest: false },
      21: { name: "Resource-Free-Request", usesRandomAuth: false, isRequest: true },
      22: { name: "Resource-Free-Response", usesRandomAuth: false, isRequest: false },
      23: { name: "Resource-Query-Request", usesRandomAuth: false, isRequest: true },
      24: { name: "Resource-Query-Response", usesRandomAuth: false, isRequest: false },
      25: { name: "Alternate-Resource-Reclaim-Request", usesRandomAuth: false, isRequest: true },
      26: { name: "NAS-Reboot-Request", usesRandomAuth: false, isRequest: true },
      27: { name: "NAS-Reboot-Response", usesRandomAuth: false, isRequest: false },
      29: { name: "Next-Passcode", usesRandomAuth: false, isRequest: true },
      30: { name: "New-Pin", usesRandomAuth: false, isRequest: true },
      31: { name: "Terminate-Session", usesRandomAuth: false, isRequest: true },
      32: { name: "Password-Expired", usesRandomAuth: false, isRequest: true },
      33: { name: "Event-Request", usesRandomAuth: false, isRequest: true },
      34: { name: "Event-Response", usesRandomAuth: false, isRequest: false },
      40: { name: "Disconnect-Request", usesRandomAuth: false, isRequest: true },
      41: { name: "Disconnect-ACK", usesRandomAuth: false, isRequest: false },
      42: { name: "Disconnect-NAK", usesRandomAuth: false, isRequest: false },
      43: { name: "CoA-Request", usesRandomAuth: false, isRequest: true },
      44: { name: "CoA-ACK", usesRandomAuth: false, isRequest: false },
      45: { name: "CoA-NAK", usesRandomAuth: false, isRequest: false },
      50: { name: "IP-Address-Allocate", usesRandomAuth: false, isRequest: true },
      51: { name: "IP-Address-Release", usesRandomAuth: false, isRequest: true }
    };

    for (const code in typeConfigurations) {
      this._packetTypeMap.set(parseInt(code, 10), typeConfigurations[code]);
      this._typeCodeMap.set(typeConfigurations[code].name, parseInt(code, 10));
    }
  }

  initializeDefinitions() {
    if (this._dictionaryLoadStatus === ContentLoadState.READY) {
      return;
    }
    if (this._dictionaryLoadStatus === ContentLoadState.IN_PROGRESS) {
      return;
    }

    this._dictionaryLoadStatus = ContentLoadState.IN_PROGRESS;

    for (const filePath of this._sourceDirectories) {
      if (!fileSystem.existsSync(filePath)) {
        this._throwException(`Invalid dictionary source location: ${filePath}`);
      }

      const fileStats = fileSystem.statSync(filePath);
      if (fileStats.isDirectory()) {
        const directoryFiles = fileSystem.readdirSync(filePath);
        for (const fileName of directoryFiles) {
          this.processSourceFile(pathResolver.join(filePath, fileName));
        }
      } else {
        this.processSourceFile(filePath);
      }
    }

    this._dictionaryLoadStatus = ContentLoadState.READY;
  }

  processSourceFile(sourcePath, processedFiles = new Set()) {
    const canonicalPath = pathResolver.normalize(sourcePath);

    if (processedFiles.has(canonicalPath)) {
      return;
    }
    processedFiles.add(canonicalPath);

    const fileContent = fileSystem.readFileSync(canonicalPath, "ascii");
    const includedFiles = this._parseDefinitionContent(fileContent, canonicalPath);

    for (const includePath of includedFiles) {
      this.processSourceFile(pathResolver.join(pathResolver.dirname(canonicalPath), includePath), processedFiles);
    }
  }

  _ensureAttributeStorage(vendorIdentifier, attributeIdentifier) {
    if (!this._attributeDefinitions.has(vendorIdentifier)) {
      this._attributeDefinitions.set(vendorIdentifier, new Map());
    }
    const vendorAttrs = this._attributeDefinitions.get(vendorIdentifier);
    if (!vendorAttrs.has(attributeIdentifier)) {
      vendorAttrs.set(attributeIdentifier, {
        [AttrDefKeys.ID_FIELD]: null,
        [AttrDefKeys.LABEL_FIELD]: null,
        [AttrDefKeys.TYPE_FIELD]: null,
        [AttrDefKeys.ENUM_MAP_FIELD]: new Map(),
        [AttrDefKeys.REVERSE_ENUM_MAP_FIELD]: new Map(),
        [AttrDefKeys.FLAGS_FIELD]: new Set()
      });
    }
  }

  _parseDefinitionContent(content, currentFilePath) {
    const lines = content.split(/\r?\n/);
    let currentVendor = VendorContext.GLOBAL;
    const includedFiles = [];

    lines.forEach(line => {
      let processedLine = line.replace(DictPatterns.COMMENT_STRIPPER, "").replace(DictPatterns.WHITESPACE_NORMALIZER, " ").trim();

      if (!processedLine) return;

      let match;

      if ((match = processedLine.match(DictPatterns.VENDOR_DECL))) {
        this._vendorNameToCode.set(match[1], parseInt(match[2], 10));
        return;
      }

      if ((match = processedLine.match(DictPatterns.BEGIN_VENDOR_DECL))) {
        currentVendor = this._vendorNameToCode.get(match[1]);
        if (currentVendor === undefined) {
          this._throwException(`Unknown vendor '${match[1]}' in dictionary file: ${currentFilePath}`);
        }
        return;
      }

      if (processedLine.match(DictPatterns.END_VENDOR_DECL)) {
        currentVendor = VendorContext.GLOBAL;
        return;
      }

      if ((match = processedLine.match(DictPatterns.ATTRIBUTE_DECL))) {
        const attributeVendor = match[1] !== undefined ? parseInt(match[1], 10) : currentVendor;
        const attributeLabel = match[2];
        const attributeCode = parseInt(match[3], 10);
        const attributeKind = match[4];
        const modifierString = match[5];

        const flags = new Set();
        if (modifierString !== undefined) {
          modifierString.replace(/\s*/g, "").split(",").forEach(m => flags.add(m));
        }

        this._ensureAttributeStorage(attributeVendor, attributeCode);
        const attributeDefinition = this._attributeDefinitions.get(attributeVendor).get(attributeCode);

        attributeDefinition[AttrDefKeys.ID_FIELD] = attributeCode;
        attributeDefinition[AttrDefKeys.LABEL_FIELD] = attributeLabel;
        attributeDefinition[AttrDefKeys.TYPE_FIELD] = attributeKind;
        attributeDefinition[AttrDefKeys.FLAGS_FIELD] = flags;

        const existingByName = this._attributeDefinitions.get(attributeVendor).get(attributeLabel);
        if (existingByName) {
          attributeDefinition[AttrDefKeys.ENUM_MAP_FIELD] = new Map(existingByName[AttrDefKeys.ENUM_MAP_FIELD]);
          attributeDefinition[AttrDefKeys.REVERSE_ENUM_MAP_FIELD] = new Map(existingByName[AttrDefKeys.REVERSE_ENUM_MAP_FIELD]);
        }

        this._attributeDefinitions.get(attributeVendor).set(attributeLabel, attributeDefinition);
        return;
      }

      if ((match = processedLine.match(DictPatterns.VALUE_DECL))) {
        const valueVendor = match[1] !== undefined ? parseInt(match[1], 10) : currentVendor;
        const attributeLabel = match[2];
        const enumLabel = match[3];
        const enumCode = parseInt(match[4], 10);

        this._ensureAttributeStorage(valueVendor, attributeLabel);
        const attributeDefinition = this._attributeDefinitions.get(valueVendor).get(attributeLabel);

        attributeDefinition[AttrDefKeys.ENUM_MAP_FIELD].set(enumCode, enumLabel);
        attributeDefinition[AttrDefKeys.REVERSE_ENUM_MAP_FIELD].set(enumLabel, enumCode);
        return;
      }

      if ((match = processedLine.match(DictPatterns.INCLUDE_DECL))) {
        includedFiles.push(match[1]);
        return;
      }
    });

    return includedFiles;
  }

  resetDefinitions() {
    this._attributeDefinitions.clear();
    this._vendorNameToCode.clear();
    this._dictionaryLoadStatus = ContentLoadState.UNINITIALIZED;
  }

  getAttributeCodeByName(attributeName, vendorIdentifier = VendorContext.GLOBAL) {
    return this._retrieveAttributeProperty(attributeName, vendorIdentifier, AttrDefKeys.ID_FIELD);
  }

  getAttributeNameByCode(attributeCode, vendorIdentifier = VendorContext.GLOBAL) {
    return this._retrieveAttributeProperty(attributeCode, vendorIdentifier, AttrDefKeys.LABEL_FIELD);
  }

  getVendorCodeByName(vendorName) {
    return this._vendorNameToCode.get(vendorName);
  }

  _retrieveAttributeProperty(attributeKey, vendorIdentifier, propertyName) {
    const vendorAttrs = this._attributeDefinitions.get(vendorIdentifier);
    if (!vendorAttrs) return undefined;

    const attributeDefinition = vendorAttrs.get(attributeKey);
    if (!attributeDefinition) return undefined;

    return attributeDefinition[propertyName];
  }

  decodePacketUnverified(options) {
    const modifiedOptions = { ...options, bypassSecret: true };
    return this.decodePacket(modifiedOptions);
  }

  decodePacket(options) {
    this.initializeDefinitions();

    const rawBuffer = options.packetData;
    if (!rawBuffer || rawBuffer.length < 4) {
      this._throwException("decodePacket: input buffer too short", { length: rawBuffer ? rawBuffer.length : 0 });
    }

    const decodedPacket = {};
    const codeValue = rawBuffer.readUInt8(0);
    const packetTypeInfo = this._packetTypeMap.get(codeValue);

    if (!packetTypeInfo) {
      this._throwException(`decodePacket: unknown packet code '${codeValue}'`);
    }

    decodedPacket.packetType = packetTypeInfo.name;
    decodedPacket.sequenceId = rawBuffer.readUInt8(1);
    decodedPacket.totalLength = rawBuffer.readUInt16BE(2);

    if (rawBuffer.length < decodedPacket.totalLength) {
      this._throwException("decodePacket: incomplete packet data");
    }

    const currentAuthenticator = rawBuffer.slice(AuthSegment.START_OFFSET, AuthSegment.END_OFFSET);
    decodedPacket.authenticator = currentAuthenticator;

    const attributeSegment = rawBuffer.slice(AuthSegment.END_OFFSET, decodedPacket.totalLength);
    decodedPacket.attributes = {};
    decodedPacket.rawAttributes = [];

    try {
      this._extractPayloadAttributes(attributeSegment, decodedPacket.attributes, VendorContext.GLOBAL, decodedPacket.rawAttributes);
    } catch (error) {
      this._throwException(error);
    }

    if (!packetTypeInfo.usesRandomAuth && packetTypeInfo.isRequest && !options.bypassSecret) {
      const originalAuthenticatorCopy = Buffer.alloc(AuthSegment.SEGMENT_LENGTH);
      rawBuffer.copy(originalAuthenticatorCopy, 0, AuthSegment.START_OFFSET, AuthSegment.END_OFFSET);
      rawBuffer.fill(0, AuthSegment.START_OFFSET, AuthSegment.END_OFFSET);

      const computedChecksum = this._computePacketHash(rawBuffer, options.sharedSecret);
      originalAuthenticatorCopy.copy(rawBuffer, AuthSegment.START_OFFSET);

      if (computedChecksum.toString() !== currentAuthenticator.toString()) {
        this._throwException(new IntegrityFailure("decodePacket: authenticator mismatch (possible shared secret mismatch)", decodedPacket));
      }
    }

    if (packetTypeInfo.isRequest && decodedPacket.attributes["Message-Authenticator"] && !options.bypassSecret) {
      this._validateMessageIntegrityRequest(options, decodedPacket);
    }

    return decodedPacket;
  }

  _clearMessageAuthenticator(attributeList) {
    const msgAuthCode = this.getAttributeCodeByName("Message-Authenticator");
    const updatedAttrs = attributeList.map(attr => {
      if (attr[0] === msgAuthCode) {
        return [msgAuthCode, Buffer.alloc(AuthSegment.MESSAGE_AUTH_LENGTH).fill(0x00)];
      }
      return attr;
    });
    return updatedAttrs;
  }

  _validateMessageIntegrityRequest(options, requestPayload) {
    const reEncodedPayload = this._constructPacketBuffer({
        packetType: requestPayload.packetType,
        attributes: this._clearMessageAuthenticator(requestPayload.rawAttributes),
        sequenceId: requestPayload.sequenceId,
        sharedSecret: options.sharedSecret
    });
    requestPayload.authenticator.copy(reEncodedPayload, AuthSegment.START_OFFSET);

    const originalMessageAuthenticator = requestPayload.attributes["Message-Authenticator"];
    const expectedMessageAuthenticator = this._computeMessageHash(reEncodedPayload, options.sharedSecret);

    if (originalMessageAuthenticator.toString() !== expectedMessageAuthenticator.toString()) {
      this._throwException(new IntegrityFailure("decodePacket: Message-Authenticator mismatch (possible shared secret mismatch)", requestPayload));
    }
  }

  validateResponse(options) {
    this.initializeDefinitions();

    if (!options || !Buffer.isBuffer(options.requestBuffer) || !Buffer.isBuffer(options.responseBuffer)) {
      this._throwException("validateResponse: must provide raw request and response buffers");
    }

    if (options.sharedSecret == null) {
      this._throwException("validateResponse: must specify shared secret");
    }

    const receivedResponseAuthenticator = Buffer.alloc(AuthSegment.SEGMENT_LENGTH);
    options.responseBuffer.copy(receivedResponseAuthenticator, 0, AuthSegment.START_OFFSET, AuthSegment.END_OFFSET);

    options.requestBuffer.copy(options.responseBuffer, AuthSegment.START_OFFSET, AuthSegment.START_OFFSET, AuthSegment.END_OFFSET);

    const expectedResponseAuthenticator = this._computePacketHash(options.responseBuffer, options.sharedSecret);
    receivedResponseAuthenticator.copy(options.responseBuffer, AuthSegment.START_OFFSET);

    if (expectedResponseAuthenticator.toString() !== receivedResponseAuthenticator.toString()) {
      return false;
    }

    return this._validateMessageIntegrityResponse(options);
  }

  _validateMessageIntegrityResponse(options) {
    const parsedRequest = this.decodePacket({
      packetData: options.requestBuffer,
      sharedSecret: options.sharedSecret
    });

    if (parsedRequest.attributes["Message-Authenticator"]) {
      const parsedResponse = this.decodePacket({
        packetData: options.responseBuffer,
        sharedSecret: options.sharedSecret
      });

      const actualMessageAuthenticator = parsedResponse.attributes["Message-Authenticator"];
      if (!actualMessageAuthenticator) {
        return false;
      }

      const simulatedResponsePacket = this._constructPacketBuffer({
          packetType: parsedResponse.packetType,
          attributes: this._clearMessageAuthenticator(parsedResponse.rawAttributes),
          sequenceId: parsedResponse.sequenceId,
          sharedSecret: options.sharedSecret
      });
      parsedRequest.authenticator.copy(simulatedResponsePacket, AuthSegment.START_OFFSET);

      const expectedMessageAuthenticator = this._computeMessageHash(simulatedResponsePacket, options.sharedSecret);

      if (expectedMessageAuthenticator.toString() !== actualMessageAuthenticator.toString()) {
        return false;
      }
    }

    return true;
  }

  *_extractAttributeGenerator(dataSegment) {
    let currentOffset = 0;
    while (currentOffset < dataSegment.length) {
      const typeCode = dataSegment.readUInt8(currentOffset);
      const length = dataSegment.readUInt8(currentOffset + 1);
      
      if (currentOffset + length > dataSegment.length || length < 2) {
          // Malformed attribute or out of bounds. Advance by minimum possible or remaining.
          currentOffset += (length > 0 ? length : 1);
          continue;
      }

      const valueBuffer = dataSegment.slice(currentOffset + 2, currentOffset + length);
      yield { typeCode, length, valueBuffer };
      currentOffset += length;
    }
  }

  _extractPayloadAttributes(dataSegment, attributeStorage, vendorContext, rawAttributeList) {
    for (const { typeCode, valueBuffer } of this._extractAttributeGenerator(dataSegment)) {
      rawAttributeList.push([typeCode, valueBuffer]);

      const vendorAttributeMap = this._attributeDefinitions.get(vendorContext);
      const attributeDefinition = vendorAttributeMap ? vendorAttributeMap.get(typeCode) : undefined;

      if (!attributeDefinition) {
        continue;
      }

      let processedValue = valueBuffer;
      let attributeTag;

      if (attributeDefinition[AttrDefKeys.FLAGS_FIELD].has("has_tag")) {
        const firstByte = valueBuffer.readUInt8(0);
        if (firstByte <= 0x1F) {
          attributeTag = firstByte;
          processedValue = valueBuffer.slice(1);
        }
      }

      if (attributeDefinition[AttrDefKeys.FLAGS_FIELD].has("encrypt=1")) {
        processedValue = this._decodeEncryptedField(processedValue);
      } else {
        processedValue = this._decodeAttributeValue(processedValue, attributeDefinition);
      }

      const attributeName = attributeDefinition[AttrDefKeys.LABEL_FIELD];
      if (attributeTag !== undefined) {
        if (!attributeStorage[attributeName]) {
          attributeStorage[attributeName] = [];
        }
        attributeStorage[attributeName].push({ tag: attributeTag, value: processedValue });
      } else {
        if (attributeStorage[attributeName] !== undefined && !Array.isArray(attributeStorage[attributeName])) {
          attributeStorage[attributeName] = [attributeStorage[attributeName]];
        }
        if (Array.isArray(attributeStorage[attributeName])) {
          attributeStorage[attributeName].push(processedValue);
        } else {
          attributeStorage[attributeName] = processedValue;
        }
      }
    }
  }

  _decodeEncryptedField(buffer) {
    return buffer;
  }

  _decodeAttributeValue(valueBuffer, attributeDefinition) {
    const attributeKind = attributeDefinition[AttrDefKeys.TYPE_FIELD];
    const enumerationMap = attributeDefinition[AttrDefKeys.ENUM_MAP_FIELD];

    const typeDecoders = {
      "string": (buf) => buf.toString("utf8"),
      "text": (buf) => buf.toString("utf8"),
      "ipaddr": (buf) => Array.from(buf).join("."),
      "date": (buf) => new Date(buf.readUInt32BE(0) * 1000),
      "time": (buf) => {
        let val = buf.readUInt32BE(0);
        return enumerationMap.has(val) ? enumerationMap.get(val) : val;
      },
      "integer": (buf) => {
        if (buf.length < 4) {
          const paddedBuf = Buffer.alloc(4);
          buf.copy(paddedBuf, 4 - buf.length);
          buf = paddedBuf;
        }
        let val = buf.readUInt32BE(0);
        return enumerationMap.has(val) ? enumerationMap.get(val) : val;
      },
      "octets": (buf) => buf,
      "tlv": (buf) => buf,
      "ipv6addr": (buf) => buf
    };

    const decoder = typeDecoders[attributeKind];
    if (decoder) {
      return decoder(valueBuffer);
    }
    return valueBuffer;
  }

  _computePacketHash(packetBuffer, secret) {
    return cryptographicModule.createHash('md5').update(packetBuffer).update(secret).digest();
  }

  _computeMessageHash(packetBuffer, secret) {
    return cryptographicModule.createHmac('md5', secret).update(packetBuffer).digest();
  }

  _constructPacketBuffer(packetData) {
    const code = this._typeCodeMap.get(packetData.packetType);
    if (code === undefined) {
        this._throwException(`_constructPacketBuffer: Unknown packet type '${packetData.packetType}'`);
    }

    const identifier = packetData.sequenceId;
    const authenticatorPlaceholder = Buffer.alloc(AuthSegment.SEGMENT_LENGTH).fill(0);

    let attributesBuffer = Buffer.alloc(0);
    if (packetData.attributes) {
      for (const attr of packetData.attributes) {
        const type = attr[0];
        const value = attr[1];

        const length = value.length + 2;
        if (length > 255) {
            this._throwException(`_constructPacketBuffer: Attribute value too long for type ${type}`);
        }

        const attrHeader = Buffer.alloc(2);
        attrHeader.writeUInt8(type, 0);
        attrHeader.writeUInt8(length, 1);

        attributesBuffer = Buffer.concat([attributesBuffer, attrHeader, value]);
      }
    }

    const totalLength = 4 + AuthSegment.SEGMENT_LENGTH + attributesBuffer.length;

    const packet = Buffer.alloc(totalLength);
    packet.writeUInt8(code, 0);
    packet.writeUInt8(identifier, 1);
    packet.writeUInt16BE(totalLength, 2);
    authenticatorPlaceholder.copy(packet, AuthSegment.START_OFFSET);
    attributesBuffer.copy(packet, AuthSegment.END_OFFSET);

    return packet;
  }
}

var globalProtocolHandler = new ProtocolCore();
globalProtocolHandler.IntegrityFailure = IntegrityFailure;