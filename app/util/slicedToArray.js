/* eslint-disable no-underscore-dangle, no-cond-assign, no-unsafe-finally */

// Broken out into a separate function to avoid deoptimizations due to the try/catch for the
// array iterator case.
function sliceIterator(arr, i) {
  // this is an expanded form of \`for...of\` that properly supports abrupt completions of
  // iterators etc. variable names have been minimised to reduce the size of this massive
  // helper. sometimes spec compliancy is annoying :(
  //
  // _n = _iteratorNormalCompletion
  // _d = _didIteratorError
  // _e = _iteratorError
  // _i = _iterator
  // _s = _step
  const _arr = [];
  let _n = true;
  let _d = false;
  let _e;
  let _i;
  let _s;

  try {
    for (
      _i = arr[Symbol.iterator](), _s;
      !(_n = (_s = _i.next()).done);
      _n = true
    ) {
      _arr.push(_s.value);
      if (i && _arr.length === i) {
        break;
      }
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i.return) {
        _i.return();
      }
    } finally {
      if (_d) {
        throw _e;
      }
    }
  }
  return _arr;
}

export default function (arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  }
  if (Symbol.iterator in Object(arr)) {
    return sliceIterator(arr, i);
  }
  throw new TypeError('Invalid attempt to destructure non-iterable instance');
}
