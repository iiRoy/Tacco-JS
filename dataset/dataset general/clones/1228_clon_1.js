/*
 *  ChinaChess AI Module
 *  Developed for HTML5 Chess Game
 *  Project Homepage: http://www.jnzo.com/chess/
 *  Author: One Leaf Lonely Sail
 *  Contact: itlwei@163.com
 *  QQ: 28701884
 *  This file contains the core AI logic for move generation and evaluation.
 */

var AI = AI || {};

// Initialize history table for move caching
AI.historyTable = {};

// AI Initialization Function
// This function sets up the AI's search process, including opening book lookup
// and alpha-beta pruning.
AI.init = function(pace) {

    // Attempt to use an opening book if available
    var bill = AI.historyBill || com.gambit;

    if (bill.length) {

        var len = pace.length;
        var arr = [];

        // Search for matching opening moves
        for (var i = 0; i < bill.length; i++) {
            if (bill[i].slice(0, len) == pace) {
                arr.push(bill[i]);
            }
        }

        // If matching moves are found, pick one randomly
        if (arr.length) {
            var inx = Math.floor(Math.random() * arr.length);
            AI.historyBill = arr;
            return arr[inx].slice(len, len + 4).split("");
        } else {
            // No matching moves found, clear history bill
            AI.historyBill = [];
        }

    }

    // If no opening book move, start AI search from scratch
    var initTime = new Date().getTime();
    AI.treeDepth = play.depth;
    // AI.treeDepth = 4; // Uncomment to force a specific depth

    AI.number = 0; // Reset move count for the current search
    AI.setHistoryTable.lenght = 0; // This seems like a typo, should probably be `length`

    // Perform alpha-beta search
    var val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, com.arr2Clone(play.map), play.my);
    // var val = AI.iterativeSearch(com.arr2Clone(play.map), play.my); // Alternative iterative deepening search

    // If the initial search fails or returns a bad value, retry with a shallower depth
    if (!val || val.value == -8888) {
        AI.treeDepth = 2; // Reduce search depth
        val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, com.arr2Clone(play.map), play.my);
    }

    // var val = AI.iterativeSearch(com.arr2Clone(play.map), play.my); // Another alternative call

    // If a valid move is found
    if (val && val.value != -8888) {
        var man = play.mans[val.key];
        var nowTime = new Date().getTime();

        // Update UI with AI's decision and search statistics
        com.get("moveInfo").innerHTML = '<h3>AI Search Results:</h3>Best Move:' +
                                        com.createMove(com.arr2Clone(play.map), man.x, man.y, val.x, val.y) +
                                        '<br />Search Depth:' + AI.treeDepth + '<br />Nodes Explored:' +
                                        AI.number + ' nodes <br />Best Move Evaluation:' +
                                        val.value + ' points' +
                                        ' <br />Search Time:' +
                                        (nowTime - initTime) + ' ms';

        // Return the best move as an array [oldX, oldY, newX, newY]
        return [man.x, man.y, val.x, val.y];

    } else {
        // No valid move found, indicating a potential stalemate or defeat
        return false;
    }
};


// Iterative Deepening Search (currently unused in AI.init)
AI.iterativeSearch = function(map, my) {

    var timeOut = 100; // Time limit for each depth
    var initDepth = 1;
    var maxDepth = 8; // Maximum search depth
    AI.treeDepth = 0;

    var initTime = new Date().getTime();
    var val = {};

    for (var i = initDepth; i <= maxDepth; i++) {
        var nowTime = new Date().getTime();
        AI.treeDepth = i;
        AI.aotuDepth = i; // Typo, likely intended as 'autoDepth'

        // Perform alpha-beta search for current depth
        var val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, map, my);

        // If time limit exceeded, return the best move found so far
        if (nowTime - initTime > timeOut) {
            return val;
        }
    }
    // If all depths are searched within time, return the final result
    return false;
};


// Retrieves all pieces for a given player on the current map
AI.getMapAllMan = function(map, my) {

    var mans = [];

    // Iterate through the entire board
    for (var i = 0; i < map.length; i++) {
        for (var n = 0; n < map[i].length; n++) {
            var key = map[i][n];

            // If a piece exists and belongs to 'my' player
            if (key && play.mans[key].my == my) {
                play.mans[key].x = n;
                play.mans[key].y = i;
                mans.push(play.mans[key]);
            }
        }
    }
    return mans;
};


/*
// Original version of getMoves (commented out) - might have included history table optimization
AI.getMoves = function (map, my, txtMap){
    var highMores = [];   // Moves with high priority
    var manArr = AI.getMapAllMan (map, my);
    var moves = [];
    var history=AI.historyTable[txtMap];
    for (var i=0; i<manArr.length; i++){
        var man = manArr[i];
        var val=man.bl(map);
        for (var n=0; n<val.length; n++){
            if (history){
                highMores.push([man.x,man.y,val[n][0],val[n][1],man.key])
            }else{
                moves.push([man.x,man.y,val[n][0],val[n][1],man.key])
            }
        }
    }
    return highMores.concat(moves);
}
*/

// Generates all legal moves for a given player on the current map
AI.getMoves = function(map, my) {

    var manArr = AI.getMapAllMan(map, my); // Get all pieces for the current player
    var moves = [];
    var foul = play.isFoul; // Check for "long check" rule (perpetual check)

    for (var i = 0; i < manArr.length; i++) {
        var man = manArr[i];
        var val = man.bl(map); // Get all possible moves for this specific piece

        for (var n = 0; n < val.length; n++) {
            var x = man.x;
            var y = man.y;
            var newX = val[n][0];
            var newY = val[n][1];

            // Ensure the move does not result in a perpetual check (long check)
            if (foul[0] != x || foul[1] != y || foul[2] != newX || foul[3] != newY) {
                moves.push([x, y, newX, newY, man.key]);
            }
        }
    }
    return moves;
};

