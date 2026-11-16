# Books 2026

A personal reading log for 2026: what I've read, what I'm reading now, and the pile I'm working through.

**Live site:** _add your GitHub Pages link here_

## What it shows

- **Currently reading**: each book in progress, with a progress bar (page 400 of 528).
- **Read**: covers in the order I finished them, with my rating and page count.
- **2026 list**: a numbered list of the year so far, with totals for books, pages and average rating.
- **To read**: the to-read pile, shortest book first.
- Tap any book for its details.

Direct links work for each view: `#list` opens the 2026 list and `#toread` opens the to-read pile.

## How it's built

A small static site with no framework and no build step:

| File | What it does |
| --- | --- |
| `index.html` | Page structure |
| `style.css` | Design: colour tokens, light and dark themes, responsive grid |
| `app.js` | Loads `books.json` and renders every view |
| `books.json` | The data: one record per book |
| `covers/` | Cover images, one per book |

It's hosted free on GitHub Pages straight from this repository.

The project was built with [Claude](https://claude.ai). It started as a private reading tracker with ratings, covers, ownership tags and a to-read list sorted by length, and this site is its public, read-only edition.

## Updating the list

Edit `books.json` and commit. Each book looks like this:

```json
{
  "id": "b18",
  "title": "How to Hide an Empire: A History of the Greater United States",
  "author": "Daniel Immerwahr",
  "status": "reading",
  "rating": null,
  "pages": 528,
  "currentPage": 400,
  "cover": "covers/b18.jpg",
  "n": 18
}
```

- `status` is `read`, `reading` or `toread`.
- `order` sets a read book's position in the 2026 list; books without it fall back to `n`.
- `rating` can be a half number, like `3.5`.
- A book with no `cover` gets a plain cloth-style cover with its title.

Then update `updated` at the top of the file so the footer shows the right date.
