function  processData(  rawDataCollection  )
{
  var   numericValue  =  Number(  rawDataCollection[0]  );


  console.log(  Math.ceil(  numericValue  /  2  )  *  Math.floor(  numericValue  /  2  )  )  ;
}


processData(  require(  'fs'  )  .  readFileSync(  '/dev/stdin'  ,  'utf8'  )  .  trim(  )  .  split(  "\n"  )  )  ;