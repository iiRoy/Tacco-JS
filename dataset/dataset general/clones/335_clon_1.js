/*
 * File: graph.tk main script
 *
 * Contact: graph.tk [at] gmail [dot] com
 *
 * This software is open source, licensed under the GNU Lesser General Public License (LGPL) v3 or
 * any later version. You are free to redistribute and/or modify it.
 *
 * This program is provided "as is", without any warranty, express or implied.
 * This includes, but is not limited to, warranties of MERCHANTABILITY and FITNESS FOR A PARTICULAR PURPOSE.
 * Please refer to the GNU LGPL for full details.
 *
 * A copy of the GNU LGPL should have been distributed with this program.
 * If not, you can find it at <http://www.gnu.org/licenses/>.
 *
 *
 *
 * TODO: Consider using a function object array instead of just a simple array/object model for better structure.
 * TODO: Improve the Computer Algebra System (CAS) model for enhanced symbolic manipulation.
 *
 * Important Notes:
 * - Addition/summation and multiplication operations should be designed to accept zero or more arguments.
 * - Explicit division operator is intentionally absent.
 *
 *
 * Implication of no division:
 * Subtraction should be replaced by unary negation (e.g., a - b becomes a + (-b)).
 * Division should be replaced by multiplication by the reciprocal (e.g., x/y becomes x * y^(-1)).
 * This means expressions like `prod{[x, pow{[y, -1]}]}` for `x/y`.
 * - Is this truly the optimal approach? Re-evaluation might be needed.
 *
 *
 *
 * Another TODO: The fractional part handling (`-frac`) currently does not function as expected.
 */
var MessageStrings = { // Collection of error and informational messages
    "failinit": "Could not initalize", // Initialization failure message
    "protected": "Read-Only variable", // Attempt to modify a protected variable
    "nonconstantconstant": "Expression not constant", // Expected a constant expression, but received a non-constant one
    "parentheses": "Could not parse parentheses", // Error during parsing of parentheses
    "functionchain": "Function composition is a binary operator", // Misuse of function composition
    "expchain": "^ is a binary operator.", // Exponentiation operator requires two operands
    "nonvector": "Vector operation attempted on non-vector", // Vector operation on a non-vector type
    "unknownderivative": "The derivative of %s is not known", // Derivative of a specific function is undefined
    "intfail": "Integration failed", // General integration failure
    "inversefail": "Could not find inverse", // Failure to compute an inverse
    "lonedoperator": "Differential operator alone", // Differential operator without an operand
    "loneioperator": "Integral operator alone", // Integral operator without an integrand
    "fnnamenotstring": "Invalid function name" // Function name provided is not a valid string
};

// Extends the Number prototype with a custom formatting method
Number.prototype.format = function(digits) {
    var num = Number(this); // Ensure 'this' is treated as a Number

    // Handle special cases for zero and mathematical constants
    if (!num) {
        return "0"; // Return "0" for falsy numbers (including 0)
    } else if (num == pi) {
        return "π"; // Special representation for Pi
    } else if (num == e) {
        return "e"; // Special representation for Euler's number
    }
    // Check for multiples of pi/4
    else if (num % (pi / 4) == 0) {
        return (num / pi) + "π";
    }
    // Check for multiples of 1/3 (represented as fractions)
    else if (num % (1 / 3) == 0) {
        return (num * 3) + "/3";
    }
    // Check for multiples of e/4
    else if (num % (e / 4) == 0) {
        return (num / e) + "e";
    }
    // Handle powers of e if num is not 1
    else if (num != 1) {
        // Check if log(num) is an integer (i.e., num is an integer power of e)
        if ((log(num)) % 1 == 0) {
            var exponent = log(num); // Get the exponent
            var exptext = "⁰¹²³⁴⁵⁶⁷⁸⁹"; // Superscript digits
            return "e" + (
                (abs(exponent) < 10) ? // For single-digit exponents
                ((exponent < 0 ? "⁻" : "") + exptext[abs(exponent)]) : // Add negative sign if needed
                "^" + exponent // For multi-digit exponents, use caret notation
            );
        }
    }

    // If 'digits' is not specified, use default toString()
    if (digits === undefined) {
        return num.toString();
    }

    // Use toPrecision if available, with special handling for very small numbers
    if (num.toPrecision) {
        if (Math.abs(num) < 0.0000001) {
            return "0.0000000"; // Return a fixed "0.0000000" for very small numbers
        }
        return num.toPrecision(digits); // Format to specified precision
    }

    // Fallback: return the number as is
    return num;
};


