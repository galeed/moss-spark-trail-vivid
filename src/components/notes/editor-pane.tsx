import { useEffect, useRef, useState } from "react";
import { MarkdownView } from "@/lib/markdown";
import type { Note, PreviewMode } from "@/lib/notes";
import { cn } from "@/lib/utils";

const SAVE_MS = 320;

export function EditorPane({
  note,
  mode,
  autoFocus,
  onLive,
  onSave,
  onAutoFocused,
}: {
  note: Note;
  mode: PreviewMode;
  autoFocus: boolean;
  onLive: (body: string) => void;
  onSave: (id: string, body: string) => void;
  onAutoFocused: () => void;
}) {
  const [body, setBody] = useState(note.body);
  const saved = useRef(note.body);
  const pending = useRef<string | null>(null);
  const timer = useRef<number | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const onSaveRef = useRef(onSave);
  const didFocus = useRef(false);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!autoFocus || didFocus.current) return;
    didFocus.current = true;
    const area = areaRef.current;
    area?.focus();
    const length = area?.value.length ?? 0;
    area?.setSelectionRange(length, length);
    onAutoFocused();
  }, [autoFocus, onAutoFocused]);

  useEffect(() => {
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

  function commitSoon(next: string) {
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

  return (
    <div
      id="contenido"
      className={cn("flex min-h-0 min-w-0 flex-1", mode === "split" && "flex-col md:flex-row")}
    >
      <section
        className={cn("flex min-h-0 min-w-0 flex-1 flex-col", !showEditor && "hidden")}
        aria-label="Editor"
      >
        <div
          className={cn(
            "mx-auto flex min-h-0 w-full flex-1 flex-col px-5 py-8 md:px-10 md:py-10",
            mode !== "split" && "max-w-2xl",
          )}
        >
          <textarea
            id="nota-editor"
            ref={areaRef}
            className="folio-editor"
            value={body}
            placeholder="Escribe en markdown. La primera línea será el título."
            aria-label="Nota"
            spellCheck
            autoCapitalize="sentences"
            onChange={(event) => {
              const next = event.target.value;
              setBody(next);
              onLive(next);
              commitSoon(next);
            }}
          />
        </div>
      </section>
      <section
        className={cn(
          "min-h-0 min-w-0 flex-1 overflow-y-auto",
          mode === "write" && "hidden",
          mode === "split" && "hidden border-line md:block md:border-l",
          !showPreview && "hidden",
        )}
        aria-label="Vista previa"
      >
        <div
          className={cn(
            "mx-auto w-full px-5 py-8 md:px-10 md:py-10",
            mode !== "split" && "max-w-2xl",
          )}
        >
          <MarkdownView source={body} />
        </div>
      </section>
    </div>
  );
}
