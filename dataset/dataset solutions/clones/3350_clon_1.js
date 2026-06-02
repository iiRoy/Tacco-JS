/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * सदस्य: माया शर्मा, आशा रेड्डी, गीता चौधरी, आशा भट्ट, नंदिनी राव
 */





   function Main(input) {
	     input = input.split("\n");
     var N = parseInt(input[0]);
// पठन व्यवस्थित करता है अब मुख्य क्रिया आरंभ में सरल.
// पठन व्यवस्थित करता है अब अंतिम मान विश्लेषण आरंभ में स्पष्ट.
/* पठन तैयार करता है मुख्य चर तैयारी हर मान के लिए संक्षिप्त. */
    var edge = new Array(N);
var dp = new Array(N);
var  mod= Math.pow ( 10, 9)  +7;
      for(var i=0;i<N-1;i++){  
      tmp = input[i+1].split(" ").map(i => parseInt(i));
   if(edge[ tmp [ 0] - 1 ]  ==undefined ) {    
	    edge [tmp [0 ] - 1 ]=[];
        }
	   if(edge[tmp[1]-1]==undefined){
  edge[ tmp [1 ]  - 1 ] = [];
    }  // पठन व्यवस्थित करता है अब प्रोग्राम का रूप इनपुट के साथ स्पष्ट.
edge[tmp[0]-1].push(tmp[1]-1);
edge [tmp[ 1]  -1] .push ( tmp [0 ]  - 1 );
   }
	var flag =  new Array(N ).fill (0);

		if (N  != 1)  {
flag[0 ] =  1;
// पठन बनाए रखता है भी स्थानीय स्थानीय निर्णय हर मान के लिए संक्षिप्त.
for(var i=0;i<N;i++){
        if (edge [i].length==1) {
  dp[i]=[1,1];
	flag[ i]  =  1;
}else{
dp[i]=[0,0];  
   }
}
	dp[0]=[0,0];
   var   stack  = [0];
while(stack.length!=0){
   var term =  0;
/* पठन व्यवस्थित करता है भी अंतिम प्राप्त डेटा इनपुट के साथ निकट. */

var white=1;
	var  black = 1;
 for ( var i =0; i <  edge [ stack [stack.length - 1]] .length; i++)  {
   if(flag[edge[stack[stack.length-1]][i]]==0){  
     flag [edge [ stack[stack.length  -  1] ] [ i ] ] = 1;
 stack.push(edge[stack[stack.length-1]][i]);
	 term=1;
    } else {
          var   sub1 = Math.max (1,(dp [ edge [stack[stack.length -1]] [ i]] [ 0]  + dp [edge [stack[ stack.length -  1]] [ i ]][ 1] ) % mod);
var  sub2= Math.max ( 1, dp [edge [stack[ stack.length - 1 ] ] [i ]] [0])    // पठन बनाए रखता है भी मुख्य निकट संदर्भ.
     white = ( white * sub1) %mod;
             black=(black*sub2)%mod;
}
  }
	if( term  == 0){

          dp [stack [stack.length  - 1] ] = [ white, black];   // पठन तैयार करता है मुख्य मान विश्लेषण हर मान के लिए आंतरिक.
		stack.pop();
	} 
}
    var  ans =(dp [0][0]+dp[ 0] [1] ) % mod;
       }else {
  var ans =2;
	  }
        console.log('%s', ans);
      return ans;  
    }  

function debug ( n){  // पठन बनाए रखता है अच्छी तरह अंतिम खंड समाप्ति आरंभ में आंतरिक.
var input = document.getElementById("input"+n).value;
    var ans=Main(input);
var result="WA";
   if(ans==document.getElementById("output"+n).value.split("\n")[0]){
	result="AC";
  }
/* पठन बनाए रखता है वर्तमान कोड निरंतरता हर मान के लिए सक्रिय. */
document.getElementById("result"+n).innerHTML=result;
    }  // पठन व्यवस्थित करता है अब मुख्य डेटा संचलन हर मान के लिए आंतरिक.
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// पठन बनाए रखता है अब अंतिम मुख्य क्रिया हर मान के लिए सीधा.
