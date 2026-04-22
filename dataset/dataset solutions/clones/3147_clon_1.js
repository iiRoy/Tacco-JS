parcelRequire = function (e, r, t, n) {
  // Declare variables for internal use within the parcelRequire scope.
  var i, // Used to store the first encountered error, if any.
    o = "function" == typeof parcelRequire && parcelRequire, // Capture the original parcelRequire if it exists globally.
    u = "function" == typeof require && require; // Capture Node.js 'require' if it exists.

  // The core function for loading modules.
  function f(t, n) {
    // Check if the module is already in the cache.
    if (!r[t]) {
      // If the module definition is not available in the 'e' object.
      if (!e[t]) {
        // Attempt to load the module using a global parcelRequire instance if 'n' (no-lookup-parents) is false.
        var i = "function" == typeof parcelRequire && parcelRequire;
        if (!n && i) return i(t, !0);

        // Attempt to load using the original captured parcelRequire.
        if (o) return o(t, !0);

        // Attempt to load using Node.js 'require' if available and 't' is a string.
        if (u && "string" == typeof t) return u(t);

        // If all attempts fail, construct and throw a module not found error.
        var c = new Error("Cannot find module '" + t + "'");
        throw c.code = "MODULE_NOT_FOUND", c;
      }

      // Define a 'resolve' function for relative module paths within this module.
      p.resolve = function (r) {
        return e[t][1][r] || r;
      };
      // Initialize a cache for this module's internal dependencies.
      p.cache = {};

      // Create a new module instance and store it in the cache 'r'.
      var l = r[t] = new f.Module(t);

      // Execute the module's code, passing in 'p' (require), 'l' (module), 'l.exports' (exports), and 'this' context.
      e[t][0].call(l.exports, p, l, l.exports, this);
    }
    // Return the exports of the loaded/cached module.
    return r[t].exports;

    // A local 'require' function specific to this module context.
    function p(e) {
      return f(p.resolve(e));
    }
  }

  // Attach properties to the main module loader function 'f'.
  f.isParcelRequire = !0; // Flag indicating it's a Parcel require.
  // Constructor for a Parcel module.
  f.Module = function (e) {
    this.id = e; // Module identifier.
    this.bundle = f; // Reference to the bundle's require function.
    this.exports = {}; // The exports object for the module.
  };
  f.modules = e; // Store all module definitions.
  f.cache = r; // Store the module cache.
  f.parent = o; // Reference to the parent parcelRequire.
  // Function to register a new module definition.
  f.register = function (r, t) {
    e[r] = [function (e, r) {
      r.exports = t;
    }, {}];
  };

  // Iterate through the initial entry points 't' and load them.
  for (var c = 0; c < t.length; c++) {
    try {
      f(t[c]);
    } catch (e) {
      // Capture the first error encountered during initial loading.
      i || (i = e);
    }
  }

  // If there were initial entry points, handle their exports.
  if (t.length) {
    var l = f(t[t.length - 1]); // Get the exports of the last entry point.
    // Determine the environment and export the last module.
    "object" == typeof exports && "undefined" != typeof module ?
      module.exports = l : // CommonJS environment.
      "function" == typeof define && define.amd ?
      define(function () {
        return l;
      }) : // AMD environment.
      n && (this[n] = l); // Global variable export if 'n' is provided.
  }

  // Update the global parcelRequire reference and re-throw any caught error.
  if (parcelRequire = f, i) throw i;

  // Return the main module loader function.
  return f;
}(
  // The first argument 'e': an object containing all module definitions.
  {
    "9xaU": [
      function (require, module, exports) {
        // This block contains the implementation of the 'big-integer' library.
        // It's wrapped in an IIFE to encapsulate its scope.
        var t = function (e) {
          "use strict";

          // --- Constants ---
          var r = 1e7, // Base for internal number representation (10^7), allowing 7 digits per array element.
            o = 7, // Number of decimal digits represented by each element in the internal array (log10(1e7)).
            n = 9007199254740992, // JavaScript's Number.MAX_SAFE_INTEGER (2^53).
            i = h(n), // The maximum safe integer converted to the internal array representation.
            u = "0123456789abcdefghijklmnopqrstuvwxyz", // Default character set for base conversions (up to base 36).
            p = "function" == typeof BigInt; // Feature detection: true if native BigInt is supported.

          // --- Main Factory Function ---
          // 'a' is the primary entry point for creating BigInt instances.
          function a(t, e, r, o) {
            // If no arguments are provided, return the BigInt zero.
            if (void 0 === t) return a[0];
            // If a base 'e' is specified (and it's not default base 10 without explicit radix),
            // parse the input string 't' using the custom base parser '$'.
            if (void 0 !== e && (10 != +e || r)) return $(t, e, r, o);
            // Otherwise, use the general input parser 'Q'.
            return Q(t);
          }

          // --- BigInt Internal Representation Classes ---

          // Represents a large BigInt (value stored as an array of digits).
          function s(t, e) {
            this.value = t; // An array of numbers, where each number is a 'digit' in base 'r'.
            this.sign = e; // Boolean: true for negative, false for positive/zero.
            this.isSmall = !1; // Flag indicating it's a large number.
          }

          // Represents a small BigInt (value stored as a single JavaScript number).
          function l(t) {
            this.value = t; // A standard JavaScript number.
            this.sign = t < 0; // Boolean: true for negative, false for positive/zero.
            this.isSmall = !0; // Flag indicating it's a small number.
          }

          // Represents a BigInt using JavaScript's native BigInt type.
          function f(t) {
            this.value = t; // A native BigInt value.
          }

          // --- Helper Functions (Internal) ---

          // Checks if a given number 't' is within JavaScript's safe integer range.
          function v(t) {
            return -n < t && t < n;
          }

          // Converts a standard JavaScript number 't' into the internal array representation.
          function h(t) {
            return t < 1e7 ?
              [t] : // If small enough, just one element.
              t < 1e14 ?
              [t % 1e7, Math.floor(t / 1e7)] : // For up to 14 digits, two elements.
              [t % 1e7, Math.floor(t / 1e7) % 1e7, Math.floor(t / 1e14)]; // For larger, three elements.
          }

          // Converts an internal array representation back to a JavaScript number if possible, otherwise returns the array.
          function y(t) {
            c(t); // Trim any leading zero elements.
            var e = t.length;
            // If the array is short and its value is less than MAX_SAFE_INTEGER.
            if (e < 4 && P(t, i) < 0) {
              switch (e) {
                case 0:
                  return 0; // Empty array means zero.
                case 1:
                  return t[0]; // Single element.
                case 2:
                  return t[0] + t[1] * r; // Two elements combined.
                default:
                  return t[0] + (t[1] + t[2] * r) * r; // Three elements combined.
              }
            }
            return t; // If too large, return the array itself.
          }

          // Trims leading zero elements from an internal array representation.
          function c(t) {
            for (var e = t.length; 0 === t[--e];) {} // Find the first non-zero element from the end.
            t.length = e + 1; // Adjust the array length.
          }

          // Creates a new array of a specified length, filled with zeros.
          function g(t) {
            for (var e = new Array(t), r = -1; ++r < t;) e[r] = 0;
            return e;
          }

          // Truncates a number towards zero (floor for positive, ceil for negative).
          function m(t) {
            return t > 0 ? Math.floor(t) : Math.ceil(t);
          }

          // Adds two internal array representations (t and e), assuming t.length >= e.length.
          function d(t, e) {
            var o, n,
              i = t.length,
              u = e.length,
              p = new Array(i), // Result array.
              a = 0, // Carry.
              s = r; // The base (1e7).

            for (n = 0; n < u; n++) {
              o = t[n] + e[n] + a; // Sum corresponding digits and carry.
              a = o >= s ? 1 : 0; // Calculate new carry.
              p[n] = o - a * s; // Store the digit (after subtracting carry).
            }
            for (; n < i;) {
              o = t[n] + a; // Add remaining digits with carry.
              a = o === s ? 1 : 0; // Calculate new carry.
              p[n++] = o - a * s; // Store the digit.
            }
            // If there's a final carry, append it to the result.
            return a > 0 && p.push(a), p;
          }

          // Adds two internal array representations, handling different lengths by ensuring the longer is 't'.
          function w(t, e) {
            return t.length >= e.length ? d(t, e) : d(e, t);
          }

          // Adds a small number 'e' to an internal array representation 't'.
          function b(t, e) {
            var o, n,
              i = t.length,
              u = new Array(i), // Result array.
              p = r, // The base (1e7).
              carry = e; // Initial carry is the small number.

            for (n = 0; n < i; n++) {
              o = t[n] + carry; // Sum digit and carry.
              carry = Math.floor(o / p); // Calculate new carry.
              u[n] = o - carry * p; // Store the digit.
            }
            // Propagate any remaining carry.
            for (; carry > 0;) {
              u[n++] = carry % p;
              carry = Math.floor(carry / p);
            }
            return u;
          }

          // Subtracts one internal array representation 'e' from another 't', assuming t.length >= e.length.
          function S(t, e) {
            var o, n,
              i = t.length,
              u = e.length,
              p = new Array(i), // Result array.
              a = 0, // Borrow.
              s = r; // The base (1e7).

            for (o = 0; o < u; o++) {
              n = t[o] - a - e[o]; // Subtract digits and borrow.
              n < 0 ? (n += s, a = 1) : a = 0; // If result is negative, add base and set borrow.
              p[o] = n; // Store the digit.
            }
            for (o = u; o < i; o++) {
              // Propagate borrow through remaining digits of 't'.
              if (!((n = t[o] - a) < 0)) {
                p[o++] = n;
                break;
              }
              n += s;
              p[o] = n;
            }
            for (; o < i; o++) p[o] = t[o]; // Copy any remaining digits.
            return c(p), p; // Trim zeros and return.
          }

          // Subtracts a small number 'e' from an internal array representation 't', applying a sign 'o'.
          function q(t, e, o) {
            var n, i,
              u = t.length,
              p = new Array(u), // Result array.
              a = -e, // The small number becomes a negative carry/borrow.
              f = r; // The base (1e7).

            for (n = 0; n < u; n++) {
              i = t[n] + a; // Sum digit and negative carry.
              a = Math.floor(i / f); // Calculate new carry.
              i %= f; // Current digit result.
              p[n] = i < 0 ? i + f : i; // Adjust negative digits.
            }
            // Convert to a small BigInt if possible, applying the final sign.
            return "number" == typeof (p = y(p)) ? (o && (p = -p), new l(p)) : new s(p, o);
          }

          // Multiplies two internal array representations 't' and 'e' (standard long multiplication algorithm).
          function M(t, e) {
            var o, n, i, u,
              p = t.length,
              a = e.length,
              s = g(p + a), // Result array, initialized with zeros.
              l = r; // The base (1e7).

            for (i = 0; i < p; ++i) {
              u = t[i];
              for (var f = 0; f < a; ++f) {
                o = u * e[f] + s[i + f]; // Multiply digits and add to the current partial sum.
                n = Math.floor(o / l); // Calculate carry.
                s[i + f] = o - n * l; // Store the digit.
                s[i + f + 1] += n; // Add carry to the next position.
              }
            }
            return c(s), s; // Trim zeros and return.
          }

          // Multiplies an internal array representation 't' by a small number 'e'.
          function N(t, e) {
            var o, n,
              i = t.length,
              u = new Array(i), // Result array.
              p = r, // The base (1e7).
              a = 0; // Carry.

            for (n = 0; n < i; n++) {
              o = t[n] * e + a; // Multiply digit by 'e' and add carry.
              a = Math.floor(o / p); // Calculate new carry.
              u[n] = o - a * p; // Store the digit.
            }
            // Propagate any remaining carry.
            for (; a > 0;) {
              u[n++] = a % p;
              a = Math.floor(a / p);
            }
            return u;
          }

          // Extends an array 't' with 'e' leading zeros.
          function E(t, e) {
            for (var r = []; e-- > 0;) r.push(0);
            return r.concat(t);
          }

          // Creates a new BigInt 's' type from a number 't', an array 'e', and a sign 'o'.
          function O(t, e, o) {
            // If 't' is smaller than the base 'r', use N (scalar multiplication).
            // Otherwise, use M (array multiplication) with 't' converted to an array.
            return new s(t < r ? N(e, t) : M(e, h(t)), o);
          }

          // Squares an internal array representation 't'.
          function B(t) {
            var e, o, n, i,
              u = t.length,
              p = g(u + u), // Result array, initialized with zeros.
              a = r; // The base (1e7).

            for (n = 0; n < u; n++) {
              o = 0 - (i = t[n]) * i; // Initialize diagonal element (term for a^2).
              for (var s = n; s < u; s++) {
                e = i * t[s] * 2 + p[n + s] + o; // Calculate 2*a*b + previous sum + carry.
                o = Math.floor(e / a); // New carry.
                p[n + s] = e - o * a; // Store the digit.
              }
              p[n + u] = o; // Store the final carry for this row.
            }
            return c(p), p; // Trim zeros and return.
          }

          // Divides an internal array representation 't' by a small number 'e'.
          function I(t, e) {
            var o, n, i, u,
              p = t.length,
              a = g(p), // Array for the quotient.
              s = r; // The base (1e7).
            i = 0; // Remainder from the previous step.

            for (o = p - 1; o >= 0; --o) {
              u = i * s + t[o]; // Combine previous remainder with current digit.
              n = m(u / e); // Calculate current quotient digit.
              i = u - n * e; // Calculate new remainder.
              a[o] = 0 | n; // Store quotient digit (bitwise OR 0 for integer conversion).
            }
            return [a, 0 | i]; // Return quotient array and final remainder.
          }

          // Divides two BigInts (t / e) and returns an array [quotient, remainder].
          function A(t, e) {
            var o, n = Q(e); // Ensure divisor is a BigInt.

            // If native BigInts are supported, use them directly.
            if (p) return [new f(t.value / n.value), new f(t.value % n.value)];

            var i, u = t.value,
              v = n.value;

            if (0 === v) throw new Error("Cannot divide by zero");

            // Handle cases where the dividend 't' is small.
            if (t.isSmall) {
              return n.isSmall ?
                [new l(m(u / v)), new l(u % v)] : // Both small, use native JS division.
                [a[0], t]; // If divisor is large, quotient is 0, remainder is dividend.
            }

            // Handle cases where the divisor 'n' is small.
            if (n.isSmall) {
              if (1 === v) return [t, a[0]]; // Divide by 1.
              if (-1 == v) return [t.negate(), a[0]]; // Divide by -1.
              var d = Math.abs(v);
              if (d < r) {
                // If the absolute divisor is less than base 'r', use scalar division 'I'.
                i = y((o = I(u, d))[0]); // Quotient part.
                var w = o[1]; // Remainder part.
                t.sign && (w = -w); // Adjust remainder sign to match dividend.
                return "number" == typeof i ?
                  (t.sign !== n.sign && (i = -i), [new l(i), new l(w)]) : // Result fits small BigInt.
                  [new s(i, t.sign !== n.sign), new l(w)]; // Result is large BigInt.
              }
              v = h(d); // Convert small divisor to array if it's still too large for I but small in magnitude.
            }

            // Compare magnitudes of dividend and divisor.
            var b = P(u, v);
            if (-1 === b) return [a[0], t]; // |dividend| < |divisor|, quotient is 0.
            if (0 === b) return [a[t.sign === n.sign ? 1 : -1], a[0]]; // |dividend| == |divisor|, quotient is +/-1.

            // Perform long division (either optimized or standard).
            i = (o = u.length + v.length <= 200 ? // Heuristic to decide between Karatsuba-like division and standard.
              function (t, e) {
                // Optimized division algorithm for relatively smaller numbers.
                var o, n, i, u, p, a, s,
                  l = t.length,
                  f = e.length,
                  v = r,
                  h = g(e.length), // Array to store quotient digits.
                  c = e[f - 1], // Most significant digit of the divisor.
                  m = Math.ceil(v / (2 * c)), // Normalization factor.
                  d = N(t, m), // Normalized dividend.
                  w = N(e, m); // Normalized divisor.

                for (d.length <= l && d.push(0), w.push(0), c = w[f - 1], n = l - f; n >= 0; n--) {
                  for (o = v - 1, d[n + f] !== c && (o = Math.floor((d[n + f] * v + d[n + f - 1]) / c)), i = 0, u = 0, a = w.length, p = 0; p < a; p++) {
                    i += o * w[p];
                    s = Math.floor(i / v);
                    u += d[n + p] - (i - s * v);
                    i = s;
                    u < 0 ? (d[n + p] = u + v, u = -1) : (d[n + p] = u, u = 0);
                  }
                  for (; 0 !== u;) {
                    for (o -= 1, i = 0, p = 0; p < a; p++) {
                      (i += d[n + p] - v + w[p]) < 0 ? (d[n + p] = i + v, i = 0) : (d[n + p] = i, i = 1);
                    }
                    u += i;
                  }
                  h[n] = o;
                }
                return d = I(d, m)[0], [y(h), y(d)];
              }(u, v) :
              function (t, e) {
                // Standard long division algorithm.
                for (var o, n, i, u, p, a = t.length, s = e.length, l = [], f = [], v = r; a;) {
                  if (f.unshift(t[--a]), c(f), P(f, e) < 0) {
                    l.push(0); // Current partial dividend is too small.
                  } else {
                    // Estimate quotient digit.
                    i = f[(n = f.length) - 1] * v + f[n - 2];
                    u = e[s - 1] * v + e[s - 2];
                    n > s && (i = (i + 1) * v);
                    o = Math.ceil(i / u);

                    // Adjust quotient digit if estimate is too high.
                    do {
                      if (P(p = N(e, o), f) <= 0) break;
                      o--;
                    } while (o);
                    l.push(o); // Store quotient digit.
                    f = S(f, p); // Subtract (divisor * quotient_digit) from partial dividend.
                  }
                }
                return l.reverse(), [y(l), y(f)]; // Return quotient and remainder.
              }(u, v))[0]; // Take the quotient part from the division result.

            var q = t.sign !== n.sign, // Determine the sign of the quotient.
              M = o[1], // The remainder from the division.
              E = t.sign; // The sign of the remainder is the same as the dividend.

            // Construct and return the quotient and remainder BigInts.
            return "number" == typeof i ?
              (q && (i = -i), i = new l(i)) :
              i = new s(i, q),
              "number" == typeof M ?
              (E && (M = -M), M = new l(M)) :
              M = new s(M, E),
              [i, M];
          }

          // Compares two internal array representations (t and e) by magnitude.
          // Returns 1 if t > e, -1 if t < e, 0 if t == e.
          function P(t, e) {
            if (t.length !== e.length) return t.length > e.length ? 1 : -1;
            for (var r = t.length - 1; r >= 0; r--) {
              if (t[r] !== e[r]) return t[r] > e[r] ? 1 : -1;
            }
            return 0; // Arrays are identical.
          }

          // Basic primality test (deterministic for very small numbers).
          function Z(t) {
            var e = t.abs();
            // Not prime if it's 0, 1, or divisible by small primes.
            return !e.isUnit() &&
              (!!(e.equals(2) || e.equals(3) || e.equals(5)) ||
                !(e.isEven() || e.isDivisibleBy(3) || e.isDivisibleBy(5)) &&
                (!!e.lesser(49) || void 0)); // 'void 0' is used for undefined.
          }

          // Miller-Rabin primality test helper function.
          function x(e, r) {
            for (var o, n, i,
                u = e.prev(), // e - 1
                p = u,
                a = 0; p.isEven();) {
              p = p.divide(2); // Find d and s such that e-1 = d * 2^s.
              a++;
            }
            t: for (n = 0; n < r.length; n++) {
              // For each witness 'r[n]'.
              if (!e.lesser(r[n]) && !(i = t(r[n]).modPow(p, e)).isUnit() && !i.equals(u)) {
                // If a^d mod n is not 1 and not -1.
                for (o = a - 1; 0 != o; o--) {
                  if ((i = i.square().mod(e)).isUnit()) return !1; // If a^(d*2^j) mod n is 1, then composite.
                  if (i.equals(u)) continue t; // If a^(d*2^j) mod n is -1, then possibly prime.
                }
                return !1; // Composite if no condition met.
              }
            }
            return !0; // Probably prime.
          }

          // --- Prototype Chain Setup ---
          // Establish inheritance from a common base (a.prototype) for all BigInt types.
          s.prototype = Object.create(a.prototype);
          l.prototype = Object.create(a.prototype);
          f.prototype = Object.create(a.prototype);

          // --- Arithmetic Methods ---

          // Addition for large BigInts.
          s.prototype.add = function (t) {
            var e = Q(t); // Ensure argument is a BigInt.
            // If signs are different, convert to subtraction.
            if (this.sign !== e.sign) return this.subtract(e.negate());
            var r = this.value,
              o = e.value;
            // Perform addition: large + small (converted) or large + large.
            return e.isSmall ? new s(b(r, Math.abs(o)), this.sign) : new s(w(r, o), this.sign);
          };
          s.prototype.plus = s.prototype.add; // Alias for add.

          // Addition for small BigInts.
          l.prototype.add = function (t) {
            var e = Q(t),
              r = this.value;
            // If signs are different (or specific negative small + positive small scenario), convert to subtraction.
            if (r < 0 !== e.sign) return this.subtract(e.negate());
            var o = e.value;
            // If both are small and result fits into a small BigInt.
            if (e.isSmall) {
              if (v(r + o)) return new l(r + o);
              o = h(Math.abs(o)); // Convert small operand to array for large addition.
            }
            // Perform addition: small (converted) + small (abs) array.
            return new s(b(o, Math.abs(r)), r < 0);
          };
          l.prototype.plus = l.prototype.add; // Alias for add.

          // Addition for native BigInts.
          f.prototype.add = function (t) {
            return new f(this.value + Q(t).value);
          };
          f.prototype.plus = f.prototype.add; // Alias for add.

          // Subtraction for large BigInts.
          s.prototype.subtract = function (t) {
            var e = Q(t); // Ensure argument is a BigInt.
            // If signs are different, convert to addition.
            if (this.sign !== e.sign) return this.add(e.negate());
            var r = this.value,
              o = e.value;
            // Perform subtraction: large - small (converted) or large - large.
            return e.isSmall ?
              q(r, Math.abs(o), this.sign) :
              function (t, e, r) {
                var o;
                // Compare magnitudes to determine order of subtraction and resulting sign.
                return P(t, e) >= 0 ?
                  o = S(t, e) :
                  (o = S(e, t), r = !r), // If t < e, swap and flip sign.
                  "number" == typeof (o = y(o)) ?
                  (r && (o = -o), new l(o)) :
                  new s(o, r);
              }(r, o, this.sign);
          };
          s.prototype.minus = s.prototype.subtract; // Alias for subtract.

          // Subtraction for small BigInts.
          l.prototype.subtract = function (t) {
            var e = Q(t),
              r = this.value;
            // If signs are different, convert to addition.
            if (r < 0 !== e.sign) return this.add(e.negate());
            var o = e.value;
            // If both are small, perform native subtraction.
            return e.isSmall ? new l(r - o) : q(o, Math.abs(r), r >= 0);
          };
          l.prototype.minus = l.prototype.subtract; // Alias for subtract.

          // Subtraction for native BigInts.
          f.prototype.subtract = function (t) {
            return new f(this.value - Q(t).value);
          };
          f.prototype.minus = f.prototype.subtract; // Alias for subtract.

          // Negation for large BigInts.
          s.prototype.negate = function () {
            return new s(this.value, !this.sign);
          };

          // Negation for small BigInts.
          l.prototype.negate = function () {
            var t = this.sign,
              e = new l(-this.value);
            return e.sign = !t, e;
          };

          // Negation for native BigInts.
          f.prototype.negate = function () {
            return new f(-this.value);
          };

          // Absolute value for large BigInts.
          s.prototype.abs = function () {
            return new s(this.value, !1); // Always positive.
          };

          // Absolute value for small BigInts.
          l.prototype.abs = function () {
            return new l(Math.abs(this.value));
          };

          // Absolute value for native BigInts.
          f.prototype.abs = function () {
            return new f(this.value >= 0 ? this.value : -this.value);
          };

          // Multiplication for large BigInts.
          s.prototype.multiply = function (t) {
            var e, o, n,
              i = Q(t), // Ensure argument is a BigInt.
              u = this.value,
              p = i.value,
              l = this.sign !== i.sign; // Determine the sign of the result.

            // Handle cases where the multiplier 'i' is small.
            if (i.isSmall) {
              if (0 === p) return a[0]; // Multiply by 0.
              if (1 === p) return this; // Multiply by 1.
              if (-1 === p) return this.negate(); // Multiply by -1.
              if ((e = Math.abs(p)) < r) return new s(N(u, e), l); // Use scalar multiplication 'N'.
              p = h(e); // Convert small multiplier to array if it's too large for N.
            }

            o = u.length;
            n = p.length;

            // Choose between Karatsuba-like multiplication (for specific sizes) or standard 'M'.
            return new s(-.012 * o - .012 * n + 15e-6 * o * n > 0 ?
              function t(e, r) {
                // Karatsuba-like multiplication for larger numbers.
                var o = Math.max(e.length, r.length);
                if (o <= 30) return M(e, r); // Base case: use standard multiplication for small arrays.
                o = Math.ceil(o / 2);
                var n = e.slice(o),
                  i = e.slice(0, o),
                  u = r.slice(o),
                  p = r.slice(0, o),
                  a = t(i, p), // Recursively multiply low parts.
                  s = t(n, u), // Recursively multiply high parts.
                  l = t(w(i, n), w(p, u)), // Multiply sums of parts.
                  f = w(w(a, E(S(S(l, a), s), o)), E(s, 2 * o)); // Combine results using Karatsuba formula.
                return c(f), f;
              }(u, p) :
              M(u, p), l); // Use standard long multiplication 'M'.
          };
          s.prototype.times = s.prototype.multiply; // Alias for multiply.

          // Helper for small BigInts to multiply by a small BigInt (which is 't').
          l.prototype._multiplyBySmall = function (t) {
            // If the result fits in a JS number, return a small BigInt.
            return v(t.value * this.value) ?
              new l(t.value * this.value) :
              O(Math.abs(t.value), h(Math.abs(this.value)), this.sign !== t.sign);
          };

          // Helper for large BigInts to multiply by a small BigInt (which is 't').
          s.prototype._multiplyBySmall = function (t) {
            return 0 === t.value ?
              a[0] :
              1 === t.value ?
              this :
              -1 === t.value ?
              this.negate() :
              O(Math.abs(t.value), this.value, this.sign !== t.sign);
          };

          // Multiplication for small BigInts.
          l.prototype.multiply = function (t) {
            return Q(t)._multiplyBySmall(this); // Delegate to _multiplyBySmall.
          };
          l.prototype.times = l.prototype.multiply; // Alias for multiply.

          // Multiplication for native BigInts.
          f.prototype.multiply = function (t) {
            return new f(this.value * Q(t).value);
          };
          f.prototype.times = f.prototype.multiply; // Alias for multiply.

          // Square for large BigInts.
          s.prototype.square = function () {
            return new s(B(this.value), !1); // Use optimized squaring function 'B'.
          };

          // Square for small BigInts.
          l.prototype.square = function () {
            var t = this.value * this.value;
            // If result fits in JS number, return small BigInt, else convert to array and use 'B'.
            return v(t) ? new l(t) : new s(B(h(Math.abs(this.value))), !1);
          };

          // Square for native BigInts.
          f.prototype.square = function (t) {
            return new f(this.value * this.value);
          };

          // Divmod (division and modulo) for BigInts.
          s.prototype.divmod = function (t) {
            var e = A(this, t); // Use the division function 'A'.
            return {
              quotient: e[0],
              remainder: e[1]
            };
          };
          f.prototype.divmod = l.prototype.divmod = s.prototype.divmod; // Share implementation.

          // Division for BigInts.
          s.prototype.divide = function (t) {
            return A(this, t)[0]; // Return only the quotient.
          };

          // Division for native BigInts.
          f.prototype.over = f.prototype.divide = function (t) {
            return new f(this.value / Q(t).value);
          };
          l.prototype.over = l.prototype.divide = s.prototype.over = s.prototype.divide; // Share implementation and aliases.

          // Modulo for BigInts.
          s.prototype.mod = function (t) {
            return A(this, t)[1]; // Return only the remainder.
          };

          // Modulo for native BigInts.
          f.prototype.mod = f.prototype.remainder = function (t) {
            return new f(this.value % Q(t).value);
          };
          l.prototype.remainder = l.prototype.mod = s.prototype.remainder = s.prototype.mod; // Share implementation and aliases.

          // Exponentiation (power) for BigInts.
          s.prototype.pow = function (t) {
            var e, r, o,
              n = Q(t), // Ensure exponent is a BigInt.
              i = this.value,
              u = n.value;

            if (0 === u) return a[1]; // x^0 = 1.
            if (0 === i) return a[0]; // 0^x = 0 (for x > 0).
            if (1 === i) return a[1]; // 1^x = 1.
            if (-1 === i) return n.isEven() ? a[1] : a[-1]; // (-1)^x.
            if (n.sign) return a[0]; // x^negative_exponent = 0 (for integer results).
            if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");

            // If base and exponent are small and result fits into a JS number.
            if (this.isSmall && v(e = Math.pow(i, u))) return new l(m(e));

            // Binary exponentiation (exponentiation by squaring).
            for (r = this, o = a[1]; !0 & u && (o = o.times(r), --u), 0 !== u;) {
              u /= 2;
              r = r.square();
            }
            return o;
          };
          l.prototype.pow = s.prototype.pow; // Share implementation.

          // Exponentiation for native BigInts.
          f.prototype.pow = function (t) {
            var e = Q(t),
              r = this.value,
              o = e.value,
              n = BigInt(0),
              i = BigInt(1),
              u = BigInt(2);

            if (o === n) return a[1];
            if (r === n) return a[0];
            if (r === i) return a[1];
            if (r === BigInt(-1)) return e.isEven() ? a[1] : a[-1];
            if (e.isNegative()) return new f(n);

            for (var p = this, s = a[1];
              (o & i) === i && (s = s.times(p), --o), o !== n;) {
              o /= u;
              p = p.square();
            }
            return s;
          };

          // Modular exponentiation (modPow).
          s.prototype.modPow = function (t, e) {
            if (t = Q(t), (e = Q(e)).isZero()) throw new Error("Cannot take modPow with modulus 0");

            for (var r = a[1], o = this.mod(e); t.isPositive();) {
              if (o.isZero()) return a[0]; // If base mod modulus is 0, result is 0.
              t.isOdd() && (r = r.multiply(o).mod(e));
              t = t.divide(2);
              o = o.square().mod(e);
            }
            return r;
          };
          f.prototype.modPow = l.prototype.modPow = s.prototype.modPow; // Share implementation.

          // --- Comparison Methods ---

          // Compares absolute values of two BigInts.
          s.prototype.compareAbs = function (t) {
            var e = Q(t),
              r = this.value,
              o = e.value;
            return e.isSmall ? 1 : P(r, o); // If 'e' is small, 'this' (large) is greater.
          };

          // Compares absolute values for small BigInts.
          l.prototype.compareAbs = function (t) {
            var e = Q(t),
              r = Math.abs(this.value),
              o = e.value;
            return e.isSmall ? r === (o = Math.abs(o)) ? 0 : r > o ? 1 : -1 : -1; // If 'e' is large, 'this' (small) is lesser.
          };

          // Compares absolute values for native BigInts.
          f.prototype.compareAbs = function (t) {
            var e = this.value,
              r = Q(t).value;
            return (e = e >= 0 ? e : -e) === (r = r >= 0 ? r : -r) ? 0 : e > r ? 1 : -1;
          };

          // General comparison of two BigInts.
          s.prototype.compare = function (t) {
            if (t === 1 / 0) return -1; // Less than positive infinity.
            if (t === -1 / 0) return 1; // Greater than negative infinity.

            var e = Q(t),
              r = this.value,
              o = e.value;

            // Handle different signs.
            if (this.sign !== e.sign) return e.sign ? 1 : -1; // If 'e' is negative, 'this' (positive) is greater. If 'e' is positive, 'this' (negative) is lesser.

            // Handle same signs.
            return e.isSmall ?
              this.sign ? -1 : 1 : // If 'e' is small, 'this' (large) is greater if positive, lesser if negative.
              P(r, o) * (this.sign ? -1 : 1); // Compare magnitudes and adjust for sign.
          };
          s.prototype.compareTo = s.prototype.compare; // Alias.

          // Comparison for small BigInts.
          l.prototype.compare = function (t) {
            if (t === 1 / 0) return -1;
            if (t === -1 / 0) return 1;

            var e = Q(t),
              r = this.value,
              o = e.value;

            return e.isSmall ?
              r == o ? 0 : r > o ? 1 : -1 : // Both small.
              r < 0 !== e.sign ?
              r < 0 ? -1 : 1 : // Signs differ.
              r < 0 ? 1 : -1; // Both negative or both positive, but one is small and one is large.
          };
          l.prototype.compareTo = l.prototype.compare; // Alias.

          // Comparison for native BigInts.
          f.prototype.compare = function (t) {
            if (t === 1 / 0) return -1;
            if (t === -1 / 0) return 1;

            var e = this.value,
              r = Q(t).value;
            return e === r ? 0 : e > r ? 1 : -1;
          };
          f.prototype.compareTo = f.prototype.compare; // Alias.

          // Equality check.
          s.prototype.equals = function (t) {
            return 0 === this.compare(t);
          };
          f.prototype.eq = f.prototype.equals = l.prototype.eq = l.prototype.equals = s.prototype.eq = s.prototype.equals; // Aliases.

          // Inequality check.
          s.prototype.notEquals = function (t) {
            return 0 !== this.compare(t);
          };
          f.prototype.neq = f.prototype.notEquals = l.prototype.neq = l.prototype.notEquals = s.prototype.neq = s.prototype.notEquals; // Aliases.

          // Greater than.
          s.prototype.greater = function (t) {
            return this.compare(t) > 0;
          };
          f.prototype.gt = f.prototype.greater = l.prototype.gt = l.prototype.greater = s.prototype.gt = s.prototype.greater; // Aliases.

          // Lesser than.
          s.prototype.lesser = function (t) {
            return this.compare(t) < 0;
          };
          f.prototype.lt = f.prototype.lesser = l.prototype.lt = l.prototype.lesser = s.prototype.lt = s.prototype.lesser; // Aliases.

          // Greater than or equals.
          s.prototype.greaterOrEquals = function (t) {
            return this.compare(t) >= 0;
          };
          f.prototype.geq = f.prototype.greaterOrEquals = l.prototype.geq = l.prototype.greaterOrEquals = s.prototype.geq = s.prototype.greaterOrEquals; // Aliases.

          // Lesser than or equals.
          s.prototype.lesserOrEquals = function (t) {
            return this.compare(t) <= 0;
          };
          f.prototype.leq = f.prototype.lesserOrEquals = l.prototype.leq = l.prototype.lesserOrEquals = s.prototype.leq = s.prototype.lesserOrEquals; // Aliases.

          // --- Property Checks ---

          // Check if a large BigInt is even.
          s.prototype.isEven = function () {
            return 0 == (1 & this.value[0]); // Check the least significant digit.
          };

          // Check if a small BigInt is even.
          l.prototype.isEven = function () {
            return 0 == (1 & this.value); // Check the number itself.
          };

          // Check if a native BigInt is even.
          f.prototype.isEven = function () {
            return (this.value & BigInt(1)) === BigInt(0);
          };

          // Check if a large BigInt is odd.
          s.prototype.isOdd = function () {
            return 1 == (1 & this.value[0]);
          };

          // Check if a small BigInt is odd.
          l.prototype.isOdd = function () {
            return 1 == (1 & this.value);
          };

          // Check if a native BigInt is odd.
          f.prototype.isOdd = function () {
            return (this.value & BigInt(1)) === BigInt(1);
          };

          // Check if a large BigInt is positive.
          s.prototype.isPositive = function () {
            return !this.sign;
          };

          // Check if a small BigInt is positive.
          l.prototype.isPositive = function () {
            return this.value > 0;
          };
          f.prototype.isPositive = l.prototype.isPositive; // Share implementation.

          // Check if a large BigInt is negative.
          s.prototype.isNegative = function () {
            return this.sign;
          };

          // Check if a small BigInt is negative.
          l.prototype.isNegative = function () {
            return this.value < 0;
          };
          f.prototype.isNegative = l.prototype.isNegative; // Share implementation.

          // Check if a large BigInt is 1 or -1 (a unit).
          s.prototype.isUnit = function () {
            return !1; // Large numbers are never units by this definition.
          };

          // Check if a small BigInt is 1 or -1.
          l.prototype.isUnit = function () {
            return 1 === Math.abs(this.value);
          };

          // Check if a native BigInt is 1 or -1.
          f.prototype.isUnit = function () {
            return this.abs().value === BigInt(1);
          };

          // Check if a large BigInt is zero.
          s.prototype.isZero = function () {
            return !1; // Large numbers are never zero by this definition.
          };

          // Check if a small BigInt is zero.
          l.prototype.isZero = function () {
            return 0 === this.value;
          };

          // Check if a native BigInt is zero.
          f.prototype.isZero = function () {
            return this.value === BigInt(0);
          };

          // Check if divisible by another BigInt.
          s.prototype.isDivisibleBy = function (t) {
            var e = Q(t);
            return !e.isZero() && // Cannot divide by zero.
              (!!e.isUnit() || // Always divisible by 1 or -1.
                (0 === e.compareAbs(2) ?
                  this.isEven() : // Divisible by 2 if even.
                  this.mod(e).isZero())); // Otherwise, check if remainder is zero.
          };
          f.prototype.isDivisibleBy = l.prototype.isDivisibleBy = s.prototype.isDivisibleBy; // Share implementation.

          // Primality test.
          s.prototype.isPrime = function (e) {
            var r = Z(this);
            if (void 0 !== r) return r; // Use basic checks for very small numbers.

            var o = this.abs(),
              n = o.bitLength();
            if (n <= 64) return x(o, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]); // Miller-Rabin with fixed witnesses for 64-bit numbers.

            // For larger numbers, compute a sufficient number of witnesses.
            for (var i = Math.log(2) * n.toJSNumber(), u = Math.ceil(!0 === e ? 2 * Math.pow(i, 2) : i), p = [], a = 0; a < u; a++) {
              p.push(t(a + 2)); // Use a+2 as witnesses.
            }
            return x(o, p); // Run Miller-Rabin with computed witnesses.
          };
          f.prototype.isPrime = l.prototype.isPrime = s.prototype.isPrime; // Share implementation.

          // Probabilistic primality test.
          s.prototype.isProbablePrime = function (e) {
            var r = Z(this);
            if (void 0 !== r) return r; // Use basic checks.

            for (var o = this.abs(), n = void 0 === e ? 5 : e, i = [], u = 0; u < n; u++) {
              i.push(t.randBetween(2, o.minus(2))); // Generate random witnesses.
            }
            return x(o, i); // Run Miller-Rabin with random witnesses.
          };
          f.prototype.isProbablePrime = l.prototype.isProbablePrime = s.prototype.isProbablePrime; // Share implementation.

          // Modular multiplicative inverse.
          s.prototype.modInv = function (e) {
            for (var r, o, n,
                i = t.zero, // Initial coefficient for extended Euclidean algorithm.
                u = t.one, // Initial coefficient.
                p = Q(e), // Modulus.
                a = this.abs(); !a.isZero();) {
              r = p.divide(a); // Quotient.
              o = i;
              n = p;
              i = u;
              p = a;
              u = o.subtract(r.multiply(u)); // Update coefficients.
              a = n.subtract(r.multiply(a)); // Update remainders.
            }
            if (!p.isUnit()) throw new Error(this.toString() + " and " + e.toString() + " are not co-prime");

            // Adjust result to be positive.
            return -1 === i.compare(0) && (i = i.add(e)), this.isNegative() ? i.negate() : i;
          };
          f.prototype.modInv = l.prototype.modInv = s.prototype.modInv; // Share implementation.

          // Increment (next number).
          s.prototype.next = function () {
            var t = this.value;
            return this.sign ? q(t, 1, this.sign) : new s(b(t, 1), this.sign);
          };
          l.prototype.next = function () {
            var t = this.value;
            return t + 1 < n ? new l(t + 1) : new s(i, !1); // If it exceeds safe integer, convert to large.
          };
          f.prototype.next = function () {
            return new f(this.value + BigInt(1));
          };

          // Decrement (previous number).
          s.prototype.prev = function () {
            var t = this.value;
            return this.sign ? new s(b(t, 1), !0) : q(t, 1, this.sign);
          };
          l.prototype.prev = function () {
            var t = this.value;
            return t - 1 > -n ? new l(t - 1) : new s(i, !0); // If it drops below safe integer, convert to large.
          };
          f.prototype.prev = function () {
            return new f(this.value - BigInt(1));
          };

          // --- Bitwise Operations Setup ---

          // Precompute powers of 2 (up to base 'r') for efficient shifting.
          for (var J = [1]; 2 * J[J.length - 1] <= r;) J.push(2 * J[J.length - 1]);
          var L = J.length, // Number of precomputed powers of 2.
            U = J[L - 1]; // The largest precomputed power (which is 2^(L-1)).

          // Checks if a number 't' is within the range of base 'r'.
          function T(t) {
            return Math.abs(t) <= r;
          }

          // Generic bitwise operation function.
          function j(e, r, o) {
            r = Q(r); // Ensure second operand is a BigInt.
            for (var n = e.isNegative(), i = r.isNegative(), u = n ? e.not() : e, p = i ? r.not() : r, a = 0, s = 0, l = null, f = null, v = []; !u.isZero() || !p.isZero();) {
              a = (l = A(u, U))[1].toJSNumber(); // Get remainder of 'u' divided by 'U'.
              n && (a = U - 1 - a); // Invert bits for negative numbers (two's complement logic).
              s = (f = A(p, U))[1].toJSNumber(); // Get remainder of 'p' divided by 'U'.
              i && (s = U - 1 - s); // Invert bits for negative numbers.
              u = l[0]; // Quotient becomes the new 'u'.
              p = f[0]; // Quotient becomes the new 'p'.
              v.push(o(a, s)); // Apply the bitwise operation 'o' to the current bits.
            }
            // Combine the results, handling the sign.
            for (var h = 0 !== o(n ? 1 : 0, i ? 1 : 0) ? t(-1) : t(0), y = v.length - 1; y >= 0; y -= 1) {
              h = h.multiply(U).add(t(v[y]));
            }
            return h;
          }

          // Left bit shift.
          s.prototype.shiftLeft = function (t) {
            var e = Q(t).toJSNumber();
            if (!T(e)) throw new Error(String(e) + " is too large for shifting.");
            if (e < 0) return this.shiftRight(-e); // If negative shift amount, shift right.

            var r = this;
            if (r.isZero()) return r;

            // Perform shifts in chunks of 'L' (which corresponds to multiplying by 'U').
            for (; e >= L;) {
              r = r.multiply(U);
              e -= L - 1;
            }
            return r.multiply(J[e]); // Perform the final shift by multiplying by the remaining power of 2.
          };
          f.prototype.shiftLeft = l.prototype.shiftLeft = s.prototype.shiftLeft; // Share implementation.

          // Right bit shift.
          s.prototype.shiftRight = function (t) {
            var e, r = Q(t).toJSNumber();
            if (!T(r)) throw new Error(String(r) + " is too large for shifting.");
            if (r < 0) return this.shiftLeft(-r); // If negative shift amount, shift left.

            for (var o = this; r >= L;) {
              if (o.isZero() || o.isNegative() && o.isUnit()) return o; // Handle cases that become 0 or -1.
              o = (e = A(o, U))[1].isNegative() ? e[0].prev() : e[0]; // Divide by 'U'.
              r -= L - 1;
            }
            // Perform the final division.
            return (e = A(o, J[r]))[1].isNegative() ? e[0].prev() : e[0];
          };
          f.prototype.shiftRight = l.prototype.shiftRight = s.prototype.shiftRight; // Share implementation.

          // Bitwise NOT.
          s.prototype.not = function () {
            return this.negate().prev(); // ~x = -x - 1.
          };
          f.prototype.not = l.prototype.not = s.prototype.not; // Share implementation.

          // Bitwise AND.
          s.prototype.and = function (t) {
            return j(this, t, function (t, e) {
              return t & e;
            });
          };
          f.prototype.and = l.prototype.and = s.prototype.and; // Share implementation.

          // Bitwise OR.
          s.prototype.or = function (t) {
            return j(this, t, function (t, e) {
              return t | e;
            });
          };
          f.prototype.or = l.prototype.or = s.prototype.or; // Share implementation.

          // Bitwise XOR.
          s.prototype.xor = function (t) {
            return j(this, t, function (t, e) {
              return t ^ e;
            });
          };
          f.prototype.xor = l.prototype.xor = s.prototype.xor; // Share implementation.

          // --- Other Utility Functions ---

          // Constants related to bit length and lowest set bit calculation.
          var C = 1 << 30, // 2^30.
            D = (r & -r) * (r & -r) | C; // A composite value used in bit manipulation.

          // Calculates the value of the lowest set bit (e.g., z(6) -> 2, z(12) -> 4).
          function z(t) {
            var e = t.value,
              o = "number" == typeof e ? e | C : "bigint" == typeof e ? e | BigInt(C) : e[0] + e[1] * r | D;
            return o & -o; // Trick to isolate the lowest set bit.
          }

          // Returns the maximum of two BigInts.
          function R(t, e) {
            return t = Q(t), e = Q(e), t.greater(e) ? t : e;
          }

          // Returns the minimum of two BigInts.
          function k(t, e) {
            return t = Q(t), e = Q(e), t.lesser(e) ? t : e;
          }

          // Computes the Greatest Common Divisor (GCD) of two BigInts using binary GCD algorithm.
          function _(t, e) {
            if (t = Q(t).abs(), e = Q(e).abs(), t.equals(e)) return t;
            if (t.isZero()) return e;
            if (e.isZero()) return t;

            for (var r, o, n = a[1]; t.isEven() && e.isEven();) {
              r = k(z(t), z(e)); // Extract common factors of 2 (lowest set bit).
              t = t.divide(r);
              e = e.divide(r);
              n = n.multiply(r); // Accumulate common factors.
            }
            for (; t.isEven();) t = t.divide(z(t)); // Remove remaining factors of 2 from 't'.
            do {
              for (; e.isEven();) e = e.divide(z(e)); // Remove remaining factors of 2 from 'e'.
              t.greater(e) && (o = e, e = t, t = o); // Ensure t <= e.
              e = e.subtract(t); // Euclidean algorithm step: e = e - t.
            } while (!e.isZero());
            return n.isUnit() ? t : t.multiply(n); // Multiply back the common factors of 2.
          }

          // Calculates the bit length of a BigInt.
          s.prototype.bitLength = function () {
            var e = this;
            // For negative numbers, bit length is calculated on (abs(n) - 1).
            return e.compareTo(t(0)) < 0 && (e = e.negate().subtract(t(1))),
              0 === e.compareTo(t(0)) ?
              t(0) :
              t(function e(r, o) {
                // Recursive helper to find bit length.
                if (o.compareTo(r) <= 0) {
                  var n = e(r, o.square(o)),
                    i = n.p,
                    u = n.e,
                    p = i.multiply(o);
                  return p.compareTo(r) <= 0 ?
                    {
                      p: p,
                      e: 2 * u + 1
                    } :
                    {
                      p: i,
                      e: 2 * u
                    };
                }
                return {
                  p: t(1),
                  e: 0
                };
              }(e, t(2)).e).add(t(1)); // Add 1 because bitLength of 1 is 1, not 0.
          };
          f.prototype.bitLength = l.prototype.bitLength = s.prototype.bitLength; // Share implementation.

          // Parses a string 't' into a BigInt, given a base 'e', custom digits 'r', and case-sensitivity 'o'.
          var $ = function (t, e, r, o) {
            r = r || u; // Default to 'u' (0-9a-z) if no custom digits provided.
            t = String(t);
            o || (t = t.toLowerCase(), r = r.toLowerCase()); // Convert to lowercase for case-insensitive parsing.

            var n, i = t.length,
              p = Math.abs(e),
              a = {};

            // Create a map from digit characters to their numeric values.
            for (n = 0; n < r.length; n++) a[r[n]] = n;

            // Validate that all digits in the input string are valid for the given base.
            for (n = 0; n < i; n++) {
              if ("-" !== (f = t[n]) && (f in a && a[f] >= p)) {
                if ("1" === f && 1 === p) continue; // Special case for base 1 (unary).
                throw new Error(f + " is not a valid digit in base " + e + ".");
              }
            }

            e = Q(e); // Ensure the base is a BigInt.
            var s = [],
              l = "-" === t[0]; // Check if the number is negative.

            // Parse the string into an array of BigInt digits.
            for (n = l ? 1 : 0; n < t.length; n++) {
              var f;
              if ((f = t[n]) in a) {
                s.push(Q(a[f])); // Standard digit.
              } else {
                if ("<" !== f) throw new Error(f + " is not a valid character");
                var v = n;
                do {
                  n++;
                } while (">" !== t[n] && n < t.length);
                s.push(Q(t.slice(v + 1, n))); // Custom digit format "<value>".
              }
            }
            return F(s, e, l); // Convert the array of digits to a BigInt.
          };

          // Converts an array of BigInt digits 't' in a given base 'e' into a single BigInt.
          function F(t, e, r) {
            var o, n = a[0],
              i = a[1]; // Initialize result to 0, power to 1.
            for (o = t.length - 1; o >= 0; o--) {
              n = n.add(t[o].times(i)); // result += digit * power.
              i = i.times(e); // power *= base.
            }
            return r ? n.negate() : n; // Apply the sign.
          }

          // Converts a BigInt 'e' to an array of digits in a given base 'r'.
          function G(e, r) {
            if ((r = t(r)).isZero()) {
              if (e.isZero()) return {
                value: [0],
                isNegative: !1
              };
              throw new Error("Cannot convert nonzero numbers to base 0.");
            }
            if (r.equals(-1)) {
              // Special handling for base -1.
              if (e.isZero()) return {
                value: [0],
                isNegative: !1
              };
              if (e.isNegative()) return {
                value: [].concat.apply([], Array.apply(null, Array(-e.toJSNumber())).map(Array.prototype.valueOf, [1, 0])),
                isNegative: !1
              };
              var o = Array.apply(null, Array(e.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
              return o.unshift([1]), {
                value: [].concat.apply([], o),
                isNegative: !1
              };
            }

            var n = !1;
            // If the number is negative and the base is positive, make the number positive and set the negative flag.
            if (e.isNegative() && r.isPositive() && (n = !0, e = e.abs()), r.isUnit()) {
              // Special handling for base 1 or -1.
              return e.isZero() ?
                {
                  value: [0],
                  isNegative: !1
                } :
                {
                  value: Array.apply(null, Array(e.toJSNumber())).map(Number.prototype.valueOf, 1),
                  isNegative: n
                };
            }

            for (var i, u = [], p = e; p.isNegative() || p.compareAbs(r) >= 0;) {
              i = p.divmod(r); // Divide by base.
              p = i.quotient;
              var a = i.remainder;
              // Adjust for negative remainders in non-standard bases.
              a.isNegative() && (a = r.minus(a).abs(), p = p.next());
              u.push(a.toJSNumber()); // Store the remainder as a digit.
            }
            return u.push(p.toJSNumber()), {
              value: u.reverse(),
              isNegative: n
            }; // Reverse and return.
          }

          // Formats an array of digits (from G) into a string representation.
          function H(t, e, r) {
            var o = G(t, e); // Get digits array.
            return (o.isNegative ? "-" : "") + o.value.map(function (t) {
              return function (t, e) {
                return t < (e = e || u).length ? e[t] : "<" + t + ">"; // Use custom digits or default.
              }(t, r);
            }).join("");
          }

          // Parses an integer string 't' into a BigInt.
          function K(t) {
            // If the number fits in a JS number, create a small BigInt.
            if (v(+t)) {
              var e = +t;
              if (e === m(e)) return p ? new f(BigInt(e)) : new l(e);
              throw new Error("Invalid integer: " + t);
            }

            var r = "-" === t[0];
            r && (t = t.slice(1)); // Remove sign for parsing.

            var n = t.split(/e/i); // Handle scientific notation.
            if (n.length > 2) throw new Error("Invalid integer: " + n.join("e"));
            if (2 === n.length) {
              var i = n[1];
              if ("+" === i[0] && (i = i.slice(1)), (i = +i) !== m(i) || !v(i)) throw new Error("Invalid integer: " + i + " is not a valid exponent.");
              var u = n[0],
                a = u.indexOf(".");
              if (a >= 0 && (i -= u.length - a - 1, u = u.slice(0, a) + u.slice(a + 1)), i < 0) throw new Error("Cannot include negative exponent part for integers");
              t = u += new Array(i + 1).join("0"); // Apply exponent by adding zeros.
            }

            if (!/^([0-9][0-9]*)$/.test(t)) throw new Error("Invalid integer: " + t);

            // If native BigInts are supported, use them.
            if (p) return new f(BigInt(r ? "-" + t : t));

            // Convert string to internal array representation.
            for (var h = [], y = t.length, g = o, d = y - g; y > 0;) {
              h.push(+t.slice(d, y)); // Extract chunks of digits.
              (d -= g) < 0 && (d = 0);
              y -= g;
            }
            return c(h), new s(h, r); // Trim zeros and create a large BigInt.
          }

          // Converts various input types (number, string, bigint, BigInt object) to a BigInt instance.
          function Q(t) {
            return "number" == typeof t ?
              function (t) {
                if (p) return new f(BigInt(t)); // Native BigInt.
                if (v(t)) {
                  if (t !== m(t)) throw new Error(t + " is not an integer.");
                  return new l(t); // Small BigInt.
                }
                return K(t.toString()); // Convert to string then parse as large BigInt.
              }(t) :
              "string" == typeof t ?
              K(t) : // Parse string.
              "bigint" == typeof t ?
              new f(t) : // Native BigInt.
              t; // Assume 't' is already a BigInt object.
          }

          // --- Instance Methods for Conversion and Representation ---

          // Converts a BigInt to an array of digits in a given base.
          s.prototype.toArray = function (t) {
            return G(this, t);
          };
          l.prototype.toArray = function (t) {
            return G(this, t);
          };
          f.prototype.toArray = function (t) {
            return G(this, t);
          };

          // Converts a BigInt to its string representation.
          s.prototype.toString = function (t, e) {
            if (void 0 === t && (t = 10), 10 !== t) return H(this, t, e); // Use H for non-base-10.

            for (var r, o = this.value, n = o.length, i = String(o[--n]); --n >= 0;) {
              r = String(o[n]);
              i += "0000000".slice(r.length) + r; // Pad with leading zeros for each chunk.
            }
            return (this.sign ? "-" : "") + i;
          };

          // Converts a small BigInt to its string representation.
          l.prototype.toString = function (t, e) {
            return void 0 === t && (t = 10), 10 != t ? H(this, t, e) : String(this.value);
          };
          f.prototype.toString = l.prototype.toString; // Share implementation.

          // JSON serialization method.
          f.prototype.toJSON = s.prototype.toJSON = l.prototype.toJSON = function () {
            return this.toString();
          };

          // Converts a large BigInt to a JavaScript number (may lose precision).
          s.prototype.valueOf = function () {
            return parseInt(this.toString(), 10);
          };
          s.prototype.toJSNumber = s.prototype.valueOf; // Alias.

          // Converts a small BigInt to a JavaScript number.
          l.prototype.valueOf = function () {
            return this.value;
          };
          l.prototype.toJSNumber = l.prototype.valueOf; // Alias.

          // Converts a native BigInt to a JavaScript number (may lose precision).
          f.prototype.valueOf = f.prototype.toJSNumber = function () {
            return parseInt(this.toString(), 10);
          };

          // --- Pre-calculated BigInts and Exports ---

          // Cache BigInt instances for small integer values (0 to 999 and their negatives).
          for (var V = 0; V < 1e3; V++) {
            a[V] = Q(V);
            V > 0 && (a[-V] = Q(-V));
          }

          // Export common BigInt constants and utility functions.
          return a.one = a[1], // BigInt(1).
            a.zero = a[0], // BigInt(0).
            a.minusOne = a[-1], // BigInt(-1).
            a.max = R, // Maximum function.
            a.min = k, // Minimum function.
            a.gcd = _, // Greatest Common Divisor function.
            a.lcm = function (t, e) {
              // Least Common Multiple function.
              return t = Q(t).abs(), e = Q(e).abs(), t.divide(_(t, e)).multiply(e);
            },
            a.isInstance = function (t) {
              // Checks if an object is a BigInt instance.
              return t instanceof s || t instanceof l || t instanceof f;
            },
            a.randBetween = function (t, e) {
              // Generates a random BigInt between 't' and 'e' (inclusive).
              var o = k(t = Q(t), e = Q(e)),
                n = R(t, e).subtract(o).add(1);
              if (n.isSmall) return o.add(Math.floor(Math.random() * n));

              for (var i = G(n, r).value, u = [], p = !0, s = 0; s < i.length; s++) {
                var l = p ? i[s] : r,
                  f = m(Math.random() * l);
                u.push(f);
                f < l && (p = !1);
              }
              return o.add(a.fromArray(u, r, !1));
            },
            a.fromArray = function (t, e, r) {
              // Creates a BigInt from an array of digits in a given base.
              return F(t.map(Q), Q(e || 10), r);
            },
            a; // Return the BigInt factory function with all its properties.
        }(); // End of big-integer library IIFE.

        // --- Module Exports ---
        // Export the BigInt library for CommonJS environments.
        "undefined" != typeof module && module.hasOwnProperty("exports") && (module.exports = t);
        // Export the BigInt library for AMD environments.
        "function" == typeof define && define.amd && define("big-integer", [], function () {
          return t;
        });
      }, {}
    ],
    "Focm": [
      function (require, module, exports) {
        // This file contains Purescript-generated JavaScript code,
        // which wraps the 'big-integer' library and other Purescript modules.

        var n = {}; // Main namespace object for Purescript modules.

        // --- Data.BigInt Module ---
        ! function (n) {
          var t = require("big-integer"); // Import the big-integer library.

          // Curried function to parse a BigInt from a string in a given base.
          // It takes a 'Just' constructor, a 'Nothing' value, the base, and the string.
          n["fromBase'"] = function (n) {
            return function (r) {
              return function (e) {
                return function (a) {
                  try {
                    var i = t(a, e); // Attempt to parse the string to a BigInt.
                    return n(i); // If successful, wrap in 'Just'.
                  } catch (o) {
                    return r; // If parsing fails, return 'Nothing'.
                  }
                };
              };
            };
          };

          // Converts a JavaScript number to a BigInt.
          n.fromInt = function (n) {
            return t(n);
          };

          // Curried function to convert a BigInt to its string representation in a given base.
          n.toBase = function (n) {
            return function (t) {
              return t.toString(n);
            };
          };

          // Curried function for BigInt addition.
          n.biAdd = function (n) {
            return function (t) {
              return n.add(t);
            };
          };

          // Curried function for BigInt multiplication.
          n.biMul = function (n) {
            return function (t) {
              return n.multiply(t);
            };
          };

          // Curried function for BigInt subtraction.
          n.biSub = function (n) {
            return function (t) {
              return n.minus(t);
            };
          };

          // Curried function for BigInt modulo.
          n.biMod = function (n) {
            return function (t) {
              return n.mod(t);
            };
          };

          // Curried function for BigInt equality check.
          n.biEquals = function (n) {
            return function (t) {
              return n.equals(t);
            };
          };

          // Checks if a BigInt is even.
          n.even = function (n) {
            return n.isEven();
          };

          // Curried function for BigInt bitwise XOR.
          n.xor = function (n) {
            return function (t) {
              return n.xor(t);
            };
          };
        }(n["Data.BigInt"] = n["Data.BigInt"] || {}); // Define Data.BigInt namespace.

        // --- Data.Eq Module ---
        ! function (t) {
          "use strict";
          // Dependencies, not directly used here but part of the Purescript module system.
          n["Data.Eq"], n["Data.HeytingAlgebra"], n["Data.Symbol"], n["Data.Unit"], n["Data.Void"], n["Record.Unsafe"], n["Type.Data.RowList"];
          // Eq type class constructor.
          t.Eq = function (n) {
            this.eq = n;
          };
          // Function to get the 'eq' method from an Eq instance.
          t.eq = function (n) {
            return n.eq;
          };
        }(n["Data.Eq"] = n["Data.Eq"] || {});

        // --- Data.Functor (arrayMap) Module ---
        ! function (t) {
          "use strict";
          // Defines an array map function.
          (n["Data.Functor"] = n["Data.Functor"] || {}).arrayMap = function (n) {
            return function (t) {
              for (var r = t.length, e = new Array(r), a = 0; a < r; a++) e[a] = n(t[a]);
              return e;
            };
          };
        }();

        // --- Data.Functor Module ---
        ! function (t) {
          "use strict";
          var r = n["Data.Functor"],
            e = (n["Control.Semigroupoid"], n["Data.Function"], n["Data.Unit"], function (n) {
              this.map = n;
            }),
            a = new e(r.arrayMap);
          // Functor type class constructor.
          t.Functor = e;
          // Function to get the 'map' method from a Functor instance.
          t.map = function (n) {
            return n.map;
          };
          // Array Functor instance.
          t.functorArray = a;
        }(n["Data.Functor"] = n["Data.Functor"] || {});

        // --- Data.Show Module ---
        ! function (t) {
          "use strict";
          // Dependencies.
          n["Data.Show"], n["Data.Symbol"], n["Record.Unsafe"], n["Type.Data.RowList"];
          // Show type class constructor.
          t.Show = function (n) {
            this.show = n;
          };
          // Function to get the 'show' method from a Show instance.
          t.show = function (n) {
            return n.show;
          };
        }(n["Data.Show"] = n["Data.Show"] || {});

        // --- Data.Maybe Module ---
        ! function (t) {
          "use strict";
          // Many dependencies are listed, typical for Purescript modules.
          n["Control.Alt"], n["Control.Alternative"], n["Control.Applicative"], n["Control.Apply"], n["Control.Bind"], n["Control.Category"], n["Control.Extend"], n["Control.Monad"], n["Control.MonadZero"], n["Control.Plus"], n["Data.Bounded"], n["Data.Eq"], n["Data.Function"], n["Data.Functor"], n["Data.Functor.Invariant"], n["Data.Monoid"], n["Data.Ord"], n["Data.Ordering"], n["Data.Semigroup"], n["Data.Show"], n["Data.Unit"], n.Prelude;
          // Nothing constructor (singleton).
          var r = function () {
              function n() {}
              return n.value = new n(), n;
            }(),
            // Just constructor.
            e = function () {
              function n(n) {
                this.value0 = n;
              }
              return n.create = function (t) {
                return new n(t);
              }, n;
            }();
          t.Nothing = r;
          t.Just = e;
        }(n["Data.Maybe"] = n["Data.Maybe"] || {});

        // --- Data.Semiring Module ---
        ! function (t) {
          "use strict";
          // Dependencies.
          n["Data.Semiring"], n["Data.Symbol"], n["Data.Unit"], n["Record.Unsafe"], n["Type.Data.Row"], n["Type.Data.RowList"];
          // Semiring type class constructor.
          t.Semiring = function (n, t, r, e) {
            this.add = n, this.mul = t, this.one = r, this.zero = e;
          };
          // Functions to get Semiring methods.
          t.add = function (n) {
            return n.add;
          };
          t.zero = function (n) {
            return n.zero;
          };
          t.mul = function (n) {
            return n.mul;
          };
          t.one = function (n) {
            return n.one;
          };
        }(n["Data.Semiring"] = n["Data.Semiring"] || {});

        // --- Data.Ring Module ---
        ! function (t) {
          "use strict";
          // Dependencies.
          n["Data.Ring"], n["Data.Semiring"], n["Data.Symbol"], n["Data.Unit"], n["Record.Unsafe"], n["Type.Data.RowList"];
          // Ring type class constructor (inherits from Semiring).
          t.Ring = function (n, t) {
            this.Semiring0 = n, this.sub = t;
          };
          // Function to get the 'sub' method from a Ring instance.
          t.sub = function (n) {
            return n.sub;
          };
        }(n["Data.Ring"] = n["Data.Ring"] || {});

        // --- Partial.Unsafe Module ---
        ! function (t) {
          "use strict";
          // unsafePartial function.
          (n["Partial.Unsafe"] = n["Partial.Unsafe"] || {}).unsafePartial = function (n) {
            return n();
          };
        }();

        // --- Partial Module (crashWith) ---
        ! function (t) {
          "use strict";
          // crashWith function.
          (n["Partial"] = n["Partial"] || {}).crashWith = function () {
            return function (n) {
              throw new Error(n);
            };
          }();
        }();

        // --- Partial Module (exports) ---
        ! function (t) {
          "use strict";
          var r = n.Partial;
          t.crashWith = r.crashWith;
        }(n.Partial = n.Partial || {});

        // --- Partial.Unsafe Module (unsafeCrashWith) ---
        ! function (t) {
          "use strict";
          var r = n["Partial.Unsafe"],
            e = n.Partial;
          // unsafeCrashWith function.
          t.unsafeCrashWith = function (n) {
            return r.unsafePartial(function (t) {
              return e.crashWith(t)(n);
            });
          };
        }(n["Partial.Unsafe"] = n["Partial.Unsafe"] || {});

        // --- Data.BigInt (Purescript Bindings) Module ---
        ! function (t) {
          "use strict";
          var r = n["Data.BigInt"],
            e = (n["Control.Semigroupoid"], n["Data.Array.NonEmpty"], n["Data.CommutativeRing"], n["Data.Eq"]),
            a = (n["Data.EuclideanRing"], n["Data.Function"], n["Data.Int"], n["Data.Maybe"]),
            i = (n["Data.Ord"], n["Data.Ordering"], n["Data.Ring"]),
            o = (n["Data.Semigroup"], n["Data.Semiring"]),
            u = (n["Data.Show"], n["Data.String.NonEmpty"], n["Data.String.NonEmpty.Internal"], n["Partial.Unsafe"], n.Prelude, r.toBase(10)),
            // Semiring instance for BigInt.
            c = new o.Semiring(r.biAdd, r.biMul, r.fromInt(1), r.fromInt(0)),
            // Ring instance for BigInt.
            f = new i.Ring(function () {
              return c;
            }, r.biSub),
            s = r.biMod,
            // fromBase function using Data.Maybe.
            l = r["fromBase'"](a.Just.create)(a.Nothing.value),
            D = l(10),
            // Eq instance for BigInt.
            g = new e.Eq(r.biEquals);
          // Export functions for Purescript.
          t.fromString = D;
          t.fromBase = l;
          t.toString = u;
          t.rem = s;
          t.eqBigInt = g;
          t.semiringBigInt = c;
          t.ringBigInt = f;
          t.fromInt = r.fromInt;
          t.even = r.even;
          t.xor = r.xor;
        }(n["Data.BigInt"] = n["Data.BigInt"] || {});

        // --- Data.Boolean Module ---
        ! function (t) {
          "use strict";
          // 'otherwise' constant, equivalent to true.
          (n["Data.Boolean"] = n["Data.Boolean"] || {}).otherwise = !0;
        }();

        // --- Data.String.Common Module (split, trim) ---
        ! function (n) {
          "use strict";
          n.split = function (n) {
            return function (t) {
              return t.split(n);
            };
          };
          n.trim = function (n) {
            return n.trim();
          };
        }(n["Data.String.Common"] = n["Data.String.Common"] || {});

        // --- Data.String.Common Module (exports) ---
        ! function (t) {
          "use strict";
          var r = n["Data.String.Common"];
          n["Data.Eq"], n["Data.Ordering"], n["Data.String.Pattern"], n.Prelude;
          t.split = r.split;
          t.trim = r.trim;
        }(n["Data.String.Common"] = n["Data.String.Common"] || {});

        // --- AtCoder.ABC121.D Module ---
        ! function (t) {
          "use strict";
          var r = n["Data.BigInt"],
            e = n["Data.Boolean"],
            a = n["Data.Eq"],
            i = n["Data.Functor"],
            o = n["Data.Maybe"],
            u = n["Data.Ring"],
            c = (n["Data.Semigroup"], n["Data.Semiring"]),
            f = (n["Data.String"], n["Data.String.Common"]),
            s = (n["Data.String.Pattern"], n["Partial.Unsafe"]),
            // The core 'solve' logic for the AtCoder problem.
            l = (n.Prelude, function (n) {
              return function (t) {
                if (a.eq(r.eqBigInt)(n)(t)) return n; // Base case: F(A, B) = A if A = B.
                if (r.even(n)) {
                  var i = c.add(r.semiringBigInt)(u.sub(r.ringBigInt)(t)(n))(c.one(r.semiringBigInt)),
                    o = r.even(i) ? i : u.sub(r.ringBigInt)(i)(c.one(r.semiringBigInt)),
                    f = a.eq(r.eqBigInt)(r.rem(o)(r.fromInt(4)))(c.zero(r.semiringBigInt)) ? c.zero(r.semiringBigInt) : c.one(r.semiringBigInt);
                  return r.xor(r.even(i) ? c.zero(r.semiringBigInt) : t)(f);
                }
                if (e.otherwise) return r.xor(n)(l(c.add(r.semiringBigInt)(n)(c.one(r.semiringBigInt)))(t));
                throw new Error("Failed pattern match at AtCoder.ABC121.D (line 23, column 1 - line 23, column 38): " + [n.constructor.name, t.constructor.name]);
              };
            });
          // Main solve function for the module.
          t.solve = function (n) {
            var t,
              e = f.split(" ")(f.trim(n)), // Split input string by space and trim.
              // Parse 'A' and 'B' from the input string, crashing if parsing fails.
              a = 2 === (t = i.map(i.functorArray)(r.fromString)(e)).length && t[0] instanceof o.Just && t[1] instanceof o.Just ?
              {
                a: t[0].value0,
                b: t[1].value0
              } :
              s.unsafeCrashWith("BigInt.fromString");
            return r.toString(l(a.a)(a.b)) + "\n"; // Compute F(A,B) and return as string with newline.
          };
        }(n["AtCoder.ABC121.D"] = n["AtCoder.ABC121.D"] || {});

        // --- Node.Encoding Module ---
        ! function (t) {
          "use strict";
          n["Node.Encoding"];
          var r = n["Data.Show"],
            // Define various encoding types as singleton objects.
            e = (n.Prelude, function () {
              function n() {}
              return n.value = new n(), n;
            })(),
            a = function () {
              function n() {}
              return n.value = new n(), n;
            }(),
            i = function () {
              function n() {}
              return n.value = new n(), n;
            }(),
            o = function () {
              function n() {}
              return n.value = new n(), n;
            }(),
            u = function () {
              function n() {}
              return n.value = new n(), n;
            }(),
            c = function () {
              function n() {}
              return n.value = new n(), n;
            }(),
            f = function () {
              function n() {}
              return n.value = new n(), n;
            }(),
            s = function () {
              function n() {}
              return n.value = new n(), n;
            }(),
            // Show instance for Encoding types.
            l = new r.Show(function (n) {
              if (n instanceof e) return "ASCII";
              if (n instanceof a) return "UTF8";
              if (n instanceof i) return "UTF16LE";
              if (n instanceof o) return "UCS2";
              if (n instanceof u) return "Base64";
              if (n instanceof c) return "Latin1";
              if (n instanceof f) return "Binary";
              if (n instanceof s) return "Hex";
              throw new Error("Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [n.constructor.name]);
            });
          // Export encoding types and their Show instance.
          t.ASCII = e;
          t.UTF8 = a;
          t.UTF16LE = i;
          t.UCS2 = o;
          t.Base64 = u;
          t.Latin1 = c;
          t.Binary = f;
          t.Hex = s;
          t.showEncoding = l;
        }(n["Node.Encoding"] = n["Node.Encoding"] || {});

        // --- Node.FS.Internal Module (unsafeRequireFS) ---
        ! function (t) {
          "use strict";
          // Directly requires the Node.js 'fs' module.
          (n["Node.FS.Internal"] = n["Node.FS.Internal"] || {}).unsafeRequireFS = require("fs");
        }();

        // --- Unsafe.Coerce Module ---
        ! function (t) {
          "use strict";
          var r = n["Unsafe.Coerce"];
          t.unsafeCoerce = r.unsafeCoerce;
        }(n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {});

        // --- Node.FS.Internal Module (mkEffect, unsafeRequireFS exports) ---
        ! function (t) {
          "use strict";
          var r = n["Node.FS.Internal"],
            e = (n.Effect, n.Prelude, n["Unsafe.Coerce"].unsafeCoerce);
          // mkEffect is a way to wrap impure JS code into Purescript's Effect monad.
          t.mkEffect = e;
          // Re-export unsafeRequireFS.
          t.unsafeRequireFS = r.unsafeRequireFS;
        }(n["Node.FS.Internal"] = n["Node.FS.Internal"] || {});

        // --- Node.FS.Sync Module ---
        ! function (t) {
          "use strict";
          // Many Node.js and Purescript dependencies.
          n["Control.Bind"], n["Control.Semigroupoid"], n["Data.DateTime"], n["Data.DateTime.Instant"], n["Data.EuclideanRing"], n["Data.Function"], n["Data.Function.Uncurried"], n["Data.Functor"], n["Data.Int"], n["Data.Maybe"], n["Data.Nullable"];
          var r = n["Data.Show"],
            e = (n["Data.Time.Duration"], n.Effect, n["Node.Buffer"], n["Node.Encoding"]),
            a = (n["Node.FS"], n["Node.FS.Internal"]),
            i = (n["Node.FS.Perms"], n["Node.FS.Stats"], n["Node.Path"], n.Prelude, a.unsafeRequireFS);
          // Function to synchronously read a text file.
          t.readTextFile = function (n) {
            return function (t) {
              return a.mkEffect(function (a) {
                return i.readFileSync(t, {
                  encoding: r.show(e.showEncoding)(n)
                });
              });
            };
          };
          // Function to synchronously append text to a file.
          t.appendTextFile = function (n) {
            return function (t) {
              return function (o) {
                return a.mkEffect(function (a) {
                  return i.appendFileSync(t, o, {
                    encoding: r.show(e.showEncoding)(n)
                  });
                });
              };
            };
          };
        }(n["Node.FS.Sync"] = n["Node.FS.Sync"] || {});

        // --- Main Application Module ---
        ! function (t) {
          "use strict";
          var r = n["AtCoder.ABC121.D"],
            e = (n["Control.Applicative"], n["Control.Bind"], n.Effect, n["Node.Encoding"]),
            a = n["Node.FS.Sync"],
            i = (n.Prelude, r.solve);
          // The main entry point of the Purescript application.
          t.main = function () {
            var n = a.readTextFile(e.UTF8.value)("/dev/stdin")(), // Read input from standard input.
              t = i(n); // Call the problem solver with the input.
            return a.appendTextFile(e.UTF8.value)("/dev/stdout")(t)(); // Write the result to standard output.
          };
        }(n.Main = n.Main || {});

        // Execute the main function of the application.
        n.Main.main();
      }, {
        "big-integer": "9xaU"
      }
    ]
  }, // End of module definitions object.
  {}, // Empty object for 'r' (module cache for initial load).
  ["Focm"], // Array of entry point module IDs.
  null // 'n' (global variable name) is null.
);