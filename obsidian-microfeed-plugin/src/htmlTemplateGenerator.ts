import { DesignStyle } from './styleManager';

export interface ContentData {
  title: string;
  subtitle?: string;
  content: string;
  date?: Date;
  keyPoints?: string[];
  quote?: string;
  qrCodeUrl: string;
  editorNote?: string;
}

export class HTMLTemplateGenerator {
  generateTemplate(style: DesignStyle, content: ContentData): string {
    const currentDate = content.date || new Date();
    const formattedDate = this.formatDate(currentDate, style.id);
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    <link href="https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://lf6-cdn-tos.bytecdntp.com/cdn/expire-100-M/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        ${this.generateCSS(style)}
    </style>
</head>
<body>
    <div class="magazine-card">
        ${this.generateContent(style, content, formattedDate)}
    </div>
    ${this.generateJavaScript(style)}
</body>
</html>`;
  }

  private formatDate(date: Date, styleId: string): string {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    switch (styleId) {
      case 'elegant-vintage':
      case 'victorian':
        return date.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        });
      case 'futuristic-tech':
      case 'cyberpunk':
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
      default:
        return date.toLocaleDateString('zh-CN', options);
    }
  }

  private generateCSS(style: DesignStyle): string {
    const baseCSS = `
      :root {
        --primary: ${style.colors.primary};
        --secondary: ${style.colors.secondary};
        --accent: ${style.colors.accent};
        --background: ${style.colors.background};
        --text: ${style.colors.text};
        --heading-font: ${style.fonts.heading};
        --body-font: ${style.fonts.body};
      }
      
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 20px;
        font-family: var(--body-font);
        background: var(--background);
        color: var(--text);
      }
      
