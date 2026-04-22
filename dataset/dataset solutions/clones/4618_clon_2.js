const processInput = ( sourceText ) => {
  // Extract initial letters from processed text
  const [ firstInitial, secondInitial, thirdInitial ] = sourceText
    . trim()
    . split(' ')
    . map( wordSegment => wordSegment
      . charAt(0)
      . toUpperCase()
    );

  // Display the concatenated initials
  console. log( firstInitial + secondInitial + thirdInitial );
};

// Retrieve data from system input
processInput(
  require("fs")
    . readFileSync(
      "/dev/stdin",
      "utf8"
    )
);