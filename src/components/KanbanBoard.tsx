import { useState } from "react";
import type { Note, NoteStatus } from "@/types/note";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import { LinkableText } from "./LinkableText";

const COLUMNS: { id: NoteStatus; label: string }[] = [
  { id: "Backlog", label: "Backlog" },
  { id: "To-Do", label: "To-Do" },
  { id: "Doing", label: "Doing" },
  { id: "Done", label: "Done" },
];

const columnBorder: Record<NoteStatus, string> = {
  "To-Do": "border-t-red-400",
  "Doing": "border-t-blue-400",
  "Done": "border-t-green-400",
  "Backlog": "border-t-gray-400",
};

const headerDot: Record<NoteStatus, string> = {
  "To-Do": "bg-red-400",
  "Doing": "bg-blue-400",
  "Done": "bg-green-400",
  "Backlog": "bg-gray-400",
};

const noteColorMap: Record<string, string> = {
  yellow: "bg-[hsl(var(--note-yellow))]",
  pink: "bg-[hsl(var(--note-pink))]",
  blue: "bg-[hsl(var(--note-blue))]",
  green: "bg-[hsl(var(--note-green))]",
  purple: "bg-[hsl(var(--note-purple))]",
  orange: "bg-[hsl(var(--note-orange))]",
  teal: "bg-[hsl(var(--note-teal))]",
  lavender: "bg-[hsl(var(--note-lavender))]",
  peach: "bg-[hsl(var(--note-peach))]",
  mint: "bg-[hsl(var(--note-mint))]",
};

interface KanbanBoardProps {
  notes: Note[];
  onStatusChange: (noteId: string, newStatus: NoteStatus) => void;
  onNoteClick: (note: Note) => void;
}

export function KanbanBoard({ notes, onStatusChange, onNoteClick }: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<NoteStatus | null>(null);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  const getColumnNotes = (status: NoteStatus) =>
    notes.filter((n) => n.status === status);

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.setData("text/plain", noteId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedNoteId(noteId);
  };

  const handleDragOver = (e: React.DragEvent, status: NoteStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: NoteStatus) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("text/plain");
    if (noteId) {
      onStatusChange(noteId, status);
    }
    setDragOverColumn(null);
    setDraggedNoteId(null);
  };

  const handleDragEnd = () => {
    setDragOverColumn(null);
    setDraggedNoteId(null);
  };

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="flex gap-6 h-full min-h-[calc(100vh-12rem)]">
        {COLUMNS.map((column) => {
          const columnNotes = getColumnNotes(column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={cn(
                "flex-1 min-w-[220px] max-w-[320px] flex flex-col rounded-xl border border-border bg-card/50",
                "border-t-4",
                columnBorder[column.id],
                isOver && "ring-2 ring-primary/50 bg-accent/30"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", headerDot[column.id])} />
                <h3 className="font-semibold text-sm text-foreground">{column.label}</h3>
                <Badge variant="secondary" className="ml-auto text-xs font-mono">
                  {columnNotes.length}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {columnNotes.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                    Drop notes here
                  </div>
                ) : (
                  columnNotes.map((note) => (
                    <div
                      key={note.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, note.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onNoteClick(note)}
                      className={cn(
                        "group rounded-lg p-3 cursor-pointer transition-all",
                        "border border-border/60 hover:border-border",
                        "hover:shadow-md active:scale-[0.98]",
                        noteColorMap[note.color] || "bg-card",
                        draggedNoteId === note.id && "opacity-40 scale-95"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical
                          size={14}
                          className="mt-0.5 shrink-0 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="min-w-0 flex-1">
                          {note.title && (
                            <p className="text-sm font-semibold text-foreground truncate mb-1">
                              {note.title}
                            </p>
                          )}
                          <LinkableText
                            text={note.content.length > 80 ? note.content.slice(0, 80) + "..." : note.content}
                            className="text-xs text-muted-foreground leading-relaxed line-clamp-3"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
