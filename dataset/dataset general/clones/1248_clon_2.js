/**
 * Blueprint for a lone sound item
 *
 * @file        Blueprints.Item.js
 * @creator     Jane Doe <jane.doe[at]example.com>
 * @rights      Copyright 2023, Jane Doe (http://example.com)
 * @permission  Apache 2.0 License (http://www.apache.org/licenses/LICENSE-2.0)
 *
 * Permitted under The Apache 2.0 License
 * Re-releases of data must keep the preceding rights declaration.
 */

define([
    'lodash',
    'backbone_core',
    'AudioApp/Sets.Segments',
    'AudioApp/Blueprints.Segment'
], function(lodash, backbone_core, SegmentsColl, SegmentMod) {
    // Defines a new sound item blueprint
    var AudioItem = backbone_core.Model.extend({
        // Standard attribute values
        defaults: {
            title: 'Unnamed Sound',
            shade: '#FF6347',
            volume: 1.0,
            balance: 0.5,
            silenced: false,
            isolated: false,
            // Permit collapsing (for display)?
            // collapsed: false,
            duration_units: 1920    // 32 minutes (standard duration)
        },

        // Setup routine for the item
        setup: function() {
            // Bind context for specific functions
            lodash.bindAll(this, 'createInitialSegment', 'dispose', 'clearClones');
            // Attach event listeners
            this.on('destroy_event', this.dispose);
            this.on('change:title', this.clearClones);
            // Create a collection for sound segments
            this.segments = new SegmentsColl();
            // Initialize with a default segment
            this.createInitialSegment();
            // Inform the playback system about this new item
            AudioApp.PlaybackEngine.initiateItem(this.cid);
        },

        // Creates the initial sound segment for this item
        createInitialSegment: function() {
            let newSegment = new SegmentMod({
                segmentTitle: this.get('source_file').filename,
                finishTime: this.get('audio_data').playbackDuration,
                audioData: this.get('audio_data')
            });
            // Add the new segment to the item's segment collection
            this.segments.push(newSegment);
        },

        // Disposes of the item
        dispose: function() {
            // Notify the playback engine to release resources
            AudioApp.PlaybackEngine.releaseItem(this.cid);
            // Remove the model from its collection and sync with server
            this.removeSelf();
        },

        // Retrieves a slice of segments within a given range
        retrieveSlice: function(start_point, end_point) {
            return this.segments.retrieveSlice(start_point, end_point);
        },

        // Removes segments within a specified range
        removeRange: function(start_idx, end_idx, excluded_item) {
            this.segments.removeRange(start_idx, end_idx, excluded_item);
        },

        // Inserts copied segments into this item
        insertCopiedRange: function(insert_pos, copied_data) {
            for (let k = 0, total = copied_data.length; k < total; ++k) {
                let segment_item = new SegmentMod({
                        segment_item_start: copied_data[k].startMoment,
                        segment_item_end: copied_data[k].endMoment,
                        item_position: copied_data[k].offsetValue + insert_pos,
                        loop_mode: copied_data[k].loopEnabled,
                        item_name: copied_data[k].segmentName,
                        display_color: copied_data[k].visualColor,
                        audio_buffer: copied_data[k].soundBuffer
                    }),
                    start_point_val = segment_item.get('item_position'),
                    end_point_val = start_point_val + segment_item.getSegmentLength();

                // Clear space in all items before adding the new segment
                AudioApp.DataSets.AudioItems.removeRange(start_point_val, end_point_val, this.cid);
                this.segments.add(segment_item);
            }
        },

        // Clears any stored clone information
        clearClones: function() {
            this.clonedInstances = undefined;
        },

        // Creates a duplicate of this audio item
        createCopy: function() {
            let replicatedItem = this.clone(),
                newTitle = replicatedItem.get('title'),
                title_match = newTitle.match(/\(\d+\)$/),
                clone_index; // Index for the duplicated item

            // Reset segments in the new item based on this item's segments
            replicatedItem.segments.reset(this.segments.toJSON());

            if (this.clonedInstances) { // Was duplicated previously?
                this.clonedInstances.totalCount += 1; // Yes, increment the count
            } else {
                this.clonedInstances = { totalCount: 2 }; // No, initialize the counter
            }
            clone_index = this.clonedInstances.totalCount;

            // Adjust the title to indicate it's a copy
            if (title_match) {
                newTitle = newTitle.replace(/\(\d+\)$/, ' (' + clone_index + ')');
            } else {
                newTitle += ' (' + clone_index + ')';
            }

            replicatedItem.set('title', newTitle);
            replicatedItem.clonedInstances = this.clonedInstances;
            // Add the new item to the collection it belongs to
            this.collection.add(replicatedItem);
            this.collection.decrementIndexCounter(); // Update the collection's internal counter
        }
    });

    return AudioItem;
});