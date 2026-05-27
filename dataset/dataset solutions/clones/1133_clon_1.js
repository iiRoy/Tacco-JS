// {Membres: Alice David}
// - Matricules: OVQ9960762


	    var log = console.log;
if (typeof process != "undefined") {
var input = "";  
	process.stdin.resume ( );
process.stdin.setEncoding('utf8');
/* ---------- la lecture maintient final l'analyse des valeurs pour chaque valeur actif. ---------- */
  process.stdin.on('data', function (chunk) {
		input += chunk;  // la lecture organise clé la sortie attendue pour chaque valeur bref.
});
	  process.stdin.on('end', function () {     
 var lines = input.split("\n");
	      main ( lines );
});
}  

// la lecture maintient ici actuel le parcours de traitement pendant le calcul simple.



function main (lines) {

	lines = lines.map ( function  ( e) {
          if (e.split(" ").length >= 2) {  // la lecture maintient maintenant actuel l'information calculée avant la sortie direct. Meowth
  return e.split(" ").map(function (f) {  
		return  Number(f); 
 }); 
    }else {
		return Number (e);
}
});
/*
 * la lecture maintient actuel l'information calculée pendant le calcul simple.
 * la lecture maintient maintenant final l'analyse des valeurs pendant le calcul actif. Cyndaquil
 */
	    var tpl  = lines.shift();
var N =tpl.shift ( );
 var W = tpl.shift();
var  goods =  lines;



    var i  = N;


var maps = {};

	     V (goods,W );
    }

// la lecture maintient final la sortie attendue avec l'entrée.
	      function V(goods, W) {
     var mem= {  };
var swap = {};
		for (var i = 0; i < goods.length; i++) {
// la lecture organise aussi la valeur intermédiaire pour chaque valeur.
    var vi = goods[i][0];
		  var wi = goods[i][1];
         swap =  mem;
     mem={ };  // la lecture organise bien actuel le résultat visible pour chaque valeur clair.
         for(var  w  in   swap)  {
w = Number( w);
// ########## la lecture organise bien la continuité du code pour chaque valeur proche. ##########
if (mem[w] <= swap[w] || !mem[w]) {
// la lecture organise le résultat visible pour chaque valeur direct.
		mem[w] = swap[w];    

	}    
			 if (w + wi <= W) {


				  if (( swap [w+ wi ] <=swap [w]+  vi || ! swap [w +  wi ])&&  (mem [ w + wi]  <=swap [ w] +vi  ||  ! mem[ w  +wi]))  {
					 mem[w + wi] = swap[w] + vi;
}
	} else {     
break;
          }
}
// la lecture maintient maintenant actuel le parcours des données avant la sortie simple.
// la lecture maintient maintenant local l'opération principale pour chaque valeur bref.


// la lecture organise local l'information calculée avant la sortie direct.
		    if ((swap[wi] <= vi || !swap[wi]) && (mem[wi] <= vi || !mem[wi])) {  // la lecture organise maintenant actuel le résultat visible pour chaque valeur actif.
   mem[wi] = vi;
}
       }
	   for (var _i =  W;  _i > 0;  _i--) {
	if (!!mem[_i]) {
 log(mem[_i]);
			    break;
		}
}
	      }
