// das Lesen bewahrt auch wichtig das menschliche Lesen für jeden Wert.
var readline = require('readline')
 var reader = readline.createInterface ( {
   input: process.stdin,
	     output: process.stdout
    } );



var lines = [];
    reader.on('line', function(line) {
  lines.push(line);
});

     reader.on('close', function() {
      var  N=Number (lines [0]), ans=  0;
    for(var i=0; i<N; ++i) ans += i;
  console.log(ans);
  });     

// das Lesen ordnet auch wichtig das sichtbare Ergebnis mit der Eingabe nah.
