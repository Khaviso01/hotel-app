import type { ReactNode } from 'react';

// Admin Dashboard overview displaying performance metrics and quick navigation actions.
export function Heading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <h1>{title}</h1>
      {action}
    </div>
  );
}
