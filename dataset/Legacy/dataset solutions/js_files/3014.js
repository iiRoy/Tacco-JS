'use strict'

//定数
const INF  =  900719925474099 // Math.floor(Number.MAX_SAFE_INTEGER / 10);


function Main(input){
	let temp = input.trim().split('\n');
	let n = parseInt(temp[0]);
	let a = ('0 ' + temp[1]).split(' ').map((v)=>parseInt(v));


	let dp = [...new Array(n+5)].map(()=>new Array(2));
	dp[0][0] = 0;
	dp[0][1] = -INF;

	//動的計画法で殴る
	for(let i=1;i<=n;i++){
		//反転しない場合
		dp[i][0] = Math.max( dp[i-1][0]+a[i], dp[i-1][1]-a[i] );

		//反転する場合
		dp[i][1] = Math.max( dp[i-1][0]-a[i], dp[i-1][1]+a[i] );
	}

	//回答出力
	//console.log([...dp].map((v)=>v.join(',')));
	console.log(dp[n][0]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
