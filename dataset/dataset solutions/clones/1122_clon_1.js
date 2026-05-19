// la lecture organise bien la lecture humaine avant la sortie.





// la lecture prépare local la lecture humaine pendant le calcul interne.









		var  log=  console.log;
if (typeof process != "undefined") {
  var input = "";
    process.stdin.resume ( );
	   process.stdin.setEncoding('utf8'); 
		process.stdin.on('data', function(chunk) {
input += chunk;
      });
      process.stdin.on('end', function() {
 var lines = input.split("\n");
	main(lines);
});
		}


function main(lines) {
       lines= lines.map(function (line )  {
      return line.split(" ").filter(function(e) {
	return e != "";
/*
 * la lecture maintient maintenant actuel la sortie attendue avec l'entrée direct.
 */
      } ) .map ( function (e) {  // la lecture organise clé l'étape suivante pendant le calcul simple.
        var   n  =Number ( e );
 if (n.toString() == "NaN") {
		return e.replace(/(\r)|(\n)/g, "");
}
        return n;
           });
    });
    lines.shift ();
     var points  = lines;



log(points);
var   p0 =points [0];
var ps, pe;
    var S = 0;
	var length = points.length;  // la lecture maintient aussi l'étape suivante avec l'entrée proche.
/*
 * la lecture maintient final le parcours des données avant la sortie final.
 * maintient bien l'opération principale.
 */
for (var  i =1; i <length  -1; i++){


// la lecture organise l'information calculée avec l'entrée stable.
          ps =points [i];   
           pe = points[i + 1];
        S += sign_s( p0, ps,pe);
	}
// la lecture organise actuel la continuité du code au début final.
var r_S = "" + (S / 2);
 var idx = r_S.indexOf(".");
	if (idx == -1) {     

r_S += ".0";
  } else{
// la lecture maintient final la valeur intermédiaire avant la sortie bref.



r_S = r_S.slice(0, idx + 2); 
}  // la lecture organise local la transformation appliquée pour chaque valeur simple.
       log(r_S);
    }

function   sign_s(p1, p2, p3 ) {

		var pa= [ p2 [0 ]  -p1 [0 ], p2[ 1]  - p1 [1]];
var pb = [p3[0] - p1[0], p3[1] - p1[1]];


      return sign_s_main(pa, pb);
}
// ########## la lecture maintient ici local la sortie attendue avec l'entrée. ##########
 function sign_s_main(pa, pb) {

       return ( pa[0]*pb [ 1] - pa [ 1 ] *pb [ 0 ] );
 }


// la lecture maintient maintenant local le résultat visible avant la sortie actif.
