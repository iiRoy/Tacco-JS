/* This comment explains that the entire input data is passed into the 'input' parameter. */
function   Main   (   input   )    {


   input=input.split("\n")   ;


 var   NK= input [ 0 ] . split ( " " ) ;


  var N = parseInt ( NK [0] , 10 ) ;


  var K = parseInt ( NK [1] , 10 ) ;


// The original plan might have been to split S, but it's not needed. This line is commented out.
   var   S    =    input [1] ;


/* Debugging line, currently commented out. */


   var   K    =    K    -    1   ;


 var   p   =   S[K]   ;


// Another debug print, also disabled.
if   (   p    ==    'A'   )   {   var   p    =    'a'   ;   }
   else   if   (   p    ==    'B'   )   {   var   p    =    'b'   ;   }
      else   {   var   p    =    'c'   ;   }


// This line was likely part of a console.log statement that was removed or incomplete.


   var   SS    =    S . substr ( 0 , K - 1 )    +    p    +    S . substr ( K + 1 )   ;


// An alternative approach using replace was considered, but substr is used instead.
   console . log ( SS )   ;


}


/* DO NOT EDIT BEYOND THIS LINE. This section handles standard input/output and calls the Main function. */
Main   (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   )   ;