import { useEffect, useSyncExternalStore } from "react";

export type Language = "en" | "my";

const STORAGE_KEY = "surplushub.language.v1";
const LANGUAGE_EVENT = "surplushub:language-change";

const en = {
  "language.label": "Language mode",
  "language.english": "EN",
  "language.myanmar": "MM",
  "language.switchToEnglish": "Switch to English",
  "language.switchToMyanmar": "Switch to Myanmar",
  "logo.tagline": "Circular B2B",
  "nav.home": "Home",
  "nav.marketplace": "Marketplace",
  "nav.wanted": "Material Wanted",
  "nav.businesses": "Businesses",
  "nav.impact": "Impact",
  "nav.about": "About",
  "nav.howItWorks": "How It Works",
  "nav.trust": "Trust & Safety",
  "nav.businessModel": "Business Model",
  "nav.aboutNavigation": "About navigation",
  "nav.toggleNavigation": "Toggle navigation",
  "auth.login": "Login",
  "auth.signUp": "Sign Up",
  "auth.signOut": "Sign Out",
  "account.myOrders": "My Orders",
  "account.adminConsole": "Admin Console",
  "account.businessDashboard": "Business Dashboard",
  "notifications.title": "Notifications",
  "notifications.aria": "Notifications",
  "footer.description":
    "A circular B2B marketplace connecting businesses that have materials with businesses that need them. Built for Myanmar industry.",
  "footer.marketplace": "Marketplace",
  "footer.browseMaterials": "Browse Materials",
  "footer.verifiedBusinesses": "Verified Businesses",
  "footer.sellSurplus": "Sell Surplus",
  "footer.platform": "Platform",
  "footer.aboutBusinessModel": "About & Business Model",
  "footer.access": "Access",
  "footer.loginSignUp": "Login / Sign Up",
  "footer.copyright": "© 2026 SurplusHub Myanmar.",
  "footer.cities": "Yangon · Mandalay · Bago",
  "home.badge": "Circular B2B marketplace · Myanmar",
  "home.heroTitle": "Turn Surplus Into Opportunity.",
  "home.heroBody":
    "A circular B2B marketplace where businesses can sell surplus materials and find the resources they need.",
  "home.exploreMaterials": "Explore Materials",
  "home.postNeed": "Post What You Need",
  "home.valueSurplusTitle": "Businesses have surplus",
  "home.valueSurplusBody":
    "Offcuts, excess inventory, packaging and recyclable material sitting idle in warehouses.",
  "home.valueNeedTitle": "Other businesses need materials",
  "home.valueNeedBody":
    "Manufacturers, packers and builders looking for affordable, available production inputs.",
  "home.valueConnectTitle": "We connect them",
  "home.valueConnectBody":
    "Loopi matches supply with demand, then the platform tracks and verifies the deal.",
  "home.categoriesEyebrow": "Marketplace categories",
  "home.categoriesTitle": "Every industrial material stream",
  "home.browseMarketplace": "Browse marketplace",
  "home.listingCount": "{count} listing",
  "home.listingCountPlural": "{count} listings",
  "home.featuredEyebrow": "Featured listings",
  "home.featuredTitle": "Available surplus right now",
  "home.viewAllMaterials": "View all materials",
  "home.wantedBadge": "Material Wanted",
  "home.wantedTitle": "Can't find what you need? Tell businesses what you're looking for.",
  "home.wantedBody":
    "Post a requirement and verified suppliers with matching stock can send you offers directly.",
  "home.wantedMeta": "{quantity} · {budget} · {location} · Use: {use}",
  "home.postRequirement": "Post a Requirement",
  "home.loopiTitle": "AI-powered material discovery and supply-demand matching.",
  "home.loopiBody":
    "Loopi is more than a chatbot. It reads live marketplace data to recommend materials, find buyers for your surplus, estimate prices and draft listings.",
  "home.loopiPromptPackaging": '"I need packaging materials for my small business."',
  "home.loopiPromptPlastic": '"Find PET plastic scrap in Yangon under 700 MMK per kg."',
  "home.loopiPromptWood": '"I have 200kg of wood offcuts. Who might need them?"',
  "home.loopiHint": "Open Loopi from the button in the bottom-right corner of any page.",
  "home.trustVerifiedTitle": "Verified businesses",
  "home.trustVerifiedBody": "Company documents reviewed before a verified badge is issued.",
  "home.trustTrackedTitle": "Tracked transactions",
  "home.trustTrackedBody": "Every deal has an ID, a status trail and QR-based completion.",
  "home.trustReviewsTitle": "Verified reviews only",
  "home.trustReviewsBody": "Only buyers with a completed transaction can review a business.",
  "impact.badge": "Live Marketplace Snapshot",
  "impact.heroTitle": "Give Materials a Second Life.",
  "impact.heroBody":
    "We help businesses exchange surplus and recyclable materials instead of allowing usable resources to be unnecessarily discarded.",
  "impact.materialCategories": "Material categories",
  "impact.businessesConnected": "Businesses connected",
  "impact.completedTransactions": "Completed transactions",
  "impact.surplusValueRecovered": "Surplus value recovered",
  "impact.activeListings": "Active listings",
  "impact.marketContext": "Myanmar Market Context",
  "impact.privateEnterprises": "Registered private industrial enterprises",
  "impact.mainMarketEnterprises": "Registered industrial enterprises in the two main markets",
  "impact.rubberPlasticEnterprises": "Registered rubber & plastic product enterprises",
  "impact.yangonMandalay": "Yangon · 7,137 Mandalay",
  "impact.marketContextNote": "Market context - not SurplusHub results",
} as const;

type TranslationKey = keyof typeof en;

