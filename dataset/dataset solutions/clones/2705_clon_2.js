// Type II clone: same logic, renamed identifiers and reformatted.

module.exports = function (modules) {
    var moduleCache = {};

    function requireModule(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        var currentModule = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        modules[moduleId].call(
            currentModule.exports,
            currentModule,
            currentModule.exports,
            requireModule
        );

        currentModule.l = true;
        return currentModule.exports;
    }

    requireModule.m = modules;
    requireModule.c = moduleCache;

    requireModule.d = function (target, key, getter) {
        if (!requireModule.o(target, key)) {
            Object.defineProperty(target, key, {
                enumerable: true,
                get: getter
            });
        }
    };

    requireModule.r = function (target) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(target, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(target, "__esModule", {
            value: true
        });
    };

    requireModule.t = function (value, mode) {
        if (mode & 1) {
            value = requireModule(value);
        }

        if (mode & 8) {
            return value;
        }

        if ((mode & 4) && typeof value === "object" && value && value.__esModule) {
            return value;
        }

        var namespaceObject = Object.create(null);
        requireModule.r(namespaceObject);

        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: value
        });

        if ((mode & 2) && typeof value !== "string") {
            for (var propertyName in value) {
                requireModule.d(
                    namespaceObject,
                    propertyName,
                    function (capturedName) {
                        return value[capturedName];
                    }.bind(null, propertyName)
                );
            }
        }

        return namespaceObject;
    };

    requireModule.n = function (moduleValue) {
        var getter = moduleValue && moduleValue.__esModule
            ? function () {
                return moduleValue.default;
            }
            : function () {
                return moduleValue;
            };

        requireModule.d(getter, "a", getter);
        return getter;
    };

    requireModule.o = function (objectRef, propertyRef) {
        return Object.prototype.hasOwnProperty.call(objectRef, propertyRef);
    };

    requireModule.p = "";

    return requireModule(requireModule.s = 0);
}([
    function (moduleObj, exportsObj, localRequire) {
        "use strict";

        var fileSystem = localRequire(1);
        localRequire(2)(fileSystem.readFileSync("/dev/stdin", "utf8"));
    },

    function (moduleObj, exportsObj) {
        moduleObj.exports = require("fs");
    },

    function (moduleObj, exportsObj, localRequire) {
        "use strict";

        var InputReader = localRequire(3);
        var executeSolver = localRequire(5);

        moduleObj.exports = function (inputText) {
            var readerInstance = new InputReader(inputText);
            executeSolver(readerInstance);
        };
    },

    function (moduleObj, exportsObj, localRequire) {
        "use strict";

        var SimpleQueue = localRequire(4);

        moduleObj.exports = class {
            constructor(sourceText) {
                var splitTokens = sourceText.trim().split(/\s+/g);
                this.stream = new SimpleQueue(splitTokens);
            }

            inr() {
                return this.stream.deq();
            }

            in() {
                return parseInt(this.stream.deq(), 10);
            }

            fin() {
                this.stream.clear();
            }
        };
    },

    function (moduleObj, exportsObj, localRequire) {
        "use strict";

        moduleObj.exports = class {
            constructor() {
                var initialItems = arguments.length > 0 && arguments[0] !== undefined
                    ? arguments[0]
                    : [];

                this.size = initialItems.length;
                this.items = initialItems;
                this.index = 0;
            }

            enq(nextValue) {
                this.size += 1;
                this.items.push(nextValue);
            }

            deq() {
                var nextItem = this.items[this.index];
                this.size -= 1;
                this.index += 1;
                return nextItem;
            }

            clear() {
                this.items = [];
                this.size = 0;
                this.index = 0;
            }
        };
    },

    function (moduleObj, exportsObj, localRequire) {
        "use strict";

        moduleObj.exports = function (reader) {
            var pattern = reader.inr();
            var patternLength = pattern.length;
            var table = new Array(patternLength);
            var rowIndex = 0;

            for (rowIndex = 0; rowIndex <= patternLength; rowIndex++) {
                table[rowIndex] = new Array(13).fill(0);
            }

            table[0][0] = 1;

            for (var position = 1; position <= patternLength; position++) {
                if (pattern[position - 1] == "?") {
                    for (var remainder = 0; remainder < 13; remainder++) {
                        for (var digit = 0; digit < 10; digit++) {
                            table[position][(10 * remainder + digit) % 13] +=
                                table[position - 1][remainder];

                            table[position][(10 * remainder + digit) % 13] %=
                                1000000007;
                        }
                    }
                } else {
                    for (
                        var fixedDigit = Number(pattern[position - 1]), previousRemainder = 0;
                        previousRemainder < 13;
                        previousRemainder++
                    ) {
                        table[position][(10 * previousRemainder + fixedDigit) % 13] +=
                            table[position - 1][previousRemainder];

                        table[position][(10 * previousRemainder + fixedDigit) % 13] %=
                            1000000007;
                    }
                }
            }

            console.log(table[patternLength][5]);
        };
    }
]);