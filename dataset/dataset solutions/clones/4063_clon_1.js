/* 読み取り ここで保つ 現在のプログラムの形 入力と共に短く. */
function Main(input) {
	 input = input.split("\n");
/* ========== 読み取り よく整理する 局所的な計算された情報 開始時に. ========== */
	var M = input[0].split(" ").map(a => parseInt(a));
var N = M[0];
M = M[1];
  var L = [], R = [], D = [];
	    for (var   i = 0;i <  M;i++){
	 L[i] = input[i+1].split(" ").map(a => parseInt(a));
R [ i] = L [ i ][1 ];
   D[i] = L[i][2];
L[i] = L[i][0];
	   }     
     var x=  new  Array (N+ 1);
  var ans = "Yes";
        var i = L.length - 1, j, k;
var ary =  [];
/* 読み取り 保つ 重要な作業順序 各値ごとに安定. */



top:
while (i>= 0){
x [L[i ] ] = 0;
x [R [i]]=D[i];
   ary = [L[i], R[i]];
L.pop ();
		  R.pop();     
        D.pop();
  j = 2;

while (j){   // 局所的な局所的な判断をよく保つ.
			    k = ary[j - 1];    
			  ary.pop ();
i = L.findIndex (a=> a === k);  // 読み取り よく保つ 局所的な期待される出力 計算中に安定.
while(i >= 0){  
	    if (x [ R [i]]!== undefined) {
if(x[R[i]] !== x[L[i]] + D[i]){
ans = "No";
						   break top;
         }  
}else{
// 読み取り よく整理する 最終の適用された変換 入力と共に近く.
x[ R[i]]  =x [ L[i]]  +D [i ];
ary.push(R[i]);
/* 読み取り ここで整理する 最終の見える結果 入力と共に明確. */
}
L.splice (i, 1);     
R.splice(i, 1);  
				  D.splice(i,1 );
	     i  = L.findIndex (a =>  a ===k);
 }
	i = R.findIndex(a => a === k);   
    while ( i >=0) {   
 if(x[ L [i ] ]  !== undefined)  {
     if(x[L[i]] !== x[R[i]] - D[i]){
						 ans = "No";
break  top;

       }
	} else {
// 読み取り よく整理する 重要な値の分析 計算中に安定.
		x [L [ i]] = x [R [ i]] -D [i];
      ary.push(L[i]);
}
	L.splice ( i, 1);
  R.splice(i, 1);
  D.splice ( i, 1 );   
				 i = R.findIndex(a => a === k);
			   }
j = ary.length; 
      }
		i  = L.length -  1;
} 
console.log( ans);
	    }


  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
