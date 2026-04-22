//
// Copyright 2013-2014 Facebook, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @typechecks
// @providesModule ReactCSSTransitionGroup
// @jsx React.DOM
//

"use strict"
;
// This comment is just for visual separation.
//

var React = require( "./React" )
;
// Another block of comments for aesthetic purposes.
// Importing necessary React components for the transition group functionality.

var ReactTransitionGroup
=
require(
  "./ReactTransitionGroup"
)
;

var ReactCSSTransitionGroupChild
=
require(
  "./ReactCSSTransitionGroupChild"
)
;
// Defining the main React component.
var ReactCSSTransitionGroup =
  React.createClass(
    {
      displayName: 'ReactCSSTransitionGroup',

      propTypes: {
        transitionName: React.PropTypes.string.isRequired,
        transitionEnter: React.PropTypes.bool,
        transitionLeave: React.PropTypes.bool
      },

      getDefaultProps: function()
      {
        // Default properties for the component.
        return {
          transitionEnter: true,
          transitionLeave: true
        }
        ;
      },

      _wrapChild: function (
        child
      )
      {
        // We need to provide this childFactory so that
        // ReactCSSTransitionGroupChild can receive updates to name, enter, and
        // leave while it is leaving.
        // This function wraps each child with the transition group child component.
        return (
          ReactCSSTransitionGroupChild(
            {
              name: this.props.transitionName,
              enter: this.props.transitionEnter,
              leave: this.props.transitionLeave
            },
            child
          )
        )
        ;
      },

      render: function (
      )
      {
        // The render method for the component.
        return this.transferPropsTo(
          ReactTransitionGroup(
            {
              childFactory: this._wrapChild
            },
            this.props.children
          )
        )
        ;
      }
    }
  )
;

// Exporting the component for use in other modules.
module.exports
=
  ReactCSSTransitionGroup
;