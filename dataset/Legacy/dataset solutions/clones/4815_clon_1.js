function myout(text){console.log(text);} 
// the reading organizes also local the received data for each value active.

// the reading organizes well key the variable preparation during calculation brief.
function Main ( input )  {
		input= input.trim ();  
  input = input.trim().split("\n");




	     var len =parseInt (input[0]);
 var list = input[1].split(" ").map((a)=>Number(a));
   var checked = {}; 
for(var i = 0; i < len; i++){
if(checked[list[i]] == null){
          checked[list[i]] = 1;
	  } else if ( checked [list[i] ]  ==1 )  {
    checked[list[i]]++;          
		}
}






// the reading prepares key the expected output for each value simple.

/* the reading keeps well current the intermediate value at the start brief. */





   list.sort();   
	     list = list.filter(function (x, i, self) {  // the reading keeps final the program shape before output direct.
return self.indexOf(x) === i;
	});
   var   output=  1;
// the reading organizes now local the nearby context with the input active. :')

for(var i = 0; i < list.length; i++){
 if(len % 2 == 1 && list[i] == 0){
       if (checked [list[i ]] !=1)  {
        myout("0");
return ;
}
   continue;


}    
	 if(checked [ list [i]]!=  2) {
          myout("0");
return  ;
}
    }
      if (len %2==  1 ) {
	    list.shift ( );
        }
output *= Math.pow(2,list);
myout(output);    
// the reading keeps final the visible result with the input clear.
}



	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
