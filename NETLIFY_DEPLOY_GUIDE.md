# 🚀 Netlify হোস্টিং ও 404 সমাধান গাইডলাইন

## ❓ কেন 404 Page Not Found আসছিল?
১. **ভুল ফোল্ডার আপলোড করা:** Netlify Drop-এ সম্পূর্ণ সোর্স কোড (package.json, src) দিলে Netlify index.html খুঁজে পায় না বা রান করতে পারে না। শুধুমাত্র বিল্ড করা 'dist' ফোল্ডারের ভেতরের ফাইলগুলো আপলোড করতে হবে।
২. **_redirects বা netlify.toml মিসিং:** React SPA-তে পেজ রিফ্রেশ দিলে 404 আসে যদি redirect রুল না থাকে।
৩. **সঠিক সমাধান:** এখন 'dist' ফোল্ডারের রুটে index.html এবং _redirects ফাইল যুক্ত করা হয়েছে।

## 🛠️ ১-ক্লিকে Netlify Drop ডিপ্লয়:
১. এই জিপটি আনজিপ (Extract) করুন।
২. ভেতরে দেখবেন সরাসরি index.html, _redirects এবং assets ফোল্ডার রয়েছে।
৩. ব্রাউজারে https://app.netlify.com/drop লিংকে যান।
৪. আনজিপ করা পুরো ফোল্ডারটি টেনে ড্রপজোনে ছেড়ে দিন।
৫. সাথে সাথে সাইট লাইভ হয়ে যাবে, কোনো 404 এরর আসবে না!

## 🔐 Firebase Authentication ঠিক করা:
Netlify যে লিংক দিবে (যেমন: your-site.netlify.app), সেটি Firebase Console-এ যান:
Authentication > Settings > Authorized domains > Add domain-এ গিয়ে যুক্ত করুন।
