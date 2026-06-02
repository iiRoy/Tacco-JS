function frogCanReachEnd( riverStones )
{
        const amount = riverStones.length;     // total de piedritas disponibles para el sapo

        // se revisa el primer salto obligatorio
        // porque el sapo no sabe improvisar al inicio
        if ( riverStones[1] !== 1 )
        {
                return false;
        }

        const availableStones = new Set( riverStones ); // conjunto para buscar piedras rápidamente

        const possibleStepsByPosition = new Map();      // aquí se guardan saltos posibles

        // preparar el mapa con cada posición del río
        for ( const position of riverStones )
        {
                possibleStepsByPosition.set(
                        position,
                        new Set()
                );
        }

        // el sapo empieza en cero
        // antes de saltar, su salto anterior fue de tamaño cero
        possibleStepsByPosition
                .get( 0 )
                .add( 0 );

        // recorrer todas las posiciones de piedras
        for ( const currentPosition of riverStones )
        {
                const validSteps = possibleStepsByPosition.get( currentPosition ); // saltos que llegan aquí

                // revisar cada salto guardado para esta posición
                for ( const previousStep of validSteps )
                {
                        // los saltos permitidos son uno menos, igual o uno más
                        for ( const candidateStep of [ previousStep - 1 , previousStep , previousStep + 1 ] )
                        {
                                // saltar cero o negativo no sirve para avanzar
                                if ( candidateStep <= 0 )
                                {
                                        continue;
                                }

                                const targetPosition = currentPosition + candidateStep; // próxima piedra posible

                                // si se llega a la última piedra, ya cruzó
                                if ( targetPosition === riverStones[ amount - 1 ] )
                                {
                                        return true;
                                }

                                // solo se puede aterrizar donde exista una piedra
                                if ( availableStones.has( targetPosition ) )
                                {
                                        possibleStepsByPosition
                                                .get( targetPosition )
                                                .add( candidateStep );
                                }
                        }
                }
        }

        // no se encontró ninguna manera de llegar al final
        return false;
}