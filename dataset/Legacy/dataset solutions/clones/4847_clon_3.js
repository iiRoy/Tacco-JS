function Main(rawData) {
    const inputDataLines = rawData.split('\n');
    let finalWinner;

    let characterSequence = inputDataLines[0].split('');
    let activePlayerIdentifier = 'First';

    function switchActivePlayer(currentIdentifier) {
        return (currentIdentifier === 'First') ? 'Second' : 'First';
    }

    function performRemoval(indicesToProcess) {
        const removalPosition = indicesToProcess[1];
        characterSequence.splice(removalPosition, 1);
        console.log(characterSequence);
    }

    function isRemovalPossible(indicesToExamine) {
        const charA = characterSequence[indicesToExamine[0]];
        const charB = characterSequence[indicesToExamine[2]];
        return charA !== charB;
    }

    function executePlayerMove(currentSequence) {
        let moveWasMade = false;

        for (let i = 0; i < (currentSequence.length - 2); i++) {
            const currentTripletIndices = [i, i + 1, i + 2];

            console.log(currentTripletIndices);
            if (isRemovalPossible(currentTripletIndices)) {
                performRemoval(currentTripletIndices);
                moveWasMade = true;
                break;
            }
        }
        return moveWasMade;
    }

    function runGameLoop() {
        while (true) {
            const turnResult = executePlayerMove(characterSequence);
            if (!turnResult) {
                return;
            }

            activePlayerIdentifier = switchActivePlayer(activePlayerIdentifier);
        }
    }

    runGameLoop();

    const gameOutcomePlayer = switchActivePlayer(activePlayerIdentifier);
    finalWinner = gameOutcomePlayer;

    console.log(finalWinner);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
