// PLUGIN: mediaspawner
/**
  * mediaspawner Popcorn Plugin.
  * Adds Video/Audio to the page using Popcorns players
  * Start is the time that you want this plug-in to execute
  * End is the time that you want this plug-in to stop executing
  *
  * @param {HTML} options
  *
  * Example:
    var p = Popcorn('#video')
      .mediaspawner( {
        source: "http://www.youtube.com/watch?v=bUB1L3zGVvc",
        target: "mediaspawnerdiv",
        start: 1,
        end: 10
      })
  *
  */

  // TIMEUPDATE, PLAY, PAUSE
(function ( Popcorn, global ) {
  var PLAYER_URL = "http://popcornjs.org/code/modules/player/popcorn.player.js",
      urlRegex = /(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu)/,
      forEachPlayer,
      playerTypeLoading = {},
      playerTypesLoaded = {
        "youtube": false,
        "module": false
      };

  Object.defineProperty( playerTypeLoading, forEachPlayer, {
    get: function() {
      return playerTypesLoaded[ forEachPlayer ];
    },
    set: function( val ) {
      playerTypesLoaded[ forEachPlayer ] = val;
    }
  });

  Popcorn.plugin( "mediaspawner", {
    manifest: {
      about: {
        name: "Popcorn Media Spawner Plugin",
        version: "0.1",
        author: "Matthew Schranz, @mjschranz",
        website: "mschranz.wordpress.com"
      },
      options: {
        source: {
          elem: "input",
          type: "text",
          label: "Media Source",
          "default": "http://www.youtube.com/watch?v=CXDstfD9eJ0"
        },
        start: {
          elem: "input",
          type: "number",
          label: "Start"
        },
        end: {
          elem: "input",
          type: "number",
          label: "End"
        },
        starttime: {
          elem: "input",
          type: "number",
          label: "Start Time",
          "default": 5
        },
        width: {
          elem: "input",
          type: "number",
          label: "Media Width",
          "default": 40,
          units: "%",
          optional: true,
          hidden: true
        },
        height: {
          elem: "input",
          type: "number",
          label: "Media Height",
          "default": 40,
          units: "%",
          optional: true,
          hidden: true
        },
        top: {
          elem: "input",
          type: "number",
          label: "Media Top",
          "default": 5,
          units: "%",
          optional: true,
          hidden: true
        },
        left: {
          elem: "input",
          type: "number",
          label: "Media Left",
          "default": 5,
          units: "%",
          optional: true,
          hidden: true
        },
        zindex: {
          hidden: true
        }
      }
    },
    _setup: function( options ) {
      var target,
          mediaType,
          container,
          regexResult;

      regexResult = urlRegex.exec( options.source );
      if ( regexResult ) {
        mediaType = regexResult[ 1 ];
        // our regex only handles youtu ( incase the url looks something like youtu.be )
        if ( mediaType === "youtu" ) {
          mediaType = "youtube";
        }
      }
      else {
        // if the regex didn't return anything we know it's an HTML5 source
        mediaType = "HTML5";
      }

      // Store Reference to Type for use in end
      options._type = mediaType;

      options._target = target = Popcorn.dom.find( options.target );

      // Create separate container for plugin
      options._container = document.createElement( "div" );
      container = options._container;
      container.id = "mediaSpawnerdiv-" + Popcorn.guid();
      container.style.position = "absolute";
      container.style.display = "none";
      container.style.zIndex = +options.zindex;

      // Default width and height of media
      options.width = options.width || 40;
      options.height = options.height || 20;
      options.top = options.top || 5;
      options.left = options.left || 5;
      options.starttime = options.starttime || 0;
      container.style.width = options.width + "%";
      container.style.height = options.height + "%";
      container.style.top = options.top + "%";
      container.style.left = options.left + "%";

      target && target.appendChild( container );

      function constructMedia(){

        function checkPlayerTypeLoaded() {
          if ( mediaType !== "HTML5" && !window.Popcorn[ mediaType ] ) {
            setTimeout( function() {
              checkPlayerTypeLoaded();
            }, 300 );
          } else {
            options.id = options._container.id;
            options.popcorn = Popcorn.smart( "#" + options.id, options.source );

            if ( mediaType === "HTML5" ) {
              options.popcorn.controls( true );
            }
          }
        }

        if ( mediaType !== "HTML5" && !window.Popcorn[ mediaType ] && !playerTypeLoading[ mediaType ] ) {
          playerTypeLoading[ mediaType ] = true;
          Popcorn.getScript( "http://popcornjs.org/code/players/" + mediaType + "/popcorn." + mediaType + ".js", function() {
            checkPlayerTypeLoaded();
          });
        }
        else {
          checkPlayerTypeLoaded();
        }

      }

      // If Player script needed to be loaded, keep checking until it is and then fire readycallback
      function isPlayerReady() {
        if ( !window.Popcorn.player ) {
          setTimeout( function () {
            isPlayerReady();
          }, 300 );
        } else {
          constructMedia();
        }
      }

      // If player script isn't present, retrieve script
      if ( !window.Popcorn.player && !playerTypeLoading.module ) {
        playerTypeLoading.module = true;
        Popcorn.getScript( PLAYER_URL, isPlayerReady );
      } else {
        isPlayerReady();
      }

      options.toString = function() {
        return options.source || options._natives.manifest.options.source[ "default" ];
      };
    },
    start: function( event, options ) {

      this.media.pause();

      if ( options._container ) {
        options._container.style.display = "block";
      }

      function doStuff() {
        if ( options.popcorn && options.popcorn.media.readyState === 4 ) {
          options.popcorn.play();
          options.popcorn.currentTime( options.starttime );
        } else {
          setTimeout(function() {
            doStuff();
          }, 100 );
        }
      }

      doStuff();

    },
    end: function( event, options ) {

      if ( options._container ) {
        options._container.style.display = "none";
      }

      // Pause all popcorn instances on exit
      options.popcorn.pause();

    },
    _teardown: function( options ) {
      if ( options.popcorn && options.popcorn.destory ) {
        options.popcorn.destroy();
      }
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });
})( Popcorn, this );
