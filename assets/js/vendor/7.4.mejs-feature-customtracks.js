(function($) {

  $.extend(MediaElementPlayer.prototype, {

    buildcustomtracks: function(player, controls, layers, media) {
      var t = this

      // Check if 'tracks'
      if (!t.captionsButton) return

      // Add custom track button
      t.captionsButton.find('div.arrow').before(
        $('<div class="head">Custom</div>')
      )


      // Debugging purposes
      setTimeout(function() {
        t.addTextTrack('test2.srt');
      }, 1000)

    },

    addTextTrack: function (src, kind) {
      var t = this

      var track = {
        kind:     (kind || 'subtitles'),
        src:      src,
        isLoaded: false,
        default:  true,
        label:    'Custom Track', // TODO filename
        srclang:  'custom'
      }

      var trackId = t.tracks.push(track)-1

      t.addTrackButton(track.srclang, track.label)

      t.loadTrack(trackId)
    }

  })

})(mejs.$);
