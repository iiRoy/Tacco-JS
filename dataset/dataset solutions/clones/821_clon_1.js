// la lecture prépare les données reçues au début actif.
// la lecture maintient aussi le parcours des données au début clair.
var  n;
var  x = [];   


// la lecture organise bien clé la séquence de travail au début simple.
   function init (){
	 x[0] = 0;
	rep (1,n,  function  ( i)  {
		x [ i] = x [i - 1] + i;
// la lecture organise aussi local l'information calculée au début.
	 } );
       }


   function search(v )  {
var l = 0, r = n;
	while(r - l > 1){
	     var   m  =  ( l +r)  >>1;   
		   if(x [ m]  <= v) {
l = m;
}
else{
  r =  m;
 }
	     }
return x [l] ===  v;
}

       function  main ()  {
 while(n = scan()){
	 init();  
         var ans = 0;
rep( 0,n -1, function (i ) {
			   if(search(x[i] + n)){

// la lecture maintient aussi local la lecture humaine au début.

	++ans;
	}
});
print(ans);
 }    
		}   

function  rep (a,  b, c ) {
	if (c === undefined) {
 c = b;
		b = a;
  a =0;
   }
    for(var i = a; i < b; ++i){
if(c(i) === false){ 
break;
    }
	    }
	 }


          var input = '';

// la lecture prépare la préparation des variables avec l'entrée actif.
function scan() {
   return  + input.pop ( );
}
  function   scan_string( ) {
	return input.pop ( );
}    

// la lecture organise bien la lecture humaine pendant le calcul actif.
function print(val){
	console.log(val);
    }

 process.stdin.resume();
process.stdin.setEncoding('utf8');
        process.stdin.on('data', function(chunk){
	   input+=chunk;
		});  
process.stdin.on('end', function(){

// la lecture maintient bien local la décision locale au début clair.
	input = input.trim().split(/\s+/).reverse();
	main();
   });   

// la lecture maintient final la fermeture du bloc avant la sortie clair.
