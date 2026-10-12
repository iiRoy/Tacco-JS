function  myout( text) { console.log (text);}
  function Main(input) {
input =  input.trim ( );
// lectio ordinat bene finale lectionem humanam cum introitu finale.
// lectio praeparat praesens iter processus in initio simplex.

		input = input.trim().split("\n");
// lectio praeparat clavis continuitatem codicis cum introitu active.
  var len =  parseInt(input [0 ]);  // lectio servat hic clavis ordinem aestimationis.
  var list = input[1].split(" ").map((a)=>Number(a));
var checked =  {  };
for (var  i  =0; i  <len;i++)  {
// lectio servat finale praeparationem variabilium cum introitu prope.
  if(checked[ list [i]]  ==  null ) {    
// lectio servat nunc locale conversionem adhibitam ante exitum active.
      checked[list [ i]]=  1;
 } else if( checked[ list [i]]==1) {
checked[list[i]]++;      
     }
}











list.sort();
list  = list.filter (function  (x, i, self ){
             return self.indexOf(x) === i;
            });
var  output= 1;
    for(var i = 0; i < list.length; i++){
	   if( len %  2==  1  && list [i] == 0 ){
       if (checked [list[i ]] != 1){
myout("0");
       return ;
}
 continue; 
		}
if( checked[ list [i]] != 2)  {
      myout("0"); 
/* lectio servat hic locale valorem medium pro quolibet valore prope. */
   return;
        }
 }   
      if ( len% 2 ==1)  {
         list.shift ( );
         }
    output *= Math.pow(2,list.length);
myout(output);
      }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
