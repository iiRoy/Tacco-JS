SCENE_UTILITIES.OrbitNavigator = function ( model_item, input_element ) {

  var current_instance = this;
  var INTERACTION_MODE = { IDLE: -1, SPIN: 0, MAGNIFY: 1, SHIFT: 2, FINGER_SPIN: 3, FINGER_MAGNIFY: 4, FINGER_SHIFT: 5 };

  this.controlled_item = model_item;
  this.interaction_source = ( input_element !== undefined ) ? input_element : document;

  // Controller properties
  this.active = true;

  this.viewport_info = { display_width: 0, display_height: 0, left_offset_px: 0, top_offset_px: 0 };
  this.control_radius = ( this.viewport_info.display_width + this.viewport_info.display_height ) / 4;

  this.spin_rate = 1.0;
  this.magnify_rate = 1.2;
  this.shift_rate = 0.3;

  this.disable_spin = false;
  this.disable_magnify = false;
  this.disable_shift = false;

  this.fixed_movement = false;
  this.kinetic_decay_factor = 0.2;

  this.minimum_view_distance = 0;
  this.maximum_view_distance = Infinity;

  this.key_bindings = [ 65 /* A for spin */, 83 /* S for magnify */, 68 /* D for shift */ ];

  // Internal state variables
  this.focus_point = new VEC3();

  var previous_item_pos = new VEC3();

  var current_mode_val = INTERACTION_MODE.IDLE,
    prior_mode_val = INTERACTION_MODE.IDLE,

    camera_vector = new VEC3(),

    spin_start_vec = new VEC3(),
    spin_end_vec = new VEC3(),

    magnify_start_pt = new VEC2(),
    magnify_end_pt = new VEC2(),

    finger_zoom_dist_initial = 0,
    finger_zoom_dist_final = 0,

    shift_start_pt = new VEC2(),
    shift_end_pt = new VEC2();

  // For resetting the view
  this.initial_focus_point = this.focus_point.clone();
  this.initial_item_position = this.controlled_item.position.clone();
  this.initial_up_direction = this.controlled_item.up.clone();

  // Event dispatch setup
  var update_notification = { type: 'render_update' };

  // Control methods
  this.adjustViewportDimensions = function () {
    this.viewport_info.display_width = window.innerWidth;
    this.viewport_info.display_height = window.innerHeight;

    this.viewport_info.left_offset_px = 0;
    this.viewport_info.top_offset_px = 0;

    this.control_radius = ( this.viewport_info.display_width + this.viewport_info.display_height ) / 4;
  };

  this.processInputEvent = function ( evt_obj ) {
    if ( typeof this[ evt_obj.type ] == 'function' ) {
      this[ evt_obj.type ]( evt_obj );
    }
  };

  this.getPointerOnCanvas = function ( client_x_coord, client_y_coord ) {
    return new VEC2(
      ( client_x_coord - current_instance.viewport_info.left_offset_px ) / current_instance.control_radius * 0.5,
      ( client_y_coord - current_instance.viewport_info.top_offset_px ) / current_instance.control_radius * 0.5
    );
  };

  this.getPointerProjectionOnSphere = function ( client_x_coord, client_y_coord ) {
    var pointer_on_ball = new VEC3(
      ( client_x_coord - current_instance.viewport_info.display_width * 0.5 - current_instance.viewport_info.left_offset_px ) / current_instance.control_radius,
      ( current_instance.viewport_info.display_height * 0.5 + current_instance.viewport_info.top_offset_px - client_y_coord ) / current_instance.control_radius,
      0.0
    );

    var len_val = pointer_on_ball.length();

    if ( len_val > 1.0 ) {
      pointer_on_ball.normalize();
    } else {
      pointer_on_ball.z = Math.sqrt( 1.0 - len_val * len_val );
    }

    camera_vector.copy( current_instance.controlled_item.position ).sub( current_instance.focus_point );

    var proj_vec = current_instance.controlled_item.up.clone().setLength( pointer_on_ball.y );
    proj_vec.add( current_instance.controlled_item.up.clone().cross( camera_vector ).setLength( pointer_on_ball.x ) );
    proj_vec.add( camera_vector.setLength( pointer_on_ball.z ) );

    return proj_vec;
  };

  this.performSpin = function () {
    var rotation_angle = Math.acos( spin_start_vec.dot( spin_end_vec ) / spin_start_vec.length() / spin_end_vec.length() );

    if ( rotation_angle ) {
      var rotation_axis = ( new VEC3() ).crossVectors( spin_start_vec, spin_end_vec ).normalize(),
        rotation_quat = new QUAT();

      rotation_angle *= current_instance.spin_rate;

      rotation_quat.setFromAxisAngle( rotation_axis, -rotation_angle );

      camera_vector.applyQuaternion( rotation_quat );
      current_instance.controlled_item.up.applyQuaternion( rotation_quat );

      spin_end_vec.applyQuaternion( rotation_quat );

      if ( current_instance.fixed_movement ) {
        spin_start_vec.copy( spin_end_vec );
      } else {
        rotation_quat.setFromAxisAngle( rotation_axis, rotation_angle * ( current_instance.kinetic_decay_factor - 1.0 ) );
        spin_start_vec.applyQuaternion( rotation_quat );
      }
    }
  };

  this.performMagnify = function () {
    if ( current_mode_val === INTERACTION_MODE.FINGER_MAGNIFY ) {
      var scale_factor = finger_zoom_dist_initial / finger_zoom_dist_final;
      finger_zoom_dist_initial = finger_zoom_dist_final;
      camera_vector.multiplyScalar( scale_factor );
    } else {
      var scale_factor = 1.0 + ( magnify_end_pt.y - magnify_start_pt.y ) * current_instance.magnify_rate;

      if ( scale_factor !== 1.0 && scale_factor > 0.0 ) {
        camera_vector.multiplyScalar( scale_factor );

        if ( current_instance.fixed_movement ) {
          magnify_start_pt.copy( magnify_end_pt );
        } else {
          magnify_start_pt.y += ( magnify_end_pt.y - magnify_start_pt.y ) * this.kinetic_decay_factor;
        }
      }
    }
  };

  this.performShift = function () {
    var pointer_change = shift_end_pt.clone().sub( shift_start_pt );

    if ( pointer_change.lengthSq() ) {
      pointer_change.multiplyScalar( camera_vector.length() * current_instance.shift_rate );

      var pan_displacement = camera_vector.clone().cross( current_instance.controlled_item.up ).setLength( pointer_change.x );
      pan_displacement.add( current_instance.controlled_item.up.clone().setLength( pointer_change.y ) );

      current_instance.controlled_item.position.add( pan_displacement );
      current_instance.focus_point.add( pan_displacement );

      if ( current_instance.fixed_movement ) {
        shift_start_pt = shift_end_pt;
      } else {
        shift_start_pt.add( pointer_change.subVectors( shift_end_pt, shift_start_pt ).multiplyScalar( current_instance.kinetic_decay_factor ) );
      }
    }
  };

  this.verifyViewLimits = function () {
    if ( !current_instance.disable_magnify || !current_instance.disable_shift ) {
      if ( current_instance.controlled_item.position.lengthSq() > current_instance.maximum_view_distance * current_instance.maximum_view_distance ) {
        current_instance.controlled_item.position.setLength( current_instance.maximum_view_distance );
      }

      if ( camera_vector.lengthSq() < current_instance.minimum_view_distance * current_instance.minimum_view_distance ) {
        current_instance.controlled_item.position.addVectors( current_instance.focus_point, camera_vector.setLength( current_instance.minimum_view_distance ) );
      }
    }
  };

  this.refreshState = function () {
    camera_vector.subVectors( current_instance.controlled_item.position, current_instance.focus_point );

    if ( !current_instance.disable_spin ) {
      current_instance.performSpin();
    }

    if ( !current_instance.disable_magnify ) {
      current_instance.performMagnify();
    }

    if ( !current_instance.disable_shift ) {
      current_instance.performShift();
    }

    current_instance.controlled_item.position.addVectors( current_instance.focus_point, camera_vector );

    current_instance.verifyViewLimits();

    current_instance.controlled_item.lookAt( current_instance.focus_point );

    if ( previous_item_pos.distanceToSquared( current_instance.controlled_item.position ) > 0 ) {
      current_instance.dispatchEvent( update_notification );
      previous_item_pos.copy( current_instance.controlled_item.position );
    }
  };

  this.revertToInitial = function () {
    current_mode_val = INTERACTION_MODE.IDLE;
    prior_mode_val = INTERACTION_MODE.IDLE;

    current_instance.focus_point.copy( current_instance.initial_focus_point );
    current_instance.controlled_item.position.copy( current_instance.initial_item_position );
    current_instance.controlled_item.up.copy( current_instance.initial_up_direction );

    camera_vector.subVectors( current_instance.controlled_item.position, current_instance.focus_point );

    current_instance.controlled_item.lookAt( current_instance.focus_point );

    current_instance.dispatchEvent( update_notification );

    previous_item_pos.copy( current_instance.controlled_item.position );
  };

  // Event listeners
  function onKeyDownPress( evt ) {
    if ( current_instance.active === false ) return;

    window.removeEventListener( 'keydown', onKeyDownPress );

    prior_mode_val = current_mode_val;

    if ( current_mode_val !== INTERACTION_MODE.IDLE ) {
      return;
    } else if ( evt.keyCode === current_instance.key_bindings[ INTERACTION_MODE.SPIN ] && !current_instance.disable_spin ) {
      current_mode_val = INTERACTION_MODE.SPIN;
    } else if ( evt.keyCode === current_instance.key_bindings[ INTERACTION_MODE.MAGNIFY ] && !current_instance.disable_magnify ) {
      current_mode_val = INTERACTION_MODE.MAGNIFY;
    } else if ( evt.keyCode === current_instance.key_bindings[ INTERACTION_MODE.SHIFT ] && !current_instance.disable_shift ) {
      current_mode_val = INTERACTION_MODE.SHIFT;
    }
  }

  function onKeyUpRelease( evt ) {
    if ( current_instance.active === false ) return;

    current_mode_val = prior_mode_val;

    window.addEventListener( 'keydown', onKeyDownPress, false );
  }

  function onPointerDown( evt ) {
    if ( current_instance.active === false ) return;

    evt.preventDefault();
    evt.stopPropagation();

    if ( current_mode_val === INTERACTION_MODE.IDLE ) {
      current_mode_val = evt.button;
    }

    if ( current_mode_val === INTERACTION_MODE.SPIN && !current_instance.disable_spin ) {
      spin_start_vec = spin_end_vec = current_instance.getPointerProjectionOnSphere( evt.clientX, evt.clientY );
    } else if ( current_mode_val === INTERACTION_MODE.MAGNIFY && !current_instance.disable_magnify ) {
      magnify_start_pt = magnify_end_pt = current_instance.getPointerOnCanvas( evt.clientX, evt.clientY );
    } else if ( current_mode_val === INTERACTION_MODE.SHIFT && !current_instance.disable_shift ) {
      shift_start_pt = shift_end_pt = current_instance.getPointerOnCanvas( evt.clientX, evt.clientY );
    }

    document.addEventListener( 'mousemove', onPointerMove, false );
    document.addEventListener( 'mouseup', onPointerUp, false );
  }

  function onPointerMove( evt ) {
    if ( current_instance.active === false ) return;

    evt.preventDefault();
    evt.stopPropagation();

    if ( current_mode_val === INTERACTION_MODE.SPIN && !current_instance.disable_spin ) {
      spin_end_vec = current_instance.getPointerProjectionOnSphere( evt.clientX, evt.clientY );
    } else if ( current_mode_val === INTERACTION_MODE.MAGNIFY && !current_instance.disable_magnify ) {
      magnify_end_pt = current_instance.getPointerOnCanvas( evt.clientX, evt.clientY );
    } else if ( current_mode_val === INTERACTION_MODE.SHIFT && !current_instance.disable_shift ) {
      shift_end_pt = current_instance.getPointerOnCanvas( evt.clientX, evt.clientY );
    }
  }

  function onPointerUp( evt ) {
    if ( current_instance.active === false ) return;

    evt.preventDefault();
    evt.stopPropagation();

    current_mode_val = INTERACTION_MODE.IDLE;

    document.removeEventListener( 'mousemove', onPointerMove );
    document.removeEventListener( 'mouseup', onPointerUp );
  }

  function onMouseWheelScroll( evt ) {
    if ( current_instance.active === false ) return;

    evt.preventDefault();
    evt.stopPropagation();

    var scroll_delta_val = 0;

    if ( evt.wheelDelta ) { // For WebKit / Opera / Explorer 9+
      scroll_delta_val = evt.wheelDelta / 40;
    } else if ( evt.detail ) { // For Firefox
      scroll_delta_val = - evt.detail / 3;
    }

    magnify_start_pt.y += scroll_delta_val * 0.01;
  }

  function onTouchStartEvt( evt ) {
    if ( current_instance.active === false ) return;

    switch ( evt.touches.length ) {
      case 1:
        current_mode_val = INTERACTION_MODE.FINGER_SPIN;
        spin_start_vec = spin_end_vec = current_instance.getPointerProjectionOnSphere( evt.touches[ 0 ].pageX, evt.touches[ 0 ].pageY );
        break;

      case 2:
        current_mode_val = INTERACTION_MODE.FINGER_MAGNIFY;
        var diff_x = evt.touches[ 0 ].pageX - evt.touches[ 1 ].pageX;
        var diff_y = evt.touches[ 0 ].pageY - evt.touches[ 1 ].pageY;
        finger_zoom_dist_final = finger_zoom_dist_initial = Math.sqrt( diff_x * diff_x + diff_y * diff_y );
        break;

      case 3:
        current_mode_val = INTERACTION_MODE.FINGER_SHIFT;
        shift_start_pt = shift_end_pt = current_instance.getPointerOnCanvas( evt.touches[ 0 ].pageX, evt.touches[ 0 ].pageY );
        break;

      default:
        current_mode_val = INTERACTION_MODE.IDLE;
    }
  }

  function onTouchMoveEvt( evt ) {
    if ( current_instance.active === false ) return;

    evt.preventDefault();
    evt.stopPropagation();

    switch ( evt.touches.length ) {
      case 1:
        spin_end_vec = current_instance.getPointerProjectionOnSphere( evt.touches[ 0 ].pageX, evt.touches[ 0 ].pageY );
        break;

      case 2:
        var diff_x = evt.touches[ 0 ].pageX - evt.touches[ 1 ].pageX;
        var diff_y = evt.touches[ 0 ].pageY - evt.touches[ 1 ].pageY;
        finger_zoom_dist_final = Math.sqrt( diff_x * diff_x + diff_y * diff_y )
        break;

      case 3:
        shift_end_pt = current_instance.getPointerOnCanvas( evt.touches[ 0 ].pageX, evt.touches[ 0 ].pageY );
        break;

      default:
        current_mode_val = INTERACTION_MODE.IDLE;
    }
  }

  function onTouchEndEvt( evt ) {
    if ( current_instance.active === false ) return;

    switch ( evt.touches.length ) {