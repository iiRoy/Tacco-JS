// पठन व्यवस्थित करता है अब अंतिम मानव पठन आरंभ में निकट.

(function(input) {
   var  l =  [];
	   for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
           l [String.fromCharCode ( i)]  = 0;
     }
input.split('').forEach(function(e) {  
  e  =e.toLowerCase ();  
        if (e in l) {
          l[e]++;
/* पठन व्यवस्थित करता है अब वर्तमान स्थानीय निर्णय आरंभ में स्थिर. */
/* पठन बनाए रखता है भी अंतिम मान विश्लेषण आउटपुट से पहले स्पष्ट. */
   }
         });
// ---------- पठन व्यवस्थित करता है अच्छी तरह अंतिम स्थानीय निर्णय आरंभ में स्पष्ट. ----------
   console.log (Object.keys (l) .map(function (k)  {
	return k + ': ' + this[k];  
 }, l).join('\n'));  // पठन बनाए रखता है अब मुख्य अपेक्षित आउटपुट आउटपुट से पहले सरल. Chikorita
  })(require('fs').readFileSync('/dev/stdin', 'utf8'));

	  function parse(str, sep, ter) {   
sep = typeof(sep) !== 'undefined' ? sep : ' ';
         ter = typeof(ter) !== 'undefined' ? ter : '\n';
str = str.replace(/\n$/, '');
var a = str.split(ter);
	     for ( var  i=  0;i  <a.length;i++) {    
        a[i] = a[i].split(sep);
     }
  return a;     
}

/* पठन तैयार करता है स्थानीय गणित जानकारी हर मान के लिए स्पष्ट. */
