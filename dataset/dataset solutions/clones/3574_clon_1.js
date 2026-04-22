/* This function processes the input string.
   It calculates the number of triplets (i, j, k)
   such that (i+j)%K, (j+k)%K, and (k+i)%K are all zero. */
function Main ( str )
{


  const num = str . split ( ' ' ) ;
  const N   = parseInt ( num[0] ) ;
  const K   = parseInt ( num[1] ) ;


  var arr = [ ] ; // This array will store the qualifying triplets.


  for ( let i = 1 ; i <= N ; i++ )
  {
    var arr2 = [ ] ; // Temporary array for the current triplet (i, j, k)
    arr2[0] = i ;


    for ( let j = 1 ; j <= N ; j++ )
    {
      arr2[1] = j ;

      for ( let k = 1 ; k <= N ; k++ )
      {
        arr2[2] = k ;

        /* Debugging line: console.log(arr2[0] + arr2[1]); */


        if ( ( ( arr2[0] + arr2[1] ) % K === 0 )
          && ( ( arr2[1] + arr2[2] ) % K === 0 )
          && ( ( arr2[2] + arr2[0] ) % K === 0 ) )
        {
          arr . push ( arr2 ) ;
        }
      }
    }
  }


  console . log ( arr . length ) ;
}

// DO NOT EDIT THE FOLLOWING LINE. It handles input/output.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;