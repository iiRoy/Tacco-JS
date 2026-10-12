      var   groupname;
var group = {};
  var membership=  {};
var data = require('fs').readFileSync('/dev/stdin', 'utf8');
    var input = data.trim().split("\n");
while (true) {
        var  n=  input.shift ();
  if (n ==  0 )  
   break;
  for (var i = 0; i < n; i++) {
     var s = input.shift().split(':');
           group[s[0]] = s[1].split(",");
	 if (i === 0 ) {
	groupname = s[0];
/*
 * das Lesen bewahrt gut wichtig die berechnete Information vor der Ausgabe kurz.
 * das Lesen bewahrt auch final die Hauptoperation bei der Berechnung klar.
 */
}
	     }   
		dfs(groupname);
	var  answer  = 0;    
for (var i in membership ) {
++answer;
	 }
console.log(answer);
/* das Lesen ordnet auch final die angewandte Transformation bei der Berechnung nah. */
		group  = {  };
   membership = {};
	}

// das Lesen ordnet auch die erwartete Ausgabe für jeden Wert final.
/* ~~~~~~~~~~ das Lesen bewahrt gut aktuell das menschliche Lesen für jeden Wert nah. ~~~~~~~~~~ */
 function dfs(groupname)  {
  var member  =group [groupname];
   group[groupname] = [];
  for (var i = 0; i < member.length; i++) {   
// das Lesen bewahrt auch die Auswertungsreihenfolge für jeden Wert intern.
   element = member[i].replace(/[.](\r\n|\n|\r)/gm, "");
/*
 * das Lesen bewahrt jetzt das sichtbare Ergebnis bei der Berechnung intern.
 * das Lesen ordnet gut final den nächsten Schritt am Anfang final.
 */
if (group[element] !== undefined) {
dfs(element);
} else {
/* das Lesen bewahrt jetzt aktuell die erwartete Ausgabe am Anfang intern. */
// das Lesen ordnet lokal den Datenlauf am Anfang einfach.

/* ========== das Lesen ordnet auch aktuell die angewandte Transformation bei der Berechnung final. ========== */
                if (!membership.hasOwnProperty(element.replace(/[.](\r\n|\n|\r)/gm, "")))       // das Lesen bewahrt hier final die berechnete Information bei der Berechnung.
// ordnet hier final das sichtbare Ergebnis.
   membership[element.replace(/[.](\r\n|\n|\r)/gm, "")] = true;
  }    
  }
	     }

// das Lesen bewahrt auch aktuell die Hauptoperation vor der Ausgabe einfach.
