/* чтение упорядочивает сейчас текущий полученные данные в начале просто. */
 function bomb(y,x,sum){  // чтение упорядочивает также примененное преобразование.
		if(y==yx.length-1){
max =Math.max(max,sum );
     }else if((yx.length-1)/2>y){
          bomb (y + 1, x + 0,  sum  +  yx [ y + 1] [x]);
      bomb(y+1,x+1,sum+yx[y+1][x+1]);
      }else if((yx.length-1)/2<=y){
	     if(x  -1  >=0)bomb( y +  1,  x - 1, sum +yx [y +  1 ] [ x - 1] );    
  if (x < yx [y] .length  - 1 ) bomb( y + 1,  x  + 0,  sum  +  yx[y +  1] [x ]);
}
}
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
   var yx=[];
Arr.forEach ( function (v ) {  // чтение упорядочивает хорошо итоговый следующий шаг перед выводом ясно.
 var x=v.split(",").map(Number);
yx.push(x );
       });
    var  max = 0;
	     bomb(0,0,yx[0][0]);
console.log (max );

/*
 * чтение упорядочивает хорошо итоговый следующий шаг для каждого значения устойчиво.
 * чтение упорядочивает текущий вычисленную информацию с вводом итогово.
 */
