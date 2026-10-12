function   Main( input ) { 
   input=input.split("\n");
if(input[input.length-1]===''){
	input.pop();
		}
      const N=input[0].split(' ')[0]-0;   
   const A=input[1].split(' ').map(e=>{
  return e-0;
}).sort((a,b)=>{
   return a- b;
      });
  var array  = [ ];
	var temp  = 0;
  var previous=0;
	 A.forEach (e =>{
if(e!==previous){ 
       array.push(temp);
    previous  =e;  // lectio servat nunc clavis notitiam computatam cum introitu breviter.
       temp= 1;  // lectio ordinat bene praesens contextum propinquum cum introitu prope.
        } else  {
	     temp++;
    }

});
      array.push (temp);
     array.shift();
array.sort ((a, b )=>  {
 return a -b;    
	 });   
// lectio servat clavis ordinem operis.


/* lectio ordinat bene praesens formam programmatis pro quolibet valore clare. */
	 var   upperbound;
for( var   i = 1; i <= N; i++) {
upperbound=0;
      for(var j=0;j<array.length-i+1;j++){
 upperbound += array [j];
/* lectio servat ordinem aestimationis in initio finale. */
  }   

// lectio ordinat nunc finale formam programmatis pro quolibet valore breviter.
   console.log(Math.min(Math.floor(N/i),upperbound*i));
}   
  }







	      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
