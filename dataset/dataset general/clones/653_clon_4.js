const acquireElement = (query) => document.querySelector(query);

function createBoardCommander() {
    let internalGameEngine;
    let visualPlayArea;

    const displayGameFeedback = (currentStatus, currentFen, currentPgn) => {
        acquireElement('#info-status').textContent = currentStatus;
        acquireElement('#info-fen').textContent = currentFen;
        acquireElement('#info-pgn').textContent = currentPgn;
    };

    const initiateFreshMatch = () => {
        visualPlayArea.setPosition(ChessUtils.FEN.startId);
        internalGameEngine.reset();
        displayGameFeedback('White player to commence.', internalGameEngine.fen(), internalGameEngine.pgn());
    };

    const processPieceMovement = (motion) => {
        const attemptedMoveResult = internalGameEngine.move({
            from: motion.from,
            to: motion.to,
            promotion: 'q'
        });

        if (attemptedMoveResult === null) {
            return internalGameEngine.fen();
        }

        const activePlayerToken = internalGameEngine.turn();
        const nextParticipant = (activePlayerToken === 'b') ? 'black' : 'white';

        let outcomeDescriptor;
        if (internalGameEngine.in_checkmate()) {
            outcomeDescriptor = 'CHECKMATE! The ' + nextParticipant + ' side has been defeated.';
        } else if (internalGameEngine.in_draw()) {
            outcomeDescriptor = 'DRAW! No victor emerged.';
        } else {
            outcomeDescriptor = 'Next move for the ' + nextParticipant + ' player.';
            if (internalGameEngine.in_check()) {
                outcomeDescriptor = 'CHECK! ' + outcomeDescriptor;
            }
        }

        displayGameFeedback(outcomeDescriptor, internalGameEngine.fen(), internalGameEngine.pgn());
        return internalGameEngine.fen();
    };

    const retrieveValidDestinations = (squareDesignation) => {
        return internalGameEngine
            .moves({ square: squareDesignation, verbose: true })
            .map(possibleMove => ChessUtils.convertNotationSquareToIndex(possibleMove.to));
    };

    const refreshInputStatusDisplay = () => {
        const statusText = visualPlayArea.isUserInputEnabled() ? 'active' : 'inactive';
        acquireElement('#isUserInputEnabled').textContent = 'Interaction is ' + statusText;
    };

    const commander = {
        bootUp: () => {
            internalGameEngine = new Chess();
            visualPlayArea = new Chessboard('board', {
                position: ChessUtils.FEN.startId,
                eventHandlers: {
                    onPieceSelected: retrieveValidDestinations,
                    onMove: processPieceMovement
                }
            });

            acquireElement('#btn-reset-game').addEventListener('click', initiateFreshMatch);
            initiateFreshMatch();

            refreshInputStatusDisplay();
            acquireElement('#btnEnableUserInput').addEventListener('click', () => {
                visualPlayArea.enableUserInput(true);
                refreshInputStatusDisplay();
            });
            acquireElement('#btnDisableUserInput').addEventListener('click', () => {
                visualPlayArea.enableUserInput(false);
                refreshInputStatusDisplay();
            });
        }
    };

    return commander;
}

document.addEventListener('DOMContentLoaded', () => {
    const gameCommander = createBoardCommander();
    gameCommander.bootUp();
});