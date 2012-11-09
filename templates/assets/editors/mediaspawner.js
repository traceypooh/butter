/*global EditorHelper*/

EditorHelper.addPlugin( "mediaspawner", function( trackEvent ) {
  var _container,
      _popcornOptions,
      target;

  _popcornOptions = trackEvent.popcornTrackEvent;
  _container = _popcornOptions._container;
  target = _popcornOptions._target;

  if ( window.jQuery ) {

    window.EditorHelper.resizable( trackEvent, _container, target, {
      minWidth: 40,
      minHeight: 40,
      start: function() {
        var iframe = _container.querySelector( "iframe" );

        if ( iframe ) {
          iframe.style.pointerEvents = "none";
        }
      },
      end: function() {
        var iframe = _container.querySelector( "iframe" );
       
        if ( iframe ) {
          iframe.style.pointerEvents = "auto";
        }
      }
    });
    window.EditorHelper.draggable( trackEvent, _container, target, {
      start: function() {
        var iframe = _container.querySelector( "iframe" );

        if ( iframe ) {
          iframe.style.pointerEvents = "none";
        }
      },
      end: function() {
        var iframe = _container.querySelector( "iframe" );
       
        if ( iframe ) {
          iframe.style.pointerEvents = "auto";
        }
      }
    });
  }

});
