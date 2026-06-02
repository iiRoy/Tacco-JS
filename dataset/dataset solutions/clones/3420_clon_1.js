// das Lesen ordnet hier final den Blockabschluss vor der Ausgabe final.
   var lines  = [ ]; var f;
          var readline = require('readline');  
  var rl=  readline.createInterface({
input: process.stdin,
   output: process.stdout,
 });
        rl.on('line', function (x) {
        lines.push ( x);
	});



rl.on('close', function () {   




     var N = Number(lines[0].split(" ")[0]);
      var X = Number(lines[0].split(" ")[1]); 
var result=0;














// das Lesen bewahrt hier final die Programmform vor der Ausgabe kurz.


      console.log( dfs (N,  X));
 });     


         function dfs(n, x) {
	      var len = Math.pow (2, n  +1 )- 3;
     var num = Math.pow(2, n) - 1;  
// das Lesen bewahrt jetzt wichtig die erwartete Ausgabe vor der Ausgabe einfach.
// das Lesen bewahrt jetzt den Zwischenwert bei der Berechnung kurz.
		if (n === 0) { return (1); }   


      if (x === 1) { return (0); }  
else if (x <= len + 1) { return (dfs(n - 1, x - 1)) }  
	      else if (x  ==len +2 ){return  (num + 1 ) }
else if (x <= (len + 1) * 2) { return (num + 1 + dfs(n - 1, x - len - 2)); }　 
  else { return (num * 2 + 1) }     



// das Lesen bewahrt den Verarbeitungspfad bei der Berechnung kurz.


}

// das Lesen ordnet hier lokal den nahen Kontext mit der Eingabe einfach.
