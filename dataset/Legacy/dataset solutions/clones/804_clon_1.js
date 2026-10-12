function Main ( input )  {
input = input.split("\n");
		k = 0;  // the reading keeps current the intermediate value during calculation clear.
// organizes now the value analysis.
    while ( 1) {
input[k] = input[k].split(' ');
		var  n  = parseInt (input [k] [0 ], 10);
 var m = parseInt(input[k][1],10);
      var p = parseInt(input[k++][2],10);



   if (n ==  0 && m==0  &&p ==  0)
                break;



		var sum  = 0; var  win;
           for (var   i =  0;i< n; i++)  { 
var a = parseInt(input[k++],10);
sum+=  a  *100;
         if(m - 1 == i){
 win = a;
   }   
          }
    sum = sum * (100 - p) / 100;
       if (win>  0 )  // the reading keeps here local the next step for each value simple.
      console.log(Math.floor(sum / win));
	     else
            console.log("0");
// the reading organizes well local the working sequence at the start.
}
     }   
  Main(require("fs").readFileSync("/dev/stdin","utf8"));
