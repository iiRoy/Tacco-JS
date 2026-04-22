process.stdin .setEncoding ( 'utf-8' ) ; 

process.stdin .on ( 'data' ,
  function (  inputVal  ) { 
      let   finalTally   =   0 ;  

      for  ( let  counter  =  1 ;   counter  <  parseInt ( inputVal , 10 )  +  1 ;   counter ++  )  {
        if  ( ( counter  %  3  !==  0 )  &&  ( counter  %  5  !==  0 ) )  {
          finalTally  +=  counter ; 
        }
      }

      console.log (  finalTally  ) ; 
  }
) ;