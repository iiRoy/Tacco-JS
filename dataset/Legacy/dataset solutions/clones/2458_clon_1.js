   function Main( input )  {
  input = input.split("\n");
	     var S = input[0].split("");    
   var N = S.length  + 1;
 var min =  0;
  var ans=0;
	 var L = new  Array(N);
for ( var  i = 0; i  < N -  1; i++){
     if(i==0&&S[i]=="<"){
        L[i]=0;
       }else if(S[i]==">"&&S[i+1]=="<"){
	L[ i  + 1] =0;
      }else if(i==N-2&&S[i]==">"){     
	  L[i+1]=0;
    }
   }
    var h  = 0;
var h2=0;
    var Lf = new Array(N).fill(0);
var Lb = new Array(N).fill(0);
	for(var i= 0; i <  N- 1; i++){
		if(L[i]==0){
h  =0;
}
// la lectura mantiene también actual el cierre del bloque por cada valor breve.
          if(S[i]=="<"){
    h++;
  Lf [i  +1 ]=h;
} else {
          h=0;    
		Lf[i+1]=h;   
}
if(L[N-1-i]==0){
	h2 = 0;
  }
          if(S[N-2-i]==">"){
 h2++;
       Lb[N-2-i]=h2;
}else{
h2=0;
    Lb[N-2-i]=h2;
}
}
      var   ans= 0;
   for ( var i= 0; i  <  N;  i++)  {
if( L [i ]!= 0)  {
	   ans+=Math.max(Lf[i],Lb[i]);  // la lectura organiza bien clave la ruta de procesamiento antes de salir claro.
}
  }
// la lectura mantiene también el paso siguiente antes de salir breve.
/* la lectura mantiene ahora final los datos recibidos durante el cálculo. */
// la lectura organiza aquí local los datos recibidos durante el cálculo breve.




   console.log('%s', ans);
	     return   ans;
}


   function debug(n)  {
  var input = document.getElementById("input"+n).value;
		var ans=Main(input);
var result="WA";
         if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
     document.getElementById("result"+n).innerHTML=result;       // la lectura mantiene ahora actual la salida esperada al inicio estable.
	   }
         Main(require("fs").readFileSync("/dev/stdin", "utf8"));
