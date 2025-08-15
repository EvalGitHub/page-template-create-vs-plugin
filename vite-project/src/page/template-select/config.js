/* export const mockData = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  name: `模板${i + 1}`,
  maintainer: `维护人${(i % 10) + 1}`,
  updatedAt: `2025-08-${String((i % 28) + 1).padStart(2, "0")}`,
}));
 */

export const mockData = [
  {
    id: 1,
    name: "基础列表",
    gitUrl:
      "https://github.com/EvalGitHub/template-for-page/tree/main/src/page/common-list",
      // 这是git提供的默认资源下载链接
      //  "https://api.github.com/repos/EvalGitHub/template-for-page/contents/src/page/common-list?ref=main"
      gitDownloadUrl:
      "https://api.github.com/repos/EvalGitHub/template-for-page/contents",
    dirPath: "src/page/common-list",
    branch: 'main',
    key: "common-list",
  },
];