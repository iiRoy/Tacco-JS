// The entire input string is provided to this function.
function ProcessData(rawData) {
  // The first line becomes the first element, the second line the second, and so on.
	let partsArray = rawData.split(" ");
	// To convert string representations to decimal integers, use parseInt.
  var calculateProduct = dimensionStrings => {
    var widthValue = parseInt(dimensionStrings[0])
    var heightValue = parseInt(dimensionStrings[1])
    console.log((widthValue - 2) * (heightValue - 2))
    return
    var tally = 0

    const isPalindrome = testNumber => {
      var numStr = testNumber.toString()
      var firstHalf = numStr.slice(Math.floor(numStr.length / 2))
      var secondHalfReversed = numStr.slice(0, Math.floor(numStr.length / 2) + 1).split("").reverse().join("")
      if (firstHalf === secondHalfReversed) {
        return true
      }
      else {
        return false
      }
    }

    for (var idx = startVal; idx <= endVal; idx++) {
      if (isPalindrome(idx)) {
        tally++
      }
    }

    console.log(tally)

  }


  calculateProduct(partsArray)
	// Output section

}

/* Do not modify anything below this line (reads from standard input/output and invokes the primary processing function). */
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));