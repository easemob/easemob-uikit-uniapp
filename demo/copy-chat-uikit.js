const fs = require('fs');
const path = require('path');

// 源目录：demo同级目录的ChatUIKit
const sourceDir = path.join(__dirname, '../ChatUIKit');
// 目标目录：demo下的ChatUIKit
const targetDir = path.join(__dirname, 'ChatUIKit');

/**
 * 删除目录（递归）
 * @param {string} dirPath - 要删除的目录路径
 */
function deleteDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    // 读取目录内容
    const files = fs.readdirSync(dirPath);
    // 递归删除目录中的文件和子目录
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        deleteDir(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    // 删除空目录
    fs.rmdirSync(dirPath);
    console.log(`已删除目录：${dirPath}`);
  }
}

/**
 * 复制目录（递归）
 * @param {string} src - 源目录路径
 * @param {string} dest - 目标目录路径
 */
function copyDir(src, dest) {
  // 确保目标目录存在
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // 读取源目录内容
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // 递归复制子目录
      copyDir(srcPath, destPath);
    } else {
      // 复制文件
      fs.copyFileSync(srcPath, destPath);
      console.log(`已复制文件：${srcPath} -> ${destPath}`);
    }
  });
}

// 执行复制操作
console.log('开始复制ChatUIKit目录...');

// 先删除目标目录（全量覆盖）
deleteDir(targetDir);

// 再复制源目录到目标位置
copyDir(sourceDir, targetDir);

console.log('ChatUIKit目录复制完成！');
