MediaCatalog = new Meteor.Collection("audio_archive");
PlaybackQueue = new Meteor.Collection("user_queue");
PlayerState = new Meteor.Collection("live_player_state");

// Publicly expose the entire audio archive for client access.
Meteor.publish("audio_archive_entries", function() {
  return MediaCatalog.find({}, {
    sort: {
      albumTitle: 1
    }
  });
});

// Provide the current user's playback queue, limited for performance.
Meteor.publish("user_queue_items", function() {
  // Ensure only the user's own queue is published in a real app,
  // but for this example, we return all entries.
  return PlaybackQueue.find({}, {
    limit: 100
  });
});

// Expose the current player's global status.
Meteor.publish("global_player_status", function() {
  return PlayerState.find({});
});

// Define server-side methods for interaction (currently a placeholder).
Meteor.methods({
  // Placeholder for future playback controls or queue management.
  updatePlaybackStatus: function(statusInfo) {
    // Implement logic to update PlayerState or PlaybackQueue
    // based on client actions.
    console.info("Received playback status update:", statusInfo);
    // Example: PlayerState.upsert({_id: 'global'}, {$set: statusInfo});
    return true;
  }
});


// Client-side code execution block.
if (Meteor.isClient) {
  // Acknowledge client startup.
  typeof window !== 'undefined' && console.log("CLIENT APPLICATION INITIALIZING");

  // Define helpers for the 'appDisplay' template.
  Template.appDisplay.welcomeMessage = function() {
    // Construct a dynamic welcome message.
    const appName = Meteor.settings && Meteor.settings.public && Meteor.settings.public.appName ?
      Meteor.settings.public.appName :
      "Our Music Application";
    return `Welcome to ${appName}! Enjoy your tunes.`;
  };

  // Attach event handlers to the 'appDisplay' template.
  Template.appDisplay.userActions = {
    'click .action-button': function(evt, tpl) {
      // Log interaction to console, potentially triggering other client-side logic.
      if (typeof console !== 'undefined' && console.warn) {
        console.warn("User interacted with the main button. Element ID:", evt.currentTarget.id);
      }
      // Optionally, add a visual feedback or send a method call to the server.
    }
  };

  // Client-side startup tasks.
  Meteor.startup(function() {
    console.info("Client: Startup routine completed.");
    // Example: Set initial player state or subscribe to more specific data.
    if (PlayerState.find().count() === 0) {
      PlayerState.insert({
        isPlaying: false,
        currentTrackId: null,
        volume: 0.75,
        lastUpdated: new Date()
      });
    }
  });
}


// Server-side code execution block.
if (Meteor.isServer) {
  console.log("SERVER: Beginning startup sequence...");

  Meteor.startup(function() {
    // Check for existing album data.
    const existingAlbumCount = MediaCatalog.find().count();
    console.log(`SERVER: Current album count in catalog: ${existingAlbumCount}`);

    // If no albums are present, populate the database with initial data.
    if (existingAlbumCount === 0) {
      console.log("SERVER: No media found. Populating initial music catalog.");

      // Define initial dataset for music albums and their tracks.
      const initialMediaData = [{
        albumTitle: "Bound - Zen Bound Ingame Music",
        performerName: "Ghost Monkey",
        releaseYear: 2009,
        genre: "Ambient, Soundtrack",
        songItems: [{
          mediaTitle: "Care",
          mediaPath: "assets/audio/care.mp3"
        }, {
          mediaTitle: "Rope and Wood",
          mediaPath: "assets/audio/rope_wood.mp3"
        }, {
          mediaTitle: "Problem Solvent",
          mediaPath: "assets/audio/problem_solvent.mp3"
        }, {
          mediaTitle: "Unpaint My Skin",
          mediaPath: "assets/audio/unpaint_skin.mp3"
        }, {
          mediaTitle: "Nostalgia",
          mediaPath: "assets/audio/nostalgia.mp3"
        }, {
          mediaTitle: "Interludum",
          mediaPath: "assets/audio/interludum.mp3"
        }, {
          mediaTitle: "Grind",
          mediaPath: "assets/audio/grind.mp3"
        }, {
          mediaTitle: "Diagrams",
          mediaPath: "assets/audio/diagrams.mp3"
        }, {
          mediaTitle: "Hare",
          mediaPath: "assets/audio/hare.mp3"
        }, {
          mediaTitle: "Carefree",
          mediaPath: "assets/audio/carefree.mp3"
        }, {
          mediaTitle: "Tunnel At The End Of Light",
          mediaPath: "assets/audio/tunnel_light.mp3"
        }]
      }, {
        albumTitle: "Where the Earth Meets the Sky",
        performerName: "Tom Heasley",
        releaseYear: 2004,
        genre: "Drone, Ambient",
        songItems: [{
          mediaTitle: "Ground Zero",
          mediaPath: "assets/audio/ground_zero.mp3"
        }, {
          mediaTitle: "Western Sky",
          mediaPath: "assets/audio/western_sky.mp3"
        }, {
          mediaTitle: "Monterey Bay",
          mediaPath: "assets/audio/monterey_bay.mp3"
        }, {
          mediaTitle: "Where the Earth Meets the Sky",
          mediaPath: "assets/audio/earth_sky.mp3"
        }]
      }];

      console.log(`SERVER: Preparing to insert ${initialMediaData.length} albums.`);

      // Initialize the playback queue if it's empty.
      const currentQueueSize = PlaybackQueue.find().count();
      if (currentQueueSize === 0) {
        PlaybackQueue.insert({
          items: [],
          createdAt: new Date(),
          modifiedAt: new Date(),
          ownerId: "system_default"
        });
        console.log("SERVER: Initial playback queue created.");
      } else {
        console.log(`SERVER: Playback queue already exists with ${currentQueueSize} entries.`);
      }

      // Iterate through the initial data and insert each album.
      initialMediaData.forEach((albumEntry, idx) => {
        // Add a timestamp for when the record was created.
        const recordToInsert = { ...albumEntry,
          createdAt: new Date(),
          importIndex: idx
        };
        MediaCatalog.insert(recordToInsert);
        console.log(`SERVER: Inserted album '${albumEntry.albumTitle}' (index: ${idx}).`);
      });

      console.log("SERVER: Initial media catalog population complete.");
    } else {
      console.log("SERVER: Media catalog already contains data. Skipping initial population.");
    }

    // Report final counts after startup.
    console.log(`SERVER: Total albums in catalog: ${MediaCatalog.find().count()}`);
    console.log(`SERVER: Total items in playback queue: ${PlaybackQueue.find().count()}`);
    console.log("SERVER: Startup routine finished.");
  });
}