var ModuleContainer = {};
// Module for array operations within a functional context
(function (expOutput) {
  "use strict";
  /**
   * Applies a list of functions to a list of values, producing a new list.
   * This is a Cartesian product-like application.
   * @param {Array<Function>} funcList - The array of functions to apply.
   * @returns {Function} A function that takes an array of values.
   */
  expOutput.listOperation = function (funcList) {
    return function (valSet) {
      var lenFunc = funcList.length; // Length of the function array
      var lenVal = valSet.length; // Length of the value array
      var outcomeArr = new Array(lenFunc * lenVal); // Pre-allocate result array
      var idxCount = 0; // Index for the outcome array
      for (var outerIdx = 0; outerIdx < lenFunc; outerIdx++) {
        var currentFunc = funcList[outerIdx]; // Current function to apply
        for (var innerIdx = 0; innerIdx < lenVal; innerIdx++) {
          outcomeArr[idxCount++] = currentFunc(valSet[innerIdx]); // Apply function and store result
        }
      }
      return outcomeArr;
    };
  };
})(ModuleContainer["Logic.Apply"] = ModuleContainer["Logic.Apply"] || {});

// Module for semigroupoid operations (function composition)
(function (expOutput) {
  "use strict";
  /**
   * Represents a semigroupoid, an algebraic structure with an associative composition operation.
   * @constructor
   * @param {Function} compositionFunc - The composition function.
   */
  var OpSet = function (compositionFunc) {
    this.compositionFunc = compositionFunc;
  };
  // Semigroupoid instance for functions, defining function composition
  var opSetFunc = new OpSet(function (firstFunc) {
    return function (secondFunc) {
      return function (inputVal) {
        return firstFunc(secondFunc(inputVal));
      };
    };
  });
  /**
   * Retrieves the composition function from a dictionary.
   * @param {Object} dictionaryRef - The dictionary containing the composition function.
   * @returns {Function} The composition function.
   */
  var combineOp = function (dictionaryRef) {
    return dictionaryRef.compositionFunc;
  };
  expOutput["combineOp"] = combineOp;
  expOutput["OpSet"] = OpSet;
  expOutput["opSetFunc"] = opSetFunc;
})(ModuleContainer["Logic.OpGroup"] = ModuleContainer["Logic.OpGroup"] || {});

// Module for category theory concepts (identity and composition)
(function (expOutput) {
  "use strict";
  var Logic_OpGroup = ModuleContainer["Logic.OpGroup"]; // Import OpGroup module
  /**
   * Represents a Category, extending Semigroupoid with an identity element.
   * @constructor
   * @param {Function} opSetZero - The Semigroupoid instance.
   * @param {Function} idFunc - The identity function.
   */
  var Classify = function (opSetZero, idFunc) {
    this.opSetZero = opSetZero;
    this.idFunc = idFunc;
  };
  /**
   * Retrieves the identity function from a dictionary.
   * @param {Object} dictionaryRef - The dictionary containing the identity function.
   * @returns {Function} The identity function.
   */
  var unitOp = function (dictionaryRef) {
    return dictionaryRef.idFunc;
  };
  // Category instance for functions, using the function semigroupoid and identity function
  var classifyFunc = new Classify(function () {
    return Logic_OpGroup.opSetFunc;
  }, function (inputVal) {
    return inputVal;
  });
  expOutput["Classify"] = Classify;
  expOutput["unitOp"] = unitOp;
  expOutput["classifyFunc"] = classifyFunc;
})(ModuleContainer["Logic.Classify"] = ModuleContainer["Logic.Classify"] || {});

// Module for boolean values (specifically 'otherwise')
(function (expOutput) {
  "use strict";
  // A constant representing a default true condition, often used in pattern matching
  var otherwiseFlag = true;
  expOutput["otherwiseFlag"] = otherwiseFlag;
})(ModuleContainer["Data.Bool"] = ModuleContainer["Data.Bool"] || {});

// Module for equality checks
(function (expOutput) {
  "use strict";
  /**
   * Checks for strict equality between two references.
   * @param {*} refA - The first reference.
   * @returns {Function} A function that takes the second reference.
   */
  expOutput.refEquality = function (refA) {
    return function (refB) {
      return refA === refB;
    };
  };
})(ModuleContainer["Data.Equality"] = ModuleContainer["Data.Equality"] || {});

// Module for Heyting Algebra operations on booleans
(function (expOutput) {
  "use strict";
  /**
   * Performs a boolean AND operation.
   * @param {boolean} valA - The first boolean.
   * @returns {Function} A function that takes the second boolean.
   */
  expOutput.logicAnd = function (valA) {
    return function (valB) {
      return valA && valB;
    };
  };
  /**
   * Performs a boolean OR operation.
   * @param {boolean} valA - The first boolean.
   * @returns {Function} A function that takes the second boolean.
   */
  expOutput.logicOr = function (valA) {
    return function (valB) {
      return valA || valB;
    };
  };
  /**
   * Performs a boolean NOT operation.
   * @param {boolean} val - The boolean to negate.
   * @returns {boolean} The negated boolean.
   */
  expOutput.logicNot = function (val) {
    return !val;
  };
})(ModuleContainer["Data.LogicAlgebra"] = ModuleContainer["Data.LogicAlgebra"] || {});

// Module for a unit type
(function (expOutput) {
  "use strict";
  // The unit value, an empty object
  expOutput.voidValue = {};
})(ModuleContainer["Data.UnitValue"] = ModuleContainer["Data.UnitValue"] || {});

// Module for displaying numbers
(function (expOutput) {
  "use strict";
  /**
   * Converts a number to its string representation.
   * Adds ".0" if it's an integer to ensure float-like representation.
   * @param {number} numVal - The number to display.
   * @returns {string} The string representation.
   */
  expOutput.displayNumImpl = function (numVal) {
    var strRep = numVal.toString();
    return isNaN(strRep + ".0") ? strRep : strRep + ".0";
  };
})(ModuleContainer["Data.Display"] = ModuleContainer["Data.Display"] || {});

// Module for the Show type class (displaying values)
(function (expOutput) {
  "use strict";
  var externalDisplay = ModuleContainer["Data.Display"]; // Import external display functions
  // Placeholder imports, not directly used in this snippet but kept for structure clone
  // var Data_Symbol = ModuleContainer["Data.Symbol"];
  // var Record_Unsafe = ModuleContainer["Record.Unsafe"];
  // var Type_Data_RowList = ModuleContainer["Type.Data.RowList"];

  /**
   * Type class for values that can be converted to a string representation.
   * @constructor
   * @param {Function} displayFunc - The function to convert a value to a string.
   */
  var Display = function (displayFunc) {
    this.displayFunc = displayFunc;
  };
  // Instance for displaying numbers
  var displayNum = new Display(externalDisplay.displayNumImpl);
  /**
   * Calls the display function for a given type class dictionary.
   * @param {Object} dictionaryRef - The Display type class dictionary.
   * @returns {Function} The display function.
   */
  var displayVal = function (dictionaryRef) {
    return dictionaryRef.displayFunc;
  };
  expOutput["Display"] = Display;
  expOutput["displayVal"] = displayVal;
  expOutput["displayNum"] = displayNum;
})(ModuleContainer["Data.Display"] = ModuleContainer["Data.Display"] || {});

// Module for unit type operations
(function (expOutput) {
  "use strict";
  var externalUnit = ModuleContainer["Data.UnitValue"]; // Import external unit value
  var Data_Display = ModuleContainer["Data.Display"]; // Import Display module
  expOutput["voidValue"] = externalUnit.voidValue;
})(ModuleContainer["Data.UnitValue"] = ModuleContainer["Data.UnitValue"] || {});

// Module for Heyting Algebra type class
(function (expOutput) {
  "use strict";
  var externalLogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import external boolean operations
  // Placeholder imports
  // var Data_Symbol = ModuleContainer["Data.Symbol"];
  // var Data_UnitValue = ModuleContainer["Data.UnitValue"];
  // var Record_Unsafe = ModuleContainer["Record.Unsafe"];
  // var Type_Data_Row = ModuleContainer["Type.Data.Row"];
  // var Type_Data_RowList = ModuleContainer["Type.Data.RowList"];

  /**
   * Type class for Heyting algebras.
   * @constructor
   * @param {Function} andOp - Conjunction operation.
   * @param {Function} orOp - Disjunction operation.
   * @param {boolean} falseVal - False element.
   * @param {Function} implyOp - Implication operation.
   * @param {Function} notOp - Negation operation.
   * @param {boolean} truthVal - True element.
   */
  var LogicAlgebra = function (andOp, orOp, falseVal, implyOp, notOp, truthVal) {
    this.andOp = andOp;
    this.orOp = orOp;
    this.falseVal = falseVal;
    this.implyOp = implyOp;
    this.notOp = notOp;
    this.truthVal = truthVal;
  };
  /**
   * Retrieves the true element from a dictionary.
   * @param {Object} dictionaryRef - The LogicAlgebra dictionary.
   * @returns {boolean} The true element.
   */
  var truthVal = function (dictionaryRef) {
    return dictionaryRef.truthVal;
  };
  /**
   * Retrieves the negation operation from a dictionary.
   * @param {Object} dictionaryRef - The LogicAlgebra dictionary.
   * @returns {Function} The negation operation.
   */
  var notOp = function (dictionaryRef) {
    return dictionaryRef.notOp;
  };
  /**
   * Retrieves the implication operation from a dictionary.
   * @param {Object} dictionaryRef - The LogicAlgebra dictionary.
   * @returns {Function} The implication operation.
   */
  var implyOp = function (dictionaryRef) {
    return dictionaryRef.implyOp;
  };
  /**
   * Retrieves the false element from a dictionary.
   * @param {Object} dictionaryRef - The LogicAlgebra dictionary.
   * @returns {boolean} The false element.
   */
  var falseVal = function (dictionaryRef) {
    return dictionaryRef.falseVal;
  };
  /**
   * Retrieves the disjunction operation from a dictionary.
   * @param {Object} dictionaryRef - The LogicAlgebra dictionary.
   * @returns {Function} The disjunction operation.
   */
  var orOp = function (dictionaryRef) {
    return dictionaryRef.orOp;
  };
  // HeytingAlgebra instance for booleans
  var logicAlgebraBool = new LogicAlgebra(
    externalLogicAlgebra.logicAnd,
    externalLogicAlgebra.logicOr,
    false,
    function (valA) {
      return function (valB) {
        return orOp(logicAlgebraBool)(notOp(logicAlgebraBool)(valA))(valB);
      };
    },
    externalLogicAlgebra.logicNot,
    true
  );
  /**
   * Retrieves the conjunction operation from a dictionary.
   * @param {Object} dictionaryRef - The LogicAlgebra dictionary.
   * @returns {Function} The conjunction operation.
   */
  var andOp = function (dictionaryRef) {
    return dictionaryRef.andOp;
  };
  expOutput["LogicAlgebra"] = LogicAlgebra;
  expOutput["truthVal"] = truthVal;
  expOutput["falseVal"] = falseVal;
  expOutput["implyOp"] = implyOp;
  expOutput["andOp"] = andOp;
  expOutput["orOp"] = orOp;
  expOutput["notOp"] = notOp;
  expOutput["logicAlgebraBool"] = logicAlgebraBool;
})(ModuleContainer["Data.LogicAlgebra"] = ModuleContainer["Data.LogicAlgebra"] || {});

// Module for the Eq type class (equality)
(function (expOutput) {
  "use strict";
  var externalEquality = ModuleContainer["Data.Equality"]; // Import external equality function
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import LogicAlgebra module
  // Placeholder imports
  // var Data_Symbol = ModuleContainer["Data.Symbol"];
  // var Data_UnitValue = ModuleContainer["Data.UnitValue"];
  // var Data_Void = ModuleContainer["Data.Void"];
  // var Record_Unsafe = ModuleContainer["Record.Unsafe"];
  // var Type_Data_RowList = ModuleContainer["Type.Data.RowList"];

  /**
   * Type class for values that can be checked for equality.
   * @constructor
   * @param {Function} equalityCheckFunc - The equality checking function.
   */
  var Equality = function (equalityCheckFunc) {
    this.equalityCheckFunc = equalityCheckFunc;
  };
  /**
   * Type class for values that can be checked for equality with a type parameter.
   * @constructor
   * @param {Function} equalityCheckFuncOne - The equality checking function (polymorphic).
   */
  var EqualityOne = function (equalityCheckFuncOne) {
    this.equalityCheckFuncOne = equalityCheckFuncOne;
  };
  // Equality instance for integers
  var equalityInt = new Equality(externalEquality.refEquality);
  // Equality instance for characters
  var equalityChar = new Equality(externalEquality.refEquality);
  /**
   * Retrieves the polymorphic equality function from a dictionary.
   * @param {Object} dictionaryRef - The EqualityOne type class dictionary.
   * @returns {Function} The equality function.
   */
  var equalityOne = function (dictionaryRef) {
    return dictionaryRef.equalityCheckFuncOne;
  };
  /**
   * Retrieves the equality function from a dictionary.
   * @param {Object} dictionaryRef - The Equality type class dictionary.
   * @returns {Function} The equality function.
   */
  var equalityCheck = function (dictionaryRef) {
    return dictionaryRef.equalityCheckFunc;
  };
  expOutput["Equality"] = Equality;
  expOutput["equalityCheck"] = equalityCheck;
  expOutput["EqualityOne"] = EqualityOne;
  expOutput["equalityOne"] = equalityOne;
  expOutput["equalityInt"] = equalityInt;
  expOutput["equalityChar"] = equalityChar;
})(ModuleContainer["Data.Equality"] = ModuleContainer["Data.Equality"] || {});

// Module for unsafe comparison operations
(function (expOutput) {
  "use strict";
  /**
   * Unsafely compares two values and returns a comparison result (LT, EQ, GT).
   * @param {*} lessThanResult - Value representing "less than".
   * @returns {Function} A function that takes "equal to" result.
   */
  expOutput.compareUnsafeImpl = function (lessThanResult) {
    return function (equalToResult) {
      return function (greaterThanResult) {
        return function (valX) {
          return function (valY) {
            return valX < valY ? lessThanResult : valX === valY ? equalToResult : greaterThanResult;
          };
        };
      };
    };
  };
})(ModuleContainer["Data.Order.Unsafe"] = ModuleContainer["Data.Order.Unsafe"] || {});

// Module for semigroup operations (concatenation)
(function (expOutput) {
  "use strict";
  /**
   * Concatenates two strings.
   * @param {string} str1 - The first string.
   * @returns {Function} A function that takes the second string.
   */
  expOutput.strCombine = function (str1) {
    return function (str2) {
      return str1 + str2;
    };
  };
})(ModuleContainer["Data.Collection"] = ModuleContainer["Data.Collection"] || {});

// Module for the Semigroup type class
(function (expOutput) {
  "use strict";
  var externalCollection = ModuleContainer["Data.Collection"]; // Import external string concatenation
  // Placeholder imports
  // var Data_Symbol = ModuleContainer["Data.Symbol"];
  // var Data_UnitValue = ModuleContainer["Data.UnitValue"];
  // var Data_Void = ModuleContainer["Data.Void"];
  // var Record_Unsafe = ModuleContainer["Record.Unsafe"];
  // var Type_Data_RowList = ModuleContainer["Type.Data.RowList"];

  /**
   * Type class for types with an associative binary operation.
   * @constructor
   * @param {Function} combineFunc - The associative binary operation.
   */
  var Collection = function (combineFunc) {
    this.combineFunc = combineFunc;
  };
  // Semigroup instance for strings
  var collectionStr = new Collection(externalCollection.strCombine);
  /**
   * Retrieves the combine function from a dictionary.
   * @param {Object} dictionaryRef - The Collection type class dictionary.
   * @returns {Function} The combine function.
   */
  var combineStr = function (dictionaryRef) {
    return dictionaryRef.combineFunc;
  };
  expOutput["Collection"] = Collection;
  expOutput["combineStr"] = combineStr;
  expOutput["collectionStr"] = collectionStr;
})(ModuleContainer["Data.Collection"] = ModuleContainer["Data.Collection"] || {});

// Module for ordering enumeration
(function (expOutput) {
  "use strict";
  // Placeholder imports
  // var Data_Equality = ModuleContainer["Data.Equality"];
  // var Data_Collection = ModuleContainer["Data.Collection"];
  // var Data_Display = ModuleContainer["Data.Display"];

  /**
   * Represents a "less than" ordering.
   * @constructor
   */
  var LessThen = function () {
    function LessThen() {}
    LessThen.value = new LessThen();
    return LessThen;
  }();
  /**
   * Represents a "greater than" ordering.
   * @constructor
   */
  var GreaterThen = function () {
    function GreaterThen() {}
    GreaterThen.value = new GreaterThen();
    return GreaterThen;
  }();
  /**
   * Represents an "equal to" ordering.
   * @constructor
   */
  var EqualTo = function () {
    function EqualTo() {}
    EqualTo.value = new EqualTo();
    return EqualTo;
  }();
  expOutput["LessThen"] = LessThen;
  expOutput["GreaterThen"] = GreaterThen;
  expOutput["EqualTo"] = EqualTo;
})(ModuleContainer["Data.Ordering"] = ModuleContainer["Data.Ordering"] || {});

// Module for ordering operations
(function (expOutput) {
  "use strict";
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ordering enumeration
  var Data_Order_Unsafe = ModuleContainer["Data.Order.Unsafe"]; // Import unsafe comparison

  // Unsafe comparison function using the Ordering enumeration
  var unsafeComparison = Data_Order_Unsafe.compareUnsafeImpl(Data_Ordering.LessThen.value)(Data_Ordering.EqualTo.value)(Data_Ordering.GreaterThen.value);
  expOutput["unsafeComparison"] = unsafeComparison;
})(ModuleContainer["Data.Order.Unsafe"] = ModuleContainer["Data.Order.Unsafe"] || {});

// Module for semiring operations (addition, multiplication, zero, one)
(function (expOutput) {
  "use strict";
  // Placeholder imports
  // var Data_Symbol = ModuleContainer["Data.Symbol"];
  // var Data_UnitValue = ModuleContainer["Data.UnitValue"];
  // var Record_Unsafe = ModuleContainer["Record.Unsafe"];
  // var Type_Data_Row = ModuleContainer["Type.Data.Row"];
  // var Type_Data_RowList = ModuleContainer["Type.Data.RowList"];

  /**
   * Type class for semirings.
   * @constructor
   * @param {Function} summation - Addition operation.
   * @param {Function} multiplication - Multiplication operation.
   * @param {*} identityNum - Multiplicative identity.
   * @param {*} nullNum - Additive identity.
   */
  var NumSet = function (summation, multiplication, identityNum, nullNum) {
    this.summation = summation;
    this.multiplication = multiplication;
    this.identityNum = identityNum;
    this.nullNum = nullNum;
  };
  /**
   * Retrieves the additive identity from a dictionary.
   * @param {Object} dictionaryRef - The NumSet dictionary.
   * @returns {*} The additive identity.
   */
  var nullNum = function (dictionaryRef) {
    return dictionaryRef.nullNum;
  };
  /**
   * Retrieves the multiplicative identity from a dictionary.
   * @param {Object} dictionaryRef - The NumSet dictionary.
   * @returns {*} The multiplicative identity.
   */
  var identityNum = function (dictionaryRef) {
    return dictionaryRef.identityNum;
  };
  /**
   * Retrieves the multiplication operation from a dictionary.
   * @param {Object} dictionaryRef - The NumSet dictionary.
   * @returns {Function} The multiplication operation.
   */
  var multiplication = function (dictionaryRef) {
    return dictionaryRef.multiplication;
  };
  /**
   * Retrieves the summation operation from a dictionary.
   * @param {Object} dictionaryRef - The NumSet dictionary.
   * @returns {Function} The summation operation.
   */
  var summation = function (dictionaryRef) {
    return dictionaryRef.summation;
  };
  expOutput["NumSet"] = NumSet;
  expOutput["summation"] = summation;
  expOutput["nullNum"] = nullNum;
  expOutput["multiplication"] = multiplication;
  expOutput["identityNum"] = identityNum;
})(ModuleContainer["Data.NumSet"] = ModuleContainer["Data.NumSet"] || {});

// Module for ring operations (semiring + subtraction)
(function (expOutput) {
  "use strict";
  var Data_NumSet = ModuleContainer["Data.NumSet"]; // Import NumSet module
  // Placeholder imports
  // var Data_Symbol = ModuleContainer["Data.Symbol"];
  // var Data_UnitValue = ModuleContainer["Data.UnitValue"];
  // var Record_Unsafe = ModuleContainer["Record.Unsafe"];
  // var Type_Data_RowList = ModuleContainer["Type.Data.RowList"];

  /**
   * Type class for rings.
   * @constructor
   * @param {Function} numSetZero - The Semiring instance.
   * @param {Function} subtraction - Subtraction operation.
   */
  var NumRing = function (numSetZero, subtraction) {
    this.numSetZero = numSetZero;
    this.subtraction = subtraction;
  };
  /**
   * Retrieves the subtraction operation from a dictionary.
   * @param {Object} dictionaryRef - The NumRing dictionary.
   * @returns {Function} The subtraction operation.
   */
  var subtraction = function (dictionaryRef) {
    return dictionaryRef.subtraction;
  };
  expOutput["NumRing"] = NumRing;
  expOutput["subtraction"] = subtraction;
})(ModuleContainer["Data.NumRing"] = ModuleContainer["Data.NumRing"] || {});

// Module for the Ord type class (ordering)
(function (expOutput) {
  "use strict";
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Equality module
  var Data_Order_Unsafe = ModuleContainer["Data.Order.Unsafe"]; // Import unsafe comparison
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ordering enumeration
  var Data_NumRing = ModuleContainer["Data.NumRing"]; // Import NumRing module (not directly used but in original structure)
  var Data_NumSet = ModuleContainer["Data.NumSet"]; // Import NumSet module (not directly used but in original structure)
  // Placeholder imports
  // var Data_Symbol = ModuleContainer["Data.Symbol"];
  // var Data_UnitValue = ModuleContainer["Data.UnitValue"];
  // var Data_Void = ModuleContainer["Data.Void"];
  // var Record_Unsafe = ModuleContainer["Record.Unsafe"];
  // var Type_Data_RowList = ModuleContainer["Type.Data.RowList"];

  /**
   * Type class for values that can be ordered.
   * @constructor
   * @param {Function} equalityZero - The Equality instance.
   * @param {Function} compareValuesFunc - The comparison function.
   */
  var OrderingClass = function (equalityZero, compareValuesFunc) {
    this.equalityZero = equalityZero;
    this.compareValuesFunc = compareValuesFunc;
  };
  /**
   * Type class for values that can be ordered with a type parameter.
   * @constructor
   * @param {Function} equalityOneZero - The EqualityOne instance.
   * @param {Function} compareValuesFuncOne - The polymorphic comparison function.
   */
  var OrderingClassOne = function (equalityOneZero, compareValuesFuncOne) {
    this.equalityOneZero = equalityOneZero;
    this.compareValuesFuncOne = compareValuesFuncOne;
  };
  // Ord instance for integers
  var orderInt = new OrderingClass(function () {
    return Data_Equality.equalityInt;
  }, Data_Order_Unsafe.unsafeComparison);
  // Ord instance for characters
  var orderChar = new OrderingClass(function () {
    return Data_Equality.equalityChar;
  }, Data_Order_Unsafe.unsafeComparison);
  /**
   * Retrieves the polymorphic comparison function from a dictionary.
   * @param {Object} dictionaryRef - The OrderingClassOne type class dictionary.
   * @returns {Function} The comparison function.
   */
  var compareOne = function (dictionaryRef) {
    return dictionaryRef.compareValuesFuncOne;
  };
  /**
   * Retrieves the comparison function from a dictionary.
   * @param {Object} dictionaryRef - The OrderingClass type class dictionary.
   * @returns {Function} The comparison function.
   */
  var compareValues = function (dictionaryRef) {
    return dictionaryRef.compareValuesFunc;
  };
  /**
   * Creates a comparison function that compares values based on a derived property.
   * @param {Object} dictOrderingClass - The OrderingClass dictionary for the derived type.
   * @returns {Function} A function that takes a projection function.
   */
  var compareBy = function (dictOrderingClass) {
    return function (projectionFunc) {
      return function (valX) {
        return function (valY) {
          return compareValues(dictOrderingClass)(projectionFunc(valX))(projectionFunc(valY));
        };
      };
    };
  };
  /**
   * Checks if the first value is greater than the second.
   * @param {Object} dictOrderingClass - The OrderingClass dictionary.
   * @param {*} valA - The first value.
   * @param {*} valB - The second value.
   * @returns {boolean} True if valA > valB, false otherwise.
   */
  var isGreater = function (dictOrderingClass) {
    return function (valA) {
      return function (valB) {
        var comparisonResult = compareValues(dictOrderingClass)(valA)(valB);
        if (comparisonResult instanceof Data_Ordering.GreaterThen) {
          return true;
        }
        return false;
      };
    };
  };
  /**
   * Checks if the first value is less than the second.
   * @param {Object} dictOrderingClass - The OrderingClass dictionary.
   * @param {*} valA - The first value.
   * @param {*} valB - The second value.
   * @returns {boolean} True if valA < valB, false otherwise.
   */
  var isLess = function (dictOrderingClass) {
    return function (valA) {
      return function (valB) {
        var comparisonResult = compareValues(dictOrderingClass)(valA)(valB);
        if (comparisonResult instanceof Data_Ordering.LessThen) {
          return true;
        }
        return false;
      };
    };
  };
  /**
   * Returns the maximum of two values.
   * @param {Object} dictOrderingClass - The OrderingClass dictionary.
   * @param {*} valX - The first value.
   * @param {*} valY - The second value.
   * @returns {*} The maximum value.
   */
  var maximumVal = function (dictOrderingClass) {
    return function (valX) {
      return function (valY) {
        var comparisonResult = compareValues(dictOrderingClass)(valX)(valY);
        if (comparisonResult instanceof Data_Ordering.LessThen) {
          return valY;
        }
        if (comparisonResult instanceof Data_Ordering.EqualTo) {
          return valX;
        }
        if (comparisonResult instanceof Data_Ordering.GreaterThen) {
          return valX;
        }
        throw new Error("Pattern match failure at Data.Ordering (line 128, col 3 - line 131, col 12): " + [comparisonResult.constructor.name]);
      };
    };
  };
  /**
   * Returns the minimum of two values.
   * @param {Object} dictOrderingClass - The OrderingClass dictionary.
   * @param {*} valX - The first value.
   * @param {*} valY - The second value.
   * @returns {*} The minimum value.
   */
  var minimumVal = function (dictOrderingClass) {
    return function (valX) {
      return function (valY) {
        var comparisonResult = compareValues(dictOrderingClass)(valX)(valY);
        if (comparisonResult instanceof Data_Ordering.LessThen) {
          return valX;
        }
        if (comparisonResult instanceof Data_Ordering.EqualTo) {
          return valX;
        }
        if (comparisonResult instanceof Data_Ordering.GreaterThen) {
          return valY;
        }
        throw new Error("Pattern match failure at Data.Ordering (line 119, col 3 - line 122, col 12): " + [comparisonResult.constructor.name]);
      };
    };
  };
  expOutput["OrderingClass"] = OrderingClass;
  expOutput["compareValues"] = compareValues;
  expOutput["OrderingClassOne"] = OrderingClassOne;
  expOutput["compareOne"] = compareOne;
  expOutput["isLess"] = isLess;
  expOutput["isGreater"] = isGreater;
  expOutput["compareBy"] = compareBy;
  expOutput["minimumVal"] = minimumVal;
  expOutput["maximumVal"] = maximumVal;
  expOutput["orderInt"] = orderInt;
  expOutput["orderChar"] = orderChar;
})(ModuleContainer["Data.Ordering"] = ModuleContainer["Data.Ordering"] || {});

