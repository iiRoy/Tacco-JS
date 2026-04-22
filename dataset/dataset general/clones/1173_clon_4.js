(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  currentGlobalScope._GLOBAL_APP_CONTEXT_ = currentGlobalScope._GLOBAL_APP_CONTEXT_ || {};
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);

  const testForNativeTypedArrays = () => {
    try {
      new currentGlobalScope.Uint8Array(0);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (testForNativeTypedArrays()) {
    if (!currentGlobalScope.Uint8Array.prototype.subarray) {
      const generateSubView = function(beginOffset, endOffset) {
        return new this.constructor(this.slice(beginOffset, endOffset));
      };
      currentGlobalScope.Uint8Array.prototype.subarray = generateSubView;
      currentGlobalScope.Float32Array.prototype.subarray = generateSubView;
    }

    if (!currentGlobalScope.Float64Array) {
      currentGlobalScope.Float64Array = currentGlobalScope.Float32Array;
    }
    return;
  }

  const transferValuesToArray = function(targetContainer, sourceCollection, startPosition = 0) {
    currentGlobalScope.Array.prototype.forEach.call(sourceCollection, (valueItem, indexPos) => {
      targetContainer[startPosition + indexPos] = valueItem & 0xFF;
    });
  };

  const createSegmentFromBuffer = function(startIdx, endIdx) {
    return new DataBufferEmulator(currentGlobalScope.Array.prototype.slice.call(this, startIdx, endIdx));
  };

  const DataBufferEmulator = function(initialPayload) {
    let internalDataStorage;
    if (typeof initialPayload === 'number') {
      internalDataStorage = currentGlobalScope.Array.from({ length: initialPayload }, () => 0);
    } else if (currentGlobalScope.Array.isArray(initialPayload) || (typeof initialPayload === 'object' && 'slice' in initialPayload)) {
      internalDataStorage = currentGlobalScope.Array.from(initialPayload);
    } else {
      internalDataStorage = currentGlobalScope.Array.from(initialPayload || []);
    }

    internalDataStorage.viewRange = createSegmentFromBuffer;
    internalDataStorage.underlyingMemoryBlob = internalDataStorage;
    internalDataStorage.allocatedLength = internalDataStorage.length;
    internalDataStorage.injectData = transferValuesToArray;

    if (typeof initialPayload === 'object' && initialPayload && initialPayload.underlyingMemoryBlob) {
      internalDataStorage.underlyingMemoryBlob = initialPayload.underlyingMemoryBlob;
    }

    return internalDataStorage;
  };

  ['Uint8Array', 'Uint32Array', 'Int32Array', 'Uint16Array', 'Float32Array', 'Float64Array'].forEach(bufferTypeName => {
    currentGlobalScope[bufferTypeName] = DataBufferEmulator;
  });
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (!currentGlobalScope.URL) {
    if (currentGlobalScope.webkitURL) {
      currentGlobalScope.Object.defineProperty(currentGlobalScope, 'URL', {
        value: currentGlobalScope.webkitURL,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
  }
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (typeof currentGlobalScope.Object.create === 'function') {
    return;
  }

  currentGlobalScope.Object.create = (basePrototype) => {
    if (basePrototype === null) {
      return {};
    }
    const FabricationConstructor = function() {};
    FabricationConstructor.prototype = basePrototype;
    return new FabricationConstructor();
  };
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);

  let definitionCapabilityConfirmed = false;
  try {
    const mockImage = new currentGlobalScope.Image();
    currentGlobalScope.Object.defineProperty(mockImage, 'testAttribute', { value: 'confirmed' });
    if (mockImage.testAttribute === 'confirmed') {
      const CustomPrototype = function() {};
      CustomPrototype.prototype = { get specificField() { return 'initial'; } };
      currentGlobalScope.Object.defineProperty(new CustomPrototype(), 'specificField', { value: 'changed', configurable: true, enumerable: true, writable: false });
      definitionCapabilityConfirmed = true;
    }
  } catch (e) {
    definitionCapabilityConfirmed = false;
  }

  if (definitionCapabilityConfirmed) {
    return;
  }

  currentGlobalScope.Object.defineProperty = (targetElement, propertyKey, propertyDescriptor) => {
    delete targetElement[propertyKey];

    if ('get' in propertyDescriptor && typeof targetElement.__defineGetter__ === 'function') {
      targetElement.__defineGetter__(propertyKey, propertyDescriptor['get']);
    }
    if ('set' in propertyDescriptor && typeof targetElement.__defineSetter__ === 'function') {
      targetElement.__defineSetter__(propertyKey, propertyDescriptor['set']);
    }
    if ('value' in propertyDescriptor) {
      if (typeof targetElement.__defineSetter__ === 'function') {
        targetElement.__defineSetter__(propertyKey, function(newAssignment) {
          this.__defineGetter__(propertyKey, () => newAssignment);
          return newAssignment;
        });
      }
      targetElement[propertyKey] = propertyDescriptor.value;
    }
  };
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (typeof currentGlobalScope.Object.keys === 'function') {
    return;
  }

  currentGlobalScope.Object.keys = (inputSubject) => {
    const foundKeys = [];
    for (const itemIdentifier in inputSubject) {
      if (currentGlobalScope.Object.prototype.hasOwnProperty.call(inputSubject, itemIdentifier)) {
        foundKeys.push(itemIdentifier);
      }
    }
    return foundKeys;
  };
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (typeof currentGlobalScope.FileReader === 'undefined') {
    return;
  }

  const readerProto = currentGlobalScope.FileReader.prototype;
  if ('readAsArrayBuffer' in readerProto) {
    return;
  }

  currentGlobalScope.Object.defineProperty(readerProto, 'readAsArrayBuffer', {
    value: function(inputBlob) {
      const auxiliaryReader = new currentGlobalScope.FileReader();
      const clientInstance = this;

      auxiliaryReader.onload = (eventDetails) => {
        const rawStringData = eventDetails.target.result;
        const dataSize = rawStringData.length;
        const resultantBuffer = new currentGlobalScope.ArrayBuffer(dataSize);
        const byteSequence = new currentGlobalScope.Uint8Array(resultantBuffer);

        currentGlobalScope.Array.from({ length: dataSize }).forEach((_, iterationIndex) => {
          byteSequence[iterationIndex] = rawStringData.charCodeAt(iterationIndex) & 0xFF;
        });

        currentGlobalScope.Object.defineProperty(clientInstance, 'result', {
          value: resultantBuffer,
          enumerable: true,
          writable: false,
          configurable: true
        });

        const completionEvent = currentGlobalScope.document.createEvent('Event');
        completionEvent.initEvent('load', false, false);
        clientInstance.dispatchEvent(completionEvent);
      };
      auxiliaryReader.readAsBinaryString(inputBlob);
    }
  });
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  const xhrProto = currentGlobalScope.XMLHttpRequest.prototype;

  if (!('overrideMimeType' in xhrProto)) {
    currentGlobalScope.Object.defineProperty(xhrProto, 'overrideMimeType', {
      value: function(mimeSetting) {}
    });
  }

  const responseCapabilityPresent = (
    'response' in xhrProto ||
    'mozResponseArrayBuffer' in xhrProto ||
    'mozResponse' in xhrProto ||
    'responseArrayBuffer' in xhrProto
  );
  if (responseCapabilityPresent) {
    return;
  }

  if (typeof currentGlobalScope.VBArray !== 'undefined') {
    currentGlobalScope.Object.defineProperty(xhrProto, 'response', {
      get: function() {
        return new currentGlobalScope.Uint8Array(new currentGlobalScope.VBArray(this.responseBody).toArray());
      }
    });
    return;
  }

  if (typeof xhrProto.overrideMimeType === 'function') {
    currentGlobalScope.Object.defineProperty(xhrProto, 'responseType', {
      set: function(desiredType) {
        if (desiredType === 'arraybuffer') {
          this.overrideMimeType('text/plain; charset=x-user-defined');
        }
      }
    });
  }

  currentGlobalScope.Object.defineProperty(xhrProto, 'response', {
    get: function() {
      const receivedText = this.responseText;
      const charCount = receivedText.length;
      const dataOutput = new currentGlobalScope.Uint8Array(charCount);

      currentGlobalScope.Array.from({ length: charCount }).forEach((_, charIdx) => {
        dataOutput[charIdx] = receivedText.charCodeAt(charIdx) & 0xFF;
      });
      return dataOutput;
    }
  });
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if ('btoa' in currentGlobalScope) {
    return;
  }

  const base64CharSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  currentGlobalScope.btoa = (sourceInputString) => {
    let finalEncodedString = '';
    let readPointer = 0;
    const stringLength = sourceInputString.length;

    while (readPointer < stringLength) {
      const byteOne = sourceInputString.charCodeAt(readPointer++) & 0xFF;
      const byteTwo = sourceInputString.charCodeAt(readPointer++) & 0xFF;
      const byteThree = sourceInputString.charCodeAt(readPointer++) & 0xFF;

      const groupA = byteOne >> 2;
      const groupB = ((byteOne & 0x03) << 4) | (byteTwo >> 4);
      const groupC = ((byteTwo & 0x0F) << 2) | (byteThree >> 6);
      const groupD = byteThree & 0x3F;

      finalEncodedString += base64CharSet.charAt(groupA) +
                           base64CharSet.charAt(groupB) +
                           (currentGlobalScope.isNaN(byteTwo) ? '=' : base64CharSet.charAt(groupC)) +
                           (currentGlobalScope.isNaN(byteThree) ? '=' : base64CharSet.charAt(groupD));
    }
    return finalEncodedString;
  };
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if ('atob' in currentGlobalScope) {
    return;
  }

  const base64AlphabetMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  currentGlobalScope.atob = (encodedDataString) => {
    encodedDataString = encodedDataString.replace(/=+$/, '');
    if (encodedDataString.length % 4 === 1) {
      throw new currentGlobalScope.Error('Invalid input for base64 decoding: malformed length.');
    }

    let byteAccumulator = 0,
        bitBuffer = 0,
        indexPosition = 0,
        decodedResult = '';

    for (
      let charFromInput;
      (charFromInput = encodedDataString.charAt(indexPosition++));
    ) {
      const charCodeValue = base64AlphabetMap.indexOf(charFromInput);

      if (charCodeValue !== -1) {
        bitBuffer = byteAccumulator % 4 ? bitBuffer * 64 + charCodeValue : charCodeValue;
        byteAccumulator++;

        if (byteAccumulator % 4) {
          decodedResult += currentGlobalScope.String.fromCharCode(255 & (bitBuffer >> (-2 * byteAccumulator & 6)));
        }
      }
    }
    return decodedResult;
  };
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (typeof currentGlobalScope.Function.prototype.bind === 'function') {
    return;
  }

  currentGlobalScope.Function.prototype.bind = function(executionContext) {
    const sourceCallable = this;
    const initialParameters = currentGlobalScope.Array.prototype.slice.call(arguments, 1);

    const boundCallable = function() {
      const runtimeParameters = currentGlobalScope.Array.prototype.slice.call(arguments);
      const combinedParameters = initialParameters.concat(runtimeParameters);
      return sourceCallable.apply(executionContext, combinedParameters);
    };
    return boundCallable;
  };
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (typeof currentGlobalScope.document === 'undefined' || typeof currentGlobalScope.HTMLElement === 'undefined') {
    return;
  }

  const tempTestDiv = currentGlobalScope.document.createElement('div');
  if ('dataset' in tempTestDiv) {
    return;
  }

  currentGlobalScope.Object.defineProperty(currentGlobalScope.HTMLElement.prototype, 'dataset', {
    get: function() {
      if (this.htmlAttributeData) {
        return this.htmlAttributeData;
      }

      const collectedAttributes = {};
      currentGlobalScope.Array.from(this.attributes).forEach(attrObject => {
        const attributeName = attrObject.name;
        if (attributeName.startsWith('data-')) {
          const keyRemainder = attributeName.substring(5);
          const camelKey = keyRemainder.split('-').map((segment, index) => {
            return index === 0 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1);
          }).join('');
          collectedAttributes[camelKey] = attrObject.value;
        }
      });

      currentGlobalScope.Object.defineProperty(this, 'htmlAttributeData', {
        value: collectedAttributes,
        writable: false,
        enumerable: false
      });
      return collectedAttributes;
    },
    enumerable: true
  });
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (typeof currentGlobalScope.document === 'undefined' || typeof currentGlobalScope.HTMLElement === 'undefined') {
    return;
  }

  const tempTestDiv = currentGlobalScope.document.createElement('div');
  if ('classList' in tempTestDiv) {
    return;
  }

  const updateElementClassState = (targetNode, classToken, addAction, removeAction) => {
    let currentClassString = targetNode.className || '';
    let classTokensArray = currentClassString.split(/\s+/g).filter(Boolean);
    const tokenPresenceIndex = classTokensArray.indexOf(classToken);
    const tokenAlreadyExists = tokenPresenceIndex >= 0;

    if (!tokenAlreadyExists && addAction) {
      classTokensArray.push(classToken);
    }
    if (tokenAlreadyExists && removeAction) {
      classTokensArray.splice(tokenPresenceIndex, 1);
    }
    targetNode.className = classTokensArray.join(' ');
    return tokenAlreadyExists;
  };

  const classListFacade = {
    appendToken: function(tokenValue) {
      updateElementClassState(this.owningElement, tokenValue, true, false);
    },
    containsToken: function(tokenValue) {
      return updateElementClassState(this.owningElement, tokenValue, false, false);
    },
    removeToken: function(tokenValue) {
      updateElementClassState(this.owningElement, tokenValue, false, true);
    },
    toggleToken: function(tokenValue) {
      updateElementClassState(this.owningElement, tokenValue, true, true);
    }
  };

  currentGlobalScope.Object.defineProperty(currentGlobalScope.HTMLElement.prototype, 'classList', {
    get: function() {
      if (this.managedClassList) {
        return this.managedClassList;
      }

      const facadeInstance = currentGlobalScope.Object.assign(
        currentGlobalScope.Object.create(classListFacade),
        { owningElement: this }
      );

      currentGlobalScope.Object.defineProperty(this, 'managedClassList', {
        value: facadeInstance,
        writable: false,
        enumerable: false
      });
      return facadeInstance;
    },
    enumerable: true
  });
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);

  if (!('console' in currentGlobalScope)) {
    currentGlobalScope.console = {
      log: () => {},
      error: () => {},
      warn: () => {}
    };
  } else if (!('bind' in currentGlobalScope.console.log)) {
    const createSafeConsoleWrapper = (originalConsoleMethod) => {
      return (...args) => originalConsoleMethod.apply(currentGlobalScope.console, args);
    };
    currentGlobalScope.console.log = createSafeConsoleWrapper(currentGlobalScope.console.log);
    currentGlobalScope.console.error = createSafeConsoleWrapper(currentGlobalScope.console.error);
    currentGlobalScope.console.warn = createSafeConsoleWrapper(currentGlobalScope.console.warn);
  }
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (typeof currentGlobalScope.document === 'undefined' || typeof currentGlobalScope.navigator === 'undefined') {
    return;
  }

  const checkNodeForDisabledStatus = (elementRef) => {
    if (!elementRef) return false;
    return elementRef.hasAttribute('disabled') || checkNodeForDisabledStatus(elementRef.parentNode);
  };

  const haltClickIfTargetIsDisabled = (eventObject) => {
    if (checkNodeForDisabledStatus(eventObject.target)) {
      eventObject.stopImmediatePropagation();
    }
  };

  const userAgentString = currentGlobalScope.navigator.userAgent;
  if (/Opera|OPR\//.test(userAgentString)) {
    currentGlobalScope.document.addEventListener('click', haltClickIfTargetIsDisabled, true);
  }
})();

