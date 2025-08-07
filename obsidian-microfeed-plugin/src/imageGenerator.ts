import { DesignStyle, getRandomStyle, getStyleById } from './styleManager';
import { HTMLTemplateGenerator, ContentData } from './htmlTemplateGenerator';
import { requestUrl } from 'obsidian';

export class ImageGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private templateGenerator: HTMLTemplateGenerator;
  private qrCodeBlob: Blob | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1400;
    this.canvas.height = 1400;
    this.ctx = this.canvas.getContext('2d')!;
    this.templateGenerator = new HTMLTemplateGenerator();
    
    // 预加载QR码图片
    this.preloadQRCode();
  }

  async generateThumbnail(title: string, content: string): Promise<Blob> {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas and set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw Bento-style grid layout
    this.drawBentoGrid(ctx, width, height);

    // Add title
    await this.drawTitle(ctx, title, width, height);

    // Add content preview
    await this.drawContent(ctx, content, width, height);

    // Add decorative elements
    this.drawDecorations(ctx, width, height);

    // Convert to blob
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.9);
    });
  }

  private async drawTitle(ctx: CanvasRenderingContext2D, title: string, width: number, height: number) {
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const padding = 80;
    const contentArea = {
      x: padding + 60,
      y: padding + 60,
      width: width - (padding + 60) * 2,
      height: height * 0.65 - padding - 120
    };

    // Word wrap title
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxWidth = contentArea.width;

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Draw title lines with proper spacing
    const lineHeight = 76;
    
    lines.forEach((line, index) => {
      const y = contentArea.y + (index * lineHeight);
      ctx.fillText(line, contentArea.x, y);
    });
  }

  private async drawContent(ctx: CanvasRenderingContext2D, content: string, width: number, height: number) {
    // Extract first few lines of content for preview
    const cleanContent = content
      .replace(/[#*_`]/g, '') // Remove markdown formatting
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    const preview = cleanContent.length > 180 ? 
      cleanContent.substring(0, 180) + '...' : 
      cleanContent;

    if (!preview) return;

    const padding = 80;
    const contentArea = {
      x: padding + 60,
      y: padding + 260, // Below title
      width: width - (padding + 60) * 2,
      height: height * 0.4
    };

    ctx.fillStyle = '#64748b';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Word wrap content
    const words = preview.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxWidth = contentArea.width;

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Limit to 4 lines for cleaner look
    const displayLines = lines.slice(0, 4);
    const lineHeight = 36;

    displayLines.forEach((line, index) => {
      const y = contentArea.y + (index * lineHeight);
      ctx.fillText(line, contentArea.x, y);
    });
  }

  private drawBentoGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const padding = 80;
    const cornerRadius = 32;
    
    // Main content card (large)
    this.drawRoundedRect(
      ctx,
      padding,
      padding,
      width - padding * 2,
      height * 0.65 - padding,
      cornerRadius,
      '#f8fafc',
      '#e2e8f0'
    );
    
    // Small accent cards
    const cardWidth = (width - padding * 3) / 2 - 40;
    const cardHeight = height * 0.25;
    const cardY = height * 0.7;
    
    // Left accent card
    this.drawRoundedRect(
      ctx,
      padding,
      cardY,
      cardWidth,
      cardHeight,
      cornerRadius * 0.75,
      '#dbeafe',
      '#3b82f6'
    );
    
    // Right accent card
    this.drawRoundedRect(
      ctx,
      padding + cardWidth + 40,
      cardY,
      cardWidth,
      cardHeight,
      cornerRadius * 0.75,
      '#eff6ff',
      '#60a5fa'
    );
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillColor: string,
    strokeColor?: string
  ) {
    ctx.beginPath();
    
    // 使用兼容性更好的手动绘制圆角矩形
    if (typeof (ctx as any).roundRect === 'function') {
      // 如果支持 roundRect，则使用它
      (ctx as any).roundRect(x, y, width, height, radius);
    } else {
      // 手动绘制圆角矩形
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
    
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private drawDecorations(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const padding = 80;
    const cardWidth = (width - padding * 3) / 2 - 40;
    const cardHeight = height * 0.25;
    const cardY = height * 0.7;
    
    // Left card - Publication info
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const leftCardCenterX = padding + 40;
    const leftCardCenterY = cardY + cardHeight / 2;
    
    ctx.fillText('📝', leftCardCenterX, leftCardCenterY - 15);
    ctx.fillStyle = '#1e40af';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Microfeed', leftCardCenterX + 40, leftCardCenterY - 15);
    
    // Right card - Date indicator
    const rightCardCenterX = padding + cardWidth + 40 + 40;
    const rightCardCenterY = cardY + cardHeight / 2;
    
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('📅', rightCardCenterX, rightCardCenterY - 15);
    
    ctx.fillStyle = '#1e40af';
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const today = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    ctx.fillText(today, rightCardCenterX + 40, rightCardCenterY - 15);
    
    // Add subtle corner accent in main card
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(width - padding - 40, padding + 40, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(width - padding - 60, padding + 40, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.arc(width - padding - 80, padding + 40, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  async generateMagazineStyleImage(title: string, content: string, styleId?: string): Promise<Blob> {
    try {
      // 选择设计风格（随机或指定）
      const style = styleId ? getStyleById(styleId) || getRandomStyle() : getRandomStyle();
      
      console.log(`Generating image with style: ${style.name} (${style.id})`);
      
      // 直接使用Canvas绘制不同的杂志风格
      return this.generateCanvasStyleImage(title, content, style);
      
    } catch (error) {
      console.error('Failed to generate magazine style image:', error);
      // 回退到基础生成方法
      return this.generateThumbnail(title, content);
    }
  }

  private async generateCanvasStyleImage(title: string, content: string, style: DesignStyle): Promise<Blob> {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 根据风格ID选择不同的绘制方法
    switch (style.id) {
      case 'minimalist':
        return this.drawMinimalistStyle(ctx, width, height, title, content);
      case 'bold-modern':
        return this.drawBoldModernStyle(ctx, width, height, title, content);
      case 'elegant-vintage':
        return this.drawElegantVintageStyle(ctx, width, height, title, content);
      case 'futuristic-tech':
        return this.drawFuturisticTechStyle(ctx, width, height, title, content);
      case 'punk':
        return this.drawPunkStyle(ctx, width, height, title, content);
      case 'japanese-minimalism':
        return this.drawJapaneseMinimalismStyle(ctx, width, height, title, content);
      case 'art-deco':
        return this.drawArtDecoStyle(ctx, width, height, title, content);
      case 'cyberpunk':
        return this.drawCyberpunkStyle(ctx, width, height, title, content);
      default:
        // 为其他风格使用基础样式的变体
        return this.drawDefaultStyleVariation(ctx, width, height, title, content, style);
    }
  }

  private async waitForFontsAndStyles(container: HTMLElement): Promise<void> {
    // 等待字体加载
    if ('fonts' in document && document.fonts.ready) {
      await document.fonts.ready;
    }
    
    // 等待一小段时间确保样式完全应用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 检查图片是否加载完成
    const images = container.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(true);
        } else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true); // 即使图片加载失败也继续
          // 设置超时，避免无限等待
          setTimeout(() => resolve(true), 2000);
        }
      });
    });
    
    await Promise.all(imagePromises);
  }

  // 保留原有的方法作为备用
  async generateFromElement(element: HTMLElement): Promise<Blob> {
    // This method could be used to generate images from rendered markdown
    // Using html-to-image library (already in dependencies)
    const { toPng } = await import('html-to-image');
    
    try {
      const dataUrl = await toPng(element, {
        width: 1400,
        height: 1400,
        backgroundColor: '#1a1a1a'
      });
      
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error('Failed to generate image from element:', error);
      throw error;
    }
  }

  // 获取可用的设计风格列表
  getAvailableStyles(): DesignStyle[] {
    const { DESIGN_STYLES } = require('./styleManager');
    return DESIGN_STYLES;
  }

  // 生成指定风格的图片
  async generateWithStyle(title: string, content: string, styleId: string): Promise<Blob> {
    return this.generateMagazineStyleImage(title, content, styleId);
  }

  // 生成随机风格的图片
  async generateRandomStyle(title: string, content: string): Promise<Blob> {
    // 确保真正的随机选择
    const randomStyle = getRandomStyle();
    console.log(`🎲 Random style selected: ${randomStyle.name} (${randomStyle.id})`);
    
    // 清理内容：移除markdown语法和多余空白
    const cleanedContent = this.cleanContentForDisplay(content);
    console.log(`📝 Content length: ${cleanedContent.length} characters`);
    
    return this.generateCanvasStyleImage(title, cleanedContent, randomStyle);
  }

  // 极简主义风格
  private async drawMinimalistStyle(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, content: string): Promise<Blob> {
    // 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 极简的标题
    ctx.fillStyle = '#000000';
    ctx.font = 'normal 72px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const titleLines = this.wrapText(ctx, title, width * 0.7);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, width * 0.15, height * 0.2 + index * 70);
    });

    // 极简的内容
    ctx.fillStyle = '#666666';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
    const contentLines = this.wrapText(ctx, content.substring(0, 300), width * 0.55);
    const maxLines = Math.min(contentLines.length, 6);
    contentLines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, width * 0.15, height * 0.48 + index * 34);
    });

    // 一条简单的装饰线
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.45);
    ctx.lineTo(width * 0.25, height * 0.45);
    ctx.stroke();

    // 底部信息区域
    const bottomY = height * 0.85;
    ctx.fillStyle = '#cccccc';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Microfeed · 数字杂志', width * 0.15, bottomY);

    // 绘制二维码（调大到80px）
    await this.drawQRCode(ctx, width * 0.82, bottomY - 45, 80);

    return this.canvasToBlob();
  }

  // 大胆现代风格
  private async drawBoldModernStyle(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, content: string): Promise<Blob> {
    // 深色背景
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // 添加几何背景元素
    ctx.fillStyle = '#ff0080';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.rect(width * 0.05, height * 0.7, 200, 100);
    ctx.fill();

    // 大胆的标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 84px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 添加文字阴影效果
    ctx.shadowColor = '#ff0080';
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 0;
    
    const titleLines = this.wrapText(ctx, title, width * 0.8);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.25 + index * 80);
    });

    // 重置阴影
    ctx.shadowColor = 'transparent';

    // 现代风格的内容
    ctx.fillStyle = '#cccccc';
    ctx.font = '32px -apple-system, BlinkMacSystemFont, sans-serif';
    const contentLines = this.wrapText(ctx, content.substring(0, 280), width * 0.45);
    const maxLines = Math.min(contentLines.length, 5);
    contentLines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.52 + index * 38);
    });

    // 底部信息区域
    const bottomY = height * 0.9;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('DIGITAL MAGAZINE', width * 0.1, bottomY);

    // 绘制二维码（调大到90px）
    await this.drawQRCode(ctx, width * 0.82, bottomY - 50, 90);

    return this.canvasToBlob();
  }

  // 朋克风格
  private async drawPunkStyle(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, content: string): Promise<Blob> {
    // 随机背景色变化
    const backgrounds = ['#f5f5f5', '#fafafa', '#f8f8f8'];
    ctx.fillStyle = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    ctx.fillRect(0, 0, width, height);

    // 添加随机撕裂效果背景
    ctx.fillStyle = '#ff0000';
    const numTears = Math.floor(Math.random() * 15) + 10; // 10-25个撕裂
    for (let i = 0; i < numTears; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const w = Math.random() * 50 + 10;
      const h = Math.random() * 20 + 5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      ctx.fillRect(-w/2, -h/2, w, h);
      ctx.restore();
    }

    // 黑色边框
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // 朋克风格标题
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 68px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const titleLines = this.wrapText(ctx, title.toUpperCase(), width * 0.8);
    titleLines.forEach((line, index) => {
      // 添加随机倾斜效果
      ctx.save();
      ctx.transform(1, 0, Math.random() * 0.1 - 0.05, 1, 0, 0);
      ctx.fillText(line, width * 0.1, height * 0.2 + index * 65);
      ctx.restore();
    });

    // 胶带效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.save();
    ctx.translate(width * 0.7, height * 0.15);
    ctx.rotate(0.3);
    ctx.fillRect(-40, -10, 80, 20);
    ctx.strokeRect(-40, -10, 80, 20);
    ctx.restore();

    // 朋克风格内容
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, sans-serif';
    const contentLines = this.wrapText(ctx, content.substring(0, 250), width * 0.5);
    const maxLines = Math.min(contentLines.length, 6);
    contentLines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.52 + index * 32);
    });

    // 朋克风格底部区域
    const bottomY = height * 0.85;
    
    // 黑色底条
    ctx.fillStyle = '#000000';
    ctx.fillRect(width * 0.1, bottomY - 15, width * 0.8, 40);
    
    // 朋克风格文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('UNDERGROUND ZINE', width * 0.15, bottomY + 5);

    // 绘制二维码（调大到75px）
    await this.drawQRCode(ctx, width * 0.78, bottomY - 30, 75);

    return this.canvasToBlob();
  }

  // 赛博朋克风格
  private async drawCyberpunkStyle(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, content: string): Promise<Blob> {
    // 深色背景
    ctx.fillStyle = '#0a0a23';
    ctx.fillRect(0, 0, width, height);

    // 霓虹网格背景
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // 霓虹标题
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 68px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 霓虹发光效果
    ctx.shadowColor = '#00ffff';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 20;
    
    const titleLines = this.wrapText(ctx, title.toUpperCase(), width * 0.8);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.2 + index * 65);
    });

    // 重置发光效果
    ctx.shadowColor = 'transparent';

    // 扫描线效果
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < height; i += 4) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // 赛博朋克内容
    ctx.fillStyle = '#e6e6e6';
    ctx.font = '28px monospace';
    const contentLines = this.wrapText(ctx, content.substring(0, 240), width * 0.5);
    const maxLines = Math.min(contentLines.length, 5);
    contentLines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.52 + index * 34);
    });

    // 赛博朋克底部HUD界面
    const bottomY = height * 0.85;
    
    // HUD框架
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.1, bottomY - 20, width * 0.8, 35);
    
    // 发光效果文字
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 10;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('>>> NEURAL.LINK.ACTIVE', width * 0.15, bottomY - 2);
    
    // 重置发光
    ctx.shadowColor = 'transparent';

    // 绘制二维码（调大到70px）
    await this.drawQRCode(ctx, width * 0.78, bottomY - 32, 70);

    return this.canvasToBlob();
  }

  // 默认风格变体（用于其他风格）
  private async drawDefaultStyleVariation(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, content: string, style: DesignStyle): Promise<Blob> {
    // 使用风格的颜色配置
    ctx.fillStyle = style.colors.background;
    ctx.fillRect(0, 0, width, height);

    // 标题
    ctx.fillStyle = style.colors.primary;
    ctx.font = 'bold 62px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const titleLines = this.wrapText(ctx, title, width * 0.8);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.2 + index * 60);
    });

    // 装饰元素
    ctx.fillStyle = style.colors.accent;
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, 40, 0, Math.PI * 2);
    ctx.fill();

    // 内容
    ctx.fillStyle = style.colors.text;
    ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
    const contentLines = this.wrapText(ctx, content.substring(0, 300), width * 0.5);
    const maxLines = Math.min(contentLines.length, 6);
    contentLines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.48 + index * 34);
    });

    // 底部信息区域
    const bottomY = height * 0.9;
    ctx.fillStyle = style.colors.secondary;
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${style.name} · Microfeed`, width * 0.1, bottomY);

    // 绘制二维码（调大到80px）
    await this.drawQRCode(ctx, width * 0.82, bottomY - 45, 80);

    return this.canvasToBlob();
  }

  // 清理内容用于显示
  private cleanContentForDisplay(content: string): string {
    return content
      // 移除markdown语法
      .replace(/^#{1,6}\s+/gm, '') // 移除标题标记
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
      .replace(/`(.*?)`/g, '$1') // 移除代码标记
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文字
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
      .replace(/^[-*+]\s+/gm, '') // 移除列表标记
      .replace(/^\d+\.\s+/gm, '') // 移除数字列表标记
      .replace(/^>\s+/gm, '') // 移除引用标记
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`([^`]+)`/g, '$1') // 移除行内代码
      // 清理空白
      .replace(/\n\s*\n\s*\n/g, '\n\n') // 多个空行变成两个
      .replace(/^\s+|\s+$/g, '') // 移除首尾空白
      .replace(/\s+/g, ' ') // 多个空格变成一个
      .trim();
  }

  // 辅助方法：文本换行（改进版，支持中文和强制换行）
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    let currentLine = '';
    
    // 首先按空格分词，但同时考虑中文字符
    const segments = text.split(/(\s+)/);
    
    for (const segment of segments) {
      if (segment.trim() === '') continue; // 跳过纯空格
      
      // 检查当前行加上这个词段是否超出宽度
      const testLine = currentLine + segment;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine.trim()) {
        // 如果超出且当前行不为空，则开始新行
        lines.push(currentLine.trim());
        currentLine = segment;
        
        // 如果单个词段本身就超出宽度，需要按字符强制换行
        while (ctx.measureText(currentLine).width > maxWidth && currentLine.length > 1) {
          let breakPoint = currentLine.length - 1;
          
          // 逐字符检查，找到合适的断点
          while (breakPoint > 0 && ctx.measureText(currentLine.substring(0, breakPoint)).width > maxWidth) {
            breakPoint--;
          }
          
          if (breakPoint === 0) breakPoint = 1; // 至少保留一个字符
          
          lines.push(currentLine.substring(0, breakPoint).trim());
          currentLine = currentLine.substring(breakPoint);
        }
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine.trim()) {
      // 最后一行也需要检查是否过长
      while (ctx.measureText(currentLine).width > maxWidth && currentLine.length > 1) {
        let breakPoint = currentLine.length - 1;
        
        while (breakPoint > 0 && ctx.measureText(currentLine.substring(0, breakPoint)).width > maxWidth) {
          breakPoint--;
        }
        
        if (breakPoint === 0) breakPoint = 1;
        
        lines.push(currentLine.substring(0, breakPoint).trim());
        currentLine = currentLine.substring(breakPoint);
      }
      
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
    }
    
    return lines;
  }

  // 优雅复古风格
  private async drawElegantVintageStyle(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, content: string): Promise<Blob> {
    // 复古纸质背景
    ctx.fillStyle = '#faf0e6';
    ctx.fillRect(0, 0, width, height);

    // 装饰边框
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, width - 80, height - 80);
    
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, width - 100, height - 100);

    // 复古装饰元素
    ctx.fillStyle = '#8b4513';
    ctx.font = '32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('❦', width / 2, 120);

    // 复古标题
    ctx.fillStyle = '#2f1b14';
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const titleLines = this.wrapText(ctx, title, width * 0.6);
    titleLines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, width / 2, height * 0.18 + index * 72);
    });

    // 装饰线
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.42);
    ctx.lineTo(width * 0.8, height * 0.42);
    ctx.stroke();

    // 复古内容
    ctx.fillStyle = '#4a3728';
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    const contentLines = this.wrapText(ctx, content.substring(0, 280), width * 0.5);
    const maxLines = Math.min(contentLines.length, 5);
    contentLines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, width / 2, height * 0.48 + index * 32);
    });

    // 底部复古信息区域
    const bottomY = height * 0.85;
    
    // 复古底部装饰线
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, bottomY - 10);
    ctx.lineTo(width * 0.85, bottomY - 10);
    ctx.stroke();
    
    // 复古风格文字
    ctx.fillStyle = '#8b4513';
    ctx.font = '18px serif';
    ctx.textAlign = 'left';
    ctx.fillText('优雅复古杂志 · Microfeed', width * 0.15, bottomY + 10);

    // 绘制二维码（复古风格）
    await this.drawQRCode(ctx, width * 0.82, bottomY - 30, 75);

    return this.canvasToBlob();
  }

  // 未来科技风格
  private async drawFuturisticTechStyle(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, content: string): Promise<Blob> {
    // 深色科技背景
    ctx.fillStyle = '#0a0a23';
    ctx.fillRect(0, 0, width, height);

    // 科技电路背景
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = Math.random() * width;
      const y2 = Math.random() * height;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // HUD界面元素
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, width - 100, height - 100);
    
    // 角落装饰
    const cornerSize = 30;
    ctx.beginPath();
    ctx.moveTo(50, 50 + cornerSize);
    ctx.lineTo(50, 50);
    ctx.lineTo(50 + cornerSize, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - 50 - cornerSize, 50);
    ctx.lineTo(width - 50, 50);
    ctx.lineTo(width - 50, 50 + cornerSize);
    ctx.stroke();

    // 科技风格标题
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 50px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 发光效果
    ctx.shadowColor = '#00ffff';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 15;
    
    const titleLines = this.wrapText(ctx, title.toUpperCase(), width * 0.7);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.2 + index * 60);
    });

    // 重置发光
    ctx.shadowColor = 'transparent';

    // 随机数据流效果
    const dataColors = ['#00ff41', '#00ffff', '#ff00ff'];
    const numDots = Math.floor(Math.random() * 40) + 30; // 30-70个点
    for (let i = 0; i < numDots; i++) {
      ctx.fillStyle = dataColors[Math.floor(Math.random() * dataColors.length)];
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      ctx.fillRect(x, y, size, size);
    }

    // 科技内容
    ctx.fillStyle = '#e6e6e6';
    ctx.font = '26px monospace';
    const contentLines = this.wrapText(ctx, content.substring(0, 260), width * 0.5);
    const maxLines = Math.min(contentLines.length, 5);
    contentLines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.48 + index * 32);
    });

    // 底部科技风格HUD区域
    const bottomY = height * 0.85;
    
    // HUD框架
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.1, bottomY - 20, width * 0.8, 35);
    
    // 发光效果文字
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 10;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('>>> FUTURE.TECH.MAGAZINE', width * 0.15, bottomY - 2);
    
    // 重置发光
    ctx.shadowColor = 'transparent';

    // 绘制二维码（科技风格）
    await this.drawQRCode(ctx, width * 0.78, bottomY - 32, 70);

    return this.canvasToBlob();
  }

  // 日式极简风格
  private async drawJapaneseMinimalismStyle(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, content: string): Promise<Blob> {
    // 纯白背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 极简印章
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(width - 80, 50, 30, 30);
    ctx.fillStyle = '#333333';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('印', width - 65, 70);

    // 垂直日期（模拟）
    ctx.fillStyle = '#666666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('令和六年', width - 40, 120);

    // 日式标题
    ctx.fillStyle = '#2c2c2c';
    ctx.font = 'normal 42px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const titleLines = this.wrapText(ctx, title, width * 0.7);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.2 + index * 50);
    });

    // 极简装饰线
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.4);
    ctx.lineTo(width * 0.15, height * 0.4);
    ctx.stroke();

    // 日式内容
    ctx.fillStyle = '#444444';
    ctx.font = '20px sans-serif';
    const contentLines = this.wrapText(ctx, content.substring(0, 350), width * 0.6);
    const maxLines = Math.min(contentLines.length, 8);
    contentLines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, width * 0.1, height * 0.48 + index * 28);
    });

    // 水墨风格装饰点
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.8, 15, 0, Math.PI * 2);
    ctx.fill();

    // 底部日式信息区域
    const bottomY = height * 0.9;
    
    // 极简装饰线
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, bottomY - 10);
    ctx.lineTo(width * 0.9, bottomY - 10);
    ctx.stroke();
    
    // 日式风格文字
    ctx.fillStyle = '#666666';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('日式极简雅志 · Microfeed', width * 0.1, bottomY + 5);

    // 绘制二维码（日式风格）
    await this.drawQRCode(ctx, width * 0.82, bottomY - 30, 70);

    return this.canvasToBlob();
  }

  // 艺术装饰风格
  private async drawArtDecoStyle(ctx: CanvasRenderingContext2D, width: number, height: number, title: string, content: string): Promise<Blob> {
    // 深色背景
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Art Deco几何图案
    ctx.fillStyle = '#d4af37';
    
    // 放射状装饰
    const centerX = width / 2;
    const centerY = height * 0.15;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const x2 = centerX + Math.cos(angle) * 50;
      const y2 = centerY + Math.sin(angle) * 50;
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x2, y2);
    }
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 装饰边框
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Art Deco标题
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // 金属质感阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 0;
    
    const titleLines = this.wrapText(ctx, title.toUpperCase(), width * 0.7);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, width / 2, height * 0.25 + index * 60);
    });

    // 重置阴影
    ctx.shadowColor = 'transparent';

    // 几何装饰元素
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.5);
    ctx.lineTo(width * 0.35, height * 0.48);
    ctx.lineTo(width * 0.4, height * 0.5);
    ctx.lineTo(width * 0.35, height * 0.52);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.6, height * 0.5);
    ctx.lineTo(width * 0.65, height * 0.48);
    ctx.lineTo(width * 0.7, height * 0.5);
    ctx.lineTo(width * 0.65, height * 0.52);
    ctx.closePath();
    ctx.fill();

    // Art Deco内容
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    const contentLines = this.wrapText(ctx, content.substring(0, 250), width * 0.5);
    const maxLines = Math.min(contentLines.length, 4);
    contentLines.slice(0, maxLines).forEach((line, index) => {
      ctx.fillText(line, width / 2, height * 0.58 + index * 34);
    });

    // 底部Art Deco信息区域
    const bottomY = height * 0.88;
    
    // Art Deco装饰线
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, bottomY - 15);
    ctx.lineTo(width * 0.85, bottomY - 15);
    ctx.stroke();
    
    // Art Deco风格文字
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('艺术装饰杂志 · Microfeed', width * 0.15, bottomY + 5);

    // 绘制二维码（Art Deco风格）
    await this.drawQRCode(ctx, width * 0.82, bottomY - 35, 75);

    return this.canvasToBlob();
  }

  // 预加载QR码图片到本地
  private async preloadQRCode(): Promise<void> {
    try {
      console.log('🔄 Preloading QR code image...');
      // TODO: Replace with your own QR code image URL
      // This should point to a QR code that links to your content or website
      const qrUrl = 'https://cdn.titi.li/titi-li/production/media/image-c9127e43a0a860fe555a62a8fce628ad.jpg';
      
      // 使用 Obsidian 的 requestUrl 来获取图片
      const response = await requestUrl({
        url: qrUrl,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.status >= 200 && response.status < 300) {
        // 从 ArrayBuffer 创建 Blob
        this.qrCodeBlob = new Blob([response.arrayBuffer], { type: 'image/jpeg' });
        console.log('✅ QR code image preloaded successfully via requestUrl');
        console.log(`📊 QR code blob size: ${this.qrCodeBlob.size} bytes`);
      } else {
        console.warn('⚠️ Failed to preload QR code image:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Error preloading QR code with requestUrl:', error);
      
      // 回退到 fetch API
      try {
        console.log('🔄 Trying fallback with fetch API...');
        const response = await fetch('https://cdn.titi.li/titi-li/production/media/image-c9127e43a0a860fe555a62a8fce628ad.jpg', {
          mode: 'cors',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          this.qrCodeBlob = await response.blob();
          console.log('✅ QR code image preloaded successfully via fetch fallback');
          console.log(`📊 QR code blob size: ${this.qrCodeBlob.size} bytes`);
        } else {
          console.warn('⚠️ Fetch fallback also failed:', response.status);
        }
      } catch (fetchError) {
        console.error('❌ Both requestUrl and fetch failed for QR code:', fetchError);
      }
    }
  }

  // 从Blob创建图片对象
  private async createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to create image from blob'));
      };
      
      img.src = objectUrl;
    });
  }

  // 辅助方法：绘制二维码
  private async drawQRCode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number = 50): Promise<void> {
    console.log(`🔍 Starting QR code rendering at (${x}, ${y}) with size ${size}`);
    
    try {
      let qrImage: HTMLImageElement;
      
      // 优先使用预加载的本地图片
      if (this.qrCodeBlob && this.qrCodeBlob.size > 0) {
        console.log(`📱 Using preloaded QR code from local blob (${this.qrCodeBlob.size} bytes)`);
        qrImage = await this.createImageFromBlob(this.qrCodeBlob);
        console.log(`🖼️ QR image created: ${qrImage.width}x${qrImage.height}`);
      } else {
        // 如果预加载失败，尝试重新获取
        console.log('🔄 QR code not preloaded, attempting to fetch...');
        await this.preloadQRCode();
        
        if (this.qrCodeBlob && this.qrCodeBlob.size > 0) {
          console.log(`📱 Successfully fetched QR code (${this.qrCodeBlob.size} bytes)`);
          qrImage = await this.createImageFromBlob(this.qrCodeBlob);
          console.log(`🖼️ QR image created: ${qrImage.width}x${qrImage.height}`);
        } else {
          throw new Error('Failed to load QR code - no blob data');
        }
      }
      
      // 保存当前状态
      ctx.save();
      
      // 绘制白色背景确保二维码可见
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
      
      // 绘制二维码
      ctx.drawImage(qrImage, x, y, size, size);
      ctx.restore();
      
      console.log(`✅ QR code rendered successfully at (${x}, ${y})`);
    } catch (error) {
      console.warn('⚠️ QR码渲染失败，使用占位符:', error);
      console.log('🎨 Drawing QR code placeholder...');
      
      // 绘制更精美的占位符
      ctx.save();
      
      // 背景
      ctx.fillStyle = '#f8f8f8';
      ctx.fillRect(x, y, size, size);
      
      // 绘制边框
      ctx.strokeStyle = '#d0d0d0';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, size, size);
      
      // 绘制QR图标样式
      ctx.fillStyle = '#888888';
      const iconSize = size * 0.7;
      const iconX = x + (size - iconSize) / 2;
      const iconY = y + (size - iconSize) / 2;
      
      // 绘制简化的QR码图案
      const blockSize = iconSize / 8;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if ((i + j) % 2 === 0 || (i < 3 && j < 3) || (i > 4 && j < 3) || (i < 3 && j > 4)) {
            ctx.fillRect(iconX + i * blockSize, iconY + j * blockSize, blockSize - 1, blockSize - 1);
          }
        }
      }
      
      // 添加"QR"文字
      ctx.fillStyle = '#666666';
      ctx.font = `${Math.floor(size * 0.2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('QR', x + size/2, y + size * 0.8);
      
      ctx.restore();
      console.log(`🎨 QR placeholder rendered at (${x}, ${y})`);
    }
  }

  // 辅助方法：Canvas转Blob
  private async canvasToBlob(): Promise<Blob> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.9);
    });
  }
}