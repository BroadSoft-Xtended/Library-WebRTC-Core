module.exports = PopupView;
var $ = require('jquery');

function PopupView(view, eventbus, opts) {
  opts = opts || {};
  view.attached = false;

  view.visible = false;

  view.show = function() {
    view.setVisible(true);
  };

  view.hide = function() {
    view.setVisible(false);
  };

  view.toggle = function(visible) {
    view.setVisible(typeof visible !== undefined && visible || !view.model.visible || !view.visible);
  };

  view.appendTo = function(parent) {
    view.view.appendTo(parent);
  };

  view.setVisible = function(visible) {
    view.visible = visible;
    view.model.visible = visible;
  };

  if(opts.modifier) {
    eventbus.on('modifier', function(e) {
      if (e.which === opts.modifier) {
        view.toggle();
      }
    });    
  }

  if (!view.attached) {
    view.appendTo(opts.parent && $(opts.parent) || $('body'));
    // document.body.appendChild(view.view[0]);
    view.attached = true;
  }

  return view;
}