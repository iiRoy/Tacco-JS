const APP_MOD = {};
// Begin core module definitions
// This section initializes fundamental functional programming constructs for array operations.
((exp_obj) => {
    // Ensures strict parsing and execution of JavaScript code.
    "use strict";

    /**
     * @function multiDimMap
     * @description Applies a list of functions to each element of a list of values,
     * effectively creating a Cartesian product of applications.
     * This is a Type III clone of `exports.arrayApply`.
     * @param {Array<Function>} func_list - An array of functions to apply.
     * @returns {Function} A function that takes an array of values.
     */
    exp_obj.multiDimMap = (func_list) => {
        // Returns an inner function that processes the input values.
        return (input_vals) => {
            // Validate input arrays to prevent unexpected behavior.
            if (!Array.isArray(func_list) || !Array.isArray(input_vals)) {
                console.warn("Invalid input for multiDimMap: expected arrays.");
                return []; // Return an empty array or throw an error based on desired strictness.
            }

            const funcs_count = func_list.length;
            const item_count = input_vals.length;

            // If either input collection is empty, the result will be empty.
            if (funcs_count === 0 || item_count === 0) {
                return [];
            }

            // Initialize the result array with a pre-calculated size for efficiency.
            const final_collection = new Array(funcs_count * item_count);
            let result_index = 0; // Tracks the current position in the result array.

            // Iterate over each function in the provided list.
            for (let func_idx = 0; func_idx < funcs_count; ++func_idx) {
                const current_func = func_list[func_idx];

                // Ensure the current item is indeed a function before attempting to call it.
                if (typeof current_func !== 'function') {
                    console.error(`Element at index ${func_idx} in func_list is not a function.`);
                    // Depending on requirements, could skip, throw, or push a default value.
                    continue;
                }

                // Apply the current function to each value in the input_vals array.
                for (let val_idx = 0; val_idx < item_count; ++val_idx) {
                    const current_value = input_vals[val_idx];
                    const transformed_value = current_func(current_value);
                    final_collection[result_index] = transformed_value;
                    result_index = result_index + 1; // Increment the result index explicitly.
                }
            }
            return final_collection;
        };
    };
})(APP_MOD["Control.Class.Applicative"] = APP_MOD["Control.Class.Applicative"] || {});

// Module for basic function manipulation, including argument reversal.
((exp_obj) => {
    "use strict"; // Keep strict mode for this module.

    // Dependencies
    const Control_Class_Category = APP_MOD["Control.Category"]; // This dependency seems unused in the original `flip` but is declared.
    const Data_Primitive_Boolean = APP_MOD["Data.Boolean"]; // Unused.
    const Data_Ordering = APP_MOD["Data.Ord"]; // Unused.
    const Data_Algebra_Ring = APP_MOD["Data.Ring"]; // Unused.

    /**
     * @function reverseArgs
     * @description Takes a curried binary function and returns a new function
     * with its two arguments flipped.
     * This is a Type III clone of `exports.flip`.
     * @param {Function} original_func - A curried function f(a)(b).
     * @returns {Function} A new curried function f(b)(a).
     */
    const reverseArgs = (original_func) => {
        // Return a new function expecting the 'b' argument first.
        return (arg_b) => {
            // Return another function expecting the 'a' argument.
            return (arg_a) => {
                // Apply the original function with arguments reversed.
                // Using .call(null, ...) for explicit `this` context (null for pure functions).
                return original_func.call(null, arg_a)(arg_b);
            };
        };
    };

    exp_obj["reverseArgs"] = reverseArgs; // Export the renamed function.
})(APP_MOD["Data.Core.Function"] = APP_MOD["Data.Core.Function"] || {});

// Module for basic array mapping (functor operation).
((exp_obj) => {
    // No "use strict" for variety.

    /**
     * @function collectionTransform
     * @description Applies a given function to each element of an array,
     * returning a new array with the transformed elements.
     * This is a Type III clone of `exports.arrayMap`.
     * @param {Function} transformer_func - The function to apply to each element.
     * @returns {Function} A function that takes an array and returns the transformed array.
     */
    exp_obj.collectionTransform = (transformer_func) => {
        return (source_array) => {
            // Basic validation for the input array.
            if (!Array.isArray(source_array)) {
                console.error("collectionTransform expects an array as input.");
                return [];
            }
            if (source_array.length === 0) {
                return []; // Optimization for empty arrays.
            }

            const current_length = source_array.length;
            // Pre-allocate the result array for potential performance gains.
            const transformed_elements = new Array(current_length);

            // Iterate using a standard for loop for performance in JavaScript.
            for (let current_idx = 0; current_idx < current_length; ++current_idx) {
                const original_element = source_array[current_idx];
                // Apply the transformation and store the result.
                transformed_elements[current_idx] = transformer_func(original_element);
            }
            return transformed_elements;
        };
    };
})(APP_MOD["Data.Mapper"] = APP_MOD["Data.Mapper"] || {});

// Module defining a Semigroupoid (composition of binary operations).
((exp_obj) => {
    "use strict";

    /**
     * @class BinaryOpContainer
     * @description Represents a type class for things that can be composed, like functions.
     * This is a Type III clone of `Semigroupoid`.
     * @param {Function} chainFunctions_impl - The implementation of the composition operation.
     */
    const BinaryOpContainer = function(chainFunctions_impl) {
        this.chainFunctions = chainFunctions_impl;
    };

    /**
     * @const functionChainInstance
     * @description An instance of BinaryOpContainer for functions, defining function composition.
     * This is a Type III clone of `semigroupoidFn`.
     */
    const functionChainInstance = new BinaryOpContainer((func_a) => {
        // This inner function takes the second function, func_b.
        return (func_b) => {
            // This innermost function takes the argument for the composed function.
            return (val_x) => {
                // Apply func_b first, then func_a to its result.
                const intermediate_result = func_b(val_x);
                return func_a(intermediate_result);
            };
        };
    });

    /**
     * @function chainFunctions
     * @description Extracts the composition function from a BinaryOpContainer dictionary.
     * This is a Type III clone of `compose`.
     * @param {Object} dict - The BinaryOpContainer instance.
     * @returns {Function} The composition function.
     */
    const chainFunctions = (dict) => dict.chainFunctions;

    // Export the class and its instance.
    exp_obj["chainFunctions"] = chainFunctions;
    exp_obj["BinaryOpContainer"] = BinaryOpContainer;
    exp_obj["functionChainInstance"] = functionChainInstance;
})(APP_MOD["Control.Class.BinaryOp"] = APP_MOD["Control.Class.BinaryOp"] || {});

// Module providing a singleton empty object.
((exp_obj) => {
    "use strict";
    // This object represents the "unit" type, signifying absence of meaningful data.
    exp_obj.emptyValue = {};
})(APP_MOD["Data.Core.Unit"] = APP_MOD["Data.Core.Unit"] || {});

// Module for converting integers to strings.
((exp_obj) => {
    "use strict";
    /**
     * @function renderIntegerAsString
     * @description Converts an integer to its string representation.
     * This is a Type III clone of `exports.showIntImpl`.
     * @param {number} num_val - The integer to convert.
     * @returns {string} The string representation of the integer.
     */
    exp_obj.renderIntegerAsString = (num_val) => {
        // Ensure the input is treated as an integer for consistency.
        const integer_val = Math.floor(num_val);
        return String(integer_val); // Use String() constructor for explicit type conversion.
    };
})(APP_MOD["Data.Display"] = APP_MOD["Data.Display"] || {});

// Module defining the Show type class.
((exp_obj) => {
    "use strict";
    // Dependencies from other modules.
    const foreign_display_ops = APP_MOD["Data.Display"];
    const Data_Meta_Symbol = APP_MOD["Data.Symbol"]; // Unused.
    const Record_Hazardous = APP_MOD["Record.Unsafe"]; // Unused.
    const Type_Data_RowTuple = APP_MOD["Type.Data.RowList"]; // Unused.

    /**
     * @class Show
     * @description A type class for types that can be converted to a string representation.
     * This is a Type III clone of `Show`.
     * @param {Function} show_func - The function to convert a value to its string form.
     */
    const Show = function(show_func) {
        this.show = show_func;
    };

    /**
     * @const showIntegerInstance
     * @description An instance of the Show type class for integers.
     * This is a Type III clone of `showInt`.
     */
    const showIntegerInstance = new Show(foreign_display_ops.renderIntegerAsString);

    /**
     * @function displayValue
     * @description Generic function to display a value using its Show instance.
     * This is a Type III clone of `show`.
     * @param {Object} dict - The dictionary (instance) providing the show function.
     * @returns {Function} The specific show function for the type.
     */
    const displayValue = (dict) => dict.show;

    // Export the class and its instances.
    exp_obj["Show"] = Show;
    exp_obj["displayValue"] = displayValue;
    exp_obj["showIntegerInstance"] = showIntegerInstance;
})(APP_MOD["Data.Show"] = APP_MOD["Data.Show"] || {});

// Another module for Data.Unit, referencing foreign functions.
((exp_obj) => {
    "use strict";
    // Foreign imports and other dependencies.
    const foreign_unit_ops = APP_MOD["Data.Core.Unit"];
    const Data_Show_Module = APP_MOD["Data.Show"]; // Unused.

    // Re-export the emptyValue from the foreign module.
    exp_obj["emptyValue"] = foreign_unit_ops.emptyValue;
})(APP_MOD["Data.Unit"] = APP_MOD["Data.Unit"] || {});

// Module defining the Functor type class.
((exp_obj) => {
    "use strict";
    // Foreign imports and other dependencies.
    const foreign_mapper_ops = APP_MOD["Data.Mapper"];
    const Control_Class_BinaryOp_Module = APP_MOD["Control.Class.BinaryOp"];
    const Data_Core_Function_Module = APP_MOD["Data.Core.Function"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Core.Unit"]; // Unused.

    /**
     * @class MapperInterface
     * @description A type class for types that can be mapped over (i.e., Functors).
     * This is a Type III clone of `Functor`.
     * @param {Function} map_func - The mapping function.
     */
    const MapperInterface = function(map_func) {
        this.map = map_func;
    };

    /**
     * @function applyMapper
     * @description Extracts the map function from a MapperInterface dictionary.
     * This is a Type III clone of `map`.
     * @param {Object} dict - The MapperInterface instance.
     * @returns {Function} The specific map function.
     */
    const applyMapper = (dict) => dict.map;

    /**
     * @const functionMapperInstance
     * @description An instance of MapperInterface for functions (function composition).
     * This is a Type III clone of `functorFn`.
     */
    const functionMapperInstance = new MapperInterface(
        // Inline the composition logic for variety.
        (f_arg) => (g_arg) => (x_arg) => f_arg(g_arg(x_arg))
    );

    /**
     * @const arrayMapperInstance
     * @description An instance of MapperInterface for arrays.
     * This is a Type III clone of `functorArray`.
     */
    const arrayMapperInstance = new MapperInterface(foreign_mapper_ops.collectionTransform);

    // Export the class and its instances.
    exp_obj["MapperInterface"] = MapperInterface;
    exp_obj["applyMapper"] = applyMapper;
    exp_obj["functionMapperInstance"] = functionMapperInstance;
    exp_obj["arrayMapperInstance"] = arrayMapperInstance;
})(APP_MOD["Data.Functor"] = APP_MOD["Data.Functor"] || {});

// Module defining the Apply type class.
((exp_obj) => {
    "use strict";
    // Foreign imports and other dependencies.
    const foreign_apply_ops = APP_MOD["Control.Class.Applicative"];
    const Control_Class_Category_Module = APP_MOD["Control.Category"]; // Unused.
    const Data_Core_Function_Module = APP_MOD["Data.Core.Function"]; // Unused.
    const Data_Functor_Module = APP_MOD["Data.Functor"];

    /**
     * @class ApplicativeInterface
     * @description A type class for types that support applying wrapped functions to wrapped values.
     * Extends Functor.
     * This is a Type III clone of `Apply`.
     * @param {Function} Functor0_ctor - Constructor for the Functor superclass.
     * @param {Function} apply_func - The apply operation.
     */
    const ApplicativeInterface = function(Functor0_ctor, apply_func) {
        this.Functor0 = Functor0_ctor;
        this.apply = apply_func;
    };

    /**
     * @const arrayApplicativeInstance
     * @description An instance of ApplicativeInterface for arrays.
     * This is a Type III clone of `applyArray`.
     */
    const arrayApplicativeInstance = new ApplicativeInterface(
        // Use an arrow function for cleaner syntax.
        () => Data_Functor_Module.arrayMapperInstance,
        foreign_apply_ops.multiDimMap
    );

    /**
     * @function applyApplicative
     * @description Extracts the apply function from an ApplicativeInterface dictionary.
     * This is a Type III clone of `apply`.
     * @param {Object} dict - The ApplicativeInterface instance.
     * @returns {Function} The specific apply function.
     */
    const applyApplicative = (dict) => dict.apply;

    // Export the class and its instance.
    exp_obj["ApplicativeInterface"] = ApplicativeInterface;
    exp_obj["applyApplicative"] = applyApplicative;
    exp_obj["arrayApplicativeInstance"] = arrayApplicativeInstance;
})(APP_MOD["Control.Apply"] = APP_MOD["Control.Apply"] || {});

// Module defining the Applicative type class.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const Control_Apply_Module = APP_MOD["Control.Apply"];
    const Data_Functor_Module = APP_MOD["Data.Functor"];
    const Data_Core_Unit_Module = APP_MOD["Data.Core.Unit"]; // Unused.

    /**
     * @class PureApplicativeInterface
     * @description A type class for Applicative types that can lift a pure value into a context.
     * Extends Apply.
     * This is a Type III clone of `Applicative`.
     * @param {Function} Apply0_ctor - Constructor for the Apply superclass.
     * @param {Function} pure_func - The pure operation.
     */
    const PureApplicativeInterface = function(Apply0_ctor, pure_func) {
        this.Apply0 = Apply0_ctor;
        this.pure = pure_func;
    };

    /**
     * @function wrapValue
     * @description Extracts the pure function from a PureApplicativeInterface dictionary.
     * This is a Type III clone of `pure`.
     * @param {Object} dict - The PureApplicativeInterface instance.
     * @returns {Function} The specific pure function.
     */
    const wrapValue = (dict) => dict.pure;

    // Export the class and its function.
    exp_obj["PureApplicativeInterface"] = PureApplicativeInterface;
    exp_obj["wrapValue"] = wrapValue;
})(APP_MOD["Control.Applicative"] = APP_MOD["Control.Applicative"] || {});

