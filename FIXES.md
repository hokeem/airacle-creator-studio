# 交互审查修复记录（2026-09-24）

## 已修复
- 新达人默认资料填写 → 邮箱验证 → 工作台，示例场景与工作台数据隔离。
- 邮箱验证绑定邮箱；变更邮箱必须重新验证。社媒认证绑定平台和账号，修改账号后重新认证。
- 合作说明和未发送留言按活动/项目隔离。
- 推荐按方向、平台、地区排序及解释，去除固定百分比；截止天数实时计算，项目日期按活动生成。
- 报名快照、撤回、拒绝、协商与新版约定确认。
- 未入选/撤回/拒绝显示终止状态，不再显示交付或结算已完成。
- 交付清单逐项填写/选择文件，缺项阻止提交；审核意见关联版本，历史保留交付快照。
- 发布链接按平台检查；验收退回保留具体原因并给出修正任务。
- 结算显示验收时间、预计日期、到账时间与联系入口。
- 账户管理与提现分离；账户编辑、移除、重复检查；金额错误即时说明、收款人完整核对。
- 提现失败停止正常进度，金额返还；可直接编辑账户重试，生成新单并保留旧账户快照。
- 钱包显示处理中金额；失败流水显示净变动 0，避免误认为仍扣款。
- 通知保留历史项目事件、已读状态；提醒红点取决于未读项目动态。
- 工作台演示数据只持久化在本机浏览器；刷新恢复，导览不会回退原订单或改变原余额。

## 验证
- TypeScript 检查通过。
- `node --import tsx app/domain.test.ts`：新用户、身份变更、跨平台认证、草稿隔离、推荐变化、交付缺项、状态转换、通知、账户去重、失败退款与重试通过。
- 浏览器：从空账号完成入驻、认证、DJI 报名、协商 V2、确认、缺项拦截、完整交付、审核、错误平台链接拦截、验收退回/修正、结算与到账。
- 浏览器：独立新增账户、49 美元错误提示、300 美元提现失败、账户修改后生成 WD-0002、刷新恢复通过。
- 浏览器：未入选终止状态通过；退出导览后原余额 1500 美元、处理中 300 美元和旧流水保持不变。
- 浏览器：更改邮箱后进入新邮箱验证页，通过验证恢复原工作台。
- 手机宽 390px：页面无横向溢出，卡片与匹配原因可读；桌面首页检查通过。控制台无错误。
- 生产构建通过。

## 保留的演示边界
不发送邮件、不上传真实文件、不联系品牌、不执行真实支付。账号归属审核、内容公开性与品牌反馈仍为模拟；文件仅记录名称及逐项说明，没有真实媒体预览/断点上传服务。预计结算日期按周一至周五计算，未接入各地节假日日历。浏览器数据不跨设备同步。

## 2026-09-28 新手指导
- 进入页面、打开业务弹窗、切换项目阶段/任务页签时，自动显示该环节指导。
- 逐步说明当前任务，提供上一步、下一步、定位并高亮操作位置。
- 跳过仅影响当前页面，可重新查看；再次进入页面重新触发。
- 指导不会自动报名、修改项目阶段或提交资金操作。
- 验证：活动定位高亮 → 点击活动进入详情自动提示；跳过和重新查看入口；钱包 → 提现弹窗连续提示；类型与现有业务回归检查通过。

## 2026-09-29 聚焦式悬浮引导
- 移除页面顶部说明卡，改为贴近当前目标的悬浮说明。
- 高亮真实操作区域；四周遮罩模糊变暗，目标原控件仍可点击/输入。
- 自动滚动定位，适配窗口变化与弹窗动画；支持上一步、下一步、跳过及 Esc 关闭。
- 引导处于浏览器顶层，不被业务弹窗裁切；键盘 Tab 在目标区域与引导控件内移动。
- 检查通过：活动高亮真实点击跳转、提现弹窗中的输入、手机布局下的上/下方定位、Esc 只退出指导不关闭业务弹窗、类型检查和业务回归。

## 2026-09-29 · Continuous sandbox tutorial
- Replaced independent per-page hints with 17 sequential, action-driven steps covering profile, verification, DJI signup, cooperation tracking, confirmation, delivery, publishing, settlement and withdrawal.
- Isolated practice state from browser-persisted workspace. Completion, skip and interrupted refresh restore the original account; no mock income, accounts or submissions persist into it.
- Brand review, acceptance, payment and withdrawal completion advance automatically inside the tutorial. Guidance has only Skip; real highlighted actions progress the flow. Returning to ordinary pages does not restart hints; a header entry allows replay.
- Preserved anchored spotlight and blurred backdrop; added scrollable long forms, mobile placement, keyboard focus containment and portaled select support. Browser hash navigation is held to the active tutorial scene.
- Verified desktop full flow through USD 750 income and USD 100 withdrawal, original account restoration, mobile 390×844 profile/select/skip, type checks and domain regression suite.

## 2026-09-29 · Click-through tutorial completion
- Re-resolve spotlight targets after route/hash updates, late DOM mounting, viewport changes and delayed layout; retry scrolling instead of retaining an off-screen or missing target.
- Tutorial forms now contain profile, OTP, application note, every deliverable script, creation notes, publication URL, withdrawal amount and sample account. The sandbox-only withdrawal confirmation is prechecked.
- Highlight the actual submission buttons so every instructional step can be completed by clicking, without typing. Regular workspace input and confirmation behavior is unchanged.
- Verified target/frame bounds on campaign selection and cooperation confirmation; checked preset fields and clicked through delivery, acceptance and withdrawal without typing. Verified 390×844 withdrawal target does not overlap the coach.

## 2026-09-29 · Creator-facing page polish
- Removed next-task and workflow-promotion widgets from discovery; featured campaign now uses the full content width. Task handling remains under My collaborations.
- Rebuilt submitted-application UI with aligned status heading, response facts, application note and separated contact/withdraw actions.
- Default product view hides prototype status controls. An explicit toggle in About exposes them for product testing without mixing brand-side actions into the creator workflow.
- Standardized delivery cards, textarea sizing, attachment selector, focus states and submission footer. Attachment selection now appends filenames instead of overwriting the written script.
- Removed scattered implementation/demo copy from project confirmation, delivery, messaging and publishing. Prototype limitations remain available in the global notice and About.
- Verified discovery content, submitted state, testing toggle and desktop delivery spacing through the browser.
