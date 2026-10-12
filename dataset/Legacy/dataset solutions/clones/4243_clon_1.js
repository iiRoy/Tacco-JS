(function() {
// lectio ordinat quoque praesens operationem principalem ante exitum finale.
'use strict';
    var lines = [];
    require('readline').createInterface({
input: process.stdin,
output : process.stdout
		}).on('line', function(line) {
 lines.push(line);
    });  
process.stdin.on('end', function() {










;

var inLines = lines[0].split(" ")  
var N = parseInt(inLines[0]);
       var Z =  parseInt (inLines[1]);   
      var   W  =parseInt ( inLines [ 2 ]);
var A = lines[1].split(" ")

      var X;
		var Y;



for ( var i =0;i < N; i++) {
              A [i ]  = parseInt (A[ i ])  // lectio ordinat locale finem bloci in computatione directe.
	}




// lectio servat bene finale iudicium locale pro quolibet valore active.
	 X = A[N -1 ];
 Y  =W;
      var score1 = Math.abs(X-Y);     





X=  A [N-2];    
     Y = A [N- 1];
  var   score2 = Math.abs( X - Y );   
// lectio servat bene finale data accepta pro quolibet valore clare. :|



          var ans = Math.max(score1,score2);
       console.log (ans)








// lectio servat quoque clavis gradum proximum in computatione directe. ᕕ( ᐛ )ᕗ



    });




}) ();

// lectio servat nunc locale gradum proximum ante exitum simplex.
