# Contributing to Microfeed Publisher for Obsidian

Thank you for your interest in contributing to the Microfeed Publisher plugin! We welcome contributions from the community.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/obsidian-microfeed-plugin.git
   cd obsidian-microfeed-plugin
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development**
   ```bash
   npm run dev    # Watch mode for development
   npm run build  # Production build
   ```

## Project Structure

```
src/
├── types.ts              # TypeScript type definitions
├── contentParser.ts      # Markdown content parsing
├── imageGenerator.ts     # Magazine-style image generation
├── styleManager.ts       # Design style management (29 styles)
├── htmlTemplateGenerator.ts # HTML template generation
├── microfeedClient.ts    # Microfeed API client
└── settings.ts           # Plugin settings interface
main.ts                   # Main plugin entry point
```

## How to Contribute

### 🐛 Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/your-username/obsidian-microfeed-plugin/issues)
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Obsidian version, plugin version)
   - Console logs if relevant

### 💡 Suggesting Features

1. Check [Issues](https://github.com/your-username/obsidian-microfeed-plugin/issues) for existing feature requests
2. Create a new issue with:
   - Clear description of the proposed feature
   - Use case and benefits
   - Implementation suggestions (if any)

### 🔧 Contributing Code

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test your changes**
   - Run `npm run build` to ensure it compiles
   - Test in Obsidian with a real vault
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Create a Pull Request**

### 🎨 Adding New Design Styles

To add new magazine styles to the image generator:

1. **Add style definition** in `src/styleManager.ts`:
   ```typescript
   {
     id: 'your-style-name',
     name: 'Your Style Name',
     description: 'Description of your style',
     colors: {
       primary: '#color1',
       secondary: '#color2',
       accent: '#color3',
       background: '#color4',
       text: '#color5'
     },
     fonts: {
       title: 'font-family',
       content: 'font-family'
     }
   }
   ```

2. **Implement drawing method** in `src/imageGenerator.ts`:
   ```typescript
   private async drawYourStyleStyle(
     ctx: CanvasRenderingContext2D, 
     width: number, 
     height: number, 
     title: string, 
     content: string
   ): Promise<Blob> {
     // Your implementation here
     return this.canvasToBlob();
   }
   ```

3. **Add case** in `generateCanvasStyleImage()` method

### 🧪 Testing Guidelines

- Test with various content types (text-only, with images, with audio/video)
- Test with different Markdown syntax
- Test with YAML frontmatter variations
- Test image generation with different content lengths
- Verify QR code loading and fallback behavior

## Code Style

- Use TypeScript with proper typing
- Follow existing code patterns and naming conventions
- Add comments for complex logic
- Use async/await for asynchronous operations
- Handle errors gracefully with try-catch blocks

## Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**: 
  - What changes were made
  - Why the changes were made
  - How to test the changes
- **Testing**: Include information about testing performed
- **Breaking Changes**: Clearly mark any breaking changes
- **Dependencies**: Note any new dependencies added

## Questions?

Feel free to ask questions by creating an issue or reaching out to the maintainers.

Thank you for contributing! 🚀