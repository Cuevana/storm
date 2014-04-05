(function($) {

  // Modify default option to always show captions button (even if there are no subs loaded yet)
  $.extend(mejs.MepDefaults, {
    hideCaptionsButtonWhenEmpty: false
  });

  $.extend(MediaElementPlayer.prototype, {

    buildcustomtracks: function(player, controls, layers, media) {
      var t = this

      // Check if 'tracks'
      if (!t.captionsButton) return

      // Open File Dialog Button 
      // TODO: DESIGN ME! Change class="head" to a custom class
      var customSubButton = $('<div class="head" style="cursor: pointer;">Cargar desde archivo</div>');
      var fileInput = $('<input type="file" accept=".srt" style="display: none;" multiple>');
      t.captionsButton.find('div.arrow').before(customSubButton);
      t.captionsButton.append(fileInput);
      customSubButton.on('click', function() {
        fileInput.trigger('click');
      })
      fileInput.on('change', function(e) {
        var files = fileInput.get(0).files;
        $.each(files, function(i, file) {
          var fileExt = file.name.toLowerCase().substr((~-file.name.lastIndexOf(".") >>> 0) + 2)
          if (fileExt == 'srt')
            t.addTextTrackFromFile(file, 'ISO-8859-1')
        })
      })

      // Drag&Drop support
      $('body').on('drop', function(e) {
        if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files) {
          var files = e.originalEvent.dataTransfer.files
          $.each(files, function(i, file) {
            var fileExt = file.name.toLowerCase().substr((~-file.name.lastIndexOf(".") >>> 0) + 2)
            if (fileExt == 'srt') 
              t.addTextTrackFromFile(file, 'ISO-8859-1')
          });
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
      t.checkForTracks()

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
