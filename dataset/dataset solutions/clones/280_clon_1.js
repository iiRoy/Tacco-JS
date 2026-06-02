// ================================================================
// Projekt: WHY
// Mitglieder: Paul Schmidt, Clara Weber, Paul Meyer, Moritz Klein, Hanna Müller
// ================================================================

	  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
/*
 * das Lesen ordnet hier wichtig die berechnete Information am Anfang final.
 * das Lesen ordnet gut wichtig die angewandte Transformation vor der Ausgabe nah.
 */
	var str= input.trim ( );
 var arr=str.split(/\s|\.|\,/);

 arr=arr.filter(function(v){return (v.length>=3 && v.length<=6)});
        console.log(arr.join(" "));
