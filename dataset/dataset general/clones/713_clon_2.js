window.ImageVault = function (sourceImage, colorChannelBitDepth) {

  // Major version identifier for this storage mechanism
  this.MAJOR_RELEASE_NUMBER = 1;
  // Minor version identifier for this storage mechanism
  this.MINOR_RELEASE_NUMBER = 0;

  // Array to hold all the content units (files)
  this.storedItems = [];
  // Raw byte payload extracted or to be embedded
  this.bytePayload = new Uint8Array(0);

  // If an image is provided on construction, attempt to extract data
  if (typeof sourceImage !== "undefined") {
    this.extractData(sourceImage, colorChannelBitDepth);
  }
};

window.ImageVault.prototype = {

  // Adds a file reference to the internal collection
  addItem: function (itemEntry) {
    this.storedItems.push({ itemName: itemEntry.name, itemType: itemEntry.type, fileReference: itemEntry });
  },

  // Adds textual content as a file
  addTextualContent: function (textContent, itemName, itemType) {
    this.storedItems.push({ itemName: itemName, itemType: itemType, content: this.encodeToUtf8Bytes(textContent) });
  },

  // Adds raw binary data as a file
  addBinaryContent: function (byteSequence, itemName, itemType) {
    this.storedItems.push({ itemName: itemName, itemType: itemType, content: byteSequence });
  },

  // Clears all stored items
  clearAllItems: function () {
    this.storedItems = [];
  },

  // Removes an item at a specific index
  removeItemAtIndex: function (itemIndex) {
    if (itemIndex >= 0 && itemIndex < this.storedItems.length) {
      this.storedItems.splice(itemIndex, 1);
    }
  },

  // Removes an item by its name
  removeItemByName: function (itemName) {
    for (var idx = 0; idx < this.storedItems.length; idx++) {
      if (this.storedItems[idx].itemName === itemName) {
        this.storedItems.splice(idx, 1);
        break;
      }
    }
  },

  // Returns the total number of stored items
  getItemCount: function () {
    return this.storedItems.length;
  },

  // Retrieves an item at a specific index
  getItemAtIndex: function (itemIndex) {
    return (itemIndex >= 0 && itemIndex < this.storedItems.length) ? this.storedItems[itemIndex] : null;
  },

  // Retrieves an item by its name
  getItemByName: function (itemName) {
    for (var idx = 0; idx < this.storedItems.length; idx++) {
      if (this.storedItems[idx].itemName === itemName) {
        return this.storedItems[idx];
      }
    }
    return null;
  },

  // Extracts embedded data from a source image
  extractData: function (sourceImage, colorChannelBitDepth) {
    // Default bit depth to 8 if not specified
    if (typeof colorChannelBitDepth === "undefined") {
      colorChannelBitDepth = 8;
    }
    var drawingSurface = document.createElement('canvas');
    var renderContext = drawingSurface.getContext('2d');
    drawingSurface.width = sourceImage.width;
    drawingSurface.height = sourceImage.height;
    renderContext.drawImage(sourceImage, 0, 0);
    var imageDataObj = renderContext.getImageData(0, 0, sourceImage.width, sourceImage.height);
    var pixelDataArray = imageDataObj.data;
    var dataLength = pixelDataArray.length;
    var outputBuffer = this.bytePayload = new Uint8Array(sourceImage.width * sourceImage.height * 3);
    var primaryIndex = 0;
    if (colorChannelBitDepth === 8) {
      var secondaryIndex = 0;
      while (primaryIndex < dataLength) {
        // Only process opaque pixels (alpha = 255)
        if (pixelDataArray[primaryIndex + 3] === 0xff) {
          outputBuffer[secondaryIndex++] = pixelDataArray[primaryIndex++];
          outputBuffer[secondaryIndex++] = pixelDataArray[primaryIndex++];
          outputBuffer[secondaryIndex++] = pixelDataArray[primaryIndex++];
          primaryIndex++; // Skip alpha channel
        } else {
          primaryIndex += 4; // Skip transparent/translucent pixels
        }
      }
    } else {
      var bitHelper = new BitSequenceHelper(outputBuffer);
      while (primaryIndex < dataLength) {
        // Only process opaque pixels
        if (pixelDataArray[primaryIndex + 3] === 0xff) {
          bitHelper.appendBits(colorChannelBitDepth, pixelDataArray[primaryIndex++]);
          bitHelper.appendBits(colorChannelBitDepth, pixelDataArray[primaryIndex++]);
          bitHelper.appendBits(colorChannelBitDepth, pixelDataArray[primaryIndex++]);
          primaryIndex++; // Skip alpha channel
        } else {
          primaryIndex += 4; // Skip transparent/translucent pixels
        }
      }
    }
    // Check for a specific header indicating embedded directory and files
    if (outputBuffer[0] === 0xda && outputBuffer[1] === 0xda) {
      var directoryByteSize = outputBuffer[4] | (outputBuffer[5] << 8) | (outputBuffer[6] << 16) | (outputBuffer[7] << 24);
      var directoryBuffer = outputBuffer.subarray(8, 8 + directoryByteSize);
      var directoryObject = JSON.parse(this.decodeUtf8Bytes(directoryBuffer));
      var currentPosition = 8 + directoryByteSize;
      this.storedItems = []; // Clear current items to populate from extracted data
      for (primaryIndex = 0; primaryIndex < directoryObject.files.length; primaryIndex++) {
        var itemEntry = directoryObject.files[primaryIndex];
        var itemByteBuffer = new Uint8Array(itemEntry.size);
        itemByteBuffer.set(outputBuffer.subarray(currentPosition, currentPosition + itemEntry.size));
        currentPosition += itemEntry.size;
        this.storedItems.push({ itemName: itemEntry.name, itemType: itemEntry.type, content: itemByteBuffer });
      }
    }
    return this;
  },

  // Embeds the stored data into a new or existing image
  embedData: function (completionCallback) {
    var selfRef = this;
    (function (processSerialization) {
      var pendingLoadsCount = 0;
      var totalItemCount = selfRef.getItemCount();
      for (var idx = 0; idx < totalItemCount; idx++) {
        var currentItem = selfRef.storedItems[idx];
        // If the item is still a file reference, it needs to be loaded
        if (currentItem.fileReference) {
          pendingLoadsCount++;
          var fileReaderInstance = new FileReader();
          fileReaderInstance.onload = (function (capturedItem) {
            return function (eventObject) {
              capturedItem.content = new Uint8Array(eventObject.target.result);
              delete capturedItem.fileReference; // Remove reference once content is loaded
              // If all files are loaded and we're at the end of the loop
              if (--pendingLoadsCount === 0 && idx === totalItemCount) {
                pendingLoadsCount = -1; // Prevent re-triggering
                processSerialization.call(selfRef);
              }
            };
          })(currentItem);
          fileReaderInstance.readAsArrayBuffer(currentItem.fileReference);
        }
      }
      // If no files needed loading, proceed directly to serialization
      if (pendingLoadsCount === 0) {
        processSerialization.call(selfRef);
      }
    })(function () {
      var totalItemCount = this.getItemCount();
      if (totalItemCount > 0) {
        var secondaryIndex, currentPosition, itemEntry;
        var directoryObject = { files: [] };
        var contentPayloadSize = 0;
        for (secondaryIndex = 0; secondaryIndex < totalItemCount; secondaryIndex++) {
          itemEntry = this.storedItems[secondaryIndex];
          contentPayloadSize += itemEntry.content.byteLength;
          directoryObject.files.push({ name: itemEntry.itemName, size: itemEntry.content.byteLength, type: itemEntry.itemType });
        }
        var directoryBuffer = this.encodeToUtf8Bytes(JSON.stringify(directoryObject));
        var directoryByteSize = directoryBuffer.byteLength;
        var overallBufferSize = 8 + directoryByteSize + contentPayloadSize;
        var outputBuffer = this.bytePayload = new Uint8Array(overallBufferSize);
        // Signature bytes, e.g., 0xDADA
        outputBuffer[0] = outputBuffer[1] = 0xda;
        // Version numbers, major/minor
        outputBuffer[2] = this.MAJOR_RELEASE_NUMBER;
        outputBuffer[3] = this.MINOR_RELEASE_NUMBER;
        // Directory size, 32-bit little-endian
        outputBuffer[4] = directoryByteSize & 0xff;
        outputBuffer[5] = (directoryByteSize >> 8) & 0xff;
        outputBuffer[6] = (directoryByteSize >> 16) & 0xff;
        outputBuffer[7] = (directoryByteSize >> 24) & 0xff;
        // Write the directory content
        outputBuffer.set(directoryBuffer, 8);
        // Write the actual file contents
        for (secondaryIndex = 0, currentPosition = 8 + directoryBuffer.byteLength; secondaryIndex < totalItemCount; secondaryIndex++) {
          itemEntry = this.storedItems[secondaryIndex];
          outputBuffer.set(itemEntry.content, currentPosition);
          currentPosition += itemEntry.content.byteLength;
        }
      } else {
        // If no files, the payload is empty
        this.bytePayload = new Uint8Array(0);
      }
      // Execute the callback if provided
      if (completionCallback) {
        completionCallback.call(this);
      }
    });
  },

  // Creates an image with the embedded data
  generateOutputImage: function (targetRaster, colorChannelBitDepth) {
    var drawingSurface = document.createElement('canvas');
    var renderContext = drawingSurface.getContext('2d');
    if (typeof targetRaster === "undefined") {
      // If no target image, create a new square image
      colorChannelBitDepth = 8; // Default to 8 bits for new images
      var pixelDimension = Math.ceil(Math.sqrt(this.bytePayload.byteLength / 3));
      drawingSurface.width = pixelDimension;
      drawingSurface.height = pixelDimension;
      renderContext.fillRect(0, 0, pixelDimension, pixelDimension);
    } else {
      // Use existing target image dimensions and content
      if (typeof colorChannelBitDepth === "undefined") {
        colorChannelBitDepth = 8;
      }
      drawingSurface.width = targetRaster.width;
      drawingSurface.height = targetRaster.height;
      renderContext.drawImage(targetRaster, 0, 0);
    }
    var imageDataObj = renderContext.getImageData(0, 0, drawingSurface.width, drawingSurface.height);
    var pixelDataArray = imageDataObj.data;
    var imageDataSourceLength = pixelDataArray.length;
    var primaryIndex = 0;
    if (colorChannelBitDepth === 8) {
      var secondaryIndex = 0;
      while (primaryIndex < imageDataSourceLength) {
        // Only modify opaque pixels
        if (pixelDataArray[primaryIndex + 3] === 0xff) {
          pixelDataArray[primaryIndex++] = this.bytePayload[secondaryIndex++];
          pixelDataArray[primaryIndex++] = this.bytePayload[secondaryIndex++];
          pixelDataArray[primaryIndex++] = this.bytePayload[secondaryIndex++];
          primaryIndex++; // Skip alpha
        } else {
          primaryIndex += 4; // Skip transparent/translucent
        }
      }
    } else {
      var bitHelper = new BitSequenceHelper(this.bytePayload);
      var maskValue = 0xff ^ (0xff >>> (8 - colorChannelBitDepth));
      while (primaryIndex < imageDataSourceLength) {
        // Only modify opaque pixels
        if (pixelDataArray[primaryIndex + 3] === 0xff) {
          pixelDataArray[primaryIndex] = (pixelDataArray[primaryIndex++] & maskValue) | bitHelper.retrieveBits(colorChannelBitDepth);
          pixelDataArray[primaryIndex] = (pixelDataArray[primaryIndex++] & maskValue) | bitHelper.retrieveBits(colorChannelBitDepth);
          pixelDataArray[primaryIndex] = (pixelDataArray[primaryIndex++] & maskValue) | bitHelper.retrieveBits(colorChannelBitDepth);
          primaryIndex++; // Skip alpha
        } else {
          primaryIndex += 4; // Skip transparent/translucent
        }
      }
    }
    renderContext.putImageData(imageDataObj, 0, 0);
    return drawingSurface;
  },

  // Computes the maximum data capacity for a given image
  calculateStorageCapacity: function (targetRaster, colorChannelBitDepth) {
    if (typeof colorChannelBitDepth === "undefined") {
      colorChannelBitDepth = 8;
    }
    var drawingSurface = document.createElement('canvas');
    var renderContext = drawingSurface.getContext('2d');
    drawingSurface.width = targetRaster.width;
    drawingSurface.height = targetRaster.height;
    renderContext.drawImage(targetRaster, 0, 0);
    var imageDataObj = renderContext.getImageData(0, 0, drawingSurface.width, drawingSurface.height);
    var pixelDataArray = imageDataObj.data;
    var imageDataSourceLength = pixelDataArray.length;
    var primaryIndex = 0;
    var totalBits = 0;
    var bitsPerOpaquePixel = colorChannelBitDepth * 3;
    while (primaryIndex < imageDataSourceLength) {
      // Only count opaque pixels for storage
      if (pixelDataArray[primaryIndex + 3] === 0xff) {
        totalBits += bitsPerOpaquePixel;
      }
      primaryIndex += 4; // Move to the next pixel
    }
    return totalBits;
  },

  // Helper function to encode a string to UTF-8 byte array
  // Based on webtoolkit.info/javascript-base64.html and stackoverflow.com/questions/246801
  encodeToUtf8Bytes: function (inputString) {
    var tempByteArray = [];
    var inputLength = inputString.length;
    for (var charIndex = 0; charIndex < inputLength; charIndex++) {
      var charValue = inputString.charCodeAt(charIndex);
      if (charValue < 128) {
        tempByteArray.push(charValue);
      } else if ((charValue > 127) && (charValue < 2048)) {
        tempByteArray.push((charValue >> 6) | 192);
        tempByteArray.push((charValue & 63) | 128);
      } else {
        tempByteArray.push((charValue >> 12) | 224);
        tempByteArray.push(((charValue >> 6) & 63) | 128);
        tempByteArray.push((charValue & 63) | 128);
      }
    }
    return new Uint8Array(tempByteArray);
  },

  // Helper function to decode a UTF-8 byte array to a string
  // Based on webtoolkit.info/javascript-base64.html and stackoverflow.com/questions/246801
  decodeUtf8Bytes: function (byteSequence) {
    var inputLength = byteSequence.byteLength;
    var resultString = "";
    var primaryIndex = 0;
    while (primaryIndex < inputLength) {
      var currentByte = byteSequence[primaryIndex];
      if (currentByte < 128) {
        resultString += String.fromCharCode(currentByte);
        primaryIndex++;
      } else if ((currentByte > 191) && (currentByte < 224) && (primaryIndex + 1 < inputLength)) {
        resultString += String.fromCharCode(((currentByte & 31) << 6) | (byteSequence[primaryIndex + 1] & 63));
        primaryIndex += 2;
      } else if (primaryIndex + 2 < inputLength) {
        resultString += String.fromCharCode(((currentByte & 15) << 12) | ((byteSequence[primaryIndex + 1] & 63) << 6) | (byteSequence[primaryIndex + 2] & 63));
        primaryIndex += 3;
      }
    }
    return resultString;
  }

};


