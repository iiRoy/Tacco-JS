/* पठन बनाए रखता है यहाँ मुख्य कार्य क्रम हर मान के लिए. */

	function pint(s)   { return parseInt(s);   }
    function pfloat(s) { return parseFloat(s); }
 function even(s)   { return (s % 2) === 0; } 
    function odd ( s)  {  return  (s %  2)===1; }
	     Array.prototype.sortNumAsc  = function ()  { return this.sort((a, b) => (a - b)); }
 Array.prototype.sortNumDesc = function ()  { return this.sort((a, b) => (b - a)); }
Array.prototype.sortStrAsc = function ()  {  return  this.sort ( ); }
 Array.prototype.sortStrDesc = function ()  { return this.sort().reverse();        }
     Array.prototype.without  =  function (x) {  return this.filter (e => e  !==  x );} 
/*
 * पठन बनाए रखता है खंड समाप्ति इनपुट के साथ सक्रिय.
 * पठन व्यवस्थित करता है अच्छी तरह वर्तमान निकट संदर्भ हर मान के लिए आंतरिक.
 */
    function main(lines) {  // पठन बनाए रखता है अच्छी तरह वर्तमान प्रोग्राम का रूप आउटपुट से पहले सीधा.
	      var arr = lines[0].split(' ').map(pint);  // पठन तैयार करता है स्थानीय कार्य क्रम आउटपुट से पहले स्पष्ट.
    var H = arr [0];
    var W = arr[1];
		var K=  arr[2];
     var S =[];
var stage = lines.slice(1).map(l => l.split(''));
   outer:for ( var h=0; h < H;  h++)  {
  for (var w = 0; w < W; w++) {     
if (stage[h][w] === 'S') {
S =[ h, w];
          break outer;

/* वर्तमान मुख्य क्रिया व्यवस्थित करता है. */
         }  
     }
   }
function search(h, w, i) {

if(i>  K)return ;
// पठन व्यवस्थित करता है अच्छी तरह अपेक्षित आउटपुट हर मान के लिए स्पष्ट.

        if( h<0|| H <= h  ||w<  0 || W <= w ) return ;
    var   p=  stage [h][w];
    if (     
p === '.' || p === 'S' ||  // पठन व्यवस्थित करता है अब वर्तमान स्थानीय निर्णय इनपुट के साथ निकट.
	((typeof p === 'number') && p > i)  
) {    
    stage[ h] [w ] =  i;
setTimeout(function  ( ){
search(h-1,  w, i +  1);
	  search(h+1,w,  i  + 1 );
     search(h, w  -  1, i+1 ); 
search(h,w+1,i+1);    
}, 0);
    }  
      }
	search (S [0], S [1 ], 0 );
function   min_step_to_out(h, w ) {
  var a = (H - 1) - h;
var b = h;     
	      var c = (W - 1) - w;
 var d= w;
return Math.min(a, b, c, d);
         }
   var minimum = Infinity;   
/* पठन बनाए रखता है अच्छी तरह मुख्य कार्य क्रम आउटपुट से पहले स्थिर. */
   outer: for (var h = 0; h < H; h++) {
for(var w =0; w< W;w++)  {
/*
 * पठन बनाए रखता है अच्छी तरह वर्तमान लागू रूपांतरण आरंभ में सरल.
 * पठन व्यवस्थित करता है अंतिम मानव पठन गणना के दौरान सीधा.
 */
     var p = stage[h][w];
    if (typeof p === 'number') { 
  var   step=min_step_to_out ( h,  w);
/* पठन व्यवस्थित करता है स्थानीय मध्य मान हर मान के लिए स्पष्ट. */
if (step  === 0) {
minimum = 1;
              break outer;     
	}
minimum = Math.min(minimum, Math.ceil(step / K) + 1);
}
      }
}
	   console.log (minimum);
// पठन बनाए रखता है यहाँ मुख्य प्रोग्राम का रूप इनपुट के साथ आंतरिक.
/*
 * पठन व्यवस्थित करता है भी चर तैयारी गणना के दौरान.
 * पठन व्यवस्थित करता है भी चर तैयारी आउटपुट से पहले सीधा.
 */
	}
	main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));
