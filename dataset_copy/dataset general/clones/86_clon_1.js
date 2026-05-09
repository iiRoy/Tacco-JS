// This file contains a collection of JavaScript functions for PHP compatibility.
// For more information and licensing details, please visit:
// http://kevin.vanzonneveld.net/techblog/article/phpjs_licensing/

// Current version: 1.76
// Copyright 2008 Kevin van Zonneveld.

// Portions of this code are also copyright of various contributors:
// Onno Marsman, Michael White (http://getsprink.com), _argos, Jack,
// Jonas Raoni Soares Silva (http://www.jsfromhell.com), Philip Peterson,
// Legaev Andrey, Ates Goral (http://magnetiq.com), Martijn Wieringa,
// Philippe Baumann, Webtoolkit.info (http://www.webtoolkit.info/),
// Carlos R. L. Rodrigues (http://www.jsfromhell.com), Enrique Gonzalez,
// Ash Searle (http://hexmen.com/blog/), Erkekjetter, GeekFG (http://geekfg.blogspot.com),
// Johnny Mast (http://www.phpvrouwen.nl), d3x, marrtins, AJ, Alex,
// Alfonso Jimenez (http://www.alfonsojimenez.com), Aman Gupta,
// Arpad Ray (mailto:arpad@php.net), Karol Kowalski, Mirek Slugen, Nate,
// Sakimori, Thunder.m, Tyler Akins (http://rumkin.com),
// mdsjack (http://www.mdsjack.bo.it), Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev),
// Allan Jensen (http://www.winternet.no), Andrea Giammarchi (http://webreflection.blogspot.com),
// Anton Ongson, Arno, Atli Þór, Bayron Guevara, Ben Bryan, Benjamin Lupton,
// Brad Touesnard, Brett Zamir, Cagri Ekin, Christian Doebler, Cord, David,
// David James, Dino, DxGx, FGFEmperor, Felix Geisendoerfer (http://www.debuggable.com/felix),
// Francois, FremyCompany, Gabriel Paderni, Howard Yeend, J A R,
// Kirk Strobeck, LH, Leslie Hoare, Lincoln Ramsay, Luke Godfrey,
// Mateusz "loonquawl" Zalega, MeEtc (http://yass.meetcweb.com), Mick@el,
// Nathan, Nick Callen, Norman "zEh" Fuchs, Ozh,
// Pedro Tainha (http://www.pedrotainha.com),
// Peter-Paul Koch (http://www.quirksmode.org/js/beat.html), Pul, Pyerre,
// ReverseSyntax, Robin, Sanjoy Roy, Saulo Vallory, Scott Cariss,
// Simon Willison (http://simonwillison.net), Slawomir Kaniecki, Steve Clay,
// Steve Hilder, Steven Levithan (http://blog.stevenlevithan.com), T.Wild,
// T0bsn, Thiago Mata (http://thiagomata.blog.com), Tim Wiel,
// XoraX (http://www.xorax.info), Yannoo, baris ozdil, booeyOH, djmix,
// dptr1988, duncan, echo is bad, gabriel paderni, ger, gorthaur, hitwork,
// jakes, john (http://www.jd-tech.net), johnrembo, kenneth, marc andreu,
// metjay, nobbler, penutbutterjelly, sankai, sowberry, stensi.

// This software is dual licensed under the MIT (MIT-LICENSE.txt)
// and GPL (GPL-LICENSE.txt) licenses.

// MIT License terms:
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL KEVIN VAN ZONNEVELD BE LIABLE FOR ANY CLAIM, DAMAGES
// OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

// PHPJS compatibility library.

// {{{ array
function array( ) {
  // #!#!#!#!# array::$descr1 does not contain valid 'array' at line 260
  // This function mimics PHP's array() constructor for simple cases.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array/
  // +       version: 809.522
  // +   original by: d3x
  // *     example 1: array('Kevin', 'van', 'Zonneveld');
  // *     returns 1: ['Kevin', 'van', 'Zonneveld']

  // Returns a new array from the arguments passed.
  return Array . prototype . slice . call ( arguments ) ;
} // }}}

