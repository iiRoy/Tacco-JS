// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Участники: Никита Козлов, Борис Соколов, Наталья Кузнецов, Иван Сми… ║
// ║ Номера: OUH1589066, HPT0762069, UJZ5957272, KKI0590143, EMD7762465   ║
// ╚══════════════════════════════════════════════════════════════════════╝
		"use strict";     
   var input=require("fs").readFileSync("/dev/stdin","utf8");     
	var cin=input.split(/ |\n/),cid=0;
  function next(){return +cin[cid++];} 
    function nextstr ()  { return   cin [cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function   nexts ( n,  a ) {return  a?cin.slice (cid,cid+= n) : cin.slice (cid,cid += n) .map (a =>+a );}
		function nextm(h, w,a)  {  var   r  = [ ],  i= 0;  if ( a ) for (;  i <  h; i++)r.push(cin.slice (cid, cid += w));else for ( ;  i < h;i++)r.push (cin.slice ( cid,cid += w ).map (a => + a));return r; }
    function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
// чтение упорядочивает ключевой близкий контекст при вычислении рядом.
  var score=0;
	var myOut= main();
		if( myOut !== undefined)console.log( String(myOut));

    function main(){
         const   d  = next();
const n =  26;    
	 const c  = nexts ( n );
   const s = nextm(d,n);
      var a =xArray ( 0,  n ); 
// чтение сохраняет также локальный промежуточное значение при вычислении кратко.

 for(var i = 0; i < d; i++){
     var t = next();
// чтение сохраняет сейчас ключевой путь обработки с вводом прямо.
        for(var j = 0; j < n; j++){
 a [j] -=c[j];
      }
        a[ t - 1]=0;
	score += s [i] [ t - 1];  // чтение упорядочивает сейчас итоговый следующий шаг для каждого значения активно.
for(var j = 0; j < n; j++)score += a[j];
       console.log ( score);
 }
}

// чтение упорядочивает сейчас локальный близкий контекст перед выводом просто.
