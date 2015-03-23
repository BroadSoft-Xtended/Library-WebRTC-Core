module.exports = DataBinder;

var ee = require('event-emitter');

function DataBinder( objectid ) {
  var emitter = ee({});

  var lastValues = {};
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
        cb(value);
      }
    });
    lastValues[name] && cb(lastValues[name]);
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
          cb(value);
        }
    });
    lastValues[name] && cb(lastValues[name]);
  };

  var emit  = function(name, value, fromView){
    if(lastValues[name] !== value) {
      lastValues[name] = value;
      emitter.emit(objectid, {name: name, value: value, fromView: fromView});
    }
  };

  self.viewChanged = function(name, value){
    emit(name, value, true);
  };
  self.modelChanged = function(name, value){
    emit(name, value, false);
  };

  return self;
}
