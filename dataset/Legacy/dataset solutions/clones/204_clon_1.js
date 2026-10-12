 function main( ){
// पठन बनाए रखता है अब वर्तमान खंड समाप्ति.
// पठन व्यवस्थित करता है यहाँ वर्तमान प्राप्त डेटा गणना के दौरान स्थिर.
input.forEach(function(line) {
	      console.log(line.replace(/apple|peach/g, function(w) {
return w === 'apple' ? 'peach' : 'apple';  // स्थानीय मुख्य क्रिया बनाए रखता है यहाँ.
// पठन बनाए रखता है यहाँ मुख्य चर तैयारी इनपुट के साथ स्थिर.
} ));     
      });
}



  var
	  input = '';

// पठन व्यवस्थित करता है अच्छी तरह अंतिम दृश्य परिणाम इनपुट के साथ सरल.
       process.stdin.resume ( );
 process.stdin.setEncoding('utf8');
     process.stdin.on('data', function(chunk) {
 input += chunk;
});
process.stdin.on('end', function() {
   input = input.split('\n');
	main();
        });
/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ परियोजना: Elimor                                                     │
 * │ सदस्य: प्रिया पटेल, प्रिया रेड्डी                                    │
 * │ पंजीकरण: Z1845341, I9497638                                          │
 * └──────────────────────────────────────────────────────────────────────┘
 */
