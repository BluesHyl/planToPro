// Proxy 和 Reflect 高级应用案例
console.log('=== Proxy 和 Reflect 高级应用案例 ===\n');

// 高级案例 1: 实现一个完整的响应式系统（类似 Vue 3）
console.log('🚀 高级案例 1: 响应式系统');

class ReactiveSystem {
  constructor() {
    this.activeEffect = null;
    this.targetMap = new WeakMap();
  }
  
  effect(fn) {
    const effectFn = () => {
      this.activeEffect = effectFn;
      fn();
      this.activeEffect = null;
    };
    effectFn();
  }
  
  track(target, key) {
    if (!this.activeEffect) return;
    
    let depsMap = this.targetMap.get(target);
    if (!depsMap) {
      this.targetMap.set(target, (depsMap = new Map()));
    }
    
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    
    dep.add(this.activeEffect);
  }
  
  trigger(target, key) {
    const depsMap = this.targetMap.get(target);
    if (!depsMap) return;
    
    const dep = depsMap.get(key);
    if (dep) {
      dep.forEach(effect => effect());
    }
  }
  
  reactive(target) {
    return new Proxy(target, {
      get: (target, key, receiver) => {
        const result = Reflect.get(target, key, receiver);
        this.track(target, key);
        
        // 如果值是对象，递归代理
        if (typeof result === 'object' && result !== null) {
          return this.reactive(result);
        }
        
        return result;
      },
      
      set: (target, key, value, receiver) => {
        const result = Reflect.set(target, key, value, receiver);
        this.trigger(target, key);
        return result;
      }
    });
  }
}

// 测试响应式系统
const reactiveSystem = new ReactiveSystem();
const state = reactiveSystem.reactive({
  count: 0,
  user: {
    name: '张三',
    age: 25
  }
});

// 创建副作用
reactiveSystem.effect(() => {
  console.log(`📊 count 的值是: ${state.count}`);
});

reactiveSystem.effect(() => {
  console.log(`👤 用户: ${state.user.name}, 年龄: ${state.user.age}`);
});

// 修改数据，自动触发副作用
state.count = 1;
state.count = 2;
state.user.name = '李四';
state.user.age = 30;
console.log('');

// 高级案例 2: 实现类型安全的 API 客户端
console.log('🚀 高级案例 2: 类型安全的 API 客户端');

class APIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.options = options;
    this.interceptors = {
      request: [],
      response: []
    };
    
    return new Proxy(this, {
      get(target, property) {
        // 已有方法直接返回
        if (property in target) {
          return Reflect.get(target, property);
        }
        
        // 动态生成 HTTP 方法
        if (typeof property === 'string') {
          const match = property.match(/^(get|post|put|delete|patch)(.+)$/);
          if (match) {
            const [, method, resource] = match;
            const endpoint = resource.toLowerCase().replace(/([A-Z])/g, '-$1');
            
            return target.createMethod(method.toUpperCase(), endpoint);
          }
        }
        
        return undefined;
      }
    });
  }
  
  createMethod(method, endpoint) {
    return async (data = {}, config = {}) => {
      const url = `${this.baseURL}${endpoint}`;
      const requestConfig = {
        method,
        url,
        ...this.options,
        ...config
      };
      
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        requestConfig.data = data;
      } else {
        requestConfig.params = data;
      }
      
      console.log(`🌐 ${method} ${url}`, data);
      
      // 模拟请求
      return {
        status: 200,
        data: { success: true, method, endpoint, data },
        headers: { 'content-type': 'application/json' }
      };
    };
  }
  
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }
  
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }
}

// 测试 API 客户端
const api = new APIClient('https://api.example.com/');

// 动态方法调用
api.getUsers({ page: 1, limit: 10 });
api.postUser({ name: '张三', email: 'zhangsan@example.com' });
api.putUserProfile({ userId: 1, name: '李四' });
api.deleteUserAccount({ userId: 1 });
console.log('');

// 高级案例 3: 实现数据库查询构建器
console.log('🚀 高级案例 3: 数据库查询构建器');

