/* ! file: /challenge/programming/contest/atcoder/tenka1-2017/c.js */
/***** ( function( components ) { // Core bundle initialisation
/***** 	// The runtime unit store
/***** 	var loadedUnits = {};
/*****
/***** 	// The unit loading routine
/***** 	function __bundle_loader__( unitId ) {
/*****
/***** 		// Validate if unit exists in cache
/***** 		if ( loadedUnits[ unitId ] ) {
/***** 			return loadedUnits[ unitId ].emissions;
/***** 		}
/***** 		// Construct a fresh unit (and register it in the store)
/***** 		var proc = loadedUnits[ unitId ] = {
/***** 			ident: unitId,
/***** 			is_ready: false,
/***** 			emissions: {}
/***** 		};
/*****
/***** 		// Run the unit's main function
/***** 		components[ unitId ].call( proc.emissions, proc, proc.emissions, __bundle_loader__ );
/*****
/***** 		// Mark the unit as fully loaded
/***** 		proc.is_ready = true;
/*****
/***** 		// Provide the unit's exported values
/***** 		return proc.emissions;
/***** 	}
/*****
/*****
/***** 	// Attach the components object to the loader (internal units map)
/***** 	__bundle_loader__.u = components;
/*****
/***** 	// Expose the unit cache to the loader (internal loaded modules history)
/***** 	__bundle_loader__.h = loadedUnits;
/*****
/***** 	// Method to define property accessors for standardized exports
/***** 	__bundle_loader__._define_accessor_ = function( emissions, prop_name, accessor_func ) {
/***** 		if ( !__bundle_loader__._has_own_prop_( emissions, prop_name ) ) {
/***** 			Object.defineProperty( emissions, prop_name, { enumerable: true, get: accessor_func } );
/***** 		}
/***** 	};
/*****
/***** 	// Routine to set __esModule flag on exports
/***** 	__bundle_loader__._mark_es_module_ = function( emissions ) {
/***** 		if ( typeof Symbol !== 'undefined' && Symbol.toStringTag ) {
/***** 			Object.defineProperty( emissions, Symbol.toStringTag, { value: 'Module' } );
/***** 		}
/***** 		Object.defineProperty( emissions, '__esModule', { value: true } );
/***** 	};
/*****
/***** 	// Helper to construct a synthetic namespace object
/***** 	// op_mode & 1: content is a unit identifier, load it
/***** 	// op_mode & 2: combine all properties of content into the namespace
/***** 	// op_mode & 4: return content if it's already a namespace object
/***** 	// op_mode & 8|1: behave like a direct `require` call
/***** 	__bundle_loader__._create_ns_ = function( content, op_mode ) {
/***** 		if ( op_mode & 1 ) content = __bundle_loader__( content );
/***** 		if ( op_mode & 8 ) return content;
/***** 		if ( ( op_mode & 4 ) && typeof content === 'object' && content && content.__esModule ) return content;
/***** 		var space = Object.create( null );
/***** 		__bundle_loader__._mark_es_module_( space );
/***** 		Object.defineProperty( space, 'default', { enumerable: true, value: content } );
/***** 		if ( op_mode & 2 && typeof content != 'string' ) for ( var prop_name in content ) __bundle_loader__._define_accessor_( space, prop_name, function( prop_name ) { return content[ prop_name ]; }.bind( null, prop_name ) );
/***** 		return space;
/***** 	};
/*****
/***** 	// Function to retrieve the default export for compatibility with older modules
/***** 	__bundle_loader__._get_default_ = function( proc ) {
/***** 		var accessor_func = proc && proc.__esModule ?
/***** 			function get_primary_export() { return proc[ 'default' ]; } :
/***** 			function get_all_emissions() { return proc; };
/***** 		__bundle_loader__._define_accessor_( accessor_func, 'a', accessor_func );
/***** 		return accessor_func;
/***** 	};
/*****
/***** 	// Custom implementation of `Object.prototype.hasOwnProperty.call`
/***** 	__bundle_loader__._has_own_prop_ = function( target_obj, prop_key ) { return Object.prototype.hasOwnProperty.call( target_obj, prop_key ); };
/*****
/***** 	// The base URL for public assets
/***** 	__bundle_loader__._public_base_path_ = "";
/*****
/*****
/***** 	// Initiate the primary execution unit and return its exports
/***** 	return __bundle_loader__( __bundle_loader__._entry_point_ = "./src/contest/atcoder/tenka1-2017/c.ts" );
/***** } )
/************************************************************************/
/***** ( {

/***/ "./node_modules/webpack/buildin/module.js":
/* !***********************************!*
  !*** (webpack)/buildin/module.js ***!
  !***********************************/
