module.exports = function(modules) {
  var installedModules = {};

  function __webpack_require__(moduleId) {
    var cachedModule = installedModules[moduleId];
    if (cachedModule) {
      return cachedModule.exports;
    }

    var moduleObject = installedModules[moduleId] = {
      i: moduleId,
      l: !1,
      exports: {}
    };

    modules[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, __webpack_require__);
    moduleObject.l = !0;

    return moduleObject.exports;
  }

  __webpack_require__.m = modules;
  __webpack_require__.c = installedModules;

  __webpack_require__.d = function(exportsObject, name, getter) {
    if (!__webpack_require__.o(exportsObject, name)) {
      Object.defineProperty(exportsObject, name, {
        enumerable: !0,
        get: getter
      });
    }
  };

  __webpack_require__.r = function(exportsObject) {
    if ("undefined" != typeof Symbol && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(exportsObject, "__esModule", { value: !0 });
  };

  __webpack_require__.t = function(value, mode) {
    if (1 & mode) {
      value = __webpack_require__(value);
    }

    if (8 & mode) {
      return value;
    }

    if (4 & mode && "object" == typeof value && value && value.__esModule) {
      return value;
    }

    var namespace = Object.create(null);
    __webpack_require__.r(namespace);
    Object.defineProperty(namespace, "default", {
      enumerable: !0,
      value: value
    });

    if (2 & mode && "string" != typeof value) {
      for (var key in value) {
        __webpack_require__.d(namespace, key, function(boundKey) {
          return value[boundKey];
        }.bind(null, key));
      }
    }

    return namespace;
  };

  __webpack_require__.n = function(moduleValue) {
    var getter = moduleValue && moduleValue.__esModule ? function() {
      return moduleValue.default;
    } : function() {
      return moduleValue;
    };

    __webpack_require__.d(getter, "a", getter);
    return getter;
  };

  __webpack_require__.o = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  __webpack_require__.p = "";

  var startupModule = __webpack_require__.s = 0;
  return __webpack_require__(startupModule);
}([
  function(module, exports, __webpack_require__) {
    var fsModule = __webpack_require__(3);
    var inputText = fsModule.readFileSync("/dev/stdin", "UTF-8");
    var inputLines = inputText.split("\n");
    var mainFunction = __webpack_require__(1);
    mainFunction(inputLines);
  },
  function(module, exports, __webpack_require__) {
    function _slicedToArray(value, count) {
      var arrayResult = function(innerValue) {
        if (Array.isArray(innerValue)) {
          return innerValue;
        }
      }(value);

      if (arrayResult) {
        return arrayResult;
      }

      var iteratorResult = function(iterableValue, limit) {
        var collected = [];
        var normalCompletion = !0;
        var didErr = !1;
        var err = void 0;

        try {
          var step;
          var iterator = iterableValue[Symbol.iterator]();

          while (!(normalCompletion = (step = iterator.next()).done)) {
            collected.push(step.value);

            if (limit && collected.length === limit) {
              break;
            }

            normalCompletion = !0;
          }
        } catch (caughtError) {
          didErr = !0;
          err = caughtError;
        } finally {
          try {
            if (!normalCompletion && null != iterator.return) {
              iterator.return();
            }
          } finally {
            if (didErr) {
              throw err;
            }
          }
        }

        return collected;
      }(value, count);

      if (iteratorResult) {
        return iteratorResult;
      }

      return function() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }();
    }

    var shortestPath = __webpack_require__(2);

    module.exports = function(lines) {
      var firstParts = lines[0].split(" ").map(function(item) {
        var numberItem = Number(item);
        return numberItem;
      });

      var firstPair = _slicedToArray(firstParts, 2);
      var height = firstPair[0];
      var width = firstPair[1];

      var costTable = [];
      for (var rowIndex = 0; rowIndex < 10; rowIndex++) {
        var costLineIndex = rowIndex + 1;
        var costRow = lines[costLineIndex].split(" ").map(function(item) {
          var numberItem = Number(item);
          return numberItem;
        });
        costTable.push(costRow);
      }

      var convertedCost = shortestPath(costTable);
      var answer = 0;

      for (var y = 0; y < height; y++) {
        var mapLineIndex = y + 11;
        var mapRow = lines[mapLineIndex].split(" ").map(function(item) {
          var numberItem = Number(item);
          return numberItem;
        });

        for (var x = 0; x < width; x++) {
          var cellValue = mapRow[x];

          if (-1 != cellValue) {
            var addCost = convertedCost[cellValue][1];
            answer += addCost;
          }
        }
      }

      console.log(answer);
    };
  },
  function(module, exports, __webpack_require__) {
    "use strict";

    module.exports = function(matrix) {
      var size = matrix.length;
      var copied = new Array(size);

      for (var row = 0; row < size; row++) {
        var copiedRow = matrix[row].concat();
        copied[row] = copiedRow;
      }

      for (var from = 0; from < size; from++) {
        for (var to = 0; to < size; to++) {
          for (var through = 0; through < size; through++) {
            var currentCost = copied[from][to];
            var viaCost = copied[from][through] + copied[through][to];

            if (currentCost > viaCost) {
              copied[from][to] = viaCost;
            }
          }
        }
      }

      return copied;
    };
  },
  function(module, exports) {
    module.exports = require("fs");
  }
]);
