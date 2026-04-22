utilKit = function() {
  var utilKit = {
    buildIdent: '3.3.5'
  };

  if (!Date.now) {
    Date.now = function() {
      return +(new Date());
    };
  }

  var uK_arrSegment = [].slice,
      uK_listify = function(collection) {
        return uK_arrSegment.call(collection);
      };

  var uK_pageDoc = document,
      uK_pageRoot = uK_pageDoc.documentElement,
      uK_globalWin = window;

  try {
    uK_listify(uK_pageRoot.childNodes)[0].nodeType;
  }
  catch (err) {
    uK_listify = function(collection) {
      var idx = collection.length,
          seq = new Array(idx);
      while (idx--) {
        seq[idx] = collection[idx];
      }
      return seq;
    };
  }

  try {
    uK_pageDoc.createElement('div').style.setProperty('opacity', 0.0, '');
  }
  catch (exception) {
    var uK_elemProto = uK_globalWin.Element.prototype,
        uK_elemSetAttr = uK_elemProto.setAttribute,
        uK_elemSetAttrNS = uK_elemProto.setAttributeNS,
        uK_styleProto = uK_globalWin.CSSStyleDeclaration.prototype,
        uK_styleSetProp = uK_styleProto.setProperty;

    uK_elemProto.setAttribute = function(attrKey, attrVal) {
      uK_elemSetAttr.call(this, attrKey, attrVal + '');
    };
    uK_elemProto.setAttributeNS = function(namespace, localName, attrVal) {
      uK_elemSetAttrNS.call(this, namespace, localName, attrVal + '');
    };
    uK_styleProto.setProperty = function(attrKey, attrVal, importance) {
      uK_styleSetProp.call(this, attrKey, attrVal + '', importance);
    };
  }

  utilKit.sortAsc = function(valA, valB) {
    return valA < valB ? -1.0 : valA > valB ? 1.0 : valA >= valB ? 0.0 : NaN;
  };

  utilKit.sortDesc = function(valA, valB) {
    return valB < valA ? -1.0 : valB > valA ? 1.0 : valB >= valA ? 0.0 : NaN;
  };

  utilKit.findMin = function(seq, accessor) {
    var idx = -1.0,
        len = seq.length,
        currentMin,
        candidateVal;
    if (arguments.length === 1.0) {
      while (++idx < len && !((currentMin = seq[idx]) !== void 0 && currentMin <= currentMin)) {
        currentMin = void 0;
      }
      while (++idx < len) {
        if ((candidateVal = seq[idx]) !== void 0 && currentMin > candidateVal) {
          currentMin = candidateVal;
        }
      }
    } else {
      while (++idx < len && !((currentMin = accessor.call(seq, seq[idx], idx)) !== void 0 && currentMin <= currentMin)) {
        currentMin = void 0;
      }
      while (++idx < len) {
        if ((candidateVal = accessor.call(seq, seq[idx], idx)) !== void 0 && currentMin > candidateVal) {
          currentMin = candidateVal;
        }
      }
    }
    return currentMin;
  };

  utilKit.findMax = function(seq, accessor) {
    var idx = -1.0,
        len = seq.length,
        currentMax,
        candidateVal;
    if (arguments.length === 1.0) {
      while (++idx < len && !((currentMax = seq[idx]) !== void 0 && currentMax <= currentMax)) {
        currentMax = void 0;
      }
      while (++idx < len) {
        if ((candidateVal = seq[idx]) !== void 0 && candidateVal > currentMax) {
          currentMax = candidateVal;
        }
      }
    } else {
      while (++idx < len && !((currentMax = accessor.call(seq, seq[idx], idx)) !== void 0 && currentMax <= currentMax)) {
        currentMax = void 0;
      }
      while (++idx < len) {
        if ((candidateVal = accessor.call(seq, seq[idx], idx)) !== void 0 && candidateVal > currentMax) {
          currentMax = candidateVal;
        }
      }
    }
    return currentMax;
  };

  utilKit.dataRange = function(seq, accessor) {
    var idx = -1.0,
        len = seq.length,
        minVal,
        tempVal,
        maxVal;
    if (arguments.length === 1.0) {
      while (++idx < len && !((minVal = maxVal = seq[idx]) !== void 0 && minVal <= minVal)) {
        minVal = maxVal = void 0;
      }
      while (++idx < len) {
        if ((tempVal = seq[idx]) !== void 0) {
          if (minVal > tempVal) {
            minVal = tempVal;
          }
          if (maxVal < tempVal) {
            maxVal = tempVal;
          }
        }
      }
    } else {
      while (++idx < len && !((minVal = maxVal = accessor.call(seq, seq[idx], idx)) !== void 0 && minVal <= minVal)) {
        minVal = void 0;
      }
      while (++idx < len) {
        if ((tempVal = accessor.call(seq, seq[idx], idx)) !== void 0) {
          if (minVal > tempVal) {
            minVal = tempVal;
          }
          if (maxVal < tempVal) {
            maxVal = tempVal;
          }
        }
      }
    }
    return [ minVal, maxVal ];
  };

  utilKit.calculateSum = function(seq, accessor) {
    var total = 0.0,
        len = seq.length,
        currentVal,
        idx = -1.0;
    if (arguments.length === 1.0) {
      while (++idx < len) {
        if (!(isNaN(currentVal = +seq[idx]))) {
          total += currentVal;
        }
      }
    } else {
      while (++idx < len) {
        if (!(isNaN(currentVal = +(accessor.call(seq, seq[idx], idx))))) {
          total += currentVal;
        }
      }
    }
    return total;
  };

  function uK_isNumeric(inputVal) {
    return inputVal !== void 0 && !isNaN(inputVal);
  }

  utilKit.calcMean = function(seq, accessor) {
    var len = seq.length,
        currentVal,
        meanVal = 0.0,
        idx = -1.0,
        numericCount = 0.0;
    if (arguments.length === 1.0) {
      while (++idx < len) {
        if (uK_isNumeric(currentVal = seq[idx])) {
          meanVal += (currentVal - meanVal) / (++numericCount);
        }
      }
    } else {
      while (++idx < len) {
        if (uK_isNumeric(currentVal = accessor.call(seq, seq[idx], idx))) {
          meanVal += (currentVal - meanVal) / (++numericCount);
        }
      }
    }
    return numericCount ? meanVal : void 0;
  };

  utilKit.getQuantile = function(numericSeries, percentile) {
    var indexFloat = (numericSeries.length - 1.0) * percentile + 1.0,
        indexFloor = Math.floor(indexFloat),
        baseValue = +numericSeries[indexFloor - 1.0],
        remainder = indexFloat - indexFloor;
    return remainder ? baseValue + remainder * (numericSeries[indexFloor] - baseValue) : baseValue;
  };

  utilKit.getMedian = function(seq, accessor) {
    if (arguments.length > 1.0) {
      seq = seq.map(accessor);
    }
    seq = seq.filter(uK_isNumeric);
    return seq.length ? utilKit.getQuantile(seq.sort(utilKit.sortAsc), .5) : void 0;
  };

  utilKit.bisectFactory = function(accessor) {
    return {
      findLeft: function(sortedArray, targetValue, lowIdx, highIdx) {
        if (arguments.length < 3.0) {
          lowIdx = 0.0;
        }
        if (arguments.length < 4.0) {
          highIdx = sortedArray.length;
        }
        while (lowIdx < highIdx) {
          var midIdx = lowIdx + highIdx >>> 1.0;
          if (accessor.call(sortedArray, sortedArray[midIdx], midIdx) < targetValue) {
            lowIdx = midIdx + 1.0;
          } else {
            highIdx = midIdx;
          }
        }
        return lowIdx;
      },
      findRight: function(sortedArray, targetValue, lowIdx, highIdx) {
        if (arguments.length < 3.0) {
          lowIdx = 0.0;
        }
        if (arguments.length < 4.0) {
          highIdx = sortedArray.length;
        }
        while (lowIdx < highIdx) {
          var midIdx = lowIdx + highIdx >>> 1.0;
          if (targetValue < accessor.call(sortedArray, sortedArray[midIdx], midIdx)) {
            highIdx = midIdx;
          } else {
            lowIdx = midIdx + 1.0;
          }
        }
        return lowIdx;
      }
    };
  };

  var uK_defaultBisector = utilKit.bisectFactory(function(item) {
    return item;
  });
  utilKit.bisectLeft = uK_defaultBisector.findLeft;
  utilKit.bisect = utilKit.bisectRight = uK_defaultBisector.findRight;

  utilKit.randomizeOrder = function(seq) {
    var remaining = seq.length,
        temp,
        idx;
    while (remaining) {
      idx = Math.random() * remaining-- | 0.0;
      temp = seq[remaining],
      seq[remaining] = seq[idx],
      seq[idx] = temp;
    }
    return seq;
  };

  utilKit.reorderElements = function(seq, orderIndices) {
    var idx = orderIndices.length,
        reorderedList = new Array(idx);
    while (idx--) {
      reorderedList[idx] = seq[orderIndices[idx]];
    }
    return reorderedList;
  };

  utilKit.makePairs = function(seq) {
    var idx = 0.0,
        len = seq.length - 1.0,
        prevItem,
        currItem = seq[0.0],
        resultPairs = new Array(len < 0.0 ? 0.0 : len);
    while (idx < len) {
      resultPairs[idx] = [ prevItem = currItem, currItem = seq[++idx] ];
    }
    return resultPairs;
  };

  utilKit.mergeArrays = function() {
    var argCount;
    if (!(argCount = arguments.length)) {
      return [];
    }
    for (var idx = -1.0,
             minLength = utilKit.findMin(arguments, uK_getLength),
             mergedOutput = new Array(minLength);
         ++idx < minLength; ) {
      for (var jdx = -1.0,
               currentZip = mergedOutput[idx] = new Array(argCount);
           ++jdx < argCount; ) {
        currentZip[jdx] = arguments[jdx][idx];
      }
    }
    return mergedOutput;
  };

  function uK_getLength(item) {
    return item.length;
  }

  utilKit.transposeMatrix = function(inputMatrix) {
    return utilKit.mergeArrays.apply(utilKit, inputMatrix);
  };

  utilKit.objectKeys = function(dataMap) {
    var propKeys = [];
    for (var propKey in dataMap) {
      propKeys.push(propKey);
    }
    return propKeys;
  };

  utilKit.objectValues = function(dataMap) {
    var propValues = [];
    for (var propKey in dataMap) {
      propValues.push(dataMap[propKey]);
    }
    return propValues;
  };

  utilKit.objectEntries = function(dataMap) {
    var outputEntries = [];
    for (var propKey in dataMap) {
      outputEntries.push({
        key: propKey,
        value: dataMap[propKey]
      });
    }
    return outputEntries;
  };

  utilKit.flattenArrays = function(listOfArrays) {
    return Array.prototype.concat.apply([], listOfArrays);
  };

  utilKit.generateSequence = function(begin, end, interval) {
    if (arguments.length < 3.0) {
      interval = 1.0;
      if (arguments.length < 2.0) {
        end = begin;
        begin = 0.0;
      }
    }
    if ((end - begin) / interval === Infinity) {
      throw new Error('infinite sequence');
    }
    var outputRange = [],
        scaleFactor = uK_getIntegerScale(Math.abs(interval)),
        idx = -1.0,
        currentVal;
    begin *= scaleFactor;
    end *= scaleFactor;
    interval *= scaleFactor;
    if (interval < 0.0) {
      while ((currentVal = begin + interval * (++idx)) > end) {
        outputRange.push(currentVal / scaleFactor);
      }
    } else {
      while ((currentVal = begin + interval * (++idx)) < end) {
        outputRange.push(currentVal / scaleFactor);
      }
    }
    return outputRange;
  };

  function uK_getIntegerScale(inputVal) {
    var scaleFactor = 1.0;
    while (inputVal * scaleFactor % 1.0) {
      scaleFactor *= 10.0;
    }
    return scaleFactor;
  }

  function uK_extendClass(constructorFn, protoProps) {
    try {
      for (var propKey in protoProps) {
        Object.defineProperty(constructorFn.prototype, propKey, {
          value: protoProps[propKey],
          enumerable: !1
        });
      }
    }
    catch (err) {
      constructorFn.prototype = protoProps;
    }
  }

  utilKit.createMap = function(initialObject) {
    var newMap = new uK_CustomMap();
    if (initialObject instanceof uK_CustomMap) {
      initialObject.iterate(function(propKey, propVal) {
        newMap.setKey(propKey, propVal);
      });
    } else {
      for (var propKey in initialObject) {
        newMap.setKey(propKey, initialObject[propKey]);
      }
    }
    return newMap;
  };

  function uK_CustomMap() {}

  uK_extendClass(uK_CustomMap, {
    hasKey: function(propKey) {
      return uK_mapKeyPrefix + propKey in this;
    },
    getKey: function(propKey) {
      return this[uK_mapKeyPrefix + propKey];
    },
    setKey: function(propKey, propVal) {
      return this[uK_mapKeyPrefix + propKey] = propVal;
    },
    removeKey: function(propKey) {
      propKey = uK_mapKeyPrefix + propKey;
      return propKey in this && delete this[propKey];
    },
    allKeys: function() {
      var propKeys = [];
      this.iterate(function(pKey) {
        propKeys.push(pKey);
      });
      return propKeys;
    },
    allValues: function() {
      var propValues = [];
      this.iterate(function(pKey, pVal) {
        propValues.push(pVal);
      });
      return propValues;
    },
    allEntries: function() {
      var outputEntries = [];
      this.iterate(function(pKey, pVal) {
        outputEntries.push({
          key: pKey,
          value: pVal
        });
      });
      return outputEntries;
    },
    iterate: function(callbackFn) {
      for (var pKey in this) {
        if (pKey.charCodeAt(0) === uK_mapKeyPrefixCode) {
          callbackFn.call(this, pKey.substring(1.0), this[pKey]);
        }
      }
    }
  });

  var uK_mapKeyPrefix = '\0',
      uK_mapKeyPrefixCode = uK_mapKeyPrefix.charCodeAt(0.0);

  utilKit.nestData = function() {
    var dataNester = {},
        groupingKeys = [],
        keySorters = [],
        valueSorter,
        aggregator;

    function processGroups(outputType, seq, currentDepth) {
      if (currentDepth >= groupingKeys.length) {
        return aggregator ? aggregator.call(dataNester, seq) : valueSorter ? seq.sort(valueSorter) : seq;
      }
      var idx = -1.0,
          len = seq.length,
          currentKeyFn = groupingKeys[currentDepth++],
          extractedKey,
          currentItem,
          mapSetter,
          groupedItems = new uK_CustomMap(),
          itemCollection;
      while (++idx < len) {
        if ((itemCollection = groupedItems.getKey(extractedKey = currentKeyFn(currentItem = seq[idx])))) {
          itemCollection.push(currentItem);
        } else {
          groupedItems.setKey(extractedKey, [ currentItem ]);
        }
      }
      if (outputType) {
        currentItem = outputType();
        mapSetter = function(extractedKey, itemCollection) {
          currentItem.setKey(extractedKey, processGroups(outputType, itemCollection, currentDepth));
        };
      } else {
        currentItem = {};
        mapSetter = function(extractedKey, itemCollection) {
          currentItem[extractedKey] = processGroups(outputType, itemCollection, currentDepth);
        };
      }
      groupedItems.iterate(mapSetter);
      return currentItem;
    }

    function getGroupedEntries(dataMap, currentDepth) {
      if (currentDepth >= groupingKeys.length) {
        return dataMap;
      }
      var entryList = [],
          currentKeySorter = keySorters[currentDepth++];
      dataMap.iterate(function(pKey, nestedMap) {
        entryList.push({
          key: pKey,
          values: getGroupedEntries(nestedMap, currentDepth)
        });
      });
      return currentKeySorter ? entryList.sort(function(valA, valB) {
        return currentKeySorter(valA.key, valB.key);
      }) : entryList;
    }

    dataNester.map = function(seq, outputType) {
      return processGroups(outputType, seq, 0.0);
    };
    dataNester.entries = function(seq) {
      return getGroupedEntries(processGroups(utilKit.createMap, seq, 0.0), 0.0);
    };
    dataNester.key = function(item) {
      groupingKeys.push(item);
      return dataNester;
    };
    dataNester.sortKeys = function(orderFn) {
      keySorters[groupingKeys.length - 1.0] = orderFn;
      return dataNester;
    };
    dataNester.sortValues = function(orderFn) {
      valueSorter = orderFn;
      return dataNester;
    };
    dataNester.rollup = function(callbackFn) {
      aggregator = callbackFn;
      return dataNester;
    };
    return dataNester;
  };

  utilKit.createSet = function(seq) {
    var newSet = new uK_CustomSet();
    if (seq) {
      for (var idx = 0.0, len = seq.length; idx < len; ++idx) {
        newSet.add(seq[idx]);
      }
    }
    return newSet;
  };

  function uK_CustomSet() {}

  uK_extendClass(uK_CustomSet, {
    has: function(propVal) {
      return uK_mapKeyPrefix + propVal in this;
    },
    add: function(propVal) {
      this[uK_mapKeyPrefix + propVal] = !0;
      return propVal;
    },
    remove: function(propVal) {
      propVal = uK_mapKeyPrefix + propVal;
      return propVal in this && delete this[propVal];
    },
    values: function() {
      var propValues = [];
      this.iterate(function(pVal) {
        propValues.push(pVal);
      });
      return propValues;
    },
    iterate: function(callbackFn) {
      for (var pVal in this) {
        if (pVal.charCodeAt(0) === uK_mapKeyPrefixCode) {
          callbackFn.call(this, pVal.substring(1.0));
        }
      }
    }
  });

  utilKit.behaviors = {};

  utilKit.delegateMethods = function(targetObj, sourceObj) {
    var idx = 1.0,
        len = arguments.length,
        methodName;
    while (++idx < len) {
      targetObj[methodName = arguments[idx]] = uK_createRebindFn(targetObj, sourceObj, sourceObj[methodName]);
    }
    return targetObj;
  };

  function uK_createRebindFn(targetObj, sourceObj, methodFn) {
    return function() {
      var methodResult = methodFn.apply(sourceObj, arguments);
      return methodResult === sourceObj ? targetObj : methodResult;
    };
  }

  function uK_getVendorProp(testObject, propIdentifier) {
    if (propIdentifier in testObject) {
      return propIdentifier;
    }
    propIdentifier = propIdentifier.charAt(0.0).toUpperCase() + propIdentifier.substring(1.0);
    for (var idx = 0.0, len = uK_browserPrefixes.length; idx < len; ++idx) {
      var prefixedName = uK_browserPrefixes[idx] + propIdentifier;
      if (prefixedName in testObject) {
        return prefixedName;
      }
    }
  }

  var uK_browserPrefixes = [ 'webkit', 'ms', 'moz', 'Moz', 'o', 'O' ];

  function uK_noOperation() {}

  utilKit.eventDispatcher = function() {
    var eventHub = new uK_EventHub(),
        idx = -1.0,
        len = arguments.length;
    while (++idx < len) {
      eventHub[arguments[idx]] = uK_createEventFn(eventHub);
    }
    return eventHub;
  };

  function uK_EventHub() {}

  uK_EventHub.prototype.on = function(eventType, eventHandler) {
    var dotIdx = eventType.indexOf('.'),
        handlerName = '';
    if (dotIdx >= 0.0) {
      handlerName = eventType.substring(dotIdx + 1.0);
      eventType = eventType.substring(0.0, dotIdx);
    }
    if (eventType) {
      return arguments.length < 2.0 ? this[eventType].on(handlerName) : this[eventType].on(handlerName, eventHandler);
    }
    if (arguments.length === 2.0) {
      if (eventHandler === void 0) {
        for (eventType in this) {
          if (this.hasOwnProperty(eventType)) {
            this[eventType].on(handlerName, void 0);
          }
        }
      }
      return this;
    }
  };

  function uK_createEventFn(eventHub) {
    var handlerList = [],
        namedHandlers = new uK_CustomMap();

    function triggerEvent() {
      var activeHandlers = handlerList,
          idx = -1.0,
          len = activeHandlers.length,
          currentHandler;
      while (++idx < len) {
        if ((currentHandler = activeHandlers[idx].on)) {
          currentHandler.apply(this, arguments);
        }
      }
      return eventHub;
    }

    triggerEvent.on = function(handlerName, eventHandler) {
      var existingHandler = namedHandlers.getKey(handlerName),
          idx;
      if (arguments.length < 2.0) {
        return existingHandler && existingHandler.on;
      }
      if (existingHandler) {
        existingHandler.on = void 0;
        handlerList = handlerList.slice(0.0, idx = handlerList.indexOf(existingHandler)).concat(handlerList.slice(idx + 1.0));
        namedHandlers.removeKey(handlerName);
      }
      if (eventHandler) {
        handlerList.push(namedHandlers.setKey(handlerName, {
          on: eventHandler
        }));
      }
      return eventHub;
    };
    return triggerEvent;
  }

  utilKit.currentEvent = void 0;

  function uK_preventDef() {
    utilKit.currentEvent.preventDefault();
  }

  function uK_getEventSource() {
    var currentEvt = utilKit.currentEvent,
        sourceEvt;
    while ((sourceEvt = currentEvt.sourceEvent)) {
      currentEvt = sourceEvt;
    }
    return currentEvt;
  }

  function uK_dispatchFactory(eventTarget) {
    var eventHub = new uK_EventHub(),
        idx = 0.0,
        len = arguments.length;
    while (++idx < len) {
      eventHub[arguments[idx]] = uK_createEventFn(eventHub);
    }
    eventHub.of = function(contextObj, argsArray) {
      return function(triggeredEvent) {
        try {
          var originalEvent = triggeredEvent.sourceEvent = utilKit.currentEvent;
          triggeredEvent.target = eventTarget;
          utilKit.currentEvent = triggeredEvent;
          eventHub[triggeredEvent.type].apply(contextObj, argsArray);
        }
        finally {
          utilKit.currentEvent = originalEvent;
        }
      };
    };
    return eventHub;
  }

  utilKit.escapeRegex = function(inputString) {
    return inputString.replace(uK_regexEscapePattern, '\\$&');
  };

  var uK_regexEscapePattern = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

  var uK_inheritPrototype = {}.__proto__ ? function(childObj, parentProto) {
    childObj.__proto__ = parentProto;
  } : function(childObj, parentProto) {
    for (var propKey in parentProto) {
      childObj[propKey] = parentProto[propKey];
    }
  };

  function uK_createSelection(nodeGroups) {
    uK_inheritPrototype(nodeGroups, utilKit_selectionProto);
    return nodeGroups;
  }

  var uK_selectSingle = function(selectorString, parentElement) {
        return parentElement.querySelector(selectorString);
      },
      uK_selectAll = function(selectorString, parentElement) {
        return parentElement.querySelectorAll(selectorString);
      },
      uK_selectorMatcher = uK_pageRoot[uK_getVendorProp(uK_pageRoot, 'matchesSelector')],
      uK_matchesSelector = function(parentElement, selectorString) {
        return uK_selectorMatcher.call(parentElement, selectorString);
      };

  if (typeof DOMQueryEngine === 'function') {
    uK_selectSingle = function(selectorString, parentElement) {
      return DOMQueryEngine(selectorString, parentElement)[0.0] || void 0;
    };
    uK_selectAll = function(selectorString, parentElement) {
      return DOMQueryEngine.uniqueSort(DOMQueryEngine(selectorString, parentElement));
    };
    uK_matchesSelector = DOMQueryEngine.matchesSelector;
  }

  utilKit.selection = function() {
    return uK_rootSelection;
  };

  var utilKit_selectionProto = utilKit.selection.prototype = [];

  var uK_rootSelection;
  function uK_getSelectorFn(s) { return s; }

  utilKit_selectionProto.select = function(cssSelector) {
    var nestedGroups = [],
        currentGroup,
        idx = -1.0,
        numGroups = this.length;
    cssSelector = uK_getSelectorFn(cssSelector);
    while (++idx < numGroups) {
      nestedGroups.push(currentGroup = []);
    }
    return uK_createSelection(nestedGroups);
  };

  uK_rootSelection = uK_createSelection([[uK_pageRoot]]);

  return utilKit;
}();