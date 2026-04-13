# ABG Visual Redesign Plan for Maoyan VIP

This document outlines the steps to transform the current "Dark Gold" aesthetic of Maoyan VIP into the "Achromatic Minimalism" style of Authentic Brands Group (ABG).

## 1. Core Visual Identity (ABG Standards)

| Element | Specification |
| :--- | :--- |
| **Primary Colors** | Navy (`#122849`), Black (`#000000`), White (`#FFFFFF`) |
| **Secondary Colors** | Off-white (`#F5F5F2`), Gray Mid (`#555555`), Gray Light (`#999999`) |
| **Typography** | Serif: `Playfair Display` (for headings), Sans-serif: `Inter` (for body) |
| **Letter Spacing** | 3-5px for headings and navigation items |
| **Design Style** | Minimalist, high contrast, spacious, professional |

## 2. Global Style Changes (`src/index.css`)

- Update CSS variables to match ABG palette.
- Change default background from dark (`#0c0d10`) to white (`#FFFFFF`) or off-white (`#F5F5F2`).
- Update text colors to Black/Navy.
- Remove gold gradients and replace with solid Navy or Black.
- Update scrollbar to be more subtle.

## 3. Layout Updates (`src/components/layout/AppLayout.tsx`)

- **Sidebar**: Change background to Navy (`#122849`) or White with a clean border.
- **Navigation**: Use uppercase text with 3px letter spacing. Remove gold active states, use Navy/Black underlines or subtle backgrounds.
- **Logo**: Update `MaoLogo` colors to match the new theme (Navy/White).

## 4. Page-Specific Updates

### Landing Page (`src/pages/LandingPage.tsx`)
- Transform the hero section into a clean, high-fashion look.
- Use `Playfair Display` for large headings.
- Replace gold buttons with solid Navy or outlined Black buttons.
- Use more white space between sections.

### Dashboard & Internal Pages
- Clean up cards: remove heavy shadows and gradients.
- Use thin borders (`1px solid #E8E8E4`) instead of dark backgrounds.
- Update data visualizations to use Navy/Gray tones.

## 5. Implementation Steps

1. **Step 1**: Update `index.css` with new variables and global styles.
2. **Step 2**: Modify `AppLayout.tsx` for the new navigation and sidebar look.
3. **Step 3**: Refactor `LandingPage.tsx` to reflect the ABG brand essence.
4. **Step 4**: Batch update other pages (Dashboard, Profile, etc.) to ensure consistency.
5. **Step 5**: Verify all components (buttons, inputs, cards) follow the new guide.
