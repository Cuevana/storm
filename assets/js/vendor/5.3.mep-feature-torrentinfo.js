// Torrent info Plugin
(function($) {

	$.extend(MediaElementPlayer.prototype, {
		buildtorrentinfo: function(player, controls, layers, media) {

			var t = this;

			player.torrentinfoButton =
				$('<div id="mejs-torrent-info" class="mejs-button mejs-torrentinfo-button"></div>')
					.appendTo(controls)

			// Assign events for subtitle size change
			// var steps = [0, 25, 50, 75, 100];
			var slider = $('#mejs-subtitles-size'), 
				track = slider.children('span.track'), 
				handle = slider.children('span.handle'), 
				width = slider.width(), 
				min = slider.offset().left,
				max = min+width;

			handle.on('mousedown.subslider', function(e) {
				$(document).on('mousemove.subslider', function(e) {
					player.subtitleSliderPosition(e, min, max)
				});
			})
			$(document).on('mouseup.subslider', function() {
				$(document).off('mousemove.subslider');
			});

			track.on('click', function(e) {
				player.subtitleSliderPosition(e, min, max);
			})

			// If saved, load config
			var size = localStorage.getItem('subtitleSize') || 50;
			player.setSubtitleSize(size);
		},

		subtitleSliderPosition: function(e, min, max) {
			var position,
				slider = $('#mejs-subtitles-size'), 
				track = slider.children('span.track'), 
				handle = slider.children('span.handle'), 
				width = slider.width(), 
				min = slider.offset().left,
				max = min+width;

			if (e.pageX >= min && e.pageX <= max) {
				position = Math.round((e.pageX-min)/(max-min)*100);
			} else if (e.pageX < min) {
				position = 0;
			} else if (e.pageX > max) {
				position = 100;
			}
			this.setSubtitleSize(position);
		},

		setSubtitleSize: function(percent) {
			$('#mejs-subtitles-size').children('span.handle').css('left',percent+'%');

			var min_size = 180;
			var max_size = 370;
			var range = max_size-min_size;
			var size = min_size+Math.round(percent * range / 100);
			$('.mejs-captions-layer').css('font-size', size+'%')
			localStorage.setItem('subtitleSize', percent);
		}
	});

})(mejs.$);