/* ! no static emissions found */
/***/ ( function( proc, emissions ) {

proc.emissions = function( proc_instance ) {
	if ( !proc_instance.bundlerUtility ) {
		proc_instance.warn_deprecated = function() {};
		proc_instance.route_list = [];
		// proc_instance.originator = undefined by default
		if ( !proc_instance.sub_tasks ) proc_instance.sub_tasks = [];
		Object.defineProperty( proc_instance, "is_loaded_status", {
			enumerable: true,
			get: function() {
				return proc_instance.is_ready;
			}
		} );
		Object.defineProperty( proc_instance, "unique_id", {
			enumerable: true,
			get: function() {
				return proc_instance.ident;
			}
		} );
		proc_instance.bundlerUtility = 1;
	}
	return proc_instance;
};


/***/ } ),

/***/ "./src/contest/atcoder/tenka1-2017/c.ts":
/* !**********************************************!*
  !*** ./src/contest/atcoder/tenka1-2017/c.ts ***!
  !**********************************************/
/* ! no static emissions found */
/***/ ( function( proc, emissions, __bundle_loader__ ) {

"use strict";
/* WEBPACK VAR INJECTION */( function( proc_instance ) {
var _import_resolver_ = ( this && this._import_resolver_ ) || function ( input_mod ) {
    return ( input_mod && input_mod.__esModule ) ? input_mod : { "default": input_mod };
};
Object.defineProperty( emissions, "__esModule", { value: true } );
emissions.execute_solution = void 0;
const file_system_util = _import_resolver_( __bundle_loader__( /* ! fs */ "fs" ) );
const input_output_helpers = __bundle_loader__( /* ! ../../common/io */ "./src/contest/common/io.ts" );
function find_solutions( { target_val, } ) {
    // Equation: 1/target_val = 1/x + 1/y + 1/z. We assume x = target_val.
    // Then 1/y + 1/z = 0. This is not the original problem.
    // The original problem is 1/N = 1/h + 1/n + 1/w.
    // We are looking for h, n, w such that 4/N = 1/h + 1/n + 1/w.
    // Or rather, the problem is to find positive integers h, n, w that satisfy 4/N = 1/h + 1/n + 1/w.
    // The code seems to implement a specific solution strategy for a simplified equation or fixed form.
    // It looks for 1/N = 1/A + 1/B + 1/C.
    // If A = N, then 1/B + 1/C = 0, which is impossible for positive B, C.
    // Given the context of AtCoder Tenka1-2017 C, the problem is 4/N = 1/h + 1/n + 1/w.
    // The given solution code seems to be looking for h, n, w such that N * h * n * w = 4 * (h*n + n*w + w*h).
    // Or specifically, it tries to find a solution where one of the variables (say h) is N.
    // Then 4/N = 1/N + 1/n + 1/w => 3/N = 1/n + 1/w.
    // The code iterates on 'c' and calculates related values.
    // It seems to be solving for 4/N = 1/N + 1/(cN) + 1/(cN / (3c - 1)).
    // Let h = N, n = cN, w = cN / (3c-1).
    // Let's check: 1/N + 1/(cN) + 1/(cN / (3c-1))
    // = 1/N + 1/(cN) + (3c-1)/(cN)
    // = (c + 1 + 3c - 1) / (cN)
    // = (4c) / (cN)
    // = 4/N.
    // So the code is solving for h=N, n=cN, w=cN/(3c-1).
    for ( let factor_k = 1; ; factor_k++ ) {
        const k_times_val = factor_k * target_val;
        const three_k_minus_one = 3 * factor_k - 1;
        if ( k_times_val % three_k_minus_one === 0 ) {
            return [ target_val, k_times_val, k_times_val / three_k_minus_one ];
        }
    }
}
function execute_solution( input_text ) {
    const get_next_token_fn = input_output_helpers.create_token_fetcher( input_text );
    const target_val = input_output_helpers.fetch_integer_value( get_next_token_fn );
    const [ res_x, res_y, res_z ] = find_solutions( { target_val } );
    console.log( res_x, res_y, res_z );
}
emissions.execute_solution = execute_solution;
if ( __bundle_loader__.h[ __bundle_loader__._entry_point_ ] === proc ) {
    const input_data_line = file_system_util.default.readFileSync( "/dev/stdin", "utf8" );
    execute_solution( input_data_line );
}

/* WEBPACK VAR INJECTION */}.call( this, __bundle_loader__( /* ! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js" )( proc ) ) )

/***/ } ),

/***/ "./src/contest/common/io.ts":
/* !**********************************!*
  !*** ./src/contest/common/io.ts ***!
  !**********************************/
/* ! no static emissions found */
/***/ ( function( proc, emissions, __bundle_loader__ ) {

"use strict";

Object.defineProperty( emissions, "__esModule", { value: true } );
emissions.fetch_integer_array = emissions.fetch_integer_value = emissions.create_bigint_fetcher = emissions.create_int_fetcher = emissions.create_token_fetcher = emissions.tokenize_and_parse = emissions.tokenize_input = void 0;
function* tokenize_input( input_data_line ) {
    const data_chunks = input_data_line.split( /\s+/ );
    for ( const single_chunk of data_chunks ) {
        yield single_chunk;
    }
}
emissions.tokenize_input = tokenize_input;
function* tokenize_and_parse( input_data_line, parsing_func ) {
    const data_chunks = input_data_line.split( /\s+/ );
    for ( const single_chunk of data_chunks ) {
        yield parsing_func( single_chunk );
    }
}
emissions.tokenize_and_parse = tokenize_and_parse;
function create_token_fetcher( input_data_line ) {
    const iterator_instance = tokenize_input( input_data_line );
    return () => iterator_instance.next().value;
}
emissions.create_token_fetcher = create_token_fetcher;
function create_int_fetcher( input_data_line ) {
    const iterator_instance = tokenize_input( input_data_line );
    return () => parseInt( iterator_instance.next().value );
}
emissions.create_int_fetcher = create_int_fetcher;
function create_bigint_fetcher( input_data_line ) {
    const iterator_instance = tokenize_input( input_data_line );
    return () => BigInt( iterator_instance.next().value );
}
emissions.create_bigint_fetcher = create_bigint_fetcher;
function fetch_integer_value( get_next_token_fn ) {
    return parseInt( get_next_token_fn() );
}
emissions.fetch_integer_value = fetch_integer_value;
function fetch_integer_array( get_next_token_fn, size ) {
    const result_collection = [];
    for ( let idx = 0; idx < size; idx++ ) {
        result_collection[ idx ] = parseInt( get_next_token_fn() );
    }
    return result_collection;
}
emissions.fetch_integer_array = fetch_integer_array;


/***/ } ),

/***/ "fs":
/* !*********************!*
  !*** external "fs" ***!
  !*********************/
/* ! no static emissions found */
/***/ ( function( proc, emissions ) {

proc.emissions = require( "fs" );

/***/ } )

/***** } );
//# sourceMappingURL=submit.js.map */