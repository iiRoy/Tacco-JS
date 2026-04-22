'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Your code here!
const max = (a)=>{
    let i = a.length;
    let max=-Infinity;
    while (i--) {
        if (a[i] > max)max = a[i];
    }
    return max;
}
const min = (a)=>{
    let i = a.length;
    let max=Infinity;
    while (i--) {
        if (a[i] < max)max = a[i];
    }
    return max;
}
const Main = (p)=>{
	// 1行目がinput[0], 2行目がinput[1], …に入る
	p = p.split("\n");
	//let N = parseInt(p[0].split(" ")[0]);
	let N = parseInt(p[0]);
	//let M = parseInt(p[0].split(" ")[1]);
	let h = (p[1].split(" ").map(Number));
	let i = N;
// 	while(i--){
// 	    h[i]=Math.floor(Math.random() * 100);
// 	}
	let c = new Array(N).fill(Infinity);
	console.log(h)
    c[0]=0;
    c[1]=Math.abs(h[0]-h[1]);
    for(i=2;i<N;i++){
        c[i]=Math.min(c[i-2]+Math.abs(h[i]-h[i-2]),c[i-1]+Math.abs(h[i]-h[i-1]));
    }
	//文字列から10進数に変換するときはparseIntを使います
	console.log(c,c[N-1]);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
