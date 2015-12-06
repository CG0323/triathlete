var express = require('express');
var router = express.Router();
  
/* GET matches listing. */
router.get('/', function(req, res, next) {
  var Match = req.app.get('models').Match;
  Match.findAll().then(function(matches){
    res.send(matches);
  });
});

router.param('id', function(req, res, next ,id){
  console.log("param here");
  var Match = req.app.get('models').Match;
  Match.findById(id).then(function(match){
    if (match) {
      req.match = match;
      next();
    } else {
      next(new Error('match id:' + id + ' not exist'));
    }
  });
});

router.get('/:id', function(req, res, next) {
  var match = req.match;
    res.send(match);

});

router.get('/:id/results', function(req, res, next) {
  var match = req.match;
  match.getMatchResults().then(function(results){
    res.send(results);
  });
    

});

module.exports = router;
