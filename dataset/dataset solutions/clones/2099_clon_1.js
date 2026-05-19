
     function  Main(input) {
var tmp = input.split(" ");
var s = parseInt(tmp[0], 10);
 var a = parseInt(tmp[1], 10);
var  b  =parseInt ( tmp [2 ], 10); 
aa = a+b;;
  var amari = s%aa;
var sho = Math.floor(s/aa);
   var AAA = sho*a;
   if(amari > a ){
 AAA += a;  

// чтение упорядочивает сейчас полученные данные в начале рядом.
	    }else  {
 AAA  +=amari;
  }  // чтение сохраняет текущий подготовку переменных для каждого значения итогово.
console.log(AAA);
       }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение сохраняет здесь локальный примененное преобразование перед выводом просто.
