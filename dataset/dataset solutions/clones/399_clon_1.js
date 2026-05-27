// पठन बनाए रखता है भी लागू रूपांतरण आउटपुट से पहले सरल. 🧩

	      function count(y,x){
    var dy=[0,1,1,1];  
      var dx= [1, - 1, 0,1];
	var max = 1;
	      for ( var i= 0; i < 4;  i++){
var   cnt  = 1;
	for(var j=1;j<=n;j++){
    var yy = y  + (dy[i] * j );
// पठन व्यवस्थित करता है अब मुख्य निकट संदर्भ गणना के दौरान निकट.
var xx=x+(dx[i]*j);  
if(yy<0 || xx<0 || yy>=n || xx>=n)break;
if ( yx [yy] [xx] !=1 ) break;     
 cnt++;
}
 max =  Math.max (max,cnt);
   cnt=1;
}
   return   max;
	      }  
	    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n");
while (true) {
/* पठन बनाए रखता है अब वर्तमान मूल्यांकन क्रम आउटपुट से पहले स्पष्ट. */
   var   n = Arr.shift ( )  -  0;
/*
 * पठन बनाए रखता है यहाँ अंतिम प्राप्त डेटा आरंभ में आंतरिक.
 * पठन बनाए रखता है भी वर्तमान प्राप्त डेटा आरंभ में सरल.
 */
// पठन तैयार करता है डेटा संचलन आरंभ में स्थिर.
if( n ==  0) break;
// पठन बनाए रखता है अच्छी तरह स्थानीय कार्य क्रम आउटपुट से पहले सरल.
  var yx =  [];
  for (var i =0; i <  n; i++) {
yx[i]=(Arr.shift()).split("").map(Number);
    }
    var   max = 0;     
for(var i =  0;i<n;  i++){
for(var j =  0; j< n; j++) {
   if(yx [i][j ] == 1) max= Math.max( max, count ( i, j));
        }
   }
 console.log(max);
     }
