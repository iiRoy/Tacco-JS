function executeProgram ( sourceText )
{
  let   cleanText   = sourceText . trim ( ) ;

  const
    [ referencePoint ,
      optionAlpha ,
      optionBeta
    ] =
      cleanText
        .split
          (
            " "
          )
        .map
          (
            Number
          )
  ;

  if
  (
    Math.abs
      (
        referencePoint
          -
        optionAlpha
      )
    <
    Math.abs
      (
        referencePoint
          -
        optionBeta
      )
  )
  {
    console.log
      (
        "A"
      )
    ;
  }
  else
  {
    console.log
      (
        "B"
      )
    ;
  }
}

executeProgram
  (
    require
      (
        "fs"
      )
      .readFileSync
        (
          "/dev/stdin" ,
          "utf8"
        )
  )
;