// Module for functional programming utilities
(function (expOutput) {
  "use strict";
  var Logic_Classify = ModuleContainer["Logic.Classify"]; // Import Category module
  var Data_Bool = ModuleContainer["Data.Bool"]; // Import Boolean module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  var Data_NumRing = ModuleContainer["Data.NumRing"]; // Import Ring module

  /**
   * Flips the arguments of a binary function.
   * @param {Function} func - The binary function.
   * @returns {Function} A new function with flipped arguments.
   */
  var reverseArgs = function (func) {
    return function (argB) {
      return function (argA) {
        return func(argA)(argB);
      };
    };
  };
  /**
   * Creates a constant function that always returns the same value.
   * @param {*} valA - The value to always return.
   * @returns {Function} A function that ignores its argument and returns valA.
   */
  var constantVal = function (valA) {
    return function (ignoredArg) {
      return valA;
    };
  };
  expOutput["reverseArgs"] = reverseArgs;
  expOutput["constantVal"] = constantVal;
})(ModuleContainer["Data.Func"] = ModuleContainer["Data.Func"] || {});

// Module for functor operations on arrays
(function (expOutput) {
  "use strict";
  /**
   * Maps a function over an array.
   * @param {Function} func - The mapping function.
   * @returns {Function} A function that takes an array.
   */
  expOutput.listTransform = function (func) {
    return function (inputArr) {
      var arrLen = inputArr.length;
      var outcomeArr = new Array(arrLen);
      for (var idx = 0; idx < arrLen; idx++) {
        outcomeArr[idx] = func(inputArr[idx]);
      }
      return outcomeArr;
    };
  };
})(ModuleContainer["Data.Transform"] = ModuleContainer["Data.Transform"] || {});

// Module for the Functor type class
(function (expOutput) {
  "use strict";
  var externalTransform = ModuleContainer["Data.Transform"]; // Import external array mapping
  var Logic_OpGroup = ModuleContainer["Logic.OpGroup"]; // Import Semigroupoid module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module

  /**
   * Type class for types that can be mapped over.
   * @constructor
   * @param {Function} transformFunc - The mapping function.
   */
  var Transform = function (transformFunc) {
    this.transformFunc = transformFunc;
  };
  /**
   * Retrieves the mapping function from a dictionary.
   * @param {Object} dictionaryRef - The Transform type class dictionary.
   * @returns {Function} The mapping function.
   */
  var transformData = function (dictionaryRef) {
    return dictionaryRef.transformFunc;
  };
  // Functor instance for functions (composition)
  var transformFunc = new Transform(Logic_OpGroup.combineOp(Logic_OpGroup.opSetFunc));
  // Functor instance for arrays
  var transformArr = new Transform(externalTransform.listTransform);
  expOutput["Transform"] = Transform;
  expOutput["transformData"] = transformData;
  expOutput["transformFunc"] = transformFunc;
  expOutput["transformArr"] = transformArr;
})(ModuleContainer["Data.Transform"] = ModuleContainer["Data.Transform"] || {});

// Module for the Apply type class (applicative functor without pure)
(function (expOutput) {
  "use strict";
  var externalApply = ModuleContainer["Logic.Apply"]; // Import external array apply
  var Logic_Classify = ModuleContainer["Logic.Classify"]; // Import Category module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module

  /**
   * Type class for applicative functors without a pure function.
   * @constructor
   * @param {Function} transformZero - The Functor instance.
   * @param {Function} performOpFunc - The apply operation.
   */
  var Operation = function (transformZero, performOpFunc) {
    this.transformZero = transformZero;
    this.performOpFunc = performOpFunc;
  };
  // Apply instance for arrays
  var operationArr = new Operation(function () {
    return Data_Transform.transformArr;
  }, externalApply.listOperation);
  /**
   * Retrieves the apply operation from a dictionary.
   * @param {Object} dictionaryRef - The Operation type class dictionary.
   * @returns {Function} The apply operation.
   */
  var performOp = function (dictionaryRef) {
    return dictionaryRef.performOpFunc;
  };
  expOutput["Operation"] = Operation;
  expOutput["performOp"] = performOp;
  expOutput["operationArr"] = operationArr;
})(ModuleContainer["Logic.Operation"] = ModuleContainer["Logic.Operation"] || {});

// Module for the Applicative type class (Apply + pure)
(function (expOutput) {
  "use strict";
  var Logic_Operation = ModuleContainer["Logic.Operation"]; // Import Apply module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module

  /**
   * Type class for applicative functors.
   * @constructor
   * @param {Function} operationZero - The Apply instance.
   * @param {Function} createValFunc - The pure function.
   */
  var Creator = function (operationZero, createValFunc) {
    this.operationZero = operationZero;
    this.createValFunc = createValFunc;
  };
  /**
   * Retrieves the pure function from a dictionary.
   * @param {Object} dictionaryRef - The Creator type class dictionary.
   * @returns {Function} The pure function.
   */
  var createVal = function (dictionaryRef) {
    return dictionaryRef.createValFunc;
  };
  expOutput["Creator"] = Creator;
  expOutput["createVal"] = createVal;
})(ModuleContainer["Logic.Creator"] = ModuleContainer["Logic.Creator"] || {});

// Module for bind operations on arrays
(function (expOutput) {
  "use strict";
  /**
   * Binds a function over an array, flattening the results.
   * @param {Array} inputArr - The input array.
   * @returns {Function} A function that takes a binding function.
   */
  expOutput.arrBinder = function (inputArr) {
    return function (bindingFunc) {
      var outcomeArr = [];
      for (var idx = 0, arrLen = inputArr.length; idx < arrLen; idx++) {
        Array.prototype.push.apply(outcomeArr, bindingFunc(inputArr[idx]));
      }
      return outcomeArr;
    };
  };
})(ModuleContainer["Logic.Linker"] = ModuleContainer["Logic.Linker"] || {});

// Module for the Bind type class (Monad without pure)
(function (expOutput) {
  "use strict";
  var externalLinker = ModuleContainer["Logic.Linker"]; // Import external array bind
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Operation = ModuleContainer["Logic.Operation"]; // Import Apply module
  var Logic_Classify = ModuleContainer["Logic.Classify"]; // Import Category module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module

  /**
   * Type class for monads without a pure function.
   * @constructor
   * @param {Function} operationZero - The Apply instance.
   * @param {Function} bindValFunc - The bind operation.
   */
  var Linker = function (operationZero, bindValFunc) {
    this.operationZero = operationZero;
    this.bindValFunc = bindValFunc;
  };
  /**
   * Type class for discarding intermediate results in a monadic chain.
   * @constructor
   * @param {Function} discarderFunc - The discard operation.
   */
  var Remover = function (discarderFunc) {
    this.discarderFunc = discarderFunc;
  };
  /**
   * Retrieves the discard operation from a dictionary.
   * @param {Object} dictionaryRef - The Remover type class dictionary.
   * @returns {Function} The discard operation.
   */
  var discarder = function (dictionaryRef) {
    return dictionaryRef.discarderFunc;
  };
  // Bind instance for arrays
  var linkerArr = new Linker(function () {
    return Logic_Operation.operationArr;
  }, externalLinker.arrBinder);
  /**
   * Retrieves the bind operation from a dictionary.
   * @param {Object} dictionaryRef - The Linker type class dictionary.
   * @returns {Function} The bind operation.
   */
  var bindVal = function (dictionaryRef) {
    return dictionaryRef.bindValFunc;
  };
  // Discard instance for unit type, using bind
  var binderUnit = new Remover(function (dictLinker) {
    return bindVal(dictLinker);
  });
  expOutput["Linker"] = Linker;
  expOutput["bindVal"] = bindVal;
  expOutput["Remover"] = Remover;
  expOutput["discarder"] = discarder;
  expOutput["linkerArr"] = linkerArr;
  expOutput["binderUnit"] = binderUnit;
})(ModuleContainer["Logic.Linker"] = ModuleContainer["Logic.Linker"] || {});

// Module for bounded values (min/max integers and characters)
(function (expOutput) {
  "use strict";
  /**
   * Maximum integer value.
   * @type {number}
   */
  expOutput.maxIntVal = 2147483647;
  /**
   * Minimum integer value.
   * @type {number}
   */
  expOutput.minIntVal = -2147483648;
  /**
   * Maximum character value.
   * @type {string}
   */
  expOutput.maxCharVal = String.fromCharCode(65535);
  /**
   * Minimum character value.
   * @type {string}
   */
  expOutput.minCharVal = String.fromCharCode(0);
})(ModuleContainer["Data.Range"] = ModuleContainer["Data.Range"] || {});

// Module for the Bounded type class
(function (expOutput) {
  "use strict";
  var externalRange = ModuleContainer["Data.Range"]; // Import external min/max values
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module

  /**
   * Type class for bounded types (having a minimum and maximum value).
   * @constructor
   * @param {Function} orderingZero - The Ord instance.
   * @param {*} bottomBoundVal - The minimum value.
   * @param {*} topBoundVal - The maximum value.
   */
  var Range = function (orderingZero, bottomBoundVal, topBoundVal) {
    this.orderingZero = orderingZero;
    this.bottomBoundVal = bottomBoundVal;
    this.topBoundVal = topBoundVal;
  };
  /**
   * Retrieves the maximum value from a dictionary.
   * @param {Object} dictionaryRef - The Range type class dictionary.
   * @returns {*} The maximum value.
   */
  var topBound = function (dictionaryRef) {
    return dictionaryRef.topBoundVal;
  };
  // Bounded instance for integers
  var rangeInt = new Range(function () {
    return Data_Ordering.orderInt;
  }, externalRange.minIntVal, externalRange.maxIntVal);
  // Bounded instance for characters
  var rangeChar = new Range(function () {
    return Data_Ordering.orderChar;
  }, externalRange.minCharVal, externalRange.maxCharVal);
  /**
   * Retrieves the minimum value from a dictionary.
   * @param {Object} dictionaryRef - The Range type class dictionary.
   * @returns {*} The minimum value.
   */
  var bottomBound = function (dictionaryRef) {
    return dictionaryRef.bottomBoundVal;
  };
  expOutput["Range"] = Range;
  expOutput["bottomBound"] = bottomBound;
  expOutput["topBound"] = topBound;
  expOutput["rangeInt"] = rangeInt;
  expOutput["rangeChar"] = rangeChar;
})(ModuleContainer["Data.Range"] = ModuleContainer["Data.Range"] || {});

// Module for foldable operations on arrays
(function (expOutput) {
  "use strict";
  /**
   * Folds an array from right to left.
   * @param {Function} foldFunc - The folding function.
   * @returns {Function} A function that takes an initial accumulator.
   */
  expOutput.foldRightArr = function (foldFunc) {
    return function (initialAcc) {
      return function (inputArr) {
        var acc = initialAcc;
        var arrLen = inputArr.length;
        for (var idx = arrLen - 1; idx >= 0; idx--) {
          acc = foldFunc(inputArr[idx])(acc);
        }
        return acc;
      };
    };
  };
  /**
   * Folds an array from left to right.
   * @param {Function} foldFunc - The folding function.
   * @returns {Function} A function that takes an initial accumulator.
   */
  expOutput.foldLeftArr = function (foldFunc) {
    return function (initialAcc) {
      return function (inputArr) {
        var acc = initialAcc;
        var arrLen = inputArr.length;
        for (var idx = 0; idx < arrLen; idx++) {
          acc = foldFunc(acc)(inputArr[idx]);
        }
        return acc;
      };
    };
  };
})(ModuleContainer["Data.Foldable"] = ModuleContainer["Data.Foldable"] || {});

// Module for the Monoid type class
(function (expOutput) {
  "use strict";
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Equality module
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Collection module
  var Data_Display = ModuleContainer["Data.Display"]; // Import Display module
  // Placeholder imports
  // var Data_EuclideanRing = ModuleContainer["Data.EuclideanRing"];
  // var Data_Ordering = ModuleContainer["Data.Ordering"];
  // var Data_Symbol = ModuleContainer["Data.Symbol"];
  // var Data_UnitValue = ModuleContainer["Data.UnitValue"];
  // var Record_Unsafe = ModuleContainer["Record.Unsafe"];
  // var Type_Data_RowList = ModuleContainer["Type.Data.RowList"];

  /**
   * Type class for monoids (semigroup + identity element).
   * @constructor
   * @param {Function} collectionZero - The Semigroup instance.
   * @param {*} emptyVal - The identity element.
   */
  var Unitary = function (collectionZero, emptyVal) {
    this.collectionZero = collectionZero;
    this.emptyVal = emptyVal;
  };
  // Monoid instance for strings
  var unitaryStr = new Unitary(function () {
    return Data_Collection.collectionStr;
  }, "");
  /**
   * Retrieves the identity element from a dictionary.
   * @param {Object} dictionaryRef - The Unitary type class dictionary.
   * @returns {*} The identity element.
   */
  var emptyVal = function (dictionaryRef) {
    return dictionaryRef.emptyVal;
  };
  expOutput["Unitary"] = Unitary;
  expOutput["emptyVal"] = emptyVal;
  expOutput["unitaryStr"] = unitaryStr;
})(ModuleContainer["Data.Unitary"] = ModuleContainer["Data.Unitary"] || {});

// Module for the Maybe type (Option type)
(function (expOutput) {
  "use strict";
  var Logic_Operation = ModuleContainer["Logic.Operation"]; // Import Apply module
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  var Logic_Classify = ModuleContainer["Logic.Classify"]; // Import Category module
  // Placeholder imports
  // var Control_Alt = ModuleContainer["Control.Alt"];
  // var Control_Alternative = ModuleContainer["Control.Alternative"];
  // var Control_Extend = ModuleContainer["Control.Extend"];
  // var Control_Monad = ModuleContainer["Control.Monad"];
  // var Control_MonadZero = ModuleContainer["Control.MonadZero"];
  // var Control_Plus = ModuleContainer["Control.Plus"];
  var Data_Range = ModuleContainer["Data.Range"]; // Import Bounded module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  // var Data_Functor_Invariant = ModuleContainer["Data.Functor.Invariant"];
  var Data_Unitary = ModuleContainer["Data.Unitary"]; // Import Monoid module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Represents the absence of a value.
   * @constructor
   */
  var Absence = function () {
    function Absence() {}
    Absence.value = new Absence();
    return Absence;
  }();
  /**
   * Represents the presence of a value.
   * @constructor
   * @param {*} val0 - The present value.
   */
  var Presence = function () {
    function Presence(val0) {
      this.val0 = val0;
    }
    Presence.create = function (val0) {
      return new Presence(val0);
    };
    return Presence;
  }();
  /**
   * Handles optional values by applying one function if absent, another if present.
   * @param {*} absentVal - Value to return if Absence.
   * @returns {Function} A function that takes a function for Presence.
   */
  var optionHandler = function (absentVal) {
    return function (presentFunc) {
      return function (optionalVal) {
        if (optionalVal instanceof Absence) {
          return absentVal;
        }
        if (optionalVal instanceof Presence) {
          return presentFunc(optionalVal.val0);
        }
        throw new Error("Pattern match failure at Data.Option (line 217, col 1 - line 217, col 51): " + [absentVal.constructor.name, presentFunc.constructor.name, optionalVal.constructor.name]);
      };
    };
  };
  /**
   * Checks if an optional value is present.
   * @returns {boolean} True if Presence, false if Absence.
   */
  var isOptionPresent = optionHandler(false)(Data_Func.constantVal(true));
  // Functor instance for Maybe
  var transformOption = new Data_Transform.Transform(function (func) {
    return function (optionalVal) {
      if (optionalVal instanceof Presence) {
        return new Presence(func(optionalVal.val0));
      }
      return Absence.value;
    };
  });
  /**
   * Extracts the value from a Presence, or returns a default value if Absence.
   * @param {*} defaultVal - The default value.
   * @returns {Function} A function that takes the optional value.
   */
  var fromOption = function (defaultVal) {
    return optionHandler(defaultVal)(Logic_Classify.unitOp(Logic_Classify.classifyFunc));
  };
  /**
   * Extracts the value from a Presence, crashing if Absence (unsafe).
   * @param {Object} dictPartial - Partial type class dictionary (unused but in original).
   * @returns {Function} A function that takes the optional value.
   */
  var extractOption = function (dictPartial) {
    return function (optionalVal) {
      if (optionalVal instanceof Presence) {
        return optionalVal.val0;
      }
      throw new Error("Pattern match failure at Data.Option (line 268, col 1 - line 268, col 46): " + [optionalVal.constructor.name]);
    };
  };
  // Apply instance for Maybe
  var performOption = new Logic_Operation.Operation(function () {
    return transformOption;
  }, function (funcOptional) {
    return function (valOptional) {
      if (funcOptional instanceof Presence) {
        return Data_Transform.transformData(transformOption)(funcOptional.val0)(valOptional);
      }
      if (funcOptional instanceof Absence) {
        return Absence.value;
      }
      throw new Error("Pattern match failure at Data.Option (line 67, col 1 - line 67, col 35): " + [funcOptional.constructor.name, valOptional.constructor.name]);
    };
  });
  // Bind instance for Maybe
  var bindOption = new Logic_Linker.Linker(function () {
    return performOption;
  }, function (optionalVal) {
    return function (bindingFunc) {
      if (optionalVal instanceof Presence) {
        return bindingFunc(optionalVal.val0);
      }
      if (optionalVal instanceof Absence) {
        return Absence.value;
      }
      throw new Error("Pattern match failure at Data.Option (line 125, col 1 - line 125, col 33): " + [optionalVal.constructor.name, bindingFunc.constructor.name]);
    };
  });
  // Applicative instance for Maybe
  var creatorOption = new Logic_Creator.Creator(function () {
    return performOption;
  }, Presence.create);
  expOutput["Absence"] = Absence;
  expOutput["Presence"] = Presence;
  expOutput["optionHandler"] = optionHandler;
  expOutput["fromOption"] = fromOption;
  expOutput["isOptionPresent"] = isOptionPresent;
  expOutput["extractOption"] = extractOption;
  expOutput["transformOption"] = transformOption;
  expOutput["performOption"] = performOption;
  expOutput["creatorOption"] = creatorOption;
  expOutput["bindOption"] = bindOption;
})(ModuleContainer["Data.Option"] = ModuleContainer["Data.Option"] || {});

// Module for Monoid.Conj (conjunction monoid)
(function (expOutput) {
  "use strict";
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Operation = ModuleContainer["Logic.Operation"]; // Import Apply module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  // Placeholder imports
  // var Control_Monad = ModuleContainer["Control.Monad"];
  var Data_Range = ModuleContainer["Data.Range"]; // Import Bounded module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  var Data_Unitary = ModuleContainer["Data.Unitary"]; // Import Monoid module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  var Data_NumSet = ModuleContainer["Data.NumSet"]; // Import Semiring module
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Represents a value wrapped in a Conjunction monoid.
   * @param {*} valX - The value.
   * @returns {*} The wrapped value.
   */
  var SingleNum = function (valX) {
    return valX;
  };
  /**
   * Semigroup instance for Conjunction.
   * @param {Object} dictLogicAlgebra - The HeytingAlgebra dictionary.
   * @returns {Object} The Semigroup instance.
   */
  var collectionSingle = function (dictLogicAlgebra) {
    return new Data_Collection.Collection(function (valA) {
      return function (valB) {
        return Data_LogicAlgebra.andOp(dictLogicAlgebra)(valA)(valB);
      };
    });
  };
  /**
   * Monoid instance for Conjunction.
   * @param {Object} dictLogicAlgebra - The HeytingAlgebra dictionary.
   * @returns {Object} The Monoid instance.
   */
  var unitarySingle = function (dictLogicAlgebra) {
    return new Data_Unitary.Unitary(function () {
      return collectionSingle(dictLogicAlgebra);
    }, Data_LogicAlgebra.truthVal(dictLogicAlgebra));
  };
  expOutput["SingleNum"] = SingleNum;
  expOutput["collectionSingle"] = collectionSingle;
  expOutput["unitarySingle"] = unitarySingle;
})(ModuleContainer["Data.Unitary.Single"] = ModuleContainer["Data.Unitary.Single"] || {});

// Module for the Newtype type class
(function (expOutput) {
  "use strict";
  var Logic_OpGroup = ModuleContainer["Logic.OpGroup"]; // Import Semigroupoid module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  // Placeholder imports
  // var Data_Monoid_Additive = ModuleContainer["Data.Monoid.Additive"];
  // var Data_Monoid_Disj = ModuleContainer["Data.Monoid.Disj"];
  // var Data_Monoid_Dual = ModuleContainer["Data.Monoid.Dual"];
  // var Data_Monoid_Endo = ModuleContainer["Data.Monoid.Endo"];
  // var Data_Monoid_Multiplicative = ModuleContainer["Data.Monoid.Multiplicative"];
  // var Data_Semigroup_First = ModuleContainer["Data.Semigroup.First"];
  // var Data_Semigroup_Last = ModuleContainer["Data.Semigroup.Last"];
  var Data_Unitary_Single = ModuleContainer["Data.Unitary.Single"]; // Import Monoid.Conj module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Type class for newtypes (wrapper types).
   * @constructor
   * @param {Function} unwrapperFunc - Function to unwrap the value.
   * @param {Function} wrapperFunc - Function to wrap a value.
   */
  var TypeWrapper = function (unwrapperFunc, wrapperFunc) {
    this.unwrapperFunc = unwrapperFunc;
    this.wrapperFunc = wrapperFunc;
  };
  /**
   * Retrieves the wrapper function from a dictionary.
   * @param {Object} dictionaryRef - The TypeWrapper type class dictionary.
   * @returns {Function} The wrapper function.
   */
  var wrapper = function (dictionaryRef) {
    return dictionaryRef.wrapperFunc;
  };
  /**
   * Retrieves the unwrapper function from a dictionary.
   * @param {Object} dictionaryRef - The TypeWrapper type class dictionary.
   * @returns {Function} The unwrapper function.
   */
  var unwrapper = function (dictionaryRef) {
    return dictionaryRef.unwrapperFunc;
  };
  // Newtype instance for Conjunction monoid
  var singleWrapper = new TypeWrapper(function (val) {
    return val;
  }, Data_Unitary_Single.SingleNum);
  /**
   * Helper function for applying a function to a wrapped value, then unwrapping.
   * @param {Object} dictTransform - Functor for the outer type.
   * @param {Object} dictTransformOne - Functor for the inner type.
   * @param {Object} dictTypeWrapper - Newtype for the outer type.
   * @param {Object} dictTypeWrapperOne - Newtype for the inner type.
   * @param {*} val - The initial wrapped value.
   * @returns {Function} A function that takes a transformation function.
   */
  var wrapFunc = function (dictTransform) {
    return function (dictTransformOne) {
      return function (dictTypeWrapper) {
        return function (dictTypeWrapperOne) {
          return function (val) {
            return function (func) {
              return function (arg) {
                return Data_Transform.transformData(dictTransformOne)(unwrapper(dictTypeWrapperOne))(func(Data_Transform.transformData(dictTransform)(wrapper(dictTypeWrapper))(arg)));
              };
            };
          };
        };
      };
    };
  };
  expOutput["unwrapper"] = unwrapper;
  expOutput["wrapper"] = wrapper;
  expOutput["TypeWrapper"] = TypeWrapper;
  expOutput["wrapFunc"] = wrapFunc;
  expOutput["singleWrapper"] = singleWrapper;
})(ModuleContainer["Data.TypeWrapper"] = ModuleContainer["Data.TypeWrapper"] || {});

