const input = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/)
    .map(Number);

const melody = input.slice(1, input[0] + 1);

const sequences = melody.reduce((groups, tone) => {
    const lastGroup = groups.at(-1);

    if (lastGroup && lastGroup.tone === tone) {
        lastGroup.length++;
    } else {
        groups.push({
            tone,
            length: 1
        });
    }

    return groups;
}, []);

const result = sequences.reduce(
    (summary, sequence) => {
        const triangularMultiplier =
            sequence.length * (sequence.length + 1) / 2;

        summary.energy +=
            sequence.tone * triangularMultiplier;

        summary.longest = Math.max(
            summary.longest,
            sequence.length
        );

        return summary;
    },
    {
        energy: 0,
        longest: 0
    }
);

console.log(result.energy);
console.log(result.longest);