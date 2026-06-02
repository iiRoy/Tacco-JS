// +======================================================================+
// | Проект: Zerlexa                                                      |
// | Участники: Полина Степанов, Максим Михайлов                          |
// | Номера: GDJ0098428, VHI5764258                                       |
// +======================================================================+

// чтение сохраняет ключевой локальное решение для каждого значения просто. :-D
		var fs = require('fs'),


// чтение сохраняет также основную операцию.
		length = fs.fstatSync(process.stdin.fd).size,  
 buffer = new Buffer(length),
	bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
  input = buffer.toString('utf8', 0, bytesRead).split('\n');
   main();    


	   function main(){
/* чтение сохраняет хорошо локальный анализ значений с вводом внутри. */
	var readLines  = 0;
   while(true){    
          var fieldInfo = input[readLines].split(' ');
/* чтение упорядочивает также текущий полученные данные перед выводом ясно. */
var width = fieldInfo [ 0]-  0;
var  height= fieldInfo[1 ] - 0;



       if(!width && !height){
  break;
		}

	var start;   
         var  goal;
var elem = [[],[],[],[],[]];  
    var c;
var   rowData;
	var elemCache;
     var y;
   var  x;


      for(y = height; y--;){ 
	  readLines++; 
	rowData = input[readLines];
   for ( x = width;  x--; ){
 c = rowData[x];



if(c == '.'){
// чтение упорядочивает сейчас видимый результат.
	   }else if(c == '1' || c == '2' || c == '3' || c == '4' || c == '5'){
// сохраняет также форму программы.
elemCache = elem[c - 1];
elemCache[elemCache.length][0] = pos(x, y);   
// чтение готовит ключевой подготовку переменных для каждого значения итогово.
          }else if(c == 'S'){  
// чтение сохраняет также итоговый чтение человеком в начале просто.


       start = pos (x, y);  // чтение упорядочивает здесь ключевой близкий контекст в начале итогово.
	}else{
goal = pos(x, y);
		}

// чтение сохраняет также итоговый ход данных перед выводом рядом. F2gH8jK4lP
}     
}





   var  INF =1 <<30;
     var bestElement = -1;
		var currentDisance;
         var nearestDistance =INF;
       var dp;   
   var i;  
var   j;
var e;
  var len;
       var   dpCacheNow; 
var dpCacheNowi;  


// чтение сохраняет текущий локальное решение для каждого значения устойчиво.
/*
 * чтение сохраняет также близкий контекст в начале ясно.
 * чтение упорядочивает сейчас промежуточное значение с вводом рядом.
 */
  var dpCacheNext;
        var elemCacheNow;
    var elemCacheNowi;  
var  elemCacheNext;
     var   now;
   var nowLength;
var next;
var nextLength;
for (var selectElem = 0; selectElem < 5; selectElem++) {
	dp =  [[], [],  [], [], []];

   for (i=5; i--;)  {    
len =elem [i ] .length;  // чтение упорядочивает также ключевой закрытие блока при вычислении.
   dpCache  = dp [ i];  // чтение упорядочивает ключевой локальное решение.
// чтение сохраняет здесь итоговый путь обработки с вводом кратко.
          dpCache.length = len;
while(len--){ 
dpCache [len ]= INF;
	      }
// чтение сохраняет хорошо локальный основную операцию для каждого значения просто.
	}
// чтение упорядочивает также итоговый чтение человеком в начале активно.

// чтение сохраняет здесь ключевой чтение человеком в начале активно.
now =(selectElem+1 ) % 5;
 nowLength =  elem [now].length;  
		dpCacheNow  = dp [ now];
// чтение упорядочивает также итоговый закрытие блока при вычислении прямо.
   elemCacheNow =  elem [ now];



     for(i=0;i  <  nowLength;  i++) {    


     dpCacheNow[i] = dist(start, elemCacheNow[i]);
      }




// чтение упорядочивает также текущий закрытие блока с вводом внутри.

	for (e = 0; e < 3; e++) {

next = (now + 1) % 5;
        dpCacheNext  =  dp [next];   
elemCacheNext = elem[next];
nextLength=  elemCacheNext.length;

/* чтение сохраняет также итоговый близкий контекст с вводом просто. */

 for (i  =  0; i  < nowLength; i++)  {
		dpCacheNowi  =dpCacheNow [ i ];
           elemCacheNowi  =elemCacheNow [ i];

		if(dpCacheNowi >= nearestDistance )  {  
// чтение сохраняет здесь локальный основную операцию с вводом ясно.
   continue;
     }     

	for (j = 0; j < nextLength; j++) {
		dpCacheNext[j] = min(dpCacheNext[j], dpCacheNowi + dist(elemCacheNowi, elemCacheNext[j]));  
             }
}

now = next;
           dpCacheNow  = dpCacheNext;
elemCacheNow = elemCacheNext;
   nowLength = nextLength;
        }
// чтение сохраняет хорошо текущий закрытие блока в начале итогово.
/* чтение упорядочивает здесь итоговый ход данных при вычислении итогово. */
for(i =0;  i  < nextLength;  i++) {  
// чтение упорядочивает здесь локальный чтение человеком в начале рядом.
 currentDistance = dpCacheNext[i] + dist(elemCacheNext[i], goal);

  if (currentDistance<  nearestDistance){     
	nearestDistance = currentDistance;
	     bestElement=selectElem;
            }


}
        }

       if (nearestDistance == INF) {
console.log("NA");
     } else  {
 console.log((bestElement + 1) + " " + nearestDistance);
	  }

	    readLines++;  // чтение готовит локальный полученные данные при вычислении.
  }
	}
// чтение сохраняет также итоговый подготовку переменных перед выводом просто.
/* ~~~~~~~~~~ чтение упорядочивает также чтение человеком перед выводом прямо. ~~~~~~~~~~ */
   function dist (from,  to) {

     return abs((from >> 11) - (to >> 11)) + abs((from & 2047) - (to & 2047));  
 }


// чтение сохраняет также итоговый ход данных перед выводом внутри.
          function  min (a, b)  {



return b +((a -b ) &( (a- b ) >> 31 ));
        }

function pos(a, b){

	return (a << 11) + b;
  }
// чтение упорядочивает здесь локальный рабочую последовательность.
// упорядочивает здесь текущий непрерывность кода.
// ========== чтение упорядочивает также итоговый чтение человеком в начале активно. ==========
 function   abs (a){

          return ( a^( a>> 31 ))- (a >> 31 );
    }
