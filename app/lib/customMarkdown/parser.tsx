/*
  이미지 태그 사용방식
  [img:프로필사진]           // name으로 입력 → filename으로 자동 변환
  [img:프로필사진 width=300] // 속성도 사용 가능
  [img:abc123.jpg]          // 직접 filename 입력도 여전히 가능 (매칭 실패 시 그대로 사용)

  다른 태그에서도 이미지 지원
  [a_page:somepage][img:프로필사진][/a_page]
  [box][img:아이콘][/box]
  [font size=20][img:로고][/font]
 */

import React from "react";

export type ImageMapItem = {
  name: string;
  filename: string;
  filetype: string;
};

function getFilenameByName(imageMap: ImageMapItem[], targetName: string): string | null {
  const found = imageMap.find(
    (item) => item.name === targetName
  );// && item.filetype === "image"
  return found ? found.filename : null;
}

function parseFontAttrs(attrStr: string) {
  const sizeMatch = attrStr.match(/size\s*=\s*([0-9]{1,3})/i);
  const colorMatch = attrStr.match(/color\s*=\s*([^\]\s]+)/i);

  let sizePx: number | undefined = undefined;
  if (sizeMatch) {
    const n = Number(sizeMatch[1]);
    if (!Number.isNaN(n) && n > 0 && n <= 200) sizePx = n;
  }

  let color: string | undefined = undefined;
  if (colorMatch) color = colorMatch[1];

  return { sizePx, color };
}

function parseBoxAttrs(attrStr: string) {
  const pick = (key: string) =>
    attrStr.match(new RegExp(`${key}\\s*=\\s*([^\\]\\s]+)`, "i"))?.[1];

  const normalizeSize = (v?: string) => {
    if (!v) return undefined;
    if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
    return v;
  };
  const normalizePx = (v?: string) => {
    if (!v) return undefined;
    if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
    return v;
  };

  const width = normalizeSize(pick("width"));
  const height = normalizeSize(pick("height"));
  const minWidth = normalizeSize(pick("minWidth"));
  const maxWidth = normalizeSize(pick("maxWidth"));
  const minHeight = normalizeSize(pick("minHeight"));
  const maxHeight = normalizeSize(pick("maxHeight"));

  const padding = normalizePx(pick("padding"));
  const margin = normalizePx(pick("margin"));
  const marginTop = normalizePx(pick("margin-top"));
  const marginRight = normalizePx(pick("margin-right"));
  const marginBottom = normalizePx(pick("margin-bottom"));
  const marginLeft = normalizePx(pick("margin-left"));

  const borderColor = pick("border");
  const bg = pick("bg");
  const radius = normalizePx(pick("radius"));
  const display = pick("display");

  return {
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    padding,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    borderColor,
    bg,
    radius,
    display,
  };
}

