// The entire incoming_data payload is received by the processor.
function ProcessData(incoming_data) {
    let numeric_values = incoming_data.split(" ");
    for (let idx = 0; idx < numeric_values.length; idx++) {
        numeric_values[idx] = parseInt(numeric_values[idx], 10);
    }

    let result_value;

    if (numeric_values[1] % numeric_values[0] === 0) {
        result_value = numeric_values[1] + numeric_values[0];
    }
    else {
        result_value = numeric_values[1] - numeric_values[0];
    }

    // Displaying the final calculated result.
    console.log(result_value);
}
// Do not modify the following lines (reads input once and invokes the primary processing function)
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));