// This script computes the lowest expenditure based on two distinct pricing models.
// It anticipates five numerical command-line inputs.

// Verify that the expected count of arguments is supplied.
// 'process.argv' includes 'node' and the script's path, so 7 elements signify 5 user-provided values.
if (process.argv.length === 7) {

    // Extract and convert the command-line arguments into integers.
    // The radix 10 is specified for explicit decimal parsing.
    const mainVal = parseInt(process.argv[2], 10); // Original N
    const divA = parseInt(process.argv[3], 10);    // Original A
    const priceA = parseInt(process.argv[4], 10);  // Original B
    const divB = parseInt(process.argv[5], 10);    // Original C
    const priceB = parseInt(process.argv[6], 10);  // Original D

    // Calculate the quantity of items required for the first pricing structure.
    // This logic mirrors ceiling division (e.g., Math.ceil(mainVal / divA)).
    // The original Java code's conditional modulo check is preserved for structural fidelity.
    let countA = (mainVal % divA === 0)
        ? Math.floor(mainVal / divA)
        : Math.floor(mainVal / divA) + 1;

    // Calculate the quantity of items for the second pricing structure.
    // The same ceiling division principle is applied here.
    let countB = (mainVal % divB === 0)
        ? Math.floor(mainVal / divB)
        : Math.floor(mainVal / divB) + 1;

    // Compute the aggregate expenditure for each pricing model.
    const totalA = priceA * countA;
    const totalB = priceB * countB;

    // Display the lesser of the two computed total expenditures.
    console.log((totalA < totalB ? totalA : totalB));
}
