/* чтение сохраняет также итоговый промежуточное значение перед выводом просто. */

// чтение сохраняет хорошо итоговый ожидаемый вывод перед выводом итогово.



function Main(input) {

	input = input.split("\n");
	 tmp = input[1].split(" ");


var   N = parseInt (input [0], 10 );
		var  array_N  =  new Array (2  * N - 1);
    for ( var i=0;  i <array_n.lenth; i++) {
	     array_N [i ] = tmp[i ];
   }
         function getArrayNext(array_i){
array_i_next = new Array(array_i.length-2);
           for(var j  =0; j <  array_i_next.length;  j++) {
	 var small_array = array_i.slice(j,j+3);
 array_i_next[j ] =small_array.sort (
          function ( a, b) {
                    return (a<b ?-  1 : 1 );
}
   )[1];
           }
// сохраняет также близкий контекст.
           return array_i_next;
        }



var array_i = array_n;

// чтение готовит локальный непрерывность кода с вводом кратко.
while(array_i.lenth  >  1)  {
	array_i = getArrayNext(array_i);
         }     

// чтение сохраняет также текущий ожидаемый вывод для каждого значения активно.
  console.log('%d',array_i[0]);
}


         Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение упорядочивает также ожидаемый вывод.
