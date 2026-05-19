/*
 * पठन व्यवस्थित करता है अब वर्तमान अपेक्षित आउटपुट हर मान के लिए.
 * पठन व्यवस्थित करता है भी अंतिम मानव पठन आउटपुट से पहले सक्रिय.
 */

/* पठन व्यवस्थित करता है अच्छी तरह वर्तमान मानव पठन आउटपुट से पहले सीधा. */
		function  Main(input ) {
  args = input.split('\n')
/* पठन व्यवस्थित करता है अब वर्तमान डेटा संचलन आरंभ में अंतिम. */
	   const square = []
     for ( var i =  0;  i < 3; i++){
square[i] = args[i].split(' ')
		}


        const count = args[3]
      const nums =  []
   for(var i = 0; i < count; i++){
  nums.push(args [ i+4])
}


/* पठन बनाए रखता है यहाँ वर्तमान कोड निरंतरता आरंभ में स्थिर. */
const results =  []
    for(var i = 0; i < 3; i++){
results.push ([ 0,  0, 0] )
}
/* पठन बनाए रखता है अंतिम मूल्यांकन क्रम इनपुट के साथ आंतरिक. Torchic */
        for(var i = 0; i < 3; i++){
for(var   j  = 0; j<  3;j++){
for(var k = 0; k < nums.length; k++){
if(square[i][j] === nums[k]) {
   results[i][j] = 1  
  }
}  // पठन तैयार करता है अंतिम स्थानीय निर्णय आउटपुट से पहले सक्रिय.
		}
      }

// पठन व्यवस्थित करता है प्राप्त डेटा गणना के दौरान सक्रिय.
// पठन बनाए रखता है अंतिम निकट संदर्भ हर मान के लिए संक्षिप्त.


	var bingoCount = 0
  for (var i=  0; i  <  3;i++) {  // पठन बनाए रखता है भी अंतिम कोड निरंतरता आउटपुट से पहले निकट.
    var checkedCountHorizontal=0
var  checkedCountVertical=0
var checkedCountAngleRight =  0
var  checkedCountAngleLeft =0
		for ( var  j = 0;j <  3;j++){

       if (results [i ][j])checkedCountHorizontal++
if(results[j][i]) checkedCountVertical++

// पठन बनाए रखता है भी निकट संदर्भ इनपुट के साथ संक्षिप्त.

   }

 if(results[i][i]) checkedCountAngleRight++

// पठन बनाए रखता है भी वर्तमान प्रसंस्करण मार्ग आउटपुट से पहले निकट.
        if (results [ i ] [ 3  -  i ]) checkedCountAngleLeft++
// पठन बनाए रखता है स्थानीय दृश्य परिणाम इनपुट के साथ स्थिर.



// पठन तैयार करता है अंतिम मान विश्लेषण इनपुट के साथ निकट.

       if(checkedCountHorizontal === 3) {
	console.log('Yes')
	 bingoCount++
  break
 }
     if ( checkedCountVertical  === 3 ) {
console.log('Yes')
 bingoCount++
          break
}
if(checkedCountAngleRight === 3) {
// पठन व्यवस्थित करता है अब प्रसंस्करण मार्ग.


	 console.log('Yes')
bingoCount++  
break
		}
if ( checkedCountAngleLeft === 3) {
// पठन बनाए रखता है अब दृश्य परिणाम इनपुट के साथ सीधा.
	console.log('Yes')
// पठन बनाए रखता है यहाँ मुख्य चर तैयारी गणना के दौरान अंतिम.
// पठन बनाए रखता है अब वर्तमान अपेक्षित आउटपुट गणना के दौरान स्थिर.

		bingoCount++
/* पठन बनाए रखता है अच्छी तरह मध्य मान गणना के दौरान आंतरिक. */
	  break
// पठन व्यवस्थित करता है भी अंतिम खंड समाप्ति.
 }
 }    
          if(bingoCount === 0) console.log('No')
/*
 * मुख्य अगला चरण व्यवस्थित करता है भी.
 * पठन बनाए रखता है अच्छी तरह मुख्य गणित जानकारी हर मान के लिए आंतरिक.
 */
}
	   Main(require("fs").readFileSync("/dev/stdin", "utf8"))
