// This is an automatically generated JavaScript file.
// It contains a Type I clone of the original code.

// Original code was minified, so let's add some whitespace
// and comments to make it more readable and visually different.

// Global namespace object for PureScript modules.
var PS = {};

// Module: Control.Apply
( function ( exports ) {

    "use strict";

    // Function to apply an array of functions to an array of values.
    // This is essentially a cartesian product of function application.
    exports.arrayApply = function ( fs ) {
        return function ( xs ) {

            // Get the length of the functions array.
            var l = fs.length;

            // Get the length of the values array.
            var k = xs.length;

            // Initialize the result array with the appropriate size.
            var result = new Array( l * k );

            // Counter for the result array index.
            var n = 0;

            // Iterate over each function.
            for ( var i = 0; i < l; i++ ) {

                var f = fs[ i ]; // Current function.

                // Iterate over each value.
                for ( var j = 0; j < k; j++ ) {
                    // Apply the function to the value and store the result.
                    result[ n++ ] = f( xs[ j ] );
                }

            }

            return result;

        };
    };

    // Initialize or retrieve the 'Control.Apply' module.
} )( PS[ "Control.Apply" ] = PS[ "Control.Apply" ] || {} );

// Module: Control.Semigroupoid
( function ( exports ) {

    "use strict";

    // Semigroupoid constructor.
    // A Semigroupoid is a type class for types that support composition.
    var Semigroupoid = function ( compose ) {
        this.compose = compose;
    };

    // Semigroupoid instance for functions.
    // Function composition: (f . g)(x) = f(g(x))
    var semigroupoidFn = new Semigroupoid( function ( f ) {
        return function ( g ) {
            return function ( x ) {
                return f( g( x ) );
            };
        };
    } );

    // Helper function to get the 'compose' method from a dictionary.
    var compose = function ( dict ) {
        return dict.compose;
    };

    // Export the 'compose' function.
    exports[ "compose" ] = compose;

    // Export the 'Semigroupoid' constructor.
    exports[ "Semigroupoid" ] = Semigroupoid;

    // Export the 'semigroupoidFn' instance.
    exports[ "semigroupoidFn" ] = semigroupoidFn;

} )( PS[ "Control.Semigroupoid" ] = PS[ "Control.Semigroupoid" ] || {} );

// Module: Control.Category
( function ( exports ) {

    "use strict";

    // Import from 'Control.Semigroupoid'.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ];

    // Category constructor.
    // A Category extends Semigroupoid with an 'identity' element.
    var Category = function ( Semigroupoid0, identity ) {
        this.Semigroupoid0 = Semigroupoid0;
        this.identity = identity;
    };

    // Helper function to get the 'identity' method from a dictionary.
    var identity = function ( dict ) {
        return dict.identity;
    };

    // Category instance for functions.
    // Identity function: id x = x
    var categoryFn = new Category( function () {
        return Control_Semigroupoid.semigroupoidFn;
    }, function ( x ) {
        return x;
    } );

    // Export the 'Category' constructor.
    exports[ "Category" ] = Category;

    // Export the 'identity' function.
    exports[ "identity" ] = identity;

    // Export the 'categoryFn' instance.
    exports[ "categoryFn" ] = categoryFn;

} )( PS[ "Control.Category" ] = PS[ "Control.Category" ] || {} );

// Module: Data.Boolean
( function ( exports ) {

    "use strict";

    // A constant representing 'true', often used in pattern matching.
    var otherwise = true;

    // Export 'otherwise'.
    exports[ "otherwise" ] = otherwise;

} )( PS[ "Data.Boolean" ] = PS[ "Data.Boolean" ] || {} );

// Module: Data.Eq
( function ( exports ) {

    "use strict";

    // Reference equality check.
    exports.refEq = function ( r1 ) {
        return function ( r2 ) {
            return r1 === r2;
        };
    };

} )( PS[ "Data.Eq" ] = PS[ "Data.Eq" ] || {} );

// Module: Data.HeytingAlgebra
( function ( exports ) {

    "use strict";

    // Boolean conjunction (AND).
    exports.boolConj = function ( b1 ) {
        return function ( b2 ) {
            return b1 && b2;
        };
    };

    // Boolean disjunction (OR).
    exports.boolDisj = function ( b1 ) {
        return function ( b2 ) {
            return b1 || b2;
        };
    };

    // Boolean negation (NOT).
    exports.boolNot = function ( b ) {
        return !b;
    };

} )( PS[ "Data.HeytingAlgebra" ] = PS[ "Data.HeytingAlgebra" ] || {} );

// Module: Data.Unit
( function ( exports ) {

    "use strict";

    // The unit value, similar to 'void' or '()'.
    exports.unit = {};

} )( PS[ "Data.Unit" ] = PS[ "Data.Unit" ] || {} );

// Module: Data.Show
( function ( exports ) {

    "use strict";

    // Implementation for showing numbers.
    exports.showNumberImpl = function ( n ) {
        var str = n.toString();
        // Append ".0" if it's an integer, to distinguish from floats.
        return isNaN( str + ".0" ) ? str : str + ".0";
    };

} )( PS[ "Data.Show" ] = PS[ "Data.Show" ] || {} );

// Module: Data.Show (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Show" ];
    var Data_Symbol = PS[ "Data.Symbol" ]; // Not used in this snippet, but might be in other parts of the original file.
    var Record_Unsafe = PS[ "Record.Unsafe" ]; // Not used.
    var Type_Data_RowList = PS[ "Type.Data.RowList" ]; // Not used.

    // Show type class constructor.
    // Provides a 'show' function to convert a value to a string.
    var Show = function ( show ) {
        this.show = show;
    };

    // Show instance for numbers.
    var showNumber = new Show( $foreign.showNumberImpl );

    // Helper function to get the 'show' method from a dictionary.
    var show = function ( dict ) {
        return dict.show;
    };

    // Export the 'Show' constructor.
    exports[ "Show" ] = Show;

    // Export the 'show' function.
    exports[ "show" ] = show;

    // Export the 'showNumber' instance.
    exports[ "showNumber" ] = showNumber;

} )( PS[ "Data.Show" ] = PS[ "Data.Show" ] || {} );

// Module: Data.Unit (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Unit" ];
    var Data_Show = PS[ "Data.Show" ]; // Not used directly here, but part of the original module structure.

    // Export the 'unit' value from foreign.
    exports[ "unit" ] = $foreign.unit;

} )( PS[ "Data.Unit" ] = PS[ "Data.Unit" ] || {} );

// Module: Data.HeytingAlgebra (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.HeytingAlgebra" ];
    var Data_Symbol = PS[ "Data.Symbol" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Record_Unsafe = PS[ "Record.Unsafe" ]; // Not used.
    var Type_Data_Row = PS[ "Type.Data.Row" ]; // Not used.
    var Type_Data_RowList = PS[ "Type.Data.RowList" ]; // Not used.

    // HeytingAlgebra type class constructor.
    // Provides operations for a Heyting algebra (a generalization of Boolean algebra).
    var HeytingAlgebra = function ( conj, disj, ff, implies, not, tt ) {
        this.conj = conj;
        this.disj = disj;
        this.ff = ff;
        this.implies = implies;
        this.not = not;
        this.tt = tt;
    };

    // Helper functions to get methods from the dictionary.
    var tt = function ( dict ) {
        return dict.tt;
    };
    var not = function ( dict ) {
        return dict.not;
    };
    var implies = function ( dict ) {
        return dict.implies;
    };
    var ff = function ( dict ) {
        return dict.ff;
    };
    var disj = function ( dict ) {
        return dict.disj;
    };

    // HeytingAlgebra instance for booleans.
    // Defines logical operations for boolean values.
    var heytingAlgebraBoolean = new HeytingAlgebra(
        $foreign.boolConj, // Conjunction (AND)
        $foreign.boolDisj, // Disjunction (OR)
        false, // False
        function ( a ) { // Implication
            return function ( b ) {
                return disj( heytingAlgebraBoolean )( not( heytingAlgebraBoolean )( a ) )( b );
            };
        },
        $foreign.boolNot, // Negation (NOT)
        true // True
    );

    var conj = function ( dict ) {
        return dict.conj;
    };

    // Export the 'HeytingAlgebra' constructor.
    exports[ "HeytingAlgebra" ] = HeytingAlgebra;

    // Export helper functions.
    exports[ "tt" ] = tt;
    exports[ "ff" ] = ff;
    exports[ "implies" ] = implies;
    exports[ "conj" ] = conj;
    exports[ "disj" ] = disj;
    exports[ "not" ] = not;

    // Export the boolean instance.
    exports[ "heytingAlgebraBoolean" ] = heytingAlgebraBoolean;

} )( PS[ "Data.HeytingAlgebra" ] = PS[ "Data.HeytingAlgebra" ] || {} );

// Module: Data.Eq (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Eq" ];
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_Symbol = PS[ "Data.Symbol" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Data_Void = PS[ "Data.Void" ]; // Not used.
    var Record_Unsafe = PS[ "Record.Unsafe" ]; // Not used.
    var Type_Data_RowList = PS[ "Type.Data.RowList" ]; // Not used.

    // Eq type class constructor.
    // Provides an 'eq' function for equality comparison.
    var Eq = function ( eq ) {
        this.eq = eq;
    };

    // Eq1 type class constructor.
    // Provides an 'eq1' function for equality comparison of polymorphic types.
    var Eq1 = function ( eq1 ) {
        this.eq1 = eq1;
    };

    // Eq instance for integers.
    var eqInt = new Eq( $foreign.refEq );

    // Eq instance for characters.
    var eqChar = new Eq( $foreign.refEq );

    // Helper functions to get methods from the dictionary.
    var eq1 = function ( dict ) {
        return dict.eq1;
    };
    var eq = function ( dict ) {
        return dict.eq;
    };

    // Export constructors and helper functions.
    exports[ "Eq" ] = Eq;
    exports[ "eq" ] = eq;
    exports[ "Eq1" ] = Eq1;
    exports[ "eq1" ] = eq1;

    // Export instances.
    exports[ "eqInt" ] = eqInt;
    exports[ "eqChar" ] = eqChar;

} )( PS[ "Data.Eq" ] = PS[ "Data.Eq" ] || {} );

// Module: Data.Ord.Unsafe
( function ( exports ) {

    "use strict";

    // Unsafe implementation for comparison.
    // Returns 'lt' if x < y, 'eq' if x === y, 'gt' if x > y.
    exports.unsafeCompareImpl = function ( lt ) {
        return function ( eq ) {
            return function ( gt ) {
                return function ( x ) {
                    return function ( y ) {
                        return x < y ? lt : x === y ? eq : gt;
                    };
                };
            };
        };
    };

} )( PS[ "Data.Ord.Unsafe" ] = PS[ "Data.Ord.Unsafe" ] || {} );

// Module: Data.Semigroup
( function ( exports ) {

    "use strict";

    // Concatenates two strings.
    exports.concatString = function ( s1 ) {
        return function ( s2 ) {
            return s1 + s2;
        };
    };

} )( PS[ "Data.Semigroup" ] = PS[ "Data.Semigroup" ] || {} );

// Module: Data.Semigroup (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Semigroup" ];
    var Data_Symbol = PS[ "Data.Symbol" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Data_Void = PS[ "Data.Void" ]; // Not used.
    var Record_Unsafe = PS[ "Record.Unsafe" ]; // Not used.
    var Type_Data_RowList = PS[ "Type.Data.RowList" ]; // Not used.

    // Semigroup type class constructor.
    // Provides an 'append' function for associative binary operations.
    var Semigroup = function ( append ) {
        this.append = append;
    };

    // Semigroup instance for strings.
    var semigroupString = new Semigroup( $foreign.concatString );

    // Helper function to get the 'append' method from a dictionary.
    var append = function ( dict ) {
        return dict.append;
    };

    // Export the 'Semigroup' constructor.
    exports[ "Semigroup" ] = Semigroup;

    // Export the 'append' function.
    exports[ "append" ] = append;

    // Export the 'semigroupString' instance.
    exports[ "semigroupString" ] = semigroupString;

} )( PS[ "Data.Semigroup" ] = PS[ "Data.Semigroup" ] || {} );

// Module: Data.Ordering
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.

    // Data constructors for ordering.
    var LT = function () {
        function LT() {}
        LT.value = new LT();
        return LT;
    }();
    var GT = function () {
        function GT() {}
        GT.value = new GT();
        return GT;
    }();
    var EQ = function () {
        function EQ() {}
        EQ.value = new EQ();
        return EQ;
    }();

    // Export the ordering constructors.
    exports[ "LT" ] = LT;
    exports[ "GT" ] = GT;
    exports[ "EQ" ] = EQ;

} )( PS[ "Data.Ordering" ] = PS[ "Data.Ordering" ] || {} );

// Module: Data.Ord.Unsafe (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Ord.Unsafe" ];
    var Data_Ordering = PS[ "Data.Ordering" ];

    // Unsafe comparison function using the Data.Ordering constructors.
    var unsafeCompare = $foreign.unsafeCompareImpl( Data_Ordering.LT.value )( Data_Ordering.EQ.value )( Data_Ordering.GT.value );

    // Export 'unsafeCompare'.
    exports[ "unsafeCompare" ] = unsafeCompare;

} )( PS[ "Data.Ord.Unsafe" ] = PS[ "Data.Ord.Unsafe" ] || {} );

// Module: Data.Semiring
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Semiring" ]; // Foreign module not provided in original snippet.
    var Data_Symbol = PS[ "Data.Symbol" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Record_Unsafe = PS[ "Record.Unsafe" ]; // Not used.
    var Type_Data_Row = PS[ "Type.Data.Row" ]; // Not used.
    var Type_Data_RowList = PS[ "Type.Data.RowList" ]; // Not used.

    // Semiring type class constructor.
    // Provides 'add', 'mul', 'one', and 'zero' operations.
    var Semiring = function ( add, mul, one, zero ) {
        this.add = add;
        this.mul = mul;
        this.one = one;
        this.zero = zero;
    };

    // Helper functions to get methods from the dictionary.
    var zero = function ( dict ) {
        return dict.zero;
    };
    var one = function ( dict ) {
        return dict.one;
    };
    var mul = function ( dict ) {
        return dict.mul;
    };
    var add = function ( dict ) {
        return dict.add;
    };

    // Export the 'Semiring' constructor.
    exports[ "Semiring" ] = Semiring;

    // Export helper functions.
    exports[ "add" ] = add;
    exports[ "zero" ] = zero;
    exports[ "mul" ] = mul;
    exports[ "one" ] = one;

} )( PS[ "Data.Semiring" ] = PS[ "Data.Semiring" ] || {} );

// Module: Data.Ring
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Ring" ]; // Foreign module not provided.
    var Data_Semiring = PS[ "Data.Semiring" ];
    var Data_Symbol = PS[ "Data.Symbol" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Record_Unsafe = PS[ "Record.Unsafe" ]; // Not used.
    var Type_Data_RowList = PS[ "Type.Data.RowList" ]; // Not used.

    // Ring type class constructor.
    // Extends Semiring with a 'sub' (subtraction) operation.
    var Ring = function ( Semiring0, sub ) {
        this.Semiring0 = Semiring0;
        this.sub = sub;
    };

    // Helper function to get the 'sub' method from a dictionary.
    var sub = function ( dict ) {
        return dict.sub;
    };

    // Export the 'Ring' constructor.
    exports[ "Ring" ] = Ring;

    // Export the 'sub' function.
    exports[ "sub" ] = sub;

} )( PS[ "Data.Ring" ] = PS[ "Data.Ring" ] || {} );

// Module: Data.Ord
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Ord" ]; // Foreign module not provided.
    var Data_Eq = PS[ "Data.Eq" ];
    var Data_Ord_Unsafe = PS[ "Data.Ord.Unsafe" ];
    var Data_Ordering = PS[ "Data.Ordering" ];
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Symbol = PS[ "Data.Symbol" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Data_Void = PS[ "Data.Void" ]; // Not used.
    var Record_Unsafe = PS[ "Record.Unsafe" ]; // Not used.
    var Type_Data_RowList = PS[ "Type.Data.RowList" ]; // Not used.

    // Ord type class constructor.
    // Extends Eq with a 'compare' function for total ordering.
    var Ord = function ( Eq0, compare ) {
        this.Eq0 = Eq0;
        this.compare = compare;
    };

    // Ord1 type class constructor.
    // Provides a 'compare1' function for polymorphic types.
    var Ord1 = function ( Eq10, compare1 ) {
        this.Eq10 = Eq10;
        this.compare1 = compare1;
    };

    // Ord instance for integers.
    var ordInt = new Ord( function () {
        return Data_Eq.eqInt;
    }, Data_Ord_Unsafe.unsafeCompare );

    // Ord instance for characters.
    var ordChar = new Ord( function () {
        return Data_Eq.eqChar;
    }, Data_Ord_Unsafe.unsafeCompare );

    // Helper functions to get methods from the dictionary.
    var compare1 = function ( dict ) {
        return dict.compare1;
    };
    var compare = function ( dict ) {
        return dict.compare;
    };

    // Function to compare values based on a derived property.
    var comparing = function ( dictOrd ) {
        return function ( f ) {
            return function ( x ) {
                return function ( y ) {
                    return compare( dictOrd )( f( x ) )( f( y ) );
                };
            };
        };
    };

    // Function to check if a1 is greater than a2.
    var greaterThan = function ( dictOrd ) {
        return function ( a1 ) {
            return function ( a2 ) {
                var v = compare( dictOrd )( a1 )( a2 );
                if ( v instanceof Data_Ordering.GT ) {
                    return true;
                }
                return false;
            };
        };
    };

    // Function to check if a1 is less than a2.
    var lessThan = function ( dictOrd ) {
        return function ( a1 ) {
            return function ( a2 ) {
                var v = compare( dictOrd )( a1 )( a2 );
                if ( v instanceof Data_Ordering.LT ) {
                    return true;
                }
                return false;
            };
        };
    };

    // Function to find the maximum of two values.
    var max = function ( dictOrd ) {
        return function ( x ) {
            return function ( y ) {
                var v = compare( dictOrd )( x )( y );
                if ( v instanceof Data_Ordering.LT ) {
                    return y;
                }
                if ( v instanceof Data_Ordering.EQ ) {
                    return x;
                }
                if ( v instanceof Data_Ordering.GT ) {
                    return x;
                }
                throw new Error( "Failed pattern match at Data.Ord (line 128, column 3 - line 131, column 12): " + [ v.constructor.name ] );
            };
        };
    };

    // Function to find the minimum of two values.
    var min = function ( dictOrd ) {
        return function ( x ) {
            return function ( y ) {
                var v = compare( dictOrd )( x )( y );
                if ( v instanceof Data_Ordering.LT ) {
                    return x;
                }
                if ( v instanceof Data_Ordering.EQ ) {
                    return x;
                }
                if ( v instanceof Data_Ordering.GT ) {
                    return y;
                }
                throw new Error( "Failed pattern match at Data.Ord (line 119, column 3 - line 122, column 12): " + [ v.constructor.name ] );
            };
        };
    };

    // Export constructors, helper functions, and instances.
    exports[ "Ord" ] = Ord;
    exports[ "compare" ] = compare;
    exports[ "Ord1" ] = Ord1;
    exports[ "compare1" ] = compare1;
    exports[ "lessThan" ] = lessThan;
    exports[ "greaterThan" ] = greaterThan;
    exports[ "comparing" ] = comparing;
    exports[ "min" ] = min;
    exports[ "max" ] = max;
    exports[ "ordInt" ] = ordInt;
    exports[ "ordChar" ] = ordChar;

} )( PS[ "Data.Ord" ] = PS[ "Data.Ord" ] || {} );

// Module: Data.Function
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Category = PS[ "Control.Category" ];
    var Data_Boolean = PS[ "Data.Boolean" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.

    // Flips the first two arguments of a function.
    var flip = function ( f ) {
        return function ( b ) {
            return function ( a ) {
                return f( a )( b );
            };
        };
    };

    // Constant function: always returns the first argument.
    var $$const = function ( a ) {
        return function ( v ) {
            return a;
        };
    };

    // Export 'flip' and 'const'.
    exports[ "flip" ] = flip;
    exports[ "const" ] = $$const;

} )( PS[ "Data.Function" ] = PS[ "Data.Function" ] || {} );

// Module: Data.Functor
( function ( exports ) {

    "use strict";

    // Maps a function over an array.
    exports.arrayMap = function ( f ) {
        return function ( arr ) {
            var l = arr.length;
            var result = new Array( l );
            for ( var i = 0; i < l; i++ ) {
                result[ i ] = f( arr[ i ] );
            }
            return result;
        };
    };

} )( PS[ "Data.Functor" ] = PS[ "Data.Functor" ] || {} );

