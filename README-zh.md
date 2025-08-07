# Microfeed Publisher for Obsidian

一个强大的 Obsidian 插件，可以将你的笔记直接发布到 Microfeed 平台。

## 功能特点

### 🚀 核心功能
- **一键发布**: 直接从 Obsidian 发布笔记到 Microfeed
- **智能内容解析**: 自动解析 Markdown 中的媒体文件（音频、视频、图片、文档）
- **自动图片生成**: 为没有图片的文章自动生成精美的缩略图
- **多媒体支持**: 支持音频、视频、图片、文档和外部链接

### 📝 内容处理
- **Markdown 解析**: 完整支持 Markdown 语法转 HTML
- **前言支持**: 支持 YAML 前言配置文章元数据
- **媒体文件检测**: 自动识别并处理各种格式的媒体文件
- **内容清理**: 智能清理将作为附件的媒体链接

### 🎨 图片生成
- **自动生成**: 根据文章标题和内容生成缩略图
- **多种样式**: 支持简洁和详细两种图片模板
- **高质量输出**: 生成 1400x1400 像素的高质量图片

## 支持的媒体格式

### 音频文件
- MP3, WAV, M4A, AAC, OGG, FLAC

### 视频文件  
- MP4, MOV, AVI, MKV, WebM, M4V

### 图片文件
- JPG, JPEG, PNG, GIF, WebP, SVG

### 文档文件
- PDF, DOC, DOCX, TXT, RTF

### 外部链接
- 任何 HTTP/HTTPS URL

## 安装

### 方法一：手动安装
1. 下载插件文件
2. 将文件夹复制到 `.obsidian/plugins/` 目录
3. 在 Obsidian 设置中启用插件

### 方法二：开发者安装
```bash
cd your-vault/.obsidian/plugins/
git clone [this-repository] obsidian-microfeed-plugin
cd obsidian-microfeed-plugin
npm install
npm run build
```

## 配置

1. 打开 Obsidian 设置
2. 找到 "Microfeed Publisher" 选项
3. 配置以下信息：
   - **API URL**: 你的 Microfeed 实例地址（如 `https://your-domain.com`）
   - **API Key**: 从 `/admin/settings/` 获取的 API 密钥
   - **默认发布状态**: published/unlisted/unpublished
   - **自动生成图片**: 开启/关闭自动图片生成
   - **图片模板**: 选择图片生成样式

4. 点击 "测试连接" 验证配置

## 使用方法

### 基本发布
1. 打开任意 Markdown 笔记
2. 使用以下方式之一：
   - 点击左侧工具栏的上传图标
   - 使用命令面板（Cmd/Ctrl + P）搜索 "Publish to Microfeed"
   - 使用快捷键（可自定义）

### 高级发布
使用 "Publish to Microfeed with options" 命令可以：
- 选择发布状态
- 自定义发布选项

### 前言配置
在笔记开头添加 YAML 前言来控制发布参数：

```yaml
---
title: 我的播客第一集
status: published
itunes:explicit: false
itunes:season: 1
itunes:episode: 1
itunes:episodeType: full
---
```

### 媒体文件使用
在 Markdown 中引用媒体文件：

```markdown
# 我的播客

这是播客内容...

![封面图片](./cover.jpg)

[音频文件](./episode.mp3)

[视频链接](https://youtube.com/watch?v=xxx)
```

插件会自动：
- 将第一个音频文件作为主要附件
- 将图片设置为缩略图
- 处理外部链接
- 上传本地文件到 Microfeed

## iTunes 播客支持

支持完整的 iTunes 播客元数据：

```yaml
---
title: 播客标题
itunes:title: iTunes 专用标题
itunes:explicit: false
itunes:season: 1
itunes:episode: 5
itunes:episodeType: full  # full/trailer/bonus
itunes:block: false
---
```

## 开发

### 项目结构
```
src/
├── types.ts           # 类型定义
├── contentParser.ts   # 内容解析器
├── imageGenerator.ts  # 图片生成器
├── microfeedClient.ts # API 客户端
└── settings.ts        # 设置界面
main.ts                # 主插件文件
```

### 开发命令
```bash
npm install        # 安装依赖
npm run dev        # 开发模式
npm run build      # 构建生产版本
```

### API 集成
插件使用 Microfeed 的官方 API：
- `POST /api/items/` - 创建文章
- `POST /api/media_files/presigned_urls/` - 获取上传链接
- `PUT [presigned_url]` - 上传媒体文件

## 故障排除

### 常见问题

**Q: 连接测试失败**
A: 检查 API URL 和 API Key 是否正确，确保网络连接正常

**Q: 媒体文件上传失败**  
A: 确保文件路径正确，文件格式受支持

**Q: 图片生成失败**
A: 检查浏览器是否支持 Canvas API

**Q: 内容格式不正确**
A: 检查 Markdown 语法，确保前言格式正确

### 调试
启用开发者工具查看控制台日志获取详细错误信息。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的文章发布功能
- 自动媒体文件处理
- 图片生成功能
- iTunes 播客元数据支持