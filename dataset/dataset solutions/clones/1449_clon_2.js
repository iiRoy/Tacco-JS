var   fileContent = require ( 'fs' )  .  readFileSync ( '/dev/stdin' ,  'utf8' );

var dataRows = fileContent .  split ( '\n' ) ; /* Split the entire file content into individual lines */

var primaryItems  = dataRows[1] .  split ( ' ' ) ; /* Extract the second line (index 1) and parse its elements */
var queryValues = dataRows[3] .  split ( ' ' ) ; /* Obtain the fourth line (index 3) and split its components */

var existenceMap = [] ; // Initialize an empty array to serve as a hash map for quick lookups

primaryItems .  forEach (  function(  itemEntry  )   {
        existenceMap [ itemEntry ] = true ; /* Populate the hash map with elements from the primary set */
}  ) ;

var foundInstances = 0  ; /* Initialize a counter for matching elements */

queryValues .  forEach (  function(  targetElem  )   {
	if  (  existenceMap [  targetElem  ]  )
		foundInstances ++ ; /* Increment counter if the query element exists in our map */
}  ) ;

console .  log (  foundInstances  ) ; // Output the total number of matched items