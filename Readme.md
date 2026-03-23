간단하면서도 확실하게 작동하는 메모장 웹 서비스를 만드는 방법을 정리해 드릴게요. 복잡한 설정 없이 바로 시작할 수 있도록 **Node.js(Express)**와 **SQLite** 조합을 추천합니다.

---

## 1. 화면 구조 디자인 (UI/UX)

사용자가 요청하신 대로 군더더기 없는 구조입니다.

* **입력창:** `textarea` 태그를 사용하여 2~3줄 정도의 높이를 확보합니다.
* **버튼 영역:** 입력창 바로 아래에 `저장`, `불러오기`, `삭제` 버튼을 가로로 배치합니다.
* **목록 영역 (선택 사항):** 불러온 메모가 화면에 표시될 공간이 필요합니다.

---

## 2. 데이터베이스(DB) 설계

가장 가벼운 **SQLite**를 사용합니다. 별도의 DB 서버 설치가 필요 없어 입문용으로 제격입니다.

| 컬럼명 | 타입 | 설명 |
| :--- | :--- | :--- |
| **id** | INTEGER | 기본 키 (자동 증가) |
| **content** | TEXT | 메모 내용 |
| **created_at** | DATETIME | 작성 시간 (기본값: 현재 시간) |

---

## 3. 프로그램 작성 (코딩)

### 프로젝트 설정
터미널에서 아래 명령어를 실행하여 필요한 패키지를 설치하세요.
```bash
mkdir my-memo-app && cd my-memo-app
npm init -y
npm install express sqlite3 body-parser
```

### 백엔드 (server.js)
서버 로직과 DB 연결을 담당합니다.

```javascript
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // 프론트엔드 파일 위치

// DB 초기화
const db = new sqlite3.Database('./memo.db');
db.run("CREATE TABLE IF NOT EXISTS memos (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT)");

// 메모 저장 API
app.post('/api/save', (req, res) => {
    const { content } = req.body;
    db.run("INSERT INTO memos (content) VALUES (?)", [content], function(err) {
        if (err) return res.status(500).send(err.message);
        res.json({ id: this.lastID });
    });
});

// 메모 불러오기 API (가장 최근 것 하나)
app.get('/api/load', (req, res) => {
    db.get("SELECT * FROM memos ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.json(row || { content: "" });
    });
});

// 메모 삭제 API (전체 삭제 혹은 최신 삭제)
app.delete('/api/delete', (req, res) => {
    db.run("DELETE FROM memos", (err) => {
        if (err) return res.status(500).send(err.message);
        res.send("Deleted");
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

### 프론트엔드 (public/index.html)
화면 구성과 서버 통신을 담당합니다.

```html
<!DOCTYPE html>
<html>
<head>
    <title>심플 메모장</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; padding-top: 50px; }
        .container { width: 300px; }
        textarea { width: 100%; height: 80px; margin-bottom: 10px; resize: none; }
        .btn-group { display: flex; gap: 5px; }
        button { flex: 1; padding: 10px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <textarea id="memoInput" placeholder="여기에 메모를 입력하세요..."></textarea>
        <div class="btn-group">
            <button onclick="saveMemo()">저장</button>
            <button onclick="loadMemo()">불러오기</button>
            <button onclick="deleteMemo()">삭제</button>
        </div>
    </div>

    <script>
        async function saveMemo() {
            const content = document.getElementById('memoInput').value;
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            alert('저장되었습니다!');
        }

        async function loadMemo() {
            const res = await fetch('/api/load');
            const data = await res.json();
            document.getElementById('memoInput').value = data.content;
        }

        async function deleteMemo() {
            if(confirm('정말 삭제할까요?')) {
                await fetch('/api/delete', { method: 'DELETE' });
                document.getElementById('memoInput').value = '';
                alert('삭제되었습니다.');
            }
        }
    </script>
</body>
</html>
```

---

## 4. 실행 방법

1.  `server.js` 파일을 만듭니다.
2.  `public` 폴더를 만들고 그 안에 `index.html`을 저장합니다.
3.  터미널에서 `node server.js`를 입력합니다.
4.  웹 브라우저에서 `http://localhost:3000`에 접속합니다.

이 구조는 가장 기본적인 형태입니다. 여기서 디자인을 조금 더 예쁘게 바꾸거나, 메모 여러 개를 리스트로 보여주는 기능을 추가하며 확장해 나가는 재미가 있을 거예요.

혹시 특정 기능(예: 로그인 기능 추가, 특정 메모만 삭제 등)을 더 자세히 알고 싶으신가요? 원하신다면 해당 부분의 코드를 더 구체적으로 짜드릴 수 있습니다.