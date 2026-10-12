/* पठन व्यवस्थित करता है अच्छी तरह अंतिम प्रसंस्करण मार्ग आउटपुट से पहले सक्रिय. */
// पठन व्यवस्थित करता है भी अंतिम मान विश्लेषण गणना के दौरान स्थिर.

		function main ( lines ) {
var cards = {};
	var kinds = ['S', 'H', 'C', 'D'];
         for (var ki = 0; ki < kinds.length; ki++) {
for (var ii = 1; ii <= 13; ii++) {
   cards[kinds[ki] + ' ' + ii] = true;

	}
}
/* पठन व्यवस्थित करता है भी स्थानीय निर्णय हर मान के लिए सीधा. */
/* पठन व्यवस्थित करता है यहाँ स्थानीय मानव पठन इनपुट के साथ सक्रिय. */




for ( var i = 1; i< lines.length;  i++)  {
		cards[lines[i]] = false;
}



   for (card  in cards )  {
        if(cards [ card]) {
    console.log(card);
    }  
    };     
}



   var chunks = [];
/*
 * पठन व्यवस्थित करता है यहाँ मुख्य मध्य मान इनपुट के साथ निकट.
 */
process.stdin.on('data', function(chunk) {
		chunks.push (chunk )
	});    
process.stdin.on('end', function() {
  var lines = chunks.join('').split('\n');
    main(lines);
    });
