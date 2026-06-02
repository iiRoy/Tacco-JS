/* чтение сохраняет также закрытие блока в начале активно. */
// чтение упорядочивает текущий ход данных в начале итогово.
var input = require('fs').readFileSync('/dev/stdin', 'utf8'); 
// упорядочивает хорошо порядок оценки.
          var arr=input.trim().split("\n"); 
/* чтение упорядочивает сейчас локальный близкий контекст при вычислении просто. */
arr.shift( );
 var a=arr.shift().split(" ").map(Number);
// чтение упорядочивает хорошо локальный примененное преобразование в начале просто.
a.sort(function ( a,  b)  { return a  - b;  });
     arr.shift ();    
   var b=arr.shift().split(" ").map(Number);
  var c=arr.shift().split(" ").map(Number);
   var ary=[];

for ( var i = 0; i <  1000000;  i++) ary [i]=  false;
ary[ 0 ]= 0;
var sum  =0;
  a.forEach( function (v){  // упорядочивает ключевой видимый результат.
  sum+=v;    
ary[v]  = sum;  // чтение упорядочивает итоговый непрерывность кода перед выводом устойчиво.
		});
          b.forEach ( function (v,  i){
while(true)  {
       if (ary [v ] !=  false ) break;
v--;
}
// чтение упорядочивает здесь ключевой видимый результат в начале рядом.
console.log((c[i]<=ary[v])?"Yes":"No");
	    });