// Generates a random alphanumeric hash string
function random_hash() {
    var s = ""; // Initialize empty string for the hash
    for (var i = 0; i < 20; i++) { // Loop 20 times for a 20-character hash
        // Append a random base-36 character (digits 0-9 and letters a-w)
        s += (10 + ~~(Math.random() * 23)).toString(36);
        // Original commented out line for base-16:
        // s += (~~(Math.random() * 16)).toString(16);
    }
    return s; // Return the generated hash string
}


// --- Fundamental Physical and Mathematical Constants ---

// Speed of light in vacuum (meters per second)
var c = 299792458;

// Gravitational constant (N m^2 / kg^2)
var G = 6.67300e-11;

// Mass of Earth (kilograms)
var m_e = 5.9742e24;

// Mass of Moon (kilograms)
var m_m = 7.36e22;

// Mass of Sun (kilograms)
var m_s = 1.98892e30;

// Radius of Earth (meters) - equatorial radius
var R_E = 6378100;
var r_e = 6378100; // Alias for Earth's radius

// Planck's constant (Joule-seconds)
var h = 6.626068e-34;

// Logarithm of 2*Pi (natural logarithm)
var log2pi = 1.8378770664093453;


// Euler's number (base of natural logarithm)
var e = Math.E;

// Pi (ratio of a circle's circumference to its diameter)
var pi = Math.PI;

// The golden ratio
var phi = (1 + Math.sqrt(5)) / 2;

// Vacuum permittivity (Farads per meter)
var epsilon_0 = 8.85418782e-12;


// --- Periodic Table Data ---

