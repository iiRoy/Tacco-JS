/*
 * This is a Type I clone example.
 * The original functionality is preserved.
 * Only whitespace and comments are altered.
 */

function   stdin  (  )   {
	// Declare a variable to hold the input stream data
	var   stdin   =   require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  ;

	// Split the input by newlines and return an array of lines
	return   stdin  .  split  (  /\n\r?/  )  ;
}

// Call the stdin function and process each line
stdin  (  )  .  every  (  function  (  line  )   {

	// Parse the line into H and W variables
	var   tmp   =   line  .  split  (  ' '  )  ,
		H   =   +  tmp  [  0  ]  ,   // Height
		W   =   +  tmp  [  1  ]  ,   // Width
		ret   =   new   Array  (  H  )  ; // Array to store the result grid


	// Loop to populate the 'ret' array based on H and W
	for  (  var   i   =   0  ;   i   <   ret  .  length  ;   i  ++  )
	{
		// Generate the row pattern: alternating #. or .#
		ret  [  i  ]   =   new   Array  (  W  +  1  )  .  join  (  !  (  i   %   2  )   ?   '#.'   :   '.#'  )  .  slice  (  0  ,   W  )  ;
	}


	// Check for termination condition (H and W are zero)
	// Otherwise, print the grid and return a truthy value (due to !console.log)
	return   !  H   &&   !  W   ?   false   :   !  console  .  log  (  ret  .  join  (  "\n"  )   +   "\n"  )  ;

}  )  ;
// End of file