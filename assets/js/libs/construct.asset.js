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

	// in case APP.Mesh has already been defined
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

	// base model using sources from asset.json
	APP.Models.Asset = APP.Model.extend({
		defaults: {
			meshes: {}, // LOD m1, m2, m3
			animations: {}, // collection of animations
			sounds: {}, // collection of sounds
			shaders: {} //
		},
		/*
		url: function(){
			return this.asset;
		},
		asset: "", // add default model...
		*/
		parse: function( data ){
			//console.log( data );
			// what to do with the other (meta) data?
			return data.sources || data;
		},

		getMesh: function(){
			var src = this.get("meshes").m1;
			// add full path if missing
			if( !_.isURL( src ) ){
				// get the url from the asset location
				var url = _.getDir(this.url);
				src = url + src;
				if( !_.isURL(url) ){
					// use the page location
					src = window.location.href + src;
				}
			}
			return src;
		}
	});

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


	// Helpers
	_.mixin({
		// - Checks if a string is a full URL
		// Source: https://gist.github.com/tracend/a522e5a169aad662fa80
		isURL: function ( url ) {
			// prerequisite
			if( typeof url != "string" ) return false;
			//
			return ( url.substr(0, 4) == "http" || url.substr(0, 2) == "//" );
		},

		// - Returns the directory of a url or full path
		// Source: https://gist.github.com/tracend/31436d82befafab96d15
		getDir: function ( url ) {
			// prerequisite
			if( typeof url != "string" ) return "";
			//
			var location = url.match(/^.*[\\\/]/);
			// return if there are any matches...
			return ( location !== null ) ? location[0] : "";
		}
	});


});
