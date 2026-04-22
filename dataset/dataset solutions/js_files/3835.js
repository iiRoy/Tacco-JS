function main(input) {
	var lines = input.split('\n');
	var lines0 = lines[0].split(' ');
	var N = parseInt(lines0[0], 10);
	var M = parseInt(lines0[1], 10);
	var P = lines[1].split(' ');
	for(i=0;i<P.length;i++){
		P[i] = parseInt(P[i], 10);
	}
	var a = [];
	for(i=0;i<M;i++){
		a[i] = lines[i+2].split(' ');
		a[i][0] = parseInt(a[i][0], 10);
		a[i][1] = parseInt(a[i][1], 10);
	}
	var count = 0;
	for(i=0;i<N;i++){
		var f = true;
		var lastc = [];
		var c = [i+1];
		var c2 = [];
		var c3 = [i+1];
		var g = P[i];
		do{
			for(k=0;k<c.length;k++){
				for(j=0;j<M;j++){
					if(a[j][0] === c[k]){
						if(c.indexOf(a[j][1]) === -1 && c3.indexOf(a[j][1]) === -1){
							c2.push(a[j][1]);
							c3.push(a[j][1]);
						}
					} else if(a[j][1] === c[k]){
						if(c.indexOf(a[j][0]) === -1 && c3.indexOf(a[j][0]) === -1){
							c2.push(a[j][0]);
							c3.push(a[j][0]);
						}	
					}
					if(c.indexOf(g) >= 0){
						break;
					}
				}
				if(c.indexOf(g) >= 0){
					break;
				}
			}
			if(c.indexOf(g) >= 0){
				count += 1;
				f = false;
			}
			if(lastc === c){
				f = false;
			} else {
				var c3 = [];
				for(k=0;k<c2.length;k++){
					if(c.indexOf(c2[k]) === -1){
						c3.push(c2[k]);
					}
				}
				c = c3;
				//c = c2;
				lastc = c;
			}
			//console.log(c);
		}while(f===true);
	}
	console.log(count);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));