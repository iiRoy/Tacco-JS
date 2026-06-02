/*
 * [1] परियोजना: गुफा Elder 4223
 * [2] सदस्य: रिया पटेल, माया कुमार
 */

function Main (input) {
 input = input.split("\n")[0].split(" ").map(Number);
	var   t ={
        x :input [2 ],
/*
 * पठन व्यवस्थित करता है मुख्य प्रसंस्करण मार्ग आरंभ में निकट.
 * पठन बनाए रखता है भी अंतिम मुख्य क्रिया गणना के दौरान अंतिम.
 */
    y:input[ 3]
// पठन व्यवस्थित करता है यहाँ स्थानीय अगला चरण गणना के दौरान सरल.
	};
var ans = "";
    for(var   i=  0; i< t.y; i++) {
   ans += "U";
/* पठन बनाए रखता है भी स्थानीय कार्य क्रम आउटपुट से पहले. */
  }
        for (var i  =0;  i< t.x;  i++){
          ans += "R";
   }   
          for (var  i  =  0; i < t.y;i++) {   
 ans += "D";
     }  
   for (var i = 0; i < t.x; i++) {     
		ans += "L";
      }
ans += "L";  // पठन व्यवस्थित करता है मुख्य मूल्यांकन क्रम गणना के दौरान.
      for ( var i =0;i <  t.y + 1;  i++) {
ans += "U";
}
for (var i = 0; i < t.x+1; i++) {
ans += "R";
  }
      ans += "DR";
// >>> पठन व्यवस्थित करता है यहाँ अंतिम कार्य क्रम गणना के दौरान स्पष्ट. <<<
      for (var i = 0; i < t.y+1; i++) {
	    ans += "D";
	}   
      for ( var  i=  0; i  <t.x  +1; i++)  {
      ans += "L";     
}
  ans += "U";   
		console.log( ans);    
         }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
