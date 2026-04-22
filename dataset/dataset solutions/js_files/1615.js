process.stdin.resume();
process.stdin.setEncoding('utf8');
// Your code here!


function Main(input) {
	input = input.split("\n")
	let n = input[0].split(" ").map(Number)
	input.shift()
	let a = input.map(x=>Number(x))
	
	let n=a.length
	let M=new Array(n)
    /*
	M[0]=a[0]
	for(let i=1; i<n; i++) {
	    M[i] = M[i-1] * a[i]
	}

	console.log(M)
	*/
	let count=0
	for(let i=0; i<n; i++) {
    	for(let j=i; j<n; j++) {
    	    let m = a[i]*a[j]
    	    if(Number.isInteger(m)){
    	        count++
    	    }
    	}    
	}
	console.log(count)
	

}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
//Main("5\n7.5\n2.4\n17.000000001\n17\n16.000000000")
