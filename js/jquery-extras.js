(function ($) {
  if (!$) return;
  $(function () {
    // Minor hover enhancement on nav links
    $('.nav__list a').on('mouseenter focus', function () {
      $(this).addClass('is-hover');
    }).on('mouseleave blur', function () {
      $(this).removeClass('is-hover');
    });

    function wireCookie($banner) {
      if (!$banner.length) return;
      // Animate banner appearance
      $banner.hide().attr('open', '').fadeIn(200);
      $banner.on('click', '#cookie-accept, #cookie-decline', function () {
        $banner.fadeOut(200, function () { $banner.removeAttr('open'); });
      });
    }

    // If banner already exists
    var $existing = $('#cookie-banner');
    if ($existing.length) {
      wireCookie($existing);
    } else {
      // Observe DOM for later injection by common.js
      var mo = new MutationObserver(function () {
        var $b = $('#cookie-banner');
        if ($b.length) { wireCookie($b); mo.disconnect(); }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  });
})(window.jQuery);