      .magazine-card {
        width: 440px;
        min-height: 600px;
        max-height: 1280px;
        margin: 0 auto;
        position: relative;
        overflow: hidden;
      }
    `;

    const styleSpecificCSS = this.getStyleSpecificCSS(style.id);
    
    return baseCSS + styleSpecificCSS;
  }

  private getStyleSpecificCSS(styleId: string): string {
    switch (styleId) {
      case 'minimalist':
        return `
          .magazine-card {
            background: white;
            padding: 60px 40px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.05);
          }
          .date { font-size: 12px; color: #999; margin-bottom: 40px; letter-spacing: 2px; }
          .title { font-size: 28px; font-weight: 700; line-height: 1.2; margin-bottom: 20px; }
          .subtitle { font-size: 14px; color: #666; margin-bottom: 30px; }
          .content { font-size: 14px; line-height: 1.6; margin-bottom: 30px; }
          .quote { border-left: 2px solid #000; padding-left: 20px; font-style: italic; margin: 30px 0; }
          .key-points { list-style: none; padding: 0; }
          .key-points li { margin-bottom: 10px; padding-left: 20px; position: relative; }
          .key-points li:before { content: "—"; position: absolute; left: 0; }
          .qr-section { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; }
          .qr-code { width: 60px; height: 60px; opacity: 0.7; }
          .editor-note { font-size: 11px; color: #999; }
        `;

      case 'bold-modern':
        return `
          .magazine-card {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 40px;
            position: relative;
            overflow: hidden;
          }
          .magazine-card::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: linear-gradient(45deg, var(--primary), var(--secondary));
            border-radius: 50%;
            transform: translate(50%, -50%);
            opacity: 0.1;
          }
          .date { 
            font-size: 14px; 
            color: var(--accent); 
            margin-bottom: 20px; 
            text-transform: uppercase; 
            letter-spacing: 3px;
            transform: rotate(-2deg);
          }
          .title { 
            font-size: 36px; 
            font-weight: 900; 
            line-height: 0.9; 
            margin-bottom: 15px;
            color: var(--primary);
            text-shadow: 2px 2px 0px var(--secondary);
            transform: skew(-5deg);
          }
          .subtitle { 
            font-size: 16px; 
            color: var(--accent); 
            margin-bottom: 25px;
            transform: rotate(1deg);
          }
          .content { 
            font-size: 14px; 
            line-height: 1.6; 
            margin-bottom: 25px;
            background: rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 10px;
          }
          .quote { 
            background: var(--primary);
            color: black;
            padding: 20px;
            margin: 25px 0;
            transform: rotate(-1deg);
            font-weight: bold;
          }
          .key-points { 
            list-style: none; 
            padding: 0; 
          }
          .key-points li { 
            margin-bottom: 12px; 
            padding: 10px 15px;
            background: rgba(255,255,255,0.1);
            border-left: 4px solid var(--secondary);
            transform: skew(2deg);
          }
          .qr-section { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-top: 30px;
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 15px;
          }
          .qr-code { width: 50px; height: 50px; filter: invert(1); }
          .editor-note { font-size: 12px; color: var(--accent); }
        `;

      case 'elegant-vintage':
        return `
          .magazine-card {
            background: #faf0e6;
            padding: 50px 45px;
            border: 3px solid #8b4513;
            position: relative;
            background-image: 
              radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(218, 165, 32, 0.1) 0%, transparent 50%);
          }
          .magazine-card::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 1px solid #daa520;
            pointer-events: none;
          }
          .magazine-card::after {
            content: '❦';
            position: absolute;
            top: 25px;
            right: 35px;
            font-size: 20px;
            color: #8b4513;
          }
          .date { 
            font-size: 13px; 
            color: #8b4513; 
            margin-bottom: 25px;
            text-align: center;
            text-transform: capitalize;
            letter-spacing: 1px;
          }
          .title { 
            font-size: 24px; 
            font-weight: 600; 
            line-height: 1.3; 
            margin-bottom: 15px;
            text-align: center;
            color: #2f1b14;
          }
          .subtitle { 
            font-size: 14px; 
            color: #8b4513; 
            margin-bottom: 25px;
            text-align: center;
            font-style: italic;
          }
          .content { 
            font-size: 13px; 
            line-height: 1.7; 
            margin-bottom: 25px;
            text-align: justify;
            text-indent: 20px;
          }
          .quote { 
            border: none;
            padding: 20px;
            margin: 25px 0;
            background: rgba(218, 165, 32, 0.1);
            font-style: italic;
            text-align: center;
            position: relative;
          }
          .quote::before { content: '"'; font-size: 30px; position: absolute; top: -5px; left: 10px; }
          .quote::after { content: '"'; font-size: 30px; position: absolute; bottom: -15px; right: 10px; }
          .key-points { 
            list-style: none; 
            padding: 0; 
          }
          .key-points li { 
            margin-bottom: 8px; 
            padding-left: 25px;
            position: relative;
            font-size: 13px;
          }
          .key-points li:before { 
            content: '•'; 
            position: absolute; 
            left: 0; 
            color: #8b4513;
            font-size: 16px;
          }
          .qr-section { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #daa520;
          }
          .qr-code { width: 45px; height: 45px; opacity: 0.8; }
          .editor-note { font-size: 11px; color: #8b4513; font-style: italic; }
        `;

      case 'futuristic-tech':
        return `
          .magazine-card {
            background: linear-gradient(135deg, #0a0a23 0%, #1a1a3a 100%);
            padding: 40px;
            border: 1px solid #00ffff;
            position: relative;
            overflow: hidden;
          }
          .magazine-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00ffff, transparent);
            animation: scan 2s linear infinite;
          }
          @keyframes scan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .date { 
            font-size: 12px; 
            color: #00ff41; 
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
          }
          .title { 
            font-size: 22px; 
            font-weight: 700; 
            line-height: 1.2; 
            margin-bottom: 15px;
            color: #00ffff;
            text-shadow: 0 0 10px #00ffff;
            font-family: 'Courier New', monospace;
          }
          .subtitle { 
            font-size: 13px; 
            color: #8a2be2; 
            margin-bottom: 25px;
            font-family: 'Courier New', monospace;
          }
          .content { 
            font-size: 12px; 
            line-height: 1.6; 
            margin-bottom: 25px;
            background: rgba(0, 255, 255, 0.05);
            padding: 15px;
            border: 1px solid rgba(0, 255, 255, 0.2);
            font-family: 'Courier New', monospace;
          }
          .quote { 
            background: rgba(138, 43, 226, 0.2);
            border-left: 3px solid #8a2be2;
            padding: 15px;
            margin: 25px 0;
            font-family: 'Courier New', monospace;
            color: #e6e6e6;
          }
          .key-points { 
            list-style: none; 
            padding: 0; 
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border: 1px solid rgba(0, 255, 65, 0.3);
          }
          .key-points li { 
            margin-bottom: 8px; 
            padding-left: 20px;
            position: relative;
            font-family: 'Courier New', monospace;
            font-size: 11px;
          }
          .key-points li:before { 
            content: '>';
            position: absolute; 
            left: 0; 
            color: #00ff41;
          }
          .qr-section { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-top: 25px;
            background: rgba(0, 0, 0, 0.5);
            padding: 12px;
            border: 1px solid #00ffff;
          }
          .qr-code { width: 40px; height: 40px; filter: invert(1) sepia(1) hue-rotate(180deg); }
          .editor-note { font-size: 10px; color: #00ff41; font-family: 'Courier New', monospace; }
        `;

      case 'scandinavian':
        return `
          .magazine-card {
            background: white;
            padding: 50px 40px;
            box-shadow: 0 4px 30px rgba(0,0,0,0.08);
            border-radius: 12px;
          }
          .date { 
            font-size: 12px; 
            color: #666; 
            margin-bottom: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 300;
          }
          .title { 
            font-size: 26px; 
            font-weight: 500; 
            line-height: 1.3; 
            margin-bottom: 15px;
            color: #2c2c2c;
          }
          .subtitle { 
            font-size: 14px; 
            color: #4a90e2; 
            margin-bottom: 30px;
            font-weight: 400;
          }
          .content { 
            font-size: 14px; 
            line-height: 1.7; 
            margin-bottom: 30px;
            color: #444;
          }
          .quote { 
            background: #f5f5f5;
            border-left: 4px solid #4a90e2;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
          }
          .key-points { 
            list-style: none; 
            padding: 0; 
            background: #fafafa;
            padding: 20px;
            border-radius: 8px;
          }
          .key-points li { 
            margin-bottom: 10px; 
            padding-left: 20px;
            position: relative;
            color: #555;
          }
          .key-points li:before { 
            content: '○';
            position: absolute; 
            left: 0; 
            color: #4a90e2;
          }
          .qr-section { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .qr-code { width: 50px; height: 50px; opacity: 0.6; border-radius: 4px; }
          .editor-note { font-size: 12px; color: #888; }
        `;

      case 'art-deco':
        return `
          .magazine-card {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 40px;
            border: 2px solid #d4af37;
            position: relative;
            overflow: hidden;
          }
          .magazine-card::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border: 1px solid #d4af37;
            pointer-events: none;
          }
          .magazine-card::after {
            content: '◆';
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 16px;
            color: #d4af37;
          }
          .date { 
            font-size: 12px; 
            color: #d4af37; 
            margin-bottom: 25px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 3px;
            font-weight: 600;
          }
          .title { 
            font-size: 28px; 
            font-weight: 700; 
            line-height: 1.2; 
            margin-bottom: 15px;
            text-align: center;
            color: #d4af37;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.7);
          }
          .subtitle { 
            font-size: 14px; 
            color: white; 
            margin-bottom: 25px;
            text-align: center;
            font-style: italic;
          }
          .content { 
            font-size: 13px; 
            line-height: 1.6; 
            margin-bottom: 25px;
            text-align: justify;
            color: #e6e6e6;
          }
          .quote { 
            background: linear-gradient(45deg, #d4af37, #f4d03f);
            color: #1a1a1a;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
            font-weight: bold;
            position: relative;
          }
          .quote::before, .quote::after {
            content: '◆';
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            color: #1a1a1a;
          }
          .quote::before { left: 10px; }
          .quote::after { right: 10px; }
          .key-points { 
            list-style: none; 
            padding: 0; 
          }
          .key-points li { 
            margin-bottom: 10px; 
            padding-left: 25px;
            position: relative;
            color: #e6e6e6;
          }
          .key-points li:before { 
            content: '▶';
            position: absolute; 
            left: 0; 
            color: #d4af37;
          }
          .qr-section { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-top: 30px;
            padding: 15px;
            border: 1px solid #d4af37;
            background: rgba(212, 175, 55, 0.1);
          }
          .qr-code { width: 45px; height: 45px; filter: brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(35deg); }
          .editor-note { font-size: 11px; color: #d4af37; }
        `;

      case 'japanese-minimalism':
        return `
          .magazine-card {
            background: #ffffff;
            padding: 60px 50px 60px 40px;
            position: relative;
            border-left: 1px solid #e8e8e8;
          }
          .magazine-card::before {
            content: '印';
            position: absolute;
            top: 30px;
            right: 30px;
            width: 20px;
            height: 20px;
            border: 1px solid #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #333;
          }
          .date { 
            writing-mode: vertical-rl;
            text-orientation: mixed;
            position: absolute;
            right: 15px;
            top: 80px;
            font-size: 11px; 
            color: #666; 
            letter-spacing: 2px;
          }
          .title { 
            font-size: 24px; 
            font-weight: 500; 
            line-height: 1.4; 
            margin-bottom: 40px;
            color: #2c2c2c;
            position: relative;
          }
          .title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 30px;
            height: 1px;
            background: #333;
          }
          .subtitle { 
            font-size: 13px; 
            color: #666; 
            margin-bottom: 40px;
            font-weight: 300;
          }
          .content { 
            font-size: 13px; 
            line-height: 1.8; 
            margin-bottom: 40px;
            color: #444;
          }
          .quote { 
            border: none;
            padding: 0;
            margin: 40px 0;
            font-style: italic;
            color: #666;
            position: relative;
            padding-left: 20px;
          }
          .quote::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 1px;
            background: #ccc;
          }
          .key-points { 
            list-style: none; 
            padding: 0; 
          }
          .key-points li { 
            margin-bottom: 12px; 
            padding: 0;
            color: #555;
            font-size: 13px;
            position: relative;
            padding-left: 15px;
          }
          .key-points li:before { 
            content: '・';
            position: absolute; 
            left: 0;
            color: #999;
          }
          .qr-section { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
          }
          .qr-code { width: 40px; height: 40px; opacity: 0.5; }
          .editor-note { font-size: 10px; color: #999; }
        `;

      // 为其他风格添加更多CSS...
      // 由于篇幅限制，这里只展示部分风格的实现

      default:
        return `
          .magazine-card {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .date { font-size: 12px; color: #666; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: 600; margin-bottom: 15px; }
          .subtitle { font-size: 14px; color: #888; margin-bottom: 20px; }
          .content { font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
          .quote { border-left: 3px solid #ddd; padding-left: 15px; margin: 20px 0; }
          .key-points { list-style-type: disc; padding-left: 20px; }
          .key-points li { margin-bottom: 8px; }
          .qr-section { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
          .qr-code { width: 50px; height: 50px; }
          .editor-note { font-size: 12px; color: #999; }
        `;
    }
  }

  private generateContent(style: DesignStyle, content: ContentData, formattedDate: string): string {
    // 提取核心要点（如果内容太长，只保留前几个要点）
    const keyPoints = content.keyPoints || this.extractKeyPoints(content.content);
    const limitedKeyPoints = keyPoints.slice(0, 4); // 限制为4个要点

    // 提取引用（如果没有专门的引用，从内容中提取）
    const quote = content.quote || this.extractQuote(content.content);

    return `
      <div class="date">${formattedDate}</div>
      
      <h1 class="title">${content.title}</h1>
      
      ${content.subtitle ? `<h2 class="subtitle">${content.subtitle}</h2>` : ''}
      
      <div class="content">${this.truncateContent(content.content, 200)}</div>
      
      ${quote ? `<blockquote class="quote">${quote}</blockquote>` : ''}
      
      ${limitedKeyPoints.length > 0 ? `
        <ul class="key-points">
          ${limitedKeyPoints.map(point => `<li>${point}</li>`).join('')}
        </ul>
      ` : ''}
      
      <div class="qr-section">
        <div class="editor-note">
          ${content.editorNote || 'Microfeed · 数字杂志'}
        </div>
        <img src="${content.qrCodeUrl}" alt="QR Code" class="qr-code" />
      </div>
    `;
  }

  private extractKeyPoints(content: string): string[] {
    // 简单的关键点提取逻辑
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 4).map(s => s.trim() + '。');
  }

  private extractQuote(content: string): string | null {
    // 提取第一个比较有意义的句子作为引用
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 20);
    return sentences.length > 0 ? sentences[0].trim() + '。' : null;
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }

  private generateJavaScript(style: DesignStyle): string {
    // 为某些风格添加动态效果
    if (style.effects.includes('liquid-gradients') || style.id === 'liquid-morphism') {
      return `
        <script>
        document.addEventListener('DOMContentLoaded', function() {
          const card = document.querySelector('.magazine-card');
          if (card) {
            card.style.background = 'linear-gradient(135deg, #8a2be2, #00bfff, #ff1493, #8a2be2)';
            card.style.backgroundSize = '200% 200%';
            card.style.animation = 'liquidFlow 6s ease-in-out infinite';
          }
          
          const style = document.createElement('style');
          style.textContent = \`
            @keyframes liquidFlow {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          \`;
          document.head.appendChild(style);
        });
        </script>
      `;
    }
    
    if (style.effects.includes('glitch-effects') || style.id === 'cyberpunk') {
      return `
        <script>
        document.addEventListener('DOMContentLoaded', function() {
          const title = document.querySelector('.title');
          if (title) {
            setInterval(() => {
              if (Math.random() < 0.1) {
                title.style.textShadow = '2px 0 #ff00ff, -2px 0 #00ffff';
                setTimeout(() => {
                  title.style.textShadow = '0 0 10px #00ffff';
                }, 100);
              }
            }, 500);
          }
        });
        </script>
      `;
    }
    
    return '<script></script>';
  }
}