// Module: Data.Functor (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Functor" ];
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ];
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.

    // Functor type class constructor.
    // Provides a 'map' function to apply a function inside a context.
    var Functor = function ( map ) {
        this.map = map;
    };

    // Helper function to get the 'map' method from a dictionary.
    var map = function ( dict ) {
        return dict.map;
    };

    // Functor instance for functions.
    // (fmap f) g = f . g
    var functorFn = new Functor( Control_Semigroupoid.compose( Control_Semigroupoid.semigroupoidFn ) );

    // Functor instance for arrays.
    var functorArray = new Functor( $foreign.arrayMap );

    // Export constructor, helper function, and instances.
    exports[ "Functor" ] = Functor;
    exports[ "map" ] = map;
    exports[ "functorFn" ] = functorFn;
    exports[ "functorArray" ] = functorArray;

} )( PS[ "Data.Functor" ] = PS[ "Data.Functor" ] || {} );

// Module: Control.Apply (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Control.Apply" ];
    var Control_Category = PS[ "Control.Category" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ];

    // Apply type class constructor.
    // Extends Functor with an 'apply' function.
    var Apply = function ( Functor0, apply ) {
        this.Functor0 = Functor0;
        this.apply = apply;
    };

    // Apply instance for arrays.
    var applyArray = new Apply( function () {
        return Data_Functor.functorArray;
    }, $foreign.arrayApply );

    // Helper function to get the 'apply' method from a dictionary.
    var apply = function ( dict ) {
        return dict.apply;
    };

    // Export constructor, helper function, and instance.
    exports[ "Apply" ] = Apply;
    exports[ "apply" ] = apply;
    exports[ "applyArray" ] = applyArray;

} )( PS[ "Control.Apply" ] = PS[ "Control.Apply" ] || {} );

// Module: Control.Applicative
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Apply = PS[ "Control.Apply" ];
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.

    // Applicative type class constructor.
    // Extends Apply with a 'pure' function.
    var Applicative = function ( Apply0, pure ) {
        this.Apply0 = Apply0;
        this.pure = pure;
    };

    // Helper function to get the 'pure' method from a dictionary.
    var pure = function ( dict ) {
        return dict.pure;
    };

    // Export constructor and helper function.
    exports[ "Applicative" ] = Applicative;
    exports[ "pure" ] = pure;

} )( PS[ "Control.Applicative" ] = PS[ "Control.Applicative" ] || {} );

// Module: Control.Bind
( function ( exports ) {

    "use strict";

    // Binds a function that returns an array to each element of an array.
    // This is essentially a flatMap or concatMap for arrays.
    exports.arrayBind = function ( arr ) {
        return function ( f ) {
            var result = [];
            for ( var i = 0, l = arr.length; i < l; i++ ) {
                Array.prototype.push.apply( result, f( arr[ i ] ) );
            }
            return result;
        };
    };

} )( PS[ "Control.Bind" ] = PS[ "Control.Bind" ] || {} );

// Module: Control.Bind (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Control.Bind" ];
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Apply = PS[ "Control.Apply" ];
    var Control_Category = PS[ "Control.Category" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.

    // Bind type class constructor.
    // Extends Apply with a 'bind' function (monadic bind).
    var Bind = function ( Apply0, bind ) {
        this.Apply0 = Apply0;
        this.bind = bind;
    };

    // Discard type class constructor.
    // Provides a 'discard' function for discarding the result of an action.
    var Discard = function ( discard ) {
        this.discard = discard;
    };

    // Helper function to get the 'discard' method from a dictionary.
    var discard = function ( dict ) {
        return dict.discard;
    };

    // Bind instance for arrays.
    var bindArray = new Bind( function () {
        return Control_Apply.applyArray;
    }, $foreign.arrayBind );

    // Helper function to get the 'bind' method from a dictionary.
    var bind = function ( dict ) {
        return dict.bind;
    };

    // Discard instance for unit, using bind.
    var discardUnit = new Discard( function ( dictBind ) {
        return bind( dictBind );
    } );

    // Export constructors, helper functions, and instances.
    exports[ "Bind" ] = Bind;
    exports[ "bind" ] = bind;
    exports[ "Discard" ] = Discard;
    exports[ "discard" ] = discard;
    exports[ "bindArray" ] = bindArray;
    exports[ "discardUnit" ] = discardUnit;

} )( PS[ "Control.Bind" ] = PS[ "Control.Bind" ] || {} );

// Module: Data.Bounded
( function ( exports ) {

    "use strict";

    // Maximum and minimum integer values.
    exports.topInt = 2147483647;
    exports.bottomInt = -2147483648;

    // Maximum and minimum character values (Unicode).
    exports.topChar = String.fromCharCode( 65535 );
    exports.bottomChar = String.fromCharCode( 0 );

} )( PS[ "Data.Bounded" ] = PS[ "Data.Bounded" ] || {} );

// Module: Data.Bounded (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Bounded" ];
    var Data_Ord = PS[ "Data.Ord" ];
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.

    // Bounded type class constructor.
    // Extends Ord with 'bottom' and 'top' elements.
    var Bounded = function ( Ord0, bottom, top ) {
        this.Ord0 = Ord0;
        this.bottom = bottom;
        this.top = top;
    };

    // Helper functions to get methods from the dictionary.
    var top = function ( dict ) {
        return dict.top;
    };

    // Bounded instance for integers.
    var boundedInt = new Bounded( function () {
        return Data_Ord.ordInt;
    }, $foreign.bottomInt, $foreign.topInt );

    // Bounded instance for characters.
    var boundedChar = new Bounded( function () {
        return Data_Ord.ordChar;
    }, $foreign.bottomChar, $foreign.topChar );

    var bottom = function ( dict ) {
        return dict.bottom;
    };

    // Export constructor, helper functions, and instances.
    exports[ "Bounded" ] = Bounded;
    exports[ "bottom" ] = bottom;
    exports[ "top" ] = top;
    exports[ "boundedInt" ] = boundedInt;
    exports[ "boundedChar" ] = boundedChar;

} )( PS[ "Data.Bounded" ] = PS[ "Data.Bounded" ] || {} );

// Module: Data.Foldable
( function ( exports ) {

    "use strict";

    // Folds an array from right to left.
    exports.foldrArray = function ( f ) {
        return function ( init ) {
            return function ( xs ) {
                var acc = init;
                var len = xs.length;
                for ( var i = len - 1; i >= 0; i-- ) {
                    acc = f( xs[ i ] )( acc );
                }
                return acc;
            };
        };
    };

    // Folds an array from left to right.
    exports.foldlArray = function ( f ) {
        return function ( init ) {
            return function ( xs ) {
                var acc = init;
                var len = xs.length;
                for ( var i = 0; i < len; i++ ) {
                    acc = f( acc )( xs[ i ] );
                }
                return acc;
            };
        };
    };

} )( PS[ "Data.Foldable" ] = PS[ "Data.Foldable" ] || {} );

// Module: Data.Monoid
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Data_Boolean = PS[ "Data.Boolean" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_EuclideanRing = PS[ "Data.EuclideanRing" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ];
    var Data_Symbol = PS[ "Data.Symbol" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Record_Unsafe = PS[ "Record.Unsafe" ]; // Not used.
    var Type_Data_RowList = PS[ "Type.Data.RowList" ]; // Not used.

    // Monoid type class constructor.
    // Extends Semigroup with a 'mempty' (identity) element.
    var Monoid = function ( Semigroup0, mempty ) {
        this.Semigroup0 = Semigroup0;
        this.mempty = mempty;
    };

    // Monoid instance for strings (empty string is the identity).
    var monoidString = new Monoid( function () {
        return Data_Semigroup.semigroupString;
    }, "" );

    // Helper function to get the 'mempty' method from a dictionary.
    var mempty = function ( dict ) {
        return dict.mempty;
    };

    // Export constructor, helper function, and instance.
    exports[ "Monoid" ] = Monoid;
    exports[ "mempty" ] = mempty;
    exports[ "monoidString" ] = monoidString;

} )( PS[ "Data.Monoid" ] = PS[ "Data.Monoid" ] || {} );

// Module: Data.Maybe
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Alt = PS[ "Control.Alt" ]; // Not used.
    var Control_Alternative = PS[ "Control.Alternative" ]; // Not used.
    var Control_Applicative = PS[ "Control.Applicative" ];
    var Control_Apply = PS[ "Control.Apply" ];
    var Control_Bind = PS[ "Control.Bind" ];
    var Control_Category = PS[ "Control.Category" ];
    var Control_Extend = PS[ "Control.Extend" ]; // Not used.
    var Control_Monad = PS[ "Control.Monad" ]; // Not used.
    var Control_MonadZero = PS[ "Control.MonadZero" ]; // Not used.
    var Control_Plus = PS[ "Control.Plus" ]; // Not used.
    var Data_Bounded = PS[ "Data.Bounded" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ];
    var Data_Functor = PS[ "Data.Functor" ];
    var Data_Functor_Invariant = PS[ "Data.Functor.Invariant" ]; // Not used.
    var Data_Monoid = PS[ "Data.Monoid" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Data constructors for Maybe type.
    var Nothing = function () {
        function Nothing() {}
        Nothing.value = new Nothing();
        return Nothing;
    }();
    var Just = function () {
        function Just( value0 ) {
            this.value0 = value0;
        }
        Just.create = function ( value0 ) {
            return new Just( value0 );
        };
        return Just;
    }();

    // Helper function to handle Maybe values.
    var maybe = function ( v ) {
        return function ( v1 ) {
            return function ( v2 ) {
                if ( v2 instanceof Nothing ) {
                    return v;
                }
                if ( v2 instanceof Just ) {
                    return v1( v2.value0 );
                }
                throw new Error( "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ] );
            };
        };
    };

    // Checks if a Maybe value is Just.
    var isJust = maybe( false )( Data_Function[ "const" ]( true ) );

    // Functor instance for Maybe.
    var functorMaybe = new Data_Functor.Functor( function ( v ) {
        return function ( v1 ) {
            if ( v1 instanceof Just ) {
                return new Just( v( v1.value0 ) );
            }
            return Nothing.value;
        };
    } );

    // Extracts the value from a Just, or returns a default value for Nothing.
    var fromMaybe = function ( a ) {
        return maybe( a )( Control_Category.identity( Control_Category.categoryFn ) );
    };

    // Extracts the value from a Just, crashing on Nothing.
    var fromJust = function ( dictPartial ) {
        return function ( v ) {
            if ( v instanceof Just ) {
                return v.value0;
            }
            throw new Error( "Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [ v.constructor.name ] );
        };
    };

    // Apply instance for Maybe.
    var applyMaybe = new Control_Apply.Apply( function () {
        return functorMaybe;
    }, function ( v ) {
        return function ( v1 ) {
            if ( v instanceof Just ) {
                return Data_Functor.map( functorMaybe )( v.value0 )( v1 );
            }
            if ( v instanceof Nothing ) {
                return Nothing.value;
            }
            throw new Error( "Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " + [ v.constructor.name, v1.constructor.name ] );
        };
    } );

    // Bind instance for Maybe.
    var bindMaybe = new Control_Bind.Bind( function () {
        return applyMaybe;
    }, function ( v ) {
        return function ( v1 ) {
            if ( v instanceof Just ) {
                return v1( v.value0 );
            }
            if ( v instanceof Nothing ) {
                return Nothing.value;
            }
            throw new Error( "Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " + [ v.constructor.name, v1.constructor.name ] );
        };
    } );

    // Applicative instance for Maybe.
    var applicativeMaybe = new Control_Applicative.Applicative( function () {
        return applyMaybe;
    }, Just.create );

    // Export constructors, helper functions, and instances.
    exports[ "Nothing" ] = Nothing;
    exports[ "Just" ] = Just;
    exports[ "maybe" ] = maybe;
    exports[ "fromMaybe" ] = fromMaybe;
    exports[ "isJust" ] = isJust;
    exports[ "fromJust" ] = fromJust;
    exports[ "functorMaybe" ] = functorMaybe;
    exports[ "applyMaybe" ] = applyMaybe;
    exports[ "applicativeMaybe" ] = applicativeMaybe;
    exports[ "bindMaybe" ] = bindMaybe;

} )( PS[ "Data.Maybe" ] = PS[ "Data.Maybe" ] || {} );

// Module: Data.Monoid.Conj
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Apply = PS[ "Control.Apply" ]; // Not used.
    var Control_Bind = PS[ "Control.Bind" ]; // Not used.
    var Control_Monad = PS[ "Control.Monad" ]; // Not used.
    var Data_Bounded = PS[ "Data.Bounded" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ];
    var Data_Monoid = PS[ "Data.Monoid" ];
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ];
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Newtype for conjunction.
    var Conj = function ( x ) {
        return x;
    };

    // Semigroup instance for Conj.
    var semigroupConj = function ( dictHeytingAlgebra ) {
        return new Data_Semigroup.Semigroup( function ( v ) {
            return function ( v1 ) {
                return Data_HeytingAlgebra.conj( dictHeytingAlgebra )( v )( v1 );
            };
        } );
    };

    // Monoid instance for Conj.
    var monoidConj = function ( dictHeytingAlgebra ) {
        return new Data_Monoid.Monoid( function () {
            return semigroupConj( dictHeytingAlgebra );
        }, Data_HeytingAlgebra.tt( dictHeytingAlgebra ) );
    };

    // Export newtype and instances.
    exports[ "Conj" ] = Conj;
    exports[ "semigroupConj" ] = semigroupConj;
    exports[ "monoidConj" ] = monoidConj;

} )( PS[ "Data.Monoid.Conj" ] = PS[ "Data.Monoid.Conj" ] || {} );

// Module: Data.Newtype
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ];
    var Data_Monoid_Additive = PS[ "Data.Monoid.Additive" ]; // Not used.
    var Data_Monoid_Conj = PS[ "Data.Monoid.Conj" ];
    var Data_Monoid_Disj = PS[ "Data.Monoid.Disj" ]; // Not used.
    var Data_Monoid_Dual = PS[ "Data.Monoid.Dual" ]; // Not used.
    var Data_Monoid_Endo = PS[ "Data.Monoid.Endo" ]; // Not used.
    var Data_Monoid_Multiplicative = PS[ "Data.Monoid.Multiplicative" ]; // Not used.
    var Data_Semigroup_First = PS[ "Data.Semigroup.First" ]; // Not used.
    var Data_Semigroup_Last = PS[ "Data.Semigroup.Last" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Newtype type class constructor.
    // Provides 'unwrap' and 'wrap' functions for newtypes.
    var Newtype = function ( unwrap, wrap ) {
        this.unwrap = unwrap;
        this.wrap = wrap;
    };

    // Helper functions to get methods from the dictionary.
    var wrap = function ( dict ) {
        return dict.wrap;
    };
    var unwrap = function ( dict ) {
        return dict.unwrap;
    };

    // Newtype instance for Conj.
    var newtypeConj = new Newtype( function ( v ) {
        return v;
    }, Data_Monoid_Conj.Conj );

    // Utility function for newtypes and functors.
    var alaF = function ( dictFunctor ) {
        return function ( dictFunctor1 ) {
            return function ( dictNewtype ) {
                return function ( dictNewtype1 ) {
                    return function ( v ) {
                        return function ( f ) {
                            return function ( $80 ) {
                                return Data_Functor.map( dictFunctor1 )( unwrap( dictNewtype1 ) )( f( Data_Functor.map( dictFunctor )( wrap( dictNewtype ) )( $80 ) ) );
                            };
                        };
                    };
                };
            };
        };
    };

    // Export helper functions, constructor, and instances.
    exports[ "unwrap" ] = unwrap;
    exports[ "wrap" ] = wrap;
    exports[ "Newtype" ] = Newtype;
    exports[ "alaF" ] = alaF;
    exports[ "newtypeConj" ] = newtypeConj;

} )( PS[ "Data.Newtype" ] = PS[ "Data.Newtype" ] || {} );

// Module: Data.Foldable (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Foldable" ];
    var Control_Alt = PS[ "Control.Alt" ]; // Not used.
    var Control_Alternative = PS[ "Control.Alternative" ]; // Not used.
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Apply = PS[ "Control.Apply" ]; // Not used.
    var Control_Bind = PS[ "Control.Bind" ]; // Not used.
    var Control_Category = PS[ "Control.Category" ]; // Not used.
    var Control_Plus = PS[ "Control.Plus" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ];
    var Data_Functor = PS[ "Data.Functor" ];
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ];
    var Data_Maybe = PS[ "Data.Maybe" ]; // Not used.
    var Data_Maybe_First = PS[ "Data.Maybe.First" ]; // Not used.
    var Data_Maybe_Last = PS[ "Data.Maybe.Last" ]; // Not used.
    var Data_Monoid = PS[ "Data.Monoid" ];
    var Data_Monoid_Additive = PS[ "Data.Monoid.Additive" ]; // Not used.
    var Data_Monoid_Conj = PS[ "Data.Monoid.Conj" ];
    var Data_Monoid_Disj = PS[ "Data.Monoid.Disj" ]; // Not used.
    var Data_Monoid_Dual = PS[ "Data.Monoid.Dual" ]; // Not used.
    var Data_Monoid_Endo = PS[ "Data.Monoid.Endo" ]; // Not used.
    var Data_Monoid_Multiplicative = PS[ "Data.Monoid.Multiplicative" ]; // Not used.
    var Data_Newtype = PS[ "Data.Newtype" ];
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ];
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Foldable type class constructor.
    // Provides 'foldMap', 'foldl', and 'foldr' functions.
    var Foldable = function ( foldMap, foldl, foldr ) {
        this.foldMap = foldMap;
        this.foldl = foldl;
        this.foldr = foldr;
    };

    // Helper functions to get methods from the dictionary.
    var foldr = function ( dict ) {
        return dict.foldr;
    };
    var foldl = function ( dict ) {
        return dict.foldl;
    };

    // Default implementation for foldMap using foldr.
    var foldMapDefaultR = function ( dictFoldable ) {
        return function ( dictMonoid ) {
            return function ( f ) {
                return foldr( dictFoldable )( function ( x ) {
                    return function ( acc ) {
                        return Data_Semigroup.append( dictMonoid.Semigroup0() )( f( x ) )( acc );
                    };
                } )( Data_Monoid.mempty( dictMonoid ) );
            };
        };
    };

    // Foldable instance for arrays.
    var foldableArray = new Foldable( function ( dictMonoid ) {
        return foldMapDefaultR( foldableArray )( dictMonoid );
    }, $foreign.foldlArray, $foreign.foldrArray );

    var foldMap = function ( dict ) {
        return dict.foldMap;
    };

    // Checks if all elements in a foldable satisfy a predicate.
    var all = function ( dictFoldable ) {
        return function ( dictHeytingAlgebra ) {
            return Data_Newtype.alaF( Data_Functor.functorFn )( Data_Functor.functorFn )( Data_Newtype.newtypeConj )( Data_Newtype.newtypeConj )( Data_Monoid_Conj.Conj )( foldMap( dictFoldable )( Data_Monoid_Conj.monoidConj( dictHeytingAlgebra ) ) );
        };
    };

    // Export constructor, helper functions, and instances.
    exports[ "Foldable" ] = Foldable;
    exports[ "foldr" ] = foldr;
    exports[ "foldl" ] = foldl;
    exports[ "foldMap" ] = foldMap;
    exports[ "foldMapDefaultR" ] = foldMapDefaultR;
    exports[ "all" ] = all;
    exports[ "foldableArray" ] = foldableArray;

} )( PS[ "Data.Foldable" ] = PS[ "Data.Foldable" ] || {} );

