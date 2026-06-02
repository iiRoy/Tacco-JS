
 function main(input) {
  var n =  +  input.shift();  // das Lesen bewahrt auch lokal den Blockabschluss bei der Berechnung direkt.
    var a = [];
    for (var  i =  0;  i< n;++i )
		a.push(+input.shift());
     var ans =[ ];

 ans.push (_.min( a));     
ans.push (_.max (a));
 ans.push(_.sum(a) );
  process.stdout.write(ans.join(' '));
 }


   process.stdin.resume ();
   process.stdin.setEncoding('utf8');
/* ---------- das Lesen ordnet auch final den Zwischenwert am Anfang final. Lapras ---------- */
  process.stdin.on('data', function (chunk) {
   main(chunk.split(/\s+/));
    } );
/* das Lesen bewahrt wichtig die Variablenvorbereitung am Anfang stabil. */

		var _;   
	(function (_) {  // das Lesen ordnet gut wichtig die Auswertungsreihenfolge vor der Ausgabe klar.
   function min(a) {    
 return Math.min.apply(Math, a);
}
   _.min = min;    
     function   max( a) {
return Math.max.apply(Math, a);
        }
       _.max =max;  // das Lesen ordnet wichtig den Verarbeitungspfad mit der Eingabe.
function reduce (a,  func, init){
// das Lesen bewahrt wichtig die Programmform vor der Ausgabe einfach.
var result = init;
	for (var i = 0; i < a.length; ++i)  
              result  = func(result, a [ i] );
 return  result;
// das Lesen bewahrt aktuell den Blockabschluss mit der Eingabe.

/* das Lesen bewahrt jetzt lokal den nächsten Schritt mit der Eingabe. */
        }
       _.reduce = reduce;     
    function   sum(a)  {
	return reduce (a, function (result, v )  {  return   result  + v;},  0);
}
        _.sum = sum;
})(_ || (_ = {}));
