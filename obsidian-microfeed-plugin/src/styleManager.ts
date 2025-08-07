export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  effects: string[];
}

export const DESIGN_STYLES: DesignStyle[] = [
  {
    id: "minimalist",
    name: "极简主义风格",
    description: "采用极简主义风格设计，遵循'少即是多'的理念",
    colors: {
      primary: "#000000",
      secondary: "#666666",
      accent: "#f8f9fa",
      background: "#ffffff",
      text: "#333333"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["subtle-shadow", "clean-lines", "negative-space"]
  },
  {
    id: "bold-modern",
    name: "大胆现代风格",
    description: "采用大胆现代风格设计，打破传统排版规则，创造强烈视觉冲击",
    colors: {
      primary: "#ff0080",
      secondary: "#00ffff",
      accent: "#ffff00",
      background: "#1a1a1a",
      text: "#ffffff"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["neon-glow", "asymmetric", "bold-contrast"]
  },
  {
    id: "elegant-vintage",
    name: "优雅复古风格",
    description: "重现20世纪初期印刷品的精致美学",
    colors: {
      primary: "#8b4513",
      secondary: "#daa520",
      accent: "#f5f5dc",
      background: "#faf0e6",
      text: "#2f1b14"
    },
    fonts: {
      heading: "'Noto Serif SC', serif",
      body: "'Noto Serif SC', serif"
    },
    effects: ["ornamental-borders", "vintage-texture", "aged-paper"]
  },
  {
    id: "futuristic-tech",
    name: "未来科技风格",
    description: "呈现高度发达的数字界面美学",
    colors: {
      primary: "#00ffff",
      secondary: "#8a2be2",
      accent: "#00ff41",
      background: "#0a0a23",
      text: "#e6e6e6"
    },
    fonts: {
      heading: "'Courier New', monospace",
      body: "'Courier New', monospace"
    },
    effects: ["holographic", "data-streams", "scan-lines"]
  },
  {
    id: "scandinavian",
    name: "斯堪的纳维亚风格",
    description: "体现北欧设计的简约与功能美学",
    colors: {
      primary: "#4a90e2",
      secondary: "#f5f5f5",
      accent: "#ffc0cb",
      background: "#ffffff",
      text: "#2c2c2c"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["natural-textures", "clean-geometry", "soft-shadows"]
  },
  {
    id: "art-deco",
    name: "艺术装饰风格",
    description: "重现1920-30年代的奢华与几何美学",
    colors: {
      primary: "#d4af37",
      secondary: "#000000",
      accent: "#ffffff",
      background: "#1a1a1a",
      text: "#d4af37"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["geometric-patterns", "gold-foil", "symmetrical-design"]
  },
  {
    id: "japanese-minimalism",
    name: "日式极简风格",
    description: "体现'侘寂'美学——接受不完美、无常与不完整的哲学",
    colors: {
      primary: "#2c2c2c",
      secondary: "#8e8e8e",
      accent: "#f8f8f8",
      background: "#ffffff",
      text: "#333333"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["ink-wash", "zen-spacing", "natural-imperfections"]
  },
  {
    id: "postmodern-deconstruction",
    name: "后现代解构风格",
    description: "彻底打破传统设计规则和网格系统",
    colors: {
      primary: "#ff6b6b",
      secondary: "#4ecdc4",
      accent: "#45b7d1",
      background: "#f9f9f9",
      text: "#2c2c2c"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["broken-grid", "overlapping-elements", "chaotic-order"]
  },
  {
    id: "punk",
    name: "朋克风格",
    description: "体现DIY精神和反叛文化",
    colors: {
      primary: "#ff0000",
      secondary: "#000000",
      accent: "#ffffff",
      background: "#f5f5f5",
      text: "#000000"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["torn-edges", "safety-pins", "spray-paint"]
  },
  {
    id: "british-rock",
    name: "英伦摇滚风格",
    description: "融合英国传统元素与反叛摇滚美学",
    colors: {
      primary: "#dc143c",
      secondary: "#ffffff",
      accent: "#000080",
      background: "#f8f8ff",
      text: "#2c2c2c"
    },
    fonts: {
      heading: "'Noto Serif SC', serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["union-jack-elements", "vintage-records", "rock-textures"]
  },
  {
    id: "black-metal",
    name: "黑金属风格",
    description: "体现极致黑暗美学和神秘主义",
    colors: {
      primary: "#ffffff",
      secondary: "#666666",
      accent: "#ff0000",
      background: "#000000",
      text: "#ffffff"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["mystical-symbols", "gothic-elements", "dark-atmosphere"]
  },
  {
    id: "memphis-design",
    name: "孟菲斯风格",
    description: "重现80年代意大利设计运动的前卫美学",
    colors: {
      primary: "#ff69b4",
      secondary: "#00ffff",
      accent: "#ffff00",
      background: "#ffffff",
      text: "#333333"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["geometric-chaos", "neon-colors", "80s-vibes"]
  },
  {
    id: "cyberpunk",
    name: "赛博朋克风格",
    description: "体现'高科技，低生活'的反乌托邦美学",
    colors: {
      primary: "#00ffff",
      secondary: "#ff00ff",
      accent: "#00ff00",
      background: "#0a0a0a",
      text: "#e6e6e6"
    },
    fonts: {
      heading: "'Courier New', monospace",
      body: "'Courier New', monospace"
    },
    effects: ["glitch-effects", "neon-lights", "digital-decay"]
  },
  {
    id: "pop-art",
    name: "波普艺术风格",
    description: "重现60年代艺术运动的大胆美学",
    colors: {
      primary: "#ff0000",
      secondary: "#ffff00",
      accent: "#0000ff",
      background: "#ffffff",
      text: "#000000"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["halftone-dots", "comic-elements", "bright-colors"]
  },
  {
    id: "deconstructed-swiss",
    name: "瑞士国际主义风格的解构版",
    description: "在严格网格系统的基础上进行有意识的破坏和重组",
    colors: {
      primary: "#ff0000",
      secondary: "#000000",
      accent: "#ffffff",
      background: "#f8f8f8",
      text: "#333333"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["broken-grid", "systematic-chaos", "helvetica-worship"]
  },
  {
    id: "vaporwave",
    name: "蒸汽波美学",
    description: "体现互联网亚文化的怀旧未来主义",
    colors: {
      primary: "#ff00ff",
      secondary: "#00ffff",
      accent: "#ffff00",
      background: "linear-gradient(135deg, #ff00ff, #00ffff)",
      text: "#ffffff"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["retro-gradients", "vhs-aesthetics", "90s-nostalgia"]
  },
  {
    id: "neo-expressionism",
    name: "新表现主义风格",
    description: "体现80年代艺术运动的原始能量和情感表达",
    colors: {
      primary: "#ff4500",
      secondary: "#800080",
      accent: "#ffff00",
      background: "#2f2f2f",
      text: "#ffffff"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["brush-strokes", "emotional-chaos", "raw-energy"]
  },
  {
    id: "extreme-minimalism",
    name: "极简主义的极端版本",
    description: "将'少即是多'的理念推向极致",
    colors: {
      primary: "#000000",
      secondary: "#999999",
      accent: "#f0f0f0",
      background: "#ffffff",
      text: "#333333"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["ultra-clean", "pixel-perfect", "zen-emptiness"]
  },
  {
    id: "neo-futurism",
    name: "新未来主义",
    description: "体现当代建筑和产品设计中的前沿美学",
    colors: {
      primary: "#c0c0c0",
      secondary: "#4169e1",
      accent: "#ffd700",
      background: "#f8f8ff",
      text: "#2c2c2c"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["fluid-forms", "metallic-textures", "parametric-design"]
  },
  {
    id: "surrealist-collage",
    name: "超现实主义数字拼贴",
    description: "创造梦境般的视觉叙事",
    colors: {
      primary: "#ff69b4",
      secondary: "#9370db",
      accent: "#ffd700",
      background: "linear-gradient(45deg, #ff69b4, #9370db)",
      text: "#ffffff"
    },
    fonts: {
      heading: "'Noto Serif SC', serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["dreamlike-elements", "impossible-geometry", "surreal-combinations"]
  },
  {
    id: "neo-baroque",
    name: "新巴洛克数字风格",
    description: "将17世纪的华丽美学重新诠释为数字形式",
    colors: {
      primary: "#d4af37",
      secondary: "#8b0000",
      accent: "#4169e1",
      background: "#000000",
      text: "#ffd700"
    },
    fonts: {
      heading: "'Noto Serif SC', serif",
      body: "'Noto Serif SC', serif"
    },
    effects: ["ornate-decorations", "dramatic-lighting", "digital-baroque"]
  },
  {
    id: "liquid-morphism",
    name: "液态数字形态主义",
    description: "结合流体动力学与数字艺术创造超前卫视觉体验",
    colors: {
      primary: "#8a2be2",
      secondary: "#00bfff",
      accent: "#ff1493",
      background: "linear-gradient(135deg, #8a2be2, #00bfff)",
      text: "#ffffff"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["fluid-motion", "liquid-gradients", "morphing-shapes"]
  },
  {
    id: "hypersensory-minimalism",
    name: "超感官极简主义",
    description: "将极简美学推向感官极限",
    colors: {
      primary: "#f8f8f8",
      secondary: "#e8e8e8",
      accent: "#d8d8d8",
      background: "#ffffff",
      text: "#333333"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["micro-interactions", "subtle-textures", "sensory-depth"]
  },
  {
    id: "neo-expressionist-data",
    name: "新表现主义数据可视化",
    description: "将抽象表现主义艺术与数据可视化完美融合",
    colors: {
      primary: "#ff4500",
      secondary: "#4169e1",
      accent: "#ffd700",
      background: "#f8f8ff",
      text: "#2c2c2c"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["data-brushstrokes", "abstract-charts", "emotional-data"]
  },
  {
    id: "victorian",
    name: "维多利亚风格",
    description: "重现19世纪英国维多利亚时期的华丽印刷美学",
    colors: {
      primary: "#8b4513",
      secondary: "#daa520",
      accent: "#dc143c",
      background: "#faf0e6",
      text: "#2f1b14"
    },
    fonts: {
      heading: "'Noto Serif SC', serif",
      body: "'Noto Serif SC', serif"
    },
    effects: ["ornate-borders", "vintage-typography", "period-decorations"]
  },
  {
    id: "bauhaus",
    name: "包豪斯风格",
    description: "体现20世纪早期德国包豪斯学校的功能主义美学",
    colors: {
      primary: "#ff0000",
      secondary: "#ffff00",
      accent: "#0000ff",
      background: "#ffffff",
      text: "#000000"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["geometric-purity", "functional-design", "primary-colors"]
  },
  {
    id: "constructivism",
    name: "构成主义风格",
    description: "体现20世纪早期俄国前卫艺术运动的革命性美学",
    colors: {
      primary: "#ff0000",
      secondary: "#000000",
      accent: "#ffffff",
      background: "#f8f8f8",
      text: "#000000"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["diagonal-compositions", "revolutionary-graphics", "dynamic-tension"]
  },
  {
    id: "german-expressionism",
    name: "德国表现主义风格",
    description: "体现20世纪初期德国表现主义运动的强烈情感表达",
    colors: {
      primary: "#ffff00",
      secondary: "#8b0000",
      accent: "#228b22",
      background: "#191970",
      text: "#ffffff"
    },
    fonts: {
      heading: "'Noto Sans SC', sans-serif",
      body: "'Noto Sans SC', sans-serif"
    },
    effects: ["dramatic-shadows", "emotional-distortion", "woodcut-aesthetic"]
  }
];

export function getRandomStyle(): DesignStyle {
  const randomIndex = Math.floor(Math.random() * DESIGN_STYLES.length);
  return DESIGN_STYLES[randomIndex];
}

export function getStyleById(id: string): DesignStyle | undefined {
  return DESIGN_STYLES.find(style => style.id === id);
}