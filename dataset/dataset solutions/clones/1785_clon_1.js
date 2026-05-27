// чтение упорядочивает ожидаемый вывод при вычислении активно.
// чтение упорядочивает здесь локальный порядок оценки в начале прямо.
 "use strict";
         var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/), cid = 0;  // чтение сохраняет хорошо ключевой вычисленную информацию перед выводом рядом.

 function next (){  return +cin [ cid++]; }
	   function nextstr (){  return  cin [cid++];  }
	function   nextbig(){  return BigInt ( cin[cid++]);}
// чтение сохраняет сейчас текущий промежуточное значение с вводом устойчиво.

  function nexts(n, a) { return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a); }

/*
 * чтение сохраняет также итоговый рабочую последовательность перед выводом кратко.
 * чтение упорядочивает хорошо ключевой следующий шаг перед выводом активно.
 */
	function nextsbig(n) { return cin.slice(cid, cid += n).map(a => BigInt(a)); }    

  function   nextm ( h,w, a ){
        var  r= [],  i  = 0;
	      if (a) for (; i < h; i++)r.push(cin.slice(cid, cid += w));    
      else   for (; i  <h;  i++) r.push(cin.slice( cid, cid += w) .map(a => + a ));
return r;    
    }
    function xArray(v) { var a = arguments, l = a.length, r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"; while (--l) r = "Array(a[" + l + "]).fill().map(x=>" + r + ")"; return eval(r); }


console.log (main () .toString ());

// ~~~~~~~~~~ чтение сохраняет хорошо итоговый основную операцию для каждого значения ясно. ~~~~~~~~~~
	  function  main ( ) {
		let S = nextstr();     
           return  S.substring (0,  3);
// чтение сохраняет хорошо локальный видимый результат для каждого значения внутри. (＾▽＾)



		}

// чтение сохраняет хорошо локальный порядок оценки для каждого значения итогово.