// Module: Data.Either
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Alt = PS[ "Control.Alt" ]; // Not used.
    var Control_Alternative = PS[ "Control.Alternative" ]; // Not used.
    var Control_Applicative = PS[ "Control.Applicative" ];
    var Control_Apply = PS[ "Control.Apply" ];
    var Control_Bind = PS[ "Control.Bind" ];
    var Control_Extend = PS[ "Control.Extend" ]; // Not used.
    var Control_Monad = PS[ "Control.Monad" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Bifoldable = PS[ "Data.Bifoldable" ]; // Not used.
    var Data_Bifunctor = PS[ "Data.Bifunctor" ]; // Not used.
    var Data_Bitraversable = PS[ "Data.Bitraversable" ]; // Not used.
    var Data_Bounded = PS[ "Data.Bounded" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Foldable = PS[ "Data.Foldable" ]; // Not used.
    var Data_FoldableWithIndex = PS[ "Data.FoldableWithIndex" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ];
    var Data_Functor_Invariant = PS[ "Data.Functor.Invariant" ]; // Not used.
    var Data_FunctorWithIndex = PS[ "Data.FunctorWithIndex" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Monoid = PS[ "Data.Monoid" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Data_Traversable = PS[ "Data.Traversable" ]; // Not used.
    var Data_TraversableWithIndex = PS[ "Data.TraversableWithIndex" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Data constructors for Either type.
    var Left = function () {
        function Left( value0 ) {
            this.value0 = value0;
        }
        Left.create = function ( value0 ) {
            return new Left( value0 );
        };
        return Left;
    }();
    var Right = function () {
        function Right( value0 ) {
            this.value0 = value0;
        }
        Right.create = function ( value0 ) {
            return new Right( value0 );
        };
        return Right;
    }();

    // Converts a Maybe to an Either, providing a default Left value.
    var note = function ( a ) {
        return Data_Maybe.maybe( new Left( a ) )( Right.create );
    };

    // Functor instance for Either.
    var functorEither = new Data_Functor.Functor( function ( f ) {
        return function ( m ) {
            if ( m instanceof Left ) {
                return new Left( m.value0 );
            }
            if ( m instanceof Right ) {
                return new Right( f( m.value0 ) );
            }
            throw new Error( "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [ m.constructor.name ] );
        };
    } );

    // Helper function to handle Either values.
    var either = function ( v ) {
        return function ( v1 ) {
            return function ( v2 ) {
                if ( v2 instanceof Left ) {
                    return v( v2.value0 );
                }
                if ( v2 instanceof Right ) {
                    return v1( v2.value0 );
                }
                throw new Error( "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ] );
            };
        };
    };

    // Apply instance for Either.
    var applyEither = new Control_Apply.Apply( function () {
        return functorEither;
    }, function ( v ) {
        return function ( v1 ) {
            if ( v instanceof Left ) {
                return new Left( v.value0 );
            }
            if ( v instanceof Right ) {
                return Data_Functor.map( functorEither )( v.value0 )( v1 );
            }
            throw new Error( "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [ v.constructor.name, v1.constructor.name ] );
        };
    } );

    // Bind instance for Either.
    var bindEither = new Control_Bind.Bind( function () {
        return applyEither;
    }, either( function ( e ) {
        return function ( v ) {
            return new Left( e );
        };
    } )( function ( a ) {
        return function ( f ) {
            return f( a );
        };
    } ) );

    // Applicative instance for Either.
    var applicativeEither = new Control_Applicative.Applicative( function () {
        return applyEither;
    }, Right.create );

    // Export constructors, helper functions, and instances.
    exports[ "Left" ] = Left;
    exports[ "Right" ] = Right;
    exports[ "either" ] = either;
    exports[ "note" ] = note;
    exports[ "functorEither" ] = functorEither;
    exports[ "applyEither" ] = applyEither;
    exports[ "applicativeEither" ] = applicativeEither;
    exports[ "bindEither" ] = bindEither;

} )( PS[ "Data.Either" ] = PS[ "Data.Either" ] || {} );

// Module: Partial.Unsafe
( function ( exports ) {

    "use strict";

    // Unsafe partial application.
    exports.unsafePartial = function ( f ) {
        return f();
    };

} )( PS[ "Partial.Unsafe" ] = PS[ "Partial.Unsafe" ] || {} );

// Module: Partial
( function ( exports ) {

    "use strict";

    // Crashes the program with a given message.
    exports.crashWith = function () {
        return function ( msg ) {
            throw new Error( msg );
        };
    };

} )( PS[ "Partial" ] = PS[ "Partial" ] || {} );

// Module: Partial (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions.
    var $foreign = PS[ "Partial" ];

    // Export 'crashWith' from foreign.
    exports[ "crashWith" ] = $foreign.crashWith;

} )( PS[ "Partial" ] = PS[ "Partial" ] || {} );

// Module: Partial.Unsafe (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Partial.Unsafe" ];
    var Partial = PS[ "Partial" ];

    // Unsafely crashes the program with a message.
    var unsafeCrashWith = function ( msg ) {
        return $foreign.unsafePartial( function ( dictPartial ) {
            return Partial.crashWith( dictPartial )( msg );
        } );
    };

    // Export 'unsafeCrashWith'.
    exports[ "unsafeCrashWith" ] = unsafeCrashWith;

} )( PS[ "Partial.Unsafe" ] = PS[ "Partial.Unsafe" ] || {} );

// Module: Control.Monad.Rec.Class
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Bind = PS[ "Control.Bind" ]; // Not used.
    var Control_Monad = PS[ "Control.Monad" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Bifunctor = PS[ "Data.Bifunctor" ]; // Not used.
    var Data_Either = PS[ "Data.Either" ];
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_Identity = PS[ "Data.Identity" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Effect = PS[ "Effect" ]; // Not used.
    var Effect_Ref = PS[ "Effect.Ref" ]; // Not used.
    var Partial_Unsafe = PS[ "Partial.Unsafe" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Data constructors for tail recursion.
    var Loop = function () {
        function Loop( value0 ) {
            this.value0 = value0;
        }
        Loop.create = function ( value0 ) {
            return new Loop( value0 );
        };
        return Loop;
    }();
    var Done = function () {
        function Done( value0 ) {
            this.value0 = value0;
        }
        Done.create = function ( value0 ) {
            return new Done( value0 );
        };
        return Done;
    }();

    // Tail recursion optimization function.
    var tailRec = function ( f ) {
        var go = function ( $copy_v ) {
            var $tco_done = false;
            var $tco_result;

            function $tco_loop( v ) {
                if ( v instanceof Loop ) {
                    $copy_v = f( v.value0 );
                    return;
                }
                if ( v instanceof Done ) {
                    $tco_done = true;
                    return v.value0;
                }
                throw new Error( "Failed pattern match at Control.Monad.Rec.Class (line 91, column 3 - line 91, column 25): " + [ v.constructor.name ] );
            }
            while ( !$tco_done ) {
                $tco_result = $tco_loop( $copy_v );
            }
            return $tco_result;
        };
        return function ( $53 ) {
            return go( f( $53 ) );
        };
    };

    // Export constructors and 'tailRec'.
    exports[ "Loop" ] = Loop;
    exports[ "Done" ] = Done;
    exports[ "tailRec" ] = tailRec;

} )( PS[ "Control.Monad.Rec.Class" ] = PS[ "Control.Monad.Rec.Class" ] || {} );

// Module: Data.Array
( function ( exports ) {

    "use strict";

    // Returns the length of an array.
    exports.length = function ( xs ) {
        return xs.length;
    };

    // Safely gets an element from an array by index.
    exports.indexImpl = function ( just ) {
        return function ( nothing ) {
            return function ( xs ) {
                return function ( i ) {
                    return i < 0 || i >= xs.length ? nothing : just( xs[ i ] );
                };
            };
        };
    };

    // Sorts an array using a comparison function.
    exports.sortImpl = function ( f ) {
        return function ( l ) {
            return l.slice().sort( function ( x, y ) {
                return f( x )( y );
            } );
        };
    };

    // Extracts a slice of an array.
    exports.slice = function ( s ) {
        return function ( e ) {
            return function ( l ) {
                return l.slice( s, e );
            };
        };
    };

    // Drops the first 'n' elements from an array.
    exports.drop = function ( n ) {
        return function ( l ) {
            return n < 1 ? l : l.slice( n );
        };
    };

} )( PS[ "Data.Array" ] = PS[ "Data.Array" ] || {} );

// Module: Data.Tuple
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Apply = PS[ "Control.Apply" ]; // Not used.
    var Control_Biapplicative = PS[ "Control.Biapplicative" ]; // Not used.
    var Control_Biapply = PS[ "Control.Biapply" ]; // Not used.
    var Control_Bind = PS[ "Control.Bind" ]; // Not used.
    var Control_Comonad = PS[ "Control.Comonad" ]; // Not used.
    var Control_Extend = PS[ "Control.Extend" ]; // Not used.
    var Control_Lazy = PS[ "Control.Lazy" ]; // Not used.
    var Control_Monad = PS[ "Control.Monad" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Bifoldable = PS[ "Data.Bifoldable" ]; // Not used.
    var Data_Bifunctor = PS[ "Data.Bifunctor" ]; // Not used.
    var Data_Bitraversable = PS[ "Data.Bitraversable" ]; // Not used.
    var Data_BooleanAlgebra = PS[ "Data.BooleanAlgebra" ]; // Not used.
    var Data_Bounded = PS[ "Data.Bounded" ]; // Not used.
    var Data_CommutativeRing = PS[ "Data.CommutativeRing" ]; // Not used.
    var Data_Distributive = PS[ "Data.Distributive" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Foldable = PS[ "Data.Foldable" ]; // Not used.
    var Data_FoldableWithIndex = PS[ "Data.FoldableWithIndex" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_Functor_Invariant = PS[ "Data.Functor.Invariant" ]; // Not used.
    var Data_FunctorWithIndex = PS[ "Data.FunctorWithIndex" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ]; // Not used.
    var Data_Maybe_First = PS[ "Data.Maybe.First" ]; // Not used.
    var Data_Monoid = PS[ "Data.Monoid" ]; // Not used.
    var Data_Newtype = PS[ "Data.Newtype" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ]; // Not used.
    var Data_Semigroup_Foldable = PS[ "Data.Semigroup.Foldable" ]; // Not used.
    var Data_Semigroup_Traversable = PS[ "Data.Semigroup.Traversable" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Data_Traversable = PS[ "Data.Traversable" ]; // Not used.
    var Data_TraversableWithIndex = PS[ "Data.TraversableWithIndex" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.
    var Type_Equality = PS[ "Type.Equality" ]; // Not used.

    // Tuple constructor.
    var Tuple = function () {
        function Tuple( value0, value1 ) {
            this.value0 = value0;
            this.value1 = value1;
        }
        Tuple.create = function ( value0 ) {
            return function ( value1 ) {
                return new Tuple( value0, value1 );
            };
        };
        return Tuple;
    }();

    // Extracts the second element of a tuple.
    var snd = function ( v ) {
        return v.value1;
    };

    // Extracts the first element of a tuple.
    var fst = function ( v ) {
        return v.value0;
    };

    // Export constructor and helper functions.
    exports[ "Tuple" ] = Tuple;
    exports[ "fst" ] = fst;
    exports[ "snd" ] = snd;

} )( PS[ "Data.Tuple" ] = PS[ "Data.Tuple" ] || {} );

// Module: Data.Unfoldable1
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Unfoldable1" ]; // Foreign module not provided.
    var Data_Boolean = PS[ "Data.Boolean" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semigroup_Traversable = PS[ "Data.Semigroup.Traversable" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Tuple = PS[ "Data.Tuple" ]; // Not used.
    var Partial_Unsafe = PS[ "Partial.Unsafe" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Unfoldable1 type class constructor.
    // Provides 'unfoldr1' for generating non-empty structures.
    var Unfoldable1 = function ( unfoldr1 ) {
        this.unfoldr1 = unfoldr1;
    };

    // Helper function to get the 'unfoldr1' method from a dictionary.
    var unfoldr1 = function ( dict ) {
        return dict.unfoldr1;
    };

    // Export constructor and helper function.
    exports[ "Unfoldable1" ] = Unfoldable1;
    exports[ "unfoldr1" ] = unfoldr1;

} )( PS[ "Data.Unfoldable1" ] = PS[ "Data.Unfoldable1" ] || {} );

// Module: Data.Unfoldable
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Unfoldable" ]; // Foreign module not provided.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Traversable = PS[ "Data.Traversable" ]; // Not used.
    var Data_Tuple = PS[ "Data.Tuple" ];
    var Data_Unfoldable1 = PS[ "Data.Unfoldable1" ];
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Partial_Unsafe = PS[ "Partial.Unsafe" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Unfoldable type class constructor.
    // Extends Unfoldable1 with 'unfoldr' for generating structures.
    var Unfoldable = function ( Unfoldable10, unfoldr ) {
        this.Unfoldable10 = Unfoldable10;
        this.unfoldr = unfoldr;
    };

    // Helper function to get the 'unfoldr' method from a dictionary.
    var unfoldr = function ( dict ) {
        return dict.unfoldr;
    };

    // Replicates a value 'n' times.
    var replicate = function ( dictUnfoldable ) {
        return function ( n ) {
            return function ( v ) {
                var step = function ( i ) {
                    var $7 = i <= 0;
                    if ( $7 ) {
                        return Data_Maybe.Nothing.value;
                    }
                    return new Data_Maybe.Just( new Data_Tuple.Tuple( v, i - 1 | 0 ) );
                };
                return unfoldr( dictUnfoldable )( step )( n );
            };
        };
    };

    // Export constructor, helper function, and 'replicate'.
    exports[ "Unfoldable" ] = Unfoldable;
    exports[ "unfoldr" ] = unfoldr;
    exports[ "replicate" ] = replicate;

} )( PS[ "Data.Unfoldable" ] = PS[ "Data.Unfoldable" ] || {} );

// Module: Unsafe.Coerce
( function ( exports ) {

    "use strict";

    // Unsafe type coercion.
    exports.unsafeCoerce = function ( x ) {
        return x;
    };

} )( PS[ "Unsafe.Coerce" ] = PS[ "Unsafe.Coerce" ] || {} );

// Module: Unsafe.Coerce (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions.
    var $foreign = PS[ "Unsafe.Coerce" ];

    // Export 'unsafeCoerce' from foreign.
    exports[ "unsafeCoerce" ] = $foreign.unsafeCoerce;

} )( PS[ "Unsafe.Coerce" ] = PS[ "Unsafe.Coerce" ] || {} );

// Module: Data.Array (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Array" ];
    var Control_Alt = PS[ "Control.Alt" ]; // Not used.
    var Control_Alternative = PS[ "Control.Alternative" ]; // Not used.
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Apply = PS[ "Control.Apply" ]; // Not used.
    var Control_Bind = PS[ "Control.Bind" ];
    var Control_Category = PS[ "Control.Category" ]; // Not used.
    var Control_Lazy = PS[ "Control.Lazy" ]; // Not used.
    var Control_Monad_Rec_Class = PS[ "Control.Monad.Rec.Class" ]; // Not used.
    var Control_Monad_ST = PS[ "Control.Monad.ST" ]; // Not used.
    var Control_Monad_ST_Internal = PS[ "Control.Monad.ST.Internal" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Array_NonEmpty_Internal = PS[ "Data.Array.NonEmpty.Internal" ]; // Not used.
    var Data_Array_ST = PS[ "Data.Array.ST" ]; // Not used.
    var Data_Array_ST_Iterator = PS[ "Data.Array.ST.Iterator" ]; // Not used.
    var Data_Boolean = PS[ "Data.Boolean" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Foldable = PS[ "Data.Foldable" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ];
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Ord = PS[ "Data.Ord" ];
    var Data_Ordering = PS[ "Data.Ordering" ];
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Traversable = PS[ "Data.Traversable" ]; // Not used.
    var Data_Tuple = PS[ "Data.Tuple" ]; // Not used.
    var Data_Unfoldable = PS[ "Data.Unfoldable" ]; // Not used.
    var Partial_Unsafe = PS[ "Partial.Unsafe" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.
    var Unsafe_Coerce = PS[ "Unsafe.Coerce" ]; // Not used.

    // Sorts an array using a provided comparison function.
    var sortBy = function ( comp ) {
        return function ( xs ) {
            var comp$prime = function ( x ) {
                return function ( y ) {
                    var v = comp( x )( y );
                    if ( v instanceof Data_Ordering.GT ) {
                        return 1;
                    }
                    if ( v instanceof Data_Ordering.EQ ) {
                        return 0;
                    }
                    if ( v instanceof Data_Ordering.LT ) {
                        return -1 | 0;
                    }
                    throw new Error( "Failed pattern match at Data.Array (line 702, column 15 - line 707, column 1): " + [ v.constructor.name ] );
                };
            };
            return $foreign.sortImpl( comp$prime )( xs );
        };
    };

    // Sorts an array by applying a function to each element and comparing the results.
    var sortWith = function ( dictOrd ) {
        return function ( f ) {
            return sortBy( Data_Ord.comparing( dictOrd )( f ) );
        };
    };

    // Creates a singleton array.
    var singleton = function ( a ) {
        return [ a ];
    };

    // Safely gets an element from an array by index.
    var index = $foreign.indexImpl( Data_Maybe.Just.create )( Data_Maybe.Nothing.value );

    // Gets the head (first element) of an array.
    var head = function ( xs ) {
        return index( xs )( 0 );
    };

    // Concatenates the results of mapping a function over an array.
    var concatMap = Data_Function.flip( Control_Bind.bind( Control_Bind.bindArray ) );

    // Maps a function that may return Nothing over an array, discarding Nothings.
    var mapMaybe = function ( f ) {
        return concatMap( function ( $114 ) {
            return Data_Maybe.maybe( [] )( singleton )( f( $114 ) );
        } );
    };

    // Export helper functions and foreign functions.
    exports[ "singleton" ] = singleton;
    exports[ "head" ] = head;
    exports[ "index" ] = index;
    exports[ "concatMap" ] = concatMap;
    exports[ "mapMaybe" ] = mapMaybe;
    exports[ "sortBy" ] = sortBy;
    exports[ "sortWith" ] = sortWith;
    exports[ "length" ] = $foreign.length;
    exports[ "drop" ] = $foreign.drop;

} )( PS[ "Data.Array" ] = PS[ "Data.Array" ] || {} );

// Module: Data.Enum
( function ( exports ) {

    "use strict";

    // Converts a character to its Unicode code point.
    exports.toCharCode = function ( c ) {
        return c.charCodeAt( 0 );
    };

    // Converts a Unicode code point to a character.
    exports.fromCharCode = function ( c ) {
        return String.fromCharCode( c );
    };

} )( PS[ "Data.Enum" ] = PS[ "Data.Enum" ] || {} );

// Module: Data.Enum (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Enum" ];
    var Control_Apply = PS[ "Control.Apply" ]; // Not used.
    var Control_Bind = PS[ "Control.Bind" ]; // Not used.
    var Control_MonadPlus = PS[ "Control.MonadPlus" ]; // Not used.
    var Control_MonadZero = PS[ "Control.MonadZero" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Boolean = PS[ "Data.Boolean" ];
    var Data_Bounded = PS[ "Data.Bounded" ];
    var Data_Either = PS[ "Data.Either" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Newtype = PS[ "Data.Newtype" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ];
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Data_Tuple = PS[ "Data.Tuple" ]; // Not used.
    var Data_Unfoldable = PS[ "Data.Unfoldable" ]; // Not used.
    var Data_Unfoldable1 = PS[ "Data.Unfoldable1" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Partial_Unsafe = PS[ "Partial.Unsafe" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Enum type class constructor.
    // Provides 'pred' (predecessor) and 'succ' (successor) functions.
    var Enum = function ( Ord0, pred, succ ) {
        this.Ord0 = Ord0;
        this.pred = pred;
        this.succ = succ;
    };

    // BoundedEnum type class constructor.
    // Extends Bounded and Enum with 'cardinality', 'fromEnum', and 'toEnum'.
    var BoundedEnum = function ( Bounded0, Enum1, cardinality, fromEnum, toEnum ) {
        this.Bounded0 = Bounded0;
        this.Enum1 = Enum1;
        this.cardinality = cardinality;
        this.fromEnum = fromEnum;
        this.toEnum = toEnum;
    };

    // Helper functions to get methods from the dictionary.
    var toEnum = function ( dict ) {
        return dict.toEnum;
    };
    var succ = function ( dict ) {
        return dict.succ;
    };
    var pred = function ( dict ) {
        return dict.pred;
    };
    var fromEnum = function ( dict ) {
        return dict.fromEnum;
    };

    // Default successor function implementation.
    var defaultSucc = function ( toEnum$prime ) {
        return function ( fromEnum$prime ) {
            return function ( a ) {
                return toEnum$prime( fromEnum$prime( a ) + 1 | 0 );
            };
        };
    };

    // Default predecessor function implementation.
    var defaultPred = function ( toEnum$prime ) {
        return function ( fromEnum$prime ) {
            return function ( a ) {
                return toEnum$prime( fromEnum$prime( a ) - 1 | 0 );
            };
        };
    };

    // Converts an integer code point to a character (if valid).
    var charToEnum = function ( v ) {
        if ( v >= Data_Bounded.bottom( Data_Bounded.boundedInt ) && v <= Data_Bounded.top( Data_Bounded.boundedInt ) ) {
            return new Data_Maybe.Just( $foreign.fromCharCode( v ) );
        }
        return Data_Maybe.Nothing.value;
    };

    // Enum instance for characters.
    var enumChar = new Enum( function () {
        return Data_Ord.ordChar;
    }, defaultPred( charToEnum )( $foreign.toCharCode ), defaultSucc( charToEnum )( $foreign.toCharCode ) );

    var cardinality = function ( dict ) {
        return dict.cardinality;
    };

    // BoundedEnum instance for characters.
    var boundedEnumChar = new BoundedEnum( function () {
        return Data_Bounded.boundedChar;
    }, function () {
        return enumChar;
    }, $foreign.toCharCode( Data_Bounded.top( Data_Bounded.boundedChar ) ) - $foreign.toCharCode( Data_Bounded.bottom( Data_Bounded.boundedChar ) ) | 0, $foreign.toCharCode, charToEnum );

    // Export constructors, helper functions, and instances.
    exports[ "Enum" ] = Enum;
    exports[ "succ" ] = succ;
    exports[ "pred" ] = pred;
    exports[ "BoundedEnum" ] = BoundedEnum;
    exports[ "cardinality" ] = cardinality;
    exports[ "toEnum" ] = toEnum;
    exports[ "fromEnum" ] = fromEnum;
    exports[ "defaultSucc" ] = defaultSucc;
    exports[ "defaultPred" ] = defaultPred;
    exports[ "enumChar" ] = enumChar;
    exports[ "boundedEnumChar" ] = boundedEnumChar;

} )( PS[ "Data.Enum" ] = PS[ "Data.Enum" ] || {} );

// Module: Data.Char
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Data_Enum = PS[ "Data.Enum" ];
    var Data_Maybe = PS[ "Data.Maybe" ]; // Not used.

    // Converts a character to its Unicode code point using BoundedEnum instance.
    var toCharCode = Data_Enum.fromEnum( Data_Enum.boundedEnumChar );

    // Converts a Unicode code point to a character using BoundedEnum instance.
    var fromCharCode = Data_Enum.toEnum( Data_Enum.boundedEnumChar );

    // Export helper functions.
    exports[ "toCharCode" ] = toCharCode;
    exports[ "fromCharCode" ] = fromCharCode;

} )( PS[ "Data.Char" ] = PS[ "Data.Char" ] || {} );

// Module: Data.Digit
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Data_Boolean = PS[ "Data.Boolean" ];
    var Data_Char = PS[ "Data.Char" ];
    var Data_Eq = PS[ "Data.Eq" ];
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Generic_Rep = PS[ "Data.Generic.Rep" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Ord = PS[ "Data.Ord" ];
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Partial_Unsafe = PS[ "Partial.Unsafe" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Newtype for a single digit (0-9).
    var Digit = function ( x ) {
        return x;
    };

    // Converts a Digit to an integer.
    var toInt = function ( v ) {
        return v;
    };

    // Converts a Digit to a character.
    var toChar = function ( v ) {
        return Data_Maybe.fromJust()( Data_Char.fromCharCode( v + 48 | 0 ) );
    };

    // Converts an integer to a Digit (if valid).
    var fromInt = function ( c ) {
        if ( 0 <= c && c <= 9 ) {
            return new Data_Maybe.Just( c );
        }
        if ( Data_Boolean.otherwise ) {
            return Data_Maybe.Nothing.value;
        }
        throw new Error( "Failed pattern match at Data.Digit (line 27, column 1 - line 27, column 30): " + [ c.constructor.name ] );
    };

    // Converts a character to a Digit (if valid).
    var fromChar = function ( c ) {
        var code = Data_Char.toCharCode( c );
        var $16 = code >= 48 && code <= 57;
        if ( $16 ) {
            return new Data_Maybe.Just( Digit( code - 48 | 0 ) );
        }
        return Data_Maybe.Nothing.value;
    };

    // Eq instance for Digit.
    var eqDigit = new Data_Eq.Eq( function ( v ) {
        return function ( v1 ) {
            return v === v1;
        };
    } );

    // Ord instance for Digit.
    var ordDigit = new Data_Ord.Ord( function () {
        return eqDigit;
    }, function ( v ) {
        return function ( v1 ) {
            return Data_Ord.compare( Data_Ord.ordInt )( v )( v1 );
        };
    } );

    // Constants for 0 and 1 digits.
    var _zero = 0;
    var _one = 1;

    // Export helper functions, constants, and instances.
    exports[ "fromInt" ] = fromInt;
    exports[ "toInt" ] = toInt;
    exports[ "fromChar" ] = fromChar;
    exports[ "toChar" ] = toChar;
    exports[ "_zero" ] = _zero;
    exports[ "_one" ] = _one;
    exports[ "eqDigit" ] = eqDigit;
    exports[ "ordDigit" ] = ordDigit;

} )( PS[ "Data.Digit" ] = PS[ "Data.Digit" ] || {} );

// Module: Data.Int
( function ( exports ) {

    "use strict";

    // Converts a number to an integer (if it's a whole number).
    exports.fromNumberImpl = function ( just ) {
        return function ( nothing ) {
            return function ( n ) {
                return ( n | 0 ) === n ? just( n ) : nothing;
            };
        };
    };

    // Converts an integer to a number.
    exports.toNumber = function ( n ) {
        return n;
    };

    // Parses a string to an integer in a given radix.
    exports.fromStringAsImpl = function ( just ) {
        return function ( nothing ) {
            return function ( radix ) {
                var digits;
                if ( radix < 11 ) {
                    digits = "[0-" + ( radix - 1 ).toString() + "]";
                } else if ( radix === 11 ) {
                    digits = "[0-9a]";
                } else {
                    digits = "[0-9a-" + String.fromCharCode( 86 + radix ) + "]";
                }
                var pattern = new RegExp( "^[\\+\\-]?" + digits + "+$", "i" );
                return function ( s ) {
                    if ( pattern.test( s ) ) {
                        var i = parseInt( s, radix );
                        return ( i | 0 ) === i ? just( i ) : nothing;
                    } else {
                        return nothing;
                    }
                };
            };
        };
    };

} )( PS[ "Data.Int" ] = PS[ "Data.Int" ] || {} );

// Module: Global
( function ( exports ) {

    "use strict";

    // Infinity constant.
    exports.infinity = Infinity;

    // Parses a string to a float.
    exports.readFloat = parseFloat;

} )( PS[ "Global" ] = PS[ "Global" ] || {} );

// Module: Global (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions.
    var $foreign = PS[ "Global" ];

    // Export 'infinity' and 'readFloat' from foreign.
    exports[ "infinity" ] = $foreign.infinity;
    exports[ "readFloat" ] = $foreign.readFloat;

} )( PS[ "Global" ] = PS[ "Global" ] || {} );

// Module: Math
( function ( exports ) {

    "use strict";

    // Rounds a number to the nearest integer.
    exports.round = Math.round;

} )( PS[ "Math" ] = PS[ "Math" ] || {} );

// Module: Math (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions.
    var $foreign = PS[ "Math" ];

    // Export 'round' from foreign.
    exports[ "round" ] = $foreign.round;

} )( PS[ "Math" ] = PS[ "Math" ] || {} );

// Module: Data.Int (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.Int" ];
    var Control_Category = PS[ "Control.Category" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Boolean = PS[ "Data.Boolean" ];
    var Data_Bounded = PS[ "Data.Bounded" ];
    var Data_CommutativeRing = PS[ "Data.CommutativeRing" ]; // Not used.
    var Data_DivisionRing = PS[ "Data.DivisionRing" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_EuclideanRing = PS[ "Data.EuclideanRing" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_Int_Bits = PS[ "Data.Int.Bits" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Global = PS[ "Global" ];
    var $$Math = PS[ "Math" ]; // Renamed Math to $$Math to avoid conflict
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Parses a string to an integer in a given radix.
    var fromStringAs = $foreign.fromStringAsImpl( Data_Maybe.Just.create )( Data_Maybe.Nothing.value );

    // Parses a string to an integer (base 10).
    var fromString = fromStringAs( 10 );

    // Converts a number to an integer (if whole).
    var fromNumber = $foreign.fromNumberImpl( Data_Maybe.Just.create )( Data_Maybe.Nothing.value );

    // Unsafely clamps a number to the range of integers.
    var unsafeClamp = function ( x ) {
        if ( x === Global.infinity ) {
            return 0;
        }
        if ( x === -Global.infinity ) {
            return 0;
        }
        if ( x >= $foreign.toNumber( Data_Bounded.top( Data_Bounded.boundedInt ) ) ) {
            return Data_Bounded.top( Data_Bounded.boundedInt );
        }
        if ( x <= $foreign.toNumber( Data_Bounded.bottom( Data_Bounded.boundedInt ) ) ) {
            return Data_Bounded.bottom( Data_Bounded.boundedInt );
        }
        if ( Data_Boolean.otherwise ) {
            return Data_Maybe.fromMaybe( 0 )( fromNumber( x ) );
        }
        throw new Error( "Failed pattern match at Data.Int (line 66, column 1 - line 66, column 29): " + [ x.constructor.name ] );
    };

    // Rounds a number to the nearest integer and clamps it.
    var round = function ( $23 ) {
        return unsafeClamp( $$Math.round( $23 ) );
    };

    // Export helper functions.
    exports[ "fromNumber" ] = fromNumber;
    exports[ "round" ] = round;
    exports[ "fromString" ] = fromString;
    exports[ "fromStringAs" ] = fromStringAs;
    exports[ "toNumber" ] = $foreign.toNumber;

} )( PS[ "Data.Int" ] = PS[ "Data.Int" ] || {} );

// Module: Data.List.Types
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Alt = PS[ "Control.Alt" ]; // Not used.
    var Control_Alternative = PS[ "Control.Alternative" ]; // Not used.
    var Control_Applicative = PS[ "Control.Applicative" ];
    var Control_Apply = PS[ "Control.Apply" ];
    var Control_Bind = PS[ "Control.Bind" ];
    var Control_Comonad = PS[ "Control.Comonad" ]; // Not used.
    var Control_Extend = PS[ "Control.Extend" ]; // Not used.
    var Control_Monad = PS[ "Control.Monad" ]; // Not used.
    var Control_MonadPlus = PS[ "Control.MonadPlus" ]; // Not used.
    var Control_MonadZero = PS[ "Control.MonadZero" ]; // Not used.
    var Control_Plus = PS[ "Control.Plus" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Bifunctor = PS[ "Data.Bifunctor" ]; // Not used.
    var Data_Boolean = PS[ "Data.Boolean" ]; // Not used.
    var Data_Bounded = PS[ "Data.Bounded" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ];
    var Data_Foldable = PS[ "Data.Foldable" ];
    var Data_FoldableWithIndex = PS[ "Data.FoldableWithIndex" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ];
    var Data_Functor = PS[ "Data.Functor" ];
    var Data_Functor_Invariant = PS[ "Data.Functor.Invariant" ]; // Not used.
    var Data_FunctorWithIndex = PS[ "Data.FunctorWithIndex" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Monoid = PS[ "Data.Monoid" ];
    var Data_Newtype = PS[ "Data.Newtype" ]; // Not used.
    var Data_NonEmpty = PS[ "Data.NonEmpty" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ];
    var Data_Ordering = PS[ "Data.Ordering" ];
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ];
    var Data_Semigroup_Foldable = PS[ "Data.Semigroup.Foldable" ]; // Not used.
    var Data_Semigroup_Traversable = PS[ "Data.Semigroup.Traversable" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Data_Traversable = PS[ "Data.Traversable" ]; // Not used.
    var Data_TraversableWithIndex = PS[ "Data.TraversableWithIndex" ]; // Not used.
    var Data_Tuple = PS[ "Data.Tuple" ]; // Not used.
    var Data_Unfoldable = PS[ "Data.Unfoldable" ];
    var Data_Unfoldable1 = PS[ "Data.Unfoldable1" ];
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Data constructors for List type.
    var Nil = function () {
        function Nil() {}
        Nil.value = new Nil();
        return Nil;
    }();
    var Cons = function () {
        function Cons( value0, value1 ) {
            this.value0 = value0;
            this.value1 = value1;
        }
        Cons.create = function ( value0 ) {
            return function ( value1 ) {
                return new Cons( value0, value1 );
            };
        };
        return Cons;
    }();

    // Foldable instance for List.
    var foldableList = new Data_Foldable.Foldable( function ( dictMonoid ) {
        return function ( f ) {
            return Data_Foldable.foldl( foldableList )( function ( acc ) {
                return function ( $174 ) {
                    return Data_Semigroup.append( dictMonoid.Semigroup0() )( acc )( f( $174 ) );
                };
            } )( Data_Monoid.mempty( dictMonoid ) );
        };
    }, function ( f ) {
        var go = function ( $copy_b ) {
            return function ( $copy_v ) {
                var $tco_var_b = $copy_b;
                var $tco_done = false;
                var $tco_result;

                function $tco_loop( b, v ) {
                    if ( v instanceof Nil ) {
                        $tco_done = true;
                        return b;
                    }
                    if ( v instanceof Cons ) {
                        $tco_var_b = f( b )( v.value0 );
                        $copy_v = v.value1;
                        return;
                    }
                    throw new Error( "Failed pattern match at Data.List.Types (line 81, column 12 - line 83, column 30): " + [ v.constructor.name ] );
                }
                while ( !$tco_done ) {
                    $tco_result = $tco_loop( $tco_var_b, $copy_v );
                }
                return $tco_result;
            };
        };
        return go;
    }, function ( f ) {
        return function ( b ) {
            var rev = Data_Foldable.foldl( foldableList )( Data_Function.flip( Cons.create ) )( Nil.value );
            return function ( $175 ) {
                return Data_Foldable.foldl( foldableList )( Data_Function.flip( f ) )( b )( rev( $175 ) );
            };
        };
    } );

    // Functor instance for List.
    var functorList = new Data_Functor.Functor( function ( f ) {
        return Data_Foldable.foldr( foldableList )( function ( x ) {
            return function ( acc ) {
                return new Cons( f( x ), acc );
            };
        } )( Nil.value );
    } );

    // Semigroup instance for List (concatenation).
    var semigroupList = new Data_Semigroup.Semigroup( function ( xs ) {
        return function ( ys ) {
            return Data_Foldable.foldr( foldableList )( Cons.create )( ys )( xs );
        };
    } );

    // Monoid instance for List (empty list is identity).
    var monoidList = new Data_Monoid.Monoid( function () {
        return semigroupList;
    }, Nil.value );

    // Unfoldable1 instance for List.
    var unfoldable1List = new Data_Unfoldable1.Unfoldable1( function ( f ) {
        return function ( b ) {
            var go = function ( $copy_source ) {
                return function ( $copy_memo ) {
                    var $tco_var_source = $copy_source;
                    var $tco_done = false;
                    var $tco_result;

                    function $tco_loop( source, memo ) {
                        var v = f( source );
                        if ( v.value1 instanceof Data_Maybe.Just ) {
                            $tco_var_source = v.value1.value0;
                            $copy_memo = new Cons( v.value0, memo );
                            return;
                        }
                        if ( v.value1 instanceof Data_Maybe.Nothing ) {
                            $tco_done = true;
                            return Data_Foldable.foldl( foldableList )( Data_Function.flip( Cons.create ) )( Nil.value )( new Cons( v.value0, memo ) );
                        }
                        throw new Error( "Failed pattern match at Data.List.Types (line 105, column 22 - line 107, column 61): " + [ v.constructor.name ] );
                    }
                    while ( !$tco_done ) {
                        $tco_result = $tco_loop( $tco_var_source, $copy_memo );
                    }
                    return $tco_result;
                };
            };
            return go( b )( Nil.value );
        };
    } );

    // Unfoldable instance for List.
    var unfoldableList = new Data_Unfoldable.Unfoldable( function () {
        return unfoldable1List;
    }, function ( f ) {
        return function ( b ) {
            var go = function ( $copy_source ) {
                return function ( $copy_memo ) {
                    var $tco_var_source = $copy_source;
                    var $tco_done = false;
                    var $tco_result;

                    function $tco_loop( source, memo ) {
                        var v = f( source );
                        if ( v instanceof Data_Maybe.Nothing ) {
                            $tco_done = true;
                            return Data_Foldable.foldl( foldableList )( Data_Function.flip( Cons.create ) )( Nil.value )( memo );
                        }
                        if ( v instanceof Data_Maybe.Just ) {
                            $tco_var_source = v.value0.value1;
                            $copy_memo = new Cons( v.value0.value0, memo );
                            return;
                        }
                        throw new Error( "Failed pattern match at Data.List.Types (line 112, column 22 - line 114, column 52): " + [ v.constructor.name ] );
                    }
                    while ( !$tco_done ) {
                        $tco_result = $tco_loop( $tco_var_source, $copy_memo );
                    }
                    return $tco_result;
                };
            };
            return go( b )( Nil.value );
        };
    } );

    // Eq1 instance for List.
    var eq1List = new Data_Eq.Eq1( function ( dictEq ) {
        return function ( xs ) {
            return function ( ys ) {
                var go = function ( $copy_v ) {
                    return function ( $copy_v1 ) {
                        return function ( $copy_v2 ) {
                            var $tco_var_v = $copy_v;
                            var $tco_var_v1 = $copy_v1;
                            var $tco_done = false;
                            var $tco_result;

                            function $tco_loop( v, v1, v2 ) {
                                if ( !v2 ) {
                                    $tco_done = true;
                                    return false;
                                }
                                if ( v instanceof Nil && v1 instanceof Nil ) {
                                    $tco_done = true;
                                    return v2;
                                }
                                if ( v instanceof Cons && v1 instanceof Cons ) {
                                    $tco_var_v = v.value1;
                                    $tco_var_v1 = v1.value1;
                                    $copy_v2 = v2 && Data_Eq.eq( dictEq )( v1.value0 )( v.value0 );
                                    return;
                                }
                                $tco_done = true;
                                return false;
                            }
                            while ( !$tco_done ) {
                                $tco_result = $tco_loop( $tco_var_v, $tco_var_v1, $copy_v2 );
                            }
                            return $tco_result;
                        };
                    };
                };
                return go( xs )( ys )( true );
            };
        };
    } );

    // Eq instance for List.
    var eqList = function ( dictEq ) {
        return new Data_Eq.Eq( Data_Eq.eq1( eq1List )( dictEq ) );
    };

    // Ord1 instance for List.
    var ord1List = new Data_Ord.Ord1( function () {
        return eq1List;
    }, function ( dictOrd ) {
        return function ( xs ) {
            return function ( ys ) {
                var go = function ( $copy_v ) {
                    return function ( $copy_v1 ) {
                        var $tco_var_v = $copy_v;
                        var $tco_done = false;
                        var $tco_result;

                        function $tco_loop( v, v1 ) {
                            if ( v instanceof Nil && v1 instanceof Nil ) {
                                $tco_done = true;
                                return Data_Ordering.EQ.value;
                            }
                            if ( v instanceof Nil ) {
                                $tco_done = true;
                                return Data_Ordering.LT.value;
                            }
                            if ( v1 instanceof Nil ) {
                                $tco_done = true;
                                return Data_Ordering.GT.value;
                            }
                            if ( v instanceof Cons && v1 instanceof Cons ) {
                                var v2 = Data_Ord.compare( dictOrd )( v.value0 )( v1.value0 );
                                if ( v2 instanceof Data_Ordering.EQ ) {
                                    $tco_var_v = v.value1;
                                    $copy_v1 = v1.value1;
                                    return;
                                }
                                $tco_done = true;
                                return v2;
                            }
                            throw new Error( "Failed pattern match at Data.List.Types (line 55, column 5 - line 55, column 20): " + [ v.constructor.name, v1.constructor.name ] );
                        }
                        while ( !$tco_done ) {
                            $tco_result = $tco_loop( $tco_var_v, $copy_v1 );
                        }
                        return $tco_result;
                    };
                };
                return go( xs )( ys );
            };
        };
    } );

    // Ord instance for List.
    var ordList = function ( dictOrd ) {
        return new Data_Ord.Ord( function () {
            return eqList( dictOrd.Eq0() );
        }, Data_Ord.compare1( ord1List )( dictOrd ) );
    };

    // Apply instance for List.
    var applyList = new Control_Apply.Apply( function () {
        return functorList;
    }, function ( v ) {
        return function ( v1 ) {
            if ( v instanceof Nil ) {
                return Nil.value;
            }
            if ( v instanceof Cons ) {
                return Data_Semigroup.append( semigroupList )( Data_Functor.map( functorList )( v.value0 )( v1 ) )( Control_Apply.apply( applyList )( v.value1 )( v1 ) );
            }
            throw new Error( "Failed pattern match at Data.List.Types (line 127, column 1 - line 127, column 33): " + [ v.constructor.name, v1.constructor.name ] );
        };
    } );

    // Applicative instance for List.
    var applicativeList = new Control_Applicative.Applicative( function () {
        return applyList;
    }, function ( a ) {
        return new Cons( a, Nil.value );
    } );

    // Export constructors, instances, and helper functions.
    exports[ "Nil" ] = Nil;
    exports[ "Cons" ] = Cons;
    exports[ "eqList" ] = eqList;
    exports[ "eq1List" ] = eq1List;
    exports[ "ordList" ] = ordList;
    exports[ "ord1List" ] = ord1List;
    exports[ "semigroupList" ] = semigroupList;
    exports[ "monoidList" ] = monoidList;
    exports[ "functorList" ] = functorList;
    exports[ "foldableList" ] = foldableList;
    exports[ "unfoldable1List" ] = unfoldable1List;
    exports[ "unfoldableList" ] = unfoldableList;
    exports[ "applyList" ] = applyList;
    exports[ "applicativeList" ] = applicativeList;

} )( PS[ "Data.List.Types" ] = PS[ "Data.List.Types" ] || {} );

// Module: Data.List
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Alt = PS[ "Control.Alt" ]; // Not used.
    var Control_Alternative = PS[ "Control.Alternative" ]; // Not used.
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Apply = PS[ "Control.Apply" ]; // Not used.
    var Control_Bind = PS[ "Control.Bind" ]; // Not used.
    var Control_Category = PS[ "Control.Category" ]; // Not used.
    var Control_Lazy = PS[ "Control.Lazy" ]; // Not used.
    var Control_Monad_Rec_Class = PS[ "Control.Monad.Rec.Class" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Bifunctor = PS[ "Data.Bifunctor" ]; // Not used.
    var Data_Boolean = PS[ "Data.Boolean" ];
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Foldable = PS[ "Data.Foldable" ];
    var Data_FoldableWithIndex = PS[ "Data.FoldableWithIndex" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ];
    var Data_Functor = PS[ "Data.Functor" ];
    var Data_FunctorWithIndex = PS[ "Data.FunctorWithIndex" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_List_Types = PS[ "Data.List.Types" ];
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Monoid = PS[ "Data.Monoid" ]; // Not used.
    var Data_Newtype = PS[ "Data.Newtype" ]; // Not used.
    var Data_NonEmpty = PS[ "Data.NonEmpty" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Data_Traversable = PS[ "Data.Traversable" ]; // Not used.
    var Data_TraversableWithIndex = PS[ "Data.TraversableWithIndex" ]; // Not used.
    var Data_Tuple = PS[ "Data.Tuple" ];
    var Data_Unfoldable = PS[ "Data.Unfoldable" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Splits a list into its head and tail.
    var uncons = function ( v ) {
        if ( v instanceof Data_List_Types.Nil ) {
            return Data_Maybe.Nothing.value;
        }
        if ( v instanceof Data_List_Types.Cons ) {
            return new Data_Maybe.Just( {
                head: v.value0,
                tail: v.value1
            } );
        }
        throw new Error( "Failed pattern match at Data.List (line 259, column 1 - line 259, column 66): " + [ v.constructor.name ] );
    };

    // Splits a list into the longest prefix that satisfies a predicate and the rest.
    var span = function ( v ) {
        return function ( v1 ) {
            if ( v1 instanceof Data_List_Types.Cons && v( v1.value0 ) ) {
                var v2 = span( v )( v1.value1 );
                return {
                    init: new Data_List_Types.Cons( v1.value0, v2.init ),
                    rest: v2.rest
                };
            }
            return {
                init: Data_List_Types.Nil.value,
                rest: v1
            };
        };
    };

    // Reverses a list.
    var reverse = function () {
        var go = function ( $copy_acc ) {
            return function ( $copy_v ) {
                var $tco_var_acc = $copy_acc;
                var $tco_done = false;
                var $tco_result;

                function $tco_loop( acc, v ) {
                    if ( v instanceof Data_List_Types.Nil ) {
                        $tco_done = true;
                        return acc;
                    }
                    if ( v instanceof Data_List_Types.Cons ) {
                        $tco_var_acc = new Data_List_Types.Cons( v.value0, acc );
                        $copy_v = v.value1;
                        return;
                    }
                    throw new Error( "Failed pattern match at Data.List (line 368, column 3 - line 368, column 19): " + [ acc.constructor.name, v.constructor.name ] );
                }
                while ( !$tco_done ) {
                    $tco_result = $tco_loop( $tco_var_acc, $copy_v );
                }
                return $tco_result;
            };
        };
        return go( Data_List_Types.Nil.value );
    }();

    // Takes the first 'n' elements from a list.
    var take = function () {
        var go = function ( $copy_acc ) {
            return function ( $copy_v ) {
                return function ( $copy_v1 ) {
                    var $tco_var_acc = $copy_acc;
                    var $tco_var_v = $copy_v;
                    var $tco_done = false;
                    var $tco_result;

                    function $tco_loop( acc, v, v1 ) {
                        if ( v < 1 ) {
                            $tco_done = true;
                            return reverse( acc );
                        }
                        if ( v1 instanceof Data_List_Types.Nil ) {
                            $tco_done = true;
                            return reverse( acc );
                        }
                        if ( v1 instanceof Data_List_Types.Cons ) {
                            $tco_var_acc = new Data_List_Types.Cons( v1.value0, acc );
                            $tco_var_v = v - 1 | 0;
                            $copy_v1 = v1.value1;
                            return;
                        }
                        throw new Error( "Failed pattern match at Data.List (line 520, column 3 - line 520, column 35): " + [ acc.constructor.name, v.constructor.name, v1.constructor.name ] );
                    }
                    while ( !$tco_done ) {
                        $tco_result = $tco_loop( $tco_var_acc, $tco_var_v, $copy_v1 );
                    }
                    return $tco_result;
                };
            };
        };
        return go( Data_List_Types.Nil.value );
    }();

    // Takes elements from a list while a predicate holds.
    var takeWhile = function ( p ) {
        var go = function ( $copy_acc ) {
            return function ( $copy_v ) {
                var $tco_var_acc = $copy_acc;
                var $tco_done = false;
                var $tco_result;

                function $tco_loop( acc, v ) {
                    if ( v instanceof Data_List_Types.Cons && p( v.value0 ) ) {
                        $tco_var_acc = new Data_List_Types.Cons( v.value0, acc );
                        $copy_v = v.value1;
                        return;
                    }
                    $tco_done = true;
                    return reverse( acc );
                }
                while ( !$tco_done ) {
                    $tco_result = $tco_loop( $tco_var_acc, $copy_v );
                }
                return $tco_result;
            };
        };
        return go( Data_List_Types.Nil.value );
    };

    // Splits a list into all but its last element and the last element.
    var unsnoc = function ( lst ) {
        var go = function ( $copy_v ) {
            return function ( $copy_acc ) {
                var $tco_var_v = $copy_v;
                var $tco_done = false;
                var $tco_result;

                function $tco_loop( v, acc ) {
                    if ( v instanceof Data_List_Types.Nil ) {
                        $tco_done = true;
                        return Data_Maybe.Nothing.value;
                    }
                    if ( v instanceof Data_List_Types.Cons && v.value1 instanceof Data_List_Types.Nil ) {
                        $tco_done = true;
                        return new Data_Maybe.Just( {
                            revInit: acc,
                            last: v.value0
                        } );
                    }
                    if ( v instanceof Data_List_Types.Cons ) {
                        $tco_var_v = v.value1;
                        $copy_acc = new Data_List_Types.Cons( v.value0, acc );
                        return;
                    }
                    throw new Error( "Failed pattern match at Data.List (line 270, column 3 - line 270, column 23): " + [ v.constructor.name, acc.constructor.name ] );
                }
                while ( !$tco_done ) {
                    $tco_result = $tco_loop( $tco_var_v, $copy_acc );
                }
                return $tco_result;
            };
        };
        return Data_Functor.map( Data_Maybe.functorMaybe )( function ( h ) {
            return {
                init: reverse( h.revInit ),
                last: h.last
            };
        } )( go( lst )( Data_List_Types.Nil.value ) );
    };

    // Zips two lists with a function.
    var zipWith = function ( f ) {
        return function ( xs ) {
            return function ( ys ) {
                var go = function ( $copy_v ) {
                    return function ( $copy_v1 ) {
                        return function ( $copy_acc ) {
                            var $tco_var_v = $copy_v;
                            var $tco_var_v1 = $copy_v1;
                            var $tco_done = false;
                            var $tco_result;

                            function $tco_loop( v, v1, acc ) {
                                if ( v instanceof Data_List_Types.Nil ) {
                                    $tco_done = true;
                                    return acc;
                                }
                                if ( v1 instanceof Data_List_Types.Nil ) {
                                    $tco_done = true;
                                    return acc;
                                }
                                if ( v instanceof Data_List_Types.Cons && v1 instanceof Data_List_Types.Cons ) {
                                    $tco_var_v = v.value1;
                                    $tco_var_v1 = v1.value1;
                                    $copy_acc = new Data_List_Types.Cons( f( v.value0 )( v1.value0 ), acc );
                                    return;
                                }
                                throw new Error( "Failed pattern match at Data.List (line 718, column 3 - line 718, column 21): " + [ v.constructor.name, v1.constructor.name, acc.constructor.name ] );
                            }
                            while ( !$tco_done ) {
                                $tco_result = $tco_loop( $tco_var_v, $tco_var_v1, $copy_acc );
                            }
                            return $tco_result;
                        };
                    };
                };
                return reverse( go( xs )( ys )( Data_List_Types.Nil.value ) );
            };
        };
    };

    // Zips two lists into a list of tuples.
    var zip = zipWith( Data_Tuple.Tuple.create );

    // Checks if a list is empty.
    var $$null = function ( v ) {
        if ( v instanceof Data_List_Types.Nil ) {
            return true;
        }
        return false;
    };

    // Maps a function that may return Nothing over a list, discarding Nothings.
    var mapMaybe = function ( f ) {
        var go = function ( $copy_acc ) {
            return function ( $copy_v ) {
                var $tco_var_acc = $copy_acc;
                var $tco_done = false;
                var $tco_result;

                function $tco_loop( acc, v ) {
                    if ( v instanceof Data_List_Types.Nil ) {
                        $tco_done = true;
                        return reverse( acc );
                    }
                    if ( v instanceof Data_List_Types.Cons ) {
                        var v1 = f( v.value0 );
                        if ( v1 instanceof Data_Maybe.Nothing ) {
                            $tco_var_acc = acc;
                            $copy_v = v.value1;
                            return;
                        }
                        if ( v1 instanceof Data_Maybe.Just ) {
                            $tco_var_acc = new Data_List_Types.Cons( v1.value0, acc );
                            $copy_v = v.value1;
                            return;
                        }
                        throw new Error( "Failed pattern match at Data.List (line 419, column 5 - line 421, column 32): " + [ v1.constructor.name ] );
                    }
                    throw new Error( "Failed pattern match at Data.List (line 417, column 3 - line 417, column 27): " + [ acc.constructor.name, v.constructor.name ] );
                }
                while ( !$tco_done ) {
                    $tco_result = $tco_loop( $tco_var_acc, $copy_v );
                }
                return $tco_result;
            };
        };
        return go( Data_List_Types.Nil.value );
    };

    // Returns the length of a list.
    var length = Data_Foldable.foldl( Data_List_Types.foldableList )( function ( acc ) {
        return function ( v ) {
            return acc + 1 | 0;
        };
    } )( 0 );

    // Gets the last element of a list (if any).
    var last = function ( $copy_v ) {
        var $tco_done = false;
        var $tco_result;

        function $tco_loop( v ) {
            if ( v instanceof Data_List_Types.Cons && v.value1 instanceof Data_List_Types.Nil ) {
                $tco_done = true;
                return new Data_Maybe.Just( v.value0 );
            }
            if ( v instanceof Data_List_Types.Cons ) {
                $copy_v = v.value1;
                return;
            }
            $tco_done = true;
            return Data_Maybe.Nothing.value;
        }
        while ( !$tco_done ) {
            $tco_result = $tco_loop( $copy_v );
        }
        return $tco_result;
    };

    // Inserts an element at a specific index in a list.
    var insertAt = function ( v ) {
        return function ( v1 ) {
            return function ( v2 ) {
                if ( v === 0 ) {
                    return new Data_Maybe.Just( new Data_List_Types.Cons( v1, v2 ) );
                }
                if ( v2 instanceof Data_List_Types.Cons ) {
                    return Data_Functor.map( Data_Maybe.functorMaybe )( function ( v3 ) {
                        return new Data_List_Types.Cons( v2.value0, v3 );
                    } )( insertAt( v - 1 | 0 )( v1 )( v2.value1 ) );
                }
                return Data_Maybe.Nothing.value;
            };
        };
    };

    // Gets all but the last element of a list (if any).
    var init = function ( lst ) {
        return Data_Functor.map( Data_Maybe.functorMaybe )( function ( v ) {
            return v.init;
        } )( unsnoc( lst ) );
    };

    // Creates a list from a Foldable.
    var fromFoldable = function ( dictFoldable ) {
        return Data_Foldable.foldr( dictFoldable )( Data_List_Types.Cons.create )( Data_List_Types.Nil.value );
    };

    // Filters a list based on a predicate.
    var filter = function ( p ) {
        var go = function ( $copy_acc ) {
            return function ( $copy_v ) {
                var $tco_var_acc = $copy_acc;
                var $tco_done = false;
                var $tco_result;

                function $tco_loop( acc, v ) {
                    if ( v instanceof Data_List_Types.Nil ) {
                        $tco_done = true;
                        return reverse( acc );
                    }
                    if ( v instanceof Data_List_Types.Cons ) {
                        if ( p( v.value0 ) ) {
                            $tco_var_acc = new Data_List_Types.Cons( v.value0, acc );
                            $copy_v = v.value1;
                            return;
                        }
                        if ( Data_Boolean.otherwise ) {
                            $tco_var_acc = acc;
                            $copy_v = v.value1;
                            return;
                        }
                    }
                    throw new Error( "Failed pattern match at Data.List (line 390, column 3 - line 390, column 27): " + [ acc.constructor.name, v.constructor.name ] );
                }
                while ( !$tco_done ) {
                    $tco_result = $tco_loop( $tco_var_acc, $copy_v );
                }
                return $tco_result;
            };
        };
        return go( Data_List_Types.Nil.value );
    };

    // Drops elements from a list while a predicate holds.
    var dropWhile = function ( p ) {
        var go = function ( $copy_v ) {
            var $tco_done = false;
            var $tco_result;

            function $tco_loop( v ) {
                if ( v instanceof Data_List_Types.Cons && p( v.value0 ) ) {
                    $copy_v = v.value1;
                    return;
                }
                $tco_done = true;
                return v;
            }
            while ( !$tco_done ) {
                $tco_result = $tco_loop( $copy_v );
            }
            return $tco_result;
        };
        return go;
    };

    // Drops the first 'n' elements from a list.
    var drop = function ( $copy_v ) {
        return function ( $copy_v1 ) {
            var $tco_var_v = $copy_v;
            var $tco_done = false;
            var $tco_result;

            function $tco_loop( v, v1 ) {
                if ( v < 1 ) {
                    $tco_done = true;
                    return v1;
                }
                if ( v1 instanceof Data_List_Types.Nil ) {
                    $tco_done = true;
                    return Data_List_Types.Nil.value;
                }
                if ( v1 instanceof Data_List_Types.Cons ) {
                    $tco_var_v = v - 1 | 0;
                    $copy_v1 = v1.value1;
                    return;
                }
                throw new Error( "Failed pattern match at Data.List (line 543, column 1 - line 543, column 42): " + [ v.constructor.name, v1.constructor.name ] );
            }
            while ( !$tco_done ) {
                $tco_result = $tco_loop( $tco_var_v, $copy_v1 );
            }
            return $tco_result;
        };
    };

    // Export helper functions.
    exports[ "fromFoldable" ] = fromFoldable;
    exports[ "null" ] = $$null;
    exports[ "length" ] = length;
    exports[ "last" ] = last;
    exports[ "init" ] = init;
    exports[ "uncons" ] = uncons;
    exports[ "unsnoc" ] = unsnoc;
    exports[ "insertAt" ] = insertAt;
    exports[ "reverse" ] = reverse;
    exports[ "filter" ] = filter;
    exports[ "mapMaybe" ] = mapMaybe;
    exports[ "take" ] = take;
    exports[ "takeWhile" ] = takeWhile;
    exports[ "drop" ] = drop;
    exports[ "dropWhile" ] = dropWhile;
    exports[ "span" ] = span;
    exports[ "zipWith" ] = zipWith;
    exports[ "zip" ] = zip;

} )( PS[ "Data.List" ] = PS[ "Data.List" ] || {} );

// Module: Data.String.CodeUnits
( function ( exports ) {

    "use strict";

    // Converts a string to an array of characters.
    exports.toCharArray = function ( s ) {
        return s.split( "" );
    };

    // Creates a string from a single character.
    exports.singleton = function ( c ) {
        return c;
    };

    // Returns the length of a string.
    exports.length = function ( s ) {
        return s.length;
    };

    // Counts the number of characters at the beginning of a string that satisfy a predicate.
    exports.countPrefix = function ( p ) {
        return function ( s ) {
            var i = 0;
            while ( i < s.length && p( s.charAt( i ) ) ) {
                i++;
            }
            return i;
        };
    };

    // Finds the first occurrence of a substring.
    exports._indexOf = function ( just ) {
        return function ( nothing ) {
            return function ( x ) {
                return function ( s ) {
                    var i = s.indexOf( x );
                    return i === -1 ? nothing : just( i );
                };
            };
        };
    };

    // Takes the first 'n' characters from a string.
    exports.take = function ( n ) {
        return function ( s ) {
            return s.substr( 0, n );
        };
    };

    // Drops the first 'n' characters from a string.
    exports.drop = function ( n ) {
        return function ( s ) {
            return s.substring( n );
        };
    };

} )( PS[ "Data.String.CodeUnits" ] = PS[ "Data.String.CodeUnits" ] || {} );

// Module: Data.String.CodeUnits (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.String.CodeUnits" ];
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Boolean = PS[ "Data.Boolean" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ]; // Not used.
    var Data_String_Pattern = PS[ "Data.String.Pattern" ]; // Not used.
    var Data_String_Unsafe = PS[ "Data.String.Unsafe" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Takes characters from a string while a predicate holds.
    var takeWhile = function ( p ) {
        return function ( s ) {
            return $foreign.take( $foreign.countPrefix( p )( s ) )( s );
        };
    };

    // Finds the first index of a substring.
    var indexOf = $foreign[ "_indexOf" ]( Data_Maybe.Just.create )( Data_Maybe.Nothing.value );

    // Removes a prefix from a string if it exists.
    var stripPrefix = function ( v ) {
        return function ( str ) {
            var v1 = indexOf( v )( str );
            if ( v1 instanceof Data_Maybe.Just && v1.value0 === 0 ) {
                return Data_Maybe.Just.create( $foreign.drop( $foreign.length( v ) )( str ) );
            }
            return Data_Maybe.Nothing.value;
        };
    };

    // Checks if a string contains a substring.
    var contains = function ( pat ) {
        return function ( $16 ) {
            return Data_Maybe.isJust( indexOf( pat )( $16 ) );
        };
    };

    // Export helper functions and foreign functions.
    exports[ "stripPrefix" ] = stripPrefix;
    exports[ "contains" ] = contains;
    exports[ "indexOf" ] = indexOf;
    exports[ "takeWhile" ] = takeWhile;
    exports[ "singleton" ] = $foreign.singleton;
    exports[ "toCharArray" ] = $foreign.toCharArray;

} )( PS[ "Data.String.CodeUnits" ] = PS[ "Data.String.CodeUnits" ] || {} );

// Module: Effect.Exception
( function ( exports ) {

    "use strict";

    // Creates a new Error object.
    exports.error = function ( msg ) {
        return new Error( msg );
    };

    // Throws an exception.
    exports.throwException = function ( e ) {
        return function () {
            throw e;
        };
    };

} )( PS[ "Effect.Exception" ] = PS[ "Effect.Exception" ] || {} );

// Module: Effect.Exception (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Effect.Exception" ];
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Either = PS[ "Data.Either" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Effect = PS[ "Effect" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Export foreign functions.
    exports[ "error" ] = $foreign.error;
    exports[ "throwException" ] = $foreign.throwException;

} )( PS[ "Effect.Exception" ] = PS[ "Effect.Exception" ] || {} );

// Module: Effect.Unsafe
( function ( exports ) {

    "use strict";

    // Unsafely performs an effect.
    exports.unsafePerformEffect = function ( f ) {
        return f();
    };

} )( PS[ "Effect.Unsafe" ] = PS[ "Effect.Unsafe" ] || {} );

// Module: Effect.Unsafe (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Effect.Unsafe" ];
    var Effect = PS[ "Effect" ]; // Not used.

    // Export foreign function.
    exports[ "unsafePerformEffect" ] = $foreign.unsafePerformEffect;

} )( PS[ "Effect.Unsafe" ] = PS[ "Effect.Unsafe" ] || {} );

// Module: Effect.Exception.Unsafe
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Effect_Exception = PS[ "Effect.Exception" ];
    var Effect_Unsafe = PS[ "Effect.Unsafe" ];

    // Unsafely throws an exception.
    var unsafeThrowException = function ( $0 ) {
        return Effect_Unsafe.unsafePerformEffect( Effect_Exception.throwException( $0 ) );
    };

    // Unsafely throws an error with a message.
    var unsafeThrow = function ( $1 ) {
        return unsafeThrowException( Effect_Exception.error( $1 ) );
    };

    // Export unsafe functions.
    exports[ "unsafeThrowException" ] = unsafeThrowException;
    exports[ "unsafeThrow" ] = unsafeThrow;

} )( PS[ "Effect.Exception.Unsafe" ] = PS[ "Effect.Exception.Unsafe" ] || {} );

