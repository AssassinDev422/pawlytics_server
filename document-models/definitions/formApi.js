document.formApi = function () {
  console.log(' initializing formApi ');
  var values = {};
  var elements = {};
  var functions = {};
  var dataObjects = {};
  var updateDatabase = {{notifyFuncName}};//('{{noValue}}', {{dataObject}}, event);

  return {
    connect(valueId, value, _dataObject, func) {
      functions[valueId] = func;
      dataObjects[valueId] = _dataObject;
      // call with the initial value right back
      func(value);
    },
    onClick(elementId, handler) {
      elements[elementId] = document.getElementById(elementId);
      elements[elementId].addEventListener("click", function() {
        handler(elements[elementId]);
      })
    },
    setValue(valueId, value) {
      values[valueId] = value;
      functions[valueId](value);
      // call the global function to notify of change
      console.log( 'sending the object: ', dataObjects[valueId]);
      updateDatabase(value, dataObjects[valueId]);
    },
    getValue(valueId) {
      return values[valudId];
    }
  }
}();
