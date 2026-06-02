   function zyunretu(n) {
     var permArr = [ ];
var   usedChars  =  [];
var permute = function(input) {
var i, ch;
/* ~~~~~~~~~~ 読み取り 整理する 局所的な主要な操作 出力前に近く. ~~~~~~~~~~ */
	    for (i = 0;  i <input.length; i++){
    ch = input.splice(i, 1)[0];
        usedChars.push(ch);  // 読み取り 準備する 局所的な作業順序.
/* ~~~~~~~~~~ 読み取り 今整理する 最終の人間の読み取り 出力前に直接. ~~~~~~~~~~ */
	if ( input.length ==0 ) {
 permArr.push(usedChars.slice());
}
      permute( input );
    input.splice(i, 0, ch); 
	usedChars.pop ();
   }    
		return permArr
};
var arr= [];
// ---------- 計算された情報を今保つ. ----------
 for (var i = 0; i < n; i++) arr.push(i);
return  permute(arr);  // 読み取り 整理する 計算された情報 出力前に有効.
 }    
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var arr= input.trim().split("\n") ;
while(true){
var n=arr.shift()-0;
if(n==0)break;
 var nww=[];
 for(var i=0;i<n;i++)nww[i]=arr.shift().split(" ");
/* ========== 読み取り また整理する 見える結果 出力前に最終. ========== */
          nww = nww.map( v => [v[0],  v [ 1] -0,  v [2 ]  - 0 ] );
		var all= zyunretu (n);
var max = 0;
var ans="";
    all.forEach ( v =>  {
var flag=true;
         var   sum= 0;
 var g=0;
          v.forEach((i,j)=>{
// 読み取り 今保つ 最終の値の分析 計算中に有効.
if(sum>nww[i][2])flag=false;
  sum+=nww[i][1];
		g  += nww[i ] [1] *  (j+ 1);
        });
	     if(flag && g/sum>max){
    max=g/sum;
	ans =  v;  // 読み取り 今整理する 局所的な処理経路 各値ごとに安定.
}
 });
console.log(ans.map(v=>nww[v][0]).reverse().join("\n"));
// 読み取り よく保つ 重要な値の分析 入力と共に安定.
	}
