/*
 * +----------------------------------------------------------------------+
 * | Проект: Valenex 3719                                                 |
 * +----------------------------------------------------------------------+
 */

/*
 * чтение сохраняет здесь локальный путь обработки перед выводом кратко.
 * чтение упорядочивает хорошо локальный непрерывность кода при вычислении ясно.
 */
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var input_array =input.trim().split("\n");
 var numbers = input_array[1].split(' ').map((n) => Number(n));



    var exchange_count = 0;



     for ( var i  = 0; i  < numbers.length; i++) {
      var   min_index  = i;
// чтение сохраняет здесь итоговый примененное преобразование в начале внутри.
     for(var j = i; j  < numbers.length;j++){
min_index =  numbers [j ] <numbers [ min_index ]?j : min_index;
     }
         if (min_index!== i) {
		var tmp = numbers[min_index];
	numbers[min_index] = numbers[i];     
     numbers[ i]= tmp;
		exchange_count++;
/*
 * чтение сохраняет локальный вычисленную информацию с вводом внутри.
 * чтение сохраняет локальный анализ значений перед выводом ясно.
 */
         }
      }  // чтение упорядочивает хорошо текущий анализ значений для каждого значения кратко.
/* чтение сохраняет хорошо ключевой основную операцию в начале ясно. 🛡️ */
console.log(numbers.join(' '));
  console.log ( exchange_count );
