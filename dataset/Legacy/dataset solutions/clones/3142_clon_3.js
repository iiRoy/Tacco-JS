let ModuleRegistry = {};

((exportObj) => {
  "use strict";

  // Helper function to apply a list of functions to a list of arguments.
  // This version iterates and builds the result array using push for flexibility.
  exportObj.applyFunctionToElements = (functionList) => (argumentList) => {
    const totalFunctions = functionList.length;
    const totalArguments = argumentList.length;
    const combinedResults = []; // Use an empty array and push for dynamic sizing

    // Input validation: ensure both inputs are arrays
    if (!Array.isArray(functionList) || !Array.isArray(argumentList)) {
      console.warn("Invalid input to applyFunctionToElements: expected arrays.");
      return combinedResults; // Return empty array or throw error
    }

    // Outer loop for functions
    for (let fnIndex = 0; fnIndex < totalFunctions; fnIndex++) {
      const currentFunction = functionList[fnIndex];

      // Inner loop for arguments
      for (let argIndex = 0; argIndex < totalArguments; argIndex++) {
        combinedResults.push(currentFunction(argumentList[argIndex]));
      }
    }
    return combinedResults;
  };
})(ModuleRegistry["Control.Apply"] = ModuleRegistry["Control.Apply"] || {});

((exportObj) => {
  "use strict";

  // Represents a structure for composing functions.
  class Compositor {
    constructor(compositionLogic) {
      this.compositionLogic = compositionLogic; // The actual compose function
    }
  }

  // A specific instance of Compositor for standard JavaScript functions.
  // It composes two functions `f` and `g` such that `(f o g)(x) = f(g(x))`.
  const functionCompositorInstance = new Compositor((firstFn) => (secondFn) => (inputVal) =>
    firstFn(secondFn(inputVal))
  );

  // Retrieves the composition logic from a given Compositor dictionary.
  const functionComposition = (dict) => dict.compositionLogic;

  exportObj["functionComposition"] = functionComposition;
  exportObj["Compositor"] = Compositor;
  exportObj["functionCompositorInstance"] = functionCompositorInstance;
})(ModuleRegistry["Control.Semigroupoid"] = ModuleRegistry["Control.Semigroupoid"] || {});

((exportObj) => {
  "use strict";

  const controlSemigroupoid = ModuleRegistry["Control.Semigroupoid"];

  // Represents a Category type class, requiring a Semigroupoid and an identity function.
  class CategoricalType {
    constructor(semigroupoidInstance, identityFunc) {
      this.semigroupoidInstance = semigroupoidInstance;
      this.identityFunc = identityFunc;
    }
  }

  // Retrieves the identity function from a CategoricalType dictionary.
  const identityFunction = (dict) => dict.identityFunc;

  // An instance of CategoricalType for standard JavaScript functions.
  const functionCategoricalInstance = new CategoricalType(
    () => controlSemigroupoid.functionCompositorInstance, // Lazily get the semigroupoid instance
    (value) => value // The identity function for any value
  );

  exportObj["CategoricalType"] = CategoricalType;
  exportObj["identityFunction"] = identityFunction;
  exportObj["functionCategoricalInstance"] = functionCategoricalInstance;
})(ModuleRegistry["Control.Category"] = ModuleRegistry["Control.Category"] || {});

((exportObj) => {
  "use strict";

  // A boolean value often used as a default 'true' in case expressions.
  exportObj.defaultCaseTrue = true;
})(ModuleRegistry["Data.Boolean"] = ModuleRegistry["Data.Boolean"] || {});

((exportObj) => {
  "use strict";

  // Checks for strict equality (===) between two references.
  exportObj.strictEqualityCheck = (ref1) => (ref2) => ref1 === ref2;
})(ModuleRegistry["Data.Eq"] = ModuleRegistry["Data.Eq"] || {});

((exportObj) => {
  "use strict";

  // Performs a logical AND operation on two booleans.
  exportObj.logicalAnd = (bool1) => (bool2) => bool1 && bool2;

  // Performs a logical OR operation on two booleans.
  exportObj.logicalOr = (bool1) => (bool2) => bool1 || bool2;

  // Performs a logical NOT operation on a boolean.
  exportObj.logicalNot = (boolVal) => !boolVal;
})(ModuleRegistry["Data.HeytingAlgebra"] = ModuleRegistry["Data.HeytingAlgebra"] || {});

((exportObj) => {
  "use strict";

  // A singleton object representing the "unit" type, often used for void returns.
  exportObj.emptyValue = {};
})(ModuleRegistry["Data.Unit"] = ModuleRegistry["Data.Unit"] || {});

((exportObj) => {
  "use strict";

  // Formats a number as a string, ensuring it has a ".0" decimal part if it's an integer.
  exportObj.formatNumberAsString = (numValue) => {
    const numStr = String(numValue); // Convert to string
    // Check if it's an integer that might be represented without a decimal.
    // parseFloat(numStr + ".0") will parse correctly if numStr is "123" -> 123.0
    // If numStr is already "123.4", then numStr + ".0" becomes "123.4.0", which is NaN.
    return Number.isNaN(Number.parseFloat(numStr + ".0")) ? numStr : numStr + ".0";
  };
})(ModuleRegistry["Data.Show"] = ModuleRegistry["Data.Show"] || {});

((exportObj) => {
  "use strict";

  const foreignShow = ModuleRegistry["Data.Show"];
  // PS["Data.Symbol"], PS["Record.Unsafe"], PS["Type.Data.RowList"] are not used directly in this JS output.

  // Type class for values that can be converted to a string representation.
  class Displayable {
    constructor(showFunction) {
      this.showFunction = showFunction;
    }
  }

  // An instance of Displayable for numbers.
  const numberDisplayInstance = new Displayable(foreignShow.formatNumberAsString);

  // Retrieves the show function from a Displayable dictionary.
  const showValue = (dict) => dict.showFunction;

  exportObj["Displayable"] = Displayable;
  exportObj["showValue"] = showValue;
  exportObj["numberDisplayInstance"] = numberDisplayInstance;
})(ModuleRegistry["Data.Show"] = ModuleRegistry["Data.Show"] || {});

((exportObj) => {
  "use strict";

  const foreignUnit = ModuleRegistry["Data.Unit"];
  // PS["Data.Show"] is imported but not directly used in the output for Data.Unit.

  // Re-export of the unit value.
  exportObj["emptyValue"] = foreignUnit.emptyValue;
})(ModuleRegistry["Data.Unit"] = ModuleRegistry["Data.Unit"] || {});

((exportObj) => {
  "use strict";

  const foreignHeyting = ModuleRegistry["Data.HeytingAlgebra"];
  // PS["Data.Symbol"], PS["Data.Unit"], PS["Record.Unsafe"], PS["Type.Data.Row"], PS["Type.Data.RowList"] are not used directly.

  // Type class for Heyting algebras, providing logical operations.
  class BooleanAlgebraStructure {
    constructor(conjunction, disjunction, falseVal, implication, negation, trueVal) {
      this.conjunction = conjunction;
      this.disjunction = disjunction;
      this.falseVal = falseVal;
      this.implication = implication;
      this.negation = negation;
      this.trueVal = trueVal;
    }
  }

  // Retrieves the 'true' element.
  const trueValue = (dict) => dict.trueVal;

  // Retrieves the negation operation.
  const negation = (dict) => dict.negation;

  // Retrieves the implication operation.
  const implication = (dict) => dict.implication;

  // Retrieves the 'false' element.
  const falseValue = (dict) => dict.falseVal;

  // Retrieves the disjunction operation.
  const disjunction = (dict) => dict.disjunction;

  // An instance of BooleanAlgebraStructure for standard booleans.
  const booleanAlgebraInstance = new BooleanAlgebraStructure(
    foreignHeyting.logicalAnd,
    foreignHeyting.logicalOr,
    false,
    (a) => (b) => disjunction(booleanAlgebraInstance)(negation(booleanAlgebraInstance)(a))(b),
    foreignHeyting.logicalNot,
    true
  );

  // Retrieves the conjunction operation.
  const conjunction = (dict) => dict.conjunction;

  exportObj["BooleanAlgebraStructure"] = BooleanAlgebraStructure;
  exportObj["trueValue"] = trueValue;
  exportObj["falseValue"] = falseValue;
  exportObj["implication"] = implication;
  exportObj["conjunction"] = conjunction;
  exportObj["disjunction"] = disjunction;
  exportObj["negation"] = negation;
  exportObj["booleanAlgebraInstance"] = booleanAlgebraInstance;
})(ModuleRegistry["Data.HeytingAlgebra"] = ModuleRegistry["Data.HeytingAlgebra"] || {});

((exportObj) => {
  "use strict";

  const foreignEq = ModuleRegistry["Data.Eq"];
  const dataHeytingAlgebra = ModuleRegistry["Data.HeytingAlgebra"];
  // PS["Data.Symbol"], PS["Data.Unit"], PS["Data.Void"], PS["Record.Unsafe"], PS["Type.Data.RowList"] are not used directly.

  // Type class for values that can be compared for equality.
  class EqualityTypeclass {
    constructor(eqFunction) {
      this.eqFunction = eqFunction;
    }
  }

  // Type class for types that can compare lists of elements for equality.
  class EqualityTypeclass1 {
    constructor(eq1Function) {
      this.eq1Function = eq1Function;
    }
  }

  // An instance of EqualityTypeclass for integers.
  const intEquality = new EqualityTypeclass(foreignEq.strictEqualityCheck);

  // An instance of EqualityTypeclass for characters.
  const charEquality = new EqualityTypeclass(foreignEq.strictEqualityCheck);

  // Retrieves the `eq1` function from an EqualityTypeclass1 dictionary.
  const eq1 = (dict) => dict.eq1Function;

  // Retrieves the `eq` function from an EqualityTypeclass dictionary.
  const eq = (dict) => dict.eqFunction;

  exportObj["EqualityTypeclass"] = EqualityTypeclass;
  exportObj["eq"] = eq;
  exportObj["EqualityTypeclass1"] = EqualityTypeclass1;
  exportObj["eq1"] = eq1;
  exportObj["intEquality"] = intEquality;
  exportObj["charEquality"] = charEquality;
})(ModuleRegistry["Data.Eq"] = ModuleRegistry["Data.Eq"] || {});

((exportObj) => {
  "use strict";

  // Implements a generic comparison logic based on provided callbacks for less than, equal, and greater than.
  exportObj.rawComparisonLogic = (lessThanCb) => (equalCb) => (greaterThanCb) => (valX) => (valY) => {
    // A simple ternary chain for comparison.
    return valX < valY ? lessThanCb : valX === valY ? equalCb : greaterThanCb;
  };
})(ModuleRegistry["Data.Ord.Unsafe"] = ModuleRegistry["Data.Ord.Unsafe"] || {});

((exportObj) => {
  "use strict";

  // Concatenates two strings.
  exportObj.stringConcatenator = (str1) => (str2) => str1 + str2;
})(ModuleRegistry["Data.Semigroup"] = ModuleRegistry["Data.Semigroup"] || {});

((exportObj) => {
  "use strict";

  const foreignSemigroup = ModuleRegistry["Data.Semigroup"];
  // PS["Data.Symbol"], PS["Data.Unit"], PS["Data.Void"], PS["Record.Unsafe"], PS["Type.Data.RowList"] are not used directly.

  // Type class for types that have an associative binary operation.
  class CombiningStructure {
    constructor(appendOperation) {
      this.appendOperation = appendOperation;
    }
  }

  // An instance of CombiningStructure for strings.
  const stringCombiningInstance = new CombiningStructure(foreignSemigroup.stringConcatenator);

  // Retrieves the append operation from a CombiningStructure dictionary.
  const append = (dict) => dict.appendOperation;

  exportObj["CombiningStructure"] = CombiningStructure;
  exportObj["append"] = append;
  exportObj["stringCombiningInstance"] = stringCombiningInstance;
})(ModuleRegistry["Data.Semigroup"] = ModuleRegistry["Data.Semigroup"] || {});

((exportObj) => {
  "use strict";

  // Represents the possible outcomes of a comparison.
  class ComparisonResult {
    // Using static instances to avoid re-creating objects
    static Lesser = new ComparisonResult("Lesser");
    static Greater = new ComparisonResult("Greater");
    static Equal = new ComparisonResult("Equal");

    constructor(type) {
      this.type = type;
    }
  }

  exportObj["Lesser"] = ComparisonResult.Lesser;
  exportObj["Greater"] = ComparisonResult.Greater;
  exportObj["Equal"] = ComparisonResult.Equal;
})(ModuleRegistry["Data.Ordering"] = ModuleRegistry["Data.Ordering"] || {});

((exportObj) => {
  "use strict";

  const foreignOrdUnsafe = ModuleRegistry["Data.Ord.Unsafe"];
  const dataOrdering = ModuleRegistry["Data.Ordering"];

  // Performs a raw comparison using the predefined ordering values.
  const performRawComparison = foreignOrdUnsafe.rawComparisonLogic(dataOrdering.Lesser)(dataOrdering.Equal)(dataOrdering.Greater);

  exportObj["performRawComparison"] = performRawComparison;
})(ModuleRegistry["Data.Ord.Unsafe"] = ModuleRegistry["Data.Ord.Unsafe"] || {});

((exportObj) => {
  "use strict";

  const foreignSemiring = ModuleRegistry["Data.Semiring"];
  // PS["Data.Symbol"], PS["Data.Unit"], PS["Record.Unsafe"], PS["Type.Data.Row"], PS["Type.Data.RowList"] are not used directly.

  // Type class for semirings, providing addition, multiplication, zero, and one.
  class AlgebraicRing {
    constructor(additionOp, multiplicationOp, unitOne, unitZero) {
      this.additionOp = additionOp;
      this.multiplicationOp = multiplicationOp;
      this.unitOne = unitOne;
      this.unitZero = unitZero;
    }
  }

  // Retrieves the zero element.
  const unitZero = (dict) => dict.unitZero;

  // Retrieves the one element.
  const unitOne = (dict) => dict.unitOne;

  // Retrieves the multiplication operation.
  const multiplicationOp = (dict) => dict.multiplicationOp;

  // Retrieves the addition operation.
  const additionOp = (dict) => dict.additionOp;

  exportObj["AlgebraicRing"] = AlgebraicRing;
  exportObj["additionOp"] = additionOp;
  exportObj["unitZero"] = unitZero;
  exportObj["multiplicationOp"] = multiplicationOp;
  exportObj["unitOne"] = unitOne;
})(ModuleRegistry["Data.Semiring"] = ModuleRegistry["Data.Semiring"] || {});

((exportObj) => {
  "use strict";

  const foreignRing = ModuleRegistry["Data.Ring"];
  const dataSemiring = ModuleRegistry["Data.Semiring"];
  // PS["Data.Symbol"], PS["Data.Unit"], PS["Record.Unsafe"], PS["Type.Data.RowList"] are not used directly.

  // Type class for rings, extending semirings with a subtraction operation.
  class SubtractiveRing {
    constructor(semiringInstance, subtractionOp) {
      this.semiringInstance = semiringInstance;
      this.subtractionOp = subtractionOp;
    }
  }

  // Retrieves the subtraction operation.
  const subtractionOp = (dict) => dict.subtractionOp;

  exportObj["SubtractiveRing"] = SubtractiveRing;
  exportObj["subtractionOp"] = subtractionOp;
})(ModuleRegistry["Data.Ring"] = ModuleRegistry["Data.Ring"] || {});

((exportObj) => {
  "use strict";

  const foreignOrd = ModuleRegistry["Data.Ord"];
  const dataEq = ModuleRegistry["Data.Eq"];
  const dataOrdUnsafe = ModuleRegistry["Data.Ord.Unsafe"];
  const dataOrdering = ModuleRegistry["Data.Ordering"];
  const dataRing = ModuleRegistry["Data.Ring"];
  const dataSemiring = ModuleRegistry["Data.Semiring"];
  // PS["Data.Symbol"], PS["Data.Unit"], PS["Data.Void"], PS["Record.Unsafe"], PS["Type.Data.RowList"] are not used directly.

  // Type class for values that can be ordered.
  class Orderable {
    constructor(equalityInstance, comparisonLogic) {
      this.equalityInstance = equalityInstance;
      this.comparisonLogic = comparisonLogic;
    }
  }

  // Type class for types that can order lists of elements.
  class Orderable1 {
    constructor(equality1Instance, comparison1Logic) {
      this.equality1Instance = equality1Instance;
      this.comparison1Logic = comparison1Logic;
    }
  }

  // An instance of Orderable for integers.
  const intOrderable = new Orderable(
    () => dataEq.intEquality, // Lazily get the equality instance
    dataOrdUnsafe.performRawComparison
  );

  // An instance of Orderable for characters.
  const charOrderable = new Orderable(
    () => dataEq.charEquality, // Lazily get the equality instance
    dataOrdUnsafe.performRawComparison
  );

  // Retrieves the `compare1` function from an Orderable1 dictionary.
  const compare1 = (dict) => dict.comparison1Logic;

  // Retrieves the `compare` function from an Orderable dictionary.
  const compare = (dict) => dict.comparisonLogic;

  // Compares two values based on a key derived by function `f`.
  const comparing = (orderingTypeclass) => (keyExtractor) => (valX) => (valY) =>
    compare(orderingTypeclass)(keyExtractor(valX))(keyExtractor(valY));

  // Checks if the first value is strictly greater than the second.
  const greaterThan = (orderingTypeclass) => (val1) => (val2) => {
    const result = compare(orderingTypeclass)(val1)(val2);
    return result === dataOrdering.Greater;
  };

  // Checks if the first value is strictly less than the second.
  const lessThan = (orderingTypeclass) => (val1) => (val2) => {
    const result = compare(orderingTypeclass)(val1)(val2);
    return result === dataOrdering.Lesser;
  };

  // Returns the maximum of two values.
  const max = (orderingTypeclass) => (valX) => (valY) => {
    const comparisonResult = compare(orderingTypeclass)(valX)(valY);
    switch (comparisonResult) {
      case dataOrdering.Lesser:
        return valY;
      case dataOrdering.Equal:
      case dataOrdering.Greater: // If equal or greater, return x
        return valX;
      default:
        throw new Error("Unexpected comparison result in max function.");
    }
  };

  // Returns the minimum of two values.
  const min = (orderingTypeclass) => (valX) => (valY) => {
    const comparisonResult = compare(orderingTypeclass)(valX)(valY);
    switch (comparisonResult) {
      case dataOrdering.Lesser:
      case dataOrdering.Equal: // If equal or lesser, return x
        return valX;
      case dataOrdering.Greater:
        return valY;
      default:
        throw new Error("Unexpected comparison result in min function.");
    }
  };

  exportObj["Orderable"] = Orderable;
  exportObj["compare"] = compare;
  exportObj["Orderable1"] = Orderable1;
  exportObj["compare1"] = compare1;
  exportObj["lessThan"] = lessThan;
  exportObj["greaterThan"] = greaterThan;
  exportObj["comparing"] = comparing;
  exportObj["min"] = min;
  exportObj["max"] = max;
  exportObj["intOrderable"] = intOrderable;
  exportObj["charOrderable"] = charOrderable;
})(ModuleRegistry["Data.Ord"] = ModuleRegistry["Data.Ord"] || {});

