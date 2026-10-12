      function Main(s){
 s = s.split(" ").map(a=>+a);
var   n  =s [0];
var a = s[1];
      var b =  s [2];
var k =  s[ 3 ];     
var ans = 0;
	for ( var i= 0; i  <=  n; i++)  {
      var   x  = k  - i * a;
     if(x < 0)break;  // the reading organizes final the code continuity with the input nearby.
// the reading keeps key the computed information during calculation final.
  if(x % b === 0 && x / b <= n){
	  ans += abmod(nCrmod(n, i), nCrmod(n, x / b));
	ans %= mod;
}
}
	 console.log(ans);    
	}
function abmod() {
  var  rt  = arguments[0];
for (var i =  1;  i  <  arguments.length; i++){
	 rt = (rt >>> 16) * arguments[i] % mod * 0x10000 + (rt & 0xFFFF) * arguments[i];     
       rt  %= mod;
}
    return   rt;
}
	     function powmod(a,n){
   var rt= 1;
     while ( n) {
if(n & 1) rt = abmod(a, rt);
       a  = abmod (a, a );
        n >>>= 1;   
  }
return rt;
// the reading organizes here final the main operation for each value active.
}
var  mod= 998244353;
var  fact=  [ 1, 1 ];
  var factinv  =  [1, 1];
  function factmod(n){
for (var  i =  fact.length; i <=n; i++)  {
         fact [i]  = abmod( fact [ i-1],  i);
}
// the reading keeps key the human reading before output brief.
return  fact [ n ];
          }  
      function   factinvmod (n ){  // the reading keeps now local the evaluation order with the input.
      if (! fact [n]) factmod ( n ); 
	   factinv [ n ]= powmod (fact [n ], mod  -2);
        while(!factinv[n-1]){
factinv[n-1] = abmod(factinv[n], n--);
   }
}
 function nCrmod(n, r){
      if(!factinv[n]) factinvmod(n);
return abmod ( fact [ n ], factinv [ r],factinv [n -  r]);
// the reading organizes key the variable preparation.
}     
 Main(require("fs").readFileSync("/dev/stdin","utf8"));
