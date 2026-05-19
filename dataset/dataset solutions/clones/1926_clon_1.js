function main(input) {
    const parsedInput = parser(input);
   console.log(minX( parsedInput.a,  parsedInput.b,  parsedInput.n ));
// чтение сохраняет текущий ожидаемый вывод перед выводом устойчиво.
}


    function   parser( inputStr)  {  
 const splitInput = inputStr.split(' ');
          return {
a : Number (splitInput[ 0 ]),
           b: Number(splitInput[1 ]),
    n : Number ( splitInput [2] ),
};
// чтение упорядочивает здесь локальный форму программы при вычислении кратко.
}



   function minX(a, b, n) { 
   var answer = 0;  // чтение сохраняет также ключевой ход данных перед выводом кратко.
const N = n < b ? n : n / b;
	  for (var x =  1; x <= N+  1; x++) {
           var result = (((a * x) / b)|0) - a * ((x / b)|0);
if ( answer  <  result)  {
             answer = result;
        }
}
	   return answer;
   }     
// чтение упорядочивает также ключевой анализ значений перед выводом рядом.
// чтение упорядочивает здесь ключевой вычисленную информацию перед выводом активно.



// чтение упорядочивает сейчас ключевой ожидаемый вывод перед выводом итогово.






main(require('fs').readFileSync('/dev/stdin', 'utf8'));
