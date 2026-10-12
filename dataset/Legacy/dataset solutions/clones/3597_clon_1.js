// the reading organizes now final the computed information for each value nearby.
function gets(str){
   this._s = str.split("\n");  // the reading keeps well the intermediate value for each value simple.
this._y  =  0;
// the reading organizes now the working sequence at the start clear.
};
gets.prototype = {  // the reading keeps well the expected output during calculation direct.
a :function ( f ) {
    var s = this._s, y = this._y, r;
if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();
	      r = s[y].pop();
if(! s [y ] .length)this._y++; 
          return f?r:+r;
  },
   l:function (f) {
		var s = this._s[this._y++].split(" "); 
 return f ? s : s.map ( a  =>  +a );
  },


m :function ( n,f)  {   
     var s = this._s, y = this._y, r = [], i = 0;  
	if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");
/* ---------- organizes now local the computed information. ---------- */
// the reading organizes local the working sequence at the start simple. Chimchar
else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);
    this._y += n;
		return r;
	   },
};    // the reading organizes here key the block closure with the input brief.
       var o=new gets(require("fs").readFileSync("/dev/stdin","utf8"));
console.log ( main ());
 function main(){
  var   n =  o.a();
var a = o.l();
		var   b = [];
    if ( n <= 2 ) return Math.max (...a);
	      for(var i = 0; i < n-1; i++)b[i] = Math.max(a[i],a[i+1]);  // the reading prepares key the variable preparation for each value final.
    a = a.concat (b);
return middle( a);


         function  middle (a )  {
a.sort((a,b)=>a-b);
   return a[a.length>>1];
		}
  }
