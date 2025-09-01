// Proxy 和 Reflect 基础示例
console.log('=== Proxy 和 Reflect 基础示例 ===\n');

// 1. 基本 Proxy 用法
console.log('1. 基本 Proxy 用法');
const person = {
  name: '张三',
  age: 25,
  city: '北京'
};

const personProxy = new Proxy(person, {
  get(target, property) {
    console.log(`📖 读取属性: ${property}`);
    return Reflect.get(target, property);
  },
  
  set(target, property, value) {
    console.log(`✏️ 设置属性 ${property} = ${value}`);
    return Reflect.set(target, property, value);
  },
  
  has(target, property) {
    console.log(`🔍 检查属性: ${property}`);
    return Reflect.has(target, property);
  }
});

console.log('访问 name:', personProxy.name);
personProxy.age = 26;
console.log('检查 city 是否存在:', 'city' in personProxy);
console.log('');

// 2. 属性验证器
console.log('2. 属性验证器');
class User {
  constructor() {
    return new Proxy(this, {
      set(target, property, value) {
        if (property === 'email') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            throw new Error('❌ 邮箱格式不正确');
          }
        }
        
        if (property === 'age') {
          if (typeof value !== 'number' || value < 0 || value > 120) {
            throw new Error('❌ 年龄必须是 0-120 之间的数字');
          }
        }
        
        target[property] = value;
        console.log(`✅ ${property} 设置成功: ${value}`);
        return true;
      }
    });
  }
}

const user = new User();
try {
  user.email = 'test@example.com';
  user.age = 25;
  user.name = '李四';
  // user.email = 'invalid-email'; // 这行会抛出错误
} catch (error) {
  console.log(error.message);
}
console.log('');

// 3. 动态属性访问
console.log('3. 动态属性访问');
const dynamicObj = new Proxy({}, {
  get(target, property) {
    if (typeof property === 'string') {
      // 如果属性名包含 'upper'，返回大写版本
      if (property.includes('upper')) {
        const baseProperty = property.replace('upper', '').toLowerCase();
        return target[baseProperty] ? target[baseProperty].toUpperCase() : undefined;
      }
      
      // 如果属性名包含 'length'，返回字符串长度
      if (property.includes('length')) {
        const baseProperty = property.replace('length', '').toLowerCase();
        return target[baseProperty] ? target[baseProperty].length : 0;
      }
    }
    
    return Reflect.get(target, property);
  }
});

dynamicObj.name = 'hello world';
console.log('name:', dynamicObj.name);
console.log('upperName:', dynamicObj.upperName);
console.log('nameLength:', dynamicObj.nameLength);
console.log('');

// 4. 函数调用拦截
console.log('4. 函数调用拦截');
function calculator(operation, a, b) {
  switch (operation) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide': return a / b;
    default: return 0;
  }
}

const calculatorProxy = new Proxy(calculator, {
  apply(target, thisArg, argumentsList) {
    const [operation, a, b] = argumentsList;
    console.log(`🧮 执行计算: ${operation}(${a}, ${b})`);
    
    // 参数验证
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('❌ 参数必须是数字');
    }
    
    if (operation === 'divide' && b === 0) {
      throw new Error('❌ 除数不能为零');
    }
    
    const result = Reflect.apply(target, thisArg, argumentsList);
    console.log(`📊 计算结果: ${result}`);
    return result;
  }
});

console.log(calculatorProxy('add', 5, 3));
console.log(calculatorProxy('multiply', 4, 7));
try {
  calculatorProxy('divide', 10, 0);
} catch (error) {
  console.log(error.message);
}
console.log('');

// 5. 构造函数拦截
console.log('5. 构造函数拦截');
class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
    this.createTime = new Date();
  }
}

const ProductProxy = new Proxy(Product, {
  construct(target, argumentsList) {
    const [name, price] = argumentsList;
    console.log(`🏗️ 创建产品: ${name}, 价格: ${price}`);
    
    // 验证参数
    if (!name || typeof name !== 'string') {
      throw new Error('❌ 产品名称不能为空');
    }
    
    if (!price || typeof price !== 'number' || price <= 0) {
      throw new Error('❌ 价格必须是大于0的数字');
    }
    
    const instance = Reflect.construct(target, argumentsList);
    console.log(`✅ 产品创建成功`);
    return instance;
  }
});

const product1 = new ProductProxy('iPhone', 6999);
console.log('产品信息:', product1);
try {
  const product2 = new ProductProxy('', -100);
} catch (error) {
  console.log(error.message);
}
console.log('');

// 6. Reflect 方法演示
console.log('6. Reflect 方法演示');
const obj = { a: 1, b: 2 };

console.log('Reflect.get():', Reflect.get(obj, 'a'));
console.log('Reflect.set():', Reflect.set(obj, 'c', 3));
console.log('对象状态:', obj);
console.log('Reflect.has():', Reflect.has(obj, 'b'));
console.log('Reflect.ownKeys():', Reflect.ownKeys(obj));
console.log('Reflect.deleteProperty():', Reflect.deleteProperty(obj, 'a'));
console.log('删除后对象:', obj);
console.log('');

// 7. 响应式数据示例
console.log('7. 响应式数据示例');
class ReactiveData {
  constructor(data) {
    this.data = data;
    this.listeners = {};
    
    return new Proxy(this, {
      get(target, property) {
        if (property in target.data) {
          return target.data[property];
        }
        return Reflect.get(target, property);
      },
      
      set(target, property, value) {
        if (property in target.data) {
          const oldValue = target.data[property];
          target.data[property] = value;
          
          // 触发监听器
          if (target.listeners[property]) {
            target.listeners[property].forEach(listener => {
              listener(oldValue, value);
            });
          }
          return true;
        }
        return Reflect.set(target, property, value);
      }
    });
  }
  
  watch(property, callback) {
    if (!this.listeners[property]) {
      this.listeners[property] = [];
    }
    this.listeners[property].push(callback);
  }
}

const reactiveData = new ReactiveData({ count: 0, message: 'Hello' });

reactiveData.watch('count', (oldVal, newVal) => {
  console.log(`📈 count 从 ${oldVal} 变为 ${newVal}`);
});

reactiveData.watch('message', (oldVal, newVal) => {
  console.log(`💬 message 从 "${oldVal}" 变为 "${newVal}"`);
});

reactiveData.count = 1;
reactiveData.count = 5;
reactiveData.message = 'Hello World';
console.log('');

console.log('=== 示例完成 ===');