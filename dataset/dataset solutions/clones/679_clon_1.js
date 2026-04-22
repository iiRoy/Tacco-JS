/*
 * This JavaScript file is a direct compilation product from OCaml source code.
 * It was generated using the js_of_ocaml compiler, version 1.3.
 * The code provides essential runtime support and utilities for OCaml applications
 * running in a JavaScript environment.
 * Please note that extensive modifications to whitespace and comments have been applied
 * to demonstrate Type I clone generation, without altering any functional aspects.
 */

function caml_raise_with_arg  (  tag  ,  arg  )
{
  // This function is the primary mechanism for raising exceptions within the OCaml runtime.
  // Exceptions are represented as JavaScript arrays, typically starting with '0'.
  throw  [0, tag, arg]  ;
}


function caml_raise_with_string  (  tag  ,  msg  )
{
  // A utility function to raise an exception where the argument is a string.
  // It wraps the raw string into an MlWrappedString object before passing it
  // to the general exception raising mechanism.
  caml_raise_with_arg  (  tag  ,  new MlWrappedString  (  msg  )  )  ;
}


function caml_invalid_argument  (  msg  )
{
  // Raises a specific "Invalid_argument" exception.
  // The tag for this exception type is retrieved from the global data array.
  caml_raise_with_string  (  caml_global_data[4]  ,  msg  )  ;
}


function caml_array_bound_error  (  )
{
  // A helper function to signal an array index out of bounds error.
  caml_invalid_argument  (  "index out of bounds"  )  ;
}


function caml_str_repeat  (  n  ,  s  )
{
  // Repeats a string 's' 'n' times.
  // This implementation uses a fast, binary exponentiation-like approach.

  if  (  !n  )
  {
    // If n is zero, the result is an empty string.
    return  ""  ;
  }

  if  (  n  &  1  )
  {
    // If n is odd, repeat n-1 times and append 's' once.
    return  caml_str_repeat  (  n  -  1  ,  s  )  +  s  ;
  }

  // If n is even, repeat n/2 times, then concatenate the result with itself.
  var r  =  caml_str_repeat  (  n  >>  1  ,  s  )  ;
  return  r  +  r  ;
} /* End of caml_str_repeat function */


function MlString  (  param  )
{
  // Constructor for the MlString type.
  // This type represents OCaml strings in JavaScript,
  // handling various internal representations (bytes, fullBytes, string, array).

  if  (  param  !=  null  )
  {
    // If a parameter is provided, initialize bytes and length from it.
    this.bytes  =  this.fullBytes  =  param  ;
    this.last  =  this.len  =  param.length  ;
  }
}


