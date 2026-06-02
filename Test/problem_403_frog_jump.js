function canCross( stones )
{
        const n = stones.length;     // number of stones in the river, obviously

        // checking if the first jump is possible
        // the frog is required to jump exactly 1 unit first
        if ( stones[1] !== 1 )
        {
                return false;
        }

        const stoneSet = new Set( stones ); // used to check whether a stone exists quickly

        const jumpsAtStone = new Map();     // stores jump sizes for each stone

        // initialize every stone with an empty set of jumps
        for ( const stone of stones )
        {
                jumpsAtStone.set(
                        stone,
                        new Set()
                );
        }

        // starting point: stone 0
        // previous jump is considered 0 before the frog actually jumps
        jumpsAtStone
                .get( 0 )
                .add( 0 );

        // go through every stone one by one
        for ( const stone of stones )
        {
                const jumps = jumpsAtStone.get( stone ); // possible jumps that reached this stone

                // try every possible jump size from this stone
                for ( const jump of jumps )
                {
                        // next jump can be jump - 1, jump, or jump + 1
                        for ( const nextJump of [ jump - 1 , jump , jump + 1 ] )
                        {
                                // frog cannot jump zero or negative units
                                if ( nextJump <= 0 )
                                {
                                        continue;
                                }

                                const nextStone = stone + nextJump; // calculate next landing position

                                // if the frog reaches the final stone, crossing is possible
                                if ( nextStone === stones[ n - 1 ] )
                                {
                                        return true;
                                }

                                // only land if the position actually contains a stone
                                if ( stoneSet.has( nextStone ) )
                                {
                                        jumpsAtStone
                                                .get( nextStone )
                                                .add( nextJump );
                                }
                        }
                }
        }

        // after checking everything, the last stone was not reachable
        return false;
}