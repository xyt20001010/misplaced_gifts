# 《错位的礼物》- 互动文字游戏

## 游戏简介
《错位的礼物》是一款基于网页的互动文字冒险游戏，讲述了刘枭（Xavier）和Vein之间的感人故事。游戏融合了多条剧情分支，玩家的每个选择都会影响故事的走向，带来不同的结局。

## 如何运行游戏

### 方法一：直接打开
1. 找到 `index.html` 文件
2. 双击在浏览器中打开即可开始游戏

### 方法二：使用本地服务器（推荐）
```bash
# 如果你安装了Python
python3 -m http.server 8000

# 或者使用Python 2
python -m SimpleHTTPServer 8000

# 如果你安装了Node.js
npx http-server
```
然后在浏览器中访问 `http://localhost:8000`

## 游戏特色

### 多条剧情线
- **主线剧情**：围绕演唱会门票和游戏《Pain》展开
- **分支剧情**：在关键节点做出不同选择，体验不同的故事发展
- **多重结局**：包括温馨、感人、苦涩等多种结局

### 主要分支点

1. **演唱会入场选择**（第一个分支点）
   - Plan A：冒险潜入演唱会
   - Plan B：回家一起玩游戏

2. **Boss战后的选择**（第二个分支点）
   - 接受邀舞：触发特殊的华尔兹剧情
   - 拒绝邀舞：进入激烈的战斗模式
   - 沉默观察：发现隐藏的真相

## 游戏操作

### 基础操作
- **点击选项**：选择不同的剧情走向
- **保存进度**：点击"保存进度"按钮，支持5个存档位
- **读取存档**：加载之前的游戏进度
- **重新开始**：从头开始新的冒险

### 快捷键
- `Ctrl + S`：快速保存
- `Ctrl + L`：快速加载
- `空格键`：跳过文字动画
- `数字键 1-5`：快速选择对应选项

### 游戏设置
- **文字速度**：调整文字显示速度
- **自动播放**：自动进行剧情（开发中）
- **音效开关**：控制游戏音效
- **主题切换**：7种预设主题 + 自定义颜色

## 结局一览

### 主要结局
1. **永恒的华尔兹**：通过舞蹈救赎幽灵
2. **孤独者的终曲**：拒绝后的悲伤结局
3. **见证者**：发现真相的温馨结局
4. **演唱会之夜**：成功潜入演唱会的浪漫结局
5. **错位的礼物**（真结局）：理解礼物真正含义的完美结局

### 隐藏要素
- 收集所有剧情分支可解锁特殊对话
- 某些选择会影响后续剧情的细节
- 注意观察环境描述，可能包含额外信息

## 文件结构
```
misplaced_gifts/
├── index.html           # 游戏主页面
├── style.css            # 游戏样式
├── theme.css            # 主题样式定义
├── game.js              # 游戏逻辑
├── story-data.js        # 剧情数据
├── audio-manager.js     # 音频管理器
├── audio/               # 音频文件目录
│   └── forest_mixtape.mp3  # 背景音乐
├── audio_system_guide.md # 音频系统使用指南
├── branch_storylines.md # 完整分支剧情文档
└── README.md            # 游戏说明
```

## 技术特性
- 纯前端实现，无需服务器
- 响应式设计，支持手机和平板
- 本地存储，自动保存游戏设置
- 流畅的动画效果和交互体验
- 智能音频管理系统
- 多主题切换功能
- 欢迎界面引导

## 音频配置教程

### 为开发者准备：如何为不同场景配置音频

#### 1. 准备音频文件
- 将音频文件（支持 MP3、WAV、OGG 格式）放入 `audio/` 目录
- 建议使用 MP3 格式，兼容性最好
- 文件大小建议控制在 5MB 以内

#### 2. 在 story-data.js 中配置音频

每个场景都可以添加音频配置。打开 `story-data.js` 文件，在场景对象中添加音频属性：

