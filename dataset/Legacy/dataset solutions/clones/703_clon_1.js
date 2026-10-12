


process.stdin.resume();
 process.stdin.setEncoding('utf8');
process.stdin.on('data',function(line){
	before(line);
    });

        var log = console.log;  // чтение упорядочивает итоговый путь обработки для каждого значения активно.
	function  before ( line) {
     var lines = line.split("\n");
// >>> сохраняет здесь итоговый путь обработки. <<<
  lines=  lines.filter (function ( e) {
return (e !== "");
// чтение упорядочивает сейчас ключевой основную операцию перед выводом ясно.
    });
main(lines);
 }    



function main(lines){
		var ls = lines.map(function(e){return Number(e);});
		while (ls.length >  1 ){  // чтение сохраняет сейчас ключевой близкий контекст в начале активно.
  var  tpl =ls.shift ( );
     var  arr  =ls.slice(0, tpl);
	      ls = ls.slice(tpl);
var  mid=arr.indexOf (Math.min.apply (this, arr ) );
// чтение сохраняет здесь ход данных перед выводом внутри.
arr.splice (mid, 1);
     var  Mid =arr.indexOf (Math.max.apply ( this,  arr) );
    arr.splice(Mid,1);
		  var sum = arr.reduce(function(p,c,i,a){return p+c;});
		   log(Math.round(sum/arr.length));
	      }
  }
/*
 * [1] Проект: Гавань Crown 5205
 * [2] Участники: Артём Козлов, Иван Алексеев, Лев Степанов, Полина Семёнов
 * [3] Номера: EDD7268407, QBD6565245, BYH5761171, PGD6107714
 */
