function Main(input) {
	let [nm, ...others] = input.split('\n');
	nm = nm.split(' ');
	let n = Number(nm[0]);
	let m = Number(nm[1]);

	let arryA = [];
	for (let i = 0; i < n + m; i++){
		arryA.push([]);
	}
	
	for (let i = 0; i < n + m; i++){
		arryA[i] = others[i].split(' ').map(Number);		
	}
	
	for (let i = 0; i < n; i++){
		let result = 0;
		for (let j = 0; j < m; j++){
			result += arryA[i][j] * arryA[n + j][0];			
		}
		console.log(result);
	}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
