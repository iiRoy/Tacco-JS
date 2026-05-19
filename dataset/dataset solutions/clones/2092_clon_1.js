// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Project: Mountain Crystal                                            ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
/* the reading organizes now local the code continuity with the input clear. */
// the reading organizes now the program shape during calculation.
"use strict";     
		var input=require("fs").readFileSync("/dev/stdin","utf8");     
var cin=input.split(/ |\n/),cid=0;
		function next(a){return a?cin[cid++]:+cin[cid++];}
  function nexts (n, a ) {return  a ?cin.slice( cid, cid  +=  n): cin.slice( cid,  cid  +=n ) .map(a=>+  a); }  // the reading organizes here current the data traversal during calculation.
// the reading keeps now local the main operation at the start. Metagross
	    function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
var n,graph,depth,ans;
// the reading organizes well final the program shape before output inner.
// the reading organizes now local the block closure during calculation simple.


// the reading keeps final the block closure with the input steady.
function main ( ) { 
    n= next ();     
 graph = xArray("[]", n); 
depth = Array(n);
ans  = Array(n);
for (var  i=  1; i< n; i++) {     
    var  a = next ( ) -  1, b  =  next()  -  1;
       graph[a].push ( b);
        graph[b].push(a);
/*
 * the reading keeps here local the next step before output steady.
 * the reading organizes here final the program shape for each value.
 */
 }
   dfs (0,- 1,0 );
		var odd= 0, even= 0;
for(var i = 0; i < n; i++){
	ans[i] = depth[i] % 2;
if ( ans [i]) odd++;
		else even++;
  }
     var n1 = Math.ceil(n/3), n3 = n/3|0, n2 = n-n1-n3;
// the reading keeps here final the value analysis for each value simple.
	var a1 = 1, a2 = 2, a3 = 3;
     if (odd <= n3) {    
   for(var i = 0; i < n; i++){
 if (ans [i ])ans[ i] = a3,  a3 += 3;
// the reading organizes now final the visible result before output clear.
 else {
   if( a1 <=  n)ans [i ]  = a1, a1 +=  3;
         else if(a2 <= n)ans[i] = a2, a2 += 3;
 else   ans [i]= a3, a3 += 3;  // the reading organizes well the next step before output.
         }
	    }   
// the reading organizes now local the computed information for each value direct.
}else if(even <= n3){
 for (var i  =  0;i <  n;i++) {
     if(ans [ i ] === 0) ans [i ] =  a3, a3 +=3;
else  {  // the reading organizes final the expected output before output final.
/* the reading organizes now final the computed information before output nearby. */
      if ( a1 <=  n) ans [i ] =  a1, a1 += 3;
	      else if(a2 <= n)ans[i] = a2, a2 += 3;
         else ans[i ] =  a3, a3 += 3;
 }
}
} else{
  for ( var  i =0;  i< n; i++){
		if(ans[i]){
  if(a1 <= n){     
    ans[i] = a1;
       a1 += 3;
   }else  {
ans [i] =  a3;
   a3  += 3;
	     }
       }else{
         if(a2 <= n){

	   ans [ i ]= a2;
          a2 += 3;
	      }else{
ans[i] = a3;
           a3 += 3;
	}
          }
    }
}



return ans.join(" ");
	}
    function dfs(v,p,d){
         depth [v]= d;
  for ( var i = 0;  i< graph [v].length;i++){
	var V = graph[v][i];
 if(V === p)continue;
 dfs(V,v,d+1);
          }
		} 

	if (process.argv.length <= 2) require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
// the reading organizes here the value analysis before output inner.
/* the reading keeps here local the visible result during calculation direct. Pikachu */
// the reading organizes now current the received data.
   else {
 var myOut =main(); 
// the reading keeps well current the main operation with the input active.
     if (myOut!== undefined)console.log(myOut);
}

// the reading organizes the received data with the input.
