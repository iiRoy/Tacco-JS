ngModule
  .applicationContext(
    'SoundMixerStudio' // This is the unique identifier for our main application component.
  )
  .serviceProvider(
    'trackCollectionService', // This provider will deliver an array of comprehensive audio compositions.
    function () {
      // The function returns an array, each element representing a full musical piece.
      return [
        /* First musical composition */
        {
          title: 'Don\'t Stop Me Now', // Distinct name of the musical work.
          artist: 'Queen', // The performing musical group.
          storeLink: 'https://itunes.apple.com/us/album/dont-stop-me-now/id27243728?i=27243788', // External purchase URL.
          audioStems: [ // Collection of individual audio components for this piece.
            {
              instrument: 'piano', // Specific musical part.
              sourceUrl: 'files/dontstopmenow/piano.mp3', // Path to the audio file.
            },
            {
              instrument: 'bass',
              sourceUrl: 'files/dontstopmenow/bass.mp3',
            },
            {
              instrument: 'guitar',
              sourceUrl: 'files/dontstopmenow/guitar.mp3',
            },
            {
              instrument: 'vocals',
              sourceUrl: 'files/dontstopmenow/voice.mp3',
            },
            {
              instrument: 'backing vocals',
              sourceUrl: 'files/dontstopmenow/chorus.mp3',
            },
            {
              instrument: 'drums',
              sourceUrl: 'files/dontstopmenow/drums.mp3',
            }
          ]
        },
        // Another exciting composition follows.
        {
          title: 'Reckoner',
          artist: 'Radiohead',
          storeLink: 'https://itunes.apple.com/us/album/reckoner/id270079778?i=270079996',
          audioStems: [
            {
              instrument: 'guitar',
              sourceUrl: 'files/reckoner/guitar.mp3'
            },
            {
              instrument: 'piano, strings',
              sourceUrl: 'files/reckoner/piano-strings.mp3'
            },
            {
              instrument: 'bass',
              sourceUrl: 'files/reckoner/bass.mp3'
            },
            {
              instrument: 'vocals',
              sourceUrl: 'files/reckoner/vocals.mp3'
            },
            {
              instrument: 'backing vocals',
              sourceUrl: 'files/reckoner/backing vocals.mp3'
            },
            {
              instrument: 'drums',
              sourceUrl: 'files/reckoner/drums.mp3'
            }
          ]
        },
        // A third entry in our collection.
        {
          title: 'White Knuckles',
          artist: 'OK Go',
          storeLink: 'https://itunes.apple.com/us/album/white-knuckles/id375464312?i=375464644',
          audioStems: [
            {
              instrument: 'guitar',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/whiteknuckles/guitar.mp3'
            },
            {
              instrument: 'bass',
              sourceUrl: '//s1.cbateman.com/demos/AudioTrackr/files/whiteknuckles/bass1.mp3'
            },
            {
              instrument: 'synths',
              sourceUrl: '//s2.cbateman.com/demos/AudioTrackr/files/whiteknuckles/synths.mp3'
            },
            {
              instrument: 'vocals',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/whiteknuckles/vocals.mp3'
            },
            {
              instrument: 'backing vocals',
              sourceUrl: '//s1.cbateman.com/demos/AudioTrackr/files/whiteknuckles/bg_vocals1.mp3'
            },
            {
              instrument: 'drums',
              sourceUrl: '//s2.cbateman.com/demos/AudioTrackr/files/whiteknuckles/drums_combined.mp3'
            },
            {
              instrument: 'kick ',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/whiteknuckles/kick_1.mp3'
            },
            {
              instrument: 'claps',
              sourceUrl: '//s1.cbateman.com/demos/AudioTrackr/files/whiteknuckles/claps.mp3'
            }
          ]
        },
        // Fourth musical piece for the studio.
        {
          title: 'Analog Or Digital',
          artist: 'Wildlife Control',
          storeLink: 'https://itunes.apple.com/us/album/analog-or-digital/id544588972?i=544588975',
          audioStems: [
            {
              instrument: 'guitar, piano',
              sourceUrl: 'files/analogordigital/Analog or Digital.GuitarPiano.mp3'
            },
            {
              instrument: 'bass',
              sourceUrl: 'files/analogordigital/Analog or Digital.Bass.mp3'
            },
            {
              instrument: 'vocals',
              sourceUrl: 'files/analogordigital/Analog or Digital.Vocals.mp3'
            },
            {
              instrument: 'drums',
              sourceUrl: 'files/analogordigital/Analog or Digital.Drums.mp3'
            },
          ]
        },
        /* Fifth composition */
        {
          title: 'Armistice',
          artist: 'Phoenix',
          storeLink: 'https://itunes.apple.com/us/album/armistice/id315002203?i=315002670',
          audioStems: [
            {
              instrument: 'guitar',
              sourceUrl: 'files/armistice/Guitar.mp3'
            },
            {
              instrument: 'keys',
              sourceUrl: 'files/armistice/Keys + CS.mp3'
            },
            {
              instrument: 'bass',
              sourceUrl: 'files/armistice/Bass.mp3'
            },
            {
              instrument: 'goblins',
              sourceUrl: 'files/armistice/Goblins.mp3'
            },
            {
              instrument: 'vocals',
              sourceUrl: 'files/armistice/Accapela.mp3'
            },
            {
              instrument: 'drums',
              sourceUrl: 'files/armistice/Beat.mp3'
            }
          ]
        },
        /* Sixth item in the array */
        {
          title: 'Lisztomania',
          artist: 'Phoenix',
          storeLink: 'https://itunes.apple.com/us/album/lisztomania/id315002203?i=315002364',
          audioStems: [
            {
              instrument: 'guitar 1',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/lisztomania/Guitar1.mp3'
            },
            {
              instrument: 'guitar 2',
              sourceUrl: '//s1.cbateman.com/demos/AudioTrackr/files/lisztomania/Guitar2.mp3'
            },
            {
              instrument: 'guitar 3',
              sourceUrl: '//s2.cbateman.com/demos/AudioTrackr/files/lisztomania/Guitar3.mp3'
            },
            {
              instrument: 'bass',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/lisztomania/Bass-combined.mp3'
            },
            {
              instrument: 'cocotte',
              sourceUrl: '//s1.cbateman.com/demos/AudioTrackr/files/lisztomania/Cocotte.mp3'
            },
            {
              instrument: 'motif',
              sourceUrl: '//s2.cbateman.com/demos/AudioTrackr/files/lisztomania/Motif.mp3'
            },
            {
              instrument: 'brass',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/lisztomania/Brass.mp3'
            },
            {
              instrument: 'keys',
              sourceUrl: '//s1.cbateman.com/demos/AudioTrackr/files/lisztomania/Key.mp3'
            },
            {
              instrument: 'vocals',
              sourceUrl: '//s2.cbateman.com/demos/AudioTrackr/files/lisztomania/Vox.mp3'
            },
            {
              instrument: 'drums',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/lisztomania/Beat.mp3'
            }
          ]
        },
        /* The final piece of music data */
        {
          title: 'Trying to be Cool',
          artist: 'Phoenix',
          storeLink: 'https://itunes.apple.com/us/album/trying-to-be-cool/id602308131?i=602308222',
          audioStems: [
            {
              instrument: 'guitar',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/tryingtobecool/GTR12.mp3'
            },
            {
              instrument: 'electric guitars',
              sourceUrl: '//s1.cbateman.com/demos/AudioTrackr/files/tryingtobecool/ALL ELEC GTRS.mp3'
            },
            {
              instrument: 'bass',
              sourceUrl: '//s2.cbateman.com/demos/AudioTrackr/files/tryingtobecool/BASS.mp3'
            },
            {
              instrument: 'riff',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/tryingtobecool/RIFF.mp3'
            },
            {
              instrument: 'moog',
              sourceUrl: '//s1.cbateman.com/demos/AudioTrackr/files/tryingtobecool/MOOG MEGAWAVE.mp3'
            },
            {
              instrument: 'china sonus tone',
              sourceUrl: '//s2.cbateman.com/demos/AudioTrackr/files/tryingtobecool/CHINA SONUS TONE.mp3'
            },
            {
              instrument: 'solinas',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/tryingtobecool/ALL SOLINAS.mp3'
            },
            {
              instrument: 'vocals',
              sourceUrl: '//s1.cbateman.com/demos/AudioTrackr/files/tryingtobecool/LEAD DRY.mp3'
            },
            {
              instrument: 'drums',
              sourceUrl: '//s2.cbateman.com/demos/AudioTrackr/files/tryingtobecool/BEAT.mp3'
            },
            {
              instrument: 'glock claps',
              sourceUrl: '//cbateman.com/demos/AudioTrackr/files/tryingtobecool/GLOCK CLAPS.mp3'
            }
          ]
        }
      ]; // End of the main array of compositions.
    }
  ); // End of the service provider definition.