// Module for the Foldable type class
(function (expOutput) {
  "use strict";
  var externalFoldable = ModuleContainer["Data.Foldable"]; // Import external array folding
  // Placeholder imports
  // var Control_Alt = ModuleContainer["Control.Alt"];
  // var Control_Creator = ModuleContainer["Control.Creator"];
  // var Control_Operation = ModuleContainer["Control.Operation"];
  // var Control_Linker = ModuleContainer["Control.Linker"];
  // var Control_Classify = ModuleContainer["Control.Classify"];
  // var Control_Plus = ModuleContainer["Control.Plus"];
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  // var Data_Option = ModuleContainer["Data.Option"];
  // var Data_Option_First = ModuleContainer["Data.Option.First"];
  // var Data_Option_Last = ModuleContainer["Data.Option.Last"];
  var Data_Unitary = ModuleContainer["Data.Unitary"]; // Import Monoid module
  var Data_Unitary_Single = ModuleContainer["Data.Unitary.Single"]; // Import Monoid.Conj module
  var Data_TypeWrapper = ModuleContainer["Data.TypeWrapper"]; // Import Newtype module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  var Data_NumSet = ModuleContainer["Data.NumSet"]; // Import Semiring module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Type class for data structures that can be folded.
   * @constructor
   * @param {Function} foldMapInternalFunc - FoldMap operation.
   * @param {Function} foldLeftInternalFunc - FoldLeft operation.
   * @param {Function} foldRightInternalFunc - FoldRight operation.
   */
  var Foldable = function (foldMapInternalFunc, foldLeftInternalFunc, foldRightInternalFunc) {
    this.foldMapInternalFunc = foldMapInternalFunc;
    this.foldLeftInternalFunc = foldLeftInternalFunc;
    this.foldRightInternalFunc = foldRightInternalFunc;
  };
  /**
   * Retrieves the foldRight operation from a dictionary.
   * @param {Object} dictionaryRef - The Foldable type class dictionary.
   * @returns {Function} The foldRight operation.
   */
  var foldRightInternal = function (dictionaryRef) {
    return dictionaryRef.foldRightInternalFunc;
  };
  /**
   * Retrieves the foldLeft operation from a dictionary.
   * @param {Object} dictionaryRef - The Foldable type class dictionary.
   * @returns {Function} The foldLeft operation.
   */
  var foldLeftInternal = function (dictionaryRef) {
    return dictionaryRef.foldLeftInternalFunc;
  };
  /**
   * Default implementation of foldMap using foldRight.
   * @param {Object} dictFoldable - The Foldable instance.
   * @param {Object} dictUnitary - The Unitary instance.
   * @returns {Function} A function that takes a mapping function.
   */
  var defaultFoldMapR = function (dictFoldable) {
    return function (dictUnitary) {
      return function (mappingFunc) {
        return foldRightInternal(dictFoldable)(function (item) {
          return function (acc) {
            return Data_Collection.combineStr(dictUnitary.collectionZero())(mappingFunc(item))(acc);
          };
        })(Data_Unitary.emptyVal(dictUnitary));
      };
    };
  };
  // Foldable instance for arrays
  var foldableArr = new Foldable(function (dictUnitary) {
    return defaultFoldMapR(foldableArr)(dictUnitary);
  }, externalFoldable.foldLeftArr, externalFoldable.foldRightArr);
  /**
   * Retrieves the foldMap operation from a dictionary.
   * @param {Object} dictionaryRef - The Foldable type class dictionary.
   * @returns {Function} The foldMap operation.
   */
  var foldMapInternal = function (dictionaryRef) {
    return dictionaryRef.foldMapInternalFunc;
  };
  /**
   * Checks if all elements in a foldable structure satisfy a predicate.
   * @param {Object} dictFoldable - The Foldable instance.
   * @param {Object} dictLogicAlgebra - The HeytingAlgebra instance.
   * @returns {Function} A function that takes a predicate.
   */
  var allCheck = function (dictFoldable) {
    return function (dictLogicAlgebra) {
      return Data_TypeWrapper.wrapFunc(Data_Transform.transformFunc)(Data_Transform.transformFunc)(Data_TypeWrapper.singleWrapper)(Data_TypeWrapper.singleWrapper)(Data_Unitary_Single.SingleNum)(foldMapInternal(dictFoldable)(Data_Unitary_Single.unitarySingle(dictLogicAlgebra)));
    };
  };
  expOutput["Foldable"] = Foldable;
  expOutput["foldRightInternal"] = foldRightInternal;
  expOutput["foldLeftInternal"] = foldLeftInternal;
  expOutput["foldMapInternal"] = foldMapInternal;
  expOutput["defaultFoldMapR"] = defaultFoldMapR;
  expOutput["allCheck"] = allCheck;
  expOutput["foldableArr"] = foldableArr;
})(ModuleContainer["Data.Foldable"] = ModuleContainer["Data.Foldable"] || {});

// Module for the Either type (Outcome type)
(function (expOutput) {
  "use strict";
  // Placeholder imports
  // var Control_Alt = ModuleContainer["Control.Alt"];
  // var Control_Alternative = ModuleContainer["Control.Alternative"];
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Operation = ModuleContainer["Logic.Operation"]; // Import Apply module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  // var Control_Extend = ModuleContainer["Control.Extend"];
  // var Control_Monad = ModuleContainer["Control.Monad"];
  // var Control_MonadZero = ModuleContainer["Control.MonadZero"];
  // var Control_Plus = ModuleContainer["Control.Plus"];
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  // var Data_Bifoldable = ModuleContainer["Data.Bifoldable"];
  // var Data_Bifunctor = ModuleContainer["Data.Bifunctor"];
  // var Data_Bitraversable = ModuleContainer["Data.Bitraversable"];
  var Data_Range = ModuleContainer["Data.Range"]; // Import Bounded module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Foldable = ModuleContainer["Data.Foldable"]; // Import Foldable module
  // var Data_FoldableWithIndex = ModuleContainer["Data.FoldableWithIndex"];
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  // var Data_Functor_Invariant = ModuleContainer["Data.Functor.Invariant"];
  // var Data_FunctorWithIndex = ModuleContainer["Data.FunctorWithIndex"];
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  // var Data_Option_First = ModuleContainer["Data.Option.First"];
  var Data_Unitary = ModuleContainer["Data.Unitary"]; // Import Monoid module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  // var Data_Semiring = ModuleContainer["Data.Semiring"];
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Data_Traversable = ModuleContainer["Data.Traversable"];
  // var Data_TraversableWithIndex = ModuleContainer["Data.TraversableWithIndex"];
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Represents a failed computation with an error value.
   * @constructor
   * @param {*} val0 - The error value.
   */
  var Failed = function () {
    function Failed(val0) {
      this.val0 = val0;
    }
    Failed.create = function (val0) {
      return new Failed(val0);
    };
    return Failed;
  }();
  /**
   * Represents a successful computation with a result value.
   * @constructor
   * @param {*} val0 - The result value.
   */
  var Success = function () {
    function Success(val0) {
      this.val0 = val0;
    }
    Success.create = function (val0) {
      return new Success(val0);
    };
    return Success;
  }();
  /**
   * Converts a Maybe value to an Either, providing a default error if Nothing.
   * @param {*} errorVal - The error value for Nothing.
   * @returns {Function} A function that takes a function to wrap the Just value.
   */
  var outcomeNote = function (errorVal) {
    return Data_Option.optionHandler(new Failed(errorVal))(Success.create);
  };
  // Functor instance for Either
  var transformOutcome = new Data_Transform.Transform(function (func) {
    return function (outcomeVal) {
      if (outcomeVal instanceof Failed) {
        return new Failed(outcomeVal.val0);
      }
      if (outcomeVal instanceof Success) {
        return new Success(func(outcomeVal.val0));
      }
      throw new Error("Pattern match failure at Data.Outcome (line 38, col 8 - line 38, col 52): " + [outcomeVal.constructor.name]);
    };
  });
  /**
   * Handles an Outcome value by applying one function for Failed, another for Success.
   * @param {Function} failedFunc - Function for Failed.
   * @returns {Function} A function that takes a function for Success.
   */
  var outcomeHandle = function (failedFunc) {
    return function (successFunc) {
      return function (outcomeVal) {
        if (outcomeVal instanceof Failed) {
          return failedFunc(outcomeVal.val0);
        }
        if (outcomeVal instanceof Success) {
          return successFunc(outcomeVal.val0);
        }
        throw new Error("Pattern match failure at Data.Outcome (line 238, col 1 - line 238, col 64): " + [failedFunc.constructor.name, successFunc.constructor.name, outcomeVal.constructor.name]);
      };
    };
  };
  // Apply instance for Either
  var performOutcome = new Logic_Operation.Operation(function () {
    return transformOutcome;
  }, function (funcOutcome) {
    return function (valOutcome) {
      if (funcOutcome instanceof Failed) {
        return new Failed(funcOutcome.val0);
      }
      if (funcOutcome instanceof Success) {
        return Data_Transform.transformData(transformOutcome)(funcOutcome.val0)(valOutcome);
      }
      throw new Error("Pattern match failure at Data.Outcome (line 82, col 1 - line 82, col 41): " + [funcOutcome.constructor.name, valOutcome.constructor.name]);
    };
  });
  // Bind instance for Either
  var bindOutcome = new Logic_Linker.Linker(function () {
    return performOutcome;
  }, outcomeHandle(function (error) {
    return function (ignoredFunc) {
      return new Failed(error);
    };
  })(function (value) {
    return function (bindingFunc) {
      return bindingFunc(value);
    };
  }));
  // Applicative instance for Either
  var creatorOutcome = new Logic_Creator.Creator(function () {
    return performOutcome;
  }, Success.create);
  expOutput["Failed"] = Failed;
  expOutput["Success"] = Success;
  expOutput["outcomeHandle"] = outcomeHandle;
  expOutput["outcomeNote"] = outcomeNote;
  expOutput["transformOutcome"] = transformOutcome;
  expOutput["performOutcome"] = performOutcome;
  expOutput["creatorOutcome"] = creatorOutcome;
  expOutput["bindOutcome"] = bindOutcome;
})(ModuleContainer["Data.Outcome"] = ModuleContainer["Data.Outcome"] || {});

// Module for unsafe partial functions
(function (expOutput) {
  "use strict";
  /**
   * Unsafely performs an effectful computation.
   * @param {Function} func - The function to call.
   * @returns {*} The result of the function.
   */
  expOutput.partialUnsafe = function (func) {
    return func();
  };
})(ModuleContainer["Partial.Unsafe"] = ModuleContainer["Partial.Unsafe"] || {});

// Module for partial functions (crashing)
(function (expOutput) {
  "use strict";
  /**
   * Throws an error with a given message.
   * @returns {Function} A function that takes the error message.
   */
  expOutput.terminateProgram = function () {
    return function (message) {
      throw new Error(message);
    };
  };
})(ModuleContainer["Partial"] = ModuleContainer["Partial"] || {});

// Module for partial functions (crashing)
(function (expOutput) {
  "use strict";
  var externalPartial = ModuleContainer["Partial"]; // Import external crash function
  /**
   * Unsafely crashes the program with a given message.
   * @param {string} message - The error message.
   * @returns {*} Never returns, always throws.
   */
  var terminateUnsafe = function (message) {
    return ModuleContainer["Partial.Unsafe"].partialUnsafe(function (dictPartial) {
      return externalPartial.terminateProgram(dictPartial)(message);
    });
  };
  expOutput["terminateUnsafe"] = terminateUnsafe;
})(ModuleContainer["Partial.Unsafe"] = ModuleContainer["Partial.Unsafe"] || {});

// Module for monadic recursion
(function (expOutput) {
  "use strict";
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  // Placeholder imports
  // var Control_Monad = ModuleContainer["Control.Monad"];
  var Logic_OpGroup = ModuleContainer["Logic.OpGroup"]; // Import Semigroupoid module
  // var Data_Bifunctor = ModuleContainer["Data.Bifunctor"];
  var Data_Outcome = ModuleContainer["Data.Outcome"]; // Import Either module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  // var Data_Identity = ModuleContainer["Data.Identity"];
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  // var Effect = ModuleContainer["Effect"];
  // var Effect_Ref = ModuleContainer["Effect.Ref"];
  var Partial_Unsafe = ModuleContainer["Partial.Unsafe"]; // Import Partial.Unsafe module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Represents a recursive state indicating to continue the loop.
   * @constructor
   * @param {*} val0 - The value to pass to the next iteration.
   */
  var CycleState = function () {
    function CycleState(val0) {
      this.val0 = val0;
    }
    CycleState.create = function (val0) {
      return new CycleState(val0);
    };
    return CycleState;
  }();
  /**
   * Represents a recursive state indicating the loop is finished.
   * @constructor
   * @param {*} val0 - The final result.
   */
  var CompletionState = function () {
    function CompletionState(val0) {
      this.val0 = val0;
    }
    CompletionState.create = function (val0) {
      return new CompletionState(val0);
    };
    return CompletionState;
  }();
  /**
   * Performs tail recursion using a state machine.
   * @param {Function} func - The function that returns CycleState or CompletionState.
   * @returns {Function} A function that takes the initial state.
   */
  var iterateRec = function (func) {
    var go = function ($copy_val) {
      var $tco_done = false;
      var $tco_result;

      function $tco_loop(val) {
        if (val instanceof CycleState) {
          $copy_val = func(val.val0);
          return;
        }
        if (val instanceof CompletionState) {
          $tco_done = true;
          return val.val0;
        }
        throw new Error("Pattern match failure at Control.Monad.Rec.Class (line 91, col 3 - line 91, col 25): " + [val.constructor.name]);
      }
      while (!$tco_done) {
        $tco_result = $tco_loop($copy_val);
      }
      return $tco_result;
    };
    return function ($53) {
      return go(func($53));
    };
  };
  expOutput["CycleState"] = CycleState;
  expOutput["CompletionState"] = CompletionState;
  expOutput["iterateRec"] = iterateRec;
})(ModuleContainer["Logic.Monad.Rec.Class"] = ModuleContainer["Logic.Monad.Rec.Class"] || {});

// Module for array operations
(function (expOutput) {
  "use strict";
  /**
   * Gets the length of an array.
   * @param {Array} inputArr - The array.
   * @returns {number} The length.
   */
  expOutput.retrieveLength = function (inputArr) {
    return inputArr.length;
  };
  /**
   * Safely retrieves an element from an array by index.
   * @param {Function} presenceFunc - Function to wrap a present value.
   * @returns {Function} A function that takes an absence value.
   */
  expOutput.retrieveIndexImpl = function (presenceFunc) {
    return function (absenceVal) {
      return function (inputArr) {
        return function (idx) {
          return idx < 0 || idx >= inputArr.length ? absenceVal : presenceFunc(inputArr[idx]);
        };
      };
    };
  };
  /**
   * Sorts an array using a custom comparison function.
   * @param {Function} compFunc - The comparison function.
   * @returns {Function} A function that takes the array to sort.
   */
  expOutput.sortDataImpl = function (compFunc) {
    return function (inputList) {
      return inputList.slice().sort(function (valX, valY) {
        return compFunc(valX)(valY);
      });
    };
  };
  /**
   * Extracts a portion of an array (slice).
   * @param {number} startIdx - The starting index.
   * @returns {Function} A function that takes the end index.
   */
  expOutput.splitList = function (startIdx) {
    return function (endIdx) {
      return function (inputList) {
        return inputList.slice(startIdx, endIdx);
      };
    };
  };
  /**
   * Removes the first N elements from an array.
   * @param {number} num - The number of elements to remove.
   * @returns {Function} A function that takes the array.
   */
  expOutput.removeN = function (num) {
    return function (inputList) {
      return num < 1 ? inputList : inputList.slice(num);
    };
  };
})(ModuleContainer["Data.List"] = ModuleContainer["Data.List"] || {});

// Module for tuples
(function (expOutput) {
  "use strict";
  // Placeholder imports
  // var Control_Creator = ModuleContainer["Control.Creator"];
  // var Control_Operation = ModuleContainer["Control.Operation"];
  // var Control_Biapplicative = ModuleContainer["Control.Biapplicative"];
  // var Control_Biapply = ModuleContainer["Control.Biapply"];
  // var Control_Linker = ModuleContainer["Control.Linker"];
  // var Control_Comonad = ModuleContainer["Control.Comonad"];
  // var Control_Extend = ModuleContainer["Control.Extend"];
  // var Control_Lazy = ModuleContainer["Control.Lazy"];
  // var Control_Monad = ModuleContainer["Control.Monad"];
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  // var Data_Bifoldable = ModuleContainer["Data.Bifoldable"];
  // var Data_Bifunctor = ModuleContainer["Data.Bifunctor"];
  // var Data_Bitraversable = ModuleContainer["Data.Bitraversable"];
  // var Data_BooleanAlgebra = ModuleContainer["Data.BooleanAlgebra"];
  var Data_Range = ModuleContainer["Data.Range"]; // Import Bounded module
  // var Data_CommutativeRing = ModuleContainer["Data.CommutativeRing"];
  // var Data_Distributive = ModuleContainer["Data.Distributive"];
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Foldable = ModuleContainer["Data.Foldable"]; // Import Foldable module
  // var Data_FoldableWithIndex = ModuleContainer["Data.FoldableWithIndex"];
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  // var Data_Functor_Invariant = ModuleContainer["Data.Functor.Invariant"];
  // var Data_FunctorWithIndex = ModuleContainer["Data.FunctorWithIndex"];
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  // var Data_Option_First = ModuleContainer["Data.Option.First"];
  var Data_Unitary = ModuleContainer["Data.Unitary"]; // Import Monoid module
  // var Data_TypeWrapper = ModuleContainer["Data.TypeWrapper"];
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  // var Data_Semigroup_Foldable = ModuleContainer["Data.Semigroup.Foldable"];
  // var Data_Semigroup_Traversable = ModuleContainer["Data.Semigroup.Traversable"];
  var Data_NumSet = ModuleContainer["Data.NumSet"]; // Import Semiring module
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Data_Traversable = ModuleContainer["Data.Traversable"];
  // var Data_TraversableWithIndex = ModuleContainer["Data.TraversableWithIndex"];
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  // var Prelude = ModuleContainer["Prelude"];
  // var Type_Equality = ModuleContainer["Type.Equality"];

  /**
   * Represents a pair of values.
   * @constructor
   * @param {*} val0 - The first value.
   * @param {*} val1 - The second value.
   */
  var ValueTuple = function () {
    function ValueTuple(val0, val1) {
      this.val0 = val0;
      this.val1 = val1;
    }
    ValueTuple.create = function (val0) {
      return function (val1) {
        return new ValueTuple(val0, val1);
      };
    };
    return ValueTuple;
  }();
  /**
   * Retrieves the second value from a tuple.
   * @param {ValueTuple} tuple - The tuple.
   * @returns {*} The second value.
   */
  var secondValue = function (tuple) {
    return tuple.val1;
  };
  /**
   * Retrieves the first value from a tuple.
   * @param {ValueTuple} tuple - The tuple.
   * @returns {*} The first value.
   */
  var firstValue = function (tuple) {
    return tuple.val0;
  };
  expOutput["ValueTuple"] = ValueTuple;
  expOutput["firstValue"] = firstValue;
  expOutput["secondValue"] = secondValue;
})(ModuleContainer["Data.ValueTuple"] = ModuleContainer["Data.ValueTuple"] || {});

// Module for Unfoldable1 type class
(function (expOutput) {
  "use strict";
  // Placeholder imports
  // var Data_Bool = ModuleContainer["Data.Bool"];
  // var Data_Equality = ModuleContainer["Data.Equality"];
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  // var Data_Semigroup_Traversable = ModuleContainer["Data.Semigroup.Traversable"];
  // var Data_NumSet = ModuleContainer["Data.NumSet"];
  var Data_ValueTuple = ModuleContainer["Data.ValueTuple"]; // Import Tuple module
  var Partial_Unsafe = ModuleContainer["Partial.Unsafe"]; // Import Partial.Unsafe module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Type class for data structures that can be unfolded from a seed, always producing at least one element.
   * @constructor
   * @param {Function} unfoldOneFunc - The unfolding function.
   */
  var ExpandableOneClass = function (unfoldOneFunc) {
    this.unfoldOneFunc = unfoldOneFunc;
  };
  /**
   * Retrieves the unfoldOne function from a dictionary.
   * @param {Object} dictionaryRef - The ExpandableOneClass type class dictionary.
   * @returns {Function} The unfoldOne function.
   */
  var unfoldOne = function (dictionaryRef) {
    return dictionaryRef.unfoldOneFunc;
  };
  expOutput["ExpandableOneClass"] = ExpandableOneClass;
  expOutput["unfoldOne"] = unfoldOne;
})(ModuleContainer["Data.ExpandableOne"] = ModuleContainer["Data.ExpandableOne"] || {});

// Module for Unfoldable type class
(function (expOutput) {
  "use strict";
  // Placeholder imports
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  // var Data_Traversable = ModuleContainer["Data.Traversable"];
  var Data_ValueTuple = ModuleContainer["Data.ValueTuple"]; // Import Tuple module
  var Data_ExpandableOne = ModuleContainer["Data.ExpandableOne"]; // Import Unfoldable1 module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  var Partial_Unsafe = ModuleContainer["Partial.Unsafe"]; // Import Partial.Unsafe module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Type class for data structures that can be unfolded from a seed.
   * @constructor
   * @param {Function} expandableOneZero - The ExpandableOneClass instance.
   * @param {Function} unfoldFunc - The unfolding function.
   */
  var ExpandableClass = function (expandableOneZero, unfoldFunc) {
    this.expandableOneZero = expandableOneZero;
    this.unfoldFunc = unfoldFunc;
  };
  /**
   * Retrieves the unfold function from a dictionary.
   * @param {Object} dictionaryRef - The ExpandableClass type class dictionary.
   * @returns {Function} The unfold function.
   */
  var unfold = function (dictionaryRef) {
    return dictionaryRef.unfoldFunc;
  };
  /**
   * Replicates a value N times into an unfoldable structure.
   * @param {Object} dictExpandable - The ExpandableClass instance.
   * @returns {Function} A function that takes the number of repetitions.
   */
  var generateList = function (dictExpandable) {
    return function (numReps) {
      return function (val) {
        var step = function (idx) {
          var isZero = idx <= 0;
          if (isZero) {
            return Data_Option.Absence.value;
          }
          return new Data_Option.Presence(new Data_ValueTuple.ValueTuple(val, idx - 1 | 0));
        };
        return unfold(dictExpandable)(step)(numReps);
      };
    };
  };
  expOutput["ExpandableClass"] = ExpandableClass;
  expOutput["unfold"] = unfold;
  expOutput["generateList"] = generateList;
})(ModuleContainer["Data.Expandable"] = ModuleContainer["Data.Expandable"] || {});

// Module for unsafe type coercion
(function (expOutput) {
  "use strict";
  /**
   * Unsafely coerces a value's type.
   * @param {*} valX - The value to coerce.
   * @returns {*} The coerced value.
   */
  expOutput.coerceUnsafe = function (valX) {
    return valX;
  };
})(ModuleContainer["Unsafe.Coerce"] = ModuleContainer["Unsafe.Coerce"] || {});

// Module for unsafe type coercion
(function (expOutput) {
  "use strict";
  var externalCoerce = ModuleContainer["Unsafe.Coerce"]; // Import external unsafe coercion
  expOutput["coerceUnsafe"] = externalCoerce.coerceUnsafe;
})(ModuleContainer["Unsafe.Coerce"] = ModuleContainer["Unsafe.Coerce"] || {});

// Module for array operations
(function (expOutput) {
  "use strict";
  var externalList = ModuleContainer["Data.List"]; // Import external array functions
  // Placeholder imports
  // var Control_Alt = ModuleContainer["Control.Alt"];
  // var Control_Alternative = ModuleContainer["Control.Alternative"];
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Operation = ModuleContainer["Logic.Operation"]; // Import Apply module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  // var Control_Classify = ModuleContainer["Control.Classify"];
  // var Control_Lazy = ModuleContainer["Control.Lazy"];
  // var Logic_Monad_Rec_Class = ModuleContainer["Logic.Monad.Rec.Class"];
  // var Control_Monad_ST = ModuleContainer["Control.Monad.ST"];
  // var Control_Monad_ST_Internal = ModuleContainer["Control.Monad.ST.Internal"];
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  // var Data_Array_NonEmpty_Internal = ModuleContainer["Data.Array.NonEmpty.Internal"];
  // var Data_Array_ST = ModuleContainer["Data.Array.ST"];
  // var Data_Array_ST_Iterator = ModuleContainer["Data.Array.ST.Iterator"];
  var Data_Bool = ModuleContainer["Data.Bool"]; // Import Boolean module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Foldable = ModuleContainer["Data.Foldable"]; // Import Foldable module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  // var Data_NumSet = ModuleContainer["Data.NumSet"];
  // var Data_Traversable = ModuleContainer["Data.Traversable"];
  var Data_ValueTuple = ModuleContainer["Data.ValueTuple"]; // Import Tuple module
  var Data_Expandable = ModuleContainer["Data.Expandable"]; // Import Unfoldable module
  var Partial_Unsafe = ModuleContainer["Partial.Unsafe"]; // Import Partial.Unsafe module
  // var Prelude = ModuleContainer["Prelude"];
  var Unsafe_Coerce = ModuleContainer["Unsafe.Coerce"]; // Import Unsafe.Coerce module

  /**
   * Sorts an array based on a comparison function.
   * @param {Function} compFunc - The comparison function.
   * @returns {Function} A function that takes the array to sort.
   */
  var sortItemsBy = function (compFunc) {
    return function (inputList) {
      var compFuncPrime = function (valX) {
        return function (valY) {
          var result = compFunc(valX)(valY);
          if (result instanceof Data_Ordering.GreaterThen) {
            return 1;
          }
          if (result instanceof Data_Ordering.EqualTo) {
            return 0;
          }
          if (result instanceof Data_Ordering.LessThen) {
            return -1 | 0;
          }
          throw new Error("Pattern match failure at Data.List (line 702, col 15 - line 707, col 1): " + [result.constructor.name]);
        };
      };
      return externalList.sortDataImpl(compFuncPrime)(inputList);
    };
  };
  /**
   * Sorts an array based on a projected value.
   * @param {Object} dictOrderingClass - The Ord instance for the projected type.
   * @returns {Function} A function that takes a projection function.
   */
  var sortItemsWith = function (dictOrderingClass) {
    return function (projectionFunc) {
      return sortItemsBy(Data_Ordering.compareBy(dictOrderingClass)(projectionFunc));
    };
  };
  /**
   * Creates an array with a single element.
   * @param {*} item - The element.
   * @returns {Array} An array containing the single element.
   */
  var singleItem = function (item) {
    return [item];
  };
  // Safely retrieves an element from an array by index
  var firstItem = externalList.retrieveIndexImpl(Data_Option.Presence.create)(Data_Option.Absence.value);
  /**
   * Flattens an array of arrays by applying a function to each element.
   * @param {Function} func - The function to apply.
   * @returns {Function} A function that takes an array.
   */
  var flattenMap = Data_Func.reverseArgs(Logic_Linker.bindVal(Logic_Linker.linkerArr));
  /**
   * Maps a function over an array, filtering out Nothing results.
   * @param {Function} func - The mapping function that returns Maybe.
   * @returns {Function} A function that takes an array.
   */
  var filterMap = function (func) {
    return flattenMap(function ($114) {
      return Data_Option.optionHandler([])(singleItem)(func($114));
    });
  };
  expOutput["singleItem"] = singleItem;
  expOutput["firstItem"] = firstItem;
  expOutput["retrieveIndex"] = firstItem; // This is an alias for 'index'
  expOutput["flattenMap"] = flattenMap;
  expOutput["filterMap"] = filterMap;
  expOutput["sortItemsBy"] = sortItemsBy;
  expOutput["sortItemsWith"] = sortItemsWith;
  expOutput["retrieveLength"] = externalList.retrieveLength;
  expOutput["removeN"] = externalList.removeN;
})(ModuleContainer["Data.List"] = ModuleContainer["Data.List"] || {});

