// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { WebViewProvider } from './web-view-provider';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "page-create-by-template" is now active!'
  );

  function getWebViewProvider() {
    const provider = new WebViewProvider(
      context.extensionUri as vscode.Uri,
      "index.html"
    );
    return vscode.commands.registerCommand("page-create-by-template", (e) =>
      provider.createPage(e.path)
    );
  }

  context.subscriptions.push(getWebViewProvider());
}

// This method is called when your extension is deactivated
export function deactivate() {}
