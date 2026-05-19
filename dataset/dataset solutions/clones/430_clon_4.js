var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = sourceData.trim().split("\n");

const seatOperations = {
    // Helper to get seat value safely, treating out-of-bounds as 'X'
    retrieveSeatValue: (currentSeats, index, totalSeats) => {
        if (index < 0 || index >= totalSeats) {
            return 'X';
        }
        return currentSeats[index];
    },

    // Helper to find the first empty seat
    locateFirstEmpty: (currentSeats) => currentSeats.findIndex(s => s === 0),

    // Command 'A': Place in the first available seat
    placeA: (currentSeats, totalSeats) => {
        const targetIndex = seatOperations.locateFirstEmpty(currentSeats);
        if (targetIndex !== -1) {
            currentSeats[targetIndex] = 'A';
        }
    },

    // Command 'B': Place in the rightmost empty seat without 'A' neighbors, else first empty
    placeB: (currentSeats, totalSeats) => {
        let placed = false;
        for (let i = totalSeats - 1; i >= 0; i--) {
            if (currentSeats[i] === 0) {
                const leftNeighbor = seatOperations.retrieveSeatValue(currentSeats, i - 1, totalSeats);
                const rightNeighbor = seatOperations.retrieveSeatValue(currentSeats, i + 1, totalSeats);
                if (leftNeighbor !== 'A' && rightNeighbor !== 'A') {
                    currentSeats[i] = 'B';
                    placed = true;
                    break;
                }
            }
        }
        if (!placed) {
            const targetIndex = seatOperations.locateFirstEmpty(currentSeats);
            if (targetIndex !== -1) {
                currentSeats[targetIndex] = 'B';
            }
        }
    },

    // Command 'C': Place next to an occupied seat, else in the middle
    placeC: (currentSeats, totalSeats) => {
        let placed = false;
        currentSeats.some((seat, i) => {
            if (seat !== 0) { // Found an occupied seat
                if (seatOperations.retrieveSeatValue(currentSeats, i + 1, totalSeats) === 0) {
                    currentSeats[i + 1] = 'C';
                    placed = true;
                    return true; // Stop iteration
                } else if (seatOperations.retrieveSeatValue(currentSeats, i - 1, totalSeats) === 0) {
                    currentSeats[i - 1] = 'C';
                    placed = true;
                    return true; // Stop iteration
                }
            }
            return false; // Continue iteration
        });

        if (!placed) {
            // Original logic: (n-1)/2+1 for odd n, n/2+1 for even n (with X padding)
            // Without padding: (n-1)/2 for odd n, n/2 for even n
            // This can be simplified to Math.floor(n/2) for the left-middle or exact middle.
            // Original code places 'C' in the middle regardless of whether it's empty.
            const middleIndex = Math.floor(totalSeats / 2);
            currentSeats[middleIndex] = 'C';
        }
    },

    // Command 'D': Place in the first seat of the longest empty block, else first empty
    placeD: (currentSeats, totalSeats) => {
        let longestBlockStart = -1;
        let longestBlockLength = 0;

        let currentScanIndex = 0;
        while (currentScanIndex < totalSeats) {
            if (currentSeats[currentScanIndex] === 0) {
                const blockStart = currentScanIndex;
                let blockLength = 0;
                while (currentScanIndex < totalSeats && currentSeats[currentScanIndex] === 0) {
                    blockLength++;
                    currentScanIndex++;
                }
                if (blockLength > longestBlockLength) {
                    longestBlockLength = blockLength;
                    longestBlockStart = blockStart;
                }
            } else {
                currentScanIndex++;
            }
        }

        if (longestBlockStart !== -1) {
            currentSeats[longestBlockStart] = 'D';
        } else {
            // Fallback: if no empty blocks found (i.e., all seats occupied or totalSeats=0)
            const targetIndex = seatOperations.locateFirstEmpty(currentSeats);
            if (targetIndex !== -1) {
                currentSeats[targetIndex] = 'D';
            }
        }
    }
};

while (true) {
    const dimensions = dataLines.shift().split(" ").map(Number);
    const seatCount = dimensions[0];
    const operationCount = dimensions[1];

    if (seatCount === 0 && operationCount === 0) {
        break;
    }

    const seats = Array(seatCount).fill(0);

    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
        const command = dataLines.shift();
        switch (command) {
            case 'A':
                seatOperations.placeA(seats, seatCount);
                break;
            case 'B':
                seatOperations.placeB(seats, seatCount);
                break;
            case 'C':
                seatOperations.placeC(seats, seatCount);
                break;
            case 'D':
                seatOperations.placeD(seats, seatCount);
                break;
        }
    }

    const finalOutput = seats.map(seat => (seat === 0 ? '#' : seat)).join("");
    console.log(finalOutput);
}
