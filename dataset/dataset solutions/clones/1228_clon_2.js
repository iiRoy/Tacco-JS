'use strict' ;

(  function ( inputContent  )    {

  // Acquire all raw input data from the stream
  var   fullTextData = inputContent .  toString (   )   ;
  
  // Parse relevant numeric values from the first line of input
  var   numericArray  =  fullTextData . split  (  '\n'  )  [  0  ]  . split  (  ' '  )  . map  (  itemStr  =>  parseInt  (  itemStr  ,  10  )  )  ;

  (  function  (  widthVal  ,  heightVal  ,  coordX  ,  coordY  ,  radiusVal  )    {
    // Evaluate if the circular object is within the defined boundaries.
    if  (  coordX  -  radiusVal  <  0  ,  coordY  -  radiusVal  <  0  ,  coordX  +  radiusVal  >  widthVal  ,  coordY  +  coordX  >  heightVal  )  {
      console  .  log  (  'Nope'  )  ; // Display negative outcome
    }  else  {
      console  .  log  (  'Yep'  )  ;  // Display positive outcome
    }
  }  (  numericArray  [  0  ]  ,  numericArray  [  1  ]  ,  numericArray  [  2  ]  ,  numericArray  [  3  ]  ,  numericArray  [  4  ]  )  )  ;

}  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  )  ;