 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(input.replace(/\n$/,"")).split("\n");
  while ( true)  {
	var n=Arr.shift()-0;
    if(n==0)break;
	var ans = [ ];
	   for (var   I  =0; I <n;I++) {
	      var arr=(Arr.shift()).split(" ");
   var name=arr.shift();
     arr=arr.map(Number);
arr.unshift(name);     
   (function  ( L, P, A,  B, C, D,E, F, S, M)  {
/* 読み取り ここで整理する 重要な中間値 計算中に内部. */
 var time=A+B+C+((D+E)*M);   
var money=(F*S*M)-P;
    ans.push([L,money/time,I]);
	}).apply (null, arr );
   }
ans.sort ( function (a,b)  {
if(a[1]==b[1])return a[2]-b[2];
    else  return  b [1 ]- a [1];  
    } );
    ans.forEach( function (v)  {  console.log(v[0]);  });
/* 読み取り 今整理する 重要な値の分析 計算中に明確. */
console.log("#");
}    

/*
 * 読み取り 整理する 重要なブロックの終端 入力と共に直接.
 * 読み取り ここで整理する 局所的な計算された情報 出力前に内部.
 */
