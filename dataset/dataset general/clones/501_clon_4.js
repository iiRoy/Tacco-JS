if (typeof this.galaxy === 'undefined') {
  this.galaxy = {};
}

const cosmicUtils = {
  transmitAction: (performer, operation, ...args) => {
    return operation.apply(performer, args);
  },

  triggerCompletion: (completionRoutine, settings, outcome) => {
    const contextObject = (settings && settings.performerContext) !== undefined ? settings.performerContext : cosmicUtils;
    if (completionRoutine) {
      return completionRoutine.call(contextObject, outcome, settings);
    }
  },

  probeLocalFile: (fileObject) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => resolve(event.target.result);
      fileReader.onerror = (event) => reject(event.target.error);
      fileReader.readAsArrayBuffer(fileObject);
    });
  },

  ensureSliceMethod: () => {
    if (typeof File !== 'undefined' && File.prototype && !File.prototype.slice) {
      File.prototype.slice = File.prototype.webkitSlice;
    }
    if (typeof Blob !== 'undefined' && Blob.prototype && !Blob.prototype.slice) {
      Blob.prototype.slice = Blob.prototype.webkitSlice;
    }
  },

  endianSwapper: {
    'B': (val) => val,
    'I': (val) => ((val & 0xFF) << 8) | ((val >> 8) & 0xFF),
    'J': (val) => ((val & 0xFF) << 24) | ((val & 0xFF00) << 8) | ((val >> 8) & 0xFF00) | ((val >> 24) & 0xFF),
    'K': (val) => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setFloat64(0, val, true);
      return view.getFloat64(0, false);
    }
  },

  determinePadding: (dataLength, blockSize) => {
    return (blockSize - (dataLength % blockSize)) % blockSize;
  },

  decodeAscii: (uint8ArraySlice) => {
    const decoder = new TextDecoder('ascii');
    return decoder.decode(uint8ArraySlice);
  }
};

cosmicUtils.endianSwapper[8] = cosmicUtils.endianSwapper['B'];
cosmicUtils.endianSwapper[16] = cosmicUtils.endianSwapper['I'];
cosmicUtils.endianSwapper[32] = cosmicUtils.endianSwapper['J'];
cosmicUtils.endianSwapper[64] = cosmicUtils.endianSwapper['K'];

cosmicUtils.ensureSliceMethod();

