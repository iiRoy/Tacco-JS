// Transformed from original source
(function() {
  var CoreObject, BinaryGrid, ShrunkVisuals, RawDataChunk, UnpackData, SkyData, DataBlockUnit, MetadataBlock, MetadataValidator, VisualData, VisualHelpers, FileInterpreter, TabularData, Tabular, _ref_val, _ref_val_two,
    _hasProperty = {}.hasOwnProperty, // Checks if an object has a specific property.
    _inheritsFrom = function(derivedClass, baseClass) {
      for (var propName in baseClass) {
        if (_hasProperty.call(baseClass, propName)) derivedClass[propName] = baseClass[propName];
      }

      function ConstructorFunc() {
        this.constructor = derivedClass;
      }
      ConstructorFunc.prototype = baseClass.prototype;
      derivedClass.prototype = new ConstructorFunc();
      derivedClass.__super__ = baseClass.prototype;
      return derivedClass;
    },
    _sliceArray = [].slice; // Utility for slicing arrays.

  if (this.spaceApp == null) {
    this.spaceApp = {}; // Initialize the main application namespace if not present.
  }

  CoreObject = (function() {
    function CoreObject() {} // Base constructor for all components.

    CoreObject.mixin = function(mixinObject) {
      var propName, propValue;
      for (propName in mixinObject) {
        propValue = mixinObject[propName];
        this.prototype[propName] = propValue; // Apply properties to the prototype.
      }
      return this;
    };

    CoreObject.augment = function(mixinObject) {
      var propName, propValue;
      for (propName in mixinObject) {
        propValue = mixinObject[propName];
        this[propName] = propValue; // Apply properties directly to the class.
      }
      return this;
    };

    CoreObject.prototype.bindMethod = function(methodRef) {
      var _this_instance = this;
      return function() {
        return methodRef.apply(_this_instance, arguments); // Ensure 'this' context is preserved.
      };
    };

    CoreObject.prototype.executeCallback = function(onCompletion, optionsObject, payloadData) {
      var executionScope;
      executionScope = (optionsObject != null ? optionsObject.context : void 0) != null ? optionsObject.context : this;
      if (onCompletion != null) {
        return onCompletion.call(executionScope, payloadData, optionsObject); // Invoke the provided callback.
      }
    };

    return CoreObject;

  })();

  FileInterpreter = (function(_super_class) {
    _inheritsFrom(FileInterpreter, _super_class);

    FileInterpreter.prototype.ROW_SIZE = 80; // Standard row width for metadata.

    FileInterpreter.prototype.CHUNK_SIZE = 2880; // Standard data chunk length.

    File.prototype.slice = File.prototype.slice || File.prototype.webkitSlice; // Ensure slice method is available.

    Blob.prototype.slice = Blob.prototype.slice || Blob.prototype.webkitSlice; // Ensure slice method is available for blobs.

    function FileInterpreter(inputSource, onCompletion, optionsObject) {
      var httpRequest,
        _this_interpreter = this;
      this.inputSource = inputSource;
      this.onCompletion = onCompletion;
      this.optionsObject = optionsObject;
      this.dataUnits = []; // Collection of processed data units.
      this.segmentCounter = 0;
      this.startOffset = 0;
      this.endOffset = this.CHUNK_SIZE;
      this.currentPosition = 0;
      this.metadataBuffer = new Uint8Array(); // Buffer to accumulate header data.

      if (typeof this.inputSource === 'string') {
        this.fetchNextSegment = this._readSegmentFromMemory; // Use buffer reading for URLs.
        httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', this.inputSource);
        httpRequest.responseType = 'arraybuffer';
        httpRequest.onload = function() {
          if (httpRequest.status !== 200) {
            _this_interpreter.executeCallback(_this_interpreter.onCompletion, _this_interpreter.optionsObject); // Handle HTTP error.
            return;
          }
          _this_interpreter.inputSource = httpRequest.response;
          _this_interpreter.totalLength = _this_interpreter.inputSource.byteLength;
          return _this_interpreter.processFromMemory(); // Start processing from fetched buffer.
        };
        httpRequest.send();
      } else {
        this.totalLength = this.inputSource.size;
        this.fetchNextSegment = this._readSegmentFromFile; // Use file reading for File/Blob objects.
        this.processFromFile(); // Start processing from file.
      }
    }

    FileInterpreter.prototype.processFromMemory = function() {
      var currentSegment;
      currentSegment = this.inputSource.slice(this.startOffset + this.currentPosition, this.endOffset + this.currentPosition);
      return this.handleDataSegment(currentSegment); // Process the sliced buffer segment.
    };

    FileInterpreter.prototype.processFromFile = function() {
      var currentSegment,
        _this_interpreter = this;
      this.fileAccessor = new FileReader(); // Create a new file reader.
      this.fileAccessor.onloadend = function(eventResult) {
        return _this_interpreter.handleDataSegment(eventResult.target.result); // Process the result when read.
      };
      currentSegment = this.inputSource.slice(this.startOffset + this.currentPosition, this.endOffset + this.currentPosition);
      return this.fileAccessor.readAsArrayBuffer(currentSegment); // Read the file segment as array buffer.
    };

    FileInterpreter.prototype.handleDataSegment = function(currentSegment) {
      var byteArr, payloadSize, payloadItem, metadataBlock, rowIdx, numRows, headerString, dataSlice, tempArr, currentByte, _i, _len, _ref_val;
      byteArr = new Uint8Array(currentSegment);
      tempArr = new Uint8Array(this.metadataBuffer);
      this.metadataBuffer = new Uint8Array(this.endOffset); // Resize metadata buffer.
      this.metadataBuffer.set(tempArr, 0);
      this.metadataBuffer.set(byteArr, this.startOffset);
      numRows = this.CHUNK_SIZE / this.ROW_SIZE;

      while (numRows--) {
        rowIdx = numRows * this.ROW_SIZE;
        if (byteArr[rowIdx] === 32) {
          continue; // Skip lines starting with space (comments or blank).
        }
        if (byteArr[rowIdx] === 69 && byteArr[rowIdx + 1] === 78 && byteArr[rowIdx + 2] === 68 && byteArr[rowIdx + 3] === 32) {
          headerString = '';
          _ref_val = this.metadataBuffer;
          for (_i = 0, _len = _ref_val.length; _i < _len; _i++) {
            currentByte = _ref_val[_i];
            headerString += String.fromCharCode(currentByte); // Convert byte array to string.
          }
          metadataBlock = new MetadataBlock(headerString);
          this.dataStartPos = this.endOffset + this.currentPosition;
          payloadSize = metadataBlock.getPayloadSize();
          dataSlice = this.inputSource.slice(this.dataStartPos, this.dataStartPos + payloadSize);

          if (metadataBlock.containsPayload()) {
            payloadItem = this.buildPayloadItem(metadataBlock, dataSlice); // Create data unit if present.
          }
          this.dataUnits.push(new DataBlockUnit(metadataBlock, payloadItem)); // Store the processed unit.
          this.currentPosition += this.endOffset + payloadSize + this.calculatePadding(payloadSize);

          if (this.currentPosition === this.totalLength) {
            this.metadataBuffer = null; // Clear buffer for memory efficiency.
            this.executeCallback(this.onCompletion, this.optionsObject, this); // Signal completion.
            return;
          }
          this.segmentCounter = 0;
          this.startOffset = this.segmentCounter * this.CHUNK_SIZE;
          this.endOffset = this.startOffset + this.CHUNK_SIZE;
          this.metadataBuffer = new Uint8Array(); // Reset metadata buffer for next header.
          currentSegment = this.inputSource.slice(this.startOffset + this.currentPosition, this.endOffset + this.currentPosition);
          this.fetchNextSegment(currentSegment); // Fetch the next header block.
          return;
        }
        break; // Stop if END not found and not a blank line.
      }
      this.segmentCounter += 1;
      this.startOffset = this.segmentCounter * this.CHUNK_SIZE;
      this.endOffset = this.startOffset + this.CHUNK_SIZE;
      currentSegment = this.inputSource.slice(this.startOffset + this.currentPosition, this.endOffset + this.currentPosition);
      this.fetchNextSegment(currentSegment); // Continue reading for header.
    };

    FileInterpreter.prototype._readSegmentFromMemory = function(currentSegment) {
      return this.handleDataSegment(currentSegment); // Direct processing from memory.
    };

    FileInterpreter.prototype._readSegmentFromFile = function(currentSegment) {
      return this.fileAccessor.readAsArrayBuffer(currentSegment); // Continue reading from file.
    };

    FileInterpreter.prototype.buildPayloadItem = function(metadataBlock, binaryData) {
      var dataTypeKind;
      dataTypeKind = metadataBlock.getDataTypeKind();
      return new this.spaceApp.SkyData[dataTypeKind](metadataBlock, binaryData); // Instantiate specific data unit.
    };

    FileInterpreter.prototype.calculatePadding = function(dataSize) {
      return (this.CHUNK_SIZE - (dataSize % this.CHUNK_SIZE)) % this.CHUNK_SIZE; // Calculate bytes needed to fill a block.
    };

    FileInterpreter.prototype.isEndOfStream = function() {
      if (this.currentPosition === this.totalLength) {
        return true;
      } else {
        return false;
      }
    };

    return FileInterpreter;

  })(CoreObject);

  SkyData = (function(_super_class) {
    _inheritsFrom(SkyData, _super_class);

    function SkyData(inputSource, onCompletion, optionsObject) {
      var fileParser,
        _this_skydata = this;
      this.inputSource = inputSource;
      fileParser = new FileInterpreter(this.inputSource, function(parsedData) {
        _this_skydata.dataUnits = fileParser.dataUnits;
        return _this_skydata.executeCallback(onCompletion, optionsObject, _this_skydata); // Pass parsed data to callback.
      });
    }

    SkyData.prototype.retrieveDataBlock = function(itemIndex) {
      var blockUnit, _i, _len, _ref_val;
      if ((itemIndex != null) && (this.dataUnits[itemIndex] != null)) {
        return this.dataUnits[itemIndex]; // Return specific block if index provided.
      }
      _ref_val = this.dataUnits;
      for (_i = 0, _len = _ref_val.length; _i < _len; _i++) {
        blockUnit = _ref_val[_i];
        if (blockUnit.containsData()) {
          return blockUnit; // Return first block containing data.
        }
      }
    };

    SkyData.prototype.getMetadata = function(itemIndex) {
      return this.retrieveDataBlock(itemIndex).metadata; // Get metadata for a block.
    };

    SkyData.prototype.getPayloadChunk = function(itemIndex) {
      return this.retrieveDataBlock(itemIndex).payload; // Get payload for a block.
    };

    return SkyData;

  })(CoreObject);

  SkyData.version = '0.6.5'; // Version of the SkyData library.

  this.spaceApp.SkyData = SkyData; // Expose SkyData in the namespace.

  RawDataChunk = (function(_super_class) {
    _inheritsFrom(RawDataChunk, _super_class);

    RawDataChunk.endianSwapper = {
      BYTE: function(val) {
        return val;
      },
      SHORT_INT: function(val) {
        return (val << 8) | (val >> 8);
      },
      LONG_INT: function(val) {
        return ((val & 0xFF) << 24) | ((val & 0xFF00) << 8) | ((val >> 8) & 0xFF00) | ((val >> 24) & 0xFF);
      }
    };

    RawDataChunk.endianSwapper[8] = RawDataChunk.endianSwapper['BYTE'];
    RawDataChunk.endianSwapper[16] = RawDataChunk.endianSwapper['SHORT_INT'];
    RawDataChunk.endianSwapper[32] = RawDataChunk.endianSwapper['LONG_INT'];

    function RawDataChunk(metadataBlock, binaryData) {
      if (binaryData instanceof ArrayBuffer) {
        this.dataBuffer = binaryData;
      } else {
        this.binaryData = binaryData; // Store either ArrayBuffer or Blob.
      }
    }

    return RawDataChunk;

  })(CoreObject);

  this.spaceApp.SkyData.RawDataChunk = RawDataChunk; // Expose RawDataChunk.

  MetadataValidator = {
    checkSequence: function(keywordEntry, expectedIndex) {
      if (expectedIndex !== this.entryIndex) {
        return console.warn("" + keywordEntry + " should appear at index " + this.entryIndex + " in the FITS metadata");
      }
    },
    validateRange: function(keywordEntry, valueToCheck, lowerBound, upperBound) {
      if (!(valueToCheck >= lowerBound && valueToCheck <= upperBound)) {
        throw "The " + keywordEntry + " value of " + valueToCheck + " is not between " + lowerBound + " and " + upperBound;
      }
    },
    parseBooleanString: function(inputString) {
      if (inputString === "T") {
        return true;
      } else {
        return false;
      }
    },
    ValidationFunctions: {
      SIMPLE_FLAG: function() {
        var params, booleanValue;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        booleanValue = arguments[0];
        this.isPrimaryBlock = true;
        this.checkSequence("SIMPLE_FLAG", 0);
        return this.parseBooleanString(booleanValue);
      },
      EXTENSION_TYPE: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        this.isExtensionBlock = true;
        this.extensionKind = arguments[0];
        this.checkSequence("EXTENSION_TYPE", 0);
        return this.extensionKind;
      },
      BITS_PER_PIXEL: function() {
        var params, keyword, pixelValue;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        keyword = "BITS_PER_PIXEL";
        pixelValue = parseInt(arguments[0]);
        this.checkSequence(keyword, 1);
        if (pixelValue !== 8 && pixelValue !== 16 && pixelValue !== 32 && pixelValue !== (-32) && pixelValue !== (-64)) {
          throw "" + keyword + " value " + pixelValue + " is not permitted";
        }
        return pixelValue;
      },
      NUM_AXES: function() {
        var params, isArrayContext, keyword, neededValue, axisValue, _ref_val;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        keyword = "NUM_AXES";
        axisValue = parseInt(arguments[0]);
        isArrayContext = arguments[1];
        if (!isArrayContext) {
          this.checkSequence(keyword, 2);
          this.validateRange(keyword, axisValue, 0, 999);
          if (this.isExtensionSegment()) {
            if ((_ref_val = this.extensionKind) === "TABLE" || _ref_val === "BINTABLE") {
              neededValue = 2;
              if (axisValue !== neededValue) {
                throw "" + keyword + " must be " + neededValue + " for TABLE and BINTABLE extensions";
              }
            }
          }
        }
        return axisValue;
      },
      PARAMETER_COUNT: function() {
        var params, keyword, expectedOrder, neededValue, paramValue, _ref_val;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        keyword = "PARAMETER_COUNT";
        paramValue = parseInt(arguments[0]);
        expectedOrder = 1 + 1 + 1 + this.get("NUM_AXES");
        this.checkSequence(keyword, expectedOrder);
        if (this.isExtensionSegment()) {
          if ((_ref_val = this.extensionKind) === "IMAGE" || _ref_val === "TABLE") {
            neededValue = 0;
            if (paramValue !== neededValue) {
              throw "" + keyword + " must be " + neededValue + " for the " + this.extensionKind + " extensions";
            }
          }
        }
        return paramValue;
      },
      GROUP_COUNT: function() {
        var params, keyword, expectedOrder, neededValue, groupValue, _ref_val;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        keyword = "GROUP_COUNT";
        groupValue = parseInt(arguments[0]);
        expectedOrder = 1 + 1 + 1 + this.get("NUM_AXES") + 1;
        this.checkSequence(keyword, expectedOrder);
        if (this.isExtensionSegment()) {
          if ((_ref_val = this.extensionKind) === "IMAGE" || _ref_val === "TABLE" || _ref_val === "BINTABLE") {
            neededValue = 1;
            if (groupValue !== neededValue) {
              throw "" + keyword + " must be " + neededValue + " for the " + this.extensionKind + " extensions";
            }
          }
        }
        return groupValue;
      },
      EXTEND_FLAG: function() {
        var params, booleanValue;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        booleanValue = arguments[0];
        if (!this.isPrimarySegment()) {
          throw "EXTEND_FLAG must only appear in the primary metadata block";
        }
        return this.parseBooleanString(booleanValue);
      },
      SCALE_FACTOR: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseFloat(arguments[0]);
      },
      ZERO_OFFSET: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseFloat(arguments[0]);
      },
      BLANK_VALUE: function() {
        var params, blankVal;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        blankVal = arguments[0];
        if (!(this.get("BITS_PER_PIXEL") > 0)) {
          console.warn("BLANK_VALUE is not to be used for BITS_PER_PIXEL = " + (this.get('BITS_PER_PIXEL')));
        }
        return parseInt(blankVal);
      },
      DATA_MINIMUM: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseFloat(arguments[0]);
      },
      DATA_MAXIMUM: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseFloat(arguments[0]);
      },
      EXTENSION_VERSION: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseInt(arguments[0]);
      },
      EXTENSION_LEVEL: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseInt(arguments[0]);
      },
      TABLE_FIELDS: function() {
        var params, fieldCount;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        fieldCount = parseInt(arguments[0]);
        this.validateRange("TABLE_FIELDS", fieldCount, 0, 999);
        return fieldCount;
      },
      TABLE_COLUMN: function() {
        var params, columnIndex, colValue;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        colValue = arguments[0];
        columnIndex = arguments[2];
        this.validateRange("TABLE_COLUMN", columnIndex, 0, this.get("TABLE_FIELDS"));
        return colValue;
      },
      Z_IMAGE_FLAG: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return this.parseBooleanString(arguments[0]);
      },
      Z_COMPRESSION_TYPE: function() {
        var params, compType;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        compType = arguments[0];
        if (compType !== 'GZIP_1' && compType !== 'RICE_1' && compType !== 'PLIO_1' && compType !== 'HCOMPRESS_1') {
          throw "Z_COMPRESSION_TYPE value " + compType + " is not permitted";
        }
        if (compType !== 'RICE_1') {
          throw "Compression type " + compType + " is not yet implemented";
        }
        return compType;
      },
      Z_BITS_PER_PIXEL: function() {
        var params, zPixelVal;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        zPixelVal = parseInt(arguments[0]);
        if (zPixelVal !== 8 && zPixelVal !== 16 && zPixelVal !== 32 && zPixelVal !== 64 && zPixelVal !== (-32) && zPixelVal !== (-64)) {
          throw "Z_BITS_PER_PIXEL value " + zPixelVal + " is not permitted";
        }
        return zPixelVal;
      },
      Z_NUMBER_AXES: function() {
        var params, isArrayContext, zAxisVal;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        zAxisVal = parseInt(arguments[0]);
        isArrayContext = arguments[1];
        zAxisVal = zAxisVal;
        if (!isArrayContext) {
          this.validateRange("Z_NUMBER_AXES", zAxisVal, 0, 999);
        }
        return zAxisVal;
      },
      Z_TILE_SIZE: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseInt(arguments[0]);
      },
      Z_SIMPLE_FLAG: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        if (arguments[0] === "T") {
          return true;
        } else {
          return false;
        }
      },
      Z_PARAMETER_COUNT: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseInt(arguments[0]);
      },
      Z_GROUP_COUNT: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseInt(arguments[0]);
      },
      Z_DITHER_OFFSET: function() {
        var params;
        params = 1 <= arguments.length ? _sliceArray.call(arguments, 0) : [];
        return parseInt(arguments[0]);
      }
    }
  };

  // Minimal definitions for classes used by FileInterpreter and SkyData,
  // but not fully defined in the provided original snippet.
  MetadataBlock = (function(_super_class) {
    _inheritsFrom(MetadataBlock, _super_class);

    function MetadataBlock(headerString) {
      this.metadataString = headerString;
      this.entryIndex = 0; // Simulates cardIndex for validation
      this.extensionKind = null; // Simulates extensionType
      this.isPrimaryBlock = false; // Simulates primary
      this.isExtensionBlock = false; // Simulates extension
      this.values = {}; // Simulates storage for parsed header values

      // Basic parsing to allow validation functions to run
      var lines = headerString.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var keyword = line.substring(0, 8).trim();
        var valuePart = line.substring(10, 80).trim();
        if (keyword) {
            this.entryIndex = i; // Update entryIndex for sequence validation
            this.values[keyword] = valuePart; // Store value
            // Simulate common header entries for validation logic
            if (keyword === 'SIMPLE') this.isPrimaryBlock = (valuePart === 'T');
            if (keyword === 'XTENSION') this.extensionKind = valuePart;
            if (keyword === 'BITPIX') this.values['BITPIX'] = parseInt(valuePart);
            if (keyword === 'NAXIS') this.values['NAXIS'] = parseInt(valuePart);
            if (keyword === 'TFIELDS') this.values['TFIELDS'] = parseInt(valuePart);
        }
      }
    }

    MetadataBlock.prototype.getDataTypeKind = function() {
      // Placeholder logic to determine data unit type
      if (this.extensionKind === 'BINTABLE') return 'BinaryGrid';
      if (this.extensionKind === 'TABLE') return 'TabularData';
      if (this.isPrimaryBlock && this.get('NAXIS') > 0) return 'VisualData';
      return 'RawDataChunk'; // Generic if not specific
    };

    MetadataBlock.prototype.getPayloadSize = function() {
      // Placeholder for actual size calculation based on metadata
      return 1000; // Example fixed size for this exercise
    };

    MetadataBlock.prototype.containsPayload = function() {
      // Placeholder logic; assume data is always present for this exercise
      return true;
    };

    MetadataBlock.prototype.get = function(key) {
      // Simulate getting parsed header values, mapping new names to original keys if necessary.
      // The validation functions use the original keyword names directly in `this.get()`.
      return this.values[key];
    };

    MetadataBlock.prototype.isExtensionSegment = function() {
      return this.isExtensionBlock;
    };

    MetadataBlock.prototype.isPrimarySegment = function() {
      return this.isPrimaryBlock;
    };

    // Mix in validation functions to the prototype
    CoreObject.mixin.call(MetadataBlock.prototype, MetadataValidator);
    CoreObject.mixin.call(MetadataBlock.prototype, MetadataValidator.ValidationFunctions);

    return MetadataBlock;
  })(CoreObject);


  DataBlockUnit = (function(_super_class) {
    _inheritsFrom(DataBlockUnit, _super_class);

    function DataBlockUnit(metadata, payload) {
      this.metadata = metadata;
      this.payload = payload;
    }

    DataBlockUnit.prototype.containsData = function() {
      return this.payload != null;
    };

    return DataBlockUnit;
  })(CoreObject);

  // Placeholder definitions for other types to satisfy `buildPayloadItem`
  VisualData = (function(_super_class) { _inheritsFrom(VisualData, _super_class); function VisualData() { RawDataChunk.apply(this, arguments); } return VisualData; })(RawDataChunk);
  BinaryGrid = (function(_super_class) { _inheritsFrom(BinaryGrid, _super_class); function BinaryGrid() { RawDataChunk.apply(this, arguments); } return BinaryGrid; })(RawDataChunk);
  TabularData = (function(_super_class) { _inheritsFrom(TabularData, _super_class); function TabularData() { RawDataChunk.apply(this, arguments); } return TabularData; })(RawDataChunk);
  ShrunkVisuals = (function(_super_class) { _inheritsFrom(ShrunkVisuals, _super_class); function ShrunkVisuals() { RawDataChunk.apply(this, arguments); } return ShrunkVisuals; })(RawDataChunk);
  UnpackData = {}; // Placeholder if it were a utility object
  VisualHelpers = {}; // Placeholder
  Tabular = {}; // Placeholder

  // Expose these types in the namespace for FileInterpreter.buildPayloadItem
  this.spaceApp.SkyData.VisualData = VisualData;
  this.spaceApp.SkyData.BinaryGrid = BinaryGrid;
  this.spaceApp.SkyData.TabularData = TabularData;
  this.spaceApp.SkyData.ShrunkVisuals = ShrunkVisuals;

}).call(this);