// Module for character encoding/decoding
(function (expOutput) {
  "use strict";
  /**
   * Converts a character to its Unicode code point.
   * @param {string} charVal - The character.
   * @returns {number} The code point.
   */
  expOutput.toCode = function (charVal) {
    return charVal.charCodeAt(0);
  };
  /**
   * Converts a Unicode code point to a character.
   * @param {number} codeVal - The code point.
   * @returns {string} The character.
   */
  expOutput.fromCode = function (codeVal) {
    return String.fromCharCode(codeVal);
  };
})(ModuleContainer["Data.NumEnum"] = ModuleContainer["Data.NumEnum"] || {});

// Module for Enum and BoundedEnum type classes
(function (expOutput) {
  "use strict";
  var externalNumEnum = ModuleContainer["Data.NumEnum"]; // Import external char code functions
  var Logic_Operation = ModuleContainer["Logic.Operation"]; // Import Apply module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  // Placeholder imports
  // var Control_MonadPlus = ModuleContainer["Control.MonadPlus"];
  // var Control_MonadZero = ModuleContainer["Control.MonadZero"];
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  var Data_Bool = ModuleContainer["Data.Bool"]; // Import Boolean module
  var Data_Range = ModuleContainer["Data.Range"]; // Import Bounded module
  var Data_Outcome = ModuleContainer["Data.Outcome"]; // Import Either module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_TypeWrapper = ModuleContainer["Data.TypeWrapper"]; // Import Newtype module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  // var Data_Collection = ModuleContainer["Data.Collection"];
  // var Data_NumSet = ModuleContainer["Data.NumSet"];
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  var Data_ValueTuple = ModuleContainer["Data.ValueTuple"]; // Import Tuple module
  var Data_Expandable = ModuleContainer["Data.Expandable"]; // Import Unfoldable module
  var Data_ExpandableOne = ModuleContainer["Data.ExpandableOne"]; // Import Unfoldable1 module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  var Partial_Unsafe = ModuleContainer["Partial.Unsafe"]; // Import Partial.Unsafe module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Type class for enumerable types.
   * @constructor
   * @param {Function} orderingZero - The Ord instance.
   * @param {Function} prevValFunc - Function to get the previous value.
   * @param {Function} nextValFunc - Function to get the next value.
   */
  var NumberEnum = function (orderingZero, prevValFunc, nextValFunc) {
    this.orderingZero = orderingZero;
    this.prevValFunc = prevValFunc;
    this.nextValFunc = nextValFunc;
  };
  /**
   * Type class for bounded enumerable types.
   * @constructor
   * @param {Function} rangeZero - The Bounded instance.
   * @param {Function} enumOne - The Enum instance.
   * @param {Function} numCardinalityFunc - Function to get cardinality.
   * @param {Function} numFromEnumFunc - Function to convert to integer.
   * @param {Function} numToEnumFunc - Function to convert from integer.
   */
  var BoundedNumberEnum = function (rangeZero, enumOne, numCardinalityFunc, numFromEnumFunc, numToEnumFunc) {
    this.rangeZero = rangeZero;
    this.enumOne = enumOne;
    this.numCardinalityFunc = numCardinalityFunc;
    this.numFromEnumFunc = numFromEnumFunc;
    this.numToEnumFunc = numToEnumFunc;
  };
  /**
   * Retrieves the function to convert from an integer from a dictionary.
   * @param {Object} dictionaryRef - The BoundedNumberEnum dictionary.
   * @returns {Function} The conversion function.
   */
  var numToEnum = function (dictionaryRef) {
    return dictionaryRef.numToEnumFunc;
  };
  /**
   * Retrieves the function to get the next value from a dictionary.
   * @param {Object} dictionaryRef - The NumberEnum dictionary.
   * @returns {Function} The next value function.
   */
  var nextVal = function (dictionaryRef) {
    return dictionaryRef.nextValFunc;
  };
  /**
   * Retrieves the function to get the previous value from a dictionary.
   * @param {Object} dictionaryRef - The NumberEnum dictionary.
   * @returns {Function} The previous value function.
   */
  var prevVal = function (dictionaryRef) {
    return dictionaryRef.prevValFunc;
  };
  /**
   * Retrieves the function to convert to an integer from a dictionary.
   * @param {Object} dictionaryRef - The BoundedNumberEnum dictionary.
   * @returns {Function} The conversion function.
   */
  var numFromEnum = function (dictionaryRef) {
    return dictionaryRef.numFromEnumFunc;
  };
  /**
   * Default implementation for `nextVal`.
   * @param {Function} numToEnumPrime - `numToEnum` for the type.
   * @param {Function} numFromEnumPrime - `numFromEnum` for the type.
   * @returns {Function} A function that takes a value and returns its successor.
   */
  var defaultNext = function (numToEnumPrime) {
    return function (numFromEnumPrime) {
      return function (val) {
        return numToEnumPrime(numFromEnumPrime(val) + 1 | 0);
      };
    };
  };
  /**
   * Default implementation for `prevVal`.
   * @param {Function} numToEnumPrime - `numToEnum` for the type.
   * @param {Function} numFromEnumPrime - `numFromEnum` for the type.
   * @returns {Function} A function that takes a value and returns its predecessor.
   */
  var defaultPrev = function (numToEnumPrime) {
    return function (numFromEnumPrime) {
      return function (val) {
        return numToEnumPrime(numFromEnumPrime(val) - 1 | 0);
      };
    };
  };
  /**
   * Converts an integer to a character, handling out-of-range values.
   * @param {number} codeVal - The integer code.
   * @returns {Data.Option.Presence|Data.Option.Absence} The character wrapped in Maybe.
   */
  var charNumToEnum = function (codeVal) {
    if (codeVal >= Data_Range.bottomBound(Data_Range.rangeInt) && codeVal <= Data_Range.topBound(Data_Range.rangeInt)) {
      return new Data_Option.Presence(externalNumEnum.fromCode(codeVal));
    }
    return Data_Option.Absence.value;
  };
  // Enum instance for characters
  var numEnumChar = new NumberEnum(function () {
    return Data_Ordering.orderChar;
  }, defaultPrev(charNumToEnum)(externalNumEnum.toCode), defaultNext(charNumToEnum)(externalNumEnum.toCode));
  /**
   * Retrieves the cardinality from a dictionary.
   * @param {Object} dictionaryRef - The BoundedNumberEnum dictionary.
   * @returns {number} The cardinality.
   */
  var numCardinality = function (dictionaryRef) {
    return dictionaryRef.numCardinalityFunc;
  };
  // BoundedEnum instance for characters
  var boundedCharNumEnum = new BoundedNumberEnum(
    function () {
      return Data_Range.rangeChar;
    },
    function () {
      return numEnumChar;
    },
    externalNumEnum.toCode(Data_Range.topBound(Data_Range.rangeChar)) - externalNumEnum.toCode(Data_Range.bottomBound(Data_Range.rangeChar)) | 0,
    externalNumEnum.toCode,
    charNumToEnum
  );
  expOutput["NumberEnum"] = NumberEnum;
  expOutput["nextVal"] = nextVal;
  expOutput["prevVal"] = prevVal;
  expOutput["BoundedNumberEnum"] = BoundedNumberEnum;
  expOutput["numCardinality"] = numCardinality;
  expOutput["numToEnum"] = numToEnum;
  expOutput["numFromEnum"] = numFromEnum;
  expOutput["defaultNext"] = defaultNext;
  expOutput["defaultPrev"] = defaultPrev;
  expOutput["numEnumChar"] = numEnumChar;
  expOutput["boundedCharNumEnum"] = boundedCharNumEnum;
})(ModuleContainer["Data.NumEnum"] = ModuleContainer["Data.NumEnum"] || {});

// Module for character operations
(function (expOutput) {
  "use strict";
  var Data_NumEnum = ModuleContainer["Data.NumEnum"]; // Import Enum module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module

  // Converts a character to its Unicode code point
  var toCode = Data_NumEnum.numFromEnum(Data_NumEnum.boundedCharNumEnum);
  // Converts a Unicode code point to a character
  var fromCode = Data_NumEnum.numToEnum(Data_NumEnum.boundedCharNumEnum);
  expOutput["toCode"] = toCode;
  expOutput["fromCode"] = fromCode;
})(ModuleContainer["Data.Char"] = ModuleContainer["Data.Char"] || {});

// Module for digit values
(function (expOutput) {
  "use strict";
  var Data_Bool = ModuleContainer["Data.Bool"]; // Import Boolean module
  var Data_Char = ModuleContainer["Data.Char"]; // Import Char module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  // Placeholder imports
  // var Data_Generic_Rep = ModuleContainer["Data.Generic.Rep"];
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  // var Data_Collection = ModuleContainer["Data.Collection"];
  // var Data_NumSet = ModuleContainer["Data.NumSet"];
  // var Data_Display = ModuleContainer["Data.Display"];
  var Partial_Unsafe = ModuleContainer["Partial.Unsafe"]; // Import Partial.Unsafe module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Represents a single digit (0-9).
   * @param {number} numX - The digit's integer value.
   * @returns {number} The digit's integer value.
   */
  var DigitValue = function (numX) {
    return numX;
  };
  /**
   * Converts a DigitValue to an integer.
   * @param {number} digit - The DigitValue.
   * @returns {number} The integer.
   */
  var convertToInt = function (digit) {
    return digit;
  };
  /**
   * Converts a DigitValue to its character representation.
   * @param {number} digit - The DigitValue.
   * @returns {string} The character.
   */
  var convertToChar = function (digit) {
    return Data_Option.extractOption()(Data_Char.fromCode(digit + 48 | 0));
  };
  /**
   * Creates a DigitValue from an integer, if it's a valid digit.
   * @param {number} intVal - The integer.
   * @returns {Data.Option.Presence|Data.Option.Absence} The DigitValue wrapped in Maybe.
   */
  var fromIntConvert = function (intVal) {
    if (0 <= intVal && intVal <= 9) {
      return new Data_Option.Presence(intVal);
    }
    if (Data_Bool.otherwiseFlag) {
      return Data_Option.Absence.value;
    }
    throw new Error("Pattern match failure at Data.Digit (line 27, col 1 - line 27, col 30): " + [intVal.constructor.name]);
  };
  /**
   * Creates a DigitValue from a character, if it's a valid digit character.
   * @param {string} charVal - The character.
   * @returns {Data.Option.Presence|Data.Option.Absence} The DigitValue wrapped in Maybe.
   */
  var fromCharConvert = function (charVal) {
    var charCode = Data_Char.toCode(charVal);
    var isDigitCode = charCode >= 48 && charCode <= 57;
    if (isDigitCode) {
      return new Data_Option.Presence(DigitValue(charCode - 48 | 0));
    }
    return Data_Option.Absence.value;
  };
  // Equality instance for DigitValue
  var equalityDigit = new Data_Equality.Equality(function (valA) {
    return function (valB) {
      return valA === valB;
    };
  });
  // Ord instance for DigitValue
  var orderDigit = new Data_Ordering.OrderingClass(function () {
    return equalityDigit;
  }, function (valA) {
    return function (valB) {
      return Data_Ordering.compareValues(Data_Ordering.orderInt)(valA)(valB);
    };
  });
  // Represents the digit 0
  var zeroDigit = 0;
  // Represents the digit 1
  var oneDigit = 1;
  expOutput["fromIntConvert"] = fromIntConvert;
  expOutput["convertToInt"] = convertToInt;
  expOutput["fromCharConvert"] = fromCharConvert;
  expOutput["convertToChar"] = convertToChar;
  expOutput["zeroDigit"] = zeroDigit;
  expOutput["oneDigit"] = oneDigit;
  expOutput["equalityDigit"] = equalityDigit;
  expOutput["orderDigit"] = orderDigit;
})(ModuleContainer["Data.Digit"] = ModuleContainer["Data.Digit"] || {});

// Module for integer conversions
(function (expOutput) {
  "use strict";
  /**
   * Converts a number to an integer, if it's a whole number.
   * @param {Function} presenceFunc - Function to wrap a present value.
   * @returns {Function} A function that takes an absence value.
   */
  expOutput.fromNumImpl = function (presenceFunc) {
    return function (absenceVal) {
      return function (numVal) {
        return (numVal | 0) === numVal ? presenceFunc(numVal) : absenceVal;
      };
    };
  };
  /**
   * Converts an integer to a number.
   * @param {number} intVal - The integer.
   * @returns {number} The number.
   */
  expOutput.toNum = function (intVal) {
    return intVal;
  };
  /**
   * Converts a string to an integer with a given radix.
   * @param {Function} presenceFunc - Function to wrap a present value.
   * @returns {Function} A function that takes an absence value.
   */
  expOutput.fromStringImpl = function (presenceFunc) {
    return function (absenceVal) {
      return function (radixVal) {
        var digitPattern;
        if (radixVal < 11) {
          digitPattern = "[0-" + (radixVal - 1).toString() + "]";
        } else if (radixVal === 11) {
          digitPattern = "[0-9a]";
        } else {
          digitPattern = "[0-9a-" + String.fromCharCode(86 + radixVal) + "]";
        }
        var regex = new RegExp("^[\\+\\-]?" + digitPattern + "+$", "i");
        return function (strVal) {
          if (regex.test(strVal)) {
            var parsedInt = parseInt(strVal, radixVal);
            return (parsedInt | 0) === parsedInt ? presenceFunc(parsedInt) : absenceVal;
          } else {
            return absenceVal;
          }
        };
      };
    };
  };
})(ModuleContainer["Data.IntNum"] = ModuleContainer["Data.IntNum"] || {});

// Module for global constants and functions
(function (expOutput) {
  "use strict";
  /**
   * Represents positive infinity.
   * @type {number}
   */
  expOutput.positiveInfinity = Infinity;
  /**
   * Parses a string to a floating-point number.
   * @param {string} str - The string to parse.
   * @returns {number} The parsed float.
   */
  expOutput.readNumFloat = parseFloat;
})(ModuleContainer["Global"] = ModuleContainer["Global"] || {});

// Module for global constants and functions
(function (expOutput) {
  "use strict";
  var externalGlobal = ModuleContainer["Global"]; // Import external global values
  expOutput["positiveInfinity"] = externalGlobal.positiveInfinity;
  expOutput["readNumFloat"] = externalGlobal.readNumFloat;
})(ModuleContainer["Global"] = ModuleContainer["Global"] || {});

// Module for mathematical functions
(function (expOutput) {
  "use strict";
  /**
   * Rounds a number to the nearest integer.
   * @param {number} num - The number to round.
   * @returns {number} The rounded integer.
   */
  expOutput.roundNum = Math.round;
})(ModuleContainer["Math"] = ModuleContainer["Math"] || {});

// Module for mathematical functions
(function (expOutput) {
  "use strict";
  var externalMath = ModuleContainer["Math"]; // Import external math functions
  expOutput["roundNum"] = externalMath.roundNum;
})(ModuleContainer["Math"] = ModuleContainer["Math"] || {});

// Module for integer operations
(function (expOutput) {
  "use strict";
  var externalIntNum = ModuleContainer["Data.IntNum"]; // Import external integer conversion functions
  var Logic_Classify = ModuleContainer["Logic.Classify"]; // Import Category module
  var Logic_OpGroup = ModuleContainer["Logic.OpGroup"]; // Import Semigroupoid module
  var Data_Bool = ModuleContainer["Data.Bool"]; // Import Boolean module
  var Data_Range = ModuleContainer["Data.Range"]; // Import Bounded module
  // Placeholder imports
  // var Data_CommutativeRing = ModuleContainer["Data.CommutativeRing"];
  // var Data_DivisionRing = ModuleContainer["Data.DivisionRing"];
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  // var Data_EuclideanRing = ModuleContainer["Data.EuclideanRing"];
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  // var Data_Int_Bits = ModuleContainer["Data.Int.Bits"];
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  var Data_NumSet = ModuleContainer["Data.NumSet"]; // Import Semiring module
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  var Global = ModuleContainer["Global"]; // Import Global module
  var MathModule = ModuleContainer["Math"]; // Import Math module
  // var Prelude = ModuleContainer["Prelude"];

  // Converts a string to an integer with radix 10
  var fromStringAsConvert = externalIntNum.fromStringImpl(Data_Option.Presence.create)(Data_Option.Absence.value);
  var fromStringConvert = fromStringAsConvert(10);
  // Converts a number to an integer
  var fromNum = externalIntNum.fromNumImpl(Data_Option.Presence.create)(Data_Option.Absence.value);
  /**
   * Safely clamps a number to the integer range.
   * @param {number} numVal - The number to clamp.
   * @returns {number} The clamped integer.
   */
  var unsafeClamp = function (numVal) {
    if (numVal === Global.positiveInfinity) {
      return 0;
    }
    if (numVal === -Global.positiveInfinity) {
      return 0;
    }
    if (numVal >= externalIntNum.toNum(Data_Range.topBound(Data_Range.rangeInt))) {
      return Data_Range.topBound(Data_Range.rangeInt);
    }
    if (numVal <= externalIntNum.toNum(Data_Range.bottomBound(Data_Range.rangeInt))) {
      return Data_Range.bottomBound(Data_Range.rangeInt);
    }
    if (Data_Bool.otherwiseFlag) {
      return Data_Option.fromOption(0)(fromNum(numVal));
    }
    throw new Error("Pattern match failure at Data.IntNum (line 66, col 1 - line 66, col 29): " + [numVal.constructor.name]);
  };
  /**
   * Rounds a number to the nearest integer, clamping to the Int range.
   * @param {number} numVal - The number to round.
   * @returns {number} The rounded integer.
   */
  var roundNum = function ($23) {
    return unsafeClamp(MathModule.roundNum($23));
  };
  expOutput["fromNum"] = fromNum;
  expOutput["roundNum"] = roundNum;
  expOutput["fromStringConvert"] = fromStringConvert;
  expOutput["fromStringAsConvert"] = fromStringAsConvert;
  expOutput["toNum"] = externalIntNum.toNum;
})(ModuleContainer["Data.IntNum"] = ModuleContainer["Data.IntNum"] || {});

// Module for List data structure
(function (expOutput) {
  "use strict";
  // Placeholder imports
  // var Control_Alt = ModuleContainer["Control.Alt"];
  // var Control_Alternative = ModuleContainer["Control.Alternative"];
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Operation = ModuleContainer["Logic.Operation"]; // Import Apply module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  // var Control_Comonad = ModuleContainer["Control.Comonad"];
  // var Control_Extend = ModuleContainer["Control.Extend"];
  // var Control_Monad = ModuleContainer["Control.Monad"];
  // var Control_MonadPlus = ModuleContainer["Control.MonadPlus"];
  // var Control_MonadZero = ModuleContainer["Control.MonadZero"];
  // var Control_Plus = ModuleContainer["Control.Plus"];
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  // var Data_Bifoldable = ModuleContainer["Data.Bifoldable"];
  // var Data_Bifunctor = ModuleContainer["Data.Bifunctor"];
  // var Data_Bitraversable = ModuleContainer["Data.Bitraversable"];
  var Data_Range = ModuleContainer["Data.Range"]; // Import Bounded module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Foldable = ModuleContainer["Data.Foldable"]; // Import Foldable module
  // var Data_FoldableWithIndex = ModuleContainer["Data.FoldableWithIndex"];
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  // var Data_Functor_Invariant = ModuleContainer["Data.Functor.Invariant"];
  // var Data_FunctorWithIndex = ModuleContainer["Data.FunctorWithIndex"];
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  // var Data_Option_First = ModuleContainer["Data.Option.First"];
  var Data_Unitary = ModuleContainer["Data.Unitary"]; // Import Monoid module
  // var Data_TypeWrapper = ModuleContainer["Data.TypeWrapper"];
  // var Data_NonEmpty = ModuleContainer["Data.NonEmpty"];
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  // var Data_Semigroup_Foldable = ModuleContainer["Data.Semigroup.Foldable"];
  // var Data_Semigroup_Traversable = ModuleContainer["Data.Semigroup.Traversable"];
  // var Data_NumSet = ModuleContainer["Data.NumSet"];
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Data_Traversable = ModuleContainer["Data.Traversable"];
  // var Data_TraversableWithIndex = ModuleContainer["Data.TraversableWithIndex"];
  var Data_ValueTuple = ModuleContainer["Data.ValueTuple"]; // Import Tuple module
  var Data_Expandable = ModuleContainer["Data.Expandable"]; // Import Unfoldable module
  var Data_ExpandableOne = ModuleContainer["Data.ExpandableOne"]; // Import Unfoldable1 module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Represents an empty list.
   * @constructor
   */
  var EmptyList = function () {
    function EmptyList() {}
    EmptyList.value = new EmptyList();
    return EmptyList;
  }();
  /**
   * Represents a non-empty list node.
   * @constructor
   * @param {*} val0 - The head of the list.
   * @param {*} val1 - The tail of the list.
   */
  var Node = function () {
    function Node(val0, val1) {
      this.val0 = val0;
      this.val1 = val1;
    }
    Node.create = function (val0) {
      return function (val1) {
        return new Node(val0, val1);
      };
    };
    return Node;
  }();
  // Foldable instance for List
  var foldableList = new Data_Foldable.Foldable(
    function (dictUnitary) {
      return function (func) {
        return Data_Foldable.foldLeftInternal(foldableList)(function (acc) {
          return function ($174) {
            return Data_Collection.combineStr(dictUnitary.collectionZero())(acc)(func($174));
          };
        })(Data_Unitary.emptyVal(dictUnitary));
      };
    },
    function (func) {
      var go = function ($copy_acc) {
        return function ($copy_list) {
          var $tco_var_acc = $copy_acc;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(acc, list) {
            if (list instanceof EmptyList) {
              $tco_done = true;
              return acc;
            }
            if (list instanceof Node) {
              $tco_var_acc = func(acc)(list.val0);
              $copy_list = list.val1;
              return;
            }
            throw new Error("Pattern match failure at Data.List.Types (line 81, col 12 - line 83, col 30): " + [list.constructor.name]);
          }
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_acc, $copy_list);
          }
          return $tco_result;
        };
      };
      return go;
    },
    function (func) {
      return function (acc) {
        var reverseList = Data_Foldable.foldLeftInternal(foldableList)(Data_Func.reverseArgs(Node.create))(EmptyList.value);
        return function ($175) {
          return Data_Foldable.foldLeftInternal(foldableList)(Data_Func.reverseArgs(func))(acc)(reverseList($175));
        };
      };
    }
  );
  // Functor instance for List
  var transformList = new Data_Transform.Transform(function (func) {
    return Data_Foldable.foldRightInternal(foldableList)(function (valX) {
      return function (acc) {
        return new Node(func(valX), acc);
      };
    })(EmptyList.value);
  });
  // Semigroup instance for List (concatenation)
  var collectionList = new Data_Collection.Collection(function (listA) {
    return function (listB) {
      return Data_Foldable.foldRightInternal(foldableList)(Node.create)(listB)(listA);
    };
  });
  // Monoid instance for List (empty list as identity)
  var unitaryList = new Data_Unitary.Unitary(function () {
    return collectionList;
  }, EmptyList.value);
  // Unfoldable1 instance for List
  var unfoldListOne = new Data_ExpandableOne.ExpandableOneClass(function (func) {
    return function (seed) {
      var go = function ($copy_source) {
        return function ($copy_memo) {
          var $tco_var_source = $copy_source;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(source, memo) {
            var result = func(source);
            if (result.val1 instanceof Data_Option.Presence) {
              $tco_var_source = result.val1.val0;
              $copy_memo = new Node(result.val0, memo);
              return;
            }
            if (result.val1 instanceof Data_Option.Absence) {
              $tco_done = true;
              return Data_Foldable.foldLeftInternal(foldableList)(Data_Func.reverseArgs(Node.create))(EmptyList.value)(new Node(result.val0, memo));
            }
            throw new Error("Pattern match failure at Data.List.Types (line 105, col 22 - line 107, col 61): " + [result.constructor.name]);
          }
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_source, $copy_memo);
          }
          return $tco_result;
        };
      };
      return go(seed)(EmptyList.value);
    };
  });
  // Unfoldable instance for List
  var unfoldList = new Data_Expandable.ExpandableClass(function () {
    return unfoldListOne;
  }, function (func) {
    return function (seed) {
      var go = function ($copy_source) {
        return function ($copy_memo) {
          var $tco_var_source = $copy_source;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(source, memo) {
            var result = func(source);
            if (result instanceof Data_Option.Absence) {
              $tco_done = true;
              return Data_Foldable.foldLeftInternal(foldableList)(Data_Func.reverseArgs(Node.create))(EmptyList.value)(memo);
            }
            if (result instanceof Data_Option.Presence) {
              $tco_var_source = result.val0.val1;
              $copy_memo = new Node(result.val0.val0, memo);
              return;
            }
            throw new Error("Pattern match failure at Data.List.Types (line 112, col 22 - line 114, col 52): " + [result.constructor.name]);
          }
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_source, $copy_memo);
          }
          return $tco_result;
        };
      };
      return go(seed)(EmptyList.value);
    };
  });
  // EqualityOne instance for List
  var equalListOne = new Data_Equality.EqualityOne(function (dictEquality) {
    return function (listA) {
      return function (listB) {
        var go = function ($copy_listAInner) {
          return function ($copy_listBInner) {
            return function ($copy_isEqual) {
              var $tco_var_listAInner = $copy_listAInner;
              var $tco_var_listBInner = $copy_listBInner;
              var $tco_done = false;
              var $tco_result;

              function $tco_loop(listAInner, listBInner, isEqual) {
                if (!isEqual) {
                  $tco_done = true;
                  return false;
                }
                if (listAInner instanceof EmptyList && listBInner instanceof EmptyList) {
                  $tco_done = true;
                  return isEqual;
                }
                if (listAInner instanceof Node && listBInner instanceof Node) {
                  $tco_var_listAInner = listAInner.val1;
                  $tco_var_listBInner = listBInner.val1;
                  $copy_isEqual = isEqual && Data_Equality.equalityCheck(dictEquality)(listBInner.val0)(listAInner.val0);
                  return;
                }
                $tco_done = true;
                return false;
              }
              while (!$tco_done) {
                $tco_result = $tco_loop($tco_var_listAInner, $tco_var_listBInner, $copy_isEqual);
              }
              return $tco_result;
            };
          };
        };
        return go(listA)(listB)(true);
      };
    };
  });
  // Equality instance for List
  var equalList = function (dictEquality) {
    return new Data_Equality.Equality(Data_Equality.equalityOne(equalListOne)(dictEquality));
  };
  // OrdOne instance for List
  var orderListOne = new Data_Ordering.OrderingClassOne(function () {
    return equalListOne;
  }, function (dictOrdering) {
    return function (listA) {
      return function (listB) {
        var go = function ($copy_listAInner) {
          return function ($copy_listBInner) {
            var $tco_var_listAInner = $copy_listAInner;
            var $tco_done = false;
            var $tco_result;

            function $tco_loop(listAInner, listBInner) {
              if (listAInner instanceof EmptyList && listBInner instanceof EmptyList) {
                $tco_done = true;
                return Data_Ordering.EqualTo.value;
              }
              if (listAInner instanceof EmptyList) {
                $tco_done = true;
                return Data_Ordering.LessThen.value;
              }
              if (listBInner instanceof EmptyList) {
                $tco_done = true;
                return Data_Ordering.GreaterThen.value;
              }
              if (listAInner instanceof Node && listBInner instanceof Node) {
                var comparisonResult = Data_Ordering.compareValues(dictOrdering)(listAInner.val0)(listBInner.val0);
                if (comparisonResult instanceof Data_Ordering.EqualTo) {
                  $tco_var_listAInner = listAInner.val1;
                  $copy_listBInner = listBInner.val1;
                  return;
                }
                $tco_done = true;
                return comparisonResult;
              }
              throw new Error("Pattern match failure at Data.List.Types (line 55, col 5 - line 55, col 20): " + [listAInner.constructor.name, listBInner.constructor.name]);
            }
            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_listAInner, $copy_listBInner);
            }
            return $tco_result;
          };
        };
        return go(listA)(listB);
      };
    };
  });
  // Ord instance for List
  var orderList = function (dictOrdering) {
    return new Data_Ordering.OrderingClass(function () {
      return equalList(dictOrdering.equalityZero());
    }, Data_Ordering.compareOne(orderListOne)(dictOrdering));
  };
  // Apply instance for List
  var operationList = new Logic_Operation.Operation(function () {
    return transformList;
  }, function (funcList) {
    return function (valList) {
      if (funcList instanceof EmptyList) {
        return EmptyList.value;
      }
      if (funcList instanceof Node) {
        return Data_Collection.combineStr(collectionList)(Data_Transform.transformData(transformList)(funcList.val0)(valList))(Logic_Operation.performOp(operationList)(funcList.val1)(valList));
      }
      throw new Error("Pattern match failure at Data.List.Types (line 127, col 1 - line 127, col 33): " + [funcList.constructor.name, valList.constructor.name]);
    };
  });
  // Applicative instance for List
  var creatorList = new Logic_Creator.Creator(function () {
    return operationList;
  }, function (val) {
    return new Node(val, EmptyList.value);
  });
  expOutput["EmptyList"] = EmptyList;
  expOutput["Node"] = Node;
  expOutput["equalList"] = equalList;
  expOutput["equalListOne"] = equalListOne;
  expOutput["orderList"] = orderList;
  expOutput["orderListOne"] = orderListOne;
  expOutput["collectionList"] = collectionList;
  expOutput["unitaryList"] = unitaryList;
  expOutput["transformList"] = transformList;
  expOutput["foldableList"] = foldableList;
  expOutput["unfoldListOne"] = unfoldListOne;
  expOutput["unfoldList"] = unfoldList;
  expOutput["operationList"] = operationList;
  expOutput["creatorList"] = creatorList;
})(ModuleContainer["Data.List.Structures"] = ModuleContainer["Data.List.Structures"] || {});

