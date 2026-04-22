/**
 *
 *  JTab - The JavaScript/CSS Library for Guitar Chord and Tab Notation on the Web.
 *  Version 1.3.1 (Latest Stable Release)
 *
 *  Originally authored and maintained by Paul Gallagher (http://tardate.com) in 2009.
 *
 *  Key Contributors to this project include:
 *    - Jason Ong (https://github.com/jasonong)
 *    - Bruno Bornsztein (https://github.com/bborn)
 *    - Binary Bit LAN (https://github.com/binarybitlan)
 *
 *  For comprehensive information regarding availability, configuration, and usage, please visit:
 *    http://jtab.tardate.com
 *
 *  The source code repository, project wiki, and detailed documentation are hosted at:
 *    http://github.com/tardate/jtab/tree/master
 *
 *  IMPORTANT: This library relies on the following external dependencies, which must be loaded
 *             before JTab can function correctly:
 *    - jQuery   :  http://www.jquery.com/  (A fast, small, and feature-rich JavaScript library)
 *    - Raphael  :  http://raphaeljs.com/   (A JavaScript Vector Library for working with vector graphics)
 *
 *
 *  LICENSE INFORMATION:
 *  This library is free software; you are permitted to redistribute it and/or modify it
 *  under the terms of the GNU Lesser General Public License as published by the Free Software Foundation;
 *  either version 2.1 of the License, or (at your discretion) any subsequent version.
 *
 *  WARRANTY DISCLAIMER:
 *  This library is distributed with the expectation that it will be useful, but it comes
 *  WITHOUT ANY WARRANTY WHATSOEVER; this includes, but is not limited to, the implied
 *  warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *  Refer to the GNU Lesser General Public License for a more detailed understanding of these terms.
 *
 *  LICENSE ACQUISITION:
 *  Should you not have received a copy of the GNU Lesser General Public License alongside this library,
 *  please direct your correspondence to the Free Software Foundation, Inc.,
 *  located at 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA.
 *
 */


//
//  Initializing the core 'jtab' object.
//  This object encapsulates all JTab functionalities and data.
//

