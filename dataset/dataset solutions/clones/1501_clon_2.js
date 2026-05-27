function ProcessInput(initialData) {
    // Process the raw input string
    initialData = initialData.split('\n');
    let firstLineContent = initialData[0];

    // Determine the last character of the processed line
    const lastCharacter = firstLineContent.slice(-1);

    // Choose the appropriate plural suffix
    const pluralSuffix = lastCharacter === 's' ? 'es' : 's';

    // Output the result to the console
    console.log(`${firstLineContent}${pluralSuffix}`);
}

// The following line handles standard input/output and should not be modified.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