MlString.prototype  =
{
  // Prototype methods and properties for MlString instances.

  string  :  null  ,      // Cached JavaScript string representation.
  bytes  :  null  ,       // Raw byte representation.
  fullBytes  :  null  ,   // Full byte representation (padded with nulls if needed).
  array  :  null  ,       // Array of character codes.
  len  :  null  ,         // Logical length of the string.
  last  :  0  ,           // Actual length of the 'bytes' property.

  toJsString  :  function  (  )
  {
    // Converts the OCaml string to a standard JavaScript string.
    // Uses escape/decodeURIComponent for proper UTF-8 handling.
    return  this.string  =  decodeURIComponent  (  escape  (  this.getFullBytes  (  )  )  )  ;
  }  ,

  toBytes  :  function  (  )
  {
    // Converts the string to its byte representation.
    // If a JavaScript string is cached, it's converted to bytes.
    // Otherwise, if an array of char codes exists, it's converted.

    if  (  this.string  !=  null  )
    {
      var b  =  unescape  (  encodeURIComponent  (  this.string  )  )  ;
    }
    else
    {
      var b  =  ""  ,  a  =  this.array  ,  l  =  a.length  ;
      for  (  var i  =  0  ;  i  <  l  ;  i  ++  )
      {
        b  +=  String.fromCharCode  (  a[i]  )  ;
      }
    }

    this.bytes  =  this.fullBytes  =  b  ;
    this.last  =  this.len  =  b.length  ;
    return  b  ;
  }  ,

  getBytes  :  function  (  )
  {
    // Returns the byte representation, computing it if necessary.
    var b  =  this.bytes  ;
    if  (  b  ==  null  )
    {
      b  =  this.toBytes  (  )  ;
    }
    return  b  ;
  }  ,

  getFullBytes  :  function  (  )
  {
    // Returns the full byte representation, ensuring it's padded to 'len'.
    var b  =  this.fullBytes  ;

    if  (  b  !==  null  )
    {
      return  b  ;
    }

    b  =  this.bytes  ;

    if  (  b  ==  null  )
    {
      b  =  this.toBytes  (  )  ;
    }

    if  (  this.last  <  this.len  )
    {
      // Pad with null characters if the actual byte length is less than the logical length.
      this.bytes  =  (  b  +=  caml_str_repeat  (  this.len  -  this.last  ,  '\0'  )  )  ;
      this.last  =  this.len  ;
    }

    this.fullBytes  =  b  ;
    return  b  ;
  }  ,

  toArray  :  function  (  )
  {
    // Converts the string to an array of character codes.
    var b  =  this.bytes  ;
    if  (  b  ==  null  )
    {
      b  =  this.toBytes  (  )  ;
    }

    var a  =  [  ]  ,  l  =  this.last  ;
    for  (  var i  =  0  ;  i  <  l  ;  i++  )
    {
      a[i]  =  b.charCodeAt  (  i  )  ;
    }

    // Fill remaining length with zeros if logical length is greater than actual byte length.
    for  (  l  =  this.len  ;  i  <  l  ;  i++  )
    {
      a[i]  =  0  ;
    }

    // Invalidate other cached representations.
    this.string  =  this.bytes  =  this.fullBytes  =  null  ;
    this.last  =  this.len  ;
    this.array  =  a  ;
    return  a  ;
  }  ,

  getArray  :  function  (  )
  {
    // Returns the array of character codes, computing it if necessary.
    var a  =  this.array  ;
    if  (  !a  )
    {
      a  =  this.toArray  (  )  ;
    }
    return  a  ;
  }  ,

  getLen  :  function  (  )
  {
    // Returns the logical length of the string.
    var len  =  this.len  ;
    if  (  len  !==  null  )
    {
      return  len  ;
    }
    // If length is not cached, compute bytes first to determine length.
    this.toBytes  (  )  ;
    return  this.len  ;
  }  ,

  toString  :  function  (  )
  {
    // Standard JavaScript toString method. Delegates to toJsString.
    var s  =  this.string  ;
    return  s  ?  s  :  this.toJsString  (  )  ;
  }  ,

  valueOf  :  function  (  )
  {
    // Standard JavaScript valueOf method. Delegates to toJsString.
    var s  =  this.string  ;
    return  s  ?  s  :  this.toJsString  (  )  ;
  }  ,

  blitToArray  :  function  (  i1  ,  a2  ,  i2  ,  l  )
  {
    // Copies a segment of the MlString's content into a target array.
    // Handles overlapping copies and different internal representations.
    var a1  =  this.array  ;

    if  (  a1  )
    {
      // If array representation is available, copy directly from it.
      if  (  i2  <=  i1  )
      {
        for  (  var i  =  0  ;  i  <  l  ;  i++  )
        {
          a2[i2  +  i]  =  a1[i1  +  i]  ;
        }
      }
      else
      {
        for  (  var i  =  l  -  1  ;  i  >=  0  ;  i--  )
        {
          a2[i2  +  i]  =  a1[i1  +  i]  ;
        }
      }
    }
    else
    {
      // If only byte representation is available, copy char codes.
      var b  =  this.bytes  ;
      if  (  b  ==  null  )
      {
        b  =  this.toBytes  (  )  ;
      }

      var l1  =  this.last  -  i1  ;
      if  (  l  <=  l1  )
      {
        for  (  var i  =  0  ;  i  <  l  ;  i++  )
        {
          a2  [i2  +  i]  =  b.charCodeAt  (  i1  +  i  )  ;
        }
      }
      else
      {
        for  (  var i  =  0  ;  i  <  l1  ;  i++  )
        {
          a2  [i2  +  i]  =  b.charCodeAt  (  i1  +  i  )  ;
        }
        for  (  ;  i  <  l  ;  i++  )
        {
          a2  [i2  +  i]  =  0  ; // Pad with zeros for remaining length.
        }
      }
    }
  }  ,

  get  :  function  (  i  )
  {
    // Retrieves the character code at a specific index.
    var a  =  this.array  ;
    if  (  a  )
    {
      return  a[i]  ;
    }

    var b  =  this.bytes  ;
    if  (  b  ==  null  )
    {
      b  =  this.toBytes  (  )  ;
    }

    // Returns 0 for indices beyond the actual byte length, but within logical length.
    return  (  i  <  this.last  )  ?  b.charCodeAt  (  i  )  :  0  ;
  }  ,

  safeGet  :  function  (  i  )
  {
    // Retrieves a character code with bounds checking.
    if  (  !this.len  )
    {
      this.toBytes  (  )  ;
    }

    if  (  (  i  <  0  )  ||  (  i  >=  this.len  )  )
    {
      caml_array_bound_error  (  )  ;
    }
    return  this.get  (  i  )  ;
  }  ,

  set  :  function  (  i  ,  c  )
  {
    // Sets the character code at a specific index.
    // This operation typically invalidates other cached representations.
    var a  =  this.array  ;

    if  (  !a  )
    {
      if  (  this.last  ==  i  )
      {
        // Special case: appending to the end if not yet an array.
        this.bytes  +=  String.fromCharCode  (  c  &  0xff  )  ;
        this.last  ++  ;
        return  0  ;
      }
      a  =  this.toArray  (  )  ; // Convert to array if not already.
    }
    else if  (  this.bytes  !=  null  )
    {
      // If array exists but bytes are also cached, invalidate bytes/string.
      this.bytes  =  this.fullBytes  =  this.string  =  null  ;
    }

    a[i]  =  c  &  0xff  ; // Store the byte value.
    return  0  ;
  }  ,

  safeSet  :  function  (  i  ,  c  )
  {
    // Sets a character code with bounds checking.
    if  (  this.len  ==  null  )
    {
      this.toBytes  (  )  ;
    }

    if  (  (  i  <  0  )  ||  (  i  >=  this.len  )  )
    {
      caml_array_bound_error  (  )  ;
    }
    this.set  (  i  ,  c  )  ;
  }  ,

  fill  :  function  (  ofs  ,  len  ,  c  )
  {
    // Fills a segment of the string with a given character code.
    if  (  ofs  >=  this.last  &&  this.last  &&  c  ==  0  )
    {
      return  ; // Optimization: filling with 0 beyond current bytes doesn't change anything.
    }

    var a  =  this.array  ;
    if  (  !a  )
    {
      a  =  this.toArray  (  )  ;
    }
    else if  (  this.bytes  !=  null  )
    {
      // Invalidate other cached representations if array already exists.
      this.bytes  =  this.fullBytes  =  this.string  =  null  ;
    }

    var l  =  ofs  +  len  ;
    for  (  var i  =  ofs  ;  i  <  l  ;  i++  )
    {
      a[i]  =  c  ;
    }
  }  ,

  compare  :  function  (  s2  )
  {
    // Compares this MlString with another MlString.
    // Prioritizes comparison of cached JavaScript strings if available.
    if  (  this.string  !=  null  &&  s2.string  !=  null  )
    {
      if  (  this.string  <  s2.string  )
      {
        return  -1  ;
      }
      if  (  this.string  >  s2.string  )
      {
        return  1  ;
      }
      return  0  ;
    }

    // Fallback to comparing full byte representations.
    var b1  =  this.getFullBytes  (  )  ;
    var b2  =  s2.getFullBytes  (  )  ;

    if  (  b1  <  b2  )
    {
      return  -1  ;
    }
    if  (  b1  >  b2  )
    {
      return  1  ;
    }
    return  0  ;
  }  ,

  equal  :  function  (  s2  )
  {
    // Checks for equality between two MlString instances.
    if  (  this.string  !=  null  &&  s2.string  !=  null  )
    {
      return  this.string  ==  s2.string  ;
    }
    return  this.getFullBytes  (  )  ==  s2.getFullBytes  (  )  ;
  }  ,

  lessThan  :  function  (  s2  )
  {
    // Checks if this MlString is lexicographically less than another.
    if  (  this.string  !=  null  &&  s2.string  !=  null  )
    {
      return  this.string  <  s2.string  ;
    }
    return  this.getFullBytes  (  )  <  s2.getFullBytes  (  )  ;
  }  ,

  lessEqual  :  function  (  s2  )
  {
    // Checks if this MlString is lexicographically less than or equal to another.
    if  (  this.string  !=  null  &&  s2.string  !=  null  )
    {
      return  this.string  <=  s2.string  ;
    }
    return  this.getFullBytes  (  )  <=  s2.getFullBytes  (  )  ;
  }
} // End of MlString.prototype


