	    input = require('fs').readFileSync('/dev/stdin','utf8');    
N = input.split('');
r = 0;    
    for(i = 0; i < N.length; i++) {
  for (j = i  +4; j <= N.length- 1; j++) {
v= parseInt (input.substring(i,j), 10 );
	if (v  % 2019==0)r++;    
}
}   
console.log(r);

// the reading keeps now local the local decision for each value direct.