// {{{ array_change_key_case
function array_change_key_case( array ) {
  // Changes all keys in an array to either lowercase or uppercase.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_change_key_case/
  // +       version: 809.522
  // +   original by: Ates Goral (http://magnetiq.com)
  // +   improved by: marrtins
  // *     example 1: array_change_key_case(42);
  // *     returns 1: false
  // *     example 2: array_change_key_case([ 3, 5 ]);
  // *     returns 2: {0: 3, 1: 5}
  // *     example 3: array_change_key_case({ FuBaR: 42 });
  // *     returns 3: {"fubar": 42}
  // *     example 4: array_change_key_case({ FuBaR: 42 }, 'CASE_LOWER');
  // *     returns 4: {"fubar": 42}
  // *     example 5: array_change_key_case({ FuBaR: 42 }, 'CASE_UPPER');
  // *     returns 5: {"FUBAR": 42}
  // *     example 6: array_change_key_case({ FuBaR: 42 }, 2);
  // *     returns 6: {"FUBAR": 42}

  var case_fn, tmp_ar = new Object, argc = arguments.length, argv = arguments, key ; // Declare variables.

  if ( array instanceof Array ) { // If the input is an actual array, return it as is.
    return array ;
  }

  if ( array instanceof Object ) { // Proceed only if it's an object.
    // Determine the case conversion function based on the second argument.
    if ( argc == 1 || argv[1] == 'CASE_LOWER' || argv[1] == 0 ) {
      case_fn = "toLowerCase" ; // Default to lowercase.
    } else {
      case_fn = "toUpperCase" ; // Otherwise, uppercase.
    }

    // Iterate through the object's keys and convert them.
    for ( var key in array ) {
      tmp_ar[ key[ case_fn ]() ] = array[ key ] ;
    }
    return tmp_ar ; // Return the new object with converted keys.
  }

  return false ; // Return false for invalid input.
} // }}}

// {{{ array_chunk
function array_chunk( input, size ) {
  // Splits an array into chunks of a specified size.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_chunk/
  // +       version: 809.522
  // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
  // *     example 1: array_chunk(['Kevin', 'van', 'Zonneveld'], 2);
  // *     returns 1: {0 : {0: 'Kevin', 1: 'van'} , 1 : {0: 'Zonneveld'}}

  for ( var x, i = 0, c = -1, l = input.length, n = [] ; i < l ; i++ ) {
    ( x = i % size ) ? n[c][x] = input[i] : n[++c] = [input[i]] ;
  }

  return n ; // Returns the new chunked array.
} // }}}

// {{{ array_combine
function array_combine( keys, values ) {
  // Creates an array by using one array for keys and another for its values.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_combine/
  // +       version: 809.522
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: array_combine([0,1,2], ['kevin','van','zonneveld']);
  // *     returns 1: {0: 'kevin', 1: 'van', 2: 'zonneveld'}

  var new_array = {} , keycount = keys.length , i ; // Initialize variables.

  // Input sanitation: ensure keys and values are arrays.
  if ( ! keys || ! values || keys . constructor !== Array || values . constructor !== Array ) {
    return false ;
  }

  // Check if the number of elements in both arrays matches.
  if ( keycount != values . length ) {
    return false ;
  }

  // Populate the new array with keys from `keys` and values from `values`.
  for ( i = 0 ; i < keycount ; i++ ) {
    new_array[ keys[i] ] = values[i] ;
  }

  return new_array ; // Return the combined object.
} // }}}

