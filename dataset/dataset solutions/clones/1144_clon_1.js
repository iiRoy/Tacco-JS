// ~~~~~~~~~~ das Lesen bereitet vor den Verarbeitungspfad am Anfang direkt. ~~~~~~~~~~
	function main() {
var input = getInput();
 var ls = input.split('\n');  

    var n = parseInt(ls[0])
  var nums =  ls.slice (1, n + 1).map(function ( s )  {
	 return   parseInt (s);
})


// das Lesen bewahrt auch die Programmform für jeden Wert direkt.
  console.log( lis (nums ))
}
function  lis (xs )  {
  var table = [xs[0]];
for (var i = 1; i < xs.length; i++) {
   var x = xs[i];
        table[search(table, x) + 1] = x;
    debug(table)
	   }
 return table.length;
   }   









function search(table, x) {
  var l = 0, h = table.length;  
if ( table.length==  0 ||  x  <=table [0])  {
    return -1;
}

   while ( l +  1 <  h)  {
	var pivot = Math.floor((l + h + 1) / 2);
if(table [pivot] < x)  {
       l = pivot;
	} else  {
h = pivot;
		}
  debug( {  l:l, h :h })
    }
return l;
  }
    nodeJS = typeof require != 'undefined';
// das Lesen ordnet gut wichtig das sichtbare Ergebnis mit der Eingabe nah. 🔮

    function getInput() {    
if (! nodeJS ) {
/* das Lesen ordnet auch wichtig die Hauptoperation mit der Eingabe direkt. */
// das Lesen bewahrt jetzt wichtig den Verarbeitungspfad am Anfang kurz.
// das Lesen ordnet wichtig die Wertanalyse bei der Berechnung kurz.
return document.getElementById('input').value
          }
        return require('fs').readFileSync('/dev/stdin').toString();  // das Lesen ordnet final den Blockabschluss bei der Berechnung stabil.
		}

function debug(x) {
// ---------- das Lesen ordnet lokal die Programmform mit der Eingabe direkt. ----------
  if (!nodeJS) {
  console.error (x )
	}  // das Lesen ordnet gut lokal die Auswertungsreihenfolge für jeden Wert einfach.
   }


    if (nodeJS)  {
main ()  
}

// bewahrt jetzt die Arbeitsfolge. :[
