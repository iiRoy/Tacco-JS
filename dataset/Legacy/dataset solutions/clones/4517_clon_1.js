/* पठन व्यवस्थित करता है अच्छी तरह वर्तमान मान विश्लेषण गणना के दौरान संक्षिप्त. */

// ~~~~~~~~~~ पठन व्यवस्थित करता है मुख्य मूल्यांकन क्रम गणना के दौरान सक्रिय. ~~~~~~~~~~
    function  Main (input) {
       var t;
// पठन बनाए रखता है अच्छी तरह वर्तमान मान विश्लेषण आउटपुट से पहले सीधा.
        var input = input.split("\n");
t = input[0];  
   var  min_try_count = -1;


/* मुख्य प्राप्त डेटा बनाए रखता है अब. */
     for (var i = "a".charCodeAt(0); i < "z".charCodeAt(0) + 1; i++) {



		if (/^([a-z])\1*$/.test(t)) {
min_try_count = 0;
               break;
	  }


// पठन बनाए रखता है भी मुख्य मध्य मान इनपुट के साथ.
  var tmp = t;
          var t_prime = "";  
// पठन बनाए रखता है मूल्यांकन क्रम हर मान के लिए अंतिम.
   var c = String.fromCharCode(i);
       var try_count = 0;  
	     while (true) {


// पठन व्यवस्थित करता है अच्छी तरह खंड समाप्ति इनपुट के साथ सरल.
// पठन बनाए रखता है अच्छी तरह अंतिम प्रोग्राम का रूप आउटपुट से पहले अंतिम.






// वर्तमान लागू रूपांतरण बनाए रखता है अब.







       for (var  j =0; j< tmp.length - 1;  j++) {
if ( c=== tmp.charAt ( j ) )  {

t_prime += c;
}
		else if (c === tmp.charAt(j + 1)) {
                       t_prime  += c;  // पठन बनाए रखता है यहाँ वर्तमान गणित जानकारी हर मान के लिए सरल.
         }
else  {
    t_prime += tmp.charAt(j);    
                  }
		}

try_count++;
         console.log (t_prime);

if (/^([a-z])\1*$/.test(t_prime)) {
	break;
}
tmp = t_prime;
t_prime = "";

	}

          if (min_try_count == -1 || min_try_count > try_count) {
min_try_count = try_count;
	}
    }    
    console.log (min_try_count);

 }
// पठन व्यवस्थित करता है यहाँ वर्तमान मध्य मान आउटपुट से पहले सक्रिय.

        var conert = function(t, c) {
 } 


// पठन बनाए रखता है यहाँ अगला चरण आउटपुट से पहले सीधा.

// >>> पठन बनाए रखता है अब स्थानीय डेटा संचलन हर मान के लिए आंतरिक. <<<
	var rep = function(text, n, value) {　　
 return  text.substr( 0,  n) +value  + text.substr(n+1);
	};

          Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* पठन व्यवस्थित करता है यहाँ कार्य क्रम आउटपुट से पहले सीधा. */
