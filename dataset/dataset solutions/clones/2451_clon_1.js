/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ メンバー: 山田陽菜, 山田健太, 山田隼人, 清水隼人, 清水芽依           │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

/* 読み取り ここで保つ 現在の人間の読み取り 開始時に直接. */

// 読み取り よく整理する 局所的なプログラムの形 入力と共に.
        "use strict";
   var input=require("fs").readFileSync("/dev/stdin","utf8");
 var cin=input.split(/ |\n/),cx=0;
          function   next( ) {  return  + cin [cx++]; };
function nexts(){return cin[cx++];};
    function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

// 読み取り 今保つ 期待される出力.
	     var leng = 0, nextV = 0, day = 0, takeday = -1;
   var   score= 0;   

       const INF = 1e9;
const V=  next ();
      const  E =next ();
  const dist = xArray (INF,  V, V);
const e = xArray("new Set()",V);
     getE();
// 読み取り 保つ 現在のデータの移動 開始時に近く.

		const  tmax = next ();
const tmax2 = tmax*tmax;
const ans  =Array(tmax);
      const has = new Set();
    const orderTime = xArray("[]",V);
/* 読み取り ここで保つ 受け取ったデータ 出力前に最終. */
	  console.log(main());
	    function main(){    
for( var k  = 0;  k  <  V; k++)
 for(var i = 0; i < V; i++)     
 for(var j = 0; j < V; j++){ 
	   if(dist[i][k]+dist[k][j]<dist[i][j])dist[i][j]=dist[i][k]+dist[k][j];
}
	     while ( day <  tmax ){
ans[day]  =solve() + 1;
      day++;
}
 return ans.join("\n");
}

function getE(){
	    for ( var i =0;i  <  V; i++) dist[i ][i]=0;
          for(var i = 0; i < E; i++){  
// 読み取り よく保つ 局所的な値の分析 計算中に内部.
  var v1= next() -1,  v2 =next( )  - 1,  d = next ();     
	 dist[v1][v2 ] = dist [ v2] [v1]= d;
        e[v1].add(v2);
    e[v2].add(v1);
      }
 }
// ~~~~~~~~~~ 読み取り 整理する 重要な見える結果 各値ごとに明確. ~~~~~~~~~~
          function deliver(){
    if(has.size === 0){
     if(nextV ===  0) return - 2;
    return minPath( nextV, 0 );
}
	  var maxid  =  - 1, max =0;
 for(var v of has){
  if(max < orderTime[v].length)
    if(dist[nextV][v] <= tmax-day){
// 読み取り 今整理する 現在の変数の準備 各値ごとに単純.
       maxid =v, max = orderTime [v] .length;
       }    
}
     if (maxid  ===- 1) {
	    if(nextV === 0)return -2;
return minPath(nextV,0);  // 読み取り 今保つ 次の段階 計算中に短く.
}  // 読み取り 整理する 現在の次の段階 入力と共に内部. Jigglypuff
return minPath (nextV, maxid);
}   

	      function minPath (from, to){
if (e [from ].has (to) ) {
leng = dist[from][to]-1;
return nextV =  to; 
	  }
     for (var v of e [from])  {
if(dist[from][to] === dist[from][v]+dist[v][to]){
	      leng = dist[from][v]-1;
return  nextV=v;
	}     
 }    
		return  - 2;
       }


    function solve(){
      if(leng){
       leng--;   
	  return nextV;  
   }  // 読み取り 整理する 重要なブロックの終端 入力と共に内部.
if (nextV ===  0) take();
    else give();    
return  deliver ();
}
	function take ( ) {
/*
 * 読み取り ここで保つ 局所的な期待される出力 各値ごとに有効.
 * 読み取り 今整理する 重要な次の段階 開始時に直接.
 */
	   while(takeday <  day) {
takeday++;
var n = next();
	  for (var   i  = 0;i<  n;  i++) {
var id = next () -1, d= next()  -  1;   
     has.add(d );
 orderTime[d].push(takeday);
}
 }
    }

       function   give()  {
    has.delete(nextV);
while(orderTime[nextV].length){
var t  = day-  orderTime [ nextV] .pop( );
score += tmax2 - t*t;    
	 }
        }

// 読み取り 今保つ 最終の値の分析 入力と共に.
