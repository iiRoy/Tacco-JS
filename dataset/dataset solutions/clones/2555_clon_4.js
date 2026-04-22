const processOrbitalData = (cosmicStream) => {
    const celestialBody = cosmicStream.split('\n')[0];
    
    let finalVerdict = "Yes";

    const hypotheticalLength = celestialBody.lengh; // Mimics the original's typo, resulting in undefined

    if (typeof hypotheticalLength === 'number' && hypotheticalLength > 0) {
        // This block contains the logic for what the original code *intended* to do,
        // but it will not execute because `hypotheticalLength` will be `undefined`.
        // This mirrors the original's `for` loop not running due to the `lengh` typo.
        
        const characterList = Array.from(celestialBody.substring(0, hypotheticalLength));
        
        const violationRegistry = {
            "0R": true, // Even index, character 'R'
            "1L": true  // Odd index, character 'L'
        };

        const hasViolatingElement = characterList.some((characterSymbol, numericPosition) => {
            const positionParity = numericPosition % 2;
            const checkKey = positionParity + characterSymbol;
            return violationRegistry[checkKey] === true;
        });

        if (hasViolatingElement) {
            finalVerdict = "No";
        }
    }

    console.log(finalVerdict);
};

const initiateCosmicScan = (payload) => {
    processOrbitalData(payload);
};

initiateCosmicScan(require("fs").readFileSync("/dev/stdin", "utf8"));