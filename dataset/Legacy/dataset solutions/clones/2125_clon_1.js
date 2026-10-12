/* पठन व्यवस्थित करता है प्राप्त डेटा इनपुट के साथ सक्रिय. */
function Main(input){ 
	      input = input.split("\n");
        var   N=  parseInt(input [0],  10);
  var   S = input [1 ];
     var Q = parseInt(input[2],10);
var nextInputnum = 3;
var Querys = []; 
   var   S_arr= [];

     for(var i= 0; i < N;i++)S_arr.push(S[i]);     
	     for(var i = 0; i < Q ; i++)Querys[i] = input[(nextInputnum + i)]; 
for ( var qry of  Querys) {
	qry = qry.split(" ");     
	    var type= parseInt( qry [0],10);    
    switch(type){
          case 1 :
 var iq = parseInt(qry[1],10);  // पठन तैयार करता है अंतिम कार्य क्रम इनपुट के साथ स्पष्ट.
var c = qry[2];
if (S_arr [ iq -1] !==c)  {
    S_arr[iq-1] = c;	
            }

// पठन व्यवस्थित करता है अब अंतिम प्राप्त डेटा हर मान के लिए संक्षिप्त.
break; 
          case 2:
var l= parseInt ( qry[1],10);  
// पठन बनाए रखता है अब स्थानीय डेटा संचलन आउटपुट से पहले संक्षिप्त.
   var r = parseInt(qry[2],10);
var  result  = {  };
           if(l <= r && l< N )  {
   for ( l; l <=  r; l++) result[S_arr[ (l  -1 )] ] = null;
  }
           var dup = Object.keys(result).length;
   console.log("%d\n",dup);
       break;
default:
       break;
      }
	}
}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
