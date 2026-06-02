module.exports = function (modules) {
  var installedModules = {};

  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    var cachedModule = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    modules[moduleId].call(cachedModule.exports, cachedModule, cachedModule.exports, __webpack_require__);
    cachedModule.l = true;
    return cachedModule.exports;
  }

  __webpack_require__.m = modules;
  __webpack_require__.c = installedModules;
  __webpack_require__.d = function (exportsObj, name, getter) {
    if (!__webpack_require__.o(exportsObj, name)) {
      Object.defineProperty(exportsObj, name, { enumerable: true, get: getter });
    }
  };
  __webpack_require__.r = function (exportsObj) {
    var canTag = "undefined" != typeof Symbol && Symbol.toStringTag;
    if (canTag) {
      Object.defineProperty(exportsObj, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(exportsObj, "__esModule", { value: true });
  };
  __webpack_require__.t = function (value, mode) {
    if (1 & mode) {
      value = __webpack_require__(value);
    }
    if (8 & mode) {
      return value;
    }
    if (4 & mode && "object" == typeof value && value && value.__esModule) {
      return value;
    }

    var ns = Object.create(null);
    __webpack_require__.r(ns);
    Object.defineProperty(ns, "default", { enumerable: true, value: value });

    if (2 & mode && "string" != typeof value) {
      for (var key in value) {
        __webpack_require__.d(ns, key, function (innerKey) {
          return value[innerKey];
        }.bind(null, key));
      }
    }
    return ns;
  };
  __webpack_require__.n = function (moduleObj) {
    var getter = moduleObj && moduleObj.__esModule ? function () {
      return moduleObj.default;
    } : function () {
      return moduleObj;
    };
    __webpack_require__.d(getter, "a", getter);
    return getter;
  };
  __webpack_require__.o = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
  __webpack_require__.p = "";

  var startModule = 0;
  __webpack_require__.s = startModule;
  return __webpack_require__(__webpack_require__.s);
}([
  function (module, exports, __webpack_require__) {
    "use strict";
    var fsModule = __webpack_require__(1);
    var rawInput = fsModule.readFileSync("/dev/stdin", "utf8");
    var runner = __webpack_require__(2);
    runner(rawInput);
  },
  function (module, exports) {
    module.exports = require("fs");
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var InputReader = __webpack_require__(3);
    var solve = __webpack_require__(5);
    module.exports = function (sourceText) {
      var reader = new InputReader(sourceText);
      solve(reader);
    };
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    var Queue = __webpack_require__(4);
    module.exports = class {
      constructor(inputText) {
        var trimmedText = inputText.trim();
        var tokenList = trimmedText.split(/\s+/g);
        this.inp = new Queue(tokenList);
      }

      inr() {
        var token = this.inp.deq();
        return token;
      }

      in() {
        var token = this.inp.deq();
        var numberValue = parseInt(token, 10);
        return numberValue;
      }

      fin() {
        this.inp.clear();
      }
    };
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    module.exports = class {
      constructor() {
        var initialItems = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        this.size = initialItems.length;
        this.items = initialItems;
        this.ind = 0;
      }

      enq(item) {
        this.size += 1;
        this.items.push(item);
      }

      deq() {
        var currentIndex = this.ind;
        var item = this.items[currentIndex];
        this.size -= 1;
        this.ind = currentIndex + 1;
        return item;
      }

      clear() {
        this.items = [];
        this.size = 0;
        this.ind = 0;
      }
    };
  },
  function (module, exports, __webpack_require__) {
    "use strict";
    module.exports = function (reader) {
      var peopleCount = reader.in();
      var testimonies = new Array(peopleCount);
      var testimonyCounts = new Array(peopleCount);

      for (var person = 0; person < peopleCount; person++) {
        var countForPerson = reader.in();
        testimonyCounts[person] = countForPerson;

        var personStatements = new Array(countForPerson);
        for (var stmtIndex = 0; stmtIndex < countForPerson; stmtIndex++) {
          var targetIndex = reader.in();
          targetIndex = targetIndex - 1;
          var expectedState = reader.in();
          var statement = { x: targetIndex, y: expectedState };
          personStatements[stmtIndex] = statement;
        }
        testimonies[person] = personStatements;
      }

      var best = 0;
      var limit = 1 << peopleCount;
      for (var mask = 0; mask < limit; mask++) {
        var ok = true;
        var honestCount = 0;

        for (var checked = 0; checked < peopleCount; checked++) {
          var isHonest = (mask >> checked) % 2;
          if (isHonest == 1) {
            honestCount++;
            var statementsCount = testimonyCounts[checked];
            for (var inner = 0; inner < statementsCount; inner++) {
              var currentStatement = testimonies[checked][inner];
              var actualState = (mask >> currentStatement.x) % 2;
              var requiredState = currentStatement.y;
              if (actualState != requiredState) {
                ok = false;
                break;
              }
            }
            if (!ok) {
              break;
            }
          }
        }

        if (ok) {
          best = Math.max(honestCount, best);
        }
      }
      console.log(best);
    };
  }
]);
