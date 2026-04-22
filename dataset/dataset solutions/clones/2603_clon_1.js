"use strict";

let bigInt = function (undefined) {
    // Constants for internal representation and limits
    var BASE = 1e7; // Base for digits (10^7)
    var LOG_BASE = 7; // Logarithm of the base
    var MAX_INT = 9007199254740992; // JavaScript's maximum safe integer
    var MAX_INT_ARR = smallToArray(MAX_INT); // MAX_INT converted to digit array
    var LOG_MAX_INT = Math.log(MAX_INT); // Log of MAX_INT for parsing optimizations

    // Main factory function for creating bigInt instances
    function Integer(v, radix) {
        // If no value is provided, default to zero
        if (typeof v === "undefined") {
            return Integer[0];
        }

        // If a radix is specified, parse accordingly
        if (typeof radix !== "undefined") {
            // If radix is 10, use standard parsing; otherwise, parse with custom base
            return +radix === 10 ? parseValue(v) : parseBase(v, radix);
        }

        // Default to standard parsing (base 10)
        return parseValue(v);
    }

    // BigInteger constructor for numbers exceeding MAX_INT
    function BigInteger(value, sign) {
        this.value = value; // Array of digits
        this.sign = sign; // Boolean: true for negative, false for positive
        this.isSmall = false; // Flag to indicate BigInteger type
    }
    // BigInteger inherits from Integer.prototype
    BigInteger.prototype = Object.create(Integer.prototype);

    // SmallInteger constructor for numbers within MAX_INT
    function SmallInteger(value) {
        this.value = value; // Native JavaScript number
        this.sign = value < 0; // Boolean: true if value is negative
        this.isSmall = true; // Flag to indicate SmallInteger type
    }
    // SmallInteger also inherits from Integer.prototype
    SmallInteger.prototype = Object.create(Integer.prototype);

    // Checks if a number can be precisely represented by JavaScript's `number` type
    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    // Converts a small JavaScript number to an array of BASE-digits
    function smallToArray(n) {
        if (n < 1e7) return [n];
        if (n < 1e14) return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }

    // Converts an array of BASE-digits back to a small JavaScript number if possible
    function arrayToSmall(arr) {
        trim(arr); // Remove leading zeros
        var length = arr.length;

        // Check if the array represents a number within the safe integer range
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0:
                    return 0;
                case 1:
                    return arr[0];
                case 2:
                    return arr[0] + arr[1] * BASE;
                default: // case 3
                    return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr; // If too large, return the array itself
    }

    // Removes leading zero elements from a digit array
    function trim(v) {
        var i = v.length;
        while (v[--i] === 0) {
            /* loop until non-zero or start of array */
        }
        v.length = i + 1; // Adjust array length
    }

    // Creates a new array of a given length, initialized with zeros
    function createArray(length) {
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0;
        }
        return x;
    }

    // Truncates a number towards zero (like Math.trunc)
    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    // Adds two digit arrays (non-negative)
    function add(a, b) {
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum,
            i;

        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }

    // Helper for addition, ensures the first argument is the longer array
    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }

    // Adds a small number (carry) to a digit array
    function addSmall(a, carry) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum,
            i;

        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry; // Use -base for potential negative intermediate sum
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1; // Adjust carry for actual value
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    // BigInteger.prototype.add method
    BigInteger.prototype.add = function(v) {
        var n = parseValue(v); // Ensure v is a bigInt instance
        if (this.sign !== n.sign) {
            // Different signs means subtraction
            return this.subtract(n.negate());
        }
        var a = this.value,
            b = n.value;
        if (n.isSmall) {
            // Optimize if the other operand is a SmallInteger
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        // General case for two BigIntegers
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add; // Alias for add

    // SmallInteger.prototype.add method
    SmallInteger.prototype.add = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            // Different signs means subtraction
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            // Both are small integers
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b)); // Convert b to array if direct sum overflows
        }
        // Add small integer 'a' (converted to array if needed) to 'b' (array)
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add; // Alias for add

    // Subtracts two digit arrays (a - b), assuming |a| >= |b|
    function subtract(a, b) {
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i,
            difference;

        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else {
                borrow = 0;
            }
            r[i] = difference;
        }
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) {
                difference += base;
            } else {
                r[i++] = difference;
                break; // No more borrows, can copy rest
            }
            r[i] = difference;
        }
        for (; i < a_l; i++) {
            r[i] = a[i];
        }
        trim(r); // Remove leading zeros
        return r;
    }

    // Subtracts two digit arrays, handling order and sign
    function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign; // Flip sign if b was larger
        }
        value = arrayToSmall(value); // Try to convert to SmallInteger
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }

    // Subtracts a small number (b) from a digit array (a)
    function subtractSmall(a, b, sign) {
        var l = a.length,
            r = new Array(l),
            carry = -b, // Initialize carry with negative b for subtraction
            base = BASE,
            i,
            difference;

        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference; // Ensure positive digit
        }
        r = arrayToSmall(r); // Try to convert to SmallInteger
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        }
        return new BigInteger(r, sign);
    }

    // BigInteger.prototype.subtract method
    BigInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            // Different signs means addition
            return this.add(n.negate());
        }
        var a = this.value,
            b = n.value;
        if (n.isSmall) {
            // Optimize if the other operand is a SmallInteger
            return subtractSmall(a, Math.abs(b), this.sign);
        }
        // General case for two BigIntegers
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract; // Alias for subtract

    // SmallInteger.prototype.subtract method
    SmallInteger.prototype.subtract = function(v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            // Different signs means addition
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            // Both are small integers
            return new SmallInteger(a - b);
        }
        // Subtract small integer 'a' from 'b' (array), adjusting sign
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract; // Alias for subtract

    // Negates the BigInteger (flips its sign)
    BigInteger.prototype.negate = function() {
        return new BigInteger(this.value, !this.sign);
    };

    // Negates the SmallInteger (flips its sign)
    SmallInteger.prototype.negate = function() {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };

    // Returns the absolute value of the BigInteger
    BigInteger.prototype.abs = function() {
        return new BigInteger(this.value, false);
    };

    // Returns the absolute value of the SmallInteger
    SmallInteger.prototype.abs = function() {
        return new SmallInteger(Math.abs(this.value));
    };

    // Multiplies two digit arrays using standard long multiplication
    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l), // Result array, max length a_l + b_l
            base = BASE,
            product,
            carry,
            i,
            a_i,
            b_j;

        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r); // Remove leading zeros
        return r;
    }

    // Multiplies a digit array by a small number
    function multiplySmall(a, b) {
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product,
            i;

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

    // Shifts a digit array left by appending zeros
    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
    }

    // Karatsuba multiplication algorithm for large numbers
    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        // Base case: if numbers are small, use long multiplication
        if (n <= 30) return multiplyLong(x, y);

        n = Math.ceil(n / 2); // Split point
        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        // Karatsuba formula: product = ac * B^(2n) + ((a+b)(c+d) - ac - bd) * B^n + bd
        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }

    // Heuristic to decide whether to use Karatsuba or long multiplication
    function useKaratsuba(l1, l2) {
        return -.012 * l1 - .012 * l2 + 15e-6 * l1 * l2 > 0;
    }

    // BigInteger.prototype.multiply method
    BigInteger.prototype.multiply = function(v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            sign = this.sign !== n.sign,
            abs;

        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                // If small multiplier fits in a single digit
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs); // Convert small multiplier to array
        }
        // Choose multiplication algorithm
        if (useKaratsuba(a.length, b.length)) {
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        }
        return new BigInteger(multiplyLong(a, b), sign);
    };
    BigInteger.prototype.times = BigInteger.prototype.multiply; // Alias for multiply

    // Helper to multiply a small number by a digit array
    function multiplySmallAndArray(a, b, sign) {
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }

    // Internal multiplication for SmallInteger operands
    SmallInteger.prototype._multiplyBySmall = function(a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };

    // Internal multiplication for BigInteger operands
    BigInteger.prototype._multiplyBySmall = function(a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };

    // SmallInteger.prototype.multiply method
    SmallInteger.prototype.multiply = function(v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply; // Alias for multiply

    // Squares a digit array (optimized algorithm)
    function square(a) {
        var l = a.length,
            r = createArray(l + l), // Result array, max length 2*l
            base = BASE,
            product,
            carry,
            i,
            a_i,
            a_j;

        for (i = 0; i < l; i++) {
            a_i = a[i];
            carry = 0 - a_i * a_i; // Initialize carry based on a_i^2
            for (var j = i; j < l; j++) {
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry;
        }
        trim(r); // Remove leading zeros
        return r;
    }

    // BigInteger.prototype.square method
    BigInteger.prototype.square = function() {
        return new BigInteger(square(this.value), false);
    };

    // SmallInteger.prototype.square method
    SmallInteger.prototype.square = function() {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    // Division and modulo algorithm 1 (optimized for certain cases)
    function divMod1(a, b) {
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), // Normalization factor
            remainder = multiplySmall(a, lambda), // Normalized dividend
            divisor = multiplySmall(b, lambda), // Normalized divisor
            quotientDigit,
            shift,
            carry,
            borrow,
            i,
            l,
            q;

        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0); // Pad divisor for consistent indexing
        divisorMostSignificantDigit = divisor[b_l - 1]; // Update MSD after normalization

        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1; // Initial guess

            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }

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
        remainder = divModSmall(remainder, lambda)[0]; // Denormalize remainder
        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    // Division and modulo algorithm 2 (more general, slower)
    function divMod2(a, b) {
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess,
            xlen,
            highx,
            highy,
            check;

        while (a_l) {
            part.unshift(a[--a_l]); // Add next digit to the front
            trim(part); // Remove leading zeros from 'part'
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base; // Adjust for additional digit
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            } while (guess);
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse(); // Reverse to get digits in correct order
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    // Divides a digit array by a small number, returning quotient array and remainder
    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i,
            q,
            remainder,
            divisor;

        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [quotient, remainder | 0];
    }

    // General division and modulo function
    function divModAny(self, v) {
        var value,
            n = parseValue(v);

        var a = self.value,
            b = n.value;
        var quotient;

        if (b === 0) throw new Error("Cannot divide by zero");

        if (self.isSmall) {
            if (n.isSmall) {
                // Both are small integers
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            // Small dividend, large divisor results in 0 quotient
            return [Integer[0], self];
        }

        if (n.isSmall) {
            if (b === 1) return [self, Integer[0]];
            if (b == -1) return [self.negate(), Integer[0]];
            var abs = Math.abs(b);
            if (abs < BASE) {
                // Divisor is small enough for divModSmall
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs); // Convert small divisor to array
        }

        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self]; // |dividend| < |divisor|
        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]]; // |dividend| == |divisor|

        // Choose division algorithm based on length
        if (a.length + b.length <= 200) value = divMod1(a, b);
        else value = divMod2(a, b);

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;

        // Convert quotient to appropriate type
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);

        // Convert remainder to appropriate type
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);

        return [quotient, mod];
    }

    // BigInteger.prototype.divmod method
    BigInteger.prototype.divmod = function(v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod; // SmallInteger uses the same

    // BigInteger.prototype.divide method (returns quotient)
    BigInteger.prototype.divide = function(v) {
        return divModAny(this, v)[0];
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    // BigInteger.prototype.mod method (returns remainder)
    BigInteger.prototype.mod = function(v) {
        return divModAny(this, v)[1];
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    // BigInteger.prototype.pow method (exponentiation)
    BigInteger.prototype.pow = function(v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value,
            x,
            y;

        // Handle special cases for exponentiation
        if (b === 0) return Integer[1]; // x^0 = 1
        if (a === 0) return Integer[0]; // 0^x = 0 (for x > 0)
        if (a === 1) return Integer[1]; // 1^x = 1
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1]; // (-1)^x

        if (n.sign) {
            // Negative exponent for integers results in 0
            return Integer[0];
        }
        if (!n.isSmall) {
            throw new Error("The exponent " + n.toString() + " is too large.");
        }

        // If base is small, try direct Math.pow
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b))) return new SmallInteger(truncate(value));
        }

        // Binary exponentiation (exponentiation by squaring)
        x = this;
        y = Integer[1];
        while (true) {
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow; // SmallInteger uses the same

    // BigInteger.prototype.modPow method (modular exponentiation)
    BigInteger.prototype.modPow = function(exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);

        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");

        var r = Integer[1],
            base = this.mod(mod); // Reduce base modulo mod

        // Binary exponentiation with modulo at each step
        while (exp.isPositive()) {
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow; // SmallInteger uses the same

    // Compares the absolute values of two digit arrays
    // Returns 1 if a > b, -1 if a < b, 0 if a == b
    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0; // Numbers are equal
    }

    // BigInteger.prototype.compareAbs method
    BigInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) return 1; // A BigInteger is always absolutely larger than a SmallInteger (unless SmallInteger is 0)
        return compareAbs(a, b);
    };

    // SmallInteger.prototype.compareAbs method
    SmallInteger.prototype.compareAbs = function(v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1; // A SmallInteger is always absolutely smaller than a BigInteger
    };

    // BigInteger.prototype.compare method
    BigInteger.prototype.compare = function(v) {
        if (v === Infinity) return -1;
        if (v === -Infinity) return 1;

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        if (this.sign !== n.sign) {
            // Different signs
            return n.sign ? 1 : -1; // If n is negative, this (positive) is greater
        }
        if (n.isSmall) {
            // This is BigInteger, n is SmallInteger
            return this.sign ? -1 : 1; // If negative, this is smaller; if positive, this is larger
        }
        // Both are BigIntegers, compare absolute values and adjust for sign
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare; // Alias for compare

    // SmallInteger.prototype.compare method
    SmallInteger.prototype.compare = function(v) {
        if (v === Infinity) return -1;
        if (v === -Infinity) return 1;

        var n = parseValue(v),
            a = this.value,
            b = n.value;

        if (n.isSmall) {
            // Both are small integers, direct comparison
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            // Different signs
            return a < 0 ? -1 : 1; // If this is negative, it's smaller than positive n
        }
        // Both have same sign, this is SmallInteger, n is BigInteger
        return a < 0 ? 1 : -1; // If negative, this is larger (less negative); if positive, this is smaller
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare; // Alias for compare

    // Equality checks
    BigInteger.prototype.equals = function(v) {
        return this.compare(v) === 0;
    };
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    // Inequality checks
    BigInteger.prototype.notEquals = function(v) {
        return this.compare(v) !== 0;
    };
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    // Greater than checks
    BigInteger.prototype.greater = function(v) {
        return this.compare(v) > 0;
    };
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    // Lesser than checks
    BigInteger.prototype.lesser = function(v) {
        return this.compare(v) < 0;
    };
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    // Greater than or equals checks
    BigInteger.prototype.greaterOrEquals = function(v) {
        return this.compare(v) >= 0;
    };
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    // Lesser than or equals checks
    BigInteger.prototype.lesserOrEquals = function(v) {
        return this.compare(v) <= 0;
    };
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    // BigInteger.prototype.isEven method
    BigInteger.prototype.isEven = function() {
        return (this.value[0] & 1) === 0;
    };

    // SmallInteger.prototype.isEven method
    SmallInteger.prototype.isEven = function() {
        return (this.value & 1) === 0;
    };

    // BigInteger.prototype.isOdd method
    BigInteger.prototype.isOdd = function() {
        return (this.value[0] & 1) === 1;
    };

    // SmallInteger.prototype.isOdd method
    SmallInteger.prototype.isOdd = function() {
        return (this.value & 1) === 1;
    };

    // BigInteger.prototype.isPositive method
    BigInteger.prototype.isPositive = function() {
        return !this.sign;
    };

    // SmallInteger.prototype.isPositive method
    SmallInteger.prototype.isPositive = function() {
        return this.value > 0;
    };

    // BigInteger.prototype.isNegative method
    BigInteger.prototype.isNegative = function() {
        return this.sign;
    };

    // SmallInteger.prototype.isNegative method
    SmallInteger.prototype.isNegative = function() {
        return this.value < 0;
    };

    // BigInteger.prototype.isUnit method (absolute value is 1)
    BigInteger.prototype.isUnit = function() {
        return false; // For BigIntegers, 1 and -1 are SmallIntegers
    };

    // SmallInteger.prototype.isUnit method
    SmallInteger.prototype.isUnit = function() {
        return Math.abs(this.value) === 1;
    };

    // BigInteger.prototype.isZero method
    BigInteger.prototype.isZero = function() {
        return false; // Zero is always a SmallInteger
    };

    // SmallInteger.prototype.isZero method
    SmallInteger.prototype.isZero = function() {
        return this.value === 0;
    };

    // BigInteger.prototype.isDivisibleBy method
    BigInteger.prototype.isDivisibleBy = function(v) {
        var n = parseValue(v);
        var value = n.value;
        if (value === 0) return false;
        if (value === 1) return true;
        if (value === 2) return this.isEven();
        return this.mod(n).equals(Integer[0]); // Check if remainder is zero
    };
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy; // SmallInteger uses the same

    // Basic primality test for small numbers
    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false; // 1 is not prime
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(25)) return true; // Primes: 7, 11, 13, 17, 19, 23
        return undefined; // Cannot determine with basic checks
    }

    // BigInteger.prototype.isPrime method (Miller-Rabin primality test)
    BigInteger.prototype.isPrime = function() {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;

        var n = this.abs(),
            nPrev = n.prev(); // n-1
        var a = [2, 3, 5, 7, 11, 13, 17, 19], // Small prime bases
            b = nPrev,
            d,
            t,
            i,
            x;

        // Find d and s such that n-1 = d * 2^s
        while (b.isEven()) b = b.divide(2);

        // Miller-Rabin test for each base 'a_i'
        for (i = 0; i < a.length; i++) {
            x = bigInt(a[i]).modPow(b, n); // x = a_i^d mod n
            if (x.equals(Integer[1]) || x.equals(nPrev)) continue; // Probably prime for this base
            for (t = true, d = b; t && d.lesser(nPrev); d = d.multiply(2)) {
                x = x.square().mod(n);
                if (x.equals(nPrev)) t = false; // Found a witness, probably prime
            }
            if (t) return false; // Composite
        }
        return true; // Prime
    };
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime; // SmallInteger uses the same

    // BigInteger.prototype.isProbablePrime method (probabilistic primality test)
    BigInteger.prototype.isProbablePrime = function(iterations) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;

        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations; // Default iterations

        for (var i = 0; i < t; i++) {
            var a = bigInt.randBetween(2, n.minus(2)); // Random base
            if (!a.modPow(n.prev(), n).isUnit()) return false; // Not a unit, likely composite
        }
        return true; // Probably prime
    };
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime; // SmallInteger uses the same

    // BigInteger.prototype.modInv method (modular multiplicative inverse)
    BigInteger.prototype.modInv = function(n) {
        var t = bigInt.zero,
            newT = bigInt.one,
            r = parseValue(n),
            newR = this.abs(),
            q,
            lastT,
            lastR;

        // Extended Euclidean algorithm
        while (!newR.equals(bigInt.zero)) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }

        if (!r.equals(1)) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");

        if (t.compare(0) === -1) {
            t = t.add(n);
        }
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv; // SmallInteger uses the same

    // BigInteger.prototype.next method (this + 1)
    BigInteger.prototype.next = function() {
        var value = this.value;
        if (this.sign) {
            // If negative, add 1 to absolute value, then negate
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };

    // SmallInteger.prototype.next method
    SmallInteger.prototype.next = function() {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false); // Overflow to BigInteger
    };

    // BigInteger.prototype.prev method (this - 1)
    BigInteger.prototype.prev = function() {
        var value = this.value;
        if (this.sign) {
            // If negative, subtract 1 from absolute value, then negate
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };

    // SmallInteger.prototype.prev method
    SmallInteger.prototype.prev = function() {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true); // Underflow to BigInteger
    };

    // Precompute powers of 2 up to BASE for efficient shifting
    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length,
        highestPower2 = powersOfTwo[powers2Length - 1];

    // Checks if a shift amount is small enough for optimization
    function shift_isSmall(n) {
        return (typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE || n instanceof BigInteger && n.value.length <= 1;
    }

    // BigInteger.prototype.shiftLeft method
    BigInteger.prototype.shiftLeft = function(n) {
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if (n < 0) return this.shiftRight(-n); // Negative shiftLeft is shiftRight

        var result = this;
        if (result.isZero()) return result;

        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft; // SmallInteger uses the same

    // BigInteger.prototype.shiftRight method
    BigInteger.prototype.shiftRight = function(n) {
        var remQuo;
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if (n < 0) return this.shiftLeft(-n); // Negative shiftRight is shiftLeft

        var result = this;
        if (result.isZero() || result.isNegative() && result.isUnit()) return result; // Special cases

        while (n >= powers2Length) {
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle negative remainders
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0]; // Handle negative remainders
    };
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight; // SmallInteger uses the same

    // Generic bitwise operation function
    function bitwise(x, y, fn) {
        y = parseValue(y);

        var xSign = x.isNegative(),
            ySign = y.isNegative();

        // Convert to two's complement representation (if negative)
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;

        var xDigit = 0,
            yDigit = 0;
        var xDivMod = null,
            yDivMod = null;
        var result = [];

        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit;
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit;
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];

            result.push(fn(xDigit, yDigit));
        }

        // Reconstruct result, handling sign bit
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }

    // BigInteger.prototype.not method (bitwise NOT)
    BigInteger.prototype.not = function() {
        return this.negate().prev(); // Equivalent to -(N+1)
    };
    SmallInteger.prototype.not = BigInteger.prototype.not; // SmallInteger uses the same

    // BigInteger.prototype.and method (bitwise AND)
    BigInteger.prototype.and = function(n) {
        return bitwise(this, n, function(a, b) {
            return a & b;
        });
    };
    SmallInteger.prototype.and = BigInteger.prototype.and; // SmallInteger uses the same

    // BigInteger.prototype.or method (bitwise OR)
    BigInteger.prototype.or = function(n) {
        return bitwise(this, n, function(a, b) {
            return a | b;
        });
    };
    SmallInteger.prototype.or = BigInteger.prototype.or; // SmallInteger uses the same

    // BigInteger.prototype.xor method (bitwise XOR)
    BigInteger.prototype.xor = function(n) {
        return bitwise(this, n, function(a, b) {
            return a ^ b;
        });
    };
    SmallInteger.prototype.xor = BigInteger.prototype.xor; // SmallInteger uses the same

    // LOBMASK_I: Mask for JavaScript numbers (30 bits)
    var LOBMASK_I = 1 << 30,
        // LOBMASK_BI: Mask for BigInteger digits (for BASE 1e7, this is related to 7 bits)
        LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;

    // Rough Least Significant Bit (LSB) calculation
    function roughLOB(n) {
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x; // Returns the lowest set bit
    }

    // Calculates the integer logarithm (used for bitLength)
    function integerLogarithm(value, base) {
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
            };
        }
        return {
            p: bigInt(1),
            e: 0
        };
    }

    // BigInteger.prototype.bitLength method
    BigInteger.prototype.bitLength = function() {
        var n = this;
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1)); // For negative numbers, bit length of -(N+1)
        }
        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
        }
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    };
    SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength; // SmallInteger uses the same

    // Returns the maximum of two bigInts
    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }

    // Returns the minimum of two bigInts
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }

    // Calculates the Greatest Common Divisor (GCD) of two bigInts
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;

        var c = Integer[1],
            d,
            t;

        // Binary GCD algorithm optimization
        while (a.isEven() && b.isEven()) {
            d = Math.min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b;
                b = a;
                a = t;
            }
            b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
    }

    // Calculates the Least Common Multiple (LCM) of two bigInts
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }

    // Generates a random bigInt between 'a' and 'b' (inclusive)
    function randBetween(a, b) {
        a = parseValue(a);
        b = parseValue(b);

        var low = min(a, b),
            high = max(a, b);
        var range = high.subtract(low).add(1);

        if (range.isSmall) return low.add(Math.floor(Math.random() * range));

        var length = range.value.length - 1;
        var result = [],
            restricted = true;

        for (var i = length; i >= 0; i--) {
            var top = restricted ? range.value[i] : BASE;
            var digit = truncate(Math.random() * top);
            result.unshift(digit);
            if (digit < top) restricted = false;
        }
        result = arrayToSmall(result);
        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
    }

    // Parses a string value in a given base
    var parseBase = function(text, base) {
        var length = text.length;
        var i;
        var absBase = Math.abs(base);

        // Validate characters for the given base
        for (var i = 0; i < length; i++) {
            var c = text[i].toLowerCase();
            if (c === "-") continue;
            if (/[a-z0-9]/.test(c)) {
                if (/[0-9]/.test(c) && +c >= absBase) {
                    if (c === "1" && absBase === 1) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                } else if (c.charCodeAt(0) - 87 >= absBase) {
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }

        // Optimization for common bases (2-36) and small numbers
        if (2 <= base && base <= 36) {
            if (length <= LOG_MAX_INT / Math.log(base)) {
                var result = parseInt(text, base);
                if (isNaN(result)) {
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
                return new SmallInteger(parseInt(text, base));
            }
        }

        base = parseValue(base); // Ensure base is a bigInt
        var digits = [];
        var isNegative = text[0] === "-";

        // Convert string digits to bigInt digits
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i].toLowerCase(),
                charCode = c.charCodeAt(0);
            if (48 <= charCode && charCode <= 57) digits.push(parseValue(c));
            else if (97 <= charCode && charCode <= 122) digits.push(parseValue(c.charCodeAt(0) - 87));
            else if (c === "<") {
                var start = i;
                do {
                    i++;
                } while (text[i] !== ">");
                digits.push(parseValue(text.slice(start + 1, i)));
            } else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
    };

    // Converts an array of digits in a given base to a bigInt
    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0],
            pow = Integer[1],
            i;
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    }

    // Converts a single digit (0-35 or custom) to its string representation
    function stringify(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return "<" + digit + ">";
    }

    // Converts a bigInt to an array of digits in a given base
    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return {
                value: [0],
                isNegative: false
            };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return {
                value: [0],
                isNegative: false
            };
            if (n.isNegative()) return {
                value: [].concat.apply([], Array.apply(null, Array(-n)).map(Array.prototype.valueOf, [1, 0])),
                isNegative: false
            };
            var arr = Array.apply(null, Array(+n - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }
        var neg = false;
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
        }
        if (base.equals(1)) {
            if (n.isZero()) return {
                value: [0],
                isNegative: false
            };
            return {
                value: Array.apply(null, Array(+n)).map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }
        var out = [];
        var left = n,
            divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return {
            value: out.reverse(),
            isNegative: neg
        };
    }

    // Converts a bigInt to a string representation in a given base
    function toBaseString(n, base) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(stringify).join("");
    }

    // BigInteger.prototype.toArray method
    BigInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };
    SmallInteger.prototype.toArray = function(radix) {
        return toBase(this, radix);
    };

    // BigInteger.prototype.toString method
    BigInteger.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBaseString(this, radix);
        var v = this.value,
            l = v.length,
            str = String(v[--l]),
            zeros = "0000000",
            digit;
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    // SmallInteger.prototype.toString method
    SmallInteger.prototype.toString = function(radix) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBaseString(this, radix);
        return String(this.value);
    };

    // JSON serialization
    BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
        return this.toString();
    };

    // ValueOf and toJSNumber for BigInteger
    BigInteger.prototype.valueOf = function() {
        return parseInt(this.toString(), 10);
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

    // ValueOf and toJSNumber for SmallInteger
    SmallInteger.prototype.valueOf = function() {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;

    // Parses a string value into a bigInt
    function parseStringValue(v) {
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x)) return new SmallInteger(x);
            throw new Error("Invalid integer: " + v);
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") exp = exp.slice(1);
            exp = +exp;
            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }
            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
            text += new Array(exp + 1).join("0");
            v = text;
        }
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) throw new Error("Invalid integer: " + v);
        var r = [],
            max = v.length,
            l = LOG_BASE,
            min = max - l;
        while (max > 0) {
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0) min = 0;
            max -= l;
        }
        trim(r);
        return new BigInteger(r, sign);
    }

    // Parses a JavaScript number into a bigInt
    function parseNumberValue(v) {
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }

    // General parsing function, handles numbers, strings, and existing bigInts
    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        return v; // Assume it's already a bigInt instance
    }

    // Pre-populate Integer cache for small numbers (0-999 and their negatives)
    for (var i = 0; i < 1e3; i++) {
        Integer[i] = new SmallInteger(i);
        if (i > 0) Integer[-i] = new SmallInteger(-i);
    }

    // Define common constants
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];

    // Expose utility functions
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;

    // Type checking function
    Integer.isInstance = function(x) {
        return x instanceof BigInteger || x instanceof SmallInteger;
    };

    // Expose random number generator
    Integer.randBetween = randBetween;

    // Expose fromArray parsing function
    Integer.fromArray = function(digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer; // Return the Integer factory function
}();

// Main application logic
const main = arg => {
    // Trim whitespace from input and split by newline
    arg = arg.trim().split("\n");
    // Parse the first line as an integer N
    const N = parseInt(arg[0]);

    // Calculate the sum of integers from 1 to N using the bigInt library:
    // sum = N * (N + 1) / 2
    let sum = parseInt(bigInt((bigInt(N).multiply(N + 1))).divide(2).toString());

    // Output the result of (sum - N)
    // This simplifies to (N*(N+1)/2) - N = (N^2 + N - 2N) / 2 = (N^2 - N) / 2 = N*(N-1)/2
    console.log(parseInt(sum) - N);
};

// Read input from /dev/stdin and pass it to the main function
main(require('fs').readFileSync('/dev/stdin', 'utf8'));