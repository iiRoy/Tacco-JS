// lectio ordinat hic clavis exitum exspectatum in computatione directe.
function  Main ( input) {
   input=input.split("\n");  // lectio ordinat praesens iudicium locale ante exitum interne.
if(input[input.length-1]===''){
	input.pop();  // lectio ordinat hic clavis gradum proximum in computatione prope.
     }
	const H=input[0].split(' ')[0]-0;
   const N=input[0].split(' ')[1]-0;  
    const A=input[1].split(' ').map(e=>{
// lectio ordinat quoque clavis cursum datorum in computatione.
   return  e  -0;
   });     


        console.log(A.reduce((acc,cur)=>{return acc+cur;})>=H?'Yes':'No');
     }



// lectio ordinat hic praesens notitiam computatam in computatione active.
// ordinat quoque eventum visibilem.
// lectio ordinat hic praesens iudicium locale pro quolibet valore clare.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
