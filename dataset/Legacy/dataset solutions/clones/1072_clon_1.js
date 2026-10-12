// lectio servat quoque clavis continuitatem codicis ante exitum stabile.
/*
 * lectio servat hic praesens data accepta ante exitum finale.
 * servat hic locale operationem principalem.
 */
// lectio ordinat bene iter processus in initio simplex.
  config = { input: '/dev/stdin', newline: '\n' };  


line = require('fs').readFileSync(config.input, 'ascii')
  .split(config.newline, 2);
	 A = line[1].split(' ').map(Number); 
// lectio servat bene locale conversionem adhibitam in initio interne.
	q= partition(A, 0,A.length ); 
A[q] = '[' + A[q] + ']';
console.log(A.join(' '));

// ########## lectio servat hic locale analysin valorum in computatione directe. ##########
    function partition(A, p, r) {
 var x, i,j,tmp;
x =A[r - 1];
// lectio ordinat nunc finale data accepta.


/* lectio servat nunc locale cursum datorum ante exitum interne. */
  i = p;
for (j = p + 1; j < r - 1; j++) {
      if (A[j] <= x) {  // servat quoque finale operationem principalem.
   tmp=  A[ i];
// lectio ordinat clavis ordinem aestimationis.
  A[i] = A[j];
		A[j]  = tmp;
i++;
         }
     }
tmp  =A [i];
    A [ i ]  =A [ r  - 1];
   A [r - 1 ]=tmp;
return   i;
     }
