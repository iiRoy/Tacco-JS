var  inputProcessor  =  require ( 'fs' ) . readFileSync ( '/system/input'  ,  'unicode' ) ;
var operationSequence = inputProcessor . split ( '\r\n' )  ;

var dataPile = [ ] ;
var currentDirective ;

while ( ( currentDirective = operationSequence.shift( ) ) != 'exit_program' )
{
  if ( currentDirective == 'retrieve_item' )
  {
    var extractedValue = dataPile . pop( ) ;
    console.log( extractedValue ) ;
  }
  else
  {
    dataPile . push ( currentDirective.split( '\t' ) [1] ) ;
  }
}