var PS = {};
// This is the global PS object, initialized as an empty object.
// It will hold all the modules and their exports.

/*
 * Module: Control.Apply
 * This module defines functions for applying functions in an array context.
 */
(function (exports) {
  "use strict";

  // arrayApply: Applies an array of functions to an array of values.
  // It returns a new array containing the results of applying each function
  // from the first array to each value from the second array.
  exports.arrayApply = function (fs) {
    return function (xs) {
      // Get the lengths of the input arrays.
      var l = fs.length; // Length of the functions array.
      var k = xs.length; // Length of the values array.

      // Initialize the result array with the correct size.
      // The total number of applications will be l * k.
      var result = new Array(l * k);

      // 'n' is an index for the 'result' array.
      var n = 0;

      /*
       * Loop through each function in 'fs'.
       */
      for (var i = 0; i < l; i++) {
        var f = fs[i]; // Current function to apply.

        /*
         * For each function, loop through each value in 'xs'.
         */
        for (var j = 0; j < k; j++) {
          // Apply the current function 'f' to the current value 'xs[j]'.
          // Store the result in the 'result' array and increment 'n'.
          result[n++] = f(xs[j]);
        }
      }

      // Return the populated result array.
      return result;
    };
  };
})(PS["Control.Apply"] = PS["Control.Apply"] || {}); // Assigns to PS["Control.Apply"], creating it if it doesn't exist.

/*
 * Module: Data.Function
 * Provides utility functions for working with functions.
 */
