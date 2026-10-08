# Airacle Creator Studio

达人营销平台的创作者端与后台管理前端 Demo。包含活动发现、报名、合作管理、内容交付、发布验收、钱包与提现，以及可完整体验的 17 步新手引导。

## 本地运行

需要 Node.js >= 22.13.0。

```bash
npm ci
npm run dev
```

达人端：http://localhost:5173 （默认进入新手教程）。

后台管理：http://localhost:5173/admin 。

```bash
npm run build
npm run start
```

## 主要源码

- `app/page.tsx`：页面与交互流程
- `app/guided-help.tsx`：悬浮高亮新手引导
- `app/data.ts`：活动示例、状态流转与数据模型
- `app/globals.css`：页面样式与响应式布局
- `components/ui/`：UI 组件
- `app/domain.test.ts`：领域逻辑测试

## 后台管理

- 活动管理：封面卡片、新建和编辑活动、上架与下架、封面图片选择与预览。
- 合作审核：报名审批、内容审核、退回修改、发布验收。
- 创作者反馈：项目留言回复与处理状态。
- 结算管理：合作报酬确认、提现结果记录。
- 待办助手：右上角查看实时待办，每天首次打开后台显示简报。

活动目录和普通达人工作台在同一浏览器内联动；教程数据保持隔离。后台是公开交互演示，尚无真实身份鉴权、共享数据库、AI 服务或支付。封面图片在浏览器内处理与保存，不上传服务器。

主要文件：`app/admin/page.tsx`、`app/admin/admin.css`、`app/admin/task-brief.tsx`、`app/admin/campaign-cover.tsx`、`app/admin-model.ts`。示例图片位于 `public/covers/`，来源见 `SOURCES.txt`。

## 检查

```bash
npx tsc --noEmit --incremental false
node --import tsx app/domain.test.ts
node --import tsx app/admin-model.test.ts
npm run build
```

## 技术栈

React 19、TypeScript、Vinext/Vite、Tailwind CSS、Radix UI。

## 演示说明

这是前端交互原型，不是已接入真实交易的业务系统。普通工作台的数据保存在当前浏览器；新手教程使用隔离的练习数据。邮件、品牌沟通、文件上传与资金转账均未接入真实服务。品牌、金额及合作订单仅供演示，品牌图片不代表商业合作授权。

原站点：https://airacle-creator-studio.aitist-dev.chatgpt.site/

本仓库发布当前源码快照，不包含原站点的部署标识、凭据、浏览器数据或历史构建产物。第三方组件的许可文件保留在源码中。
