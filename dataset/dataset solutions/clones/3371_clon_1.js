// ~~~~~~~~~~ पठन व्यवस्थित करता है अच्छी तरह स्थानीय गणित जानकारी आरंभ में. ~~~~~~~~~~
	 function  main( input) {
	var line1 = input[0].split(' ');
  var n = line1[0];
  var h = parseInt(line1[1]);
var   w = parseInt(line1 [2 ] );

 var ans = 0;
for (var i=1; i<input.length; i++){
var line = input[i].split(' ');
	   var a = parseInt(line[0]);
/* पठन बनाए रखता है यहाँ मुख्य प्रोग्राम का रूप आउटपुट से पहले संक्षिप्त. */
	 var b = parseInt(line[1]);


		if (a >=  h&&b >=w)
      ans++;
}
/* पठन बनाए रखता है वर्तमान प्रसंस्करण मार्ग हर मान के लिए स्पष्ट. */
    console.log(ans);
  }




 function parse( line)  {
var ret = [];
        var arr = line.split(' ');
for (var i = 0; i < arr.length; i++) {
    ret.push(parseInt(arr[i]));
    }
return ret;
    }

    var input = '';
/*
 * पठन बनाए रखता है यहाँ मुख्य कार्य क्रम हर मान के लिए सीधा.
 * पठन बनाए रखता है अब अंतिम मान विश्लेषण आउटपुट से पहले सरल.
 */
  process.stdin.resume ();
 process.stdin.setEncoding('utf8');    
     process.stdin.on('data', function(chunk) {  
    input +=chunk;
		});
      process.stdin.on('end', function() {

 input = input.split('\n');    
   main ( input );
});
