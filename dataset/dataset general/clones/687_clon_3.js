const ng = window.angular; // Create a local alias for the global Angular object for brevity.

// Initialize the primary application module and define a factory-style service.
// This service, named 'musicCompositionService', will manage and provide access to audio composition data.
ng.module('SoundMixerApp', []).factory('musicCompositionService', /* @ngInject */ function () {

    // --- Configuration and Helper Utilities ---

    // Base path for relative audio file URLs. This can be configured externally if needed.
    const RELATIVE_AUDIO_ROOT_PATH = 'files/';

    // A simple counter for generating unique identifiers within the service's scope.
    let currentEntityId = 0;

    /**
     * Generates a sequential unique ID for data entities.
     * @returns {string} A new unique identifier string.
     */
    function createSequentialId() {
        currentEntityId++;
        return `entity-${currentEntityId}`;
    }

    /**
     * Normalizes an audio source URL. If the URL is relative, it prepends the base path.
     * Absolute or protocol-relative URLs are returned as-is.
     * @param {string} rawSourcePath - The original audio source path.
     * @returns {string} The processed and normalized audio source URL.
     */
    function processAudioResourcePath(rawSourcePath) {
        if (rawSourcePath.startsWith('http://') || rawSourcePath.startsWith('https://') || rawSourcePath.startsWith('//')) {
            return rawSourcePath; // Already an absolute or protocol-relative URL.
        }
        // Assuming a local, relative path; prepend the configured root path.
        return RELATIVE_AUDIO_ROOT_PATH + rawSourcePath;
    }

    // --- Core Data Definition ---

    // This array holds the primary collection of musical compositions.
    // Each object represents a complete song, broken down into its constituent audio layers.
    const musicalCompositionsRegistry = [
        {
            // Unique identifier for this specific composition.
            compositionIdentifier: createSequentialId(),
            // The official title of the musical piece.
            compositionTitle: 'Don\'t Stop Me Now',
            // The artist or group performing the composition.
            performingArtist: 'Queen',
            // A URL where the composition can be purchased or streamed legally.
            digitalPurchaseLink: 'https://itunes.apple.com/us/album/dont-stop-me-now/id27243728?i=27243788',
            // Categorization of the musical style.
            musicGenre: 'Classic Rock',
            // The original year of release.
            releaseDate: 1978,
            // An array containing individual audio tracks or layers that form the composition.
            layeredAudioSegments: [
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Grand Piano',
                    instrumentCategory: 'Keyboard',
                    audioFileLocation: 'dontstopmenow/piano.mp3',
                    audioCodec: 'audio/mpeg' // Explicitly define codec for robustness.
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Electric Bass',
                    instrumentCategory: 'Bass',
                    audioFileLocation: 'dontstopmenow/bass.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Lead Guitar',
                    instrumentCategory: 'Guitar',
                    audioFileLocation: 'dontstopmenow/guitar.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Main Vocals',
                    instrumentCategory: 'Vocals',
                    audioFileLocation: 'dontstopmenow/voice.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Background Vocals',
                    instrumentCategory: 'Vocals',
                    audioFileLocation: 'dontstopmenow/chorus.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Drum Kit',
                    instrumentCategory: 'Percussion',
                    audioFileLocation: 'dontstopmenow/drums.mp3',
                    audioCodec: 'audio/mpeg'
                }
            ]
        },
        {
            compositionIdentifier: createSequentialId(),
            compositionTitle: 'Reckoner',
            performingArtist: 'Radiohead',
            digitalPurchaseLink: 'https://itunes.apple.com/us/album/reckoner/id270079778?i=270079996',
            musicGenre: 'Art Rock',
            releaseDate: 2007,
            layeredAudioSegments: [
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Acoustic Guitar',
                    instrumentCategory: 'Guitar',
                    audioFileLocation: 'reckoner/guitar.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Piano and Strings',
                    instrumentCategory: 'Keyboard',
                    audioFileLocation: 'reckoner/piano-strings.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Electric Bass',
                    instrumentCategory: 'Bass',
                    audioFileLocation: 'reckoner/bass.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Lead Vocal Track',
                    instrumentCategory: 'Vocals',
                    audioFileLocation: 'reckoner/vocals.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Harmony Vocals',
                    instrumentCategory: 'Vocals',
                    audioFileLocation: 'reckoner/backing vocals.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Drums',
                    instrumentCategory: 'Percussion',
                    audioFileLocation: 'reckoner/drums.mp3',
                    audioCodec: 'audio/mpeg'
                }
            ]
        },
        {
            compositionIdentifier: createSequentialId(),
            compositionTitle: 'White Knuckles',
            performingArtist: 'OK Go',
            digitalPurchaseLink: 'https://itunes.apple.com/us/album/white-knuckles/id375464312?i=375464644',
            musicGenre: 'Indie Pop',
            releaseDate: 2010,
            layeredAudioSegments: [
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Main Guitar',
                    instrumentCategory: 'Guitar',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/whiteknuckles/guitar.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Bass',
                    instrumentCategory: 'Bass',
                    audioFileLocation: '//s1.cbateman.com/demos/AudioTrackr/files/whiteknuckles/bass1.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Synthesizers',
                    instrumentCategory: 'Synthesizer',
                    audioFileLocation: '//s2.cbateman.com/demos/AudioTrackr/files/whiteknuckles/synths.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Lead Vocals',
                    instrumentCategory: 'Vocals',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/whiteknuckles/vocals.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Backing Vocals',
                    instrumentCategory: 'Vocals',
                    audioFileLocation: '//s1.cbateman.com/demos/AudioTrackr/files/whiteknuckles/bg_vocals1.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Combined Drums',
                    instrumentCategory: 'Percussion',
                    audioFileLocation: '//s2.cbateman.com/demos/AudioTrackr/files/whiteknuckles/drums_combined.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Kick Drum Only', // Specific drum part, for variation
                    instrumentCategory: 'Percussion',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/whiteknuckles/kick_1.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Claps Track',
                    instrumentCategory: 'Percussion',
                    audioFileLocation: '//s1.cbateman.com/demos/AudioTrackr/files/whiteknuckles/claps.mp3',
                    audioCodec: 'audio/mpeg'
                }
            ]
        },
        {
            compositionIdentifier: createSequentialId(),
            compositionTitle: 'Analog Or Digital',
            performingArtist: 'Wildlife Control',
            digitalPurchaseLink: 'https://itunes.apple.com/us/album/analog-or-digital/id544588972?i=544588975',
            musicGenre: 'Indie Rock',
            releaseDate: 2012,
            layeredAudioSegments: [
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Guitar & Piano Combo',
                    instrumentCategory: 'Mixed',
                    audioFileLocation: 'analogordigital/Analog or Digital.GuitarPiano.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Bass Guitar',
                    instrumentCategory: 'Bass',
                    audioFileLocation: 'analogordigital/Analog or Digital.Bass.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Vocals',
                    instrumentCategory: 'Vocals',
                    audioFileLocation: 'analogordigital/Analog or Digital.Vocals.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Drums',
                    instrumentCategory: 'Percussion',
                    audioFileLocation: 'analogordigital/Analog or Digital.Drums.mp3',
                    audioCodec: 'audio/mpeg'
                },
            ]
        },
        {
            compositionIdentifier: createSequentialId(),
            compositionTitle: 'Armistice',
            performingArtist: 'Phoenix',
            digitalPurchaseLink: 'https://itunes.apple.com/us/album/armistice/id315002203?i=315002670',
            musicGenre: 'Indie Pop',
            releaseDate: 2009,
            layeredAudioSegments: [
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Guitar Track',
                    instrumentCategory: 'Guitar',
                    audioFileLocation: 'armistice/Guitar.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Keys & Synths',
                    instrumentCategory: 'Keyboard',
                    audioFileLocation: 'armistice/Keys + CS.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Bass Track',
                    instrumentCategory: 'Bass',
                    audioFileLocation: 'armistice/Bass.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Goblins Effect', // Renamed for descriptive clarity
                    instrumentCategory: 'Sound Effect',
                    audioFileLocation: 'armistice/Goblins.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'A Cappella Vocals', // Renamed for descriptive clarity
                    instrumentCategory: 'Vocals',
                    audioFileLocation: 'armistice/Accapela.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Percussion Beat', // Renamed for descriptive clarity
                    instrumentCategory: 'Percussion',
                    audioFileLocation: 'armistice/Beat.mp3',
                    audioCodec: 'audio/mpeg'
                }
            ]
        },
        {
            compositionIdentifier: createSequentialId(),
            compositionTitle: 'Lisztomania',
            performingArtist: 'Phoenix',
            digitalPurchaseLink: 'https://itunes.apple.com/us/album/lisztomania/id315002203?i=315002364',
            musicGenre: 'Indie Pop',
            releaseDate: 2009,
            layeredAudioSegments: [
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Guitar One',
                    instrumentCategory: 'Guitar',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/lisztomania/Guitar1.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Guitar Two',
                    instrumentCategory: 'Guitar',
                    audioFileLocation: '//s1.cbateman.com/demos/AudioTrackr/files/lisztomania/Guitar2.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Guitar Three',
                    instrumentCategory: 'Guitar',
                    audioFileLocation: '//s2.cbateman.com/demos/AudioTrackr/files/lisztomania/Guitar3.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Combined Bass',
                    instrumentCategory: 'Bass',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/lisztomania/Bass-combined.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Cocotte Sound', // More descriptive name
                    instrumentCategory: 'Effect',
                    audioFileLocation: '//s1.cbateman.com/demos/AudioTrackr/files/lisztomania/Cocotte.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Motif Layer', // More descriptive name
                    instrumentCategory: 'Synthesizer',
                    audioFileLocation: '//s2.cbateman.com/demos/AudioTrackr/files/lisztomania/Motif.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Brass Section',
                    instrumentCategory: 'Brass',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/lisztomania/Brass.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Keyboard Melody',
                    instrumentCategory: 'Keyboard',
                    audioFileLocation: '//s1.cbateman.com/demos/AudioTrackr/files/lisztomania/Key.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Vocal Track',
                    instrumentCategory: 'Vocals',
                    audioFileLocation: '//s2.cbateman.com/demos/AudioTrackr/files/lisztomania/Vox.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Drum Track',
                    instrumentCategory: 'Percussion',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/lisztomania/Beat.mp3',
                    audioCodec: 'audio/mpeg'
                }
            ]
        },
        {
            compositionIdentifier: createSequentialId(),
            compositionTitle: 'Trying to be Cool',
            performingArtist: 'Phoenix',
            digitalPurchaseLink: 'https://itunes.apple.com/us/album/trying-to-be-cool/id602308131?i=602308222',
            musicGenre: 'Indie Pop',
            releaseDate: 2013,
            layeredAudioSegments: [
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Guitar 1 & 2',
                    instrumentCategory: 'Guitar',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/tryingtobecool/GTR12.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'All Electric Guitars',
                    instrumentCategory: 'Guitar',
                    audioFileLocation: '//s1.cbateman.com/demos/AudioTrackr/files/tryingtobecool/ALL ELEC GTRS.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Bass Layer',
                    instrumentCategory: 'Bass',
                    audioFileLocation: '//s2.cbateman.com/demos/AudioTrackr/files/tryingtobecool/BASS.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Riff Instrument', // More descriptive
                    instrumentCategory: 'Synthesizer',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/tryingtobecool/RIFF.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Moog Megawave Synth', // More descriptive
                    instrumentCategory: 'Synthesizer',
                    audioFileLocation: '//s1.cbateman.com/demos/AudioTrackr/files/tryingtobecool/MOOG MEGAWAVE.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'China Sonus Tone',
                    instrumentCategory: 'Synthesizer',
                    audioFileLocation: '//s2.cbateman.com/demos/AudioTrackr/files/tryingtobecool/CHINA SONUS TONE.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'All Solinas Pads',
                    instrumentCategory: 'Synthesizer',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/tryingtobecool/ALL SOLINAS.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Dry Lead Vocals', // More descriptive
                    instrumentCategory: 'Vocals',
                    audioFileLocation: '//s1.cbateman.com/demos/AudioTrackr/files/tryingtobecool/LEAD DRY.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Main Drum Beat', // More descriptive
                    instrumentCategory: 'Percussion',
                    audioFileLocation: '//s2.cbateman.com/demos/AudioTrackr/files/tryingtobecool/BEAT.mp3',
                    audioCodec: 'audio/mpeg'
                },
                {
                    segmentIdentifier: createSequentialId(),
                    segmentName: 'Glockenspiel & Claps', // More descriptive
                    instrumentCategory: 'Percussion',
                    audioFileLocation: '//cbateman.com/demos/AudioTrackr/files/tryingtobecool/GLOCK CLAPS.mp3',
                    audioCodec: 'audio/mpeg'
                }
            ]
        }
    ];

    // --- Data Initialization and Validation Phase ---
    // This block iterates through the defined compositions to ensure data consistency
    // and apply necessary transformations (e.g., URL normalization).
    console.info('Service: Initiating composition data preprocessing...');
    musicalCompositionsRegistry.forEach(function (compositionEntry) {
        // Basic validation: Check for essential properties.
        if (!compositionEntry.compositionTitle || !compositionEntry.performingArtist) {
            console.warn(`Data Integrity Warning: Composition with ID '${compositionEntry.compositionIdentifier}' is missing a title or artist.`);
            // In a production environment, more robust error handling or default assignments would be here.
        }

        // Apply default values if certain properties are not explicitly set.
        if (!compositionEntry.musicGenre) {
            compositionEntry.musicGenre = 'Undefined';
        }
        if (!compositionEntry.releaseDate) {
            compositionEntry.releaseDate = 0; // Or null, depending on desired default.
        }

        // Process each audio segment (layer) within the composition.
        compositionEntry.layeredAudioSegments.forEach(function (audioSegment) {
            // Normalize the audio file location using our helper function.
            audioSegment.audioFileLocation = processAudioResourcePath(audioSegment.audioFileLocation);

            // Ensure instrument category is defined.
            if (!audioSegment.instrumentCategory) {
                audioSegment.instrumentCategory = 'General Instrument';
            }
            // Ensure audio codec is specified.
            if (!audioSegment.audioCodec) {
                audioSegment.audioCodec = 'audio/mpeg'; // Default to a common format.
            }
        });
    });
    console.info('Service: Composition data preprocessing complete.');

    // --- Public Service Interface ---
    // The service exposes methods to interact with the composition data,
    // rather than directly returning the raw data array.
    return {
        /**
         * Provides a complete list of all registered music compositions.
         * Returns a deep copy to prevent external modification of the internal data store.
         * @returns {Array<Object>} An array of composition objects.
         */
        retrieveAllCompositions: function () {
            // Using JSON serialization for a simple deep copy.
            return JSON.parse(JSON.stringify(musicalCompositionsRegistry));
        },

        /**
         * Fetches a specific music composition by its unique identifier.
         * Returns a deep copy of the composition if found.
         * @param {string} searchIdentifier - The unique ID of the composition to find.
         * @returns {Object|null} The requested composition object, or null if not found.
         */
        findCompositionById: function (searchIdentifier) {
            // Guard clause for invalid input.
            if (!searchIdentifier || typeof searchIdentifier !== 'string') {
                console.error('Invalid search identifier provided to findCompositionById:', searchIdentifier);
                return null;
            }

            const matchedComposition = musicalCompositionsRegistry.find(
                comp => comp.compositionIdentifier === searchIdentifier
            );

            // Return a deep copy if a match is found, otherwise return null.
            return matchedComposition ? JSON.parse(JSON.stringify(matchedComposition)) : null;
        },

        /**
         * Retrieves only the audio layers for a specified composition.
         * @param {string} compositionIdInput - The ID of the parent composition.
         * @returns {Array<Object>|null} An array of audio layer objects, or null if the composition is not found.
         */
        getAudioLayersByCompositionId: function (compositionIdInput) {
            const parentComposition = this.findCompositionById(compositionIdInput); // Reuses another public method.
            return parentComposition ? parentComposition.layeredAudioSegments : null;
        },

        /**
         * Returns the total count of compositions currently available in the registry.
         * @returns {number} The number of compositions.
         */
        getTotalCompositionCount: function () {
            return musicalCompositionsRegistry.length;
        }
    };
});