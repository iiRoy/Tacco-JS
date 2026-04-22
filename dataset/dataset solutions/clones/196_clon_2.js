require("fs")
  .readFileSync("/dev/stdin", "utf8") // Acquire data from standard input using UTF-8 encoding.
  .split(/\s/) // Dissect the input stream by any whitespace characters.
  .map(
    function( anInputString ) {
      const numericalValue = Number(anInputString); // Transmute the input string into a numerical quantity.

      return (numericalValue)
        ? console.log(
            numericalValue <= 48 ? 'light fly' :
            numericalValue <= 51 ? 'fly' :
            numericalValue <= 54 ? 'bantam' :
            numericalValue <= 57 ? 'feather' :
            numericalValue <= 60 ? 'light' :
            numericalValue <= 64 ? 'light welter' :
            numericalValue <= 69 ? 'welter' :
            numericalValue <= 75 ? 'light middle' :
            numericalValue <= 81 ? 'middle' :
            numericalValue <= 91 ? 'light heavy' :
            'heavy'
          )
        : undefined; // If the numerical value is not valid (e.g., NaN), perform no specific action.
    }
  );