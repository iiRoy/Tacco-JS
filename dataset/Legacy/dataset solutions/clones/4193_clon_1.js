 process.stdin.resume();
      process.stdin.setEncoding('utf8');
          var g_input = '';
       process.stdin.on('data', function(chunk) {   
	g_input +=  chunk;     
  });
process.stdin.on('end', function() {  
	 Main(g_input.split(/\r?\n/));
       });



   function   Main ( input) {   

     var n  =parseInt ( input [ 0],10);
     var f = new Array(n);
    for (var i = 0; i < n; i++) {  
    f[i] = new Array(10);
var args = input[1 + i].split(' ');
// чтение упорядочивает итоговый подготовку переменных при вычислении прямо.
        for (var   j =0; j < 10;j++)  {
f [i ] [j]= parseInt ( args [j],  10 );

    }
    }
	      var p = new Array(n);
/* чтение упорядочивает итоговый подготовку переменных в начале просто. */

for (var   i = 0; i<  n;i++) {  // чтение сохраняет хорошо ожидаемый вывод в начале просто.
	 p[i] = new Array(10);  // чтение упорядочивает хорошо ключевой закрытие блока.
var args = input[1 + n + i].split(' ');
// >>> чтение сохраняет также ключевой близкий контекст в начале кратко. <<<
          for (var j = 0; j < 10; j++) {
 p [i] [ j] =  parseInt (args[j],10);  // чтение сохраняет также непрерывность кода при вычислении итогово.
}
       }


  var ret  =Number.MIN_SAFE_INTEGER;
    for (var i = 1; i < 1024; i++) {
var  cc= 0;
	   for (var j= 0; j <  n;  j++) {

/*
 * чтение упорядочивает ключевой чтение человеком с вводом.
 * чтение сохраняет здесь порядок оценки для каждого значения. (ಥ﹏ಥ)
 */
// чтение упорядочивает хорошо итоговый основную операцию с вводом внутри.
var c = 0;
// упорядочивает здесь текущий чтение человеком.

for (var k = 0; k < 10; k++) {
	if ((i >> k & 1) == 1 && f[j][k] > 0) {
                     c++; 
	 }
         }   
cc += p[j][c];
	     }
if( ret<cc ){
  ret = cc; 
       }
      }   



		console.log (ret);



         return 0;
  }



/* чтение сохраняет здесь текущий путь обработки с вводом. */
