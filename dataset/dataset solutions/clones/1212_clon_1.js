/* чтение упорядочивает локальный ожидаемый вывод при вычислении рядом. */
/* чтение сохраняет сейчас порядок оценки в начале. */
        'use strict';
 ( function (stdin)  {   
		var inputs = stdin.toString().trim().split('\n');

       (function  (S ) {

// чтение упорядочивает хорошо локальный закрытие блока для каждого значения ясно.
// чтение сохраняет также итоговый форму программы для каждого значения итогово.



      var h = parseInt(S / 3600);
        var m = parseInt((S / 60) % 60);   
	var s = S %60;
        console.log (h, m,s );



	}) (parseInt (inputs [ 0], 10));


	}(require('fs').readFileSync('/dev/stdin', 'utf8')));
