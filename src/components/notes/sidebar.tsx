import { Keyboard, Plus, Search, X } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import {
  formatEdited,
  noteExcerpt,
  noteTitle,
  notesLabel,
  type Note,
} from "@/lib/notes";

export function Sidebar({
  notes,
  filtered,
  total,
  activeId,
  query,
  now,
  open,
  searchRef,
  closeRef,
  onQuery,
  onSelect,
  onCreate,
  onClose,
  onHelp,
}: {
  notes: Note[];
  filtered: Note[];
  total: number;
  activeId: string | null;
  query: string;
  now: number | null;
  open: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  closeRef: RefObject<HTMLButtonElement | null>;
  onQuery: (value: string) => void;
  onSelect: (id: string, close: boolean) => void;
  onCreate: () => void;
  onClose: () => void;
  onHelp: () => void;
}) {
  function move(from: string | null, delta: number) {
    if (!filtered.length) return;
    const index = filtered.findIndex((note) => note.id === from);
    const nextIndex =
      index < 0
        ? delta > 0
          ? 0
          : filtered.length - 1
        : Math.min(filtered.length - 1, Math.max(0, index + delta));
    const next = filtered[nextIndex];
    if (!next) return;
    onSelect(next.id, false);
    document.getElementById(`note-${next.id}`)?.focus();
  }

  return (
    <aside id="sidebar" className={open ? "folio-sidebar is-open" : "folio-sidebar"} aria-label="Notas">
      <div className="pad-safe-t shrink-0 px-3 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-serif text-2xl tracking-tight text-ink">Folio</p>
          <Button
            ref={closeRef}
            size="icon"
            className="md:hidden"
            aria-label="Cerrar lista"
            onClick={onClose}
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden />
          </Button>
        </div>
        <Button variant="primary" className="mt-3 w-full" onClick={onCreate}>
          <Plus className="size-4" strokeWidth={1.75} aria-hidden />
          Nueva nota
        </Button>
        <div className="relative mt-3">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            ref={searchRef}
            className="folio-search"
            type="text"
            role="searchbox"
            aria-label="Buscar notas"
            placeholder="Buscar"
            value={query}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
            onChange={(event) => onQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                move(null, 1);
              } else if (event.key === "Escape") {
                if (query) onQuery("");
                else onClose();
              }
            }}
          />
          {query ? (
            <button
              type="button"
              className="press absolute top-0 right-0 grid size-11 place-items-center rounded-md text-muted hover:text-ink"
              aria-label="Limpiar búsqueda"
              onClick={() => {
                onQuery("");
                searchRef.current?.focus();
              }}
            >
              <X className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="sr-only" aria-live="polite">
          {query.trim()
            ? `${filtered.length} de ${total} notas`
            : notesLabel(total)}
        </p>
        {notes.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">Todavía no hay notas.</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-pretty text-muted">Ninguna nota coincide.</p>
        ) : (
          <ul
            className="flex flex-col py-1"
            onKeyDown={(event) => {
              const current = document.activeElement?.id.startsWith("note-")
                ? document.activeElement.id.slice(5)
                : activeId;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                move(current, 1);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                const index = filtered.findIndex((note) => note.id === current);
                if (index <= 0) searchRef.current?.focus();
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
            }}
          >
            {filtered.map((note) => {
              const title = noteTitle(note.body);
              const excerpt = noteExcerpt(note.body);
              const active = note.id === activeId;
              return (
                <li key={note.id}>
                  <button
                    id={`note-${note.id}`}
                    type="button"
                    className="note-row"
                    aria-current={active ? "true" : undefined}
                    onClick={() => {
                      const narrow = window.matchMedia("(max-width: 767px)").matches;
                      onSelect(note.id, narrow);
                    }}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-medium">{title}</span>
                      {now != null ? (
                        <time
                          className="shrink-0 text-xs text-muted tabular-nums"
                          dateTime={new Date(note.updatedAt).toISOString()}
                        >
                          {formatEdited(note.updatedAt, now)}
                        </time>
                      ) : null}
                    </span>
                    {excerpt ? (
                      <span className="truncate text-xs text-muted">{excerpt}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="pad-safe-b flex shrink-0 items-center justify-between gap-2 border-t border-line px-3 py-2">
        <p className="text-xs text-muted tabular-nums">
          {query.trim() ? `${filtered.length} de ${total}` : notesLabel(total)}
        </p>
        <Button variant="ghost" className="hover:bg-paper" onClick={onHelp}>
          <Keyboard className="size-4" strokeWidth={1.75} aria-hidden />
          Atajos
        </Button>
      </div>
    </aside>
  );
}
