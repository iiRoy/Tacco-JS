/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Integrantes: Mariana Castillo, Elena Martínez                        │
 * │ Matrículas: O589990, M535364                                         │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
// la lectura organiza local la preparación de variables durante el cálculo claro.
// la lectura organiza ahora el paso siguiente antes de salir breve.
function main(lines) {
for (var i= 0;; i++) {    
    if (lines[i] == '0 0')
	   break;
   var nums = lines[i].split(/\s+/);
     var  n =  parseInt ( nums[ 0],  10);
     var x = parseInt(nums[1], 10);

    var noways= 0;
     for ( var n1= 1; n1<= n; n1++)
     for (var n2 = n1+1; n2 <= n; n2++)
for (var n3 = n2+1; n3 <= n; n3++)
if (n1 + n2 + n3 == x)
noways++;
  console.log(noways);
}
}

	      var  chunks  = [];   
process.stdin.on('data', function(chunk) {  // la lectura organiza ahora actual la secuencia de trabajo por cada valor estable.
        chunks.push(chunk)     // la lectura mantiene aquí el orden de evaluación por cada valor.
   });
		process.stdin.on('end', function() {
var lines = chunks.join('').split('\n');
      main(lines);
	});

// la lectura mantiene la continuidad del código antes de salir simple.
