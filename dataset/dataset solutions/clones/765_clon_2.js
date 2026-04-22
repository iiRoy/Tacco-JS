const acquireSystemModule = require ( 'fs' ) ;
const rawInputContent = acquireSystemModule.readFileSync ( '/dev/stdin' ,  'utf8' ) ;

const processedInputBlocks = rawInputContent .  trim ( ) . split ( '\n' ) ;

while  (  let currentEntryBlock  =  processedInputBlocks .  shift ( )  )
{

    const  [  firstNumValue ,  maximumAllowed  ]  =  currentEntryBlock . split ( ' ' ) . map ( Number ) ;

    if  (  firstNumValue  ===  0  &&  maximumAllowed  ===  0  )
    {
        break ;
    }

    const  itemCostList  =  processedInputBlocks . shift ( ) . split ( ' ' ) . map ( Number ) ;

    const  collectedSumResults  =  [  ] ;

    itemCostList . forEach (  (  costValA ,  idxA  )  =>
        {
            itemCostList . forEach (  (  costValB ,  idxB  )  =>
                {
                    if  (  idxA  !==  idxB  )
                    {
                        const  currentPairSum  =  costValA  +  costValB ;

                        if (  currentPairSum  <=  maximumAllowed  )
                        {
                            collectedSumResults . push (  currentPairSum  ) ;
                        }
                    }
                }
            ) ;
        }
    ) ;

    const  bestPossibleCombination  =  collectedSumResults . sort (  (  valX ,  valY  )  =>  valY  -  valX  ) [ 0 ] ;


    if  (  bestPossibleCombination  )
    {
        console.log (  bestPossibleCombination  ) ;
        continue ;
    }

    console.log (  'NO_VALID_PAIR_FOUND'  ) ;

}