var compilerTools = compilerTools || {};
compilerTools.scope = {};
compilerTools.ASSUME_ES5 = false;
compilerTools.ASSUME_NO_NATIVE_MAP = false;
compilerTools.ASSUME_NO_NATIVE_SET = false;
compilerTools.SIMPLE_FROUND_POLYFILL = false;

compilerTools.defineProperty =
  compilerTools.ASSUME_ES5 || typeof Object.defineProperties == "function"
    ? Object.defineProperty
    : function (target, key, descriptor) {
        if (target != Array.prototype && target != Object.prototype) {
          target[key] = descriptor.value;
        }
      };

compilerTools.getGlobal = function (value) {
  return typeof window != "undefined" && window === value
    ? value
    : typeof global != "undefined" && global != null
    ? global
    : value;
};

compilerTools.global = compilerTools.getGlobal(this);

compilerTools.polyfill = function (path, factory, esVersion, browserVersion) {
  if (factory) {
    var root = compilerTools.global;
    path = path.split(".");

    for (var index = 0; index < path.length - 1; index++) {
      var part = path[index];
      if (!(part in root)) {
        root[part] = {};
      }
      root = root[part];
    }

    path = path[path.length - 1];
    var oldValue = root[path];
    factory = factory(oldValue);

    if (factory != oldValue && factory != null) {
      compilerTools.defineProperty(root, path, {
        configurable: true,
        writable: true,
        value: factory
      });
    }
  }
};

compilerTools.polyfill(
  "Array.from",
  function (nativeFrom) {
    return nativeFrom
      ? nativeFrom
      : function (source, mapper, context) {
          mapper = mapper != null ? mapper : function (item) { return item; };
          var result = [];
          var iterator = typeof Symbol != "undefined" && Symbol.iterator && source[Symbol.iterator];

          if (typeof iterator == "function") {
            source = iterator.call(source);
            for (var position = 0; !(iterator = source.next()).done;) {
              result.push(mapper.call(context, iterator.value, position++));
            }
          } else {
            for (iterator = source.length, position = 0; position < iterator; position++) {
              result.push(mapper.call(context, source[position], position));
            }
          }

          return result;
        };
  },
  "es6",
  "es3"
);

function main(inputText) {
  var rows = inputText.split("\n");
  var totalNumbers = parseInt(rows[0]);
  var originalValues = [];

  rows[1] = rows[1].split(" ");

  for (var i = 0; i < totalNumbers; ++i) {
    originalValues.push(parseInt(rows[1][i]));
  }

  var sortedValues = Array.from(originalValues);
  sortedValues.sort();

  console.log(originalValues, sortedValues);

  var mismatchCount = 0;
  for (var j = 0; j < totalNumbers; ++j) {
    if (originalValues[j] != sortedValues[j]) {
      mismatchCount += 1;
    }
  }

  console.log(2 >= mismatchCount ? "YES" : "NO");
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));