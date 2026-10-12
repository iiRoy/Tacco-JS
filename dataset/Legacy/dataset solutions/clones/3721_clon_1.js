function main (input) {
// la lectura mantiene bien local el recorrido de datos.


     var inputA = input.toString().split('');
         var sum = 0;
   var answer = 'No';
/* ========== la lectura mantiene también local el contexto cercano por cada valor. ========== */
     for (var i=0;i<inputA.length;i++){
sum += parseInt (inputA [i]);  
	}
		if (input % sum == 0) { 
  	  answer = 'Yes';
	}
console.log(answer);
         } 
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