```javascript
"场景ID": {
    text: "场景文本内容...",
    audio: "audio/你的音频文件.mp3",  // 音频文件路径
    audioLoop: true,                    // 是否循环播放（默认true）
    choices: [...],
    chapter: "章节名",
    time: "时间显示"
}
```

#### 3. 实际示例

##### 示例1：为开始场景配置背景音乐
```javascript
"start": {
    text: "黏腻的雨丝无声地落在玻璃窗上...",
    audio: "audio/rain_ambient.mp3",  // 雨夜氛围音
    audioLoop: true,
    choices: [...],
    chapter: "序章",
    time: "00:00 - 01:00"
}
```

##### 示例2：为战斗场景配置紧张音乐
```javascript
"boss_battle": {
    text: "Boss出现了！",
    audio: "audio/battle_theme.mp3",  // 战斗音乐
    audioLoop: true,
    choices: [...],
    chapter: "决战",
    time: "23:00 - 00:00"
}
```

##### 示例3：为结局场景配置温馨音乐
```javascript
"happy_ending": {
    text: "一切都结束了...",
    audio: "audio/ending_peaceful.mp3",  // 结局音乐
    audioLoop: false,  // 不循环，播放一次
    choices: [...],
    chapter: "终章",
    time: "00:00",
    isEnding: true
}
```

#### 4. 音频智能管理功能

系统会智能管理音频播放：

- **连续播放**：如果连续多个场景使用相同的音频文件，音乐会继续播放而不是重新开始
- **淡入淡出**：切换不同音频时，会有平滑的淡入淡出效果
- **位置记忆**：切换场景后再回来，音频会从上次暂停的位置继续播放

##### 连续场景示例：
```javascript
// 场景1 - 开始播放
"scene1": {
    audio: "audio/background.mp3",
    ...
}

// 场景2 - 继续播放，不会重新开始
"scene2": {
    audio: "audio/background.mp3",  // 相同音频
    ...
}

// 场景3 - 切换新音乐
"scene3": {
    audio: "audio/different.mp3",  // 不同音频，会淡出旧音乐，淡入新音乐
    ...
}
```

#### 5. 批量添加音频配置

如果需要为多个场景批量添加相同的音频，可以创建一个简单的 Node.js 脚本：

```javascript
// update_audio.js
const fs = require('fs');
let content = fs.readFileSync('story-data.js', 'utf8');

// 为指定场景添加音频
const scenesToUpdate = ['scene1', 'scene2', 'scene3'];
const audioPath = 'audio/background.mp3';

scenesToUpdate.forEach(sceneId => {
    // 在场景的time字段后添加音频配置
    const pattern = new RegExp(`("${sceneId}":[\\s\\S]*?time:\\s*"[^"]+")\\s*(\\n\\s*\\})`);
    content = content.replace(pattern, `$1,\n        audio: "${audioPath}",\n        audioLoop: true$2`);
});

fs.writeFileSync('story-data.js', content, 'utf8');
console.log('音频配置已添加！');
```

#### 6. 注意事项

- **路径格式**：音频路径必须是相对于 index.html 的相对路径
- **文件名**：避免使用中文或特殊字符命名音频文件
- **测试**：添加新音频后，建议在不同浏览器中测试兼容性
- **音量控制**：玩家可以通过设置面板控制音效开关

#### 7. 浏览器自动播放策略

由于浏览器的自动播放策略，游戏实现了欢迎界面：
- 用户首次访问时会看到欢迎界面
- 点击"开始游戏"按钮后，音频才会开始播放
- 这确保了音频能在所有浏览器中正常工作

## 故事背景
故事发生在一个雨夜，游戏开发者刘枭和他的朋友Vein准备交换礼物。刘枭准备了演唱会门票，Vein准备了游戏兑换码，但由于Vein特殊的"不存在"身份，计划出现了意外...

这个看似简单的礼物交换，却引发了一系列关于身份、存在、陪伴和爱的深刻思考。

## 致谢
感谢所有玩家的支持和反馈。这个游戏献给所有相信"陪伴是最好的礼物"的人。

---

**开始你的冒险吧！**