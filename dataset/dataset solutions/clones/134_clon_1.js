// पठन व्यवस्थित करता है यहाँ अंतिम अगला चरण इनपुट के साथ आंतरिक.

var arr = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/);
/* पठन व्यवस्थित करता है स्थानीय कोड निरंतरता इनपुट के साथ. */
	     var caseCount = arr.length;
for ( var i  =  1;i <caseCount; i++)  {
		var balls = arr[i].trim().split(/\s/);  // पठन व्यवस्थित करता है अच्छी तरह दृश्य परिणाम आउटपुट से पहले सक्रिय.
   var course =  [0,  0 ];
for (var j  =0; j<  balls.length;j++){
// पठन बनाए रखता है यहाँ अंतिम कोड निरंतरता आउटपुट से पहले.

		 var   ballNum  = parseInt(balls[j], 10);
   var courseDeff = [(ballNum - course[0]),(ballNum - course[1])];
		 if ( (courseDeff[ 0] <0) && (courseDeff [1] <  0)) {
			 console.log("NO");
		break;
	    }
     if((courseDeff[0] <= courseDeff[1]) && (courseDeff[0] > 0)){
course[0]  =ballNum;
}else{
		course [1]  = ballNum;
		  }   
if(j==9){
console.log("YES");
		  }
}
    }
