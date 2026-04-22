d3 = function  (  )  {

  //  Main D3 object initialization.
  //  This variable will hold all the D3 functions and properties.
  var  d3  =  {
    version:  "3.3.5" /* The current version of the D3 library */
  } ;


  //  Polyfill for Date.now() if it's not available in the current environment.
  //  This ensures compatibility across different JavaScript engines.
  if  (  ! Date.now  )  {
    Date.now  =  function  (  )  {
      //  Returns the current timestamp in milliseconds.
      return  + new Date ( ) ;
    } ;
  }


  //  Optimized array slicing mechanism.
  //  d3_arraySlice provides a fast way to convert array-like objects.
  var  d3_arraySlice  =  [  ] . slice ,
      d3_array  =  function  (  list  )  {
        //  Converts a list (e.g., NodeList, arguments) into a true JavaScript Array.
        return  d3_arraySlice . call  (  list  ) ;
      } ;


  //  References to global browser objects for convenience and performance.
  var  d3_document        =  document ,
      d3_documentElement =  d3_document . documentElement ,
      d3_window          =  window ;


  //  Feature detection for NodeList.prototype.slice.
  //  Some older browsers or environments might not support direct slicing of NodeLists.
  try  {
    //  Attempt to access nodeType on the first child of documentElement.
    //  This checks if d3_array can successfully process childNodes.
    d3_array  (  d3_documentElement . childNodes  ) [ 0 ] . nodeType ;
  }
  catch  (  e  )  {
    //  If an error occurs (e.g., NodeList not directly sliceable),
    //  a fallback implementation for d3_array is provided.
    d3_array  =  function  (  list  )  {
      var  i  =  list . length ,
           array  =  new Array  (  i  ) ;

      //  Iterate backwards to populate the new array.
      while  (  i --  )  {
        array [ i ]  =  list [ i ] ;
      }

      return  array ; // Return the newly created array.
    } ;
  }


  //  Feature detection for Element.style.setProperty.
  //  This block handles potential issues with DOM style manipulation in older browsers.
  try  {
    //  Attempt to set an opacity style property to test compatibility.
    d3_document . createElement  (  "div"  ) . style . setProperty  (  "opacity" ,  0 ,  ""  ) ;
  }
  catch  (  error  )  {
    //  If setProperty fails, polyfill attribute and style property methods.
    var  d3_element_prototype    =  d3_window . Element . prototype ,
         d3_element_setAttribute   =  d3_element_prototype . setAttribute ,
         d3_element_setAttributeNS =  d3_element_prototype . setAttributeNS ,
         d3_style_prototype        =  d3_window . CSSStyleDeclaration . prototype ,
         d3_style_setProperty      =  d3_style_prototype . setProperty ;

    //  Override native setAttribute to ensure values are always strings.
    d3_element_prototype . setAttribute  =  function  (  name ,  value  )  {
      d3_element_setAttribute . call  (  this ,  name ,  value  +  ""  ) ;
    } ;

    //  Override native setAttributeNS to ensure values are always strings.
    d3_element_prototype . setAttributeNS  =  function  (  space ,  local ,  value  )  {
      d3_element_setAttributeNS . call  (  this ,  space ,  local ,  value  +  ""  ) ;
    } ;

    //  Override native setProperty to ensure values are always strings.
    d3_style_prototype . setProperty  =  function  (  name ,  value ,  priority  )  {
      d3_style_setProperty . call  (  this ,  name ,  value  +  "" ,  priority  ) ;
    } ;
  }


  //  D3 utility function for ascending comparison.
  //  Used for sorting and other comparison operations.
  d3 . ascending  =  function  (  a ,  b  )  {
    return  a  <  b  ?  - 1  :  a  >  b  ?  1  :  a  >=  b  ?  0  :  NaN ;
  } ;


  //  D3 utility function for descending comparison.
  //  The inverse of d3.ascending.
  d3 . descending  =  function  (  a ,  b  )  {
    return  b  <  a  ?  - 1  :  b  >  a  ?  1  :  b  >=  a  ?  0  :  NaN ;
  } ;


  //  Calculates the minimum value in an array.
  //  An optional accessor function 'f' can be provided.
  d3 . min  =  function  (  array ,  f  )  {
    var  i  =  - 1 ,
         n  =  array . length ,
         a ,
         b ;

    if  (  arguments . length  ===  1  )  {
      //  No accessor function provided.
      while  (  ++ i  <  n  &&  ! (  (  a  =  array [ i ]  )  !=  null  &&  a  <=  a  )  )  {
        a  =  undefined ; // Skip non-numeric or null/undefined values
      }
      while  (  ++ i  <  n  )  {
        if  (  (  b  =  array [ i ]  )  !=  null  &&  a  >  b  )  {
          a  =  b ;
        }
      }
    }
    else  {
      //  Accessor function 'f' is provided.
      while  (  ++ i  <  n  &&  ! (  (  a  =  f . call  (  array ,  array [ i ] ,  i  )  )  !=  null  &&  a  <=  a  )  )  {
        a  =  undefined ; // Skip non-numeric or null/undefined values after applying accessor
      }
      while  (  ++ i  <  n  )  {
        if  (  (  b  =  f . call  (  array ,  array [ i ] ,  i  )  )  !=  null  &&  a  >  b  )  {
          a  =  b ;
        }
      }
    }

    return  a ; // Return the minimum value found.
  } ;


  //  Calculates the maximum value in an array.
  //  An optional accessor function 'f' can be provided.
  d3 . max  =  function  (  array ,  f  )  {
    var  i  =  - 1 ,
         n  =  array . length ,
         a ,
         b ;

    if  (  arguments . length  ===  1  )  {
      //  No accessor function provided.
      while  (  ++ i  <  n  &&  ! (  (  a  =  array [ i ]  )  !=  null  &&  a  <=  a  )  )  {
        a  =  undefined ;
      }
      while  (  ++ i  <  n  )  {
        if  (  (  b  =  array [ i ]  )  !=  null  &&  b  >  a  )  {
          a  =  b ;
        }
      }
    }
    else  {
      //  Accessor function 'f' is provided.
      while  (  ++ i  <  n  &&  ! (  (  a  =  f . call  (  array ,  array [ i ] ,  i  )  )  !=  null  &&  a  <=  a  )  )  {
        a  =  undefined ;
      }
      while  (  ++ i  <  n  )  {
        if  (  (  b  =  f . call  (  array ,  array [ i ] ,  i  )  )  !=  null  &&  b  >  a  )  {
          a  =  b ;
        }
      }
    }

    return  a ; // Return the maximum value found.
  } ;


  //  Calculates the extent (min and max) of values in an array.
  //  Returns an array [min, max]. Optional accessor 'f'.
  d3 . extent  =  function  (  array ,  f  )  {
    var  i  =  - 1 ,
         n  =  array . length ,
         a ,
         b ,
         c ;

    if  (  arguments . length  ===  1  )  {
      //  No accessor function provided.
      while  (  ++ i  <  n  &&  ! (  (  a  =  c  =  array [ i ]  )  !=  null  &&  a  <=  a  )  )  {
        a  =  c  =  undefined ;
      }
      while  (  ++ i  <  n  )  {
        if  (  (  b  =  array [ i ]  )  !=  null  )  {
          if  (  a  >  b  )  {
            a  =  b ; // Update minimum
          }
          if  (  c  <  b  )  {
            c  =  b ; // Update maximum
          }
        }
      }
    }
    else  {
      //  Accessor function 'f' is provided.
      while  (  ++ i  <  n  &&  ! (  (  a  =  c  =  f . call  (  array ,  array [ i ] ,  i  )  )  !=  null  &&  a  <=  a  )  )  {
        a  =  undefined ;
      }
      while  (  ++ i  <  n  )  {
        if  (  (  b  =  f . call  (  array ,  array [ i ] ,  i  )  )  !=  null  )  {
          if  (  a  >  b  )  {
            a  =  b ;
          }
          if  (  c  <  b  )  {
            c  =  b ;
          }
        }
      }
    }

    return  [  a ,  c  ] ; // Return the [min, max] tuple.
  } ;


  //  Calculates the sum of values in an array.
  //  Optional accessor function 'f'. Non-numeric values are skipped.
  d3 . sum  =  function  (  array ,  f  )  {
    var  s  =  0 ,
         n  =  array . length ,
         a ,
         i  =  - 1 ;

    if  (  arguments . length  ===  1  )  {
      //  No accessor function.
      while  (  ++ i  <  n  )  {
        if  (  ! isNaN  (  a  =  + array [ i ]  )  )  {
          s  +=  a ;
        }
      }
    }
    else  {
      //  Accessor function 'f' provided.
      while  (  ++ i  <  n  )  {
        if  (  ! isNaN  (  a  =  + f . call  (  array ,  array [ i ] ,  i  )  )  )  {
          s  +=  a ;
        }
      }
    }

    return  s ; // Return the total sum.
  } ;


  //  Helper function to check if a value is a valid number (not null/undefined and not NaN).
  function  d3_number  (  x  )  {
    return  x  !=  null  &&  ! isNaN  (  x  ) ;
  }


  //  Calculates the mean (average) of values in an array.
  //  Optional accessor function 'f'. Uses Welford's algorithm for numerical stability.
  d3 . mean  =  function  (  array ,  f  )  {
    var  n  =  array . length ,
         a ,
         m  =  0 ,
         i  =  - 1 ,
         j  =  0 ; // Count of valid numbers

    if  (  arguments . length  ===  1  )  {
      //  No accessor function.
      while  (  ++ i  <  n  )  {
        if  (  d3_number  (  a  =  array [ i ]  )  )  {
          m  +=  (  a  -  m  )  /  ++ j ; // Welford's algorithm
        }
      }
    }
    else  {
      //  Accessor function 'f' provided.
      while  (  ++ i  <  n  )  {
        if  (  d3_number  (  a  =  f . call  (  array ,  array [ i ] ,  i  )  )  )  {
          m  +=  (  a  -  m  )  /  ++ j ;
        }
      }
    }

    return  j  ?  m  :  undefined ; // Return mean or undefined if no valid numbers.
  } ;


  //  Calculates the p-quantile of a sorted array of values.
  //  Assumes 'values' is already sorted in ascending order.
  d3 . quantile  =  function  (  values ,  p  )  {
    var  H  =  (  values . length  -  1  )  *  p  +  1 ,
         h  =  Math . floor  (  H  ) ,
         v  =  + values [ h  -  1 ] ,
         e  =  H  -  h ;

    //  Linear interpolation between values[h-1] and values[h].
    return  e  ?  v  +  e  *  (  values [ h ]  -  v  )  :  v ;
  } ;


  //  Calculates the median of values in an array.
  //  Optional accessor function 'f'. Handles non-numeric values.
  d3 . median  =  function  (  array ,  f  )  {
    //  If an accessor is provided, map the array first.
    if  (  arguments . length  >  1  )  {
      array  =  array . map  (  f  ) ;
    }

    //  Filter out non-numeric values.
    array  =  array . filter  (  d3_number  ) ;

    //  Return the median or undefined if no valid numbers.
    return  array . length  ?  d3 . quantile  (  array . sort  (  d3 . ascending  ) ,  . 5  )  :  undefined ;
  } ;


  //  Creates a bisector object for finding insertion points in sorted arrays.
  //  Takes an optional accessor function 'f'.
  d3 . bisector  =  function  (  f  )  {
    return  {
      //  Left bisect: returns insertion point for 'x' such that all elements to its left are less than 'x'.
      left:  function  (  a ,  x ,  lo ,  hi  )  {
        if  (  arguments . length  <  3  )  {
          lo  =  0 ;
        }
        if  (  arguments . length  <  4  )  {
          hi  =  a . length ;
        }

        while  (  lo  <  hi  )  {
          var  mid  =  lo  +  hi  >>>  1 ; // Efficient floor division
          if  (  f . call  (  a ,  a [ mid ] ,  mid  )  <  x  )  {
            lo  =  mid  +  1 ;
          }
          else  {
            hi  =  mid ;
          }
        }
        return  lo ;
      } ,

      //  Right bisect: returns insertion point for 'x' such that all elements to its left are less than or equal to 'x'.
      right:  function  (  a ,  x ,  lo ,  hi  )  {
        if  (  arguments . length  <  3  )  {
          lo  =  0 ;
        }
        if  (  arguments . length  <  4  )  {
          hi  =  a . length ;
        }

        while  (  lo  <  hi  )  {
          var  mid  =  lo  +  hi  >>>  1 ;
          if  (  x  <  f . call  (  a ,  a [ mid ] ,  mid  )  )  {
            hi  =  mid ;
          }
          else  {
            lo  =  mid  +  1 ;
          }
        }
        return  lo ;
      }
    } ;
  } ;


  //  Default bisector for numeric arrays (accessor simply returns the value itself).
  var  d3_bisector  =  d3 . bisector  (  function  (  d  )  {
    return  d ;
  }  ) ;


  //  Expose bisector methods directly on the d3 object.
  d3 . bisectLeft  =  d3_bisector . left ;
  d3 . bisect  =  d3 . bisectRight  =  d3_bisector . right ;


  //  Shuffles an array in place using the Fisher-Yates algorithm.
  d3 . shuffle  =  function  (  array  )  {
    var  m  =  array . length ,
         t ,
         i ;

    //  While there remain elements to shuffle.
    while  (  m  )  {
      // Pick a remaining element.
      i  =  Math . random  (  )  *  m --  |  0 ; // Random index from 0 to m-1

      // And swap it with the current element.
      t  =  array [ m ] ,
      array [ m ]  =  array [ i ] ,
      array [ i ]  =  t ;
    }

    return  array ; // Return the shuffled array.
  } ;


  //  Permutes an array based on an array of indexes.
  //  Returns a new array with elements in the specified order.
  d3 . permute  =  function  (  array ,  indexes  )  {
    var  i  =  indexes . length ,
         permutes  =  new Array  (  i  ) ;

    //  Iterate backwards to populate the permuted array.
    while  (  i --  )  {
      permutes [ i ]  =  array [ indexes [ i ] ] ;
    }

    return  permutes ; // Return the new permuted array.
  } ;


  //  Generates an array of pairs from a given array.
  //  Each pair consists of [array[i-1], array[i]].
  d3 . pairs  =  function  (  array  )  {
    var  i  =  0 ,
         n  =  array . length  -  1 ,
         p0 ,
         p1  =  array [ 0 ] ,
         pairs  =  new Array  (  n  <  0  ?  0  :  n  ) ;

    while  (  i  <  n  )  {
      pairs [ i ]  =  [  p0  =  p1 ,  p1  =  array [ ++ i ]  ] ;
    }

    return  pairs ; // Return the array of pairs.
  } ;


  //  Transposes a set of arrays, effectively zipping them together.
  //  Example: d3.zip([1,2],[3,4]) returns [[1,3],[2,4]].
  d3 . zip  =  function  (  )  {
    if  (  ! (  n  =  arguments . length  )  )  {
      return  [  ] ; // If no arguments, return an empty array.
    }

    //  Find the minimum length among all input arrays to determine zip length.
    for  (  var  i  =  - 1 ,
               m  =  d3 . min  (  arguments ,  d3_zipLength  ) ,
               zips  =  new Array  (  m  ) ;
           ++ i  <  m ;
         )  {
      for  (  var  j  =  - 1 ,
                 n ,
                 zip  =  zips [ i ]  =  new Array  (  n  ) ;
             ++ j  <  n ;
           )  {
        zip [ j ]  =  arguments [ j ] [ i ] ;
      }
    }

    return  zips ; // Return the zipped arrays.
  } ;


  //  Helper function for d3.zip to get the length of an array-like object.
  function  d3_zipLength  (  d  )  {
    return  d . length ;
  }


  //  Alias for d3.zip, useful for transposing matrices.
  d3 . transpose  =  function  (  matrix  )  {
    return  d3 . zip . apply  (  d3 ,  matrix  ) ;
  } ;


  //  Returns an array of all enumerable property names (keys) of an object.
  d3 . keys  =  function  (  map  )  {
    var  keys  =  [  ] ;
    for  (  var  key  in  map  )  {
      keys . push  (  key  ) ;
    }
    return  keys ;
  } ;


  //  Returns an array of all enumerable property values of an object.
  d3 . values  =  function  (  map  )  {
    var  values  =  [  ] ;
    for  (  var  key  in  map  )  {
      values . push  (  map [ key ]  ) ;
    }
    return  values ;
  } ;


  //  Returns an array of key-value pairs (entries) for an object.
  d3 . entries  =  function  (  map  )  {
    var  entries  =  [  ] ;
    for  (  var  key  in  map  )  {
      entries . push  (  {
        key:  key ,
        value:  map [ key ]
      }  ) ;
    }
    return  entries ;
  } ;


  //  Merges multiple arrays into a single new array.
  d3 . merge  =  function  (  arrays  )  {
    //  Uses Array.prototype.concat.apply for efficient merging.
    return  Array . prototype . concat . apply  (  [  ] ,  arrays  ) ;
  } ;


  //  Generates a numeric sequence (range).
  //  Can take 1, 2, or 3 arguments: (stop), (start, stop), or (start, stop, step).
  d3 . range  =  function  (  start ,  stop ,  step  )  {
    if  (  arguments . length  <  3  )  {
      step  =  1 ; // Default step is 1.
      if  (  arguments . length  <  2  )  {
        stop  =  start ; // If only one arg, it's 'stop', and 'start' is 0.
        start  =  0 ;
      }
    }

    //  Prevent infinite loops with zero or very small steps.
    if  (  (  stop  -  start  )  /  step  ===  Infinity  )  {
      throw  new Error  (  "infinite range"  ) ;
    }

    var  range  =  [  ] ,
         k      =  d3_range_integerScale  (  Math . abs  (  step  )  ) ,
         i      =  - 1 ,
         j ;

    //  Scale numbers to integers to avoid floating point inaccuracies.
    start  *=  k ,
    stop   *=  k ,
    step   *=  k ;

    if  (  step  <  0  )  {
      //  Descending range.
      while  (  (  j  =  start  +  step  *  ++ i  )  >  stop  )  {
        range . push  (  j  /  k  ) ;
      }
    }
    else  {
      //  Ascending range.
      while  (  (  j  =  start  +  step  *  ++ i  )  <  stop  )  {
        range . push  (  j  /  k  ) ;
      }
    }

    return  range ; // Return the generated numeric range.
  } ;


  //  Helper function to find an integer scale factor for floating point numbers.
  //  Used by d3.range to avoid precision issues.
  function  d3_range_integerScale  (  x  )  {
    var  k  =  1 ;
    while  (  x  *  k  %  1  )  {
      k  *=  10 ;
    }
    return  k ;
  }


  //  Helper function to extend a constructor's prototype with properties.
  //  Uses Object.defineProperty for non-enumerable properties where possible.
  function  d3_class  (  ctor ,  properties  )  {
    try  {
      for  (  var  key  in  properties  )  {
        Object . defineProperty  (  ctor . prototype ,  key ,  {
          value:  properties [ key ] ,
          enumerable:  false // Make properties non-enumerable by default.
        }  ) ;
      }
    }
    catch  (  e  )  {
      //  Fallback for environments that don't support Object.defineProperty.
      ctor . prototype  =  properties ;
    }
  }


  //  Creates a D3 map from an object or another D3 map.
  d3 . map  =  function  (  object  )  {
    var  map  =  new d3_Map  (  ) ;

    if  (  object  instanceof  d3_Map  )  {
      //  If input is already a D3 map, copy its entries.
      object . forEach  (  function  (  key ,  value  )  {
        map . set  (  key ,  value  ) ;
      }  ) ;
    }
    else  {
      //  Otherwise, iterate over object properties and add to the map.
      for  (  var  key  in  object  )  {
        map . set  (  key ,  object [ key ]  ) ;
      }
    }

    return  map ; // Return the new D3 map.
  } ;


  //  Constructor for a D3 Map.
  //  Uses a special prefix to avoid conflicts with native object properties.
  function  d3_Map  (  )  {
    /* Empty constructor */
  }


  //  Define methods for the D3 Map prototype.
  d3_class  (  d3_Map ,  {
    //  Checks if a key exists in the map.
    has:  function  (  key  )  {
      return  d3_map_prefix  +  key  in  this ;
    } ,

    //  Retrieves the value associated with a key.
    get:  function  (  key  )  {
      return  this [ d3_map_prefix  +  key ] ;
    } ,

    //  Sets a value for a given key.
    set:  function  (  key ,  value  )  {
      return  this [ d3_map_prefix  +  key ]  =  value ;
    } ,

    //  Removes a key-value pair from the map.
    remove:  function  (  key  )  {
      key  =  d3_map_prefix  +  key ;
      return  key  in  this  &&  delete  this [ key ] ;
    } ,

    //  Returns an array of all keys in the map.
    keys:  function  (  )  {
      var  keys  =  [  ] ;
      this . forEach  (  function  (  key  )  {
        keys . push  (  key  ) ;
      }  ) ;
      return  keys ;
    } ,

    //  Returns an array of all values in the map.
    values:  function  (  )  {
      var  values  =  [  ] ;
      this . forEach  (  function  (  key ,  value  )  {
        values . push  (  value  ) ;
      }  ) ;
      return  values ;
    } ,

    //  Returns an array of all entries ({key, value}) in the map.
    entries:  function  (  )  {
      var  entries  =  [  ] ;
      this . forEach  (  function  (  key ,  value  )  {
        entries . push  (  {
          key:  key ,
          value:  value
        }  ) ;
      }  ) ;
      return  entries ;
    } ,

    //  Executes a callback function for each key-value pair in the map.
    forEach:  function  (  f  )  {
      for  (  var  key  in  this  )  {
        //  Check if the key starts with the internal prefix.
        if  (  key . charCodeAt  (  0  )  ===  d3_map_prefixCode  )  {
          f . call  (  this ,  key . substring  (  1  ) ,  this [ key ]  ) ;
        }
      }
    }
  }  ) ;


  //  Internal prefix for D3 Map keys to avoid conflicts.
  var  d3_map_prefix     =  "\0" ,
       d3_map_prefixCode =  d3_map_prefix . charCodeAt  (  0  ) ;


  //  D3 Nesting operator for grouping and aggregating data.
  d3 . nest  =  function  (  )  {
    var  nest  =  {  } ,
         keys  =  [  ] ,
         sortKeys  =  [  ] ,
         sortValues ,
         rollup ;

    //  Internal recursive function for mapping data.
    function  map  (  mapType ,  array ,  depth  )  {
      //  Base case: if depth reaches keys.length, apply rollup or sort values.
      if  (  depth  >=  keys . length  )  {
        return  rollup  ?  rollup . call  (  nest ,  array  )  :  sortValues  ?  array . sort  (  sortValues  )  :  array ;
      }

      var  i  =  - 1 ,
           n  =  array . length ,
           key  =  keys [ depth ++ ] ,
           keyValue ,
           object ,
           setter ,
           valuesByKey  =  new d3_Map  (  ) ,
           values ;

      //  Group elements by the current key.
      while  (  ++ i  <  n  )  {
        if  (  values  =  valuesByKey . get  (  keyValue  =  key  (  object  =  array [ i ]  )  )  )  {
          values . push  (  object  ) ;
        }
        else  {
          valuesByKey . set  (  keyValue ,  [  object  ]  ) ;
        }
      }

      //  Determine the output object type (Map or plain object).
      if  (  mapType  )  {
        object  =  mapType  (  ) ;
        setter  =  function  (  keyValue ,  values  )  {
          object . set  (  keyValue ,  map  (  mapType ,  values ,  depth  )  ) ;
        } ;
      }
      else  {
        object  =  {  } ;
        setter  =  function  (  keyValue ,  values  )  {
          object [ keyValue ]  =  map  (  mapType ,  values ,  depth  ) ;
        } ;
      }

      //  Recursively process grouped values.
      valuesByKey . forEach  (  setter  ) ;
      return  object ;
    }


    //  Internal recursive function for generating entries from a nested map.
    function  entries  (  map ,  depth  )  {
      //  Base case: if depth reaches keys.length, return the map itself.
      if  (  depth  >=  keys . length  )  {
        return  map ;
      }

      var  array  =  [  ] ,
           sortKey  =  sortKeys [ depth ++ ] ;

      map . forEach  (  function  (  key ,  keyMap  )  {
        array . push  (  {
          key:  key ,
          values:  entries  (  keyMap ,  depth  ) // Recursive call
        }  ) ;
      }  ) ;

      //  Apply key sorting if specified.
      return  sortKey  ?  array . sort  (  function  (  a ,  b  )  {
        return  sortKey  (  a . key ,  b . key  ) ;
      }  )  :  array ;
    }


    //  Public API for the nest operator.

    //  Nests the data into a map-like structure.
    nest . map  =  function  (  array ,  mapType  )  {
      return  map  (  mapType ,  array ,  0  ) ;
    } ;

    //  Nests the data and returns an array of entries.
    nest . entries  =  function  (  array  )  {
      return  entries  (  map  (  d3 . map ,  array ,  0  ) ,  0  ) ;
    } ;

    //  Specifies a key function for grouping.
    nest . key  =  function  (  d  )  {
      keys . push  (  d  ) ;
      return  nest ;
    } ;

    //  Specifies a sort function for the keys of the current level.
    nest . sortKeys  =  function  (  order  )  {
      sortKeys [ keys . length  -  1 ]  =  order ;
      return  nest ;
    } ;

    //  Specifies a sort function for the leaf values.
    nest . sortValues  =  function  (  order  )  {
      sortValues  =  order ;
      return  nest ;
    } ;

    //  Specifies a rollup function for aggregating leaf values.
    nest . rollup  =  function  (  f  )  {
      rollup  =  f ;
      return  nest ;
    } ;

    return  nest ; // Return the configured nest operator.
  } ;


  //  Creates a D3 set from an array of values.
  d3 . set  =  function  (  array  )  {
    var  set  =  new d3_Set  (  ) ;

    //  Add values from the input array to the set.
    if  (  array  )  {
      for  (  var  i  =  0 ,
                 n  =  array . length ;
             i  <  n ;
             ++ i  )  {
        set . add  (  array [ i ]  ) ;
      }
    }

    return  set ; // Return the new D3 set.
  } ;


  //  Constructor for a D3 Set.
  //  Internally uses the same prefix mechanism as d3_Map.
  function  d3_Set  (  )  {
    /* Empty constructor for D3 Set */
  }


  //  Define methods for the D3 Set prototype.
  d3_class  (  d3_Set ,  {
    //  Checks if a value is present in the set.
    has:  function  (  value  )  {
      return  d3_map_prefix  +  value  in  this ;
    } ,

    //  Adds a value to the set.
    add:  function  (  value  )  {
      this [ d3_map_prefix  +  value ]  =  true ;
      return  value ;
    } ,

    //  Removes a value from the set.
    remove:  function  (  value  )  {
      value  =  d3_map_prefix  +  value ;
      return  value  in  this  &&  delete  this [ value ] ;
    } ,

    //  Returns an array of all values in the set.
    values:  function  (  )  {
      var  values  =  [  ] ;
      this . forEach  (  function  (  value  )  {
        values . push  (  value  ) ;
      }  ) ;
      return  values ;
    } ,

    //  Executes a callback function for each value in the set.
    forEach:  function  (  f  )  {
      for  (  var  value  in  this  )  {
        if  (  value . charCodeAt  (  0  )  ===  d3_map_prefixCode  )  {
          f . call  (  this ,  value . substring  (  1  )  ) ;
        }
      }
    }
  }  ) ;


  //  Placeholder for D3 behavior modules.
  d3 . behavior  =  {  } ;


  //  Rebinds specified methods from a source object to a target object.
  //  This allows methods to be called on the target while maintaining their original context.
  d3 . rebind  =  function  (  target ,  source  )  {
    var  i  =  1 ,
         n  =  arguments . length ,
         method ;

    while  (  ++ i  <  n  )  {
      //  For each specified method name (arguments[i]), create a rebind wrapper.
      target [ method  =  arguments [ i ]  ]  =  d3_rebind  (  target ,  source ,  source [ method ]  ) ;
    }

    return  target ; // Return the modified target object.
  } ;


  //  Internal helper for d3.rebind. Creates a wrapped function.
  function  d3_rebind  (  target ,  source ,  method  )  {
    return  function  (  )  {
      var  value  =  method . apply  (  source ,  arguments  ) ;
      //  If the original method returned the source, return the target instead.
      return  value  ===  source  ?  target  :  value ;
    } ;
  }


  //  Resolves a vendor-prefixed CSS property or DOM method name.
  function  d3_vendorSymbol  (  object ,  name  )  {
    //  Check for the unprefixed name first.
    if  (  name  in  object  )  {
      return  name ;
    }

    //  Capitalize the first letter for vendor prefixes.
    name  =  name . charAt  (  0  ) . toUpperCase  (  )  +  name . substring  (  1  ) ;

    //  Iterate through known vendor prefixes.
    for  (  var  i  =  0 ,
               n  =  d3_vendorPrefixes . length ;
             i  <  n ;
             ++ i  )  {
      var  prefixName  =  d3_vendorPrefixes [ i ]  +  name ;
      if  (  prefixName  in  object  )  {
        return  prefixName ; // Return the vendor-prefixed name if found.
      }
    }
  }


  //  List of common vendor prefixes.
  var  d3_vendorPrefixes  =  [  "webkit" ,  "ms" ,  "moz" ,  "Moz" ,  "o" ,  "O"  ] ;


  //  A no-operation function. Does nothing.
  function  d3_noop  (  )  {
    /* No operation */
  }


  //  Creates a D3 dispatch object for managing custom events.
  //  Arguments are event type names (e.g., "start", "end").
  d3 . dispatch  =  function  (  )  {
    var  dispatch  =  new d3_dispatch  (  ) ,
         i  =  - 1 ,
         n  =  arguments . length ;

    //  Attach event type handlers to the dispatch object.
    while  (  ++ i  <  n  )  {
      dispatch [ arguments [ i ]  ]  =  d3_dispatch_event  (  dispatch  ) ;
    }

    return  dispatch ; // Return the configured dispatch object.
  } ;


  //  Constructor for the internal D3 dispatch object.
  function  d3_dispatch  (  )  {
    /* Empty constructor */
  }


  //  Adds or removes event listeners for dispatch events.
  d3_dispatch . prototype . on  =  function  (  type ,  listener  )  {
    var  i  =  type . indexOf  (  "."  ) ,
         name  =  "" ;

    //  Extract event name if present (e.g., "click.foo").
    if  (  i  >=  0  )  {
      name  =  type . substring  (  i  +  1  ) ;
      type  =  type . substring  (  0 ,  i  ) ;
    }

    //  If a specific event type is given.
    if  (  type  )  {
      return  arguments . length  <  2
             ?  this [ type ] . on  (  name  ) // Get listener by name
             :  this [ type ] . on  (  name ,  listener  ) ; // Set listener by name
    }

    //  If no specific event type, and listener is null, remove all listeners.
    if  (  arguments . length  ===  2  )  {
      if  (  listener  ==  null  )  {
        for  (  type  in  this  )  {
          if  (  this . hasOwnProperty  (  type  )  )  {
            this [ type ] . on  (  name ,  null  ) ;
          }
        }
      }
      return  this ; // Return dispatch for chaining.
    }
  } ;


  //  Internal function to create an event handler for a specific event type.
  function  d3_dispatch_event  (  dispatch  )  {
    var  listeners  =  [  ] ,
         listenerByName  =  new d3_Map  (  ) ;

    //  The actual event function that will be called.
    function  event  (  )  {
      var  z  =  listeners ,
           i  =  - 1 ,
           n  =  z . length ,
           l ;

      //  Invoke all registered listeners.
      while  (  ++ i  <  n  )  {
        if  (  l  =  z [ i ] . on  )  {
          l . apply  (  this ,  arguments  ) ;
        }
      }

      return  dispatch ; // Return the dispatch object for chaining.
    }


    //  Method to manage listeners for this specific event type.
    event . on  =  function  (  name ,  listener  )  {
      var  l  =  listenerByName . get  (  name  ) ,
           i ;

      if  (  arguments . length  <  2  )  {
        return  l  &&  l . on ; // Get listener if only name is provided.
      }

      if  (  l  )  {
        //  If listener exists, remove it.
        l . on  =  null ;
        listeners  =  listeners . slice  (  0 ,  i  =  listeners . indexOf  (  l  )  ) . concat  (  listeners . slice  (  i  +  1  )  ) ;
        listenerByName . remove  (  name  ) ;
      }

      if  (  listener  )  {
        //  If a new listener is provided, add it.
        listeners . push  (  listenerByName . set  (  name ,  {
          on:  listener
        }  )  ) ;
      }

      return  dispatch ; // Return dispatch for chaining.
    } ;

    return  event ; // Return the event handler function.
  }


  //  Global D3 event object, holds the current DOM event.
  d3 . event  =  null ;


  //  Helper function to prevent the default action of the current D3 event.
  function  d3_eventPreventDefault  (  )  {
    d3 . event . preventDefault  (  ) ;
  }


  //  Helper function to get the root source event from a D3 event chain.
  function  d3_eventSource  (  )  {
    var  e  =  d3 . event ,
         s ;

    while  (  s  =  e . sourceEvent  )  {
      e  =  s ;
    }
    return  e ; // Return the original source event.
  }


  //  Creates an event dispatcher that can be bound to a specific target.
  function  d3_eventDispatch  (  target  )  {
    var  dispatch  =  new d3_dispatch  (  ) ,
         i  =  0 ,
         n  =  arguments . length ;

    //  Initialize event types from arguments.
    while  (  ++ i  <  n  )  {
      dispatch [ arguments [ i ]  ]  =  d3_dispatch_event  (  dispatch  ) ;
    }

    //  Method to create a function that dispatches events with a specific context.
    dispatch . of  =  function  (  thiz ,  argumentz  )  {
      return  function  (  e1  )  {
        try  {
          var  e0  =  e1 . sourceEvent  =  d3 . event ; // Store previous d3.event
          e1 . target  =  target ;
          d3 . event  =  e1 ; // Set current d3.event
          dispatch [ e1 . type ] . apply  (  thiz ,  argumentz  ) ;
        }
        finally  {
          d3 . event  =  e0 ; // Restore previous d3.event
        }
      } ;
    } ;

    return  dispatch ; // Return the event dispatcher.
  }


  //  Escapes special characters in a string for use in a regular expression.
  d3 . requote  =  function  (  s  )  {
    return  s . replace  (  d3_requote_re ,  "\\$&"  ) ;
  } ;


  //  Regular expression for characters that need to be escaped in regex.
  var  d3_requote_re  =  / [\\\^\$\*\+\?\|\[\]\(\)\.\{\}] /g ;


  //  Utility function for prototypal inheritance (subclassing).
  //  Uses __proto__ if available, otherwise falls back to copying properties.
  var  d3_subclass  =  {  } . __proto__  ?  function  (  object ,  prototype  )  {
    object . __proto__  =  prototype ; // Modern way
  }  :  function  (  object ,  prototype  )  {
    for  (  var  property  in  prototype  )  {
      object [ property ]  =  prototype [ property ] ; // Fallback
    }
  } ;


  //  Helper function to create a D3 selection instance.
  function  d3_selection  (  groups  )  {
    d3_subclass  (  groups ,  d3_selectionPrototype  ) ;
    return  groups ;
  }


  //  DOM selection functions, potentially overridden by Sizzle.js.
  var  d3_select  =  function  (  s ,  n  )  {
        return  n . querySelector  (  s  ) ;
      } ,
      d3_selectAll  =  function  (  s ,  n  )  {
        return  n . querySelectorAll  (  s  ) ;
      } ,
      //  Vendor-prefixed matchesSelector for checking if an element matches a selector.
      d3_selectMatcher  =  d3_documentElement [ d3_vendorSymbol  (  d3_documentElement ,  "matchesSelector"  )  ] ,
      d3_selectMatches  =  function  (  n ,  s  )  {
        return  d3_selectMatcher . call  (  n ,  s  ) ;
      } ;


  //  If Sizzle.js is available, override default selection methods for better compatibility/performance.
  if  (  typeof Sizzle  ===  "function"  )  {
    d3_select  =  function  (  s ,  n  )  {
      return  Sizzle  (  s ,  n  ) [ 0 ]  ||  null ;
    } ;
    d3_selectAll  =  function  (  s ,  n  )  {
      return  Sizzle . uniqueSort  (  Sizzle  (  s ,  n  )  ) ;
    } ;
    d3_selectMatches  =  Sizzle . matchesSelector ;
  }


  //  Entry point for creating a new D3 selection.
  d3 . selection  =  function  (  )  {
    return  d3_selectionRoot ;
  } ;


  //  The prototype chain for D3 selections. It's an array to allow array methods.
  var  d3_selectionPrototype  =  d3 . selection . prototype  =  [  ] ;


  //  Method to select a single child element.
  d3_selectionPrototype . select  =  function  (  selector  )  {
    var  subgroups  =  [  ] ,
         subgroup ,
         subnode ,
         group ,
         node ;

    //  Ensure the selector is a proper function.
    selector  =  d3_selection_selector  (  selector  ) ;

    //  Iterate through each group in the current selection.
    for  (  var  j  =  - 1 ,
               m  =  this . length ;
           ++ j  <  m ;
         )  {
      subgroups . push  (  subgroup  =  [  ]  ) ; // Create a new subgroup for results.