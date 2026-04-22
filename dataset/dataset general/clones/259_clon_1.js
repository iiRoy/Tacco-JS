/*
 * This JavaScript file contains an implementation of a bin packing algorithm.
 * It's a modified version, originally derived from work by Jake Gordon and contributors.
 *
 * The primary purpose is to arrange rectangular items (frames) into a larger rectangle
 * (a "bin" or "atlas") as efficiently as possible, minimizing the overall size of the bin.
 *
 * Copyright details:
 * Original code by Jake Gordon and contributors (2011, 2012, 2013)
 * Available at: https://github.com/jakesgordon/bin-packing
 * This version was modified by Sebastian Nette in 2014.
 *
 * Licensing:
 * This code is released under the MIT License.
 * For more details, see: http://www.opensource.org/licenses/mit-license.php
 *
 * Expert Tip: Bin packing is an NP-hard problem, so heuristic algorithms are commonly used.
 * This implementation likely uses a tree-based approach, similar to the "maximal rectangles"
 * or "skyline" algorithms, to find placement for blocks.
 */

define(
    [],
    function() {

        // Define the BinPacker class, extending a base Class object (assumed to be available).
        var BinPacker = Class.extend(
            {

                // Constructor for the BinPacker instance.
                // In this implementation, the init function is empty, as setup happens in 'pack'.
                init: function() {
                },


                // The main packing method. It takes an array of frames and options,
                // then attempts to fit them into a texture atlas.
                pack: function(
                    frames,
                    options
                ) {

                    // Initialize instance properties.
                    this.frames  = {};
                    this.options = options;
                    this.width   = 0;
                    this.height  = 0;

                    // Adjust border padding to account for inner padding.
                    this.options.padding.border -= this.options.padding.inner;
                    // Ensure border padding doesn't become negative.
                    if (
                        this.options.padding.border < 0
                    ) {
                        this.options.padding.border = 0;
                    }


                    // If powerOfTwo option is enabled, ensure max size dimensions are powers of two.
                    if (
                        this.options.powerOfTwo
                    ) {
                        this.options.maxsize.w = this.powerOfTwo(
                                                     this.options.maxsize.w
                                                 ) || 2;
                        this.options.maxsize.h = this.powerOfTwo(
                                                     this.options.maxsize.h
                                                 ) || 2;
                    }

                    // If a fixed width is specified, override the max width.
                    if (
                        this.options.fixed.w >= 1
                    ) {
                        this.options.maxsize.w = this.options.fixed.w;
                    }

                    // If a fixed height is specified, override the max height.
                    if (
                        this.options.fixed.h >= 1
                    ) {
                        this.options.maxsize.h = this.options.fixed.h;
                    }


                    // Convert frames into blocks and sort them.
                    // The sorting strategy uses 'maxside' to prioritize larger dimensions.
                    var blocks = this.toBlocks(
                                     frames
                                 ).sort(
                                     function(
                                         a,
                                         b
                                     ) {
                                         return this.maxside(
                                             a,
                                             b
                                         );
                                     }.bind(this)
                                 );

                    // Attempt to fit all blocks using the packing algorithm.
                    this.fit(
                        blocks
                    );

                    // Iterate through the packed blocks to record their positions and dimensions.
                    for (
                        var n = 0;
                        n < blocks.length;
                        n++
                    ) {
                        var block = blocks[n]; // Get the current block.
                        // Check if the block was successfully fitted.
                        if (
                            block.fit
                        ) {
                            // Store the frame's final position and size, including padding.
                            this.frames[block.frame] = {
                                x:       block.fit.x + this.options.padding.border + this.options.padding.inner,
                                y:       block.fit.y + this.options.padding.border + this.options.padding.inner,
                                w:       block.fit.w,
                                h:       block.fit.h,
                                trimmed: block.t
                            };
                            // Update the overall width and height of the packed atlas.
                            this.width               = Math.max(
                                this.width,
                                this.frames[block.frame].x + block.w
                            );
                            this.height              = Math.max(
                                this.height,
                                this.frames[block.frame].y + block.h
                            );
                        } else {
                            // If a block couldn't be fitted, mark its frame as null.
                            this.frames[block.frame] = null;
                        }
                    }

                    // Final adjustments to the atlas dimensions, accounting for border and shape padding.
                    this.width  += 2 * this.options.padding.border - this.options.padding.shape;
                    this.height += 2 * this.options.padding.border - this.options.padding.shape;


                    // If powerOfTwo is enabled, ensure final dimensions are powers of two.
                    if (
                        this.options.powerOfTwo
                    ) {
                        this.width  = this.powerOfTwo(
                                          this.width
                                      ) || 2;
                        this.height = this.powerOfTwo(
                                          this.height
                                      ) || 2;
                    }

                    // If squared option is enabled, make the atlas square (max of width/height).
                    if (
                        this.options.squared
                    ) {
                        if (
                            this.height > this.width
                        ) {
                            this.width = this.height;
                        } else {
                            this.height = this.width;
                        }
                    }

                    // Apply fixed width/height if specified, overriding calculated dimensions.
                    if (
                        this.options.fixed.w >= 1
                    ) {
                        this.width = this.options.fixed.w;
                    }
                    if (
                        this.options.fixed.h >= 1
                    ) {
                        this.height = this.options.fixed.h;
                    }

                    // Return the packed frames, final width, and height.
                    return {
                        frames: this.frames,
                        width:  this.width,
                        height: this.height
                    };
                },


                // Helper function to find the next power of two greater than or equal to n.
                powerOfTwo: function(
                    n
                ) {
                    var i = 0,
                        s = 0;
                    while (
                        s === 0
                    ) {
                        if (
                            n <= Math.pow(
                                2,
                                i
                            )
                        ) {
                            s = Math.pow(
                                2,
                                i
                            );
                        }
                        i++;
                    }
                    return s;
                },


                // Converts input frames into an array of blocks suitable for packing.
                // It also applies padding and trimming logic.
                toBlocks: function(
                    frames
                ) {
                    var blocks = []; // Initialize an empty array to hold the blocks.
                    // Iterate over each frame using Underscore.js's `each` function.
                    _.each(
                        frames,
                        function(
                            frame,
                            index
                        ) {
                            // Determine block width, considering trimming and padding.
                            var block = {
                                frame: index, // Store original frame index for reference.
                                w:     (
                                           (this.options.trim && frame.trimmedSize.trimmed) ? frame.trimmedSize.width : frame.width
                                       ) + this.options.padding.shape + 2 * this.options.padding.inner,
                                h:     (
                                           (this.options.trim && frame.trimmedSize.trimmed) ? frame.trimmedSize.height : frame.height
                                       ) + this.options.padding.shape + 2 * this.options.padding.inner,
                                t:     (this.options.trim && frame.trimmedSize.trimmed), // Boolean indicating if trimmed.
                                num:   1 // A simple counter, perhaps for future use (e.g., multiple copies).
                            };
                            // Only add the block if it fits within the maximum allowed dimensions.
                            if (
                                (block.w + 2 * this.options.padding.border) <= this.options.maxsize.w &&
                                (block.h + 2 * this.options.padding.border) <= this.options.maxsize.h
                            ) {
                                blocks.push(
                                    block
                                );
                            }
                        }.bind(this)
                    ); // Bind 'this' to the current BinPacker instance.
                    return blocks; // Return the processed array of blocks.
                },


                // Comparison function for sorting by width (descending).
                w: function(
                    a,
                    b
                ) {
                    return b.w - a.w;
                },

                // Comparison function for sorting by height (descending).
                h: function(
                    a,
                    b
                ) {
                    return b.h - a.h;
                },

                // Comparison function for sorting by the maximum side (descending).
                max: function(
                    a,
                    b
                ) {
                    return Math.max(
                        b.w,
                        b.h
                    ) - Math.max(
                        a.w,
                        a.h
                    );
                },

                // Comparison function for sorting by the minimum side (descending).
                min: function(
                    a,
                    b
                ) {
                    return Math.min(
                        b.w,
                        b.h
                    ) - Math.min(
                        a.w,
                        a.h
                    );
                },

                // Primary sorting function for blocks, using a specific criteria order.
                maxside: function(
                    a,
                    b
                ) {
                    return this.msort(
                        a,
                        b,
                        ["max", "min", "h", "w"]
                    );
                },

                // Multi-criteria sorting function.
                // It iterates through criteria and returns the first non-zero difference.
                msort: function(
                    a,
                    b,
                    criteria
                ) {
                    var diff,
                        n;
                    for (
                        n = 0;
                        n < criteria.length;
                        n++
                    ) {
                        if (
                            criteria[n] === "max"
                        ) {
                            diff = this.max(
                                a,
                                b
                            );
                        } else if (
                            criteria[n] === "min"
                        ) {
                            diff = this.min(
                                a,
                                b
                            );
                        } else if (
                            criteria[n] === "h"
                        ) {
                            diff = this.h(
                                a,
                                b
                            );
                        } else if (
                            criteria[n] === "w"
                        ) {
                            diff = this.w(
                                a,
                                b
                            );
                        }
                        if (
                            diff != 0
                        ) {
                            return diff;
                        }
                    }
                    return 0; // If all criteria result in equality, return 0.
                },


                // Attempts to fit all blocks into the current packing space.
                fit: function(
                    blocks
                ) {
                    var n,
                        node,
                        block,
                        len = blocks.length;
                    // Initialize root dimensions based on the first block, if available.
                    var w   = len > 0 ? blocks[0].w : 0;
                    var h   = len > 0 ? blocks[0].h : 0;
                    this.root = {
                        x: 0,
                        y: 0,
                        w: w,
                        h: h
                    }; // The initial packing area.

                    // Iterate through each block to find a suitable position.
                    for (
                        n = 0;
                        n < len;
                        n++
                    ) {
                        block = blocks[n];
                        // Try to find a node in the existing tree where the block can fit.
                        if (
                            node = this.findNode(
                                this.root,
                                block.w,
                                block.h
                            )
                        ) {
                            block.fit = this.splitNode(
                                node,
                                block.w,
                                block.h
                            ); // Split the node to place the block.
                        } else {
                            block.fit = this.growNode(
                                block.w,
                                block.h
                            ); // If no space, grow the packing area.
                        }
                    }
                },


                // Recursively searches for an available node in the packing tree.
                findNode: function(
                    root,
                    w,
                    h
                ) {
                    // If the current node is used, check its children (right and down).
                    if (
                        root.used
                    ) {
                        return this.findNode(
                                   root.right,
                                   w,
                                   h
                               ) || this.findNode(
                                   root.down,
                                   w,
                                   h
                               );
                    }
                    // If the node is not used and the block fits, return this node.
                    else if (
                        (w <= root.w) && (h <= root.h)
                    ) {
                        return root;
                    }
                    // Otherwise, no suitable node found here.
                    else {
                        return null;
                    }
                },


                // Splits a node into two new nodes (down and right) after placing a block.
                splitNode: function(
                    node,
                    w,
                    h
                ) {
                    node.used  = true; // Mark the current node as used.
                    // Create a new node for the remaining space below the placed block.
                    node.down  = {
                        x: node.x,
                        y: node.y + h,
                        w: node.w,
                        h: node.h - h
                    };
                    // Create a new node for the remaining space to the right of the placed block.
                    node.right = {
                        x: node.x + w,
                        y: node.y,
                        w: node.w - w,
                        h: h
                    };
                    return node; // Return the original node (now representing the placed block).
                },


                // Grows the packing area (root node) to accommodate a new block.
                growNode: function(
                    w,
                    h
                ) {
                    // Determine if the packing area can grow downwards or to the right.
                    var canGrowDown  = (w <= this.root.w);
                    var canGrowRight = (h <= this.root.h);

                    // Decide which direction to grow based on current dimensions and new block.
                    var shouldGrowRight = canGrowRight && (this.root.h >= (this.root.w + w));
                    var shouldGrowDown  = canGrowDown  && (this.root.w >= (this.root.h + h));

                    // --- Start of "dirty" powerOfTwo and maxsize specific logic ---
                    // This section contains specific heuristics for power-of-two textures and max size limits.
                    if (
                        this.options.powerOfTwo
                    ) {
                        var pot = this.powerOfTwo(
                                      this.root.w
                                  ) + 2 * this.options.padding.border - this.options.padding.shape;
                        if (
                            (this.root.w + w + 2 * this.options.padding.border) > pot &&
                            (this.root.h + h + 2 * this.options.padding.border) <= (pot * 2) &&
                            canGrowDown
                        ) {
                            shouldGrowDown  = true;
                            shouldGrowRight = false;
                        }
                    }
                    // Prevent growing right if it exceeds max width.
                    if (
                        (this.root.w + w + 2 * this.options.padding.border) > this.options.maxsize.w
                    ) {
                        shouldGrowRight = false;
                        canGrowRight    = false;
                    }
                    // Prevent growing down if it exceeds max height.
                    if (
                        (this.root.h + h + 2 * this.options.padding.border) > this.options.maxsize.h
                    ) {
                        shouldGrowDown = false;
                        canGrowDown    = false;
                    }
                    // --- End of "dirty" logic ---

                    // Prioritize growing right, then down, then any possible direction.
                    if (
                        shouldGrowRight
                    ) {
                        return this.growRight(
                            w,
                            h
                        );
                    } else if (
                        shouldGrowDown
                    ) {
                        return this.growDown(
                            w,
                            h
                        );
                    } else if (
                        canGrowRight
                    ) {
                        return this.growRight(
                            w,
                            h
                        );
                    } else if (
                        canGrowDown
                    ) {
                        return this.growDown(
                            w,
                            h
                        );
                    } else {
                        return null; // Cannot grow in any direction to fit the block.
                    }
                },


                // Expands the packing area to the right to fit a new block.
                growRight: function(
                    w,
                    h
                ) {
                    // Create a new root node that encompasses the old root and the new block space to its right.
                    this.root = {
                        used:  true,
                        x:     0,
                        y:     0,
                        w:     this.root.w + w,
                        h:     this.root.h,
                        down:  this.root, // The old root becomes the 'down' child.
                        right: {
                            x: this.root.w,
                            y: 0,
                            w: w,
                            h: this.root.h
                        } // New space to the right.
                    };
                    // Try to find a fitting node within this newly expanded root.
                    if (
                        node = this.findNode(
                            this.root,
                            w,
                            h
                        )
                    ) {
                        return this.splitNode(
                            node,
                            w,
                            h
                        ); // Split the node to place the block.
                    } else {
                        return null; // Should ideally not happen if growRight was called correctly.
                    }
                },


                // Expands the packing area downwards to fit a new block.
                growDown: function(
                    w,
                    h
                ) {
                    // Create a new root node that encompasses the old root and the new block space below it.
                    this.root = {
                        used:  true,
                        x:     0,
                        y:     0,
                        w:     this.root.w,
                        h:     this.root.h + h,
                        down:  {
                            x: 0,
                            y: this.root.h,
                            w: this.root.w,
                            h: h
                        }, // New space below.
                        right: this.root // The old root becomes the 'right' child.
                    };
                    // Try to find a fitting node within this newly expanded root.
                    if (
                        node = this.findNode(
                            this.root,
                            w,
                            h
                        )
                    ) {
                        return this.splitNode(
                            node,
                            w,
                            h
                        ); // Split the node to place the block.
                    } else {
                        return null; // Should ideally not happen if growDown was called correctly.
                    }
                }

            }
        );

        // Return the BinPacker class for use in other modules.
        return BinPacker;

    }
);