class QueryBuilder {
  constructor(table) {
    this.query = {
      table,
      select: ['*'],
      where: [],
      joins: [],
      orderBy: [],
      groupBy: [],
      limit: null,
      offset: null
    };
    
    return new Proxy(this, {
      get(target, property) {
        if (property in target) {
          return Reflect.get(target, property);
        }
        
        // 动态 where 条件
        if (typeof property === 'string' && property.startsWith('where')) {
          const field = property.replace('where', '').replace(/([A-Z])/g, '_$1').toLowerCase();
          const cleanField = field.startsWith('_') ? field.slice(1) : field;
          
          return (value, operator = '=') => {
            target.query.where.push({ field: cleanField, operator, value });
            return target;
          };
        }
        
        // 动态 order by
        if (typeof property === 'string' && property.startsWith('orderBy')) {
          const field = property.replace('orderBy', '').replace(/([A-Z])/g, '_$1').toLowerCase();
          const cleanField = field.startsWith('_') ? field.slice(1) : field;
          
          return (direction = 'ASC') => {
            target.query.orderBy.push({ field: cleanField, direction });
            return target;
          };
        }
        
        return undefined;
      }
    });
  }
  
  select(...fields) {
    this.query.select = fields;
    return this;
  }
  
  where(field, operator, value) {
    if (arguments.length === 2) {
      value = operator;
      operator = '=';
    }
    this.query.where.push({ field, operator, value });
    return this;
  }
  
  join(table, on) {
    this.query.joins.push({ type: 'INNER', table, on });
    return this;
  }
  
  leftJoin(table, on) {
    this.query.joins.push({ type: 'LEFT', table, on });
    return this;
  }
  
  orderBy(field, direction = 'ASC') {
    this.query.orderBy.push({ field, direction });
    return this;
  }
  
  groupBy(...fields) {
    this.query.groupBy = fields;
    return this;
  }
  
  limit(count, offset = 0) {
    this.query.limit = count;
    this.query.offset = offset;
    return this;
  }
  
  build() {
    let sql = `SELECT ${this.query.select.join(', ')} FROM ${this.query.table}`;
    
    if (this.query.joins.length > 0) {
      this.query.joins.forEach(join => {
        sql += ` ${join.type} JOIN ${join.table} ON ${join.on}`;
      });
    }
    
    if (this.query.where.length > 0) {
      const conditions = this.query.where.map(w => `${w.field} ${w.operator} '${w.value}'`);
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    if (this.query.groupBy.length > 0) {
      sql += ` GROUP BY ${this.query.groupBy.join(', ')}`;
    }
    
    if (this.query.orderBy.length > 0) {
      const orders = this.query.orderBy.map(o => `${o.field} ${o.direction}`);
      sql += ` ORDER BY ${orders.join(', ')}`;
    }
    
    if (this.query.limit) {
      sql += ` LIMIT ${this.query.limit}`;
      if (this.query.offset) {
        sql += ` OFFSET ${this.query.offset}`;
      }
    }
    
    return sql;
  }
  
  async execute() {
    const sql = this.build();
    console.log('🗄️ 执行 SQL:', sql);
    
    // 模拟数据库查询
    return {
      sql,
      rows: [
        { id: 1, name: '张三', age: 25 },
        { id: 2, name: '李四', age: 30 }
      ],
      count: 2
    };
  }
}

// 测试查询构建器
const query = new QueryBuilder('users')
  .select('id', 'name', 'age')
  .where('age', '>=', 25)
  .where('name', 'LIKE', '张%')
  .orderBy('age', 'DESC')
  .orderBy('name', 'ASC')
  .limit(10);

console.log('构建的查询:', query.build());
query.execute();
console.log('');

// 高级案例 4: 实现状态管理器（类似 Redux）
console.log('🚀 高级案例 4: 状态管理器');

class StateManager {
  constructor(initialState = {}, middlewares = []) {
    this.state = initialState;
    this.listeners = [];
    this.middlewares = middlewares;
    this.isDispatching = false;
    
    return new Proxy(this, {
      get(target, property) {
        if (property === 'state') {
          // 返回只读状态
          return target.createReadOnlyProxy(target.state);
        }
        
        if (property in target) {
          return Reflect.get(target, property);
        }
        
        // 动态 action creator
        if (typeof property === 'string' && property.endsWith('Action')) {
          const actionType = property.replace('Action', '').toUpperCase();
          return (payload) => ({ type: actionType, payload });
        }
        
        return undefined;
      }
    });
  }
  
  createReadOnlyProxy(obj) {
    const self = this;
    return new Proxy(obj, {
      set() {
        throw new Error('❌ 状态是只读的，请使用 dispatch 来修改状态');
      },
      
      deleteProperty() {
        throw new Error('❌ 状态是只读的，请使用 dispatch 来修改状态');
      },
      
      get(target, property) {
        const value = Reflect.get(target, property);
        if (typeof value === 'object' && value !== null) {
          return self.createReadOnlyProxy(value);
        }
        return value;
      }
    });
  }
  
