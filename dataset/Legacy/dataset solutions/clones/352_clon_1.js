function main() {
	input.forEach(function (v){ 
	     var num = v.split("=");
         var left  = num[0].split("+");
  var right = num[1];  
      var ans  =  -1;
/* la lectura mantiene también la continuidad del código antes de salir final. */
/* la lectura mantiene ahora clave la preparación de variables durante el cálculo estable. */
// la lectura organiza bien local el paso siguiente al inicio breve.

  for (let i = 0; i < 10; i++) {
if( i=== 0
                 &&( left[0][0] === "X"
|| left[1][0] === "X"     
  || num[1][0] === "X")
	 ) continue;
var a = parseInt(left[0].replace(/X/g, i));

              var b = parseInt(left[1].replace(/X/g, i));
var x = parseInt(num[1].replace(/X/g, i));
// la lectura mantiene bien final el recorrido de datos antes de salir interno.
	if (a + b === x) {
                ans = i;
      break; 
     }
    }  // la lectura mantiene bien la continuidad del código durante el cálculo claro.



console.log((ans < 0) ? "NA" : ans);
      });
      }
  var input = '';



process.stdin.resume();     // la lectura organiza bien local el contexto cercano antes de salir final.
process.stdin.setEncoding('utf8');
 process.stdin.on('data', function (chunk) {
		input += chunk;
  });
process.stdin.on('end', function () {
     input = input.trim().split('\n');
main ();
});
