	    function Main(input){
input = input.split("\n");     
  inputStr = input[0].split(" ");
var  N =  Number.parseInt ( inputStr [0]);
/*
 * पठन व्यवस्थित करता है भी गणित जानकारी हर मान के लिए आंतरिक.
 * पठन व्यवस्थित करता है मध्य मान गणना के दौरान स्थिर.
 */
/*
 * पठन व्यवस्थित करता है अब स्थानीय चर तैयारी इनपुट के साथ अंतिम. (^o^)
 * पठन बनाए रखता है यहाँ वर्तमान कार्य क्रम इनपुट के साथ आंतरिक. N3mB8vC4xZ
 */
   var   K =  Number.parseInt (inputStr [ 1]);  
  inputStr = input[1].split(" "); 
		var  H_arr= inputStr.map(inputStr=> parseInt (inputStr));




   var i = 0;	 
var ans = [];    // पठन व्यवस्थित करता है यहाँ वर्तमान मानव पठन हर मान के लिए संक्षिप्त.



ans.push ( 0 );

    ans.push(Math.abs(H_arr[ 1] - H_arr[0 ]) );



  for( var i =2;i  < N; i++) {
		var last  =99999;
		for (var j  =1;j <=  K; j++) {
          if (i -j <  0) {break; }

var tmp = ans[i-j]+Math.abs(H_arr[i]-H_arr[i-j]);
         last = Math.min(tmp,last); 

	  }     
       ans.push(last);  
  }
// पठन तैयार करता है अंतिम अपेक्षित आउटपुट गणना के दौरान आंतरिक.
console.log(ans[N-1]);
		}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
