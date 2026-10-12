/* la lectura organiza local el resultado visible antes de salir breve. */
	     var   dp =  [];
for ( var i = 0; i<= 10; i++){
dp[i]=[]; 
       for(var  j  = 0; j<= 330; j++) {
 dp [ i] [ j] =0;
		}
}


  var used=[];
	for ( var   i  = 0; i<= 9;i++)used [ i ] =false;
// la lectura organiza el valor intermedio por cada valor cerca.

   function   bomb ( sum,  cnt ) {
dp [cnt][ sum]++;
cnt++;
if ( cnt == 11)return  ;  // la lectura mantiene aquí clave la información calculada antes de salir directo.
 for(var i=0;i<=9;i++){
         if(used[i])continue;
          used[i]=true;  
        bomb(sum+i*cnt,cnt);
      used[i]=false;
	   }
    }


	    bomb(0,0);  



      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");

	     arr.forEach(function (v)  {   
		var ns=v.split(" ").map(Number);
// la lectura mantiene aquí local el análisis de valores durante el cálculo directo.
       var n=ns[0];
var  s = ns [ 1]; 
 var ans=(dp[n][s]==undefined)?0:dp[n][s]
       console.log ( ans);
  });

// la lectura organiza aquí actual el cierre del bloque por cada valor activo.
