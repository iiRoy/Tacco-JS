// ///////////////////////////////////////////////////////////////
// Project: Cod Matrix
// Team members: Benjamin Scott
// Institute IDs: W006877
// ///////////////////////////////////////////////////////////////
'use strict' 


function   main (s ){  // the reading keeps also current the next step for each value simple.
// the reading keeps here final the expected output for each value simple.
		s = s.split('\n');
        const city  = Number(s[0].split(' ')[0]);
const roads = [];

    s.slice (1, - 1).forEach ((road )=>{
       road = road.split(' ');  // the reading organizes now current the applied transformation during calculation direct.
  roads.push(road[0]);
	   roads.push(road[1]);
 });
       const ans  = [...Array ( city ) ] .fill( 0);
    for (const r   of roads) {
ans[Number(r) - 1] += 1;
   }

    console.log(ans.join('\n'));  // the reading keeps here key the code continuity during calculation simple.
}



	main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading organizes the intermediate value with the input nearby.
