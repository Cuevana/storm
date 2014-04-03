(function($) {

  $.extend(MediaElementPlayer.prototype, {

    buildcustomtracks: function(player, controls, layers, media) {
      var t = this

      // Check if 'tracks'
      if (!t.captionsButton) return

      // TODO: DESIGN ME! Button?
      t.captionsButton.find('div.arrow').before(
        $('<div class="head">DROP TO ADD</div>')
      )

      // Drag&Drop support
      $('body').on('drop', function(e) {
        if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
          var file = e.originalEvent.dataTransfer.files[0]
          var fileExt = file.name.toLowerCase().substr((~-file.name.lastIndexOf(".") >>> 0) + 2)
          if (fileExt == 'srt') {
            t.addTextTrackFromFile(file, 'ISO-8859-1')
            e.preventDefault()
            e.stopPropagation()
          }
        }
      });

    },

    addTextTrackFromFile: function(file, charset, kind) {
      var t = this;

      var track = {
        kind:     (kind || 'subtitles'),
        src:      file.name,
        srclang:  'file',
        label:    file.name,
        default:  true,
        isLoaded: false
      }

      // ensure a different srclang for each file
      track.srclang =+ t.tracks.push(track)-1 
      t.addTrackButton(track.srclang, track.label)

      var reader = new FileReader();
      reader.readAsText(file, charset);
      reader.onload = function() {
        var d = reader.result
        track.entries = mejs.TrackFormatParser.webvvt.parse(d)
        track.isLoaded = true
        t.enableTrackButton(track.srclang, track.label)
        t.setTrack(track.srclang)
      }
    },

    /* Dynamically add a new TextTrack (instead of <track src=... />) 
       Won't work on local files (Cross origins)
    */
    addTextTrack: function (src, kind, srclang, label) {
      var t = this

      var track = {
        kind:     (kind || 'subtitles'),
        src:      src,
        isLoaded: false,
        default:  true,
        label:    label,
        srclang:  srclang
      }

      t.addTrackButton(track.srclang, track.label)
      t.trackToLoad = t.tracks.push(track)-1
      t.loadTrack(t.trackToLoad)
    }

  })
})(mejs.$);
