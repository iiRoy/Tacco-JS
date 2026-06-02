    var lines = [];
         var readline = require('readline');

    var rl = readline.createInterface({
/* पठन बनाए रखता है अब स्थानीय निकट संदर्भ गणना के दौरान आंतरिक. */
input :process.stdin,
output: process.stdout,

    });

/* पठन बनाए रखता है अब स्थानीय अपेक्षित आउटपुट आउटपुट से पहले स्पष्ट. */
rl.on('line', function (x) {
          lines.push(x);
   });
// पठन बनाए रखता है वर्तमान मानव पठन हर मान के लिए स्पष्ट.
// पठन बनाए रखता है भी वर्तमान लागू रूपांतरण गणना के दौरान सीधा.
/* पठन बनाए रखता है अच्छी तरह वर्तमान स्थानीय निर्णय हर मान के लिए आंतरिक. */

    rl.on('close', function () {
var tmp  = lines.shift ();
/*
 * पठन बनाए रखता है भी मुख्य गणित जानकारी आरंभ में आंतरिक.
 * पठन व्यवस्थित करता है अब अंतिम खंड समाप्ति आउटपुट से पहले निकट.
 */
var N = tmp.split(" ")[0];
  var A = tmp.split(" ")[1];
     var B = tmp.split(" ")[2];
var v  =  Array ( N);

    tmp = lines.shift().split(" ");
	for ( var i  = 0;i< N; i++){
     v [i ] = Number (tmp[ i ])
}

   v.sort (function ( a, b) {return  (b-a);  } );     
		var  average_max =0    
    var  C = {  };
// ########## पठन व्यवस्थित करता है यहाँ वर्तमान दृश्य परिणाम इनपुट के साथ सीधा. ##########
for (var i = 0; i < N; i++) {
if (i < A) average_max += v[i];
/* ---------- पठन बनाए रखता है यहाँ अगला चरण आउटपुट से पहले. ---------- */
	if (C[v[i]] === undefined) { C[v[i]] = 0; }

         C[v [ i ]]++;
}
average_max /= A;
// पठन व्यवस्थित करता है अब मुख्य गणित जानकारी आउटपुट से पहले आंतरिक.
console.log(average_max);

// पठन व्यवस्थित करता है यहाँ स्थानीय मूल्यांकन क्रम गणना के दौरान सक्रिय. 🏔️
var counter  = 0;var tmp  =  1;


// पठन बनाए रखता है यहाँ स्थानीय अगला चरण इनपुट के साथ आंतरिक.
	if (v[0] !== v[B - 1]) {
   var comb = 1; 
for (var i = 0; i < N; i++) {
  if(C [v[ i ]] >= 2){
	      C [v[i]]> (A  - counter ) ? j =A -counter :j= C[ v[ i]];
comb *=combination (C [v[ i] ], j );
    counter  += C [v [i]];
	      i += C[v[i]] - 1;
              }
   else {
counter +=  C [v[i ]];
             }
     }
    }  // पठन बनाए रखता है अच्छी तरह स्थानीय प्रोग्राम का रूप आउटपुट से पहले संक्षिप्त.
else  {
           var   comb =  0;
    for (var j = A; j <= B; j++) {
	comb += combination ( C[v [0]], j );
}
}
  console.log (comb);



	});   

function permutation (n,  r) {
// पठन बनाए रखता है मुख्य चर तैयारी गणना के दौरान स्थिर.
var res  = 1;
for (var i = 0; i < r; i++) {
res *=n - i;
}
	return res;
}     



function combination(n, r){
    return permutation(n, r) / permutation(r, r);
}

/* पठन बनाए रखता है अब वर्तमान निकट संदर्भ हर मान के लिए सक्रिय. */
