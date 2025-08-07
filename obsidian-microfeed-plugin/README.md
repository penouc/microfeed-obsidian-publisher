# Microfeed Publisher for Obsidian

[中文文档](README-zh.md) | English

A powerful Obsidian plugin that allows you to publish your notes directly to Microfeed platform with automatic magazine-style image generation and comprehensive media support.

## ✨ Features

### 🚀 Core Functionality
- **One-Click Publishing**: Publish notes from Obsidian directly to Microfeed
- **Smart Content Parsing**: Automatically parse media files in Markdown (audio, video, images, documents)
- **Automatic Image Generation**: Generate beautiful magazine-style thumbnails with 29 different design styles
- **Multimedia Support**: Support for audio, video, images, documents, and external links
- **QR Code Integration**: Automatically embed QR codes in generated images

### 🎨 Magazine-Style Image Generation
- **29 Design Styles**: Including minimalist, punk, cyberpunk, art deco, vintage, Japanese minimalism, and more
- **Dynamic Content**: Displays article title and content with intelligent text wrapping
- **High Quality**: Generates 1400x1400 pixel images
- **QR Code Support**: Embedded QR codes with fallback placeholders
- **Responsive Layout**: Adapts to content length with optimized typography

### 📝 Content Processing
- **Markdown to HTML**: Full Markdown syntax support
- **YAML Frontmatter**: Support for article metadata configuration
- **Media File Detection**: Automatically identify and process various media formats
- **Content Cleaning**: Smart cleanup of media links that will be used as attachments
- **Image Upload**: Automatic upload of local images using presigned URLs

### 🎧 Podcast & iTunes Support
- **iTunes Metadata**: Full support for podcast-specific metadata
- **Episode Management**: Season, episode numbers, and episode types
- **Media Duration**: Automatic audio/video duration detection
- **Content Types**: Support for full episodes, trailers, and bonus content

## 📁 Supported Media Formats

### Audio Files
- MP3, WAV, M4A, AAC, OGG, FLAC

### Video Files  
- MP4, MOV, AVI, MKV, WebM, M4V

### Image Files
- JPG, JPEG, PNG, GIF, WebP, SVG

### Document Files
- PDF, DOC, DOCX, TXT, RTF

### External Links
- Any HTTP/HTTPS URL

## 🚀 Installation

### Method 1: Manual Installation
1. Download the plugin files from the [releases page](https://github.com/your-username/obsidian-microfeed-plugin/releases)
2. Extract the files to your vault's `.obsidian/plugins/obsidian-microfeed-plugin/` directory
3. Enable the plugin in Obsidian settings

### Method 2: Developer Installation
```bash
cd your-vault/.obsidian/plugins/
git clone https://github.com/your-username/obsidian-microfeed-plugin.git
cd obsidian-microfeed-plugin
npm install
npm run build
```

## ⚙️ Configuration

1. Open Obsidian Settings
2. Find "Microfeed Publisher" in the plugin settings
3. Configure the following:
   - **API URL**: Your Microfeed instance URL (e.g., `https://your-domain.com`)
   - **API Key**: Obtain from your Microfeed admin panel at `/admin/settings/`
   - **Default Status**: published/unlisted/unpublished
   - **Auto Generate Image**: Enable/disable automatic image generation
   - **Image Template**: Choose image generation style

4. Click "Test Connection" to verify your configuration

## 📖 Usage

### Basic Publishing
1. Open any Markdown note
2. Use one of the following methods:
   - Click the upload icon in the left ribbon
   - Use Command Palette (Cmd/Ctrl + P) and search "Publish to Microfeed"
   - Use custom keyboard shortcut

### Advanced Publishing
Use "Publish to Microfeed with options" command to:
- Choose publication status
- Customize publishing options

### YAML Frontmatter Configuration
Add YAML frontmatter at the beginning of your note to control publishing parameters:

```yaml
---
title: My Podcast Episode 1
status: published
itunes:explicit: false
itunes:season: 1
itunes:episode: 1
itunes:episodeType: full
---
```

### Media File Usage
Reference media files in your Markdown:

```markdown
# My Podcast

This is the podcast content...

![Cover Image](./cover.jpg)

[Audio File](./episode.mp3)

[Video Link](https://youtube.com/watch?v=xxx)
```

The plugin will automatically:
- Use the first audio file as the main attachment
- Set images as thumbnails
- Process external links
- Upload local files to Microfeed

## 🎵 iTunes Podcast Support

Full iTunes podcast metadata support:

```yaml
---
title: Podcast Title
itunes:title: iTunes Specific Title
itunes:explicit: false
itunes:season: 1
itunes:episode: 5
itunes:episodeType: full  # full/trailer/bonus
itunes:block: false
---
```

## 🎨 Magazine Style Gallery

The plugin includes 29 unique design styles:

- **Minimalist**: Clean white background with elegant typography
- **Bold Modern**: Dark theme with vibrant accents and shadows
- **Punk**: Distressed style with random tear effects
- **Cyberpunk**: Neon grids with glowing text effects
- **Art Deco**: Golden geometric patterns with vintage flair
- **Japanese Minimalism**: Clean lines with traditional elements
- **Vintage Elegant**: Classic paper texture with decorative borders
- **Futuristic Tech**: HUD interfaces with circuit backgrounds
- And 21 more unique styles!

## 🛠️ Development

### Project Structure
```
src/
├── types.ts              # Type definitions
├── contentParser.ts      # Content parser
├── imageGenerator.ts     # Image generator with 29 styles
├── styleManager.ts       # Design style management
├── htmlTemplateGenerator.ts # HTML template generator
├── microfeedClient.ts    # API client
└── settings.ts           # Settings interface
main.ts                   # Main plugin file
```

### Development Commands
```bash
npm install        # Install dependencies
npm run dev        # Development mode
npm run build      # Build production version
```

### API Integration
The plugin uses Microfeed's official API:
- `POST /api/items/` - Create articles
- `POST /api/media_files/presigned_urls/` - Get upload URLs
- `PUT [presigned_url]` - Upload media files

## 🔧 Troubleshooting

### Common Issues

**Q: Connection test fails**
A: Check if API URL and API Key are correct, ensure network connectivity

**Q: Media file upload fails**  
A: Ensure file paths are correct and file formats are supported

**Q: Image generation fails**
A: Check if browser supports Canvas API, verify QR code URL accessibility

**Q: Content format incorrect**
A: Check Markdown syntax and ensure frontmatter format is correct

### Debugging
Enable developer tools and check console logs for detailed error information.

## 📝 Changelog

### v1.0.0
- Initial release
- 29 magazine-style image generation templates
- Automatic QR code embedding
- Complete media file processing
- iTunes podcast metadata support
- Presigned URL upload system
- Smart content parsing and cleaning

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the [Obsidian](https://obsidian.md) community
- Integrates with [Microfeed](https://github.com/microfeed) platform
- Inspired by modern magazine design principles

---

**Note**: This plugin requires a Microfeed instance to function. Visit the [Microfeed documentation](https://github.com/microfeed) to set up your own instance.