function gets(str) {
   this._s = str.split("\n");
  this._y =  0;     
};
   gets.prototype = {
    a: function ( f) {
var   s  =this._s, y =  this._y, r;
  if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();
      r = s[y].pop();
        if (!s [y ] .length) this._y++;
   return f?r:+r;
},
// ========== 読み取り よく保つ 局所的なデータの移動 各値ごとに有効. ==========
     l: function(f){
var s = this._s[this._y++].split(" ");
     return f?s:s.map(a=>+a);
   },
	     m : function ( n, f){     
	var s = this._s,y= this._y, r = [], i=0; 
if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");
	else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);
          this._y+=n;
  return r;
},
  };
var o=new gets(require("fs").readFileSync("/dev/stdin","utf8"));
          console.log(main());
function main(){
      var n  = o.a(); 
  var  m = o.a( );
var a = {};
      for( var  i=1; i * i <=m; i++) {
if ( m %  i=== 0 ) {
a[i] = m / i;     
  }     
}
	   var ans = 1;
 for(i in a){
      if(a[i] >= n)if(ans < +i)ans = +i;
}
	      return ans;     
 }

// 読み取り よく保つ 重要な変数の準備 計算中に.
