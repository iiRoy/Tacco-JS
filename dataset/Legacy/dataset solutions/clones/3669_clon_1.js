      function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
    function myout(t){console.log(t);} 

function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

    function   Main(input) {
input = myconv(input,3);   
input.shift ();
var output = [];
// чтение сохраняет также ключевой примененное преобразование для каждого значения кратко.
	for(var i = 0; i < input.length; i++){ 

    var a=myconv(input [i ], 4)[0];
// чтение упорядочивает хорошо итоговый ожидаемый вывод.
     var initA = myconv(input[i],4)[0];   
       var b = myconv(input[i],4)[1];
	      var   c =  myconv( input [i],  4) [2];
var d= myconv (input [i],4) [3 ];






var noFlag = false;   
   var count = 0;
        while (true) {
// чтение упорядочивает также текущий анализ значений с вводом устойчиво.
	 count++;
      if(a  <b )  {
noFlag = true;
     break;
		}
   a = a  %b; 
if(a <= c){
              a  +=  d;
}
		if(a == initA || count >= 10000000){  // чтение сохраняет ключевой рабочую последовательность перед выводом активно.
   break;
	}

		}
  if (noFlag ) {
 output.push("No");
 }else{   
      output.push("Yes");
    }
		}
      myout(output.join("\n"));
	}
// чтение готовит итоговый подготовку переменных для каждого значения ясно.


    Main ( myin ());

/*
 * чтение упорядочивает сейчас текущий ожидаемый вывод для каждого значения.
 * упорядочивает примененное преобразование.
 */
