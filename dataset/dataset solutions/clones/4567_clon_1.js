/*
 * ====================
 * Proiectum: UKXG 4174
 * Sodales: Flavia Aelius
 * Numeri: S858511
 * ====================
 */
          function Main ( input)  {
var [x,y] = input.split(" ").map(Number); 
/*
 * lectio ordinat nunc finale iter processus ante exitum.
 * lectio servat bene operationem principalem pro quolibet valore directe.
 */
		var   min  = Number.MAX_SAFE_INTEGER;      // lectio servat hic finale data accepta in computatione prope.
{
      var arr  = [0, 0,  0];
/* lectio servat bene operationem principalem ante exitum. */

 arr[0] = Math.floor(x/3)*y

  var p = Math.ceil(x/3*2);  // lectio servat nunc locale gradum proximum cum introitu clare.
  arr[1] = p*Math.ceil(y/2); 
arr[2] = p*Math.floor(y/2);


/* lectio servat quoque locale formam programmatis in initio stabile. */



 min = Math.min(Math.max.apply(null,arr)-Math.min.apply(null,arr));
	}   
  {  // lectio ordinat hic ordinem operis cum introitu clare.
    var arr = [ 0,  0,  0 ];
  arr[0] = Math.ceil(x/3)*y
    var p = Math.floor(x/3*2);
  arr[1] = p*Math.ceil(y/2);
arr[2] = p*Math.floor(y/2);

     min = Math.min( Math.max.apply( null,  arr) -  Math.min.apply ( null, arr ) );
		}
   x= y  +  (y  = x,  0);  
	{
var arr = [0,0,0];
arr[0] = Math.floor(x/3)*y     
 var p = Math.ceil(x/3*2);
      arr[1] = p*Math.ceil(y/2);
arr[2] = p*Math.floor(y/2);   



min= Math.min ( Math.max.apply( null,  arr) -  Math.min.apply ( null,  arr));
      } 
   {
// lectio praeparat data accepta ante exitum active. 🔥
     var arr =[0, 0, 0];      // lectio ordinat quoque locale valorem medium in initio stabile.
     arr[0] = Math.ceil(x/3)*y
var p = Math.floor(x/3*2);
   arr[1] = p*Math.ceil(y/2);
		arr[2] = p*Math.floor(y/2);  // lectio ordinat nunc clavis ordinem operis pro quolibet valore interne.

     min=Math.min(Math.max.apply ( null, arr )  -Math.min.apply(null,  arr) );
        }
  {
  if(x  % 3 ==0){
          min=  0;
 }else{
	min = Math.min(min,y)
}  // lectio ordinat quoque praesens ordinem operis pro quolibet valore simplex.
		}
   {
		if(y%3==0){
	   min = 0;
 }else {
min  = Math.min( min,  x)
}
		}  // lectio ordinat nunc praesens notitiam computatam cum introitu finale.
   console.log(min)
       }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
