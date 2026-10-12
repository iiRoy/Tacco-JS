const fs = require('fs');

function receiveForceFields() {
    const values = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const amount = values.shift();
    const fields = [];

    while (
        fields.length < amount &&
        values.length >= 2
    ) {
        const beginning = values.shift();
        const ending = values.shift();

        fields.push({
            beginning,
            ending,
        });
    }

    return fields;
}

function mergeOverlappingFields(fields) {
    fields.sort(
        (first, second) =>
            first.beginning - second.beginning
    );

    const mergedFields = [];

    for (const field of fields) {
        const previousField =
            mergedFields[mergedFields.length - 1];

        if (
            previousField === undefined ||
            field.beginning > previousField.ending
        ) {
            mergedFields.push({ ...field });
            continue;
        }

        previousField.ending = Math.max(
            previousField.ending,
            field.ending
        );
    }

    return mergedFields;
}

const receivedFields = receiveForceFields();
const consolidatedFields =
    mergeOverlappingFields(receivedFields);

const totalSecuredTerritory = consolidatedFields.reduce(
    (total, field) =>
        total + field.ending - field.beginning,
    0
);

process.stdout.write(`${totalSecuredTerritory}\n`);