# JavaScript 代理（Proxy）和反射（Reflect）详解

## 目录
1. [Proxy 基础概念](#proxy-基础概念)
2. [Proxy 详细讲解](#proxy-详细讲解)
3. [Reflect 基础概念](#reflect-基础概念)
4. [Reflect 详细讲解](#reflect-详细讲解)
5. [Proxy 与 Reflect 结合使用](#proxy-与-reflect-结合使用)
6. [实际应用场景](#实际应用场景)
7. [学习成果检测案例](#学习成果检测案例)

## Proxy 基础概念

Proxy 是 ES6 引入的一个强大特性，它允许你拦截并自定义对象的基本操作（如属性查找、赋值、枚举、函数调用等）。

### 基本语法
```javascript
const proxy = new Proxy(target, handler);
```

- `target`: 被代理的原始对象
- `handler`: 一个对象，定义了哪些操作将被拦截以及如何重新定义被拦截的操作

## Proxy 详细讲解

### 1. 基本用法示例

```javascript
// 创建一个简单的对象
const person = {
  name: '张三',
  age: 25
};

// 创建代理对象
const personProxy = new Proxy(person, {
  // 拦截属性读取操作
  get(target, property) {
    console.log(`正在访问属性: ${property}`);
    return target[property];
  },
  
  // 拦截属性设置操作
  set(target, property, value) {
    console.log(`正在设置属性 ${property} 为: ${value}`);
    target[property] = value;
    return true;
  }
});

// 使用代理对象
console.log(personProxy.name); // 输出: 正在访问属性: name  张三
personProxy.age = 26; // 输出: 正在设置属性 age 为: 26
```

### 2. 常用的 Handler 方法

#### get(target, property, receiver)
拦截对象属性的读取操作。

```javascript
const obj = { a: 1, b: 2 };
const proxy = new Proxy(obj, {
  get(target, property) {
    if (property in target) {
      return target[property];
    } else {
      return `属性 ${property} 不存在`;
    }
  }
});

console.log(proxy.a); // 1
console.log(proxy.c); // 属性 c 不存在
```

#### set(target, property, value, receiver)
拦截对象属性的设置操作。

```javascript
const user = {};
const userProxy = new Proxy(user, {
  set(target, property, value) {
    if (property === 'age' && (value < 0 || value > 120)) {
      throw new Error('年龄必须在 0-120 之间');
    }
    target[property] = value;
    return true;
  }
});

userProxy.name = '李四'; // 正常设置
userProxy.age = 30; // 正常设置
// userProxy.age = 150; // 抛出错误
```

#### has(target, property)
拦截 `in` 操作符。

```javascript
const secrets = { password: '123456', apiKey: 'secret' };
const safeSecrets = new Proxy(secrets, {
  has(target, property) {
    if (property.startsWith('_')) {
      return false;
    }
    return property in target;
  }
});

console.log('password' in safeSecrets); // true
console.log('_hidden' in safeSecrets); // false
```

#### deleteProperty(target, property)
拦截 `delete` 操作。

```javascript
const data = { a: 1, b: 2, readonly: true };
const protectedData = new Proxy(data, {
  deleteProperty(target, property) {
    if (property === 'readonly') {
      throw new Error('readonly 属性不能被删除');
    }
    delete target[property];
    return true;
  }
});

delete protectedData.a; // 正常删除
// delete protectedData.readonly; // 抛出错误
```

#### ownKeys(target)
拦截 `Object.keys()`、`Object.getOwnPropertyNames()` 等操作。

```javascript
const obj = { a: 1, b: 2, _private: 3 };
const proxy = new Proxy(obj, {
  ownKeys(target) {
    return Object.keys(target).filter(key => !key.startsWith('_'));
  }
});

console.log(Object.keys(proxy)); // ['a', 'b']
```

#### apply(target, thisArg, argumentsList)
拦截函数调用。

```javascript
function sum(a, b) {
  return a + b;
}

const sumProxy = new Proxy(sum, {
  apply(target, thisArg, argumentsList) {
    console.log(`调用函数，参数: ${argumentsList}`);
    return target.apply(thisArg, argumentsList);
  }
});

console.log(sumProxy(2, 3)); // 调用函数，参数: 2,3  结果: 5
```

#### construct(target, argumentsList, newTarget)
拦截 `new` 操作符。

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

const PersonProxy = new Proxy(Person, {
  construct(target, argumentsList) {
    console.log(`创建新实例，参数: ${argumentsList}`);
    return new target(...argumentsList);
  }
});

const person = new PersonProxy('王五'); // 创建新实例，参数: 王五
```

## Reflect 基础概念

Reflect 是一个内置对象，它提供了拦截 JavaScript 操作的方法。这些方法与 Proxy handler 的方法相同。

### 设计目的
1. 将 Object 上的一些明显属于语言内部的方法放到 Reflect 对象上
2. 修改某些 Object 方法的返回结果，使其变得更合理
3. 让 Object 操作都变成函数行为
4. 与 Proxy 的方法一一对应

## Reflect 详细讲解

### 1. 基本方法对比

#### Reflect.get() vs 直接访问
```javascript
const obj = { name: '张三', age: 25 };

// 传统方式
console.log(obj.name); // 张三

// Reflect 方式
console.log(Reflect.get(obj, 'name')); // 张三

// 处理不存在的属性
console.log(obj.nonExistent); // undefined
console.log(Reflect.get(obj, 'nonExistent')); // undefined
```

#### Reflect.set() vs 直接赋值
```javascript
const obj = {};

// 传统方式
obj.name = '李四';

// Reflect 方式
Reflect.set(obj, 'age', 30);

console.log(obj); // { name: '李四', age: 30 }
```

#### Reflect.has() vs in 操作符
```javascript
const obj = { a: 1, b: 2 };

console.log('a' in obj); // true
console.log(Reflect.has(obj, 'a')); // true
```

#### Reflect.deleteProperty() vs delete 操作符
```javascript
const obj = { a: 1, b: 2 };

// 传统方式
delete obj.a;

// Reflect 方式
Reflect.deleteProperty(obj, 'b');

console.log(obj); // {}
```

### 2. Reflect 的优势

#### 更好的错误处理
```javascript
const obj = {};
Object.defineProperty(obj, 'name', {
  value: '张三',
  writable: false,
  configurable: false
});

// 传统方式 - 可能抛出错误
try {
  delete obj.name; // 静默失败或抛出错误
} catch (e) {
  console.log('删除失败');
}

// Reflect 方式 - 返回布尔值
const result = Reflect.deleteProperty(obj, 'name');
console.log(result); // false，表示删除失败
```

#### 函数式编程风格
```javascript
const obj = { a: 1, b: 2, c: 3 };

// 使用 Reflect 进行函数式操作
const operations = [
  () => Reflect.get(obj, 'a'),
  () => Reflect.set(obj, 'd', 4),
  () => Reflect.has(obj, 'b')
];

const results = operations.map(op => op());
console.log(results); // [1, true, true]
```

## Proxy 与 Reflect 结合使用

### 1. 最佳实践模式
```javascript
const target = {
  name: '张三',
  age: 25
};

const proxy = new Proxy(target, {
  get(target, property, receiver) {
    console.log(`读取属性: ${property}`);
    // 使用 Reflect 保持默认行为
    return Reflect.get(target, property, receiver);
  },
  
  set(target, property, value, receiver) {
    console.log(`设置属性 ${property} = ${value}`);
    // 使用 Reflect 保持默认行为
    return Reflect.set(target, property, value, receiver);
  },
  
  has(target, property) {
    console.log(`检查属性: ${property}`);
    return Reflect.has(target, property);
  }
});

proxy.name = '李四';
console.log(proxy.name);
console.log('age' in proxy);
```

### 2. 创建可观察对象
```javascript
function createObservable(target, onChange) {
  return new Proxy(target, {
    set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      
      if (oldValue !== value) {
        onChange(property, oldValue, value);
      }
      
      return result;
    }
  });
}

const data = { count: 0 };
const observable = createObservable(data, (prop, oldVal, newVal) => {
  console.log(`属性 ${prop} 从 ${oldVal} 变为 ${newVal}`);
});

observable.count = 1; // 属性 count 从 0 变为 1
observable.count = 2; // 属性 count 从 1 变为 2
```

### 3. 创建验证器
```javascript
function createValidator(target, validators) {
  return new Proxy(target, {
    set(target, property, value, receiver) {
      if (validators[property]) {
        const isValid = validators[property](value);
        if (!isValid) {
          throw new Error(`${property} 的值 ${value} 不符合验证规则`);
        }
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}

const user = {};
const validatedUser = createValidator(user, {
  age: value => typeof value === 'number' && value >= 0 && value <= 120,
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
});

validatedUser.age = 25; // 正常
validatedUser.email = 'test@example.com'; // 正常
// validatedUser.age = -5; // 抛出错误
// validatedUser.email = 'invalid-email'; // 抛出错误
```

## 实际应用场景

### 1. 数据绑定和响应式系统
```javascript
class ReactiveData {
  constructor(data) {
    this.data = data;
    this.subscribers = new Map();
    
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
          target.notify(property, oldValue, value);
          return true;
        }
        return Reflect.set(target, property, value);
      }
    });
  }
  
  subscribe(property, callback) {
    if (!this.subscribers.has(property)) {
      this.subscribers.set(property, []);
    }
    this.subscribers.get(property).push(callback);
  }
  
  notify(property, oldValue, newValue) {
    if (this.subscribers.has(property)) {
      this.subscribers.get(property).forEach(callback => {
        callback(oldValue, newValue);
      });
    }
  }
}

const reactive = new ReactiveData({ count: 0, name: '张三' });

reactive.subscribe('count', (oldVal, newVal) => {
  console.log(`计数从 ${oldVal} 变为 ${newVal}`);
});

reactive.count = 1; // 计数从 0 变为 1
reactive.count = 2; // 计数从 1 变为 2
```

### 2. API 代理和缓存
```javascript
class APIProxy {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.cache = new Map();
    
    return new Proxy(this, {
      get(target, property) {
        if (typeof property === 'string' && property.startsWith('get')) {
          return target.createGetter(property);
        }
        return Reflect.get(target, property);
      }
    });
  }
  
  createGetter(methodName) {
    const endpoint = methodName.replace('get', '').toLowerCase();
    
    return async (id) => {
      const cacheKey = `${endpoint}:${id}`;
      
      if (this.cache.has(cacheKey)) {
        console.log(`从缓存返回: ${cacheKey}`);
        return this.cache.get(cacheKey);
      }
      
      console.log(`发送请求: ${this.baseURL}/${endpoint}/${id}`);
      // 模拟 API 调用
      const data = { id, endpoint, timestamp: Date.now() };
      
      this.cache.set(cacheKey, data);
      return data;
    };
  }
}

const api = new APIProxy('https://api.example.com');

// 动态创建方法
api.getUser(1).then(console.log);
api.getPost(1).then(console.log);
api.getUser(1).then(console.log); // 从缓存返回
```

### 3. 对象属性的默认值和计算属性
```javascript
function createSmartObject(data, computed = {}) {
  return new Proxy(data, {
    get(target, property) {
      // 如果是计算属性
      if (computed[property]) {
        return computed[property].call(target);
      }
      
      // 如果属性存在，直接返回
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property);
      }
      
      // 属性不存在时的默认行为
      if (typeof property === 'string') {
        // 数字属性返回 0
        if (property.includes('count') || property.includes('num')) {
          return 0;
        }
        // 字符串属性返回空字符串
        if (property.includes('name') || property.includes('text')) {
          return '';
        }
        // 布尔属性返回 false
        if (property.includes('is') || property.includes('has')) {
          return false;
        }
      }
      
      return undefined;
    }
  });
}

const person = createSmartObject({
  firstName: '张',
  lastName: '三',
  age: 25
}, {
  fullName() {
    return `${this.firstName}${this.lastName}`;
  },
  isAdult() {
    return this.age >= 18;
  }
});

console.log(person.fullName); // 张三 (计算属性)
console.log(person.isAdult); // true (计算属性)
console.log(person.unknownCount); // 0 (默认值)
console.log(person.unknownName); // '' (默认值)
console.log(person.isUnknown); // false (默认值)
```

## 性能考虑

### 1. Proxy 的性能开销
```javascript
// 性能测试示例
const normalObj = { value: 0 };
const proxiedObj = new Proxy({ value: 0 }, {
  get(target, property) {
    return Reflect.get(target, property);
  },
  set(target, property, value) {
    return Reflect.set(target, property, value);
  }
});

function performanceTest(obj, label) {
  const start = performance.now();
  
  for (let i = 0; i < 1000000; i++) {
    obj.value = i;
    const temp = obj.value;
  }
  
  const end = performance.now();
  console.log(`${label}: ${end - start}ms`);
}

// performanceTest(normalObj, '普通对象');
// performanceTest(proxiedObj, '代理对象');
```

### 2. 优化建议
```javascript
// 避免在热路径中使用过于复杂的 handler
const optimizedProxy = new Proxy({}, {
  get(target, property) {
    // 简单快速的检查
    return target[property];
  },
  
  set(target, property, value) {
    // 避免复杂的验证逻辑
    target[property] = value;
    return true;
  }
});

// 使用缓存减少重复计算
const cachedProxy = new Proxy({}, {
  get(target, property) {
    if (!target._cache) {
      target._cache = new Map();
    }
    
    if (target._cache.has(property)) {
      return target._cache.get(property);
    }
    
    const value = expensiveComputation(property);
    target._cache.set(property, value);
    return value;
  }
});

function expensiveComputation(input) {
  // 模拟耗时操作
  return input.toString().toUpperCase();
}
```

## 学习成果检测案例

我已经为您准备了完整的学习成果检测系统，包含以下文件：

### 📁 文件结构

```
Proxy_Reflect_详解.md          # 详细理论文档（本文件）
proxy-reflect-examples.js      # 基础示例代码
proxy-reflect-tests.js         # 学习检测案例
proxy-reflect-advanced.js      # 高级应用案例
proxy-reflect-demo.html        # 交互式演示页面
run-all-examples.js           # 一键运行所有示例
```

### 🎯 检测案例概述

#### 1. 智能配置对象
**目标**: 创建一个配置对象，具有默认值、访问日志和保护机制

**技能点**:
- Proxy get/set/deleteProperty 拦截
- 默认值处理
- 访问日志记录
- 关键配置保护

#### 2. 类型安全的数组
**目标**: 创建只能存储特定类型数据的数组

**技能点**:
- 类型验证
- 自动类型转换
- 数组操作拦截
- 错误处理

#### 3. ORM 式的数据模型
**目标**: 类似数据库 ORM 的对象模型

**技能点**:
- 动态方法生成
- 字段验证和转换
- 变更追踪
- 查询方法模拟

#### 4. 智能缓存代理
**目标**: 自动缓存函数调用结果的代理

**技能点**:
- 函数调用拦截
- 缓存策略实现
- 过期时间管理
- 性能统计

### 🚀 高级应用案例

#### 1. 响应式系统（类似 Vue 3）
完整实现了依赖追踪和自动更新的响应式系统

#### 2. 类型安全的 API 客户端
动态生成 RESTful API 方法的客户端

#### 3. 数据库查询构建器
支持链式调用的 SQL 查询构建器

#### 4. 状态管理器（类似 Redux）
包含中间件支持的状态管理系统

#### 5. 插件系统
可扩展的插件架构实现

### 💡 自主练习题

完成检测案例后，尝试以下练习：

1. **属性访问计数器**: 创建一个可以记录每个属性被访问次数的代理对象

2. **链式查询构建器**: 实现支持复杂条件的查询构建器

3. **自动序列化存储**: 创建可以自动序列化/反序列化到本地存储的代理

4. **虚拟属性对象**: 实现支持计算属性的对象（属性值通过计算得出）

5. **响应式数组**: 创建可以监听变化的响应式数组

### 🎮 交互式演示

打开 `proxy-reflect-demo.html` 文件在浏览器中体验：
- 基础代理演示
- 响应式数据系统
- 智能缓存系统
- Reflect 方法对比
- 实际应用案例

### 🏃‍♂️ 快速开始

```bash
# 运行所有示例
node run-all-examples.js

# 或者单独运行
node proxy-reflect-examples.js      # 基础示例
node proxy-reflect-tests.js         # 检测案例
node proxy-reflect-advanced.js      # 高级案例
```

### ✅ 学习成果评估

如果您能够理解并实现以上所有案例，说明您已经：

- ✅ 掌握了 Proxy 的所有 handler 方法
- ✅ 理解了 Reflect 的设计理念和用法
- ✅ 能够使用 Proxy 和 Reflect 解决实际问题
- ✅ 具备了元编程的思维能力
- ✅ 可以设计和实现复杂的代理模式

恭喜您已经掌握了 JavaScript 中最强大的元编程工具！