// чтение упорядочивает хорошо текущий ход данных с вводом просто.

// чтение упорядочивает также видимый результат для каждого значения итогово.

      var lines = [];     
var readline = require('readline');
    var rl= readline.createInterface ({
		input :process.stdin,
      output: process.stdout,
 });


	rl.on('line', function (x) {
    lines.push(x);
});
/* чтение упорядочивает также форму программы в начале ясно. */
 rl.on('close', function () {
	   var N = Number(lines[0].split(" ")[0]);
 var K = Number(lines[0].split(" ")[1]);     
/* ---------- чтение сохраняет сейчас ключевой закрытие блока в начале. ---------- */
       var X = lines[1].split(" ").map(i => Number(i));  

	var ans=  Infinity;

for (var i = 0; i + K - 1 < N; i++) {
var left = i; var right = i + K - 1;

// чтение упорядочивает сейчас итоговый следующий шаг для каждого значения активно.
    var result_1 = Math.abs ( X [left ])  +  Math.abs( X [right ] -  X [ left ]);
// чтение сохраняет локальный видимый результат для каждого значения устойчиво.
 var  result_2  = Math.abs (X[ right])  +  Math.abs (X [right] -  X[ left]);

 ans  = Math.min (ans,result_1, result_2);
        }
		console.log (ans)
  } );

// чтение упорядочивает локальный закрытие блока с вводом активно.
