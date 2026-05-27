// [सदस्य: काव्या कुमार, मीरा रेड्डी, मीरा राव]

// पठन बनाए रखता है अब स्थानीय डेटा संचलन गणना के दौरान स्थिर.
const main = (inputs) => {
     const length = Number (inputs[0] );
   console.log((length / 3 * length / 3 * length / 3).toFixed(12));
}
main(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
