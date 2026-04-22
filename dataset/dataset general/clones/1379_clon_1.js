/*
 * Parse JavaScript SDK
 *
 * Version: 1.0.8
 * Built: Mon Jul 09 2012 15:57:07
 *
 * Project Home: http://parse.com
 *
 * Copyright (c) 2012 Parse, Inc. All rights reserved.
 * The Parse JavaScript SDK is distributed under the terms of the MIT License.
 *
 * This SDK includes a modified version of Underscore.js.
 * Underscore.js Copyright (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Underscore.js is also released under the MIT license.
 *
 */
( function ( root ) {


    root . Parse = root . Parse || {} ;


    root . Parse . VERSION = "1.0.8" ;


} ( this ) ) ;


/*
 *
 * Underscore.js 1.3.3
 * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Underscore is freely distributable under the MIT license.
 * Portions of Underscore are inspired or borrowed from Prototype,
 * Oliver Steele's Functional, and John Resig's Micro-Templating.
 * For all details and documentation:
 * http://documentcloud.github.com/underscore
 *
 */
( function ( ) {


    // --- Baseline Setup for Underscore ---
    // This section establishes the foundational environment.


    // Determine the global object: `window` in browsers, `global` on the server.
    var root = this ;


    // Preserve any existing `_` variable to avoid conflicts.
    var previousUnderscore = root . _ ;


    // A special object used to signal an early exit from loop iterations.
    var breaker = {} ;


    // Cached references to native prototypes for efficiency and minification.
    var ArrayProto  =  Array . prototype ,
        ObjProto    =  Object . prototype ,
        FuncProto   =  Function . prototype ;


    // Quick references to commonly used prototype methods.
    var slice          =  ArrayProto . slice ,
        unshift        =  ArrayProto . unshift ,
        toString       =  ObjProto . toString ,
        hasOwnProperty =  ObjProto . hasOwnProperty ;


    // Native ECMAScript 5 function implementations, preferred when available.
    var
        nativeForEach     =  ArrayProto . forEach ,
        nativeMap         =  ArrayProto . map ,
        nativeReduce      =  ArrayProto . reduce ,
        nativeReduceRight =  ArrayProto . reduceRight ,
        nativeFilter      =  ArrayProto . filter ,
        nativeEvery       =  ArrayProto . every ,
        nativeSome        =  ArrayProto . some ,
        nativeIndexOf     =  ArrayProto . indexOf ,
        nativeLastIndexOf =  ArrayProto . lastIndexOf ,
        nativeIsArray     =  Array . isArray ,
        nativeKeys        =  Object . keys ,
        nativeBind        =  FuncProto . bind ;


    // Create the Underscore object, which can be used for chaining.
    var _ = function ( obj ) {
        return new wrapper ( obj ) ;
    } ;


    // Export the Underscore object based on the environment (Node.js or browser).
    if ( typeof exports !== 'undefined' ) {
        if ( typeof module !== 'undefined' && module . exports ) {
            exports = module . exports = _ ;
        }
        exports . _ = _ ;
    } else {
        root [ '_' ] = _ ; // Assign to the global object in a browser environment.
    }


    // Set the current version of the Underscore library.
    _ . VERSION = '1.3.3' ;


    // --- Collection Functions ---
    // Functions for iterating, transforming, and filtering collections (arrays and objects).


    // The core iteration function, also known as `forEach`.
    // It iterates over elements, applying an `iterator` function to each.
    // Delegates to native `forEach` when possible.
    var each = _ . each = _ . forEach = function ( obj , iterator , context ) {
        if ( obj == null ) {
            return ;
        }
        if ( nativeForEach && obj . forEach === nativeForEach ) {
            obj . forEach ( iterator , context ) ;
        } else if ( obj . length === + obj . length ) {
            for ( var i = 0 , l = obj . length ; i < l ; i ++ ) {
                if ( i in obj && iterator . call ( context , obj [ i ] , i , obj ) === breaker ) {
                    return ;
                }
            }
        } else {
            for ( var key in obj ) {
                if ( _ . has ( obj , key ) ) {
                    if ( iterator . call ( context , obj [ key ] , key , obj ) === breaker ) {
                        return ;
                    }
                }
            }
        }
    } ;


    // `map` (or `collect`) transforms each element in a collection using an `iterator` function.
    // It returns a new array containing the results of the transformation.
    // Utilizes native `map` if available.
    _ . map = _ . collect = function ( obj , iterator , context ) {
        var results = [ ] ;
        if ( obj == null ) {
            return results ;
        }
        if ( nativeMap && obj . map === nativeMap ) {
            return obj . map ( iterator , context ) ;
        }
        each ( obj , function ( value , index , list ) {
            results [ results . length ] = iterator . call ( context , value , index , list ) ;
        } ) ;
        if ( obj . length === + obj . length ) {
            results . length = obj . length ;
        }
        return results ;
    } ;


    // `reduce` (also `foldl` or `inject`) accumulates a single value by applying an `iterator`
    // function to each element in a collection, along with an accumulator.
    // Leverages native `reduce` if present.
    _ . reduce = _ . foldl = _ . inject = function ( obj , iterator , memo , context ) {
        var initial = arguments . length > 2 ;
        if ( obj == null ) {
            obj = [ ] ;
        }
        if ( nativeReduce && obj . reduce === nativeReduce ) {
            if ( context ) {
                iterator = _ . bind ( iterator , context ) ;
            }
            return initial ? obj . reduce ( iterator , memo ) : obj . reduce ( iterator ) ;
        }
        each ( obj , function ( value , index , list ) {
            if ( ! initial ) {
                memo = value ;
                initial = true ;
            } else {
                memo = iterator . call ( context , memo , value , index , list ) ;
            }
        } ) ;
        if ( ! initial ) {
            throw new TypeError ( 'Reduce of empty array with no initial value' ) ;
        }
        return memo ;
    } ;


    // `reduceRight` (or `foldr`) is the right-associative version of `reduce`.
    // It applies the `iterator` from right to left.
    // Delegates to native `reduceRight` where available.
    _ . reduceRight = _ . foldr = function ( obj , iterator , memo , context ) {
        var initial = arguments . length > 2 ;
        if ( obj == null ) {
            obj = [ ] ;
        }
        if ( nativeReduceRight && obj . reduceRight === nativeReduceRight ) {
            if ( context ) {
                iterator = _ . bind ( iterator , context ) ;
            }
            return initial ? obj . reduceRight ( iterator , memo ) : obj . reduceRight ( iterator ) ;
        }
        var reversed = _ . toArray ( obj ) . reverse ( ) ;
        if ( context && ! initial ) {
            iterator = _ . bind ( iterator , context ) ;
        }
        return initial ? _ . reduce ( reversed , iterator , memo , context ) : _ . reduce ( reversed , iterator ) ;
    } ;


    // `find` (or `detect`) returns the first element in a collection that satisfies a truth test.
    _ . find = _ . detect = function ( obj , iterator , context ) {
        var result ;
        any ( obj , function ( value , index , list ) {
            if ( iterator . call ( context , value , index , list ) ) {
                result = value ;
                return true ;
            }
        } ) ;
        return result ;
    } ;


    // `filter` (or `select`) returns all elements in a collection that pass a truth test.
    // It uses native `filter` if available.
    _ . filter = _ . select = function ( obj , iterator , context ) {
        var results = [ ] ;
        if ( obj == null ) {
            return results ;
        }
        if ( nativeFilter && obj . filter === nativeFilter ) {
            return obj . filter ( iterator , context ) ;
        }
        each ( obj , function ( value , index , list ) {
            if ( iterator . call ( context , value , index , list ) ) {
                results [ results . length ] = value ;
            }
        } ) ;
        return results ;
    } ;


    // `reject` returns all elements in a collection that do *not* pass a truth test.
    // It's the inverse of `filter`.
    _ . reject = function ( obj , iterator , context ) {
        var results = [ ] ;
        if ( obj == null ) {
            return results ;
        }
        each ( obj , function ( value , index , list ) {
            if ( ! iterator . call ( context , value , index , list ) ) {
                results [ results . length ] = value ;
            }
        } ) ;
        return results ;
    } ;


    // `every` (or `all`) checks if all elements in a collection pass a truth test.
    // It delegates to native `every` when possible.
    _ . every = _ . all = function ( obj , iterator , context ) {
        var result = true ;
        if ( obj == null ) {
            return result ;
        }
        if ( nativeEvery && obj . every === nativeEvery ) {
            return obj . every ( iterator , context ) ;
        }
        each ( obj , function ( value , index , list ) {
            if ( ! ( result = result && iterator . call ( context , value , index , list ) ) ) {
                return breaker ;
            }
        } ) ;
        return !! result ;
    } ;


    // `some` (or `any`) checks if at least one element in a collection passes a truth test.
    // It uses native `some` if available.
    var any = _ . some = _ . any = function ( obj , iterator , context ) {
        iterator || ( iterator = _ . identity ) ;
        var result = false ;
        if ( obj == null ) {
            return result ;
        }
        if ( nativeSome && obj . some === nativeSome ) {
            return obj . some ( iterator , context ) ;
        }
        each ( obj , function ( value , index , list ) {
            if ( result || ( result = iterator . call ( context , value , index , list ) ) ) {
                return breaker ;
            }
        } ) ;
        return !! result ;
    } ;


    // `include` (or `contains`) determines if a given value is present in a collection.
    // It uses strict equality (`===`).
    // Delegates to native `indexOf` for arrays.
    _ . include = _ . contains = function ( obj , target ) {
        var found = false ;
        if ( obj == null ) {
            return found ;
        }
        if ( nativeIndexOf && obj . indexOf === nativeIndexOf ) {
            return obj . indexOf ( target ) != - 1 ;
        }
        found = any ( obj , function ( value ) {
            return value === target ;
        } ) ;
        return found ;
    } ;


    // `invoke` calls a specified method on each item in a collection.
    // Additional arguments are passed to the method.
    _ . invoke = function ( obj , method ) {
        var args = slice . call ( arguments , 2 ) ;
        return _ . map ( obj , function ( value ) {
            return ( _ . isFunction ( method ) ? method || value : value [ method ] ) . apply ( value , args ) ;
        } ) ;
    } ;


    // `pluck` extracts a specific property from each object in a collection,
    // returning an array of those property values.
    _ . pluck = function ( obj , key ) {
        return _ . map ( obj , function ( value ) {
            return value [ key ] ;
        } ) ;
    } ;


    // `max` finds the maximum element in a collection.
    // An optional `iterator` can be provided to determine the value to compare.
    _ . max = function ( obj , iterator , context ) {
        if ( ! iterator && _ . isArray ( obj ) && obj [ 0 ] === + obj [ 0 ] ) {
            return Math . max . apply ( Math , obj ) ;
        }
        if ( ! iterator && _ . isEmpty ( obj ) ) {
            return - Infinity ;
        }
        var result = { computed : - Infinity } ;
        each ( obj , function ( value , index , list ) {
            var computed = iterator ? iterator . call ( context , value , index , list ) : value ;
            computed >= result . computed && ( result = { value : value , computed : computed } ) ;
        } ) ;
        return result . value ;
    } ;


    // `min` finds the minimum element in a collection.
    // An optional `iterator` can be provided to determine the value to compare.
    _ . min = function ( obj , iterator , context ) {
        if ( ! iterator && _ . isArray ( obj ) && obj [ 0 ] === + obj [ 0 ] ) {
            return Math . min . apply ( Math , obj ) ;
        }
        if ( ! iterator && _ . isEmpty ( obj ) ) {
            return Infinity ;
        }
        var result = { computed : Infinity } ;
        each ( obj , function ( value , index , list ) {
            var computed = iterator ? iterator . call ( context , value , index , list ) : value ;
            computed < result . computed && ( result = { value : value , computed : computed } ) ;
        } ) ;
        return result . value ;
    } ;


    // `shuffle` randomly reorders the elements of an array.
    // It creates a new array without modifying the original.
    _ . shuffle = function ( obj ) {
        var shuffled = [ ] ,
            rand ;
        each ( obj , function ( value , index , list ) {
            rand = Math . floor ( Math . random ( ) * ( index + 1 ) ) ;
            shuffled [ index ] = shuffled [ rand ] ;
            shuffled [ rand ] = value ;
        } ) ;
        return shuffled ;
    } ;


    // `sortBy` sorts a collection's elements based on a criterion.
    // The criterion can be a string (property name) or a function.
    _ . sortBy = function ( obj , val , context ) {
        var iterator = _ . isFunction ( val ) ? val : function ( obj ) {
            return obj [ val ] ;
        } ;
        return _ . pluck ( _ . map ( obj , function ( value , index , list ) {
            return {
                value : value ,
                criteria : iterator . call ( context , value , index , list )
            } ;
        } ) . sort ( function ( left , right ) {
            var a = left . criteria ,
                b = right . criteria ;
            if ( a === void 0 ) {
                return 1 ;
            }
            if ( b === void 0 ) {
                return - 1 ;
            }
            return a < b ? - 1 : a > b ? 1 : 0 ;
        } ) , 'value' ) ;
    } ;


    // `groupBy` groups the elements of a collection based on a given criterion.
    // The criterion can be a property name or a function.
    _ . groupBy = function ( obj , val ) {
        var result = {} ;
        var iterator = _ . isFunction ( val ) ? val : function ( obj ) {
            return obj [ val ] ;
        } ;
        each ( obj , function ( value , index ) {
            var key = iterator ( value , index ) ;
            ( result [ key ] || ( result [ key ] = [ ] ) ) . push ( value ) ;
        } ) ;
        return result ;
    } ;


    // `sortedIndex` determines the correct insertion point for an object in a sorted array,
    // maintaining the array's order. It uses a binary search algorithm.
    _ . sortedIndex = function ( array , obj , iterator ) {
        iterator || ( iterator = _ . identity ) ;
        var low = 0 ,
            high = array . length ;
        while ( low < high ) {
            var mid = ( low + high ) >> 1 ;
            iterator ( array [ mid ] ) < iterator ( obj ) ? low = mid + 1 : high = mid ;
        }
        return low ;
    } ;


    // `toArray` safely converts any iterable object into a real JavaScript array.
    _ . toArray = function ( obj ) {
        if ( ! obj ) {
            return [ ] ;
        }
        if ( _ . isArray ( obj ) ) {
            return slice . call ( obj ) ;
        }
        if ( _ . isArguments ( obj ) ) {
            return slice . call ( obj ) ;
        }
        if ( obj . toArray && _ . isFunction ( obj . toArray ) ) {
            return obj . toArray ( ) ;
        }
        return _ . values ( obj ) ;
    } ;


    // `size` returns the number of elements in a collection (array length or object keys count).
    _ . size = function ( obj ) {
        return _ . isArray ( obj ) ? obj . length : _ . keys ( obj ) . length ;
    } ;


    // --- Array Functions ---
    // Functions specifically designed for manipulating arrays.


    // `first` (or `head`, `take`) retrieves the first element(s) of an array.
    // If `n` is provided, it returns the first `n` elements.
    // `guard` is used for internal `map` compatibility.
    _ . first = _ . head = _ . take = function ( array , n , guard ) {
        return ( n != null ) && ! guard ? slice . call ( array , 0 , n ) : array [ 0 ] ;
    } ;


    // `initial` returns all elements of an array except for the last one (or last `n` elements).
    // Useful for `arguments` objects.
    _ . initial = function ( array , n , guard ) {
        return slice . call ( array , 0 , array . length - ( ( n == null ) || guard ? 1 : n ) ) ;
    } ;


    // `last` retrieves the last element(s) of an array.
    // If `n` is provided, it returns the last `n` elements.
    _ . last = function ( array , n , guard ) {
        if ( ( n != null ) && ! guard ) {
            return slice . call ( array , Math . max ( array . length - n , 0 ) ) ;
        } else {
            return array [ array . length - 1 ] ;
        }
    } ;


    // `rest` (or `tail`) returns all elements of an array except for the first one.
    // If `index` is provided, it returns elements from that index onward.
    _ . rest = _ . tail = function ( array , index , guard ) {
        return slice . call ( array , ( index == null ) || guard ? 1 : index ) ;
    } ;


    // `compact` removes all falsy values (false, null, 0, "", undefined, NaN) from an array.
    _ . compact = function ( array ) {
        return _ . filter ( array , function ( value ) {
            return !! value ;
        } ) ;
    } ;


    // `flatten` converts a nested array into a single-level array.
    // If `shallow` is true, it only flattens one level deep.
    _ . flatten = function ( array , shallow ) {
        return _ . reduce ( array , function ( memo , value ) {
            if ( _ . isArray ( value ) ) {
                return memo . concat ( shallow ? value : _ . flatten ( value ) ) ;
            }
            memo [ memo . length ] = value ;
            return memo ;
        } , [ ] ) ;
    } ;


    // `without` returns a new array with specified values removed from the original array.
    _ . without = function ( array ) {
        return _ . difference ( array , slice . call ( arguments , 1 ) ) ;
    } ;


    // `uniq` (or `unique`) creates a duplicate-free version of an array.
    // If `isSorted` is true, it uses a faster algorithm. An `iterator` can define uniqueness.
    _ . uniq = _ . unique = function ( array , isSorted , iterator ) {
        var initial = iterator ? _ . map ( array , iterator ) : array ;
        var results = [ ] ;
        // `isSorted` is irrelevant for very small arrays.
        if ( array . length < 3 ) {
            isSorted = true ;
        }
        _ . reduce ( initial , function ( memo , value , index ) {
            if ( isSorted ? _ . last ( memo ) !== value || ! memo . length : ! _ . include ( memo , value ) ) {
                memo . push ( value ) ;
                results . push ( array [ index ] ) ;
            }
            return memo ;
        } , [ ] ) ;
        return results ;
    } ;


    // `union` computes the union of multiple arrays, returning unique elements from all of them.
    _ . union = function ( ) {
        return _ . uniq ( _ . flatten ( arguments , true ) ) ;
    } ;


    // `intersection` (or `intersect`) returns elements that are common to all passed-in arrays.
    _ . intersection = _ . intersect = function ( array ) {
        var rest = slice . call ( arguments , 1 ) ;
        return _ . filter ( _ . uniq ( array ) , function ( item ) {
            return _ . every ( rest , function ( other ) {
                return _ . indexOf ( other , item ) >= 0 ;
            } ) ;
        } ) ;
    } ;


    // `difference` computes the difference between the first array and subsequent arrays.
    // It returns elements present only in the first array.
    _ . difference = function ( array ) {
        var rest = _ . flatten ( slice . call ( arguments , 1 ) , true ) ;
        return _ . filter ( array , function ( value ) {
            return ! _ . include ( rest , value ) ;
        } ) ;
    } ;


    // `zip` combines multiple lists into a single array of tuples.
    // Elements at the same index from each list are grouped together.
    _ . zip = function ( ) {
        var args = slice . call ( arguments ) ;
        var length = _ . max ( _ . pluck ( args , 'length' ) ) ;
        var results = new Array ( length ) ;
        for ( var i = 0 ; i < length ; i ++ ) {
            results [ i ] = _ . pluck ( args , "" + i ) ;
        }
        return results ;
    } ;


    // `indexOf` returns the index of the first occurrence of an item in an array.
    // Returns -1 if not found. Delegates to native `indexOf` or uses binary search if `isSorted`.
    _ . indexOf = function ( array , item , isSorted ) {
        if ( array == null ) {
            return - 1 ;
        }
        var i , l ;
        if ( isSorted ) {
            i = _ . sortedIndex ( array , item ) ;
            return array [ i ] === item ? i : - 1 ;
        }
        if ( nativeIndexOf && array . indexOf === nativeIndexOf ) {
            return array . indexOf ( item ) ;
        }
        for ( i = 0 , l = array . length ; i < l ; i ++ ) {
            if ( i in array && array [ i ] === item ) {
                return i ;
            }
        }
        return - 1 ;
    } ;


    // `lastIndexOf` returns the index of the last occurrence of an item in an array.
    // Delegates to native `lastIndexOf` if available.
    _ . lastIndexOf = function ( array , item ) {
        if ( array == null ) {
            return - 1 ;
        }
        if ( nativeLastIndexOf && array . lastIndexOf === nativeLastIndexOf ) {
            return array . lastIndexOf ( item ) ;
        }
        var i = array . length ;
        while ( i -- ) {
            if ( i in array && array [ i ] === item ) {
                return i ;
            }
        }
        return - 1 ;
    } ;


    // `range` generates an array of integers within a specified range.
    // Similar to Python's `range()` function.
    _ . range = function ( start , stop , step ) {
        if ( arguments . length <= 1 ) {
            stop = start || 0 ;
            start = 0 ;
        }
        step = arguments [ 2 ] || 1 ;

        var len = Math . max ( Math . ceil ( ( stop - start ) / step ) , 0 ) ;
        var idx = 0 ;
        var range = new Array ( len ) ;

        while ( idx < len ) {
            range [ idx ++ ] = start ;
            start += step ;
        }

        return range ;
    } ;


    // --- Function (ahem) Functions ---
    // Utilities for manipulating JavaScript functions.


    // A reusable constructor function, primarily for prototype inheritance.
    var ctor = function ( ) {
    } ;


    // `bind` creates a new function that, when called, has its `this` keyword
    // set to the provided `context`, with optional pre-filled arguments (`curry`).
    // It delegates to native `Function.bind` if available.
    _ . bind = function bind ( func , context ) {
        var bound ,
            args ;