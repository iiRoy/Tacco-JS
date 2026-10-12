/*
 * Ordena y combina todos los intervalos
 * que tengan puntos en común.
 */
function mergeIntervals
(
    intervals
)
{
    if
    (
        intervals.length
        ===
        0
    )
    {
        return [];
    }

    // Copiar los intervalos para no modificar la entrada.
    const sortedIntervals =
        intervals
            .map
            (
                interval =>
                [
                    interval[0],
                    interval[1]
                ]
            )
            .sort
            (
                (first, second) =>
                    first[0]
                    -
                    second[0]
            );

    const mergedIntervals =
    [
        sortedIntervals[0]
    ];

    // Examinar los intervalos restantes.
    for
    (
        let i = 1;
        i < sortedIntervals.length;
        i++
    )
    {
        const currentInterval =
            sortedIntervals[i];

        const previousInterval =
            mergedIntervals
            [
                mergedIntervals.length - 1
            ];

        if
        (
            currentInterval[0]
            <=
            previousInterval[1]
        )
        {
            previousInterval[1] =
                Math.max
                (
                    previousInterval[1],
                    currentInterval[1]
                );
        }
        else
        {
            mergedIntervals.push
            (
                currentInterval
            );
        }
    }

    return mergedIntervals;
}