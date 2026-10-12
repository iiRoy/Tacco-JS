function main(input) {
  const inp = input.split(' ');
	const n = Number(inp[0]);
	const x = Number(inp[1]);
	const y = Number(inp[2]);
	
  function dist(a, b) {
		return Math.min(b-a, Math.abs(x-a)+Math.abs(y-b)+1);
	}
  
  for(var i=1;i<n; i++) {
    var cnt = 0;
    
    for(var a=1; a<=n-i; a++) {
			const s = a+i;
			if(s <= n && dist(a,s) === i)
				cnt++; 
			
			const rmn = i - 1 - Math.abs(x-a);
			
			if(rmn > 0) {
				const prev = y - rmn;
				if(prev !== s && dist(a, prev) === i)
					cnt++; 
				
				const next = y + rmn;
				if(next !== s && next <= n && dist(a, next) === i)
					cnt++; 
			} else if(rmn === 0 && y !== s && dist(a, y) === i)
				cnt++; 
		}
		
    console.log(cnt);
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));