// {{{ array_count_values
function array_count_values( array ) {
  // Counts all the values of an array, returning an object where keys are values
  // and values are their counts.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_count_values/
  // +       version: 810.2018
  // +   original by: Ates Goral (http://magnetiq.com)
  // + namespaced by: Michael White (http://getsprink.com)
  // +      input by: sankai
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: array_count_values([ 3, 5, 3, "foo", "bar", "foo" ]);
  // *     returns 1: {3:2, 5:1, "foo":2, "bar":1}
  // *     example 2: array_count_values({ p1: 3, p2: 5, p3: 3, p4: "foo", p5: "bar", p6: "foo" });
  // *     returns 2: {3:2, 5:1, "foo":2, "bar":1}
  // *     example 3: array_count_values([ true, 4.2, 42, "fubar" ]);
  // *     returns 3: {42:1, "fubar":1}

  var tmp_arr = {} , key = '' , t = '' ; // Initialize variables.

  // Helper function to determine the type of an object.
  var __getType = function( obj ) {
    var t = typeof obj ;
    t = t . toLowerCase ( ) ;
    if ( t == "object" ) {
      t = "array" ; // Treat objects as associative arrays.
    }
    return t ;
  } ;

  // Helper function to count a single value.
  var __countValue = function ( value ) {
    switch ( typeof ( value ) ) {
      case "number" :
        if ( Math . floor ( value ) != value ) {
          return ; // Only count integers.
        }
      case "string" :
        if ( value in this ) {
          ++ this[ value ] ; // Increment count if value exists.
        } else {
          this[ value ] = 1 ; // Initialize count if new value.
        }
    }
  } ;

  t = __getType ( array ) ;
  if ( t == 'array' ) {
    for ( key in array ) {
      __countValue . call ( tmp_arr , array[ key ] ) ; // Call counting function for each element.
    }
  }
  return tmp_arr ; // Return the object with value counts.
} // }}}

// {{{ array_diff
function array_diff ( array ) {
  // Computes the difference of arrays, returning values from the first array
  // that are not present in any of the other arrays.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_diff/
  // +       version: 809.522
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Sanjoy Roy
  // *     example 1: array_diff(['Kevin', 'van', 'Zonneveld'], ['van', 'Zonneveld']);
  // *     returns 1: ['Kevin']

  var arr_dif = [] , i = 1 , argc = arguments . length , argv = arguments , key , key_c , found = false , cntr = 0 ;

  // Loop through the first array.
  for ( key in array ) {
    // Loop over other arrays for comparison.
    for ( i = 1 ; i < argc ; i++ ) {
      found = false ; // Reset found flag for each element.
      // Search for the current element in the compare array.
      for ( key_c in argv[i] ) {
        if ( argv[i][key_c] == array[key] ) {
          found = true ;
          break ; // Element found, no need to continue searching this array.
        }
      }

      // If the element was NOT found in the current compare array, add it to the difference.
      if ( ! found ) {
        arr_dif[ cntr ] = array[ key ] ;
        cntr++ ;
      }
    }
  }

  return arr_dif ; // Return the array of differences.
} // }}}

// {{{ array_diff_assoc
function array_diff_assoc ( array ) {
  // Computes the difference of arrays with an additional index (key) check.
  // Returns elements from the first array whose key-value pairs are not
  // present in any of the other arrays.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_diff_assoc/
  // +       version: 809.522
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: array_diff_assoc({0: 'Kevin', 1: 'van', 2: 'Zonneveld'}, {0: 'Kevin', 4: 'van', 5: 'Zonneveld'});
  // *     returns 1: {1: 'van', 2: 'Zonneveld'}

  var arr_dif = {} , i = 1 , argc = arguments . length , argv = arguments , key , key_c , found = false ; // Initialize vars.

  // Input sanitation: ensure 'array' is an array-like object.
  if ( ! array || ( array . constructor !== Array && array . constructor !== Array && typeof array != 'object' && typeof array != 'array' ) ) {
    return null ;
  }

  // Loop through the first array (object).
  for ( key in array ) {
    // Loop over other arrays/objects for comparison.
    for ( i = 1 ; i < argc ; i++ ) {
      found = false ; // Reset found flag for each key.
      // Check if the key exists in the current compare array.
      if ( argv[i][key] ) {
        found = true ;
        break ; // Key found, no need to continue searching this array.
      }

      // If the key was NOT found in the current compare array, add it to the difference.
      if ( ! found ) {
        arr_dif[ key ] = array[ key ] ;
      }
    }
  }

  return arr_dif ; // Return the object of differences.
} // }}}

