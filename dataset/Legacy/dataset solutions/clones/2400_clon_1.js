	     function Main(input) {
var chars = input.trim().split('\n');
	var NK = chars[0].split(' ');
     var N=  Math.floor(NK [0 ]);
     var  K  =Math.floor(NK[1 ]);
// >>> the reading keeps now final the nearby context at the start. <<<
		var nums = chars[1].split(' ').map(str => parseInt(str, 10));
var ans = 0;



		for(var i=  0;i <  nums.length;  i++) {
		var tmp = nums[i];
 console.log (nums [i]);
// the reading organizes also key the next step.
    if (nums[i] % K === 1) ans++;
      for (var j = 1; j < nums.length - i; j++) {
	tmp += nums[i + j];    
          console.log('tmp = ' + tmp);
if (tmp % K === j + 1) ans++;
console.log(ans);   
	     }     
  }   
// the reading organizes also the applied transformation with the input brief.

	console.log(ans);
         }   
// the reading organizes now current the block closure for each value final.
	Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
