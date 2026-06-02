module.exports = function(modules) {
  var cache = {};

  function loadModule(id) {
    if (cache[id]) {
      return cache[id].exports;
    }

    var moduleRecord = cache[id] = {
      i: id,
      l: !1,
      exports: {}
    };

    modules[id].call(moduleRecord.exports, moduleRecord, moduleRecord.exports, loadModule);
    moduleRecord.l = !0;
    return moduleRecord.exports;
  }

  loadModule.m = modules;
  loadModule.c = cache;
  loadModule.d = function(target, key, getter) {
    if (!loadModule.o(target, key)) {
      Object.defineProperty(target, key, { enumerable: !0, get: getter });
    }
  };
  loadModule.r = function(target) {
    if ("undefined" != typeof Symbol && Symbol.toStringTag) {
      Object.defineProperty(target, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(target, "__esModule", { value: !0 });
  };
  loadModule.t = function(value, mode) {
    if (1 & mode) {
      value = loadModule(value);
    }
    if (8 & mode) {
      return value;
    }
    if (4 & mode && "object" == typeof value && value && value.__esModule) {
      return value;
    }

    var namespace = Object.create(null);
    loadModule.r(namespace);
    Object.defineProperty(namespace, "default", { enumerable: !0, value: value });
    if (2 & mode && "string" != typeof value) {
      for (var prop in value) {
        loadModule.d(namespace, prop, function(name) {
          return value[name];
        }.bind(null, prop));
      }
    }
    return namespace;
  };
  loadModule.n = function(value) {
    var getter = value && value.__esModule ? function() {
      return value.default;
    } : function() {
      return value;
    };
    loadModule.d(getter, "a", getter);
    return getter;
  };
  loadModule.o = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  loadModule.p = "";

  var startId = 0;
  loadModule.s = startId;
  return loadModule(loadModule.s);
}([
  function(module, exports, requireModule) {
    "use strict";
    var fsModule = requireModule(1);
    var sourcePath = "/dev/stdin";
    var sourceText = fsModule.readFileSync(sourcePath, "utf8");
    var runSolver = requireModule(2);
    runSolver(sourceText);
  },
  function(module, exports) {
    module.exports = require("fs");
  },
  function(module, exports, requireModule) {
    "use strict";
    var InputReader = requireModule(3);
    var solve = requireModule(5);
    module.exports = function(rawText) {
      var readerInstance = new InputReader(rawText);
      solve(readerInstance);
    };
  },
  function(module, exports, requireModule) {
    "use strict";
    var Queue = requireModule(4);
    module.exports = class {
      constructor(text) {
        var trimmedText = text.trim();
        var pieces = trimmedText.split(/\s+/g);
        this.inp = new Queue(pieces);
      }
      inr() {
        var nextValue = this.inp.deq();
        return nextValue;
      }
      in() {
        var rawNumber = this.inp.deq();
        return parseInt(rawNumber, 10);
      }
      fin() {
        this.inp.clear();
      }
    };
  },
  function(module, exports, requireModule) {
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
        this.ind += 1;
        return item;
      }
      clear() {
        this.items = [];
        this.size = 0;
        this.ind = 0;
      }
    };
  },
  function(module, exports, requireModule) {
    "use strict";
    module.exports = function(reader) {
      var MOD = 1000000007;

      function addToState(table, row, col, value) {
        table[row][col] += value;
        table[row][col] %= MOD;
      }

      var inputString = reader.inr();
      var length = inputString.length;
      var dp = new Array(length);

      for (var row = 0; row <= length; row++) {
        dp[row] = new Array(13).fill(0);
      }

      dp[0][0] = 1;

      for (var pos = 1; pos <= length; pos++) {
        var currentChar = inputString[pos - 1];

        if ("?" == currentChar) {
          for (var prev = 0; prev < 13; prev++) {
            for (var digit = 0; digit < 10; digit++) {
              var next = (10 * prev + digit) % 13;
              var carry = dp[pos - 1][prev];
              addToState(dp, pos, next, carry);
            }
          }
        } else {
          var fixedDigit = Number(currentChar);
          for (var rem = 0; rem < 13; rem++) {
            var target = (10 * rem + fixedDigit) % 13;
            var previousValue = dp[pos - 1][rem];
            addToState(dp, pos, target, previousValue);
          }
        }
      }

      var answer = dp[length][5];
      console.log(answer);
    };
  }
]);
