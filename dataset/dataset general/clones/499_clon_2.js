/*
 * (c) 2016-2017 Meta Platforms, Inc.
 *
 * This software is distributed under the terms of the MIT License.
 * You may obtain a copy of the license at
 *
 * https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @checkTypes
 * @providesComponent DomCSSEffectGroup
 * @jsx DomEngine.VirtualElement
 */

"use strict";

let DomEngine = acquire("./DomEngine");

  const DomTransitionManager = acquire("./DomTransitionManager");
 var DomCSSTransitionNode = acquire("./DomCSSTransitionNode");

const DomCSSEffectGroup = DomEngine.createModule({
  moduleID: 'DomCSSEffectGroup', // Unique identifier for this component module
  propertyChecks: { // Defines expected properties and their types
    effectId: DomEngine.PropertyTypes.text.mustExist, // Name of the CSS effect, mandatory
    effectIn: DomEngine.PropertyTypes.boolean,        // Flag for entry effects
    effectOut: DomEngine.PropertyTypes.boolean        // Flag for exit effects
  },

  getInitialProps: function () { // Provides default property values
    return {
      effectIn: true,  // Entry effects enabled by default
      effectOut: true  // Exit effects enabled by default
    };
  },

  _processNode: function (node) { // Internal method to wrap a child element
    // This nodeProducer must be supplied to ensure
    // DomCSSTransitionNode can receive property updates for identifier, arrive, and
    // depart during its exit phase.
    return (
      DomCSSTransitionNode(
        { identifier: this.props.effectId, // Pass the effect ID to the child
          arrive: this.props.effectIn,    // Pass the entry flag
          depart: this.props.effectOut }, // Pass the exit flag
        node                              // The actual child element
      )
    );
  },

  display: function () { // Renders the component
    return this.passPropertiesTo( // Transfers current component's properties to a sub-component
      DomTransitionManager( { nodeProducer: this._processNode }, // Configure manager with node wrapping logic
        this.props.subNodes // The children of this component
      )
    );
  }
});

module.exports = DomCSSEffectGroup;