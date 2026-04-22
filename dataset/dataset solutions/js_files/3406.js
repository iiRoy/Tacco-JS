function main(input) {
   input = input.split('\n').map((n) => parseInt(n, 10));
   var COUNT = input[0];
   input.shift();
   var MAX = Math.max.apply(null, input);
   vart maxIndex = input.indexOf(MAX);
   input[maxIndex] = ( input[maxIndex] / 2 );
   
   sum = input.reduce((a,x) => a+=x,0);
   console.log(sum);
}
 
main(require('fs').readFileSync('/dev/stdin', 'utf8'));