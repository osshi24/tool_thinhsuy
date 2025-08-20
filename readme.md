# Article Crawler & Search API

API cho phép crawl nội dung bài viết từ URL và tìm kiếm fuzzy trong Elasticsearch.

## 🚀 Cài đặt

### Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### Chạy server

```bash
# Development
npm run dev

# Production
npm start
```

Server sẽ chạy tại: `http://localhost:3000` (mặc định)

## 📋 Danh sách API Endpoints

### 1. Health Check
Kiểm tra trạng thái server

**Endpoint:** `GET /`

**Response:**
```json
{
  "status": "OK",
  "message": "Thịnh suyyy ^.^"
}
```

---

### 2. Crawl Single Article
Crawl nội dung từ một URL bài viết

**Endpoint:** `POST /api/crawl`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com/article"
}
```

**Response thành công:**
```json
{
  "success": true,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "source_url": "https://example.com/article",
  "data": {
    "title": "Tiêu đề bài viết",
    "description": "Mô tả bài viết",
    "author": "Tên tác giả",
    "content": "Nội dung HTML",
    "text_content": "Nội dung text thuần",
    "published_time": "2024-01-01T08:00:00.000Z",
    "source": "example.com",
    "image": "https://example.com/image.jpg",
    "links": ["link1", "link2"],
    "lang": "vi"
  }
}
```

**Response lỗi:**
```json
{
  "success": false,
  "error": "Mô tả lỗi",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

**Ví dụ cURL:**
```bash
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url":"https://vnexpress.net/example-article"}'
```

---

### 3. Crawl Multiple Articles
Crawl nội dung từ nhiều URL (tối đa 10 URLs)

**Endpoint:** `POST /api/crawl-multiple`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "urls": [
    "https://example.com/article1",
    "https://example.com/article2",
    "https://example.com/article3"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "total": 3,
  "successful": 2,
  "failed": 1,
  "results": [
    {
      "url": "https://example.com/article1",
      "success": true,
      "data": {
        "title": "Tiêu đề 1",
        "description": "Mô tả 1",
        "author": "Tác giả 1",
        "content": "Nội dung HTML",
        "published_time": "2024-01-01T08:00:00.000Z",
        "image": "https://example.com/image1.jpg"
      }
    },
    {
      "url": "https://example.com/article2",
      "success": false,
      "error": "Failed to extract"
    }
  ]
}
```

**Ví dụ cURL:**
```bash
curl -X POST http://localhost:3000/api/crawl-multiple \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://vnexpress.net/article1",
      "https://vnexpress.net/article2"
    ]
  }'
```

---

### 4. Fuzzy Search (Elasticsearch)
Tìm kiếm fuzzy trong Elasticsearch

**Endpoint:** `POST /api/fuzzy-search`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "index": "recruitmentapp_companyinfo",
  "field": "name",
  "query": "mango",
  "limit": 10
}
```

**Parameters:**
- `index` (required): Tên index trong Elasticsearch
- `field` (required): Tên field cần tìm kiếm
- `query` (required): Từ khóa tìm kiếm
- `limit` (optional): Số lượng kết quả trả về (mặc định: 1)

**Response:**
```json
{
  "success": true,
  "total": 5,
  "limit": 10,
  "hits": [
    {
      "_id": "doc_id_1",
      "_score": 0.95,
      "name": "Mango Company",
      "address": "123 Street",
      "...other_fields": "..."
    }
  ]
}
```

**Ví dụ cURL:**
```bash
curl -X POST http://localhost:3000/api/fuzzy-search \
  -H "Content-Type: application/json" \
  -d '{
    "index": "recruitmentapp_companyinfo",
    "field": "name",
    "query": "mango",
    "limit": 5
  }'
```

## 🔧 Cấu hình

### Environment Variables
Tạo file `.env` trong thư mục gốc:

```env
# Server Port
PORT=3000

# Elasticsearch Configuration (nếu cần thay đổi)
ES_NODE=https://elasticsearch.mangoads.com.vn/
ES_USERNAME=mangoads
ES_PASSWORD=your_password_here
```

## 📝 Lưu ý sử dụng

1. **Giới hạn crawl multiple:** Tối đa 10 URLs mỗi request
2. **Validation URL:** API sẽ kiểm tra định dạng URL hợp lệ trước khi crawl
3. **Fuzzy Search:** Sử dụng fuzziness AUTO cho phép tìm kiếm gần đúng
4. **CORS:** Đã được enable cho tất cả origins

## 🛠️ Xử lý lỗi

API trả về các mã lỗi HTTP phù hợp:

- `400 Bad Request`: Dữ liệu request không hợp lệ
- `500 Internal Server Error`: Lỗi server

Mọi response lỗi đều có format:
```json
{
  "success": false,
  "error": "Mô tả lỗi chi tiết",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

## 📦 Dependencies

- `express`: Web framework
- `@extractus/article-extractor`: Thư viện crawl article
- `cors`: Enable CORS
- `@elastic/elasticsearch`: Elasticsearch client

## 🤝 Hỗ trợ

Nếu gặp vấn đề khi sử dụng API, vui lòng liên hệ team phát triển.

## 📄 License

[Thêm thông tin license nếu cần]