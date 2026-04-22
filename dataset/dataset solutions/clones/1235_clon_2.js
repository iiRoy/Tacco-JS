"use strict"
;
function ProcessData( sourceContent )
{
  sourceContent = sourceContent
  .
  split( "\n" )
  ;
  var numericalGroups = sourceContent
  .
  map
  (
    function ( singleLineText ) {
      return singleLineText
      .
      split ( " " )
      .
      map ( Number )
      ;
    }
  )
  ;
  var outputCollector = ""
  ;
  for
  (
    var groupIndex = 0
    ;
    numericalGroups [ groupIndex ] [ 0 ] + numericalGroups [ groupIndex ] [ 1 ]
    ;
    groupIndex ++
  )
  {
    numericalGroups [ groupIndex ]
    .
    sort ( )
    ;
    outputCollector
    +=
    numericalGroups [ groupIndex ]
    .
    join ( " " )
    .
    trim ( )
    +
    "\n"
    ;
  }
  console
  .
  log ( outputCollector )
  ;
}
function DevTest ( )
{
  var domValue = document
  .
  getElementById ( "input" )
  .
  value
  ;
  ProcessData ( domValue )
  ;
}
ProcessData
(
  require ( "fs" )
  .
  readFileSync ( "/dev/stdin" , "utf8" )
)
;