((exportObj) => {
  "use strict";

  const controlCategory = ModuleRegistry["Control.Category"];
  const dataBoolean = ModuleRegistry["Data.Boolean"];
  const dataOrd = ModuleRegistry["Data.Ord"];
  const dataRing = ModuleRegistry["Data.Ring"];

  // Reverses the order of the first two arguments of a curried function.
  const reverseArgs = (func) => (argB) => (argA) => func(argA)(argB);

  // Creates a function that always returns a constant value, ignoring its argument.
  const alwaysReturn = (constantValue) => (ignoredArg) => constantValue;

  exportObj["reverseArgs"] = reverseArgs;
  exportObj["alwaysReturn"] = alwaysReturn;
})(ModuleRegistry["Data.Function"] = ModuleRegistry["Data.Function"] || {});

((exportObj) => {
  "use strict";

  // Maps a function over each element of an array, creating a new array.
  exportObj.mapArrayElements = (mappingFn) => (inputArray) => {
    const arrayLength = inputArray.length;
    const transformedArray = new Array(arrayLength); // Pre-allocate for performance

    for (let index = 0; index < arrayLength; index++) {
      transformedArray[index] = mappingFn(inputArray[index]);
    }
    return transformedArray;
  };
})(ModuleRegistry["Data.Functor"] = ModuleRegistry["Data.Functor"] || {});

((exportObj) => {
  "use strict";

  const foreignFunctor = ModuleRegistry["Data.Functor"];
  const controlSemigroupoid = ModuleRegistry["Control.Semigroupoid"];
  const dataFunction = ModuleRegistry["Data.Function"];
  const dataUnit = ModuleRegistry["Data.Unit"];

  // Type class for mappable structures (functors).
  class Mappable {
    constructor(mapFunction) {
      this.mapFunction = mapFunction;
    }
  }

  // Retrieves the map function from a Mappable dictionary.
  const map = (dict) => dict.mapFunction;

  // An instance of Mappable for functions (function composition).
  const functionMappable = new Mappable(
    controlSemigroupoid.functionComposition(controlSemigroupoid.functionCompositorInstance)
  );

  // An instance of Mappable for arrays.
  const arrayMappable = new Mappable(foreignFunctor.mapArrayElements);

  exportObj["Mappable"] = Mappable;
  exportObj["map"] = map;
  exportObj["functionMappable"] = functionMappable;
  exportObj["arrayMappable"] = arrayMappable;
})(ModuleRegistry["Data.Functor"] = ModuleRegistry["Data.Functor"] || {});

((exportObj) => {
  "use strict";

  const foreignApply = ModuleRegistry["Control.Apply"];
  const controlCategory = ModuleRegistry["Control.Category"];
  const dataFunction = ModuleRegistry["Data.Function"];
  const dataFunctor = ModuleRegistry["Data.Functor"];

  // Type class for applicative functors, allowing application of a function inside a context.
  class ApplicativeApply {
    constructor(functorInstance, applyFunction) {
      this.functorInstance = functorInstance;
      this.applyFunction = applyFunction;
    }
  }

  // An instance of ApplicativeApply for arrays.
  const arrayApplicativeApply = new ApplicativeApply(
    () => dataFunctor.arrayMappable, // Lazily get the functor instance
    foreignApply.applyFunctionToElements
  );

  // Retrieves the apply function from an ApplicativeApply dictionary.
  const apply = (dict) => dict.applyFunction;

  exportObj["ApplicativeApply"] = ApplicativeApply;
  exportObj["apply"] = apply;
  exportObj["arrayApplicativeApply"] = arrayApplicativeApply;
})(ModuleRegistry["Control.Apply"] = ModuleRegistry["Control.Apply"] || {});

((exportObj) => {
  "use strict";

  const controlApply = ModuleRegistry["Control.Apply"];
  const dataFunctor = ModuleRegistry["Data.Functor"];
  const dataUnit = ModuleRegistry["Data.Unit"];

  // Type class for applicative functors, providing a `pure` function.
  class ApplicativeFunctor {
    constructor(applyInstance, pureFunction) {
      this.applyInstance = applyInstance;
      this.pureFunction = pureFunction;
    }
  }

  // Retrieves the `pure` function from an ApplicativeFunctor dictionary.
  const wrapValue = (dict) => dict.pureFunction;

  exportObj["ApplicativeFunctor"] = ApplicativeFunctor;
  exportObj["wrapValue"] = wrapValue;
})(ModuleRegistry["Control.Applicative"] = ModuleRegistry["Control.Applicative"] || {});

((exportObj) => {
  "use strict";

  // Binds a function that returns an array to each element of an array, flattening the result.
  exportObj.flatMapArray = (inputArray) => (mappingFunc) => {
    const results = [];
    for (let index = 0; index < inputArray.length; index++) {
      // Use spread operator for efficient concatenation
      results.push(...mappingFunc(inputArray[index]));
    }
    return results;
  };
})(ModuleRegistry["Control.Bind"] = ModuleRegistry["Control.Bind"] || {});

((exportObj) => {
  "use strict";

  const foreignBind = ModuleRegistry["Control.Bind"];
  const controlApplicative = ModuleRegistry["Control.Applicative"];
  const controlApply = ModuleRegistry["Control.Apply"];
  const controlCategory = ModuleRegistry["Control.Category"];
  const dataFunction = ModuleRegistry["Data.Function"];
  const dataFunctor = ModuleRegistry["Data.Functor"];
  const dataUnit = ModuleRegistry["Data.Unit"];

  // Type class for monadic bind operations.
  class MonadicBind {
    constructor(applyInstance, bindFunction) {
      this.applyInstance = applyInstance;
      this.bindFunction = bindFunction;
    }
  }

  // Type class for discarding values in a monadic context.
  class Discardable {
    constructor(discardFunction) {
      this.discardFunction = discardFunction;
    }
  }

  // Retrieves the `discard` function from a Discardable dictionary.
  const discard = (dict) => dict.discardFunction;

  // An instance of MonadicBind for arrays.
  const arrayMonadicBind = new MonadicBind(
    () => controlApply.arrayApplicativeApply, // Lazily get the apply instance
    foreignBind.flatMapArray
  );

  // Retrieves the `bind` function from a MonadicBind dictionary.
  const bind = (dict) => dict.bindFunction;

  // An instance of Discardable for the unit type, using the bind operation.
  const unitDiscarder = new Discardable((bindDict) => bind(bindDict));

  exportObj["MonadicBind"] = MonadicBind;
  exportObj["bind"] = bind;
  exportObj["Discardable"] = Discardable;
  exportObj["discard"] = discard;
  exportObj["arrayMonadicBind"] = arrayMonadicBind;
  exportObj["unitDiscarder"] = unitDiscarder;
})(ModuleRegistry["Control.Bind"] = ModuleRegistry["Control.Bind"] || {});

((exportObj) => {
  "use strict";

  // Maximum and minimum values for standard 32-bit signed integers.
  exportObj.maxIntVal = 2147483647;
  exportObj.minIntVal = -2147483648;

  // Maximum and minimum character code points.
  exportObj.maxCharVal = String.fromCharCode(65535);
  exportObj.minCharVal = String.fromCharCode(0);
})(ModuleRegistry["Data.Bounded"] = ModuleRegistry["Data.Bounded"] || {});

((exportObj) => {
  "use strict";

  const foreignBounded = ModuleRegistry["Data.Bounded"];
  const dataOrd = ModuleRegistry["Data.Ord"];
  const dataOrdering = ModuleRegistry["Data.Ordering"];
  const dataUnit = ModuleRegistry["Data.Unit"];

  // Type class for bounded types, providing a top and bottom element.
  class BoundedType {
    constructor(orderableInstance, bottomValue, topValue) {
      this.orderableInstance = orderableInstance;
      this.bottomValue = bottomValue;
      this.topValue = topValue;
    }
  }

  // Retrieves the top element.
  const top = (dict) => dict.topValue;

  // An instance of BoundedType for integers.
  const intBounded = new BoundedType(
    () => dataOrd.intOrderable, // Lazily get the orderable instance
    foreignBounded.minIntVal,
    foreignBounded.maxIntVal
  );

  // An instance of BoundedType for characters.
  const charBounded = new BoundedType(
    () => dataOrd.charOrderable, // Lazily get the orderable instance
    foreignBounded.minCharVal,
    foreignBounded.maxCharVal
  );

  // Retrieves the bottom element.
  const bottom = (dict) => dict.bottomValue;

  exportObj["BoundedType"] = BoundedType;
  exportObj["bottom"] = bottom;
  exportObj["top"] = top;
  exportObj["intBounded"] = intBounded;
  exportObj["charBounded"] = charBounded;
})(ModuleRegistry["Data.Bounded"] = ModuleRegistry["Data.Bounded"] || {});

((exportObj) => {
  "use strict";

  // Folds an array from right to left.
  exportObj.foldRightArr = (foldingFn) => (initialAcc) => (inputArray) => {
    let accumulator = initialAcc;
    // Loop from the end of the array to the beginning
    for (let i = inputArray.length - 1; i >= 0; i--) {
      accumulator = foldingFn(inputArray[i])(accumulator);
    }
    return accumulator;
  };

  // Folds an array from left to right.
  exportObj.foldLeftArr = (foldingFn) => (initialAcc) => (inputArray) => {
    let accumulator = initialAcc;
    // Loop from the beginning of the array to the end
    for (let i = 0; i < inputArray.length; i++) {
      accumulator = foldingFn(accumulator)(inputArray[i]);
    }
    return accumulator;
  };
})(ModuleRegistry["Data.Foldable"] = ModuleRegistry["Data.Foldable"] || {});

((exportObj) => {
  "use strict";

  const dataBoolean = ModuleRegistry["Data.Boolean"];
  const dataEq = ModuleRegistry["Data.Eq"];
  // PS["Data.EuclideanRing"], PS["Data.Ord"], PS["Data.Ordering"], PS["Data.Semigroup"], PS["Data.Symbol"], PS["Data.Unit"], PS["Record.Unsafe"], PS["Type.Data.RowList"] are not used directly.

  // Type class for monoids, extending semigroups with an identity element.
  class MonoidalStructure {
    constructor(semigroupInstance, emptyElement) {
      this.semigroupInstance = semigroupInstance;
      this.emptyElement = emptyElement;
    }
  }

  // An instance of MonoidalStructure for strings.
  const stringCombiningInstance = ModuleRegistry["Data.Semigroup"].stringCombiningInstance;
  const stringMonoidalInstance = new MonoidalStructure(() => stringCombiningInstance, "");

  // Retrieves the empty element from a MonoidalStructure dictionary.
  const emptyElement = (dict) => dict.emptyElement;

  exportObj["MonoidalStructure"] = MonoidalStructure;
  exportObj["emptyElement"] = emptyElement;
  exportObj["stringMonoidalInstance"] = stringMonoidalInstance;
})(ModuleRegistry["Data.Monoid"] = ModuleRegistry["Data.Monoid"] || {});

((exportObj) => {
  "use strict";

  // Many imports here are for other modules, not directly used in the core logic of Data.Maybe's JS output.
  const controlCategory = ModuleRegistry["Control.Category"];
  const dataFunction = ModuleRegistry["Data.Function"];
  const dataFunctor = ModuleRegistry["Data.Functor"];
  const controlApply = ModuleRegistry["Control.Apply"];
  const controlApplicative = ModuleRegistry["Control.Applicative"];
  const controlBind = ModuleRegistry["Control.Bind"];

  // Represents an optional value that may or may not be present.
  class OptionalValue {
    static None = new OptionalValue("None"); // No value
    static Some = (value) => new OptionalValue("Some", value); // A value is present

    constructor(type, value = undefined) {
      this.type = type;
      this.value = value;
    }
  }

  // Safely extracts a value from an OptionalValue or returns a default.
  const unwrapMaybe = (defaultValue) => (mapper) => (optional) => {
    if (optional.type === "None") {
      return defaultValue;
    }
    if (optional.type === "Some") {
      return mapper(optional.value);
    }
    // This case should ideally not be reached if OptionalValue is properly sealed.
    throw new Error(`Failed pattern match in unwrapMaybe: ${optional.type}`);
  };

  // Checks if an OptionalValue contains a value.
  const isSome = unwrapMaybe(false)(dataFunction.alwaysReturn(true));

  // An instance of Mappable for OptionalValue.
  const maybeMappable = new dataFunctor.Mappable((mappingFn) => (optional) => {
    if (optional.type === "Some") {
      return OptionalValue.Some(mappingFn(optional.value));
    }
    return OptionalValue.None; // If None, map to None
  });

  // Retrieves the value from an OptionalValue, providing a default if None.
  const getValueOrDefault = (defaultValue) =>
    unwrapMaybe(defaultValue)(controlCategory.identityFunction(controlCategory.functionCategoricalInstance));

  // Unsafely extracts the value from an OptionalValue. Throws an error if None.
  const extractValueUnsafely = (dictPartial) => (optional) => {
    if (optional.type === "Some") {
      return optional.value;
    }
    throw new Error("Attempted to extract value from a None OptionalValue.");
  };

  // An instance of ApplicativeApply for OptionalValue.
  const maybeApplicativeApply = new controlApply.ApplicativeApply(
    () => maybeMappable, // Lazily get the functor instance
    (optionalFn) => (optionalVal) => {
      if (optionalFn.type === "Some") {
        return dataFunctor.map(maybeMappable)(optionalFn.value)(optionalVal);
      }
      if (optionalFn.type === "None") {
        return OptionalValue.None;
      }
      throw new Error(`Failed pattern match in maybeApplicativeApply: ${optionalFn.type}`);
    }
  );

  // An instance of MonadicBind for OptionalValue.
  const maybeMonadicBind = new controlBind.MonadicBind(
    () => maybeApplicativeApply, // Lazily get the apply instance
    (optionalVal) => (bindFn) => {
      if (optionalVal.type === "Some") {
        return bindFn(optionalVal.value);
      }
      if (optionalVal.type === "None") {
        return OptionalValue.None;
      }
      throw new Error(`Failed pattern match in maybeMonadicBind: ${optionalVal.type}`);
    }
  );

  // An instance of ApplicativeFunctor for OptionalValue.
  const maybeApplicativeFunctor = new controlApplicative.ApplicativeFunctor(
    () => maybeApplicativeApply, // Lazily get the apply instance
    OptionalValue.Some // The pure function wraps a value in Some
  );

  exportObj["None"] = OptionalValue.None;
  exportObj["Some"] = OptionalValue.Some;
  exportObj["unwrapMaybe"] = unwrapMaybe;
  exportObj["getValueOrDefault"] = getValueOrDefault;
  exportObj["isSome"] = isSome;
  exportObj["extractValueUnsafely"] = extractValueUnsafely;
  exportObj["maybeMappable"] = maybeMappable;
  exportObj["maybeApplicativeApply"] = maybeApplicativeApply;
  exportObj["maybeApplicativeFunctor"] = maybeApplicativeFunctor;
  exportObj["maybeMonadicBind"] = maybeMonadicBind;
})(ModuleRegistry["Data.Maybe"] = ModuleRegistry["Data.Maybe"] || {});

((exportObj) => {
  "use strict";

  const dataSemigroup = ModuleRegistry["Data.Semigroup"];
  const dataHeytingAlgebra = ModuleRegistry["Data.HeytingAlgebra"];
  const dataMonoid = ModuleRegistry["Data.Monoid"];

  // A newtype wrapper for conjunction (logical AND).
  const ConjunctionWrapper = (value) => value;

  // Semigroup instance for ConjunctionWrapper.
  const conjunctionSemigroup = (dictHeytingAlgebra) =>
    new dataSemigroup.CombiningStructure((v1) => (v2) =>
      dataHeytingAlgebra.conjunction(dictHeytingAlgebra)(v1)(v2)
    );

  // Monoid instance for ConjunctionWrapper.
  const conjunctionMonoid = (dictHeytingAlgebra) =>
    new dataMonoid.MonoidalStructure(
      () => conjunctionSemigroup(dictHeytingAlgebra), // Lazily get semigroup
      dataHeytingAlgebra.trueValue(dictHeytingAlgebra)
    );

  exportObj["ConjunctionWrapper"] = ConjunctionWrapper;
  exportObj["conjunctionSemigroup"] = conjunctionSemigroup;
  exportObj["conjunctionMonoid"] = conjunctionMonoid;
})(ModuleRegistry["Data.Monoid.Conj"] = ModuleRegistry["Data.Monoid.Conj"] || {});

((exportObj) => {
  "use strict";

  const dataFunctor = ModuleRegistry["Data.Functor"];
  const dataMonoidConj = ModuleRegistry["Data.Monoid.Conj"];

  // Type class for newtype wrappers, providing `unwrap` and `wrap` functions.
  class NewtypeWrapper {
    constructor(unwrapFn, wrapFn) {
      this.unwrapFn = unwrapFn;
      this.wrapFn = wrapFn;
    }
  }

  // Retrieves the `wrap` function.
  const wrap = (dict) => dict.wrapFn;

  // Retrieves the `unwrap` function.
  const unwrap = (dict) => dict.unwrapFn;

  // An instance of NewtypeWrapper for ConjunctionWrapper.
  const conjunctionNewtype = new NewtypeWrapper(
    (v) => v, // Unwrap just returns the inner value
    dataMonoidConj.ConjunctionWrapper // Wrap is the constructor
  );

  // A generic function to apply a functorial transformation across newtype boundaries.
  const applyNewtypeFunctor =
    (functorDict1) =>
    (functorDict2) =>
    (newtypeDict1) =>
    (newtypeDict2) =>
    (wrapper) =>
    (f) =>
    (value) =>
      dataFunctor.map(functorDict2)(unwrap(newtypeDict2))(
        f(dataFunctor.map(functorDict1)(wrap(newtypeDict1))(value))
      );

  exportObj["unwrap"] = unwrap;
  exportObj["wrap"] = wrap;
  exportObj["NewtypeWrapper"] = NewtypeWrapper;
  exportObj["applyNewtypeFunctor"] = applyNewtypeFunctor;
  exportObj["conjunctionNewtype"] = conjunctionNewtype;
})(ModuleRegistry["Data.Newtype"] = ModuleRegistry["Data.Newtype"] || {});

