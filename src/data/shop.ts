export type Locale = 'ar' | 'en'
export type ServiceType = 'pickup' | 'delivery'
export type MenuCategory = 'sandwiches' | 'pies' | 'plates' | 'boxes' | 'drinks'

export type LocalizedText = {
  ar: string
  en: string
}

export type MenuItem = {
  id: string
  category: MenuCategory
  name: LocalizedText
  description?: LocalizedText
  calories?: number
  price: number
  popular?: boolean
}

export const siteContent = {
  brand: {
    ar: 'فلافل لذة الطعام',
    en: 'Lazzat Al Taam Falafel',
  },
  tagline: {
    ar: 'نكهة شعبية محبوبة بطابع عصري وسريع',
    en: 'A beloved neighborhood falafel spot with a modern, fast-flow experience',
  },
  heroTitle: {
    ar: 'منيو واضح. طلب أسرع. وهوية تشبه المحل.',
    en: 'A clear menu, faster ordering, and a storefront identity that feels familiar.',
  },
  heroDescription: {
    ar: 'تجربة رقمية لمحل فلافل محلي تعرض السندوتشات والفطائر والصحون والبوكسات، ثم تنقلك مباشرة إلى صندوق الطلبات لتحديد الأصناف وإرسال الطلب بسهولة.',
    en: 'A digital experience for a local falafel shop that showcases sandwiches, pies, plates, boxes, and drinks before moving customers into a focused ordering desk.',
  },
  orderDescription: {
    ar: 'اختر أصنافك، حدّد نوع الخدمة، وأرسل الطلب خلال دقائق.',
    en: 'Pick your items, choose the service type, and send the order within minutes.',
  },
}

const heroPrompt = encodeURIComponent(
  'traditional Arab falafel storefront on a quiet evening street, olive green and terracotta palette, handcrafted Arabic signage, warm lantern glow, rustic tile textures, inviting realistic commercial photography, no closeup food, no people, high detail',
)

const orderPrompt = encodeURIComponent(
  'stylish takeaway order counter for a Middle Eastern falafel shop, branded paper order box, warm beige and olive palette, subtle Arabic pattern details, realistic product photography, no visible food, high detail',
)

export const heroImageUrl = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${heroPrompt}&image_size=landscape_16_9`
export const orderImageUrl = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${orderPrompt}&image_size=landscape_4_3`

export const categoryLabels: Record<MenuCategory, LocalizedText> = {
  sandwiches: { ar: 'السندوتشات', en: 'Sandwiches' },
  pies: { ar: 'الفطائر', en: 'Pies' },
  plates: { ar: 'الصحون', en: 'Plates' },
  boxes: { ar: 'البوكسات', en: 'Boxes' },
  drinks: { ar: 'المشروبات', en: 'Drinks' },
}

