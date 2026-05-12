---
description: Scaffold a shadcn-style component with a unit test (and Storybook story if Storybook is installed).
argument-hint: <ComponentName>
---

Scaffold a new component named **$ARGUMENTS**.

## Steps

1. **Validate the name.** It must be PascalCase (e.g., `UserCard`, `PriceTag`). If `$ARGUMENTS` is empty or not PascalCase, ask the user for a valid name and stop.

2. **Decide the location.**
   - Default to `src/components/<kebab-case-name>.tsx` (e.g., `UserCard` → `src/components/user-card.tsx`).
   - If the user implied a different location in the prompt, use that instead.
   - If a file already exists at the target path, stop and ask whether to overwrite.

3. **Detect the project's conventions before writing:**
   - Read `tsconfig.json` to confirm the `@/` alias is configured.
   - Read `src/lib/utils.ts` (or grep for `function cn`) to confirm the `cn()` helper exists. If it doesn't, use plain string concatenation instead.
   - Check whether `.storybook/` exists in the project root.
   - Look at one existing component in `src/components/` (if any) and match its style.

4. **Create the component file** using this template, adapted to what you found:

```tsx
import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface <ComponentName>Props extends HTMLAttributes<HTMLDivElement> {
  // Add typed props here. Delete this comment when you do.
}

export const <ComponentName> = forwardRef<HTMLDivElement, <ComponentName>Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    )
  }
)

<ComponentName>.displayName = '<ComponentName>'
```

Replace `<ComponentName>` with the actual PascalCase name. Replace the root element (`<div>`) with the appropriate semantic element if the component name implies one (e.g., `Card` → `<article>`, `NavBar` → `<nav>`, `Button` → `<button>` extending `ButtonHTMLAttributes<HTMLButtonElement>`).

5. **Create a co-located unit test** at `src/components/<kebab-case-name>.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { <ComponentName> } from './<kebab-case-name>'

describe('<<ComponentName> />', () => {
  it('renders children', () => {
    render(<<ComponentName>>hello</<ComponentName>>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('forwards className', () => {
    const { container } = render(<<ComponentName> className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
```

6. **If Storybook exists** (`.storybook/` directory present), create `src/components/<kebab-case-name>.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { <ComponentName> } from './<kebab-case-name>'

const meta: Meta<typeof <ComponentName>> = {
  title: 'Components/<ComponentName>',
  component: <ComponentName>,
}
export default meta

type Story = StoryObj<typeof <ComponentName>>

export const Default: Story = {
  args: {
    children: 'Default content',
  },
}
```

If Storybook is not installed, skip this file silently — don't ask, don't suggest installing it.

7. **Report what you created.** List the file paths, point out the placeholder `interface` and empty `className=''` as the two things the user should fill in next.

## Hard Rules

- **Don't generate fake props.** The template's `interface` is intentionally empty. The user adds real props.
- **Don't write a component that ships unused imports.** If you removed `cn()` because the helper doesn't exist, also remove the import.
- **Don't add `'use client'`** unless the component obviously needs it (state, effects, event handlers beyond simple ones). Adding `'use client'` defensively defeats the App Router default.
- **Don't add styling.** The empty `className=''` is the right default. Styling belongs in a follow-up edit by the user.
