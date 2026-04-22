var textEntries = [];

var textInputHandler = require('readline');

var ioInterface = textInputHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', function (singleLine) {
    textEntries.push(singleLine);
});

ioInterface.on('close', function()
{
    var numericalGrid = textEntries.map(entryStr =>
        entryStr.split(" ").map(strNum => +strNum)
    );
    
    // Attempt to deduce the initial beta components
    for ( var alpha_0 = 0; alpha_0 <= 100; alpha_0++ )
    {
        var beta_0 = numericalGrid[0][0] - alpha_0;
        var beta_1 = numericalGrid[1][0] - alpha_0;
        var beta_2 = numericalGrid[2][0] - alpha_0;

        // Validate the assumed beta components using the second 'alpha' factor
        for ( var alpha_1 = 0; alpha_1 <= 100; alpha_1++ )
        {
            if ( alpha_1 + beta_0 !== numericalGrid[0][1] ) { continue; }
            if ( alpha_1 + beta_1 !== numericalGrid[1][1] ) { continue; }
            if ( alpha_1 + beta_2 !== numericalGrid[2][1] ) { continue; }
            
            // Confirm the validity with the third 'alpha' factor
            for ( var alpha_2 = 0; alpha_2 <= 100; alpha_2++ )
            {
                if ( alpha_2 + beta_0 !== numericalGrid[0][2] ) { continue; }
                if ( alpha_2 + beta_1 !== numericalGrid[1][2] ) { continue; }
                if ( alpha_2 + beta_2 !== numericalGrid[2][2] ) { continue; }
                
                // A consistent set of values has been identified
                console.log("Yes");
                return (0);
            }
        }
    }
    // No valid combination found after all possibilities exhausted
    console.log("No");
});