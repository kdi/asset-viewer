/**
 * @name construct.input
 * A construct.js extension that abstracts the use of backbone-input
 *
 * Version: 0.4.0 (Mon, 14 Apr 2014 05:27:52 GMT)
 * Homepage: https://github.com/constructjs/input
 *
 * @author makesites
 * Initiated by: Makis Tracend (@tracend)
 *
 * @cc_on Copyright © Makesites.org
 * @license MIT license
 */

 (function(){
	// exit now if contruct hasn't already been defined
	if(typeof construct == "undefined") return;


		construct.input = function( options ){
		// options is an array...
		options = options || [];
		//console.log(options);

		// lookup options
		if( options.indexOf("keys") > -1 ) {
			construct.config.shim["backbone.app"].deps.push("backbone.input.keys");
			construct.config.deps.push("backbone.input.keys");
		}
		if( options.indexOf("mouse") > -1 ) {
			construct.config.shim["backbone.app"].deps.push("backbone.input.mouse");
			construct.config.deps.push("backbone.input.mouse");
		}
		if( options.indexOf("touch") > -1 ) {
			construct.config.shim["backbone.app"].deps.push("backbone.input.touch");
			construct.config.deps.push("backbone.input.touch");
		}
		if( options.indexOf("gamepad") > -1 ) {
			construct.config.shim["backbone.app"].deps.push("backbone.input.gamepad");
			construct.config.deps.push("backbone.input.gamepad");
		}
		if( options.indexOf("motion") > -1 ) {
			construct.config.shim["backbone.app"].deps.push("backbone.input.motion");
			construct.config.deps.push("backbone.input.motion");
		}
		// save options
		Object.extend(construct.options, { input: options });

		return function( e ){
			//console.log( "update" );
		};

	};


	// Dependencies
	construct.config = Object.extend(construct.config, {
		"paths": {
			"backbone.input.keys" : [
				"//rawgithub.com/backbone-input/keys/master/build/backbone.input.keys"
			],
			"backbone.input.touch" : [
				"//rawgithub.com/backbone-input/touch/master/build/backbone.input.touch"
			],
			"backbone.input.mouse" : [
				"//rawgithub.com/backbone-input/mouse/master/build/backbone.input.mouse"
			],
			"backbone.input.gamepad" : [
				"//rawgithub.com/backbone-input/gamepad/master/build/backbone.input.gamepad"
			],
			"backbone.input.motion" : [
				"//rawgithub.com/backbone-input/motion/master/build/backbone.input.motion"
			]
		},
		"shim": {
			"backbone.input.keys": {
				"deps": [
					"backbone",
					"underscore",
					"jquery"
				]
			},
			"backbone.input.touch": {
				"deps": [
					"backbone",
					"underscore",
					"jquery"
				]
			},
			"backbone.input.mouse": {
				"deps": [
					"backbone",
					"underscore",
					"jquery"
				]
			},
			"backbone.input.motion": {
				"deps": [
					"backbone",
					"underscore",
					"jquery"
				]
			}
		}
	});


function extendMain3D(){

	// add the appropariate events based on the input methods initialized
	var types = construct.options.input || [];
	var events = {};
	// lookup input types
	if( types.indexOf("keys") > -1 ) {
	}
	if( types.indexOf("mouse") > -1 ) {
	}
	if( types.indexOf("touch") > -1 && isTouch() ) {
		events.click = "_ontouch";
	}
	if( types.indexOf("gamepad") > -1 ){

	}

	// save parent
	var Main3D = APP.Views.Main3D;

	APP.Views.Main3D = Main3D.extend({

		options: {
			//monitorMove: true
			monitor: construct.options.input
		},

		events: events,

		initialize: function( options ){

			// monitor mouse
			var monitor = this.options.monitorMove || _.inArray("mouse", this.options.monitor);
			if( monitor ){
				this.on("intersect", _.bind(this.clickObject, this));
			}

			return Main3D.prototype.initialize.call(this, options);
		},

		_start: function( $3d ){
			// create a projector for the click events
			$3d.projector = new THREE.Projector();
			return Main3D.prototype._start.call(this, $3d);
		},

		//onMouseMove
		mousemove: function( e ){
			// broadcast updates to player
			var player = this.objects.get("player");
			if( player && player.onMouseMove ) player.onMouseMove( e );
		},

		mousedown: function(){
			this.checkIntersect();
		},

		_ontouch: function( e ){
			// internal...
			var touch = e.originalEvent.changedTouches[0];
			var x = touch.clientX;
			var y = touch.clientY;
			this.params.set({
				mouse: { x : x, y : y }
			});
			this.checkIntersect();
			// user defined
			if( this.ontouch ) this.ontouch( e );
		},
		/*
		_touchmove: function(){
			// internal...
			// user defined
			if( this.touchmove ) this.touchmove( e );
		},

		_touchend: function(){
			// internal...
			// user defined
			if( this.touchend ) this.touchend( e );
		},
		*/
		clickObject: function( objects ){
			console.log("clickObject:", objects);
		},

		checkIntersect: function(){

			var $el = $(this.el),
				elOffset = $el.offset(),
				mouse = this.params.get("mouse");
			// check click event with a raycast
			var x = ( (mouse.x - elOffset.left) / jQuery(window).width() ) * 2 - 1;
			var y = - ( (mouse.y - elOffset.top) / jQuery(window).height() ) * 2 + 1;
			var z = 0.5;
			//
			var vector = new THREE.Vector3( x, y, z );
			var camera = this.$3d.active.camera;
			// get the meshes (map as array...)
			var objects = getMeshes( this.$3d.objects );

			//this.$3d
			this.$3d.projector.unprojectVector( vector, camera );

			var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

			var intersects = raycaster.intersectObjects( objects );

			if ( intersects.length > 0 ) {
				// is the array always with one item and does the object always have a parent (assuming it's an Object3D container)?
				var object = intersects[0].object.parent;
				this.trigger("intersect", object);
				//intersects[0].object.parent.lookAt(new THREE.Vector3( 0, 0, 0 ) );
				// console.log( JSON.stringify( intersects[0].object.parent.rotation ) );
			}

		}

	});

}
function extendPlayer(){

	var Player = APP.Meshes.Player;

	APP.Meshes.Player = Player.extend({

		// keyboard support
		keys : {
			'w a s d': '_moveKeys',
			'up left down right': '_rotateKeys',
			'q e': '_rollKeys',
			'r f': '_elevateKeys',
			'shift': '_accelerateKeys'
		},

		_start: function( options ){

			// events
			if( this.options.controls ){
				// events
				this.on("update", _.bind(this._updateControls, this));
				// data
				this.data.set({
					controls: { lon: 0, lat: 0 }
				});
			}

			return Player.prototype._start.call( this, options );
		},

		// gamepad support

		onConnectGamepad: function( e ){
			//console.log("onConnectGamepad", e );
		},

		onDisconnectGamepad: function( e ){

		},

		updateGamepads: function( e ){

			var data = this.params.get("gamepads");
			// support only first gamepad for now...
			if( data && data[0] ){
				var axes = data[0].axes;
				// convention: two first axes is left, two latter is right
				this.state.move.left = ( axes[0] < -0.4 ) ? 1 : 0;
				this.state.move.right = ( axes[0] > 0.4 ) ? 1 : 0;
				this.state.move.forward = ( axes[1] < -0.4 ) ? 1 : 0;
				this.state.move.back = ( axes[1] > 0.4 ) ? 1 : 0;

				this.state.move.yawLeft = ( axes[2] < -0.4 ) ? 1 : 0;
				this.state.move.yawRight = ( axes[2] > 0.4 ) ? 1 : 0;
				this.state.move.pitchUp = ( axes[3] < -0.4 ) ? 1 : 0;
				this.state.move.pitchDown = ( axes[3] > 0.4 ) ? 1 : 0;

				// monitor buttons
				var buttons = data[0].buttons;
				for(var i in buttons){
					// true if it is pressed...
					if( buttons[i] ){
						var button = this._buttonKey( i );
						this.trigger( button );
					}
				}

			}

			this.updateMovementVector();
			this.updateRotationVector();
		},


		// Keyboard support

		_moveKeys: function( e, key ){

			// prerequisite
			if( !_.inArray("keys", this.options.monitor) ) return;

			var press = ( e.type == "keydown" ); // options: keydown, keyup

			var keys = this._keys._moveKeys;

			switch( key ){

				// move
				case keys[0]: this.state.move.forward = ( press ) ? 1 : 0; break;
				case keys[1]: this.state.move.left = ( press ) ? 1 : 0; break;
				case keys[2]: this.state.move.back = ( press ) ? 1 : 0; break;
				case keys[3]: this.state.move.right = ( press ) ? 1 : 0; break;

			}

			this.updateMovementVector();
		},

		_rotateKeys: function( e, key ){

			// prerequisite
			if( !_.inArray("keys", this.options.monitor) ) return;

			var press = ( e.type == "keydown" ); // options: keydown, keyup

			var keys = this._keys._rotateKeys;

			switch( key ){

				// rotate
				case keys[0]: this.state.move.pitchUp = ( press ) ? 1 : 0; break;
				case keys[1]: this.state.move.yawLeft = ( press ) ? 1 : 0; break;
				case keys[2]: this.state.move.pitchDown = ( press ) ? 1 : 0; break;
				case keys[3]: this.state.move.yawRight = ( press ) ? 1 : 0; break;

			}

			this.updateRotationVector();
		},

		_rollKeys: function( e, key ){

			// prerequisite
			if( !_.inArray("keys", this.options.monitor) ) return;

			var press = ( e.type == "keydown" ); // options: keydown, keyup

			var keys = this._keys._rollKeys;

			switch( key ){

				// rotate
				case keys[0]:  this.state.move.rollLeft = ( press ) ? 1 : 0; break;
				case keys[1]: this.state.move.rollRight = ( press ) ? 1 : 0; break;

			}

			this.updateRotationVector();

		},

		_elevateKeys: function( e, key ){

			// prerequisite
			if( !_.inArray("keys", this.options.monitor) ) return;

			var press = ( e.type == "keydown" ); // options: keydown, keyup

			var keys = this._keys._elevateKeys;

			switch( key ){

				// rotate
				case keys[0]:  this.state.move.up = ( press ) ? 1 : 0; break;
				case keys[1]: this.state.move.down = ( press ) ? 1 : 0; break;

			}

			this.updateMovementVector();
		},

		_accelerateKeys: function( e, key ){

			// prerequisite
			if( !_.inArray("keys", this.options.monitor) ) return;

			var press = ( e.type == "keydown" ); // options: keydown, keyup
			var multiplier = this.movementSpeedMultiplier;

			this.movementSpeedMultiplier = ( press ) ? multiplier * 10 : multiplier / 10;

		},


		// Mouse support

		onMouseMove: function( event ){

			// prerequisite
			if( !_.inArray("mouse", this.options.monitor) ) return;

			var container = this.getContainerDimensions();
			var halfWidth  = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			this.state.move.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
			this.state.move.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

			this.updateRotationVector();
			//console.log( JSON.stringify( this.state.move ) );

		},

		// motion support
		onMotionAccelerometer: function( ){
			// prerequisite
			if( !_.inArray("motion", this.options.monitor) ||  !_.inArray("accelerometer", this.options.states.motion) ) return;

			var data = this.params.get("accelerometer");

			var container = this.getContainerDimensions();
			var halfWidth  = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			//this.state.move.yawLeft   = - ( ( data.x - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
			//this.state.move.pitchDown =   ( ( data.y - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

			// tabletop
			//this.state.move.yawLeft   = - data.z * Math.PI/180;
			//this.state.move.pitchDown =  data.y * Math.PI/180;

			// fly
			// y goes from 90 to -90 and from 180 to -180
			var directionX = ( data.y > 0 ) ? 1 : -1;
			var yaw = ( Math.abs( data.y ) < 90 ) ? data.y : directionX * (180 - Math.abs( data.y )) ;
			this.state.move.yawLeft = - yaw/90;
			//console.log( this.state.move.yawLeft );
			// account for resetting the z axis
			var directionY = ( data.z < 0 ) ? 1 : -1;
			this.state.move.pitchDown = directionY * ( 1 - ( Math.abs( data.z )/90 ) );

			this.updateRotationVector();

		},

		onOrientationUpdate: function(){
			// prerequisite
			if( !_.inArray("motion", this.options.monitor) ||  !_.inArray("rift", this.options.states.motion) ) return;

			var data = this.params.get("rift");
			this.tmpQuaternion = new THREE.Quaternion(data.x, data.y, data.z, data.w);

			// bypass updateRotationVector?
		},

		// Controls

		_updateControls: function( e ){
			// controls update only after the object is loaded
			if( !this.object) return;

			var vr = ( _.inArray("motion", this.options.monitor) &&  _.inArray("rift", this.options.states.motion) );

			switch( this.options.controls ){
				case "walk":
					this.updateControlsWalk(e);
				break;
				case "fly":
					if( vr ){
						this.updateControlsFlyVR(e);
					} else {
						this.updateControlsFly(e);
					}
				break;
				default:
					// nothing?
				break;
			}
		},

		// first person perspective in flying mode
		updateControlsFly: function( e ){

			// remove when the object is no longer visible
			var $3d = e.target;
			// look around...
			var delta = $3d.clock.getDelta();
			var moveMult = delta * this.options.moveStep;
			var rotMult = delta * this.options.rotateStep;

			this.object.translateX( this.moveVector.x * moveMult );
			this.object.translateY( this.moveVector.y * moveMult );
			this.object.translateZ( this.moveVector.z * moveMult );

			this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
			this.object.quaternion.multiply( this.tmpQuaternion );

			// expose the rotation vector for convenience
			this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );

		},

		updateControlsFlyVR: function( e ){

			// remove when the object is no longer visible
			var $3d = e.target;
			// look around...
			var delta = $3d.clock.getDelta();
			var moveMult = delta * this.options.moveStep;
			var rotMult = delta * this.options.rotateStep;

			this.object.translateX( this.moveVector.x * moveMult );
			this.object.translateY( this.moveVector.y * moveMult );
			this.object.translateZ( this.moveVector.z * moveMult );

			this.object.quaternion.set( this.tmpQuaternion.x, this.tmpQuaternion.y, this.tmpQuaternion.z, this.tmpQuaternion.w  );

			// expose the rotation vector for convenience
			this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );

		},

		// first person perspective in walking mode
		updateControlsWalk: function( e ){

			// remove when the object is no longer visible
			var $3d = e.target;
			// look around...
			var delta = $3d.clock.getDelta();

			var moveMult = delta * this.options.moveStep;
			var rotMult = delta * this.options.rotateStep * 2;

			var y = this.object.position.y;
			this.object.translateX( this.moveVector.x * moveMult );
			this.object.translateY( this.moveVector.y * moveMult );
			this.object.translateZ( this.moveVector.z * moveMult );
			//this.object.position.x -= this.moveVector.z * moveMult;
			//this.object.position.y += this.moveVector.y * moveMult;
			//this.object.position.z += this.moveVector.x * moveMult;
			// reset position
			this.object.position.y = y;
			/* jump...
			if ( this.heightSpeed ) {

				var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
				var heightDelta = y - this.heightMin;
				this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );
			} else {
				this.autoSpeedFactor = 0.0;
			}
			*/
			var data = this.data.get("controls");
			// update lat/lon
			data.lon -= this.rotationVector.y;
			data.lat += this.rotationVector.x;
			data.lat = Math.max( - 85, Math.min( 85, data.lat ) );
			// calculate angles
			var phi = THREE.Math.degToRad( 90 - data.lat );
			var theta = THREE.Math.degToRad( data.lon );

			var targetPosition = new THREE.Vector3(0,0,0),
				position = this.object.position;

			// place target object in front of actual object
			targetPosition.x = position.x + 100 * Math.sin( phi ) * Math.cos( theta );
			targetPosition.y = position.y + 100 * Math.cos( phi );
			targetPosition.z = position.z + 100 * Math.sin( phi ) * Math.sin( theta );

			this.object.lookAt( targetPosition );

			// save lat/lon in data
			this.data.set({
				controls: data
			});
		},

		// the camera follows the player objject from a distance
		updateControlsFollow: function( e ){

		},

		// pin camera around an object
		updateControlsRotate: function( e ){

		},

		// temp method - replace with $3d dimensions
		getContainerDimensions : function() {
/*
			if ( this.domElement != document ) {

				return {
					size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
					offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
				};

			} else {
*/
				return {
					size	: [ window.innerWidth, window.innerHeight ],
					offset	: [ 0, 0 ]
				};

//			}

		}

	});


}

	// Helpers
	// - loop through objects to get meshes
	function getMeshes( objects, meshes ){
		//fallbacks
		objects = objects || {};
		meshes = meshes || [];
		for( var i in objects) {
			var object = objects[i];
			if( object instanceof THREE.Mesh ){
				meshes.push( object );
			} else {
				// assume it's an Object3D
				if( object.children ) {
					meshes = meshes.concat( getMeshes( object.children ) );
				}
			}
		}

		return meshes;
	}

	// this method also exists in APP.View as part of the touch plugin...
	function isTouch() {
		return 'ontouchstart' in document && !('callPhantom' in window);
	}

	// underscore helpers
	_.mixin({
		inArray: _.inArray || function(value, array){
			return array.indexOf(value) > -1;
		},
		// - Check if in debug mode (requires the existence of a global DEBUG var)
		// Usage: _.inDebug()
		inDebug : _.inDebug || function() {
			return ( typeof DEBUG != "undefined" && DEBUG );
		}
	});



	// Update views after dependencies are loaded
	construct.promise.add(function(){
		extendMain3D();
		extendPlayer();
	});

})();
