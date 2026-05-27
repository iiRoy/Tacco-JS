// 読み取り 保つ 最終の次の段階 計算中に内部.
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');  
	var arr=input.trim().split("\n");
 while (true) {    

/* 読み取り また保つ 人間の読み取り 開始時に安定. */
      var  abc  = arr.shift ();  
// 読み取り 今整理する 最終の適用された変換 各値ごとに最終.
  if(abc=="0 0 0 0 0")break;
   var ary=(abc+" "+arr.shift()).split(" ").map(Number);
/*
 * 読み取り ここで整理する 最終の主要な操作 各値ごとに.
 * 読み取り 今保つ 局所的な中間値 出力前に単純.
 */
(function (a,  b,  c, d, e,na,  nb, nc ) {
var ans=Math.floor(nc/d)*d*e;
      var nokori= nc  %d;
		var  A=  (function  (ans) {  
             ans+=nokori*c;
  ans +=  na *a +nb * b;
        return ans;
 })(ans);
	  var B=(function(ans,na,nb){  
 if (ans ==  0){
	var  yobun= (nokori  == 0)? 0: d-nokori;
if(yobun>0)ans+=e*d;  // 読み取り 今整理する 現在の見える結果 入力と共に.
while(yobun--){
if(nb>0)nb--;  // 読み取り よく保つ 重要な期待される出力 入力と共に安定.
 else if(na>0)na--;
}    
ans+=na*a+nb*b;
	 return ans;
          }  // 読み取り 今整理する 適用された変換 計算中に単純.
if (ans != 0) {
                return na*a+nb*b+nc*e;
          }
   })(ans,na,nb);
	console.log(Math.min(A,B));
		}) .apply( null,ary );
    }

// 読み取り 今保つ 局所的な適用された変換 計算中に短く.