window.BitSequenceHelper = function (byteArray) {

  // The underlying Uint8Array for bit operations
  this.byteArray = byteArray;
  // Current byte position in the array
  this.bytePointer = 0;
  // Number of unread/unwritten bits in the current byte
  this.remainingBitsInByte = 0;

};

window.BitSequenceHelper.prototype = {

  // Appends a specified number of bits from a value to the stream
  appendBits: function (numBits, sourceValue) {
    if (numBits === 0) {
      return;
    }
    // Mask the source value to only keep the relevant bits
    sourceValue &= (0xffffffff >>> (32 - numBits));
    var consumedBits;
    if (this.remainingBitsInByte > 0) {
      // If there are bits remaining in the current byte
      if (this.remainingBitsInByte > numBits) {
        // Current byte can hold all new bits
        this.byteArray[this.bytePointer - 1] |= sourceValue << (this.remainingBitsInByte - numBits);
        consumedBits = numBits;
        this.remainingBitsInByte -= numBits;
      } else if (this.remainingBitsInByte === numBits) {
        // Current byte can exactly hold all new bits
        this.byteArray[this.bytePointer - 1] |= sourceValue;
        consumedBits = numBits;
        this.remainingBitsInByte = 0;
      } else {
        // Current byte can hold only a part of the new bits
        this.byteArray[this.bytePointer - 1] |= sourceValue >> (numBits - this.remainingBitsInByte);
        consumedBits = this.remainingBitsInByte;
        this.remainingBitsInByte = 0;
      }
    } else {
      // No bits pending in current byte, start a new one
      consumedBits = Math.min(8, numBits);
      this.remainingBitsInByte = 8 - consumedBits;
      this.byteArray[this.bytePointer++] = (sourceValue >> (numBits - consumedBits)) << this.remainingBitsInByte;
    }
    numBits -= consumedBits;
    // Recursively write remaining bits if any
    if (numBits > 0) {
      this.appendBits(numBits, sourceValue);
    }
  },

  // Retrieves a specified number of bits from the stream
  retrieveBits: function (numBits, accumulatorBuffer) {
    if (typeof accumulatorBuffer === "undefined") {
      accumulatorBuffer = 0;
    }
    if (numBits === 0) {
      return accumulatorBuffer;
    }
    var partialValue;
    var consumedBits;
    if (this.remainingBitsInByte > 0) {
      // Bits remaining in the current byte from a previous read
      var currentByte = this.byteArray[this.bytePointer - 1] & (0xff >> (8 - this.remainingBitsInByte));
      consumedBits = Math.min(this.remainingBitsInByte, numBits);
      this.remainingBitsInByte -= consumedBits;
      partialValue = currentByte >> this.remainingBitsInByte;
    } else {
      // No bits pending, read from the next full byte
      consumedBits = Math.min(8, numBits);
      this.remainingBitsInByte = 8 - consumedBits;
      partialValue = this.byteArray[this.bytePointer++] >> this.remainingBitsInByte;
    }
    numBits -= consumedBits;
    // Accumulate the read bits
    accumulatorBuffer = (accumulatorBuffer << consumedBits) | partialValue;
    // Recursively read remaining bits if any
    return (numBits > 0) ? this.retrieveBits(numBits, accumulatorBuffer) : accumulatorBuffer;
  },

  // Sets the current reading/writing position in the bit stream
  jumpToBitPosition: function (targetBitPosition) {
    this.bytePointer = (targetBitPosition / 8) | 0;
    this.remainingBitsInByte = targetBitPosition % 8;
    if (this.remainingBitsInByte > 0) {
      // Adjust pointer and remaining bits if not starting at a byte boundary
      this.remainingBitsInByte = 8 - this.remainingBitsInByte;
      this.bytePointer++;
    }
  }

};