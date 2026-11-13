"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface KanbanColumn<C extends string> {
  id: C;
  label: string;
  color: string;
}

export function KanbanBoard<T, C extends string>({
  columns,
  items,
  getId,
  getColumn,
  onMove,
  renderCard,
  columnMeta,
  emptyLabel = "Drop items here",
  label,
}: {
  columns: KanbanColumn<C>[];
  items: T[];
  getId: (item: T) => string;
  getColumn: (item: T) => C;
  onMove: (id: string, column: C) => void;
  renderCard: (item: T, state: { overlay?: boolean }) => React.ReactNode;
  columnMeta?: (items: T[]) => React.ReactNode;
  emptyLabel?: string;
  label: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = activeId ? items.find((i) => getId(i) === activeId) : undefined;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const to = e.over.id as C;
    const item = items.find((i) => getId(i) === e.active.id);
    if (item && getColumn(item) !== to) onMove(String(e.active.id), to);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        announcements: {
          onDragStart: () => "Picked up card. Use arrow keys to move between columns, space to drop.",
          onDragOver: ({ over }) => (over ? `Over ${columns.find((c) => c.id === over.id)?.label}` : "Not over a column"),
          onDragEnd: ({ over }) => (over ? `Dropped in ${columns.find((c) => c.id === over.id)?.label}` : "Dropped"),
          onDragCancel: () => "Move cancelled",
        },
      }}
    >
      <div
        role="region"
        aria-label={label}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:gap-4"
      >
        {columns.map((col) => {
          const colItems = items.filter((i) => getColumn(i) === col.id);
          return (
            <Column key={col.id} column={col} count={colItems.length} meta={columnMeta?.(colItems)} empty={emptyLabel}>
              <AnimatePresence initial={false}>
                {colItems.map((item) => (
                  <DraggableCard key={getId(item)} id={getId(item)} hidden={activeId === getId(item)}>
                    {renderCard(item, {})}
                  </DraggableCard>
                ))}
              </AnimatePresence>
            </Column>
          );
        })}
      </div>
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {active ? <div className="rotate-[2deg] cursor-grabbing shadow-pop">{renderCard(active, { overlay: true })}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column<C extends string>({
  column,
  count,
  meta,
  empty,
  children,
}: {
  column: KanbanColumn<C>;
  count: number;
  meta?: React.ReactNode;
  empty: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <section
      ref={setNodeRef}
      aria-label={`${column.label}, ${count} items`}
      className={cn(
        "flex max-h-[72dvh] w-[84vw] max-w-[320px] shrink-0 snap-start flex-col rounded-xl border border-border bg-subtle p-2 transition-colors sm:w-[300px] lg:max-h-[calc(100dvh-240px)] lg:min-h-[420px] lg:w-auto lg:max-w-none lg:min-w-[210px] lg:flex-1",
        isOver && "border-primary/50 bg-primary-soft/40",
      )}
    >
      <header className="flex items-center gap-2 px-2 pt-1.5 pb-3">
        <span className="size-2 rounded-full" style={{ background: column.color }} aria-hidden />
        <h3 className="text-[13px] font-semibold">{column.label}</h3>
        <span className="rounded-md bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tabular">{count}</span>
        {meta && <span className="ml-auto text-xs text-muted-foreground tabular">{meta}</span>}
      </header>
      <div className="scrollbar-thin -mx-1 flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto px-1 pb-1">
        {children}
        {count === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
            {empty}
          </div>
        )}
      </div>
    </section>
  );
}

function DraggableCard({ id, hidden, children }: { id: string; hidden: boolean; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: hidden ? 0.35 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="cursor-grab touch-manipulation rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing"
    >
      {children}
    </motion.div>
  );
}