// Module: Data.HugeNum
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Applicative = PS[ "Control.Applicative" ];
    var Control_Bind = PS[ "Control.Bind" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Boolean = PS[ "Data.Boolean" ];
    var Data_Digit = PS[ "Data.Digit" ];
    var Data_Eq = PS[ "Data.Eq" ];
    var Data_EuclideanRing = PS[ "Data.EuclideanRing" ]; // Not used.
    var Data_Foldable = PS[ "Data.Foldable" ];
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ];
    var Data_Generic_Rep = PS[ "Data.Generic.Rep" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ];
    var Data_Int = PS[ "Data.Int" ];
    var Data_List = PS[ "Data.List" ];
    var Data_List_Types = PS[ "Data.List.Types" ];
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Monoid = PS[ "Data.Monoid" ];
    var Data_Ord = PS[ "Data.Ord" ];
    var Data_Ordering = PS[ "Data.Ordering" ];
    var Data_Ring = PS[ "Data.Ring" ];
    var Data_Semigroup = PS[ "Data.Semigroup" ];
    var Data_Semiring = PS[ "Data.Semiring" ];
    var Data_Show = PS[ "Data.Show" ];
    var Data_String = PS[ "Data.String" ]; // Not used.
    var Data_String_CodeUnits = PS[ "Data.String.CodeUnits" ];
    var Data_String_Pattern = PS[ "Data.String.Pattern" ]; // Not used.
    var Data_Traversable = PS[ "Data.Traversable" ]; // Not used.
    var Data_Tuple = PS[ "Data.Tuple" ];
    var Data_Unfoldable = PS[ "Data.Unfoldable" ];
    var Effect_Exception_Unsafe = PS[ "Effect.Exception.Unsafe" ];
    var Global = PS[ "Global" ];
    var Partial_Unsafe = PS[ "Partial.Unsafe" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Data constructors for sign.
    var Plus = function () {
        function Plus() {}
        Plus.value = new Plus();
        return Plus;
    }();
    var Minus = function () {
        function Minus() {}
        Minus.value = new Minus();
        return Minus;
    }();

    // Data constructors for number types.
    var Float = function () {
        function Float() {}
        Float.value = new Float();
        return Float;
    }();
    var Integral = function () {
        function Integral() {}
        Integral.value = new Integral();
        return Integral;
    }();
    var Scientific = function () {
        function Scientific() {}
        Scientific.value = new Scientific();
        return Scientific;
    }();

    // Represents the number zero in HugeNum format.
    var zeroHugeNum = {
        digits: new Data_List_Types.Cons( Data_Digit[ "_zero" ], new Data_List_Types.Cons( Data_Digit[ "_zero" ], Data_List_Types.Nil.value ) ),
        decimal: 1,
        sign: Plus.value
    };

    // Removes leading zeroes from a list of digits.
    var unsafeRemoveFrontZeroes = Data_List.dropWhile( function ( v ) {
        return Data_Eq.eq( Data_Digit.eqDigit )( v )( Data_Digit[ "_zero" ] );
    } );

    // Checks if the fractional part of a HugeNum is trivial (all zeroes).
    var trivialFraction = function ( v ) {
        var decimals = Data_List.reverse( Data_List.drop( v.decimal )( v.digits ) );
        var meaty = Data_List.dropWhile( function ( v1 ) {
            return Data_Eq.eq( Data_Digit.eqDigit )( v1 )( Data_Digit[ "_zero" ] );
        } )( decimals );
        return Data_List[ "null" ]( meaty );
    };

    // Converts a HugeNum to its string representation.
    var toString = function ( v ) {
        var sign = function () {
            if ( v.sign instanceof Plus ) {
                return Data_Monoid.mempty( Data_List_Types.monoidList );
            }
            if ( v.sign instanceof Minus ) {
                return Control_Applicative.pure( Data_List_Types.applicativeList )( "-" );
            }
            throw new Error( "Failed pattern match at Data.HugeNum (line 174, column 14 - line 176, column 49): " + [ v.sign.constructor.name ] );
        }();
        var charray = Data_Functor.map( Data_List_Types.functorList )( Data_Digit.toChar )( v.digits );
        var numray = Data_Maybe.fromJust()( Data_List.insertAt( v.decimal )( "." )( charray ) );
        return Data_Foldable.foldMap( Data_List_Types.foldableList )( Data_Monoid.monoidString )( Data_String_CodeUnits.singleton )( Data_Semigroup.append( Data_List_Types.semigroupList )( sign )( numray ) );
    };

    // Multiplies two signs.
    var timesSign = function ( v ) {
        return function ( v1 ) {
            if ( v instanceof Plus && v1 instanceof Plus ) {
                return Plus.value;
            }
            if ( v instanceof Minus && v1 instanceof Minus ) {
                return Plus.value;
            }
            return Minus.value;
        };
    };

    // Removes leading and trailing zeroes from a list of digits.
    var takeMeatyParts = function ( arr ) {
        return Data_List.reverse( Data_List.dropWhile( function ( v ) {
            return Data_Eq.eq( Data_Digit.eqDigit )( v )( Data_Digit[ "_zero" ] );
        } )( Data_List.reverse( arr ) ) );
    };

    // Multiplies a HugeNum by a power of ten.
    var timesPowOfTen = function ( n ) {
        return function ( v ) {
            var newDecimal = v.decimal + n | 0;
            var newZeroesLength = function () {
                var $97 = newDecimal >= Data_List.length( takeMeatyParts( v.digits ) );
                if ( $97 ) {
                    return newDecimal - Data_List.length( takeMeatyParts( v.digits ) ) | 0;
                }
                return 0;
            }();
            var newZeroes = Data_Unfoldable.replicate( Data_List_Types.unfoldableList )( newZeroesLength )( Data_Digit[ "_zero" ] );
            var z = {
                digits: Data_Semigroup.append( Data_List_Types.semigroupList )( v.digits )( newZeroes ),
                sign: v.sign,
                decimal: newDecimal
            };
            return z;
        };
    };

    // Checks if a HugeNum is "small enough" for direct multiplication.
    var smallEnough = function ( v ) {
        if ( v.decimal === 1 && Data_List.length( v.digits ) === 2 ) {
            return true;
        }
        return false;
    };

    // Identity function for recursion.
    var rec = function ( v ) {
        return v;
    };

    // Parses a scientific notation number into its components.
    var parseScientific = function ( n ) {
        var split = Data_List.span( function ( v ) {
            return v !== "e";
        } )( Data_List.fromFoldable( Data_Foldable.foldableArray )( Data_String_CodeUnits.toCharArray( Data_Show.show( Data_Show.showNumber )( n ) ) ) );
        var signSplit = Data_Maybe.fromJust()( Data_List.uncons( Data_List.drop( 1 )( split.rest ) ) );
        var sign = function () {
            var $102 = n < 0;
            if ( $102 ) {
                return Minus.value;
            }
            return Plus.value;
        }();
        var exponent = Data_Int.round( Global.readFloat( Data_Foldable.foldMap( Data_List_Types.foldableList )( Data_Monoid.monoidString )( Data_String_CodeUnits.singleton )( signSplit.tail ) ) );
        var expSign = function () {
            if ( signSplit.head === "+" ) {
                return Plus.value;
            }
            return Minus.value;
        }();
        var base = Data_List.filter( function ( v ) {
            return v !== ".";
        } )( split.init );
        var z = {
            exponent: exponent,
            expSign: expSign,
            base: base,
            sign: sign
        };
        return z;
    };

    // Parses a number with positive exponent and positive sign.
    var parsePlusPlus = function ( exp ) {
        return function ( base ) {
            var zeroCardinality = ( exp - Data_List.length( base ) | 0 ) + 2 | 0;
            var zeroes = Data_Unfoldable.replicate( Data_List_Types.unfoldableList )( zeroCardinality )( Data_Digit[ "_zero" ] );
            var digits = Data_Semigroup.append( Data_List_Types.semigroupList )( Data_List.mapMaybe( Data_Digit.fromChar )( base ) )( zeroes );
            var decimal = 1 + exp | 0;
            var r = {
                digits: digits,
                decimal: decimal,
                sign: Plus.value
            };
            return r;
        };
    };

    // Parses a number with positive exponent and negative sign.
    var parsePlusMinus = function ( exp ) {
        return function ( base ) {
            var r = parsePlusPlus( exp )( base );
            return {
                digits: Data_Semigroup.append( Data_List_Types.semigroupList )( r.digits )( Control_Applicative.pure( Data_List_Types.applicativeList )( Data_Digit[ "_zero" ] ) ),
                decimal: r.decimal,
                sign: Minus.value
            };
        };
    };

    // Determines the type of a number (Float, Integral, Scientific).
    var parseNumber = function ( n ) {
        if ( Data_String_CodeUnits.contains( "e" )( Data_Show.show( Data_Show.showNumber )( n ) ) ) {
            return Scientific.value;
        }
        if ( Data_String_CodeUnits.contains( "." )( Data_Show.show( Data_Show.showNumber )( n ) ) ) {
            return Float.value;
        }
        if ( Data_Boolean.otherwise ) {
            return Integral.value;
        }
        throw new Error( "Failed pattern match at Data.HugeNum (line 204, column 1 - line 204, column 37): " + [ n.constructor.name ] );
    };

    // Parses a number with negative exponent and positive sign.
    var parseMinusPlus = function ( exp ) {
        return function ( base ) {
            var zeroes = Data_Unfoldable.replicate( Data_List_Types.unfoldableList )( exp )( Data_Digit[ "_zero" ] );
            var digits = Data_Semigroup.append( Data_List_Types.semigroupList )( zeroes )( Data_List.mapMaybe( Data_Digit.fromChar )( base ) );
            var r = {
                digits: digits,
                decimal: 1,
                sign: Plus.value
            };
            return r;
        };
    };

    // Parses a number with negative exponent and negative sign.
    var parseMinusMinus = function ( exp ) {
        return function ( base ) {
            var r = parseMinusPlus( exp )( base );
            return {
                digits: r.digits,
                decimal: r.decimal,
                sign: Minus.value
            };
        };
    };

    // Converts a scientific notation number to HugeNum.
    var scientificToHugeNum = function ( n ) {
        var parsed = parseScientific( n );
        var r = function () {
            if ( parsed.expSign instanceof Plus ) {
                if ( parsed.sign instanceof Plus ) {
                    return parsePlusPlus( parsed.exponent )( parsed.base );
                }
                return parsePlusMinus( parsed.exponent )( parsed.base );
            }
            if ( parsed.sign instanceof Plus ) {
                return parseMinusPlus( parsed.exponent )( parsed.base );
            }
            return parseMinusMinus( parsed.exponent )( parsed.base );
        }();
        return r;
    };

    // Represents the number one in HugeNum format.
    var oneHugeNum = {
        digits: new Data_List_Types.Cons( Data_Digit[ "_one" ], new Data_List_Types.Cons( Data_Digit[ "_zero" ], Data_List_Types.Nil.value ) ),
        decimal: 1,
        sign: Plus.value
    };

    // Negates a HugeNum.
    var neg = function ( v ) {
        if ( v.sign instanceof Minus ) {
            return {
                digits: v.digits,
                decimal: v.decimal,
                sign: Plus.value
            };
        }
        return {
            digits: v.digits,
            decimal: v.decimal,
            sign: Minus.value
        };
    };

    // Returns the number of "meaty" (non-zero) fractional digits.
    var meatyDecimals = function ( v ) {
        var decimals = Data_List.reverse( Data_List.drop( v.decimal )( v.digits ) );
        var meaty = Data_List.dropWhile( function ( v1 ) {
            return Data_Eq.eq( Data_Digit.eqDigit )( v1 )( Data_Digit[ "_zero" ] );
        } )( decimals );
        return Data_List.length( meaty );
    };

    // Internal helper to make a HugeNum an integer.
    var makeHugeInteger$prime = function ( v ) {
        var digits = Data_Semigroup.append( Data_List_Types.semigroupList )( unsafeRemoveFrontZeroes( v.digits ) )( Control_Applicative.pure( Data_List_Types.applicativeList )( Data_Digit[ "_zero" ] ) );
        var decimal = Data_List.length( digits ) - 1 | 0;
        var z = {
            digits: digits,
            decimal: decimal,
            sign: v.sign
        };
        return z;
    };

    // Checks if the first HugeNum has less precision than the second.
    var lessPrecise = function ( v ) {
        return function ( v1 ) {
            return Data_List.length( Data_List.drop( v.decimal )( v.digits ) ) < Data_List.length( Data_List.drop( v1.decimal )( v1.digits ) );
        };
    };

    // Checks if a HugeNum represents zero.
    var isZero = function ( v ) {
        return Data_Foldable.all( Data_List_Types.foldableList )( Data_HeytingAlgebra.heytingAlgebraBoolean )( function ( v1 ) {
            return Data_Eq.eq( Data_Digit.eqDigit )( v1 )( Data_Digit[ "_zero" ] );
        } )( v.digits );
    };

    // Checks if a HugeNum is positive.
    var isPositive = function ( v ) {
        if ( v.sign instanceof Plus ) {
            return true;
        }
        return false;
    };

    // Checks if a HugeNum is negative.
    var isNegative = function ( v ) {
        if ( v.sign instanceof Minus ) {
            return true;
        }
        return false;
    };

    // Checks if a HugeNum is an integer.
    var isHugeInteger = function ( v ) {
        return Data_Foldable.all( Data_List_Types.foldableList )( Data_HeytingAlgebra.heytingAlgebraBoolean )( function ( v1 ) {
            return Data_Eq.eq( Data_Digit.eqDigit )( v1 )( Data_Digit[ "_zero" ] );
        } )( Data_List.drop( v.decimal )( v.digits ) );
    };

    // Converts a HugeNum to an integer if possible, otherwise makes it one.
    var makeHugeInteger = function ( r ) {
        var $122 = isHugeInteger( r );
        if ( $122 ) {
            return r;
        }
        return makeHugeInteger$prime( r );
    };

    // Converts an integer to HugeNum.
    var integralToHugeNum = function ( n ) {
        var sign = function () {
            var $123 = n < 0;
            if ( $123 ) {
                return Minus.value;
            }
            return Plus.value;
        }();
        var integral = Data_List.fromFoldable( Data_Foldable.foldableArray )( Data_String_CodeUnits.toCharArray( Data_Show.show( Data_Show.showNumber )( n ) ) );
        var fractional = Control_Applicative.pure( Data_List_Types.applicativeList )( Data_Digit[ "_zero" ] );
        var decimal = function () {
            if ( sign instanceof Minus ) {
                return Data_List.length( integral ) - 1 | 0;
            }
            return Data_List.length( integral );
        }();
        return {
            digits: Data_Semigroup.append( Data_List_Types.semigroupList )( Data_List.mapMaybe( Data_Digit.fromChar )( integral ) )( fractional ),
            decimal: decimal,
            sign: sign
        };
    };

    // Returns the integer part of a HugeNum.
    var integerPart = function ( v ) {
        return {
            digits: Data_Semigroup.append( Data_List_Types.semigroupList )( Data_List.take( v.decimal )( v.digits ) )( Control_Applicative.pure( Data_List_Types.applicativeList )( Data_Digit[ "_zero" ] ) ),
            decimal: v.decimal,
            sign: v.sign
        };
    };

    // Converts a float to HugeNum.
    var floatToHugeNum = function ( n ) {
        var sign = function () {
            var $138 = n < 0;
            if ( $138 ) {
                return Minus.value;
            }
            return Plus.value;
        }();
        var pos = n >= 0;
        var split = function () {
            if ( pos ) {
                return Data_List.span( function ( v ) {
                    return v !== ".";
                } )( Data_List.fromFoldable( Data_Foldable.foldableArray )( Data_String_CodeUnits.toCharArray( Data_Show.show( Data_Show.showNumber )( n ) ) ) );
            }
            return Data_List.span( function ( v ) {
                return v !== ".";
            } )( Data_List.drop( 1 )( Data_List.fromFoldable( Data_Foldable.foldableArray )( Data_String_CodeUnits.toCharArray( Data_Show.show( Data_Show.showNumber )( n ) ) ) ) );
        }();
        var small = Data_List.drop( 1 )( split.rest );
        var decimal = Data_List.length( split.init );
        var digits = Data_List.mapMaybe( Data_Digit.fromChar )( Data_Semigroup.append( Data_List_Types.semigroupList )( split.init )( small ) );
        var r = {
            digits: digits,
            decimal: decimal,
            sign: sign
        };
        return r;
    };

    // Converts a number to HugeNum, handling different types.
    var fromNumber = function ( n ) {
        var v = parseNumber( n );
        if ( v instanceof Float ) {
            return floatToHugeNum( n );
        }
        if ( v instanceof Scientific ) {
            return scientificToHugeNum( n );
        }
        if ( v instanceof Integral ) {
            return integralToHugeNum( n );
        }
        throw new Error( "Failed pattern match at Data.HugeNum (line 283, column 16 - line 286, column 52): " + [ v.constructor.name ] );
    };

    // Eq instance for Sign.
    var eqSign = new Data_Eq.Eq( function ( v ) {
        return function ( v1 ) {
            if ( v instanceof Plus && v1 instanceof Plus ) {
                return true;
            }
            if ( v instanceof Minus && v1 instanceof Minus ) {
                return true;
            }
            return false;
        };
    } );

    // Ord instance for Sign.
    var ordSign = new Data_Ord.Ord( function () {
        return eqSign;
    }, function ( v ) {
        return function ( v1 ) {
            if ( v instanceof Plus && v1 instanceof Minus ) {
                return Data_Ordering.GT.value;
            }
            if ( v instanceof Minus && v1 instanceof Plus ) {
                return Data_Ordering.LT.value;
            }
            return Data_Ordering.EQ.value;
        };
    } );

    // Checks for strict equality of two HugeNums (including zeroes).
    var strictlyEqual = function ( v ) {
        return function ( v1 ) {
            return v.decimal === v1.decimal && ( Data_Eq.eq( Data_List_Types.eqList( Data_Digit.eqDigit ) )( v.digits )( v1.digits ) && Data_Eq.eq( eqSign )( v.sign )( v1.sign ) );
        };
    };

    // Removes leading and trailing zeroes from a HugeNum's digits.
    var dropZeroes = function () {
        var dropIntegralZeroes = function ( v ) {
            var integralPart = Data_List.take( v.decimal )( v.digits );
            var zeroes = Data_List.takeWhile( function ( v1 ) {
                return Data_Eq.eq( Data_Digit.eqDigit )( v1 )( Data_Digit[ "_zero" ] );
            } )( integralPart );
            var digits = function () {
                var $148 = Data_List.length( integralPart ) === Data_List.length( zeroes );
                if ( $148 ) {
                    return Control_Applicative.pure( Data_List_Types.applicativeList )( Data_Digit[ "_zero" ] );
                }
                return Data_List.drop( Data_List.length( zeroes ) )( integralPart );
            }();
            var decimal = Data_List.length( digits );
            var z = {
                digits: Data_Semigroup.append( Data_List_Types.semigroupList )( digits )( Data_List.drop( v.decimal )( v.digits ) ),
                decimal: decimal,
                sign: v.sign
            };
            return z;
        };
        var dropFractionalZeroes = function ( v ) {
            var fractionalDigits = Data_List.reverse( Data_List.drop( v.decimal )( v.digits ) );
            var meatyFraction = Data_List.dropWhile( function ( v1 ) {
                return Data_Eq.eq( Data_Digit.eqDigit )( v1 )( Data_Digit[ "_zero" ] );
            } )( fractionalDigits );
            var digits = Data_List.reverse( meatyFraction );
            var z = {
                digits: Data_Semigroup.append( Data_List_Types.semigroupList )( Data_List.take( v.decimal )( v.digits ) )( function () {
                    var $150 = Data_List[ "null" ]( digits );
                    if ( $150 ) {
                        return Control_Applicative.pure( Data_List_Types.applicativeList )( Data_Digit[ "_zero" ] );
                    }
                    return digits;
                }() ),
                decimal: v.decimal,
                sign: v.sign
            };
            return z;
        };
        return function ( $213 ) {
            return dropIntegralZeroes( dropFractionalZeroes( $213 ) );
        };
    }();

    // Eq instance for HugeNum.
    var eqHugeNum = new Data_Eq.Eq( function ( x ) {
        return function ( y ) {
            if ( isZero( x ) && isZero( y ) ) {
                return true;
            }
            if ( Data_Boolean.otherwise ) {
                return strictlyEqual( dropZeroes( x ) )( dropZeroes( y ) );
            }
            throw new Error( "Failed pattern match at Data.HugeNum (line 75, column 1 - line 75, column 33): " + [ x.constructor.name, y.constructor.name ] );
        };
    } );

    // Digit-wise subtraction helper.
    var digitwiseSubtract = function ( v ) {
        return function ( v1 ) {
            var tint = Data_Digit.toInt( v1.value0 ) - Data_Digit.toInt( v.value1 ) | 0;
            var bint = Data_Digit.toInt( v1.value1 );
            var diff$prime = tint - bint | 0;
            var diff = Data_Maybe.fromJust()( Data_Digit.fromInt( function () {
                var $155 = diff$prime < 0;
                if ( $155 ) {
                    return diff$prime + 10 | 0;
                }
                return diff$prime;
            }() ) );
            var spill = function () {
                var $156 = diff$prime < 0;
                if ( $156 ) {
                    return Data_Digit[ "_one" ];
                }
                return Data_Digit[ "_zero" ];
            }();
            return new Data_Tuple.Tuple( new Data_List_Types.Cons( diff, v.value0 ), spill );
        };
    };

    // Digit-wise addition helper.
    var digitwiseAdd = function ( v ) {
        return function ( v1 ) {
            var tint = Data_Digit.toInt( v1.value0 ) + Data_Digit.toInt( v.value1 ) | 0;
            var bint = Data_Digit.toInt( v1.value1 );
            var summ$prime = tint + bint | 0;
            var spill = function () {
                var $163 = summ$prime > 9;
                if ( $163 ) {
                    return Data_Digit[ "_one" ];
                }
                return Data_Digit[ "_zero" ];
            }();
            var summ = Data_Maybe.fromJust()( Data_Digit.fromInt( function () {
                var $164 = summ$prime > 9;
                if ( $164 ) {
                    return summ$prime - 10 | 0;
                }
                return summ$prime;
            }() ) );
            return new Data_Tuple.Tuple( new Data_List_Types.Cons( summ, v.value0 ), spill );
        };
    };

    // Makes two HugeNums have the same number of integral and fractional digits.
    var equivalize = function () {
        var integralize = function ( v ) {
            if ( Data_List.length( Data_List.take( v.fst.decimal )( v.fst.digits ) ) === Data_List.length( Data_List.take( v.snd.decimal )( v.snd.digits ) ) ) {
                return {
                    fst: v.fst,
                    snd: v.snd
                };
            }
            if ( Data_Boolean.otherwise ) {
                var lesser = rec( Data_Ord.min( ordHugeNum )( abs( v.fst ) )( abs( v.snd ) ) );
                var greater = rec( Data_Ord.max( ordHugeNum )( abs( v.fst ) )( abs( v.snd ) ) );
                var zeroesLength = Data_List.length( Data_List.take( greater.decimal )( greater.digits ) ) - Data_List.length( Data_List.take( lesser.decimal )( lesser.digits ) ) | 0;
                var zeroes = Data_Unfoldable.replicate( Data_List_Types.unfoldableList )( zeroesLength )( Data_Digit[ "_zero" ] );
                var lesser$prime = {
                    digits: Data_Semigroup.append( Data_List_Types.semigroupList )( zeroes )( lesser.digits ),
                    decimal: greater.decimal,
                    sign: lesser.sign
                };
                var z = {
                    fst: lesser$prime,
                    snd: greater
                };
                return z;
            }
            throw new Error( "Failed pattern match at Data.HugeNum (line 150, column 3 - line 158, column 57): " + [ v.constructor.name ] );
        };
        var fractionalize = function ( v ) {
            if ( Data_List.length( Data_List.drop( v.fst.decimal )( v.fst.digits ) ) === Data_List.length( Data_List.drop( v.snd.decimal )( v.snd.digits ) ) ) {
                return {
                    fst: v.fst,
                    snd: v.snd
                };
            }
            if ( Data_Boolean.otherwise ) {
                var test = lessPrecise( v.fst )( v.snd );
                var lesser = function () {
                    if ( test ) {
                        return v.fst;
                    }
                    return v.snd;
                }();
                var greater = function () {
                    if ( test ) {
                        return v.snd;
                    }
                    return v.fst;
                }();
                var lesserDecimal = Data_List.length( Data_List.drop( greater.decimal )( greater.digits ) ) - Data_List.length( Data_List.drop( lesser.decimal )( lesser.digits ) ) | 0;
                var zeroes = Data_Unfoldable.replicate( Data_List_Types.unfoldableList )( lesserDecimal )( Data_Digit[ "_zero" ] );
                var lesser$prime = {
                    digits: Data_Semigroup.append( Data_List_Types.semigroupList )( lesser.digits )( zeroes ),
                    decimal: lesser.decimal,
                    sign: lesser.sign
                };
                var z = {
                    fst: lesser$prime,
                    snd: greater
                };
                return z;
            }
            throw new Error( "Failed pattern match at Data.HugeNum (line 140, column 3 - line 149, column 57): " + [ v.constructor.name ] );
        };
        return function ( $214 ) {
            return integralize( fractionalize( $214 ) );
        };
    }();

    // Compares two HugeNums.
    var compareHugeNum = function ( v ) {
        return function ( v1 ) {
            if ( Data_Ord.lessThan( ordSign )( v.sign )( v1.sign ) ) {
                return Data_Ordering.LT.value;
            }
            if ( Data_Ord.greaterThan( ordSign )( v.sign )( v1.sign ) ) {
                return Data_Ordering.GT.value;
            }
            if ( v.decimal > v1.decimal ) {
                return Data_Ordering.GT.value;
            }
            if ( v.decimal < v1.decimal ) {
                return Data_Ordering.LT.value;
            }
            if ( Data_Eq.eq( eqHugeNum )( v )( v1 ) ) {
                return Data_Ordering.EQ.value;
            }
            if ( Data_Boolean.otherwise ) {
                var r = equivalize( {
                    fst: v,
                    snd: v1
                } );
                var s = rec( r.fst );
                var m = rec( r.snd );
                var x$prime = function () {
                    var $179 = Data_Eq.eq( eqHugeNum )( v )( r.fst );
                    if ( $179 ) {
                        return s;
                    }
                    return m;
                }();
                var y$prime = function () {
                    var $180 = Data_Eq.eq( eqHugeNum )( v1 )( r.fst );
                    if ( $180 ) {
                        return s;
                    }
                    return m;
                }();
                var z = function () {
                    var v2 = Data_Ord.compare( Data_List_Types.ordList( Data_Digit.ordDigit ) )( Data_List.take( v.decimal )( v.digits ) )( Data_List.take( v.decimal )( v1.digits ) );
                    if ( v2 instanceof Data_Ordering.EQ ) {
                        return Data_Ord.compare( Data_List_Types.ordList( Data_Digit.ordDigit ) )( Data_List.drop( v.decimal )( x$prime.digits ) )( Data_List.drop( v.decimal )( y$prime.digits ) );
                    }
                    return v2;
                }();
                return z;
            }
            throw new Error( "Failed pattern match at Data.HugeNum (line 101, column 1 - line 101, column 49): " + [ v.constructor.name, v1.constructor.name ] );
        };
    };

    // Ord instance for HugeNum.
    var ordHugeNum = new Data_Ord.Ord( function () {
        return eqHugeNum;
    }, compareHugeNum );

    // Converts an array of digits to HugeNum.
    var arrayToHugeNum = function ( xs ) {
        return {
            sign: Plus.value,
            digits: Data_Semigroup.append( Data_List_Types.semigroupList )( xs )( Control_Applicative.pure( Data_List_Types.applicativeList )( Data_Digit[ "_zero" ] ) ),
            decimal: Data_List.length( xs )
        };
    };

    // Adjusts digits to fit a given decimal point.
    var adjustDigitsForDecimal = function ( decimal ) {
        return function ( digits ) {
            var go = function ( $copy_n ) {
                return function ( $copy_ds ) {
                    var $tco_var_n = $copy_n;
                    var $tco_done = false;
                    var $tco_result;

                    function $tco_loop( n, ds ) {
                        if ( n <= 0 ) {
                            $tco_done = true;
                            return ds;
                        }
                        if ( Data_Boolean.otherwise ) {
                            $tco_var_n = n - 1 | 0;
                            $copy_ds = new Data_List_Types.Cons( Data_Digit[ "_zero" ], ds );
                            return;
                        }
                        throw new Error( "Failed pattern match at Data.HugeNum (line 380, column 3 - line 382, column 42): " + [ n.constructor.name, ds.constructor.name ] );
                    }
                    while ( !$tco_done ) {
                        $tco_result = $tco_loop( $tco_var_n, $copy_ds );
                    }
                    return $tco_result;
                };
            };
            return go( ( decimal - Data_List.length( digits ) | 0 ) + 1 | 0 )( digits );
        };
    };

    // Adjusts decimal point for trivial fractional parts during multiplication.
    var adjustDecimalForTriviality = function ( h1 ) {
        return function ( h2 ) {
            return function ( v ) {
                var digitsLength = Data_List.length( v.digits ) - 1 | 0;
                var digits$prime = Data_List.take( digitsLength )( v.digits );
                var decimalMod = meatyDecimals( h1 ) + meatyDecimals( h2 ) | 0;
                var digits = Data_Semigroup.append( Data_List_Types.semigroupList )( Data_Unfoldable.replicate( Data_List_Types.unfoldableList )( ( decimalMod - digitsLength | 0 ) + 1 | 0 )( Data_Digit[ "_zero" ] ) )( digits$prime );
                var decimal = Data_List.length( Data_List.drop( decimalMod )( Data_List.reverse( digits ) ) );
                var r = {
                    digits: digits,
                    decimal: decimal,
                    sign: Plus.value
                };
                return dropZeroes( r );
            };
        };
    };

    // Adjusts decimal point after removing front zeroes.
    var adjustDecimalForFrontZeroes = function ( xs ) {
        return function ( oldDec ) {
            var newDigits$prime = unsafeRemoveFrontZeroes( Data_List.take( oldDec )( xs ) );
            var newDigits = function () {
                var $187 = Data_List[ "null" ]( newDigits$prime );
                if ( $187 ) {
                    return Control_Applicative.pure( Data_List_Types.applicativeList )( Data_Digit[ "_zero" ] );
                }
                return newDigits$prime;
            }();
            return Data_List.length( newDigits );
        };
    };

    // Adds two positive HugeNums.
    var addPlusPlus = function ( x ) {
        return function ( y ) {
            var eqv = equivalize( {
                fst: x,
                snd: y
            } );
            var r1 = rec( eqv.fst );
            var r2 = rec( eqv.snd );
            var r = Data_List.zip( Data_List.reverse( r1.digits ) )( Data_List.reverse( r2.digits ) );
            var digits$prime$prime = Data_Foldable.foldl( Data_List_Types.foldableList )( digitwiseAdd )( new Data_Tuple.Tuple( Data_Monoid.mempty( Data_List_Types.monoidList ), Data_Digit[ "_zero" ] ) )( r );
            var spill = Data_Tuple.snd( digits$prime$prime );
            var digits$prime = Data_Tuple.fst( digits$prime$prime );
            var digits = unsafeRemoveFrontZeroes( new Data_List_Types.Cons( spill, digits$prime ) );
            var decimal = adjustDecimalForFrontZeroes( new Data_List_Types.Cons( spill, digits$prime ) )( r1.decimal + 1 | 0 );
            var z = {
                digits: adjustDigitsForDecimal( decimal )( digits ),
                decimal: decimal,
                sign: Plus.value
            };
            return dropZeroes( z );
        };
    };

    // Adds a positive and a negative HugeNum.
    var addPlusMinus = function ( x ) {
        return function ( y ) {
            var eqv = equivalize( {
                fst: x,
                snd: y
            } );
            var r1 = rec( Data_Ord.min( ordHugeNum )( abs( eqv.fst ) )( abs( eqv.snd ) ) );
            var r2 = rec( Data_Ord.max( ordHugeNum )( abs( eqv.fst ) )( abs( eqv.snd ) ) );
            var r = Data_List.zip( Data_List.reverse( r2.digits ) )( Data_List.reverse( r1.digits ) );
            var digits$prime$prime = Data_Foldable.foldl( Data_List_Types.foldableList )( digitwiseSubtract )( new Data_Tuple.Tuple( Data_Monoid.mempty( Data_List_Types.monoidList ), Data_Digit[ "_zero" ] ) )( r );
            var fractionalDigits = Data_List.drop( r1.decimal )( Data_Tuple.fst( digits$prime$prime ) );
            var integralDigits$prime$prime = Data_List.take( r1.decimal )( Data_Tuple.fst( digits$prime$prime ) );
            var integralDigits$prime = unsafeRemoveFrontZeroes( integralDigits$prime$prime );
            var integralDigits = function () {
                var $188 = Data_List[ "null" ]( integralDigits$prime );
                if ( $188 ) {
                    return Control_Applicative.pure( Data_List_Types.applicativeList )( Data_Digit[ "_zero" ] );
                }
                return integralDigits$prime;
            }();
            var digits = Data_Semigroup.append( Data_List_Types.semigroupList )( integralDigits )( fractionalDigits );
            var decimal = adjustDecimalForFrontZeroes( Data_Tuple.fst( digits$prime$prime ) )( r1.decimal );
            var z = {
                digits: digits,
                decimal: decimal,
                sign: Plus.value
            };
            return z;
        };
    };

    // Adds two negative HugeNums.
    var addMinusMinus = function ( x ) {
        return function ( y ) {
            var z = rec( addPlusPlus( x )( y ) );
            return {
                digits: z.digits,
                decimal: z.decimal,
                sign: Minus.value
            };
        };
    };

    // Returns the absolute value of a HugeNum.
    var abs = function ( v ) {
        return {
            digits: v.digits,
            decimal: v.decimal,
            sign: Plus.value
        };
    };

    // Gets the power of ten for KRep decomposition.
    var getPowForKRep = function ( x ) {
        return function ( y ) {
            return function ( v ) {
                return v - 1 | 0;
            }( function ( v ) {
                return v.decimal;
            }( rec( Data_Ord.min( ordHugeNum )( abs( x ) )( abs( y ) ) ) ) );
        };
    };

    // Adds two HugeNums, handling signs.
    var plus = function ( x ) {
        return function ( y ) {
            if ( isZero( x ) ) {
                return y;
            }
            if ( isZero( y ) ) {
                return x;
            }
            if ( isPositive( x ) && isPositive( y ) ) {
                return addPlusPlus( x )( y );
            }
            if ( isNegative( x ) && isNegative( y ) ) {
                return addMinusMinus( x )( y );
            }
            if ( Data_Boolean.otherwise ) {
                var lesserMag = Data_Ord.min( ordHugeNum )( abs( x ) )( abs( y ) );
                var lesser = Data_Ord.min( ordHugeNum )( x )( y );
                var greaterMag = Data_Ord.max( ordHugeNum )( abs( x ) )( abs( y ) );
                var greater = Data_Ord.max( ordHugeNum )( x )( y );
                var z = function () {
                    var $192 = Data_Eq.eq( eqHugeNum )( greater )( greaterMag );
                    if ( $192 ) {
                        return addPlusMinus( greater )( lesser );
                    }
                    return neg( addPlusMinus( greaterMag )( lesserMag ) );
                }();
                return z;
            }
            throw new Error( "Failed pattern match at Data.HugeNum (line 432, column 1 - line 432, column 38): " + [ x.constructor.name, y.constructor.name ] );
        };
    };

    // Scales a HugeNum by repeated addition.
    var scale = function () {
        var go = function ( $copy_x ) {
            return function ( $copy_v ) {
                return function ( $copy_v1 ) {
                    var $tco_var_x = $copy_x;
                    var $tco_var_v = $copy_v;
                    var $tco_done = false;
                    var $tco_result;

                    function $tco_loop( x, v, v1 ) {
                        if ( v === 0 ) {
                            $tco_done = true;
                            return x;
                        }
                        $tco_var_x = plus( x )( v1 );
                        $tco_var_v = v - 1 | 0;
                        $copy_v1 = v1;
                        return;
                    }
                    while ( !$tco_done ) {
                        $tco_result = $tco_loop( $tco_var_x, $tco_var_v, $copy_v1 );
                    }
                    return $tco_result;
                };
            };
        };
        return go( zeroHugeNum );
    }();

    // Multiplies a HugeNum by a small integer.
    var multSmallNum = function ( v ) {
        return function ( r2 ) {
            var v1 = Data_List.uncons( v.digits );
            if ( v1 instanceof Data_Maybe.Just ) {
                var $199 = Data_Eq.eq( Data_Digit.eqDigit )( v1.value0.head )( Data_Digit[ "_zero" ] );
                if ( $199 ) {
                    return zeroHugeNum;
                }
                return scale( Data_Digit.toInt( v1.value0.head ) )( r2 );
            }
            return Effect_Exception_Unsafe.unsafeThrow( "Error: The impossible happened" );
        };
    };

    // Converts a HugeNum to KRep (Karatsuba representation).
    var toKRep = function ( exp ) {
        return function ( v ) {
            var coeff = Data_List.take( v.decimal - exp | 0 )( v.digits );
            var bm = new Data_List_Types.Cons( Data_Digit[ "_one" ], Data_Unfoldable.replicate( Data_List_Types.unfoldableList )( exp )( Data_Digit[ "_zero" ] ) );
            var prod = Data_Semigroup.append( Data_List_Types.semigroupList )( coeff )( Data_List.drop( 1 )( bm ) );
            var leftSummand = arrayToHugeNum( prod );
            var k = plus( v )( neg( leftSummand ) );
            var z = {
                exp: exp,
                coeff: coeff,
                const: k
            };
            return z;
        };
    };

    // Multiplies two HugeNums.
    var times = function ( r1 ) {
        return function ( r2 ) {
            if ( Data_Eq.eq( eqSign )( timesSign( function ( v ) {
                return v.sign;
            }( rec( r1 ) ) )( function ( v ) {
                return v.sign;
            }( rec( r2 ) ) ) )( Minus.value ) ) {
                return neg( times( abs( r1 ) )( abs( r2 ) ) );
            }
            if ( !trivialFraction( r1 ) || !trivialFraction( r2 ) ) {
                return adjustDecimalForTriviality( r1 )( r2 )( times( makeHugeInteger( r1 ) )( makeHugeInteger( r2 ) ) );
            }
            if ( smallEnough( r1 ) ) {
                return multSmallNum( r1 )( r2 );
            }
            if ( smallEnough( r2 ) ) {
                return multSmallNum( r2 )( r1 );
            }
            if ( Data_Boolean.otherwise ) {
                var exp = getPowForKRep( r1 )( r2 );
                var k1 = toKRep( exp )( r1 );
                var k2 = toKRep( exp )( r2 );
                var z0 = times( k1[ "const" ] )( k2[ "const" ] );
                var z2 = times( arrayToHugeNum( k1.coeff ) )( arrayToHugeNum( k2.coeff ) );
                var z1 = function () {
                    var rightFactor = plus( arrayToHugeNum( k2.coeff ) )( k2[ "const" ] );
                    var leftFactor = plus( arrayToHugeNum( k1.coeff ) )( k1[ "const" ] );
                    var prod = times( leftFactor )( rightFactor );
                    return plus( plus( prod )( neg( z2 ) ) )( neg( z0 ) );
                }();
                var z1Bm = timesPowOfTen( exp )( z1 );
                var z2B2m = timesPowOfTen( 2 * exp | 0 )( z2 );
                var z = plus( plus( z2B2m )( z1Bm ) )( z0 );
                return z;
            }
            throw new Error( "Failed pattern match at Data.HugeNum (line 504, column 1 - line 504, column 39): " + [ r1.constructor.name, r2.constructor.name ] );
        };
    };

    // Semiring instance for HugeNum.
    var semiringHugeNum = new Data_Semiring.Semiring( plus, times, oneHugeNum, zeroHugeNum );

    // Ceils a HugeNum (rounds up to the nearest integer).
    var ceil = function ( h ) {
        if ( isNegative( h ) ) {
            return integerPart( h );
        }
        if ( isZero( h ) ) {
            return Data_Semiring.zero( semiringHugeNum );
        }
        if ( Data_Boolean.otherwise ) {
            return Data_Semiring.add( semiringHugeNum )( integerPart( h ) )( Data_Semiring.one( semiringHugeNum ) );
        }
        throw new Error( "Failed pattern match at Data.HugeNum (line 316, column 1 - line 316, column 27): " + [ h.constructor.name ] );
    };

    // Ring instance for HugeNum.
    var ringHugeNum = new Data_Ring.Ring( function () {
        return semiringHugeNum;
    }, function ( r1 ) {
        return function ( r2 ) {
            return Data_Semiring.add( semiringHugeNum )( r1 )( neg( r2 ) );
        };
    } );

    // Floors a HugeNum (rounds down to the nearest integer).
    var floor = function ( h ) {
        if ( isPositive( h ) ) {
            return integerPart( h );
        }
        if ( isZero( h ) ) {
            return Data_Semiring.zero( semiringHugeNum );
        }
        if ( Data_Boolean.otherwise ) {
            return Data_Ring.sub( ringHugeNum )( integerPart( h ) )( Data_Semiring.one( semiringHugeNum ) );
        }
        throw new Error( "Failed pattern match at Data.HugeNum (line 310, column 1 - line 310, column 28): " + [ h.constructor.name ] );
    };

    // Rounds a HugeNum to the nearest integer.
    var round = function ( h ) {
        if ( Data_Ord.lessThan( ordHugeNum )( abs( Data_Ring.sub( ringHugeNum )( h )( floor( h ) ) ) )( abs( Data_Ring.sub( ringHugeNum )( ceil( h ) )( h ) ) ) ) {
            return floor( h );
        }
        if ( Data_Boolean.otherwise ) {
            return ceil( h );
        }
        throw new Error( "Failed pattern match at Data.HugeNum (line 322, column 1 - line 322, column 28): " + [ h.constructor.name ] );
    };

    // Export functions and instances.
    exports[ "fromNumber" ] = fromNumber;
    exports[ "toString" ] = toString;
    exports[ "integerPart" ] = integerPart;
    exports[ "abs" ] = abs;
    exports[ "neg" ] = neg;
    exports[ "isNegative" ] = isNegative;
    exports[ "isPositive" ] = isPositive;
    exports[ "isZero" ] = isZero;
    exports[ "floor" ] = floor;
    exports[ "ceil" ] = ceil;
    exports[ "round" ] = round;
    exports[ "eqHugeNum" ] = eqHugeNum;
    exports[ "ordHugeNum" ] = ordHugeNum;
    exports[ "semiringHugeNum" ] = semiringHugeNum;
    exports[ "ringHugeNum" ] = ringHugeNum;

} )( PS[ "Data.HugeNum" ] = PS[ "Data.HugeNum" ] || {} );