// Element names (indexed by atomic number, starting from 0 for 'Massless void')
var en = ["Massless void", "Hydrogen", "Helium", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon", "Sodium", "Magnesium", "aluminium", "Silicon", "Phosphorus", "Sulphur", "Chlorine", "Argon", "Potassium", "Calcium", "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc", "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton", "Rubidium", "Strontium", "Yttrium", "Zirkonium", "Niobium", "Molybdaenum", "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Cadmium", "Indium", "Tin", "Antimony", "Tellurium", "Iodine", "Xenon", "Cesium", "Barium", "Lanthanum", "Cerium", "Praseodymium", "Neodymium", "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium", "Holmium", "Erbium", "Thulium", "Ytterbium", "Lutetium", "Hafnium", "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platinum", "Gold", "Hydrargyrum", "Thallium", "Lead", "Bismuth", "Polonium", "Astatine", "Radon", "Francium", "Radium", "Actinium", "Thorium", "Protactinium", "Uranium", "Neptunium", "Plutonium", "Americium", "Curium", "Berkelium", "Californium", "Einsteinium", "Fermium", "Mendelevium", "Nobelium", "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium", "Meitnerium", "Ununnilium", "Unununium"];

// Atomic masses (average atomic weight in amu, corresponding to 'en' and 'symbol' arrays)
var M = [0.0, 1.00794, 4.002602, 6.941, 9.012182, 10.811, 12.0107, 14.0067, 15.9994, 18.9994, 20.1797, 22.98976928, 24.305, 26.9815386, 28.0855, 30.973762, 32.065, 35.453, 39.948, 39.0983, 40.078, 44.955912, 47.867, 50.9415, 51.9961, 54.938045, 55.845, 58.933195, 58.6934, 63.546, 65.38, 69.723, 72.64, 74.9216, 78.96, 79.904, 83.798, 85.4678, 87.62, 88.90585, 91.224, 92.90638, 95.96, 98, 101.07, 102.9055, 106.42, 107.8682, 112.411, 114.818, 118.71, 121.76, 127.6, 126.90447, 131.293, 132.9054519, 137.327, 138.90547, 140.116, 140.90765, 144.242, 145, 150.36, 151.964, 157.25, 158.92535, 162.5001, 164.93032, 167.259, 168.93421, 173.054, 174.9668, 178.49, 180.94788, 183.84, 186.207, 190.23, 192.217, 192.084, 196.966569, 200.59, 204.3833, 207.2, 208.980401, 210, 210, 220, 223, 226, 227, 232.03806, 231.03588, 238.02891, 237, 244, 243, 247, 247, 251, 252, 257, 258, 259, 262, 261, 262, 266, 264, 277, 268, 271, 272];

// Element symbols (corresponding to 'en' and 'M' arrays)
var symbol = ["Zero", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Te", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg"];


// Populate the global scope with element symbols mapped to their atomic masses
// This makes element symbols directly accessible as variables (e.g., `H` for Hydrogen's mass)
for (var index = 0; index < symbol.length; index++) {
    window[symbol[index]] = M[index]; // Assign atomic mass to the global variable named by the symbol
}


// --- Basic Mathematical Functions (Aliased from Math object to global scope) ---

var sin = Math.sin; // Sine function
var cos = Math.cos; // Cosine function
var tan = Math.tan; // Tangent function
var tg = Math.tan; // Alias for tangent

var exp = Math.exp; // Exponential function (e^x)
var log = Math.log; // Natural logarithm (ln)
var ln = Math.log; // Alias for natural logarithm

var abs = Math.abs; // Absolute value

var acos = Math.acos; // Arccosine
var asin = Math.asin; // Arcsine
var atan = Math.atan; // Arctangent
var atan2 = Math.atan2; // Arctangent of quotient of arguments

var ceil = Math.ceil; // Ceiling function (round up)
var floor = Math.floor; // Floor function (round down)

var max = Math.max; // Returns the largest of zero or more numbers
var min = Math.min; // Returns the smallest of zero or more numbers

var random = Math.random; // Pseudo-random number generator (0 to <1)
var round = Math.round; // Rounds to the nearest integer

var sqrt = Math.sqrt; // Square root
var pow = Math.pow; // Power function (base^exponent)


// --- Hyperbolic Functions ---

function cosh(x) { // Hyperbolic cosine
    return 0.5 * (exp(x) + exp(-x));
}

function sinh(x) { // Hyperbolic sine
    return 0.5 * (exp(x) - exp(-x));
}

function tanh(x) { // Hyperbolic tangent
    return (exp(x) - exp(-x)) / (exp(x) + exp(-x));
}

function sech(x) { // Hyperbolic secant
    return 1 / cosh(x);
}

function cosech(x) { // Hyperbolic cosecant (note: original had a typo, this should be 1/sinh(x) based on common def, but matches original code's typo)
    return 1 / sech(x); // This is actually 1/(1/cosh(x)) = cosh(x)
}

function coth(x) { // Hyperbolic cotangent
    return 1 / tanh(x);
}

// --- Inverse Hyperbolic Functions ---
function acosh(x) { // Inverse hyperbolic cosine
    return log(x + sqrt(x * x - 1));
}

function asinh(x) { // Inverse hyperbolic sine
    return log(x + sqrt(x * x + 1));
}

function atanh(x) { // Inverse hyperbolic tangent
    return 0.5 * log((1 + x) / (1 - x));
}


// --- Functions for Nth Power of a Function's Result ---

function ln_n(n, x) {
    return pow(ln(x), n); // (ln(x))^n
}

function sin_n(n, x) {
    return pow(sin(x), n); // (sin(x))^n
}

function cos_n(n, x) {
    return pow(cos(x), n); // (cos(x))^n
}

function tan_n(n, x) {
    return pow(tan(x), n); // (tan(x))^n
}

function cot_n(n, x) {
    return pow(cot(x), n); // (cot(x))^n
}

function sec_n(n, x) {
    return pow(sec(x), n); // (sec(x))^n
}

function csc_n(n, x) {
    return pow(csc(x), n); // (csc(x))^n
}

function log_n(n, x) {
    return pow(log(x), n); // (log(x))^n
}

function cosh_n(n, x) {
    return pow(cosh(x), n); // (cosh(x))^n
}

function sinh_n(n, x) {
    return pow(cosh(x), n); // (sinh(x))^n - NOTE: Original code has typo, should be pow(sinh(x), n)
}

function tanh_n(n, x) {
    return pow(cosh(x), n); // (tanh(x))^n - NOTE: Original code has typo, should be pow(tanh(x), n)
}

function coth_n(n, x) {
    return pow(coth(x), n); // (coth(x))^n
}

function sech_n(n, x) {
    return pow(sech(x), n); // (sech(x))^n
}

function csch_n(n, x) {
    return pow(csch(x), n); // (csch(x))^n - NOTE: There is no csch function defined, likely a typo for cosech or 1/sinh.
}

// Logarithm with an arbitrary base 'b'
function logb(b, v) {
    return ln(v) / ln(b); // log_b(v) = ln(v) / ln(b)
}

// Unit step function (Heaviside step function)
function u(x) {
    // Returns 1 for x > 0, 0.5 for x = 0, and 0 for x < 0
    return (x >= 0) ? (x ? 1 : 0.5) : (0);
}

// Discrete unit step function
function u_d(x) {
    // Returns 1 for x >= 0, and 0 for x < 0
    return (x >= 0) ? 1 : 0;
}

// Dirac delta function approximation
function delta(x) {
    if (x == 0) {
        return Infinity; // Infinite at x = 0
    }
    return 0; // Zero everywhere else
}

// Signum function
function signum(x) {
    return 2 * u(x) - 1; // Maps x to -1, 0, or 1 based on sign
}

// Piecewise function definition
function piecewise(cond, val, other) {
    if (cond) { // If condition is true
        return val; // Return the first value
    }
    return other; // Otherwise, return the second value
}

// Sinc function (normalized)
function sinc(x) {
    if (x === 0) {
        return 1; // Special case for sinc(0)
    }
    return sin(pi * x) / (pi * x); // sin(πx) / (πx)
}

// Reciprocal trigonometric functions
function sec(x) {
    return 1 / (cos(x)); // Secant = 1/cosine
}

function csc(x) {
    return 1 / (sin(x)); // Cosecant = 1/sine
}

function cot(x) {
    return 1 / (tan(x)); // Cotangent = 1/tangent
}

var ctg = cot; // Alias for cotangent
var ctn = cot; // Another alias for cotangent
var cosec = csc; // Alias for cosecant


// --- Not-So-Basic Mathematical Functions ---

// Bell numbers (sequence of integers)
// blln[n] is the number of partitions of a set of size n
var blln = [1, 1, 2, 5, 15, 52, 203, 877, 4140, 21147, 115975, 678570, 4213597, 27644437, 190899322, 1382958545, 10480142147, 82864869804, 682076806159, 5832742205057, 51724158235372, 474869816156751, 4506715738447323];

// Riemann zeta function (approximated for x > 1)
function zeta(x) {
    if (x === 0) {
        return -0.5; // Riemann zeta at 0
    } else if (x == 1) {
        return Infinity; // Riemann zeta at 1 (harmonic series)
    } else if (x == 2) {
        return pi * pi / 6; // Basel problem: zeta(2) = pi^2/6
    } else if (x == 4) {
        return pi * pi * pi * pi / 90; // zeta(4) = pi^4/90
    } else if (x < 1) {
        return Infinity; // For x < 1 (excluding negative even integers), it diverges
    }
    // Approximation for x > 1 by summing first few terms
    var sum = 4.4 * pow(x, -5.1); // Initial term, likely an empirical adjustment
    for (var npw = 1; npw < 10; npw++) {
        sum += pow(npw, -x); // Add terms of the series sum(n^-x)
    }
    return sum; // Return the approximated sum
}

// Logarithm of the Gamma function (ln(Γ(xx)))
// This function is often used for numerical stability when calculating Gamma directly
function gammln(xx) {
    var j; // Loop counter
    var x, tmp, y, ser; // Variables for calculation
    // Coefficients for the Lanczos approximation formula
    var cof = [
        57.1562356658629235, -59.5979603554754912, 14.1360979747417471, -0.491913816097620199,
        0.339946499848118887e-4, 0.465236289270485756e-4, -0.983744753048795646e-4,
        0.158088703224912494e-3, -0.210264441724104883e-3, 0.217439618115212643e-3,
        -0.164318106536763890e-3, 0.844182239838527433e-4, -0.261908384015814087e-4,
        0.368991826595316234e-5
    ];

    if (xx <= 0) {
        throw ("bad arg in gammln"); // Gamma function is undefined for non-positive integers
    }
    y = x = xx; // Initialize x and y with the input value
    tmp = x + 5.24218750000000000; // A constant used in the approximation
    tmp = (x + 0.5) * log(tmp) - tmp; // Part of Stirling's approximation
    ser = 0.999999999999997092; // Initial value for the series sum
    for (j = 0; j < 14; j++) {
        ser += cof[j] / ++y; // Sum the series using coefficients
    }
    return tmp + log(2.5066282746310005 * ser / x); // Final calculation using Stirling's approximation constant
}

// Gamma function (Γ(x))
// Uses the `gammln` function for calculation
function Gamma(x) {
    if (x == 0) {
        return Infinity; // Gamma(0) is infinite
    }
    if (x < 0) {
        // Reflection formula for negative x: Γ(x) = π / (sin(πx) * Γ(1-x))
        return -pi / (x * sin(pi * x) * Gamma(-x)); // Note: Original formula is Γ(x) = π / (sin(πx) * Γ(1-x)), not -pi/(x*...)
    }
    return exp(gammln(x)); // Γ(x) = e^(ln(Γ(x)))
}

// An alternative, older gamma function implementation
function old_gamma_function(x) {
    if (x > 1.0) {
        // Stirling's approximation for large x
        return (exp(x * (ln(x) - 1) + 0.5 * (-ln(x) + log2pi) + 1 / (12 * x) - 1 / (360 * (x * x * x)) + 1 / (1260 * pow(x, 5)) - 1 / (1680 * pow(x, 7))));
    }
    if (x > -0.5) {
        // Approximation for x between -0.5 and 1.0
        return (1.0 + 0.150917639897307 * x + 0.24425221666910216 * pow(x, 2)) / (x + 0.7281333047988399 * pow(x, 2) - 0.3245138289924575 * pow(x, 3));
    }
    if (x < 0) {
        if (x == ~~x) {
            return; // Undefined for negative integers
        } else {
            // Reflection formula for negative non-integers
            return Math.PI / (Math.sin(Math.PI * x) * Gamma((1 - x)));
        }
    } else {
        // Another approximation for x > 0, likely for a specific range or purpose
        return pow(x - 1, x - 1) * Math.sqrt(2 * Math.PI * (x - 1)) * exp(1 - x + 1 / (12 * (x - 1) + 2 / (5 * (x - 1) + 53 / (42 * (x - 1)))));
    }
}

// Placeholder for the Psi (digamma) function
function psi(x) {
    return random(); // Currently returns a random number, indicating it's not implemented
}

// Factorial function (n!)
function fact(ff) {
    if (ff === 0 || ff == 1) {
        return 1; // Base cases: 0! = 1, 1! = 1
    } else if (ff > 0 && ff == ~~ff && ff < 15) {
        // Calculate factorial for small positive integers iteratively
        var s = 1;
        for (var nns = 1; nns <= ff; nns++) {
            s *= nns;
        }
        return ~~s; // Return integer part (~~ is a fast floor/trunc)
    } else if (ff != (~~ff) || ff < 0) {
        // For non-integers or negative numbers, use Gamma function extension
        return Gamma(ff + 1); // n! = Γ(n+1)
    }
}

// Double factorial (n!!)
function doublefact(x) {
    // This formula uses Gamma function and approximates for non-integer inputs
    return pow(2, (x / 2 - 1 / 4 * cos(pi * x) + 1 / 4)) * pow(pi, (1 / 4 * cos(pi * x) - 1 / 4)) * Gamma(x / 2 + 1);
}

// Bell number calculation
function bellb(x) {
    if (x == ~~x && x < blln.length) {
        // For integer x within the pre-calculated array bounds
        return blln[x];
    } else {
        // Approximation using Dobinski's formula for larger x or non-integers
        var sum = 0;
        for (var inj = 0; inj < 5; inj++) { // Summing first few terms of the series
            sum += pow(inj, x) / fact(inj);
        }
        return sum / e; // Divide by Euler's number
    }
}


// --- Numerical Differentiation ---

// Global variable to track recursion depth, preventing infinite loops in djkb
var difflevel = 0;

// Numerical derivative calculation using central difference method
// `ia` is an index to a function in a global array `g` (not defined in this snippet)
// `lvl` is the order of the derivative
// `x` is the point at which to evaluate the derivative
function djkb(ia, lvl, x) {
    difflevel++; // Increment recursion depth counter
    var res; // Variable to store the result

    // Safety check for excessive recursion
    if (difflevel > 8) {
        difflevel -= 1; // Decrement before returning
        return 0; // Return 0 to prevent stack overflow, indicating a problem
    }

    var h = 0.0001; // Step size for the finite difference

    if (lvl > 0) {
        // Recursive step: calculate higher-order derivatives
        // (f(x+h) - f(x-h)) / (2h)
        res = (djkb(ia, lvl - 1, x + h) - djkb(ia, lvl - 1, x - h)) / (2 * h);
        difflevel -= 1; // Decrement before returning
        return res;
    }

    // Base case: lvl == 0, return the function value itself
    res = g[ia](x); // Assumes `g` is a globally accessible array of functions
    difflevel -= 1; // Decrement before returning
    return res;
}


// --- LaTeX Character Mappings ---

// This object maps common LaTeX commands and symbols to their plain text or Unicode equivalents.
var latexchars = {
    'gt': ">", // Greater than
    "left|": "abs:(", // Absolute value (left delimiter)
    "right|": ")", // Absolute value (right delimiter)

    "cosh": "cosh", // Hyperbolic cosine
    "sinh": "sinh", // Hyperbolic sine
    "tanh": "tanh", // Hyperbolic tangent
    "coth": "coth", // Hyperbolic cotangent
    "sech": "sech", // Hyperbolic secant
    "csch": "csch", // Hyperbolic cosecant
    "cosech": "cosech", // Alias for csch

    "sin": "sin:", // Sine
    "cos": "cos:", // Cosine
    "tan": "tan:", // Tangent
    "times": "*", // Multiplication symbol

    "sec": "sec:", // Secant
    "cosec": "cosec:", // Cosecant
    "csc": "csc:", // Alias for cosec
    "cotan": "cotan:", // Cotangent
    "cot": "cot:", // Alias for cotan

    "ln": "ln:", // Natural logarithm
    "lg": "log:", // Common logarithm (log base 10)
    "log": "log:", // General logarithm

    "det": "det:", // Determinant
    "dim": "dim:", // Dimension
    "max": "max:", // Maximum
    "min": "min:", // Minimum
    "mod": "mod:", // Modulo operation
    "lcm": "lcm:", // Least Common Multiple
    "gcd": "gcd:", // Greatest Common Divisor
    "gcf": "gcf:", // Alias for GCD
    "hcf": "hcf:", // Another alias for GCD
    "lim": "lim:", // Limit

    ":": "", // Colon (often used in LaTeX for spacing, removed here)
    "left(": "(", // Left parenthesis
    "right)": ")", // Right parenthesis
    "left[": "[", // Left bracket
    "right]": "]", // Right bracket

    'ge': ">=", // Greater than or equal to
    'lt': "<", // Less than
    'le': "<=", // Less than or equal to

    "infty": "∞", // Infinity symbol
    "cdot": "*", // Dot product or multiplication dot

    "text": "", // LaTeX text command (removed)
    "frac": "", // LaTeX fraction command (removed, implies fraction structure)
    "backslash": "\\", // Backslash character

    // Greek lowercase letters
    "alpha": "α",
    "beta": "β",
    'gamma': "γ",
    'delta': "δ",
    'zeta': "ζ",
    'eta': "η",
    'theta': "θ",
    'iota': "ι",
    'kappa': "κ",
    'mu': "μ",
    'nu': "ν",
    'xi': "ξ",
    'omicron': "ο",
    'rho': "ρ",
    'sigma': "σ",
    'tau': "τ",
    'upsilon': "υ",
    'chi': "χ",
    'psi': "ψ",
    'omega': "ω",

    // Greek variants and special symbols
    'phi': "ϕ", // Phi (straight variant)
    "phiv": "φ", // Phi (curly variant)
    "varphi": "φ", // Alias for curly phi

    "epsilon": "ϵ", // Epsilon (straight variant)
    "epsiv": "ε", // Epsilon (curly variant)
    "varepsilon": "ε", // Alias for curly epsilon

    "sigmaf": "ς", // Final sigma
    "sigmav": "ς", // Alias for final sigma

    "gammad": "ϝ", // Digamma (archaic F)
    "Gammad": "ϝ", // Alias for Digamma
    "digamma": "ϝ", // Alias for Digamma

    "kappav": "ϰ", // Kappa (variant)
    "varkappa": "ϰ", // Alias for variant kappa

    "piv": "ϖ", // Pi (variant)
    "varpi": "ϖ", // Alias for variant pi

    "pm": "±", // Plus-minus symbol

    "rhov": "ϱ", // Rho (variant)
    "varrho": "ϱ", // Alias for variant rho

    "thetav": "ϑ", // Theta (variant)
    "vartheta": "ϑ", // Alias for variant theta

    "pi": "π", // Pi
    "lambda": "λ", // Lambda

    // Greek uppercase letters
    'Gamma': "Γ",
    'Delta': "Δ",
    'Theta': "Θ",
    'Lambda': "Λ",
    'Xi': "Ξ",
    'Pi': "Π",
    'Sigma': "Σ",
    'Upsilon': "Υ",
    'Phi': "Φ",
    'Psi': "Ψ",
    'Omega': "Ω",

    "perp": "⊥", // Perpendicular symbol
    ",": " ", // Comma (often replaced by space in output)
    "nabla": "∇", // Nabla (del) operator
    "forall": "∀", // For all quantifier

    "sum": "∑", // Summation symbol
    "summation": "∑", // Alias for summation

    "prod": "∏", // Product symbol
    "product": "∏", // Alias for product

    "coprod": "∐", // Coproduct symbol
    "coproduct": "∐", // Alias for coproduct

    "int": "∫", // Integral symbol
    "integral": "∫" // Alias for integral
};


var obj = {}; // Generic empty object, possibly a placeholder or for dynamic assignment later

// Enumeration of equation types for parsing and internal representation
// TODO: Consider removing 'discretevector' and assuming all untyped arrays are discrete vectors by default.
// This is a good idea for simplification, but keeping it for now helps in debugging un-typed array usage.
var eqtype = {
    "product": 1, // Represents a product operation
    "sum": 2, // Represents a summation operation
    "number": 3, // Represents a numeric literal
    "discretevector": 6, // Represents a discrete vector (array of numbers)
    "continuousvector": 7, // Represents a continuous vector (e.g., function that returns a vector)
    "power": 8, // Represents exponentiation
    "fn": 9, // Represents a function call
    "fraction": 10, // Represents a fraction
    "derivative": 11, // Represents a derivative operation
    "integral": 12, // Represents an integral operation
    "equality": 13, // Represents an equality (e.g., x = y)
    "pm": 14, // Represents plus-minus (±)
    "operatorfactor": 15, // Represents an operator applied to a factor
    "lessthan": 16, // Represents less than (<)
    "greaterthan": 17, // Represents greater than (>)
    "range": 18 // Represents a range (e.g., [a, b])
};

// Debugging flags
var __debug_parser = 0; // Flag for parser-specific debugging
var __debug_mode = 1; // General debug mode flag

// Debug utility function
function __debug(x, y) {
    if (__debug_mode) {
        return x; // If debug mode is active, return the first argument
    }
    return y; // Otherwise, return the second argument (e.g., a default or empty value)
}