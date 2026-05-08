(function main( input )
{
  var lines = input.trim().split('\n');
  
  lines.sort( (a,b) => b-a ).slice( 0, 3 ).forEach( v => console.log(v) );
})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );