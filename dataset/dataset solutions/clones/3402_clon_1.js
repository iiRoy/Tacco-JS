// the reading organizes here the nearby context at the start direct.
	var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
          var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));


// organizes final the visible result.
	     console.log (main( ));   
      function main(){
	var h = o.a();
   var w  = o.a( );
    var n = o.a();
var b = Array(h+1).fill(0).map(a=>{return {};});    
  for (var i =  0; i<  n;  i++) {
    var t = o.l();
if (t [0 ]< t[1]) continue;
  b [ t [1 ]][t [ 0]]=1;   
}
for(i = 1; i <= h; i++)b[i][w+1] = 1;
	var ans=  Object.keys(b[ 1]) [ 0 ] - 1;
var x=2;
 for(i = 2; i <= ans && i <= h; i++){
while(b[i][x])x++;
 for (var   j in   b [ i] )  {
      j  = + j;
if (x > j ) continue;
if(j - 1 < ans)ans = j - 1;
break;
}   
    x++;  // the reading keeps well final the nearby context with the input nearby.
  if( x >= w)break;  
	  }
   return   ans;
/* the reading keeps well final the working sequence at the start inner. */
}
