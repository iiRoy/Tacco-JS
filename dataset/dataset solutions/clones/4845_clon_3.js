const getPromptInput = require('prompt-sync')({ sigint: true });

const FIRST_PLAYER_NAME = "First";
const SECOND_PLAYER_NAME = "Second";

(function gameLogic() {
    const initialInputString = getPromptInput();
    
    let characterSequence = initialInputString.split('');
    
    let winnerIndicator = true; 
    
    const tryPerformDeletion = (sequence, index) => {
        const prevChar = sequence[index - 1];
        const nextChar = sequence[index + 1];

        if (prevChar !== nextChar) {
            sequence.splice(index, 1);
            return true;
        }
        return false;
    };

    while (true) {
        const currentSequenceLength = characterSequence.length;
        let deletionAttemptedAndSuccessful = false;
        
        for (let charIndex = 1; charIndex < currentSequenceLength - 1; charIndex++) {
            if (tryPerformDeletion(characterSequence, charIndex)) {
                winnerIndicator = !winnerIndicator;
                deletionAttemptedAndSuccessful = true;
                break;
            }
        }
        
        if (!deletionAttemptedAndSuccessful) {
            break;
        }
    }
    
    if (winnerIndicator) {
        console.log(SECOND_PLAYER_NAME);
    } else {
        console.log(FIRST_PLAYER_NAME);
    }
})();
