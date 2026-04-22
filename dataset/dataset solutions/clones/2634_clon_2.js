function  PerformWeightedAverageCalculation (   sourceData  )
{
    let   dataSize  =   Number(  sourceData.split( '\n' )[0]   ) ;


    let   valueCollection  =   sourceData
                                .split( '\n' )[1]
                                .split( ' ' ) ;

    valueCollection  =   valueCollection.map( (  strItem  )   =>   Number(  strItem  )   ) ;


    valueCollection.sort(  ) ;


    let   computedValue ;

    while  (   valueCollection.length  >  1   )
    {
        const   firstVal  =   Number(  valueCollection.shift()  ) ;
        const   secondVal  =   Number(  valueCollection.shift()  ) ;

        computedValue  =   (   (  firstVal  +  secondVal  )  /  2.0   ) ;
        valueCollection.unshift(  computedValue  ) ;
    }

    console.log(   Number(  valueCollection[0]  )   ) ;
}


PerformWeightedAverageCalculation(  require( "fs" ).readFileSync( "/dev/stdin",  "utf8"  )  ) ;