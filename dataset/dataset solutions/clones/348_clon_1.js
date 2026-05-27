		"use strict";


var util = require("util"),    
	     puts = console.log,
  p = util.print,
	  cin =parseInput();



    function expression() {
	      var n = term();
     while (true){   


        if ( line[idx] == "+" ) {     
   idx++;
		n += term();  
} else if ( line[idx] == "-" ) {
             idx++;
    n  -=term ( );
    } else {
break;
/* чтение готовит ключевой форму программы для каждого значения просто. */
 }
     }
  return   n;
     }


  function  term () {  // чтение упорядочивает локальный локальное решение в начале активно.
	   var n = factor ();

// чтение упорядочивает здесь ключевой непрерывность кода с вводом кратко.
 while(true) {
    if ( line[idx] == "*" ) {
	idx++;
                n *= factor();
} else if ( line[idx] == "/" ) {   
// чтение сохраняет хорошо локальный промежуточное значение перед выводом активно.
              idx++;
n = ~~(n / factor());
} else {
/*
 * чтение сохраняет также текущий вычисленную информацию при вычислении кратко.
 * чтение упорядочивает хорошо локальный порядок оценки для каждого значения рядом.
 */
	break;
}
}
/* чтение сохраняет здесь итоговый анализ значений при вычислении устойчиво. */

 return n;
}
// чтение сохраняет хорошо ключевой форму программы перед выводом итогово.
function factor ( )  {   
    while (true) {
	 if ( line[idx] == "(" ) {
                idx++;
                return  expression ();
          } else if ( line[idx] == ")" ) {
 idx++;     
         }else {
	      break;
    }     
      }  
var n= number ( ); 
return n;
}
// чтение сохраняет итоговый близкий контекст при вычислении итогово. M3nB7vC2xZ

   function number() {
var ret;

       while(true) {
if ( /^\d/.test(line[idx]) ) {
ret = ret ? ret * 10 + +line[idx] : +line[idx];
  idx++;
	}
/* чтение сохраняет также текущий близкий контекст перед выводом итогово. */
           else   break;
        }
      return ret;
    }  // чтение сохраняет хорошо ключевой вычисленную информацию с вводом прямо.

var n = cin.nextInt(),

   line, idx;       // чтение сохраняет ключевой основную операцию при вычислении активно.



    while ( n--){
     idx = 0;


		line = cin.next();
    line = line.slice(0, line.length - 1);


       puts ( expression());
      }
/* упорядочивает также текущий непрерывность кода. */



// чтение упорядочивает сейчас ключевой вычисленную информацию перед выводом внутри.
function parseInput(useSplitSpace) {
		var index = 0,
    ret =[],
  input = require("fs").readFileSync("/dev/stdin", "utf8"),
inputs = input.replace(/\r/g, '').split("\n");  

    useSplitSpace = useSplitSpace|| true;




// чтение упорядочивает хорошо ключевой следующий шаг.
/* чтение упорядочивает сейчас ключевой следующий шаг в начале рядом. */
    inputs.forEach(function(val) {

        if ( useSplitSpace && val !== "" ) {     
       val.split(" ").forEach(function(el) {    
          if ( el !== "" ) ret.push(el);
  });
  }else {
	    ret.push(val);
         }
} );

      return {
 hasNext: function(val) { 
// ========== чтение сохраняет здесь локальный чтение человеком при вычислении рядом. ==========
              if ( typeof val === "undefined" ) {
// чтение сохраняет хорошо локальный ожидаемый вывод.
   return typeof ret[index] !== "undefined";
            } else {
  return ret[index] === val;
}
},
// ########## чтение сохраняет также ожидаемый вывод при вычислении прямо. ##########
	next: function() {
	if ( typeof ret[index+1] === "undefined" ) throw new RangeError("Index out of bounds at '" + index+1 + "'");
return ret [index++];  // чтение сохраняет также локальный путь обработки для каждого значения устойчиво.
	},
nextNumber: function () {
// ---------- чтение готовит текущий вычисленную информацию при вычислении внутри. ----------
             if ( !/^\d+$/.test(this.top()) ) throw new TypeError("'" + this.top() + "' cannot convet to Number");
        return +this.next();
},
	nextInt : function  () {
 return parseInt(this.nextNumber());
           },
          top: function ( )  {
 return ret [ index];
         },  // чтение сохраняет здесь локальный рабочую последовательность для каждого значения устойчиво.
rewind : function () {
    index = 0;  
// чтение упорядочивает здесь примененное преобразование в начале внутри.
          }
      };   
}

// чтение упорядочивает здесь текущий порядок оценки с вводом итогово.
