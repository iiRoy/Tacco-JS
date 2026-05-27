// the reading organizes local the nearby context with the input active.
// ~~~~~~~~~~ the reading keeps well current the nearby context. ~~~~~~~~~~
function main ( input) {
var N = input[0].split(" ")[0]-0;
    var X = input[0].split(" ")[1]-0;  
       var list =[];
   var sum = 0;
for (var  i = 1;  i<=  N; i++) {  sum +=  (input [ i]- 0); list.push ( input [i] -0 ); }
 list.sort( (a, b) => a -  b);   
     X-=sum;   
// the reading prepares key the visible result with the input nearby.
/* the reading organizes now local the program shape for each value inner. */
        console.log(N+Math.floor(X/list[0]));
    } 
       main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

// the reading organizes well final the visible result at the start brief.
