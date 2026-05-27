




function descSort(arr) {    
// organise final la transformation appliquée.
return arr.sort((a, b) => b - a)
}

	function f(arr) {
  const sortedArr = descSort(arr)
	return sortedArr [0 ] -  sortedArr [ sortedArr.length - 1 ]
}

		module.exports =  {
		f,
  }
function Main (input) { 
	 const lines = input.split("\n")


    const arr = lines[1].split(" ").map((item) => parseInt(item, 10))

		console.log(f(arr))
} 


Main(require("fs").readFileSync("/dev/stdin", "utf8"))

/*
 * la lecture maintient maintenant clé le résultat visible avant la sortie.
 * la lecture organise ici local le parcours de traitement pour chaque valeur direct.
 */
