# 构建和安装指南

## 开发环境搭建

### 前置要求
- Node.js (版本 16+)
- npm 或 yarn
- Obsidian (版本 0.15.0+)

### 安装依赖
```bash
cd obsidian-microfeed-plugin
npm install
```

### 开发构建
```bash
# 开发模式（热重载）
npm run dev

# 生产构建
npm run build
```

## 安装到 Obsidian

### 方法一：手动安装
1. 构建插件：`npm run build`
2. 将整个 `obsidian-microfeed-plugin` 文件夹复制到你的 vault 的 `.obsidian/plugins/` 目录
3. 在 Obsidian 设置中启用插件

### 方法二：符号链接（开发用）
```bash
# 在你的 vault 目录下
cd .obsidian/plugins/
ln -s /path/to/obsidian-microfeed-plugin/ microfeed-publisher
```

## 测试插件

### 1. 配置设置
- 打开 Obsidian 设置
- 找到 "Microfeed Publisher"
- 配置 API URL 和 API Key
- 测试连接

### 2. 测试发布
- 打开 `example-note.md` 文件
- 使用命令面板执行 "Publish to Microfeed"
- 检查是否成功发布

### 3. 功能测试清单
- [ ] 基本文章发布
- [ ] 带有前言的文章发布
- [ ] 媒体文件处理（本地文件）
- [ ] 外部链接处理
- [ ] 自动图片生成
- [ ] iTunes 元数据支持
- [ ] 发布状态选择

## 调试

### 开启开发者工具
在 Obsidian 中按 `Ctrl+Shift+I` (或 `Cmd+Opt+I` on Mac) 打开开发者工具

### 查看日志
在控制台中查看插件的日志输出，所有错误和调试信息都会显示在这里。

### 常见问题
1. **插件无法加载**: 检查 `main.js` 是否存在且构建成功
2. **API 调用失败**: 检查网络连接和 API 配置
3. **媒体上传失败**: 确保文件路径正确且文件格式支持

## 发布

### 创建发布版本
```bash
npm run build
npm run version
```

### 文件清单
发布时需要包含：
- `main.js` - 主插件文件
- `manifest.json` - 插件清单
- `styles.css` - 样式文件
- `README.md` - 说明文档

## 贡献指南

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 配置
- 添加适当的注释

### 提交流程
1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 创建 Pull Request

### 测试要求
在提交前确保：
- 所有功能正常工作
- 没有 TypeScript 错误
- 代码格式正确