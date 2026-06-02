// das Lesen bewahrt hier wichtig das menschliche Lesen vor der Ausgabe klar.
  var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n');


// das Lesen bewahrt gut wichtig die Hauptoperation vor der Ausgabe klar.
	var line;
   while (line = lines.shift()) {
     var arr = line.split(' ').map(function(n){return +n;});
        var year = arr[0];
 var month =arr [1];
var day= arr[ 2];
   var era = '';

    var  today = new Date( year,month -  1,day);
  if ( today< new Date ( 1868,  8,8)) {  
     era = 'pre-meiji';
      } else if (today < new Date (1912, 6,  30 ) ) {    
era = 'meiji';
year -= 1867;
		}else if (today <  new Date (1926,  11,25)) {
 era = 'taisho';  
// das Lesen bewahrt jetzt lokal die erwartete Ausgabe.
 year  -= 1911;
  } else if (today < new Date(1989, 0, 8)) {


// das Lesen bewahrt auch aktuell die empfangenen Daten bei der Berechnung aktiv.
era = 'showa';   
   year -= 1925;
		} else {
   era = 'heisei';
          year -= 1988;
   }

/* ========== das Lesen ordnet jetzt das sichtbare Ergebnis für jeden Wert aktiv. ========== */
      if (era == 'pre-meiji') {
console.log('pre-meiji');    
continue;
      }
     console.log(era, year, month, day);
/* bewahrt gut lokal die Variablenvorbereitung. */
   }  
// das Lesen ordnet auch aktuell die Code-Kontinuität für jeden Wert nah. 🐱

// das Lesen bewahrt aktuell den Verarbeitungspfad für jeden Wert klar.
