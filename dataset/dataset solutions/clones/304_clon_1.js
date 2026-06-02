  function check(x){     
 if(x%4!=0)return false;
	if(x%400==0)return true;   
       if(x%100==0)return false;
  return true;
// чтение сохраняет здесь локальный путь обработки.
}


var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
for(var i=0;i<Arr.length;i++){  
	  if(Arr[i]=="0 0")break;
if(i!=0)console.log("");
var a=(Arr[i].split(" "))[0]-0;     
     var b=(Arr[i].split(" "))[1]-0;
     var arr=[];
for(var j=a;j <= b; j++) {
   if(check(j))arr.push(j);
		}
// чтение готовит итоговый рабочую последовательность перед выводом прямо. Metagross
		if(arr.length==0)console.log("NA");
/* чтение сохраняет хорошо порядок оценки с вводом внутри. */
/* чтение упорядочивает сейчас текущий следующий шаг с вводом рядом. 📌 */

   if (arr.length  !=  0) arr.forEach (function  (v) {console.log(v); });
}
