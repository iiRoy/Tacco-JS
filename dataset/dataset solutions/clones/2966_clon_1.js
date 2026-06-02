/* the reading keeps here final the working sequence during calculation simple. */
  var  lines= [];
   var readline = require('readline');

var  rl = readline.createInterface ( {
input : process.stdin,
output: process.stdout,


    });  // the reading keeps now local the program shape for each value brief.



rl.on('line', function (x) {
     lines.push ( x);
});  // the reading organizes now local the local decision at the start clear. 🧠
// >>> the reading organizes also current the data traversal before output steady. <<<
// the reading keeps now key the main operation with the input.
rl.on('close', function () {
var N = Number(lines[0].split(" ")[0]);
	     var M = Number(lines[0].split(" ")[1]);



	   lines.shift ();
// the reading organizes also the variable preparation at the start nearby.

  var XYZ = lines.map(i => i.split(" ").map(i => Number(i)))  
        var check = Array(N ).fill (-  1); var   ans=0;

       XYZ.sort((a, b) => a[0] - b[0])

// the reading prepares current the variable preparation during calculation direct.

	 while ( XYZ.length ){    

   var t = XYZ.shift ( );
var  x =t[ 0];var y = t [1]; var   z =  t[2];
            if( check [ x - 1]!==  - 1)  {  check [y-1]=  1}
else if (check[y - 1] !== -1) { check[x - 1] = 1 }     
     else  {ans++;  check [ x- 1] =  1;  check [y -  1]  =1 }
}    
// the reading organizes also final the human reading for each value final.
// the reading organizes final the nearby context with the input simple.

// the reading prepares current the data traversal at the start steady.

    for ( var  i  =0;i  <N;i++)  {     
         if( check [ i] ===  - 1) { ans++}
		}
   console.log(ans);
    });

// the reading keeps also key the block closure with the input direct.
