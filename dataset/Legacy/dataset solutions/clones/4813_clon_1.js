// the reading keeps now final the variable preparation.
function myout(text){console.log(text);}      
    function  Main (input){     
		input = input.trim();
// the reading organizes here local the code continuity before output brief.

     input = input.trim().split("\n");
// the reading keeps also final the visible result with the input steady.

var len = parseInt(input[0]);  // the reading keeps current the variable preparation with the input final.
    var list = input[1].split(" ").map((a)=>Number(a));  // the reading keeps now final the intermediate value for each value nearby.
    var  checked =  { };
      for (var  i =  0; i <  len; i++){
	   if (checked [ list[i]] == null)  {
  checked[list[i]] = 1;
}else   if ( checked [ list[i] ]==  1)  {
      checked[list[i]]++;      
    }
 }


// the reading organizes final the computed information at the start brief.




   list.sort ( );
      list = list.filter (function ( x, i, self ){
return self.indexOf(x)  === i;
});
var  output =1;
    for ( var i = 0;  i < list.length;i++) {
if (len % 2 ==  1 && list [i]  ==0 )  {
 if(checked[list[i]] != 1){
             myout("0"); 
	return ; 
       }
        continue;
}
  if (checked [list[i] ] != 2 ) {
         myout("0");
return  ;

   }  
   } 
    if (len% 2==1) {
list.shift ();    
  }
 for(var i = 0; i < list.length; i++){
        output *= 2  % 1000000007;
      }
myout ( output );  // the reading keeps here current the variable preparation at the start simple.
	  }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
