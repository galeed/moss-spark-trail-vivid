import { Check } from "lucide-react";
import { Fragment, type ReactNode } from "react";

type Key = { n: number };

function safeHref(raw: string): string | null {
  const url = raw.trim();
  if (!/^(https?:|mailto:)/i.test(url)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:") {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}

function parseInline(text: string, key: Key): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        out.push(
          <code key={key.n++} className="folio-code">
            {text.slice(i + 1, end)}
          </code>,
        );
        i = end + 1;
        continue;
      }
    }

    if (text.startsWith("**", i) || text.startsWith("__", i)) {
      const marker = text.slice(i, i + 2);
      const end = text.indexOf(marker, i + 2);
      if (end !== -1) {
        out.push(
          <strong key={key.n++}>{parseInline(text.slice(i + 2, end), key)}</strong>,
        );
        i = end + 2;
        continue;
      }
    }

    if (text.startsWith("~~", i)) {
      const end = text.indexOf("~~", i + 2);
      if (end !== -1) {
        out.push(<del key={key.n++}>{parseInline(text.slice(i + 2, end), key)}</del>);
        i = end + 2;
        continue;
      }
    }

    if (text[i] === "*" || text[i] === "_") {
      const marker = text[i] ?? "";
      const prev = i > 0 ? (text[i - 1] ?? "") : "";
      const boundary = marker !== "_" || !/\w/.test(prev);
      const end = text.indexOf(marker, i + 1);
      if (
        boundary &&
        end > i + 1 &&
        text[i + 1] !== " " &&
        text[end - 1] !== " " &&
        !(marker === "*" && text[end + 1] === "*")
      ) {
        out.push(<em key={key.n++}>{parseInline(text.slice(i + 1, end), key)}</em>);
        i = end + 1;
        continue;
      }
    }

    if (text[i] === "[") {
      const close = text.indexOf("]", i + 1);
      if (close !== -1 && text[close + 1] === "(") {
        const endParen = text.indexOf(")", close + 2);
        if (endParen !== -1) {
          const href = safeHref(text.slice(close + 2, endParen));
          if (href) {
            const label = text.slice(i + 1, close);
            out.push(
              <a
                key={key.n++}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {parseInline(label, key)}
              </a>,
            );
            i = endParen + 1;
            continue;
          }
        }
      }
    }

    let j = i + 1;
    while (j < text.length && !"`*_~[".includes(text[j] ?? "")) j += 1;
    out.push(text.slice(i, j));
    i = j;
  }

  return out;
}

function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    const key = { n: 0 };
    return (
      <Fragment key={index}>
        {index > 0 && <br />}
        {parseInline(line, key)}
      </Fragment>
    );
  });
}

type ListItem = { text: string; checked?: boolean };

type Block =
  | { type: "h"; level: number; text: string }
  | { type: "p"; text: string }
  | { type: "code"; lang: string; text: string }
  | { type: "ul"; items: ListItem[] }
  | { type: "ol"; items: string[]; start: number }
  | { type: "quote"; text: string }
  | { type: "hr" };

function isBlockStart(line: string): boolean {
  return (
    /^```/.test(line) ||
    /^#{1,6}\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)
  );
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i] ?? "")) {
        buf.push(lines[i] ?? "");
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", lang, text: buf.join("\n") });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ type: "h", level: heading[1]?.length ?? 1, text: heading[2] ?? "" });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i] ?? "")) {
        buf.push((lines[i] ?? "").replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", text: buf.join("\n") });
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: ListItem[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i] ?? "")) {
        const raw = (lines[i] ?? "").replace(/^\s*[-*+]\s+/, "");
        const task = /^\[( |x|X)\]\s*(.*)$/.exec(raw);
        if (task) items.push({ text: task[2] ?? "", checked: (task[1] ?? "").toLowerCase() === "x" });
        else items.push({ text: raw });
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const startMatch = /^\s*(\d+)/.exec(line);
      const start = startMatch ? Number(startMatch[1]) : 1;
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*\d+[.)]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items, start });
      continue;
    }

    const buf = [line];
    i += 1;
    while (i < lines.length && (lines[i] ?? "").trim() !== "" && !isBlockStart(lines[i] ?? "")) {
      buf.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push({ type: "p", text: buf.join("\n") });
  }

  return blocks;
}

function Heading({ level, text }: { level: number; text: string }) {
  const content = <RichText text={text} />;
  if (level <= 1) return <h2>{content}</h2>;
  if (level === 2) return <h3>{content}</h3>;
  return <h4>{content}</h4>;
}

export function MarkdownView({ source }: { source: string }) {
  if (!source.trim()) {
    return <p className="folio-empty">Nada que previsualizar.</p>;
  }

  const blocks = parseBlocks(source);
  return (
    <div className="md">
      {blocks.map((block, index) => {
        if (block.type === "h") return <Heading key={index} level={block.level} text={block.text} />;
        if (block.type === "p") {
          return (
            <p key={index}>
              <RichText text={block.text} />
            </p>
          );
        }
        if (block.type === "hr") return <hr key={index} />;
        if (block.type === "quote") {
          return (
            <blockquote key={index}>
              <RichText text={block.text} />
            </blockquote>
          );
        }
        if (block.type === "code") {
          const lang = /^[\w.+#-]+$/.test(block.lang) ? block.lang : "";
          return (
            <figure key={index}>
              {lang ? <figcaption>{lang}</figcaption> : null}
              <pre>
                <code>{block.text}</code>
              </pre>
            </figure>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={index} start={block.start}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <RichText text={item} />
                </li>
              ))}
            </ol>
          );
        }
        const tasks = block.items.some((item) => item.checked !== undefined);
        return (
          <ul key={index} className={tasks ? "tasks" : undefined}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {tasks ? (
                  <span
                    className={item.checked ? "tick on" : "tick"}
                    aria-hidden="true"
                  >
                    {item.checked ? <Check strokeWidth={2.5} /> : null}
                  </span>
                ) : null}
                <span className={item.checked ? "done" : undefined}>
                  <RichText text={item.text} />
                </span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
