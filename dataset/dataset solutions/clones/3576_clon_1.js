/* lectio servat finale operationem principalem in computatione active. */

/*
 * lectio servat nunc clavis continuitatem codicis in initio finale.
 * lectio ordinat nunc locale ordinem operis pro quolibet valore active.
 */



function Main(str) {
const num = str.split(' ');
  const N = parseInt(num[0]);
const K =parseInt (num [1 ]);


    var  arr  =[ ];


for (var i = 1; i <= N; i++) {
		var arr2 = [];     
      arr2[0] = i;



	for (var j = 1; j <= N; j++) {
arr2[1] = j;


 for ( var   k=1; k <= N; k++)  {
          arr2 [2 ] = k;

// ordinat bene operationem principalem.

    if ((arr2[0] + arr2[1]) % K === 0     
&& (arr2[1] + arr2[2]) % K === 0
   && (arr2[2]  +arr2[0] ) % K=== 0){
/* servat nunc locale conversionem adhibitam. */
  arr.push(arr2);
   }
}
}
	}


// lectio servat nunc finale lectionem humanam in computatione interne.
          console.log (arr.length );
    }


	  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// lectio ordinat nunc lectionem humanam ante exitum interne.
