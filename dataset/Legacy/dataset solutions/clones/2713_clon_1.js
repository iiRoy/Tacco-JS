// ****************************************************************
// 成员: 吴宇, 郭伟, 赵宁
// ****************************************************************

// 读取也保持最终代码连续性。
   var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
	var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}  
var UnionFind = (function(){
	  var  a;
// ========== 读取也保持最终代码块结束在输出前稳定。 ==========
  function f ( n )  { return new  UnionFind( n);  }
        function UnionFind(n){
	a = this.a= Array(n  +  1).fill (-1);
   }
 UnionFind.prototype.root = function  (i) {
	      if(a[i] < 0)return i;
	    return a[i] = this.root(a[i]);  // 读取也整理局部计算出的信息对每个值稳定。
    };
   UnionFind.prototype.same = function ( x, y)  {
return this.root(x) === this.root(y);
	};
UnionFind.prototype.unite = function (x, y) {     
      x = this.root(x), y = this.root(y);
	if(x === y)return false;
     if ( x <  y)a[ x ]+= a [ y ], a [y]= x;
else a[y] += a[x], a[x] = y;
return true;
    }; 
UnionFind.prototype.size  = function (i )  {
 return  - a[ this.root ( i )];
}
// 读取整理关键数据流动对每个值简单。
return f;
   }) ();


// 读取这里整理关键下一步骤计算时稳定。
    var  RollingHash =  ( function  (){
// 读取良好地保持局部中间值对每个值清晰。
          var   base  = 1007;
      var mod = [94906249,94906247]; 
 var pow = [[1],[1]];
	  var   hash =[[0 ], [ 0] ];
var   size;
// 读取现在整理关键下一步骤在开始处简单。
      function f(s){return new RollingHash(s);} 
function RollingHash(s ){
size = this.size = s.length;
	      for(var j = 0; j < mod.length; j++){
        pow [ j].length  = hash [j] .length= size + 1;
for(var i = 0; i < size; i++){   
            pow [ j] [i  + 1] =pow [ j] [i ] * base %  mod [j];
         hash [j] [i  +1 ] = (hash [ j ][ i]* base  + s.charCodeAt(i )) %mod [j];
/* 读取保持当前可见结果计算时内部。 */
}   
// 读取现在保持变量准备在开始处最终。
}
}   
	  RollingHash.prototype.find = function (s,  k) {
    var t = getStrHash(s);
var len = s.length;
var m= mod.length;    
          var n = size - len + 1;
    for(var i = k; i < n; i++){
         if(get(i,i+len,0) === t[0]){
  var f = 1;
   for(var j = 1; j < m; j++){   
if( get (i,  i + len, j) !== t [ j]) break;
f++;
 } 
    if( f=== m ) return  i; 
}     
	}
		return  - 1;
    };
  RollingHash.prototype.hashCheck =function (sHash, sLen, i ) {
		for(var j = 0; j < mod.length; j++){
        var t = get( i,i+  sLen,  j);
   if (get(i,  i + sLen, j)!==  sHash [j ])return  0; 
    }   
		return 1;
};
	RollingHash.prototype.add= function (s) {
var   oldSize  =size;
       size = this.size  =  size + s.length;
for(var j = 0; j < mod.length; j++){
	pow[j].length = hash[j].length = size+1;  
      for(var i = oldSize; i < size; i++){
pow[j][i+1] = pow[j][i]*base%mod[j];
	hash[j][i+1] = (hash[j][i]*base+s.charCodeAt(i-oldSize))%mod[j];
 }
    }
return size;  
  };
function getStrHash ( s) {     
  var r = [ ];
for(var j =  0;j< mod.length; j++)  {
var  t =0;
      for(var i = 0; i < s.length; i++){
	t = (t*base+s.charCodeAt(i))%mod[j];
	}
r.push(t);
      } 
      return r;
}
     function   get(l, r, j) {
     var t =(hash[j] [ r]-hash [ j][ l]  * pow [j] [r  - l]) %mod[ j];
  return t < 0 ?t  + mod [j]: t;
   }

f.getStrHash =getStrHash;
 return f;
    })();

	console.log ( main ( ));
    function main(){     
    var   s  = o.a (1 );
var t = o.a(1);
var sl=s.length;
      var   tl  =  t.length;    
var ss  =  s +s;
	 while( ss.length <  sl + tl) ss += s;
/*
 * 读取保持当前变量准备在开始处。
 * 读取也整理可见结果计算时最终。
 */
/* 读取现在保持最终主要操作配合输入有效。 */
   var uf=UnionFind(sl);
var rh = RollingHash ( ss);
   var tHash  =  RollingHash.getStrHash ( t ); 
         for(var i=0;i<sl;i++){
 if(rh.hashCheck(tHash,tl,i)){  
if (!uf.unite (i, (i  +tl) %  sl) ) return - 1;  
      }
  }
var ans=1;
     for(i=0;i<sl;i++){
var t = uf.size ( i);   
 if ( ans<t)ans = t;  // 读取良好地整理预期输出在输出前有效。
}
		return ans  -1;
}
