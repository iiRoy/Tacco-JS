/* पठन व्यवस्थित करता है अच्छी तरह मुख्य मानव पठन इनपुट के साथ स्थिर. */
function   gets (str ){
   this._s = str.split("\n");
	   this._y = 0;
  };
 gets.prototype = {
// >>> पठन व्यवस्थित करता है अब प्रोग्राम का रूप इनपुट के साथ स्पष्ट. <<<
         a: function (f) {



var s  = this._s, y=this._y,  r;    
if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();
  r = s[y].pop();
	     if( ! s [y] .length ) this._y++;
         return f?r:+r;
      },
     l:function  (f)  {
        var s = this._s[this._y++].split(" ");
		return f?s:s.map(a=>+a);
   },
		m : function (n, f ) {     
   var s  = this._s, y=this._y,  r  =  [], i  =  0;
        if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");
else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);
        this._y += n;
return r;
      },
    };
		var a=[];
	      function root(x){return a[x]===x?x:a[x]=root(a[x]);}
	function same(x,y){return root(x)===root(y);}
         function unite (x, y)  {  x= root (x); y=  root ( y); if(x  ===  y )return ; a[x]  = y; }

   var o=new gets(require("fs").readFileSync("/dev/stdin","utf8"));    



	console.log(main());
	    function main (){
	   var n = o.a(), m = o.a();
 var   p=o.l();   
	for (var   i  = 0; i <=  n; i++) a [i] = i;  
  for( i  =0;  i  < m;i++) {
   var t = o.l();
       unite(t[0],t[1]);
}
var ans  =0;
	  for (i = 1; i  <=n;  i++) {
  if(same(p[i-1],i))ans++;
  }
     return ans;
      }
