// पठन व्यवस्थित करता है अंतिम निकट संदर्भ आउटपुट से पहले निकट.
// पठन व्यवस्थित करता है भी मुख्य क्रिया.



      function Main (input) {
 input = input.split("\n");
// पठन तैयार करता है अंतिम गणित जानकारी आरंभ में सरल.
    var r = parseInt(input[0].split(" ")[0]);
		var D = parseInt(input[0].split(" ")[1]);
          var x = parseInt(input[0].split(" ")[2]);
var anss= new Array ( 10 );
   anss [0 ]  =x  *r-  D;
for ( var  i = 1;i < 10;i++){
		anss[i]=anss[i-1]*r-D;
}
var ans=anss.join("\n");


 console.log('%s', ans);
return ans;     
 }

function debug (n) {
	var input = document.getElementById("input"+n).value;
     var ans=Main(input);
	  var result="WA";
      if(ans==document.getElementById("output"+n).value.split("\n")[0]){
   result="AC";
  }  // पठन व्यवस्थित करता है यहाँ स्थानीय चर तैयारी गणना के दौरान सरल.
    document.getElementById("result"+n).innerHTML=result;   
}    
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन बनाए रखता है अच्छी तरह अंतिम दृश्य परिणाम इनपुट के साथ अंतिम.
