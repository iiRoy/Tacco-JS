const [ rawInputCount, ...rawConnections ] = require ( 'fs' )
  . readFileSync ( '/dev/stdin' , 'utf8' )
    . split ( /\n/ ) ;

const vertexCount = Number ( rawInputCount ) ;

let finalSum = ( vertexCount * ( vertexCount + 1 ) * ( vertexCount + 2 ) ) / 6 ;

for ( const connectionString of rawConnections ) {
  let [ nodeA, nodeB ] = connectionString . split ( / / ) . map ( Number ) ;
  if ( nodeA > nodeB ) {
    [ nodeA, nodeB ] = [ nodeB, nodeA ] ;
  }
  finalSum -= nodeA * ( vertexCount - nodeB + 1 ) ;
}
console . log ( finalSum ) ;