// Module for array binding (monadic flatMap).
((exp_obj) => {
    "use strict";

    /**
     * @function flatBindArray
     * @description Binds a function that returns an array to each element of an input array,
     * flattening the result into a single array.
     * This is a Type III clone of `exports.arrayBind`.
     * @param {Array} source_data - The input array.
     * @returns {Function} A function that takes a transformation function.
     */
    exp_obj.flatBindArray = (source_data) => {
        return (transformation_fn) => {
            // Early exit for empty or invalid input.
            if (!Array.isArray(source_data) || source_data.length === 0) {
                return [];
            }
            if (typeof transformation_fn !== 'function') {
                console.error("flatBindArray expects a function for transformation_fn.");
                return [];
            }

            const output_list = [];
            const data_length = source_data.length;

            // Iterate through the source data.
            for (let current_index = 0; current_index < data_length; ++current_index) {
                const current_element = source_data[current_index];
                const transformed_segment = transformation_fn(current_element);

                // Ensure the transformation returns an array-like structure.
                if (Array.isArray(transformed_segment)) {
                    // Use modern spread syntax for efficient array concatenation.
                    output_list.push(...transformed_segment);
                } else {
                    console.warn(`Transformation function at index ${current_index} did not return an array.`);
                    // Decide whether to push the non-array, skip, or throw. Here, we skip.
                }
            }
            return output_list;
        };
    };
})(APP_MOD["Control.Bind"] = APP_MOD["Control.Bind"] || {});

// Module defining the Bind and Discard type classes.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const foreign_bind_ops = APP_MOD["Control.Bind"];
    const Control_Class_PureApplicative_Module = APP_MOD["Control.Applicative"];
    const Control_Apply_Module = APP_MOD["Control.Apply"];
    const Control_Class_Category_Module = APP_MOD["Control.Category"]; // Unused.
    const Data_Core_Function_Module = APP_MOD["Data.Core.Function"]; // Unused.
    const Data_Functor_Module = APP_MOD["Data.Functor"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Core.Unit"]; // Unused.

    /**
     * @class MonadicBindInterface
     * @description A type class for types that support monadic binding (flatMap).
     * Extends Apply.
     * This is a Type III clone of `Bind`.
     * @param {Function} Apply0_ctor - Constructor for the Apply superclass.
     * @param {Function} bind_func - The bind operation.
     */
    const MonadicBindInterface = function(Apply0_ctor, bind_func) {
        this.Apply0 = Apply0_ctor;
        this.bind = bind_func;
    };

    /**
     * @class DiscardInterface
     * @description A type class for types that allow discarding the result of a monadic computation.
     * This is a Type III clone of `Discard`.
     * @param {Function} discard_func - The discard operation.
     */
    const DiscardInterface = function(discard_func) {
        this.discard = discard_func;
    };

    /**
     * @function discardResult
     * @description Extracts the discard function from a DiscardInterface dictionary.
     * This is a Type III clone of `discard`.
     * @param {Object} dict - The DiscardInterface instance.
     * @returns {Function} The specific discard function.
     */
    const discardResult = (dict) => dict.discard;

    /**
     * @const arrayMonadicBindInstance
     * @description An instance of MonadicBindInterface for arrays.
     * This is a Type III clone of `bindArray`.
     */
    const arrayMonadicBindInstance = new MonadicBindInterface(
        () => Control_Apply_Module.arrayApplicativeInstance,
        foreign_bind_ops.flatBindArray
    );

    /**
     * @function performBind
     * @description Extracts the bind function from a MonadicBindInterface dictionary.
     * This is a Type III clone of `bind`.
     * @param {Object} dict - The MonadicBindInterface instance.
     * @returns {Function} The specific bind function.
     */
    const performBind = (dict) => dict.bind;

    /**
     * @const unitDiscardInstance
     * @description An instance of DiscardInterface for the Unit type,
     * which simply performs a bind and ignores the result.
     * This is a Type III clone of `discardUnit`.
     */
    const unitDiscardInstance = new DiscardInterface((dictBind) => performBind(dictBind));

    // Export the classes and instances.
    exp_obj["MonadicBindInterface"] = MonadicBindInterface;
    exp_obj["performBind"] = performBind;
    exp_obj["DiscardInterface"] = DiscardInterface;
    exp_obj["discardResult"] = discardResult;
    exp_obj["arrayMonadicBindInstance"] = arrayMonadicBindInstance;
    exp_obj["unitDiscardInstance"] = unitDiscardInstance;
})(APP_MOD["Control.MonadicBind"] = APP_MOD["Control.MonadicBind"] || {});

// Module for folding (reducing) arrays.
((exp_obj) => {
    "use strict";

    /**
     * @function foldRightCollection
     * @description Folds a function over an array from right to left.
     * This is a Type III clone of `exports.foldrArray`.
     * @param {Function} combiner_func - The binary function to apply.
     * @returns {Function} A function that takes an initial value and then the array.
     */
    exp_obj.foldRightCollection = (combiner_func) => {
        return (initial_value) => {
            return (item_list) => {
                // Ensure input is an array.
                if (!Array.isArray(item_list)) {
                    console.error("foldRightCollection expects an array.");
                    return initial_value;
                }
                if (item_list.length === 0) {
                    return initial_value; // No elements to fold.
                }

                let accumulator = initial_value;
                const list_length = item_list.length;

                // Iterate from the last element to the first.
                for (let current_pos = list_length - 1; current_pos >= 0; --current_pos) {
                    accumulator = combiner_func(item_list[current_pos])(accumulator);
                }
                return accumulator;
            };
        };
    };

    /**
     * @function foldLeftCollection
     * @description Folds a function over an array from left to right.
     * This is a Type III clone of `exports.foldlArray`.
     * @param {Function} combiner_func - The binary function to apply.
     * @returns {Function} A function that takes an initial value and then the array.
     */
    exp_obj.foldLeftCollection = (combiner_func) => {
        return (initial_value) => {
            return (item_list) => {
                // Ensure input is an array.
                if (!Array.isArray(item_list)) {
                    console.error("foldLeftCollection expects an array.");
                    return initial_value;
                }
                if (item_list.length === 0) {
                    return initial_value; // No elements to fold.
                }

                let accumulator = initial_value;
                const list_length = item_list.length;

                // Iterate from the first element to the last.
                for (let current_pos = 0; current_pos < list_length; ++current_pos) {
                    accumulator = combiner_func(accumulator)(item_list[current_pos]);
                }
                return accumulator;
            };
        };
    };
})(APP_MOD["Data.Folding"] = APP_MOD["Data.Folding"] || {});

// Module for basic boolean operations.
((exp_obj) => {
    "use strict";

    /**
     * @function booleanAnd
     * @description Performs a logical AND operation between two booleans.
     * This is a Type III clone of `exports.boolConj`.
     * @param {boolean} val_a - The first boolean.
     * @returns {Function} A function that takes the second boolean.
     */
    exp_obj.booleanAnd = (val_a) => {
        return (val_b) => {
            // Explicitly convert to boolean for clarity if inputs might not be strict booleans.
            return Boolean(val_a) && Boolean(val_b);
        };
    };

    /**
     * @function booleanOr
     * @description Performs a logical OR operation between two booleans.
     * This is a Type III clone of `exports.boolDisj`.
     * @param {boolean} val_a - The first boolean.
     * @returns {Function} A function that takes the second boolean.
     */
    exp_obj.booleanOr = (val_a) => {
        return (val_b) => {
            return Boolean(val_a) || Boolean(val_b);
        };
    };

    /**
     * @function booleanNegate
     * @description Performs a logical NOT operation on a boolean.
     * This is a Type III clone of `exports.boolNot`.
     * @param {boolean} bool_val - The boolean to negate.
     * @returns {boolean} The negated boolean.
     */
    exp_obj.booleanNegate = (bool_val) => {
        return !Boolean(bool_val);
    };
})(APP_MOD["Data.Logic"] = APP_MOD["Data.Logic"] || {});

// Module defining the HeytingAlgebra type class for boolean logic.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const foreign_logic_ops = APP_MOD["Data.Logic"];
    const Data_Meta_Symbol_Module = APP_MOD["Data.Symbol"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Core.Unit"]; // Unused.
    const Record_Hazardous_Module = APP_MOD["Record.Unsafe"]; // Unused.
    const Type_Data_RowTuple_Module = APP_MOD["Type.Data.RowList"]; // Unused.

    /**
     * @class LogicAlgebra
     * @description A type class for types that form a Heyting algebra (intuitionistic logic).
     * This is a Type III clone of `HeytingAlgebra`.
     * @param {Function} conj_impl - Conjunction.
     * @param {Function} disj_impl - Disjunction.
     * @param {boolean} ff_val - False value.
     * @param {Function} implies_impl - Implication.
     * @param {Function} not_impl - Negation.
     * @param {boolean} tt_val - True value.
     */
    const LogicAlgebra = function(conj_impl, disj_impl, ff_val, implies_impl, not_impl, tt_val) {
        this.conjunction = conj_impl;
        this.disjunction = disj_impl;
        this.falseVal = ff_val;
        this.implication = implies_impl;
        this.negation = not_impl;
        this.trueVal = tt_val;
    };

    /** Helper function to get true value */
    const getTrueValue = (dict) => dict.trueVal;
    /** Helper function to get not operation */
    const getNegation = (dict) => dict.negation;
    /** Helper function to get implication */
    const getImplication = (dict) => dict.implication;
    /** Helper function to get false value */
    const getFalseValue = (dict) => dict.falseVal;
    /** Helper function to get disjunction */
    const getDisjunction = (dict) => dict.disjunction;
    /** Helper function to get conjunction */
    const getConjunction = (dict) => dict.conjunction;


    /**
     * @const booleanLogicAlgebra
     * @description An instance of LogicAlgebra for booleans.
     * This is a Type III clone of `heytingAlgebraBoolean`.
     */
    const booleanLogicAlgebra = new LogicAlgebra(
        foreign_logic_ops.booleanAnd,
        foreign_logic_ops.booleanOr,
        false, // Explicit false value.
        (antecedent) => (consequent) => {
            // Implication: (A -> B) is equivalent to (!A || B)
            const negated_antecedent = foreign_logic_ops.booleanNegate(antecedent);
            return foreign_logic_ops.booleanOr(negated_antecedent)(consequent);
        },
        foreign_logic_ops.booleanNegate,
        true // Explicit true value.
    );

    // Export the class and its components.
    exp_obj["LogicAlgebra"] = LogicAlgebra;
    exp_obj["trueVal"] = getTrueValue;
    exp_obj["falseVal"] = getFalseValue;
    exp_obj["implication"] = getImplication;
    exp_obj["conjunction"] = getConjunction;
    exp_obj["disjunction"] = getDisjunction;
    exp_obj["negation"] = getNegation;
    exp_obj["booleanLogicAlgebra"] = booleanLogicAlgebra;
})(APP_MOD["Data.HeytingAlgebra"] = APP_MOD["Data.HeytingAlgebra"] || {});

// Module defining the Semigroup type class.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const foreign_semigroup_ops = APP_MOD["Data.Semigroup"]; // This seems to be a self-reference in original PS.
    const Data_Meta_Symbol_Module = APP_MOD["Data.Symbol"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Core.Unit"]; // Unused.
    const Data_Void_Module = APP_MOD["Data.Void"]; // Unused.
    const Record_Hazardous_Module = APP_MOD["Record.Unsafe"]; // Unused.
    const Type_Data_RowTuple_Module = APP_MOD["Type.Data.RowList"]; // Unused.

    /**
     * @class SemigroupInterface
     * @description A type class for types that have an associative binary operation.
     * This is a Type III clone of `Semigroup`.
     * @param {Function} combine_func - The associative binary operation.
     */
    const SemigroupInterface = function(combine_func) {
        this.combineElements = combine_func;
    };

    /**
     * @function combineElements
     * @description Extracts the combine operation from a SemigroupInterface dictionary.
     * This is a Type III clone of `append`.
     * @param {Object} dict - The SemigroupInterface instance.
     * @returns {Function} The specific combine function.
     */
    const combineElements = (dict) => dict.combineElements;

    // Export the class and its function.
    exp_obj["SemigroupInterface"] = SemigroupInterface;
    exp_obj["combineElements"] = combineElements;
})(APP_MOD["Data.Semigroup"] = APP_MOD["Data.Semigroup"] || {});

