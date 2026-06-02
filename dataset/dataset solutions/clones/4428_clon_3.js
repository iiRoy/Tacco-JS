module.exports = function(modules) {
  var installedModules = {};

  function __webpack_require__(moduleId) {
    var cachedModule = installedModules[moduleId];
    if (cachedModule) return cachedModule.exports;

    var module = installedModules[moduleId] = {
      i: moduleId,
      l: !1,
      exports: {}
    };

    var moduleFactory = modules[moduleId];
    moduleFactory.call(module.exports, module, module.exports, __webpack_require__);
    module.l = !0;
    return module.exports;
  }

  __webpack_require__.m = modules;
  __webpack_require__.c = installedModules;
  __webpack_require__.d = function(exportsObject, propertyName, getter) {
    if (!__webpack_require__.o(exportsObject, propertyName)) {
      Object.defineProperty(exportsObject, propertyName, {
        enumerable: !0,
        get: getter
      });
    }
  };
  __webpack_require__.r = function(exportsObject) {
    var canTag = "undefined" != typeof Symbol && Symbol.toStringTag;
    if (canTag) Object.defineProperty(exportsObject, Symbol.toStringTag, { value: "Module" });
    Object.defineProperty(exportsObject, "__esModule", { value: !0 });
  };
  __webpack_require__.t = function(value, mode) {
    if (1 & mode) {
      value = __webpack_require__(value);
    }
    if (8 & mode) return value;
    if (4 & mode && "object" == typeof value && value && value.__esModule) return value;

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
  __webpack_require__.o = function(object, propertyName) {
    return Object.prototype.hasOwnProperty.call(object, propertyName);
  };
  __webpack_require__.p = "";

  var startModule = __webpack_require__.s = 0;
  return __webpack_require__(startModule);
}([
  function(module, exports, __webpack_require__) {
    var runner = __webpack_require__(1);
    var fileSystem = __webpack_require__(2);
    var sourceText = fileSystem.readFileSync("/dev/stdin", "UTF-8");
    var inputRows = sourceText.split("\n");
    runner(inputRows);
  },
  function(module, exports, __webpack_require__) {
    "use strict";

    function sliceToArray(input, length) {
      var directArray = function(value) {
        if (Array.isArray(value)) return value;
      }(input);
      if (directArray) return directArray;

      var iteratedArray = function(value, limit) {
        var output = [];
        var normalCompletion = !0;
        var didErr = !1;
        var err = void 0;
        var iterator;
        var step;
        try {
          iterator = value[Symbol.iterator]();
          for (; !(normalCompletion = (step = iterator.next()).done) && (output.push(step.value), !limit || output.length !== limit); normalCompletion = !0) {}
        } catch (error) {
          didErr = !0;
          err = error;
        } finally {
          try {
            if (!normalCompletion && null != iterator.return) iterator.return();
          } finally {
            if (didErr) throw err;
          }
        }
        return output;
      }(input, length);
      if (iteratedArray) return iteratedArray;

      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }

    module.exports = function(lines) {
      var nodeCount = Number(lines[0]);
      var graph = new Array(nodeCount);
      for (var index = 0; index < nodeCount; index++) {
        graph[index] = [];
      }

      var firstPairLine = lines[nodeCount];
      var firstPairValues = firstPairLine.split(" ").map(function(value) {
        return Number(value);
      });
      var firstPair = sliceToArray(firstPairValues, 2);
      var queryCount = firstPair[0];
      var startNode = firstPair[1];

      for (var edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        var edgeLine = lines[edgeIndex + 1];
        var edgeValues = edgeLine.split(" ").map(function(value) {
          return Number(value);
        });
        var edge = sliceToArray(edgeValues, 3);
        var fromNode = edge[0];
        var toNode = edge[1];
        var cost = edge[2];

        if (toNode != startNode) {
          var toEntry = [toNode - 1, cost];
          graph[fromNode - 1].push(toEntry);
        }
        if (fromNode != startNode) {
          var fromEntry = [fromNode - 1, cost];
          graph[toNode - 1].push(fromEntry);
        }
      }

      var distance = new Array(nodeCount).fill(-1);
      !function walk(current, total) {
        distance[current] = total;
        var edgeTotal = graph[current].length;
        for (var i = 0; i < edgeTotal; i++) {
          var nextEdge = graph[current][i];
          var nextNode = nextEdge[0];
          if (-1 == distance[nextNode]) {
            var nextTotal = total + nextEdge[1];
            walk(nextNode, nextTotal);
          }
        }
      }(startNode - 1, 0);

      for (var queryIndex = 0; queryIndex < queryCount; queryIndex++) {
        var queryLine = lines[queryIndex + nodeCount + 1];
        var queryValues = queryLine.split(" ").map(function(value) {
          return Number(value);
        });
        var query = sliceToArray(queryValues, 2);
        var leftNode = query[0];
        var rightNode = query[1];
        var answer = distance[leftNode - 1] + distance[rightNode - 1];
        console.log(answer);
      }
    };
  },
  function(module, exports) {
    module.exports = require("fs");
  }
]);
