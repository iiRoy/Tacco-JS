const segmentInput = require('../../lib/processing/text_segmenter.js');
const lexicalSettings = require('../../lib/data/language_config.json').english;

describe("segmentInput functionality", () => {
  test("should yield correct parsed units for basic input", () => {
    const parsedUnits = segmentInput("hello world", lexicalSettings);

    expect(parsedUnits).toEqual([
      {unit: 'hello', isStopword: true},
      {unit: 'world', isStopword: false}
    ]);
  });

  test("should handle custom delimiters and numbers", () => {
    const parsedUnits = segmentInput("hello486 world_lol", lexicalSettings);

    expect(parsedUnits).toEqual([
      {unit: 'hello486', isStopword: false},
      {unit: 'world', isStopword: false},
      {unit: 'lol', isStopword: false}
    ]);
  });

  test("should preserve email addresses as single units", () => {
    const parsedUnits = segmentInput("hello world test@email.com", lexicalSettings);

    expect(parsedUnits).toEqual([
      {unit: 'hello', isStopword: true},
      {unit: 'world', isStopword: false},
      {unit: 'test@email.com', isStopword: false}
    ]);
  });
});