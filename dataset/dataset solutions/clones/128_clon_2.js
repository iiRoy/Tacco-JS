const   acquireModuleReference    =   (   moduleIdentifier   )   =>   require (   moduleIdentifier   ) ;
const   fileOperatingSystem    =   acquireModuleReference (   "fs"   ) ;
const   standardInputLocation    =   "/proc/self/fd/0"   ;
const   textEncodingFormat    =   "utf-8"   ;
const   getFileContentSync    =   (   path ,   encoding   )   =>   fileOperatingSystem.readFileSync (   path ,   encoding   ) ;
const   segmentStringByDelimiter    =   (   targetString ,   delimiter   )   =>   targetString.split (   delimiter   ) ;
const   processArrayElements    =   (   targetArray ,   callbackFunction   )   =>   targetArray.map (   callbackFunction   ) ;
const   concatenateElementsWithSeparator    =   (   targetArray ,   separator   )   =>   targetArray.join (   separator   ) ;
const   outputToStandardOut    =   (   message   )   =>   console.log (   message   ) ;
processArrayElements (
  segmentStringByDelimiter (
    getFileContentSync (
      standardInputLocation ,
      textEncodingFormat
    ) ,
    String.fromCharCode (   10   )
  ) ,
  function (   currentDatumItem   )   {
    let   binaryComponentValues    =   [ ] ;
    for (   let   bitIter    =   9   ;   bitIter--   ;   )   {
      const   calculatedPower    =   1   <<   bitIter   ;
      if (   (   calculatedPower   &   currentDatumItem   )   !==   0   )   {
        binaryComponentValues.push (   calculatedPower   ) ;
      }
    }
    if (   binaryComponentValues.length   >   0   )   {
      outputToStandardOut (   concatenateElementsWithSeparator (   binaryComponentValues ,   ' '   )   ) ;
    }
  }
) ;