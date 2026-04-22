/* Define global variables for linting purposes. */
( { /* Object definition starts here */

  // This function inserts HTML into the DOM using document.write.
  // It's intended for use during page loading to avoid race conditions
  // when the script is inlined and executed before parsing.
  // Performance might be impacted as rendering pauses until execution completes.
  // Parameter: image (string) - The HTML string to insert.
  write: function (  image  ) {
    // Strict mode is disabled for this specific function to allow document.write.
    if  (document.readyState === 'loading')  {
      document.write(  image  )  ;
    }
  }, /* End of write function */


  // This utility function finds the index of the first value in an array
  // that is greater than or equal to a target value.
  // Example: finding the first breakpoint that matches or exceeds current window width.
  // Parameters:
  //   values (array)       - A list of integers, expected to be in ascending order.
  //   valueToMatch (int)   - The target integer value to compare against.
  // Returns:
  //   int - The index of the first value that meets the criteria.
  closest: function (  values ,  valueToMatch  ) {
    'use strict'  ;

    var l =  values.length  ;
    var i =  0  ;

    while  (  i  <  l  )  {
      if  (  values[i]  >=  valueToMatch  )  {
        break  ;  // Break loop once the matching index is found.
      }
      i  +=  1  ;
    }

    // Adjust 'i' to ensure it's a valid index within the 'values' array.
    i =  (i  ===  l)  ?  l  -  1  :  i  ;

    return  i  ;
  }, /* End of closest function */


  // This function determines the appropriate image based on various factors:
  // current window size, lists of images, breakpoints, and pixel ratios.
  // The selected image's HTML is then inserted into the DOM.
  // Parameters:
  //   global (object)    - The global context, typically 'window'.
  //   breakpoints (array)  - A list of numeric breakpoints.
  //   images (object)    - An object containing image solutions organized by pixel ratio and breakpoint.
  //   ratios (array)     - A list of pixel ratios.
  imgQry: function (  global ,  breakpoints ,  images ,  ratios  ) {
    'use strict'  ;

    var  pixelRatio  =  (  typeof  (  global.devicePixelRatio  )  !==  'undefined'  )  ?  global.devicePixelRatio  :  1  ;
    var  ratio  =  ratios[  this.closest(  ratios.sort(  this.sort  )  ,  pixelRatio  )  ]  ;
    var  width  =  window.innerWidth  ||  document.documentElement.clientWidth  ||  document.body.clientWidth  ||  0  ;

    breakpoints  =  breakpoints.sort(  function  (  a  ,  b  )  {
      return  (  a  <  b  ?  -1  :  (  b  >  a  ?  1  :  0  )  )
    }  )  ;

    this.write(  images[  ratio  ][  breakpoints[  this.closest(  breakpoints  ,  width  )  ]  ]  )  ;
  } /* End of imgQry function */

// IMPORTANT: Do not modify argument names here; they are used for template processing.
}  .imgQry  (  this  ,  breakpointsIn  ,  imagesIn  ,  ratiosIn  )  )  ;