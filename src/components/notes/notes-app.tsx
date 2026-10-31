import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import { Columns2, Eye, PanelLeft, PenLine, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EditorPane } from "@/components/notes/editor-pane";
import { Sidebar } from "@/components/notes/sidebar";
import {
  formatEdited,
  normalizeSearch,
  noteTitle,
  notesLabel,
  sortNotes,
  wordCount,
  wordsLabel,
  type PreviewMode,
} from "@/lib/notes";
import { useNotesStore } from "@/lib/notes-store";
import { cn } from "@/lib/utils";

const SHORTCUTS: Array<[string, string]> = [
  ["Ctrl/⌘ N", "Nueva nota"],
  ["Ctrl/⌘ K", "Buscar"],
  ["Ctrl/⌘ Mayús P", "Alternar vista previa"],
  ["Alt ↑ / ↓", "Nota anterior o siguiente"],
  ["Ctrl/⌘ Mayús Retroceso", "Eliminar la nota abierta"],
];

const MODES: Array<{ id: PreviewMode; label: string; icon: typeof PenLine }> = [
  { id: "write", label: "Escribir", icon: PenLine },
  { id: "split", label: "Dividir", icon: Columns2 },
  { id: "preview", label: "Leer", icon: Eye },
];

function useHydrateNotes() {
  useEffect(() => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      useNotesStore.setState({ hydrated: true });
    };
    const unsub = useNotesStore.persist.onFinishHydration(finish);
    void Promise.resolve(useNotesStore.persist.rehydrate()).then(finish, finish);
    const backup = window.setTimeout(finish, 1500);
    return () => {
      window.clearTimeout(backup);
      unsub();
    };
  }, []);
}

