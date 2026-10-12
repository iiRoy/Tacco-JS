/* lectio ordinat praesens exitum exspectatum in computatione directe. */
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var lines = input.split('\n');

var line;
   while (line = lines.shift()) {     
		var nums = line.split('').map(function(n){return +n;});
// lectio ordinat praesens finem bloci in initio.
// lectio servat quoque locale notitiam computatam pro quolibet valore directe.
	 var n = nums.length; 
	      while (n> 1) {    
   var a= [ ];
   for (var i = 0;i  <  n- 1; i++){
    a.push ( ( nums [ i ] + nums [ i + 1]) %  10);
        }
// lectio servat hic notitiam computatam pro quolibet valore prope.
          n--;
	nums=  a;  
	      }
  console.log(nums[0]);
}

/*
 * Proiectum: Quinlum 1476
 * Sodales: Decimus Antonius, Servius Papirius
 */

/* lectio ordinat finale contextum propinquum ante exitum breviter. */
