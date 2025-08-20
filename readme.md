# Article Crawler API

API để crawl nội dung bài viết và tìm kiếm Elasticsearch.

## 🚀 Cài đặt & Chạy

```bash
# Cài đặt
npm install

# Chạy server
npm start
```

Server chạy tại: `http://localhost:3000`

## 📌 API Endpoints

### 1. Health Check
```
GET /
```

### 2. Crawl Articles
Crawl một hoặc nhiều bài viết (tối đa 10 URLs)

```
GET /api/crawl?urls=url1,url2,url3
```

**Ví dụ:**
```bash
# Crawl 1 URL
curl "http://localhost:3000/api/crawl?urls=https://vnexpress.net/article1"

# Crawl nhiều URLs (phân cách bằng dấu phẩy)
curl "http://localhost:3000/api/crawl?urls=https://vnexpress.net/article1,https://vnexpress.net/article2"
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "url": "https://vnexpress.net/article1",
      "success": true,
      "data": {
        "title": "Tiêu đề",
        "description": "Mô tả",
        "author": "Tác giả",
        "content": "Nội dung HTML",
        "published_time": "2024-01-01",
        "image": "image.jpg"
      }
    }
  ]
}
```

### 3. Fuzzy Search (Elasticsearch)
Tìm kiếm trong Elasticsearch

```
POST /api/fuzzy-search
Content-Type: application/json
```

**Body:**
```json
{
  "index": "recruitmentapp_companyinfo",
  "field": "name",
  "query": "mango",
  "limit": 10
}
```

**Ví dụ:**
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

## ⚠️ Lưu ý

- **Giới hạn:** Tối đa 10 URLs mỗi request
- **URL Encoding:** URLs sẽ được tự động decode
- **Fuzzy Search:** Mặc định trả về 1 kết quả, dùng `limit` để thay đổi

## 📦 Dependencies

- `express` - Web framework
- `@extractus/article-extractor` - Crawl articles  
- `@elastic/elasticsearch` - Elasticsearch client
- `cors` - Enable CORS