function MlWrappedString  (  s  )
{
  // A specialized MlString for wrapping existing JavaScript strings.
  this.string  =  s  ;
}

MlWrappedString.prototype  =  new MlString  (  )  ; // Inherits from MlString


function MlMakeString  (  l  )
{
  // A specialized MlString for creating a new string of a given length, initially empty.
  this.bytes  =  ""  ;
  this.len  =  l  ;
}

MlMakeString.prototype  =  new MlString  (  )  ; // Inherits from MlString


function caml_array_get  (  array  ,  index  )
{
  // Retrieves an element from an OCaml array (which is a JS array with a special first element).
  // Performs bounds checking.
  if  (  (  index  <  0  )  ||  (  index  >=  array.length  -  1  )  )
  {
    caml_array_bound_error  (  )  ;
  }
  return  array[index  +  1]  ;
}


function caml_array_set  (  array  ,  index  ,  newval  )
{
  // Sets an element in an OCaml array.
  // Performs bounds checking.
  if  (  (  index  <  0  )  ||  (  index  >=  array.length  -  1  )  )
  {
    caml_array_bound_error  (  )  ;
  }
  array[index  +  1]  =  newval  ;
  return  0  ;
}


function caml_call_gen  (  f  ,  args  )
{
  // Generic function call mechanism for OCaml functions,
  // handling currying and partial application.

  if  (  f.fun  )
  {
    return  caml_call_gen  (  f.fun  ,  args  )  ;
  }

  var n  =  f.length  ; // Expected number of arguments.
  var d  =  n  -  args.length  ; // Difference between expected and provided arguments.

  if  (  d  ==  0  )
  {
    // If exact number of arguments, call the function directly.
    return  f.apply  (  null  ,  args  )  ;
  }
  else if  (  d  <  0  )
  {
    // If too many arguments, apply the first 'n' arguments, then
    // recursively call with the remaining arguments.
    return  caml_call_gen  (  f.apply  (  null  ,  args.slice  (  0  ,  n  )  )  ,  args.slice  (  n  )  )  ;
  }
  else
  {
    // If too few arguments, return a partially applied function.
    return  function  (  x  )
    {
      return  caml_call_gen  (  f  ,  args.concat  (  [x]  )  )  ;
    }  ;
  }
} /* End of caml_call_gen */