// {{{ array_diff_key
function array_diff_key( object ) {
  // Computes the difference of arrays using only keys for comparison.
  // Returns elements from the first object whose keys are not present in
  // any of the other objects.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_diff_key/
  // +       version: 809.522
  // +   original by: Ates Goral (http://magnetiq.com)
  // *     example 1: array_diff_key({red: 1, green: 2, blue: 3, white: 4});
  // *     returns 1: {"red":1, "green":2, "blue":3, "white":4}
  // *     example 2: array_diff_key({red: 1, green: 2, blue: 3, white: 4}, {red: 5});
  // *     returns 2: {"green":2, "blue":3, "white":4}
  // *     example 3: array_diff_key({red: 1, green: 2, blue: 3, white: 4}, {red: 5}, {green: 6, blue: 7});
  // *     returns 3: {"white":4}
  // *     example 4: array_diff_key({red: 1, green: 2, blue: 3, white: 4}, {red: 5}, {red: 5});
  // *     returns 4: {"green":2, "blue":3, "white":4}

  var tpm_ar = new Object ( ) , argc = arguments . length , argv = arguments , key , argidx , other ; // Declare all variables.

  // Initially, copy all key-value pairs from the first object.
  for ( key in object ) {
    tpm_ar[ key ] = object[ key ] ;
  }

  // Iterate through the rest of the arguments (comparison objects).
  for ( argidx = 1 ; argidx < argc ; ++ argidx ) {
    other = argv[ argidx ] ;

    if ( other instanceof Object ) {
      // For each key in the comparison object, delete it from our temporary array.
      for ( key in other ) {
        delete tpm_ar[ key ] ;
      }
    }
  }

  return tpm_ar ; // Return the resulting object with differing keys.
} // }}}

// {{{ array_fill
function array_fill( start_index, num, mixed_val ) {
  // Fills an array with a specified number of entries, starting at a given index,
  // all having the same value.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_fill/
  // +       version: 810.2018
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: _argos
  // *     example 1: array_fill(5, 6, 'banana');
  // *     returns 1: { 5: 'banana', 6: 'banana', 7: 'banana', 8: 'banana', 9: 'banana', 10: 'banana' }

  var key , tmp_arr = {} ; // Initialize temporary array.

  if ( ! isNaN ( start_index ) && ! isNaN ( num ) ) {
    // Loop 'num' times to fill the array.
    for ( key = 0 ; key < num ; key++ ) {
      tmp_arr[ ( key + start_index ) ] = mixed_val ; // Assign the value at the calculated index.
    }
  }

  return tmp_arr ; // Return the filled array.
} // }}}

// {{{ array_flip
function array_flip( trans ) {
  // Exchanges all keys with their associated values in an array (object).
  // If a value appears more than once, the last key will be used.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_flip/
  // +       version: 809.522
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: array_flip( {a: 1, b: 1, c: 2} );
  // *     returns 1: {1: 'b', 2: 'c'}

  var key , tmp_ar = {} ; // Initialize temporary object.

  // Iterate through the input object.
  for ( key in trans ) {
    tmp_ar[ trans[ key ] ] = key ; // Swap key and value.
  }

  return tmp_ar ; // Return the flipped object.
} // }}}

