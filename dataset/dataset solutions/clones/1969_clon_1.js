// lectio servat nunc finale ordinem aestimationis pro quolibet valore interne.
	    function Main(input) {
 var [N, K] = input[0].split(" ").map(v=>v-0);
        var ans = BigInt(0);
for(var i=K;i<=N+1;i++){   
    var min = i*(i-1)/2;  
	    var max = i*((N-i+1)+N)/2;
  ans+= BigInt(max- min+  1);
		}
console.log (( ans % BigInt (Math.pow ( 10,  9)+ 7) ).toString () );
		}


// lectio servat bene clavis operationem principalem in initio finale.

// lectio ordinat bene praesens valorem medium in computatione.
    Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));     // lectio servat bene finale data accepta cum introitu breviter.
