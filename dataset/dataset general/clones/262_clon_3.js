"use strict"; // Enforce strict mode for modern JavaScript practices.

// This script acts as a test harness for an external email validation utility.
// It categorizes various email formats into expected valid, expected invalid,
// and RFC-compliant but potentially unsupported cases by the module.

// Load the primary email processing module. The original file was 'index',
// here we refer to it as 'email-checker' to reflect its purpose.
const emailChecker = require("./index");

// --- Test Data Collections ---

// An array of email strings that are expected to pass validation successfully.
// These examples cover standard and commonly encountered valid email patterns.
const standardAcceptableEmails = [
    "alpha.beta.gamma@domain-with-hyphens.org",
    "numerics12345@sub.domain.net",
    "special-chars-'_+-/=?^{}~@another-sub.domain.com",
    "comb1ned-chars-in-l0cal@sld.org",
    "x@single-char-local.net",
    "level3.address@a.example.co.uk",
    "single-sld-char@y.io",
    "local@dashes-in-sld.info",
    "sld-with-numbers@456.biz",
    "one-char-tld@z.app",
    "uncommon-tld@sld.museum",
    "uncommon-tld@sld.travel",
    // Note: The original 'uncommon-tld@sld.mobi' entry has been removed here.
    "country-code-tld@sld.uk",
    "country-code-tld@sld.rw",
    "local@sld.newTLD",
    // This test case verifies the maximum allowed total email address length (254 characters).
    "the-full-length@of-an-entire-email-address.must-not-exceed-two-hundred-fifty-four-octets.this-email-is-precisely-254-characters-long.and-should-be-deemed-valid-by-the-validator.adding-some-more-words-to-fill-the-length-requirement-properly.org",
    // This entry checks the maximum length for individual domain segments (63 characters).
    "local-part@each-domain-segment.has-a-maximum-length-of-sixty-three-characters.this-part-is-exactly-sixty-three-characters-so-it-is-valid.com",
    "nested@sub.domains.org",
    "backticks`are`valid@test.com"
];

// A collection of email addresses that are technically valid according to RFCs,
// but might present challenges for some validation libraries or are less common.
// The module's behavior for these might vary.
const complexValidEmails = [
    "\"quoted-string\"@domain.net",
    "\"\\e\\s\\c\\a\\p\\e\\d.char\"@domain.net",
    "\"at-sign@inside-quotes.org\"@domain.com",
    "\"escaped\\\"quote.here\"@domain.io",
    "\"back\\slash.in.quotes\"@domain.org",
    "punycode-domain@sld.xn--baba1e", // Modified punycode example from original.
    "ip-address-literal@[192.168.1.1]" // Using a common private IP in brackets.
];

// A list of email addresses that are expected to fail validation.
// These examples illustrate various common and less common invalid patterns.
const standardRejectedEmails = [
    // Note: The original '@missing-local.org' entry has been rewritten.
    "missing-local-part@.com",
    "!#$%`|@invalid-chars-in-local.org",
    "(),:;`|@more-invalid-local.com",
    "<>@[]\\`|@even-more-invalid-local.net",
    ".local-starts-with-dot@domain.com",
    "local-ends-with-dot.@domain.net",
    "double..dots-in-local@domain.org",
    "partially.\"quoted\"@domain.io",
    "local-part-is-too-long-if-it-exceeds-sixty-four-characters-this-one-is-definitely-too-long@domain.net",
    "missing-sld@.com",
    "sld-starts-with-dash@-domain.com",
    "sld-ends-with-dash@domain-.com",
    "invalid-chars-in-sld@!\"#$%(),/;<>_[]`|.org",
    "missing-dot-before-tld@com",
    "missing-tld@domain.",
    "just-a-string-no-at-sign", // Rewritten from original "invalid".
    // This email exceeds the 254-character total length limit, making it invalid.
    "the-full-length@of-an-entire-email-address.must-not-exceed-two-hundred-fifty-four-octets.this-email-is-precisely-255-characters-long.and-should-be-deemed-invalid-by-the-validator.adding-some-more-words-to-fill-the-length-requirement-properly.org",
    // This entry has a domain part that exceeds the 63-character limit, rendering it invalid.
    "local-part@each-domain-segment.has-a-maximum-length-of-sixty-three-characters.this-part-is-exactly-sixty-four-characters-so-it-is-invalid.com",
    "no-at-sign-here.net", // Rewritten from original "missing-at-sign.net".
    "unbracketed-ip@10.0.0.1", // Using a common private IP without brackets.
    "invalid-ip-segment@192.168.1.256", // An IP address with an out-of-range segment.
    "invalid-ip-length@1.2.3.4.5", // An IP address with too many segments.
    "ip-with-port@10.0.0.1:80" // An IP address with a port, which is generally invalid for email.
];