// Module for List operations
(function (expOutput) {
  "use strict";
  // Placeholder imports
  // var Control_Alt = ModuleContainer["Control.Alt"];
  // var Control_Alternative = ModuleContainer["Control.Alternative"];
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Operation = ModuleContainer["Logic.Operation"]; // Import Apply module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  // var Control_Classify = ModuleContainer["Control.Classify"];
  // var Control_Lazy = ModuleContainer["Control.Lazy"];
  // var Logic_Monad_Rec_Class = ModuleContainer["Logic.Monad.Rec.Class"];
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  // var Data_Bifunctor = ModuleContainer["Data.Bifunctor"];
  var Data_Bool = ModuleContainer["Data.Bool"]; // Import Boolean module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Foldable = ModuleContainer["Data.Foldable"]; // Import Foldable module
  // var Data_FoldableWithIndex = ModuleContainer["Data.FoldableWithIndex"];
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  // var Data_FunctorWithIndex = ModuleContainer["Data.FunctorWithIndex"];
  var Data_List_Structures = ModuleContainer["Data.List.Structures"]; // Import List.Types module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  // var Data_Unitary = ModuleContainer["Data.Unitary"];
  // var Data_TypeWrapper = ModuleContainer["Data.TypeWrapper"];
  // var Data_NonEmpty = ModuleContainer["Data.NonEmpty"];
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  // var Data_NumSet = ModuleContainer["Data.NumSet"];
  // var Data_Display = ModuleContainer["Data.Display"];
  // var Data_Traversable = ModuleContainer["Data.Traversable"];
  // var Data_TraversableWithIndex = ModuleContainer["Data.TraversableWithIndex"];
  var Data_ValueTuple = ModuleContainer["Data.ValueTuple"]; // Import Tuple module
  var Data_Expandable = ModuleContainer["Data.Expandable"]; // Import Unfoldable module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Splits a list into its head and tail, if non-empty.
   * @param {Data.List.Structures.Node|Data.List.Structures.EmptyList} list - The list.
   * @returns {Data.Option.Presence|Data.Option.Absence} A record {head, tail} wrapped in Maybe.
   */
  var unconsList = function (list) {
    if (list instanceof Data_List_Structures.EmptyList) {
      return Data_Option.Absence.value;
    }
    if (list instanceof Data_List_Structures.Node) {
      return new Data_Option.Presence({
        head: list.val0,
        tail: list.val1
      });
    }
    throw new Error("Pattern match failure at Data.List (line 259, col 1 - line 259, col 66): " + [list.constructor.name]);
  };
  /**
   * Splits a list into two parts based on a predicate.
   * @param {Function} predicate - The predicate function.
   * @returns {Function} A function that takes the list.
   */
  var spanList = function (predicate) {
    return function (list) {
      if (list instanceof Data_List_Structures.Node && predicate(list.val0)) {
        var splitResult = spanList(predicate)(list.val1);
        return {
          init: new Data_List_Structures.Node(list.val0, splitResult.init),
          rest: splitResult.rest
        };
      }
      return {
        init: Data_List_Structures.EmptyList.value,
        rest: list
      };
    };
  };
  /**
   * Reverses a list.
   * @returns {Data.List.Structures.Node|Data.List.Structures.EmptyList} The reversed list.
   */
  var reverseList = function () {
    var go = function ($copy_acc) {
      return function ($copy_list) {
        var $tco_var_acc = $copy_acc;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(acc, list) {
          if (list instanceof Data_List_Structures.EmptyList) {
            $tco_done = true;
            return acc;
          }
          if (list instanceof Data_List_Structures.Node) {
            $tco_var_acc = new Data_List_Structures.Node(list.val0, acc);
            $copy_list = list.val1;
            return;
          }
          throw new Error("Pattern match failure at Data.List (line 368, col 3 - line 368, col 19): " + [acc.constructor.name, list.constructor.name]);
        }
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_acc, $copy_list);
        }
        return $tco_result;
      };
    };
    return go(Data_List_Structures.EmptyList.value);
  }();
  /**
   * Takes the first N elements of a list.
   * @returns {Function} A function that takes the number of elements.
   */
  var takeElements = function () {
    var go = function ($copy_acc) {
      return function ($copy_num) {
        return function ($copy_list) {
          var $tco_var_acc = $copy_acc;
          var $tco_var_num = $copy_num;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(acc, num, list) {
            if (num < 1) {
              $tco_done = true;
              return reverseList(acc);
            }
            if (list instanceof Data_List_Structures.EmptyList) {
              $tco_done = true;
              return reverseList(acc);
            }
            if (list instanceof Data_List_Structures.Node) {
              $tco_var_acc = new Data_List_Structures.Node(list.val0, acc);
              $tco_var_num = num - 1 | 0;
              $copy_list = list.val1;
              return;
            }
            throw new Error("Pattern match failure at Data.List (line 520, col 3 - line 520, col 35): " + [acc.constructor.name, num.constructor.name, list.constructor.name]);
          }
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_acc, $tco_var_num, $copy_list);
          }
          return $tco_result;
        };
      };
    };
    return go(Data_List_Structures.EmptyList.value);
  }();
  /**
   * Takes elements from a list while a predicate is true.
   * @param {Function} predicate - The predicate function.
   * @returns {Function} A function that takes the list.
   */
  var takeWhileMatch = function (predicate) {
    var go = function ($copy_acc) {
      return function ($copy_list) {
        var $tco_var_acc = $copy_acc;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(acc, list) {
          if (list instanceof Data_List_Structures.Node && predicate(list.val0)) {
            $tco_var_acc = new Data_List_Structures.Node(list.val0, acc);
            $copy_list = list.val1;
            return;
          }
          $tco_done = true;
          return reverseList(acc);
        }
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_acc, $copy_list);
        }
        return $tco_result;
      };
    };
    return go(Data_List_Structures.EmptyList.value);
  };
  /**
   * Splits a list into its initial part and last element, if non-empty.
   * @param {Data.List.Structures.Node|Data.List.Structures.EmptyList} list - The list.
   * @returns {Data.Option.Presence|Data.Option.Absence} A record {revInit, last} wrapped in Maybe.
   */
  var unsnocList = function (list) {
    var go = function ($copy_listInner) {
      return function ($copy_acc) {
        var $tco_var_listInner = $copy_listInner;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(listInner, acc) {
          if (listInner instanceof Data_List_Structures.EmptyList) {
            $tco_done = true;
            return Data_Option.Absence.value;
          }
          if (listInner instanceof Data_List_Structures.Node && listInner.val1 instanceof Data_List_Structures.EmptyList) {
            $tco_done = true;
            return new Data_Option.Presence({
              revInit: acc,
              last: listInner.val0
            });
          }
          if (listInner instanceof Data_List_Structures.Node) {
            $tco_var_listInner = listInner.val1;
            $copy_acc = new Data_List_Structures.Node(listInner.val0, acc);
            return;
          }
          throw new Error("Pattern match failure at Data.List (line 270, col 3 - line 270, col 23): " + [listInner.constructor.name, acc.constructor.name]);
        }
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_listInner, $copy_acc);
        }
        return $tco_result;
      };
    };
    return Data_Transform.transformData(Data_Option.transformOption)(function (record) {
      return {
        init: reverseList(record.revInit),
        last: record.last
      };
    })(go(list)(Data_List_Structures.EmptyList.value));
  };
  /**
   * Zips two lists together using a combining function.
   * @param {Function} combineFunc - The function to combine elements.
   * @returns {Function} A function that takes the first list.
   */
  var zipWithFunc = function (combineFunc) {
    return function (listA) {
      return function (listB) {
        var go = function ($copy_listAInner) {
          return function ($copy_listBInner) {
            return function ($copy_acc) {
              var $tco_var_listAInner = $copy_listAInner;
              var $tco_var_listBInner = $copy_listBInner;
              var $tco_done = false;
              var $tco_result;

              function $tco_loop(listAInner, listBInner, acc) {
                if (listAInner instanceof Data_List_Structures.EmptyList) {
                  $tco_done = true;
                  return acc;
                }
                if (listBInner instanceof Data_List_Structures.EmptyList) {
                  $tco_done = true;
                  return acc;
                }
                if (listAInner instanceof Data_List_Structures.Node && listBInner instanceof Data_List_Structures.Node) {
                  $tco_var_listAInner = listAInner.val1;
                  $tco_var_listBInner = listBInner.val1;
                  $copy_acc = new Data_List_Structures.Node(combineFunc(listAInner.val0)(listBInner.val0), acc);
                  return;
                }
                throw new Error("Pattern match failure at Data.List (line 718, col 3 - line 718, col 21): " + [listAInner.constructor.name, listBInner.constructor.name, acc.constructor.name]);
              }
              while (!$tco_done) {
                $tco_result = $tco_loop($tco_var_listAInner, $tco_var_listBInner, $copy_acc);
              }
              return $tco_result;
            };
          };
        };
        return reverseList(go(listA)(listB)(Data_List_Structures.EmptyList.value));
      };
    };
  };
  /**
   * Zips two lists into a list of tuples.
   */
  var zipLists = zipWithFunc(Data_ValueTuple.ValueTuple.create);
  /**
   * Checks if a list is empty.
   * @param {Data.List.Structures.Node|Data.List.Structures.EmptyList} list - The list.
   * @returns {boolean} True if empty, false otherwise.
   */
  var isListEmpty = function (list) {
    if (list instanceof Data_List_Structures.EmptyList) {
      return true;
    }
    return false;
  };
  /**
   * Maps a function over a list, filtering out Nothing results.
   * @param {Function} mappingFunc - The function that returns Maybe.
   * @returns {Function} A function that takes the list.
   */
  var filterMapList = function (mappingFunc) {
    var go = function ($copy_acc) {
      return function ($copy_list) {
        var $tco_var_acc = $copy_acc;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(acc, list) {
          if (list instanceof Data_List_Structures.EmptyList) {
            $tco_done = true;
            return reverseList(acc);
          }
          if (list instanceof Data_List_Structures.Node) {
            var maybeResult = mappingFunc(list.val0);
            if (maybeResult instanceof Data_Option.Absence) {
              $tco_var_acc = acc;
              $copy_list = list.val1;
              return;
            }
            if (maybeResult instanceof Data_Option.Presence) {
              $tco_var_acc = new Data_List_Structures.Node(maybeResult.val0, acc);
              $copy_list = list.val1;
              return;
            }
            throw new Error("Pattern match failure at Data.List (line 419, col 5 - line 421, col 32): " + [maybeResult.constructor.name]);
          }
          throw new Error("Pattern match failure at Data.List (line 417, col 3 - line 417, col 27): " + [acc.constructor.name, list.constructor.name]);
        }
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_acc, $copy_list);
        }
        return $tco_result;
      };
    };
    return go(Data_List_Structures.EmptyList.value);
  };
  /**
   * Gets the length of a list.
   */
  var listLength = Data_Foldable.foldLeftInternal(Data_List_Structures.foldableList)(function (acc) {
    return function (val) {
      return acc + 1 | 0;
    };
  })(0);
  /**
   * Gets the last element of a list, if non-empty.
   */
  var lastElement = function ($copy_list) {
    var $tco_done = false;
    var $tco_result;

    function $tco_loop(list) {
      if (list instanceof Data_List_Structures.Node && list.val1 instanceof Data_List_Structures.EmptyList) {
        $tco_done = true;
        return new Data_Option.Presence(list.val0);
      }
      if (list instanceof Data_List_Structures.Node) {
        $copy_list = list.val1;
        return;
      }
      $tco_done = true;
      return Data_Option.Absence.value;
    }
    while (!$tco_done) {
      $tco_result = $tco_loop($copy_list);
    }
    return $tco_result;
  };
  /**
   * Inserts an element at a specific index in a list.
   * @param {number} index - The index to insert at.
   * @returns {Function} A function that takes the element to insert.
   */
  var insertAtIdx = function (index) {
    return function (element) {
      return function (list) {
        if (index === 0) {
          return new Data_Option.Presence(new Data_List_Structures.Node(element, list));
        }
        if (list instanceof Data_List_Structures.Node) {
          return Data_Transform.transformData(Data_Option.transformOption)(function (newList) {
            return new Data_List_Structures.Node(list.val0, newList);
          })(insertAtIdx(index - 1 | 0)(element)(list.val1));
        }
        return Data_Option.Absence.value;
      };
    };
  };
  /**
   * Gets the initial part of a list (all but the last element).
   */
  var initialPart = function (list) {
    return Data_Transform.transformData(Data_Option.transformOption)(function (record) {
      return record.init;
    })(unsnocList(list));
  };
  /**
   * Converts a foldable structure to a list.
   * @param {Object} dictFoldable - The Foldable instance.
   * @returns {Function} A function that takes the foldable structure.
   */
  var fromFoldableToList = function (dictFoldable) {
    return Data_Foldable.foldRightInternal(dictFoldable)(Data_List_Structures.Node.create)(Data_List_Structures.EmptyList.value);
  };
  /**
   * Filters elements from a list based on a predicate.
   * @param {Function} predicate - The predicate function.
   * @returns {Function} A function that takes the list.
   */
  var filterList = function (predicate) {
    var go = function ($copy_acc) {
      return function ($copy_list) {
        var $tco_var_acc = $copy_acc;
        var $tco_done = false;
        var $tco_result;

        function $tco_loop(acc, list) {
          if (list instanceof Data_List_Structures.EmptyList) {
            $tco_done = true;
            return reverseList(acc);
          }
          if (list instanceof Data_List_Structures.Node) {
            if (predicate(list.val0)) {
              $tco_var_acc = new Data_List_Structures.Node(list.val0, acc);
              $copy_list = list.val1;
              return;
            }
            if (Data_Bool.otherwiseFlag) {
              $tco_var_acc = acc;
              $copy_list = list.val1;
              return;
            }
          }
          throw new Error("Pattern match failure at Data.List (line 390, col 3 - line 390, col 27): " + [acc.constructor.name, list.constructor.name]);
        }
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_acc, $copy_list);
        }
        return $tco_result;
      };
    };
    return go(Data_List_Structures.EmptyList.value);
  };
  /**
   * Drops elements from a list while a predicate is true.
   * @param {Function} predicate - The predicate function.
   * @returns {Function} A function that takes the list.
   */
  var dropWhileMatch = function (predicate) {
    var go = function ($copy_list) {
      var $tco_done = false;
      var $tco_result;

      function $tco_loop(list) {
        if (list instanceof Data_List_Structures.Node && predicate(list.val0)) {
          $copy_list = list.val1;
          return;
        }
        $tco_done = true;
        return list;
      }
      while (!$tco_done) {
        $tco_result = $tco_loop($copy_list);
      }
      return $tco_result;
    };
    return go;
  };
  /**
   * Drops the first N elements from a list.
   * @returns {Function} A function that takes the number of elements.
   */
  var dropElements = function ($copy_num) {
    return function ($copy_list) {
      var $tco_var_num = $copy_num;
      var $tco_done = false;
      var $tco_result;

      function $tco_loop(num, list) {
        if (num < 1) {
          $tco_done = true;
          return list;
        }
        if (list instanceof Data_List_Structures.EmptyList) {
          $tco_done = true;
          return Data_List_Structures.EmptyList.value;
        }
        if (list instanceof Data_List_Structures.Node) {
          $tco_var_num = num - 1 | 0;
          $copy_list = list.val1;
          return;
        }
        throw new Error("Pattern match failure at Data.List (line 543, col 1 - line 543, col 42): " + [num.constructor.name, list.constructor.name]);
      }
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_num, $copy_list);
      }
      return $tco_result;
    };
  }();
  expOutput["fromFoldableToList"] = fromFoldableToList;
  expOutput["isListEmpty"] = isListEmpty;
  expOutput["listLength"] = listLength;
  expOutput["lastElement"] = lastElement;
  expOutput["initialPart"] = initialPart;
  expOutput["unconsList"] = unconsList;
  expOutput["unsnocList"] = unsnocList;
  expOutput["insertAtIdx"] = insertAtIdx;
  expOutput["reverseList"] = reverseList;
  expOutput["filterList"] = filterList;
  expOutput["filterMapList"] = filterMapList;
  expOutput["takeElements"] = takeElements;
  expOutput["takeWhileMatch"] = takeWhileMatch;
  expOutput["dropElements"] = dropElements;
  expOutput["dropWhileMatch"] = dropWhileMatch;
  expOutput["spanList"] = spanList;
  expOutput["zipWithFunc"] = zipWithFunc;
  expOutput["zipLists"] = zipLists;
})(ModuleContainer["Data.List"] = ModuleContainer["Data.List"] || {});

// Module for string code unit operations
(function (expOutput) {
  "use strict";
  /**
   * Converts a string to an array of characters.
   * @param {string} str - The input string.
   * @returns {Array<string>} An array of characters.
   */
  expOutput.stringToChars = function (str) {
    return str.split("");
  };
  /**
   * Creates a string from a single character.
   * @param {string} charVal - The character.
   * @returns {string} A string containing the character.
   */
  expOutput.charToString = function (charVal) {
    return charVal;
  };
  /**
   * Gets the length of a string.
   * @param {string} str - The input string.
   * @returns {number} The string length.
   */
  expOutput.stringLength = function (str) {
    return str.length;
  };
  /**
   * Counts how many characters at the start of a string satisfy a predicate.
   * @param {Function} predicate - The predicate function.
   * @returns {Function} A function that takes the string.
   */
  expOutput.countPrefixMatch = function (predicate) {
    return function (str) {
      var idx = 0;
      while (idx < str.length && predicate(str.charAt(idx))) idx++;
      return idx;
    };
  };
  /**
   * Finds the first occurrence of a substring.
   * @param {Function} presenceFunc - Function to wrap a present value.
   * @returns {Function} A function that takes an absence value.
   */
  expOutput._stringIndex = function (presenceFunc) {
    return function (absenceVal) {
      return function (subStr) {
        return function (mainStr) {
          var idx = mainStr.indexOf(subStr);
          return idx === -1 ? absenceVal : presenceFunc(idx);
        };
      };
    };
  };
  /**
   * Takes the first N characters of a string.
   * @param {number} num - The number of characters to take.
   * @returns {Function} A function that takes the string.
   */
  expOutput.stringTake = function (num) {
    return function (str) {
      return str.substr(0, num);
    };
  };
  /**
   * Drops the first N characters from a string.
   * @param {number} num - The number of characters to drop.
   * @returns {Function} A function that takes the string.
   */
  expOutput.stringDrop = function (num) {
    return function (str) {
      return str.substring(num);
    };
  };
})(ModuleContainer["Data.String.Units"] = ModuleContainer["Data.String.Units"] || {});

// Module for string code unit operations
(function (expOutput) {
  "use strict";
  var externalStringUnits = ModuleContainer["Data.String.Units"]; // Import external string functions
  // Placeholder imports
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  var Data_Bool = ModuleContainer["Data.Bool"]; // Import Boolean module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  // var Data_NumSet = ModuleContainer["Data.NumSet"];
  // var Data_String_Pattern = ModuleContainer["Data.String.Pattern"];
  // var Data_String_Unsafe = ModuleContainer["Data.String.Unsafe"];
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Takes characters from a string while a predicate is true.
   * @param {Function} predicate - The predicate function.
   * @returns {Function} A function that takes the string.
   */
  var takeWhileMatch = function (predicate) {
    return function (str) {
      return externalStringUnits.stringTake(externalStringUnits.countPrefixMatch(predicate)(str))(str);
    };
  };
  // Finds the first occurrence of a substring
  var stringIndexOf = externalStringUnits._stringIndex(Data_Option.Presence.create)(Data_Option.Absence.value);
  /**
   * Removes a prefix from a string if it exists.
   * @param {string} prefix - The prefix to remove.
   * @returns {Function} A function that takes the main string.
   */
  var stringStripPrefix = function (prefix) {
    return function (mainStr) {
      var indexOfResult = stringIndexOf(prefix)(mainStr);
      if (indexOfResult instanceof Data_Option.Presence && indexOfResult.val0 === 0) {
        return Data_Option.Presence.create(externalStringUnits.stringDrop(externalStringUnits.stringLength(prefix))(mainStr));
      }
      return Data_Option.Absence.value;
    };
  };
  /**
   * Checks if a string contains a substring.
   * @param {string} subStr - The substring to check for.
   * @returns {Function} A function that takes the main string.
   */
  var stringContains = function (subStr) {
    return function ($16) {
      return Data_Option.isOptionPresent(stringIndexOf(subStr)($16));
    };
  };
  expOutput["stringStripPrefix"] = stringStripPrefix;
  expOutput["stringContains"] = stringContains;
  expOutput["stringIndexOf"] = stringIndexOf;
  expOutput["takeWhileMatch"] = takeWhileMatch;
  expOutput["charToString"] = externalStringUnits.charToString;
  expOutput["stringToChars"] = externalStringUnits.stringToChars;
})(ModuleContainer["Data.String.Units"] = ModuleContainer["Data.String.Units"] || {});