function caml_parse_format  (  fmt  )
{
  // Parses a format string for integer formatting (printf-like).
  fmt  =  fmt.toString  (  )  ;
  var len  =  fmt.length  ;

  if  (  len  >  31  )
  {
    caml_invalid_argument  (  "format_int: format too long"  )  ;
  }

  // Default format structure.
  var f  =
    {
      justify  :  '+'  ,
      signstyle  :  '-'  ,
      filler  :  ' '  ,
      alternate  :  false  ,
      base  :  0  ,
      signedconv  :  false  ,
      width  :  0  ,
      uppercase  :  false  ,
      sign  :  1  ,
      prec  :  -1  ,
      conv  :  'f'
    }  ;

  for  (  var i  =  0  ;  i  <  len  ;  i++  )
  {
    var c  =  fmt.charAt  (  i  )  ;
    switch  (  c  )
    {
      case  '-'  :
        f.justify  =  '-'  ;
        break  ;
      case  '+'  :
      case  ' '  :
        f.signstyle  =  c  ;
        break  ;
      case  '0'  :
        f.filler  =  '0'  ;
        break  ;
      case  '#'  :
        f.alternate  =  true  ;
        break  ;
      case  '1'  :
      case  '2'  :
      case  '3'  :
      case  '4'  :
      case  '5'  :
      case  '6'  :
      case  '7'  :
      case  '8'  :
      case  '9'  :
        f.width  =  0  ;
        while  (  c  =  fmt.charCodeAt  (  i  )  -  48  ,  c  >=  0  &&  c  <=  9  )
        {
          f.width  =  f.width  *  10  +  c  ;
          i++
        }
        i--  ;
        break  ;
      case  '.'  :
        f.prec  =  0  ;
        i++  ;
        while  (  c  =  fmt.charCodeAt  (  i  )  -  48  ,  c  >=  0  &&  c  <=  9  )
        {
          f.prec  =  f.prec  *  10  +  c  ;
          i++
        }
        i--  ;
        break  ;
      case  'd'  :
      case  'i'  :
        f.signedconv  =  true  ;
        /* fallthrough */
      case  'u'  :
        f.base  =  10  ;
        break  ;
      case  'x'  :
        f.base  =  16  ;
        break  ;
      case  'X'  :
        f.base  =  16  ;
        f.uppercase  =  true  ;
        break  ;
      case  'o'  :
        f.base  =  8  ;
        break  ;
      case  'e'  :
      case  'f'  :
      case  'g'  :
        f.signedconv  =  true  ;
        f.conv  =  c  ;
        break  ;
      case  'E'  :
      case  'F'  :
      case  'G'  :
        f.signedconv  =  true  ;
        f.uppercase  =  true  ;
        f.conv  =  c.toLowerCase  (  )  ;
        break  ;
    }
  }
  return  f  ;
} /* End of caml_parse_format */


function caml_finish_formatting  (  f  ,  rawbuffer  )
{
  // Applies padding, sign, and case transformations based on parsed format.
  if  (  f.uppercase  )
  {
    rawbuffer  =  rawbuffer.toUpperCase  (  )  ;
  }

  var len  =  rawbuffer.length  ;

  if  (  f.signedconv  &&  (  f.sign  <  0  ||  f.signstyle  !=  '-'  )  )
  {
    len++  ;
  }

  if  (  f.alternate  )
  {
    if  (  f.base  ==  8  )
    {
      len  +=  1  ;
    }
    if  (  f.base  ==  16  )
    {
      len  +=  2  ;
    }
  }

  var buffer  =  ""  ;

  if  (  f.justify  ==  '+'  &&  f.filler  ==  ' '  )
  {
    for  (  var i  =  len  ;  i  <  f.width  ;  i++  )
    {
      buffer  +=  ' '  ;
    }
  }

  if  (  f.signedconv  )
  {
    if  (  f.sign  <  0  )
    {
      buffer  +=  '-'  ;
    }
    else if  (  f.signstyle  !=  '-'  )
    {
      buffer  +=  f.signstyle  ;
    }
  }

  if  (  f.alternate  &&  f.base  ==  8  )
  {
    buffer  +=  '0'  ;
  }

  if  (  f.alternate  &&  f.base  ==  16  )
  {
    buffer  +=  "0x"  ;
  }

  if  (  f.justify  ==  '+'  &&  f.filler  ==  '0'  )
  {
    for  (  var i  =  len  ;  i  <  f.width  ;  i++  )
    {
      buffer  +=  '0'  ;
    }
  }

  buffer  +=  rawbuffer  ;

  if  (  f.justify  ==  '-'  )
  {
    for  (  var i  =  len  ;  i  <  f.width  ;  i++  )
    {
      buffer  +=  ' '  ;
    }
  }

  return  new MlWrappedString  (  buffer  )  ;
} /* End of caml_finish_formatting */


function caml_format_int  (  fmt  ,  i  )
{
  // Formats an integer according to a given format string.
  if  (  fmt.toString  (  )  ==  "%d"  )
  {
    return  new MlWrappedString  (  ""  +  i  )  ;
  }

  var f  =  caml_parse_format  (  fmt  )  ;

  if  (  i  <  0  )
  {
    if  (  f.signedconv  )
    {
      f.sign  =  -1  ;
      i  =  -i  ;
    }
    else
    {
      i  >>>=  0  ; // Convert to unsigned.
    }
  }

  var s  =  i.toString  (  f.base  )  ;

  if  (  f.prec  >=  0  )
  {
    f.filler  =  ' '  ; // Precision overrides filler.
    var n  =  f.prec  -  s.length  ;
    if  (  n  >  0  )
    {
      s  =  caml_str_repeat  (  n  ,  '0'  )  +  s  ;
    }
  }

  return  caml_finish_formatting  (  f  ,  s  )  ;
} /* End of caml_format_int */


function caml_int64_compare  (  x  ,  y  )
{
  // Compares two 64-bit integers represented as arrays.
  // Comparison proceeds from most significant parts to least significant.
  var x3  =  x[3]  <<  16  ;
  var y3  =  y[3]  <<  16  ;

  if  (  x3  >  y3  )
  {
    return  1  ;
  }
  if  (  x3  <  y3  )
  {
    return  -1  ;
  }
  if  (  x[2]  >  y[2]  )
  {
    return  1  ;
  }
  if  (  x[2]  <  y[2]  )
  {
    return  -1  ;
  }
  if  (  x[1]  >  y[1]  )
  {
    return  1  ;
  }
  if  (  x[1]  <  y[1]  )
  {
    return  -1  ;
  }
  return  0  ;
}


function caml_int_compare  (  a  ,  b  )
{
  // Compares two standard JavaScript integers.
  if  (  a  <  b  )
  {
    return  (  -1  )  ;
  }
  if  (  a  ==  b  )
  {
    return  0  ;
  }
  return  1  ;
}


