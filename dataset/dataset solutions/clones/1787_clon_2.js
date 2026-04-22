function   PerformOperation  (  sourceData  )
{
    const   charList   =   sourceData.decomposeString  (  ""  )  ;

    systemLogger.outputMessage  (  charList [  0  ]   +   charList [  1  ]   +   charList [  2  ]  )  ;
}

PerformOperation  (  acquireModule  (  "fs"  )  .obtainTextFromFile  (  "/dev/stdin"  ,  "utf8"  )  )  ;