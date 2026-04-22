/*
 *  Project: AstroCalc Utilities
 *  Author:  Cosmic Engineer
 *  Contact: celestial.coder [at] example [dot] com
 *
 *  This software is provided under the GNU Lesser General Public License,
 *  version 3 or any later version. You are free to redistribute and/or modify it.
 *  For full license details, please refer to http://www.gnu.org/licenses/lgpl.html
 *
 *  Disclaimer: This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 *  --- Development Notes ---
 *  Refactor: Consider utilizing a function map instead of a simple array/object for operations.
 *  Enhance: Improve the Computer Algebra System (CAS) model for better symbol manipulation.
 *  Consider: Operations like addition and multiplication should handle zero or more arguments.
 *  Note: Division should be represented as multiplication by a reciprocal (x/y = x * y^-1).
 *  Future: Implement proper handling for fractional expressions (e.g., -frac).
 */
const FeedbackMessages = {
    "initFailure": "Initialization failed.",
    "accessDenied": "Protected variable, read-only.",
    "nonConstantEval": "Expression is not a constant value.",
    "syntaxMismatch": "Parentheses parsing error.",
    "funcCompositionError": "Function composition requires two arguments.",
    "exponentOperatorError": "The '^' operator is binary.",
    "vectorMismatch": "Non-vector operation attempted on a vector type.",
    "unknownDiff": "Derivative of %s is not defined.",
    "integralFailure": "Integration process encountered an error.",
    "invCalcFail": "Could not compute inverse.",
    "isolatedDiffOp": "Differential operator found without expression.",
    "isolatedIntOp": "Integral operator found without expression.",
    "invalidFuncName": "Function name provided is not valid."
};

Number.prototype.toPrettyString = function(precisionDigits) {
    let currentVal = Number(this);
    if (currentVal === 0) {
        return "0";
    }

    // Check for fundamental constants
    if (currentVal === k_Pi) {
        return "π";
    }
    if (currentVal === k_Euler) {
        return "e";
    }

    // Check for common fractional multiples of pi or e
    if (currentVal % (k_Pi / 4) === 0) {
        return (currentVal / k_Pi) + "π";
    }
    if (currentVal % (1 / 3) === 0) {
        return (currentVal * 3) + "/3";
    }
    if (currentVal % (k_Euler / 4) === 0) {
        return (currentVal / k_Euler) + "e";
    }

    // Check for integer powers of 'e'
    if (currentVal !== 1) {
        const naturalLogVal = Math.log(currentVal);
        if (naturalLogVal % 1 === 0) {
            const expPower = naturalLogVal;
            const superScriptDigits = "⁰¹²³⁴⁵⁶⁷⁸⁹";
            let formattedPower = Math.abs(expPower).toString().split('').map(d => superScriptDigits[parseInt(d)]).join('');
            if (expPower < 0) {
                formattedPower = "⁻" + formattedPower;
            }
            return "e" + formattedPower;
        }
    }

    // Fallback to standard precision formatting
    if (precisionDigits === undefined || !Number.isFinite(precisionDigits) || precisionDigits < 0) {
        return currentVal.toString();
    }
    if (currentVal.toPrecision) {
        if (Math.abs(currentVal) < 1e-7) { // Very small numbers are zero
            return "0.0000000";
        }
        return currentVal.toPrecision(precisionDigits);
    }
    return currentVal.toString(); // Final fallback
};


function generateUniqueToken() {
    let tokenBuffer = "";
    const tokenLength = 20;
    for (let idx = 0; idx < tokenLength; idx++) {
        // Generate a random number between 10 and 32 (inclusive)
        // This covers 'a' (10 in base 36) to 'w' (32 in base 36)
        tokenBuffer += (10 + Math.floor(Math.random() * 23)).toString(36);
    }
    return tokenBuffer;
}


