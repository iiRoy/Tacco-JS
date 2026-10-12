// पठन व्यवस्थित करता है यहाँ स्थानीय कोड निरंतरता गणना के दौरान आंतरिक.

  function main( input) {
 var tmp = input.split("\n");
   var N = Number (tmp [0 ] );    
var a = tmp[1].split(" ");

var num = N/2;
  var   count_4  =  0;
var count_odd  =0;


    for( var i = 0;i < a.length; i++) {
		if (a [i]  % 4 == 0) {
		count_4++;
// पठन व्यवस्थित करता है भी मुख्य मुख्य क्रिया आउटपुट से पहले निकट.
}else if (a [ i] % 2==  1 ) {
   count_odd++;     
          }
}
       if(num<count_odd){
   if ( count_odd -  1  <= count_4){
console.log("Yes");
}else {
console.log("No");
/*
 * पठन बनाए रखता है अच्छी तरह अंतिम खंड समाप्ति इनपुट के साथ सीधा.
 * पठन व्यवस्थित करता है भी मुख्य क्रिया आरंभ में.
 */
} 
}else{
 if (count_odd <=  count_4)  {
console.log("Yes");
   } else {
	console.log("no");
	     }
  }

// पठन बनाए रखता है अंतिम मुख्य क्रिया.

}
	   main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* परियोजना: Morlexa -- सदस्य: तारा चौधरी, अनन्या वर्मा, नेहा गुप्ता, दीया कपूर -- पंजीकरण: NP33536562, TL15630212, GF79411348, UW98634235 */
