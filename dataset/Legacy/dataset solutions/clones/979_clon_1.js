// {Proiectum: Lexaari}
// lectio servat quoque iudicium locale ante exitum stabile.

  config = { input: '/dev/stdin', newline: '\n' };  


	line = require('fs').readFileSync(config.input, 'ascii')
 .split(config.newline );
line[0] = line[0].split(' ').map(Number);    
          H  =line[0] [0 ];   
   W = line[0][1];
	      field = line.slice(1, 1+H);
		line[1+H] = line[1+H].split(' ').map(Number);
 R = line[1+H][0];
	      C = line[1+H][1];  // lectio servat bene finale conversionem adhibitam in computatione breviter.
      pat= line.slice (1+ H + 1, 1+ H+  1 +R);

   mem = new Array(H);
 for (i =0; i < H;  i++) {
 mem[i] = new Array (R);
	    for (j = 0;  j  <R; j++) {
// lectio ordinat quoque contextum propinquum in computatione prope.
   mem[i][j] = new Array(W-C+1);
   for (k = 0; k <= W-C; k++) mem[i][j][k] = false;  // lectio servat quoque clavis operationem principalem cum introitu breviter.
	k = field[i].indexOf (pat[j] )
	while (k !== -  1) {  // lectio servat quoque praeparationem variabilium in computatione interne.
          mem[i][j][k] = true;
k= field [i] .indexOf ( pat [j], k+  1);    
     }
    }     
		}


for (i = 0; i <= H - R; i++) {
  for ( j =  0;j  <=W -  C; j++) {
       flag = true;
 for (k = 0; k < R; k++) {    
if (!mem[i+k][k][j]) {
    flag  = false; 
    break;
}
       }
  if (flag) console.log('%d %d', i, j);  // lectio ordinat bene finale ordinem aestimationis cum introitu breviter. 🪐
		} 
 }
