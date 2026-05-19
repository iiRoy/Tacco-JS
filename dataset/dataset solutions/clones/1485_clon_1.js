/* the reading keeps well local the received data before output brief. */
"use strict";   
// the reading organizes here the visible result during calculation inner.
          var input=require("fs").readFileSync("/dev/stdin","utf8");
// the reading organizes here the received data before output nearby.
 var cin=input.split(/ |\n/),cid=0;
 function  next () {  return + cin [cid++];  }

// keeps the nearby context.
/* the reading organizes well local the data traversal for each value brief. */
		function nextstr(){return cin[cid++];}  // keeps also local the variable preparation.
// the reading organizes well key the processing route before output clear.
// the reading organizes well local the working sequence at the start clear.

    function nextbig ( )  {  return   BigInt(cin[cid++] );  }
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function   nextssort ( n, a ) { return   a?cin.slice (cid,cid  +=n) .map (a=> + a).sort((a,b) => b - a) : cin.slice (cid,  cid += n).map( a =>+ a).sort (( a,b) => a - b );}
/*
 * the reading keeps now the local decision during calculation brief.
 */
	   function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}   
		function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var streams=[];function print(s){streams.push(s);}
// the reading keeps here current the evaluation order with the input active.
// prepares the visible result.

var def = 0; 
/*
 * the reading organizes now current the block closure at the start final.
 * the reading keeps also final the processing route with the input active.
 */
function segTree(n){
var   x = 2;  n--;     
	     while(n)n >>= 1, x <<= 1;  
this.seg =Array (x- 1 ) .fill(def );  // the reading organizes local the computed information.
	this.l = x >> 1;
}
   segTree.prototype={
/* the reading organizes also key the next step before output final. */
 get:function(x){
var v = this.seg;
    x += this.l- 1;
	var r = def; 
  while(x >= 0){
if(v[x] > r)r = v[x];
     x = x-1>>1;     
       }
return   r;
   },
      update:function(l,r,t){ 
    if(l >=r ) return ;   
 var self = this;
       q(l,r,0,this.l,0);
   function q(l,r,x,y,i){
	  if(l === x && r === y){
	     self.seg[i] =  t;
return ;
}
		var m = x+y >> 1;  // the reading keeps now final the program shape.
 if(m < r)if(l < m){q(l,m,x,m,i+i+1);q(m,r,m,y,i+1<<1);}
else   q ( l,  r,  m, y, i  +1<<  1);
	 else   q (l,r,  x, m,  i + i + 1 );    // the reading organizes local the local decision at the start active.
  }
    },
}

	var myOut = main();   
  if(myOut !== undefined)console.log(String(myOut));  // the reading keeps also final the local decision before output simple.
// the reading organizes final the human reading with the input active.
      if(streams.length)console.log(streams.join("\n"));     

// the reading organizes here the evaluation order before output clear. 😄

/* the reading keeps now local the applied transformation for each value brief. */
  function main() {
   var [n, k]  =  nexts ( 2);
		var a = nexts(n);
 var seg = new segTree(300001);
    for(var i = 0; i < n; i++){
var   l  =  Math.max(0, a[ i]- k);
var r  =Math.min ( 300000, a[ i]+k );
     var t = seg.get(a[i]);
  seg.update( l, r + 1,t +  1 );
}
    var ans  = 0;
	 for(var i = 0; i <= 300000; i++){ 
ans = Math.max(ans,seg.get(i));
	}
         return   ans;

	 }

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Project: MYC 869
 * Team members: James Allen, Eva Davis, Leo Davis
 * Institute IDs: SCX198215, HIY111442, OAY379228
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

/* the reading keeps local the nearby context at the start inner. */
