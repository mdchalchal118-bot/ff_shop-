# 🚀 Web Hosting & Deployment Guide (Netlify, GitHub Pages, Vercel & cPanel)

## ❓ কেন GitHub বা Hosting Server-এ 404 Page Not Found বা Blank Screen আসছিল?
১. **সোর্স কোড বনাম Production Build:** 
   - ব্রাউজার সরাসরি কাঁচা `.tsx` বা TypeScript কোড রান করতে পারে না। ব্রাউজারে সাইট চলতে হলে `npm run build`-এর মাধ্যমে তৈরি `dist/` ফোল্ডারের কম্পাইল করা `index.html`, `assets/*.js` এবং `assets/*.css` প্রয়োজন হয়।
   - GitHub-এ আপলোড করার সময় আপনি যদি বিল্ড ছাড়া আপলোড করেন এবং হোস্টিং প্রোভাইডারে বিল্ড কমান্ড (`npm run build`) না দেন, তবে সার্ভার `main.tsx` এক্সিকিউট করতে না পেরে 404 বা ব্ল্যাঙ্ক পেজ দেখায়।
২. **esbuild ও npm peer dependency সমস্যা:**
   - `package.json`-এ পুরনো `esbuild` কনফ্লিক্ট ছিল যা আমরা স্থায়ীভাবে রিমুভ করেছি এবং ফ্রেশ `package-lock.json` জেনারেট করেছি যাতে Netlify/Vercel/GitHub Actions-এ `npm install` কখনো ফেইল না করে।
৩. **Missing SPA Redirects:**
   - React SPA-তে পেজ রিফ্রেশ বা ডিপ লিংক (`/#guild-glory`, `/admin`) হ্যান্ডেল করতে `_redirects`, `netlify.toml`, `vercel.json` এবং `.htaccess` প্রয়োজন হয়, যা এখন সম্পূর্ণ যুক্ত করা আছে।
৪. **GitHub Pages Automation:**
   - GitHub রিপোজিটরির জন্য `.github/workflows/deploy.yml` যুক্ত করা হয়েছে, যাতে কোড পুশ করলেই GitHub Actions স্বয়ংক্রিয়ভাবে প্রজেক্ট বিল্ড করে লাইভ করে দেয়।

---

## 🛠️ পদ্ধতি ১: ১-ক্লিকে Netlify Drop ডিপ্লয় (কোনো কোডিং বা Git ছাড়া)
১. Admin Panel-এর "Hosting & Export" ট্যাব থেকে **DOWNLOAD NETLIFY READY ZIP (dist)** ডাউনলোড করুন।
২. জিপ ফাইলটি আপনার ডিভাইসে আনজিপ (Extract) করুন।
৩. আনজিপ করা ফোল্ডারের ভেতর সরাসরি `index.html`, `_redirects`, `.htaccess` এবং `assets/` ফোল্ডার দেখতে পাবেন।
৪. ব্রাউজারে যান: https://app.netlify.com/drop
৫. আনজিপ করা পুরো ফোল্ডারটি টেনে Netlify Drop বক্সে ছেড়ে দিন।
৬. সাথে সাথে আপনার সাইট লাইভ হয়ে যাবে!

---

## 🛠️ পদ্ধতি ২: GitHub দিয়ে Netlify-তে ডিপ্লয়
১. এই প্রজেক্টের সম্পূর্ণ সোর্স কোড জিপ (**DOWNLOAD SOURCE CODE (.ZIP)**) ডাউনলোড করে আনজিপ করুন।
২. আপনার GitHub অ্যাকাউন্টে একটি নতুন রিপোজিটরি তৈরি করে ফাইলগুলো পুশ (Upload) করুন।
৩. Netlify-তে লগইন করে "Add new site" > "Import an existing project" > "GitHub" সিলেক্ট করুন।
৪. আপনার রিপোজিটরি সিলেক্ট করুন।
৫. আমাদের দেয়া `netlify.toml` ফাইলের কারণে Build command (`npm run build`) এবং Publish directory (`dist`) স্বয়ংক্রিয়ভাবে সেট হয়ে যাবে।
৬. "Deploy" বাটনে ক্লিক করুন। ২ মিনিটের মধ্যে সাইট লাইভ হবে!

---

## 🛠️ পদ্ধতি ৩: GitHub Pages (স্বয়ংক্রিয় GitHub Actions)
১. কোড GitHub রিপোজিটরিতে পুশ করুন।
২. GitHub রিপোজিটরির **Settings** > **Pages**-এ যান।
৩. "Build and deployment" এর নিচে **Source** অপশনে "GitHub Actions" সিলেক্ট করুন।
৪. প্রজেক্টের সাথে যুক্ত `.github/workflows/deploy.yml` স্বয়ংক্রিয়ভাবে রান করবে এবং সাইট লাইভ করে দেবে!

---

## 🔐 Firebase Authentication ঠিক করা:
হোস্টিং সাইট লাইভ হওয়ার পর যে লিংক পাবেন (যেমন: `your-site.netlify.app` বা `username.github.io`):
১. Firebase Console-এ যান: https://console.firebase.google.com
২. আপনার প্রজেক্ট সিলেক্ট করুন।
৩. Authentication > Settings > Authorized domains-এ যান।
৪. "Add domain" বাটনে ক্লিক করে আপনার হোস্টিং সাইটের ডোমেইন যুক্ত করুন।
