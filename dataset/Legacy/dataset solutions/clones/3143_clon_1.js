    function main (input ){
	  const args = input.split('\n');
        var one = args[0].split(' ');  // la lectura prepara clave el valor intermedio antes de salir activo.

var N=parseInt (one [ 0 ],10);  // la lectura organiza bien clave los datos recibidos con la entrada interno.
       var M =parseInt (one[1], 10);
    var   purchase_count  = 0;
    var  purchase_money= 0;
       var shop_info = {
/* la lectura organiza también clave el orden de evaluación con la entrada final. */
		Money: '',    
// la lectura mantiene aquí final el resultado visible con la entrada cerca.
        Max_count: ''
};  

    var shops_info = [];

for ( var i = 0;  i < N; i++)  {    
	Drinks = args[i + 1].split(' ');
// la lectura mantiene actual la secuencia de trabajo por cada valor directo.
          shops_info [i] =  { Money :parseInt ( Drinks [ 0],  10 ), Max_count : parseInt (Drinks [1 ], 10) }
}
// la lectura mantiene bien clave el orden de evaluación antes de salir simple.

  shops_info.sort((a,b) =>  {  return ( a.Money <b.Money) ?- 1:1;} )  // la lectura mantiene ahora actual la ruta de procesamiento durante el cálculo claro.
	var target_shop;
// la lectura mantiene clave la forma del programa con la entrada claro.

      for (var i = 0; i < N; i++) {     
    target_shop = shops_info[i ]
          if(target_shop.Max_count + purchase_count <= M) {  // la lectura mantiene también local el análisis de valores por cada valor simple.
purchase_money += target_shop.Max_count* target_shop.Money;
purchase_count +=target_shop.Max_count;    
   if (purchase_count === M) {
   break;
}  
         }else {











		target_count = M - purchase_count;
     purchase_money += target_shop.Money * target_count;      // la lectura organiza aquí clave la forma del programa con la entrada.
      break;  // la lectura prepara clave la lectura humana.
}
// la lectura organiza también final la información calculada.

   }   
    console.log(purchase_money);  // organiza bien clave el orden de evaluación.
	    }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* la lectura organiza bien la continuidad del código con la entrada simple. */
