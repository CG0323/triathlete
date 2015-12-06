var express = require('express');
var router = express.Router();
  
/* GET matches listing. */
router.get('/', function(req, res, next) {
  var Triathlete = req.app.get('models').Triathlete;
  Triathlete.findAll().then(function(triathlete){
    res.send(triathlete);
  });
});

router.param('id', function(req, res, next ,id){
  console.log("param here");
  var Triathlete = req.app.get('models').Triathlete;
  Triathlete.findById(id).then(function(triathlete){
    if (triathlete) {
      req.triathlete = triathlete;
      next();
    } else {
      next(new Error('triathlete id:' + id + ' not exist'));
    }
  });
});

router.get('/:id', function(req, res, next) {
  var triathlete = req.triathlete;
    res.send(triathlete);

});

router.get('/:id/results', function(req, res, next) {
  var triathlete = req.triathlete;
  triathlete.getMatchResults().then(function(results){
    res.send(results);
  });
    

});

module.exports = router;
