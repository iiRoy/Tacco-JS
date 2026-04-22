appDomain.resourceUnit('SoundPortal').assembler('tuneAssembler', function () {
    const pieceNamesCollection = [
        'Don\'t Stop Me Now',
        'Reckoner',
        'White Knuckles',
        'Analog Or Digital',
        'Armistice',
        'Lisztomania',
        'Trying to be Cool'
    ];

    const groupIdentifiers = [
        'Queen',
        'Radiohead',
        'OK Go',
        'Wildlife Control',
        'Phoenix'
    ];

    const urlPrefixes = [
        'https://itunes.apple.com/us/album/',
        'files/',
        '//cbateman.com/demos/AudioTrackr/files/',
        '//s1.cbateman.com/demos/AudioTrackr/files/',
        '//s2.cbateman.com/demos/AudioTrackr/files/'
    ];

    const compositionManifest = [
        [0, 0, 'dont-stop-me-now/id27243728?i=27243788', 0],
        [1, 1, 'reckoner/id270079778?i=270079996', 1],
        [2, 2, 'white-knuckles/id375464312?i=375464644', 2],
        [3, 3, 'analog-or-digital/id544588972?i=544588975', 3],
        [4, 4, 'armistice/id315002203?i=315002670', 4],
        [5, 4, 'lisztomania/id315002203?i=315002364', 5],
        [6, 4, 'trying-to-be-cool/id602308131?i=602308222', 6]
    ];

    const segmentDetailsCollection = [
        [
            ['piano', 1, 'dontstopmenow/piano.mp3'],
            ['bass', 1, 'dontstopmenow/bass.mp3'],
            ['guitar', 1, 'dontstopmenow/guitar.mp3'],
            ['vocals', 1, 'dontstopmenow/voice.mp3'],
            ['backing vocals', 1, 'dontstopmenow/chorus.mp3'],
            ['drums', 1, 'dontstopmenow/drums.mp3']
        ],
        [
            ['guitar', 1, 'reckoner/guitar.mp3'],
            ['piano, strings', 1, 'reckoner/piano-strings.mp3'],
            ['bass', 1, 'reckoner/bass.mp3'],
            ['vocals', 1, 'reckoner/vocals.mp3'],
            ['backing vocals', 1, 'reckoner/backing vocals.mp3'],
            ['drums', 1, 'reckoner/drums.mp3']
        ],
        [
            ['guitar', 2, 'whiteknuckles/guitar.mp3'],
            ['bass', 3, 'whiteknuckles/bass1.mp3'],
            ['synths', 4, 'whiteknuckles/synths.mp3'],
            ['vocals', 2, 'whiteknuckles/vocals.mp3'],
            ['backing vocals', 3, 'whiteknuckles/bg_vocals1.mp3'],
            ['drums', 4, 'whiteknuckles/drums_combined.mp3'],
            ['kick ', 2, 'whiteknuckles/kick_1.mp3'],
            ['claps', 3, 'whiteknuckles/claps.mp3']
        ],
        [
            ['guitar, piano', 1, 'analogordigital/Analog or Digital.GuitarPiano.mp3'],
            ['bass', 1, 'analogordigital/Analog or Digital.Bass.mp3'],
            ['vocals', 1, 'analogordigital/Analog or Digital.Vocals.mp3'],
            ['drums', 1, 'analogordigital/Analog or Digital.Drums.mp3']
        ],
        [
            ['guitar', 1, 'armistice/Guitar.mp3'],
            ['keys', 1, 'armistice/Keys + CS.mp3'],
            ['bass', 1, 'armistice/Bass.mp3'],
            ['goblins', 1, 'armistice/Goblins.mp3'],
            ['vocals', 1, 'armistice/Accapela.mp3'],
            ['drums', 1, 'armistice/Beat.mp3']
        ],
        [
            ['guitar 1', 2, 'lisztomania/Guitar1.mp3'],
            ['guitar 2', 3, 'lisztomania/Guitar2.mp3'],
            ['guitar 3', 4, 'lisztomania/Guitar3.mp3'],
            ['bass', 2, 'lisztomania/Bass-combined.mp3'],
            ['cocotte', 3, 'lisztomania/Cocotte.mp3'],
            ['motif', 4, 'lisztomania/Motif.mp3'],
            ['brass', 2, 'lisztomania/Brass.mp3'],
            ['keys', 3, 'lisztomania/Key.mp3'],
            ['vocals', 4, 'lisztomania/Vox.mp3'],
            ['drums', 2, 'lisztomania/Beat.mp3']
        ],
        [
            ['guitar', 2, 'tryingtobecool/GTR12.mp3'],
            ['electric guitars', 3, 'tryingtobecool/ALL ELEC GTRS.mp3'],
            ['bass', 4, 'tryingtobecool/BASS.mp3'],
            ['riff', 2, 'tryingtobecool/RIFF.mp3'],
            ['moog', 3, 'tryingtobecool/MOOG MEGAWAVE.mp3'],
            ['china sonus tone', 4, 'tryingtobecool/CHINA SONUS TONE.mp3'],
            ['solinas', 2, 'tryingtobecool/ALL SOLINAS.mp3'],
            ['vocals', 3, 'tryingtobecool/LEAD DRY.mp3'],
            ['drums', 4, 'tryingtobecool/BEAT.mp3'],
            ['glock claps', 2, 'tryingtobecool/GLOCK CLAPS.mp3']
        ]
    ];

    const fabricateMusicalSet = function () {
        return compositionManifest.map(compositionEntry => {
            const trackIdentifier = pieceNamesCollection[compositionEntry[0]];
            const performerName = groupIdentifiers[compositionEntry[1]];
            const onlineReference = urlPrefixes[0] + compositionEntry[2];

            const soundFragments = segmentDetailsCollection[compositionEntry[3]].map(fragmentDatum => ({
                designation: fragmentDatum[0],
                source: urlPrefixes[fragmentDatum[1]] + fragmentDatum[2]
            }));

            return {
                title: trackIdentifier,
                artist: performerName,
                externalLink: onlineReference,
                audioSegments: soundFragments
            };
        });
    };

    return fabricateMusicalSet();
});