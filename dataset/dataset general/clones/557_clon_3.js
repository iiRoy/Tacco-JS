function MediaCollectionsManager($viewScope) {
  // This controller handles the management and interaction with various media collections.
  // It orchestrates loading, saving, playback, and editing of media items.

  // Internal storage key for browser persistence.
  const STORAGE_KEY_COLLECTIONS = 'appMediaCollectionsData';

  // Private helper to manage the Soundcloud widget instance.
  let _audioPlayerWidget = null;

  // Initialize the main data structure for media collections.
  $viewScope.mediaCollections = [];

  // Placeholder for any initial default content if local storage is empty.
  // In a real app, this would be loaded from a config or API.
  const _initialContentData = [
    {
      collectionId: 'col_1',
      collectionName: 'Startup Jams',
      description: 'Some cool tunes to get started.',
      selected: false,
      currentTrackIndex: 0,
      tracks: [
        { id: 't_1_1', title: 'Synthwave Drive', resourceURL: 'https://soundcloud.com/user-123456789/synthwave-drive', playbackState: 'Paused' },
        { id: 't_1_2', title: 'Chill Lo-Fi Beat', resourceURL: 'https://soundcloud.com/user-987654321/chill-lofi-beat', playbackState: 'Paused' }
      ]
    },
    {
      collectionId: 'col_2',
      collectionName: 'Focus Music',
      description: 'Background sounds for concentration.',
      selected: false,
      currentTrackIndex: 0,
      tracks: [
        { id: 't_2_1', title: 'Ambient Waves', resourceURL: 'https://soundcloud.com/user-112233445/ambient-waves', playbackState: 'Paused' }
      ]
    }
  ];

  /**
   * Loads collection data from local storage or initializes with default content.
   * Also sets up a watcher to automatically save changes.
   */
  const _initializeDataStore = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY_COLLECTIONS);
      if (storedData) {
        $viewScope.mediaCollections = JSON.parse(storedData);
        // Ensure every track has a default playbackState if not present
        $viewScope.mediaCollections.forEach(collection => {
          collection.tracks.forEach(track => {
            if (!track.playbackState) {
              track.playbackState = 'Paused';
            }
          });
          if (typeof collection.currentTrackIndex === 'undefined') {
            collection.currentTrackIndex = 0;
          }
        });
      } else {
        $viewScope.mediaCollections = _initialContentData;
        console.info('No stored collections found. Loading initial sample data.');
      }
    } catch (error) {
      console.error('Error loading collections from local storage:', error);
      $viewScope.mediaCollections = _initialContentData; // Fallback to default
    }

    // Set up a deep watch to automatically save changes to local storage.
    $viewScope.$watch('mediaCollections', (newVal, oldVal) => {
      if (newVal !== oldVal) { // Only save if there's an actual change
        _persistCollectionData();
      }
    }, true); // 'true' for deep watch
  };

  /**
   * Persists the current state of mediaCollections to local storage.
   */
  const _persistCollectionData = () => {
    try {
      localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify($viewScope.mediaCollections));
      console.log('Collection data saved to local storage.');
    } catch (error) {
      console.error('Failed to save collection data to local storage:', error);
      // Optionally, inform the user about the failure
    }
  };


  // --- Public Methods Accessible via $viewScope ---

  /**
   * Retrieves the total count of media collections.
   * @returns {number} The number of collections.
   */
  $viewScope.getCollectionCount = () => {
    return $viewScope.mediaCollections.length;
  };

  /**
   * Calculates the total number of individual media items across all collections.
   * @returns {number} The aggregate count of all tracks.
   */
  $viewScope.getAggregateItemCount = () => {
    return $viewScope.mediaCollections.reduce((total, currentCollection) => {
      return total + (currentCollection.tracks ? currentCollection.tracks.length : 0);
    }, 0);
  };

  /**
   * Returns the currently selected media collection.
   * @returns {object|null} The selected collection object, or null if none is selected.
   */
  $viewScope.getActiveCollection = () => {
    return $viewScope.mediaCollections.find(collection => collection.selected) || null;
  };

  /**
   * Sets a specific media collection as active, deselecting any previously active ones.
   * @param {object} targetCollection - The collection object to be selected.
   */
  $viewScope.activateCollection = (targetCollection) => {
    if (!targetCollection || typeof targetCollection !== 'object') {
      console.warn('Invalid collection provided for activation.');
      return;
    }

    // Ensure only one collection is active at a time.
    $viewScope.mediaCollections.forEach(collection => {
      if (collection.selected && collection !== targetCollection) {
        collection.selected = false;
      }
    });

    targetCollection.selected = true;
    // Visually show the main content area upon collection selection.
    $('#main-content-area').css({ 'visibility': 'visible', 'opacity': 1 });
    console.log(`Collection "${targetCollection.collectionName}" activated.`);
  };

  /**
   * Manages the playback state (Play/Pause) of a given media item.
   * @param {object} mediaItem - The media item (track) to toggle.
   */
  $viewScope.managePlayback = (mediaItem) => {
    if (!mediaItem || !mediaItem.resourceURL) {
      console.warn('Cannot manage playback: Invalid media item or missing resource URL.');
      return;
    }

    // Ensure the player UI is visible.
    $('#audio-player-display').fadeIn();

    // Check if the widget is initialized.
    if (!_audioPlayerWidget && typeof SC !== 'undefined' && SC.Widget) {
      const iframeElement = document.getElementById('sc-widget-player');
      if (iframeElement) {
        _audioPlayerWidget = SC.Widget(iframeElement);

        // Bind finish event handler only once.
        _audioPlayerWidget.bind(SC.Widget.Events.FINISH, () => {
          $viewScope.$apply(() => {
            console.log('Track finished, attempting to skip.');
            const currentCollection = $viewScope.getActiveCollection();
            if (currentCollection) {
              $viewScope.advanceTrack(currentCollection);
            }
          });
        });
      } else {
        console.error('SoundCloud widget iframe not found.');
        return;
      }
    } else if (!_audioPlayerWidget) {
      console.warn('SoundCloud widget API not available or player iframe not ready.');
      return;
    }

    // Stop any other currently playing track.
    $viewScope.mediaCollections.forEach(collection => {
      collection.tracks.forEach(track => {
        if (track !== mediaItem && track.playbackState === 'Playing') {
          track.playbackState = 'Paused'; // Set to paused, not 'Play'
          track.statusDisplay = '';
        }
      });
    });

    if (mediaItem.playbackState === 'Paused') {
      // Load and play the new track.
      const resolvedUrl = mediaItem.resourceURL.includes('soundcloud.com') ? mediaItem.resourceURL : `https://api.soundcloud.com/tracks/${mediaItem.resourceURL}`;
      _audioPlayerWidget.load(resolvedUrl, {
        show_artwork: false,
        auto_play: true,
        show_comments: false,
        buying: false,
        liking: false,
        sharing: false,
        show_playcount: false,
        show_user: false,
        visual: false // Ensure visualizer is off by default
      });
      mediaItem.playbackState = 'Playing';
      mediaItem.statusDisplay = '▶ Playing';
      console.log(`Playing: ${mediaItem.title}`);
    } else if (mediaItem.playbackState === 'Playing') {
      // Pause the current track.
      _audioPlayerWidget.pause();
      mediaItem.playbackState = 'Paused';
      mediaItem.statusDisplay = '';
      console.log(`Paused: ${mediaItem.title}`);
    } else {
      console.warn('Unknown playback state for media item:', mediaItem);
    }
  };

  /**
   * Initiates playback of the first track in the currently active collection.
   * If no collection is active or it's empty, it will log a warning.
   */
  $viewScope.startCollectionPlayback = () => {
    const activeCollection = $viewScope.getActiveCollection();
    if (!activeCollection) {
      alert('Please select a collection to play.');
      console.warn('Attempted to start playback without an active collection.');
      return;
    }
    if (!activeCollection.tracks || activeCollection.tracks.length === 0) {
      alert('This collection has no media items to play.');
      console.warn('Attempted to start playback on an empty collection.');
      return;
    }

    // Ensure currentTrackIndex is valid, reset if out of bounds.
    if (activeCollection.currentTrackIndex >= activeCollection.tracks.length || activeCollection.currentTrackIndex < 0) {
      activeCollection.currentTrackIndex = 0;
    }

    const firstTrack = activeCollection.tracks[activeCollection.currentTrackIndex];
    if (firstTrack) {
      $viewScope.managePlayback(firstTrack);
      console.log(`Starting playback for collection "${activeCollection.collectionName}" with track "${firstTrack.title}".`);
    } else {
      console.warn('No valid first track found in the active collection.');
    }
  };

  /**
   * Advances to the next track in the specified collection.
   * If it's the last track, it loops back to the beginning.
   * @param {object} targetCollection - The collection to advance track in.
   */
  $viewScope.advanceTrack = (targetCollection) => {
    if (!targetCollection || !targetCollection.tracks || targetCollection.tracks.length === 0) {
      console.warn('Cannot advance track: Invalid or empty collection.');
      return;
    }

    // Increment track index, loop if at the end.
    targetCollection.currentTrackIndex = (targetCollection.currentTrackIndex + 1) % targetCollection.tracks.length;

    const nextTrack = targetCollection.tracks[targetCollection.currentTrackIndex];
    if (nextTrack) {
      $viewScope.managePlayback(nextTrack);
      console.log(`Skipped to next track: "${nextTrack.title}" in collection "${targetCollection.collectionName}".`);
    } else {
      console.warn('No next track found, perhaps collection became empty?');
    }
  };

  /**
   * Adds a new media item (track) to the currently active collection.
   * Resolves the URL via SoundCloud API before adding.
   */
  $viewScope.addNewMediaItem = async () => {
    const activeCollection = $viewScope.getActiveCollection();
    if (!activeCollection) {
      alert('Please select a collection before adding new media items.');
      return;
    }

    const itemTitle = $viewScope.formItemTitle;
    const itemURL = $viewScope.formItemURL;

    if (!itemTitle || !itemURL) {
      alert('Both title and URL are required for a new media item.');
      return;
    }

    // Basic URL validation
    if (!itemURL.startsWith('http://') && !itemURL.startsWith('https://')) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }

    $('#track-submission-form .loading-indicator').fadeIn();
    let resolvedTrackId = '';

    try {
      // Assuming `CLIENT_ID` is globally available for SoundCloud API.
      if (typeof CLIENT_ID === 'undefined' || CLIENT_ID === '') {
        throw new Error('SoundCloud CLIENT_ID is not defined. Cannot resolve track URL.');
      }

      const resolveApiUrl = `https://api.soundcloud.com/resolve.json?url=${encodeURIComponent(itemURL)}&client_id=${CLIENT_ID}`;
      const response = await fetch(resolveApiUrl);
      if (!response.ok) {
        throw new Error(`API resolution failed: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();

      if (data && data.kind === 'track' && data.id) {
        resolvedTrackId = data.id; // Store only the ID for the widget
        $viewScope.$apply(() => {
          activeCollection.tracks.push({
            id: `t_${Date.now()}`, // Unique ID for the track
            title: itemTitle,
            resourceURL: resolvedTrackId, // Store SC track ID, not original URL
            playbackState: 'Paused',
            statusDisplay: ''
          });
          $viewScope.formItemTitle = '';
          $viewScope.formItemURL = '';
          alert('Media item added successfully!');
        });
      } else {
        throw new Error('Provided URL did not resolve to a valid SoundCloud track.');
      }
    } catch (error) {
      console.error('Error adding new media item:', error);
      alert(`Failed to add media item: ${error.message || 'Unknown error. Check console for details.'}`);
    } finally {
      $('#track-submission-form .loading-indicator').hide();
      $('#track-submission-form').fadeOut();
    }
  };

  /**
   * Allows editing the title of a specific media item.
   * @param {object} itemToEdit - The media item object whose title is to be edited.
   */
  $viewScope.modifyMediaItemTitle = (itemToEdit) => {
    if (!itemToEdit) {
      console.warn('No media item provided for title modification.');
      return;
    }
    const currentTitle = itemToEdit.title || '';
    const newTitle = prompt('Enter the new title for this media item:', currentTitle);
    if (newTitle && newTitle.trim() !== currentTitle.trim()) {
      itemToEdit.title = newTitle.trim();
      console.log(`Media item title updated to: "${newTitle}".`);
    } else if (newTitle === null) {
      console.log('Media item title edit cancelled.');
    }
  };

  /**
   * Deletes a specified media item from the currently active collection.
   * @param {object} itemToRemove - The media item to be deleted.
   */
  $viewScope.removeMediaItem = (itemToRemove) => {
    const activeCollection = $viewScope.getActiveCollection();
    if (!activeCollection) {
      alert('No active collection found to remove items from.');
      return;
    }
    if (!itemToRemove) {
      console.warn('No media item provided for removal.');
      return;
    }

    if (confirm(`Are you sure you want to permanently delete "${itemToRemove.title}"?`)) {
      activeCollection.tracks = activeCollection.tracks.filter(item => item !== itemToRemove);
      console.log(`Media item "${itemToRemove.title}" removed.`);

      // If the removed item was playing, stop playback and hide player.
      if (itemToRemove.playbackState === 'Playing') {
        if (_audioPlayerWidget) {
          _audioPlayerWidget.pause();
        }
        $('#audio-player-display').fadeOut();
        console.log('Stopped playback due to track removal.');
      }

      // Adjust current track index if necessary
      if (activeCollection.currentTrackIndex >= activeCollection.tracks.length) {
        activeCollection.currentTrackIndex = Math.max(0, activeCollection.tracks.length - 1);
      }
    } else {
      console.log('Media item removal cancelled.');
    }
  };

  /**
   * Creates and adds a new media collection.
   */
  $viewScope.createCollection = () => {
    const collectionName = $viewScope.formCollectionName;
    const collectionDescription = $viewScope.formCollectionDescription;

    if (!collectionName || collectionName.trim() === '') {
      alert('Collection name cannot be empty.');
      return;
    }

    // Check for duplicate names (case-insensitive)
    const isDuplicate = $viewScope.mediaCollections.some(
      col => col.collectionName.toLowerCase() === collectionName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert(`A collection named "${collectionName}" already exists. Please choose a different name.`);
      return;
    }

    // Deselect any currently active collection.
    $viewScope.mediaCollections.forEach(col => {
      col.selected = false;
    });

    const newCollection = {
      collectionId: `col_${Date.now()}`, // Simple unique ID
      collectionName: collectionName.trim(),
      description: collectionDescription ? collectionDescription.trim() : '',
      selected: true,
      currentTrackIndex: 0,
      tracks: []
    };
    $viewScope.mediaCollections.push(newCollection); // Add to the end

    // Reset form fields
    $viewScope.formCollectionName = '';
    $viewScope.formCollectionDescription = '';

    // Show main content area and hide the form.
    $('#main-content-area').css({ 'visibility': 'visible', 'opacity': 1 });
    $('#collection-creation-form').fadeOut();
    console.log(`New collection "${newCollection.collectionName}" created and activated.`);
  };

  /**
   * Edits the name of the currently active collection.
   */
  $viewScope.editActiveCollectionName = () => {
    const activeCollection = $viewScope.getActiveCollection();
    if (!activeCollection) {
      alert('No collection is currently active to edit.');
      return;
    }
    const currentName = activeCollection.collectionName;
    const newName = prompt('Enter the new name for this collection:', currentName);
    if (newName && newName.trim() !== currentName.trim()) {
      // Check for uniqueness again
      const isDuplicate = $viewScope.mediaCollections.some(
        col => col !== activeCollection && col.collectionName.toLowerCase() === newName.trim().toLowerCase()
      );
      if (isDuplicate) {
        alert(`A collection named "${newName}" already exists. Please choose a different name.`);
        return;
      }
      activeCollection.collectionName = newName.trim();
      console.log(`Collection name updated to: "${newName}".`);
    } else if (newName === null) {
      console.log('Collection name edit cancelled.');
    }
  };

  /**
   * Edits the description of the currently active collection.
   */
  $viewScope.editActiveCollectionDescription = () => {
    const activeCollection = $viewScope.getActiveCollection();
    if (!activeCollection) {
      alert('No collection is currently active to edit.');
      return;
    }
    const currentDescription = activeCollection.description || '';
    const newDescription = prompt('Enter the new description for this collection:', currentDescription);
    if (newDescription && newDescription.trim() !== currentDescription.trim()) {
      activeCollection.description = newDescription.trim();
      console.log(`Collection description updated to: "${newDescription}".`);
    } else if (newDescription === null) {
      console.log('Collection description edit cancelled.');
    }
  };

  /**
   * Deletes the currently active media collection.
   */
  $viewScope.removeActiveCollection = () => {
    const activeCollection = $viewScope.getActiveCollection();
    if (!activeCollection) {
      alert('No collection is currently active to delete.');
      return;
    }

    if (confirm(`Are you absolutely sure you want to delete the collection "${activeCollection.collectionName}" and all its contents? This action cannot be undone.`)) {
      // Find the index and remove it.
      const indexToRemove = $viewScope.mediaCollections.indexOf(activeCollection);
      if (indexToRemove > -1) {
        $viewScope.mediaCollections.splice(indexToRemove, 1);
        console.log(`Collection "${activeCollection.collectionName}" permanently removed.`);
      }

      // Hide the main content area as no collection is selected.
      $('#main-content-area').css({ 'visibility': 'hidden', 'opacity': 0 });

      // If a track from this collection was playing, stop it.
      if (_audioPlayerWidget) {
        _audioPlayerWidget.pause();
        $('#audio-player-display').fadeOut();
      }
    } else {
      console.log('Collection deletion cancelled.');
    }
  };

  /**
   * Resets all collections to the initial sample data and saves.
   */
  $viewScope.restoreDefaultContent = () => {
    if (confirm('Are you sure you want to reset all your collections to the default sample data? All current changes will be lost.')) {
      $viewScope.mediaCollections = _initialContentData.map(col => ({ ...col })); // Deep copy to prevent direct mutation
      _persistCollectionData();
      alert('Collections reset to sample data!');
      console.log('Collections reset to default initial content.');
      // Hide main content area if no collection is automatically selected by default data
      if (!$viewScope.getActiveCollection()) {
        $('#main-content-area').css({ 'visibility': 'hidden', 'opacity': 0 });
      }
      // Stop any playing audio
      if (_audioPlayerWidget) {
        _audioPlayerWidget.pause();
        $('#audio-player-display').fadeOut();
      }
    }
  };

  // --- Initialization Call ---
  _initializeDataStore();
}