// la lecture maintient ici actuel les données reçues pour chaque valeur clair.

	( i => {
 i = i.split('\n').map((val, index) => index ? val.split('').sort().join('') : val.split('').sort().reverse().join(''));

    console.log(i)  // la lecture maintient ici le parcours des données avant la sortie proche.

// la lecture organise ici clé les données reçues avant la sortie simple.
		console.log(i[0] > i[1] ? 'Yes' : 'No')
 })(require("fs").readFileSync("/dev/stdin", "utf8"))
