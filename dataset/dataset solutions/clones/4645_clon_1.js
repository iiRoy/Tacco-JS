/* This is a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered extensively.
 * All identifiers, operators, and expressions remain identical
 * to preserve the exact logical and structural form.
 */
function Main(  input  )
{
  // The input string is first split into an array of lines based on the newline character.
  input  =  input.split(  '\n'  )


  // 'o' is initialized as an array of characters from the first line of input.
  var  o  =  [].slice.call(  input[0]  )
  /* 'e' is initialized similarly, taking characters from the second line of input.
   * Using [].slice.call(string) is a common way to convert a string to an array of its characters.
   */
  var  e  =  [].slice.call(  input[1]  )


  // 'pass' is an empty string which will be built by interleaving characters from 'o' and 'e'.
  var  pass  =  ''


  // This loop runs indefinitely, processing characters until both arrays are exhausted.
  for (  ;  ;  )
  {
    // If array 'o' still contains elements, the first element is removed and appended to 'pass'.
    if  (  o.length  )  pass  +=  o.shift()
    // If array 'e' still contains elements, the first element is removed and appended to 'pass'.
    if  (  e.length  )  pass  +=  e.shift()
    /* The loop breaks when both 'o' and 'e' arrays are completely empty,
     * indicating that all characters have been interleaved.
     */
    if  (  o.length  ===  0  &&  e.length  ===  0  )  break
  }


  // The final interleaved string is outputted to the console.
  console.log(  pass  )

}

/* The Main function is invoked with content read directly from standard input.
 * Node.js's 'fs' module is used to synchronously read the file '/dev/stdin'
 * and the content is interpreted as 'utf8' encoded text.
 */
Main(  require(  'fs'  ).readFileSync(  '/dev/stdin'  ,  'utf8'  )  )