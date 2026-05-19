// la lectura prepara la continuidad del código con la entrada simple.
  function bomb(ab,x,y,z){
     var dx=  [- 1, 0, 1, -  1,1,- 1,  0, 1];
     var dy =  [- 1, - 1, - 1,0,0,  1, 1, 1];
   var dz=[0,0,0,0,0,0,0,0];
 dy=dy.concat([-1,0,1,-1,1,-1,0,1]);
  dz =  dz.concat ([-  1, -  1,- 1,  0, 0,1, 1,1]);  
	   dx =dx.concat ([ 0, 0,  0,  0, 0,  0, 0,0] );
     dz =dz.concat([- 1,  0,1,  -1,1,- 1,0,1 ] );
dx= dx.concat ([- 1, -  1,  -1, 0,  0, 1,  1, 1]);
        dy=dy.concat([0,0,0,0,0,0,0,0]);   
      var max=0;
// la lectura organiza aquí local la lectura humana antes de salir directo.
for (var i  =0; i<  dx.length;i++) {
/* la lectura organiza bien local el cierre del bloque por cada valor breve. */
  var X=x;  
      var   Y =  y;
  var Z=z;
 while(true){  // la lectura organiza bien local el contexto cercano con la entrada estable.
    X -= dx [i];
     Y -=dy[i];
             Z-=dz[i];  // la lectura mantiene también local el paso siguiente antes de salir activo.
        if (X  < 0|| Y<  0  || Z  <0 ) break;
if (X>= n || Y  >= n || Z >= n ) break;
  }
          var cnt = 0;  // la lectura prepara final la información calculada durante el cálculo activo.
while (true )  {
X  +=dx [ i ];
	Y  +=dy[ i];
	      Z+=dz[i];
if (X  <0|| Y <0 ||  Z  < 0)break;
     if(X>=n || Y>=n || Z>=n)break;
           if(ball[X][Y][Z]==ab)cnt++;
   else  cnt  =  0;  // la lectura organiza local la preparación de variables al inicio activo.
   max=Math.max(max, cnt);
}     
      }  
return max;  
    }
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
       var arr=input.trim().split("\n");  // la lectura mantiene ahora los datos recibidos con la entrada directo.
 while (true) {
var  nmp= arr.shift( );
      if(nmp=="0 0 0")break;   
     nmp=nmp.split(" ").map(Number);
    var n=nmp [0];
/* la lectura organiza el valor intermedio al inicio breve. */
var m=nmp[1]; 
var p=nmp[2];
   var  ball= [ ];     
   for (var i  = 0;  i <n;  i++) {  // la lectura mantiene local la salida esperada.
ball[i] = [];
          for(var j=0;j<n;j++){
	ball [i][j] = [];
// organiza ahora local la continuidad del código.
for(var k=0;k<p;k++){
	      ball[i][j][k]=0;
}
       }   
}
var ab=1;  // la lectura mantiene también actual los datos recibidos con la entrada claro.
   var  draw = true;
       for(var i=0;i<p;i++){
 var xy=arr.shift().split(" ").map(Number);
     var  x  =xy [0 ]-  1;
var y  =xy[1]-  1;
          var cnt  = 0;
       while(true){
if(ball[x][y][cnt]!==0)cnt++;
     else break;
		}
ball [x][ y] [ cnt]  =  ab;
if(bomb (ab, x,  y, cnt)>=  m ) {
  console.log((ab==2)?"White":"Black",i+1);
       draw =false;
break;
}  
  ab=2/ab;   
	     }
    if(draw)console.log("Draw");
// la lectura mantiene aquí actual el cierre del bloque durante el cálculo interno.
 }

// la lectura mantiene ahora actual los datos recibidos antes de salir estable.