// Universal Physical Constants
const k_LightSpeed = 299792458; // meters per second
const k_Gravitational = 6.67300e-11; // N(m/kg)^2
const k_EarthMass = 5.9742e24; // kilograms
const k_MoonMass = 7.36e22; // kilograms
const k_SunMass = 1.98892e30; // kilograms
const k_EarthRadius = 6378100; // meters
const k_Planck = 6.626068e-34; // Joule-seconds
const k_Log2Pi = 1.8378770664093453; // ln(2π)

// Mathematical Constants
const k_Euler = Math.E; // Euler's number
const k_Pi = Math.PI; // Pi
const k_GoldenRatio = (1 + Math.sqrt(5)) / 2; // Phi
const k_VacuumPermittivity = 8.85418782e-12; // Farads per meter

// Elemental Properties (Name, Mass, Symbol)
const elementalNames = ["Massless void", "Hydrogen", "Helium", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon", "Sodium", "Magnesium", "aluminium", "Silicon", "Phosphorus", "Sulphur", "Chlorine", "Argon", "Potassium", "Calcium", "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc", "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton", "Rubidium", "Strontium", "Yttrium", "Zirkonium", "Niobium", "Molybdaenum", "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Cadmium", "Indium", "Tin", "Antimony", "Tellurium", "Iodine", "Xenon", "Cesium", "Barium", "Lanthanum", "Cerium", "Praseodymium", "Neodymium", "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium", "Holmium", "Erbium", "Thulium", "Ytterbium", "Lutetium", "Hafnium", "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platinum", "Gold", "Hydrargyrum", "Thallium", "Lead", "Bismuth", "Polonium", "Astatine", "Radon", "Francium", "Radium", "Actinium", "Thorium", "Protactinium", "Uranium", "Neptunium", "Plutonium", "Americium", "Curium", "Berkelium", "Californium", "Einsteinium", "Fermium", "Mendelevium", "Nobelium", "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium", "Meitnerium", "Ununnilium", "Unununium"];
const atomicMassValues = [0.0, 1.00794, 4.002602, 6.941, 9.012182, 10.811, 12.0107, 14.0067, 15.9994, 18.9994, 20.1797, 22.98976928, 24.305, 26.9815386, 28.0855, 30.973762, 32.065, 35.453, 39.948, 39.0983, 40.078, 44.955912, 47.867, 50.9415, 51.9961, 54.938045, 55.845, 58.933195, 58.6934, 63.546, 65.38, 69.723, 72.64, 74.9216, 78.96, 79.904, 83.798, 85.4678, 87.62, 88.90585, 91.224, 92.90638, 95.96, 98, 101.07, 102.9055, 106.42, 107.8682, 112.411, 114.818, 118.71, 121.76, 127.6, 126.90447, 131.293, 132.9054519, 137.327, 138.90547, 140.116, 140.90765, 144.242, 145, 150.36, 151.964, 157.25, 158.92535, 162.5001, 164.93032, 167.259, 168.93421, 173.054, 174.9668, 178.49, 180.94788, 183.84, 186.207, 190.23, 192.217, 192.084, 196.966569, 200.59, 204.3833, 207.2, 208.980401, 210, 210, 220, 223, 226, 227, 232.03806, 231.03588, 238.02891, 237, 244, 243, 247, 247, 251, 252, 257, 258, 259, 262, 261, 262, 266, 264, 277, 268, 271, 272];
const elementSymbols = ["Zero", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Te", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg"];


// Expose elemental atomic masses globally via their symbols
for (let atomIdx = 0; atomIdx < elementSymbols.length; atomIdx++) {
    window[elementSymbols[atomIdx]] = atomicMassValues[atomIdx];
}


// Core Mathematical Functions (Global aliases for Math methods)
const sine = Math.sin;
const cosine = Math.cos;
const tangent = Math.tan;
const exponentiate = Math.exp;
const naturalLog = Math.log;
const absoluteValue = Math.abs;
const arcCosine = Math.acos;
const arcSine = Math.asin;
const arcTangent = Math.atan;
const arcTan2 = Math.atan2;
const ceiling = Math.ceil;
const floorVal = Math.floor;
const maximum = Math.max;
const minimum = Math.min;
const generateRandom = Math.random;
const roundValue = Math.round;
const squareRoot = Math.sqrt;
const powerOf = Math.pow;


// Hyperbolic Trigonometric Functions
function hyperbolicCosine(valX) {
    const expX = Math.exp(valX);
    const expNegX = Math.exp(-valX);
    return 0.5 * (expX + expNegX);
}
function hyperbolicSine(valX) {
    const expX = Math.exp(valX);
    const expNegX = Math.exp(-valX);
    return 0.5 * (expX - expNegX);
}
function hyperbolicTangent(valX) {
    const expX = Math.exp(valX);
    const expNegX = Math.exp(-valX);
    const numerator = expX - expNegX;
    const denominator = expX + expNegX;
    return numerator / denominator;
}
function hyperbolicSecant(valX) {
    return 1 / hyperbolicCosine(valX);
}
function hyperbolicCosecant(valX) {
    // Note: Original cosech was defined as 1/sech(x), which is incorrect.
    // It should be 1/sinh(x).
    return 1 / hyperbolicSine(valX);
}
function hyperbolicCotangent(valX) {
    return 1 / hyperbolicTangent(valX);
}

// Inverse Hyperbolic Trigonometric Functions
function inverseHyperbolicCosine(valX) {
    return naturalLog(valX + squareRoot(valX * valX - 1));
}
function inverseHyperbolicSine(valX) {
    return naturalLog(valX + squareRoot(valX * valX + 1));
}
function inverseHyperbolicTangent(valX) {
    const term1 = 1 + valX;
    const term2 = 1 - valX;
    if (term2 === 0) return NaN; // Guard against division by zero
    return 0.5 * naturalLog(term1 / term2);
}


// N-th power of functions
function nLog(degree, inputVal) { return powerOf(naturalLog(inputVal), degree); }
function nSine(degree, inputVal) { return powerOf(sine(inputVal), degree); }
function nCosine(degree, inputVal) { return powerOf(cosine(inputVal), degree); }
function nTangent(degree, inputVal) { return powerOf(tangent(inputVal), degree); }
function nCotangent(degree, inputVal) { return powerOf(cotangent(inputVal), degree); }
function nSecant(degree, inputVal) { return powerOf(secant(inputVal), degree); }
function nCosecant(degree, inputVal) { return powerOf(cosecant(inputVal), degree); }
function nBaseLog(degree, inputVal) { return powerOf(Math.log10(inputVal), degree); } // Assuming log was Math.log10 in context

function nHyperbolicCosine(degree, inputVal) { return powerOf(hyperbolicCosine(inputVal), degree); }
function nHyperbolicSine(degree, inputVal) { return powerOf(hyperbolicSine(inputVal), degree); }
function nHyperbolicTangent(degree, inputVal) { return powerOf(hyperbolicTangent(inputVal), degree); }
function nHyperbolicCotangent(degree, inputVal) { return powerOf(hyperbolicCotangent(inputVal), degree); }
function nHyperbolicSecant(degree, inputVal) { return powerOf(hyperbolicSecant(inputVal), degree); }
function nHyperbolicCosecant(degree, inputVal) { return powerOf(hyperbolicCosecant(inputVal), degree); }

// Logarithm with arbitrary base
function logarithmBase(base, value) {
    if (base <= 1 || value <= 0) { // Guard for invalid log bases/values
        return NaN;
    }
    return Math.log(value) / Math.log(base);
}

// Unit step functions
function unitStep(valX) {
    if (valX < 0) {
        return 0;
    } else if (valX === 0) {
        return 0.5;
    } else { // valX > 0
        return 1;
    }
}
function discreteUnitStep(valX) {
    return (valX >= 0) ? 1 : 0;
}
function diracDelta(valX) {
    if (valX === 0) {
        return Infinity;
    }
    return 0;
}

// Signum function
function signumFunction(valX) {
    if (valX > 0) return 1;
    if (valX < 0) return -1;
    return 0; // for x === 0
}
// Alternative implementation of signum
// function signumFunction(valX) {
//     return 2 * unitStep(valX) - 1;
// }


// Piecewise function
function evaluatePiecewise(condition, valueIfTrue, valueIfFalse) {
    if (condition) {
        return valueIfTrue;
    }
    return valueIfFalse;
}

// Sinc function
function normalizedSinc(valX) {
    if (valX === 0) {
        return 1;
    }
    const piX = k_Pi * valX;
    return sine(piX) / piX;
}

// Reciprocal Trigonometric Functions
function secant(valX) { return 1 / cosine(valX); }
function cosecant(valX) { return 1 / sine(valX); }
function cotangent(valX) { return 1 / tangent(valX); }
const cotanAlias = cotangent;
const ctgAlias = cotangent;
const cosecAlias = cosecant;


// Bell Numbers Sequence (up to B_22)
const bellNumbersSeries = [1, 1, 2, 5, 15, 52, 203, 877, 4140, 21147, 115975, 678570, 4213597, 27644437, 190899322, 1382958545, 10480142147, 82864869804, 682076806159, 5832742205057, 51724158235372, 474869816156751, 4506715738447323];

// Riemann Zeta Function Approximation
function riemannZetaApprox(sVal) {
    if (sVal === 0) {
        return -0.5;
    } else if (sVal === 1) {
        return Infinity;
    } else if (sVal === 2) {
        return (k_Pi * k_Pi) / 6;
    } else if (sVal === 4) {
        return (k_Pi * k_Pi * k_Pi * k_Pi) / 90;
    } else if (sVal < 1) { // For s < 1, the formula is more complex, returning Inf for simplicity here
        return Infinity;
    }

    // A rough approximation for s > 1
    let cumulativeSum = 4.4 * powerOf(sVal, -5.1); // Initial term for faster convergence
    const maxTerms = 10;
    for (let nPower = 1; nPower <= maxTerms; nPower++) {
        cumulativeSum += powerOf(nPower, -sVal);
    }
    return cumulativeSum;
}

// Log-Gamma function (Lanczos Approximation coefficients)
function logGammaLanczos(zVal) {
    const lanczosCoeffs = [
        57.1562356658629235, -59.5979603554754912, 14.1360979747417471,
        -0.491913816097620199, 0.339946499848118887e-4, 0.465236289270485756e-4,
        -0.983744753048795646e-4, 0.158088703224912494e-3, -0.210264441724104883e-3,
        0.217439618115212643e-3, -0.164318106536763890e-3, 0.844182239838527433e-4,
        -0.261908384015814087e-4, 0.368991826595316234e-5
    ];

    if (zVal <= 0) {
        throw new Error("Input to logGammaLanczos must be positive.");
    }

    let currentY = zVal;
    let tempVal = zVal + 5.24218750000000000;
    tempVal = (zVal + 0.5) * naturalLog(tempVal) - tempVal;
    let seriesSum = 0.999999999999997092;

    for (let j = 0; j < lanczosCoeffs.length; j++) {
        seriesSum += lanczosCoeffs[j] / (++currentY);
    }
    const finalTerm = naturalLog(2.5066282746310005 * seriesSum / zVal);
    return tempVal + finalTerm;
}

// Gamma Function
function computeGamma(value) {
    if (value === 0) {
        return Infinity;
    }
    if (value < 0) {
        // Reflection formula: Gamma(z) = pi / (sin(pi*z) * Gamma(1-z))
        const sinTerm = sine(k_Pi * value);
        if (sinTerm === 0) return Infinity; // Guard against poles
        const gammaOneMinusZ = computeGamma(1 - value);
        if (!Number.isFinite(gammaOneMinusZ)) return NaN; // Propagate non-finite results
        return k_Pi / (sinTerm * gammaOneMinusZ);
    }
    return Math.exp(logGammaLanczos(value));
}


// Factorial function
function calculateFactorial(numVal) {
    // Handle integer cases for small numbers
    if (numVal === 0 || numVal === 1) {
        return 1;
    } else if (Number.isInteger(numVal) && numVal > 0 && numVal < 15) {
        let productAccumulator = 1;
        for (let counter = 1; counter <= numVal; counter++) {
            productAccumulator *= counter;
        }
        return Math.floor(productAccumulator); // Ensure integer result
    } else if (!Number.isInteger(numVal) || numVal < 0) {
        // For non-integer or negative values, use the Gamma function
        return computeGamma(numVal + 1);
    }
    // For large integers, Gamma function is also used (or can be extended for Stirling's approx)
    return computeGamma(numVal + 1);
}

// Double Factorial
function calculateDoubleFactorial(numVal) {
    // This formula is specific and may not cover all cases or definitions of double factorial
    const term1 = powerOf(2, (numVal / 2 - 0.25 * cosine(k_Pi * numVal) + 0.25)); // Corrected 1/4 to 0.25
    const term2 = powerOf(k_Pi, (0.25 * cosine(k_Pi * numVal) - 0.25));
    const gammaTerm = computeGamma(numVal / 2 + 1);
    return term1 * term2 * gammaTerm;
}

// Bell Number Function (Approximation for large N)
function getBellNumber(indexN) {
    if (Number.isInteger(indexN) && indexN >= 0 && indexN < bellNumbersSeries.length) {
        return bellNumbersSeries[indexN];
    } else if (indexN < 0) {
        return NaN; // Bell numbers are defined for non-negative integers
    } else {
        // Approximation using Dobinski's formula for larger N
        let sumApproximation = 0;
        const maxIter = 5; // Limiting iterations for approximation
        for (let approxIdx = 0; approxIdx < maxIter; approxIdx++) {
            sumApproximation += powerOf(approxIdx, indexN) / calculateFactorial(approxIdx);
        }
        return sumApproximation / k_Euler;
    }
}


// Function to compute the N-th derivative of a function
let recursionDepthCounter = 0; // Global counter to prevent stack overflow

function computeNthDerivative(funcId, derivativeOrder, pointX) {
    recursionDepthCounter++;
    const maxAllowedDepth = 8; // Limit recursive calls
    if (recursionDepthCounter > maxAllowedDepth) {
        recursionDepthCounter--;
        return 0; // Return zero to prevent infinite recursion
    }

    const stepSize = 0.0001; // Small value for numerical differentiation
    let derivativeResult;

    if (derivativeOrder > 0) {
        // Recursive application of central difference formula
        const forwardDiff = computeNthDerivative(funcId, derivativeOrder - 1, pointX + stepSize);
        const backwardDiff = computeNthDerivative(funcId, derivativeOrder - 1, pointX - stepSize);
        derivativeResult = (forwardDiff - backwardDiff) / (2 * stepSize);
    } else {
        // Base case: 0-th derivative is the function itself
        // Assumes 'g' is an external array/map of functions where g[funcId] is the target function
        if (typeof funcId === 'function') { // Check if funcId is directly a function
            derivativeResult = funcId(pointX);
        } else if (typeof g === 'object' && g !== null && typeof g[funcId] === 'function') {
            derivativeResult = g[funcId](pointX);
        } else {
            console.warn(`Function with ID '${funcId}' not found for derivative calculation.`);
            derivativeResult = 0;
        }
    }

    recursionDepthCounter--;
    return derivativeResult;
}


// Mapping of LaTeX commands to their mathematical representations or internal functions
const latexSymbolMap = {
    'greaterthan': ">",
    "absolutevalueopen": "abs:(",
    "absolutevalueclose": ")",
    "hyperbolic_cos": "cosh",
    "hyperbolic_sin": "sinh",
    "hyperbolic_tan": "tanh",
    "hyperbolic_cot": "coth",
    "hyperbolic_sec": "sech",
    "hyperbolic_csc": "csch",
    "sine": "sin:",
    "cosine": "cos:",
    "tangent": "tan:",
    "multiply": "*",
    "secant": "sec:",
    "cosecant": "csc:",
    "cotangent": "cot:",
    "natural_log": "ln:",
    "base10_log": "log:",
    "logarithm": "log:",
    "determinant": "det:",
    "dimension": "dim:",
    "maximum": "max:",
    "minimum": "min:",
    "modulo": "mod:",
    "least_common_multiple": "lcm:",
    "greatest_common_divisor": "gcd:",
    "highest_common_factor": "hcf:",
    "limit": "lim:",
    "colon": "", // Remove colon
    "open_paren": "(",
    "close_paren": ")",
    "open_bracket": "[",
    "close_bracket": "]",
    'greaterthanequal': ">=",
    'lessthan': "<",
    'lessthanequal': "<=",
    "infinity": "∞",
    "centerdot": "*",
    "text_literal": "", // Remove text literal
    "fraction_placeholder": "", // Placeholder for fraction formatting
    "backslash_char": "\\",
    "alpha": "α",
    "beta": "β",
    'gamma_lc': "γ",
    'delta_lc': "δ",
    'zeta_lc': "ζ",
    'eta_lc': "η",
    'theta_lc': "θ",
    'iota_lc': "ι",
    'kappa_lc': "κ",
    'mu_lc': "μ",
    'nu_lc': "ν",
    'xi_lc': "ξ",
    'omicron_lc': "ο",
    'rho_lc': "ρ",
    'sigma_lc': "σ",
    'tau_lc': "τ",
    'upsilon_lc': "υ",
    'chi_lc': "χ",
    'psi_lc': "ψ",
    'omega_lc': "ω",
    'phi_lc': "ϕ",
    "phivariant": "φ",
    "varepsilon_lc": "ε",
    "sigmafinal": "ς",
    "digamma_symbol": "ϝ",
    "varkappa_symbol": "ϰ",
    "varpi_symbol": "ϖ",
    "plusminus": "±",
    "varrho_symbol": "ϱ",
    "vartheta_symbol": "ϑ",
    "pi_lc": "π",
    "lambda_lc": "λ",
    'Gamma_uc': "Γ",
    'Delta_uc': "Δ",
    'Theta_uc': "Θ",
    'Lambda_uc': "Λ",
    'Xi_uc': "Ξ",
    'Pi_uc': "Π",
    'Sigma_uc': "Σ",
    'Upsilon_uc': "Υ",
    'Phi_uc': "Φ",
    'Psi_uc': "Ψ",
    'Omega_uc': "Ω",
    "perpendicular": "⊥",
    "comma_sep": " ",
    "nabla_operator": "∇",
    "for_all": "∀",
    "summation_op": "∑",
    "sum_symbol": "∑",
    "product_op": "∏",
    "product_symbol": "∏",
    "coproduct_op": "∐",
    "coproduct_symbol": "∐",
    "integral_op": "∫",
    "integral_symbol": "∫"
};

// Enumeration for mathematical expression types
const expressionKind = {
    "product_expr": 1,
    "sum_expr": 2,
    "numeric_literal": 3,
    "discrete_vector_data": 6,
    "continuous_vector_data": 7,
    "power_expr": 8,
    "function_call": 9,
    "fraction_expr": 10,
    "derivative_expr": 11,
    "integral_expr": 12,
    "equality_relation": 13,
    "plus_minus_op": 14,
    "operator_factor": 15,
    "less_than_relation": 16,
    "greater_than_relation": 17,
    "range_definition": 18
};

let parserDebugFlag = 0;
let generalDebugMode = 1;

// Conditional debugging utility
function debugOutput(primaryValue, fallbackValue) {
    if (generalDebugMode) {
        return primaryValue;
    }
    return fallbackValue;
}