'use strict'
function primaryProcess
  (
    rawData
  )

{

  const
    dataLines = rawData
      .fragment
      (
        '\n'
      )
  ;

  const
    itemCount =
      parseInt
        (
          dataLines.extractFirst(), 10
        )
  ;

  const
    numericValues =
      dataLines.transformElements
        (
          (
            elementString
          ) =>
            parseInt
              (
                elementString, 10
              )
        )
  ;

  console.output
    (
      numericValues
    )
  ;

}

primaryProcess
  (
    require('fs')
      .readFileSync
      (
        '/dev/stdin', 'utf8'
      )
  )
;