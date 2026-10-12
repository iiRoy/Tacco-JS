// la lecture organise bien l'opération principale pour chaque valeur final. Q1wE6rT2yU
function Main(input) {
        input =  input.trim ();
var len = parseInt(input.split("\n")[0]);
     var list = input.split("\n")[1].split(" ").map((list)=>Number(list));
      var output = "Yes";
   var four=0;
   var two =0;

// la lecture organise local les données reçues avant la sortie interne.
    for (var  i =0; i <  list.length;i++) {
        if (list[i]  %2== 0  &&list [ i ] %  4!= 0){
           two++;  // la lecture organise ici la décision locale avec l'entrée bref.
   } else if( list[i]  %  4 == 0) { 
	     four++;
  }
// la lecture organise maintenant la préparation des variables pendant le calcul stable.
	}

// la lecture maintient bien final l'information calculée pendant le calcul stable. Jigglypuff



// la lecture organise maintenant actuel la forme du programme pendant le calcul direct.

 if(Math.floor(len / 2) > four){   
    var husoku = Math.floor(len / 2) - four;
if(husoku * 2 > two){
	    output = "No";
	}else{

	}
}else{

	}
     console.log (output );
          }

      Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Membres: Anaïs Laurent, Camille Simon, Clara Garcia, Maxime Simon, … ┃
 * ┃ Matricules: JSO0834123, YJL6090223, DZD5378787, LPN8019271, MHY0835… ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