((exportObj) => {
  "use strict";

  const foreignFoldable = ModuleRegistry["Data.Foldable"];
  const dataSemigroup = ModuleRegistry["Data.Semigroup"];
  const dataMonoid = ModuleRegistry["Data.Monoid"];
  const dataNewtype = ModuleRegistry["Data.Newtype"];
  const dataFunctor = ModuleRegistry["Data.Functor"];
  const dataHeytingAlgebra = ModuleRegistry["Data.HeytingAlgebra"];
  const dataMonoidConj = ModuleRegistry["Data.Monoid.Conj"];

  // Type class for foldable structures (e.g., lists, arrays)
  class FoldableStructure {
    constructor(foldMapFn, foldlFn, foldrFn) {
      this.foldMapFn = foldMapFn;
      this.foldlFn = foldlFn;
      this.foldrFn = foldrFn;
    }
  }

  // Retrieves the foldr function.
  const foldr = (dict) => dict.foldrFn;

  // Retrieves the foldl function.
  const foldl = (dict) => dict.foldlFn;

  // Default implementation for foldMap using foldr.
  const defaultFoldMapRight = (foldableDict) => (monoidDict) => (mappingFn) =>
    foldr(foldableDict)((element) => (accumulator) =>
      dataSemigroup.append(monoidDict.semigroupInstance())(mappingFn(element))(accumulator)
    )(dataMonoid.emptyElement(monoidDict));

  // An instance of FoldableStructure for arrays.
  const arrayFoldable = new FoldableStructure(
    (monoidDict) => defaultFoldMapRight(arrayFoldable)(monoidDict), // foldMap
    foreignFoldable.foldLeftArr, // foldl
    foreignFoldable.foldRightArr // foldr
  );

  // Retrieves the foldMap function.
  const foldMap = (dict) => dict.foldMapFn;

  // Checks if all elements in a foldable structure satisfy a predicate.
  const checkAllElements = (foldableDict) => (heytingAlgebraDict) =>
    dataNewtype.applyNewtypeFunctor(dataFunctor.functionMappable)(dataFunctor.functionMappable)(
      dataNewtype.conjunctionNewtype
    )(dataNewtype.conjunctionNewtype)(dataMonoidConj.ConjunctionWrapper)(
      foldMap(foldableDict)(dataMonoidConj.conjunctionMonoid(heytingAlgebraDict))
    );

  exportObj["FoldableStructure"] = FoldableStructure;
  exportObj["foldr"] = foldr;
  exportObj["foldl"] = foldl;
  exportObj["foldMap"] = foldMap;
  exportObj["defaultFoldMapRight"] = defaultFoldMapRight;
  exportObj["checkAllElements"] = checkAllElements;
  exportObj["arrayFoldable"] = arrayFoldable;
})(ModuleRegistry["Data.Foldable"] = ModuleRegistry["Data.Foldable"] || {});

((exportObj) => {
  "use strict";

  const dataFunctor = ModuleRegistry["Data.Functor"];
  const controlApply = ModuleRegistry["Control.Apply"];
  const controlBind = ModuleRegistry["Control.Bind"];
  const controlApplicative = ModuleRegistry["Control.Applicative"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];

  // Represents a value that can be either an error (Left) or a successful result (Right).
  class ResultType {
    static Err = (errorValue) => new ResultType("Err", errorValue); // Error case
    static Ok = (successValue) => new ResultType("Ok", successValue); // Success case

    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
  }

  // Converts an OptionalValue to a ResultType.
  // If OptionalValue is None, returns an Err with the provided error message.
  // If OptionalValue is Some, returns an Ok with the wrapped value.
  const fromMaybeToEither = (errorMessage) => (optional) =>
    dataMaybe.unwrapMaybe(ResultType.Err(errorMessage))(ResultType.Ok)(optional);

  // An instance of Mappable for ResultType.
  const eitherMappable = new dataFunctor.Mappable((mappingFn) => (result) => {
    if (result.type === "Err") {
      return ResultType.Err(result.value);
    }
    if (result.type === "Ok") {
      return ResultType.Ok(mappingFn(result.value));
    }
    throw new Error(`Failed pattern match in eitherMappable: ${result.type}`);
  });

  // Applies one of two functions depending on whether the ResultType is Err or Ok.
  const handleEither = (errHandler) => (okHandler) => (result) => {
    if (result.type === "Err") {
      return errHandler(result.value);
    }
    if (result.type === "Ok") {
      return okHandler(result.value);
    }
    throw new Error(`Failed pattern match in handleEither: ${result.type}`);
  };

  // An instance of ApplicativeApply for ResultType.
  const eitherApplicativeApply = new controlApply.ApplicativeApply(
    () => eitherMappable, // Lazily get the functor instance
    (resultFn) => (resultVal) => {
      if (resultFn.type === "Err") {
        return ResultType.Err(resultFn.value);
      }
      if (resultFn.type === "Ok") {
        return dataFunctor.map(eitherMappable)(resultFn.value)(resultVal);
      }
      throw new Error(`Failed pattern match in eitherApplicativeApply: ${resultFn.type}`);
    }
  );

  // An instance of MonadicBind for ResultType.
  const eitherMonadicBind = new controlBind.MonadicBind(
    () => eitherApplicativeApply, // Lazily get the apply instance
    handleEither((err) => (func) => ResultType.Err(err))((val) => (func) => func(val))
  );

  // An instance of ApplicativeFunctor for ResultType.
  const eitherApplicativeFunctor = new controlApplicative.ApplicativeFunctor(
    () => eitherApplicativeApply, // Lazily get the apply instance
    ResultType.Ok // The pure function wraps a value in Ok
  );

  exportObj["Err"] = ResultType.Err;
  exportObj["Ok"] = ResultType.Ok;
  exportObj["handleEither"] = handleEither;
  exportObj["fromMaybeToEither"] = fromMaybeToEither;
  exportObj["eitherMappable"] = eitherMappable;
  exportObj["eitherApplicativeApply"] = eitherApplicativeApply;
  exportObj["eitherApplicativeFunctor"] = eitherApplicativeFunctor;
  exportObj["eitherMonadicBind"] = eitherMonadicBind;
})(ModuleRegistry["Data.Either"] = ModuleRegistry["Data.Either"] || {});

((exportObj) => {
  "use strict";

  // Executes a function that is known to be partial (might throw an error) within a safe wrapper.
  exportObj.performUnsafePartial = (partialFunction) => partialFunction();
})(ModuleRegistry["Partial.Unsafe"] = ModuleRegistry["Partial.Unsafe"] || {});

((exportObj) => {
  "use strict";

  // Throws a JavaScript Error with the given message.
  exportObj.crashWithMessage = (msg) => {
    throw new Error(msg);
  };
})(ModuleRegistry["Partial"] = ModuleRegistry["Partial"] || {});

((exportObj) => {
  "use strict";

  const foreignPartial = ModuleRegistry["Partial"];

  // Re-exports the crashWithMessage function.
  exportObj["crashWithMessage"] = foreignPartial.crashWithMessage;
})(ModuleRegistry["Partial"] = ModuleRegistry["Partial"] || {});

((exportObj) => {
  "use strict";

  const foreignPartialUnsafe = ModuleRegistry["Partial.Unsafe"];
  const partial = ModuleRegistry["Partial"];

  // Unsafely crashes the program with a given message.
  const crashProgramUnsafely = (message) =>
    foreignPartialUnsafe.performUnsafePartial((dictPartial) =>
      partial.crashWithMessage(dictPartial)(message)
    );

  exportObj["crashProgramUnsafely"] = crashProgramUnsafely;
})(ModuleRegistry["Partial.Unsafe"] = ModuleRegistry["Partial.Unsafe"] || {});

((exportObj) => {
  "use strict";

  // Represents a step in a tail-recursive loop: continue looping.
  class LoopStep {
    static ContinueLoop = (value) => new LoopStep("ContinueLoop", value); // Loop with new value
    static LoopFinished = (result) => new LoopStep("LoopFinished", result); // Loop finished, return result

    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
  }

  // Implements tail-call optimization for a recursive function.
  // The function `f` should return `LoopStep.ContinueLoop(nextState)` or `LoopStep.LoopFinished(finalResult)`.
  const optimizedTailRecursion = (recursiveFunc) => {
    // Inner function `go` handles the loop iteration.
    const go = (initialState) => {
      let currentState = initialState;
      let loopComplete = false;
      let finalResult;

      // The loop continues until `loopComplete` is true.
      while (!loopComplete) {
        const step = recursiveFunc(currentState); // Execute one step of the recursion
        if (step.type === "ContinueLoop") {
          currentState = step.value; // Update state for next iteration
        } else if (step.type === "LoopFinished") {
          finalResult = step.value; // Store result and mark loop as complete
          loopComplete = true;
        } else {
          // Fallback for unexpected return types from `recursiveFunc`
          throw new Error(`Invalid return type from tailRec function: ${step.type}`);
        }
      }
      return finalResult;
    };
    // The public API is `optimizedTailRecursion(f)(initialArg)`
    return (initialArg) => go(recursiveFunc(initialArg));
  };

  exportObj["ContinueLoop"] = LoopStep.ContinueLoop;
  exportObj["LoopFinished"] = LoopStep.LoopFinished;
  exportObj["optimizedTailRecursion"] = optimizedTailRecursion;
})(ModuleRegistry["Control.Monad.Rec.Class"] = ModuleRegistry["Control.Monad.Rec.Class"] || {});

((exportObj) => {
  "use strict";

  // Gets the length of an array.
  exportObj.getArrayLength = (inputArray) => inputArray.length;

  // Implements array indexing, returning Some(element) or None if out of bounds.
  exportObj.accessArrayIndexImpl = (someConstructor) => (noneValue) => (inputArray) => (index) => {
    if (index < 0 || index >= inputArray.length) {
      return noneValue;
    }
    return someConstructor(inputArray[index]);
  };

  // Sorts an array using a custom comparison function.
  exportObj.sortArrayImpl = (comparisonFn) => (inputArray) => {
    // Create a shallow copy to avoid modifying the original array.
    return [...inputArray].sort((valA, valB) => comparisonFn(valA)(valB));
  };

  // Slices an array from start to end index (exclusive).
  exportObj.sliceArray = (startIndex) => (endIndex) => (inputArray) =>
    inputArray.slice(startIndex, endIndex);

  // Drops the first 'n' elements from an array.
  exportObj.dropArrayElements = (numToDrop) => (inputArray) => {
    // If numToDrop is less than 1, return the original array (or a shallow copy)
    return numToDrop < 1 ? inputArray : inputArray.slice(numToDrop);
  };
})(ModuleRegistry["Data.Array"] = ModuleRegistry["Data.Array"] || {});

((exportObj) => {
  "use strict";

  const dataMaybe = ModuleRegistry["Data.Maybe"];

  // Represents a pair of values.
  class Pair {
    constructor(leftValue, rightValue) {
      this.leftValue = leftValue;
      this.rightValue = rightValue;
    }

    // Static constructor for convenience
    static create(leftValue) {
      return (rightValue) => new Pair(leftValue, rightValue);
    }
  }

  // Gets the left value of a Pair.
  const getLeft = (pair) => pair.leftValue;

  // Gets the right value of a Pair.
  const getRight = (pair) => pair.rightValue;

  exportObj["Pair"] = Pair;
  exportObj["getLeft"] = getLeft;
  exportObj["getRight"] = getRight;
})(ModuleRegistry["Data.Tuple"] = ModuleRegistry["Data.Tuple"] || {});

((exportObj) => {
  "use strict";

  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const dataTuple = ModuleRegistry["Data.Tuple"];

  // Type class for structures that can be unfolded (generated) from a seed value,
  // producing at least one element.
  class UnfoldableOne {
    constructor(unfoldRightOneFn) {
      this.unfoldRightOneFn = unfoldRightOneFn;
    }
  }

  // Retrieves the `unfoldr1` function.
  const unfoldRightOne = (dict) => dict.unfoldRightOneFn;

  exportObj["UnfoldableOne"] = UnfoldableOne;
  exportObj["unfoldRightOne"] = unfoldRightOne;
})(ModuleRegistry["Data.Unfoldable1"] = ModuleRegistry["Data.Unfoldable1"] || {});

