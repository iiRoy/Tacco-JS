/*
 * This file contains a CodeMirror mode definition for AsciiDoc.
 * It's based on the Ace editor's AsciiDoc highlight rules.
 * Original Ace license information can be found here:
 * <https://raw.githubusercontent.com/ajaxorg/ace/master/LICENSE>
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source code.
 */
CodeMirror.defineMode ( "asciidoc" , function ( cmCfg , modeCfg ) {


// The core highlighting logic is encapsulated within this HighlightRules function.
// It defines how different parts of an AsciiDoc document should be tokenized.
var HighlightRules = function ( ) {

var identifierRe = "[a-zA-Z\u00a1-\uffff]+\\b" ; // Regular expression for a generic identifier.

this.$rules = {
// 'start' state: Initial state for tokenizing a line.
"start" : [
{ token : "empty" , regex : /$/ } , // Empty line token.
{ token : "literal" , regex : /^\.{4,}\s*$/ , next : "listingBlock" } , // Listing block delimiter (....)
{ token : "literal" , regex : /^-{4,}\s*$/ , next : "literalBlock" } , // Literal block delimiter (----)
{ token : "string" , regex : /^\+{4,}\s*$/ , next : "passthroughBlock" } , // Passthrough block delimiter (++++), often for raw content.
{ token : "keyword" , regex : /^={4,}\s*$/ } , // Comment block delimiter (====), often for document titles.
{ token : "text" , regex : /^\s*$/ } , // Blank line.
// Immediately transition to 'dissallowDelimitedBlock' without consuming any characters.
{ token : "empty" , regex : "" , next : "dissallowDelimitedBlock" }
] ,

// 'dissallowDelimitedBlock' state: Used after a block delimiter, to prevent nested delimiters.
"dissallowDelimitedBlock" : [
{ include : "paragraphEnd" } , // Check for paragraph ending patterns.
{ token : "comment" , regex : '^//.+$' } , // Single-line comment (//).
{ token : "keyword" , regex : "^(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION):" } , // Admonition labels.

{ include : "listStart" } , // Check for list item beginnings.
{ token : "literal" , regex : /^\s+.+$/ , next : "indentedBlock" } , // Indented block for source code.
{ token : "empty" , regex : "" , next : "text" } // Default to 'text' state if no other rule matches.
] ,

// 'paragraphEnd' state: Rules that can signify the end of a paragraph or block.
"paragraphEnd" : [
{ token : "doc.comment" , regex : /^\/{4,}\s*$/ , next : "commentBlock" } , // Comment block delimiter (////).
{ token : "tableBlock" , regex : /^\s*[|!]=+\s*$/ , next : "tableBlock" } , // Table block delimiter.
// Open block or rule.
{ token : "keyword" , regex : /^(?:--|''')\s*$/ , next : "start" } , // Delimiters for open blocks or thematic breaks.
{ token : "option" , regex : /^\[.*\]\s*$/ , next : "start" } , // Attribute list for blocks.
{ token : "pageBreak" , regex : /^>{3,}$/ , next : "start" } , // Page break (>>>).
{ token : "literal" , regex : /^\.{4,}\s*$/ , next : "listingBlock" } , // Listing block delimiter (repeating, for nested blocks).
{ token : "titleUnderline" , regex : /^(?:={2,}|-{2,}|~{2,}|\^{2,}|\+{2,})\s*$/ , next : "start" } , // Section title underline.
{ token : "singleLineTitle" , regex : /^={1,5}\s+\S.*$/ , next : "start" } , // Single-line section title.

{ token : "otherBlock" , regex : /^(?:\*{2,}|_{2,})\s*$/ , next : "start" } , // Delimiters for example blocks (****) or sidebar blocks (____).
// Optional title for a block.
{ token : "optionalTitle" , regex : /^\.[^.\s].+$/ , next : "start" } // Block title starting with a dot.
] ,

// 'listStart' state: Rules for detecting the beginning of list items.
"listStart" : [
{ token : "keyword" , regex : /^\s*(?:\d+\.|[a-zA-Z]\.|[ixvmIXVM]+\)|\*{1,5}|-|\.{1,5})\s/ , next : "listText" } , // Ordered, unordered, or description list item.
{ token : "meta.tag" , regex : /^.+(?::{2,4}|;;)(?: |$)/ , next : "listText" } , // Description list terms (::, :::, :::: or ;;).
{ token : "support.function.list.callout" , regex : /^(?:<\d+>|\d+>|>) / , next : "text" } , // List callouts (<1>, 1>, >).
// List continuation.
{ token : "keyword" , regex : /^\+\s*$/ , next : "start" } // List continuation marker (+).
] ,

// 'text' state: General text parsing, including links, macros, and formatted text.
"text" : [
{ token : [ "link" , "variable.language" ] , regex : /((?:https?:\/\/|ftp:\/\/|file:\/\/|mailto:|callto:)[^\s\[]+)(\[.*?\])/ } , // Links with optional labels.
{ token : "link" , regex : /(?:https?:\/\/|ftp:\/\/|file:\/\/|mailto:|callto:)[^\s\[]+/ } , // Bare URLs.
{ token : "link" , regex : /\b[\w\.\/\-]+@[\w\.\/\-]+\b/ } , // Email addresses.
{ include : "macros" } , // Include macro rules.
{ include : "paragraphEnd" } , // Check for paragraph end conditions.
{ token : "literal" , regex : /\+{3,}/ , next : "smallPassthrough" } , // Inline passthrough (+++).
{ token : "escape" , regex : /\((?:C|TM|R)\)|\.{3}|->|<-|=>|<=|&#(?:\d+|x[a-fA-F\d]+);|(?: |^)--(?=\s+\S)/ } , // Special characters/entities like (C), ..., ->, --.
{ token : "escape" , regex : /\\[_*'`+#]|\\{2}[_*'`+#]{2}/ } , // Escaped formatting characters.
{ token : "keyword" , regex : /\s\+$/ } , // Trailing plus for block continuation.
// Any word.
{ token : "text" , regex : identifierRe } , // Generic word token.
{ token : [ "keyword" , "string" , "keyword" ] ,
regex : /(<<[\w\d\-$]+,)(.*?)(>>|$)/ } , // Cross-reference (<<id,text>>).
{ token : "keyword" , regex : /<<[\w\d\-$]+,?|>>/ } , // Cross-reference parts.
{ token : "constant.character" , regex : /\({2,3}.*?\){2,3}/ } , // Callouts ((1)), (((1))).
// Anchor.
{ token : "keyword" , regex : /\[\[.+?\]\]/ } , // Anchor ([[]]).
// Bibliography.
{ token : "support" , regex : /^\[{3}[\w\d =\-]+\]{3}/ } , // Bibliography entry ([[[]]]).

{ include : "quotes" } , // Include rules for quoted text (bold, italic, etc.).
// Text block end.
{ token : "empty" , regex : /^\s*$/ , next : "start" } // Empty line, return to 'start' state.
] ,

// 'listText' state: Used for the content of list items.
"listText" : [
{ include : "listStart" } , // Allow nested lists.
{ include : "text" } // Standard text rules apply.
] ,

// 'indentedBlock' state: For code blocks that are simply indented.
"indentedBlock" : [
{ token : "literal" , regex : /^[\s\w].+$/ , next : "indentedBlock" } , // Any non-empty line continues the block.
{ token : "literal" , regex : "" , next : "start" } // Empty line or end of file terminates the block.
] ,

// 'listingBlock' state: Specific for AsciiDoc listing blocks.
"listingBlock" : [
{ token : "literal" , regex : /^\.{4,}\s*$/ , next : "dissallowDelimitedBlock" } , // End delimiter (....).
{ token : "constant.numeric" , regex : '<\\d+>' } , // Callout numbers within listings.
{ token : "literal" , regex : '[^<]+' } , // Any character sequence not starting with '<'.
{ token : "literal" , regex : '<' } // Handle '<' separately.
] ,
// 'literalBlock' state: For literal blocks in AsciiDoc.
"literalBlock" : [
{ token : "literal" , regex : /^-{4,}\s*$/ , next : "dissallowDelimitedBlock" } , // End delimiter (----).
{ token : "constant.numeric" , regex : '<\\d+>' } , // Callout numbers.
{ token : "literal" , regex : '[^<]+' } ,
{ token : "literal" , regex : '<' }
] ,
// 'passthroughBlock' state: For passthrough blocks.
"passthroughBlock" : [
{ token : "literal" , regex : /^\+{4,}\s*$/ , next : "dissallowDelimitedBlock" } , // End delimiter (++++).
{ token : "literal" , regex : identifierRe + "|\\d+" } , // Identifiers or numbers.
{ include : "macros" } , // Macros can appear in passthrough.
{ token : "literal" , regex : "." } // Any other character.
] ,

// 'smallPassthrough' state: For inline passthrough.
"smallPassthrough" : [
{ token : "literal" , regex : /[+]{3,}/ , next : "dissallowDelimitedBlock" } , // End delimiter (+++).
{ token : "literal" , regex : /^\s*$/ , next : "dissallowDelimitedBlock" } , // Empty line also terminates.
{ token : "literal" , regex : identifierRe + "|\\d+" } ,
{ include : "macros" }
] ,

// 'commentBlock' state: For multi-line comment blocks.
"commentBlock" : [
{ token : "doc.comment" , regex : /^\/{4,}\s*$/ , next : "dissallowDelimitedBlock" } , // End delimiter (////).
{ token : "doc.comment" , regex : '^.*$' } // Any line within the comment block.
] ,
// 'tableBlock' state: For AsciiDoc tables.
"tableBlock" : [
{ token : "tableBlock" , regex : /^\s*\|={3,}\s*$/ , next : "dissallowDelimitedBlock" } , // End of table (|=).
{ token : "tableBlock" , regex : /^\s*!={3,}\s*$/ , next : "innerTableBlock" } , // Inner table delimiter (!=).
{ token : "tableBlock" , regex : /\|/ } , // Table cell separator.
{ include : "text" , noEscape : true } // Text content within cells, no escaping.
] ,
// 'innerTableBlock' state: For nested tables or specific table regions.
"innerTableBlock" : [
{ token : "tableBlock" , regex : /^\s*!={3,}\s*$/ , next : "tableBlock" } , // Inner table end.
{ token : "tableBlock" , regex : /^\s*|={3,}\s*$/ , next : "dissallowDelimitedBlock" } , // Outer table end.
{ token : "tableBlock" , regex : /\!/ } // Cell separator for inner tables.
] ,
// 'macros' state: Rules for various AsciiDoc macros.
"macros" : [
{ token : "macro" , regex : /{[\w\-$]+}/ } , // Attribute references ({attribute}).
{ token : [ "text" , "string" , "text" , "constant.character" , "text" ] , regex : /({)([\w\-$]+)(:)?(.+)?(})/ } , // Complex attribute references.
{ token : [ "text" , "markup.list.macro" , "keyword" , "string" ] , regex : /(\w+)(footnote(?:ref)?::?)([^\s\[]+)?(\[.*?\])?/ } , // Footnote macros (footnote:[], footnoteref:[]).
{ token : [ "markup.list.macro" , "keyword" , "string" ] , regex : /([a-zA-Z\-][\w\.\/\-]*::?)([^\s\[]+)(\[.*?\])?/ } , // General block/inline macros (macro:target[attributes]).
{ token : [ "markup.list.macro" , "keyword" ] , regex : /([a-zA-Z\-][\w\.\/\-]+::?)(\[.*?\])/ } , // Macros with only attributes.
{ token : "keyword" , regex : /^:.+?:(?= |$)/ } // Block attributes (e.g., :attribute: value).
] ,

// 'quotes' state: Rules for bold, italic, monospaced, and other inline formatting.
"quotes" : [
{ token : "string.italic" , regex : /__[^_\s].*?__/ } , // Italic with double underscores.
{ token : "string.italic" , regex : quoteRule ( "_" ) } , // Italic with single underscore.

{ token : "keyword.bold" , regex : /\*\*[^*\s].*?\*\*/ } , // Bold with double asterisks.
{ token : "keyword.bold" , regex : quoteRule ( "\\*" ) } , // Bold with single asterisk.

{ token : "literal" , regex : quoteRule ( "\\+" ) } , // Monospace with single plus.
{ token : "literal" , regex : /\+\+[^+\s].*?\+\+/ } , // Monospace with double plus.
{ token : "literal" , regex : /\$\$.+?\$\$/ } , // LaTeX-style math blocks ($$).
{ token : "literal" , regex : quoteRule ( "`" ) } , // Monospace with backticks.

{ token : "keyword" , regex : quoteRule ( "^" ) } , // Superscript (^).
{ token : "keyword" , regex : quoteRule ( "~" ) } , // Subscript (~).
{ token : "keyword" , regex : /##?/ } , // Number sign (##).
{ token : "keyword" , regex : /(?:\B|^)``|\b''/ } // Smart quotes (`` '').
]

} ; // End of this.$rules definition.


// Helper function to generate regex for quoted text, considering word boundaries.
function quoteRule ( ch ) {
var prefix = /\w/.test ( ch ) ? "\\b" : "(?:\\B|^)" ; // Add word boundary if 'ch' is a word char.
return prefix + ch + "[^" + ch + "].*?" + ch + "(?![\\w*])" ; // Pattern for quoted text.
}


/*addQuoteBlock("text")*/ // This was a commented-out line in the original; kept commented.


// A mapping to standardize token types from Ace to CodeMirror.
var tokenMap = {
macro : "constant.character" ,
tableBlock : "doc.comment" ,
titleUnderline : "markup.heading" ,
singleLineTitle : "markup.heading" ,
pageBreak : "string" ,
option : "string.regexp" ,
otherBlock : "markup.list" ,
literal : "support.function" ,
optionalTitle : "constant.numeric" ,
escape : "constant.language.escape" ,
link : "markup.underline.list"
} ;


// Post-processing of rules: Expand 'include' directives and remap tokens.
for ( var state in this.$rules ) {
var stateRules = this.$rules[ state ] ; // Get rules for the current state.
for ( var i = stateRules.length ; i-- ; ) { // Iterate backwards for safe splicing.
var rule = stateRules[ i ] ;
if ( rule.include || typeof rule == "string" ) {
// If the rule is an 'include' directive or just a string reference to another rule set.
var args = [ i , 1 ] . concat ( this.$rules[ rule.include || rule ] ) ; // Prepare arguments for splice.
if ( rule.noEscape ) {
// If 'noEscape' is true, filter out rules that change state (next).
args = args . filter ( function ( x ) {
return ! x . next ;
} ) ;
}
stateRules . splice . apply ( stateRules , args ) ; // Insert included rules.
} else if ( rule.token in tokenMap ) {
// Remap Ace token names to CodeMirror-compatible names if found in tokenMap.
rule . token = tokenMap[ rule.token ] ;
}
}
}
} ; // End of HighlightRules function.




/*
 * Below is Ace's Syntax Tokenizer implementation, adapted for CodeMirror.
 * It's responsible for breaking down a line of text into tokens based on the defined rules.
 */

// Global variable: Tokenizing lines longer than this can significantly slow down the editor.
var MAX_TOKEN_COUNT = 1000 ;
var Tokenizer = function ( rules ) {
this . states = rules ; // The highlight rules defined above.

this . regExps = { } ; // Compiled regular expressions for each state.
this . matchMappings = { } ; // Maps regex group indices to rule indices.

// Iterate through each state's rules to compile regexes and create mappings.
for ( var key in this . states ) {
var state = this . states[ key ] ;
var ruleRegExps = [ ] ;
var matchTotal = 0 ;
var mapping = this . matchMappings[ key ] = { defaultToken : "text" } ; // Default token type for this state.
var flag = "g" ; // Default regex flag for global matching.

var splitterRurles = [ ] ; // Rules that need a special splitter regex.
for ( var i = 0 ; i < state . length ; i++ ) {
var rule = state[ i ] ;
if ( rule . defaultToken )
mapping . defaultToken = rule . defaultToken ;
if ( rule . caseInsensitive )
flag = "gi" ; // Set case-insensitive flag if specified.
if ( rule . regex == null )
continue ; // Skip rules without a regex.

if ( rule . regex instanceof RegExp )
rule . regex = rule . regex . toString ( ) . slice ( 1 , -1 ) ; // Convert RegExp object to string.

// Count number of matching groups. 2 extra groups from the full match.
// And the catch-all on the end (used to force a match);
var adjustedregex = rule . regex ;
var matchcount = new RegExp ( "(?:(" + adjustedregex + ")|(.))" ) . exec ( "a" ) . length - 2 ;
if ( Array . isArray ( rule . token ) ) {
if ( rule . token . length == 1 || matchcount == 1 ) {
rule . token = rule . token[ 0 ] ; // If only one token or one group, simplify.
} else if ( matchcount - 1 != rule . token . length ) {
// Error if number of groups doesn't match number of tokens.
throw new Error ( "number of classes and regexp groups in '" +
rule . token + "'\n'" + rule . regex + "' doesn't match\n"
+ ( matchcount - 1 ) + "!=" + rule . token . length ) ;
} else {
rule . tokenArray = rule . token ; // Store token array.
rule . token = null ; // Nullify 'token' to use 'tokenArray'.
rule . onMatch = this . $arrayTokens ; // Custom onMatch handler for array tokens.
}
} else if ( typeof rule . token == "function" && ! rule . onMatch ) {
if ( matchcount > 1 )
rule . onMatch = this . $applyToken ; // Use a wrapper if multiple groups.
else
rule . onMatch = rule . token ; // Direct function call if single group.
}

if ( matchcount > 1 ) {
if ( /\\\d/ . test ( rule . regex ) ) {
// Replace any backreferences and offset appropriately.
adjustedregex = rule . regex . replace ( /\\([0-9]+)/g , function ( match , digit ) {
return "\\" + ( parseInt ( digit , 10 ) + matchTotal + 1 ) ;
} ) ;
} else {
matchcount = 1 ;
adjustedregex = this . removeCapturingGroups ( rule . regex ) ; // Remove non-essential capturing groups.
}
if ( ! rule . splitRegex && typeof rule . token != "string" )
splitterRurles . push ( rule ) ; // Flag for later splitter regex creation.
}

mapping[ matchTotal ] = i ; // Map the regex group index to the rule index.
matchTotal += matchcount ; // Accumulate total match groups.

ruleRegExps . push ( adjustedregex ) ; // Add the adjusted regex to the list.

// Makes property access faster.
if ( ! rule . onMatch )
rule . onMatch = null ;
}

splitterRurles . forEach ( function ( rule ) {
rule . splitRegex = this . createSplitterRegexp ( rule . regex , flag ) ; // Create splitter regexes.
} , this ) ;

this . regExps[ key ] = new RegExp ( "(" + ruleRegExps . join ( ")|(" ) + ")|($)" , flag ) ; // Compile the final regex for the state.
}
} ;

// Extend the Tokenizer prototype with helper methods.
( function ( ) {
this . $setMaxTokenCount = function ( m ) {
MAX_TOKEN_COUNT = m | 0 ; // Set maximum token count.
} ;

this . $applyToken = function ( str ) {
var values = this . splitRegex . exec ( str ) . slice ( 1 ) ; // Execute splitter regex.
var types = this . token . apply ( this , values ) ; // Call token function with values.

// Required for compatibility with old modes.
if ( typeof types === "string" )
return [ { type : types , value : str } ] ; // Return single token if type is string.

var tokens = [ ] ;
for ( var i = 0 , l = types . length ; i < l ; i++ ) {
if ( values[ i ] )
tokens[ tokens . length ] = {
type : types[ i ] ,
value : values[ i ]
} ; // Create tokens from types and values.
}
return tokens ;
} ,

this . $arrayTokens = function ( str ) {
if ( ! str )
return [ ] ; // Return empty array if string is empty.
var values = this . splitRegex . exec ( str ) ;
if ( ! values )
return "text" ; // Default to "text" if no match.
var tokens = [ ] ;
var types = this . tokenArray ;
for ( var i = 0 , l = types . length ; i < l ; i++ ) {
if ( values[ i + 1 ] )
tokens[ tokens . length ] = {
type : types[ i ] ,
value : values[ i + 1 ]
} ; // Create tokens from array.
}
return tokens ;
} ;

// Removes non-capturing groups from a regex string.
this . removeCapturingGroups = function ( src ) {
var r = src . replace (
/\[(?:\\.|[^\]])*?\]|\\.|\(\?[:=!]|(\()/g ,
function ( x , y ) { return y ? "(?:" : x ; } // Replace '(' with '(?:'.
) ;
return r ;
} ;

// Creates a splitter regex that preserves matched groups.
this . createSplitterRegexp = function ( src , flag ) {
if ( src . indexOf ( "(?=" ) != -1 ) {
var stack = 0 ;
var inChClass = false ;
var lastCapture = { } ;
src . replace ( /(\\.)|(\((?:\?[=!])?)|(\))|([\[\]])/g , function (
m , esc , parenOpen , parenClose , square , index
) {
if ( inChClass ) {
inChClass = square != "]" ;
} else if ( square ) {
inChClass = true ;
} else if ( parenClose ) {
if ( stack == lastCapture . stack ) {
lastCapture . end = index + 1 ;
lastCapture . stack = -1 ;
}
stack-- ;
} else if ( parenOpen ) {
stack++ ;
if ( parenOpen . length != 1 ) {
lastCapture . stack = stack
lastCapture . start = index ;
}
}
return m ;
} ) ;

if ( lastCapture . end != null && /^\)*$/ . test ( src . substr ( lastCapture . end ) ) )
src = src . substring ( 0 , lastCapture . start ) + src . substr ( lastCapture . end ) ;
}
return new RegExp ( src , ( flag || "" ) . replace ( "g" , "" ) ) ; // Return regex without global flag.
} ;

/**
 * Returns an object containing two properties: `tokens`, which contains all the tokens; and `state`, the current state.
 * @returns {Object}
 **/
this . getLineTokens = function ( line , startState ) {
// Handle startState being an array (stack of states).
if ( startState && typeof startState != "string" ) {
var stack = startState . slice ( 0 ) ;
startState = stack[ 0 ] ;
} else
var stack = [ ] ;

var currentState = startState || "start" ; // Default to 'start' state.
var state = this . states[ currentState ] ;
if ( ! state ) {
currentState = "start" ; // Fallback to 'start' if state not found.
state = this . states[ currentState ] ;
}
var mapping = this . matchMappings[ currentState ] ;
var re = this . regExps[ currentState ] ;
re . lastIndex = 0 ; // Reset regex index for the line.

var match , tokens = [ ] ;
var lastIndex = 0 ;

var token = { type : null , value : "" } ; // Current token being built.

while ( match = re . exec ( line ) ) {
var type = mapping . defaultToken ;
var rule = null ;
var value = match[ 0 ] ;
var index = re . lastIndex ;

if ( index - value . length > lastIndex ) {
var skipped = line . substring ( lastIndex , index - value . length ) ;
if ( token . type == type ) {
token . value += skipped ;
} else {
if ( token . type )
tokens . push ( token ) ;
token = { type : type , value : skipped } ;
}
}

for ( var i = 0 ; i < match . length - 2 ; i++ ) {
if ( match[ i + 1 ] === undefined )
continue ; // Skip unmatched groups.

rule = state[ mapping[ i ] ] ; // Get the rule associated with the matched group.

if ( rule . onMatch )
type = rule . onMatch ( value , currentState , stack ) ; // Call custom onMatch handler.
else
type = rule . token ; // Use the token type from the rule.

if ( rule . next ) {
// State transition.
if ( typeof rule . next == "string" )
currentState = rule . next ; // Next state is a string.
else
currentState = rule . next ( currentState , stack ) ; // Next state is a function.

state = this . states[ currentState ] ;
if ( ! state ) {
window . console && console . error && console . error ( currentState , "doesn't exist" ) ;
currentState = "start" ;
state = this . states[ currentState ] ;
}
mapping = this . matchMappings[ currentState ] ;
lastIndex = index ;
re = this . regExps[ currentState ] ;
re . lastIndex = index ; // Reset regex index after state change.
}
break ; // Only the first matching rule applies.
}

if ( value ) {
if ( typeof type == "string" ) {
if ( ( ! rule || rule . merge !== false ) && token . type === type ) {
token . value += value ; // Merge with previous token if types are same.
} else {
if ( token . type )
tokens . push ( token ) ;
token = { type : type , value : value } ; // Create new token.
}
} else if ( type ) {
if ( token . type )
tokens . push ( token ) ;
token = { type : null , value : "" } ;
for ( var i = 0 ; i < type . length ; i++ )
tokens . push ( type[ i ] ) ; // Handle multiple tokens from onMatch.
}
}

if ( lastIndex == line . length )
break ; // End of line reached.

lastIndex = index ;

if ( tokens . length > MAX_TOKEN_COUNT ) {
// Chrome doesn't show contents of text nodes with very long text.
// Handle overflow by creating "overflow" tokens.
while ( lastIndex < line . length ) {
if ( token . type )
tokens . push ( token ) ;
token = {
value : line . substring ( lastIndex , lastIndex += 2000 ) ,
type : "overflow"
} ;
}
currentState = "start" ; // Reset state and stack on overflow.
stack = [ ] ;
break ;
}
}

if ( token . type )
tokens . push ( token ) ; // Add any remaining token.

if ( stack . length > 1 ) {
if ( stack[ 0 ] !== currentState )
stack . unshift ( currentState ) ; // Ensure current state is at top of stack.
}
return {
tokens : tokens ,
state : stack . length ? stack : currentState // Return tokens and final state.
} ;
} ;

} ) . call ( Tokenizer . prototype ) ; // Apply methods to Tokenizer prototype.

} ) ; // End of CodeMirror.defineMode.