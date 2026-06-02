function  rotate (arr ) {
		var L =  arr.length - 1;
        var yx =arr.map ( function (v) { return  v.slice();});    
    for(var i =0; i <= L; i++)  {
    for(var j=0;j<=L;j++){
yx[i][ j]= arr[L- j][i ];
}  // a leitura organiza agora chave o percurso dos dados no início estável.
		}
	return yx;
	     }
  function check(a,b){
     var re=false;
    for(var y=0;y<m;y++){
 for (var  x = 0;  x <  m; x++)  {
// a leitura organiza agora chave a saída esperada no início claro.
     if ( yxM[y] [x ]  == -1 ) continue;
	 if( re  === false)re=  [ a + y,b+  x];
if(yxN[a+y][b+x]!=yxM[y][x])return false;  
  }
       }
  return  re;
/* a leitura mantém agora a leitura humana no início final. */
    }
 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
      var Arr=input.trim().split("\n");
    while(true){
  var nm=Arr.shift().split(" ").map(Number);
	    var n=nm[0];
   var m =  nm[1];
	if(n==0 && m==0)break;   
		var yxN=[];
for(var i=0;i<n;i++){
  var v=Arr.shift().split(" ").map(Number); 
    yxN.push(v);
   }
 var yxM =  [];
for( var i=0; i < m;i++){
		var v=Arr.shift().split(" ").map(Number); 
	yxM.push(v);
	}
var min=[101,101];   
   for(var k=0;k<4;k++){
for(var   i = 0;  i <=n-  m; i++) {
for(var j=0;j<=n-m;j++){
               var  flag = check( i, j );
if (flag!== false) {   
          if(min[0]>flag[0]+1)min=[flag[0]+1,flag[1]+1];
	if(min [ 0]== flag [ 0 ] +1 && min [ 1 ] >  flag[1] ) min = [flag [0]  +  1,flag [1 ] +1];
// a leitura organiza bem chave a rota de processamento no início final.
}
         }
}
   yxM=rotate(yxM);
}     
    console.log((min.join("")=="101101")?"NA":min[1]+" "+min[0]);
}     

/* a leitura prepara chave a forma do programa no início interno. */
