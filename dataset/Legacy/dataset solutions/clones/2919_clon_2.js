function _extractArrayElements(inputArray, count) {
  return _getArrayWithHoles(inputArray) || _getIterableLimited(inputArray, count) || _throwNonIterableError();
}

function _throwNonIterableError() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _getIterableLimited(iterableInput, limit) {
  var _tempArray = [];
  var _isDone = false;
  var _hasError = false;
  var _errorValue = undefined;
  try {
    for (var _iteratorInstance = iterableInput[Symbol.iterator](), _stepResult; !(_isDone = (_stepResult = _iteratorInstance.next()).done); _isDone = true) {
      _tempArray.push(_stepResult.value);
      if (limit && _tempArray.length === limit) break;
    }
  } catch (err) {
    _hasError = true;
    _errorValue = err;
  } finally {
    try {
      if (!_isDone && _iteratorInstance["return"] != null) {
        _iteratorInstance["return"]();
      }
    } finally {
      if (_hasError) {
        throw _errorValue;
      }
    }
  }
  return _tempArray;
}

function _getArrayWithHoles(inputArray) {
  if (Array.isArray(inputArray)) return inputArray;
}

function _verifyClassCall(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineObjectProperties(targetObject, propertyDescriptors) {
  for (var i = 0; i < propertyDescriptors.length; i++) {
    var descriptor = propertyDescriptors[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(targetObject, descriptor.key, descriptor);
  }
}

function _constructClass(Constructor, prototypeProperties, staticProperties) {
  if (prototypeProperties) _defineObjectProperties(Constructor.prototype, prototypeProperties);
  if (staticProperties) _defineObjectProperties(Constructor, staticProperties);
  return Constructor;
}

!function (fileSystemModule) {
  "use strict";

  var RandomizedBST =
  /*#__PURE__*/
  function () {
    function RandomizedBST(getKeyExtractor) {
      _verifyClassCall(this, RandomizedBST);

      this.getKeyExtractor = getKeyExtractor || function (x) {
        return x;
      };

      this.topNode = null;
    }

    _constructClass(RandomizedBST, [{
      key: "addValue",
      value: function addValue(itemValue) {
        var nodePrio = Math.random();
        var newNodeItem = {
          itemVal: itemValue,
          sortKeyVal: this.getKeyExtractor(itemValue),
          nodePrio: nodePrio,
          leftChild: null,
          rightChild: null
        };
        this.topNode = this._recursiveAdd(this.topNode, newNodeItem);
      }
    }, {
      key: "removeValue",
      value: function removeValue(itemValue) {
        var itemKey = this.getKeyExtractor(itemValue);
        this.topNode = this._recursiveRemove(this.topNode, itemKey);
      }
    }, {
      key: "hasValue",
      value: function hasValue(itemValue) {
        return null != this._locateNode(itemValue);
      }
    }, {
      key: "getMinimum",
      value: function getMinimum() {
        var currentRoot = this.topNode;

        for (; null != currentRoot;) {
          if (null == currentRoot.leftChild) return currentRoot.itemVal;
          currentRoot = currentRoot.leftChild;
        }

        return null;
      }
    }, {
      key: "_recursiveAdd",
      value: function _recursiveAdd(currentNode, newNodeItem) {
        if (null == currentNode) return newNodeItem;
        if (newNodeItem.sortKeyVal === currentNode.sortKeyVal) return currentNode;else if (newNodeItem.sortKeyVal < currentNode.sortKeyVal) {
          var insertedChild = this._recursiveAdd(currentNode.leftChild, newNodeItem);

          currentNode.leftChild = insertedChild;
          if (insertedChild.nodePrio < currentNode.nodePrio) return currentNode;else return this._rotateRightChild(currentNode);
        } else {
          var _insertedChild = this._recursiveAdd(currentNode.rightChild, newNodeItem);

          currentNode.rightChild = _insertedChild;
          if (_insertedChild.nodePrio < currentNode.nodePrio) return currentNode;else return this._rotateLeftChild(currentNode);
        }
      }
    }, {
      key: "_rotateRightChild",
      value: function _rotateRightChild(parentNode) {
        var childNode = parentNode.leftChild;
        if (null == childNode) return parentNode;
        parentNode.leftChild = childNode.rightChild;
        childNode.rightChild = parentNode;
        return childNode;
      }
    }, {
      key: "_rotateLeftChild",
      value: function _rotateLeftChild(parentNode) {
        var childNode = parentNode.rightChild;
        if (null == childNode) return parentNode;
        parentNode.rightChild = childNode.leftChild;
        childNode.leftChild = parentNode;
        return childNode;
      }
    }, {
      key: "_recursiveRemove",
      value: function _recursiveRemove(currentNode, itemKey) {
        if (null == currentNode) return null;

        if (itemKey < currentNode.sortKeyVal) {
          currentNode.leftChild = this._recursiveRemove(currentNode.leftChild, itemKey);
          return currentNode;
        } else if (itemKey > currentNode.sortKeyVal) {
          currentNode.rightChild = this._recursiveRemove(currentNode.rightChild, itemKey);
          return currentNode;
        }

        if (null == currentNode.leftChild && null == currentNode.rightChild) return null;

        if ((currentNode.leftChild ? currentNode.leftChild.nodePrio : -1) > (currentNode.rightChild ? currentNode.rightChild.nodePrio : -1)) {
          var promotedParent = currentNode.leftChild;
          var promotedRightChild = promotedParent.rightChild;
          currentNode.leftChild = promotedRightChild;
          promotedParent.rightChild = this._recursiveRemove(currentNode, itemKey);
          if (promotedParent.rightChild && promotedParent.rightChild.nodePrio > promotedParent.nodePrio) return this._rotateLeftChild(promotedParent);else return promotedParent;
        } else {
          var _promotedParent = currentNode.rightChild;
          var promotedLeftChild = _promotedParent.leftChild;
          currentNode.rightChild = promotedLeftChild;
          _promotedParent.leftChild = this._recursiveRemove(currentNode, itemKey);
          if (_promotedParent.leftChild && _promotedParent.leftChild.nodePrio > _promotedParent.nodePrio) return this._rotateRightChild(_promotedParent);else return _promotedParent;
        }
      }
    }, {
      key: "_locateNode",
      value: function _locateNode(itemValue) {
        var currentRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.topNode;
        if (null == currentRoot) return null;
        if (currentRoot.itemVal === itemValue) return currentRoot;
        if (itemValue < currentRoot.itemVal) return this._locateNode(itemValue, currentRoot.leftChild);else return this._locateNode(itemValue, currentRoot.rightChild);
      }
    }]);

    return RandomizedBST;
  }();

  !function () {
    function parseNumbersFromString(inputLine) {
      return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (numStr) {
        return parseInt(numStr, 10);
      });
    }

    function sortArrayByKeys(dataArray, sortKeys) {
      if (!Array.isArray(sortKeys)) sortKeys = [sortKeys];
      return dataArray.sort(function (objA, objB) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = sortKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var currentKeySpec = _step.value;

            if ("string" == typeof currentKeySpec) {
              var difference = objA[currentKeySpec] - objB[currentKeySpec];
              if (0 !== difference) return difference;
            } else {
              var _difference = objA[currentKeySpec[0]] - objB[currentKeySpec[0]];

              var sortDirectionMultiplier = "desc" === currentKeySpec[1] ? -1 : "asc" === currentKeySpec[1] ? 1 : Number(currentKeySpec[1]);
              if (0 !== _difference) return _difference * sortDirectionMultiplier;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return 0;
      });
    }

    !function (fileContent) {
      var contentLines = fileContent.split("\n");

      var _parsedHeader = parseNumbersFromString(contentLines[0]),
          _extractedHeader = _extractArrayElements(_parsedHeader, 2),
          numProjects = _extractedHeader[0],
          numQueries = _extractedHeader[1];

      var constructionProjects = contentLines.slice(1, numProjects + 1).map(function (projectLine, projectIndex) {
        var _parsedProject = parseNumbersFromString(projectLine),
            _extractedProject = _extractArrayElements(_parsedProject, 3),
            startPos = _extractedProject[0],
            endPos = _extractedProject[1],
            xCoord = _extractedProject[2];

        return {
          idx: projectIndex,
          startPos: startPos,
          endPos: endPos,
          xCoord: xCoord,
          beginTime: startPos - xCoord - 0.5,
          finishTime: endPos - xCoord - 0.6
        };
      });
      var queryTimes = parseNumbersFromString(contentLines.slice(numProjects + 1)).slice(0, numQueries);
      var timelineEvents = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = constructionProjects[Symbol.iterator](), eventStep; !(_iteratorNormalCompletion2 = (eventStep = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var currentProjectDetails = eventStep.value;
          var xOffset = currentProjectDetails.xCoord;
          var projectStartTime = currentProjectDetails.beginTime;
          var projectEndTime = currentProjectDetails.finishTime;
          timelineEvents.push({
            kind: "add",
            moment: projectStartTime,
            xVal: xOffset
          }, {
            kind: "delete",
            moment: projectEndTime,
            xVal: xOffset
          });
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var queryIndex = 0;
      sortArrayByKeys(timelineEvents, ["moment"]);
      var activeXValues = new RandomizedBST();

      for (var eventIterator = 0; eventIterator < timelineEvents.length; eventIterator++) {
        var currentEventData = timelineEvents[eventIterator];
        var eventKind = currentEventData.kind;
        var eventMoment = currentEventData.moment;
        var eventXValue = currentEventData.xVal;

        for (; queryIndex < queryTimes.length && eventMoment > queryTimes[queryIndex];) {
          var minXValue = activeXValues.getMinimum();
          console.log(null == minXValue ? -1 : minXValue);
          queryIndex++;
        }

        if ("add" === eventKind) activeXValues.addValue(eventXValue);else if ("delete" === eventKind) activeXValues.removeValue(eventXValue);
      }

      for (; queryIndex < queryTimes.length; queryIndex++) {
        var finalMinXValue = activeXValues.getMinimum();
        console.log(null == finalMinXValue ? -1 : finalMinXValue);
      }
    }(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
  }();
}(require("fs"));
