import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import download from 'download-git-repo';


// 判断当前路径是文件夹还是文件
export function isDirectory(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    return stats.isDirectory();
  } catch (err) {
    console.error("无法判断文件类型:", err);
    return false;
  }
}

/**
 * 根据git仓库制定文件路径在目标文件夹下创建文件
*/
export function createFileFromGit(filePath: string, targetDir: string) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const fileName = path.basename(filePath);
    const targetFilePath = path.join(targetDir, fileName);
    fs.writeFileSync(targetFilePath, fileContent);
    console.log(`已创建文件: ${targetFilePath}`);
  } catch (err) {
    console.error("创建文件时出错:", err);
  }
}

export function openUrl(value:string) {
  const uri = vscode.Uri.parse(value);
  vscode.env.openExternal(uri);
}

export function downloadFile(url:string, targetDir:string, callback?:any) { 
  download(
    url,
    targetDir,
    { clone: false }, // 使用 HTTPS 下载，不使用 git clone
    (err:any) => {
      if (err) {
        console.error("❌ 下载失败:", err);
        vscode.window.showErrorMessage("❌ 下载失败");
      } else {
        vscode.window.showInformationMessage("✅ 下载成功");
        callback && callback();
      }
    }
  );
}