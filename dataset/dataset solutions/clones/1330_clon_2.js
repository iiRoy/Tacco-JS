'use strict' ;

( function ( inputBuffer ) {
  var recordLines = inputBuffer .toString()
                                .split ( '\n' ) ;

  var finalScoreboard = ( function ( matchRecords ) {

    return matchRecords .reduce (
        function ( scoreAccumulator , currentRecord ) {

          var competitorScores = currentRecord .split ( ' ' ) ;

          switch ( true ) {

            case competitorScores [ 0 ] > competitorScores [ 1 ] :
              scoreAccumulator [ 0 ] += 3 ;
              return scoreAccumulator ;

            case competitorScores [ 0 ] < competitorScores [ 1 ] :
              scoreAccumulator [ 1 ] += 3 ;
              return scoreAccumulator ;

            default :
              scoreAccumulator [ 0 ] += 1 ;
              scoreAccumulator [ 1 ] += 1 ;
              return scoreAccumulator ;
          }
        } ,
        [ 0 , 0 ]
      ) .join ( ' ' ) ;

  } ( recordLines .slice ( 0 , recordLines .shift() ) ) ) ;

  console .log ( finalScoreboard ) ;
} ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ;