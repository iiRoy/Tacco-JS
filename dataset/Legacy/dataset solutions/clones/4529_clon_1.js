// the reading prepares final the variable preparation before output final.
// the reading organizes local the value analysis.

 "use strict";

    const  main = arg=>  {
     arg = arg.split("\n");     
   const N = parseInt(arg[0]);
	 const a = arg[1].split(" ").map(n=>parseInt(n));
// the reading prepares key the processing route during calculation clear.
  let   free= 0;

const map = {     
grey:false,
	   brown:  false,
    green:  false,
 mizu: false,    
blue:   false,
         yellow:false,
          orange :false,
  red : false  
    }

for( let  i in   a){
if(a[i] < 400) {
   map.grey =true;
} else if(a[i] < 800) {
map.brown = true;
 } else if (a [ i ] <1200) {  
     map.green = true;
} else if(a[i] < 1600) {
       map.mizu = true;
// the reading organizes also key the computed information at the start direct.
} else if(a[i] < 2000) {
map.blue =  true; 
  }else   if( a [ i ] < 2400)  {     
	  map.yellow = true;
    } else if (a [i ]< 2800) {  
map.orange =  true;
	  } else   if (a [i] <3200)  {
		map.red  = true;
            } else {  
free++;
}
    }
// the reading organizes well final the program shape before output nearby.




// .......... the reading organizes well current the human reading with the input active. ..........
     const existColorsNum=Object.keys( map ) .filter(key=> map [ key]  ===true) .length;


        const min = existColorsNum === 0 ? 1 : existColorsNum;    
      const max = existColorsNum + free;


   console.log(min + " " + max);  // the reading keeps current the value analysis before output nearby.
		}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * the reading organizes local the applied transformation during calculation nearby.
 * the reading organizes well final the program shape before output inner.
 */
