//construct.configure(function(){

	//construct.asset(["bin"]);
	construct.register( construct.asset(["bin"]) );
	construct.register( construct.input(["mouse"]) );

//});


construct.configure(function(){

	APP.Routers.Default = APP.Router.extend({
		routes: {
			"": "index"
		},

		index: function(){
			this.data = new APP.Models.Asset();
			this.layout = new APP.Layouts.Main({ data: this.data });
		}
	});

	APP.Layouts.Main = APP.Layout.extend({

		events: {
			"input input[type='range']": "rangeChange",
			"click .examples a": "loadExample",
			"submit form": "loadAsset"
		},

		initialize: function( options ){

			// load the data
			this.set({
				"viewer": new APP.Views.Viewer({
					model: options.data
				})
			});
			return APP.Layout.prototype.initialize.call( this, options );
		},

		loadAsset: function( e ){
			e.preventDefault();
			var asset = $(e.target).find("input[type='text']").val();
			this.options.data.url = asset;
			this.options.data.fetch();
		},

		rangeChange: function(){
			var value = $("input[type='range']").val();
			this.get("viewer").updateZoom( value );
		},

		loadExample: function( e ){
			e.preventDefault();
			var asset = $(e.target).attr("href");
			// update input field
			$(this.el).find("input[type='text']").val(asset);
			// submit form
			$(this.el).find("form:first").submit();
		}

	});

	APP.Views.Viewer = APP.Views.Main3D.extend({
		el: ".viewer",

		options: {
			monitorMove: true
		},

		/*
		initialize: function( options ){

			// load the data
			this.data =
			return APP.Views.Main3D.prototype.initialize.call( this. options );
		},
		*/
		postRender: function(){
			// prerequisite
			if( _.isEmpty( this.model.get("meshes") ) ) return;

			// load model
			var src = this.model.getMesh();

			//
			//$el = $("asset").attr("src", src);
			//$el = $("<scene><asset src='"+ src +"'></asset><camera></camera></scene>");
			this.$3d.addScene().addCamera({ far: 100000 });
			this.$3d.add({ type: "asset", src: src });
			//this.$3d.append($el);
			//this.$3d.append( $el );
			/*
			this.objects.set({
				player: new Player({
					el: $(this.el).find("player")
				})
			});

			this.layers.set({
				rocks: new Rocks( new APP.Collection( new Array(20) ), {
					el: $(this.el).find("rocks")
				}),
				enemies: new Enemies( new APP.Collection( new Array(10) ), {
					el: $(this.el).find("enemies")
				})
			});
			*/
		},

		mousemove: function( e ){
			// look around (temporarily disabled)
			//this.lookArround(e);
		},

		lookArround: function(e){

			var mouse = this.params.get("mouse");
			var mouseX = ( mouse.x - (window.innerWidth / 2) );
			var mouseY = ( mouse.y - (window.innerHeight / 2) );
			// the 3d environment is passed as target
			//var $3d = e.target;
			var $3d = this.$3d;
			var multiplier = e.multiplier || 1;
			var speed = 0.05;

			// start when the active camera is set
			if( !$3d.active.camera ) return;
			$3d.active.camera.lookAt( $3d.active.scene.position );

			$3d.active.camera.position.x += ( (mouseX * multiplier) - $3d.active.camera.position.x ) * speed;
			$3d.active.camera.position.y += ( - (mouseY * multiplier) - $3d.active.camera.position.y ) * speed;
		//}

		},

		updateZoom: function( value ){
			var camera = this.$3d.active.camera;
			camera.position.z = value;
		}

	});

});

construct({}, function( backbone ){

	app = backbone;

});
