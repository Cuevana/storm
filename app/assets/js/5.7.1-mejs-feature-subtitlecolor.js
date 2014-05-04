// VideoFit Plugin made by fluzzi
(function($) {

	$.extend(MediaElementPlayer.prototype, {
		buildsubtitlecolors: function(player, controls, layers, media) {
			var sizeControl = player.captionsButton.find('.mejs-captions-selector > .size');
			var colorSelector = $('<div class="color clearfix" title="Cambiar color de subtítulos"><label>Color de subtítulos</label><span class="colorpicker"></span></div>')
				.insertAfter(sizeControl);
			colorSelector.find('.colorpicker').minicolors({
				change: function(hex, opacity) {
					$('.mejs-captions-text').css({'color': hex, 'opacity': opacity});
				},
				opacity: true
			});
			player.captionsButton.hover(null, function() {
				player.captionsButton.find('.colorpicker').minicolors('hide');
			});
		}
	});
})(mejs.$);
