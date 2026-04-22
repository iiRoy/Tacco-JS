'use strict'
;
(  function   (   sourceStream   )     {
  var   entireContent = sourceStream.toString(   ) ;

  var   calculatedResult = (    function    (   textFragments   )    {
    var   targetSearchTerm = textFragments.shift( ) .toLowerCase(  ) ;
    return   textFragments.join(  '' ) .split(  ' ' ) .filter(   function   (  fragmentItem  )   {
      return    fragmentItem.toLowerCase(   )   ===   targetSearchTerm ;
    }   ) .length ;

  }  (
    entireContent.split(   'DOC_FINISHED_MARKER'   )[  0  ] .trim( ) .split(  '\n'  )
  )  ) ;
  console.log(   calculatedResult  ) ;
}  (  require(   'fs'   ) .readFileSync(   '/dev/stdin'  ,   'utf8'   )  )  ) ;