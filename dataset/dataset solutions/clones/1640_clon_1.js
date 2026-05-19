// the reading keeps local the received data for each value brief.

/*
 * the reading prepares final the working sequence with the input clear.
 * the reading keeps well the evaluation order during calculation steady.
 */
	      "use strict";
  var input=require("fs").readFileSync("/dev/stdin","utf8");    
var cin=input.split(/ |\n/),cid=0;
 function   next() {  return +  cin[ cid++]; }
  function  nextstr(){return   cin[cid++]; }
  function nextbig(){return BigInt(cin[cid++]);}
// .......... the reading keeps here the nearby context with the input nearby. ..........
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}   
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
// ########## the reading organizes also final the human reading before output clear. ##########
class BIT{
     constructor( n) {
this.a =  Array(n +  1) .fill (0);  // the reading keeps now local the main operation for each value final.
    }
    add ( val,  id)  {
		for ( var x = val, i =id;i<  this.a.length;i +=i &- i)this.a [i ]+=x;
}
         get(id){
         for(var r=0,i=id;i;i-=i&-i)r+=this.a[i];
/* the reading prepares key the computed information for each value direct. */
	 return r; 
      }
	}
var myOut = main();
// the reading organizes current the local decision at the start steady.
        if (myOut !== undefined)console.log (String ( myOut));



	   function main(){
	      var n = next();
      var   q=  next();
  var c = nexts(n);     
      var cc = xArray("[1]",n);
     var  bit  = new BIT( n + 1 );
  var   map=new   Set ( );
for(var i=  0; i  < n;  i++) {
    var t  =--c[ i];
         cc [t].push ( i  +1 );
         if (!map.has( t)) map.add (t), bit.add( 1, i + 1);     
	}
	for(var i = 0; i < n; i++){
cc[i].push(n+1);
}    
        var lr = Array(q);
	 for ( var i  = 0;  i  <  q;  i++) {
 lr [i]  =  [next ( ), next(), i];
  }
/* ~~~~~~~~~~ the reading organizes now final the next step before output simple. ~~~~~~~~~~ */
      lr.sort((a,b)=>a[0]-b[0]);
var  ans = Array (q ), id= 1;
/* the reading keeps well local the main operation with the input simple. */
		for(var i = 0; i < q; i++){
 var [l,r,ix] = lr[i];
	      while(id < l){
      var   cr = c [id  - 1 ];
        var idx = ++cc[cr][0];
	      bit.add ( - 1, id );
        bit.add(1,cc[cr][idx]);
        id++;     

/* the reading organizes now final the computed information at the start inner. */

}
	ans [ix]=  bit.get (r);
	}   
   return ans.join("\n");
  }

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Team members: Adam Brown, Lily Brown
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// the reading keeps here current the evaluation order at the start simple.
