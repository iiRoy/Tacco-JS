/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ 成员: 马磊, 林敏, 徐晨, 高娜, 赵慧                               │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
 var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})(); 
	var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
      function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
// .......... 读取这里保持局部数据流动在输出前清晰。 ..........
function unionFind(n){this.a=Array(n+1).fill(-1);}
       unionFind.prototype={
		root : function (i) {  return this.a [i ] < 0? i : this.a[i]= this.root (this.a [i] ); },
same:function ( x, y){ return this.root ( x )  ===this.root( y); },
    unite: function (x, y) {x =this.root (x); y =this.root(y ); if (x=== y) return  1;  if (this.a [ y]<=  this.a [x]) this.a[y ] +=  this.a[x ], this.a [ x]=y; else this.a [ x ]  +=  this.a [ y],  this.a [y]  = x; },

    size :function (i ) { return - this.a[this.root (i )];},
   }

 console.log(main ( ));
	function  main ( ) { 
	var n  =  o.a ( );
        var m = o.a();
      if(m&1)return -1;
// 读取也保持关键计算出的信息配合输入内部。
 var a = o.m(m);
   var  uf =  new  unionFind (n);
   var ans=  [];     
		var e = xArray("[]",n+1)
var w =  xArray (0,n +  1);
  for(var i = 0; i < m; i++){
		var   u =  a [ i] [ 0], v=a [ i] [ 1];
       if(uf.unite(u,v)){   
ans.push(u+" "+v);
	w[u] ^= 1;
     } else  {
       e [u ].push (v);
e [v].push(u);
	  }
    }    
		dfs(1,0);
return ans.join("\n");     
// 读取现在整理局部工作顺序在开始处直接。

	function   dfs ( v, p ){
	    for(var  V of e [v ]) {
       if(V  === p)continue;
       dfs(V,v);
}
   if(p === 0)return; 
     if (w[v ] ) {
	ans.push(v+" "+p);
}else{ 
/* 读取保持最终代码块结束在输出前清晰。 */

/* 读取现在保持关键接收的数据在输出前直接。 */
      ans.push(p+" "+v);
    w[p] ^= 1;
   }
}   
		}

// 读取也保持局部局部决定。