(function() {
  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (typeof currentGlobalScope.navigator === 'undefined') {
    return;
  }

  if ('language' in currentGlobalScope.navigator) {
    return;
  }

  currentGlobalScope.Object.defineProperty(currentGlobalScope.navigator, 'language', {
    get: function() {
      const userLocale = this.userLanguage || 'en-US';
      const firstTwoChars = userLocale.slice(0, 2).toLowerCase();
      const restOfChars = userLocale.slice(2).toUpperCase();
      return firstTwoChars + restOfChars;
    },
    enumerable: true
  });
})();

(function() {
  const applicationContext = (typeof window !== 'undefined' ? window : this)._GLOBAL_APP_CONTEXT_;
  if (!applicationContext) return;

  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (typeof currentGlobalScope.navigator === 'undefined' || typeof currentGlobalScope.HTMLElement === 'undefined') {
    return;
  }

  const isSafariVariant = (function() {
    try {
      return String(currentGlobalScope.HTMLElement).indexOf('Constructor') > -1;
    } catch (e) {
      return false;
    }
  })();

  const isOutdatedAndroid = /Android\s[0-2]\D/.test(currentGlobalScope.navigator.userAgent);

  if (isSafariVariant || isOutdatedAndroid) {
    applicationContext.rangeRequestSuppression = true;
  }
})();

(function() {
  const globalAppConfig = (typeof window !== 'undefined' ? window : this)._GLOBAL_APP_CONTEXT_;
  if (!globalAppConfig) return;

  const currentGlobalScope = (typeof window !== 'undefined' ? window : this);
  if (!(currentGlobalScope.history && typeof currentGlobalScope.history.pushState === 'function')) {
    globalAppConfig.historyModificationBlocked = true;
  }
})();