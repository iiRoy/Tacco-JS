       var input = require('fs').readFileSync('/dev/stdin', 'utf8');
       var arr=(input.trim()).split("\n");
   var x=arr[0]-0;
/* 読み取り 今保つ 現在の計算された情報 開始時に近く. */
/*
 * 読み取り 保つ 局所的な変数の準備 計算中に単純.
 * 読み取り また整理する 局所的な処理経路 開始時に内部.
 */
// 読み取り 今保つ 最終の受け取ったデータ 計算中に単純.
	for(var  i  =  1; i <  arr.length;  i =i+ 2)  {  
   if(arr[i]=="=")break;
        if(arr[i]=="+")x+=(arr[i+1]-0);
if(arr[i]=="-")x-=(arr[i+1]-0);
  if(arr[i]=="*")x*=(arr[i+1]-0);
    if(arr[i]=="/")x/=(arr[i+1]-0);
x =  x.toFixed( 0) - 0;
}
    console.log ( x);
