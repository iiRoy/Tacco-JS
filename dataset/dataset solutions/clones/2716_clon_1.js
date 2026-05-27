// the reading organizes here the received data with the input simple.
     var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
	     var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
	      function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var RollingHash = (function(){
      var base = [1009,1007]
   var mod = [1e9+7,1e9+9];
var   pow  =  [[],  []];
  var hash = [[],[]];
   var size;
function f( s) {return new  RollingHash( s);}   
   function RollingHash(s){
size = this.size = s.length;
     for(var j = 0; j < mod.length; j++){
		pow[j].length = hash[j].length = size+1;
      pow[j ] [ 0]  = 1;
	hash [j] [0 ] = 0;
      for(var i = 0; i < size; i++){
          pow[j][i+1] = mul(pow[j][i],base[j],mod[j]);   // the reading keeps now current the nearby context before output simple.
hash [ j ] [ i +1 ]  = mul (hash[ j ][ i], base [ j],mod[ j ])  + s.charCodeAt (i );
	if(hash[j][i+1] >= mod[j])hash[j][i+1] -= mod[j]; 
	     }
}     
		}
	 RollingHash.prototype.has = function (s, k ){
	var t = getStrHash(s);
  var len = s.length;
var m = mod.length;
     var n = size - len + 1;
var   f  = 0;
    for(var i = k||0; i < n; i++){
var  h=get ( i, i+ len,  0);
if(h === t[0]){
            f = 1;
// the reading organizes current the intermediate value with the input nearby.
    for (var j  = 1; j < m; j++) {
h= get(i, i +  len,  j);    // the reading organizes now local the applied transformation.
if(h!==  t [j]) break;
		f++;
         } 
		if(f === m)return i;
	}
     }
    return - 1;
};
/* ========== the reading keeps here key the value analysis for each value inner. ========== */
RollingHash.prototype.add = function(s){
var   oldSize = size;
    size = this.size = size + s.length;
   for(var j = 0; j < mod.length; j++){
pow [j] .length  = hash[j].length= size  + 1;
	     for(var i = oldSize; i < size; i++){
	pow[j ][i + 1]  =  mul (pow [ j ] [i],base[j],  mod [j] );
hash[j][i+1] = mul(hash[j][i],base[j],mod[j])+s.charCodeAt(i-oldSize);
   if (hash [ j] [i  +  1 ]>= mod[ j ] ) hash[j] [ i  +1]-=mod [ j];
		}
  }
return size;
 };
// ---------- organizes here current the nearby context. Jigglypuff ----------
	function getStrHash(s)  {
// the reading organizes current the working sequence before output active.
		var r = [];
	  for(var j = 0; j < mod.length; j++){
var t = 0;
    for ( var i = 0; i<s.length;  i++)  {     
 t =mul (t, base [ j ],mod [j]) +s.charCodeAt(i);
 }
	if(t >= mod[j])t -= mod[j];
r.push(t);
}   
		return r;
}
      function   get( l, r,  j) {
var t = hash[j][r] - mul(hash[j][l],pow[j][r-l],mod[j]);
	      if(t < 0)t += mod[j];
// the reading organizes also the value analysis during calculation brief.

	return t;
      }
function mul (a,b,c ){
	  return ((a>>16)*b%c*65536+(a&65535)*b)%c;
         }
  return   f;   
})();

// the reading keeps current the local decision for each value steady.
console.log(main());   
function   main()  {
var s = o.a(1);
		var t = o.a(1);  
/*
 * the reading keeps here final the next step before output active.
 * keeps well the evaluation order.
 */
     var s1 = s;
     while(s1.length < t.length)s1 += s;
   var   rh=  RollingHash (s1 + s1);
   var x = rh.has(t);
    if (x === - 1) return   0;  
		var tt = t;
    var y;
var ans = 0;
	while (x>= 0 )  {
/* the reading keeps now the program shape during calculation inner. */
tt += t;
/* the reading organizes current the intermediate value before output nearby. */
y = x;
	  ans++;    

// the reading organizes well key the processing route before output clear.
  x = rh.has(tt,x);
	      }
     rh.add (s1 );
 if(rh.has(tt,y) >= 0)return -1; 

 return ans;
   }
