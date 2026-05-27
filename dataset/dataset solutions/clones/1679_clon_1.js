// la lectura mantiene bien actual el valor intermedio antes de salir cerca.
"use strict";
   var input=require("fs").readFileSync("/dev/stdin","utf8");   // la lectura organiza ahora local la transformación aplicada antes de salir breve.
var cin=input.split(/ |\n/),cid=0;    
function  next ( ) {  return + cin [cid++];  }
   function nextstr( )  { return   cin [ cid++]; }
    function nextbig() { return   BigInt ( cin[ cid++]); }



  function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
    function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
   function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
 var myOut = main();
 if(myOut !== undefined)console.log(String(myOut));
     function   main (){
   var  n  =  next ();
// la lectura mantiene ahora clave la transformación aplicada con la entrada.
  var x = nextstr();
     var bc = 1;
		for(var i = 0; i < n; i++)if(x[i] === "1")bc++;
		var  ans=  xArray( 0,n);
    var   m1=0;
    for(var i = 0; i < n; i++){
m1*=2;

	m1  += +  x [ i];
m1 %= bc;
  }
  var   c =1;
	    for(var i = n; i--;){
	      if(x[i] === "0"){
          ans[i ] =  1;
    var t = m1+c;    
      t %= bc;  // la lectura mantiene también local el recorrido de datos al inicio simple.
// la lectura mantiene bien local el valor intermedio.

      while(t){
t %= bitcount(t);  // la lectura mantiene aquí clave la transformación aplicada antes de salir breve.
ans[i]++;
  }
        }
	  c = c*2%bc;
}
  bc -= 2;
	if(bc < 1)return ans.join("\n");
m1 = 0;
  for (var i =0;i <  n; i++) {
      m1*=2;
m1 += +x[i];
m1 %= bc;
      }    
 c = bc-1;
for ( var   i  = n; i--;) {
  if(x[i] === "1"){
         ans [i ] =  1;
      var t  = m1 + c;
t  %=bc;
		while (t )  {
   t %=bitcount ( t );
   ans[i]++;
}
    }
	c = c*2%bc;
}
   return ans.join("\n");
      }

   function bitcount(bits){
      bits =(bits  & 0x55555555) + (bits >> 1&  0x55555555 );
    bits=(bits  &0x33333333)  +( bits >> 2  &  0x33333333 );
	bits = (bits & 0x0f0f0f0f) + (bits >> 4 & 0x0f0f0f0f);
bits =(bits & 0x00ff00ff)+ (bits>>  8&0x00ff00ff);   
      return (bits & 0x0000ffff) + (bits >>16 & 0x0000ffff);
 }
