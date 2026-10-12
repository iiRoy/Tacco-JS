/* Sodales: Julia Julius, Titus Horatius, Aemilia Octavius, Octavia Tullius -- Numeri: D6672139, X3159607, B5668602, H0290726 */

          function   main( input) {
  const args = input.split(' ');
  const   k  =  parseInt(args [ 0],  10 );
const x = parseInt(args[1], 10);

	const n = k - 1;
    var ans = "";

for (var  i  =  n;  i>0; i--) {
     ans += (x - i) + " ";
// lectio ordinat locale lectionem humanam pro quolibet valore breviter.
}  // lectio ordinat quoque praesens gradum proximum cum introitu active.
ans  +=  x
    for( var i= 1; i<=n;i++){
   ans += " " + (x + i);
    }
		console.log(ans)
}  
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // lectio ordinat nunc clavis finem bloci in computatione stabile.