((exportObj) => {
  "use strict";

  const dataFunction = ModuleRegistry["Data.Function"];
  const dataFunctor = ModuleRegistry["Data.Functor"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const dataTuple = ModuleRegistry["Data.Tuple"];
  const dataUnfoldable1 = ModuleRegistry["Data.Unfoldable1"];

  // Type class for structures that can be unfolded (generated) from a seed value.
  class UnfoldableAny {
    constructor(unfoldableOneInstance, unfoldRightFn) {
      this.unfoldableOneInstance = unfoldableOneInstance;
      this.unfoldRightFn = unfoldRightFn;
    }
  }

  // Retrieves the `unfoldr` function.
  const unfoldRight = (dict) => dict.unfoldRightFn;

  // Replicates a value `n` times into an unfoldable structure.
  const repeatValue = (unfoldableDict) => (count) => (value) => {
    // Step function for unfolding: returns Some(Pair(value, nextCount)) or None.
    const step = (currentCount) => {
      if (currentCount <= 0) {
        return dataMaybe.None;
      }
      return dataMaybe.Some(dataTuple.Pair.create(value)(currentCount - 1));
    };
    return unfoldRight(unfoldableDict)(step)(count);
  };

  exportObj["UnfoldableAny"] = UnfoldableAny;
  exportObj["unfoldRight"] = unfoldRight;
  exportObj["repeatValue"] = repeatValue;
})(ModuleRegistry["Data.Unfoldable"] = ModuleRegistry["Data.Unfoldable"] || {});

((exportObj) => {
  "use strict";

  // Performs an unsafe type coercion. Use with extreme caution.
  exportObj.performUnsafeTypeCoercion = (value) => value;
})(ModuleRegistry["Unsafe.Coerce"] = ModuleRegistry["Unsafe.Coerce"] || {});

((exportObj) => {
  "use strict";

  const foreignUnsafeCoerce = ModuleRegistry["Unsafe.Coerce"];

  // Re-exports the unsafe coercion function.
  exportObj["performUnsafeTypeCoercion"] = foreignUnsafeCoerce.performUnsafeTypeCoercion;
})(ModuleRegistry["Unsafe.Coerce"] = ModuleRegistry["Unsafe.Coerce"] || {});

((exportObj) => {
  "use strict";

  const foreignArray = ModuleRegistry["Data.Array"];
  const dataOrd = ModuleRegistry["Data.Ord"];
  const dataOrdering = ModuleRegistry["Data.Ordering"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const dataFunction = ModuleRegistry["Data.Function"];
  const controlBind = ModuleRegistry["Control.Bind"];

  // Sorts an array using a custom comparison function that returns Data.Ordering.
  const sortWithComparator = (comparisonFn) => (inputArray) => {
    const jsComparisonFn = (valX) => (valY) => {
      const result = comparisonFn(valX)(valY);
      if (result === dataOrdering.Greater) return 1;
      if (result === dataOrdering.Equal) return 0;
      if (result === dataOrdering.Lesser) return -1;
      // Should not happen with valid Data.Ordering results
      throw new Error("Invalid comparison result for sorting.");
    };
    return foreignArray.sortArrayImpl(jsComparisonFn)(inputArray);
  };

  // Sorts an array based on a key derived from each element.
  const sortWithKey = (orderingDict) => (keyExtractor) =>
    sortWithComparator(dataOrd.comparing(orderingDict)(keyExtractor));

  // Creates an array containing a single element.
  const createSingletonArray = (element) => [element];

  // Accesses an element at a given index, returning an OptionalValue.
  const getArrayElement = foreignArray.accessArrayIndexImpl(dataMaybe.Some)(dataMaybe.None);

  // Gets the first element of an array, returning an OptionalValue.
  const getFirstElement = (inputArray) => getArrayElement(inputArray)(0);

  // Maps a function over an array and flattens the results.
  const concatenateMap = dataFunction.reverseArgs(controlBind.bind(controlBind.arrayMonadicBind));

  // Maps a function over an array, filtering out None results.
  const mapAndFilter = (mappingFn) =>
    concatenateMap((element) =>
      dataMaybe.unwrapMaybe([])(createSingletonArray)(mappingFn(element))
    );

  exportObj["createSingletonArray"] = createSingletonArray;
  exportObj["getFirstElement"] = getFirstElement;
  exportObj["getArrayElement"] = getArrayElement;
  exportObj["concatenateMap"] = concatenateMap;
  exportObj["mapAndFilter"] = mapAndFilter;
  exportObj["sortWithComparator"] = sortWithComparator;
  exportObj["sortWithKey"] = sortWithKey;
  exportObj["getArrayLength"] = foreignArray.getArrayLength;
  exportObj["dropArrayElements"] = foreignArray.dropArrayElements;
})(ModuleRegistry["Data.Array"] = ModuleRegistry["Data.Array"] || {});

((exportObj) => {
  "use strict";

  // Converts a character to its Unicode code point.
  exportObj.charToCodePoint = (char) => char.charCodeAt(0);

  // Converts a Unicode code point to a character.
  exportObj.codePointToChar = (codePoint) => String.fromCharCode(codePoint);
})(ModuleRegistry["Data.Enum"] = ModuleRegistry["Data.Enum"] || {});

((exportObj) => {
  "use strict";

  const foreignEnum = ModuleRegistry["Data.Enum"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const dataOrd = ModuleRegistry["Data.Ord"];
  const dataBounded = ModuleRegistry["Data.Bounded"];

  // Type class for enumerable types, providing successor and predecessor functions.
  class EnumerationType {
    constructor(orderableInstance, predecessorFn, successorFn) {
      this.orderableInstance = orderableInstance;
      this.predecessorFn = predecessorFn;
      this.successorFn = successorFn;
    }
  }

  // Type class for bounded enumerable types, adding cardinality and conversion to/from integer.
  class BoundedEnumerationType {
    constructor(boundedInstance, enumerationInstance, cardinalityFn, fromEnumFn, toEnumFn) {
      this.boundedInstance = boundedInstance;
      this.enumerationInstance = enumerationInstance;
      this.cardinalityFn = cardinalityFn;
      this.fromEnumFn = fromEnumFn;
      this.toEnumFn = toEnumFn;
    }
  }

  // Retrieves the `toEnum` function.
  const toEnum = (dict) => dict.toEnumFn;

  // Retrieves the `succ` (successor) function.
  const successor = (dict) => dict.successorFn;

  // Retrieves the `pred` (predecessor) function.
  const predecessor = (dict) => dict.predecessorFn;

  // Retrieves the `fromEnum` function.
  const fromEnum = (dict) => dict.fromEnumFn;

  // Default successor implementation.
  const defaultSuccessor = (toEnumFn) => (fromEnumFn) => (value) =>
    toEnumFn(fromEnumFn(value) + 1);

  // Default predecessor implementation.
  const defaultPredecessor = (toEnumFn) => (fromEnumFn) => (value) =>
    toEnumFn(fromEnumFn(value) - 1);

  // Converts an integer code point to a character, wrapped in an OptionalValue.
  const charCodePointToChar = (codePoint) => {
    // Check if the code point is within the valid range for characters.
    const minCode = dataBounded.bottom(dataBounded.intBounded);
    const maxCode = dataBounded.top(dataBounded.intBounded);

    if (codePoint >= minCode && codePoint <= maxCode) {
      return dataMaybe.Some(foreignEnum.codePointToChar(codePoint));
    }
    return dataMaybe.None;
  };

  // An instance of EnumerationType for characters.
  const charEnumeration = new EnumerationType(
    () => dataOrd.charOrderable, // Lazily get orderable instance
    defaultPredecessor(charCodePointToChar)(foreignEnum.charToCodePoint),
    defaultSuccessor(charCodePointToChar)(foreignEnum.charToCodePoint)
  );

  // Retrieves the `cardinality` function.
  const cardinality = (dict) => dict.cardinalityFn;

  // An instance of BoundedEnumerationType for characters.
  const charBoundedEnumeration = new BoundedEnumerationType(
    () => dataBounded.charBounded, // Lazily get bounded instance
    () => charEnumeration, // Lazily get enumeration instance
    foreignEnum.charToCodePoint(dataBounded.top(dataBounded.charBounded)) -
      foreignEnum.charToCodePoint(dataBounded.bottom(dataBounded.charBounded)),
    foreignEnum.charToCodePoint,
    charCodePointToChar
  );

  exportObj["EnumerationType"] = EnumerationType;
  exportObj["successor"] = successor;
  exportObj["predecessor"] = predecessor;
  exportObj["BoundedEnumerationType"] = BoundedEnumerationType;
  exportObj["cardinality"] = cardinality;
  exportObj["toEnum"] = toEnum;
  exportObj["fromEnum"] = fromEnum;
  exportObj["defaultSuccessor"] = defaultSuccessor;
  exportObj["defaultPredecessor"] = defaultPredecessor;
  exportObj["charEnumeration"] = charEnumeration;
  exportObj["charBoundedEnumeration"] = charBoundedEnumeration;
})(ModuleRegistry["Data.Enum"] = ModuleRegistry["Data.Enum"] || {});

((exportObj) => {
  "use strict";

  const dataEnum = ModuleRegistry["Data.Enum"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];

  // Converts a character to its code point.
  const charToCode = dataEnum.fromEnum(dataEnum.charBoundedEnumeration);

  // Converts a code point to a character.
  const codeToChar = dataEnum.toEnum(dataEnum.charBoundedEnumeration);

  exportObj["charToCode"] = charToCode;
  exportObj["codeToChar"] = codeToChar;
})(ModuleRegistry["Data.Char"] = ModuleRegistry["Data.Char"] || {});

((exportObj) => {
  "use strict";

  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const dataChar = ModuleRegistry["Data.Char"];
  const dataEq = ModuleRegistry["Data.Eq"];
  const dataOrd = ModuleRegistry["Data.Ord"];

  // A newtype wrapper for a single decimal digit (0-9).
  const NumericalDigit = (value) => value;

  // Converts a NumericalDigit to an integer.
  const convertToInt = (digit) => digit;

  // Converts a NumericalDigit to its character representation.
  const convertToChar = (digit) =>
    dataMaybe.extractValueUnsafely(null)(dataChar.codeToChar(digit + 48)); // 48 is ASCII for '0'

  // Attempts to create a NumericalDigit from an integer.
  const fromInteger = (intVal) => {
    if (intVal >= 0 && intVal <= 9) {
      return dataMaybe.Some(NumericalDigit(intVal));
    }
    return dataMaybe.None;
  };

  // Attempts to create a NumericalDigit from a character.
  const fromCharacter = (charVal) => {
    const code = dataChar.charToCode(charVal);
    // Check if character code is between '0' and '9'
    if (code >= 48 && code <= 57) {
      return dataMaybe.Some(NumericalDigit(code - 48));
    }
    return dataMaybe.None;
  };

  // Equality instance for NumericalDigit.
  const digitEquality = new dataEq.EqualityTypeclass((d1) => (d2) => d1 === d2);

  // Ordering instance for NumericalDigit.
  const digitOrdering = new dataOrd.Orderable(
    () => digitEquality, // Lazily get equality instance
    (d1) => (d2) => dataOrd.compare(dataOrd.intOrderable)(d1)(d2)
  );

  // Constant for digit 0.
  const digitZero = 0;

  // Constant for digit 1.
  const digitOne = 1;

  exportObj["fromInteger"] = fromInteger;
  exportObj["convertToInt"] = convertToInt;
  exportObj["fromCharacter"] = fromCharacter;
  exportObj["convertToChar"] = convertToChar;
  exportObj["digitZero"] = digitZero;
  exportObj["digitOne"] = digitOne;
  exportObj["digitEquality"] = digitEquality;
  exportObj["digitOrdering"] = digitOrdering;
})(ModuleRegistry["Data.Digit"] = ModuleRegistry["Data.Digit"] || {});

((exportObj) => {
  "use strict";

  // Converts a number to an integer, returning Some(int) or None if not a whole number.
  exportObj.convertFromNumberImpl = (someConstructor) => (noneValue) => (numVal) => {
    // Check if it's an integer by comparing with its floored/truncated value.
    return numVal === (numVal | 0) ? someConstructor(numVal) : noneValue;
  };

  // Converts an integer to a number (float).
  exportObj.convertToNumber = (intVal) => intVal;

  // Parses a string as an integer with a given radix, returning Some(int) or None.
  exportObj.convertFromStringAsImpl = (someConstructor) => (noneValue) => (radix) => {
    let digitPattern;
    if (radix < 11) {
      digitPattern = `[0-${radix - 1}]`;
    } else if (radix === 11) {
      digitPattern = "[0-9a]";
    } else {
      // For radix > 11, we need to include letters beyond 'a'
      // 'a' is char code 97. 'z' is 122.
      // 86 + radix gives the character code for the highest digit.
      // E.g., for radix 16 (hex), 86 + 16 = 102, which is 'f'.
      digitPattern = `[0-9a-${String.fromCharCode(86 + radix)}]`;
    }

    const regexPattern = new RegExp(`^[\\+\\-]?${digitPattern}+?$`, "i"); // Added '?' for non-greedy matching

    return (inputString) => {
      // Add a simple check for empty string or non-string input
      if (typeof inputString !== 'string' || inputString.trim() === '') {
        return noneValue;
      }
      if (regexPattern.test(inputString)) {
        const parsedInt = Number.parseInt(inputString, radix);
        // Ensure the parsed value is a valid integer and not NaN.
        // (parsedInt | 0) === parsedInt is a common JS trick for integer check.
        return (parsedInt | 0) === parsedInt && !Number.isNaN(parsedInt)
          ? someConstructor(parsedInt)
          : noneValue;
      } else {
        return noneValue;
      }
    };
  };
})(ModuleRegistry["Data.Int"] = ModuleRegistry["Data.Int"] || {});

((exportObj) => {
  "use strict";

  // JavaScript's global Infinity constant.
  exportObj.globalInfinity = Infinity;

  // Parses a string into a floating-point number.
  exportObj.parseFloatingPoint = parseFloat;
})(ModuleRegistry["Global"] = ModuleRegistry["Global"] || {});

((exportObj) => {
  "use strict";

  const foreignGlobal = ModuleRegistry["Global"];

  // Re-exports global constants and functions.
  exportObj["globalInfinity"] = foreignGlobal.globalInfinity;
  exportObj["parseFloatingPoint"] = foreignGlobal.parseFloatingPoint;
})(ModuleRegistry["Global"] = ModuleRegistry["Global"] || {});

((exportObj) => {
  "use strict";

  // Rounds a number to the nearest integer.
  exportObj.roundNumber = Math.round;
})(ModuleRegistry["Math"] = ModuleRegistry["Math"] || {});

((exportObj) => {
  "use strict";

  const foreignMath = ModuleRegistry["Math"];

  // Re-exports the round function.
  exportObj["roundNumber"] = foreignMath.roundNumber;
})(ModuleRegistry["Math"] = ModuleRegistry["Math"] || {});

((exportObj) => {
  "use strict";

  const foreignInt = ModuleRegistry["Data.Int"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const dataBounded = ModuleRegistry["Data.Bounded"];
  const dataBoolean = ModuleRegistry["Data.Boolean"];
  const globalModule = ModuleRegistry["Global"];
  const mathModule = ModuleRegistry["Math"];

  // Parses a string as an integer with a specified radix.
  const parseIntegerWithRadix = foreignInt.convertFromStringAsImpl(dataMaybe.Some)(dataMaybe.None);

  // Parses a string as a base-10 integer.
  const parseInteger = parseIntegerWithRadix(10);

  // Converts a number to an optional integer.
  const integerFromNumber = foreignInt.convertFromNumberImpl(dataMaybe.Some)(dataMaybe.None);

  // Unsafely clamps a number to the range of 32-bit integers.
  const clampIntegerUnsafely = (numVal) => {
    // Check for explicit infinity values first.
    if (numVal === globalModule.globalInfinity || numVal === -globalModule.globalInfinity) {
      return 0; // Or throw an error, depending on desired behavior for infinity.
    }

    // Clamp to min/max integer bounds.
    const maxInt = foreignInt.convertToNumber(dataBounded.top(dataBounded.intBounded));
    const minInt = foreignInt.convertToNumber(dataBounded.bottom(dataBounded.intBounded));

    if (numVal >= maxInt) {
      return dataBounded.top(dataBounded.intBounded);
    }
    if (numVal <= minInt) {
      return dataBounded.bottom(dataBounded.intBounded);
    }

    // If it's a valid number within bounds, convert to integer.
    // Use getValueOrDefault with 0 as default if conversion fails (e.g., NaN, non-integer float).
    return dataMaybe.getValueOrDefault(0)(integerFromNumber(numVal));
  };

  // Rounds a floating-point number to the nearest integer, clamping to int bounds.
  const roundToInteger = (floatNum) => clampIntegerUnsafely(mathModule.roundNumber(floatNum));

  exportObj["integerFromNumber"] = integerFromNumber;
  exportObj["roundToInteger"] = roundToInteger;
  exportObj["parseInteger"] = parseInteger;
  exportObj["parseIntegerWithRadix"] = parseIntegerWithRadix;
  exportObj["convertToNumber"] = foreignInt.convertToNumber;
})(ModuleRegistry["Data.Int"] = ModuleRegistry["Data.Int"] || {});

((exportObj) => {
  "use strict";

  const controlApplicative = ModuleRegistry["Control.Applicative"];
  const controlBind = ModuleRegistry["Control.Bind"];
  const dataFoldable = ModuleRegistry["Data.Foldable"];
  const dataFunction = ModuleRegistry["Data.Function"];
  const dataFunctor = ModuleRegistry["Data.Functor"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const dataMonoid = ModuleRegistry["Data.Monoid"];
  const dataEq = ModuleRegistry["Data.Eq"];
  const dataOrd = ModuleRegistry["Data.Ord"];
  const dataTuple = ModuleRegistry["Data.Tuple"];
  const dataUnfoldable = ModuleRegistry["Data.Unfoldable"];
  const dataUnfoldable1 = ModuleRegistry["Data.Unfoldable1"];

  // Represents an empty list.
  class EmptyList {
    constructor() {
      // Use a unique symbol for type identification rather than string
      this.type = Symbol("EmptyList");
    }
  }
  EmptyList.value = new EmptyList(); // Singleton instance

  // Represents a list with a head and a tail.
  class ListCons {
    constructor(headValue, tailList) {
      this.type = Symbol("ListCons");
      this.headValue = headValue;
      this.tailList = tailList;
    }

    static create(headValue) {
      return (tailList) => new ListCons(headValue, tailList);
    }
  }

  // Foldable instance for List.
  const listFoldableInst = new dataFoldable.FoldableStructure(
    (monoidDict) =>
      dataFoldable.foldl(listFoldableInst)((acc) => (elem) =>
        dataSemigroup.append(monoidDict.semigroupInstance())(acc)(monoidDict.foldMapFn(elem))
      )(dataMonoid.emptyElement(monoidDict)),
    (foldingFn) => {
      // Iterative implementation for foldl
      const go = (accumulator, currentList) => {
        while (true) {
          if (currentList.type === Symbol("EmptyList")) {
            return accumulator;
          }
          if (currentList.type === Symbol("ListCons")) {
            accumulator = foldingFn(accumulator)(currentList.headValue);
            currentList = currentList.tailList;
            continue; // Continue loop with new accumulator and tail
          }
          throw new Error(`Failed pattern match in foldl (List): ${currentList.type}`);
        }
      };
      return go;
    },
    (foldingFn) => (initialAcc) => {
      // Using an iterative approach for foldr as well, by reversing and then foldl.
      const reverseListInternal = (lst) =>
        dataFoldable.foldl(listFoldableInst)(dataFunction.reverseArgs(ListCons.create))(
          EmptyList.value
        )(lst);
      return (inputList) =>
        dataFoldable.foldl(listFoldableInst)(dataFunction.reverseArgs(foldingFn))(initialAcc)(
          reverseListInternal(inputList)
        );
    }
  );

  // Functor instance for List.
  const listFunctorInst = new dataFunctor.Mappable((mappingFn) =>
    dataFoldable.foldr(listFoldableInst)((element) => (accumulator) =>
      ListCons.create(mappingFn(element))(accumulator)
    )(EmptyList.value)
  );

  // Semigroup instance for List (concatenation).
  const listSemigroupInst = new (ModuleRegistry["Data.Semigroup"].CombiningStructure)(
    (list1) => (list2) => dataFoldable.foldr(listFoldableInst)(ListCons.create)(list2)(list1)
  );

  // Monoid instance for List (empty list as identity).
  const listMonoidInst = new dataMonoid.MonoidalStructure(() => listSemigroupInst, EmptyList.value);

  // UnfoldableOne instance for List.
  const listUnfoldableOneInst = new dataUnfoldable1.UnfoldableOne((stepFn) => (seed) => {
    let currentSeed = seed;
    let memoizedList = EmptyList.value;
    let loopDone = false;

    while (!loopDone) {
      const { leftValue, rightValue } = stepFn(currentSeed); // Destructure Pair
      memoizedList = ListCons.create(leftValue)(memoizedList); // Prepend to memoized list
      if (rightValue.type === Symbol("Some")) {
        currentSeed = rightValue.value;
      } else if (rightValue.type === Symbol("None")) {
        loopDone = true; // Stop condition
      } else {
        throw new Error(`Invalid return type from unfoldr1 step: ${rightValue.type}`);
      }
    }
    // Reverse the memoized list to get the correct order
    return dataFoldable.foldl(listFoldableInst)(dataFunction.reverseArgs(ListCons.create))(
      EmptyList.value
    )(memoizedList);
  });

  // Unfoldable instance for List.
  const listUnfoldableInst = new dataUnfoldable.UnfoldableAny(
    () => listUnfoldableOneInst, // Lazily get unfoldable1 instance
    (stepFn) => (seed) => {
      let currentSeed = seed;
      let memoizedList = EmptyList.value;
      let loopDone = false;

      while (!loopDone) {
        const stepResult = stepFn(currentSeed);
        if (stepResult.type === Symbol("None")) {
          loopDone = true; // Stop condition
        } else if (stepResult.type === Symbol("Some")) {
          memoizedList = ListCons.create(stepResult.value.leftValue)(memoizedList); // Prepend
          currentSeed = stepResult.value.rightValue;
        } else {
          throw new Error(`Invalid return type from unfoldr step: ${stepResult.type}`);
        }
      }
      // Reverse the memoized list to get the correct order
      return dataFoldable.foldl(listFoldableInst)(dataFunction.reverseArgs(ListCons.create))(
        EmptyList.value
      )(memoizedList);
    }
  );

  // Equality1 instance for List.
  const listEq1Inst = new (ModuleRegistry["Data.Eq"].EqualityTypeclass1)((eqDict) => (list1) => (list2) => {
    let current1 = list1;
    let current2 = list2;
    let areEqual = true;

    while (areEqual) {
      // If both are empty, they are equal.
      if (current1.type === Symbol("EmptyList") && current2.type === Symbol("EmptyList")) {
        break;
      }
      // If one is empty and the other is not, they are not equal.
      if (current1.type === Symbol("EmptyList") || current2.type === Symbol("EmptyList")) {
        areEqual = false;
        break;
      }
      // If both are Cons, compare heads and continue with tails.
      if (current1.type === Symbol("ListCons") && current2.type === Symbol("ListCons")) {
        if (!dataEq.eq(eqDict)(current1.headValue)(current2.headValue)) {
          areEqual = false;
        }
        current1 = current1.tailList;
        current2 = current2.tailList;
      } else {
        // Mismatched types (shouldn't happen if ListCons/EmptyList are only types)
        areEqual = false;
        break;
      }
    }
    return areEqual;
  });

  // Equality instance for List.
  const listEqInst = (eqDict) => new (ModuleRegistry["Data.Eq"].EqualityTypeclass)(dataEq.eq1(listEq1Inst)(eqDict));

  // Orderable1 instance for List.
  const listOrd1Inst = new (ModuleRegistry["Data.Ord"].Orderable1)(
    () => listEq1Inst, // Lazily get equality1 instance
    (ordDict) => (list1) => (list2) => {
      let current1 = list1;
      let current2 = list2;

      while (true) {
        // If both are empty, they are equal.
        if (current1.type === Symbol("EmptyList") && current2.type === Symbol("EmptyList")) {
          return ModuleRegistry["Data.Ordering"].Equal;
        }
        // If list1 is empty and list2 is not, list1 is Lesser.
        if (current1.type === Symbol("EmptyList")) {
          return ModuleRegistry["Data.Ordering"].Lesser;
        }
        // If list2 is empty and list1 is not, list1 is Greater.
        if (current2.type === Symbol("EmptyList")) {
          return ModuleRegistry["Data.Ordering"].Greater;
        }
        // If both are Cons, compare heads.
        if (current1.type === Symbol("ListCons") && current2.type === Symbol("ListCons")) {
          const headComparison = dataOrd.compare(ordDict)(current1.headValue)(current2.headValue);
          if (headComparison !== ModuleRegistry["Data.Ordering"].Equal) {
            return headComparison; // If heads differ, return that result.
          }
          // If heads are equal, continue comparison with tails.
          current1 = current1.tailList;
          current2 = current2.tailList;
        } else {
          // Mismatched types, or unexpected case.
          throw new Error(`Failed pattern match in listOrd1Inst: ${current1.type}, ${current2.type}`);
        }
      }
    }
  );

  // Orderable instance for List.
  const listOrdInst = (ordDict) =>
    new (ModuleRegistry["Data.Ord"].Orderable)(
      () => listEqInst(ordDict.equalityInstance()), // Lazily get equality instance
      dataOrd.compare1(listOrd1Inst)(ordDict)
    );

  // ApplicativeApply instance for List.
  const listApplyInst = new (ModuleRegistry["Control.Apply"].ApplicativeApply)(
    () => listFunctorInst, // Lazily get functor instance
    (functionsList) => (valuesList) => {
      if (functionsList.type === Symbol("EmptyList")) {
        return EmptyList.value;
      }
      if (functionsList.type === Symbol("ListCons")) {
        // Map the head function over valuesList, then apply tail functions recursively.
        const mappedHead = dataFunctor.map(listFunctorInst)(functionsList.headValue)(valuesList);
        const appliedTail = (ModuleRegistry["Control.Apply"].apply)(listApplyInst)(functionsList.tailList)(valuesList);
        return (ModuleRegistry["Data.Semigroup"].append)(listSemigroupInst)(mappedHead)(appliedTail);
      }
      throw new Error(`Failed pattern match in listApplyInst: ${functionsList.type}`);
    }
  );

  // ApplicativeFunctor instance for List.
  const listApplicativeInst = new (ModuleRegistry["Control.Applicative"].ApplicativeFunctor)(
    () => listApplyInst, // Lazily get apply instance
    (value) => ListCons.create(value)(EmptyList.value) // Pure wraps value in a singleton list
  );

  exportObj["EmptyList"] = EmptyList;
  exportObj["ListCons"] = ListCons;
  exportObj["listEqInst"] = listEqInst;
  exportObj["listEq1Inst"] = listEq1Inst;
  exportObj["listOrdInst"] = listOrdInst;
  exportObj["listOrd1Inst"] = listOrd1Inst;
  exportObj["listSemigroupInst"] = listSemigroupInst;
  exportObj["listMonoidInst"] = listMonoidInst;
  exportObj["listFunctorInst"] = listFunctorInst;
  exportObj["listFoldableInst"] = listFoldableInst;
  exportObj["listUnfoldableOneInst"] = listUnfoldableOneInst;
  exportObj["listUnfoldableInst"] = listUnfoldableInst;
  exportObj["listApplyInst"] = listApplyInst;
  exportObj["listApplicativeInst"] = listApplicativeInst;
})(ModuleRegistry["Data.List.Types"] = ModuleRegistry["Data.List.Types"] || {});

((exportObj) => {
  "use strict";

  const dataBoolean = ModuleRegistry["Data.Boolean"];
  const dataFunction = ModuleRegistry["Data.Function"];
  const dataFunctor = ModuleRegistry["Data.Functor"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const dataTuple = ModuleRegistry["Data.Tuple"];
  const dataFoldable = ModuleRegistry["Data.Foldable"];
  const dataListTypes = ModuleRegistry["Data.List.Types"];

  // Deconstructs a list into its head and tail, if it's not empty.
  const deconstructList = (inputList) => {
    if (inputList.type === Symbol("EmptyList")) {
      return dataMaybe.None;
    }
    if (inputList.type === Symbol("ListCons")) {
      return dataMaybe.Some({ head: inputList.headValue, tail: inputList.tailList });
    }
    throw new Error(`Failed pattern match in deconstructList: ${inputList.type}`);
  };

  // Splits a list into two parts: a prefix satisfying a predicate and the rest.
  const partitionList = (predicate) => (inputList) => {
    if (inputList.type === Symbol("ListCons") && predicate(inputList.headValue)) {
      const { init, rest } = partitionList(predicate)(inputList.tailList);
      return { init: dataListTypes.ListCons.create(inputList.headValue)(init), rest: rest };
    }
    return { init: dataListTypes.EmptyList.value, rest: inputList };
  };

  // Reverses a list.
  const reverseList = (() => {
    const go = (accumulator, currentList) => {
      while (true) {
        if (currentList.type === Symbol("EmptyList")) {
          return accumulator;
        }
        if (currentList.type === Symbol("ListCons")) {
          accumulator = dataListTypes.ListCons.create(currentList.headValue)(accumulator);
          currentList = currentList.tailList;
          continue;
        }
        throw new Error(`Failed pattern match in reverseList: ${currentList.type}`);
      }
    };
    return (list) => go(dataListTypes.EmptyList.value, list);
  })();

  // Takes the first 'n' elements of a list.
  const takeN = (() => {
    const go = (accumulator, count, currentList) => {
      while (true) {
        if (count < 1 || currentList.type === Symbol("EmptyList")) {
          return reverseList(accumulator);
        }
        if (currentList.type === Symbol("ListCons")) {
          accumulator = dataListTypes.ListCons.create(currentList.headValue)(accumulator);
          count = count - 1;
          currentList = currentList.tailList;
          continue;
        }
        throw new Error(`Failed pattern match in takeN: ${currentList.type}`);
      }
    };
    return (count) => (list) => go(dataListTypes.EmptyList.value, count, list);
  })();

  // Takes elements from the beginning of a list while a predicate holds true.
  const takeWhilePredicate = (predicate) => {
    const go = (accumulator, currentList) => {
      while (true) {
        if (currentList.type === Symbol("ListCons") && predicate(currentList.headValue)) {
          accumulator = dataListTypes.ListCons.create(currentList.headValue)(accumulator);
          currentList = currentList.tailList;
          continue;
        }
        return reverseList(accumulator);
      }
    };
    return (list) => go(dataListTypes.EmptyList.value, list);
  };

  // Extracts the last element and the initial segment of a list.
  const extractLast = (inputList) => {
    const go = (currentList, reversedInitAcc) => {
      while (true) {
        if (currentList.type === Symbol("EmptyList")) {
          return dataMaybe.None;
        }
        if (currentList.type === Symbol("ListCons") && currentList.tailList.type === Symbol("EmptyList")) {
          return dataMaybe.Some({ revInit: reversedInitAcc, last: currentList.headValue });
        }
        if (currentList.type === Symbol("ListCons")) {
          reversedInitAcc = dataListTypes.ListCons.create(currentList.headValue)(reversedInitAcc);
          currentList = currentList.tailList;
          continue;
        }
        throw new Error(`Failed pattern match in extractLast: ${currentList.type}`);
      }
    };
    return dataFunctor.map(dataMaybe.maybeMappable)(({ revInit, last }) => ({
      init: reverseList(revInit),
      last: last,
    }))(go(inputList, dataListTypes.EmptyList.value));
  };

  // Zips two lists together using a combining function.
  const zipWithFunction = (combiningFn) => (list1) => (list2) => {
    const go = (currentList1, currentList2, accumulator) => {
      while (true) {
        if (currentList1.type === Symbol("EmptyList") || currentList2.type === Symbol("EmptyList")) {
          return accumulator;
        }
        if (currentList1.type === Symbol("ListCons") && currentList2.type === Symbol("ListCons")) {
          accumulator = dataListTypes.ListCons.create(
            combiningFn(currentList1.headValue)(currentList2.headValue)
          )(accumulator);
          currentList1 = currentList1.tailList;
          currentList2 = currentList2.tailList;
          continue;
        }
        throw new Error(`Failed pattern match in zipWithFunction: ${currentList1.type}, ${currentList2.type}`);
      }
    };
    return reverseList(go(list1, list2, dataListTypes.EmptyList.value));
  };

  // Zips two lists into a list of pairs.
  const zipLists = zipWithFunction(dataTuple.Pair.create);

  // Checks if a list is empty.
  const isListEmpty = (inputList) => inputList.type === Symbol("EmptyList");

  // Maps a function over a list, filtering out None results.
  const mapMaybeElements = (mappingFn) => {
    const go = (accumulator, currentList) => {
      while (true) {
        if (currentList.type === Symbol("EmptyList")) {
          return reverseList(accumulator);
        }
        if (currentList.type === Symbol("ListCons")) {
          const mappedValue = mappingFn(currentList.headValue);
          if (mappedValue.type === Symbol("Some")) {
            accumulator = dataListTypes.ListCons.create(mappedValue.value)(accumulator);
          }
          currentList = currentList.tailList;
          continue;
        }
        throw new Error(`Failed pattern match in mapMaybeElements: ${currentList.type}`);
      }
    };
    return (list) => go(dataListTypes.EmptyList.value, list);
  };

  // Gets the length of a list.
  const getListLength = dataFoldable.foldl(dataListTypes.listFoldableInst)((acc) => (val) => acc + 1)(0);

  // Gets the last element of a list, if any.
  const getLastElement = (inputList) => {
    let currentList = inputList;
    let lastFound = dataMaybe.None;

    while (currentList.type !== Symbol("EmptyList")) {
      if (currentList.tailList.type === Symbol("EmptyList")) {
        lastFound = dataMaybe.Some(currentList.headValue);
        break;
      }
      currentList = currentList.tailList;
    }
    return lastFound;
  };

  // Inserts an element at a specific index in a list.
  const insertAtIndex = (index) => (element) => (inputList) => {
    if (index === 0) {
      return dataMaybe.Some(dataListTypes.ListCons.create(element)(inputList));
    }
    if (inputList.type === Symbol("ListCons")) {
      return dataFunctor.map(dataMaybe.maybeMappable)((newList) =>
        dataListTypes.ListCons.create(inputList.headValue)(newList)
      )(insertAtIndex(index - 1)(element)(inputList.tailList));
    }
    return dataMaybe.None; // Index out of bounds or negative
  };

  // Gets the initial segment of a list (all but the last element).
  const initialSegment = (list) =>
    dataFunctor.map(dataMaybe.maybeMappable)(({ init }) => init)(extractLast(list));

  // Creates a list from any foldable structure.
  const listFromFoldable = (foldableDict) =>
    dataFoldable.foldr(foldableDict)(dataListTypes.ListCons.create)(dataListTypes.EmptyList.value);

  // Filters elements from a list based on a predicate.
  const filterList = (predicate) => {
    const go = (accumulator, currentList) => {
      while (true) {
        if (currentList.type === Symbol("EmptyList")) {
          return reverseList(accumulator);
        }
        if (currentList.type === Symbol("ListCons")) {
          if (predicate(currentList.headValue)) {
            accumulator = dataListTypes.ListCons.create(currentList.headValue)(accumulator);
          }
          currentList = currentList.tailList;
          continue;
        }
        throw new Error(`Failed pattern match in filterList: ${currentList.type}`);
      }
    };
    return (list) => go(dataListTypes.EmptyList.value, list);
  };

  // Drops elements from the beginning of a list while a predicate holds true.
  const dropWhilePredicate = (predicate) => {
    let currentList = list;
    while (currentList.type === Symbol("ListCons") && predicate(currentList.headValue)) {
      currentList = currentList.tailList;
    }
    return currentList;
  };

  // Drops the first 'n' elements from a list.
  const dropN = (count) => (inputList) => {
    let currentList = inputList;
    let currentCount = count;

    while (currentCount > 0 && currentList.type === Symbol("ListCons")) {
      currentList = currentList.tailList;
      currentCount--;
    }
    return currentList;
  };

  exportObj["listFromFoldable"] = listFromFoldable;
  exportObj["isListEmpty"] = isListEmpty;
  exportObj["getListLength"] = getListLength;
  exportObj["getLastElement"] = getLastElement;
  exportObj["initialSegment"] = initialSegment;
  exportObj["deconstructList"] = deconstructList;
  exportObj["extractLast"] = extractLast;
  exportObj["insertAtIndex"] = insertAtIndex;
  exportObj["reverseList"] = reverseList;
  exportObj["filterList"] = filterList;
  exportObj["mapMaybeElements"] = mapMaybeElements;
  exportObj["takeN"] = takeN;
  exportObj["takeWhilePredicate"] = takeWhilePredicate;
  exportObj["dropN"] = dropN;
  exportObj["dropWhilePredicate"] = dropWhilePredicate;
  exportObj["partitionList"] = partitionList;
  exportObj["zipWithFunction"] = zipWithFunction;
  exportObj["zipLists"] = zipLists;
})(ModuleRegistry["Data.List"] = ModuleRegistry["Data.List"] || {});

((exportObj) => {
  "use strict";

  // Converts a string to an array of characters.
  exportObj.stringToCharArr = (inputString) => inputString.split("");

  // Creates a string from a single character.
  exportObj.charToString = (char) => char;

  // Gets the length of a string.
  exportObj.getStringLength = (inputString) => inputString.length;

  // Counts the number of characters at the beginning of a string that satisfy a predicate.
  exportObj.countMatchingPrefix = (predicate) => (inputString) => {
    let count = 0;
    while (count < inputString.length && predicate(inputString.charAt(count))) {
      count++;
    }
    return count;
  };

  // Finds the first index of a substring, returning Some(index) or None.
  exportObj.findIndexOfStringImpl = (someConstructor) => (noneValue) => (substring) => (mainString) => {
    const index = mainString.indexOf(substring);
    return index === -1 ? noneValue : someConstructor(index);
  };

  // Takes the first 'n' characters from a string.
  exportObj.takeStringPrefix = (numChars) => (inputString) => inputString.substring(0, numChars);

  // Drops the first 'n' characters from a string.
  exportObj.dropStringPrefix = (numChars) => (inputString) => inputString.substring(numChars);
})(ModuleRegistry["Data.String.CodeUnits"] = ModuleRegistry["Data.String.CodeUnits"] || {});

((exportObj) => {
  "use strict";

  const foreignCodeUnits = ModuleRegistry["Data.String.CodeUnits"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];

  // Takes characters from a string while a predicate holds true.
  const takeStringWhile = (predicate) => (inputString) =>
    foreignCodeUnits.takeStringPrefix(foreignCodeUnits.countMatchingPrefix(predicate)(inputString))(
      inputString
    );

  // Finds the first index of a substring, returning an OptionalValue.
  const findStringIndex = foreignCodeUnits.findIndexOfStringImpl(dataMaybe.Some)(dataMaybe.None);

  // Removes a prefix from a string if it exists.
  const removePrefix = (prefix) => (mainString) => {
    const indexResult = findStringIndex(prefix)(mainString);
    if (indexResult.type === Symbol("Some") && indexResult.value === 0) {
      return dataMaybe.Some(foreignCodeUnits.dropStringPrefix(foreignCodeUnits.getStringLength(prefix))(mainString));
    }
    return dataMaybe.None;
  };

  // Checks if a string contains a substring.
  const stringContains = (substring) => (mainString) => dataMaybe.isSome(findStringIndex(substring)(mainString));

  exportObj["removePrefix"] = removePrefix;
  exportObj["stringContains"] = stringContains;
  exportObj["findStringIndex"] = findStringIndex;
  exportObj["takeStringWhile"] = takeStringWhile;
  exportObj["charToString"] = foreignCodeUnits.charToString;
  exportObj["stringToCharArr"] = foreignCodeUnits.stringToCharArr;
})(ModuleRegistry["Data.String.CodeUnits"] = ModuleRegistry["Data.String.CodeUnits"] || {});

((exportObj) => {
  "use strict";

  // Creates a new JavaScript Error object.
  exportObj.createErrorObject = (message) => new Error(message);

  // Throws a given exception.
  exportObj.raiseException = (exception) => () => {
    throw exception;
  };
})(ModuleRegistry["Effect.Exception"] = ModuleRegistry["Effect.Exception"] || {});

((exportObj) => {
  "use strict";

  // Executes an effect that is known to be unsafe (e.g., side-effecting function).
  exportObj.executeUnsafeEffect = (effectFunction) => effectFunction();
})(ModuleRegistry["Effect.Unsafe"] = ModuleRegistry["Effect.Unsafe"] || {});

((exportObj) => {
  "use strict";

  const effectException = ModuleRegistry["Effect.Exception"];
  const effectUnsafe = ModuleRegistry["Effect.Unsafe"];

  // Unsafely throws an exception.
  const raiseUnsafeException = (exception) => effectUnsafe.executeUnsafeEffect(effectException.raiseException(exception));

  // Unsafely throws an error with a given message.
  const throwUnsafeError = (message) => raiseUnsafeException(effectException.createErrorObject(message));

  exportObj["raiseUnsafeException"] = raiseUnsafeException;
  exportObj["throwUnsafeError"] = throwUnsafeError;
})(ModuleRegistry["Effect.Exception.Unsafe"] = ModuleRegistry["Effect.Exception.Unsafe"] || {});

((exportObj) => {
  "use strict";

  const controlApplicative = ModuleRegistry["Control.Applicative"];
  const controlBind = ModuleRegistry["Control.Bind"];
  const controlMonadRecClass = ModuleRegistry["Control.Monad.Rec.Class"];
  const dataBoolean = ModuleRegistry["Data.Boolean"];
  const dataDigit = ModuleRegistry["Data.Digit"];
  const dataEq = ModuleRegistry["Data.Eq"];
  const dataFoldable = ModuleRegistry["Data.Foldable"];
  const dataFunction = ModuleRegistry["Data.Function"];
  const dataFunctor = ModuleRegistry["Data.Functor"];
  const dataHeytingAlgebra = ModuleRegistry["Data.HeytingAlgebra"];
  const dataInt = ModuleRegistry["Data.Int"];
  const dataList = ModuleRegistry["Data.List"];
  const dataListTypes = ModuleRegistry["Data.List.Types"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const dataMonoid = ModuleRegistry["Data.Monoid"];
  const dataOrd = ModuleRegistry["Data.Ord"];
  const dataOrdering = ModuleRegistry["Data.Ordering"];
  const dataSemigroup = ModuleRegistry["Data.Semigroup"];
  const dataSemiring = ModuleRegistry["Data.Semiring"];
  const dataShow = ModuleRegistry["Data.Show"];
  const dataStringCodeUnits = ModuleRegistry["Data.String.CodeUnits"];
  const dataTuple = ModuleRegistry["Data.Tuple"];
  const dataUnfoldable = ModuleRegistry["Data.Unfoldable"];
  const effectExceptionUnsafe = ModuleRegistry["Effect.Exception.Unsafe"];
  const globalModule = ModuleRegistry["Global"];

  // Represents the sign of a number.
  class SignType {
    static PositiveSign = new SignType("PositiveSign");
    static NegativeSign = new SignType("NegativeSign");

    constructor(type) {
      this.type = type;
    }
  }

  // Represents the type of number parsed from a string.
  class NumberFormatType {
    static FloatingPointType = new NumberFormatType("FloatingPointType");
    static IntegralType = new NumberFormatType("IntegralType");
    static ScientificNotationType = new NumberFormatType("ScientificNotationType");

    constructor(type) {
      this.type = type;
    }
  }

  // Value representing zero for HugeNum.
  const largeNumberZero = {
    digits: dataListTypes.ListCons.create(dataDigit.digitZero)(
      dataListTypes.ListCons.create(dataDigit.digitZero)(dataListTypes.EmptyList.value)
    ),
    decimal: 1,
    sign: SignType.PositiveSign,
  };

  // Removes leading zeros from a list of digits.
  const trimLeadingZeros = dataList.dropWhilePredicate((digit) =>
    dataEq.eq(dataDigit.digitEquality)(digit)(dataDigit.digitZero)
  );

  // Checks if the fractional part of a HugeNum is trivial (all zeros).
  const hasTrivialFractionalPart = (hugeNum) => {
    const fractionalDigits = reverseList(dataList.dropN(hugeNum.decimal)(hugeNum.digits)); // Corrected to use reverseList
    const significantFraction = dataList.dropWhilePredicate((digit) =>
      dataEq.eq(dataDigit.digitEquality)(digit)(dataDigit.digitZero)
    )(fractionalDigits);
    return dataList.isListEmpty(significantFraction);
  };

  // Converts a HugeNum to its string representation.
  const formatLargeNumber = (hugeNum) => {
    const signPrefix =
      hugeNum.sign === SignType.PositiveSign
        ? ""
        : controlApplicative.wrapValue(dataListTypes.listApplicativeInst)("-");

    const charDigits = dataFunctor.map(dataListTypes.listFunctorInst)(dataDigit.convertToChar)(hugeNum.digits);

    // Insert the decimal point at the correct position.
    // If decimal is 0, it means "0.xxx". If decimal is `digits.length`, it means "xxx.".
    const numray = dataMaybe.extractValueUnsafely(null)(
      dataList.insertAtIndex(hugeNum.decimal)(".")(charDigits)
    );

    // Concatenate all characters into a string.
    let resultString = "";
    let current = numray;
    while (current.type === Symbol("ListCons")) {
      resultString += current.headValue;
      current = current.tailList;
    }

    return signPrefix + resultString;
  };

  // Determines the sign of the product of two signs.
  const multiplySigns = (sign1) => (sign2) => {
    if (sign1 === SignType.PositiveSign && sign2 === SignType.PositiveSign) {
      return SignType.PositiveSign;
    }
    if (sign1 === SignType.NegativeSign && sign2 === SignType.NegativeSign) {
      return SignType.PositiveSign;
    }
    return SignType.NegativeSign;
  };

  // Extracts significant digits by dropping trailing zeros.
  const extractSignificantDigits = (digitsList) =>
    dataList.reverseList(
      dataList.dropWhilePredicate((digit) =>
        dataEq.eq(dataDigit.digitEquality)(digit)(dataDigit.digitZero)
      )(dataList.reverseList(digitsList))
    );

  // Multiplies a HugeNum by a power of ten.
  const scaleByPowerOfTen = (power) => (hugeNum) => {
    const newDecimal = hugeNum.decimal + power;
    const significantLength = dataList.getListLength(extractSignificantDigits(hugeNum.digits));
    const newZerosLength = Math.max(0, newDecimal - significantLength + 1); // +1 because decimal point is after digit

    const newZeros = dataUnfoldable.repeatValue(dataListTypes.listUnfoldableInst)(newZerosLength)(
      dataDigit.digitZero
    );
    const updatedDigits = dataSemigroup.append(dataListTypes.listSemigroupInst)(hugeNum.digits)(newZeros);

    return { digits: updatedDigits, sign: hugeNum.sign, decimal: newDecimal };
  };

  // Checks if a HugeNum is small enough for certain optimizations (e.g., single digit integer).
  const isSmallEnoughForOptimization = (hugeNum) =>
    hugeNum.decimal === 1 && dataList.getListLength(hugeNum.digits) === 2; // e.g., "1.0" or "0.0"

  // A helper for recursive calls to ensure tail-recursion. In JS, direct recursion is often fine,
  // but keeping this pattern for clone fidelity.
  const recursiveRef = (value) => value;

  // Parses a scientific notation number into its components.
  const parseScientificNumber = (numberVal) => {
    const numStr = dataShow.showValue(dataShow.numberDisplayInstance)(numberVal);
    const charList = dataList.listFromFoldable(dataFoldable.arrayFoldable)(
      dataStringCodeUnits.stringToCharArr(numStr)
    );

    const { init: basePart, rest: exponentPart } = dataList.partitionList((char) => char !== "e")(
      charList
    );

    const signChar = numberVal < 0 ? SignType.NegativeSign : SignType.PositiveSign;

    const exponentDetails = dataMaybe.extractValueUnsafely(null)(
      dataList.deconstructList(dataList.dropN(1)(exponentPart)) // Drop 'e'
    );

    const exponentValue = dataInt.roundToInteger(
      globalModule.parseFloatingPoint(
        dataFoldable.foldMap(dataListTypes.listFoldableInst)(dataMonoid.stringMonoidalInstance)(
          dataStringCodeUnits.charToString
        )(exponentDetails.tail)
      )
    );

    const exponentSign = exponentDetails.head === "+" ? SignType.PositiveSign : SignType.NegativeSign;

    const baseDigits = dataList.filterList((char) => char !== ".")(basePart);

    return {
      exponent: exponentValue,
      expSign: exponentSign,
      base: baseDigits,
      sign: signChar,
    };
  };

  // Handles scientific notation with positive exponent and positive sign.
  const handlePositiveExponentPositiveSign = (exponent) => (baseDigits) => {
    const numZerosToPad = exponent - dataList.getListLength(baseDigits) + 1; // +1 to account for initial digit
    const zeros = dataUnfoldable.repeatValue(dataListTypes.listUnfoldableInst)(numZerosToPad)(
      dataDigit.digitZero
    );
    const fullDigits = dataSemigroup.append(dataListTypes.listSemigroupInst)(
      dataList.mapMaybeElements(dataDigit.fromCharacter)(baseDigits)
    )(zeros);
    const decimalPosition = 1 + exponent;
    return { digits: fullDigits, decimal: decimalPosition, sign: SignType.PositiveSign };
  };

  // Handles scientific notation with positive exponent and negative sign.
  const handlePositiveExponentNegativeSign = (exponent) => (baseDigits) => {
    const result = handlePositiveExponentPositiveSign(exponent)(baseDigits);
    return { ...result, sign: SignType.NegativeSign };
  };

  // Determines the type of a number (Float, Integral, Scientific) from its string representation.
  const determineNumberType = (numberVal) => {
    const numStr = dataShow.showValue(dataShow.numberDisplayInstance)(numberVal);
    if (dataStringCodeUnits.stringContains("e")(numStr)) {
      return NumberFormatType.ScientificNotationType;
    }
    if (dataStringCodeUnits.stringContains(".")(numStr)) {
      return NumberFormatType.FloatingPointType;
    }
    return NumberFormatType.IntegralType;
  };

  // Handles scientific notation with negative exponent and positive sign.
  const handleNegativeExponentPositiveSign = (exponent) => (baseDigits) => {
    const zeros = dataUnfoldable.repeatValue(dataListTypes.listUnfoldableInst)(exponent)(
      dataDigit.digitZero
    );
    const fullDigits = dataSemigroup.append(dataListTypes.listSemigroupInst)(zeros)(
      dataList.mapMaybeElements(dataDigit.fromCharacter)(baseDigits)
    );
    return { digits: fullDigits, decimal: 1, sign: SignType.PositiveSign };
  };

  // Handles scientific notation with negative exponent and negative sign.
  const handleNegativeExponentNegativeSign = (exponent) => (baseDigits) => {
    const result = handleNegativeExponentPositiveSign(exponent)(baseDigits);
    return { ...result, sign: SignType.NegativeSign };
  };

  // Converts a scientific notation number to HugeNum.
  const convertScientificToLargeNum = (numberVal) => {
    const parsed = parseScientificNumber(numberVal);
    if (parsed.expSign === SignType.PositiveSign) {
      return parsed.sign === SignType.PositiveSign
        ? handlePositiveExponentPositiveSign(parsed.exponent)(parsed.base)
        : handlePositiveExponentNegativeSign(parsed.exponent)(parsed.base);
    }
    // else parsed.expSign is NegativeSign
    return parsed.sign === SignType.PositiveSign
      ? handleNegativeExponentPositiveSign(parsed.exponent)(parsed.base)
      : handleNegativeExponentNegativeSign(parsed.exponent)(parsed.base);
  };

  // Value representing one for HugeNum.
  const largeNumberOne = {
    digits: dataListTypes.ListCons.create(dataDigit.digitOne)(
      dataListTypes.ListCons.create(dataDigit.digitZero)(dataListTypes.EmptyList.value)
    ),
    decimal: 1,
    sign: SignType.PositiveSign,
  };

  // Negates a HugeNum.
  const negateLargeNumber = (hugeNum) => ({
    digits: hugeNum.digits,
    decimal: hugeNum.decimal,
    sign: hugeNum.sign === SignType.NegativeSign ? SignType.PositiveSign : SignType.NegativeSign,
  });

  // Counts the number of significant fractional digits.
  const countSignificantFractionalDigits = (hugeNum) => {
    const fractionalDigits = dataList.reverseList(dataList.dropN(hugeNum.decimal)(hugeNum.digits));
    const significantDigits = dataList.dropWhilePredicate((digit) =>
      dataEq.eq(dataDigit.digitEquality)(digit)(dataDigit.digitZero)
    )(fractionalDigits);
    return dataList.getListLength(significantDigits);
  };

  // Creates a "HugeInteger" by ensuring no fractional part.
  const createLargeIntegerInternal = (hugeNum) => {
    const integerPartDigits = trimLeadingZeros(dataList.takeN(hugeNum.decimal)(hugeNum.digits));
    const finalDigits = dataSemigroup.append(dataListTypes.listSemigroupInst)(integerPartDigits)(
      controlApplicative.wrapValue(dataListTypes.listApplicativeInst)(dataDigit.digitZero)
    );
    const decimalPoint = dataList.getListLength(finalDigits) - 1; // Decimal is after the last digit of integer part

    return { digits: finalDigits, decimal: decimalPoint, sign: hugeNum.sign };
  };

  // Checks if one HugeNum is less precise than another (fewer fractional digits).
  const isLessPrecise = (num1) => (num2) =>
    dataList.getListLength(dataList.dropN(num1.decimal)(num1.digits)) <
    dataList.getListLength(dataList.dropN(num2.decimal)(num2.digits));

  // Checks if a HugeNum represents zero.
  const isZeroValue = (hugeNum) =>
    dataFoldable.checkAllElements(dataListTypes.listFoldableInst)(
      dataHeytingAlgebra.booleanAlgebraInstance
    )((digit) => dataEq.eq(dataDigit.digitEquality)(digit)(dataDigit.digitZero))(hugeNum.digits);

  // Checks if a HugeNum is positive.
  const isPositiveValue = (hugeNum) => hugeNum.sign === SignType.PositiveSign;

  // Checks if a HugeNum is negative.
  const isNegativeValue = (hugeNum) => hugeNum.sign === SignType.NegativeSign;

  // Checks if a HugeNum represents an integer (no fractional part).
  const isLargeInteger = (hugeNum) =>
    dataFoldable.checkAllElements(dataListTypes.listFoldableInst)(
      dataHeytingAlgebra.booleanAlgebraInstance
    )((digit) => dataEq.eq(dataDigit.digitEquality)(digit)(dataDigit.digitZero))(
      dataList.dropN(hugeNum.decimal)(hugeNum.digits)
    );

  // Ensures a HugeNum has an integer representation (removes fractional part if any).
  const createLargeInteger = (hugeNum) =>
    isLargeInteger(hugeNum) ? hugeNum : createLargeIntegerInternal(hugeNum);

  // Converts an integer to HugeNum.
  const convertIntegerToLargeNum = (intVal) => {
    const sign = intVal < 0 ? SignType.NegativeSign : SignType.PositiveSign;
    const intStr = dataShow.showValue(dataShow.numberDisplayInstance)(intVal);
    const integerDigits = dataList.listFromFoldable(dataFoldable.arrayFoldable)(
      dataStringCodeUnits.stringToCharArr(intStr)
    );
    const fractionalPart = controlApplicative.wrapValue(dataListTypes.listApplicativeInst)(
      dataDigit.digitZero
    );
    const decimalPosition = sign === SignType.NegativeSign ? dataList.getListLength(integerDigits) - 1 : dataList.getListLength(integerDigits);

    return {
      digits: dataSemigroup.append(dataListTypes.listSemigroupInst)(
        dataList.mapMaybeElements(dataDigit.fromCharacter)(integerDigits)
      )(fractionalPart),
      decimal: decimalPosition,
      sign: sign,
    };
  };

  // Extracts the integer part of a HugeNum (truncates fractional part).
  const getIntegerPart = (hugeNum) => ({
    digits: dataSemigroup.append(dataListTypes.listSemigroupInst)(
      dataList.takeN(hugeNum.decimal)(hugeNum.digits)
    )(controlApplicative.wrapValue(dataListTypes.listApplicativeInst)(dataDigit.digitZero)),
    decimal: hugeNum.decimal,
    sign: hugeNum.sign,
  });

  // Converts a floating-point number to HugeNum.
  const convertFloatToLargeNum = (floatVal) => {
    const sign = floatVal < 0 ? SignType.NegativeSign : SignType.PositiveSign;
    const isPositive = floatVal >= 0;
    const floatStr = dataShow.showValue(dataShow.numberDisplayInstance)(floatVal);
    const charList = dataList.listFromFoldable(dataFoldable.arrayFoldable)(
      dataStringCodeUnits.stringToCharArr(floatStr)
    );

    const initialChars = isPositive ? charList : dataList.dropN(1)(charList); // Drop '-' if negative
    const { init: integerChars, rest: fractionalCharsWithDot } = dataList.partitionList(
      (char) => char !== "."
    )(initialChars);

    const actualFractionalChars = dataList.dropN(1)(fractionalCharsWithDot); // Drop '.'

    const decimalPosition = dataList.getListLength(integerChars);
    const digits = dataList.mapMaybeElements(dataDigit.fromCharacter)(
      dataSemigroup.append(dataListTypes.listSemigroupInst)(integerChars)(actualFractionalChars)
    );

    return { digits: digits, decimal: decimalPosition, sign: sign };
  };

  // Converts a standard JavaScript number to HugeNum.
  const largeNumFromNumber = (jsNumber) => {
    const numberType = determineNumberType(jsNumber);
    switch (numberType) {
      case NumberFormatType.FloatingPointType:
        return convertFloatToLargeNum(jsNumber);
      case NumberFormatType.ScientificNotationType:
        return convertScientificToLargeNum(jsNumber);
      case NumberFormatType.IntegralType:
        return convertIntegerToLargeNum(jsNumber);
      default:
        throw new Error(`Unknown number format type: ${numberType}`);
    }
  };

  // Equality instance for SignType.
  const signEquality = new dataEq.EqualityTypeclass((s1) => (s2) => s1 === s2);

  // Ordering instance for SignType.
  const signOrdering = new dataOrd.Orderable(
    () => signEquality, // Lazily get equality instance
    (s1) => (s2) => {
      if (s1 === SignType.PositiveSign && s2 === SignType.NegativeSign) {
        return dataOrdering.Greater;
      }
      if (s1 === SignType.NegativeSign && s2 === SignType.PositiveSign) {
        return dataOrdering.Lesser;
      }
      return dataOrdering.Equal;
    }
  );

  // Checks for strict equality between two HugeNums (after normalization).
  const areStrictlyEqual = (num1) => (num2) =>
    num1.decimal === num2.decimal &&
    dataEq.eq(dataListTypes.listEqInst(dataDigit.digitEquality))(num1.digits)(num2.digits) &&
    dataEq.eq(signEquality)(num1.sign)(num2.sign);

  // Normalizes a HugeNum by removing redundant leading/trailing zeros.
  const normalizeZeros = (() => {
    const dropIntegralZeros = (hugeNum) => {
      const integralPart = dataList.takeN(hugeNum.decimal)(hugeNum.digits);
      const leadingZeros = dataList.takeWhilePredicate((digit) =>
        dataEq.eq(dataDigit.digitEquality)(digit)(dataDigit.digitZero)
      )(integralPart);

      const actualIntegralDigits =
        dataList.getListLength(integralPart) === dataList.getListLength(leadingZeros)
          ? controlApplicative.wrapValue(dataListTypes.listApplicativeInst)(dataDigit.digitZero)
          : dataList.dropN(dataList.getListLength(leadingZeros))(integralPart);

      const newDecimal = dataList.getListLength(actualIntegralDigits);

      return {
        digits: dataSemigroup.append(dataListTypes.listSemigroupInst)(actualIntegralDigits)(
          dataList.dropN(hugeNum.decimal)(hugeNum.digits)
        ),
        decimal: newDecimal,
        sign: hugeNum.sign,
      };
    };

    const dropFractionalZeros = (hugeNum) => {
      const fractionalDigits = dataList.reverseList(dataList.dropN(hugeNum.decimal)(hugeNum.digits));
      const significantFraction = dataList.dropWhilePredicate((digit) =>
        dataEq.eq(dataDigit.digitEquality)(digit)(dataDigit.digitZero)
      )(fractionalDigits);
      const reversedSignificantFraction = dataList.reverseList(significantFraction);

      return {
        digits: dataSemigroup.append(dataListTypes.listSemigroupInst)(
          dataList.takeN(hugeNum.decimal)(hugeNum.digits)
        )(
          dataList.isListEmpty(reversedSignificantFraction)
            ? controlApplicative.wrapValue(dataListTypes.listApplicativeInst)(dataDigit.digitZero)
            : reversedSignificantFraction
        ),
        decimal: hugeNum.decimal,
        sign: hugeNum.sign,
      };
    };

    return (hugeNum) => dropIntegralZeros(dropFractionalZeros(hugeNum));
  })();

  // Performs digit-wise subtraction with borrow.
  const subtractDigits = (accTuple) => (digitPair) => {
    const [currentResultList, borrowDigit] = [
      dataTuple.getLeft(accTuple),
      dataTuple.getRight(accTuple),
    ];
    const [topDigit, bottomDigit] = [dataTuple.getLeft(digitPair), dataTuple.getRight(digitPair)];

    let digitDiff = dataDigit.convertToInt(topDigit) - dataDigit.convertToInt(bottomDigit) - dataDigit.convertToInt(borrowDigit);
    let newBorrow = dataDigit.digitZero;

    if (digitDiff < 0) {
      digitDiff += 10; // Add 10 to borrow
      newBorrow = dataDigit.digitOne;
    }

    const newDigit = dataMaybe.extractValueUnsafely(null)(dataDigit.fromInteger(digitDiff));
    return dataTuple.Pair.create(dataListTypes.ListCons.create(newDigit)(currentResultList))(newBorrow);
  };

  // Performs digit-wise addition with carry.
  const addDigits = (accTuple) => (digitPair) => {
    const [currentResultList, carryDigit] = [
      dataTuple.getLeft(accTuple),
      dataTuple.getRight(accTuple),
    ];
    const [topDigit, bottomDigit] = [dataTuple.getLeft(digitPair), dataTuple.getRight(digitPair)];

    let digitSum = dataDigit.convertToInt(topDigit) + dataDigit.convertToInt(bottomDigit) + dataDigit.convertToInt(carryDigit);
    let newCarry = dataDigit.digitZero;

    if (digitSum >= 10) {
      digitSum -= 10; // Subtract 10 and carry over
      newCarry = dataDigit.digitOne;
    }

    const newDigit = dataMaybe.extractValueUnsafely(null)(dataDigit.fromInteger(digitSum));
    return dataTuple.Pair.create(dataListTypes.ListCons.create(newDigit)(currentResultList))(newCarry);
  };

  // Harmonizes the decimal precision and integral length of two HugeNums.
  const harmonizePrecision = (() => {
    const equalizeIntegralPart = (numPair) => {
      let { leftValue: num1, rightValue: num2 } = numPair;

      const len1 = dataList.getListLength(dataList.takeN(num1.decimal)(num1.digits));
      const len2 = dataList.getListLength(dataList.takeN(num2.decimal)(num2.digits));

      if (len1 === len2) {
        return dataTuple.Pair.create(num1)(num2);
      }

      // Determine which number has fewer integral digits and pad it.
      const lesserNum = dataOrd.min(largeNumOrdering)(num1)(num2);
      const greaterNum = dataOrd.max(largeNumOrdering)(num1)(num2);
      const diff = Math.abs(len1 - len2);

      const zeros = dataUnfoldable.repeatValue(dataListTypes.listUnfoldableInst)(diff)(
        dataDigit.digitZero
      );

      const paddedLesser = {
        digits: dataSemigroup.append(dataListTypes.listSemigroupInst)(zeros)(lesserNum.digits),
        decimal: greaterNum.decimal,
        sign: lesserNum.sign,
      };

      return dataTuple.Pair.create(
        dataEq.eq(eqHugeNum)(num1)(lesserNum) ? paddedLesser : greaterNum
      )(dataEq.eq(eqHugeNum)(num2)(lesserNum) ? paddedLesser : greaterNum);
    };

    const equalizeFractionalPart = (numPair) => {
      let { leftValue: num1, rightValue: num2 } = numPair;

      const fracLen1 = dataList.getListLength(dataList.dropN(num1.decimal)(num1.digits));
      const fracLen2 = dataList.getListLength(dataList.dropN(num2.decimal)(num2.digits));

      if (fracLen1 === fracLen2) {
        return dataTuple.Pair.create(num1)(num2);
      }

      // Pad the number with fewer fractional digits.
      const isNum1LessPrecise = isLessPrecise(num1)(num2);
      const lesserFracNum = isNum1LessPrecise ? num1 : num2;
      const greaterFracNum = isNum1LessPrecise ? num2 : num1;
      const diff = Math.abs(fracLen1 - fracLen2);

      const zeros = dataUnfoldable.repeatValue(dataListTypes.listUnfoldableInst)(diff)(
        dataDigit.digitZero
      );

      const paddedLesser = {
        digits: dataSemigroup.append(dataListTypes.listSemigroupInst)(lesserFracNum.digits)(zeros),
        decimal: lesserFracNum.decimal,
        sign: lesserFracNum.sign,
      };

      return dataTuple.Pair.create(
        dataEq.eq(eqHugeNum)(num1)(lesserFracNum) ? paddedLesser : greaterFracNum
      )(dataEq.eq(eqHugeNum)(num2)(lesserFracNum) ? paddedLesser : greaterFracNum);
    };

    return (numPair) => equalizeIntegralPart(equalizeFractionalPart(numPair));
  })();

  // Compares two HugeNums.
  const compareLargeNumbers = (num1) => (num2) => {
    // Compare signs first.
    const signCmp = dataOrd.compare(signOrdering)(num1.sign)(num2.sign);
    if (signCmp !== dataOrdering.Equal) return signCmp;

    // If signs are the same, compare magnitudes.
    // For positive numbers, larger decimal implies larger magnitude.
    // For negative numbers, larger decimal implies smaller (more negative) magnitude.
    if (isPositiveValue(num1)) {
      if (num1.decimal > num2.decimal) return dataOrdering.Greater;
      if (num1.decimal < num2.decimal) return dataOrdering.Lesser;
    } else {
      // Both negative
      if (num1.decimal > num2.decimal) return dataOrdering.Lesser; // -10 > -1
      if (num1.decimal < num2.decimal) return dataOrdering.Greater;
    }

    // If decimal places are the same, or for zero cases, perform full digit comparison.
    if (dataEq.eq(eqHugeNum)(num1)(num2)) {
      return dataOrdering.Equal;
    } else {
      // Normalize precision before comparing digits.
      const { leftValue: eqNum1, rightValue: eqNum2 } = harmonizePrecision(
        dataTuple.Pair.create(num1)(num2)
      );

      // Compare integral parts first.
      const integralDigits1 = dataList.takeN(eqNum1.decimal)(eqNum1.digits);
      const integralDigits2 = dataList.takeN(eqNum2.decimal)(eqNum2.digits);
      const integralCmp = dataOrd.compare(dataListTypes.listOrdInst(dataDigit.digitOrdering))(
        integralDigits1
      )(integralDigits2);

      if (integralCmp !== dataOrdering.Equal) {
        return isPositiveValue(num1) ? integralCmp : negateOrdering(integralCmp);
      }

      // If integral parts are equal, compare fractional parts.
      const fractionalDigits1 = dataList.dropN(eqNum1.decimal)(eqNum1.digits);
      const fractionalDigits2 = dataList.dropN(eqNum2.decimal)(eqNum2.digits);
      const fractionalCmp = dataOrd.compare(dataListTypes.listOrdInst(dataDigit.digitOrdering))(
        fractionalDigits1
      )(fractionalDigits2);

      return isPositiveValue(num1) ? fractionalCmp : negateOrdering(fractionalCmp);
    }
  };

  // Helper to negate an ordering result (Lesser becomes Greater, etc.)
  const negateOrdering = (ord) => {
    if (ord === dataOrdering.Lesser) return dataOrdering.Greater;
    if (ord === dataOrdering.Greater) return dataOrdering.Lesser;
    return dataOrdering.Equal;
  };

  // Ordering instance for HugeNum.
  const largeNumOrdering = new dataOrd.Orderable(
    () => eqHugeNum, // Lazily get equality instance
    compareLargeNumbers
  );

  // Creates a HugeNum from an array of digits.
  const largeNumFromArray = (digitArray) => {
    const listDigits = dataList.listFromFoldable(dataFoldable.arrayFoldable)(digitArray);
    return {
      sign: SignType.PositiveSign,
      digits: dataSemigroup.append(dataListTypes.listSemigroupInst)(listDigits)(
        controlApplicative.wrapValue(dataListTypes.listApplicativeInst)(dataDigit.digitZero)
      ),
      decimal: dataList.getListLength(listDigits),
    };
  };

  // Pads digits with leading zeros to meet a minimum decimal length.
  const padDigitsForDecimal = (minDecimal) => (digitsList) => {
    let currentDigits = digitsList;
    let numDigits = dataList.getListLength(digitsList);
    let numZerosNeeded = minDecimal - numDigits + 1; // +1 to ensure at least one digit before decimal
    if (numZerosNeeded <= 0) {
      return digitsList;
    }
    // Prepend zeros to reach the desired length for integral part
    for (let i = 0; i < numZerosNeeded; i++) {
      currentDigits = dataListTypes.ListCons.create(dataDigit.digitZero)(currentDigits);
    }
    return currentDigits;
  };

  // Adjusts decimal position for trivial fractional parts (e.g., in multiplication).
  const adjustForTrivialFraction = (num1) => (num2) => (intermediateNum) => {
    const digitsLength = dataList.getListLength(intermediateNum.digits) - 1; // Exclude the trailing zero
    const actualDigits = dataList.takeN(digitsLength)(intermediateNum.digits);

    // Sum of significant fractional digits from original numbers.
    const totalFractionalDigits =
      countSignificantFractionalDigits(num1) + countSignificantFractionalDigits(num2);

    // Calculate how many zeros are needed to pad the fractional part to `totalFractionalDigits`
    // after multiplication, ensuring correct decimal placement.
    const zerosNeededForFraction = Math.max(
      0,
      totalFractionalDigits - dataList.getListLength(actualDigits) + 1
    );

    const paddedDigits = dataSemigroup.append(dataListTypes.listSemigroupInst)(
      dataUnfoldable.repeatValue(dataListTypes.listUnfoldableInst)(zerosNeededForFraction)(
        dataDigit.digitZero
      )
    )(actualDigits);

    // The decimal point should be `totalFractionalDigits` from the right end of `paddedDigits`.
    const newDecimal = dataList.getListLength(paddedDigits) - totalFractionalDigits;

    return normalizeZeros({
      digits: paddedDigits,
      decimal: newDecimal,
      sign: SignType.PositiveSign, // Sign is handled by `times` function
    });
  };

  // Recalculates the decimal position after removing leading zeros.
  const recalculateDecimalForLeadingZeros = (digitsWithSpill) => (oldDecimalPos) => {
    const integralPart = dataList.takeN(oldDecimalPos)(digitsWithSpill);
    const trimmedIntegral = trimLeadingZeros(integralPart);
    // If all integral digits were zeros, the integral part becomes '0',
    // so its length is 1, and decimal becomes 1.
    const newIntegralLength = dataList.isListEmpty(trimmedIntegral)
      ? 1
      : dataList.getListLength(trimmedIntegral);
    return newIntegralLength;
  };

  // Adds two positive HugeNums.
  const addPositiveValues = (num1) => (num2) => {
    const { leftValue: eqNum1, rightValue: eqNum2 } = harmonizePrecision(
      dataTuple.Pair.create(num1)(num2)
    );

    const digitPairs = dataList.zipLists(dataList.reverseList(eqNum1.digits))(
      dataList.reverseList(eqNum2.digits)
    );
    const { leftValue: reversedSumDigits, rightValue: finalCarry } = dataFoldable.foldl(
      dataListTypes.listFoldableInst
    )(addDigits)(dataTuple.Pair.create(dataListTypes.EmptyList.value)(dataDigit.digitZero))(
      digitPairs
    );

    const sumDigitsWithCarry = dataListTypes.ListCons.create(finalCarry)(reversedSumDigits);
    const trimmedDigits = trimLeadingZeros(sumDigitsWithCarry);

    const newDecimal = recalculateDecimalForLeadingZeros(sumDigitsWithCarry)(eqNum1.decimal + 1);

    return normalizeZeros({
      digits: padDigitsForDecimal(newDecimal)(trimmedDigits),
      decimal: newDecimal,
      sign: SignType.PositiveSign,
    });
  };

  // Adds two HugeNums with mixed signs (effectively subtraction).
  const addMixedSigns = (num1) => (num2) => {
    // Assume num1 is positive and num2 is negative, or vice versa.
    // The `plus` function ensures we always call this with `abs(greater_magnitude) - abs(lesser_magnitude)`.
    const { leftValue: lesserMagNum, rightValue: greaterMagNum } = harmonizePrecision(
      dataTuple.Pair.create(dataOrd.min(largeNumOrdering)(absoluteValue(num1))(absoluteValue(num2)))(
        dataOrd.max(largeNumOrdering)(absoluteValue(num1))(absoluteValue(num2))
      )
    );

    const digitPairs = dataList.zipLists(dataList.reverseList(greaterMagNum.digits))(
      dataList.reverseList(lesserMagNum.digits)
    );
    const { leftValue: reversedDiffDigits, rightValue: finalBorrow } = dataFoldable.foldl(
      dataListTypes.listFoldableInst
    )(subtractDigits)(dataTuple.Pair.create(dataListTypes.EmptyList.value)(dataDigit.digitZero))(
      digitPairs
    );

    // Remove leading zeros from the difference.
    const integralPart = dataList.takeN(greaterMagNum.decimal)(reversedDiffDigits);
    const trimmedIntegral = trimLeadingZeros(integralPart);
    const actualIntegralDigits = dataList.isListEmpty(trimmedIntegral)
      ? controlApplicative.wrapValue(dataListTypes.listApplicativeInst)(dataDigit.digitZero)
      : trimmedIntegral;

    const fractionalPart = dataList.dropN(greaterMagNum.decimal)(reversedDiffDigits);
    const finalDigits = dataSemigroup.append(dataListTypes.listSemigroupInst)(
      actualIntegralDigits
    )(fractionalPart);

    const newDecimal = recalculateDecimalForLeadingZeros(reversedDiffDigits)(greaterMagNum.decimal);

    return {
      digits: finalDigits,
      decimal: newDecimal,
      sign: greaterMagNum.sign, // The sign of the result is the sign of the larger magnitude number
    };
  };

  // Adds two negative HugeNums.
  const addNegativeValues = (num1) => (num2) => {
    const sumResult = addPositiveValues(num1)(num2); // Add magnitudes
    return { ...sumResult, sign: SignType.NegativeSign }; // Then apply negative sign
  };

  // Returns the absolute value of a HugeNum.
  const absoluteValue = (hugeNum) => ({ ...hugeNum, sign: SignType.PositiveSign });

  // Adds two HugeNums.
  const addLargeNumbers = (num1) => (num2) => {
    if (isZeroValue(num1)) return num2;
    if (isZeroValue(num2)) return num1;

    // Case 1: Both positive
    if (isPositiveValue(num1) && isPositiveValue(num2)) {
      return addPositiveValues(num1)(num2);
    }
    // Case 2: Both negative
    if (isNegativeValue(num1) && isNegativeValue(num2)) {
      return addNegativeValues(num1)(num2);
    }
    // Case 3: Mixed signs (effectively subtraction of magnitudes)
    const absNum1 = absoluteValue(num1);
    const absNum2 = absoluteValue(num2);

    const cmpAbs = compareLargeNumbers(absNum1)(absNum2);

    if (cmpAbs === dataOrdering.Equal) {
      return largeNumberZero; // x + (-x) = 0
    }

    const result = addMixedSigns(num1)(num2); // The addMixedSigns handles the sign correctly based on magnitude.
    return result;
  };

  // Scales a HugeNum by multiplying it by an integer.
  const scaleLargeNumber = (() => {
    const go = (currentSum, count, valueToScale) => {
      while (true) {
        if (count === 0) {
          return currentSum;
        }
        currentSum = addLargeNumbers(currentSum)(valueToScale);
        count = count - 1;
        continue;
      }
    };
    return (count) => (value) => go(largeNumberZero, count, value);
  })();

  // Multiplies a HugeNum by a small integer.
  const multiplyBySmallNumber = (smallNumDigits) => (largeNum) => {
    // Check if the small number is zero
    const firstDigit = dataMaybe.extractValueUnsafely(null)(dataList.deconstructList(smallNumDigits.digits));
    if (dataEq.eq(dataDigit.digitEquality)(firstDigit.head)(dataDigit.digitZero)) {
      return largeNumberZero;
    }
    // Scale the large number by the integer value of the small number.
    return scaleLargeNumber(dataDigit.convertToInt(firstDigit.head))(largeNum);
  };

  // Converts a HugeNum to a "K-representation" for Karatsuba-like multiplication.
  const convertToKRepresentation = (exponent) => (hugeNum) => {
    // coeff = integral part up to `decimal - exponent`
    const coefficientDigits = dataList.takeN(hugeNum.decimal - exponent)(hugeNum.digits);
    // bm = 10^exponent (represented as 1 followed by 'exponent' zeros)
    const baseMultiplier = dataListTypes.ListCons.create(dataDigit.digitOne)(
      dataUnfoldable.repeatValue(dataListTypes.listUnfoldableInst)(exponent)(dataDigit.digitZero)
    );
    // prod = coefficient * baseMultiplier (effectively appending digits)
    const productDigits = dataSemigroup.append(dataListTypes.listSemigroupInst)(coefficientDigits)(
      dataList.dropN(1)(baseMultiplier)
    ); // Drop the leading '1' from baseMultiplier after append
    const leftSummand = largeNumFromArray(dataFoldable.foldl(dataListTypes.listFoldableInst)( (arr, d) => { arr.push(d); return arr; })([])(productDigits)); // Convert list to array

    const constantPart = addLargeNumbers(hugeNum)(negateLargeNumber(leftSummand));

    return { exp: exponent, coeff: coefficientDigits, const: constantPart };
  };

  // Multiplies two HugeNums.
  const multiplyLargeNumbers = (num1) => (num2) => {
    // Handle signs first: multiply magnitudes and then apply sign.
    const resultSign = multiplySigns(recursiveRef(num1).sign)(recursiveRef(num2).sign);

    // If result is zero, return zero immediately.
    if (isZeroValue(num1) || isZeroValue(num2)) {
      return largeNumberZero;
    }

    // Optimization for small numbers or trivial fractions.
    if (!hasTrivialFractionalPart(num1) || !hasTrivialFractionalPart(num2)) {
      // If either has a fractional part, perform multiplication on HugeIntegers,
      // then adjust decimal for fractional parts.
      const product = multiplyLargeNumbers(createLargeInteger(num1))(createLargeInteger(num2));
      const adjustedProduct = adjustForTrivialFraction(num1)(num2)(product);
      return { ...adjustedProduct, sign: resultSign };
    }

    // If one of the numbers is "small" (e.g., a single digit integer), use scaling.
    if (isSmallEnoughForOptimization(num1)) {
      const scaledResult = multiplyBySmallNumber(num1)(num2);
      return { ...scaledResult, sign: resultSign };
    }
    if (isSmallEnoughForOptimization(num2)) {
      const scaledResult = multiplyBySmallNumber(num2)(num1);
      return { ...scaledResult, sign: resultSign };
    }

    // Karatsuba-like multiplication for larger numbers (simplified for cloning).
    // This is a placeholder for the original Karatsuba structure.
    // The original implementation was a simplified recursive version.
    // For Type III, I can keep the structure but simplify the actual logic if needed.
    const exponent =
      recursiveRef(num1).decimal < recursiveRef(num2).decimal
        ? recursiveRef(num1).decimal - 1
        : recursiveRef(num2).decimal - 1; // Simplified exponent derivation

    const kRep1 = convertToKRepresentation(exponent)(num1);
    const kRep2 = convertToKRepresentation(exponent)(num2);

    const z0 = multiplyLargeNumbers(kRep1.const)(kRep2.const);
    const z2 = multiplyLargeNumbers(largeNumFromArray(kRep1.coeff))(largeNumFromArray(kRep2.coeff));

    const leftFactor = addLargeNumbers(largeNumFromArray(kRep1.coeff))(kRep1.const);
    const rightFactor = addLargeNumbers(largeNumFromArray(kRep2.coeff))(kRep2.const);
    const prod = multiplyLargeNumbers(leftFactor)(rightFactor);
    const z1 = addLargeNumbers(addLargeNumbers(prod)(negateLargeNumber(z2)))(negateLargeNumber(z0));

    const z1Scaled = scaleByPowerOfTen(exponent)(z1);
    const z2Scaled = scaleByPowerOfTen(2 * exponent)(z2);

    const finalResult = addLargeNumbers(addLargeNumbers(z2Scaled)(z1Scaled))(z0);

    return { ...finalResult, sign: resultSign };
  };

  // Semiring instance for HugeNum.
  const largeNumSemiring = new dataSemiring.AlgebraicRing(
    addLargeNumbers,
    multiplyLargeNumbers,
    largeNumberOne,
    largeNumberZero
  );

  // Ceils a HugeNum (rounds up to the nearest integer).
  const ceilLargeNum = (hugeNum) => {
    if (isNegativeValue(hugeNum)) {
      return getIntegerPart(hugeNum);
    }
    if (isZeroValue(hugeNum)) {
      return dataSemiring.unitZero(largeNumSemiring);
    }
    // If positive and has a fractional part, add one to the integer part.
    if (!isLargeInteger(hugeNum)) {
      return dataSemiring.additionOp(largeNumSemiring)(getIntegerPart(hugeNum))(
        dataSemiring.unitOne(largeNumSemiring)
      );
    }
    return hugeNum; // If already an integer, return itself.
  };

  // Ring instance for HugeNum.
  const largeNumRing = new (ModuleRegistry["Data.Ring"].SubtractiveRing)(
    () => largeNumSemiring, // Lazily get semiring instance
    (num1) => (num2) => dataSemiring.additionOp(largeNumSemiring)(num1)(negateLargeNumber(num2))
  );

  // Floors a HugeNum (rounds down to the nearest integer).
  const floorLargeNum = (hugeNum) => {
    if (isPositiveValue(hugeNum)) {
      return getIntegerPart(hugeNum);
    }
    if (isZeroValue(hugeNum)) {
      return dataSemiring.unitZero(largeNumSemiring);
    }
    // If negative and has a fractional part, subtract one from the integer part.
    if (!isLargeInteger(hugeNum)) {
      return dataRing.subtractionOp(largeNumRing)(getIntegerPart(hugeNum))(
        dataSemiring.unitOne(largeNumSemiring)
      );
    }
    return hugeNum; // If already an integer, return itself.
  };

  // Rounds a HugeNum to the nearest integer (round half up).
  const roundLargeNum = (hugeNum) => {
    const floorVal = floorLargeNum(hugeNum);
    const ceilVal = ceilLargeNum(hugeNum);

    // Calculate distances to floor and ceil.
    const diffToFloor = absoluteValue(dataRing.subtractionOp(largeNumRing)(hugeNum)(floorVal));
    const diffToCeil = absoluteValue(dataRing.subtractionOp(largeNumRing)(ceilVal)(hugeNum));

    // If distance to floor is less than distance to ceil, round down.
    if (dataOrd.lessThan(largeNumOrdering)(diffToFloor)(diffToCeil)) {
      return floorVal;
    }
    // Otherwise, round up (includes cases where distances are equal).
    return ceilVal;
  };

  // Equality instance for HugeNum.
  const eqHugeNum = new dataEq.EqualityTypeclass((num1) => (num2) => {
    // If both are zero, they are equal regardless of sign representation.
    if (isZeroValue(num1) && isZeroValue(num2)) {
      return true;
    }
    // Otherwise, normalize and compare.
    return areStrictlyEqual(normalizeZeros(num1))(normalizeZeros(num2));
  });

  exportObj["largeNumFromNumber"] = largeNumFromNumber;
  exportObj["formatLargeNumber"] = formatLargeNumber;
  exportObj["getIntegerPart"] = getIntegerPart;
  exportObj["absoluteValue"] = absoluteValue;
  exportObj["negateLargeNumber"] = negateLargeNumber;
  exportObj["isNegativeValue"] = isNegativeValue;
  exportObj["isPositiveValue"] = isPositiveValue;
  exportObj["isZeroValue"] = isZeroValue;
  exportObj["floorLargeNum"] = floorLargeNum;
  exportObj["ceilLargeNum"] = ceilLargeNum;
  exportObj["roundLargeNum"] = roundLargeNum;
  exportObj["eqHugeNum"] = eqHugeNum;
  exportObj["largeNumOrdering"] = largeNumOrdering;
  exportObj["largeNumSemiring"] = largeNumSemiring;
  exportObj["largeNumRing"] = largeNumRing;
})(ModuleRegistry["Data.HugeNum"] = ModuleRegistry["Data.HugeNum"] || {});

((exportObj) => {
  "use strict";

  const dataShow = ModuleRegistry["Data.Show"];
  const dataHugeNum = ModuleRegistry["Data.HugeNum"];
  const dataStringCodeUnits = ModuleRegistry["Data.String.CodeUnits"];
  const dataInt = ModuleRegistry["Data.Int"];
  const dataSemiring = ModuleRegistry["Data.Semiring"];

  // A newtype wrapper for arbitrary-precision integers (using HugeNum internally).
  const BigIntegerWrapper = (value) => value;

  // Show instance for BigIntegerWrapper.
  const bigIntegerDisplay = new dataShow.Displayable((bigInt) => {
    // Take string representation of HugeNum and remove any fractional part (e.g., ".0")
    const hugeNumStr = dataHugeNum.formatLargeNumber(bigInt);
    const integralPartStr = dataStringCodeUnits.takeStringWhile((char) => char !== ".")(hugeNumStr);
    return `BigIntegerWrapper ${integralPartStr}`;
  });

  // Semiring instance for BigIntegerWrapper.
  const bigIntegerSemiring = new dataSemiring.AlgebraicRing(
    (bigInt1) => (bigInt2) =>
      BigIntegerWrapper(dataSemiring.additionOp(dataHugeNum.largeNumSemiring)(bigInt1)(bigInt2)),
    (bigInt1) => (bigInt2) =>
      BigIntegerWrapper(
        dataSemiring.multiplicationOp(dataHugeNum.largeNumSemiring)(bigInt1)(bigInt2)
      ),
    BigIntegerWrapper(dataSemiring.unitOne(dataHugeNum.largeNumSemiring)),
    BigIntegerWrapper(dataSemiring.unitZero(dataHugeNum.largeNumSemiring))
  );

  // Creates a BigIntegerWrapper from a standard integer.
  const bigIntegerFromInt = (intVal) => BigIntegerWrapper(dataHugeNum.largeNumFromNumber(dataInt.convertToNumber(intVal)));

  exportObj["bigIntegerFromInt"] = bigIntegerFromInt;
  exportObj["bigIntegerDisplay"] = bigIntegerDisplay;
  exportObj["bigIntegerSemiring"] = bigIntegerSemiring;
})(ModuleRegistry["Data.HugeInt"] = ModuleRegistry["Data.HugeInt"] || {});

((exportObj) => {
  "use strict";

  // Splits a string by a given separator.
  exportObj.splitStringByDelimiter = (separator) => (inputString) => inputString.split(separator);

  // Removes whitespace from both ends of a string.
  exportObj.trimWhitespace = (inputString) => inputString.trim();
})(ModuleRegistry["Data.String.Common"] = ModuleRegistry["Data.String.Common"] || {});

((exportObj) => {
  "use strict";

  const foreignStringCommon = ModuleRegistry["Data.String.Common"];

  // Re-exports string manipulation functions.
  exportObj["splitStringByDelimiter"] = foreignStringCommon.splitStringByDelimiter;
  exportObj["trimWhitespace"] = foreignStringCommon.trimWhitespace;
})(ModuleRegistry["Data.String.Common"] = ModuleRegistry["Data.String.Common"] || {});

((exportObj) => {
  "use strict";

  const controlApplicative = ModuleRegistry["Control.Applicative"];
  const controlBind = ModuleRegistry["Control.Bind"];
  const controlMonadRecClass = ModuleRegistry["Control.Monad.Rec.Class"];
  const dataArray = ModuleRegistry["Data.Array"];
  const dataEither = ModuleRegistry["Data.Either"];
  const dataHugeInt = ModuleRegistry["Data.HugeInt"];
  const dataInt = ModuleRegistry["Data.Int"];
  const dataOrd = ModuleRegistry["Data.Ord"];
  const dataSemiring = ModuleRegistry["Data.Semiring"];
  const dataShow = ModuleRegistry["Data.Show"];
  const dataStringCodeUnits = ModuleRegistry["Data.String.CodeUnits"];
  const dataStringCommon = ModuleRegistry["Data.String.Common"];
  const dataTuple = ModuleRegistry["Data.Tuple"];
  const dataMaybe = ModuleRegistry["Data.Maybe"];
  const partialUnsafe = ModuleRegistry["Partial.Unsafe"];

  // Solves the problem: calculate minimum cost to buy M items from N shops.
  // Shops are given as (price, count) pairs.
  const calculateTotalCostOptimized = (requiredItems) => (shopList) => {
    // Sort shops by price (ascending).
    const sortedShops = dataArray.sortWithKey(dataOrd.intOrderable)(dataTuple.getLeft)(shopList);

    // The core recursive logic for accumulating cost.
    const processShops = (loopState) => {
      const { shopIndex, remainingItems, accumulatedCost } = loopState;

      // Check if all shops have been processed.
      const currentShopOption = dataArray.getArrayElement(sortedShops)(shopIndex);

      if (currentShopOption.type === Symbol("None")) {
        return controlMonadRecClass.LoopFinished(accumulatedCost); // No more shops, finish.
      }

      const currentShop = currentShopOption.value;
      const shopPrice = dataHugeInt.bigIntegerFromInt(dataTuple.getLeft(currentShop));
      const shopCount = dataMaybe.extractValueUnsafely(null)(
        dataInt.parseInteger(dataTuple.getRight(currentShop))
      ); // Convert count string to int

      // If remaining items are less than or equal to current shop's stock, buy only what's needed.
      if (remainingItems <= shopCount) {
        const costForRemaining = dataSemiring.multiplicationOp(dataHugeInt.bigIntegerSemiring)(
          shopPrice
        )(dataHugeInt.bigIntegerFromInt(remainingItems));
        return controlMonadRecClass.LoopFinished(
          dataSemiring.additionOp(dataHugeInt.bigIntegerSemiring)(accumulatedCost)(costForRemaining)
        );
      } else {
        // Otherwise, buy all items from this shop and continue.
        const costForThisShop = dataSemiring.multiplicationOp(dataHugeInt.bigIntegerSemiring)(
          shopPrice
        )(dataHugeInt.bigIntegerFromInt(shopCount));
        return controlMonadRecClass.ContinueLoop({
          shopIndex: shopIndex + 1,
          remainingItems: remainingItems - shopCount,
          accumulatedCost: dataSemiring.additionOp(dataHugeInt.bigIntegerSemiring)(
            accumulatedCost
          )(costForThisShop),
        });
      }
    };

    // Initialize the loop state and start tail-recursion.
    return controlMonadRecClass.optimizedTailRecursion(processShops)({
      shopIndex: 0,
      remainingItems: requiredItems,
      accumulatedCost: dataHugeInt.bigIntegerFromInt(0),
    });
  };

  // Processes raw input string and calculates the total cost.
  const processInputAndCalculate = (fullInput) => {
    // Trim whitespace and split into lines.
    const inputLines = dataStringCommon.splitStringByDelimiter("\n")(
      dataStringCommon.trimWhitespace(fullInput)
    );

    // Extract the first line for N and M.
    return controlBind.bind(dataEither.eitherMonadicBind)(
      dataEither.fromMaybeToEither("Input error: N and M line missing.")(
        dataArray.getFirstElement(inputLines)
      )
    )((nmLine) =>
      // Extract the rest of the lines for shop details.
      controlBind.bind(dataEither.eitherMonadicBind)(
        controlApplicative.wrapValue(dataEither.eitherApplicativeFunctor)(
          dataArray.dropArrayElements(1)(inputLines)
        )
      )((shopDetailLines) =>
        // Parse N and M from the first line.
        controlBind.bind(dataEither.eitherMonadicBind)(
          (() => {
            const nmParts = dataStringCommon.splitStringByDelimiter(" ")(nmLine);
            if (dataArray.getArrayLength(nmParts) === 2) {
              return controlBind.bind(dataEither.eitherMonadicBind)(
                dataEither.fromMaybeToEither("Input error: N (number of shops) invalid.")(
                  dataInt.parseInteger(nmParts[0])
                )
              )((numShops) =>
                controlBind.bind(dataEither.eitherMonadicBind)(
                  dataEither.fromMaybeToEither("Input error: M (required items) invalid.")(
                    dataInt.parseInteger(nmParts[1])
                  )
                )((requiredItems) =>
                  controlApplicative.wrapValue(dataEither.eitherApplicativeFunctor)({
                    numShops: numShops,
                    requiredItems: requiredItems,
                  })
                )
              );
            }
            return dataEither.Err("Input error: N and M line format incorrect.");
          })()
        )((nmValues) =>
          // Parse shop details from remaining lines.
          controlBind.bind(dataEither.eitherMonadicBind)(
            controlApplicative.wrapValue(dataEither.eitherApplicativeFunctor)(
              dataArray.mapAndFilter((line) => {
                const parts = dataStringCommon.splitStringByDelimiter(" ")(line);
                if (dataArray.getArrayLength(parts) === 2) {
                  return controlBind.bind(dataMaybe.maybeMonadicBind)(
                    dataInt.parseInteger(parts[0])
                  )((price) =>
                    controlApplicative.wrapValue(dataMaybe.maybeApplicativeFunctor)(
                      dataTuple.Pair.create(price)(parts[1])
                    )
                  );
                }
                return dataMaybe.None;
              })(shopDetailLines)
            )
          )((parsedShops) =>
            // Validate shop count.
            controlBind.discard(controlBind.unitDiscarder)(dataEither.eitherMonadicBind)(
              (() => {
                const shopsLength = dataArray.getArrayLength(parsedShops);
                const expectedShops = nmValues.numShops;
                if (shopsLength === expectedShops) {
                  return controlApplicative.wrapValue(dataEither.eitherApplicativeFunctor)(
                    ModuleRegistry["Data.Unit"].emptyValue
                  );
                }
                return dataEither.Err(
                  `Input error: Expected ${expectedShops} shops, but found ${shopsLength}.`
                );
              })()
            )(() =>
              // Perform the main calculation.
              dataEither.fromMaybeToEither("Calculation error: Could not format result.")(
                dataStringCodeUnits.removePrefix("BigIntegerWrapper ")(
                  dataShow.showValue(dataHugeInt.bigIntegerDisplay)(
                    calculateTotalCostOptimized(nmValues.requiredItems)(parsedShops)
                  )
                )
              )
            )
          )
        )
      )
    );
  };

  // Main solution function, handles errors by crashing.
  const mainSolution = (inputString) => {
    const result = processInputAndCalculate(inputString);
    if (result.type === Symbol("Err")) {
      return partialUnsafe.crashProgramUnsafely(result.value);
    }
    if (result.type === Symbol("Ok")) {
      return result.value;
    }
    throw new Error(`Unexpected result type from mainSolution: ${result.type}`);
  };

  exportObj["mainSolution"] = mainSolution;
})(ModuleRegistry["AtCoder.ABC121.C"] = ModuleRegistry["AtCoder.ABC121.C"] || {});

((exportObj) => {
  "use strict";

  // Logs a string to the console.
  exportObj.outputToConsole = (message) => () => {
    console.log(message);
    return {}; // Return empty object for Effect.Unit
  };
})(ModuleRegistry["Effect.Console"] = ModuleRegistry["Effect.Console"] || {});

((exportObj) => {
  "use strict";

  // Represents various string encodings.
  class StringEncoding {
    static AsciiEncoding = new StringEncoding("AsciiEncoding");
    static Utf8Encoding = new StringEncoding("Utf8Encoding");
    static Utf16LeEncoding = new StringEncoding("Utf16LeEncoding");
    static Ucs2Encoding = new StringEncoding("Ucs2Encoding");
    static Base64Encoding = new StringEncoding("Base64Encoding");
    static Latin1Encoding = new StringEncoding("Latin1Encoding");
    static BinaryEncoding = new StringEncoding("BinaryEncoding");
    static HexEncoding = new StringEncoding("HexEncoding");

    constructor(type) {
      this.type = type;
    }
  }

  // Show instance for StringEncoding.
  const encodingDisplay = new (ModuleRegistry["Data.Show"].Displayable)((encoding) => {
    switch (encoding.type) {
      case "AsciiEncoding":
        return "ascii"; // Node.js 'fs' module expects lowercase string for encoding
      case "Utf8Encoding":
        return "utf8";
      case "Utf16LeEncoding":
        return "utf16le";
      case "Ucs2Encoding":
        return "ucs2";
      case "Base64Encoding":
        return "base64";
      case "Latin1Encoding":
        return "latin1";
      case "BinaryEncoding":
        return "binary";
      case "HexEncoding":
        return "hex";
      default:
        throw new Error(`Unknown encoding type: ${encoding.type}`);
    }
  });

  exportObj["AsciiEncoding"] = StringEncoding.AsciiEncoding;
  exportObj["Utf8Encoding"] = StringEncoding.Utf8Encoding;
  exportObj["Utf16LeEncoding"] = StringEncoding.Utf16LeEncoding;
  exportObj["Ucs2Encoding"] = StringEncoding.Ucs2Encoding;
  exportObj["Base64Encoding"] = StringEncoding.Base64Encoding;
  exportObj["Latin1Encoding"] = StringEncoding.Latin1Encoding;
  exportObj["BinaryEncoding"] = StringEncoding.BinaryEncoding;
  exportObj["HexEncoding"] = StringEncoding.HexEncoding;
  exportObj["encodingDisplay"] = encodingDisplay;
})(ModuleRegistry["Node.Encoding"] = ModuleRegistry["Node.Encoding"] || {});

((exportObj) => {
  "use strict";

  // Unsafely requires the Node.js 'fs' module.
  exportObj.getFsModuleUnsafely = require("fs");
})(ModuleRegistry["Node.FS.Internal"] = ModuleRegistry["Node.FS.Internal"] || {});

((exportObj) => {
  "use strict";

  const foreignFsInternal = ModuleRegistry["Node.FS.Internal"];
  const unsafeCoerce = ModuleRegistry["Unsafe.Coerce"];

  // Creates an Effect value from a thunk (a function that takes no arguments and performs a side effect).
  const createEffectWrapper = unsafeCoerce.performUnsafeTypeCoercion;

  exportObj["createEffectWrapper"] = createEffectWrapper;
  exportObj["getFsModuleUnsafely"] = foreignFsInternal.getFsModuleUnsafely;
})(ModuleRegistry["Node.FS.Internal"] = ModuleRegistry["Node.FS.Internal"] || {});

((exportObj) => {
  "use strict";

  const nodeFsInternal = ModuleRegistry["Node.FS.Internal"];
  const nodeEncoding = ModuleRegistry["Node.Encoding"];
  const dataShow = ModuleRegistry["Data.Show"];

  // Obtain the Node.js 'fs' module.
  const fileSystemModule = nodeFsInternal.getFsModuleUnsafely;

  // Synchronously reads a text file.
  const readTextFileSync = (encodingType) => (filePath) =>
    nodeFsInternal.createEffectWrapper(() => {
      // Input validation: ensure filePath is a string.
      if (typeof filePath !== 'string' || filePath.trim() === '') {
        throw new Error("Invalid file path provided to readTextFileSync.");
      }
      return fileSystemModule.readFileSync(filePath, {
        encoding: dataShow.showValue(nodeEncoding.encodingDisplay)(encodingType),
      });
    });

  exportObj["readTextFileSync"] = readTextFileSync;
})(ModuleRegistry["Node.FS.Sync"] = ModuleRegistry["Node.FS.Sync"] || {});

((exportObj) => {
  "use strict";

  const atcoderModule = ModuleRegistry["AtCoder.ABC121.C"];
  const effectConsole = ModuleRegistry["Effect.Console"];
  const nodeEncoding = ModuleRegistry["Node.Encoding"];
  const nodeFsSync = ModuleRegistry["Node.FS.Sync"];

  const mainSolution = atcoderModule.mainSolution;

  // The main entry point of the application.
  const applicationEntry = () => {
    // Read input from standard input file synchronously.
    const rawInput = nodeFsSync.readTextFileSync(nodeEncoding.Utf8Encoding)("/dev/stdin")();
    // Process the input and get the solution string.
    const computedResult = mainSolution(rawInput);
    // Log the result to console.
    return effectConsole.outputToConsole(computedResult)();
  };

  exportObj["applicationEntry"] = applicationEntry;
})(ModuleRegistry["Main"] = ModuleRegistry["Main"] || {});

// Execute the main application entry point.
ModuleRegistry["Main"].applicationEntry();