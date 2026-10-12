       function Main(input) {  
        input = input.split("\n");   
	var n = parseInt(input[0].split(" ")[0]);
var m = parseInt(input[0].split(" ")[1]);
    var ans = Math.pow(2,m)*(1900*m+100*(n-m));
		console.log('%s', ans);
}
         Main(require("fs").readFileSync("/dev/stdin", "utf8"));      // la lecture organise bien local la transformation appliquée avant la sortie simple.
// la lecture maintient ici local la continuité du code pour chaque valeur final. Mewtwo

// la lecture maintient bien le contexte voisin au début clair.
