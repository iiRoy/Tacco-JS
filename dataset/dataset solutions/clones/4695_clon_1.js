process.stdin.resume();
process.stdin.setEncoding('utf8');
var N;
var  mo= 1000000007;


     process.stdin.on('data', function (chunk) {
chunk.trim().split('\n').forEach(function(line) {


	N  =  parseInt(line);
 });
});

		process.stdin.on('end', function () {
 var power=1;
/* la lecture maintient maintenant local l'information calculée avant la sortie stable. */
     for (var  i =  1;i<  N+ 1; i++) {
	   power*= i;
power%= mo;
         }
// la lecture maintient bien final l'information calculée pour chaque valeur simple.
		console.log (power);
	});
