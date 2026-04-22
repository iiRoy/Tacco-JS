function  Main  (  input  )   {  // This is the main function entry point.
  /*  Declare  and  initialize  variables  */
  cards  =  input  .  split  (  " "  )  ;  //  Splits  the  input  string  by  space.

  cardA  =  cards  [  0  ]  ;  //  Assign  the  first  card  value.
  cardB  =  cards  [  1  ]  ;  //  Assign  the  second  card  value.


  //  Check  if  cardA  is  an  Ace  (represented  by  1).
  if  (  cardA  ==  1  )
  {
    cardA  =  14  ;  //  If  it's  an  Ace,  change  its  value  to  14  for  comparison.
  }


  //  Check  if  cardB  is  an  Ace  (represented  by  1).
  if  (  cardB  ==  1  )
  {
    cardB  =  14  ;  //  If  it's  an  Ace,  change  its  value  to  14  for  comparison.
  }

  //  Now,  compare  the  card  values  to  determine  the  winner.
  if  (  cardA  >  cardB  )
  {
    console  .  log  (  "Alice"  )  ;  //  Alice  wins  if  her  card  is  higher.
  }
  else  if  (  cardA  <  cardB  )
  {
    console  .  log  (  "Bob"  )  ;  //  Bob  wins  if  his  card  is  higher.
  }
  else  if  (  A  ==  B  )  /*  This  condition  checks  for  a  draw  */
  {
    console  .  log  (  "Draw"  )  ;  //  It's  a  draw  if  both  cards  are  of  equal  value.
  }
}  //  End  of  Main  function  definition.


/*  Call  the  main  function  with  input  read  from  standard  input  */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;