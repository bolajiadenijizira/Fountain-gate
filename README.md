# Fountain Gate Montessori School website

Run: open `index.html`, or in this folder run `python3 -m http.server 8000` and visit http://localhost:8000
Deploy: upload the whole folder to Netlify, GitHub Pages, Cloudflare Pages or any web host.

- Colors and layout: `css/style.css` (variables at the top). Your earlier per-page CSS is kept in `css/original/` for reference.
- Text: edit the `.html` files directly.
- Photos: put files in `images/` (see `images/README.txt`). Missing photos show a labelled placeholder.
- Contact details: phone, email and address appear in `contact.html`, the footers and `js/script.js` (CONFIG).
- Forms (Contact, Admissions) post to FormSubmit and are delivered to fountaingatemontessorijalingo@gmail.com. One-time step: after the first test submission, open that inbox and click the activation link FormSubmit sends. To use another service, change `formEndpoint` in `js/script.js`.