  reducer(state, action) {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: (state.count || 0) + 1 };
      case 'DECREMENT':
        return { ...state, count: (state.count || 0) - 1 };
      case 'SET_USER':
        return { ...state, user: action.payload };
      case 'UPDATE_USER':
        return { ...state, user: { ...state.user, ...action.payload } };
      default:
        return state;
    }
  }
  
  dispatch(action) {
    if (this.isDispatching) {
      throw new Error('❌ 不能在 reducer 执行期间分发 action');
    }
    
    console.log('📤 分发 action:', action);
    
    this.isDispatching = true;
    
    try {
      // 应用中间件
      let dispatch = (action) => {
        this.state = this.reducer(this.state, action);
      };
      
      this.middlewares.forEach(middleware => {
        dispatch = middleware(this)(dispatch);
      });
      
      dispatch(action);
      
      // 通知监听器
      this.listeners.forEach(listener => listener(this.state));
      
    } finally {
      this.isDispatching = false;
    }
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// 中间件示例
const logger = (store) => (next) => (action) => {
  console.log('🕐 执行前状态:', store.state);
  const result = next(action);
  console.log('🕑 执行后状态:', store.state);
  return result;
};

const thunk = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch.bind(store), () => store.state);
  }
  return next(action);
};

// 测试状态管理器
const store = new StateManager({ count: 0 }, [logger, thunk]);

// 订阅状态变化
const unsubscribe = store.subscribe((state) => {
  console.log('📢 状态变化通知:', state);
});

// 使用动态 action creator
store.dispatch(store.incrementAction());
store.dispatch(store.setUserAction({ name: '张三', age: 25 }));
store.dispatch(store.updateUserAction({ age: 26 }));

// 尝试直接修改状态（会抛出错误）
try {
  store.state.count = 100;
} catch (error) {
  console.log(error.message);
}

console.log('最终状态:', store.state);
console.log('');

// 高级案例 5: 实现插件系统
console.log('🚀 高级案例 5: 插件系统');

class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.context = {};
    
    return new Proxy(this, {
      get(target, property) {
        if (property in target) {
          return Reflect.get(target, property);
        }
        
        // 动态插件访问
        if (target.plugins.has(property)) {
          return target.plugins.get(property);
        }
        
        // 动态 hook 调用
        if (typeof property === 'string' && property.startsWith('call')) {
          const hookName = property.replace('call', '').toLowerCase();
          return (...args) => target.callHook(hookName, ...args);
        }
        
        return undefined;
      }
    });
  }
  
  use(plugin) {
    if (typeof plugin === 'function') {
      plugin(this);
    } else if (plugin.install) {
      plugin.install(this);
    }
    return this;
  }
  
  registerPlugin(name, plugin) {
    this.plugins.set(name, plugin);
    console.log(`🔌 插件 ${name} 已注册`);
  }
  
  addHook(name, callback) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    this.hooks.get(name).push(callback);
    console.log(`🪝 Hook ${name} 已添加`);
  }
  
  callHook(name, ...args) {
    if (this.hooks.has(name)) {
      console.log(`📞 调用 hook: ${name}`);
      const results = [];
      this.hooks.get(name).forEach(hook => {
        results.push(hook(...args));
      });
      return results;
    }
    return [];
  }
  
  setContext(key, value) {
    this.context[key] = value;
  }
  
  getContext(key) {
    return this.context[key];
  }
}

// 定义插件
const loggerPlugin = {
  install(app) {
    app.registerPlugin('logger', {
      log: (message) => console.log(`📝 [Logger]: ${message}`),
      error: (message) => console.log(`❌ [Logger]: ${message}`)
    });
    
    app.addHook('beforeaction', (action) => {
      console.log(`🔍 [Logger] 准备执行: ${action}`);
    });
  }
};

const cachePlugin = {
  install(app) {
    const cache = new Map();
    
    app.registerPlugin('cache', {
      get: (key) => cache.get(key),
      set: (key, value) => cache.set(key, value),
      clear: () => cache.clear(),
      size: () => cache.size
    });
    
    app.addHook('cachecheck', (key) => {
      return cache.has(key) ? cache.get(key) : null;
    });
  }
};

// 测试插件系统
const app = new PluginSystem();

app.use(loggerPlugin)
   .use(cachePlugin);

// 使用插件
app.logger.log('应用启动');
app.cache.set('user', { name: '张三' });

// 调用 hooks
app.callBeforeaction('login');
const cached = app.callCachecheck('user');
console.log('缓存结果:', cached);

console.log('缓存大小:', app.cache.size());
console.log('');

console.log('=== 高级案例完成 ===');
console.log('这些案例展示了 Proxy 和 Reflect 在实际开发中的强大应用！');