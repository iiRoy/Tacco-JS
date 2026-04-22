!function (e) {
    /**
     * @private
     * @type {Object.<number, Module>}
     * A cache for storing already loaded modules.
     * Keys are module IDs, and values are the module objects.
     */
    var t = {};

    /**
     * @private
     * @function n
     * The core module loading function (Webpack's require).
     * It attempts to retrieve a module from the cache; if not found,
     * it executes the module factory function and caches the result.
     *
     * @param {number} r - The unique identifier for the module to load.
     * @returns {Module.exports} The exports object of the requested module.
     */
    function n(r) {
        // If the module is already in the cache, return its exports immediately.
        if (t[r]) {
            return t[r].exports;
        }

        // If not in cache, create a new module object and store it.
        var u = t[r] = {
            i: r,          // module ID
            l: !1,         // 'loaded' flag, initially false
            exports: {}    // empty exports object to be populated
        };

        // Execute the module factory function.
        // `e[r]` holds the factory function for module `r`.
        // `call` is used to set `this` context to `u.exports` and pass
        // `module`, `exports`, and `require` (which is `n` itself) as arguments.
        e[r].call(u.exports, u, u.exports, n);

        // Mark the module as loaded after its execution.
        u.l = !0;

        // Return the populated exports object.
        return u.exports;
    }


    // Store the module factory array on `n.m` (modules).
    n.m = e;


    // Store the module cache on `n.c` (cache).
    n.c = t;


    /**
     * @public
     * @function n.d
     * Defines a getter function for an export property on an object.
     * This is typically used to expose properties from modules.
     *
     * @param {Object} e - The target object (usually `module.exports`).
     * @param {string} t - The name of the property to define.
     * @param {Function} r - The getter function that provides the property's value.
     */
    n.d = function (e, t, r) {
        // Only define the property if it doesn't already exist.
        if (!n.o(e, t)) {
            Object.defineProperty(e, t, {
                enumerable: !0, // Make the property enumerable.
                get: r          // Assign the provided getter function.
            });
        }
    };


    /**
     * @public
     * @function n.r
     * Marks an exports object as an ES module.
     * This adds `Symbol.toStringTag` and `__esModule` properties for compatibility.
     *
     * @param {Object} e - The exports object to mark as an ES module.
     */
    n.r = function (e) {
        // Set `Symbol.toStringTag` for better module identification in `Object.prototype.toString`.
        if ("undefined" != typeof Symbol && Symbol.toStringTag) {
            Object.defineProperty(e, Symbol.toStringTag, { value: "Module" });
        }

        // Add the `__esModule` flag, which is a common convention for ES modules.
        Object.defineProperty(e, "__esModule", { value: !0 });
    };


    /**
     * @public
     * @function n.t
     * Creates a namespace object for module exports, handling various module formats.
     * This function is crucial for interoperability between CommonJS and ES modules.
     *
     * @param {any} e - The module identifier or the module's exports.
     * @param {number} t - Flags indicating how to interpret and handle the module.
     * @returns {Object} A namespace object representing the module's exports.
     */
    n.t = function (e, t) {
        // Flag 1: If set, `e` is a module ID, so load it using `n()`.
        if (1 & t) {
            e = n(e);
        }

        // Flag 8: If set, `e` is already the raw exports object, so return it directly.
        if (8 & t) {
            return e;
        }

        // Flag 4: If set and `e` is an object and already an ES module, return it directly.
        if (4 & t && "object" == typeof e && e && e.__esModule) {
            return e;
        }

        // Create a new empty object to serve as the namespace.
        var r = Object.create(null);

        // Mark the new namespace object as an ES module.
        n.r(r);

        // Define a 'default' getter for the namespace, pointing to the original module's exports.
        Object.defineProperty(r, "default", { enumerable: !0, value: e });

        // Flag 2: If set and `e` is not a string, copy all its properties to the namespace.
        // This is for CommonJS modules that don't explicitly define a `default` export.
        if (2 & t && "string" != typeof e) {
            for (var u in e) {
                // Ensure the property is directly on `e` (not inherited) and define a getter for it.
                n.d(r, u, function (t_propName) {
                    return e[t_propName];
                }.bind(null, u)); // `bind` is used to capture `u` for the getter.
            }
        }

        return r;
    };


    /**
     * @public
     * @function n.n
     * Creates a getter function for a module's exports, handling `default` exports.
     * This ensures consistent access whether a module has a `default` export or not.
     *
     * @param {any} e - The module's exports object.
     * @returns {Function} A getter function that returns the module's default export
     *                     or the module itself if no `default` is explicitly defined.
     */
    n.n = function (e) {
        // Determine the getter function based on whether `e` is an ES module with a `default` export.
        var t = e && e.__esModule
            ? function () {
                return e.default;
            }
            : function () {
                return e;
            };

        // Attach this getter function as property 'a' on itself. (Webpack convention)
        n.d(t, "a", t);

        return t;
    };


    /**
     * @public
     * @function n.o
     * A utility function to check if an object has a specified property directly (not inherited).
     * It's a wrapper around `Object.prototype.hasOwnProperty.call`.
     *
     * @param {Object} e - The object to check.
     * @param {string} t - The name of the property to look for.
     * @returns {boolean} `true` if the object has the property, `false` otherwise.
     */
    n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t);
    };


    // Set the public path for assets (empty string in this case).
    n.p = "";


    // Start the application by loading the entry module (module ID 1).
    n(n.s = 1);

}(
    // The array of module factory functions.
    // Each index corresponds to a module ID.
    [
        /* Module 0: Input Handling Utilities */
        function (e, t, n) {
            "use strict";

            // TypeScript helper for `__importDefault`.
            // If a module has `__esModule` true, return it as is; otherwise, wrap it in `{ default: e }`.
            var r = this && this.__importDefault || function (e) {
                return e && e.__esModule ? e : { default: e };
            };

            // TypeScript helper for `__importStar`.
            // If a module has `__esModule` true, return it as is; otherwise, create a namespace object.
            var u = this && this.__importStar || function (e) {
                if (e && e.__esModule) {
                    return e;
                }
                var t = {}; // New namespace object.
                if (null != e) {
                    // Copy all enumerable properties from `e` to `t`.
                    for (var n_prop in e) {
                        if (Object.hasOwnProperty.call(e, n_prop)) {
                            t[n_prop] = e[n_prop];
                        }
                    }
                }
                t.default = e; // Set the default export to `e`.
                return t;
            };

            // Mark this module as an ES module.
            Object.defineProperty(t, "__esModule", { value: !0 });

            // Import the 'fs' (file system) module via `n(17)` and get its default export.
            var i = r(n(17));

            // Import the 'readline' module via `n(18)` and get all its exports as a namespace object.
            var o = u(n(18));

            /**
             * @function t.paizaInput
             * Provides input handling specific to the Paiza online judge environment.
             * It reads input line by line until the stream closes.
             *
             * @returns {Promise<string[]>} A Promise that resolves to an array of input lines.
             */
            t.paizaInput = function () {
                process.stdin.resume();            // Keep the process alive to read input.
                process.stdin.setEncoding("utf8"); // Set the input encoding.

                var e_lines = []; // Array to collect input lines.

                // Create a readline interface for line-by-line input.
                var t_interface = o.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                // Attach a 'line' event listener to push each line into the array.
                t_interface.on("line", function (t_currentLine) {
                    e_lines.push(t_currentLine);
                });

                // Return a Promise that resolves with the collected lines when the 'close' event occurs.
                return new Promise(function (n_resolve) {
                    t_interface.on("close", function () {
                        n_resolve(e_lines);
                    });
                });
            };

            /**
             * @function t.hackerRankInput
             * Provides input handling specific to the HackerRank online judge environment.
             * It reads all input data as a single string and then splits it by newlines.
             *
             * @returns {Promise<string[]>} A Promise that resolves to an array of input lines.
             */
            t.hackerRankInput = function () {
                process.stdin.resume();           // Keep the process alive.
                process.stdin.setEncoding("ascii"); // Set input encoding (often 'ascii' on HackerRank).

                var e_allData = ""; // Accumulator for all incoming data.

                // Attach a 'data' event listener to append chunks to `e_allData`.
                process.stdin.on("data", function (t_chunk) {
                    e_allData += t_chunk;
                });

                // Return a Promise that resolves with the split data when the 'end' event occurs.
                return new Promise(function (t_resolve) {
                    process.stdin.on("end", function () {
                        t_resolve(e_allData.split("\n"));
                    });
                });
            };

            /**
             * @function t.atcoderInput
             * Provides input handling specific to the AtCoder online judge environment.
             * It synchronously reads the entire content from `/dev/stdin`.
             *
             * @returns {string} The entire input content as a single string.
             */
            t.atcoderInput = function () {
                return i.default.readFileSync("/dev/stdin", "utf8");
            };

        },

        /* Module 1: Main Application Entry Point */
        function (e, t, n) {
            "use strict";

            // TypeScript `__awaiter` helper function for `async`/`await` compilation.
            var r = this && this.__awaiter || function (e, t, n_promiseConstructor, r_generatorFunction) {
                return new (n_promiseConstructor || (n_promiseConstructor = Promise))(function (u_resolve, i_reject) {
                    function o_step(e_result) {
                        try {
                            c_next(r_generatorFunction.next(e_result));
                        } catch (e_error) {
                            i_reject(e_error);
                        }
                    }
                    function a_step(e_result) {
                        try {
                            c_next(r_generatorFunction.throw(e_result));
                        } catch (e_error) {
                            i_reject(e_error);
                        }
                    }
                    function c_next(e_asyncIteratorResult) {
                        e_asyncIteratorResult.done
                            ? u_resolve(e_asyncIteratorResult.value)
                            : new n_promiseConstructor(function (t_promiseResolve) {
                                t_promiseResolve(e_asyncIteratorResult.value);
                            }).then(o_step, a_step);
                    }
                    c_next((r_generatorFunction = r_generatorFunction.apply(e, t || [])).next());
                });
            };

            // TypeScript `__generator` helper function for `async`/`await` and generator compilation.
            var u = this && this.__generator || function (e, t) {
                var n_internalState, r_iterator, u_currentOp, i_currentValue, o_state = {
                    label: 0,
                    sent: function () {
                        if (1 & u_currentOp[0]) {
                            throw u_currentOp[1];
                        }
                        return u_currentOp[1];
                    },
                    trys: [],
                    ops: []
                };
                i_currentValue = { next: a_createStepFunction(0), throw: a_createStepFunction(1), return: a_createStepFunction(2) };
                if ("function" == typeof Symbol && (i_currentValue[Symbol.iterator] = function () { return this; }), i_currentValue) {
                    // This empty block is from the original minified code, preserving exact structure.
                }

                function a_createStepFunction(i_opCode) {
                    return function (a_arg) {
                        return function (i_opCode_inner) {
                            if (n_internalState) {
                                throw new TypeError("Generator is already executing.");
                            }
                            for (; o_state;) {
                                try {
                                    if (n_internalState = 1, r_iterator && (u_currentOp = 2 & i_opCode_inner[0] ? r_iterator.return : i_opCode_inner[0] ? r_iterator.throw || ((u_currentOp = r_iterator.return) && u_currentOp.call(r_iterator), 0) : r_iterator.next) && !(u_currentOp = u_currentOp.call(r_iterator, i_opCode_inner[1])).done) {
                                        return u_currentOp;
                                    }
                                    r_iterator = 0;
                                    u_currentOp && (i_opCode_inner = [2 & i_opCode_inner[0], u_currentOp.value]);
                                    switch (i_opCode_inner[0]) {
                                        case 0: case 1:
                                            u_currentOp = i_opCode_inner;
                                            break;
                                        case 4:
                                            o_state.label++;
                                            return { value: i_opCode_inner[1], done: !1 };
                                        case 5:
                                            o_state.label++;
                                            r_iterator = i_opCode_inner[1];
                                            i_opCode_inner = [0];
                                            continue;
                                        case 7:
                                            i_opCode_inner = o_state.ops.pop();
                                            o_state.trys.pop();
                                            continue;
                                        default:
                                            if (!(u_currentOp = (u_currentOp = o_state.trys).length > 0 && u_currentOp[u_currentOp.length - 1]) && (6 === i_opCode_inner[0] || 2 === i_opCode_inner[0])) {
                                                o_state = 0;
                                                continue;
                                            }
                                            if (3 === i_opCode_inner[0] && (!u_currentOp || i_opCode_inner[1] > u_currentOp[0] && i_opCode_inner[1] < u_currentOp[3])) {
                                                o_state.label = i_opCode_inner[1];
                                                break;
                                            }
                                            if (6 === i_opCode_inner[0] && o_state.label < u_currentOp[1]) {
                                                o_state.label = u_currentOp[1];
                                                u_currentOp = i_opCode_inner;
                                                break;
                                            }
                                            if (u_currentOp && o_state.label < u_currentOp[2]) {
                                                o_state.label = u_currentOp[2];
                                                o_state.ops.push(i_opCode_inner);
                                                break;
                                            }
                                            u_currentOp[2] && o_state.ops.pop();
                                            o_state.trys.pop();
                                            continue;
                                    }
                                    i_opCode_inner = t.call(e, o_state);
                                } catch (e_error) {
                                    i_opCode_inner = [6, e_error];
                                    r_iterator = 0;
                                } finally {
                                    n_internalState = u_currentOp = 0;
                                }
                            }
                            if (5 & i_opCode_inner[0]) {
                                throw i_opCode_inner[1];
                            }
                            return { value: i_opCode_inner[0] ? i_opCode_inner[1] : void 0, done: !0 };
                        }([i_opCode_inner, a_arg]);
                    };
                }
            };

            // TypeScript `__importDefault` helper function (potentially redundant here but present).
            var i = this && this.__importDefault || function (e) {
                return e && e.__esModule ? e : { default: e };
            };

            // Mark this module as an ES module.
            Object.defineProperty(t, "__esModule", { value: !0 });

            // Import the default export from module 2 (likely the main contest solutions object).
            var o = i(n(2));

            // Import all exports from module 0 (input handling utilities).
            var a = n(0);

            // Immediately Invoked Async Function Expression (IIAFE) for the main application logic.
            !function () {
                r(this, void 0, void 0, function () {
                    var e_input; // Variable to hold the input data.
                    return u(this, function (t_state) {
                        switch (t_state.label) {
                            case 0:
                                // Wait for input from `a.paizaInput()`.
                                return [4, a.paizaInput()];
                            case 1:
                                e_input = t_state.sent(); // Assign the resolved input to `e_input`.
                                // Call the specific solution function for 'beginner_contest_126.b'
                                // with the input, then iterate and log each result.
                                o.default.beginner_contest_126.b(e_input).forEach(function (e_outputLine) {
                                    return console.log(e_outputLine);
                                });
                                return [2]; // Signal the end of the async function.
                        }
                    });
                });
            }();

        },

        /* Module 2: Contest Solutions Collection */
        function (e, t, n) {
            "use strict";

            // TypeScript `__importDefault` helper.
            var r = this && this.__importDefault || function (e) {
                return e && e.__esModule ? e : { default: e };
            };

            Object.defineProperty(t, "__esModule", { value: !0 });

            // Import various contest solution modules using `n()` and `__importDefault`.
            var u = r(n(3));  // Solutions for beginner_contest_122.
            var i = r(n(7));  // Solutions for beginner_contest_126.
            var o = r(n(10)); // Solutions for Diverta2019ProgrammingContest.
            var a = r(n(13)); // Solutions for GrandContest029.
            var c = r(n(16)); // Solutions for interactiveSorting.
            var l = r(n(19)); // Solutions for welcomeToAtCoder.

            /**
             * @public
             * @constant {Object} t.default
             * Exports an object containing collections of solutions for various programming contests.
             * Each key represents a contest, and its value is another object containing problem solutions.
             */
            t.default = {
                beginner_contest_122: u.default,
                beginner_contest_126: i.default,
                Diverta2019ProgrammingContest: o.default,
                GrandContest029: a.default,
                interactiveSorting: c.default,
                welcomeToAtCoder: l.default
            };

        },

        /* Module 3: beginner_contest_122 Solutions */
        function (e, t, n) {
            "use strict";

            // TypeScript `__importDefault` helper.
            var r = this && this.__importDefault || function (e) {
                return e && e.__esModule ? e : { default: e };
            };

            Object.defineProperty(t, "__esModule", { value: !0 });

            // Import individual problem solutions for beginner_contest_122.
            var u = r(n(4)); // Solution for A_DoubleHelix.
            var i = r(n(5)); // Solution for B_ATCoder.
            var o = r(n(6)); // Solution for C_GeT_AC.

            /**
             * @public
             * @constant {Object} t.default
             * Exports an object containing solutions for problems within 'beginner_contest_122'.
             */
            t.default = {
                A_DoubleHelix: u.default,
                B_ATCoder: i.default,
                C_GeT_AC: o.default
            };

        },

        /* Module 4: A - Double Helix Solution */
        function (e, t, n) {
            "use strict";

            Object.defineProperty(t, "__esModule", { value: !0 });

            /**
             * @public
             * @function t.default
             * Solves the "A - Double Helix" problem.
             * Given a single DNA base character, it returns its complementary base.
             *
             * @param {string[]} e - An array where the first element `e[0]` is the input base character.
             * @returns {string[]} An array containing the complementary base as a string.
             * @throws {Error} If the input character is not a valid DNA base (A, T, C, G).
             */
            t.default = function (e) {
                switch (e[0]) {
                    case "A":
                        return ["T"];
                    case "T":
                        return ["A"];
                    case "C":
                        return ["G"];
                    case "G":
                        return ["C"];
                    default:
                        throw new Error("invalid string");
                }
            };

        },

        /* Module 5: B - ATCoder Solution */
        function (e, t, n) {
            "use strict";

            /**
             * @private
             * @function r
             * Checks if a given character is one of the valid DNA bases (Adenine, Thymine, Cytosine, Guanine).
             *
             * @param {string} e - The character to be validated.
             * @returns {boolean} `true` if the character is 'A', 'T', 'C', or 'G'; `false` otherwise.
             */
            function r(e) {
                return "A" === e || "T" === e || "C" === e || "G" === e;
            }

            Object.defineProperty(t, "__esModule", { value: !0 });

            /**
             * @public
             * @function t.default
             * Solves the "B - ATCoder" problem.
             * Finds the length of the longest contiguous subsequence composed only of 'A', 'T', 'C', 'G' characters.
             *
             * @param {string[]} e - An array where the first element `e[0]` is the input string.
             * @returns {string[]} An array containing a single string: the maximum length found.
             */
            t.default = function (e) {
                var t_inputString = e[0];
                var n_maxLength = 0;
                var u_currentPosition = 0;
                var i_currentLength = 0;

                // Iterate through each character of the input string.
                for (; u_currentPosition < t_inputString.length; u_currentPosition += 1) {
                    if (r(t_inputString[u_currentPosition])) {
                        // If the character is a valid base, increment the current sequence length.
                        i_currentLength += 1;
                    } else {
                        // If not a valid base, the current sequence is broken.
                        // Update `n_maxLength` if `i_currentLength` is greater.
                        if (i_currentLength > n_maxLength) {
                            n_maxLength = i_currentLength;
                        }
                        i_currentLength = 0; // Reset current length for the next sequence.
                    }
                }

                // After the loop, check one last time, in case the longest sequence was at the end of the string.
                if (i_currentLength > n_maxLength) {
                    n_maxLength = i_currentLength;
                }

                return [String(n_maxLength)];
            };

        },

        /* Module 6: C - GeT AC Solution */
        function (e, t, n) {
            "use strict";

            Object.defineProperty(t, "__esModule", { value: !0 });

            /**
             * @public
             * @function t.default
             * Solves the "C - GeT AC" problem.
             * This function counts occurrences of the "AC" substring within specified ranges
             * for multiple queries on a given input string.
             *
             * @param {string[]} e - Input array:
             *   `e[0]`: A string containing two space-separated integers "N Q".
             *   `e[1]`: The main string `S` to analyze.
             *   `e[2...]`: Subsequent lines, each containing two space-separated integers "l r" for queries.
             * @returns {string[]} An array of strings, where each string is the count of "AC" for a query.
             */
            t.default = function (e) {
                // Parse N (length of S) and Q (number of queries) from the first line.
                // N (t_parsed[0]) and Q (t_parsed[1]) are extracted but not explicitly used later.
                var t_parsed = e[0].split(" ").map(function (e_numStr) {
                    return Number(e_numStr);
                });

                var n_sourceString = e[1]; // The string S.

                // Parse the query ranges (l, r) from the remaining lines.
                var r_queryRanges = e.slice(2).map(function (e_queryLine) {
                    return e_queryLine.split(" ").map(function (e_queryNumStr) {
                        return Number(e_queryNumStr);
                    });
                });

                // Precompute a boolean array `u_isAC` where `u_isAC[i]` is true if `n_sourceString[i]` is 'A'
                // and `n_sourceString[i+1]` is 'C'. This allows for O(1) lookup per character.
                var u_isAC = n_sourceString.split("").map(function (e_char, t_index, n_array) {
                    return "A" === e_char && n_array.length > t_index + 1 && "C" === n_array[t_index + 1];
                });

                // Process each query.
                return r_queryRanges.map(function (e_query) {
                    var t_startIndex = e_query[0]; // 1-based start index.
                    var n_endIndex = e_query[1];     // 1-based end index.
                    var r_acCount = 0;             // Counter for "AC" occurrences within the query range.

                    // Iterate through the string from `t_startIndex - 1` (0-based) up to
                    // `n_endIndex - 1 - 1` (because 'AC' takes two characters, and the 'C' must be within the range).
                    for (var i_current = t_startIndex - 1; i_current < n_endIndex - 1; i_current += 1) {
                        if (u_isAC[i_current]) {
                            r_acCount += 1;
                        }
                    }
                    return String(r_acCount);
                });
            };

        },

        /* Module 7: beginner_contest_126 Solutions */
        function (e, t, n) {
            "use strict";

            // TypeScript `__importDefault` helper.
            var r = this && this.__importDefault || function (e) {
                return e && e.__esModule ? e : { default: e };
            };

            Object.defineProperty(t, "__esModule", { value: !0 });

            // Import individual problem solutions for beginner_contest_126.
            var u = r(n(8)); // Solution for problem 'a'.
            var i = r(n(9)); // Solution for problem 'b'.

            /**
             * @public
             * @constant {Object} t.default
             * Exports an object containing solutions for problems within 'beginner_contest_126'.
             */
            t.default = {
                a: u.default,
                b: i.default
            };

        },

        /* Module 8: A - Changing a Character Solution */
        function (e, t, n) {
            "use strict";

            Object.defineProperty(t, "__esModule", { value: !0 });

            /**
             * @public
             * @function t.default
             * Solves the "A - Changing a Character" problem.
             * Given a string and an index, it converts the character at that index to lowercase.
             *
             * @param {string[]} e - Input array:
             *   `e[0]`: A string "N K", where N is string length (unused) and K is the 1-based index to change.
             *   `e[1]`: The input string `S`.
             * @returns {string[]} An array containing the modified string.
             */
            t.default = function (e) {
                // Parse N (length) and K (index) from the first line.
                // We only need K (n_indexToChange).
                var t_params = e[0].split(" ").map(function (e_numStr) {
                    return Number(e_numStr);
                });

                var n_indexToChange = t_params[1]; // K is the second number.

                // Convert the input string to an array of characters,
                // modify the character at `n_indexToChange - 1` (to account for 0-based indexing),
                // then join them back into a string.
                return [
                    e[1].split("").map(function (e_char, t_currentIndex) {
                        return t_currentIndex === n_indexToChange - 1 ? e_char.toLowerCase() : e_char;
                    }).join("")
                ];
            };

        },

        /* Module 9: B - YYMM or MMYY Solution */
        function (e, t, n) {
            "use strict";

            /**
             * @private
             * @function r
             * Checks if a given number represents a valid month (1 through 12).
             *
             * @param {number} e - The number to check.
             * @returns {boolean} `true` if `e` is between 1 and 12 (inclusive), `false` otherwise.
             */
            function r(e) {
                return 1 <= e && e <= 12;
            }

            Object.defineProperty(t, "__esModule", { value: !0 });

            /**
             * @public
             * @function t.default
             * Solves the "B - YYMM or MMYY" problem.
             * Given a 4-digit string, determines if it can be interpreted as YYMM, MMYY, both (AMBIGUOUS), or neither (NA).
             *
             * @param {string[]} e - An array where the first element `e[0]` is the 4-digit input string.
             * @returns {string[]} An array containing a single string: "AMBIGUOUS", "YYMM", "MMYY", or "NA".
             */
            t.default = function (e) {
                var t_inputString = e[0];

                // Extract the first two digits and convert to number.
                var n_firstTwo = Number(t_inputString.slice(0, 2));
                // Extract the last two digits and convert to number.
                var u_lastTwo = Number(t_inputString.slice(2, 4));

                // Check if the first two digits form a valid month.
                var i_isFirstMonth = r(n_firstTwo);
                // Check if the last two digits form a valid month.
                var o_isLastMonth = r(u_lastTwo);

                // Determine the interpretation based on month validity.
                if (i_isFirstMonth && o_isLastMonth) {
                    return ["AMBIGUOUS"]; // Both YYMM and MMYY are valid.
                } else if (!i_isFirstMonth && o_isLastMonth) {
                    return ["YYMM"];      // Only YYMM is valid (first part is year, second is month).
                } else if (i_isFirstMonth && !o_isLastMonth) {
                    return ["MMYY"];      // Only MMYY is valid (first part is month, second is year).
                } else {
                    return ["NA"];        // Neither interpretation is valid.
                }
            };

        },

        /* Module 10: Diverta2019ProgrammingContest Solutions */
        function (e, t, n) {
            "use strict";

            // TypeScript `__importDefault` helper.
            var r = this && this.__importDefault || function (e) {
                return e && e.__esModule ? e : { default: e };
            };

            Object.defineProperty(t, "__esModule", { value: !0 });

            // Import individual problem solutions for Diverta2019ProgrammingContest.
            var u = r(n(11)); // Solution for problem 'c'.
            var i = r(n(12)); // Solution for problem 'd'.

            /**
             * @public
             * @constant {Object} t.default
             * Exports an object containing solutions for problems within 'Diverta2019ProgrammingContest'.
             */
            t.default = {
                c: u.default,
                d: i.default
            };

        },

        /* Module 11: C - AB Substrings Solution */
        function (e, t, n) {
            "use strict";

            Object.defineProperty(t, "__esModule", { value: !0 });

            /**
             * @public
             * @function t.default
             * Solves the "C - AB Substrings" problem.
             * Counts the maximum number of "AB" substrings that can be formed by concatenating
             * a given list of strings.
             *
             * @param {string[]} e - Input array:
             *   `e[0]`: A string containing the number of strings `N` (unused after parsing).
             *   `e[1...]`: `N` lines, each containing an input string.
             * @returns {string[]} An array containing a single string: the maximum count of "AB".
             */
            t.default = function (e) {
                // Parse N from the first line. It's read but not stored in a named variable for later use.
                e[0].split(" ").map(function (e_numStr) { return Number(e_numStr); })[0];

                var t_inputStrings = e.slice(1); // The array of strings to analyze.
                var n_internalABCount = 0;       // Counts "AB" pairs already existing within individual strings.
                var r_endsInA = 0;               // Counts strings ending with 'A'.
                var u_startsInB = 0;             // Counts strings starting with 'B'.
                var i_startsB_endsA = 0;         // Counts strings that both start with 'B' and end with 'A'.

                t_inputStrings.forEach(function (e_currentString, t_idx) {
                    if ("B" === e_currentString[0]) {
                        u_startsInB += 1;
                    }
                    if ("A" === e_currentString[e_currentString.length - 1]) {
                        r_endsInA += 1;
                    }
                    if ("B" === e_currentString[0] && "A" === e_currentString[e_currentString.length - 1]) {
                        i_startsB_endsA += 1;
                    }

                    // Count "AB" substrings within the current string using a regex match.
                    n_internalABCount += (e_currentString.match(/AB/g) || []).length;
                });

                // Logic to calculate additional "AB" pairs formed by concatenation:
                // Special case: If all strings that end with 'A' also start with 'B',
                // AND all strings that start with 'B' also end with 'A',
                // then all such strings are of the form B...A.
                // In this scenario, when concatenating `k` such strings, you form `k-1` new "AB" pairs.
                if (r_endsInA - i_startsB_endsA == 0 && u_startsInB - i_startsB_endsA == 0) {
                    // This condition implies all `r_endsInA` (and `u_startsInB`) strings are of type B...A.
                    // The total count is initial ABs plus the number of new links, which is `i_startsB_endsA - 1`
                    // (if `i_startsB_endsA` is at least 1, otherwise it should be 0).
                    // The original code implies `i_startsB_endsA` is at least 1 when this branch is taken.
                    return [String(n_internalABCount + i_startsB_endsA - 1)];
                } else {
                    // General case: Count the maximum number of times an 'A'-ending string can be followed
                    // by a 'B'-starting string. This is limited by the minimum of `r_endsInA` and `u_startsInB`.
                    return [String(r_endsInA < u_startsInB ? r_endsInA + n_internalABCount : u_startsInB + n_internalABCount)];
                }
            };

        },

        /* Module 12: D - Divisor Summation (or similar) Solution */
        function (e, t, n) {
            "use strict";

            Object.defineProperty(t, "__esModule", { value: !0 });

            /**
             * @public
             * @function t.default
             * Solves a problem likely related to divisor sums or counting pairs.
             * Specifically, it calculates `sum(N/i - 1)` for all divisors `i` of `N` where `i < sqrt(N)`.
             *
             * @param {string[]} e - Input array where the first element `e[0]` is the number `N`.
             * @returns {string[]} An array containing a single string: the calculated sum.
             */
            t.default = function (e) {
                // Parse the input number `N`.
                var t_targetNumber = e[0].split(" ").map(function (e_numStr) {
                    return Number(e_numStr);
                })[0];

                var n_accumulatedSum = 0; // Accumulator for the sum.

                // Calculate the square root of `t_targetNumber`.
                var r_sqrtOfTarget = Math.sqrt(t_targetNumber);

                // Iterate from 1 up to (but not including) the square root of `t_targetNumber`.
                for (var u_currentDivisor = 1; u_currentDivisor < r_sqrtOfTarget; u_currentDivisor += 1) {
                    // Calculate `(N - u_currentDivisor) / u_currentDivisor`, which simplifies to `N/u_currentDivisor - 1`.
                    // This term is only added if `u_currentDivisor` is indeed a divisor of `N`.
                    var i_complementaryTerm = (t_targetNumber - u_currentDivisor) / u_currentDivisor;

                    // Check if `i_complementaryTerm` is an integer. This implies `t_targetNumber` is perfectly divisible by `u_currentDivisor`.
                    if (Number.isInteger(i_complementaryTerm)) {
                        n_accumulatedSum += i_complementaryTerm;
                    }
                }

                return [String(n_accumulatedSum)];
            };

        },

        /* Module 13: GrandContest029 Solutions */
        function (e, t, n) {
            "use strict";

            // TypeScript `__importDefault` helper.
            var r = this && this.__importDefault || function (e) {
                return e && e.__esModule ? e : { default: e };
            };

            Object.defineProperty(t, "__esModule", { value: !0 });

            // Import individual problem solutions for GrandContest029.
            var u = r(n(14)); // Solution for A_IrreversibleOperation.
            var i = r(n(15)); // Solution for B_PowerOfTwo.

            /**
             * @public
             * @constant {Object} t.default
             * Exports an object containing solutions for problems within 'GrandContest029'.
             */
            t.default = {
                AIrreversibleOperation: u.default,
                BPowerOfTwo: i.default
            };

        },

        /* Module 14: A - Irreversible Operation Solution */
        function (e, t, n) {
            "use strict";

            Object.defineProperty(t, "__esModule", { value: !0 });

            // Explicit boolean constants, possibly for minification or clarity in original source.
            var r_TRUE = !0;
            var u_FALSE = !1;

            /**
             * @private
             * @function i
             * Recursively calculates the minimum number of "irreversible operations"
             * to sort an array of booleans (representing 'B' and 'W'). An operation
             * involves swapping an adjacent 'B' followed by 'W'.
             *
             * @param {boolean[]} e - The current state of the array, where `true` represents 'B' and `false` represents 'W'.
             * @returns {number} The minimum number of operations required to sort the array.
             */
            function i(e) {
                // Find all indices where a 'B' (true) is immediately followed by a 'W' (false).
                var t_bwIndices = function (e_arr) {
                    var t_indices = [];
                    for (var n_idx = 0; n_idx < e_arr.length - 1; n_idx += 1) {
                        if (e_arr[n_idx] === r_TRUE && e_arr[n_idx + 1] === u_FALSE) {
                            t_indices.push(n_idx);
                        }
                    }
                    return t_indices;
                }(e);

                // Base case: If no "BW" pairs exist, the array is sorted, so 0 operations are needed.
                if (0 === t_bwIndices.length) {
                    return 0;
                }

                // Recursive step: For each "BW" pair, perform the swap, and add 1 operation to the recursive call's result.
                // Take the maximum of these results, as we are looking for the total "irreversible operations"
                // which might be thought of as the sum of all inversions, or a path in a state space.
                return 1 + Math.max.apply(Math, t_bwIndices.map(function (t_swapIndex) {
                    // Create a new array state where the 'B' and 'W' at `t_swapIndex` and `t_swapIndex + 1` are flipped.
                    return i(function (e_originalArr, t_idx) {
                        var n_clonedArr = e_originalArr.concat(); // Create a shallow copy.
                        n_clonedArr[t_idx] = !n_clonedArr[t_idx];
                        n_clonedArr[t_idx + 1] = !n_clonedArr[t_idx + 1];
                        return n_clonedArr;
                    }(e, t_swapIndex));
                }));
            }

            /**
             * @public
             * @function t.default
             * Solves the "A - Irreversible operation" problem.
             * Takes a string of 'B's and 'W's, converts it to a boolean array,
             * and then calculates the minimum number of operations to sort it.
             *
             * @param {string[]} e - An array where the first element `e[0]` is the input string.
             * @returns {string[]} An array containing a single string: the minimum operation count.
             */
            t.default = function (e) {
                // Convert the input string into a boolean array: 'B' maps to `true`, 'W' maps to `false`.
                var e_booleanArray = e[0].split("").map(function (e_char) {
                    return "B" === e_char;
                });
                return [i(e_booleanArray)];
            };

        },

        /* Module 15: B - Power of Two Solution */
        function (e, t, n) {
            "use strict";

            /**
             * @private
             * @function r
             * Recursively finds the maximum number of pairs that sum to a power of two
             * from a given array of numbers. Each number can be used in at most one pair.
             * This function uses a brute-force recursive approach trying all possible pairings.
             *
             * @param {number[]} e - The array of numbers from which to form pairs.
             * @returns {number} The maximum number of pairs that sum to a power of two.
             */
            function r(e) {
                // Base case: If there are fewer than two numbers, no pairs can be formed.
                if (e.length < 2) {
                    return 0;
                }

                // Iterate through each number `t_currentNum` in the array.
                return Math.max.apply(Math, e.map(function (t_currentNum, n_currentIndex) {
                    // Create a sub-array excluding `t_currentNum`.
                    var u_remainingNumbers = e.filter(function (e_num, t_idx) {
                        return t_idx !== n_currentIndex;
                    });

                    // For each `u_otherNum` in `u_remainingNumbers`, try to form a pair with `t_currentNum`.
                    return Math.max.apply(Math, u_remainingNumbers.map(function (e_otherNum, n_otherIndex) {
                        /**
                         * @private
                         * @function checkPowerOfTwo
                         * Checks if the sum of two numbers is a power of two.
                         * A number `x` is a power of two if `x > 0` and `(x & (x - 1)) === 0`.
                         *
                         * @param {number} e_a - The first number.
                         * @param {number} t_b - The second number.
                         * @returns {boolean} `true` if their sum is a positive power of two, `false` otherwise.
                         */
                        function checkPowerOfTwo(e_a, t_b) {
                            var n_sum = e_a + t_b;
                            return n_sum > 0 && (n_sum & (n_sum - 1)) === 0;
                        }

                        // If `t_currentNum` and `e_otherNum` sum to a power of two:
                        if (checkPowerOfTwo(t_currentNum, e_otherNum)) {
                            // Recursively find pairs in the remaining numbers (excluding both `t_currentNum` and `e_otherNum`).
                            var i_filteredForRecursion = u_remainingNumbers.filter(function (e_num, t_idx) {
                                return t_idx !== n_otherIndex;
                            });
                            return r(i_filteredForRecursion) + 1; // Add 1 for the current valid pair.
                        } else {
                            return 0; // This specific pair does not sum to a power of two.
                        }
                    }));
                }));
            }

            Object.defineProperty(t, "__esModule", { value: !0 });

            /**
             * @public
             * @function t.default
             * Solves the "B - Power of Two" problem.
             * Given an array of numbers, it finds the maximum number of pairs (x, y)
             * such that their sum (x + y) is a power of two. Each number can be used only once.
             *
             * @param {string[]} e - Input array:
             *   `e[0]`: A string containing `N` (the number of elements, unused after parsing).
             *   `e[1]`: A space-separated string of `N` numbers.
             * @returns {string[]} An array containing a single string: the maximum pair count.
             */
            t.default = function (e) {
                // Parse `N` from the first line (read but not used later).
                Number(e[0]);

                // Parse the array of numbers from the second line.
                var t_numbersArray = e[1].split(" ").map(function (e_numStr) {
                    return Number(e_numStr);
                });

                // Categorize numbers into odds and evens.
                // This separation is a common optimization/strategy for problems involving parity.
                var n_categorizedNumbers = function (e_arr) {
                    var t_odds = e_arr.filter(function (e_val) {
                        return e_val % 2 == 1;
                    });
                    var n_evens = e_arr.filter(function (e_val) {
                        return e_val % 2 == 0;
                    });
                    return { odds: t_odds, evens: n_evens };
                }(t_numbersArray);

                var u_oddNumbers = n_categorizedNumbers.odds;
                var i_evenNumbers = n_categorizedNumbers.evens;

                // The sum of two numbers can be a power of two:
                // - If sum is 1 (2^0): one odd, one even.
                // - If sum is 2^k (k >= 1, so sum is even): either two odds or two evens.
                // This solution implies that pairs are only formed within the odd group or within the even group,
                // effectively handling the k>=1 case. If 2^0=1 is a target, it's not handled by this separation.
                // However, given problem constraints, usually numbers are positive, so 0 is not present,
                // and 1 (2^0) would require (0,1), which is odd+even.
                // The structure of the code suggests that `r(u_oddNumbers)` and `r(i_evenNumbers)` independently
                // find pairs whose sum is an *even* power of two (or 1 if 0 is allowed and paired with 1).
                // Assuming numbers are positive, the smallest power of 2 from (odd+odd) or (even+even) is 2.
                return [String(r(u_oddNumbers) + r(i_evenNumbers))];
            };

        },

        /* Module 16: Interactive Sorting Solution */
        function (e, t, n) {
            "use strict";

            // TypeScript `__awaiter` helper.
            var r = this && this.__awaiter || function (e, t, n_promiseConstructor, r_generatorFunction) {
                return new (n_promiseConstructor || (n_promiseConstructor = Promise))(function (u_resolve, i_reject) {
                    function o_step(e_result) {
                        try {
                            c_next(r_generatorFunction.next(e_result));
                        } catch (e_error) {
                            i_reject(e_error);
                        }
                    }
                    function a_step(e_result) {
                        try {
                            c_next(r_generatorFunction.throw(e_result));
                        } catch (e_error) {
                            i_reject(e_error);
                        }
                    }
                    function c_next(e_asyncIteratorResult) {
                        e_asyncIteratorResult.done
                            ? u_resolve(e_asyncIteratorResult.value)
                            : new n_promiseConstructor(function (t_promiseResolve) {
                                t_promiseResolve(e_asyncIteratorResult.value);
                            }).then(o_step, a_step);
                    }
                    c_next((r_generatorFunction = r_generatorFunction.apply(e, t || [])).next());
                });
            };

            // TypeScript `__generator` helper.
            var u = this && this.__generator || function (e, t) {
                var n_internalState, r_iterator, u_currentOp, i_currentValue, o_state = {
                    label: 0,
                    sent: function () {
                        if (1 & u_currentOp[0]) {
                            throw u_currentOp[1];
                        }
                        return u_currentOp[1];
                    },
                    trys: [],
                    ops: []
                };
                i_currentValue = { next: a_createStepFunction(0), throw: a_createStepFunction(1), return: a_createStepFunction(2) };
                if ("function" == typeof Symbol && (i_currentValue[Symbol.iterator] = function () { return this; }), i_currentValue) {
                    // Empty block as per original minified code.
                }

                function a_createStepFunction(i_opCode) {
                    return function (a_arg) {
                        return function (i_opCode_inner) {
                            if (n_internalState) {
                                throw new TypeError("Generator is already executing.");
                            }
                            for (; o_state;) {
                                try {
                                    if (n_internalState = 1, r_iterator && (u_currentOp = 2 & i_opCode_inner[0] ? r_iterator.return : i_opCode_inner[0] ? r_iterator.throw || ((u_currentOp = r_iterator.return) && u_currentOp.call(r_iterator), 0) : r_iterator.next) && !(u_currentOp = u_currentOp.call(r_iterator, i_opCode_inner[1])).done) {
                                        return u_currentOp;
                                    }
                                    r_iterator = 0;
                                    u_currentOp && (i_opCode_inner = [2 & i_opCode_inner[0], u_currentOp.value]);
                                    switch (i_opCode_inner[0]) {
                                        case 0: case 1:
                                            u_currentOp = i_opCode_inner;
                                            break;
                                        case 4:
                                            o_state.label++;
                                            return { value: i_opCode_inner[1], done: !1 };
                                        case 5:
                                            o_state.label++;
                                            r_iterator = i_opCode_inner[1];
                                            i_opCode_inner = [0];
                                            continue;
                                        case 7:
                                            i_opCode_inner = o_state.ops.pop();
                                            o_state.trys.pop();
                                            continue;
                                        default:
                                            if (!(u_currentOp = (u_currentOp = o_state.trys).length > 0 && u_currentOp[u_currentOp.length - 1]) && (6 === i_opCode_inner[0] || 2 === i_opCode_inner[0])) {
                                                o_state = 0;
                                                continue;
                                            }
                                            if (3 === i_opCode_inner[0] && (!u_currentOp || i_opCode_inner[1] > u_currentOp[0] && i_opCode_inner[1] < u_currentOp[3])) {
                                                o_state.label = i_opCode_inner[1];
                                                break;
                                            }
                                            if (6 === i_opCode_inner[0] && o_state.label < u_currentOp[1]) {
                                                o_state.label = u_currentOp[1];
                                                u_currentOp = i_opCode_inner;
                                                break;
                                            }
                                            if (u_currentOp && o_state.label < u_currentOp[2]) {
                                                o_state.label = u_currentOp[2];
                                                o_state.ops.push(i_opCode_inner);
                                                break;
                                            }
                                            u_currentOp[2] && o_state.ops.pop();
                                            o_state.trys.pop();
                                            continue;
                                    }
                                    i_opCode_inner = t.call(e, o_state);
                                } catch (e_error) {
                                    i_opCode_inner = [6, e_error];
                                    r_iterator = 0;
                                } finally {
                                    n_internalState = u_currentOp = 0;
                                }
                            }
                            if (5 & i_opCode_inner[0]) {
                                throw i_opCode_inner[1];
                            }
                            return { value: i_opCode_inner[0] ? i_opCode_inner[1] : void 0, done: !0 };
                        }([i_opCode_inner, a_arg]);
                    };
                }
            };

            Object.defineProperty(t, "__esModule", { value: !0 });

            // Import input utilities from module 0.
            var i = n(0);

            /**
             * @private
             * @function o
             * Implements an asynchronous merge sort algorithm for interactive sorting problems.
             * It uses an external comparison function `a` to compare elements, which involves I/O.
             *
             * @param {string[]} e - The array of elements (characters) to be sorted.
             * @returns {Promise<string[]>} A Promise that resolves to the sorted array.
             */
            function o(e) {
                return r(this, void 0, void 0, function () {
                    var t_leftHalf, n_rightHalf, r_sortedLeft, i_sortedRight, c_mergedResult, l_comparisonOutput;
                    return u(this, function (u_state) {
                        switch (u_state.label) {
                            case 0:
                                // Base case: An array with 0 or 1 element is already sorted.
                                if (1 === e.length) {
                                    return [2, e];
                                }

                                // Split the array into two halves.
                                t_leftHalf = e.slice(0, Math.ceil(e.length / 2));
                                n_rightHalf = e.slice(Math.ceil(e.length / 2));

                                // Recursively sort the left half.
                                return [4, o(t_leftHalf)];
                            case 1:
                                r_sortedLeft = u_state.sent();

                                // Recursively sort the right half.
                                return [4, o(n_rightHalf)];
                            case 2:
                                i_sortedRight = u_state.sent();
                                c_mergedResult = []; // Array to store the merged sorted elements.
                                u_state.label = 3;
                            case 3:
                                // Merge the two sorted halves. Continue as long as both have elements.
                                if (!(r_sortedLeft.length > 0 && i_sortedRight.length > 0)) {
                                    return [3, 5];
                                }

                                // Perform an interactive comparison between the first elements of each half.
                                return [4, a(r_sortedLeft[0], i_sortedRight[0])];
                            case 4:
                                // If `r_sortedLeft[0]` is smaller (result is true), take it; otherwise, take `i_sortedRight[0]`.
                                l_comparisonOutput = u_state.sent() ? r_sortedLeft.shift() : i_sortedRight.shift();
                                // Add the chosen element to the merged result.
                                l_comparisonOutput && c_mergedResult.push(l_comparisonOutput);
                                return [3, 3];
                            case 5:
                                // Append any remaining elements from either half (one of them will be empty).
                                c_mergedResult.push.apply(c_mergedResult, r_sortedLeft.concat(i_sortedRight));
                                return [2, c_mergedResult]; // Return the fully merged and sorted array.
                        }
                    });
                });
            }

            /**
             * @private
             * @function a
             * Performs an asynchronous interactive comparison between two elements.
             * It prints a query to standard output and reads the comparison result from standard input.
             *
             * @param {string} e - The first element for comparison.
             * @param {string} t - The second element for comparison.
             * @returns {Promise<boolean>} A Promise that resolves to `true` if `e` is less than `t` (based on input "<"), `false` otherwise.
             */
            function a(e, t) {
                return r(this, void 0, void 0, function () {
                    var n_response; // Variable to hold the response from stdin.
                    return u(this, function (u_state) {
                        switch (u_state.label) {
                            case 0:
                                // Output the comparison query to stdout.
                                console.log("? " + e + " " + t);
                                // Wait for the response from standard input.
                                return [4, i.atcoderInput()];
                            case 1:
                                n_response = u_state.sent();
                                // Return `true` if the response is "<", indicating `e < t`.
                                return [2, "<" === n_response];
                        }
                    });
                });
            }

            /**
             * @public
             * @function t.default
             * Main solution for the interactive sorting problem.
             * It initializes an array of characters (e.g., 'A', 'B', 'C'...)
             * and then uses the interactive merge sort (`o`) to sort them.
             *
             * @param {string[]} e - Input array: `e[0]` contains "N Q", where `N` is the number of elements.
             * @returns {Promise<string[]>} A Promise that resolves to an array containing the final sorted string.
             */
            t.default = function (e) {
                return r(this, void 0, void 0, function () {
                    var t_params, n_numElements, r_charCodeOfA, u_initialCharacters, i_finalSortedResult;
                    return u(this, function (u_state) {
                        switch (u_state.label) {
                            case 0:
                                // Parse N (number of elements) and Q (number of queries, unused) from the first line.
                                t_params = e[0].split(" ").map(function (e_numStr) {
                                    return Number(e_numStr);
                                });
                                n_numElements = t_params[0]; // N is the first parameter.

                                // Get the ASCII code for 'A' to generate characters 'A', 'B', 'C', etc.
                                r_charCodeOfA = "A".charCodeAt(0);

                                // Create an array of characters from 'A' up to 'A' + (N-1).
                                u_initialCharacters = Array.apply(null, new Array(n_numElements)).map(function (e_unused, t_offset) {
                                    return String.fromCharCode(r_charCodeOfA + t_offset);
                                });

                                // Perform the interactive merge sort on the initial characters.
                                return [4, o(u_initialCharacters)];
                            case 1:
                                i_finalSortedResult = u_state.sent();
                                // Format the output: "! " followed by the joined sorted characters.
                                return [2, ["! " + i_finalSortedResult.join("")]];
                        }
                    });
                });
            };

        },

        /* Module 17: Node.js 'fs' Module Wrapper */
        function (e, t) {
            // This module simply exports the built-in Node.js 'fs' (File System) module.
            // This is how external Node.js modules are made available within the Webpack bundle.
            e.exports = require("fs");
        },

        /* Module 18: Node.js 'readline' Module Wrapper */
        function (e, t) {
            // This module simply exports the built-in Node.js 'readline' module.
            // This is used for interactive console input/output.
            e.exports = require("readline");
        },

        /* Module 19: Welcome To AtCoder Solution */
        function (e, t, n) {
            "use strict";

            Object.defineProperty(t, "__esModule", { value: !0 });

            /**
             * @public
             * @function t.default
             * Solves the "Welcome to AtCoder" problem.
             * This problem typically involves reading three numbers and a string,
             * summing the numbers, and then concatenating the sum with the string.
             *
             * @param {string[]} e - Input array:
             *   `e[0]`: A string containing the first number `a`.
             *   `e[1]`: A string containing two space-separated numbers `b` and `c`.
             *   `e[2]`: The input string `s`.
             * @returns {string[]} An array containing a single string: the sum of (a+b+c) followed by the string `s`.
             */
            t.default = function (e) {
                // Parse the first number `a` from `e[0]`.
                var t_numA = Number(e[0]);

                // Parse the second `b` and third `c` numbers from `e[1]`.
                var n_numsB_C = e[1].split(" ").map(function (e_numStr) {
                    return Number(e_numStr);
                });

                // Calculate the sum of `a`, `b`, and `c`.
                // `n_numsB_C[0]` is `b`, `n_numsB_C[1]` is `c`.
                var sum = t_numA + n_numsB_C[0] + n_numsB_C[1];

                // Concatenate the calculated sum (converted to string) with a space and the input string `e[2]`.
                return [sum + " " + e[2]];
            };

        }
    ]
);

// Source map URL for debugging purposes.
//# sourceMappingURL=main.js.map