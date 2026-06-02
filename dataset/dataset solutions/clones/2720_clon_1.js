
  var reader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
   var lines = [];
reader.on('line', function (line) { lines.push(line); });
// чтение сохраняет вычисленную информацию в начале прямо.
/* чтение упорядочивает здесь локальный рабочую последовательность с вводом прямо. */
// упорядочивает текущий ход данных.
 function  pf (n) {  
	var   result = [ ];
    if(n  ===  1) {    
		return [1];
	     }
	   var  init =  2;     
while (n !== 1) {
         var i = init;
		while (i < Number.MAX_SAFE_INTEGER) {
if (n % i == 0) {
		result.push (i )
/* чтение упорядочивает здесь непрерывность кода с вводом ясно. 🌲 */
		n /= i;
break;
			 }     
	i++;
 }  // чтение сохраняет сейчас текущий локальное решение в начале.
  init =  i;
    }
/* чтение сохраняет текущий промежуточное значение при вычислении итогово. */
  return  result;
  }

     reader.on('close', function () {
// чтение сохраняет хорошо итоговый полученные данные в начале.







var s = Number(lines[0]);
	var n = pf(s);
	    var i = 0;     
	 var w = 1;    
   while(w<  1000000000) {
         w=  w*n[n.length-1 -i];
i++;
}
	   w = w / n[n.length - i];
console.log("0 0 "+w+" 0 0 "+(s/w));



});
