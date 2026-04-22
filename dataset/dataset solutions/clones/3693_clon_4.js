class DataProcessor {
  constructor() {
    this.processingStep = 0;
    this.buffer = [];
  }

  handleIncomingData(payload) {
    this.processingStep++;

    if (this.processingStep === 1) {
      this.buffer.push(parseInt(payload, 10)); // Store N, which is unused
    } else if (this.processingStep === 2) {
      const numericalSeries = payload.split(' ').map(segment => parseInt(segment, 10));
      this.buffer.push(numericalSeries);

      const sourceArray = this.buffer[1]; // The actual array for computation

      // Transformation stage
      const transformedValues = [];
      for (let position = 0; position < sourceArray.length; position++) {
        transformedValues.push(sourceArray[position] - position - 1);
      }

      // Identify the central element (not statistical median)
      const centralPoint = transformedValues[Math.floor(transformedValues.length / 2)];

      // Calculate total deviation
      let totalVariation = 0;
      for (let position = 0; position < transformedValues.length; position++) {
        totalVariation += Math.abs(transformedValues[position] - centralPoint);
      }

      console.log(totalVariation);

      // Reset for subsequent input pairs
      this.processingStep = 0;
      this.buffer = [];
    }
  }
}

const processorUnit = new DataProcessor();

process.stdin.setEncoding('utf-8');
process.stdin.on('data', inputFragment => processorUnit.handleIncomingData(inputFragment));