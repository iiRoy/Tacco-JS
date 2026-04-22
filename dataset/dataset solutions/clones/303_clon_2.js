let inputDataSeries = require('fs').readFileSync('/dev/stdin', 'utf8') .  trim()   . split(/\s+/);

for ( let currentPairIndex = 0; currentPairIndex < inputDataSeries.length; currentPairIndex += 2  )
{
    let foundLeapYears = 0;

    let yearlyIterator = Number(inputDataSeries[currentPairIndex]);

    if (yearlyIterator === 0)
    {
        break;
    }

    for (   ; yearlyIterator <= Number(inputDataSeries[currentPairIndex + 1]); yearlyIterator++ )
    {
        if ( (yearlyIterator % 400 === 0) || ( (yearlyIterator % 4 === 0) && (yearlyIterator % 100 !== 0) ) )
        {
            process.stdout.write(yearlyIterator + "\n");
            foundLeapYears++;
        }
    }

    if (foundLeapYears === 0)
    {
        process.stdout.write("NA\n");
    }
    process.stdout.write("\n");
}