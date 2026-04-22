/*
 *   This file defines the Model for a single audio track within the application.
 *
 *   @file         Models.Track.js
 *   @author       Jan Myler <honza.myler[at]gmail.com>
 *   @copyright    Copyright 2012, Jan Myler (http://janmyler.com)
 *   @license      MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *   THE SOFTWARE.
 */

define(
    [
        'underscore',
        'backbone',
        'Audiee/Collections.Clips',
        'Audiee/Models.Clip'
    ],

    function ( _, Backbone, ClipsC, ClipM ) {

        // Define the Track model, extending Backbone.Model capabilities.
        var Track = Backbone.Model.extend( {

            // Default attribute values for a new track instance.
            defaults: {
                name:        'Untitled',           // User-friendly name for the track.
                color:       '#00a0b0',            // A color identifier for visual distinction.
                gain:        1,                    // Volume level for the track (0-1 range).
                pan:         0.5,                  // Panning position (0=left, 0.5=center, 1=right).
                muted:       false,                // Is the track currently muted?
                solo:        false,                // Is the track currently soloed?

                // Future feature: allow minimalization for view purposes?
                // minimalized: false,

                length:      1920                  // Default length in seconds (e.g., 32 minutes).
            },

            // Initialization logic for each new Track instance.
            initialize: function () {
                // Ensure context for these methods when called as event handlers.
                _.bindAll( this, 'initClip', 'remove', 'resetDuplicates' );

                // Bind the 'remove' event to the track's own remove method.
                this.bind( 'remove', this.remove );

                // When the track's name changes, reset duplicate tracking data.
                this.bind( 'change:name', this.resetDuplicates );

                // Create a new collection to hold clips associated with this track.
                this.clips = new ClipsC();

                // Initialize the first clip for the track.
                this.initClip();

                // Notify the Audiee Player to set up resources for this track.
                Audiee.Player.initTrack( this.cid );
            },

            // Initializes a new clip based on the track's initial file and buffer.
            initClip: function () {
                // Create a new Clip model instance.
                var clip = new ClipM( {
                    name:      this.get( 'file' ).name,      // Clip name from the file.
                    endTime:   this.get( 'buffer' ).duration, // End time based on buffer duration.
                    buffer:    this.get( 'buffer' )          // The audio buffer itself.
                } );

                // Add the newly created clip to this track's clips collection.
                this.clips.add( clip );
            },

            // Handles the removal of the track.
            remove: function () {
                // Release player resources associated with this track's client ID.
                Audiee.Player.releaseTrack( this.cid );

                // Destroy the model, which will trigger 'remove' events in collections.
                this.destroy();
            },

            // Retrieves a snapshot of clips within a specified time range.
            getSnapshot: function ( from, to ) {
                return this.clips.getSnapshot( from, to );
            },

            // Deletes a selection of clips within a given time range, with an optional exclusion.
            deleteSelection: function ( from, to, except ) {
                this.clips.deleteSelection( from, to, except );
            },

            // Pastes clips from the clipboard into the track at a specific position.
            pasteSelection: function ( position, clipboard ) {
                // Iterate through each clip in the clipboard.
                for ( var i = 0, len = clipboard.length; i < len; ++i ) {

                    // Create a new Clip model from the clipboard data.
                    var clip = new ClipM( {
                            startTime:  clipboard[i].startTime,  // Original start time of the clip.
                            endTime:    clipboard[i].endTime,    // Original end time of the clip.
                            trackPos:   clipboard[i].offset + position, // Position on the track after pasting.
                            loop:       clipboard[i].loop,       // Loop property.
                            name:       clipboard[i].name,       // Name of the clip.
                            color:      clipboard[i].color,      // Color of the clip.
                            buffer:     clipboard[i].buffer      // Audio buffer for the clip.
                        } ),
                        // Calculate the effective start position on the track.
                        from = clip.get( 'trackPos' ),
                        // Calculate the effective end position on the track.
                        to = from + clip.clipLength();

                    // Before pasting, delete any existing content in the target area
                    // across all tracks, except for the current track's own content.
                    Audiee.Collections.Tracks.deleteSelection( from, to, this.cid );

                    // Add the new clip to this track's collection.
                    this.clips.add( clip );
                }
            },

            // Resets the internal 'duplicates' tracking property.
            resetDuplicates: function () {
                this.duplicates = undefined;
            },

            // Creates a duplicate of the current track.
            duplicate: function () {
                // Create a clone of the track model.
                var newTrack = this.clone(),
                    // Get the name of the new track for modification.
                    newName  = newTrack.get( 'name' ),
                    // Check if the name already has a duplication suffix (e.g., "(1)").
                    match    = newName.match( /\(\d+\)$/ ),
                    // Initialize index for duplication counter.
                    index;

                // Reset the new track's clips collection with a copy of the current track's clips.
                newTrack.clips.reset( this.clips.toJSON() );

                // Check if this track has been duplicated before.
                if ( this.duplicates ) {
                    this.duplicates.count += 1; // Yes, increment the existing counter.
                } else {
                    this.duplicates = { count: 2 }; // No, initialize the counter object.
                }
                // Assign the current duplication index.
                index = this.duplicates.count;

                // Modify the new track's name to reflect the duplication.
                if ( match ) {
                    // Replace existing suffix with the new index.
                    newName = newName.replace( /\(\d+\)$/, ' (' + index + ')' );
                } else {
                    // Add a new suffix if none existed.
                    newName += ' (' + index + ')';
                }

                // Set the updated name for the new track.
                newTrack.set( 'name', newName );

                // Link the new track's 'duplicates' property to the original's.
                newTrack.duplicates = this.duplicates;

                // Add the newly created track to the global collection of tracks.
                this.collection.add( newTrack );

                // Decrement the index count on the collection (purpose might be related to UI indexing).
                this.collection.decIndexCount();
            }
        } ); // End of Backbone.Model.extend()

        // Return the Track model constructor.
        return Track;
    }
);