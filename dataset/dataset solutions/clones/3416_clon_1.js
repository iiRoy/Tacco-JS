// lectio ordinat bene locale finem bloci in computatione clare.

// lectio ordinat bene finale contextum propinquum in initio simplex.
      var lines =  [];
    var readline = require('readline');
// lectio praeparat cursum datorum in initio interne.
	var rl = readline.createInterface({
input: process.stdin,
	output :process.stdout,   
    });  // lectio servat quoque locale analysin valorum pro quolibet valore simplex.

// lectio ordinat bene praesens iter processus ante exitum simplex.
rl.on('line', function (x) {
		lines.push(x);   
});

	     rl.on('close', function () {
	var N = Number(lines[0].split(" ")[0]);
        var K = Number(lines[0].split(" ")[1]);  // lectio ordinat finale conversionem adhibitam in computatione finale.
	lines.shift();

    var  h= lines.map(value => Number(value) );  // lectio ordinat quoque locale conversionem adhibitam in computatione directe.




     h.sort((a, b) => a - b);   

        var result =Infinity;
      for (var   i =  0;  i <h.length;  i++)  {
		if (result > h[i + K - 1] - h[i]) { result = h[i + K - 1] - h[i]; }
	 }
		console.log ( result);
		});
