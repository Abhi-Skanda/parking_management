import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { useId } from "react";

const base =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100";

export function Input({
  label,
  className = "",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fid} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input id={fid} className={base} {...props} />
    </div>
  );
}

export function Select({
  label,
  className = "",
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fid} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select id={fid} className={base} {...props}>
        {children}
      </select>
    </div>
  );
}