const cardVerifier = (() => {
  const logicalChecker = (valueString) => {
    return valueString.trim() === "T";
  };

  const rangeValidator = (keyword, value, lower, upper) => {
    if (!(value >= lower && value <= upper)) {
      throw new Error(`The ${keyword} value of ${value} is not between ${lower} and ${upper}`);
    }
  };

  let currentCardIndex = 0;
  let currentHeaderState = {};

  const resetVerifierState = () => {
    currentCardIndex = 0;
    currentHeaderState = {};
  };

  const updateHeaderState = (key, value) => {
    currentHeaderState[key] = value;
  };

  const getHeaderValue = (key) => {
    return currentHeaderState[key];
  };

  const checkCardOrder = (keyword, expectedIndex) => {
    if (expectedIndex !== currentCardIndex) {
      console.warn(`${keyword} should appear at index ${expectedIndex} in the FITS header`);
    }
  };

  const isPrimary = () => currentHeaderState.PRIMARY_HDU === true;
  const isExtension = () => currentHeaderState.EXTENSION_HDU === true;

  const validationRoutines = {
    SIMPLE: (value) => {
      checkCardOrder("SIMPLE", 0);
      updateHeaderState("PRIMARY_HDU", true);
      return logicalChecker(value);
    },
    XTENSION: (value) => {
      checkCardOrder("XTENSION", 0);
      updateHeaderState("EXTENSION_HDU", true);
      updateHeaderState("EXTENSION_TYPE", value.trim());
      return value.trim();
    },
    BITPIX: (value) => {
      const parsedValue = parseInt(value);
      checkCardOrder("BITPIX", 1);
      if (![8, 16, 32, -32, -64].includes(parsedValue)) {
        throw new Error(`BITPIX value ${parsedValue} is not permitted`);
      }
      return parsedValue;
    },
    NAXIS: (value, axisIndex) => {
      const parsedValue = parseInt(value);
      if (axisIndex === undefined) {
        checkCardOrder("NAXIS", 2);
        rangeValidator("NAXIS", parsedValue, 0, 999);
        if (isExtension()) {
          const extType = getHeaderValue("EXTENSION_TYPE");
          if (["TABLE", "BINTABLE"].includes(extType)) {
            const required = 2;
            if (parsedValue !== required) {
              throw new Error(`NAXIS must be ${required} for ${extType} extensions`);
            }
          }
        }
      }
      return parsedValue;
    },
    PCOUNT: (value) => {
      const parsedValue = parseInt(value);
      const expectedOrder = 1 + 1 + 1 + getHeaderValue("NAXIS");
      checkCardOrder("PCOUNT", expectedOrder);
      if (isExtension()) {
        const extType = getHeaderValue("EXTENSION_TYPE");
        if (["IMAGE", "TABLE"].includes(extType)) {
          const required = 0;
          if (parsedValue !== required) {
            throw new Error(`PCOUNT must be ${required} for ${extType} extensions`);
          }
        }
      }
      return parsedValue;
    },
    GCOUNT: (value) => {
      const parsedValue = parseInt(value);
      const expectedOrder = 1 + 1 + 1 + getHeaderValue("NAXIS") + 1;
      checkCardOrder("GCOUNT", expectedOrder);
      if (isExtension()) {
        const extType = getHeaderValue("EXTENSION_TYPE");
        if (["IMAGE", "TABLE", "BINTABLE"].includes(extType)) {
          const required = 1;
          if (parsedValue !== required) {
            throw new Error(`GCOUNT must be ${required} for ${extType} extensions`);
          }
        }
      }
      return parsedValue;
    },
    EXTEND: (value) => {
      if (!isPrimary()) {
        throw new Error("EXTEND must only appear in the primary header");
      }
      return logicalChecker(value);
    },
    BSCALE: (value) => parseFloat(value),
    BZERO: (value) => parseFloat(value),
    BLANK: (value) => {
      const parsedValue = parseInt(value);
      if (!(getHeaderValue("BITPIX") > 0)) {
        console.warn(`BLANK is not to be used for BITPIX = ${getHeaderValue("BITPIX")}`);
      }
      return parsedValue;
    },
    DATAMIN: (value) => parseFloat(value),
    DATAMAX: (value) => parseFloat(value),
    EXTVER: (value) => parseInt(value),
    EXTLEVEL: (value) => parseInt(value),
    TFIELDS: (value) => {
      const parsedValue = parseInt(value);
      rangeValidator("TFIELDS", parsedValue, 0, 999);
      return parsedValue;
    },
    TBCOL: (value, index) => {
      const parsedValue = parseInt(value);
      rangeValidator("TBCOL", index, 0, getHeaderValue("TFIELDS"));
      return parsedValue;
    },
    ZIMAGE: (value) => logicalChecker(value),
    ZCMPTYPE: (value) => {
      const trimmedValue = value.trim();
      if (!['GZIP_1', 'RICE_1', 'PLIO_1', 'HCOMPRESS_1'].includes(trimmedValue)) {
        throw new Error(`ZCMPTYPE value ${trimmedValue} is not permitted`);
      }
      if (trimmedValue !== 'RICE_1') {
        throw new Error(`Compression type ${trimmedValue} is not yet implemented`);
      }
      return trimmedValue;
    },
    ZBITPIX: (value) => {
      const parsedValue = parseInt(value);
      if (![8, 16, 32, 64, -32, -64].includes(parsedValue)) {
        throw new Error(`ZBITPIX value ${parsedValue} is not permitted`);
      }
      return parsedValue;
    },
    ZNAXIS: (value, axisIndex) => {
      const parsedValue = parseInt(value);
      if (axisIndex === undefined) {
        rangeValidator("ZNAXIS", parsedValue, 0, 999);
      }
      return parsedValue;
    },
    ZTILE: (value) => parseInt(value),
    ZSIMPLE: (value) => logicalChecker(value),
    ZPCOUNT: (value) => parseInt(value),
    ZGCOUNT: (value) => parseInt(value),
    ZDITHER0: (value) => parseInt(value),
  };

  return {
    processCard: (keyword, value, ...extraArgs) => {
      const routine = validationRoutines[keyword];
      if (routine) {
        const validatedValue = routine(value, ...extraArgs);
        updateHeaderState(keyword, validatedValue);
        if (keyword === 'NAXIS' && extraArgs[0] !== undefined) {
          updateHeaderState(`NAXIS${extraArgs[0]}`, validatedValue);
        } else if (keyword === 'ZNAXIS' && extraArgs[0] !== undefined) {
          updateHeaderState(`ZNAXIS${extraArgs[0]}`, validatedValue);
        } else if (keyword === 'TBCOL' && extraArgs[1] !== undefined) {
          updateHeaderState(`TBCOL${extraArgs[1]}`, validatedValue);
        }
        currentCardIndex++;
        return validatedValue;
      }
      const numVal = parseFloat(value);
      if (!isNaN(numVal) && String(numVal).length === value.trim().length && String(numVal) === value.trim()) {
          updateHeaderState(keyword, numVal);
          currentCardIndex++;
          return numVal;
      }
      updateHeaderState(keyword, value.trim());
      currentCardIndex++;
      return value.trim();
    },
    retrieveCurrentHeader: () => ({ ...currentHeaderState
    }),
    resetState: resetVerifierState
  };
})();