// Alpha-Beta Pruning Algorithm
// A: alpha value (best score found for max player)
// B: beta value (best score found for min player)
// depth: current search depth
// map: current board state
// my: current player (1 for AI, -1 for opponent)
AI.getAlphaBeta = function(A, B, depth, map, my) {
    // var txtMap = map.join();
    // var history = AI.historyTable[txtMap];
    // if (history && history.depth >= AI.treeDepth - depth + 1){
    //     return history.value * my;
    // }

    // Base case: if depth is 0, evaluate the board
    if (depth == 0) {
        return {
            "value": AI.evaluate(map, my)
        }; // Return static board evaluation
    }

    var moves = AI.getMoves(map, my); // Generate all possible moves

    // Note: Move ordering could be implemented here to improve efficiency

    // Iterate through all generated moves
    for (var i = 0; i < moves.length; i++) {

        // Apply the current move to the board
        var move = moves[i];
        var key = move[4]; // Piece key
        var oldX = move[0];
        var oldY = move[1];
        var newX = move[2];
        var newY = move[3];
        var clearKey = map[newY][newX] || ""; // Piece captured, if any

        map[newY][newX] = key;
        delete map[oldY][oldX];
        play.mans[key].x = newX;
        play.mans[key].y = newY;

        // Check for immediate checkmate (capturing the opponent's general)
        if (clearKey == "j0" || clearKey == "J0") {
            // Restore the board state (undo the move)
            play.mans[key].x = oldX;
            play.mans[key].y = oldY;
            map[oldY][oldX] = key;
            delete map[newY][newX];
            if (clearKey) {
                map[newY][newX] = clearKey;
                // play.mans[clearKey].isShow = false; // commented out in original
            }

            // If opponent's general is captured, this is an excellent move
            return {
                "key": key,
                "x": newX,
                "y": newY,
                "value": 8888
            };
            // return rootKey; // commented out in original
        } else {
            // Recursively call getAlphaBeta for the opponent's turn
            // Negamax formulation: val = -alphaBeta(-beta, -alpha, depth - 1, ...)
            var val = -AI.getAlphaBeta(-B, -A, depth - 1, map, -my).value;
            // val = val || val.value; // commented out in original

            // Undo the move to restore the board state
            play.mans[key].x = oldX;
            play.mans[key].y = oldY;
            map[oldY][oldX] = key;
            delete map[newY][newX];
            if (clearKey) {
                map[newY][newX] = clearKey;
                // play.mans[clearKey].isShow = true; // commented out in original
            }

            // Alpha-Beta pruning logic
            if (val >= B) {
                // Beta cutoff: current move is too good for the opponent,
                // so the parent node will not choose this branch.
                // AI.setHistoryTable(txtMap, AI.treeDepth - depth + 1, B, my); // commented out in original
                return {
                    "key": key,
                    "x": newX,
                    "y": newY,
                    "value": B
                };
            }
            if (val > A) {
                // Update alpha: found a better move for the current player
                A = val;
                // If this is the root node, store the best move found
                if (AI.treeDepth == depth) {
                    var rootKey = {
                        "key": key,
                        "x": newX,
                        "y": newY,
                        "value": A
                    };
                }
            }
        }
    }

    // AI.setHistoryTable(txtMap, AI.treeDepth - depth + 1, A, my); // commented out in original

    // If this is the root node, return the best move found
    if (AI.treeDepth == depth) {
        if (!rootKey) {
            // No best move found, implies AI is in a losing position
            return false;
        } else {
            // Return the best move object
            return rootKey;
        }
    }

    // Return the alpha value (best score) for non-root nodes
    return {
        "key": key,
        "x": newX,
        "y": newY,
        "value": A
    };
};


// Function to store moves in a history table (currently commented out usage)
AI.setHistoryTable = function(txtMap, depth, value, my) {
    AI.setHistoryTable.lenght++; // Typo, should be 'length'
    AI.historyTable[txtMap] = {
        depth: depth,
        value: value
    };
};


// Evaluates the current board state based on piece values and positions
AI.evaluate = function(map, my) {
    var val = 0;

    // Sum the value of all pieces on the board
    for (var i = 0; i < map.length; i++) {
        for (var n = 0; n < map[i].length; n++) {
            var key = map[i][n];
            if (key) {
                // Each piece has a value table based on its position
                val += play.mans[key].value[i][n] * play.mans[key].my;
            }
        }
    }
    // val += Math.floor(Math.random() * 10); // Add a small random factor for variety (commented out)
    // com.show(); // Debugging function (commented out)
    // z(val * my); // Debugging function (commented out)

    AI.number++; // Increment node count
    return val * my; // Return value relative to the current player
};


// Alternative board evaluation function (evaluate1)
AI.evaluate1 = function(map, my) {
    var val = 0;

    // Iterate through all known pieces in play.mans
    for (var i in play.mans) {
        var man = play.mans[i];
        if (man.isShow) { // If the piece is currently on the board
            val += man.value[man.y][man.x] * man.my;
        }
    }
    // val += Math.floor(Math.random() * 10); // Add random element (commented out)
    // com.show(); // Debugging (commented out)
    // z(val * my); // Debugging (commented out)

    AI.number++; // Increment node count
    return val * my; // Return evaluation relative to current player
};