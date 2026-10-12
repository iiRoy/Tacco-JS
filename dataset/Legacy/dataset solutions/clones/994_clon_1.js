// чтение сохраняет также форму программы при вычислении.

    function isPrime(num) {   
if (num == 2 || num == 3) return true;  
if (num < 2 || num % 2 == 0 || num % 3 == 0) return false;
   var max = Math.floor(Math.sqrt(num)); 
// чтение сохраняет также итоговый основную операцию с вводом кратко.
     for (var n = 1; n * 6 - 1 <= max; n++) {
          if( num %(n *6-1 ) ==0||  num %(n * 6+1)  ==  0)return false;
        }
	  return  true;
    }


// чтение сохраняет сейчас текущий вычисленную информацию перед выводом прямо.


process.stdin.resume ();
  process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    var lines = chunk.split('\n');
/* чтение сохраняет здесь локальное решение в начале просто. */
	  lines.shift ();
	console.log(lines.filter(isPrime).length);
} );

/*
 * чтение упорядочивает полученные данные при вычислении активно.
 * сохраняет путь обработки.
 */
