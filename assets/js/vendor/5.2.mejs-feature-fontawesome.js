/*!
* mejs-feature-fontawesome.js
* Replace Image Controls with Font Awesome for MediaElement.js.
* http://www.hark.com/
*
* Copyright 2012, Hark.com (http://www.hark.com/)
* Licensed under the MIT license.
*/
(function($){
  MediaElementPlayer.prototype.buildfontawesome = function(player, controls, layers, media){
    // Speed Up: Make elements and add their class the right way, but ugly.
    $('.mejs-volume-button button', controls).append('<i class="fa fa-volume-up"></i><i class="fa fa-volume-off"></i>');
    $('.mejs-playpause-button button', controls).append('<i class="fa fa-play"></i><i class="fa fa-pause"></i>');
    $('.mejs-stop-button button', controls).append('<i class="fa fa-stop"></i>');
    $('.mejs-captions-button button', controls).append('<i class="fa fa-comment"></i>');
    $('.mejs-fullscreen-button button', controls).append('<i class="fa fa-expand"></i>');
    $('.mejs-unfullscreen-button button', controls).append('<i class="fa fa-compress"></i>');
    $('.mejs-loop-button button', controls).append('<i class="fa fa-repeat"></i>');
  };
})(jQuery);