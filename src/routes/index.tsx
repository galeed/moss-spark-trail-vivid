import { createFileRoute } from "@tanstack/react-router";
import { NotesApp } from "@/components/notes/notes-app";

export const Route = createFileRoute("/")({
  component: NotesApp,
});
