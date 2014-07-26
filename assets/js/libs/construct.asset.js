(function(){
	// exit now if contruct hasn't already been defined
	if(typeof construct == "undefined") return;

	construct.asset = function( options ){
		// options is an array...
		options = options || [];
		//console.log(options);
		// always load THREE.Asset
		construct.config.deps.push("three.asset");
		// lookup options
		if( options.indexOf("obj") > -1 ) construct.config.deps.push("three.obj");
		if( options.indexOf("bin") > -1 ) construct.config.deps.push("three.bin");

		// save options
		Object.extend(construct.options, { asset: options });

		return function( e ){
			//console.log( "update" );
		};
	};

	// Dependencies
	construct.config = Object.extend(construct.config, {
		"paths": {
			"three.asset" : [
				"//rawgit.com/makesites/three-asset/master/build/three.asset"
			],
			"three.obj" : [
				"//rawgit.com/constructjs/asset/master/deps/three.OBJMTLLoader"
			],
			"three.bin" : [
				"//rawgit.com/constructjs/asset/master/deps/three.BinaryLoader"
			]
		},
		"shim": {
			"three.asset": {
				"deps": [
					"three-js"
				]
			},
			"three.obj": {
				"deps": [
					"three-js"
				]
			},
			"three.bin": {
				"deps": [
					"three-js"
				]
			}
		}
	});

})();

// Views

// Add models after dependencies are loaded
construct.promise.add(function(){

	// add the appropariate events based on the asset options initialized
	var types = construct.options.asset || [];
	var events = {};
	// lookup asset types
	if( types.indexOf("obj") > -1 ) {
	}
	if( types.indexOf("bin") > -1 ) {
	}

	// in case APP.Mesh has already been defined by a plugin
	var Main3D = APP.Views.Main3D || APP.View;

	APP.Views.Main3D = Main3D.extend({

		options: {
		},

		events: events,
/*
		initialize: function( options ){

			return Main3D.prototype.initialize.call(this, options);
		},
*/
		load: function( objects ){
			console.log("asset loaded:", objects);
		}

	});

	// Helpers
	// jQuery Three extension for asset.json
	Three.prototype.fn.webgl.asset = function( options, callback ){
		// define the group (once)
		if( !this.groups['asset'] ) this.groups['asset'] = "objects";

		// model
		var self = this;

		var asset = new THREE.Asset( true );

		asset.load( options.src, function ( geometry, materials ) {

			var object = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );

			object.geometry = geometry;
			object.material =  new THREE.MeshFaceMaterial(materials);
			//object.material.side = THREE.DoubleSide;
			// save id as name
			if( options.id ) object.name = options.id;

			//self.active.scene.add( object );

			callback( object );

		});

	}


});