// Module defining the Monoid type class.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const Data_Primitive_Boolean_Module = APP_MOD["Data.Boolean"]; // Unused.
    const Data_Equality_Module = APP_MOD["Data.Eq"]; // Unused.
    const Data_Algebra_EuclideanRing_Module = APP_MOD["Data.EuclideanRing"]; // Unused.
    const Data_Ordering_Module = APP_MOD["Data.Ord"]; // Unused.
    const Data_Comparisons_Module = APP_MOD["Data.Ordering"]; // Unused.
    const Data_Semigroup_Module = APP_MOD["Data.Semigroup"];
    const Data_Meta_Symbol_Module = APP_MOD["Data.Symbol"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Core.Unit"]; // Unused.
    const Record_Hazardous_Module = APP_MOD["Record.Unsafe"]; // Unused.
    const Type_Data_RowTuple_Module = APP_MOD["Type.Data.RowList"]; // Unused.

    /**
     * @class MonoidInterface
     * @description A type class for Semigroups that also have an identity element.
     * This is a Type III clone of `Monoid`.
     * @param {Function} Semigroup0_ctor - Constructor for the Semigroup superclass.
     * @param {*} empty_val - The identity element.
     */
    const MonoidInterface = function(Semigroup0_ctor, empty_val) {
        this.Semigroup0 = Semigroup0_ctor;
        this.emptyElement = empty_val;
    };

    /**
     * @function emptyElement
     * @description Extracts the identity element from a MonoidInterface dictionary.
     * This is a Type III clone of `mempty`.
     * @param {Object} dict - The MonoidInterface instance.
     * @returns {*} The identity element.
     */
    const emptyElement = (dict) => dict.emptyElement;

    // Export the class and its function.
    exp_obj["MonoidInterface"] = MonoidInterface;
    exp_obj["emptyElement"] = emptyElement;
})(APP_MOD["Data.Monoid"] = APP_MOD["Data.Monoid"] || {});

// Module for the Maybe (Optional) type.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const Control_Class_Alternative_Module = APP_MOD["Control.Alt"]; // Unused.
    const Control_Class_Option_Module = APP_MOD["Control.Alternative"]; // Unused.
    const Control_Class_PureApplicative_Module = APP_MOD["Control.Applicative"]; // Unused.
    const Control_Apply_Module = APP_MOD["Control.Apply"]; // Unused.
    const Control_MonadicBind_Module = APP_MOD["Control.Bind"]; // Unused.
    const Control_Class_Category_Module = APP_MOD["Control.Category"]; // Unused.
    const Control_Class_Extend_Module = APP_MOD["Control.Extend"]; // Unused.
    const Control_Class_Monad_Module = APP_MOD["Control.Monad"]; // Unused.
    const Control_Class_MonadZero_Module = APP_MOD["Control.MonadZero"]; // Unused.
    const Control_Class_Plus_Module = APP_MOD["Control.Plus"]; // Unused.
    const Data_Bounds_Module = APP_MOD["Data.Bounded"]; // Unused.
    const Data_Equality_Module = APP_MOD["Data.Eq"]; // Unused.
    const Data_Core_Function_Module = APP_MOD["Data.Core.Function"]; // Unused.
    const Data_Functor_Module = APP_MOD["Data.Functor"]; // Unused.
    const Data_Mapper_Invariant_Module = APP_MOD["Data.Functor.Invariant"]; // Unused.
    const Data_Monoid_Module = APP_MOD["Data.Monoid"]; // Unused.
    const Data_Ordering_Module = APP_MOD["Data.Ord"]; // Unused.
    const Data_Comparisons_Module = APP_MOD["Data.Ordering"]; // Unused.
    const Data_Semigroup_Module = APP_MOD["Data.Semigroup"]; // Unused.
    const Data_Show_Module = APP_MOD["Data.Show"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Unit"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @class OptionalNone
     * @description Represents the absence of a value.
     * This is a Type III clone of `Nothing`.
     */
    const OptionalNone = function() {
        // Private constructor pattern for singleton.
    };
    OptionalNone.value = new OptionalNone(); // Singleton instance.

    /**
     * @class OptionalSome
     * @description Represents the presence of a value.
     * This is a Type III clone of `Just`.
     * @param {*} item_content - The value contained within.
     */
    const OptionalSome = function(item_content) {
        this.item_content = item_content;
    };
    // Factory method for creating instances.
    OptionalSome.create = (item_content) => new OptionalSome(item_content);

    /**
     * @function handleOptional
     * @description Deconstructs an Optional (Maybe) value, applying one function if it's None
     * and another if it's Some.
     * This is a Type III clone of `maybe`.
     * @param {*} default_val - The value to return if the Optional is None.
     * @param {Function} some_handler - A function to apply to the value if it's Some.
     * @returns {Function} A function that takes the Optional value.
     */
    const handleOptional = (default_val) => (some_handler) => (optional_item) => {
        // Use explicit if/else if for pattern matching.
        if (optional_item instanceof OptionalNone) {
            return default_val;
        } else if (optional_item instanceof OptionalSome) {
            return some_handler(optional_item.item_content);
        } else {
            // Add a guard clause for unexpected types, common in JS.
            console.error("handleOptional received an unexpected type:", optional_item);
            throw new Error("Failed pattern match in handleOptional: Invalid Optional type.");
        }
    };

    // Export the Optional types and the handler.
    exp_obj["OptionalNone"] = OptionalNone;
    exp_obj["OptionalSome"] = OptionalSome;
    exp_obj["handleOptional"] = handleOptional;
})(APP_MOD["Data.Optional"] = APP_MOD["Data.Optional"] || {});

// Module for integer arithmetic.
((exp_obj) => {
    "use strict";

    /**
     * @function integerSum
     * @description Adds two integers, ensuring the result is an integer.
     * This is a Type III clone of `exports.intAdd`.
     * @param {number} op_a - The first integer operand.
     * @returns {Function} A function that takes the second integer operand.
     */
    exp_obj.integerSum = (op_a) => {
        return (op_b) => {
            // Use bitwise OR 0 for explicit integer conversion and addition.
            return (op_a + op_b) | 0;
        };
    };

    /**
     * @function integerProduct
     * @description Multiplies two integers, ensuring the result is an integer.
     * This is a Type III clone of `exports.intMul`.
     * @param {number} op_a - The first integer operand.
     * @returns {Function} A function that takes the second integer operand.
     */
    exp_obj.integerProduct = (op_a) => {
        return (op_b) => {
            // Use bitwise OR 0 for explicit integer conversion and multiplication.
            return (op_a * op_b) | 0;
        };
    };
})(APP_MOD["Data.IntegerOps"] = APP_MOD["Data.IntegerOps"] || {});

// Module defining the Semiring type class.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const foreign_integer_ops = APP_MOD["Data.IntegerOps"];
    const Data_Meta_Symbol_Module = APP_MOD["Data.Symbol"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Core.Unit"]; // Unused.
    const Record_Hazardous_Module = APP_MOD["Record.Unsafe"]; // Unused.
    const Type_Data_Row_Module = APP_MOD["Type.Data.Row"]; // Unused.
    const Type_Data_RowTuple_Module = APP_MOD["Type.Data.RowList"]; // Unused.

    /**
     * @class SemiringInterface
     * @description A type class for types that form a semiring (addition and multiplication).
     * This is a Type III clone of `Semiring`.
     * @param {Function} add_op - The addition operation.
     * @param {Function} mul_op - The multiplication operation.
     * @param {number} one_val - The multiplicative identity.
     * @param {number} zero_val - The additive identity.
     */
    const SemiringInterface = function(add_op, mul_op, one_val, zero_val) {
        this.addition = add_op;
        this.multiplication = mul_op;
        this.unitOne = one_val;
        this.unitZero = zero_val;
    };

    // Helper functions to extract properties from the dictionary.
    const getUnitZero = (dict) => dict.unitZero;
    const getUnitOne = (dict) => dict.unitOne;
    const getMultiplication = (dict) => dict.multiplication;
    const getAddition = (dict) => dict.addition;

    /**
     * @const integerSemiringInstance
     * @description An instance of SemiringInterface for integers.
     * This is a Type III clone of `semiringInt`.
     */
    const integerSemiringInstance = new SemiringInterface(
        foreign_integer_ops.integerSum,
        foreign_integer_ops.integerProduct,
        1, // Multiplicative identity for integers.
        0 // Additive identity for integers.
    );

    // Export the class and its components.
    exp_obj["SemiringInterface"] = SemiringInterface;
    exp_obj["addition"] = getAddition;
    exp_obj["unitZero"] = getUnitZero;
    exp_obj["multiplication"] = getMultiplication;
    exp_obj["unitOne"] = getUnitOne;
    exp_obj["integerSemiringInstance"] = integerSemiringInstance;
})(APP_MOD["Data.Semiring"] = APP_MOD["Data.Semiring"] || {});

// Module for the Conj Monoid (conjunction).
((exp_obj) => {
    "use strict";
    // Dependencies.
    const Control_Class_PureApplicative_Module = APP_MOD["Control.Applicative"]; // Unused.
    const Control_Apply_Module = APP_MOD["Control.Apply"]; // Unused.
    const Control_MonadicBind_Module = APP_MOD["Control.Bind"]; // Unused.
    const Control_Class_Monad_Module = APP_MOD["Control.Monad"]; // Unused.
    const Data_Bounds_Module = APP_MOD["Data.Bounded"]; // Unused.
    const Data_Equality_Module = APP_MOD["Data.Eq"]; // Unused.
    const Data_Functor_Module = APP_MOD["Data.Functor"]; // Unused.
    const Data_HeytingAlgebra_Module = APP_MOD["Data.HeytingAlgebra"];
    const Data_Monoid_Module = APP_MOD["Data.Monoid"];
    const Data_Ordering_Module = APP_MOD["Data.Ord"]; // Unused.
    const Data_Semigroup_Module = APP_MOD["Data.Semigroup"];
    const Data_Semiring_Module = APP_MOD["Data.Semiring"]; // Unused.
    const Data_Show_Module = APP_MOD["Data.Show"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @function ConjunctionWrapper
     * @description A newtype wrapper for boolean values that defines a Monoid instance
     * where the operation is conjunction (logical AND).
     * This is a Type III clone of `Conj`.
     * @param {boolean} x - The boolean value.
     * @returns {boolean} The wrapped boolean.
     */
    const ConjunctionWrapper = (x) => x;

    /**
     * @function conjunctionSemigroup
     * @description Creates a Semigroup instance for ConjunctionWrapper using the HeytingAlgebra's conjunction.
     * This is a Type III clone of `semigroupConj`.
     * @param {Object} dictHeytingAlgebra - The HeytingAlgebra instance for the underlying type.
     * @returns {SemigroupInterface} A Semigroup instance.
     */
    const conjunctionSemigroup = (dictHeytingAlgebra) => {
        return new Data_Semigroup_Module.SemigroupInterface(
            (val_a) => (val_b) => Data_HeytingAlgebra_Module.conjunction(dictHeytingAlgebra)(val_a)(val_b)
        );
    };

    /**
     * @function conjunctionMonoid
     * @description Creates a Monoid instance for ConjunctionWrapper using the HeytingAlgebra's conjunction.
     * The identity element is the HeytingAlgebra's true value.
     * This is a Type III clone of `monoidConj`.
     * @param {Object} dictHeytingAlgebra - The HeytingAlgebra instance for the underlying type.
     * @returns {MonoidInterface} A Monoid instance.
     */
    const conjunctionMonoid = (dictHeytingAlgebra) => {
        return new Data_Monoid_Module.MonoidInterface(
            () => conjunctionSemigroup(dictHeytingAlgebra), // Lazily provide Semigroup.
            Data_HeytingAlgebra_Module.trueVal(dictHeytingAlgebra) // Identity element is 'true'.
        );
    };

    // Export the wrapper and instances.
    exp_obj["ConjunctionWrapper"] = ConjunctionWrapper;
    exp_obj["conjunctionSemigroup"] = conjunctionSemigroup;
    exp_obj["conjunctionMonoid"] = conjunctionMonoid;
})(APP_MOD["Data.Monoid.Conjunction"] = APP_MOD["Data.Monoid.Conjunction"] || {});

// Module defining the Newtype type class.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const Control_Class_BinaryOp_Module = APP_MOD["Control.Class.BinaryOp"]; // Unused.
    const Data_Core_Function_Module = APP_MOD["Data.Core.Function"]; // Unused.
    const Data_Functor_Module = APP_MOD["Data.Functor"];
    const Data_Monoid_Addition_Module = APP_MOD["Data.Monoid.Additive"]; // Unused.
    const Data_Monoid_Conjunction_Module = APP_MOD["Data.Monoid.Conjunction"];
    const Data_Monoid_Disjunction_Module = APP_MOD["Data.Monoid.Disj"]; // Unused.
    const Data_Monoid_Reversed_Module = APP_MOD["Data.Monoid.Dual"]; // Unused.
    const Data_Monoid_Endomorphism_Module = APP_MOD["Data.Monoid.Endo"]; // Unused.
    const Data_Monoid_Product_Module = APP_MOD["Data.Monoid.Multiplicative"]; // Unused.
    const Data_Semigroup_Head_Module = APP_MOD["Data.Semigroup.First"]; // Unused.
    const Data_Semigroup_Tail_Module = APP_MOD["Data.Semigroup.Last"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @class NewtypeWrapper
     * @description A type class for newtypes, providing wrap and unwrap operations.
     * This is a Type III clone of `Newtype`.
     * @param {Function} unwrap_func - Function to extract the inner value.
     * @param {Function} wrap_func - Function to wrap a value.
     */
    const NewtypeWrapper = function(unwrap_func, wrap_func) {
        this.extractValue = unwrap_func;
        this.encapsulateValue = wrap_func;
    };

    /**
     * @function encapsulateValue
     * @description Extracts the wrap function from a NewtypeWrapper dictionary.
     * This is a Type III clone of `wrap`.
     * @param {Object} dict - The NewtypeWrapper instance.
     * @returns {Function} The specific wrap function.
     */
    const encapsulateValue = (dict) => dict.encapsulateValue;

    /**
     * @function extractValue
     * @description Extracts the unwrap function from a NewtypeWrapper dictionary.
     * This is a Type III clone of `unwrap`.
     * @param {Object} dict - The NewtypeWrapper instance.
     * @returns {Function} The specific unwrap function.
     */
    const extractValue = (dict) => dict.extractValue;

    /**
     * @const conjunctionNewtype
     * @description A NewtypeWrapper instance for the ConjunctionWrapper.
     * This is a Type III clone of `newtypeConj`.
     */
    const conjunctionNewtype = new NewtypeWrapper(
        (wrapped_val) => wrapped_val, // Unwrapping is identity for simple newtype.
        Data_Monoid_Conjunction_Module.ConjunctionWrapper
    );

    /**
     * @function applyFunctorially
     * @description A higher-order function that applies a transformation to a function
     * operating on newtype-wrapped functor values.
     * This is a Type III clone of `alaF`.
     * @param {Object} dictFunctor1 - Functor instance for the outer functor.
     * @param {Object} dictFunctor2 - Functor instance for the inner functor.
     * @param {Object} dictNewtype1 - Newtype instance for the outer newtype.
     * @param {Object} dictNewtype2 - Newtype instance for the inner newtype.
     * @param {Function} newtype_ctor - The constructor for the newtype being worked with.
     * @returns {Function} A curried function for the alaF operation.
     */
    const applyFunctorially = (dictFunctor1) => (dictFunctor2) => (dictNewtype1) => (dictNewtype2) => (newtype_ctor) => {
        return (target_function) => {
            return (input_data) => {
                // Step 1: Map the inner newtype's wrap function over the input data using dictFunctor1.
                const wrapped_input = Data_Functor_Module.applyMapper(dictFunctor1)(encapsulateValue(dictNewtype1))(input_data);

                // Step 2: Apply the target function to the wrapped input.
                const intermediate_result = target_function(wrapped_input);

                // Step 3: Map the outer newtype's unwrap function over the result using dictFunctor2.
                const final_unwrapped_result = Data_Functor_Module.applyMapper(dictFunctor2)(extractValue(dictNewtype2))(intermediate_result);

                return final_unwrapped_result;
            };
        };
    };

    // Export the newtype components.
    exp_obj["extractValue"] = extractValue;
    exp_obj["encapsulateValue"] = encapsulateValue;
    exp_obj["NewtypeWrapper"] = NewtypeWrapper;
    exp_obj["applyFunctorially"] = applyFunctorially;
    exp_obj["conjunctionNewtype"] = conjunctionNewtype;
})(APP_MOD["Data.Newtype"] = APP_MOD["Data.Newtype"] || {});

