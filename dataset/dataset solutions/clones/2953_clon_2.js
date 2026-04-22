// This is a self-executing anonymous function that acts as a module bundler.
// It takes an array of module definitions and sets up a system for loading and caching them.
!function (moduleDefinitions) {
  // A cache for loaded modules. Keys are module IDs, values are module objects.
  var moduleCacheStore = {};

  // The main function to load or retrieve a module by its ID.
  function dynamicModuleLoader(requestedModuleId) {
    // If the module is already in the cache, return its exports immediately.
    if (moduleCacheStore[requestedModuleId]) {
      return moduleCacheStore[requestedModuleId].exports;
    }

    // If not in cache, create a new module entry and store it.
    // The module entry contains:
    //   'identifier': the module ID
    //   'isLoaded': a flag indicating if the module has been executed
    //   'exports': an empty object to be populated by the module's code
    var activeModuleEntry = moduleCacheStore[requestedModuleId] = {
      identifier: requestedModuleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module function.
    // The module function receives:
    //   1. The module object itself (activeModuleEntry.exports becomes 'this' context)
    //   2. The module object for direct manipulation
    //   3. The module's exports object
    //   4. The dynamicModuleLoader function itself (for internal 'require' calls)
    moduleDefinitions[requestedModuleId].call(
      activeModuleEntry.exports,
      activeModuleEntry,
      activeModuleEntry.exports,
      dynamicModuleLoader
    );

    // Mark the module as loaded.
    activeModuleEntry.isLoaded = true;

    // Return the module's exports.
    return activeModuleEntry.exports;
  }

  // Store the array of module definitions on the loader for internal access.
  dynamicModuleLoader.definitions = moduleDefinitions;

  // Store the module cache on the loader.
  dynamicModuleLoader.cache = moduleCacheStore;

  // Helper to define a getter property on an exports object.
  // This is used for compatibility with ES modules.
  dynamicModuleLoader.defineExport = function (targetObject, propertyName, getterFunction) {
    // Only define if the property doesn't already exist on the target.
    if (!dynamicModuleLoader.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable
        get: getterFunction // Define a getter function
      });
    }
  };

  // Helper to mark an exports object as an ES module.
  dynamicModuleLoader.defineESModule = function (exportObject) {
    // If Symbol is available and toStringTag is defined, set it to "Module".
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObject, Symbol.toStringTag, { value: "Module" });
    }
    // Set the __esModule property to true for ES module identification.
    Object.defineProperty(exportObject, "__esModule", { value: true });
  };

  // Helper to create a namespace object for interop with non-ES modules.
  dynamicModuleLoader.createNamespaceObject = function (sourceModule, typeFlag) {
    // If flag 1 is set, re-evaluate the source module.
    if (typeFlag & 1) {
      sourceModule = dynamicModuleLoader(sourceModule);
    }
    // If flag 8 is set, return the source module directly.
    if (typeFlag & 8) {
      return sourceModule;
    }
    // If flag 4 is set and it's an object and an ES module, return it directly.
    if (typeFlag & 4 && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule) {
      return sourceModule;
    }

    // Otherwise, create a new namespace object.
    var namespaceObject = Object.create(null);
    // Mark it as an ES module.
    dynamicModuleLoader.defineESModule(namespaceObject);
    // Define a 'default' export pointing to the source module.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: sourceModule
    });
    // If flag 2 is set and source is not a string, copy all properties from source.
    if (typeFlag & 2 && typeof sourceModule !== "string") {
      for (var keyName in sourceModule) {
        dynamicModuleLoader.defineExport(
          namespaceObject,
          keyName,
          ((currentKey) => {
            // Bind the current key to the getter function.
            return () => sourceModule[currentKey];
          }).bind(null, keyName)
        );
      }
    }
    return namespaceObject;
  };

  // Helper to get the default export from a module.
  dynamicModuleLoader.interopDefault = function (moduleExport) {
    // If it's an ES module, return its 'default' property.
    // Otherwise, return the module itself.
    var defaultAccessor =
      moduleExport && moduleExport.__esModule
        ? function () {
            return moduleExport.default;
          }
        : function () {
            return moduleExport;
          };
    // Define a special 'a' export for backward compatibility.
    dynamicModuleLoader.defineExport(defaultAccessor, "a", defaultAccessor);
    return defaultAccessor;
  };

  // Helper to check if an object has a specific property.
  dynamicModuleLoader.hasOwn = function (targetObject, propertyToCheck) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyToCheck);
  };

  // Set the public path for asset loading (empty in this case).
  dynamicModuleLoader.publicPath = "";

  // Load and execute the startup module (module ID 1).
  dynamicModuleLoader((dynamicModuleLoader.startupModule = 1));
}(
  // Array containing all module definitions.
  [
    /* Module 0: Input Utilities (Paiza, HackerRank, AtCoder) */
    function (moduleObj, moduleExports, requireDependency) {
      "use strict";
      // TypeScript __importDefault helper function.
      var _importDefaultUtil =
        (this && this.__importDefault) ||
        function (importedModule) {
          return importedModule && importedModule.__esModule
            ? importedModule
            : { default: importedModule };
        };
      // TypeScript __importStar helper function.
      var _importStarUtil =
        (this && this.__importStar) ||
        function (importedModule) {
          if (importedModule && importedModule.__esModule) {
            return importedModule;
          }
          var namespaceObject = {};
          if (importedModule != null) {
            for (var propertyKey in importedModule) {
              // Check if the property belongs to the module itself, not its prototype chain.
              if (Object.hasOwnProperty.call(importedModule, propertyKey)) {
                namespaceObject[propertyKey] = importedModule[propertyKey];
              }
            }
          }
          // Set the default export to the entire module.
          namespaceObject.default = importedModule;
          return namespaceObject;
        };

      // Mark this module as an ES module.
      Object.defineProperty(moduleExports, "__esModule", { value: true });

      // Import 'fs' (file system) and 'readline' modules.
      var fileSystemUtil = _importDefaultUtil(requireDependency(17));
      var readInterfaceUtil = _importStarUtil(requireDependency(18));

      // Function to handle input from Paiza.
      moduleExports.getPaizaInput = function () {
        // Resume standard input stream.
        process.stdin.resume();
        // Set encoding for standard input.
        process.stdin.setEncoding("utf8");

        // Array to store input lines.
        var inputLines = [];
        // Create a readline interface.
        var inputReader = readInterfaceUtil.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        // Event listener for each line received.
        inputReader.on("line", function (currentLine) {
          inputLines.push(currentLine);
        });

        // Return a Promise that resolves with all collected input lines when input stream closes.
        return new Promise(function (resolvePromise) {
          inputReader.on("close", function () {
            resolvePromise(inputLines);
          });
        });
      };

      // Function to handle input from HackerRank.
      moduleExports.getHackerRankInput = function () {
        // Resume standard input stream.
        process.stdin.resume();
        // Set encoding for standard input.
        process.stdin.setEncoding("ascii");

        // String to accumulate all input data.
        var inputString = "";
        // Event listener for data chunks received.
        process.stdin.on("data", function (dataChunk) {
          inputString += dataChunk;
        });

        // Return a Promise that resolves with input lines (split by newline) when input stream ends.
        return new Promise(function (resolvePromise) {
          process.stdin.on("end", function () {
            resolvePromise(inputString.split("\n"));
          });
        });
      };

      // Function to handle input from AtCoder (reads from /dev/stdin).
      moduleExports.getAtcoderInput = function () {
        // Use file system utility to read synchronously.
        return fileSystemUtil.default.readFileSync("/dev/stdin", "utf8");
      };
    },

    /* Module 1: Main Application Logic */
    function (moduleContext, exportedValues, dependencyResolver) {
      "use strict";
      // TypeScript __awaiter helper for async functions.
      var _asyncRunner =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (error) {
                reject(error);
              }
            }
            function rejected(value) {
              try {
                step(generator.throw(value));
              } catch (error) {
                reject(error);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : new P(function (resolveChild) {
                    resolveChild(result.value);
                  }).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };
      // TypeScript __generator helper for async/await transformation.
      var _generatorFactory =
        (this && this.__generator) ||
        function (thisArg, body) {
          var _ = {
              label: 0,
              sent: function () {
                if (1 & _[0]) throw _[1];
                return _[1];
              },
              trys: [],
              ops: []
            },
            f,
            y,
            t,
            g;
          return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === "function" &&
              (g[Symbol.iterator] = function () {
                return this;
              }),
            g
          );
          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }
          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_)
              try {
                if (
                  ((f = 1),
                  y &&
                    (t =
                      op[0] & 2
                        ? y.return
                        : op[0]
                        ? y.throw || ((t = y.return) && t.call(y), 0)
                        : y.next) &&
                    !(t = t.call(y, op[1])).done)
                )
                  return t;
                if (((y = 0), t)) op = [op[0] & 2, t.value];
                switch (op[0]) {
                  case 0:
                  case 1:
                    t = op;
                    break;
                  case 4:
                    _.label++;
                    return { value: op[1], done: false };
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
                    if (
                      !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                      (op[0] === 6 || op[0] === 2)
                    ) {
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
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
                }
                op = body.call(thisArg, _);
              } catch (error) {
                op = [6, error];
                y = 0;
              } finally {
                f = t = 0;
              }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
          }
        };
      // TypeScript __importDefault helper.
      var _importDefaultHelper =
        (this && this.__importDefault) ||
        function (importedModule) {
          return importedModule && importedModule.__esModule
            ? importedModule
            : { default: importedModule };
        };

      // Mark this module as an ES module.
      Object.defineProperty(exportedValues, "__esModule", { value: true });

      // Import the 'contestSolutions' and 'inputHelpers' modules.
      var contestSolutions = _importDefaultHelper(dependencyResolver(2));
      var inputHelpers = dependencyResolver(0);

      // Immediately invoked async function to run the main logic.
      !(function () {
        _asyncRunner(this, void 0, void 0, function () {
          var receivedInput;
          return _generatorFactory(this, function (generatorState) {
            switch (generatorState.label) {
              case 0:
                // Await input from the Paiza platform.
                return [4 /*yield*/, inputHelpers.getPaizaInput()];
              case 1:
                receivedInput = generatorState.sent();
                // Process the input using the specific contest solution (beginner_contest_126.b)
                // and print each result to the console.
                contestSolutions.default.beginner_contest_126
                  .b(receivedInput)
                  .forEach(function (outputLine) {
                    return console.log(outputLine);
                  });
                return [2 /*return*/];
            }
          });
        })();
      })();
    },

    /* Module 2: Collection of Contest Solutions */
    function (moduleContext, exportedFunctions, dependencyLoader) {
      "use strict";
      // TypeScript __importDefault helper.
      var _importDefaultModule =
        (this && this.__importDefault) ||
        function (importedModule) {
          return importedModule && importedModule.__esModule
            ? importedModule
            : { default: importedModule };
        };

      // Mark this module as an ES module.
      Object.defineProperty(exportedFunctions, "__esModule", { value: true });

      // Import various contest solution modules.
      var begC122 = _importDefaultModule(dependencyLoader(3));
      var begC126 = _importDefaultModule(dependencyLoader(7));
      var diverta2019 = _importDefaultModule(dependencyLoader(10));
      var grandC029 = _importDefaultModule(dependencyLoader(13));
      var interactiveSort = _importDefaultModule(dependencyLoader(16));
      var welcome = _importDefaultModule(dependencyLoader(19));

      // Export a default object containing all contest solutions, grouped by contest name.
      exportedFunctions.default = {
        beginner_contest_122: begC122.default,
        beginner_contest_126: begC126.default,
        Diverta2019ProgrammingContest: diverta2019.default,
        GrandContest029: grandC029.default,
        interactiveSorting: interactiveSort.default,
        welcomeToAtCoder: welcome.default
      };
    },

    /* Module 3: Beginner Contest 122 Solutions */
    function (moduleContext, exportedHandlers, moduleResolver) {
      "use strict";
      // TypeScript __importDefault helper.
      var _defaultImporter =
        (this && this.__importDefault) ||
        function (importedModule) {
          return importedModule && importedModule.__esModule
            ? importedModule
            : { default: importedModule };
        };

      // Mark this module as an ES module.
      Object.defineProperty(exportedHandlers, "__esModule", { value: true });

      // Import specific problem solutions for Beginner Contest 122.
      var doubleHelix = _defaultImporter(moduleResolver(4));
      var atcoderProblem = _defaultImporter(moduleResolver(5));
      var getAcProblem = _defaultImporter(moduleResolver(6));

      // Export a default object containing solutions for Beginner Contest 122 problems.
      exportedHandlers.default = {
        A_DoubleHelix: doubleHelix.default,
        B_ATCoder: atcoderProblem.default,
        C_GeT_AC: getAcProblem.default
      };
    },

    /* Module 4: A - Double Helix */
    function (inputData, outputExports) {
      "use strict";
      // Mark this module as an ES module.
      Object.defineProperty(outputExports, "__esModule", { value: true });

      // Default export function for "A - Double Helix" problem.
      outputExports.default = function (inputLines) {
        // The problem asks to return the complementary base for a given DNA base.
        var firstInputChar = inputLines[0];
        switch (firstInputChar) {
          case "A":
            return ["T"];
          case "T":
            return ["A"];
          case "C":
            return ["G"];
          case "G":
            return ["C"];
          default:
            // Throw an error for invalid input.
            throw new Error("invalid string character provided");
        }
      };
    },

    /* Module 5: B - ATCoder */
    function (inputData, outputExports) {
      "use strict";
      // Helper function to check if a character is one of 'A', 'T', 'C', 'G'.
      function isAtcgChar(charValue) {
        return charValue === "A" || charValue === "T" || charValue === "C" || charValue === "G";
      }

      // Mark this module as an ES module.
      Object.defineProperty(outputExports, "__esModule", { value: true });

      // Default export function for "B - ATCoder" problem.
      outputExports.default = function (inputLines) {
        // The problem asks to find the longest contiguous subsequence of 'A', 'T', 'C', 'G' characters.
        var inputString = inputLines[0];
        var maxSequenceLength = 0;
        var currentSequenceLength = 0;

        // Iterate through the input string.
        for (var currentPosition = 0; currentPosition < inputString.length; currentPosition += 1) {
          // If the current character is an ATCG character, increment current sequence length.
          if (isAtcgChar(inputString[currentPosition])) {
            currentSequenceLength += 1;
          } else {
            // If not, compare current length with max length and reset current length.
            if (currentSequenceLength > maxSequenceLength) {
              maxSequenceLength = currentSequenceLength;
            }
            currentSequenceLength = 0;
          }
        }
        // After loop, check one last time in case the longest sequence was at the end.
        if (currentSequenceLength > maxSequenceLength) {
          maxSequenceLength = currentSequenceLength;
        }

        // Return the maximum length as a string in an array.
        return [String(maxSequenceLength)];
      };
    },

    /* Module 6: C - GeT AC */
    function (inputData, outputExports) {
      "use strict";
      // Mark this module as an ES module.
      Object.defineProperty(outputExports, "__esModule", { value: true });

      // Default export function for "C - GeT AC" problem.
      outputExports.default = function (inputLines) {
        // Parse the first line for N (length of string) and Q (number of queries).
        var parsedNumbers = inputLines[0].split(" ").map(function (valueStr) {
          return Number(valueStr);
        });
        // N and Q are parsed but not directly used in this snippet,
        // which implies they might be used for input validation or loop bounds in a full solution.
        // var N = parsedNumbers[0];
        // var Q = parsedNumbers[1];

        // The second line is the string S.
        var inputString = inputLines[1];

        // Create a prefix sum array for 'AC' occurrences.
        // `acPrefixSums[i]` will be true if `inputString[i]` is 'A' and `inputString[i+1]` is 'C'.
        var acPrefixSums = inputString.split("").map(function (charItem, charIndex, charArray) {
          return charItem === "A" && charArray.length > charIndex + 1 && charArray[charIndex + 1] === "C";
        });

        // The remaining lines are queries (L, R).
        var queryData = inputLines.slice(2).map(function (queryLine) {
          return queryLine.split(" ").map(function (valueStr) {
            return Number(valueStr);
          });
        });

        // For each query, calculate the number of 'AC' occurrences within the range [L-1, R-1].
        return queryData.map(function (queryPair) {
          var startIndex = queryPair[0];
          var endIndex = queryPair[1];
          var countAc = 0;

          // Iterate from L-1 to R-2 (inclusive) to check for 'AC' pairs.
          for (var loopIndex = startIndex - 1; loopIndex < endIndex - 1; loopIndex += 1) {
            if (acPrefixSums[loopIndex]) {
              countAc += 1;
            }
          }
          return String(countAc);
        });
      };
    },

    /* Module 7: Beginner Contest 126 Solutions */
    function (moduleRef, exportsObj, moduleResolver) {
      "use strict";
      // TypeScript __importDefault helper.
      var _defaultImporter =
        (this && this.__importDefault) ||
        function (importedModule) {
          return importedModule && importedModule.__esModule
            ? importedModule
            : { default: importedModule };
        };

      // Mark this module as an ES module.
      Object.defineProperty(exportsObj, "__esModule", { value: true });

      // Import specific problem solutions for Beginner Contest 126.
      var problemA = _defaultImporter(moduleResolver(8));
      var problemB = _defaultImporter(moduleResolver(9));

      // Export a default object containing solutions for Beginner Contest 126 problems.
      exportsObj.default = {
        a: problemA.default,
        b: problemB.default
      };
    },

    /* Module 8: A - Changing a Character */
    function (inputLines, outputExports) {
      "use strict";
      // Mark this module as an ES module.
      Object.defineProperty(outputExports, "__esModule", { value: true });

      // Default export function for "A - Changing a Character" problem.
      outputExports.default = function (inputData) {
        // Parse N (length of string) and K (index to change).
        var numericValues = inputData[0].split(" ").map(function (valueStr) {
          return Number(valueStr);
        });
        // var stringLength = numericValues[0]; // Not used directly
        var targetIndex = numericValues[1]; // K is 1-indexed

        // The second line is the string S.
        var inputString = inputData[1];

        // Convert the character at index K-1 to lowercase.
        var modifiedString = inputString
          .split("")
          .map(function (charVal, idx) {
            return idx === targetIndex - 1 ? charVal.toLowerCase() : charVal;
          })
          .join("");

        // Return the modified string in an array.
        return [modifiedString];
      };
    },

    /* Module 9: B - YYMM or MMYY */
    function (inputLines, outputExports) {
      "use strict";
      // Helper function to check if a number represents a valid month (1-12).
      function isValidMonth(monthValue) {
        return monthValue >= 1 && monthValue <= 12;
      }

      // Mark this module as an ES module.
      Object.defineProperty(outputExports, "__esModule", { value: true });

      // Default export function for "B - YYMM or MMYY" problem.
      outputExports.default = function (inputData) {
        // The input is a 4-digit string.
        var inputString = inputData[0];

        // Extract the first two digits and the last two digits.
        var firstPart = Number(inputString.slice(0, 2));
        var secondPart = Number(inputString.slice(2, 4));

        // Check if each part can be a valid month.
        var isFirstValid = isValidMonth(firstPart);
        var isSecondValid = isValidMonth(secondPart);

        // Determine the type of format based on validity.
        if (isFirstValid && isSecondValid) {
          return ["AMBIGUOUS"]; // Both YYMM and MMYY are possible.
        } else if (!isFirstValid && isSecondValid) {
          return ["YYMM"]; // Only YYMM is possible (first part is year, second is month).
        } else if (isFirstValid && !isSecondValid) {
          return ["MMYY"]; // Only MMYY is possible (first part is month, second is year).
        } else {
          return ["NA"]; // Neither format is valid.
        }
      };
    },

    /* Module 10: Diverta 2019 Programming Contest Solutions */
    function (moduleRef, exportsObj, dependencyLoader) {
      "use strict";
      // TypeScript __importDefault helper.
      var _defaultImporter =
        (this && this.__importDefault) ||
        function (importedModule) {
          return importedModule && importedModule.__esModule
            ? importedModule
            : { default: importedModule };
        };

      // Mark this module as an ES module.
      Object.defineProperty(exportsObj, "__esModule", { value: true });

      // Import specific problem solutions for Diverta 2019 Programming Contest.
      var problemC = _defaultImporter(dependencyLoader(11));
      var problemD = _defaultImporter(dependencyLoader(12));

      // Export a default object containing solutions for Diverta 2019 problems.
      exportsObj.default = {
        c: problemC.default,
        d: problemD.default
      };
    },

    /* Module 11: C - Successive Substrings */
    function (inputData, outputExports) {
      "use strict";
      // Mark this module as an ES module.
      Object.defineProperty(outputExports, "__esModule", { value: true });

      // Default export function for "C - Successive Substrings" problem.
      outputExports.default = function (inputLines) {
        // Parse N (number of strings).
        // var N = inputLines[0].split(" ").map(function (valueStr) { return Number(valueStr); })[0]; // Not used directly

        // Get the array of strings from input.
        var stringArray = inputLines.slice(1);

        var totalABCount = 0; // Total count of "AB" substrings.
        var endsInA = 0; // Count of strings ending with 'A'.
        var startsInB = 0; // Count of strings starting with 'B'.
        var startsBEndsA = 0; // Count of strings starting with 'B' and ending with 'A'.

        // Iterate through each string to collect statistics.
        stringArray.forEach(function (currentString, index) {
          if (currentString[0] === "B") {
            startsInB += 1;
          }
          if (currentString[currentString.length - 1] === "A") {
            endsInA += 1;
          }
          if (currentString[0] === "B" && currentString[currentString.length - 1] === "A") {
            startsBEndsA += 1;
          }
          // Count occurrences of "AB" using regex.
          totalABCount += (currentString.match(/AB/g) || []).length;
        });

        // Calculate the maximum number of "AB" pairs that can be formed.
        // If there are strings starting with B and ending with A, they can be chained.
        // The total count is `totalABCount` plus the number of chains that can be formed.
        // If all strings are of type "B...A", then we can form `startsBEndsA - 1` chains,
        // and then pair remaining 'A' endings and 'B' beginnings.
        if (endsInA - startsBEndsA === 0 && startsInB - startsBEndsA === 0) {
          // All strings are "B...A" type.
          // We can form (startsBEndsA - 1) additional "AB"s by chaining.
          return [String(totalABCount + startsBEndsA - 1)];
        } else {
          // General case: chain as many "A" endings with "B" beginnings as possible.
          // This is limited by the minimum of `endsInA` and `startsInB`.
          return [String(Math.min(endsInA, startsInB) + totalABCount)];
        }
      };
    },

    /* Module 12: D - Sum of Divisors (or similar) */
    function (inputData, outputExports) {
      "use strict";
      // Mark this module as an ES module.
      Object.defineProperty(outputExports, "__esModule", { value: true });

      // Default export function for "D - Factorial Divisors" problem (likely a different problem if it's about divisors).
      // The original name is 'D - Sum of Divisors'
      outputExports.default = function (inputLines) {
        // Parse N (the target number).
        var targetNumber = inputLines[0].split(" ").map(function (valueStr) {
          return Number(valueStr);
        })[0];

        var sumOfDivisors = 0;
        // Calculate the square root of N.
        var sqrtTarget = Math.sqrt(targetNumber);

        // Iterate from 1 up to sqrt(N) to find divisors.
        for (var currentDivisor = 1; currentDivisor < sqrtTarget; currentDivisor += 1) {
          // If currentDivisor is a divisor of targetNumber
          if (targetNumber % currentDivisor === 0) {
            // Calculate the other divisor (targetNumber / currentDivisor).
            var otherDivisor = (targetNumber - currentDivisor) / currentDivisor;
            // Check if (targetNumber - currentDivisor) is perfectly divisible by currentDivisor
            // and if the result is an integer. This is equivalent to checking if
            // targetNumber / currentDivisor is an integer and (targetNumber / currentDivisor) > 0.
            if (Number.isInteger(otherDivisor)) {
              sumOfDivisors += otherDivisor;
            }
          }
        }

        return [String(sumOfDivisors)];
      };
    },

    /* Module 13: Grand Contest 029 Solutions */
    function (moduleRef, exportsObj, dependencyLoader) {
      "use strict";
      // TypeScript __importDefault helper.
      var _defaultImporter =
        (this && this.__importDefault) ||
        function (importedModule) {
          return importedModule && importedModule.__esModule
            ? importedModule
            : { default: importedModule };
        };

      // Mark this module as an ES module.
      Object.defineProperty(exportsObj, "__esModule", { value: true });

      // Import specific problem solutions for Grand Contest 029.
      var irreversibleOp = _defaultImporter(dependencyLoader(14));
      var powerOfTwo = _defaultImporter(dependencyLoader(15));

      // Export a default object containing solutions for Grand Contest 029 problems.
      exportsObj.default = {
        AIrreversibleOperation: irreversibleOp.default,
        BPowerOfTwo: powerOfTwo.default
      };
    },

    /* Module 14: A - Irreversible Operation */
    function (inputData, outputExports) {
      "use strict";
      // Mark this module as an ES module.
      Object.defineProperty(outputExports, "__esModule", { value: true });

      // Constants for boolean values representing 'B' and 'W' states.
      var booleanTrue = true; // Represents 'B'
      var booleanFalse = false; // Represents 'W'

      // Recursive function to calculate the minimum moves for "A - Irreversible Operation".
      function calculateMinMoves(stateArray) {
        // Find all positions where 'B' is followed by 'W'.
        var flipPositions = ((currentArray) => {
          var positionsToFlip = [];
          for (var positionIndex = 0; positionIndex < currentArray.length - 1; positionIndex += 1) {
            if (currentArray[positionIndex] === booleanTrue && currentArray[positionIndex + 1] === booleanFalse) {
              positionsToFlip.push(positionIndex);
            }
          }
          return positionsToFlip;
        })(stateArray);

        // If no "BW" pairs are found, no more moves are possible.
        if (flipPositions.length === 0) {
          return 0;
        }

        // Recursively calculate moves for each possible flip.
        // Add 1 for the current flip, and then find the max moves from the resulting states.
        return (
          1 +
          Math.max.apply(
            Math,
            flipPositions.map(function (flipIndex) {
              return calculateMinMoves(
                ((originalArray, indexToFlip) => {
                  var copiedArray = originalArray.concat(); // Create a shallow copy.
                  // Flip the two elements.
                  copiedArray[indexToFlip] = !copiedArray[indexToFlip];
                  copiedArray[indexToFlip + 1] = !copiedArray[indexToFlip + 1];
                  return copiedArray;
                })(stateArray, flipIndex)
              );
            })
          )
        );
      }

      // Default export function.
      outputExports.default = function (inputLines) {
        // Convert the input string of 'B' and 'W' to a boolean array.
        // 'B' maps to true, 'W' maps to false.
        var initialBooleanState = inputLines[0].split("").map(function (charValue) {
          return charValue === "B";
        });

        // Calculate and return the minimum moves.
        return [calculateMinMoves(initialBooleanState)];
      };
    },

    /* Module 15: B - Power of Two */
    function (inputData, outputExports) {
      "use strict";
      // Helper function to check if the sum of two numbers is a power of two.
      function isPowerOfTwoSum(val1, val2) {
        var sumResult = val1 + val2;
        // A number is a power of two if it's positive and has only one bit set.
        // This can be checked by `(sumResult & (sumResult - 1)) === 0`.
        // It's also implicitly checking `sumResult > 0` because `0 & -1` is `0`.
        return sumResult > 0 && (sumResult & (sumResult - 1)) === 0;
      }

      // Recursive function to find the maximum length of a chain where
      // adjacent elements sum to a power of two.
      function findMaxPowerChain(numberList) {
        // Base case: if list has less than 2 elements, no pairs can be formed.
        if (numberList.length < 2) {
          return 0;
        }

        // Iterate through each number in the list as the first element of a pair.
        return Math.max.apply(
          Math,
          numberList.map(function (currentNum, currentIndex) {
            // Create a list of remaining numbers by excluding the current number.
            var remainingNumbers = numberList.filter(function (item, idx) {
              return idx !== currentIndex;
            });

            // For each remaining number, try to form a pair.
            return Math.max.apply(
              Math,
              remainingNumbers.map(function (nextNum, nextIndex) {
                // If currentNum + nextNum is a power of two.
                if (isPowerOfTwoSum(currentNum, nextNum)) {
                  // Recursively call with the remaining numbers after removing both currentNum and nextNum.
                  var listWithoutPair = remainingNumbers.filter(function (item, idx) {
                    return idx !== nextIndex;
                  });
                  return findMaxPowerChain(listWithoutPair) + 1; // Add 1 for the current pair.
                } else {
                  return 0; // No valid pair with these two.
                }
              })
            );
          })
        );
      }

      // Mark this module as an ES module.
      Object.defineProperty(outputExports, "__esModule", { value: true });

      // Default export function for "B - Power of Two" problem.
      outputExports.default = function (inputLines) {
        // Number of elements N (not used directly).
        // var N = Number(inputLines[0]);

        // Parse the list of numbers from the second line.
        var initialNumbers = inputLines[1].split(" ").map(function (valueStr) {
          return Number(valueStr);
        });

        // Separate numbers into odd and even lists.
        // This is an optimization because an odd + even number can never sum to a power of two (except 1+1=2, but 1 is odd).
        // Powers of two are always even (except 2^0=1).
        // An odd number + an odd number can sum to an even number (e.g., 1+1=2, 3+5=8).
        // An even number + an even number can sum to an even number (e.g., 2+2=4).
        // So, we can find chains independently within odds and evens.
        var categorizedNumbers = (numberList) => {
          var oddCollection = numberList.filter((num) => num % 2 === 1);
          var evenCollection = numberList.filter((num) => num % 2 === 0);
          return { odds: oddCollection, evens: evenCollection };
        })(initialNumbers);

        var oddNumbers = categorizedNumbers.odds;
        var evenNumbers = categorizedNumbers.evens;

        // Calculate the maximum chain length for odd numbers and even numbers separately, then sum them.
        return [findMaxPowerChain(oddNumbers) + findMaxPowerChain(evenNumbers)];
      };
    },

    /* Module 16: Interactive Sorting */
    function (moduleContext, exportedValues, dependencyResolver) {
      "use strict";
      // TypeScript __awaiter helper for async functions.
      var _asyncProcessor =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (error) {
                reject(error);
              }
            }
            function rejected(value) {
              try {
                step(generator.throw(value));
              } catch (error) {
                reject(error);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : new P(function (resolveChild) {
                    resolveChild(result.value);
                  }).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };
      // TypeScript __generator helper for async/await transformation.
      var _generatorHelper =
        (this && this.__generator) ||
        function (thisArg, body) {
          var _ = {
              label: 0,
              sent: function () {
                if (1 & _[0]) throw _[1];
                return _[1];
              },
              trys: [],
              ops: []
            },
            f,
            y,
            t,
            g;
          return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === "function" &&
              (g[Symbol.iterator] = function () {
                return this;
              }),
            g
          );
          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }
          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_)
              try {
                if (
                  ((f = 1),
                  y &&
                    (t =
                      op[0] & 2
                        ? y.return
                        : op[0]
                        ? y.throw || ((t = y.return) && t.call(y), 0)
                        : y.next) &&
                    !(t = t.call(y, op[1])).done)
                )
                  return t;
                if (((y = 0), t)) op = [op[0] & 2, t.value];
                switch (op[0]) {
                  case 0:
                  case 1:
                    t = op;
                    break;
                  case 4:
                    _.label++;
                    return { value: op[1], done: false };
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
                    if (
                      !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                      (op[0] === 6 || op[0] === 2)
                    ) {
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
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
                }
                op = body.call(thisArg, _);
              } catch (error) {
                op = [6, error];
                y = 0;
              } finally {
                f = t = 0;
              }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
          }
        };

      // Mark this module as an ES module.
      Object.defineProperty(exportedValues, "__esModule", { value: true });

      // Import input/output utilities.
      var inputOutputUtilities = dependencyResolver(0);

      // Async recursive merge sort function for interactive sorting.
      // It sorts an array of elements by asking an external judge for comparisons.
      function mergeSortRecursive(elementsArray) {
        return _asyncProcessor(this, void 0, void 0, function () {
          var leftHalf, rightHalf, sortedLeft, sortedRight, mergedResult, currentItem, _a;
          return _generatorHelper(this, function (generatorState) {
            switch (generatorState.label) {
              case 0:
                // Base case: if array has 0 or 1 element, it's already sorted.
                if (elementsArray.length === 1) {
                  return [2 /*return*/, elementsArray];
                }
                // Split the array into two halves.
                leftHalf = elementsArray.slice(0, Math.ceil(elementsArray.length / 2));
                rightHalf = elementsArray.slice(Math.ceil(elementsArray.length / 2));
                // Recursively sort the halves.
                return [4 /*yield*/, mergeSortRecursive(leftHalf)];
              case 1:
                sortedLeft = generatorState.sent();
                return [4 /*yield*/, mergeSortRecursive(rightHalf)];
              case 2:
                sortedRight = generatorState.sent();
                mergedResult = [];
                generatorState.label = 3;
              case 3:
                // Merge the two sorted halves.
                if (!(sortedLeft.length > 0 && sortedRight.length > 0)) return [3 /*break*/, 5];
                // Compare the first elements of each half using the external judge.
                return [4 /*yield*/, compareElements(sortedLeft[0], sortedRight[0])];
              case 4:
                currentItem = generatorState.sent() ? sortedLeft.shift() : sortedRight.shift();
                currentItem && mergedResult.push(currentItem);
                return [3 /*break*/, 3];
              case 5:
                // Add any remaining elements from either array.
                mergedResult.push.apply(mergedResult, sortedLeft.concat(sortedRight));
                return [2 /*return*/, mergedResult];
            }
          });
        });
      }

      // Async function to compare two elements using the external judge.
      // It prints a query and reads the response.
      function compareElements(elementX, elementY) {
        return _asyncProcessor(this, void 0, void 0, function () {
          var judgeResponse;
          return _generatorHelper(this, function (generatorState) {
            switch (generatorState.label) {
              case 0:
                // Print the query to standard output.
                console.log("? " + elementX + " " + elementY);
                // Await the response from standard input.
                return [4 /*yield*/, inputOutputUtilities.getAtcoderInput()];
              case 1:
                judgeResponse = generatorState.sent();
                // Return true if elementX is less than elementY.
                return [2 /*return*/, judgeResponse === "<"];
            }
          });
        });
      }

      // Default export function for "Interactive Sorting" problem.
      exportedValues.default = function (inputLines) {
        return _asyncProcessor(this, void 0, void 0, function () {
          var numericInput, arrayLength, charBaseCode, finalSortedArray;
          return _generatorHelper(this, function (generatorState) {
            switch (generatorState.label) {
              case 0:
                // Parse N (number of elements) from the first input line.
                numericInput = inputLines[0].split(" ").map(function (valueStr) {
                  return Number(valueStr);
                });
                arrayLength = numericInput[0];
                // The second number in the input array `numericInput[1]` is not used here.

                // Generate an initial array of characters 'A', 'B', 'C', ... up to N elements.
                charBaseCode = "A".charCodeAt(0);
                // `Array.apply(null, new Array(arrayLength))` creates an array of `undefined`s.
                // Then map it to generate characters.
                return [
                  4 /*yield*/,
                  mergeSortRecursive(
                    Array.apply(null, new Array(arrayLength)).map(function (item, index) {
                      return String.fromCharCode(charBaseCode + index);
                    })
                  )
                ];
              case 1:
                finalSortedArray = generatorState.sent();
                // Output the sorted array prefixed with "! ".
                return [2 /*return*/, ["! " + finalSortedArray.join("")]];
            }
          });
        });
      };
    },

    /* Module 17: Node.js 'fs' module */
    function (moduleRef, exportsObj) {
      // This module exports the Node.js 'fs' (file system) module.
      moduleRef.exports = require("node:fs");
    },

    /* Module 18: Node.js 'readline' module */
    function (moduleRef, exportsObj) {
      // This module exports the Node.js 'readline' module.
      moduleRef.exports = require("node:readline");
    },

    /* Module 19: Welcome to AtCoder */
    function (inputData, exportedFunctions, dependencyResolver) {
      "use strict";
      // Mark this module as an ES module.
      Object.defineProperty(exportedFunctions, "__esModule", { value: true });

      // Default export function for "Welcome to AtCoder" problem.
      exportedFunctions.default = function (inputLines) {
        // Parse the first number from the first line.
        var sumValue = Number(inputLines[0]);

        // Parse the two numbers from the second line.
        var numberArray = inputLines[1].split(" ").map(function (valString) {
          return Number(valString);
        });

        // Add the two numbers from the second line to the first number.
        sumValue += numberArray[0] + numberArray[1];

        // Combine the total sum with the third line of input as a string.
        return [sumValue + " " + inputLines[2]];
      };
    }
  ]
);