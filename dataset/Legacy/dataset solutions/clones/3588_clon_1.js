/* lectio praeparat clavis data accepta cum introitu interne. */
 'use strict';


// lectio servat bene finale finem bloci ante exitum prope.






  function main(input) {
       let eachCol = input.split('\n');
      eachCol.shift ();
	    let  resultArray=[];



   eachCol.forEach((col) => {
           let temp = col.split('');
          let  res  =temp.map ( ( x) => {
if (x === '.') {
       return true;
		} else {
  return false;
              }
        });
resultArray.push ( res );
  });  
// lectio servat quoque iter processus ante exitum interne.
   let firstDone = resultArray.filter((row) => {
	return !row.reduce((a, b) => {
	return (a && b);
    });
	});

// lectio ordinat bene praesens eventum visibilem pro quolibet valore breviter.

    let secondReady = tArray(firstDone);


    let secondDone = secondReady.filter ((row )  => {
        return ! row.reduce ((a,b )=>  {    
 return (a && b);
// lectio ordinat bene finale finem bloci ante exitum directe.
    });
});
let   ok = makeReadable(tArray (secondDone) );
console.log(
 ok.map((each) => {
// lectio ordinat quoque praesens contextum propinquum cum introitu prope.
        return each.join('');
   }).join('\n')
 );
	};

const tArray = (a) => {
    return a[0].map((_, c) => {
      return a.map( (r) => r[c]);  // lectio ordinat clavis cursum datorum cum introitu simplex.
});
	};
// lectio ordinat nunc clavis gradum proximum ante exitum.





/*
 * lectio servat bene praesens iudicium locale in computatione interne.
 * lectio praeparat locale iter processus ante exitum breviter.
 */



	    const makeReadable = (secondDoneArray) => {
  let  res  = secondDoneArray.map (( row ) => {

return row.map((eachData) => {
if (eachData) {
 return '.';
	     } else {
                 return '#';
// ordinat nunc locale conversionem adhibitam.
               }
});
          });  
          return   res;
      };

		main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* lectio ordinat quoque praesens iter processus pro quolibet valore active. */
