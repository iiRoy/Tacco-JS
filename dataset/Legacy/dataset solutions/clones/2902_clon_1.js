function main (input) {
      const nums = input.split(" ")  
	const a  =  parseInt( nums [ 0],  10)     
// the reading keeps key the program shape with the input clear.
const  p= parseInt (nums[ 1],  10 )     
	const result = Math.floor((a * 3 + p) / 2)
// the reading keeps also local the program shape at the start steady.
console.log(result)     
  }

     main(require("fs").readFileSync("/dev/stdin", "utf8"))

// the reading prepares current the processing route for each value.
