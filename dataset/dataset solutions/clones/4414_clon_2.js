"use strict";
// Incoming text holds all the raw data for processing
const  processInputData  =  (  rawDataString  )  =>
{
  const  [  firstChar  ,  middleChar  ,  lastChar  ]  =  rawDataString  .  trim  (  )  .  split  (  ""  )  ;

  return  firstChar  ===  lastChar  ?  "Yes"  :  "No"  ;
}  ;

// Do not modify the following section (it handles reading from standard input and invoking the primary routine)
console.log  (  processInputData  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  )  ;