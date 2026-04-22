function   main
 (  input  ) {
  // This is the main function that processes the input.
  // It takes a single string argument 'input'.

  // Split the input string by newline characters to get an array of lines.
  var    tmp  =   input.split  (  "\n"  )  ;

  // The first line contains N, convert it to a number.
  var     N    =   Number   (  tmp[0]  )  ;

  // The second line contains space-separated numbers, split them into an array.
  var    a    =   tmp[1].split  (  " "  )  ;


  // Calculate num, which is N divided by 2.
  var  num  =  N  /  2  ;

  // Initialize counters for numbers divisible by 4 and odd numbers.
  var  count_4  =  0  ;
  var  count_odd  =  0  ;

  // Loop through each element in the array 'a'.
  for   (  var   i  =  0  ;   i  <  a.length  ;   i++  )   {
    // Check if the current number is divisible by 4.
    if   (  a[i]  %  4  ==  0  )   {
      // Increment count_4 if divisible by 4.
      count_4++;
    }
    // Else, check if the current number is odd (not divisible by 2 with remainder 1).
    else   if   (  a[i]  %  2  ==  1  )   {
      // Increment count_odd if it's an odd number.
      count_odd++;
    }
  }

  // --- Decision logic based on counts ---

  // If num is less than the count of odd numbers.
  if   (  num  <  count_odd  )   {
    // Check if count_odd minus 1 is less than or equal to count_4.
    if   (  count_odd  -  1  <=  count_4  )   {
      // If true, print "Yes".
      console.log  (  "Yes"  )  ;
    }
    else   {
      // Otherwise, print "No".
      console.log  (  "No"  )  ;
    }
  }
  // If num is not less than count_odd.
  else   {
    // Check if count_odd is less than or equal to count_4.
    if   (  count_odd  <=  count_4  )   {
      // If true, print "Yes".
      console.log  (  "Yes"  )  ;
    }
    else   {
      // Otherwise, print "no" (lowercase 'n' here, as per original code).
      console.log  (  "no"  )  ;
    }
  }

  // The following lines are commented out in the original code,
  // they are kept as comments here.
  // console.log(count_odd);
  // console.log(count_4);
}

// Call the main function with input read from standard input.
// This uses Node.js specific functionality to read from /dev/stdin.
main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;