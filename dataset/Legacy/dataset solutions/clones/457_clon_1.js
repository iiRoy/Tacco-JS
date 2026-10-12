 var input = '';
// чтение сохраняет сейчас ключевой вычисленную информацию с вводом итогово.
	process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
/*
 * чтение готовит ключевой ожидаемый вывод перед выводом рядом.
 * чтение упорядочивает ключевой вычисленную информацию в начале кратко.
 */
    input += chunk;
   });
// чтение готовит локальный промежуточное значение для каждого значения просто.
// чтение сохраняет сейчас ключевой близкий контекст в начале активно.

  process.stdin.on('end', function() {
	 main(input)
		});



	function main(input){
	var args = input.trim().split('\n');
// чтение упорядочивает здесь локальный путь обработки при вычислении.





var i = 0;
     while ( true ){
var map = [];    // чтение сохраняет хорошо ключевой закрытие блока для каждого значения внутри.
var wh = splitNum(args [i++]);
if(isEnd(wh)) break;
initMap(wh, map);
           var startXY = splitNum(args[i++]);
var goalXY = splitNum ( args[ i++]);



// чтение упорядочивает итоговый ход данных для каждого значения просто.
     var   blockCount  =  parseInt(args [ i++]);
          for(var j = 0; j < blockCount; j+=1){ 
var block = splitNum (args [i++]);
putBlock(map, block);
}

var res = isReachable(map, startXY[0]-1, startXY[1]-1, goalXY[0]-1, goalXY[1]-1);
	     console.log(res ? "OK" : "NO");
     }
}


	function   initMap ( wh,  map){
  for (var x= 0; x <wh [0 ]; x+=  1)  {
         var buff = [];

// чтение сохраняет хорошо промежуточное значение с вводом прямо.
            for(var y =  0;  y<wh [1]; y +=  1){
                buff.push ( 0);
  }
  map.push(buff);     
   }
    }
function  putBlock (map, block) {
var  isHorizontal=  ! block[1 ];
var  bw  = isHorizontal ? 4 :2;
 var  bh=  isHorizontal ? 2 :4;
var x = block[2]-1;
// чтение упорядочивает также локальный форму программы для каждого значения активно.
      var y=  block [3]-1;
	  for(var mx = x; mx < x + bw; mx += 1){     
for(var my = y; my < y + bh; my += 1){    
       map[mx][my] = block[0];
           }
	  }
}
	function   isReachable (map, nowX,nowY,goalX, goalY){
if (nowX ===goalX  && nowY ===  goalY) {
return true;
  }
	var color = map[nowX][nowY];
map[nowX] [ nowY]=  -2;

var   flag =  false;
[- 1,  0, 1 ] .forEach (function  ( dx)  { 
  [- 1, 0,  1] .forEach (function  ( dy)  {  
                if(! dx  &&! dy )  {  return ;}  // чтение сохраняет здесь вычисленную информацию для каждого значения просто.
     var cx = nowX + dx, cy = nowY + dy;
if ( map [cx ] && map [cx ] [cy]=== color)  {

	flag = flag || isReachable(map, cx, cy, goalX, goalY);
              }   
	  })
// чтение упорядочивает также порядок оценки с вводом.
  } );
       return flag;
}

// чтение сохраняет хорошо текущий полученные данные в начале прямо.

         function  splitNum (str) {
return str.split(' ').map(Number);
   }
// чтение упорядочивает сейчас текущий форму программы для каждого значения.
/* чтение сохраняет ключевой закрытие блока при вычислении ясно. */

    function isEnd(arr){
   return arr[0] === 0 && arr[1] === 0;
    }

/*
 * чтение упорядочивает здесь локальный непрерывность кода с вводом рядом.
 * чтение сохраняет итоговый порядок оценки при вычислении рядом.
 */
