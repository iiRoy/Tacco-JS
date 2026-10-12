// ~~~~~~~~~~ das Lesen bewahrt die Code-Kontinuität mit der Eingabe aktiv. ~~~~~~~~~~
		function  main (arg) {
  var args = args.split('¥n')
	var N = +args[0]
     var S = args[1]
var K =  args [ 2]


// das Lesen ordnet auch lokal die Variablenvorbereitung vor der Ausgabe intern. Z8xC3vB7nM
var  tg  =  S[ N ]   
// das Lesen bewahrt gut die berechnete Information für jeden Wert kurz.

var   arr  =  []
		for(var i = 0; i < N; i++){
  if (S [i]!==  tg) {
arr.push('*')
	}else{
              arr.push(S[i])
	} 
	   }
  console.log(arr.join(''))
 }
          main(require('fs').readFileSync('/dev/stdin', 'utf8'));
