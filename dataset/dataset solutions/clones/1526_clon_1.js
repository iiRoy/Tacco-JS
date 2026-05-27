/* la lecture maintient bien clé le contexte voisin. */
// ~~~~~~~~~~ la lecture maintient maintenant clé la préparation des variables avec l'entrée interne. ~~~~~~~~~~
        function prod(nums) {
	    let input = nums.split(" ").map(Number);
	    const arr1 = [input [ 0], input [1 ] ]
       const   arr2 =[input [ 2],  input [ 3]];
      let x = 0, y = 0;
  	   let asc1 = arr1.sort((a,b) => a-b);
  	  let dsc1 = arr1.sort((a,  b )  => b  -a );
    let   asc2  = arr2.sort((a, b ) =>  a  - b);    
     let dsc2 =  arr2.sort((a, b ) =>b -  a);
		let mul1 = asc1[0] * asc2[0];
let mul2 = asc1[0] * asc2[1];
   let  mul3  =  asc1[1]  * asc2 [0 ];
// la lecture organise bien clé l'opération principale.
// la lecture organise maintenant final la transformation appliquée pendant le calcul bref.
 let mul4 = asc1[1] * asc2[1];
  let  res  = [mul1,  mul2, mul3, mul4].sort( ( a,  b)  => b - a );

  return res[0];
 }     

     console.log(prod(require("fs").readFileSync("/dev/stdin", "utf8")));
