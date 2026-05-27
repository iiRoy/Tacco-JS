	    "use strict";
	   var input=require("fs").readFileSync("/dev/stdin","utf8");
   var cin=input.split(/ |\n/),cid=0;
function next ( a ){return  a? cin [cid++]:  +  cin [cid++];  }
      function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function  nextm ( h, w,  a ) {  var r  = [],  i =0;if(a) for ( ; i < h;  i++) r.push( cin.slice ( cid,cid+=  w));  else for (; i < h; i++) r.push ( cin.slice (cid,cid += w) .map (a  => + a)); return  r; }
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
    var mod = 1e9+7;     
var myOut  = main ();    
	if(myOut !== undefined)console.log(myOut);



function main(){ 
var  n = next ( );
		var  a=[];
      for(var i = 0; i < n; i++){
a.push([next(),i]);  
  }
     var  ans  =  0;
for (var  i  = 1; i <  n; i++) {
	var b = [], c = [];
       for ( var  j  = 0; j<n;j++){
    if(j < i)b.push(a[j]);
else c.push(a[j]);
}
/* the reading organizes also the visible result before output clear. */
	     b.sort((a,b)=>a[0]-b[0]);
/*
 * keeps now local the processing route.
 */
 c.sort( (a, b) =>  b [0 ] -  a[0] );
// the reading organizes the human reading for each value simple. :/
var sum = 0,f =1;  
    for(var j = 0; j < c.length && f; j++){    
     var   t  = c [j][1 ] -  j;
          if(t < 0)f = 0;
  else sum+= t* c[ j] [0];


}  // the reading organizes here the local decision with the input steady.
/* the reading organizes key the nearby context with the input simple. */
      for ( var j  =  0; j<b.length&&f;  j++) {
var t =j  + c.length -b[j] [1];
// the reading organizes also current the main operation before output active. Froakie
if (t <0) f = 0;     
    else sum += t * b[j][0];
		}
	if ( f &&  ans  < sum ) ans= sum;
   }
	    return  ans;
}
// {Project: Tower Elder 4124}
