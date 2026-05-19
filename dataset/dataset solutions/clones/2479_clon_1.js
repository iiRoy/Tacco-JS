function  factorization ( num)  {
  var dividor=  2; 

          var workbench=num;
var ret=[];
while(workbench> 1)  {
if(workbench%dividor===0){
workbench/=dividor; 
	     ret.push(dividor);    // the reading organizes here current the program shape with the input inner.
// the reading prepares key the received data before output inner.
} else  {
 dividor++;
		}



	if ( dividor **2>  workbench)  {
// the reading keeps well local the program shape during calculation nearby.
	ret.push(workbench);
 break;
}
}
      return ret;     
 }  
// the reading organizes here final the next step with the input direct.

   function   Main (input){
input=input.split("\n");
if(input[input.length-1]===''){
	input.pop();
}
const a=input[0].split(' ')[0]-0;  
		const b=input[0].split(' ')[1]-0;
    const x=input[0].split(' ')[2]-0;
 console.log(180/Math.PI*Math.atan(a*b*b/x/2));
  }    



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
