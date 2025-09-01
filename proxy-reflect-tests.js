// Proxy 和 Reflect 学习成果检测案例
console.log('=== Proxy 和 Reflect 学习成果检测 ===\n');

// 检测案例 1: 创建一个智能配置对象
console.log('🧪 检测案例 1: 智能配置对象');
console.log('要求: 创建一个配置对象，具有以下特性:');
console.log('- 当访问不存在的配置项时，返回默认值');
console.log('- 记录所有的配置访问和修改');
console.log('- 阻止删除关键配置项');
console.log('');

// 参考实现
class SmartConfig {
  constructor(config = {}) {
    this.config = config;
    this.accessLog = [];
    this.criticalKeys = ['apiKey', 'dbConnection'];
    
    return new Proxy(this, {
      get(target, property) {
        if (property in target.config) {
          target.accessLog.push(`GET ${property}: ${target.config[property]}`);
          return target.config[property];
        }
        
        if (property === 'getAccessLog') {
          return () => target.accessLog;
        }
        
        if (property === 'clearLog') {
          return () => target.accessLog = [];
        }
        
        // 返回默认值
        target.accessLog.push(`GET ${property}: (default value)`);
        if (property.includes('timeout')) return 5000;
        if (property.includes('retries')) return 3;
        if (property.includes('enabled')) return false;
        return null;
      },
      
      set(target, property, value) {
        target.accessLog.push(`SET ${property}: ${value}`);
        target.config[property] = value;
        return true;
      },
      
      deleteProperty(target, property) {
        if (target.criticalKeys.includes(property)) {
          console.log(`❌ 不能删除关键配置项: ${property}`);
          return false;
        }
        target.accessLog.push(`DELETE ${property}`);
        return Reflect.deleteProperty(target.config, property);
      }
    });
  }
}

// 测试智能配置对象
const config = new SmartConfig({
  apiKey: 'secret123',
  dbConnection: 'mongodb://localhost:27017'
});

console.log('API Key:', config.apiKey);
console.log('连接超时 (默认值):', config.connectionTimeout);
console.log('重试次数 (默认值):', config.maxRetries);
config.newSetting = 'test';
delete config.newSetting; // 成功删除
// delete config.apiKey; // 阻止删除

console.log('访问日志:');
config.getAccessLog().forEach(log => console.log('  ' + log));
console.log('');

// 检测案例 2: 创建类型安全的数组
console.log('🧪 检测案例 2: 类型安全的数组');
console.log('要求: 创建一个只能存储特定类型数据的数组');
console.log('- 验证推入数组的每个元素类型');
console.log('- 提供类型转换功能');
console.log('- 阻止直接通过索引设置错误类型的值');
console.log('');

class TypedArray {
  constructor(allowedType, converter = null) {
    this.allowedType = allowedType;
    this.converter = converter;
    this.items = [];
    
    return new Proxy(this, {
      get(target, property) {
        if (property in target.items) {
          return target.items[property];
        }
        
        if (property === 'push') {
          return (...values) => {
            for (const value of values) {
              if (typeof value !== target.allowedType) {
                if (target.converter) {
                  const converted = target.converter(value);
                  if (typeof converted === target.allowedType) {
                    target.items.push(converted);
                    continue;
                  }
                }
                throw new Error(`❌ 类型错误: 期望 ${target.allowedType}, 得到 ${typeof value}`);
              }
              target.items.push(value);
            }
            return target.items.length;
          };
        }
        
        if (property === 'length') {
          return target.items.length;
        }
        
        if (property === 'toArray') {
          return () => [...target.items];
        }
        
        return Reflect.get(target, property);
      },
      
      set(target, property, value) {
        if (typeof property === 'string' && /^\d+$/.test(property)) {
          const index = parseInt(property);
          if (typeof value !== target.allowedType) {
            if (target.converter) {
              value = target.converter(value);
            } else {
              throw new Error(`❌ 类型错误: 期望 ${target.allowedType}, 得到 ${typeof value}`);
            }
          }
          target.items[index] = value;
          return true;
        }
        
        return Reflect.set(target, property, value);
      }
    });
  }
}

// 测试类型安全数组
const stringArray = new TypedArray('string', (val) => String(val));
stringArray.push('hello', 'world');
stringArray.push(123); // 自动转换为字符串
console.log('字符串数组:', stringArray.toArray());

const numberArray = new TypedArray('number', (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
});
numberArray.push(1, 2, 3);
numberArray.push('42'); // 自动转换为数字
console.log('数字数组:', numberArray.toArray());

try {
  const strictArray = new TypedArray('number'); // 没有转换器
  strictArray.push('invalid'); // 这会抛出错误
} catch (error) {
  console.log(error.message);
}
console.log('');

// 检测案例 3: 创建 ORM 式的数据模型
console.log('🧪 检测案例 3: ORM 式的数据模型');
console.log('要求: 创建一个类似 ORM 的数据模型');
console.log('- 自动处理数据库字段映射');
console.log('- 提供查询方法');
console.log('- 数据验证和类型转换');
console.log('');

