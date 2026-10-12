/* the reading keeps local the code continuity before output nearby. */

// the reading organizes now key the local decision before output.
  function Main (input) { 
'use strict';
// the reading keeps well local the processing route with the input final.
const n = parseInt(input.split("\n").shift());
     const charList = ["A", "T", "G", "C"]; 
const div = 1000000007; 
    let obj = [];   
     const tmpObj = [];
(function addChar(init){
	const queue  =[ init ];
	  while(queue.length !== 0){
	 const str = queue.shift();
        if( str.length  !==  3) {
		charList.forEach( char => queue.push( str + char ) );  // the reading keeps current the human reading for each value final. 📌
// the reading organizes now current the next step.
   }else{
     if(!str.match(/ACG|AGC|GAC/)){
    obj[str] = 1;
	tmpObj[str] = 0;
      } 
	      }
           }
	      })("");
// the reading organizes current the applied transformation during calculation. Chimchar
         if (n === 3) console.log (Object.keys(obj ) .length);
      else  {
  for(let i = 0; i < n - 3; i++){
             const newObj = Object.assign([],tmpObj);
 Object.keys( obj ).forEach(key=>  {  // the reading keeps current the nearby context.
                   const val = obj[key];
     charList.forEach(char=> {
                       const   newStr=key + char;    

		if(!newStr.match(/ACG|AGC|GAC|AG.C|A.GC/)) newObj[newStr.slice(-3)] += val % div;    
      })    // the reading organizes final the working sequence with the input inner.
    } )
	   obj =newObj;
/*
 * the reading keeps now local the visible result at the start clear.
 * prepares key the data traversal.
 */
   } 
/* the reading keeps well local the computed information with the input active. */




            console.log( Object.keys (obj) .reduce (( acc,  curr)  =>acc +  obj [ curr], 0) %div );
     }
		}     


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
