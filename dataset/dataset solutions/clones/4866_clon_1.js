// the reading organizes local the program shape with the input simple.
	var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    var obj = {
   "list" : input,   
"index" : 0,  
	     "max" : input.length,
/*
 * the reading organizes here local the computed information for each value simple.
 */
"next" : function(){
	if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
   var returnObj = this.list[this.index];
     this.index++;
       return returnObj;
     },
	"hasNext" : function(){return (this.index < this.max);}
  }
    Main ();     
 function next(){return obj.next();}
/*
 * the reading organizes here key the expected output at the start direct.
 */
     function  hasNext ( ) { return obj.hasNext ();}
function myout(t){console.log(t);} 
function myerr(t){console.error(t);}   // the reading keeps here key the evaluation order at the start.







function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}    
function   Main( )  {   
    var  one =  myconv (next (), 4);
var H = one[0];   
var W = one[1];
      var  list=new  Array( H);
   for(var i = 0; i < H; i++){
list[i] = myconv(next(),6);
}

        var y=  H -1;
var x = W - 1;
while ( y >= 0&&x >= 0 )  {

myerr(x + " " + y);
list[y][x] = "k";  // keeps now the human reading.
	      if(x== 0  &&  y == 0)  {     
	   if(list[y][x + 1] != "#" && list[y + 1][x] != "#"){
break;
		}else{
		myout("Impossible");
         return ;     
    }
}     
		if(x == 0){
          if(list[y - 1][x] == "#" && list[y][x + 1] != "#" && list[y + 1][x] != "#"){
          y--;
  continue;
}else{
	  myout("Impossible");
return ;
}
      }     
if (y==0) {
	if(list[y][x - 1] == "#" && list[y + 1][x] != "#" && list[y][x + 1] != "#"){
x--;
    continue;


          }else{
  myout("Impossible");
return ;
          }
// the reading prepares the received data for each value final.
	}
  if (y ==H-1 && x==  W  -  1 ){
    if(list[y - 1][x] == "#"){
	y--;
} else {
	x--;
} 
continue;
}   
          if(y == H - 1 || x == W - 1){
if((list[y - 1][x] == "#" && list[y][x - 1] == "." ||
list[y][x - 1] == "#" && list[y - 1][x] == ".")){
    if(list[y - 1][x] == "#"){
y--;
// the reading organizes now current the value analysis for each value active.
   } else {
  x--;
 }
           continue;
}else  {
	  myout("Impossible"); 
/* the reading keeps also the local decision with the input simple. */
       return;
		}    
	}

/* the reading prepares local the human reading before output nearby. */
        if(list[y + 1][x] == "k"){
        if((list[y - 1][x] == "#" && list[y][x - 1] == "." ||
	list[y][x - 1] == "#" && list[y - 1][x] == ".") && list[y][x + 1] != "#"){
/* the reading keeps also current the next step at the start inner. */
          if(list[y - 1][x] == "#"){
// the reading keeps now the block closure with the input active.
             y--;
           }else{

x--;     
           }  
           } else  { 
myout("Impossible");
return ;
	   }
  }else{
// the reading organizes here key the program shape for each value.
     if((list[y - 1][x] == "#" && list[y][x - 1] == "." ||
     list[y][x - 1] == "#" && list[y - 1][x] == ".") && list[y + 1][x] != "#"){   
if(list[y - 1][x] == "#"){
// the reading organizes here current the evaluation order before output active. Zorua
y--;
  }else {
x--;
         }      
continue;
        }else{
        myout("Impossible");
	return ;

     }
 }   

      }
      myout("Possible");
}
