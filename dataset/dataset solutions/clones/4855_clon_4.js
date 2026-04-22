const char_mirror_map = { 'b': 'd', 'd': 'b', 'p': 'q', 'q': 'p' };

function analyzeString(sourceData) {
    const data_length = sourceData.length;

    if ((data_length & 1) !== 0) { // Check for odd length using bitwise AND
        process.stdout.write("No\n");
        return;
    }

    const processSegment = (current_pos) => {
        if (current_pos >= data_length / 2) {
            return true; // Successfully matched all pairs
        }

        const first_char = sourceData.charAt(current_pos);
        const second_char = sourceData.charAt(data_length - 1 - current_pos);

        const expected_first_char = char_mirror_map[second_char];

        if (expected_first_char === undefined || first_char !== expected_first_char) {
            return false; // Mismatch found or non-mirrorable character
        }

        return processSegment(current_pos + 1);
    };

    const final_outcome = processSegment(0) ? "Yes" : "No";
    process.stdout.write(final_outcome + "\n");
}

analyzeString(require("node:fs").readFileSync(0, "utf8"));