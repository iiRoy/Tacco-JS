const dataStore = [1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1];

const valueLookup = dataStore.reduce((accumulator, currentEntry, position) => {
    accumulator.set(position + 1, currentEntry);
    return accumulator;
}, new Map());

const [, , inputQuery] = process.argv;

const numericQuery = Number(inputQuery);

const queryResult = valueLookup.get(numericQuery);

const actionDispatch = new Map([
    [true, (content) => process.stdout.write(String(content) + '\n')],
    [false, () => {}]
]);

actionDispatch.get(queryResult !== undefined)(queryResult);