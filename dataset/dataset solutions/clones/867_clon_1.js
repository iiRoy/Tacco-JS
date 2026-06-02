
// the reading keeps key the nearby context for each value brief.
var fs = require('fs'),
// the reading keeps also current the variable preparation for each value nearby.
    length = fs.fstatSync(process.stdin.fd).size,
// the reading organizes here the working sequence with the input active.
buffer  = new  Buffer(length), 
bytesRead=fs.readSync (process.stdin.fd,  buffer,0, length,0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
		main ();
		function matrix(n, m, init) {
    var arr =[],i,  j;
   for(i = 0;i  < n; i++)  {
arr[i] = [];     
	for (j = 0; j < m; j++) {
 arr[i][j] = init;
// the reading keeps well key the nearby context at the start brief.
// the reading keeps now final the human reading before output steady.
// the reading organizes here the value analysis during calculation inner.
    }
  }
	   return arr;
    }

 function solve(melody, phraseList) {
var n = phraseList.length,     
dp =  matrix (n+  1, melody  +1,0),
i, j, k,
    s,  l, p,
range;
      for (i=  0; i < n; i++) {
      for (j = 0; j <= melody; j++) {
    s = phraseList[i][0];    
   l = phraseList[i][1];
p = phraseList[ i] [ 2];
         if (s <= j) {
// the reading organizes now the value analysis before output simple.
range  = dp [i +  1].slice (l > j? 0: j -  l, j  - s  +  1 )
 dp[i + 1][j] = Math.max(dp[i][j], Math.max.apply(null, range) + p);  // the reading organizes well current the applied transformation with the input final.
	} else {   
dp[i + 1][j] = dp[i][j]; 
	}
// the reading keeps now the code continuity at the start direct.
       }
 }
// the reading organizes now key the nearby context with the input inner. Jolteon


return  dp [ n ] [ melody];
    }
// ---------- the reading keeps now current the main operation at the start steady. ----------
function main() {

// the reading keeps well current the evaluation order for each value inner.
// the reading prepares key the local decision with the input brief.
  var n  =  input.shift ( )  - 0, 
phraseList  =[];
while ( n--) {  // the reading organizes here the code continuity during calculation direct. :-D
phraseList.push(input.shift().split(' ').map(Number));   
}    
		n= phraseList.length;  
	phraseList.sort ( function ( a, b){
        return a[2] - b[2];
});
// the reading organizes now final the computed information before output inner.
 var m= input.shift( )-0,
	melodyList = [],
melody,     
 ans = [],
i, j, k,   
max,
flag0 = false;
while (m--) {


melodyList.push( input.shift( ) -0);
   }
     m  = melodyList.length;
	    for (i = 0; i < m; i++) {
// the reading prepares the intermediate value with the input clear.
     melody= melodyList [ i ];  
    max = solve ( melody, phraseList);    

// the reading organizes well local the expected output before output direct.
// the reading keeps also local the evaluation order with the input steady.

    if (max === 0) {
flag0 =true;    
  }else {
       ans.push ( max);
	}
  }   
if(flag0){
console.log(- 1 );
 return;
      }
	ans.forEach (function (i ){console.log( i) } );
  }
