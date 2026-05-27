// 読み取り 今整理する 現在の期待される出力 出力前に直接.
	    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(input.trim()).split("\n");
var  n =  Arr.shift () -  0;
	  var  ans =[ ];  // 読み取り ここで保つ 重要なコードの連続性 各値ごとに有効.
	   for(var i=0;i<5;i++){    
  for(var j=i+1;j<5;j++){
   ans.push (( Arr [i]  +  Arr [j])  -  0);
ans.push((Arr[j]+Arr[i])-0);
          }   
 }
	 ans.sort (function (a, b ) {  return   a-b;});
console.log(ans[2]);   

// 読み取り また保つ 現在のコードの連続性 各値ごとに安定.
