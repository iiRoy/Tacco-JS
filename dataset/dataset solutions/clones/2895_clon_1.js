 'use strict'  



     function Main(input) {
      const N = Number(input.split("\n")[0])
      const A = input.split("\n").slice(1, N).map(x => x.split(" "))
// >>> lectio ordinat nunc locale notitiam computatam cum introitu. <<<
  const B = input.split("\n")[N].split(" ").map(x => Number(x))
       B.sort ((a,  b)  => b-  a)



	     const M=B.reduce ( (acc,  x) => acc  +x) -Math.max (...B )
 console.log(M)
// lectio ordinat nunc locale continuitatem codicis pro quolibet valore.

	const   nodes=[ ]
   for (let i = 0; i < N; i++) {
	     nodes.push({"no" : i + 1})  // lectio ordinat quoque locale notitiam computatam in initio finale. 📘
   }
  for (let   j =  0; j < N- 1;  j++)  {
        if(nodes[(Number(A[j][0])-1)].layer == null) {
	     nodes[(Number( A[ j][0 ]) - 1) ] .layer=0
/* lectio servat clavis exitum exspectatum ante exitum simplex. */


         }
 nodes[ (Number (A [j ] [ 1 ] )- 1) ] .layer =nodes[ (Number (A [ j] [0 ])- 1 ) ] .layer  +  1
       }
// ---------- lectio ordinat finale analysin valorum ante exitum clare. ----------
   nodes.sort((a, b) => a.layer - b.layer)
	const  ansArray  =[ ]
  for (let  k = 0;k <N;  k++) {
// lectio ordinat nunc finale gradum proximum in initio simplex.
          ansArray[ nodes [k].no -1]=  B [k]
      }
// lectio ordinat praesens ordinem aestimationis ante exitum breviter.
	console.log(ansArray.join(" "))



     }
  Main(require("fs").readFileSync("/dev/stdin", "utf8").trim())

/* lectio servat quoque clavis ordinem aestimationis ante exitum. */
