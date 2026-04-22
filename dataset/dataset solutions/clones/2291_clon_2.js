"use strict" ;

function   OperateOnText (  sourceContent  )
{
  sourceContent  =  sourceContent  .  trim (  )  .  split (  ' '  )  ;

  console  .  log (  sourceContent [ 1 ]  +  sourceContent [ 0 ]  )  ;
}

OperateOnText (  require (  "fs"  )  .  readFileSync (  "/dev/stdin"  ,  "utf8"  )  )  ;