module.exports = function(_w_moduleDefinitions) {
  var _w_moduleCache = {};

  function _w_require(_w_moduleId) {
    if (_w_moduleCache[_w_moduleId]) {
      return _w_moduleCache[_w_moduleId].exports;
    }
    var _w_currentModule = _w_moduleCache[_w_moduleId] = {
      i: _w_moduleId,
      l: false,
      exports: {}
    };
    _w_moduleDefinitions[_w_moduleId].call(_w_currentModule.exports, _w_currentModule, _w_currentModule.exports, _w_require);
    _w_currentModule.l = true;
    return _w_currentModule.exports;
  }

  _w_require.modules = _w_moduleDefinitions;
  _w_require.cache = _w_moduleCache;

  _w_require.defineGetter = function(_w_targetObj, _w_propName, _w_getterFunc) {
    _w_require.hasOwn(_w_targetObj, _w_propName) || Object.defineProperty(_w_targetObj, _w_propName, {
      enumerable: true,
      get: _w_getterFunc
    });
  };

  _w_require.markAsEsModule = function(_w_targetObj) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(_w_targetObj, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(_w_targetObj, "__esModule", {
      value: true
    });
  };

  _w_require.createNamespaceObject = function(_w_value, _w_mode) {
    if (_w_mode & 1) {
      _w_value = _w_require(_w_value);
    }
    if (_w_mode & 8) {
      return _w_value;
    }
    if (_w_mode & 4 && typeof _w_value === "object" && _w_value && _w_value.__esModule) {
      return _w_value;
    }
    var _w_namespaceObj = Object.create(null);
    _w_require.markAsEsModule(_w_namespaceObj);
    Object.defineProperty(_w_namespaceObj, "default", {
      enumerable: true,
      value: _w_value
    });
    if (_w_mode & 2 && typeof _w_value !== "string") {
      for (var _w_propKey in _w_value) {
        _w_require.defineGetter(_w_namespaceObj, _w_propKey, (function(_w_propKey) {
          return _w_value[_w_propKey];
        }).bind(null, _w_propKey));
      }
    }
    return _w_namespaceObj;
  };

  _w_require.getModuleExportsCompat = function(_w_moduleObj) {
    var _w_compatGetter = _w_moduleObj && _w_moduleObj.__esModule ?
      function() {
        return _w_moduleObj.default;
      } :
      function() {
        return _w_moduleObj;
      };
    _w_require.defineGetter(_w_compatGetter, "a", _w_compatGetter);
    return _w_compatGetter;
  };

  _w_require.hasOwn = function(_w_objToCheck, _w_propToCheck) {
    return Object.prototype.hasOwnProperty.call(_w_objToCheck, _w_propToCheck);
  };

  _w_require.publicPath = "";

  return _w_require(_w_require.entryModuleId = 0);
}([
  function(_m0_module, _m0_exports, _w_require) {
    _w_require(1)(_w_require(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },
  function(_m1_module, _m1_exports, _w_require) {
    "use strict";

    function _g_sliceArray(_g_inputArray, _g_limit) {
      return (function(_g_inputArray) {
        if (Array.isArray(_g_inputArray)) return _g_inputArray;
      })(_g_inputArray) || (function(_g_inputArray, _g_limit) {
        var _g_resultArr = [],
          _g_isDone = true,
          _g_hasError = false,
          _g_errorObj = void 0;
        try {
          for (var _g_iteratorItem, _g_iterator = _g_inputArray[Symbol.iterator](); !(_g_isDone = (_g_iteratorItem = _g_iterator.next()).done) && (_g_resultArr.push(_g_iteratorItem.value), !_g_limit || _g_resultArr.length !== _g_limit); _g_isDone = true);
        } catch (_g_errorObj_1) {
          _g_hasError = true;
          _g_errorObj = _g_errorObj_1;
        } finally {
          try {
            if (!_g_isDone && _g_iterator["return"] != null) _g_iterator["return"]();
          } finally {
            if (_g_hasError) throw _g_errorObj;
          }
        }
        return _g_resultArr;
      })(_g_inputArray, _g_limit) || (function() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      })();
    }
    _m1_module.exports = function(_g_inputLines) {
      for (var _g_nodeCount = Number(_g_inputLines[0]), _g_adjacencyList = new Array(_g_nodeCount), _g_arrayIndex = 0; _g_arrayIndex < _g_nodeCount; _g_arrayIndex++) {
        _g_adjacencyList[_g_arrayIndex] = [];
      }
      for (var _g_edgeIndex = 0; _g_edgeIndex < _g_nodeCount - 1; _g_edgeIndex++) {
        var _g_parsedEdge = _g_sliceArray(_g_inputLines[_g_edgeIndex + 1].split(" ").map(function(_g_valStr) {
            return Number(_g_valStr);
          }), 3),
          _g_firstNode = _g_parsedEdge[0],
          _g_secondNode = _g_parsedEdge[1],
          _g_edgeWeight = _g_parsedEdge[2];
        _g_adjacencyList[_g_firstNode - 1].push({
          v: _g_secondNode - 1,
          c: _g_edgeWeight
        });
        _g_adjacencyList[_g_secondNode - 1].push({
          v: _g_firstNode - 1,
          c: _g_edgeWeight
        });
      }
      var _g_startEndPair = _g_sliceArray(_g_inputLines[_g_nodeCount].split(" ").map(function(_g_valStr) {
          return Number(_g_valStr);
        }), 2),
        _g_sourceNode = _g_startEndPair[0],
        _g_targetNode = _g_startEndPair[1],
        _g_shortestDistances = new Array(_g_nodeCount).fill(-1),
        _g_bfsQueue = [{
          v: _g_targetNode - 1,
          sum: 0
        }],
        _g_queuePointer = 0;
      for (; _g_bfsQueue.length > _g_queuePointer;) {
        var _g_currentNodeData = _g_bfsQueue[_g_queuePointer];
        _g_queuePointer++;
        _g_shortestDistances[_g_currentNodeData.v] = _g_currentNodeData.sum;
        var _g_innerLoopDone = true,
          _g_innerLoopError = false,
          _g_innerLoopErrorObj = void 0;
        try {
          for (var _g_neighborIteratorItem, _g_neighborIterator = _g_adjacencyList[_g_currentNodeData.v][Symbol.iterator](); !(_g_innerLoopDone = (_g_neighborIteratorItem = _g_neighborIterator.next()).done); _g_innerLoopDone = true) {
            var _g_neighborInfo = _g_neighborIteratorItem.value;
            if (_g_shortestDistances[_g_neighborInfo.v] === -1) {
              _g_bfsQueue.push({
                v: _g_neighborInfo.v,
                sum: _g_currentNodeData.sum + _g_neighborInfo.c
              });
            }
          }
        } catch (_g_innerLoopErrorObj_1) {
          _g_innerLoopError = true;
          _g_innerLoopErrorObj = _g_innerLoopErrorObj_1;
        } finally {
          try {
            if (!_g_innerLoopDone && _g_neighborIterator["return"] != null) _g_neighborIterator["return"]();
          } finally {
            if (_g_innerLoopError) throw _g_innerLoopErrorObj;
          }
        }
      }
      for (var _g_queryIndex = 0; _g_queryIndex < _g_sourceNode; _g_queryIndex++) {
        var _g_queryNodesPair = _g_sliceArray(_g_inputLines[_g_queryIndex + _g_nodeCount + 1].split(" ").map(function(_g_valStr) {
            return Number(_g_valStr);
          }), 2),
          _g_queryNodeOne = _g_queryNodesPair[0],
          _g_queryNodeTwo = _g_queryNodesPair[1],
          _g_combinedDistance = _g_shortestDistances[_g_queryNodeOne - 1] + _g_shortestDistances[_g_queryNodeTwo - 1];
        console.log(_g_combinedDistance);
      }
    };
  },
  function(_m2_module, _m2_exports) {
    _m2_module.exports = _w_require("fs");
  }
]);
