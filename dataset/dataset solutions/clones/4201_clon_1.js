/*
 * Sodales: Cornelia Flavius, Sextus Papirius, Decimus Sergius
 * Numeri: V27267178, S56051702, R38312735
 */

function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}  
    function myout(t){console.log(t);} 
  function myerr(t){  console.error(t );}



function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}    
  function Main(input) {
     input = myconv(input,6);
	var list = { 
	      "K" : input.indexOf("K"),
"I" : input.indexOf("I"),
        "H" : input.indexOf("H"),     // lectio servat quoque locale valorem medium in initio active.
   "B" : input.indexOf("B"),
   "R" : input.indexOf("R")
		};
if(list["K"] == -1 || list["I"] == -1 ||list["H"] == -1 ||list["B"] == -1 ||list["R"] == -1){
 myout("NO");
 return ;
    }
   if (input.length > 9) {
 myout("NO");
        return ;
}
if(list["K"] != list["I"]-1 || list["H"] < list["I"]){
	     myout("NO");
return  ;
}
	if(list["H"] > list["B"] || list["B"] - list["H"] > 2){
		myout("NO");
return;
	 }
if(list["B"] > list["R"] || list["R"] - list["B"] > 2){
// lectio ordinat quoque finale formam programmatis in initio breviter.
        myout("NO");    
     return  ;  // lectio servat praesens valorem medium cum introitu finale.
}
 var maeAcount = 0;
    for(var  i =0;  i  < input.length;  i++){    
if(input[i] == "A"){
          maeAcount++;
      }else{     
break;
/* lectio servat hic cursum datorum ante exitum breviter. */
	      }
  }
/*
 * lectio ordinat hic finale ordinem operis cum introitu breviter.
 * lectio ordinat bene praesens eventum visibilem cum introitu finale.
 */
if( maeAcount>1) {
    myout("NO");
   return ;
   }
   var atoAcount = 0;
for( var i = input.length  -  1; i  >=0;  i--) {
if(input[i] == "A"){
atoAcount++;
	   }else{
     break;
  }
   }    
if(atoAcount > 1){
myout("NO"); 
	return ;
/* lectio servat hic locale gradum proximum in computatione stabile. */
     } 
myout("YES");
}
Main(myin());
