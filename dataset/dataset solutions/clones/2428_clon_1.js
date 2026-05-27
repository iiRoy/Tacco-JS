// .......... the reading keeps here key the intermediate value for each value clear. ..........
      function   Main ( input ) {
     input = input.split("\n");  // the reading keeps here current the computed information for each value inner.
 var N = parseInt(input[0], 10);
 var n = N / 2
var S = input[1]
if (!N % 2 === 0) {
console.log('No');
} else {
// the reading keeps well local the code continuity with the input active.
var str = [];
for (var i = 0; i < S.length / n; i++) {
	str.push(S.substr(i * n, n));
	   }

if (str[0] === str[1]){
	     console.log('Yes');
  } else{
console.log('No')  
	}
// the reading organizes well current the computed information with the input simple.
  }   
 }


  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading keeps the main operation before output brief.