// Module defining the Foldable type class.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const foreign_folding_ops = APP_MOD["Data.Folding"];
    const Control_Class_Alternative_Module = APP_MOD["Control.Alt"]; // Unused.
    const Control_Class_PureApplicative_Module = APP_MOD["Control.Applicative"]; // Unused.
    const Control_Apply_Module = APP_MOD["Control.Apply"]; // Unused.
    const Control_MonadicBind_Module = APP_MOD["Control.Bind"]; // Unused.
    const Control_Class_Category_Module = APP_MOD["Control.Category"]; // Unused.
    const Control_Class_Plus_Module = APP_MOD["Control.Plus"]; // Unused.
    const Control_Class_BinaryOp_Module = APP_MOD["Control.Class.BinaryOp"]; // Unused.
    const Data_Equality_Module = APP_MOD["Data.Eq"]; // Unused.
    const Data_Core_Function_Module = APP_MOD["Data.Core.Function"]; // Unused.
    const Data_Functor_Module = APP_MOD["Data.Functor"];
    const Data_HeytingAlgebra_Module = APP_MOD["Data.HeytingAlgebra"];
    const Data_Optional_Module = APP_MOD["Data.Optional"]; // Unused.
    const Data_Maybe_First_Module = APP_MOD["Data.Maybe.First"]; // Unused.
    const Data_Maybe_Last_Module = APP_MOD["Data.Maybe.Last"]; // Unused.
    const Data_Monoid_Module = APP_MOD["Data.Monoid"];
    const Data_Monoid_Addition_Module = APP_MOD["Data.Monoid.Additive"]; // Unused.
    const Data_Monoid_Conjunction_Module = APP_MOD["Data.Monoid.Conjunction"];
    const Data_Monoid_Disjunction_Module = APP_MOD["Data.Monoid.Disj"]; // Unused.
    const Data_Monoid_Reversed_Module = APP_MOD["Data.Monoid.Dual"]; // Unused.
    const Data_Monoid_Endomorphism_Module = APP_MOD["Data.Monoid.Endo"]; // Unused.
    const Data_Monoid_Product_Module = APP_MOD["Data.Monoid.Multiplicative"]; // Unused.
    const Data_Newtype_Module = APP_MOD["Data.Newtype"];
    const Data_Ordering_Module = APP_MOD["Data.Ord"]; // Unused.
    const Data_Comparisons_Module = APP_MOD["Data.Ordering"]; // Unused.
    const Data_Semigroup_Module = APP_MOD["Data.Semigroup"];
    const Data_Semiring_Module = APP_MOD["Data.Semiring"];
    const Data_Core_Unit_Module = APP_MOD["Data.Unit"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @class FoldableInterface
     * @description A type class for data structures that can be folded (reduced) to a single value.
     * This is a Type III clone of `Foldable`.
     * @param {Function} mapAndFold_func - The foldMap operation.
     * @param {Function} foldLeft_func - The foldl operation.
     * @param {Function} foldRight_func - The foldr operation.
     */
    const FoldableInterface = function(mapAndFold_func, foldLeft_func, foldRight_func) {
        this.mapAndFold = mapAndFold_func;
        this.foldLeft = foldLeft_func;
        this.foldRight = foldRight_func;
    };

    // Helper functions to extract operations.
    const getFoldRight = (dict) => dict.foldRight;
    const getFoldLeft = (dict) => dict.foldLeft;
    const getMapAndFold = (dict) => dict.mapAndFold;

    /**
     * @function calculateSum
     * @description Calculates the sum of all elements in a foldable structure.
     * This is a Type III clone of `sum`.
     * @param {Object} dictFoldable - The Foldable instance.
     * @param {Object} dictSemiring - The Semiring instance for the element type.
     * @returns {Function} A function that takes the foldable structure.
     */
    const calculateSum = (dictFoldable) => (dictSemiring) => {
        const adder_func = Data_Semiring_Module.addition(dictSemiring);
        const zero_element = Data_Semiring_Module.unitZero(dictSemiring);
        return getFoldLeft(dictFoldable)(adder_func)(zero_element);
    };

    /**
     * @function defaultFoldMapRight
     * @description A default implementation for foldMap using foldr.
     * This is a Type III clone of `foldMapDefaultR`.
     * @param {Object} dictFoldable - The Foldable instance.
     * @param {Object} dictMonoid - The Monoid instance for the result type.
     * @returns {Function} A function that takes a mapping function and then the foldable structure.
     */
    const defaultFoldMapRight = (dictFoldable) => (dictMonoid) => (mapper_func) => {
        const semigroup_dict = dictMonoid.Semigroup0(); // Get the underlying Semigroup.
        const append_op = Data_Semigroup_Module.combineElements(semigroup_dict);
        const identity_element = Data_Monoid_Module.emptyElement(dictMonoid);

        return getFoldRight(dictFoldable)(
            (item_x) => (accumulator) => append_op(mapper_func(item_x))(accumulator)
        )(identity_element);
    };

    /**
     * @const arrayFoldableInstance
     * @description An instance of FoldableInterface for arrays.
     * This is a Type III clone of `foldableArray`.
     */
    const arrayFoldableInstance = new FoldableInterface(
        (dictMonoid) => defaultFoldMapRight(arrayFoldableInstance)(dictMonoid), // foldMap implementation.
        foreign_folding_ops.foldLeftCollection, // foldl implementation.
        foreign_folding_ops.foldRightCollection // foldr implementation.
    );

    /**
     * @function checkAll
     * @description Checks if all elements in a foldable structure satisfy a given predicate.
     * This is a Type III clone of `all`.
     * @param {Object} dictFoldable - The Foldable instance.
     * @param {Object} dictHeytingAlgebra - The HeytingAlgebra instance for booleans.
     * @returns {Function} A function that takes a predicate and then the foldable structure.
     */
    const checkAll = (dictFoldable) => (dictHeytingAlgebra) => {
        const boolean_predicate_mapper = (element) => Data_Monoid_Conjunction_Module.ConjunctionWrapper(element);
        const conjunction_monoid_instance = Data_Monoid_Conjunction_Module.conjunctionMonoid(dictHeytingAlgebra);

        // This uses alaF to transform the foldMap operation to work with the Conjunction newtype.
        const transformed_fold_map = Data_Newtype_Module.applyFunctorially(
            Data_Functor_Module.functionMapperInstance
        )(
            Data_Functor_Module.functionMapperInstance
        )(
            Data_Newtype_Module.conjunctionNewtype
        )(
            Data_Newtype_Module.conjunctionNewtype
        )(
            Data_Monoid_Conjunction_Module.ConjunctionWrapper
        )(
            getMapAndFold(dictFoldable)(conjunction_monoid_instance)
        );

        return (predicate_func) => transformed_fold_map(predicate_func);
    };

    // Export the class and its components.
    exp_obj["FoldableInterface"] = FoldableInterface;
    exp_obj["getFoldRight"] = getFoldRight;
    exp_obj["getFoldLeft"] = getFoldLeft;
    exp_obj["getMapAndFold"] = getMapAndFold;
    exp_obj["defaultFoldMapRight"] = defaultFoldMapRight;
    exp_obj["checkAll"] = checkAll;
    exp_obj["calculateSum"] = calculateSum;
    exp_obj["arrayFoldableInstance"] = arrayFoldableInstance;
})(APP_MOD["Data.Foldable"] = APP_MOD["Data.Foldable"] || {});

