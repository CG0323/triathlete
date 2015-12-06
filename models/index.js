"use strict"

var Sequelize = require('sequelize');

var sequelize = new Sequelize('triathlon', 'triathlon', '088583-salahdin', {host:'123.56.103.93', port: '3306', dialect: 'mysql', insecureAuth: true, charset: 'utf-8'});

// load models
var models = [
  'MatchResult',
  'Triathlete',
  'Match'
];
models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

// describe relationships
(function(m) {
  m.MatchResult.belongsTo(m.Triathlete);
  m.MatchResult.belongsTo(m.Match);
  m.Triathlete.hasMany(m.MatchResult);
  m.Match.hasMany(m.MatchResult);
})(module.exports);

// export connection
module.exports.sequelize = sequelize;