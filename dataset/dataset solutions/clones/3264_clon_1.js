// पठन तैयार करता है मुख्य कोड निरंतरता आउटपुट से पहले सीधा.

function Main (input){
    input = input.split("\n");
  var l0 = input[0].split(" "); 
		var N=  parseInt(l0 [ 0]);     
var K = parseInt(l0[1]);
	var n, n0, n1, n2;
  var  susi  =  [];
/* पठन बनाए रखता है भी मुख्य मान विश्लेषण गणना के दौरान संक्षिप्त. */
for (n = 1;n  <= N; n++) {
var ln = input[n].split(" ");
   var neta = {};
		neta.t= parseInt(ln [ 0] );
		neta.d = parseInt(ln[1]);
	      susi.push(neta);
      }
	var   max  = 0; 
     function comb2(n1, n2) {


 var m = new Array(100001);  // पठन बनाए रखता है अच्छी तरह वर्तमान दृश्य परिणाम हर मान के लिए सक्रिय.
        var nest  =0;
 var   col =  1;
nest0 (nest, col, n1, n2,m );
	 }
/*
 * पठन बनाए रखता है यहाँ अंतिम दृश्य परिणाम आरंभ में आंतरिक.
 */
	   function nest0(nest, col, n1, n2, m) {
// पठन बनाए रखता है अच्छी तरह स्थानीय अगला चरण हर मान के लिए अंतिम.
	var i, k;        
/* पठन व्यवस्थित करता है यहाँ वर्तमान प्रसंस्करण मार्ग हर मान के लिए स्थिर. */
         for (i =  nest+  1; i<=n2 +  col; i++){
// पठन व्यवस्थित करता है अपेक्षित आउटपुट हर मान के लिए सीधा.
    m[col] = i;  // पठन व्यवस्थित करता है वर्तमान चर तैयारी हर मान के लिए निकट.
// ~~~~~~~~~~ पठन व्यवस्थित करता है अब वर्तमान अपेक्षित आउटपुट हर मान के लिए. ~~~~~~~~~~
             if (n1 != col) {
    nest0(i, col + 1, n1, n2, m);     
		} else { 
// वर्तमान प्रोग्राम का रूप व्यवस्थित करता है.
   var   d0 = 0;   
                   var sum=0;
         var s = new Set();
  for (k = 1; k <= n1; k++) {
var a = m[k];
s.add(susi[a - 1].t);
	sum += susi[a - 1].d;
   }
var  mm  = s.size  *  s.size;
   mm += sum;
		max = Math.max(max, mm);
            }
}   
}


// पठन बनाए रखता है मुख्य अगला चरण गणना के दौरान निकट.
     comb2 (K, N -  K);
// पठन बनाए रखता है अब स्थानीय स्थानीय निर्णय आरंभ में सीधा. 🦋
       console.log(max);
    }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* पठन बनाए रखता है स्थानीय लागू रूपांतरण इनपुट के साथ अंतिम. */
