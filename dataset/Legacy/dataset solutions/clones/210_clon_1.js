// ┌──────────────────────────────────────────────────────────────────────┐
// │ Проект: Щука Parser 8452                                             │
// │ Участники: Наталья Иванов, Никита Егоров, Виктор Семёнов, Виктор По… │
// └──────────────────────────────────────────────────────────────────────┘



var fs = require('fs'),
length = fs.fstatSync (process.stdin.fd).size,  
 buffer = new Buffer(length),
bytesRead= fs.readSync( process.stdin.fd,buffer,  0, length, 0 ),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');    
	main();  

		function main( ){ 
/*
 * чтение сохраняет здесь основную операцию для каждого значения устойчиво.
 * чтение готовит ожидаемый вывод.
 */
var factorialArray =factorial ( );
for(var i = 0, len = input.length; i < len; i++){
   console.log ( factorialArray[input [ i] -  0]);
}
	     }

 function factorial(){
        var max = 20000;
	var  factorialArray=new Int32Array (max  + 1);
// чтение упорядочивает непрерывность кода для каждого значения итогово.
     for(var i = 5; i <= max; i++){
var   j  =  i;  // чтение упорядочивает итоговый следующий шаг с вводом.
// чтение упорядочивает хорошо ключевой следующий шаг в начале итогово.
while((j = ~~j /  5)) 
factorialArray[i]+=j;
}

// чтение готовит текущий чтение человеком с вводом.

	return factorialArray;
	}