const my: Record<TranslationKey, string> = {
  "language.label": "ဘာသာစကား မုဒ်",
  "language.english": "EN",
  "language.myanmar": "မြန်မာ",
  "language.switchToEnglish": "အင်္ဂလိပ်ဘာသာသို့ ပြောင်းရန်",
  "language.switchToMyanmar": "မြန်မာဘာသာသို့ ပြောင်းရန်",
  "logo.tagline": "စက်ဝိုင်း B2B",
  "nav.home": "မူလစာမျက်နှာ",
  "nav.marketplace": "ဈေးကွက်",
  "nav.wanted": "လိုအပ်သော ပစ္စည်း",
  "nav.businesses": "စီးပွားရေးလုပ်ငန်းများ",
  "nav.impact": "သက်ရောက်မှု",
  "nav.about": "အကြောင်း",
  "nav.howItWorks": "ဘယ်လိုလုပ်ဆောင်လဲ",
  "nav.trust": "ယုံကြည်မှုနှင့် လုံခြုံရေး",
  "nav.businessModel": "စီးပွားရေးမော်ဒယ်",
  "nav.aboutNavigation": "အကြောင်း မီနူး",
  "nav.toggleNavigation": "မီနူး ဖွင့်/ပိတ်",
  "auth.login": "ဝင်ရောက်ရန်",
  "auth.signUp": "စာရင်းသွင်းရန်",
  "auth.signOut": "ထွက်ရန်",
  "account.myOrders": "ကျွန်ုပ်၏ အော်ဒါများ",
  "account.adminConsole": "အက်ဒမင် ကွန်ဆိုလ်",
  "account.businessDashboard": "လုပ်ငန်း ဒက်ရှ်ဘုတ်",
  "notifications.title": "အသိပေးချက်များ",
  "notifications.aria": "အသိပေးချက်များ",
  "footer.description":
    "ပစ္စည်းများပိုလျှံနေသော လုပ်ငန်းများနှင့် ပစ္စည်းလိုအပ်သော လုပ်ငန်းများကို ချိတ်ဆက်ပေးသည့် စက်ဝိုင်းပုံစံ B2B ဈေးကွက်။ မြန်မာ့စက်မှုလုပ်ငန်းအတွက် တည်ဆောက်ထားသည်။",
  "footer.marketplace": "ဈေးကွက်",
  "footer.browseMaterials": "ပစ္စည်းများ ကြည့်ရှုရန်",
  "footer.verifiedBusinesses": "အတည်ပြုထားသော လုပ်ငန်းများ",
  "footer.sellSurplus": "ပိုလျှံပစ္စည်း ရောင်းရန်",
  "footer.platform": "ပလက်ဖောင်း",
  "footer.aboutBusinessModel": "အကြောင်းနှင့် စီးပွားရေးမော်ဒယ်",
  "footer.access": "ဝင်ရောက်မှု",
  "footer.loginSignUp": "ဝင်ရန် / စာရင်းသွင်းရန်",
  "footer.copyright": "© 2026 SurplusHub Myanmar.",
  "footer.cities": "ရန်ကုန် · မန္တလေး · ပဲခူး",
  "home.badge": "စက်ဝိုင်းပုံစံ B2B ဈေးကွက် · မြန်မာ",
  "home.heroTitle": "ပိုလျှံပစ္စည်းကို အခွင့်အလမ်းအဖြစ် ပြောင်းလဲပါ။",
  "home.heroBody":
    "လုပ်ငန်းများက ပိုလျှံပစ္စည်းများ ရောင်းနိုင်ပြီး လိုအပ်သော အရင်းအမြစ်များကို ရှာဖွေနိုင်သော စက်ဝိုင်းပုံစံ B2B ဈေးကွက်။",
  "home.exploreMaterials": "ပစ္စည်းများ ရှာဖွေမည်",
  "home.postNeed": "လိုအပ်ချက် တင်မည်",
  "home.valueSurplusTitle": "လုပ်ငန်းများတွင် ပိုလျှံပစ္စည်းရှိသည်",
  "home.valueSurplusBody":
    "ဖြတ်ကျန်များ၊ ပိုနေသော စတော့များ၊ ထုပ်ပိုးပစ္စည်းများနှင့် ပြန်လည်အသုံးပြုနိုင်သော ပစ္စည်းများ ဂိုဒေါင်များတွင် အလဟသ ရှိနေသည်။",
  "home.valueNeedTitle": "အခြားလုပ်ငန်းများတွင် ပစ္စည်းလိုအပ်သည်",
  "home.valueNeedBody":
    "ထုတ်လုပ်သူများ၊ ထုပ်ပိုးရေးလုပ်ငန်းများနှင့် ဆောက်လုပ်ရေးလုပ်ငန်းများသည် စျေးသက်သာပြီး ရရှိနိုင်သော ထုတ်လုပ်မှုအရင်းအမြစ်များကို ရှာဖွေနေသည်။",
  "home.valueConnectTitle": "ကျွန်ုပ်တို့ ချိတ်ဆက်ပေးသည်",
  "home.valueConnectBody":
    "Loopi သည် ရောင်းလိုအားနှင့် ဝယ်လိုအားကို ကိုက်ညီစေပြီး ပလက်ဖောင်းက သဘောတူညီမှုကို ခြေရာခံအတည်ပြုသည်။",
  "home.categoriesEyebrow": "ဈေးကွက် အမျိုးအစားများ",
  "home.categoriesTitle": "စက်မှုလုပ်ငန်းသုံး ပစ္စည်းစီးကြောင်းအားလုံး",
  "home.browseMarketplace": "ဈေးကွက် ကြည့်ရှုရန်",
  "home.listingCount": "{count} ခု",
  "home.listingCountPlural": "{count} ခု",
  "home.featuredEyebrow": "အထူးဖော်ပြထားသော စာရင်းများ",
  "home.featuredTitle": "ယခုရရှိနိုင်သော ပိုလျှံပစ္စည်းများ",
  "home.viewAllMaterials": "ပစ္စည်းအားလုံး ကြည့်ရန်",
  "home.wantedBadge": "လိုအပ်သော ပစ္စည်း",
  "home.wantedTitle": "လိုတာ မတွေ့ဘူးလား။ သင်ရှာနေသည့် ပစ္စည်းကို လုပ်ငန်းများသိအောင် ပြောပါ။",
  "home.wantedBody":
    "လိုအပ်ချက်တစ်ခု တင်ပါ။ ကိုက်ညီသော စတော့ရှိသည့် အတည်ပြုထားသော ပေးသွင်းသူများက သင့်ထံ တိုက်ရိုက်ကမ်းလှမ်းနိုင်သည်။",
  "home.wantedMeta": "{quantity} · {budget} · {location} · အသုံးပြုမှု: {use}",
  "home.postRequirement": "လိုအပ်ချက် တင်ရန်",
  "home.loopiTitle": "AI အားဖြင့် ပစ္စည်းရှာဖွေမှုနှင့် ရောင်းဝယ်လိုအားကို ကိုက်ညီစေခြင်း။",
  "home.loopiBody":
    "Loopi သည် chatbot ထက်ပိုသည်။ ဈေးကွက်ဒေတာကို ဖတ်ရှုပြီး ပစ္စည်းများအကြံပြုခြင်း၊ သင့်ပိုလျှံပစ္စည်းအတွက် ဝယ်သူရှာခြင်း၊ ဈေးနှုန်းခန့်မှန်းခြင်းနှင့် စာရင်းတင်ရန် မူကြမ်းရေးခြင်းတို့ကို ကူညီသည်။",
  "home.loopiPromptPackaging": '"ကျွန်ုပ်၏ အသေးစားလုပ်ငန်းအတွက် ထုပ်ပိုးပစ္စည်းများ လိုအပ်ပါသည်။"',
  "home.loopiPromptPlastic":
    '"ရန်ကုန်ရှိ PET ပလတ်စတစ်အပိုင်းအစကို တစ်ကီလို ၇၀၀ MMK အောက်ဖြင့် ရှာပါ။"',
  "home.loopiPromptWood":
    '"ကျွန်ုပ်တွင် သစ်သားဖြတ်ကျန် ၂၀၀ ကီလို ရှိသည်။ ဘယ်သူတွေ လိုအပ်နိုင်မလဲ။"',
  "home.loopiHint": "မည်သည့်စာမျက်နှာမဆို အောက်ညာဘက်ခလုတ်မှ Loopi ကို ဖွင့်နိုင်သည်။",
  "home.trustVerifiedTitle": "အတည်ပြုထားသော လုပ်ငန်းများ",
  "home.trustVerifiedBody": "အတည်ပြုအမှတ်တံဆိပ် မထုတ်ပေးမီ ကုမ္ပဏီစာရွက်စာတမ်းများကို စစ်ဆေးသည်။",
  "home.trustTrackedTitle": "ခြေရာခံထားသော ငွေကြေးလွှဲပြောင်းမှုများ",
  "home.trustTrackedBody":
    "သဘောတူညီမှုတိုင်းတွင် ID၊ အခြေအနေမှတ်တမ်းနှင့် QR အခြေပြု ပြီးဆုံးမှုရှိသည်။",
  "home.trustReviewsTitle": "အတည်ပြုထားသော သုံးသပ်ချက်များသာ",
  "home.trustReviewsBody":
    "ပြီးဆုံးထားသော လွှဲပြောင်းမှုရှိသည့် ဝယ်သူများသာ လုပ်ငန်းကို သုံးသပ်နိုင်သည်။",
  "impact.badge": "လက်ရှိ ဈေးကွက်အခြေအနေ",
  "impact.heroTitle": "ပစ္စည်းများကို ဒုတိယအသက် ပေးပါ။",
  "impact.heroBody":
    "အသုံးပြုနိုင်သေးသော အရင်းအမြစ်များကို မလိုအပ်ဘဲ စွန့်ပစ်မည့်အစား လုပ်ငန်းများအချင်းချင်း ပိုလျှံနှင့် ပြန်လည်အသုံးပြုနိုင်သော ပစ္စည်းများ လဲလှယ်နိုင်ရန် ကူညီပေးသည်။",
  "impact.materialCategories": "ပစ္စည်း အမျိုးအစားများ",
  "impact.businessesConnected": "ချိတ်ဆက်ထားသော လုပ်ငန်းများ",
  "impact.completedTransactions": "ပြီးဆုံးထားသော လွှဲပြောင်းမှုများ",
  "impact.surplusValueRecovered": "ပြန်လည်အသုံးဝင်ခဲ့သော ပိုလျှံတန်ဖိုး",
  "impact.activeListings": "လက်ရှိ စာရင်းများ",
  "impact.marketContext": "မြန်မာ ဈေးကွက်အခြေအနေ",
  "impact.privateEnterprises": "မှတ်ပုံတင်ထားသော ပုဂ္ဂလိက စက်မှုလုပ်ငန်းများ",
  "impact.mainMarketEnterprises": "အဓိကဈေးကွက်နှစ်ခုရှိ မှတ်ပုံတင်ထားသော စက်မှုလုပ်ငန်းများ",
  "impact.rubberPlasticEnterprises": "မှတ်ပုံတင်ထားသော ရော်ဘာနှင့် ပလတ်စတစ်ထုတ်ကုန်လုပ်ငန်းများ",
  "impact.yangonMandalay": "ရန်ကုန် · ၇,၁၃၇ မန္တလေး",
  "impact.marketContextNote": "ဈေးကွက်အခြေအနေ - SurplusHub ရလဒ်များ မဟုတ်ပါ",
};

