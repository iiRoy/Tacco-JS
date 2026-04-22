/******/ /* This is the webpack runtime boilerplate initialization. */
/******/ (function (modules) {
/******/     // The module cache stores all loaded modules.
/******/     var installedModules = {};
/******/
/******/    // This is the primary function to require a module.
/******/    function __webpack_require__(moduleId) {
/******/
/******/        // Check if the module is already in the cache.
/******/        if (installedModules[moduleId]) {
/******/            return installedModules[moduleId].exports;
/******/        }
/******/        // Create a new module (and place it into the cache).
/******/        var module = installedModules[moduleId] = {
/******/            i: moduleId,      // The ID of the module.
/******/            l: false,         // Flag indicating if the module has been loaded.
/******/            exports: {}       // The exports object for the module.
/******/        };
/******/
/******/        // Execute the module function, passing in module, exports, and require.
/******/        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/        // Mark the module as loaded after execution.
/******/        module.l = true;
/******/
/******/        // Return the exports of the module.
/******/        return module.exports;
/******/    }
/******/
/******/
/******/    // Expose the 'modules' object on the require function.
/******/    __webpack_require__.m = modules;
/******/
/******/    // Expose the 'installedModules' cache on the require function.
/******/    __webpack_require__.c = installedModules;
/******/
/******/    // Define a getter function for harmony exports (ES modules compatibility).
/******/    __webpack_require__.d = function(exports, name, getter) {
/******/        // If the property doesn't already exist on exports, define it.
/******/        if (!__webpack_require__.o(exports, name)) {
/******/            Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/        }
/******/    };
/******/
/******/    // Define the __esModule property on exports for ES modules.
/******/    __webpack_require__.r = function(exports) {
/******/        // Add Symbol.toStringTag for better module identification.
/******/        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/        }
/******/        // Set the __esModule flag to true.
/******/        Object.defineProperty(exports, '__esModule', { value: true });
/******/    };
/******/
/******/    // Create a fake namespace object for module interoperability.
/******/    // Bitmask `mode` indicates how to handle the `value`:
/******/    // 1: value is a module ID, `require` it.
/******/    // 2: merge all properties of `value` into the namespace.
/******/    // 4: return `value` directly if it's already a namespace object.
/******/    // 8|1: behave like `require` (implies 1).
/******/    __webpack_require__.t = function(value, mode) {
/******/        if (mode & 1) value = __webpack_require__(value);
/******/        if (mode & 8) return value;
/******/        if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/        var ns = Object.create(null);
/******/        __webpack_require__.r(ns); // Mark as ES module.
/******/        Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/        if (mode & 2 && typeof value != 'string') {
/******/            for (var key in value) {
/******/                __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));
/******/            }
/******/        }
/******/        return ns;
/******/    };
/******/
/******/    // Get default export function for compatibility with non-harmony modules.
/******/    __webpack_require__.n = function(module) {
/******/        var getter = module && module.__esModule ?
/******/            function getDefault() { return module['default']; } : // If ES module, return default.
/******/            function getModuleExports() { return module; };      // Otherwise, return module itself.
/******/        __webpack_require__.d(getter, 'a', getter); // Expose as property 'a'.
/******/        return getter;
/******/    };
/******/
/******/    // Object.prototype.hasOwnProperty.call wrapper for convenience.
/******/    __webpack_require__.o = function(object, property) {
/******/        return Object.prototype.hasOwnProperty.call(object, property);
/******/    };
/******/
/******/    // Set the public path for assets.
/******/    __webpack_require__.p = "";
/******/
/******/
/******/    // Load the entry module and return its exports.
/******/    return __webpack_require__(__webpack_require__.s = "./src/ABC152/D.js");
/******/ })
/************************************************************************************************************************************************/
/******/ ({

/***/ "./node_modules/big-integer/BigInteger.js":
/*!************************************************************************************************************************************************!*\
  !*** ./node_modules/big-integer/BigInteger.js                                                                                                 ***!
  \************************************************************************************************************************************************/
/* This module defines the BigInteger library. No static exports are declared here. */
/***/ (function (module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(module) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    var bigInt = (function (undefined) {
        \"use strict\"; // Enforces stricter parsing and error handling.

        // Constants used throughout the library.
        var BASE = 1e7, /* The base for internal numerical representation (10^7). */
            LOG_BASE = 7, /* The logarithm (base 10) of BASE. */
            MAX_INT = 9007199254740992, /* JavaScript's maximum safe integer (2^53 - 1). */
            MAX_INT_ARR = smallToArray(MAX_INT), /* MAX_INT converted to the internal array format. */
            DEFAULT_ALPHABET = \"0123456789abcdefghijklmnopqrstuvwxyz\"; /* Default characters for base conversions. */

        // Feature detection for native BigInt support in the environment.
        var supportsNativeBigInt = typeof BigInt === \"function\";

        /**
         * The main constructor for BigInteger objects.
         * It acts as a factory, returning an appropriate type (SmallInteger, BigInteger, NativeBigInt).
         * @param {*} v - The value to convert into a BigInteger.
         * @param {number} [radix] - The base for parsing `v` if it's a string.
         * @param {string} [alphabet] - Custom alphabet for parsing non-decimal strings.
         * @param {boolean} [caseSensitive] - Flag for case-sensitive alphabet parsing.
         * @returns {Integer} A BigInteger-like object.
         */
        function Integer(v, radix, alphabet, caseSensitive) {
            if (typeof v === \"undefined\") return Integer[0]; // Default to zero if no value is provided.
            if (typeof radix !== \"undefined\") {
                // If a radix is specified, use parseBase or parseValue.
                return (+radix === 10 && !alphabet) ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
            }
            return parseValue(v); // Otherwise, attempt to parse the value directly.
        }

        /**
         * Represents a large integer that exceeds JavaScript's safe integer limit.
         * Internally, it's an array of digits, where each digit is base `BASE`.
         * @param {number[]} value - An array of digits representing the number.
         * @param {boolean} sign - True if the number is negative, false otherwise.
         */
        function BigInteger(value, sign) {
            this.value = value;
            this.sign = sign;
            this.isSmall = false; // Indicates this is a "large" BigInteger.
        }
        // Inherit methods from the base Integer prototype.
        BigInteger.prototype = Object.create(Integer.prototype);

        /**
         * Represents an integer that fits within JavaScript's safe integer range.
         * This provides performance benefits by using native number operations.
         * @param {number} value - The numerical value.
         */
        function SmallInteger(value) {
            this.value = value;
            this.sign = value < 0; // Determine sign based on the number's value.
            this.isSmall = true;  // Indicates this is a "small" BigInteger.
        }
        // Inherit methods from the base Integer prototype.
        SmallInteger.prototype = Object.create(Integer.prototype);

        /**
         * A wrapper for JavaScript's native `BigInt` type.
         * Used when `BigInt` support is detected, leveraging its built-in arithmetic.
         * @param {BigInt} value - The native BigInt value.
         */
        function NativeBigInt(value) {
            this.value = value;
        }
        // Inherit methods from the base Integer prototype.
        NativeBigInt.prototype = Object.create(Integer.prototype);

        /**
         * Checks if a given number can be precisely represented by JavaScript's standard `number` type.
         * @param {number} n - The number to check.
         * @returns {boolean} True if the number is within the safe integer range, false otherwise.
         */
        function isPrecise(n) {
            return -MAX_INT < n && n < MAX_INT;
        }

        /**
         * Converts a small JavaScript number into an array of digits (base `BASE`).
         * This function is optimized for `BASE = 1e7`.
         * @param {number} n - The number to convert.
         * @returns {number[]} An array of digits.
         */
        function smallToArray(n) {
            if (n < 1e7)
                return [n];
            if (n < 1e14)
                return [n % 1e7, Math.floor(n / 1e7)];
            return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
        }

        /**
         * Converts an array of digits (base `BASE`) back into a small JavaScript number if possible.
         * If the number is too large, it returns the array itself.
         * @param {number[]} arr - The array of digits.
         * @returns {number|number[]} The converted small number, or the original array.
         */
        function arrayToSmall(arr) {
            trim(arr); // Remove any leading zeros.
            var length = arr.length;
            if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
                switch (length) {
                    case 0: return 0;
                    case 1: return arr[0];
                    case 2: return arr[0] + arr[1] * BASE;
                    default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
                }
            }
            return arr; // Return the array if it's still a large number.
        }

        /**
         * Removes leading zero digits from an array representation of a number.
         * This ensures canonical form and prevents unnecessary computations.
         * @param {number[]} v - The digit array to trim.
         */
        function trim(v) {
            var i = v.length;
            while (v[--i] === 0 && i >= 0); // Find the highest non-zero digit.
            v.length = i + 1; // Adjust the array's length.
        }

        /**
         * Creates a new array of a specified `length`, initialized with zeros.
         * @param {number} length - The desired length of the array.
         * @returns {number[]} The new zero-filled array.
         */
        function createArray(length) {
            var x = new Array(length);
            var i = -1;
            while (++i < length) {
                x[i] = 0; // Initialize each element to zero.
            }
            return x;
        }

        /**
         * Truncates a number towards zero (removes its fractional part).
         * @param {number} n - The number to truncate.
         * @returns {number} The integer part of `n`.
         */
        function truncate(n) {
            if (n > 0) return Math.floor(n);
            return Math.ceil(n);
        }

        /**
         * Adds two digit arrays, `a` and `b`. Assumes `a.length >= b.length`.
         * Performs addition digit by digit with carry propagation.
         * @param {number[]} a - The first digit array (minuend).
         * @param {number[]} b - The second digit array (subtrahend).
         * @returns {number[]} A new array representing the sum.
         */
        function add(a, b) {
            var l_a = a.length,
                l_b = b.length,
                r = new Array(l_a), // Result array, sized to the longer input.
                carry = 0,
                base = BASE,
                sum, i;
            for (i = 0; i < l_b; i++) {
                sum = a[i] + b[i] + carry;
                carry = sum >= base ? 1 : 0; // Calculate carry.
                r[i] = sum - carry * base;   // Store current digit.
            }
            while (i < l_a) {
                sum = a[i] + carry;
                carry = sum === base ? 1 : 0;
                r[i++] = sum - carry * base;
            }
            if (carry > 0) r.push(carry); // Add any final carry.
            return r;
        }

        /**
         * Adds two digit arrays, handling cases where their lengths differ.
         * Ensures the longer array is passed as the first argument to `add`.
         * @param {number[]} a - The first digit array.
         * @param {number[]} b - The second digit array.
         * @returns {number[]} A new array representing the sum.
         */
        function addAny(a, b) {
            if (a.length >= b.length) return add(a, b);
            return add(b, a); // Swap if 'b' is longer.
        }

        /**
         * Adds a small number (carry) to a digit array.
         * This is optimized for adding a single carry value to a large number.
         * @param {number[]} a - The digit array.
         * @param {number} carry - The small number (0 <= carry < MAX_INT) to add.
         * @returns {number[]} The resulting digit array.
         */
        function addSmall(a, carry) {
            var l = a.length,
                r = new Array(l),
                base = BASE,
                sum, i;
            for (i = 0; i < l; i++) {
                sum = a[i] - base + carry; // Compute sum and adjust for carry.
                carry = Math.floor(sum / base);
                r[i] = sum - carry * base;
                carry += 1; // Increment carry for next iteration if needed.
            }
            while (carry > 0) {
                r[i++] = carry % base;
                carry = Math.floor(carry / base);
            }
            return r;
        }

        // BigInteger prototype method for addition.
        BigInteger.prototype.add = function (v) {
            var n = parseValue(v); // Convert input to an Integer instance.
            if (this.sign !== n.sign) {
                return this.subtract(n.negate()); // If signs differ, perform subtraction of negated value.
            }
            var a = this.value, b = n.value;
            if (n.isSmall) {
                return new BigInteger(addSmall(a, Math.abs(b)), this.sign); // Optimized for adding a small number.
            }
            return new BigInteger(addAny(a, b), this.sign); // Add two large numbers.
        };
        BigInteger.prototype.plus = BigInteger.prototype.add; // Alias for add.

        // SmallInteger prototype method for addition.
        SmallInteger.prototype.add = function (v) {
            var n = parseValue(v);
            var a = this.value;
            if (a < 0 !== n.sign) {
                return this.subtract(n.negate()); // If signs differ, subtract.
            }
            var b = n.value;
            if (n.isSmall) {
                if (isPrecise(a + b)) return new SmallInteger(a + b); // If result is still small and precise.
                b = smallToArray(Math.abs(b)); // Convert small 'b' to array for mixed-type addition.
            }
            return new BigInteger(addSmall(b, Math.abs(a)), a < 0); // Promote to BigInteger for larger results.
        };
        SmallInteger.prototype.plus = SmallInteger.prototype.add; // Alias for add.

        // NativeBigInt prototype method for addition (uses native `+` operator).
        NativeBigInt.prototype.add = function (v) {
            return new NativeBigInt(this.value + parseValue(v).value);
        };
        NativeBigInt.prototype.plus = NativeBigInt.prototype.add; // Alias for add.

        /**
         * Subtracts digit array `b` from `a`. Assumes `a >= b` (absolute values).
         * Performs subtraction digit by digit with borrow propagation.
         * @param {number[]} a - The minuend (first number).
         * @param {number[]} b - The subtrahend (second number).
         * @returns {number[]} A new array representing the difference.
         */
        function subtract(a, b) {
            var a_l = a.length,
                b_l = b.length,
                r = new Array(a_l),
                borrow = 0,
                base = BASE,
                i, difference;
            for (i = 0; i < b_l; i++) {
                difference = a[i] - borrow - b[i];
                if (difference < 0) {
                    difference += base;
                    borrow = 1;
                } else borrow = 0;
                r[i] = difference;
            }
            for (i = b_l; i < a_l; i++) {
                difference = a[i] - borrow;
                if (difference < 0) difference += base;
                else {
                    r[i++] = difference;
                    break;
                }
                r[i] = difference;
            }
            for (; i < a_l; i++) {
                r[i] = a[i]; // Copy remaining digits if no more borrow.
            }
            trim(r); // Remove leading zeros from the result.
            return r;
        }

        /**
         * Subtracts two numbers represented as digit arrays, handling signs and magnitude comparison.
         * @param {number[]} a - First number's digits.
         * @param {number[]} b - Second number's digits.
         * @param {boolean} sign - The expected sign of the result if `a >= b`.
         * @returns {BigInteger|SmallInteger} The result of the subtraction.
         */
        function subtractAny(a, b, sign) {
            var value;
            if (compareAbs(a, b) >= 0) {
                value = subtract(a, b); // If |a| >= |b|, compute a - b.
            } else {
                value = subtract(b, a); // If |b| > |a|, compute b - a and flip the sign.
                sign = !sign;
            }
            value = arrayToSmall(value); // Attempt to convert to a SmallInteger.
            if (typeof value === \"number\") {
                if (sign) value = -value;
                return new SmallInteger(value);
            }
            return new BigInteger(value, sign);
        }

        /**
         * Subtracts a small number `b` from a digit array `a`.
         * @param {number[]} a - The digit array (minuend).
         * @param {number} b - The small number (absolute value) to subtract.
         * @param {boolean} sign - The sign of the original BigInteger.
         * @returns {BigInteger|SmallInteger} The result of the subtraction.
         */
        function subtractSmall(a, b, sign) {
            var l = a.length,
                r = new Array(l),
                carry = -b, // Initial carry is negative 'b'.
                base = BASE,
                i, difference;
            for (i = 0; i < l; i++) {
                difference = a[i] + carry;
                carry = Math.floor(difference / base);
                difference %= base;
                r[i] = difference < 0 ? difference + base : difference; // Adjust if digit becomes negative.
            }
            r = arrayToSmall(r);
            if (typeof r === \"number\") {
                if (sign) r = -r;
                return new SmallInteger(r);
            } return new BigInteger(r, sign);
        }

        // BigInteger prototype method for subtraction.
        BigInteger.prototype.subtract = function (v) {
            var n = parseValue(v);
            if (this.sign !== n.sign) {
                return this.add(n.negate()); // If signs differ, add the negated value.
            }
            var a = this.value, b = n.value;
            if (n.isSmall)
                return subtractSmall(a, Math.abs(b), this.sign); // Optimized for subtracting a small number.
            return subtractAny(a, b, this.sign); // Subtract two large numbers.
        };
        BigInteger.prototype.minus = BigInteger.prototype.subtract; // Alias for subtract.

        // SmallInteger prototype method for subtraction.
        SmallInteger.prototype.subtract = function (v) {
            var n = parseValue(v);
            var a = this.value;
            if (a < 0 !== n.sign) {
                return this.add(n.negate()); // If signs differ, add negated value.
            }
            var b = n.value;
            if (n.isSmall) {
                return new SmallInteger(a - b); // Direct subtraction if both are small.
            }
            return subtractSmall(b, Math.abs(a), a >= 0); // Promote to BigInteger for larger results.
        };
        SmallInteger.prototype.minus = SmallInteger.prototype.subtract; // Alias for subtract.

        // NativeBigInt prototype method for subtraction (uses native `-` operator).
        NativeBigInt.prototype.subtract = function (v) {
            return new NativeBigInt(this.value - parseValue(v).value);
        };
        NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract; // Alias for subtract.

        // BigInteger prototype method to negate the number (flip its sign).
        BigInteger.prototype.negate = function () {
            return new BigInteger(this.value, !this.sign);
        };
        // SmallInteger prototype method to negate the number.
        SmallInteger.prototype.negate = function () {
            var sign = this.sign;
            var small = new SmallInteger(-this.value);
            small.sign = !sign; // Ensure the sign is correctly flipped.
            return small;
        };
        // NativeBigInt prototype method to negate the number.
        NativeBigInt.prototype.negate = function () {
            return new NativeBigInt(-this.value);
        };

        // BigInteger prototype method to get the absolute value.
        BigInteger.prototype.abs = function () {
            return new BigInteger(this.value, false); // Always positive sign.
        };
        // SmallInteger prototype method to get the absolute value.
        SmallInteger.prototype.abs = function () {
            return new SmallInteger(Math.abs(this.value));
        };
        // NativeBigInt prototype method to get the absolute value.
        NativeBigInt.prototype.abs = function () {
            return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
        };


        /**
         * Performs long multiplication of two digit arrays.
         * @param {number[]} a - The first multiplier.
         * @param {number[]} b - The second multiplier.
         * @returns {number[]} A new array representing the product.
         */
        function multiplyLong(a, b) {
            var a_l = a.length,
                b_l = b.length,
                l = a_l + b_l,
                r = createArray(l), // Result array, max length is sum of input lengths.
                base = BASE,
                product, carry, i, a_i, b_j;
            for (i = 0; i < a_l; ++i) {
                a_i = a[i];
                carry = 0; // Reset carry for each digit of 'a'.
                for (var j = 0; j < b_l; ++j) {
                    b_j = b[j];
                    product = a_i * b_j + r[i + j] + carry;
                    carry = Math.floor(product / base);
                    r[i + j] = product - carry * base;
                }
                r[i + b_l] += carry; // Add remaining carry to the next position.
            }
            trim(r); // Remove any leading zeros from the product.
            return r;
        }

        /**
         * Multiplies a digit array by a small number.
         * @param {number[]} a - The digit array.
         * @param {number} b - The small number (absolute value) to multiply by.
         * @returns {number[]} A new array representing the product.
         */
        function multiplySmall(a, b) {
            var l = a.length,
                r = new Array(l),
                base = BASE,
                carry = 0,
                product, i;
            for (i = 0; i < l; i++) {
                product = a[i] * b + carry;
                carry = Math.floor(product / base);
                r[i] = product - carry * base;
            }
            while (carry > 0) {
                r[i++] = carry % base;
                carry = Math.floor(carry / base);
            }
            return r;
        }

        /**
         * Shifts a digit array left by appending zeros.
         * This is equivalent to multiplying by a power of `BASE`.
         * @param {number[]} x - The digit array to shift.
         * @param {number} n - The number of zeros to append.
         * @returns {number[]} The shifted array.
         */
        function shiftLeft(x, n) {
            var r = [];
            while (n-- > 0) r.push(0); // Append 'n' zeros.
            return r.concat(x); // Concatenate with the original array.
        }

        /**
         * Implements Karatsuba multiplication, an efficient algorithm for multiplying large numbers.
         * It recursively divides the numbers into halves and combines the results.
         * @param {number[]} x - The first digit array.
         * @param {number[]} y - The second digit array.
         * @returns {number[]} The product as a digit array.
         */
        function multiplyKaratsuba(x, y) {
            var n = Math.max(x.length, y.length);

            if (n <= 30) return multiplyLong(x, y); // Fallback to long multiplication for small inputs.
            n = Math.ceil(n / 2); // Split point for Karatsuba.

            var b = x.slice(n), // High part of x.
                a = x.slice(0, n), // Low part of x.
                d = y.slice(n), // High part of y.
                c = y.slice(0, n); // Low part of y.

            // Recursive calls for sub-products.
            var ac = multiplyKaratsuba(a, c),
                bd = multiplyKaratsuba(b, d),
                abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

            // Combine the sub-products according to Karatsuba's formula.
            var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
            trim(product); // Clean up any leading zeros.
            return product;
        }

        /**
         * Heuristic function to determine if Karatsuba multiplication is faster than long multiplication.
         * @param {number} l1 - Length of the first number.
         * @param {number} l2 - Length of the second number.
         * @returns {boolean} True if Karatsuba is likely faster, false otherwise.
         */
        function useKaratsuba(l1, l2) {
            return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
        }

        // BigInteger prototype method for multiplication.
        BigInteger.prototype.multiply = function (v) {
            var n = parseValue(v),
                a = this.value, b = n.value,
                sign = this.sign !== n.sign, // Determine the sign of the product.
                abs;
            if (n.isSmall) {
                // Handle multiplication by a small integer.
                if (b === 0) return Integer[0];
                if (b === 1) return this;
                if (b === -1) return this.negate();
                abs = Math.abs(b);
                if (abs < BASE) {
                    return new BigInteger(multiplySmall(a, abs), sign); // Optimized for very small multipliers.
                }
                b = smallToArray(abs); // Convert small 'b' to array if larger than BASE.
            }
            if (useKaratsuba(a.length, b.length)) // Use Karatsuba if it's more efficient for these lengths.
                return new BigInteger(multiplyKaratsuba(a, b), sign);
            return new BigInteger(multiplyLong(a, b), sign); // Otherwise, use standard long multiplication.
        };

        BigInteger.prototype.times = BigInteger.prototype.multiply; // Alias for multiply.

        /**
         * Multiplies a small number by a digit array.
         * @param {number} a - The small number (multiplier).
         * @param {number[]} b - The digit array (multiplicand).
         * @param {boolean} sign - The sign of the result.
         * @returns {BigInteger} The product.
         */
        function multiplySmallAndArray(a, b, sign) {
            if (a < BASE) {
                return new BigInteger(multiplySmall(b, a), sign);
            }
            return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
        }
        SmallInteger.prototype._multiplyBySmall = function (a) {
            if (isPrecise(a.value * this.value)) {
                return new SmallInteger(a.value * this.value);
            }
            return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
        };
        BigInteger.prototype._multiplyBySmall = function (a) {
            if (a.value === 0) return Integer[0];
            if (a.value === 1) return this;
            if (a.value === -1) return this.negate();
            return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
        };
        SmallInteger.prototype.multiply = function (v) {
            return parseValue(v)._multiplyBySmall(this);
        };
        SmallInteger.prototype.times = SmallInteger.prototype.multiply; // Alias for multiply.

        NativeBigInt.prototype.multiply = function (v) {
            return new NativeBigInt(this.value * parseValue(v).value);
        };
        NativeBigInt.prototype.times = NativeBigInt.prototype.multiply; // Alias for multiply.

        /**
         * Squares a digit array (multiplies it by itself).
         * @param {number[]} a - The digit array to square.
         * @returns {number[]} The squared value as a new digit array.
         */
        function square(a) {
            var l = a.length,
                r = createArray(l + l), // Result array length is double the input.
                base = BASE,
                product, carry, i, a_i, a_j;
            for (i = 0; i < l; i++) {
                a_i = a[i];
                carry = 0 - a_i * a_i; // Initialize carry with negative square (optimization).
                for (var j = i; j < l; j++) {
                    a_j = a[j];
                    product = 2 * (a_i * a_j) + r[i + j] + carry;
                    carry = Math.floor(product / base);
                    r[i + j] = product - carry * base;
                }
                r[i + l] = carry; // Add remaining carry.
            }
            trim(r); // Remove any leading zeros.
            return r;
        }

        BigInteger.prototype.square = function () {
            return new BigInteger(square(this.value), false); // Square is always positive.
        };

        SmallInteger.prototype.square = function () {
            var value = this.value * this.value;
            if (isPrecise(value)) return new SmallInteger(value); // If result fits small integer.
            return new BigInteger(square(smallToArray(Math.abs(this.value))), false); // Promote to BigInteger for larger results.
        };

        NativeBigInt.prototype.square = function (v) {
            return new NativeBigInt(this.value * this.value);
        };

        /**
         * Performs division and modulo operation using a "long division" like algorithm.
         * Optimized for smaller input sizes.
         * @param {number[]} a - The numerator (dividend).
         * @param {number[]} b - The denominator (divisor).
         * @returns {[number[]|number, number[]|number]} An array containing the quotient and remainder.
         */
        function divMod1(a, b) {
            var a_l = a.length,
                b_l = b.length,
                base = BASE,
                result = createArray(b.length), // Initialize quotient digits.
                divisorMostSignificantDigit = b[b_l - 1],
                // Normalization step (Knuth's Algorithm D).
                lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
                remainder = multiplySmall(a, lambda),
                divisor = multiplySmall(b, lambda),
                quotientDigit, shift, carry, borrow, i, l, q;
            if (remainder.length <= a_l) remainder.push(0); // Ensure enough space for normalization.
            divisor.push(0); // Pad divisor for easier comparison.
            divisorMostSignificantDigit = divisor[b_l - 1]; // Update after normalization.
            for (shift = a_l - b_l; shift >= 0; shift--) {
                quotientDigit = base - 1; // Initial guess for the quotient digit.
                if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                    quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
                }
                // Refine quotientDigit if it's too large.
                carry = 0;
                borrow = 0;
                l = divisor.length;
                for (i = 0; i < l; i++) {
                    carry += quotientDigit * divisor[i];
                    q = Math.floor(carry / base);
                    borrow += remainder[shift + i] - (carry - q * base);
                    carry = q;
                    if (borrow < 0) {
                        remainder[shift + i] = borrow + base;
                        borrow = -1;
                    } else {
                        remainder[shift + i] = borrow;
                        borrow = 0;
                    }
                }
                while (borrow !== 0) {
                    quotientDigit -= 1;
                    carry = 0;
                    for (i = 0; i < l; i++) {
                        carry += remainder[shift + i] - base + divisor[i];
                        if (carry < 0) {
                            remainder[shift + i] = carry + base;
                            carry = 0;
                        } else {
                            remainder[shift + i] = carry;
                            carry = 1;
                        }
                    }
                    borrow += carry;
                }
                result[shift] = quotientDigit;
            }
            // Denormalization: divide the remainder by lambda.
            remainder = divModSmall(remainder, lambda)[0];
            return [arrayToSmall(result), arrayToSmall(remainder)];
        }

        /**
         * Another implementation of division and modulo, often faster for larger inputs.
         * @param {number[]} a - The numerator (dividend).
         * @param {number[]} b - The denominator (divisor).
         * @returns {[number[]|number, number[]|number]} An array containing the quotient and remainder.
         */
        function divMod2(a, b) {
            var a_l = a.length,
                b_l = b.length,
                result = [],
                part = [],
                base = BASE,
                guess, xlen, highx, highy, check;
            while (a_l) {
                part.unshift(a[--a_l]); // Take one digit from 'a' at a time.
                trim(part); // Remove leading zeros from the current 'part'.
                if (compareAbs(part, b) < 0) {
                    result.push(0); // If 'part' is smaller than 'b', quotient digit is 0.
                    continue;
                }
                xlen = part.length;
                highx = part[xlen - 1] * base + part[xlen - 2]; // Top two digits of 'part'.
                highy = b[b_l - 1] * base + b[b_l - 2];       // Top two digits of 'b'.
                if (xlen > b_l) {
                    highx = (highx + 1) * base; // Adjust if 'part' is longer.
                }
                guess = Math.ceil(highx / highy); // Initial guess for quotient digit.
                do {
                    check = multiplySmall(b, guess); // Calculate b * guess.
                    if (compareAbs(check, part) <= 0) break; // If b * guess <= part, guess is good.
                    guess--; // Otherwise, reduce guess.
                } while (guess);
                result.push(guess);
                part = subtract(part, check); // Subtract b * guess from 'part'.
            }
            result.reverse(); // Digits were collected in reverse order.
            return [arrayToSmall(result), arrayToSmall(part)];
        }

        /**
         * Divides a digit array by a small number.
         * @param {number[]} value - The digit array (dividend).
         * @param {number} lambda - The small number (divisor).
         * @returns {[number[], number]} An array containing the quotient array and a small remainder.
         */
        function divModSmall(value, lambda) {
            var length = value.length,
                quotient = createArray(length),
                base = BASE,
                i, q, remainder, divisor;
            remainder = 0;
            for (i = length - 1; i >= 0; --i) {
                divisor = remainder * base + value[i];
                q = truncate(divisor / lambda);
                remainder = divisor - q * lambda;
                quotient[i] = q | 0; // Truncate and ensure integer.
            }
            return [quotient, remainder | 0];
        }

        /**
         * Generic division and modulo method, handling all types (SmallInteger, BigInteger, NativeBigInt).
         * @param {Integer} self - The dividend.
         * @param {*} v - The divisor.
         * @returns {[Integer, Integer]} An array containing the quotient and remainder.
         */
        function divModAny(self, v) {
            var value, n = parseValue(v); // Convert divisor to an Integer instance.
            if (supportsNativeBigInt) {
                return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
            }
            var a = self.value, b = n.value;
            var quotient;
            if (b === 0) throw new Error(\"Cannot divide by zero\"); // Prevent division by zero.
            if (self.isSmall) {
                if (n.isSmall) {
                    return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)]; // Both small, use native operations.
                }
                return [Integer[0], self]; // Small divided by large results in 0 quotient and self as remainder.
            }
            if (n.isSmall) {
                if (b === 1) return [self, Integer[0]];
                if (b == -1) return [self.negate(), Integer[0]];
                var abs = Math.abs(b);
                if (abs < BASE) {
                    value = divModSmall(a, abs); // Large divided by small number.
                    quotient = arrayToSmall(value[0]);
                    var remainder = value[1];
                    if (self.sign) remainder = -remainder; // Correct remainder sign (same as dividend).
                    if (typeof quotient === \"number\") {
                        if (self.sign !== n.sign) quotient = -quotient;
                        return [new SmallInteger(quotient), new SmallInteger(remainder)];
                    }
                    return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
                }
                b = smallToArray(abs); // Convert small 'b' to array if larger than BASE.
            }
            var comparison = compareAbs(a, b);
            if (comparison === -1) return [Integer[0], self]; // If |a| < |b|, quotient is 0.
            if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // If |a| == |b|, quotient is +/- 1.

            // Choose division algorithm based on input size.
            if (a.length + b.length <= 200)
                value = divMod1(a, b);
            else value = divMod2(a, b);

            quotient = value[0];
            var qSign = self.sign !== n.sign, // Quotient sign is XOR of dividend and divisor signs.
                mod = value[1],
                mSign = self.sign; // Remainder sign is same as dividend sign.
            if (typeof quotient === \"number\") {
                if (qSign) quotient = -quotient;
                quotient = new SmallInteger(quotient);
            } else quotient = new BigInteger(quotient, qSign);
            if (typeof mod === \"number\") {
                if (mSign) mod = -mod;
                mod = new SmallInteger(mod);
            } else mod = new BigInteger(mod, mSign);
            return [quotient, mod];
        }

        // BigInteger prototype method for divmod (returns an object with quotient and remainder).
        BigInteger.prototype.divmod = function (v) {
            var result = divModAny(this, v);
            return {
                quotient: result[0],
                remainder: result[1]
            };
        };
        // Apply divmod to all Integer types.
        NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


        // BigInteger prototype method for division (returns only the quotient).
        BigInteger.prototype.divide = function (v) {
            return divModAny(this, v)[0];
        };
        // NativeBigInt and SmallInteger prototypes for division.
        NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
            return new NativeBigInt(this.value / parseValue(v).value);
        };
        SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

        // BigInteger prototype method for modulo (returns only the remainder).
        BigInteger.prototype.mod = function (v) {
            return divModAny(this, v)[1];
        };
        // NativeBigInt and SmallInteger prototypes for modulo.
        NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
            return new NativeBigInt(this.value % parseValue(v).value);
        };
        SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

        // BigInteger prototype method for exponentiation (power).
        BigInteger.prototype.pow = function (v) {
            var n = parseValue(v),
                a = this.value,
                b = n.value,
                value, x, y;
            if (b === 0) return Integer[1]; // Any number to the power of 0 is 1.
            if (a === 0) return Integer[0]; // 0 to any positive power is 0.
            if (a === 1) return Integer[1]; // 1 to any power is 1.
            if (a === -1) return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^n is 1 if n is even, -1 if n is odd.
            if (n.sign) {
                return Integer[0]; // Negative exponent results in 0 for integer power (e.g., 2^-1 = 0).
            }
            if (!n.isSmall) throw new Error(\"The exponent \" + n.toString() + \" is too large.\");
            if (this.isSmall) {
                if (isPrecise(value = Math.pow(a, b)))
                    return new SmallInteger(truncate(value)); // If result fits small integer, use native pow.
            }
            x = this;
            y = Integer[1]; // Initialize result to 1.
            while (true) {
                if (b & 1 === 1) { // If exponent is odd.
                    y = y.times(x); // Multiply result by current base.
                    --b;           // Decrement exponent.
                }
                if (b === 0) break; // If exponent is zero, loop terminates.
                b /= 2;              // Halve the exponent.
                x = x.square();      // Square the base.
            }
            return y;
        };
        SmallInteger.prototype.pow = BigInteger.prototype.pow; // SmallInteger uses the same power logic.

        // NativeBigInt prototype method for exponentiation.
        NativeBigInt.prototype.pow = function (v) {
            var n = parseValue(v);
            var a = this.value, b = n.value;
            var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2); // Native BigInt constants.
            if (b === _0) return Integer[1];
            if (a === _0) return Integer[0];
            if (a === _1) return Integer[1];
            if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
            if (n.isNegative()) return new NativeBigInt(_0);
            var x = this;
            var y = Integer[1];
            while (true) {
                if ((b & _1) === _1) {
                    y = y.times(x);
                    --b;
                }
                if (b === _0) break;
                b /= _2;
                x = x.square();
            }
            return y;
        };

        // Modular exponentiation (base^exp % mod).
        BigInteger.prototype.modPow = function (exp, mod) {
            exp = parseValue(exp);
            mod = parseValue(mod);
            if (mod.isZero()) throw new Error(\"Cannot take modPow with modulus 0\");
            var r = Integer[1], // Result initialized to 1.
                base = this.mod(mod); // Reduce base modulo modulus.
            if (exp.isNegative()) {
                exp = exp.multiply(Integer[-1]); // Make exponent positive.
                base = base.modInv(mod);        // Compute modular inverse of base.
            }
            while (exp.isPositive()) {
                if (base.isZero()) return Integer[0]; // If base is 0, result is 0.
                if (exp.isOdd()) r = r.multiply(base).mod(mod); // If exponent is odd, update result.
                exp = exp.divide(2); // Halve the exponent.
                base = base.square().mod(mod); // Square base, then reduce modulo.
            }
            return r;
        };
        // Apply modPow to all Integer types.
        NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

        /**
         * Compares the absolute values of two digit arrays.
         * @param {number[]} a - The first digit array.
         * @param {number[]} b - The second digit array.
         * @returns {number} -1 if |a| < |b|, 0 if |a| == |b|, 1 if |a| > |b|.
         */
        function compareAbs(a, b) {
            if (a.length !== b.length) {
                return a.length > b.length ? 1 : -1; // Longer array has larger absolute value.
            }
            for (var i = a.length - 1; i >= 0; i--) {
                if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1; // Compare digits from most significant.
            }
            return 0; // Arrays are identical.
        }

        // BigInteger prototype method for comparing absolute values.
        BigInteger.prototype.compareAbs = function (v) {
            var n = parseValue(v),
                a = this.value,
                b = n.value;
            if (n.isSmall) return 1; // A large number's absolute value is generally greater than a small number's.
            return compareAbs(a, b);
        };
        // SmallInteger prototype method for comparing absolute values.
        SmallInteger.prototype.compareAbs = function (v) {
            var n = parseValue(v),
                a = Math.abs(this.value),
                b = n.value;
            if (n.isSmall) {
                b = Math.abs(b);
                return a === b ? 0 : a > b ? 1 : -1; // Direct comparison for two small integers.
            }
            return -1; // A small number's absolute value is generally less than a large number's.
        };
        // NativeBigInt prototype method for comparing absolute values.
        NativeBigInt.prototype.compareAbs = function (v) {
            var a = this.value;
            var b = parseValue(v).value;
            a = a >= 0 ? a : -a; // Get absolute value for native BigInt.
            b = b >= 0 ? b : -b;
            return a === b ? 0 : a > b ? 1 : -1;
        };

        // BigInteger prototype method for general comparison.
        BigInteger.prototype.compare = function (v) {
            // Handle comparisons with JavaScript's Infinity.
            if (v === Infinity) { return -1; }
            if (v === -Infinity) { return 1; }

            var n = parseValue(v),
                a = this.value,
                b = n.value;
            if (this.sign !== n.sign) {
                return n.sign ? 1 : -1; // Different signs: positive is greater.
            }
            if (n.isSmall) {
                return this.sign ? -1 : 1; // If one is small, the larger type typically wins.
            }
            return compareAbs(a, b) * (this.sign ? -1 : 1); // Compare absolute values and apply sign.
        };
        BigInteger.prototype.compareTo = BigInteger.prototype.compare; // Alias for compare.

        // SmallInteger prototype method for general comparison.
        SmallInteger.prototype.compare = function (v) {
            // Handle comparisons with JavaScript's Infinity.
            if (v === Infinity) { return -1; }
            if (v === -Infinity) { return 1; }

            var n = parseValue(v),
                a = this.value,
                b = n.value;
            if (n.isSmall) {
                return a == b ? 0 : a > b ? 1 : -1; // Direct comparison for two small integers.
            }
            if (a < 0 !== n.sign) {
                return a < 0 ? -1 : 1; // Different signs: positive is greater.
            }
            return a < 0 ? 1 : -1; // Both negative or positive, but one is large.
        };
        SmallInteger.prototype.compareTo = SmallInteger.prototype.compare; // Alias for compare.

        // NativeBigInt prototype method for general comparison.
        NativeBigInt.prototype.compare = function (v) {
            // Handle comparisons with JavaScript's Infinity.
            if (v === Infinity) { return -1; }
            if (v === -Infinity) { return 1; }
            var a = this.value;
            var b = parseValue(v).value;
            return a === b ? 0 : a > b ? 1 : -1; // Direct comparison of native BigInts.
        };
        NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare; // Alias for compare.

        // BigInteger prototype method for equality check.
        BigInteger.prototype.equals = function (v) {
            return this.compare(v) === 0;
        };
        // Apply equals and its alias 'eq' to all Integer types.
        NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

        // BigInteger prototype method for inequality check.
        BigInteger.prototype.notEquals = function (v) {
            return this.compare(v) !== 0;
        };
        // Apply notEquals and its alias 'neq' to all Integer types.
        NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

        // BigInteger prototype method for 'greater than' check.
        BigInteger.prototype.greater = function (v) {
            return this.compare(v) > 0;
        };
        // Apply greater and its alias 'gt' to all Integer types.
        NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

        // BigInteger prototype method for 'lesser than' check.
        BigInteger.prototype.lesser = function (v) {
            return this.compare(v) < 0;
        };
        // Apply lesser and its alias 'lt' to all Integer types.
        NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

        // BigInteger prototype method for 'greater than or equals' check.
        BigInteger.prototype.greaterOrEquals = function (v) {
            return this.compare(v) >= 0;
        };
        // Apply greaterOrEquals and its alias 'geq' to all Integer types.
        NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

        // BigInteger prototype method for 'lesser than or equals' check.
        BigInteger.prototype.lesserOrEquals = function (v) {
            return this.compare(v) <= 0;
        };
        // Apply lesserOrEquals and its alias 'leq' to all Integer types.
        NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

        // BigInteger prototype method to check if the number is even.
        BigInteger.prototype.isEven = function () {
            return (this.value[0] & 1) === 0; // Check the least significant digit.
        };
        // SmallInteger prototype method to check if the number is even.
        SmallInteger.prototype.isEven = function () {
            return (this.value & 1) === 0;
        };
        // NativeBigInt prototype method to check if the number is even.
        NativeBigInt.prototype.isEven = function () {
            return (this.value & BigInt(1)) === BigInt(0);
        };

        // BigInteger prototype method to check if the number is odd.
        BigInteger.prototype.isOdd = function () {
            return (this.value[0] & 1) === 1;
        };
        // SmallInteger prototype method to check if the number is odd.
        SmallInteger.prototype.isOdd = function () {
            return (this.value & 1) === 1;
        };
        // NativeBigInt prototype method to check if the number is odd.
        NativeBigInt.prototype.isOdd = function () {
            return (this.value & BigInt(1)) === BigInt(1);
        };

        // BigInteger prototype method to check if the number is positive.
        BigInteger.prototype.isPositive = function () {
            return !this.sign;
        };
        // SmallInteger prototype method to check if the number is positive.
        SmallInteger.prototype.isPositive = function () {
            return this.value > 0;
        };
        NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive; // Same logic for NativeBigInt.

        // BigInteger prototype method to check if the number is negative.
        BigInteger.prototype.isNegative = function () {
            return this.sign;
        };
        // SmallInteger prototype method to check if the number is negative.
        SmallInteger.prototype.isNegative = function () {
            return this.value < 0;
        };
        NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative; // Same logic for NativeBigInt.

        // BigInteger prototype method to check if the number is 1 or -1.
        BigInteger.prototype.isUnit = function () {
            return false; // A BigInteger (non-small) is never a unit.
        };
        // SmallInteger prototype method to check if the number is 1 or -1.
        SmallInteger.prototype.isUnit = function () {
            return Math.abs(this.value) === 1;
        };
        // NativeBigInt prototype method to check if the number is 1 or -1.
        NativeBigInt.prototype.isUnit = function () {
            return this.abs().value === BigInt(1);
        };

        // BigInteger prototype method to check if the number is zero.
        BigInteger.prototype.isZero = function () {
            return false; // A BigInteger (non-small) is never zero.
        };
        // SmallInteger prototype method to check if the number is zero.
        SmallInteger.prototype.isZero = function () {
            return this.value === 0;
        };
        // NativeBigInt prototype method to check if the number is zero.
        NativeBigInt.prototype.isZero = function () {
            return this.value === BigInt(0);
        };

        // BigInteger prototype method to check if the number is divisible by another.
        BigInteger.prototype.isDivisibleBy = function (v) {
            var n = parseValue(v);
            if (n.isZero()) return false; // Cannot divide by zero.
            if (n.isUnit()) return true; // Divisible by 1 or -1.
            if (n.compareAbs(2) === 0) return this.isEven(); // If divisor is 2, check parity.
            return this.mod(n).isZero(); // Otherwise, check if remainder is zero.
        };
        // Apply isDivisibleBy to all Integer types.
        NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

        /**
         * Basic primality test for small numbers.
         * @param {Integer} v - The number to test.
         * @returns {boolean|undefined} True if prime, false if composite, undefined if inconclusive (requires stronger test).
         */
        function isBasicPrime(v) {
            var n = v.abs();
            if (n.isUnit()) return false; // 1 is not prime.
            if (n.equals(2) || n.equals(3) || n.equals(5)) return true; // Small primes.
            if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false; // Divisible by small primes.
            if (n.lesser(49)) return true; // All numbers less than 49 not caught above are prime.
            // For larger numbers, this test is inconclusive.
        }

        /**
         * Implements the Miller-Rabin primality test.
         * @param {Integer} n - The number to test for primality.
         * @param {Integer[]} a - An array of bases to test against.
         * @returns {boolean} True if `n` is likely prime, false if composite.
         */
        function millerRabinTest(n, a) {
            var nPrev = n.prev(), // n - 1.
                b = nPrev,
                r = 0,
                d, t, i, x;
            while (b.isEven()) b = b.divide(2), r++; // Find b and r such that n-1 = 2^r * b.
            next: for (i = 0; i < a.length; i++) {
                if (n.lesser(a[i])) continue; // Skip bases larger than n.
                x = bigInt(a[i]).modPow(b, n); // Compute x = a^b mod n.
                if (x.isUnit() || x.equals(nPrev)) continue; // Check for trivial cases.
                for (d = r - 1; d != 0; d--) {
                    x = x.square().mod(n); // Square x modulo n.
                    if (x.isUnit()) return false; // Witness found: n is composite.
                    if (x.equals(nPrev)) continue next; // Passed for this base, try next.
                }
                return false; // Witness found: n is composite.
            }
            return true; // Passed all tests, likely prime.
        }

        // BigInteger prototype method for primality testing.
        BigInteger.prototype.isPrime = function (strict) {
            var isPrime = isBasicPrime(this);
            if (isPrime !== undefined) return isPrime; // Return early if basic test is conclusive.
            var n = this.abs();
            var bits = n.bitLength();
            if (bits <= 64)
                return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]); // Fixed bases for 64-bit numbers.
            var logN = Math.log(2) * bits.toJSNumber();
            var t = Math.ceil((strict === true) ? (2 * Math.pow(logN, 2)) : logN); // Number of iterations for larger numbers.
            for (var a = [], i = 0; i < t; i++) {
                a.push(bigInt(i + 2)); // Use small sequential numbers as bases.
            }
            return millerRabinTest(n, a);
        };
        // Apply isPrime to all Integer types.
        NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

        // BigInteger prototype method for probable primality testing.
        BigInteger.prototype.isProbablePrime = function (iterations, rng) {
            var isPrime = isBasicPrime(this);
            if (isPrime !== undefined) return isPrime;
            var n = this.abs();
            var t = iterations === undefined ? 5 : iterations; // Default to 5 iterations.
            for (var a = [], i = 0; i < t; i++) {
                a.push(bigInt.randBetween(2, n.minus(2), rng)); // Use random bases.
            }
            return millerRabinTest(n, a);
        };
        // Apply isProbablePrime to all Integer types.
        NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

        // BigInteger prototype method for modular inverse (a^-1 mod n).
        BigInteger.prototype.modInv = function (n) {
            var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
            while (!newR.isZero()) {
                q = r.divide(newR);
                lastT = t;
                lastR = r;
                t = newT;
                r = newR;
                newT = lastT.subtract(q.multiply(newT));
                newR = lastR.subtract(q.multiply(newR));
            }
            if (!r.isUnit()) throw new Error(this.toString() + \" and \" + n.toString() + \" are not co-prime\");
            if (t.compare(0) === -1) {
                t = t.add(n); // Ensure positive result.
            }
            if (this.isNegative()) {
                return t.negate(); // Adjust sign if original number was negative.
            }
            return t;
        };

        // Apply modInv to all Integer types.
        NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

        // BigInteger prototype method to get the next integer (this + 1).
        BigInteger.prototype.next = function () {
            var value = this.value;
            if (this.sign) {
                return subtractSmall(value, 1, this.sign); // If negative, effectively subtract 1 from absolute value.
            }
            return new BigInteger(addSmall(value, 1), this.sign); // If positive, add 1.
        };
        // SmallInteger prototype method to get the next integer.
        SmallInteger.prototype.next = function () {
            var value = this.value;
            if (value + 1 < MAX_INT) return new SmallInteger(value + 1); // If result is still small.
            return new BigInteger(MAX_INT_ARR, false); // Otherwise, promote to BigInteger.
        };
        // NativeBigInt prototype method to get the next integer.
        NativeBigInt.prototype.next = function () {
            return new NativeBigInt(this.value + BigInt(1));
        };

        // BigInteger prototype method to get the previous integer (this - 1).
        BigInteger.prototype.prev = function () {
            var value = this.value;
            if (this.sign) {
                return new BigInteger(addSmall(value, 1), true); // If negative, effectively add 1 to absolute value, keep negative sign.
            }
            return subtractSmall(value, 1, this.sign); // If positive, subtract 1.
        };
        // SmallInteger prototype method to get the previous integer.
        SmallInteger.prototype.prev = function () {
            var value = this.value;
            if (value - 1 > -MAX_INT) return new SmallInteger(value - 1); // If result is still small.
            return new BigInteger(MAX_INT_ARR, true); // Otherwise, promote to BigInteger (MAX_INT_ARR with negative sign).
        };
        // NativeBigInt prototype method to get the previous integer.
        NativeBigInt.prototype.prev = function () {
            return new NativeBigInt(this.value - BigInt(1));
        };

        // Precompute powers of two for efficient bit shifting.
        var powersOfTwo = [1];
        while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
        var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

        /**
         * Checks if a shift amount `n` is small enough to be handled directly without complex loop.
         * @param {number} n - The shift amount.
         * @returns {boolean} True if `n` is within the BASE range, false otherwise.
         */
        function shift_isSmall(n) {
            return Math.abs(n) <= BASE;
        }

        // BigInteger prototype method for left bit shift.
        BigInteger.prototype.shiftLeft = function (v) {
            var n = parseValue(v).toJSNumber();
            if (!shift_isSmall(n)) {
                throw new Error(String(n) + \" is too large for shifting.\");
            }
            if (n < 0) return this.shiftRight(-n); // Negative left shift is a right shift.
            var result = this;
            if (result.isZero()) return result; // Shifting zero results in zero.
            while (n >= powers2Length) {
                result = result.multiply(highestPower2); // Multiply by largest power of 2.
                n -= powers2Length - 1; // Adjust `n`.
            }
            return result.multiply(powersOfTwo[n]); // Multiply by remaining power of 2.
        };
        // Apply shiftLeft to all Integer types.
        NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

        // BigInteger prototype method for right bit shift.
        BigInteger.prototype.shiftRight = function (v) {
            var remQuo;
            var n = parseValue(v).toJSNumber();
            if (!shift_isSmall(n)) {
                throw new Error(String(n) + \" is too large for shifting.\");
            }
            if (n < 0) return this.shiftLeft(-n); // Negative right shift is a left shift.
            var result = this;
            while (n >= powers2Length) {
                if (result.isZero() || (result.isNegative() && result.isUnit())) return result;
                remQuo = divModAny(result, highestPower2); // Divide by largest power of 2.
                result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Adjust quotient for negative remainders.
                n -= powers2Length - 1;
            }
            remQuo = divModAny(result, powersOfTwo[n]); // Divide by remaining power of 2.
            return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Adjust quotient for negative remainders.
        };
        // Apply shiftRight to all Integer types.
        NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

        /**
         * Performs a generic bitwise operation (AND, OR, XOR) on two BigIntegers.
         * Handles negative numbers using two's complement logic.
         * @param {Integer} x - The first operand.
         * @param {Integer} y - The second operand.
         * @param {function(number, number): number} fn - The bitwise function to apply (e.g., `(a, b) => a & b`).
         * @returns {Integer} The result of the bitwise operation.
         */
        function bitwise(x, y, fn) {
            y = parseValue(y);
            var xSign = x.isNegative(), ySign = y.isNegative();
            var xRem = xSign ? x.not() : x, // Two's complement for negative numbers.
                yRem = ySign ? y.not() : y;
            var xDigit = 0, yDigit = 0;
            var xDivMod = null, yDivMod = null;
            var result = [];
            while (!xRem.isZero() || !yRem.isZero()) {
                xDivMod = divModAny(xRem, highestPower2);
                xDigit = xDivMod[1].toJSNumber();
                if (xSign) {
                    xDigit = highestPower2 - 1 - xDigit; // Apply two's complement.
                }

                yDivMod = divModAny(yRem, highestPower2);
                yDigit = yDivMod[1].toJSNumber();
                if (ySign) {
                    yDigit = highestPower2 - 1 - yDigit; // Apply two's complement.
                }

                xRem = xDivMod[0];
                yRem = yDivMod[0];
                result.push(fn(xDigit, yDigit)); // Apply the bitwise function.
            }
            // Handle sign extension for the final result.
            var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
            for (var i = result.length - 1; i >= 0; i -= 1) {
                sum = sum.multiply(highestPower2).add(bigInt(result[i]));
            }
            return sum;
        }

        // BigInteger prototype method for bitwise NOT.
        BigInteger.prototype.not = function () {
            return this.negate().prev(); // Equivalent to -(n + 1).
        };
        // Apply not to all Integer types.
        NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;

        // BigInteger prototype method for bitwise AND.
        BigInteger.prototype.and = function (n) {
            return bitwise(this, n, function (a, b) { return a & b; });
        };
        // Apply and to all Integer types.
        NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;

        // BigInteger prototype method for bitwise OR.
        BigInteger.prototype.or = function (n) {
            return bitwise(this, n, function (a, b) { return a | b; });
        };
        // Apply or to all Integer types.
        NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;

        // BigInteger prototype method for bitwise XOR.
        BigInteger.prototype.xor = function (n) {
            return bitwise(this, n, function (a, b) { return a ^ b; });
        };
        // Apply xor to all Integer types.
        NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;

        var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
        /**
         * Calculates a rough lowest one bit (LOB) for a BigInteger.
         * This is used for optimizations, particularly in GCD.
         * @param {Integer} n - The number to analyze.
         * @returns {number} The value of the lowest one bit.
         */
        function roughLOB(n) {
            var v = n.value,
                x = typeof v === \"number\" ? v | LOBMASK_I :
                    typeof v === \"bigint\" ? v | BigInt(LOBMASK_I) :
                        v[0] + v[1] * BASE | LOBMASK_BI; // Use first two digits for rough LOB.
            return x & -x; // Standard trick to get the lowest one bit.
        }

        /**
         * Calculates the integer logarithm of a value with respect to a given base.
         * @param {Integer} value - The number whose logarithm is to be found.
         * @param {Integer} base - The base of the logarithm.
         * @returns {{p: Integer, e: number}} An object containing the power and exponent.
         */
        function integerLogarithm(value, base) {
            if (base.compareTo(value) <= 0) {
                var tmp = integerLogarithm(value, base.square(base)); // Recursive call with squared base.
                var p = tmp.p;
                var e = tmp.e;
                var t = p.multiply(base);
                return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
            }
            return { p: bigInt(1), e: 0 }; // Base case: value < base.
        }

        // BigInteger prototype method to calculate its bit length.
        BigInteger.prototype.bitLength = function () {
            var n = this;
            if (n.compareTo(bigInt(0)) < 0) {
                n = n.negate().subtract(bigInt(1)); // For negative numbers, bit length of -(n+1).
            }
            if (n.compareTo(bigInt(0)) === 0) {
                return bigInt(0);
            }
            return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1)); // log base 2 + 1.
        };
        // Apply bitLength to all Integer types.
        NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

        /**
         * Returns the maximum of two BigIntegers.
         * @param {*} a - The first number.
         * @param {*} b - The second number.
         * @returns {Integer} The larger of the two numbers.
         */
        function max(a, b) {
            a = parseValue(a);
            b = parseValue(b);
            return a.greater(b) ? a : b;
        }
        /**
         * Returns the minimum of two BigIntegers.
         * @param {*} a - The first number.
         * @param {*} b - The second number.
         * @returns {Integer} The smaller of the two numbers.
         */
        function min(a, b) {
            a = parseValue(a);
            b = parseValue(b);
            return a.lesser(b) ? a : b;
        }
        /**
         * Calculates the greatest common divisor (GCD) of two BigIntegers.
         * Uses a binary GCD algorithm for efficiency.
         * @param {*} a - The first number.
         * @param {*} b - The second number.
         * @returns {Integer} The GCD.
         */
        function gcd(a, b) {
            a = parseValue(a).abs(); // Work with absolute values.
            b = parseValue(b).abs();
            if (a.equals(b)) return a;
            if (a.isZero()) return b;
            if (b.isZero()) return a;
            var c = Integer[1], d, t;
            while (a.isEven() && b.isEven()) { // Remove common factors of 2.
                d = min(roughLOB(a), roughLOB(b));
                a = a.divide(d);
                b = b.divide(d);
                c = c.multiply(d);
            }
            while (a.isEven()) { // Remove factors of 2 from 'a'.
                a = a.divide(roughLOB(a));
            }
            do {
                while (b.isEven()) { // Remove factors of 2 from 'b'.
                    b = b.divide(roughLOB(b));
                }
                if (a.greater(b)) { // Ensure a <= b.
                    t = b; b = a; a = t;
                }
                b = b.subtract(a); // Euclidean algorithm step: b = b - a.
            } while (!b.isZero());
            return c.isUnit() ? a : a.multiply(c); // Multiply back common factors of 2.
        }
        /**
         * Calculates the least common multiple (LCM) of two BigIntegers.
         * Formula: LCM(a, b) = |a*b| / GCD(a, b).
         * @param {*} a - The first number.
         * @param {*} b - The second number.
         * @returns {Integer} The LCM.
         */
        function lcm(a, b) {
            a = parseValue(a).abs();
            b = parseValue(b).abs();
            return a.divide(gcd(a, b)).multiply(b);
        }
        /**
         * Generates a random BigInteger between `a` and `b` (inclusive).
         * @param {*} a - The lower bound.
         * @param {*} b - The upper bound.
         * @param {function(): number} [rng] - Optional custom random number generator function.
         * @returns {Integer} A random BigInteger within the specified range.
         */
        function randBetween(a, b, rng) {
            a = parseValue(a);
            b = parseValue(b);
            var usedRNG = rng || Math.random; // Use Math.random by default.
            var low = min(a, b), high = max(a, b);
            var range = high.subtract(low).add(1); // Calculate the size of the range.
            if (range.isSmall) return low.add(Math.floor(usedRNG() * range)); // If range is small, use simple random.
            var digits = toBase(range, BASE).value; // Convert range to digits.
            var result = [], restricted = true;
            for (var i = 0; i < digits.length; i++) {
                var top = restricted ? digits[i] : BASE;
                var digit = truncate(usedRNG() * top);
                result.push(digit);
                if (digit < top) restricted = false; // Once a digit is less than max, no longer restricted.
            }
            return low.add(Integer.fromArray(result, BASE, false));
        }

        /**
         * Parses a string representation of a number in a given base and alphabet.
         * @param {string} text - The string to parse.
         * @param {number} base - The base of the number.
         * @param {string} [alphabet] - Custom alphabet for digits.
         * @param {boolean} [caseSensitive] - Flag for case-sensitive alphabet matching.
         * @returns {Integer} The parsed BigInteger.
         */
        var parseBase = function (text, base, alphabet, caseSensitive) {
            alphabet = alphabet || DEFAULT_ALPHABET;
            text = String(text);
            if (!caseSensitive) {
                text = text.toLowerCase();
                alphabet = alphabet.toLowerCase();
            }
            var length = text.length;
            var i;
            var absBase = Math.abs(base);
            var alphabetValues = {};
            for (i = 0; i < alphabet.length; i++) {
                alphabetValues[alphabet[i]] = i; // Map characters to their numerical values.
            }
            for (i = 0; i < length; i++) {
                var c = text[i];
                if (c === \"-\") continue; // Skip negative sign.
                if (c in alphabetValues) {
                    if (alphabetValues[c] >= absBase) {
                        if (c === \"1\" && absBase === 1) continue; // Special case for base 1.
                        throw new Error(c + \" is not a valid digit in base \" + base + \".\");
                    }
                }
            }
            base = parseValue(base); // Convert base itself to a BigInteger.
            var digits = [];
            var isNegative = text[0] === \"-\";
            for (i = isNegative ? 1 : 0; i < text.length; i++) {
                var c = text[i];
                if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
                else if (c === \"<\") { // Handle custom bracketed digits (e.g., <10>).
                    var start = i;
                    do { i++; } while (text[i] !== \">\" && i < text.length);
                    digits.push(parseValue(text.slice(start + 1, i)));
                }
                else throw new Error(c + \" is not a valid character\");
            }
            return parseBaseFromArray(digits, base, isNegative);
        };

        /**
         * Parses a number from an array of BigInteger digits in a specified base.
         * @param {Integer[]} digits - An array of BigInteger digits.
         * @param {Integer} base - The base of the number.
         * @param {boolean} isNegative - True if the number is negative.
         * @returns {Integer} The parsed BigInteger.
         */
        function parseBaseFromArray(digits, base, isNegative) {
            var val = Integer[0], pow = Integer[1], i;
            for (i = digits.length - 1; i >= 0; i--) {
                val = val.add(digits[i].times(pow)); // val += digit * current_power_of_base.
                pow = pow.times(base); // power_of_base *= base.
            }
            return isNegative ? val.negate() : val;
        }

        /**
         * Converts a single digit (number) to its string representation using an alphabet.
         * @param {number} digit - The digit to convert.
         * @param {string} [alphabet] - The alphabet to use.
         * @returns {string} The string representation of the digit.
         */
        function stringify(digit, alphabet) {
            alphabet = alphabet || DEFAULT_ALPHABET;
            if (digit < alphabet.length) {
                return alphabet[digit];
            }
            return \"<\" + digit + \">\"; // For digits larger than the alphabet size.
        }

        /**
         * Converts a BigInteger to an array of digits in a specified base.
         * @param {Integer} n - The BigInteger to convert.
         * @param {Integer} base - The target base.
         * @returns {{value: number[], isNegative: boolean}} An object containing the digit array and the sign.
         */
        function toBase(n, base) {
            base = bigInt(base);
            if (base.isZero()) {
                if (n.isZero()) return { value: [0], isNegative: false };
                throw new Error(\"Cannot convert nonzero numbers to base 0.\");
            }
            if (base.equals(-1)) {
                if (n.isZero()) return { value: [0], isNegative: false };
                if (n.isNegative())
                    return {
                        value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber()))
                            .map(Array.prototype.valueOf, [1, 0]) // Pattern for base -1: 1,0,1,0...
                        ),
                        isNegative: false
                    };

                var arr = Array.apply(null, Array(n.toJSNumber() - 1))
                    .map(Array.prototype.valueOf, [0, 1]); // Pattern: 0,1,0,1...
                arr.unshift([1]); // Prepend 1.
                return {
                    value: [].concat.apply([], arr),
                    isNegative: false
                };
            }

            var neg = false;
            if (n.isNegative() && base.isPositive()) {
                neg = true;
                n = n.abs(); // Work with absolute value for conversion.
            }
            if (base.isUnit()) {
                if (n.isZero()) return { value: [0], isNegative: false };

                return {
                    value: Array.apply(null, Array(n.toJSNumber()))
                        .map(Number.prototype.valueOf, 1), // Array of '1's for base 1.
                    isNegative: neg
                };
            }
            var out = [];
            var left = n, divmod;
            while (left.isNegative() || left.compareAbs(base) >= 0) {
                divmod = left.divmod(base);
                left = divmod.quotient;
                var digit = divmod.remainder;
                if (digit.isNegative()) {
                    digit = base.minus(digit).abs(); // Adjust remainder for negative bases.
                    left = left.next();
                }
                out.push(digit.toJSNumber());
            }
            out.push(left.toJSNumber()); // Push the last quotient.
            return { value: out.reverse(), isNegative: neg }; // Reverse to get correct order.
        }

        /**
         * Converts a BigInteger to its string representation in a specified base.
         * @param {Integer} n - The BigInteger to convert.
         * @param {number} base - The target base.
         * @param {string} [alphabet] - Custom alphabet for digits.
         * @returns {string} The string representation.
         */
        function toBaseString(n, base, alphabet) {
            var arr = toBase(n, base);
            return (arr.isNegative ? \"-\" : \"\") + arr.value.map(function (x) {
                return stringify(x, alphabet);
            }).join('');
        }

        // BigInteger prototype method to convert to an array of digits (internal format).
        BigInteger.prototype.toArray = function (radix) {
            return toBase(this, radix);
        };

        // SmallInteger prototype method to convert to an array of digits.
        SmallInteger.prototype.toArray = function (radix) {
            return toBase(this, radix);
        };

        // NativeBigInt prototype method to convert to an array of digits.
        NativeBigInt.prototype.toArray = function (radix) {
            return toBase(this, radix);
        };

        // BigInteger prototype method to convert to a string.
        BigInteger.prototype.toString = function (radix, alphabet) {
            if (radix === undefined) radix = 10;
            if (radix !== 10) return toBaseString(this, radix, alphabet); // Use generic base converter for non-decimal.
            var v = this.value, l = v.length, str = String(v[--l]), zeros = \"0000000\", digit;
            while (--l >= 0) {
                digit = String(v[l]);
                str += zeros.slice(digit.length) + digit; // Pad with zeros to maintain `BASE` length.
            }
            var sign = this.sign ? \"-\" : \"\";
            return sign + str;
        };

        // SmallInteger prototype method to convert to a string.
        SmallInteger.prototype.toString = function (radix, alphabet) {
            if (radix === undefined) radix = 10;
            if (radix != 10) return toBaseString(this, radix, alphabet);
            return String(this.value); // Direct conversion for small numbers.
        };

        NativeBigInt.prototype.toString = SmallInteger.prototype.toString; // NativeBigInt uses same toString as SmallInteger.

        // JSON serialization method for all Integer types.
        NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () { return this.toString(); };

        // BigInteger prototype method to convert to a JavaScript number (may lose precision).
        BigInteger.prototype.valueOf = function () {
            return parseInt(this.toString(), 10);
        };
        BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf; // Alias.

        // SmallInteger prototype method to convert to a JavaScript number.
        SmallInteger.prototype.valueOf = function () {
            return this.value;
        };
        SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf; // Alias.
        // NativeBigInt prototype method to convert to a JavaScript number.
        NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
            return parseInt(this.toString(), 10);
        };

        /**
         * Parses a string value into an Integer instance. Handles scientific notation, signs, and validation.
         * @param {string} v - The string to parse.
         * @returns {Integer} The parsed BigInteger.
         * @throws {Error} If the string is not a valid integer representation.
         */
        function parseStringValue(v) {
            if (isPrecise(+v)) {
                var x = +v;
                if (x === truncate(x)) // Check if it's an integer.
                    return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
                throw new Error(\"Invalid integer: \" + v);
            }
            var sign = v[0] === \"-\";
            if (sign) v = v.slice(1); // Remove sign for digit parsing.
            var split = v.split(/e/i); // Handle scientific notation (e.g., \"1.23e+5\").
            if (split.length > 2) throw new Error(\"Invalid integer: \" + split.join(\"e\"));
            if (split.length === 2) {
                var exp = split[1];
                if (exp[0] === \"+\") exp = exp.slice(1);
                exp = +exp; // Convert exponent to number.
                if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error(\"Invalid integer: \" + exp + \" is not a valid exponent.\");
                var text = split[0];
                var decimalPlace = text.indexOf(\".\");
                if (decimalPlace >= 0) {
                    exp -= text.length - decimalPlace - 1; // Adjust exponent for decimal places.
                    text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1); // Remove decimal point.
                }
                if (exp < 0) throw new Error(\"Cannot include negative exponent part for integers\");
                text += (new Array(exp + 1)).join(\"0\"); // Append zeros for positive exponent.
                v = text;
            }
            var isValid = /^([0-9][0-9]*)$/.test(v); // Validate the numeric part.
            if (!isValid) throw new Error(\"Invalid integer: \" + v);
            if (supportsNativeBigInt) {
                return new NativeBigInt(BigInt(sign ? \"-\" + v : v)); // Use native BigInt if available.
            }
            var r = [], max = v.length, l = LOG_BASE, min = max - l;
            while (max > 0) {
                r.push(+v.slice(min, max)); // Extract digits in chunks of LOG_BASE.
                min -= l;
                if (min < 0) min = 0;
                max -= l;
            }
            trim(r); // Trim leading zeros.
            return new BigInteger(r, sign);
        }

        /**
         * Parses a number value into an Integer instance.
         * @param {number} v - The number to parse.
         * @returns {Integer} The parsed BigInteger.
         * @throws {Error} If the number is not an integer or is out of range.
         */
        function parseNumberValue(v) {
            if (supportsNativeBigInt) {
                return new NativeBigInt(BigInt(v));
            }
            if (isPrecise(v)) {
                if (v !== truncate(v)) throw new Error(v + \" is not an integer.\");
                return new SmallInteger(v);
            }
            return parseStringValue(v.toString()); // Fallback to string parsing for large numbers.
        }

        /**
         * Parses any input value into an Integer instance. This is the main entry point for conversion.
         * @param {*} v - The value to parse (number, string, BigInt, or existing Integer).
         * @returns {Integer} The parsed BigInteger.
         */
        function parseValue(v) {
            if (typeof v === \"number\") {
                return parseNumberValue(v);
            }
            if (typeof v === \"string\") {
                return parseStringValue(v);
            }
            if (typeof v === \"bigint\") {
                return new NativeBigInt(v);
            }
            return v; // Assume it's already an Integer instance.
        }
        // Pre-define common small integers (0-999 and their negatives) for efficiency.
        for (var i = 0; i < 1000; i++) {
            Integer[i] = parseValue(i);
            if (i > 0) Integer[-i] = parseValue(-i);
        }
        // Expose utility methods and aliases for backward compatibility.
        Integer.one = Integer[1];
        Integer.zero = Integer[0];
        Integer.minusOne = Integer[-1];
        Integer.max = max;
        Integer.min = min;
        Integer.gcd = gcd;
        Integer.lcm = lcm;
        // Type check function.
        Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt; };
        Integer.randBetween = randBetween;

        // Factory method to create a BigInteger from an array of digits.
        Integer.fromArray = function (digits, base, isNegative) {
            return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
        };

        return Integer; // Return the main Integer constructor/factory.
    })();

    // Node.js specific export handling.
    if ( typeof module === \"object\" && module.hasOwnProperty(\"exports\")) {
        module.exports = bigInt;
    }

    // AMD (Asynchronous Module Definition) specific export handling.
    if (true) {
        !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
            return bigInt;
        }).call(exports, __webpack_require__, exports, module),
            __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ \"./node_modules/webpack/buildin/module.js\")(module)))

/* Source URL: webpack:///./node_modules/big-integer/BigInteger.js */");

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!************************************************************************************************************************************************!*\
  !*** (webpack)/buildin/module.js                                                                                                              ***!
  \************************************************************************************************************************************************/
/* This is a webpack built-in module for polyfilling Node.js 'module' object. */
/***/ (function (module, exports) {

eval("module.exports = function (module) {
    /* Check if the webpack polyfill has already been applied to this module. */
    if (!module.webpackPolyfill) {
        /* Define a no-op 'deprecate' method. */
        module.deprecate = function () { };
        module.paths = []; /* Initialize the 'paths' array as empty. */
        // 'module.parent' is intentionally left undefined by default.
        if (!module.children) module.children = []; /* Ensure 'children' array exists. */
        Object.defineProperty(module, \"loaded\", {
            enumerable: true,
            get: function () {
                return module.l; /* Expose the internal 'l' flag as 'loaded'. */
            }
        });
        Object.defineProperty(module, \"id\", {
            enumerable: true,
            get: function () {
                return module.i; /* Expose the internal 'i' ID as 'id'. */
            }
        });
        module.webpackPolyfill = 1; /* Mark this module as having the webpack polyfill applied. */
    }
    return module; /* Return the (potentially polyfilled) module object. */
};


/* Source URL: webpack:///(webpack)/buildin/module.js */");

/***/ }),

/***/ "./src/ABC152/D.js":
/*!************************************************************************************************************************************************!*\
  !*** ./src/ABC152/D.js                                                                                                                          ***!
  \************************************************************************************************************************************************/
/* This is the main application logic for ABC152/D. */
/***/ (function (module, exports, __webpack_require__) {

eval("
/* A utility function for destructuring arrays into a fixed number of elements. */
function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

/* Handles cases where an attempt is made to destructure a non-iterable instance. */
function _nonIterableRest() {
    throw new TypeError(\"Invalid attempt to destructure non-iterable instance\");
}

/* A helper to iterate over an iterable, limiting to a specified number of elements. */
function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === \"[object Arguments]\")) {
        return; // Not an iterable, return early.
    }
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);
            if (i && _arr.length === i) break; // Stop if limit reached.
        }
    } catch (err) {
        _d = true; // Mark as done due to error.
        _e = err;
    } finally {
        try {
            if (!_n && _i[\"return\"] != null) _i[\"return\"](); // Ensure iterator is closed.
        } finally {
            if (_d) throw _e; // Re-throw error if occurred.
        }
    }
    return _arr;
}

/* Checks if an array is a standard array (can have 'holes' or sparse elements). */
function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr; // Return array directly if it's a standard array.
}

// Import the Node.js file system module.
var fs = __webpack_require__(/*! fs */ \"fs\");

// Import the big-integer library to handle large number operations.
var bigInt = __webpack_require__(/*! big-integer */ \"./node_modules/big-integer/BigInteger.js\");


/**
 * A constructor for creating Pair objects.
 * Each Pair stores two values, 'first' and 'second', and provides a method to concatenate them.
 * @param {string|number} first - The initial value for the 'first' property.
 * @param {string|number} second - The initial value for the 'second' property.
 * @returns {object} An object with a 'get' method.
 */
function Pair(first, second) {
    var _this = this; // Capture the current 'this' context.

    this.first = first;   // Store the first component of the pair.
    this.second = second; // Store the second component of the pair.

    return {
        // The 'get' method concatenates 'first' and 'second' into a string.
        get: function get() {
            return _this.first + _this.second;
        }
    };
}


/**
 * The primary function that processes the input and calculates the solution.
 * It determines the count of pairs (a, b) such that 'a' ends with 'b' and 'b' starts with 'a'.
 * @param {string} input - The raw input string read from stdin.
 */
var main = function main(input) {
    // Split the input string into an array of lines.
    var lines = input.split('\\n');

    // Parse the first line to extract the integer N.
    var _lines$0$split$map = lines[0].split(' ').map(function (i) {
        return i - 0; // Convert string to number (unary plus operator).
    }),
        _lines$0$split$map2 = _slicedToArray(_lines$0$split$map, 1),
        N = _lines$0$split$map2[0]; // Destructure to get N.

    // Initialize a frequency map to store counts of (first_digit, last_digit) pairs.
    var freq = {};

    // First loop: Iterate from 1 to N to populate the frequency map.
    for (var i = 1; i <= N; i++) {
        var s = String(i).split(''); // Convert number 'i' to an array of its string digits.
        var head = s[0]; // Get the first digit.
        var tail = s[s.length - 1]; // Get the last digit.

        // Create a Pair object for the (head, tail) combination.
        var p = new Pair(head, tail);
        var a = p.get(); // Get the combined string (e.g., '14' for number 14).

        // Increment the frequency for this specific (head, tail) pair.
        if (freq[a] === undefined) {
            freq[a] = 0; // Initialize if not present.
        }
        freq[a]++;
    }

    var answer = 0; // Initialize the total count for the final answer.

    // Second loop: Iterate from 1 to N again to calculate the final answer.
    for (var _i2 = 1; _i2 <= N; _i2++) {
        var _s2 = String(_i2).split(''); // Convert the number to its string digits.

        var _head = _s2[0]; // Get the first digit of the current number.
        var _tail = _s2[_s2.length - 1]; // Get the last digit of the current number.

        // Create a new Pair object, but with the digits reversed (tail, head).
        var q = new Pair(_tail, _head);

        var _a = q.get(); // Get the combined string for this reversed pair.

        // If this reversed pair exists in our frequency map, add its count to the total answer.
        if (freq[_a] !== undefined) {
            answer += freq[_a];
        }
    }

    // Output the final calculated answer to the console.
    console.log(answer);
};

// Read the input from standard input (/dev/stdin) synchronously as UTF-8.
// Then, call the main function with the read input.
main(fs.readFileSync('/dev/stdin', 'utf8'));

/* Source URL: webpack:///./src/ABC152/D.js */");

/***/ }),

/***/ "fs":
/*!************************************************************************************************************************************************!*\
  !*** external "fs"                                                                                                                            ***!
  \************************************************************************************************************************************************/
/* This module is an external dependency, mapping to Node.js's built-in 'fs' module. */
/***/ (function (module, exports) {

eval("module.exports = require(\"fs\");

/* Source URL: webpack:///external_%22fs%22? */");

/***/ })

/************************************************************************************************************************************************/
/******/ });