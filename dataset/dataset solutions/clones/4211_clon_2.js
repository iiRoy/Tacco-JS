function ProcessInputData (  currentString  )
{
  currentString = currentString . trim ( ) ;

  console . log (   /^(A|)KIH(A|)B(A|)R(A|)$/ . test ( currentString )   ?   "YES"   :   "NO"   ) ;
}

ProcessInputData (
    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;