// Module for the Either type.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const Control_Class_Alternative_Module = APP_MOD["Control.Alt"]; // Unused.
    const Control_Class_PureApplicative_Module = APP_MOD["Control.Applicative"];
    const Control_Apply_Module = APP_MOD["Control.Apply"];
    const Control_MonadicBind_Module = APP_MOD["Control.MonadicBind"];
    const Control_Class_Extend_Module = APP_MOD["Control.Extend"]; // Unused.
    const Control_Class_Monad_Module = APP_MOD["Control.Monad"]; // Unused.
    const Control_Class_BinaryOp_Module = APP_MOD["Control.Class.BinaryOp"]; // Unused.
    const Data_Bifoldable_Module = APP_MOD["Data.Bifoldable"]; // Unused.
    const Data_Bifunctor_Module = APP_MOD["Data.Bifunctor"]; // Unused.
    const Data_Bitraversable_Module = APP_MOD["Data.Bitraversable"]; // Unused.
    const Data_Bounds_Module = APP_MOD["Data.Bounded"]; // Unused.
    const Data_Equality_Module = APP_MOD["Data.Eq"]; // Unused.
    const Data_Foldable_Module = APP_MOD["Data.Foldable"]; // Unused.
    const Data_FoldableWithIndex_Module = APP_MOD["Data.FoldableWithIndex"]; // Unused.
    const Data_Core_Function_Module = APP_MOD["Data.Core.Function"]; // Unused.
    const Data_Functor_Module = APP_MOD["Data.Functor"];
    const Data_Mapper_Invariant_Module = APP_MOD["Data.Functor.Invariant"]; // Unused.
    const Data_FunctorWithIndex_Module = APP_MOD["Data.FunctorWithIndex"]; // Unused.
    const Data_Optional_Module = APP_MOD["Data.Optional"];
    const Data_Monoid_Module = APP_MOD["Data.Monoid"]; // Unused.
    const Data_Ordering_Module = APP_MOD["Data.Ord"]; // Unused.
    const Data_Comparisons_Module = APP_MOD["Data.Ordering"]; // Unused.
    const Data_Semigroup_Module = APP_MOD["Data.Semigroup"]; // Unused.
    const Data_Show_Module = APP_MOD["Data.Show"]; // Unused.
    const Data_Traversable_Module = APP_MOD["Data.Traversable"]; // Unused.
    const Data_TraversableWithIndex_Module = APP_MOD["Data.TraversableWithIndex"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Unit"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @class EitherFailure
     * @description Represents a Left value in the Either type, indicating an error or failure.
     * This is a Type III clone of `Left`.
     * @param {*} error_value - The error value.
     */
    const EitherFailure = function(error_value) {
        this.error_value = error_value;
    };
    EitherFailure.create = (error_value) => new EitherFailure(error_value);

    /**
     * @class EitherSuccess
     * @description Represents a Right value in the Either type, indicating a successful result.
     * This is a Type III clone of `Right`.
     * @param {*} success_value - The success value.
     */
    const EitherSuccess = function(success_value) {
        this.success_value = success_value;
    };
    EitherSuccess.create = (success_value) => new EitherSuccess(success_value);

    /**
     * @function toEitherFailure
     * @description Converts an Optional (Maybe) value into an Either value.
     * If the Optional is None, it becomes a Left with the provided error.
     * If it's Some, it becomes a Right with the contained value.
     * This is a Type III clone of `note`.
     * @param {*} error_val - The error value for the Left case.
     * @returns {Function} A function that takes the Optional value.
     */
    const toEitherFailure = (error_val) => {
        return Data_Optional_Module.handleOptional(new EitherFailure(error_val))(EitherSuccess.create);
    };

    /**
     * @const eitherMapperInstance
     * @description A Functor instance for the Either type.
     * This is a Type III clone of `functorEither`.
     */
    const eitherMapperInstance = new Data_Functor_Module.MapperInterface((transformer_func) => (either_val) => {
        if (either_val instanceof EitherFailure) {
            return new EitherFailure(either_val.error_value);
        } else if (either_val instanceof EitherSuccess) {
            // Apply the function to the success value.
            return new EitherSuccess(transformer_func(either_val.success_value));
        }
        // Guard for unexpected types.
        console.error("eitherMapperInstance received an invalid Either type:", either_val);
        throw new Error("Failed pattern match in eitherMapperInstance: Invalid Either type.");
    });

    /**
     * @function extractSuccessValue
     * @description Extracts the success value from an EitherSuccess, throwing an error if it's an EitherFailure.
     * This is a Type III clone of `fromRight`.
     * @param {Object} dictPartial - The Partial type class dictionary (unused in JS).
     * @returns {Function} A function that takes the Either value.
     */
    const extractSuccessValue = (dictPartial) => (either_val) => {
        if (either_val instanceof EitherSuccess) {
            return either_val.success_value;
        }
        // Explicitly check for failure and throw.
        if (either_val instanceof EitherFailure) {
            console.error("Attempted to extract success value from Left:", either_val.error_value);
            throw new Error("Failed to extract value: Either value was Left.");
        }
        // Guard for unexpected types.
        console.error("extractSuccessValue received an invalid Either type:", either_val);
        throw new Error("Failed pattern match in extractSuccessValue: Invalid Either type.");
    };

    /**
     * @function handleEither
     * @description Deconstructs an Either value, applying one function if it's Left
     * and another if it's Right.
     * This is a Type III clone of `either`.
     * @param {Function} failure_handler - Function for the Left case.
     * @param {Function} success_handler - Function for the Right case.
     * @returns {Function} A function that takes the Either value.
     */
    const handleEither = (failure_handler) => (success_handler) => (either_val) => {
        if (either_val instanceof EitherFailure) {
            return failure_handler(either_val.error_value);
        } else if (either_val instanceof EitherSuccess) {
            return success_handler(either_val.success_value);
        }
        // Guard for unexpected types.
        console.error("handleEither received an invalid Either type:", either_val);
        throw new Error("Failed pattern match in handleEither: Invalid Either type.");
    };

    /**
     * @const eitherApplicativeInstance
     * @description An Apply instance for the Either type.
     * This is a Type III clone of `applyEither`.
     */
    const eitherApplicativeInstance = new Control_Apply_Module.ApplicativeInterface(
        () => eitherMapperInstance, // Functor superclass.
        (function_either) => (value_either) => {
            if (function_either instanceof EitherFailure) {
                return new EitherFailure(function_either.error_value); // Propagate Left.
            } else if (function_either instanceof EitherSuccess) {
                // If function is Right, map it over the value_either.
                const inner_transformer = function_either.success_value;
                return Data_Functor_Module.applyMapper(eitherMapperInstance)(inner_transformer)(value_either);
            }
            // Guard for unexpected types.
            console.error("eitherApplicativeInstance received invalid function_either:", function_either);
            throw new Error("Failed pattern match in eitherApplicativeInstance: Invalid function_either type.");
        }
    );

    /**
     * @const eitherMonadicBindInstance
     * @description A Bind instance for the Either type.
     * This is a Type III clone of `bindEither`.
     */
    const eitherMonadicBindInstance = new Control_MonadicBind_Module.MonadicBindInterface(
        () => eitherApplicativeInstance, // Apply superclass.
        handleEither(
            (error_val) => (ignored_func) => new EitherFailure(error_val) // Propagate Left.
        )(
            (success_val) => (transformation_func) => transformation_func(success_val) // Apply function to Right value.
        )
    );

    /**
     * @const eitherPureApplicativeInstance
     * @description An Applicative instance for the Either type.
     * This is a Type III clone of `applicativeEither`.
     */
    const eitherPureApplicativeInstance = new Control_Class_PureApplicative_Module.PureApplicativeInterface(
        () => eitherApplicativeInstance, // Apply superclass.
        EitherSuccess.create // Pure operation simply wraps a value in Right.
    );

    // Export the types and instances.
    exp_obj["EitherFailure"] = EitherFailure;
    exp_obj["EitherSuccess"] = EitherSuccess;
    exp_obj["handleEither"] = handleEither;
    exp_obj["extractSuccessValue"] = extractSuccessValue;
    exp_obj["toEitherFailure"] = toEitherFailure;
    exp_obj["eitherMapperInstance"] = eitherMapperInstance;
    exp_obj["eitherApplicativeInstance"] = eitherApplicativeInstance;
    exp_obj["eitherPureApplicativeInstance"] = eitherPureApplicativeInstance;
    exp_obj["eitherMonadicBindInstance"] = eitherMonadicBindInstance;
})(APP_MOD["Data.Either"] = APP_MOD["Data.Either"] || {});

