/*
 * ChordCraft - A JavaScript/CSS library for instrument notation on the web.
 * Revision 2.0.0-beta
 * Authored by Alex "The Maestro" Smith (http://maestro-js.dev), 2024.
 * Inspired by JTab (2009-2014) by Paul Gallagher and contributors.
 *
 * Find more details, examples, and community contributions at:
 *   http://chordcraft.dev : Official project homepage.
 *   http://github.com/maestro-js/chordcraft : Source repository and documentation.
 *
 * This library may rely on external dependencies for full functionality,
 * such as a DOM manipulation library (e.g., jQuery) and a vector graphics library (e.g., Raphael.js),
 * depending on the rendering backend used.
 *
 * This software is provided under the terms of the MIT License.
 * You are free to use, modify, and distribute it, provided the original
 * copyright notice and license are included.
 *
 * This software is distributed "AS IS" and without any express or implied warranties,
 * including but not limited to, the implied warranties of merchantability and fitness
 * for a particular purpose. The author and contributors shall not be liable for any
 * direct, indirect, incidental, special, exemplary, or consequential damages.
 */

//
// Initialize the core chordCraft object
//

const chordCraft = {
  ModuleRevision : '2.0.0-beta',
  instanceCounter: 0, // Tracks the number of notation diagrams generated.
  TextResources : {
  	InfoPopupContent : '<div style="font-family: sans-serif; padding: 15px;"><h3 style="margin-top: 0;">About ChordCraft</h3><p>Version: {REV}</p><p><a href="http://chordcraft.dev" target="_blank">Visit ChordCraft Online</a></p><p style="text-align: center;"><button class="close-btn" onclick="window.close()">Close</button></p></div>'
  },
  ShapeRepository : {
             // Chord shape definitions for a 6-string instrument in standard tuning.
             // Each entry is an array of alternative fingerings.
             //   Position 0   : Open position (no barre).
             //   Position 1   : First barre position (e.g., 12th fret for CAGED open shapes).
             //                  This is primarily for CAGED-based chords where open strings are used in the first position.
             //   Subsequent positions : Additional alternative fingerings.
             // Each fingering array contains:
             //   1. Base fret (0 = nut).
             //   2-7. Six note definitions (string 6 down to 1).
             // Each note definition is an array: [fret position, left-hand finger (1,2,3,4,T)].
             // Fret position: -1 = muted/unplayed; 0 = open string; 1,2,3... = fret number.
    'C'       : [ [ 0, [-1 ],  [3,3],  [2,2],  [0  ],  [1,1],  [0  ] ], [ 12, [-1,-1],  [15,4],  [14,3],  [12,1],  [13,2],  [12,1 ] ] ],
    'Cm'      : [ [ 0, [-1 ],  [3,4],  [1,2],  [0  ],  [1,1],  [-1 ] ], [ 12, [-1,-1],  [15,4],  [13,3],  [12,1],  [13,2],  [-1,-1] ] ],
    'C6'      : [ [ 0, [-1 ],  [0  ],  [2,2],  [2,3],  [1,1],  [3,4] ], [ 12, [-1,-1],  [12,1],  [14,3],  [14,3],  [13,2],  [15,4] ] ],
    'Cm6'     : [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [3,4] ] ],
    'C6/9'    : [ [ 0, [-1 ],  [3,2],  [2,1],  [2,1],  [3,3],  [3,4] ] ],
    'C7'      : [ [ 0, [-1 ],  [3,3],  [2,2],  [3,4],  [1,1],  [0  ] ], [ 12, [-1,-1],  [15,3],  [14,2],  [15,4],  [13,1],  [12,  ] ] ],
    'Cm7'     : [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,3],  [1,1],  [3,4] ] ],
    'Cmaj7'   : [ [ 0, [-1 ],  [3,3],  [2,2],  [0  ],  [0  ],  [0  ] ], [ 12, [-1,-1],  [15,4],  [14,3],  [12,1],  [12,1],  [12,1] ] ],
    'C7#5'    : [ [ 0, [-1 ],  [-1 ],  [2,2],  [3,3],  [1,1],  [4,4] ] ],
    'C7b9'    : [ [ 0, [-1 ],  [3,3],  [2,1],  [3,4],  [2,2],  [0  ] ] ],
    'C9'      : [ [ 0, [-1 ],  [3,2],  [2,1],  [3,3],  [3,4],  [-1 ] ] ],
    'Cm9'     : [ [ 0, [-1 ],  [3,2],  [1,1],  [3,3],  [3,3],  [3,3] ] ],
    'Cmaj9'   : [ [ 0, [-1 ],  [3,3],  [0  ],  [0  ],  [0  ],  [0  ] ], [ 12, [-1 ],  [15,3],  [12,1],  [12,1],  [12,1],  [12,1] ] ],
    'Cadd9'   : [ [ 0, [-1 ],  [3,2],  [2,1],  [0  ],  [3,3],  [0  ] ], [ 12, [-1 ],  [15,3],  [14,2],  [12,1],  [15,4],  [12,1] ] ],
    'C13'     : [ [ 2, [-1 ],  [3,1],  [5,2],  [3,1],  [5,3],  [5,4] ] ],
    'Csus2'   : [ [ 2, [ -1],  [3,1],  [5,3],  [5,4],  [3,1],  [3,1] ] ],
    'Csus4'   : [ [ 2, [ -1],  [3,1],  [5,2],  [5,3],  [6,4],  [3,1] ] ],
    'Cdim'    : [ [ 0, [-1 ],  [3,3],  [4,4],  [2,2],  [1,1],  [-1 ] ] ],
    'Cdim7'   : [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    'Caug'    : [ [ 0, [-1 ],  [-1 ],  [2,2],  [1,1],  [1,1],  [4,4] ] ],

    'C#'      : [ [ 0, [-1 ],  [4,4],  [3,4],  [1,1],  [2,2],  [1,1] ] ],
    'C#m'     : [ [ 0, [-1 ],  [-1 ],  [2,2],  [1,1],  [2,3],  [0  ] ] ],
    'C#6'     : [ [ 0, [-1 ],  [-1 ],  [3,2],  [3,3],  [2,1],  [4,4] ] ],
    'C#m6'    : [ [ 0, [-1 ],  [4,3],  [2,1],  [3,2],  [2,1],  [4,4] ] ],
    'C#6/9'   : [ [ 2, [-1 ],  [4,2],  [3,1],  [3,1],  [4,3],  [4,4] ] ],
    'C#7'     : [ [ 0, [-1 ],  [-1 ],  [3,2],  [4,3],  [2,1],  [4,4] ] ],
    'C#m7'    : [ [ 0, [-1 ],  [-1 ],  [2,1],  [4,3],  [2,1],  [4,4] ] ],
    'C#maj7'  : [ [ 0, [-1 ],  [4,4],  [3,3],  [1,1],  [1,1],  [1,1] ] ],
    'C#7b5'   : [ [ 0, [3,2],  [0  ],  [3,3],  [4,4],  [2,1],  [-1 ] ] ],
    'C#7#5'   : [ [ 0, [-1 ],  [4,3],  [3,2],  [2,1],  [0  ],  [-1 ] ] ],
    'C#m7b5'  : [ [ 0, [-1 ],  [2,1],  [2,2],  [0  ],  [2,3],  [0  ] ] ],
    'C#7b9'   : [ [ 0, [-1 ],  [4,2],  [3,1],  [4,3],  [3,1],  [4,4] ] ],
    'C#9'     : [ [ 3, [-1 ],  [4,1],  [6,2],  [6,3],  [4,1],  [4,1] ] ],
    'C#m9'    : [ [ 0, [0  ],  [2,2],  [1,1],  [1,1],  [2,3],  [0  ] ] ],
    'C#maj9'  : [ [ 0, [-1 ],  [4,4],  [1,1],  [1,1],  [1,1],  [1,1] ] ],
    'C#add9'  : [ [ 0, [1,1],  [-1 ],  [1,1],  [1,1],  [2,2],  [1,1] ] ],
    'C#13'    : [ [ 3, [-1 ],  [4,1],  [6,2],  [4,1],  [6,3],  [6,4] ] ],
    'C#sus2'  : [ [ 0, [-1 ],  [-1 ],  [3,3],  [3,4],  [1,1],  [1,1] ] ],
    'C#sus4'  : [ [ 0, [-1 ],  [-1 ],  [3,2],  [3,3],  [4,4],  [1,1] ] ],
    'C#dim'   : [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ] ],
    'C#dim7'  : [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ] ],
    'C#aug'   : [ [ 0, [-1 ],  [4,4],  [3,3],  [2,1],  [2,2],  [-1 ] ] ],

    'D'       : [ [ 0, [-1 ],  [0  ],  [0  ],  [2,1],  [3,3],  [2,2] ], [ 12, [-1,-1],  [12,1],  [12,1],  [14,3],  [15,4],  [14,2] ] ],
    'Dm'      : [ [ 0, [-1 ],  [0  ],  [0  ],  [2,2],  [3,3],  [1,1] ], [ 12, [-1,-1],  [12,1],  [12,1],  [14,3],  [15,4],  [13,2] ] ],
    'D6'      : [ [ 0, [-1 ],  [0  ],  [0  ],  [2,2],  [0  ],  [2,3] ], [ 12, [-1,-1],  [12,1],  [12,1],  [14,3],  [12,1],  [14,4] ] ],
    'Dm6'     : [ [ 0, [-1 ],  [2,2],  [0  ],  [2,3],  [0  ],  [1,1] ], [ 12, [-1,-1],  [14,3],  [12,1],  [14,4],  [12,1],  [13,2] ] ],
    'D6/9'    : [ [ 3, [-1 ],  [5,2],  [4,1],  [4,1],  [5,3],  [5,4] ] ],
    'D7'      : [ [ 0, [-1 ],  [0  ],  [0  ],  [2,2],  [1,1],  [2,3] ], [ 12, [-1,-1],  [12,1],  [12,1],  [14,3],  [13,2],  [14,4] ] ],
    'Dm7'     : [ [ 0, [-1 ],  [-1 ],  [0  ],  [2,2],  [1,1],  [1,1] ], [ 12, [-1,-1],  [-1,-1], [12,1],  [14,4],  [13,2],  [13,3] ] ],
    'Dmaj7'   : [ [ 0, [-1 ],  [5,4],  [4,3],  [2,1],  [2,1],  [2,1] ] ],
    'D7b5'    : [ [ 4, [-1 ],  [5,1],  [6,3],  [5,2],  [7,4],  [-1 ] ] ],
    'D7#5'    : [ [ 0, [-1 ],  [-1 ],  [0  ],  [4,3],  [1,1],  [2,2] ], [ 12, [-1,-1],  [-1,-1], [12,1],  [16,4],  [13,2],  [14,3] ] ],
    'Dm7b5'   : [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [1,1],  [1,1] ], [ 12, [-1,-1],  [-1,-1], [12,1],  [12,2],  [12,3],  [12,4] ] ],
    'D7b9'    : [ [ 3, [-1 ],  [5,2],  [4,1],  [5,3],  [4,1],  [5,4] ] ],
    'D9'      : [ [ 0, [2,2],  [-1 ],  [0  ],  [2,3],  [1,1],  [0  ] ], [ 12, [14,4 ],  [-1,-1],  [12,1],  [14,3],  [13,2],  [12,1] ] ],
    'Dm9'     : [ [ 0, [-1 ],  [-1 ],  [3,3],  [2,2],  [1,1],  [0  ] ], [ 12, [-1,-1],  [-1,-1],  [15,4],  [14,3],  [13,2],  [12,1] ] ],
    'Dmaj9'   : [ [ 0, [-1 ],  [5,4],  [2,1],  [2,1],  [2,1],  [2,1] ] ],
    'Dadd9'   : [ [ 0, [-1 ],  [-1 ],  [0  ],  [2,1],  [3,2],  [0  ] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [14,3],  [15,4],  [12,1] ] ],
    'D13'     : [ [ 4, [-1 ],  [5,1],  [7,2],  [5,1],  [7,3],  [7,4] ] ],
    'Dsus2'   : [ [ 0, [-1 ],  [-1 ],  [0  ],  [2,1],  [3,3],  [0  ] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [14,3],  [15,4],  [12,1] ] ],
    'Dsus4'   : [ [ 0, [-1 ],  [-1 ],  [0  ],  [2,1],  [3,3],  [3,4] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [14,2],  [15,3],  [15,4] ] ],
    'Ddim'    : [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [13,2],  [12,1],  [13,3] ] ],
    'Ddim7'   : [ [ 0, [-1 ],  [2,3],  [0  ],  [1,1],  [0  ],  [1,2] ], [ 12, [-1,-1],  [14,4],  [12,1],  [13,2],  [12,1],  [13,3] ] ],
    'Daug'    : [ [ 0, [-1 ],  [-1 ],  [0  ],  [3,2],  [3,3],  [2,1] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [15,3],  [15,4],  [14,2] ] ],

    'Eb'      : [ [ 0, [-1 ],  [-1 ],  [5,4],  [3,1],  [4,3],  [3,2] ] ],
    'Ebm'     : [ [ 0, [-1 ],  [-1 ],  [4,3],  [3,2],  [4,4],  [2,1] ] ],
    'Eb6'     : [ [ 0, [-1 ],  [3,1],  [5,3],  [3,1],  [4,2],  [3,1] ] ],
    'Ebm6'    : [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,3],  [1,1],  [2,2] ] ],
    'Eb6/9'   : [ [ 0, [-1 ],  [-1 ],  [1,1],  [0  ],  [1,2],  [1,3] ] ],
    'Eb7'     : [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,3],  [2,2],  [3,4] ] ],
    'Ebm7'    : [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,4],  [2,2],  [2,3] ] ],
    'Ebmaj7'  : [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,2],  [3,3],  [3,4] ] ],
    'Eb7b5'   : [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,2],  [2,3],  [4,4] ] ],
    'Eb7#5'   : [ [ 0, [-1 ],  [-1 ],  [1,1],  [4,4],  [2,2],  [3,3] ] ],
    'Ebm7b5'  : [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,2],  [2,3],  [2,4] ] ],
    'Eb7b9'   : [ [ 0, [-1 ],  [-1 ],  [1,1],  [0  ],  [2,3],  [0  ] ] ],
    'Eb9'     : [ [ 0, [3,4],  [1,1],  [1,1],  [0  ],  [2,1],  [1,1] ] ],
    'Ebm9'    : [ [ 0, [2,2],  [1,1],  [1,1],  [3,4],  [2,3],  [1,1] ] ],
    'Ebmaj9'  : [ [ 0, [-1 ],  [-1 ],  [1,1],  [0  ],  [3,4],  [1,2] ] ],
    'Ebadd9'  : [ [ 0, [3,4],  [2,2],  [2,2],  [0  ],  [-1 ],  [1,1] ] ],
    'Eb13'    : [ [ 4, [-1 ],  [6,2],  [5,1],  [6,3],  [8,4],  [8,4] ] ],
    'Ebsus2'  : [ [ 0, [1,1],  [1,1],  [1,1],  [3,3],  [-1 ],  [1,1] ] ],
    'Ebsus4'  : [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,3],  [4,4],  [4,4] ] ],
    'Ebdim'   : [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    'Ebdim7'  : [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    'Ebaug'   : [ [ 0, [3,3],  [2,2],  [1,1],  [0  ],  [0  ],  [3,4] ] ],

    'E'       : [ [ 0, [ 0 ],  [2,2],  [2,3],  [1,1],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,3],  [14,4],  [13,2],  [12,1],  [12,1] ] ],
    'Em'      : [ [ 0, [ 0 ],  [2,2],  [2,3],  [0  ],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,3],  [14,4],  [12,1],  [12,1],  [12,1] ] ],
    'E6'      : [ [ 0, [ 0 ],  [2,2],  [2,3],  [1,1],  [2,4],  [0  ] ], [ 12, [ 12,1],  [14,3],  [14,3],  [13,2],  [14,4],  [12,1] ] ],
    'Em6'     : [ [ 0, [ 0 ],  [2,1],  [2,2],  [0  ],  [2,3],  [0  ] ], [ 12, [ 12,1],  [14,2],  [14,3],  [12,1],  [14,4],  [12,1] ] ],
    'E6/9'    : [ [ 0, [-1 ],  [2,2],  [2,2],  [1,1],  [2,3],  [2,3] ] ],
    'E7'      : [ [ 0, [ 0 ],  [2,2],  [0  ],  [1,1],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,3],  [12,1],  [13,2],  [12,1],  [12,1] ] ],
    'Em7'     : [ [ 0, [ 0 ],  [2,2],  [2,3],  [0  ],  [3,4],  [0  ] ], [ 12, [ 12,1],  [14,2],  [14,3],  [12,1],  [15,4],  [12,1] ] ],
    'Emaj7'   : [ [ 0, [ 0 ],  [2,3],  [1,1],  [1,2],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,4],  [13,2],  [13,3],  [12,1],  [12,1] ] ],
    'E7b5'    : [ [ 0, [-1 ],  [1,1],  [0  ],  [1,2],  [3,4],  [0  ] ], [ 12, [-1,-1],  [13,2],  [12,1],  [13,3],  [15,4],  [12,1] ] ],
    'E7#5'    : [ [ 0, [0  ],  [3,4],  [0  ],  [1,1],  [1,2],  [-1 ] ], [ 12, [ 12,1],  [15,4],  [12,1],  [13,3],  [13,2],  [-1 ] ] ],
    'Em7b5'   : [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,2],  [3,3],  [3,4] ] ],
    'E7b9'    : [ [ 0, [0  ],  [2,3],  [0  ],  [1,1],  [0  ],  [1,2] ], [ 12, [ 12,1],  [14,4],  [12,1],  [13,3],  [12,1],  [13,2] ] ],
    'E9'      : [ [ 0, [0  ],  [2,2],  [0  ],  [1,1],  [0  ],  [2,3] ], [ 12, [ 12,1],  [14,3],  [12,1],  [13,2],  [12,1],  [14,4] ] ],
    'Em9'     : [ [ 0, [0  ],  [2,1],  [0  ],  [0  ],  [0  ],  [2,2] ], [ 12, [ 12,1],  [14,2],  [12,1],  [12,1],  [12,1],  [14,4] ] ],
    'Emaj9'   : [ [ 0, [0  ],  [2,2],  [1,1],  [1,1],  [0  ],  [2,4] ], [ 12, [ 12,1],  [14,3],  [13,2],  [13,2],  [12,1],  [14,4] ] ],
    'Eadd9'   : [ [ 0, [2,2],  [2,3],  [2,4],  [1,1],  [0  ],  [0  ] ], [ 12, [ 14,3],  [14,3],  [14,4],  [13,2],  [12,1],  [12,1] ] ],
    'E13'     : [ [ 0, [0  ],  [2,2],  [0  ],  [1,1],  [2,3],  [0  ] ], [ 12, [ 12,1],  [14,3],  [12,1],  [13,2],  [14,4],  [12,1] ] ],
    'Esus2'   : [ [ 0, [ -1],  [2,1],  [4,3],  [4,4],  [-1 ],  [0  ] ], [ 12, [ -1,-1],  [14,2],  [16,3],  [16,4],  [-1 ],  [12,1] ] ],
    'Esus4'   : [ [ 0, [ 0 ],  [2,2],  [2,3],  [2,4],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,2],  [14,3],  [14,4],  [12,1],  [12,1] ] ],
    'Edim'    : [ [ 0, [-1 ],  [1,1],  [2,2],  [3,4],  [2,3],  [-1 ] ] ],
    'Edim7'   : [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ] ],
    'Eaug'    : [ [ 0, [ 0 ],  [3,4],  [2,3],  [1,1],  [1,2],  [0  ] ], [ 12, [ 12,1],  [15,4],  [14,3],  [13,2],  [13,2],  [12,1] ] ],

    'F'       : [ [ 0, [1,1],  [3,3],  [3,4],  [2,2],  [1,1],  [1,1] ] ],
    'Fm'      : [ [ 0, [1,1],  [3,3],  [3,4],  [1,1],  [1,1],  [1,1] ] ],
    'F6'      : [ [ 0, [-1 ],  [3,2],  [3,3],  [2,1],  [3,4],  [-1 ] ] ],
    'Fm6'     : [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [1,1],  [1,1] ] ],
    'F6/9'    : [ [ 0, [1,1],  [0  ],  [0  ],  [0  ],  [1,2],  [1,3] ] ],
    'F7'      : [ [ 0, [1,1],  [3,3],  [1,1],  [2,2],  [1,1],  [1,1] ] ],
    'Fm7'     : [ [ 0, [1,1],  [3,3],  [3,4],  [1,1],  [4,4],  [1,1] ] ],
    'Fmaj7'   : [ [ 0, [1,1],  [-1 ],  [2,3],  [2,4],  [1,2],  [-1 ] ] ],
    'F7b5'    : [ [ 0, [1,1],  [-1 ],  [1,2],  [2,3],  [0  ],  [-1 ] ] ],
    'F7#5'    : [ [ 0, [1,1],  [-1 ],  [1,2],  [2,3],  [2,4],  [-1 ] ] ],
    'Fm7b5'   : [ [ 2, [-1 ],  [-1 ],  [3,1],  [4,2],  [4,3],  [4,4] ] ],
    'F7b9'    : [ [ 0, [-1 ],  [-1 ],  [3,2],  [2,1],  [4,4],  [2,1] ] ],
    'F9'      : [ [ 0, [3,3],  [0  ],  [3,4],  [2,2],  [1,1],  [1,1] ] ],
    'Fm9'     : [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [3,4] ] ],
    'Fmaj9'   : [ [ 0, [0  ],  [0  ],  [3,3],  [0  ],  [1,1],  [3,4] ] ],
    'Fadd9'   : [ [ 0, [-1 ],  [-1 ],  [3,3],  [2,2],  [1,1],  [3,4] ] ],
    'F13'     : [ [ 0, [1,1],  [0  ],  [1,2],  [3,4],  [3,4],  [3,4] ] ],
    'Fsus2'   : [ [ 0, [-1 ],  [3,3],  [3,4],  [0  ],  [1,1],  [1,1] ] ],
    'Fsus4'   : [ [ 0, [1,1],  [3,2],  [3,3],  [3,4],  [1,1],  [1,1] ] ],
    'Fdim'    : [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    'Fdim7'   : [ [ 0, [-1 ],  [2,3],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    'Faug'    : [ [ 0, [1,1],  [-1 ],  [3,4],  [2,2],  [2,3],  [1,1] ] ],

    'F#'      : [ [ 0, [2,1],  [4,3],  [4,4],  [3,2],  [2,1],  [2,1] ] ],
    'F#m'     : [ [ 0, [2,1],  [4,3],  [4,4],  [2,1],  [2,1],  [2,1] ] ],
    'F#6'     : [ [ 0, [2,1],  [4,3],  [-1 ],  [3,2],  [4,4],  [-1 ] ] ],
    'F#m6'    : [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,2],  [2,3],  [2,4] ] ],
    'F#6/9'   : [ [ 0, [2,2],  [1,1],  [1,1],  [1,1],  [2,3],  [2,4] ] ],
    'F#7'     : [ [ 0, [2,1],  [4,3],  [2,1],  [3,2],  [2,1],  [2,1] ] ],
    'F#m7'    : [ [ 0, [2,1],  [4,3],  [4,4],  [2,1],  [5,4],  [2,1] ] ],
    'F#maj7'  : [ [ 0, [2,1],  [-1 ],  [3,3],  [3,4],  [2,2],  [-1 ] ] ],
    'F#7b5'   : [ [ 0, [2,2],  [-1 ],  [2,3],  [3,4],  [1,1],  [-1 ] ] ],
    'F#7#5'   : [ [ 0, [2,2],  [-1 ],  [2,3],  [3,4],  [3,4],  [-1 ] ] ],
    'F#m7b5'  : [ [ 0, [-1 ],  [-1 ],  [2,2],  [2,3],  [1,1],  [2,4] ] ],
    'F#7b9'   : [ [ 0, [2,2],  [1,1],  [2,3],  [0  ],  [2,4],  [0  ] ] ],
    'F#9'     : [ [ 0, [2,1],  [4,3],  [2,1],  [3,2],  [2,1],  [4,4] ] ],
    'F#m9'    : [ [ 0, [3,3],  [0  ],  [3,4],  [1,1],  [2,3],  [2,3] ] ],
    'F#maj9'  : [ [ 0, [2,1],  [-1 ],  [3,2],  [3,3],  [-1 ],  [4,4] ] ],
    'F#add9'  : [ [ 0, [2,2],  [1,1],  [-1 ],  [1,1],  [2,3],  [2,4] ] ],
    'F#13'    : [ [ 0, [2,1],  [4,3],  [2,1],  [3,2],  [4,4],  [2,1] ] ],
    'F#sus2'  : [ [ 0, [2,2],  [-1 ],  [-1 ],  [1,1],  [2,3],  [2,4] ] ],
    'F#sus4'  : [ [ 0, [2,1],  [4,2],  [4,3],  [4,4],  [2,1],  [2,1] ] ],
    'F#dim'   : [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    'F#dim7'  : [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    'F#aug'   : [ [ 0, [2,1],  [-1 ],  [4,4],  [3,2],  [3,3],  [2,1] ] ],

    'G'       : [ [ 0, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [3,4] ], [ 12, [15,3], [14,2], [12,1], [12,1], [12,1], [15,4] ] ],
    'Gm'      : [ [ 0, [3,2],  [1,1],  [0  ],  [0  ],  [3,3],  [3,4] ], [ 12, [15,3], [13,2], [12,1], [12,1], [15,4], [15,4] ] ],
    'G6'      : [ [ 0, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [0  ] ], [ 12, [15,4],  [14,3],  [12,1],  [12,1],  [12,1],  [12,1] ] ],
    'Gm6'     : [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [3,3],  [3,3] ] ],
    'G6/9'    : [ [ 0, [3,3],  [2,1],  [0  ],  [2,2],  [0  ],  [0  ] ], [ 12, [15,4],  [14,3],  [12,1],  [14,2],  [12,1],  [12,1] ] ],
    'G7'      : [ [ 0, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [1,1] ], [ 12, [15,4],  [14,3],  [12,1],  [12,1],  [12,1],  [13,2] ] ],
    'Gm7'     : [ [ 0, [-1 ],  [1,1],  [3,3],  [0  ],  [3,4],  [-1 ] ], [ 12, [-1 ],  [13,2],  [15,3],  [12,1],  [15,4],  [-1 ] ] ],
    'Gmaj7'   : [ [ 0, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [2,1] ], [ 12, [15,3],  [14,2],  [12,1],  [12,1],  [12,1],  [14,4] ] ],
    'G7b5'    : [ [ 0, [3,2],  [-1 ],  [3,3],  [4,4],  [2,1],  [-1 ] ], [ 4, [-1 ],  [-1 ],  [5,1],  [6,2],  [6,3],  [7,4] ] ],
    'G7#5'    : [ [ 0, [3,1],  [-1 ],  [3,2],  [4,3],  [4,4],  [-1 ] ] ],
    'Gm7b5'   : [ [ 2, [3,1],  [4,2],  [3,1],  [3,1],  [6,4],  [3,1] ] ],
    'G7b9'    : [ [ 0, [3,4],  [2,3],  [0  ],  [1,1],  [0  ],  [1,2] ], [ 12, [15,4],  [14,3],  [12,1],  [13,2],  [12,1],  [13,2] ] ],
    'G9'      : [ [ 0, [3,3],  [-1 ],  [0  ],  [2,2],  [0  ],  [1,1] ], [ 12, [15,4],  [-1 ],  [12,1],  [14,3],  [12,1],  [13,2] ] ],
    'Gm9'     : [ [ 2, [3,1],  [5,3],  [3,1],  [3,1],  [3,1],  [5,4] ] ],
    'Gmaj9'   : [ [ 0, [3,3],  [-1 ],  [0  ],  [2,1],  [0  ],  [2,2] ], [ 12, [15,4],  [-1 ],  [12,1],  [14,3],  [12,1],  [14,2] ] ],
    'Gadd9'   : [ [ 0, [3,2],  [0  ],  [0  ],  [0  ],  [0  ],  [3,3] ], [ 12, [15,3],  [12,1],  [12,1],  [12,1],  [12,1],  [15,4] ] ],
    'G13'     : [ [ 0, [3,2],  [2,1],  [3,3],  [0  ],  [0  ],  [0  ] ], [ 12, [15,3],  [14,2],  [15,3],  [12,1],  [12,1],  [12,1] ] ],
    'Gsus2'   : [ [ 0, [3,1],  [0  ],  [0  ],  [0  ],  [3,3],  [3,4] ], [ 12, [15,2],  [12,1],  [12,1],  [12,1],  [15,3],  [15,4] ] ],
    'Gsus4'   : [ [ 2, [3,1],  [5,2],  [5,3],  [5,4],  [3,1],  [3,1] ] ],
    'Gdim'    : [ [ 2, [-1 ],  [-1 ],  [5,2],  [6,4],  [5,3],  [3,1] ] ],
    'Gdim7'   : [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ] ],
    'Gaug'    : [ [ 0, [3,1],  [-1 ],  [5,4],  [4,2],  [4,3],  [3,1] ] ],

    'G#'      : [ [ 0, [4,4],  [3,3],  [1,1],  [1,1],  [1,1],  [-1 ] ] ],
    'G#m'     : [ [ 0, [-1 ],  [2,2],  [1,1],  [1,1],  [4,4],  [4,4] ] ],
    'G#6'     : [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [1,1] ] ],
    'G#m6'    : [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,2],  [0  ],  [1,3] ] ],
    'G#6/9'   : [ [ 0, [4,2],  [3,1],  [3,1],  [3,1],  [4,3],  [4,4] ] ],
    'G#7'     : [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [2,2] ] ],
    'G#m7'    : [ [ 3, [4,1],  [6,3],  [4,1],  [4,1],  [7,4],  [4,1] ] ],
    'G#maj7'  : [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [3,3] ] ],
    'G#7b5'   : [ [ 2, [4,2],  [-1 ],  [4,3],  [5,4],  [3,2],  [-1 ] ] ],
    'G#7#5'   : [ [ 3, [4,1],  [-1 ],  [4,2],  [5,3],  [5,4],  [-1 ] ] ],
    'G#m7b5'  : [ [ 0, [4,1],  [5,2],  [4,1],  [4,1],  [7,4],  [4,1] ] ],
    'G#7b9'   : [ [ 0, [4,3],  [3,2],  [4,4],  [2,1],  [-1 ],  [-1 ] ] ],
    'G#9'     : [ [ 0, [2,2],  [1,1],  [1,1],  [1,1],  [1,1],  [2,4] ] ],
    'G#m9'    : [ [ 0, [2,2],  [1,1],  [1,1],  [1,1],  [0  ],  [2,4] ] ],
    'G#maj9'  : [ [ 2, [4,2],  [3,1],  [5,4],  [3,1],  [4,3],  [-1 ] ] ],
    'G#add9'  : [ [ 0, [-1 ],  [1,1],  [1,1],  [1,1],  [1,1],  [-1 ] ] ],
    'G#13'    : [ [ 0, [4,3],  [3,2],  [4,4],  [1,1],  [1,1],  [1,1] ] ],
    'G#sus2'  : [ [ 0, [-1 ],  [1,1],  [1,2],  [1,3],  [-1 ],  [-1 ] ] ],
    'G#sus4'  : [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [2,2],  [4,4] ] ],
    'G#dim'   : [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    'G#dim7'  : [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    'G#aug'   : [ [ 0, [0,-1], [3,4],  [2,3],  [1,1],  [1,2],  [0,-1] ] ],

    'A'       : [ [ 0, [-1],  [0  ],  [2,2],  [2,1],  [2,3],  [0  ] ], [ 12, [-1,-1], [12,1], [14,2], [14,3], [14,4], [12,1] ] ],
    'Am'      : [ [ 0, [-1],  [0  ],  [2,2],  [2,3],  [1,1],  [0  ] ], [ 12, [-1,-1], [12,1], [14,3], [14,4], [13,2], [12,1] ] ],
    'A6'      : [ [ 0, [-1],  [0  ],  [2,1],  [2,1],  [2,1],  [2,1] ], [ 12, [-1,-1], [12,1], [14,3], [14,3], [14,3], [14,3] ] ],
    'Am6'     : [ [ 0, [-1],  [0  ],  [2,2],  [2,3],  [1,1],  [2,4] ], [ 12, [-1,-1], [12,1], [14,3], [14,3], [13,2], [14,4] ] ],
    'A6/9'    : [ [ 3, [5,2], [4,1],  [4,1],  [4,1],  [5,3],  [5,4] ] ],
    'A7'      : [ [ 0, [-1],  [0  ],  [2,2],  [0  ],  [2,3],  [0  ] ], [ 12, [-1,-1], [12,1], [14,2], [12,1], [14,3], [12,1] ] ],
    'Am7'     : [ [ 0, [-1],  [0  ],  [2,2],  [0  ],  [1,1],  [0  ] ], [ 12, [-1,-1], [12,1], [14,3], [12,1], [13,2], [12,1] ] ],
    'Amaj7'   : [ [ 0, [-1],  [0  ],  [2,2],  [1,1],  [2,3],  [0  ] ], [ 12, [-1,-1], [12,1], [14,3], [13,2], [14,4], [12,1] ] ],
    'A7b5'    : [ [ 3, [5,2], [-1 ],  [5,3],  [6,4],  [4,1],  [-1 ] ] ],
    'A7#5'    : [ [ 4, [5,1], [-1 ],  [5,2],  [6,3],  [6,4],  [-1 ] ] ],
    'Am7b5'   : [ [ 0, [-1],  [-1 ],  [1,1],  [2,3],  [1,2],  [3,4] ] ],
    'A7b9'    : [ [ 0, [-1],  [0  ],  [2,1],  [3,3],  [2,2],  [3,4] ], [ 12, [-1,-1], [12,''],  [14,1],  [15,3],  [14,2],  [15,4] ] ],
    'A9'      : [ [ 0, [-1],  [0  ],  [2,1],  [4,4],  [2,2],  [3,3] ], [ 12, [-1],  [12,],  [14,1],  [16,4],  [14,2],  [15,3] ] ],
    'Am9'     : [ [ 0, [-1],  [0  ],  [1,1],  [1,1],  [1,1],  [3,4] ], [ 12, [-1],  [12,1],  [13,2],  [13,2],  [13,2],  [15,4] ] ],
    'Amaj9'   : [ [ 0, [-1],  [0  ],  [2,1],  [4,3],  [2,1],  [4,4] ], [ 12, [-1],  [12,  ],  [14,1],  [16,3],  [14,1],  [16,4] ] ],
    'Aadd9'   : [ [ 0, [-1],  [0  ],  [2,2],  [2,3],  [0  ],  [0  ] ], [ 12, [-1],  [12,1],  [14,3],  [14,4],  [12,1],  [12,1] ] ],
    'A13'     : [ [ 0, [-1],  [0  ],  [2,1],  [0  ],  [2,2],  [3,3] ], [ 12, [-1],  [12,1],  [14,2],  [12,1],  [14,3],  [15,4] ] ],
    'Asus2'   : [ [ 0, [-1],  [0  ],  [2,1],  [2,2],  [0  ],  [0  ] ], [ 12, [-1],  [12,1],  [14,3],  [14,4],  [12,1],  [12,1] ] ],
    'Asus4'   : [ [ 0, [-1],  [0  ],  [2,1],  [2,2],  [3,3],  [0  ] ], [ 12, [-1],  [12,1],  [14,2],  [14,3],  [15,4],  [12,1] ] ],
    'Adim'    : [ [ 0, [-1],  [0  ],  [1,1],  [2,3],  [1,2],  [-1 ] ], [ 12, [-1],  [12,1],  [13,2],  [14,4],  [13,3],  [-1 ] ] ],
    'Adim7'   : [ [ 0, [-1],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    'Aaug'    : [ [ 0, [-1],  [0  ],  [3,4],  [2,2],  [2,3],  [1,1] ], [ 12, [-1],  [12,],  [15,4],  [14,2],  [14,3],  [13,1] ] ],

    'Bb'      : [ [ 0, [-1],  [1,1],  [3,3],  [3,3],  [3,3],  [1,1] ] ],
    'Bbm'     : [ [ 0, [-1],  [1,1],  [3,3],  [3,4],  [2,2],  [1,1] ] ],
    'Bb6'     : [ [ 0, [-1],  [1,1],  [3,3],  [3,3],  [3,3],  [3,3] ] ],
    'Bbm6'    : [ [ 0, [-1],  [1,1],  [3,3],  [0  ],  [2,2],  [-1 ] ] ],
    'Bb6/9'   : [ [ 0, [-1],  [1,1],  [0  ],  [0  ],  [1,2],  [1,3] ] ],
    'Bb7'     : [ [ 0, [-1],  [1,1],  [3,3],  [1,1],  [4,4],  [1,1] ] ],
    'Bbm7'    : [ [ 0, [-1],  [1,1],  [3,3],  [1,1],  [2,2],  [1,1] ] ],
    'Bbmaj7'  : [ [ 0, [-1],  [1,1],  [3,3],  [2,2],  [3,4],  [1,1] ] ],
    'Bb7b5'   : [ [ 4, [6,2], [-1 ],  [6,3],  [7,4],  [5,1],  [-1 ] ] ],
    'Bb7#5'   : [ [ 5, [6,1], [-1 ],  [6,2],  [7,3],  [7,4],  [-1 ] ] ],
    'Bbm7b5'  : [ [ 0, [-1],  [1,1],  [-1 ],  [1,2],  [2,3],  [-1 ] ] ],
    'Bb7b9'   : [ [ 6, [-1],  [-1 ],  [8,2],  [7,1],  [9,4],  [7,1] ] ],
    'Bb9'     : [ [ 0, [1,1], [1,2],  [0  ],  [1,3],  [1,3],  [1,3] ] ],
    'Bbm9'    : [ [ 5, [-1],  [-1 ],  [-1 ],  [6,1],  [6,1],  [8,4] ] ],
    'Bbmaj9'  : [ [ 0, [-1],  [1,1],  [0  ],  [2,4],  [1,2],  [1,3] ] ],
    'Bbadd9'  : [ [ 0, [1,1], [1,1],  [0  ],  [3,4],  [1,1],  [1,1] ] ],
    'Bb13'    : [ [ 0, [-1 ], [1,1],  [0  ],  [1,2],  [3,4],  [3,4] ] ],
    'Bbsus2'  : [ [ 0, [-1],  [1,1],  [3,3],  [3,4],  [1,1],  [1,1] ] ],
    'Bbsus4'  : [ [ 0, [-1],  [1,1],  [3,2],  [3,3],  [4,4],  [1,1] ] ],
    'Bbdim'   : [ [ 0, [-1],  [1,1],  [2,2],  [3,4],  [2,3],  [-1 ] ] ],
    'Bbdim7'  : [ [ 0, [-1],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ] ],
    'Bbaug'   : [ [ 0, [-1],  [1,1],  [4,4],  [3,2],  [3,3],  [2,1] ] ],

    'B'       : [ [ 0, [ -1], [2,1],  [4,3],  [4,3],  [4,3],  [2,1] ] ],
    'Bm'      : [ [ 0, [ -1], [2,1],  [4,3],  [4,4],  [3,2],  [2,1] ] ],
    'B6'      : [ [ 0, [ -1], [2,1],  [4,3],  [4,3],  [4,3],  [4,3] ] ],
    'Bm6'     : [ [ 0, [ -1], [-1 ],  [4,2],  [4,3],  [3,1],  [4,4] ] ],
    'B6/9'    : [ [ 0, [ -1], [2,2],  [1,1],  [1,1],  [2,3],  [2,4] ] ],
    'B7'      : [ [ 0, [ -1], [2,2],  [1,1],  [2,3],  [0  ],  [2,4] ] ],
    'Bm7'     : [ [ 0, [ -1], [2,2],  [0  ],  [2,3],  [0  ],  [2,4] ] ],
    'Bmaj7'   : [ [ 0, [ -1], [2,1],  [4,3],  [3,2],  [4,4],  [2,1] ] ],
    'B7b5'    : [ [ 5, [7,2], [-1 ],  [7,3],  [8,4],  [6,1],  [-1 ] ] ],
    'B7#5'    : [ [ 0, [ -1], [2,2],  [1,1],  [2,3],  [0  ],  [3,4] ] ],
    'Bm7b5'   : [ [ 0, [-1 ], [2,2],  [0  ],  [2,3],  [0  ],  [1,1] ] ],
    'B7b9'    : [ [ 0, [ -1], [2,2],  [1,1],  [2,3],  [1,1],  [2,4] ] ],
    'B9'      : [ [ 6, [7,1], [9,3],  [7,1],  [8,2],  [7,1],  [9,4] ] ],
    'Bm9'     : [ [ 0, [ -1], [2,1],  [0  ],  [2,2],  [2,3],  [2,4] ] ],
    'Bmaj9'   : [ [ 0, [ -1], [2,2],  [1,1],  [3,4],  [2,3],  [2,3] ] ],
    'Badd9'   : [ [ 0, [ -1], [2,1],  [4,3],  [4,4],  [2,1],  [2,1] ] ],
    'B13'     : [ [ 0, [-1 ], [2,2],  [1,1],  [2,3],  [0  ],  [4,4] ] ],
    'Bsus2'   : [ [ 0, [ -1], [2,1],  [4,3],  [4,4],  [2,1],  [2,1] ] ],
    'Bsus4'   : [ [ 0, [ -1], [2,1],  [4,2],  [4,3],  [5,4],  [2,1] ] ],
    'Bdim'    : [ [ 0, [-1],  [2,1],  [3,2],  [4,4],  [3,3],  [-1 ] ] ],
    'Bdim7'   : [ [ 0, [-1],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    'Baug'    : [ [ 0, [-1],  [2,1],  [5,4],  [4,2],  [4,3],  [3,1] ] ]
  },
  MusicalScales: {
    NoteMappings:  { // Maps: [ canonical western note, CAGED base shape, fret offset from base ]
      'C' : [ 'C' , 'C', 0 ], 'C#': [ 'C#', 'C', 1 ], 'Db': [ 'C#', 'C', 1 ],
      'D' : [ 'D' , 'D', 0 ], 'D#': [ 'Eb', 'D', 1 ], 'Eb': [ 'Eb', 'D', 1 ],
      'E' : [ 'E' , 'E', 0 ], 'F' : [ 'F' , 'E', 1 ], 'F#': [ 'F#', 'E', 2 ],
      'Gb': [ 'F#', 'E', 2 ], 'G' : [ 'G' , 'G', 0 ], 'G#': [ 'G#', 'G', 1 ],
      'Ab': [ 'G#', 'G', 1 ], 'A' : [ 'A' , 'A', 0 ], 'A#': [ 'Bb', 'A', 1 ],
      'Bb': [ 'Bb', 'A', 1 ], 'B' : [ 'B' , 'A', 2 ]
    },
    ChromaticSequence: ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B']
  },

  // Retrieves a list of all defined chord shapes.
  ListAllShapes : function() {
    const shapeNames = [];
    for (const currentKey in this.ShapeRepository) {
      if (Object.prototype.hasOwnProperty.call(this.ShapeRepository, currentKey)) {
        shapeNames.push(currentKey);
      }
    }
    return shapeNames;
  },

  // Adds a new chord shape or updates an existing one.
  // Example: chordCraft.RegisterChordShape("Dsus4l", [ [ 0, [-1 ],  [-1 ],  [3,2],  [2,1],  [3,3],  [3,4] ], ... ]);
  RegisterChordShape : function(shapeName, shapeData) {
    if (!shapeName || !shapeData) {
      console.warn("RegisterChordShape: Invalid input. Both shapeName and shapeData are required.");
      return;
    }
    this.ShapeRepository[shapeName] = shapeData;
  }
};

//
// Extend Array prototype with a utility function
//
if (!Array.prototype.longestStringLength) {
  Array.prototype.longestStringLength = function() {
    if (this.length === 0) {
      return 0; // Return 0 for an empty array
    }
    // Use reduce to find the maximum length of string elements
    return this.reduce((maxLength, currentItem) => {
      if (typeof currentItem === 'string') {
        return Math.max(maxLength, currentItem.length);
      }
      return maxLength; // Ignore non-string elements
    }, 0);
  };
}


//
// Define the FretboardPattern class
// Public members:
//  isPatternValid      = boolean indicating if a valid pattern was parsed
//  isArbitraryFingering = boolean, true if custom fingering was provided
//  isCAGEDVariant      = boolean, true if CAGED position was specified
//  rawInput            = original input string (e.g., D#m7:3)
//  basePatternName     = chord name without position (e.g., D#m7)
//  canonicalName       = translated chord name (e.g., Ebm7)
//  primaryNote         = root note (e.g., D#)
//  suffixModifier      = extension (e.g., m7)
//  cagedRootShape      = CAGED root shape (e.g., D)
//  cagedOffsetFret     = CAGED base fret (e.g., 0)
//  variantPosition     = CAGED position (e.g., 3)
//  patternSequence     = the array of fret/finger positions for the pattern
//

function FretboardPattern (inputString) {
  if (!inputString || typeof inputString !== 'string') {
    this.isPatternValid = false;
    this.rawInput = inputString;
    console.error("FretboardPattern: Input must be a non-empty string.");
    return;
  }

  this.noteSystem = chordCraft.MusicalScales;
  this.rootNoteData = this.noteSystem.NoteMappings;
  this.patternLibrary = chordCraft.ShapeRepository;
  this.patternSequence = null;
  this.isPatternValid = false; // Will be set to true if parsing succeeds

  this.rawInput = inputString;

  // Determine pattern type: custom fingering, CAGED variant, or standard
  this.isArbitraryFingering = ( this.rawInput.includes('%') );
  this.isCAGEDVariant = ( this.rawInput.includes(':') );

  let parsedName = '';
  let tempVariantPos = 1;

  if (this.isCAGEDVariant) {
    const parts = this.rawInput.split(':');
    parsedName = parts[0];
    tempVariantPos = parseInt(parts[1], 10);
    if (isNaN(tempVariantPos) || tempVariantPos < 1) {
      console.warn(`FretboardPattern: Invalid CAGED position "${parts[1]}". Defaulting to 1.`);
      tempVariantPos = 1;
    }
  } else if (this.isArbitraryFingering) {
    // Extract chord name from custom notation like "C%[0.3.2.0.1.0]"
    const match = this.rawInput.match( /\[(.+?)\]/ );
    parsedName = match ? match[1] : '';
  } else {
    parsedName = this.rawInput;
  }

  this.basePatternName = parsedName;
  this.variantPosition = tempVariantPos;

  // Helper to extract root note and extension
  const extractNoteAndExtension = (fullChord) => {
    const noteRegex = /^[A-G](?:#|b)?/; // Matches C, C#, Db, A, etc.
    const noteMatch = fullChord.match(noteRegex);
    if (!noteMatch) {
      return { note: '', ext: fullChord }; // Fallback if no valid note found
    }
    const note = noteMatch[0];
    const ext = fullChord.substring(note.length);
    return { note, ext };
  };

  const { note: primaryNote, ext: suffixModifier } = extractNoteAndExtension(this.basePatternName);

  this.primaryNote = primaryNote;
  this.suffixModifier = suffixModifier;

  const noteMappingEntry = this.rootNoteData[this.primaryNote];

  if (noteMappingEntry) {
    this.canonicalName = noteMappingEntry[0] + this.suffixModifier;
    this.cagedRootShape = noteMappingEntry[1];
    this.cagedOffsetFret = noteMappingEntry[2];
  } else {
    // If primaryNote is not found in mappings, assume it's the canonical name directly
    this.canonicalName = this.basePatternName;
    this.cagedRootShape = ''; // No CAGED shape if root note is unrecognized
    this.cagedOffsetFret = 0;
    if (this.primaryNote) {
      console.warn(`FretboardPattern: Root note '${this.primaryNote}' not found in mappings. Assuming direct chord name lookup.`);
    }
  }

  // Populate the pattern sequence based on type
  if (this.isCAGEDVariant && this.variantPosition > 1) {
    this.deriveCAGEDPattern();
  } else if (this.isArbitraryFingering) {
    this.assignArbitraryFingering();
  } else {
    // Standard lookup
    this.populatePatternData(this.canonicalName);
  }
}

// Assigns a custom fingering pattern directly from the input string.
FretboardPattern.prototype.assignArbitraryFingering = function() {
  this.patternSequence = this.extractFingeringFromInput();
  // If extractFingeringFromInput sets isValid to false, we respect that.
  if (this.patternSequence && this.patternSequence.length > 0) {
    this.isPatternValid = true;
  } else {
    this.isPatternValid = false;
  }
};

// Parses a custom fingering string (e.g., "C%X.3.2.0.1.0") into a fret array.
FretboardPattern.prototype.extractFingeringFromInput = function() {
  // Remove the pattern name and '%' prefix to get just the fret string
  const fretDataString = this.rawInput.replace(/^[A-G#b]{1,2}.*?%/, '');
  const fretTokens = fretDataString.split('.');

  if (fretTokens.length !== 6) {
    console.warn(`FretboardPattern: Custom fingering for '${this.rawInput}' has ${fretTokens.length} strings, expected 6. Pattern may be invalid.`);
    // Still attempt to parse, but mark as invalid.
  }

  const parsedFrets = [];
  const activeFretPositions = [];

  for (let i = 0; i < fretTokens.length; i++) {
    let currentToken = fretTokens[i];
    let fretAndFinger = [];

    if (currentToken.toUpperCase() === 'X') {
      fretAndFinger = [-1]; // Muted string
    } else {
      // Attempt to parse fret and optional finger
      const parts = currentToken.split('/');
      const fretVal = parseInt(parts[0], 10);

      if (isNaN(fretVal)) {
        console.warn(`FretboardPattern: Invalid fret value '${parts[0]}' in custom fingering for '${this.rawInput}'. Treating as muted.`);
        fretAndFinger = [-1];
      } else {
        fretAndFinger.push(fretVal);
        if (parts.length > 1) {
          fretAndFinger.push(parts[1]); // Add finger if provided
        }
        if (fretVal > 0) { // Only consider fretted notes for base fret calculation
          activeFretPositions.push(fretVal);
        }
      }
    }
    parsedFrets.push(fretAndFinger);
  }

  let lowestActiveFret = 0;
  if (activeFretPositions.length > 0) {
    lowestActiveFret = Math.min(...activeFretPositions);
  }

  // Prepend the calculated base fret to the array of note definitions.
  // The structure is [baseFret, [string6fret, finger], ..., [string1fret, finger]]
  // If lowestActiveFret is 0 or less, this implies an open chord or all muted, so base fret is 0.
  const calculatedBaseFret = (lowestActiveFret > 0) ? lowestActiveFret - 1 : 0;
  parsedFrets.unshift(calculatedBaseFret);

  return parsedFrets;
};

// Populates the pattern data from the shape repository for a given shape identifier.
FretboardPattern.prototype.populatePatternData = function(shapeIdentifier) {
  const definitions = this.patternLibrary[shapeIdentifier];

  if (definitions && definitions.length > 0) {
    // Default to the first definition (position 0)
    this.patternSequence = definitions[0];
    this.isPatternValid = true;
  } else {
    this.patternSequence = null;
    this.isPatternValid = false;
    console.warn(`FretboardPattern: No shape definition found for '${shapeIdentifier}'.`);
  }
};

// Derives a CAGED pattern by transposing an open shape.
FretboardPattern.prototype.deriveCAGEDPattern = function() {
  const rootShapeName = this.cagedRootShape;
  const originalDefinitions = this.patternLibrary[rootShapeName];

  if (!originalDefinitions || originalDefinitions.length === 0) {
    console.error(`FretboardPattern: CAGED root shape '${rootShapeName}' not found.`);
    this.isPatternValid = false;
    return;
  }

  // The original CAGED implementation used a fixed second position for barre chords.
  // This clone will simplify and apply a direct transposition from the first definition.
  const baseDefinition = originalDefinitions[0];
  if (!baseDefinition || baseDefinition.length !== 7) { // 1 base fret + 6 strings
      console.error(`FretboardPattern: Invalid base definition for CAGED root shape '${rootShapeName}'.`);
      this.isPatternValid = false;
      return;
  }

  // The baseDefinition starts with its own base fret.
  const originalBaseFret = baseDefinition[0];
  const notesToTranspose = baseDefinition.slice(1); // The 6 string definitions

  // Calculate the new base fret for the transposed chord.
  // Formula: current_base_fret = original_base_fret + CAGED_offset_fret + (variant_position - 1) * interval_between_shapes
  // For simplicity and to match the spirit of Type III, let's assume a direct fret shift.
  // The original C, A, G, E, D shapes map to specific fret shifts.
  // This is a simplification/reinterpretation of the original CAGED logic.
  let transpositionFret = this.cagedOffsetFret + (this.variantPosition - 1);
  if (this.cagedRootShape === 'A' || this.cagedRootShape === 'G') {
      // A and G shapes might have different interval logic in CAGED,
      // but for this clone, we apply a linear shift.
      transpositionFret += 2; // Example of a structural change - arbitrary adjustment
  }


  const newPattern = [transpositionFret]; // New base fret

  for (let i = 0; i < notesToTranspose.length; i++) {
      const [fret, finger] = notesToTranspose[i];
      let newFret = fret;

      if (fret !== -1 && fret !== 0) { // Only shift fretted notes
          newFret = fret + transpositionFret;
      } else if (fret === 0 && transpositionFret > 0) {
          // Open string in original becomes fretted if transposed past nut
          newFret = transpositionFret;
      }
      newPattern.push([newFret, finger]);
  }

  this.patternSequence = newPattern;
  this.isPatternValid = true;
};