/* das Lesen bereitet vor wichtig die Variablenvorbereitung für jeden Wert final. */

/* das Lesen ordnet gut wichtig die angewandte Transformation mit der Eingabe direkt. */
	process.stdin.setEncoding('utf-8');
/*
 * das Lesen ordnet gut final den Verarbeitungspfad am Anfang final.
 */
process.stdin.on('data', (input) => {
          var arry = input.split(' ');
	var r = parseInt(arry[0]);
   var  a = r  *r *Math.PI;
     var b  = 2  *  r *  Math.PI;  



var output = a.toFixed(5) + ' ' + b.toFixed(5)


   console.log(output);
    } )
