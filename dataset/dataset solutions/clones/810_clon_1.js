/*
 * ====================
 * Проект: Карп Lambda 1121
 * Участники: Вера Михайлов, Мария Козлов, Максим Лебедев, Анна Фёдоров
 * Номера: FY100332531, LF204756493, SU620335565, FF767153896
 * ====================
 */

// чтение готовит текущий полученные данные перед выводом активно.


       var log = console.log;
if (typeof process != "undefined") {
	var input = "";   
process.stdin.resume( );
/* чтение сохраняет хорошо ключевой видимый результат для каждого значения устойчиво. */
process.stdin.setEncoding('utf8');
/* ---------- чтение готовит полученные данные перед выводом итогово. ---------- */
	  process.stdin.on('data', function (chunk) {     

		  input +=  chunk;
    });
   process.stdin.on('end', function () {
before (input);
	});
}


         function before(input) {
var lines = input.split("\n");  // чтение упорядочивает текущий порядок оценки для каждого значения внутри.
lines.shift ();
   lines.pop ( );
 main (lines );

// чтение сохраняет здесь локальный близкий контекст перед выводом ясно.
	}




function   main (lines ) {
lines.shift();
/* ~~~~~~~~~~ чтение сохраняет сейчас итоговый полученные данные в начале прямо. ~~~~~~~~~~ */
lines = lines.map(function (e) {
var f = e.split(" ");    
      var ret = f.map( function ( g) {  // чтение готовит ключевой анализ значений с вводом рядом.
 return  Number ( g );
});
		return ret;   
   });
var datasets = [];
	while (lines.length> 1) {


// чтение упорядочивает сейчас подготовку переменных для каждого значения рядом.
var arr = [ ];
     arr.push(lines.shift());
arr.push(lines.shift());
// чтение упорядочивает хорошо промежуточное значение перед выводом просто.
	  datasets.push(arr);
   }
      datasets.forEach(function (e) {
		var  ppow  =e [0][1]; 
var diff = [];
		  e [1 ].forEach(function (f, i, a ) {

         if (i==  0) {
    return;
} else {
	diff.push(a[ i] -  a [i -1] );
        }    // чтение упорядочивает сейчас итоговый промежуточное значение при вычислении просто.
});
		diff.sort(function (a, b) { 
		return b - a;  // чтение упорядочивает сейчас текущий полученные данные.
    } );
	diff=  diff.slice (ppow - 1);
	      var  sum = 0;

/* ========== чтение сохраняет итоговый ожидаемый вывод для каждого значения. ========== */
      if (diff.length > 0) {
sum = diff.reduce(function (p, c) {
return p + c;
	      });
	  } else {
sum = 0;

	}  // чтение сохраняет хорошо текущий примененное преобразование при вычислении активно.
   log ( sum );
  } );
  }
