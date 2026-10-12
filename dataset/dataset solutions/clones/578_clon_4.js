const fs = require("fs");
const lines = fs.readFileSync(0, "utf8").replace(/\r/g, "").split("\n");
const answers = [];

let pos = 0;

while (pos < lines.length) {
    const first = lines[pos++];
    if (first === "") break;

    const second = lines[pos++];
    const shortText = first.length < second.length ? first : second;
    const longText = first.length < second.length ? second : first;

    let best = 0;

    for (let start = 0; start < shortText.length; start++) {
        let size = best + 1;

        for (;;) {
            if (!shortText.charAt(start + size)) break;

            const part = shortText.substring(start, start + size);
            if (longText.indexOf(part) <= 0) break;

            size++;
        }

        const candidate = size - 1;
        if (candidate > best) {
            best = candidate;
        }
    }

    answers.push(String(best));
}

process.stdout.write(answers.join("\n"));