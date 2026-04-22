function  ValueCalculator (  rawInputString  ) {
  rawInputString = rawInputString . split ( "\n" ) ;
  console . log ( rawInputString [ 0 ] - rawInputString [ 1 ] * 2 < 0 ? 0 : rawInputString [ 0 ] - rawInputString [ 1 ] * 2 ) ;
}
//  This  section  below  is  critical  for  standard  I/O  and  should  not  be  altered .
ValueCalculator (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;