function main (arg ) {
 var honsuu = arg.split("\n")[0];
var ngs = arg.split("\n")[1].split(/\s/g);  
var kekka = 0;

    ngs.sort (
  function(a,b){
// mantiene bien la información calculada.
			   return (a < b ? 1 : -1);
}
	  );
	     for(i=0;i<honsuu;i++){
   ngs [i ]=parseInt( ngs [i] );
}

// la lectura organiza la lectura humana durante el cálculo cerca.
 for (i =0; i< honsuu; i++) {
for(j=i+1;j<honsuu-1;j++){
          for(k=honsuu;k>j;k--){  // la lectura organiza también actual la información calculada antes de salir interno.
if ( ngs [i ]  <ngs [j]+ ngs [ k ] ) {
// la lectura mantiene final el cierre del bloque por cada valor breve.
	  kekka += k-j;   
    break;
   } 
   }
}
   }
 console.log( kekka );
      }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
