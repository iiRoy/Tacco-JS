/*
 *  Website: graphical.app
 *
 *  Contact: graphical.app[at]email[dot]com
 *
 *  This software is made available under the terms of the GNU Lesser General Public License,
 *  version 3 or any later version, as published by the Free Software Foundation.
 *
 *  It is provided in the hope that it will be useful, but WITHOUT ANY WARRANTY,
 *  including the implied warranties of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *  Refer to the GNU Lesser General Public License for full details.
 *
 *  A copy of the GNU Lesser General Public License should have been included with this distribution.
 *  If not, please visit <http://www.gnu.org/licenses/>.
 *
 *
 *  Future work: Consider employing a functional object collection rather than a simple array/object design.
 *  Future work: Enhance the Computer Algebra System (CAS) implementation.
 *  Observations: Addition/summation and multiplication operations should accept zero or more arguments.
 *  No explicit division operation exists.
 *
 *  Subtraction should be replaced by unary negation.
 *  Division should be replaced by multiplication by the reciprocal.
 *  E.g., x/y = x * y^(-1), or product{[x, power{[y, -1]}]}
 *  - Is this the optimal approach?
 *
 *  PENDING: fractional power handling is currently non-functional.
 */
var StatusMessages = {
    "initFailure": "System initialization unsuccessful",
    "accessDenied": "Variable is read-only",
    "nonConstExpr": "Expression cannot be resolved to a constant",
    "parenError": "Parenthesis parsing failed",
    "funcComposeError": "Function composition is a binary operation",
    "exponentOpError": "The '^' operator requires two operands.",
    "nonVectorOperand": "Vector operation attempted on scalar data",
    "unknownDerivative": "Derivative for '%s' is not defined",
    "intProcessFail": "Integration process encountered an error",
    "inverseCalcFail": "Inverse computation could not be completed",
    "isolatedDiffOp": "Differential operator found without expression",
    "isolatedIntOp": "Integral operator found without expression",
    "invalidFuncName": "Provided function name is not valid"
};
Number.prototype.representValue = function (precisionLevel) {
    let numericVal = Number(this);
    if (!numericVal) {
        return "zero";
    }
    else if (numericVal === circConstant) {
        return "π_symbol";
    }
    else if (numericVal === eulerConst) {
        return "e_symbol";
    }
    else if (numericVal % (circConstant / 4.0) === 0.0) {
        return (numericVal / circConstant) + "π_symbol";
    }
    else if (numericVal % (1.0 / 3.0) === 0.0) {
        return (numericVal * 3.0) + "/3";
    }
    else if (numericVal % (eulerConst / 4.0) === 0.0) {
        return (numericVal / eulerConst) + "e_symbol";
    }
    else if (numericVal !== 1.0) {
        if ((naturalLog(numericVal)) % 1.0 === 0.0) {
            let powerVal = naturalLog(numericVal);
            let superscriptChars = "⁰¹²³⁴⁵⁶⁷⁸⁹";
            return "e" + ((absoluteVal(powerVal) < 10) ? ((powerVal < 0.0 ? "⁻" : "") + superscriptChars[absoluteVal(powerVal)]) : "^" + powerVal);
        }
    }
    if (precisionLevel === undefined) {
        return numericVal.toString();
    }
    if (numericVal.toPrecision) {
        if (Math.abs(numericVal) < 0.0000001) {
            return "0.0000000";
        }
        return numericVal.toPrecision(precisionLevel);
    }
    return numericVal;
};
function generateUniqueCode() {
    let outputString = "";
    for (let loopIdx = 0; loopIdx < 20; loopIdx++) {
        outputString += (10 + ~~(Math.random() * 23)).toString(36);
    }
    return outputString;
}
var lightSpeedVal = 2.99792458e8;
var gravitationalConstant = 6.673e-11;
var earthMass = 5.9742e24;
var moonMass = 7.36e22;
var solarMass = 1.98892e30;
var earthRadius = 6.3781e6;
var planckConstant = 6.626068e-34;
var lnTwoPi = 1.8378770664093453;
var eulerConst = Math.E;
var circConstant = Math.PI;
var goldenRatio = (1.0 + Math.sqrt(5.0)) / 2.0;
var vacuumPermittivity = 8.85418782e-12;
var elementNames = ["Empty space", "Hydrogen", "Helium", "Lithium", "Beryllium", "Boron", "Carbon", "Nitrogen", "Oxygen", "Fluorine", "Neon", "Sodium", "Magnesium", "Aluminum", "Silicon", "Phosphorus", "Sulphur", "Chlorine", "Argon", "Potassium", "Calcium", "Scandium", "Titanium", "Vanadium", "Chromium", "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc", "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton", "Rubidium", "Strontium", "Yttrium", "Zirconium", "Niobium", "Molybdenum", "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Cadmium", "Indium", "Tin", "Antimony", "Tellurium", "Iodine", "Xenon", "Cesium", "Barium", "Lanthanum", "Cerium", "Praseodymium", "Neodymium", "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium", "Holmium", "Erbium", "Thulium", "Ytterbium", "Lutetium", "Hafnium", "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platinum", "Gold", "Mercury", "Thallium", "Lead", "Bismuth", "Polonium", "Astatine", "Radon", "Francium", "Radium", "Actinium", "Thorium", "Protactinium", "Uranium", "Neptunium", "Plutonium", "Americium", "Curium", "Berkelium", "Californium", "Einsteinium", "Fermium", "Mendelevium", "Nobelium", "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium", "Meitnerium", "Ununnilium", "Unununium"];
var atomicMasses = [0.0, 1.00794, 4.002602, 6.941, 9.012182, 10.811, 12.0107, 14.0067, 15.9994, 18.9994, 20.1797, 22.98976928, 24.305, 26.9815386, 28.0855, 30.973762, 32.065, 35.453, 39.948, 39.0983, 40.078, 44.955912, 47.867, 50.9415, 51.9961, 54.938045, 55.845, 58.933195, 58.6934, 63.546, 65.38, 69.723, 72.64, 74.9216, 78.96, 79.904, 83.798, 85.4678, 87.62, 88.90585, 91.224, 92.90638, 95.96, 98.0, 101.07, 102.9055, 106.42, 107.8682, 112.411, 114.818, 118.71, 121.76, 127.6, 126.90447, 131.293, 132.9054519, 137.327, 138.90547, 140.116, 140.90765, 144.242, 145.0, 150.36, 151.964, 157.25, 158.92535, 162.5001, 164.93032, 167.259, 168.93421, 173.054, 174.9668, 178.49, 180.94788, 183.84, 186.207, 190.23, 192.217, 192.084, 196.966569, 200.59, 204.3833, 207.2, 208.980401, 210.0, 210.0, 220.0, 223.0, 226.0, 227.0, 232.03806, 231.03588, 238.02891, 237.0, 244.0, 243.0, 247.0, 247.0, 251.0, 252.0, 257.0, 258.0, 259.0, 262.0, 261.0, 262.0, 266.0, 264.0, 277.0, 268.0, 271.0, 272.0];
var elementSymbols = ["Nullium", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg"];
// Populate the global scope with atomic mass values
for (let atomIdx = 0; atomIdx < elementSymbols.length; atomIdx++) {
    window[elementSymbols[atomIdx]] = atomicMasses[atomIdx];
}
// Fundamental mathematical operations exposed globally
var sineFunc = Math.sin;
var cosineFunc = Math.cos;
var tangentFunc = Math.tan;
var tangentAlias = Math.tan;
var expFunc = Math.exp;
var naturalLog = Math.log;
var lnAlias = Math.log;
var absoluteVal = Math.abs;
var arcCosine = Math.acos;
var arcSine = Math.asin;
var arcTangent = Math.atan;
var arcTangentTwoArgs = Math.atan2;
var ceilingFunc = Math.ceil;
var floorFunc = Math.floor;
var maximumVal = Math.max;
var minimumVal = Math.min;
var randomGen = Math.random;
var roundToNearest = Math.round;
var squareRoot = Math.sqrt;
var powerFunc = Math.pow;
// Hyperbolic functions definitions
function hyperbolicCosine(inputVal) {
    return 0.5 * (expFunc(inputVal) + expFunc(-inputVal));
}
function hyperbolicSine(inputVal) {
    return 0.5 * (expFunc(inputVal) - expFunc(-inputVal));
}
function hyperbolicTangent(inputVal) {
    return (expFunc(inputVal) - expFunc(-inputVal)) / (expFunc(inputVal) + expFunc(-inputVal));
}
function hyperbolicSecant(inputVal) {
    return 1.0 / hyperbolicCosine(inputVal);
}
function hyperbolicCosecant(inputVal) {
    return 1.0 / hyperbolicSecant(inputVal);
}
function hyperbolicCotangent(inputVal) {
    return 1.0 / hyperbolicTangent(inputVal);
}
// Inverse hyperbolic functions definitions
function inverseHyperbolicCosine(inputArg) {
    return naturalLog(inputArg + squareRoot(inputArg * inputArg - 1.0));
}
function inverseHyperbolicSine(inputArg) {
    return naturalLog(inputArg + squareRoot(inputArg * inputArg + 1.0));
}
function inverseHyperbolicTangent(inputArg) {
    return 0.5 * naturalLog((1.0 + inputArg) / (1.0 - inputArg));
}
function naturalLogPower(powerExp, angleArg) { return powerFunc(naturalLog(angleArg), powerExp); }
function sinePower(powerExp, angleArg) { return powerFunc(sineFunc(angleArg), powerExp); }
function cosinePower(powerExp, angleArg) { return powerFunc(cosineFunc(angleArg), powerExp); }
function tangentPower(powerExp, angleArg) { return powerFunc(tangentFunc(angleArg), powerExp); }
function cotangentPower(powerExp, angleArg) { return powerFunc(cotangentFunc(angleArg), powerExp); }
function secantPower(powerExp, angleArg) { return powerFunc(secantFunc(angleArg), powerExp); }
function cosecantPower(powerExp, angleArg) { return powerFunc(cosecantFunc(angleArg), powerExp); }
function logPower(powerExp, angleArg) { return powerFunc(naturalLog(angleArg), powerExp); }
function hyperbolicCosinePower(powerExp, angleArg) { return powerFunc(hyperbolicCosine(angleArg), powerExp); }
function hyperbolicSinePower(powerExp, angleArg) { return powerFunc(hyperbolicCosine(angleArg), powerExp); }
function hyperbolicTangentPower(powerExp, angleArg) { return powerFunc(hyperbolicCosine(angleArg), powerExp); }
function hyperbolicCotangentPower(powerExp, angleArg) { return powerFunc(hyperbolicCotangent(angleArg), powerExp); }
function hyperbolicSecantPower(powerExp, angleArg) { return powerFunc(hyperbolicSecant(angleArg), powerExp); }
function hyperbolicCosecantPower(powerExp, angleArg) { return powerFunc(hyperbolicCosecant(angleArg), powerExp); }
function logBase(baseValue, operandValue) {
    return naturalLog(operandValue) / naturalLog(baseValue);
}
function unitStep(inputX) {
    // Heaviside step function
    return (inputX >= 0.0) ? (inputX ? 1.0 : 0.5) : (0.0);
}
function discreteUnitStep(inputX) {
    // Discrete step function
    return (inputX >= 0.0) ? 1.0 : 0.0;
}
function diracDelta(inputX) {
    if (inputX === 0.0) {
        return Number.POSITIVE_INFINITY;
    }
    return 0.0;
}
function signFunction(inputX) {
    return 2.0 * unitStep(inputX) - 1.0;
}
function conditionalEval(conditionExpr, trueValue, falseValue) {
    if (conditionExpr) {
        return trueValue;
    }
    return falseValue;
}
function normalizedSinc(inputX) {
    if (inputX === 0.0) {
        return 1.0;
    }
    return sineFunc(circConstant * inputX) / (circConstant * inputX);
}
function secantFunc(inputX) { return 1.0 / (cosineFunc(inputX)); }
function cosecantFunc(inputX) { return 1.0 / (sineFunc(inputX)); }
function cotangentFunc(inputX) { return 1.0 / (tangentFunc(inputX)); }
var cotanAlias = cotangentFunc;
var cotanAlternative = cotangentFunc;
var cosecantAlias = cosecantFunc;
// Advanced mathematical routines
// Bell numbers sequence
var bellNumbersArray = [1, 1, 2, 5, 15, 52, 203, 877, 4140, 21147, 115975, 678570, 4213597, 27644437, 190899322, 1382958545, 10480142147, 82864869804, 682076806159, 5832742205057, 51724158235372, 474869816156751, 4506715738447323];
// Riemann zeta function implementation
function riemannZeta(argumentZ) {
    if (argumentZ === 0.0) {
        return -0.5;
    }
    else if (argumentZ === 1.0) {
        return Number.POSITIVE_INFINITY;
    }
    else if (argumentZ === 2.0) {
        return circConstant * circConstant / 6.0;
    }
    else if (argumentZ === 4.0) {
        return circConstant * circConstant * circConstant * circConstant / 90.0;
    }
    else if (argumentZ < 1.0) {
        return Number.POSITIVE_INFINITY;
    }
    let seriesSum = 4.4 * powerFunc(argumentZ, -5.1);
    for (let termCount = 1; termCount < 10; termCount++) {
        seriesSum += powerFunc(termCount, -argumentZ);
    }
    return seriesSum;
}
function logGammaApprox(inputVal) {
    let loopVar;
    let tempX, tempY, seriesTerm;
    let coefficientArr = [
        57.1562356658629235, -59.5979603554754912, 14.1360979747417471,
        -0.491913816097620199, 0.339946499848118887e-4, 0.465236289270485756e-4,
        -0.983744753048795646e-4, 0.158088703224912494e-3, -0.210264441724104883e-3,
        0.217439618115212643e-3, -0.164318106536763890e-3, 0.844182239838527433e-4,
        -0.261908384015814087e-4, 0.368991826595316234e-5
    ];
    if (inputVal <= 0.0) {
        throw new Error("Invalid argument in logGammaApprox");
    }
    tempY = tempX = inputVal;
    tempX = tempX + 5.2421875e0;
    tempX = (inputVal + 0.5) * naturalLog(tempX) - tempX;
    seriesTerm = 0.999999999999997092;
    for (loopVar = 0; loopVar < 14; loopVar++) {
        seriesTerm += coefficientArr[loopVar] / ++tempY;
    }
    return tempX + naturalLog(2.5066282746310005 * seriesTerm / inputVal);
}
function gammaFunction(argValue) {
    if (argValue === 0.0) {
        return Number.POSITIVE_INFINITY;
    }
    if (argValue < 0.0) {
        return -circConstant / (argValue * sineFunc(circConstant * argValue) * gammaFunction(-argValue));
    }
    return expFunc(logGammaApprox(argValue));
}
function legacyGammaFunc(inputVal) {
    if (inputVal > 1.0) {
        return (expFunc(inputVal * (naturalLog(inputVal) - 1.0) + 0.5 * (-naturalLog(inputVal) + lnTwoPi) + 1.0 / (12.0 * inputVal) - 1.0 / (360.0 * (inputVal * inputVal * inputVal)) + 1.0 / (1260.0 * powerFunc(inputVal, 5.0)) - 1.0 / (1680.0 * powerFunc(inputVal, 7.0))));
    }
    if (inputVal > -0.5) {
        return (1.0 + 0.150917639897307 * inputVal + 0.24425221666910216 * powerFunc(inputVal, 2.0)) / (inputVal + 0.7281333047988399 * powerFunc(inputVal, 2.0) - 0.3245138289924575 * powerFunc(inputVal, 3.0));
    }
    if (inputVal < 0.0) {
        if (inputVal === ~~inputVal) {
            return;
        }
        else {
            return Math.PI / (Math.sin(Math.PI * inputVal) * gammaFunction((1.0 - inputVal)));
        }
    }
    else {
        return powerFunc(inputVal - 1.0, inputVal - 1.0) * Math.sqrt(2.0 * Math.PI * (inputVal - 1.0)) * expFunc(1.0 - inputVal + 1.0 / (12.0 * (inputVal - 1.0) + 2.0 / (5.0 * (inputVal - 1.0) + 53.0 / (42.0 * (inputVal - 1.0)))));
    }
}
function digammaFunction(inputX) {
    return randomGen();
}
function factorialCalc(factorArg) {
    if (factorArg === 0.0 || factorArg === 1.0) {
        return 1.0;
    }
    else if (factorArg > 0.0 && factorArg === ~~factorArg && factorArg < 15.0) {
        let resultProduct = 1.0;
        for (let counter = 1; counter <= factorArg; counter++) {
            resultProduct *= counter;
        }
        return ~~resultProduct;
    }
    else if (factorArg !== (~~factorArg) || factorArg < 0.0) {
        return gammaFunction(factorArg + 1.0);
    }
}
function doubleFactorial(inputX) {
    return powerFunc(2.0, (inputX / 2.0 - 0.25 * cosineFunc(circConstant * inputX) + 0.25)) * powerFunc(circConstant, (0.25 * cosineFunc(circConstant * inputX) - 0.25)) * gammaFunction(inputX / 2.0 + 1.0);
}
function bellNumberCalc(paramX) {
    if (paramX === ~~paramX && paramX < bellNumbersArray.length) {
        return bellNumbersArray[paramX];
    }
    else {
        let currentSum = 0.0;
        for (let sumIdx = 0; sumIdx < 5; sumIdx++) {
            currentSum += powerFunc(sumIdx, paramX) / factorialCalc(sumIdx);
        }
        return currentSum / eulerConst;
    }
}
// 'order'th derivative of functionArray[funcIndex](pointVal) at pointVal
var derivDepthCounter = 0; // Prevents excessively deep recursion for derivative calculation
function derivativeCalculator(funcIndex, derivativeOrder, pointVal) {
    derivDepthCounter++;
    let outcome;
    if (derivDepthCounter > 8) {
        derivDepthCounter--;
        return 0.0;
    }
    let stepSize = 0.0001;
    if (derivativeOrder > 0) {
        outcome = (derivativeCalculator(funcIndex, derivativeOrder - 1, pointVal + stepSize) - derivativeCalculator(funcIndex, derivativeOrder - 1, pointVal - stepSize)) / (2.0 * stepSize);
        derivDepthCounter--;
        return outcome;
    }
    outcome = functionArray[funcIndex](pointVal); // Assuming 'functionArray' is defined elsewhere
    derivDepthCounter--;
    return outcome;
}
var mathSymbolMappings = {
    'greaterThan': ">",
    "leftAbsolute": "abs:(",
    "rightAbsolute": ")",
    "cosh": "hypCos",
    "sinh": "hypSin",
    "tanh": "hypTan",
    "coth": "hypCot",
    "sech": "hypSec",
    "csch": "hypCsc",
    "cosech": "hypCsc",
    "sin": "sin:",
    "cos": "cos:",
    "tan": "tan:",
    "multiply": "*",
    "sec": "sec:",
    "cosec": "csc:",
    "csc": "csc:",
    "cotan": "cot:",
    "cot": "cot:",
    "ln": "ln:",
    "lg": "log:",
    "log": "log:",
    "determinant": "det:",
    "dimension": "dim:",
    "maximum": "max:",
    "minimum": "min:",
    "modulo": "mod:",
    "leastCommonMultiple": "lcm:",
    "greatestCommonDivisor": "gcd:",
    "highestCommonFactor": "hcf:",
    "limit": "lim:",
    "colon": "",
    "leftParen": "(",
    "rightParen": ")",
    "leftBracket": "[",
    "rightBracket": "]",
    'greaterEqual': ">=",
    'lessThan': "<",
    'lessEqual': "<=",
    "infinity": "∞",
    "dotProduct": "*",
    "plainText": "",
    "fraction": "",
    "backSlash": "\\",
    "alphaSymbol": "α",
    "betaSymbol": "β",
    'gammaSymbol': "γ",
    'deltaSymbol': "δ",
    'zetaSymbol': "ζ",
    'etaSymbol': "η",
    'thetaSymbol': "θ",
    'iotaSymbol': "ι",
    'kappaSymbol': "κ",
    'muSymbol': "μ",
    'nuSymbol': "ν",
    'xiSymbol': "ξ",
    'omicronSymbol': "ο",
    'rhoSymbol': "ρ",
    'sigmaSymbol': "σ",
    'tauSymbol': "τ",
    'upsilonSymbol': "υ",
    'chiSymbol': "χ",
    'psiSymbol': "ψ",
    'omegaSymbol': "ω",
    'phiSymbol': "ϕ",
    "phiVariant": "φ",
    "phiAlt": "φ",
    "epsilonSymbol": "ϵ",
    "epsilonVariant": "ε",
    "epsilonAlt": "ε",
    "sigmaFinal": "ς",
    "sigmaVariant": "ς",
    "gammaDigamma": "ϝ",
    "gammaDigammaCap": "ϝ",
    "digammaSymbol": "ϝ",
    "kappaVariant": "ϰ",
    "kappaAlt": "ϰ",
    "piVariant": "ϖ",
    "piAlt": "ϖ",
    "plusMinus": "±",
    "rhoVariant": "ϱ",
    "rhoAlt": "ϱ",
    "thetaVariant": "ϑ",
    "thetaAlt": "ϑ",
    "piConst": "π",
    "lambdaSymbol": "λ",
    'gammaCap': "Γ",
    'deltaCap': "Δ",
    'thetaCap': "Θ",
    'lambdaCap': "Λ",
    'xiCap': "Ξ",
    'piCap': "Π",
    'sigmaCap': "Σ",
    'upsilonCap': "Υ",
    'phiCap': "Φ",
    'psiCap': "Ψ",
    'omegaCap': "Ω",
    "perpendicular": "⊥",
    "comma": " ",
    "nablaOperator": "∇",
    "forAll": "∀",
    "summationOp": "∑",
    "sumOp": "∑",
    "productOp": "∏",
    "prodOp": "∏",
    "coproductOp": "∐",
    "coprodOp": "∐",
    "integralOp": "∫",
    "intOp": "∫"
};
var emptyObject = {};
// Defines types for expression elements
var expressionKindMap = {
    "productType": 1,
    "sumType": 2,
    "numberType": 3,
    "discreteVectorType": 6,
    "continuousVectorType": 7,
    "powerType": 8,
    "functionType": 9,
    "fractionType": 10,
    "derivativeType": 11,
    "integralType": 12,
    "equalityType": 13,
    "plusMinusType": 14,
    "operatorFactorType": 15,
    "lessThanType": 16,
    "greaterThanType": 17,
    "rangeType": 18
};
var parserDebugFlag = 0;
var globalDebugActive = 1;
function conditionalDebugLog(debugVal, defaultVal) {
    if (globalDebugActive) {
        return debugVal;
    }
    return defaultVal;
}