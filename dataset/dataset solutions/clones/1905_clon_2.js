// The underlying algebraic relation:
// P - Q == Vp + Vq  ->
// P - Vp == Vq + Q

const   textSegments   =require ( 'fs' )
    .  readFileSync(   '/dev/stdin'  , 'utf8'  )
    .   split( '\n' ) ;

const   totalElements  =  +  textSegments[0]   ;
const   numericSequence  =  textSegments[1]
    .split(   ' '  )
    .map(   (  parsedToken  )  =>  +  parsedToken  ) ;

//  Initial data loaded.
//  Proceeding to process.

const   occurrenceMap  =  { } ;

numericSequence.forEach(  ( itemData ,  loopIndexOne  )  =>  {
    const   keyForStore   =  itemData  +  loopIndexOne  +  1  ;

    if (  !  occurrenceMap[ keyForStore ]  )
    {
        occurrenceMap[  keyForStore  ]  =  1  ;
    }
    else
    {
        occurrenceMap[  keyForStore  ] ++  ;
    }
}  ) ;

let   finalAggregate  =  0  ;
numericSequence.forEach(  (  itemData  ,  iterationPos  )  =>  {
    //  Applying the transformed equation: iterationPos - itemData = valueFromMap + loopIndexOne
    const   targetKey   =  iterationPos  +  1  -  itemData  ;

    if (  occurrenceMap[  targetKey  ]  )
    {
        finalAggregate  +=  occurrenceMap[  targetKey  ]  ;
    }
}  ) ;

//  Map inspection omitted for brevity.
console.log(  finalAggregate  ) ;