function useClock() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function Shell() {
  return (
    <div className="h-app flex overflow-hidden bg-paper text-ink" aria-busy="true">
      <aside className="hidden w-72 shrink-0 flex-col bg-sidebar md:flex" aria-hidden>
        <p className="px-4 pt-5 font-serif text-2xl tracking-tight">Folio</p>
      </aside>
      <main className="flex min-w-0 flex-1 items-center justify-center">
        <p className="font-serif text-2xl tracking-tight md:hidden">Folio</p>
      </main>
    </div>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return true;
  return target.isContentEditable;
}

function isMod(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey;
}

export function NotesApp() {
  const hydrated = useNotesStore((state) => state.hydrated);
  useHydrateNotes();
  if (!hydrated) return <Shell />;
  return <ReadyApp />;
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

  const sorted = useMemo(() => sortNotes(notes), [notes]);
  const resolvedId =
    activeId && sorted.some((note) => note.id === activeId)
      ? activeId
      : (sorted[0]?.id ?? null);
  const active = sorted.find((note) => note.id === resolvedId) ?? null;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [autoFocus, setAutoFocus] = useState(false);
  const [live, setLive] = useState<{ id: string; body: string } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const focusSearchTick = useRef(0);
  const [searchTick, setSearchTick] = useState(0);
  const now = useClock();

  const bodyNow = live && active && live.id === active.id ? live.body : (active?.body ?? "");
  const title = active ? noteTitle(bodyNow) : "Folio";

  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim());
    if (!q) return sorted;
    return sorted.filter((note) => {
      const haystack = normalizeSearch(`${noteTitle(note.body)}\n${note.body}`);
      return haystack.includes(q);
    });
  }, [sorted, query]);

  useEffect(() => {
    if (resolvedId !== activeId) setActive(resolvedId);
  }, [resolvedId, activeId, setActive]);

  useEffect(() => {
    document.title = !active || title === "Folio" ? "Folio" : `${title} · Folio`;
  }, [active, title]);

  useEffect(() => {
    if (!resolvedId) return;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    if (narrow && !open) return;
    document.getElementById(`note-${resolvedId}`)?.scrollIntoView({ block: "nearest" });
  }, [resolvedId, open]);

  useEffect(() => {
    if (!searchTick) return;
    searchRef.current?.focus();
    searchRef.current?.select();
  }, [searchTick]);

  const api = useRef({
    create: () => {},
    search: () => {},
    cycle: () => {},
    remove: () => {},
    relative: (_delta: number) => {},
    closeSidebar: () => {},
    help: () => {},
    modal: false,
    sidebarOpen: false,
  });

  api.current.modal = deleteOpen || helpOpen;
  api.current.sidebarOpen = open;
  api.current.create = () => {
    setQuery("");
    setAutoFocus(true);
    setOpen(false);
    setLive(null);
    if (useNotesStore.getState().previewMode === "preview") setPreviewMode("write");
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
    const next =
      index < 0
        ? delta > 0
          ? 0
          : list.length - 1
        : Math.min(list.length - 1, Math.max(0, index + delta));
    const note = list[next];
    if (note && note.id !== resolvedId) setActive(note.id);
  };
  api.current.closeSidebar = () => setOpen(false);
  api.current.help = () => setHelpOpen(true);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
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
      if (event.key === "Escape" && actions.sidebarOpen && window.matchMedia("(max-width: 767px)").matches) {
        actions.closeSidebar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const edited = active && now != null ? formatEdited(active.updatedAt, now) : null;
  const meta = [edited ? `Editada ${edited}` : null, wordsLabel(wordCount(bodyNow))]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="h-app flex overflow-hidden bg-paper text-ink" data-ready="true">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        Saltar al contenido
      </a>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/25 md:hidden"
          aria-label="Cerrar lista"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <Sidebar
          notes={sorted}
          filtered={filtered}
          total={sorted.length}
          activeId={resolvedId}
          query={query}
          now={now}
          open={open}
          searchRef={searchRef}
          closeRef={closeRef}
          onQuery={setQuery}
          onSelect={(id, close) => {
            setActive(id);
            if (close) setOpen(false);
          }}
          onCreate={() => api.current.create()}
          onClose={() => setOpen(false)}
          onHelp={() => setHelpOpen(true)}
        />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="pad-safe-t shrink-0 border-b border-line">
          <div className="flex items-center gap-1 px-2 py-1 md:px-4">
            <Button
              size="icon"
              className="md:hidden"
              aria-label="Abrir lista de notas"
              aria-expanded={open}
              aria-controls="sidebar"
              onClick={() => setOpen(true)}
            >
              <PanelLeft className="size-4" strokeWidth={1.75} aria-hidden />
            </Button>
            <div className="min-w-0 flex-1 px-1">
              {active ? (
                <h1 className="truncate text-sm font-medium">{title}</h1>
              ) : (
                <h1 className="truncate font-serif text-lg tracking-tight md:hidden">Folio</h1>
              )}
              <p className="truncate text-xs text-muted tabular-nums">
                {active ? meta : notesLabel(sorted.length)}
              </p>
            </div>
            {active ? (
              <div className="flex shrink-0 items-center">
                <Button
                  size="icon"
                  className="md:hidden"
                  aria-pressed={previewMode === "preview"}
                  aria-label={previewMode === "preview" ? "Volver a escribir" : "Ver vista previa"}
                  onClick={() => setPreviewMode(previewMode === "preview" ? "write" : "preview")}
                >
                  {previewMode === "preview" ? (
                    <PenLine className="size-4" strokeWidth={1.75} aria-hidden />
                  ) : (
                    <Eye className="size-4" strokeWidth={1.75} aria-hidden />
                  )}
                </Button>
                <div
                  role="radiogroup"
                  aria-label="Modo de lectura"
                  className="mr-1 hidden items-center rounded-lg bg-paper-deep p-1 md:inline-flex"
                >
                  {MODES.map((item) => {
                    const Icon = item.icon;
                    const selected = previewMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "press inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm",
                          selected ? "bg-paper text-ink" : "text-muted hover:text-ink",
                        )}
                        onClick={() => setPreviewMode(item.id)}
                      >
                        <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <Button
                  size="icon"
                  aria-label="Eliminar nota"
                  className="text-danger hover:bg-danger-soft hover:text-danger"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                </Button>
              </div>
            ) : null}
          </div>
        </header>

        {active ? (
          <EditorPane
            key={active.id}
            note={active}
            mode={previewMode}
            autoFocus={autoFocus}
            onLive={(body) => setLive({ id: active.id, body })}
            onSave={updateBody}
            onAutoFocused={() => setAutoFocus(false)}
          />
        ) : (
          <div id="contenido" className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-serif text-3xl font-medium tracking-tight text-balance">
              Tu cuaderno está vacío
            </p>
            <p className="mt-2 max-w-xs text-sm text-pretty text-muted">
              Crea una nota. Queda guardada en este navegador.
            </p>
            <Button variant="primary" className="mt-6" onClick={() => api.current.create()}>
              Nueva nota
            </Button>
          </div>
        )}
      </main>

      <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="folio-overlay" />
          <AlertDialog.Content className="folio-dialog rounded-xl border border-line bg-paper p-4 text-ink">
            <AlertDialog.Title className="font-serif text-xl tracking-tight">
              Eliminar nota
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-pretty text-muted">
              Se borrará «{title}» de este navegador. No se puede deshacer.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel className={buttonVariants({ variant: "ghost" })}>
                Cancelar
              </AlertDialog.Cancel>
              <AlertDialog.Action
                className={buttonVariants({ variant: "danger" })}
                onClick={() => {
                  if (active) deleteNote(active.id);
                }}
              >
                Eliminar
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Dialog.Root open={helpOpen} onOpenChange={setHelpOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="folio-overlay" />
          <Dialog.Content className="folio-dialog rounded-xl border border-line bg-paper p-4 text-ink">
            <Dialog.Title className="font-serif text-xl tracking-tight">Atajos</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-pretty text-muted">
              El cuaderno se guarda solo en este navegador.
            </Dialog.Description>
            <ul className="mt-4 flex flex-col gap-2">
              {SHORTCUTS.map(([keys, label]) => (
                <li key={keys} className="flex items-center justify-between gap-4 text-sm">
                  <span>{label}</span>
                  <kbd className="shrink-0 rounded-sm bg-paper-deep px-2 py-1 font-sans text-xs text-muted">
                    {keys}
                  </kbd>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-end">
              <Dialog.Close className={buttonVariants({ variant: "primary" })}>Listo</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