// Module: Data.HugeInt
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_Boolean = PS[ "Data.Boolean" ]; // Not used.
    var Data_Bounded = PS[ "Data.Bounded" ]; // Not used.
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_Generic_Rep = PS[ "Data.Generic.Rep" ]; // Not used.
    var Data_HeytingAlgebra = PS[ "Data.HeytingAlgebra" ]; // Not used.
    var Data_HugeNum = PS[ "Data.HugeNum" ];
    var Data_Int = PS[ "Data.Int" ];
    var Data_Maybe = PS[ "Data.Maybe" ]; // Not used.
    var Data_Ord = PS[ "Data.Ord" ]; // Not used.
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semigroup = PS[ "Data.Semigroup" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ];
    var Data_Show = PS[ "Data.Show" ];
    var Data_String = PS[ "Data.String" ]; // Not used.
    var Data_String_CodePoints = PS[ "Data.String.CodePoints" ]; // Not used.
    var Data_String_CodeUnits = PS[ "Data.String.CodeUnits" ];
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Newtype for HugeInt (wraps HugeNum).
    var HugeInt = function ( x ) {
        return x;
    };

    // Show instance for HugeInt.
    var showHugeInt = new Data_Show.Show( function ( v ) {
        return "HugeInt " + Data_String_CodeUnits.takeWhile( function ( v1 ) {
            return v1 !== ".";
        } )( Data_HugeNum.toString( v ) );
    } );

    // Semiring instance for HugeInt.
    var semiringHugeInt = new Data_Semiring.Semiring( function ( v ) {
        return function ( v1 ) {
            return Data_Semiring.add( Data_HugeNum.semiringHugeNum )( v )( v1 );
        };
    }, function ( v ) {
        return function ( v1 ) {
            return Data_Semiring.mul( Data_HugeNum.semiringHugeNum )( v )( v1 );
        };
    }, Data_Semiring.one( Data_HugeNum.semiringHugeNum ), Data_Semiring.zero( Data_HugeNum.semiringHugeNum ) );

    // Converts an integer to a HugeInt.
    var fromInt = function ( $47 ) {
        return HugeInt( Data_HugeNum.fromNumber( Data_Int.toNumber( $47 ) ) );
    };

    // Export newtype, instances, and helper functions.
    exports[ "fromInt" ] = fromInt;
    exports[ "showHugeInt" ] = showHugeInt;
    exports[ "semiringHugeInt" ] = semiringHugeInt;

} )( PS[ "Data.HugeInt" ] = PS[ "Data.HugeInt" ] || {} );