const payloadGenerators = (() => {
  const commonPayloadOperations = {
    retrieveBuffer: (instance) => instance.dataBuffer,
    retrieveBlob: (instance) => instance.dataBlob,
  };

  const standardPayload = (headerInfo, rawData) => {
    const payload = {
      headerInfo: headerInfo,
      dataBuffer: rawData instanceof ArrayBuffer ? rawData : null,
      dataBlob: rawData instanceof Blob ? rawData : null,
    };
    Object.assign(payload, commonPayloadOperations);
    return payload;
  };

  const imagePayload = (headerInfo, rawData) => {
    const payload = standardPayload(headerInfo, rawData);
    return payload;
  };

  const tablePayload = (headerInfo, rawData) => {
    const payload = standardPayload(headerInfo, rawData);
    return payload;
  };

  const binaryTablePayload = (headerInfo, rawData) => {
    const payload = standardPayload(headerInfo, rawData);
    return payload;
  };

  const compressedImagePayload = (headerInfo, rawData) => {
    const payload = standardPayload(headerInfo, rawData);
    return payload;
  };

  const generatorMap = new Map([
    ['IMAGE', imagePayload],
    ['TABLE', tablePayload],
    ['BINTABLE', binaryTablePayload],
    ['COMPRESSED_IMAGE', compressedImagePayload],
  ]);

  return {
    construct: (headerInfo, rawData) => {
      const type = headerInfo.EXTENSION_TYPE || (headerInfo.NAXIS > 0 ? 'IMAGE' : 'STANDARD');
      const generator = generatorMap.get(type) || standardPayload;
      return generator(headerInfo, rawData);
    },
    imagePayload: imagePayload,
    tablePayload: tablePayload,
    binaryTablePayload: binaryTablePayload,
    compressedImagePayload: compressedImagePayload,
  };
})();