function caml_compare_val  (  a  ,  b  ,  total  )
{
  // General comparison function for OCaml values.
  // Handles various types including strings, arrays (tuples/variants), and primitives.
  var stack  =  [  ]  ;

  for  (  ;  ;  )
  {
    if  (  !  (  total  &&  a  ===  b  )  )
    {
      if  (  a  instanceof MlString  )
      {
        if  (  b  instanceof MlString  )
        {
            if  (  a  !=  b  )
            {
		          var x  =  a.compare  (  b  )  ;
		          if  (  x  !=  0  )
                {
                  return  x  ;
                }
	          }
        }
        else
        {
          return  1  ; // String is greater than non-string.
        }
      }
      else if  (  a  instanceof Array  &&  a[0]  ===  (  a[0]  |  0  )  )
      {
        // Handle OCaml arrays/tuples/variants (tagged arrays).
        var ta  =  a[0]  ;

        if  (  ta  ===  250  )
        {
          // Tag 250 indicates an indirection, dereference and continue.
          a  =  a[1]  ;
          continue  ;
        }
        else if  (  b  instanceof Array  &&  b[0]  ===  (  b[0]  |  0  )  )
        {
          var tb  =  b[0]  ;
          if  (  tb  ===  250  )
          {
            b  =  b[1]  ;
            continue  ;
          }
          else if  (  ta  !=  tb  )
          {
            return  (  ta  <  tb  )  ?  -1  :  1  ; // Compare by tag.
          }
          else
          {
            switch  (  ta  )
            {
              case  248  :
              {
                // Tag 248 for custom blocks, compare by hash.
		            var x  =  caml_int_compare  (  a[2]  ,  b[2]  )  ;
		            if  (  x  !=  0  )
                {
                  return  x  ;
                }
		            break  ;
	              }
              case  255  :
              {
                // Tag 255 for 64-bit integers.
		            var x  =  caml_int64_compare  (  a  ,  b  )  ;
		            if  (  x  !=  0  )
                {
                  return  x  ;
                }
		            break  ;
	              }
              default  :
                // For other arrays, compare lengths first, then elements.
                if  (  a.length  !=  b.length  )
                {
                  return  (  a.length  <  b.length  )  ?  -1  :  1  ;
                }
                if  (  a.length  >  1  )
                {
                  stack.push  (  a  ,  b  ,  1  )  ; // Push for recursive element comparison.
                }
            }
          }
        }
        else
        {
          return  1  ; // Array is greater than non-array.
        }
      }
      else if  (  b  instanceof MlString  ||
                 (  b  instanceof Array  &&  b[0]  ===  (  b[0]  |  0  )  )  )
      {
        return  -1  ; // Non-string/non-array is less than string/array.
      }
      else
      {
        // Primitive comparison.
        if  (  a  <  b  )
        {
          return  -1  ;
        }
        if  (  a  >  b  )
        {
          return  1  ;
        }
        if  (  total  &&  a  !=  b  )
        {
          // Special handling for NaN or other non-comparable primitives.
          if  (  a  ==  a  )
          {
            return  1  ;
          }
          if  (  b  ==  b  )
          {
            return  -1  ;
          }
        }
      }
    }

    if  (  stack.length  ==  0  )
    {
      return  0  ; // All elements compared, they are equal.
    }

    // Pop context from stack to continue element-wise comparison.
    var i  =  stack.pop  (  )  ;
    b  =  stack.pop  (  )  ;
    a  =  stack.pop  (  )  ;

    if  (  i  +  1  <  a.length  )
    {
      stack.push  (  a  ,  b  ,  i  +  1  )  ; // Push next element for comparison.
    }
    a  =  a[i]  ;
    b  =  b[i]  ;
  }
} /* End of caml_compare_val */


function caml_compare  (  a  ,  b  )
{
  // Entry point for total comparison.
  return  caml_compare_val  (  a  ,  b  ,  true  )  ;
}


function caml_greaterequal  (  x  ,  y  )
{
  // Checks if x is greater than or equal to y.
  // The 'false' argument indicates partial comparison is sufficient.
  return  +  (  caml_compare  (  x  ,  y  ,  false  )  >=  0  )  ;
}


function caml_parse_sign_and_base  (  s  )
{
  // Parses the sign and base prefix (e.g., "0x", "0o", "0b") from a string.
  var i  =  0  ,
      base  =  10  ,
      sign  =  s.get  (  0  )  ==  45  ?  (  i++  ,  -1  )  :  1  ;

  if  (  s.get  (  i  )  ==  48  )
  {
    switch  (  s.get  (  i  +  1  )  )
    {
      case  120  :
      case  88  :
        base  =  16  ;
        i  +=  2  ;
        break  ;
      case  111  :
      case  79  :
        base  =  8  ;
        i  +=  2  ;
        break  ;
      case  98  :
      case  66  :
        base  =  2  ;
        i  +=  2  ;
        break  ;
    }
  }
  return  [i, sign, base]  ;
}


function caml_parse_digit  (  c  )
{
  // Converts a character code to its digit value based on typical bases.
  if  (  c  >=  48  &&  c  <=  57  )
  {
    return  c  -  48  ; // 0-9
  }
  if  (  c  >=  65  &&  c  <=  90  )
  {
    return  c  -  55  ; // A-Z (10-35)
  }
  if  (  c  >=  97  &&  c  <=  122  )
  {
    return  c  -  87  ; // a-z (10-35)
  }
  return  -1  ; // Not a valid digit.
}


