# Promise 和 Async/Await 深度解析

## 1. Promise 详解

### 1.1 基本概念
Promise 是 JavaScript 中处理异步操作的一种解决方案，它代表了一个异步操作的最终完成或失败。

### 1.2 三种状态
- **pending（待定）**：初始状态，既没有被兑现，也没有被拒绝
- **fulfilled（已兑现）**：操作成功完成
- **rejected（已拒绝）**：操作失败

**状态特点：**
- 状态只能从 pending 转换到 fulfilled 或 rejected
- 状态一旦改变就不可逆转（immutable）
- 状态改变时会触发相应的回调函数

### 1.3 实现原理
```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;      // 成功的值
    this.reason = undefined;     // 失败的原因
    this.onFulfilledCallbacks = []; // 成功回调队列
    this.onRejectedCallbacks = [];  // 失败回调队列

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    // 实现链式调用和值穿透
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    return new MyPromise((resolve, reject) => {
      // 处理异步情况...
    });
  }
}
```

### 1.4 核心特性
1. **链式调用**：每个 `then` 方法返回一个新的 Promise
2. **值穿透**：如果 `then` 的参数不是函数，会被忽略
3. **错误冒泡**：未处理的错误会沿着链条传递
4. **微任务**：Promise 回调在微任务队列中执行

### 1.5 常用方法
- `Promise.resolve(value)` - 创建已成功的 Promise
- `Promise.reject(reason)` - 创建已失败的 Promise
- `Promise.all(promises)` - 所有 Promise 成功才成功
- `Promise.allSettled(promises)` - 等待所有 Promise 完成
- `Promise.race(promises)` - 第一个完成的 Promise 决定结果

---

## 2. Async/Await 详解

### 2.1 基本概念
Async/Await 是基于 Promise 的语法糖，让异步代码看起来像同步代码，提供了更简洁、更直观的异步编程方式。

### 2.2 实现原理
```javascript
// async/await 本质上是 Generator + 自动执行器
function asyncToGenerator(generatorFunc) {
  return function() {
    const gen = generatorFunc.apply(this, arguments);
    return new Promise((resolve, reject) => {
      function step(key, arg) {
        try {
          const info = gen[key](arg);
          const { value, done } = info;
          if (done) {
            resolve(value);
          } else {
            Promise.resolve(value).then(
              val => step('next', val),
              err => step('throw', err)
            );
          }
        } catch (error) {
          reject(error);
        }
      }
      step('next');
    });
  };
}
```

### 2.3 核心特性
1. **async 函数**：
   - 总是返回一个 Promise
   - 内部的 return 值会成为 Promise 的 resolve 值
   - 抛出异常会成为 Promise 的 reject 值

2. **await 表达式**：
   - 只能在 async 函数内使用
   - 暂停函数执行，等待 Promise resolve
   - 如果 Promise reject，会抛出异常

### 2.4 错误处理
```javascript
// 推荐的错误处理方式
async function handleAsync() {
  try {
    const result1 = await asyncOperation1();
    const result2 = await asyncOperation2(result1);
    return result2;
  } catch (error) {
    console.error('操作失败:', error);
    throw error; // 重新抛出或处理错误
  }
}
```

---

## 3. Promise vs Async/Await 对比

### 3.1 语法对比

**Promise 写法：**
```javascript
function getUserData() {
  return fetch('/api/user')
    .then(response => response.json())
    .then(user => {
      return fetch(`/api/posts/${user.id}`);
    })
    .then(response => response.json())
    .then(posts => {
      return { user, posts };
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}
```

**Async/Await 写法：**
```javascript
async function getUserData() {
  try {
    const userResponse = await fetch('/api/user');
    const user = await userResponse.json();
    const postsResponse = await fetch(`/api/posts/${user.id}`);
    const posts = await postsResponse.json();
    return { user, posts };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### 3.2 详细对比

| 特性 | Promise | Async/Await |
|------|---------|-------------|
| **可读性** | 链式调用，嵌套较深时难读 | 类似同步代码，可读性更强 |
| **错误处理** | 通过 .catch() 或每个 .then() 的第二个参数 | 使用 try/catch，更直观 |
| **调试** | 调试困难，堆栈信息复杂 | 更容易调试，堆栈清晰 |
| **并行执行** | 天然支持 Promise.all() | 需要结合 Promise.all() |
| **浏览器支持** | ES6 (2015) | ES2017，较新 |
| **性能** | 微任务队列，性能较好 | 基于 Promise，性能相当 |

### 3.3 使用场景选择

**使用 Promise 的场景：**
- 需要复杂的并行操作控制
- 函数式编程风格
- 需要更细粒度的控制

**使用 Async/Await 的场景：**
- 顺序执行的异步操作
- 需要清晰的错误处理
- 团队更习惯同步代码风格
- 复杂的条件和循环逻辑

---

## 4. 最佳实践

### 4.1 并行 vs 串行
```javascript
// ❌ 串行执行（耗时）
async function bad() {
  const result1 = await asyncFunc1(); // 2秒
  const result2 = await asyncFunc2(); // 2秒
  return [result1, result2]; // 总共4秒
}

// ✅ 并行执行（高效）
async function good() {
  const [result1, result2] = await Promise.all([
    asyncFunc1(), // 2秒
    asyncFunc2()  // 2秒
  ]);
  return [result1, result2]; // 总共2秒
}
```

### 4.2 错误处理策略
```javascript
// ✅ 细粒度错误处理
async function robustFunction() {
  let user, posts;
  
  try {
    user = await fetchUser();
  } catch (error) {
    console.error('获取用户失败:', error);
    user = getDefaultUser();
  }
  
  try {
    posts = await fetchPosts(user.id);
  } catch (error) {
    console.error('获取文章失败:', error);
    posts = [];
  }
  
  return { user, posts };
}
```

### 4.3 避免常见陷阱
```javascript
// ❌ 忘记 await
async function wrong() {
  const result = asyncFunction(); // 返回 Promise 对象
  console.log(result); // [object Promise]
}

// ❌ 循环中的并行问题
async function wrongLoop() {
  const results = [];
  for (const item of items) {
    results.push(await processItem(item)); // 串行执行
  }
}

// ✅ 正确的并行处理
async function correctLoop() {
  const promises = items.map(item => processItem(item));
  return Promise.all(promises);
}
```

---

## 5. 面试重点

1. **事件循环与微任务队列**：理解 Promise 在事件循环中的执行时机
2. **Promise 链式调用**：掌握 .then() 返回值的处理规则
3. **错误处理机制**：Promise 的错误冒泡和 async/await 的 try/catch
4. **并发控制**：Promise.all、Promise.race、Promise.allSettled 的使用场景
5. **性能优化**：并行 vs 串行执行的选择