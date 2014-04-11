(function($) {

  // Prevent Detection for touch on mediafeatures
  $.extend(mejs.MediaFeatures, {
    hasTouch: false
  });
})(mejs.$);
