"use client";

import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Themed dropdown with a native-<select>-compatible API:
 *  - children are plain <option value="…">label</option> elements
 *  - works controlled (`value` + `onChange(e)`) for filters
 *  - works with React Hook Form `{...register("field")}`: RHF receives a ref
 *    object whose `value` getter/setter is wired to this component's state, so
 *    `reset()` / `setValue()` update the UI, and onChange/onBlur receive
 *    `{ target: { name, value } }` events.
 * The popup is fully styled (light/dark), keyboard accessible with type-ahead.
 */

const EMPTY = "__nf_empty__";

interface Opt {
  value: string;
  label: React.ReactNode;
  text: string;
  disabled?: boolean;
}

type ChangeLike = { target: { name?: string; value: string }; type: string };

export interface SelectProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeLike | React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: ChangeLike | React.FocusEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  placeholder?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
}

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function parseOptions(children: React.ReactNode): Opt[] {
  const out: Opt[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<{ value?: string | number; children?: React.ReactNode; disabled?: boolean }>(child)) return;
    const text = textOf(child.props.children);
    const value = child.props.value !== undefined ? String(child.props.value) : text;
    out.push({ value, label: child.props.children, text, disabled: child.props.disabled });
  });
  return out;
}

export const Select = React.forwardRef<unknown, SelectProps>(function Select(
  { id, name, value, defaultValue, onChange, onBlur, disabled, className, children, placeholder, ...aria },
  ref,
) {
  const options = React.useMemo(() => parseOptions(children), [children]);
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue ?? "");
  const current = controlled ? value : inner;
  const currentRef = React.useRef(current);
  React.useLayoutEffect(() => {
    currentRef.current = current;
  }, [current]);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Ref handle understood by React Hook Form (value get/set + focus).
  // It must keep the same identity for the component's lifetime: RHF passes a new ref
  // callback every render and treats a new handle object as a new field (re-sets value
  // and notifies watchers), which would loop with useWatch().
  const nameRef = React.useRef(name);
  React.useLayoutEffect(() => {
    nameRef.current = name;
  }, [name]);
  const [handle] = React.useState(() => ({
    get name() {
      return nameRef.current;
    },
    get value() {
      return currentRef.current;
    },
    set value(v: string) {
      const next = v == null ? "" : String(v);
      currentRef.current = next;
      setInner(next);
    },
    focus: () => triggerRef.current?.focus(),
  }));
  React.useImperativeHandle(ref, () => handle, [handle]);

  // An empty-value option labelled "Select…" acts as the placeholder, not an item.
  const placeholderOpt = options.find((o) => o.value === "" && /^select/i.test(o.text));
  const items = options.filter((o) => o !== placeholderOpt);
  const hasEmptyItem = items.some((o) => o.value === "");
  const radixValue = current === "" ? (hasEmptyItem ? EMPTY : "") : current;

  const emit = (v: string) => {
    currentRef.current = v;
    if (!controlled) setInner(v);
    onChange?.({ target: { name, value: v }, type: "change" });
  };

  return (
    <SelectPrimitive.Root
      value={radixValue}
      onValueChange={(v) => emit(v === EMPTY ? "" : v)}
      onOpenChange={(open) => {
        if (!open) onBlur?.({ target: { name, value: currentRef.current }, type: "blur" });
      }}
      disabled={disabled}
      name={name}
    >
      <SelectPrimitive.Trigger
        ref={triggerRef}
        id={id}
        aria-label={aria["aria-label"]}
        aria-invalid={aria["aria-invalid"]}
        aria-describedby={aria["aria-describedby"]}
        className={cn(
          "group flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-left text-sm text-foreground shadow-[0_1px_1px_rgb(16_24_40/0.03)] transition-[border-color,box-shadow,background-color] outline-none",
          "hover:border-primary/40 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 data-[state=open]:border-primary data-[state=open]:ring-3 data-[state=open]:ring-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/15",
          "data-[placeholder]:text-muted-foreground",
          className,
        )}
      >
        <span className="min-w-0 truncate">
          <SelectPrimitive.Value placeholder={placeholder ?? placeholderOpt?.text ?? "Select…"} />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={10}
          className="nf-menu relative z-[60] max-h-[min(var(--radix-select-content-available-height),320px)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-pop"
        >
          <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center text-muted-foreground">
            <ChevronUp className="size-4" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1.5">
            {items.map((o) => (
              <SelectPrimitive.Item
                key={o.value || EMPTY}
                value={o.value === "" ? EMPTY : o.value}
                disabled={o.disabled}
                className={cn(
                  "relative flex cursor-pointer items-center gap-2 rounded-lg py-2 pr-9 pl-3 text-[13.5px] text-foreground outline-none select-none",
                  "data-[highlighted]:bg-primary-soft data-[highlighted]:text-primary",
                  "data-[state=checked]:font-semibold",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                )}
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center text-muted-foreground">
            <ChevronDown className="size-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});
