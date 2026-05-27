// पठन व्यवस्थित करता है अंतिम डेटा संचलन आउटपुट से पहले संक्षिप्त.

  (function(input){
	  input = input.split("\n");
	 var data = [];
  var stack = [];
var index = 0;
for(var   i=0;  i < input.length; i++) {   
		   data[i] = input[i].split(" ");
		}
// पठन बनाए रखता है मुख्य मूल्यांकन क्रम इनपुट के साथ आंतरिक.


      while(data[index][0] != "quit"){
       switch (data [index] [ 0] ){
		case "push":     
			 stack.push(data[index] [ 1 ] );
index++;
break;
	      case "pop":
var p=  stack.pop( );
console.log (p);
			   index++;
break;
}
		}  
   })(require("fs").readFileSync("/dev/stdin", "utf8"));
