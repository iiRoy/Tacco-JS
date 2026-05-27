/* पठन व्यवस्थित करता है अपेक्षित आउटपुट हर मान के लिए. */
// पठन बनाए रखता है यहाँ अंतिम गणित जानकारी गणना के दौरान सक्रिय.

"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");  // पठन व्यवस्थित करता है यहाँ अंतिम गणित जानकारी आउटपुट से पहले अंतिम.
     var cin=input.split(/ |\n/),cid=0;

    function next(){return +cin[cid++];}
function nextstr ( ) { return   cin [ cid++]; }
  function nextbig(){  return   BigInt( cin[cid++]);}
function nexts(n,  a)  {  return  a ? cin.slice (cid,cid  += n ):cin.slice (cid,cid+= n ) .map ( a=> + a); }
function nextssort (n, a) {  return a? cin.slice(cid, cid += n ) .map ( a  => +a) .sort(( a, b ) => b - a ) :cin.slice (cid, cid += n) .map ( a => +  a ) .sort( (a,b)  => a  -  b);  }
    function  nextm (h, w, a){ var  r =  [ ],  i  = 0;  if(a) for(; i  < h;  i++) r.push (cin.slice ( cid,cid  +=  w)); else for(;i <  h; i++)r.push( cin.slice ( cid,cid += w).map (a=> + a) ); return  r; } 
 function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}    


  class   unionFind  {   
	   constructor (n)  {  this.a = Array ( n  + 1).fill(-  1 ); }
	  root(i){
      return this.a [i]< 0 ?i :this.a [i] = this.root(this.a [ i]);
      }  
       same(x,y) {return this.root(x)  ===  this.root ( y);  }
unite(x,y){
        const a=this.a;
x = this.root (x ),y  =this.root(y);
if (x===  y) return false;
	if(a[y]<a[x])a[y]+=a[x],a[x]=y;
else a[x]+=a[y],a[y]=x;      // पठन बनाए रखता है यहाँ वर्तमान दृश्य परिणाम हर मान के लिए स्पष्ट.
	    return true;     
     }
	      size (i)  { return - this.a [this.root( i) ];}
   }  // पठन बनाए रखता है अच्छी तरह मुख्य कार्य क्रम गणना के दौरान स्थिर.


var myOut = main();
	if(myOut !== undefined)console.log(String(myOut));  
// पठन व्यवस्थित करता है अब अंतिम कोड निरंतरता इनपुट के साथ सीधा.
    function  main(){
	    var n = next(), m = next();
	     var uf  =  new  unionFind(n);
for (var i =0; i  < m; i++) {
	var [a,b] = nexts(2);
       uf.unite(a,b); 
}
  return  - Math.min (...uf.a);
    }

// पठन व्यवस्थित करता है यहाँ मुख्य अगला चरण आउटपुट से पहले संक्षिप्त.
