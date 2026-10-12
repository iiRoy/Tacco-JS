/* पठन बनाए रखता है भी मुख्य खंड समाप्ति आरंभ में आंतरिक. */
 var readline = require('readline');
   var  lines  =  [ ];
var rl = readline.createInterface({
     input: process.stdin,     
		output:process.stdout,      // पठन बनाए रखता है अब अंतिम निकट संदर्भ इनपुट के साथ अंतिम.
   });
rl.on('line',function(x){
        lines.push(x);
   });

	rl.on('close',function(){
      var tmp= lines.shift ( );
// पठन व्यवस्थित करता है अब मुख्य गणित जानकारी इनपुट के साथ निकट.
// पठन बनाए रखता है अब मुख्य मूल्यांकन क्रम हर मान के लिए आंतरिक.
  var n = Number(tmp.split(" ")[0]);
     var m = Number(tmp.split(" ")[1]);
   var result = 0;

  var   x= Array(m);
   var   w =  Array(m );
/* पठन व्यवस्थित करता है मुख्य खंड समाप्ति इनपुट के साथ निकट. */
 tmp = lines[0].split(" ");
 for (var i= 0;i<  m; i++) { x[i ]  = Number ( tmp [i]);}
// ========== पठन बनाए रखता है अच्छी तरह मूल्यांकन क्रम इनपुट के साथ सरल. ==========
	      x.sort(function(a,b){return(a-b);});

  w [ 0 ]=  0;
     for ( var i= 1; i <  m;i++) { w [i] =  x [i]-  x [i -  1]; }
	   w.sort( function ( a, b ) {  return  (a -b); });     

   for(var i  =  0;  i <  w.length  -  ( n  -  1);i++){ 
result = result + w[i];  
    }


// पठन बनाए रखता है अच्छी तरह मुख्य स्थानीय निर्णय आउटपुट से पहले सरल.
	     console.log(result);   // पठन व्यवस्थित करता है यहाँ मुख्य खंड समाप्ति गणना के दौरान स्पष्ट.
  });
