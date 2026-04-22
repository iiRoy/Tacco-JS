const   processInput   =   (   rawInputText   )   =>
{
    const   divisorVal   =   Number.parseInt(   rawInputText.split  (  "\n"  )  [  0  ]  .split  (  " "  )  [  0  ]  ,  10  ) ;
    const   dividendVal  =   Number.parseInt(   rawInputText.split  (  "\n"  )  [  0  ]  .split  (  " "  )  [  1  ]  ,  10  ) ;
    const   thresholdVal =   Number.parseInt(   rawInputText.split  (  "\n"  )  [  0  ]  .split  (  " "  )  [  2  ]  ,  10  ) ;

    console.log(   (   Math.trunc(   dividendVal   /   divisorVal   )   >=   thresholdVal   ?   thresholdVal   :   Math.trunc(   dividendVal   /   divisorVal   )   ) . toString()  ) ;
};

processInput(   require (   'node:fs'   )   .   readFileSync   (   '/dev/stdin'   ,   {   encoding:   'utf8'   }   )   ) ;