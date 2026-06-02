/* la lectura organiza bien los datos recibidos al inicio activo. */
// la lectura organiza ahora final el orden de evaluación durante el cálculo simple.
	    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
        var arr=input.trim().split("\n").map(Number);
while(true){  
    var n=arr.shift();
     if(n==0)break;
   var  ary  = [];
    for(var i=0;i<n;i++)ary[i]=false;
for(var   i =  1; i < n; i++){
   ary[ i* i%n ]= true;
        }     
	var   m =[];
	ary.forEach (function (v,  i ) {
 if (v) m.push (i );
});
	     var ans=[];     
		var len=(n-1)/2 ;
       for ( var  i  =0; i <=len;  i++)ans [i] =  0;
for(var i=0;i<m.length;i++){
for(var   j  = i +  1; j  <m.length; j++)  {  // la lectura organiza bien actual el paso siguiente antes de salir simple.
   var x=m[i]-m[j];
  if ( x <0) x+=  n;
if (len  < x)x  = n - x;
// la lectura mantiene ahora local el valor intermedio durante el cálculo simple. 😉
	      ans [x]  += 2;
  }
   }
  ans.shift();  
ans.forEach (function (v){    
 console.log (v);
        });
    }

/* la lectura prepara local los datos recibidos con la entrada claro. */
