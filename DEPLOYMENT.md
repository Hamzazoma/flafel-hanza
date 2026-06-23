# نشر المشروع على Netlify

هذا المشروع أصبح جاهزًا للعمل بهذه البنية:

- موقع العملاء: Frontend + API عبر `Netlify Functions`.
- لوحة الإدارة: Frontend مستقل.
- التخزين: `Netlify Blobs`.

## 1. تثبيت وبناء

```bash
npm install
npm run build
npm run build:admin
```

سينتج:

- `dist` لموقع العملاء.
- `dist-admin` للوحة الإدارة.

## 2. موقع العملاء على Netlify

أنشئ موقع Netlify أول بالمواصفات التالية:

- Build command: `npm run build`
- Publish directory: `dist`

هذا الموقع سيحتوي على:

- الواجهة الأساسية.
- `Netlify Functions` الموجودة داخل `api`.
- `Netlify Blobs` التي تحفظ الطلبات.

## 3. لوحة الإدارة على Netlify

أنشئ موقع Netlify ثاني بالمواصفات التالية:

- Build command: `npm run build:admin`
- Publish directory: `dist-admin`

ثم أضف متغير البيئة التالي داخل موقع الإدارة:

```env
VITE_API_BASE_URL=https://your-main-site.netlify.app
```

السبب:

- لوحة الإدارة منشورة على موقع Netlify مختلف.
- لذلك يجب أن تقرأ الطلبات من API الموقع الأساسي.

## 4. حماية لوحة الإدارة

داخل موقع العملاء الأساسي في Netlify أضف متغير البيئة:

```env
ADMIN_ACCESS_KEY=your-secret-key
```

ثم داخل لوحة الإدارة:

- افتح الشاشة.
- اكتب نفس المفتاح في حقل "رمز الإدارة".
- اضغط "حفظ الرمز".

عندها ستتمكن لوحة الإدارة من:

- قراءة الطلبات.
- تحديث حالتها.

## 5. الدومين لاحقًا

إذا اشتريت دومين لاحقًا:

- اربط الموقع الأساسي بـ `example.com`
- اربط لوحة الإدارة بـ `admin.example.com`

وسيظل `VITE_API_BASE_URL` في لوحة الإدارة يشير إلى:

```env
VITE_API_BASE_URL=https://example.com
```

لأن Functions الخاصة بالطلبات تعمل على الموقع الأساسي.

## 6. الـ API المستخدمة

المشروع يعتمد على هذه الـ endpoints:

- `/.netlify/functions/orders-submit`
- `/.netlify/functions/orders-list`
- `/.netlify/functions/orders-update`

## 7. ما الذي يحدث عند إرسال طلب؟

1. العميل يختار الأصناف ويرسل الطلب.
2. الطلب يذهب إلى `orders-submit`.
3. الـ Function تحفظ الطلب في `Netlify Blobs`.
4. لوحة الإدارة تطلب البيانات من `orders-list`.
5. عند تغيير الحالة، يتم استدعاء `orders-update`.

## 8. ملاحظات مهمة

- إذا نشرت الموقع الأساسي فقط، فالطلبات ستعمل.
- إذا نشرت لوحة الإدارة على موقع Netlify منفصل، يجب ضبط `VITE_API_BASE_URL`.
- بدون `ADMIN_ACCESS_KEY` ستبقى قراءة الإدارة مفتوحة.
- مع `ADMIN_ACCESS_KEY` تصبح قراءة وتحديث الطلبات محمية بمفتاح بسيط.

## 9. ما لا أستطيع تنفيذه من هنا

لا يمكنني إنشاء موقع Netlify فعليًا أو ربطه بحسابك أو بدومينك من داخل هذه البيئة بدون:

- صلاحية على حساب Netlify.
- أو توكن API.
- أو بيانات الدومين لاحقًا.

لكن المشروع نفسه الآن جاهز للنشر على Netlify مباشرة.
