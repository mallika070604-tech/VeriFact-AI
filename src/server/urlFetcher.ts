import http from 'http';
import https from 'https';
import zlib from 'zlib';
import { URL } from 'url';

export interface ExtractedArticle {
  url: string;
  canonicalUrl?: string;
  headline?: string;
  description?: string;
  content: string;
  author?: string;
  publicationDate?: string;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

function cleanAndExtractHtml(rawHtml: string, pageUrl: string): ExtractedArticle {
  if (!rawHtml || rawHtml.trim().length === 0) {
    throw new Error(
      'Unable to reliably retrieve this webpage (server returned an empty page). Please paste the article text in the Text tab.'
    );
  }

  // Extract Meta Properties
  const ogTitleMatch =
    rawHtml.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i) ||
    rawHtml.match(/<meta[^>]*content=["'](.*?)["'][^>]*property=["']og:title["']/i);
  const metaTitleMatch = rawHtml.match(/<title[^>]*>(.*?)<\/title>/i);
  const h1Match = rawHtml.match(/<h1[^>]*>(.*?)<\/h1>/i);

  const headline = decodeHtmlEntities(
    (ogTitleMatch ? ogTitleMatch[1] : metaTitleMatch ? metaTitleMatch[1] : h1Match ? h1Match[1] : '')
      .replace(/<[^>]+>/g, '')
      .trim()
  );

  const ogDescMatch =
    rawHtml.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i) ||
    rawHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  const description = ogDescMatch
    ? decodeHtmlEntities(ogDescMatch[1].replace(/<[^>]+>/g, '').trim())
    : undefined;

  const authorMatch =
    rawHtml.match(/<meta[^>]*name=["']author["'][^>]*content=["'](.*?)["']/i) ||
    rawHtml.match(/<meta[^>]*property=["']article:author["'][^>]*content=["'](.*?)["']/i);
  const author = authorMatch
    ? decodeHtmlEntities(authorMatch[1].replace(/<[^>]+>/g, '').trim())
    : undefined;

  const pubDateMatch =
    rawHtml.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["'](.*?)["']/i) ||
    rawHtml.match(/<meta[^>]*name=["']pubdate["'][^>]*content=["'](.*?)["']/i) ||
    rawHtml.match(/<time[^>]*datetime=["'](.*?)["']/i);
  const publicationDate = pubDateMatch ? pubDateMatch[1].trim() : undefined;

  const canonicalMatch =
    rawHtml.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i) ||
    rawHtml.match(/<meta[^>]*property=["']og:url["'][^>]*content=["'](.*?)["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : undefined;

  // Remove scripts, styles, noscript, etc.
  let htmlStripped = rawHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, ' ');

  // Extract structured paragraphs and headings
  const paragraphs: string[] = [];
  const paragraphRegex = /<(?:p|h1|h2|h3|h4|blockquote|li)[^>]*>(.*?)<\/(?:p|h1|h2|h3|h4|blockquote|li)>/gi;
  let match;
  while ((match = paragraphRegex.exec(htmlStripped)) !== null) {
    const text = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, '')).trim();
    if (
      text.length > 20 &&
      !text.toLowerCase().includes('cookie') &&
      !text.toLowerCase().includes('all rights reserved') &&
      !text.toLowerCase().includes('privacy policy')
    ) {
      paragraphs.push(text);
    }
  }

  let bodyText = paragraphs.join('\n\n');

  // Fallback if structured paragraph extraction yielded insufficient text
  if (bodyText.length < 100) {
    bodyText = decodeHtmlEntities(
      htmlStripped
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  const metaHeader = [
    headline ? `[TITLE]: ${headline}` : '',
    description ? `[SUMMARY]: ${description}` : '',
    author ? `[AUTHOR]: ${author}` : '',
    publicationDate ? `[DATE]: ${publicationDate}` : '',
    `[URL]: ${canonicalUrl || pageUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  let fullContent = `${metaHeader}\n\n[ARTICLE BODY]:\n${bodyText}`;

  if (fullContent.length > 15000) {
    fullContent = fullContent.substring(0, 15000) + '... [truncated]';
  }

  if (bodyText.length < 50) {
    throw new Error(
      'Unable to reliably retrieve this webpage (could not extract readable article body text). Please paste the article text in the Text tab.'
    );
  }

  return {
    url: pageUrl,
    canonicalUrl,
    headline,
    description,
    author,
    publicationDate,
    content: fullContent,
  };
}

export async function fetchArticleFromUrl(targetUrl: string): Promise<ExtractedArticle> {
  let parsedUrl: URL;
  try {
    const formattedUrl =
      targetUrl.startsWith('http://') || targetUrl.startsWith('https://')
        ? targetUrl
        : `https://${targetUrl}`;
    parsedUrl = new URL(formattedUrl);
  } catch {
    throw new Error(
      'Invalid URL format. Please enter a valid web address starting with http:// or https://'
    );
  }

  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

  // Strategy 1: Modern Native Fetch with automatic decompression, redirects, and abort signal
  if (typeof globalThis.fetch === 'function') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await globalThis.fetch(parsedUrl.href, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'Sec-Ch-Ua': '"Chromium";v="123", "Not:A-Brand";v="8", "Google Chrome";v="123"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let statusReason = `HTTP ${response.status}`;
        if (response.status === 401 || response.status === 403) {
          statusReason = `HTTP ${response.status} Access Restricted / Anti-Bot Protection`;
        } else if (response.status === 404) {
          statusReason = `HTTP 404 Page Not Found`;
        } else if (response.status === 429) {
          statusReason = `HTTP 429 Rate Limited`;
        } else if (response.status >= 500) {
          statusReason = `HTTP ${response.status} Server Error`;
        }

        throw new Error(
          `Unable to reliably retrieve this webpage (${statusReason}). Please paste the article text in the Text tab.`
        );
      }

      const rawHtml = await response.text();
      return cleanAndExtractHtml(rawHtml, response.url || parsedUrl.href);
    } catch (err: any) {
      if (
        err.message &&
        err.message.includes('Unable to reliably retrieve this webpage')
      ) {
        throw err;
      }

      if (err.name === 'AbortError') {
        throw new Error(
          `Unable to reliably retrieve this webpage (request timed out connecting to ${parsedUrl.hostname}). Please paste the article text in the Text tab.`
        );
      }

      // If fetch encountered a connection issue, proceed to HTTP/HTTPS stream fallback or throw descriptive error
      console.warn(`Fetch attempt encountered error: ${err.message}. Trying stream fallback...`);
    }
  }

  // Strategy 2: Node HTTP/HTTPS Stream Fallback with zlib decompression
  return new Promise((resolve, reject) => {
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.get(
      parsedUrl.href,
      {
        headers: {
          'User-Agent': userAgent,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        timeout: 12000,
      },
      (res) => {
        // Handle Redirects
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirectUrl = new URL(res.headers.location, parsedUrl.href).href;
          return fetchArticleFromUrl(redirectUrl).then(resolve).catch(reject);
        }

        if (res.statusCode && res.statusCode >= 400) {
          let statusReason = `HTTP ${res.statusCode}`;
          if (res.statusCode === 401 || res.statusCode === 403) {
            statusReason = `HTTP ${res.statusCode} Access Restricted / Anti-Bot Protection`;
          } else if (res.statusCode === 404) {
            statusReason = `HTTP 404 Page Not Found`;
          } else if (res.statusCode === 429) {
            statusReason = `HTTP 429 Rate Limited`;
          } else if (res.statusCode >= 500) {
            statusReason = `HTTP ${res.statusCode} Server Error`;
          }

          return reject(
            new Error(
              `Unable to reliably retrieve this webpage (${statusReason}). Please paste the article text in the Text tab.`
            )
          );
        }

        let stream: import('stream').Readable = res;
        const encoding = res.headers['content-encoding'];

        if (encoding === 'gzip') {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
          stream = res.pipe(zlib.createInflate());
        } else if (encoding === 'br') {
          stream = res.pipe(zlib.createBrotliDecompress());
        }

        let rawHtml = '';
        stream.on('data', (chunk) => {
          rawHtml += chunk.toString('utf-8');
          if (rawHtml.length > 3 * 1024 * 1024) {
            req.destroy();
          }
        });

        stream.on('end', () => {
          try {
            const article = cleanAndExtractHtml(rawHtml, parsedUrl.href);
            resolve(article);
          } catch (extractErr) {
            reject(extractErr);
          }
        });

        stream.on('error', (err) => {
          reject(
            new Error(
              `Unable to reliably retrieve this webpage (Decompression error: ${err.message}). Please paste the article text in the Text tab.`
            )
          );
        });
      }
    );

    req.on('error', (err) => {
      reject(
        new Error(
          `Unable to reliably retrieve this webpage (Network error connecting to ${parsedUrl.hostname}: ${err.message}). Please paste the article text in the Text tab.`
        )
      );
    });

    req.on('timeout', () => {
      req.destroy();
      reject(
        new Error(
          `Unable to reliably retrieve this webpage (request timed out connecting to ${parsedUrl.hostname}). Please paste the article text in the Text tab.`
        )
      );
    });
  });
}
