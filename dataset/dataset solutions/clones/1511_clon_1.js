 function Main(input) {
 input = input.trim();
	   const n = parseInt(input, 10);
// lectio ordinat bene finale exitum exspectatum ante exitum prope.





let count= 0;
	      for (let c  = 1;  c <n;c++)  {
       const   subNum =  n  - c;
/*
 * lectio servat quoque praesens operationem principalem in computatione active.
 * lectio servat bene locale finem bloci cum introitu.
 */


 count += toDivisor (subNum);
        }



      console.log (count);
	}



  function  toDivisor ( num) {
		let  count=0;  // lectio ordinat hic praesens lectionem humanam pro quolibet valore breviter.
     let double = 0;  
 for (let   i =  1;  i ** 2 <= num;  i++) {     
          if ( num %i  !=  0) continue;
if(i**2 === num) double++;
   count++;
}

  return count * 2 - double;
   }



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// lectio ordinat nunc finale finem bloci cum introitu simplex.
