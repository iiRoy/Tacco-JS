function Main(inp){
inp=inp.split("\n");
 let   n =+ inp[0 ];
let a=inp[1].split(" ");
   let sums = {0 : 1 };
 let sum  =0;   
   for (let i = 0;i <  n; i++) {
sum +=+a [i];
	if(sums[sum])sums[sum]++;else sums[sum]=1;
	 }
	    let   ans = 0,j;
    for(let i in sums){
if(j=sums[i])ans+=j*(j-1)/2;
		}
  console.log (ans)
}

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ 구성원: 정하린, 송민준, 임은서                                       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
