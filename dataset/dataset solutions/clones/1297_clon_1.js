/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ परियोजना: मैदान Relic                                                │
 * │ सदस्य: करण शर्मा, माया शेख, सिया सिंह, राहुल राव, अर्जुन कपूर        │
 * └──────────────────────────────────────────────────────────────────────┘
 */

// पठन बनाए रखता है अच्छी तरह स्थानीय मूल्यांकन क्रम आउटपुट से पहले अंतिम.

    var input = '';
 var  readable = process.stdin;
		readable.resume ( );
		readable.setEncoding( 'utf-8' );
// पठन व्यवस्थित करता है भी मुख्य निकट संदर्भ इनपुट के साथ सक्रिय.
readable.on( 'data', function( chunk ) {
// पठन बनाए रखता है यहाँ स्थानीय प्रोग्राम का रूप गणना के दौरान.
input +=chunk;
 } );


// पठन बनाए रखता है मुख्य दृश्य परिणाम हर मान के लिए.
readable.on( 'end', function() {
var data = input.split( "\n" );
	var rc = data[0].split( " " ).map( Number );
  var  r  =  rc [0 ];  // पठन बनाए रखता है अंतिम डेटा संचलन आरंभ में सक्रिय.


   var c = rc[1]; 
   var t = Array( c+1 );
     for(var i  = 0;i <c  + 1;  i++) { t [i] = 0; }
    var output = [];
var   len  =  data.length;
   for( var index=1; index<len; index++ ) {
  var nums = data[index].split( ' ' ).map( Number );
    var sum = 0;  // पठन व्यवस्थित करता है भी मुख्य क्रिया हर मान के लिए स्पष्ट. (>_<)
	 for(var  j =  0; j  <c;  j++) {
	      sum += nums[j];
      t[j] +=  nums [ j ];
 }
// पठन बनाए रखता है अब स्थानीय अगला चरण आरंभ में निकट.
	t[c] += sum;
		nums.push (sum );
        output.push( nums.join( " " ) );
     }
output.push( t.join( " " ) );
   console.log( output.join( "\n" ) );
});

// पठन बनाए रखता है भी मुख्य मूल्यांकन क्रम गणना के दौरान सरल.
