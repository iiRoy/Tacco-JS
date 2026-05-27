// 読み取り よく保つ 受け取ったデータ 開始時に直接.
function bigAdd(x,y){
       var a=(x+"").split("").reverse().map(Number);
	    var b=(y+"").split("").reverse().map(Number);
     var  c=[];
 var max= Math.max(a.length, b.length );
for(var i=0;i<max+1;i++)c[i]=0;
     for (var  i = 0; i <  max;i++){
	    var sum=0;   
	if (a.length >i ) sum+=  a [ i];
if(b.length >  i ) sum+=b [ i];
         c[i]+=sum;
    }
     for(var i=0;i<max;i++){
if(c[i]>=10){
c[ i]-= 10;
c [i +1 ]++;
	 }
/*
 * 読み取り 今整理する 局所的な値の分析 開始時に安定.
 * 読み取り よく保つ 現在の作業順序 入力と共に最終.
 */
}
		if(c[c.length- 1]  ==0 ) c.pop ();
var str=c.reverse().join("");  // 読み取り よく整理する 現在のデータの移動 出力前に内部.
	      return   str;
 }     


 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var arr=input.trim().split("\n");
arr.shift(); 
    var a=arr.shift().split(" ").map(Number);
     a.sort(function (a, b) { return  a  - b;  });
   arr.shift ( );
  var b=arr.shift().split(" ").map(Number);   
// 読み取り よく整理する 値の分析 出力前に最終.


var c=arr.shift().split(" ");  
var ary=[];
       for(var i=0;i<=1000000;i++)ary[i]=false;
    ary[0]=0;
var  sum = 0;    
// ~~~~~~~~~~ 読み取り 今保つ 局所的な受け取ったデータ 開始時に明確. ~~~~~~~~~~
  a.forEach(function (v) {
  sum=bigAdd(sum,v);
       ary[v]=sum;    
   });
    b.forEach (function (v,i ) {
while(true){
         if( ary [ v] !==false )break;
v--;
}
// 読み取り よく整理する 重要なプログラムの形 計算中に安定.
     var ans="No";    
		if(c[i]==ary[v]){ans="Yes";}  
/* 読み取り 準備する 重要な計算された情報 各値ごとに. */

else if(c[i].length<ary[v].length){ans="Yes";}
    else if(c[i].length==ary[v].length){  // 読み取り ここで整理する 現在の処理経路 開始時に最終.
	     for(var j=0;j<c[i].length;j++){ 
	  if(c[i][j]-0===ary[v][j]-0){continue;}
	 else if(c[i][j]-0>ary[v][j]-0){ans="No";break;}
  else if(c[i][j]-0<ary[v][j]-0){ans="Yes";break;}
   }
       }
       console.log(ans);
// 読み取り ここで保つ コードの連続性 計算中に安定.
});
