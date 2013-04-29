
var denied = exports;

denied.distinct = function (self) {
  if (self._fields && Object.keys(self._fields).length > 0) {
    return 'field selection and slice'
  }

  var keys = Object.keys(denied.distinct);
  var err;

  keys.every(function (option) {
    if (self.options[option]) {
      err = option;
      return false;
    }
    return true;
  });

  return err;
};

denied.distinct.select =
denied.distinct.slice =
denied.distinct.sort =
denied.distinct.limit =
denied.distinct.skip =
denied.distinct.batchSize =
denied.distinct.comment =
denied.distinct.maxScan =
denied.distinct.snapshot =
denied.distinct.hint =
denied.distinct.tailable = true;

// aggregation integration
// findAndModify

denied.count = function (self) {
  if (self._fields && Object.keys(self._fields).length > 0) {
    return 'field selection and slice'
  }

  var keys = Object.keys(denied.count);
  var err;

  keys.every(function (option) {
    if (self.options[option]) {
      err = option;
      return false;
    }
    return true;
  });

  return err;
}

denied.count.select =
denied.count.slice =
denied.count.sort =
denied.count.batchSize =
denied.count.comment =
denied.count.maxScan =
denied.count.snapshot =
denied.count.hint =
denied.count.tailable = true;
