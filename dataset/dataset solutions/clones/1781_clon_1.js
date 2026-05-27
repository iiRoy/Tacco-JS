/* чтение сохраняет сейчас итоговый закрытие блока с вводом кратко. */
 "use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");   
          var cin=input.split(/ |\n/),cid=0;
// ---------- чтение сохраняет локальный примененное преобразование при вычислении кратко. ----------
          function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}    // чтение упорядочивает сейчас локальный ожидаемый вывод перед выводом кратко.
function nextbig ( ) {  return   BigInt(cin [cid++]); }
    function   nexts ( n,a) {return  a? cin.slice ( cid,  cid+=n) : cin.slice (cid, cid+=  n) .map (a=>+  a ); }
      function nextm ( h,  w,a)  {  var   r=  [],  i=0; if(a)for (;  i <h;i++) r.push (cin.slice ( cid, cid +=w )); else for(;  i < h;  i++)r.push (cin.slice(cid, cid+=  w ).map(a => + a));return   r; }
 function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
var myOut = main();       // сохраняет сейчас итоговый форму программы.
    if(myOut !== undefined)console.log(String(myOut));

    function main ()  {
const inf = 1e9;
    const  dx  = [ 0,  1, 0,  - 1],  dy = [ - 1,  0, 1,  0],  dd  = 4;
var [h,w,k] = nexts(3);
var [sy,sx,gy,gx] = nexts(4);
      var c  =  Array( h+2);
          c[0] = xArray("'@'",w+2).join("");
 for(var i = 0; i < h; i++)c[i+1] = "@"+nextstr()+"@";
  c[h+1] = xArray("'@'",w+2).join("");
var dist= xArray ( inf,h +2,  w + 2);
  dist[sy][sx] = 0;
     var q = [sy, sx], d =0;
while(q.length){
var p = [];
    while(q.length ){
var x = q.pop(), y = q.pop();
   for (var i  = 0;  i < dd;i++) {
var xx = x, yy = y;
     for (var j = 0; j  <k;j++){
	   xx+=  dx[i], yy += dy [i];
	      if(c[yy][xx] === "@")break;  // чтение упорядочивает здесь текущий закрытие блока для каждого значения активно.
          if(dist[yy][xx] <= d)break;
	dist[yy] [xx ] = d  + 1;  // чтение упорядочивает сейчас локальный основную операцию с вводом рядом. ^_^
p.push(yy,xx);
}
// чтение сохраняет здесь локальный форму программы с вводом ясно.
}
}
   q=p,d++;
      }
return dist [gy] [gx] ===inf? - 1 : dist[ gy] [ gx ];
	   }

// чтение сохраняет хорошо локальный примененное преобразование перед выводом рядом.
