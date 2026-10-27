HOW TO USE
This site uses clean links (no .html), for example /en/services/ac-repair.
- Publish on Vercel: drag this whole folder into a new Vercel project (Framework: Other, no build command, output = this folder).
  vercel.json is included: it turns on clean URLs, sends Arabic browsers to /ar/ and everyone else to /en/,
  and adds basic security and caching headers.
- Preview on your computer: double-clicking the files will NOT work with clean links. Run "npx serve ." inside this folder
  and open the address it shows.
- Keep all folders together: en/, ar/, assets/, vercel.json.

BEFORE YOU PUBLISH
  Phone/WhatsApp (+966507632925) and the business name are already set.
  Arabic name used: شركة نوال لتكييف الهواء والصيانة بالرياض  -> check it and change it if you prefer another spelling.
  Domain set to https://www.nawalrepair-maintenanceriyadh.com (canonical, hreflang, sitemap.xml, robots.txt). Change SITE_URL in the generator if it ever changes.

PICTURES
- Real job photos are in assets/photos/ (shown on the home page, the Our Work page and some service pages).
  Each photo has a full size file and a "-sm" thumbnail. To swap one, replace both files keeping the same names.
- Cards, the home hero, the request section and the call-to-action banner use cropped versions of these photos in assets/crops/.
  To change one, replace the file keeping the same name and size (card-*.jpg 800x533, hero-a 720x900, hero-b/c 560x560, req 900x675, cta 1600x640).
- Only use photos you own or have permission to use. Photo captions are in scripts/content/design.ts.

REVIEWS
- Open assets/reviews.js and add ONLY real customer reviews (name, rating, text, lang, date).
- Put your Google review link in window.REVIEW_LINK to show a "Review us on Google" button.

NOTES
- The request form checks the fields, then opens WhatsApp with the message ready to send. It stores nothing.
- Services are listed from the content written for you. Remove any you do not actually offer.
- Privacy Policy and Terms are general drafts: have them reviewed before publishing.
- Other hosts (Netlify, cPanel, GitHub Pages) need their own clean-URL setting; Vercel is the recommended host.