const translations: Record<Language, Record<TranslationKey, string>> = { en, my };

const documentTranslations: Record<string, string> = {
  "About SurplusHub": "SurplusHub အကြောင်း",
  "Business value first, circular impact built in.":
    "စီးပွားရေးတန်ဖိုးကို ဦးစားပေးပြီး စက်ဝိုင်းသက်ရောက်မှုကို ထည့်သွင်းထားသည်။",
  "SurplusHub helps businesses discover materials, find new trading partners, negotiate deals and build a verified transaction history. The marketplace earns revenue by making those exchanges easier and more valuable for both sides.":
    "SurplusHub သည် လုပ်ငန်းများ ပစ္စည်းရှာဖွေခြင်း၊ ကုန်သွယ်ဖက်အသစ်ရှာခြင်း၊ သဘောတူညီမှုညှိနှိုင်းခြင်းနှင့် အတည်ပြုထားသော လွှဲပြောင်းမှုမှတ်တမ်း တည်ဆောက်ခြင်းတို့ကို ကူညီပေးသည်။",
  "Business Model": "စီးပွားရေးမော်ဒယ်",
  "SurplusHub charges only when a transaction actually completes through the platform.":
    "ပလက်ဖောင်းမှတစ်ဆင့် လွှဲပြောင်းမှုတကယ်ပြီးဆုံးသည့်အခါမှသာ SurplusHub က ကောက်ခံသည်။",
  "Seller success fee": "ရောင်းသူအောင်မြင်မှုကြေး",
  "Buyer service fee": "ဝယ်သူဝန်ဆောင်မှုကြေး",
  "Completion-based revenue": "ပြီးဆုံးမှုအပေါ်မူတည်သော ဝင်ငွေ",
  "Charged to the seller only after a marketplace order is completed and accepted.":
    "ဈေးကွက်အော်ဒါပြီးဆုံးပြီး လက်ခံပြီးမှသာ ရောင်းသူထံမှ ကောက်ခံသည်။",
  "Added to the negotiated material price for verified checkout, tracking and dispute support.":
    "အတည်ပြု checkout၊ ခြေရာခံမှုနှင့် အငြင်းပွားမှုကူညီမှုအတွက် ညှိနှိုင်းထားသော ပစ္စည်းဈေးနှုန်းတွင် ထည့်သွင်းသည်။",
  "Both fees apply to the material price only. Delivery and tax pass through without a platform fee.":
    "ကြေးနှစ်မျိုးလုံးသည် ပစ္စည်းဈေးနှုန်းပေါ်တွင်သာ သက်ရောက်သည်။ ပို့ဆောင်ခနှင့် အခွန်တွင် ပလက်ဖောင်းကြေး မရှိပါ။",
  "Worked example": "တွက်ချက်မှု ဥပမာ",
  "One completed marketplace order": "ပြီးဆုံးထားသော ဈေးကွက်အော်ဒါတစ်ခု",
  "Material price": "ပစ္စည်းဈေးနှုန်း",
  "Buyer pays": "ဝယ်သူပေးချေရမည့်ပမာဏ",
  "Seller receives": "ရောင်းသူလက်ခံရရှိမည့်ပမာဏ",
  "Platform gross": "ပလက်ဖောင်းစုစုပေါင်းဝင်ငွေ",
  "No subscription at launch": "စတင်ချိန်တွင် စာရင်းသွင်းကြေး မရှိပါ",
  "on purpose": "ရည်ရွယ်ချက်ရှိစွာ",
  "What the fee pays for": "ကြေးသည် ဘာအတွက်လဲ",
  "Verified businesses, not anonymous sellers":
    "အမည်မသိရောင်းသူများမဟုတ်ဘဲ အတည်ပြုထားသော လုပ်ငန်းများ",
  "Material specifications and photos on record": "ပစ္စည်းအသေးစိတ်နှင့် ဓာတ်ပုံမှတ်တမ်း",
  "Secure MMQR payment instead of transferring first and hoping":
    "အရင်လွှဲပြီး စောင့်ရမည့်အစား လုံခြုံသော MMQR ပေးချေမှု",
  "Order tracking through preparation and delivery":
    "ပြင်ဆင်မှုမှ ပို့ဆောင်မှုအထိ အော်ဒါခြေရာခံမှု",
  "A 48-hour inspection window before the seller is paid":
    "ရောင်းသူကို မပေးချေမီ ၄၈ နာရီ စစ်ဆေးချိန်",
  "Dispute support when the material is not what was described":
    "ဖော်ပြထားသည့်အတိုင်း မဟုတ်သည့်အခါ အငြင်းပွားမှုကူညီမှု",
  "A verified transaction history that builds credibility":
    "ယုံကြည်မှုတည်ဆောက်ပေးသည့် အတည်ပြုထားသော လွှဲပြောင်းမှုမှတ်တမ်း",
  "Phase 2": "ဒုတိယအဆင့်",
  "Featured listings": "အထူးဖော်ပြထားသော စာရင်းများ",
  "Business subscription": "လုပ်ငန်း စာရင်းသွင်းမှု",
  "Logistics partnerships": "ပို့ဆောင်ရေး မိတ်ဖက်များ",
  "Integrated escrow": "ပေါင်းစည်းထားသော escrow",

  "How It Works": "ဘယ်လိုလုပ်ဆောင်လဲ",
  "For sellers": "ရောင်းသူများအတွက်",
  "For buyers": "ဝယ်သူများအတွက်",
  "For the platform": "ပလက်ဖောင်းအတွက်",
  "Create a company profile and get verified": "ကုမ္ပဏီပရိုဖိုင်ဖန်တီးပြီး အတည်ပြုမှုရယူပါ",
  "Upload surplus with photos, quantity and condition":
    "ဓာတ်ပုံ၊ အရေအတွက်၊ အခြေအနေနှင့်အတူ ပိုလျှံပစ္စည်းတင်ပါ",
  "Let Loopi draft the listing and estimate price": "Loopi ကို စာရင်းမူကြမ်းနှင့် ဈေးခန့်မှန်းစေပါ",
  "Receive inquiries and offers": "စုံစမ်းချက်များနှင့် ကမ်းလှမ်းချက်များ လက်ခံပါ",
  "Accept, reject or counter": "လက်ခံ၊ ငြင်းပယ် သို့မဟုတ် ပြန်လည်ညှိနှိုင်းပါ",
  "Confirm the sale and collect verified reviews":
    "ရောင်းချမှုအတည်ပြုပြီး အတည်ပြုသုံးသပ်ချက်များ ရယူပါ",
  "Search and filter by category, price, location, condition":
    "အမျိုးအစား၊ ဈေးနှုန်း၊ တည်နေရာ၊ အခြေအနေဖြင့် ရှာဖွေစစ်ထုတ်ပါ",
  "Check verified badges and seller ratings":
    "အတည်ပြုအမှတ်အသားများနှင့် ရောင်းသူအဆင့်သတ်မှတ်ချက်များ စစ်ဆေးပါ",
  "Request to Buy with quantity and offered price":
    "အရေအတွက်နှင့် ကမ်းလှမ်းဈေးနှုန်းဖြင့် ဝယ်ယူရန် တောင်းဆိုပါ",
  "Negotiate or request an inspection": "ညှိနှိုင်းပါ သို့မဟုတ် စစ်ဆေးရန် တောင်းဆိုပါ",
  "Complete the deal with a transaction QR": "လွှဲပြောင်းမှု QR ဖြင့် သဘောတူညီမှု ပြီးစီးစေပါ",
  "Leave a verified purchase review": "အတည်ပြုထားသော ဝယ်ယူမှုသုံးသပ်ချက် ချန်ထားပါ",
  "Business verification and document review": "လုပ်ငန်းအတည်ပြုမှုနှင့် စာရွက်စာတမ်းစစ်ဆေးမှု",
  "Listing moderation and reporting": "စာရင်းစစ်ဆေးထိန်းသိမ်းမှုနှင့် တိုင်ကြားမှု",
  "Transaction records and status tracking": "လွှဲပြောင်းမှုမှတ်တမ်းနှင့် အခြေအနေခြေရာခံမှု",
  "Category management": "အမျိုးအစား စီမံခန့်ခွဲမှု",
  "Analytics and circular-economy metrics":
    "ခွဲခြမ်းစိတ်ဖြာချက်များနှင့် စက်ဝိုင်းစီးပွားရေးတိုင်းတာချက်များ",
  "Transaction verification": "လွှဲပြောင်းမှု အတည်ပြုခြင်း",
  "Every deal has a tracked status trail": "သဘောတူညီမှုတိုင်းတွင် ခြေရာခံအခြေအနေမှတ်တမ်း ရှိသည်",

  "Trust & Safety": "ယုံကြည်မှုနှင့် လုံခြုံရေး",
  "Verified Businesses": "အတည်ပြုထားသော လုပ်ငန်းများ",
  "Verified Purchase Reviews": "အတည်ပြုထားသော ဝယ်ယူမှုသုံးသပ်ချက်များ",
  "Material Information": "ပစ္စည်းအချက်အလက်",
  "Transaction Records": "လွှဲပြောင်းမှုမှတ်တမ်းများ",
  "Report System": "တိုင်ကြားမှုစနစ်",
  "Trust is the product. Every mechanism below exists so businesses can transact with suppliers they have never met before.":
    "ယုံကြည်မှုက ထုတ်ကုန်ဖြစ်သည်။ အောက်ပါယန္တရားတိုင်းသည် လုပ်ငန်းများ မတွေ့ဖူးသော ပေးသွင်းသူများနှင့် လုံခြုံစွာ အရောင်းအဝယ်ပြုနိုင်ရန် ရှိသည်။",

  Marketplace: "ဈေးကွက်",
  "Surplus, reusable and recyclable materials from verified Myanmar businesses.":
    "အတည်ပြုထားသော မြန်မာလုပ်ငန်းများမှ ပိုလျှံ၊ ပြန်အသုံးပြုနိုင်ပြီး ပြန်လည်အသုံးချနိုင်သော ပစ္စည်းများ။",
  "Search materials, categories, suppliers...": "ပစ္စည်း၊ အမျိုးအစား၊ ပေးသွင်းသူများ ရှာဖွေပါ...",
  Recommended: "အကြံပြုထားသော",
  Newest: "အသစ်ဆုံး",
  "Price Low to High": "ဈေးနှုန်း နိမ့်မှ မြင့်",
  "Price High to Low": "ဈေးနှုန်း မြင့်မှ နိမ့်",
  "Highest Rated": "အဆင့်သတ်မှတ်ချက် အမြင့်ဆုံး",
  "Most Popular": "လူကြိုက်အများဆုံး",
  Filters: "စစ်ထုတ်မှုများ",
  Category: "အမျိုးအစား",
  "Material Type": "ပစ္စည်းအမျိုးအစား",
  Condition: "အခြေအနေ",
  Location: "တည်နေရာ",
  "Max unit price": "အများဆုံး တစ်ယူနစ်ဈေးနှုန်း",
  "Min quantity": "အနည်းဆုံး အရေအတွက်",
  "Verified Business": "အတည်ပြုထားသော လုပ်ငန်း",
  "Available for Pickup": "ကိုယ်တိုင်လာယူနိုင်သည်",
  "Requires Processing": "ပြုပြင်ရန် လိုအပ်သည်",
  "Requires processing": "ပြုပြင်ရန် လိုအပ်သည်",
  "Ready to use": "အသုံးပြုရန် အသင့်",
  "materials found": "ပစ္စည်းများ တွေ့ရှိသည်",
  "No materials match these filters": "ဤစစ်ထုတ်မှုများနှင့် ကိုက်ညီသော ပစ္စည်းမရှိပါ",
  "Try widening your filters, or post a Material Wanted requirement instead.":
    "စစ်ထုတ်မှုများကို ဖြေလျှော့ကြည့်ပါ သို့မဟုတ် လိုအပ်သောပစ္စည်း တောင်းဆိုချက်တင်ပါ။",
  "Reset filters": "စစ်ထုတ်မှုများ ပြန်စမည်",
  All: "အားလုံး",
  Featured: "အထူး",
  "View Material": "ပစ္စည်းကြည့်ရန်",
  "Similar materials": "ဆင်တူသော ပစ္စည်းများ",
  "Material information": "ပစ္စည်းအချက်အလက်",
  "Material type": "ပစ္စည်းအမျိုးအစား",
  Composition: "ဖွဲ့စည်းမှု",
  Quantity: "အရေအတွက်",
  "Unit price": "တစ်ယူနစ်ဈေး",
  "Minimum order": "အနည်းဆုံးအော်ဒါ",
  Available: "ရရှိနိုင်ချိန်",
  Processing: "ပြုပြင်မှု",
  "Potential Uses": "အသုံးပြုနိုင်သော နေရာများ",
  "Seller-uploaded photos": "ရောင်းသူတင်ထားသော ဓာတ်ပုံများ",
  "This is your business listing": "ဤစာရင်းသည် သင့်လုပ်ငန်း၏ စာရင်းဖြစ်သည်",
  "Buyer actions are hidden when you view your own material.":
    "သင့်ကိုယ်ပိုင်ပစ္စည်းကို ကြည့်သောအခါ ဝယ်သူလုပ်ဆောင်ချက်များကို ဖျောက်ထားသည်။",
  "Manage in Dashboard": "ဒက်ရှ်ဘုတ်တွင် စီမံရန်",
  "Request to Buy": "ဝယ်ယူရန် တောင်းဆိုရန်",
  "Send another request": "နောက်ထပ်တောင်းဆိုချက် ပို့ရန်",
  "Your request creates a tracked transaction lead with":
    "သင့်တောင်းဆိုချက်သည် ခြေရာခံနိုင်သော လွှဲပြောင်းမှုအစကို ဖန်တီးပေးသည်",
  "Offered price per": "တစ်ယူနစ် ကမ်းလှမ်းဈေး",
  "Pickup / delivery": "လာယူခြင်း / ပို့ဆောင်ခြင်း",
  "Preferred date": "နှစ်သက်သောရက်စွဲ",
  Message: "စာတို",
  "Send Request": "တောင်းဆိုချက် ပို့ရန်",
  "Contact Seller": "ရောင်းသူထံ ဆက်သွယ်ရန်",
  Save: "သိမ်းရန်",
  Report: "တိုင်ကြားရန်",
  "Material Information Provided": "ပစ္စည်းအချက်အလက် ပေးထားသည်",
  "Seller Rating": "ရောင်းသူအဆင့်",
  "Verified Transactions": "အတည်ပြုထားသော လွှဲပြောင်းမှုများ",
  "Contact details are shared after you submit a Request to Buy or Request Inspection.":
    "ဝယ်ယူရန် သို့မဟုတ် စစ်ဆေးရန် တောင်းဆိုပြီးမှ ဆက်သွယ်ရန်အချက်အလက်များကို မျှဝေသည်။",
  "Request declined": "တောင်းဆိုချက် ငြင်းပယ်ထားသည်",
  "Price agreed": "ဈေးနှုန်း သဘောတူပြီး",
  "Go to checkout": "Checkout သို့ သွားရန်",
  "Request sent": "တောင်းဆိုချက် ပို့ပြီး",
  "Seller responded": "ရောင်းသူ ပြန်လည်တုံ့ပြန်ပြီး",
  "Waiting for the seller to accept or counter your price.":
    "ရောင်းသူက သင့်ဈေးနှုန်းကို လက်ခံရန် သို့မဟုတ် ပြန်ညှိရန် စောင့်နေသည်။",
  "Accepting locks this price. It cannot be renegotiated afterwards.":
    "လက်ခံပါက ဤဈေးနှုန်းကို သတ်မှတ်ပြီး နောက်ပိုင်း ပြန်ညှိ၍ မရပါ။",
  "Transaction status": "လွှဲပြောင်းမှု အခြေအနေ",
  "View order": "အော်ဒါကြည့်ရန်",

  "Material Wanted": "လိုအပ်သော ပစ္စည်း",
  "Post a Requirement": "လိုအပ်ချက် တင်ရန်",
  "Post a Material Wanted requirement": "လိုအပ်သော ပစ္စည်း တောင်းဆိုချက်တင်ရန်",
  "Verified suppliers with matching stock can send you offers.":
    "ကိုက်ညီသော စတော့ရှိသည့် အတည်ပြုထားသော ပေးသွင်းသူများက ကမ်းလှမ်းချက်များ ပို့နိုင်သည်။",
  Material: "ပစ္စည်း",
  "Quantity needed": "လိုအပ်သော အရေအတွက်",
  "Budget (MMK)": "ဘတ်ဂျက် (MMK)",
  "Preferred condition": "နှစ်သက်သော အခြေအနေ",
  "Intended use": "ရည်ရွယ်အသုံးပြုမှု",
  "Required by date": "လိုအပ်သည့် နောက်ဆုံးရက်",
  "Additional requirements": "ထပ်ဆောင်းလိုအပ်ချက်များ",
  "Reference image": "ရည်ညွှန်းပုံ",
  "Post Requirement": "လိုအပ်ချက် တင်ရန်",
  "Make an Offer": "ကမ်းလှမ်းချက်ပြုလုပ်ရန်",
  "Available quantity": "ရရှိနိုင်သော အရေအတွက်",
  "Price (MMK)": "ဈေးနှုန်း (MMK)",
  "Material details": "ပစ္စည်းအသေးစိတ်",
  Photos: "ဓာတ်ပုံများ",
  "Send Offer": "ကမ်းလှမ်းချက် ပို့ရန်",
  "Loopi found potential suppliers.": "Loopi က ဖြစ်နိုင်သော ပေးသွင်းသူများကို တွေ့ရှိသည်။",
  Match: "ကိုက်ညီမှု",
  "Request Offer": "ကမ်းလှမ်းချက် တောင်းရန်",
  "Hide AI matches": "AI ကိုက်ညီမှုများ ဖျောက်ရန်",
  "View AI matches": "AI ကိုက်ညီမှုများ ကြည့်ရန်",
  Budget: "ဘတ်ဂျက်",
  Use: "အသုံးပြုမှု",
  "Required by": "လိုအပ်သည့်ရက်",
  "Posted by": "တင်သူ",
  offers: "ကမ်းလှမ်းချက်များ",

  Businesses: "စီးပွားရေးလုပ်ငန်းများ",
  Rating: "အဆင့်သတ်မှတ်ချက်",
  "Active listings": "လက်ရှိ စာရင်းများ",
  Materials: "ပစ္စည်းများ",
  Reviews: "သုံးသပ်ချက်များ",
  About: "အကြောင်း",
  "No verified reviews yet.": "အတည်ပြုထားသော သုံးသပ်ချက် မရှိသေးပါ။",
  "Company description": "ကုမ္ပဏီဖော်ပြချက်",
  "Contact information": "ဆက်သွယ်ရန် အချက်အလက်",

  "Admin Console": "အက်ဒမင် ကွန်ဆိုလ်",
  Verification: "အတည်ပြုမှု",
  Listings: "စာရင်းများ",
  Transactions: "လွှဲပြောင်းမှုများ",
  Payouts: "ပေးချေမှုများ",
  Revenue: "ဝင်ငွေ",
  "Revenue by material category": "ပစ္စည်းအမျိုးအစားအလိုက် ဝင်ငွေ",
  Orders: "အော်ဒါများ",
  "Seller fees": "ရောင်းသူကြေးများ",
  "Buyer fees": "ဝယ်သူကြေးများ",
  "Gross revenue": "စုစုပေါင်းဝင်ငွေ",
  "Payout pending": "ပေးချေမှု စောင့်ဆိုင်းနေသည်",
  "All payouts are up to date": "ပေးချေမှုများအားလုံး နောက်ဆုံးအခြေအနေဖြစ်သည်",

  "Business Dashboard": "လုပ်ငန်း ဒက်ရှ်ဘုတ်",
  "My Listings": "ကျွန်ုပ်၏ စာရင်းများ",
  Requests: "တောင်းဆိုချက်များ",
  Analytics: "ခွဲခြမ်းစိတ်ဖြာချက်",
  "Buyer offered": "ဝယ်သူ ကမ်းလှမ်းထားသည်",
  "You countered": "သင် ပြန်ညှိထားသည်",
  Agreed: "သဘောတူပြီး",
  "you receive": "သင် လက်ခံရရှိမည်",
  "You would receive": "သင် လက်ခံရရှိနိုင်သည်",
  "Business analytics": "လုပ်ငန်း ခွဲခြမ်းစိတ်ဖြာချက်",
  "Recovered revenue by category": "အမျိုးအစားအလိုက် ပြန်လည်ရရှိသော ဝင်ငွေ",
  "Listing engagement": "စာရင်း ထိတွေ့မှု",
  "Post surplus material": "ပိုလျှံပစ္စည်း တင်ရန်",
  Description: "ဖော်ပြချက်",
  "Counter offer": "ပြန်လည်ကမ်းလှမ်းချက်",
  "Delivery (MMK)": "ပို့ဆောင်ခ (MMK)",
  "Message to buyer": "ဝယ်သူထံ စာတို",
  "You receive": "သင် လက်ခံရရှိမည်",

  "Sign In": "ဝင်ရောက်ရန်",
  "Register Business": "လုပ်ငန်း စာရင်းသွင်းရန်",
  Email: "အီးမေးလ်",
  Password: "စကားဝှက်",
  "Business name": "လုပ်ငန်းအမည်",
  Industry: "လုပ်ငန်းအမျိုးအစား",
  "Contact person": "ဆက်သွယ်ရမည့်သူ",
  "Business email": "လုပ်ငန်း အီးမေးလ်",
  Phone: "ဖုန်း",
  "Business registration document": "လုပ်ငန်းမှတ်ပုံတင်စာရွက်စာတမ်း",
  "Create Business Account": "လုပ်ငန်းအကောင့် ဖန်တီးရန်",
  "Hide password": "စကားဝှက် ဖျောက်ရန်",
  "Show password": "စကားဝှက် ပြရန်",

  Messages: "စာတိုများ",
  "Buyer and seller conversations": "ဝယ်သူနှင့် ရောင်းသူ စကားပြောများ",
  "Photo preview": "ဓာတ်ပုံ အကြိုကြည့်ရန်",
  "Take Photo": "ဓာတ်ပုံရိုက်ရန်",
  Price: "ဈေးနှုန်း",
  Status: "အခြေအနေ",
  Shared: "မျှဝေထားသည်",
  "Purchase request": "ဝယ်ယူမှု တောင်းဆိုချက်",

  Checkout: "ငွေပေးချေရန်",
  "Order not found": "အော်ဒါ မတွေ့ပါ",
  "Paid amount": "ပေးချေပြီး ပမာဏ",
  "Payment reference": "ပေးချေမှု ရည်ညွှန်းနံပါတ်",
  Buyer: "ဝယ်သူ",
  Seller: "ရောင်းသူ",
  "Buyer payment": "ဝယ်သူ ပေးချေမှု",
  "Seller payout preview": "ရောင်းသူ ပေးချေမှု အကြိုကြည့်",
  "MMQR payment": "MMQR ပေးချေမှု",
  "Amount to pay": "ပေးချေရမည့် ပမာဏ",
  "Demo provider callback": "Demo ပေးချေမှု callback",

  "My Orders": "ကျွန်ုပ်၏ အော်ဒါများ",
  "No buyer orders yet.": "ဝယ်သူအော်ဒါ မရှိသေးပါ။",
  "Report a problem": "ပြဿနာ တိုင်ကြားရန်",
  "Inspection window": "စစ်ဆေးချိန်",
  "Fulfillment timeline": "ဖြည့်ဆည်းမှု အချိန်လိုင်း",
  "Payment summary": "ပေးချေမှု အကျဉ်းချုပ်",
  "Order details": "အော်ဒါ အသေးစိတ်",
  Delivered: "ပို့ပြီး",
  "Problem report": "ပြဿနာ တိုင်ကြားချက်",
  "seller net": "ရောင်းသူ အသားတင်",

  Yangon: "ရန်ကုန်",
  Mandalay: "မန္တလေး",
  Bago: "ပဲခူး",
  Textile: "အထည်အလိပ်",
  Plastic: "ပလတ်စတစ်",
  Paper: "စက္ကူ",
  Metal: "သတ္တု",
  Wood: "သစ်သား",
  Glass: "ဖန်",
  Rubber: "ရော်ဘာ",
  Construction: "ဆောက်လုပ်ရေး",
  Industrial: "စက်မှုလုပ်ငန်း",
  Other: "အခြား",
  Active: "လက်ရှိ",
  Pending: "စောင့်ဆိုင်းနေသည်",
  Completed: "ပြီးဆုံးပြီး",
  Accepted: "လက်ခံပြီး",
  Rejected: "ငြင်းပယ်ပြီး",
  Cancelled: "ပယ်ဖျက်ပြီး",
  "In Progress": "လုပ်ဆောင်နေသည်",
};

