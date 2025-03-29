const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// 要搜索和替换的文本
const search = 'http://localhost:3001/api';
const replacement = '/api';

// 获取要搜索的目录路径
const directoryPath = path.join(__dirname, 'src');

// 递归遍历目录
async function traverseDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      await traverseDirectory(fullPath);
    } else if (entry.isFile() && 
               (entry.name.endsWith('.tsx') || 
                entry.name.endsWith('.ts') || 
                entry.name.endsWith('.js') || 
                entry.name.endsWith('.jsx'))) {
      
      try {
        // 读取文件内容
        const content = await readFileAsync(fullPath, 'utf8');
        
        // 检查文件是否包含搜索文本
        if (content.includes(search)) {
          console.log(`替换文件: ${fullPath}`);
          
          // 替换文本
          const newContent = content.replace(new RegExp(search, 'g'), replacement);
          
          // 写入更新后的内容
          await writeFileAsync(fullPath, newContent, 'utf8');
          
          console.log(`已成功替换文件: ${fullPath}`);
        }
      } catch (error) {
        console.error(`处理文件 ${fullPath} 时出错:`, error);
      }
    }
  }
}

// 开始遍历
(async () => {
  try {
    console.log('开始批量替换 API URL...');
    await traverseDirectory(directoryPath);
    console.log('替换完成!');
  } catch (error) {
    console.error('发生错误:', error);
  }
})(); 