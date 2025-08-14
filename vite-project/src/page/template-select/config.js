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
    maintainer: "维护人1",
    updatedAt: "2025-08-01",
    gitUrl:
      "https://github.com/EvalGitHub/template-for-page/tree/main/src/page/common-list",
    key: "common-list",
  },
];