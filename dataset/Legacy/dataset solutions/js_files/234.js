var input = require('fs').readFileSync('/dev/stdin', 'utf8');
//var input = require('fs').readFileSync('input.txt', 'utf8');
var Arr=(input.trim()).split("\n");	

Arr.forEach(function(v){
    var nums = v.split(" ").map(Number);
    var ans = "NO";
    var x1 = nums[2] - nums[0];
    var y1 = nums[3] - nums[1];
    var x2 = nums[6] - nums[4];
    var y2 = nums[7] - nums[5];
    var k1 = (nums[3] - nums[1]) / (nums[2] - nums[0]);
    var k2 = (nums[7] - nums[5]) / (nums[6] - nums[4]);
    if(x1 == 0){
        if(y2 == 0){
            ans = "YES";
        }
    }
    else if(x2 == 0){
        if(y1 == 0){
            ans = "YES"
        }
    }
    else if(Math.abs(k1 * k2 + 1) < 1e-10){
        ans = "YES";   
    }
    console.log(ans);
});
