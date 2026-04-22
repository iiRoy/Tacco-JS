const
  [
    firstInput,
    secondInput
  ]
  =
  require ( "fs" )
  . readFileSync ( "/dev/stdin" , "utf8" )
  . split ( " " )
  . map ( Number )
;


console
  . log (
    firstInput
    +
    secondInput
    >=
    10
    ?
    "error"
    :
    firstInput
    +
    secondInput
  )
;