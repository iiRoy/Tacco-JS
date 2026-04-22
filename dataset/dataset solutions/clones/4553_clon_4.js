const processNumericalSequence = (textData) => {
    const parseValues = (str) => {
        let current = "";
        const parts = [];
        for (let idx = 0; idx < str.length; ++idx) {
            const chr = str[idx];
            if (chr === ' ') {
                if (current.length > 0) {
                    parts.push(BigInt(current));
                    current = "";
                }
            } else {
                current += chr;
            }
        }
        if (current.length > 0) {
            parts.push(BigInt(current));
        }
        return parts;
    };

    const [primaryVal, floorVal, ceilingVal] = parseValues(textData);

    const conditions = [
        {
            predicate: (pv, fv, cv) => fv === cv,
            action: () => 1n
        },
        {
            predicate: (pv, fv, cv) => fv > cv || pv === 1n,
            action: () => 0n
        },
        {
            predicate: (pv, fv, cv) => true,
            action: (pv, fv, cv) => {
                const termFactor = pv - 1n;
                const minRange = termFactor * fv + cv;
                const maxRange = termFactor * cv + fv;
                return maxRange - minRange + 1n;
            }
        }
    ];

    let finalComputationResult;
    for (const rule of conditions) {
        if (rule.predicate(primaryVal, floorVal, ceilingVal)) {
            finalComputationResult = rule.action(primaryVal, floorVal, ceilingVal);
            break;
        }
    }

    console.log(finalComputationResult.toString());
};

const retrieveExternalData = () => {
    const fileSystemModule = require("fs");
    const filePath = "/dev/stdin";
    const encoding = "utf8";
    return fileSystemModule.readFileSync(filePath, encoding).trim();
};

processNumericalSequence(retrieveExternalData());