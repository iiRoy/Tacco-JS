"use strict"; /* This directive enables strict mode for the entire script. */

// Import the validator module from the local index.js file.
var       validator = require ( "./index" ) ;

// --- Data Definitions for Email Validation Testing ---

/*
 *  Array of email addresses that are considered valid and are expected
 *  to be successfully validated by the module.
 */
var validSupported =
    [
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@letters-in-local.org" , // All letters in local part
        "01234567890@numbers-in-local.net"                                           , // All numbers in local part
        "&'*+-./=?^_{}~@other-valid-characters-in-local.net"                         , // Special characters in local part
        "mixed-1234-in-{+^}-local@sld.net"                                           , // Mixed characters in local part
        "a@single-character-in-local.org"                                            , // Single char local part
        "one-character-third-level@a.example.com"                                    , // Third level domain with single char
        "single-character-in-sld@x.org"                                              , // Single char SLD
        "local@dash-in-sld.com"                                                      , // Dash in SLD
        "letters-in-sld@123.com"                                                     , // SLD with numbers
        "one-letter-sld@x.org"                                                       , // One letter SLD
        "uncommon-tld@sld.museum"                                                    , // Uncommon TLD example
        "uncommon-tld@sld.travel"                                                    , // Another uncommon TLD
        "uncommon-tld@sld.mobi"                                                      , // Yet another uncommon TLD
        "country-code-tld@sld.uk"                                                    , // Country code TLD
        "country-code-tld@sld.rw"                                                    , // Another country code TLD
        "local@sld.newTLD"                                                           , // New generic TLD
        // A very long email address, exactly 254 characters, which should be valid.
        "the-total-length@of-an-entire-address.cannot-be-longer-than-two-hundred-and-fifty-four-characters.and-this-address-is-254-characters-exactly.so-it-should-be-valid.and-im-going-to-add-some-more-words-here.to-increase-the-lenght-blah-blah-blah-blah-bla.org",
        // Domain part exactly 63 characters long, which is the maximum allowed.
        "the-character-limit@for-each-part.of-the-domain.is-sixty-three-characters.this-is-exactly-sixty-three-characters-so-it-is-valid-blah-blah.com",
        "local@sub.domains.com"                                                      , // Subdomains example
        "backticks`are`legit@test.com"                                                 // Backticks in local part
    ] ;

/*
 *  Array of email addresses that are technically valid according to RFCs,
 *  but might not be supported by this specific validation module due to
 *  implementation choices or common practice.
 */
var validUnsupported =
    [
        "\"quoted\"@sld.com"                                   , // Quoted local part
        "\"\\e\\s\\c\\a\\p\\e\\d\"@sld.com"                     , // Escaped characters in quoted local part
        "\"quoted-at-sign@sld.org\"@sld.com"                   , // Quoted local part containing an @ sign
        "\"escaped\\\"quote\"@sld.com"                         , // Escaped double quote in quoted local part
        "\"back\\slash\"@sld.com"                              , // Backslash in quoted local part
        "punycode-numbers-in-tld@sld.xn--3e0b707e"             , // Punycode TLD
        "bracketed-IP-instead-of-domain@[127.0.0.1]"             // IP address literal as domain
    ] ;

/*
 *  Array of email addresses that are considered invalid and are expected
 *  to be rejected by the validation module.
 */
var invalidSupported =
    [
        "@missing-local.org"                                                                                                    , // Missing local part
        "! #$%`|@invalid-characters-in-local.org"                                                                               , // Invalid characters in local part (unquoted)
        "(),:;`|@more-invalid-characters-in-local.org"                                                                         , // More invalid characters
        "<>@[]\\`|@even-more-invalid-characters-in-local.org"                                                                   , // Even more invalid characters
        ".local-starts-with-dot@sld.com"                                                                                        , // Local part starts with a dot
        "local-ends-with-dot.@sld.com"                                                                                          , // Local part ends with a dot
        "two..consecutive-dots@sld.com"                                                                                         , // Two consecutive dots in local part
        "partially.\"quoted\"@sld.com"                                                                                          , // Partially quoted local part (invalid syntax)
        "the-local-part-is-invalid-if-it-is-longer-than-sixty-four-characters@sld.net"                                          , // Local part too long (over 64 chars)
        "missing-sld@.com"                                                                                                      , // Missing SLD
        "sld-starts-with-dashsh@-sld.com"                                                                                       , // SLD starts with a dash
        "sld-ends-with-dash@sld-.com"                                                                                           , // SLD ends with a dash
        "invalid-characters-in-sld@! \"#$%(),/;<>_[]`|.org"                                                                     , // Invalid characters in SLD
        "missing-dot-before-tld@com"                                                                                            , // Missing dot before TLD
        "missing-tld@sld."                                                                                                      , // Missing TLD
        "invalid"                                                                                                               , // Completely invalid format
        // Email address exceeding the total length limit of 254 characters.
        "the-total-length@of-an-entire-address.cannot-be-longer-than-two-hundred-and-fifty-four-characters.and-this-address-is-255-characters-exactly.so-it-should-be-invalid.and-im-going-to-add-some-more-words-here.to-increase-the-lenght-blah-blah-blah-blah-bl.org",
        // Domain part exceeding the 63-character limit.
        "the-character-limit@for-each-part.of-the-domain.is-sixty-three-characters.this-is-exactly-sixty-four-characters-so-it-is-invalid-blah-blah.com",
        "missing-at-sign.net"                                                                                                   , // Missing '@' symbol
        "unbracketed-IP@127.0.0.1"                                                                                              , // Unbracketed IP address as domain (invalid per RFC)
        "invalid-ip@127.0.0.1.26"                                                                                               , // Invalid IP address format (too many octets)
        "another-invalid-ip@127.0.0.256"                                                                                        , // Invalid IP address format (octet out of range)
        "IP-and-port@127.0.0.1:25"                                                                                                // IP address with port (not allowed for email domains)
    ] ;

// --- Execution and Output ---

// Display header for supported validations.
console.log ( "SUPPORTED BY MODULE:\n" ) ;

// Section for emails expected to be valid.
console.log ( "SHOULD BE VALID:" ) ;
validSupported . forEach ( function ( email )
    {
        // Log validation result for each email.
        console . log ( "%s : %s" , validator . validate ( email ) ? "    VALID" : "  INVALID" , email ) ;
    }
) ;

console . log ( "\nSHOULD BE INVALID:" ) ;
invalidSupported . forEach ( function ( email )
    {
        // Log validation result for each email.
        console . log ( "%s : %s" , validator . validate ( email ) ? "    VALID" : "  INVALID" , email ) ;
    }
) ;

// Display header for unsupported validations.
console . log ( "\n\nNOT SUPPORTED BY MODULE:\n" ) ;

console . log ( "SHOULD BE VALID:" ) ;
validUnsupported . forEach ( function ( email )
    {
        // Log validation result for each email. Note: These are valid per RFC but might fail the module.
        console . log ( "%s : %s" , validator . validate ( email ) ? "    VALID" : "  INVALID" , email ) ;
    }
) ;

// Exit the process with a success code.
process . exit ( 0 ) ;