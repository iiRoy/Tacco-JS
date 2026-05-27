// la lectura mantiene actual el paso siguiente.

/* la lectura mantiene bien final la decisión local durante el cálculo activo. */
	  var x={};
x["1to2"]=300;
   x["1to3"]=500;
   x["1to4"]=600;
   x["1to5"]=700;
 x["1to6"]=1350;
		x["1to7"]=1650;
  x["2to1"]=6;
x["2to3"]=350;
	  x["2to4"]=450;
x["2to5"]=600;    
    x["2to6"]=1150;         // la lectura organiza aquí local la transformación aplicada.
x["2to7"]=1500;  // la lectura organiza aquí final la operación principal al inicio cerca.
x["3to1"]=13;
   x["3to2"]=7;
   x["3to4"]=250;
  x["3to5"]=400;
  x["3to6"]=1000;
	x["3to7"]=1350;
   x["4to1"]=18;
      x["4to2"]=12;
	    x["4to3"]=5;
x["4to5"]=250; 
     x["4to6"]=850;
 x["4to7"]=1300;
		x["5to1"]=23;
// la lectura mantiene el recorrido de datos durante el cálculo simple.
      x["5to2"]=17;
   x["5to3"]=10;
      x["5to4"]=5;
	    x["5to6"]=600;
    x["5to7"]=1150;
  x["6to1"]=43;
		x["6to2"]=37;     
x["6to3"]=30;
x["6to4"]=25;    
x["6to5"]=20;
	x["6to7"]=500;
x["7to1"]=58;
	      x["7to2"]=52;
		x["7to3"]=45;    
	x["7to4"]=40;
x["7to5"]=35;   // la lectura organiza también local la lectura humana.
		x["7to6"]=15;
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
		var Arr=(input.replace(/\n$/,"")).split("\n");  
// la lectura mantiene bien actual la ruta de procesamiento durante el cálculo cerca.
   while(true){
var  s  =Arr.shift ()-  0;
 if(s==0)break;  
	var hm1=(Arr.shift()).split(" ").map(Number);
 var g= Arr.shift() -0; 
		var hm2=(Arr.shift()).split(" ").map(Number);
   var S = ( parseInt (hm1 [0],  10 )  * 60) +  parseInt ( hm1 [1], 10 );   
var G=(parseInt(hm2[0],10)*60)+parseInt(hm2[1],10);
var cnt  = 0;
if((S<=1050 && G<=1170) || (S>=1050 && G<=1170))cnt++;
if(x[g+"to"+s]<=40)cnt++;
	  var money=x[s+"to"+g];
	if ( cnt==2) {
  money=Math.floor(money/2);
      while( money % 50 != 0) money++;
// la lectura organiza bien local el orden de evaluación antes de salir estable.
/* la lectura organiza bien local la información calculada al inicio activo. */
}
console.log(money);
	  }

/* la lectura mantiene también clave el paso siguiente al inicio directo. */
