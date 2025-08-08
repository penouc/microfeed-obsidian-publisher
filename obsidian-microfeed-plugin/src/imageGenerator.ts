import { HTMLTemplateGenerator, ContentData } from './htmlTemplateGenerator';
import { requestUrl } from 'obsidian';

export class ImageGenerator {
  private qrCodeUrl: string;
  private qrCodeBase64: string | null = null;

  constructor() {
    // 使用固定的QR码图片URL
    this.qrCodeUrl = 'https://cdn.titi.li/titi-li/production/media/image-c9127e43a0a860fe555a62a8fce628ad.jpg';
    // 预加载QR码图片
    this.preloadQRCode();
  }

  private async preloadQRCode(): Promise<void> {
    try {
      console.log('🔄 Preloading QR code image via requestUrl...');
      const response = await requestUrl({
        url: this.qrCodeUrl,
        method: 'GET'
      });
      
      if (response.status >= 200 && response.status < 300) {
        // 转换为base64
        const arrayBuffer = response.arrayBuffer;
        const base64 = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))));
        this.qrCodeBase64 = `data:image/jpeg;base64,${base64}`;
        console.log('✅ QR code preloaded as base64');
      } else {
        console.warn('⚠️ Failed to preload QR code:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Error preloading QR code:', error);
    }
  }

  async generateThumbnail(title: string, content: string): Promise<Blob> {
    // 使用液态数字形态设计生成图片
    return this.generateLiquidMorphismImage(title, content);
  }

  // 生成液态数字形态设计图片
  private async generateLiquidMorphismImage(title: string, content: string): Promise<Blob> {
    console.log(`🎨 Starting liquid morphism image generation for: "${title.substring(0, 30)}..."`);
    
    // 创建HTML模板容器
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // 隐藏在屏幕外
    container.style.width = '440px';
    container.style.height = 'auto';
    container.style.visibility = 'hidden'; // 确保不可见但仍然渲染
    document.body.appendChild(container);

    try {
      // 生成液态数字形态HTML内容
      console.log(`📝 Generating HTML content...`);
      const htmlContent = this.generateLiquidMorphismHTML(title, content);
      container.innerHTML = htmlContent;
      
      console.log(`📏 Container dimensions: ${container.offsetWidth}x${container.offsetHeight}, scrollHeight: ${container.scrollHeight}`);

      // 检查容器内容是否正确渲染
      console.log(`🔍 Container HTML length: ${container.innerHTML.length}`);
      console.log(`📏 Initial container dimensions: ${container.offsetWidth}x${container.offsetHeight}, scrollHeight: ${container.scrollHeight}`);
      
      // 强制显示容器以确保渲染
      container.style.visibility = 'visible';
      container.style.position = 'fixed';
      container.style.left = '0px';
      container.style.top = '0px';
      container.style.zIndex = '-1';
      
      // 等待字体和样式加载
      console.log(`⏳ Waiting for fonts and styles...`);
      await this.waitForFontsAndStyles(container);

      // 获取实际高度
      const actualHeight = Math.max(container.scrollHeight, container.offsetHeight, 600);
      console.log(`📐 Final dimensions: ${container.offsetWidth}x${actualHeight}px`);

      // 转换为图片
      console.log(`🖼️ Starting image generation with html-to-image...`);
      
      try {
        // 动态导入 html-to-image 库
        const { toPng } = await import('html-to-image');
        
        const dataUrl = await toPng(container, {
          width: 440,
          height: actualHeight,
          pixelRatio: 2, // 降低pixelRatio以减少内存使用
          backgroundColor: 'transparent',
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });
        
        console.log(`✅ Generated dataUrl successfully, length: ${dataUrl.length}`);
        
        // 转换dataUrl为blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        console.log(`📦 Generated blob successfully, size: ${blob.size} bytes`);
        return blob;
      } catch (importError) {
        console.error(`❌ Failed to import or use html-to-image:`, importError);
        throw new Error(`html-to-image library error: ${importError.message || importError}`);
      }
    } catch (error) {
      console.error(`❌ Error in liquid morphism image generation:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate liquid morphism image: ${errorMessage || 'Unknown error'}`);
    } finally {
      // 清理DOM元素
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      console.log(`🧹 Cleaned up container element`);
    }
  }

  // 生成固定的液态数字形态HTML模板
  private generateLiquidMorphismHTML(title: string, content: string): string {
    // 清理内容，提取关键点
    const cleanContent = this.cleanContentForDisplay(content);
    const keyPoints = this.extractKeyPoints(cleanContent);
    const subtitle = this.extractSubtitle(cleanContent);

    return `
      <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .knowledge-card {
            width: 440px;
            min-height: 600px;
            position: relative;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 30px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .liquid-bg {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.6;
        }

        .blob-1 {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, #9b59b6, transparent 60%);
            top: -50px;
            left: -50px;
        }
        .blob-2 {
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, #3498db, transparent 60%);
            bottom: -50px;
            right: -50px;
        }
        .blob-3 {
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, #e74c3c, transparent 60%);
            top: 200px;
            right: -30px;
        }

        .card-content {
            position: relative;
            z-index: 2;
            padding: 40px 35px;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        
        .date {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            text-align: right;
            margin-bottom: 20px;
            letter-spacing: 1px;
            font-weight: 300;
        }
        
        .title {
            font-size: 32px;
            color: white;
            text-align: center;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
            font-size: 16px;
            text-align: center;
            margin-bottom: 30px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 400;
        }
        
        .separator {
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            margin: 30px 0;
        }

        .list-section ul {
            list-style: none;
            padding: 0;
        }

        .list-section li {
            font-size: 14px;
            color: white;
            margin-bottom: 12px;
            padding-left: 20px;
            position: relative;
            font-weight: 300;
            line-height: 1.5;
        }
        
        .list-section li::before {
            content: '•';
            position: absolute;
            left: 5px;
            top: 0;
            color: #3498db;
            font-size: 16px;
        }

        .qr-code-area {
            text-align: center;
            margin-top: 30px;
            padding-top: 25px;
        }
        
        .qr-code-area img {
            width: 80px;
            height: 80px;
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            padding: 5px;
            background: rgba(255, 255, 255, 0.95);
        }

        .editor-note {
            margin-top: 20px;
            padding-top: 15px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
            text-align: center;
            font-style: italic;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
      </style>

      <div class="knowledge-card">
          <div class="liquid-bg blob-1"></div>
          <div class="liquid-bg blob-2"></div>
          <div class="liquid-bg blob-3"></div>

          <div class="card-content">
              <div class="date">Digital Flow // ${new Date().getFullYear()}</div>
              
              <h1 class="title">${this.truncateText(title, 30)}</h1>
              ${subtitle ? `<h2 class="subtitle">${this.truncateText(subtitle, 50)}</h2>` : ''}

              <div class="separator"></div>

              <div class="list-section">
                  <ul>
                      ${keyPoints.slice(0, 4).map(point => `<li>${this.truncateText(point, 60)}</li>`).join('')}
                  </ul>
              </div>
              
              <div class="qr-code-area">
                  <img src="${this.qrCodeBase64 || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UVI8L3RleHQ+PC9zdmc+'}" alt="QR Code">
              </div>

              <div class="editor-note">
                  ${keyPoints.length > 0 ? 'Form is temporary, flow is eternal.' : 'Generated with Liquid Morphism'}
              </div>
          </div>
      </div>
    `;
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

  // 提取关键点
  private extractKeyPoints(content: string): string[] {
    // 按句子分割，保留有意义的句子作为关键点
    const sentences = content.split(/[。！？.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 8 && s.length < 100); // 过滤掉太短或太长的句子
    
    // 选择前5个作为关键点，并添加适当的标点
    return sentences.slice(0, 5).map(sentence => {
      // 如果句子没有结尾标点，添加句号
      if (!sentence.match(/[。！？.!?]$/)) {
        return sentence + '。';
      }
      return sentence;
    });
  }

  // 提取副标题
  private extractSubtitle(content: string): string {
    // 提取第一句作为副标题
    const firstSentence = content.split(/[。！？.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 5 && firstSentence.length < 50) {
      return firstSentence;
    }
    return '';
  }

  // 截断文本
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  }

  // 等待字体和样式加载
  private async waitForFontsAndStyles(container: HTMLElement): Promise<void> {
    console.log(`⏳ Starting fonts and styles loading process...`);
    
    // 等待字体加载
    if ('fonts' in document && document.fonts.ready) {
      console.log(`🔤 Waiting for fonts to load...`);
      await document.fonts.ready;
      console.log(`✅ Fonts loaded successfully`);
    }
    
    // 强制浏览器重新计算样式
    container.offsetHeight;
    
    // 等待CSS样式完全应用 
    console.log(`🎨 Waiting for styles to be applied...`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 减少等待时间
    
    // 检查内容是否正确渲染
    const titleEl = container.querySelector('.title');
    const listEl = container.querySelector('.list-section ul');
    console.log(`📝 Title element found: ${!!titleEl}, content: "${titleEl?.textContent?.substring(0, 30)}..."`);
    console.log(`📝 List element found: ${!!listEl}, items: ${listEl?.children.length || 0}`);
    
    // 检查图片是否加载完成
    const images = container.querySelectorAll('img');
    console.log(`🖼️ Found ${images.length} images to load`);
    
    if (images.length > 0) {
      const imagePromises = Array.from(images).map((img, index) => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            console.log(`✅ Image ${index + 1} already loaded`);
            resolve(true);
          } else {
            console.log(`⏳ Loading image ${index + 1}: ${img.src.substring(0, 50)}...`);
            img.onload = () => {
              console.log(`✅ Image ${index + 1} loaded successfully`);
              resolve(true);
            };
            img.onerror = () => {
              console.warn(`⚠️ Image ${index + 1} failed to load, continuing anyway`);
              resolve(true); // 即使图片加载失败也继续
            };
            // 设置超时，避免无限等待
            setTimeout(() => {
              console.warn(`⏰ Image ${index + 1} load timeout, continuing anyway`);
              resolve(true);
            }, 5000);
          }
        });
      });
      
      await Promise.all(imagePromises);
    }
    
    // 最后再次强制重新计算布局
    container.offsetHeight;
    console.log(`✅ All fonts and styles loaded, final container height: ${container.scrollHeight}px`);
  }

  // 保留原有的方法作为备用
  async generateFromElement(element: HTMLElement): Promise<Blob> {
    try {
      // 动态导入 html-to-image 库
      const { toPng } = await import('html-to-image');
      
      const dataUrl = await toPng(element, {
        width: 440,
        height: element.scrollHeight || 600,
        pixelRatio: 2,
        backgroundColor: 'transparent'
      });
      
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error('Failed to generate image from element:', error);
      throw error;
    }
  }

  // 获取可用的设计风格列表（简化版）
  getAvailableStyles(): Array<{id: string, name: string}> {
    return [
      { id: 'liquid-morphism', name: '液态数字形态' }
    ];
  }

  // 生成指定风格的图片（简化版）
  async generateWithStyle(title: string, content: string, styleId: string): Promise<Blob> {
    // 忽略styleId，始终使用液态数字形态
    return this.generateLiquidMorphismImage(title, content);
  }

  // 生成随机风格的图片（简化版）
  async generateRandomStyle(title: string, content: string): Promise<Blob> {
    // 只有一种风格，直接返回
    return this.generateLiquidMorphismImage(title, content);
  }
}