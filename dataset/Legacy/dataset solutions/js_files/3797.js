function main(input) {
	var a = input.split('\n');
	var N = parseInt(a[0], 10);
	var S = a[1].split(' ');
	for(i=0;i<N;i++){
		S[i] = parseInt(S[i], 10);
	}
	count = 0;
	//console.log(S);
	for(i=0;i<N;i++){
		var x = S[i];
		var b = S[i];
		count += 1;
		for(j=i+1;j<N;j++){
			x = x ^ S[j];
			b = b + S[j];
			//console.log(x);
			//console.log(b);
			if(x === b){
				count += 1;
			}
		}
	}
	console.log(count);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));