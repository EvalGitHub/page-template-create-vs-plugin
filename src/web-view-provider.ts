import * as vscode from "vscode";
import fs from "fs";
import { isDirectory, downloadGitHubDirectory } from "./utils";

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,
    // And restrict the webview to only loading content from our extension's `media` directory.
    // localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'src/command/project-dep/vite-project/dist')]
    localResourceRoots: [vscode.Uri.joinPath(extensionUri)],
  };
}

const DIST_DIR = "vite-project/dist";
export class WebViewProvider implements vscode.WebviewViewProvider {
  // private _webPanelView?: vscode.WebviewPanel;
  public static readonly viewType = "WebViewProvider";
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly htmlName: any,
    private _webPanelView?: vscode.WebviewPanel
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView
  ): void | Thenable<void> {
    webviewView.webview.options = getWebviewOptions(this._extensionUri);
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Use a nonce to only allow a specific script to be run.
    try {
      // data = fs.readFileSync('./vite-project/dist/index.html','utf8');
      const indexPath = vscode.Uri.joinPath(
        this._extensionUri,
        DIST_DIR,
        this.htmlName
      );
      let contentHtml = fs.readFileSync(indexPath.path, "utf-8");
      // 替换js
      contentHtml = contentHtml.replace(
        /src="\/assets\//g,
        `src="${webview.asWebviewUri(
          vscode.Uri.file(
            vscode.Uri.joinPath(this._extensionUri, `${DIST_DIR}/assets`).path
          )
        )}/`
      );
      // 替换css
      contentHtml = contentHtml.replace(
        /href="\/assets\//g,
        `href="${webview.asWebviewUri(
          vscode.Uri.file(
            vscode.Uri.joinPath(this._extensionUri, `${DIST_DIR}/assets`).path
          )
        )}/`
      );
      return contentHtml;
    } catch (err: any) {
      console.log(err);
      vscode.window.showInformationMessage(err.message);
    }
    return "";
  }

  public createPage(path: string) {
    if (!isDirectory(path)) {
      vscode.window.showInformationMessage("请选择正确的文件夹进行操作！");
      return;
    }
    this._webPanelView = vscode.window.createWebviewPanel(
      WebViewProvider.viewType,
      "创建页面by模板",
      -1,
      {
        ...getWebviewOptions(this._extensionUri),
        retainContextWhenHidden: true,
      }
    );
    this._webPanelView.webview.html = this._getHtmlForWebview(
      this._webPanelView.webview
    );
    this.handleMessage(path);
  }

  public handleMessage(message: any) {
    this._webPanelView?.webview.postMessage({
      type: "currentPath",
      data: {
        path: message,
      },
    });
    this._webPanelView?.webview.onDidReceiveMessage(async (data) => {
      const {actionName} = data;
      if(actionName === 'createPage') {
        const { installPath, pageName } = data?.value;
        const targetDir = installPath;// path.join(installPath, pageName);
        // 检查 installPath/pageName文件夹是否存在，存在则结束，提示存在同名文件夹，不存在就创建文件夹继续
        if (fs.existsSync(targetDir)) {
          vscode.window.showInformationMessage(
            `${pageName} 文件夹已存在,请更换目录或者文件名`
          );
          this._webPanelView?.webview.postMessage({
            type: "createPageFail",
          });
          return;
        } else {
          fs.mkdirSync(targetDir);
          downloadGitHubDirectory(targetDir,  data.value, (data: any) => {
            const { msg, actionFlag } = data;
            if (actionFlag === "success") {
              vscode.window.showInformationMessage(msg);
              this._webPanelView?.webview.postMessage({
                type: "createPageSuccess",
              });
            } else {
              vscode.window.showErrorMessage(msg);
              this._webPanelView?.webview.postMessage({
                type: "createPageFail",
              });
            }
          });
        }
      }
    });
  }
}
