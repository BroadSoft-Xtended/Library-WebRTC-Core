module.exports = DataBinder;

var ee = require('event-emitter');

function DataBinder( objectid ) {
  var emitter = ee({});

  var self = {};

  self.onModelChange = function(cb){
    emitter.on(objectid, function(data){
      if(!data.fromView) {
        cb(data.name, data.value);
      }
    });
  };
  self.onViewChange = function(cb){
    emitter.on(objectid, function(data){
      if(data.fromView) {
        cb(data.name, data.value);
      }
    });
  };

  self.viewChanged = function(name, value){
    emitter.emit(objectid, {name: name, value: value, fromView: true});
  };
  self.modelChanged = function(name, value){
    emitter.emit(objectid, {name: name, value: value, fromView: false});
  };

  return self;
}
