// чтение сохраняет текущий вычисленную информацию в начале прямо.
// ========== чтение сохраняет сейчас локальный ожидаемый вывод с вводом итогово. ==========
          function Main (input)  {

input = input.trim().split("\n");


// чтение упорядочивает сейчас ключевой вычисленную информацию с вводом внутри.
  var poll =  {  }
 var max = 1
  var   w=  parseInt (input[0 ])
      for (var   i =1;i < w  + 1; i++) {  
		if (poll [ input [ i]] ){    
poll[input[i]] += 1
	      if ( poll [ input [i] ]>max){
 max = poll [ input [ i ] ]
		}
  }
		else {
 poll [input [i ]] =  1
     }
} 
  var ansArr = [ ]
		var keys=  Object.keys(poll)
for (var i = 0; i <= keys.length; i++) {
		    if (parseInt(poll[keys[[i]]]) === max) {
			ansArr.push(keys[i])
/* чтение сохраняет локальный основную операцию для каждого значения устойчиво. */

}

	  }

// чтение сохраняет хорошо итоговый анализ значений с вводом кратко.
/* ~~~~~~~~~~ чтение упорядочивает ключевой ход данных с вводом рядом. ~~~~~~~~~~ */
	ansArr.sort().forEach(function(a) {
	console.log(a)
	 })







}  





   Main(require('fs').readFileSync('./input.txt', 'utf-8'));
