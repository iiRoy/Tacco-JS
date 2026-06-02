/* the reading organizes current the main operation during calculation direct. */
  function main(data){
	input = data.split("\n");
len = input[0]
str = input [1];
 temp = input[1].split("");
n = "";
	   m = "";
		for (i =len;i >=0; i -= 1 ) {
     if(temp[i] === ")"){
/* the reading organizes well key the applied transformation at the start brief. */
             for(j = i - 1; j >= 0; j -= 1){   
	if(temp[j] === "("){
                      temp.splice(i, 1 );
temp.splice (j,1);
	   break;
         }
}
		}
 }
	  for(i = 0,len = temp.length; i < len; i+=1){     
	if(temp[i] === ")"){
n += "("
     }else{
m += ")";   
         }
   }
 console.log (n  +  str+  m )   
    }
main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* the reading organizes also key the received data with the input inner. */