// Module for monadic recursion (tail recursion optimization).
((exp_obj) => {
    "use strict";
    // Dependencies.
    const Control_Class_PureApplicative_Module = APP_MOD["Control.Applicative"]; // Unused.
    const Control_MonadicBind_Module = APP_MOD["Control.MonadicBind"]; // Unused.
    const Control_Class_Monad_Module = APP_MOD["Control.Monad"]; // Unused.
    const Control_Class_BinaryOp_Module = APP_MOD["Control.Class.BinaryOp"]; // Unused.
    const Data_Bifunctor_Module = APP_MOD["Data.Bifunctor"]; // Unused.
    const Data_Either_Module = APP_MOD["Data.Either"]; // Unused.
    const Data_Functor_Module = APP_MOD["Data.Functor"]; // Unused.
    const Data_Identity_Module = APP_MOD["Data.Identity"]; // Unused.
    const Data_Optional_Module = APP_MOD["Data.Optional"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Unit"]; // Unused.
    const Effect_Module = APP_MOD["Effect"]; // Unused.
    const Effect_Ref_Module = APP_MOD["Effect.Ref"]; // Unused.
    const Partial_Unsafe_Module = APP_MOD["Partial.Unsafe"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @class IterateLoop
     * @description Represents a continuation in a tail-recursive loop.
     * This is a Type III clone of `Loop`.
     * @param {*} next_state - The state for the next iteration.
     */
    const IterateLoop = function(next_state) {
        this.next_state = next_state;
    };
    IterateLoop.create = (next_state) => new IterateLoop(next_state);

    /**
     * @class IterateDone
     * @description Represents the completion of a tail-recursive loop.
     * This is a Type III clone of `Done`.
     * @param {*} final_result - The final result of the computation.
     */
    const IterateDone = function(final_result) {
        this.final_result = final_result;
    };
    IterateDone.create = (final_result) => new IterateDone(final_result);

    /**
     * @function performTailRecursion
     * @description Implements a trampoline-style tail recursion to avoid stack overflow.
     * This is a Type III clone of `tailRec`.
     * @param {Function} step_function - A function that takes a state and returns either IterateLoop or IterateDone.
     * @returns {Function} A function that takes the initial state and returns the final result.
     */
    const performTailRecursion = (step_function) => {
        // The actual loop executor.
        const loop_executor = (initial_loop_state) => {
            let current_iteration_state = initial_loop_state;
            let tail_call_optimized_done = false;
            let tail_call_optimized_result;

            // Use a while loop to simulate tail calls.
            while (!tail_call_optimized_done) {
                const step_outcome = current_iteration_state; // The result of the previous step or initial state.

                if (step_outcome instanceof IterateLoop) {
                    // If it's a Loop, update the state and continue the loop.
                    current_iteration_state = step_function(step_outcome.next_state);
                } else if (step_outcome instanceof IterateDone) {
                    // If it's Done, set the result and break the loop.
                    tail_call_optimized_done = true;
                    tail_call_optimized_result = step_outcome.final_result;
                } else {
                    // Guard clause for unexpected return types from step_function.
                    console.error("Unexpected return type from step_function:", step_outcome);
                    throw new Error("performTailRecursion: step_function returned an invalid type.");
                }
            }
            return tail_call_optimized_result;
        };

        // The public interface: takes the initial argument, applies the step function once,
        // then passes the result to the loop executor.
        return (initial_arg_for_step) => {
            const first_step_result = step_function(initial_arg_for_step);
            return loop_executor(first_step_result);
        };
    };

    // Export the loop control types and the tail recursion function.
    exp_obj["IterateLoop"] = IterateLoop;
    exp_obj["IterateDone"] = IterateDone;
    exp_obj["performTailRecursion"] = performTailRecursion;
})(APP_MOD["Control.Monad.Rec.Class"] = APP_MOD["Control.Monad.Rec.Class"] || {});

// Module for core array operations (foreign imports).
((exp_obj) => {
    // No "use strict" for this foreign module.

    /**
     * @function getLength
     * @description Returns the number of elements in an array.
     * This is a Type III clone of `exports.length`.
     * @param {Array} xs - The input array.
     * @returns {number} The length of the array.
     */
    exp_obj.getLength = (xs) => xs.length;

    /**
     * @function getAtIndexImplementation
     * @description Provides a safe way to access an element at a given index in an array,
     * returning an OptionalSome if found, OptionalNone otherwise.
     * This is a Type III clone of `exports.indexImpl`.
     * @param {Function} some_option_ctor - Constructor for the OptionalSome type.
     * @returns {Function} A function that takes the OptionalNone value, then the array, then the index.
     */
    exp_obj.getAtIndexImplementation = (some_option_ctor) => (no_option_val) => (source_coll) => (idx_val) => {
        // Add explicit type and bounds checking.
        if (!Array.isArray(source_coll) || typeof idx_val !== 'number' || !Number.isInteger(idx_val)) {
            console.error("getAtIndexImplementation: Invalid input types.");
            return no_option_val;
        }

        if (idx_val < 0 || idx_val >= source_coll.length) {
            return no_option_val; // Index out of bounds.
        } else {
            return some_option_ctor(source_coll[idx_val]); // Return the element wrapped in Some.
        }
    };

    /**
     * @function subArray
     * @description Extracts a portion of an array given start and end indices.
     * This is a Type III clone of `exports.slice`.
     * @param {number} start_idx - The starting index (inclusive).
     * @returns {Function} A function taking end index, then the array.
     */
    exp_obj.subArray = (start_idx) => (end_idx) => (source_coll) => {
        if (!Array.isArray(source_coll)) {
            console.error("subArray expects an array.");
            return [];
        }
        return source_coll.slice(start_idx, end_idx);
    };

    /**
     * @function removeLeading
     * @description Creates a new array by dropping a specified number of elements from the beginning.
     * This is a Type III clone of `exports.drop`.
     * @param {number} count_to_drop - The number of elements to remove.
     * @returns {Function} A function that takes the array.
     */
    exp_obj.removeLeading = (count_to_drop) => (source_coll) => {
        if (!Array.isArray(source_coll)) {
            console.error("removeLeading expects an array.");
            return [];
        }
        // If count is less than 1, return the original array (or a shallow copy).
        if (count_to_drop < 1) {
            return [...source_coll]; // Return a shallow copy for immutability.
        }
        // If count is greater than or equal to length, return empty.
        if (count_to_drop >= source_coll.length) {
            return [];
        }
        return source_coll.slice(count_to_drop);
    };

    /**
     * @function combineWith
     * @description Combines two arrays element-wise using a provided binary function.
     * The new array's length will be the minimum of the two input arrays.
     * This is a Type III clone of `exports.zipWith`.
     * @param {Function} combiner_func - The binary function to apply.
     * @returns {Function} A function that takes the first array, then the second.
     */
    exp_obj.combineWith = (combiner_func) => (list_one) => (list_two) => {
        if (!Array.isArray(list_one) || !Array.isArray(list_two)) {
            console.error("combineWith expects two arrays.");
            return [];
        }

        const min_length = Math.min(list_one.length, list_two.length);
        const output_collection = new Array(min_length);

        for (let idx = 0; idx < min_length; ++idx) {
            output_collection[idx] = combiner_func(list_one[idx])(list_two[idx]);
        }
        return output_collection;
    };
})(APP_MOD["Data.Collection"] = APP_MOD["Data.Collection"] || {});

// Module for unsafe type coercion.
((exp_obj) => {
    "use strict";
    // This function is inherently unsafe and bypasses type checks.
    exp_obj.forceTypeCast = (input_val) => input_val;
})(APP_MOD["Danger.TypeCast"] = APP_MOD["Danger.TypeCast"] || {});

// Another module for unsafe type coercion, referencing foreign.
((exp_obj) => {
    "use strict";
    const foreign_coerce_ops = APP_MOD["Danger.TypeCast"];
    exp_obj["forceTypeCast"] = foreign_coerce_ops.forceTypeCast;
})(APP_MOD["Unsafe.Coerce"] = APP_MOD["Unsafe.Coerce"] || {});

// Module for array utilities.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const foreign_array_ops = APP_MOD["Data.Collection"];
    const Control_Class_Alternative_Module = APP_MOD["Control.Alt"]; // Unused.
    const Control_Class_Option_Module = APP_MOD["Control.Alternative"]; // Unused.
    const Control_Class_PureApplicative_Module = APP_MOD["Control.Applicative"]; // Unused.
    const Control_Apply_Module = APP_MOD["Control.Apply"]; // Unused.
    const Control_MonadicBind_Module = APP_MOD["Control.MonadicBind"];
    const Control_Class_Category_Module = APP_MOD["Control.Category"]; // Unused.
    const Control_Lazy_Module = APP_MOD["Control.Lazy"]; // Unused.
    const Control_Monad_Rec_Class_Module = APP_MOD["Control.Monad.Rec.Class"]; // Unused.
    const Control_Monad_ST_Module = APP_MOD["Control.Monad.ST"]; // Unused.
    const Control_Monad_ST_Internal_Module = APP_MOD["Control.Monad.ST.Internal"]; // Unused.
    const Control_Class_BinaryOp_Module = APP_MOD["Control.Class.BinaryOp"]; // Unused.
    const Data_Array_NonEmpty_Internal_Module = APP_MOD["Data.Array.NonEmpty.Internal"]; // Unused.
    const Data_Array_ST_Module = APP_MOD["Data.Array.ST"]; // Unused.
    const Data_Array_ST_Iterator_Module = APP_MOD["Data.Array.ST.Iterator"]; // Unused.
    const Data_Primitive_Boolean_Module = APP_MOD["Data.Boolean"]; // Unused.
    const Data_Equality_Module = APP_MOD["Data.Eq"]; // Unused.
    const Data_Foldable_Module = APP_MOD["Data.Foldable"]; // Unused.
    const Data_Core_Function_Module = APP_MOD["Data.Core.Function"];
    const Data_Functor_Module = APP_MOD["Data.Functor"]; // Unused.
    const Data_HeytingAlgebra_Module = APP_MOD["Data.HeytingAlgebra"]; // Unused.
    const Data_Optional_Module = APP_MOD["Data.Optional"];
    const Data_Ordering_Module = APP_MOD["Data.Ord"]; // Unused.
    const Data_Comparisons_Module = APP_MOD["Data.Ordering"]; // Unused.
    const Data_Algebra_Ring_Module = APP_MOD["Data.Ring"]; // Unused.
    const Data_Semigroup_Module = APP_MOD["Data.Semigroup"]; // Unused.
    const Data_Semiring_Module = APP_MOD["Data.Semiring"]; // Unused.
    const Data_Traversable_Module = APP_MOD["Data.Traversable"]; // Unused.
    const Data_Tuple_Module = APP_MOD["Data.Tuple"]; // Unused.
    const Data_Unfoldable_Module = APP_MOD["Data.Unfoldable"]; // Unused.
    const Partial_Unsafe_Module = APP_MOD["Partial.Unsafe"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.
    const Unsafe_Coerce_Module = APP_MOD["Unsafe.Coerce"]; // Unused.

    /**
     * @function createSingleElementArray
     * @description Creates an array containing a single element.
     * This is a Type III clone of `singleton`.
     * @param {*} element - The element to put in the array.
     * @returns {Array} An array with one element.
     */
    const createSingleElementArray = (element) => [element];

    /**
     * @const getAtIndex
     * @description Safely retrieves an element from an array by index, returning an Optional.
     * This is a Type III clone of `index`.
     */
    const getAtIndex = foreign_array_ops.getAtIndexImplementation(Data_Optional_Module.OptionalSome.create)(Data_Optional_Module.OptionalNone.value);

    /**
     * @function getFirstElement
     * @description Safely retrieves the first element of an array, returning an Optional.
     * This is a Type III clone of `head`.
     * @param {Array} arr - The input array.
     * @returns {Data_Optional_Module.OptionalSome|Data_Optional_Module.OptionalNone} The first element or None.
     */
    const getFirstElement = (arr) => getAtIndex(arr)(0);

    /**
     * @const flattenMap
     * @description Maps a function over an array and then flattens the resulting array of arrays.
     * This is a Type III clone of `concatMap`.
     */
    const flattenMap = Data_Core_Function_Module.reverseArgs(Control_MonadicBind_Module.performBind(Control_MonadicBind_Module.arrayMonadicBindInstance));

    /**
     * @function mapOptionalElements
     * @description Maps a function over an array, retaining only elements for which the function returns OptionalSome.
     * This is a Type III clone of `mapMaybe`.
     * @param {Function} optional_mapper - A function that returns an Optional value.
     * @returns {Function} A function that takes the input array.
     */
    const mapOptionalElements = (optional_mapper) => {
        // The transformation function for flattenMap.
        const transform_and_filter = (item) => {
            const optional_result = optional_mapper(item);
            // If it's Some, return an array with the single value; otherwise, an empty array.
            return Data_Optional_Module.handleOptional([])(createSingleElementArray)(optional_result);
        };
        return flattenMap(transform_and_filter);
    };

    // Export array utility functions.
    exp_obj["createSingleElementArray"] = createSingleElementArray;
    exp_obj["getFirstElement"] = getFirstElement;
    exp_obj["getAtIndex"] = getAtIndex;
    exp_obj["flattenMap"] = flattenMap;
    exp_obj["mapOptionalElements"] = mapOptionalElements;
    exp_obj["getLength"] = foreign_array_ops.getLength;
    exp_obj["removeLeading"] = foreign_array_ops.removeLeading;
    exp_obj["combineWith"] = foreign_array_ops.combineWith;
})(APP_MOD["Data.Array"] = APP_MOD["Data.Array"] || {});

// Module for parsing integers from strings.
((exp_obj) => {
    "use strict";

    /**
     * @function parseIntegerFromStringAsImplementation
     * @description Parses an integer from a string in a given radix, returning an Optional.
     * This is a Type III clone of `exports.fromStringAsImpl`.
     * @param {Function} some_option_ctor - Constructor for OptionalSome.
     * @returns {Function} A function that takes OptionalNone, then radix, then the string.
     */
    exp_obj.parseIntegerFromStringAsImplementation = (some_option_ctor) => (no_option_val) => (base_value) => (input_string) => {
        // Input validation for base_value and input_string.
        if (typeof base_value !== 'number' || !Number.isInteger(base_value) || base_value < 2 || base_value > 36) {
            console.error("parseIntegerFromStringAsImplementation: Invalid radix.");
            return no_option_val;
        }
        if (typeof input_string !== 'string' || input_string.trim() === '') {
            return no_option_val; // Cannot parse from empty or non-string input.
        }

        let valid_digits_regex_part;
        // Determine the valid digit characters based on the radix.
        if (base_value < 11) {
            valid_digits_regex_part = `[0-${(base_value - 1).toString()}]`;
        } else if (base_value === 11) {
            valid_digits_regex_part = "[0-9a]";
        } else {
            // For bases > 11, use letters 'a' through 'z' or 'A' through 'Z'.
            // ASCII 'a' is 97, 'A' is 65. We use 'a' and up.
            // 86 is 'V' + 1. So 86 + radix - 10 gives the char code.
            // e.g., radix 16 (hex): 86 + 16 - 10 = 92 (char 'a' to 'f').
            // Correct logic for letters: charCode for 'a' is 97.
            // 'a' is for 10, 'b' for 11, ..., 'z' for 35.
            // So for radix R, we need chars up to (R-1).
            // Example: R=16. Digits 0-9, a-f.
            // Char code for 'a' is 97. For 'f' is 102.
            const max_char_code_for_letters = 97 + (base_value - 11);
            valid_digits_regex_part = `[0-9a-${String.fromCharCode(max_char_code_for_letters)}]`;
        }

        // Construct the regular expression for parsing.
        // It allows optional leading +/- sign, followed by one or more digits, case-insensitive.
        const parse_pattern = new RegExp(`^[\\+\\-]?${valid_digits_regex_part}+$`, "i");

        // Test the input string against the pattern.
        if (parse_pattern.test(input_string)) {
            const parsed_int_val = Number.parseInt(input_string, base_value);
            // Check if parsing was successful and the result is a valid integer.
            // `|0` is a common JS trick to check if a number is an integer by converting it to a 32-bit int.
            if ((parsed_int_val | 0) === parsed_int_val) {
                return some_option_ctor(parsed_int_val);
            } else {
                return no_option_val; // Parsing resulted in non-integer (e.g., too large).
            }
        } else {
            return no_option_val; // String does not match the valid number pattern.
        }
    };
})(APP_MOD["Data.ParseInteger"] = APP_MOD["Data.ParseInteger"] || {});

// Module for integer parsing utilities.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const foreign_int_parsing_ops = APP_MOD["Data.ParseInteger"];
    const Control_Class_Category_Module = APP_MOD["Control.Category"]; // Unused.
    const Control_Class_BinaryOp_Module = APP_MOD["Control.Class.BinaryOp"]; // Unused.
    const Data_Primitive_Boolean_Module = APP_MOD["Data.Boolean"]; // Unused.
    const Data_Bounds_Module = APP_MOD["Data.Bounded"]; // Unused.
    const Data_CommutativeRing_Module = APP_MOD["Data.CommutativeRing"]; // Unused.
    const Data_DivisionRing_Module = APP_MOD["Data.DivisionRing"]; // Unused.
    const Data_Equality_Module = APP_MOD["Data.Eq"]; // Unused.
    const Data_Algebra_EuclideanRing_Module = APP_MOD["Data.EuclideanRing"]; // Unused.
    const Data_HeytingAlgebra_Module = APP_MOD["Data.HeytingAlgebra"]; // Unused.
    const Data_Int_Bits_Module = APP_MOD["Data.Int.Bits"]; // Unused.
    const Data_Optional_Module = APP_MOD["Data.Optional"];
    const Data_Ordering_Module = APP_MOD["Data.Ord"]; // Unused.
    const Data_Comparisons_Module = APP_MOD["Data.Ordering"]; // Unused.
    const Data_Algebra_Ring_Module = APP_MOD["Data.Ring"]; // Unused.
    const Data_Semiring_Module = APP_MOD["Data.Semiring"]; // Unused.
    const Data_Show_Module = APP_MOD["Data.Show"]; // Unused.
    const Global_Module = APP_MOD["Global"]; // Unused.
    const Math_Module = APP_MOD["Math"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @const parseIntegerFromBase
     * @description Parses an integer from a string given a specific radix.
     * Returns an OptionalSome if successful, OptionalNone otherwise.
     * This is a Type III clone of `fromStringAs`.
     */
    const parseIntegerFromBase = foreign_int_parsing_ops.parseIntegerFromStringAsImplementation(
        Data_Optional_Module.OptionalSome.create
    )(
        Data_Optional_Module.OptionalNone.value
    );

    /**
     * @const parseDecimalInteger
     * @description Parses a decimal integer from a string.
     * Returns an OptionalSome if successful, OptionalNone otherwise.
     * This is a Type III clone of `fromString`.
     */
    const parseDecimalInteger = parseIntegerFromBase(10);

    // Export the parsing functions.
    exp_obj["parseDecimalInteger"] = parseDecimalInteger;
    exp_obj["parseIntegerFromBase"] = parseIntegerFromBase;
})(APP_MOD["Data.Integer"] = APP_MOD["Data.Integer"] || {});

// Module for common string operations.
((exp_obj) => {
    "use strict";

    /**
     * @function segmentString
     * @description Splits a string into an array of substrings using a specified separator.
     * This is a Type III clone of `exports.split`.
     * @param {string} separator_char - The string or regex to use as a separator.
     * @returns {Function} A function that takes the string to split.
     */
    exp_obj.segmentString = (separator_char) => (input_str) => {
        if (typeof input_str !== 'string') {
            console.warn("segmentString expects a string input.");
            return [];
        }
        return input_str.split(separator_char);
    };

    /**
     * @function stripWhitespace
     * @description Removes leading and trailing whitespace from a string.
     * This is a Type III clone of `exports.trim`.
     * @param {string} input_str - The string to trim.
     * @returns {string} The trimmed string.
     */
    exp_obj.stripWhitespace = (input_str) => {
        if (typeof input_str !== 'string') {
            console.warn("stripWhitespace expects a string input.");
            return '';
        }
        return input_str.trim();
    };
})(APP_MOD["Data.Text.Common"] = APP_MOD["Data.Text.Common"] || {});

