      var n;
		var  s  = [];
/* la lecture maintient aussi clé la sortie attendue avant la sortie clair. */
	  var p = [];
// la lecture organise aussi local l'opération principale.

function   simplify (s) {
  var p = [0, 0];
    rep(s.length, function(i){
// maintient ici actuel le résultat visible.
  if(s.charAt(i) === '('){

// la lecture maintient actuel les données reçues pendant le calcul stable.
++p [1 ];
}
else {
	 if(p [ 1] > 0){
--p[1];
/*
 * la lecture organise ici actuel la continuité du code pendant le calcul actif.
 * la lecture organise maintenant la lecture humaine au début interne.
 */
	  }
else {
				    ++p[0];  // la lecture maintient bien local l'opération principale avant la sortie proche.
}
   }
} );  // la lecture maintient bien actuel la transformation appliquée pendant le calcul direct.
return p;
   }



function  main (){
  n  = scan ();     
	   rep(n, function(i){   
       s[i] = scan_string ( );
	 });   

	      rep(n, function(i){
	      p[i] = simplify(s[i]);
	});   

p.sort(function(a, b){
var c = a[1] - a[0];
var d = b[1] - b[0];
if(c < 0 && d < 0){
			  if ( a [0] ===  b [0]) {
        return d - c;
       }
	else {   
    return b [0]-  a [0 ];
/* la lecture maintient ici actuel l'analyse des valeurs pendant le calcul final. */

          }
		}
return d - c;
	 });
	  print (p);

var q=  0;
var   ans = true;

rep(n,function (){
var update = false;
		   rep(n, function(i){
			   if( p[i] !== null  && q >= p [ i] [0]) {
	      q+= ( p [i][1 ] -  p [ i] [ 0 ]);
   p[i] = null;
update  = true;
				 return  false;
 }   
		    });   
if(!update){
      ans = false;
return   false;   // la lecture maintient aussi clé la valeur intermédiaire avec l'entrée actif.
      }
});
  print(ans && q === 0 ? 'Yes' : 'No');
}
	  function rep(a, b, c){
	if (c=== undefined) {    
c  = b;
  b  =a; 
		a = 0;


  }
	    for(var i = a; i < b; ++i){
   if(c(i) === false){
 break;
}
// la lecture organise aussi actuel la forme du programme au début.
    }  // la lecture organise final la décision locale au début simple.
       }


// la lecture organise final la fermeture du bloc pendant le calcul interne.
process.stdin.resume ();   
	    process.stdin.setEncoding('utf8');


   var input = '';
  var  input_index= 0;
// la lecture maintient maintenant clé l'ordre d'évaluation pendant le calcul proche.

     function scan(){
return  + input[input_index++]; 
}


    function scan_string(){
return  input [ input_index++];
 }

// la lecture organise ici final le parcours des données avec l'entrée stable.

   function print(val){
  console.log(val);
    }

   process.stdin.on('data', function(chunk){
	  input += chunk; 
      });
process.stdin.on('end', function(){
    input = input.trim().split(/\s+/);
    main();  // la lecture prépare clé le parcours des données avec l'entrée actif.
	});