// Module for effectful exception handling
(function (expOutput) {
  "use strict";
  /**
   * Creates an Error object.
   * @param {string} message - The error message.
   * @returns {Error} The Error object.
   */
  expOutput.throwError = function (message) {
    return new Error(message);
  };
  /**
   * Throws an exception.
   * @param {Error} exception - The exception to throw.
   * @returns {Function} An effectful function.
   */
  expOutput.throwExceptionEffect = function (exception) {
    return function () {
      throw exception;
    };
  };
})(ModuleContainer["Effect.Except"] = ModuleContainer["Effect.Except"] || {});

// Module for effectful exception handling
(function (expOutput) {
  "use strict";
  var externalExcept = ModuleContainer["Effect.Except"]; // Import external exception functions
  // Placeholder imports
  // var Control_Creator = ModuleContainer["Control.Creator"];
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  var Data_Outcome = ModuleContainer["Data.Outcome"]; // Import Either module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Effect = ModuleContainer["Effect"];
  // var Prelude = ModuleContainer["Prelude"];

  expOutput["throwError"] = externalExcept.throwError;
  expOutput["throwExceptionEffect"] = externalExcept.throwExceptionEffect;
})(ModuleContainer["Effect.Except"] = ModuleContainer["Effect.Except"] || {});

// Module for unsafe effectful operations
(function (expOutput) {
  "use strict";
  /**
   * Unsafely performs an effectful computation, returning its result.
   * @param {Function} effectFunc - The effectful function.
   * @returns {*} The result of the effect.
   */
  expOutput.performEffectUnsafe = function (effectFunc) {
    return effectFunc();
  };
})(ModuleContainer["Effect.Unsafe"] = ModuleContainer["Effect.Unsafe"] || {});

// Module for unsafe effectful operations
(function (expOutput) {
  "use strict";
  var externalEffectUnsafe = ModuleContainer["Effect.Unsafe"]; // Import external unsafe effect
  // var Effect = ModuleContainer["Effect"];
  expOutput["performEffectUnsafe"] = externalEffectUnsafe.performEffectUnsafe;
})(ModuleContainer["Effect.Unsafe"] = ModuleContainer["Effect.Unsafe"] || {});

// Module for unsafe exception handling
(function (expOutput) {
  "use strict";
  var Logic_OpGroup = ModuleContainer["Logic.OpGroup"]; // Import Semigroupoid module
  var Effect_Except = ModuleContainer["Effect.Except"]; // Import Effect.Exception module
  var Effect_Unsafe = ModuleContainer["Effect.Unsafe"]; // Import Effect.Unsafe module

  /**
   * Unsafely throws an exception.
   * @param {Error} exception - The exception to throw.
   * @returns {*} Never returns, always throws.
   */
  var throwExceptionUnsafe = function ($0) {
    return Effect_Unsafe.performEffectUnsafe(Effect_Except.throwExceptionEffect($0));
  };
  /**
   * Unsafely throws an error with a message.
   * @param {string} message - The error message.
   * @returns {*} Never returns, always throws.
   */
  var throwUnsafe = function ($1) {
    return throwExceptionUnsafe(Effect_Except.throwError($1));
  };
  expOutput["throwExceptionUnsafe"] = throwExceptionUnsafe;
  expOutput["throwUnsafe"] = throwUnsafe;
})(ModuleContainer["Effect.Except.Unsafe"] = ModuleContainer["Effect.Except.Unsafe"] || {});

