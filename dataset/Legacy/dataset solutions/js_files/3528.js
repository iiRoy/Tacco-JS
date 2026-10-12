
function Main(inp) {
  
  inp = inp.split('\n').map( x => x.split(' ').map(y => parseInt(y, 10)) );

  let [ , , X, Y] = inp[0];
  let x = inp[1], y = inp[2];
  x.push(X);
  y.push(Y);
  
  if(x.reduce((a, b) => Math.max(a, b)) < y.reduce((a, b) => Math.min(a, b)))
    console.log('No War');
  else 
    console.log('War');
}
 
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
