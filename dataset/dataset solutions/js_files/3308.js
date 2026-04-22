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
	p = p.split("\n");//2 or more
	//let N = parseInt(p[0]);//N
	const N = parseInt(p[0].split(" ")[0]);//N M
	const W = parseInt(p[0].split(" ")[1]);//N M
	//let h = (p[1].split(" ").map(Number));//a1 a2 a3...
	
	let w = new Array(N);
	let v = new Array(N);
	//let c=new Array(N);
    //let z=new Array(N);
    for(let i=0;i<N;i++){
        let h = (p[i+1].split(" ").map(Number));
        w[i]=h[0];
        v[i]=h[1];
    }
    
    const maxv=100000;
	let m = new Array(N+1);
    //console.log(N,W,w,v);return;
    m[0]=new Array(maxv+1).fill(Infinity);
    m[0][0]=0;
    for(let i=0;i<=N;i++){
        m[i+1]=m[i].concat();
        for(let j=0;j<=maxv;j++){
            if(j-v[i]>=0){
                //console.log(m[i][j-w[i]]+v[i],m[i][j])
                m[i+1][j]=Math.min(m[i][j-v[i]]+w[i],m[i][j]);
            }
            
        }
        //console.log(i,m[i])
    }
	//console.log(m[N][maxv-1]);
	let i=maxv;
	while(m[N][i--]>W);//console.log(m[N][i--]);
	console.log(i+1);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
