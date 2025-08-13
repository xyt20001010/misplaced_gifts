# 音频系统使用指南

## 功能概述
《错位的礼物》游戏现已集成智能音频播放系统，支持背景音乐的智能管理和连续播放。

## 核心特性

### 1. 智能连续播放
- **同一音频不重播**：连续多个场景使用同一音频时，音乐会继续播放而不是从头开始
- **记忆播放位置**：切换到其他音频后再回来，会从上次暂停的位置继续播放
- **淡入淡出效果**：音频切换时有平滑的过渡效果

### 2. 音频文件管理
- 所有音频文件存放在 `audio/` 文件夹中
- 当前包含的音频文件：
  - `audio/forest_mixtape.mp3` - 示例背景音乐

### 3. 在story-data.js中配置音频

每个场景可以添加音频配置：

```javascript
"scene_id": {
    text: "场景文本...",
    audio: "audio/background_music.mp3",  // 音频文件路径
    audioLoop: true,                      // 是否循环播放（默认true）
    choices: [...],
    chapter: "章节名",
    time: "时间"
}
```

## 使用示例

### 连续场景使用同一音频
```javascript
// 场景1
"start": {
    text: "开始场景...",
    audio: "audio/forest_mixtape.mp3",
    audioLoop: true,
    // ...
}

// 场景2 - 音频会继续播放
"ignore_vein": {
    text: "继续剧情...",
    audio: "audio/forest_mixtape.mp3",  // 同一音频，不会重新开始
    audioLoop: true,
    // ...
}

// 场景3 - 音频仍然继续
"open_door": {
    text: "更多剧情...",
    audio: "audio/forest_mixtape.mp3",  // 继续播放
    audioLoop: true,
    // ...
}
```

### 切换不同音频
```javascript
// 场景A - 播放音乐1
"scene_a": {
    audio: "audio/music1.mp3",
    // ...
}

// 场景B - 切换到音乐2
"scene_b": {
    audio: "audio/music2.mp3",  // 音乐1淡出，音乐2淡入
    // ...
}

// 场景C - 回到音乐1
"scene_c": {
    audio: "audio/music1.mp3",  // 从之前暂停的位置继续
    // ...
}
```

### 无音频场景
```javascript
// 不需要音频的场景
"silent_scene": {
    text: "安静的场景...",
    // 不设置audio字段，之前的音频会淡出
    choices: [...]
}
```

## 音频管理器API

AudioManager类提供了以下主要方法：

- `play(audioPath, options)` - 播放音频
- `pause(audioPath, fadeOut)` - 暂停音频
- `resume(audioPath, fadeIn)` - 继续播放
- `stop(audioPath)` - 停止并重置音频
- `stopAll()` - 停止所有音频
- `setVolume(volume)` - 设置音量（0-1）
- `setEnabled(enabled)` - 启用/禁用音效
- `preload(audioPaths)` - 预加载音频文件

## 添加新音频的步骤

1. **准备音频文件**
   - 支持格式：MP3, WAV, OGG
   - 建议使用MP3格式，兼容性最好
   - 文件大小建议控制在5MB以内

2. **放置音频文件**
   ```bash
   将音频文件放到 audio/ 文件夹中
   例如：audio/battle_theme.mp3
   ```

3. **在场景中配置**
   ```javascript
   "battle_scene": {
       text: "战斗开始了！",
       audio: "audio/battle_theme.mp3",
       audioLoop: true,
       // ...
   }
   ```

## 音效开关

- 游戏设置中的"音效"开关可以控制所有音频播放
- 关闭音效后，所有音频会暂停
- 重新开启后，会恢复当前场景的音频

## 性能优化

- 音频实例会被缓存，避免重复加载
- 使用淡入淡出效果，避免音频切换时的突兀感
- 未使用的音频实例会定期清理，节省内存

## 注意事项

1. **浏览器自动播放策略**
   - 某些浏览器要求用户交互后才能播放音频
   - 第一次点击游戏界面后音频才会开始

2. **音频格式兼容性**
   - MP3：所有现代浏览器支持
   - OGG：Chrome、Firefox支持
   - WAV：体积较大，不推荐用于背景音乐

3. **网络加载**
   - 音频文件会在首次播放时加载
   - 建议使用较小的文件以加快加载速度

## 故障排除

### 音频不播放
1. 检查音效开关是否打开
2. 确认音频文件路径正确
3. 检查浏览器控制台是否有错误信息
4. 确认音频文件格式被浏览器支持

### 音频重复播放
- 确保连续场景使用完全相同的音频路径
- 路径必须完全一致，包括大小写

### 音频切换不流畅
- 检查淡入淡出时长设置（默认1秒）
- 确保音频文件没有损坏

## 扩展建议

1. **多层音频**：可以扩展支持背景音乐+音效同时播放
2. **音量控制**：可以添加音量滑块让玩家调节
3. **音频预加载**：可以在游戏开始时预加载所有音频
4. **环境音效**：可以为不同场景添加环境音效层