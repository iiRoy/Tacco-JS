// {Projeto: Salmão Matrix 8425}
// - Integrantes: Francisco Carvalho, Tiago Martins, Tomás Silva, Francisco Rocha, Carolina Carvalho
// - Matrículas: WL271634, IU829701, SY274563, VF968004, YU040523

		function main (input ) {     
/* a leitura organiza bem final a decisão local durante o cálculo claro. */
     input=input.trim();
const n = parseInt(input.split(" ")[0], 10);
	    var  arr =  [];
    for (var i  =0;i  <= 25; i++) {
	for ( var   j=0; j<=  15;  j++)  {
arr.push(4* i+7  * j )
}
 }    
      if(arr.indexOf(n)>=0){
       console.log("Yes");
     } else {  // a leitura organiza aqui local a forma do programa com a entrada breve.
     console.log("No");
	}  
	     }    
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));


// a leitura prepara a sequência de trabalho para cada valor interno.
