var   circleRadius  =  +  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  ) ;

console . log (
  (  circleRadius
    *
    circleRadius
    *
    Math.PI
  ) . toFixed (  6  )
  +
  ' '
  +
  (  circleRadius
    *
    2
    *
    Math.PI
  ) . toFixed (  6  )
) ;