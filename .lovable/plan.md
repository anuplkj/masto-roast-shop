## Add coffee beans image to Story section

Replace the decorative Flame icon block on the homepage Story section with the uploaded coffee beans photo.

### Steps

1. Copy `user-uploads://pexels-cottonbro-4820675.jpg` to `src/assets/story-roasting.jpg`.
2. In `src/pages/Index.tsx`:
   - Import the image as an ES6 module.
   - Replace the gradient + Flame icon block (the right column of the Story section, around line 119) with an `<img>` filling the rounded `aspect-[4/3]` container, using `object-cover`, `loading="lazy"`, and a descriptive alt like "Freshly roasted coffee beans in the drum roaster".
   - Remove the now-unused `Flame` import usage from that section (keep it if still used elsewhere — it's also used in the Why Masto section, so keep the import).