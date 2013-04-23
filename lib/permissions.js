
var permissions = exports;

permissions.distinct = function (self) {
  if (self._fields && Object.keys(self._fields).length > 0) {
    return 'field selection and slice'
  }

  var keys = Object.keys(permissions.distinct);
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

permissions.distinct.select =
permissions.distinct.slice =
permissions.distinct.sort =
permissions.distinct.limit =
permissions.distinct.skip =
permissions.distinct.batchSize =
permissions.distinct.comment =
permissions.distinct.maxScan =
permissions.distinct.snapshot =
permissions.distinct.hint =
permissions.distinct.tailable = true;

// aggregation integration
// findAndModify
