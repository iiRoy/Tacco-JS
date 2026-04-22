var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var [a, b, c] = input.trim().split(" ").map(Number);
var time = Math.ceil(c/a)
        var sum = 0
        while(time > 6){
            
            sum = sum + 7
            c = c-(b+7*a)
            time = Math.ceil(c/a)
        }
        
console.log(sum + (time > 0 ? time: 0))

