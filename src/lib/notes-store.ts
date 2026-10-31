import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { createSeedNotes, type Note, type PreviewMode } from "@/lib/notes";

type NotesState = {
  notes: Note[];
  activeId: string | null;
  previewMode: PreviewMode;
  hydrated: boolean;
  createNote: () => void;
  updateBody: (id: string, body: string) => void;
  deleteNote: (id: string) => void;
  setActive: (id: string | null) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  cyclePreview: () => void;
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const seed = createSeedNotes();

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: seed,
      activeId: seed[0]?.id ?? null,
      previewMode: "write",
      hydrated: false,
      createNote: () =>
        set((state) => {
          const note: Note = {
            id: uid(),
            body: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return { notes: [note, ...state.notes], activeId: note.id };
        }),
      updateBody: (id, body) =>
        set((state) => {
          const current = state.notes.find((note) => note.id === id);
          if (!current || current.body === body) return state;
          return {
            notes: state.notes.map((note) =>
              note.id === id ? { ...note, body, updatedAt: Date.now() } : note,
            ),
          };
        }),
      deleteNote: (id) =>
        set((state) => {
          const notes = state.notes.filter((note) => note.id !== id);
          if (notes.length === state.notes.length) return state;
          let activeId = state.activeId;
          if (activeId === id) {
            activeId = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null;
          }
          return { notes, activeId };
        }),
      setActive: (id) => set({ activeId: id }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      cyclePreview: () => {
        const narrow =
          typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
        const order: PreviewMode[] = narrow ? ["write", "preview"] : ["write", "preview", "split"];
        const current = get().previewMode;
        const index = order.indexOf(current);
        const next = order[(index + 1) % order.length] ?? "write";
        set({ previewMode: next });
      },
    }),
    {
      name: "folio-notes",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : localStorage,
      ),
      partialize: (state) => ({
        notes: state.notes,
        activeId: state.activeId,
        previewMode: state.previewMode,
      }),
    },
  ),
);