// Module: Data.String.Common
( function ( exports ) {

    "use strict";

    // Splits a string by a separator.
    exports.split = function ( sep ) {
        return function ( s ) {
            return s.split( sep );
        };
    };

    // Trims whitespace from both ends of a string.
    exports.trim = function ( s ) {
        return s.trim();
    };

} )( PS[ "Data.String.Common" ] = PS[ "Data.String.Common" ] || {} );

// Module: Data.String.Common (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Data.String.Common" ];
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_Ordering = PS[ "Data.Ordering" ]; // Not used.
    var Data_String_Pattern = PS[ "Data.String.Pattern" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Export foreign functions.
    exports[ "split" ] = $foreign.split;
    exports[ "trim" ] = $foreign.trim;

} )( PS[ "Data.String.Common" ] = PS[ "Data.String.Common" ] || {} );

// Module: AtCoder.ABC121.C
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Applicative = PS[ "Control.Applicative" ];
    var Control_Bind = PS[ "Control.Bind" ];
    var Control_Monad_Rec_Class = PS[ "Control.Monad.Rec.Class" ];
    var Data_Array = PS[ "Data.Array" ];
    var Data_Either = PS[ "Data.Either" ];
    var Data_Eq = PS[ "Data.Eq" ]; // Not used.
    var Data_HugeInt = PS[ "Data.HugeInt" ];
    var Data_Int = PS[ "Data.Int" ];
    var Data_Maybe = PS[ "Data.Maybe" ];
    var Data_Ord = PS[ "Data.Ord" ];
    var Data_Ring = PS[ "Data.Ring" ]; // Not used.
    var Data_Semiring = PS[ "Data.Semiring" ];
    var Data_Show = PS[ "Data.Show" ];
    var Data_String = PS[ "Data.String" ]; // Not used.
    var Data_String_CodeUnits = PS[ "Data.String.CodeUnits" ];
    var Data_String_Common = PS[ "Data.String.Common" ];
    var Data_String_Pattern = PS[ "Data.String.Pattern" ]; // Not used.
    var Data_Tuple = PS[ "Data.Tuple" ];
    var Data_Unit = PS[ "Data.Unit" ];
    var Partial_Unsafe = PS[ "Partial.Unsafe" ];
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Core solver function for the problem.
    // m: money available, abs: array of (price, count) tuples.
    var solve$prime$prime = function ( m ) {
        return function ( abs ) {
            // Sort the available stores by price.
            var sorted = Data_Array.sortWith( Data_Ord.ordInt )( Data_Tuple.fst )( abs );

            // Recursive helper function using tailRec.
            var go = function ( v ) {
                var v1 = Data_Array.index( sorted )( v.i ); // Get current store.
                if ( v1 instanceof Data_Maybe.Nothing ) {
                    return new Control_Monad_Rec_Class.Done( v.n ); // No more stores, return total.
                }
                if ( v1 instanceof Data_Maybe.Just ) {
                    // Extract count (bottles) from the store.
                    var b = function () {
                        var v2 = Data_Int.fromString( v1.value0.value1 );
                        if ( v2 instanceof Data_Maybe.Nothing ) {
                            return Partial_Unsafe.unsafeCrashWith( "bs" ); // Error if count is not a valid int.
                        }
                        if ( v2 instanceof Data_Maybe.Just ) {
                            return v2.value0;
                        }
                        throw new Error( "Failed pattern match at AtCoder.ABC121.C (line 65, column 15 - line 67, column 30): " + [ v2.constructor.name ] );
                    }();

                    var m$prime$prime = v[ "m'" ] - b | 0; // Remaining money after buying all from this store.
                    var a$prime = Data_HugeInt.fromInt( v1.value0.value0 ); // Price of this store.

                    var $18 = m$prime$prime < 0; // If we can't afford all bottles from this store.
                    if ( $18 ) {
                        // Buy as many as possible with remaining money.
                        return new Control_Monad_Rec_Class.Done( Data_Semiring.add( Data_HugeInt.semiringHugeInt )( v.n )( Data_Semiring.mul( Data_HugeInt.semiringHugeInt )( a$prime )( Data_HugeInt.fromInt( v[ "m'" ] ) ) ) );
                    }

                    // Buy all bottles from this store and continue.
                    return new Control_Monad_Rec_Class.Loop( {
                        i: v.i + 1 | 0,
                        "m'": m$prime$prime,
                        n: Data_Semiring.add( Data_HugeInt.semiringHugeInt )( v.n )( Data_Semiring.mul( Data_HugeInt.semiringHugeInt )( a$prime )( Data_HugeInt.fromInt( b ) ) )
                    } );
                }
                throw new Error( "Failed pattern match at AtCoder.ABC121.C (line 60, column 7 - line 76, column 76): " + [ v1.constructor.name ] );
            };

            // Start the tail recursion.
            return Control_Monad_Rec_Class.tailRec( go )( {
                i: 0,
                "m'": m,
                n: Data_HugeInt.fromInt( 0 )
            } );
        };
    };

    // Parses the input string and calls the solver.
    var solve$prime = function ( input ) {
        // Split input into lines and trim whitespace.
        var lines = Data_String_Common.split( "\n" )( Data_String_Common.trim( input ) );

        // Use Either monad for error handling during parsing.
        return Control_Bind.bind( Data_Either.bindEither )( Control_Bind.bind( Data_Either.bindEither )( Data_Either.note( "nms" )( Data_Array.head( lines ) ) )( function ( v ) {
            return Control_Bind.bind( Data_Either.bindEither )( Control_Applicative.pure( Data_Either.applicativeEither )( Data_Array.drop( 1 )( lines ) ) )( function ( v1 ) {
                return Control_Applicative.pure( Data_Either.applicativeEither )( {
                    abss: v1,
                    nms: v
                } );
            } );
        } ) )( function ( v ) {
            return Control_Bind.bind( Data_Either.bindEither )( function () {
                // Parse N and M from the first line.
                var v1 = Data_String_Common.split( " " )( v.nms );
                if ( v1.length === 2 ) {
                    return Control_Bind.bind( Data_Either.bindEither )( Data_Either.note( "n" )( Data_Int.fromString( v1[ 0 ] ) ) )( function ( v2 ) {
                        return Control_Bind.bind( Data_Either.bindEither )( Data_Either.note( "m" )( Data_Int.fromString( v1[ 1 ] ) ) )( function ( v3 ) {
                            return Control_Applicative.pure( Data_Either.applicativeEither )( {
                                m: v3,
                                n: v2
                            } );
                        } );
                    } );
                }
                return new Data_Either.Left( "n m" ); // Error if N or M parsing fails.
            }() )( function ( v1 ) {
                return Control_Bind.bind( Data_Either.bindEither )( Control_Applicative.pure( Data_Either.applicativeEither )( Data_Array.mapMaybe( function ( i ) {
                    // Parse (price, count) for each store.
                    var v2 = Data_String_Common.split( " " )( i );
                    if ( v2.length === 2 ) {
                        return Control_Bind.bind( Data_Maybe.bindMaybe )( Data_Int.fromString( v2[ 0 ] ) )( function ( v3 ) {
                            return Control_Applicative.pure( Data_Maybe.applicativeMaybe )( new Data_Tuple.Tuple( v3, v2[ 1 ] ) );
                        } );
                    }
                    return Data_Maybe.Nothing.value;
                } )( v.abss ) ) )( function ( v2 ) {
                    // Validate the number of stores.
                    return Control_Bind.discard( Control_Bind.discardUnit )( Data_Either.bindEither )( function () {
                        var $39 = Data_Array.length( v2 ) === v1.n;
                        if ( $39 ) {
                            return Control_Applicative.pure( Data_Either.applicativeEither )( Data_Unit.unit );
                        }
                        return new Data_Either.Left( "abs length" ); // Error if store count mismatch.
                    }() )( function () {
                        // Call the core solver and strip "HugeInt " prefix from the result string.
                        return Data_Either.note( "HugeInt" )( Data_String_CodeUnits.stripPrefix( "HugeInt " )( Data_Show.show( Data_HugeInt.showHugeInt )( solve$prime$prime( v1.m )( v2 ) ) ) );
                    } );
                } );
            } );
        } );
    };

    // Main solver function, handles errors by crashing.
    var solve = function ( input ) {
        var v = solve$prime( input );
        if ( v instanceof Data_Either.Left ) {
            return Partial_Unsafe.unsafeCrashWith( v.value0 ); // Crash on parsing errors.
        }
        if ( v instanceof Data_Either.Right ) {
            return v.value0; // Return the solution.
        }
        throw new Error( "Failed pattern match at AtCoder.ABC121.C (line 22, column 3 - line 24, column 17): " + [ v.constructor.name ] );
    };

    // Export the main solver function.
    exports[ "solve" ] = solve;

} )( PS[ "AtCoder.ABC121.C" ] = PS[ "AtCoder.ABC121.C" ] || {} );

