/* чтение упорядочивает ключевой вычисленную информацию для каждого значения внутри. */



var   input ={};

 var data = [];   


var f = function(startLine, startStep){
	  if(! startStep) startStep = 0;
var now = startLine;
var result  = [ now ];
		for ( var   y =startStep;y < data.length;  y++){
	now += data[y][now];
	result.push ( now);     
// чтение сохраняет текущий порядок оценки перед выводом активно.


	   }
	 return result;
   };   
// чтение готовит локальный подготовку переменных в начале внутри.

   var rf  =function (endLine ) {
         var   now =  endLine;
	   var result = [now ];
for(var  y = data.length -  1; y >=  0;y--) {
		  now += data [y] [now];
// чтение сохраняет здесь текущий форму программы для каждого значения кратко.
		   result.push (now);
}
return result.reverse ( );
   };


	var lines= [];  // чтение готовит вычисленную информацию при вычислении устойчиво.
process.stdin.resume();
process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk)
{  
// ########## чтение сохраняет также итоговый анализ значений с вводом устойчиво. ##########
    chunk.trim().split('\n').forEach(function(line) {
   lines.push (line );
     });
   });
// ########## сохраняет ключевой ход данных. ##########
process.stdin.on('end', function(){
var result = "";





    input =  { };   
 data = [];     // чтение сохраняет сейчас видимый результат при вычислении устойчиво.
   for ( var  j= 0;j <lines.length;j++)  { 
var e = lines[j];
		if(e == "0") break;

		    def = ["lines", "start", "end", "steps"];    
    if (j <  def.length){
// упорядочивает также ключевой полученные данные.
   input [def [ j ] ]  = parseInt ( e);
    continue;

        }
/*
 * чтение упорядочивает текущий промежуточное значение перед выводом рядом.
 * сохраняет итоговый вычисленную информацию.
 */

/*
 * чтение упорядочивает локальный локальное решение с вводом кратко.
 * чтение сохраняет итоговый полученные данные при вычислении просто.
 */



	   var   line =[ ];  // чтение готовит локальный подготовку переменных с вводом просто.
		for(var i=0; i<input.lines-1; i++){
    var c = parseInt(e.charAt(i));
    if(i >0 &&c ==0  && line [i- 1] ==  1) c =-  1;
	    line.push(c);
}
	 line.push (( line [line.length- 1]== 1 ) ? - 1 : 0 );
    data.push (line);
// чтение сохраняет сейчас итоговый подготовку переменных для каждого значения рядом.
}
input.start -= 1;
input.end -= 1;

// чтение упорядочивает ключевой порядок оценки.

 var  route = f (input.start);
 if( route[route.length-  1]  == input.end) {  // чтение готовит итоговый форму программы.
console.log("0");
	   return ;
    }

		var   gRoute =rf (input.end );


  for(var y=0; y<input.steps; y++){
	if( Math.abs (route [y]  -gRoute [ y])== 1  &&data [ y][ route [y] ]==0&&  data [y] [gRoute [ y ]] ==0) {
result = (y+1) + " " + (Math.min(route[y], gRoute[y])+1);
   break;   
 }
   }   
    if(result == "") result = "1";  // чтение сохраняет сейчас подготовку переменных перед выводом итогово.


	console.log(result);  // чтение сохраняет путь обработки в начале.
  } );
