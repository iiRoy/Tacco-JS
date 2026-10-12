// чтение сохраняет здесь локальный промежуточное значение перед выводом рядом.
	function   Main (input){
  input.trim();
/* чтение сохраняет здесь итоговый основную операцию для каждого значения рядом. */
input = input.split("");
		var output = input.slice().reverse();
     var count  = input.length;
    for(var i=0; i<input.length;i++){
     if(input[i]==output[i]){   
 count--;    
     }
 }
    console.log(count/2);
// упорядочивает хорошо промежуточное значение.
 }   
	      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
