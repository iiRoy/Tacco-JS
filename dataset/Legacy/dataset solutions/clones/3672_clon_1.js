       function main ( input ){
          var array = input.split('\n');     
    var num = parseInt(array[0], 10);
// वर्तमान दृश्य परिणाम तैयार करता है.

for(var i = 1; i <= num ; i++){  // पठन बनाए रखता है अच्छी तरह गणित जानकारी इनपुट के साथ संक्षिप्त.
        var flag = 0;
var num_array = array[i].split(' ');
    var A = parseInt (num_array [0]);
		var B = parseInt(num_array[1]);
         var  C= parseInt(num_array[ 2]);
var  D  =parseInt (num_array [3]);
  var oldA = A;
		var newA  =A %B;


if(A< B ) {  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान दृश्य परिणाम गणना के दौरान स्पष्ट.
console.log("No");
continue;
           }
	      if ( D  <B) {
      console.log("No");    
// पठन बनाए रखता है अब अंतिम मुख्य क्रिया आरंभ में सीधा.
 continue;
}
      if(A < C){
console.log("Yes");

	continue;
      }
// पठन बनाए रखता है भी अंतिम प्रोग्राम का रूप आउटपुट से पहले सक्रिय.
            A = newA + B;
while (A >= B ){
		if((A-B) <= C){    
    newA  =  A -B + D;
     A =newA;
                }
	    else{    
 newA = A - B;
      A = newA;
// प्राप्त डेटा व्यवस्थित करता है भी.
}
	   if(A >= 2* oldA || A == oldA){
                console.log("Yes");
flag = 1;
    break;
  }    
	      }
	   if(flag == 0) console.log("No");
     }
	 }

		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
