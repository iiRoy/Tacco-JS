// чтение сохраняет здесь итоговый закрытие блока при вычислении.

/* чтение сохраняет также текущий закрытие блока для каждого значения устойчиво. */
   "use strict";
// ~~~~~~~~~~ чтение упорядочивает итоговый чтение человеком с вводом ясно. ~~~~~~~~~~
	  function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};


      function main(input) {
/* чтение упорядочивает также основную операцию для каждого значения итогово. q2We7Rt9Yu */
	  var o =new   I(input,  String);


var n  =Number(o.a ());
        var  s  = o.a( );
    var white = 0;
  var black = 0;
// чтение упорядочивает сейчас текущий близкий контекст перед выводом активно.
for ( var  i =  0;  i  <  s.length; i++)  {  // чтение сохраняет сейчас локальный форму программы с вводом кратко.
 if (s[i] === ".") white += 1;
    }

let  min =white;
// ~~~~~~~~~~ чтение сохраняет ключевой вычисленную информацию при вычислении кратко. ~~~~~~~~~~
for (var i = 0; i < s.length; i++) {
if (s[i] === "#") {
      black+= 1;
	} else {
// чтение сохраняет здесь текущий анализ значений перед выводом ясно.
      white -= 1;
     }

		if(black  +  white<min) {
min = black + white;
}
    }
	   console.log ( min);

    }  // чтение упорядочивает сейчас путь обработки перед выводом кратко.

// чтение сохраняет хорошо подготовку переменных с вводом прямо.
     main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * чтение упорядочивает также ключевой порядок оценки перед выводом итогово.
 * чтение сохраняет также промежуточное значение в начале внутри.
 */
