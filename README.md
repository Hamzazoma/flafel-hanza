# مشروع مطعم فلافل

المشروع أصبح يحتوي على 3 أجزاء مترابطة:

- موقع العملاء.
- لوحة إدارة مستقلة.
- Backend خفيف عبر `Netlify Functions` مع تخزين الطلبات في `Netlify Blobs`.

## الأوامر

```bash
npm install
npm run dev
npm run dev:admin
npm run build
npm run build:admin
npm run preview
npm run preview:admin
```

## ناتج البناء

- `npm run build` ينتج `dist` للموقع الأساسي.
- `npm run build:admin` ينتج `dist-admin` للوحة الإدارة.
- وظائف الـ API موجودة داخل مجلد `api`.

## البنية

- `src` واجهة العملاء.
- `src/admin` مكونات لوحة الإدارة.
- `admin` مدخل لوحة الإدارة المستقلة.
- `api` وظائف Netlify الخاصة بالطلبات.
- `netlify.toml` إعداد Netlify للموقع الأساسي والـ Functions.

## كيف يعمل الربط

- العميل يرسل الطلب إلى `/.netlify/functions/orders-submit`.
- لوحة الإدارة تقرأ الطلبات من `/.netlify/functions/orders-list`.
- تحديث حالة الطلب يتم عبر `/.netlify/functions/orders-update`.
- البيانات تُحفظ في `Netlify Blobs`.

## نشر Netlify

راجع [DEPLOYMENT.md](file:///c:/Users/Acer/Downloads/تصميم_موقع_مطعم_فلافل/DEPLOYMENT.md) لمعرفة:

- طريقة نشر موقع العملاء.
- طريقة نشر لوحة الإدارة على موقع Netlify منفصل أو `subdomain`.
- متغير `VITE_API_BASE_URL` المطلوب عند فصل لوحة الإدارة عن موقع العملاء.
- متغير `ADMIN_ACCESS_KEY` لحماية لوحة الإدارة.
