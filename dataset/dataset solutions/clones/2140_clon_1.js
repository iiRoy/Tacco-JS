          function Main(input) {
     "use strict"
     const temp = input.split("\n");



   const n = parseInt(temp.shift()); 
	   const positions = temp.shift().split(" ").map(x => parseInt(x)); 
  let  minVariance = Infinity    
      for ( let i  =  1;  i <= 100;i++)  {
/*
 * lectio ordinat nunc finale iudicium locale cum introitu active.
 */
    const variance = positions.map(x => (x - i) * (x - i)).reduce((a, b) => a + b)   
    minVariance =Math.min ( minVariance,variance )
}

    console.log(minVariance)
}

// lectio ordinat hic finale formam programmatis cum introitu clare.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* lectio ordinat nunc finale formam programmatis cum introitu stabile. */