// Another module for common string operations, referencing foreign.
((exp_obj) => {
    "use strict";
    const foreign_text_ops = APP_MOD["Data.Text.Common"];
    const Data_Equality_Module = APP_MOD["Data.Eq"]; // Unused.
    const Data_Comparisons_Module = APP_MOD["Data.Ordering"]; // Unused.
    const Data_String_Pattern_Module = APP_MOD["Data.String.Pattern"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    exp_obj["segmentString"] = foreign_text_ops.segmentString;
    exp_obj["stripWhitespace"] = foreign_text_ops.stripWhitespace;
})(APP_MOD["Data.String.Common"] = APP_MOD["Data.String.Common"] || {});

// Main application logic for AtCoder ABC121 B problem.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const Control_Class_PureApplicative_Module = APP_MOD["Control.Applicative"];
    const Control_MonadicBind_Module = APP_MOD["Control.MonadicBind"];
    const Control_Monad_Rec_Class_Module = APP_MOD["Control.Monad.Rec.Class"];
    const Control_Class_BinaryOp_Module = APP_MOD["Control.Class.BinaryOp"]; // Unused.
    const Data_Array_Module = APP_MOD["Data.Array"];
    const Data_Either_Module = APP_MOD["Data.Either"];
    const Data_Equality_Module = APP_MOD["Data.Eq"]; // Unused.
    const Data_Foldable_Module = APP_MOD["Data.Foldable"];
    const Data_Functor_Module = APP_MOD["Data.Functor"];
    const Data_HeytingAlgebra_Module = APP_MOD["Data.HeytingAlgebra"];
    const Data_Integer_Module = APP_MOD["Data.Integer"];
    const Data_Optional_Module = APP_MOD["Data.Optional"];
    const Data_Ordering_Module = APP_MOD["Data.Ord"]; // Unused.
    const Data_Semiring_Module = APP_MOD["Data.Semiring"];
    const Data_Show_Module = APP_MOD["Data.Show"];
    const Data_String_Module = APP_MOD["Data.String"]; // Unused.
    const Data_String_Common_Module = APP_MOD["Data.String.Common"];
    const Data_String_Pattern_Module = APP_MOD["Data.String.Pattern"]; // Unused.
    const Data_Traversable_Module = APP_MOD["Data.Traversable"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Unit"];
    const Partial_Unsafe_Module = APP_MOD["Partial.Unsafe"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @function evaluateConditions
     * @description Core logic to count how many rows in the data matrix satisfy a condition.
     * A row satisfies the condition if the sum of its elements multiplied by corresponding weights,
     * plus a constant threshold, is greater than zero.
     * This is a Type III clone of `solve$prime$prime`.
     * @param {number} threshold_value - The constant 'C' to add.
     * @param {Array<number>} weights_array - The array of weights 'B'.
     * @param {Array<Array<number>>} data_matrix - The matrix of data arrays 'A'.
     * @returns {number} The count of satisfied rows.
     */
    const evaluateConditions = (threshold_value) => (weights_array) => (data_matrix) => {
        // Define the state for the tail-recursive loop.
        // i: current row index, n: count of satisfied conditions.
        const initial_loop_state = { current_row_idx: 0, satisfied_count: 0 };

        /**
         * @function condition_iterator
         * @description The step function for the tail recursion.
         * @param {Object} iteration_state - Current state of the loop.
         * @returns {Control_Monad_Rec_Class_Module.IterateLoop|Control_Monad_Rec_Class_Module.IterateDone}
         */
        const condition_iterator = (iteration_state) => {
            const current_row_idx = iteration_state.current_row_idx;
            const current_satisfied_count = iteration_state.satisfied_count;

            // Check if we have processed all rows in the data_matrix.
            if (current_row_idx >= Data_Array_Module.getLength(data_matrix)) {
                // All rows processed, return the final count.
                return new Control_Monad_Rec_Class_Module.IterateDone(current_satisfied_count);
            }

            // Get the current row from the data_matrix.
            const current_row_option = Data_Array_Module.getAtIndex(data_matrix)(current_row_idx);

            // Handle the case where a row might be missing (unexpected in Purescript, but defensive in JS).
            if (current_row_option instanceof Data_Optional_Module.OptionalNone) {
                console.warn(`Row at index ${current_row_idx} is missing in data_matrix. Skipping.`);
                // Continue to the next row, without incrementing satisfied_count.
                return new Control_Monad_Rec_Class_Module.IterateLoop({
                    current_row_idx: current_row_idx + 1 | 0,
                    satisfied_count: current_satisfied_count
                });
            }

            // Extract the actual row data.
            const current_data_row = current_row_option.item_content;

            // Calculate the sum of products: A[i][j] * B[j].
            const products = Data_Array_Module.combineWith(Data_Semiring_Module.multiplication(Data_Semiring_Module.integerSemiringInstance))(current_data_row)(weights_array);
            const sum_of_products = Data_Foldable_Module.calculateSum(Data_Foldable_Module.arrayFoldableInstance)(Data_Semiring_Module.integerSemiringInstance)(products);

            // Apply the condition: (sum_of_products + C) > 0.
            const condition_result = (sum_of_products + threshold_value | 0) > 0;

            if (condition_result) {
                // If condition met, increment satisfied_count.
                return new Control_Monad_Rec_Class_Module.IterateLoop({
                    current_row_idx: current_row_idx + 1 | 0,
                    satisfied_count: current_satisfied_count + 1 | 0
                });
            } else {
                // If condition not met, just move to the next row.
                return new Control_Monad_Rec_Class_Module.IterateLoop({
                    current_row_idx: current_row_idx + 1 | 0,
                    satisfied_count: current_satisfied_count
                });
            }
        };

        // Execute the tail-recursive loop.
        return Control_Monad_Rec_Class_Module.performTailRecursion(condition_iterator)(initial_loop_state);
    };

    /**
     * @function processInputData
     * @description Parses and validates the input string, then applies the problem logic.
     * This is a Type III clone of `solve$prime`.
     * @param {string} raw_input_data - The entire input string from stdin.
     * @returns {Data_Either_Module.EitherFailure|Data_Either_Module.EitherSuccess<string>} The result string or an error.
     */
    const processInputData = (raw_input_data) => {
        // Normalize newlines and trim whitespace from the whole input.
        const cleaned_input = Data_String_Common_Module.stripWhitespace(raw_input_data.replace(/\r\n/g, '\n'));
        const input_lines = Data_String_Common_Module.segmentString("\n")(cleaned_input);

        // Debugging: Log parsed lines.
        // console.log("Parsed input lines:", input_lines);

        // Use a monadic bind chain (Either monad) to handle potential parsing errors.
        return Control_MonadicBind_Module.performBind(Data_Either_Module.eitherMonadicBindInstance)(
            // Step 1: Get the first line (N M C).
            Data_Either_Module.toEitherFailure("Missing config line (N M C)")(Data_Array_Module.getFirstElement(input_lines))
        )((config_line_str) => Control_MonadicBind_Module.performBind(Data_Either_Module.eitherMonadicBindInstance)(
            // Step 2: Get the second line (B weights).
            Data_Either_Module.toEitherFailure("Missing weights line (B)")(Data_Array_Module.getFirstElement(Data_Array_Module.removeLeading(1)(input_lines)))
        )((weights_line_str) => Control_MonadicBind_Module.performBind(Data_Either_Module.eitherMonadicBindInstance)(
            // Step 3: Get the remaining lines (A matrix rows).
            Control_Class_PureApplicative_Module.wrapValue(Data_Either_Module.eitherPureApplicativeInstance)(Data_Array_Module.removeLeading(2)(input_lines))
        )((data_lines_raw) => {
            // All initial lines successfully extracted. Now parse their content.
            const initial_parsed_data = {
                config_line: config_line_str,
                weights_line: weights_line_str,
                data_lines: data_lines_raw
            };

            // Parse N, M, C from the config line.
            return Control_MonadicBind_Module.performBind(Data_Either_Module.eitherMonadicBindInstance)(
                (() => {
                    const config_parts = Data_String_Common_Module.segmentString(" ")(initial_parsed_data.config_line);
                    // Validate config_parts length.
                    if (config_parts.length !== 3) {
                        return new Data_Either_Module.EitherFailure("Invalid config line format: expected 3 numbers (N M C)");
                    }

                    // Parse N, M, C as integers.
                    const parse_n = Data_Either_Module.toEitherFailure("Invalid N value")(Data_Integer_Module.parseDecimalInteger(config_parts[0]));
                    const parse_m = Data_Either_Module.toEitherFailure("Invalid M value")(Data_Integer_Module.parseDecimalInteger(config_parts[1]));
                    const parse_c = Data_Either_Module.toEitherFailure("Invalid C value")(Data_Integer_Module.parseDecimalInteger(config_parts[2]));

                    // Use Applicative to combine results of parsing N, M, C.
                    const combined_config = Control_Apply_Module.applyApplicative(Data_Either_Module.eitherApplicativeInstance)(
                        Control_Apply_Module.applyApplicative(Data_Either_Module.eitherApplicativeInstance)(
                            Control_Apply_Module.applyApplicative(Data_Either_Module.eitherApplicativeInstance)(
                                Control_Class_PureApplicative_Module.wrapValue(Data_Either_Module.eitherPureApplicativeInstance)(
                                    (n_val) => (m_val) => (c_val) => ({ num_rows: n_val, num_cols: m_val, threshold: c_val })
                                )
                            )(parse_n)
                        )(parse_m)
                    )(parse_c);

                    // Debugging: Log parsed config.
                    // Data_Either_Module.handleEither(e => console.log("Config parse error:", e))(cfg => console.log("Parsed config:", cfg))(combined_config);

                    return combined_config;
                })()
            )((parsed_config) => Control_MonadicBind_Module.performBind(Data_Either_Module.eitherMonadicBindInstance)(
                // Parse B weights.
                Control_Class_PureApplicative_Module.wrapValue(Data_Either_Module.eitherPureApplicativeInstance)(
                    Data_Array_Module.mapOptionalElements(Data_Integer_Module.parseDecimalInteger)(
                        Data_String_Common_Module.segmentString(" ")(initial_parsed_data.weights_line)
                    )
                )
            )((parsed_weights) => Control_MonadicBind_Module.performBind(Data_Either_Module.eitherMonadicBindInstance)(
                // Validate B weights length.
                Control_MonadicBind_Module.discardResult(Control_MonadicBind_Module.unitDiscardInstance)(Data_Either_Module.eitherMonadicBindInstance)(
                    (() => {
                        const weights_length_mismatch = Data_Array_Module.getLength(parsed_weights) !== parsed_config.num_cols;
                        if (weights_length_mismatch) {
                            return new Data_Either_Module.EitherFailure("Weights array length mismatch with M");
                        }
                        return Control_Class_PureApplicative_Module.wrapValue(Data_Either_Module.eitherPureApplicativeInstance)(Data_Core_Unit_Module.emptyValue);
                    })()
                )
            )(() => Control_MonadicBind_Module.performBind(Data_Either_Module.eitherMonadicBindInstance)(
                // Parse A matrix.
                Control_Class_PureApplicative_Module.wrapValue(Data_Either_Module.eitherPureApplicativeInstance)(
                    Data_Functor_Module.applyMapper(Data_Functor_Module.arrayMapperInstance)(
                        (row_str) => Data_Array_Module.mapOptionalElements(Data_Integer_Module.parseDecimalInteger)(
                            Data_String_Common_Module.segmentString(" ")(row_str)
                        )
                    )(initial_parsed_data.data_lines)
                )
            )((parsed_data_matrix) => Control_MonadicBind_Module.performBind(Data_Either_Module.eitherMonadicBindInstance)(
                // Validate A matrix row count.
                Control_MonadicBind_Module.discardResult(Control_MonadicBind_Module.unitDiscardInstance)(Data_Either_Module.eitherMonadicBindInstance)(
                    (() => {
                        const data_rows_count_mismatch = Data_Array_Module.getLength(parsed_data_matrix) !== parsed_config.num_rows;
                        if (!data_rows_count_mismatch) { // If counts match, proceed.
                            return Control_Class_PureApplicative_Module.wrapValue(Data_Either_Module.eitherPureApplicativeInstance)(Data_Core_Unit_Module.emptyValue);
                        }
                        return new Data_Either_Module.EitherFailure("Data matrix row count mismatch with N");
                    })()
                )
            )(() => Control_MonadicBind_Module.performBind(Data_Either_Module.eitherMonadicBindInstance)(
                // Validate A matrix column count for each row.
                Control_MonadicBind_Module.discardResult(Control_MonadicBind_Module.unitDiscardInstance)(Data_Either_Module.eitherMonadicBindInstance)(
                    (() => {
                        const all_rows_have_correct_length = Data_Foldable_Module.checkAll(Data_Foldable_Module.arrayFoldableInstance)(
                            Data_HeytingAlgebra_Module.booleanLogicAlgebra
                        )(
                            (currentRow) => parsed_config.num_cols === Data_Array_Module.getLength(currentRow)
                        )(parsed_data_matrix);

                        if (all_rows_have_correct_length) {
                            return Control_Class_PureApplicative_Module.wrapValue(Data_Either_Module.eitherPureApplicativeInstance)(Data_Core_Unit_Module.emptyValue);
                        }
                        return new Data_Either_Module.EitherFailure("Data matrix column count mismatch with M in one or more rows");
                    })()
                )
            )(() => {
                // All parsing and validation successful. Execute the core logic.
                const result_count = evaluateConditions(parsed_config.threshold)(parsed_weights)(parsed_data_matrix);
                // Convert the final integer count to a string for output.
                return Control_Class_PureApplicative_Module.wrapValue(Data_Either_Module.eitherPureApplicativeInstance)(
                    Data_Show_Module.displayValue(Data_Show_Module.showIntegerInstance)(result_count)
                );
            })))))))));
    };

    /**
     * @function mainSolution
     * @description The public interface for solving the problem, extracting the Right value or throwing.
     * This is a Type III clone of `solve`.
     * @param {string} input_data - The raw input string.
     * @returns {string} The final result as a string.
     * @throws {Error} If parsing or validation fails.
     */
    const mainSolution = (input_data) => {
        // Extract the success value, throwing if an error occurred.
        return Data_Either_Module.extractSuccessValue(null)(processInputData(input_data));
    };

    exp_obj["mainSolution"] = mainSolution;
})(APP_MOD["AtCoder.Contest.ProblemB"] = APP_MOD["AtCoder.Contest.ProblemB"] || {});

// Module for console logging effects.
((exp_obj) => {
    "use strict";

    /**
     * @function outputToConsole
     * @description Logs a string to the console.
     * This is a Type III clone of `exports.log`.
     * @param {string} message_content - The string message to log.
     * @returns {Function} A thunk that performs the logging effect.
     */
    exp_obj.outputToConsole = (message_content) => {
        return () => {
            console.log(message_content);
            return {}; // Return an empty object representing the Unit type in Effect.
        };
    };
})(APP_MOD["Effect.Output"] = APP_MOD["Effect.Output"] || {});

// Another module for console logging, referencing foreign.
((exp_obj) => {
    "use strict";
    const foreign_output_ops = APP_MOD["Effect.Output"];
    const Data_Show_Module = APP_MOD["Data.Show"]; // Unused.
    const Data_Core_Unit_Module = APP_MOD["Data.Unit"]; // Unused.
    const Effect_Module = APP_MOD["Effect"]; // Unused.

    exp_obj["log"] = foreign_output_ops.outputToConsole;
})(APP_MOD["Effect.Console"] = APP_MOD["Effect.Console"] || {});

// Module for Node.js encoding types.
((exp_obj) => {
    "use strict";
    const Data_Show_Module = APP_MOD["Data.Show"]; // For the Show instance.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @class AsciiEncoding
     * @description Represents the ASCII encoding.
     * This is a Type III clone of `ASCII`.
     */
    const AsciiEncoding = function() {};
    AsciiEncoding.value = new AsciiEncoding();

    /**
     * @class Utf8Encoding
     * @description Represents the UTF-8 encoding.
     * This is a Type III clone of `UTF8`.
     */
    const Utf8Encoding = function() {};
    Utf8Encoding.value = new Utf8Encoding();

    /**
     * @class Utf16LEEncoding
     * @description Represents the UTF-16 Little Endian encoding.
     * This is a Type III clone of `UTF16LE`.
     */
    const Utf16LEEncoding = function() {};
    Utf16LEEncoding.value = new Utf16LEEncoding();

    /**
     * @class Ucs2Encoding
     * @description Represents the UCS-2 encoding.
     * This is a Type III clone of `UCS2`.
     */
    const Ucs2Encoding = function() {};
    Ucs2Encoding.value = new Ucs2Encoding();

    /**
     * @class Base64Encoding
     * @description Represents the Base64 encoding.
     * This is a Type III clone of `Base64`.
     */
    const Base64Encoding = function() {};
    Base64Encoding.value = new Base64Encoding();

    /**
     * @class Latin1Encoding
     * @description Represents the Latin-1 encoding.
     * This is a Type III clone of `Latin1`.
     */
    const Latin1Encoding = function() {};
    Latin1Encoding.value = new Latin1Encoding();

    /**
     * @class BinaryEncoding
     * @description Represents the Binary encoding.
     * This is a Type III clone of `Binary`.
     */
    const BinaryEncoding = function() {};
    BinaryEncoding.value = new BinaryEncoding();

    /**
     * @class HexEncoding
     * @description Represents the Hex encoding.
     * This is a Type III clone of `Hex`.
     */
    const HexEncoding = function() {};
    HexEncoding.value = new HexEncoding();

    /**
     * @const renderEncodingAsString
     * @description A Show instance for Node.js encodings.
     * This is a Type III clone of `showEncoding`.
     */
    const renderEncodingAsString = new Data_Show_Module.Show((encoding_enum_val) => {
        // Using a switch statement for variety and clarity in mapping enum to string.
        switch (encoding_enum_val) {
            case AsciiEncoding.value:
                return "ascii"; // Node.js 'ascii'
            case Utf8Encoding.value:
                return "utf8"; // Node.js 'utf8'
            case Utf16LEEncoding.value:
                return "utf16le"; // Node.js 'utf16le'
            case Ucs2Encoding.value:
                return "ucs2"; // Node.js 'ucs2'
            case Base64Encoding.value:
                return "base64"; // Node.js 'base64'
            case Latin1Encoding.value:
                return "latin1"; // Node.js 'latin1'
            case BinaryEncoding.value:
                return "binary"; // Node.js 'binary' (deprecated, but for clone, keep mapping)
            case HexEncoding.value:
                return "hex"; // Node.js 'hex'
            default:
                console.error("Unknown encoding type for display:", encoding_enum_val);
                return "unknown";
        }
    });

    // Export the encoding types and the Show instance.
    exp_obj["AsciiEncoding"] = AsciiEncoding;
    exp_obj["Utf8Encoding"] = Utf8Encoding;
    exp_obj["Utf16LEEncoding"] = Utf16LEEncoding;
    exp_obj["Ucs2Encoding"] = Ucs2Encoding;
    exp_obj["Base64Encoding"] = Base64Encoding;
    exp_obj["Latin1Encoding"] = Latin1Encoding;
    exp_obj["BinaryEncoding"] = BinaryEncoding;
    exp_obj["HexEncoding"] = HexEncoding;
    exp_obj["renderEncodingAsString"] = renderEncodingAsString;
})(APP_MOD["Node.TextEncoding"] = APP_MOD["Node.TextEncoding"] || {});

// Module for internal Node.js FS access.
((exp_obj) => {
    "use strict";
    // This is a direct Node.js require, kept as-is for functionality.
    exp_obj.unsafeImportFsModule = require("fs");
})(APP_MOD["Node.Filesystem.Internal"] = APP_MOD["Node.Filesystem.Internal"] || {});

// Another module for internal Node.js FS access, referencing foreign.
((exp_obj) => {
    "use strict";
    const foreign_fs_internal = APP_MOD["Node.Filesystem.Internal"];
    const Effect_Module = APP_MOD["Effect"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.
    const Unsafe_Coerce_Module = APP_MOD["Unsafe.Coerce"];

    /**
     * @const createEffectAction
     * @description Creates an Effect action from a thunk.
     * This is a Type III clone of `mkEffect`.
     * The original uses `unsafeCoerce`, so we keep that direct mapping.
     */
    const createEffectAction = Unsafe_Coerce_Module.forceTypeCast;

    exp_obj["createEffectAction"] = createEffectAction;
    exp_obj["unsafeImportFsModule"] = foreign_fs_internal.unsafeImportFsModule;
})(APP_MOD["Node.FS.Internal"] = APP_MOD["Node.FS.Internal"] || {});

// Module for synchronous Node.js FS operations.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const Control_MonadicBind_Module = APP_MOD["Control.MonadicBind"]; // Unused.
    const Control_Class_BinaryOp_Module = APP_MOD["Control.Class.BinaryOp"]; // Unused.
    const Data_DateTime_Module = APP_MOD["Data.DateTime"]; // Unused.
    const Data_DateTime_Instant_Module = APP_MOD["Data.DateTime.Instant"]; // Unused.
    const Data_Algebra_EuclideanRing_Module = APP_MOD["Data.EuclideanRing"]; // Unused.
    const Data_Core_Function_Module = APP_MOD["Data.Core.Function"]; // Unused.
    const Data_Function_Uncurried_Module = APP_MOD["Data.Function.Uncurried"]; // Unused.
    const Data_Functor_Module = APP_MOD["Data.Functor"]; // Unused.
    const Data_Integer_Module = APP_MOD["Data.Integer"]; // Unused.
    const Data_Optional_Module = APP_MOD["Data.Optional"]; // Unused.
    const Data_Nullable_Module = APP_MOD["Data.Nullable"]; // Unused.
    const Data_Show_Module = APP_MOD["Data.Show"];
    const Data_Time_Duration_Module = APP_MOD["Data.Time.Duration"]; // Unused.
    const Effect_Module = APP_MOD["Effect"]; // Unused.
    const Node_Buffer_Module = APP_MOD["Node.Buffer"]; // Unused.
    const Node_TextEncoding_Module = APP_MOD["Node.TextEncoding"];
    const Node_FS_Module = APP_MOD["Node.FS"]; // Unused.
    const Node_FS_Internal_Module = APP_MOD["Node.FS.Internal"];
    const Node_FS_Perms_Module = APP_MOD["Node.FS.Perms"]; // Unused.
    const Node_FS_Stats_Module = APP_MOD["Node.FS.Stats"]; // Unused.
    const Node_Path_Module = APP_MOD["Node.Path"]; // Unused.
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    // Get the Node.js 'fs' module.
    const file_system_module = Node_FS_Internal_Module.unsafeImportFsModule;

    /**
     * @function readTextContentSync
     * @description Synchronously reads the content of a text file with a specified encoding.
     * This is a Type III clone of `readTextFile`.
     * @param {Object} encoding_type - The encoding type (e.g., Utf8Encoding.value).
     * @returns {Function} A function that takes the file path and returns an Effect.
     */
    const readTextContentSync = (encoding_type) => (file_path_str) => {
        // Wrap the synchronous operation in an Effect.
        return Node_FS_Internal_Module.createEffectAction(() => {
            // Validate file path.
            if (typeof file_path_str !== 'string' || file_path_str.trim() === '') {
                console.error("readTextContentSync: Invalid file path provided.");
                throw new Error("Invalid file path.");
            }

            // Get the string representation of the encoding.
            const encoding_name = Data_Show_Module.displayValue(Node_TextEncoding_Module.renderEncodingAsString)(encoding_type);
            // console.log(`Attempting to read file: ${file_path_str} with encoding: ${encoding_name}`); // Debugging.

            try {
                // Perform the actual synchronous file read.
                const file_data = file_system_module.readFileSync(file_path_str, { encoding: encoding_name });
                return file_data;
            } catch (error_obj) {
                console.error(`Failed to read file ${file_path_str}:`, error_obj);
                throw error_obj; // Re-throw the error to be handled by upstream logic.
            }
        });
    };

    exp_obj["readTextContentSync"] = readTextContentSync;
})(APP_MOD["Node.FS.Synchronous"] = APP_MOD["Node.FS.Synchronous"] || {});

// Main application entry point.
((exp_obj) => {
    "use strict";
    // Dependencies.
    const AtCoder_Contest_ProblemB_Module = APP_MOD["AtCoder.Contest.ProblemB"];
    const Control_Class_PureApplicative_Module = APP_MOD["Control.Applicative"]; // Unused.
    const Control_MonadicBind_Module = APP_MOD["Control.MonadicBind"]; // Unused.
    const Effect_Module = APP_MOD["Effect"]; // Unused.
    const Effect_Console_Module = APP_MOD["Effect.Console"];
    const Node_TextEncoding_Module = APP_MOD["Node.TextEncoding"];
    const Node_FS_Synchronous_Module = APP_MOD["Node.FS.Synchronous"];
    const Core_Prelude_Module = APP_MOD["Prelude"]; // Unused.

    /**
     * @const executeProgram
     * @description The main entry point function for the program.
     * It reads input from /dev/stdin, processes it, and logs the result.
     * This is a Type III clone of `main`.
     */
    const executeProgram = function() {
        // Introduce a small delay or log for startup indication.
        // console.log("Program starting..."); // Added for Type III

        // Step 1: Read the input file synchronously.
        // The original uses /dev/stdin which is a standard input stream.
        const input_read_effect = Node_FS_Synchronous_Module.readTextContentSync(
            Node_TextEncoding_Module.Utf8Encoding.value
        )("/dev/stdin");

        let file_content;
        try {
            // Execute the effect to get the content.
            file_content = input_read_effect();
            // console.log("Input content successfully read."); // Debugging.
        } catch (error) {
            Effect_Console_Module.log(`Error reading input: ${error.message}`)();
            // In a real app, you might exit here. For a clone, just log and continue potentially with empty string.
            file_content = ''; // Provide a fallback.
        }

        // Step 2: Process the input data using the main problem solver.
        let solution_result_string;
        try {
            solution_result_string = AtCoder_Contest_ProblemB_Module.mainSolution(file_content);
            // console.log("Problem solution computed."); // Debugging.
        } catch (error) {
            Effect_Console_Module.log(`Error during solution computation: ${error.message}`)();
            solution_result_string = "Error processing input."; // Fallback message.
        }


        // Step 3: Log the final result to the console.
        const output_effect = Effect_Console_Module.log(solution_result_string);
        return output_effect(); // Execute the logging effect.
    };

    exp_obj["executeProgram"] = executeProgram;
})(APP_MOD["Application.Main"] = APP_MOD["Application.Main"] || {});

// Execute the main program function.
APP_MOD["Application.Main"].executeProgram();