const translationPhrases = Object.keys(documentTranslations).sort((a, b) => b.length - a.length);
const documentTermTranslations: Record<string, string> = {
  about: "အကြောင်း",
  accepted: "လက်ခံပြီး",
  account: "အကောင့်",
  active: "လက်ရှိ",
  additional: "ထပ်ဆောင်း",
  address: "လိပ်စာ",
  admin: "အက်ဒမင်",
  ago: "အကြာ",
  agreed: "သဘောတူပြီး",
  analytics: "ခွဲခြမ်းစိတ်ဖြာချက်",
  amount: "ပမာဏ",
  anonymous: "အမည်မသိ",
  available: "ရရှိနိုင်သော",
  awaiting: "စောင့်ဆိုင်းနေသော",
  baled: "အထုပ်ချည်ထားသော",
  badge: "အမှတ်အသား",
  badges: "အမှတ်အသားများ",
  bago: "ပဲခူး",
  budget: "ဘတ်ဂျက်",
  business: "လုပ်ငန်း",
  businesses: "လုပ်ငန်းများ",
  buyer: "ဝယ်သူ",
  buyers: "ဝယ်သူများ",
  cancelled: "ပယ်ဖျက်ပြီး",
  cardboard: "ကတ်ထူ",
  categories: "အမျိုးအစားများ",
  category: "အမျိုးအစား",
  certificate: "လက်မှတ်",
  certificates: "လက်မှတ်များ",
  chat: "စကားပြော",
  checkout: "ငွေပေးချေရန်",
  circular: "စက်ဝိုင်း",
  company: "ကုမ္ပဏီ",
  completed: "ပြီးဆုံးပြီး",
  composition: "ဖွဲ့စည်းမှု",
  condition: "အခြေအနေ",
  confirm: "အတည်ပြုရန်",
  contact: "ဆက်သွယ်ရန်",
  conversation: "စကားပြော",
  conversations: "စကားပြောများ",
  counter: "ပြန်ညှိရန်",
  created: "ဖန်တီးပြီး",
  current: "လက်ရှိ",
  dashboard: "ဒက်ရှ်ဘုတ်",
  date: "ရက်စွဲ",
  deal: "သဘောတူညီမှု",
  deals: "သဘောတူညီမှုများ",
  declined: "ငြင်းပယ်ထားသည်",
  delivered: "ပို့ပြီး",
  delivery: "ပို့ဆောင်မှု",
  description: "ဖော်ပြချက်",
  details: "အသေးစိတ်",
  discarded: "စွန့်ပစ်ထားသော",
  discover: "ရှာဖွေရန်",
  dispute: "အငြင်းပွားမှု",
  document: "စာရွက်စာတမ်း",
  documents: "စာရွက်စာတမ်းများ",
  draft: "မူကြမ်း",
  email: "အီးမေးလ်",
  enterprises: "လုပ်ငန်းများ",
  estimate: "ခန့်မှန်းရန်",
  exchange: "လဲလှယ်ရန်",
  factory: "စက်ရုံ",
  fee: "ကြေး",
  fees: "ကြေးများ",
  featured: "အထူး",
  filter: "စစ်ထုတ်ရန်",
  filters: "စစ်ထုတ်မှုများ",
  found: "တွေ့ရှိသည်",
  gross: "စုစုပေါင်း",
  history: "မှတ်တမ်း",
  image: "ပုံ",
  information: "အချက်အလက်",
  inspection: "စစ်ဆေးမှု",
  integrated: "ပေါင်းစည်းထားသော",
  interested: "စိတ်ဝင်စားသော",
  industry: "လုပ်ငန်းအမျိုးအစား",
  inquiries: "စုံစမ်းချက်များ",
  launch: "စတင်ချိန်",
  listing: "စာရင်း",
  listings: "စာရင်းများ",
  live: "လက်ရှိ",
  location: "တည်နေရာ",
  logistics: "ပို့ဆောင်ရေး",
  mandalay: "မန္တလေး",
  marketplace: "ဈေးကွက်",
  material: "ပစ္စည်း",
  materials: "ပစ္စည်းများ",
  match: "ကိုက်ညီမှု",
  matches: "ကိုက်ညီမှုများ",
  metal: "သတ္တု",
  minimum: "အနည်းဆုံး",
  model: "မော်ဒယ်",
  moderation: "စစ်ဆေးထိန်းသိမ်းမှု",
  newest: "အသစ်ဆုံး",
  order: "အော်ဒါ",
  orders: "အော်ဒါများ",
  paid: "ပေးချေပြီး",
  paper: "စက္ကူ",
  partner: "မိတ်ဖက်",
  partners: "မိတ်ဖက်များ",
  payment: "ပေးချေမှု",
  payments: "ပေးချေမှုများ",
  payout: "ပေးချေမှု",
  payouts: "ပေးချေမှုများ",
  pending: "စောင့်ဆိုင်းနေသည်",
  phone: "ဖုန်း",
  photo: "ဓာတ်ပုံ",
  photos: "ဓာတ်ပုံများ",
  pickup: "လာယူခြင်း",
  plastic: "ပလတ်စတစ်",
  platform: "ပလက်ဖောင်း",
  popular: "လူကြိုက်များသော",
  post: "တင်ရန်",
  preparing: "ပြင်ဆင်နေသည်",
  preview: "အကြိုကြည့်",
  price: "ဈေးနှုန်း",
  processing: "ပြုပြင်မှု",
  product: "ထုတ်ကုန်",
  products: "ထုတ်ကုန်များ",
  profile: "ပရိုဖိုင်",
  purchase: "ဝယ်ယူမှု",
  quantity: "အရေအတွက်",
  rating: "အဆင့်သတ်မှတ်ချက်",
  recyclable: "ပြန်လည်အသုံးချနိုင်သော",
  recovered: "ပြန်လည်ရရှိသော",
  refunded: "ပြန်အမ်းပြီး",
  register: "စာရင်းသွင်းရန်",
  registered: "မှတ်ပုံတင်ထားသော",
  registration: "မှတ်ပုံတင်ခြင်း",
  rejected: "ငြင်းပယ်ပြီး",
  report: "တိုင်ကြားချက်",
  reported: "တိုင်ကြားထားသော",
  request: "တောင်းဆိုချက်",
  requests: "တောင်းဆိုချက်များ",
  required: "လိုအပ်သော",
  requirement: "လိုအပ်ချက်",
  requirements: "လိုအပ်ချက်များ",
  revenue: "ဝင်ငွေ",
  review: "သုံးသပ်ချက်",
  reviews: "သုံးသပ်ချက်များ",
  rubber: "ရော်ဘာ",
  safety: "လုံခြုံရေး",
  saved: "သိမ်းပြီး",
  search: "ရှာဖွေရန်",
  secure: "လုံခြုံသော",
  seller: "ရောင်းသူ",
  sellers: "ရောင်းသူများ",
  sent: "ပို့ပြီး",
  service: "ဝန်ဆောင်မှု",
  shared: "မျှဝေထားသော",
  shipped: "ပို့ဆောင်ပြီး",
  snapshot: "အခြေအနေ",
  status: "အခြေအနေ",
  stock: "စတော့",
  subscription: "စာရင်းသွင်းမှု",
  success: "အောင်မြင်မှု",
  supplier: "ပေးသွင်းသူ",
  suppliers: "ပေးသွင်းသူများ",
  surplus: "ပိုလျှံ",
  textile: "အထည်အလိပ်",
  timeline: "အချိန်လိုင်း",
  tracked: "ခြေရာခံထားသော",
  tracking: "ခြေရာခံမှု",
  transaction: "လွှဲပြောင်းမှု",
  transactions: "လွှဲပြောင်းမှုများ",
  trust: "ယုံကြည်မှု",
  type: "အမျိုးအစား",
  unavailable: "မရရှိနိုင်ပါ",
  unit: "တစ်ယူနစ်",
  upload: "တင်ရန်",
  use: "အသုံးပြုမှု",
  uses: "အသုံးပြုမှုများ",
  value: "တန်ဖိုး",
  verified: "အတည်ပြုထားသော",
  verification: "အတည်ပြုမှု",
  view: "ကြည့်ရန်",
  wanted: "လိုအပ်သော",
  window: "အချိန်ကာလ",
  wood: "သစ်သား",
  yangon: "ရန်ကုန်",
};
const translationTerms = Object.keys(documentTermTranslations).sort((a, b) => b.length - a.length);
const originalTextNodes = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const localizableAttributes = ["aria-label", "placeholder", "title"] as const;

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "my";
}

function readLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return isLanguage(storedLanguage) ? storedLanguage : "en";
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  const handleLanguageEvent = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LANGUAGE_EVENT, handleLanguageEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LANGUAGE_EVENT, handleLanguageEvent);
  };
}

export function setLanguage(language: Language) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, language);
  window.document.documentElement.lang = language === "my" ? "my" : "en";
  window.document.documentElement.dir = "ltr";
  window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT));
}

export function translate(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
) {
  let text = translations[language][key];

  if (!params) return text;

  for (const [name, value] of Object.entries(params)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }

  return text;
}

function translateRenderedText(value: string, language: Language) {
  if (language === "en") return value;

  let translated = value;
  for (const phrase of translationPhrases) {
    const replacement = documentTranslations[phrase];
    if (replacement) translated = translated.replaceAll(phrase, replacement);
  }
  for (const term of translationTerms) {
    const replacement = documentTermTranslations[term];
    if (!replacement) continue;
    translated = translated.replace(
      new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"),
      replacement,
    );
  }
  return translated;
}

function localizeTextNode(node: Text, language: Language) {
  if (!node.textContent?.trim()) return;
  if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.textContent);

  const original = originalTextNodes.get(node);
  if (original === undefined) return;
  const nextText = translateRenderedText(original, language);
  if (node.textContent !== nextText) node.textContent = nextText;
}