class Model {
  constructor(tableName, schema) {
    this.tableName = tableName;
    this.schema = schema;
    this.data = {};
    this.changes = new Set();
    
    return new Proxy(this, {
      get(target, property) {
        // 动态查询方法
        if (typeof property === 'string' && property.startsWith('findBy')) {
          const field = property.replace('findBy', '').toLowerCase();
          return (value) => {
            console.log(`🔍 查询 ${target.tableName} where ${field} = ${value}`);
            return `Mock result for ${field} = ${value}`;
          };
        }
        
        // 数据访问
        if (property in target.data) {
          return target.data[property];
        }
        
        // 模型方法
        if (property === 'save') {
          return () => {
            if (target.changes.size > 0) {
              console.log(`💾 保存 ${target.tableName}:`, Array.from(target.changes));
              target.changes.clear();
              return true;
            }
            return false;
          };
        }
        
        if (property === 'toJSON') {
          return () => ({ ...target.data });
        }
        
        return Reflect.get(target, property);
      },
      
      set(target, property, value) {
        if (target.schema[property]) {
          const fieldConfig = target.schema[property];
          
          // 类型验证和转换
          if (fieldConfig.type === 'number' && typeof value !== 'number') {
            value = Number(value);
            if (isNaN(value)) {
              throw new Error(`❌ ${property} 必须是数字`);
            }
          }
          
          if (fieldConfig.type === 'string' && typeof value !== 'string') {
            value = String(value);
          }
          
          if (fieldConfig.required && (value === null || value === undefined)) {
            throw new Error(`❌ ${property} 是必填字段`);
          }
          
          if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
            throw new Error(`❌ ${property} 长度不能少于 ${fieldConfig.minLength}`);
          }
          
          target.data[property] = value;
          target.changes.add(property);
          console.log(`✏️ 字段 ${property} 已修改: ${value}`);
          return true;
        }
        
        return Reflect.set(target, property, value);
      }
    });
  }
}

// 测试 ORM 模型
const userSchema = {
  id: { type: 'number', required: true },
  name: { type: 'string', required: true, minLength: 2 },
  email: { type: 'string', required: true },
  age: { type: 'number' }
};

const user = new Model('users', userSchema);
user.id = 1;
user.name = '张三';
user.email = 'zhangsan@example.com';
user.age = '25'; // 自动转换为数字

console.log('用户数据:', user.toJSON());
console.log(user.findByName('张三'));
console.log(user.findByEmail('zhangsan@example.com'));
user.save();
console.log('');

// 检测案例 4: 创建缓存代理
console.log('🧪 检测案例 4: 智能缓存代理');
console.log('要求: 创建一个智能缓存系统');
console.log('- 自动缓存函数调用结果');
console.log('- 支持过期时间');
console.log('- 提供缓存统计信息');
console.log('');

class CacheProxy {
  constructor(target, options = {}) {
    this.target = target;
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, total: 0 };
    this.ttl = options.ttl || 5000; // 默认 5 秒过期
    
    const self = this;
    return new Proxy(target, {
      apply(target, thisArg, argumentsList) {
        const key = JSON.stringify(argumentsList);
        const now = Date.now();
        
        // 检查缓存
        if (self.cache.has(key)) {
          const cached = self.cache.get(key);
          if (now - cached.timestamp < self.ttl) {
            self.stats.hits++;
            self.stats.total++;
            console.log(`🎯 缓存命中: ${key}`);
            return cached.value;
          } else {
            self.cache.delete(key);
          }
        }
        
        // 缓存未命中，执行函数
        self.stats.misses++;
        self.stats.total++;
        console.log(`💫 缓存未命中，执行函数: ${key}`);
        
        const result = Reflect.apply(target, thisArg, argumentsList);
        
        // 存储到缓存
        self.cache.set(key, {
          value: result,
          timestamp: now
        });
        
        return result;
      },
      
      get(target, property) {
        if (property === 'getCacheStats') {
          return () => ({
            ...self.stats,
            hitRate: self.stats.total > 0 ? (self.stats.hits / self.stats.total * 100).toFixed(2) + '%' : '0%',
            cacheSize: self.cache.size
          });
        }
        
        if (property === 'clearCache') {
          return () => {
            self.cache.clear();
            self.stats = { hits: 0, misses: 0, total: 0 };
            console.log('🧹 缓存已清空');
          };
        }
        
        return Reflect.get(target, property);
      }
    });
  }
}

// 模拟耗时函数
function expensiveCalculation(n) {
  // 模拟计算延迟
  const start = Date.now();
  while (Date.now() - start < 100) {} // 阻塞 100ms
  return n * n;
}

const cachedCalc = new CacheProxy(expensiveCalculation, { ttl: 3000 });

// 测试缓存
console.log('第一次调用 cachedCalc(5):', cachedCalc(5));
console.log('第二次调用 cachedCalc(5):', cachedCalc(5)); // 缓存命中
console.log('调用 cachedCalc(3):', cachedCalc(3));
console.log('再次调用 cachedCalc(3):', cachedCalc(3)); // 缓存命中

console.log('缓存统计:', cachedCalc.getCacheStats());
console.log('');

// 自主练习题
console.log('🎯 自主练习题:');
console.log('1. 创建一个可以记录属性访问次数的代理对象');
console.log('2. 实现一个支持链式调用的 QueryBuilder（使用 Proxy）');
console.log('3. 创建一个可以自动序列化/反序列化的存储代理');
console.log('4. 实现一个支持虚拟属性的对象（属性不实际存储，而是通过计算得出）');
console.log('5. 创建一个可以监听数组变化的响应式数组');

console.log('\n=== 检测完成 ===');
console.log('如果你能理解并实现以上案例，说明你已经掌握了 Proxy 和 Reflect 的核心概念！');