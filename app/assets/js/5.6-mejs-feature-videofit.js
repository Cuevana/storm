// VideoFit Plugin made by fluzzi
(function($) {

	$.extend(MediaElementPlayer.prototype, {
		buildvideofit: function(player, controls, layers, media) {

			var t = this;

			player.videofitButton =
				$('<div id="mejs-videofit" class="mejs-button mejs-videofit-button">'+
					'<button type="button" aria-controls="' + t.id + '" title="videofit" aria-label="videofit"><i class="fa fa-desktop"></i></button>'+
					'<div class="mejs-videofit-selector">'+
							'<div class="head">VideoFit</div>' +
						'<ul>'+
							'<li data-style="cover" class="videofit-cover">Cover</li>'	+
							/* comment fit, as don't keep aspect radio 
							'<li data-style="fill" class="videofit-fill">Fill</li>'	+
							*/
							'<li data-style="contain" class="videofit-default selected">Default</li>'	+
						'</ul>'+
						'<div class="arrow"><span></span><span></span></div>' +
					'</div>'+
				'</div>')
					.appendTo(controls);

			// hover
			player.videofitButton.hover(function() {
				$(this).find('.mejs-videofit-selector').css('visibility','visible');
			}, function() {
				$(this).find('.mejs-videofit-selector').css('visibility','hidden');
			});
			
			//click actions
			player.videofitButton.find('li').on('click',function() {
				//click change selected
					t.videofitButton.find('li.selected').removeClass('selected');
					$(this).addClass('selected');

				//Change Video fit
					var vfstyle = $(this).attr('data-style');
					$('#player').css("object-fit", vfstyle);
			});
			
		},
	});

})(mejs.$);