function localizeElementAttributes(element: Element, language: Language) {
  for (const attribute of localizableAttributes) {
    const currentValue = element.getAttribute(attribute);
    if (!currentValue?.trim()) continue;

    const attributeMap = originalAttributes.get(element) ?? new Map<string, string>();
    if (!attributeMap.has(attribute)) attributeMap.set(attribute, currentValue);
    originalAttributes.set(element, attributeMap);

    const original = attributeMap.get(attribute);
    if (original !== undefined) {
      const nextValue = translateRenderedText(original, language);
      if (element.getAttribute(attribute) !== nextValue) {
        element.setAttribute(attribute, nextValue);
      }
    }
  }
}

function localizeDocument(language: Language) {
  if (typeof document === "undefined") return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = walker.nextNode();
  while (current) {
    localizeTextNode(current as Text, language);
    current = walker.nextNode();
  }

  document.querySelectorAll("*").forEach((element) => localizeElementAttributes(element, language));
}

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, readLanguage, () => "en" as Language);

  useEffect(() => {
    document.documentElement.lang = language === "my" ? "my" : "en";
    document.documentElement.dir = "ltr";
  }, [language]);

  return {
    language,
    setLanguage,
    t: (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
  };
}

export function useDocumentLocalization(language: Language) {
  useEffect(() => {
    localizeDocument(language);

    const observer = new MutationObserver(() => localizeDocument(language));
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [...localizableAttributes],
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);
}
