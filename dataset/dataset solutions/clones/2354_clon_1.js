'use strict';
// This file implements a big integer library in JavaScript.
// It handles arbitrary precision arithmetic operations.


// Define the bigInt function as an Immediately Invoked Function Expression (IIFE).
let bigInt = function (undefined) {

    // BASE is used for internal representation; numbers are stored in arrays of this base.
    var BASE = 1e7,
        // LOG_BASE is the logarithm base 10 of BASE, used for string conversions.
        LOG_BASE = 7,
        // MAX_INT is the largest safe integer in JavaScript (2^53 - 1).
        MAX_INT = 9007199254740992,
        // MAX_INT_ARR is the array representation of MAX_INT in BASE.
        MAX_INT_ARR = smallToArray(MAX_INT),
        // LOG_MAX_INT is the natural logarithm of MAX_INT, useful for base conversions.
        LOG_MAX_INT = Math.log(MAX_INT);

    // The main constructor function for Integer objects.
    // It acts as a factory for SmallInteger or BigInteger instances.
    function Integer(v, radix) {
        // If no value is provided, return the zero integer.
        if (typeof v === "undefined")
            return Integer[0];

        // If a radix is specified, parse the value according to that base.
        if (typeof radix !== "undefined")
            return +radix === 10 ? parseValue(v) : parseBase(v, radix);

        // Otherwise, parse the value directly.
        return parseValue(v)
    }


    // Constructor for BigInteger objects (for numbers larger than MAX_INT).
    function BigInteger(value, sign) {
        this.value = value; // An array of digits in BASE.
        this.sign = sign;   // Boolean: true if negative, false if positive.
        this.isSmall = false; // Flag indicating it's a BigInteger.
    }

    // BigInteger prototypes inherit from Integer.prototype.
    BigInteger.prototype = Object.create(Integer.prototype);


    // Constructor for SmallInteger objects (for numbers within MAX_INT).
    function SmallInteger(value) {
        this.value = value; // A direct JavaScript number.
        this.sign = value < 0; // Boolean: true if negative.
        this.isSmall = true; // Flag indicating it's a SmallInteger.
    }

    // SmallInteger prototypes inherit from Integer.prototype.
    SmallInteger.prototype = Object.create(Integer.prototype);


    // Helper function to check if a number is within JavaScript's precise integer range.
    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT
    }


    // Converts a small JavaScript number into an array of digits in BASE.
    function smallToArray(n) {
        // Handle small numbers directly.
        if (n < 1e7)
            return [n];
        // Handle medium numbers.
        if (n < 1e14)
            return [n % 1e7, Math.floor(n / 1e7)];
        // Handle larger numbers up to MAX_INT.
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)]
    }


    // Converts an array of digits in BASE back to a small JavaScript number if possible.
    function arrayToSmall(arr) {
        // Remove leading zeros from the array.
        trim(arr);
        var length = arr.length;
        // If the array is small enough and represents a number within MAX_INT.
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0:
                    return 0; // Empty array means zero.
                case 1:
                    return arr[0]; // Single digit.
                case 2:
                    return arr[0] + arr[1] * BASE; // Two digits.
                default:
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE // Three digits.
            }
        }
        return arr // If not small, return the array itself.
    }


    // Removes leading zeros from a digit array.
    function trim(v) {
        var i = v.length;
        while (v[--i] === 0); // Find the first non-zero digit from the end.
        v.length = i + 1 // Truncate the array.
    }


    // Creates a new array of a given length, filled with zeros.
    function createArray(length) {
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0
        }
        return x
    }


    // Truncates a number (removes its fractional part).
    function truncate(n) {
        if (n > 0)
            return Math.floor(n);
        return Math.ceil(n)
    }


    // Adds two digit arrays (representing positive numbers).
    function add(a, b) {
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a), // Result array, sized for the larger input.
            carry = 0,
            base = BASE,
            sum, i;

        // Add digits element by element, handling carry.
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base
        }

        // Propagate carry for remaining digits of the longer number.
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base
        }

        // If there's a final carry, add it to the result.
        if (carry > 0)
            r.push(carry);

        return r
    }


    // Adds two digit arrays, ensuring the first argument is always the longer one.
    function addAny(a, b) {
        if (a.length >= b.length)
            return add(a, b);
        return add(b, a)
    }


    // Adds a small number (carry) to a digit array.
    function addSmall(a, carry) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;

        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry; // Subtract base to handle potential negative sums gracefully.
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1 // Adjust carry for the next iteration.
        }

        // Propagate any remaining carry.
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base)
        }
        return r
    }


    // BigInteger prototype method for addition.
    BigInteger.prototype.add = function (v) {
        var n = parseValue(v); // Parse the input value.

        // If signs are different, perform subtraction.
        if (this.sign !== n.sign) {
            return this.subtract(n.negate())
        }

        var a = this.value,
            b = n.value;

        // If the other number is small, use addSmall.
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign)
        }

        // Otherwise, use addAny for two large numbers.
        return new BigInteger(addAny(a, b), this.sign)
    };

    // Alias for add.
    BigInteger.prototype.plus = BigInteger.prototype.add;


    // SmallInteger prototype method for addition.
    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v); // Parse the input.
        var a = this.value;

        // If signs are different, perform subtraction.
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate())
        }

        var b = n.value;

        // If both are small, perform direct addition if precise.
        if (n.isSmall) {
            if (isPrecise(a + b))
                return new SmallInteger(a + b);
            // Convert b to array if not precise enough.
            b = smallToArray(Math.abs(b))
        }

        // Perform addition with a small number and an array.
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0)
    };

    // Alias for add.
    SmallInteger.prototype.plus = SmallInteger.prototype.add;


    // Subtracts two digit arrays (a - b), assuming a >= b.
    function subtract(a, b) {
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l), // Result array, sized for the larger input.
            borrow = 0,
            base = BASE,
            i, difference;

        // Subtract digits element by element, handling borrow.
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1
            } else
                borrow = 0;
            r[i] = difference
        }

        // Propagate borrow for remaining digits of the longer number.
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0)
                difference += base;
            else {
                r[i++] = difference;
                break // No more borrow, so remaining digits are the same.
            }
            r[i] = difference
        }

        // Copy remaining digits from 'a' if no more borrow.
        for (; i < a_l; i++) {
            r[i] = a[i]
        }

        trim(r); // Remove leading zeros.
        return r
    }


    // Subtracts two digit arrays, handling signs and order.
    function subtractAny(a, b, sign) {
        var value;

        // Determine which number is larger in absolute value.
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b)
        } else {
            value = subtract(b, a); // Swap if b is larger.
            sign = !sign // Invert the sign.
        }

        value = arrayToSmall(value); // Try to convert to small integer.

        if (typeof value === "number") {
            if (sign)
                value = -value;
            return new SmallInteger(value)
        }
        return new BigInteger(value, sign)
    }


    // Subtracts a small number (b) from a digit array (a).
    function subtractSmall(a, b, sign) {
        var l = a.length,
            r = new Array(l),
            carry = -b, // Initialize carry with the negative small number.
            base = BASE,
            i, difference;

        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference // Ensure positive digit.
        }

        r = arrayToSmall(r); // Try to convert to small integer.

        if (typeof r === "number") {
            if (sign)
                r = -r;
            return new SmallInteger(r)
        }
        return new BigInteger(r, sign)
    }


    // BigInteger prototype method for subtraction.
    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v); // Parse the input.

        // If signs are different, perform addition.
        if (this.sign !== n.sign) {
            return this.add(n.negate())
        }

        var a = this.value,
            b = n.value;

        // If the other number is small, use subtractSmall.
        if (n.isSmall)
            return subtractSmall(a, Math.abs(b), this.sign);

        // Otherwise, use subtractAny for two large numbers.
        return subtractAny(a, b, this.sign)
    };

    // Alias for subtract.
    BigInteger.prototype.minus = BigInteger.prototype.subtract;


    // SmallInteger prototype method for subtraction.
    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v); // Parse the input.
        var a = this.value;

        // If signs are different, perform addition.
        if (a < 0 !== n.sign) {
            return this.add(n.negate())
        }

        var b = n.value;

        // If both are small, perform direct subtraction.
        if (n.isSmall) {
            return new SmallInteger(a - b)
        }

        // Perform subtraction with a small number and an array.
        return subtractSmall(b, Math.abs(a), a >= 0)
    };

    // Alias for subtract.
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;


    // BigInteger prototype method to negate the number.
    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign)
    };


    // SmallInteger prototype method to negate the number.
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign; // Update the sign property.
        return small
    };


    // BigInteger prototype method to get the absolute value.
    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false) // Always positive.
    };


    // SmallInteger prototype method to get the absolute value.
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value))
    };


    // Multiplies two digit arrays using the standard long multiplication algorithm.
    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l, // Max possible length of the product.
            r = createArray(l), // Result array.
            base = BASE,
            product, carry, i, a_i, b_j;

        // Nested loops for digit-by-digit multiplication.
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j]; // Add current product to existing sum at position.
                carry = Math.floor(product / base); // Calculate carry.
                r[i + j] = product - carry * base; // Store the current digit.
                r[i + j + 1] += carry // Add carry to the next position.
            }
        }

        trim(r); // Remove leading zeros.
        return r
    }


    // Multiplies a digit array by a small JavaScript number.
    function multiplySmall(a, b) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;

        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base
        }

        // Propagate any remaining carry.
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base)
        }
        return r
    }


    // Shifts a digit array left by padding with zeros.
    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0)
            r.push(0); // Add n zeros.
        return r.concat(x) // Concatenate with the original array.
    }


    // Multiplies two digit arrays using the Karatsuba algorithm for efficiency.
    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        // For small arrays, fall back to long multiplication.
        if (n <= 30)
            return multiplyLong(x, y);

        n = Math.ceil(n / 2); // Split point for Karatsuba.

        // Divide numbers into parts.
        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        // Recursively calculate products.
        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        // Combine results using Karatsuba formula: ac * B^2n + ((a+b)(c+d) - ac - bd) * B^n + bd
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));

        trim(product); // Remove leading zeros.
        return product
    }


    // Heuristic to decide whether to use Karatsuba or long multiplication.
    function useKaratsuba(l1, l2) {
        // This is an empirical formula.
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0
    }


    // BigInteger prototype method for multiplication.
    BigInteger.prototype.multiply = function (v) {
        var n = parseValue(v), // Parse the input.
            a = this.value,
            b = n.value,
            sign = this.sign !== n.sign, // Determine the sign of the result.
            abs;

        // Handle multiplication by small integers.
        if (n.isSmall) {
            if (b === 0)
                return Integer[0]; // Multiply by zero.
            if (b === 1)
                return this; // Multiply by one.
            if (b === -1)
                return this.negate(); // Multiply by negative one.

            abs = Math.abs(b);

            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign) // Use multiplySmall.
            }
            b = smallToArray(abs) // Convert small integer to array if larger than BASE.
        }

        // Decide between Karatsuba and long multiplication.
        if (useKaratsuba(a.length, b.length))
            return new BigInteger(multiplyKaratsuba(a, b), sign);

        // Default to long multiplication.
        return new BigInteger(multiplyLong(a, b), sign)
    };

    // Alias for multiply.
    BigInteger.prototype.times = BigInteger.prototype.multiply;


    // Multiplies a small number (a) by a digit array (b).
    function multiplySmallAndArray(a, b, sign) {
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign)
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign)
    }


    // Internal method for SmallInteger to multiply by another SmallInteger.
    SmallInteger.prototype._multiplyBySmall = function (a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value)
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign)
    };


    // Internal method for BigInteger to multiply by a SmallInteger.
    BigInteger.prototype._multiplyBySmall = function (a) {
        if (a.value === 0)
            return Integer[0];
        if (a.value === 1)
            return this;
        if (a.value === -1)
            return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign)
    };


    // SmallInteger prototype method for multiplication.
    SmallInteger.prototype.multiply = function (v) {
        return parseValue(v)._multiplyBySmall(this) // Delegate to internal method.
    };

    // Alias for multiply.
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;


    // Squares a digit array using an optimized algorithm.
    function square(a) {
        var l = a.length,
            r = createArray(l + l), // Max possible length.
            base = BASE,
            product, carry, i, a_i, a_j;

        for (i = 0; i < l; i++) {
            a_i = a[i];
            carry = 0 - a_i * a_i; // Initialize carry with negative square of current digit.

            // Optimized loop for squaring.
            for (var j = i; j < l; j++) {
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry; // Add twice the cross product.
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base
            }
            r[i + l] = carry // Store final carry.
        }

        trim(r); // Remove leading zeros.
        return r
    }


    // BigInteger prototype method for squaring.
    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false) // Result is always positive.
    };


    // SmallInteger prototype method for squaring.
    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if (isPrecise(value))
            return new SmallInteger(value); // If precise, return SmallInteger.
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false) // Otherwise, convert to BigInteger and square.
    };


    // Division with remainder using the "schoolbook" algorithm (Knuth's Algorithm D).
    function divMod1(a, b) {
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length), // Quotient.
            divisorMostSignificantDigit = b[b_l - 1],
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor.
            remainder = multiplySmall(a, lambda), // Normalized remainder.
            divisor = multiplySmall(b, lambda), // Normalized divisor.
            quotientDigit, shift, carry, borrow, i, l, q;

        // Adjust lengths for normalization.
        if (remainder.length <= a_l)
            remainder.push(0);
        divisor.push(0); // Pad divisor for easier comparison.
        divisorMostSignificantDigit = divisor[b_l - 1]; // Re-evaluate MSB after normalization.

        // Main division loop.
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1; // Initial guess for quotient digit.

            // Refine quotient digit guess.
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit)
            }

            carry = 0;
            borrow = 0;
            l = divisor.length;

            // Subtract (quotientDigit * divisor) from remainder.
            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;

                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0
                }
            }

            // Adjust quotient digit if subtraction resulted in negative remainder.
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1
                    }
                }
                borrow += carry
            }
            result[shift] = quotientDigit
        }

        // Denormalize the remainder.
        remainder = divModSmall(remainder, lambda)[0];

        return [arrayToSmall(result), arrayToSmall(remainder)]
    }


    // Alternative division algorithm, perhaps for larger numbers or different edge cases.
    function divMod2(a, b) {
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;

        while (a_l) {
            part.unshift(a[--a_l]); // Take digits from 'a' one by one.
            trim(part); // Remove leading zeros from the current part.

            if (compareAbs(part, b) < 0) {
                result.push(0); // If part is smaller than divisor, quotient digit is 0.
                continue
            }

            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2]; // Two most significant digits of current part.
            highy = b[b_l - 1] * base + b[b_l - 2]; // Two most significant digits of divisor.

            if (xlen > b_l) {
                highx = (highx + 1) * base // Adjust highx if part is longer than divisor.
            }

            guess = Math.ceil(highx / highy); // Initial guess for quotient digit.

            // Refine guess by trial subtraction.
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0)
                    break;
                guess--
            } while (guess);

            result.push(guess); // Store quotient digit.
            part = subtract(part, check) // Subtract (guess * divisor) from part.
        }

        result.reverse(); // Reverse result to get correct order.
        return [arrayToSmall(result), arrayToSmall(part)]
    }


    // Divides a digit array by a small JavaScript number (lambda).
    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;

        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i]; // Combine remainder from previous step with current digit.
            q = truncate(divisor / lambda); // Calculate quotient digit.
            remainder = divisor - q * lambda; // Calculate new remainder.
            quotient[i] = q | 0 // Store quotient digit.
        }
        return [quotient, remainder | 0]
    }


    // Generic division and modulo function for any two big integers.
    function divModAny(self, v) {
        var value, n = parseValue(v);
        var a = self.value,
            b = n.value;
        var quotient;

        if (b === 0)
            throw new Error("Cannot divide by zero"); // Division by zero error.

        // Handle cases where 'self' is a SmallInteger.
        if (self.isSmall) {
            if (n.isSmall) {
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)] // Both small, direct division.
            }
            return [Integer[0], self] // Small number divided by large number results in 0 quotient and self as remainder.
        }

        // Handle cases where 'n' (divisor) is a SmallInteger.
        if (n.isSmall) {
            if (b === 1)
                return [self, Integer[0]]; // Divide by 1.
            if (b == -1)
                return [self.negate(), Integer[0]]; // Divide by -1.

            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs); // Use divModSmall for small divisor.
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];

                if (self.sign)
                    remainder = -remainder; // Adjust remainder sign.

                if (typeof quotient === "number") {
                    if (self.sign !== n.sign)
                        quotient = -quotient;
                    return [new SmallInteger(quotient), new SmallInteger(remainder)]
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)]
            }
            b = smallToArray(abs) // Convert small divisor to array if larger than BASE.
        }

        var comparison = compareAbs(a, b);

        if (comparison === -1)
            return [Integer[0], self]; // If dividend is smaller than divisor.
        if (comparison === 0)
            return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // If dividend equals divisor.

        // Choose division algorithm based on length.
        if (a.length + b.length <= 200)
            value = divMod1(a, b);
        else
            value = divMod2(a, b);

        quotient = value[0];
        var qSign = self.sign !== n.sign, // Quotient sign.
            mod = value[1], // Remainder value.
            mSign = self.sign; // Remainder sign (same as dividend).

        // Convert quotient and remainder to appropriate Integer types.
        if (typeof quotient === "number") {
            if (qSign)
                quotient = -quotient;
            quotient = new SmallInteger(quotient)
        } else
            quotient = new BigInteger(quotient, qSign);

        if (typeof mod === "number") {
            if (mSign)
                mod = -mod;
            mod = new SmallInteger(mod)
        } else
            mod = new BigInteger(mod, mSign);

        return [quotient, mod]
    }


    // BigInteger prototype method for divmod (returns quotient and remainder).
    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        }
    };

    // SmallInteger also uses the same divmod.
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    // BigInteger prototype method for division (returns only quotient).
    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0]
    };

    // Aliases for divide.
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;


    // BigInteger prototype method for modulo (returns only remainder).
    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1]
    };

    // Aliases for mod.
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;


    // BigInteger prototype method for exponentiation (power).
    BigInteger.prototype.pow = function (v) {
        var n = parseValue(v), // Parse exponent.
            a = this.value,
            b = n.value,
            value, x, y;

        if (b === 0)
            return Integer[1]; // x^0 = 1.
        if (a === 0)
            return Integer[0]; // 0^y = 0 (for y > 0).
        if (a === 1)
            return Integer[1]; // 1^y = 1.
        if (a === -1)
            return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^y is 1 if y even, -1 if y odd.

        // If exponent is negative, result is 0 for integers.
        if (n.sign) {
            return Integer[0]
        }

        // If exponent is too large, throw error (not supported).
        if (!n.isSmall)
            throw new Error("The exponent " + n.toString() + " is too large.");

        // If base is small and result fits, use Math.pow.
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
                return new SmallInteger(truncate(value))
        }

        // Use binary exponentiation (exponentiation by squaring).
        x = this;
        y = Integer[1]; // Accumulator.

        while (true) {
            if (b & 1 === 1) { // If exponent is odd.
                y = y.times(x);
                --b
            }
            if (b === 0)
                break; // If exponent is zero, done.
            b /= 2; // Divide exponent by 2.
            x = x.square() // Square the base.
        }
        return y
    };

    // SmallInteger also uses the same pow.
    SmallInteger.prototype.pow = BigInteger.prototype.pow;


    // BigInteger prototype method for modular exponentiation (a^exp mod mod).
    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);

        if (mod.isZero())
            throw new Error("Cannot take modPow with modulus 0"); // Modulus cannot be zero.

        var r = Integer[1], // Result accumulator.
            base = this.mod(mod); // Base reduced modulo modulus.

        while (exp.isPositive()) {
            if (base.isZero())
                return Integer[0]; // If base is 0, result is 0.

            if (exp.isOdd())
                r = r.multiply(base).mod(mod); // If exponent is odd, multiply result by base.

            exp = exp.divide(2); // Halve the exponent.
            base = base.square().mod(mod) // Square the base and reduce modulo modulus.
        }
        return r
    };

    // SmallInteger also uses the same modPow.
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;


    // Compares the absolute values of two digit arrays.
    function compareAbs(a, b) {
        // Compare lengths first.
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1
        }

        // If lengths are equal, compare digits from most significant to least significant.
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i])
                return a[i] > b[i] ? 1 : -1
        }
        return 0 // Numbers are equal.
    }


    // BigInteger prototype method to compare absolute values.
    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;

        if (n.isSmall)
            return 1; // A BigInteger is always absolutely larger than a SmallInteger (unless the BigInteger is 0).

        return compareAbs(a, b)
    };


    // SmallInteger prototype method to compare absolute values.
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;

        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1 // Both small, direct comparison.
        }
        return -1 // A SmallInteger is always absolutely smaller than a BigInteger (unless BigInteger is 0).
    };


    // BigInteger prototype method for general comparison.
    BigInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1
        }
        if (v === -Infinity) {
            return 1
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // If signs are different, the positive one is greater.
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1
        }

        // If comparing with a small integer.
        if (n.isSmall) {
            return this.sign ? -1 : 1 // If negative, SmallInteger is greater; if positive, BigInteger is greater.
        }

        // Compare absolute values, then adjust for sign.
        return compareAbs(a, b) * (this.sign ? -1 : 1)
    };

    // Alias for compare.
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;


    // SmallInteger prototype method for general comparison.
    SmallInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1
        }
        if (v === -Infinity) {
            return 1
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        // If both are small, direct comparison.
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1
        }

        // If signs are different.
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1 // If 'a' is negative, it's smaller; if 'a' is positive, it's larger.
        }
        return a < 0 ? 1 : -1 // If signs are same, and 'a' is negative, 'a' is larger (closer to 0).
    };

    // Alias for compare.
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;


    // BigInteger prototype method for equality check.
    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0
    };

    // Aliases for equals.
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;


    // BigInteger prototype method for inequality check.
    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0
    };

    // Aliases for notEquals.
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;


    // BigInteger prototype method for greater than.
    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0
    };

    // Aliases for greater.
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;


    // BigInteger prototype method for lesser than.
    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0
    };

    // Aliases for lesser.
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;


    // BigInteger prototype method for greater than or equals.
    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0
    };

    // Aliases for greaterOrEquals.
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;


    // BigInteger prototype method for lesser than or equals.
    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0
    };

    // Aliases for lesserOrEquals.
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;


    // BigInteger prototype method to check if even.
    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0 // Check the least significant digit.
    };


    // SmallInteger prototype method to check if even.
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0 // Check the number directly.
    };


    // BigInteger prototype method to check if odd.
    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1 // Check the least significant digit.
    };


    // SmallInteger prototype method to check if odd.
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1 // Check the number directly.
    };


    // BigInteger prototype method to check if positive.
    BigInteger.prototype.isPositive = function () {
        return !this.sign
    };


    // SmallInteger prototype method to check if positive.
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0
    };


    // BigInteger prototype method to check if negative.
    BigInteger.prototype.isNegative = function () {
        return this.sign
    };


    // SmallInteger prototype method to check if negative.
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0
    };


    // BigInteger prototype method to check if unit (1 or -1).
    BigInteger.prototype.isUnit = function () {
        return false // A BigInteger cannot be a unit (it would be a SmallInteger).
    };


    // SmallInteger prototype method to check if unit.
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1
    };


    // BigInteger prototype method to check if zero.
    BigInteger.prototype.isZero = function () {
        return false // A BigInteger cannot be zero (it would be a SmallInteger).
    };


    // SmallInteger prototype method to check if zero.
    SmallInteger.prototype.isZero = function () {
        return this.value === 0
    };


    // BigInteger prototype method to check if divisible by another number.
    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        var value = n.value;

        if (value === 0)
            return false; // Cannot divide by zero.
        if (value === 1)
            return true; // Always divisible by 1.
        if (value === 2)
            return this.isEven(); // Check evenness for divisibility by 2.

        return this.mod(n).equals(Integer[0]) // Check if remainder is zero.
    };

    // SmallInteger also uses the same isDivisibleBy.
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;


    // Helper function to check basic primality tests.
    function isBasicPrime(v) {
        var n = v.abs();

        if (n.isUnit())
            return false; // 1 and -1 are not prime.
        if (n.equals(2) || n.equals(3) || n.equals(5))
            return true; // 2, 3, 5 are prime.
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5))
            return false; // Divisible by 2, 3, or 5 implies not prime.
        if (n.lesser(25))
            return true // Numbers less than 25 that passed previous tests are prime (7, 11, 13, 17, 19, 23).
    }


    // BigInteger prototype method to check if prime using Miller-Rabin test.
    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined)
            return isPrime; // Return early if basic tests determined primality.

        var n = this.abs(),
            nPrev = n.prev(); // n-1.
        var a = [2, 3, 5, 7, 11, 13, 17, 19], // Small primes for Miller-Rabin bases.
            b = nPrev,
            d, t, i, x;

        // Find d and s such that n-1 = d * 2^s (b becomes d).
        while (b.isEven())
            b = b.divide(2);

        // Miller-Rabin test for each base 'a'.
        for (i = 0; i < a.length; i++) {
            x = bigInt(a[i]).modPow(b, n); // x = a^d mod n.

            if (x.equals(Integer[1]) || x.equals(nPrev))
                continue; // Pass if x = 1 or x = n-1.

            // Check powers of x up to n-1.
            for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
                x = x.square().mod(n); // x = x^2 mod n.
                if (x.equals(nPrev))
                    t = false // Pass if x = n-1.
            }

            if (t)
                return false // If test failed, n is composite.
        }
        return true // If all tests passed, n is prime.
    };

    // SmallInteger also uses the same isPrime.
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;


    // BigInteger prototype method to check if probable prime.
    BigInteger.prototype.isProbablePrime = function (iterations) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined)
            return isPrime; // Return early if basic tests determined primality.

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Number of iterations for Miller-Rabin.

        for (var i = 0; i < t; i++) {
            var a = bigInt.randBetween(2, n.minus(2)); // Random base a.
            if (!a.modPow(n.prev(), n).isUnit())
                return false // If a^(n-1) !== 1 (mod n), then n is composite.
        }
        return true // If all tests passed, n is probably prime.
    };

    // SmallInteger also uses the same isProbablePrime.
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;


    // BigInteger prototype method for modular inverse (a^-1 mod n).
    BigInteger.prototype.modInv = function (n) {
        var t = bigInt.zero, // Bezout coefficient t.
            newT = bigInt.one, // Bezout coefficient newT.
            r = parseValue(n), // Remainder r.
            newR = this.abs(), // Remainder newR (absolute value of this).
            q, lastT, lastR;

        // Extended Euclidean algorithm.
        while (!newR.equals(bigInt.zero)) {
            q = r.divide(newR); // Quotient.
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR))
        }

        if (!r.equals(1))
            throw new Error(this.toString() + " and " + n.toString() + " are not co-prime"); // No inverse if not coprime.

        if (t.compare(0) === -1) {
            t = t.add(n) // Ensure positive result.
        }

        if (this.isNegative()) {
            return t.negate() // Adjust sign if original number was negative.
        }
        return t
    };

    // SmallInteger also uses the same modInv.
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv;


    // BigInteger prototype method to get the next integer.
    BigInteger.prototype.next = function () {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign) // For negative numbers, add 1 (subtract 1 from absolute value).
        }
        return new BigInteger(addSmall(value, 1), this.sign) // For positive numbers, add 1.
    };


    // SmallInteger prototype method to get the next integer.
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if (value + 1 < MAX_INT)
            return new SmallInteger(value + 1); // If still small, return SmallInteger.
        return new BigInteger(MAX_INT_ARR, false) // If it exceeds MAX_INT, return BigInteger MAX_INT.
    };


    // BigInteger prototype method to get the previous integer.
    BigInteger.prototype.prev = function () {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true) // For negative numbers, subtract 1 (add 1 to absolute value).
        }
        return subtractSmall(value, 1, this.sign) // For positive numbers, subtract 1.
    };


    // SmallInteger prototype method to get the previous integer.
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if (value - 1 > -MAX_INT)
            return new SmallInteger(value - 1); // If still small, return SmallInteger.
        return new BigInteger(MAX_INT_ARR, true) // If it goes below -MAX_INT, return BigInteger -MAX_INT.
    };


    // Precompute powers of 2 up to BASE for efficient bitwise operations.
    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE)
        powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);

    var powers2Length = powersOfTwo.length,
        highestPower2 = powersOfTwo[powers2Length - 1];


    // Check if shift amount is small enough for direct handling.
    function shift_isSmall(n) {
        return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1
    }


    // BigInteger prototype method for left bit shift.
    BigInteger.prototype.shiftLeft = function (n) {
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.") // Error for large shifts.
        }
        n = +n; // Ensure n is a number.

        if (n < 0)
            return this.shiftRight(-n); // Negative shiftLeft is shiftRight.

        var result = this;
        if (result.isZero())
            return result; // Shifting zero results in zero.

        // Perform shifts in chunks of powers2Length - 1.
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1
        }

        return result.multiply(powersOfTwo[n]) // Final shift.
    };

    // SmallInteger also uses the same shiftLeft.
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;


    // BigInteger prototype method for right bit shift.
    BigInteger.prototype.shiftRight = function (n) {
        var remQuo; // Remainder and quotient.

        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.") // Error for large shifts.
        }
        n = +n; // Ensure n is a number.

        if (n < 0)
            return this.shiftLeft(-n); // Negative shiftRight is shiftLeft.

        var result = this;

        // Perform shifts in chunks.
        while (n >= powers2Length) {
            if (result.isZero() || result.isNegative() && result.isUnit())
                return result; // Handle special cases for 0 and -1.

            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Floor division for negative numbers.
            n -= powers2Length - 1
        }

        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0] // Final floor division.
    };

    // SmallInteger also uses the same shiftRight.
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;


    // Generic bitwise operation function.
    function bitwise(x, y, fn) {
        y = parseValue(y);

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Handle negative numbers by converting to two's complement-like representation.
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit = 0,
            yDigit = 0;
        var xDivMod = null,
            yDivMod = null;
        var result = [];

        // Process digits from LSB to MSB.
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];

            result.push(fn(xDigit, yDigit)) // Apply the bitwise function.
        }

        // Determine the sign of the final result.
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);

        // Reconstruct the result from digits.
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]))
        }
        return sum
    }


    // BigInteger prototype method for bitwise NOT.
    BigInteger.prototype.not = function () {
        return this.negate().prev() // ~x = -x - 1.
    };

    // SmallInteger also uses the same not.
    SmallInteger.prototype.not = BigInteger.prototype.not;


    // BigInteger prototype method for bitwise AND.
    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) {
            return a & b
        })
    };

    // SmallInteger also uses the same and.
    SmallInteger.prototype.and = BigInteger.prototype.and;


    // BigInteger prototype method for bitwise OR.
    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) {
            return a | b
        })
    };

    // SmallInteger also uses the same or.
    SmallInteger.prototype.or = BigInteger.prototype.or;


    // BigInteger prototype method for bitwise XOR.
    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) {
            return a ^ b
        })
    };

    // SmallInteger also uses the same xor.
    SmallInteger.prototype.xor = BigInteger.prototype.xor;


    // LOBMASK_I and LOBMASK_BI are used for extracting the lowest-order bit (LSB).
    var LOBMASK_I = 1 << 30,
        LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;


    // Calculates the lowest-order bit of a number.
    function roughLOB(n) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x // This trick isolates the LSB.
    }


    // Calculates integer logarithm (e.g., log base 2).
    function integerLogarithm(value, base) {
        // Recursive approach: log(value, base) = 2 * log(value, base^2) + (value >= base * log(value, base^2) ? 1 : 0)
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
            return t.compareTo(value) <= 0 ? {
                p: t,
                e: e * 2 + 1
            } : {
                p: p,
                e: e * 2
            }
        }
        return {
            p: bigInt(1),
            e: 0
        }
    }


    // BigInteger prototype method for calculating bit length.
    BigInteger.prototype.bitLength = function () {
        var n = this;

        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1)) // For negative numbers, bit length of -(x+1).
        }

        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0) // Bit length of 0 is 0.
        }

        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1)) // Calculate log base 2 and add 1.
    };

    // SmallInteger also uses the same bitLength.
    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;


    // Returns the maximum of two numbers.
    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b
    }


    // Returns the minimum of two numbers.
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b
    }


    // Calculates the greatest common divisor (GCD) using the binary GCD algorithm.
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();

        if (a.equals(b))
            return a;
        if (a.isZero())
            return b;
        if (b.isZero())
            return a;

        var c = Integer[1], // Factor of 2 common to both.
            d, t;

        // Remove common factors of 2.
        while (a.isEven() && b.isEven()) {
            d = Math.min(roughLOB(a), roughLOB(b)); // Find lowest common factor of 2.
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d)
        }

        // Remove factors of 2 from 'a'.
        while (a.isEven()) {
            a = a.divide(roughLOB(a))
        }

        // Main binary GCD loop.
        do {
            // Remove factors of 2 from 'b'.
            while (b.isEven()) {
                b = b.divide(roughLOB(b))
            }

            // Ensure a <= b.
            if (a.greater(b)) {
                t = b;
                b = a;
                a = t
            }

            b = b.subtract(a) // b = b - a.
        } while (!b.isZero()); // Loop until b is 0.

        return c.isUnit() ? a : a.multiply(c) // Multiply back common factors of 2.
    }


    // Calculates the least common multiple (LCM).
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        // LCM(a, b) = |a*b| / GCD(a, b)
        return a.divide(gcd(a, b)).multiply(b)
    }


    // Generates a random big integer between 'a' and 'b' (inclusive).
    function randBetween(a, b) {
        a = parseValue(a);
        b = parseValue(b);

        var low = min(a, b),
            high = max(a, b);
        var range = high.subtract(low).add(1); // Calculate the range size.

        // If range is small enough, use standard Math.random.
        if (range.isSmall)
            return low.add(Math.floor(Math.random() * range));

        var length = range.value.length - 1; // Length of the range in digits.
        var result = [],
            restricted = true; // Flag to indicate if digits are restricted by 'range'.

        // Generate random digits from MSB to LSB.
        for (var i = length; i >= 0; i--) {
            var top = restricted ? range.value[i] : BASE; // Upper bound for current digit.
            var digit = truncate(Math.random() * top); // Generate random digit.
            result.unshift(digit); // Add to the front of the result array.
            if (digit < top)
                restricted = false // If digit is less than max, future digits are not restricted.
        }

        result = arrayToSmall(result); // Convert to small integer if possible.
        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false))
    }


    // Parses a string value in a given base.
    var parseBase = function (text, base) {
        var length = text.length;
        var i;
        var absBase = Math.abs(base);

        // Validate digits for the given base.
        for (var i = 0; i < length; i++) {
            var c = text[i].toLowerCase();
            if (c === "-")
                continue; // Skip negative sign.

            if (/[a-z0-9]/.test(c)) {
                if (/[0-9]/.test(c) && +c >= absBase) {
                    if (c === "1" && absBase === 1)
                        continue; // Special case for base 1.
                    throw new Error(c + " is not a valid digit in base " + base + ".")
                } else if (c.charCodeAt(0) - 87 >= absBase) {
                    throw new Error(c + " is not a valid digit in base " + base + ".")
                }
            }
        }

        // If base is within a common range and number is small, use parseInt.
        if (2 <= base && base <= 36) {
            if (length <= LOG_MAX_INT / Math.log(base)) {
                var result = parseInt(text, base);
                if (isNaN(result)) {
                    throw new Error(c + " is not a valid digit in base " + base + ".")
                }
                return new SmallInteger(parseInt(text, base))
            }
        }

        base = parseValue(base); // Convert base to a bigInt.
        var digits = [];
        var isNegative = text[0] === "-";

        // Parse digits, handling custom formats like "<123>" for digits > 35.
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i].toLowerCase(),
                charCode = c.charCodeAt(0);
            if (48 <= charCode && charCode <= 57)
                digits.push(parseValue(c)); // 0-9
            else if (97 <= charCode && charCode <= 122)
                digits.push(parseValue(c.charCodeAt(0) - 87)); // a-z (10-35)
            else if (c === "<") {
                var start = i;
                do {
                    i++
                } while (text[i] !== ">");
                digits.push(parseValue(text.slice(start + 1, i))) // Parse custom digit.
            } else
                throw new Error(c + " is not a valid character")
        }
        return parseBaseFromArray(digits, base, isNegative)
    };


    // Converts an array of digits in a given base to a big integer.
    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0],
            pow = Integer[1],
            i;

        // Horner's method: sum(digit_i * base^i).
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base)
        }
        return isNegative ? val.negate() : val
    }


    // Converts a digit (0-35) to its string representation (0-9, a-z).
    // For digits > 35, it uses "<digit>" format.
    function stringify(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit)
        }
        return "<" + digit + ">"
    }


    // Converts a big integer to an array of digits in a given base.
    function toBase(n, base) {
        base = bigInt(base);

        if (base.isZero()) {
            if (n.isZero())
                return {
                    value: [0],
                    isNegative: false
                };
            throw new Error("Cannot convert nonzero numbers to base 0.")
        }

        // Special handling for base -1.
        if (base.equals(-1)) {
            if (n.isZero())
                return {
                    value: [0],
                    isNegative: false
                };
            if (n.isNegative())
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])),
                    isNegative: false
                };
            var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            }
        }

        var neg = false;
        // Handle negative numbers: convert to positive, then negate result.
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs()
        }

        // Special handling for base 1.
        if (base.equals(1)) {
            if (n.isZero())
                return {
                    value: [0],
                    isNegative: false
                };
            return {
                value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
                isNegative: neg
            }
        }

        var out = [];
        var left = n,
            divmod;

        // Repeatedly divide by base and collect remainders.
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;

            // Handle negative remainders (for negative bases).
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next()
            }
            out.push(digit.toJSNumber())
        }

        out.push(left.toJSNumber()); // Add the last quotient.
        return {
            value: out.reverse(),
            isNegative: neg
        }
    }


    // Converts a big integer to a string in a given base.
    function toBaseString(n, base) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("")
    }


    // BigInteger prototype method to convert to an array representation in a given radix.
    BigInteger.prototype.toArray = function (radix) {
        return toBase(this, radix)
    };

    // SmallInteger also uses the same toArray.
    SmallInteger.prototype.toArray = function (radix) {
        return toBase(this, radix)
    };


    // BigInteger prototype method to convert to string.
    BigInteger.prototype.toString = function (radix) {
        if (radix === undefined)
            radix = 10;

        if (radix !== 10)
            return toBaseString(this, radix); // Use generic base converter if not base 10.

        var v = this.value,
            l = v.length,
            str = String(v[--l]), // Start with the most significant digit.
            zeros = "0000000", // For padding.
            digit;

        // Concatenate digits, padding with zeros as needed.
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit
        }

        var sign = this.sign ? "-" : "";
        return sign + str
    };


    // SmallInteger prototype method to convert to string.
    SmallInteger.prototype.toString = function (radix) {
        if (radix === undefined)
            radix = 10;

        if (radix != 10)
            return toBaseString(this, radix); // Use generic base converter if not base 10.

        return String(this.value) // Direct conversion for small integers.
    };


    // JSON serialization (returns string representation).
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () {
        return this.toString()
    };


    // ValueOf for BigInteger (returns JS number, potentially losing precision).
    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10)
    };

    // Alias toJSNumber.
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;


    // ValueOf for SmallInteger (returns direct JS number).
    SmallInteger.prototype.valueOf = function () {
        return this.value
    };

    // Alias toJSNumber.
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;


    // Parses a string value into a big integer.
    function parseStringValue(v) {
        // Check if it's a precise number string.
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x))
                return new SmallInteger(x); // If integer and precise, return SmallInteger.
            throw new Error("Invalid integer: " + v)
        }

        var sign = v[0] === "-"; // Check for negative sign.
        if (sign)
            v = v.slice(1); // Remove sign for parsing.

        var split = v.split(/e/i); // Handle scientific notation.
        if (split.length > 2)
            throw new Error("Invalid integer: " + split.join("e"));

        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+")
                exp = exp.slice(1);
            exp = +exp; // Convert exponent to number.

            if (exp !== truncate(exp) || !isPrecise(exp))
                throw new Error("Invalid integer: " + exp + " is not a valid exponent.");

            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1; // Adjust exponent for decimal places.
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1) // Remove decimal point.
            }

            if (exp < 0)
                throw new Error("Cannot include negative exponent part for integers"); // Integers cannot have negative exponents.

            text += new Array(exp + 1).join("0"); // Pad with zeros.
            v = text
        }

        var isValid = /^([0-9][0-9]*)$/.test(v); // Validate remaining string as digits.
        if (!isValid)
            throw new Error("Invalid integer: " + v);

        var r = [],
            max = v.length,
            l = LOG_BASE,
            min = max - l;

        // Convert string to digit array in BASE.
        while (max > 0) {
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0)
                min = 0;
            max -= l
        }

        trim(r); // Remove leading zeros.
        return new BigInteger(r, sign)
    }


    // Parses a number value into a big integer.
    function parseNumberValue(v) {
        if (isPrecise(v)) {
            if (v !== truncate(v))
                throw new Error(v + " is not an integer."); // Must be an integer.
            return new SmallInteger(v)
        }
        return parseStringValue(v.toString()) // Convert to string and parse.
    }


    // Main function to parse any value into a big integer.
    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v)
        }
        if (typeof v === "string") {
            return parseStringValue(v)
        }
        return v // If already a bigInt instance, return as is.
    }


    // Pre-populate Integer cache for small numbers (0-999 and their negatives).
    for (var i = 0; i < 1e3; i++) {
        Integer[i] = new SmallInteger(i);
        if (i > 0)
            Integer[-i] = new SmallInteger(-i)
    }

    // Export common constants and utility functions.
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function (x) {
        return x instanceof BigInteger || x instanceof SmallInteger
    };
    Integer.randBetween = randBetween;
    Integer.fromArray = function (digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative)
    };

    return Integer // Return the Integer factory function.

}(); // End of IIFE for bigInt library.



// Main script logic starts here.
// Read input from standard input.
const input = require("fs").readFileSync("/dev/stdin", "utf8");

// Split input into rows and trim whitespace.
const rows = input.trim().split('\n');

// Parse N (number of elements).
const N = Number(rows[0].trim());

// Parse the array An, converting each element to a bigInt.
const An = rows[1].trim().split(' ').map((v) => {
    return bigInt(Number(v)); // Convert each string to a Number, then to bigInt.
});


// Initialize sum to zero bigInt.
let sum = bigInt(0);

// Nested loops to calculate XOR sum of all unique pairs.
// Iterate from i = 0 to N-2.
for (let i = 0; i < N - 1; i++) {
    // Inner loop from j = i+1 to N-1 to avoid duplicate pairs and self-XOR.
    for (let j = i + 1; j < N; j++) {
        // Calculate XOR of An[i] and An[j], then add to sum.
        sum = sum.add(An[i].xor(An[j]));
    }
}

// Calculate the final result: sum modulo 1000000007.
// Then convert the result to a string for output.
console.log(sum.mod(1000000007).toString());