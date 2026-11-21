# 萬安體製造所（Wanan Style Generator）

> 任何主題都能延伸、任何議題都能協調、任何事情都有掌握、任何細節都可以持續討論。

### 👉 [立即使用：https://a-tu-4-free.github.io/wanan-style/](https://a-tu-4-free.github.io/wanan-style/)

輸入一個詞彙，即刻生成一段「萬安體」。純靜態網站，不使用 AI API、不需後端，所有生成都在瀏覽器端完成。

**⚠ 本站所有生成內容皆為戲仿創作，不代表任何人實際發言。**

---

## 功能

- 💬 **萬安體模式**：輸入詞彙 → 生成一段萬安體回答，並標示句型類型
- 🔀 **問A答B（核心）**：不正面回答，改談其他縣市、推給中央、切割成個案——問「744 萬遮陽傘」，答「高雄前鎮漁港 81 億」。素材在 `data/deflect.json`
- 🏃 **逃跑版**：「好，謝謝喔。」「我們都有在議會和說明會完整說明。」「請相關局處再向大家做完整說明。」——記者問完了，問題還在
- ⚖️ **亂套法律版**：鼠患依《動物保護法》、淹水依《個人資料保護法》、遮陽傘依《著作權法》。法律清單在 `phrases.json` 的 `laws`，主題可用 `laws` 欄位指定（政治諷刺，刻意錯置，不構成法律意見）
- 🏆 **成果包裝版**：「雖然還在研議，但已經為未來政策推動奠定重要基礎。」
- 💧 **翡翠水庫特別篇**：中央三度來函、拒喝光電水、飲水能源標示、好水聯盟（任何問題都能成立「好○○聯盟」）、「相關公文就在我手上」
- 💪 **強硬模式**：六種語氣——命令型（不要給我…）、凍未條型（我受夠了！咱凍未條！）、反擊型（不是誰說了算，是依法認定、依法辦理）、身分尊嚴型、連續質問型、強硬宣示型（該強硬的一定會強硬）
- 🧭 **負面議題判斷**：漏水、塞車、鼠患等負面題目，不會出現「讓○○更好、成為大家的驕傲」這類句子（判斷詞在 `phrases.json` 的 `negative_words`）
- 🪪 **專業職稱模式**：輸入市政問題 → 生成虛構的「萬安式專業職稱」、3 項惡搞工作內容與記者會說明
- ⬆ **職務升級**：同一職稱一路升級（初階 → 中階 → 高階 → 特別版）
- 🏙 **任何題目都能市政化**：非市政題目（失戀、披薩、打電動）一樣能回答，並有機率以「市政化」開場
- 🛑 **敏感議題不開玩笑**：涉及受害者的詞彙（可在 `phrases.json` 的 `sensitive` 調整）不生成戲仿內容
- 🔄 **再來一版**：同一題換一種說法（自動避開上一個類型）
- 🎲 **隨機題目**：從詞庫隨機出題
- 📋 **複製文字**：附上提問、出處與「戲仿創作」標示
- 📸 **截圖分享**：產生「提問＋回答」對話卡片圖片
  - 電腦：一鍵複製圖片到剪貼簿，直接貼到 FB / Threads / X
  - 手機：開啟預覽，可呼叫系統分享（LINE、IG…）、下載或長按儲存
  - 圖片固定附上「戲仿創作・非本人發言」浮水印與網址