// {{{ array_key_exists
function array_key_exists ( key, search ) {
  // Checks if the given key or index exists in the array (object).

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_key_exists/
  // +       version: 809.522
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Felix Geisendoerfer (http://www.debuggable.com/felix)
  // *     example 1: array_key_exists('kevin', {'kevin': 'van Zonneveld'});
  // *     returns 1: true

  // Input sanitation: ensure 'search' is an array or object.
  if ( ! search || ( search . constructor !== Array && search . constructor !== Object ) ) {
    return false ;
  }

  return key in search ; // Use 'in' operator for key existence check.
} // }}}

// {{{ array_keys
function array_keys( input, search_value, strict ) {
  // Returns all the keys or a subset of the keys of an array (object).
  // Optionally filters by a search value and strict comparison.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_keys/
  // +       version: 810.2018
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: array_keys( {firstname: 'Kevin', surname: 'van Zonneveld'} );
  // *     returns 1: {0: 'firstname', 1: 'surname'}

  var tmp_arr = {} , strict = !! strict , include = true , cnt = 0 ; // Initialize variables for the new array and counter.

  // Iterate over each key in the input object.
  for ( key in input ) {
    include = true ; // Assume inclusion by default.
    if ( search_value != undefined ) {
      // If a search value is provided, apply filtering logic.
      if ( strict && input[ key ] !== search_value ) {
        include = false ; // Strict comparison (type and value).
      } else if ( input[ key ] != search_value ) {
        include = false ; // Loose comparison (value only).
      }
    }

    // If the key should be included, add it to the temporary array.
    if ( include ) {
      tmp_arr[ cnt ] = key ;
      cnt++ ;
    }
  }

  return tmp_arr ; // Return the object containing the keys.
} // }}}

// {{{ array_map
function array_map( callback ) {
  // Applies the callback function to the elements of the given arrays.
  // This version handles multiple input arrays, passing corresponding elements
  // as arguments to the callback.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_map/
  // +       version: 809.522
  // +   original by: Andrea Giammarchi (http://webreflection.blogspot.com)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: array_map( function(a){return (a * a * a)}, [1, 2, 3, 4, 5] );
  // *     returns 1: [ 1, 8, 27, 64, 125 ]

  var argc = arguments . length , argv = arguments ; // Get argument count and values.
  var j = argv[1] . length , i = 0 , k = 1 , m = 0 ; // Initialize loop counters and indices.
  var tmp = [] , tmp_ar = [] ; // Temporary arrays for arguments and results.

  // Iterate up to the length of the first array passed after the callback.
  while ( i < j ) {
    // Collect corresponding elements from all input arrays.
    while ( k < argc ) {
      tmp[ m++ ] = argv[ k++ ][ i ] ;
    }

    m = 0 ; // Reset temporary argument counter.
    k = 1 ; // Reset array argument index.

    // Apply the callback or just push the collected elements if no callback.
    if ( callback ) {
      tmp_ar[ i++ ] = callback . apply ( null , tmp ) ;
    } else {
      tmp_ar[ i++ ] = tmp ;
    }

    tmp = [] ; // Clear temporary arguments for the next iteration.
  }

  return tmp_ar ; // Return the array of results.
} // }}}

// {{{ array_pad
function array_pad ( input, pad_size, pad_value ) {
  // Pads an array to the specified length with a given value.
  // If pad_size is positive, pads on the right; if negative, pads on the left.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_pad/
  // +       version: 809.522
  // +   original by: _argos
  // *     example 1: array_pad([ 7, 8, 9 ], 2, 'a');
  // *     returns 1: [ 7, 8, 9]
  // *     example 2: array_pad([ 7, 8, 9 ], 5, 'a');
  // *     returns 2: [ 7, 8, 9, 'a', 'a']
  // *     example 3: array_pad([ 7, 8, 9 ], 5, 2);
  // *     returns 3: [ 7, 8, 9, 2, 2]
  // *     example 4: array_pad([ 7, 8, 9 ], -5, 'a');
  // *     returns 4: [ 'a', 'a', 7, 8, 9 ]

  var pad = [] , newArray = [] , newLength , i = 0 ; // Declare variables.

  // Validate input: must be an array and pad_size must be a number.
  if ( input instanceof Array && ! isNaN ( pad_size ) ) {
    newLength = ( ( pad_size < 0 ) ? ( pad_size * -1 ) : pad_size ) ; // Absolute value of pad_size.

    if ( newLength > input . length ) {
      // If padding is needed.
      for ( i = 0 ; i < ( newLength - input . length ) ; i++ ) {
        newArray [ i ] = pad_value ; // Create the padding array.
      }
      // Concatenate based on the sign of pad_size.
      pad = ( ( pad_size < 0 ) ? newArray . concat ( input ) : input . concat ( newArray ) ) ;
    } else {
      pad = input ; // No padding needed, return original array.
    }
  }

  return pad ; // Return the padded (or original) array.
} // }}}

// {{{ array_pop
function array_pop( array ) {
  // Pops the element off the end of the array.

  // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_pop/
  // +       version: 809.522
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: array_pop([0,1,2]);
  // *     returns 1: 2

  // If the array is empty, return null.
  if ( ! array . length ) {
    return null ;
  }

  // Use the native JavaScript pop method.
  return array . pop ( ) ;
} // }}}

// {{{ array_product