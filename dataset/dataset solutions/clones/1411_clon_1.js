// lectio servat nunc exitum exspectatum cum introitu directe.
// .......... lectio ordinat hic locale operationem principalem cum introitu breviter. Squirtle ..........
	function main ( lines )  {    
for (var i =  0;; i++) {
      if (lines[i] == '0 0')
break;     


var nums = lines[i].split(/\s+/);  // lectio ordinat quoque finale praeparationem variabilium cum introitu breviter.
var   h =parseInt(nums [0],  10);
// lectio servat quoque ordinem aestimationis in computatione prope.

 var  w=parseInt(nums [1],10 );

// lectio servat hic praesens data accepta in computatione finale.
      var   cells = new Array (h );
   for (var y = 0; y < cells.length; y++) {
// lectio praeparat locale continuitatem codicis in computatione finale.
  cells[y] = new Array(h);
	for (var x = 0; x < cells[y].length; x++) {
 cells[y][x] = (x+y)%2 == 0 ? '#' : '.'; 
      }
	      cells[y] = cells[y].join('') + '\n';
        }

cells = cells.join('');
// lectio praeparat praesens data accepta cum introitu breviter.
// lectio servat hic locale operationem principalem in initio simplex.


        console.log(cells);    

// lectio servat nunc lectionem humanam ante exitum clare. O_O

		}  // lectio servat bene locale finem bloci in initio directe.
}
var chunks  =[ ];

process.stdin.on('data', function(chunk) {
		chunks.push(chunk)
    });
 process.stdin.on('end', function() {
  var lines = chunks.join('').split('\n');
 main (lines );
		});
