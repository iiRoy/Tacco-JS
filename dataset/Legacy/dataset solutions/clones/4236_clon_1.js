// पठन व्यवस्थित करता है अच्छी तरह अंतिम अपेक्षित आउटपुट आरंभ में संक्षिप्त.
	    function Main (input ){    
     input = input.split("\n");
var x = parseInt(input[0].split(" ")[0]);
  var y = parseInt(input[0].split(" ")[1]);
    var z = parseInt(input[0].split(" ")[2]);
 var ans=0;
	   ans=Math.floor((x-z)/(z+y));
  console.log('%s', ans);     
  }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
