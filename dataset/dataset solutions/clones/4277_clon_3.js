module.exports = (function(moduleDefinitions) {
    var moduleCache = {};

    function __webpack_require__(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, __webpack_require__);
        moduleObject.l = true;
        return moduleObject.exports;
    }

    __webpack_require__.modules = moduleDefinitions;
    __webpack_require__.cache = moduleCache;

    __webpack_require__.defineExport = function(exportsObject, propertyName, getterFunction) {
        if (!__webpack_require__.hasOwnProperty(exportsObject, propertyName)) {
            Object.defineProperty(exportsObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    __webpack_require__.registerModule = function(exportsObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    };

    __webpack_require__.createNamespaceObject = function(moduleExports, mode) {
        if (mode & 1) {
            moduleExports = __webpack_require__(moduleExports);
        }
        if (mode & 8) {
            return moduleExports;
        }
        if (mode & 4 && typeof moduleExports === "object" && moduleExports && moduleExports.__esModule) {
            return moduleExports;
        }
        var namespaceObject = Object.create(null);
        __webpack_require__.registerModule(namespaceObject);
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: moduleExports
        });
        if (mode & 2 && typeof moduleExports !== "string") {
            for (var key in moduleExports) {
                __webpack_require__.defineExport(namespaceObject, key, (function(currentKey) {
                    return moduleExports[currentKey];
                }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    __webpack_require__.getModuleExports = function(moduleExports) {
        var getterFunction = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        __webpack_require__.defineExport(getterFunction, "a", getterFunction);
        return getterFunction;
    };

    __webpack_require__.hasOwnProperty = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    __webpack_require__.publicPath = "";

    return __webpack_require__(__webpack_require__.startupModule = 0);
})([
    function(module, exports, localRequire) {
        const FS_MODULE_IDENTIFIER = 2;
        const MAIN_LOGIC_MODULE_IDENTIFIER = 1;
        const STDIN_FILE_PATH = "/dev/stdin";
        const UTF8_ENCODING = "UTF-8";

        const fileSystemModule = localRequire(FS_MODULE_IDENTIFIER);
        const inputContent = fileSystemModule.readFileSync(STDIN_FILE_PATH, UTF8_ENCODING);
        localRequire(MAIN_LOGIC_MODULE_IDENTIFIER)(inputContent);
    },
    function(module, exports) {
        const NEWLINE_DELIMITER = "\n";
        const WILDCARD_CHARACTER = "?";
        const DEFAULT_REPLACEMENT_CHARACTER = "a";
        const UNRESTORABLE_OUTPUT_MESSAGE = "UNRESTORABLE";

        module.exports = function(inputStringData) {
            const inputLines = inputStringData.split(NEWLINE_DELIMITER);
            const primaryTargetString = inputLines[0];
            const searchPatternString = inputLines[1];

            const targetLength = primaryTargetString.length;
            const patternLength = searchPatternString.length;

            // Guard clause: If the pattern is longer than the target, no match is possible.
            if (patternLength > targetLength) {
                console.log(UNRESTORABLE_OUTPUT_MESSAGE);
                return;
            }

            let foundMatchStartingIndex = -1; // Initialize to -1, indicating no match found yet

            // Helper function to determine if a target character matches a pattern character, considering wildcards.
            const isCharacterMatch = (targetChar, patternChar) => {
                return targetChar === patternChar || targetChar === WILDCARD_CHARACTER;
            };

            // Iterate from the rightmost possible starting position to the left.
            // This ensures that if multiple matches exist, the rightmost one is found first.
            for (let currentSearchPosition = targetLength - patternLength; currentSearchPosition >= 0; currentSearchPosition--) {
                let isCurrentSegmentAMatch = true; // Assume the current segment is a match

                // Compare each character of the pattern with the corresponding character in the target segment.
                for (let charOffset = 0; charOffset < patternLength; charOffset++) {
                    const targetSegmentChar = primaryTargetString[currentSearchPosition + charOffset];
                    const patternChar = searchPatternString[charOffset];

                    if (!isCharacterMatch(targetSegmentChar, patternChar)) {
                        isCurrentSegmentAMatch = false; // Mismatch found, this segment is not a match.
                        break; // Exit inner loop, no need to check further characters for this position.
                    }
                }

                if (isCurrentSegmentAMatch) {
                    foundMatchStartingIndex = currentSearchPosition; // Record the starting index of the match.
                    break; // Exit outer loop, as the rightmost match has been found.
                }
            }

            // Output the result based on whether a match was successfully found.
            if (foundMatchStartingIndex === -1) {
                console.log(UNRESTORABLE_OUTPUT_MESSAGE);
            } else {
                // Construct the final string by inserting the pattern into the target string at the match location.
                const leadingPart = primaryTargetString.slice(0, foundMatchStartingIndex);
                const trailingPart = primaryTargetString.slice(foundMatchStartingIndex + patternLength);
                let finalOutputString = leadingPart + searchPatternString + trailingPart;

                // Replace any remaining wildcard characters in the final string with the default replacement character.
                finalOutputString = finalOutputString.replace(new RegExp(WILDCARD_CHARACTER, "g"), DEFAULT_REPLACEMENT_CHARACTER);
                console.log(finalOutputString);
            }
        };
    },
    function(module, exports) {
        module.exports = require("fs");
    }
]);
