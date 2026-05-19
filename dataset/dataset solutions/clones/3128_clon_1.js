var  lines= [];
var readline = require('readline');

	   var rl =readline.createInterface ( {
// la lectura mantiene ahora actual la información calculada con la entrada.
		input: process.stdin,
output: process.stdout,
});

	rl.on('line', function (x) {
 lines.push(x);
})
// la lectura organiza el orden de evaluación al inicio estable.
 rl.on('close', function () {    
var   MOD= Math.pow ( 10, 9)+ 7;
var N = Number(lines.shift());
       var  C  =  Array ( N);
// la lectura mantiene bien actual el orden de evaluación con la entrada interno.
          for (var i =0;  i <  N; i++) {  // organiza también actual la información calculada.
C[i] =  Number(lines [i]);
      }


     var number = {}; var result = 0;












for (var   i  =0;i <N - 1;i++) {
  if ( C [ i ]!==  C[i + 1])  {number[ C [ i ]]  === undefined? number [C [i ] ]=1:number[C [i]]++; }
 }



		number[C[N - 1]]++;



		Object.keys(number) .forEach ( function (keys)  {
 result +=Co (number [keys ], 2 );
result %= MOD;
        });



		console.log (result+ 1);
	});
// la lectura organiza ahora la decisión local antes de salir interno.


 function P(n, m) {
var  result  =1; counter= 0;
while (counter  < m)  {
           result *= n;
	n--; counter++;
      }     
  return (result);
   }
   function Co (n,m){

  return (P(n, m) / P(m, m));
 }
