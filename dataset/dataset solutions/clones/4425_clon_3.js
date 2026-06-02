module.exports = (function (modules) {
    var installedModules = {};

    function __webpack_require__(moduleId) {
        var cachedModule = installedModules[moduleId];
        if (cachedModule) {
            return cachedModule.exports;
        }

        var moduleRecord = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        var moduleFactory = modules[moduleId];
        moduleFactory.call(moduleRecord.exports, moduleRecord, moduleRecord.exports, __webpack_require__);
        moduleRecord.l = true;
        return moduleRecord.exports;
    }

    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;

    __webpack_require__.d = function (exportsObject, propertyName, getter) {
        var alreadyExists = __webpack_require__.o(exportsObject, propertyName);
        if (!alreadyExists) {
            Object.defineProperty(exportsObject, propertyName, {
                enumerable: true,
                get: getter
            });
        }
    };

    __webpack_require__.r = function (exportsObject) {
        var canTag = typeof Symbol !== "undefined" && Symbol.toStringTag;
        if (canTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exportsObject, "__esModule", { value: true });
    };

    __webpack_require__.t = function (value, mode) {
        if (mode & 1) {
            value = __webpack_require__(value);
        }
        if (mode & 8) {
            return value;
        }
        if ((mode & 4) && typeof value == "object" && value && value.__esModule) {
            return value;
        }

        var namespaceObject = Object.create(null);
        __webpack_require__.r(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: value
        });

        if ((mode & 2) && typeof value != "string") {
            for (var key in value) {
                __webpack_require__.d(namespaceObject, key, function (exportName) {
                    return value[exportName];
                }.bind(null, key));
            }
        }
        return namespaceObject;
    };

    __webpack_require__.n = function (moduleValue) {
        var getter;
        if (moduleValue && moduleValue.__esModule) {
            getter = function () {
                return moduleValue.default;
            };
        } else {
            getter = function () {
                return moduleValue;
            };
        }
        __webpack_require__.d(getter, "a", getter);
        return getter;
    };

    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    __webpack_require__.p = "";
    var entryId = __webpack_require__.s = 0;
    return __webpack_require__(entryId);
})([
    function (module, exports, __webpack_require__) {
        "use strict";

        var fsModule = __webpack_require__(1);
        var InputReader = __webpack_require__(2);
        var solve = __webpack_require__(4);

        var inputText = fsModule.readFileSync("/dev/stdin", "utf8");
        var tokens = inputText.split(/\s+/g);
        var reader = new InputReader(tokens);
        solve(reader);
    },
    function (module, exports) {
        module.exports = require("fs");
    },
    function (module, exports, __webpack_require__) {
        "use strict";

        var Queue = __webpack_require__(3);

        module.exports = class {
            constructor(tokens) {
                this.inp = new Queue(tokens);
            }

            n() {
                var token = this.inp.deq();
                return token;
            }

            ni() {
                var rawToken = this.inp.deq();
                var numberValue = parseInt(rawToken, 10);
                return numberValue;
            }

            add(token) {
                this.inp.enq(token);
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
                var index = this.ind;
                var item = this.items[index];
                this.size -= 1;
                this.ind += 1;
                return item;
            }
        };
    },
    function (module, exports, __webpack_require__) {
        "use strict";

        module.exports = function (reader) {
            var n = reader.ni();
            var graph = new Array(n);

            for (var nodeIndex = 0; nodeIndex < n; nodeIndex++) {
                graph[nodeIndex] = [];
            }

            for (var edgeIndex = 0; edgeIndex < n - 1; edgeIndex++) {
                var leftNode = reader.ni();
                var rightNode = reader.ni();
                var cost = reader.ni();
                var leftIndex = leftNode - 1;
                var rightIndex = rightNode - 1;

                graph[leftIndex].push([rightIndex, cost]);
                graph[rightIndex].push([leftIndex, cost]);
            }

            var queryCount = reader.ni();
            var rootNode = reader.ni();
            var distances = new Array(n).fill(-1);
            var stack = [[rootNode - 1, 0]];

            while (stack.length > 0) {
                var popped = stack.pop();
                var currentNode = popped[0];
                var currentDistance = popped[1];
                var adjacentCount = graph[currentNode].length;

                for (var adjacentIndex = 0; adjacentIndex < adjacentCount; adjacentIndex++) {
                    var edge = graph[currentNode][adjacentIndex];
                    var nextNode = edge[0];
                    var edgeCost = edge[1];

                    if (-1 == distances[nextNode]) {
                        var nextDistance = currentDistance + edgeCost;
                        distances[nextNode] = nextDistance;
                        stack.push([nextNode, nextDistance]);
                    }
                }
            }

            for (var queryIndex = 0; queryIndex < queryCount; queryIndex++) {
                var x = reader.ni() - 1;
                var y = reader.ni() - 1;
                var answer = distances[x] + distances[y];
                console.log(answer);
            }
        };
    }
]);
