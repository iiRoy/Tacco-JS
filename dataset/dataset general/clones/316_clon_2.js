( function ( $j ) {
  'use strict';
  $j( 'audio[controls]' ) . before( function () {
    // Reference to the original audio element
    var _audioTrack = this;

    // Disable native controls to use custom player
    _audioTrack . controls = false;

    // Create the main container for the custom player
    var _playerWrapper = document . createElement( 'div' );
    $j( _playerWrapper ) . addClass( $j( _audioTrack ) . attr( 'class' ) + ' card bg-light mb-3 media-player-custom' );

    // Section for additional media details, initially hidden
    var _infoPanel = document . createElement( 'section' );
    $j( _infoPanel ) . addClass( 'collapse hide-details' );

    // Container for the details toggle button
    var _toggleButtonHolder = document . createElement( 'div' );
    $j( _toggleButtonHolder ) . addClass( 'btn-group d-flex flex-row' );

    // Button to show/hide media details
    var _detailsExpander = document . createElement( 'a' );
    $j( _detailsExpander ) . html( '<i class="fa-solid fa-bars"></i>' ); // Changed icon
    $j( _detailsExpander ) . addClass( 'btn btn-outline-secondary flex-grow-1' );
    $j( _detailsExpander ) . attr( 'style', 'opacity:0.25' ); // Slightly different opacity
    $j( _detailsExpander ) . on( 'click', function () {
      $j( _infoPanel ) . collapse( 'toggle' );
    } );
    $j( _detailsExpander ) . attr( 'title', 'View More Information' );
    $j( _detailsExpander ) . tooltip( {
      'container': 'body',
      'placement': 'top',
      'html': true
    } );
    $j( _toggleButtonHolder ) . append( _detailsExpander );

    // Table to display media metadata
    var _metadataTable = document . createElement( 'table' );
    $j( _metadataTable ) . addClass( 'table table-sm table-borderless mt-2' );

    // Section for playback controls
    var _controlBar = document . createElement( 'section' );
    $j( _controlBar ) . addClass( 'btn-group d-flex flex-row flex-wrap align-items-center' );

    // Function to handle errors during media loading/playback
    var _playbackErrorHandler = function () {
      console . error( 'Media playback issue detected.' );
      $j( _playerWrapper ) . find( '.btn' ) . addClass( 'disabled' );
      $j( _playerWrapper ) . find( 'input[type="range"]' ) . hide();
      $j( _playerWrapper ) . find( '.fa-spin' ) . text( 'Error' ); // Changed icon class
      $j( _playerWrapper ) . find( '.fa-spin' ) . parent() . attr( 'title', 'Failed to load the audio content.' );
      $j( _playerWrapper ) . find( '.fa-spin' ) . parent() . tooltip( 'fixTitle' );
      $j( _playerWrapper ) . find( '.fa-spin' ) . removeClass( 'fa-spinner fa-spin' ); // Changed icon class
    };

    // Adds the play/pause button to the control bar
    var _createPlayPauseControl = function () {
      var _playPauseBtn = document . createElement( 'button' );
      $j( _playPauseBtn ) . addClass( 'btn btn-secondary disabled col-1' ); // Changed class

      // Updates the button icon and click action based on playback state
      _playPauseBtn . setPlaybackState = function ( _actionType ) {
        $j( _playPauseBtn ) . removeClass( 'disabled' );
        if ( _actionType === 'start' ) {
          $j( _playPauseBtn ) . html( '<i class="fa-solid fa-play"></i>' ); // Changed icon
          $j( _playPauseBtn ) . off( 'click' ) . on( 'click', function () {
            _audioTrack . play();
          } );
        }
        if ( _actionType === 'stop' ) {
          $j( _playPauseBtn ) . html( '<i class="fa-solid fa-pause"></i>' ); // Changed icon
          $j( _playPauseBtn ) . off( 'click' ) . on( 'click', function () {
            _audioTrack . pause();
          } );
        }
      };

      // Event listeners for audio playback state changes
      $j( _audioTrack ) . on( 'play', function () {
        _playPauseBtn . setPlaybackState( 'stop' );
      } );
      $j( _audioTrack ) . on( 'canplay', function () {
        _playPauseBtn . setPlaybackState( 'start' );
      } );
      $j( _audioTrack ) . on( 'pause', function () {
        _playPauseBtn . setPlaybackState( 'start' );
      } );

      var _checkAttempts = 0; // Renamed variable
      var _loadingMonitor = setInterval( function () { // Renamed interval variable
        if ( isNaN( _audioTrack . duration ) === false ) {
          _playPauseBtn . setPlaybackState( 'start' );
          clearInterval( _loadingMonitor );
          return true;
        }
        if ( _audioTrack . networkState === 3 || _checkAttempts === 150 ) { // Changed timeout value
          _playbackErrorHandler();
          clearInterval( _loadingMonitor );
          return false;
        }
        _checkAttempts++;
      }, 50 ); // Time interval remains constant

      $j( _controlBar ) . append( _playPauseBtn );
    };

    // Adds the seek/progress bar to the control bar
    var _createProgressSlider = function () {
      var _timelineSlider = document . createElement( 'input' );
      $j( _timelineSlider ) . attr( {
        'type': 'range',
        'min': 0,
        'value': 0,
        'class': 'timeline-slider' // Changed class name
      } );

      // Updates the background of the slider to show played and buffered progress
      _timelineSlider . refreshVisuals = function () {
        var _gradientString = 'rgba(200, 230, 200, 1) 0%'; // Changed color
        _gradientString += ', rgba(200, 230, 200, 1) ' + ( ( _audioTrack . currentTime / _audioTrack . duration ) * 100 ) + '%';
        _gradientString += ', rgba(200, 230, 200, 0) ' + ( ( _audioTrack . currentTime / _audioTrack . duration ) * 100 ) + '%';
        for ( var _idx = 0; _idx < _audioTrack . buffered . length; _idx++ ) { // Changed loop variable
          if ( _audioTrack . buffered . end( _idx ) > _audioTrack . currentTime && isNaN( _audioTrack . buffered . end( _idx ) ) === false && isNaN( _audioTrack . buffered . start( _idx ) ) === false ) {
            var _bufferStartPercent;
            var _bufferEndPercent;
            if ( _audioTrack . buffered . end( _idx ) < _audioTrack . duration ) {
              _bufferEndPercent = ( ( _audioTrack . buffered . end( _idx ) / _audioTrack . duration ) * 100 );
            } else {
              _bufferEndPercent = 100;
            }
            if ( _audioTrack . buffered . start( _idx ) > _audioTrack . currentTime ) {
              _bufferStartPercent = ( ( _audioTrack . buffered . start( _idx ) / _audioTrack . duration ) * 100 );
            } else {
              _bufferStartPercent = ( ( _audioTrack . currentTime / _audioTrack . duration ) * 100 );
            }
            _gradientString += ', rgba(190, 220, 240, 0) ' + _bufferStartPercent + '%'; // Changed color
            _gradientString += ', rgba(190, 220, 240, 1) ' + _bufferStartPercent + '%'; // Changed color
            _gradientString += ', rgba(190, 220, 240, 1) ' + _bufferEndPercent + '%'; // Changed color
            _gradientString += ', rgba(190, 220, 240, 0) ' + _bufferEndPercent + '%'; // Changed color
          }
        }
        $j( _timelineSlider ) . css( 'background', '-webkit-linear-gradient(left, ' + _gradientString + ')' );
        // The following lines are commented out as per the original code's intent for other browsers.
        // $j(_timelineSlider).css('background','-o-linear-gradient(left,  ' + _gradientString + ')');
        // $j(_timelineSlider).css('background','-moz-linear-gradient(left,  ' + _gradientString + ')');
        // $j(_timelineSlider).css('background','-ms-linear-gradient(left,  ' + _gradientString + ')');
        // $j(_timelineSlider).css('background','linear-gradient(to right,  ' + _gradientString + ')');
        $j( _timelineSlider ) . css( 'background-color', '#ccc' ); // Changed color
      };

      // Sets the slider value to the current media time
      _timelineSlider . updatePosition = function () {
        $j( _timelineSlider ) . val( _audioTrack . currentTime );
        _timelineSlider . refreshVisuals();
      };

      // Handles slider changes to update media current time
      _timelineSlider . onSliderChange = function () {
        _audioTrack . currentTime = $j( _timelineSlider ) . val();
        _timelineSlider . refreshVisuals();
      };

      // Initializes the slider's max value and step based on media duration
      _timelineSlider . setupSlider = function () {
        $j( _timelineSlider ) . attr( {
          'max': _audioTrack . duration,
          'step': _audioTrack . duration / 100
        } );
        _timelineSlider . updatePosition();
      };

      // Resets the slider and media position to the beginning
      _timelineSlider . resetToStart = function () {
        $j( _timelineSlider ) . val( 0 );
        _audioTrack . currentTime = $j( _timelineSlider ) . val();
        if ( !_audioTrack . loop ) {
          _audioTrack . pause();
        } else {
          _audioTrack . play();
        }
      };

      var _sliderContainer = document . createElement( 'div' );
      $j( _sliderContainer ) . addClass( 'btn btn-secondary disabled col-4' ); // Changed class

      $j( _sliderContainer ) . append( _timelineSlider );
      $j( _timelineSlider ) . on( 'change', _timelineSlider . onSliderChange );
      $j( _audioTrack ) . on( 'timeupdate', _timelineSlider . setupSlider );
      $j( _audioTrack ) . on( 'loadedmetadata', _timelineSlider . setupSlider );
      $j( _audioTrack ) . on( 'loadeddata', _timelineSlider . setupSlider );
      $j( _audioTrack ) . on( 'progress', _timelineSlider . setupSlider );
      $j( _audioTrack ) . on( 'canplay', _timelineSlider . setupSlider );
      $j( _audioTrack ) . on( 'canplaythrough', _timelineSlider . setupSlider );
      $j( _audioTrack ) . on( 'ended', _timelineSlider . resetToStart );
      if ( _audioTrack . readyState > 0 ) {
        _timelineSlider . setupSlider();
      }
      $j( _controlBar ) . append( _sliderContainer );
    };

    // Adds the current time / duration display to the control bar
    var _createTimeDisplay = function () {
      var _timeTextElement = document . createElement( 'a' );
      $j( _timeTextElement ) . addClass( 'btn btn-secondary col-3' ); // Changed class
      $j( _timeTextElement ) . tooltip( {
        'container': 'body',
        'placement': 'right',
        'html': true
      } );

      // Formats a number to always have two digits (e.g., 5 -> "05")
      _timeTextElement . formatDoubleDigit = function ( _inputNum ) {
        return ( "0" + _inputNum ) . slice( -2 );
      };

      // Converts seconds into a formatted time string (HH:MM:SS)
      _timeTextElement . formatSecondsToTime = function ( _totalSeconds ) {
        if ( isNaN( _totalSeconds ) ) {
          return '<i class="fa-solid fa-spinner fa-spin"></i>'; // Changed icon
        }
        var _hours = Math . floor( _totalSeconds / 3600 );
        var _minutes = Math . floor( _totalSeconds / 60 ) - ( _hours * 60 );
        var _seconds = Math . floor( _totalSeconds ) - ( _hours * 3600 ) - ( _minutes * 60 );
        var _timeString = _timeTextElement . formatDoubleDigit( _minutes ) + ':' + _timeTextElement . formatDoubleDigit( _seconds );
        if ( _hours > 0 ) {
          _timeString = _hours + ':' + _timeString;
        }
        return _timeString;
      };

      // Updates the displayed time and tooltip information
      _timeTextElement . updateTimeView = function () {
        $j( _timeTextElement ) . html( _timeTextElement . formatSecondsToTime( _audioTrack . duration ) );
        $j( _timeTextElement ) . attr( {
          'title': 'Click to Rewind<hr style="padding:0; margin:0;" />Current Position: ' + ( _timeTextElement . formatSecondsToTime( _audioTrack . currentTime ) )
        } );
        if ( !_audioTrack . paused ) {
          $j( _timeTextElement ) . html( _timeTextElement . formatSecondsToTime( _audioTrack . currentTime ) );
          $j( _timeTextElement ) . attr( {
            'title': 'Click to Rewind<hr style="padding:0; margin:0;" />Total Length: ' + ( _timeTextElement . formatSecondsToTime( _audioTrack . duration ) )
          } );
        }
        $j( _timeTextElement ) . tooltip( 'fixTitle' );
      };

      // Click handler to reset playback to start
      $j( _timeTextElement ) . on( 'click', function () {
        _audioTrack . pause();
        _audioTrack . currentTime = 0;
        _timeTextElement . updateTimeView();
        $j( _timeTextElement ) . tooltip( 'fixTitle' );
        $j( _timeTextElement ) . tooltip( 'show' );
      } );
      $j( _timeTextElement ) . tooltip( 'show' );

      // Attach event listeners for time updates
      $j( _audioTrack ) . on( 'loadedmetadata', _timeTextElement . updateTimeView );
      $j( _audioTrack ) . on( 'loadeddata', _timeTextElement . updateTimeView );
      $j( _audioTrack ) . on( 'progress', _timeTextElement . updateTimeView );
      $j( _audioTrack ) . on( 'canplay', _timeTextElement . updateTimeView );
      $j( _audioTrack ) . on( 'canplaythrough', _timeTextElement . updateTimeView );
      $j( _audioTrack ) . on( 'timeupdate', _timeTextElement . updateTimeView );

      if ( _audioTrack . readyState > 0 ) {
        _timeTextElement . updateTimeView();
      } else {
        $j( _timeTextElement ) . html( '<i class="fa-solid fa-spinner fa-spin"></i>' ); // Changed icon
      }
      $j( _controlBar ) . append( _timeTextElement );
    };

    // Adds the mute/unmute button to the control bar
    var _createMuteControl = function () {
      var _muteButton = document . createElement( 'button' );
      $j( _muteButton ) . addClass( 'btn btn-secondary col-1' ); // Changed class

      // Checks current volume and updates the mute button icon
      _muteButton . displayVolumeIcon = function () {
        if ( _audioTrack . volume > 0.5 && !_audioTrack . muted ) {
          $j( _muteButton ) . html( '<i class="fa-solid fa-volume-up"></i>' ); // Changed icon
        } else if ( _audioTrack . volume < 0.5 && _audioTrack . volume > 0 && !_audioTrack . muted ) {
          $j( _muteButton ) . html( '<i class="fa-solid fa-volume-down"></i>' ); // Changed icon
        } else {
          $j( _muteButton ) . html( '<i class="fa-solid fa-volume-off"></i>' ); // Changed icon
        }
      };

      // Toggles mute state on click
      $j( _muteButton ) . on( 'click', function () {
        if ( _audioTrack . muted ) {
          _audioTrack . muted = false;
          _audioTrack . volume = _audioTrack . previousVolume; // Renamed property
        } else {
          _audioTrack . muted = true;
          _audioTrack . previousVolume = _audioTrack . volume; // Renamed property
          _audioTrack . volume = 0;
        }
        _muteButton . displayVolumeIcon();
      } );

      _muteButton . displayVolumeIcon();
      $j( _audioTrack ) . on( 'volumechange', _muteButton . displayVolumeIcon );
      $j( _controlBar ) . append( _muteButton );
    };

    // Adds the volume slider to the control bar
    var _createVolumeSlider = function () {
      var _volumeInputSlider = document . createElement( 'input' );
      $j( _volumeInputSlider ) . attr( {
        'type': 'range',
        'min': 0,
        'max': 1,
        'step': 1 / 100,
        'value': 1
      } );

      // Handles slider changes to adjust media volume
      _volumeInputSlider . adjustMediaVolume = function () {
        _audioTrack . muted = false;
        _audioTrack . volume = $j( _volumeInputSlider ) . val();
      };

      // Updates the slider position based on media volume
      _volumeInputSlider . updateSliderPosition = function () {
        $j( _volumeInputSlider ) . val( _audioTrack . volume );
      };

      var _volumeSliderContainer = document . createElement( 'div' );
      $j( _volumeSliderContainer ) . addClass( 'btn btn-secondary disabled col-3' ); // Changed class

      $j( _volumeSliderContainer ) . append( _volumeInputSlider );
      $j( _volumeInputSlider ) . on( "change", _volumeInputSlider . adjustMediaVolume );
      $j( _audioTrack ) . on( 'volumechange', _volumeInputSlider . updateSliderPosition );
      $j( _controlBar ) . append( _volumeSliderContainer );
    };

    // Adds album art image to the details panel
    var _addCoverArt = function () {
      var _coverImage = document . createElement( 'img' );
      $j( _coverImage ) . addClass( 'img-thumbnail' ); // Changed class
      $j( _coverImage ) . attr( 'src', $j( _audioTrack ) . data( 'mediaCoverArt' ) ); // Changed data key
      $j( _infoPanel ) . append( _coverImage );
    };

    // Adds a single row of metadata to the details table
    var _addMetadataRow = function ( _label, _dataAttributeKey ) {
      var _tableRow = document . createElement( 'tr' );
      var _rowHeader = document . createElement( 'th' );
      var _rowData = document . createElement( 'td' );
      $j( _rowHeader ) . html( _label );
      $j( _rowData ) . html( $j( _audioTrack ) . data( _dataAttributeKey ) );
      $j( _tableRow ) . append( _rowHeader );
      $j( _tableRow ) . append( _rowData );
      $j( _metadataTable ) . append( _tableRow );
    };

    // Populates the details panel with available metadata
    var _populateDetailsPanel = function () {
      if ( typeof ( $j( _audioTrack ) . data( 'mediaCoverArt' ) ) !== 'undefined' ) { // Changed data key
        _addCoverArt();
      }
      if ( typeof ( $j( _audioTrack ) . data( 'mediaArtist' ) ) !== 'undefined' ) { // Changed data key
        _addMetadataRow( 'Performer', 'mediaArtist' ); // Changed label and data key
      }
      if ( typeof ( $j( _audioTrack ) . data( 'mediaTitle' ) ) !== 'undefined' ) { // Changed data key
        _addMetadataRow( 'Track Title', 'mediaTitle' ); // Changed label and data key
      }
      if ( typeof ( $j( _audioTrack ) . data( 'mediaAlbum' ) ) !== 'undefined' ) { // Changed data key
        _addMetadataRow( 'Album Name', 'mediaAlbum' ); // Changed label and data key
      }
      if ( typeof ( $j( _audioTrack ) . data( 'mediaLabel' ) ) !== 'undefined' ) { // Changed data key
        _addMetadataRow( 'Record Label', 'mediaLabel' ); // Changed label and data key
      }
      if ( typeof ( $j( _audioTrack ) . data( 'mediaReleaseYear' ) ) !== 'undefined' ) { // Changed data key
        _addMetadataRow( 'Release Year', 'mediaReleaseYear' ); // Changed label and data key
      }
      if ( $j( _metadataTable ) . html() !== "" ) {
        $j( _infoPanel ) . append( _metadataTable );
        $j( _playerWrapper ) . append( _toggleButtonHolder );
        $j( _playerWrapper ) . append( _infoPanel );
      }
    };

    // Assembles the main playback controls
    var _assemblePlaybackControls = function () {
      if ( $j( _audioTrack ) . data( 'enablePlay' ) !== 'off' ) { // Changed data key
        _createPlayPauseControl();
      }
      if ( $j( _audioTrack ) . data( 'enableSeek' ) !== 'off' ) { // Changed data key
        _createProgressSlider();
      }
      if ( $j( _audioTrack ) . data( 'enableTime' ) !== 'off' ) { // Changed data key
        _createTimeDisplay();
      }
      if ( $j( _audioTrack ) . data( 'enableMute' ) !== 'off' ) { // Changed data key
        _createMuteControl();
      }
      if ( $j( _audioTrack ) . data( 'enableVolume' ) !== 'off' ) { // Changed data key
        _createVolumeSlider();
      }
      $j( _playerWrapper ) . append( _controlBar );
    };

    // Adds attribution/credit text to the player
    var _addCreditsInfo = function () {
      var _creditElement = document . createElement( 'small' );
      $j( _creditElement ) . addClass( 'float-end text-muted' ); // Changed class

      if ( typeof ( $j( _audioTrack ) . data( 'creditLink' ) ) !== 'undefined' ) { // Changed data key
        var _creditAnchor = document . createElement( 'a' );
        $j( _creditAnchor ) . addClass( 'text-muted' );
        $j( _creditAnchor ) . attr( 'href', $j( _audioTrack ) . data( 'creditLink' ) ); // Changed data key
        $j( _creditAnchor ) . html( $j( _audioTrack ) . data( 'creditText' ) ); // Changed data key
        $j( _creditElement ) . append( _creditAnchor );
      } else {
        $j( _creditElement ) . html( $j( _audioTrack ) . data( 'creditText' ) ); // Changed data key
      }
      $j( _playerWrapper ) . append( _creditElement );
    };

    // Main function to build the entire custom player interface
    var _initializePlayerUI = function () {
      _populateDetailsPanel();
      _assemblePlaybackControls();
      if ( typeof ( $j( _audioTrack ) . data( 'creditText' ) ) !== 'undefined' ) { // Changed data key
        _addCreditsInfo();
      }
    };

    _initializePlayerUI(); // Execute player UI initialization

    // Attach a global error listener to the audio element
    $j( _audioTrack ) . on( 'error', function () {
      _playbackErrorHandler();
    } );

    // Return the newly created player container
    return _playerWrapper;
  } );
} )( jQuery )