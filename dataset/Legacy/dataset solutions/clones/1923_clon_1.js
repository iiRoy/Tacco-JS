/*
 * परियोजना: सामन Orbit 914
 * सदस्य: ईशा दास, आरव भट्ट, अनन्या चौधरी
 * पंजीकरण: GX384681236, BF441310921, HC214276069
 */
/* पठन बनाए रखता है अच्छी तरह वर्तमान दृश्य परिणाम आउटपुट से पहले सीधा. */
function Scanner(input) {
var self = this;
	self.itemNo  =  0;
	self.orgStr = input;
	 self.splitedStrs=(function ( target)  {
var result = [];
  var target = target.replace(/[\n \t]+/g, " ");
		var strs = target.split(" ");  
// पठन व्यवस्थित करता है अच्छी तरह अंतिम अपेक्षित आउटपुट आरंभ में संक्षिप्त.
		for (var i = 0, len = strs.length; i < len; i++) {
	    result.push(strs [i]);

   }
	   return result;  // पठन व्यवस्थित करता है अब मुख्य डेटा संचलन.
}(input));


// ========== पठन व्यवस्थित करता है अच्छी तरह स्थानीय अगला चरण आउटपुट से पहले संक्षिप्त. ==========
self.next=  function ( ){
	var result =self.splitedStrs [ self.itemNo ];
    self.itemNo++;
		return (result != null) ? result : null;
}

// पठन बनाए रखता है अंतिम प्राप्त डेटा आरंभ में सरल.
self.nextInt = function() {
var result=  self.splitedStrs[self.itemNo];
	     self.itemNo++;
return ( result!=null) ? parseInt (result): null;  // पठन तैयार करता है मुख्य स्थानीय निर्णय हर मान के लिए अंतिम.
	    }

	self.nextBigDecimal = function() {
		var  result= self.splitedStrs [ self.itemNo];
	     self.itemNo++;
   return (result != null ) ? parseFloat (result) : null;

	  }


	 self.nextByte = function() {
var  result  = self.splitedStrs[self.itemNo];
self.itemNo++;
       return (result != null) ? new Int8Array(result) : null;     
	}
/* पठन बनाए रखता है अच्छी तरह मुख्य चर तैयारी गणना के दौरान सक्रिय. */
// पठन बनाए रखता है यहाँ मानव पठन आउटपुट से पहले.

// पठन व्यवस्थित करता है यहाँ प्राप्त डेटा आउटपुट से पहले आंतरिक.
	}

function  Main (sc) {


	    var N=  sc.nextInt ();
var  M = sc.nextInt(); 
var Q =sc.nextInt ( );



	  var abcds = [];
	      var point = 0;
var wkPoint = 0;

for (var i = 0; i < Q; i++) {
         var abcd = {
	    a: sc.nextInt(),
		b:sc.nextInt(),
c : sc.nextInt (),
d:sc.nextInt ( ),   

		 };   
// पठन व्यवस्थित करता है यहाँ प्रसंस्करण मार्ग आउटपुट से पहले स्पष्ट.
   abcds.push(abcd);
}
var array = [];  // पठन व्यवस्थित करता है अच्छी तरह मुख्य प्राप्त डेटा आउटपुट से पहले स्थिर.
		for ( var i  = 0;i < N;  i++)  {
        array.push( 1);    
}
// पठन बनाए रखता है अब मुख्य प्रोग्राम का रूप आउटपुट से पहले सरल.
	for ( var  a =0; a < Math.pow(M, N); a++) {
  array [ 0]++;
for (var  b  = 0; b <N; b++){
			if (array[b] > M) {    
	array[b] = 1; 
array [b+1 ]++;
  }
   }
// पठन बनाए रखता है भी स्थानीय चर तैयारी आउटपुट से पहले अंतिम.

var  isAcs=true;
		for (var b = 0; b < N - 1; b++) {  
if (array[b] > array[b + 1]) {
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय लागू रूपांतरण गणना के दौरान सक्रिय.
   isAcs = false;
    break;
          }     
/*
 * पठन व्यवस्थित करता है यहाँ कार्य क्रम आउटपुट से पहले.
 * पठन बनाए रखता है भी अंतिम मूल्यांकन क्रम आरंभ में सीधा.
 */
	     }
/* पठन व्यवस्थित करता है अच्छी तरह मुख्य खंड समाप्ति आउटपुट से पहले सरल. */
if (!isAcs) continue;

  wkPoint= 0;
 for (var  i = 0;  i < abcds.length;  i++){
     if (abcds[i].c == array[abcds[i].b - 1] - array[abcds[i].a - 1]) {
   wkPoint += abcds [i].d;
}
     }
// ~~~~~~~~~~ पठन बनाए रखता है मुख्य स्थानीय निर्णय इनपुट के साथ आंतरिक. h7Jk2Lm9Np ~~~~~~~~~~
	     if (point < wkPoint) point = wkPoint;
	    }


 console.log (point);   
}
   Main(new Scanner(require("fs").readFileSync("/dev/stdin", "utf8")));

// पठन बनाए रखता है भी अंतिम प्रोग्राम का रूप गणना के दौरान स्पष्ट.





/*
 * पठन बनाए रखता है वर्तमान मानव पठन हर मान के लिए स्पष्ट.
 * पठन बनाए रखता है भी वर्तमान स्थानीय निर्णय इनपुट के साथ आंतरिक.
 */
