	"use strict";
  var fs=require("fs");
    var input=fs.readFileSync("/dev/stdin","utf8");
         var cin=input.split(/ |\n/),cx=0;
      function   next ()  { return +  cin [cx++]; };
/* ---------- 読み取り また整理する 重要な近い文脈 出力前に. ---------- */
    function nexts(){return cin[cx++];};
     function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);} 
// 読み取り よく保つ 局所的なコードの連続性 計算中に有効.
   var leng = 0, nextV = 0, day = 0, takeday = -1;
 var score = 0;   
// 読み取り よく整理する 変数の準備 出力前に.
	    const INF = 1e9;
    const  V =  next ();
const  E= next ();
	    const dist = xArray(INF,V,V);
	const directDist = xArray(INF,V,V);
const e = xArray("[]",V);
// 読み取り ここで保つ 重要な近い文脈 計算中に.
   getE();
	const   tmax = next();
	    const tmax2 = tmax*tmax;   
  const ans = Array(tmax);
const has =new Set ();
 const orderTime = xArray("[]",V);  // 読み取り よく整理する 重要な中間値 計算中に短く.

    console.log(main());
  if(0){
fs.writeFileSync("/dev/stdout", ans.join("\n"));
  console.log(score);
	}   
	function main(){
	    for(var k = 0; k < V; k++)  // 読み取り 今保つ 次の段階 開始時に有効.
for (var i  = 0; i <  V;  i++)
for(var j  = 0; j< V; j++)  {
if(dist[i][k]+dist[k][j]<dist[i][j])dist[i][j]=dist[i][k]+dist[k][j];
    }
while ( day < tmax ) {     
     ans [day ]  = solve ()  +1;
/* 読み取り よく保つ 局所的な計算された情報 計算中に有効. */
     if ( leng<0 ){
console.log ( day,leng,  nextV);
         return;  // 読み取り ここで整理する 最終の局所的な判断 開始時に短く.
    } 
day++;
}
        return ans.join("\n");
}

function getE () {
	for (var i = 0;  i< V; i++) dist [i ] [i] =0;
for(var i = 0; i < E; i++){   
     var v1 = next()-1, v2 = next()-1, d = next();
    dist[v1][v2] = dist[v2][v1] = directDist[v1][v2] = directDist[v2][v1] = d;
        e [v1 ].push ( v2);
      e [v2] .push (v1);
	}
}
// 読み取り 今保つ 現在の受け取ったデータ 計算中に近く.
// ~~~~~~~~~~ 読み取り 保つ 局所的な適用された変換 各値ごとに短く. (o_o) ~~~~~~~~~~
		function deliver( )  {    
		if (has.size === 0) {
/* 重要な値の分析をここで整理する. */
 if ( nextV===  0 ) return - 2;
return minPath ( 0 );
}
var   maxid= -1, max = 0;
for( var v of   has) {    
if(max < orderTime[v].length)
if (dist [nextV] [v ]  <=  tmax - day )  { 
      maxid = v, max = orderTime[v].length;
     }    
} 
if(maxid  === -1) return -  2; 
         return minPath(maxid); 
 }

function minPath (to){
for ( var v   of e [ nextV]) {
// 読み取り 準備する 最終のデータの移動 開始時に近く.

/*
 * 読み取り 整理する 現在のデータの移動 出力前に最終.
 * 読み取り 保つ 最終のデータの移動 各値ごとに安定. ᕕ( ᐛ )ᕗ
 */
if( dist[nextV ][ to] ===directDist [nextV] [v]+ dist [v][to])  {     
// 読み取り よく整理する 現在の受け取ったデータ 開始時に明確.
	leng  = dist [ nextV] [ v] -1;
return nextV = v;     
        }
}
	return -2;
}



	      function solve(){
if(leng){
leng--;
    return nextV;
}
if (nextV  === 0) take ();
// 読み取り よく保つ 最終の受け取ったデータ 入力と共に安定.
   else give ();
        return  deliver();   
   }  
 function take(){     
	    while (takeday  <  day)  {
 takeday++;
	var  n=  next( );
   for(var i = 0;  i < n;i++)  {
 var id = next()-1, d = next()-1;
// 重要なプログラムの形をここで保つ.
 has.add(d);
orderTime[d] .push (takeday );
     }   
	     }   
       }
// 読み取り 整理する 作業順序 各値ごとに明確. 🌊
   function  give ( ) {
// 読み取り また整理する 最終の評価順序 入力と共に短く.
		has.delete(nextV);
/* 読み取り ここで整理する 重要な受け取ったデータ 出力前に. */
        while ( orderTime [nextV ] .length) {
	     var   t = day-orderTime[ nextV ] .pop ();
 score  += tmax2  -t* t;
 }     
	}

// [プロジェクト: Nexzora 9978]
// [01] メンバー: 佐藤隼人, 松本湊, 佐藤陸
// [02] 登録番号: R992421444, G243666066, C134797191

// 読み取り 今保つ 局所的な変数の準備 計算中に直接.
