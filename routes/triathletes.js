var express = require('express');
var router = express.Router();
  
/* GET matches listing. */
router.get('/', function(req, res, next) {
  var Triathlete = req.app.get('models').Triathlete;
  Triathlete.findAll({where: {result_total_count:{gt:0}}}).then(function(triathletes){
    var retVal = triathletes.sort(comparer)
    res.send(triathletes);
  });
});

router.param('id', function(req, res, next ,id){
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

router.param('level', function(req, res, next ,level){
  if(level <0 || level >4){
    next(new Error('level:' + level + ' not exist'));
  }
  var levelBook = ['健将','一级','二级','三级','四级'];
  var Triathlete = req.app.get('models').Triathlete;
  Triathlete.findAll({ where: { level: levelBook[level] } }).then(function (triathletes) {
    req.triathletes = triathletes;
    next();
  });
});

router.get('/level/:level', function(req, res, next) {
  var triathletes = req.triathletes;
  res.send(triathletes);
});

function comparer(a, b){
  return (b.result_total_count - a.result_total_count);
}

module.exports = router;
