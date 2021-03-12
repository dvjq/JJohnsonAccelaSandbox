 function isEmpty(obj) {    
   for (var n in obj) if (obj.hasOwnProperty(n) && obj[n]) return false;    
   return true;
 }

  function createObj(base, props) {    
    function Obj() {}    
    Obj.prototype = base;    
    var inst = new Obj();    
    if (props) copyObj(props, inst);    
    return inst;
  }  

  function copyObj(obj, target) {
    if (!target) target = {};    
    for (var prop in obj) if (obj.hasOwnProperty(prop)) target[prop] = obj[prop];    
    return target;  
  }

  function indexOf(collection, elt) {    
    if (collection.indexOf) return collection.indexOf(elt);    
    for (var i = 0, e = collection.length; i < e; ++i)      
      if (collection[i] == elt) return i;    
    return -1;  
  }