import express from 'express';
import { extract } from '@extractus/article-extractor';
import cors from 'cors';
import { Client as ESClient } from '@elastic/elasticsearch';
// Elasticsearch client config
const esClient = new ESClient({
  node: 'https://elasticsearch.mangoads.com.vn/',
  auth: {
    username: 'mangoads',
    password: 'C1xPHEG03N1Xoe6l6gJCnqR808NVpBVzi1J0fEsgYHkj5brr7T'
  }
});



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * GET /
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Thịnh suyyy ^.^ ',
   
  });
});

/**
 * GET /api/crawl?urls=url1,url2,url3
 */
app.get('/api/crawl', async (req, res) => {
  try {

    let params = req.query.urls;

    console.log("params: ", params);
    let urls = params.split(',').map(decodeURIComponent);

    
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        error: 'URLs array is required'
      });
    }
    
    if (urls.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 URLs allowed per request'
      });
    }
    
    console.log(`📡 Crawling ${urls.length} URLs...`);
    
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const article = await extract(url);
          console.log("article: ", article);
          return {
            url,
            success: true,
            data: {
              title: article.title || null,
              description: article.description || null,
              author: article.author || null,
              content: article.content || null,
              published_time: article.published || null,
              image: article.image || null
            }
          };
        } catch (error) {
          return {
            url,
            success: false,
            error: error.message
          };
        }
      })
    );
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      total: urls.length,
      successful: results.filter(r => r.value?.success).length,
      failed: results.filter(r => !r.value?.success).length,
      results: results.map(r => r.value)
    };
    
    console.log(`✅ Crawled: ${response.successful}/${response.total} successful`);
    res.json(response);
    
  } catch (error) {
    console.error(`❌ Multiple crawl error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/crawl', async (req, res) => {
  try {
    let dataQuery = req.query.urls;

    let urls = dataQuery.split(',').map(decodeURIComponent);
    if (!urls) {
      return res.status(400).json({ success: false, error: 'URLs are required' });
    }
    if (typeof urls === 'string') {
      urls = [urls];
    }
    if (urls.length > 10) {
      return res.status(400).json({ success: false, error: 'Maximum 10 URLs allowed per request' });
    }
    
    console.log(`📡 Crawling ${urls.length} URLs...`);
    
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const article = await extract(url);
          console.log("article: ", article);
          return {
            url,
            success: true,
            data: {
              title: article.title || null,
              description: article.description || null,
              author: article.author || null,
              content: article.content || null,
              published_time: article.published || null,
              image: article.image || null
            }
          };
        } catch (error) {
          return {
            url,
            success: false,
            error: error.message
          };
        }
      })
    );
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      total: urls.length,
      successful: results.filter(r => r.value?.success).length,
      failed: results.filter(r => !r.value?.success).length,
      results: results.map(r => r.value)
    };
    
    console.log(`✅ Crawled: ${response.successful}/${response.total} successful`);
    res.json(response);
    
  } catch (error) {
    console.error(`❌ Multiple crawl error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/fuzzy-search
 * Body: { index: 'recruitmentapp_companyinfo', field: 'name', query: 'mango' }
 * Optional: size (default 10)
 */
app.post('/api/fuzzy-search', async (req, res) => {
  try {
    const { index, field, query, limit = 1 } = req.body;
    if (!index || !field || !query) {
      return res.status(400).json({ success: false, error: 'index, field, and query are required' });
    }

    const esResult = await esClient.search({
      index,
      size: limit,
      query: {
        fuzzy: {
          [field]: {
            value: query,
            fuzziness: 'AUTO'
          }
        }
      }
    });

    res.json({
      success: true,
      total: esResult.hits.total.value,
      limit: limit,
      hits: esResult.hits.hits.map(hit => ({
        _id: hit._id,
        _score: hit._score,
        ...hit._source
      }))
    });
  } catch (error) {
    console.error('Fuzzy search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Article Crawler API running on http://localhost:${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   - GET /api/crawl/:urls`);
  console.log(`   - POST /api/fuzzy-search`);
});

export default app;