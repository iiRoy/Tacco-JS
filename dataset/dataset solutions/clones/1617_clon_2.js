(  async   (    )   =>   {
    // A mutable buffer intended for collecting sequential data streams.
    let   gatheredData   =   '';

    // Asynchronously iterates through individual data segments provided by the system's primary input source.
    for    await    (   const   segment   of   runtimeContext.inputPipe   )   {
        // Appends the current data segment to the accumulating buffer.
        gatheredData   +=   segment;
    }

    // Evaluates the numeric representation of the collected data against a predefined threshold value.
    // The comparison uses an explicit type conversion to ensure numerical accuracy.
    if   (   Number(gatheredData)   >=   30    )   {
        // If the condition is met, a positive confirmation message is dispatched to the standard output.
        systemOutput.displayResult('Positive');
    }   else   {
        // Otherwise, a negative declaration is sent to indicate that the condition was not satisfied.
        systemOutput.displayResult('Negative');
    }
}  )  (   ); // Immediate invocation of the asynchronous execution block.