(function (exports) {
  "use strict";

  // Import necessary modules (though not directly used in 'flip', they might be for other Data.Function exports).
  var Control_Category = PS["Control.Category"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ring = PS["Data.Ring"];

  // flip: Takes a binary function and returns a new function that
  // takes its arguments in reverse order.
  var flip = function (f) {
    return function (b) {
      return function (a) {
        return f(a)(b); // Call the original function 'f' with 'a' then 'b'.
      };
    };
  };

  // Export the 'flip' function.
  exports["flip"] = flip;
})(PS["Data.Function"] = PS["Data.Function"] || {});

/*
 * Module: Data.Functor (Foreign Implementation)
 * Provides the `arrayMap` function for mapping over arrays.
 */
(function (exports) {
  "use strict";

  // arrayMap: Maps a function over an array.
  // It applies the given function 'f' to each element of 'arr'
  // and returns a new array with the results.
  exports.arrayMap = function (f) {
    return function (arr) {
      var l = arr.length; // Get the length of the input array.
      var result = new Array(l); // Initialize result array of the same length.

      // Iterate through the input array.
      for (var i = 0; i < l; i++) {
        result[i] = f(arr[i]); // Apply 'f' to each element and store in 'result'.
      }

      // Return the new array.
      return result;
    };
  };
})(PS["Data.Functor"] = PS["Data.Functor"] || {});

/*
 * Module: Control.Semigroupoid
 * Defines the Semigroupoid type class and instances.
 */
(function (exports) {
  "use strict";

  // Semigroupoid constructor.
  // A Semigroupoid is a type that has a `compose` operation.
  var Semigroupoid = function (compose) {
    this.compose = compose;
  };

  // semigroupoidFn: An instance of Semigroupoid for functions.
  // Function composition: (f . g)(x) = f(g(x)).
  var semigroupoidFn = new Semigroupoid(function (f) {
    return function (g) {
      return function (x) {
        return f(g(x)); // Composition logic.
      };
    };
  });

  // compose: A helper function to access the 'compose' method of a Semigroupoid instance.
  var compose = function (dict) {
    return dict.compose;
  };

  // Export the 'compose' function, Semigroupoid constructor, and the function instance.
  exports["compose"] = compose;
  exports["Semigroupoid"] = Semigroupoid;
  exports["semigroupoidFn"] = semigroupoidFn;
})(PS["Control.Semigroupoid"] = PS["Control.Semigroupoid"] || {});

/*
 * Module: Data.Unit
 * Defines the unit value.
 */
(function (exports) {
  "use strict";

  // unit: The single value of the Unit type.
  // In JavaScript, an empty object can represent this.
  exports.unit = {};
})(PS["Data.Unit"] = PS["Data.Unit"] || {});

/*
 * Module: Data.Show (Foreign Implementation)
 * Provides the `showIntImpl` function for showing integers.
 */
(function (exports) {
  "use strict";

  // showIntImpl: Converts an integer to its string representation.
  exports.showIntImpl = function (n) {
    return n.toString(); // Standard JavaScript number to string conversion.
  };
})(PS["Data.Show"] = PS["Data.Show"] || {});

/*
 * Module: Data.Show
 * Defines the Show type class and instances.
 */
(function (exports) {
  "use strict";

  // Import foreign module for integer showing.
  var $foreign = PS["Data.Show"];

  // Other imports (not directly used in this snippet, but common for Data.Show).
  var Data_Symbol = PS["Data.Symbol"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_RowList = PS["Type.Data.RowList"];

  // Show constructor.
  // A Show instance must provide a `show` method.
  var Show = function (show) {
    this.show = show;
  };

  // showInt: An instance of Show for integers.
  // It uses the foreign `showIntImpl` function.
  var showInt = new Show($foreign.showIntImpl);

  // show: A helper function to access the 'show' method of a Show instance.
  var show = function (dict) {
    return dict.show;
  };

  // Export the Show constructor, the 'show' function, and the integer instance.
  exports["Show"] = Show;
  exports["show"] = show;
  exports["showInt"] = showInt;
})(PS["Data.Show"] = PS["Data.Show"] || {});

/*
 * Module: Data.Unit (Exports)
 * Exports the unit value, potentially importing from a foreign module.
 */
(function (exports) {
  "use strict";

  // Import the foreign unit definition.
  var $foreign = PS["Data.Unit"];

  // Other imports (not directly used here).
  var Data_Show = PS["Data.Show"];

  // Export the unit value.
  exports["unit"] = $foreign.unit;
})(PS["Data.Unit"] = PS["Data.Unit"] || {});

/*
 * Module: Data.Functor
 * Defines the Functor type class and instances for arrays and functions.
 */
(function (exports) {
  "use strict";

  // Import foreign module for array mapping.
  var $foreign = PS["Data.Functor"];

  // Import dependencies.
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Function = PS["Data.Function"];
  var Data_Unit = PS["Data.Unit"];

  // Functor constructor.
  // A Functor instance must provide a `map` method.
  var Functor = function (map) {
    this.map = map;
  };

  // map: A helper function to access the 'map' method of a Functor instance.
  var map = function (dict) {
    return dict.map;
  };

  // functorFn: An instance of Functor for functions.
  // Mapping over a function `f` with `g` means `g . f`.
  var functorFn = new Functor(
    Control_Semigroupoid.compose(Control_Semigroupoid.semigroupoidFn)
  );

  // functorArray: An instance of Functor for arrays.
  // It uses the foreign `arrayMap` function.
  var functorArray = new Functor($foreign.arrayMap);

  // Export the Functor constructor, the 'map' function, and the instances.
  exports["Functor"] = Functor;
  exports["map"] = map;
  exports["functorFn"] = functorFn;
  exports["functorArray"] = functorArray;
})(PS["Data.Functor"] = PS["Data.Functor"] || {});

/*
 * Module: Control.Apply
 * Defines the Apply type class and instance for arrays.
 */
(function (exports) {
  "use strict";

  // Import foreign module for array application.
  var $foreign = PS["Control.Apply"];

  // Import dependencies.
  var Control_Category = PS["Control.Category"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];

  // Apply constructor.
  // An Apply instance must provide a `Functor0` (a Functor instance) and an `apply` method.
  var Apply = function (Functor0, apply) {
    this.Functor0 = Functor0;
    this.apply = apply;
  };

  // applyArray: An instance of Apply for arrays.
  // It uses the foreign `arrayApply` function and the `functorArray` instance.
  var applyArray = new Apply(function () {
    return Data_Functor.functorArray;
  }, $foreign.arrayApply);

  // apply: A helper function to access the 'apply' method of an Apply instance.
  var apply = function (dict) {
    return dict.apply;
  };

  // Export the Apply constructor, the 'apply' function, and the array instance.
  exports["Apply"] = Apply;
  exports["apply"] = apply;
  exports["applyArray"] = applyArray;
})(PS["Control.Apply"] = PS["Control.Apply"] || {});

/*
 * Module: Control.Applicative
 * Defines the Applicative type class.
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var Control_Apply = PS["Control.Apply"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Unit = PS["Data.Unit"];

  // Applicative constructor.
  // An Applicative instance must provide an `Apply0` (an Apply instance) and a `pure` method.
  var Applicative = function (Apply0, pure) {
    this.Apply0 = Apply0;
    this.pure = pure;
  };

  // pure: A helper function to access the 'pure' method of an Applicative instance.
  var pure = function (dict) {
    return dict.pure;
  };

  // Export the Applicative constructor and the 'pure' function.
  exports["Applicative"] = Applicative;
  exports["pure"] = pure;
})(PS["Control.Applicative"] = PS["Control.Applicative"] || {});

/*
 * Module: Control.Bind (Foreign Implementation)
 * Provides the `arrayBind` function for monadic binding over arrays.
 */
(function (exports) {
  "use strict";

  // arrayBind: Monadic bind for arrays (also known as flatMap or concatMap).
  // It applies a function 'f' that returns an array to each element of 'arr',
  // and then flattens the resulting arrays into a single array.
  exports.arrayBind = function (arr) {
    return function (f) {
      var result = []; // Initialize an empty array for the results.

      // Iterate through the input array.
      for (var i = 0, l = arr.length; i < l; i++) {
        // Apply 'f' to the current element, which returns an array.
        // Then, append all elements of that returned array to 'result'.
        Array.prototype.push.apply(result, f(arr[i]));
      }

      // Return the flattened result array.
      return result;
    };
  };
})(PS["Control.Bind"] = PS["Control.Bind"] || {});

/*
 * Module: Control.Bind
 * Defines the Bind and Discard type classes and instances.
 */
(function (exports) {
  "use strict";

  // Import foreign module for array binding.
  var $foreign = PS["Control.Bind"];

  // Import dependencies.
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Category = PS["Control.Category"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Unit = PS["Data.Unit"];

  // Bind constructor.
  // A Bind instance must provide an `Apply0` (an Apply instance) and a `bind` method.
  var Bind = function (Apply0, bind) {
    this.Apply0 = Apply0;
    this.bind = bind;
  };

  // Discard constructor.
  // A Discard instance must provide a `discard` method.
  var Discard = function (discard) {
    this.discard = discard;
  };

  // discard: A helper function to access the 'discard' method.
  var discard = function (dict) {
    return dict.discard;
  };

  // bindArray: An instance of Bind for arrays.
  // It uses the `applyArray` instance and the foreign `arrayBind` function.
  var bindArray = new Bind(function () {
    return Control_Apply.applyArray;
  }, $foreign.arrayBind);

  // bind: A helper function to access the 'bind' method of a Bind instance.
  var bind = function (dict) {
    return dict.bind;
  };

  // discardUnit: An instance of Discard that uses the bind operation.
  // It's used when the result of a monadic computation is not needed (e.g., `_ <- action`).
  var discardUnit = new Discard(function (dictBind) {
    return bind(dictBind);
  });

  // Export the Bind constructor, 'bind' function, Discard constructor,
  // 'discard' function, and the array and unit instances.
  exports["Bind"] = Bind;
  exports["bind"] = bind;
  exports["Discard"] = Discard;
  exports["discard"] = discard;
  exports["bindArray"] = bindArray;
  exports["discardUnit"] = discardUnit;
})(PS["Control.Bind"] = PS["Control.Bind"] || {});

/*
 * Module: Data.Foldable (Foreign Implementation)
 * Provides `foldrArray` and `foldlArray` for folding over arrays.
 */
(function (exports) {
  "use strict";

  // foldrArray: Folds an array from right to left.
  // `f` is the combining function, `init` is the initial accumulator value, `xs` is the array.
  exports.foldrArray = function (f) {
    return function (init) {
      return function (xs) {
        var acc = init; // Initialize accumulator.
        var len = xs.length; // Get array length.

        // Loop from the last element to the first.
        for (var i = len - 1; i >= 0; i--) {
          acc = f(xs[i])(acc); // Apply function, updating accumulator.
        }
        return acc; // Return final accumulator value.
      };
    };
  };

  // foldlArray: Folds an array from left to right.
  // `f` is the combining function, `init` is the initial accumulator value, `xs` is the array.
  exports.foldlArray = function (f) {
    return function (init) {
      return function (xs) {
        var acc = init; // Initialize accumulator.
        var len = xs.length; // Get array length.

        // Loop from the first element to the last.
        for (var i = 0; i < len; i++) {
          acc = f(acc)(xs[i]); // Apply function, updating accumulator.
        }
        return acc; // Return final accumulator value.
      };
    };
  };
})(PS["Data.Foldable"] = PS["Data.Foldable"] || {});

/*
 * Module: Data.HeytingAlgebra (Foreign Implementation)
 * Provides basic boolean operations.
 */
(function (exports) {
  "use strict";

  // boolConj: Logical AND for booleans.
  exports.boolConj = function (b1) {
    return function (b2) {
      return b1 && b2;
    };
  };

  // boolDisj: Logical OR for booleans.
  exports.boolDisj = function (b1) {
    return function (b2) {
      return b1 || b2;
    };
  };

  // boolNot: Logical NOT for booleans.
  exports.boolNot = function (b) {
    return !b;
  };
})(PS["Data.HeytingAlgebra"] = PS["Data.HeytingAlgebra"] || {});

/*
 * Module: Data.HeytingAlgebra
 * Defines the HeytingAlgebra type class and instance for booleans.
 */
(function (exports) {
  "use strict";

  // Import foreign module for boolean operations.
  var $foreign = PS["Data.HeytingAlgebra"];

  // Other imports (not directly used here).
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_Row = PS["Type.Data.Row"];
  var Type_Data_RowList = PS["Type.Data.RowList"];

  // HeytingAlgebra constructor.
  // A HeytingAlgebra instance must provide conj, disj, ff, implies, not, and tt methods.
  var HeytingAlgebra = function (conj, disj, ff, implies, not, tt) {
    this.conj = conj;
    this.disj = disj;
    this.ff = ff;
    this.implies = implies;
    this.not = not;
    this.tt = tt;
  };

  // tt: Helper to access the 'tt' (true) value.
  var tt = function (dict) {
    return dict.tt;
  };

  // not: Helper to access the 'not' operation.
  var not = function (dict) {
    return dict.not;
  };

  // implies: Helper to access the 'implies' operation.
  var implies = function (dict) {
    return dict.implies;
  };

  // ff: Helper to access the 'ff' (false) value.
  var ff = function (dict) {
    return dict.ff;
  };

  // disj: Helper to access the 'disj' (disjunction/OR) operation.
  var disj = function (dict) {
    return dict.disj;
  };

  // heytingAlgebraBoolean: An instance of HeytingAlgebra for booleans.
  var heytingAlgebraBoolean = new HeytingAlgebra(
    $foreign.boolConj,
    $foreign.boolDisj,
    false,
    function (a) {
      return function (b) {
        // a implies b is equivalent to (not a) or b.
        return disj(heytingAlgebraBoolean)(not(heytingAlgebraBoolean)(a))(b);
      };
    },
    $foreign.boolNot,
    true
  );

  // conj: Helper to access the 'conj' (conjunction/AND) operation.
  var conj = function (dict) {
    return dict.conj;
  };

  // Export all relevant components.
  exports["HeytingAlgebra"] = HeytingAlgebra;
  exports["tt"] = tt;
  exports["ff"] = ff;
  exports["implies"] = implies;
  exports["conj"] = conj;
  exports["disj"] = disj;
  exports["not"] = not;
  exports["heytingAlgebraBoolean"] = heytingAlgebraBoolean;
})(PS["Data.HeytingAlgebra"] = PS["Data.HeytingAlgebra"] || {});

/*
 * Module: Data.Semigroup
 * Defines the Semigroup type class.
 */
(function (exports) {
  "use strict";

  // Import foreign module (not used here directly).
  var $foreign = PS["Data.Semigroup"];

  // Other imports.
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Data_Void = PS["Data.Void"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_RowList = PS["Type.Data.RowList"];

  // Semigroup constructor.
  // A Semigroup instance must provide an `append` method.
  var Semigroup = function (append) {
    this.append = append;
  };

  // append: Helper to access the 'append' method.
  var append = function (dict) {
    return dict.append;
  };

  // Export the Semigroup constructor and 'append' function.
  exports["Semigroup"] = Semigroup;
  exports["append"] = append;
})(PS["Data.Semigroup"] = PS["Data.Semigroup"] || {});

/*
 * Module: Data.Monoid
 * Defines the Monoid type class.
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_RowList = PS["Type.Data.RowList"];

  // Monoid constructor.
  // A Monoid instance must provide a `Semigroup0` (a Semigroup instance) and a `mempty` (identity) method.
  var Monoid = function (Semigroup0, mempty) {
    this.Semigroup0 = Semigroup0;
    this.mempty = mempty;
  };

  // mempty: Helper to access the 'mempty' method.
  var mempty = function (dict) {
    return dict.mempty;
  };

  // Export the Monoid constructor and 'mempty' function.
  exports["Monoid"] = Monoid;
  exports["mempty"] = mempty;
})(PS["Data.Monoid"] = PS["Data.Monoid"] || {});

/*
 * Module: Data.Maybe
 * Defines the Maybe type (Just/Nothing) and related functions.
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Extend = PS["Control.Extend"];
  var Control_Monad = PS["Control.Monad"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Control_Plus = PS["Control.Plus"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Functor_Invariant = PS["Data.Functor.Invariant"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];

  // Nothing: Represents the absence of a value.
  var Nothing = (function () {
    function Nothing() {}
    Nothing.value = new Nothing();
    return Nothing;
  })();

  // Just: Represents the presence of a value.
  var Just = (function () {
    function Just(value0) {
      this.value0 = value0;
    }
    Just.create = function (value0) {
      return new Just(value0);
    };
    return Just;
  })();

  // maybe: A pattern matching function for Maybe.
  // Takes a default value, a function to apply if Just, and a Maybe value.
  var maybe = function (v) {
    return function (v1) {
      return function (v2) {
        if (v2 instanceof Nothing) {
          return v; // If Nothing, return the default value.
        }
        if (v2 instanceof Just) {
          return v1(v2.value0); // If Just, apply the function to its value.
        }
        // Fallback for exhaustive pattern matching (should not be reached).
        throw new Error(
          "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " +
            [v.constructor.name, v1.constructor.name, v2.constructor.name]
        );
      };
    };
  };

  // Export Nothing, Just, and maybe.
  exports["Nothing"] = Nothing;
  exports["Just"] = Just;
  exports["maybe"] = maybe;
})(PS["Data.Maybe"] = PS["Data.Maybe"] || {});

/*
 * Module: Data.Semiring (Foreign Implementation)
 * Provides basic integer arithmetic operations.
 */
(function (exports) {
  "use strict";

  // intAdd: Integer addition. Uses bitwise OR 0 to ensure integer result.
  exports.intAdd = function (x) {
    return function (y) {
      return (x + y) | 0;
    };
  };

  // intMul: Integer multiplication. Uses bitwise OR 0 to ensure integer result.
  exports.intMul = function (x) {
    return function (y) {
      return (x * y) | 0;
    };
  };
})(PS["Data.Semiring"] = PS["Data.Semiring"] || {});

/*
 * Module: Data.Semiring
 * Defines the Semiring type class and instance for integers.
 */
(function (exports) {
  "use strict";

  // Import foreign module for integer arithmetic.
  var $foreign = PS["Data.Semiring"];

  // Other imports.
  var Data_Symbol = PS["Data.Symbol"];
  var Data_Unit = PS["Data.Unit"];
  var Record_Unsafe = PS["Record.Unsafe"];
  var Type_Data_Row = PS["Type.Data.Row"];
  var Type_Data_RowList = PS["Type.Data.RowList"];

  // Semiring constructor.
  // A Semiring instance must provide add, mul, one, and zero methods.
  var Semiring = function (add, mul, one, zero) {
    this.add = add;
    this.mul = mul;
    this.one = one;
    this.zero = zero;
  };

  // zero: Helper to access the 'zero' (additive identity) value.
  var zero = function (dict) {
    return dict.zero;
  };

  // semiringInt: An instance of Semiring for integers.
  var semiringInt = new Semiring($foreign.intAdd, $foreign.intMul, 1, 0);

  // one: Helper to access the 'one' (multiplicative identity) value.
  var one = function (dict) {
    return dict.one;
  };

  // mul: Helper to access the 'mul' (multiplication) operation.
  var mul = function (dict) {
    return dict.mul;
  };

  // add: Helper to access the 'add' (addition) operation.
  var add = function (dict) {
    return dict.add;
  };

  // Export all relevant components.
  exports["Semiring"] = Semiring;
  exports["add"] = add;
  exports["zero"] = zero;
  exports["mul"] = mul;
  exports["one"] = one;
  exports["semiringInt"] = semiringInt;
})(PS["Data.Semiring"] = PS["Data.Semiring"] || {});

/*
 * Module: Data.Monoid.Conj
 * Defines a Monoid for conjunction (logical AND).
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad = PS["Control.Monad"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];

  // Conj: A newtype wrapper for values that form a Monoid under conjunction.
  var Conj = function (x) {
    return x;
  };

  // semigroupConj: An instance of Semigroup for Conj.
  // It uses the `conj` operation from a HeytingAlgebra instance.
  var semigroupConj = function (dictHeytingAlgebra) {
    return new Data_Semigroup.Semigroup(function (v) {
      return function (v1) {
        return Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v)(v1);
      };
    });
  };

  // monoidConj: An instance of Monoid for Conj.
  // Its `mempty` (identity) is the `tt` (true) value from a HeytingAlgebra instance.
  var monoidConj = function (dictHeytingAlgebra) {
    return new Data_Monoid.Monoid(function () {
      return semigroupConj(dictHeytingAlgebra);
    }, Data_HeytingAlgebra.tt(dictHeytingAlgebra));
  };

  // Export Conj constructor, and its Semigroup and Monoid instances.
  exports["Conj"] = Conj;
  exports["semigroupConj"] = semigroupConj;
  exports["monoidConj"] = monoidConj;
})(PS["Data.Monoid.Conj"] = PS["Data.Monoid.Conj"] || {});

/*
 * Module: Data.Newtype
 * Defines the Newtype type class and utility functions for newtypes.
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Monoid_Additive = PS["Data.Monoid.Additive"];
  var Data_Monoid_Conj = PS["Data.Monoid.Conj"];
  var Data_Monoid_Disj = PS["Data.Monoid.Disj"];
  var Data_Monoid_Dual = PS["Data.Monoid.Dual"];
  var Data_Monoid_Endo = PS["Data.Monoid.Endo"];
  var Data_Monoid_Multiplicative = PS["Data.Monoid.Multiplicative"];
  var Data_Semigroup_First = PS["Data.Semigroup.First"];
  var Data_Semigroup_Last = PS["Data.Semigroup.Last"];
  var Prelude = PS["Prelude"];

  // Newtype constructor.
  // A Newtype instance provides `unwrap` and `wrap` functions.
  var Newtype = function (unwrap, wrap) {
    this.unwrap = unwrap;
    this.wrap = wrap;
  };

  // wrap: Helper to apply the 'wrap' function.
  var wrap = function (dict) {
    return dict.wrap;
  };

  // unwrap: Helper to apply the 'unwrap' function.
  var unwrap = function (dict) {
    return dict.unwrap;
  };

  // newtypeConj: An instance of Newtype for the Conj newtype.
  var newtypeConj = new Newtype(
    function (v) {
      return v;
    },
    Data_Monoid_Conj.Conj
  );

  // alaF: A higher-order function for working with newtypes and functors.
  // It allows applying a function 'f' that operates on the unwrapped type within a functor
  // and then wrapping the result back into the newtype.
  var alaF = function (dictFunctor) {
    return function (dictFunctor1) {
      return function (dictNewtype) {
        return function (dictNewtype1) {
          return function (v) {
            return function (f) {
              return function ($80) {
                return Data_Functor.map(dictFunctor1)(unwrap(dictNewtype1))(
                  f(Data_Functor.map(dictFunctor)(wrap(dictNewtype))($80))
                );
              };
            };
          };
        };
      };
    };
  };

  // Export all relevant components.
  exports["unwrap"] = unwrap;
  exports["wrap"] = wrap;
  exports["Newtype"] = Newtype;
  exports["alaF"] = alaF;
  exports["newtypeConj"] = newtypeConj;
})(PS["Data.Newtype"] = PS["Data.Newtype"] || {});

/*
 * Module: Data.Foldable
 * Defines the Foldable type class and instances.
 */
(function (exports) {
  "use strict";

  // Import foreign module for array folding.
  var $foreign = PS["Data.Foldable"];

  // Import dependencies.
  var Control_Alt = PS["Control.Alt"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Plus = PS["Control.Plus"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Maybe_First = PS["Data.Maybe.First"];
  var Data_Maybe_Last = PS["Data.Maybe.Last"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Monoid_Additive = PS["Data.Monoid.Additive"];
  var Data_Monoid_Conj = PS["Data.Monoid.Conj"];
  var Data_Monoid_Disj = PS["Data.Monoid.Disj"];
  var Data_Monoid_Dual = PS["Data.Monoid.Dual"];
  var Data_Monoid_Endo = PS["Data.Monoid.Endo"];
  var Data_Monoid_Multiplicative = PS["Data.Monoid.Multiplicative"];
  var Data_Newtype = PS["Data.Newtype"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];

  // Foldable constructor.
  // A Foldable instance must provide foldMap, foldl, and foldr methods.
  var Foldable = function (foldMap, foldl, foldr) {
    this.foldMap = foldMap;
    this.foldl = foldl;
    this.foldr = foldr;
  };

  // foldr: Helper to access the 'foldr' method.
  var foldr = function (dict) {
    return dict.foldr;
  };

  // foldl: Helper to access the 'foldl' method.
  var foldl = function (dict) {
    return dict.foldl;
  };

  // sum: Computes the sum of all elements in a foldable structure.
  var sum = function (dictFoldable) {
    return function (dictSemiring) {
      return foldl(dictFoldable)(Data_Semiring.add(dictSemiring))(
        Data_Semiring.zero(dictSemiring)
      );
    };
  };

  // foldMapDefaultR: Default implementation for `foldMap` using `foldr`.
  var foldMapDefaultR = function (dictFoldable) {
    return function (dictMonoid) {
      return function (f) {
        return foldr(dictFoldable)(function (x) {
          return function (acc) {
            return Data_Semigroup.append(dictMonoid.Semigroup0())(f(x))(acc);
          };
        })(Data_Monoid.mempty(dictMonoid));
      };
    };
  };

  // foldableArray: An instance of Foldable for arrays.
  var foldableArray = new Foldable(
    function (dictMonoid) {
      return foldMapDefaultR(foldableArray)(dictMonoid);
    },
    $foreign.foldlArray,
    $foreign.foldrArray
  );

  // foldMap: Helper to access the 'foldMap' method.
  var foldMap = function (dict) {
    return dict.foldMap;
  };

  // all: Checks if all elements in a foldable satisfy a predicate.
  // Uses the Conj Monoid for efficient conjunction.
  var all = function (dictFoldable) {
    return function (dictHeytingAlgebra) {
      return Data_Newtype.alaF(Data_Functor.functorFn)(Data_Functor.functorFn)(
        Data_Newtype.newtypeConj
      )(Data_Newtype.newtypeConj)(Data_Monoid_Conj.Conj)(
        foldMap(dictFoldable)(Data_Monoid_Conj.monoidConj(dictHeytingAlgebra))
      );
    };
  };

  // Export all relevant components.
  exports["Foldable"] = Foldable;
  exports["foldr"] = foldr;
  exports["foldl"] = foldl;
  exports["foldMap"] = foldMap;
  exports["foldMapDefaultR"] = foldMapDefaultR;
  exports["all"] = all;
  exports["sum"] = sum;
  exports["foldableArray"] = foldableArray;
})(PS["Data.Foldable"] = PS["Data.Foldable"] || {});

/*
 * Module: Data.Either
 * Defines the Either type (Left/Right) and related functions.
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var Control_Alt = PS["Control.Alt"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Extend = PS["Control.Extend"];
  var Control_Monad = PS["Control.Monad"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Bifoldable = PS["Data.Bifoldable"];
  var Data_Bifunctor = PS["Data.Bifunctor"];
  var Data_Bitraversable = PS["Data.Bitraversable"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_FoldableWithIndex = PS["Data.FoldableWithIndex"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Functor_Invariant = PS["Data.Functor.Invariant"];
  var Data_FunctorWithIndex = PS["Data.FunctorWithIndex"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Show = PS["Data.Show"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_TraversableWithIndex = PS["Data.TraversableWithIndex"];
  var Data_Unit = PS["Data.Unit"];
  var Prelude = PS["Prelude"];

  // Left: Represents a value on the "left" side, typically an error.
  var Left = (function () {
    function Left(value0) {
      this.value0 = value0;
    }
    Left.create = function (value0) {
      return new Left(value0);
    };
    return Left;
  })();

  // Right: Represents a value on the "right" side, typically a successful result.
  var Right = (function () {
    function Right(value0) {
      this.value0 = value0;
    }
    Right.create = function (value0) {
      return new Right(value0);
    };
    return Right;
  })();

  // note: Converts a Maybe value to an Either value.
  // If Nothing, returns Left with the provided default error value 'a'.
  // If Just, returns Right with the value from Just.
  var note = function (a) {
    return Data_Maybe.maybe(new Left(a))(Right.create);
  };

  // functorEither: An instance of Functor for Either.
  // Only maps over the Right value.
  var functorEither = new Data_Functor.Functor(function (f) {
    return function (m) {
      if (m instanceof Left) {
        return new Left(m.value0); // If Left, return Left unchanged.
      }
      if (m instanceof Right) {
        return new Right(f(m.value0)); // If Right, apply 'f' to its value.
      }
      // Fallback for exhaustive pattern matching.
      throw new Error(
        "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " +
          [m.constructor.name]
      );
    };
  });

  // fromRight: Extracts the value from a Right, or throws an error if Left.
  // Requires a Partial dictionary (for potentially unsafe operations).
  var fromRight = function (dictPartial) {
    return function (v) {
      if (v instanceof Right) {
        return v.value0;
      }
      // Throws an error if the value is Left.
      throw new Error(
        "Failed pattern match at Data.Either (line 261, column 1 - line 261, column 52): " +
          [v.constructor.name]
      );
    };
  };

  // either: A pattern matching function for Either.
  // Takes two functions: one for Left, one for Right, and an Either value.
  var either = function (v) {
    return function (v1) {
      return function (v2) {
        if (v2 instanceof Left) {
          return v(v2.value0); // If Left, apply the first function to its value.
        }
        if (v2 instanceof Right) {
          return v1(v2.value0); // If Right, apply the second function to its value.
        }
        // Fallback for exhaustive pattern matching.
        throw new Error(
          "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " +
            [v.constructor.name, v1.constructor.name, v2.constructor.name]
        );
      };
    };
  };

  // applyEither: An instance of Apply for Either.
  // Applies a function wrapped in an Either to a value wrapped in an Either.
  var applyEither = new Control_Apply.Apply(function () {
    return functorEither;
  }, function (v) {
    return function (v1) {
      if (v instanceof Left) {
        return new Left(v.value0); // If the function is Left, propagate the error.
      }
      if (v instanceof Right) {
        return Data_Functor.map(functorEither)(v.value0)(v1); // If Right, map the function over the value.
      }
      // Fallback for exhaustive pattern matching.
      throw new Error(
        "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " +
          [v.constructor.name, v1.constructor.name]
      );
    };
  });

  // bindEither: An instance of Bind for Either.
  // Chains computations that might fail.
  var bindEither = new Control_Bind.Bind(function () {
    return applyEither;
  }, either(function (e) {
    return function (v) {
      return new Left(e); // If Left, propagate the error.
    };
  })(function (a) {
    return function (f) {
      return f(a); // If Right, apply the function to the value.
    };
  }));

  // applicativeEither: An instance of Applicative for Either.
  // `pure` wraps a value in a Right.
  var applicativeEither = new Control_Applicative.Applicative(function () {
    return applyEither;
  }, Right.create);

  // Export all relevant components.
  exports["Left"] = Left;
  exports["Right"] = Right;
  exports["either"] = either;
  exports["fromRight"] = fromRight;
  exports["note"] = note;
  exports["functorEither"] = functorEither;
  exports["applyEither"] = applyEither;
  exports["applicativeEither"] = applicativeEither;
  exports["bindEither"] = bindEither;
})(PS["Data.Either"] = PS["Data.Either"] || {});

/*
 * Module: Control.Monad.Rec.Class
 * Defines the `tailRec` function for stack-safe recursion.
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad = PS["Control.Monad"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Bifunctor = PS["Data.Bifunctor"];
  var Data_Either = PS["Data.Either"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Identity = PS["Data.Identity"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Unit = PS["Data.Unit"];
  var Effect = PS["Effect"];
  var Effect_Ref = PS["Effect.Ref"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];

  // Loop: Represents a recursive step, containing the next state.
  var Loop = (function () {
    function Loop(value0) {
      this.value0 = value0;
    }
    Loop.create = function (value0) {
      return new Loop(value0);
    };
    return Loop;
  })();

  // Done: Represents the termination of recursion, containing the final result.
  var Done = (function () {
    function Done(value0) {
      this.value0 = value0;
    }
    Done.create = function (value0) {
      return new Done(value0);
    };
    return Done;
  })();

  // tailRec: Implements trampolining for stack-safe tail recursion.
  // 'f' is a function that returns either a Loop (continue) or Done (stop).
  var tailRec = function (f) {
    var go = function ($copy_v) {
      var $tco_done = false; // Flag to indicate termination.
      var $tco_result; // Stores the final result.

      // Inner loop for trampolining.
      function $tco_loop(v) {
        if (v instanceof Loop) {
          $copy_v = f(v.value0); // If Loop, update 'v' with the next state and continue.
          return; // The 'return' here causes the outer while loop to continue.
        }
        if (v instanceof Done) {
          $tco_done = true; // If Done, set flag to true.
          return v.value0; // Return the final value.
        }
        // Fallback for exhaustive pattern matching.
        throw new Error(
          "Failed pattern match at Control.Monad.Rec.Class (line 91, column 3 - line 91, column 25): " +
            [v.constructor.name]
        );
      }
      while (!$tco_done) {
        // Keep looping until $tco_done is true.
        $tco_result = $tco_loop($copy_v);
      }
      return $tco_result;
    };
    return function ($53) {
      return go(f($53)); // Initial call to 'go' with the first state.
    };
  };

  // Export Loop, Done, and tailRec.
  exports["Loop"] = Loop;
  exports["Done"] = Done;
  exports["tailRec"] = tailRec;
})(PS["Control.Monad.Rec.Class"] = PS["Control.Monad.Rec.Class"] || {});

/*
 * Module: Data.Array (Foreign Implementation)
 * Provides basic array utility functions.
 */
(function (exports) {
  "use strict";

  // length: Returns the length of an array.
  exports.length = function (xs) {
    return xs.length;
  };

  // indexImpl: Safely accesses an element at a given index.
  // Returns 'just(element)' if found, 'nothing' otherwise.
  exports.indexImpl = function (just) {
    return function (nothing) {
      return function (xs) {
        return function (i) {
          // Check for out-of-bounds access.
          return i < 0 || i >= xs.length ? nothing : just(xs[i]);
        };
      };
    };
  };

  // slice: Extracts a section of an array.
  exports.slice = function (s) {
    return function (e) {
      return function (l) {
        return l.slice(s, e); // Standard JavaScript slice.
      };
    };
  };

  // drop: Removes the first 'n' elements from an array.
  exports.drop = function (n) {
    return function (l) {
      return n < 1 ? l : l.slice(n); // If n < 1, return original array; otherwise, slice from n.
    };
  };

  // zipWith: Combines two arrays element-wise using a given function.
  // The length of the result array is the minimum of the two input arrays.
  exports.zipWith = function (f) {
    return function (xs) {
      return function (ys) {
        // Determine the length of the shorter array.
        var l = xs.length < ys.length ? xs.length : ys.length;
        var result = new Array(l); // Initialize result array.

        // Iterate up to the minimum length.
        for (var i = 0; i < l; i++) {
          result[i] = f(xs[i])(ys[i]); // Apply 'f' to corresponding elements.
        }
        return result;
      };
    };
  };
})(PS["Data.Array"] = PS["Data.Array"] || {});

/*
 * Module: Unsafe.Coerce (Foreign Implementation)
 * Provides an unsafe identity function for type coercion.
 */
(function (exports) {
  "use strict";

  // unsafeCoerce: Returns its input directly, effectively casting its type.
  // This is inherently unsafe and should be used with extreme caution.
  exports.unsafeCoerce = function (x) {
    return x;
  };
})(PS["Unsafe.Coerce"] = PS["Unsafe.Coerce"] || {});

/*
 * Module: Unsafe.Coerce (Exports)
 * Exports the `unsafeCoerce` function from the foreign module.
 */
(function (exports) {
  "use strict";

  // Import foreign module.
  var $foreign = PS["Unsafe.Coerce"];

  // Export unsafeCoerce.
  exports["unsafeCoerce"] = $foreign.unsafeCoerce;
})(PS["Unsafe.Coerce"] = PS["Unsafe.Coerce"] || {});

/*
 * Module: Data.Array
 * Provides higher-level array functions using foreign implementations.
 */
(function (exports) {
  "use strict";

  // Import foreign module for array primitives.
  var $foreign = PS["Data.Array"];

  // Import dependencies.
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Category = PS["Control.Category"];
  var Control_Lazy = PS["Control.Lazy"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Control_Monad_ST = PS["Control.Monad.ST"];
  var Control_Monad_ST_Internal = PS["Control.Monad.ST.Internal"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array_NonEmpty_Internal = PS["Data.Array.NonEmpty.Internal"];
  var Data_Array_ST = PS["Data.Array.ST"];
  var Data_Array_ST_Iterator = PS["Data.Array.ST.Iterator"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Function = PS["Data.Function"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];

  // singleton: Creates an array with a single element.
  var singleton = function (a) {
    return [a];
  };

  // index: Safely gets an element by index, returning a Maybe.
  // Uses the foreign `indexImpl` with Data.Maybe constructors.
  var index = $foreign.indexImpl(Data_Maybe.Just.create)(
    Data_Maybe.Nothing.value
  );

  // head: Gets the first element of an array, returning a Maybe.
  var head = function (xs) {
    return index(xs)(0);
  };

  // concatMap: Equivalent to `flatMap`, applies a function that returns an array
  // and flattens the results.
  var concatMap = Data_Function.flip(Control_Bind.bind(Control_Bind.bindArray));

  // mapMaybe: Maps a function over an array, discarding Nothing results.
  var mapMaybe = function (f) {
    return concatMap(function ($114) {
      return Data_Maybe.maybe([])(singleton)(f($114));
    });
  };

  // Export the new functions and re-export foreign functions.
  exports["singleton"] = singleton;
  exports["head"] = head;
  exports["index"] = index;
  exports["concatMap"] = concatMap;
  exports["mapMaybe"] = mapMaybe;
  exports["length"] = $foreign.length;
  exports["drop"] = $foreign.drop;
  exports["zipWith"] = $foreign.zipWith;
})(PS["Data.Array"] = PS["Data.Array"] || {});

/*
 * Module: Data.Int (Foreign Implementation)
 * Provides a function to parse integers from strings.
 */
(function (exports) {
  "use strict";

  // fromStringAsImpl: Parses a string to an integer with a given radix.
  // Returns 'just(integer)' if successful, 'nothing' otherwise.
  exports.fromStringAsImpl = function (just) {
    return function (nothing) {
      return function (radix) {
        var digits;
        // Determine the regex pattern for valid digits based on radix.
        if (radix < 11) {
          digits = "[0-" + (radix - 1).toString() + "]";
        } else if (radix === 11) {
          digits = "[0-9a]";
        } else {
          // For radix > 11, include 'a' through 'z' up to the required character.
          digits = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
        }
        // Regex to check if the string matches the number format.
        var pattern = new RegExp("^[\\+\\-]?" + digits + "+$", "i");
        return function (s) {
          // Test if the string matches the pattern.
          if (pattern.test(s)) {
            var i = parseInt(s, radix); // Parse the integer.
            // Check if the parsed value is a valid integer (not NaN and within integer range).
            return (i | 0) === i ? just(i) : nothing;
          } else {
            return nothing; // If pattern doesn't match, return nothing.
          }
        };
      };
    };
  };
})(PS["Data.Int"] = PS["Data.Int"] || {});

/*
 * Module: Data.Int
 * Provides integer parsing functions.
 */
(function (exports) {
  "use strict";

  // Import foreign module for string parsing.
  var $foreign = PS["Data.Int"];

  // Import dependencies.
  var Control_Category = PS["Control.Category"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_CommutativeRing = PS["Data.CommutativeRing"];
  var Data_DivisionRing = PS["Data.DivisionRing"];
  var Data_Eq = PS["Data.Eq"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Int_Bits = PS["Data.Int.Bits"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Global = PS["Global"];
  var $$Math = PS["Math"];
  var Prelude = PS["Prelude"];

  // fromStringAs: Parses a string to an integer with a specified radix, returning a Maybe.
  // Uses the foreign `fromStringAsImpl` with Data.Maybe constructors.
  var fromStringAs = $foreign.fromStringAsImpl(Data_Maybe.Just.create)(
    Data_Maybe.Nothing.value
  );

  // fromString: Parses a string to an integer in base 10, returning a Maybe.
  var fromString = fromStringAs(10);

  // Export the parsing functions.
  exports["fromString"] = fromString;
  exports["fromStringAs"] = fromStringAs;
})(PS["Data.Int"] = PS["Data.Int"] || {});

/*
 * Module: Data.String.Common (Foreign Implementation)
 * Provides common string utility functions.
 */
(function (exports) {
  "use strict";

  // split: Splits a string by a separator.
  exports.split = function (sep) {
    return function (s) {
      return s.split(sep); // Standard JavaScript string split.
    };
  };

  // trim: Removes whitespace from both ends of a string.
  exports.trim = function (s) {
    return s.trim(); // Standard JavaScript string trim.
  };
})(PS["Data.String.Common"] = PS["Data.String.Common"] || {});

/*
 * Module: Data.String.Common
 * Exports common string utility functions.
 */
(function (exports) {
  "use strict";

  // Import foreign module for string utilities.
  var $foreign = PS["Data.String.Common"];

  // Import dependencies.
  var Data_Eq = PS["Data.Eq"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_String_Pattern = PS["Data.String.Pattern"];
  var Prelude = PS["Prelude"];

  // Export foreign functions.
  exports["split"] = $foreign.split;
  exports["trim"] = $foreign.trim;
})(PS["Data.String.Common"] = PS["Data.String.Common"] || {});

/*
 * Module: AtCoder.ABC121.B
 * Contains the main logic for solving the AtCoder ABC121 B problem.
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Array = PS["Data.Array"];
  var Data_Either = PS["Data.Either"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Functor = PS["Data.Functor"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Int = PS["Data.Int"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Show = PS["Data.Show"];
  var Data_String = PS["Data.String"];
  var Data_String_Common = PS["Data.String.Common"];
  var Data_String_Pattern = PS["Data.String.Pattern"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Unit = PS["Data.Unit"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Prelude = PS["Prelude"];

  // solve'': The core recursive function to count correct answers.
  // `c`: The constant offset.
  // `bs`: Array of coefficients.
  // `ass`: Array of arrays of input values.
  var solve$prime$prime = function (c) {
    return function (bs) {
      return function (ass) {
        // `go` is the recursive step function for `tailRec`.
        var go = function (v) {
          // Attempt to get the current 'a' array from 'ass'.
          var v1 = Data_Array.index(ass)(v.i);

          // Pattern match on the result of `index`.
          if (v1 instanceof Data_Maybe.Nothing) {
            // If `Nothing`, we've processed all 'a' arrays.
            return new Control_Monad_Rec_Class.Done(v.n); // Return the final count.
          }
          if (v1 instanceof Data_Maybe.Just) {
            // If `Just`, we have an 'a' array.
            // Calculate the sum: (a_i * b_i) for all i, plus the constant c.
            // Check if this sum is greater than 0.
            var $16 =
              (Data_Foldable.sum(Data_Foldable.foldableArray)(
                Data_Semiring.semiringInt
              )(Data_Array.zipWith(Data_Semiring.mul(Data_Semiring.semiringInt))(v1.value0)(bs)) +
                c) |
                0 >
              0;

            if ($16) {
              // If sum > 0, increment the count 'n'.
              return new Control_Monad_Rec_Class.Loop({
                i: v.i + 1 | 0,
                n: v.n + 1 | 0,
              });
            }
            // If sum <= 0, don't increment 'n'.
            return new Control_Monad_Rec_Class.Loop({
              i: v.i + 1 | 0,
              n: v.n,
            });
          }
          // Exhaustive pattern matching fallback.
          throw new Error(
            "Failed pattern match at AtCoder.ABC121.B (line 55, column 7 - line 60, column 46): " +
              [v1.constructor.name]
          );
        };

        // Start the tail recursion with initial state {i: 0, n: 0}.
        return Control_Monad_Rec_Class.tailRec(go)({
          i: 0,
          n: 0,
        });
      };
    };
  };

  // solve': Parses the input string and orchestrates the calculation.
  var solve$prime = function (input) {
    // Split the input into lines and trim whitespace.
    var lines = Data_String_Common.split("\n")(Data_String_Common.trim(input));

    // Monadic bind sequence using Data.Either for error handling.
    return Control_Bind.bind(Data_Either.bindEither)(
      // Get the first line (n m c) and handle potential absence.
      Control_Bind.bind(Data_Either.bindEither)(
        Data_Either.note("nmc")(Data_Array.head(lines))
      )(function (v) {
        // Get the second line (bs) and handle potential absence.
        return Control_Bind.bind(Data_Either.bindEither)(
          Data_Either.note("bss")(Data_Array.head(Data_Array.drop(1)(lines)))
        )(function (v1) {
          // Get the remaining lines (ass).
          return Control_Bind.bind(Data_Either.bindEither)(
            Control_Applicative.pure(Data_Either.applicativeEither)(
              Data_Array.drop(2)(lines)
            )
          )(function (v2) {
            // Return an object containing all parsed lines.
            return Control_Applicative.pure(Data_Either.applicativeEither)({
              asss: v2,
              bss: v1,
              nmc: v,
            });
          });
        });
      })
    )(function (v) {
      // Parse n, m, c from the first line.
      return Control_Bind.bind(Data_Either.bindEither)(
        (function () {
          var v1 = Data_String_Common.split(" ")(v.nmc);
          if (v1.length === 3) {
            return Control_Bind.bind(Data_Either.bindEither)(
              Data_Either.note("n")(Data_Int.fromString(v1[0]))
            )(function (v2) {
              return Control_Bind.bind(Data_Either.bindEither)(
                Data_Either.note("m")(Data_Int.fromString(v1[1]))
              )(function (v3) {
                return Control_Bind.bind(Data_Either.bindEither)(
                  Data_Either.note("c")(Data_Int.fromString(v1[2]))
                )(function (v4) {
                  return Control_Applicative.pure(
                    Data_Either.applicativeEither
                  )({
                    c: v4,
                    m: v3,
                    n: v2,
                  });
                });
              });
            });
          }
          return new Data_Either.Left("n m c");
        })()
      )(function (v1) {
        // Parse the 'b' coefficients array.
        return Control_Bind.bind(Data_Either.bindEither)(
          Control_Applicative.pure(Data_Either.applicativeEither)(
            Data_Array.mapMaybe(Data_Int.fromString)(
              Data_String_Common.split(" ")(v.bss)
            )
          )
        )(function (v2) {
          // Validate length of 'bs'.
          return Control_Bind.discard(Control_Bind.discardUnit)(
            Data_Either.bindEither
          )(
            (function () {
              var $33 = Data_Array.length(v2) !== v1.m;
              if ($33) {
                return new Data_Either.Left("bs length");
              }
              return Control_Applicative.pure(Data_Either.applicativeEither)(
                Data_Unit.unit
              );
            })()
          )(function () {
            // Parse the 'a' arrays.
            return Control_Bind.bind(Data_Either.bindEither)(
              Control_Applicative.pure(Data_Either.applicativeEither)(
                Data_Functor.map(Data_Functor.functorArray)(function (i) {
                  return Data_Array.mapMaybe(Data_Int.fromString)(
                    Data_String_Common.split(" ")(i)
                  );
                })(v.asss)
              )
            )(function (v3) {
              // Validate number of 'a' arrays.
              return Control_Bind.discard(Control_Bind.discardUnit)(
                Data_Either.bindEither
              )(
                (function () {
                  var $35 = Data_Array.length(v3) === v1.n;
                  if ($35) {
                    return Control_Applicative.pure(
                      Data_Either.applicativeEither
                    )(Data_Unit.unit);
                  }
                  return new Data_Either.Left("ass length");
                })()
              )(function () {
                // Validate length of each 'a' array.
                return Control_Bind.discard(Control_Bind.discardUnit)(
                  Data_Either.bindEither
                )(
                  (function () {
                    var $36 = Data_Foldable.all(Data_Foldable.foldableArray)(
                      Data_HeytingAlgebra.heytingAlgebraBoolean
                    )(function ($43) {
                      return v1.m === Data_Array.length($43);
                    })(v3);
                    if ($36) {
                      return Control_Applicative.pure(
                        Data_Either.applicativeEither
                      )(Data_Unit.unit);
                    }
                    return new Data_Either.Left("as length");
                  })()
                )(function () {
                  // Finally, compute the result using solve'' and show it.
                  return Control_Applicative.pure(
                    Data_Either.applicativeEither
                  )(
                    Data_Show.show(Data_Show.showInt)(
                      solve$prime$prime(v1.c)(v2)(v3)
                    )
                  );
                });
              });
            });
          });
        });
      });
    });
  };

  // solve: The public API for the solution.
  // It takes the raw input string and returns the result,
  // throwing an error if parsing or validation fails.
  var solve = function (input) {
    return Data_Either.fromRight()(solve$prime(input));
  };

  // Export the solve function.
  exports["solve"] = solve;
})(PS["AtCoder.ABC121.B"] = PS["AtCoder.ABC121.B"] || {});

/*
 * Module: Effect.Console (Foreign Implementation)
 * Provides a foreign function for logging to the console.
 */
(function (exports) {
  "use strict";

  // log: Logs a string to the console.
  exports.log = function (s) {
    return function () {
      console.log(s); // Standard JavaScript console.log.
      return {}; // Returns an empty object (representing Unit in PureScript Effect).
    };
  };
})(PS["Effect.Console"] = PS["Effect.Console"] || {});

/*
 * Module: Effect.Console
 * Exports console logging functionality.
 */
(function (exports) {
  "use strict";

  // Import foreign module.
  var $foreign = PS["Effect.Console"];

  // Import dependencies.
  var Data_Show = PS["Data.Show"];
  var Data_Unit = PS["Data.Unit"];
  var Effect = PS["Effect"];

  // Export the log function.
  exports["log"] = $foreign.log;
})(PS["Effect.Console"] = PS["Effect.Console"] || {});

/*
 * Module: Node.Encoding
 * Defines various text encodings used in Node.js.
 */
(function (exports) {
  "use strict";

  // Import foreign module (not used here directly).
  var $foreign = PS["Node.Encoding"];

  // Import dependencies.
  var Data_Show = PS["Data.Show"];
  var Prelude = PS["Prelude"];

  // Define encoding constructors.
  var ASCII = (function () {
    function ASCII() {}
    ASCII.value = new ASCII();
    return ASCII;
  })();
  var UTF8 = (function () {
    function UTF8() {}
    UTF8.value = new UTF8();
    return UTF8;
  })();
  var UTF16LE = (function () {
    function UTF16LE() {}
    UTF16LE.value = new UTF16LE();
    return UTF16LE;
  })();
  var UCS2 = (function () {
    function UCS2() {}
    UCS2.value = new UCS2();
    return UCS2;
  })();
  var Base64 = (function () {
    function Base64() {}
    Base64.value = new Base64();
    return Base64;
  })();
  var Latin1 = (function () {
    function Latin1() {}
    Latin1.value = new Latin1();
    return Latin1;
  })();
  var Binary = (function () {
    function Binary() {}
    Binary.value = new Binary();
    return Binary;
  })();
  var Hex = (function () {
    function Hex() {}
    Hex.value = new Hex();
    return Hex;
  })();

  // showEncoding: An instance of Show for the Encoding type.
  var showEncoding = new Data_Show.Show(function (v) {
    if (v instanceof ASCII) {
      return "ASCII";
    }
    if (v instanceof UTF8) {
      return "UTF8";
    }
    if (v instanceof UTF16LE) {
      return "UTF16LE";
    }
    if (v instanceof UCS2) {
      return "UCS2";
    }
    if (v instanceof Base64) {
      return "Base64";
    }
    if (v instanceof Latin1) {
      return "Latin1";
    }
    if (v instanceof Binary) {
      return "Binary";
    }
    if (v instanceof Hex) {
      return "Hex";
    }
    // Exhaustive pattern matching fallback.
    throw new Error(
      "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " +
        [v.constructor.name]
    );
  });

  // Export all encoding constructors and the show instance.
  exports["ASCII"] = ASCII;
  exports["UTF8"] = UTF8;
  exports["UTF16LE"] = UTF16LE;
  exports["UCS2"] = UCS2;
  exports["Base64"] = Base64;
  exports["Latin1"] = Latin1;
  exports["Binary"] = Binary;
  exports["Hex"] = Hex;
  exports["showEncoding"] = showEncoding;
})(PS["Node.Encoding"] = PS["Node.Encoding"] || {});

/*
 * Module: Node.FS.Internal (Foreign Implementation)
 * Provides unsafe access to Node.js 'fs' module.
 */
(function (exports) {
  "use strict";

  // unsafeRequireFS: Directly imports the Node.js 'fs' module.
  // This is marked as unsafe because it bypasses PureScript's effect system.
  exports.unsafeRequireFS = require("fs");
})(PS["Node.FS.Internal"] = PS["Node.FS.Internal"] || {});

/*
 * Module: Node.FS.Internal
 * Exports internal Node.js FS utilities.
 */
(function (exports) {
  "use strict";

  // Import foreign module.
  var $foreign = PS["Node.FS.Internal"];

  // Import dependencies.
  var Effect = PS["Effect"];
  var Prelude = PS["Prelude"];
  var Unsafe_Coerce = PS["Unsafe.Coerce"];

  // mkEffect: A utility to turn a JavaScript function returning any value
  // into a PureScript Effect. This uses unsafeCoerce.
  var mkEffect = Unsafe_Coerce.unsafeCoerce;

  // Export mkEffect and the foreign unsafeRequireFS.
  exports["mkEffect"] = mkEffect;
  exports["unsafeRequireFS"] = $foreign.unsafeRequireFS;
})(PS["Node.FS.Internal"] = PS["Node.FS.Internal"] || {});

/*
 * Module: Node.FS.Sync
 * Provides synchronous file system operations for Node.js.
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var Control_Bind = PS["Control.Bind"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_DateTime = PS["Data.DateTime"];
  var Data_DateTime_Instant = PS["Data.DateTime.Instant"];
  var Data_EuclideanRing = PS["Data.EuclideanRing"];
  var Data_Function = PS["Data.Function"];
  var Data_Function_Uncurried = PS["Data.Function.Uncurried"];
  var Data_Functor = PS["Data.Functor"];
  var Data_Int = PS["Data.Int"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Nullable = PS["Data.Nullable"];
  var Data_Show = PS["Data.Show"];
  var Data_Time_Duration = PS["Data.Time.Duration"];
  var Effect = PS["Effect"];
  var Node_Buffer = PS["Node.Buffer"];
  var Node_Encoding = PS["Node.Encoding"];
  var Node_FS = PS["Node.FS"];
  var Node_FS_Internal = PS["Node.FS.Internal"];
  var Node_FS_Perms = PS["Node.FS.Perms"];
  var Node_FS_Stats = PS["Node.FS.Stats"];
  var Node_Path = PS["Node.Path"];
  var Prelude = PS["Prelude"];

  // Get the Node.js 'fs' module.
  var fs = Node_FS_Internal.unsafeRequireFS;

  // readTextFile: Synchronously reads the content of a text file.
  // Takes an encoding and a file path.
  var readTextFile = function (encoding) {
    return function (file) {
      return Node_FS_Internal.mkEffect(function (v) {
        // Use Node.js fs.readFileSync with options for encoding.
        return fs.readFileSync(file, {
          encoding: Data_Show.show(Node_Encoding.showEncoding)(encoding),
        });
      });
    };
  };

  // Export readTextFile.
  exports["readTextFile"] = readTextFile;
})(PS["Node.FS.Sync"] = PS["Node.FS.Sync"] || {});

/*
 * Module: Main
 * The entry point of the application.
 */
(function (exports) {
  "use strict";

  // Import dependencies.
  var AtCoder_ABC121_B = PS["AtCoder.ABC121.B"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Effect = PS["Effect"];
  var Effect_Console = PS["Effect.Console"];
  var Node_Encoding = PS["Node.Encoding"];
  var Node_FS_Sync = PS["Node.FS.Sync"];
  var Prelude = PS["Prelude"];

  // Alias for the main problem-solving function.
  var solve = AtCoder_ABC121_B.solve;

  // main: The primary effectful action of the program.
  var main = function __do() {
    // Read input from /dev/stdin using UTF8 encoding.
    var v = Node_FS_Sync.readTextFile(Node_Encoding.UTF8.value)("/dev/stdin")();

    // Call the solver with the read input.
    var v1 = solve(v);

    // Log the result to the console.
    return Effect_Console.log(v1)();
  };

  // Export the main function.
  exports["main"] = main;
})(PS["Main"] = PS["Main"] || {});

// Execute the main function when the script runs.
PS["Main"].main();