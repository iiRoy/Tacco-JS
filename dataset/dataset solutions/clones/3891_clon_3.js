module.exports = (function (modules) {
  var installed = {};

  function requireModule(id) {
    var cached = installed[id];

    if (cached) {
      return cached.exports;
    }

    var module = (installed[id] = {
      i: id,
      l: !1,
      exports: {},
      used: 0,
    });

    modules[id].call(module.exports, module, module.exports, requireModule);
    module.l = !0;
    module.used = 1;

    return module.exports;
  }

  return (
    (requireModule.m = modules),
    (requireModule.c = installed),
    (requireModule.d = function (target, key, getter) {
      if (!requireModule.o(target, key)) {
        Object.defineProperty(target, key, {
          enumerable: !0,
          get: getter,
        });
      }
    }),
    (requireModule.r = function (target) {
      if ("undefined" != typeof Symbol && Symbol.toStringTag) {
        Object.defineProperty(target, Symbol.toStringTag, { value: "Module" });
      }
      Object.defineProperty(target, "__esModule", { value: !0 });
    }),
    (requireModule.t = function (value, mode) {
      if (1 & mode) {
        value = requireModule(value);
      }

      if (8 & mode) return value;

      if (4 & mode && "object" == typeof value && value && value.__esModule) {
        return value;
      }

      var namespace = Object.create(null);

      requireModule.r(namespace);
      Object.defineProperty(namespace, "default", {
        enumerable: !0,
        value: value,
      });

      if (2 & mode && "string" != typeof value) {
        for (var name in value) {
          requireModule.d(
            namespace,
            name,
            function (prop) {
              return value[prop];
            }.bind(null, name),
          );
        }
      }

      return namespace;
    }),
    (requireModule.n = function (value) {
      var getter;

      if (value && value.__esModule) {
        getter = function () {
          return value.default;
        };
      } else {
        getter = function () {
          return value;
        };
      }

      requireModule.d(getter, "a", getter);
      return getter;
    }),
    (requireModule.o = function (target, key) {
      return Object.prototype.hasOwnProperty.call(target, key);
    }),
    (requireModule.p = ""),
    requireModule((requireModule.s = 0))
  );
})([
  function (module, exports, requireModule) {
    var fs = requireModule(2);
    var lines = fs.readFileSync("/dev/stdin", "UTF-8").split("\n");
    requireModule(1)(lines);
  },
  function (module, exports) {
    function unpack(value, limit) {
      return (
        (function (arr) {
          if (Array.isArray(arr)) {
            return arr;
          }
        })(value) ||
        (function (iterable, limit) {
          var out = [],
            normal = !0,
            failed = !1,
            error = void 0;

          try {
            for (
              var step, iterator = iterable[Symbol.iterator]();
              !(normal = (step = iterator.next()).done) &&
              (out.push(step.value), !limit || out.length !== limit);
              normal = !0
            );
          } catch (err) {
            failed = !0;
            error = err;
          } finally {
            try {
              if (!normal && null != iterator.return) {
                iterator.return();
              }
            } finally {
              if (failed) {
                throw error;
              }
            }
          }

          return out;
        })(value, limit) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance",
          );
        })()
      );
    }

    function toNumbers(line) {
      return line.split(" ").map(function (item) {
        return Number(item);
      });
    }

    module.exports = function (lines) {
      var values = unpack(toNumbers(lines[0]), 3),
        start = values[0],
        move = values[1],
        goal = values[2];

      var answer = "NO";

      if (start == goal && move == 0) {
        answer = "YES";
      } else if (start < goal && start + move >= goal) {
        answer = "YES";
      }

      console.log(answer);
    };
  },
  function (module, exports) {
    module.exports = require("fs");
  },
]);