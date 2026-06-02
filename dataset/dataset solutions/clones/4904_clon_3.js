module.exports = (function (moduleFactories) {
    var installedModules = {};

    function localRequire(moduleId) {
        var cachedModule = installedModules[moduleId];
        if (cachedModule) {
            return cachedModule.exports;
        }

        var createdModule = {
            i: moduleId,
            l: false,
            exports: {}
        };
        installedModules[moduleId] = createdModule;

        var factory = moduleFactories[moduleId];
        factory.call(createdModule.exports, createdModule, createdModule.exports, localRequire);
        createdModule.l = true;

        return createdModule.exports;
    }

    localRequire.m = moduleFactories;
    localRequire.c = installedModules;

    localRequire.d = function (targetObject, exportedName, getterFn) {
        var alreadyOwned = localRequire.o(targetObject, exportedName);
        if (!alreadyOwned) {
            Object.defineProperty(targetObject, exportedName, {
                enumerable: true,
                get: getterFn
            });
        }
    };

    localRequire.r = function (targetObject) {
        var canTag = "undefined" != typeof Symbol && Symbol.toStringTag;
        if (canTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    localRequire.t = function (requiredValue, mode) {
        if (1 & mode) {
            requiredValue = localRequire(requiredValue);
        }
        if (8 & mode) {
            return requiredValue;
        }
        if (4 & mode && "object" == typeof requiredValue && requiredValue && requiredValue.__esModule) {
            return requiredValue;
        }

        var namespaceObject = Object.create(null);
        localRequire.r(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: requiredValue
        });

        if (2 & mode && "string" != typeof requiredValue) {
            for (var propertyName in requiredValue) {
                localRequire.d(namespaceObject, propertyName, function (currentKey) {
                    return requiredValue[currentKey];
                }.bind(null, propertyName));
            }
        }
        return namespaceObject;
    };

    localRequire.n = function (loadedModule) {
        var getter;
        if (loadedModule && loadedModule.__esModule) {
            getter = function () {
                return loadedModule.default;
            };
        } else {
            getter = function () {
                return loadedModule;
            };
        }
        localRequire.d(getter, "a", getter);
        return getter;
    };

    localRequire.o = function (objectToCheck, propertyToCheck) {
        var ownResult = Object.prototype.hasOwnProperty.call(objectToCheck, propertyToCheck);
        return ownResult;
    };

    localRequire.p = "";
    localRequire.s = 0;
    return localRequire(localRequire.s);
})([
    function (module, exports, requireFn) {
        "use strict";
        var fsModule = requireFn(1);
        var runProgram = requireFn(2);
        var sourceText = fsModule.readFileSync("/dev/stdin", "utf8");
        runProgram(sourceText);
    },
    function (module, exports) {
        var requiredFs = require("fs");
        module.exports = requiredFs;
    },
    function (module, exports, requireFn) {
        "use strict";
        var ReaderClass = requireFn(3);
        var solverFunction = requireFn(5);
        module.exports = function (rawInput) {
            var readerInstance = new ReaderClass(rawInput);
            solverFunction(readerInstance);
        };
    },
    function (module, exports, requireFn) {
        "use strict";
        var QueueClass = requireFn(4);
        module.exports = class {
            constructor(inputString) {
                var trimmedInput = inputString.trim();
                var splitTokens = trimmedInput.split(/\s+/g);
                this.inp = new QueueClass(splitTokens);
            }
            inr() {
                var tokenValue = this.inp.deq();
                return tokenValue;
            }
            in() {
                var tokenString = this.inp.deq();
                var parsedNumber = parseInt(tokenString, 10);
                return parsedNumber;
            }
            fin() {
                this.inp.clear();
            }
        };
    },
    function (module, exports, requireFn) {
        "use strict";
        module.exports = class {
            constructor() {
                var initialItems = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                this.size = initialItems.length;
                this.items = initialItems;
                this.ind = 0;
            }
            enq(nextItem) {
                this.size += 1;
                this.items.push(nextItem);
            }
            deq() {
                var currentIndex = this.ind;
                var nextValue = this.items[currentIndex];
                this.size -= 1;
                this.ind += 1;
                return nextValue;
            }
            clear() {
                this.items = [];
                this.size = 0;
                this.ind = 0;
            }
        };
    },
    function (module, exports, requireFn) {
        "use strict";
        module.exports = function (scanner) {
            scanner.in();

            var count = scanner.in();
            var values = new Array(count);
            var maxValue = 0;
            var maxIndex = 0;
            var readIndex = 0;

            for (; readIndex < count; readIndex++) {
                var currentNumber = scanner.in();
                values[readIndex] = currentNumber;
                if (values[readIndex] > maxValue) {
                    maxValue = values[readIndex];
                    maxIndex = readIndex;
                }
            }

            var totalOther = 0;
            var sumIndex = 0;
            for (; sumIndex < count; sumIndex++) {
                if (sumIndex != maxIndex) {
                    totalOther += values[sumIndex];
                }
            }

            var answer = maxValue - 1 - totalOther;
            if (answer < 0) {
                console.log(0);
            } else {
                console.log(answer);
            }
        };
    }
]);