const ContentInterpreter = (() => {
  const CARD_WIDTH = 80;
  const UNIT_SIZE = 2880;

  const parseCardLine = (line) => {
    const keyword = line.substring(0, 8).trim();
    let value = '';
    let comment = '';

    if (line.charAt(8) === '=') {
      const valueCommentPart = line.substring(10);
      const slashIndex = valueCommentPart.indexOf('/');
      if (slashIndex !== -1) {
        value = valueCommentPart.substring(0, slashIndex).trim();
        comment = valueCommentPart.substring(slashIndex + 1).trim();
      } else {
        value = valueCommentPart.trim();
      }
    } else {
      comment = line.substring(8).trim();
    }

    return {
      keyword: keyword,
      value: value,
      comment: comment
    };
  };

  const extractAndValidateHeader = (fullBuffer, startPosition) => {
    cardVerifier.resetState();
    const metadataView = new Uint8Array(fullBuffer, startPosition);
    let headerBoundary = startPosition;

    for (let i = 0; i < metadataView.byteLength; i += CARD_WIDTH) {
      const cardSlice = metadataView.slice(i, i + CARD_WIDTH);
      const cardLine = cosmicUtils.decodeAscii(cardSlice);

      const {
        keyword,
        value
      } = parseCardLine(cardLine);

      if (keyword.length > 0) {
        if (keyword.startsWith('NAXIS') && keyword.length > 5) {
          const axisIndex = parseInt(keyword.substring(5));
          cardVerifier.processCard('NAXIS', value, axisIndex);
        } else if (keyword.startsWith('ZNAXIS') && keyword.length > 6) {
          const axisIndex = parseInt(keyword.substring(6));
          cardVerifier.processCard('ZNAXIS', value, axisIndex);
        } else if (keyword.startsWith('TBCOL') && keyword.length > 5) {
          const colIndex = parseInt(keyword.substring(5));
          cardVerifier.processCard('TBCOL', value, colIndex);
        } else {
          cardVerifier.processCard(keyword, value);
        }
      }

      if (keyword === 'END') {
        headerBoundary = startPosition + i + CARD_WIDTH;
        break;
      }
      if (i + CARD_WIDTH >= metadataView.byteLength) {
          throw new Error("FITS header END card not found within expected block.");
      }
    }

    const finalHeader = cardVerifier.retrieveCurrentHeader();
    return {
      parsedHeader: finalHeader,
      headerBoundary: headerBoundary
    };
  };

  const calculatePayloadLength = (headerInfo) => {
    let payloadBytes = 0;
    const bitpix = headerInfo.BITPIX;
    const naxis = headerInfo.NAXIS;

    if (naxis === 0) {
      return 0;
    }

    let elementSize = Math.abs(bitpix) / 8;

    let totalElements = 1;
    for (let i = 1; i <= naxis; i++) {
      totalElements *= (headerInfo[`NAXIS${i}`] || 0);
    }

    payloadBytes = totalElements * elementSize;

    if (headerInfo.EXTENSION_HDU && headerInfo.EXTENSION_TYPE === 'BINTABLE') {
        payloadBytes += headerInfo.PCOUNT;
    }

    return payloadBytes;
  };

  return {
    processContent: async (sourceInput, onCompletion, processingSettings) => {
      let fullArrayBuffer;

      if (typeof sourceInput === 'string') {
        const response = await fetch(sourceInput);
        if (!response.ok) {
          throw new Error(`Failed to fetch FITS data from ${sourceInput}: ${response.statusText}`);
        }
        fullArrayBuffer = await response.arrayBuffer();
      } else if (sourceInput instanceof File || sourceInput instanceof Blob) {
        fullArrayBuffer = await cosmicUtils.probeLocalFile(sourceInput);
      } else if (sourceInput instanceof ArrayBuffer) {
        fullArrayBuffer = sourceInput;
      } else {
        throw new Error("Unsupported input source type for FITS content processing.");
      }

      const contentBlocks = [];
      let currentPosition = 0;

      while (currentPosition < fullArrayBuffer.byteLength) {
        const {
          parsedHeader,
          headerBoundary
        } = extractAndValidateHeader(fullArrayBuffer, currentPosition);

        const payloadLength = calculatePayloadLength(parsedHeader);
        const payloadPadding = cosmicUtils.determinePadding(payloadLength, UNIT_SIZE);

        const payloadStart = headerBoundary;
        const payloadEnd = payloadStart + payloadLength;

        const payloadBuffer = fullArrayBuffer.slice(payloadStart, payloadEnd);

        const dataPayload = payloadGenerators.construct(parsedHeader, payloadBuffer);

        contentBlocks.push(new this.galaxy.AstroArchive.ContentBlock(parsedHeader, dataPayload));

        currentPosition = payloadEnd + payloadPadding;

        if (currentPosition >= fullArrayBuffer.byteLength) {
          break;
        }
      }

      cosmicUtils.triggerCompletion(onCompletion, processingSettings, {
        contentBlocks: contentBlocks
      });
    }
  };
})();


const AstroArchive = function(sourceInput, onCompletion, processingSettings) {
  const blocksStore = [];

  ContentInterpreter.processContent(sourceInput, (result) => {
      if (result && result.contentBlocks) {
        blocksStore.push(...result.contentBlocks);
      }
      cosmicUtils.triggerCompletion(onCompletion, processingSettings, this);
    }, processingSettings)
    .catch(error => {
      console.error("Error during AstroArchive processing:", error);
      cosmicUtils.triggerCompletion(onCompletion, processingSettings, null);
    });

  this.retrieveBlock = (index) => {
    if (index !== undefined && blocksStore[index] !== undefined) {
      return blocksStore[index];
    }
    for (const block of blocksStore) {
      if (block.hasData()) {
        return block;
      }
    }
    return null;
  };

  this.getBlockHeader = (index) => {
    const block = this.retrieveBlock(index);
    return block ? block.header : null;
  };

  this.getBlockPayload = (index) => {
    const block = this.retrieveBlock(index);
    return block ? block.data : null;
  };
};

AstroArchive.version = '0.1.0-alpha';

this.galaxy.AstroArchive = AstroArchive;
this.galaxy.AstroArchive.PayloadStructure = payloadGenerators.construct;
this.galaxy.AstroArchive.ContentBlock = function(header, data) {
  this.header = header;
  this.data = data;
  this.hasData = () => (this.data && (this.data.dataBuffer || this.data.dataBlob));
};

this.galaxy.AstroArchive.PayloadStructure.Image = payloadGenerators.imagePayload;
this.galaxy.AstroArchive.PayloadStructure.Table = payloadGenerators.tablePayload;
this.galaxy.AstroArchive.PayloadStructure.BinaryTable = payloadGenerators.binaryTablePayload;
this.galaxy.AstroArchive.PayloadStructure.CompressedImage = payloadGenerators.compressedImagePayload;