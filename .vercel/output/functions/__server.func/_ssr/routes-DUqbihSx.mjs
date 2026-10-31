import { i as __toESM } from "../_runtime.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as DialogContent, f as DialogDescription, g as Slot, h as DialogTitle, i as AlertDialogContent, l as Dialog, m as DialogPortal, n as AlertDialogAction, o as AlertDialogOverlay, p as DialogOverlay, r as AlertDialogCancel, s as AlertDialogPortal, t as AlertDialog, u as DialogClose, v as require_jsx_runtime, y as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as Plus, c as Keyboard, d as Check, i as Search, l as Eye, o as PenLine, r as Trash2, s as PanelLeft, t as X, u as Columns2 } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DUqbihSx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			primary: "bg-ink text-paper hover:opacity-90",
			ghost: "bg-transparent text-ink hover:bg-paper-deep",
			danger: "bg-danger text-paper hover:opacity-90"
		},
		size: {
			md: "h-11 px-3 text-sm",
			icon: "size-11 shrink-0"
		}
	},
	defaultVariants: {
		variant: "ghost",
		size: "md"
	}
});
function Button({ asChild = false, className, variant, size, type, ...props }) {
	const Comp = asChild ? Slot : "button";
	if (asChild) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, {
		type: type ?? "button",
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function safeHref(raw) {
	const url = raw.trim();
	if (!/^(https?:|mailto:)/i.test(url)) return null;
	try {
		const parsed = new URL(url);
		if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:") return url;
	} catch {
		return null;
	}
	return null;
}
function parseInline(text, key) {
	const out = [];
	let i = 0;
	while (i < text.length) {
		if (text[i] === "`") {
			const end = text.indexOf("`", i + 1);
			if (end !== -1) {
				out.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "folio-code",
					children: text.slice(i + 1, end)
				}, key.n++));
				i = end + 1;
				continue;
			}
		}
		if (text.startsWith("**", i) || text.startsWith("__", i)) {
			const marker = text.slice(i, i + 2);
			const end = text.indexOf(marker, i + 2);
			if (end !== -1) {
				out.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parseInline(text.slice(i + 2, end), key) }, key.n++));
				i = end + 2;
				continue;
			}
		}
		if (text.startsWith("~~", i)) {
			const end = text.indexOf("~~", i + 2);
			if (end !== -1) {
				out.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("del", { children: parseInline(text.slice(i + 2, end), key) }, key.n++));
				i = end + 2;
				continue;
			}
		}
		if (text[i] === "*" || text[i] === "_") {
			const marker = text[i] ?? "";
			const prev = i > 0 ? text[i - 1] ?? "" : "";
			const boundary = marker !== "_" || !/\w/.test(prev);
			const end = text.indexOf(marker, i + 1);
			if (boundary && end > i + 1 && text[i + 1] !== " " && text[end - 1] !== " " && !(marker === "*" && text[end + 1] === "*")) {
				out.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: parseInline(text.slice(i + 1, end), key) }, key.n++));
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
						out.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href,
							target: "_blank",
							rel: "noreferrer noopener",
							children: parseInline(label, key)
						}, key.n++));
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
function RichText({ text }) {
	return text.split("\n").map((line, index) => {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [index > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}), parseInline(line, { n: 0 })] }, index);
	});
}
function isBlockStart(line) {
	return /^```/.test(line) || /^#{1,6}\s+/.test(line) || /^>\s?/.test(line) || /^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line) || /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line);
}
function parseBlocks(source) {
	const lines = source.replace(/\r\n/g, "\n").split("\n");
	const blocks = [];
	let i = 0;
	while (i < lines.length) {
		const line = lines[i] ?? "";
		if (line.trim() === "") {
			i += 1;
			continue;
		}
		if (/^```/.test(line)) {
			const lang = line.slice(3).trim();
			const buf = [];
			i += 1;
			while (i < lines.length && !/^```/.test(lines[i] ?? "")) {
				buf.push(lines[i] ?? "");
				i += 1;
			}
			if (i < lines.length) i += 1;
			blocks.push({
				type: "code",
				lang,
				text: buf.join("\n")
			});
			continue;
		}
		if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
			blocks.push({ type: "hr" });
			i += 1;
			continue;
		}
		const heading = /^(#{1,6})\s+(.*)$/.exec(line);
		if (heading) {
			blocks.push({
				type: "h",
				level: heading[1]?.length ?? 1,
				text: heading[2] ?? ""
			});
			i += 1;
			continue;
		}
		if (/^>\s?/.test(line)) {
			const buf = [];
			while (i < lines.length && /^>\s?/.test(lines[i] ?? "")) {
				buf.push((lines[i] ?? "").replace(/^>\s?/, ""));
				i += 1;
			}
			blocks.push({
				type: "quote",
				text: buf.join("\n")
			});
			continue;
		}
		if (/^\s*[-*+]\s+/.test(line)) {
			const items = [];
			while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i] ?? "")) {
				const raw = (lines[i] ?? "").replace(/^\s*[-*+]\s+/, "");
				const task = /^\[( |x|X)\]\s*(.*)$/.exec(raw);
				if (task) items.push({
					text: task[2] ?? "",
					checked: (task[1] ?? "").toLowerCase() === "x"
				});
				else items.push({ text: raw });
				i += 1;
			}
			blocks.push({
				type: "ul",
				items
			});
			continue;
		}
		if (/^\s*\d+[.)]\s+/.test(line)) {
			const startMatch = /^\s*(\d+)/.exec(line);
			const start = startMatch ? Number(startMatch[1]) : 1;
			const items = [];
			while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i] ?? "")) {
				items.push((lines[i] ?? "").replace(/^\s*\d+[.)]\s+/, ""));
				i += 1;
			}
			blocks.push({
				type: "ol",
				items,
				start
			});
			continue;
		}
		const buf = [line];
		i += 1;
		while (i < lines.length && (lines[i] ?? "").trim() !== "" && !isBlockStart(lines[i] ?? "")) {
			buf.push(lines[i] ?? "");
			i += 1;
		}
		blocks.push({
			type: "p",
			text: buf.join("\n")
		});
	}
	return blocks;
}
function Heading({ level, text }) {
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichText, { text });
	if (level <= 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: content });
	if (level === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: content });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: content });
}
function MarkdownView({ source }) {
	if (!source.trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "folio-empty",
		children: "Nada que previsualizar."
	});
	const blocks = parseBlocks(source);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "md",
		children: blocks.map((block, index) => {
			if (block.type === "h") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, {
				level: block.level,
				text: block.text
			}, index);
			if (block.type === "p") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichText, { text: block.text }) }, index);
			if (block.type === "hr") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", {}, index);
			if (block.type === "quote") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichText, { text: block.text }) }, index);
			if (block.type === "code") {
				const lang = /^[\w.+#-]+$/.test(block.lang) ? block.lang : "";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [lang ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: lang }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: block.text }) })] }, index);
			}
			if (block.type === "ol") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				start: block.start,
				children: block.items.map((item, itemIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichText, { text: item }) }, itemIndex))
			}, index);
			const tasks = block.items.some((item) => item.checked !== void 0);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: tasks ? "tasks" : void 0,
				children: block.items.map((item, itemIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [tasks ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: item.checked ? "tick on" : "tick",
					"aria-hidden": "true",
					children: item.checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { strokeWidth: 2.5 }) : null
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: item.checked ? "done" : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichText, { text: item.text })
				})] }, itemIndex))
			}, index);
		})
	});
}
var SAVE_MS = 320;
function EditorPane({ note, mode, autoFocus, onLive, onSave, onAutoFocused }) {
	const [body, setBody] = (0, import_react.useState)(note.body);
	const saved = (0, import_react.useRef)(note.body);
	const pending = (0, import_react.useRef)(null);
	const timer = (0, import_react.useRef)(null);
	const areaRef = (0, import_react.useRef)(null);
	const onSaveRef = (0, import_react.useRef)(onSave);
	const didFocus = (0, import_react.useRef)(false);
	onSaveRef.current = onSave;
	(0, import_react.useEffect)(() => {
		if (!autoFocus || didFocus.current) return;
		didFocus.current = true;
		const area = areaRef.current;
		area?.focus();
		const length = area?.value.length ?? 0;
		area?.setSelectionRange(length, length);
		onAutoFocused();
	}, [autoFocus, onAutoFocused]);
	(0, import_react.useEffect)(() => {
		const flush = () => {
			if (timer.current) {
				window.clearTimeout(timer.current);
				timer.current = null;
			}
			const next = pending.current;
			if (next == null || next === saved.current) return;
			pending.current = null;
			saved.current = next;
			onSaveRef.current(note.id, next);
		};
		const onHide = () => {
			if (document.visibilityState === "hidden") flush();
		};
		document.addEventListener("visibilitychange", onHide);
		window.addEventListener("pagehide", onHide);
		return () => {
			document.removeEventListener("visibilitychange", onHide);
			window.removeEventListener("pagehide", onHide);
			flush();
		};
	}, [note.id]);
	function commitSoon(next) {
		pending.current = next;
		if (timer.current) window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => {
			timer.current = null;
			const value = pending.current;
			if (value == null || value === saved.current) return;
			pending.current = null;
			saved.current = value;
			onSaveRef.current(note.id, value);
		}, SAVE_MS);
	}
	const showEditor = mode !== "preview";
	const showPreview = mode === "preview" || mode === "split";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "contenido",
		className: cn("flex min-h-0 min-w-0 flex-1", mode === "split" && "flex-col md:flex-row"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: cn("flex min-h-0 min-w-0 flex-1 flex-col", !showEditor && "hidden"),
			"aria-label": "Editor",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mx-auto flex min-h-0 w-full flex-1 flex-col px-5 py-8 md:px-10 md:py-10", mode !== "split" && "max-w-2xl"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "nota-editor",
					ref: areaRef,
					className: "folio-editor",
					value: body,
					placeholder: "Escribe en markdown. La primera línea será el título.",
					"aria-label": "Nota",
					spellCheck: true,
					autoCapitalize: "sentences",
					onChange: (event) => {
						const next = event.target.value;
						setBody(next);
						onLive(next);
						commitSoon(next);
					}
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: cn("min-h-0 min-w-0 flex-1 overflow-y-auto", mode === "write" && "hidden", mode === "split" && "hidden border-line md:block md:border-l", !showPreview && "hidden"),
			"aria-label": "Vista previa",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mx-auto w-full px-5 py-8 md:px-10 md:py-10", mode !== "split" && "max-w-2xl"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownView, { source: body })
			})
		})]
	});
}
var WELCOME = `# Bienvenido a Folio

Un cuaderno para escribir en markdown. Las notas viven en este navegador: no hay cuenta ni servidor.

La **primera línea** es el título. El resto puede ser una lista, una cita o una idea a medias.

- **Nueva nota** abre una hoja en blanco
- La **búsqueda** filtra al instante
- La **vista previa** compone el markdown

> Escribe poco y con calma. Lo demás es ruido.

La sintaxis es [markdown](https://es.wikipedia.org/wiki/Markdown).`;
var FIELD = `# Lista de campo

Cosas para no olvidar cuando baje la luz.

- [x] Afilar el lápiz
- [ ] Anotar lo que se oyó en la calle
- [ ] Dejar una línea en blanco entre ideas

\`\`\`
folio guarda solo el texto
\`\`\`
`;
function createSeedNotes(now = Date.now()) {
	return [{
		id: "welcome",
		body: WELCOME,
		createdAt: now - 936e5,
		updatedAt: now - 27e5
	}, {
		id: "campo",
		body: FIELD,
		createdAt: now - 18e7,
		updatedAt: now - 936e5
	}];
}
function noteTitle(body) {
	const line = body.split(/\r?\n/).find((entry) => entry.trim().length > 0);
	if (!line) return "Sin título";
	return line.replace(/^#{1,6}\s+/, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`~]/g, "").trim() || "Sin título";
}
function noteExcerpt(body) {
	const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
	if (lines.length < 2) return "";
	return lines.slice(1, 4).join(" ").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`~>#|[\]-]/g, "").replace(/\s+/g, " ").trim();
}
function wordCount(body) {
	const text = body.trim();
	if (!text) return 0;
	return text.split(/\s+/).length;
}
function wordsLabel(count) {
	return count === 1 ? "1 palabra" : `${count} palabras`;
}
function notesLabel(count) {
	return count === 1 ? "1 nota" : `${count} notas`;
}
function normalizeSearch(value) {
	return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
function formatEdited(ts, now) {
	const delta = Math.max(0, now - ts);
	const minutes = Math.floor(delta / 6e4);
	if (minutes < 1) return "ahora";
	if (minutes < 60) return `hace ${minutes} min`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `hace ${hours} h`;
	const days = Math.floor(hours / 24);
	if (days === 1) return "ayer";
	if (days < 7) return `hace ${days} días`;
	return new Intl.DateTimeFormat("es", {
		day: "numeric",
		month: "short"
	}).format(ts);
}
function sortNotes(notes) {
	return [...notes].sort((a, b) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt);
}
function Sidebar({ notes, filtered, total, activeId, query, now, open, searchRef, closeRef, onQuery, onSelect, onCreate, onClose, onHelp }) {
	function move(from, delta) {
		if (!filtered.length) return;
		const index = filtered.findIndex((note) => note.id === from);
		const next = filtered[index < 0 ? delta > 0 ? 0 : filtered.length - 1 : Math.min(filtered.length - 1, Math.max(0, index + delta))];
		if (!next) return;
		onSelect(next.id, false);
		document.getElementById(`note-${next.id}`)?.focus();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		id: "sidebar",
		className: open ? "folio-sidebar is-open" : "folio-sidebar",
		"aria-label": "Notas",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pad-safe-t shrink-0 px-3 pt-4 pb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-2xl tracking-tight text-ink",
							children: "Folio"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							ref: closeRef,
							size: "icon",
							className: "md:hidden",
							"aria-label": "Cerrar lista",
							onClick: onClose,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								className: "size-4",
								strokeWidth: 1.75,
								"aria-hidden": true
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "primary",
						className: "mt-3 w-full",
						onClick: onCreate,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "size-4",
							strokeWidth: 1.75,
							"aria-hidden": true
						}), "Nueva nota"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: searchRef,
								className: "folio-search",
								type: "text",
								role: "searchbox",
								"aria-label": "Buscar notas",
								placeholder: "Buscar",
								value: query,
								autoComplete: "off",
								autoCorrect: "off",
								autoCapitalize: "off",
								spellCheck: false,
								enterKeyHint: "search",
								onChange: (event) => onQuery(event.target.value),
								onKeyDown: (event) => {
									if (event.key === "ArrowDown") {
										event.preventDefault();
										move(null, 1);
									} else if (event.key === "Escape") {
										if (query) onQuery("");
										else onClose();
									}
								}
							}),
							query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "press absolute top-0 right-0 grid size-11 place-items-center rounded-md text-muted hover:text-ink",
								"aria-label": "Limpiar búsqueda",
								onClick: () => {
									onQuery("");
									searchRef.current?.focus();
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									className: "size-4",
									strokeWidth: 1.75,
									"aria-hidden": true
								})
							}) : null
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "sr-only",
					"aria-live": "polite",
					children: query.trim() ? `${filtered.length} de ${total} notas` : notesLabel(total)
				}), notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-6 text-sm text-muted",
					children: "Todavía no hay notas."
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 py-6 text-sm text-pretty text-muted",
					children: "Ninguna nota coincide."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col py-1",
					onKeyDown: (event) => {
						const current = document.activeElement?.id.startsWith("note-") ? document.activeElement.id.slice(5) : activeId;
						if (event.key === "ArrowDown") {
							event.preventDefault();
							move(current, 1);
						} else if (event.key === "ArrowUp") {
							event.preventDefault();
							if (filtered.findIndex((note) => note.id === current) <= 0) searchRef.current?.focus();
							else move(current, -1);
						} else if (event.key === "Home") {
							event.preventDefault();
							const first = filtered[0];
							if (!first) return;
							onSelect(first.id, false);
							document.getElementById(`note-${first.id}`)?.focus();
						} else if (event.key === "End") {
							event.preventDefault();
							const last = filtered[filtered.length - 1];
							if (!last) return;
							onSelect(last.id, false);
							document.getElementById(`note-${last.id}`)?.focus();
						} else if (event.key === "Enter") {
							event.preventDefault();
							onClose();
							document.getElementById("nota-editor")?.focus();
						}
					},
					children: filtered.map((note) => {
						const title = noteTitle(note.body);
						const excerpt = noteExcerpt(note.body);
						const active = note.id === activeId;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							id: `note-${note.id}`,
							type: "button",
							className: "note-row",
							"aria-current": active ? "true" : void 0,
							onClick: () => {
								const narrow = window.matchMedia("(max-width: 767px)").matches;
								onSelect(note.id, narrow);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-sm font-medium",
									children: title
								}), now != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
									className: "shrink-0 text-xs text-muted tabular-nums",
									dateTime: new Date(note.updatedAt).toISOString(),
									children: formatEdited(note.updatedAt, now)
								}) : null]
							}), excerpt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-xs text-muted",
								children: excerpt
							}) : null]
						}) }, note.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pad-safe-b flex shrink-0 items-center justify-between gap-2 border-t border-line px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted tabular-nums",
					children: query.trim() ? `${filtered.length} de ${total}` : notesLabel(total)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					className: "hover:bg-paper",
					onClick: onHelp,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, {
						className: "size-4",
						strokeWidth: 1.75,
						"aria-hidden": true
					}), "Atajos"]
				})]
			})
		]
	});
}
var noopStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {}
};
function uid() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
	return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
var seed = createSeedNotes();
var useNotesStore = create()(persist((set, get) => ({
	notes: seed,
	activeId: seed[0]?.id ?? null,
	previewMode: "write",
	hydrated: false,
	createNote: () => set((state) => {
		const note = {
			id: uid(),
			body: "",
			createdAt: Date.now(),
			updatedAt: Date.now()
		};
		return {
			notes: [note, ...state.notes],
			activeId: note.id
		};
	}),
	updateBody: (id, body) => set((state) => {
		const current = state.notes.find((note) => note.id === id);
		if (!current || current.body === body) return state;
		return { notes: state.notes.map((note) => note.id === id ? {
			...note,
			body,
			updatedAt: Date.now()
		} : note) };
	}),
	deleteNote: (id) => set((state) => {
		const notes = state.notes.filter((note) => note.id !== id);
		if (notes.length === state.notes.length) return state;
		let activeId = state.activeId;
		if (activeId === id) activeId = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null;
		return {
			notes,
			activeId
		};
	}),
	setActive: (id) => set({ activeId: id }),
	setPreviewMode: (mode) => set({ previewMode: mode }),
	cyclePreview: () => {
		const order = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? ["write", "preview"] : [
			"write",
			"preview",
			"split"
		];
		const current = get().previewMode;
		set({ previewMode: order[(order.indexOf(current) + 1) % order.length] ?? "write" });
	}
}), {
	name: "folio-notes",
	version: 1,
	skipHydration: true,
	storage: createJSONStorage(() => typeof window === "undefined" ? noopStorage : localStorage),
	partialize: (state) => ({
		notes: state.notes,
		activeId: state.activeId,
		previewMode: state.previewMode
	})
}));
var SHORTCUTS = [
	["Ctrl/⌘ N", "Nueva nota"],
	["Ctrl/⌘ K", "Buscar"],
	["Ctrl/⌘ Mayús P", "Alternar vista previa"],
	["Alt ↑ / ↓", "Nota anterior o siguiente"],
	["Ctrl/⌘ Mayús Retroceso", "Eliminar la nota abierta"]
];
var MODES = [
	{
		id: "write",
		label: "Escribir",
		icon: PenLine
	},
	{
		id: "split",
		label: "Dividir",
		icon: Columns2
	},
	{
		id: "preview",
		label: "Leer",
		icon: Eye
	}
];
function useHydrateNotes() {
	(0, import_react.useEffect)(() => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			useNotesStore.setState({ hydrated: true });
		};
		const unsub = useNotesStore.persist.onFinishHydration(finish);
		Promise.resolve(useNotesStore.persist.rehydrate()).then(finish, finish);
		const backup = window.setTimeout(finish, 1500);
		return () => {
			window.clearTimeout(backup);
			unsub();
		};
	}, []);
}
function useClock() {
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const tick = () => setNow(Date.now());
		tick();
		const id = window.setInterval(tick, 3e4);
		return () => window.clearInterval(id);
	}, []);
	return now;
}
function Shell() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-app flex overflow-hidden bg-paper text-ink",
		"aria-busy": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "hidden w-72 shrink-0 flex-col bg-sidebar md:flex",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 pt-5 font-serif text-2xl tracking-tight",
				children: "Folio"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex min-w-0 flex-1 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-serif text-2xl tracking-tight md:hidden",
				children: "Folio"
			})
		})]
	});
}
function isTypingTarget(target) {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return true;
	return target.isContentEditable;
}
function isMod(event) {
	return event.metaKey || event.ctrlKey;
}
function NotesApp() {
	const hydrated = useNotesStore((state) => state.hydrated);
	useHydrateNotes();
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadyApp, {});
}
function ReadyApp() {
	const notes = useNotesStore((state) => state.notes);
	const activeId = useNotesStore((state) => state.activeId);
	const previewMode = useNotesStore((state) => state.previewMode);
	const createNote = useNotesStore((state) => state.createNote);
	const updateBody = useNotesStore((state) => state.updateBody);
	const deleteNote = useNotesStore((state) => state.deleteNote);
	const setActive = useNotesStore((state) => state.setActive);
	const setPreviewMode = useNotesStore((state) => state.setPreviewMode);
	const cyclePreview = useNotesStore((state) => state.cyclePreview);
	const sorted = (0, import_react.useMemo)(() => sortNotes(notes), [notes]);
	const resolvedId = activeId && sorted.some((note) => note.id === activeId) ? activeId : sorted[0]?.id ?? null;
	const active = sorted.find((note) => note.id === resolvedId) ?? null;
	const [query, setQuery] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [helpOpen, setHelpOpen] = (0, import_react.useState)(false);
	const [deleteOpen, setDeleteOpen] = (0, import_react.useState)(false);
	const [autoFocus, setAutoFocus] = (0, import_react.useState)(false);
	const [live, setLive] = (0, import_react.useState)(null);
	const searchRef = (0, import_react.useRef)(null);
	const closeRef = (0, import_react.useRef)(null);
	const focusSearchTick = (0, import_react.useRef)(0);
	const [searchTick, setSearchTick] = (0, import_react.useState)(0);
	const now = useClock();
	const bodyNow = live && active && live.id === active.id ? live.body : active?.body ?? "";
	const title = active ? noteTitle(bodyNow) : "Folio";
	const filtered = (0, import_react.useMemo)(() => {
		const q = normalizeSearch(query.trim());
		if (!q) return sorted;
		return sorted.filter((note) => {
			return normalizeSearch(`${noteTitle(note.body)}\n${note.body}`).includes(q);
		});
	}, [sorted, query]);
	(0, import_react.useEffect)(() => {
		if (resolvedId !== activeId) setActive(resolvedId);
	}, [
		resolvedId,
		activeId,
		setActive
	]);
	(0, import_react.useEffect)(() => {
		document.title = !active || title === "Folio" ? "Folio" : `${title} · Folio`;
	}, [active, title]);
	(0, import_react.useEffect)(() => {
		if (!resolvedId) return;
		document.getElementById(`note-${resolvedId}`)?.scrollIntoView({ block: "nearest" });
	}, [resolvedId]);
	(0, import_react.useEffect)(() => {
		if (!searchTick) return;
		searchRef.current?.focus();
		searchRef.current?.select();
	}, [searchTick]);
	const api = (0, import_react.useRef)({
		create: () => {},
		search: () => {},
		cycle: () => {},
		remove: () => {},
		relative: (_delta) => {},
		closeSidebar: () => {},
		help: () => {},
		modal: false,
		sidebarOpen: false
	});
	api.current.modal = deleteOpen || helpOpen;
	api.current.sidebarOpen = open;
	api.current.create = () => {
		setQuery("");
		setAutoFocus(true);
		setOpen(false);
		setLive(null);
		createNote();
	};
	api.current.search = () => {
		setOpen(true);
		focusSearchTick.current += 1;
		setSearchTick(focusSearchTick.current);
	};
	api.current.cycle = () => cyclePreview();
	api.current.remove = () => {
		if (active) setDeleteOpen(true);
	};
	api.current.relative = (delta) => {
		const list = filtered.length ? filtered : sorted;
		if (!list.length) return;
		const index = list.findIndex((note) => note.id === resolvedId);
		const note = list[index < 0 ? delta > 0 ? 0 : list.length - 1 : Math.min(list.length - 1, Math.max(0, index + delta))];
		if (note && note.id !== resolvedId) setActive(note.id);
	};
	api.current.closeSidebar = () => setOpen(false);
	api.current.help = () => setHelpOpen(true);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			const actions = api.current;
			if (actions.modal) return;
			if (isMod(event) && event.key.toLowerCase() === "n") {
				event.preventDefault();
				actions.create();
				return;
			}
			if (isMod(event) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				actions.search();
				return;
			}
			if (isMod(event) && event.key.toLowerCase() === "s") {
				event.preventDefault();
				return;
			}
			if (isMod(event) && event.shiftKey && event.key.toLowerCase() === "p") {
				event.preventDefault();
				actions.cycle();
				return;
			}
			if (isMod(event) && event.shiftKey && (event.key === "Backspace" || event.key === "Delete")) {
				event.preventDefault();
				actions.remove();
				return;
			}
			if (event.altKey && !event.metaKey && !event.ctrlKey && event.key === "ArrowDown") {
				event.preventDefault();
				actions.relative(1);
				return;
			}
			if (event.altKey && !event.metaKey && !event.ctrlKey && event.key === "ArrowUp") {
				event.preventDefault();
				actions.relative(-1);
				return;
			}
			if (event.key === "?" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingTarget(event.target)) {
				event.preventDefault();
				actions.help();
				return;
			}
			if (event.key === "Escape" && actions.sidebarOpen && window.matchMedia("(max-width: 767px)").matches) actions.closeSidebar();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const edited = active && now != null ? formatEdited(active.updatedAt, now) : null;
	const meta = [edited ? `Editada ${edited}` : null, wordsLabel(wordCount(bodyNow))].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-app flex overflow-hidden bg-paper text-ink",
		"data-ready": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#contenido",
				className: "sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper",
				children: "Saltar al contenido"
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-30 bg-ink/25 md:hidden",
				"aria-label": "Cerrar lista",
				onClick: () => setOpen(false)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
				notes: sorted,
				filtered,
				total: sorted.length,
				activeId: resolvedId,
				query,
				now,
				open,
				searchRef,
				closeRef,
				onQuery: setQuery,
				onSelect: (id, close) => {
					setActive(id);
					if (close) setOpen(false);
				},
				onCreate: () => api.current.create(),
				onClose: () => setOpen(false),
				onHelp: () => setHelpOpen(true)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex min-h-0 min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "pad-safe-t shrink-0 border-b border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 px-2 py-1 md:px-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								className: "md:hidden",
								"aria-label": "Abrir lista de notas",
								"aria-expanded": open,
								"aria-controls": "sidebar",
								onClick: () => setOpen(true),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {
									className: "size-4",
									strokeWidth: 1.75,
									"aria-hidden": true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1 px-1",
								children: [active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "truncate text-sm font-medium",
									children: title
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "truncate font-serif text-lg tracking-tight md:hidden",
									children: "Folio"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted tabular-nums",
									children: active ? meta : notesLabel(sorted.length)
								})]
							}),
							active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex shrink-0 items-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										className: "md:hidden",
										"aria-pressed": previewMode === "preview",
										"aria-label": previewMode === "preview" ? "Volver a escribir" : "Ver vista previa",
										onClick: () => setPreviewMode(previewMode === "preview" ? "write" : "preview"),
										children: previewMode === "preview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, {
											className: "size-4",
											strokeWidth: 1.75,
											"aria-hidden": true
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
											className: "size-4",
											strokeWidth: 1.75,
											"aria-hidden": true
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										role: "radiogroup",
										"aria-label": "Modo de lectura",
										className: "mr-1 hidden items-center rounded-lg bg-paper-deep p-1 md:inline-flex",
										children: MODES.map((item) => {
											const Icon = item.icon;
											const selected = previewMode === item.id;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												role: "radio",
												"aria-checked": selected,
												className: cn("press inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm", selected ? "bg-paper text-ink" : "text-muted hover:text-ink"),
												onClick: () => setPreviewMode(item.id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
													className: "size-3.5",
													strokeWidth: 1.75,
													"aria-hidden": true
												}), item.label]
											}, item.id);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										"aria-label": "Eliminar nota",
										className: "text-danger hover:bg-danger-soft hover:text-danger",
										onClick: () => setDeleteOpen(true),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
											className: "size-4",
											strokeWidth: 1.75,
											"aria-hidden": true
										})
									})
								]
							}) : null
						]
					})
				}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorPane, {
					note: active,
					mode: previewMode,
					autoFocus,
					onLive: (body) => setLive({
						id: active.id,
						body
					}),
					onSave: updateBody,
					onAutoFocused: () => setAutoFocus(false)
				}, active.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					id: "contenido",
					className: "flex flex-1 flex-col items-center justify-center px-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-serif text-3xl font-medium tracking-tight text-balance",
							children: "Tu cuaderno está vacío"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xs text-sm text-pretty text-muted",
							children: "Crea una nota. Queda guardada en este navegador."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							className: "mt-6",
							onClick: () => api.current.create(),
							children: "Nueva nota"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: deleteOpen,
				onOpenChange: setDeleteOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, { className: "folio-overlay" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
					className: "folio-dialog rounded-xl border border-line bg-paper p-4 text-ink",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
							className: "font-serif text-xl tracking-tight",
							children: "Eliminar nota"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, {
							className: "mt-2 text-sm text-pretty text-muted",
							children: [
								"Se borrará «",
								title,
								"» de este navegador. No se puede deshacer."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
								className: buttonVariants({ variant: "ghost" }),
								children: "Cancelar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
								className: buttonVariants({ variant: "danger" }),
								onClick: () => {
									if (active) deleteNote(active.id);
								},
								children: "Eliminar"
							})]
						})
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: helpOpen,
				onOpenChange: setHelpOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "folio-overlay" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "folio-dialog rounded-xl border border-line bg-paper p-4 text-ink",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-serif text-xl tracking-tight",
							children: "Atajos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "mt-2 text-sm text-pretty text-muted",
							children: "El cuaderno se guarda solo en este navegador."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 flex flex-col gap-2",
							children: SHORTCUTS.map(([keys, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
									className: "shrink-0 rounded-sm bg-paper-deep px-2 py-1 font-sans text-xs text-muted",
									children: keys
								})]
							}, keys))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
								className: buttonVariants({ variant: "primary" }),
								children: "Listo"
							})
						})
					]
				})] })
			})
		]
	});
}
var SplitComponent = NotesApp;
//#endregion
export { SplitComponent as component };
