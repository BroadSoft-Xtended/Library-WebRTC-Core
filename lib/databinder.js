module.exports = DataBinder;

var ee = require('event-emitter');

function DataBinder( objectid ) {
  var emitter = ee({});

  var lastValues = {};
  var self = {};

  self.onModelChange = function(cb){
    emitter.on(objectid, function(data){
      if(!data.fromView) {
        cb(data.name, data.value, data.sender);
      }
    });
  };
  self.onModelPropChange = function(name, cb){
    self.onModelChange(function(_name, value, sender){
      if(Array.isArray(name) && name.indexOf(_name) !== -1 || _name === name) {
        cb(value, _name, sender);
      }
    });
    (Array.isArray(name) && name || [name]).forEach(function(n){
      lastValues[n] !== undefined && cb(lastValues[n], n);
    });
  };
  self.onViewChange = function(cb){
    emitter.on(objectid, function(data){
      if(data.fromView) {
        cb(data.name, data.value, data.sender);
      }
    });
  };
  self.onViewElChange = function(name, cb){
    self.onViewChange(function(_name, value, sender){
        if(Array.isArray(name) && name.indexOf(_name) !== -1 || _name === name) {
          cb(value, _name, sender);
        }
    });
    (Array.isArray(name) && name || [name]).forEach(function(n){
      lastValues[n] !== undefined && cb(lastValues[n], n);
    });
  };

  var emit  = function(name, value, fromView, sender){
    // break if both are NaNs as it does not match on equality
    if(value+'' === 'NaN' && lastValues[name]+'' === 'NaN') {
      return;
    }

    if(lastValues[name] !== value) {
      lastValues[name] = value;
      emitter.emit(objectid, {name: name, value: value, fromView: fromView, sender: sender});
    }
  };

  self.viewChanged = function(name, value, sender){
    emit(name, value, true, sender);
  };
  self.modelChanged = function(name, value, sender){
    emit(name, value, false, sender);
  };

  return self;
}
