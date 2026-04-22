const UniversalCalculations = (() => {

    const issueMessages = new Map([
        ["initializationFailure", "Operation could not be initiated."],
        ["readOnlyAccess", "This value cannot be altered."],
        ["nonConstantExpression", "The expression does not yield a constant value."],
        ["parenthesisMismatch", "Bracket parsing issue detected."],
        ["functionCompositionError", "Function composition requires two operands."],
        ["exponentOperatorError", "The exponentiation operator is binary."],
        ["vectorMismatch", "Vector operation attempted on a non-vector entity."],
        ["unknownDerivative", "Derivative for %s is not defined."],
        ["integrationFailure", "Integral calculation terminated unsuccessfully."],
        ["inverseOperationFailed", "Reciprocal operation could not be determined."],
        ["loneDifferentialOperator", "Differential operator found without expression."],
        ["loneIntegralOperator", "Integral operator found without expression."],
        ["invalidFunctionName", "Function identifier is not a valid string."]
    ]);

    const generateUniqueToken = (len = 20) => {
        let tokenSequence = '';
        for (let idx = 0; idx < len; idx++) {
            tokenSequence += ((Math.random() * 35 | 0) + 1).toString(36);
        }
        return tokenSequence;
    };

    const presentNumericValue = (val, precisionDigits) => {
        let numericVal = Number(val);

        if (!Number.isFinite(numericVal)) {
            return "0";
        }

        const currentEuler = UniversalCalculations.Constants.euler;
        const currentPi = UniversalCalculations.Constants.circleRatio;
        const smallTolerance = 1e-9;
        const tinyValueThreshold = 1e-7;

        if (Math.abs(numericVal - currentPi) < smallTolerance) {
            return "Π";
        } else if (Math.abs(numericVal - currentEuler) < smallTolerance) {
            return "ℇ";
        }

        const piDiv4 = currentPi / 4;
        if (Math.abs(numericVal % piDiv4) < smallTolerance) {
            const multiple = Math.round(numericVal / currentPi);
            if (multiple !== 0) return `${multiple}Π`;
        }

        const oneThird = 1 / 3;
        if (Math.abs(numericVal % oneThird) < smallTolerance) {
            const multiple = Math.round(numericVal * 3);
            if (multiple !== 0) return `${multiple}/3`;
        }

        const eDiv4 = currentEuler / 4;
        if (Math.abs(numericVal % eDiv4) < smallTolerance) {
            const multiple = Math.round(numericVal / currentEuler);
            if (multiple !== 0) return `${multiple}ℇ`;
        }

        if (numericVal !== 1 && numericVal > 0) {
            const exponent = Math.log(numericVal);
            if (Math.abs(exponent % 1) < smallTolerance) {
                const roundedExp = Math.round(exponent);
                const expSymbols = "⁰¹²³⁴⁵⁶⁷⁸⁹";
                let expString = "";
                let tempExp = Math.abs(roundedExp);
                if (roundedExp < 0) expString += "⁻";
                if (tempExp === 0) {
                    expString += expSymbols[0];
                } else {
                    while (tempExp > 0) {
                        expString = expSymbols[tempExp % 10] + expString;
                        tempExp = Math.floor(tempExp / 10);
                    }
                }
                return `ℇ${expString}`;
            }
        }

        if (precisionDigits === undefined) {
            return numericVal.toString();
        }
        if (Math.abs(numericVal) < tinyValueThreshold) {
            return "0.0000000";
        }
        return numericVal.toPrecision(precisionDigits);
    };

    const ConstantRegistry = {
        lightSpeed: 299792458,
        gravitationalConstant: 6.67300e-11,
        earthMass: 5.9742e24,
        moonMass: 7.36e22,
        sunMass: 1.98892e30,
        earthRadius: 6378100,
        planckConstant: 6.626068e-34,
        logarithmOfTwoPi: 1.8378770664093453,

        euler: Math.E,
        circleRatio: Math.PI,
        goldenRatio: (1 + Math.sqrt(5)) / 2,
        vacuumPermittivity: 8.85418782e-12
    };

    const ElementData = [
        { name: "Massless void", symbol: "Zero", mass: 0.0 },
        { name: "Hydrogen", symbol: "H", mass: 1.00794 },
        { name: "Helium", symbol: "He", mass: 4.002602 },
        { name: "Lithium", symbol: "Li", mass: 6.941 },
        { name: "Beryllium", symbol: "Be", mass: 9.012182 },
        { name: "Boron", symbol: "B", mass: 10.811 },
        { name: "Carbon", symbol: "C", mass: 12.0107 },
        { name: "Nitrogen", symbol: "N", mass: 14.0067 },
        { name: "Oxygen", symbol: "O", mass: 15.9994 },
        { name: "Fluorine", symbol: "F", mass: 18.9994 },
        { name: "Neon", symbol: "Ne", mass: 20.1797 },
        { name: "Sodium", symbol: "Na", mass: 22.98976928 },
        { name: "Magnesium", symbol: "Mg", mass: 24.305 },
        { name: "aluminium", symbol: "Al", mass: 26.9815386 },
        { name: "Silicon", symbol: "Si", mass: 28.0855 },
        { name: "Phosphorus", symbol: "P", mass: 30.973762 },
        { name: "Sulphur", symbol: "S", mass: 32.065 },
        { name: "Chlorine", symbol: "Cl", mass: 35.453 },
        { name: "Argon", symbol: "Ar", mass: 39.948 },
        { name: "Potassium", symbol: "K", mass: 39.0983 },
        { name: "Calcium", symbol: "Ca", mass: 40.078 },
        { name: "Scandium", symbol: "Sc", mass: 44.955912 },
        { name: "Titanium", symbol: "Ti", mass: 47.867 },
        { name: "Vanadium", symbol: "V", mass: 50.9415 },
        { name: "Chromium", symbol: "Cr", mass: 51.9961 },
        { name: "Manganese", symbol: "Mn", mass: 54.938045 },
        { name: "Iron", symbol: "Fe", mass: 55.845 },
        { name: "Cobalt", symbol: "Co", mass: 58.933195 },
        { name: "Nickel", symbol: "Ni", mass: 58.6934 },
        { name: "Copper", symbol: "Cu", mass: 63.546 },
        { name: "Zinc", symbol: "Zn", mass: 65.38 },
        { name: "Gallium", symbol: "Ga", mass: 69.723 },
        { name: "Germanium", symbol: "Ge", mass: 72.64 },
        { name: "Arsenic", symbol: "As", mass: 74.9216 },
        { name: "Selenium", symbol: "Se", mass: 78.96 },
        { name: "Bromine", symbol: "Br", mass: 79.904 },
        { name: "Krypton", symbol: "Kr", mass: 83.798 },
        { name: "Rubidium", symbol: "Rb", mass: 85.4678 },
        { name: "Strontium", symbol: "Sr", mass: 87.62 },
        { name: "Yttrium", symbol: "Y", mass: 88.90585 },
        { name: "Zirconium", symbol: "Zr", mass: 91.224 },
        { name: "Niobium", symbol: "Nb", mass: 92.90638 },
        { name: "Molybdenum", symbol: "Mo", mass: 95.96 },
        { name: "Technetium", symbol: "Tc", mass: 98 },
        { name: "Ruthenium", symbol: "Ru", mass: 101.07 },
        { name: "Rhodium", symbol: "Rh", mass: 102.9055 },
        { name: "Palladium", symbol: "Pd", mass: 106.42 },
        { name: "Silver", symbol: "Ag", mass: 107.8682 },
        { name: "Cadmium", symbol: "Cd", mass: 112.411 },
        { name: "Indium", symbol: "In", mass: 114.818 },
        { name: "Tin", symbol: "Sn", mass: 118.71 },
        { name: "Antimony", symbol: "Sb", mass: 121.76 },
        { name: "Tellurium", symbol: "Te", mass: 127.6 },
        { name: "Iodine", symbol: "I", mass: 126.90447 },
        { name: "Xenon", symbol: "Xe", mass: 131.293 },
        { name: "Cesium", symbol: "Cs", mass: 132.9054519 },
        { name: "Barium", symbol: "Ba", mass: 137.327 },
        { name: "Lanthanum", symbol: "La", mass: 138.90547 },
        { name: "Cerium", symbol: "Ce", mass: 140.116 },
        { name: "Praseodymium", symbol: "Pr", mass: 140.90765 },
        { name: "Neodymium", symbol: "Nd", mass: 144.242 },
        { name: "Promethium", symbol: "Pm", mass: 145 },
        { name: "Samarium", symbol: "Sm", mass: 150.36 },
        { name: "Europium", symbol: "Eu", mass: 151.964 },
        { name: "Gadolinium", symbol: "Gd", mass: 157.25 },
        { name: "Terbium", symbol: "Tb", mass: 158.92535 },
        { name: "Dysprosium", symbol: "Dy", mass: 162.5001 },
        { name: "Holmium", symbol: "Ho", mass: 164.93032 },
        { name: "Erbium", symbol: "Er", mass: 167.259 },
        { name: "Thulium", symbol: "Tm", mass: 168.93421 },
        { name: "Ytterbium", symbol: "Yb", mass: 173.054 },
        { name: "Lutetium", symbol: "Lu", mass: 174.9668 },
        { name: "Hafnium", symbol: "Hf", mass: 178.49 },
        { name: "Tantalum", symbol: "Ta", mass: 180.94788 },
        { name: "Tungsten", symbol: "W", mass: 183.84 },
        { name: "Rhenium", symbol: "Re", mass: 186.207 },
        { name: "Osmium", symbol: "Os", mass: 190.23 },
        { name: "Iridium", symbol: "Ir", mass: 192.217 },
        { name: "Platinum", symbol: "Pt", mass: 192.084 },
        { name: "Gold", symbol: "Au", mass: 196.966569 },
        { name: "Hydrargyrum", symbol: "Hg", mass: 200.59 },
        { name: "Thallium", symbol: "Tl", mass: 204.3833 },
        { name: "Lead", symbol: "Pb", mass: 207.2 },
        { name: "Bismuth", symbol: "Bi", mass: 208.980401 },
        { name: "Polonium", symbol: "Po", mass: 210 },
        { name: "Astatine", symbol: "At", mass: 210 },
        { name: "Radon", symbol: "Rn", mass: 220 },
        { name: "Francium", symbol: "Fr", mass: 223 },
        { name: "Radium", symbol: "Ra", mass: 226 },
        { name: "Actinium", symbol: "Ac", mass: 227 },
        { name: "Thorium", symbol: "Th", mass: 232.03806 },
        { name: "Protactinium", symbol: "Pa", mass: 231.03588 },
        { name: "Uranium", symbol: "U", mass: 238.02891 },
        { name: "Neptunium", symbol: "Np", mass: 237 },
        { name: "Plutonium", symbol: "Pu", mass: 244 },
        { name: "Americium", symbol: "Am", mass: 243 },
        { name: "Curium", symbol: "Cm", mass: 247 },
        { name: "Berkelium", symbol: "Bk", mass: 247 },
        { name: "Californium", symbol: "Cf", mass: 251 },
        { name: "Einsteinium", symbol: "Es", mass: 252 },
        { name: "Fermium", symbol: "Fm", mass: 257 },
        { name: "Mendelevium", symbol: "Md", mass: 258 },
        { name: "Nobelium", symbol: "No", mass: 259 },
        { name: "Lawrencium", symbol: "Lr", mass: 262 },
        { name: "Rutherfordium", symbol: "Rf", mass: 261 },
        { name: "Dubnium", symbol: "Db", mass: 262 },
        { name: "Seaborgium", symbol: "Sg", mass: 266 },
        { name: "Bohrium", symbol: "Bh", mass: 264 },
        { name: "Hassium", symbol: "Hs", mass: 277 },
        { name: "Meitnerium", symbol: "Mt", mass: 268 },
        { name: "Darmstadtium", symbol: "Ds", mass: 271 },
        { name: "Roentgenium", symbol: "Rg", mass: 272 }
    ];

    const ElementSymbolToMass = new Map();
    for (const element of ElementData) {
        ElementSymbolToMass.set(element.symbol, element.mass);
    }
    const getAtomicMassBySymbol = (symbolName) => ElementSymbolToMass.get(symbolName);


    const MathCore = {
        sine: Math.sin,
        cosine: Math.cos,
        tangent: Math.tan,
        exponential: Math.exp,
        naturalLog: Math.log,
        absoluteValue: Math.abs,
        arcCosine: Math.acos,
        arcSine: Math.asin,
        arcTangent: Math.atan,
        arcTangent2: Math.atan2,
        ceiling: Math.ceil,
        floorValue: Math.floor,
        maximum: Math.max,
        minimum: Math.min,
        randomValue: Math.random,
        roundValue: Math.round,
        squareRoot: Math.sqrt,
        powerFunction: Math.pow,

        hyperbolicCosine: (val) => 0.5 * (Math.exp(val) + Math.exp(-val)),
        hyperbolicSine: (val) => 0.5 * (Math.exp(val) - Math.exp(-val)),
        hyperbolicTangent: (val) => MathCore.hyperbolicSine(val) / MathCore.hyperbolicCosine(val),
        hyperbolicSecant: (val) => 1 / MathCore.hyperbolicCosine(val),
        hyperbolicCosecant: (val) => 1 / MathCore.hyperbolicSine(val),
        hyperbolicCotangent: (val) => 1 / MathCore.hyperbolicTangent(val),

        inverseHyperbolicCosine: (val) => MathCore.naturalLog(val + MathCore.squareRoot(val * val - 1)),
        inverseHyperbolicSine: (val) => MathCore.naturalLog(val + MathCore.squareRoot(val * val + 1)),
        inverseHyperbolicTangent: (val) => 0.5 * MathCore.naturalLog((1 + val) / (1 - val)),

        functionToPower: (func, exp, val) => MathCore.powerFunction(func(val), exp),

        logarithmArbitraryBase: (base, value) => MathCore.naturalLog(value) / MathCore.naturalLog(base),

        unitStep: (val) => (val >= 0 ? (val === 0 ? 0.5 : 1) : 0),
        discreteUnitStep: (val) => (val >= 0 ? 1 : 0),

        diracDelta: (val) => (val === 0 ? Number.POSITIVE_INFINITY : 0),

        valueSign: (val) => Math.sign(val || 0),

        conditionalValue: (condition, trueVal, falseVal) => condition ? trueVal : falseVal,

        normalizedSinc: (val) => {
            if (val === 0) return 1;
            const piVal = UniversalCalculations.Constants.circleRatio;
            return MathCore.sine(piVal * val) / (piVal * val);
        },

        secant: (val) => 1 / MathCore.cosine(val),
        cosecant: (val) => 1 / MathCore.sine(val),
        cotangent: (val) => 1 / MathCore.tangent(val),
        cotanAlias: (val) => MathCore.cotangent(val),
        csecAlias: (val) => MathCore.cosecant(val),
    };

    const bellSequenceCache = new Map([
        [0, 1], [1, 1], [2, 2], [3, 5], [4, 15], [5, 52], [6, 203], [7, 877], [8, 4140],
        [9, 21147], [10, 115975], [11, 678570], [12, 4213597], [13, 27644437], [14, 190899322],
        [15, 1382958545], [16, 10480142147], [17, 82864869804], [18, 682076806159],
        [19, 5832742205057], [20, 51724158235372], [21, 474869816156751], [22, 4506715738447323]
    ]);
    const computeBellNumber = (index) => {
        if (Number.isInteger(index) && index >= 0 && bellSequenceCache.has(index)) {
            return bellSequenceCache.get(index);
        } else {
            let approximationSum = 0;
            const numTerms = 7;
            for (let k = 0; k < numTerms; k++) {
                approximationSum += MathCore.powerFunction(k, index) / UniversalCalculations.Operations.calculateFactorial(k);
            }
            return approximationSum / UniversalCalculations.Constants.euler;
        }
    };

    const riemannZetaFunction = (argument) => {
        switch (argument) {
            case 0: return -0.5;
            case 1: return Number.POSITIVE_INFINITY;
            case 2: return UniversalCalculations.Constants.circleRatio * UniversalCalculations.Constants.circleRatio / 6;
            case 4: return MathCore.powerFunction(UniversalCalculations.Constants.circleRatio, 4) / 90;
            default:
                if (argument < 1) return Number.POSITIVE_INFINITY;
                let sumApproximation = 0;
                const termsCount = 12;
                for (let k = 1; k <= termsCount; k++) {
                    sumApproximation += MathCore.powerFunction(k, -argument);
                }
                return sumApproximation;
        }
    };

    const logGammaApproximation = (inputVal) => {
        const p = [0.99999999999980993, 676.52036812458517, -1259.1392167224028,
            769.17717900896944, -166.53861138229148, 12.505560727776497,
            -0.13857109526572012, 9.9843695780195717e-6, 1.5056327351493116e-7];
        const g = 7;

        if (inputVal < 0.5) {
            return Math.log(UniversalCalculations.Constants.circleRatio / MathCore.sine(UniversalCalculations.Constants.circleRatio * inputVal)) - logGammaApproximation(1 - inputVal);
        }

        let z = inputVal - 1;
        let x = p[0];
        for (let i = 1; i < p.length; i++) {
            x += p[i] / (z + i);
        }

        let t = z + g + 0.5;
        return MathCore.naturalLog(MathCore.squareRoot(2 * UniversalCalculations.Constants.circleRatio)) +
               (z + 0.5) * MathCore.naturalLog(t) - t + MathCore.naturalLog(x);
    };

    const generalGammaFunction = (value) => {
        if (value === 0 || (value < 0 && Number.isInteger(value))) return Number.POSITIVE_INFINITY;
        return MathCore.exponential(logGammaApproximation(value));
    };

    const undefinedPsiFunction = (val) => NaN;

    const calculateFactorial = (num) => {
        if (num < 0) {
            if (Number.isInteger(num)) {
                return Number.POSITIVE_INFINITY;
            }
            return generalGammaFunction(num + 1);
        }
        if (num === 0 || num === 1) {
            return 1;
        }
        if (Number.isInteger(num) && num < 20) {
            let res = 1;
            for (let i = 2; i <= num; i++) {
                res *= i;
            }
            return res;
        }
        return generalGammaFunction(num + 1);
    };

    const calculateDoubleFactorial = (num) => {
        if (!Number.isInteger(num) || num < -1) {
            return MathCore.powerFunction(2, num / 2) * generalGammaFunction(num / 2 + 1) / generalGammaFunction(0.5);
        }
        if (num === -1 || num === 0 || num === 1) return 1;

        let result = 1;
        for (let i = num; i > 1; i -= 2) {
            result *= i;
        }
        return result;
    };


    const FunctionRegistrar = new Map();

    const estimateDerivative = (funcIdentifier, order, atPoint) => {
        const stepSize = 0.00005;
        let currentFunc = FunctionRegistrar.get(funcIdentifier);
        if (!currentFunc) {
            console.warn(issueMessages.get("unknownDerivative").replace("%s", funcIdentifier));
            return 0;
        }

        let intermediateResult = (xVal) => currentFunc(xVal);
        for (let l = 0; l < order; l++) {
            const previousResult = intermediateResult;
            intermediateResult = (xVal) => (previousResult(xVal + stepSize) - previousResult(xVal - stepSize)) / (2 * stepSize);
        }
        return intermediateResult(atPoint);
    };

    const latexSymbolMap = new Map([
        ["greaterThan", ">"], ["absoluteStart", "abs:("], ["absoluteEnd", ")"],
        ["hyperbolicCosine", "cosh"], ["hyperbolicSine", "sinh"], ["hyperbolicTangent", "tanh"],
        ["hyperbolicCotangent", "coth"], ["hyperbolicSecant", "sech"], ["hyperbolicCosecant", "csch"],
        ["sine", "sin:"], ["cosine", "cos:"], ["tangent", "tan:"], ["multiply", "*"],
        ["secant", "sec:"], ["cosecant", "cosec:"], ["cotangent", "cot:"],
        ["naturalLogarithm", "ln:"], ["base10Logarithm", "log:"], ["determinant", "det:"],
        ["dimension", "dim:"], ["maximum", "max:"], ["minimum", "min:"], ["modulo", "mod:"],
        ["leastCommonMultiple", "lcm:"], ["greatestCommonDivisor", "gcd:"], ["highestCommonFactor", "hcf:"],
        ["limit", "lim:"], ["colon", ""], ["leftParen", "("], ["rightParen", ")"],
        ["leftBracket", "["], ["rightBracket", "]"], ["greaterThanOrEqual", ">="],
        ["lessThan", "<"], ["lessThanOrEqual", "<="], ["infinity", "∞"],
        ["dotProduct", "*"], ["textCommand", ""], ["fractionCommand", ""], ["backslash", "\\"],
        ["alpha", "α"], ["beta", "β"], ["gamma", "γ"], ["delta", "δ"], ["zeta", "ζ"],
        ["eta", "η"], ["theta", "θ"], ["iota", "ι"], ["kappa", "κ"], ["mu", "μ"],
        ["nu", "ν"], ["xi", "ξ"], ["omicron", "ο"], ["rho", "ρ"], ["sigma", "σ"],
        ["tau", "τ"], ["upsilon", "υ"], ["chi", "χ"], ["psi", "ψ"], ["omega", "ω"],
        ["phi", "ϕ"], ["phiVariant", "φ"], ["epsilon", "ϵ"], ["epsilonVariant", "ε"],
        ["sigmaFinal", "ς"], ["digamma", "ϝ"], ["kappaVariant", "ϰ"], ["piVariant", "ϖ"],
        ["plusMinus", "±"], ["rhoVariant", "ϱ"], ["thetaVariant", "ϑ"], ["piSymbol", "π"],
        ["lambda", "λ"], ["capitalGamma", "Γ"], ["capitalDelta", "Δ"], ["capitalTheta", "Θ"],
        ["capitalLambda", "Λ"], ["capitalXi", "Ξ"], ["capitalPi", "Π"], ["capitalSigma", "Σ"],
        ["capitalUpsilon", "Υ"], ["capitalPhi", "Φ"], ["capitalPsi", "Ψ"], ["capitalOmega", "Ω"],
        ["perpendicular", "⊥"], ["commaSeparator", " "], ["nablaOperator", "∇"],
        ["forAll", "∀"], ["summationSymbol", "∑"], ["productSymbol", "∏"],
        ["coproductSymbol", "∐"], ["integralSymbol", "∫"]
    ]);

    class ExpressionVariant {
        static PRODUCT = 1;
        static SUM = 2;
        static NUMERIC = 3;
        static DISCRETE_VECTOR = 6;
        static CONTINUOUS_VECTOR = 7;
        static EXPONENT = 8;
        static FUNCTION_CALL = 9;
        static RATIONAL = 10;
        static DERIVATIVE_OP = 11;
        static INTEGRAL_OP = 12;
        static EQUALITY_RELATION = 13;
        static PLUS_MINUS_OP = 14;
        static OPERATOR_FACTOR = 15;
        static LESS_THAN_RELATION = 16;
        static GREATER_THAN_RELATION = 17;
        static VALUE_RANGE = 18;
    }

    const DebugUtilities = {
        parsingEnabled: false,
        generalLoggingEnabled: false,
        logIfEnabled: (message, fallbackValue) => {
            if (DebugUtilities.generalLoggingEnabled) {
                console.log(message);
                return message;
            }
            return fallbackValue;
        }
    };

    return {
        Constants: ConstantRegistry,
        ElementData: ElementData, // Expose for global variable generation
        getAtomicMass: getAtomicMassBySymbol,
        Operations: {
            ...MathCore,
            calculateFactorial,
            calculateDoubleFactorial,
            computeBellNumber,
            riemannZetaFunction,
            generalGammaFunction,
            undefinedPsiFunction
        },
        formatNumber: presentNumericValue,
        generateIdentifier: generateUniqueToken,
        Calculus: {
            estimateDerivative,
            registerFunction: (id, func) => FunctionRegistrar.set(id, func)
        },
        Syntax: {
            latexSymbols: latexSymbolMap
        },
        ExpressionTypes: ExpressionVariant,
        Debug: DebugUtilities,
        getIssueMessage: (key) => issueMessages.get(key) || `Unknown message key: ${key}`
    };

})();

UniversalCalculations.ElementData.forEach(element => {
    if (element.symbol !== "Zero") {
        globalThis[`ELEMENT_MASS_${element.symbol.toUpperCase()}`] = element.mass;
    }
});