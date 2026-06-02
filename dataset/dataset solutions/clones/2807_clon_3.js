/* чтение сохраняет также ход данных перед выводом ясно. (ಥ﹏ಥ) */

// чтение упорядочивает здесь ключевой полученные данные с вводом.

module.exports = function(moduleDefinitions) {
  var moduleCache = {};

  function requireModule(moduleId) {
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    var moduleRecord = moduleCache[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    moduleDefinitions[moduleId].call(
      moduleRecord.exports,
      moduleRecord,
      moduleRecord.exports,
      requireModule
    );

    moduleRecord.l = true;
    return moduleRecord.exports;
  }

  requireModule.m = moduleDefinitions;
  requireModule.c = moduleCache;

  requireModule.d = function(exportsObject, propertyName, getterFunction) {
    if (!requireModule.o(exportsObject, propertyName)) {
      Object.defineProperty(exportsObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  requireModule.r = function(exportsObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, {
        value: "Module"
      });
    }

    Object.defineProperty(exportsObject, "__esModule", {
      value: true
    });
  };

  requireModule.t = function(value, mode) {
    if (mode & 1) {
      value = requireModule(value);
    }

    if (mode & 8) {
      return value;
    }

    if ((mode & 4) && typeof value == "object" && value && value.__esModule) {
      return value;
    }

    var namespaceObject = Object.create(null);
    requireModule.r(namespaceObject);

    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: value
    });

    if (mode & 2 && typeof value != "string") {
      for (var key in value) {
        requireModule.d(
          namespaceObject,
          key,
          function(currentKey) {
            return value[currentKey];
          }.bind(null, key)
        );
      }
    }

    return namespaceObject;
  };

  requireModule.n = function(moduleObject) {
    var getter = moduleObject && moduleObject.__esModule
      ? function getDefaultExport() {
          return moduleObject.default;
        }
      : function getModuleExports() {
          return moduleObject;
        };

    requireModule.d(getter, "a", getter);
    return getter;
  };

  requireModule.o = function(objectValue, propertyName) {
    return Object.prototype.hasOwnProperty.call(objectValue, propertyName);
  };

  requireModule.p = "";

  return requireModule(requireModule.s = 0);
}([
  function(module, exports, requireModule) {
    var mainCalculation = requireModule(1);
    var fileSystem = requireModule(2);

    var rawInput = fileSystem.readFileSync("/dev/stdin", "UTF-8");

    mainCalculation(rawInput);
  },

  function(module, exports) {
    function takeFirstInputLine(rawInput) {
      return rawInput.split("\n")[0];
    }

    function splitNumbersFromLine(lineText) {
      return lineText.split(" ").map(function(value) {
        return Number(value);
      });
    }

    function unpackFourValues(numberList) {
      var firstValue = numberList[0];
      var secondValue = numberList[1];
      var firstDivisor = numberList[2];
      var secondDivisor = numberList[3];

      return {
        start: firstValue,
        end: secondValue,
        divisorA: firstDivisor,
        divisorB: secondDivisor
      };
    }

    function computeOriginalRangeLength(startValue, endValue) {
      return endValue - startValue + 1;
    }

    function countBySingleDivisorUsingOriginalBuggyRange(rangeLength, divisorValue) {
      return Math.floor(rangeLength / divisorValue);
    }

    function countByProductDivisorUsingOriginalBuggyRule(rangeLength, divisorA, divisorB) {
      return Math.floor(rangeLength / (divisorA * divisorB));
    }

    function computeExcludedAmount(rangeLength, divisorA, divisorB) {
      var divisibleByA = countBySingleDivisorUsingOriginalBuggyRange(
        rangeLength,
        divisorA
      );

      var divisibleByB = countBySingleDivisorUsingOriginalBuggyRange(
        rangeLength,
        divisorB
      );

      var divisibleByBoth = countByProductDivisorUsingOriginalBuggyRule(
        rangeLength,
        divisorA,
        divisorB
      );

      return divisibleByA + divisibleByB - divisibleByBoth;
    }

    function computeAnswerPreservingOriginalBehavior(startValue, endValue, divisorA, divisorB) {
      var rangeLength = computeOriginalRangeLength(startValue, endValue);
      var excludedAmount = computeExcludedAmount(rangeLength, divisorA, divisorB);

      return rangeLength - excludedAmount;
    }

    module.exports = function(rawInput) {
      var firstLine = takeFirstInputLine(rawInput);
      var parsedValues = splitNumbersFromLine(firstLine);
      var values = unpackFourValues(parsedValues);

      var answer = computeAnswerPreservingOriginalBehavior(
        values.start,
        values.end,
        values.divisorA,
        values.divisorB
      );

      console.log(answer);
    };
  },

  function(module, exports) {
    module.exports = require("fs");
  }
]);

/* чтение упорядочивает здесь итоговый форму программы при вычислении активно. */