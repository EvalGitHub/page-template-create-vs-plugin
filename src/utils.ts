import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import download from 'download-git-repo';
import axios from 'axios';


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

export async function downloadGitHubDirectory(
  targetDir: string,
  callback?: any
) {
  // 固定的 GitHub API 地址（当前目录）
  const baseUrl =
    "https://api.github.com/repos/EvalGitHub/template-for-page/contents/src/page/common-list?ref=main";

  // 本地保存的目标目录
  const targetRoot = path.resolve(targetDir); // 根输出目录
  async function downloadDir(url:string, localDir:string) {
    try {
      const response = await axios.get(url);
      const items = response.data;

      if (!Array.isArray(items)) {
        console.warn(`⚠️ 跳过非目录: ${url}`);
        return;
      }

      for (const item of items) {
        const localPath = path.join(localDir, item.name);

        if (item.type === "file") {
          // 处理文件：下载并保存
          console.log(`📥 下载文件: ${item.path}`);
          const fileRes = await axios.get(item.download_url, {
            responseType: "arraybuffer",
          });
          fs.mkdirSync(path.dirname(localPath), { recursive: true }); // 确保父目录存在
          fs.writeFileSync(localPath, Buffer.from(fileRes.data));
          console.log(`✅ 已保存: ${localPath}`);
        }

        if (item.type === "dir") {
          // 处理目录：递归下载
          console.log(`📁 进入目录: ${item.path}`);
          // 递归调用，使用新的 API URL
          const subdirUrl = `https://api.github.com/repos/EvalGitHub/template-for-page/contents/${item.path}?ref=main`;
          await downloadDir(subdirUrl, localPath); // 递归
        }
      }
    } catch (err:any) {
      if (err.response?.status === 404) {
        console.error("❌ 404: 路径不存在，请检查 GitHub 路径是否正确");
      } else {
        console.error("❌ 下载失败:", err.message);
      }
      callback && callback({ msg: "创建失败！", actionFlag: "fail" });
    }
  }
  await downloadDir(baseUrl, targetRoot);
  callback && callback({msg:"创建成功！", actionFlag:'success'});
}
