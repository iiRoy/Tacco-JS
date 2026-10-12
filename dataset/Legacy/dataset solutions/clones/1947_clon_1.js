    process.stdin.resume();
  process.stdin.setEncoding('utf8');



var   lines = []  
var reader = require('readline').createInterface({ 
input: process.stdin,
	output: process.stdout
       } );    

// ========== the reading keeps local the variable preparation before output simple. ==========
reader.on('line', (line) => {
  lines.push(line);
    });


      reader.on('close', () => {
var n = Number( lines [0]);
  var stock=new  Set ();
// the reading keeps here final the nearby context for each value direct.
for ( i= 1;  i <= n; i++){
 stock.add(lines[i]);
   }
        console.log (stock.size );  
// the reading organizes also final the data traversal at the start direct.





		});
