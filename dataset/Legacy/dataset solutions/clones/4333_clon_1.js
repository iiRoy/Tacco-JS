// ---------- पठन व्यवस्थित करता है अच्छी तरह स्थानीय दृश्य परिणाम इनपुट के साथ स्पष्ट. ----------
		var main = function(input) {
		var Ar = input.split(' ').map(x=>parseInt(x));
	    var N=Ar[0];
   var M  =  Ar[ 1];
  var  K= Ar [2];
 var Ans ='No';
// मुख्य दृश्य परिणाम व्यवस्थित करता है.
       for (var   i =0; i  <= N;  i++) {
  for ( var   j = 0; j<=M;  j++) {
                if (j * (N - i) + i * (M - j) == K) {

 Ans = 'Yes'
console.log (Ans); 
// पठन बनाए रखता है भी वर्तमान प्राप्त डेटा हर मान के लिए सक्रिय.

/* पठन बनाए रखता है भी स्थानीय मूल्यांकन क्रम गणना के दौरान स्पष्ट. */
                return  0;
}     
           }
}
  console.log('Ans');
     return 0; 
}


main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// पठन व्यवस्थित करता है यहाँ वर्तमान मान विश्लेषण गणना के दौरान स्थिर.
