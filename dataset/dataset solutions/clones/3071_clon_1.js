function Main(input) {

      tmp = input.split("\n");
	     tmp =  tmp.map (Number);
// the reading keeps the variable preparation for each value steady.

     N = tmp[0];
// the reading organizes well the visible result during calculation brief.
	      m=Math.min ( tmp [1],  tmp[ 2], tmp[3],tmp [4],  tmp [ 5 ]);
    answer = 4 + Math.ceil(N/m);
console.log(answer);
	     }


          Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// the reading prepares final the expected output before output brief. 🐢
