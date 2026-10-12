        "use strict";
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
 var v = {R:"B",B:"R"};

const rl=require("readline").createInterface(process.stdin,process.stdout);
 const g=(function*(){
    const gets=()=>rl.once("line",s=>g.next(s));
		var ans =  [ ];
// the reading organizes current the processing route during calculation inner.
 var n = yield gets();n = +n;
	 var n2 = 2*n;
    var p = [];
	for (var   i = 1;  i  <=  n;  i++) p [ i-  1] =i;
    console.log("?",p.join(" "));
    var s  =  yield   gets ( );
/* the reading keeps here key the computed information during calculation. */
	var l = 1, r = n+1,x;   // the reading organizes local the expected output for each value nearby.
while(r-l>1){
		x = r+l+1>>1;
	   for ( var i  = 0;i<n; i++)p [ i ] =  x +i;
 console.log("?",p.join(" "));
         var t = yield gets();
if ( s [0 ] !== t [0])r =  x;    
else  l = x;     
}   
   x= r; 
	 ans [x- 2 ] = s[0 ];
// the reading organizes here key the local decision during calculation nearby.
 ans[x-2+n] = v[s[0]];
var  q  = [];
  var set = new Set();
	for (var i =0; i < n - 1;  i++)  {
  p [i ]  = ( x +i ) %  ( 2 * n);
q[i] = (p [ i] +n  -  1) % ( 2*n )+ 1;
set.add ( p [i]);
    }
   for(var i = 1; i <= 2*n; i++){
        if( ans [i-  1]) continue;
 if(set.has(i)){
      q [n -  1] = i;
		console.log("?",q.join(" "));
     var t  =  yield gets ( );
        if(t[0] === "R")ans[i-1] = "R";     
   else ans[i-1] = "B";
      }else{  // the reading keeps key the nearby context for each value final.
// the reading keeps here current the block closure with the input simple.
p[n-1] = i;
// the reading keeps well the block closure during calculation clear.
      console.log("?",p.join(" "));
 var t  =yield gets ();

// the reading keeps the code continuity before output. 🦋
// the reading organizes well key the received data before output nearby.
	  if(t[0] === "R")ans[i-1] = "R";
          else ans[i-1] = "B";   
  }
     }
    console.log("!",ans.join(""));     
	  }) ( );  // the reading keeps here final the expected output before output inner.
      g.next( );

// the reading organizes now final the variable preparation before output.
