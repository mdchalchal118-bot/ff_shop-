# FF SHOP হোস্টিং গাইডলাইন (Hosting Solutions)

## ১. cPanel / Shared Hosting (Hostinger, Namecheap, ইত্যাদি):
1. প্রজেক্টটি বিল্ড করুন: `npm run build`
2. আপনার `dist/` ফোল্ডারের ভেতরে থাকা সব ফাইল (যেমন: index.html, .htaccess, assets ফোল্ডার) জিপ করে cPanel File Manager-এর `public_html` ফোল্ডারে আপলোড করে Extract করুন।
3. **গুরুত্বপূর্ণ**: `.htaccess` ফাইলটি অবশ্যই `public_html`-এ থাকতে হবে (এটি 404 পেজ রিফ্রেশ সমস্যা রোধ করে)।

## ২. Vercel এ হোস্টিং:
1. GitHub-এ কোড পুশ করে Vercel-এ ইমপোর্ট করুন।
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. প্রজেক্টের সাথে দেওয়া `vercel.json` ফাইলটি স্বয়ংক্রিয়ভাবে রিফ্রেশ সমস্যা সমাধান করবে।

## ৩. Render / Railway / Node.js VPS এ হোস্টিং:
1. Build Command: `npm run build`
2. Start Command: `npm start` (বা `node server.js`)