var caml_global_data  =  [0]  ; // Global data array for OCaml runtime.


function caml_failwith  (  msg  )
{
  // Raises a "Failure" exception.
  caml_raise_with_string  (  caml_global_data[3]  ,  msg  )  ;
}


function caml_int_of_string  (  s  )
{
  // Converts an OCaml string to an integer.
  // Handles signs, bases (decimal, hex, octal, binary), and potential overflow.
  var r  =  caml_parse_sign_and_base  (  s  )  ;
  var i  =  r[0]  ,  sign  =  r[1]  ,  base  =  r[2]  ;

  var threshold  =  -1  >>>  0  ; // Max unsigned 32-bit integer.

  var c  =  s.get  (  i  )  ;
  var d  =  caml_parse_digit  (  c  )  ;

  if  (  d  <  0  ||  d  >=  base  )
  {
    caml_failwith  (  "int_of_string"  )  ;
  }

  var res  =  d  ;

  for  (  ;  ;  )
  {
    i++  ;
    c  =  s.get  (  i  )  ;
    if  (  c  ==  95  )
    {
      continue  ; // Underscore allowed as digit separator.
    }
    d  =  caml_parse_digit  (  c  )  ;
    if  (  d  <  0  ||  d  >=  base  )
    {
      break  ;
    }
    res  =  base  *  res  +  d  ;
    if  (  res  >  threshold  )
    {
      caml_failwith  (  "int_of_string"  )  ; // Overflow check.
    }
  }

  if  (  i  !=  s.getLen  (  )  )
  {
    caml_failwith  (  "int_of_string"  )  ; // Entire string must be consumed.
  }

  res  =  sign  *  res  ;

  if  (  (  res  |  0  )  !=  res  )
  {
    caml_failwith  (  "int_of_string"  )  ; // Check if result fits in 32-bit signed integer.
  }

  return  res  ;
} /* End of caml_int_of_string */


function caml_js_get_console  (  )
{
  // Retrieves the JavaScript console object, providing dummy functions if not available.
  var c  =  this.console  ?  this.console  :  {  }  ;
  var m  =  ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
           "trace", "group", "groupCollapsed", "groupEnd", "time", "timeEnd"]  ;

  function f  (  )  {  } // Dummy function for unavailable console methods.

  for  (  var i  =  0  ;  i  <  m.length  ;  i++  )
  {
    if  (  !c[m[i]]  )
    {
      c[m[i]]  =  f  ;
    }
  }
  return  c  ;
}


function caml_js_to_array  (  a  )
{
  // Converts a native JavaScript array to an OCaml array (which is a JS array prefixed with 0).
  return  [0].concat  (  a  )  ;
}


function caml_make_vect  (  len  ,  init  )
{
  // Creates an OCaml array (vector) of a given length, initialized with a value.
  var b  =  [0]  ;
  for  (  var i  =  1  ;  i  <=  len  ;  i++  )
  {
    b[i]  =  init  ;
  }
  return  b  ;
}


function caml_ml_out_channels_list  (  )
{
  // Placeholder for retrieving output channels list. Returns 0 (empty list).
  return  0  ;
}


function caml_mul  (  x  ,  y  )
{
  // Performs 32-bit signed integer multiplication.
  // This handles potential overflow for large numbers by splitting into parts.
  return  (  (  (  (  x  >>  16  )  *  y  )  <<  16  )  +  (  x  &  0xffff  )  *  y  )  |  0  ;
}


function caml_register_global  (  n  ,  v  )
{
  // Registers a value in the global data array.
  caml_global_data[n  +  1]  =  v  ;
}


var caml_named_values  =  {  }  ; // Object to store named OCaml values.


function caml_register_named_value  (  nm  ,  v  )
{
  // Registers an OCaml value with a given name, making it accessible by name.
  caml_named_values[nm]  =  v  ;
  return  0  ;
}


