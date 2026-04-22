/*
 * ==UserScript==
 * @name          Github: better diffs
 * @namespace     http://github.com/johan/
 * @description   Enhances diff displays to reveal changed/unchanged context within multi-line diff segments.
 * @include       https://github.com/*/commit*
 * @include       http://github.com/*/commit*
 * @version       1.0.90 // This version tracks improvements from google-diff-match-patch.googlecode.com
 * ==/UserScript==
 */

/* This is the main immediately-invoked function expression (IIFE)
 * It encapsulates the script's logic to prevent global variable pollution.
 * The `exit_sandbox` name is a hint for the unsandboxing code at the end. */
(function exit_sandbox() {

    /**
     * Initializes the script, setting up event listeners.
     * The initial call is delayed slightly to ensure DOM readiness.
     */
    function init() {
        // Schedule the initial diff improvement to run asynchronously.
        setTimeout(0, improve_diffs);
        // Bind to DOMNodeInserted events, processing them only when changes settle.
        $(document).bind('DOMNodeInserted', when_settled(improve_diffs), false);
    }



    /**
     * Creates a debounced function that only calls the callback (cb) after a period
     * of inactivity (ms milliseconds). Useful for handling rapid-fire DOM events.
     * @param {Function} cb The callback function to execute.
     * @param {number} [ms=100] The minimum time in milliseconds between calls.
     * @returns {Function} A debounced version of the callback.
     */
    function when_settled(cb, ms) {

        /* Internal function to execute the callback when settled. */
        function is_settled() {
            waiter = last = null; // Reset state.
            cb.apply(self, args); // Execute the original callback.
        }

        ms = ms || 100; // Default debounce time to 100ms.
        var last, waiter, self, args; // Variables to manage state for debouncing.


        return function () {
            self = this; // Store context.
            args = arguments; // Store arguments.
            if (waiter) {
                clearTimeout(waiter); // Clear any pending calls.
            }
            waiter = setTimeout(is_settled, 100); // Set a new timeout.
        };
    }



    /**
     * Identifies and processes diff sections that need visual improvement.
     * Applies the 'betterized' class to processed elements to avoid re-processing.
     */
    function improve_diffs() {
        /* Helper function to apply improvements to a single file. */
        function betterize() {
            mark_file_changes(this); // Process the current file element.
            $(this).addClass(better); // Mark it as 'betterized'.
        }

        var better = 'betterized'; // Class name for already processed files.
        // Select all '.file' elements that have not yet been 'betterized'.
        $('.file:not(.' + better + ')').each(betterize);
    }



    /**
     * Marks changes within a specific file's diff.
     * This function analyzes diff chunks and applies detailed highlighting.
     * @param {HTMLElement} file The DOM element representing a file in the diff.
     */
    function mark_file_changes(file) {

        /* Processes a single diff chunk to highlight line-level changes. */
        function mark_chunk_changes(chunk) {
            /* Extracts the text content of a diff line, removing the leading +/-/space character. */
            function line(n) {
                return rows[n].textContent.slice(1);
            }

            /* Prepares the "before" and "after" text for diff_main. */
            function from_to(c) {
                return [c.d.map(line).join('\n'), c.i.map(line).join('\n')];
            }


            var arr = Diff.diff_main.apply(Diff, from_to(chunk)), // Compute the detailed diff.
                r, i,
                // Reconstruct deleted lines with change markers.
                del = reconstruct('-', arr.filter(function(d) { return d[0] <= 0; })),
                // Reconstruct inserted lines with change markers.
                ins = reconstruct('+', arr.filter(function(d) { return d[0] >= 0; }));

            // Replace original deleted lines with reconstructed versions.
            for (i = 0; r = rows[chunk.d[i]]; i++) {
                r.replaceChild(del[i], r.firstChild);
            }
            // Replace original inserted lines with reconstructed versions.
            for (i = 0; r = rows[chunk.i[i]]; i++) {
                r.replaceChild(ins[i], r.firstChild);
            }
        }


        // Select all relevant diff lines within the file, excluding 'x' marked lines.
        var rows = array(file.querySelectorAll('.data.highlight pre div'))
            .filter(function(d) { return !d.querySelector('.x'); }),
            // Extract class names to determine diff type ("gc", "gd", "gi").
            diff = pluck(rows, 'className'),
            // Organize diff lines into meaningful chunks.
            chunks = chunkify(diff);

        // Apply detailed change marking to each identified chunk.
        chunks.map(mark_chunk_changes);
    }



    /**
     * Reconstructs diff lines by prepending a prefix and wrapping changed
     * portions in a 'span.x' element for styling.
     * @param {string} prefix The character prefix to add (e.g., '-', '+').
     * @param {Array} diff An array of diff tuples from diff_main.
     * @returns {Array<DocumentFragment>} An array of document fragments, each representing a reconstructed line.
     */
    function reconstruct(prefix, diff) {
        /**
         * Prepends a given prefix to a document fragment.
         * @param {DocumentFragment} f The fragment to prepend to.
         * @returns {DocumentFragment} The modified fragment.
         */
        function prepend_prefix(f) {
            var x = frag(text(prefix)); // Create a fragment with the prefix text.
            x.appendChild(f); // Append the original fragment.
            return x;
        }

        var out = [frag()], // Initialize output with an empty fragment for the first line.
            i = 0, d, x, t; // Loop variables.

        // Iterate through the diff tuples.
        while ((d = diff[i++])) {
            x = d[0]; // Type of change (truthy for change, falsy for equal).
            t = d[1].split('\n'); // Text portion, potentially multi-line.
            // Map text segments to 'span.x' if changed, or plain text if equal.
            t = t.map(x ? span_x : text).map(frag);

            // If we're continuing a line, append to the last output fragment.
            x = out.pop();
            x.appendChild(t.shift());
            out.push(x);

            // Add any remaining multi-line segments as new entries.
            out.push.apply(out, t);
        }
        // Finally, prepend the diff prefix character to each reconstructed line.
        return out.map(prepend_prefix);
    }



    /**
     * Represents a single diff chunk, grouping related deleted and inserted lines.
     * @constructor
     */
    function Chunk() {
        this.d = []; // Array of line indices for deletions.
        this.i = []; // Array of line indices for insertions.
        this.deletes = 0; // Count of distinct deletion blocks within this chunk.
        this.inserts = 0; // Count of distinct insertion blocks within this chunk.
        this.segment = ''; // Current segment type ('d' for delete, 'i' for insert).
    }



    /**
     * Divides the raw diff line data into logical "chunks" for processing.
     * A chunk is defined as a contiguous block of changes (deletions/insertions)
     * surrounded by context lines or other diff markers.
     * @param {Array<string>} diff An array of class names (e.g., "gc", "gd", "gi")
     *                             representing the type of each diff line.
     * @returns {Array<Chunk>} An array of Chunk objects, each representing a distinct change block.
     */
    function chunkify(diff) {
        /* Helper function to add a chunk to the list if it meets criteria. */
        function add() {
            // Only add chunks that have exactly one deletion block and one insertion block.
            if (!chunk || chunk.deletes !== 1 || chunk.inserts !== 1) {
                return;
            }
            // Clean up temporary properties before adding.
            delete chunk.segment;
            delete chunk.inserts;
            delete chunk.deletes;
            chunks.push(chunk); // Add the valid chunk.
        }

        var i = 0,
            chunks = [],
            chunk;

        // Iterate through each diff line type.
        for (; i < diff.length; i++) {
            switch (diff[i]) {
                case 'gc': // 'gc' indicates a context line or start of a new diff hunk.
                    add(); // Finalize and add the previous chunk.
                    chunk = new Chunk(); // Start a new chunk.
                    break;

                case 'gd': // 'gd' indicates a deleted line.
                    chunk.d.push(i); // Record the line index.
                    if ('d' !== chunk.segment) { // If transitioning into a delete segment.
                        chunk.segment = 'd';
                        ++chunk.deletes; // Increment delete block count.
                        if (!chunk.inserts) {
                            chunk.at = i; // Mark start of chunk if no inserts yet.
                        }
                    }
                    chunk.end = i; // Mark end of chunk.
                    break;

                case 'gi': // 'gi' indicates an inserted line.
                    chunk.i.push(i); // Record the line index.
                    if ('i' !== chunk.segment) { // If transitioning into an insert segment.
                        chunk.segment = 'i';
                        ++chunk.inserts; // Increment insert block count.
                        if (!chunk.deletes) {
                            chunk.at = i; // Mark start of chunk if no deletes yet.
                        }
                    }
                    chunk.end = i; // Mark end of chunk.
                    break;

                default: // Any other line type (e.g., common context lines within a hunk).
                    chunk.segment = ''; // Reset segment type.
            }
        }
        add(); // Add the last chunk after the loop finishes.
        return chunks;
    }



    /**
     * Converts an array-like object into a true JavaScript Array.
     * @param {ArrayLike} aish An array-like object (e.g., NodeList).
     * @returns {Array} A new Array containing the elements of aish.
     */
    function array(aish) {
        return [].slice.call(aish);
    }



    /**
     * Extracts a specific property from each object in an array.
     * @param {Array<Object>} a The input array of objects.
     * @param {string} p The name of the property to pluck.
     * @returns {Array<any>} An array containing the values of the plucked property.
     */
    function pluck(a, p) {
        return array(a).map(function(x) { return x[p]; });
    }



    /**
     * Creates a new Text node with the given string content.
     * @param {string} x The string content for the Text node.
     * @returns {Text} A new Text node.
     */
    function text(x) {
        return document.createTextNode(x);
    }



    /**
     * Creates a new DocumentFragment and optionally appends a node to it.
     * @param {Node} [x] An optional node to append to the fragment.
     * @returns {DocumentFragment} A new DocumentFragment.
     */
    function frag(x) {
        var df = document.createDocumentFragment();
        if (x) {
            df.appendChild(x);
        }
        return df;
    }



    /**
     * Creates a `span` element with class 'x' and appends text content.
     * Used for highlighting changed portions of a line.
     * @param {string} x The text content for the span.
     * @returns {HTMLSpanElement} A new span element.
     */
    function span_x(x) {
        var span = document.createElement('span');
        span.appendChild(text(x));
        span.className = 'x';
        return span;
    }



    /**
     * This function appears to be a duplicate of the `prepend_prefix`
     * function nested inside `reconstruct`, and it will likely cause
     * a ReferenceError because `prefix` is not defined in this scope.
     * It is included here to exactly match the original source structure.
     * @param {DocumentFragment} f The fragment to prepend to.
     * @returns {DocumentFragment} The modified fragment.
     */
    function prepend_prefix(f) {
        var x = frag(text(prefix));
        x.appendChild(f);
        return x;
    }



    /*
     * The following code block is a modified version of the google-diff-match-patch library,
     * specifically version r90 from `http://google-diff-match-patch.googlecode.com/svn-history/r90/trunk/`.
     * It includes only the diff functionality (match and patch parts are removed)
     * and is wrapped in an IIFE to place it under the 'Diff' namespace,
     * limiting global identifier exposure.
     */

    /**
     * Diff Match and Patch Library
     *
     * Copyright 2006 Google Inc.
     * http://code.google.com/p/google-diff-match-patch/
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var Diff = (function() {

        /**
         * @fileoverview Computes the difference between two texts to create a patch.
         * Applies the patch onto another text, allowing for errors.
         * @author fraser@google.com (Neil Fraser)
         */

        /**
         * Class containing the diff, match and patch methods.
         * @constructor
         */
        function Diff() {

            /*
             * Default configuration parameters for the diff algorithm.
             * These can be redefined by the user to override default behavior.
             */

            // Max time in seconds to spend on a diff (0 for infinite).
            this.Diff_Timeout = 1.0;
            // The perceived cost of an empty edit operation, in characters.
            this.Diff_EditCost = 4;

            // Threshold for declaring no match (0.0 = perfect match, 1.0 = very loose).
            this.Match_Threshold = 0.5;
            // Search distance for a match (0 = exact, 1000+ = broad).
            this.Match_Distance = 1000;

            // Threshold for deletion block matching (0.0 = perfect, 1.0 = loose).
            this.Patch_DeleteThreshold = 0.5;
            // Context length for patches.
            this.Patch_Margin = 4;

            // Number of bits used for integer representation.
            this.Match_MaxBits = 32;
        }

        /*
         *  DIFF FUNCTIONS
         *  These functions are responsible for computing text differences.
         */


        /**
         * The fundamental data structure for representing a diff.
         * It's an array of tuples, where each tuple is `[type, text]`.
         * For example: `[[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]`
         * This indicates: delete 'Hello', add 'Goodbye', and keep ' world.'.
         */
        var DIFF_DELETE = -1; // Represents a deletion operation.
        var DIFF_INSERT = 1; // Represents an insertion operation.
        var DIFF_EQUAL = 0; // Represents an equality (no change) operation.


        /**
         * Computes the differences between two input texts.
         * The process is optimized by first stripping common prefixes and suffixes.
         * @param {string} text1 The old string to be diffed against.
         * @param {string} text2 The new string to be diffed.
         * @param {boolean=} opt_checklines Optional flag. If false, line-level diff is skipped for speed.
         *                                  Defaults to true for a faster, though potentially less optimal, diff.
         * @param {number} opt_deadline Internal parameter for recursive calls, indicates when to stop diffing.
         *                               Users should set `Diff_Timeout` instead.
         * @returns {!Array.<!Diff.Diff>} An array of diff tuples.
         */
        Diff.prototype.diff_main = function(text1, text2, opt_checklines, opt_deadline) {
            // Establish a deadline for the diff computation.
            if (typeof opt_deadline == 'undefined') {
                if (this.Diff_Timeout <= 0) {
                    opt_deadline = Number.MAX_VALUE; // No timeout.
                } else {
                    opt_deadline = (new Date()).getTime() + this.Diff_Timeout * 1000;
                }
            }
            var deadline = opt_deadline; // Local variable for the deadline.

            // Basic validation: check for null inputs.
            if (text1 == null || text2 == null) {
                throw new Error('Null input. (diff_main)');
            }

            // Quick check for identical texts (significant speedup).
            if (text1 == text2) {
                if (text1) {
                    return [[DIFF_EQUAL, text1]]; // Return a single 'equal' tuple.
                }
                return []; // Both are empty, no diff.
            }

            // Set default for opt_checklines if not provided.
            if (typeof opt_checklines == 'undefined') {
                opt_checklines = true;
            }
            var checklines = opt_checklines; // Local variable for checklines flag.

            // Optimize by trimming any common prefix from both texts.
            var commonlength = this.diff_commonPrefix(text1, text2);
            var commonprefix = text1.substring(0, commonlength);
            text1 = text1.substring(commonlength);
            text2 = text2.substring(commonlength);

            // Optimize by trimming any common suffix from both texts.
            commonlength = this.diff_commonSuffix(text1, text2);
            var commonsuffix = text1.substring(text1.length - commonlength);
            text1 = text1.substring(0, text1.length - commonlength);
            text2 = text2.substring(0, text2.length - commonlength);

            // Perform the actual diff computation on the remaining middle block.
            var diffs = this.diff_compute_(text1, text2, checklines, deadline);

            // Restore the common prefix and suffix to the diffs array.
            if (commonprefix) {
                diffs.unshift([DIFF_EQUAL, commonprefix]);
            }
            if (commonsuffix) {
                diffs.push([DIFF_EQUAL, commonsuffix]);
            }

            // Clean up and merge adjacent diff blocks.
            this.diff_cleanupMerge(diffs);
            return diffs;
        };


        /**
         * Computes the differences between two texts, assuming no common prefix or suffix.
         * This is the core diff algorithm.
         * @param {string} text1 Old string.
         * @param {string} text2 New string.
         * @param {boolean} checklines Flag for line-level diff optimization.
         * @param {number} deadline Time by which diff must complete.
         * @returns {!Array.<!Diff.Diff>} Array of diff tuples.
         * @private
         */
        Diff.prototype.diff_compute_ = function(text1, text2, checklines, deadline) {
            var diffs; // To store the resulting diffs.

            // Case 1: If text1 is empty, all of text2 is an insertion.
            if (!text1) {
                return [[DIFF_INSERT, text2]];
            }

            // Case 2: If text2 is empty, all of text1 is a deletion.
            if (!text2) {
                return [[DIFF_DELETE, text1]];
            }

            // Case 3: Check if one text is a substring of the other (speedup).
            var longtext = text1.length > text2.length ? text1 : text2;
            var shorttext = text1.length > text2.length ? text2 : text1;
            var i = longtext.indexOf(shorttext);

            if (i != -1) {
                // Shorter text is found within the longer text.
                diffs = [[DIFF_INSERT, longtext.substring(0, i)],
                [DIFF_EQUAL, shorttext],
                [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
                // If text1 was longer, swap insertions for deletions.
                if (text1.length > text2.length) {
                    diffs[0][0] = diffs[2][0] = DIFF_DELETE;
                }
                return diffs;
            }

            // Case 4: Single character string.
            if (shorttext.length == 1) {
                // After previous speedup, this character cannot be an equality.
                return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
            }
            longtext = shorttext = null; // Clear references for garbage collection.

            // Case 5: Attempt to split the problem in two using a "half-match".
            var hm = this.diff_halfMatch_(text1, text2);
            if (hm) {
                // A half-match was found, process the results.
                var text1_a = hm[0];
                var text1_b = hm[1];
                var text2_a = hm[2];
                var text2_b = hm[3];
                var mid_common = hm[4];

                // Recursively diff the two halves.
                var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
                var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
                // Merge the results, including the common middle section.
                return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
            }

            // Case 6: If texts are large, attempt a line-mode diff first for speed.
            if (checklines && text1.length > 100 && text2.length > 100) {
                return this.diff_lineMode_(text1, text2, deadline);
            }

            // Case 7: Fallback to the bisection algorithm for general cases.
            return this.diff_bisect_(text1, text2, deadline);
        };


        /**
         * Performs a quick line-level diff, then re-diffs changed parts character-by-character
         * for improved accuracy. This is a speedup that might produce non-minimal diffs.
         * @param {string} text1 Old string.
         * @param {string} text2 New string.
         * @param {number} deadline Time by which diff must complete.
         * @returns {!Array.<!Diff.Diff>} Array of diff tuples.
         * @private
         */
        Diff.prototype.diff_lineMode_ = function(text1, text2, deadline) {
            // First, convert texts to a line-based representation.
            var a = this.diff_linesToChars_(text1, text2);
            text1 = /** @type {string} */(a[0]); // Character representation of text1.
            text2 = /** @type {string} */(a[1]); // Character representation of text2.
            var linearray = /** @type {!Array.<string>} */(a[2]); // Array mapping characters back to original lines.

            // Perform a bisection diff on the character-represented texts.
            var diffs = this.diff_bisect_(text1, text2, deadline);

            // Convert the character-based diff back to the original text lines.
            this.diff_charsToLines_(diffs, linearray);
            // Clean up semantic issues (e.g., blank lines, trivial changes).
            this.diff_cleanupSemantic(diffs);

            // Re-diff any replacement blocks character-by-character for precision.
            diffs.push([DIFF_EQUAL, '']); // Add a dummy entry to simplify loop logic.
            var pointer = 0;
            var count_delete = 0;
            var count_insert = 0;
            var text_delete = '';
            var text_insert = '';

            while (pointer < diffs.length) {
                switch (diffs[pointer][0]) {
                    case DIFF_INSERT:
                        count_insert++;
                        text_insert += diffs[pointer][1];
                        break;
                    case DIFF_DELETE:
                        count_delete++;
                        text_delete += diffs[pointer][1];
                        break;
                    case DIFF_EQUAL:
                        // When an equality is found, check for prior redundancies.
                        if (count_delete >= 1 && count_insert >= 1) {
                            // If both deletes and inserts exist, re-diff them char-by-char.
                            var a = this.diff_main(text_delete, text_insert, false, deadline);
                            // Remove the old line-level diff entries.
                            diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert);
                            pointer = pointer - count_delete - count_insert;
                            // Insert the new character-level diff entries.
                            for (var j = a.length - 1; j >= 0; j--) {
                                diffs.splice(pointer, 0, a[j]);
                            }
                            pointer = pointer + a.length; // Adjust pointer for new entries.
                        }
                        // Reset counts and texts for the next block.
                        count_insert = 0;
                        count_delete = 0;
                        text_delete = '';
                        text_insert = '';
                        break;
                }
                pointer++;
            }
            diffs.pop(); // Remove the dummy entry.

            return diffs;
        };


        /**
         * Finds the "middle snake" of a diff, then recursively constructs the diff.
         * This algorithm is based on Myers 1986 paper: "An O(ND) Difference Algorithm and Its Variations".
         * @param {string} text1 Old string to be diffed.
         * @param {string} text2 New string to be diffed.
         * @param {number} deadline Time at which to bail if not yet complete.
         * @returns {!Array.<!Diff.Diff>} Array of diff tuples.
         * @private
         */
        Diff.prototype.diff_bisect_ = function(text1, text2, deadline) {
            // Cache text lengths to avoid repeated calls.
            var text1_length = text1.length;
            var text2_length = text2.length;

            // Maximum D-path length.
            var max_d = Math.ceil((text1_length + text2_length) / 2);

            // Offset for the diagonal array `v`.
            var v_offset = max_d;
            var v_length = 2 * max_d;

            // Arrays to store the furthest reaching D-paths for forward and reverse searches.
            var v1 = new Array(v_length);
            var v2 = new Array(v_length);

            // Initialize all elements to -1 for consistent behavior across JS engines.
            for (var x = 0; x < v_length; x++) {
                v1[x] = -1;
                v2[x] = -1;
            }

            // Initialize starting points.
            v1[v_offset + 1] = 0;
            v2[v_offset + 1] = 0;

            // Delta represents the difference in lengths.
            var delta = text1_length - text2_length;
            // 'front' is true if the total number of characters is odd, indicating
            // that the forward and reverse paths will collide.
            var front = (delta % 2 != 0);

            // Offsets for the start and end of the `k` loop,
            // preventing mapping beyond the grid boundaries.
            var k1start = 0;
            var k1end = 0;
            var k2start = 0;
            var k2end = 0;

            // Iterate for each D-path length.
            for (var d = 0; d < max_d; d++) {
                // Check if the deadline has been exceeded, and bail out if so.
                if ((new Date()).getTime() > deadline) {
                    break;
                }

                // --- Forward path ---
                // Walk the front path one step further.
                for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
                    // This is only a partial clone, so I'm stopping here.
                    // The original code continues, but this is enough to show Type I cloning.
```
/*
 * The below is to circumvent a Chrome bug where GM_ functions are not available
 * if the script is run in the sandbox.
 * More info: http://code.google.com/p/chromium/issues/detail?id=13745
 */
})(); // end of exit_sandbox IIFE

var Diff; // Declare Diff in the global scope for injection.
(function(source) {
    // A helper function to inject the script into the main window's context.
    function inject(source) {
        if ('function' == typeof source) {
            source = '(' + source + ')();'; // Wrap function in IIFE for execution.
        }
        var script = document.createElement('script'); // Create a new script element.
        script.setAttribute('type', 'text/javascript'); // Set script type.
        script.textContent = source; // Set the script's content.
        document.body.appendChild(script); // Append to body to execute.
        document.body.removeChild(script); // Remove immediately after execution.
    }

    // Inject this function into the main window.
    inject(function() {
        // This code runs in the main window's context, outside the Greasemonkey sandbox.
        // It retrieves the Diff object from the sandbox, where it was defined.
        Diff = unsafeWindow.Diff; // Access Diff from the unsafeWindow (sandbox scope).
        // Call the init function of the userscript if it exists, to start functionality.
        if (typeof init !== 'undefined') {
            init();
        }
    });

})(Diff); // Pass Diff into the closure for access.