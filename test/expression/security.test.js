var assert = require('assert');
var math = require('../../index');

describe('security', function () {

  it ('should not allow calling Function via constructor', function () {
    assert.throws(function () {
      math.eval('[].map.constructor("console.log(\'hacked...\')")()');
    }, /Error: Cannot access method "map" as a property/);
  })

  it ('should not allow calling Function via constructor (2)', function () {
    assert.throws(function () {
      math.eval('sqrt.constructor("console.log(\'hacked...\')")()');
    }, /Error: No access to method "constructor"/);
  })

  it ('should not allow calling Function via call/apply', function () {
    assert.throws(function () {
      math.eval('[].map.constructor.call(null, "console.log(\'hacked...\')")()');
    }, /Error: Cannot access method "map" as a property/);

    assert.throws(function () {
      math.eval('[].map.constructor.apply(null, ["console.log(\'hacked...\')"])()');
    }, /Error: Cannot access method "map" as a property/);
  })

  it ('should not allow calling constructor of a class', function () {
    assert.throws(function () {
      math.eval('[].constructor()');
    }, /Error: No access to method "constructor"/);
  })

  it ('should not allow calling Function via constructor', function () {
    assert.throws(function () {
      math.eval('[].map.constructor("console.log(\'hacked...\')")()');
    }, /Error: Cannot access method "map" as a property/);

    assert.throws(function () {
      math.eval('[].map["constructor"]("console.log(\'hacked...\')")()');
    }, /Error: Cannot access method "map" as a property/);
  })

  it ('should not allow calling Function via a disguised constructor', function () {
    assert.throws(function () {
      math.eval('prop="constructor"; [].map[prop]("console.log(\'hacked...\')")()');
    }, /Error: Cannot access method "map" as a property/);

    assert.throws(function () {
      math.eval('[].map[concat("constr", "uctor")]("console.log(\'hacked...\')")()');
    }, /Error: Cannot access method "map" as a property/);
  })

  it ('should not allow calling Function via bind', function () {
    assert.throws(function () {
      math.eval('[].map.constructor.bind()("console.log(\'hacked...\')")()');
    }, /Error: Cannot access method "map" as a property/);
  })

  it ('should not allow calling Function via map/forEach', function () {
    // TODO: simplify this test case, let it output console.log('hacked...')
    assert.throws(function () {
      math.eval('["//","a/*\\nreturn process.mainModule.require"]._data.map(cos.constructor)[1]()("child_process").execSync("ps >&2")');
    }, /Error: No access to property "_data/);
  })

  it ('should not allow calling Function via Object.assign', function () {
    // TODO: simplify this test case, let it output console.log('hacked...')
    assert.throws(function () {
      math.eval('{}.constructor.assign(cos.constructor, {binding: cos.bind})\n' +
          '{}.constructor.assign(cos.constructor, {bind: null})\n' +
          'cos.constructor.binding()("console.log(\'hacked...\')")()');
    }, /Error: No access to property "constructor/);
  })

  it ('should not allow calling Function via imported, overridden function', function () {
    assert.throws(function () {
      var math2 = math.create();
      math2.eval('import({matrix:cos.constructor},{override:1});x=["console.log(\'hacked...\')"];x()');
    }, /Error: Undefined symbol import/);
  })

  it ('should not allow calling Function via index retrieval', function () {
    assert.throws(function () {
      math.eval('a=["console.log(\'hacked...\')"]._data;a.isRange=true;x={subset:cos.constructor}[a];x()');
    }, /Error: No access to property "_data/);
  })

  it ('should not allow calling Function via getOwnPropertyDescriptor', function () {
    assert.throws(function () {
      math.eval('p = parser()\n' +
          'p.eval("", [])\n' +
          'o = p.get("constructor")\n' +
          'c = o.getOwnPropertyDescriptor(o.__proto__, "constructor")\n' +
          'c.value("console.log(\'hacked...\')")()');
    }, /Error: No access to method "get"/);
  })

  it ('should not allow calling Function via a symbol', function () {
    assert.throws(function () {
      math.eval('O = {}.constructor\n' +
          'd = O.getOwnPropertyDescriptor(O.__proto__, "constructor")\n' +
          'eval("value", d)("console.log(\'hacked...\')")()');
    }, /Error: No access to property "constructor/);
  })

  it ('should not allow calling Function via a specially encoded constructor property name', function () {
    assert.throws(function () {
      math.eval('[].map["\\x63onstructor"]("console.log(\'hacked...\')")()');
    }, /Error: Cannot access method "map" as a property/);
  })

  it ('should not allow calling Object via a an object constructor', function () {
    assert.throws(function () {
            math.eval('{}.constructor.assign(expression.node.AssignmentNode.prototype, ' +
                '{_compile: "".toString.bind("console.log(\'hacked...\')")})\n' +
                'eval("a = 2")');
    }, /Error: No access to property "constructor/);
  })

  it ('should not allow calling Object via a __defineGetter__', function () {
    assert.throws(function () {
      math.eval('expression.node.AssignmentNode.prototype.__defineGetter__("_compile", ' +
          '{}.valueOf.bind("".toString.bind("console.log(\'hacked...\')"))); eval("a = 2")')
    }, /Error: Undefined symbol expression/);
  })

  it ('should not allow calling eval via a custom compiled SymbolNode', function () {
    assert.throws(function () {
      math.eval("s={};s.__proto__=expression.node.SymbolNode[\"prototype\"];expression.node.SymbolNode.apply(s,[\"\\\");},\\\"exec\\\":function(a){return global.eval}};//\"]._data);s.compile().exec()(\"console.log(\'hacked...\')\")")
    }, /Error: Undefined symbol expression/);
  })

  it ('should not allow calling eval via parse', function () {
    assert.throws(function () {
      math.eval('x=parse(\"cos\");x.name = \"\\\");},\\\"eval\\\": function(a) {return global.eval}};\/\/a\"; x.compile().eval()(\"console.log(\'hacked...\')\")')
    }, /No access to property "name"/);
  })

  it ('should not allow calling eval via parse (2)', function () {
    assert.throws(function () {
      math.eval('p = parse("{}[\\"console.log(\'hacked...\')\\"]"); p.index.dimensions["0"].valueType = "boolean"; p.eval()')
    }, /No access to property "index"/);
  })

  it ('should not allow calling eval via function.syntax', function () {
    assert.throws(function () {
      math.eval('cos.syntax="global.eval";s=unit("5 cm");s.units=[]._data;s.value=cos;s._compile=s.toString;expression.node.Node.prototype.compile.call(s).eval()("console.log(\'hacked...\')")')
    }, /Error: No access to property "syntax"/);
  })

  it ('should not allow calling eval via clone', function () {
    assert.throws(function () {
      math.eval('expression.node.ConstantNode.prototype.clone.call({"value":"eval", "valueType":"null"}).eval()("console.log(\'hacked...\')")')
    }, /Error: Undefined symbol expression/);
  })

  it ('should allow calling functions on math', function () {
    assert.equal(math.eval('sqrt(4)'), 2);
  })

  it ('should allow accessing properties on an object', function () {
    assert.deepEqual(math.eval('obj.a', {obj: {a:42}}), 42);
  })

  it ('should not allow accessing inherited properties on an object', function () {
    assert.throws(function () {
      math.eval('obj.constructor', {obj: {a:42}});
    }, /Error: No access to property "constructor"/)
  })

  it ('should not allow getting properties from non plain objects', function () {
    assert.throws(function () {math.eval('[]._data')}, /No access to property "_data"/)
    assert.throws(function () {math.eval('unit("5cm").valueOf')}, /Cannot access method "valueOf" as a property/)
  });

  it ('should not have access to specific namespaces', function () {
    assert.throws(function () {math.eval('expression')}, /Undefined symbol/)
    assert.throws(function () {math.eval('type')}, /Undefined symbol/)
    assert.throws(function () {math.eval('error')}, /Undefined symbol/)
  });

});