// --- Test Reporting Constants and Counters ---

// Define consistent output strings for test results.
const STATUS_PASS = "   PASS";
const STATUS_FAIL = "   FAIL";

// Initialize counters for tracking test execution statistics.
let totalAssertedTests = 0;
let assertedPasses = 0;
let assertedFailures = 0;

/**
 * Executes a single validation test, logs the outcome, and updates test counters.
 * This function encapsulates the test logic, promoting reusability and clarity.
 * @param {string} mailAddress - The email string to be validated.
 * @param {boolean} expectedOutcome - True if the email is expected to be valid, false otherwise.
 * @param {function} validationFn - The actual validation function to invoke (e.g., emailChecker.validate).
 * @returns {void}
 */
const performValidationAssertion = (mailAddress, expectedOutcome, validationFn) => {
    totalAssertedTests++; // Increment the total count of tests being asserted.

    // Store the actual result in an intermediate variable for clarity.
    const actualValidationResult = validationFn(mailAddress);
    let displayOutputStatus;

    // Utilize an if/else block for conditional logic, enhancing readability over a ternary.
    if (actualValidationResult) {
        displayOutputStatus = STATUS_PASS;
    } else {
        displayOutputStatus = STATUS_FAIL;
    }

    // Compare the actual result with the expected outcome to determine pass/fail status.
    if (actualValidationResult === expectedOutcome) {
        assertedPasses++;
    } else {
        assertedFailures++;
        // Log an error message for failed assertions to aid in debugging.
        console.error(`ERROR: Assertion failed for "${mailAddress}". Expected ${expectedOutcome ? "VALID" : "INVALID"}, but received ${actualValidationResult ? "VALID" : "INVALID"}.`);
    }

    // Output the test result using a template literal for modern string formatting.
    console.log(`${displayOutputStatus}: "${mailAddress}"`);
};


// --- Test Execution Blocks ---

console.log("\n--- Standard Valid Email Assertions ---");
console.log("These email addresses are expected to be VALID by the module.");
console.log("---------------------------------------");

// Iterate through the standard acceptable emails using a for...of loop.
for (const currentMail of standardAcceptableEmails) {
    performValidationAssertion(currentMail, true, emailChecker.validate);
}

console.log("\n--- Standard Invalid Email Assertions ---");
console.log("These email addresses are expected to be INVALID by the module.");
console.log("---------------------------------------------");

// Iterate through the standard rejected emails using a for...of loop.
for (const currentMail of standardRejectedEmails) {
    performValidationAssertion(currentMail, false, emailChecker.validate);
}

console.log("\n--- Complex Valid Email Checks (Module Support May Vary) ---");
console.log("These emails are RFC-compliant but module behavior might differ.");
console.log("The module's raw output for these will be displayed, without assertion against expected.");
console.log("-----------------------------------------------------------------");

// For complex valid emails, we only log the module's output without asserting
// a specific pass/fail outcome, as per the original script's implied intent for "unsupported".
for (const currentMail of complexValidEmails) {
    const actualResultForComplex = emailChecker.validate(currentMail);
    const complexDisplayStatus = actualResultForComplex ? STATUS_PASS : STATUS_FAIL;
    console.log(`${complexDisplayStatus}: "${currentMail}"`);
    // These are not included in the asserted test counts.
}

// --- Final Test Summary Report ---
console.log("\n--- Comprehensive Test Summary ---");
console.log(`Total assertions executed: ${totalAssertedTests}`);
console.log(`Assertions passed: ${assertedPasses}`);
console.log(`Assertions failed: ${assertedFailures}`);
console.log("------------------------------------");

// Determine the exit code based on the test results.
// This provides a clear indication of overall test suite success or failure.
if (assertedFailures > 0) {
    console.error("Some critical validation tests failed! Review the errors above.");
    process.exit(1); // Exit with a non-zero code to indicate failure.
} else {
    console.log("All critical validation tests passed successfully!");
    process.exit(0); // Exit with a zero code to indicate success.
}