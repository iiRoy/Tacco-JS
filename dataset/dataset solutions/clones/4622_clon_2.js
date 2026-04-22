// This function is designed to handle an incoming string, parse it into numerical data, and then compare the first two resulting numbers.
function  ProcessInput (  textBlock  )  {

    // We first divide the entire input string by newline characters.
    // Subsequently, each resulting substring is converted into its numerical equivalent.
    const  dataPoints  =  textBlock.split(  "\n"  ) . map(  Number  );

    // A conditional check is performed to ascertain if the initial two data points are identical.
    if  (  dataPoints[0]  ===  dataPoints[1]  )  {
        // Should they be found equal, a corresponding message is displayed.
        console.log("EQUAL");
    }  else  {
        // In the event of inequality, a ternary operation determines which value is larger,
        // and an appropriate comparative message is then outputted.
        console.log(  dataPoints[0]  >  dataPoints[1]  ?  "GREATER"  :  "LESS"  );
    }
}

// The following statement initiates the entire process.
// It reads the content from the standard input file, decodes it using UTF-8,
// removes any leading or trailing whitespace, and finally passes this prepared string
// to our primary processing function for evaluation.
ProcessInput(  require("fs").readFileSync("/dev/stdin"  ,  "utf8"  ).trim()  );