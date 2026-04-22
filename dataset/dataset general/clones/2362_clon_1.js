"use strict"
var Markdown;

// Determine environment and initialize Markdown object
if (typeof exports === "object" && typeof require === "function") {
    // We are in a CommonJS (e.g. Node.js) module environment
    Markdown = exports;
} else {
    // Not in CommonJS, initialize as an empty object
    Markdown = {};
}

/*
 * The following text is included for historical reasons.
 * It's not entirely accurate anymore, but provides context.
 */

/*
 * Wherever possible, Showdown aims to be a direct, line-by-line port
 * of the original Perl version of Markdown.
 *
 * This parsing design isn't conventional; it primarily relies on
 * a series of string substitutions. While this approach can make
 * the code challenging to read and maintain, keeping Showdown
 * faithful to the original design simplifies porting new features.
 *
 * Crucially, Showdown replicates markdown.pl's behavior in most
 * edge cases. This enables web applications to offer client-side
 * previews using Javascript, then generate identical HTML on the server.
 *
 * This port requires the advanced RegExp functionality introduced in ECMA 262,
 * 3rd Edition (specifically, Javascript 1.5). Most contemporary web browsers
 * should support this. Even with these new regular expression features,
 * considerable effort is expended to mimic Perl's regex capabilities.
 * Tricky modifications within this file are often marked with the "attacklab:"
 * label. More straightforward or self-explanatory changes are not.
 *
 * Sophisticated diff tools like Araxis Merge can effectively compare
 * this file with markdown.pl. A few adjustments can aid this process:
 * in a copy of markdown.pl, replace "#" with "//" and "$text" with "text".
 * Ensure whitespace and line endings are ignored during comparison.
 */


/*
 * Basic Usage Example:
 *
 *     var text = "Markdown *rocks*.";
 *
 *     var converter = new Markdown.Converter();
 *     var html = converter.makeHtml(text);
 *
 *     alert(html);
 *
 * Note: To use this sample code, move it to the end of this file
 * and then uncomment it.
 */