// Module: Effect.Console
( function ( exports ) {

    "use strict";

    // Logs a message to the console.
    exports.log = function ( s ) {
        return function () {
            console.log( s );
            return {};
        };
    };

} )( PS[ "Effect.Console" ] = PS[ "Effect.Console" ] || {} );

// Module: Effect.Console (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Effect.Console" ];
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Data_Unit = PS[ "Data.Unit" ]; // Not used.
    var Effect = PS[ "Effect" ]; // Not used.

    // Export foreign function.
    exports[ "log" ] = $foreign.log;

} )( PS[ "Effect.Console" ] = PS[ "Effect.Console" ] || {} );

// Module: Node.Encoding
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Node.Encoding" ]; // Foreign module not provided.
    var Data_Show = PS[ "Data.Show" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Data constructors for file encodings.
    var ASCII = function () {
        function ASCII() {}
        ASCII.value = new ASCII();
        return ASCII;
    }();
    var UTF8 = function () {
        function UTF8() {}
        UTF8.value = new UTF8();
        return UTF8;
    }();
    var UTF16LE = function () {
        function UTF16LE() {}
        UTF16LE.value = new UTF16LE();
        return UTF16LE;
    }();
    var UCS2 = function () {
        function UCS2() {}
        UCS2.value = new UCS2();
        return UCS2;
    }();
    var Base64 = function () {
        function Base64() {}
        Base64.value = new Base64();
        return Base64;
    }();
    var Latin1 = function () {
        function Latin1() {}
        Latin1.value = new Latin1();
        return Latin1;
    }();
    var Binary = function () {
        function Binary() {}
        Binary.value = new Binary();
        return Binary;
    }();
    var Hex = function () {
        function Hex() {}
        Hex.value = new Hex();
        return Hex;
    }();

    // Show instance for Encoding.
    var showEncoding = new Data_Show.Show( function ( v ) {
        if ( v instanceof ASCII ) {
            return "ASCII";
        }
        if ( v instanceof UTF8 ) {
            return "UTF8";
        }
        if ( v instanceof UTF16LE ) {
            return "UTF16LE";
        }
        if ( v instanceof UCS2 ) {
            return "UCS2";
        }
        if ( v instanceof Base64 ) {
            return "Base64";
        }
        if ( v instanceof Latin1 ) {
            return "Latin1";
        }
        if ( v instanceof Binary ) {
            return "Binary";
        }
        if ( v instanceof Hex ) {
            return "Hex";
        }
        throw new Error( "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [ v.constructor.name ] );
    } );

    // Export constructors and instance.
    exports[ "ASCII" ] = ASCII;
    exports[ "UTF8" ] = UTF8;
    exports[ "UTF16LE" ] = UTF16LE;
    exports[ "UCS2" ] = UCS2;
    exports[ "Base64" ] = Base64;
    exports[ "Latin1" ] = Latin1;
    exports[ "Binary" ] = Binary;
    exports[ "Hex" ] = Hex;
    exports[ "showEncoding" ] = showEncoding;

} )( PS[ "Node.Encoding" ] = PS[ "Node.Encoding" ] || {} );

// Module: Node.FS.Internal
( function ( exports ) {

    "use strict";

    // Unsafely requires the 'fs' (file system) module.
    exports.unsafeRequireFS = require( "fs" );

} )( PS[ "Node.FS.Internal" ] = PS[ "Node.FS.Internal" ] || {} );

// Module: Node.FS.Internal (continued)
( function ( exports ) {

    "use strict";

    // Import foreign functions and other modules.
    var $foreign = PS[ "Node.FS.Internal" ];
    var Effect = PS[ "Effect" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.
    var Unsafe_Coerce = PS[ "Unsafe.Coerce" ];

    // Helper to create an effect.
    var mkEffect = Unsafe_Coerce.unsafeCoerce;

    // Export helper and foreign function.
    exports[ "mkEffect" ] = mkEffect;
    exports[ "unsafeRequireFS" ] = $foreign.unsafeRequireFS;

} )( PS[ "Node.FS.Internal" ] = PS[ "Node.FS.Internal" ] || {} );

// Module: Node.FS.Sync
( function ( exports ) {

    "use strict";

    // Import other modules.
    var Control_Bind = PS[ "Control.Bind" ]; // Not used.
    var Control_Semigroupoid = PS[ "Control.Semigroupoid" ]; // Not used.
    var Data_DateTime = PS[ "Data.DateTime" ]; // Not used.
    var Data_DateTime_Instant = PS[ "Data.DateTime.Instant" ]; // Not used.
    var Data_EuclideanRing = PS[ "Data.EuclideanRing" ]; // Not used.
    var Data_Function = PS[ "Data.Function" ]; // Not used.
    var Data_Function_Uncurried = PS[ "Data.Function.Uncurried" ]; // Not used.
    var Data_Functor = PS[ "Data.Functor" ]; // Not used.
    var Data_Int = PS[ "Data.Int" ]; // Not used.
    var Data_Maybe = PS[ "Data.Maybe" ]; // Not used.
    var Data_Nullable = PS[ "Data.Nullable" ]; // Not used.
    var Data_Show = PS[ "Data.Show" ];
    var Data_Time_Duration = PS[ "Data.Time.Duration" ]; // Not used.
    var Effect = PS[ "Effect" ]; // Not used.
    var Node_Buffer = PS[ "Node.Buffer" ]; // Not used.
    var Node_Encoding = PS[ "Node.Encoding" ];
    var Node_FS = PS[ "Node.FS" ]; // Not used.
    var Node_FS_Internal = PS[ "Node.FS.Internal" ];
    var Node_FS_Perms = PS[ "Node.FS.Perms" ]; // Not used.
    var Node_FS_Stats = PS[ "Node.FS.Stats" ]; // Not used.
    var Node_Path = PS[ "Node.Path" ]; // Not used.
    var Prelude = PS[ "Prelude" ]; // Not used.

    // File system module from Node.js.
    var fs = Node_FS_Internal.unsafeRequireFS;

    // Synchronously reads a text file.
    var readTextFile = function ( encoding ) {
        return function ( file ) {
            return Node_FS_Internal.mkEffect( function ( v ) {
                return fs.readFileSync( file, {
                    encoding: Data_Show.show( Node_Encoding.showEncoding )( encoding )
                } );
            } );
        };
    };

    // Export 'readTextFile'.
    exports[ "readTextFile" ] = readTextFile;

} )( PS[ "Node.FS.Sync" ] = PS[ "Node.FS.Sync" ] || {} );

// Module: Main
( function ( exports ) {

    "use strict";

    // Import other modules.
    var AtCoder_ABC121_C = PS[ "AtCoder.ABC121.C" ];
    var Control_Applicative = PS[ "Control.Applicative" ]; // Not used.
    var Control_Bind = PS[ "Control.Bind" ]; // Not used.
    var Effect = PS[ "Effect" ]; // Not used.
    var Effect_Console = PS[ "Effect.Console" ];
    var Node_Encoding = PS[ "Node.Encoding" ];
    var Node_FS_Sync = PS[ "Node.FS.Sync" ];
    var Prelude = PS[ "Prelude" ]; // Not used.

    // Alias to the main solver function.
    var solve = AtCoder_ABC121_C.solve;

    // Main program entry point.
    var main = function __do() {
        // Read input from /dev/stdin using UTF8 encoding.
        var v = Node_FS_Sync.readTextFile( Node_Encoding.UTF8.value )( "/dev/stdin" )();

        // Solve the problem with the input.
        var v1 = solve( v );

        // Log the result to the console.
        return Effect_Console.log( v1 )();
    };

    // Export 'main'.
    exports[ "main" ] = main;

} )( PS[ "Main" ] = PS[ "Main" ] || {} );

// Execute the main function when the script runs.
PS[ "Main" ].main();