export const menuItems: MenuItem[] = [
  { id: 'sand-4-falafel', category: 'sandwiches', name: { ar: 'فلافل 4 حبات', en: '4 Falafel Pieces' }, calories: 120, price: 1 },
  { id: 'sand-mix-regular', category: 'sandwiches', name: { ar: 'سندويش مشكل عادي', en: 'Regular Mixed Sandwich' }, calories: 431, price: 4, popular: true },
  { id: 'sand-egg', category: 'sandwiches', name: { ar: 'سندويش مشكل فلافل بيض', en: 'Falafel and Egg Sandwich' }, calories: 488, price: 5 },
  { id: 'sand-hummus', category: 'sandwiches', name: { ar: 'سندويش مشكل فلافل + حمص', en: 'Falafel and Hummus Sandwich' }, calories: 496, price: 5 },
  { id: 'sand-cheese-egg', category: 'sandwiches', name: { ar: 'سندويش مشكل فلافل + جبن + بيض', en: 'Falafel, Cheese, and Egg Sandwich' }, calories: 579, price: 6, popular: true },
  { id: 'sand-hummus-egg', category: 'sandwiches', name: { ar: 'سندويش مشكل فلافل + حمص + بيض', en: 'Falafel, Hummus, and Egg Sandwich' }, calories: 555, price: 6 },
  { id: 'sand-all-in', category: 'sandwiches', name: { ar: 'سندويش مشكل فلافل + حمص + بيض + جبن', en: 'Falafel, Hummus, Egg, and Cheese Sandwich' }, calories: 646, price: 7 },
  { id: 'pie-regular', category: 'pies', name: { ar: 'فطيرة فلافل عادي', en: 'Regular Falafel Pie' }, calories: 771, price: 8 },
  { id: 'pie-double-cheese', category: 'pies', name: { ar: 'فطيرة جبنتين', en: 'Double Cheese Pie' }, calories: 862, price: 9 },
  { id: 'pie-special', category: 'pies', name: { ar: 'فطيرة سبيشل', en: 'Special Pie' }, calories: 919, price: 10, popular: true },
  { id: 'pie-chicken', category: 'pies', name: { ar: 'فطيرة دجاج', en: 'Chicken Pie' }, calories: 1141, price: 13 },
  { id: 'pie-cheese', category: 'pies', name: { ar: 'فطيرة أجبان', en: 'Cheese Pie' }, calories: 713, price: 11 },
  { id: 'pie-zaatar-cheese', category: 'pies', name: { ar: 'فطيرة جبن زعتر', en: 'Cheese and Zaatar Pie' }, calories: 720, price: 6 },
  { id: 'pie-egg-cheese', category: 'pies', name: { ar: 'فطيرة بيض جبن', en: 'Egg and Cheese Pie' }, calories: 650, price: 6 },
  { id: 'plate-fries-small', category: 'plates', name: { ar: 'صحن بطاطس - صغير', en: 'French Fries Plate - Small' }, calories: 248, price: 4 },
  { id: 'plate-fries-large', category: 'plates', name: { ar: 'صحن بطاطس - كبير', en: 'French Fries Plate - Large' }, calories: 495, price: 6 },
  { id: 'plate-hummus', category: 'plates', name: { ar: 'صحن حمص', en: 'Hummus Plate' }, calories: 573, price: 6 },
  { id: 'plate-mixed-small', category: 'plates', name: { ar: 'صحن مشكل - صغير', en: 'Mixed Plate - Small' }, calories: 987, price: 12 },
  { id: 'plate-mixed-medium', category: 'plates', name: { ar: 'صحن مشكل - وسط', en: 'Mixed Plate - Medium' }, calories: 1453, price: 19, popular: true },
  { id: 'plate-mixed-large', category: 'plates', name: { ar: 'صحن مشكل - كبير', en: 'Mixed Plate - Large' }, calories: 2294, price: 29 },
  { id: 'box-arabi', category: 'boxes', name: { ar: 'بوكسات لذة عربي', en: 'Lazzat Arabi Box' }, description: { ar: '6 حبات فلافل بخبز عادي أو بر', en: '6 falafel pieces with white or wheat bread' }, calories: 1400, price: 28, popular: true },
  { id: 'box-mixed-pies', category: 'boxes', name: { ar: 'بوكسات فطائر مكس', en: 'Mixed Pie Box' }, description: { ar: 'دجاج، فلافل، بيض جبن', en: 'Chicken, falafel, and egg with cheese selection' }, calories: 2710, price: 28 },
  { id: 'drink-soda', category: 'drinks', name: { ar: 'مشروب غازي', en: 'Soft Drink' }, price: 3 },
  { id: 'drink-rabea', category: 'drinks', name: { ar: 'عصير الربيع', en: 'Rabea Juice' }, price: 2 },
  { id: 'drink-tea-milk', category: 'drinks', name: { ar: 'حليب شاي', en: 'Milk Tea' }, price: 2 },
  { id: 'drink-tea', category: 'drinks', name: { ar: 'شاي', en: 'Tea' }, price: 1 },
  { id: 'drink-water-regular', category: 'drinks', name: { ar: 'مياه', en: 'Water' }, description: { ar: 'عبوة قياسية', en: 'Regular bottle' }, price: 1 },
  { id: 'drink-water-small', category: 'drinks', name: { ar: 'مياه', en: 'Water' }, description: { ar: 'عبوة صغيرة', en: 'Small bottle' }, price: 0.5 },
  { id: 'drink-karak', category: 'drinks', name: { ar: 'كرك', en: 'Karak' }, price: 3, popular: true },
]

export const defaultMenuAvailabilityMap = Object.fromEntries(menuItems.map((item) => [item.id, true])) as Record<string, boolean>

export const audienceHighlights = [
  { ar: 'مناسب للدخول بالكراسي المتحركة', en: 'Wheelchair-accessible entrance' },
  { ar: 'توصيل بدون تلامس', en: 'No-contact delivery' },
  { ar: 'سفري وجلسات داخلية', en: 'Takeaway and dine-in' },
  { ar: 'فطور وعشاء', en: 'Breakfast and dinner' },
  { ar: 'خيارات نباتية ونباتية صارمة', en: 'Vegetarian and vegan options' },
  { ar: 'مناسب للطلاب والأكل الفردي', en: 'Great for students and solo diners' },
]

export const atmosphereHighlights = [
  { ar: 'جو كاجوال هادئ وعصري', en: 'Casual, quiet, and trendy atmosphere' },
  { ar: 'عادة يوجد انتظار في أوقات الذروة', en: 'Usually a wait during peak hours' },
  { ar: 'يقبل الحجوزات', en: 'Accepts reservations' },
  { ar: 'مواقف مجانية كثيرة', en: 'Free and plenty of parking' },
]

export const serviceOptions = [
  { ar: 'توصيل', en: 'Delivery' },
  { ar: 'استلام من المحل', en: 'Pickup' },
  { ar: 'سفري', en: 'Takeaway' },
  { ar: 'جلسات داخلية', en: 'Dine-in' },
]

export const stats = [
  { value: '27', label: { ar: 'صنف في المنيو', en: 'Menu items' } },
  { value: '5', label: { ar: 'أقسام رئيسية', en: 'Main sections' } },
  { value: '2', label: { ar: 'واجهات مترابطة', en: 'Connected sites' } },
]
