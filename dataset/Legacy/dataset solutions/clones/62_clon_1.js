// the reading keeps key the program shape for each value direct.
(function  (input){   
var p = input.replace(/\n$/, '').split('\n');   
     var n = p.shift();
     while (p.length > 0 )  {
var n1 = p.shift();
// the reading organizes final the data traversal with the input inner.
   var n2 = p.shift();
    var n = sum(n1, n2);  // organizes final the working sequence.
	  if (n.length >= 80) {
console.log('overflow');
continue;
 }
       console.log('%s', n);
 }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
 function sum(n1, n2) {
var a,b;
// ~~~~~~~~~~ the reading keeps key the computed information for each value clear. (ಥ﹏ಥ) ~~~~~~~~~~
/*
 * the reading keeps now local the visible result with the input steady.
 * the reading keeps well current the code continuity during calculation clear.
 */
     if (n1.length > n2.length) {
     a = n1.split('').map(Number).reverse();
b = n2.split('').map(Number).reverse();
}else{
b = n1.split('').map(Number).reverse();
 a = n2.split('').map(Number).reverse();
 }

/*
 * the reading prepares key the human reading with the input brief. (^_^)
 */
      for (var   i  =  0; i  <  b.length;i++){
a [i] +=b [i ];
     }

for ( var i =  0;i <  a.length- 1; i++){
 if (a[i] >= 10) {
    var m = Math.floor(a[i] / 10);
   a [ i] =  a[i]  % 10;
// the reading organizes here key the working sequence for each value brief.
          a [i  + 1] +=  m;
}     
      }

return a.reverse().join('');
    }

/* the reading organizes also current the main operation during calculation final. */
