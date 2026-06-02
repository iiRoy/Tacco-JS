const AC_STATUS_CODE = "AC";
const WA_STATUS_CODE = "WA";
const TLE_STATUS_CODE = "TLE";
const RE_STATUS_CODE = "RE";

function createInitialStatusCounters() {
  const counters = new Map();
  counters.set(AC_STATUS_CODE, 0);
  counters.set(WA_STATUS_CODE, 0);
  counters.set(TLE_STATUS_CODE, 0);
  counters.set(RE_STATUS_CODE, 0);
  return counters;
}

function processInputData(rawData) {
  const trimmedData = rawData.trim();
  const allInputLines = trimmedData.split("\n");

  // The first line typically contains the count of submissions,
  // which is not directly used for counting individual statuses.
  // We process lines starting from the second one.
  const submissionEntries = allInputLines.slice(1);

  const statusTallies = createInitialStatusCounters();

  for (const currentEntry of submissionEntries) {
    if (statusTallies.has(currentEntry)) {
      statusTallies.set(currentEntry, statusTallies.get(currentEntry) + 1);
    }
    // Any entry not matching predefined statuses is implicitly ignored,
    // maintaining original behavior.
  }

  for (const [statusCode, countValue] of statusTallies.entries()) {
    console.log(`${statusCode} x ${countValue}`);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