(  function  (  )
{
  // Self-executing anonymous function to encapsulate the main program logic.

  function F  (  bg  ,  bh  )
  {
    // Helper function for applying OCaml functions, handling currying.
    return  bg.length  ==  1  ?  bg  (  bh  )  :  caml_call_gen  (  bg  ,  [bh]  )  ;
  }

  var a  =  [0, new MlString("Failure")]  ,
      b  =  [0, new MlString("Invalid_argument")]  ;

  // Register standard exceptions in global data.
  caml_register_global  (  6  ,  [0, new MlString("Not_found")]  )  ;
  caml_register_global  (  5  ,  [0, new MlString("Division_by_zero")]  )  ;
  caml_register_global  (  3  ,  b  )  ;
  caml_register_global  (  2  ,  a  )  ;

  var l  =  new MlString  (  "%d"  )  ,
      k  =  new MlString  (  "Pervasives.do_at_exit"  )  ,
      j  =  [0,0,0]  , // Represents an empty list, often.
      i  =  new MlString  (  "split_n"  )  ,
      h  =  new MlString  (  "NO GAME"  )  ,
      g  =  new MlString  (  "get_input"  )  ,
      f  =  new MlString  (  "\\s"  )  ; // Regex for whitespace.

  function e  (  d  ,  c  )
  {
    // A comparison helper (max function).
    return  caml_greaterequal  (  d  ,  c  )  ?  d  :  c  ;
  }

  function n  (  m  ,  o  )
  {
    // List concatenation.
    if  (  m  )
    {
      var p  =  m[1]  ;
      return  [0, p, n  (  m[2]  ,  o  )  ]  ;
    }
    return  o  ;
  }

  function u  (  t  )
  {
    // Iterates through a list of output channels, attempting to flush them.
    var q  =  caml_ml_out_channels_list  (  0  )  ;
    for  (  ;  ;  )
    {
      if  (  q  )
      {
        var r  =  q[2]  ;
        try  {  }
        catch  (  s  )  {  } // Empty catch block, potentially for ignoring flush errors.
        var q  =  r  ;
        continue  ;
      }
      return  0  ;
    }
  }

  caml_register_named_value  (  k  ,  u  )  ; // Register the Pervasives.do_at_exit function.

  function J  (  v  )
  {
    // Converts a JavaScript array (v) into an OCaml list.
    var w  =  v.length  -  1  -  1  |  0  ,
        x  =  0  ; // OCaml empty list represented by 0.
    for  (  ;  ;  )
    {
      if  (  0  <=  w  )
      {
        var z  =  [0, v[w  +  1]  ,  x]  , // Prepend element to list.
            y  =  w  -  1  |  0  ,
            w  =  y  ,
            x  =  z  ;
        continue  ;
      }
      return  x  ;
    }
  }

  function B  (  A  )
  {
    // Reverses a list.
    if  (  A  )
    {
      var C  =  A[1]  ;
      return  n  (  C  ,  B  (  A[2]  )  )  ;
    }
    return  0  ;
  }

  function H  (  E  ,  D  )
  {
    // Maps a function E over a list D.
    if  (  D  )
    {
      var G  =  D[2]  ,
          I  =  F  (  E  ,  D[1]  )  ;
      return  [0, I, H  (  E  ,  G  )  ]  ;
    }
    return  0  ;
  }

  var K  =  [0,0]  , // Seems to be a placeholder for something related to marshalling.
      O  =  RegExp  , // Reference to RegExp constructor.
      N  =  Array  ; // Reference to Array constructor.

  function P  (  L  )
  {
    // Identity function.
    return  L  ;
  }

  function Q  (  M  )
  {
    // Converts an arbitrary JavaScript value to an OCaml option type.
    // If it's an Array, it's None (0). Otherwise, it's Some (wrapped string).
    return  M  instanceof N  ?  0  :  [0, new MlWrappedString  (  M.toString  (  )  )  ]  ;
  }

  K[1]  =  [0, Q, K[1]  ]  ; // Part of some registration or transformation pipeline.

  var W  =  caml_js_get_console  (  0  )  ; // Get the console object.

  function av  (  R  ,  S  )
  {
    // Applies S to R (curried function application).
    return  F  (  S  ,  R  )  ;
  }

  function U  (  T  )
  {
    // Converts T to its string representation.
    return  T.toString  (  )  ;
  }

  function aw  (  V  )
  {
    // Logs a value to the console.
    return  W.log  (  U  (  V  )  )  ;
  }

  function _  (  X  ,  Y  )
  {
    // Generates a list of integers from X to Y (inclusive).
    var Z  =  X  <  Y  ?  1  :  0  ,
        $  =  Z  ?  [0, X, _  (  X  +  1  |  0  ,  Y  )  ]  :  Z  ;
    return  $  ;
  }

  function ax  (  ab  ,  aa   ,  ac  )
  {
    // Swaps two elements in an OCaml array (ab) at indices aa and ac.
    var ad  =  caml_array_get  (  ab  ,  aa  )  ;
    caml_array_set  (  ab  ,  aa  ,  caml_array_get  (  ab  ,  ac  )  )  ;
    return  caml_array_set  (  ab  ,  ac  ,  ad  )  ;
  }

  function ag  (  af  ,  ae  )
  {
    // Splits a list 'ae' into two parts: first 'af' elements, and the rest.
    if  (  ae  )
    {
      if  (  0  <  af  )
      {
        var ah  =  ag  (  af  -  1  |  0  ,  ae[2]  )  ;
        return  [0, [0, ae[1]  ,  ah[1]  ]  ,  ah[2]  ]  ;
      }
      return  [0, 0, ae]  ;
    }
    if  (  0  ===  af  )
    {
      return  j  ; // Empty list for first part, original list for second.
    }
    throw  [0, b, i]  ; // Throws "Invalid_argument: split_n" if list is too short.
  }

  function ay  (  ai  )
  {
    // Converts an MlString to an integer.
    return  caml_int_of_string  (  ai  )  ;
  }

  function az  (  al  ,  aj  )
  {
    // Calculates a maximum product or sum of elements in a sliding window.
    // The exact logic seems to be a specific problem implementation.

    function au  (  ak  )
    {
      // Inner recursive function to calculate max product/sum.
      if  (  aj.length  -  1  <=  (  (  ak  +  al  |  0  )  -  1  |  0  )  )
      {
        return  -1  ; // Base case or out of bounds.
      }

      var am  =  1  ,
          an  =  0  ,
          ao  =  al  -  1  |  0  ;

      if  (  ao  <  an  )
      {
        var ap  =  am  ;
      }
      else
      {
        var aq  =  an  ,
            ar  =  am  ;
        for  (  ;  ;  )
        {
          var as  =  caml_mul  (  ar  ,  caml_array_get  (  aj  ,  ak  +  aq  |  0  )  )  ,
              at  =  aq  +  1  |  0  ;
          if  (  ao  !==  aq  )
          {
            var aq  =  at  ,
                ar  =  as  ;
            continue  ;
          }
          var ap  =  as  ;
          break  ;
        }
      }
      return  e  (  ap  ,  au  (  ak  +  1  |  0  )  )  ;
    }
    return  au  (  0  )  ;
  }

  // Read input from stdin, parse it, and process it.
  var aB  =  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  ,
      aD  =  F  (  H  ,  function  (  aA  )
      {
        return  new MlWrappedString  (  aA  )  ;
      }  )  ;

  function aE  (  aC  )
  {
    // Converts a JavaScript array to an OCaml array.
    return  caml_js_to_array  (  aC  )  ;
  }

  // This line orchestrates several transformations on the input string:
  // 1. Splits the input string by whitespace (f).
  // 2. Applies P (identity) to each part.
  // 3. Converts the resulting JS array to an OCaml array (aE).
  // 4. Converts the OCaml array back to an OCaml list (J).
  // 5. Maps the function (aA => new MlWrappedString(aA)) over the list (aD).
  var aF  =  av  (  av  (  av  (  av  (  aB.split  (  new O  (  U  (  f  )  )  )  ,  P  )  ,  aE  )  ,  J  )  ,  aD  )  ;

  a:for  (  ;  ;  )
  {
    // Main processing loop.
    if  (  aF  )
    {
      var aG  =  aF[2]  ;
      if  (  aG  )
      {
        var aH  =  ay  (  aF[1]  )  , // Read first integer (N).
            aI  =  ay  (  aG[1]  )  ; // Read second integer (K).

        if  (  0  ===  aH  &&  0  ===  aI  )
        {
          var aJ  =  0  ,
              aK  =  1  ; // Sentinel for termination.
        }
        else
        {
          var aK  =  0  ;
        }

        if  (  !aK  )
        {
          // Split the rest of the input into a list of N elements and the remaining list.
          var aL  =  ag  (  aH  ,  aG[2]  )  ,
              aM  =  aL[2]  ,
              aJ  =  [0, [0, aH, aI, H  (  ay  ,  aL[1]  )  ,  aM]  ]  ; // Processed input structure.
        }

        if  (  aJ  )
        {
          var aN  =  aJ[1]  ,
              aO  =  aN[2]  , // K
              aP  =  aN[1]  ; // N
              aQ  =  aN[3]  ; // List of numbers.

          if  (  aQ  )
          {
            var aR  =  0  ,
                aS  =  aQ  ,
                aY  =  aQ[2]  ,
                aV  =  aQ[1]  ;
            for  (  ;  ;  )
            {
              // Count elements in list aQ.
              if  (  aS  )
              {
                var aU  =  aS[2]  ,
                    aT  =  aR  +  1  |  0  ,
                    aR  =  aT  ,
                    aS  =  aU  ;
                continue  ;
              }
              var aW  =  caml_make_vect  (  aR  ,  aV  )  , // Create a vector (array) from list.
                  aX  =  1  ,
                  aZ  =  aY  ;
              for  (  ;  ;  )
              {
                // Fill vector from list elements.
                if  (  aZ  )
                {
                  var a0  =  aZ[2]  ;
                  aW[aX  +  1]  =  aZ[1]  ;
                  var a1  =  aX  +  1  |  0  ,
                      aX  =  a1  ,
                      aZ  =  a0  ;
                  continue  ;
                }
                var a2  =  aW  ;
                break  ;
              }
              break  ;
            }
          }
          else
          {
            var a2  =  [0]  ; // Empty array if list was empty.
          }

          var a3  =  az  (  aO  ,  a2  )  , // Calculate the initial max product/sum.
              a4  =  _  (  0  ,  aP  )  , // List of indices 0 to N-1.
              a7  =  _  (  0  ,  aP  )  , // Another list of indices 0 to N-1.
              ba  =  B  (  H  (  function  (  a4  )
              {
                return  function  (  a6  )
                {
                  return  H  (  function  (  a5  )
                  {
                    return  [0, a6, a5]  ;
                  }  ,  a4  )  ;
                }  ;
              }  (  a4  )  ,  a7  )  )  , // Generate all pairs of indices (i, j) for swapping.
              bb  =  -1  , // Maximum value found so far.
              bc  =  H  (  function  (  aO  ,  a2  )
              {
                return  function  (  a8  )
                {
                  var a9  =  a8[2]  ,
                      a_  =  a8[1]  ;
                  ax  (  a2  ,  a_  ,  a9  )  ; // Swap elements.
                  var a$  =  az  (  aO  ,  a2  )  ; // Recalculate max product/sum.
                  ax  (  a2  ,  a_  ,  a9  )  ; // Swap back to restore original state for next iteration.
                  return  a$  ;
                }  ;
              }  (  aO  ,  a2  )  ,  ba  )  ; // Map the swap-and-calculate function over all index pairs.

          for  (  ;  ;  )
          {
            // Find the maximum value from all calculated results.
            if  (  bc  )
            {
              var bd  =  bc[2]  ,
                  be  =  e  (  bb  ,  bc[1]  )  ,
                  bb  =  be  ,
                  bc  =  bd  ;
              continue  ;
            }
            if  (  bb  <  a3  )
            {
              aw  (  h  )  ; // If no improvement, output "NO GAME".
            }
            else
            {
              aw  (  caml_format_int  (  l  ,  bb  -  a3  |  0  )  )  ; // Output difference.
            }
            var bf  =  aN[4]  , // Get the next set of input parameters.
                aF  =  bf  ;
            continue  a  ; // Continue with the next test case.
          }
        }
      }
    }
    u  (  0  )  ; // Flush output channels if aF is null (end of input).
    return  ;
  }
  throw  [0, a, g]  ; // If input parsing fails or no valid input, throw "Failure: get_input".
}  (  )  )  ;