// Module for HugeNum (large number representation)
(function (expOutput) {
  "use strict";
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  // Placeholder imports
  // var Control_Monad = ModuleContainer["Control.Monad"];
  var Logic_OpGroup = ModuleContainer["Logic.OpGroup"]; // Import Semigroupoid module
  // var Data_Bifunctor = ModuleContainer["Data.Bifunctor"];
  var Data_Bool = ModuleContainer["Data.Bool"]; // Import Boolean module
  var Data_Digit = ModuleContainer["Data.Digit"]; // Import Digit module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  // var Data_EuclideanRing = ModuleContainer["Data.EuclideanRing"];
  var Data_Foldable = ModuleContainer["Data.Foldable"]; // Import Foldable module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  // var Data_Generic_Rep = ModuleContainer["Data.Generic.Rep"];
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  var Data_IntNum = ModuleContainer["Data.IntNum"]; // Import Int module
  var Data_List = ModuleContainer["Data.List"]; // Import List module
  var Data_List_Structures = ModuleContainer["Data.List.Structures"]; // Import List.Types module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Unitary = ModuleContainer["Data.Unitary"]; // Import Monoid module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  var Data_NumRing = ModuleContainer["Data.NumRing"]; // Import Ring module
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  var Data_NumSet = ModuleContainer["Data.NumSet"]; // Import Semiring module
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Data_String = ModuleContainer["Data.String"];
  var Data_String_Units = ModuleContainer["Data.String.Units"]; // Import String.CodeUnits module
  // var Data_String_Pattern = ModuleContainer["Data.String.Pattern"];
  // var Data_Traversable = ModuleContainer["Data.Traversable"];
  var Data_ValueTuple = ModuleContainer["Data.ValueTuple"]; // Import Tuple module
  var Data_Expandable = ModuleContainer["Data.Expandable"]; // Import Unfoldable module
  var Effect_Except_Unsafe = ModuleContainer["Effect.Except.Unsafe"]; // Import Effect.Exception.Unsafe module
  var Global = ModuleContainer["Global"]; // Import Global module
  var Partial_Unsafe = ModuleContainer["Partial.Unsafe"]; // Import Partial.Unsafe module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Represents a positive sign.
   * @constructor
   */
  var PositiveSign = function () {
    function PositiveSign() {}
    PositiveSign.value = new PositiveSign();
    return PositiveSign;
  }();
  /**
   * Represents a negative sign.
   * @constructor
   */
  var NegativeSign = function () {
    function NegativeSign() {}
    NegativeSign.value = new NegativeSign();
    return NegativeSign;
  }();
  /**
   * Represents a floating point number type.
   * @constructor
   */
  var FloatingPoint = function () {
    function FloatingPoint() {}
    FloatingPoint.value = new FloatingPoint();
    return FloatingPoint;
  }();
  /**
   * Represents a whole number (integer) type.
   * @constructor
   */
  var WholeNumber = function () {
    function WholeNumber() {}
    WholeNumber.value = new WholeNumber();
    return WholeNumber;
  }();
  /**
   * Represents a scientific notation number type.
   * @constructor
   */
  var ScientificNotation = function () {
    function ScientificNotation() {}
    ScientificNotation.value = new ScientificNotation();
    return ScientificNotation;
  }();
  // Represents the large number 0
  var initialZeroLargeNum = {
    digits: new Data_List_Structures.Node(Data_Digit.zeroDigit, new Data_List_Structures.Node(Data_Digit.zeroDigit, Data_List_Structures.EmptyList.value)),
    decimal: 1,
    sign: PositiveSign.value
  };
  /**
   * Removes leading zeros from a list of digits.
   */
  var safeRemoveLeadZeroes = Data_List.dropWhileMatch(function (digit) {
    return Data_Equality.equalityCheck(Data_Digit.equalityDigit)(digit)(Data_Digit.zeroDigit);
  });
  /**
   * Checks if the fractional part of a large number is trivial (all zeros).
   * @param {Object} largeNum - The large number object.
   * @returns {boolean} True if fractional part is trivial.
   */
  var isTrivialFraction = function (largeNum) {
    var fractionalDigits = Data_List.reverseList(Data_List.dropElements(largeNum.decimal)(largeNum.digits));
    var meatyFraction = Data_List.dropWhileMatch(function (digit) {
      return Data_Equality.equalityCheck(Data_Digit.equalityDigit)(digit)(Data_Digit.zeroDigit);
    })(fractionalDigits);
    return Data_List.isListEmpty(meatyFraction);
  };
  /**
   * Converts a large number object to its string representation.
   * @param {Object} largeNum - The large number object.
   * @returns {string} The string representation.
   */
  var largeNumToStr = function (largeNum) {
    var signStr = function () {
      if (largeNum.sign instanceof PositiveSign) {
        return Data_Unitary.emptyVal(Data_List_Structures.unitaryList);
      }
      if (largeNum.sign instanceof NegativeSign) {
        return Logic_Creator.createVal(Data_List_Structures.creatorList)("-");
      }
      throw new Error("Pattern match failure at Data.HugeNum (line 174, col 14 - line 176, col 49): " + [largeNum.sign.constructor.name]);
    }();
    var charList = Data_Transform.transformData(Data_List_Structures.transformList)(Data_Digit.convertToChar)(largeNum.digits);
    var numCharList = Data_Option.extractOption()(Data_List.insertAtIdx(largeNum.decimal)(".")(charList));
    return Data_Foldable.foldMapInternal(Data_List_Structures.foldableList)(Data_Unitary.unitaryStr)(Data_String_Units.charToString)(Data_Collection.combineStr(Data_List_Structures.collectionList)(signStr)(numCharList));
  };
  /**
   * Determines the sign of the product of two signs.
   * @param {PositiveSign|NegativeSign} signA - The first sign.
   * @returns {Function} A function that takes the second sign.
   */
  var multiplySigns = function (signA) {
    return function (signB) {
      if (signA instanceof PositiveSign && signB instanceof PositiveSign) {
        return PositiveSign.value;
      }
      if (signA instanceof NegativeSign && signB instanceof NegativeSign) {
        return PositiveSign.value;
      }
      return NegativeSign.value;
    };
  };
  /**
   * Gets the trailing significant digits of a list of digits.
   * @param {Data.List.Structures.Node|Data.List.Structures.EmptyList} digitList - The list of digits.
   * @returns {Data.List.Structures.Node|Data.List.Structures.EmptyList} The list with trailing zeros removed.
   */
  var getTrailingParts = function (digitList) {
    return Data_List.reverseList(Data_List.dropWhileMatch(function (digit) {
      return Data_Equality.equalityCheck(Data_Digit.equalityDigit)(digit)(Data_Digit.zeroDigit);
    })(Data_List.reverseList(digitList)));
  };
  /**
   * Multiplies a large number by a power of ten.
   * @param {number} power - The exponent of ten.
   * @returns {Function} A function that takes the large number.
   */
  var multiplyByPowerOfTen = function (power) {
    return function (largeNum) {
      var newDecimal = largeNum.decimal + power | 0;
      var newZeroesLength = function () {
        var $97 = newDecimal >= Data_List.listLength(getTrailingParts(largeNum.digits));
        if ($97) {
          return newDecimal - Data_List.listLength(getTrailingParts(largeNum.digits)) | 0;
        }
        return 0;
      }();
      var newZeroes = Data_Expandable.generateList(Data_List_Structures.unfoldList)(newZeroesLength)(Data_Digit.zeroDigit);
      var result = {
        digits: Data_Collection.combineStr(Data_List_Structures.collectionList)(largeNum.digits)(newZeroes),
        sign: largeNum.sign,
        decimal: newDecimal
      };
      return result;
    };
  };
  /**
   * Checks if a large number is "small enough" for special multiplication (e.g., single digit).
   * @param {Object} largeNum - The large number object.
   * @returns {boolean} True if small enough.
   */
  var isSmallEnough = function (largeNum) {
    if (largeNum.decimal === 1 && Data_List.listLength(largeNum.digits) === 2) {
      return true;
    }
    return false;
  };
  /**
   * A recursive helper function (identity, but often used for type-level recursion).
   * @param {*} val - The input value.
   * @returns {*} The input value.
   */
  var reconstruct = function (val) {
    return val;
  };
  /**
   * Parses a number in scientific notation into its components.
   * @param {number} numVal - The number.
   * @returns {Object} An object with exponent, sign, base, and original sign.
   */
  var parseScientificRep = function (numVal) {
    var parts = Data_List.spanList(function (char) {
      return char !== "e";
    })(Data_List.fromFoldableToList(Data_Foldable.foldableArr)(Data_String_Units.stringToChars(Data_Display.displayVal(Data_Display.displayNum)(numVal))));
    var signSplit = Data_Option.extractOption()(Data_List.unconsList(Data_List.dropElements(1)(parts.rest)));
    var originalSign = function () {
      var $102 = numVal < 0;
      if ($102) {
        return NegativeSign.value;
      }
      return PositiveSign.value;
    }();
    var exponentVal = Data_IntNum.roundNum(Global.readNumFloat(Data_Foldable.foldMapInternal(Data_List_Structures.foldableList)(Data_Unitary.unitaryStr)(Data_String_Units.charToString)(signSplit.tail)));
    var exponentSign = function () {
      if (signSplit.head === "+") {
        return PositiveSign.value;
      }
      return NegativeSign.value;
    }();
    var baseDigits = Data_List.filterList(function (char) {
      return char !== ".";
    })(parts.init);
    var result = {
      exponent: exponentVal,
      exponentSign: exponentSign,
      base: baseDigits,
      sign: originalSign
    };
    return result;
  };
  /**
   * Creates a large number from scientific notation with positive exponent and positive overall sign.
   * @param {number} exponent - The exponent.
   * @returns {Function} A function that takes the base digits.
   */
  var parsePlusPlusRep = function (exponent) {
    return function (baseDigits) {
      var zeroCardinality = (exponent - Data_List.listLength(baseDigits) | 0) + 2 | 0;
      var zeroes = Data_Expandable.generateList(Data_List_Structures.unfoldList)(zeroCardinality)(Data_Digit.zeroDigit);
      var digits = Data_Collection.combineStr(Data_List_Structures.collectionList)(Data_List.filterMapList(Data_Digit.fromCharConvert)(baseDigits))(zeroes);
      var decimalPoint = 1 + exponent | 0;
      var result = {
        digits: digits,
        decimal: decimalPoint,
        sign: PositiveSign.value
      };
      return result;
    };
  };
  /**
   * Creates a large number from scientific notation with positive exponent and negative overall sign.
   * @param {number} exponent - The exponent.
   * @returns {Function} A function that takes the base digits.
   */
  var parsePlusMinusRep = function (exponent) {
    return function (baseDigits) {
      var result = parsePlusPlusRep(exponent)(baseDigits);
      return {
        digits: Data_Collection.combineStr(Data_List_Structures.collectionList)(result.digits)(Logic_Creator.createVal(Data_List_Structures.creatorList)(Data_Digit.zeroDigit)),
        decimal: result.decimal,
        sign: NegativeSign.value
      };
    };
  };
  /**
   * Determines the type of a number (Float, Scientific, Integral).
   * @param {number} numVal - The number to parse.
   * @returns {FloatingPoint|ScientificNotation|WholeNumber} The number type.
   */
  var parseNumType = function (numVal) {
    if (Data_String_Units.stringContains("e")(Data_Display.displayVal(Data_Display.displayNum)(numVal))) {
      return ScientificNotation.value;
    }
    if (Data_String_Units.stringContains(".")(Data_Display.displayVal(Data_Display.displayNum)(numVal))) {
      return FloatingPoint.value;
    }
    if (Data_Bool.otherwiseFlag) {
      return WholeNumber.value;
    }
    throw new Error("Pattern match failure at Data.HugeNum (line 204, col 1 - line 204, col 37): " + [numVal.constructor.name]);
  };
  /**
   * Creates a large number from scientific notation with negative exponent and positive overall sign.
   * @param {number} exponent - The absolute exponent.
   * @returns {Function} A function that takes the base digits.
   */
  var parseMinusPlusRep = function (exponent) {
    return function (baseDigits) {
      var zeroes = Data_Expandable.generateList(Data_List_Structures.unfoldList)(exponent)(Data_Digit.zeroDigit);
      var digits = Data_Collection.combineStr(Data_List_Structures.collectionList)(zeroes)(Data_List.filterMapList(Data_Digit.fromCharConvert)(baseDigits));
      var result = {
        digits: digits,
        decimal: 1,
        sign: PositiveSign.value
      };
      return result;
    };
  };
  /**
   * Creates a large number from scientific notation with negative exponent and negative overall sign.
   * @param {number} exponent - The absolute exponent.
   * @returns {Function} A function that takes the base digits.
   */
  var parseMinusMinusRep = function (exponent) {
    return function (baseDigits) {
      var result = parseMinusPlusRep(exponent)(baseDigits);
      return {
        digits: result.digits,
        decimal: result.decimal,
        sign: NegativeSign.value
      };
    };
  };
  /**
   * Converts a scientific notation number to a large number.
   * @param {number} numVal - The number in scientific notation.
   * @returns {Object} The large number object.
   */
  var scientificToLargeNum = function (numVal) {
    var parsed = parseScientificRep(numVal);
    var result = function () {
      if (parsed.exponentSign instanceof PositiveSign) {
        if (parsed.sign instanceof PositiveSign) {
          return parsePlusPlusRep(parsed.exponent)(parsed.base);
        }
        return parsePlusMinusRep(parsed.exponent)(parsed.base);
      }
      if (parsed.sign instanceof PositiveSign) {
        return parseMinusPlusRep(parsed.exponent)(parsed.base);
      }
      return parseMinusMinusRep(parsed.exponent)(parsed.base);
    }();
    return result;
  };
  // Represents the large number 1
  var initialOneLargeNum = {
    digits: new Data_List_Structures.Node(Data_Digit.oneDigit, new Data_List_Structures.Node(Data_Digit.zeroDigit, Data_List_Structures.EmptyList.value)),
    decimal: 1,
    sign: PositiveSign.value
  };
  /**
   * Negates a large number.
   * @param {Object} largeNum - The large number.
   * @returns {Object} The negated large number.
   */
  var negateLargeNum = function (largeNum) {
    if (largeNum.sign instanceof NegativeSign) {
      return {
        digits: largeNum.digits,
        decimal: largeNum.decimal,
        sign: PositiveSign.value
      };
    }
    return {
      digits: largeNum.digits,
      decimal: largeNum.decimal,
      sign: NegativeSign.value
    };
  };
  /**
   * Calculates the length of the fractional part that is not trivial.
   * @param {Object} largeNum - The large number.
   * @returns {number} The length.
   */
  var getDecimalPartLength = function (largeNum) {
    var fractionalDigits = Data_List.reverseList(Data_List.dropElements(largeNum.decimal)(largeNum.digits));
    var meatyFraction = Data_List.dropWhileMatch(function (digit) {
      return Data_Equality.equalityCheck(Data_Digit.equalityDigit)(digit)(Data_Digit.zeroDigit);
    })(fractionalDigits);
    return Data_List.listLength(meatyFraction);
  };
  /**
   * Creates a large integer representation from a large number.
   * @param {Object} largeNum - The large number.
   * @returns {Object} The large integer representation.
   */
  var makeLargeIntegerInternal = function (largeNum) {
    var digits = Data_Collection.combineStr(Data_List_Structures.collectionList)(safeRemoveLeadZeroes(largeNum.digits))(Logic_Creator.createVal(Data_List_Structures.creatorList)(Data_Digit.zeroDigit));
    var decimalPoint = Data_List.listLength(digits) - 1 | 0;
    var result = {
      digits: digits,
      decimal: decimalPoint,
      sign: largeNum.sign
    };
    return result;
  };
  /**
   * Checks if the precision of the first number is less than the second.
   * @param {Object} numA - The first large number.
   * @returns {Function} A function that takes the second large number.
   */
  var isLessPrecise = function (numA) {
    return function (numB) {
      return Data_List.listLength(Data_List.dropElements(numA.decimal)(numA.digits)) < Data_List.listLength(Data_List.dropElements(numB.decimal)(numB.digits));
    };
  };
  /**
   * Checks if a large number is zero.
   * @param {Object} largeNum - The large number.
   * @returns {boolean} True if zero, false otherwise.
   */
  var isZeroValue = function (largeNum) {
    return Data_Foldable.allCheck(Data_List_Structures.foldableList)(Data_LogicAlgebra.logicAlgebraBool)(function (digit) {
      return Data_Equality.equalityCheck(Data_Digit.equalityDigit)(digit)(Data_Digit.zeroDigit);
    })(largeNum.digits);
  };
  /**
   * Checks if a large number is positive.
   * @param {Object} largeNum - The large number.
   * @returns {boolean} True if positive, false otherwise.
   */
  var isPositiveValue = function (largeNum) {
    if (largeNum.sign instanceof PositiveSign) {
      return true;
    }
    return false;
  };
  /**
   * Checks if a large number is negative.
   * @param {Object} largeNum - The large number.
   * @returns {boolean} True if negative, false otherwise.
   */
  var isNegativeValue = function (largeNum) {
    if (largeNum.sign instanceof NegativeSign) {
      return true;
    }
    return false;
  };
  /**
   * Checks if a large number represents an integer (no fractional part).
   * @param {Object} largeNum - The large number.
   * @returns {boolean} True if it's an integer.
   */
  var isLargeInteger = function (largeNum) {
    return Data_Foldable.allCheck(Data_List_Structures.foldableList)(Data_LogicAlgebra.logicAlgebraBool)(function (digit) {
      return Data_Equality.equalityCheck(Data_Digit.equalityDigit)(digit)(Data_Digit.zeroDigit);
    })(Data_List.dropElements(largeNum.decimal)(largeNum.digits));
  };
  /**
   * Converts a large number to its integer representation if it's an integer.
   * @param {Object} largeNum - The large number.
   * @returns {Object} The integer representation.
   */
  var makeLargeInteger = function (largeNum) {
    var isInt = isLargeInteger(largeNum);
    if (isInt) {
      return largeNum;
    }
    return makeLargeIntegerInternal(largeNum);
  };
  /**
   * Converts an integer to a large number.
   * @param {number} intVal - The integer.
   * @returns {Object} The large number object.
   */
  var integralToLargeNum = function (intVal) {
    var sign = function () {
      var $123 = intVal < 0;
      if ($123) {
        return NegativeSign.value;
      }
      return PositiveSign.value;
    }();
    var integralDigits = Data_List.fromFoldableToList(Data_Foldable.foldableArr)(Data_String_Units.stringToChars(Data_Display.displayVal(Data_Display.displayNum)(intVal)));
    var fractionalDigits = Logic_Creator.createVal(Data_List_Structures.creatorList)(Data_Digit.zeroDigit);
    var decimalPoint = function () {
      if (sign instanceof NegativeSign) {
        return Data_List.listLength(integralDigits) - 1 | 0;
      }
      return Data_List.listLength(integralDigits);
    }();
    return {
      digits: Data_Collection.combineStr(Data_List_Structures.collectionList)(Data_List.filterMapList(Data_Digit.fromCharConvert)(integralDigits))(fractionalDigits),
      decimal: decimalPoint,
      sign: sign
    };
  };
  /**
   * Extracts the integer part of a large number.
   * @param {Object} largeNum - The large number.
   * @returns {Object} The integer part as a large number.
   */
  var getIntegerPart = function (largeNum) {
    return {
      digits: Data_Collection.combineStr(Data_List_Structures.collectionList)(Data_List.takeElements(largeNum.decimal)(largeNum.digits))(Logic_Creator.createVal(Data_List_Structures.creatorList)(Data_Digit.zeroDigit)),
      decimal: largeNum.decimal,
      sign: largeNum.sign
    };
  };
  /**
   * Converts a floating-point number to a large number.
   * @param {number} floatVal - The floating-point number.
   * @returns {Object} The large number object.
   */
  var floatToLargeNum = function (floatVal) {
    var sign = function () {
      var $138 = floatVal < 0;
      if ($138) {
        return NegativeSign.value;
      }
      return PositiveSign.value;
    }();
    var isPositiveFloat = floatVal >= 0;
    var parts = function () {
      if (isPositiveFloat) {
        return Data_List.spanList(function (char) {
          return char !== ".";
        })(Data_List.fromFoldableToList(Data_Foldable.foldableArr)(Data_String_Units.stringToChars(Data_Display.displayVal(Data_Display.displayNum)(floatVal))));
      }
      return Data_List.spanList(function (char) {
        return char !== ".";
      })(Data_List.dropElements(1)(Data_List.fromFoldableToList(Data_Foldable.foldableArr)(Data_String_Units.stringToChars(Data_Display.displayVal(Data_Display.displayNum)(floatVal)))));
    }();
    var fractionalPart = Data_List.dropElements(1)(parts.rest);
    var decimalPoint = Data_List.listLength(parts.init);
    var digits = Data_List.filterMapList(Data_Digit.fromCharConvert)(Data_Collection.combineStr(Data_List_Structures.collectionList)(parts.init)(fractionalPart));
    var result = {
      digits: digits,
      decimal: decimalPoint,
      sign: sign
    };
    return result;
  };
  /**
   * Converts a number to a large number.
   * @param {number} numVal - The number.
   * @returns {Object} The large number object.
   */
  var fromNumLarge = function (numVal) {
    var numType = parseNumType(numVal);
    if (numType instanceof FloatingPoint) {
      return floatToLargeNum(numVal);
    }
    if (numType instanceof ScientificNotation) {
      return scientificToLargeNum(numVal);
    }
    if (numType instanceof WholeNumber) {
      return integralToLargeNum(numVal);
    }
    throw new Error("Pattern match failure at Data.HugeNum (line 283, col 16 - line 286, col 52): " + [numType.constructor.name]);
  };
  // Equality instance for signs
  var equalitySign = new Data_Equality.Equality(function (signA) {
    return function (signB) {
      if (signA instanceof PositiveSign && signB instanceof PositiveSign) {
        return true;
      }
      if (signA instanceof NegativeSign && signB instanceof NegativeSign) {
        return true;
      }
      return false;
    };
  });
  // Ord instance for signs
  var orderSign = new Data_Ordering.OrderingClass(function () {
    return equalitySign;
  }, function (signA) {
    return function (signB) {
      if (signA instanceof PositiveSign && signB instanceof NegativeSign) {
        return Data_Ordering.GreaterThen.value;
      }
      if (signA instanceof NegativeSign && signB instanceof PositiveSign) {
        return Data_Ordering.LessThen.value;
      }
      return Data_Ordering.EqualTo.value;
    };
  });
  /**
   * Checks for strict equality between two large numbers.
   * @param {Object} numA - The first large number.
   * @returns {Function} A function that takes the second large number.
   */
  var strictEquality = function (numA) {
    return function (numB) {
      return numA.decimal === numB.decimal && (Data_Equality.equalityCheck(Data_List_Structures.equalList(Data_Digit.equalityDigit))(numA.digits)(numB.digits) && Data_Equality.equalityCheck(equalitySign)(numA.sign)(numB.sign));
    };
  };
  /**
   * Removes all leading and trailing zeros from a large number.
   */
  var stripAllZeroes = function () {
    /**
     * Removes leading zeros from the integral part.
     * @param {Object} largeNum - The large number.
     * @returns {Object} The number with leading integral zeros removed.
     */
    var normalizeIntegral = function (largeNum) {
      var integralPart = Data_List.takeElements(largeNum.decimal)(largeNum.digits);
      var zeroes = Data_List.takeWhileMatch(function (digit) {
        return Data_Equality.equalityCheck(Data_Digit.equalityDigit)(digit)(Data_Digit.zeroDigit);
      })(integralPart);
      var newDigits = function () {
        var $148 = Data_List.listLength(integralPart) === Data_List.listLength(zeroes);
        if ($148) {
          return Logic_Creator.createVal(Data_List_Structures.creatorList)(Data_Digit.zeroDigit);
        }
        return Data_List.dropElements(Data_List.listLength(zeroes))(integralPart);
      }();
      var newDecimal = Data_List.listLength(newDigits);
      var result = {
        digits: Data_Collection.combineStr(Data_List_Structures.collectionList)(newDigits)(Data_List.dropElements(largeNum.decimal)(largeNum.digits)),
        decimal: newDecimal,
        sign: largeNum.sign
      };
      return result;
    };
    /**
     * Removes trailing zeros from the fractional part.
     * @param {Object} largeNum - The large number.
     * @returns {Object} The number with trailing fractional zeros removed.
     */
    var normalizeFractional = function (largeNum) {
      var fractionalDigits = Data_List.reverseList(Data_List.dropElements(largeNum.decimal)(largeNum.digits));
      var meatyFraction = Data_List.dropWhileMatch(function (digit) {
        return Data_Equality.equalityCheck(Data_Digit.equalityDigit)(digit)(Data_Digit.zeroDigit);
      })(fractionalDigits);
      var digits = Data_List.reverseList(meatyFraction);
      var result = {
        digits: Data_Collection.combineStr(Data_List_Structures.collectionList)(Data_List.takeElements(largeNum.decimal)(largeNum.digits))(function () {
          var $150 = Data_List.isListEmpty(digits);
          if ($150) {
            return Logic_Creator.createVal(Data_List_Structures.creatorList)(Data_Digit.zeroDigit);
          }
          return digits;
        }()),
        decimal: largeNum.decimal,
        sign: largeNum.sign
      };
      return result;
    };
    return function ($213) {
      return normalizeIntegral(normalizeFractional($213));
    };
  }();
  // Equality instance for HugeNum
  var equalityLargeNum = new Data_Equality.Equality(function (numX) {
    return function (numY) {
      if (isZeroValue(numX) && isZeroValue(numY)) {
        return true;
      }
      if (Data_Bool.otherwiseFlag) {
        return strictEquality(stripAllZeroes(numX))(stripAllZeroes(numY));
      }
      throw new Error("Pattern match failure at Data.HugeNum (line 75, col 1 - line 75, col 33): " + [numX.constructor.name, numY.constructor.name]);
    };
  });
  /**
   * Performs digit-wise subtraction with carry.
   * @param {Data.ValueTuple.ValueTuple} accTuple - Accumulator: (list of digits, carry digit).
   * @returns {Function} A function that takes the current pair of digits.
   */
  var digitwiseSubtraction = function (accTuple) {
    return function (digitPair) {
      var topInt = Data_Digit.convertToInt(Data_ValueTuple.firstValue(digitPair)) - Data_Digit.convertToInt(Data_ValueTuple.secondValue(accTuple)) | 0;
      var bottomInt = Data_Digit.convertToInt(Data_ValueTuple.secondValue(digitPair));
      var diffPrime = topInt - bottomInt | 0;
      var diff = Data_Option.extractOption()(Data_Digit.fromIntConvert(function () {
        var $155 = diffPrime < 0;
        if ($155) {
          return diffPrime + 10 | 0;
        }
        return diffPrime;
      }()));
      var carry = function () {
        var $156 = diffPrime < 0;
        if ($156) {
          return Data_Digit.oneDigit;
        }
        return Data_Digit.zeroDigit;
      }();
      return new Data_ValueTuple.ValueTuple(new Data_List_Structures.Node(diff, Data_ValueTuple.firstValue(accTuple)), carry);
    };
  };
  /**
   * Performs digit-wise addition with carry.
   * @param {Data.ValueTuple.ValueTuple} accTuple - Accumulator: (list of digits, carry digit).
   * @returns {Function} A function that takes the current pair of digits.
   */
  var digitwiseAddition = function (accTuple) {
    return function (digitPair) {
      var topInt = Data_Digit.convertToInt(Data_ValueTuple.firstValue(digitPair)) + Data_Digit.convertToInt(Data_ValueTuple.secondValue(accTuple)) | 0;
      var bottomInt = Data_Digit.convertToInt(Data_ValueTuple.secondValue(digitPair));
      var sumPrime = topInt + bottomInt | 0;
      var carry = function () {
        var $163 = sumPrime > 9;
        if ($163) {
          return Data_Digit.oneDigit;
        }
        return Data_Digit.zeroDigit;
      }();
      var sum = Data_Option.extractOption()(Data_Digit.fromIntConvert(function () {
        var $164 = sumPrime > 9;
        if ($164) {
          return sumPrime - 10 | 0;
        }
        return sumPrime;
      }()));
      return new Data_ValueTuple.ValueTuple(new Data_List_Structures.Node(sum, Data_ValueTuple.firstValue(accTuple)), carry);
    };
  };
  /**
   * Makes two large numbers have the same number of integral and fractional digits by padding with zeros.
   */
  var normalizeNumbers = function () {
    /**
     * Pads integral parts with leading zeros.
     * @param {Object} tuple - A tuple containing two large numbers.
     * @returns {Object} The tuple with integral parts normalized.
     */
    var normalizeIntegral = function (tuple) {
      if (Data_List.listLength(Data_List.takeElements(tuple.fst.decimal)(tuple.fst.digits)) === Data_List.listLength(Data_List.takeElements(tuple.snd.decimal)(tuple.snd.digits))) {
        return {
          fst: tuple.fst,
          snd: tuple.snd
        };
      }
      if (Data_Bool.otherwiseFlag) {
        var lesserNum = reconstruct(Data_Ordering.minimumVal(orderLargeNum)(tuple.fst)(tuple.snd));
        var greaterNum = reconstruct(Data_Ordering.maximumVal(orderLargeNum)(tuple.fst)(tuple.snd));
        var zeroesLength = Data_List.listLength(Data_List.takeElements(greaterNum.decimal)(greaterNum.digits)) - Data_List.listLength(Data_List.takeElements(lesserNum.decimal)(lesserNum.digits)) | 0;
        var zeroes = Data_Expandable.generateList(Data_List_Structures.unfoldList)(zeroesLength)(Data_Digit.zeroDigit);
        var lesserPrime = {
          digits: Data_Collection.combineStr(Data_List_Structures.collectionList)(zeroes)(lesserNum.digits),
          decimal: greaterNum.decimal,
          sign: lesserNum.sign
        };
        var result = {
          fst: lesserPrime,
          snd: greaterNum
        };
        return result;
      }
      throw new Error("Pattern match failure at Data.HugeNum (line 150, col 3 - line 158, col 57): " + [tuple.constructor.name]);
    };
    /**
     * Pads fractional parts with trailing zeros.
     * @param {Object} tuple - A tuple containing two large numbers.
     * @returns {Object} The tuple with fractional parts normalized.
     */
    var normalizeFractional = function (tuple) {
      if (Data_List.listLength(Data_List.dropElements(tuple.fst.decimal)(tuple.fst.digits)) === Data_List.listLength(Data_List.dropElements(tuple.snd.decimal)(tuple.snd.digits))) {
        return {
          fst: tuple.fst,
          snd: tuple.snd
        };
      }
      if (Data_Bool.otherwiseFlag) {
        var testResult = isLessPrecise(tuple.fst)(tuple.snd);
        var lesserNum = function () {
          if (testResult) {
            return tuple.fst;
          }
          return tuple.snd;
        }();
        var greaterNum = function () {
          if (testResult) {
            return tuple.snd;
          }
          return tuple.fst;
        }();
        var lesserDecimal = Data_List.listLength(Data_List.dropElements(greaterNum.decimal)(greaterNum.digits)) - Data_List.listLength(Data_List.dropElements(lesserNum.decimal)(lesserNum.digits)) | 0;
        var zeroes = Data_Expandable.generateList(Data_List_Structures.unfoldList)(lesserDecimal)(Data_Digit.zeroDigit);
        var lesserPrime = {
          digits: Data_Collection.combineStr(Data_List_Structures.collectionList)(lesserNum.digits)(zeroes),
          decimal: lesserNum.decimal,
          sign: lesserNum.sign
        };
        var result = {
          fst: lesserPrime,
          snd: greaterNum
        };
        return result;
      }
      throw new Error("Pattern match failure at Data.HugeNum (line 140, col 3 - line 149, col 57): " + [tuple.constructor.name]);
    };
    return function ($214) {
      return normalizeIntegral(normalizeFractional($214));
    };
  }();
  /**
   * Compares two large numbers.
   * @param {Object} numA - The first large number.
   * @returns {Function} A function that takes the second large number.
   */
  var compareLargeNum = function (numA) {
    return function (numB) {
      if (Data_Ordering.isLess(orderSign)(numA.sign)(numB.sign)) {
        return Data_Ordering.LessThen.value;
      }
      if (Data_Ordering.isGreater(orderSign)(numA.sign)(numB.sign)) {
        return Data_Ordering.GreaterThen.value;
      }
      if (numA.decimal > numB.decimal) {
        return Data_Ordering.GreaterThen.value;
      }
      if (numA.decimal < numB.decimal) {
        return Data_Ordering.LessThen.value;
      }
      if (Data_Equality.equalityCheck(equalityLargeNum)(numA)(numB)) {
        return Data_Ordering.EqualTo.value;
      }
      if (Data_Bool.otherwiseFlag) {
        var normalized = normalizeNumbers({
          fst: numA,
          snd: numB
        });
        var numS = reconstruct(normalized.fst);
        var numM = reconstruct(normalized.snd);
        var numXPrime = function () {
          var $179 = Data_Equality.equalityCheck(equalityLargeNum)(numA)(normalized.fst);
          if ($179) {
            return numS;
          }
          return numM;
        }();
        var numYPrime = function () {
          var $180 = Data_Equality.equalityCheck(equalityLargeNum)(numB)(normalized.fst);
          if ($180) {
            return numS;
          }
          return numM;
        }();
        var comparisonResult = function () {
          var v2 = Data_Ordering.compareValues(Data_List_Structures.orderList(Data_Digit.orderDigit))(Data_List.takeElements(numA.decimal)(numA.digits))(Data_List.takeElements(numA.decimal)(numB.digits));
          if (v2 instanceof Data_Ordering.EqualTo) {
            return Data_Ordering.compareValues(Data_List_Structures.orderList(Data_Digit.orderDigit))(Data_List.dropElements(numA.decimal)(numXPrime.digits))(Data_List.dropElements(numA.decimal)(numYPrime.digits));
          }
          return v2;
        }();
        return comparisonResult;
      }
      throw new Error("Pattern match failure at Data.HugeNum (line 101, col 1 - line 101, col 49): " + [numA.constructor.name, numB.constructor.name]);
    };
  };
  // Ord instance for HugeNum
  var orderLargeNum = new Data_Ordering.OrderingClass(function () {
    return equalityLargeNum;
  }, compareLargeNum);
  /**
   * Converts an array of digits to a large number.
   * @param {Array<number>} digitArr - The array of digits.
   * @returns {Object} The large number object.
   */
  var arrayToLargeNum = function (digitArr) {
    return {
      sign: PositiveSign.value,
      digits: Data_Collection.combineStr(Data_List_Structures.collectionList)(digitArr)(Logic_Creator.createVal(Data_List_Structures.creatorList)(Data_Digit.zeroDigit)),
      decimal: Data_List.listLength(digitArr)
    };
  };
  /**
   * Adjusts a list of digits to match a specific decimal point position by padding with leading zeros.
   * @param {number} decimalPoint - The target decimal point position.
   * @returns {Function} A function that takes the list of digits.
   */
  var adjustDigitsToDecimal = function (decimalPoint) {
    return function (digitList) {
      var go = function ($copy_num) {
        return function ($copy_digits) {
          var $tco_var_num = $copy_num;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(num, digits) {
            if (num <= 0) {
              $tco_done = true;
              return digits;
            }
            if (Data_Bool.otherwiseFlag) {
              $tco_var_num = num - 1 | 0;
              $copy_digits = new Data_List_Structures.Node(Data_Digit.zeroDigit, digits);
              return;
            }
            throw new Error("Pattern match failure at Data.HugeNum (line 380, col 3 - line 382, col 42): " + [num.constructor.name, digits.constructor.name]);
          }
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_num, $copy_digits);
          }
          return $tco_result;
        };
      };
      return go((decimalPoint - Data_List.listLength(digitList) | 0) + 1 | 0)(digitList);
    };
  };
  /**
   * Adjusts the decimal position based on trivial fractional parts.
   * @param {Object} numA - The first large number.
   * @returns {Function} A function that takes the second large number.
   */
  var adjustDecimalForTrivialityInternal = function (numA) {
    return function (numB) {
      return function (numResult) {
        var digitsLength = Data_List.listLength(numResult.digits) - 1 | 0;
        var digitsPrime = Data_List.takeElements(digitsLength)(numResult.digits);
        var decimalModifier = getDecimalPartLength(numA) + getDecimalPartLength(numB) | 0;
        var digits = Data_Collection.combineStr(Data_List_Structures.collectionList)(Data_Expandable.generateList(Data_List_Structures.unfoldList)((decimalModifier - digitsLength | 0) + 1 | 0)(Data_Digit.zeroDigit))(digitsPrime);
        var decimalPoint = Data_List.listLength(Data_List.dropElements(decimalModifier)(Data_List.reverseList(digits)));
        var result = {
          digits: digits,
          decimal: decimalPoint,
          sign: PositiveSign.value
        };
        return stripAllZeroes(result);
      };
    };
  };
  /**
   * Adjusts the decimal position based on leading integral zeros.
   * @param {Data.List.Structures.Node|Data.List.Structures.EmptyList} digits - The list of digits.
   * @returns {Function} A function that takes the old decimal point.
   */
  var adjustDecimalForFrontZeroesInternal = function (digits) {
    return function (oldDecimal) {
      var newDigitsPrime = safeRemoveLeadZeroes(Data_List.takeElements(oldDecimal)(digits));
      var newDigits = function () {
        var $187 = Data_List.isListEmpty(newDigitsPrime);
        if ($187) {
          return Logic_Creator.createVal(Data_List_Structures.creatorList)(Data_Digit.zeroDigit);
        }
        return newDigitsPrime;
      }();
      return Data_List.listLength(newDigits);
    };
  };
  /**
   * Adds two positive large numbers.
   * @param {Object} numX - The first large number.
   * @returns {Function} A function that takes the second large number.
   */
  var addPlusPlusInternal = function (numX) {
    return function (numY) {
      var normalized = normalizeNumbers({
        fst: numX,
        snd: numY
      });
      var numR1 = reconstruct(normalized.fst);
      var numR2 = reconstruct(normalized.snd);
      var digitPairs = Data_List.zipLists(Data_List.reverseList(numR1.digits))(Data_List.reverseList(numR2.digits));
      var digitsPrimePrime = Data_Foldable.foldLeftInternal(Data_List_Structures.foldableList)(digitwiseAddition)(new Data_ValueTuple.ValueTuple(Data_Unitary.emptyVal(Data_List_Structures.unitaryList), Data_Digit.zeroDigit))(digitPairs);
      var carry = Data_ValueTuple.secondValue(digitsPrimePrime);
      var digitsPrime = Data_ValueTuple.firstValue(digitsPrimePrime);
      var digits = safeRemoveLeadZeroes(new Data_List_Structures.Node(carry, digitsPrime));
      var decimalPoint = adjustDecimalForFrontZeroesInternal(new Data_List_Structures.Node(carry, digitsPrime))(numR1.decimal + 1 | 0);
      var result = {
        digits: adjustDigitsToDecimal(decimalPoint)(digits),
        decimal: decimalPoint,
        sign: PositiveSign.value
      };
      return stripAllZeroes(result);
    };
  };
  /**
   * Adds a positive and a negative large number.
   * @param {Object} numX - The positive large number.
   * @returns {Function} A function that takes the negative large number.
   */
  var addPlusMinusInternal = function (numX) {
    return function (numY) {
      var normalized = normalizeNumbers({
        fst: numX,
        snd: numY
      });
      var numR1 = reconstruct(Data_Ordering.minimumVal(orderLargeNum)(normalized.fst)(normalized.snd));
      var numR2 = reconstruct(Data_Ordering.maximumVal(orderLargeNum)(normalized.fst)(normalized.snd));
      var digitPairs = Data_List.zipLists(Data_List.reverseList(numR2.digits))(Data_List.reverseList(numR1.digits));
      var digitsPrimePrime = Data_Foldable.foldLeftInternal(Data_List_Structures.foldableList)(digitwiseSubtraction)(new Data_ValueTuple.ValueTuple(Data_Unitary.emptyVal(Data_List_Structures.unitaryList), Data_Digit.zeroDigit))(digitPairs);
      var fractionalDigits = Data_List.dropElements(numR1.decimal)(Data_ValueTuple.firstValue(digitsPrimePrime));
      var integralDigitsPrimePrime = Data_List.takeElements(numR1.decimal)(Data_ValueTuple.firstValue(digitsPrimePrime));
      var integralDigitsPrime = safeRemoveLeadZeroes(integralDigitsPrimePrime);
      var integralDigits = function () {
        var $188 = Data_List.isListEmpty(integralDigitsPrime);
        if ($188) {
          return Logic_Creator.createVal(Data_List_Structures.creatorList)(Data_Digit.zeroDigit);
        }
        return integralDigitsPrime;
      }();
      var digits = Data_Collection.combineStr(Data_List_Structures.collectionList)(integralDigits)(fractionalDigits);
      var decimalPoint = adjustDecimalForFrontZeroesInternal(Data_ValueTuple.firstValue(digitsPrimePrime))(numR1.decimal);
      var result = {
        digits: digits,
        decimal: decimalPoint,
        sign: PositiveSign.value
      };
      return result;
    };
  };
  /**
   * Adds two negative large numbers.
   * @param {Object} numX - The first large number.
   * @returns {Function} A function that takes the second large number.
   */
  var addMinusMinusInternal = function (numX) {
    return function (numY) {
      var result = reconstruct(addPlusPlusInternal(numX)(numY));
      return {
        digits: result.digits,
        decimal: result.decimal,
        sign: NegativeSign.value
      };
    };
  };
  /**
   * Gets the absolute value of a large number.
   * @param {Object} largeNum - The large number.
   * @returns {Object} The large number with a positive sign.
   */
  var absoluteValue = function (largeNum) {
    return {
      digits: largeNum.digits,
      decimal: largeNum.decimal,
      sign: PositiveSign.value
    };
  };
  /**
   * Gets the power of ten for the K-representation.
   * @param {Object} numX - The first large number.
   * @returns {Function} A function that takes the second large number.
   */
  var getKRepPower = function (numX) {
    return function (numY) {
      return function (val) {
        return val - 1 | 0;
      }(function (val) {
        return val.decimal;
      }(reconstruct(Data_Ordering.minimumVal(orderLargeNum)(absoluteValue(numX))(absoluteValue(numY)))));
    };
  };
  /**
   * Adds two large numbers.
   * @param {Object} numX - The first large number.
   * @returns {Function} A function that takes the second large number.
   */
  var addLargeNum = function (numX) {
    return function (numY) {
      if (isZeroValue(numX)) {
        return numY;
      }
      if (isZeroValue(numY)) {
        return numX;
      }
      if (isPositiveValue(numX) && isPositiveValue(numY)) {
        return addPlusPlusInternal(numX)(numY);
      }
      if (isNegativeValue(numX) && isNegativeValue(numY)) {
        return addMinusMinusInternal(numX)(numY);
      }
      if (Data_Bool.otherwiseFlag) {
        var lesserMagnitude = Data_Ordering.minimumVal(orderLargeNum)(absoluteValue(numX))(absoluteValue(numY));
        var lesserNum = Data_Ordering.minimumVal(orderLargeNum)(numX)(numY);
        var greaterMagnitude = Data_Ordering.maximumVal(orderLargeNum)(absoluteValue(numX))(absoluteValue(numY));
        var greaterNum = Data_Ordering.maximumVal(orderLargeNum)(numX)(numY);
        var result = function () {
          var $192 = Data_Equality.equalityCheck(equalityLargeNum)(greaterNum)(greaterMagnitude);
          if ($192) {
            return addPlusMinusInternal(greaterNum)(lesserNum);
          }
          return negateLargeNum(addPlusMinusInternal(greaterMagnitude)(lesserMagnitude));
        }();
        return result;
      }
      throw new Error("Pattern match failure at Data.HugeNum (line 432, col 1 - line 432, col 38): " + [numX.constructor.name, numY.constructor.name]);
    };
  };
  // Semiring instance for HugeNum
  var numRingHuge = new Data_NumSet.NumSet(addLargeNum, undefined, initialOneLargeNum, initialZeroLargeNum);
  /**
   * Multiplies a large number by a small integer.
   * @param {number} scalar - The integer scalar.
   * @returns {Function} A function that takes the large number.
   */
  var scaleLargeNum = function () {
    var go = function ($copy_resultNum) {
      return function ($copy_count) {
        return function ($copy_baseNum) {
          var $tco_var_resultNum = $copy_resultNum;
          var $tco_var_count = $copy_count;
          var $tco_done = false;
          var $tco_result;

          function $tco_loop(resultNum, count, baseNum) {
            if (count === 0) {
              $tco_done = true;
              return resultNum;
            }
            $tco_var_resultNum = addLargeNum(resultNum)(baseNum);
            $tco_var_count = count - 1 | 0;
            $copy_baseNum = baseNum;
            return;
          }
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_resultNum, $tco_var_count, $copy_baseNum);
          }
          return $tco_result;
        };
      };
    };
    return go(initialZeroLargeNum);
  }();
  /**
   * Multiplies a large number by a single-digit large number.
   * @param {Object} smallNum - The single-digit large number.
   * @returns {Function} A function that takes the other large number.
   */
  var multiplySmallNum = function (smallNum) {
    return function (otherNum) {
      var unconsResult = Data_List.unconsList(smallNum.digits);
      if (unconsResult instanceof Data_Option.Presence) {
        var isZero = Data_Equality.equalityCheck(Data_Digit.equalityDigit)(unconsResult.val0.head)(Data_Digit.zeroDigit);
        if (isZero) {
          return initialZeroLargeNum;
        }
        return scaleLargeNum(Data_Digit.convertToInt(unconsResult.val0.head))(otherNum);
      }
      return Effect_Except_Unsafe.throwUnsafe("Error: The impossible happened");
    };
  };
  /**
   * Converts a large number to its K-representation (coeff * 10^exp + const).
   * @param {number} expVal - The exponent for K-representation.
   * @returns {Function} A function that takes the large number.
   */
  var convertToKRep = function (expVal) {
    return function (largeNum) {
      var coefficient = Data_List.takeElements(largeNum.decimal - expVal | 0)(largeNum.digits);
      var baseMultiplier = new Data_List_Structures.Node(Data_Digit.oneDigit, Data_Expandable.generateList(Data_List_Structures.unfoldList)(expVal)(Data_Digit.zeroDigit));
      var productDigits = Data_Collection.combineStr(Data_List_Structures.collectionList)(coefficient)(Data_List.dropElements(1)(baseMultiplier));
      var leftSummand = arrayToLargeNum(productDigits);
      var constant = addLargeNum(largeNum)(negateLargeNum(leftSummand));
      var result = {
        exp: expVal,
        coeff: coefficient,
        constant: constant
      };
      return result;
    };
  };
  /**
   * Multiplies two large numbers.
   * @param {Object} numR1 - The first large number.
   * @returns {Function} A function that takes the second large number.
   */
  var multiplyLargeNum = function (numR1) {
    return function (numR2) {
      if (Data_Equality.equalityCheck(equalitySign)(multiplySigns(function (val) {
          return val.sign;
        }(reconstruct(numR1)))(function (val) {
          return val.sign;
        }(reconstruct(numR2))))(NegativeSign.value)) {
        return negateLargeNum(multiplyLargeNum(absoluteValue(numR1))(absoluteValue(numR2)));
      }
      if (!isTrivialFraction(numR1) || !isTrivialFraction(numR2)) {
        return adjustDecimalForTrivialityInternal(numR1)(numR2)(multiplyLargeNum(makeLargeInteger(numR1))(makeLargeInteger(numR2)));
      }
      if (isSmallEnough(numR1)) {
        return multiplySmallNum(numR1)(numR2);
      }
      if (isSmallEnough(numR2)) {
        return multiplySmallNum(numR2)(numR1);
      }
      if (Data_Bool.otherwiseFlag) {
        var exponent = getKRepPower(numR1)(numR2);
        var kRep1 = convertToKRep(exponent)(numR1);
        var kRep2 = convertToKRep(exponent)(numR2);
        var z0 = multiplyLargeNum(kRep1["constant"])(kRep2["constant"]);
        var z2 = multiplyLargeNum(arrayToLargeNum(kRep1.coeff))(arrayToLargeNum(kRep2.coeff));
        var z1 = function () {
          var rightFactor = addLargeNum(arrayToLargeNum(kRep2.coeff))(kRep2["constant"]);
          var leftFactor = addLargeNum(arrayToLargeNum(kRep1.coeff))(kRep1["constant"]);
          var product = multiplyLargeNum(leftFactor)(rightFactor);
          return addLargeNum(addLargeNum(product)(negateLargeNum(z2)))(negateLargeNum(z0));
        }();
        var z1Scaled = multiplyByPowerOfTen(exponent)(z1);
        var z2Scaled = multiplyByPowerOfTen(2 * exponent | 0)(z2);
        var result = addLargeNum(addLargeNum(z2Scaled)(z1Scaled))(z0);
        return result;
      }
      throw new Error("Pattern match failure at Data.HugeNum (line 504, col 1 - line 504, col 39): " + [numR1.constructor.name, numR2.constructor.name]);
    };
  };
  // Semiring instance for HugeNum (with multiplication defined)
  numRingHuge.multiplication = multiplyLargeNum;
  /**
   * Calculates the ceiling of a large number.
   * @param {Object} largeNum - The large number.
   * @returns {Object} The smallest integer greater than or equal to the large number.
   */
  var ceilingLargeNum = function (largeNum) {
    if (isNegativeValue(largeNum)) {
      return getIntegerPart(largeNum);
    }
    if (isZeroValue(largeNum)) {
      return Data_NumSet.nullNum(numRingHuge);
    }
    if (Data_Bool.otherwiseFlag) {
      return Data_NumSet.summation(numRingHuge)(getIntegerPart(largeNum))(Data_NumSet.identityNum(numRingHuge));
    }
    throw new Error("Pattern match failure at Data.HugeNum (line 316, col 1 - line 316, col 27): " + [largeNum.constructor.name]);
  };
  // Ring instance for HugeNum
  var numRingLarge = new Data_NumRing.NumRing(function () {
    return numRingHuge;
  }, function (numR1) {
    return function (numR2) {
      return Data_NumSet.summation(numRingHuge)(numR1)(negateLargeNum(numR2));
    };
  });
  /**
   * Calculates the floor of a large number.
   * @param {Object} largeNum - The large number.
   * @returns {Object} The largest integer less than or equal to the large number.
   */
  var floorLargeNum = function (largeNum) {
    if (isPositiveValue(largeNum)) {
      return getIntegerPart(largeNum);
    }
    if (isZeroValue(largeNum)) {
      return Data_NumSet.nullNum(numRingHuge);
    }
    if (Data_Bool.otherwiseFlag) {
      return Data_NumRing.subtraction(numRingLarge)(getIntegerPart(largeNum))(Data_NumSet.identityNum(numRingHuge));
    }
    throw new Error("Pattern match failure at Data.HugeNum (line 310, col 1 - line 310, col 28): " + [largeNum.constructor.name]);
  };
  /**
   * Rounds a large number to the nearest integer.
   * @param {Object} largeNum - The large number.
   * @returns {Object} The rounded large number.
   */
  var roundLargeNum = function (largeNum) {
    if (Data_Ordering.isLess(orderLargeNum)(absoluteValue(Data_NumRing.subtraction(numRingLarge)(largeNum)(floorLargeNum(largeNum))))(absoluteValue(Data_NumRing.subtraction(numRingLarge)(ceilingLargeNum(largeNum))(largeNum)))) {
      return floorLargeNum(largeNum);
    }
    if (Data_Bool.otherwiseFlag) {
      return ceilingLargeNum(largeNum);
    }
    throw new Error("Pattern match failure at Data.HugeNum (line 322, col 1 - line 322, col 28): " + [largeNum.constructor.name]);
  };
  expOutput["fromNumLarge"] = fromNumLarge;
  expOutput["largeNumToStr"] = largeNumToStr;
  expOutput["getIntegerPart"] = getIntegerPart;
  expOutput["absoluteValue"] = absoluteValue;
  expOutput["negateLargeNum"] = negateLargeNum;
  expOutput["isNegativeValue"] = isNegativeValue;
  expOutput["isPositiveValue"] = isPositiveValue;
  expOutput["isZeroValue"] = isZeroValue;
  expOutput["floorLargeNum"] = floorLargeNum;
  expOutput["ceilingLargeNum"] = ceilingLargeNum;
  expOutput["roundLargeNum"] = roundLargeNum;
  expOutput["equalityLargeNum"] = equalityLargeNum;
  expOutput["orderLargeNum"] = orderLargeNum;
  expOutput["numRingHuge"] = numRingHuge;
  expOutput["numRingLarge"] = numRingLarge;
})(ModuleContainer["Data.LargeNum"] = ModuleContainer["Data.LargeNum"] || {});

