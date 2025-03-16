const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");
// or
// import {NotionToMarkdown} from "notion-to-md";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// 이미지 다운로드 및 저장 함수
async function downloadAndSaveImage(imageUrl, postPath) {
  try {
    // 이미지 해시 생성
    const imageHash = crypto
      .createHash('md5')
      .update(imageUrl)
      .digest('hex')
      .substring(0, 8);

    // 이미지 확장자 추출 또는 기본값 설정
    const imageExt = path.extname(new URL(imageUrl).pathname) || '.jpg';
    
    // 이미지 저장 경로 설정
    const imageDirPath = path.join('assets', 'images', 'posts', postPath);
    const imageFileName = `${imageHash}${imageExt}`;
    const imagePath = path.join(imageDirPath, imageFileName);
    
    // 이미지가 이미 존재하는지 확인
    if (fs.existsSync(imagePath)) {
      return `/assets/images/posts/${postPath}/${imageFileName}`;
    }

    // 디렉토리 생성
    fs.mkdirSync(imageDirPath, { recursive: true });

    // 이미지 다운로드
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream',
      timeout: 5000
    });

    // 이미지 저장
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return `/assets/images/posts/${postPath}/${imageFileName}`;
  } catch (error) {
    console.error(`이미지 다운로드 실패: ${imageUrl}`, error);
    return '/assets/images/default-image.jpg';
  }
}

function escapeCodeBlock(body) {
  const regex = /```([\s\S]*?)```/g;
  return body.replace(regex, function (match, htmlBlock) {
    return "\n{% raw %}\n```" + htmlBlock.trim() + "\n```\n{% endraw %}\n";
  });
}

function replaceTitleOutsideRawBlocks(body) {
  const rawBlocks = [];
  const placeholder = "%%RAW_BLOCK%%";
  body = body.replace(/{% raw %}[\s\S]*?{% endraw %}/g, (match) => {
    rawBlocks.push(match);
    return placeholder;
  });

  const regex = /\n#[^\n]+\n/g;
  body = body.replace(regex, function (match) {
    return "\n" + match.replace("\n#", "\n##");
  });

  rawBlocks.forEach(block => {
    body = body.replace(placeholder, block);
  });

  return body;
}

// Notion 클라이언트를 옵션에 전달
const n2m = new NotionToMarkdown({ notionClient: notion });

(async () => {
  // 디렉토리가 존재하는지 확인
  const root = "_posts";
  fs.mkdirSync(root, { recursive: true });

  const databaseId = process.env.DATABASE_ID;
  let response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "공개",
      checkbox: {
        equals: true,
      },
    },
  });

  const pages = response.results;
  while (response.has_more) { //페이지가 더 이상 받아올 수 없을 떄까지 반복
    const nextCursor = response.next_cursor; // 커서 변경 -> 이전에 받은 결과물 이후부터 받겠다고 전달
    response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: nextCursor,
      filter: {
        property: "공개",
        checkbox: {
          equals: true,
        },
      },
    });
    pages.push(...response.results); // 이전 결과와 병합
  }

  for (const r of pages) {
    const id = r.id;
    // date
    let date = moment(r.created_time).format("YYYY-MM-DD");
    let pdate = r.properties?.["날짜"]?.["date"]?.["start"];
    if (pdate) {
      date = moment(pdate).format("YYYY-MM-DD");
    }
    // title
    let title = id;
    let ptitle = r.properties?.["게시물"]?.["title"];
    if (ptitle?.length > 0) {
      title = ptitle[0]?.["plain_text"];
    }
    // tags
    let tags = [];
    let ptags = r.properties?.["태그"]?.["multi_select"];
    for (const t of ptags) {
      const n = t?.["name"];
      if (n) {
        tags.push(n);
      }
    }
    // categories
    let cats = [];
    let pcats = r.properties?.["카테고리"]?.["multi_select"];
    for (const t of pcats) {
      const n = t?.["name"];
      if (n) {
        cats.push(n);
      }
    }

    // frontmatter
    let fmtags = "";
    let fmcats = "";
    if (tags.length > 0) {
      fmtags += "\ntags: [";
      for (const t of tags) {
        fmtags += t + ", ";
      }
      fmtags += "]";
    }
    if (cats.length > 0) {
      fmcats += "\ncategories: [";
      for (const t of cats) {
        fmcats += t + ", ";
      }
      fmcats += "]";
    }
    const fm = `---
layout: post
date: ${date}
title: "${title}"${fmtags}${fmcats}
---

`;
    const mdblocks = await n2m.pageToMarkdown(id);
    let md = n2m.toMarkdownString(mdblocks)["parent"];
    if (md === "") {
      continue;
    }
    md = escapeCodeBlock(md);
    md = replaceTitleOutsideRawBlocks(md);

    const ftitle = `${date}-${title.replaceAll(" ", "-")}`;
    const postPath = ftitle.replace('.md', '');

    // 이미지 처리 로직 수정
    let edited_md = md;
    const imagePattern = /!\[(.*?)\]\((.*?)\)/g;
    const matches = [...md.matchAll(imagePattern)];
    
    for (const match of matches) {
      const [fullMatch, altText, imageUrl] = match;
      const localImagePath = await downloadAndSaveImage(imageUrl, postPath);
      edited_md = edited_md.replace(
        fullMatch,
        `![${altText}](${localImagePath})`
      );
    }

    // 파일 저장
    fs.writeFile(path.join(root, `${ftitle}.md`), fm + edited_md, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
})();