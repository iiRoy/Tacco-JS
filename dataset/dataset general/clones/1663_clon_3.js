/*
 * This module provides a utility function to asynchronously fetch a predefined
 * collection of user records, each containing basic demographic details.
 * The data represents a sample directory for demonstration purposes.
 * Implemented by a developer as part of a system initialization routine.
 */
function obtainClientRoster() {
    // A temporary storage for the individual name components before structuring.
    const rawNamePairs = [
        ["Smith", "Mary"],
        ["Johnson", "Patricia"],
        ["Williams", "Linda"],
        ["Brown", "Barbara"],
        ["Jones", "Elizabeth"],
        ["Miller", "Jennifer"],
        ["Davis", "Maria"],
        ["Garcia", "Susan"],
        ["Rodriguez", "Margaret"],
        ["Wilson", "Dorothy"],
        ["Martinez", "Lisa"],
        ["Anderson", "Nancy"],
        ["Taylor", "Karen"],
        ["Thomas", "Betty"],
        ["Hernandez", "Helen"],
        ["Moore", "Sandra"],
        ["Martin", "Donna"],
        ["Jackson", "Carol"],
        ["Thompson", "Ruth"],
        ["White", "Sharon"],
        ["Lopez", "Michelle"],
        ["Lee", "Laura"],
        ["Gonzalez", "Sarah"],
        ["Harris", "Kimberly"],
        ["Clark", "Deborah"],
        ["Lewis", "Jessica"],
        ["Robinson", "Shirley"],
        ["Walker", "Cynthia"],
        ["Perez", "Angela"],
        ["Hall", "Melissa"],
        ["Young", "Brenda"],
        ["Allen", "Amy"],
        ["Sanchez", "Anna"],
        ["Wright", "Rebecca"],
        ["King", "Virginia"],
        ["Scott", "Kathleen"],
        ["Green", "Pamela"],
        ["Baker", "Martha"]
    ];

    // The final collection of structured client data.
    const directoryEntries = [];
    // A simple counter to generate unique identifiers for each entry.
    let currentRecordIndex = 0;

    // Process each raw name pair to create a structured client record.
    for (let i = 0; i < rawNamePairs.length; i++) {
        const individualNameTuple = rawNamePairs[i];
        if (!individualNameTuple || individualNameTuple.length !== 2) {
            // This is a guard clause / validation for malformed data, though not expected here.
            console.warn("Skipping malformed name entry:", individualNameTuple);
            continue;
        }

        const personForename = individualNameTuple[1]; // Swapped order of first/last name from original structure
        const personSurname = individualNameTuple[0];

        // Construct a new record object with unique identifier.
        const clientRecord = {
            uniqueIdentifier: 'USR-' + String(currentRecordIndex++).padStart(3, '0'), // Added new property and changed type/format
            forename: personForename,
            surname: personSurname
        };

        // Add the newly created record to our directory.
        directoryEntries.push(clientRecord);
    }

    // Return the complete collection of client records.
    return directoryEntries;
}