(function () {

    function identity( x ) {
        return x;
    }
    function returnFalse( x ) {
        return false;
    }

    function HookCollection() {
        /* Constructor for HookCollection */
    }

    HookCollection.prototype = {

        chain: function ( hookname, func ) {
            var original = this[hookname];
            if ( !original ) {
                throw new Error("unknown hook " + hookname);
            }

            if ( original === identity ) {
                this[hookname] = func;
            } else {
                this[hookname] = function ( text ) {
                    var args = Array.prototype.slice.call(arguments, 0);
                    args[0] = original.apply(null, args);
                    return func.apply(null, args);
                };
            }
        },
        set: function ( hookname, func ) {
            if ( !this[hookname] ) {
                throw new Error("unknown hook " + hookname);
            }
            this[hookname] = func;
        },
        addNoop: function ( hookname ) {
            this[hookname] = identity;
        },
        addFalse: function ( hookname ) {
            this[hookname] = returnFalse;
        }
    };

    Markdown.HookCollection = HookCollection;

    /*
     * g_urls and g_titles allow arbitrary user-entered strings as keys.
     * This caused exceptions (and halted rendering) when the user input
     * e.g. [push] or [__proto__]. Prefixing the actual key prevents this
     * (as no built-in property begins with "s_").
     * See: http://meta.stackexchange.com/questions/64655/strange-wmd-bug
     * (Though, simply switching from Array() to Object() would have
     * left only __proto__ as a potential problem).
     */
    function SaveHash() { /* Constructor for SaveHash */ }
    SaveHash.prototype = {
        set: function ( key, value ) {
            this["s_" + key] = value;
        },
        get: function ( key ) {
            return this["s_" + key];
        }
    };

    Markdown.Converter = function ( OPTIONS ) {
        var pluginHooks = this.hooks = new HookCollection();

        // given a URL that was encountered by itself (without markup), should return the link text that's to be given to this link
        pluginHooks.addNoop("plainLinkText");

        // called with the orignal text as given to makeHtml. The result of this plugin hook is the actual markdown source that will be cooked
        pluginHooks.addNoop("preConversion");

        // called with the text once all normalizations have been completed (tabs to spaces, line endings, etc.), but before any conversions have
        pluginHooks.addNoop("postNormalization");

        // Called with the text before / after creating block elements like code blocks and lists. Note that this is called recursively
        // with inner content, e.g. it's called with the full text, and then only with the content of a blockquote. The inner
        // call will receive outdented text.
        pluginHooks.addNoop("preBlockGamut");
        pluginHooks.addNoop("postBlockGamut");

        // called with the text of a single block element before / after the span-level conversions (bold, code spans, etc.) have been made
        pluginHooks.addNoop("preSpanGamut");
        pluginHooks.addNoop("postSpanGamut");

        // called with the final cooked HTML code. The result of this plugin hook is the actual output of makeHtml
        pluginHooks.addNoop("postConversion");

        //
        // Private state of the converter instance:
        //

        // Global hashes, used by various utility routines
        var g_urls;
        var g_titles;
        var g_html_blocks;

        // Used to track when we're inside an ordered or unordered list
        // (see _ProcessListItems() for details):
        var g_list_level;

        OPTIONS = OPTIONS || {};
        var asciify = identity, deasciify = identity;
        if ( OPTIONS.nonAsciiLetters ) {

            /* In JavaScript regular expressions, \w only denotes [a-zA-Z0-9_].
             * This leads to inconsistent handling, e.g., with intra-word bolding
             * of Japanese words. Therefore, if OPTIONS.nonAsciiLetters is true,
             * we implement the following:
             *
             * Before processing bold and italics, we identify every instance
             * of a Unicode word character in the Markdown source that is not
             * matched by \w, along with the letter "Q". We then encode the
             * character's code point in base 51, using the "digits"
             *
             *     A, B, ..., P, R, ..., Y, Z, a, b, ..., y, z
             *
             * and delimit it with "Q" on both sides. For example, the source
             *
             * > In Chinese, the smurfs are called Ë{¾«ì`, meaning "blue spirits".
             *
             * transforms into
             *
             * > In Chinese, the smurfs are called QNIhQQMOIQQOuUQ, meaning "blue spirits".
             *
             * Since every Unicode letter is now an ASCII letter (or several),
             * \w and \b should function correctly.
             *
             * After the bold/italic conversion, we decode the text. Because "Q"
             * was encoded with non-ASCII characters (e.g., as "QBfQ") and the
             * conversion process will not generate "Q", any instances of "Q"
             * should correspond to our encoded characters. Furthermore, since
             * the conversion does not break words, the "Q...Q" sequences
             * should remain intact.
             *
             * We use "Q" as the delimiter because it is likely one of the
             * rarest characters, and I can't foresee any special behavior
             * that would be triggered by this letter (e.g., if we used "H"
             * on the left and "P" on the right, "¦·" would encode as "HTTP",
             * which might cause special behavior). The latter wouldn't be a
             * major issue for bold/italic, but could be problematic if used
             * in other contexts.
             */
            (function () {
                var lettersThatJavaScriptDoesNotKnowAndQ = /[Q\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376-\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0523\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0621-\u064a\u0660-\u0669\u066e-\u066f\u0671-\u06d3\u06d5\u06e5-\u06e6\u06ee-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07c0-\u07ea\u07f4-\u07f5\u07fa\u0904-\u0939\u093d\u0950\u0958-\u0961\u0966-\u096f\u0971-\u0972\u097b-\u097f\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc-\u09dd\u09df-\u09e1\u09e6-\u09f1\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a59-\u0a5c\u0a5e\u0a66-\u0a6f\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0-\u0ae1\u0ae6-\u0aef\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3d\u0b5c-\u0b5d\u0b5f-\u0b61\u0b66-\u0b6f\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0be6-\u0bef\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58-\u0c59\u0c60-\u0c61\u0c66-\u0c6f\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0-\u0ce1\u0ce6-\u0cef\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d28\u0d2a-\u0d39\u0d3d\u0d60-\u0d61\u0d66-\u0d6f\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32-\u0e33\u0e40-\u0e46\u0e50-\u0e59\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb0\u0eb2-\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0ed0-\u0ed9\u0edc-\u0edd\u0f00\u0f20-\u0f29\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8b\u1000-\u102a\u103f-\u1049\u1050-\u1055\u105a-\u105d\u1061\u1065-\u1066\u106e-\u1070\u1075-\u1081\u108e\u1090-\u1099\u10a0-\u10c5\u10d0-\u10fa\u10fc\u1100-\u1159\u115f-\u11a2\u11a8-\u11f9\u1200-\u1248\u124a-\u124d\u1250-\u1256\u1258-\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u1676\u1681-\u169a\u16a0-\u16ea\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u17e0-\u17e9\u1810-\u1819\u1820-\u1877\u1880-\u18a8\u18aa\u1900-\u191c\u1946-\u196d\u1970-\u1974\u1980-\u19a9\u19c1-\u19c7\u19d0-\u19d9\u1a00-\u1a16\u1b05-\u1b33\u1b45-\u1b4b\u1b50-\u1b59\u1b83-\u1ba0\u1bae-\u1bb9\u1c00-\u1c23\u1c40-\u1c49\u1c4d-\u1c7d\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u203f-\u2040\u2054\u2071\u207f\u2090-\u2094\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2183-\u2184\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2c6f\u2c71-\u2c7d\u2c80-\u2ce4\u2d00-\u2d25\u2d30-\u2d65\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3006\u3031-\u3035\u303b-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31b7\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fc3\ua000-\ua48c\ua500-\ua60c\ua610-\ua62b\ua640-\ua65f\ua662-\ua66e\ua67f-\ua697\ua717-\ua71f\ua722-\ua788\ua78b-\ua78c\ua7fb-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8d0-\ua8d9\ua900-\ua925\ua930-\ua946\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa50-\uaa59\uac00-\ud7a3\uf900-\ufa2d\ufa30-\ufa6a\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e-\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe33-\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]/g;
                var cp_Q = "Q".charCodeAt(0);
                var cp_A = "A".charCodeAt(0);
                var cp_Z = "Z".charCodeAt(0);
                var dist_Za = "a".charCodeAt(0) - cp_Z - 1;

                asciify = function ( text ) {
                    return text.replace(lettersThatJavaScriptDoesNotKnowAndQ, function ( m ) {
                        var c = m.charCodeAt(0);
                        var s = "";
                        var v;
                        while ( c > 0 ) {
                            v = (c % 51) + cp_A;
                            if ( v >= cp_Q ) {
                                v++;
                            }
                            if ( v > cp_Z ) {
                                v += dist_Za;
                            }
                            s = String.fromCharCode(v) + s;
                            c = c / 51 | 0;
                        }
                        return "Q" + s + "Q";
                    });
                };

                deasciify = function ( text ) {
                    return text.replace(/Q([A-PR-Za-z]{1,3})Q/g, function ( m, s ) {
                        var c = 0;
                        var v;
                        for ( var i = 0; i < s.length; i++ ) {
                            v = s.charCodeAt(i);
                            if ( v > cp_Z ) {
                                v -= dist_Za;
                            }
                            if ( v > cp_Q ) {
                                v--;
                            }
                            v -= cp_A;
                            c = (c * 51) + v;
                        }
                        return String.fromCharCode(c);
                    });
                };
            })();
        }

        this.makeHtml = function ( text ) {

            //
            // This is the main function. The order in which other sub-functions
            // are called here is critically important.
            // Link and image substitutions must occur *before*
            // _EscapeSpecialCharsWithinTagAttributes(), so that any asterisks ('*') or
            // underscores ('_') within the <a> and <img> tags are properly encoded.
            //

            // This condition checks for a recursive call to makeHtml on the same
            // converter instance from within a plugin hook. This scenario should be avoided.
            if ( g_urls ) {
                throw new Error("Recursive call to converter.makeHtml");
            }

            // Initialize the private state objects for this conversion run.
            g_urls = new SaveHash();
            g_titles = new SaveHash();
            g_html_blocks = [];
            g_list_level = 0;

            text = pluginHooks.preConversion(text);

            // attacklab: Replace ~ with ~T
            // This allows using tilde as an escape character to prevent issues with MD5 hashes.
            // The chosen character is arbitrary; any character not "magic" in Markdown will work.
            text = text.replace(/~/g, "~T");

            // attacklab: Replace $ with ~D
            // Regular expressions interpret '$' as a special character
            // when it appears in a replacement string.
            text = text.replace(/\$/g, "~D");

            // Standardize line endings across different operating systems.
            text = text.replace(/\r\n/g, "\n"); // Convert DOS line endings to Unix.
            text = text.replace(/\r/g, "\n");   // Convert Mac line endings to Unix.

            // Ensure the text begins and ends with at least two newlines:
            text = "\n\n" + text + "\n\n";

            // Convert all tab characters to spaces for consistent processing.
            text = _Detab(text);

            // Strip any lines that consist solely of spaces and tabs.
            // This simplifies subsequent regular expressions, allowing them to match
            // consecutive blank lines using `/\n+/` instead of a more complex pattern
            // like `/[ \t]*\n+/`.
            text = text.replace(/^[ \t]+$/mg, "");

            text = pluginHooks.postNormalization(text);

            // Convert block-level HTML blocks into hash entries to protect them.
            text = _HashHTMLBlocks(text);

            // Extract link definitions from the text and store them in internal hashes.
            text = _StripLinkDefinitions(text);

            text = _RunBlockGamut(text);

            text = _UnescapeSpecialChars(text);

            // attacklab: Restore dollar signs that were temporarily replaced.
            text = text.replace(/~D/g, "$$");

            // attacklab: Restore tildes that were temporarily replaced.
            text = text.replace(/~T/g, "~");

            text = pluginHooks.postConversion(text);

            // Clear the private state objects to prevent issues on subsequent calls.
            g_html_blocks = g_titles = g_urls = null;

            return text;
        };

        function _StripLinkDefinitions( text ) {
            //
            // This function strips link definitions from the input text
            // and stores their URLs and titles in hash references.
            //

            // Link definitions typically follow the format: `^[id]: url "optional title"`

            /*
            text = text.replace(/
                ^[ ]{0,3}\[([^\[\]]+)\]:  // id = $1  attacklab: g_tab_width - 1
                [ \t]*
                \n?                 // maybe *one* newline
                [ \t]*
                <?(\S+?)>?          // url = $2
                (?=\s|$)            // lookahead for whitespace instead of the lookbehind removed below
                [ \t]*
                \n?                 // maybe one newline
                [ \t]*
                (                   // (potential) title = $3
                    (\n*)           // any lines skipped = $4 attacklab: lookbehind removed
                    [ \t]+
                    ["(]
                    (.+?)           // title = $5
                    [")]
                    [ \t]*
                )?                  // title is optional
                (?:\n+|$)
            /gm, function(){...});
            */

            text = text.replace(/^[ ]{0,3}\[([^\[\]]+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
                function ( wholeMatch, m1, m2, m3, m4, m5 ) {
                    m1 = m1.toLowerCase(); // Link IDs are case-insensitive.
                    g_urls.set(m1, _EncodeAmpsAndAngles(m2));
                    if ( m4 ) {
                        // Oh, blank lines were found, so this isn't actually a title.
                        // We need to restore the parenthetical statement we previously captured.
                        return m3;
                    } else if ( m5 ) {
                        g_titles.set(m1, m5.replace(/"/g, "&quot;"));
                    }

                    // Completely remove the definition line from the text.
                    return "";
                }
            );

            return text;
        }

        function _HashHTMLBlocks( text ) {

            // This function "hashifies" HTML blocks:
            // We specifically target block-level HTML tags, such as headers,
            // lists, and tables. This is because we still want to wrap `<p>` tags
            // around "paragraphs" that are enclosed within non-block-level tags,
            // such as anchors, phrase emphasis, and spans. The list of block tags
            // we are looking for is hard-coded.
            var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"
            var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"

            // First, search for nested blocks. For example:
            //   <div>
            //     <div>
            //     Inner block tags must be indented.
            //     </div>
            //   </div>
            //
            // The outermost tags must start at the left margin for this match to occur,
            // and the inner nested divs must be indented.
            // This must be done before the next, more liberal match, because the
            // subsequent match would start at the first `<div>` and stop at the first `</div>`.

            // attacklab: This regular expression can be computationally expensive if it fails to match.

            /*
            text = text.replace(/
                (                       // save in $1
                    ^                   // start of line  (with /m)
                    <($block_tags_a)    // start tag = $2
                    \b                  // word break
                                        // attacklab: hack around khtml/pcre bug...
                    [^\r]*?\n           // any number of lines, minimally matching
                    </\2>               // the matching end tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by a newline
                )                       // attacklab: there are sentinel newlines at end of document
            /gm,function(){...});
            */
            text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, hashMatch);

            //
            // Now, match more liberally, simply from `\n<tag>` to `</tag>\n`
            //

            /*
            text = text.replace(/
                (                       // save in $1
                    ^                   // start of line  (with /m)
                    <($block_tags_b)    // start tag = $2
                    \b                  // word break
                                        // attacklab: hack around khtml/pcre bug...
                    [^\r]*?             // any number of lines, minimally matching
                    .*</\2>             // the matching end tag
                    [ \t]*              // trailing spaces/tabs
                    (?=\n+)             // followed by a newline
                )                       // attacklab: there are sentinel newlines at end of document
            /gm,function(){...}};
            */
            text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, hashMatch);

            // Special case specifically for <hr />. It was simpler to create a dedicated
            // special case than to further complicate the existing regular expressions.

            /*
            text = text.replace(/
                \n                  // Starting after a blank line
                [ ]{0,3}
                (                   // save in $1
                    (<(hr)          // start tag = $2
                        \b          // word break
                        ([^<>])*?
                    \/?>)           // the matching end tag
                    [ \t]*
                    (?=\n{2,})      // followed by a blank line
                )
            /g,hashMatch);
            */
            text = text.replace(/\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, hashMatch);

            // Special case for standalone HTML comments:

            /*
            text = text.replace(/
                \n\n                                            // Starting after a blank line
                [ ]{0,3}                                        // attacklab: g_tab_width - 1
                (                                               // save in $1
                    <!
                    (--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)   // see http://www.w3.org/TR/html-markup/syntax.html#comments and http://meta.stackexchange.com/q/95256
                    >
                    [ \t]*
                    (?=\n{2,})                                  // followed by a blank line
                )
            /g,hashMatch);
            */
            text = text.replace(/\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g, hashMatch);

            // Handle PHP and ASP-style processor instructions (e.g., <?...?> and <%...%>).

            /*
            text = text.replace(/
                (?:
                    \n\n            // Starting after a blank line
                )
                (                   // save in $1
                    [ ]{0,3}        // attacklab: g_tab_width - 1
                    (?:
                        <([?%])     // $2
                        [^\r]*?
                        \2>
                    )
                    [ \t]*
                    (?=\n{2,})      // followed by a blank line
                )
            /g,hashMatch);
            */
            text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, hashMatch);

            return text;
        }

        function hashBlock( text ) {
            text = text.replace(/(^\n+|\n+$)/g, "");
            // Replace the element's text content with a marker (e.g., "~KxK" where x is its key).
            return "\n\n~K" + (g_html_blocks.push(text) - 1) + "K\n\n";
        }

        function hashMatch( wholeMatch, m1 ) {
            return hashBlock(m1);
        }

        var blockGamutHookCallback = function ( t ) {
            return _RunBlockGamut(t);
        };

        function _RunBlockGamut( text, doNotUnhash ) {
            //
            // These are all the transformations that create block-level
            // tags such as paragraphs, headers, and list items.
            //

            text = pluginHooks.preBlockGamut(text, blockGamutHookCallback);

            text = _DoHeaders(text);

            // Execute Horizontal Rules processing: