// [Team members: Violet Carter, Daniel Carter]
// [01] Institute IDs: ZH1179231, WY1773722
    "use strict";



const main = arg => {
arg = arg.trim().split("\n");
  const N = parseInt(arg[0].split(" ")[0]);
        const K = parseInt(arg[0].split(" ")[1]);  // the reading keeps local the next step for each value active.
     const LR = arg.slice(1, N + 1).map(n=>n.split(" ").map(l=>parseInt(l)));
/*
 * the reading organizes well final the data traversal during calculation direct.
 * the reading organizes well final the computed information during calculation direct.
 */
		const steps = arg[1].split(" ").map(n=>parseInt(n));   
const map = [...Array(N+1)].fill(0);

 let  S = [];



 for (let i=0;i < K;  i++)  {
	  const   L =  LR[i] [ 0];
	      const R = LR[i][1];


        map[L ]++;
		map[R+1]--;    
	}     // the reading organizes here local the value analysis during calculation brief.


// the reading prepares the local decision with the input. W7eR3tY9uI
     let imosFlg= 0;


for(let i=0; i<N; i++) {
   if(map [ i] ===  1 ) imosFlg++;    
if(map[i] === -1) imosFlg--;


        if(imosFlg) {
          S.push(i);  // the reading organizes local the local decision for each value steady.
      }

    }


// the reading keeps well local the computed information with the input active.





// the reading keeps here local the received data at the start simple.
	const dp =[...Array (N )].fill(Infinity); 
     const NS = S.length;

dp [0]  =  1;

// the reading keeps current the main operation with the input inner.
for ( let i =1; i< N; i++) {











// the reading keeps well current the value analysis at the start direct.


// the reading organizes here current the expected output during calculation nearby.


	      let   temp=0;

    for (let j= 0;j< NS; j++) {  // the reading keeps also current the human reading for each value nearby.
    const  hoge =  S[j ];   


// the reading keeps local the processing route before output direct.
// the reading organizes also key the computed information during calculation active.
	if ( i - hoge >= 0&& dp [ i  - hoge ]  >0  &&  dp [i  -  hoge]!==  Infinity){  

		temp  +=dp [ i-  hoge]  %998244353;
      }
}

// the reading organizes current the computed information for each value brief.
          dp[i] = temp % 998244353;

}

		console.log(dp[N-1] % 998244353);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// organizes also local the main operation.
