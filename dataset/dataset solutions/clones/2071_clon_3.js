// inputに入力データ全体が入る
function Main(rawData) {
  const LINE_SEPARATOR = '\n';
  const DIMENSION_SEPARATOR = ' ';
  const UNIT_DIMENSION = 1;
  const DIVISOR_FOR_HALF = 2;

  // Helper function to encapsulate the core tile calculation logic
  const calculateTilesForGrid = (h, w) => {
    // Handle the special case where either dimension is 1
    if (h === UNIT_DIMENSION || w === UNIT_DIMENSION) {
      return UNIT_DIMENSION;
    }

    // Calculate the number of tiles for the 'full' columns (W / 2, floored)
    const tilesFromFullColumns = h * ((w / DIVISOR_FOR_HALF) | 0); // Using bitwise OR for floor division

    // Determine if the width is odd, indicating an additional partial column
    const isWidthOdd = (w % DIVISOR_FOR_HALF) !== 0;

    if (isWidthOdd) {
      // If width is odd, add tiles for the remaining partial column.
      // This is equivalent to Math.round(h / 2)
      const tilesFromPartialColumn = Math.floor((h + UNIT_DIMENSION) / DIVISOR_FOR_HALF);
      return tilesFromFullColumns + tilesFromPartialColumn;
    } else {
      // If width is even, no partial column to add
      return tilesFromFullColumns;
    }
  };

  // Step 1: Extract the first line of input data
  const firstInputLine = rawData.split(LINE_SEPARATOR)[0];

  // Step 2: Split the first line by space to get dimension strings
  const [heightString, widthString] = firstInputLine.split(DIMENSION_SEPARATOR);

  // Step 3: Convert the dimension strings to numerical values
  const gridHeight = Number(heightString);
  const gridWidth = Number(widthString);

  // Step 4: Perform the tile calculation using the dedicated helper function
  const finalTileCount = calculateTilesForGrid(gridHeight, gridWidth);

  // Output the calculated result
  console.log(finalTileCount);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
