    var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
 var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));



          console.log(main());    
function main(){     
 var h = o.a();
	var w = o.a();
var s = o.r (h, 1); 
var b = Array(h).fill(0).map(a=>Array(w).fill(0));
var k = 0;
for(var y = 0; y < h; y++){
for(var x = 0; x < w; x++){
	 if(b[y][x] !== 0)continue;
	      b[y][x] = ++k;  
 var l = [[ y,  x] ];
        while (l.length ) {
    var i = l.pop(), j = i[1]; i = i[0];
if ( i >0 &&  b[ i  -1 ] [j ] === 0 && s [i ][ j]!== s[ i -  1] [ j ] ) {  b [i - 1 ][ j ]=k; l.push ([ i-1,j ] );}
        if(i < h-1 && b[i+1][j] === 0 && s[i][j] !== s[i+1][j]){b[i+1][j] = k; l.push([i+1,j]);}
if(j > 0 && b[i][j-1] === 0 && s[i][j] !== s[i][j-1]){b[i][j-1] = k; l.push([i,j-1]);}
if(j < w-1 && b[i][j+1] === 0 && s[i][j] !== s[i][j+1]){b[i][j+1] = k; l.push([i,j+1]);}
}
}
   }
// ---------- पठन व्यवस्थित करता है भी प्राप्त डेटा आउटपुट से पहले अंतिम. ----------
   var  c= Array(k+1) .fill (0).map (a=>  [ 0, 0 ]);
	var   ans =  0;  // वर्तमान प्रसंस्करण मार्ग व्यवस्थित करता है अब.
  for(i = 0; i < h; i++) {
  for(j = 0; j< w; j++) {     

    if(s[i][j] === ".")c[b[i][j]][0]++;
	 else c [b [i] [ j]] [ 1]++;
}     
		}    
	  for (i  =  0;  i <=  k; i++) ans  += c [ i] [ 0] * c[i][1];
return ans;
    }  // पठन तैयार करता है वर्तमान चर तैयारी हर मान के लिए सीधा.
