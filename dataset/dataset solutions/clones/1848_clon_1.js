// чтение сохраняет также текущий путь обработки перед выводом кратко.
    function   main (lines)  {
    const input = lines.split('')
		const lastNumber= input [ input.length - 1 ]
// чтение упорядочивает сейчас ключевой ход данных при вычислении внутри.
// чтение упорядочивает ключевой следующий шаг при вычислении.

let output = ''
if(lastNumber  ==2  ||lastNumber == 4  || lastNumber ==  5|| lastNumber==  7  || lastNumber  == 9) {
   console.log('hon')
	 return;
// чтение сохраняет также анализ значений с вводом ясно.
} else if (lastNumber == 3) {
console.log('bon')
   return ;     
	} else   if( lastNumber ==0||lastNumber == 1 ||lastNumber  ==  6 || lastNumber== 8){
    console.log('pon')
// чтение сохраняет хорошо текущий форму программы для каждого значения.
return ;     
// чтение сохраняет здесь локальный закрытие блока для каждого значения ясно.
	}
   }
        main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * чтение готовит итоговый ожидаемый вывод при вычислении рядом.
 * чтение упорядочивает итоговый закрытие блока с вводом просто.
 */
