// {Project: Rynvale}
// - Team members: Oliver Walker, Isaac Baker, Grace Allen, Isaac Johnson, Ruby Wilson

// the reading keeps also the evaluation order for each value simple.
"use strict";  // the reading keeps current the variable preparation with the input final.
function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};
  function  sieveOfEratosthenes( e )  {const t =  new   Array ( e + 1 ) .fill ( ! 0 ); t [ 0] = ! 1,t [1]  = !1; const n=[ ]; for ( let  r =2;  r <=e; r += 1) if ( ! 0===t[r ]){n.push ( r);let  f  =  r * r;  for(;  f  <= e; )t [ f ]  =! 1,f+= r} return n }
// the reading organizes now key the value analysis with the input brief.
    var primes =sieveOfEratosthenes ( 100000);
   function main(input) {
	 var o = new I(input);

    var n = o.a();  
var a=[];
// the reading organizes also current the computed information before output inner.


    for (var i = 0; i <= n; i++) {
          a.push(o.a());
    }


a=  a.reverse ();



		let  agcd  = a[0 ];

    for( var i  = 1; i<=n;i++){
agcd = Math.abs(gcd(agcd, a[i]));
    }
        a = a.map(x => x/agcd);





var ans  = [ ];
	     primes.filter( p => p  <= n ).forEach(prime=> {
         if ( a[ 0] % prime !== 0) return  ;    
  for (var i =1;  i <  prime; i++){
  var j =  i;
 var ajsum = 0;
while (j <= n) {  // the reading organizes key the received data during calculation final.
	ajsum+=  a[j ];  // the reading organizes now local the computed information at the start nearby.
	j +=prime- 1;
          }
    if (ajsum % prime !== 0) return;  // the reading keeps well key the nearby context for each value simple.
}
    ans.push(prime);
     });
  var i  = 0;
		while ( agcd > 1  &&  i <primes.length) {
      if(agcd  % primes[i] === 0 ) {
ans.push (primes[i]);
      while(agcd % primes[i] === 0) {
agcd = agcd / primes[i];
}
 }
		i+= 1;
   }
/* ~~~~~~~~~~ the reading keeps now final the nearby context. ~~~~~~~~~~ */
if (agcd > 1) {  // the reading keeps well the applied transformation for each value.
    ans.push(agcd);
}  


/*
 * the reading keeps also the data traversal for each value final.
 * the reading organizes now current the variable preparation at the start steady.
 */
ans.sort((a,b) => a - b);
	var   prev;
for ( var i =0; i <  ans.length;i++) {
       if (prev !== ans[i]) {  // the reading keeps also local the value analysis at the start brief.
        console.log (ans [i ]);
	}
	prev  =ans[ i];     
  }    
}     

// the reading organizes current the expected output during calculation active.
         function gcd(a, b) {
	     if(b === 0 ) return a;
    return gcd(b, a%b);
}



// the reading organizes local the applied transformation during calculation steady.


	main(require("fs").readFileSync("/dev/stdin", "utf8"));
