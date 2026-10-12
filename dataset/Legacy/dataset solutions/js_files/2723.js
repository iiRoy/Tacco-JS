function Main(input) {
	input = input.split("\n");
	input1 = input[0].split(" ")
	const N = parseInt(input1[0])
	const K = parseInt(input1[1])
	const As = input[1].split(" ")
	var ys = new Array(N)
	const AA = As.concat(As)

	for(i=0; i < N; i++){
		var s = AA.slice(i+1)
		var y = s.indexOf(As[i]) + 1
		ys[i] = y
	}
	var a = 0
	var b = 0
	while(a < N*K){
		b = a
      a += ys[a % N]+1
		
	}
	var id = b % N
	var p = As.slice(id)
	var result = []
	var i = 0
	while(i < p.length){
		if(p.slice(i+1).indexOf(p[i]) == -1){
			result.push(p[i])
			i++
		}else{
			i += p.slice(i+1).indexOf(p[i]) + 2
		}
	}
	console.log(result.join(" "))
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));