function sanitizeUrl(rawUrl: string) {
  const u = rawUrl.trim();
  if (!/^https?:\/\//i.test(u)) return null;
  if (/\s/.test(u)) return null;
  return u;
}

function findMatchingCloseForBox(fullText: string, fromIndex: number) {
  const tokenRe = /\[(\/?)box\]/gi;
  tokenRe.lastIndex = fromIndex;

  let depth = 1;
  let m: RegExpExecArray | null;

  while ((m = tokenRe.exec(fullText)) !== null) {
    const isClose = m[1] === "/";
    depth = isClose ? depth - 1 : depth + 1;

    if (depth === 0) {
      const closeStart = m.index;
      const closeEnd = tokenRe.lastIndex;
      return { closeStart, closeEnd };
    }
  }
  return null;
}

export type ParseOptions = {
  aoutClassName?: string;
};

export function parseCustomMarkdown(src: string, imageMap: ImageMapItem[] = [], opts: ParseOptions = {}): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let text = src;

  const pushTextWithEnt = (s: string) => {
    const parts = s.split(/(\[ent\s*\/?\]|\[space:\d+\])/gi);

    parts.forEach((part, idx) => {
      if (/^\[ent\s*\/?\]$/i.test(part)) {
        nodes.push(<br key={`ent-${nodes.length}-${idx}`} />);
        return;
      }

      const spaceMatch = part.match(/^\[space:(\d+)\]$/i);
      if (spaceMatch) {
        const count = Math.min(Number(spaceMatch[1]), 100);
        nodes.push(
          <span
            key={`space-${nodes.length}-${idx}`}
            dangerouslySetInnerHTML={{ __html: "&nbsp;".repeat(count) }}
          />
        );
        return;
      }

      if (part.length > 0) {
        nodes.push(<React.Fragment key={`t-${nodes.length}-${idx}`}>{part}</React.Fragment>);
      }
    });
  };

  const nextMatch = () => {
    const boxOpenRe = /\[box([^\]]*)\]/i;
    const fontOpenRe = /\[font([^\]]*)\]/i;
    const commentOpenRe = /\[comment([^\]]*)\]/i;
    const a_pageOpenRe = /\[a_page:([^\]]+)\]/i;
    const a_pagevpdOpenRe = /\[a_pagevpd:([^\]]+)\]/i;
    const imgOpenRe = /\[img:([^\]\s]+)([^\]]*)\]/i;
    const aoutOpenRe = /\[aout:([^\]]+)\]/i;
    const fileOpenRe = /\[file:([^\]]+)\]/i;

    const boxIndex = text.search(boxOpenRe);
    const fontIndex = text.search(fontOpenRe);
    const commentIndex = text.search(commentOpenRe);
    const a_pageIndex = text.search(a_pageOpenRe);
    const a_pagevpdIndex = text.search(a_pagevpdOpenRe);
    const imgIndex = text.search(imgOpenRe);
    const aoutIndex = text.search(aoutOpenRe);
    const fileIndex = text.search(fileOpenRe);

    if (boxIndex === -1 && fontIndex === -1 && commentIndex === -1 && a_pageIndex === -1 && a_pagevpdIndex === -1 && imgIndex === -1 && aoutIndex === -1 && fileIndex === -1) return null;

    const candidates = [
      { type: "box" as const, index: boxIndex },
      { type: "font" as const, index: fontIndex },
      { type: "comment" as const, index: commentIndex },
      { type: "a_page" as const, index: a_pageIndex },
      { type: "a_pagevpd" as const, index: a_pagevpdIndex },
      { type: "img" as const, index: imgIndex },
      { type: "aout" as const, index: aoutIndex },
      { type: "file" as const, index: fileIndex },
    ].filter((v) => v.index !== -1);

    candidates.sort((a, b) => a.index - b.index);
    const next = candidates[0];

    if (next.type === "aout") {
      const open = text.match(aoutOpenRe)!;
      const start = open.index ?? 0;
      const url = open[1] ?? "";
      const afterOpen = start + open[0].length;

      const closeMatch = text.slice(afterOpen).match(/\[\/aout\]/i);
      if (!closeMatch) return null;

      const insideStart = afterOpen;
      const insideEnd = afterOpen + (closeMatch.index ?? 0);

      return {
        type: "aout" as const,
        before: text.slice(0, start),
        inside: text.slice(insideStart, insideEnd),
        after: text.slice(insideEnd + closeMatch[0].length),
        url,
      };
    }

    if (next.type === "a_page") {
      const open = text.match(a_pageOpenRe)!;
      const start = open.index ?? 0;
      const url = open[1] ?? "";
      const afterOpen = start + open[0].length;

      const closeMatch = text.slice(afterOpen).match(/\[\/a_page\]/i);
      if (!closeMatch) return null;

      const insideStart = afterOpen;
      const insideEnd = afterOpen + (closeMatch.index ?? 0);

      return {
        type: "a_page" as const,
        before: text.slice(0, start),
        inside: text.slice(insideStart, insideEnd),
        after: text.slice(insideEnd + closeMatch[0].length),
        url,
      };
    }

    if (next.type === "a_pagevpd") {
      const open = text.match(a_pagevpdOpenRe)!;
      const start = open.index ?? 0;
      const url = open[1] ?? "";
      const afterOpen = start + open[0].length;

      const closeMatch = text.slice(afterOpen).match(/\[\/a_pagevpd\]/i);
      if (!closeMatch) return null;

      const insideStart = afterOpen;
      const insideEnd = afterOpen + (closeMatch.index ?? 0);

      return {
        type: "a_pagevpd" as const,
        before: text.slice(0, start),
        inside: text.slice(insideStart, insideEnd),
        after: text.slice(insideEnd + closeMatch[0].length),
        url,
      };
    }

    if (next.type === "img") {
      const open = text.match(imgOpenRe)!;
      const start = open.index ?? 0;
      const url = open[1] ?? "";
      const afterOpen = start + open[0].length;
      const attrs = open[2] ?? "";

      return {
        type: "img" as const,
        before: text.slice(0, start),
        after: text.slice(afterOpen),
        url,
        attrs,
      };
    }

    if (next.type === "file") {
      const open = text.match(fileOpenRe)!;
      const start = open.index ?? 0;
      const url = open[1] ?? "";
      const afterOpen = start + open[0].length;
      const attrs = open[2] ?? "";

      return {
        type: "file" as const,
        before: text.slice(0, start),
        after: text.slice(afterOpen),
        url,
        attrs,
      };
    }

    if (next.type === "box") {
      const open = text.match(boxOpenRe)!;
      const start = open.index ?? 0;
      const attrs = open[1] ?? "";
      const afterOpen = start + open[0].length;

      const match = findMatchingCloseForBox(text, afterOpen);
      if (!match) return null;

      return {
        type: "box" as const,
        before: text.slice(0, start),
        inside: text.slice(afterOpen, match.closeStart),
        after: text.slice(match.closeEnd),
        attrs,
      };
    }

    if (next.type === "font") {
      const open = text.match(fontOpenRe)!;
      const start = open.index ?? 0;
      const attrs = open[1] ?? "";
      const afterOpen = start + open[0].length;

      const closeMatch = text.slice(afterOpen).match(/\[\/font\]/i);
      if (!closeMatch) return null;

      const insideEnd = afterOpen + (closeMatch.index ?? 0);

      return {
        type: "font" as const,
        before: text.slice(0, start),
        inside: text.slice(afterOpen, insideEnd),
        after: text.slice(insideEnd + closeMatch[0].length),
        attrs,
      };
    }

    // comment
    const open = text.match(commentOpenRe)!;
    const start = open.index ?? 0;
    const attrs = open[1] ?? "";
    const afterOpen = start + open[0].length;

    const closeMatch = text.slice(afterOpen).match(/\[\/comment\]/i);
    if (!closeMatch) return null;

    const insideEnd = afterOpen + (closeMatch.index ?? 0);

    return {
      type: "comment" as const,
      before: text.slice(0, start),
      inside: text.slice(afterOpen, insideEnd),
      after: text.slice(insideEnd + closeMatch[0].length),
      attrs,
    };
  };

  while (true) {
    const m = nextMatch();
    if (!m) {
      if (text.length > 0) pushTextWithEnt(text);
      break;
    }

    if (m.before.length > 0) pushTextWithEnt(m.before);

    if (m.type === "comment") {
      text = m.after;
      continue;
    }

    if (m.type === "a_page") {
      const newurl = "/web/wpage/viewpage/"+m.url;
      if (newurl) {
        nodes.push(
          <a
            key={`a_page-${nodes.length}`}
            href={newurl}
            rel="noopener noreferrer"
            //className={opts.a_pageClassName}
            style={{
              color:"inherit",
              textDecorationLine:"underline",
              textDecorationStyle:"solid",
            }}
          >
            {parseCustomMarkdown(m.inside, imageMap, opts)}
          </a>
        );
      } else {
        nodes.push(<React.Fragment key={`a_page-bad-${nodes.length}`}>{parseCustomMarkdown(m.inside, imageMap, opts)}</React.Fragment>);
      }
      text = m.after;
      continue;
    }

    if (m.type === "a_pagevpd") {
      const newurl = "/web/wpage/vpd/"+m.url;
      if (newurl) {
        nodes.push(
          <a
            key={`a_pagevpd-${nodes.length}`}
            href={newurl}
            rel="noopener noreferrer"
            style={{
              color:"inherit",
              textDecorationLine:"underline",
              textDecorationStyle:"solid",
            }}
          >
            {parseCustomMarkdown(m.inside, imageMap, opts)}
          </a>
        );
      } else {
        nodes.push(<React.Fragment key={`a_pagevpd-bad-${nodes.length}`}>{parseCustomMarkdown(m.inside, imageMap, opts)}</React.Fragment>);
      }
      text = m.after;
      continue;
    }

    if (m.type === "img") {
      const backendmediaurl = `${process.env.NEXT_PUBLIC_MEDIA}/`;
      const filename = getFilenameByName(imageMap, m.url) || m.url;
      const newurl = backendmediaurl + filename;
      const mediaBox = parseBoxAttrs(m.attrs || "");
      nodes.push(
        <img
          key={`img-${nodes.length}`}
          src={newurl}
          alt=""
          style={{
            width: mediaBox.width,
            height: mediaBox.height,
            maxWidth: "100%",
          }}
        />
      );
      text = m.after;
      continue;
    }

    if (m.type === "file") {
      const backendmediaurl = `${process.env.NEXT_PUBLIC_MEDIA}/`;
      const filename = getFilenameByName(imageMap, m.url) || m.url;
      const newurl = backendmediaurl + filename;
      const mediaBox = parseBoxAttrs(m.attrs || "");
      nodes.push(
        <a
          key={`file-${nodes.length}`}
          href={newurl}
          target="_blank"
        >{m.url}</a>
      );
      text = m.after;
      continue;
    }

    if (m.type === "aout") {
      const safe = sanitizeUrl(m.url);
      if (safe) {
        nodes.push(
          <a
            key={`aout-${nodes.length}`}
            href={safe}
            target="_blank"
            rel="noopener noreferrer"
            className={opts?.aoutClassName}
            style= {{
              textDecoration: "none", /* 밑줄 제거 */
              color: "inherit"         /* 파란색 대신 부모 요소의 글자색을 그대로 상속 */
            }}
          >
            {parseCustomMarkdown(m.inside, imageMap, opts)}
          </a>
        );
      } else {
        nodes.push(<React.Fragment key={`aout-bad-${nodes.length}`}>{parseCustomMarkdown(m.inside, imageMap, opts)}</React.Fragment>);
      }
      text = m.after;
      continue;
    }

    if (m.type === "box") {
      const box = parseBoxAttrs(m.attrs || "");
      nodes.push(
        <div
          key={`box-${nodes.length}`}
          style={{
            boxSizing: "border-box",
            border: `1px solid ${box.borderColor ?? "#000"}`,
            borderRadius: box.radius ?? "6px",
            padding: box.padding ?? "12px",
            margin: box.margin ?? "0",
            marginTop: box.marginTop,
            marginRight: box.marginRight,
            marginBottom: box.marginBottom,
            marginLeft: box.marginLeft,
            background: box.bg ?? "#fff",
            display: (box.display as any) ?? "inline-block",
            width: box.width,
            height: box.height,
            minWidth: box.minWidth,
            maxWidth: box.maxWidth,
            minHeight: box.minHeight,
            maxHeight: box.maxHeight,
          }}
        >
          {parseCustomMarkdown(m.inside, imageMap, opts)}
        </div>
      );
      text = m.after;
      continue;
    }

    // font
    const { sizePx, color } = parseFontAttrs(m.attrs || "");
    nodes.push(
      <span
        key={`font-${nodes.length}`}
        style={{
          fontSize: sizePx ? `${sizePx}px` : undefined,
          color: color || undefined,
          lineHeight: 1.5,
        }}
      >
        {parseCustomMarkdown(m.inside, imageMap, opts)}
      </span>
    );
    text = m.after;
  }

  return nodes;
}
