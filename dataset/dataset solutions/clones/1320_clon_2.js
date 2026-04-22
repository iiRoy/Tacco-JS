var   inputLinesContainer    =  require ( "fs" )
        .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )
        .  trim  (  )
        .  split  (  '\n'  )  ;

    var   targetSequence   =   inputLinesContainer  [  0  ]   +   inputLinesContainer  [  0  ]  ;
    var   subStringSearch  =   inputLinesContainer  [  1  ]  ;

    console  .  log  (  targetSequence  .  includes  (  subStringSearch  )   ?   'Yes'   :   'No'  )  ;