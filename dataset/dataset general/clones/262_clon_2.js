"use strict"; // Enforce strict parsing rules for better code quality.

// Import the core address syntax verification utility from the local module.
const addressSyntaxVerifier = require('./index');

// List of email addresses that are syntactically valid and expected to be handled correctly by the module.
const validModuleCompliantSamples =
[
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@letters-in-local.org",
    "01234567890@numbers-in-local.net",
    "&'*+-./=?^_{}~@other-valid-characters-in-local.net",
    "mixed-1234-in-{+^}-local@sld.net",
    "a@single-character-in-local.org",
    "one-character-third-level@a.example.com",
    "single-character-in-sld@x.org",
    "local@dash-in-sld.com",
    "letters-in-sld@123.com",
    "one-letter-sld@x.org",
    "uncommon-tld@sld.museum",
    "uncommon-tld@sld.travel",
    "uncommon-tld@sld.mobi",
    "country-code-tld@sld.uk",
    "country-code-tld@sld.rw",
    "local@sld.newTLD",
    "the-total-length@of-an-entire-address.cannot-be-longer-than-two-hundred-and-fifty-four-characters.and-this-address-is-254-characters-exactly.so-it-should-be-valid.and-im-going-to-add-some-more-words-here.to-increase-the-lenght-blah-blah-blah-blah-bla.org",
    "the-character-limit@for-each-part.of-the-domain.is-sixty-three-characters.this-is-exactly-sixty-three-characters-so-it-is-valid-blah-blah.com",
    "local@sub.domains.com",
    "backticks`are`legit@test.com"
];

// Collection of email addresses that are technically valid per RFCs, but the current module implementation does not support them.
const validNonModuleCompliantSamples =
[
    "\"quoted\"@sld.com",
    "\"\\e\\s\\c\\a\\p\\e\\d\"@sld.com",
    "\"quoted-at-sign@sld.org\"@sld.com",
    "\"escaped\\\"quote\"@sld.com",
    "\"back\\slash\"@sld.com",
    "punycode-numbers-in-tld@sld.xn--3e0b707e",
    "bracketed-IP-instead-of-domain@[127.0.0.1]"
];

// Array of email addresses that are syntactically invalid and should be correctly identified as such by the module.
const invalidModuleCompliantSamples =
[
    "@missing-local.org",
    "! #$%`|@invalid-characters-in-local.org",
    "(),:;`|@more-invalid-characters-in-local.org",
    "<>@[]\\`|@even-more-invalid-characters-in-local.org",
    ".local-starts-with-dot@sld.com",
    "local-ends-with-dot.@sld.com",
    "two..consecutive-dots@sld.com",
    "partially.\"quoted\"@sld.com",
    "the-local-part-is-invalid-if-it-is-longer-than-sixty-four-characters@sld.net",
    "missing-sld@.com",
    "sld-starts-with-dashsh@-sld.com",
    "sld-ends-with-dash@sld-.com",
    "invalid-characters-in-sld@! \"#$%(),/;<>_[]`|.org",
    "missing-dot-before-tld@com",
    "missing-tld@sld.",
    "invalid",
    "the-total-length@of-an-entire-address.cannot-be-longer-than-two-hundred-and-fifty-four-characters.and-this-address-is-255-characters-exactly.so-it-should-be-invalid.and-im-going-to-add-some-more-words-here.to-increase-the-lenght-blah-blah-blah-blah-bl.org",
    "the-character-limit@for-each-part.of-the-domain.is-sixty-three-characters.this-is-exactly-sixty-four-characters-so-it-is-invalid-blah-blah.com",
    "missing-at-sign.net",
    "unbracketed-IP@127.0.0.1",
    "invalid-ip@127.0.0.1.26",
    "another-invalid-ip@127.0.0.256",
    "IP-and-port@127.0.0.1:25"
];

// Begin outputting the test results for addresses the module is designed to handle.
console.log("--- MODULE COMPLIANT ADDRESSES ---\n");

console.log("EXPECTED VALID CASES:");
validModuleCompliantSamples.forEach(
    function(testAddress) {
        console.log(
            "%s : %s",
            addressSyntaxVerifier.verifySyntax(testAddress) ? "  PASS" : "  FAIL",
            testAddress
        );
    }
);

console.log("\nEXPECTED INVALID CASES:");
invalidModuleCompliantSamples.forEach(
    function(testAddress) {
        console.log(
            "%s : %s",
            addressSyntaxVerifier.verifySyntax(testAddress) ? "  PASS" : "  FAIL",
            testAddress
        );
    }
);

// Output for valid addresses that are not fully supported by the current module's scope.
console.log("\n\n--- NON-MODULE COMPLIANT (YET VALID) ADDRESSES ---\n");

console.log("EXPECTED VALID CASES (MODULE MAY FAIL):");
validNonModuleCompliantSamples.forEach(
    function(testAddress) {
        console.log(
            "%s : %s",
            addressSyntaxVerifier.verifySyntax(testAddress) ? "  PASS" : "  FAIL",
            testAddress
        );
    }
);

// Terminate the process upon completion of all tests.
process.exit(0);