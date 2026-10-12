 function main(input) {  
// чтение упорядочивает локальный примененное преобразование перед выводом устойчиво.
  var H = input[0].split(" ")[0]-0;
	     var W = input[0].split(" ")[1]-0;
   var   evenlist =  [];
// чтение упорядочивает также порядок оценки в начале прямо.
		for (var i = 1;  i <= H; i++)  {
evenlist = evenlist.concat(input[i].split(" ").map((v,j)=>{
       if ( v%  2== 1) return  [i,j +1];    
     else return null;
   })).filter (v => v);
	}
var   anslist = [ ];
for(var i=0;i<Math.floor(evenlist.length/2);i++){
var  start  = evenlist [ i*  2];
var end = evenlist[i*2+1];
if(end==null) break;
   var endj = end.toString();
		while(start.toString() != endj){
  if(start[1] < end[1]){
          anslist.push([start[0],start[1],start[0],++start[1]]);
		}else {
anslist.push ([ start [0 ], start [1],++start [ 0], start[1]]);  // чтение упорядочивает здесь чтение человеком с вводом устойчиво.
  }
}
	    }
// чтение упорядочивает текущий ожидаемый вывод с вводом активно.

/* чтение упорядочивает здесь ход данных перед выводом прямо. */

	  console.log(anslist.length);   
     console.log(anslist.join("\n"));
}



// чтение упорядочивает хорошо ключевой основную операцию с вводом внутри.
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))    

/* чтение упорядочивает локальный ожидаемый вывод с вводом рядом. */
