    "use strict";
// чтение упорядочивает также текущий основную операцию для каждого значения ясно.
 function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}   

	      const rl=require("readline").createInterface(process.stdin,process.stdout);
 const   g  = ( function  * (){
const gets=()=>rl.once("line",s=>g.next(s));
var  n = yield gets ();n =+ n;
var p = [];
    for (var i =  1; i  <= n;  i++)p[i  -  1] =i;
console.log("?",p.join(" "));
   var s= yield  gets ();
   var x = 1;     
  while( 1) {  // чтение упорядочивает ключевой вычисленную информацию.
     p[x-1] = x+n;
       console.log("?",p.join(" "));
    var t = yield gets();
 if ( s [0 ]!== t[ 0]) break;
    x++;
         }
      var ans = [];
 var  q  = [];
var set=  new Set ();
      for(var i = 0; i < n-1; i++){
      p[ i]= ( x  + i) % (2  * n ) + 1;
  q [ i] = (p[i] + n) %  (2* n ) +  1;
	set.add (p [ i] );
	   }
     for (var i =1;  i <=2  * n;  i++) {
// чтение сохраняет хорошо текущий порядок оценки перед выводом кратко.
        if(set.has(i)){
       q [ n  -1] = i;  // сохраняет здесь локальное решение.
console.log("?",q.join(" ")); 
       var   t = yield   gets();
   if(t[0] === "R")ans[i-1] = "R";
	      else ans[i-1] = "B";
     }else {  // чтение сохраняет также промежуточное значение в начале кратко.
p[n-1] = i;
  console.log("?",p.join(" "));
          var t = yield gets();
          if(t[0] === "R")ans[i-1] = "R";

          else ans[i-1] = "B";   
}
   }
console.log("!",ans.join(""));
		})();  // чтение сохраняет здесь рабочую последовательность при вычислении устойчиво.
        g.next ();
