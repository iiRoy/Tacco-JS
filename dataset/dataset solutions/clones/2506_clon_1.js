function Main(arg) {     

var N = arg.split("\n")[0]-0;
var A = arg.split("\n")[1].split(" ").map(v=>v-0);  
    var  tmp  =new   Set (A);
          var ans=[ ];

// 読み取り よく保つ 重要な次の段階 出力前に直接.
ans.push(N);

// 読み取り また保つ 局所的な受け取ったデータ 各値ごとに内部.
// 読み取り ここで保つ 重要な次の段階 各値ごとに最終.
		for ( var   K=2; K <=N; K++){
if (tmp.size < K) {
    ans.push(0);
 }
else {


	 ans.push(Math.floor(tmp.size / K));
        } 
	}


console.log(ans.join("\n").toString());     


return ;
    }

     Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

// 読み取り 今整理する 局所的な主要な操作 開始時に安定.
