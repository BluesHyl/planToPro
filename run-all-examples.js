#!/usr/bin/env node

console.log('🚀 开始运行所有 Proxy 和 Reflect 示例...\n');

const { execSync } = require('child_process');

const examples = [
  {
    name: '基础示例',
    file: 'proxy-reflect-examples.js',
    description: '演示 Proxy 和 Reflect 的基本用法'
  },
  {
    name: '学习检测案例',
    file: 'proxy-reflect-tests.js',
    description: '通过实际案例检测学习成果'
  },
  {
    name: '高级应用案例',
    file: 'proxy-reflect-advanced.js',
    description: '展示 Proxy 和 Reflect 的高级应用场景'
  }
];

examples.forEach((example, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📚 ${index + 1}. ${example.name}`);
  console.log(`📄 ${example.description}`);
  console.log(`📁 文件: ${example.file}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    execSync(`node ${example.file}`, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
  } catch (error) {
    console.error(`❌ 运行 ${example.file} 时出错:`, error.message);
  }
  
  console.log(`\n✅ ${example.name} 运行完成\n`);
});

console.log(`\n${'🎉'.repeat(20)}`);
console.log('🎉 所有示例运行完成！');
console.log('📖 请查看 Proxy_Reflect_详解.md 获取详细文档');
console.log('🌐 打开 proxy-reflect-demo.html 体验交互式演示');
console.log(`${'🎉'.repeat(20)}\n`);