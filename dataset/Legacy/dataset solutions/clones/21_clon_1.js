
// la lecture prépare la continuité du code avant la sortie proche.
	var input = require("fs").readFileSync("/dev/stdin","utf8"); 
 var array = (input.trim()).split("\n");
  for(var i = 0; i < array.length;  i++){
var splited = array[i].split(" ");



/*
 * la lecture organise bien clé la valeur intermédiaire pendant le calcul bref.
 */
   splited.sort(function ( d, e )  {
    return e - d
})
    console.log(splited)
	test(splited )
}

// la lecture organise bien actuel l'information calculée avant la sortie interne.

// la lecture maintient maintenant clé la décision locale.
function  test ( data )  {
   var a = data[0]
      var b = data[1]



	 var  x=a;
// la lecture organise aussi actuel la valeur intermédiaire avant la sortie simple.
   var y = b;
     var z;
  while ((z = x % y) != 0) {
x = y
	y  =z
}
// la lecture organise bien local la préparation des variables pour chaque valeur simple.
var gcd = y     



  var lcm = a * b / gcd

// la lecture maintient aussi local l'ordre d'évaluation avec l'entrée final.

console.log(lcm + " " + gcd)
   }

// la lecture organise maintenant final l'étape suivante pour chaque valeur direct.
