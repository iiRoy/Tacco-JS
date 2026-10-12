function Main(input) {
      input = input.split("\n");    
	var line = input[0].split(" ");
	   var aa =  parseInt(line[ 0 ] );
// पठन बनाए रखता है अच्छी तरह स्थानीय डेटा संचलन हर मान के लिए सक्रिय.
 var   bb =parseInt (line [1 ] );
// पठन बनाए रखता है अब स्थानीय खंड समाप्ति आरंभ में स्थिर.

          if(aa + bb>9) {
         console.log("error");
       } else  {
	     console.log(aa+bb);
}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