- 🔗 **網址直接生成**：[`https://a-tu-4-free.github.io/wanan-style/#披薩`](https://a-tu-4-free.github.io/wanan-style/#披薩) 開啟即生成
- 📱 支援桌面與手機瀏覽器

### 生成類型

標準萬安體、開放態度型、即刻處理型、跨局處協調型、長篇完整說明型、反擊質疑型、荒謬延伸型、願景收尾型、官腔疊加型、無限循環型、過度精密行政型、新聞標題型、完整萬安體、議會答詢型、責任承擔型。

完整萬安體依循敘事流程：事件發生 → 第一時間掌握 → 親自召集 → 親自走訪 → 制度精進 → 客觀數據 → 宏大結尾。

輸入職稱（如「鼠類偵防師」）也能自動對應到議題（鼠患）。

| 梗模型 | 範例 |
|---|---|
| 過度精密行政 | 我也會親自前往現場，使用壓力感測器測量長椅舒適度 |
| 官腔疊加 | 已召開記者會，也在議會提出專案報告，並赴中央及各大平台清楚說明 |
| 持續協助 | 一直持續協助市民，包括○○、○○及後續持續協助 |
| 口號實體化 | 為落實「幸福城市」，將成立滿意度測量小組，定期檢測市民的滿意濃度 |
| 人脈加速 | 曾透過朋友的朋友牽線，直接聯繫上並加速推進 |
| 無限循環 | 將持續追蹤後續追蹤工作之執行情形 |
| 新聞標題 | 【新聞快訊】市長親自視察公園，現場使用照度計測量亮度 |

儀器、人脈、口號與各分類的「測量項目＋儀器」組合在 `phrases.json` 的 `instruments`、`friends`、`slogans`、`metrics`；個別主題可用 `metrics` 欄位指定專屬測量項目。

---

## 專案結構

```text
wanan-style/
├── index.html
├── css/
│   └── style.css            # 含 RWD
├── js/
│   ├── engine.js            # 生成引擎（分類、語意延伸、句型組合、防重複）
│   ├── title-engine.js      # 萬安式專業職稱生成器
│   ├── share.js             # Canvas 截圖卡片、複製、分享、下載
│   └── app.js               # 介面控制、載入詞庫
├── data/
│   ├── patterns.json        # 句型模板（open / core / support / close）
│   ├── phrases.json         # 連接詞、結尾前綴、彩蛋、政治慣用語
│   ├── categories.json      # 主分類預設語意 + 未收錄詞分類規則
│   ├── titles.json          # 職稱議題、職級、職掌、考核指標、記者會模板
│   ├── deflect.json         # 問A答B 素材（其他縣市的事件、金額、來源）
│   ├── topics_food.json     # 食物、飲料
│   ├── topics_city.json     # 市政
│   ├── topics_transport.json
│   ├── topics_politics.json
│   ├── topics_life.json     # 生活、娛樂
│   └── topics_technology.json
├── tools/
│   └── audit.js             # 詞庫品質檢查（本機執行，不影響網站）
├── .nojekyll
└── README.md
```

---

## 本機開發

瀏覽器不允許 `file://` 讀取 JSON，**直接雙擊 index.html 會無法載入詞庫**。請在專案資料夾啟動本機伺服器：

```bash
python -m http.server 8000
```

然後開啟 <http://localhost:8000>。

> 「複製圖片到剪貼簿」需要 HTTPS 或 localhost 才能使用。

## 部署到 GitHub Pages

1. 建立 repo：`wanan-style`
2. 把所有檔案推上 `main` 分支根目錄
3. Settings → Pages → Source 選 **Deploy from a branch**，Branch 選 `main` / `/ (root)`
4. 約 1 分鐘後即可在 <https://a-tu-4-free.github.io/wanan-style/> 使用

截圖浮水印的網址會自動抓目前網址，不需手動修改。

### 更新後看不到新功能？

GitHub Pages 和瀏覽器都會快取檔案。每次更新請：

1. 修改 `js/app.js` 的 `VERSION`，以及 `index.html` 裡所有 `?v=` 的版本號（兩邊一致）
2. 推上 GitHub 後等 1～3 分鐘（Actions 頁面顯示綠勾即完成部署）
3. 瀏覽器按 `Ctrl + F5` 強制重新整理

---

## 生成流程

```
使用者輸入
→ 標準化（全形轉半形、常見簡轉繁、去除引號與標點）
→ 關鍵詞辨識（完全比對 → 包含比對 → 部分比對）
→ 主題分類（未收錄詞：依 categories.json 的 match 字詞判斷，否則歸為通用）
→ 語意延伸（主題詞 > 分類預設詞 > 通用詞，依權重抽取）
→ 選擇生成類型 → 依序選句（開頭 / 主體 / 補充 / 結尾）
→ 詞彙上限檢查（即刻、持續、尊重、掌握…不過度堆疊）
→ 輸出並記錄近期使用（localStorage）
```

### 防重複機制

- 同一段文字內：句型不重複、細節詞不重複、連接詞不重複
- 詞彙上限：例如「第一時間」「尊重」「開放」每段最多 1 次，「持續」「掌握」「協調」最多 2 次
- 跨次生成：近期用過的句型（45 筆）、細節詞（90 筆）、類型（2 筆）大幅降低權重
- 經典口頭禪作為約 7% 機率的彩蛋

---

## 擴充詞庫

### 新增主題

在對應的 `data/topics_*.json` 的 `topics` 陣列加入：

```json
{
  "id": "food_gyoza",
  "name": "鍋貼",
  "category": "food",
  "keywords": ["鍋貼", "煎餃"],
  "synonyms": [],
  "verbs": ["製作"],
  "relations": {
    "objects": ["消費者", "店家"],
    "details": ["餃子皮", "內餡", "煎製時間", "油量", "底部酥脆度"],
    "problems": ["底部燒焦", "油量過多"],
    "organizations": ["店家", "供應商"],
    "outcomes": ["酥脆度提升", "口味優化"]
  },
  "preferred_patterns": [],
  "excluded_patterns": [],
  "generation_weight": 10,
  "verification": "dictionary"
}
```

| 欄位 | 說明 |
|---|---|
| `category` | `food` `drink` `city` `transport` `politics` `life` `tech` `entertainment` `general` |
| `keywords` | 可辨識的輸入詞（英文請用小寫） |
| `verbs` | 用於「如果要{verb}{topic}」句型；**動詞不通順就留空陣列**，系統會自動跳過這類句型 |
| `relations.details` | 最重要的欄位：名詞片語，會被組成「A、B及C」 |
| `relations.problems` | 名詞片語，例如「排隊人潮」 |
| `relations.outcomes` | 名詞片語，要能接在「達到＿＿的目標」「確保＿＿」 |

`relations` 也支援規格書的 `components`、`materials`、`equipment`、`processes`、`time`、`costs`、`risks`、`actions`，都會被合併使用。

新增 JSON 檔案時，記得在 `js/app.js` 的 `DATA.topics` 加上路徑。

### 新增句型

在 `data/patterns.json` 加入：

```json
{ "id": "c44", "role": "core", "tags": ["crossdept"], "text": "{org}已經針對{d}召開專案會議。" }
```

| 欄位 | 說明 |
|---|---|
| `role` | `open` 開頭、`core` 主體、`support` 補充、`close` 結尾 |
| `tags` | `open` `immediate` `master` `crossdept` `respect` `whole` `layer` `list` `rolling` `overcome` `pro` `rebut` `vision` `full` `absurd` `civic` |

> `absurd`（荒謬混搭）與 `civic`（非市政題目的市政化開場）只在指定時使用。
| `weight` | 選填，預設 1 |
| `mode` | 選填，`angry` 為強硬模式專用、`news` 為新聞標題型專用 |
| `positive` | 選填，`true` 表示正面句型，負面議題不使用 |
| `negOnly` | 選填，`true` 表示只用於負面議題 |

可用變數：

| 變數 | 內容 |
|---|---|
| `{topic}` | 使用者輸入 |
| `{verb}` | 主題動詞 |
| `{d}` | 2～3 個細節詞組成的列表 |
| `{d1}` `{d2}` | 單一細節詞 |
| `{obj}` | 相關對象 |
| `{org}` | 相關單位 |
| `{prob}` / `{probs}` | 單一問題 / 兩個問題 |
| `{act}` | 處理動作（協調、評估…） |
| `{out}` `{out2}` | 預期成果 |
| `{xd}` | 其他主題的細節詞（僅荒謬延伸型） |

### 新增問A答B素材

在 `data/deflect.json` 的 `items` 加入：

```json
{ "id": "X-20", "city": "高雄", "name": "某某工程", "figure": "約10億元", "money": true,
  "line": "也持續滾動檢討", "match": ["公園", "工程"], "cats": ["city"],
  "source": "https://...", "verification": "user_provided" }
```

- `match`：題目含這些字時優先挑這筆；`cats`：同分類也會挑到
- `money`：是金額才會套用「○○又是怎麼花的？」句型；`big: true` 表示題目不相關時也可以拿來「完全脫軌」
- `aliases`：使用者直接輸入這些詞（如「垃圾山」「前鎮漁港」）時，會觸發「這是別縣市的事」回答：「垃圾山是台中的事，我想台中市府應該會清楚說明。」
- `kind: "negative"`：其他縣市也有的問題，會套用「可見這是全台灣共同面對的挑戰」
- 只寫事件與公開數字，不寫定罪；未查證的標示 `user_provided` 並附來源

### 新增職稱議題

在 `data/titles.json` 的 `issues` 加入：

```json
{
  "match": ["鴿子", "鴿"],
  "stems": ["鴿群管理", "鴿糞預測"],
  "jobs": ["統計鴿子數量，並研議鴿子是否也算市民。", "撐傘巡視鴿群熱點，避免被鴿糞命中。"]
}
```

- `stems`：職稱主幹，建議 6 字內。依職級變成「鴿糞預測師 → 鴿糞預測督導 → 首席鴿糞預測顧問 → 鴿糞預測總執行長」
- `jobs`：惡搞工作內容，每次抽 2 則，再搭配 1 則通用梗（`fallback_jobs`）
- 沒收錄的議題會用「輸入詞＋職能」自動產生職稱，工作內容全用通用梗

### 品質檢查

修改詞庫後，可以用 Node.js 跑自動檢查（所有主題 × 所有句型大量生成，列出未填變數、詞彙來源不符、重複片語等可疑結果）：

```bash
node tools/audit.js
N=20 node tools/audit.js   # 每類多顯示幾個範例
```

### 檢查 JSON 格式

```bash
python -c "import json,glob;[json.load(open(f,encoding='utf-8')) for f in glob.glob('data/*.json')];print('OK')"
```

---

## 後續規劃

- [ ] 萬安體濃度測試（`phrases.json` 的 `political_phrases` 已預備）
- [ ] 白話文 → 萬安體翻譯器
- [ ] 經典語錄典藏（僅收錄有公開來源可查證的發言，與戲仿句型分開管理）

## 聲明

本專案為政治諷刺與語言風格戲仿之娛樂創作。所有生成文字由句型模板隨機組合產生，**不代表任何人實際發言**，請勿將生成內容當作真實引言散布。實際事件與政策請以官方及新聞公開資料為準。
