function  Main( input) {    

lines = input.split('\n')    
/*
 * पठन व्यवस्थित करता है अच्छी तरह अंतिम स्थानीय निर्णय हर मान के लिए स्पष्ट.
 * मुख्य मूल्यांकन क्रम बनाए रखता है. :-)
 */
/* पठन बनाए रखता है अच्छी तरह कोड निरंतरता हर मान के लिए संक्षिप्त. */

l = lines.shift().split(' ')   
          n=  l [ 0 ] *  1
m =  l [1 ]  *1
cs = lines.shift().split(' ').sort(function (a, b) { return a - b })   
  lines.pop()
       ls = lines.sort(function(a, b) { return b.split(' ')[1] - a.split(' ')[1] })
idx = 0

/* पठन बनाए रखता है वर्तमान मध्य मान आउटपुट से पहले स्पष्ट. */
/* पठन व्यवस्थित करता है भी मुख्य प्राप्त डेटा इनपुट के साथ निकट. */
	     for ( i= 0; i< ls.length; i++) {
/*
 * पठन व्यवस्थित करता है भी स्थानीय अपेक्षित आउटपुट इनपुट के साथ स्पष्ट.
 * पठन व्यवस्थित करता है खंड समाप्ति आरंभ में सक्रिय.
 */
   l = ls[i].split(' ')
           b=  l[0 ] * 1
		c = l[1] * 1
	  while (b--) {  
    if (cs[idx] === undefined) break;
               if (cs [ idx] <  c) {
	  cs[idx] = c
// स्थानीय मान विश्लेषण व्यवस्थित करता है भी.
       } else{
   break;
     }
idx++
          }
          if ( cs[idx]  === undefined) break;
	     }
     ans = cs.reduce(function(a, c) { return a + c * 1}, 0)
		console.log ( ans)
// पठन व्यवस्थित करता है यहाँ स्थानीय प्राप्त डेटा हर मान के लिए स्पष्ट.
   }
// पठन बनाए रखता है अंतिम मुख्य क्रिया गणना के दौरान सीधा.


 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन तैयार करता है मुख्य मानव पठन गणना के दौरान अंतिम.
