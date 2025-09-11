#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 修复文件的函数
function fixFile(filePath, fixes) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    fixes.forEach(fix => {
      content = content.replace(fix.search, fix.replace);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// 定义修复规则
const fixes = [
  // 修复未使用变量，添加下划线前缀
  {
    files: ['src/components/PrefixText.vue'],
    fixes: [
      { search: /const cycle = /g, replace: 'const _cycle = ' }
    ]
  },
  {
    files: ['src/components/RecordRow.vue'],
    fixes: [
      { search: /const emit = /g, replace: 'const _emit = ' }
    ]
  },
  {
    files: ['src/components/ShortcutHelp.vue'],
    fixes: [
      { search: /const props = /g, replace: 'const _props = ' },
      { search: /const emit = /g, replace: 'const _emit = ' }
    ]
  },
  {
    files: ['src/components/SpecialEditRow.vue'],
    fixes: [
      { search: /const emit = /g, replace: 'const _emit = ' }
    ]
  },
  // 修复MainPage组件的类型错误
  {
    files: ['src/views/MainPage.enhanced.vue'],
    fixes: [
      { search: /const useDragAndDrop = /g, replace: 'const _useDragAndDrop = ' },
      { search: /const cycle = /g, replace: 'const _cycle = ' },
      { search: /let intervalId: number/g, replace: 'let intervalId: NodeJS.Timeout' }
    ]
  },
  {
    files: ['src/views/MainPage.simple.vue'],
    fixes: [
      { search: /let intervalId: number/g, replace: 'let intervalId: NodeJS.Timeout' }
    ]
  }
];

// 执行修复
fixes.forEach(({ files, fixes: fileFixes }) => {
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      fixFile(filePath, fileFixes);
    }
  });
});

console.log('🎉 TypeScript error fixes completed!');

