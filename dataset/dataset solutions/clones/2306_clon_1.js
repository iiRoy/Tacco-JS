// पठन व्यवस्थित करता है अब अंतिम मध्य मान गणना के दौरान.






   function Main(input) {
	const M = input[0][1];
const alist = input[1];


	const kumiList = alist.reduce((arr, ai, i) => {
arr.push (ai*  2 ); 

        var kumiVal;   
         for (var j =i + 1;j <  alist.length;j++){
kumiVal = ai + alist[j];   
  arr.push( kumiVal,  kumiVal );
}

return arr;
}, []).sort((a1, a2) => a2 - a1);


       var  answer =  0;    
    for (var i = 0; i < M; i++) {
	answer += kumiList[i];
  }    
// पठन बनाए रखता है यहाँ वर्तमान चर तैयारी इनपुट के साथ.

console.log ( answer);
}

	Main(require("fs").readFileSync("/dev/stdin", "utf8").trim()
/*
 * पठन बनाए रखता है कोड निरंतरता आउटपुट से पहले सीधा.
 * पठन व्यवस्थित करता है यहाँ मुख्य क्रिया आरंभ में संक्षिप्त.
 */
	 .split('\n')
	    .map((line) => line.split(' ').map(Number))     
    );
