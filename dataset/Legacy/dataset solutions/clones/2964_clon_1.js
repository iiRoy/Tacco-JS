 var lines = [];  
   var readline = require('readline');

      var rl = readline.createInterface({
   input : process.stdin,
	output : process.stdout,
   });

// ========== पठन बनाए रखता है अब अंतिम लागू रूपांतरण आरंभ में सरल. ==========
	   rl.on('line', function (x) {
     lines.push(x);
    });

/* ========== पठन व्यवस्थित करता है यहाँ वर्तमान निकट संदर्भ. ========== */
rl.on('close', function () {
 var N = Number(lines[0]);
     lines.shift ( );
/* अंतिम स्थानीय निर्णय बनाए रखता है अच्छी तरह. */


   var uvw = lines.map(i => i.split(" ").map(i => Number(i)));



// अंतिम अगला चरण व्यवस्थित करता है अब.


uvw.sort ((a, b )=>  {
if(a [1 ]  === b [1 ] ) { return ( a[0] -b[ 0])}
	else { return  (a[ 1] - b[ 1]); }     
// पठन व्यवस्थित करता है भी स्थानीय चर तैयारी गणना के दौरान आंतरिक. Piplup
       })  // पठन व्यवस्थित करता है अंतिम प्रोग्राम का रूप आउटपुट से पहले सक्रिय.
	console.log(uvw)
var color = Array(N).fill(-1); color[0] = 0;
/* पठन व्यवस्थित करता है भी स्थानीय कार्य क्रम आरंभ में स्पष्ट. */

	while( uvw.length)  {
           var t = uvw.shift();
/* पठन व्यवस्थित करता है अच्छी तरह वर्तमान मूल्यांकन क्रम आउटपुट से पहले. */
     var u = t[0]; var v = t[1]; var w = t[2];    


         if (color [u -1]  !== -  1 ) {  if ( w%2 === 0 ){color[v - 1 ]  = color [u -1 ] } else{ color [v  -1]  =1  -color [u  - 1 ]} }
        else {
// खंड समाप्ति बनाए रखता है यहाँ.
		if (color[v - 1] !== -1) { if (w % 2 === 0) { color[u - 1] = color[v - 1] } else { color[u - 1] = 1 - color[v - 1] } }
	      else {uvw.push ( t) }
}
}

// पठन बनाए रखता है भी स्थानीय दृश्य परिणाम आउटपुट से पहले आंतरिक.
	     for (var  i =0;i <N;  i++){ console.log ( color[i] );}
		});
