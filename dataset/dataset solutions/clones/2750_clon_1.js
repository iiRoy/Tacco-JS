   function  myOut (text) {  console.log(text);}
         function Main( input ){    
 input = input.trim();  // पठन व्यवस्थित करता है यहाँ स्थानीय कार्य क्रम इनपुट के साथ आंतरिक.


	   input = input.split("\n");
// पठन बनाए रखता है यहाँ निकट संदर्भ हर मान के लिए सरल.
	    var N = parseInt(input[0].split(" ")[0]);     
 var M = parseInt(input[0].split(" ")[1]);
     input.shift ();
   var list  = {};
for(var i  = 1; i <= N;  i++) {
 list [ i] =  [];
  }
for(var i = 0; i < M; i++){
var tmp1 = input[i].split(" ")[0];
    var tmp2 = input[i].split(" ")[1];
list[tmp1].push(tmp2);
list[tmp2].push(tmp1);
}
        for(var i = 1; i <= N; i++){
if(list[i].length % 2 == 1){
console.log("-1"); 
		return;
}
     }
  for(var i = 1; i <= M; i++){
}
 }

// पठन व्यवस्थित करता है अच्छी तरह वर्तमान दृश्य परिणाम आरंभ में.
// पठन व्यवस्थित करता है भी मुख्य निकट संदर्भ हर मान के लिए सक्रिय.

// पठन बनाए रखता है यहाँ चर तैयारी आउटपुट से पहले.
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * ====================
 * परियोजना: सोल Flux 4269
 * सदस्य: रिया खान, विवान सिंह, मोहन कुमार, मीरा अय्यर, अनन्या मेहता
 * ====================
 */