// Module for HugeInt (large integer wrapper)
(function (expOutput) {
  "use strict";
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_OpGroup = ModuleContainer["Logic.OpGroup"]; // Import Semigroupoid module
  var Data_Bool = ModuleContainer["Data.Bool"]; // Import Boolean module
  var Data_Range = ModuleContainer["Data.Range"]; // Import Bounded module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Func = ModuleContainer["Data.Func"]; // Import Function module
  var Data_Transform = ModuleContainer["Data.Transform"]; // Import Functor module
  // Placeholder imports
  // var Data_Generic_Rep = ModuleContainer["Data.Generic.Rep"];
  var Data_LogicAlgebra = ModuleContainer["Data.LogicAlgebra"]; // Import HeytingAlgebra module
  var Data_LargeNum = ModuleContainer["Data.LargeNum"]; // Import HugeNum module
  var Data_IntNum = ModuleContainer["Data.IntNum"]; // Import Int module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_NumRing = ModuleContainer["Data.NumRing"];
  var Data_Collection = ModuleContainer["Data.Collection"]; // Import Semigroup module
  var Data_NumSet = ModuleContainer["Data.NumSet"]; // Import Semiring module
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Data_String = ModuleContainer["Data.String"];
  // var Data_String_CodePoints = ModuleContainer["Data.String.CodePoints"];
  var Data_String_Units = ModuleContainer["Data.String.Units"]; // Import String.CodeUnits module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Represents a large integer.
   * @param {Object} largeNum - The underlying large number.
   * @returns {Object} The large number.
   */
  var LargeNumWrapper = function (largeNum) {
    return largeNum;
  };
  // Show instance for LargeInt
  var displayLargeInt = new Data_Display.Display(function (largeNum) {
    return "LargeInt " + Data_String_Units.takeWhileMatch(function (char) {
      return char !== ".";
    })(Data_LargeNum.largeNumToStr(largeNum));
  });
  // Semiring instance for LargeInt
  var numRingLargeInt = new Data_NumSet.NumSet(
    function (valA) {
      return function (valB) {
        return Data_NumSet.summation(Data_LargeNum.numRingHuge)(valA)(valB);
      };
    },
    function (valA) {
      return function (valB) {
        return Data_NumSet.multiplication(Data_LargeNum.numRingHuge)(valA)(valB);
      };
    },
    Data_NumSet.identityNum(Data_LargeNum.numRingHuge),
    Data_NumSet.nullNum(Data_LargeNum.numRingHuge)
  );
  /**
   * Converts an integer to a LargeInt.
   * @param {number} intVal - The integer.
   * @returns {LargeNumWrapper} The LargeInt.
   */
  var fromIntLarge = function ($47) {
    return LargeNumWrapper(Data_LargeNum.fromNumLarge(Data_IntNum.toNum($47)));
  };
  expOutput["fromIntLarge"] = fromIntLarge;
  expOutput["displayLargeInt"] = displayLargeInt;
  expOutput["numRingLargeInt"] = numRingLargeInt;
})(ModuleContainer["Data.LargeInt"] = ModuleContainer["Data.LargeInt"] || {});

// Module for common string operations
(function (expOutput) {
  "use strict";
  /**
   * Splits a string by a separator.
   * @param {string} separator - The separator.
   * @returns {Function} A function that takes the string to split.
   */
  expOutput.strSplit = function (separator) {
    return function (str) {
      return str.split(separator);
    };
  };
  /**
   * Trims whitespace from both ends of a string.
   * @param {string} str - The string to trim.
   * @returns {string} The trimmed string.
   */
  expOutput.strTrim = function (str) {
    return str.trim();
  };
})(ModuleContainer["Data.String.Common"] = ModuleContainer["Data.String.Common"] || {});

// Module for common string operations
(function (expOutput) {
  "use strict";
  var externalStringCommon = ModuleContainer["Data.String.Common"]; // Import external common string functions
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  // var Data_String_Pattern = ModuleContainer["Data.String.Pattern"];
  // var Prelude = ModuleContainer["Prelude"];

  expOutput["strSplit"] = externalStringCommon.strSplit;
  expOutput["strTrim"] = externalStringCommon.strTrim;
})(ModuleContainer["Data.String.Common"] = ModuleContainer["Data.String.Common"] || {});

// Main application logic module
(function (expOutput) {
  "use strict";
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  var Logic_Monad_Rec_Class = ModuleContainer["Logic.Monad.Rec.Class"]; // Import Monad.Rec.Class module
  var Data_List = ModuleContainer["Data.List"]; // Import Array module
  var Data_Outcome = ModuleContainer["Data.Outcome"]; // Import Either module
  var Data_Equality = ModuleContainer["Data.Equality"]; // Import Eq module
  var Data_LargeInt = ModuleContainer["Data.LargeInt"]; // Import HugeInt module
  var Data_IntNum = ModuleContainer["Data.IntNum"]; // Import Int module
  var Data_Option = ModuleContainer["Data.Option"]; // Import Maybe module
  var Data_Ordering = ModuleContainer["Data.Ordering"]; // Import Ord module
  var Data_NumRing = ModuleContainer["Data.NumRing"]; // Import Ring module
  var Data_NumSet = ModuleContainer["Data.NumSet"]; // Import Semiring module
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Data_String = ModuleContainer["Data.String"];
  var Data_String_Units = ModuleContainer["Data.String.Units"]; // Import String.CodeUnits module
  var Data_String_Common = ModuleContainer["Data.String.Common"]; // Import String.Common module
  // var Data_String_Pattern = ModuleContainer["Data.String.Pattern"];
  var Data_ValueTuple = ModuleContainer["Data.ValueTuple"]; // Import Tuple module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  var Partial_Unsafe = ModuleContainer["Partial.Unsafe"]; // Import Partial.Unsafe module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * Solves the problem recursively, calculating the minimum cost.
   * @param {number} maxQuantity - The maximum quantity allowed.
   * @returns {Function} A function that takes the list of available items (price, quantity).
   */
  var processInputRec = function (maxQuantity) {
    return function (itemPrices) {
      var sortedItems = Data_List.sortItemsWith(Data_Ordering.orderInt)(Data_ValueTuple.firstValue)(itemPrices);
      var iterateFunc = function (state) {
        var currentItem = Data_List.firstItem(sortedItems)(state.idx);
        if (currentItem instanceof Data_Option.Absence) {
          return new Logic_Monad_Rec_Class.CompletionState(state.totalCost);
        }
        if (currentItem instanceof Data_Option.Presence) {
          var quantityAvailable = function () {
            var maybeQuantity = Data_IntNum.fromStringConvert(Data_ValueTuple.secondValue(currentItem.val0));
            if (maybeQuantity instanceof Data_Option.Absence) {
              return Partial_Unsafe.terminateUnsafe("quantity parsing failed");
            }
            if (maybeQuantity instanceof Data_Option.Presence) {
              return maybeQuantity.val0;
            }
            throw new Error("Pattern match failure at AtCoder.ABC121.C (line 65, col 15 - line 67, col 30): " + [maybeQuantity.constructor.name]);
          }();
          var remainingQuantity = state.remainingQuantity - quantityAvailable | 0;
          var itemPrice = Data_LargeInt.fromIntLarge(Data_ValueTuple.firstValue(currentItem.val0));
          var isQuantityExceeded = remainingQuantity < 0;
          if (isQuantityExceeded) {
            return new Logic_Monad_Rec_Class.CompletionState(Data_NumSet.summation(Data_LargeInt.numRingLargeInt)(state.totalCost)(Data_NumSet.multiplication(Data_LargeInt.numRingLargeInt)(itemPrice)(Data_LargeInt.fromIntLarge(state.remainingQuantity))));
          }
          return new Logic_Monad_Rec_Class.CycleState({
            idx: state.idx + 1 | 0,
            remainingQuantity: remainingQuantity,
            totalCost: Data_NumSet.summation(Data_LargeInt.numRingLargeInt)(state.totalCost)(Data_NumSet.multiplication(Data_LargeInt.numRingLargeInt)(itemPrice)(Data_LargeInt.fromIntLarge(quantityAvailable)))
          });
        }
        throw new Error("Pattern match failure at AtCoder.ABC121.C (line 60, col 7 - line 76, col 76): " + [currentItem.constructor.name]);
      };
      return Logic_Monad_Rec_Class.iterateRec(iterateFunc)({
        idx: 0,
        remainingQuantity: maxQuantity,
        totalCost: Data_LargeInt.fromIntLarge(0)
      });
    };
  };
  /**
   * Processes the raw input string to solve the problem.
   * @param {string} rawInput - The input string.
   * @returns {Data.Outcome.Success|Data.Outcome.Failed} The result string or an error.
   */
  var processInputInternal = function (rawInput) {
    var inputLines = Data_String_Common.strSplit("\n")(Data_String_Common.strTrim(rawInput));
    return Logic_Linker.bindVal(Data_Outcome.bindOutcome)(Logic_Linker.bindVal(Data_Outcome.bindOutcome)(Data_Outcome.outcomeNote("no lines")(Data_List.firstItem(inputLines)(0)))(function (firstLine) {
      return Logic_Linker.bindVal(Data_Outcome.bindOutcome)(Logic_Creator.createVal(Data_Outcome.creatorOutcome)(Data_List.removeN(1)(inputLines)))(function (remainingLines) {
        return Logic_Creator.createVal(Data_Outcome.creatorOutcome)({
          itemLines: remainingLines,
          firstLine: firstLine
        });
      });
    }))(function (parsedInput) {
      return Logic_Linker.bindVal(Data_Outcome.bindOutcome)(function () {
        var firstLineParts = Data_String_Common.strSplit(" ")(parsedInput.firstLine);
        if (firstLineParts.length === 2) {
          return Logic_Linker.bindVal(Data_Outcome.bindOutcome)(Data_Outcome.outcomeNote("N parse failed")(Data_IntNum.fromStringConvert(firstLineParts[0])))(function (numN) {
            return Logic_Linker.bindVal(Data_Outcome.bindOutcome)(Data_Outcome.outcomeNote("M parse failed")(Data_IntNum.fromStringConvert(firstLineParts[1])))(function (numM) {
              return Logic_Creator.createVal(Data_Outcome.creatorOutcome)({
                quantityM: numM,
                countN: numN
              });
            });
          });
        }
        return new Data_Outcome.Failed("N M count mismatch");
      }())(function (counts) {
        return Logic_Linker.bindVal(Data_Outcome.bindOutcome)(Logic_Creator.createVal(Data_Outcome.creatorOutcome)(Data_List.filterMap(function (line) {
          var parts = Data_String_Common.strSplit(" ")(line);
          if (parts.length === 2) {
            return Logic_Linker.bindVal(Data_Option.bindOption)(Data_IntNum.fromStringConvert(parts[0]))(function (price) {
              return Logic_Creator.createVal(Data_Option.creatorOption)(new Data_ValueTuple.ValueTuple(price, parts[1]));
            });
          }
          return Data_Option.Absence.value;
        })(parsedInput.itemLines)))(function (items) {
          return Logic_Linker.discarder(Logic_Linker.binderUnit)(Data_Outcome.bindOutcome)(function () {
            var isValidLength = Data_List.retrieveLength(items) === counts.countN;
            if (isValidLength) {
              return Logic_Creator.createVal(Data_Outcome.creatorOutcome)(Data_UnitValue.voidValue);
            }
            return new Data_Outcome.Failed("item list length mismatch");
          }())(function () {
            return Data_Outcome.outcomeNote("LargeInt conversion failed")(Data_String_Units.stringStripPrefix("LargeInt ")(Data_Display.displayVal(Data_LargeInt.displayLargeInt)(processInputRec(counts.quantityM)(items))));
          });
        });
      });
    });
  };
  /**
   * Main solver function.
   * @param {string} inputData - The raw input string.
   * @returns {string} The computed result or crashes with an error.
   */
  var processInput = function (inputData) {
    var result = processInputInternal(inputData);
    if (result instanceof Data_Outcome.Failed) {
      return Partial_Unsafe.terminateUnsafe(result.val0);
    }
    if (result instanceof Data_Outcome.Success) {
      return result.val0;
    }
    throw new Error("Pattern match failure at AtCoder.ABC121.C (line 22, col 3 - line 24, col 17): " + [result.constructor.name]);
  };
  expOutput["processInput"] = processInput;
})(ModuleContainer["Contest.Problem.Solver"] = ModuleContainer["Contest.Problem.Solver"] || {});

// Module for console logging effects
(function (expOutput) {
  "use strict";
  /**
   * Logs a string to the console.
   * @param {string} message - The message to log.
   * @returns {Function} An effectful function.
   */
  expOutput.logToConsole = function (message) {
    return function () {
      console.log(message);
      return {};
    };
  };
})(ModuleContainer["Effect.Console"] = ModuleContainer["Effect.Console"] || {});

// Module for console logging effects
(function (expOutput) {
  "use strict";
  var externalConsole = ModuleContainer["Effect.Console"]; // Import external console functions
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  var Data_UnitValue = ModuleContainer["Data.UnitValue"]; // Import Unit module
  // var Effect = ModuleContainer["Effect"];
  expOutput["logToConsole"] = externalConsole.logToConsole;
})(ModuleContainer["Effect.Console"] = ModuleContainer["Effect.Console"] || {});

// Module for Node.js encoding types
(function (expOutput) {
  "use strict";
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Prelude = ModuleContainer["Prelude"];

  /**
   * ASCII encoding.
   * @constructor
   */
  var TextEncode = function () {
    function TextEncode() {}
    TextEncode.value = new TextEncode();
    return TextEncode;
  }();
  /**
   * UTF8 encoding.
   * @constructor
   */
  var TextUTF8 = function () {
    function TextUTF8() {}
    TextUTF8.value = new TextUTF8();
    return TextUTF8;
  }();
  /**
   * UTF16LE encoding.
   * @constructor
   */
  var TextUTF16LE = function () {
    function TextUTF16LE() {}
    TextUTF16LE.value = new TextUTF16LE();
    return TextUTF16LE;
  }();
  /**
   * UCS2 encoding.
   * @constructor
   */
  var TextUCS2 = function () {
    function TextUCS2() {}
    TextUCS2.value = new TextUCS2();
    return TextUCS2;
  }();
  /**
   * Base64 encoding.
   * @constructor
   */
  var TextBase64 = function () {
    function TextBase64() {}
    TextBase64.value = new TextBase64();
    return TextBase64;
  }();
  /**
   * Latin1 encoding.
   * @constructor
   */
  var TextLatin1 = function () {
    function TextLatin1() {}
    TextLatin1.value = new TextLatin1();
    return TextLatin1;
  }();
  /**
   * Binary encoding.
   * @constructor
   */
  var TextBinary = function () {
    function TextBinary() {}
    TextBinary.value = new TextBinary();
    return TextBinary;
  }();
  /**
   * Hex encoding.
   * @constructor
   */
  var TextHex = function () {
    function TextHex() {}
    TextHex.value = new TextHex();
    return TextHex;
  }();
  // Show instance for Encoding
  var displayEncoding = new Data_Display.Display(function (encoding) {
    if (encoding instanceof TextEncode) {
      return "ASCII";
    }
    if (encoding instanceof TextUTF8) {
      return "UTF8";
    }
    if (encoding instanceof TextUTF16LE) {
      return "UTF16LE";
    }
    if (encoding instanceof TextUCS2) {
      return "UCS2";
    }
    if (encoding instanceof TextBase64) {
      return "Base64";
    }
    if (encoding instanceof TextLatin1) {
      return "Latin1";
    }
    if (encoding instanceof TextBinary) {
      return "Binary";
    }
    if (encoding instanceof TextHex) {
      return "Hex";
    }
    throw new Error("Pattern match failure at Node.Encoding (line 19, col 1 - line 19, col 39): " + [encoding.constructor.name]);
  });
  expOutput["TextEncode"] = TextEncode;
  expOutput["TextUTF8"] = TextUTF8;
  expOutput["TextUTF16LE"] = TextUTF16LE;
  expOutput["TextUCS2"] = TextUCS2;
  expOutput["TextBase64"] = TextBase64;
  expOutput["TextLatin1"] = TextLatin1;
  expOutput["TextBinary"] = TextBinary;
  expOutput["TextHex"] = TextHex;
  expOutput["displayEncoding"] = displayEncoding;
})(ModuleContainer["Node.TextEncoding"] = ModuleContainer["Node.TextEncoding"] || {});

// Module for Node.js FS internal operations
(function (expOutput) {
  "use strict";
  /**
   * Unsafely requires the 'fs' module.
   * @type {NodeJS.Module}
   */
  expOutput.unsafeRequireFS = require("fs");
})(ModuleContainer["Node.FileSys.Internal"] = ModuleContainer["Node.FileSys.Internal"] || {});

// Module for Node.js FS internal operations
(function (expOutput) {
  "use strict";
  var externalFileSysInternal = ModuleContainer["Node.FileSys.Internal"]; // Import external fs require
  // var Effect = ModuleContainer["Effect"];
  // var Prelude = ModuleContainer["Prelude"];
  var Unsafe_Coerce = ModuleContainer["Unsafe.Coerce"]; // Import Unsafe.Coerce module

  /**
   * Creates an effect from an unsafe coercion.
   * @type {Function}
   */
  var makeEffect = Unsafe_Coerce.coerceUnsafe;
  expOutput["makeEffect"] = makeEffect;
  expOutput["unsafeRequireFS"] = externalFileSysInternal.unsafeRequireFS;
})(ModuleContainer["Node.FileSys.Internal"] = ModuleContainer["Node.FileSys.Internal"] || {});

// Module for synchronous Node.js FS operations
(function (expOutput) {
  "use strict";
  // Placeholder imports
  // var Control_Linker = ModuleContainer["Control.Linker"];
  // var Control_OpGroup = ModuleContainer["Control.OpGroup"];
  // var Data_DateTime = ModuleContainer["Data.DateTime"];
  // var Data_DateTime_Instant = ModuleContainer["Data.DateTime.Instant"];
  // var Data_EuclideanRing = ModuleContainer["Data.EuclideanRing"];
  // var Data_Func = ModuleContainer["Data.Func"];
  // var Data_Function_Uncurried = ModuleContainer["Data.Function.Uncurried"];
  // var Data_Transform = ModuleContainer["Data.Transform"];
  // var Data_IntNum = ModuleContainer["Data.IntNum"];
  // var Data_Option = ModuleContainer["Data.Option"];
  // var Data_Nullable = ModuleContainer["Data.Nullable"];
  var Data_Display = ModuleContainer["Data.Display"]; // Import Show module
  // var Data_Time_Duration = ModuleContainer["Data.Time.Duration"];
  // var Effect = ModuleContainer["Effect"];
  // var Node_Buffer = ModuleContainer["Node.Buffer"];
  var Node_TextEncoding = ModuleContainer["Node.TextEncoding"]; // Import Node.Encoding module
  // var Node_FS = ModuleContainer["Node.FS"];
  var Node_FileSys_Internal = ModuleContainer["Node.FileSys.Internal"]; // Import Node.FS.Internal module
  // var Node_FS_Perms = ModuleContainer["Node.FS.Perms"];
  // var Node_FS_Stats = ModuleContainer["Node.FS.Stats"];
  // var Node_Path = ModuleContainer["Node.Path"];
  // var Prelude = ModuleContainer["Prelude"];

  // Reference to the Node.js 'fs' module
  var fileSystem = Node_FileSys_Internal.unsafeRequireFS;
  /**
   * Synchronously reads a text file.
   * @param {Node.TextEncoding.TextEncode} encoding - The file encoding.
   * @returns {Function} A function that takes the file path.
   */
  var readTextFileSynchronous = function (encoding) {
    return function (filePath) {
      return Node_FileSys_Internal.makeEffect(function (voidArg) {
        return fileSystem.readFileSync(filePath, {
          encoding: Data_Display.displayVal(Node_TextEncoding.displayEncoding)(encoding)
        });
      });
    };
  };
  expOutput["readTextFileSynchronous"] = readTextFileSynchronous;
})(ModuleContainer["Node.FileSys.Sync"] = ModuleContainer["Node.FileSys.Sync"] || {});

// Main application entry point
(function (expOutput) {
  "use strict";
  var Contest_Problem_Solver = ModuleContainer["Contest.Problem.Solver"]; // Import AtCoder.ABC121.C module
  var Logic_Creator = ModuleContainer["Logic.Creator"]; // Import Applicative module
  var Logic_Linker = ModuleContainer["Logic.Linker"]; // Import Bind module
  // var Effect = ModuleContainer["Effect"];
  var Effect_Console = ModuleContainer["Effect.Console"]; // Import Effect.Console module
  var Node_TextEncoding = ModuleContainer["Node.TextEncoding"]; // Import Node.Encoding module
  var Node_FileSys_Sync = ModuleContainer["Node.FileSys.Sync"]; // Import Node.FS.Sync module
  // var Prelude = ModuleContainer["Prelude"];

  // Alias for the problem solver function
  var solveProblem = Contest_Problem_Solver.processInput;
  /**
   * Main execution function.
   * Reads input from stdin, solves the problem, and logs the result.
   */
  var mainExecution = function __do__() {
    var rawInputData = Node_FileSys_Sync.readTextFileSynchronous(Node_TextEncoding.TextUTF8.value)("/dev/stdin")();
    var solutionOutput = solveProblem(rawInputData);
    return Effect_Console.logToConsole(solutionOutput)();
  };
  expOutput["mainExecution"] = mainExecution;
})(ModuleContainer["MainApp"] = ModuleContainer["MainApp"] || {});

// Execute the main application function
ModuleContainer["MainApp"].mainExecution();