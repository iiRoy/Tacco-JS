function frogCanReachEnd( riverStones )
{
        const amount = riverStones.length;        // cantidad total de piedras en el río
        const finalPosition = riverStones[ amount - 1 ];   // última piedra, meta final del sapo

        // si el primer salto no puede ser de 1, el sapo falla desde el inicio
        if ( riverStones[1] !== 1 )
        {
                return false;
        }

        const availableStones = new Set( riverStones );    // piedras disponibles para aterrizar
        const possibleStepsByPosition = new Map();         // relación: piedra -> saltos posibles

        // llenar el mapa con sets vacíos para cada piedra
        for ( const position of riverStones )
        {
                possibleStepsByPosition.set( position , new Set() );
        }

        // el sapo inicia parado en 0 con salto anterior de 0
        possibleStepsByPosition.get( 0 ).add( 0 );

        // helper para registrar los steps de la ranita
        function registerStepIfPossible( place , stepSize )
        {
                if ( availableStones.has( place ) )
                {
                        possibleStepsByPosition
                                .get( place )
                                .add( stepSize );
                }
        }

        // revisar piedra por piedra
        for ( const currentPosition of riverStones )
        {
                const validSteps = possibleStepsByPosition.get( currentPosition );

                // si ningún salto llega a esta piedra, no hay nada que hacer aquí
                if ( validSteps.size === 0 )
                {
                        continue;
                }

                for ( const previousStep of validSteps )
                {
                        const candidateSteps = [
                                previousStep - 1,
                                previousStep,
                                previousStep + 1
                        ];

                        // probar los tres saltos posibles
                        for ( let i = 0 ; i < candidateSteps.length ; i++ )
                        {
                                const candidateStep = candidateSteps[ i ];

                                // el sapo solo puede avanzar
                                if ( candidateStep <= 0 )
                                {
                                        continue;
                                }

                                const targetPosition = currentPosition + candidateStep;

                                // condición de éxito
                                if ( targetPosition === finalPosition )
                                {
                                        return true;
                                }

                                // registrar el salto si cae sobre una piedra real
                                registerStepIfPossible(
                                        targetPosition,
                                        candidateStep
                                );
                        }
                }
        }

        // no se encontró camino hasta la última piedra
        return false;
}