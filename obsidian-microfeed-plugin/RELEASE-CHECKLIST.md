# Release Checklist

## Pre-Release Checklist

- [x] ✅ Clean up test files and personal data
- [x] ✅ Update README.md with English documentation  
- [x] ✅ Create README-zh.md with Chinese documentation
- [x] ✅ Update package.json with proper metadata
- [x] ✅ Update manifest.json with correct information
- [x] ✅ Create LICENSE file
- [x] ✅ Create .gitignore file
- [x] ✅ Create CONTRIBUTING.md
- [x] ✅ Remove personal information and sensitive data
- [x] ✅ Verify build process works correctly
- [x] ✅ Test all 29 magazine styles
- [x] ✅ Test QR code integration
- [x] ✅ Test content parsing and cleaning

## Before Publishing to GitHub

1. **Final Testing**
   - [ ] Test installation in fresh Obsidian vault
   - [ ] Test basic publishing functionality
   - [ ] Test image generation with various content types
   - [ ] Test media file upload
   - [ ] Test all settings options

2. **Documentation Review**
   - [ ] Ensure all URLs in README are correct
   - [ ] Update any placeholder URLs (your-username, your-domain.com)
   - [ ] Verify all examples work correctly
   - [ ] Check that screenshots are up to date (if any)

3. **Code Quality**
   - [ ] Run `npm run build` successfully
   - [ ] No TypeScript errors
   - [ ] All features working as expected
   - [ ] Proper error handling for edge cases

4. **GitHub Setup**
   - [ ] Create GitHub repository
   - [ ] Update package.json repository URLs
   - [ ] Update README.md GitHub links
   - [ ] Set up GitHub repository settings
   - [ ] Create initial release/tag

## Post-Publication

1. **Community**
   - [ ] Consider submitting to Obsidian Community Plugins
   - [ ] Create announcement post
   - [ ] Monitor for initial user feedback

2. **Maintenance**
   - [ ] Set up issue templates
   - [ ] Monitor for bug reports
   - [ ] Plan future enhancements

## Key Features to Highlight

- ✨ 29 unique magazine-style image templates
- 🎨 Automatic QR code integration
- 📝 Smart Markdown content parsing
- 🎧 Full podcast/iTunes metadata support
- 📸 Automatic image upload with presigned URLs
- 🔧 Comprehensive media format support
- 🎯 One-click publishing to Microfeed

## GitHub Repository Recommendations

- Enable Issues for bug reports and feature requests
- Set up branch protection for main branch
- Consider setting up GitHub Actions for automated testing
- Add repository topics: `obsidian`, `plugin`, `microfeed`, `publishing`, `markdown`