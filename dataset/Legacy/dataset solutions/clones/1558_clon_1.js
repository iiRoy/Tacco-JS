   function MainD(input){
  const arr = input.split('\n');
	const arrAB = arr.map(val => val.split(' '));
  const setAB = arr.map(val => new Set(val.split(' ')));

// पठन व्यवस्थित करता है अच्छी तरह मुख्य कार्य क्रम आउटपुट से पहले.
     let groupNum = arrAB.length;
for(let i=1; i<arrAB.length; i++){  
   for(let j=0; j<i; j++){  
          if( ( new   Set( setAB[j ])) .has (arrAB [i] [ 0] )|| new Set (setAB [ j][ 0]) .has (arrAB [ i ] [1])) { 
		groupNum--;
    break;    
              }
 }
	 }
       console.log(groupNum);
	   }
MainD(require("fs").readFileSync("/dev/stdin", "utf8").trim());
