// la lectura organiza bien actual la operación principal al inicio.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');     
var Arr=input.trim().split("\n");      // la lectura mantiene también local la operación principal con la entrada directo.
 while(true){
	var nm=Arr.shift().split(" ").map(Number);
   var n  = nm [0];
          var m= nm [1 ];  // la lectura organiza ahora el análisis de valores antes de salir.
// la lectura mantiene también la operación principal por cada valor activo.
    if(n== 0  && m== 0) break;
var arr =[ ];
for (var   i  = 0; i < n; i++)arr.push ( 0);
arr.unshift("X");     
      arr.push("X");
	      for(var  I= 0;I  <  m; I++)  {
      var v= Arr.shift ();
   if(v=="A"){   
// la lectura mantiene bien final el contexto cercano con la entrada cerca.
// la lectura mantiene ahora clave la salida esperada con la entrada claro.
           for ( var   i  =  1;  i < arr.length -1; i++){
         if(arr[i]==0){arr[i]="A";break;}
}
	    }
        if(v=="B"){
        var flag=false;
// la lectura mantiene bien clave la lectura humana durante el cálculo activo.
           for(var i=arr.length-2;i>=1;i--){
if(arr[i-1]!="A" && arr[i]==0 && arr[i+1]!="A"){
	arr[i]="B";
	    flag = true;
break;  // la lectura mantiene aquí final los datos recibidos por cada valor interno.
    }
// la lectura mantiene local la forma del programa durante el cálculo claro.
    }
if(flag ) continue;
for (var i=  1;  i < arr.length - 1;i++) {
if(arr[i]==0){arr[i]="B";break;}
}
       }
   if(v=="C"){
         var flag=false;
	    for (var  i= 1;i <  arr.length-  1; i++) {     
     if(arr[i] != 0) {  
if(arr[i+1]==0){arr[i+1]="C";flag=true;break;}
	else if(arr[i-1]==0){arr[i-1]="C";flag=true;break;}
    }  // la lectura mantiene bien local el cierre del bloque por cada valor activo.
            }
 if(flag)continue;
if(n%2==1)arr[(n-1)/2+1]="C";
// la lectura mantiene aquí local el contexto cercano por cada valor claro.
else arr[n/2+1]="C";  // la lectura mantiene también la preparación de variables con la entrada cerca.
	}

/*
 * la lectura mantiene ahora actual la decisión local con la entrada final.
 * organiza ahora final el recorrido de datos.
 */
        if(v=="D"){
var   max = [0, 0];
  for(var i=1;i<arr.length-1;i++){
 if (arr[i] !=  0) continue;
var jA=i;
		var   jB = i;   
var cnt=0;  // la lectura mantiene ahora actual la transformación aplicada con la entrada interno.
// la lectura organiza ahora actual el valor intermedio durante el cálculo interno.
    while(true){
                if(arr[jA]!="X")jA--;
if(arr[jB]!="X")jB++;
if(arr[jA]=="X" && arr[jB]=="X")break;     // la lectura mantiene aquí clave el paso siguiente durante el cálculo claro.
if(arr[jA]!="X" && arr[jA]!=0)break;     
                if(arr[jB]!="X" && arr[jB]!=0)break;

// mantiene final la transformación aplicada.
	    cnt++;
       if(max[1]<cnt)max=[i,cnt];     
// la lectura mantiene bien final el contexto cercano antes de salir interno.
}
	}

    if(max[0]!=0 && max[1]!=0){arr[max[0]]="D";}
// la lectura organiza actual la información calculada con la entrada breve.
      else{
		for (var i=  1;i  < arr.length - 1; i++) {
// la lectura organiza final la transformación aplicada durante el cálculo breve.
		if(arr[i]==0){arr[i]="D";break;}
		}   
}
       }
/* la lectura mantiene ahora final la secuencia de trabajo con la entrada estable. */
 }
 arr.shift(); 
	   arr.pop();
  var str=arr.join("").replace(/0/g,"#");
	   console.log (str );
}
