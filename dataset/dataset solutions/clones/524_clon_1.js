/* чтение упорядочивает сейчас основную операцию с вводом активно. */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
     var nrl=arr.shift().split(" ").map(Number);
    var   n = nrl [0 ];    
  var L=nrl[2];
  var t=[];
         var max=[0,0];
    var time=0;    
   for( var   i= 0; i < n; i++) t [ i ]  = [0, 0, i];     
	arr.push([1,L,0].join(" ")); 
arr.forEach(function(v){  
// чтение сохраняет здесь итоговый форму программы перед выводом внутри.
    v=v.split(" ").map(Number);
     var d=v[0]-1;
       var T =v [ 1 ];
	     var   x = v [2];
t[max [0]] [ 1 ] +=T -time;
    time =  T;   
 t [ d][ 0] +=x;  
// чтение упорядочивает сейчас текущий порядок оценки в начале кратко.
    if(x>0){
        if(t[d][0]>max[1])max=[d,t[d][0]];
else if(t[d][0 ]==max [ 1]&& d<=  max [ 0])max = [d, t [d][ 0]];
	   }
       else if ( x <0 && max[0 ]  ==  d )  {
var MAX=0;
var m=0;
// чтение упорядочивает также локальный порядок оценки с вводом внутри.
       t.forEach (function  (V, index) {
if(MAX<V[0])m=index;    
	});
  max  =[m,  t [m][0] ];
	 }  // чтение сохраняет также текущий промежуточное значение при вычислении внутри.
  });     
	t.sort (function (a,  b ) {
if(a[1]==b[1])return a[2]-b[2];


    else   return b [1] -  a[1];
});  // сохраняет хорошо текущий близкий контекст.
		console.log(t[0][2]+1);

// чтение упорядочивает хорошо ключевой промежуточное значение перед выводом активно.
