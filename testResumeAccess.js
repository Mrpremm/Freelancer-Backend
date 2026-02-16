const https = require('https');

const originalUrl = 'https://res.cloudinary.com/db3klmc7d/image/upload/v1771259932/freelance-marketplace/resumes/resume-698b363d242940d2af26d329-1771259930155.pdf';
const genericUrl = originalUrl.replace('/image/upload/', '/upload/');
const fs = require('fs');

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync('resume_access_log.txt', msg + '\n');
};

const checkUrl = (url, type) => {
  https.get(url, (res) => {
    log(`${type} URL (${url}): Status Code ${res.statusCode}`);
  }).on('error', (e) => {
    log(`${type} URL Error: ${e.message}`);
  });
};

fs.writeFileSync('resume_access_log.txt', 'Starting Test 2\n');
checkUrl(genericUrl, 'Generic (Upload)');