var jtab = {

  Version: '1.3.1', // Current version of the JTab library

  element_count: 0, // Counter for tracking jtab elements on the page. (TODO: Review necessity)


  Strings: {
    // HTML content for the 'About jTab' dialog box.
    // {V} is a placeholder for the version number.
    AboutDialog: '<html><head><title>About jTab</title></head><body style=""><p style="">jTab version: {V}</p><p><a href="http://jtab.tardate.com" target="_blank">http://jtab.tardate.com</a></p><p><input type="button" class="close" value="OK" onClick="window.close()"/></p></body></html>'
  },


  Chords: {
    // Chord data repository.
    // Currently optimized for 6-string guitar, standard tuning only.
    // Each chord definition is an array of alternate positions.
    //
    // Position array structure:
    //   0   :  The 1st (open) position.
    //   1   :  The 1st barre position, commonly around the 12th/13th/14th fret.
    //          This is primarily for CAGED chords that use open strings in their
    //          open position, enabling barre fingering alternatives.
    //   2.. :  Additional alternative positions or fingerings.
    //
    // Each individual position is an array containing:
    //   1. Base fret (0 indicates the nut).
    //   2. Six note definitions (for strings 6, 5, 4, 3, 2, 1, respectively).
    //
    // Each note definition is an array: [fret position], [left hand fingering (1,2,3,4,T) if applicable].
    // Fret position values:
    //   -1 = muted/not played string.
    //    0 = open string.
    //    1,2,3... = specific fret position.

    C:       [ [ 0, [-1 ],  [3,3],  [2,2],  [0  ],  [1,1],  [0  ] ], [ 12, [-1,-1],  [15,4],  [14,3],  [12,1],  [13,2],  [12,1 ] ] ],
    Cm:      [ [ 0, [-1 ],  [3,4],  [1,2],  [0  ],  [1,1],  [-1 ] ], [ 12, [-1,-1],  [15,4],  [13,3],  [12,1],  [13,2],  [-1,-1] ] ],
    C6:      [ [ 0, [-1 ],  [0  ],  [2,2],  [2,3],  [1,1],  [3,4] ], [ 12, [-1,-1],  [12,1],  [14,3],  [14,3],  [13,2],  [15,4] ] ],
    Cm6:     [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [3,4] ], [  ] ],
    C69:     [ [ 0, [-1 ],  [3,2],  [2,1],  [2,1],  [3,3],  [3,4] ], [  ] ],
    C7:      [ [ 0, [-1 ],  [3,3],  [2,2],  [3,4],  [1,1],  [0  ] ], [ 12, [-1,-1],  [15,3],  [14,2],  [15,4],  [13,1],  [12,  ] ] ],
    Cm7:     [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,3],  [1,1],  [3,4] ], [  ] ],
    Cmaj7:   [ [ 0, [-1 ],  [3,3],  [2,2],  [0  ],  [0  ],  [0  ] ], [ 12, [-1,-1],  [15,4],  [14,3],  [12,1],  [12,1],  [12,1] ] ],
    C7b5:    [ [ 2, [-1 ],  [3,1],  [4,3],  [3,2],  [5,4],  [-1 ] ], [  ] ],
    "C7#5":  [ [ 0, [-1 ],  [-1 ],  [2,2],  [3,3],  [1,1],  [4,4] ], [  ] ],
    "Cm7b5": [ [ 0, [-1 ],  [3,1],  [4,3],  [3,2],  [4,4],  [-1 ] ], [  ] ],
    C7b9:    [ [ 0, [-1 ],  [3,3],  [2,1],  [3,4],  [2,2],  [0  ] ], [  ] ],
    C9:      [ [ 0, [-1 ],  [3,2],  [2,1],  [3,3],  [3,4],  [-1 ] ], [  ] ],
    Cm9:     [ [ 0, [-1 ],  [3,2],  [1,1],  [3,3],  [3,3],  [3,3] ], [  ] ],
    Cmaj9:   [ [ 0, [-1 ],  [3,3],  [0  ],  [0  ],  [0  ],  [0  ] ], [ 12, [-1 ],  [15,3],  [12,1],  [12,1],  [12,1],  [12,1] ] ],
    Cadd9:   [ [ 0, [-1 ],  [3,2],  [2,1],  [0  ],  [3,3],  [0  ] ], [ 12, [-1 ],  [15,3],  [14,2],  [12,1],  [15,4],  [12,1] ] ],
    C13:     [ [ 2, [-1 ],  [3,1],  [5,2],  [3,1],  [5,3],  [5,4] ], [  ] ],
    Csus2:   [ [ 2, [ -1],  [3,1],  [5,3],  [5,4],  [3,1],  [3,1] ], [  ] ],
    Csus4:   [ [ 2, [ -1],  [3,1],  [5,2],  [5,3],  [6,4],  [3,1] ], [  ] ],
    Cdim:    [ [ 0, [-1 ],  [3,3],  [4,4],  [2,2],  [1,1],  [-1 ] ], [  ] ],
    Cdim7:   [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ], [  ] ],
    Caug:    [ [ 0, [-1 ],  [-1 ],  [2,2],  [1,1],  [1,1],  [4,4] ], [  ] ],


    "C#":    [ [ 0, [-1 ],  [4,4],  [3,4],  [1,1],  [2,2],  [1,1] ], [  ] ],
    "C#m":   [ [ 0, [-1 ],  [-1 ],  [2,2],  [1,1],  [2,3],  [0  ] ], [  ] ],
    "C#6":   [ [ 0, [-1 ],  [-1 ],  [3,2],  [3,3],  [2,1],  [4,4] ], [  ] ],
    "C#m6":  [ [ 0, [-1 ],  [4,3],  [2,1],  [3,2],  [2,1],  [4,4] ], [  ] ],
    "C#69":  [ [ 2, [-1 ],  [4,2],  [3,1],  [3,1],  [4,3],  [4,4] ], [  ] ],
    "C#7":   [ [ 0, [-1 ],  [-1 ],  [3,2],  [4,3],  [2,1],  [4,4] ], [  ] ],
    "C#m7":  [ [ 0, [-1 ],  [-1 ],  [2,1],  [4,3],  [2,1],  [4,4] ], [  ] ],
    "C#maj7":[ [ 0, [-1 ],  [4,4],  [3,3],  [1,1],  [1,1],  [1,1] ], [  ] ],
    "C#7b5": [ [ 0, [3,2],  [0  ],  [3,3],  [4,4],  [2,1],  [-1 ] ], [  ] ],
    "C#7#5": [ [ 0, [-1 ],  [4,3],  [3,2],  [2,1],  [0  ],  [-1 ] ], [  ] ],
    "C#m7b5":[ [ 0, [-1 ],  [2,1],  [2,2],  [0  ],  [2,3],  [0  ] ], [  ] ],
    "C#7b9": [ [ 0, [-1 ],  [4,2],  [3,1],  [4,3],  [3,1],  [4,4] ], [  ] ],
    "C#9":   [ [ 3, [-1 ],  [4,1],  [6,2],  [6,3],  [4,1],  [4,1] ], [  ] ],
    "C#m9":  [ [ 0, [0  ],  [2,2],  [1,1],  [1,1],  [2,3],  [0  ] ], [  ] ],
    "C#maj9":[ [ 0, [-1 ],  [4,4],  [1,1],  [1,1],  [1,1],  [1,1] ], [  ] ],
    "C#add9":[ [ 0, [1,1],  [-1 ],  [1,1],  [1,1],  [2,2],  [1,1] ], [  ] ],
    "C#13":  [ [ 3, [-1 ],  [4,1],  [6,2],  [4,1],  [6,3],  [6,4] ], [  ] ],
    "C#sus2":[ [ 0, [-1 ],  [-1 ],  [3,3],  [3,4],  [1,1],  [1,1] ], [  ] ],
    "C#sus4":[ [ 0, [-1 ],  [-1 ],  [3,2],  [3,3],  [4,4],  [1,1] ], [  ] ],
    "C#dim": [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ], [  ] ],
    "C#dim7":[ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ], [  ] ],
    "C#aug": [ [ 0, [-1 ],  [4,4],  [3,3],  [2,1],  [2,2],  [-1 ] ], [  ] ],


    D:       [ [ 0, [-1 ],  [0  ],  [0  ],  [2,1],  [3,3],  [2,2] ], [ 12, [-1,-1],  [12,1],  [12,1],  [14,3],  [15,4],  [14,2] ] ],
    Dm:      [ [ 0, [-1 ],  [0  ],  [0  ],  [2,2],  [3,3],  [1,1] ], [ 12, [-1,-1],  [12,1],  [12,1],  [14,3],  [15,4],  [13,2] ] ],
    D6:      [ [ 0, [-1 ],  [0  ],  [0  ],  [2,2],  [0  ],  [2,3] ], [ 12, [-1,-1],  [12,1],  [12,1],  [14,3],  [12,1],  [14,4] ] ],
    Dm6:     [ [ 0, [-1 ],  [2,2],  [0  ],  [2,3],  [0  ],  [1,1] ], [ 12, [-1,-1],  [14,3],  [12,1],  [14,4],  [12,1],  [1,2] ] ],
    D69:     [ [ 3, [-1 ],  [5,2],  [4,1],  [4,1],  [5,3],  [5,4] ], [  ] ],
    D7:      [ [ 0, [-1 ],  [0  ],  [0  ],  [2,2],  [1,1],  [2,3] ], [ 12, [-1,-1],  [12,1],  [12,1],  [14,3],  [13,2],  [14,4] ] ],
    Dm7:     [ [ 0, [-1 ],  [-1 ],  [0  ],  [2,2],  [1,1],  [1,1] ], [ 12, [-1,-1],  [-1,-1], [12,1],  [14,4],  [13,2],  [13,3] ] ],
    Dmaj7:   [ [ 0, [-1 ],  [5,4],  [4,3],  [2,1],  [2,1],  [2,1] ], [  ] ],
    D7b5:    [ [ 4, [-1 ],  [5,1],  [6,3],  [5,2],  [7,4],  [-1 ] ], [  ] ],
    "D7#5":  [ [ 0, [-1 ],  [-1 ],  [0  ],  [4,3],  [1,1],  [2,2] ], [ 12, [-1,-1],  [-1,-1], [12,1],  [16,4],  [13,2],  [14,3] ] ],
    Dm7b5:   [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [1,1],  [1,1] ], [ 12, [-1,-1],  [-1,-1], [12,1],  [12,2],  [12,3],  [12,4] ] ],
    D7b9:    [ [ 3, [-1 ],  [5,2],  [4,1],  [5,3],  [4,1],  [5,4] ], [  ] ],
    D9:      [ [ 0, [2,2],  [-1 ],  [0  ],  [2,3],  [1,1],  [0  ] ], [ 12, [14,4 ],  [-1,-1],  [12,1],  [14,3],  [13,2],  [12,1] ] ],
    Dm9:     [ [ 0, [-1 ],  [-1 ],  [3,3],  [2,2],  [1,1],  [0  ] ], [ 12, [-1,-1],  [-1,-1],  [15,4],  [14,3],  [13,2],  [12,1] ] ],
    Dmaj9:   [ [ 0, [-1 ],  [5,4],  [2,1],  [2,1],  [2,1],  [2,1] ], [  ] ],
    Dadd9:   [ [ 0, [-1 ],  [-1 ],  [0  ],  [2,1],  [3,2],  [0  ] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [14,3],  [15,4],  [12,1] ] ],
    D13:     [ [ 4, [-1 ],  [5,1],  [7,2],  [5,1],  [7,3],  [7,4] ], [  ] ],
    Dsus2:   [ [ 0, [-1 ],  [-1 ],  [0  ],  [2,1],  [3,3],  [0  ] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [14,3],  [15,4],  [12,1] ] ],
    Dsus4:   [ [ 0, [-1 ],  [-1 ],  [0  ],  [2,1],  [3,3],  [3,4] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [14,2],  [15,3],  [15,4] ] ],
    Ddim:    [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [13,2],  [12,1],  [13,3] ] ],
    Ddim7:   [ [ 0, [-1 ],  [2,3],  [0  ],  [1,1],  [0  ],  [1,2] ], [ 12, [-1,-1],  [14,4],  [12,1],  [13,2],  [12,1],  [13,3] ] ],
    Daug:    [ [ 0, [-1 ],  [-1 ],  [0  ],  [3,2],  [3,3],  [2,1] ], [ 12, [-1,-1],  [-1,-1],  [12,1],  [15,3],  [15,4],  [14,2] ] ],


    "Eb":    [ [ 0, [-1 ],  [-1 ],  [5,4],  [3,1],  [4,3],  [3,2] ], [  ] ],
    "Ebm":   [ [ 0, [-1 ],  [-1 ],  [4,3],  [3,2],  [4,4],  [2,1] ], [  ] ],
    "Eb6":   [ [ 0, [-1 ],  [3,1],  [5,3],  [3,1],  [4,2],  [3,1] ], [  ] ],
    "Ebm6":  [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,3],  [1,1],  [2,2] ], [  ] ],
    "Eb69":  [ [ 0, [-1 ],  [-1 ],  [1,1],  [0  ],  [1,2],  [1,3] ], [  ] ],
    "Eb7":   [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,3],  [2,2],  [3,4] ], [  ] ],
    "Ebm7":  [ [ 0, [-1 ],  [-1 ],  [1,1],  [3,4],  [2,2],  [2,3] ], [  ] ],
    "Ebmaj7":[ [ 0, [-1 ],  [-1 ],  [1,1],  [3,2],  [3,3],  [3,4] ], [  ] ],
    "Eb7b5": [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,2],  [2,3],  [4,4] ] ],
    "Eb7#5": [ [ 0, [-1 ],  [-1 ],  [1,1],  [4,4],  [2,2],  [3,3] ] ],
    "Ebm7b5":[ [ 0, [-1 ],  [-1 ],  [1,1],  [2,2],  [2,3],  [2,4] ] ],
    "Eb7b9": [ [ 0, [-1 ],  [-1 ],  [1,1],  [0  ],  [2,3],  [0  ] ] ],
    "Eb9":   [ [ 0, [3,4],  [1,1],  [1,1],  [0  ],  [2,1],  [1,1] ] ],
    "Ebm9":  [ [ 0, [2,2],  [1,1],  [1,1],  [3,4],  [2,3],  [1,1] ] ],
    "Ebmaj9":[ [ 0, [-1 ],  [-1 ],  [1,1],  [0  ],  [3,4],  [1,2] ] ],
    "Ebadd9":[ [ 0, [3,4],  [2,2],  [2,2],  [0  ],  [-1 ],  [1,1] ] ],
    "Eb13":  [ [ 4, [-1 ],  [6,2],  [5,1],  [6,3],  [8,4],  [8,4] ] ],
    "Ebsus2":[ [ 0, [1,1],  [1,1],  [1,1],  [3,3],  [-1 ],  [1,1] ] ],
    "Ebsus4":[ [ 0, [-1 ],  [-1 ],  [1,1],  [3,3],  [4,4],  [4,4] ] ],
    "Ebdim": [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    "Ebdim7":[ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    "Ebaug": [ [ 0, [3,3],  [2,2],  [1,1],  [0  ],  [0  ],  [3,4] ] ],

    E:       [ [ 0, [ 0 ],  [2,2],  [2,3],  [1,1],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,3],  [14,4],  [13,2],  [12,1],  [12,1] ] ],
    Em:      [ [ 0, [ 0 ],  [2,2],  [2,3],  [0  ],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,3],  [14,4],  [12,1],  [12,1],  [12,1] ] ],
    E6:      [ [ 0, [ 0 ],  [2,2],  [2,3],  [1,1],  [2,4],  [0  ] ], [ 12, [ 12,1],  [14,3],  [14,3],  [13,2],  [14,4],  [12,1] ] ],
    Em6:     [ [ 0, [ 0 ],  [2,1],  [2,2],  [0  ],  [2,3],  [0  ] ], [ 12, [ 12,1],  [14,2],  [14,3],  [12,1],  [14,4],  [12,1] ] ],
    E69:     [ [ 0, [-1 ],  [2,2],  [2,2],  [1,1],  [2,3],  [2,3] ], [  ] ],
    E7:      [ [ 0, [ 0 ],  [2,2],  [0  ],  [1,1],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,3],  [12,1],  [13,2],  [12,1],  [12,1] ] ],
    Em7:     [ [ 0, [ 0 ],  [2,2],  [2,3],  [0  ],  [3,4],  [0  ] ], [ 12, [ 12,1],  [14,2],  [14,3],  [12,1],  [15,4],  [12,1] ] ],
    Emaj7:   [ [ 0, [ 0 ],  [2,3],  [1,1],  [1,2],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,4],  [13,2],  [13,3],  [12,1],  [12,1] ] ],
    E7b5:    [ [ 0, [-1 ],  [1,1],  [0  ],  [1,2],  [3,4],  [0  ] ], [ 12, [-1,-1],  [13,2],  [12,1],  [13,3],  [15,4],  [12,1] ] ],
    "E7#5":  [ [ 0, [0  ],  [3,4],  [0  ],  [1,1],  [1,2],  [-1 ] ], [ 12, [ 12,1],  [15,4],  [12,1],  [13,3],  [13,2],  [-1 ] ] ],
    Em7b5:   [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,2],  [3,3],  [3,4] ], [  ] ],
    E7b9:    [ [ 0, [0  ],  [2,3],  [0  ],  [1,1],  [0  ],  [1,2] ], [ 12, [ 12,1],  [14,4],  [12,1],  [13,3],  [12,1],  [13,2] ] ],
    E9:      [ [ 0, [0  ],  [2,2],  [0  ],  [1,1],  [0  ],  [2,3] ], [ 12, [ 12,1],  [14,3],  [12,1],  [13,2],  [12,1],  [14,4] ] ],
    Em9:     [ [ 0, [0  ],  [2,1],  [0  ],  [0  ],  [0  ],  [2,2] ], [ 12, [ 12,1],  [14,2],  [12,1],  [12,1],  [12,1],  [14,4] ] ],
    Emaj9:   [ [ 0, [0  ],  [2,2],  [1,1],  [1,1],  [0  ],  [2,4] ], [ 12, [ 12,1],  [14,3],  [13,2],  [13,2],  [12,1],  [14,4] ] ],
    Eadd9:   [ [ 0, [2,2],  [2,3],  [2,4],  [1,1],  [0  ],  [0  ] ], [ 12, [ 14,3],  [14,3],  [14,4],  [13,2],  [12,1],  [12,1] ] ],
    E13:     [ [ 0, [0  ],  [2,2],  [0  ],  [1,1],  [2,3],  [0  ] ], [ 12, [ 12,1],  [14,3],  [12,1],  [13,2],  [14,4],  [12,1] ] ],
    Esus2:   [ [ 0, [ -1],  [2,1],  [4,3],  [4,4],  [-1 ],  [0  ] ], [ 12, [ -1,-1],  [14,2],  [16,3],  [16,4],  [-1 ],  [12,1] ] ],
    Esus4:   [ [ 0, [ 0 ],  [2,2],  [2,3],  [2,4],  [0  ],  [0  ] ], [ 12, [ 12,1],  [14,2],  [14,3],  [14,4],  [12,1],  [12,1] ] ],
    Edim:    [ [ 0, [-1 ],  [1,1],  [2,2],  [3,4],  [2,3],  [-1 ] ], [  ] ],
    Edim7:   [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ], [  ] ],
    Eaug:    [ [ 0, [ 0 ],  [3,4],  [2,3],  [1,1],  [1,2],  [0  ] ], [ 12, [ 12,1],  [15,4],  [14,3],  [13,2],  [13,2],  [12,1] ] ],

    F:       [ [ 0, [1,1],  [3,3],  [3,4],  [2,2],  [1,1],  [1,1] ], [  ] ],
    Fm:      [ [ 0, [1,1],  [3,3],  [3,4],  [1,1],  [1,1],  [1,1] ], [  ] ],
    F6:      [ [ 0, [-1 ],  [3,2],  [3,3],  [2,1],  [3,4],  [-1 ] ], [  ] ],
    Fm6:     [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [1,1],  [1,1] ], [  ] ],
    F69:     [ [ 0, [1,1],  [0  ],  [0  ],  [0  ],  [1,2],  [1,3] ], [  ] ],
    F7:      [ [ 0, [1,1],  [3,3],  [1,1],  [2,2],  [1,1],  [1,1] ], [  ] ],
    Fm7:     [ [ 0, [1,1],  [3,3],  [3,4],  [1,1],  [4,4],  [1,1] ], [  ] ],
    Fmaj7:   [ [ 0, [1,1],  [-1 ],  [2,3],  [2,4],  [1,2],  [-1 ] ], [  ] ],
    F7b5:    [ [ 0, [1,1],  [-1 ],  [1,2],  [2,3],  [0  ],  [-1 ] ], [  ] ],
    "F7#5":  [ [ 0, [1,1],  [-1 ],  [1,2],  [2,3],  [2,4],  [-1 ] ], [  ] ],
    Fm7b5:   [ [ 2, [-1 ],  [-1 ],  [3,1],  [4,2],  [4,3],  [4,4] ], [  ] ],
    F7b9:    [ [ 0, [-1 ],  [-1 ],  [3,2],  [2,1],  [4,4],  [2,1] ], [  ] ],
    F9:      [ [ 0, [3,3],  [0  ],  [3,4],  [2,2],  [1,1],  [1,1] ], [  ] ],
    Fm9:     [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [3,4] ], [  ] ],
    Fmaj9:   [ [ 0, [0  ],  [0  ],  [3,3],  [0  ],  [1,1],  [3,4] ] ],
    Fadd9:   [ [ 0, [-1 ],  [-1 ],  [3,3],  [2,2],  [1,1],  [3,4] ] ],
    F13:     [ [ 0, [1,1],  [0  ],  [1,2],  [3,4],  [3,4],  [3,4] ] ],
    Fsus2:   [ [ 0, [-1 ],  [3,3],  [3,4],  [0  ],  [1,1],  [1,1] ] ],
    Fsus4:   [ [ 0, [1,1],  [3,2],  [3,3],  [3,4],  [1,1],  [1,1] ] ],
    Fdim:    [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    Fdim7:   [ [ 0, [-1 ],  [2,3],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    Faug:    [ [ 0, [1,1],  [-1 ],  [3,4],  [2,2],  [2,3],  [1,1] ] ],

    "F#":    [ [ 0, [2,1],  [4,3],  [4,4],  [3,2],  [2,1],  [2,1] ] ],
    "F#m":   [ [ 0, [2,1],  [4,3],  [4,4],  [2,1],  [2,1],  [2,1] ] ],
    "F#6":   [ [ 0, [2,1],  [4,3],  [-1 ],  [3,2],  [4,4],  [-1 ] ] ],
    "F#m6":  [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,2],  [2,3],  [2,4] ] ],
    "F#69":  [ [ 0, [2,2],  [1,1],  [1,1],  [1,1],  [2,3],  [2,4] ] ],
    "F#7":   [ [ 0, [2,1],  [4,3],  [2,1],  [3,2],  [2,1],  [2,1] ] ],
    "F#m7":  [ [ 0, [2,1],  [4,3],  [4,4],  [2,1],  [5,4],  [2,1] ] ],
    "F#maj7":[ [ 0, [2,1],  [-1 ],  [3,3],  [3,4],  [2,2],  [-1 ] ] ],
    "F#7b5": [ [ 0, [2,2],  [-1 ],  [2,3],  [3,4],  [1,1],  [-1 ] ] ],
    "F#7#5": [ [ 0, [2,2],  [-1 ],  [2,3],  [3,4],  [3,4],  [-1 ] ] ],
    "F#m7b5":[ [ 0, [-1 ],  [-1 ],  [2,2],  [2,3],  [1,1],  [2,4] ] ],
    "F#7b9": [ [ 0, [2,2],  [1,1],  [2,3],  [0  ],  [2,4],  [0  ] ] ],
    "F#9":   [ [ 0, [2,1],  [4,3],  [2,1],  [3,2],  [2,1],  [4,4] ] ],
    "F#m9":  [ [ 0, [3,3],  [0  ],  [3,4],  [1,1],  [2,3],  [2,3] ] ],
    "F#maj9":[ [ 0, [2,1],  [-1 ],  [3,2],  [3,3],  [-1 ],  [4,4] ] ],
    "F#add9":[ [ 0, [2,2],  [1,1],  [-1 ],  [1,1],  [2,3],  [2,4] ] ],
    "F#13":  [ [ 0, [2,1],  [4,3],  [2,1],  [3,2],  [4,4],  [2,1] ] ],
    "F#sus2":[ [ 0, [2,2],  [-1 ],  [-1 ],  [1,1],  [2,3],  [2,4] ] ],
    "F#sus4":[ [ 0, [2,1],  [4,2],  [4,3],  [4,4],  [2,1],  [2,1] ] ],
    "F#dim": [ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    "F#dim7":[ [ 0, [-1 ],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ] ],
    "F#aug": [ [ 0, [2,1],  [-1 ],  [4,4],  [3,2],  [3,3],  [2,1] ] ],

    G:       [ [ 0, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [3,4] ], [ 12, [15,3], [14,2], [12,1], [12,1], [12,1], [15,4] ] ],
    Gm:      [ [ 0, [3,2],  [1,1],  [0  ],  [0  ],  [3,3],  [3,4] ], [ 12, [15,3], [13,2], [12,1], [12,1], [15,4], [15,4] ] ],
    G6:      [ [ 0, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [0  ] ], [ 12, [15,4],  [14,3],  [12,1],  [12,1],  [12,1],  [12,1] ] ],
    Gm6:     [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [3,3],  [3,3] ], [  ] ],
    G69:     [ [ 0, [3,3],  [2,1],  [0  ],  [2,2],  [0  ],  [0  ] ], [ 12, [15,4],  [14,3],  [12,1],  [14,2],  [12,1],  [12,1] ] ],
    G7:      [ [ 0, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [1,1] ], [ 12, [15,4],  [14,3],  [12,1],  [12,1],  [12,1],  [13,2] ] ],
    Gm7:     [ [ 0, [-1 ],  [1,1],  [3,3],  [0  ],  [3,4],  [-1 ] ], [ 12, [-1 ],  [13,2],  [15,3],  [12,1],  [15,4],  [-1 ] ] ],
    Gmaj7:   [ [ 0, [3,3],  [2,2],  [0  ],  [0  ],  [0  ],  [2,1] ], [ 12, [15,3],  [14,2],  [12,1],  [12,1],  [12,1],  [14,4] ] ],
    "G7b5":  [ [ 0, [3,2],  [-1 ],  [3,3],  [4,4],  [2,1],  [-1 ] ], [  ], [ 4, [-1 ],  [-1 ],  [5,1],  [6,2],  [6,3],  [7,4] ] ],
    "G7#5":  [ [ 0, [3,1],  [-1 ],  [3,2],  [4,3],  [4,4],  [-1 ] ], [  ] ],
    Gm7b5:   [ [ 2, [3,1],  [4,2],  [3,1],  [3,1],  [6,4],  [3,1] ], [  ] ],
    G7b9:    [ [ 0, [3,4],  [2,3],  [0  ],  [1,1],  [0  ],  [1,2] ], [ 12, [15,4],  [14,3],  [12,1],  [13,2],  [12,1],  [13,] ] ],
    G9:      [ [ 0, [3,3],  [-1 ],  [0  ],  [2,2],  [0  ],  [1,1] ], [ 12, [15,4],  [-1 ],  [12,1],  [14,3],  [12,1],  [13,2] ] ],
    Gm9:     [ [ 2, [3,1],  [5,3],  [3,1],  [3,1],  [3,1],  [5,4] ], [  ] ],
    Gmaj9:   [ [ 0, [3,3],  [-1 ],  [0  ],  [2,1],  [0  ],  [2,2] ], [ 12, [15,4],  [-1 ],  [12,1],  [14,3],  [12,1],  [14,2] ] ],
    Gadd9:   [ [ 0, [3,2],  [0  ],  [0  ],  [0  ],  [0  ],  [3,3] ], [ 12, [15,3],  [12,1],  [12,1],  [12,1],  [12,1],  [15,4] ] ],
    G13:     [ [ 0, [3,2],  [2,1],  [3,3],  [0  ],  [0  ],  [0  ] ], [ 12, [15,3],  [14,2],  [15,3],  [12,1],  [12,1],  [12,1] ] ],
    Gsus2:   [ [ 0, [3,1],  [0  ],  [0  ],  [0  ],  [3,3],  [3,4] ], [ 12, [15,2],  [12,1],  [12,1],  [12,1],  [15,3],  [15,4] ] ],
    Gsus4:   [ [ 2, [3,1],  [5,2],  [5,3],  [5,4],  [3,1],  [3,1] ], [  ] ],
    Gdim:    [ [ 2, [-1 ],  [-1 ],  [5,2],  [6,4],  [5,3],  [3,1] ], [  ] ],
    Gdim7:   [ [ 0, [-1 ],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ], [  ] ],
    Gaug:    [ [ 0, [3,1],  [-1 ],  [5,4],  [4,2],  [4,3],  [3,1] ], [  ] ],

    "G#":    [ [ 0, [4,4],  [3,3],  [1,1],  [1,1],  [1,1],  [-1 ] ] ],
    "G#m":   [ [ 0, [-1 ],  [2,2],  [1,1],  [1,1],  [4,4],  [4,4] ] ],
    "G#6":   [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [1,1] ] ],
    "G#m6":  [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,2],  [0  ],  [1,3] ] ],
    "G#69":  [ [ 0, [4,2],  [3,1],  [3,1],  [3,1],  [4,3],  [4,4] ] ],
    "G#7":   [ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [2,2] ] ],
    "G#m7":  [ [ 3, [4,1],  [6,3],  [4,1],  [4,1],  [7,4],  [4,1] ] ],
    "G#maj7":[ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [1,1],  [3,3] ] ],
    "G#7b5": [ [ 2, [4,2],  [-1 ],  [4,3],  [5,4],  [3,2],  [-1 ] ] ],
    "G#7#5": [ [ 3, [4,1],  [-1 ],  [4,2],  [5,3],  [5,4],  [-1 ] ] ],
    "G#m7b5":[ [ 0, [4,1],  [5,2],  [4,1],  [4,1],  [7,4],  [4,1] ] ],
    "G#7b9": [ [ 0, [4,3],  [3,2],  [4,4],  [2,1],  [-1 ],  [-1 ] ] ],
    "G#9":   [ [ 0, [2,2],  [1,1],  [1,1],  [1,1],  [1,1],  [2,4] ] ],
    "G#m9":  [ [ 0, [2,2],  [1,1],  [1,1],  [1,1],  [0  ],  [2,4] ] ],
    "G#maj9":[ [ 2, [4,2],  [3,1],  [5,4],  [3,1],  [4,3],  [-1 ] ] ],
    "G#add9":[ [ 0, [-1 ],  [1,1],  [1,1],  [1,1],  [1,1],  [-1 ] ] ],
    "G#13":  [ [ 0, [4,3],  [3,2],  [4,4],  [1,1],  [1,1],  [1,1] ] ],
    "G#sus2":[ [ 0, [-1 ],  [1,1],  [1,2],  [1,3],  [-1 ],  [-1 ] ] ],
    "G#sus4":[ [ 0, [-1 ],  [-1 ],  [1,1],  [1,1],  [2,2],  [4,4] ] ],
    "G#dim": [ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    "G#dim7":[ [ 0, [-1 ],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    "G#aug": [ [ 0, [0,-1], [3,4],  [2,3],  [1,1],  [1,2],  [0,-1] ] ],

    A:       [ [ 0, [-1],  [0  ],  [2,2],  [2,1],  [2,3],  [0  ] ], [ 12, [-1,-1], [12,1], [14,2], [14,3], [14,4], [12,1] ] ],
    Am:      [ [ 0, [-1],  [0  ],  [2,2],  [2,3],  [1,1],  [0  ] ], [ 12, [-1,-1], [12,1], [14,3], [14,4], [13,2], [12,1] ] ],
    A6:      [ [ 0, [-1],  [0  ],  [2,1],  [2,1],  [2,1],  [2,1] ], [ 12, [-1,-1], [12,1], [14,3], [14,3], [14,3], [14,3] ] ],
    Am6:     [ [ 0, [-1],  [0  ],  [2,2],  [2,3],  [1,1],  [2,4] ], [ 12, [-1,-1], [12,1], [14,3], [14,3], [13,2], [14,4] ] ],
    A69:     [ [ 3, [5,2], [4,1],  [4,1],  [4,1],  [5,3],  [5,4] ], [  ] ],
    A7:      [ [ 0, [-1],  [0  ],  [2,2],  [0  ],  [2,3],  [0  ] ], [ 12, [-1,-1], [12,1], [14,2], [12,1], [14,3], [12,1] ] ],
    Am7:     [ [ 0, [-1],  [0  ],  [2,2],  [0  ],  [1,1],  [0  ] ], [ 12, [-1,-1], [12,1], [14,3], [12,1], [13,2], [12,1] ] ],
    Amaj7:   [ [ 0, [-1],  [0  ],  [2,2],  [1,1],  [2,3],  [0  ] ], [ 12, [-1,-1], [12,1], [14,3], [13,2], [14,4], [12,1] ] ],
    A7b5:    [ [ 3, [5,2], [-1 ],  [5,3],  [6,4],  [4,1],  [-1 ] ], [  ] ],
    "A7#5":  [ [ 4, [5,1], [-1 ],  [5,2],  [6,3],  [6,4],  [-1 ] ], [  ] ],
    Am7b5:   [ [ 0, [-1],  [-1 ],  [1,1],  [2,3],  [1,2],  [3,4] ], [  ] ],
    A7b9:    [ [ 0, [-1],  [0  ],  [2,1],  [3,3],  [2,2],  [3,4] ], [ 12, [-1,-1], [12,''],  [14,1],  [15,3],  [14,2],  [15,4] ] ],
    A9:      [ [ 0, [-1],  [0  ],  [2,1],  [4,4],  [2,2],  [3,3] ], [ 12, [-1],  [12,],  [14,1],  [16,4],  [14,2],  [15,3] ] ],
    Am9:     [ [ 0, [-1],  [0  ],  [1,1],  [1,1],  [1,1],  [3,4] ], [ 12, [-1],  [12,1],  [13,2],  [13,2],  [13,2],  [15,4] ] ],
    Amaj9:   [ [ 0, [-1],  [0  ],  [2,1],  [4,3],  [2,1],  [4,4] ], [ 12, [-1],  [12,  ],  [14,1],  [16,3],  [14,1],  [16,4] ] ],
    Aadd9:   [ [ 0, [-1],  [0  ],  [2,2],  [2,3],  [0  ],  [0  ] ], [ 12, [-1],  [12,1],  [14,3],  [14,4],  [12,1],  [12,1] ] ],
    A13:     [ [ 0, [-1],  [0  ],  [2,1],  [0  ],  [2,2],  [3,3] ], [ 12, [-1],  [12,1],  [14,2],  [12,1],  [14,3],  [15,4] ] ],
    Asus2:   [ [ 0, [-1],  [0  ],  [2,1],  [2,2],  [0  ],  [0  ] ], [ 12, [-1],  [12,1],  [14,3],  [14,4],  [12,1],  [12,1] ] ],
    Asus4:   [ [ 0, [-1],  [0  ],  [2,1],  [2,2],  [3,3],  [0  ] ], [ 12, [-1],  [12,1],  [14,2],  [14,3],  [15,4],  [12,1] ] ],
    Adim:    [ [ 0, [-1],  [0  ],  [1,1],  [2,3],  [1,2],  [-1 ] ], [ 12, [-1],  [12,1],  [13,2],  [14,4],  [13,3],  [-1 ] ] ],
    Adim7:   [ [ 0, [-1],  [-1 ],  [1,1],  [2,3],  [1,2],  [2,4] ], [  ] ],
    Aaug:    [ [ 0, [-1],  [0  ],  [3,4],  [2,2],  [2,3],  [1,1] ], [ 12, [-1],  [12,],  [15,4],  [14,2],  [14,3],  [13,1] ] ],

    "Bb":    [ [ 0, [-1],  [1,1],  [3,3],  [3,3],  [3,3],  [1,1] ] ],
    "Bbm":   [ [ 0, [-1],  [1,1],  [3,3],  [3,4],  [2,2],  [1,1] ] ],
    "Bb6":   [ [ 0, [-1],  [1,1],  [3,3],  [3,3],  [3,3],  [3,3] ] ],
    "Bbm6":  [ [ 0, [-1],  [1,1],  [3,3],  [0  ],  [2,2],  [-1 ] ] ],
    "Bb69":  [ [ 0, [-1],  [1,1],  [0  ],  [0  ],  [1,2],  [1,3] ] ],
    "Bb7":   [ [ 0, [-1],  [1,1],  [3,3],  [1,1],  [4,4],  [1,1] ] ],
    "Bbm7":  [ [ 0, [-1],  [1,1],  [3,3],  [1,1],  [2,2],  [1,1] ] ],
    "Bbmaj7":[ [ 0, [-1],  [1,1],  [3,3],  [2,2],  [3,4],  [1,1] ] ],
    "Bb7b5": [ [ 4, [6,2], [-1 ],  [6,3],  [7,4],  [5,1],  [-1 ] ] ],
    "Bb7#5": [ [ 5, [6,1], [-1 ],  [6,2],  [7,3],  [7,4],  [-1 ] ] ],
    "Bbm7b5":[ [ 0, [-1],  [1,1],  [-1 ],  [1,2],  [2,3],  [-1 ] ] ],
    "Bb7b9": [ [ 6, [-1],  [-1 ],  [8,2],  [7,1],  [9,4],  [7,1] ] ],
    "Bb9":   [ [ 0, [1,1], [1,2],  [0  ],  [1,3],  [1,3],  [1,3] ] ],
    "Bbm9":  [ [ 5, [-1],  [-1 ],  [-1 ],  [6,1],  [6,1],  [8,4] ] ],
    "Bbmaj9":[ [ 0, [-1],  [1,1],  [0  ],  [2,4],  [1,2],  [1,3] ] ],
    "Bbadd9":[ [ 0, [1,1], [1,1],  [0  ],  [3,4],  [1,1],  [1,1] ] ],
    "Bb13":  [ [ 0, [-1 ], [1,1],  [0  ],  [1,2],  [3,4],  [3,4] ] ],
    "Bbsus2":[ [ 0, [-1],  [1,1],  [3,3],  [3,4],  [1,1],  [1,1] ] ],
    "Bbsus4":[ [ 0, [-1],  [1,1],  [3,2],  [3,3],  [4,4],  [1,1] ] ],
    "Bbdim": [ [ 0, [-1],  [1,1],  [2,2],  [3,4],  [2,3],  [-1 ] ] ],
    "Bbdim7":[ [ 0, [-1],  [-1 ],  [2,1],  [3,3],  [2,2],  [3,4] ] ],
    "Bbaug": [ [ 0, [-1],  [1,1],  [4,4],  [3,2],  [3,3],  [2,1] ] ],

    B:       [ [ 0, [ -1], [2,1],  [4,3],  [4,3],  [4,3],  [2,1] ] ],
    Bm:      [ [ 0, [ -1], [2,1],  [4,3],  [4,4],  [3,2],  [2,1] ] ],
    B6:      [ [ 0, [ -1], [2,1],  [4,3],  [4,3],  [4,3],  [4,3] ] ],
    Bm6:     [ [ 0, [ -1], [-1 ],  [4,2],  [4,3],  [3,1],  [4,4] ] ],
    B69:     [ [ 0, [ -1], [2,2],  [1,1],  [1,1],  [2,3],  [2,4] ] ],
    B7:      [ [ 0, [ -1], [2,2],  [1,1],  [2,3],  [0  ],  [2,4] ] ],
    Bm7:     [ [ 0, [ -1], [2,2],  [0  ],  [2,3],  [0  ],  [2,4] ] ],
    Bmaj7:   [ [ 0, [ -1], [2,1],  [4,3],  [3,2],  [4,4],  [2,1] ] ],
    B7b5:    [ [ 5, [7,2], [-1 ],  [7,3],  [8,4],  [6,1],  [-1 ] ] ],
    "B7#5":  [ [ 0, [ -1], [2,2],  [1,1],  [2,3],  [0  ],  [3,4] ] ],
    "Bm7b5": [ [ 0, [-1 ], [2,2],  [0  ],  [2,3],  [0  ],  [1,1] ] ],
    B7b9:    [ [ 0, [ -1], [2,2],  [1,1],  [2,3],  [1,1],  [2,4] ] ],
    B9:      [ [ 6, [7,1], [9,3],  [7,1],  [8,2],  [7,1],  [9,4] ] ],
    Bm9:     [ [ 0, [ -1], [2,1],  [0  ],  [2,2],  [2,3],  [2,4] ] ],
    Bmaj9:   [ [ 0, [ -1], [2,2],  [1,1],  [3,4],  [2,3],  [2,3] ] ],
    Badd9:   [ [ 0, [ -1], [2,1],  [4,3],  [4,4],  [2,1],  [2,1] ] ],
    B13:     [ [ 0, [-1 ], [2,2],  [1,1],  [2,3],  [0  ],  [4,4] ] ],
    Bsus2:   [ [ 0, [ -1], [2,1],  [4,3],  [4,4],  [2,1],  [2,1] ] ],
    Bsus4:   [ [ 0, [ -1], [2,1],  [4,2],  [4,3],  [5,4],  [2,1] ] ],
    Bdim:    [ [ 0, [-1],  [2,1],  [3,2],  [4,4],  [3,3],  [-1 ] ] ],
    Bdim7:   [ [ 0, [-1],  [-1 ],  [0  ],  [1,1],  [0  ],  [1,2] ] ],
    Baug:    [ [ 0, [-1],  [2,1],  [5,4],  [4,2],  [4,3],  [3,1] ] ]
  },


  WesternScale: {
    // Defines the western chromatic scale and mapping for chord root notes.
    BaseNotes: { // For each entry: [translated western scale note, CAGED base shape, base fret]
      'C':  ['C',  'C', 0],
      'C#': ['C#', 'C', 1],
      'Db': ['C#', 'C', 1], // Db treated as C#
      'D':  ['D',  'D', 0],
      'D#': ['Eb', 'D', 1], // D# treated as Eb
      'Eb': ['Eb', 'D', 1],
      'E':  ['E',  'E', 0],
      'F':  ['F',  'E', 1],
      'F#': ['F#', 'E', 2],
      'Gb': ['F#', 'E', 2], // Gb treated as F#
      'G':  ['G',  'G', 0],
      'G#': ['G#', 'G', 1],
      'Ab': ['G#', 'G', 1], // Ab treated as G#
      'A':  ['A',  'A', 0],
      'A#': ['Bb', 'A', 1], // A# treated as Bb
      'Bb': ['Bb', 'A', 1],
      'B':  ['B',  'A', 2]
    },
    BaseIntervals: ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'] // All 12 chromatic notes
  },


  ChordList: function() {
    // Generates a list of all defined chord names.
    var list = [];
    for (var key in jtab.Chords) {
      list.push(key);
    }
    return list;
  },


  /*
   *  Function: AddChord
   *  Purpose:  Allows dynamic addition or modification of chord definitions.
   *
   *  Usage:
   *    jtab.AddChord("ChordName", Chord-Array);
   *
   *  Example of Adding a new chord:
   *    jtab.AddChord("Dsus4l", [ [ 0, [-1 ],  [-1 ],  [3,2],  [2,1],  [3,3],  [3,4] ],
   *                               [ 12, [-1,-1],  [-1,-1],  [12,1],  [14,2],  [15,3],  [15,4] ] ]);
   *
   *  Example of Updating an existing chord:
   *    jtab.AddChord("A",      [ [ 0, [-1],  [0  ],  [2,3],  [2,2],  [2,1],  [0  ] ],
   *                               [ 12, [-1,-1], [12,1], [14,2], [14,3], [14,4], [12,1] ] ]);
   */
  AddChord: function(chordName, chord) {
    this.Chords[chordName] = chord;
  }
};


//
//  Extend Array prototype with utility functions.
//

Array.prototype.max_chars = function() {
  // Finds the maximum string length within an array of strings.
  var max = this[0].length;
  var len = this.length;
  for (var i = 1; i < len; i++)
    if (this[i].length > max)
      max = this[i].length;
  return max;
};


//
//  Definition of the 'jtabChord' class.
//  This class parses a chord token and provides access to its properties.
//
//  Public members available after instantiation:
//   - isValid         : Boolean, indicates if a valid chord was defined.
//   - isCaged         : Boolean, true if the chord uses CAGED notation (e.g., D:3).
//   - isCustom        : Boolean, true if the chord uses custom fingering notation (e.g., %X.3/2.2/1.0.1/1.0%).
//   - fullChordName   : The original chord token string (e.g., "D#m7:3").
//   - chordName       : The base chord name without position (e.g., "D#m7").
//   - baseName        : The translated chord name (e.g., "Ebm7" if root is D#).
//   - rootNote        : The root note of the chord (e.g., "D#").
//   - rootExt         : The chord extension (e.g., "m7").
//   - cagedBaseShape  : The CAGED base shape (e.g., "D" for a D-shape chord).
//   - cagedBaseFret   : The base fret for the CAGED shape (e.g., 0).
//   - cagedPos        : The CAGED position (e.g., 3).
//

function jtabChord(token) {

  this.scale = jtab.WesternScale; // Reference to the Western scale data.
  this.baseNotes = this.scale.BaseNotes; // Reference to base note mappings.
  this.baseChords = jtab.Chords; // Reference to the main chord data.
  this.chordArray = null; // Stores the resolved chord fingering array.
  this.isValid = false; // Flag for chord validity.

  this.fullChordName = token; // The original input token.

  // Check if the chord token signifies a custom fingering or a CAGED chord.
  this.isCustom = (this.fullChordName.match(/\%/) != null);
  this.isCaged = (this.fullChordName.match(/\:/) != null);


  if (this.isCaged) {
    // Parse CAGED chord: "ChordName:Position"
    var parts = this.fullChordName.split(':');
    this.chordName = parts[0];
    this.cagedPos = parts[1];
  } else if (this.isCustom) {
    // Parse custom chord: "%[ChordName]X.0.2.1.1.0%" or "%X.0.2.1.1.0%"
    var parts = this.fullChordName.match(/\[(.+?)\]/);
    if (parts) {
      this.chordName = parts[1]; // Extract optional chord name from custom notation.
    } else {
      this.chordName = ''; // No explicit chord name provided.
    }
  } else {
    // Standard chord name.
    this.chordName = this.fullChordName;
    this.cagedPos = 1; // Default position for non-CAGED chords.
  }

  // Extract root extension and root note.
  this.rootExt = this.chordName.replace(/^[A-G#b]{1,2}/, '');
  this.rootNote = this.chordName.substr(0, this.chordName.length - this.rootExt.length);

  // Retrieve base note information from the Western scale data.
  var baseNoteInfo = this.baseNotes[this.rootNote];

  if (baseNoteInfo) {
    this.baseName = baseNoteInfo[0] + this.rootExt; // Translated base name.
    this.cagedBaseShape = baseNoteInfo[1]; // CAGED shape (e.g., C, A, G, E, D).
    this.cagedBaseFret = baseNoteInfo[2]; // Base fret for the CAGED shape.
  } else {
    this.cagedBaseShape = ''; // Default empty.
    this.cagedBaseFret = 0; // Default to nut.
  }

  // Determine which method to use for setting the chord array based on its type.
  if ((this.isCaged) && (this.cagedPos > 1)) {
    this.setCagedChordArray();
  } else if (this.isCustom) {
    this.setCustomChordArray();
  } else {
    this.setChordArray(this.baseName);
  }
}


jtabChord.prototype.setCustomChordArray = function() {
  // Sets the chord array for custom-defined chords.
  this.chordArray = new Array(); // Initialize an empty array.
  this.chordArray = this.parseCustomChordArrayFromToken(); // Parse the custom token.
};


jtabChord.prototype.parseCustomChordArrayFromToken = function() {
  // Parses a custom chord token string (e.g., "%X.3/2.2/1.0.1/1.0%")
  // and converts it into a structured chord array.

  // Remove custom notation markers and optional chord name.
  var notes = this.fullChordName.replace(/(\%|\[.+\])/g, '');
  // Split into individual string definitions (e.g., "X", "3/2", "0").
  var pairs = notes.split('.');

  // A valid guitar chord must have 6 strings defined.
  if (pairs.length < 6) {
    this.isValid = false;
    return; // Return early if invalid.
  }

  this.isValid = true; // Mark as valid if enough strings are defined.

  var array = [];
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('/'); // Split fret/fingering.
    if (pair[0].match(/X/)) {
      pair = [-1]; // 'X' denotes a muted string.
    }
    array.push(pair);
  }

  // The commented-out code below is a historical artifact from previous versions,
  // likely Ruby/Rails-era 'collect', 'without', 'flatten' methods.
  // The jQuery-based replacement below achieves the same goal:
  // finding the minimum fret for fingered strings (excluding muted/open).

  // fingeredFrets = array.reject(function(p){
  //   return p.length === 1
  // }).collect(function(p){
  //   return parseInt(p[0])
  //   }).flatten().without(0,-1)

  // `array` is an array of string/fretnumber pairs like [0,1] or [-1] or [3].

  var fingeredFrets = jQuery.grep(array, function(pair) {
    // Filter for pairs that have two elements (fret and finger).
    return (pair.length != 1);
  }).map(function(pair) {
    // Extract the fret number and convert to integer.
    return parseInt(pair[0]);
  }).map(function(i) {
    // Filter out '0' (open) and '-1' (muted) frets.
    if ((i != 0) || (i != -1)) {
      return i;
    } else {
      return null; // Return null for non-fingered strings.
    }
  });

  // Remove null values from the array, leaving only actual fingered frets.
  fingeredFrets = jQuery.grep(fingeredFrets, function(n) {
    return (n); // Keep only truthy values (non-null, non-0).
  });

  // Find the minimum fret position among the fingered strings.
  // This helps determine the "base fret" for the custom chord diagram.
  var min = Math.min.apply(Math, fingeredFrets);

  // Prepend the calculated base fret (min - 1) to the array.
  // This simulates the 'base fret' property of standard chord arrays.
  array.unshift(min - 1);
  return array;
};


jtabChord.prototype.setChordArray = function(chordName) {
  // Clones the chord array (specifically, the first position)
  // from the main 'jtab.Chords' data into this object's 'chordArray' property.
  // This ensures that modifications to the chord array do not affect the original definition.
};