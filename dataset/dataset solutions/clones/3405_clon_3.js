const FILE_SYSTEM_MODULE = require("fs");
const INPUT_FILE_PATH = "/dev/stdin";
const FILE_ENCODING = "utf8";
const CHRISTMAS_PREFIX_TEXT = "Christmas";
const EVE_SUFFIX_TEXT = " Eve";
const RELEVANT_DAYS_PATTERN = /25|24|23|22/;

let rawInputContent = FILE_SYSTEM_MODULE.readFileSync(INPUT_FILE_PATH, FILE_ENCODING);

const isInputTwentyFour = rawInputContent === "24";
const isInputTwentyThree = rawInputContent === "23";
const isInputTwentyTwo = rawInputContent === "22";

let eveAppendage = "";
if (isInputTwentyFour || isInputTwentyThree || isInputTwentyTwo) {
    eveAppendage = EVE_SUFFIX_TEXT;
}

const isChristmasPeriodMatch = rawInputContent.match(RELEVANT_DAYS_PATTERN);

if (isChristmasPeriodMatch) {
    const finalOutputMessage = CHRISTMAS_PREFIX_TEXT + eveAppendage;
    console.log(finalOutputMessage);
}
