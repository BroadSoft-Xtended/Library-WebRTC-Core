module.exports = DataBinder;

var ee = require('event-emitter');

function DataBinder( objectid ) {
  var emitter = ee({});

  var lastViewValues = {};
  var lastModelValues = {};
  var self = {};

  self.onModelChange = function(cb){
    emitter.on(objectid, function(data){
      if(!data.fromView) {
        cb(data.name, data.value);
      }
    });
  };
  self.onModelPropChange = function(name, cb){
    self.onModelChange(function(_name, value){
      if(Array.isArray(name) && name.indexOf(_name) !== -1 || _name === name) {
        cb(value, _name);
      }
    });
    (Array.isArray(name) && name || [name]).forEach(function(n){
      lastModelValues[n] && cb(lastModelValues[n], n);
    });
  };
  self.onViewChange = function(cb){
    emitter.on(objectid, function(data){
      if(data.fromView) {
        cb(data.name, data.value);
      }
    });
  };
  self.onViewElChange = function(name, cb){
    self.onViewChange(function(_name, value){
        if(Array.isArray(name) && name.indexOf(_name) !== -1 || _name === name) {
          cb(value, _name);
        }
    });
    (Array.isArray(name) && name || [name]).forEach(function(n){
      lastViewValues[n] && cb(lastViewValues[n], n);
    });
  };

  var emit  = function(name, value, fromView, lastValues){
    if(lastValues[name] !== value) {
      lastValues[name] = value;
      emitter.emit(objectid, {name: name, value: value, fromView: fromView});
    }
  };

  self.viewChanged = function(name, value){
    emit(name, value, true, lastViewValues);
  };
  self.modelChanged = function(name, value){
    emit(name, value, false, lastModelValues);
  };

  return self;
}
