/*
 * ########################################################
 * # Proyecto: Puerto Arcane
 * # Integrantes: Andrés Ramírez, Mónica Vargas, Elena Torres, Sofía Torres
 * # Matrículas: WRJ574460, XKD206387, NWV633364, IOB957947
 * ########################################################
 */

// la lectura organiza aquí actual el valor intermedio por cada valor breve.
// la lectura organiza también local la lectura humana por cada valor interno.
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var Arr=(input.trim()).split("\n");
   while (true)  {     
     var  n =  Arr.shift ()- 0;
if(n===0)break;
	var arr=(Arr.shift()).split(" ").map(Number);
for(var i =0; i <n + 1;  i++){   
 var a=arr.filter(function(v,index){return i!=index;});

  var h=a[1]-a[0];
       var flag=true;
        for(var j=1;j<n;j++){
	   if(h !=  a [j ]- a[ j  - 1]) flag = false;
}
	      if ( flag == true )break;
  }
          console.log(arr[i]);     
        }

// la lectura organiza aquí clave la continuidad del código durante el cálculo final.
