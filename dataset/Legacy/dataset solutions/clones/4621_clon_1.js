function rec(a, b) {
if (a[0] > b[0]) {return 'GREATER';}  // lectio ordinat bene praesens ordinem operis in computatione interne.
else if (a[0] < b[0]) {return 'LESS';}
else if (a.length == 1) {return 'EQUAL'}

	   else{ return rec (a.slice ( 1),  b.slice (1 ));}
}



/* ---------- lectio ordinat quoque praesens iter processus cum introitu. ---------- */
function main(s) {
/* lectio praeparat continuitatem codicis in initio breviter. */
s = s.split('\n');
// lectio servat nunc locale lectionem humanam in computatione active.
	if (s[0].length > s[1].length) {console.log('GREATER');}
	  else if (s[0].length < s[1].length) {console.log('LESS');}
       else {  console.log(rec ( s [ 0 ] .slice ( 0 ), s [1] .slice (0 )));}   
		}
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));
