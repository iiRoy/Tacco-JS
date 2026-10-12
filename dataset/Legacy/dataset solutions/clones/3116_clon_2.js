!function(modulesMap) {
    // This object serves as a cache for loaded modules.
    var moduleCache = {};

    // The core module loading function, similar to 'require'.
    function moduleLoader(currentModuleId) {
        // If the module is already in the cache, return its exports immediately.
        if (moduleCache[currentModuleId]) {
            return moduleCache[currentModuleId].exports;
        }

        // If not in cache, create a new module entry and store it.
        var moduleObject = moduleCache[currentModuleId] = {
            i: currentModuleId, // The module's ID.
            l: false,           // A flag indicating if the module has been loaded.
            exports: {}         // The exports object for this module.
        };

        // Execute the module function, passing the module object, its exports, and the loader itself.
        modulesMap[currentModuleId].call(moduleObject.exports, moduleObject, moduleObject.exports, moduleLoader);

        // Mark the module as loaded after execution.
        moduleObject.l = true;

        // Return the module's exports.
        return moduleObject.exports;
    }

    // Expose the modules map to the loader.
    moduleLoader.m = modulesMap;

    // Expose the module cache to the loader.
    moduleLoader.c = moduleCache;

    // Define a getter function for harmony exports (ESM compatibility).
    moduleLoader.d = function(targetObject, propertyName, getterFunction) {
        // Only define if the property doesn't already exist on the target object.
        if (!moduleLoader.o(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable.
                get: getterFunction // Assign the provided getter function.
            });
        }
    };

    // Define __esModule on exports for ES module interoperability.
    moduleLoader.r = function(targetObject) {
        // Set Symbol.toStringTag for better module identification in some environments.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Mark the object as an ES module.
        Object.defineProperty(targetObject, "__esModule", {
            value: true
        });
    };

    // Create a fake namespace object for various import scenarios.
    // mode & 1: value is a module ID, so require it first.
    // mode & 8: behave like a direct 'require' call.
    // mode & 4: return value directly if it's already an ES module namespace object.
    // mode & 2: merge all properties from the module into the new namespace object.
    moduleLoader.t = function(targetModuleId, modeFlags) {
        if (modeFlags & 1) {
            targetModuleId = moduleLoader(targetModuleId);
        }
        if (modeFlags & 8) {
            return targetModuleId;
        }
        if (modeFlags & 4 && typeof targetModuleId === "object" && targetModuleId && targetModuleId.__esModule) {
            return targetModuleId;
        }
        var resultObject = Object.create(null);
        moduleLoader.r(resultObject);
        Object.defineProperty(resultObject, "default", {
            enumerable: true,
            value: targetModuleId
        });
        if (modeFlags & 2 && typeof targetModuleId !== "string") {
            for (var propName in targetModuleId) {
                moduleLoader.d(resultObject, propName, (function(prop) {
                    return targetModuleId[prop];
                }).bind(null, propName));
            }
        }
        return resultObject;
    };

    // Get the default export of a module, handling both ES modules and CommonJS.
    moduleLoader.n = function(inputModule) {
        var defaultExportGetter = inputModule && inputModule.__esModule ? function() {
            return inputModule.default
        } : function() {
            return inputModule
        };
        return moduleLoader.d(defaultExportGetter, "a", defaultExportGetter), defaultExportGetter
    };

    // Check if a property is an own property of an object.
    moduleLoader.o = function(checkObject, checkProperty) {
        return Object.prototype.hasOwnProperty.call(checkObject, checkProperty);
    };

    // Public path for assets (empty in this case).
    moduleLoader.p = "";

    // Load the entry module (module ID 17) and start execution.
    moduleLoader(moduleLoader.s = 17);
}({
    // Module 0: Contains utility functions for input processing.
    0: function(moduleRef, exportsObj, localRequire) {
        "use strict";
        // TypeScript/Babel helper for async/await syntax.
        var asyncWrapper = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
            return new(P || (P = Promise))(function(resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function rejected(value) {
                    try {
                        step(generator.throw(value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function(resolve) {
                        resolve(result.value);
                    }).then(fulfilled, rejected);
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };

        // TypeScript/Babel helper for generator functions.
        var generatorFactory = (this && this.__generator) || function(thisArg, body) {
            var _ = {
                    label: 0,
                    sent: function() {
                        if (1 & _[0]) throw _[1];
                        return _[1];
                    },
                    trys: [],
                    ops: []
                },
                f, y, t, g;
            return g = {
                next: verb(0),
                "throw": verb(1),
                "return": verb(2)
            }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
                return this;
            }), g;

            function verb(n) {
                return function(v) {
                    return step([n, v]);
                };
            }

            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return {
                                value: op[1],
                                done: false
                            };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) {
                                _.ops.pop();
                            }
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
                if (op[0] & 5) throw op[1];
                return {
                    value: op[0] ? op[1] : void 0,
                    done: true
                };
            }
        };

        // TypeScript/Babel helper for handling default imports.
        var importDefaultHelper = (this && this.__importDefault) || function(inputModule) {
            return (inputModule && inputModule.__esModule) ? inputModule : {
                default: inputModule
            };
        };

        var currentContext = this;
        exportsObj.__esModule = true;

        // Import the Node.js 'fs' (file system) module.
        var fileSystemModule = importDefaultHelper(localRequire(1));

        // Generator function that yields words from an input string, splitting by whitespace.
        function createWordIterator(inputString) {
            var wordParts, currentIndex, genState;
            return generatorFactory(this, function(genState) {
                switch (genState.label) {
                    case 0:
                        // Split the input string by one or more whitespace characters and filter out empty results.
                        wordParts = inputString.split(/\s+/).filter(function(part) {
                            return part.length > 0;
                        });
                        currentIndex = 0;
                        genState.label = 1;
                    case 1:
                        // Check if there are more words to yield.
                        return currentIndex < wordParts.length ? [4, wordParts[currentIndex]] : [3, 4];
                    case 2:
                        genState.sent(); // Consume the yielded value (not used here, but part of generator flow).
                        genState.label = 3;
                    case 3:
                        currentIndex++; // Move to the next word.
                        return [3, 1]; // Loop back to check for more words.
                    case 4:
                        return [2]; // End of the generator.
                }
            });
        }

        // Asynchronously reads all content from standard input (/dev/stdin).
        exportsObj.readInput = function() {
            return new Promise(function(resolvePromise, rejectPromise) {
                fileSystemModule.default.readFile("/dev/stdin", "utf8", function(readError, fileContent) {
                    if (readError) {
                        rejectPromise(readError); // Reject the promise if an error occurs.
                    } else {
                        resolvePromise(fileContent); // Resolve with the file content.
                    }
                });
            });
        };

        // Expose the word iterator creator function.
        exportsObj.getFoolIterator = createWordIterator;

        // Asynchronously gets a function that returns the next integer from stdin using the basic word iterator.
        exportsObj.getFoolNextInt = function() {
            return asyncWrapper(currentContext, void 0, void 0, function() {
                var rawInput, wordIterator;
                return generatorFactory(this, function(genState) {
                    switch (genState.label) {
                        case 0:
                            return [4, exportsObj.readInput()]; // Await the full input string.
                        case 1:
                            rawInput = genState.sent();
                            wordIterator = createWordIterator(rawInput); // Create an iterator for the input.
                            // Return a function that, when called, yields and parses the next integer.
                            return [2, function() {
                                return parseInt(wordIterator.next().value);
                            }];
                    }
                });
            });
        };

        // Asynchronously gets a function that returns the next token from stdin using a character-by-character iterator.
        exportsObj.getChottoMashinaNext = function() {
            return asyncWrapper(currentContext, void 0, void 0, function() {
                var fullInput, charIterator;
                return generatorFactory(this, function(genState) {
                    switch (genState.label) {
                        case 0:
                            return [4, exportsObj.readInput()]; // Await the full input string.
                        case 1:
                            fullInput = genState.sent();
                            // Define and immediately invoke an inner generator to extract tokens.
                            charIterator = function() {
                                var startIndex, charIndex, currentWord, innerGenState;
                                return generatorFactory(this, function(innerGenState) {
                                    switch (innerGenState.label) {
                                        case 0:
                                            startIndex = -1; // Initialize start index for a word.
                                            charIndex = 0; // Initialize character index.
                                            innerGenState.label = 1;
                                        case 1:
                                            // Loop through the input string character by character.
                                            return charIndex <= fullInput.length ?
                                                // If current char is not a space/newline AND not end of string, it's part of a word.
                                                (fullInput[charIndex] !== " " && fullInput[charIndex] !== "\n" && charIndex !== fullInput.length) ? [3, 5] :
                                                // If a word was being built (startIndex != -1), yield it.
                                                startIndex !== -1 ? [3, 2] : [3, 6] :
                                                [3, 7]; // End of string, terminate.
                                        case 2:
                                            currentWord = fullInput.substring(startIndex, charIndex); // Extract the word.
                                            startIndex = -1; // Reset start index for the next word.
                                            return [4, currentWord]; // Yield the extracted word.
                                        case 3:
                                            innerGenState.sent(); // Consume the yielded value.
                                            innerGenState.label = 4;
                                        case 4:
                                            return [3, 6]; // Continue to the next character.
                                        case 5:
                                            // If not currently building a word, mark the current character as the start.
                                            if (startIndex === -1) {
                                                startIndex = charIndex;
                                            }
                                            innerGenState.label = 6;
                                        case 6:
                                            charIndex++; // Move to the next character.
                                            return [3, 1]; // Loop back.
                                        case 7:
                                            return [2]; // End of the inner generator.
                                    }
                                });
                            }();
                            // Return a function that, when called, returns the next token from the character iterator.
                            return [2, function() {
                                return charIterator.next().value;
                            }];
                    }
                });
            });
        };

        // Asynchronously gets a function that returns the next integer from stdin using the "chotto mashina" iterator.
        exportsObj.getChottoMashinaNextInt = function() {
            return asyncWrapper(currentContext, void 0, void 0, function() {
                var nextWordFunction;
                return generatorFactory(this, function(genState) {
                    switch (genState.label) {
                        case 0:
                            return [4, exportsObj.getChottoMashinaNext()]; // Await the token getter function.
                        case 1:
                            nextWordFunction = genState.sent();
                            // Return a function that, when called, gets the next token and parses it as an integer.
                            return [2, function() {
                                return parseInt(nextWordFunction());
                            }];
                    }
                });
            });
        };
    },

    // Module 1: Node.js 'fs' module, directly exported.
    1: function(moduleRef, exportsObj) {
        moduleRef.exports = require("fs");
    },

    // Module 17: Main application logic.
    17: function(moduleRef, exportsObj, localRequire) {
        "use strict";
        // TypeScript/Babel helper for async/await syntax.
        var asyncWrapper = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
            return new(P || (P = Promise))(function(resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function rejected(value) {
                    try {
                        step(generator.throw(value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : new P(function(resolve) {
                        resolve(result.value);
                    }).then(fulfilled, rejected);
                }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };

        // TypeScript/Babel helper for generator functions.
        var generatorFactory = (this && this.__generator) || function(thisArg, body) {
            var _ = {
                    label: 0,
                    sent: function() {
                        if (1 & _[0]) throw _[1];
                        return _[1];
                    },
                    trys: [],
                    ops: []
                },
                f, y, t, g;
            return g = {
                next: verb(0),
                "throw": verb(1),
                "return": verb(2)
            }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
                return this;
            }), g;

            function verb(n) {
                return function(v) {
                    return step([n, v]);
                };
            }

            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return {
                                value: op[1],
                                done: false
                            };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) {
                                _.ops.pop();
                            }
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
                if (op[0] & 5) throw op[1];
                return {
                    value: op[0] ? op[1] : void 0,
                    done: true
                };
            }
        };

        var currentContext = this;
        exportsObj.__esModule = true;

        // Import input helper functions from module 0.
        var inputHelpers = localRequire(0);

        // Main asynchronous execution block for the application.
        asyncWrapper(currentContext, void 0, void 0, function() {
            var initialValue, currentNum, firstLoopVar, secondLoopVar, genState;
            return generatorFactory(this, function(genState) {
                switch (genState.label) {
                    case 0:
                        // Await a function that will provide the next integer from input.
                        return [4, inputHelpers.getChottoMashinaNextInt()];
                    case 1:
                        initialValue = genState.sent();
                        currentNum = initialValue(); // Call the obtained function to get the actual integer value.

                        // Check if the number is odd or even.
                        if (currentNum % 2 === 1) {
                            // If the number is odd, iterate through pairs (firstLoopVar, secondLoopVar).
                            // Print pairs where their sum is NOT equal to currentNum.
                            for (firstLoopVar = 1; firstLoopVar <= currentNum; firstLoopVar++) {
                                for (secondLoopVar = firstLoopVar + 1; secondLoopVar <= currentNum; secondLoopVar++) {
                                    if (firstLoopVar + secondLoopVar !== currentNum) {
                                        console.log(firstLoopVar + " " + secondLoopVar);
                                    }
                                }
                            }
                        } else {
                            // If the number is even, iterate through pairs (firstLoopVar, secondLoopVar).
                            // Print pairs where their sum is NOT equal to currentNum + 1.
                            for (firstLoopVar = 1; firstLoopVar <= currentNum; firstLoopVar++) {
                                for (secondLoopVar = firstLoopVar + 1; secondLoopVar <= currentNum; secondLoopVar++) {
                                    if (firstLoopVar + secondLoopVar !== currentNum + 1) {
                                        console.log(firstLoopVar + " " + secondLoopVar);
                                    }
                                }
                            }
                        }
                        return [2]; // End of the main logic.
                }
            });
        })();
    }
});
