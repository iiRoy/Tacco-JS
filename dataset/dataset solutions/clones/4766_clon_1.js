/**
 * This is a Type I clone of a JavaScript module bundle.
 * All identifiers, operators, and expressions remain unchanged.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 */

// Main module exports function, typically a webpack bootstrap.
module.exports = function (e) {
    // Cache for loaded modules.
    var r = {};

    /**
     * The module loader function.
     * @param {number} t - The module ID.
     */
    function n(t) {
        // If module is already in cache, return its exports.
        if (r[t]) {
            return r[t].exports;
        }

        // Create a new module entry in the cache.
        var i = r[t] = {
            i: t,
            l: !1,
            exports: {}
        };

        // Execute the module function, populating its exports.
        e[t].call(i.exports, i, i.exports, n);

        // Mark the module as loaded.
        i.l = !0;

        // Return the module's exports.
        return i.exports;
    }

    // Store all module definitions.
    n.m = e;

    // Store the module cache.
    n.c = r;

    /**
     * Define a getter function for an enumerable property.
     * @param {object} e - The object to define the property on.
     * @param {string} r - The name of the property.
     * @param {Function} t - The getter function.
     */
    n.d = function (e, r, t) {
        if (!n.o(e, r)) {
            Object.defineProperty(e, r, {
                enumerable: !0,
                get: t
            });
        }
    };

    /**
     * Add `__esModule` and `Symbol.toStringTag` properties for ES module compatibility.
     * @param {object} e - The module object.
     */
    n.r = function (e) {
        if ("undefined" != typeof Symbol && Symbol.toStringTag) {
            Object.defineProperty(e, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
    };

    /**
     * Create a namespace object for a module.
     * @param {object} e - The module or its exports.
     * @param {number} r - Flags indicating how to process `e`.
     */
    n.t = function (e, r) {
        if (1 & r) {
            e = n(e);
        }

        if (8 & r) {
            return e;
        }

        if (4 & r && "object" == typeof e && e && e.__esModule) {
            return e;
        }

        var t = Object.create(null);
        n.r(t);
        Object.defineProperty(t, "default", {
            enumerable: !0,
            value: e
        });

        if (2 & r && "string" != typeof e) {
            for (var i in e) {
                n.d(t, i, function (r) {
                    return e[r];
                }.bind(null, i));
            }
        }
        return t;
    };

    /**
     * Get the default export of a module.
     * @param {object} e - The module exports.
     */
    n.n = function (e) {
        var r = e && e.__esModule ?
            function () {
                return e.default;
            } :
            function () {
                return e;
            };
        n.d(r, "a", r);
        return r;
    };

    /**
     * Check if an object has a property.
     * @param {object} e - The object.
     * @param {string} r - The property name.
     */
    n.o = function (e, r) {
        return Object.prototype.hasOwnProperty.call(e, r);
    };

    // Public path for assets (empty in this bundle).
    n.p = "";

    // Execute the entry module (module 0).
    return n(n.s = 0);
}(
    // Array of module definitions.
    [
        /**
         * Module 0: Entry point.
         * Reads input from `/dev/stdin`, splits it by newline, and passes it to Module 1.
         * @param {object} e - Module object.
         * @param {object} r - Module exports.
         * @param {Function} n - The module loader.
         */
        function (e, r, n) {
            n(1)(n(3).readFileSync("/dev/stdin", "UTF-8").split("\n"));
        },

        /**
         * Module 1: Calculates a product based on prime factors of numbers up to N.
         * Reads N from the first line of input, then for each number from 2 to N,
         * it finds its prime factors and their counts, accumulating them.
         * Finally, it calculates the product of (count + 1) for each unique prime factor.
         * @param {object} e - Module object.
         * @param {object} r - Module exports.
         * @param {Function} n - The module loader.
         */
        function (e, r, n) {
            // Load the BigNumber library (Module 2).
            var t = n(2);

            // Export a function that processes the input array.
            e.exports = function (e) {
                // Object to store prime factor counts.
                for (var r = {}, n = Number(e[0]); n >= 2; n--) {
                    // Iterate from 2 up to N (inclusive).

                    // Calculate square root for prime factorization optimization.
                    for (var i = Math.ceil(Math.sqrt(n)), o = 0, u = 2; u <= i; u++) {
                        // If 'n' is divisible by 'u', 'u' is a prime factor.
                        if (n % u == 0) {
                            o += 1; // Increment prime factor count for 'n'.

                            // Count occurrences of prime factor 'u' in 'n'.
                            for (var f = 0, s = n; s % u == 0;) {
                                s /= u;
                                f += 1;
                            }

                            // Add or update the count of 'u' in the global prime factor map.
                            r[u] || (r[u] = 0);
                            r[u] += f;
                        }
                    }

                    // If 'n' has no prime factors found up to its square root, it's prime.
                    if (0 == o) {
                        r[n] || (r[n] = 0);
                        r[n] += 1;
                    }
                }

                // Initialize BigNumber with 1 for product calculation.
                var l = new t(1);

                // Multiply 'l' by (count + 1) for each prime factor.
                for (var c in r) {
                    l = l.times(r[c] + 1);
                }

                // Log the final BigNumber result as a string.
                console.log(l.toString());
            };
        },

        /**
         * Module 2: The BigNumber.js library.
         * This module provides arbitrary-precision arithmetic for JavaScript.
         * It defines the `BigNumber` constructor and its prototype methods.
         * @param {object} e - Module object.
         * @param {object} r - Module exports.
         * @param {Function} n - The module loader.
         */
        function (e, r, n) {
            var t;

            // UMD (Universal Module Definition) wrapper for BigNumber.js.
            ! function (i) {
                "use strict";

                var o,
                    // Regex for valid BigNumber string format.
                    u = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
                    // Math functions.
                    f = Math.ceil,
                    s = Math.floor,
                    // Error message prefix.
                    l = "[BigNumber Error] ",
                    // Error message for numbers with too many significant digits.
                    c = l + "Number primitive has more than 15 significant digits: ",
                    // Max value for a digit group (base 10^14).
                    a = 1e14,
                    // Number of decimal places in a digit group.
                    h = 14,
                    // Max safe integer.
                    p = 9007199254740991,
                    // Powers of 10 for digit group calculations.
                    g = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
                    // Max value for internal division (base 10^7).
                    d = 1e7,
                    // Max decimal places / exponent range (10^9).
                    w = 1e9;

                /**
                 * Floor division for negative numbers.
                 * @param {number} e - The number.
                 * @returns {number} The floor of the number.
                 */
                function m(e) {
                    var r = 0 | e;
                    return e > 0 || e === r ? r : r - 1;
                }

                /**
                 * Convert an array of digit groups to a string.
                 * @param {Array<number>} e - Array of digit groups.
                 * @returns {string} The string representation.
                 */
                function v(e) {
                    for (var r, n, t = 1, i = e.length, o = e[0] + ""; t < i;) {
                        for (r = e[t++] + "", n = h - r.length; n--; r = "0" + r);
                        o += r;
                    }
                    for (i = o.length; 48 === o.charCodeAt(--i););
                    return o.slice(0, i + 1 || 1);
                }

                /**
                 * Compare two BigNumber instances.
                 * @param {BigNumber} e - First BigNumber.
                 * @param {BigNumber} r - Second BigNumber.
                 * @returns {number} -1 if e < r, 1 if e > r, 0 if e == r.
                 */
                function b(e, r) {
                    var n, t, i = e.c,
                        o = r.c,
                        u = e.s,
                        f = r.s,
                        s = e.e,
                        l = r.e;

                    // Handle NaN, Infinity, or Zero.
                    if (!u || !f) {
                        return null;
                    }
                    if (n = i && !i[0], t = o && !o[0], n || t) {
                        return n ? t ? 0 : -f : u;
                    }

                    // Handle different signs.
                    if (u != f) {
                        return u;
                    }

                    // Store if negative.
                    if (n = u < 0, t = s == l, !i || !o) {
                        return t ? 0 : !i ^ n ? 1 : -1;
                    }

                    // Handle different exponents.
                    if (!t) {
                        return s > l ^ n ? 1 : -1;
                    }

                    // Compare digit groups.
                    for (f = (s = i.length) < (l = o.length) ? s : l, u = 0; u < f; u++) {
                        if (i[u] != o[u]) {
                            return i[u] > o[u] ^ n ? 1 : -1;
                        }
                    }

                    // If prefixes are equal, compare lengths.
                    return s == l ? 0 : s > l ^ n ? 1 : -1;
                }

                /**
                 * Validate a number argument.
                 * @param {number} e - The number to validate.
                 * @param {number} r - Minimum allowed value.
                 * @param {number} n - Maximum allowed value.
                 * @param {string} t - Argument name for error message.
                 */
                function y(e, r, n, t) {
                    if (e < r || e > n || e !== s(e)) {
                        throw Error(l + (t || "Argument") + ("number" == typeof e ? e < r || e > n ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(e));
                    }
                }

                /**
                 * Check if a BigNumber is odd.
                 * @param {BigNumber} e - The BigNumber.
                 * @returns {boolean} True if odd, false otherwise.
                 */
                function O(e) {
                    var r = e.c.length - 1;
                    return m(e.e / h) == r && e.c[r] % 2 != 0;
                }

                /**
                 * Format a string as scientific notation.
                 * @param {string} e - The number string.
                 * @param {number} r - The exponent.
                 * @returns {string} Scientific notation string.
                 */
                function N(e, r) {
                    return (e.length > 1 ? e.charAt(0) + "." + e.slice(1) : e) + (r < 0 ? "e" : "e+") + r;
                }

                /**
                 * Format a string as fixed-point notation.
                 * @param {string} e - The number string.
                 * @param {number} r - The exponent.
                 * @param {string} n - The padding character.
                 * @returns {string} Fixed-point notation string.
                 */
                function E(e, r, n) {
                    var t, i;
                    if (r < 0) {
                        for (i = n + "."; ++r; i += n);
                        e = i + e;
                    } else if (++r > (t = e.length)) {
                        for (i = n, r -= t; --r; i += n);
                        e += i;
                    } else {
                        r < t && (e = e.slice(0, r) + "." + e.slice(r));
                    }
                    return e;
                }

                /**
                 * BigNumber constructor factory.
                 * @param {object} r - Configuration object for BigNumber.
                 * @returns {Function} The BigNumber constructor.
                 */
                (o = function e(r) {
                    // BigNumber prototype.
                    var n, t, i, o, A, S, _, x, P, R = q.prototype = {
                            constructor: q,
                            toString: null,
                            valueOf: null
                        },
                        // Default BigNumber value (1).
                        D = new q(1),
                        // Default decimal places.
                        M = 20,
                        // Default rounding mode (ROUND_HALF_UP).
                        B = 4,
                        // Default exponential at lower bound.
                        L = -7,
                        // Default exponential at upper bound.
                        T = 21,
                        // Default range lower bound.
                        U = -1e7,
                        // Default range upper bound.
                        I = 1e7,
                        // Crypto availability flag.
                        C = !1,
                        // Default modulo mode.
                        j = 1,
                        // Default POW_PRECISION.
                        F = 0,
                        // Default formatting object.
                        G = {
                            prefix: "",
                            groupSize: 3,
                            secondaryGroupSize: 0,
                            groupSeparator: ",",
                            decimalSeparator: ".",
                            fractionGroupSize: 0,
                            fractionGroupSeparator: " ",
                            suffix: ""
                        },
                        // Default alphabet for base conversion.
                        k = "0123456789abcdefghijklmnopqrstuvwxyz";

                    /**
                     * BigNumber constructor.
                     * @param {number|string|BigNumber} e - The value to convert.
                     * @param {number} [r] - The base of the input string (2 to k.length).
                     */
                    function q(e, r) {
                        var n, o, f, l, a, g, d, w, m = this;

                        // Allow BigNumber to be called without 'new'.
                        if (!(m instanceof q)) {
                            return new q(e, r);
                        }

                        // If no base is provided.
                        if (null == r) {
                            // If 'e' is already a BigNumber, clone it.
                            if (e && !0 === e._isBigNumber) {
                                return m.s = e.s, void(!e.c || e.e > I ? m.c = m.e = null : e.e < U ? m.c = [m.e = 0] : (m.e = e.e, m.c = e.c.slice()));
                            }

                            // Handle number primitive.
                            if ((g = "number" == typeof e) && 0 * e == 0) {
                                if (m.s = 1 / e < 0 ? (e = -e, -1) : 1, e === ~~e) {
                                    for (l = 0, a = e; a >= 10; a /= 10, l++);
                                    return void(l > I ? m.c = m.e = null : (m.e = l, m.c = [e]));
                                }
                                w = String(e);
                            } else {
                                // Handle string input (decimal).
                                if (!u.test(w = String(e))) {
                                    return i(m, w, g);
                                }
                                m.s = 45 == w.charCodeAt(0) ? (w = w.slice(1), -1) : 1;
                            }

                            // Parse decimal string.
                            (l = w.indexOf(".")) > -1 && (w = w.replace(".", "")),
                            (a = w.search(/e/i)) > 0 ? (l < 0 && (l = a), l += +w.slice(a + 1), w = w.substring(0, a)) : l < 0 && (l = w.length);
                        } else {
                            // If a base is provided.
                            y(r, 2, k.length, "Base");

                            // If base is 10, just re-parse using default method.
                            if (10 == r) {
                                return V(m = new q(e), M + m.e + 1, B);
                            }

                            // Handle number primitive with base.
                            if (w = String(e), g = "number" == typeof e) {
                                if (0 * e != 0) {
                                    return i(m, w, g, r);
                                }
                                if (m.s = 1 / e < 0 ? (w = w.slice(1), -1) : 1, q.DEBUG && w.replace(/^0\.0*|\./, "").length > 15) {
                                    throw Error(c + e);
                                }
                            } else {
                                m.s = 45 === w.charCodeAt(0) ? (w = w.slice(1), -1) : 1;
                            }

                            // Validate characters for the given base.
                            for (n = k.slice(0, r), l = a = 0, d = w.length; a < d; a++) {
                                if (n.indexOf(o = w.charAt(a)) < 0) {
                                    if ("." == o) {
                                        if (a > l) {
                                            l = d;
                                            continue;
                                        }
                                    } else if (!f && (w == w.toUpperCase() && (w = w.toLowerCase()) || w == w.toLowerCase() && (w = w.toUpperCase()))) {
                                        f = !0, a = -1, l = 0;
                                        continue;
                                    }
                                    return i(m, String(e), g, r);
                                }
                            }

                            // Convert from given base to base 10.
                            g = !1, (l = (w = t(w, r, 10, m.s)).indexOf(".")) > -1 ? w = w.replace(".", "") : l = w.length;
                        }

                        // Remove leading zeros.
                        for (a = 0; 48 === w.charCodeAt(a); a++);
                        // Remove trailing zeros.
                        for (d = w.length; 48 === w.charCodeAt(--d););

                        // If the number is not zero.
                        if (w = w.slice(a, ++d)) {
                            if (d -= a, g && q.DEBUG && d > 15 && (e > p || e !== s(e))) {
                                throw Error(c + m.s * e);
                            }

                            // Check for exponent range.
                            if ((l = l - a - 1) > I) {
                                m.c = m.e = null;
                            } else if (l < U) {
                                m.c = [m.e = 0];
                            } else {
                                // Store exponent and digit groups.
                                if (m.e = l, m.c = [], a = (l + 1) % h, l < 0 && (a += h), a < d) {
                                    for (a && m.c.push(+w.slice(0, a)), d -= h; a < d;) {
                                        m.c.push(+w.slice(a, a += h));
                                    }
                                    a = h - (w = w.slice(a)).length;
                                } else {
                                    a -= d;
                                }
                                for (; a--; w += "0");
                                m.c.push(+w);
                            }
                        } else {
                            m.c = [m.e = 0]; // If the number is zero.
                        }
                    }

                    /**
                     * Format a BigNumber to a string with specified decimal places and rounding mode.
                     * Used by `toExponential`, `toFixed`, `toPrecision`.
                     * @param {BigNumber} e - The BigNumber instance.
                     * @param {number} r - The number of decimal places or significant digits.
                     * @param {number} n - The rounding mode.
                     * @param {number} t - The output format type (1: exponential, 2: precision, undefined: fixed).
                     * @returns {string} The formatted string.
                     */
                    function $(e, r, n, t) {
                        var i, o, u, f, s;
                        if (null == n ? n = B : y(n, 0, 8), !e.c) {
                            return e.toString();
                        }
                        if (i = e.c[0], u = e.e, null == r) {
                            s = v(e.c), s = 1 == t || 2 == t && (u <= L || u >= T) ? N(s, u) : E(s, u, "0");
                        } else if (o = (e = V(new q(e), r, n)).e, f = (s = v(e.c)).length, 1 == t || 2 == t && (r <= o || o <= L)) {
                            for (; f < r; s += "0", f++);
                            s = N(s, o);
                        } else if (r -= u, s = E(s, o, "0"), o + 1 > f) {
                            if (--r > 0) {
                                for (s += "."; r--; s += "0");
                            }
                        } else if ((r += o - f) > 0) {
                            for (o + 1 == f && (s += "."); r--; s += "0");
                        }
                        return e.s < 0 && i ? "-" + s : s;
                    }

                    /**
                     * Find the maximum or minimum BigNumber from arguments.
                     * @param {Array<BigNumber>} e - Array of BigNumbers.
                     * @param {Function} r - Comparison function (e.g., R.lt for max, R.gt for min).
                     * @returns {BigNumber} The max/min BigNumber.
                     */
                    function z(e, r) {
                        for (var n, t = 1, i = new q(e[0]); t < e.length;) {
                            if (!(n = new q(e[t++])).s) {
                                i = n;
                                break;
                            }
                            r.call(i, n) && (i = n);
                        }
                        return i;
                    }

                    /**
                     * Normalize a BigNumber's coefficient array and exponent after an operation.
                     * @param {BigNumber} e - The BigNumber instance.
                     * @param {Array<number>} r - The coefficient array.
                     * @param {number} n - The exponent.
                     * @returns {BigNumber} The normalized BigNumber.
                     */
                    function H(e, r, n) {
                        // Remove trailing zeros from coefficient array.
                        for (var t = 1, i = r.length; !r[--i]; r.pop());

                        // Calculate the true exponent from the first digit group.
                        for (i = r[0]; i >= 10; i /= 10, t++);

                        // Adjust exponent based on range limits.
                        return (n = t + n * h - 1) > I ? e.c = e.e = null : n < U ? e.c = [e.e = 0] : (e.e = n, e.c = r), e;
                    }

                    /**
                     * Round a BigNumber to a specified number of decimal places or significant digits.
                     * @param {BigNumber} e - The BigNumber instance.
                     * @param {number} r - The number of decimal places or significant digits.
                     * @param {number} n - The rounding mode.
                     * @param {boolean} [t] - Whether to force rounding up (e.g., for division remainder).
                     * @returns {BigNumber} The rounded BigNumber.
                     */
                    function V(e, r, n, t) {
                        var i, o, u, l, c, p, d, w = e.c,
                            m = g;

                        if (w) {
                            e: {
                                for (i = 1, l = w[0]; l >= 10; l /= 10, i++); // Count digits in the first group.

                                if ((o = r - i) < 0) { // If rounding within the first group.
                                    o += h, u = r, d = (c = w[p = 0]) / m[i - u - 1] % 10 | 0;
                                } else if ((p = f((o + 1) / h)) >= w.length) { // If rounding beyond the last group.
                                    if (!t) {
                                        break e;
                                    }
                                    for (; w.length <= p; w.push(0));
                                    c = d = 0, i = 1, u = (o %= h) - h + 1;
                                } else { // Rounding within other groups.
                                    for (c = l = w[p], i = 1; l >= 10; l /= 10, i++);
                                    d = (u = (o %= h) - h + i) < 0 ? 0 : c / m[i - u - 1] % 10 | 0;
                                }

                                // Determine if rounding up is needed based on rounding mode and dropped digit.
                                if (t = t || r < 0 || null != w[p + 1] || (u < 0 ? c : c % m[i - u - 1]), t = n < 4 ? (d || t) && (0 == n || n == (e.s < 0 ? 3 : 2)) : d > 5 || 5 == d && (4 == n || t || 6 == n && (o > 0 ? u > 0 ? c / m[i - u] : 0 : w[p - 1]) % 10 & 1 || n == (e.s < 0 ? 8 : 7)), r < 1 || !w[0]) {
                                    return w.length = 0, t ? (r -= e.e + 1, w[0] = m[(h - r % h) % h], e.e = -r || 0) : w[0] = e.e = 0, e;
                                }

                                // Apply rounding.
                                if (0 == o ? (w.length = p, l = 1, p--) : (w.length = p + 1, l = m[h - o], w[p] = u > 0 ? s(c / m[i - u] % m[u]) * l : 0), t) {
                                    for (;;) {
                                        if (0 == p) {
                                            for (o = 1, u = w[0]; u >= 10; u /= 10, o++);
                                            for (u = w[0] += l, l = 1; u >= 10; u /= 10, l++);
                                            o != l && (e.e++, w[0] == a && (w[0] = 1));
                                            break;
                                        }
                                        if (w[p] += l, w[p] != a) {
                                            break;
                                        }
                                        w[p--] = 0, l = 1;
                                    }
                                }

                                // Remove leading zeros from the coefficient array.
                                for (o = w.length; 0 === w[--o]; w.pop());
                            }
                        }

                        // Adjust exponent based on range limits.
                        e.e > I ? e.c = e.e = null : e.e < U && (e.c = [e.e = 0]);
                        return e;
                    }

                    /**
                     * Convert a BigNumber to its string representation (scientific or fixed).
                     * @param {BigNumber} e - The BigNumber instance.
                     * @returns {string} The string representation.
                     */
                    function W(e) {
                        var r, n = e.e;
                        return null === n ? e.toString() : (r = v(e.c), r = n <= L || n >= T ? N(r, n) : E(r, n, "0"), e.s < 0 ? "-" + r : r);
                    }

                    // Export the BigNumber constructor.
                    return q.clone = e,
                        // Rounding modes.
                        q.ROUND_UP = 0,
                        q.ROUND_DOWN = 1,
                        q.ROUND_CEIL = 2,
                        q.ROUND_FLOOR = 3,
                        q.ROUND_HALF_UP = 4,
                        q.ROUND_HALF_DOWN = 5,
                        q.ROUND_HALF_EVEN = 6,
                        q.ROUND_HALF_CEIL = 7,
                        q.ROUND_HALF_FLOOR = 8,
                        q.EUCLID = 9,

                        /**
                         * Configure BigNumber settings.
                         * @param {object} e - Configuration object.
                         */
                        q.config = q.set = function (e) {
                            var r, n;
                            if (null != e) {
                                if ("object" != typeof e) {
                                    throw Error(l + "Object expected: " + e);
                                }
                                if (e.hasOwnProperty(r = "DECIMAL_PLACES") && (y(n = e[r], 0, w, r), M = n),
                                    e.hasOwnProperty(r = "ROUNDING_MODE") && (y(n = e[r], 0, 8, r), B = n),
                                    e.hasOwnProperty(r = "EXPONENTIAL_AT") && ((n = e[r]) && n.pop ? (y(n[0], -w, 0, r), y(n[1], 0, w, r), L = n[0], T = n[1]) : (y(n, -w, w, r), L = -(T = n < 0 ? -n : n))),
                                    e.hasOwnProperty(r = "RANGE")) {
                                    if ((n = e[r]) && n.pop) {
                                        y(n[0], -w, -1, r), y(n[1], 1, w, r), U = n[0], I = n[1];
                                    } else {
                                        if (y(n, -w, w, r), !n) {
                                            throw Error(l + r + " cannot be zero: " + n);
                                        }
                                        U = -(I = n < 0 ? -n : n);
                                    }
                                }
                                if (e.hasOwnProperty(r = "CRYPTO")) {
                                    if ((n = e[r]) !== !!n) {
                                        throw Error(l + r + " not true or false: " + n);
                                    }
                                    if (n) {
                                        if ("undefined" == typeof crypto || !crypto || !crypto.getRandomValues && !crypto.randomBytes) {
                                            throw C = !n, Error(l + "crypto unavailable");
                                        }
                                        C = n;
                                    } else {
                                        C = n;
                                    }
                                }
                                if (e.hasOwnProperty(r = "MODULO_MODE") && (y(n = e[r], 0, 9, r), j = n),
                                    e.hasOwnProperty(r = "POW_PRECISION") && (y(n = e[r], 0, w, r), F = n),
                                    e.hasOwnProperty(r = "FORMAT")) {
                                    if ("object" != typeof (n = e[r])) {
                                        throw Error(l + r + " not an object: " + n);
                                    }
                                    G = n;
                                }
                                if (e.hasOwnProperty(r = "ALPHABET")) {
                                    if ("string" != typeof (n = e[r]) || /^.$|[+-.\s]|(.).*\1/.test(n)) {
                                        throw Error(l + r + " invalid: " + n);
                                    }
                                    k = n;
                                }
                            }
                            return {
                                DECIMAL_PLACES: M,
                                ROUNDING_MODE: B,
                                EXPONENTIAL_AT: [L, T],
                                RANGE: [U, I],
                                CRYPTO: C,
                                MODULO_MODE: j,
                                POW_PRECISION: F,
                                FORMAT: G,
                                ALPHABET: k
                            };
                        },

                        /**
                         * Check if an object is a BigNumber instance.
                         * @param {object} e - The object to check.
                         * @returns {boolean} True if it's a BigNumber, false otherwise.
                         */
                        q.isBigNumber = function (e) {
                            if (!e || !0 !== e._isBigNumber) {
                                return !1;
                            }
                            if (!q.DEBUG) {
                                return !0;
                            }
                            var r, n, t = e.c,
                                i = e.e,
                                o = e.s;
                            e: if ("[object Array]" == {}.toString.call(t)) {
                                if ((1 === o || -1 === o) && i >= -w && i <= w && i === s(i)) {
                                    if (0 === t[0]) {
                                        if (0 === i && 1 === t.length) {
                                            return !0;
                                        }
                                        break e;
                                    }
                                    if ((r = (i + 1) % h) < 1 && (r += h), String(t[0]).length == r) {
                                        for (r = 0; r < t.length; r++) {
                                            if ((n = t[r]) < 0 || n >= a || n !== s(n)) {
                                                break e;
                                            }
                                        }
                                        if (0 !== n) {
                                            return !0;
                                        }
                                    }
                                } else if (null === t && null === i && (null === o || 1 === o || -1 === o)) {
                                    return !0;
                                }
                                throw Error(l + "Invalid BigNumber: " + e);
                            }
                        },

                        // Alias for `maximum`.
                        q.maximum = q.max = function () {
                            return z(arguments, R.lt);
                        },

                        // Alias for `minimum`.
                        q.minimum = q.min = function () {
                            return z(arguments, R.gt);
                        },

                        // Random number generator helper.
                        q.random = (o = 9007199254740992 * Math.random() & 2097151 ?
                            function () {
                                return s(9007199254740992 * Math.random());
                            } :
                            function () {
                                return 8388608 * (1073741824 * Math.random() | 0) + (8388608 * Math.random() | 0);
                            },

                            /**
                             * Generate a random BigNumber.
                             * @param {number} e - The number of decimal places.
                             * @returns {BigNumber} A random BigNumber.
                             */
                            function (e) {
                                var r, n, t, i, u, c = 0,
                                    a = [],
                                    p = new q(D);

                                if (null == e ? e = M : y(e, 0, w), i = f(e / h), C) {
                                    if (crypto.getRandomValues) {
                                        for (r = crypto.getRandomValues(new Uint32Array(i *= 2)); c < i;) {
                                            (u = 131072 * r[c] + (r[c + 1] >>> 11)) >= 9e15 ? (n = crypto.getRandomValues(new Uint32Array(2)), r[c] = n[0], r[c + 1] = n[1]) : (a.push(u % 1e14), c += 2);
                                        }
                                        c = i / 2;
                                    } else {
                                        if (!crypto.randomBytes) {
                                            throw C = !1, Error(l + "crypto unavailable");
                                        }
                                        for (r = crypto.randomBytes(i *= 7); c < i;) {
                                            (u = 281474976710656 * (31 & r[c]) + 1099511627776 * r[c + 1] + 4294967296 * r[c + 2] + 16777216 * r[c + 3] + (r[c + 4] << 16) + (r[c + 5] << 8) + r[c + 6]) >= 9e15 ? crypto.randomBytes(7).copy(r, c) : (a.push(u % 1e14), c += 7);
                                        }
                                        c = i / 7;
                                    }
                                }

                                if (!C) {
                                    for (; c < i;) {
                                        (u = o()) < 9e15 && (a[c++] = u % 1e14);
                                    }
                                }

                                for (i = a[--c], e %= h, i && e && (u = g[h - e], a[c] = s(i / u) * u); 0 === a[c]; a.pop(), c--);

                                if (c < 0) {
                                    a = [t = 0];
                                } else {
                                    for (t = -1; 0 === a[0]; a.splice(0, 1), t -= h);
                                    for (c = 1, u = a[0]; u >= 10; u /= 10, c++);
                                    c < h && (t -= h - c);
                                }

                                return p.e = t, p.c = a, p;
                            }),

                        /**
                         * Sum multiple BigNumber instances.
                         * @returns {BigNumber} The sum.
                         */
                        q.sum = function () {
                            for (var e = 1, r = arguments, n = new q(r[0]); e < r.length;) {
                                n = n.plus(r[e++]);
                            }
                            return n;
                        },

                        /**
                         * Helper for base conversion.
                         * @returns {Function} The base conversion function.
                         */
                        t = function () {
                            /**
                             * Helper function for base conversion arithmetic.
                             */
                            function e(e, r, n, t) {
                                for (var i, o, u = [0], f = 0, s = e.length; f < s;) {
                                    for (o = u.length; o--; u[o] *= r);
                                    for (u[0] += t.indexOf(e.charAt(f++)), i = 0; i < u.length; i++) {
                                        u[i] > n - 1 && (null == u[i + 1] && (u[i + 1] = 0), u[i + 1] += u[i] / n | 0, u[i] %= n);
                                    }
                                }
                                return u.reverse();
                            }

                            /**
                             * The main base conversion function.
                             * @param {string} r - The number string in the source base.
                             * @param {number} t - The source base.
                             * @param {number} i - The target base.
                             * @param {number} o - The sign of the number.
                             * @param {boolean} u - Whether to use the default alphabet.
                             * @returns {string} The number string in the target base.
                             */
                            return function (r, t, i, o, u) {
                                var f, s, l, c, a, h, p, g, d = r.indexOf("."),
                                    w = M,
                                    m = B;

                                // Handle fractional part conversion.
                                for (d >= 0 && (c = F, F = 0, r = r.replace(".", ""), h = (g = new q(t)).pow(r.length - d), F = c, g.c = e(E(v(h.c), h.e, "0"), 10, i, "0123456789"), g.e = g.c.length), l = c = (p = e(r, t, i, u ? (f = k, "0123456789") : (f = "0123456789", k))).length; 0 == p[--c]; p.pop());

                                if (!p[0]) {
                                    return f.charAt(0);
                                }

                                if (d < 0 ? --l : (h.c = p, h.e = l, h.s = o, p = (h = n(h, g, w, m, i)).c, a = h.r, l = h.e), d = p[s = l + w + 1], c = i / 2, a = a || s < 0 || null != p[s + 1], a = m < 4 ? (null != d || a) && (0 == m || m == (h.s < 0 ? 3 : 2)) : d > c || d == c && (4 == m || a || 6 == m && 1 & p[s - 1] || m == (h.s < 0 ? 8 : 7)), s < 1 || !p[0]) {
                                    r = a ? E(f.charAt(1), -w, f.charAt(0)) : f.charAt(0);
                                } else {
                                    if (p.length = s, a) {
                                        for (--i; ++p[--s] > i;) {
                                            p[s] = 0, s || (++l, p = [1].concat(p));
                                        }
                                    }
                                    for (c = p.length; !p[--c];);
                                    for (d = 0, r = ""; d <= c; r += f.charAt(p[d++]));
                                    r = E(r, l, f.charAt(0));
                                }
                                return r;
                            };
                        }(),

                        /**
                         * Division function.
                         * @returns {Function} The division function.
                         */
                        n = function () {
                            /**
                             * Helper for multiplying a digit array by a number.
                             */
                            function e(e, r, n) {
                                var t, i, o, u, f = 0,
                                    s = e.length,
                                    l = r % d,
                                    c = r / d | 0;
                                for (e = e.slice(); s--;) {
                                    f = ((i = l * (o = e[s] % d) + (t = c * o + (u = e[s] / d | 0) * l) % d * d + f) / n | 0) + (t / d | 0) + c * u, e[s] = i % n;
                                }
                                return f && (e = [f].concat(e)), e;
                            }

                            /**
                             * Helper for comparing two digit arrays.
                             */
                            function r(e, r, n, t) {
                                var i, o;
                                if (n != t) {
                                    o = n > t ? 1 : -1;
                                } else {
                                    for (i = o = 0; i < n; i++) {
                                        if (e[i] != r[i]) {
                                            o = e[i] > r[i] ? 1 : -1;
                                            break;
                                        }
                                    }
                                }
                                return o;
                            }

                            /**
                             * Helper for subtracting one digit array from another.
                             */
                            function n(e, r, n, t) {
                                for (var i = 0; n--;) {
                                    e[n] -= i, i = e[n] < r[n] ? 1 : 0, e[n] = i * t + e[n] - r[n];
                                }
                                for (; !e[0] && e.length > 1; e.splice(0, 1));
                            }

                            /**
                             * The main division function.
                             * @param {BigNumber} t - The dividend.
                             * @param {BigNumber} i - The divisor.
                             * @param {number} o - The number of decimal places.
                             * @param {number} u - The rounding mode.
                             * @param {number} f - The base (internal use, typically `a`).
                             * @returns {BigNumber} The quotient.
                             */
                            return function (t, i, o, u, f) {
                                var l, c, p, g, d, w, v, b, y, O, N, E, A, S, _, x, P, R = t.s == i.s ? 1 : -1,
                                    D = t.c,
                                    M = i.c;

                                // Handle cases involving zero, NaN, or Infinity.
                                if (!(D && D[0] && M && M[0])) {
                                    return new q(t.s && i.s && (D ? !M || D[0] != M[0] : M) ? D && 0 == D[0] || !M ? 0 * R : R / 0 : NaN);
                                }

                                // Initialize quotient BigNumber.
                                for (y = (b = new q(R)).c = [], R = o + (c = t.e - i.e) + 1, f || (f = a, c = m(t.e / h) - m(i.e / h), R = R / h | 0), p = 0; M[p] == (D[p] || 0); p++);

                                // Adjust exponent and handle cases where divisor is larger than dividend.
                                if (M[p] > (D[p] || 0) && c--, R < 0) {
                                    y.push(1), g = !0;
                                } else {
                                    // Perform long division.
                                    for (S = D.length, x = M.length, p = 0, R += 2, (d = s(f / (M[0] + 1))) > 1 && (M = e(M, d, f), D = e(D, d, f), x = M.length, S = D.length), A = x, N = (O = D.slice(0, x)).length; N < x; O[N++] = 0);
                                    P = M.slice(), P = [0].concat(P), _ = M[0], M[1] >= f / 2 && _++;

                                    do {
                                        if (d = 0, (l = r(M, O, x, N)) < 0) {
                                            if (E = O[0], x != N && (E = E * f + (O[1] || 0)), (d = s(E / _)) > 1) {
                                                for (d >= f && (d = f - 1), v = (w = e(M, d, f)).length, N = O.length; 1 == r(w, O, v, N);) {
                                                    d--, n(w, x < v ? P : M, v, f), v = w.length, l = 1;
                                                }
                                            } else {
                                                0 == d && (l = d = 1), v = (w = M.slice()).length;
                                            }

                                            if (v < N && (w = [0].concat(w)), n(O, w, N, f), N = O.length, -1 == l) {
                                                for (; r(M, O, x, N) < 1;) {
                                                    d++, n(O, x < N ? P : M, N, f), N = O.length;
                                                }
                                            }
                                        } else {
                                            0 === l && (d++, O = [0]);
                                        }
                                        y[p++] = d, O[0] ? O[N++] = D[A] || 0 : (O = [D[A]], N = 1);
                                    } while ((A++ < S || null != O[0]) && R--);
                                    g = null != O[0], y[0] || y.splice(0, 1);
                                }

                                // Final normalization and rounding.
                                if (f == a) {
                                    for (p = 1, R = y[0]; R >= 10; R /= 10, p++);
                                    V(b, o + (b.e = p + c * h - 1) + 1, u, g);
                                } else {
                                    b.e = c, b.r = +g;
                                }
                                return b;
                            };
                        }(),

                        // Regular expressions for parsing various number formats.
                        A = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
                        S = /^([^.]+)\.$/,
                        _ = /^\.([^.]+)$/,
                        x = /^-?(Infinity|NaN)$/,
                        P = /^\s*\+(?=[\w.])|^\s+|\s+$/g,

                        /**
                         * Internal function to initialize a BigNumber with special values (NaN, Infinity).
                         * @param {BigNumber} e - The BigNumber instance.
                         * @param {string} r - The string value.
                         * @param {boolean} n - Whether the value was originally a number.
                         * @param {number} t - The base.
                         */
                        i = function (e, r, n, t) {
                            var i, o = n ? r : r.replace(P, "");

                            if (x.test(o)) {
                                e.s = isNaN(o) ? null : o < 0 ? -1 : 1;
                            } else {
                                if (!n && (o = o.replace(A, function (e, r, n) {
                                    return i = "x" == (n = n.toLowerCase()) ? 16 : "b" == n ? 2 : 8, t && t != i ? e : r;
                                })), t && (i = t, o = o.replace(S, "$1").replace(_, "0.$1")), r != o) {
                                    return new q(o, i);
                                }
                                if (q.DEBUG) {
                                    throw Error(l + "Not a" + (t ? " base " + t : "") + " number: " + r);
                                }
                                e.s = null;
                            }
                            e.c = e.e = null;
                        },

                        // BigNumber prototype methods.

                        /**
                         * Returns the absolute value of a BigNumber.
                         * @returns {BigNumber} The absolute value.
                         */
                        R.absoluteValue = R.abs = function () {
                            var e = new q(this);
                            return e.s < 0 && (e.s = 1), e;
                        },

                        /**
                         * Compares this BigNumber to `e`.
                         * @param {BigNumber|number|string} e - The value to compare with.
                         * @param {number} [r] - The base of `e`.
                         * @returns {number} -1 if less, 1 if greater, 0 if equal.
                         */
                        R.comparedTo = function (e, r) {
                            return b(this, new q(e, r));
                        },

                        /**
                         * Returns the number of decimal places.
                         * @param {number} [e] - The number of decimal places to round to.
                         * @param {number} [r] - The rounding mode.
                         * @returns {number|BigNumber} The number of decimal places or a new BigNumber.
                         */
                        R.decimalPlaces = R.dp = function (e, r) {
                            var n, t, i, o = this;
                            if (null != e) {
                                return y(e, 0, w), null == r ? r = B : y(r, 0, 8), V(new q(o), e + o.e + 1, r);
                            }
                            if (!(n = o.c)) {
                                return null;
                            }
                            if (t = ((i = n.length - 1) - m(this.e / h)) * h, i = n[i]) {
                                for (; i % 10 == 0; i /= 10, t--);
                            }
                            return t < 0 && (t = 0), t;
                        },

                        /**
                         * Divides this BigNumber by `e`.
                         * @param {BigNumber|number|string} e - The divisor.
                         * @param {number} [r] - The base of `e`.
                         * @returns {BigNumber} The quotient.
                         */
                        R.dividedBy = R.div = function (e, r) {
                            return n(this, new q(e, r), M, B);
                        },

                        /**
                         * Performs integer division.
                         * @param {BigNumber|number|string} e - The divisor.
                         * @param {number} [r] - The base of `e`.
                         * @returns {BigNumber} The integer quotient.
                         */
                        R.dividedToIntegerBy = R.idiv = function (e, r) {
                            return n(this, new q(e, r), 0, 1);
                        },

                        /**
                         * Raises this BigNumber to the power of `e`.
                         * @param {BigNumber|number|string} e - The exponent.
                         * @param {BigNumber|number|string} [r] - The modulus.
                         * @returns {BigNumber} The result.
                         */
                        R.exponentiatedBy = R.pow = function (e, r) {
                            var n, t, i, o, u, c, a, p, g = this;

                            // Exponent must be an integer.
                            if ((e = new q(e)).c && !e.isInteger()) {
                                throw Error(l + "Exponent not an integer: " + W(e));
                            }

                            if (null != r && (r = new q(r)), u = e.e > 14, !g.c || !g.c[0] || 1 == g.c[0] && !g.e && 1 == g.c.length || !e.c || !e.c[0]) {
                                return p = new q(Math.pow(+W(g), u ? 2 - O(e) : +W(e))), r ? p.mod(r) : p;
                            }

                            // Handle negative exponent.
                            if (c = e.s < 0, r) {
                                if (r.c ? !r.c[0] : !r.s) {
                                    return new q(NaN);
                                }
                                (t = !c && g.isInteger() && r.isInteger()) && (g = g.mod(r));
                            } else {
                                // Handle cases that lead to Infinity or 0.
                                if (e.e > 9 && (g.e > 0 || g.e < -1 || (0 == g.e ? g.c[0] > 1 || u && g.c[1] >= 24e7 : g.c[0] < 8e13 || u && g.c[0] <= 9999975e7))) {
                                    return o = g.s < 0 && O(e) ? -0 : 0, g.e > -1 && (o = 1 / o), new q(c ? 1 / o : o);
                                }
                                F && (o = f(F / h + 2));
                            }

                            // Binary exponentiation (exponentiation by squaring).
                            for (u ? (n = new q(.5), c && (e.s = 1), a = O(e)) : a = (i = Math.abs(+W(e))) % 2, p = new q(D);;) {
                                if (a) {
                                    if (!(p = p.times(g)).c) {
                                        break;
                                    }
                                    o ? p.c.length > o && (p.c.length = o) : t && (p = p.mod(r));
                                }
                                if (i) {
                                    if (0 === (i = s(i / 2))) {
                                        break;
                                    }
                                    a = i % 2;
                                } else if (V(e = e.times(n), e.e + 1, 1), e.e > 14) {
                                    a = O(e);
                                } else {
                                    if (0 == (i = +W(e))) {
                                        break;
                                    }
                                    a = i % 2;
                                }
                                g = g.times(g), o ? g.c && g.c.length > o && (g.c.length = o) : t && (g = g.mod(r));
                            }

                            return t ? p : (c && (p = D.div(p)), r ? p.mod(r) : o ? V(p, F, B, void 0) : p);
                        },

                        /**
                         * Returns the integer part of a BigNumber.
                         * @param {number} [e] - The rounding mode.
                         * @returns {BigNumber} The integer part.
                         */
                        R.integerValue = function (e) {
                            var r = new q(this);
                            return null == e ? e = B : y(e, 0, 8), V(r, r.e + 1, e);
                        },

                        /**
                         * Checks if this BigNumber is equal to `e`.
                         * @param {BigNumber|number|string} e - The value to compare with.
                         * @param {number} [r] - The base of `e`.
                         * @returns {boolean} True if equal, false otherwise.
                         */
                        R.isEqualTo = R.eq = function (e, r) {
                            return 0 === b(this, new q(e, r));
                        },

                        /**
                         * Checks if this BigNumber is a finite number.
                         * @returns {boolean} True if finite, false otherwise.
                         */
                        R.isFinite = function () {
                            return !!this.c;
                        },

                        /**
                         * Checks if this BigNumber is greater than `e`.
                         * @param {BigNumber|number|string} e - The value to compare with.
                         * @param {number} [r] - The base of `e`.
                         * @returns {boolean} True if greater, false otherwise.
                         */
                        R.isGreaterThan = R.gt = function (e, r) {
                            return b(this, new q(e, r)) > 0;
                        },

                        /**
                         * Checks if this BigNumber is greater than or equal to `e`.
                         * @param {BigNumber|number|string} e - The value to compare with.
                         * @param {number} [r] - The base of `e`.
                         * @returns {boolean} True if greater or equal, false otherwise.
                         */
                        R.isGreaterThanOrEqualTo = R.gte = function (e, r) {
                            return 1 === (r = b(this, new q(e, r))) || 0 === r;
                        },

                        /**
                         * Checks if this BigNumber is an integer.
                         * @returns {boolean} True if integer, false otherwise.
                         */
                        R.isInteger = function () {
                            return !!this.c && m(this.e / h) > this.c.length - 2;
                        },

                        /**
                         * Checks if this BigNumber is less than `e`.
                         * @param {BigNumber|number|string} e - The value to compare with.
                         * @param {number} [r] - The base of `e`.
                         * @returns {boolean} True if less, false otherwise.
                         */
                        R.isLessThan = R.lt = function (e, r) {
                            return b(this, new q(e, r)) < 0;
                        },

                        /**
                         * Checks if this BigNumber is less than or equal to `e`.
                         * @param {BigNumber|number|string} e - The value to compare with.
                         * @param {number} [r] - The base of `e`.
                         * @returns {boolean} True if less or equal, false otherwise.
                         */
                        R.isLessThanOrEqualTo = R.lte = function (e, r) {
                            return -1 === (r = b(this, new q(e, r))) || 0 === r;
                        },

                        /**
                         * Checks if this BigNumber is NaN.
                         * @returns {boolean} True if NaN, false otherwise.
                         */
                        R.isNaN = function () {
                            return !this.s;
                        },

                        /**
                         * Checks if this BigNumber is negative.
                         * @returns {boolean} True if negative, false otherwise.
                         */
                        R.isNegative = function () {
                            return this.s < 0;
                        },

                        /**
                         * Checks if this BigNumber is positive.
                         * @returns {boolean} True if positive, false otherwise.
                         */
                        R.isPositive = function () {
                            return this.s > 0;
                        },

                        /**
                         * Checks if this BigNumber is zero.
                         * @returns {boolean} True if zero, false otherwise.
                         */
                        R.isZero = function () {
                            return !!this.c && 0 == this.c[0];
                        },

                        /**
                         * Subtracts `e` from this BigNumber.
                         * @param {BigNumber|number|string} e - The value to subtract.
                         * @param {number} [r] - The base of `e`.
                         * @returns {BigNumber} The difference.
                         */
                        R.minus = function (e, r) {
                            var n, t, i, o, u = this,
                                f = u.s;

                            if (r = (e = new q(e, r)).s, !f || !r) {
                                return new q(NaN);
                            }

                            // If signs are different, convert to addition.
                            if (f != r) {
                                return e.s = -r, u.plus(e);
                            }

                            var s = u.e / h,
                                l = e.e / h,
                                c = u.c,
                                p = e.c;

                            // Handle cases with null coefficients or zero values.
                            if (!s || !l) {
                                if (!c || !p) {
                                    return c ? (e.s = -r, e) : new q(p ? u : NaN);
                                }
                                if (!c[0] || !p[0]) {
                                    return p[0] ? (e.s = -r, e) : new q(c[0] ? u : 3 == B ? -0 : 0);
                                }
                            }

                            if (s = m(s), l = m(l), c = c.slice(), f = s - l) {
                                // Align decimal points by padding with zeros.
                                for ((o = f < 0) ? (f = -f, i = c) : (l = s, i = p), i.reverse(), r = f; r--; i.push(0));
                                i.reverse();
                            } else {
                                // If exponents are same, compare digit groups to determine which is larger.
                                for (t = (o = (f = c.length) < (r = p.length)) ? f : r, f = r = 0; r < t; r++) {
                                    if (c[r] != p[r]) {
                                        o = c[r] < p[r];
                                        break;
                                    }
                                }
                            }

                            // If subtrahend is larger, swap and negate sign.
                            if (o && (i = c, c = p, p = i, e.s = -e.s), (r = (t = p.length) - (n = c.length)) > 0) {
                                for (; r--; c[n++] = 0);
                            }

                            // Perform subtraction digit by digit.
                            for (r = a - 1; t > f;) {
                                if (c[--t] < p[t]) {
                                    for (n = t; n && !c[--n]; c[n] = r);
                                    --c[n], c[t] += a;
                                }
                                c[t] -= p[t];
                            }

                            // Remove leading zeros.
                            for (; 0 == c[0]; c.splice(0, 1), --l);

                            return c[0] ? H(e, c, l) : (e.s = 3 == B ? -1 : 1, e.c = [e.e = 0], e);
                        },

                        /**
                         * Calculates the modulo of this BigNumber by `e`.
                         * @param {BigNumber|number|string} e - The modulus.
                         * @param {number} [r] - The base of `e`.
                         * @returns {BigNumber} The remainder.
                         */
                        R.modulo = R.mod = function (e, r) {
                            var t, i, o = this;

                            if (e = new q(e, r), !o.c || !e.s || e.c && !e.c[0]) {
                                return new q(NaN);
                            }
                            if (!e.c || o.c && !o.c[0]) {
                                return new q(o);
                            }

                            // Apply modulo mode.
                            return (9 == j ? (i = e.s, e.s = 1, t = n(o, e, 0, 3), e.s = i, t.s *= i) : t = n(o, e, 0, j), (e = o.minus(t.times(e))).c[0] || 1 != j || (e.s = o.s), e);
                        },

                        /**
                         * Multiplies this BigNumber by `e`.
                         * @param {BigNumber|number|string} e - The multiplier.
                         * @param {number} [r] - The base of `e`.
                         * @returns {BigNumber} The product.
                         */
                        R.multipliedBy = R.times = function (e, r) {
                            var n, t, i, o, u, f, s, l, c, p, g, w, v, b, y, O = this,
                                N = O.c,
                                E = (e = new q(e, r)).c;

                            // Handle cases involving zero, NaN, or Infinity.
                            if (!(N && E && N[0] && E[0])) {
                                return !O.s || !e.s || N && !N[0] && !E || E && !E[0] && !N ? e.c = e.e = e.s = null : (e.s *= O.s, N && E ? (e.c = [0], e.e = 0) : e.c = e.e = null), e;
                            }

                            // Calculate combined exponent.
                            for (t = m(O.e / h) + m(e.e / h), e.s *= O.s, (s = N.length) < (p = E.length) && (v = N, N = E, E = v, i = s, s = p, p = i), i = s + p, v = []; i--; v.push(0));

                            // Perform long multiplication.
                            for (b = a, y = d, i = p; --i >= 0;) {
                                for (n = 0, g = E[i] % y, w = E[i] / y | 0, o = i + (u = s); o > i;) {
                                    n = ((l = g * (l = N[--u] % y) + (f = w * l + (c = N[u] / y | 0) * g) % y * y + v[o] + n) / b | 0) + (f / y | 0) + w * c, v[o--] = l % b;
                                }
                                v[o] = n;
                            }

                            // Adjust exponent and normalize.
                            return n ? ++t : v.splice(0, 1), H(e, v, t);
                        },

                        /**
                         * Returns a BigNumber with the sign negated.
                         * @returns {BigNumber} The negated BigNumber.
                         */
                        R.negated = function () {
                            var e = new q(this);
                            return e.s = -e.s || null, e;
                        },

                        /**
                         * Adds `e` to this BigNumber.
                         * @param {BigNumber|number|string} e - The value to add.
                         * @param {number} [r] - The base of `e`.
                         * @returns {BigNumber} The sum.
                         */
                        R.plus = function (e, r) {
                            var n, t = this,
                                i = t.s;

                            if (r = (e = new q(e, r)).s, !i || !r) {
                                return new q(NaN);
                            }

                            // If signs are different, convert to subtraction.
                            if (i != r) {
                                return e.s = -r, t.minus(e);
                            }

                            var o = t.e / h,
                                u = e.e / h,
                                f = t.c,
                                s = e.c;

                            // Handle cases with null coefficients or zero values.
                            if (!o || !u) {
                                if (!f || !s) {
                                    return new q(i / 0);
                                }
                                if (!f[0] || !s[0]) {
                                    return s[0] ? e : new q(f[0] ? t : 0 * i);
                                }
                            }

                            // Align decimal points.
                            if (o = m(o), u = m(u), f = f.slice(), i = o - u) {
                                for (i > 0 ? (u = o, n = s) : (i = -i, n = f), n.reverse(); i--; n.push(0));
                                n.reverse();
                            }

                            // Perform addition digit by digit.
                            for ((i = f.length) - (r = s.length) < 0 && (n = s, s = f, f = n, r = i), i = 0; r;) {
                                i = (f[--r] = f[r] + s[r] + i) / a | 0, f[r] = a === f[r] ? 0 : f[r] % a;
                            }

                            // Handle carry-over and normalize.
                            return i && (f = [i].concat(f), ++u), H(e, f, u);
                        },

                        /**
                         * Returns the precision (number of significant digits).
                         * @param {boolean|number} [e] - If true, include trailing zeros. If number, round to that precision.
                         * @param {number} [r] - Rounding mode if `e` is a number.
                         * @returns {number|BigNumber} The precision or a new BigNumber.
                         */
                        R.precision = R.sd = function (e, r) {
                            var n, t, i, o = this;
                            if (null != e && e !== !!e) {
                                return y(e, 1, w), null == r ? r = B : y(r, 0, 8), V(new q(o), e, r);
                            }
                            if (!(n = o.c)) {
                                return null;
                            }
                            if (t = (i = n.length - 1) * h + 1, i = n[i]) {
                                for (; i % 10 == 0; i /= 10, t--);
                                for (i = n[0]; i >= 10; i /= 10, t++);
                            }
                            return e && o.e + 1 > t && (t = o.e + 1), t;
                        },

                        /**
                         * Shifts the decimal point by `e` places.
                         * @param {number} e - The number of places to shift.
                         * @returns {BigNumber} The shifted BigNumber.
                         */
                        R.shiftedBy = function (e) {
                            return y(e, -p, p), this.times("1e" + e);
                        },

                        /**
                         * Calculates the square root of this BigNumber.
                         * @returns {BigNumber} The square root.
                         */
                        R.squareRoot = R.sqrt = function () {
                            var e, r, t, i, o, u = this,
                                f = u.c,
                                s = u.s,
                                l = u.e,
                                c = M + 4,
                                a = new q("0.5");

                            // Handle special cases (negative, zero, NaN, Infinity).
                            if (1 !== s || !f || !f[0]) {
                                return new q(!s || s < 0 && (!f || f[0]) ? NaN : f ? u : 1 / 0);
                            }

                            // Estimate square root using native Math.sqrt.
                            if (0 == (s = Math.sqrt(+W(u))) || s == 1 / 0) {
                                (((r = v(f)).length + l) % 2 == 0 && (r += "0"), s = Math.sqrt(+r), l = m((l + 1) / 2) - (l < 0 || l % 2), t = new q(r = s == 1 / 0 ? "1e" + l : (r = s.toExponential()).slice(0, r.indexOf("e") + 1) + l));
                            } else {
                                t = new q(s + "");
                            }

                            // Refine the square root using Newton's method.
                            if (t.c[0]) {
                                for ((s = (l = t.e) + c) < 3 && (s = 0);;) {
                                    if (o = t, t = a.times(o.plus(n(u, o, c, 1))), v(o.c).slice(0, s) === (r = v(t.c)).slice(0, s)) {
                                        if (t.e < l && --s, "9999" != (r = r.slice(s - 3, s + 1)) && (i || "4999" != r)) {
                                            +r && (+r.slice(1) || "5" != r.charAt(0)) || (V(t, t.e + M + 2, 1), e = !t.times(t).eq(u));
                                            break;
                                        }
                                        if (!i && (V(o, o.e + M + 2, 0), o.times(o).eq(u))) {
                                            t = o;
                                            break;
                                        }
                                        c += 4, s += 4, i = 1;
                                    }
                                }
                            }

                            return V(t, t.e + M + 1, B, e);
                        },

                        /**
                         * Returns a string in exponential notation.
                         * @param {number} [e] - Number of decimal places.
                         * @param {number} [r] - Rounding mode.
                         * @returns {string} The exponential string.
                         */
                        R.toExponential = function (e, r) {
                            return null != e && (y(e, 0, w), e++), $(this, e, r, 1);
                        },

                        /**
                         * Returns a string in fixed-point notation.
                         * @param {number} [e] - Number of decimal places.
                         * @param {number} [r] - Rounding mode.
                         * @returns {string} The fixed-point string.
                         */
                        R.toFixed = function (e, r) {
                            return null != e && (y(e, 0, w), e = e + this.e + 1), $(this, e, r);
                        },

                        /**
                         * Formats a BigNumber using a format object.
                         * @param {object} [e] - Format object or number of decimal places.
                         * @param {number} [r] - Rounding mode.
                         * @param {object} [n] - Format object.
                         * @returns {string} The formatted string.
                         */
                        R.toFormat = function (e, r, n) {
                            var t, i = this;

                            if (null == n) {
                                null != e && r && "object" == typeof r ? (n = r, r = null) : e && "object" == typeof e ? (n = e, e = r = null) : n = G;
                            } else if ("object" != typeof n) {
                                throw Error(l + "Argument not an object: " + n);
                            }

                            if (t = i.toFixed(e, r), i.c) {
                                var o, u = t.split("."),
                                    f = +n.groupSize,
                                    s = +n.secondaryGroupSize,
                                    c = n.groupSeparator || "",
                                    a = u[0],
                                    h = u[1],
                                    p = i.s < 0,
                                    g = p ? a.slice(1) : a,
                                    d = g.length;

                                if (s && (o = f, f = s, s = o, d -= o), f > 0 && d > 0) {
                                    for (o = d % f || f, a = g.substr(0, o); o < d; o += f) {
                                        a += c + g.substr(o, f);
                                    }
                                    s > 0 && (a += c + g.slice(o)), p && (a = "-" + a);
                                }
                                t = h ? a + (n.decimalSeparator || "") + ((s = +n.fractionGroupSize) ? h.replace(new RegExp("\\d{" + s + "}\\B", "g"), "$&" + (n.fractionGroupSeparator || "")) : h) : a;
                            }

                            return (n.prefix || "") + t + (n.suffix || "");
                        },

                        /**
                         * Returns a common fraction string representation.
                         * @param {BigNumber|number|string} [e] - The maximum denominator.
                         * @returns {Array<BigNumber>} An array [numerator, denominator].
                         */
                        R.toFraction = function (e) {
                            var r, t, i, o, u, f, s, c, a, p, d, w, m = this,
                                b = m.c;

                            // Validate argument.
                            if (null != e && (!(s = new q(e)).isInteger() && (s.c || 1 !== s.s) || s.lt(D))) {
                                throw Error(l + "Argument " + (s.isInteger() ? "out of range: " : "not an integer: ") + W(s));
                            }

                            // Handle special cases (NaN, Infinity, Zero).
                            if (!b) {
                                return new q(m);
                            }

                            // Initialize continued fraction variables.
                            for (r = new q(D), a = t = new q(D), i = c = new q(D), w = v(b), u = r.e = w.length - m.e - 1, r.c[0] = g[(f = u % h) < 0 ? h + f : f], e = !e || s.comparedTo(r) > 0 ? u > 0 ? r : a : s, f = I, I = 1 / 0, s = new q(w), c.c[0] = 0; p = n(s, r, 0, 1), 1 != (o = t.plus(p.times(i))).comparedTo(e);) {
                                t = i, i = o, a = c.plus(p.times(o = a)), c = o, r = s.minus(p.times(o = r)), s = o;
                            }

                            // Select the best approximation.
                            return o = n(e.minus(t), i, 0, 1), c = c.plus(o.times(a)), t = t.plus(o.times(i)), c.s = a.s = m.s, d = n(a, i, u *= 2, B).minus(m).abs().comparedTo(n(c, t, u, B).minus(m).abs()) < 1 ? [a, i] : [c, t], I = f, d;
                        },

                        /**
                         * Converts a BigNumber to a primitive number.
                         * @returns {number} The numeric value.
                         */
                        R.toNumber = function () {
                            return +W(this);
                        },

                        /**
                         * Returns a string in precision notation.
                         * @param {number} [e] - Number of significant digits.
                         * @param {number} [r] - Rounding mode.
                         * @returns {string} The precision string.
                         */
                        R.toPrecision = function (e, r) {
                            return null != e && y(e, 1, w), $(this, e, r, 2);
                        },

                        /**
                         * Returns the string representation of the BigNumber.
                         * @param {number} [e] - The base for the output string.
                         * @returns {string} The string representation.
                         */
                        R.toString = function (e) {
                            var r, n = this,
                                i = n.s,
                                o = n.e;

                            if (null === o) {
                                return i ? (r = "Infinity", i < 0 && (r = "-" + r)) : r = "NaN", r;
                            }

                            if (null == e) {
                                r = o <= L || o >= T ? N(v(n.c), o) : E(v(n.c), o, "0");
                            } else if (10 === e) {
                                r = E(v((n = V(new q(n), M + o + 1, B)).c), n.e, "0");
                            } else {
                                y(e, 2, k.length, "Base"), r = t(E(v(n.c), o, "0"), 10, e, i, !0);
                            }

                            return i < 0 && n.c[0] && (r = "-" + r), r;
                        },

                        /**
                         * Alias for `toString()` (used by `JSON.stringify`).
                         * @returns {string} The string representation.
                         */
                        R.valueOf = R.toJSON = function () {
                            return W(this);
                        },

                        // Internal flag to identify BigNumber instances.
                        R._isBigNumber = !0,

                        // Apply initial configuration if provided.
                        null != r && q.set(r),
                        q;
                }()).default = o.BigNumber = o,

                // UMD export.
                void 0 === (t = function () {
                    return o;
                }.call(r, n, r, e)) || (e.exports = t);
            }();
        },

        /**
         * Module 3: Node.js 'fs' (file system) module.
         * This module simply exports the native 'fs' module.
         * @param {object} e - Module object.
         * @param {object} r - Module exports.
         */
        function (e, r) {
            e.exports = require("fs");
        }
    ]
);