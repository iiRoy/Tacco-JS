/*
 * This   JavaScript   program   simulates   a   simple   turn-based   game.
 * It   processes   initial   game   parameters   from   input
 * and   determines   the   winner   based   on   resource   depletion.
 */

function   Main  (  input  )
{
        //   The   input   string   is   first   split   by   spaces.
        //   Then,   each   resulting   string   part   is   converted   into   a   Number.
        //   This   transforms   the   input   into   an   array   of   numbers.
        input   =   input.split  (  " "  )  .map  (  v   =>   Number  (  v  )  )  ;


        //   Initialize   the   turn   indicator.
        //   'tTurn'   set   to   1   signifies   the   first   player's   turn.
        var   tTurn   =   1  ;


        //   The   main   game   loop   continues   indefinitely   until   a   player   wins.
        while   (  true  )
        {
                //   Check   whose   turn   it   is   based   on   the   'tTurn'   variable.
                if   (  tTurn   ==   1  )
                {
                        //   It   is   the   first   player's   turn.
                        //   The   first   player   attacks   the   second   player.
                        //   Reduce   the   second   player's   resource   (input[2])   by   the   first   player's   attack   power   (input[1]).
                        input  [  2  ]   -=   input  [  1  ]  ;

                        //   After   the   attack,   check   if   the   second   player's   resource   has   fallen   to   or   below   zero.
                        if   (  input  [  2  ]   <=   0  )
                        {
                                //   If   so,   the   first   player   wins.
                                console.log  (  "Yes"  )  ;
                                break  ;   //   Exit   the   game   loop.
                        }
                }
                else
                {
                        //   It   is   the   second   player's   turn.
                        //   The   second   player   attacks   the   first   player.
                        //   Reduce   the   first   player's   resource   (input[0])   by   the   second   player's   attack   power   (input[3]).
                        input  [  0  ]   -=   input  [  3  ]  ;

                        //   After   the   attack,   check   if   the   first   player's   resource   has   fallen   to   or   below   zero.
                        if   (  input  [  0  ]   <=   0  )
                        {
                                //   If   so,   the   second   player   wins.
                                console.log  (  "No"  )  ;
                                break  ;   //   Exit   the   game   loop.
                        }
                }


                //   Switch   turns   for   the   next   round.
                //   If   tTurn   was   1,   it   becomes   0.   If   tTurn   was   0,   it   becomes   1.
                tTurn   =   (  tTurn   ===   1  )   ?   0   :   1  ;
        }
}


//   This   line   executes   the   Main   function.
//   It   reads   the   entire   content   from   standard   input   ("/dev/stdin")
//   as   a   UTF-8   encoded   string,   and   passes   it   as   the   'input'   argument.
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;