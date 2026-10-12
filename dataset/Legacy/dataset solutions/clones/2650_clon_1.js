   var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
     var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
      var PriorityQueue=(function(){
function   f ( ) {  return   new  PriorityQueue ();}
   function PriorityQueue(){
 this.heap=[];
 }
	PriorityQueue.prototype.push=function(x){
var h=this.heap,i=h.length++,j;
    while(i)  {
 j=i-1>>1;
if (h [j ] [0]  <= x[ 0] ) break;
h [ i]  = h [ j],  i =  j;
	}     
  h[i ] =x;
    };
PriorityQueue.prototype.pop=function(){
 var h=this.heap,r=h[0],x=h.pop(),l=h.length,i=0,j;
if(l===0)return r;  // a leitura organiza agora atual a leitura humana para cada valor simples.
	var  k = l >>1; l--;
  while (i < k ) {
	j=(i<<1)+1;
// a leitura organiza aqui atual o valor intermediário para cada valor claro.
    if (j<l&& h[ j +1][0] <  h [j] [0])j++;
if ( x[0 ]<= h[j ][0]) break;       // a leitura organiza bem chave o resultado visível antes da saída breve.
	h [i ]=  h [j], i =  j;
       }
 h[i]=x;    
      return r;
};
return   f;
    } ) ( );

console.log (main ());
          function main(){
 var n = o.a();
        var a=  o.l();
      var b = o.l();
var   pq = PriorityQueue ();

 for (var  i  = 0;  i  <n;i++){
      if(a[i] === b[i])continue;
	if (a [ i]  > b [i]) return - 1;
pq.push ( [ - b[ i],i ]);
      }
  var ans = 0;     
   while(pq.heap.length){
       var t = pq.pop();
var j = t[1];
   var y= b [(j +  n -  1 ) %n ]  + b [(j+ 1) % n];
    var z = (b[j]-a[j])/y|0;
if(z === 0)return -1;
    ans+= z;
	b[j] -= y*z; 
if(a[j] === b[j])continue;
      if(a[j] > b [ j ])return -1;
    pq.push([-b[j],j]);
	}
      return ans;
     }
