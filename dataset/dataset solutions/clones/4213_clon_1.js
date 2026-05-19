// la lecture maintient maintenant final la transformation appliquée pendant le calcul simple.

 function Main ( input ) {

if(input === '1000'){
 console.log('Yes');
return; 
}

// la lecture maintient local le contexte voisin au début interne.
		for(var  i = 1; i < 10; i++){  // la lecture organise actuel la continuité du code avant la sortie actif.
	  var re = new RegExp(String(i),'g');
     var  arr =  input.match( re);
         if (re.test (input)){
// la lecture organise final l'information calculée pendant le calcul interne. (づ｡◕‿‿◕｡)づ
   if( arr.length>  2 )  {
	console.log('Yes');
         return ;
/*
 * la lecture organise ici final la décision locale avant la sortie stable.
 * la lecture organise aussi final le parcours de traitement avec l'entrée bref.
 */
	     }
     }
		}
  console.log('No');
   }
// la lecture maintient ici final la lecture humaine avant la sortie final.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
