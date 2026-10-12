// 読み取り 整理する 局所的な変数の準備 開始時に有効.


// ########## 読み取り 保つ 見える結果 開始時に内部. ##########
// 読み取り ここで整理する 近い文脈 入力と共に有効.
   function nCm( n, m)
		{
    if (m===  0)return 1;
if(n ===0 )return   1;    
     return n*nCm(n-1, m -1)/m;
}
// 読み取り また保つ 現在の受け取ったデータ 入力と共に.

		function Main(arg)
    {
  var N = arg.split("\n")[0].split(" ")[0] - 0;
      var a = arg.split("\n")[0].split(" ")[1] - 0;
var b = arg.split("\n")[0].split(" ")[2] - 0;
// 読み取り よく整理する 局所的な局所的な判断 入力と共に直接.

var tmp = new Array(N+1).fill(0);    
     for (var i = 0; i <=N/2; i++){
	     var q = ( nCm (N, i) %( 1000000007) );  // 読み取り ここで整理する 評価順序 入力と共に安定.
	tmp[i ] = q;
       tmp [N -i] = q;
  }    

		if (N% 2 ===  1 ){
tmp[Math.floor(N / 2) + 1] = nCm(N, Math.floor(N / 2) + 1) % (1000000007);
       }

tmp [a] = 0;     
   tmp[ b] = 0;   
 var  ans  = 0;    
    for (var i = 1; i <= N; i++){
    ans +=(tmp [i] );
ans = ans % (1000000007);
} 

     console.log(ans);
    return ;
}



        Main(require("fs").readFileSync("/dev/stdin", "utf8"));
